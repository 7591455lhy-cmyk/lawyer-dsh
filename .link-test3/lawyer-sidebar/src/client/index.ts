/**
 * lawyer-sidebar 浏览器半：向布局壳的全局覆盖槽 shell.overlay（右侧固定
 * 悬浮层，root 作用域）注册“合同审核”页签；点击后把预设指令作为一轮
 * 用户输入注入当前会话（session.prompt(..., 'queue')，与内建 composer
 * 同款通道）。
 *
 * 导出纪律与 dsh 官方 Client 插件一致：具名导出 inject + apply，
 * 禁止 export default；跨插件协作走 cordis 服务而非直接 import。
 */
import type { ClientContext, SessionFace } from '@deepseek-ai/dsh-client-runtime/client'
// 类型副作用：把 ui-layout 声明的槽位键（shell.overlay）合并进 SlotMap。
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import { CONTRACT_REVIEW_PROMPT } from './prompt.ts'
import { LawyerSidebar } from './LawyerSidebar.tsx'

/** 依赖服务：槽注册表、会话服务、工作区服务（由 runtime 启动期提供）。 */
export const inject = ['slots', 'sessions', 'workspaces']

/** 样式标记（幂等注入 + 供 client HMR 认领清理）。 */
const STYLE_TAG = 'lawyer-sidebar/entry'

/** 入口样式：沿用 dsw 主题令牌，右侧固定边栏（选项卡列表）形态。 */
const ENTRY_CSS = `
.lawyer-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 200px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 10px;
  box-sizing: border-box;
  background: var(--dsw-alias-button-elevated-fill);
  border-left: 1px solid var(--dsw-alias-border-l2);
  box-shadow: -4px 0 16px rgb(0 0 0 / 6%);
  font-family: inherit;
}
.lawyer-sidebar__tab {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 42px;
  padding: 0 12px;
  border: none;
  border-radius: 10px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  font-family: inherit;
  transition: background-color 120ms ease;
}
.lawyer-sidebar__tab:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-sidebar__tab:not(:disabled):active {
  opacity: 0.85;
}
.lawyer-sidebar__tab:disabled {
  color: var(--dsw-alias-label-tertiary);
  cursor: not-allowed;
  opacity: 0.6;
}
.lawyer-sidebar__tab-icon {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
}
.lawyer-sidebar__tab-label {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
`

/** 幂等注入入口样式（Client 插件可操作 DOM；data-plugin 供 HMR 清理认领）。 */
function injectStyles(): void {
  const marker = `style[data-plugin-css="${STYLE_TAG}"]`
  if (document.querySelector(marker) !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'lawyer-sidebar'
  tag.dataset.pluginCss = STYLE_TAG
  tag.textContent = ENTRY_CSS
  document.head.appendChild(tag)
}

/** 等待新建会话成为当前会话的最长时间；超时视为无可会话工作区。 */
const NEW_SESSION_TIMEOUT_MS = 15_000

/**
 * 浏览器半 apply：注入样式，注册槽位占位。
 * @param ctx - 客户端根上下文。
 */
export function apply(ctx: ClientContext): void {
  injectStyles()

  /** 把预设指令排进目标会话的输入队列（失败仅记录，不打断 UI）。 */
  const sendPrompt = async (session: SessionFace): Promise<void> => {
    const result = await session.prompt([{ type: 'text', text: CONTRACT_REVIEW_PROMPT }], 'queue')
    if (!result.ok) {
      console.error(
        `[lawyer-sidebar] 注入合同审核指令失败：${result.error.code} ${result.error.message}`,
      )
    }
  }

  /** 点击回调：有当前会话则直接注入；否则新建会话后注入。 */
  const startContractReview = (): void => {
    const current = ctx.sessions.list.getSnapshot().current
    if (current !== undefined) {
      const session = ctx.sessions.binding(current)?.session
      if (session !== undefined) {
        void sendPrompt(session)
        return
      }
    }

    // 无当前会话：检查是否有可承载新会话的工作区。
    if (ctx.workspaces.list.getSnapshot().items.length === 0) {
      console.warn('[lawyer-sidebar] 暂无工作区，无法发起合同审核——请先创建工作区')
      return
    }

    // 在当前/最近工作区新建会话，待其成为当前会话后注入指令。
    let settled = false
    const unsubscribe = ctx.sessions.list.subscribe(() => {
      if (settled) return
      const id = ctx.sessions.list.getSnapshot().current
      if (id === undefined) return
      settled = true
      clearTimeout(timer)
      unsubscribe()
      const session = ctx.sessions.binding(id)?.session
      if (session !== undefined) void sendPrompt(session)
    })
    const timer = window.setTimeout(() => {
      if (settled) return
      settled = true
      unsubscribe()
      console.warn('[lawyer-sidebar] 新建会话超时，合同审核指令未注入')
    }, NEW_SESSION_TIMEOUT_MS)
    ctx.workspaces.startSession()
  }

  // 声明感知注册：不依赖本插件与 ui-layout 的相对加载顺序。
  // shell.overlay 是布局壳的全局覆盖槽（list、root 作用域）：容器
  // pointer-events: none、直接子元素恢复可点击，专供固定悬浮元素。
  ctx.slots.inject('shell.overlay', () => ctx.slots.register(
    {
      id: 'lawyer-sidebar',
      name: 'shell.overlay',
      inject: () => ({ startContractReview }),
    },
    LawyerSidebar,
  ))
}

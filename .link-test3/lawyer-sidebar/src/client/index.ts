/**
 * lawyer-sidebar 浏览器半：向布局壳的全局覆盖槽 shell.overlay（右侧固定
 * 悬浮层，root 作用域）注册功能页签（M3 起三个入口全可用）。
 *
 * 点击流程：弹出悬浮窗表单（见各 Dialog 组件）→ 提交后复用/新建一个空白
 * 会话 → 经 RPC 把会话切到 lawyer agent preset（blank 会话才允许切换；
 * lawyer preset 提供元典 MCP 工具）→ 注入含 /技能名 手势的入口指令 +
 * 图片附件（tool-skill 强制加载对应 SKILL.md 全文）。
 *
 * 导出纪律与 dsh 官方 Client 插件一致：具名导出 inject + apply，
 * 禁止 export default；跨插件协作走 cordis 服务而非直接 import。
 */
import type { ClientContext, SessionFace } from '@deepseek-ai/dsh-client-runtime/client'
// 类型副作用：把 ui-layout 声明的槽位键（shell.overlay）合并进 SlotMap。
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
// 类型副作用：把 api-remotes 声明的 ConnectionHandle（含 IApiClient 的
// agentPresets 命名空间）、PromptContentPart 与 FileReferenceCandidate
// （含 Context.remote 的 fileReferences 命名空间）合并进本模块的编译面。
import type {
  ConnectionHandle, FileReferenceCandidate, PromptContentPart, SkillEntry,
} from '@deepseek-ai/dsh-api-remotes/client'
import { buildContractReviewPrompt } from './prompt.ts'
import type { ContractReviewRequest } from './ContractReviewDialog.tsx'
import { buildCaseAnalysisPrompt } from './prompt.ts'
import type { CaseAnalysisRequest } from './CaseAnalysisDialog.tsx'
import { buildDocGenerationPrompt } from './prompt.ts'
import type { DocGenerationRequest } from './DocGenerationDialog.tsx'
import type { PickedImage } from './FilePicker.tsx'
import { LawyerSidebar } from './LawyerSidebar.tsx'

/** 依赖服务：槽注册表、会话、工作区、Host 连接（启动期提供）。 */
export const inject = ['slots', 'sessions', 'workspaces', 'connection']

/** 律师会话使用的 agent preset id（部署于 $DSH_HOME/.agent-presets/lawyer/）。 */
const LAWYER_PRESET = 'lawyer'

/** 样式标记（幂等注入 + 供 client HMR 认领清理）。 */
const STYLE_TAG = 'lawyer-sidebar/entry'

/** 入口样式：沿用 dsw 主题令牌；右侧固定边栏 + 悬浮窗表单。 */
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
.lawyer-dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  overflow-y: auto;
  background: rgb(0 0 0 / 45%);
  font-family: inherit;
}
.lawyer-dialog {
  width: min(560px, calc(100vw - 48px));
  max-height: calc(100vh - 64px);
  margin: 32px auto;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 20px 22px;
  border-radius: 14px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-button-elevated-fill);
  box-shadow: 0 18px 48px rgb(0 0 0 / 24%);
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
}
.lawyer-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.lawyer-dialog__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}
.lawyer-dialog__close {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, inherit);
  font-size: 14px;
  cursor: pointer;
}
.lawyer-dialog__close:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-dialog__label {
  display: block;
  margin: 14px 0 6px;
  font-weight: 500;
}
.lawyer-dialog__select,
.lawyer-dialog__input {
  width: 100%;
  box-sizing: border-box;
  height: 36px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-fill-normal, transparent);
  color: inherit;
  font-size: 14px;
  font-family: inherit;
}
.lawyer-dialog__select:focus,
.lawyer-dialog__input:focus {
  outline: none;
  border-color: var(--dsw-alias-brand-primary);
}
.lawyer-dialog__textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 72px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-fill-normal, transparent);
  color: inherit;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}
.lawyer-dialog__textarea:focus {
  outline: none;
  border-color: var(--dsw-alias-brand-primary);
}
.lawyer-dialog__file-zone {
  border: 1.5px dashed var(--dsw-alias-border-l2);
  border-radius: 10px;
  padding: 10px;
}
.lawyer-dialog__file-zone--active {
  border-color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-dialog__search-row {
  display: flex;
  gap: 8px;
}
.lawyer-dialog__search-input {
  flex: 1;
  min-width: 0;
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-fill-normal, transparent);
  color: inherit;
  font-size: 13px;
  font-family: inherit;
}
.lawyer-dialog__search-input:focus {
  outline: none;
  border-color: var(--dsw-alias-brand-primary);
}
.lawyer-dialog__browse {
  flex: none;
  height: 34px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
}
.lawyer-dialog__browse:not(:disabled):hover {
  opacity: 0.85;
}
.lawyer-dialog__candidates {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  max-height: 176px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.lawyer-dialog__candidate {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 5px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lawyer-dialog__candidate:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-dialog__candidate:disabled {
  cursor: default;
}
.lawyer-dialog__candidate--hint {
  color: var(--dsw-alias-label-tertiary);
  cursor: default;
}
.lawyer-dialog__candidate--hint:hover {
  background: transparent;
}
.lawyer-dialog__candidate--selected {
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-dialog__drop-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-dialog__files {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lawyer-dialog__file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-dialog__file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
}
.lawyer-dialog__file-remove {
  flex: none;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  cursor: pointer;
}
.lawyer-dialog__file-remove:not(:disabled):hover {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-border-l2);
}
.lawyer-dialog__notice {
  overflow-wrap: anywhere;
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-dialog__strictness {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lawyer-dialog__strictness-option {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  cursor: pointer;
}
.lawyer-dialog__strictness-option input {
  accent-color: var(--dsw-alias-button-primary-fill);
  margin-top: 2px;
}
.lawyer-dialog__strictness-name {
  display: block;
  font-weight: 500;
}
.lawyer-dialog__strictness-hint {
  display: block;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-dialog__advanced-toggle {
  display: block;
  width: 100%;
  margin-top: 14px;
  padding: 6px 0;
  border: none;
  border-top: 1px dashed var(--dsw-alias-border-l2);
  background: transparent;
  color: var(--dsw-alias-label-secondary, inherit);
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.lawyer-dialog__advanced-toggle:not(:disabled):hover {
  color: var(--dsw-alias-label-primary);
}
.lawyer-dialog__advanced {
  padding: 10px 0 4px;
}
.lawyer-dialog__skill-option {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
}
.lawyer-dialog__skill-option:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-dialog__skill-option input {
  accent-color: var(--dsw-alias-button-primary-fill);
  margin-top: 2px;
}
.lawyer-dialog__skill-category {
  display: inline-block;
  margin-right: 8px;
  padding: 0 6px;
  border-radius: 4px;
  background: var(--dsw-alias-interactive-bg-hover);
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-dialog__skill-name {
  display: inline-block;
  font-weight: 500;
  font-size: 13px;
}
.lawyer-dialog__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
.lawyer-dialog__cancel,
.lawyer-dialog__submit {
  height: 34px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
}
.lawyer-dialog__cancel {
  background: transparent;
  color: var(--dsw-alias-label-primary);
}
.lawyer-dialog__cancel:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-dialog__submit {
  background: var(--dsw-alias-button-primary-fill);
  color: var(--dsw-alias-brand-primary-invert, #fff);
  font-weight: 500;
}
.lawyer-dialog__submit:not(:disabled):hover {
  background: var(--dsw-alias-button-primary-hover);
}
.lawyer-dialog__cancel:disabled,
.lawyer-dialog__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
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

  const { api } = ctx.get('connection') as ConnectionHandle

  /**
   * 把（空白）会话切换到 lawyer preset（Host 仅允许 blank 会话切换）。
   * @returns 是否成功；失败仅记录，调用方据此中止注入。
   */
  const selectLawyerPreset = async (sessionId: string): Promise<boolean> => {
    try {
      const response = await api.agentPresets.select({ sessionId, agentPreset: LAWYER_PRESET })
      if (!response.result.ok) {
        console.error(
          `[lawyer-sidebar] 切换律师模式失败：${response.result.error.message}` +
            '（lawyer preset 需部署到 ~/.dsh/.agent-presets/lawyer/，运行 debug-web.cmd 可自动部署）',
        )
        return false
      }
      // 本地标签同步（Host 的 agent-preset/selected 转发事件也会到达，
      // note 幂等，双写无害）。
      ctx.sessions.noteAgentPreset(sessionId as never, response.result.value.agentPreset)
      return true
    } catch (error) {
      console.error(
        `[lawyer-sidebar] 切换律师模式请求异常：${
          error instanceof Error ? error.message : String(error)
        }`,
      )
      return false
    }
  }

  /** 把入口指令与图片附件排进目标会话的输入队列（失败仅记录）。 */
  const sendParts = async (session: SessionFace, parts: readonly PromptContentPart[]): Promise<void> => {
    const result = await session.prompt([...parts], 'queue')
    if (!result.ok) {
      console.error(
        `[lawyer-sidebar] 注入律师任务指令失败：${result.error.code} ${result.error.message}`,
      )
    }
  }

  /** 在指定会话发起律师任务：必要时先切律师模式，再注入指令与附件。 */
  const startTaskIn = async (sessionId: string, parts: readonly PromptContentPart[]): Promise<void> => {
    const summary = ctx.sessions.list.getSnapshot().byId[sessionId]
    if (summary === undefined || summary.agentPreset !== LAWYER_PRESET) {
      if (!await selectLawyerPreset(sessionId)) return
    }
    const session = ctx.sessions.binding(sessionId)?.session
    if (session === undefined) {
      console.warn('[lawyer-sidebar] 会话绑定不可用，律师任务指令未注入')
      return
    }
    await sendParts(session, parts)
  }

  /** 等待新建会话成为当前会话后继续注入。 */
  const runWhenSessionReady = (parts: readonly PromptContentPart[]): void => {
    let settled = false
    const unsubscribe = ctx.sessions.list.subscribe(() => {
      if (settled) return
      const id = ctx.sessions.list.getSnapshot().current
      if (id === undefined) return
      settled = true
      clearTimeout(timer)
      unsubscribe()
      void startTaskIn(id, parts)
    })
    const timer = window.setTimeout(() => {
      if (settled) return
      settled = true
      unsubscribe()
      console.warn('[lawyer-sidebar] 新建会话超时，律师任务指令未注入')
    }, NEW_SESSION_TIMEOUT_MS)
    ctx.workspaces.startSession()
  }

  /** 把指令文本与图片附件组装为 prompt parts（三入口通用）。 */
  const withImages = (text: string, images: readonly PickedImage[]): PromptContentPart[] => {
    const parts: PromptContentPart[] = [{ type: 'text', text }]
    for (const image of images) {
      parts.push({ type: 'image', mediaType: image.mediaType, data: image.data, name: image.name })
    }
    return parts
  }

  /** 通用注入：当前会话为空白则复用（切换到律师模式）；否则新建会话承载。 */
  const injectTask = (parts: readonly PromptContentPart[]): void => {
    const snapshot = ctx.sessions.list.getSnapshot()
    const current = snapshot.current
    if (current !== undefined) {
      const summary = snapshot.byId[current]
      if (summary !== undefined && summary.blank) {
        void startTaskIn(current, parts)
        return
      }
    }
    if (ctx.workspaces.list.getSnapshot().items.length === 0) {
      console.warn('[lawyer-sidebar] 暂无工作区，无法发起律师任务——请先创建工作区')
      return
    }
    runWhenSessionReady(parts)
  }

  /** 合同审核表单提交回调：组装指令与附件，复用/新建律师模式会话后注入。 */
  const submitContractReview = (request: ContractReviewRequest): void => {
    injectTask(withImages(buildContractReviewPrompt(request), request.images))
  }

  /** 案件分析表单提交回调：同上（/case-analysis 手势）。 */
  const submitCaseAnalysis = (request: CaseAnalysisRequest): void => {
    injectTask(withImages(buildCaseAnalysisPrompt(request), request.images))
  }

  /** 文书生成表单提交回调：同上（/doc-generation 手势）。 */
  const submitDocGeneration = (request: DocGenerationRequest): void => {
    injectTask(withImages(buildDocGenerationPrompt(request), request.images))
  }

  /**
   * 按 dsh fileReferences 索引搜索当前会话工作区文件（@ 引用同款数据源）。
   * 以当前会话的 cwd 为界（dsh 语义）；无当前会话或 Host 拒绝时返回 undefined。
   */
  const searchWorkspaceFiles = (
    query: string,
    signal: AbortSignal,
  ): Promise<readonly FileReferenceCandidate[] | undefined> => {
    const sessionId = ctx.sessions.list.getSnapshot().current
    if (sessionId === undefined) return Promise.resolve(undefined)
    // dsh 的 Remote 命名空间以独立 Cordis Service 键（'remote.<namespace>'）注册，
    // 不是 ctx.remote 的子属性；ui-reference 走 ctx.remote.fileReferences 是因为
    // 它的注入声明合并了 Context.remote 类型。运行时必须用 ctx.get 取。
    const fileReferences = ctx.get('remote.fileReferences') as
      | { list(sessionId: string, query: string, signal: AbortSignal): Promise<{ ok: boolean; value?: readonly FileReferenceCandidate[] }> }
      | undefined
    if (fileReferences === undefined) return Promise.resolve(undefined)
    return fileReferences.list(sessionId, query, signal).then(
      result => result.ok && result.value !== undefined ? result.value : undefined,
      () => undefined,
    )
  }

  /**
   * 列出当前会话可用的已安装技能目录（dsh skills RPC：含 disable-model-
   * invocation 的技能，modelInvocable=false 标注）。供表单"高级选项"下拉。
   * @returns 技能条目；无当前会话或 Host 拒绝时为 undefined。
   */
  const listInstalledSkills = (): Promise<readonly SkillEntry[] | undefined> => {
    const sessionId = ctx.sessions.list.getSnapshot().current
    if (sessionId === undefined) return Promise.resolve(undefined)
    return api.skills.list({ sessionId }).then(
      result => result.ok ? result.value.skills : undefined,
      () => undefined,
    )
  }

  /**
   * 把浏览器读到的文件内容（base64）上传进当前工作区（Host 侧 lawyerFiles
   * 服务写入 <工作区>/.lawyer-uploads/<fileName>），返回工作区内的绝对路径。
   * 浏览器沙箱拿不到拖入文件的真实路径——写入工作区后模型即可用文件读取
   * 工具读取，无需 Full access。
   * @returns 成功时为绝对路径；失败时为 Error（携带 Host 侧消息）。
   */
  const uploadWorkspaceFile = (
    fileName: string,
    contentBase64: string,
    signal: AbortSignal,
  ): Promise<string | Error> => {
    // 写入目录取当前工作区：优先当前会话所属工作区，退回第一个工作区。
    const sessions = ctx.sessions.list.getSnapshot()
    const currentSession = sessions.current !== undefined
      ? sessions.byId[sessions.current]
      : undefined
    const workspaces = ctx.workspaces.list.getSnapshot().items
    const workspace = workspaces.find(
      item => currentSession !== undefined && item.workspaceId === currentSession.workspaceId,
    ) ?? workspaces[0]
    if (workspace === undefined) return Promise.resolve(new Error('暂无工作区，无法上传合同文件'))

    const { rpc } = ctx.get('connection') as ConnectionHandle & {
      rpc: { call(channel: string, endpoint: string, payload: unknown, signal?: AbortSignal): Promise<{ ok: boolean; value?: unknown; error?: { message?: string } }> }
    }
    return rpc.call(
      '/api',
      'lawyerFiles/save',
      { args: { cwd: workspace.path, fileName, contentBase64 } },
      signal,
    ).then(
      result => {
        if (result.ok && typeof (result.value as { path?: unknown } | undefined)?.path === 'string') {
          return (result.value as { path: string }).path
        }
        const message = !result.ok && result.error !== undefined && typeof result.error.message === 'string'
          ? result.error.message
          : 'lawyerFiles/save 返回异常'
        return new Error(`上传失败：${message}（lawyer-tools 是否已更新到含上传服务的版本？）`)
      },
      error => new Error(`上传请求失败：${error instanceof Error ? error.message : String(error)}`),
    )
  }

  // 声明感知注册：不依赖本插件与 ui-layout 的相对加载顺序。
  // shell.overlay 是布局壳的全局覆盖槽（list、root 作用域）：容器
  // pointer-events: none、直接子元素恢复可点击，专供固定悬浮元素。
  ctx.slots.inject('shell.overlay', () => ctx.slots.register(
    {
      id: 'lawyer-sidebar',
      name: 'shell.overlay',
      inject: () => ({
        submitContractReview,
        submitCaseAnalysis,
        submitDocGeneration,
        searchWorkspaceFiles,
        uploadWorkspaceFile,
        listInstalledSkills,
      }),
    },
    LawyerSidebar,
  ))
}

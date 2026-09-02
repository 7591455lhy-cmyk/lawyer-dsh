/**
 * lawyer-wizard 浏览器半（M4 配置引导）：
 *   - 首次启动检测：lawyer-workbench 分节无 onboarded 标记 → 自动弹
 *     配置向导（三内置入口默认勾选 + 可添加自定义入口）；
 *   - 功能配置页（入口管理面板）：由 lawyer-sidebar 的“添加自定义功能”
 *     卡片经 window 事件 lawyer:open-entry-manager 唤起（M6 起右下角常驻
 *     按钮移除，两个 Client 插件同文档以 DOM 事件通信）；
 *   - 读写全走官方 settings 通道：ctx.settingsScope.bind（ui-settings
 *     提供的 Client 服务）→ set('entries' | 'onboarded') 经
 *     api.settings.mutate RPC 持久化到 $DSH_HOME/settings.yaml；外部
 *     编辑经 settings/document-updated 转发事件自动同步（含
 *     lawyer-sidebar 的动态渲染）。
 *
 * 导出纪律与 lawyer-sidebar 一致：具名导出 inject + apply，禁止
 * export default；跨插件协作走 cordis 服务（settingsScope）而非直接
 * import。
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
// 类型副作用：把 ui-layout 声明的槽位键（shell.overlay）合并进 SlotMap。
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
// 类型副作用：api-remotes 声明的 ConnectionHandle（含 IApiClient 的
// skills 命名空间）与 SkillEntry 合并进本模块的编译面。
import type { ConnectionHandle, SkillEntry } from '@deepseek-ai/dsh-api-remotes/client'
import type { LawyerConfig, LawyerEntry } from './config.ts'
import { createWizardStore } from './store.ts'
import { EntryManager } from './EntryManager.tsx'
import { WizardDialog } from './WizardDialog.tsx'
import { WizardRoot } from './WizardRoot.tsx'

/** 依赖服务：槽注册表（注册 shell.overlay 占位）、Host 连接（listInstalledSkills
 * 取当前会话）、会话列表；settingsScope 走 ctx.inject 动态注入（缺服务不阻塞 UI）。 */
export const inject = ['slots', 'sessions', 'connection']

/** 设置 namespace（与 lawyer-tools/src/index.ts 的常量一致）。 */
const LAWYER_SETTINGS_NAMESPACE = 'lawyer-workbench'

/**
 * settingsScope 服务的鸭子类型视图（真实声明在 dsh-client-ui-settings；
 * 本包 tsconfig 不指向它，运行时经 ctx.inject 按服务键注入——先例见
 * lawyer-sidebar 的 remote.fileReferences 注释）。
 */
interface SettingsScopeLike {
  getSnapshot(): {
    status: 'loading' | 'ready' | 'unavailable'
    value: LawyerConfig | undefined
  }
  subscribe(listener: () => void): () => void
  set(field: string, value: unknown): Promise<void>
}

/** 样式标记（幂等注入 + 供 client HMR 认领清理）。 */
const STYLE_TAG = 'lawyer-wizard/entry'

/** 入口样式：沿用 dsw 主题令牌；向导/管理面板悬浮窗（触发按钮已移除，M6）。 */
const ENTRY_CSS = `
.lawyer-wizard__mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  overflow-y: auto;
  background: rgb(0 0 0 / 45%);
  font-family: inherit;
}
.lawyer-wizard__dialog {
  width: min(600px, calc(100vw - 48px));
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
.lawyer-wizard__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}
.lawyer-wizard__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}
.lawyer-wizard__subtitle {
  margin: 0 0 14px;
  font-size: 13px;
  color: var(--dsw-alias-label-secondary, inherit);
}
.lawyer-wizard__close {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, inherit);
  font-size: 14px;
  cursor: pointer;
}
.lawyer-wizard__close:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-wizard__label {
  display: block;
  margin: 14px 0 6px;
  font-weight: 500;
}
.lawyer-wizard__input,
.lawyer-wizard__select {
  width: 100%;
  box-sizing: border-box;
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-fill-normal, transparent);
  color: inherit;
  font-size: 14px;
  font-family: inherit;
}
.lawyer-wizard__input:focus,
.lawyer-wizard__select:focus {
  outline: none;
  border-color: var(--dsw-alias-brand-primary);
}
.lawyer-wizard__input::placeholder {
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-wizard__hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-wizard__error {
  overflow-wrap: anywhere;
  margin: 8px 0 0;
  font-size: 12px;
  color: #e5484d;
}
.lawyer-wizard__check {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  cursor: pointer;
}
.lawyer-wizard__check + .lawyer-wizard__check {
  margin-top: 8px;
}
.lawyer-wizard__check input {
  accent-color: var(--dsw-alias-button-primary-fill);
  margin-top: 2px;
}
.lawyer-wizard__check-name {
  display: block;
  font-weight: 500;
}
.lawyer-wizard__check-hint {
  display: block;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-wizard__rows {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lawyer-wizard__row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  border: 1px solid var(--dsw-alias-border-l2);
}
.lawyer-wizard__row-index {
  flex: none;
  width: 20px;
  text-align: center;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-wizard__row-main {
  flex: 1;
  min-width: 0;
}
.lawyer-wizard__row-name {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
  font-size: 13px;
}
.lawyer-wizard__row-sub {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-wizard__badge {
  flex: none;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--dsw-alias-interactive-bg-hover);
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-wizard__row-actions {
  flex: none;
  display: inline-flex;
  gap: 2px;
}
.lawyer-wizard__row-btn {
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, inherit);
  font-size: 13px;
  cursor: pointer;
}
.lawyer-wizard__row-btn:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.lawyer-wizard__row-btn:disabled {
  opacity: 0.35;
  cursor: default;
}
.lawyer-wizard__row-btn--danger:not(:disabled):hover {
  color: #e5484d;
}
.lawyer-wizard__add {
  margin-top: 12px;
  padding: 12px;
  border: 1.5px dashed var(--dsw-alias-border-l2);
  border-radius: 10px;
}
.lawyer-wizard__add-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.lawyer-wizard__add-grid .lawyer-wizard__select,
.lawyer-wizard__add-grid .lawyer-wizard__input {
  height: 32px;
  font-size: 13px;
}
.lawyer-wizard__add-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}
.lawyer-wizard__steps {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-wizard__step {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.lawyer-wizard__step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--dsw-alias-interactive-bg-hover);
  font-size: 11px;
}
.lawyer-wizard__step--active {
  color: var(--dsw-alias-label-primary);
  font-weight: 500;
}
.lawyer-wizard__step--active .lawyer-wizard__step-num {
  background: var(--dsw-alias-button-primary-fill);
  color: var(--dsw-alias-label-primary-foreground, #fff);
}
.lawyer-wizard__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
.lawyer-wizard__cancel,
.lawyer-wizard__submit {
  height: 34px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
}
.lawyer-wizard__cancel {
  background: transparent;
  color: var(--dsw-alias-label-primary);
}
.lawyer-wizard__cancel:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-wizard__submit {
  background: var(--dsw-alias-button-primary-fill);
  color: var(--dsw-alias-label-primary-foreground, #fff);
  font-weight: 500;
}
.lawyer-wizard__submit:not(:disabled):hover {
  background: var(--dsw-alias-button-primary-hover);
}
.lawyer-wizard__cancel:disabled,
.lawyer-wizard__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
/* ── 自定义功能完整配置表单（CustomEntryForm / EntryManager M6+）────── */
.lawyer-wizard__form {
  display: flex;
  flex-direction: column;
}
.lawyer-wizard__section-title {
  margin: 22px 0 4px;
  padding-top: 14px;
  border-top: 1px dashed var(--dsw-alias-border-l2);
  font-size: 14px;
  font-weight: 600;
}
.lawyer-wizard__textarea {
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
.lawyer-wizard__textarea:focus {
  outline: none;
  border-color: var(--dsw-alias-brand-primary);
}
.lawyer-wizard__files {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lawyer-wizard__file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-wizard__file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
}
.lawyer-wizard__file-remove {
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
.lawyer-wizard__file-remove:not(:disabled):hover {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-border-l2);
}
.lawyer-wizard__manager-actions {
  margin-top: 16px;
}
.lawyer-wizard__builtin-restore {
  margin-top: 14px;
}
.lawyer-wizard__builtin-restore .lawyer-wizard__label {
  margin: 0 0 6px;
}
.lawyer-wizard__builtin-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.lawyer-wizard__builtin-btn {
  width: auto;
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
}
.lawyer-wizard__builtin-btn:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
/* ── M8：自定义功能配置表单（模板 + 字段编辑器 + 法律事项）────────── */
.lawyer-wizard__grid2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.lawyer-wizard__grid2 .lawyer-wizard__label {
  margin-top: 10px;
}
.lawyer-wizard__input--sm {
  height: 30px;
  font-size: 13px;
}
.lawyer-wizard__textarea--tall {
  min-height: 120px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  line-height: 1.6;
}
.lawyer-wizard__textarea--sm {
  min-height: 56px;
  font-size: 13px;
}
.lawyer-wizard__fields-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-top: 14px;
}
.lawyer-wizard__fields-head .lawyer-wizard__label {
  margin: 0;
}
.lawyer-wizard__mini-btn {
  flex: none;
  height: 28px;
  padding: 0 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 7px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
}
.lawyer-wizard__mini-btn:hover {
  border-color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-wizard__field {
  margin-top: 10px;
  padding: 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, transparent);
}
.lawyer-wizard__field-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.lawyer-wizard__field-index {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--dsw-alias-interactive-bg-hover);
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-wizard__field-actions {
  flex: none;
  display: inline-flex;
  gap: 2px;
}
.lawyer-wizard__field-label {
  display: block;
  margin: 8px 0 4px;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-wizard__inline {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 8px;
}
.lawyer-wizard__inline .lawyer-wizard__input--sm {
  flex: 1;
  min-width: 0;
}
.lawyer-wizard__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 6px;
}
.lawyer-wizard__chip {
  padding: 4px 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, inherit);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
}
.lawyer-wizard__chip:hover {
  border-color: var(--dsw-alias-brand-primary);
  color: var(--dsw-alias-label-primary);
}
.lawyer-wizard__chip--on {
  border-color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.lawyer-wizard__switch {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-top: 8px;
  font-size: 13px;
  cursor: pointer;
}
.lawyer-wizard__switch input {
  accent-color: var(--dsw-alias-button-primary-fill);
  margin-top: 2px;
}
`

/** 幂等注入入口样式（Client 插件可操作 DOM；data-plugin 供 HMR 清理认领）。 */
function injectStyles(): void {
  const marker = `style[data-plugin-css="${STYLE_TAG}"]`
  if (document.querySelector(marker) !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'lawyer-wizard'
  tag.dataset.pluginCss = STYLE_TAG
  tag.textContent = ENTRY_CSS
  document.head.appendChild(tag)
}

/**
 * 浏览器半 apply：注入样式、接入 settings 通道、注册槽位。
 * @param ctx - 客户端根上下文。
 */
export function apply(ctx: ClientContext): void {
  injectStyles()

  const { api } = ctx.get('connection') as ConnectionHandle
  const store = createWizardStore()

  /** settings 通道（ui-settings 就绪后接入；缺席时 UI 维持 boot 态）。 */
  let scope: SettingsScopeLike | undefined

  /**
   * 列出当前会话可用的已安装技能目录（向导/管理面板的技能下拉数据源；
   * 无当前会话或 Host 拒绝时为 undefined → 表单退化为手输）。
   */
  const listInstalledSkills = (): Promise<readonly SkillEntry[] | undefined> => {
    const sessionId = ctx.sessions.list.getSnapshot().current
    if (sessionId === undefined) return Promise.resolve(undefined)
    return api.skills.list({ sessionId }).then(
      result => result.ok ? result.value.skills : undefined,
      () => undefined,
    )
  }

  // 首启向导只在“首次观测到已就绪且未完成”时自动弹出一次。
  let wizardOffered = false

  // 声明感知注册：shell.overlay 是布局壳的全局覆盖槽（list、root 作用域），
  // 与 lawyer-sidebar 的注册共存（两个独立 overlay 子元素）。
  ctx.slots.inject('shell.overlay', () => ctx.slots.register(
    {
      id: 'lawyer-wizard',
      name: 'shell.overlay',
      inject: () => ({
        store,
        /** 保存入口列表（整体替换 entries 字段；数组语义即整体替换）。 */
        persistEntries: async (entries: readonly LawyerEntry[]): Promise<boolean> => {
          if (scope === undefined) return false
          try {
            await scope.set('entries', entries)
            return true
          } catch {
            return false
          }
        },
        /** 标记首启向导完成（onboarded 置 true）。 */
        persistOnboarded: async (): Promise<boolean> => {
          if (scope === undefined) return false
          try {
            await scope.set('onboarded', true)
            return true
          } catch {
            return false
          }
        },
        listInstalledSkills,
      }),
    },
    WizardRoot,
  ))

  // 接入 settings 通道（ui-settings 服务可用即回调；settingsScope 由官方
  // SettingsScopeBinder 实现：bind 在调用方 fiber 上挂 effect，subscribe
  // 收 mirror 推送的快照替换——外部编辑与其它插件的写入都会到达）。
  ctx.inject(['settingsScope'], (scopeCtx: ClientContext) => {
    const bound = (scopeCtx as { settingsScope?: { bind(spec: { namespace: string }): unknown } })
      .settingsScope?.bind({ namespace: LAWYER_SETTINGS_NAMESPACE }) as SettingsScopeLike | undefined
    if (bound === undefined) return
    scope = bound

    const update = (): void => {
      const snapshot = scope!.getSnapshot()
      store.setState({
        phase: snapshot.status,
        value: snapshot.status === 'ready' ? snapshot.value : undefined,
      })
      if (!wizardOffered && snapshot.status === 'ready' && snapshot.value?.onboarded !== true) {
        wizardOffered = true
        store.setState({ showWizard: true })
      }
    }
    scope.subscribe(update)
    update()
  })
}

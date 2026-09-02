/**
 * lawyer-wizard 的外部快照 store（React useSyncExternalStore 兼容）。
 *
 * 官方 SettingsScope 只在 ui-settings 服务就绪后才能 bind；本 store 让
 * shell.overlay 槽位组件先上（右下角按钮随布局就绪出现），scope 接入后
 * 经 setState 推动重渲染。快照为不可变值，浅比较稳定引用。
 */
import type { LawyerConfig } from './config.ts'

/** 配置通道状态。 */
export type WizardPhase = 'boot' | 'loading' | 'ready' | 'unavailable'

/** store 快照（整体替换，字段只读）。 */
export interface WizardSnapshot {
  /** boot=scope 未接入；loading=首次拉取中；ready=可读写；unavailable=namespace 未注册/远程连接。 */
  readonly phase: WizardPhase
  /** 解析后的分节值（仅 phase==='ready'；其余 undefined）。 */
  readonly value: LawyerConfig | undefined
  /** 首启向导是否显示（ready 且 user 层无 onboarded 标记时自动置位；完成/跳过后复位）。 */
  readonly showWizard: boolean
  /** 入口管理面板是否打开。 */
  readonly managerOpen: boolean
}

/** 初始快照。 */
const INITIAL: WizardSnapshot = { phase: 'boot', value: undefined, showWizard: false, managerOpen: false }

/** 轻量快照 store 实例面（getSnapshot / subscribe / setState）。 */
export interface WizardStore {
  /** 当前快照（引用稳定直到下一次 setState）。 */
  getSnapshot(): WizardSnapshot
  /** 订阅快照替换。 */
  subscribe(listener: () => void): () => void
  /** 合并更新快照并通知。 */
  setState(patch: Partial<WizardSnapshot>): void
}

/** 轻量快照 store：getSnapshot / subscribe / setState(partial)。 */
export function createWizardStore(): WizardStore {
  let snapshot: WizardSnapshot = INITIAL
  const listeners = new Set<() => void>()
  return {
    /** 当前快照（引用稳定直到下一次 setState）。 */
    getSnapshot(): WizardSnapshot {
      return snapshot
    },
    /** 订阅快照替换。 */
    subscribe(listener: () => void): () => void {
      listeners.add(listener)
      return () => { listeners.delete(listener) }
    },
    /** 合并更新快照并通知（值未变时跳过通知）。 */
    setState(patch: Partial<WizardSnapshot>): void {
      const next = { ...snapshot, ...patch }
      if (next === snapshot) return
      snapshot = next
      for (const listener of listeners) listener()
    },
  }
}

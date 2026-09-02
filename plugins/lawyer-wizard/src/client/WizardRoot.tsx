/**
 * wizard 的 shell.overlay 根组件：首启向导 + 入口管理面板的编排层。
 * 数据经注入 face（store + 持久化回调）到达，不直接触碰 settings 通道。
 *
 * M6 起右下角常驻“功能配置”按钮移除：lawyer-sidebar 的“添加自定义功能”
 * 卡片经 window 事件（lawyer:open-entry-manager，两个 Client 插件同文档
 * 通信——无共享服务的场景下 DOM 事件即浏览器内的事件总线）唤起管理面板；
 * 首启向导仍由 settings 快照自动弹出。
 */
import { useEffect, useSyncExternalStore } from 'react'
import type { SkillEntry } from '@deepseek-ai/dsh-api-remotes/client'
import type { LawyerEntry } from './config.ts'
import type { WizardStore } from './store.ts'
import { EntryManager } from './EntryManager.tsx'
import { WizardDialog } from './WizardDialog.tsx'

/** 与 lawyer-sidebar 的 OPEN_ENTRY_MANAGER_EVENT 常量保持同值（跨插件不直接 import）。 */
const OPEN_ENTRY_MANAGER_EVENT = 'lawyer:open-entry-manager'

/** 注册 inject 工厂注入的业务回调（见 client/index.ts）。 */
export interface WizardRootInjected {
  /** 外部快照 store（配置通道状态 + 向导/面板开关）。 */
  readonly store: WizardStore
  /** 保存入口列表；返回是否成功（通道不可用或写入被拒时 false）。 */
  readonly persistEntries: (entries: readonly LawyerEntry[]) => Promise<boolean>
  /** 标记首启向导完成；返回是否成功。 */
  readonly persistOnboarded: () => Promise<boolean>
  /** 列出当前会话可用的已安装技能目录（可能 undefined → 手输）。 */
  readonly listInstalledSkills: () => Promise<readonly SkillEntry[] | undefined>
}

export type WizardRootProps = WizardRootInjected

/** shell.overlay 占位组件：向导 + 管理面板（互斥展示，均由 store / 事件驱动）。 */
export function WizardRoot({
  store,
  persistEntries,
  persistOnboarded,
  listInstalledSkills,
}: WizardRootProps) {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot)

  // lawyer-sidebar 的“添加自定义功能”卡片 → 功能配置页（入口管理面板）。
  useEffect(() => {
    const openManager = (): void => { store.setState({ managerOpen: true }) }
    window.addEventListener(OPEN_ENTRY_MANAGER_EVENT, openManager)
    return () => { window.removeEventListener(OPEN_ENTRY_MANAGER_EVENT, openManager) }
  }, [store])

  return (
    <>
      {snapshot.showWizard && (
        <WizardDialog
          initialEntries={snapshot.value?.entries ?? []}
          listInstalledSkills={listInstalledSkills}
          onSkip={async () => {
            // 跳过：保持当前配置不动，仅标记向导完成（不再自动打扰）。
            store.setState({ showWizard: false })
            await persistOnboarded()
          }}
          onDone={async entries => {
            store.setState({ showWizard: false })
            // 先写标记再写入口（scope 内部按序串行提交）。
            await persistOnboarded()
            await persistEntries(entries)
          }}
        />
      )}
      {snapshot.managerOpen && (
        <EntryManager
          entries={snapshot.value?.entries ?? []}
          listInstalledSkills={listInstalledSkills}
          onClose={() => { store.setState({ managerOpen: false }) }}
          onSave={async entries => {
            const ok = await persistEntries(entries)
            if (ok) store.setState({ managerOpen: false })
            return ok
          }}
        />
      )}
    </>
  )
}

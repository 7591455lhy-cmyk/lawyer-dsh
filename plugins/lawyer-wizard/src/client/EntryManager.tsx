/**
 * 功能配置页（入口管理面板）：
 *   - 列表视图：查看 / 删除 / 重排当前入口，补回被删的内置入口；
 *   - 表单视图：新建/编辑自定义功能（完整配置：功能定位 + 技能配置 +
 *     MCP 配置，见 CustomEntryForm），填完直接形成新功能；
 * 面板维护本地草稿（打开时从当前生效配置复制），保存时一次性整体提交
 * （settings 通道的数组语义即整体替换）。
 */
import { useState } from 'react'
import type { SkillEntry } from '@deepseek-ai/dsh-api-remotes/client'
import {
  BUILTIN_ENTRY_IDS,
  BUILTIN_ENTRY_META,
  type BuiltinEntryId,
  type CustomLawyerEntry,
  type LawyerEntry,
} from './config.ts'
import { CustomEntryForm } from './CustomEntryForm.tsx'

/** 自定义入口的一行摘要（技能手势 / 表单字段数 / 法律领域 / 说明）。 */
function describeCustom(row: CustomLawyerEntry): string {
  const parts = [`/${row.skill}`]
  if (row.extraSkills !== undefined && row.extraSkills.length > 0) parts.push(`+${row.extraSkills.length} 技能`)
  if (row.fields !== undefined && row.fields.length > 0) parts.push(`${row.fields.length} 字段`)
  if (row.legal !== undefined) parts.push(`法律 · ${row.legal.domain}`)
  if (row.mcp !== undefined) parts.push('MCP')
  const summary = parts.join(' · ')
  return row.description === undefined ? summary : `${summary} — ${row.description}`
}

/** 面板视图：入口列表 ↔ 自定义功能表单（新建/编辑）。 */
type ManagerView =
  | { readonly kind: 'list' }
  | { readonly kind: 'create' }
  | { readonly kind: 'edit'; readonly entryId: string }

/** 管理面板 props。 */
export interface EntryManagerProps {
  /** 当前生效的入口列表（规范化后）。 */
  readonly entries: readonly LawyerEntry[]
  /** 已安装技能目录（可能 undefined → 手输）。 */
  readonly listInstalledSkills: () => Promise<readonly SkillEntry[] | undefined>
  /** 关闭面板（不保存）。 */
  readonly onClose: () => void
  /** 保存草稿；返回是否成功（成功后调用方负责关闭）。 */
  readonly onSave: (entries: readonly LawyerEntry[]) => Promise<boolean>
}

/** 入口管理悬浮窗。 */
export function EntryManager({ entries, listInstalledSkills, onClose, onSave }: EntryManagerProps) {
  const [rows, setRows] = useState<readonly LawyerEntry[]>(() => [...entries])
  const [view, setView] = useState<ManagerView>({ kind: 'list' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  /** 当前不在列表中的内置入口（补回用）。 */
  const missingBuiltins = BUILTIN_ENTRY_IDS.filter(id => !rows.some(row => row.kind === 'builtin' && row.id === id))

  /** 行重排：与相邻行交换。 */
  const move = (index: number, delta: -1 | 1): void => {
    setRows(previous => {
      const next = [...previous]
      const target = index + delta
      if (target < 0 || target >= next.length) return previous
      const [row] = next.splice(index, 1)
      next.splice(target, 0, row)
      return next
    })
  }

  const remove = (index: number): void => {
    setRows(previous => previous.filter((_, i) => i !== index))
  }

  /** 表单提交：新建 → 追加一行；编辑 → 原位替换。 */
  const upsertEntry = (draft: CustomLawyerEntry): void => {
    setRows(previous => {
      const index = previous.findIndex(row => row.id === draft.id)
      if (index === -1) return [...previous, draft]
      const next = [...previous]
      next[index] = draft
      return next
    })
    setView({ kind: 'list' })
    setError('')
  }

  const save = (): void => {
    setBusy(true)
    void onSave(rows).then(ok => {
      setBusy(false)
      if (!ok) setError('保存失败：设置通道不可用或写入被拒，请稍后重试')
    })
  }

  // ── 表单视图（新建/编辑自定义功能）────────────────────────────────────
  if (view.kind !== 'list') {
    const editing = view.kind === 'edit'
      ? rows.find(row => row.id === view.entryId) as CustomLawyerEntry | undefined
      : undefined
    if (view.kind === 'edit' && editing === undefined) {
      // 目标行已被删除（并发编辑防御）：回列表视图。
      setView({ kind: 'list' })
      return null
    }
    return (
      <div className="lawyer-wizard__mask" role="dialog" aria-modal="true" aria-label={view.kind === 'create' ? '新建自定义功能' : '编辑自定义功能'}>
        <div className="lawyer-wizard__dialog">
          <div className="lawyer-wizard__header">
            <h2 className="lawyer-wizard__title">{view.kind === 'create' ? '新建自定义功能' : `编辑：${editing!.label}`}</h2>
            <button type="button" className="lawyer-wizard__close" title="返回列表（不保存本次表单改动）" onClick={() => { setView({ kind: 'list' }) }}>✕</button>
          </div>
          <p className="lawyer-wizard__subtitle">
            按「入口即配置」的形态定义功能：卡片展示 → 提示词模板 + 发起表单（六种字段）→ 技能手势 →
            法律事项绑定（claude-for-legal-ZH 领域与三层调用规程）。创建后出现在右侧功能栏，点击即发起专属会话。
          </p>
          <CustomEntryForm
            entry={editing}
            listInstalledSkills={listInstalledSkills}
            onSubmit={upsertEntry}
            onCancel={() => { setView({ kind: 'list' }) }}
            submitLabel={view.kind === 'create' ? '创建功能' : '保存修改'}
          />
        </div>
      </div>
    )
  }

  // ── 列表视图 ─────────────────────────────────────────────────────────
  return (
    <div className="lawyer-wizard__mask" role="dialog" aria-modal="true" aria-label="功能入口配置">
      <div className="lawyer-wizard__dialog">
        <div className="lawyer-wizard__header">
          <h2 className="lawyer-wizard__title">功能入口配置</h2>
          <button type="button" className="lawyer-wizard__close" title="关闭" onClick={onClose}>✕</button>
        </div>
        <p className="lawyer-wizard__subtitle">
          调整右侧功能栏的入口与顺序（保存后立即生效，同步写入 $DSH_HOME/settings.yaml）。
        </p>
        {rows.length === 0 && <p className="lawyer-wizard__hint">暂无功能入口，请在下方添加。</p>}
        {rows.length > 0 && (
          <ul className="lawyer-wizard__rows">
            {rows.map((row, index) => (
              <li key={row.id} className="lawyer-wizard__row">
                <span className="lawyer-wizard__row-index">{index + 1}</span>
                <span className="lawyer-wizard__row-main">
                  <span className="lawyer-wizard__row-name">
                    {row.kind === 'builtin' ? BUILTIN_ENTRY_META[row.id].label : row.label}
                  </span>
                  <span className="lawyer-wizard__row-sub">
                    {row.kind === 'builtin' ? '内置功能' : describeCustom(row)}
                  </span>
                </span>
                <span className="lawyer-wizard__badge">{row.kind === 'builtin' ? '内置' : '自定义'}</span>
                <span className="lawyer-wizard__row-actions">
                  {row.kind === 'custom' && (
                    <button type="button" className="lawyer-wizard__row-btn" title="编辑" onClick={() => { setView({ kind: 'edit', entryId: row.id }) }}>✎</button>
                  )}
                  <button type="button" className="lawyer-wizard__row-btn" title="上移" disabled={index === 0} onClick={() => { move(index, -1) }}>↑</button>
                  <button type="button" className="lawyer-wizard__row-btn" title="下移" disabled={index === rows.length - 1} onClick={() => { move(index, 1) }}>↓</button>
                  <button type="button" className="lawyer-wizard__row-btn lawyer-wizard__row-btn--danger" title="删除" onClick={() => { remove(index) }}>✕</button>
                </span>
              </li>
            ))}
          </ul>
        )}
        {error !== '' && <p className="lawyer-wizard__error">{error}</p>}
        <div className="lawyer-wizard__manager-actions">
          <button type="button" className="lawyer-wizard__submit" onClick={() => { setView({ kind: 'create' }) }}>
            ＋ 新建自定义功能
          </button>
          {missingBuiltins.length > 0 && (
            <div className="lawyer-wizard__builtin-restore">
              <span className="lawyer-wizard__label">恢复内置入口</span>
              <div className="lawyer-wizard__builtin-buttons">
                {missingBuiltins.map(id => (
                  <button
                    key={id}
                    type="button"
                    className="lawyer-wizard__row-btn lawyer-wizard__builtin-btn"
                    onClick={() => { setRows(previous => [...previous, { kind: 'builtin', id }]) }}
                  >
                    {BUILTIN_ENTRY_META[id].label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="lawyer-wizard__actions">
          <button type="button" className="lawyer-wizard__cancel" disabled={busy} onClick={onClose}>
            取消
          </button>
          <button type="button" className="lawyer-wizard__submit" disabled={busy} onClick={save}>
            {busy ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}

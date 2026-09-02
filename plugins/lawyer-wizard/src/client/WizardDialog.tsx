/**
 * 首启配置向导（两步）：
 *   第 1 步：勾选要启用的内置入口（合同审核 / 案件分析 / 文书生成，
 *            默认全选——即默认配置下 M1~M3 行为零回归）；
 *   第 2 步：可选添加自定义入口（起名 + 绑定技能 + 说明，可多个）。
 * 完成 → onDone(应用选择并标记 onboarded)；跳过 → onSkip(保持现状
 * 仅标记 onboarded)。写失败不阻塞关闭（通道 recover 后下次打开管理
 * 面板可补救）。
 */
import { useMemo, useState } from 'react'
import type { SkillEntry } from '@deepseek-ai/dsh-api-remotes/client'
import { BUILTIN_ENTRY_IDS, BUILTIN_ENTRY_META, generateCustomEntryId, type LawyerEntry } from './config.ts'
import { SkillField } from './SkillField.tsx'

/** 自定义入口草稿行。 */
interface CustomDraft {
  readonly key: number
  label: string
  skill: string
  description: string
}

/** 向导 props。 */
export interface WizardDialogProps {
  /** 当前已启用的入口（决定三内置的初始勾选）。 */
  readonly initialEntries: readonly LawyerEntry[]
  /** 已安装技能目录（可能 undefined → 手输）。 */
  readonly listInstalledSkills: () => Promise<readonly SkillEntry[] | undefined>
  /** 应用选择并标记完成。 */
  readonly onDone: (entries: readonly LawyerEntry[]) => void | Promise<void>
  /** 保持现状仅标记完成。 */
  readonly onSkip: () => void | Promise<void>
}

/** 首启向导悬浮窗。 */
export function WizardDialog({ initialEntries, listInstalledSkills, onDone, onSkip }: WizardDialogProps) {
  const [step, setStep] = useState<1 | 2>(1)
  const enabledBuiltin = useMemo(
    () => new Set(initialEntries.filter(entry => entry.kind === 'builtin').map(entry => entry.id)),
    [initialEntries],
  )
  const [checked, setChecked] = useState<ReadonlySet<string>>(enabledBuiltin)
  const [drafts, setDrafts] = useState<readonly CustomDraft[]>([])
  const [draftKey, setDraftKey] = useState(0)
  const [label, setLabel] = useState('')
  const [skill, setSkill] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const toggle = (id: string): void => {
    setChecked(previous => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  /** 校验并追加一条自定义入口草稿。 */
  const addDraft = (): void => {
    const trimmedLabel = label.trim()
    const trimmedSkill = skill.trim().toLowerCase().replace(/\s+/g, '-')
    if (trimmedLabel === '') {
      setError('请填写入口名称')
      return
    }
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmedSkill)) {
      setError('技能名需为小写 kebab-case（如 due-diligence），可在左侧对话里输入 / 查看可用技能')
      return
    }
    setError('')
    setDrafts(previous => [...previous, { key: draftKey, label: trimmedLabel, skill: trimmedSkill, description: description.trim() }])
    setDraftKey(previous => previous + 1)
    setLabel('')
    setSkill('')
    setDescription('')
  }

  /** 应用两步选择，产出入口列表。 */
  const finish = (): void => {
    setBusy(true)
    const entries: LawyerEntry[] = []
    for (const id of BUILTIN_ENTRY_IDS) {
      if (checked.has(id)) entries.push({ kind: 'builtin', id })
    }
    for (const draft of drafts) {
      entries.push({
        kind: 'custom',
        id: generateCustomEntryId(),
        label: draft.label,
        skill: draft.skill,
        ...draft.description === '' ? {} : { description: draft.description },
      })
    }
    void Promise.resolve(onDone(entries)).finally(() => { setBusy(false) })
  }

  return (
    <div className="lawyer-wizard__mask" role="dialog" aria-modal="true" aria-label="律师工作台配置向导">
      <div className="lawyer-wizard__dialog">
        <div className="lawyer-wizard__header">
          <h2 className="lawyer-wizard__title">欢迎使用律师工作台</h2>
        </div>
        <p className="lawyer-wizard__subtitle">
          先选择需要展示的功能入口；之后随时可从右下角“功能配置”按钮新增自定义入口（绑定技能）、删除或排序。
        </p>
        {step === 1 && (
          <>
            <div className="lawyer-wizard__steps">
              <span className="lawyer-wizard__step lawyer-wizard__step--active"><span className="lawyer-wizard__step-num">1</span>选择功能入口</span>
              <span>·</span>
              <span className="lawyer-wizard__step"><span className="lawyer-wizard__step-num">2</span>自定义入口（可选）</span>
            </div>
            {BUILTIN_ENTRY_IDS.map(id => (
              <label key={id} className="lawyer-wizard__check">
                <input
                  type="checkbox"
                  checked={checked.has(id)}
                  onChange={() => { toggle(id) }}
                />
                <span>
                  <span className="lawyer-wizard__check-name">{BUILTIN_ENTRY_META[id].label}</span>
                  <span className="lawyer-wizard__check-hint">{BUILTIN_ENTRY_META[id].description}</span>
                </span>
              </label>
            ))}
            <div className="lawyer-wizard__actions">
              <button type="button" className="lawyer-wizard__cancel" disabled={busy} onClick={() => { void onSkip() }}>
                跳过（保持默认）
              </button>
              <button type="button" className="lawyer-wizard__submit" onClick={() => { setStep(2) }}>
                下一步
              </button>
            </div>
          </>
        )}
        {step === 2 && (
          <>
            <div className="lawyer-wizard__steps">
              <span className="lawyer-wizard__step"><span className="lawyer-wizard__step-num">1</span>选择功能入口</span>
              <span>·</span>
              <span className="lawyer-wizard__step lawyer-wizard__step--active"><span className="lawyer-wizard__step-num">2</span>自定义入口（可选）</span>
            </div>
            {drafts.length > 0 && (
              <ul className="lawyer-wizard__rows">
                {drafts.map(draft => (
                  <li key={draft.key} className="lawyer-wizard__row">
                    <span className="lawyer-wizard__badge">自定义</span>
                    <span className="lawyer-wizard__row-main">
                      <span className="lawyer-wizard__row-name">{draft.label}</span>
                      <span className="lawyer-wizard__row-sub">/{draft.skill}</span>
                    </span>
                    <span className="lawyer-wizard__row-actions">
                      <button
                        type="button"
                        className="lawyer-wizard__row-btn lawyer-wizard__row-btn--danger"
                        title="移除"
                        onClick={() => { setDrafts(previous => previous.filter(item => item.key !== draft.key)) }}
                      >
                        ✕
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="lawyer-wizard__add">
              <div className="lawyer-wizard__add-grid">
                <input
                  className="lawyer-wizard__input"
                  type="text"
                  placeholder="入口名称，如 尽职调查"
                  value={label}
                  onChange={event => { setLabel(event.target.value) }}
                />
                <SkillField value={skill} onChange={setSkill} listInstalledSkills={listInstalledSkills} />
                <input
                  className="lawyer-wizard__input"
                  type="text"
                  placeholder="入口说明（可选，将写进发给模型的指令）"
                  value={description}
                  onChange={event => { setDescription(event.target.value) }}
                />
              </div>
              {error !== '' && <p className="lawyer-wizard__error">{error}</p>}
              <div className="lawyer-wizard__add-actions">
                <button type="button" className="lawyer-wizard__submit" onClick={addDraft}>
                  添加入口
                </button>
              </div>
              <p className="lawyer-wizard__hint">
                提示：自定义入口提交时将以「/技能名」手势发起对话；技能需已安装（lawyer-dsh/skills 或用户技能目录）。
              </p>
            </div>
            <div className="lawyer-wizard__actions">
              <button type="button" className="lawyer-wizard__cancel" onClick={() => { setStep(1) }}>
                上一步
              </button>
              <button type="button" className="lawyer-wizard__cancel" disabled={busy} onClick={() => { void onSkip() }}>
                跳过自定义
              </button>
              <button type="button" className="lawyer-wizard__submit" disabled={busy} onClick={finish}>
                {busy ? '保存中…' : '完成'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

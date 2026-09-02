/**
 * 技能名输入字段：input + datalist。
 * 有当前会话时列出已安装技能供选择（含 disable-model-invocation 的——
 * 手势 /name 是它们的唯一合法入口）；无会话或拉取失败时退化为纯手输。
 */
import { useEffect, useId, useState } from 'react'
import type { SkillEntry } from '@deepseek-ai/dsh-api-remotes/client'

/** 技能字段 props。 */
export interface SkillFieldProps {
  /** 当前技能名（受控）。 */
  readonly value: string
  /** 技能名变更回调。 */
  readonly onChange: (value: string) => void
  /** 已安装技能目录（可能 undefined → 手输模式）。 */
  readonly listInstalledSkills: () => Promise<readonly SkillEntry[] | undefined>
  /** 输入框占位文案。 */
  readonly placeholder?: string
}

/** 技能名输入（datalist 提示 + 手输兼容）。 */
export function SkillField({ value, onChange, listInstalledSkills, placeholder }: SkillFieldProps) {
  const [skills, setSkills] = useState<readonly SkillEntry[] | undefined>(undefined)
  const listId = useId()

  useEffect(() => {
    let cancelled = false
    void listInstalledSkills().then(entries => {
      if (!cancelled) setSkills(entries)
    })
    return () => { cancelled = true }
  }, [listInstalledSkills])

  return (
    <>
      <input
        className="lawyer-wizard__input"
        type="text"
        list={skills === undefined || skills.length === 0 ? undefined : listId}
        value={value}
        placeholder={placeholder ?? '技能名，如 due-diligence'}
        onChange={event => { onChange(event.target.value) }}
      />
      {skills !== undefined && skills.length > 0 && (
        <datalist id={listId}>
          {skills.map(skill => (
            <option key={skill.name} value={skill.name}>{skill.description}</option>
          ))}
        </datalist>
      )}
    </>
  )
}

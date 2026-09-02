/**
 * 自定义功能完整配置表单（新建/编辑共用）——M8 起对齐 dsh-plugin-task-panel
 * 的配置形态：一个功能入口 = 一条配置（卡片展示 + 提示词模板 + 表单字段 +
 * 技能手势 + 目标 preset + 法律事项绑定），发起时按配置渲染表单、渲染模板、
 * 新建专属会话注入指令。
 *
 * 四个分区：
 *   1. 功能定位——名称 / 卡片简述 / 图标 / 启动 preset / 任务目标；
 *   2. 提示词与表单——模板（{{字段 id}} 引用字段值）+ 字段编辑器（六种
 *      字段类型，可增删排序）；
 *   3. 技能配置——主技能（/skill 手势）+ 附加技能；
 *   4. 法律事项——开关 + claude-for-legal-ZH 领域（adapter / 原始技能 /
 *      子代理方案 / 强制参考文件）+ MCP 偏好。
 *
 * 表单产出 CustomLawyerEntry 草稿；持久化与保存由调用方（EntryManager）
 * 负责。校验失败给出首条错误原因，不提交。
 */
import { useEffect, useState } from 'react'
import type { SkillEntry } from '@deepseek-ai/dsh-api-remotes/client'
import {
  FIELD_TYPES,
  FIELD_TYPE_LABELS,
  OPTIONAL_TYPES,
  SUBAGENT_PLAN_LABELS,
  generateCustomEntryId,
  type CustomEntryField,
  type CustomLawyerEntry,
  type FieldType,
  type LegalTaskConfig,
  type McpPreference,
  type SubagentPlanId,
} from './config.ts'
import { LEGAL_DOMAINS, LEGAL_REFERENCES, findLegalDomain } from './legalDomains.ts'
import { SkillField } from './SkillField.tsx'

/** 技能名规范（与 dsh-skill 的 isSkillName 一致）：小写 kebab-case。 */
const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** 字段 id 规范（模板占位符内可用，不含空白与花括号）。 */
const FIELD_ID_PATTERN = /^[A-Za-z0-9_-]+$/

/** 图标选项（与 lawyer-sidebar 的图标表一致，改名需两边同步）。 */
const ICON_OPTIONS: readonly { readonly value: string; readonly label: string }[] = [
  { value: 'spark', label: '闪电（默认）' },
  { value: 'contract', label: '合同' },
  { value: 'search', label: '检索' },
  { value: 'pen', label: '文书' },
  { value: 'scale', label: '天平' },
  { value: 'shield', label: '合规风控' },
  { value: 'folder', label: '卷宗材料' },
  { value: 'chart', label: '分析台账' },
  { value: 'chat', label: '咨询沟通' },
  { value: 'clock', label: '期限监控' },
]

/** 字段类型下拉选项。 */
const FIELD_TYPE_OPTIONS = FIELD_TYPES.map(type => ({
  value: type,
  label: FIELD_TYPE_LABELS[type],
}))

/** 子代理方案下拉选项。 */
const SUBAGENT_OPTIONS = (Object.keys(SUBAGENT_PLAN_LABELS) as SubagentPlanId[]).map(id => ({
  value: id,
  label: SUBAGENT_PLAN_LABELS[id],
}))

/** MCP 偏好下拉选项（value → 展示文案）。 */
const MCP_OPTIONS: ReadonlyArray<{ readonly value: McpPreference['preset']; readonly label: string }> = [
  { value: 'none', label: '不指定（由技能流程自行决定）' },
  { value: 'yuandian', label: '元典 · 法规检索（lawyer preset 内置）' },
  { value: 'custom', label: '自定义说明…' },
]

/** preset 启动方式（存值见 agentPresetOf）。 */
type PresetMode = 'lawyer' | 'none' | 'custom'

/** 表单内部的可变草稿形态（编辑时由 entry 初始化）。 */
interface FormDraft {
  label: string
  hint: string
  icon: string
  presetMode: PresetMode
  presetCustom: string
  description: string
  purpose: string
  template: string
  fields: CustomEntryField[]
  skill: string
  /** 附加技能输入框的暂存值（不落盘）。 */
  skillDraft: string
  extraSkills: string[]
  legalEnabled: boolean
  legalDomain: string
  legalSkills: string[]
  legalSubagent: SubagentPlanId
  legalReferences: string[]
  mcpPreset: McpPreference['preset']
  mcpNote: string
}

/** 由既有入口生成草稿初值。 */
function draftOf(entry: CustomLawyerEntry | undefined): FormDraft {
  const agentPreset = entry?.agentPreset ?? 'lawyer'
  return {
    label: entry?.label ?? '',
    hint: entry?.hint ?? '',
    icon: entry?.icon ?? 'spark',
    presetMode: agentPreset === '' ? 'none'
      : agentPreset === 'lawyer' ? 'lawyer'
        : 'custom',
    presetCustom: agentPreset !== '' && agentPreset !== 'lawyer' ? agentPreset : '',
    description: entry?.description ?? '',
    purpose: entry?.purpose ?? '',
    template: entry?.template ?? '',
    fields: (entry?.fields ?? []).map(field => ({ ...field })),
    skill: entry?.skill ?? '',
    skillDraft: '',
    extraSkills: [...(entry?.extraSkills ?? [])],
    legalEnabled: entry?.legal !== undefined,
    legalDomain: entry?.legal?.domain ?? 'commercial-legal',
    legalSkills: [...(entry?.legal?.skills ?? [])],
    legalSubagent: entry?.legal?.subagent ?? 'none',
    legalReferences: [...(entry?.legal?.references ?? [])],
    mcpPreset: entry?.mcp?.preset ?? 'none',
    mcpNote: entry?.mcp?.preset === 'custom' ? entry.mcp.note ?? '' : '',
  }
}

/** 生成入口内唯一的字段 id（field1、field2…）。 */
function nextFieldId(fields: readonly CustomEntryField[]): string {
  let index = fields.length + 1
  const used = new Set(fields.map(field => field.id))
  while (used.has(`field${index}`)) index += 1
  return `field${index}`
}

/** 多行文本 → 选项数组（去空、去重、保序）。 */
function parseOptions(raw: string): readonly string[] {
  const seen = new Set<string>()
  const options: string[] = []
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (trimmed === '' || seen.has(trimmed)) continue
    seen.add(trimmed)
    options.push(trimmed)
  }
  return options
}

/** 选项数组 → 多行文本（回填编辑器）。 */
function optionsToText(options: readonly string[] | undefined): string {
  return (options ?? []).join('\n')
}

/** 自定义功能配置表单 props。 */
export interface CustomEntryFormProps {
  /** 编辑目标（新建时 undefined）。 */
  readonly entry?: CustomLawyerEntry
  /** 已安装技能目录（可能 undefined → 手输模式）。 */
  readonly listInstalledSkills: () => Promise<readonly SkillEntry[] | undefined>
  /** 提交草稿（校验通过后调用）。 */
  readonly onSubmit: (draft: CustomLawyerEntry) => void
  /** 取消/返回列表。 */
  readonly onCancel: () => void
  /** 提交按钮文案。 */
  readonly submitLabel?: string
}

/** 自定义功能配置表单（四分区：定位 / 模板与字段 / 技能 / 法律事项）。 */
export function CustomEntryForm({
  entry,
  listInstalledSkills,
  onSubmit,
  onCancel,
  submitLabel = '创建功能',
}: CustomEntryFormProps) {
  const [draft, setDraft] = useState<FormDraft>(() => draftOf(entry))
  const [error, setError] = useState('')
  const [optionsDraft, setOptionsDraft] = useState<Readonly<Record<number, string>>>(() =>
    Object.fromEntries((entry?.fields ?? []).map((field, index) => [index, optionsToText(field.options)])),
  )
  const [installedSkills, setInstalledSkills] = useState<readonly SkillEntry[] | undefined>(undefined)

  // 附加技能下拉数据源：无当前会话时为空，退化为手输（见下方输入框）。
  useEffect(() => {
    let cancelled = false
    void listInstalledSkills().then(entries => {
      if (!cancelled) setInstalledSkills(entries)
    })
    return () => { cancelled = true }
  }, [listInstalledSkills])

  const patch = (partial: Partial<FormDraft>): void => {
    setDraft(previous => ({ ...previous, ...partial }))
  }

  /** 附加技能下拉可选项：排除主技能与已添加项。 */
  const selectableExtraSkills = (installedSkills ?? []).filter(
    skill => skill.name !== draft.skill && !draft.extraSkills.includes(skill.name),
  )

  /** 当前领域的元数据（技能清单与 adapter 由它决定）。 */
  const domainMeta = findLegalDomain(draft.legalDomain)

  // ── 字段编辑器 ──────────────────────────────────────────────────────
  const addField = (): void => {
    setDraft(previous => ({
      ...previous,
      fields: [...previous.fields, {
        id: nextFieldId(previous.fields),
        label: '新字段',
        type: 'text' as FieldType,
      }],
    }))
  }

  const updateField = (index: number, partial: Partial<CustomEntryField>): void => {
    setDraft(previous => {
      const fields = previous.fields.map((field, i) => (i === index ? { ...field, ...partial } : field))
      return { ...previous, fields }
    })
  }

  const removeField = (index: number): void => {
    setOptionsDraft(previous => {
      const next: Record<number, string> = {}
      for (const [key, value] of Object.entries(previous)) {
        const numeric = Number(key)
        if (numeric < index) next[numeric] = value
        else if (numeric > index) next[numeric - 1] = value
      }
      return next
    })
    setDraft(previous => ({ ...previous, fields: previous.fields.filter((_, i) => i !== index) }))
  }

  const moveField = (index: number, delta: -1 | 1): void => {
    const target = index + delta
    if (target < 0 || target >= draft.fields.length) return
    setOptionsDraft(previous => {
      const next = { ...previous }
      const a = next[index] ?? ''
      const b = next[target] ?? ''
      next[index] = b
      next[target] = a
      return next
    })
    setDraft(previous => {
      const fields = [...previous.fields]
      const [moved] = fields.splice(index, 1)
      fields.splice(target, 0, moved)
      return { ...previous, fields }
    })
  }

  // ── 法律事项 ────────────────────────────────────────────────────────
  /** 切换领域：同步 adapter，并裁掉不属于新领域的原始技能。 */
  const switchDomain = (domain: string): void => {
    const meta = findLegalDomain(domain)
    patch({
      legalDomain: domain,
      legalSkills: meta === undefined ? [] : draft.legalSkills.filter(name => meta.skills.includes(name)),
    })
  }

  const toggleLegalSkill = (name: string): void => {
    patch({
      legalSkills: draft.legalSkills.includes(name)
        ? draft.legalSkills.filter(item => item !== name)
        : [...draft.legalSkills, name],
    })
  }

  const toggleReference = (path: string): void => {
    patch({
      legalReferences: draft.legalReferences.includes(path)
        ? draft.legalReferences.filter(item => item !== path)
        : [...draft.legalReferences, path],
    })
  }

  /** 模板里引用到的字段 id 是否都已定义（拼写错误的占位符会原样留在指令里）。 */
  const unknownPlaceholders = (): readonly string[] => {
    const known = new Set(draft.fields.map(field => field.id))
    const unknown: string[] = []
    for (const match of draft.template.matchAll(/\{\{\s*([^}\s]+)\s*\}\}/gu)) {
      const key = match[1]
      if (key !== undefined && !known.has(key) && !unknown.includes(key)) unknown.push(key)
    }
    return unknown
  }

  /** 校验并把草稿组装为 CustomLawyerEntry。 */
  const submit = (): void => {
    const label = draft.label.trim()
    const skill = draft.skill.trim().toLowerCase().replace(/\s+/g, '-')
    if (label === '') {
      setError('请填写功能名称')
      return
    }
    if (!SKILL_NAME_PATTERN.test(skill)) {
      setError('主技能名需为小写 kebab-case（如 due-diligence），可在左侧对话里输入 / 查看可用技能')
      return
    }
    // 表单字段：id 唯一且合法；选项型字段必须有选项（与运行时规范化同口径）。
    const seenField = new Set<string>()
    const fields: CustomEntryField[] = []
    for (let index = 0; index < draft.fields.length; index += 1) {
      const field = draft.fields[index]
      const id = field.id.trim()
      const fieldLabel = field.label.trim()
      if (!FIELD_ID_PATTERN.test(id)) {
        setError(`第 ${index + 1} 个字段的标识不合法：只能含字母、数字、下划线与连字符（当前值「${field.id}」）`)
        return
      }
      if (seenField.has(id)) {
        setError(`字段标识「${id}」重复，请改为唯一值`)
        return
      }
      if (fieldLabel === '') {
        setError(`第 ${index + 1} 个字段未填写展示名`)
        return
      }
      seenField.add(id)
      const options = parseOptions(optionsDraft[index] ?? '')
      if (OPTIONAL_TYPES.includes(field.type) && options.length === 0) {
        setError(`字段「${fieldLabel}」为${FIELD_TYPE_LABELS[field.type]}，请至少填写一个选项（每行一个）`)
        return
      }
      const normalized: {
        id: string
        label: string
        type: FieldType
        options?: readonly string[]
        default?: string
        placeholder?: string
        hint?: string
        dropHint?: string
      } = { id, label: fieldLabel, type: field.type }
      if (field.type !== 'files') {
        if (options.length > 0) normalized.options = options
        if (field.default !== undefined && field.default.trim() !== '') normalized.default = field.default
      }
      const placeholder = field.placeholder?.trim()
      const hint = field.hint?.trim()
      const dropHint = field.dropHint?.trim()
      if (placeholder !== undefined && placeholder !== '') normalized.placeholder = placeholder
      if (hint !== undefined && hint !== '') normalized.hint = hint
      if (dropHint !== undefined && dropHint !== '') normalized.dropHint = dropHint
      fields.push(normalized)
    }
    const unknown = unknownPlaceholders()
    if (unknown.length > 0) {
      setError(`提示词模板引用了未定义的字段：${unknown.map(key => `{{${key}}}`).join('、')}`)
      return
    }

    // 法律事项绑定。
    let legal: LegalTaskConfig | undefined
    if (draft.legalEnabled) {
      const meta = findLegalDomain(draft.legalDomain)
      if (meta === undefined) {
        setError('请选择 claude-for-legal-ZH 领域')
        return
      }
      legal = {
        domain: meta.domain,
        adapter: meta.adapter,
        skills: draft.legalSkills.filter(name => meta.skills.includes(name)),
        subagent: draft.legalSubagent,
        ...draft.legalReferences.length > 0 ? { references: [...draft.legalReferences] } : {},
      }
    }

    let mcp: McpPreference | undefined
    if (draft.mcpPreset === 'yuandian') mcp = { preset: 'yuandian' }
    else if (draft.mcpPreset === 'custom') {
      const note = draft.mcpNote.trim()
      if (note === '') {
        setError('选择“自定义说明”时请填写 MCP 工具偏好说明')
        return
      }
      mcp = { preset: 'custom', note }
    }

    let agentPreset = 'lawyer'
    if (draft.presetMode === 'none') agentPreset = ''
    else if (draft.presetMode === 'custom') {
      agentPreset = draft.presetCustom.trim()
      if (agentPreset === '') {
        setError('选择“其它 preset”时请填写 preset 名称')
        return
      }
    }

    const hint = draft.hint.trim()
    const description = draft.description.trim()
    const purpose = draft.purpose.trim()
    const template = draft.template.trim()
    const extraSkills = draft.extraSkills
      .map(name => name.trim().toLowerCase())
      .filter((name, index, all) => SKILL_NAME_PATTERN.test(name) && name !== skill && all.indexOf(name) === index)
    setError('')
    onSubmit({
      kind: 'custom',
      id: entry?.id ?? generateCustomEntryId(),
      label,
      skill,
      ...hint === '' ? {} : { hint },
      ...draft.icon === 'spark' ? {} : { icon: draft.icon },
      ...description === '' ? {} : { description },
      ...purpose === '' ? {} : { purpose },
      ...extraSkills.length > 0 ? { extraSkills } : {},
      ...agentPreset === '' ? {} : { agentPreset },
      ...template === '' ? {} : { template },
      ...fields.length > 0 ? { fields } : {},
      ...legal === undefined ? {} : { legal },
      ...mcp === undefined ? {} : { mcp },
    })
  }

  const placeholders = draft.fields.map(field => `{{${field.id}}}`)

  return (
    <div className="lawyer-wizard__form">
      <h3 className="lawyer-wizard__section-title">一、功能定位</h3>
      <label className="lawyer-wizard__label" htmlFor="lawyer-form-label">功能名称 *</label>
      <input
        id="lawyer-form-label"
        className="lawyer-wizard__input"
        type="text"
        placeholder="如：尽职调查、法律检索报告"
        value={draft.label}
        onChange={event => { patch({ label: event.target.value }) }}
      />
      <label className="lawyer-wizard__label" htmlFor="lawyer-form-hint">卡片简述</label>
      <input
        id="lawyer-form-hint"
        className="lawyer-wizard__input"
        type="text"
        placeholder="右侧功能卡片第二行（留空则显示 /技能名）"
        value={draft.hint}
        onChange={event => { patch({ hint: event.target.value }) }}
      />
      <div className="lawyer-wizard__grid2">
        <div>
          <label className="lawyer-wizard__label" htmlFor="lawyer-form-icon">卡片图标</label>
          <select
            id="lawyer-form-icon"
            className="lawyer-wizard__select"
            value={draft.icon}
            onChange={event => { patch({ icon: event.target.value }) }}
          >
            {ICON_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="lawyer-wizard__label" htmlFor="lawyer-form-preset">启动模式（agent preset）</label>
          <select
            id="lawyer-form-preset"
            className="lawyer-wizard__select"
            value={draft.presetMode}
            onChange={event => { patch({ presetMode: event.target.value as PresetMode }) }}
          >
            <option value="lawyer">律师模式（lawyer preset，含元典 MCP）</option>
            <option value="none">不切换（沿用会话当前 preset）</option>
            <option value="custom">其它 preset…</option>
          </select>
        </div>
      </div>
      {draft.presetMode === 'custom' && (
        <input
          className="lawyer-wizard__input"
          type="text"
          placeholder="preset 名称（需已部署到 $DSH_HOME/.agent-presets/<名称>/）"
          value={draft.presetCustom}
          onChange={event => { patch({ presetCustom: event.target.value }) }}
        />
      )}
      <label className="lawyer-wizard__label" htmlFor="lawyer-form-description">入口说明</label>
      <input
        id="lawyer-form-description"
        className="lawyer-wizard__input"
        type="text"
        placeholder="一句话说明（悬浮提示用；配置模板时可不填）"
        value={draft.description}
        onChange={event => { patch({ description: event.target.value }) }}
      />
      <label className="lawyer-wizard__label" htmlFor="lawyer-form-purpose">主要功能 / 任务目标</label>
      <textarea
        id="lawyer-form-purpose"
        className="lawyer-wizard__textarea"
        placeholder="这个功能是干什么的：输入材料、执行流程、期望产出。未配置模板时作为指令正文"
        value={draft.purpose}
        onChange={event => { patch({ purpose: event.target.value }) }}
      />

      <h3 className="lawyer-wizard__section-title">二、提示词与表单</h3>
      <label className="lawyer-wizard__label" htmlFor="lawyer-form-template">提示词模板</label>
      <textarea
        id="lawyer-form-template"
        className="lawyer-wizard__textarea lawyer-wizard__textarea--tall"
        placeholder={'本次任务：{{…}}\n\n要求：\n1. …\n2. …'}
        value={draft.template}
        onChange={event => { patch({ template: event.target.value }) }}
      />
      <p className="lawyer-wizard__hint">
        {placeholders.length > 0
          ? `可用占位符：${placeholders.join('、')}——发起时替换为本次表单取值；含材料的字段即使不写占位符，材料清单也会追加到指令末尾。`
          : '以 {{字段标识}} 引用下方表单字段的取值；留空则按「任务目标 + 补充说明」拼装指令。'}
      </p>

      <div className="lawyer-wizard__fields-head">
        <span className="lawyer-wizard__label">表单字段（{draft.fields.length}）</span>
        <button type="button" className="lawyer-wizard__mini-btn" onClick={addField}>＋ 添加字段</button>
      </div>
      {draft.fields.length === 0 && (
        <p className="lawyer-wizard__hint">未配置字段时，发起表单只显示一个「补充说明」输入框（旧行为）。</p>
      )}
      {draft.fields.map((field, index) => (
        <div key={index} className="lawyer-wizard__field">
          <div className="lawyer-wizard__field-head">
            <span className="lawyer-wizard__field-index">{index + 1}</span>
            <input
              className="lawyer-wizard__input lawyer-wizard__input--sm"
              type="text"
              aria-label={`第 ${index + 1} 个字段的展示名`}
              placeholder="展示名"
              value={field.label}
              onChange={event => { updateField(index, { label: event.target.value }) }}
            />
            <span className="lawyer-wizard__field-actions">
              <button
                type="button"
                className="lawyer-wizard__row-btn"
                title="上移"
                disabled={index === 0}
                onClick={() => { moveField(index, -1) }}
              >
                ↑
              </button>
              <button
                type="button"
                className="lawyer-wizard__row-btn"
                title="下移"
                disabled={index === draft.fields.length - 1}
                onClick={() => { moveField(index, 1) }}
              >
                ↓
              </button>
              <button
                type="button"
                className="lawyer-wizard__row-btn lawyer-wizard__row-btn--danger"
                title="删除字段"
                onClick={() => { removeField(index) }}
              >
                ✕
              </button>
            </span>
          </div>
          <div className="lawyer-wizard__grid2">
            <div>
              <label className="lawyer-wizard__field-label" htmlFor={`lawyer-field-id-${index}`}>字段标识（模板引用）</label>
              <input
                id={`lawyer-field-id-${index}`}
                className="lawyer-wizard__input lawyer-wizard__input--sm"
                type="text"
                placeholder="如 material"
                value={field.id}
                onChange={event => { updateField(index, { id: event.target.value }) }}
              />
            </div>
            <div>
              <label className="lawyer-wizard__field-label" htmlFor={`lawyer-field-type-${index}`}>类型</label>
              <select
                id={`lawyer-field-type-${index}`}
                className="lawyer-wizard__select lawyer-wizard__input--sm"
                value={field.type}
                onChange={event => { updateField(index, { type: event.target.value as FieldType }) }}
              >
                {FIELD_TYPE_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          {OPTIONAL_TYPES.includes(field.type) && (
            <div>
              <label className="lawyer-wizard__field-label" htmlFor={`lawyer-field-options-${index}`}>
                选项（每行一个）*
              </label>
              <textarea
                id={`lawyer-field-options-${index}`}
                className="lawyer-wizard__textarea lawyer-wizard__textarea--sm"
                placeholder={'选项一\n选项二'}
                value={optionsDraft[index] ?? ''}
                onChange={event => {
                  setOptionsDraft(previous => ({ ...previous, [index]: event.target.value }))
                }}
              />
            </div>
          )}
          <div className="lawyer-wizard__grid2">
            <div>
              <label className="lawyer-wizard__field-label" htmlFor={`lawyer-field-default-${index}`}>默认值</label>
              <input
                id={`lawyer-field-default-${index}`}
                className="lawyer-wizard__input lawyer-wizard__input--sm"
                type="text"
                placeholder={field.type === 'checkbox' ? '多个用逗号分隔' : '可选'}
                disabled={field.type === 'files'}
                value={field.default ?? ''}
                onChange={event => { updateField(index, { default: event.target.value }) }}
              />
            </div>
            <div>
              <label className="lawyer-wizard__field-label" htmlFor={`lawyer-field-placeholder-${index}`}>占位提示</label>
              <input
                id={`lawyer-field-placeholder-${index}`}
                className="lawyer-wizard__input lawyer-wizard__input--sm"
                type="text"
                placeholder={field.type === 'files' ? '文件字段不支持' : '可选'}
                disabled={field.type === 'files'}
                value={field.placeholder ?? ''}
                onChange={event => { updateField(index, { placeholder: event.target.value }) }}
              />
            </div>
          </div>
          <div>
            <label className="lawyer-wizard__field-label" htmlFor={`lawyer-field-hint-${index}`}>
              字段说明{field.type === 'files' ? ' / 拖入提示' : ''}
            </label>
            <input
              id={`lawyer-field-hint-${index}`}
              className="lawyer-wizard__input lawyer-wizard__input--sm"
              type="text"
              placeholder="渲染在控件下方的说明（可选）"
              value={field.type === 'files' ? field.dropHint ?? '' : field.hint ?? ''}
              onChange={event => {
                updateField(index, field.type === 'files'
                  ? { dropHint: event.target.value }
                  : { hint: event.target.value })
              }}
            />
          </div>
        </div>
      ))}

      <h3 className="lawyer-wizard__section-title">三、技能配置</h3>
      <label className="lawyer-wizard__label" htmlFor="lawyer-form-skill">主技能（/手势注入） *</label>
      <SkillField
        value={draft.skill}
        onChange={value => { patch({ skill: value }) }}
        listInstalledSkills={listInstalledSkills}
        placeholder="主技能名，如 due-diligence"
      />
      <p className="lawyer-wizard__hint">
        从已安装技能中选择（含“仅手势”技能）或手输；发起任务时以 /技能名 手势强制加载技能全文执行。
        开启法律事项时，领域 adapter 手势会排在主技能之前。
      </p>
      <label className="lawyer-wizard__label" htmlFor="lawyer-form-extra">附加技能</label>
      {draft.extraSkills.length > 0 && (
        <ul className="lawyer-wizard__files">
          {draft.extraSkills.map((name, index) => (
            <li key={name} className="lawyer-wizard__file">
              <span className="lawyer-wizard__file-name" title={`附加技能：${name}`}>⚡ {name}</span>
              <button
                type="button"
                className="lawyer-wizard__file-remove"
                aria-label={`移除 ${name}`}
                onClick={() => { patch({ extraSkills: draft.extraSkills.filter((_, i) => i !== index) }) }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      <select
        id="lawyer-form-extra"
        className="lawyer-wizard__select"
        value=""
        disabled={installedSkills === undefined || selectableExtraSkills.length === 0}
        onChange={event => {
          const name = event.target.value
          if (name !== '' && !draft.extraSkills.includes(name)) {
            patch({ extraSkills: [...draft.extraSkills, name] })
          }
          event.target.value = ''
        }}
      >
        <option value="">
          {installedSkills === undefined
            ? '技能目录加载中…（无当前会话时可先创建功能，稍后编辑补充）'
            : selectableExtraSkills.length === 0
              ? '没有更多可添加的技能'
              : '选择要附加的已安装技能…'}
        </option>
        {selectableExtraSkills.map(skill => (
          <option key={skill.name} value={skill.name}>
            {skill.name}{skill.modelInvocable ? '' : '（仅手势）'} — {skill.description.slice(0, 30)}
          </option>
        ))}
      </select>
      <div className="lawyer-wizard__inline">
        <input
          className="lawyer-wizard__input lawyer-wizard__input--sm"
          type="text"
          placeholder="附加技能名（小写 kebab-case），回车添加"
          value={draft.skillDraft}
          onChange={event => { patch({ skillDraft: event.target.value }) }}
          onKeyDown={event => {
            if (event.key !== 'Enter') return
            event.preventDefault()
            const name = draft.skillDraft.trim().toLowerCase()
            if (name === '' || !SKILL_NAME_PATTERN.test(name) || draft.extraSkills.includes(name)) return
            patch({ extraSkills: [...draft.extraSkills, name], skillDraft: '' })
          }}
        />
        <button
          type="button"
          className="lawyer-wizard__mini-btn"
          onClick={() => {
            const name = draft.skillDraft.trim().toLowerCase()
            if (name === '' || !SKILL_NAME_PATTERN.test(name) || draft.extraSkills.includes(name)) return
            patch({ extraSkills: [...draft.extraSkills, name], skillDraft: '' })
          }}
        >
          添加
        </button>
      </div>

      <h3 className="lawyer-wizard__section-title">四、法律事项（claude-for-legal-ZH）</h3>
      <label className="lawyer-wizard__switch">
        <input
          type="checkbox"
          checked={draft.legalEnabled}
          onChange={event => { patch({ legalEnabled: event.target.checked }) }}
        />
        <span>本功能涉及法律事项——按 claude-for-legal-ZH 中国法规范执行（领域画像 / 三层内部调用规程 / 法律输出规则）</span>
      </label>
      {!draft.legalEnabled && (
        <p className="lawyer-wizard__hint">
          非法律类功能（如格式转换、资料整理）保持关闭：指令只带技能手势与模板渲染结果。
        </p>
      )}
      {draft.legalEnabled && (
        <>
          <label className="lawyer-wizard__label" htmlFor="lawyer-form-domain">法律领域 *</label>
          <select
            id="lawyer-form-domain"
            className="lawyer-wizard__select"
            value={draft.legalDomain}
            onChange={event => { switchDomain(event.target.value) }}
          >
            {LEGAL_DOMAINS.map(item => (
              <option key={item.domain} value={item.domain}>
                {item.label}（{item.domain}）
              </option>
            ))}
          </select>
          <p className="lawyer-wizard__hint">
            对应 adapter 技能：/{domainMeta?.adapter ?? '—'}——指令以它作为首个手势，由它路由到 {draft.legalDomain}/CLAUDE.md 与原始技能。
          </p>
          <label className="lawyer-wizard__label">领域原始技能（可多选，留空由 adapter 按材料自行路由）</label>
          <div className="lawyer-wizard__chips">
            {(domainMeta?.skills ?? []).map(name => (
              <button
                key={name}
                type="button"
                className={draft.legalSkills.includes(name)
                  ? 'lawyer-wizard__chip lawyer-wizard__chip--on'
                  : 'lawyer-wizard__chip'}
                onClick={() => { toggleLegalSkill(name) }}
              >
                {name}
              </button>
            ))}
          </div>
          <label className="lawyer-wizard__label" htmlFor="lawyer-form-subagent">子代理分派方案</label>
          <select
            id="lawyer-form-subagent"
            className="lawyer-wizard__select"
            value={draft.legalSubagent}
            onChange={event => { patch({ legalSubagent: event.target.value as SubagentPlanId }) }}
          >
            {SUBAGENT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
          <label className="lawyer-wizard__label">强制适用的共享参考文件</label>
          <div className="lawyer-wizard__chips">
            {LEGAL_REFERENCES.map(item => (
              <button
                key={item.path}
                type="button"
                className={draft.legalReferences.includes(item.path)
                  ? 'lawyer-wizard__chip lawyer-wizard__chip--on'
                  : 'lawyer-wizard__chip'}
                onClick={() => { toggleReference(item.path) }}
                title={item.path}
              >
                {item.label}
              </button>
            ))}
          </div>
        </>
      )}

      <h3 className="lawyer-wizard__section-title">MCP 配置</h3>
      <label className="lawyer-wizard__label" htmlFor="lawyer-form-mcp">MCP 工具偏好</label>
      <select
        id="lawyer-form-mcp"
        className="lawyer-wizard__select"
        value={draft.mcpPreset}
        onChange={event => { patch({ mcpPreset: event.target.value as McpPreference['preset'] }) }}
      >
        {MCP_OPTIONS.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
      {draft.mcpPreset === 'custom' && (
        <>
          <label className="lawyer-wizard__label" htmlFor="lawyer-form-mcp-note">MCP 使用说明 *</label>
          <textarea
            id="lawyer-form-mcp-note"
            className="lawyer-wizard__textarea"
            placeholder="如：优先使用元典 MCP 的法规检索工具核查引用条文；或说明本功能不依赖 MCP"
            value={draft.mcpNote}
            onChange={event => { patch({ mcpNote: event.target.value }) }}
          />
        </>
      )}
      <p className="lawyer-wizard__hint">
        MCP 工具由律师模式会话的 agent preset 提供（当前内置元典·法规检索 law / case 两个 server）；
        法律事项开启时，指令还会带上三轮检索、时效核验与来源溯源标签等规程。
      </p>

      {error !== '' && <p className="lawyer-wizard__error">{error}</p>}
      <div className="lawyer-wizard__actions">
        <button type="button" className="lawyer-wizard__cancel" onClick={onCancel}>
          取消
        </button>
        <button type="button" className="lawyer-wizard__submit" onClick={submit}>
          {submitLabel}
        </button>
      </div>
    </div>
  )
}

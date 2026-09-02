/**
 * lawyer-workbench 设置分节的 client 侧模型（lawyer-sidebar 副本）。
 *
 * 运行时真值经官方 settings 通道到达：Host 侧 lawyer-tools 注册
 * `lawyer-workbench` namespace（$DSH_HOME/settings.yaml），本插件经
 * ui-settings 的 ctx.settingsScope.bind({ namespace }) 拿到响应式
 * 快照；wizard 或外部编辑产生的变更由官方 mirror 推送，驱动右侧栏
 * 重渲染。本文件提供 TS 类型、回退基线与语义规范化：
 *   - FALLBACK_ENTRIES：配置通道不可用（ui-settings 缺席、namespace
 *     未注册、非 loopback）时渲染默认三入口——M1~M3 零回归基线；
 *   - normalizeEntries：builtin id 必须已知、custom 必有 label/skill、
 *     去重；脏数据丢弃而非报错。
 *
 * M8 起自定义入口升级为「入口即配置」（对齐 dsh-plugin-task-panel）：
 * 卡片展示（label/hint/icon）+ 提示词模板 template（{{字段 id}} 引用）+
 * 表单字段 fields + 目标 agentPreset + 技能手势，涉及法律事项时 legal 段
 * 绑定 claude-for-legal-ZH 的领域 adapter 与原始技能。
 *
 * 注意：lawyer-wizard 有一份等价副本（client bundle 互相独立，不能跨
 * 插件 import）；Host 侧 schema 默认值在 lawyer-tools/src/index.ts。
 * 三处修改需同步。
 */

/** 内置入口 id（右侧栏按它映射到既有三个悬浮窗表单）。 */
export const BUILTIN_ENTRY_IDS = ['contract-review', 'case-analysis', 'doc-generation'] as const

/** 内置入口 id 的字面量类型。 */
export type BuiltinEntryId = typeof BUILTIN_ENTRY_IDS[number]

/** 内置入口展示信息（label 用于卡片名；hint 是卡片简述；description 用于 title 提示）。 */
export const BUILTIN_ENTRY_META: Readonly<Record<BuiltinEntryId, { label: string; hint: string; description: string }>> = {
  'contract-review': {
    label: '合同审核',
    hint: '合同风险与条款审查',
    description: '合同审核：填写表单后发起律师模式会话',
  },
  'case-analysis': {
    label: '案件分析',
    hint: '事实梳理 · 争议焦点 · 风险评估',
    description: '案件分析：事实梳理 / 争议焦点 / 证据审查 / 风险评估',
  },
  'doc-generation': {
    label: '案件文书生成',
    hint: '起诉状 · 答辩状 · 代理词',
    description: '文书生成：起诉状 / 答辩状 / 代理词 / 法律意见书',
  },
}

/** 内置入口条目（展示信息由 BUILTIN_ENTRY_META 提供，不落盘）。 */
export interface BuiltinLawyerEntry {
  readonly kind: 'builtin'
  readonly id: BuiltinEntryId
}

/** MCP 执行偏好（写进注入指令；MCP 工具本身由 lawyer preset 提供会话能力）。 */
export interface McpPreference {
  /** none=不指定；yuandian=元典·法规检索（lawyer preset 内置）；custom=自定义说明。 */
  readonly preset: 'none' | 'yuandian' | 'custom'
  /** preset=custom 时的偏好说明。 */
  readonly note?: string
}

// ── 表单字段（对齐 dsh-plugin-task-panel 的六种字段类型）───────────────────

/** 表单字段类型。 */
export const FIELD_TYPES = ['text', 'textarea', 'select', 'radio', 'checkbox', 'files'] as const

/** 表单字段类型的字面量联合。 */
export type FieldType = typeof FIELD_TYPES[number]

/** 一个表单字段定义。 */
export interface CustomEntryField {
  /** 字段 id（模板中以 {{id}} 引用；同一入口内唯一）。 */
  readonly id: string
  /** 展示名（files 字段同时作为材料块标题）。 */
  readonly label: string
  readonly type: FieldType
  /** select / radio / checkbox 的选项。 */
  readonly options?: readonly string[]
  /** 初始值（text/textarea 为文本；checkbox 为逗号分隔的多个选项）。 */
  readonly default?: string
  /** text / textarea 的占位提示。 */
  readonly placeholder?: string
  /** 字段说明（渲染在控件下方）。 */
  readonly hint?: string
  /** files 字段的拖入提示语。 */
  readonly dropHint?: string
}

/** 需要填选项的字段类型（无选项则该字段无法取值）。 */
export const OPTIONAL_TYPES: readonly FieldType[] = ['select', 'radio', 'checkbox']

/** 子代理分派方案（复用三个内置入口的口径，或本次不用子代理）。 */
export type SubagentPlanId = 'contractReview' | 'caseAnalysis' | 'docGeneration' | 'none'

/** 自定义功能的 claude-for-legal-ZH 绑定（法律事项配置）。 */
export interface LegalTaskConfig {
  /** 领域目录名（仓库根下相对路径，如 commercial-legal）。 */
  readonly domain: string
  /** dsh adapter 技能名（如 chinese-legal-commercial）。 */
  readonly adapter: string
  /** 本次要走的领域原始技能名（<domain>/skills/<name>/SKILL.md）。 */
  readonly skills: readonly string[]
  /** 子代理分派方案。 */
  readonly subagent: SubagentPlanId
  /** 领域内强制适用的共享参考文件（仓库根下相对路径）。 */
  readonly references?: readonly string[]
}

/** 自定义功能入口：卡片展示 + 提示词模板 + 表单字段 + 技能手势 + 法律事项绑定。 */
export interface CustomLawyerEntry {
  readonly kind: 'custom'
  /** 唯一 id（custom-<时间戳>-<随机>，创建时生成）。 */
  readonly id: string
  /** 入口显示名。 */
  readonly label: string
  /** 主技能名（小写 kebab-case，指令以 /skill 手势开头）。 */
  readonly skill: string
  /** 卡片简述（留空时回退显示 /skill）。 */
  readonly hint?: string
  /** 卡片图标名（见 LawyerSidebar 的图标表；缺省 spark）。 */
  readonly icon?: string
  /** 入口说明（悬浮提示与指令共用）。 */
  readonly description?: string
  /** 主要功能 / 任务目标（写进注入指令）。 */
  readonly purpose?: string
  /** 附加技能（随指令一并以 /name 手势注入）。 */
  readonly extraSkills?: readonly string[]
  /** 目标 agent preset（缺省 lawyer；空串表示不切换）。 */
  readonly agentPreset?: string
  /** 提示词模板（{{字段 id}} 引用表单取值；留空则按功能定位拼装）。 */
  readonly template?: string
  /** 发起表单的字段定义（按序渲染）。 */
  readonly fields?: readonly CustomEntryField[]
  /** 法律事项绑定（存在即启用 claude-for-legal-ZH 的三层调用规程）。 */
  readonly legal?: LegalTaskConfig
  /** MCP 执行偏好。 */
  readonly mcp?: McpPreference
}

/** 一条功能入口（判别联合：kind 收窄）。 */
export type LawyerEntry = BuiltinLawyerEntry | CustomLawyerEntry

/** lawyer-workbench 分节值。 */
export interface LawyerConfig {
  /** 首启向导是否已完成。 */
  readonly onboarded?: boolean
  /** 启用的入口，顺序即右侧栏渲染顺序（可为空数组 = 用户全部关闭）。 */
  readonly entries: readonly LawyerEntry[]
  /**
   * M8：用户主动跳过实务画像引导的领域目录名（commercial-legal 等）。
   *
   * 只记「用户说不用再提醒」这个纯 UI 状态——画像是否已配置由 Host 的
   * lawyerProfile/status 实时查文件判定（画像是模型在会话里写的，前端
   * 无从感知，这份名单不能代替状态查询）。
   */
  readonly profileDismissed?: readonly string[]
  /**
   * M8.6：用户选择「不再提醒」元典 MCP 注册引导。
   *
   * 同样是纯 UI 状态——元典 Key 是否已配置由 Host 的 lawyerSecrets/status
   * 实时判定（用户可能直接改环境变量，前端无从感知）。
   */
  readonly mcpDismissed?: boolean
  /**
   * M8.6：首启的 DeepSeek API Key 获取引导是否已看过。
   *
   * 凭据本身是否已配置由 Host 的 credentials.describe 实时判定；这里只记
   * 「用户不想再看这段引导」。
   */
  readonly apiKeyGuideDone?: boolean
}

/** 配置通道不可用时的回退：三内置入口全启用（M1~M3 零回归基线）。 */
export const FALLBACK_ENTRIES: readonly LawyerEntry[] = BUILTIN_ENTRY_IDS.map(id => ({ kind: 'builtin', id }) as BuiltinLawyerEntry)

/** 技能名规范（与 dsh-skill 的 isSkillName 一致）：小写 kebab-case。 */
const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** 未知值的 plain object 判定。 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 非空字符串字段提取。 */
function nonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : undefined
}

/** 字符串数组清洗（丢弃非字符串、空串与重复项）。 */
function stringList(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return []
  const seen = new Set<string>()
  const items: string[] = []
  for (const item of value) {
    if (typeof item !== 'string') continue
    const trimmed = item.trim()
    if (trimmed === '' || seen.has(trimmed)) continue
    seen.add(trimmed)
    items.push(trimmed)
  }
  return items
}

/**
 * 规范化一个表单字段定义；非法（缺 id/label 或类型未识别）返回 undefined。
 * @param raw - 入口 fields 里的字段原始值。
 */
export function normalizeField(raw: unknown): CustomEntryField | undefined {
  if (!isPlainObject(raw)) return undefined
  const id = nonEmptyString(raw.id)
  const label = nonEmptyString(raw.label)
  const type = raw.type
  if (id === undefined || label === undefined) return undefined
  if (typeof type !== 'string' || !(FIELD_TYPES as readonly string[]).includes(type)) return undefined
  const options = stringList(raw.options)
  if ((OPTIONAL_TYPES as readonly string[]).includes(type) && options.length === 0) return undefined
  const field: {
    id: string
    label: string
    type: FieldType
    options?: readonly string[]
    default?: string
    placeholder?: string
    hint?: string
    dropHint?: string
  } = { id, label, type: type as FieldType }
  if (type !== 'files') {
    if (options.length > 0) field.options = options
    if (typeof raw.default === 'string') field.default = raw.default
  }
  const placeholder = nonEmptyString(raw.placeholder)
  const hint = nonEmptyString(raw.hint)
  const dropHint = nonEmptyString(raw.dropHint)
  if (placeholder !== undefined) field.placeholder = placeholder
  if (hint !== undefined) field.hint = hint
  if (dropHint !== undefined) field.dropHint = dropHint
  return field
}

/** 规范化字段列表；全部非法时返回 undefined（视同未配置）。 */
function normalizeFields(raw: unknown): readonly CustomEntryField[] | undefined {
  if (!Array.isArray(raw)) return undefined
  const seen = new Set<string>()
  const fields: CustomEntryField[] = []
  for (const item of raw) {
    const field = normalizeField(item)
    if (field === undefined || seen.has(field.id)) continue
    seen.add(field.id)
    fields.push(field)
  }
  return fields.length > 0 ? fields : undefined
}

/** 规范化法律事项绑定；缺 domain/adapter 时返回 undefined（即非法律功能）。 */
function normalizeLegal(raw: unknown): LegalTaskConfig | undefined {
  if (!isPlainObject(raw)) return undefined
  const domain = nonEmptyString(raw.domain)
  const adapter = nonEmptyString(raw.adapter)
  if (domain === undefined || adapter === undefined) return undefined
  const subagent = raw.subagent === 'contractReview'
    || raw.subagent === 'caseAnalysis'
    || raw.subagent === 'docGeneration'
    ? raw.subagent
    : 'none'
  const skills = stringList(raw.skills).filter(name => SKILL_NAME_PATTERN.test(name))
  const references = stringList(raw.references)
  return {
    domain,
    adapter,
    skills,
    subagent,
    ...references.length > 0 ? { references } : {},
  }
}

/**
 * 把分节里的 entries 原始值规范化为安全的入口列表。
 * 非数组（schema 已挡，双保险）→ 回退默认；条目非法/重复 → 丢弃；
 * 结果可为空数组（用户合法地关闭了所有入口 → 侧边栏显示空态提示）。
 * @param raw - 分节 value.entries（schema 解析产物）。
 * @returns 规范化后的入口列表。
 */
export function normalizeEntries(raw: unknown): readonly LawyerEntry[] {
  if (!Array.isArray(raw)) return FALLBACK_ENTRIES
  const seen = new Set<string>()
  const entries: LawyerEntry[] = []
  for (const item of raw) {
    if (!isPlainObject(item)) continue
    const id = nonEmptyString(item.id)
    if (id === undefined) continue
    if (item.kind === 'builtin') {
      if (!(BUILTIN_ENTRY_IDS as readonly string[]).includes(id)) continue
      if (seen.has(id)) continue
      seen.add(id)
      entries.push({ kind: 'builtin', id: id as BuiltinEntryId })
    } else if (item.kind === 'custom') {
      const label = nonEmptyString(item.label)
      const skill = nonEmptyString(item.skill)
      if (label === undefined || skill === undefined || !SKILL_NAME_PATTERN.test(skill)) continue
      if (seen.has(id)) continue
      seen.add(id)
      const hint = nonEmptyString(item.hint)
      const icon = nonEmptyString(item.icon)
      const description = nonEmptyString(item.description)
      const purpose = nonEmptyString(item.purpose)
      // agentPreset 缺省 lawyer（历史入口零回归）；显式空串表示不切换。
      const agentPreset = typeof item.agentPreset === 'string' ? item.agentPreset : 'lawyer'
      const template = typeof item.template === 'string' ? item.template : undefined
      const fields = normalizeFields(item.fields)
      const legal = normalizeLegal(item.legal)
      const extraSkills = stringList(item.extraSkills)
        .filter(name => SKILL_NAME_PATTERN.test(name) && name !== skill)
      let mcp: McpPreference | undefined
      if (isPlainObject(item.mcp)) {
        if (item.mcp.preset === 'yuandian') mcp = { preset: 'yuandian' }
        else if (item.mcp.preset === 'custom') {
          const note = nonEmptyString(item.mcp.note)
          if (note !== undefined) mcp = { preset: 'custom', note }
        }
      }
      entries.push({
        kind: 'custom',
        id,
        label,
        skill,
        ...hint === undefined ? {} : { hint },
        ...icon === undefined ? {} : { icon },
        ...description === undefined ? {} : { description },
        ...purpose === undefined ? {} : { purpose },
        ...extraSkills.length > 0 ? { extraSkills } : {},
        ...agentPreset === '' ? {} : { agentPreset },
        ...template === undefined ? {} : { template },
        ...fields === undefined ? {} : { fields },
        ...legal === undefined ? {} : { legal },
        ...mcp === undefined ? {} : { mcp },
      })
    }
  }
  return entries
}

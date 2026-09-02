/**
 * lawyer-workbench 设置分节的 client 侧模型（lawyer-wizard 副本）。
 *
 * 运行时真值来自官方 settings 通道（Host 侧 lawyer-tools 注册的
 * `lawyer-workbench` namespace，schema 解析已保证形状）；本文件提供：
 *   - TS 类型（分节值 / 入口条目）
 *   - FALLBACK_ENTRIES：配置通道不可用（namespace 未注册、lawyer-tools
 *     未升级、非 loopback 连接）时的回退——三个内置入口全启用，保证
 *     M1~M3 行为零回归
 *   - normalizeEntries：语义校验与防御性过滤（builtin id 必须已知、
 *     custom 必有 label/skill、去重；脏数据丢弃而非报错）
 *
 * 注意：lawyer-sidebar 有一份等价副本（client bundle 互相独立，不能跨
 * 插件 import）；Host 侧 schema 默认值在 lawyer-tools/src/index.ts。
 * 三处修改需同步。
 */

/** 内置入口 id（右侧栏按它映射到既有三个悬浮窗表单）。 */
export const BUILTIN_ENTRY_IDS = ['contract-review', 'case-analysis', 'doc-generation'] as const

/** 内置入口 id 的字面量类型。 */
export type BuiltinEntryId = typeof BUILTIN_ENTRY_IDS[number]

/** 内置入口展示信息（label + 图标语义由 lawyer-sidebar 的映射表负责）。 */
export const BUILTIN_ENTRY_META: Readonly<Record<BuiltinEntryId, { label: string; description: string }>> = {
  'contract-review': {
    label: '合同审核',
    description: '上传合同，输出审核意见与修订留痕稿',
  },
  'case-analysis': {
    label: '案件分析',
    description: '事实梳理 / 争议焦点 / 证据审查 / 风险评估',
  },
  'doc-generation': {
    label: '案件文书生成',
    description: '起诉状 / 答辩状 / 代理词 / 法律意见书',
  },
}

/** 内置入口条目（label 等展示信息由 BUILTIN_ENTRY_META 提供，不落盘）。 */
export interface BuiltinLawyerEntry {
  readonly kind: 'builtin'
  readonly id: BuiltinEntryId
}

/** MCP 执行偏好（写进注入指令；MCP 工具本身由 lawyer preset 提供会话能力）。 */
export interface McpPreference {
  /** none=不指定；yuandian=元典·法规检索（lawyer preset 内置）；custom=自定义说明。 */
  readonly preset: 'none' | 'yuandian' | 'custom'
  /** preset=custom 时的偏好说明（如指定其它 MCP 工具的用法要求）。 */
  readonly note?: string
}

// ── 表单字段（对齐 dsh-plugin-task-panel 的六种字段类型）───────────────────
//
// 自定义功能从「名称 + 技能 + 一段自由文本」升级为配置驱动的一条入口：
// 提示词模板 template 里以 {{字段 id}} 引用本次表单的取值，发起时渲染成
// 一条完整指令。字段模型与 task-panel 的 shared/config.ts 同构，便于两边
// 配置互换理解。

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

/** 字段类型的中文展示名（配置界面用）。 */
export const FIELD_TYPE_LABELS: Readonly<Record<FieldType, string>> = {
  text: '单行文本',
  textarea: '多行文本',
  select: '下拉选择',
  radio: '单选',
  checkbox: '多选',
  files: '文件/材料',
}

/** 需要填选项的字段类型（无选项则该字段无法取值）。 */
export const OPTIONAL_TYPES: readonly FieldType[] = ['select', 'radio', 'checkbox']

/** 子代理分派方案（复用三个内置入口的口径，或本次不用子代理）。 */
export type SubagentPlanId = 'contractReview' | 'caseAnalysis' | 'docGeneration' | 'none'

/** 子代理方案的展示名（配置界面下拉）。 */
export const SUBAGENT_PLAN_LABELS: Readonly<Record<SubagentPlanId, string>> = {
  contractReview: '合同审核口径（主体授权 / 法规效力 / 类案 / 行业监管）',
  caseAnalysis: '案件分析口径（请求权基础 / 类案 / 程序风险 / 对方主体）',
  docGeneration: '文书生成口径（法条核验 / 类案要旨 / 对方主体）',
  none: '不使用子代理（全部在主会话完成）',
}

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
  /** 入口显示名（必填）。 */
  readonly label: string
  /** 主技能名（必填，小写 kebab-case，指令以 /skill 手势开头）。 */
  readonly skill: string
  /** 卡片简述（可选，第二行；留空时侧栏回退显示 /skill）。 */
  readonly hint?: string
  /** 卡片图标名（见 lawyer-sidebar 的图标表；缺省 spark）。 */
  readonly icon?: string
  /** 入口说明（可选，悬浮提示与指令共用）。 */
  readonly description?: string
  /** 主要功能 / 任务目标（可选，写进注入指令：这个功能是干什么的）。 */
  readonly purpose?: string
  /** 附加技能（可选，随指令一并以 /name 手势注入）。 */
  readonly extraSkills?: readonly string[]
  /** 目标 agent preset（缺省 lawyer；空串表示不切换）。 */
  readonly agentPreset?: string
  /** 提示词模板（{{字段 id}} 引用表单取值；留空则按功能定位拼装）。 */
  readonly template?: string
  /** 发起表单的字段定义（按序渲染）。 */
  readonly fields?: readonly CustomEntryField[]
  /** 法律事项绑定（存在即启用 claude-for-legal-ZH 的三层调用规程）。 */
  readonly legal?: LegalTaskConfig
  /** MCP 执行偏好（可选）。 */
  readonly mcp?: McpPreference
}

/** 一条功能入口（判别联合：kind 收窄）。 */
export type LawyerEntry = BuiltinLawyerEntry | CustomLawyerEntry

/** lawyer-workbench 分节值。 */
export interface LawyerConfig {
  /** 首启向导是否已完成（user 层 presence 即“已完成”标记）。 */
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
}

/** 配置通道不可用时的回退：三内置入口全启用（M1~M3 零回归基线）。 */
export const FALLBACK_ENTRIES: readonly LawyerEntry[] = BUILTIN_ENTRY_IDS.map(id => ({ kind: 'builtin', id }) as BuiltinLawyerEntry)

/** 技能名规范（与 dsh-skill 的 isSkillName 一致）：小写 kebab-case。 */
const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** 生成自定义入口的唯一 id。 */
export function generateCustomEntryId(): string {
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
}

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
 * select / radio / checkbox 无选项时该字段无法取值，一并丢弃。
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

/**
 * 规范化字段列表；id 重复保留首个，全部非法时返回 undefined（视同未配置）。
 * @param raw - 入口的 fields 原始值。
 */
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

/**
 * 规范化法律事项绑定；缺 domain/adapter 时返回 undefined（即非法律功能）。
 * 领域技能名按 kebab-case 过滤（与 dsh 技能名同源规范）。
 * @param raw - 入口的 legal 原始值。
 */
function normalizeLegal(raw: unknown): LegalTaskConfig | undefined {
  if (!isPlainObject(raw)) return undefined
  const domain = nonEmptyString(raw.domain)
  const adapter = nonEmptyString(raw.adapter)
  if (domain === undefined || adapter === undefined) return undefined
  const subagent = typeof raw.subagent === 'string'
    && (Object.keys(SUBAGENT_PLAN_LABELS) as string[]).includes(raw.subagent)
    ? raw.subagent as SubagentPlanId
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
 * 结果可为空数组（用户合法地关闭了所有入口）。
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

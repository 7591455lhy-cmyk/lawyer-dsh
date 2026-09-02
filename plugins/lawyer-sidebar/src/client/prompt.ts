/**
 * 入口指令组装（M2.6 技能配置；M3 增加案件分析与文书生成；M7 接入
 * claude-for-legal-ZH 的三层内部调用规程）。
 *
 * 表单数据组装为一条用户指令。手势 token 动态化：技能启用时附
 * `/name`（tool-skill 在 pre-step 把每个命中技能的全文强制注入）。
 * 合同审核的技能配置段明确各开关语义，未启用项覆盖技能默认流程。
 *
 * M7 起每个入口的指令除任务参数外，还携带 claude-for-legal-ZH 定义的
 * 内部调用规程（技能与插件 / MCP / 子代理 三层 + 法律输出规则），
 * 由 legalZh.ts 统一生成，三个入口共用同一套协议文本。
 *
 * 注意：手势 token 必须前后留白（独立成词），否则手势正则不匹配。
 */
import {
  LEGAL_DOMAINS,
  SUBAGENT_PLANS,
  legalOutputLines,
  legalTaskBinding,
  mcpLayerLines,
  profileInterviewLines,
  severityScaleNote,
  skillLayerLines,
  subagentDisabledLines,
  subagentLayerLines,
  type LegalDomainBinding,
  type ProfileContext,
  type ProfileInterviewMode,
} from './legalZh.ts'
// 只取类型：值导入会把 FilePicker.tsx（含 react 与 DOM 依赖）拖进指令
// 组装层，冒烟脚本在 node 下 bundle 时会失败——材料层与视图层在此解耦。
import type { FilePickerValue, PickedImage } from './FilePicker.tsx'
import type { ContractReviewRequest } from './ContractReviewDialog.tsx'
import type { CaseAnalysisRequest } from './CaseAnalysisDialog.tsx'
import type { DocGenerationRequest } from './DocGenerationDialog.tsx'
import type { CustomEntryRequest } from './CustomEntryDialog.tsx'
import type { CustomEntryField, CustomLawyerEntry, LegalTaskConfig } from './config.ts'

/** L2 冷启动访谈的发起请求（画像面板「完整访谈」Tab 的产物）。 */
export interface ProfileInterviewRequest {
  /** 领域目录名（如 commercial-legal）。 */
  readonly domain: string
  /** dsh adapter 技能名（指令以 /<adapter> 手势开头）。 */
  readonly adapter: string
  /** 画像 canonical 绝对路径（Host 决定，硬覆盖技能原文路径）。 */
  readonly profilePath: string
  /** 画像是否已存在（决定全新访谈还是 --redo 语义）。 */
  readonly profileExists: boolean
  /** 访谈模式（对齐 cold-start-interview 的 argument-hint）。 */
  readonly mode: ProfileInterviewMode
}

/** 严格程度语义（写进指令，模型按此调节审核深度）。 */
const STRICTNESS_SEMANTICS: Readonly<Record<ContractReviewRequest['strictness'], string>> = {
  宽松: '宽松——聚焦高风险问题与核心商业条款，低风险瑕疵可从略',
  常规: '常规——按标准框架全面审核',
  严格: '严格——逐条深挖，一切可疑条款均列明，法规核查全覆盖',
}

/** 案件分析六模块（键 → 报告章节名，与 SKILL.md 流程对应）。 */
const FOCUS_LABELS: Readonly<Record<CaseAnalysisRequest['focus'][number], string>> = {
  facts: '事实梳理',
  relations: '法律关系识别',
  issues: '争议焦点归纳',
  evidence: '证据审查',
  claims: '请求权基础分析',
  risk: '诉讼风险评估',
}

/**
 * 把 claude-for-legal-ZH 的三层调用规程 + 法律输出规则追加到指令行。
 * @param lines - 指令行（原地追加）。
 * @param module - 入口模块。
 * @param localSkill - 本地产出技能名（未启用时 undefined）。
 * @param profile - Host 查到的画像状态；缺省时画像行走路径兜底文案。
 */
function appendLegalProtocol(
  lines: string[],
  module: 'contractReview' | 'caseAnalysis' | 'docGeneration',
  localSkill: string | undefined,
  profile?: ProfileContext,
): void {
  const binding = LEGAL_DOMAINS[module]
  lines.push('')
  lines.push('【内部调用规程 · claude-for-legal-ZH 中国法适配版】')
  lines.push(...skillLayerLines(binding, localSkill, profile))
  lines.push(...mcpLayerLines())
  lines.push(...subagentLayerLines(SUBAGENT_PLANS[module]))
  lines.push(...legalOutputLines())
}

/**
 * 把 L2 冷启动访谈组装为入口指令（M8）。
 *
 * 与任务型指令不同：它不带材料、不带三层检索规程——访谈是一次性配置对话，
 * 模型只需 adapter 手势 + 访谈执行要求。
 * @param request - 访谈请求（领域、adapter、画像路径、是否存在、模式）。
 * @returns 指令文本。
 */
export function buildProfileInterviewPrompt(request: ProfileInterviewRequest): string {
  const binding: LegalDomainBinding = {
    adapter: request.adapter,
    domain: request.domain,
    // 访谈只走 cold-start-interview 这一条脚本，不预置其他原始技能。
    primarySkills: [],
    routedSkills: [],
    references: [],
    profilePath: request.profilePath,
  }
  return [
    `请开始实务画像配置 /${request.adapter}`,
    '',
    `目标领域：${request.domain}`,
    ...profileInterviewLines(binding, {
      profilePath: request.profilePath,
      profileExists: request.profileExists,
      mode: request.mode,
    }),
  ].join('\n')
}

/**
 * 自定义功能的三层调用规程（与内置入口同构，绑定来自用户的法律事项配置）。
 *
 * 子代理方案为 none 时输出关闭形态（不等价于省略：要明确告知模型不要
 * 分派，避免它按“检索不足就升级”的默认倾向自行 spawn）。
 * @param lines - 指令行（原地追加）。
 * @param legal - 入口的法律事项配置。
 * @param localSkill - 本工作台的本地技能名（主技能）。
 */
function appendLegalProtocolForCustom(
  lines: string[],
  legal: LegalTaskConfig,
  localSkill: string,
): void {
  lines.push('')
  lines.push('【内部调用规程 · claude-for-legal-ZH 中国法适配版】')
  lines.push(...skillLayerLines(legalTaskBinding(legal), localSkill))
  lines.push(...mcpLayerLines())
  if (legal.subagent === 'none') lines.push(...subagentDisabledLines())
  else lines.push(...subagentLayerLines(SUBAGENT_PLANS[legal.subagent]))
  lines.push(...legalOutputLines())
}

/** 按路径是否含空白选择 @ 引用语法（对齐 dsh formatFileMention）。 */
function fileMention(path: string): string {
  return /\s/u.test(path) ? `@"${path}"` : `@${path}`
}

/** 材料集合的子集形态（三个 Request 都含 paths/images/texts）。 */
type MaterialLike = Pick<FilePickerValue, 'paths' | 'images' | 'texts'>

/**
 * 追加材料清单块（@ 引用 / 目录引用 / 内嵌文本 / 图片附件，三入口通用）。
 * paths 中以 "/" 结尾的条目是目录引用（FilePicker 文件夹输入的产物）：
 * dsh 的 @ 提及是纯文本语义（模型按系统提示用文件工具读取），目录条目
 * 附带"先列目录再逐个读取"的指令。
 */
function appendMaterialLines(
  lines: string[],
  material: MaterialLike,
  header: string,
  emptyHint: string,
): void {
  lines.push(`${header}：`)
  let hasFile = false
  for (const path of material.paths) {
    const trimmed = path.trim()
    if (trimmed === '') continue
    hasFile = true
    if (trimmed.endsWith('/')) {
      lines.push(`- ${fileMention(trimmed)}（材料目录——请先用文件列表工具列出该目录下的全部文件，再逐个读取后使用，勿遗漏）`)
    } else {
      lines.push(`- ${fileMention(trimmed)}（用户明确引用的文件，请先用文件读取工具读取全文再分析）`)
    }
  }
  for (const text of material.texts) {
    hasFile = true
    lines.push(`- 材料文本（来自 ${text.name}）：`)
    lines.push('```')
    lines.push(text.content)
    lines.push('```')
  }
  if (material.images.length > 0) {
    hasFile = true
    lines.push(`- 材料扫描件/拍照图片 ${material.images.length} 张（随本消息附上，请按顺序通读）`)
  }
  if (!hasFile) {
    lines.push(`-（未提供，${emptyHint}）`)
  }
}

/** 技能配置段：各开关的指令语义（未启用 = 覆盖技能默认流程）。 */
function skillConfigLines(request: ContractReviewRequest): string[] {
  const { review, preprocess, output, extraSkills } = request.skills
  const lines = ['技能配置：']
  lines.push(`- ${LEGAL_DOMAINS.contractReview.adapter}：始终启用（claude-for-legal-ZH 的领域路由 adapter，负责把本任务路由到 commercial-legal 的工作流与质量门禁）`)
  lines.push(review
    ? '- contract-review：启用（已随指令加载全文，按其完整流程执行）'
    : '- contract-review：未启用——不要加载该技能，直接按本指令的要求与通用法律能力完成审核')
  lines.push(preprocess
    ? '- pdfkit-py：启用（PDF 源走其转换链：文字层转 docx、扫描件渲染转录）'
    : '- pdfkit-py：未启用——PDF 源直接用文件读取工具读取，不做 docx 转换与渲染转录')
  lines.push(output
    ? '- docx-tracked-changes：启用（按流程产出修订留痕审阅稿 docx）'
    : '- docx-tracked-changes：未启用——本次不生成修订留痕审阅稿（覆盖技能默认的双文件要求，仅交付审核报告）')
  if (extraSkills.length > 0) {
    lines.push(`- 附加技能（已随指令注入全文）：${extraSkills.map(name => `/${name}`).join('、')}——在本任务中按需遵循其指引`)
  }
  return lines
}

/**
 * 把合同审核表单数据组装为入口指令文本。
 * @param request - 悬浮窗表单提交的数据。
 * @param profile - Host 查到的商事合同画像状态（缺省时画像行走路径兜底）。
 * @returns 指令文本（图片以附件 part 另发，不在文本内）。
 */
export function buildContractReviewPrompt(
  request: ContractReviewRequest,
  profile?: ProfileContext,
): string {
  const { adapter } = LEGAL_DOMAINS.contractReview
  const gestures = [
    adapter,
    ...request.skills.review ? ['contract-review'] : [],
    ...request.skills.extraSkills,
  ]
  const lines: string[] = [`请开始合同审核 ${gestures.map(name => `/${name}`).join(' ')}`, '']
  lines.push(`我方立场：${request.stance}`)
  lines.push(`审核严格程度：${STRICTNESS_SEMANTICS[request.strictness]}`)
  lines.push(`- ${severityScaleNote(request.strictness)}`)
  lines.push(`修订人署名：${request.reviewerName.trim() !== '' ? request.reviewerName.trim() : '律师工作台'}（产出修订留痕 docx 时的修订人）`)
  lines.push('')
  lines.push(...skillConfigLines(request))
  lines.push('')
  appendMaterialLines(lines, request, '合同文件', '请先向用户索取合同文本')
  appendLegalProtocol(
    lines,
    'contractReview',
    request.skills.review ? 'contract-review' : undefined,
    profile,
  )
  return lines.join('\n')
}

/**
 * 把案件分析表单数据组装为入口指令文本。
 * @param request - 悬浮窗表单提交的数据。
 * @param profile - Host 查到的诉讼仲裁画像状态（缺省时画像行走路径兜底）。
 * @returns 指令文本（图片以附件 part 另发，不在文本内）。
 */
export function buildCaseAnalysisPrompt(
  request: CaseAnalysisRequest,
  profile?: ProfileContext,
): string {
  const { adapter, routedSkills } = LEGAL_DOMAINS.caseAnalysis
  const lines: string[] = [`请开始案件分析 /${adapter} /case-analysis`, '']
  lines.push(`我方立场：${request.stance}`)
  const labels = request.focus.map(key => FOCUS_LABELS[key])
  lines.push(labels.length === Object.keys(FOCUS_LABELS).length
    ? '分析侧重：全模块完整分析'
    : `分析侧重：${labels.join('、')}${labels.length === 0
      ? '（未选择——动笔前先向用户确认分析范围）'
      : '（未列出的模块在报告中从略，保留编号一句话带过）'}`)
  lines.push(`- 按侧重模块路由原技能：事实梳理用 litigation-legal/skills/chronology/SKILL.md，证据审查用 litigation-legal/skills/privilege-log-review/SKILL.md，请求权基础分析用 litigation-legal/skills/claim-chart/SKILL.md（均属 adapter 已列的候选技能：${routedSkills.join('、')}）。`)
  lines.push('- 风险评价按 litigation-legal/CLAUDE.md 的六维度方法论逐项完成（风险定性 / 风险敞口 / 发生概率 / 可规避性 / 商业权衡 / 紧迫性），并对每个重要风险点给出「法律风险 + 商业或操作摩擦」双轴评级。')
  lines.push('')
  appendMaterialLines(lines, request, '案件材料', '请先向用户索取案件材料')
  appendLegalProtocol(lines, 'caseAnalysis', 'case-analysis', profile)
  return lines.join('\n')
}

/**
 * 把文书生成表单数据组装为入口指令文本。
 * @param request - 悬浮窗表单提交的数据。
 * @param profile - Host 查到的诉讼仲裁画像状态（缺省时画像行走路径兜底）。
 * @returns 指令文本（图片以附件 part 另发，不在文本内）。
 */
export function buildDocGenerationPrompt(
  request: DocGenerationRequest,
  profile?: ProfileContext,
): string {
  const { adapter, domain } = LEGAL_DOMAINS.docGeneration
  const lines: string[] = [`请开始文书生成 /${adapter} /doc-generation`, '']
  lines.push(`文书类型：${request.docType}`)
  lines.push(`我方当事人身份：${request.partyRole}`)
  lines.push(`补充说明：${request.notes !== '' ? request.notes : '无'}`)
  lines.push('')
  lines.push(`- 主技能 ${domain}/skills/brief-section-drafter/SKILL.md（按律所/团队格式起草法律文书章节）；律师函类走 ${domain}/skills/demand-draft/SKILL.md，起草前背景收集走 ${domain}/skills/demand-intake/SKILL.md。`)
  lines.push('- 五组内容分离纪律（litigation-legal/CLAUDE.md 强制）：诉讼文书编辑时必须区分「证据列举 / 质证意见 / 证据认定 / 查明事实 / 争议焦点分析」五组内容边界，不可混淆；证据列举只记录当事人主张，不改写。')
  lines.push('')
  appendMaterialLines(lines, request, '案件材料', '请先向用户索取案件背景材料')
  appendLegalProtocol(lines, 'docGeneration', 'doc-generation', profile)
  return lines.join('\n')
}

// ── 自定义入口：模板渲染 + 字段值 ──────────────────────────────────────────
//
// M8 起自定义入口按 dsh-plugin-task-panel 的形态表达：提示词模板 template
// 里以 `{{字段 id}}` 引用本次表单的取值，发起时渲染成一条完整指令。未配置
// 模板的旧入口走兼容分支（任务目标 + 各字段的「标签：值」），行为不变。

/** 单个字段的取值形态。 */
export type CustomFieldValue = string | readonly string[] | FilePickerValue

/** 一次提交的全部字段值（键为字段 id）。 */
export type CustomFieldValues = Readonly<Record<string, CustomFieldValue>>

/**
 * 字段值是否为文件/材料值。
 *
 * 独立成谓词而非内联判断：TS 的 Array.isArray 守卫无法收窄 readonly
 * string[]，else 分支会保留原类型。
 */
export function isFilesValue(value: CustomFieldValue): value is FilePickerValue {
  return typeof value !== 'string' && !Array.isArray(value)
}

/** 空材料集合（files 字段的初始值；不 import 视图层常量以保持本层纯净）。 */
const EMPTY_MATERIAL: FilePickerValue = { paths: [], images: [], texts: [] }

/** 材料集合是否为空。 */
function isEmptyMaterial(material: MaterialLike): boolean {
  return material.paths.length === 0 && material.images.length === 0 && material.texts.length === 0
}

/**
 * 入口字段的初始值（按类型取 default：files → 空集合，checkbox → 逗号
 * 分隔的多个选项，select/radio → 命中 default 否则首项）。
 * @param fields - 入口的字段定义。
 * @returns 字段 id → 初始值。
 */
export function initialValues(fields: readonly CustomEntryField[]): CustomFieldValues {
  const values: Record<string, CustomFieldValue> = {}
  for (const field of fields) {
    if (field.type === 'files') {
      values[field.id] = EMPTY_MATERIAL
    } else if (field.type === 'checkbox') {
      const options = field.options ?? []
      values[field.id] = (field.default ?? '')
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '' && options.includes(item))
    } else if (field.type === 'select' || field.type === 'radio') {
      const options = field.options ?? []
      const preferred = field.default ?? ''
      values[field.id] = options.includes(preferred) ? preferred : options[0] ?? ''
    } else {
      values[field.id] = field.default ?? ''
    }
  }
  return values
}

/** 单个字段值的文本形态（模板占位符替换用）。 */
function valueToText(value: CustomFieldValue, header: string): string {
  if (typeof value === 'string') return value
  if (!isFilesValue(value)) return value.join('、')
  if (isEmptyMaterial(value)) return ''
  const lines: string[] = []
  appendMaterialLines(lines, value, header, '未提供')
  return lines.join('\n')
}

/**
 * 渲染模板：把 `{{fieldId}}` 替换为字段值。
 * 未匹配到字段的占位符原样保留（提示模板写错，而不是静默吞掉）。
 * @param template - 入口模板。
 * @param values - 本次表单值。
 * @param headerOf - 字段 id → 材料块标题。
 * @returns 渲染后的文本。
 */
export function renderTemplate(
  template: string,
  values: CustomFieldValues,
  headerOf: (fieldId: string) => string,
): string {
  return template.replace(/\{\{\s*([^}\s]+)\s*\}\}/gu, (match, rawKey: string) => {
    const value = values[rawKey]
    if (value === undefined) return match
    return valueToText(value, headerOf(rawKey))
  })
}

/**
 * 未配置字段的入口使用的隐式字段（旧行为的「补充说明」）。
 * 有它才能保证「无模板 + 无字段」的旧入口指令形态不变。
 */
export const IMPLICIT_INSTRUCTION_FIELD: CustomEntryField = {
  id: 'instruction',
  label: '补充说明',
  type: 'textarea',
  placeholder: '本次任务的具体要求、背景或注意事项（可选）',
}

/**
 * 入口的有效字段列表：未配置字段时退化为隐式的「补充说明」字段。
 * 指令组装与发起表单共用它，保证两边渲染的字段完全一致。
 * @param entry - 入口配置。
 */
export function effectiveFields(entry: CustomLawyerEntry): readonly CustomEntryField[] {
  return entry.fields !== undefined && entry.fields.length > 0
    ? entry.fields
    : [IMPLICIT_INSTRUCTION_FIELD]
}

/**
 * 无模板时的默认指令正文：各非材料字段输出「标签：值」。
 * 旧入口（未配置字段）走隐式字段，因此输出与旧版「补充说明：xxx」一致
 * ——配置驱动与旧行为同一条代码路径。
 * @param fields - 有效字段列表。
 * @param values - 本次表单值。
 * @returns 指令行数组。
 */
function fieldSummaryLines(
  fields: readonly CustomEntryField[],
  values: CustomFieldValues,
): string[] {
  const lines: string[] = []
  for (const field of fields) {
    if (field.type === 'files') continue
    const value = values[field.id]
    const text = value === undefined ? '' : valueToText(value, field.label)
    lines.push(`${field.label}：${text.trim() === '' ? '（未提供）' : text}`)
  }
  return lines
}

/**
 * 把自定义入口表单数据组装为入口指令文本（M8：模板 + 字段渲染）。
 *
 * 手势 token 必须前后留白（独立成词）：法律 adapter（开启法律事项时）→
 * 主技能 /skill → 附加技能 /extra 依次排列。材料块：模板里写了
 * `{{字段名}}` 就地展开；未引用的 files 字段追加在指令末尾，不丢材料。
 * 开启法律事项时追加与内置入口同构的三层调用规程与法律输出规则。
 * @param request - 悬浮窗表单提交的数据（含入口配置）。
 * @returns 指令文本（图片以附件 part 另发，不在文本内）。
 */
export function buildCustomEntryPrompt(request: CustomEntryRequest): string {
  const { entry } = request
  const gestures = [
    ...entry.legal !== undefined ? [entry.legal.adapter] : [],
    entry.skill,
    ...entry.extraSkills ?? [],
  ].map(name => `/${name}`)
  const lines: string[] = [`请开始${entry.label} ${gestures.join(' ')}`, '']
  const template = entry.template?.trim() ?? ''
  const fields = effectiveFields(entry)
  const headerOf = (fieldId: string): string =>
    fields.find(field => field.id === fieldId)?.label ?? '相关材料'

  if (template !== '') {
    lines.push(renderTemplate(template, request.values, headerOf))
  } else {
    const purpose = entry.purpose !== undefined && entry.purpose !== '' ? entry.purpose : entry.description
    lines.push(purpose !== undefined && purpose !== ''
      ? `任务目标：${purpose}`
      : `任务目标：请按 /${entry.skill} 技能的流程完成${entry.label}任务`)
    if (entry.description !== undefined && entry.description !== '' && purpose !== entry.description) {
      lines.push(`入口简述：${entry.description}`)
    }
    if (entry.mcp !== undefined) {
      if (entry.mcp.preset === 'yuandian') {
        lines.push('MCP 工具偏好：优先使用元典法规检索（yuandian）MCP 工具核查法规条文与案例')
      } else if (entry.mcp.preset === 'custom' && entry.mcp.note !== undefined && entry.mcp.note !== '') {
        lines.push(`MCP 工具偏好：${entry.mcp.note}`)
      }
    }
    lines.push(...fieldSummaryLines(fields, request.values))
  }
  lines.push('')

  // 模板未显式引用的文件字段：材料块追加在末尾，避免材料丢失。
  for (const field of fields) {
    if (field.type !== 'files') continue
    if (template.includes(`{{${field.id}}}`)) continue
    const value = request.values[field.id]
    if (value === undefined || !isFilesValue(value) || isEmptyMaterial(value)) continue
    appendMaterialLines(lines, value, field.label, '请先向用户索取相关材料')
    lines.push('')
  }

  if (entry.legal !== undefined) appendLegalProtocolForCustom(lines, entry.legal, entry.skill)
  return lines.join('\n')
}

/**
 * 收集本次提交的全部图片附件（按字段顺序；以 image part 另发，不在文本内）。
 * @param values - 本次表单值。
 * @returns 全部 files 字段里的图片。
 */
export function collectImages(values: CustomFieldValues): readonly PickedImage[] {
  const images: PickedImage[] = []
  for (const value of Object.values(values)) {
    if (!isFilesValue(value)) continue
    for (const image of value.images) images.push(image)
  }
  return images
}

/**
 * 演示回放指令（M6.3）：演示模式下不重新执行任务，而是让模型把预录的
 * 真实运行成果**原样作为自己的答复输出**——成果以 AI 消息形态出现在
 * 对话框（与真实运行的呈现完全一致），末尾的成果文件路径交给聊天区
 * 的路径点击支持（client/index.ts）直接打开。预录成果由真实 API 运行
 * 后固化在 demoArtifacts.ts。
 * @param title - 演示场景标题（如"合同审核"）。
 * @param artifactMarkdown - 预录成果全文（Markdown，含成果文件路径行）。
 * @returns 指令文本。
 */
export function buildDemoReplayPrompt(title: string, artifactMarkdown: string): string {
  return [
    `演示回放：${title}`,
    '',
    '以下为系统预录的演示运行成果（真实 API 运行固化数据，本次为回放模式，无需重新执行）。请把它作为你的最终答复**原样输出**：',
    '- 不添加任何开场白、结语或解释；',
    '- 不重新分析、不调用任何工具；',
    '- 保留全部标题、列表与文件路径；',
    '- 文件路径行保留原样（用户可点击打开）。',
    '',
    '---预录成果开始---',
    '',
    artifactMarkdown,
    '',
    '---预录成果结束---',
  ].join('\n')
}

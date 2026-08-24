/**
 * 入口指令组装（M2.6 技能配置；M3 增加案件分析与文书生成）。
 *
 * 表单数据组装为一条用户指令。手势 token 动态化：技能启用时附
 * `/name`（tool-skill 在 pre-step 把每个命中技能的全文强制注入）。
 * 合同审核的技能配置段明确各开关语义，未启用项覆盖技能默认流程。
 *
 * 注意：手势 token 必须前后留白（独立成词），否则手势正则不匹配。
 */
import type { ContractReviewRequest } from './ContractReviewDialog.tsx'
import type { CaseAnalysisRequest } from './CaseAnalysisDialog.tsx'
import type { DocGenerationRequest } from './DocGenerationDialog.tsx'
import type { FilePickerValue } from './FilePicker.tsx'

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

/** 按路径是否含空白选择 @ 引用语法（对齐 dsh formatFileMention）。 */
function fileMention(path: string): string {
  return /\s/u.test(path) ? `@"${path}"` : `@${path}`
}

/** 材料集合的子集形态（三个 Request 都含 paths/images/texts）。 */
type MaterialLike = Pick<FilePickerValue, 'paths' | 'images' | 'texts'>

/** 追加材料清单块（@ 引用 / 内嵌文本 / 图片附件，三入口通用）。 */
function appendMaterialLines(
  lines: string[],
  material: MaterialLike,
  header: string,
  emptyHint: string,
): void {
  lines.push(`${header}：`)
  let hasFile = false
  for (const path of material.paths) {
    if (path.trim() === '') continue
    hasFile = true
    lines.push(`- ${fileMention(path.trim())}（用户明确引用的文件，请先用文件读取工具读取全文再分析）`)
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
 * @returns 指令文本（图片以附件 part 另发，不在文本内）。
 */
export function buildContractReviewPrompt(request: ContractReviewRequest): string {
  const gestures = [
    ...request.skills.review ? ['contract-review'] : [],
    ...request.skills.extraSkills,
  ]
  const lines: string[] = [
    gestures.length > 0
      ? `请开始合同审核 ${gestures.map(name => `/${name}`).join(' ')}`
      : '请开始合同审核',
    '',
  ]
  lines.push(`我方立场：${request.stance}`)
  lines.push(`审核严格程度：${STRICTNESS_SEMANTICS[request.strictness]}`)
  lines.push(`修订人署名：${request.reviewerName.trim() !== '' ? request.reviewerName.trim() : '律师工作台'}（产出修订留痕 docx 时的修订人）`)
  lines.push('')
  lines.push(...skillConfigLines(request))
  lines.push('')
  appendMaterialLines(lines, request, '合同文件', '请先向用户索取合同文本')
  return lines.join('\n')
}

/**
 * 把案件分析表单数据组装为入口指令文本。
 * @param request - 悬浮窗表单提交的数据。
 * @returns 指令文本（图片以附件 part 另发，不在文本内）。
 */
export function buildCaseAnalysisPrompt(request: CaseAnalysisRequest): string {
  const lines: string[] = ['请开始案件分析 /case-analysis', '']
  lines.push(`我方立场：${request.stance}`)
  const labels = request.focus.map(key => FOCUS_LABELS[key])
  lines.push(labels.length === Object.keys(FOCUS_LABELS).length
    ? '分析侧重：全模块完整分析'
    : `分析侧重：${labels.join('、')}${labels.length === 0
      ? '（未选择——动笔前先向用户确认分析范围）'
      : '（未列出的模块在报告中从略，保留编号一句话带过）'}`)
  lines.push('')
  appendMaterialLines(lines, request, '案件材料', '请先向用户索取案件材料')
  return lines.join('\n')
}

/**
 * 把文书生成表单数据组装为入口指令文本。
 * @param request - 悬浮窗表单提交的数据。
 * @returns 指令文本（图片以附件 part 另发，不在文本内）。
 */
export function buildDocGenerationPrompt(request: DocGenerationRequest): string {
  const lines: string[] = ['请开始文书生成 /doc-generation', '']
  lines.push(`文书类型：${request.docType}`)
  lines.push(`我方当事人身份：${request.partyRole}`)
  lines.push(`补充说明：${request.notes !== '' ? request.notes : '无'}`)
  lines.push('')
  appendMaterialLines(lines, request, '案件材料', '请先向用户索取案件背景材料')
  return lines.join('\n')
}

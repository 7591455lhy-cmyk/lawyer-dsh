/**
 * 表单值 ↔ 画像 Markdown 的双向转换（M8）。
 *
 * 画像是一份给人读的散文式 Markdown（仓库要求「不要写 YAML，是带偶尔表格
 * 的散文」），所以这里不引入任何结构化序列化——渲染出的每一行都是画像里
 * 真实可见、可直接编辑的文本；解析也只是按行标题把值读回来。
 *
 * 未填写的字段落 `[PLACEHOLDER]`：这与仓库模板的占位符同形，Host 侧
 * status.configured 按占位符数是否为 0 判定「是否已配置」，于是「用户留空
 * → 按通用标准输出」这条规则在 Host、指令、画像三处语义一致，不需要
 * 额外的状态同步。
 *
 * L2 访谈由模型自行撰写画像（格式由它按模板发挥），解析时可能匹配不到
 * 本文件的行标题——此时面板默认切到 L3 原文直编，不丢内容。
 */
import type { ProfileField } from './profileFields.ts'

/** 占位符标记（与仓库模板同形）。 */
export const PLACEHOLDER = '[PLACEHOLDER]'

/** 快速配置产物的识别行。 */
const GENERATED_MARKER_QUICK = '由摸鱼工作站「实务画像 · 快速配置」于'

/** 完整问卷产物的识别行。 */
const GENERATED_MARKER_FULL = '由摸鱼工作站「实务画像 · 完整问卷」于'

/**
 * 两种表单来源共有的识别串（解析时据此判断是否表单产物）。
 *
 * 只要这一串命中就说明是本工作台的表单产物（L1 快速配置或 L2 完整问卷），
 * 于是面板默认停在表单 Tab 而不是 L3——两种产物都是可解析回填的扁平结构。
 */
const GENERATED_MARKER = '由摸鱼工作站「实务画像 · '

/** 一个字段在画像里的行标题形态：`**<label>：** <value>`。 */
function fieldLine(label: string, value: string): string {
  return `**${label}：** ${value}`
}

/** 转义正则元字符（字段 label 含中文括号与斜杠）。 */
function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** 取当前日期（YYYY-MM-DD，本地时区）。 */
function today(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

/**
 * 把表单取值渲染为画像 Markdown 全文。
 *
 * 分组顺序取字段表里的出现顺序（保持表单与画像同序，便于对照编辑）；
 * 空值落 `[PLACEHOLDER]`，后续可在 L3 或由模型在访谈中补上。
 * @param title - 画像标题（如「商事合同实务画像」）。
 * @param fields - 该领域的字段定义。
 * @param values - 字段 id → 取值（缺失或空串视为未填）。
 * @param source - 产物来源（快速配置或完整问卷），只影响识别行的措辞。
 * @returns 画像 Markdown 全文。
 */
export function renderProfileMarkdown(
  title: string,
  fields: readonly ProfileField[],
  values: Readonly<Record<string, string>>,
  source: 'quick' | 'full' = 'quick',
): string {
  const groups: string[] = []
  const linesByGroup = new Map<string, string[]>()
  for (const field of fields) {
    let bucket = linesByGroup.get(field.group)
    if (bucket === undefined) {
      bucket = []
      linesByGroup.set(field.group, bucket)
      groups.push(field.group)
    }
    const raw = values[field.id]?.trim() ?? ''
    bucket.push(fieldLine(field.label, raw === '' ? PLACEHOLDER : raw))
  }

  const marker = source === 'full' ? GENERATED_MARKER_FULL : GENERATED_MARKER_QUICK
  const blocks = [
    `# ${title}`,
    '',
    `*${marker} ${today()} 生成。本工作台所有法律功能在动笔前都会读取它；` +
      '可随时在右侧栏「实务画像」中修改，或直接编辑本文件。*',
  ]
  for (const group of groups) {
    blocks.push('', '---', '', `## ${group}`, '')
    blocks.push(...(linesByGroup.get(group) ?? []))
  }
  return `${blocks.join('\n')}\n`
}

/**
 * 从画像正文里把表单字段的值读回来。
 *
 * 只认 `**<label>：** <value>` 这一行形态；匹配不到或值为 `[PLACEHOLDER]`
 * 时该字段留空（表单显示为空，保存时重新落占位符）。
 * @param content - 画像正文。
 * @param fields - 该领域的字段定义。
 * @returns 字段 id → 取值（仅含取到非空值的键）。
 */
export function parseProfileFields(
  content: string,
  fields: readonly ProfileField[],
): Record<string, string> {
  const values: Record<string, string> = {}
  const lines = content.split(/\r?\n/)
  for (const field of fields) {
    const pattern = new RegExp(`^\\*\\*${escapeRegExp(field.label)}：\\*\\*\\s*(.*)$`)
    for (const line of lines) {
      const matched = pattern.exec(line.trim())
      if (matched === null) continue
      const value = matched[1].trim()
      if (value !== '' && value !== PLACEHOLDER) {
        values[field.id] = value
      }
      break
    }
  }
  return values
}

/**
 * 判断画像正文是否为本工作台的表单产物（决定面板默认 Tab）。
 *
 * 快速配置与完整问卷都算——两者都是可解析回填的扁平 `**label：** value`
 * 结构。模型访谈撰写的画像格式自由，此时应默认展示 L3 原文直编而非覆盖它。
 * @param content - 画像正文。
 * @returns 是表单产物时为 true。
 */
export function isFormGenerated(content: string): boolean {
  return content.includes(GENERATED_MARKER)
}

/**
 * 统计正文里的占位符数量（与 Host 侧 status.placeholderCount 同口径）。
 * @param content - 画像正文。
 * @returns 占位符数量。
 */
export function countPlaceholders(content: string): number {
  return content.split(PLACEHOLDER).length - 1
}

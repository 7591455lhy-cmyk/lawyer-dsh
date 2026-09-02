/**
 * 实务画像的领域元数据与 L1 快速配置字段（M8）。
 *
 * 领域表的权威来源见 lawyer-wizard/src/client/legalDomains.ts（13 个领域的
 * adapter / label / skills）。两个 Client 插件的 bundle 互相独立、不能跨插件
 * import，故本文件是 sidebar 侧的副本——这是项目既有约定（config.ts 已有
 * 三处副本先例）。只需 domain / adapter / label 三个字段，不复制 skills 表。
 *
 * 字段只覆盖画像模板里的**高频项**——商事画像模板 22 处占位符、诉讼画像
 * 45 处且按角色分三条互斥路径，全量表单化既不可行，也违背仓库要求
 * （「不要写 YAML。业务领域配置是带偶尔表格的散文」）。深度捕获交给 L2
 * 对话访谈（复用仓库 cold-start-interview 脚本），兜底交给 L3 原文直编。
 *
 * 未填写的字段落 `[PLACEHOLDER]`，对应「用户留空则按通用标准输出」——
 * Host 侧 status.configured 即按占位符数是否为 0 判定。
 *
 * M8.7：完整问卷（L2）的字段表在同目录 profileFieldsFull.ts（商事与诉讼
 * 各一套「共享 + 法务专属 + 律师专属」，按执业身份分叉）。本文件保留类型
 * 定义与查询函数，选项常量从那边导入——依赖是单向的，那边只依赖本文件的
 * 类型（import type 编译后即消失），不存在运行时循环。
 */
import {
  COMMERCIAL_SETTINGS,
  FULL_FIELDS_BY_DOMAIN,
  IDENTITY_STEP,
  INHOUSE_KEYWORDS,
  LITIGATION_ROLES,
  PURCHASE_STEP,
  SALES_STEP,
  USER_ROLES,
  type ProfileRole,
} from './profileFieldsFull.ts'

/** 领域目录的画像元数据。 */
export interface ProfileDomainMeta {
  /** 领域目录名（仓库根下相对路径，唯一决定画像文件路径）。 */
  readonly domain: string
  /** dsh adapter 技能名（L2 访谈指令以 /<adapter> 手势注入）。 */
  readonly adapter: string
  /** 中文名。 */
  readonly label: string
}

/** 13 个领域（与 wizard 的 LEGAL_DOMAINS 同序、同值）。 */
export const PROFILE_DOMAINS: readonly ProfileDomainMeta[] = [
  { domain: 'commercial-legal', adapter: 'chinese-legal-commercial', label: '商事合同' },
  { domain: 'litigation-legal', adapter: 'chinese-legal-litigation', label: '诉讼仲裁' },
  { domain: 'corporate-legal', adapter: 'chinese-legal-corporate', label: '公司与并购' },
  { domain: 'employment-legal', adapter: 'chinese-legal-employment', label: '劳动用工' },
  { domain: 'ip-legal', adapter: 'chinese-legal-ip', label: '知识产权' },
  { domain: 'privacy-legal', adapter: 'chinese-legal-privacy', label: '数据合规与隐私' },
  { domain: 'product-legal', adapter: 'chinese-legal-product', label: '产品与营销合规' },
  { domain: 'regulatory-legal', adapter: 'chinese-legal-regulatory', label: '监管合规' },
  { domain: 'ai-governance-legal', adapter: 'chinese-legal-ai-governance', label: 'AI 治理' },
  { domain: 'criminal-legal', adapter: 'chinese-legal-criminal', label: '刑事辩护与合规' },
  { domain: 'law-student', adapter: 'chinese-legal-law-student', label: '法学学习与法考' },
  { domain: 'legal-clinic', adapter: 'chinese-legal-clinic', label: '法律诊所' },
  { domain: 'legal-builder-hub', adapter: 'chinese-legal-builder-hub', label: '法律技能运营' },
]

/** 常驻在列表顶部的两个常用领域（对应侧栏现有的合同审核与案件分析/文书生成）。 */
export const PRIMARY_PROFILE_DOMAINS: readonly string[] = ['commercial-legal', 'litigation-legal']

/** 一个 L1 快速配置字段。 */
export interface ProfileField {
  /** 字段 id（表单取值与 Markdown 回填的键）。 */
  readonly id: string
  /** 展示名（同时作为画像 Markdown 里的行标题，解析回填靠它定位）。 */
  readonly label: string
  /** 所属分组（渲染为一组一张浅色卡片）。 */
  readonly group: string
  readonly type: 'text' | 'textarea' | 'select'
  /** 完整问卷的分步标题（L1 字段无此属性，按步渲染）。 */
  readonly step?: string
  /** 身份归属：缺省即两版共用，inhouse/lawyer 仅出现在对应身份的问卷里。 */
  readonly role?: ProfileRole
  /** select 的选项。 */
  readonly options?: readonly string[]
  /** 占位提示（留空即落 [PLACEHOLDER]）。 */
  readonly placeholder?: string
  /** 字段说明（渲染在控件下方）。 */
  readonly hint?: string
}

/** 商事合同的快速配置字段（对应 cold-start-interview 模板的小节）。 */
const COMMERCIAL_FIELDS: readonly ProfileField[] = [
  {
    id: 'practiceSetting',
    label: '执业场景',
    group: '我们是谁',
    type: 'select',
    options: COMMERCIAL_SETTINGS,
    hint: '决定审查口径与工作成果的呈现方式',
  },
  {
    id: 'orgType',
    label: '我方主体类型',
    group: '我们是谁',
    type: 'text',
    placeholder: '如：有限责任公司',
  },
  {
    id: 'teamSize',
    label: '合同团队规模',
    group: '我们是谁',
    type: 'text',
    placeholder: '如：3 人',
  },
  {
    id: 'painPoint',
    label: '最头疼的事',
    group: '我们是谁',
    type: 'textarea',
    placeholder: '用你自己的话写，越具体越好',
  },
  {
    id: 'userRole',
    label: '使用者角色',
    group: '使用者',
    type: 'select',
    options: USER_ROLES,
    hint: '非律师时输出将框架为「供律师审查的研究」',
  },
  {
    id: 'reviewSide',
    label: '当前操作方',
    group: '审查指引',
    type: 'select',
    options: ['销售方', '采购方', '双方'],
    hint: '审查指引按此方向校准',
  },
  {
    id: 'liabilityCap',
    label: '责任上限',
    group: '审查指引',
    type: 'text',
    placeholder: '如：12 个月服务费',
    hint: '给具体数字，不要写「合理」——供应商说 24 个月时你是驳回还是签？',
  },
  {
    id: 'dealBreaker',
    label: 'deal-breaker',
    group: '审查指引',
    type: 'textarea',
    placeholder: '如果合同只有一个问题会让你拒绝签署，那是什么？',
  },
  {
    id: 'governingLaw',
    label: '管辖法律与管辖地',
    group: '审查指引',
    type: 'text',
    placeholder: '如：中国法，己方住所地法院',
  },
  {
    id: 'escalationThreshold',
    label: '上报阈值',
    group: '上报',
    type: 'text',
    placeholder: '如：标的额超过 100 万报法务负责人',
  },
  {
    id: 'writingStyle',
    label: '行文风格',
    group: '行文风格',
    type: 'textarea',
    placeholder: '如：结论先行、少用术语、给可选项而非单点建议',
  },
]

/** 诉讼仲裁的快速配置字段（对应 Part 0 与角色分流）。 */
const LITIGATION_FIELDS: readonly ProfileField[] = [
  {
    id: 'userRole',
    label: '使用者',
    group: '使用者与角色',
    type: 'select',
    options: USER_ROLES,
    hint: '决定每个案件简报、大事记、律师函的工作成果标头',
  },
  {
    id: 'litigationRole',
    label: '角色',
    group: '使用者与角色',
    type: 'select',
    options: LITIGATION_ROLES,
    hint: '决定访谈与画像走哪条路径：企业法务走法务版问卷，律所律师/独立执业走律师版',
  },
  {
    id: 'stance',
    label: '主要立场',
    group: '使用者与角色',
    type: 'select',
    options: ['原告/申请人', '被告/被申请人', '两者皆有', '因案而异'],
    hint: '校准你的词汇：原告看时效悬崖，被告看敞口评估',
  },
  {
    id: 'practiceSetting',
    label: '执业场景',
    group: '使用者与角色',
    type: 'select',
    options: [
      '独立执业', '小型律所（2-10人）', '中型律所', '大型律所',
      '企业法务', '政府', '法律援助', '法律诊所', '其他',
    ],
  },
  {
    id: 'forum',
    label: '常用管辖法院/仲裁机构',
    group: '执业背景',
    type: 'text',
    placeholder: '如：某某市某某区人民法院、某某仲裁委员会',
  },
  {
    id: 'caseLoad',
    label: '在办案件数量',
    group: '执业背景',
    type: 'text',
    placeholder: '如：12 件，原告方为主',
  },
  {
    id: 'feeModel',
    label: '收费模式',
    group: '执业背景',
    type: 'select',
    options: ['风险代理', '计时', '固定费用', '混合'],
  },
  {
    id: 'riskAppetite',
    label: '风险偏好',
    group: '风险校准',
    type: 'textarea',
    placeholder: '一句话：你能接受多大的败诉敞口',
  },
  {
    id: 'materialityThreshold',
    label: '重要性门槛',
    group: '风险校准',
    type: 'text',
    placeholder: '如：标的额 50 万以上须计提并上报',
  },
  {
    id: 'writingStyle',
    label: '文书风格',
    group: '文书风格',
    type: 'textarea',
    placeholder: '如：引用用「法释〔2020〕X 号」格式、段落短、先给结论',
  },
  {
    id: 'escalationChain',
    label: '上报链',
    group: '文书风格',
    type: 'text',
    placeholder: '如：主办律师 → 合伙人 → 法务负责人',
  },
]

/** 其余领域的通用字段（这些领域无工作台内置入口，建议走 L2 完整访谈）。 */
const GENERIC_FIELDS: readonly ProfileField[] = [
  {
    id: 'userRole',
    label: '使用者角色',
    group: '使用者',
    type: 'select',
    options: USER_ROLES,
  },
  {
    id: 'practiceSetting',
    label: '执业场景',
    group: '使用者',
    type: 'select',
    options: COMMERCIAL_SETTINGS,
  },
  {
    id: 'stance',
    label: '主要立场',
    group: '使用者',
    type: 'text',
    placeholder: '如：审查方/起草方/被告方',
  },
  {
    id: 'forum',
    label: '常用管辖地',
    group: '执业背景',
    type: 'text',
    placeholder: '如：广东省',
  },
  {
    id: 'riskAppetite',
    label: '风险偏好',
    group: '风险校准',
    type: 'textarea',
    placeholder: '一句话描述你能接受的风险敞口',
  },
  {
    id: 'writingStyle',
    label: '行文风格',
    group: '行文风格',
    type: 'textarea',
    placeholder: '如：结论先行、给可选项',
  },
]

/** 领域 → 快速配置字段表（未列出的领域走通用字段）。 */
const FIELDS_BY_DOMAIN: Readonly<Record<string, readonly ProfileField[]>> = {
  'commercial-legal': COMMERCIAL_FIELDS,
  'litigation-legal': LITIGATION_FIELDS,
}

/** 按领域目录名取元数据；未知名返回 undefined。 */
export function findProfileDomain(domain: string): ProfileDomainMeta | undefined {
  return PROFILE_DOMAINS.find(item => item.domain === domain)
}

/**
 * 取一个领域的快速配置字段（未特化的领域回退通用字段）。
 * @param domain - 领域目录名。
 * @returns 字段定义列表（顺序即渲染顺序）。
 */
export function profileFieldsFor(domain: string): readonly ProfileField[] {
  return FIELDS_BY_DOMAIN[domain] ?? GENERIC_FIELDS
}

/** 该领域是否有特化字段（决定面板是否提示「建议走完整访谈」）。 */
export function hasSpecializedFields(domain: string): boolean {
  return Object.hasOwn(FIELDS_BY_DOMAIN, domain)
}

/** 身份归属的再导出（UI 与字段表共用同一套取值）。 */
export type { ProfileRole } from './profileFieldsFull.ts'

/** 执业身份的两个版本（决定完整问卷走哪套问题链）。 */
export type ProfileIdentity = 'inhouse' | 'lawyer'

/**
 * 按领域与当前取值判定身份版本。
 *
 * 只看身份字段的取值，不额外维护状态——身份字段在 L1 与完整问卷里是同一个
 * 键（商事 practiceSetting / 诉讼 litigationRole），于是在哪个 Tab 里改都
 * 能立刻反映到另一个 Tab。关键词同时兼容 L1 的旧措辞（「法务管理案件组
 * 合」），旧画像读回来仍会被认成法务版。
 * @param domain - 领域目录名。
 * @param values - 当前表单取值。
 * @returns 企业法务为 'inhouse'，其余（含未填）为 'lawyer'。
 */
export function identityFor(
  domain: string,
  values: Readonly<Record<string, string>>,
): ProfileIdentity {
  const raw = domain === 'commercial-legal'
    ? values.practiceSetting ?? ''
    : domain === 'litigation-legal'
      ? values.litigationRole ?? ''
      : ''
  return INHOUSE_KEYWORDS.some(keyword => raw.includes(keyword)) ? 'inhouse' : 'lawyer'
}

/**
 * 取一个领域的完整问卷字段（按当前身份过滤后的那一套）。
 *
 * 返回 shared 字段加上当前身份的专属字段，另一版本的专属步骤整段不出现；
 * 首步改选身份后调用方据此重算步骤，已消失的步骤不再参与渲染。
 * @param domain - 领域目录名。
 * @param values - 当前表单取值（用于判定身份）。
 * @returns 该身份该填的字段表；该领域没有完整问卷时为 undefined。
 */
export function fullProfileFieldsFor(
  domain: string,
  values: Readonly<Record<string, string>>,
): readonly ProfileField[] | undefined {
  const table = FULL_FIELDS_BY_DOMAIN[domain]
  if (table === undefined) return undefined
  const identity = identityFor(domain, values)
  return table.filter(field => field.role === undefined || field.role === identity)
}

/**
 * 从字段表里按出现顺序提取步骤名（去重）。
 * @param fields - 已按身份过滤的字段表。
 * @returns 步骤名列表（顺序即问卷的翻页顺序）。
 */
export function profileSteps(fields: readonly ProfileField[]): readonly string[] {
  const steps: string[] = []
  for (const field of fields) {
    if (field.step === undefined) continue
    if (!steps.includes(field.step)) steps.push(field.step)
  }
  return steps
}

/**
 * 按当前取值过滤该显示的步骤（商事的销售方/采购方手册互斥显隐）。
 *
 * 依据模板原文的硬规则：绝不可在采购方合同上适用销售方立场，反之亦然。
 * 选「双方」时两本手册都要填，未选时两本都不显示（避免一上来就问两遍）。
 * @param steps - 全部步骤名。
 * @param domain - 领域目录名。
 * @param values - 当前表单取值。
 * @returns 该显示的步骤名列表。
 */
export function visibleSteps(
  steps: readonly string[],
  domain: string,
  values: Readonly<Record<string, string>>,
): readonly string[] {
  if (domain !== 'commercial-legal') return steps
  const side = values.reviewSide ?? ''
  if (side === '销售方') return steps.filter(step => step !== PURCHASE_STEP)
  if (side === '采购方') return steps.filter(step => step !== SALES_STEP)
  // 「双方」两本手册都要填；未选方向时两本都不出现，避免一上来就问两遍。
  if (side === '双方') return steps
  return steps.filter(step => step !== SALES_STEP && step !== PURCHASE_STEP)
}

/** 该领域是否有完整问卷（无则面板回退到对话访谈入口）。 */
export function hasFullQuestionnaire(domain: string): boolean {
  return Object.hasOwn(FULL_FIELDS_BY_DOMAIN, domain)
}

/** 保存时把另一张表单里已填的独有字段并入的分组名。 */
export const SAVED_ELSEWHERE_GROUP = '其它已填项'

/**
 * 合并保存用的字段表：本表单字段 + 另一张表单「独有且已填值」的字段。
 *
 * 两个 Tab 共用一份 values，字段表却不同（L1 的高频项在完整问卷里被拆成
 * 更细的条目，完整问卷又有大量 L1 没有的条目）。若各表只渲染自己的字段，
 * 用户在 A 表填完切到 B 表保存，A 的内容就会凭空消失——画像是一份文档，
 * 静默丢内容不可接受。故保存时把另一张表里已填且不在本表的字段并入末尾，
 * 归到独立分组，用户仍可在 L3 里删改。
 *
 * 身份专属字段已按当前身份过滤进 primary：切到另一身份时，那一版的专属
 * 字段既不在 primary 也不在 secondary（secondary 是 L1 表），于是被丢弃——
 * 这正是期望行为（换身份就该换掉那套问题）。
 * @param primary - 当前保存入口的字段表。
 * @param secondary - 另一张表单的字段表。
 * @param values - 当前表单取值。
 * @returns 合并后的字段表（无残留项时原样返回 primary）。
 */
export function mergeFieldsForSave(
  primary: readonly ProfileField[],
  secondary: readonly ProfileField[],
  values: Readonly<Record<string, string>>,
): readonly ProfileField[] {
  const known = new Set(primary.map(field => field.id))
  const extra = secondary
    .filter(field => !known.has(field.id) && (values[field.id] ?? '').trim() !== '')
    .map(field => ({ ...field, group: SAVED_ELSEWHERE_GROUP, step: undefined }))
  return extra.length === 0 ? primary : [...primary, ...extra]
}

export { IDENTITY_STEP, PURCHASE_STEP, SALES_STEP }

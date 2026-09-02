/**
 * 完整问卷（L2）的字段表（M8.7）。
 *
 * 与 L1 快速配置的关系：L1 只收高频字段，本文件覆盖画像模板里**全部可表单
 * 化的占位符**，按「执业身份」分成两套问题链——执业律师版与公司法务版。
 * 分叉依据是模板原文，不是自行设计：
 *
 *   - 商事模板「审批与上报」的审批矩阵写的是「法务助理/初级律师 → 主办
 *     律师 → 法务负责人 → 业务/CFO」，是企业法务的链路；「事项工作空间」
 *     则明文写着「仅适用于多客户业务（私人执业），企业法务本节关闭」。
 *   - 诉讼模板「重大性阈值」明文写着「本子段仅适用于企业法务」；「和解
 *     权限阶梯」的审批人是「法务负责人/GC → CFO → 董事会」；「外部律师
 *     库」「管理层备忘录」「准备金备忘录」「外部律师指令」同样是委托方的
 *     话术。反过来，「执业角色」段注明律所律师与独立执业走「案件/合伙人
 *     审查/证据交换」与「案件量/风险代理或固定费用/客户更新」话术。
 *
 * 组织方式：身份无关的步骤两版共用（role 缺省即 shared），身份专属步骤
 * 各自分叉（role: 'inhouse' / 'lawyer'）。运行时由 fullProfileFieldsFor
 * 按身份过滤，得到该用户该填的那一套。
 *
 * 未填写的字段落 [PLACEHOLDER]（与 L1 同规则），Host 侧 configured 判定
 * 与 L3 原文直编回填都不受影响。
 */
import type { ProfileField } from './profileFields.ts'

/** 身份归属：shared 缺省即两版共用。 */
export type ProfileRole = 'inhouse' | 'lawyer'

/** 首步步骤名（两版共用，选择结果决定后续步骤的分叉）。 */
export const IDENTITY_STEP = '执业身份'

/** 商事：销售方 / 采购方合同手册的步骤名（UI 按 reviewSide 过滤）。 */
export const SALES_STEP = '销售方合同手册'
export const PURCHASE_STEP = '采购方合同手册'

/** 判定「企业法务」的关键词（同时兼容 L1 旧措辞「法务管理案件组合」）。 */
export const INHOUSE_KEYWORDS: readonly string[] = ['企业法务', '法务管理', '公司法务']

/** 集成状态的选项（模板里是 ✓/✗ + 不可用时的替代方案）。 */
const INTEGRATION = ['✓ 已接入', '✗ 未接入'] as const

/** 开关类选项。 */
const ON_OFF = ['开', '关'] as const

/** 执业场景选项（商事）——含「企业法务」者走法务版。 */
export const COMMERCIAL_SETTINGS: readonly string[] = [
  '个人执业', '小型律所（2-10人）', '中型律所', '大型律所',
  '企业法务', '政府/法律援助/法律诊所',
]

/** 执业角色选项（诉讼）——模板原文的四种执业角色。 */
export const LITIGATION_ROLES: readonly string[] = [
  '企业法务', '律所律师', '独立执业', '其他',
]

/** 使用者角色选项（决定工作成果页眉）。 */
export const USER_ROLES: readonly string[] = [
  '律师/法律专业人士', '非律师但有律师支持', '非律师且无律师支持',
]

/** 单行文本字段。 */
function text(
  id: string, label: string, group: string, step: string,
  placeholder?: string, hint?: string,
): ProfileField {
  return { id, label, group, step, type: 'text', placeholder, hint }
}

/** 多行文本字段（立场、要求、清单类）。 */
function area(
  id: string, label: string, group: string, step: string,
  placeholder?: string, hint?: string,
): ProfileField {
  return { id, label, group, step, type: 'textarea', placeholder, hint }
}

/** 下拉选择字段。 */
function pick(
  id: string, label: string, group: string, step: string,
  options: readonly string[], hint?: string,
): ProfileField {
  return { id, label, group, step, type: 'select', options, hint }
}

/** 标记为法务专属（仅公司法务版出现）。 */
function inhouse(field: ProfileField): ProfileField {
  return { ...field, role: 'inhouse' }
}

/** 标记为律师专属（仅执业律师版出现）。 */
function counsel(field: ProfileField): ProfileField {
  return { ...field, role: 'lawyer' }
}

/** 销售方 / 采购方手册共用的小节名后缀表（避免两侧手写两遍标签）。 */
type ManualSpec = {
  readonly prefix: string
  readonly step: string
}

/**
 * 生成一侧合同手册的字段（销售方与采购方结构同形，只有立场文案不同）。
 * @param spec - 侧别前缀与步骤名。
 * @returns 该侧手册的全部字段（责任限制 → 赔偿 → 数据保护 → 期限与解除
 *   → 适用法律与管辖 → 底线事项，与模板小节同序）。
 */
function manualFields({ prefix, step }: ManualSpec): readonly ProfileField[] {
  const group = (name: string): string => `${prefix}·${name}`
  const seller = prefix === '销售方'
  return [
    area(`${prefix === '销售方' ? 'sales' : 'purchase'}LiabilityCap`,
      `${prefix}·直接损失上限`, group('责任限制'), step,
      seller ? '如：已付或应付的最近 12 个月服务费' : '如：供应商责任上限为最近 12 个月服务费',
      '给具体算法，不要写「合理」——对方说 24 个月时你是驳回还是签？'),
    text(`${seller ? 'sales' : 'purchase'}Consequential`,
      `${prefix}·间接后果性损失`, group('责任限制'), step,
      '排除 / 上限为 X / 无限 / 与直接损失上限一致'),
    area(`${seller ? 'sales' : 'purchase'}CapCarveouts`,
      `${prefix}·上限例外事项`, group('责任限制'), step,
      '如：重大过失、违反保密义务、知识产权赔偿、数据安全事件'),
    text(`${seller ? 'sales' : 'purchase'}CapBase`,
      `${prefix}·上限计算基数定义`, group('责任限制'), step,
      seller
        ? '如：索赔发生前 12 个月内实际已付费用'
        : '如：索赔前 12 个月已付费用；拒绝「仅含最近 3 个月」',
      '基数定义比金额更重要，模糊表述会被逐条标记'),
    area(`${seller ? 'sales' : 'purchase'}CapAcceptable`,
      `${prefix}·责任上限可接受的替代方案`, group('责任限制'), step),
    area(`${seller ? 'sales' : 'purchase'}CapReject`,
      `${prefix}·责任上限绝不接受`, group('责任限制'), step,
      seller ? '如：间接损失无限责任' : '如：上限基数仅含前 3 个月已付费用'),

    area(`${seller ? 'sales' : 'purchase'}IndemnityStandard`,
      `${prefix}·赔偿标准立场`, group('赔偿'), step,
      seller
        ? '如：我方就服务引发的知识产权侵权索赔负责；客户就其数据与使用行为负责'
        : '如：供应商就知识产权侵权及数据安全事件负责；我方就数据使用负责'),
    area(`${seller ? 'sales' : 'purchase'}IndemnityAcceptable`,
      `${prefix}·赔偿可接受的替代方案`, group('赔偿'), step),
    area(`${seller ? 'sales' : 'purchase'}IndemnityReject`,
      `${prefix}·赔偿绝不接受`, group('赔偿'), step),

    area(`${seller ? 'sales' : 'purchase'}DpStandard`,
      `${prefix}·数据保护标准立场`, group('数据保护'), step,
      seller ? '如：我方作为受托处理方提供 DPA' : '如：供应商签署我方 DPA，作为受托处理方'),
    area(`${seller ? 'sales' : 'purchase'}DpRequirements`,
      `${prefix}·数据保护要求`, group('数据保护'), step,
      '如：接触客户数据的供应商须通过等保测评或 ISO 27001 认证'),
    area(`${seller ? 'sales' : 'purchase'}DpAcceptable`,
      `${prefix}·数据保护可接受的替代方案`, group('数据保护'), step),

    area(`${seller ? 'sales' : 'purchase'}TermStandard`,
      `${prefix}·期限与解除标准立场`, group('合同期限与解除'), step,
      seller
        ? '如：一年期，到期自动续约，提前 30 日通知可取消续约'
        : '如：提前 30 日通知可任意解除；自动续约须附 30 日取消窗口'),
    area(`${seller ? 'sales' : 'purchase'}TermAcceptable`,
      `${prefix}·期限与解除可接受的替代方案`, group('合同期限与解除'), step),
    area(`${seller ? 'sales' : 'purchase'}TermReject`,
      `${prefix}·期限与解除绝不接受`, group('合同期限与解除'), step,
      seller ? '如：付费期内允许任意解除' : '如：多年锁定且无解除权'),

    text(`${seller ? 'sales' : 'purchase'}LawPreferred`,
      `${prefix}·适用法律与管辖首选`, group('适用法律与管辖'), step,
      '如：中国法，我方住所地有管辖权的人民法院'),
    text(`${seller ? 'sales' : 'purchase'}LawAcceptable`,
      `${prefix}·适用法律与管辖可接受`, group('适用法律与管辖'), step),
    text(`${seller ? 'sales' : 'purchase'}LawEscalate`,
      `${prefix}·适用法律与管辖需上报`, group('适用法律与管辖'), step),
    text(`${seller ? 'sales' : 'purchase'}LawReject`,
      `${prefix}·适用法律与管辖绝不可接受`, group('适用法律与管辖'), step),

    area(`${seller ? 'sales' : 'purchase'}BottomLine`,
      `${prefix}·底线事项`, group('底线事项'), step,
      seller
        ? '销售场景下的交易底线——每份销售方审查最先检查此项'
        : '采购场景下的交易底线——每份采购方审查最先检查此项'),
  ]
}

/** 商事合同的完整问卷字段：共享 + 法务专属 + 律师专属。 */
export const FULL_COMMERCIAL_FIELDS: readonly ProfileField[] = [
  // ── 执业身份（两版共用，首步的选择决定后面多出哪些步骤）──
  pick('practiceSetting', '执业场景', '执业身份', IDENTITY_STEP, COMMERCIAL_SETTINGS,
    '选「企业法务」走法务版（多出审批与上报链），其余走律师版（多出事项工作空间）'),
  pick('userRole', '使用者角色', '执业身份', IDENTITY_STEP, USER_ROLES,
    '非律师时输出将框架为「供律师审查的研究」'),

  // ── 我们是谁 ──
  text('orgName', '委托人名称', '我们是谁', '我们是谁', '如：某某科技有限公司'),
  text('orgType', '我方主体类型', '我们是谁', '我们是谁', '如：有限责任公司'),
  text('teamSize', '合同团队规模', '我们是谁', '我们是谁', '如：3 人'),
  text('finalApprover', '最终审批人', '我们是谁', '我们是谁', '如：法务负责人 王某'),
  text('monthlyVolume', '月处理协议量', '我们是谁', '我们是谁', '如：约 40 份'),
  pick('contractMix', '协议类型构成', '我们是谁', '我们是谁',
    ['供应商为主', '客户为主', '混合型']),
  text('clmName', '合同管理系统名称', '我们是谁', '我们是谁', '如：自研 CLM / 无'),
  area('painPoint', '最头疼的事', '我们是谁', '我们是谁', '用团队自己的话写，越具体越好'),

  // ── 可用集成 ──
  pick('intEsign', '电子签约', '可用集成', '可用集成', INTEGRATION,
    '未接入时插件只输出合同文本，签署流程由你自行安排'),
  pick('intClm', '合同管理系统', '可用集成', '可用集成', INTEGRATION,
    '未接入时手动记录，续约追踪基于本地登记册运行'),
  pick('intDocStore', '文档存储', '可用集成', '可用集成', INTEGRATION,
    '未接入时每次审查需你直接上传协议'),
  pick('intIm', '即时通讯', '可用集成', '可用集成', INTEGRATION,
    '未接入时提醒与利益方摘要以文字形式内联输出'),

  // ── 合同手册方向（决定后面出现销售方还是采购方手册）──
  pick('reviewSide', '当前操作方', '合同手册', '合同手册', ['销售方', '采购方', '双方'],
    '销售方＝我方供货、通常用我方模板；采购方＝我方采购、通常用对方模板。选「双方」两本手册都要填'),

  // ── 销售方 / 采购方合同手册（按上方选择在 UI 层显隐）──
  ...manualFields({ prefix: '销售方', step: SALES_STEP }),
  ...manualFields({ prefix: '采购方', step: PURCHASE_STEP }),

  // ── 审批与上报（法务专属：模板的审批矩阵是「法务助理→主办律师→法务
  //    负责人→业务/CFO」，属企业法务的链路）──
  inhouse(text('escJuniorScope', '初级审批人可审批事项', '审批与上报', '审批与上报',
    '如：法务助理可批标准模板且金额 <50 万')),
  inhouse(text('escMidScope', '主办律师可审批事项', '审批与上报', '审批与上报',
    '如：主办律师可批 <200 万，上报法务负责人')),
  inhouse(text('escHeadScope', '法务负责人可审批事项', '审批与上报', '审批与上报',
    '如：法务负责人可批 <500 万，上报业务/CFO')),
  inhouse(text('escAmountThreshold', '金额阈值', '审批与上报', '审批与上报',
    '如：>500 万须业务与 CFO 联批',
    '只写数字等于没写——要说明谁在哪个金额上接手')),
  inhouse(area('escAutoEscalate', '无论金额均需上报的事项', '审批与上报', '审批与上报',
    '如：无限责任、知识产权归供应商所有、任何列入「绝不接受」清单的条款')),

  // ── 事项工作空间（律师专属：模板注明仅多客户业务适用，企业法务关闭）──
  counsel(pick('matterWsEnabled', '事项工作空间已启用', '事项工作空间', '事项工作空间',
    ['✓ 已启用', '✗ 未启用'],
    '多客户执业（个人执业/律所）才需要按事项隔离上下文；企业法务只有一家客户，本节省略')),
  counsel(text('matterWsActive', '活跃事项', '事项工作空间', '事项工作空间',
    '如：某某科技股权转让')),
  counsel(pick('matterWsCrossContext', '跨事项上下文', '事项工作空间', '事项工作空间', ON_OFF,
    '关闭时在事项 A 里绝不读取事项 B 的文件')),

  // ── 行文风格与收尾（两版共用）──
  area('styleRedlineTone', '修订文本语气', '行文风格', '行文风格',
    '如：直接给可替换文本，不改动的条款不解释'),
  area('styleStakeholderSummary', '利益方摘要', '行文风格', '行文风格',
    '如：写给业务负责人看，控制在 5 条以内，不出现法条编号'),
  text('styleDeliveryLocation', '交付物输出位置', '行文风格', '行文风格',
    '如：合同管理系统 / 飞书云文档「法务审查」文件夹'),
  text('styleRenewalReminder', '续约提醒发送至', '行文风格', '行文风格',
    '如：飞书「法务」频道 / legal@company.com'),
  area('ndaClosingAction', '保密协议分流收尾动作', '行文风格', '行文风格',
    '如：请将此输出及保密协议一并转发给合同管理员'),
]

/** 诉讼仲裁的完整问卷字段：共享 + 法务专属 + 律师专属。 */
export const FULL_LITIGATION_FIELDS: readonly ProfileField[] = [
  // ── 执业身份（首步；模板「执业角色」决定下游技能用哪套话术）──
  pick('litigationRole', '角色', '执业身份', IDENTITY_STEP, LITIGATION_ROLES,
    '企业法务走「案件组合/准备金/管理层备忘录」口径，律所律师与独立执业走「案件/合伙人审查/证据交换」口径'),
  pick('userRole', '使用者', '执业身份', IDENTITY_STEP, USER_ROLES,
    '决定每份案件简报、大事记、律师函的工作成果标头'),
  text('lawyerContact', '律师联系人', '执业身份', IDENTITY_STEP,
    '如：外部律所 某某团队 / 不适用（本人即律师）'),

  // ── 当事人角色 ──
  pick('stance', '主要立场', '当事人角色', '当事人角色',
    ['原告/申请人', '被告/被申请人', '两者皆有', '因案而异'],
    '校准你的词汇：原告方看时效悬崖，被告方看败诉敞口'),

  // ── 可用集成 ──
  pick('intFileStore', '文件存储', '可用集成', '可用集成', INTEGRATION,
    '未接入时案件文件夹仅限本地'),
  pick('intIm', '即时通讯', '可用集成', '可用集成', INTEGRATION,
    '未接入时函件手动提取，无自动历史'),
  pick('intScheduler', '定时任务', '可用集成', '可用集成', INTEGRATION,
    '未接入时期限与保全更新提醒仅按需运行'),
  pick('intClm', '合同管理系统', '可用集成', '可用集成', INTEGRATION,
    '未接入时合同取用需手动进行商业交叉检索'),

  // ── 风险校准 ──
  area('riskAppetite', '风险偏好', '风险校准', '风险校准',
    '如：有法律依据的案件坚决应诉；小额滋扰案件快速和解；避免不利判决形成判例'),
  text('severityHigh', '高严重性定义', '风险校准', '风险校准',
    '如：标的额/敞口 >500 万元，或影响核心业务的禁止令，或行政处罚风险'),
  text('severityMid', '中严重性定义', '风险校准', '风险校准',
    '如：50 万–500 万元，或非核心业务禁止令，或重大合同损失'),
  text('severityLow', '低严重性定义', '风险校准', '风险校准',
    '如：<50 万元且无其他非金钱救济'),
  text('likelihoodHigh', '高可能性定义', '风险校准', '风险校准',
    '如：基于现有证据，不利结果可能性超过 50%'),
  text('likelihoodMid', '中可能性定义', '风险校准', '风险校准',
    '如：合理可能性（20%–50%）'),
  text('likelihoodLow', '低可能性定义', '风险校准', '风险校准',
    '如：不太可能（<20%），但非毫无根据'),

  // ── 争议画像 ──
  area('disputeBackground', '业务背景', '争议画像', '争议画像',
    '一段话：你们做什么，以及为什么会起诉/被诉'),
  text('disputePatternLabor', '劳动争议频率', '争议画像', '争议画像', '如：年均 6 起，多为违法解除'),
  text('disputePatternContract', '合同商事纠纷频率', '争议画像', '争议画像', '如：年均 12 起，多为货款'),
  text('disputePatternIp', '知识产权频率', '争议画像', '争议画像', '如：偶发，商标异议为主'),
  text('disputePatternProduct', '产品责任频率', '争议画像', '争议画像', '如：罕见'),
  text('disputePatternRegulatory', '行政监管调查频率', '争议画像', '争议画像', '如：年均 2 次'),
  text('disputePatternSubpoena', '第三人调查令频率', '争议画像', '争议画像', '如：年均 3 次'),
  area('commonOpponents', '常见对手', '争议画像', '争议画像',
    '如：某某建设（常年劳务纠纷）、某某律所（知识产权方向）'),
  area('commonForums', '常见管辖法院与仲裁机构', '争议画像', '争议画像',
    '如：某某市某某区人民法院、某某仲裁委员会、CIETAC'),
  area('fileStorage', '案件文件存储位置', '争议画像', '争议画像',
    '如：企业网盘「法务部」/案件号分层；邮件归档可检索'),

  // ── 文书风格（两版共用的部分）──
  text('privacyLabel', '保密标注', '文书风格', '文书风格',
    '如：保密 — 内部法律分析',
    '虚假的保护承诺不如不标注——中国法下无「律师工作成果」这一概念'),
  text('privacyReview', '保密审查机制', '文书风格', '文书风格',
    '如：对外发送前由主办律师复核标注与去向'),
  text('evidenceTemplate', '证据保全模板', '文书风格', '文书风格', '如：templates/证据保全通知.md'),
  text('evidenceIssue', '证据保全签发', '文书风格', '文书风格', '如：主办律师签发、法务助理签收、每月更新'),
  text('escalationChannel', '上报渠道', '文书风格', '文书风格',
    '如：GC 邮件+即时通讯紧急；CFO 仅邮件；董事会通过 GC'),
  text('escalationSubject', '上报标题惯例', '文书风格', '文书风格',
    '如：[诉讼 — 紧急] 案件名称 —— 一句话摘要'),
  pick('demandInsuranceNotice', '律师函保险通知时机', '文书风格', '文书风格',
    ['发出律师函前', '发出后', '不适用', '视案件而定']),
  text('demandMatterThreshold', '案件创建门槛', '文书风格', '文书风格',
    '如：涉及金额 >5 万元 或 任何停止侵权函 创建为案件'),

  // ── 公司概况（法务专属：内部联系人与汇报链只在企业法务侧成立）──
  inhouse(text('entityListing', '上市与子公司状态', '公司概况', '公司概况',
    '如：A 股上市，下属 4 家全资子公司')),
  inhouse(text('headcount', '员工人数', '公司概况', '公司概况', '如：1,200 人')),
  inhouse(text('legalTeamSize', '法务团队规模', '公司概况', '公司概况', '如：8 人（含 2 名诉讼专员）')),
  inhouse(text('contactGc', '法务负责人联系方式', '公司概况', '公司概况',
    '超过法务负责人上报阈值的一切事项')),
  inhouse(text('contactCfo', 'CFO 联系方式', '公司概况', '公司概况',
    '准备金、对外披露、超过阈值的和解')),
  inhouse(text('contactHr', 'HR 负责人联系方式', '公司概况', '公司概况', '全部劳动争议事项')),
  inhouse(text('contactPr', '公关负责人联系方式', '公司概况', '公司概况', '涉及媒体/声誉风险的事项')),
  inhouse(text('contactInfoSec', '信息安全负责人联系方式', '公司概况', '公司概况',
    '数据事件、网络安全诉讼、监管安全询问')),
  inhouse(text('contactAudit', '董事会审计委员会联系方式', '公司概况', '公司概况',
    '重大事项、需披露事项')),
  inhouse(text('reportingLine', '汇报对象', '公司概况', '公司概况', '如：向 GC 汇报')),

  // ── 重大性阈值（法务专属：模板明文「仅适用于企业法务」）──
  inhouse(text('matProvision', '准备金计提阈值', '重大性阈值', '重大性阈值',
    '如：很可能且可合理估计 → 计提损失并通知财务')),
  inhouse(text('matDisclosure', '对外披露阈值', '重大性阈值', '重大性阈值',
    '如：构成重大诉讼、仲裁事项 → 发布公告或定期报告披露')),
  inhouse(text('matBoardReport', '管理层董事会报告阈值', '重大性阈值', '重大性阈值',
    '如：标的额 >1000 万元或有声誉风险 → 季度备忘录')),
  inhouse(text('matGcEscalation', 'GC 立即上报阈值', '重大性阈值', '重大性阈值',
    '如：新案件标的额 >100 万元、监管调查、群体性纠纷 → 48 小时内简报')),

  // ── 和解权限阶梯（法务专属：审批人是 GC/CFO/董事会）──
  inhouse(text('settlementTier1', '和解权限最低档', '和解权限阶梯', '和解权限阶梯',
    '如：¥0–50 万 由诉讼律师决定')),
  inhouse(text('settlementTier2', '和解权限第二档', '和解权限阶梯', '和解权限阶梯',
    '如：¥50–200 万 由法务负责人/GC 审批')),
  inhouse(text('settlementTier3', '和解权限第三档', '和解权限阶梯', '和解权限阶梯',
    '如：¥200–1000 万 由 CFO + GC 审批')),
  inhouse(text('settlementTier4', '和解权限最高档', '和解权限阶梯', '和解权限阶梯',
    '如：>¥1000 万 由董事会/审计委员会审批')),

  // ── 保险覆盖（法务专属）──
  inhouse(text('insDo', '董责险', '保险覆盖', '保险覆盖', '如：平安，保额 5000 万，免赔 100 万')),
  inhouse(text('insEmployer', '雇主责任险', '保险覆盖', '保险覆盖', '如：人保，保额 1000 万')),
  inhouse(text('insCyber', '网络安全险', '保险覆盖', '保险覆盖', '如：未投保')),
  inhouse(text('insProduct', '产品责任险', '保险覆盖', '保险覆盖', '如：太保，保额 2000 万，年审')),
  inhouse(area('insuranceNotice', '保险通知程序', '保险覆盖', '保险覆盖',
    '如：收到起诉状 5 日内通知经纪人与保险公司法务，逾期可能影响理赔')),

  // ── 外部律师库（法务专属：企业法务才委托外部律所）──
  inhouse(area('outsidePanel', '外部律师库', '外部律师库', '外部律师库',
    '如：某某律所 — 王某 — 劳动争议 — 计时 2000 元/时 — 有框架协议')),

  // ── 管理层与外部律师文书（法务专属）──
  inhouse(area('boardMemoFormat', '管理层董事会备忘录格式', '管理层与外部律师文书', '管理层与外部律师文书',
    '如：要点摘要 + 风险表 + 请示事项 + 准备金状态 + 下一步')),
  inhouse(area('boardMemoTone', '管理层备忘录语气', '管理层与外部律师文书', '管理层与外部律师文书',
    '如：通俗中文，不无故模糊，每个数字有来源')),
  inhouse(area('provisionMemoFormat', '准备金备忘录格式', '管理层与外部律师文书', '管理层与外部律师文书',
    '如：事实、法律标准、概率评估、可估计范围、准备金建议')),
  inhouse(text('provisionMemoApprover', '准备金备忘录审批人', '管理层与外部律师文书', '管理层与外部律师文书',
    '如：CFO')),
  inhouse(area('outsideCounselFormat', '外部律师指令格式', '管理层与外部律师文书', '管理层与外部律师文书',
    '如：单封邮件，编号指令，期限加粗，附预算参考')),
  inhouse(area('outsideCounselBudget', '外部律师预算姿态', '管理层与外部律师文书', '管理层与外部律师文书',
    '如：年化律师费预计 >10 万元的案件需月度预算')),

  // ── 律师执业实务（律师专属：模板注明律所与独立执业走这套话术）──
  counsel(pick('practiceScale', '律所规模', '律师执业实务', '律师执业实务',
    ['独立执业', '小型律所（2-10人）', '中型律所', '大型律所'])),
  counsel(area('teamStructure', '团队分工与合伙人审查', '律师执业实务', '律师执业实务',
    '如：主办律师出初稿，合伙人复核起诉状与代理词，助理负责证据编号')),
  counsel(pick('feeModel', '收费模式', '律师执业实务', '律师执业实务',
    ['风险代理', '计时', '固定费用', '混合'])),
  counsel(area('clientReporting', '客户汇报方式', '律师执业实务', '律师执业实务',
    '如：每月一封进展信；重大节点当天电话，事后邮件确认')),

  // ── 事项工作空间（律师专属：多客户执业才需要按事项隔离）──
  counsel(pick('matterWsEnabled', '事项工作空间已启用', '事项工作空间', '事项工作空间',
    ['✓ 已启用', '✗ 未启用'],
    '多客户执业才需要按事项隔离；企业法务只有一家客户，本节省略')),
  counsel(text('matterWsActive', '活跃事项', '事项工作空间', '事项工作空间',
    '如：某某建材货款纠纷（被告）')),
  counsel(pick('matterWsCrossContext', '跨事项上下文', '事项工作空间', '事项工作空间', ON_OFF,
    '关闭时在事项 A 里绝不读取事项 B 的文件')),

  // ── 利益冲突排查（律师专属：执业律师以个人判断或系统检索为主）──
  counsel(pick('conflictMethod', '利益冲突排查方法', '利益冲突排查', '利益冲突排查',
    ['律师个人判断', '系统检索', '委托外部律所', '法务部自查', '其他'])),
  counsel(text('conflictOwner', '利益冲突排查执行人', '利益冲突排查', '利益冲突排查',
    '如：主办律师立案前自查，助理复核')),
  counsel(area('conflictScope', '利益冲突排查范围', '利益冲突排查', '利益冲突排查',
    '如：当前客户清单、活跃供应商、关联公司、2 年内离职员工')),
  counsel(pick('conflictBeforeFiling', '立案前是否须完成排查', '利益冲突排查', '利益冲突排查',
    ['是', '否'])),
]

/** 领域 → 完整问卷字段表（未列出的领域无完整问卷，走 L1 或 L3）。 */
export const FULL_FIELDS_BY_DOMAIN: Readonly<Record<string, readonly ProfileField[]>> = {
  'commercial-legal': FULL_COMMERCIAL_FIELDS,
  'litigation-legal': FULL_LITIGATION_FIELDS,
}

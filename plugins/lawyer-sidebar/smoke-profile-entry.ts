/**
 * 完整问卷（L2）身份分叉的冒烟（可复跑）：直接驱动真实模块，断言 4 套
 * 问卷的分叉、步骤显隐、Markdown 编解码与 L1 回归。
 *
 * 覆盖的是「纯前端决策逻辑」——身份判定、字段过滤、步骤显隐、渲染与回填，
 * 全部不依赖 Host / React，故可离线跑。
 */
import {
  fullProfileFieldsFor,
  hasFullQuestionnaire,
  identityFor,
  mergeFieldsForSave,
  profileFieldsFor,
  profileSteps,
  visibleSteps,
  IDENTITY_STEP,
  PURCHASE_STEP,
  SALES_STEP,
  SAVED_ELSEWHERE_GROUP,
} from './src/client/profileFields.ts'
import {
  FULL_COMMERCIAL_FIELDS,
  FULL_LITIGATION_FIELDS,
} from './src/client/profileFieldsFull.ts'
import {
  countPlaceholders,
  isFormGenerated,
  parseProfileFields,
  renderProfileMarkdown,
} from './src/client/profileMarkdown.ts'

let passed = 0
const failures: string[] = []

/** 断言条件成立。 */
function check(name: string, condition: boolean): void {
  if (condition) passed += 1
  else failures.push(name)
}

/** 断言相等（值或字符串化的列表）。 */
function eq(name: string, actual: unknown, expected: unknown): void {
  check(`${name}｜期望 ${String(expected)}，实际 ${String(actual)}`, actual === expected)
}

/** 断言列表包含某元素。 */
function has(name: string, list: readonly string[], item: string): void {
  check(`${name}｜应包含「${item}」`, list.includes(item))
}

/** 断言列表不包含某元素。 */
function hasNot(name: string, list: readonly string[], item: string): void {
  check(`${name}｜不应包含「${item}」`, !list.includes(item))
}

/** 取某身份下某领域的字段 id 列表。 */
function ids(domain: string, values: Record<string, string>): readonly string[] {
  return (fullProfileFieldsFor(domain, values) ?? []).map(field => field.id)
}

/** 取某身份下某领域的步骤名列表（未经 reviewSide 过滤）。 */
function steps(domain: string, values: Record<string, string>): readonly string[] {
  return profileSteps(fullProfileFieldsFor(domain, values) ?? [])
}

// ── 场景 1：身份判定（含 L1 旧措辞兼容）──
eq('商事·企业法务 → inhouse', identityFor('commercial-legal', { practiceSetting: '企业法务' }), 'inhouse')
eq('商事·中型律所 → lawyer', identityFor('commercial-legal', { practiceSetting: '中型律所' }), 'lawyer')
eq('商事·个人执业 → lawyer', identityFor('commercial-legal', { practiceSetting: '个人执业' }), 'lawyer')
eq('商事·未填 → lawyer', identityFor('commercial-legal', {}), 'lawyer')
eq('诉讼·企业法务 → inhouse', identityFor('litigation-legal', { litigationRole: '企业法务' }), 'inhouse')
eq('诉讼·律所律师 → lawyer', identityFor('litigation-legal', { litigationRole: '律所律师' }), 'lawyer')
eq('诉讼·独立执业 → lawyer', identityFor('litigation-legal', { litigationRole: '独立执业' }), 'lawyer')
eq('诉讼·旧措辞「法务管理案件组合」仍判 inhouse',
  identityFor('litigation-legal', { litigationRole: '法务管理案件组合' }), 'inhouse')
eq('诉讼·未填 → lawyer', identityFor('litigation-legal', {}), 'lawyer')

// ── 场景 2：4 套问卷的字段分叉 ──
const comInhouse = ids('commercial-legal', { practiceSetting: '企业法务' })
const comLawyer = ids('commercial-legal', { practiceSetting: '个人执业' })
const litInhouse = ids('litigation-legal', { litigationRole: '企业法务' })
const litLawyer = ids('litigation-legal', { litigationRole: '律所律师' })

has('商事法务版·有审批上报', comInhouse, 'escAmountThreshold')
has('商事法务版·有审批矩阵', comInhouse, 'escJuniorScope')
hasNot('商事法务版·无事项工作空间', comInhouse, 'matterWsEnabled')
has('商事律师版·有事项工作空间', comLawyer, 'matterWsEnabled')
hasNot('商事律师版·无审批上报', comLawyer, 'escAmountThreshold')
hasNot('商事律师版·无审批矩阵', comLawyer, 'escHeadScope')

has('诉讼法务版·有重大性阈值', litInhouse, 'matProvision')
has('诉讼法务版·有和解权限', litInhouse, 'settlementTier1')
has('诉讼法务版·有保险覆盖', litInhouse, 'insDo')
has('诉讼法务版·有外部律师库', litInhouse, 'outsidePanel')
has('诉讼法务版·有董事会备忘录', litInhouse, 'boardMemoFormat')
hasNot('诉讼法务版·无收费模式', litInhouse, 'feeModel')
hasNot('诉讼法务版·无利益冲突排查', litInhouse, 'conflictMethod')
has('诉讼律师版·有收费模式', litLawyer, 'feeModel')
has('诉讼律师版·有律师执业实务', litLawyer, 'practiceScale')
has('诉讼律师版·有利益冲突排查', litLawyer, 'conflictMethod')
has('诉讼律师版·有事项工作空间', litLawyer, 'matterWsEnabled')
hasNot('诉讼律师版·无重大性阈值', litLawyer, 'matProvision')
hasNot('诉讼律师版·无保险覆盖', litLawyer, 'insCyber')
hasNot('诉讼律师版·无外部律师库', litLawyer, 'outsidePanel')

// 两版共有的共享字段：身份字段、使用者、集成、行文风格都要在
for (const shared of ['practiceSetting', 'userRole', 'intEsign', 'styleRedlineTone']) {
  has(`商事两版共有 ${shared}（法务）`, comInhouse, shared)
  has(`商事两版共有 ${shared}（律师）`, comLawyer, shared)
}
for (const shared of ['litigationRole', 'userRole', 'riskAppetite', 'escalationChannel']) {
  has(`诉讼两版共有 ${shared}（法务）`, litInhouse, shared)
  has(`诉讼两版共有 ${shared}（律师）`, litLawyer, shared)
}

// ── 场景 3：身份切换后专属字段整段替换（不残留另一版本）──
const comInhouseOnly = (fullProfileFieldsFor('commercial-legal', { practiceSetting: '企业法务' }) ?? [])
  .filter(field => field.role === 'inhouse').map(field => field.id)
const comLawyerOnly = (fullProfileFieldsFor('commercial-legal', { practiceSetting: '个人执业' }) ?? [])
  .filter(field => field.role === 'lawyer').map(field => field.id)
check('商事·法务专属字段在切到律师版后全部消失',
  comInhouseOnly.every(id => !comLawyer.includes(id)))
check('商事·律师专属字段在切到法务版后全部消失',
  comLawyerOnly.every(id => !comInhouse.includes(id)))
check('商事·两版确实各自有专属字段', comInhouseOnly.length > 0 && comLawyerOnly.length > 0)

const litInhouseOnly = (fullProfileFieldsFor('litigation-legal', { litigationRole: '企业法务' }) ?? [])
  .filter(field => field.role === 'inhouse').map(field => field.id)
check('诉讼·法务专属字段在切到律师版后全部消失',
  litInhouseOnly.every(id => !litLawyer.includes(id)))
check('诉讼·法务专属字段数量可观（说明确实分叉了）', litInhouseOnly.length >= 15)

// ── 场景 4：步骤显隐（身份专属步骤 + 商事按操作方）──
const comInhouseSteps = steps('commercial-legal', { practiceSetting: '企业法务' })
const comLawyerSteps = steps('commercial-legal', { practiceSetting: '个人执业' })
const litInhouseSteps = steps('litigation-legal', { litigationRole: '企业法务' })
const litLawyerSteps = steps('litigation-legal', { litigationRole: '律所律师' })

// 首步一定是身份——身份没选就不能谈后面问什么
eq('商事法务版·首步是身份', comInhouseSteps[0], IDENTITY_STEP)
eq('商事律师版·首步是身份', comLawyerSteps[0], IDENTITY_STEP)
eq('诉讼法务版·首步是身份', litInhouseSteps[0], IDENTITY_STEP)
eq('诉讼律师版·首步是身份', litLawyerSteps[0], IDENTITY_STEP)

has('商事法务版·有审批与上报步骤', comInhouseSteps, '审批与上报')
hasNot('商事法务版·无事项工作空间步骤', comInhouseSteps, '事项工作空间')
has('商事律师版·有事项工作空间步骤', comLawyerSteps, '事项工作空间')
hasNot('商事律师版·无审批与上报步骤', comLawyerSteps, '审批与上报')

has('诉讼法务版·有重大性阈值步骤', litInhouseSteps, '重大性阈值')
has('诉讼法务版·有和解权限步骤', litInhouseSteps, '和解权限阶梯')
has('诉讼法务版·有保险覆盖步骤', litInhouseSteps, '保险覆盖')
has('诉讼法务版·有外部律师库步骤', litInhouseSteps, '外部律师库')
hasNot('诉讼法务版·无利益冲突排查步骤', litInhouseSteps, '利益冲突排查')
hasNot('诉讼法务版·无律师执业实务步骤', litInhouseSteps, '律师执业实务')
has('诉讼律师版·有利益冲突排查步骤', litLawyerSteps, '利益冲突排查')
has('诉讼律师版·有律师执业实务步骤', litLawyerSteps, '律师执业实务')
hasNot('诉讼律师版·无重大性阈值步骤', litLawyerSteps, '重大性阈值')
hasNot('诉讼律师版·无保险覆盖步骤', litLawyerSteps, '保险覆盖')

// 步骤数量落在设计区间（5-7 步是「共享 + 专属」的合理规模）
check('商事法务版步骤数 5-9', comInhouseSteps.length >= 5 && comInhouseSteps.length <= 9)
check('商事律师版步骤数 5-9', comLawyerSteps.length >= 5 && comLawyerSteps.length <= 9)
check('诉讼法务版步骤数 5-15', litInhouseSteps.length >= 5 && litInhouseSteps.length <= 15)
check('诉讼律师版步骤数 5-15', litLawyerSteps.length >= 5 && litLawyerSteps.length <= 15)

// ── 场景 5：商事合同手册按「当前操作方」显隐 ──
const salesOnly = visibleSteps(comInhouseSteps, 'commercial-legal', { reviewSide: '销售方' })
const purchaseOnly = visibleSteps(comInhouseSteps, 'commercial-legal', { reviewSide: '采购方' })
const bothSides = visibleSteps(comInhouseSteps, 'commercial-legal', { reviewSide: '双方' })
const noSide = visibleSteps(comInhouseSteps, 'commercial-legal', {})

has('选销售方·显示销售方手册', salesOnly, SALES_STEP)
hasNot('选销售方·隐藏采购方手册', salesOnly, PURCHASE_STEP)
has('选采购方·显示采购方手册', purchaseOnly, PURCHASE_STEP)
hasNot('选采购方·隐藏销售方手册', purchaseOnly, SALES_STEP)
has('选双方·两本手册都在', bothSides, SALES_STEP)
has('选双方·两本手册都在（采购）', bothSides, PURCHASE_STEP)
hasNot('未选方向·不显示销售方手册', noSide, SALES_STEP)
hasNot('未选方向·不显示采购方手册', noSide, PURCHASE_STEP)
eq('诉讼领域·操作方过滤不生效', visibleSteps(litInhouseSteps, 'litigation-legal', {}).length, litInhouseSteps.length)

// 销售方/采购方字段确实只挂在各自的步骤上
const salesFields = FULL_COMMERCIAL_FIELDS.filter(field => field.step === SALES_STEP)
const purchaseFields = FULL_COMMERCIAL_FIELDS.filter(field => field.step === PURCHASE_STEP)
check('销售方手册字段都带销售方前缀', salesFields.every(field => field.id.startsWith('sales')))
check('采购方手册字段都带采购方前缀', purchaseFields.every(field => field.id.startsWith('purchase')))
eq('两侧手册字段数相同（结构同形）', salesFields.length, purchaseFields.length)

// ── 场景 6：Markdown 渲染的 marker 与产物识别 ──
const sample = {
  practiceSetting: '企业法务',
  userRole: '律师/法律专业人士',
  orgName: '某某科技有限公司',
  escAmountThreshold: '>500 万须业务与 CFO 联批',
}
const comFields = fullProfileFieldsFor('commercial-legal', sample) ?? []
const fullMd = renderProfileMarkdown('商事合同实务画像', comFields, sample, 'full')
const quickMd = renderProfileMarkdown('商事合同实务画像', profileFieldsFor('commercial-legal'), sample)

check('完整问卷产物标注「完整问卷」', fullMd.includes('实务画像 · 完整问卷'))
check('快速配置产物标注「快速配置」（回归）', quickMd.includes('实务画像 · 快速配置'))
check('完整问卷产物被认成表单产物', isFormGenerated(fullMd))
check('快速配置产物被认成表单产物（回归）', isFormGenerated(quickMd))
check('模型自由撰写的画像不被认成表单产物', !isFormGenerated('# 商事合同实务画像\n\n**风险偏好：** 稳健'))

// ── 场景 7：回填写盘往返（L2 完整问卷）──
const back = parseProfileFields(fullMd, comFields)
eq('往返·身份字段读回', back.practiceSetting, '企业法务')
eq('往返·法务专属字段读回', back.escAmountThreshold, '>500 万须业务与 CFO 联批')
eq('往返·共享字段读回', back.orgName, '某某科技有限公司')
check('往返·未填字段不产生值', !('painPoint' in back))
eq('落空字段数 = 总字段数 - 已填数',
  countPlaceholders(fullMd), comFields.length - Object.keys(sample).length)

// 画像写盘后再读回，身份仍然成立——否则下次进来会跳到另一套问卷
eq('往返后身份判定不变', identityFor('commercial-legal', back), 'inhouse')

// L1 快速配置的往返（回归）
const quickBack = parseProfileFields(quickMd, profileFieldsFor('commercial-legal'))
eq('L1 往返·身份字段读回', quickBack.practiceSetting, '企业法务')
eq('L1 往返·上报阈值读回', quickBack.escalationThreshold, undefined)

// ── 场景 7b：切 Tab 保存不丢内容（两个 Tab 共用一份 values，字段表不同）──
// 场景：先在 L1 填了责任上限/deal-breaker，又进了完整问卷填了审批阈值。
const mixed = {
  practiceSetting: '企业法务',
  liabilityCap: '12 个月服务费',      // L1 独有
  dealBreaker: '不接受间接损失无限责任', // L1 独有
  escAmountThreshold: '>500 万联批',   // 完整问卷·法务专属
  painPoint: '条款谈判来回太多',        // 两表共有
}
const mixedFull = fullProfileFieldsFor('commercial-legal', mixed) ?? []
const mixedQuick = profileFieldsFor('commercial-legal')
const savedFromFull = mergeFieldsForSave(mixedFull, mixedQuick, mixed)
const savedFromQuick = mergeFieldsForSave(mixedQuick, mixedFull, mixed)

check('L2 保存·带上 L1 独有的已填项（责任上限）', savedFromFull.some(f => f.id === 'liabilityCap'))
check('L2 保存·带上 L1 独有的已填项（deal-breaker）', savedFromFull.some(f => f.id === 'dealBreaker'))
check('L2 保存·残留项归入独立分组',
  savedFromFull.filter(f => f.id === 'liabilityCap').every(f => f.group === SAVED_ELSEWHERE_GROUP))
check('L2 保存·残留项不挂任何问卷步骤',
  savedFromFull.filter(f => f.id === 'liabilityCap').every(f => f.step === undefined))
const mixedFullMd = renderProfileMarkdown('商事合同实务画像', savedFromFull, mixed, 'full')
check('L2 保存·画像里能读到责任上限', mixedFullMd.includes('**责任上限：** 12 个月服务费'))
check('L2 保存·画像里能读到法务专属项', mixedFullMd.includes('**金额阈值：** >500 万联批'))

check('L1 保存·带上完整问卷独有的已填项', savedFromQuick.some(f => f.id === 'escAmountThreshold'))
eq('L1 保存·两表共有的字段不重复纳入',
  savedFromQuick.filter(f => f.id === 'painPoint').length, 1)
const mixedQuickMd = renderProfileMarkdown('商事合同实务画像', savedFromQuick, mixed)
check('L1 保存·画像里能读到法务专属项', mixedQuickMd.includes('**金额阈值：** >500 万联批'))

// 另一张表里没填的字段不该被带进来（否则画像里凭空多出一堆占位符）
check('另一张表里未填的字段不带入', !savedFromFull.some(f => f.id === 'governingLaw'))
eq('无残留项时原样返回 primary', mergeFieldsForSave(mixedFull, mixedQuick, {}).length, mixedFull.length)

// 换身份后，旧身份的专属字段不残留（secondary 是 L1 表，不含它）
const switchedToLawyer = fullProfileFieldsFor('commercial-legal', { practiceSetting: '个人执业' }) ?? []
check('换身份后·法务专属字段不残留',
  !mergeFieldsForSave(switchedToLawyer, mixedQuick, { ...mixed, practiceSetting: '个人执业' })
    .some(f => f.id === 'escAmountThreshold'))

// ── 场景 8：字段元数据的完整性（parse 依赖 label 唯一）──
function checkUnique(name: string, fields: readonly { id: string; label: string }[]): void {
  eq(`${name}·id 唯一`, new Set(fields.map(f => f.id)).size, fields.length)
  eq(`${name}·label 唯一`, new Set(fields.map(f => f.label)).size, fields.length)
}
checkUnique('商事完整表', FULL_COMMERCIAL_FIELDS)
checkUnique('诉讼完整表', FULL_LITIGATION_FIELDS)
check('商事完整表·每个字段都有 step', FULL_COMMERCIAL_FIELDS.every(f => f.step !== undefined))
check('诉讼完整表·每个字段都有 step', FULL_LITIGATION_FIELDS.every(f => f.step !== undefined))
check('商事完整表·每个字段都有 group', FULL_COMMERCIAL_FIELDS.every(f => f.group !== ''))
check('诉讼完整表·每个字段都有 group', FULL_LITIGATION_FIELDS.every(f => f.group !== ''))
check('商事完整表·确实含两类专属字段',
  FULL_COMMERCIAL_FIELDS.some(f => f.role === 'inhouse')
  && FULL_COMMERCIAL_FIELDS.some(f => f.role === 'lawyer'))
check('诉讼完整表·确实含两类专属字段',
  FULL_LITIGATION_FIELDS.some(f => f.role === 'inhouse')
  && FULL_LITIGATION_FIELDS.some(f => f.role === 'lawyer'))

// ── 场景 9：L1 回归（快速配置未被破坏）──
const comQuick = profileFieldsFor('commercial-legal')
const litQuick = profileFieldsFor('litigation-legal')
eq('L1 商事字段数不变', comQuick.length, 11)
eq('L1 诉讼字段数不变', litQuick.length, 11)
const comIdentityField = comQuick.find(field => field.id === 'practiceSetting')
const litIdentityField = litQuick.find(field => field.id === 'litigationRole')
check('L1 商事·身份字段选项含企业法务（与完整问卷同一套措辞）',
  comIdentityField?.options?.includes('企业法务') === true)
check('L1 诉讼·身份字段选项含企业法务（与完整问卷同一套措辞）',
  litIdentityField?.options?.includes('企业法务') === true)
check('L1 字段不带 step（只用于 L1 表单，不参与分步）',
  comQuick.every(field => field.step === undefined))

// ── 场景 10：未特化领域的行为 ──
eq('未特化领域无完整问卷', fullProfileFieldsFor('employment-legal', {}), undefined)
check('未特化领域 hasFullQuestionnaire 为假', !hasFullQuestionnaire('employment-legal'))
check('商事有完整问卷', hasFullQuestionnaire('commercial-legal'))
check('诉讼有完整问卷', hasFullQuestionnaire('litigation-legal'))

// ── 汇总 ──
if (failures.length > 0) {
  console.error(`FAIL ${failures.length} / ${passed + failures.length}`)
  for (const item of failures) console.error(`  ✗ ${item}`)
  process.exit(1)
}
console.log(`PASS ${passed} assertions`)

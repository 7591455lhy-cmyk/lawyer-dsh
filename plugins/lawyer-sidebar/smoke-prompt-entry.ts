/**
 * lawyer-dsh prompt 组装冒烟入口（smoke-prompt.ps1 bundle 后 node 执行）。
 * 场景：案件分析（目录引用+散文件+图片+文本）、文书生成（含空格目录+无材料）、
 * 合同审核（目录引用+技能配置）；每个入口追加 M7 的三层内部调用规程断言
 * （skills/插件、MCP、子代理）。改动 prompt.ts / FilePickerValue / legalZh.ts
 * 语义后请复跑。
 */
import { buildCaseAnalysisPrompt } from './src/client/prompt.ts'
import { buildDocGenerationPrompt } from './src/client/prompt.ts'
import { buildContractReviewPrompt } from './src/client/prompt.ts'
import { buildCustomEntryPrompt, buildProfileInterviewPrompt, initialValues } from './src/client/prompt.ts'
import type { CustomLawyerEntry } from './src/client/config.ts'
import { normalizeEntries } from './src/client/config.ts'
import {
  PROFILE_DOMAINS,
  hasSpecializedFields,
  profileFieldsFor,
} from './src/client/profileFields.ts'
import {
  countPlaceholders,
  isFormGenerated,
  parseProfileFields,
  renderProfileMarkdown,
} from './src/client/profileMarkdown.ts'

let failures = 0
function check(name: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log(`  PASS ${name}`)
  } else {
    failures++
    console.error(`  FAIL ${name}${detail !== undefined ? `: ${detail}` : ''}`)
  }
}

// ── 场景 1：案件分析，文件夹上传（目录引用）+ 散文件 + 图片 + 文本 ──
{
  const prompt = buildCaseAnalysisPrompt({
    stance: '原告方',
    focus: ['facts', 'evidence'],
    paths: [
      'D:/ws/.lawyer-uploads/案卷材料/',          // 文件夹上传 → 目录引用
      'D:/ws/.lawyer-uploads/起诉状.docx',        // 散文件上传
      '证据/微信聊天记录.pdf',                     // 工作区候选点选（相对路径文件）
    ],
    images: [{ name: '案卷材料/证据1.png', mediaType: 'image/png', data: 'x', bytes: 1234 }],
    texts: [{ name: '案卷材料/笔录.txt', content: '当事人陈述……' }],
  })
  console.log('── 场景 1：案件分析（混合材料） ──')
  check('手势 /case-analysis', prompt.includes('/case-analysis'))
  check('目录引用行（先列目录再逐个读取）',
    prompt.includes('@D:/ws/.lawyer-uploads/案卷材料/（材料目录——请先用文件列表工具列出该目录下的全部文件，再逐个读取后使用'),
    prompt)
  check('散文件引用行（读取全文）',
    prompt.includes('@D:/ws/.lawyer-uploads/起诉状.docx（用户明确引用的文件，请先用文件读取工具读取全文再分析）'))
  check('工作区相对路径文件行', prompt.includes('@证据/微信聊天记录.pdf（用户明确引用的文件'))
  check('图片附件计数行', prompt.includes('材料扫描件/拍照图片 1 张'))
  check('内嵌文本块', prompt.includes('材料文本（来自 案卷材料/笔录.txt）'))
  check('M7 adapter 手势 /chinese-legal-litigation', prompt.includes('/chinese-legal-litigation'), prompt)
  check('M7 技能层：adapter 路径解析协议', prompt.includes('~/.dsh/legal-zh/repo'), prompt)
  check('M7 技能层：领域 CLAUDE.md', prompt.includes('litigation-legal/CLAUDE.md'))
  check('M7 技能层：六维度风险评价', prompt.includes('风险敞口'))
  check('M7 MCP 层：工具命名规范', prompt.includes('mcp__law__*') && prompt.includes('mcp__case__*'), prompt)
  check('M7 MCP 层：三轮检索', prompt.includes('第二轮'))
  check('M7 MCP 层：来源溯源标签', prompt.includes('[法条原文]'))
  check('M7 子代理层：Agentic Search 路由', prompt.includes('C1') && prompt.includes('C2') && prompt.includes('C3'), prompt)
  check('M7 子代理层：并行分派维度', prompt.includes('请求权基础'))
  check('M7 法律输出规则', prompt.includes('律师审查草稿'))
}

// ── 场景 2：文书生成，含空格目录 + 空材料 ──
{
  const withDir = buildDocGenerationPrompt({
    docType: '民事起诉状',
    partyRole: '原告',
    notes: '',
    paths: ['D:/ws/.lawyer-uploads/张三 案卷/'],
    images: [],
    texts: [],
  })
  console.log('── 场景 2：文书生成（含空格目录） ──')
  check('手势 /doc-generation', withDir.includes('/doc-generation'))
  check('空格目录用引号语法 @"…" 且保留尾斜杠',
    withDir.includes('@"D:/ws/.lawyer-uploads/张三 案卷/"（材料目录'),
    withDir)

  const empty = buildDocGenerationPrompt({
    docType: '代理词',
    partyRole: '被告',
    notes: '',
    paths: [],
    images: [],
    texts: [],
  })
  check('无材料提示', empty.includes('（未提供，请先向用户索取案件背景材料）'))
  check('M7 adapter 手势 /chinese-legal-litigation', withDir.includes('/chinese-legal-litigation'), withDir)
  check('M7 技能层：主技能 brief-section-drafter',
    withDir.includes('litigation-legal/skills/brief-section-drafter/SKILL.md'), withDir)
  check('M7 文书纪律：五组内容分离', withDir.includes('五组内容分离'), withDir)
  check('M7 MCP 层：法条效力核验', withDir.includes('核验现行效力'), withDir)
  check('M7 子代理层：必做核验', withDir.includes('不受 C1/C2 门控'), withDir)
}

// ── 场景 3：合同审核，目录引用 + 技能配置默认全开 ──
{
  const prompt = buildContractReviewPrompt({
    stance: '买方',
    strictness: '常规',
    reviewerName: '',
    skills: { review: true, preprocess: true, output: true, extraSkills: [] },
    paths: ['D:/ws/.lawyer-uploads/合同包/'],
    images: [],
    texts: [],
  })
  console.log('── 场景 3：合同审核（文件夹输入） ──')
  check('手势 /contract-review', prompt.includes('/contract-review'))
  check('目录引用行', prompt.includes('@D:/ws/.lawyer-uploads/合同包/（材料目录'))
  check('M7 adapter 手势 /chinese-legal-commercial', prompt.includes('/chinese-legal-commercial'), prompt)
  check('M7 技能层：adapter 始终启用', prompt.includes('chinese-legal-commercial：始终启用'), prompt)
  check('M7 技能层：质量门禁参考文件',
    prompt.includes('references/contract-review-quality-gates.md'), prompt)
  check('M7 技能层：候选技能路由', prompt.includes('commercial-legal/skills/nda-review/SKILL.md'), prompt)
  check('M7 严格程度 → 严重程度标尺', prompt.includes('严重程度标尺'), prompt)
  check('M7 MCP 层：降级纪律', prompt.includes('未连接法规/案例检索工具'), prompt)
  check('M7 子代理层：并行分派维度', prompt.includes('行业监管'), prompt)

  // 关闭 contract-review 时，adapter 仍须在场，且本地产出技能降级说明正确。
  const withoutLocal = buildContractReviewPrompt({
    stance: '卖方',
    strictness: '宽松',
    reviewerName: '',
    skills: { review: false, preprocess: false, output: false, extraSkills: [] },
    paths: [],
    images: [],
    texts: [],
  })
  check('M7 本地技能未启用时 adapter 仍在', withoutLocal.includes('/chinese-legal-commercial'), withoutLocal)
  check('M7 本地技能未启用时的产出形态兜底',
    withoutLocal.includes('本地产出技能本次未启用'), withoutLocal)
}

// ── 场景 4：自定义法律功能（模板 + 三种字段 + 法律事项 + 关闭子代理）──
{
  const entry: CustomLawyerEntry = {
    kind: 'custom',
    id: 'custom-diligence',
    label: '供应商尽调',
    skill: 'due-diligence',
    template: '请对 {{target}} 做尽职调查。\n\n关注范围：{{scope}}\n\n材料：{{material}}',
    fields: [
      { id: 'target', label: '目标公司', type: 'text' },
      { id: 'scope', label: '关注范围', type: 'checkbox', options: ['股权结构', '重大合同', '诉讼仲裁'] },
      { id: 'material', label: '尽调材料', type: 'files' },
    ],
    legal: {
      domain: 'corporate-legal',
      adapter: 'chinese-legal-corporate',
      skills: ['diligence-issue-extraction'],
      subagent: 'none',
    },
  }
  const prompt = buildCustomEntryPrompt({
    entry,
    values: {
      target: '某某科技',
      scope: ['股权结构', '诉讼仲裁'],
      material: { paths: ['D:/ws/.lawyer-uploads/尽调包/'], images: [], texts: [] },
    },
  })
  console.log('── 场景 4：自定义法律功能（模板渲染 + 三层规程） ──')
  check('M8 手势顺序：领域 adapter 排在主技能之前',
    prompt.indexOf('/chinese-legal-corporate') < prompt.indexOf('/due-diligence'), prompt)
  check('M8 模板渲染：文本字段', prompt.includes('请对 某某科技 做尽职调查'), prompt)
  check('M8 模板渲染：多选用「、」连接', prompt.includes('关注范围：股权结构、诉讼仲裁'), prompt)
  check('M8 模板渲染：files 就地展开为材料块',
    prompt.includes('尽调材料：') && prompt.includes('@D:/ws/.lawyer-uploads/尽调包/（材料目录'), prompt)
  check('M8 技能层：领域 CLAUDE.md', prompt.includes('corporate-legal/CLAUDE.md'), prompt)
  check('M8 技能层：指定原始技能',
    prompt.includes('corporate-legal/skills/diligence-issue-extraction/SKILL.md'), prompt)
  check('M8 技能层：画像路径随领域走', prompt.includes('~/.dsh/legal-zh/corporate-legal/CLAUDE.md'), prompt)
  check('M8 MCP 层：工具命名规范', prompt.includes('mcp__law__*') && prompt.includes('mcp__case__*'), prompt)
  check('M8 子代理 none：明确不启用', prompt.includes('本次不启用') && prompt.includes('不要 spawn subagent'), prompt)
  check('M8 法律输出规则', prompt.includes('律师审查草稿'), prompt)
}

// ── 场景 5：旧形态自定义入口（无模板无字段）+ 非法律事项 ──
{
  const entry: CustomLawyerEntry = {
    kind: 'custom',
    id: 'custom-notes',
    label: '会议纪要整理',
    skill: 'meeting-notes',
    purpose: '把会议转写整理成结构化纪要',
  }
  const prompt = buildCustomEntryPrompt({ entry, values: { instruction: '重点保留结论与待办' } })
  console.log('── 场景 5：旧形态自定义入口（零回归） ──')
  check('M8 旧入口：首行仅主技能手势', prompt.includes('请开始会议纪要整理 /meeting-notes'), prompt)
  check('M8 旧入口：任务目标', prompt.includes('任务目标：把会议转写整理成结构化纪要'), prompt)
  check('M8 旧入口：补充说明（隐式字段）', prompt.includes('补充说明：重点保留结论与待办'), prompt)
  check('M8 非法律功能不带内部调用规程', !prompt.includes('内部调用规程'), prompt)
}

// ── 场景 6：无模板（字段按「标签：值」列出）+ 材料块追加 + 子代理复用 ──
{
  const entry: CustomLawyerEntry = {
    kind: 'custom',
    id: 'custom-ip',
    label: '知产侵权评估',
    skill: 'ip-assessment',
    fields: [
      { id: 'product', label: '涉案产品', type: 'select', options: ['A 产品', 'B 产品'] },
      { id: 'evidence', label: '证据材料', type: 'files', dropHint: '拖入证据' },
    ],
    legal: { domain: 'ip-legal', adapter: 'chinese-legal-ip', skills: [], subagent: 'caseAnalysis' },
  }
  const values = initialValues(entry.fields ?? [])
  check('M8 initialValues：select 取首项', values['product'] === 'A 产品')
  check('M8 initialValues：files 为空集合',
    typeof values['evidence'] !== 'string' && !Array.isArray(values['evidence'])
    && (values['evidence'] as { paths: readonly string[] }).paths.length === 0)

  const prompt = buildCustomEntryPrompt({
    entry,
    values: {
      product: 'B 产品',
      evidence: { paths: ['D:/ws/证据/对比表.xlsx'], images: [], texts: [] },
    },
  })
  console.log('── 场景 6：无模板 + 材料追加 + 子代理复用 ──')
  check('M8 无模板：字段以「标签：值」列出', prompt.includes('涉案产品：B 产品'), prompt)
  check('M8 未被引用的 files 字段追加在末尾',
    prompt.indexOf('证据材料：') > prompt.indexOf('涉案产品：'), prompt)
  check('M8 文件行带读取提示', prompt.includes('@D:/ws/证据/对比表.xlsx（用户明确引用的文件'), prompt)
  check('M8 未指定原始技能时的退化表述', prompt.includes('未指定原始技能'), prompt)
  check('M8 子代理复用案件分析口径',
    prompt.includes('请求权基础') && !prompt.includes('本次不启用'), prompt)
}

// ── 场景 7：配置通道脏数据规范化 → 指令（端到端） ────────────────────────
{
  const entries = normalizeEntries([
    { kind: 'builtin', id: 'contract-review' },
    {
      kind: 'custom',
      id: 'custom-x',
      label: '股权转让审查',
      skill: 'equity-transfer',
      hint: '股权 / 优先购买权',
      icon: 'scale',
      template: '审查 {{doc}}',
      fields: [
        { id: 'doc', label: '转让协议', type: 'files' },
        { id: 'bad', type: 'text' },                                  // 缺 label → 丢弃
        { id: 'doc', label: '重复 id', type: 'text' },                 // 重复 id → 丢弃
        { id: 'party', label: '受让方', type: 'radio', options: [] },  // 无选项 → 丢弃
      ],
      legal: {
        domain: 'corporate-legal',
        adapter: 'chinese-legal-corporate',
        skills: ['board-minutes', 'BAD NAME'],                         // 非法名 → 过滤
        subagent: 'contractReview',
        references: ['references/due-diligence-workflow.md'],
      },
      extraSkills: ['equity-transfer', 'docx-tracked-changes'],        // 与主技能同名 → 过滤
    },
    { kind: 'custom', id: 'bad-entry', label: '缺技能' },              // 缺 skill → 丢弃
  ])
  console.log('── 场景 7：配置规范化（脏数据）→ 指令 ──')
  check('M8 规范化：内置入口保留、非法条目丢弃',
    entries.length === 2 && entries[0].kind === 'builtin', JSON.stringify(entries.map(item => item.id)))
  const custom = entries[1]
  if (custom.kind !== 'custom') {
    check('M8 规范化：自定义入口存活', false, JSON.stringify(custom))
  } else {
    check('M8 规范化：字段过滤（缺 label / 重复 id / 无选项）',
      custom.fields?.length === 1 && custom.fields[0].id === 'doc', JSON.stringify(custom.fields))
    check('M8 规范化：附加技能去重并排除主技能',
      custom.extraSkills?.length === 1 && custom.extraSkills[0] === 'docx-tracked-changes',
      JSON.stringify(custom.extraSkills))
    check('M8 规范化：领域技能按 kebab-case 过滤',
      custom.legal?.skills.length === 1 && custom.legal.skills[0] === 'board-minutes',
      JSON.stringify(custom.legal?.skills))
    check('M8 规范化：hint / icon / template 保留',
      custom.hint === '股权 / 优先购买权' && custom.icon === 'scale' && custom.template === '审查 {{doc}}')
    check('M8 规范化：agentPreset 缺省 lawyer', custom.agentPreset === 'lawyer', custom.agentPreset)
    check('M8 规范化：法律参考文件保留',
      custom.legal?.references?.[0] === 'references/due-diligence-workflow.md')

    const prompt = buildCustomEntryPrompt({
      entry: custom,
      values: { doc: { paths: ['D:/ws/协议.pdf'], images: [], texts: [] } },
    })
    check('M8 端到端：模板渲染（files 就地为材料块）', prompt.includes('审查 转让协议：'), prompt)
    check('M8 端到端：法律规程带子代理合同口径', prompt.includes('行业监管'), prompt)
    check('M8 端到端：强制参考文件进入指令',
      prompt.includes('references/due-diligence-workflow.md'), prompt)
  }
}

// ── 场景 8：实务画像（M8.5）——画像状态进指令 + 访谈指令 ──────────────────
{
  console.log('── 场景 8：实务画像（画像状态进指令 + 访谈指令）──')

  // 画像已配置：指令给出 canonical 绝对路径，且不再出现"未配置"的兜底话术。
  const configured = buildContractReviewPrompt(
    {
      stance: '买方',
      strictness: '常规',
      reviewerName: '',
      skills: { review: true, preprocess: true, output: true, extraSkills: [] },
      paths: [],
      images: [],
      texts: [],
    },
    { path: 'C:/Users/x/dsh-home/legal-zh/commercial-legal/CLAUDE.md', configured: true, placeholderCount: 0 },
  )
  check('M8.5 已配置：指令携带 canonical 绝对路径',
    configured.includes('C:/Users/x/dsh-home/legal-zh/commercial-legal/CLAUDE.md'), configured)
  check('M8.5 已配置：要求动笔前先读取', configured.includes('动笔前先读取'), configured)
  check('M8.5 已配置：不再出现未配置兜底话术', !configured.includes('本次未配置'), configured)

  // 画像存在但未填完：要标明剩余占位符数。
  const partial = buildCaseAnalysisPrompt(
    { stance: '被告方', focus: ['facts'], paths: [], images: [], texts: [] },
    { path: 'D:/home/legal-zh/litigation-legal/CLAUDE.md', configured: false, placeholderCount: 7 },
  )
  check('M8.5 未填完：标注剩余占位符数', partial.includes('7 处 [PLACEHOLDER]'), partial)

  // 画像不存在：按通用标准输出，指令不得要求停下来追问（引导在 UI 层）。
  const missing = buildDocGenerationPrompt(
    { docType: '民事起诉状', partyRole: '原告', notes: '', paths: [], images: [], texts: [] },
    { path: 'D:/home/legal-zh/litigation-legal/CLAUDE.md', configured: false, placeholderCount: 0 },
  )
  check('M8.5 未配置：按通用标准输出', missing.includes('按通用标准产出'), missing)
  check('M8.5 未配置：不打断任务流程', missing.includes('不要停下来追问'), missing)
  check('M8.5 未配置：提示可去右侧栏补充', missing.includes('右侧栏「实务画像」'), missing)

  // RPC 不可用（profile 缺省）：退回两条路径兜底，不得出现空档。
  const unknown = buildContractReviewPrompt({
    stance: '买方',
    strictness: '常规',
    reviewerName: '',
    skills: { review: true, preprocess: true, output: true, extraSkills: [] },
    paths: [],
    images: [],
    texts: [],
  })
  check('M8.5 RPC 不可用：退回 ~/.dsh 与 $env:DSH_HOME 两条路径',
    unknown.includes('~/.dsh/legal-zh/commercial-legal/CLAUDE.md')
      && unknown.includes('$env:DSH_HOME/legal-zh/commercial-legal/CLAUDE.md'), unknown)
}

// ── 场景 9：L2 冷启动访谈指令 ────────────────────────────────────────────
{
  console.log('── 场景 9：L2 访谈指令（路径硬覆盖 + 四种模式）──')
  const base = {
    domain: 'commercial-legal',
    adapter: 'chinese-legal-commercial',
    profilePath: 'C:/Users/x/dsh-home/legal-zh/commercial-legal/CLAUDE.md',
  }
  const quick = buildProfileInterviewPrompt({ ...base, profileExists: false, mode: 'quick' })
  check('M8.5 访谈：首行带 adapter 手势', quick.startsWith('请开始实务画像配置 /chinese-legal-commercial'), quick)
  check('M8.5 访谈：硬覆盖画像路径',
    quick.includes('C:/Users/x/dsh-home/legal-zh/commercial-legal/CLAUDE.md'), quick)
  check('M8.5 访谈：显式忽略技能原文路径',
    quick.includes('~/.claude/plugins/config') && quick.includes('一律忽略'), quick)
  check('M8.5 访谈：引用 cold-start-interview 脚本',
    quick.includes('commercial-legal/skills/cold-start-interview/SKILL.md'), quick)
  check('M8.5 访谈：节奏纪律（每轮题数 + 等待输入 + 暂停恢复）',
    quick.includes('每轮不超过 2-3 个问题')
      && quick.includes('我会等待')
      && quick.includes('SETUP PAUSED AT'), quick)
  check('M8.5 访谈：禁止 YAML + 留空落占位符',
    quick.includes('不要写 YAML') && quick.includes('[PLACEHOLDER]'), quick)
  check('M8.5 访谈：不跳过种子文件', quick.includes('种子文件'), quick)

  check('M8.5 访谈 quick：2 分钟档文案', quick.includes('2 分钟快速'), quick)
  check('M8.5 访谈 full：15 分钟档文案',
    buildProfileInterviewPrompt({ ...base, profileExists: false, mode: 'full' }).includes('15 分钟完整'))
  const redo = buildProfileInterviewPrompt({ ...base, profileExists: true, mode: 'redo' })
  check('M8.5 访谈 redo：覆盖前展示差异', redo.includes('覆盖前先展示与现有画像的差异'), redo)
  check('M8.5 访谈 integrations：只检测不重跑',
    buildProfileInterviewPrompt({ ...base, profileExists: true, mode: 'integrations' })
      .includes('不重跑访谈'))
}

// ── 场景 10：画像 Markdown 渲染 / 解析往返 ────────────────────────────────
{
  console.log('── 场景 10：画像 Markdown 渲染 / 解析往返 ──')
  const fields = profileFieldsFor('commercial-legal')
  const markdown = renderProfileMarkdown('商事合同实务画像', fields, {
    practiceSetting: '中型律所',
    reviewSide: '采购方',
    // liabilityCap / dealBreaker 留空 → 应落 [PLACEHOLDER]
  })
  check('M8.5 渲染：已填字段落值', markdown.includes('**执业场景：** 中型律所'), markdown)
  check('M8.5 渲染：未填字段落占位符', markdown.includes('**责任上限：** [PLACEHOLDER]'), markdown)
  check('M8.5 渲染：分组小节存在',
    markdown.includes('## 我们是谁') && markdown.includes('## 审查指引'), markdown)
  check('M8.5 渲染：占位符计数与 Host 口径一致',
    countPlaceholders(markdown) === fields.length - 2, String(countPlaceholders(markdown)))

  const parsed = parseProfileFields(markdown, fields)
  check('M8.5 解析：值回填', parsed.practiceSetting === '中型律所' && parsed.reviewSide === '采购方')
  check('M8.5 解析：占位符视为未填', parsed.liabilityCap === undefined)
  check('M8.5 解析：非表单产物识别为 false', isFormGenerated('# 手写画像\n\n内容') === false)
  check('M8.5 解析：表单产物识别为 true', isFormGenerated(markdown) === true)

  // 未特化的领域回退通用字段，且被面板识别为"建议走完整访谈"。
  check('M8.5 通用字段：未特化领域有兜底字段', profileFieldsFor('ip-legal').length > 0)
  check('M8.5 通用字段：未特化领域标记为无特化字段', hasSpecializedFields('ip-legal') === false)
  check('M8.5 通用字段：两个常用领域有特化字段',
    hasSpecializedFields('commercial-legal') && hasSpecializedFields('litigation-legal'))
  check('M8.5 领域表：13 个领域且 adapter 齐全',
    PROFILE_DOMAINS.length === 13 && PROFILE_DOMAINS.every(item => item.adapter.startsWith('chinese-legal-')),
    String(PROFILE_DOMAINS.length))
}

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAIL`)
if (failures > 0) process.exitCode = 1

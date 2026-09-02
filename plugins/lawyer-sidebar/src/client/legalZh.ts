/**
 * claude-for-legal-ZH 规范适配层（M7）。
 *
 * 仓库 https://github.com/CSlawyer1985/claude-for-legal-ZH 是 Anthropic
 * claude-for-legal 的中国法适配版，其 dsh 适配层（`.dsh/skills/chinese-legal-*`）
 * 由 scripts/install-legal-zh.ps1 装入 `$DSH_HOME/skills`（dsh 本地发现 rank 400
 * `user-dsh`，见 docs/subsystems/skills.zh.md），并登记仓库根到
 * `$DSH_HOME/legal-zh/repo`、写入 `$DSH_HOME/AGENTS.md` 的 legal-zh 受管块。
 *
 * adapter 本身不重写法律工作流，只把自然语言请求路由到仓库里的领域 CLAUDE.md
 * 与 skills/<name>/SKILL.md。因此本模块不复制工作流正文，而是把「路由协议 + 三层内部
 * 调用规程」写进入口指令，让模型按仓库约定的方式去取用：
 *
 *   一、技能与插件调用 —— /chinese-legal-* 手势 + 领域文件路径解析协议
 *   二、MCP 检索调用   —— mcp__<server>__<tool> + 三轮检索 + 来源溯源标签
 *   三、子代理调用     —— Agentic Search 三层路由（C1/C2/C3）+ 并行分派维度
 *
 * 领域约定要点（均取自仓库原文，改动前请回查）：
 *   - `.dsh/skills/<adapter>/SKILL.md`
 *       · Path Resolution：工作区内直接按仓库根解析；否则 `cat ~/.dsh/legal-zh/repo`
 *       · How To Use：先读领域 CLAUDE.md，再读命中的 skills/<name>/SKILL.md，按其流程执行
 *       · Configuration Compatibility：优先复用 Claude 画像，否则用
 *         `~/.dsh/legal-zh/<domain>/CLAUDE.md`；含 [PLACEHOLDER] 时先跑冷启动
 *       · 不执行 Claude Code 专有斜杠命令；/domain:skill 翻译为「读取
 *         <domain>/skills/<skill>/SKILL.md 并按其流程执行」
 *   - `commercial-legal/CLAUDE.md` 共享护栏：双轴严重程度、六维度风险评价、
 *     三轮检索策略、知识库四步协议、合同审核质量门禁
 *   - `litigation-legal/CLAUDE.md` 共享护栏：六维度风险评价、双轴风险评价、
 *     来源溯源标签体系、五组内容分离（诉讼文书编辑纪律）
 *   - `references/agentic-search-routing.md`：C1 自动判定 / C2 管线兜底 / C3 用户指令
 *   - `references/knowledge-base-crossref.md`：四步交叉引用协议 + 来源标注速查
 *   - `references/contract-review-quality-gates.md`：合同审核质量门禁
 */

import type { LegalTaskConfig } from './config.ts'

/** 领域绑定：一个入口对应的 adapter、领域目录、原始技能与强制参考文件。 */
export interface LegalDomainBinding {
  /** dsh adapter 技能名（仓库 .dsh/skills 下 chinese-legal-* 目录名）。 */
  readonly adapter: string
  /** 领域目录名（仓库根下相对路径，adapter 用它定位 CLAUDE.md 与 skills/）。 */
  readonly domain: string
  /** 本次任务要走的原始技能名（<domain>/skills/<name>/SKILL.md）。 */
  readonly primarySkills: readonly string[]
  /** 按材料形态追加的候选原始技能（模型按实际材料择一或组合）。 */
  readonly routedSkills: readonly string[]
  /** 领域内强制适用的共享参考文件（仓库根下相对路径）。 */
  readonly references: readonly string[]
  /** 领域画像路径（dsh 下优先路径，与仓库内模板区分）。 */
  readonly profilePath: string
}

/**
 * 实务画像的运行时状态（Host 侧 lawyerProfile/status 实时查文件的产物）。
 *
 * 画像正文落盘在 Host，Client 不能读文件系统，只能由 Host 告知路径与
 * 状态；指令携带它，模型就不必自行拼接路径——打包版工作台的 DSH_HOME
 * 是安装目录下的 dsh-home，与 adapter 原文写的 ~/.dsh 不是同一处。
 */
export interface ProfileContext {
  /** 画像文件绝对路径（canonical，由 Host 决定）。 */
  readonly path: string
  /** 是否已填充（无 [PLACEHOLDER]）。 */
  readonly configured: boolean
  /** 剩余占位符数量（0 即已配置）。 */
  readonly placeholderCount: number
}

/** 子代理并行分派维度。 */
export interface SubagentLane {
  /** 维度名。 */
  readonly name: string
  /** 交给子代理的任务要点（会原样写入指令）。 */
  readonly brief: string
}

/** 子代理路由配置（对应 references/agentic-search-routing.md）。 */
export interface SubagentPlan {
  /** C1 自动判定在本入口下的具体触发口径。 */
  readonly c1Triggers: readonly string[]
  /** 可并行分派的独立检索维度。 */
  readonly lanes: readonly SubagentLane[]
  /** C2 管线兜底在本入口下的升级条件。 */
  readonly c2Upgrades: readonly string[]
  /** 本入口下不触发子代理的排除项。 */
  readonly excludes: readonly string[]
  /** 常规管线阶段就必须做的核验（不受 C1/C2 门控，必执行）。 */
  readonly mandatoryChecks?: readonly string[]
}

/** 三个功能模块的领域绑定。 */
export const LEGAL_DOMAINS: Readonly<Record<'contractReview' | 'caseAnalysis' | 'docGeneration', LegalDomainBinding>> = {
  contractReview: {
    adapter: 'chinese-legal-commercial',
    domain: 'commercial-legal',
    primarySkills: ['review'],
    routedSkills: ['vendor-agreement-review', 'nda-review', 'saas-msa-review'],
    references: ['references/contract-review-quality-gates.md'],
    profilePath: '~/.dsh/legal-zh/commercial-legal/CLAUDE.md',
  },
  caseAnalysis: {
    adapter: 'chinese-legal-litigation',
    domain: 'litigation-legal',
    primarySkills: ['matter-intake', 'matter-briefing'],
    routedSkills: ['chronology', 'claim-chart', 'privilege-log-review'],
    references: ['references/agentic-search-routing.md'],
    profilePath: '~/.dsh/legal-zh/litigation-legal/CLAUDE.md',
  },
  docGeneration: {
    adapter: 'chinese-legal-litigation',
    domain: 'litigation-legal',
    primarySkills: ['brief-section-drafter'],
    routedSkills: ['demand-draft', 'demand-intake'],
    references: ['references/agentic-search-routing.md'],
    profilePath: '~/.dsh/legal-zh/litigation-legal/CLAUDE.md',
  },
}

/**
 * 本部署挂载的法律检索 MCP（lawyer preset 的 `agent.cordis.yml`）。
 * dsh-mcp-client 的工具命名是 `mcp__<serverName>__<rawName>`（见
 * packages/mcp/mcp-client/README.md「Tool naming」），与仓库 INSTALL_DSH.md
 * 记载的 Claude Code 命名规范同构，故此处按 serverName 声明前缀。
 */
const MCP_ENDPOINTS: readonly { readonly server: string; readonly use: string }[] = [
  { server: 'law', use: '法律法规、司法解释全文检索与条文核验' },
  { server: 'case', use: '裁判文书与类案检索' },
]

/** 来源溯源标签（litigation-legal/CLAUDE.md 与 knowledge-base-crossref.md 速查表）。 */
const SOURCE_LABELS = '[法条原文]（本次会话已核实的条文原文）/ [裁判文书]（具体裁判文书）/ [yuandian检索]（MCP 检索所得，需复核）/ [模型知识 — 需验证]（默认标签）'

/**
 * 生成「一、技能与插件调用」段。
 * @param binding - 入口的领域绑定。
 * @param localSkill - 本工作台的本地产出技能名（已随指令注入全文）；
 *   未启用时传 undefined，此时交付物形态按 adapter 原技能的输出要求执行。
 * @param profile - Host 查到的画像状态；缺省（RPC 不可用）时退回路径兜底文本。
 * @returns 指令行数组。
 */
export function skillLayerLines(
  binding: LegalDomainBinding,
  localSkill: string | undefined,
  profile?: ProfileContext,
): string[] {
  const adapterDesc = `/${binding.adapter}（claude-for-legal-ZH 的 dsh adapter，${binding.domain} 领域路由）`
  // 自定义功能可以只绑领域不指定原始技能（由 adapter 按材料形态自行路由），
  // 此时退化表述，避免出现 "skills/undefined/SKILL.md" 之类的空档。
  const firstSkill = binding.primarySkills[0]
  const loadedLine = localSkill === undefined
    ? `- 已随本指令注入全文：${adapterDesc}${
      firstSkill === undefined ? '' : `、/${firstSkill}（本次指定的领域原始技能）`
    }。本工作台的本地产出技能本次未启用，交付物形态按 ${
      firstSkill === undefined ? 'adapter 路由到的原始技能' : `${binding.domain}/skills/${firstSkill}/SKILL.md`
    } 的输出要求执行。`
    : `- 已随本指令注入全文：${adapterDesc}、/${localSkill}（本工作台的产出技能，决定交付物形态）。二者不冲突：adapter 提供领域工作流与质量门禁，/${localSkill} 提供交付物形态——先按 adapter 走流程，再按 /${localSkill} 出稿。`
  const primaryText = binding.primarySkills.length > 0
    ? `与${binding.primarySkills.map(s => ` ${binding.domain}/skills/${s}/SKILL.md`).join('、')}（原始工作流）`
    : '（本次未指定原始技能——读完 CLAUDE.md 后按任务形态从该领域的 skills/ 目录自行择一，并向用户说明选了哪一个）'
  const lines = [
    '一、技能与插件调用（必执行）：',
    loadedLine,
    // adapter 原文写的是 `cat ~/.dsh/legal-zh/repo`；打包版工作台的 DSH_HOME
    // 是 userData\dsh-home，与 ~/.dsh 不同，故补一条 $env:DSH_HOME 兜底。
    `- 按 adapter 的 Path Resolution 解析领域文件：当前工作区不在仓库内时，先执行 \`cat ~/.dsh/legal-zh/repo\` 取得仓库根目录；该文件不存在时改用 \`cat $env:DSH_HOME/legal-zh/repo\`（本工作台打包版把 DSH_HOME 指到安装目录下，两条命令覆盖两种部署形态）。再依次读取 ${binding.domain}/CLAUDE.md（领域画像与共享护栏，动笔前必读）${primaryText}。`,
  ]
  if (binding.routedSkills.length > 0) {
    lines.push(`- 按材料形态择一或组合追加技能：${binding.routedSkills.map(s => `${binding.domain}/skills/${s}/SKILL.md`).join('、')}。多个技能同时适用时，按工作流隐含顺序执行并合并结论。`)
  }
  lines.push(`- 强制适用的共享参考文件：${binding.references.map(r => `\`${r}\``).join('、')}。`)
  lines.push(...profileLines(binding, profile))
  lines.push(`- 原技能中形如 /${binding.domain.split('-')[0]}-legal:xxx 的是 Claude Code 专有斜杠命令，不要执行；其语义已由 adapter 翻译为「读取 ${binding.domain}/skills/xxx/SKILL.md 并按其流程执行」。Claude hooks 一律忽略。`)
  return lines
}

/**
 * 生成「实务画像」那一行（M8）。
 *
 * 三种形态对应三种真实状态：
 *   - 已配置 → 动笔前读取（仓库要求所有技能「在做任何事前都先读取它」）；
 *   - 已存在但未填完 → 读取已填部分，缺失部分按通用标准，并标注占位符数；
 *   - 不存在 → 按通用标准输出并在交付物顶部标注（引导在 UI 层做，指令层
 *     不再卡流程——这是用户选定的口径）。
 *
 * RPC 不可用（profile 缺省）时退回路径兜底文案：指令无法给出 canonical
 * 绝对路径，只能让模型按 adapter 原文与 $env:DSH_HOME 两条路径自行解析。
 * @param binding - 入口的领域绑定。
 * @param profile - Host 查到的画像状态。
 * @returns 指令行数组（单行）。
 */
function profileLines(binding: LegalDomainBinding, profile: ProfileContext | undefined): string[] {
  if (profile === undefined) {
    return [`- 实务画像：优先复用已填充的 Claude 画像，否则读取 \`${binding.profilePath}\`；该文件不存在时改用 \`$env:DSH_HOME/legal-zh/${binding.domain}/CLAUDE.md\`（打包版工作台把 DSH_HOME 指到安装目录下）。画像缺失或仍含 [PLACEHOLDER] 时不要停下来追问——按通用标准产出并在交付物顶部标注「实务画像未配置，相关判断按通用标准输出；可在右侧栏「实务画像」中补充」。`]
  }
  if (profile.configured) {
    return [`- 实务画像：已配置，动笔前先读取 \`${profile.path}\`——本工作台所有法律功能在做任何事前都先读取它，其中的立场、阈值与行文风格优先于通用标准。`]
  }
  if (profile.placeholderCount > 0) {
    return [`- 实务画像：已存在但未填完，读取 \`${profile.path}\`——已填部分照用，剩余 ${profile.placeholderCount} 处 [PLACEHOLDER] 涉及的判断按通用标准处理，并在交付物顶部标注「画像中仍有 ${profile.placeholderCount} 项未配置，相关判断按通用标准输出」。`]
  }
  return [`- 实务画像：本次未配置（\`${profile.path}\` 不存在）——按通用标准产出，并在交付物顶部标注「实务画像未配置，相关判断按通用标准输出；可在右侧栏「实务画像」中补充」。不要停下来追问用户配置画像。`]
}

/**
 * 生成 L2 冷启动访谈的指令段（M8）。
 *
 * 硬覆盖画像写入路径是这里最关键的一条：`cold-start-interview/SKILL.md`
 * 与领域 CLAUDE.md 正文里到处写死 `~/.claude/plugins/config/...`，模型读到
 * 会照做，画像就写到了 adapter 读不到的地方。故本段必须先于技能正文生效。
 * @param binding - 领域的绑定（adapter + domain）。
 * @param options - 画像路径、是否已存在、访谈模式。
 * @returns 指令行数组。
 */
export function profileInterviewLines(
  binding: LegalDomainBinding,
  options: {
    /** 画像 canonical 绝对路径（Host 决定）。 */
    readonly profilePath: string
    /** 画像是否已存在（决定用 --redo 语义还是全新访谈）。 */
    readonly profileExists: boolean
    /** 访谈模式。 */
    readonly mode: ProfileInterviewMode
  },
): string[] {
  const modeText: Readonly<Record<ProfileInterviewMode, string>> = {
    quick: '2 分钟快速——角色、执业场景、管辖与审查指引方向，以及审查指引立场、上报阈值、责任上限、行文风格的工作默认值',
    full: '15 分钟完整——真实的审查指引立场（按方向校准）、deal-breaker、带金额阈值的完整上报矩阵、行文风格，以及从已签署协议中提取的实际立场',
    redo: '重新访谈（--redo）——画像已存在，重新走一遍访谈，覆盖前先向用户展示与旧版的差异',
    integrations: '仅重新检测集成（--check-integrations）——只检测实际可连接的集成（MCP 工具、文件访问等）并汇报「✓已连接 / ⚪已配置未验证 / ✗未找到」，不重跑访谈',
  }
  return [
    '【访谈执行要求（本段先于技能正文生效）】',
    `- 画像写入/读取路径严格为 \`${options.profilePath}\`。技能原文中的 \`~/.claude/plugins/config/...\` 与 \`~/.dsh/legal-zh/...\` 一律忽略——本工作台的 canonical 路径由本条给定，按其他路径写入会导致画像读不到。`,
    `- 本次模式：${modeText[options.mode]}。`,
    `- 按 ${binding.domain}/skills/cold-start-interview/SKILL.md 的脚本执行访谈，并遵守其节奏纪律：每轮不超过 2-3 个问题；需要用户输入的题目必须明确说"这个需要输入回答——我会等待"，不得在用户回复前推进到下一题；用户说"暂停"时写入 \`<!-- SETUP PAUSED AT: -->\` 标记保存进度，下次从该处恢复。`,
    '- 不要写 YAML。画像是带偶尔表格的散文，尽量用律师自己的表述；用户没答或答"我还没有那个"的项诚实留 `[PLACEHOLDER]`，不要编造阈值或立场。',
    '- 不要跳过种子文件环节：如用户能提供最近签署的协议或标准模板，读取后再定稿——访谈告诉你他们认为的立场是什么，文件告诉你实际是什么。',
    `- 定稿前先与用户确认："这是我捕获的内容——有什么问题吗？" 得到确认后再写入 \`${options.profilePath}\`（父目录按需创建）。`,
    `${options.profileExists ? '- 覆盖前先展示与现有画像的差异，让用户看清会改掉什么。' : '- 写入时按需创建父目录。'}`,
    '- 写入完成后展示摘要与建议的下一步，并告知画像位置与"随时可在右侧栏「实务画像」中修改"。',
  ]
}

/** L2 访谈模式（对齐 cold-start-interview 的 argument-hint）。 */
export type ProfileInterviewMode = 'quick' | 'full' | 'redo' | 'integrations'

/**
 * 把「审核/分析严格程度」翻译成 claude-for-legal-ZH 的严重程度标尺口径。
 *
 * commercial-legal/CLAUDE.md 的标准严重程度标尺为
 * 🔴 阻断 / 🟠 高 / 🟡 中 / 🟢 低，且发现同时从「法律风险」与「商业/操作摩擦」
 * 两个独立轴评价（映射模糊时向上取整）。本工作台的三档严格程度在此对齐。
 * @param strictness - 表单选择的严格程度。
 * @returns 标尺口径说明。
 */
export function severityScaleNote(strictness: '宽松' | '常规' | '严格'): string {
  if (strictness === '宽松') {
    return '严重程度标尺（🔴 阻断 / 🟠 高 / 🟡 中 / 🟢 低）：本次只列 🟠 及以上发现，🟡/🟢 从略'
  }
  if (strictness === '严格') {
    return '严重程度标尺（🔴 阻断 / 🟠 高 / 🟡 中 / 🟢 低）：逐条评级，🟢 也须列明；映射模糊时向上取整'
  }
  return '严重程度标尺（🔴 阻断 / 🟠 高 / 🟡 中 / 🟢 低）：每个发现同时给出「法律风险」与「商业/操作摩擦」双轴评级'
}

/**
 * 生成「二、MCP 检索调用」段。
 * @returns 指令行数组。
 */
export function mcpLayerLines(): string[] {
  const endpoints = MCP_ENDPOINTS.map(e => `\`mcp__${e.server}__*\`（${e.use}）`).join('、')
  return [
    '二、MCP 检索调用（法条与案例核验）：',
    `- 已挂载法律检索连接器：${endpoints}。工具命名规范为 \`mcp__<serverName>__<rawName>\`。`,
    '- 调用前先确认两个 server 下实际可用的工具名（工具清单中没有的名字不要凭猜测调用）；调用失败时说明失败原因，不要静默跳过。',
    '- 三轮检索策略（强制，禁止直接拿用户原话开搜）：第一轮精确命中核心锚点锁定高相关结果；第二轮用别名、近义词和上下位概念补漏；第三轮处理歧义与混淆概念、精炼结果集。结果过少逐步放宽，结果过杂增加限定词与排除词。',
    '- 时效验证：写入结论的每一条法条、司法解释、诉讼时效、管辖规则、违约金标准，必须先用 mcp__law__* 核验现行效力；未核验的一律标注。',
    `- 来源溯源标签（每条依据必标其一）：${SOURCE_LABELS}。`,
    '- 知识库四步协议（references/knowledge-base-crossref.md）：本机未挂载本地法律知识库时，跳过 Step 1–3，直接从 Step 4「外部补充」走 MCP 检索，但三轮检索不可省。',
    '- 降级纪律：MCP 未连接或全部调用失败时不要静默空转——在交付物顶部写明「本次未连接法规/案例检索工具，法条、案例、期限等时效性内容未经核验，依赖前请用可靠来源核验」，然后继续完成任务。',
  ]
}

/**
 * 生成「三、子代理调用」段。
 * @param plan - 入口的子代理路由配置。
 * @returns 指令行数组。
 */
export function subagentLayerLines(plan: SubagentPlan): string[] {
  const lines = [
    '三、子代理调用（Agentic Search 路由，references/agentic-search-routing.md）：',
    '- 三层路由：C1 自动判定（达到阈值直接启动）/ C2 管线兜底（常规管线跑完不足则升级）/ C3 用户指令（用户明确要求）。工具为 `subagent`（spawn，后台 continuable）；需要子代理带着主会话已完成轮次作为上下文时用 `subagent_fork`。',
  ]
  if (plan.mandatoryChecks !== undefined && plan.mandatoryChecks.length > 0) {
    lines.push(`- 不受 C1/C2 门控、常规管线阶段必做的核验：${plan.mandatoryChecks.join('；')}。`)
  }
  lines.push(`- C1 在本入口的触发口径：${plan.c1Triggers.join('；')}。拿不准是否达到阈值时不走 C1，让常规管线先跑。`)
  lines.push('- 触发后一次性并行分派以下独立检索维度（每个维度一次 subagent 调用，互不依赖，不要串行等待）：')
  plan.lanes.forEach((lane, index) => {
    lines.push(`  ${index + 1}. ${lane.name}——${lane.brief}`)
  })
  lines.push(`- C2 升级条件：${plan.c2Upgrades.join('；')}。升级时把主会话已检索过的源、已试过的关键词一并传给子代理，避免重复工作。`)
  lines.push(`- 排除项（即使表面满足 C1/C2 也不启动）：${plan.excludes.join('；')}。`)
  lines.push('- 约束：子代理的价值是「更广的检索范围」而不是「更强的 AI」——核心法律推理与最终结论始终在主会话完成。子代理产出须带来源标签与检索日期，不确定项标 [需核实]，其研究报告同样是律师审查草稿。')
  return lines
}

/**
 * 子代理分派方案（references/agentic-search-routing.md 的 C1/C2/C3 三层
 * 路由在各入口下的具体口径）。三个内置入口各一套；自定义法律功能从这三套
 * 口径里复用其一（见 config.ts 的 SubagentPlanId），避免重复维护协议文本。
 */
export const SUBAGENT_PLANS: Readonly<Record<'contractReview' | 'caseAnalysis' | 'docGeneration', SubagentPlan>> = {
  contractReview: {
    c1Triggers: [
      '合同同时落入 ≥2 个独立法律领域（如技术合同叠加数据合规、建设工程叠加劳动用工）',
      '待核查条款可拆为 ≥3 个独立法律维度（效力、主体信用、类案口径各成一维）',
      '严格程度为「严格」且需核验的法规/类案条目 ≥3 项',
      '合同类型属于质量门禁第 7 节的特殊类型（建设工程、房地产、股权投资、融资、技术）且需核查行业监管要求',
    ],
    lanes: [
      { name: '主体与授权', brief: '核查各签约主体的存续状态、涉诉与失信、经营异常、资质许可，以及非法定代表人签字/项目部章的表见代理风险' },
      { name: '法规与效力', brief: '核验拟引用条文的现行效力（民法典合同编、担保制度司法解释、格式条款规则等），标注失效与修订' },
      { name: '类案口径', brief: '检索争议条款（违约金、任意解除权、管辖、验收标准等）在约定管辖法院的裁判倾向' },
      { name: '行业监管', brief: '特殊合同类型追加核查行业资质、审批登记与监管要求（如建设工程资质、商品房预售许可）' },
    ],
    c2Upgrades: [
      '交付稿中 ≥2 处标注 [模型知识 — 需验证]',
      '核心条款（价款支付、违约责任、解除与清算、争议解决）缺少可靠依据',
      '三轮检索后仍无法确认关键法条的现行效力',
    ],
    excludes: [
      '单一条款的措辞调整、错别字与格式修订',
      '本次会话已核验过的同一法条',
      '纯文本比对类工作（修订追踪、版本差异）',
    ],
  },
  caseAnalysis: {
    c1Triggers: [
      '归纳出的争议焦点 ≥3 个且各自需要独立的法条或类案支撑',
      '案件跨 ≥2 个独立法律领域（如合同叠加侵权、实体争议叠加程序争议）',
      '用户要求全面/穷尽/系统性梳理',
    ],
    lanes: [
      { name: '请求权基础', brief: '核验各请求权基础的构成要件与法条现行效力，标注失效、修订与司法解释更新' },
      { name: '类案口径', brief: '检索同类案由在管辖法院的裁判倾向、证明标准掌握尺度与常见抗辩采纳情况' },
      { name: '程序风险', brief: '核查诉讼时效（含中断中止）、管辖、主体适格、举证时限与证据失权风险' },
      { name: '对方主体与执行', brief: '检索对方当事人的涉诉、失信、被执行与履行能力，评估胜诉后的执行风险' },
    ],
    c2Upgrades: [
      '关键请求权基础法条无法核验或已失效',
      '≥2 个争议焦点没有类案或法条支撑',
      '证据三性判断缺少可参照的裁判尺度',
    ],
    excludes: [
      '纯事实梳理（大事记、时间线构建）',
      '单一法条确认',
      '已在本次会话检索过的同一问题',
    ],
  },
  docGeneration: {
    mandatoryChecks: [
      '拟写入文书的每一条法条与司法解释，必须先用 mcp__law__* 核验现行效力与条文序号',
    ],
    c1Triggers: [
      '需援引类案裁判要旨支撑论证（代理词、答辩状的常见需求）',
      '文书涉及 ≥3 个独立争议焦点的法律适用论证',
      '用户明确要求补充类案或权威释义',
    ],
    lanes: [
      { name: '法条效力核验', brief: '逐条核验拟引用法条、司法解释的现行效力、条号与最新修订，标出失效与替代条文' },
      { name: '类案要旨', brief: '检索支持我方主张的裁判要旨与本院/上级法院口径，供论证引用' },
      { name: '对方主体', brief: '律师函类文书追加检索对方主体的名称、住所、涉诉与失信情况，确保送达与主张对象准确' },
    ],
    c2Upgrades: [
      '核验发现拟引用法条已失效或被修订，需重新检索替代依据',
      '论证关键节点缺少类案或权威释义支撑',
    ],
    excludes: [
      '格式、排版与措辞润色',
      '已在本次会话核验过的法条',
      '纯事实性内容的誊写',
    ],
  },
}

/**
 * 由自定义功能的法律事项配置构造领域绑定。
 *
 * 用户在配置界面选的是「领域 + 原始技能 + 子代理口径 + 参考文件」，这里
 * 把它翻译成与三个内置入口同构的 LegalDomainBinding，从而复用同一套
 * skillLayerLines 协议文本——自定义功能与内置功能走的是同一条规程。
 * @param config - 入口的法律事项配置。
 * @returns 领域绑定（可直接喂给 skillLayerLines）。
 */
export function legalTaskBinding(config: LegalTaskConfig): LegalDomainBinding {
  return {
    adapter: config.adapter,
    domain: config.domain,
    primarySkills: config.skills,
    // 用户已明确指定原始技能，不再追加候选路由（避免与其选择冲突）。
    routedSkills: [],
    references: config.references ?? [],
    profilePath: `~/.dsh/legal-zh/${config.domain}/CLAUDE.md`,
  }
}

/**
 * 生成「三、子代理调用」段的关闭形态（自定义功能配置 subagent=none 时用）。
 * @returns 指令行数组。
 */
export function subagentDisabledLines(): string[] {
  return [
    '三、子代理调用（本次不启用）：',
    '- 本功能配置为不使用子代理：全部检索、核验与推理都在主会话完成，不要 spawn subagent。',
    '- 中途若发现检索范围明显不足（例如同时跨多个独立法律领域、需核验的法规/类案条目 ≥3 项），先向用户说明局限并征询是否展开，不要擅自分派。',
  ]
}

/**
 * 生成「四、法律输出规则」段（仓库各 adapter 的 Legal Output Rules）。
 * @returns 指令行数组。
 */
export function legalOutputLines(): string[] {
  return [
    '四、法律输出规则（强制，覆盖本指令其余部分）：',
    '- 所有输出均为律师审查草稿，不替代律师专业判断，不构成法律意见。',
    '- 法条、案例、期限、监管动态等时效性内容，未经可靠来源核验前一律标注「需验证」。',
    '- 保留原工作流的升级、审批、保密与来源标注要求；跨技能传递严重程度时，下游不得无声降级。',
    '- 文件读取失败要明说原因与可行的补救方式，不要静默略过用户提供的材料。',
  ]
}

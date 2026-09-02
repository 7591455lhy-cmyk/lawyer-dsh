/**
 * claude-for-legal-ZH 领域目录（wizard 配置界面用；只读元数据）。
 *
 * 数据取自仓库 https://github.com/CSlawyer1985/claude-for-legal-ZH：
 *   - 领域目录名 = 仓库根下的目录名（adapter 用它定位 CLAUDE.md 与 skills/）；
 *   - adapter 技能名 = `.dsh/skills/<name>`（由 scripts/install-legal-zh.ps1
 *     装入 $DSH_HOME/skills，dsh 本地发现 rank 400 user-dsh）；
 *   - 领域原始技能 = `<domain>/skills/<name>/SKILL.md`（各 adapter 的
 *     "Available Original Skills" 段，此处为仓库实读结果）。
 *
 * 注意 adapter 与领域的映射并非简单的 `chinese-legal-X → X-legal`：
 * ai-governance-legal / law-student / legal-clinic / legal-builder-hub
 * 四个领域没有 -legal 后缀，故此表以显式映射为准。
 *
 * 本表只服务于配置界面的下拉；运行时不落盘（入口配置里存的是用户选定
 * 的 domain / adapter / skills 字符串），仓库正文更新时本表随仓库回查。
 */

/** 一个领域目录的元数据。 */
export interface LegalDomainMeta {
  /** 领域目录名（仓库根下相对路径）。 */
  readonly domain: string
  /** dsh adapter 技能名。 */
  readonly adapter: string
  /** 中文名（下拉展示）。 */
  readonly label: string
  /** 领域内可用的原始技能名。 */
  readonly skills: readonly string[]
}

/** 13 个领域入口（adapter → 领域目录 → 原始技能）。 */
export const LEGAL_DOMAINS: readonly LegalDomainMeta[] = [
  {
    domain: 'commercial-legal',
    adapter: 'chinese-legal-commercial',
    label: '商事合同',
    skills: [
      'amendment-history', 'cold-start-interview', 'customize', 'escalation-flagger',
      'matter-workspace', 'nda-review', 'renewal-tracker', 'review', 'review-proposals',
      'saas-msa-review', 'stakeholder-summary', 'vendor-agreement-review',
    ],
  },
  {
    domain: 'litigation-legal',
    adapter: 'chinese-legal-litigation',
    label: '诉讼仲裁',
    skills: [
      'brief-section-drafter', 'chronology', 'claim-chart', 'cold-start-interview',
      'customize', 'demand-draft', 'demand-intake', 'demand-received', 'deposition-prep',
      'legal-hold', 'matter-briefing', 'matter-close', 'matter-intake', 'matter-update',
      'matter-workspace', 'oc-status', 'portfolio-status', 'privilege-log-review',
      'subpoena-triage',
    ],
  },
  {
    domain: 'corporate-legal',
    adapter: 'chinese-legal-corporate',
    label: '公司与并购',
    skills: [
      'ai-tool-handoff', 'board-minutes', 'closing-checklist', 'cold-start-interview',
      'customize', 'deal-team-summary', 'diligence-issue-extraction', 'entity-compliance',
      'integration-management', 'material-contract-schedule', 'matter-workspace',
      'tabular-review', 'written-consent',
    ],
  },
  {
    domain: 'employment-legal',
    adapter: 'chinese-legal-employment',
    label: '劳动用工',
    skills: [
      'cold-start-interview', 'customize', 'expansion-kickoff', 'expansion-update',
      'handbook-updates', 'hiring-review', 'internal-investigation',
      'international-expansion', 'investigation-add', 'investigation-memo',
      'investigation-open', 'investigation-query', 'investigation-summary', 'leave-tracker',
      'log-leave', 'matter-workspace', 'policy-drafting', 'termination-review',
      'wage-hour-qa', 'worker-classification',
    ],
  },
  {
    domain: 'ip-legal',
    adapter: 'chinese-legal-ip',
    label: '知识产权',
    skills: [
      'cease-desist', 'clearance', 'cold-start-interview', 'customize', 'fto-triage',
      'infringement-triage', 'invention-intake', 'ip-clause-review', 'matter-workspace',
      'oss-review', 'portfolio', 'takedown',
    ],
  },
  {
    domain: 'privacy-legal',
    adapter: 'chinese-legal-privacy',
    label: '数据合规与隐私',
    skills: [
      'cold-start-interview', 'customize', 'dpa-review', 'dsar-response',
      'matter-workspace', 'pia-generation', 'policy-monitor', 'reg-gap-analysis',
      'use-case-triage',
    ],
  },
  {
    domain: 'product-legal',
    adapter: 'chinese-legal-product',
    label: '产品与营销合规',
    skills: [
      'cold-start-interview', 'customize', 'feature-risk-assessment', 'is-this-a-problem',
      'launch-review', 'marketing-claims-review', 'matter-workspace',
    ],
  },
  {
    domain: 'regulatory-legal',
    adapter: 'chinese-legal-regulatory',
    label: '监管合规',
    skills: [
      'cold-start-interview', 'comments', 'customize', 'gap-surfacer', 'gaps',
      'matter-workspace', 'policy-diff', 'policy-redraft', 'reg-feed-watcher',
    ],
  },
  {
    domain: 'ai-governance-legal',
    adapter: 'chinese-legal-ai-governance',
    label: 'AI 治理',
    skills: [
      'ai-inventory', 'aia-generation', 'cold-start-interview', 'customize',
      'matter-workspace', 'policy-monitor', 'policy-starter', 'reg-gap-analysis',
      'use-case-triage', 'vendor-ai-review',
    ],
  },
  {
    domain: 'criminal-legal',
    adapter: 'chinese-legal-criminal',
    label: '刑事辩护与合规',
    skills: [
      'bail-application', 'case-analysis', 'cold-start-interview',
      'compliance-non-prosecution', 'customize', 'defense-strategy', 'matter-workspace',
    ],
  },
  {
    domain: 'law-student',
    adapter: 'chinese-legal-law-student',
    label: '法学学习与法考',
    skills: [
      'bar-prep-questions', 'case-brief', 'cold-call-prep', 'cold-start-interview',
      'customize', 'exam-forecast', 'flashcards', 'irac-practice', 'legal-writing',
      'outline-builder', 'session', 'socratic-drill', 'study-plan',
    ],
  },
  {
    domain: 'legal-clinic',
    adapter: 'chinese-legal-clinic',
    label: '法律诊所',
    skills: [
      'build-guide', 'client-comms-log', 'client-intake', 'client-letter',
      'cold-start-interview', 'customize', 'deadlines', 'draft', 'form-generation',
      'memo', 'plain-language-letters', 'ramp', 'research-start', 'semester-handoff',
      'status', 'supervisor-review-queue',
    ],
  },
  {
    domain: 'legal-builder-hub',
    adapter: 'chinese-legal-builder-hub',
    label: '法律技能运营',
    skills: [
      'auto-updater', 'cold-start-interview', 'customize', 'disable', 'registry-browser',
      'related-skills-surfacer', 'skill-installer', 'skill-manager', 'skills-qa',
      'uninstall',
    ],
  },
]

/**
 * 仓库共享参考文件（references/ 下全部 md），供自定义功能按需强制适用。
 * 值即仓库根下的相对路径，写进指令的「强制参考文件」行。
 */
export const LEGAL_REFERENCES: readonly { readonly path: string; readonly label: string }[] = [
  { path: 'references/agentic-search-routing.md', label: '子代理搜索路由（C1/C2/C3）' },
  { path: 'references/contract-review-quality-gates.md', label: '合同审核质量门禁' },
  { path: 'references/knowledge-base-crossref.md', label: '知识库交叉引用四步协议' },
  { path: 'references/due-diligence-workflow.md', label: '尽职调查工作流' },
  { path: 'references/trial-preparation-framework.md', label: '庭前准备框架' },
  { path: 'references/consulting-workflow.md', label: '咨询工作流' },
  { path: 'references/company-profile-template.md', label: '企业画像模板' },
  { path: 'references/dashboard-template.md', label: '台账看板模板' },
  { path: 'references/pricing-proposal-framework.md', label: '报价方案框架' },
]

/** 按领域目录名查元数据；未知名返回 undefined。 */
export function findLegalDomain(domain: string): LegalDomainMeta | undefined {
  return LEGAL_DOMAINS.find(item => item.domain === domain)
}

/**
 * 右侧固定边栏（shell.overlay 槽位，root 作用域：不随会话切换消失）。
 *
 * 品牌统一为「摸鱼工作站 · 一站式律师 AI 工作站」（左侧 dsh 导航栏与会话
 * hero 的 DeepSeek 品牌由 client/index.ts 以更高优先级的槽位 occupant 遮蔽）。
 *
 * M6 UI 重设计：
 *   - 功能入口渲染为圆角矩形卡片（图标 + 名称 + 简述，hover 上浮）；
 *   - 边栏整体可收缩/展开（展开 236px 卡片态 / 收缩 64px 图标轨道，
 *     状态持久化 localStorage，宽度过渡动画）；
 *   - 入口列表由 lawyer-workbench 设置分节驱动（entriesSource 订阅官方
 *     settings 通道快照），内置入口映射既有悬浮窗表单，自定义入口弹
 *     通用表单后以 /技能名 手势发起会话；
 *   - 底部「自定义功能」区：自定义入口卡片 + 「＋ 添加自定义功能」
 *     虚线卡片，点击经 window 事件通知 lawyer-wizard 打开功能配置页；
 *   - 通道不可用时回退默认三入口（M1~M3 零回归）。
 */
import { useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import {
  ContractReviewDialog,
  type ContractReviewRequest,
} from './ContractReviewDialog.tsx'
import {
  CaseAnalysisDialog,
  type CaseAnalysisRequest,
} from './CaseAnalysisDialog.tsx'
import {
  DocGenerationDialog,
  type DocGenerationRequest,
} from './DocGenerationDialog.tsx'
import {
  CustomEntryDialog,
  type CustomEntryRequest,
} from './CustomEntryDialog.tsx'
import type { FileReferenceCandidate, SkillEntry } from '@deepseek-ai/dsh-api-remotes/client'
import {
  BUILTIN_ENTRY_META,
  type BuiltinEntryId,
  type CustomLawyerEntry,
  type LawyerEntry,
} from './config.ts'
import { BRAND_LOGO_PNG_URI } from './brandLogo.ts'
import { PracticeProfileDialog, type ProfileTab } from './PracticeProfileDialog.tsx'
import { ProfileEntryButton, ProfileGuideDialog } from './ProfileGuide.tsx'
import { PRIMARY_PROFILE_DOMAINS, findProfileDomain } from './profileFields.ts'
import type { LawyerProfileApi, ProfileStatus } from './profileRpc.ts'
import type { LawyerSecretsApi, SecretStatus } from './secretsRpc.ts'
import type { ProfileInterviewMode } from './legalZh.ts'
import { YuandianMcpDialog } from './YuandianMcpDialog.tsx'

/** 通知 lawyer-wizard 打开功能配置页的 window 事件名（两个 Client 插件同文档通信）。 */
export const OPEN_ENTRY_MANAGER_EVENT = 'lawyer:open-entry-manager'

/** 收缩状态持久化键（localStorage）。 */
const COLLAPSED_STORAGE_KEY = 'lawyer-sidebar:collapsed'

/** 入口列表的响应式数据源（useSyncExternalStore 契约；见 client/index.ts）。 */
export interface EntriesSource {
  /** 当前入口快照（引用稳定直到下一次替换）。 */
  getSnapshot(): readonly LawyerEntry[]
  /** 订阅入口列表替换。 */
  subscribe(listener: () => void): () => void
}

/** 注册 inject 工厂注入的业务回调（见 client/index.ts）。 */
export interface LawyerSidebarInjected {
  /** 合同审核表单提交后：新建律师模式会话并注入手势指令与附件。 */
  readonly submitContractReview: (request: ContractReviewRequest) => void
  /** 案件分析表单提交后：同上（/case-analysis 手势）。 */
  readonly submitCaseAnalysis: (request: CaseAnalysisRequest) => void
  /** 文书生成表单提交后：同上（/doc-generation 手势）。 */
  readonly submitDocGeneration: (request: DocGenerationRequest) => void
  /** 自定义入口表单提交后：同上（/配置的技能名 手势，M4）。 */
  readonly submitCustomEntry: (request: CustomEntryRequest) => void
  /** 入口列表数据源（lawyer-workbench 分节的响应式投影）。 */
  readonly entriesSource: EntriesSource
  /** 按 dsh fileReferences 索引搜索当前会话工作区文件（@ 引用同款数据源）。 */
  readonly searchWorkspaceFiles: (
    query: string,
    signal: AbortSignal,
  ) => Promise<readonly FileReferenceCandidate[] | undefined>
  /** 把浏览器读到的文件内容上传进当前工作区，返回工作区内绝对路径。 */
  readonly uploadWorkspaceFile: (
    fileName: string,
    contentBase64: string,
    signal: AbortSignal,
  ) => Promise<string | Error>
  /** 列出当前会话可用的已安装技能目录（表单高级选项下拉数据源）。 */
  readonly listInstalledSkills: () => Promise<readonly SkillEntry[] | undefined>
  // ── M8 实务画像 ──
  /** 画像的 Host RPC 封装（Client 不能读文件系统，画像状态一律问 Host）。 */
  readonly profileApi: LawyerProfileApi
  /** 已跳过画像引导的领域（settings 通道的响应式投影）。 */
  readonly dismissedSource: EntriesSourceOf<readonly string[]>
  /** 持久化「已跳过」名单（整体替换 profileDismissed 字段）。 */
  readonly persistProfileDismissed: (domains: readonly string[]) => Promise<boolean>
  /** 发起画像访谈会话（新建会话并注入 cold-start-interview 指令）。 */
  readonly submitProfileInterview: (domain: string, mode: ProfileInterviewMode) => void
  // ── M8.6 元典 MCP 引导 ──
  /** 元典 Key 的 Host RPC 封装（Client 读不到 env / 文件系统）。 */
  readonly secretsApi: LawyerSecretsApi
  /** 用户是否已选择不再提醒元典引导（settings 通道的响应式投影）。 */
  readonly mcpDismissedSource: EntriesSourceOf<boolean>
  /** 持久化「不再提醒」标记。 */
  readonly persistMcpDismissed: (dismissed: boolean) => Promise<boolean>
}

/** 字符串数组型数据源（与 EntriesSource 同形，元素类型不同）。 */
export interface EntriesSourceOf<T> {
  /** 当前快照（引用稳定直到下一次替换）。 */
  getSnapshot(): T
  /** 订阅替换。 */
  subscribe(listener: () => void): () => void
}

export type LawyerSidebarProps = LawyerSidebarInjected

/** 打开画像面板的目标（领域 + 初始 Tab）。 */
interface ProfileTarget {
  readonly domain: string
  readonly tab: ProfileTab
}

/** 内置入口 → 画像领域（决定首次引导问的是哪一块）。 */
const ENTRY_DOMAINS: Readonly<Record<BuiltinEntryId, string>> = {
  'contract-review': 'commercial-legal',
  'case-analysis': 'litigation-legal',
  'doc-generation': 'litigation-legal',
}

/** 摸鱼工作站品牌标：可爱「躺平咸鱼」——胖圆鱼身 + 分叉尾鳍 + 安享闭眼
 * + o 形小嘴 + 腮红 + 咸鱼纹理 + 底部躺平波浪（currentColor 主题色）。 */
export function SaltedFishMark({ size = 24, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* 鱼身（胖椭圆） */}
      <ellipse cx="10.6" cy="10.2" rx="7" ry="5" stroke="currentColor" strokeWidth="1.5" />
      {/* 尾鳍（分叉） */}
      <path
        d="M17.6 10.2l3-2.1c.32-.22.75.02.75.4v3.4c0 .38-.43.62-.75.4l-3-2.1Z"
        fill="currentColor"
      />
      {/* 安享闭眼（两道下弯弧） */}
      <path
        d="M6.8 9.9c.5.5 1.2.5 1.7 0M10.2 9.9c.5.5 1.2.5 1.7 0"
        stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"
      />
      {/* o 形小嘴 */}
      <circle cx="8.6" cy="12" r=".75" stroke="currentColor" strokeWidth="1.1" />
      {/* 腮红 */}
      <circle cx="5.7" cy="11.5" r=".8" fill="currentColor" opacity=".4" />
      {/* 咸鱼纹理 */}
      <path
        d="M13.6 7.6c.8-.6 1.8-.6 2.6 0"
        stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity=".55"
      />
      {/* 躺平波浪 */}
      <path
        d="M2.6 18.4c1-.9 2.1-.9 3.1 0s2.1.9 3.1 0 2.1-.9 3.1 0 2.1.9 3.1 0 2.1-.9 3.1 0"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity=".8"
      />
    </svg>
  )
}

/**
 * 品牌名称槽位（sidebar.brand.name）占位组件：仅主名（左上角不放副
 * 标题）。「鱼字象形」品牌字标图（brandLogo.ts）替代原渐变文字——
 * 尺寸样式（高 20px、宽度自适应）由注入样式控制。
 */
export function MoyuBrandName() {
  return <img className="lawyer-brand-name-main" src={BRAND_LOGO_PNG_URI} alt="摸鱼工作站" />
}

/**
 * 会话 hero 品牌标（conversation.hero.brand.mark）占位组件：躺平咸鱼 +
 * 专属锚点 class——注入样式据此定位 hero 大标题并应用可爱渐变文字
 * （fishHitbox 的下一个兄弟 span 即 headlineText，见 client/index.ts）。
 */
export function MoyuHeroMark({ size, className }: { size?: number; className?: string }) {
  const merged = className === undefined ? 'lawyer-hero-mark' : `${className} lawyer-hero-mark`
  return <SaltedFishMark size={size} className={merged} />
}

/** 合同审核：文档轮廓 + 折角 + 条目行。 */
function ContractIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M9.5 1.5H4.25C3.56 1.5 3 2.06 3 2.75v10.5c0 .69.56 1.25 1.25 1.25h7.5c.69 0 1.25-.56 1.25-1.25V6L9.5 1.5Z"
        stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"
      />
      <path d="M9.5 1.5V6H13" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M5.5 8.5h5M5.5 11h3.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

/** 案件分析：放大镜。 */
function SearchIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.1" />
      <path d="M10.5 10.5 14 14" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

/** 案件文书生成：钢笔。 */
function PenIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M3 13.2l.8-3.2 8.3-8.3a1.5 1.5 0 0 1 2.1 2.1L5.9 12.1 3 13.2Z"
        stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"
      />
      <path d="M10.5 3.2l2.1 2.1" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

/** 自定义入口：闪电。 */
function SparkIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M9 1.5 3.5 9h3l-.8 5.5L11.5 7h-3L9 1.5Z"
        stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"
      />
    </svg>
  )
}

/** 法务通用：天平。 */
function ScaleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path d="M8 2.5v11M5 13.5h6M3 5h10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M3 5 1.2 8.6a1.6 1.6 0 0 0 3.6 0L3 5ZM13 5l-1.8 3.6a1.6 1.6 0 0 0 3.6 0L13 5Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  )
}

/** 合规风控：盾牌 + 勾。 */
function ShieldIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path d="M8 1.8 13 3.4v4.1c0 3.1-2.1 5.4-5 6.7-2.9-1.3-5-3.6-5-6.7V3.4L8 1.8Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M5.9 7.9 7.4 9.4l2.8-2.9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** 卷宗材料：文件夹。 */
function FolderIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path d="M1.8 4.2c0-.6.5-1.1 1.1-1.1h2.6l1.3 1.6h6.3c.6 0 1.1.5 1.1 1.1v6c0 .6-.5 1.1-1.1 1.1H2.9c-.6 0-1.1-.5-1.1-1.1V4.2Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
    </svg>
  )
}

/** 分析台账：柱状图。 */
function ChartIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path d="M2.5 13.5V2.5M2.5 13.5h11" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M5 13.5V9M8 13.5V5.5M11 13.5v-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

/** 咨询沟通：对话框。 */
function ChatIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path d="M2.2 4.4c0-.9.7-1.6 1.6-1.6h8.4c.9 0 1.6.7 1.6 1.6v4.4c0 .9-.7 1.6-1.6 1.6H6.6L3.6 13V10.4h-.2c-.9 0-1.6-.7-1.6-1.6V4.4Z" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M5.4 6.4h5.2M5.4 8.4h3.2" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

/** 期限监控：时钟。 */
function ClockIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.1" />
      <path d="M8 4.6V8l2.6 1.6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** 自定义入口图标表（配置里的 icon 字段名 → 图标组件；缺省 spark）。 */
const ENTRY_ICONS: Readonly<Record<string, ReactNode>> = {
  spark: <SparkIcon />,
  contract: <ContractIcon />,
  search: <SearchIcon />,
  pen: <PenIcon />,
  scale: <ScaleIcon />,
  shield: <ShieldIcon />,
  folder: <FolderIcon />,
  chart: <ChartIcon />,
  chat: <ChatIcon />,
  clock: <ClockIcon />,
}

/** 添加：加号。 */
function PlusIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

/** 实务画像：档案夹 + 折角页 + 条目线（配置类操作的图标）。 */
function ProfileIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M2.5 4.25c0-.41.34-.75.75-.75h2.4l1.2 1.4h6.4c.41 0 .75.34.75.75v6.1c0 .41-.34.75-.75.75H3.25a.75.75 0 0 1-.75-.75V4.25Z"
        stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"
      />
      <path d="M5.4 8.6h5.2M5.4 10.8h3.4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

/** 右箭头（»，收起方向）与左箭头（«，展开方向）：边栏贴屏幕右缘。 */
function ChevronIcon({ size = 16, direction }: { size?: number; direction: 'left' | 'right' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
      style={{ transform: direction === 'left' ? 'none' : 'rotate(180deg)' }}
    >
      <path d="M10 3.5 5.5 8l4.5 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** 内置入口 id → 页签图标。 */
const BUILTIN_ICONS: Readonly<Record<string, ReactNode>> = {
  'contract-review': <ContractIcon />,
  'case-analysis': <SearchIcon />,
  'doc-generation': <PenIcon />,
}

/** 边栏卡片数据（由配置驱动派生）。 */
interface LawyerCard {
  readonly key: string
  readonly label: string
  /** 卡片简述（展开态第二行）。 */
  readonly hint: string
  readonly icon: ReactNode
  readonly title: string
  /** 自定义入口徽标。 */
  readonly custom: boolean
  readonly onClick: () => void
}

/** 读取持久化的收缩状态（非法值视为展开）。 */
function readCollapsed(): boolean {
  try {
    return window.localStorage.getItem(COLLAPSED_STORAGE_KEY) === '1'
  } catch {
    return false
  }
}

/** 持久化收缩状态（写入失败静默忽略）。 */
function writeCollapsed(collapsed: boolean): void {
  try {
    window.localStorage.setItem(COLLAPSED_STORAGE_KEY, collapsed ? '1' : '0')
  } catch { /* 隐私模式等场景下忽略 */ }
}

/** shell.overlay 占位组件：右侧固定边栏 + 各功能悬浮窗。 */
export function LawyerSidebar({
  submitContractReview,
  submitCaseAnalysis,
  submitDocGeneration,
  submitCustomEntry,
  entriesSource,
  searchWorkspaceFiles,
  uploadWorkspaceFile,
  listInstalledSkills,
  profileApi,
  dismissedSource,
  persistProfileDismissed,
  submitProfileInterview,
  secretsApi,
  mcpDismissedSource,
  persistMcpDismissed,
}: LawyerSidebarProps) {
  // 入口列表：配置通道的响应式投影（不可用时数据源内部回退默认三入口）。
  const entries = useSyncExternalStore(entriesSource.subscribe, entriesSource.getSnapshot)
  // 已跳过画像引导的领域（同一分节的 profileDismissed 投影）。
  const dismissedDomains = useSyncExternalStore(dismissedSource.subscribe, dismissedSource.getSnapshot)
  // M8.6：用户是否已选择不再提醒元典 MCP 引导。
  const mcpDismissed = useSyncExternalStore(mcpDismissedSource.subscribe, mcpDismissedSource.getSnapshot)

  const [reviewOpen, setReviewOpen] = useState(false)
  const [caseOpen, setCaseOpen] = useState(false)
  const [docOpen, setDocOpen] = useState(false)
  /** 当前打开的自定义入口表单（同时只开一个）。 */
  const [customOpen, setCustomOpen] = useState<CustomLawyerEntry | null>(null)
  /** 边栏收缩态（持久化；收缩后 64px 图标轨道）。 */
  const [collapsed, setCollapsed] = useState<boolean>(readCollapsed)
  /** M8.7：画像面板的打开目标（领域 + 初始 Tab；未打开为 null）。 */
  const [profileTarget, setProfileTarget] = useState<ProfileTarget | null>(null)
  /**
   * M8.8：画像配置完成后要打开的功能入口（从引导页进画像面板时挂起）。
   *
   * 不能只靠 guideFor——打开画像面板时引导已经结束、guideFor 会被清空，
   * 画像保存完就无从知道该回到哪个入口（表现为「保存后什么都没弹」，只有
   * 不走画像面板的「留空」分支还留着这个信息）。
   */
  const [profilePendingEntry, setProfilePendingEntry] = useState<BuiltinEntryId | null>(null)
  /** M8：等待用户处理引导的功能入口（引导完成后继续打开它的表单）。 */
  const [guideFor, setGuideFor] = useState<BuiltinEntryId | null>(null)
  /** 画像状态表（两个常用领域；实时问 Host，画像是模型在会话里写的）。 */
  const [profileStates, setProfileStates] = useState<Readonly<Record<string, ProfileStatus>>>({})
  /** 重查画像状态的计数器（保存/关闭面板后 +1 触发）。 */
  const [profileVersion, setProfileVersion] = useState(0)
  /** M8.6：元典 Key 状态（null=未查到/RPC 不可用；查不到时不拦流程）。 */
  const [mcpStatus, setMcpStatus] = useState<SecretStatus | null>(null)
  /**
   * M8.6：等待用户处理元典引导的后续动作（关闭引导后执行）。
   * 非 null 即引导弹窗打开；底部常驻入口传的是空操作（只是想进去改配置）。
   */
  const [mcpPending, setMcpPending] = useState<(() => void) | null>(null)
  /** 重查元典 Key 状态的计数器（引导关闭后 +1 触发）。 */
  const [mcpVersion, setMcpVersion] = useState(0)

  const toggleCollapsed = (): void => {
    setCollapsed(previous => {
      writeCollapsed(!previous)
      return !previous
    })
  }

  /** 通知 lawyer-wizard 打开功能配置页（新增/删除/重排入口）。 */
  const openEntryManager = (): void => {
    window.dispatchEvent(new CustomEvent(OPEN_ENTRY_MANAGER_EVENT))
  }

  // 画像状态：每次挂载与 profileVersion 变化时向 Host 重查。画像是模型在
  // 会话里写的，前端无法感知，本地缓存会立刻失真——必须实时问 Host。
  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    void (async () => {
      const results = await Promise.all(
        PRIMARY_PROFILE_DOMAINS.map(domain => profileApi.status(domain, controller.signal)),
      )
      if (cancelled) return
      const next: Record<string, ProfileStatus> = {}
      PRIMARY_PROFILE_DOMAINS.forEach((domain, index) => {
        const result = results[index]
        if (!(result instanceof Error)) next[domain] = result
      })
      setProfileStates(next)
    })()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [profileApi, profileVersion])

  // 元典 Key 状态：挂载时查一次，引导弹窗关闭后再查一次（保存/清除后要
  // 刷新卡片简述）。查询失败按「未配置」处理——引导只是可选增强，不该让
  // 边栏报错，也不该在 RPC 不可用时挡住任务。
  useEffect(() => {
    let cancelled = false
    void secretsApi.status(new AbortController().signal).then(status => {
      if (cancelled || status instanceof Error) return
      setMcpStatus(status)
    })
    return () => { cancelled = true }
  }, [secretsApi, mcpVersion])

  /**
   * 元典 MCP 前置引导（M8.6）：未配置且用户没说「不再提醒」时先弹引导，
   * 关闭后再执行 next（打开功能表单）；已配置 / 已免打扰 / RPC 不可用则
   * 直接放行。
   * @param next - 引导结束（或无需引导）后要执行的动作。
   */
  const withMcpGate = (next: () => void): void => {
    if (mcpDismissed || mcpStatus?.configured === true) {
      next()
      return
    }
    void (async () => {
      const status = await secretsApi.status(new AbortController().signal)
      if (status instanceof Error || status.configured) {
        if (!(status instanceof Error)) setMcpStatus(status)
        next()
        return
      }
      setMcpStatus(status)
      // setState 的函数形态会被当成 updater，故多包一层。
      setMcpPending(() => next)
    })()
  }

  /** 关闭元典引导：执行挂起的后续动作（常驻入口是空操作）。 */
  const closeMcpGuide = (): void => {
    const pending = mcpPending
    setMcpPending(null)
    setMcpVersion(version => version + 1)
    pending?.()
  }

  /** 元典卡片简述。 */
  const mcpSummary = mcpStatus === null
    ? '状态未知 · 点此查看'
    : mcpStatus.configured
      ? `已配置（${mcpStatus.masked ?? '已保存'}）`
      : '未配置 · 点此接入'

  /** 打开某个内置入口的表单。 */
  const openBuiltinDialog = (id: BuiltinEntryId): void => {
    if (id === 'contract-review') setReviewOpen(true)
    else if (id === 'case-analysis') setCaseOpen(true)
    else if (id === 'doc-generation') setDocOpen(true)
  }

  /**
   * 内置入口点击：画像未配置且未被跳过时先弹引导，否则直接开表单。
   *
   * Host RPC 不可用（lawyer-tools 未升级）时直接放行——画像引导不该挡住
   * 主流程。
   */
  const handleBuiltinClick = (id: BuiltinEntryId): void => {
    const domain = ENTRY_DOMAINS[id]
    void (async () => {
      const status = await profileApi.status(domain, new AbortController().signal)
      if (status instanceof Error || status.configured || dismissedDomains.includes(domain)) {
        openBuiltinDialog(id)
        return
      }
      setGuideFor(id)
    })()
  }

  /** 引导「留空」：记入免打扰名单后继续打开任务表单。 */
  const skipGuide = (id: BuiltinEntryId): void => {
    const domain = ENTRY_DOMAINS[id]
    setGuideFor(null)
    void persistProfileDismissed([...dismissedDomains.filter(item => item !== domain), domain])
    openBuiltinDialog(id)
  }

  /**
   * 打开画像面板（Tab 由入口决定：引导页「完整问卷」进 interview，
   * 「快速配置」与底部分节进 quick）。
   *
   * 独立配置（侧栏底部分节、功能表单里的画像入口）不挂任何后续动作——
   * 用户此刻的意图就是配置画像，不该在保存后被塞进某个任务表单。
   */
  const openProfile = (domain: string, tab: ProfileTab = 'quick'): void => {
    setProfilePendingEntry(null)
    setProfileTarget({ domain, tab })
  }

  /**
   * 引导页进画像面板：把入口挂起，配完再回到它的表单。
   * @param id - 发起引导的功能入口。
   * @param tab - 画像面板要停在的 Tab（完整问卷 / 快速配置）。
   */
  const setupProfileThen = (id: BuiltinEntryId, tab: ProfileTab): void => {
    setGuideFor(null)
    setProfilePendingEntry(id)
    setProfileTarget({ domain: ENTRY_DOMAINS[id], tab })
  }

  /**
   * 画像保存后：一律关闭面板——保存即完成。
   *
   * 若这次是从功能入口的引导里进来的（有挂起入口且刚保存的正是它的领域），
   * 顺带打开那个功能表单：用户是在发起任务时被引导过来的，配完就该进入
   * 正题。领域不匹配时只关面板（用户可能顺手切到别的领域去配置画像，那
   * 不是发起任务的意思）。
   * @param domain - 刚保存的画像领域。
   */
  const handleProfileSaved = (domain: string): void => {
    setProfileVersion(version => version + 1)
    const pending = profilePendingEntry
    setProfileTarget(null)
    setProfilePendingEntry(null)
    if (pending === null || ENTRY_DOMAINS[pending] !== domain) return
    openBuiltinDialog(pending)
  }

  /** 引导/面板发起访谈：新建会话并注入 cold-start-interview 指令。 */
  const startInterview = (domain: string, mode: ProfileInterviewMode): void => {
    setGuideFor(null)
    // 访谈要走会话，之后不该再弹任务表单。
    setProfilePendingEntry(null)
    setProfileTarget(null)
    submitProfileInterview(domain, mode)
    setProfileVersion(version => version + 1)
  }

  /** 面板关闭：丢弃挂起的入口（用户主动放弃配置，不硬塞任务表单给他）。 */
  const closeProfilePanel = (): void => {
    setProfileTarget(null)
    setProfilePendingEntry(null)
    setProfileVersion(version => version + 1)
  }

  /** 画像卡片简述：列出已配置的领域，全部未配置时引导用户完善。 */
  const profileSummary = ((): string => {
    const configured = PRIMARY_PROFILE_DOMAINS
      .filter(domain => profileStates[domain]?.configured === true)
      .map(domain => findProfileDomain(domain)?.label ?? domain)
    return configured.length === 0 ? '未配置 · 点此完善' : `${configured.join('、')} 已配置`
  })()

  /** 某个领域画像的状态文案（供功能表单内的画像入口显示）。 */
  const profileLabelFor = (domain: string): string => {
    const status = profileStates[domain]
    if (status === undefined) return '点此查看'
    if (status.configured) return '已配置'
    if (status.exists) return `未填完（${status.placeholderCount} 处待补）`
    return '未配置 · 点此完善'
  }

  /** 功能表单里的画像入口按钮。 */
  const renderProfileEntry = (domain: string) => (
    <ProfileEntryButton
      label={profileLabelFor(domain)}
      onClick={() => openProfile(domain)}
    />
  )

  const cards: readonly LawyerCard[] = entries.map(entry => {
    if (entry.kind === 'builtin') {
      const meta = BUILTIN_ENTRY_META[entry.id]
      return {
        key: entry.id,
        label: meta.label,
        hint: meta.hint,
        icon: BUILTIN_ICONS[entry.id],
        title: meta.description,
        custom: false,
        // M8 + M8.6：内置入口先过元典 MCP 引导，再过画像引导（两者都只在
        // 该提醒时弹；任一被跳过/已配置则直接开表单）。
        onClick: () => withMcpGate(() => handleBuiltinClick(entry.id)),
      }
    }
    // 自定义入口：图标与简述由配置决定（缺省 spark / /技能名）。
    const legal = entry.legal
    const hint = entry.hint ?? (legal !== undefined ? `${legal.domain}` : `/${entry.skill}`)
    const gestures = [
      ...legal !== undefined ? [legal.adapter] : [],
      entry.skill,
      ...entry.extraSkills ?? [],
    ].map(name => `/${name}`).join(' ')
    return {
      key: entry.id,
      label: entry.label,
      hint,
      icon: ENTRY_ICONS[entry.icon ?? 'spark'] ?? <SparkIcon />,
      title: legal === undefined
        ? `${entry.label}：以 ${gestures} 技能手势发起${entry.agentPreset === undefined || entry.agentPreset === '' ? '会话' : `「${entry.agentPreset}」会话`}`
        : `${entry.label}：claude-for-legal-ZH · ${legal.domain}，以 ${gestures} 技能手势发起会话`,
      custom: true,
      // M8.6：自定义入口同样先过元典引导（涉及法律事项的入口最需要法规检索）。
      onClick: () => withMcpGate(() => { setCustomOpen(entry) }),
    }
  })

  // 分组：内置功能与自定义功能分栏渲染（组内保持配置顺序）。
  const builtinCards = cards.filter(card => !card.custom)
  const customCards = cards.filter(card => card.custom)

  /** 一张功能卡片（展开态：圆角矩形框；收缩态由 rail 按钮渲染）。 */
  const renderCard = (card: LawyerCard) => (
    <button
      key={card.key}
      type="button"
      className="lawyer-sidebar__card"
      onClick={card.onClick}
      title={card.title}
    >
      <span className="lawyer-sidebar__card-icon">{card.icon}</span>
      <span className="lawyer-sidebar__card-body">
        <span className="lawyer-sidebar__card-title">{card.label}</span>
        <span className="lawyer-sidebar__card-hint">{card.hint}</span>
      </span>
      {card.custom && <span className="lawyer-sidebar__card-badge">自定义</span>}
    </button>
  )

  /** 收缩轨道上的图标按钮（title 提示完整功能名）。 */
  const renderRailButton = (card: LawyerCard) => (
    <button
      key={card.key}
      type="button"
      className="lawyer-sidebar__rail-btn"
      onClick={card.onClick}
      title={card.title}
      aria-label={card.label}
    >
      {card.icon}
    </button>
  )

  return (
    <>
      <nav
        className={collapsed ? 'lawyer-sidebar lawyer-sidebar--collapsed' : 'lawyer-sidebar'}
        aria-label="摸鱼工作站功能栏"
      >
        {/* 品牌头：咸鱼标 + 品牌字标图/副标题 + 收缩开关（收缩态藏字标仅留咸鱼标） */}
        <div className="lawyer-sidebar__header">
          <span className="lawyer-sidebar__brand">
            <span className="lawyer-sidebar__brand-mark"><SaltedFishMark size={22} /></span>
            <span className="lawyer-sidebar__brand-text">
              <img
                className="lawyer-sidebar__brand-name"
                src={BRAND_LOGO_PNG_URI}
                alt="摸鱼工作站"
              />
              <span className="lawyer-sidebar__brand-sub">一站式律师 AI 工作站</span>
            </span>
          </span>
          <button
            type="button"
            className="lawyer-sidebar__toggle"
            onClick={toggleCollapsed}
            title={collapsed ? '展开功能栏' : '收起功能栏'}
            aria-label={collapsed ? '展开功能栏' : '收起功能栏'}
          >
            <ChevronIcon direction={collapsed ? 'left' : 'right'} />
          </button>
        </div>

        {/* 功能卡片列表（展开态） */}
        {!collapsed && (
          <div className="lawyer-sidebar__scroll">
            {builtinCards.length > 0 && (
              <>
                <p className="lawyer-sidebar__section-title">功能</p>
                <div className="lawyer-sidebar__group">{builtinCards.map(renderCard)}</div>
              </>
            )}
            <p className="lawyer-sidebar__section-title">自定义功能</p>
            {customCards.length > 0 && (
              <div className="lawyer-sidebar__group">{customCards.map(renderCard)}</div>
            )}
            {cards.length === 0 && (
              <p className="lawyer-sidebar__empty">
                功能入口已全部关闭——点击下方「添加自定义功能」重新添加。
              </p>
            )}
            <button
              type="button"
              className="lawyer-sidebar__add"
              onClick={openEntryManager}
              title="打开功能配置页：新增自定义功能、调整或恢复功能入口"
            >
              <span className="lawyer-sidebar__add-icon"><PlusIcon /></span>
              <span className="lawyer-sidebar__add-label">添加自定义功能</span>
            </button>

            {/* M8：最底部的「实务画像」分节——一次性配置，与上面的任务入口
                分区；配置好之后画像会被本工作台所有法律功能在动笔前读取。 */}
            <p className="lawyer-sidebar__section-title">
              实务画像
              <span
                className={Object.values(profileStates).some(item => item.configured)
                  ? 'lawyer-sidebar__dot lawyer-sidebar__dot--on'
                  : 'lawyer-sidebar__dot'}
                aria-hidden="true"
              />
            </p>
            <div className="lawyer-sidebar__group">
              <button
                type="button"
                className="lawyer-sidebar__card"
                onClick={() => openProfile(PRIMARY_PROFILE_DOMAINS[0])}
                title="配置实务画像：团队立场、审查阈值、上报与行文风格——本工作台所有法律功能在动笔前都会读取它"
              >
                <span className="lawyer-sidebar__card-icon"><ProfileIcon /></span>
                <span className="lawyer-sidebar__card-body">
                  <span className="lawyer-sidebar__card-title">实务画像</span>
                  <span className="lawyer-sidebar__card-hint">{profileSummary}</span>
                </span>
              </button>
              {/* M8.6：元典法规检索的常驻配置入口——引导被跳过之后，用户
                  随时能从这里补配/换 Key（配好后入口文案变成打码形态）。 */}
              <button
                type="button"
                className="lawyer-profile__entry"
                onClick={() => setMcpPending(() => () => {})}
                title="配置元典开放平台 API Key：法规与类案检索的数据源"
              >
                <span className="lawyer-profile__entry-icon" aria-hidden="true">⌘</span>
                <span>元典法规检索：{mcpSummary}</span>
              </button>
            </div>
          </div>
        )}

        {/* 收缩轨道（图标按钮列） */}
        {collapsed && (
          <div className="lawyer-sidebar__scroll">
            <div className="lawyer-sidebar__rail">
              {builtinCards.map(renderRailButton)}
              {customCards.map(renderRailButton)}
              <button
                type="button"
                className="lawyer-sidebar__rail-btn lawyer-sidebar__rail-btn--add"
                onClick={openEntryManager}
                title="添加自定义功能（打开功能配置页）"
                aria-label="添加自定义功能"
              >
                <PlusIcon />
              </button>
              {/* M8：收缩轨道末端的画像入口，与展开态底部分节等价。 */}
              <button
                type="button"
                className="lawyer-sidebar__rail-btn"
                onClick={() => openProfile(PRIMARY_PROFILE_DOMAINS[0])}
                title={`实务画像（${profileSummary}）`}
                aria-label="实务画像"
              >
                <ProfileIcon />
              </button>
            </div>
          </div>
        )}
      </nav>
      {reviewOpen && (
        <ContractReviewDialog
          onCancel={() => setReviewOpen(false)}
          onSubmit={request => {
            setReviewOpen(false)
            submitContractReview(request)
          }}
          searchWorkspaceFiles={searchWorkspaceFiles}
          uploadWorkspaceFile={uploadWorkspaceFile}
          listInstalledSkills={listInstalledSkills}
          profileEntry={renderProfileEntry('commercial-legal')}
        />
      )}
      {caseOpen && (
        <CaseAnalysisDialog
          onCancel={() => setCaseOpen(false)}
          onSubmit={request => {
            setCaseOpen(false)
            submitCaseAnalysis(request)
          }}
          searchWorkspaceFiles={searchWorkspaceFiles}
          uploadWorkspaceFile={uploadWorkspaceFile}
          profileEntry={renderProfileEntry('litigation-legal')}
        />
      )}
      {docOpen && (
        <DocGenerationDialog
          onCancel={() => setDocOpen(false)}
          onSubmit={request => {
            setDocOpen(false)
            submitDocGeneration(request)
          }}
          searchWorkspaceFiles={searchWorkspaceFiles}
          uploadWorkspaceFile={uploadWorkspaceFile}
          profileEntry={renderProfileEntry('litigation-legal')}
        />
      )}
      {customOpen !== null && (
        <CustomEntryDialog
          entry={customOpen}
          onCancel={() => { setCustomOpen(null) }}
          onSubmit={request => {
            setCustomOpen(null)
            submitCustomEntry(request)
          }}
          searchWorkspaceFiles={searchWorkspaceFiles}
          uploadWorkspaceFile={uploadWorkspaceFile}
        />
      )}
      {/* M8：画像配置面板（渲染在功能表单之后，同 z-index 下靠 DOM 顺序置顶，
          因此点表单里的画像入口时它盖在表单上，关闭后表单内容不丢）。 */}
      {profileTarget !== null && (
        <PracticeProfileDialog
          initialDomain={profileTarget.domain}
          initialTab={profileTarget.tab}
          onCancel={closeProfilePanel}
          onSaved={handleProfileSaved}
          onStartInterview={startInterview}
          profileApi={profileApi}
          customDomains={entries.flatMap(entry => entry.kind === 'custom' && entry.legal !== undefined ? [entry.legal.domain] : [])}
          dismissedDomains={dismissedDomains}
          onRestoreGuide={domain => {
            void persistProfileDismissed(dismissedDomains.filter(item => item !== domain))
          }}
        />
      )}
      {/* M8.6：元典 MCP 注册引导（渲染在功能表单之后，同 z-index 下靠 DOM
          顺序置顶；关闭后执行挂起的动作，如打开功能表单）。 */}
      {mcpPending !== null && (
        <YuandianMcpDialog
          status={mcpStatus}
          secretsApi={secretsApi}
          onChanged={setMcpStatus}
          onClose={closeMcpGuide}
          onDismiss={() => {
            void persistMcpDismissed(true)
            closeMcpGuide()
          }}
        />
      )}
      {guideFor !== null && (
        <ProfileGuideDialog
          domainLabel={findProfileDomain(ENTRY_DOMAINS[guideFor])?.label ?? ENTRY_DOMAINS[guideFor]}
          onFullSetup={() => setupProfileThen(guideFor, 'interview')}
          onQuickSetup={() => setupProfileThen(guideFor, 'quick')}
          onSkip={() => skipGuide(guideFor)}
        />
      )}
    </>
  )
}

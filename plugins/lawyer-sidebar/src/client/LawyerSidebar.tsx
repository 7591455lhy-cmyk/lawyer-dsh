/**
 * 右侧固定边栏（shell.overlay 槽位，root 作用域：不随会话切换消失）。
 * 选项卡形式：M2 实现“合同审核”；M3 激活“案件分析”“案件文书生成”——
 * 点击各自弹出悬浮窗表单，提交后由注入回调创建律师模式会话并加载技能；
 * 其余选项卡为规划占位（禁用态，title 提示开发中）。
 */
import { useState, type ReactNode } from 'react'
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
import type { FileReferenceCandidate, SkillEntry } from '@deepseek-ai/dsh-api-remotes/client'

/** 注册 inject 工厂注入的业务回调（见 client/index.ts）。 */
export interface LawyerSidebarInjected {
  /** 合同审核表单提交后：复用/新建律师模式会话并注入手势指令与附件。 */
  readonly submitContractReview: (request: ContractReviewRequest) => void
  /** 案件分析表单提交后：同上（/case-analysis 手势）。 */
  readonly submitCaseAnalysis: (request: CaseAnalysisRequest) => void
  /** 文书生成表单提交后：同上（/doc-generation 手势）。 */
  readonly submitDocGeneration: (request: DocGenerationRequest) => void
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
}

export type LawyerSidebarProps = LawyerSidebarInjected

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

/** PDF 去水印：文档轮廓 + 水纹。 */
function WatermarkIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false">
      <path
        d="M9.5 1.5H4.25C3.56 1.5 3 2.06 3 2.75v10.5c0 .69.56 1.25 1.25 1.25h7.5c.69 0 1.25-.56 1.25-1.25V6L9.5 1.5Z"
        stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round"
      />
      <path d="M9.5 1.5V6H13" stroke="currentColor" strokeWidth="1.1" strokeLinejoin="round" />
      <path d="M5.2 10c.8-.9 1.7-.9 2.5 0s1.7.9 2.5 0" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  )
}

/** 边栏选项卡数据：M3 起前三个入口可用，pdf-watermark 仍为占位。 */
interface LawyerTab {
  readonly id: string
  readonly label: string
  readonly icon: ReactNode
  readonly disabled: boolean
  readonly title: string
  readonly onClick?: () => void
}

/** shell.overlay 占位组件：右侧固定边栏 + 各功能悬浮窗。 */
export function LawyerSidebar({
  submitContractReview,
  submitCaseAnalysis,
  submitDocGeneration,
  searchWorkspaceFiles,
  uploadWorkspaceFile,
  listInstalledSkills,
}: LawyerSidebarProps) {
  const [reviewOpen, setReviewOpen] = useState(false)
  const [caseOpen, setCaseOpen] = useState(false)
  const [docOpen, setDocOpen] = useState(false)
  const tabs: readonly LawyerTab[] = [
    {
      id: 'contract-review',
      label: '合同审核',
      icon: <ContractIcon />,
      disabled: false,
      title: '合同审核：填写表单后发起律师模式会话',
      onClick: () => setReviewOpen(true),
    },
    {
      id: 'case-analysis',
      label: '案件分析',
      icon: <SearchIcon />,
      disabled: false,
      title: '案件分析：事实梳理 / 争议焦点 / 证据审查 / 风险评估',
      onClick: () => setCaseOpen(true),
    },
    {
      id: 'doc-generation',
      label: '案件文书生成',
      icon: <PenIcon />,
      disabled: false,
      title: '文书生成：起诉状 / 答辩状 / 代理词 / 法律意见书',
      onClick: () => setDocOpen(true),
    },
    { id: 'pdf-watermark', label: 'PDF 去水印', icon: <WatermarkIcon />, disabled: true, title: '功能开发中' },
  ]
  return (
    <>
      <nav className="lawyer-sidebar" aria-label="律师工作台">
        {tabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            className="lawyer-sidebar__tab"
            disabled={tab.disabled}
            onClick={tab.onClick}
            title={tab.title}
          >
            <span className="lawyer-sidebar__tab-icon">{tab.icon}</span>
            <span className="lawyer-sidebar__tab-label">{tab.label}</span>
          </button>
        ))}
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
        />
      )}
    </>
  )
}

/**
 * 右侧固定边栏（shell.overlay 槽位，root 作用域：不随会话切换消失）。
 * 选项卡形式：M1 仅实现“合同审核”的功能（点击注入预设指令）；
 * 其余选项卡为规划占位（禁用态，title 提示开发中），功能在后续里程碑接入。
 */
import type { ReactNode } from 'react'

/** 注册 inject 工厂注入的业务回调（见 client/index.ts）。 */
export interface LawyerSidebarInjected {
  /** 向当前会话注入合同审核预设指令；无当前会话时先新建再注入。 */
  readonly startContractReview: () => void
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
      <path d="M10.5 3.2l2.1 2.1" stroke="currentColor" strokeWidth="1.1" />
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

/** 边栏选项卡数据：M1 只有合同审核可用。 */
interface LawyerTab {
  readonly id: string
  readonly label: string
  readonly icon: ReactNode
  readonly disabled: boolean
  readonly onClick?: () => void
}

/** shell.overlay 占位组件：右侧固定边栏（选项卡列表）。 */
export function LawyerSidebar({ startContractReview }: LawyerSidebarProps) {
  const tabs: readonly LawyerTab[] = [
    { id: 'contract-review', label: '合同审核', icon: <ContractIcon />, disabled: false, onClick: startContractReview },
    { id: 'case-analysis', label: '案件分析', icon: <SearchIcon />, disabled: true },
    { id: 'doc-generation', label: '案件文书生成', icon: <PenIcon />, disabled: true },
    { id: 'pdf-watermark', label: 'PDF 去水印', icon: <WatermarkIcon />, disabled: true },
  ]
  return (
    <nav className="lawyer-sidebar" aria-label="律师工作台">
      {tabs.map(tab => (
        <button
          key={tab.id}
          type="button"
          className="lawyer-sidebar__tab"
          disabled={tab.disabled}
          onClick={tab.onClick}
          title={tab.disabled ? '功能开发中' : '合同审核：向当前对话注入合同审核指令'}
        >
          <span className="lawyer-sidebar__tab-icon">{tab.icon}</span>
          <span className="lawyer-sidebar__tab-label">{tab.label}</span>
        </button>
      ))}
    </nav>
  )
}

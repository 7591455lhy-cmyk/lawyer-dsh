/**
 * 案件分析发起表单（悬浮窗，M3）。
 *
 * 收集：我方立场 / 分析侧重（六模块勾选，默认全开）/ 案件材料（FilePicker：
 * 起诉状、合同、证据、聊天记录等均可）。提交后由 client/index.ts 新建
 * 律师模式会话并注入 /case-analysis 手势指令与附件。
 */
import { useState, type ReactNode } from 'react'
import {
  EMPTY_FILE_PICKER_VALUE, FilePicker, type FilePickerValue,
} from './FilePicker.tsx'
import type { FilePickerPropsLike } from './ContractReviewDialog.tsx'
// 编译期常量：由 build.ps1 的 --define:__LAWYER_DEMO__=true|false 注入
// （-NoDemo 出无演示数据版本）。见 ContractReviewDialog.tsx 的同名声明。
declare const __LAWYER_DEMO__: boolean
import { CASE_ANALYSIS_DEMO } from './demoData.ts'

/** 分析模块键（与 case-analysis SKILL.md 的分析流程一一对应）。 */
export type AnalysisFocus = 'facts' | 'relations' | 'issues' | 'evidence' | 'claims' | 'risk'

/** 表单提交结果。 */
export interface CaseAnalysisRequest {
  readonly stance: string
  /** 勾选启用的分析模块（默认全开）。 */
  readonly focus: readonly AnalysisFocus[]
  readonly paths: readonly string[]
  readonly images: FilePickerValue['images']
  readonly texts: FilePickerValue['texts']
  /** 演示回放标记（M6.3）：载入演示数据后提交 = 直接展示预录成果。 */
  readonly demoReplay?: boolean
}

/** 立场选项（决定风险评估视角）。 */
const STANCE_OPTIONS = [
  '原告方',
  '被告方',
  '上诉方',
  '被上诉方',
  '中立评估（不预设立场）',
] as const

/** 六模块展示定义（顺序即报告章节顺序）。 */
const FOCUS_OPTIONS: readonly { readonly key: AnalysisFocus; readonly label: string; readonly hint: string }[] = [
  { key: 'facts', label: '事实梳理', hint: '时间线与事实三分（无争议/争议/待查）' },
  { key: 'relations', label: '法律关系识别', hint: '主从法律关系定性与竞合选择' },
  { key: 'issues', label: '争议焦点归纳', hint: '事实焦点与法律焦点、双方主张' },
  { key: 'evidence', label: '证据审查', hint: '三性审查、证明力与补证建议' },
  { key: 'claims', label: '请求权基础分析', hint: '要件涵摄与抗辩检视' },
  { key: 'risk', label: '诉讼风险评估', hint: '胜诉前景、程序风险与关键变量' },
]

interface CaseAnalysisDialogProps {
  readonly onCancel: () => void
  readonly onSubmit: (request: CaseAnalysisRequest) => void
  readonly searchWorkspaceFiles: FilePickerPropsLike['searchWorkspaceFiles']
  readonly uploadWorkspaceFile: FilePickerPropsLike['uploadWorkspaceFile']
  /**
   * M8：实务画像入口（由父组件渲染后传入，点击打开画像配置面板）。
   * 传节点而非回调，是为了让三个表单共用同一块 UI 而不各自引入画像状态。
   */
  readonly profileEntry?: ReactNode
}

/** 案件分析发起表单：悬浮窗。 */
export function CaseAnalysisDialog({
  onCancel,
  onSubmit,
  searchWorkspaceFiles,
  uploadWorkspaceFile,
  profileEntry,
}: CaseAnalysisDialogProps) {
  const [stance, setStance] = useState<string>(STANCE_OPTIONS[0])
  const [focus, setFocus] = useState<readonly AnalysisFocus[]>(FOCUS_OPTIONS.map(option => option.key))
  const [files, setFiles] = useState<FilePickerValue>(EMPTY_FILE_PICKER_VALUE)
  const [busy, setBusy] = useState(false)
  /** 载入演示数据后的提示文案（空串即未载入）。 */
  const [demoNotice, setDemoNotice] = useState('')
  /** 演示回放开关（载入演示数据即 armed；提交走预录成果回放）。 */
  const [demoArmed, setDemoArmed] = useState(false)
  /** 提交按钮的「（演示回放）」后缀：见 ContractReviewDialog.tsx 的同款注释。 */
  const replaySuffix = __LAWYER_DEMO__ && demoArmed ? '（演示回放）' : ''

  /**
   * 一键载入演示数据（覆盖当前已填内容）。三份案情材料（起诉状 + 合同
   * 条款与对账记录 + 微信记录与往来函件）以文本材料形态内嵌，载入后
   * 直接点击"开始分析"即可产出六模块完整分析报告。
   */
  // 条件表达式而非函数体内 if：见 ContractReviewDialog.tsx 的同款注释。
  const loadDemo: (() => void) | undefined = __LAWYER_DEMO__ ? (): void => {
    setStance(CASE_ANALYSIS_DEMO.stance)
    setFocus(CASE_ANALYSIS_DEMO.focus)
    setFiles({ paths: [], images: [], texts: CASE_ANALYSIS_DEMO.texts })
    setDemoArmed(true)
    setDemoNotice(`已载入「${CASE_ANALYSIS_DEMO.label}」，点击"开始分析"将直接展示预录成果`)
  } : undefined

  const toggleFocus = (key: AnalysisFocus, checked: boolean): void => {
    setFocus(current => checked
      ? [...current, key]
      : current.filter(item => item !== key))
  }

  const submit = (): void => {
    setBusy(true)
    onSubmit({
      stance,
      focus,
      paths: files.paths,
      images: files.images,
      texts: files.texts,
      ...(demoArmed ? { demoReplay: true } : {}),
    })
  }

  return (
    <div
      className="lawyer-dialog-mask"
      role="dialog"
      aria-modal="true"
      aria-label="发起案件分析"
      onClick={event => { if (event.target === event.currentTarget) onCancel() }}
    >
      <div className="lawyer-dialog">
        <div className="lawyer-dialog__header">
          <h2 className="lawyer-dialog__title">发起案件分析</h2>
          <button
            type="button"
            className="lawyer-dialog__close"
            aria-label="关闭"
            onClick={onCancel}
            disabled={busy}
          >
            ✕
          </button>
        </div>

        {__LAWYER_DEMO__ && (
          <div className="lawyer-dialog__demo">
            <button
              type="button"
              className="lawyer-dialog__demo-btn"
              onClick={loadDemo}
              disabled={busy}
              title={`填充演示数据（${CASE_ANALYSIS_DEMO.label}）——覆盖当前已填内容，载入后可直接开始分析`}
            >
              ⚡ 载入演示数据
            </button>
            {demoNotice !== '' && <span className="lawyer-dialog__demo-hint">{demoNotice}</span>}
          </div>
        )}

        <label className="lawyer-dialog__label" htmlFor="lawyer-case-stance">我方立场</label>
        <select
          id="lawyer-case-stance"
          className="lawyer-dialog__select"
          value={stance}
          onChange={event => setStance(event.target.value)}
          disabled={busy}
        >
          {STANCE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
        </select>

        <span className="lawyer-dialog__label">分析侧重（全部取消时将由 AI 先与你确认范围）</span>
        <div className="lawyer-dialog__strictness">
          {FOCUS_OPTIONS.map(option => (
            <label key={option.key} className="lawyer-dialog__skill-option">
              <input
                type="checkbox"
                checked={focus.includes(option.key)}
                onChange={event => toggleFocus(option.key, event.target.checked)}
                disabled={busy}
              />
              <span>
                <span className="lawyer-dialog__skill-name">{option.label}</span>
                <span className="lawyer-dialog__strictness-hint">{option.hint}</span>
              </span>
            </label>
          ))}
        </div>

        <FilePicker
          label="案件材料"
          dropHint="起诉状、合同、证据、聊天记录等（Word/PDF/图片/文本）拖入即可，支持整个文件夹——自动复制进工作区后引用"
          value={files}
          onChange={setFiles}
          disabled={busy}
          searchWorkspaceFiles={searchWorkspaceFiles}
          uploadWorkspaceFile={uploadWorkspaceFile}
        />

        {profileEntry}

        <div className="lawyer-dialog__actions">
          <button type="button" className="lawyer-dialog__cancel" onClick={onCancel} disabled={busy}>
            取消
          </button>
          <button type="button" className="lawyer-dialog__submit" onClick={submit} disabled={busy}>
            {busy ? '正在发起…' : `开始分析${replaySuffix}`}
          </button>
        </div>
      </div>
    </div>
  )
}

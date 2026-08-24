/**
 * 案件分析发起表单（悬浮窗，M3）。
 *
 * 收集：我方立场 / 分析侧重（六模块勾选，默认全开）/ 案件材料（FilePicker：
 * 起诉状、合同、证据、聊天记录等均可）。提交后由 client/index.ts 复用/新建
 * 律师模式会话并注入 /case-analysis 手势指令与附件。
 */
import { useState } from 'react'
import {
  EMPTY_FILE_PICKER_VALUE, FilePicker, type FilePickerValue,
} from './FilePicker.tsx'
import type { FilePickerPropsLike } from './ContractReviewDialog.tsx'

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
}

/** 案件分析发起表单：悬浮窗。 */
export function CaseAnalysisDialog({
  onCancel,
  onSubmit,
  searchWorkspaceFiles,
  uploadWorkspaceFile,
}: CaseAnalysisDialogProps) {
  const [stance, setStance] = useState<string>(STANCE_OPTIONS[0])
  const [focus, setFocus] = useState<readonly AnalysisFocus[]>(FOCUS_OPTIONS.map(option => option.key))
  const [files, setFiles] = useState<FilePickerValue>(EMPTY_FILE_PICKER_VALUE)
  const [busy, setBusy] = useState(false)

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
          dropHint="起诉状、合同、证据、聊天记录等（Word/PDF/图片/文本）拖入即可——自动复制进工作区后引用"
          value={files}
          onChange={setFiles}
          disabled={busy}
          searchWorkspaceFiles={searchWorkspaceFiles}
          uploadWorkspaceFile={uploadWorkspaceFile}
        />

        <div className="lawyer-dialog__actions">
          <button type="button" className="lawyer-dialog__cancel" onClick={onCancel} disabled={busy}>
            取消
          </button>
          <button type="button" className="lawyer-dialog__submit" onClick={submit} disabled={busy}>
            {busy ? '正在发起…' : '开始分析'}
          </button>
        </div>
      </div>
    </div>
  )
}

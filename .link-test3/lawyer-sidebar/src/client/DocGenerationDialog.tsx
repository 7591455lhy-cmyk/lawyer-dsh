/**
 * 案件文书生成发起表单（悬浮窗，M3）。
 *
 * 收集：文书类型（四类单选）/ 我方当事人身份 / 补充说明 / 案件材料
 * （FilePicker）。提交后由 client/index.ts 复用/新建律师模式会话并注入
 * /doc-generation 手势指令与附件；当事人身份要素等未提供信息由技能
 * 侧统一留【待填：…】占位（SKILL.md 填空位原则）。
 */
import { useState } from 'react'
import {
  EMPTY_FILE_PICKER_VALUE, FilePicker, type FilePickerValue,
} from './FilePicker.tsx'
import type { FilePickerPropsLike } from './ContractReviewDialog.tsx'

/** 文书类型。 */
export type DocType = '民事起诉状' | '民事答辩状' | '代理词' | '法律意见书'

/** 我方当事人身份（下拉固定三选项）。 */
export type PartyRole = '原告' | '被告' | '第三人'

/** 表单提交结果。 */
export interface DocGenerationRequest {
  readonly docType: DocType
  /** 我方当事人身份。 */
  readonly partyRole: PartyRole
  /** 补充说明（诉请金额、管辖法院、落款律所等）。 */
  readonly notes: string
  readonly paths: readonly string[]
  readonly images: FilePickerValue['images']
  readonly texts: FilePickerValue['texts']
}

/** 文书类型展示定义。 */
const DOC_TYPES: readonly { readonly type: DocType; readonly hint: string }[] = [
  { type: '民事起诉状', hint: '当事人段 + 诉讼请求逐项编号 + 事实与理由' },
  { type: '民事答辩状', hint: '针对起诉状逐项表态与答辩' },
  { type: '代理词', hint: '围绕争议焦点分点论证' },
  { type: '法律意见书', hint: '委托事项的法律分析与结论意见' },
]

/** 身份下拉选项。 */
const PARTY_ROLE_OPTIONS = ['原告', '被告', '第三人'] as const

interface DocGenerationDialogProps {
  readonly onCancel: () => void
  readonly onSubmit: (request: DocGenerationRequest) => void
  readonly searchWorkspaceFiles: FilePickerPropsLike['searchWorkspaceFiles']
  readonly uploadWorkspaceFile: FilePickerPropsLike['uploadWorkspaceFile']
}

/** 案件文书生成发起表单：悬浮窗。 */
export function DocGenerationDialog({
  onCancel,
  onSubmit,
  searchWorkspaceFiles,
  uploadWorkspaceFile,
}: DocGenerationDialogProps) {
  const [docType, setDocType] = useState<DocType>(DOC_TYPES[0].type)
  const [partyRole, setPartyRole] = useState<PartyRole>(PARTY_ROLE_OPTIONS[0])
  const [notes, setNotes] = useState('')
  const [files, setFiles] = useState<FilePickerValue>(EMPTY_FILE_PICKER_VALUE)
  const [busy, setBusy] = useState(false)

  const submit = (): void => {
    setBusy(true)
    onSubmit({
      docType,
      partyRole,
      notes: notes.trim(),
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
      aria-label="发起案件文书生成"
      onClick={event => { if (event.target === event.currentTarget) onCancel() }}
    >
      <div className="lawyer-dialog">
        <div className="lawyer-dialog__header">
          <h2 className="lawyer-dialog__title">发起案件文书生成</h2>
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

        <span className="lawyer-dialog__label">文书类型</span>
        <div className="lawyer-dialog__strictness" role="radiogroup" aria-label="文书类型">
          {DOC_TYPES.map(option => (
            <label key={option.type} className="lawyer-dialog__strictness-option">
              <input
                type="radio"
                name="lawyer-doc-type"
                checked={docType === option.type}
                onChange={() => setDocType(option.type)}
                disabled={busy}
              />
              <span>
                <span className="lawyer-dialog__strictness-name">{option.type}</span>
                <span className="lawyer-dialog__strictness-hint">{option.hint}</span>
              </span>
            </label>
          ))}
        </div>

        <label className="lawyer-dialog__label" htmlFor="lawyer-party-role">我方当事人身份</label>
        <select
          id="lawyer-party-role"
          className="lawyer-dialog__select"
          value={partyRole}
          onChange={event => setPartyRole(event.target.value as PartyRole)}
          disabled={busy}
        >
          {PARTY_ROLE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
        </select>

        <label className="lawyer-dialog__label" htmlFor="lawyer-doc-notes">补充说明（可选）</label>
        <textarea
          id="lawyer-doc-notes"
          className="lawyer-dialog__textarea"
          placeholder="如：诉请金额与计算方式、管辖法院、落款律所与律师姓名、答辩期限等"
          value={notes}
          onChange={event => setNotes(event.target.value)}
          disabled={busy}
        />

        <FilePicker
          label="案件材料"
          dropHint="起诉状、合同、证据、聊天记录等（Word/PDF/图片/文本）拖入即可——自动复制进工作区后引用"
          value={files}
          onChange={setFiles}
          disabled={busy}
          searchWorkspaceFiles={searchWorkspaceFiles}
          uploadWorkspaceFile={uploadWorkspaceFile}
        />

        <p className="lawyer-dialog__drop-hint">
          当事人姓名、证件号、住址、法院名称等未提供信息，将在文书中留【待填：…】占位，不会编造。
        </p>

        <div className="lawyer-dialog__actions">
          <button type="button" className="lawyer-dialog__cancel" onClick={onCancel} disabled={busy}>
            取消
          </button>
          <button type="button" className="lawyer-dialog__submit" onClick={submit} disabled={busy}>
            {busy ? '正在发起…' : '开始生成'}
          </button>
        </div>
      </div>
    </div>
  )
}

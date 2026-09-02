/**
 * 案件文书生成发起表单（悬浮窗，M3）。
 *
 * 收集：文书类型（四类单选）/ 我方当事人身份 / 补充说明 / 案件材料
 * （FilePicker）。提交后由 client/index.ts 新建律师模式会话并注入
 * /doc-generation 手势指令与附件；当事人身份要素等未提供信息由技能
 * 侧统一留【待填：…】占位（SKILL.md 填空位原则）。
 */
import { useState, type ReactNode } from 'react'
import {
  EMPTY_FILE_PICKER_VALUE, FilePicker, type FilePickerValue,
} from './FilePicker.tsx'
import type { FilePickerPropsLike } from './ContractReviewDialog.tsx'
// 编译期常量：由 build.ps1 的 --define:__LAWYER_DEMO__=true|false 注入
// （-NoDemo 出无演示数据版本）。见 ContractReviewDialog.tsx 的同名声明。
declare const __LAWYER_DEMO__: boolean
import { DOC_GENERATION_DEMOS } from './demoData.ts'

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
  /** 演示回放标记（M6.3）：载入演示数据后提交 = 直接展示预录成果。 */
  readonly demoReplay?: boolean
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
  /**
   * M8：实务画像入口（由父组件渲染后传入，点击打开画像配置面板）。
   * 传节点而非回调，是为了让三个表单共用同一块 UI 而不各自引入画像状态。
   */
  readonly profileEntry?: ReactNode
}

/** 案件文书生成发起表单：悬浮窗。 */
export function DocGenerationDialog({
  onCancel,
  onSubmit,
  searchWorkspaceFiles,
  uploadWorkspaceFile,
  profileEntry,
}: DocGenerationDialogProps) {
  const [docType, setDocType] = useState<DocType>(DOC_TYPES[0].type)
  const [partyRole, setPartyRole] = useState<PartyRole>(PARTY_ROLE_OPTIONS[0])
  const [notes, setNotes] = useState('')
  const [files, setFiles] = useState<FilePickerValue>(EMPTY_FILE_PICKER_VALUE)
  const [busy, setBusy] = useState(false)
  /** 载入演示数据后的提示文案（空串即未载入）。 */
  const [demoNotice, setDemoNotice] = useState('')
  /** 演示回放开关（载入演示数据即 armed；提交走预录成果回放）。 */
  const [demoArmed, setDemoArmed] = useState(false)
  /** 提交按钮的「（演示回放）」后缀：见 ContractReviewDialog.tsx 的同款注释。 */
  const replaySuffix = __LAWYER_DEMO__ && demoArmed ? '（演示回放）' : ''

  /**
   * 当前文书类型对应的演示数据名（四种类型各一套独立案情）。
   *
   * 刻意写成条件表达式而不是模块级 `const demo = DOC_GENERATION_DEMOS[...]`：
   * 常量折叠后这条引用会连着三元一起消失，demoData.ts 才能被 tree-shaking
   * 掉（模块级 const 即使只被删除的 JSX 用到，也未必会被判定为死代码）。
   */
  const demoLabel = __LAWYER_DEMO__ ? DOC_GENERATION_DEMOS[docType].label : ''

  /**
   * 一键载入当前文书类型的演示数据（覆盖当前已填内容；切换类型后再次
   * 点击即载入新类型的那套数据）。案情材料以文本形态内嵌，载入后直接
   * 点击"开始生成"即可产出对应文书。
   */
  // 条件表达式而非函数体内 if：见 ContractReviewDialog.tsx 的同款注释。
  const loadDemo: (() => void) | undefined = __LAWYER_DEMO__ ? (): void => {
    const demo = DOC_GENERATION_DEMOS[docType]
    setPartyRole(demo.partyRole)
    setNotes(demo.notes)
    setFiles({ paths: [], images: [], texts: demo.texts })
    setDemoArmed(true)
    setDemoNotice(`已载入「${demo.label}」，点击"开始生成"将直接展示预录成果`)
  } : undefined

  const submit = (): void => {
    setBusy(true)
    onSubmit({
      docType,
      partyRole,
      notes: notes.trim(),
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

        {__LAWYER_DEMO__ && (
          <div className="lawyer-dialog__demo">
            <button
              type="button"
              className="lawyer-dialog__demo-btn"
              onClick={loadDemo}
              disabled={busy}
              title={`填充当前文书类型的演示数据（${demoLabel}）——覆盖当前已填内容；切换文书类型后再次点击即载入对应演示`}
            >
              ⚡ 载入演示数据 · {demoLabel}
            </button>
            {demoNotice !== '' && <span className="lawyer-dialog__demo-hint">{demoNotice}</span>}
          </div>
        )}

        <span className="lawyer-dialog__label">文书类型</span>
        <div className="lawyer-dialog__strictness" role="radiogroup" aria-label="文书类型">
          {DOC_TYPES.map(option => (
            <label key={option.type} className="lawyer-dialog__strictness-option">
              <input
                type="radio"
                name="lawyer-doc-type"
                checked={docType === option.type}
                onChange={() => {
                  setDocType(option.type)
                  // 已载入的演示数据对应旧类型，切换后提示失效，清除提示
                  //（材料/说明保留，用户可再次点击载入新类型的演示）。
                  setDemoNotice('')
                }}
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
          dropHint="起诉状、合同、证据、聊天记录等（Word/PDF/图片/文本）拖入即可，支持整个文件夹——自动复制进工作区后引用"
          value={files}
          onChange={setFiles}
          disabled={busy}
          searchWorkspaceFiles={searchWorkspaceFiles}
          uploadWorkspaceFile={uploadWorkspaceFile}
        />

        <p className="lawyer-dialog__drop-hint">
          当事人姓名、证件号、住址、法院名称等未提供信息，将在文书中留【待填：…】占位，不会编造。
        </p>

        {profileEntry}

        <div className="lawyer-dialog__actions">
          <button type="button" className="lawyer-dialog__cancel" onClick={onCancel} disabled={busy}>
            取消
          </button>
          <button type="button" className="lawyer-dialog__submit" onClick={submit} disabled={busy}>
            {busy ? '正在发起…' : `开始生成${replaySuffix}`}
          </button>
        </div>
      </div>
    </div>
  )
}

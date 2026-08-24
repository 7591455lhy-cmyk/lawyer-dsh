/**
 * 合同审核发起表单（悬浮窗，M2.2；M3 起文件区由通用 FilePicker 承载）。
 *
 * 点击侧边栏“合同审核”后弹出，收集三项关键信息：
 *   1. 我方立场（下拉）
 *   2. 合同文件——FilePicker 单一合并入口（对齐 dsh 自身的文件引用逻辑）
 *   3. 审核严格程度（宽松/常规/严格）
 * 高级选项：三类核心技能开关 + 附加技能（/name 手势注入）。
 *
 * 提交后由 client/index.ts 创建律师模式会话并注入手势指令与图片附件。
 */
import { useEffect, useState } from 'react'
import type { SkillEntry } from '@deepseek-ai/dsh-api-remotes/client'
import {
  EMPTY_FILE_PICKER_VALUE, FilePicker, type FilePickerValue,
} from './FilePicker.tsx'

/** 审核严格程度档位。 */
export type Strictness = '宽松' | '常规' | '严格'

/** 表单提交结果。 */
export interface ContractReviewRequest {
  readonly stance: string
  readonly strictness: Strictness
  /** 修订人署名（docx 修订留痕稿的 w:author；空则由技能侧取默认）。 */
  readonly reviewerName: string
  /** 技能配置（高级选项）：分类技能开关 + 附加手势技能。 */
  readonly skills: SkillSelection
  /** 以 @ 引用记入的工作区文件路径（含手输完整路径）。 */
  readonly paths: readonly string[]
  readonly images: FilePickerValue['images']
  readonly texts: FilePickerValue['texts']
}

/** 技能勾选状态：三类核心技能 + 附加技能（经 /name 手势注入）。 */
export interface SkillSelection {
  /** contract-review：合同审核逻辑框架。 */
  readonly review: boolean
  /** pdfkit-py：PDF 转换与扫描件处理。 */
  readonly preprocess: boolean
  /** docx-tracked-changes：修订留痕审阅稿生成。 */
  readonly output: boolean
  /** 附加技能名列表（已安装技能中自选，手势注入全文）。 */
  readonly extraSkills: readonly string[]
}

/** 核心技能分类展示（默认全启用 = 完整审核-输出链）。 */
const SKILL_CATEGORIES = [
  {
    key: 'review' as const,
    label: '审核逻辑',
    name: 'contract-review',
    hint: '合同审核框架与流程（含法规核查、双文件交付）',
  },
  {
    key: 'preprocess' as const,
    label: '输入预处理',
    name: 'pdfkit-py',
    hint: 'PDF 转 docx、扫描件渲染转录、加密处理',
  },
  {
    key: 'output' as const,
    label: '文档输出',
    name: 'docx-tracked-changes',
    hint: '修订留痕审阅稿（Word/WPS 审阅模式）',
  },
]

/** 立场选项。 */
const STANCE_OPTIONS = [
  '甲方',
  '乙方',
  '丙方或其他当事方',
  '不指定（以中立视角全面审核）',
] as const

/** 档位说明（展示给用户）。 */
const STRICTNESS_HINTS: Readonly<Record<Strictness, string>> = {
  宽松: '只报高风险与核心条款问题',
  常规: '标准框架全面审核',
  严格: '逐条深挖，法规核查全覆盖',
}

interface ContractReviewDialogProps {
  readonly onCancel: () => void
  readonly onSubmit: (request: ContractReviewRequest) => void
  /** 按 dsh fileReferences 索引搜索当前会话工作区文件（@ 引用同款数据源）。 */
  readonly searchWorkspaceFiles: FilePickerPropsLike['searchWorkspaceFiles']
  /** 把浏览器读到的文件内容（base64）上传进当前工作区，返回绝对路径。 */
  readonly uploadWorkspaceFile: FilePickerPropsLike['uploadWorkspaceFile']
  /** 列出当前会话可用的已安装技能目录（dsh skills RPC，含禁用模型调用的）。 */
  readonly listInstalledSkills: () => Promise<readonly SkillEntry[] | undefined>
}

/** 仅为复用 FilePicker props 中的回调签名（避免重复声明）。 */
export type FilePickerPropsLike = Parameters<typeof FilePicker>[0]

/** 合同审核发起表单：悬浮窗。 */
export function ContractReviewDialog({
  onCancel,
  onSubmit,
  searchWorkspaceFiles,
  uploadWorkspaceFile,
  listInstalledSkills,
}: ContractReviewDialogProps) {
  const [stance, setStance] = useState<string>(STANCE_OPTIONS[0])
  const [strictness, setStrictness] = useState<Strictness>('常规')
  const [reviewerName, setReviewerName] = useState('')
  const [files, setFiles] = useState<FilePickerValue>(EMPTY_FILE_PICKER_VALUE)
  const [busy, setBusy] = useState(false)

  // 高级选项（技能配置）：三类核心技能默认全启用；附加技能自选。
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [skillEnabled, setSkillEnabled] = useState({ review: true, preprocess: true, output: true })
  const [extraSkills, setExtraSkills] = useState<readonly string[]>([])
  const [installedSkills, setInstalledSkills] = useState<readonly SkillEntry[] | undefined>(undefined)
  const [skillsLoading, setSkillsLoading] = useState(false)

  // 高级选项展开时懒加载已安装技能目录（仅一次）。
  useEffect(() => {
    if (!advancedOpen || installedSkills !== undefined || skillsLoading) return
    setSkillsLoading(true)
    listInstalledSkills().then(
      entries => {
        setInstalledSkills(entries ?? [])
        setSkillsLoading(false)
      },
      () => {
        setInstalledSkills([])
        setSkillsLoading(false)
      },
    )
  }, [advancedOpen, installedSkills, skillsLoading, listInstalledSkills])

  /** 下拉可选项：已安装技能中排除三类核心技能与已添加项。 */
  const selectableSkills = (installedSkills ?? []).filter(
    entry => !SKILL_CATEGORIES.some(category => category.name === entry.name)
      && !extraSkills.includes(entry.name),
  )

  const submit = (): void => {
    setBusy(true)
    onSubmit({
      stance,
      strictness,
      reviewerName: reviewerName.trim(),
      skills: { ...skillEnabled, extraSkills },
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
      aria-label="发起合同审核"
      onClick={event => { if (event.target === event.currentTarget) onCancel() }}
    >
      <div className="lawyer-dialog">
        <div className="lawyer-dialog__header">
          <h2 className="lawyer-dialog__title">发起合同审核</h2>
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

        <label className="lawyer-dialog__label" htmlFor="lawyer-stance">我方立场</label>
        <select
          id="lawyer-stance"
          className="lawyer-dialog__select"
          value={stance}
          onChange={event => setStance(event.target.value)}
          disabled={busy}
        >
          {STANCE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
        </select>

        <FilePicker
          label="合同文件"
          dropHint="任意合同文件（Word/PDF/图片/文本）拖入即可——自动复制进工作区后引用"
          value={files}
          onChange={setFiles}
          disabled={busy}
          searchWorkspaceFiles={searchWorkspaceFiles}
          uploadWorkspaceFile={uploadWorkspaceFile}
        />

        <span className="lawyer-dialog__label">审核严格程度</span>
        <div className="lawyer-dialog__strictness" role="radiogroup" aria-label="审核严格程度">
          {(['宽松', '常规', '严格'] as const).map(option => (
            <label key={option} className="lawyer-dialog__strictness-option">
              <input
                type="radio"
                name="lawyer-strictness"
                checked={strictness === option}
                onChange={() => setStrictness(option)}
                disabled={busy}
              />
              <span>
                <span className="lawyer-dialog__strictness-name">{option}</span>
                <span className="lawyer-dialog__strictness-hint">{STRICTNESS_HINTS[option]}</span>
              </span>
            </label>
          ))}
        </div>

        <label className="lawyer-dialog__label" htmlFor="lawyer-reviewer">修订人署名（docx 审阅稿留痕用）</label>
        <input
          id="lawyer-reviewer"
          type="text"
          className="lawyer-dialog__input"
          placeholder="如：XX律所-张律师；留空则默认“律师工作台”"
          value={reviewerName}
          onChange={event => setReviewerName(event.target.value)}
          disabled={busy}
        />

        <button
          type="button"
          className="lawyer-dialog__advanced-toggle"
          onClick={() => setAdvancedOpen(current => !current)}
          disabled={busy}
          aria-expanded={advancedOpen}
        >
          {advancedOpen ? '▾' : '▸'} 高级选项（技能配置）
        </button>
        {advancedOpen && (
          <div className="lawyer-dialog__advanced">
            {SKILL_CATEGORIES.map(category => (
              <label key={category.key} className="lawyer-dialog__skill-option">
                <input
                  type="checkbox"
                  checked={skillEnabled[category.key]}
                  onChange={event => setSkillEnabled(current => ({
                    ...current,
                    [category.key]: event.target.checked,
                  }))}
                  disabled={busy}
                />
                <span>
                  <span className="lawyer-dialog__skill-category">{category.label}</span>
                  <span className="lawyer-dialog__skill-name">{category.name}</span>
                  <span className="lawyer-dialog__strictness-hint">{category.hint}</span>
                </span>
              </label>
            ))}
            {extraSkills.length > 0 && (
              <ul className="lawyer-dialog__files">
                {extraSkills.map((name, index) => (
                  <li key={name} className="lawyer-dialog__file">
                    <span className="lawyer-dialog__file-name" title={`附加技能：${name}`}>
                      ⚡ {name}
                    </span>
                    <button
                      type="button"
                      className="lawyer-dialog__file-remove"
                      aria-label={`移除 ${name}`}
                      onClick={() => setExtraSkills(current => current.filter((_, i) => i !== index))}
                      disabled={busy}
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="lawyer-dialog__search-row">
              <select
                className="lawyer-dialog__select"
                value=""
                disabled={busy || skillsLoading || selectableSkills.length === 0}
                onChange={event => {
                  const name = event.target.value
                  if (name !== '') setExtraSkills(current => [...current, name])
                  event.target.value = ''
                }}
              >
                <option value="">
                  {skillsLoading
                    ? '正在加载已安装技能…'
                    : selectableSkills.length === 0
                      ? '没有更多可添加的技能'
                      : '选择要加载的已安装技能…'}
                </option>
                {selectableSkills.map(entry => (
                  <option key={entry.name} value={entry.name}>
                    {entry.name}{entry.modelInvocable ? '' : '（仅手势）'} — {entry.description.slice(0, 30)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div className="lawyer-dialog__actions">
          <button type="button" className="lawyer-dialog__cancel" onClick={onCancel} disabled={busy}>
            取消
          </button>
          <button type="button" className="lawyer-dialog__submit" onClick={submit} disabled={busy}>
            {busy ? '正在发起…' : '开始审核'}
          </button>
        </div>
      </div>
    </div>
  )
}

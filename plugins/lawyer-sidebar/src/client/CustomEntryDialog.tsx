/**
 * 自定义功能入口发起表单（悬浮窗，M4；M8 升级为配置驱动）。
 *
 * 入口本身由 lawyer-wizard 创建（卡片展示 + 提示词模板 + 表单字段 + 技能
 * 手势 + 法律事项绑定，持久化在 lawyer-workbench 分节）；本表单按入口的
 * fields 逐项渲染控件，提交后经 client/index.ts 走与内置入口同一条注入
 * 链路：新建专属会话 → 切 preset → 注入指令与材料。
 *
 * 未配置 fields 的旧入口注入一个「补充说明」隐式字段，指令形态与旧版一致
 * （零回归）；模板为空时指令按「任务目标 + 各字段的标签：值」拼装。
 */
import { useState } from 'react'
import type { FileReferenceCandidate } from '@deepseek-ai/dsh-api-remotes/client'
import { FilePicker, type FilePickerValue } from './FilePicker.tsx'
import type { CustomEntryField, CustomLawyerEntry } from './config.ts'
import {
  effectiveFields,
  initialValues,
  isFilesValue,
  type CustomFieldValue,
  type CustomFieldValues,
} from './prompt.ts'

/** 表单提交结果。 */
export interface CustomEntryRequest {
  /** 目标入口（含模板、字段与法律事项配置）。 */
  readonly entry: CustomLawyerEntry
  /** 本次各字段的取值（键为字段 id）。 */
  readonly values: CustomFieldValues
}

interface CustomEntryDialogProps {
  /** 目标入口配置。 */
  readonly entry: CustomLawyerEntry
  readonly onCancel: () => void
  readonly onSubmit: (request: CustomEntryRequest) => void
  /** 按 dsh fileReferences 索引搜索当前会话工作区文件（@ 引用同款数据源）。 */
  readonly searchWorkspaceFiles: (
    query: string,
    signal: AbortSignal,
  ) => Promise<readonly FileReferenceCandidate[] | undefined>
  /** 把浏览器读到的文件内容上传进当前工作区，返回工作区内绝对路径。 */
  readonly uploadWorkspaceFile: Parameters<typeof FilePicker>[0]['uploadWorkspaceFile']
}

/** 字符串型字段值的读取（其它形态退化为 ''）。 */
function asText(value: CustomFieldValue | undefined): string {
  return typeof value === 'string' ? value : ''
}

/** 多选型字段值的读取。 */
function asList(value: CustomFieldValue | undefined): readonly string[] {
  return Array.isArray(value) ? value : []
}

/** 空材料集合（files 字段的兜底初值）。 */
const EMPTY_FILES: FilePickerValue = { paths: [], images: [], texts: [] }

/** 文件型字段值的读取（借 isFilesValue 谓词收窄：Array.isArray 收窄不了只读数组）。 */
function asFiles(value: CustomFieldValue | undefined): FilePickerValue {
  return value !== undefined && isFilesValue(value) ? value : EMPTY_FILES
}

/** 单个字段控件（按类型分派，六种字段类型）。 */
function FieldControl({
  field,
  value,
  disabled,
  onChange,
  searchWorkspaceFiles,
  uploadWorkspaceFile,
}: {
  readonly field: CustomEntryField
  readonly value: CustomFieldValue | undefined
  readonly disabled: boolean
  readonly onChange: (value: CustomFieldValue) => void
  readonly searchWorkspaceFiles: CustomEntryDialogProps['searchWorkspaceFiles']
  readonly uploadWorkspaceFile: CustomEntryDialogProps['uploadWorkspaceFile']
}) {
  const options = field.options ?? []
  const inputId = `lawyer-custom-field-${field.id}`
  return (
    <div className="lawyer-dialog__field">
      {field.type !== 'files' && (
        <label className="lawyer-dialog__label" htmlFor={inputId}>{field.label}</label>
      )}
      {field.type === 'text' && (
        <input
          id={inputId}
          type="text"
          className="lawyer-dialog__input"
          value={asText(value)}
          placeholder={field.placeholder ?? ''}
          disabled={disabled}
          onChange={event => onChange(event.target.value)}
        />
      )}
      {field.type === 'textarea' && (
        <textarea
          id={inputId}
          className="lawyer-dialog__textarea"
          value={asText(value)}
          placeholder={field.placeholder ?? ''}
          disabled={disabled}
          onChange={event => onChange(event.target.value)}
        />
      )}
      {field.type === 'select' && (
        <select
          id={inputId}
          className="lawyer-dialog__select"
          value={asText(value)}
          disabled={disabled}
          onChange={event => onChange(event.target.value)}
        >
          {options.map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      )}
      {field.type === 'radio' && (
        <div className="lawyer-dialog__options">
          {options.map(option => (
            <label key={option} className="lawyer-dialog__option">
              <input
                type="radio"
                name={inputId}
                value={option}
                checked={asText(value) === option}
                disabled={disabled}
                onChange={() => onChange(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
      {field.type === 'checkbox' && (
        <div className="lawyer-dialog__options">
          {options.map(option => (
            <label key={option} className="lawyer-dialog__option">
              <input
                type="checkbox"
                value={option}
                checked={asList(value).includes(option)}
                disabled={disabled}
                onChange={event => {
                  const current = asList(value)
                  onChange(event.target.checked
                    ? [...current, option]
                    : current.filter(item => item !== option))
                }}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
      )}
      {field.type === 'files' && (
        <FilePicker
          label={field.label}
          dropHint={field.dropHint ?? ''}
          value={asFiles(value)}
          onChange={onChange}
          disabled={disabled}
          searchWorkspaceFiles={searchWorkspaceFiles}
          uploadWorkspaceFile={uploadWorkspaceFile}
        />
      )}
      {field.hint !== undefined && field.hint !== '' && <p className="lawyer-dialog__notice">{field.hint}</p>}
    </div>
  )
}

/** 自定义入口发起表单：悬浮窗（按入口 fields 渲染）。 */
export function CustomEntryDialog({
  entry,
  onCancel,
  onSubmit,
  searchWorkspaceFiles,
  uploadWorkspaceFile,
}: CustomEntryDialogProps) {
  // 未配置字段的旧入口退化为一个「补充说明」输入框（与旧行为一致）。
  const fields = effectiveFields(entry)
  const [values, setValues] = useState<CustomFieldValues>(() => initialValues(fields))
  const [busy, setBusy] = useState(false)

  const update = (id: string, value: CustomFieldValue): void => {
    setValues(previous => ({ ...previous, [id]: value }))
  }

  const submit = (): void => {
    setBusy(true)
    onSubmit({ entry, values })
  }

  const gestures = [
    ...entry.legal !== undefined ? [entry.legal.adapter] : [],
    entry.skill,
    ...entry.extraSkills ?? [],
  ].map(name => `/${name}`).join(' ')

  return (
    <div
      className="lawyer-dialog-mask"
      role="dialog"
      aria-modal="true"
      aria-label={`发起${entry.label}`}
      onClick={event => { if (event.target === event.currentTarget) onCancel() }}
    >
      <div className="lawyer-dialog">
        <div className="lawyer-dialog__header">
          <h2 className="lawyer-dialog__title">发起{entry.label}</h2>
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

        <p className="lawyer-dialog__notice">
          自定义功能——将以 {gestures} 技能手势发起{entry.agentPreset === undefined || entry.agentPreset === '' ? '当前模式的会话' : `「${entry.agentPreset}」会话`}
        </p>
        {entry.legal !== undefined && (
          <p className="lawyer-dialog__notice">
            法律事项：claude-for-legal-ZH · {entry.legal.domain}
            {entry.legal.skills.length > 0 ? `（${entry.legal.skills.map(name => `/${name}`).join(' ')}）` : '（由 adapter 按材料路由原始技能）'}
            ——按领域画像与三层调用规程执行
          </p>
        )}
        {entry.purpose !== undefined && entry.purpose !== '' && (
          <p className="lawyer-dialog__notice">任务目标：{entry.purpose}</p>
        )}
        {entry.mcp !== undefined && (
          <p className="lawyer-dialog__notice">
            MCP 偏好：
            {entry.mcp.preset === 'yuandian' ? '元典 · 法规检索' : entry.mcp.note ?? '自定义'}
          </p>
        )}

        {fields.map(field => (
          <FieldControl
            key={field.id}
            field={field}
            value={values[field.id]}
            disabled={busy}
            onChange={value => update(field.id, value)}
            searchWorkspaceFiles={searchWorkspaceFiles}
            uploadWorkspaceFile={uploadWorkspaceFile}
          />
        ))}

        <div className="lawyer-dialog__actions">
          <button type="button" className="lawyer-dialog__cancel" onClick={onCancel} disabled={busy}>
            取消
          </button>
          <button type="button" className="lawyer-dialog__submit" onClick={submit} disabled={busy}>
            {busy ? '正在发起…' : `开始${entry.label}`}
          </button>
        </div>
      </div>
    </div>
  )
}

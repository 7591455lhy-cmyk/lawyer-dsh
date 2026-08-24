/**
 * 案件/合同材料合并选择区（M3 从 ContractReviewDialog 抽取的通用受控组件，
 * 三个入口表单共用）。单一合并入口，对齐 dsh 自身的文件引用逻辑：
 *   a. 搜索/候选：经 Host 的 fileReferences 索引（dsh @ 引用同款数据源）
 *      搜索当前会话工作区内的文件，点选即以 @path 记入；初始列出根目录，
 *      点目录可逐级进入
 *   b. 粘贴完整路径后回车，直接作为 @path 条目加入
 *   c. 拖入/点击选择：图片扫描件（≤5MB/张，≤20 张）走 dsh 附件通道；
 *      .txt/.md 读文本内嵌指令；Word/PDF 浏览器读不了二进制，拖入后
 *      自动按文件名搜索工作区候选，由用户点选（路径交给模型用文件
 *      读取工具读取——lawyer preset 继承 standard 的 tool-fs）；索引
 *      未命中时读内容上传进工作区 .lawyer-uploads/ 落地后引用
 *
 * 受控用法：<FilePicker value={files} onChange={setFiles} …/>；
 * 提交时父组件直接读 value（paths/images/texts）组装指令。
 */
import { useEffect, useRef, useState, type DragEvent, type KeyboardEvent } from 'react'
import type { FileReferenceCandidate, PromptContentPart } from '@deepseek-ai/dsh-api-remotes/client'

/** prompt 图片分项的类型（用 Extract 从联合推导，避免引入 dsh-attachment）。 */
type ImagePart = Extract<PromptContentPart, { type: 'image' }>

/** 单张图片附件（base64，直接映射 PromptContentPart image 分支）。 */
export interface PickedImage {
  readonly name: string
  readonly mediaType: ImagePart['mediaType']
  readonly data: string
  readonly bytes: number
}

/** 单个文本文件（内容将内嵌进指令文本）。 */
export interface PickedText {
  readonly name: string
  readonly content: string
}

/** 已选材料集合（受控值）。 */
export interface FilePickerValue {
  readonly paths: readonly string[]
  readonly images: readonly PickedImage[]
  readonly texts: readonly PickedText[]
}

export const EMPTY_FILE_PICKER_VALUE: FilePickerValue = { paths: [], images: [], texts: [] }

/** 图片限制（与 dsh attachment-local 默认一致）。 */
const IMAGE_MAX_BYTES = 5 * 1024 * 1024
const IMAGE_MAX_COUNT = 20

/** 文本文件限制（内容内嵌指令，避免撑爆上下文）。 */
const TEXT_MAX_BYTES = 2 * 1024 * 1024

/** 搜索防抖。 */
const SEARCH_DEBOUNCE_MS = 250

/** 候选列表最多展示条数。 */
const CANDIDATE_LIMIT = 8

const ACCEPTED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])

/** 以 Promise 读文件为 dataURL（"data:<type>;base64,<data>"）。 */
function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error(`读取 ${file.name} 失败`))
    reader.readAsDataURL(file)
  })
}

/** 以 Promise 读文件为文本。 */
function readAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(reader.error ?? new Error(`读取 ${file.name} 失败`))
    reader.readAsText(file)
  })
}

/** 人类可读的体积。 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/** 路径的 basename（POSIX/Windows 均按 / 与 \ 切）。 */
function basename(path: string): string {
  const cut = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
  return cut < 0 ? path : path.slice(cut + 1)
}

/** 看起来像绝对路径（用于“粘贴完整路径回车加入”判定）。 */
function isAbsolutePathLike(value: string): boolean {
  return /^[a-zA-Z]:[\\/]/.test(value) || value.startsWith('/')
}

interface FilePickerProps {
  /** 区块标题（如“合同文件”“案件材料”）。 */
  readonly label: string
  /** 拖入提示文案（如“任意合同文件……拖入即可”）。 */
  readonly dropHint: string
  readonly value: FilePickerValue
  readonly onChange: (value: FilePickerValue) => void
  readonly disabled: boolean
  /**
   * 按 dsh fileReferences 索引搜索当前会话工作区文件（@ 引用同款数据源）。
   * @returns 候选列表；undefined 表示搜索不可用（无当前会话或 Host 拒绝）。
   */
  readonly searchWorkspaceFiles: (
    query: string,
    signal: AbortSignal,
  ) => Promise<readonly FileReferenceCandidate[] | undefined>
  /**
   * 把浏览器读到的文件内容（base64）上传进当前工作区（Host 侧 lawyerFiles
   * 服务写入 <工作区>/.lawyer-uploads/），返回工作区内的绝对路径。
   * @returns 成功时为绝对路径；失败时为 Error。
   */
  readonly uploadWorkspaceFile: (
    fileName: string,
    contentBase64: string,
    signal: AbortSignal,
  ) => Promise<string | Error>
}

/** 材料合并选择区：搜索 + 粘贴路径 + 拖入/选择文件 + 已选清单。 */
export function FilePicker({
  label,
  dropHint,
  value,
  onChange,
  disabled,
  searchWorkspaceFiles,
  uploadWorkspaceFile,
}: FilePickerProps) {
  const [query, setQuery] = useState('/')
  const [candidates, setCandidates] = useState<readonly FileReferenceCandidate[]>([])
  const [searching, setSearching] = useState(false)
  const [searchUnavailable, setSearchUnavailable] = useState(false)
  const [notice, setNotice] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [busy, setBusy] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  // 搜索（防抖 + 可取消）：query 为 '/' 时列出工作区根目录，点目录逐级进入。
  useEffect(() => {
    const controller = new AbortController()
    const timer = window.setTimeout(() => {
      setSearching(true)
      searchWorkspaceFiles(query, controller.signal).then(
        result => {
          if (controller.signal.aborted) return
          if (result === undefined) {
            setSearchUnavailable(true)
            setCandidates([])
          } else {
            setSearchUnavailable(false)
            setCandidates(result)
          }
          setSearching(false)
        },
        () => {
          if (controller.signal.aborted) return
          setSearchUnavailable(true)
          setCandidates([])
          setSearching(false)
        },
      )
    }, SEARCH_DEBOUNCE_MS)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query, searchWorkspaceFiles])

  /** 添加一个 @ 引用路径（去重）。 */
  const addPath = (path: string): void => {
    onChange({ ...value, paths: value.paths.includes(path) ? value.paths : [...value.paths, path] })
  }

  /** 处理一批用户选入/拖入的文件。 */
  const handleFiles = async (list: readonly File[]): Promise<void> => {
    const nextImages: PickedImage[] = []
    const nextTexts: PickedText[] = []
    const skipped: string[] = []
    // Word/PDF 等浏览器读不了的二进制文档：先按文件名查工作区索引（已
    // 在工作区内的零拷贝直接引用），未命中则把内容上传进工作区落地。
    const unresolved: { file: File; query: string; fullName: string }[] = []
    for (const file of list) {
      const isImage = file.type !== '' && ACCEPTED_IMAGE_TYPES.has(file.type)
      const isText = file.type === 'text/plain' || /\.(?:txt|md)$/i.test(file.name)
      if (isImage) {
        if (file.size > IMAGE_MAX_BYTES) {
          skipped.push(`${file.name}（超过 ${formatBytes(IMAGE_MAX_BYTES)}）`)
          continue
        }
        if (value.images.length + nextImages.length >= IMAGE_MAX_COUNT) {
          skipped.push(`${file.name}（超过 ${IMAGE_MAX_COUNT} 张上限）`)
          continue
        }
        const dataURL = await readAsDataURL(file)
        nextImages.push({
          name: file.name,
          mediaType: file.type as ImagePart['mediaType'],
          data: dataURL.slice(dataURL.indexOf(',') + 1),
          bytes: file.size,
        })
      } else if (isText) {
        if (file.size > TEXT_MAX_BYTES) {
          skipped.push(`${file.name}（超过 ${formatBytes(TEXT_MAX_BYTES)}）`)
          continue
        }
        nextTexts.push({ name: file.name, content: await readAsText(file) })
      } else {
        // 保留 File 本体（上传需要内容）；文件名（去扩展名）作为索引查询词。
        unresolved.push({ file, query: file.name.replace(/\.[^.]+$/, ''), fullName: file.name })
      }
    }
    if (nextImages.length > 0 || nextTexts.length > 0) {
      onChange({
        ...value,
        images: [...value.images, ...nextImages],
        texts: [...value.texts, ...nextTexts],
      })
    }
    if (unresolved.length === 0) {
      setNotice(skipped.length > 0 ? `已跳过：${skipped.join('；')}` : '')
      return
    }

    // 逐个解析：索引唯一命中（basename 与拖入文件全名相等，不区分大小写）
    // 即以 @ 引用零拷贝加入；未命中则读内容上传进工作区 .lawyer-uploads/。
    setBusy(true)
    const added: string[] = []
    const failed: string[] = []
    const manual: { query: string; fullName: string }[] = []
    for (const item of unresolved) {
      let indexHits: readonly FileReferenceCandidate[] | undefined
      try {
        indexHits = await searchWorkspaceFiles(item.query, new AbortController().signal)
      } catch {
        indexHits = undefined
      }
      const exact = (indexHits ?? []).filter(
        candidate => candidate.kind === 'file'
          && basename(candidate.path).toLowerCase() === item.fullName.toLowerCase(),
      )
      if (exact.length === 1) {
        addPath(exact[0].path)
        added.push(`${item.fullName} → ${exact[0].path}`)
        continue
      }
      // 上传兜底：读内容 → Host 写入工作区 → 取回绝对路径。
      const uploaded = await readAsDataURL(item.file).then(
        dataURL => uploadWorkspaceFile(
          item.fullName,
          dataURL.slice(dataURL.indexOf(',') + 1),
          new AbortController().signal,
        ),
        error => new Error(`读取 ${item.fullName} 失败：${error instanceof Error ? error.message : String(error)}`),
      )
      if (typeof uploaded === 'string') {
        addPath(uploaded)
        added.push(`${item.fullName} → ${uploaded}（已复制进工作区）`)
      } else {
        failed.push(`${item.fullName}（${uploaded.message}）`)
        manual.push({ query: item.query, fullName: item.fullName })
      }
    }
    setBusy(false)

    const parts: string[] = []
    if (added.length > 0) {
      parts.push(`已加入：${added.join('；')}`)
    }
    if (failed.length > 0) {
      setQuery(manual[0]?.query ?? query)
      parts.push(`上传失败：${failed.join('；')}——可从候选点选，或粘贴完整路径后回车`)
    }
    if (skipped.length > 0) parts.push(`已跳过：${skipped.join('；')}`)
    setNotice(parts.join('。'))
  }

  const onDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    setDragActive(false)
    void handleFiles(Array.from(event.dataTransfer.files))
  }

  /** 搜索框回车：绝对路径样式则直接加入，否则立即按关键词刷新候选。 */
  const onQueryKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    const entered = query.trim()
    if (isAbsolutePathLike(entered)) {
      addPath(entered)
      setQuery('')
      setNotice('')
    }
  }

  const lockAll = disabled || busy

  return (
    <div className="lawyer-dialog__file-block">
      <label className="lawyer-dialog__label">{label}（搜索工作区 · 粘贴路径 · 拖入文件）</label>
      <div
        className={`lawyer-dialog__file-zone${dragActive ? ' lawyer-dialog__file-zone--active' : ''}`}
        onDragOver={event => { event.preventDefault(); setDragActive(true) }}
        onDragLeave={() => setDragActive(false)}
        onDrop={onDrop}
      >
        <div className="lawyer-dialog__search-row">
          <input
            type="text"
            className="lawyer-dialog__search-input"
            placeholder="输入文件名搜索，或粘贴完整路径后回车"
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={onQueryKeyDown}
            disabled={lockAll}
          />
          <button
            type="button"
            className="lawyer-dialog__browse"
            title="选择文件（图片/文本直接读取；Word/PDF 按文件名搜索）"
            onClick={() => fileInput.current?.click()}
            disabled={lockAll}
          >
            选择文件
          </button>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif,.txt,.md,.pdf,.doc,.docx"
            style={{ display: 'none' }}
            onChange={event => {
              void handleFiles(Array.from(event.target.files ?? []))
              event.target.value = ''
            }}
            disabled={lockAll}
          />
        </div>
        <ul className="lawyer-dialog__candidates">
          {(searching || busy) && <li className="lawyer-dialog__candidate lawyer-dialog__candidate--hint">搜索中…</li>}
          {!searching && !busy && searchUnavailable && (
            <li className="lawyer-dialog__candidate lawyer-dialog__candidate--hint">
              无法搜索工作区（当前没有活动会话）——可拖入图片/文本，或粘贴完整路径后回车
            </li>
          )}
          {!searching && !busy && !searchUnavailable && candidates.length === 0 && (
            <li className="lawyer-dialog__candidate lawyer-dialog__candidate--hint">没有匹配的文件</li>
          )}
          {!searching && !busy && !searchUnavailable && candidates.slice(0, CANDIDATE_LIMIT).map((candidate, index) => {
            if (candidate.kind === 'directory') {
              return (
                <li key={`dir-${index}`}>
                  <button
                    type="button"
                    className="lawyer-dialog__candidate"
                    title={candidate.path}
                    onClick={() => setQuery(`${candidate.path}/`)}
                    disabled={lockAll}
                  >
                    📁 {basename(candidate.path)}/
                  </button>
                </li>
              )
            }
            const selected = value.paths.includes(candidate.path)
            return (
              <li key={`file-${index}`}>
                <button
                  type="button"
                  className={`lawyer-dialog__candidate${selected ? ' lawyer-dialog__candidate--selected' : ''}`}
                  title={candidate.path}
                  onClick={() => addPath(candidate.path)}
                  disabled={lockAll || selected}
                >
                  {selected ? '✓' : '📄'} {basename(candidate.path)}
                </button>
              </li>
            )
          })}
        </ul>
        <p className="lawyer-dialog__drop-hint">{dropHint}</p>
      </div>

      {value.paths.length + value.images.length + value.texts.length > 0 && (
        <ul className="lawyer-dialog__files">
          {value.paths.map((path, index) => (
            <li key={`path-${index}`} className="lawyer-dialog__file">
              <span className="lawyer-dialog__file-name" title={path}>
                📃 {basename(path)}
              </span>
              <button
                type="button"
                className="lawyer-dialog__file-remove"
                aria-label={`移除 ${path}`}
                onClick={() => onChange({
                  ...value,
                  paths: value.paths.filter((_, i) => i !== index),
                })}
                disabled={lockAll}
              >
                ✕
              </button>
            </li>
          ))}
          {value.images.map((image, index) => (
            <li key={`img-${index}`} className="lawyer-dialog__file">
              <span className="lawyer-dialog__file-name" title={image.name}>
                🖼 {image.name}（{formatBytes(image.bytes)}）
              </span>
              <button
                type="button"
                className="lawyer-dialog__file-remove"
                aria-label={`移除 ${image.name}`}
                onClick={() => onChange({
                  ...value,
                  images: value.images.filter((_, i) => i !== index),
                })}
                disabled={lockAll}
              >
                ✕
              </button>
            </li>
          ))}
          {value.texts.map((text, index) => (
            <li key={`txt-${index}`} className="lawyer-dialog__file">
              <span className="lawyer-dialog__file-name" title={text.name}>
                📄 {text.name}（{formatBytes(text.content.length)}）
              </span>
              <button
                type="button"
                className="lawyer-dialog__file-remove"
                aria-label={`移除 ${text.name}`}
                onClick={() => onChange({
                  ...value,
                  texts: value.texts.filter((_, i) => i !== index),
                })}
                disabled={lockAll}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
      {notice !== '' && <p className="lawyer-dialog__notice">{notice}</p>}
    </div>
  )
}

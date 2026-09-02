/**
 * 案件/合同材料合并选择区（M3 从 ContractReviewDialog 抽取的通用受控组件，
 * 三个入口表单共用；M5.1 支持多文件与整个文件夹）。单一合并入口，对齐
 * dsh 自身的文件引用逻辑：
 *   a. 搜索/候选：经 Host 的 fileReferences 索引（dsh @ 引用同款数据源）
 *      搜索当前会话工作区内的文件，点选即以 @path 记入；初始列出根目录，
 *      点目录可逐级进入，也可一键引用整个目录（dsh @dir/ 语法）
 *   b. 粘贴完整路径后回车，直接作为 @path 条目加入（以 / 结尾视为目录）
 *   c. 拖入/点击选择：图片扫描件（≤5MB/张，≤20 张）走 dsh 附件通道；
 *      .txt/.md 读文本内嵌指令；Word/PDF 浏览器读不了二进制，拖入后
 *      自动按文件名搜索工作区候选，由用户点选（路径交给模型用文件
 *      读取工具读取——lawyer preset 继承 standard 的 tool-fs）；索引
 *      未命中时读内容上传进工作区 .lawyer-uploads/ 落地后引用
 *   d. 文件夹（拖入或选择）：webkitGetAsEntry / webkitdirectory 递归
 *      展开为文件清单，图片/文本同 c；二进制按"顶层目录名/相对路径"
 *      上传进工作区 .lawyer-uploads/ 保留目录结构，最后以 @dir/ 引用
 *      顶层目录（模型先列目录再逐个读取）
 *
 * paths 约定：以 "/" 结尾的条目是目录引用（dsh formatFileMention 的
 * directory 形态 @dir/），prompt 组装（prompt.ts）据此生成"先列目录
 * 再逐个读取"的指令行。
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

/** 已选材料集合（受控值；paths 中以 "/" 结尾的条目为目录引用）。 */
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

/** 单次文件夹展开的文件数上限（防误拖巨型目录）。 */
const DIRECTORY_FILE_LIMIT = 60

/** 文件夹展开时跳过的目录/文件名（隐藏项与系统垃圾文件）。 */
const SKIP_NAMES = new Set(['Thumbs.db', 'desktop.ini'])

/** 搜索防抖。 */
const SEARCH_DEBOUNCE_MS = 250

/** 候选列表最多展示条数。 */
const CANDIDATE_LIMIT = 8

const ACCEPTED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp', 'image/gif'])

/** 拖入/选择的文件（relativePath 为文件夹展开时的相对路径，散文件即文件名）。 */
interface DroppedFile {
  readonly file: File
  readonly relativePath: string
}

/** 文件夹展开结果。 */
interface ExpandedDrop {
  readonly files: readonly DroppedFile[]
  readonly truncated: boolean
}

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

/**
 * 规范化为引用路径：反斜杠转正斜杠（与 dsh 候选路径风格一致），
 * 尾部多余斜杠压成一个（目录标记保留）。
 */
function normalizeReferencePath(path: string): string {
  return path.trim().replace(/\\/g, '/').replace(/\/+$/u, '/')
    .replace(/^\/+$/u, '/')
}

/** 是否目录引用条目（约定：以 "/" 结尾）。 */
export function isDirectoryReference(path: string): boolean {
  return path.endsWith('/')
}

/** FileSystemFileEntry.file 的 Promise 包装。 */
function entryFile(entry: FileSystemFileEntry): Promise<File> {
  return new Promise((resolve, reject) => { entry.file(resolve, reject) })
}

/** FileSystemDirectoryReader.readEntries 的 Promise 包装（每批 ≤100 条）。 */
function readEntryBatch(reader: FileSystemDirectoryReader): Promise<readonly FileSystemEntry[]> {
  return new Promise((resolve, reject) => { reader.readEntries(resolve, reject) })
}

/**
 * 递归展开拖入的 entry 树（目录→文件清单）。跳过隐藏项与系统垃圾文件；
 * 文件数超过 {@link DIRECTORY_FILE_LIMIT} 时截断。
 * @param entries - onDrop 同步取出的顶层 entry 列表。
 * @returns 展开的文件清单（relativePath 首段即顶层目录名）与是否截断。
 */
async function expandEntries(entries: readonly FileSystemEntry[]): Promise<ExpandedDrop> {
  const files: DroppedFile[] = []
  let truncated = false
  const walk = async (entry: FileSystemEntry, prefix: string): Promise<void> => {
    if (files.length >= DIRECTORY_FILE_LIMIT) {
      truncated = true
      return
    }
    if (entry.name.startsWith('.') || SKIP_NAMES.has(entry.name)) return
    if (entry.isFile) {
      const file = await entryFile(entry as FileSystemFileEntry)
      if (files.length >= DIRECTORY_FILE_LIMIT) {
        truncated = true
        return
      }
      files.push({ file, relativePath: `${prefix}${file.name}` })
      return
    }
    // directory：readEntries 分批返回，读到空批为止
    const reader = (entry as FileSystemDirectoryEntry).createReader()
    for (;;) {
      const batch = await readEntryBatch(reader)
      if (batch.length === 0) break
      for (const child of batch) await walk(child, `${prefix}${entry.name}/`)
      if (files.length >= DIRECTORY_FILE_LIMIT) { truncated = true; return }
    }
  }
  for (const entry of entries) await walk(entry, '')
  return { files, truncated }
}

/**
 * 从上传后的绝对路径提取 .lawyer-uploads 下的顶层目录引用。
 * @param uploadedPath - Host 返回的绝对路径（已转正斜杠），
 *   如 D:/ws/.lawyer-uploads/案卷/证据/合同.pdf。
 * @returns 顶层目录引用（D:/ws/.lawyer-uploads/案卷/）；散文件（无子目录）为 undefined。
 */
function uploadedRootDirectory(uploadedPath: string): string | undefined {
  const marker = '/.lawyer-uploads/'
  const index = uploadedPath.lastIndexOf(marker)
  if (index < 0) return undefined
  const rest = uploadedPath.slice(index + marker.length)
  const firstSlash = rest.indexOf('/')
  if (firstSlash < 0) return undefined
  return `${uploadedPath.slice(0, index + marker.length)}${rest.slice(0, firstSlash)}/`
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
   * 服务写入 <工作区>/.lawyer-uploads/，fileName 可含相对子路径以保留
   * 文件夹结构），返回工作区内的绝对路径。
   * @returns 成功时为绝对路径；失败时为 Error。
   */
  readonly uploadWorkspaceFile: (
    fileName: string,
    contentBase64: string,
    signal: AbortSignal,
  ) => Promise<string | Error>
}

/** 材料合并选择区：搜索 + 粘贴路径 + 拖入/选择文件与文件夹 + 已选清单。 */
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
  const folderInput = useRef<HTMLInputElement>(null)

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

  /** 添加一个 @ 引用路径（规范化 + 去重）。 */
  const addPath = (path: string): void => {
    const normalized = normalizeReferencePath(path)
    if (normalized === '' || normalized === '/') return
    onChange({ ...value, paths: value.paths.includes(normalized) ? value.paths : [...value.paths, normalized] })
  }

  /**
   * 处理一批用户选入/拖入的文件（含文件夹展开出的相对路径）。
   *
   * 内部维护本地累积副本、结束时单次 onChange 提交：异步循环里多次
   * onChange({...value}) 会基于同一渲染快照互相覆盖（拖多个二进制
   * 文件只留最后一个路径的既有缺陷即源于此）。
   */
  const handleFiles = async (list: readonly DroppedFile[], truncated = false): Promise<void> => {
    const paths = [...value.paths]
    const images = [...value.images]
    const texts = [...value.texts]
    const addPathLocal = (raw: string): string | undefined => {
      const normalized = normalizeReferencePath(raw)
      if (normalized === '' || normalized === '/' || paths.includes(normalized)) return undefined
      paths.push(normalized)
      return normalized
    }

    const nextImages: PickedImage[] = []
    const nextTexts: PickedText[] = []
    const skipped: string[] = []
    // Word/PDF 等浏览器读不了的二进制文档：散文件先按文件名查工作区索引
    // （已在工作区内的零拷贝直接引用）；文件夹成员不查索引（同名文件易错
    // 引），直接上传保留目录结构。
    const unresolved: { file: File; relativePath: string; query: string; fullName: string; fromDirectory: boolean }[] = []
    for (const { file, relativePath } of list) {
      const displayName = relativePath !== '' ? relativePath : file.name
      const isImage = file.type !== '' && ACCEPTED_IMAGE_TYPES.has(file.type)
      const isText = file.type === 'text/plain' || /\.(?:txt|md)$/i.test(file.name)
      if (isImage) {
        if (file.size > IMAGE_MAX_BYTES) {
          skipped.push(`${displayName}（超过 ${formatBytes(IMAGE_MAX_BYTES)}）`)
          continue
        }
        if (images.length + nextImages.length >= IMAGE_MAX_COUNT) {
          skipped.push(`${displayName}（超过 ${IMAGE_MAX_COUNT} 张上限）`)
          continue
        }
        const dataURL = await readAsDataURL(file)
        nextImages.push({
          name: displayName,
          mediaType: file.type as ImagePart['mediaType'],
          data: dataURL.slice(dataURL.indexOf(',') + 1),
          bytes: file.size,
        })
      } else if (isText) {
        if (file.size > TEXT_MAX_BYTES) {
          skipped.push(`${displayName}（超过 ${formatBytes(TEXT_MAX_BYTES)}）`)
          continue
        }
        nextTexts.push({ name: displayName, content: await readAsText(file) })
      } else {
        unresolved.push({
          file,
          relativePath,
          query: file.name.replace(/\.[^.]+$/, ''),
          fullName: file.name,
          fromDirectory: relativePath.includes('/'),
        })
      }
    }
    images.push(...nextImages)
    texts.push(...nextTexts)
    if (unresolved.length === 0) {
      if (paths.length !== value.paths.length || images.length !== value.images.length || texts.length !== value.texts.length) {
        onChange({ paths, images, texts })
      }
      const parts: string[] = []
      if (truncated) parts.push(`文件过多，仅取前 ${DIRECTORY_FILE_LIMIT} 个`)
      if (skipped.length > 0) parts.push(`已跳过：${skipped.join('；')}`)
      setNotice(parts.join('。'))
      return
    }

    // 逐个解析：索引唯一命中（basename 与拖入文件全名相等，不区分大小写）
    // 即以 @ 引用零拷贝加入；未命中（或文件夹成员）读内容上传进工作区
    // .lawyer-uploads/——文件夹成员按相对路径落地，保留目录结构。
    setBusy(true)
    const added: string[] = []
    const failed: string[] = []
    const manual: { query: string; fullName: string }[] = []
    const directoryRefs = new Map<string, number>()
    for (const item of unresolved) {
      if (!item.fromDirectory) {
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
          addPathLocal(exact[0].path)
          added.push(`${item.fullName} → ${exact[0].path}`)
          continue
        }
      }
      // 上传兜底：读内容 → Host 写入工作区 → 取回绝对路径。
      // 文件夹成员以相对路径为 fileName（Host 保留目录结构）。
      const uploadName = item.fromDirectory ? item.relativePath : item.fullName
      const uploaded = await readAsDataURL(item.file).then(
        dataURL => uploadWorkspaceFile(
          uploadName,
          dataURL.slice(dataURL.indexOf(',') + 1),
          new AbortController().signal,
        ),
        error => new Error(`读取 ${item.fullName} 失败：${error instanceof Error ? error.message : String(error)}`),
      )
      if (typeof uploaded === 'string') {
        const normalized = uploaded.replace(/\\/g, '/')
        const rootDir = item.fromDirectory ? uploadedRootDirectory(normalized) : undefined
        if (rootDir !== undefined) {
          directoryRefs.set(rootDir, (directoryRefs.get(rootDir) ?? 0) + 1)
        } else {
          addPathLocal(normalized)
          added.push(`${item.fullName} → ${normalized}（已复制进工作区）`)
        }
      } else {
        failed.push(`${item.relativePath !== '' ? item.relativePath : item.fullName}（${uploaded.message}）`)
        manual.push({ query: item.query, fullName: item.fullName })
      }
    }
    setBusy(false)

    for (const [dir, count] of directoryRefs) {
      addPathLocal(dir)
      added.push(`已加入目录 ${dir}（含 ${count} 个文件，已复制进工作区）`)
    }
    onChange({ paths, images, texts })

    const parts: string[] = []
    if (added.length > 0) {
      parts.push(`已加入：${added.join('；')}`)
    }
    if (failed.length > 0) {
      setQuery(manual[0]?.query ?? query)
      parts.push(`上传失败：${failed.join('；')}——可从候选点选，或粘贴完整路径后回车`)
    }
    if (skipped.length > 0) parts.push(`已跳过：${skipped.join('；')}`)
    if (truncated) parts.push(`文件过多，仅取前 ${DIRECTORY_FILE_LIMIT} 个`)
    setNotice(parts.join('。'))
  }

  const onDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault()
    setDragActive(false)
    // entry API 必须在事件回调内同步取用（异步后 items 失效）；
    // 支持 entry 时完全走 entries（拖入的目录在 files 里只是读不了的空条目）。
    const entries = Array.from(event.dataTransfer.items)
      .map(item => (typeof item.webkitGetAsEntry === 'function' ? item.webkitGetAsEntry() : null))
      .filter((entry): entry is FileSystemEntry => entry !== null)
    if (entries.length > 0) {
      void expandEntries(entries).then(expanded => {
        if (expanded.files.length === 0) {
          setNotice('没有可读取的文件（拖入内容不含文件或文件夹）')
          return
        }
        return handleFiles(expanded.files, expanded.truncated)
      })
      return
    }
    const plain = Array.from(event.dataTransfer.files)
      .filter(file => !(file.type === '' && file.size === 0)) // 旧浏览器的目录条目读不了
      .map(file => ({ file, relativePath: file.name }))
    if (plain.length === 0) {
      setNotice('当前浏览器不支持文件夹拖入——请使用"选择文件夹"按钮，或逐个拖入文件')
      return
    }
    void handleFiles(plain)
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
      <label className="lawyer-dialog__label">{label}（搜索工作区 · 粘贴路径 · 拖入文件或整个文件夹）</label>
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
            placeholder="输入文件名搜索，或粘贴完整路径后回车（目录以 / 结尾）"
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
          <button
            type="button"
            className="lawyer-dialog__browse"
            title="选择文件夹（递归收集其中的文件，保留目录结构复制进工作区后整目录引用）"
            onClick={() => folderInput.current?.click()}
            disabled={lockAll}
          >
            选择文件夹
          </button>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept="image/png,image/jpeg,image/webp,image/gif,.txt,.md,.pdf,.doc,.docx"
            style={{ display: 'none' }}
            onChange={event => {
              void handleFiles(Array.from(event.target.files ?? []).map(file => ({ file, relativePath: file.name })))
              event.target.value = ''
            }}
            disabled={lockAll}
          />
          <input
            ref={folderInput}
            type="file"
            multiple
            // @ts-expect-error webkitdirectory 是非标准属性（Chromium/Edge/Safari 支持）
            webkitdirectory=""
            style={{ display: 'none' }}
            onChange={event => {
              void handleFiles(Array.from(event.target.files ?? []).map(file => (
                { file, relativePath: file.webkitRelativePath !== '' ? file.webkitRelativePath : file.name }
              )))
              event.target.value = ''
            }}
            disabled={lockAll}
          />
        </div>
        <ul className="lawyer-dialog__candidates">
          {(searching || busy) && <li className="lawyer-dialog__candidate lawyer-dialog__candidate--hint">搜索中…</li>}
          {!searching && !busy && searchUnavailable && (
            <li className="lawyer-dialog__candidate lawyer-dialog__candidate--hint">
              无法搜索工作区（当前没有活动会话）——可拖入图片/文本/文件夹，或粘贴完整路径后回车
            </li>
          )}
          {!searching && !busy && !searchUnavailable && candidates.length === 0 && (
            <li className="lawyer-dialog__candidate lawyer-dialog__candidate--hint">没有匹配的文件</li>
          )}
          {!searching && !busy && !searchUnavailable && candidates.slice(0, CANDIDATE_LIMIT).map((candidate, index) => {
            if (candidate.kind === 'directory') {
              const dirRef = `${candidate.path}/`
              const selected = value.paths.includes(dirRef)
              return (
                <li key={`dir-${index}`} className="lawyer-dialog__candidate-row">
                  <button
                    type="button"
                    className="lawyer-dialog__candidate lawyer-dialog__candidate--grow"
                    title={`进入 ${candidate.path}`}
                    onClick={() => setQuery(`${candidate.path}/`)}
                    disabled={lockAll}
                  >
                    📁 {basename(candidate.path)}/
                  </button>
                  <button
                    type="button"
                    className="lawyer-dialog__candidate-add"
                    title={`引用整个目录 ${dirRef}`}
                    onClick={() => addPath(dirRef)}
                    disabled={lockAll || selected}
                  >
                    {selected ? '✓ 已引用' : '＋ 引用目录'}
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
                {isDirectoryReference(path) ? '📁' : '📃'} {basename(path.replace(/\/$/u, ''))}{isDirectoryReference(path) ? '/' : ''}
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

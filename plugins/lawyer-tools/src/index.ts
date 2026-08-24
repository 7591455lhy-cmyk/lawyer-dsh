/**
 * 律师工作台 Host 工具插件（M2）：把 config.skillsDir 下的技能（目录包
 * SKILL.md 或扁平 <name>.md，YAML frontmatter + Markdown 正文）注册进
 * ctx.skills 的全局层——每个会话可见；技能自身用 frontmatter 声明
 * disable-model-invocation: true 后不出现在模型目录，仅由用户手势
 * （/name，由侧边栏按钮代发）强制加载。
 *
 * 解析规则与 dsh-skill-filesystem 保持一致（frontmatter 字段名、布尔
 * 取值、必填与命名校验）；差异在于本插件从配置目录（随包分发的技能源）
 * 读取，并用 node:fs 直读——技能源位于宿主文件系统，与 bundled 根同
 * 信任级。
 *
 * 配置说明：刻意不导出 Schemastery Config——本包经 `dsh plugin add` 安装
 * 进 profile 后，运行时 import 只能从 profile 的 node_modules 解析，
 * harness 私有依赖（@deepseek-ai/schemastery）不在其中。行 config 由
 * loader 原样传入 apply 第二参，本插件自行校验。
 *
 * 运行时依赖仅 yaml（npm registry 纯 JS 包）；@deepseek-ai/* 只做类型
 * import（编译后擦除，不产生运行时解析）。
 */
import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import { basename, isAbsolute, join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import type { Context } from '@deepseek-ai/cordis'

/** Cordis 插件名。 */
export const name = 'lawyer-tools'

/** 依赖服务：dsh 技能注册表与 Typert 注册表（宿主层提供）。 */
export const inject = ['skills', 'typert']

/** 随包分发技能的注册 rank（bundled 语义，最低优先级，允许用户目录同名技能覆盖）。 */
const LAWYER_SKILL_RANK = 600

/** 技能名规范（与 dsh-skill 的 isSkillName 一致）：小写 kebab-case。 */
const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** 技能源目录中每个条目的本插件视图。 */
interface DirEntry {
  readonly name: string
  readonly type: 'directory' | 'file'
  readonly path: string
}

/** 技能调用策略（对齐 @deepseek-ai/dsh-skill 的 SkillInvocationPolicy）。 */
interface InvocationPolicy {
  readonly modelInvocable: boolean
  readonly userInvocable: boolean
}

/** 注册表候选：目录发现阶段的产物（对齐 SkillCandidate）。 */
interface Candidate {
  readonly name: string
  readonly description: string
  readonly whenToUse?: string
  readonly invocation: InvocationPolicy
  readonly provider: 'lawyer-tools'
  readonly source: 'bundled'
  readonly rank: number
  readonly locator: { readonly path: string; readonly directory: string }
  readonly resourceBase: { readonly kind: 'directory'; readonly path: string }
  readonly metadata?: Record<string, unknown>
}

/** 完整技能定义：get 装载的产物（对齐 SkillDefinition）。 */
interface Definition {
  readonly name: string
  readonly description: string
  readonly whenToUse?: string
  readonly invocation: InvocationPolicy
  readonly provider: 'lawyer-tools'
  readonly source: 'bundled'
  readonly resourceBase: { readonly kind: 'directory'; readonly path: string }
  readonly path: string
  readonly metadata?: Record<string, unknown>
  readonly content: string
}

/** 技能提供方（对齐 SkillProvider 的运行时契约）。 */
interface Provider {
  readonly name: 'lawyer-tools'
  list(): Promise<readonly Candidate[]>
  get(candidate: Candidate): Promise<Definition | undefined>
}

declare module '@deepseek-ai/cordis' {
  interface Context {
    /** dsh 技能注册表（宿主层服务；此处仅声明本插件用到的成员）。 */
    skills: { registerProvider(factory: (control?: unknown) => Provider): unknown }
    /** Typert 注册表（宿主层服务；仅声明运行时注册贡献这一个成员）。 */
    typert: { register(contribution: unknown): unknown }
  }
}

/** 行 config：技能源目录（含 contract-review/ 等技能包），loader 原样透传。 */
export interface Config {
  skillsDir: string
}

/**
 * 注册律师技能提供方。
 * @param ctx - 宿主插件上下文。
 * @param config - 行 config（无 Schemastery 声明时 loader 原样传入）。
 */
export function apply(ctx: Context, config: Partial<Config> = {}): void {
  registerLawyerFiles(ctx)

  const skillsDir = typeof config.skillsDir === 'string' && config.skillsDir.length > 0
    ? config.skillsDir
    : undefined
  if (skillsDir === undefined) {
    ctx.logger.warn('[lawyer-tools] 缺少 config.skillsDir（技能源目录），律师技能未注册')
    return
  }

  const provider: Provider = {
    name: 'lawyer-tools',
    list: () => listSkills(ctx, skillsDir),
    get: candidate => loadSkill(ctx, candidate),
  }
  ctx.skills.registerProvider(() => provider)
}

/** 扫描技能源目录，产出注册表候选列表。 */
async function listSkills(ctx: Context, skillsDir: string): Promise<readonly Candidate[]> {
  const entries = await readDirEntries(ctx, skillsDir)
  const candidates: Candidate[] = []
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const locator = entry.type === 'directory'
      ? { path: join(entry.path, 'SKILL.md'), directory: entry.path }
      : entry.name.endsWith('.md')
        ? { path: entry.path, directory: skillsDir }
        : undefined
    if (locator === undefined) continue
    const parsed = await parseSkillFile(ctx, locator.path)
    if (parsed === undefined) continue
    candidates.push({
      name: parsed.name,
      description: parsed.description,
      ...parsed.whenToUse === undefined ? {} : { whenToUse: parsed.whenToUse },
      invocation: parsed.invocation,
      provider: 'lawyer-tools',
      source: 'bundled',
      rank: LAWYER_SKILL_RANK,
      locator,
      resourceBase: { kind: 'directory', path: locator.directory },
      ...parsed.metadata === undefined ? {} : { metadata: parsed.metadata },
    })
  }
  return candidates
}

/** 按候选定位重读并解析技能全文。 */
async function loadSkill(ctx: Context, candidate: Candidate): Promise<Definition | undefined> {
  const locator = candidate.locator
  const parsed = await parseSkillFile(ctx, locator.path)
  if (parsed === undefined) return undefined
  return {
    name: parsed.name,
    description: parsed.description,
    ...parsed.whenToUse === undefined ? {} : { whenToUse: parsed.whenToUse },
    invocation: parsed.invocation,
    provider: 'lawyer-tools',
    source: 'bundled',
    resourceBase: { kind: 'directory', path: locator.directory },
    path: locator.path,
    ...parsed.metadata === undefined ? {} : { metadata: parsed.metadata },
    content: parsed.content,
  }
}

/** 读取目录条目（目录/文件；不存在时告警并返回空列表）。 */
async function readDirEntries(ctx: Context, dir: string): Promise<readonly DirEntry[]> {
  let raw
  try {
    raw = await readdir(dir, { withFileTypes: true, encoding: 'utf8' })
  } catch (error) {
    if (isAbsentPathError(error)) {
      ctx.logger.warn(`[lawyer-tools] 技能源目录不存在：${dir}`)
      return []
    }
    throw error
  }
  const entries: DirEntry[] = []
  for (const entry of raw) {
    if (entry.isDirectory()) {
      entries.push({ name: entry.name, type: 'directory', path: join(dir, entry.name) })
    } else if (entry.isFile()) {
      entries.push({ name: entry.name, type: 'file', path: join(dir, entry.name) })
    }
  }
  return entries
}

/** frontmatter 解析结果。 */
interface ParsedSkill {
  readonly name: string
  readonly description: string
  readonly whenToUse?: string
  readonly invocation: InvocationPolicy
  readonly metadata?: Record<string, unknown>
  readonly content: string
}

/** 读取并校验一个技能文件；坏文件告警后跳过（返回 undefined）。 */
async function parseSkillFile(ctx: Context, path: string): Promise<ParsedSkill | undefined> {
  let raw: string
  try {
    raw = await readFile(path, 'utf8')
  } catch (error) {
    if (isAbsentPathError(error)) return undefined
    throw error
  }
  let parsed
  try {
    parsed = parseFrontmatter(raw)
  } catch (error) {
    ctx.logger.warn(`[lawyer-tools] 技能文件 ${path} 忽略：frontmatter YAML 无效：${messageOf(error)}`)
    return undefined
  }
  if (parsed === undefined) {
    ctx.logger.warn(`[lawyer-tools] 技能文件 ${path} 忽略：缺少 YAML frontmatter`)
    return undefined
  }
  const name = stringField(parsed.data, 'name')
  const description = stringField(parsed.data, 'description')
  if (name === undefined || description === undefined) {
    ctx.logger.warn(`[lawyer-tools] 技能文件 ${path} 忽略：frontmatter 需要 name 与 description`)
    return undefined
  }
  if (!SKILL_NAME_PATTERN.test(name)) {
    ctx.logger.warn(`[lawyer-tools] 技能文件 ${path} 忽略：技能名 "${name}" 不合规（应为小写 kebab-case）`)
    return undefined
  }
  let invocation: InvocationPolicy
  try {
    invocation = parseInvocationPolicy(parsed.data)
  } catch (error) {
    ctx.logger.warn(`[lawyer-tools] 技能文件 ${path} 忽略：frontmatter 调用策略无效：${messageOf(error)}`)
    return undefined
  }
  return {
    name,
    description,
    ...optionalString(parsed.data, 'whenToUse'),
    invocation,
    ...optionalMetadata(parsed.data),
    content: parsed.body.trim(),
  }
}

/** 提取首尾 `---` 包围的 YAML frontmatter（规则与 dsh-skill-filesystem 一致）。 */
function parseFrontmatter(raw: string): { data: Record<string, unknown>; body: string } | undefined {
  const firstLineEnd = raw.indexOf('\n')
  if (firstLineEnd < 0) return undefined
  const firstLine = raw.slice(0, firstLineEnd).replace(/\r$/, '')
  if (firstLine !== '---') return undefined
  const start = firstLineEnd + 1
  const closing = findClosingFrontmatter(raw, start)
  if (closing === undefined) return undefined
  const parsed = parseYaml(raw.slice(start, closing.start)) as unknown
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return undefined
  return { data: parsed as Record<string, unknown>, body: raw.slice(closing.bodyStart) }
}

/** 找到 frontmatter 的闭合 `---` 行。 */
function findClosingFrontmatter(raw: string, start: number): { start: number; bodyStart: number } | undefined {
  let lineStart = start
  while (lineStart <= raw.length) {
    const nextNewline = raw.indexOf('\n', lineStart)
    const lineEnd = nextNewline < 0 ? raw.length : nextNewline
    const line = raw.slice(lineStart, lineEnd).replace(/\r$/, '')
    if (line === '---') {
      return { start: lineStart, bodyStart: nextNewline < 0 ? raw.length : nextNewline + 1 }
    }
    if (nextNewline < 0) return undefined
    lineStart = nextNewline + 1
  }
  return undefined
}

/** 解析调用策略：disable-model-invocation / user-invocable（布尔语义与官方一致）。 */
function parseInvocationPolicy(data: Record<string, unknown>): InvocationPolicy {
  rejectLegacyKey(data, 'disableModelInvocation', 'disable-model-invocation')
  rejectLegacyKey(data, 'modelInvocable', 'disable-model-invocation')
  rejectLegacyKey(data, 'userInvocable', 'user-invocable')
  const disableModelInvocation = frontmatterBoolean(data, 'disable-model-invocation')
  const userInvocable = frontmatterBoolean(data, 'user-invocable')
  return {
    modelInvocable: disableModelInvocation !== true,
    userInvocable: userInvocable !== false,
  }
}

/** 拒绝 camelCase 旧键，避免静默失效。 */
function rejectLegacyKey(data: Record<string, unknown>, legacy: string, canonical: string): void {
  if (Object.hasOwn(data, legacy)) {
    throw new Error(`frontmatter 字段 "${legacy}" 不受支持；请使用 "${canonical}"`)
  }
}

/** frontmatter 布尔取值：true/false/1/0/yes/no/on/off（不区分大小写）。 */
function frontmatterBoolean(data: Record<string, unknown>, key: string): boolean | undefined {
  if (!Object.hasOwn(data, key)) return undefined
  const value = data[key]
  if (typeof value === 'boolean') return value
  if (value === 1 || value === '1') return true
  if (value === 0 || value === '0') return false
  if (typeof value === 'string') {
    switch (value.toLowerCase()) {
      case 'true': case 'yes': case 'on': return true
      case 'false': case 'no': case 'off': return false
    }
  }
  throw new TypeError(`frontmatter 字段 "${key}" 应为布尔值`)
}

/** 必填字符串字段（非空才算存在）。 */
function stringField(data: Record<string, unknown>, key: string): string | undefined {
  const value = data[key]
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

/** 可选字符串字段的 spread 形态。 */
function optionalString(data: Record<string, unknown>, key: 'whenToUse'): { whenToUse?: string } {
  const value = stringField(data, key)
  return value === undefined ? {} : { whenToUse: value }
}

/** 可选 metadata 字段的 spread 形态（仅接受普通对象）。 */
function optionalMetadata(data: Record<string, unknown>): { metadata?: Record<string, unknown> } {
  const value = data.metadata
  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    return { metadata: value as Record<string, unknown> }
  }
  return {}
}

/** 目录/文件不存在类错误。 */
function isAbsentPathError(error: unknown): boolean {
  return typeof error === 'object' && error !== null && 'code' in error
    && (error.code === 'ENOENT' || error.code === 'ENOTDIR')
}

/** 错误消息提取。 */
function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

// ── 合同文件上传服务（lawyerFiles）──────────────────────────────────────────
//
// 把浏览器拖入/选择的合同文件内容（base64）写入工作区的 .lawyer-uploads/
// 子目录，返回绝对路径——浏览器沙箱拿不到拖入文件的真实路径，写入工作区
// 后即得到模型可 read 的稳定路径，也不再依赖 Full access。
//
// 实现方式（全部为已查证的公开机制，零 @deepseek-ai 运行时依赖）：
// 1. receiver 是普通对象 + 手搓 typertRemote binding（网关 validateBinding
//    只做形状检查：service/serviceKey/namespace）；
// 2. ctx.reflect.provide() 是 cordis 公开 API（Service 基类同款注册路径），
//    网关经 receiverContext.get(service) 取到它；
// 3. ctx.typert.register() 向 Typert 本地注册表注册 strict InvocationDescriptor
//    （网关 resolveDescriptor 优先查它，绕开 @Remote 装饰器的模块私有
//    WeakMap——那是同 harness 实例才有的标记，本包不适用）；
// 4. 参数与结果 codec 用 src-json（JSON 安全检查即可，不需要 zod schema）。
// Client 侧经 ConnectionHandle.rpc.call('/api', 'lawyerFiles/save', ...) 调用。

/** 上传服务的 Cordis 服务键（同时是 wire namespace）。 */
const LAWYER_FILES_KEY = 'lawyerFiles'

/** 工作区内承载上传文件的子目录名。 */
const UPLOAD_DIR = '.lawyer-uploads'

/** 单个上传文件的大小上限（合同文档足够）。 */
const UPLOAD_MAX_BYTES = 20 * 1024 * 1024

/** save 方法的 invocation descriptor（strict 形状 + src-json codec）。 */
const SAVE_INVOCATION = {
  id: 'lawyer-tools#lawyerFiles/save',
  service: LAWYER_FILES_KEY,
  namespace: LAWYER_FILES_KEY,
  method: 'save',
  invocation: { kind: 'direct' },
  parameters: [
    { name: 'cwd', wire: 'cwd', source: 'json', codec: { mode: 'src-json' } },
    { name: 'fileName', wire: 'fileName', source: 'json', codec: { mode: 'src-json' } },
    { name: 'contentBase64', wire: 'contentBase64', source: 'json', codec: { mode: 'src-json' } },
  ],
  result: { mode: 'src-json' },
}

/**
 * 注册 lawyerFiles 服务：向 Typert 注册表登记 invocation，把 receiver 提供
 * 为 cordis 服务。receiver 与 descriptor 均为普通数据/对象（鸭子类型），
 * 不 import harness 内部包，避免 profile 安装后的模块双实例问题。
 * @param ctx - 宿主插件上下文。
 */
function registerLawyerFiles(ctx: Context): void {
  const receiver = {
    /**
     * 把一份 base64 内容写入 <cwd>/.lawyer-uploads/<fileName>。
     * @param cwd - 工作区目录（client 传当前 workspace 的 path）。
     * @param fileName - 原始文件名（清洗为安全 basename）。
     * @param contentBase64 - 文件内容的 base64。
     * @returns 写入后的绝对路径。
     */
    async save(cwd: unknown, fileName: unknown, contentBase64: unknown): Promise<{ path: string }> {
      if (typeof cwd !== 'string' || cwd.length === 0 || !isAbsolute(cwd)) {
        throw new Error('cwd 必须是绝对路径')
      }
      if (typeof fileName !== 'string' || fileName.length === 0) {
        throw new Error('fileName 不能为空')
      }
      if (typeof contentBase64 !== 'string' || contentBase64.length === 0) {
        throw new Error('contentBase64 不能为空')
      }
      // 文件名清洗：仅取 basename，替换 Windows 保留字符与控制字符。
      const safeName = basename(fileName)
        .replace(/[<>:"/\\|?*\u0000-\u001f]/gu, '_')
        .replace(/^(?:\.+)$/, '_')
        .trim()
      if (safeName === '' || safeName === '.' || safeName === '..') {
        throw new Error('fileName 非法')
      }
      const buffer = Buffer.from(contentBase64, 'base64')
      if (buffer.length === 0) {
        throw new Error('文件内容为空或 base64 无效')
      }
      if (buffer.length > UPLOAD_MAX_BYTES) {
        throw new Error(`文件超过 ${Math.floor(UPLOAD_MAX_BYTES / 1024 / 1024)}MB 上限`)
      }
      const dir = join(cwd, UPLOAD_DIR)
      await mkdir(dir, { recursive: true })
      const path = join(dir, safeName)
      await writeFile(path, buffer)
      return { path }
    },
  }
  // 手搓网关可见的 typertRemote binding（形状对齐 TypertGatewayBinding）。
  ;(receiver as { typertRemote?: unknown }).typertRemote = Object.freeze({
    service: receiver,
    serviceKey: LAWYER_FILES_KEY,
    namespace: LAWYER_FILES_KEY,
  })

  ctx.reflect.provide(LAWYER_FILES_KEY, receiver)
  ctx.typert.register({
    package: 'lawyer-tools',
    face: 'host',
    schemas: [],
    model: { services: [], events: [], objects: [] },
    invocations: [SAVE_INVOCATION],
  })
}

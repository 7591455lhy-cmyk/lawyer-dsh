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
import { homedir } from 'node:os'
import { isAbsolute, join } from 'node:path'
import { parse as parseYaml } from 'yaml'
import type { Context } from '@deepseek-ai/cordis'
import * as mini from './settings-schema.ts'

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
    /**
     * dsh 设置服务（宿主层，dsh-settings-file 提供）。鸭子类型声明：
     * 本包不能 import @deepseek-ai/dsh-settings / schemastery（profile
     * node_modules 解析不到），schema 参数是我们自带的 MiniSchema（契约
     * 见 settings-schema.ts 头注释）。
     */
    settings: {
      register(ns: string, schema: unknown, options?: unknown): unknown
    }
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
  // Typert 以 (package, face) 为注册主键，重复注册直接抛错（"package face
  // "lawyer-tools#host" is already registered"）。因此两个服务各自只提供
  // cordis 服务并返回自己的 invocation descriptors，由这里合并成**一次**
  // 注册——这也是新增服务时唯一需要记住的约束。
  const invocations = [
    ...registerLawyerFiles(ctx),
    ...registerLawyerProfiles(ctx),
    ...registerLawyerSecrets(ctx),
  ]
  ctx.typert.register({
    package: 'lawyer-tools',
    face: 'host',
    schemas: [],
    model: { services: [], events: [], objects: [] },
    invocations,
  })
  registerLawyerSettings(ctx)

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

// ── 工作台入口配置分节（lawyer-workbench settings namespace）───────────────
//
// M4：右侧功能入口的用户配置持久化在官方用户设置文档 $DSH_HOME/
// settings.yaml 的 `lawyer-workbench:` 分节（dsh-settings-file 提供：原子
// 写、跨进程写锁、外部编辑热发布）。本插件只在 Host 侧注册 namespace 与
// schema；浏览器侧（lawyer-sidebar / lawyer-wizard）经官方 ui-settings 的
// ctx.settingsScope.bind({ namespace }) 读快照、set()/unset() 写回，跨端
// 同步走官方 settings/document-updated 转发事件——全程零自造协议。
//
// schema 只约束形状（字符串/布尔/嵌套数组），语义校验（kind 取值、内置
// id 已知、custom 必有 label/skill）由 client 侧规范化兜底：手改 YAML
// 的脏数据最多被过滤或回退默认，绝不炸注册。

/** 设置 namespace（合法名：小写 kebab-case，见 dsh-settings NAMESPACE_PATTERN）。 */
const LAWYER_SETTINGS_NAMESPACE = 'lawyer-workbench'

/**
 * 分节默认值（schema 的 entries default）：三个内置入口全启用。
 * client 侧的回退副本见 lawyer-sidebar / lawyer-wizard 的 src/client/config.ts
 * （插件 bundle 互相独立，此常量无法共享；修改时三处同步）。
 */
const DEFAULT_LAWYER_ENTRIES: readonly { id: string; kind: 'builtin' }[] = [
  { id: 'contract-review', kind: 'builtin' },
  { id: 'case-analysis', kind: 'builtin' },
  { id: 'doc-generation', kind: 'builtin' },
]

/**
 * 注册 lawyer-workbench 设置分节（可选依赖 settings 服务：未挂载时静默，
 * client 侧回退默认三入口）。存量分节非法时官方语义是注册即抛错；此处
 * 捕获降级为告警——namespace 缺席只让配置界面不可用，不应拖垮整个插件。
 * @param ctx - 宿主插件上下文。
 */
function registerLawyerSettings(ctx: Context): void {
  ctx.inject(['settings'], (settingsCtx: Context) => {
    try {
      settingsCtx.settings.register(LAWYER_SETTINGS_NAMESPACE, buildLawyerConfigSchema())
    } catch (error) {
      ctx.logger.warn(
        `[lawyer-tools] 注册 lawyer-workbench 设置分节失败：${messageOf(error)}` +
          '（请检查 $DSH_HOME/settings.yaml 的 lawyer-workbench 段；配置分节暂不可用，' +
          '侧边栏将使用默认入口）',
      )
    }
  })
}

/**
 * 构造分节 schema：{ onboarded?: boolean, entries: Entry[] }。
 * Entry = { id: string（必填）, kind: string（必填）, label?/skill?/hint?/
 * icon?/agentPreset?/template?/description?/purpose?: string,
 * extraSkills?: string[], fields?: Field[], legal?: Legal,
 * mcp?: { preset?, note? } }
 * （M8 自定义功能升级为 dsh-plugin-task-panel 形态：入口 = 一条配置——
 * 卡片展示（label/hint/icon）+ 提示词模板 template（{{字段 id}} 引用）+
 * 表单字段 fields + 目标 preset + 技能手势；涉及法律事项时 legal 段绑定
 * claude-for-legal-ZH 的 adapter / 领域 / 原始技能 / 子代理方案。schema
 * 只约束形状，语义校验在 client 侧 normalizeEntries 兜底。）
 * @returns 迷你 schema 节点（契约见 settings-schema.ts）。
 */
function buildLawyerConfigSchema(): mini.MiniSchema {
  // 表单字段：id/label 必填，type 取值与 options 等语义由 client 侧兜底。
  const field = mini.object({
    id: mini.required(mini.string()),
    label: mini.required(mini.string()),
    type: mini.required(mini.string()),
    options: mini.array(mini.string()),
    default: mini.string(),
    placeholder: mini.string(),
    hint: mini.string(),
    dropHint: mini.string(),
  })
  // 法律事项绑定：domain/adapter 必填，skills 为空时由 adapter 自行路由。
  const legal = mini.object({
    domain: mini.required(mini.string()),
    adapter: mini.required(mini.string()),
    skills: mini.array(mini.string()),
    subagent: mini.string(),
    references: mini.array(mini.string()),
  })
  const entry = mini.object({
    id: mini.required(mini.string()),
    kind: mini.required(mini.string()),
    label: mini.string(),
    skill: mini.string(),
    hint: mini.string(),
    icon: mini.string(),
    agentPreset: mini.string(),
    template: mini.string(),
    description: mini.string(),
    purpose: mini.string(),
    extraSkills: mini.array(mini.string()),
    fields: mini.array(field),
    legal,
    mcp: mini.object({
      preset: mini.string(),
      note: mini.string(),
    }),
  })
  return mini.object({
    onboarded: mini.boolean(),
    entries: mini.defaultValue(mini.array(entry), DEFAULT_LAWYER_ENTRIES),
    // M8：用户主动跳过实务画像引导的领域目录名（commercial-legal 等）。
    // 只记「用户说不用再提醒」这个纯 UI 状态——画像本身是否已配置由
    // lawyerProfile/status 实时查文件判定（画像是模型在会话里写的，
    // 前端无从感知，不能靠这份名单代替状态查询）。
    profileDismissed: mini.array(mini.string()),
    // M8.6：两个纯 UI 的「别再提醒」标记——只表达用户的选择，不代表凭据
    // 本身的状态（元典 Key 是否已配置由 lawyerSecrets/status 实时判定，
    // DeepSeek Key 由 credentials.describe 实时判定）。
    // mcpDismissed：用户选择不再提示元典 MCP 注册引导。
    mcpDismissed: mini.boolean(),
    // apiKeyGuideDone：用户已看过首启的 DeepSeek API Key 获取引导。
    apiKeyGuideDone: mini.boolean(),
  })
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
 * 清洗上传文件名为安全的相对子路径段（lawyerFiles.save 使用）。
 * 按 "/" 切段（兼容反斜杠），先丢弃 ".."、"." 与空段（防路径遍历——
 * 必须在字符替换前做，否则 ".." 会先被替换成 "_" 逃过过滤），再对
 * 段内替换 Windows 保留字符与控制字符；丢弃而非报错——坏段只影响
 * 该段层级，不值得整次上传失败。
 */
export function normalizeUploadSegments(fileName: string): string[] {
  return fileName.replace(/\\/g, '/').split('/')
    .filter(segment => segment !== '' && segment !== '.' && segment !== '..')
    .map(segment => segment
      .replace(/[<>:"/\\|?*\u0000-\u001f]/gu, '_')
      .replace(/^(?:\.+)$/, '_')
      .trim())
    .filter(segment => segment !== '' && segment !== '.' && segment !== '..')
}

/**
 * 注册 lawyerFiles 服务：把 receiver 提供为 cordis 服务，并**返回**它的
 * invocation descriptor（注册由 apply 统一做一次，见那里的注释）。
 * receiver 与 descriptor 均为普通数据/对象（鸭子类型），不 import harness
 * 内部包，避免 profile 安装后的模块双实例问题。
 * @param ctx - 宿主插件上下文。
 * @returns 本服务的 invocation descriptors。
 */
function registerLawyerFiles(ctx: Context): readonly unknown[] {
  const receiver = {
    /**
     * 把一份 base64 内容写入 <cwd>/.lawyer-uploads/<fileName>。
     *
     * fileName 可含相对子路径（"案卷/证据/合同.pdf"，文件夹输入场景）：
     * 经 {@link normalizeUploadSegments} 清洗后保留目录结构（client 侧
     * 据此对整个顶层目录做 @dir/ 引用）；纯文件名行为与旧版一致。
     *
     * @param cwd - 工作区目录（client 传当前 workspace 的 path）。
     * @param fileName - 原始文件名或相对子路径。
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
      const segments = normalizeUploadSegments(fileName)
      if (segments.length === 0) {
        throw new Error('fileName 非法')
      }
      const buffer = Buffer.from(contentBase64, 'base64')
      if (buffer.length === 0) {
        throw new Error('文件内容为空或 base64 无效')
      }
      if (buffer.length > UPLOAD_MAX_BYTES) {
        throw new Error(`文件超过 ${Math.floor(UPLOAD_MAX_BYTES / 1024 / 1024)}MB 上限`)
      }
      const dir = join(cwd, UPLOAD_DIR, ...segments.slice(0, -1))
      await mkdir(dir, { recursive: true })
      const path = join(dir, segments[segments.length - 1])
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
  return [SAVE_INVOCATION]
}

// ── 实务画像服务（lawyerProfile）──────────────────────────────────────────────
//
// M8：claude-for-legal-ZH 的实务画像（practice profile）。该仓库里每个领域
// 的技能「在做任何事前都先读取画像」，画像是一份由 cold-start-interview
// 访谈生成的 Markdown，落盘为 <领域>/CLAUDE.md。
//
// 为什么必须走 Host：
//   1. Client 插件不能读文件系统（项目铁律）——画像是否存在、内容是什么，
//      只能由 Host 回答；
//   2. L2 访谈是模型在会话里写的画像，前端完全不知情，所以「是否已配置」
//      必须每次实时查文件，不能靠前端持久化标记；
//   3. 打包版的 DSH_HOME 是 userData\dsh-home，而 adapter 与领域 CLAUDE.md
//      原文写死 ~/.claude/plugins/config/...、adapter 把它映射到
//      ~/.dsh/legal-zh/<domain>/CLAUDE.md。两条路径不一致，故由 Host 统一
//      canonical 路径并把绝对路径直接交给指令，模型无需自行拼接。
//
// canonical 路径 = <dshHome>/legal-zh/<domain>/CLAUDE.md。dev 环境下 dshHome
// 即 ~/.dsh，与 adapter 原文天然一致；打包环境下由指令显式给出绝对路径，
// 不再依赖 ~/.dsh 存在，也不向用户 home 目录越界写文件。

/** 画像服务的 Cordis 服务键（同时是 wire namespace）。 */
const LAWYER_PROFILE_KEY = 'lawyerProfile'

/** 领域目录名规范（与仓库目录名一致；同时天然拒绝路径遍历）。 */
const DOMAIN_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/** 视为「画像未填充」的占位符标记。 */
const PLACEHOLDER_PATTERN = /\[PLACEHOLDER\]/g

/** 四个方法的 invocation descriptors（strict 形状 + src-json codec）。 */
const PROFILE_INVOCATIONS = [
  invocation('status', ['domain']),
  invocation('read', ['domain']),
  invocation('write', ['domain', 'content']),
  invocation('template', ['domain']),
]

/**
 * 构造一个 Host 服务的 invocation descriptor。
 * @param method - 方法名（wire 上的 endpoint 后缀）。
 * @param parameters - 参数名列表（wire 名与参数名同值）。
 * @param service - 服务键（缺省 lawyerProfile；wire namespace 与之一致）。
 */
function invocation(
  method: string,
  parameters: readonly string[],
  service: string = LAWYER_PROFILE_KEY,
): Record<string, unknown> {
  return {
    id: `lawyer-tools#${service}/${method}`,
    service,
    namespace: service,
    method,
    invocation: { kind: 'direct' },
    parameters: parameters.map(name => ({
      name,
      wire: name,
      source: 'json',
      codec: { mode: 'src-json' },
    })),
    result: { mode: 'src-json' },
  }
}

/**
 * dsh 用户目录：与 dsh-settings-file 的 resolveDshHome 同语义
 * （$DSH_HOME，未设置时 ~/.dsh）。本包不能 import @deepseek-ai/dsh-home-paths
 * （profile node_modules 解析不到 harness 私有包），故本地实现同款回退。
 * @returns dsh 用户目录绝对路径。
 */
function resolveDshHome(): string {
  const fromEnv = process.env.DSH_HOME
  if (typeof fromEnv === 'string' && fromEnv.trim() !== '') return fromEnv.trim()
  return join(homedir(), '.dsh')
}

/**
 * 画像文件的 canonical 绝对路径。
 * @param domain - 领域目录名（kebab-case，非法时抛错）。
 * @returns 画像文件绝对路径。
 */
function profilePathFor(domain: string): string {
  if (typeof domain !== 'string' || !DOMAIN_NAME_PATTERN.test(domain)) {
    throw new Error(`领域目录名非法：${String(domain)}（应为小写 kebab-case，如 commercial-legal）`)
  }
  return join(resolveDshHome(), 'legal-zh', domain, 'CLAUDE.md')
}

/** 读取画像正文；不存在时返回 undefined（ENOENT 与其他错误区分开）。 */
async function readProfileFile(path: string): Promise<string | undefined> {
  try {
    return await readFile(path, 'utf8')
  } catch (error) {
    if (isAbsentPathError(error)) return undefined
    throw error
  }
}

/**
 * 注册 lawyerProfile 服务：把 receiver 提供为 cordis 服务，并**返回**它的
 * invocation descriptors（与 lawyerFiles 同一套已验证范式）。
 * @param ctx - 宿主插件上下文。
 * @returns 本服务的 invocation descriptors。
 */
function registerLawyerProfiles(ctx: Context): readonly unknown[] {
  const receiver = {
    /**
     * 画像状态：路径 + 是否存在 + 是否已填充（无 [PLACEHOLDER]）+ 剩余占位符数。
     *
     * 每次打开面板或功能表单时调用（非热路径）。实时查文件而非查前端标记——
     * L2 访谈的画像是模型写的，前端无从感知。
     * @param domain - 领域目录名。
     */
    async status(domain: unknown): Promise<{
      path: string
      exists: boolean
      configured: boolean
      placeholderCount: number
    }> {
      const path = profilePathFor(String(domain))
      const content = await readProfileFile(path)
      if (content === undefined) {
        return { path, exists: false, configured: false, placeholderCount: 0 }
      }
      const placeholderCount = content.match(PLACEHOLDER_PATTERN)?.length ?? 0
      return {
        path,
        exists: true,
        configured: placeholderCount === 0,
        placeholderCount,
      }
    },

    /**
     * 读取画像正文；不存在时返回 exists:false 而非报错（首次打开面板是常态）。
     * @param domain - 领域目录名。
     */
    async read(domain: unknown): Promise<{ path: string; exists: boolean; content: string }> {
      const path = profilePathFor(String(domain))
      const content = await readProfileFile(path)
      return { path, exists: content !== undefined, content: content ?? '' }
    },

    /**
     * 写入画像正文（mkdir -p 后落盘）。
     *
     * 同时供 L1 表单、L3 直编保存使用；模型也可直接用文件写入工具写同一
     * 路径（L2 访谈），两条写入路径指向同一个 canonical 文件。
     * @param domain - 领域目录名。
     * @param content - 画像 Markdown 全文。
     */
    async write(domain: unknown, content: unknown): Promise<{ path: string }> {
      if (typeof content !== 'string') {
        throw new Error('content 必须是字符串')
      }
      const path = profilePathFor(String(domain))
      await mkdir(join(path, '..'), { recursive: true })
      await writeFile(path, content, 'utf8')
      return { path }
    },

    /**
     * 读取仓库内的领域画像模板（<repo>/<domain>/CLAUDE.md），供 L1 初始化
     * 与「留空按通用配置」回填。repo 根由安装脚本 / deployLegalZh 写入
     * <dshHome>/legal-zh/repo。
     * @param domain - 领域目录名。
     */
    async template(domain: unknown): Promise<{ path: string; content: string }> {
      if (typeof domain !== 'string' || !DOMAIN_NAME_PATTERN.test(domain)) {
        throw new Error(`领域目录名非法：${String(domain)}`)
      }
      const repoPointer = join(resolveDshHome(), 'legal-zh', 'repo')
      const repoRoot = (await readProfileFile(repoPointer))?.trim()
      if (repoRoot === undefined || repoRoot === '') {
        throw new Error(
          `未找到 claude-for-legal-ZH 仓库登记文件：${repoPointer}——请先运行 ` +
            'lawyer-dsh/scripts/install-legal-zh.ps1 安装适配层',
        )
      }
      const path = join(repoRoot, domain, 'CLAUDE.md')
      const content = await readProfileFile(path)
      if (content === undefined) {
        throw new Error(`仓库内无该领域的画像模板：${path}`)
      }
      return { path, content }
    },
  }
  ;(receiver as { typertRemote?: unknown }).typertRemote = Object.freeze({
    service: receiver,
    serviceKey: LAWYER_PROFILE_KEY,
    namespace: LAWYER_PROFILE_KEY,
  })

  ctx.reflect.provide(LAWYER_PROFILE_KEY, receiver)
  return PROFILE_INVOCATIONS
}

// ── 凭据服务（lawyerSecrets）───────────────────────────────────────────────
//
// M8.6：元典开放平台 MCP（mcp__law__* 法规 / mcp__case__* 案例）的 API Key
// 管理。三件事必须落在 Host：
//
// 1. 谁也读不到环境变量：Key 从 process.env.YUANDIAN_API_KEY 取，Client 插件
//    跑在浏览器沙箱里，既读不到 env 也读不到文件系统；
// 2. 写入要能立刻生效：lawyer preset 的 agent.cordis.yml 用
//    `!!js` 读 process.env——该表达式在**每次会话挂载 preset 时**求值
//    （preset 经 Include 按会话重新解析，见 dsh-agent-presets 的 mountPreset），
//    所以保存后直接改本进程的 process.env，下一次发起任务即带上新 Key，
//    无需重启应用；
// 3. 跨重启要留得住：env 之外再落一份 <dshHome>/lawyer-secrets.json，
//    启动时若 env 为空就用它回填 process.env（source 记为 'file'）。
//
// 安全边界：只认一个环境变量名（白名单），不做通用 env 读写；Key 只在
// 进程内与本地文件里流转，status 只回 masked 形态。

/** 凭据服务的 Cordis 服务键（同时是 wire namespace）。 */
const LAWYER_SECRETS_KEY = 'lawyerSecrets'

/** 元典开放平台 MCP 读取的环境变量名（白名单，唯一可写的凭据）。 */
const YUANDIAN_ENV_KEY = 'YUANDIAN_API_KEY'

/** 元典法规检索 MCP 端点（verify 用它做一次真实握手）。 */
const YUANDIAN_MCP_LAW_URL = 'https://open.chineselaw.com/mcp/law/stream'

/** 凭据落盘文件（<dshHome>/lawyer-secrets.json）。 */
const SECRETS_FILE_NAME = 'lawyer-secrets.json'

/** verify 的网络超时（毫秒）——引导流程不该被慢网络卡住。 */
const VERIFY_TIMEOUT_MS = 8000

/** Key 形态：可见 ASCII 非空串（拒绝空白与控制字符；长度给足余量）。 */
const API_KEY_PATTERN = /^[\x21-\x7e]{4,512}$/

/**
 * 校验结论的能力边界（必须跟着成功消息一起交给用户）。
 *
 * 元典的 MCP 端点在握手阶段不校验 Key 归属，所以「连得上」不等于
 * 「Key 有效」；真正的判定发生在会话里的工具调用上。
 */
const VERIFY_CAVEAT = '；注：平台握手阶段不校验 Key 归属，以会话内实际检索为准'

/** 四个方法的 invocation descriptors。 */
const SECRET_INVOCATIONS = [
  invocation('status', [], LAWYER_SECRETS_KEY),
  invocation('save', ['apiKey'], LAWYER_SECRETS_KEY),
  invocation('clear', [], LAWYER_SECRETS_KEY),
  invocation('verify', [], LAWYER_SECRETS_KEY),
]

/** verify 结果码（Client 按它决定提示文案）。 */
type VerifyCode = 'reachable' | 'unauthorized' | 'server-error' | 'timeout' | 'unreachable' | 'missing'

/** verify 结果。 */
interface VerifyResult {
  readonly ok: boolean
  readonly code: VerifyCode
  readonly message: string
}

/** 凭据状态（Client 只能看到 masked，拿不到明文）。 */
interface SecretStatus {
  readonly env: string
  readonly configured: boolean
  readonly source: 'env' | 'file' | 'none'
  readonly masked?: string
  readonly path: string
}

/** 凭据落盘文件绝对路径。 */
function secretsPath(): string {
  return join(resolveDshHome(), SECRETS_FILE_NAME)
}

/** 读取落盘凭据；文件缺失/损坏时返回空对象（损坏只告警，不拖垮服务）。 */
async function readSecretsFile(ctx: Context): Promise<Record<string, string>> {
  let raw: string
  try {
    raw = await readFile(secretsPath(), 'utf8')
  } catch (error) {
    if (isAbsentPathError(error)) return {}
    throw error
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    ctx.logger.warn(`[lawyer-tools] ${secretsPath()} 不是合法 JSON，按空凭据处理`)
    return {}
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return {}
  const result: Record<string, string> = {}
  for (const [key, value] of Object.entries(parsed as Record<string, unknown>)) {
    if (typeof value === 'string' && value !== '') result[key] = value
  }
  return result
}

/** 写回落盘凭据（0600：同机其他账户不可读）。 */
async function writeSecretsFile(data: Record<string, string>): Promise<void> {
  await writeFile(secretsPath(), `${JSON.stringify(data, null, 2)}\n`, { mode: 0o600, encoding: 'utf8' })
}

/** Key 的展示形态：只留首尾各 4 位，中间打码。 */
function maskKey(key: string): string {
  return key.length <= 10 ? '****' : `${key.slice(0, 4)}****${key.slice(-4)}`
}

/**
 * 读响应体的第一块就收手（SSE 会挂起，读到底会一直占着连接）。
 * 读不到正文时返回空串——HTTP 状态码本身仍可用于分类。
 * @param response - fetch 的响应。
 * @returns 响应体开头的一小段文本。
 */
async function readHeadChunk(response: Response): Promise<string> {
  const reader = response.body?.getReader()
  if (reader === undefined) return ''
  try {
    const { value } = await reader.read()
    await reader.cancel()
    return new TextDecoder().decode(value ?? new Uint8Array())
  } catch {
    return ''
  }
}

/**
 * 从响应体开头识别「鉴权被拒」。
 *
 * 端点既可能在 401 上带 OAuth 错误体，也可能用 200 包一个错误体，所以
 * 状态码之外还要看一次正文：JSON 有 error 字段即为被拒，非 JSON（SSE）
 * 则退化为关键字匹配。
 * @param head - 响应体开头的一小段文本。
 * @returns 被拒原因；未识别到时为 undefined。
 */
export function rejectionOf(head: string): string | undefined {
  if (head === '') return undefined
  try {
    const parsed = JSON.parse(head) as { error?: unknown; error_description?: unknown }
    if (typeof parsed.error === 'string' && parsed.error !== '') {
      return typeof parsed.error_description === 'string' && parsed.error_description !== ''
        ? parsed.error_description
        : parsed.error
    }
    return undefined
  } catch {
    const matched = /unauthorized|invalid[_-]?token|invalid[_-]?api[_-]?key|未授权|鉴权失败/iu.exec(head)
    return matched?.[0]
  }
}

/**
 * 注册 lawyerSecrets 服务：把 receiver 提供为 cordis 服务，并**返回**它的
 * invocation descriptors（与 lawyerFiles / lawyerProfile 同一套已验证范式）。
 * @param ctx - 宿主插件上下文。
 * @returns 本服务的 invocation descriptors。
 */
function registerLawyerSecrets(ctx: Context): readonly unknown[] {
  /** 本进程是否已完成「文件 → env」回填（区分 source 用）。 */
  let hydratedFromFile = false
  /** 回填是否做过（幂等，status/save 都会先调用）。 */
  let hydration: Promise<void> | undefined

  /**
   * env 为空时用落盘文件回填 process.env。
   *
   * 幂等且只做一次——用户在系统里设置的环境变量优先级更高，不该被文件
   * 覆盖；文件读失败只告警，env 缺失的后果由调用方（技能降级指引）承担。
   */
  const hydrate = (): Promise<void> => {
    hydration ??= (async () => {
      const fromEnv = process.env[YUANDIAN_ENV_KEY]
      if (typeof fromEnv === 'string' && fromEnv.trim() !== '') return
      try {
        const stored = (await readSecretsFile(ctx))[YUANDIAN_ENV_KEY]
        if (stored === undefined) return
        process.env[YUANDIAN_ENV_KEY] = stored
        hydratedFromFile = true
      } catch (error) {
        ctx.logger.warn(`[lawyer-tools] 读取 ${SECRETS_FILE_NAME} 失败：${messageOf(error)}`)
      }
    })()
    return hydration
  }
  // 启动即回填：preset 的 !!js 在会话挂载时求值，越早注入越稳。
  void hydrate()

  /** 当前生效的 Key（env 优先，其次落盘文件）。 */
  const currentKey = async (): Promise<string | undefined> => {
    await hydrate()
    const fromEnv = process.env[YUANDIAN_ENV_KEY]
    if (typeof fromEnv === 'string' && fromEnv.trim() !== '') return fromEnv.trim()
    return (await readSecretsFile(ctx))[YUANDIAN_ENV_KEY]
  }

  /**
   * 与元典 MCP 端点做一次真实握手，据此判断 Key 是否「明显不对」。
   *
   * 实测（2026-09）该端点的行为：Authorization 为空 → 401 +
   * `{"error":"unauthorized"}`；**任意非空 Key** → 200 且返回正常的
   * initialize 结果——平台在 MCP 握手阶段不校验 Key 归属。因此本校验的
   * 能力边界要说清楚：它只能证伪「Key 空了 / 被明确拒绝」，不能证明
   * 「Key 一定有效」。返回文案里显式带上这个边界，避免界面把「连得上」
   * 说成「Key 没问题」。
   *
   * 只读响应体的第一块就取消：streamable-http 可能挂起 SSE 流，读到底
   * 会一直占着连接、还会在超时后把成功误报成失败。
   */
  const probe = async (key: string): Promise<VerifyResult> => {
    const controller = new AbortController()
    const timer = setTimeout(() => { controller.abort() }, VERIFY_TIMEOUT_MS)
    try {
      const response = await fetch(YUANDIAN_MCP_LAW_URL, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          accept: 'application/json, text/event-stream',
          authorization: `Bearer ${key}`,
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'initialize',
          params: {
            protocolVersion: '2025-03-26',
            capabilities: {},
            clientInfo: { name: 'lawyer-dsh', version: '1.0.0' },
          },
        }),
        signal: controller.signal,
      })
      const head = await readHeadChunk(response)
      if (response.status === 401 || response.status === 403) {
        return { ok: false, code: 'unauthorized', message: `元典平台拒绝了该 Key（HTTP ${response.status}）` }
      }
      // 有的网关用 200 包一个 OAuth 错误体，状态码看不出来，只能看正文。
      const rejected = rejectionOf(head)
      if (rejected !== undefined) {
        return { ok: false, code: 'unauthorized', message: `元典平台拒绝了该 Key：${rejected}` }
      }
      if (response.status >= 500) {
        return { ok: false, code: 'server-error', message: `元典平台暂时不可用（HTTP ${response.status}）` }
      }
      return {
        ok: true,
        code: 'reachable',
        message: `已连通元典法规检索（HTTP ${response.status}），连接可用${VERIFY_CAVEAT}`,
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { ok: false, code: 'timeout', message: `连接元典平台超时（${VERIFY_TIMEOUT_MS / 1000} 秒）` }
      }
      return { ok: false, code: 'unreachable', message: `无法连接元典平台：${messageOf(error)}` }
    } finally {
      clearTimeout(timer)
    }
  }

  const receiver = {
    /**
     * 元典 Key 的实时状态（每次打开功能入口时调用）。
     *
     * 只回 masked——Client 是浏览器插件，明文一旦过线就等于进了页面内存。
     */
    async status(): Promise<SecretStatus> {
      await hydrate()
      const fromEnv = process.env[YUANDIAN_ENV_KEY]
      const path = secretsPath()
      if (typeof fromEnv === 'string' && fromEnv.trim() !== '') {
        return {
          env: YUANDIAN_ENV_KEY,
          configured: true,
          source: hydratedFromFile ? 'file' : 'env',
          masked: maskKey(fromEnv.trim()),
          path,
        }
      }
      const stored = (await readSecretsFile(ctx))[YUANDIAN_ENV_KEY]
      if (stored !== undefined) {
        return { env: YUANDIAN_ENV_KEY, configured: true, source: 'file', masked: maskKey(stored), path }
      }
      return { env: YUANDIAN_ENV_KEY, configured: false, source: 'none', path }
    },

    /**
     * 保存 Key：落盘 + 注入本进程 env + 立即校验一次。
     *
     * 顺序是刻意的：先持久化再校验，这样即使校验因网络失败，Key 也已经
     * 存下来了（下次启动仍生效），界面按 verify 结果提示重试即可。
     * @param apiKey - 用户粘贴的 Key。
     */
    async save(apiKey: unknown): Promise<{ path: string } & VerifyResult> {
      if (typeof apiKey !== 'string') throw new Error('apiKey 必须是字符串')
      // 宽容清洗：从网页复制 Key 时极易带入折行、空格、零宽字符或 BOM，
      // 这些「脏」字符不该把正确的 Key 判成非法。去掉所有空白与零宽字符后再校验。
      const key = apiKey.replace(/[\s\u200b-\u200d\ufeff]+/g, '')
      if (!API_KEY_PATTERN.test(key)) {
        throw new Error('Key 形态不合法：应只含英文字母、数字与常见符号（已自动去除空白）')
      }
      const path = secretsPath()
      let stored: Record<string, string> = {}
      try {
        stored = await readSecretsFile(ctx)
      } catch (error) {
        ctx.logger.warn(`[lawyer-tools] 读取 ${SECRETS_FILE_NAME} 失败，将整体覆盖：${messageOf(error)}`)
      }
      await writeSecretsFile({ ...stored, [YUANDIAN_ENV_KEY]: key })
      process.env[YUANDIAN_ENV_KEY] = key
      hydratedFromFile = true
      const verify = await probe(key)
      return { path, ...verify }
    },

    /**
     * 清除 Key：从落盘文件与本进程 env 中一并移除（用户换号或不再使用
     * 法规检索时用；技能会按降级指引继续）。
     */
    async clear(): Promise<{ path: string }> {
      const path = secretsPath()
      let stored: Record<string, string> = {}
      try {
        stored = await readSecretsFile(ctx)
      } catch { /* 文件损坏时直接整体覆盖 */ }
      delete stored[YUANDIAN_ENV_KEY]
      await writeSecretsFile(stored)
      delete process.env[YUANDIAN_ENV_KEY]
      hydratedFromFile = false
      return { path }
    },

    /**
     * 用当前生效的 Key 重新校验一次（界面上的「重新验证」按钮用它）。
     * 未配置时返回 code:'missing'，不发起网络请求。
     */
    async verify(): Promise<VerifyResult> {
      const key = await currentKey()
      if (key === undefined) {
        return { ok: false, code: 'missing', message: '尚未配置元典 API Key' }
      }
      return probe(key)
    },
  }
  ;(receiver as { typertRemote?: unknown }).typertRemote = Object.freeze({
    service: receiver,
    serviceKey: LAWYER_SECRETS_KEY,
    namespace: LAWYER_SECRETS_KEY,
  })

  ctx.reflect.provide(LAWYER_SECRETS_KEY, receiver)
  return SECRET_INVOCATIONS
}

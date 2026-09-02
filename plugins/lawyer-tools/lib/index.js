// plugins/lawyer-tools/src/index.ts
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { isAbsolute, join } from "node:path";
import { parse as parseYaml } from "yaml";

// plugins/lawyer-tools/src/settings-schema.ts
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function describe(value) {
  return typeof value === "string" ? JSON.stringify(value) : String(value);
}
function resolve(data, schema, path) {
  if (data === void 0 || data === null) {
    if (schema.meta.required === true) {
      throw new Error(`${path} missing required value`);
    }
    if (schema.meta.default === void 0) {
      return data;
    }
    data = structuredClone(schema.meta.default);
  }
  switch (schema.type) {
    case "object": {
      if (!isPlainObject(data)) {
        throw new Error(`${path} expected object but got ${describe(data)}`);
      }
      const dict = schema.dict ?? {};
      const result = {};
      for (const [key, child] of Object.entries(dict)) {
        const value = resolve(
          data[key],
          child,
          path === "$" ? `$.${key}` : `${path}.${key}`
        );
        if (value !== void 0 && value !== null || key in data) {
          result[key] = value;
        }
      }
      for (const [key, value] of Object.entries(data)) {
        if (!(key in dict)) result[key] = value;
      }
      return result;
    }
    case "array": {
      if (!Array.isArray(data)) {
        throw new Error(`${path} expected array but got ${describe(data)}`);
      }
      const inner = schema.inner;
      if (inner === void 0) return [...data];
      return data.map((item, index) => resolve(item, inner, `${path}[${index}]`));
    }
    case "string": {
      if (typeof data !== "string") {
        throw new Error(`${path} expected string but got ${describe(data)}`);
      }
      return data;
    }
    case "boolean": {
      if (typeof data !== "boolean") {
        throw new Error(`${path} expected boolean but got ${describe(data)}`);
      }
      return data;
    }
  }
}
function serialize(root) {
  const refs = {};
  let nextUid = 1;
  const visit = (node) => {
    const uid2 = nextUid++;
    const plain = { type: node.type, meta: node.meta };
    if (node.dict !== void 0) {
      plain.dict = Object.fromEntries(
        Object.entries(node.dict).map(([key, child]) => [key, visit(child)])
      );
    }
    if (node.inner !== void 0) {
      plain.inner = visit(node.inner);
    }
    refs[uid2] = plain;
    return uid2;
  };
  const uid = visit(root);
  return { uid, refs };
}
function create(draft) {
  const node = draft;
  const callable = (data) => resolve(data, node, "$");
  Object.assign(callable, node);
  callable.toJSON = () => serialize(callable);
  return callable;
}
function object(dict) {
  return create({ type: "object", meta: { default: {} }, dict });
}
function array(inner) {
  return create({ type: "array", meta: { default: [] }, inner });
}
function string() {
  return create({ type: "string", meta: {} });
}
function boolean() {
  return create({ type: "boolean", meta: {} });
}
function required(node) {
  ;
  node.meta.required = true;
  return node;
}
function defaultValue(node, value) {
  ;
  node.meta.default = value;
  return node;
}

// plugins/lawyer-tools/src/index.ts
var name = "lawyer-tools";
var inject = ["skills", "typert"];
var LAWYER_SKILL_RANK = 600;
var SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function apply(ctx, config = {}) {
  const invocations = [
    ...registerLawyerFiles(ctx),
    ...registerLawyerProfiles(ctx),
    ...registerLawyerSecrets(ctx)
  ];
  ctx.typert.register({
    package: "lawyer-tools",
    face: "host",
    schemas: [],
    model: { services: [], events: [], objects: [] },
    invocations
  });
  registerLawyerSettings(ctx);
  const skillsDir = typeof config.skillsDir === "string" && config.skillsDir.length > 0 ? config.skillsDir : void 0;
  if (skillsDir === void 0) {
    ctx.logger.warn("[lawyer-tools] \u7F3A\u5C11 config.skillsDir\uFF08\u6280\u80FD\u6E90\u76EE\u5F55\uFF09\uFF0C\u5F8B\u5E08\u6280\u80FD\u672A\u6CE8\u518C");
    return;
  }
  const provider = {
    name: "lawyer-tools",
    list: () => listSkills(ctx, skillsDir),
    get: (candidate) => loadSkill(ctx, candidate)
  };
  ctx.skills.registerProvider(() => provider);
}
async function listSkills(ctx, skillsDir) {
  const entries = await readDirEntries(ctx, skillsDir);
  const candidates = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const locator = entry.type === "directory" ? { path: join(entry.path, "SKILL.md"), directory: entry.path } : entry.name.endsWith(".md") ? { path: entry.path, directory: skillsDir } : void 0;
    if (locator === void 0) continue;
    const parsed = await parseSkillFile(ctx, locator.path);
    if (parsed === void 0) continue;
    candidates.push({
      name: parsed.name,
      description: parsed.description,
      ...parsed.whenToUse === void 0 ? {} : { whenToUse: parsed.whenToUse },
      invocation: parsed.invocation,
      provider: "lawyer-tools",
      source: "bundled",
      rank: LAWYER_SKILL_RANK,
      locator,
      resourceBase: { kind: "directory", path: locator.directory },
      ...parsed.metadata === void 0 ? {} : { metadata: parsed.metadata }
    });
  }
  return candidates;
}
async function loadSkill(ctx, candidate) {
  const locator = candidate.locator;
  const parsed = await parseSkillFile(ctx, locator.path);
  if (parsed === void 0) return void 0;
  return {
    name: parsed.name,
    description: parsed.description,
    ...parsed.whenToUse === void 0 ? {} : { whenToUse: parsed.whenToUse },
    invocation: parsed.invocation,
    provider: "lawyer-tools",
    source: "bundled",
    resourceBase: { kind: "directory", path: locator.directory },
    path: locator.path,
    ...parsed.metadata === void 0 ? {} : { metadata: parsed.metadata },
    content: parsed.content
  };
}
async function readDirEntries(ctx, dir) {
  let raw;
  try {
    raw = await readdir(dir, { withFileTypes: true, encoding: "utf8" });
  } catch (error) {
    if (isAbsentPathError(error)) {
      ctx.logger.warn(`[lawyer-tools] \u6280\u80FD\u6E90\u76EE\u5F55\u4E0D\u5B58\u5728\uFF1A${dir}`);
      return [];
    }
    throw error;
  }
  const entries = [];
  for (const entry of raw) {
    if (entry.isDirectory()) {
      entries.push({ name: entry.name, type: "directory", path: join(dir, entry.name) });
    } else if (entry.isFile()) {
      entries.push({ name: entry.name, type: "file", path: join(dir, entry.name) });
    }
  }
  return entries;
}
async function parseSkillFile(ctx, path) {
  let raw;
  try {
    raw = await readFile(path, "utf8");
  } catch (error) {
    if (isAbsentPathError(error)) return void 0;
    throw error;
  }
  let parsed;
  try {
    parsed = parseFrontmatter(raw);
  } catch (error) {
    ctx.logger.warn(`[lawyer-tools] \u6280\u80FD\u6587\u4EF6 ${path} \u5FFD\u7565\uFF1Afrontmatter YAML \u65E0\u6548\uFF1A${messageOf(error)}`);
    return void 0;
  }
  if (parsed === void 0) {
    ctx.logger.warn(`[lawyer-tools] \u6280\u80FD\u6587\u4EF6 ${path} \u5FFD\u7565\uFF1A\u7F3A\u5C11 YAML frontmatter`);
    return void 0;
  }
  const name2 = stringField(parsed.data, "name");
  const description = stringField(parsed.data, "description");
  if (name2 === void 0 || description === void 0) {
    ctx.logger.warn(`[lawyer-tools] \u6280\u80FD\u6587\u4EF6 ${path} \u5FFD\u7565\uFF1Afrontmatter \u9700\u8981 name \u4E0E description`);
    return void 0;
  }
  if (!SKILL_NAME_PATTERN.test(name2)) {
    ctx.logger.warn(`[lawyer-tools] \u6280\u80FD\u6587\u4EF6 ${path} \u5FFD\u7565\uFF1A\u6280\u80FD\u540D "${name2}" \u4E0D\u5408\u89C4\uFF08\u5E94\u4E3A\u5C0F\u5199 kebab-case\uFF09`);
    return void 0;
  }
  let invocation2;
  try {
    invocation2 = parseInvocationPolicy(parsed.data);
  } catch (error) {
    ctx.logger.warn(`[lawyer-tools] \u6280\u80FD\u6587\u4EF6 ${path} \u5FFD\u7565\uFF1Afrontmatter \u8C03\u7528\u7B56\u7565\u65E0\u6548\uFF1A${messageOf(error)}`);
    return void 0;
  }
  return {
    name: name2,
    description,
    ...optionalString(parsed.data, "whenToUse"),
    invocation: invocation2,
    ...optionalMetadata(parsed.data),
    content: parsed.body.trim()
  };
}
function parseFrontmatter(raw) {
  const firstLineEnd = raw.indexOf("\n");
  if (firstLineEnd < 0) return void 0;
  const firstLine = raw.slice(0, firstLineEnd).replace(/\r$/, "");
  if (firstLine !== "---") return void 0;
  const start = firstLineEnd + 1;
  const closing = findClosingFrontmatter(raw, start);
  if (closing === void 0) return void 0;
  const parsed = parseYaml(raw.slice(start, closing.start));
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return void 0;
  return { data: parsed, body: raw.slice(closing.bodyStart) };
}
function findClosingFrontmatter(raw, start) {
  let lineStart = start;
  while (lineStart <= raw.length) {
    const nextNewline = raw.indexOf("\n", lineStart);
    const lineEnd = nextNewline < 0 ? raw.length : nextNewline;
    const line = raw.slice(lineStart, lineEnd).replace(/\r$/, "");
    if (line === "---") {
      return { start: lineStart, bodyStart: nextNewline < 0 ? raw.length : nextNewline + 1 };
    }
    if (nextNewline < 0) return void 0;
    lineStart = nextNewline + 1;
  }
  return void 0;
}
function parseInvocationPolicy(data) {
  rejectLegacyKey(data, "disableModelInvocation", "disable-model-invocation");
  rejectLegacyKey(data, "modelInvocable", "disable-model-invocation");
  rejectLegacyKey(data, "userInvocable", "user-invocable");
  const disableModelInvocation = frontmatterBoolean(data, "disable-model-invocation");
  const userInvocable = frontmatterBoolean(data, "user-invocable");
  return {
    modelInvocable: disableModelInvocation !== true,
    userInvocable: userInvocable !== false
  };
}
function rejectLegacyKey(data, legacy, canonical) {
  if (Object.hasOwn(data, legacy)) {
    throw new Error(`frontmatter \u5B57\u6BB5 "${legacy}" \u4E0D\u53D7\u652F\u6301\uFF1B\u8BF7\u4F7F\u7528 "${canonical}"`);
  }
}
function frontmatterBoolean(data, key) {
  if (!Object.hasOwn(data, key)) return void 0;
  const value = data[key];
  if (typeof value === "boolean") return value;
  if (value === 1 || value === "1") return true;
  if (value === 0 || value === "0") return false;
  if (typeof value === "string") {
    switch (value.toLowerCase()) {
      case "true":
      case "yes":
      case "on":
        return true;
      case "false":
      case "no":
      case "off":
        return false;
    }
  }
  throw new TypeError(`frontmatter \u5B57\u6BB5 "${key}" \u5E94\u4E3A\u5E03\u5C14\u503C`);
}
function stringField(data, key) {
  const value = data[key];
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function optionalString(data, key) {
  const value = stringField(data, key);
  return value === void 0 ? {} : { whenToUse: value };
}
function optionalMetadata(data) {
  const value = data.metadata;
  if (typeof value === "object" && value !== null && !Array.isArray(value)) {
    return { metadata: value };
  }
  return {};
}
function isAbsentPathError(error) {
  return typeof error === "object" && error !== null && "code" in error && (error.code === "ENOENT" || error.code === "ENOTDIR");
}
function messageOf(error) {
  return error instanceof Error ? error.message : String(error);
}
var LAWYER_SETTINGS_NAMESPACE = "lawyer-workbench";
var DEFAULT_LAWYER_ENTRIES = [
  { id: "contract-review", kind: "builtin" },
  { id: "case-analysis", kind: "builtin" },
  { id: "doc-generation", kind: "builtin" }
];
function registerLawyerSettings(ctx) {
  ctx.inject(["settings"], (settingsCtx) => {
    try {
      settingsCtx.settings.register(LAWYER_SETTINGS_NAMESPACE, buildLawyerConfigSchema());
    } catch (error) {
      ctx.logger.warn(
        `[lawyer-tools] \u6CE8\u518C lawyer-workbench \u8BBE\u7F6E\u5206\u8282\u5931\u8D25\uFF1A${messageOf(error)}\uFF08\u8BF7\u68C0\u67E5 $DSH_HOME/settings.yaml \u7684 lawyer-workbench \u6BB5\uFF1B\u914D\u7F6E\u5206\u8282\u6682\u4E0D\u53EF\u7528\uFF0C\u4FA7\u8FB9\u680F\u5C06\u4F7F\u7528\u9ED8\u8BA4\u5165\u53E3\uFF09`
      );
    }
  });
}
function buildLawyerConfigSchema() {
  const field = object({
    id: required(string()),
    label: required(string()),
    type: required(string()),
    options: array(string()),
    default: string(),
    placeholder: string(),
    hint: string(),
    dropHint: string()
  });
  const legal = object({
    domain: required(string()),
    adapter: required(string()),
    skills: array(string()),
    subagent: string(),
    references: array(string())
  });
  const entry = object({
    id: required(string()),
    kind: required(string()),
    label: string(),
    skill: string(),
    hint: string(),
    icon: string(),
    agentPreset: string(),
    template: string(),
    description: string(),
    purpose: string(),
    extraSkills: array(string()),
    fields: array(field),
    legal,
    mcp: object({
      preset: string(),
      note: string()
    })
  });
  return object({
    onboarded: boolean(),
    entries: defaultValue(array(entry), DEFAULT_LAWYER_ENTRIES),
    // M8：用户主动跳过实务画像引导的领域目录名（commercial-legal 等）。
    // 只记「用户说不用再提醒」这个纯 UI 状态——画像本身是否已配置由
    // lawyerProfile/status 实时查文件判定（画像是模型在会话里写的，
    // 前端无从感知，不能靠这份名单代替状态查询）。
    profileDismissed: array(string()),
    // M8.6：两个纯 UI 的「别再提醒」标记——只表达用户的选择，不代表凭据
    // 本身的状态（元典 Key 是否已配置由 lawyerSecrets/status 实时判定，
    // DeepSeek Key 由 credentials.describe 实时判定）。
    // mcpDismissed：用户选择不再提示元典 MCP 注册引导。
    mcpDismissed: boolean(),
    // apiKeyGuideDone：用户已看过首启的 DeepSeek API Key 获取引导。
    apiKeyGuideDone: boolean()
  });
}
var LAWYER_FILES_KEY = "lawyerFiles";
var UPLOAD_DIR = ".lawyer-uploads";
var UPLOAD_MAX_BYTES = 20 * 1024 * 1024;
var SAVE_INVOCATION = {
  id: "lawyer-tools#lawyerFiles/save",
  service: LAWYER_FILES_KEY,
  namespace: LAWYER_FILES_KEY,
  method: "save",
  invocation: { kind: "direct" },
  parameters: [
    { name: "cwd", wire: "cwd", source: "json", codec: { mode: "src-json" } },
    { name: "fileName", wire: "fileName", source: "json", codec: { mode: "src-json" } },
    { name: "contentBase64", wire: "contentBase64", source: "json", codec: { mode: "src-json" } }
  ],
  result: { mode: "src-json" }
};
function normalizeUploadSegments(fileName) {
  return fileName.replace(/\\/g, "/").split("/").filter((segment) => segment !== "" && segment !== "." && segment !== "..").map((segment) => segment.replace(/[<>:"/\\|?*\u0000-\u001f]/gu, "_").replace(/^(?:\.+)$/, "_").trim()).filter((segment) => segment !== "" && segment !== "." && segment !== "..");
}
function registerLawyerFiles(ctx) {
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
    async save(cwd, fileName, contentBase64) {
      if (typeof cwd !== "string" || cwd.length === 0 || !isAbsolute(cwd)) {
        throw new Error("cwd \u5FC5\u987B\u662F\u7EDD\u5BF9\u8DEF\u5F84");
      }
      if (typeof fileName !== "string" || fileName.length === 0) {
        throw new Error("fileName \u4E0D\u80FD\u4E3A\u7A7A");
      }
      if (typeof contentBase64 !== "string" || contentBase64.length === 0) {
        throw new Error("contentBase64 \u4E0D\u80FD\u4E3A\u7A7A");
      }
      const segments = normalizeUploadSegments(fileName);
      if (segments.length === 0) {
        throw new Error("fileName \u975E\u6CD5");
      }
      const buffer = Buffer.from(contentBase64, "base64");
      if (buffer.length === 0) {
        throw new Error("\u6587\u4EF6\u5185\u5BB9\u4E3A\u7A7A\u6216 base64 \u65E0\u6548");
      }
      if (buffer.length > UPLOAD_MAX_BYTES) {
        throw new Error(`\u6587\u4EF6\u8D85\u8FC7 ${Math.floor(UPLOAD_MAX_BYTES / 1024 / 1024)}MB \u4E0A\u9650`);
      }
      const dir = join(cwd, UPLOAD_DIR, ...segments.slice(0, -1));
      await mkdir(dir, { recursive: true });
      const path = join(dir, segments[segments.length - 1]);
      await writeFile(path, buffer);
      return { path };
    }
  };
  receiver.typertRemote = Object.freeze({
    service: receiver,
    serviceKey: LAWYER_FILES_KEY,
    namespace: LAWYER_FILES_KEY
  });
  ctx.reflect.provide(LAWYER_FILES_KEY, receiver);
  return [SAVE_INVOCATION];
}
var LAWYER_PROFILE_KEY = "lawyerProfile";
var DOMAIN_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
var PLACEHOLDER_PATTERN = /\[PLACEHOLDER\]/g;
var PROFILE_INVOCATIONS = [
  invocation("status", ["domain"]),
  invocation("read", ["domain"]),
  invocation("write", ["domain", "content"]),
  invocation("template", ["domain"])
];
function invocation(method, parameters, service = LAWYER_PROFILE_KEY) {
  return {
    id: `lawyer-tools#${service}/${method}`,
    service,
    namespace: service,
    method,
    invocation: { kind: "direct" },
    parameters: parameters.map((name2) => ({
      name: name2,
      wire: name2,
      source: "json",
      codec: { mode: "src-json" }
    })),
    result: { mode: "src-json" }
  };
}
function resolveDshHome() {
  const fromEnv = process.env.DSH_HOME;
  if (typeof fromEnv === "string" && fromEnv.trim() !== "") return fromEnv.trim();
  return join(homedir(), ".dsh");
}
function profilePathFor(domain) {
  if (typeof domain !== "string" || !DOMAIN_NAME_PATTERN.test(domain)) {
    throw new Error(`\u9886\u57DF\u76EE\u5F55\u540D\u975E\u6CD5\uFF1A${String(domain)}\uFF08\u5E94\u4E3A\u5C0F\u5199 kebab-case\uFF0C\u5982 commercial-legal\uFF09`);
  }
  return join(resolveDshHome(), "legal-zh", domain, "CLAUDE.md");
}
async function readProfileFile(path) {
  try {
    return await readFile(path, "utf8");
  } catch (error) {
    if (isAbsentPathError(error)) return void 0;
    throw error;
  }
}
function registerLawyerProfiles(ctx) {
  const receiver = {
    /**
     * 画像状态：路径 + 是否存在 + 是否已填充（无 [PLACEHOLDER]）+ 剩余占位符数。
     *
     * 每次打开面板或功能表单时调用（非热路径）。实时查文件而非查前端标记——
     * L2 访谈的画像是模型写的，前端无从感知。
     * @param domain - 领域目录名。
     */
    async status(domain) {
      const path = profilePathFor(String(domain));
      const content = await readProfileFile(path);
      if (content === void 0) {
        return { path, exists: false, configured: false, placeholderCount: 0 };
      }
      const placeholderCount = content.match(PLACEHOLDER_PATTERN)?.length ?? 0;
      return {
        path,
        exists: true,
        configured: placeholderCount === 0,
        placeholderCount
      };
    },
    /**
     * 读取画像正文；不存在时返回 exists:false 而非报错（首次打开面板是常态）。
     * @param domain - 领域目录名。
     */
    async read(domain) {
      const path = profilePathFor(String(domain));
      const content = await readProfileFile(path);
      return { path, exists: content !== void 0, content: content ?? "" };
    },
    /**
     * 写入画像正文（mkdir -p 后落盘）。
     *
     * 同时供 L1 表单、L3 直编保存使用；模型也可直接用文件写入工具写同一
     * 路径（L2 访谈），两条写入路径指向同一个 canonical 文件。
     * @param domain - 领域目录名。
     * @param content - 画像 Markdown 全文。
     */
    async write(domain, content) {
      if (typeof content !== "string") {
        throw new Error("content \u5FC5\u987B\u662F\u5B57\u7B26\u4E32");
      }
      const path = profilePathFor(String(domain));
      await mkdir(join(path, ".."), { recursive: true });
      await writeFile(path, content, "utf8");
      return { path };
    },
    /**
     * 读取仓库内的领域画像模板（<repo>/<domain>/CLAUDE.md），供 L1 初始化
     * 与「留空按通用配置」回填。repo 根由安装脚本 / deployLegalZh 写入
     * <dshHome>/legal-zh/repo。
     * @param domain - 领域目录名。
     */
    async template(domain) {
      if (typeof domain !== "string" || !DOMAIN_NAME_PATTERN.test(domain)) {
        throw new Error(`\u9886\u57DF\u76EE\u5F55\u540D\u975E\u6CD5\uFF1A${String(domain)}`);
      }
      const repoPointer = join(resolveDshHome(), "legal-zh", "repo");
      const repoRoot = (await readProfileFile(repoPointer))?.trim();
      if (repoRoot === void 0 || repoRoot === "") {
        throw new Error(
          `\u672A\u627E\u5230 claude-for-legal-ZH \u4ED3\u5E93\u767B\u8BB0\u6587\u4EF6\uFF1A${repoPointer}\u2014\u2014\u8BF7\u5148\u8FD0\u884C lawyer-dsh/scripts/install-legal-zh.ps1 \u5B89\u88C5\u9002\u914D\u5C42`
        );
      }
      const path = join(repoRoot, domain, "CLAUDE.md");
      const content = await readProfileFile(path);
      if (content === void 0) {
        throw new Error(`\u4ED3\u5E93\u5185\u65E0\u8BE5\u9886\u57DF\u7684\u753B\u50CF\u6A21\u677F\uFF1A${path}`);
      }
      return { path, content };
    }
  };
  receiver.typertRemote = Object.freeze({
    service: receiver,
    serviceKey: LAWYER_PROFILE_KEY,
    namespace: LAWYER_PROFILE_KEY
  });
  ctx.reflect.provide(LAWYER_PROFILE_KEY, receiver);
  return PROFILE_INVOCATIONS;
}
var LAWYER_SECRETS_KEY = "lawyerSecrets";
var YUANDIAN_ENV_KEY = "YUANDIAN_API_KEY";
var YUANDIAN_MCP_LAW_URL = "https://open.chineselaw.com/mcp/law/stream";
var SECRETS_FILE_NAME = "lawyer-secrets.json";
var VERIFY_TIMEOUT_MS = 8e3;
var API_KEY_PATTERN = /^[\x21-\x7e]{4,512}$/;
var VERIFY_CAVEAT = "\uFF1B\u6CE8\uFF1A\u5E73\u53F0\u63E1\u624B\u9636\u6BB5\u4E0D\u6821\u9A8C Key \u5F52\u5C5E\uFF0C\u4EE5\u4F1A\u8BDD\u5185\u5B9E\u9645\u68C0\u7D22\u4E3A\u51C6";
var SECRET_INVOCATIONS = [
  invocation("status", [], LAWYER_SECRETS_KEY),
  invocation("save", ["apiKey"], LAWYER_SECRETS_KEY),
  invocation("clear", [], LAWYER_SECRETS_KEY),
  invocation("verify", [], LAWYER_SECRETS_KEY)
];
function secretsPath() {
  return join(resolveDshHome(), SECRETS_FILE_NAME);
}
async function readSecretsFile(ctx) {
  let raw;
  try {
    raw = await readFile(secretsPath(), "utf8");
  } catch (error) {
    if (isAbsentPathError(error)) return {};
    throw error;
  }
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    ctx.logger.warn(`[lawyer-tools] ${secretsPath()} \u4E0D\u662F\u5408\u6CD5 JSON\uFF0C\u6309\u7A7A\u51ED\u636E\u5904\u7406`);
    return {};
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) return {};
  const result = {};
  for (const [key, value] of Object.entries(parsed)) {
    if (typeof value === "string" && value !== "") result[key] = value;
  }
  return result;
}
async function writeSecretsFile(data) {
  await writeFile(secretsPath(), `${JSON.stringify(data, null, 2)}
`, { mode: 384, encoding: "utf8" });
}
function maskKey(key) {
  return key.length <= 10 ? "****" : `${key.slice(0, 4)}****${key.slice(-4)}`;
}
async function readHeadChunk(response) {
  const reader = response.body?.getReader();
  if (reader === void 0) return "";
  try {
    const { value } = await reader.read();
    await reader.cancel();
    return new TextDecoder().decode(value ?? new Uint8Array());
  } catch {
    return "";
  }
}
function rejectionOf(head) {
  if (head === "") return void 0;
  try {
    const parsed = JSON.parse(head);
    if (typeof parsed.error === "string" && parsed.error !== "") {
      return typeof parsed.error_description === "string" && parsed.error_description !== "" ? parsed.error_description : parsed.error;
    }
    return void 0;
  } catch {
    const matched = /unauthorized|invalid[_-]?token|invalid[_-]?api[_-]?key|未授权|鉴权失败/iu.exec(head);
    return matched?.[0];
  }
}
function registerLawyerSecrets(ctx) {
  let hydratedFromFile = false;
  let hydration;
  const hydrate = () => {
    hydration ??= (async () => {
      const fromEnv = process.env[YUANDIAN_ENV_KEY];
      if (typeof fromEnv === "string" && fromEnv.trim() !== "") return;
      try {
        const stored = (await readSecretsFile(ctx))[YUANDIAN_ENV_KEY];
        if (stored === void 0) return;
        process.env[YUANDIAN_ENV_KEY] = stored;
        hydratedFromFile = true;
      } catch (error) {
        ctx.logger.warn(`[lawyer-tools] \u8BFB\u53D6 ${SECRETS_FILE_NAME} \u5931\u8D25\uFF1A${messageOf(error)}`);
      }
    })();
    return hydration;
  };
  void hydrate();
  const currentKey = async () => {
    await hydrate();
    const fromEnv = process.env[YUANDIAN_ENV_KEY];
    if (typeof fromEnv === "string" && fromEnv.trim() !== "") return fromEnv.trim();
    return (await readSecretsFile(ctx))[YUANDIAN_ENV_KEY];
  };
  const probe = async (key) => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      controller.abort();
    }, VERIFY_TIMEOUT_MS);
    try {
      const response = await fetch(YUANDIAN_MCP_LAW_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
          authorization: `Bearer ${key}`
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: 1,
          method: "initialize",
          params: {
            protocolVersion: "2025-03-26",
            capabilities: {},
            clientInfo: { name: "lawyer-dsh", version: "1.0.0" }
          }
        }),
        signal: controller.signal
      });
      const head = await readHeadChunk(response);
      if (response.status === 401 || response.status === 403) {
        return { ok: false, code: "unauthorized", message: `\u5143\u5178\u5E73\u53F0\u62D2\u7EDD\u4E86\u8BE5 Key\uFF08HTTP ${response.status}\uFF09` };
      }
      const rejected = rejectionOf(head);
      if (rejected !== void 0) {
        return { ok: false, code: "unauthorized", message: `\u5143\u5178\u5E73\u53F0\u62D2\u7EDD\u4E86\u8BE5 Key\uFF1A${rejected}` };
      }
      if (response.status >= 500) {
        return { ok: false, code: "server-error", message: `\u5143\u5178\u5E73\u53F0\u6682\u65F6\u4E0D\u53EF\u7528\uFF08HTTP ${response.status}\uFF09` };
      }
      return {
        ok: true,
        code: "reachable",
        message: `\u5DF2\u8FDE\u901A\u5143\u5178\u6CD5\u89C4\u68C0\u7D22\uFF08HTTP ${response.status}\uFF09\uFF0C\u8FDE\u63A5\u53EF\u7528${VERIFY_CAVEAT}`
      };
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        return { ok: false, code: "timeout", message: `\u8FDE\u63A5\u5143\u5178\u5E73\u53F0\u8D85\u65F6\uFF08${VERIFY_TIMEOUT_MS / 1e3} \u79D2\uFF09` };
      }
      return { ok: false, code: "unreachable", message: `\u65E0\u6CD5\u8FDE\u63A5\u5143\u5178\u5E73\u53F0\uFF1A${messageOf(error)}` };
    } finally {
      clearTimeout(timer);
    }
  };
  const receiver = {
    /**
     * 元典 Key 的实时状态（每次打开功能入口时调用）。
     *
     * 只回 masked——Client 是浏览器插件，明文一旦过线就等于进了页面内存。
     */
    async status() {
      await hydrate();
      const fromEnv = process.env[YUANDIAN_ENV_KEY];
      const path = secretsPath();
      if (typeof fromEnv === "string" && fromEnv.trim() !== "") {
        return {
          env: YUANDIAN_ENV_KEY,
          configured: true,
          source: hydratedFromFile ? "file" : "env",
          masked: maskKey(fromEnv.trim()),
          path
        };
      }
      const stored = (await readSecretsFile(ctx))[YUANDIAN_ENV_KEY];
      if (stored !== void 0) {
        return { env: YUANDIAN_ENV_KEY, configured: true, source: "file", masked: maskKey(stored), path };
      }
      return { env: YUANDIAN_ENV_KEY, configured: false, source: "none", path };
    },
    /**
     * 保存 Key：落盘 + 注入本进程 env + 立即校验一次。
     *
     * 顺序是刻意的：先持久化再校验，这样即使校验因网络失败，Key 也已经
     * 存下来了（下次启动仍生效），界面按 verify 结果提示重试即可。
     * @param apiKey - 用户粘贴的 Key。
     */
    async save(apiKey) {
      if (typeof apiKey !== "string") throw new Error("apiKey \u5FC5\u987B\u662F\u5B57\u7B26\u4E32");
      const key = apiKey.replace(/[\s\u200b-\u200d\ufeff]+/g, "");
      if (!API_KEY_PATTERN.test(key)) {
        throw new Error("Key \u5F62\u6001\u4E0D\u5408\u6CD5\uFF1A\u5E94\u53EA\u542B\u82F1\u6587\u5B57\u6BCD\u3001\u6570\u5B57\u4E0E\u5E38\u89C1\u7B26\u53F7\uFF08\u5DF2\u81EA\u52A8\u53BB\u9664\u7A7A\u767D\uFF09");
      }
      const path = secretsPath();
      let stored = {};
      try {
        stored = await readSecretsFile(ctx);
      } catch (error) {
        ctx.logger.warn(`[lawyer-tools] \u8BFB\u53D6 ${SECRETS_FILE_NAME} \u5931\u8D25\uFF0C\u5C06\u6574\u4F53\u8986\u76D6\uFF1A${messageOf(error)}`);
      }
      await writeSecretsFile({ ...stored, [YUANDIAN_ENV_KEY]: key });
      process.env[YUANDIAN_ENV_KEY] = key;
      hydratedFromFile = true;
      const verify = await probe(key);
      return { path, ...verify };
    },
    /**
     * 清除 Key：从落盘文件与本进程 env 中一并移除（用户换号或不再使用
     * 法规检索时用；技能会按降级指引继续）。
     */
    async clear() {
      const path = secretsPath();
      let stored = {};
      try {
        stored = await readSecretsFile(ctx);
      } catch {
      }
      delete stored[YUANDIAN_ENV_KEY];
      await writeSecretsFile(stored);
      delete process.env[YUANDIAN_ENV_KEY];
      hydratedFromFile = false;
      return { path };
    },
    /**
     * 用当前生效的 Key 重新校验一次（界面上的「重新验证」按钮用它）。
     * 未配置时返回 code:'missing'，不发起网络请求。
     */
    async verify() {
      const key = await currentKey();
      if (key === void 0) {
        return { ok: false, code: "missing", message: "\u5C1A\u672A\u914D\u7F6E\u5143\u5178 API Key" };
      }
      return probe(key);
    }
  };
  receiver.typertRemote = Object.freeze({
    service: receiver,
    serviceKey: LAWYER_SECRETS_KEY,
    namespace: LAWYER_SECRETS_KEY
  });
  ctx.reflect.provide(LAWYER_SECRETS_KEY, receiver);
  return SECRET_INVOCATIONS;
}
export {
  apply,
  inject,
  name,
  normalizeUploadSegments,
  rejectionOf
};

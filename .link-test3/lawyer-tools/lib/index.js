import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { basename, isAbsolute, join } from "node:path";
import { parse as parseYaml } from "yaml";
const name = "lawyer-tools";
const inject = ["skills", "typert"];
const LAWYER_SKILL_RANK = 600;
const SKILL_NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
function apply(ctx, config = {}) {
  registerLawyerFiles(ctx);
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
  let invocation;
  try {
    invocation = parseInvocationPolicy(parsed.data);
  } catch (error) {
    ctx.logger.warn(`[lawyer-tools] \u6280\u80FD\u6587\u4EF6 ${path} \u5FFD\u7565\uFF1Afrontmatter \u8C03\u7528\u7B56\u7565\u65E0\u6548\uFF1A${messageOf(error)}`);
    return void 0;
  }
  return {
    name: name2,
    description,
    ...optionalString(parsed.data, "whenToUse"),
    invocation,
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
const LAWYER_FILES_KEY = "lawyerFiles";
const UPLOAD_DIR = ".lawyer-uploads";
const UPLOAD_MAX_BYTES = 20 * 1024 * 1024;
const SAVE_INVOCATION = {
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
function registerLawyerFiles(ctx) {
  const receiver = {
    /**
     * 把一份 base64 内容写入 <cwd>/.lawyer-uploads/<fileName>。
     * @param cwd - 工作区目录（client 传当前 workspace 的 path）。
     * @param fileName - 原始文件名（清洗为安全 basename）。
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
      const safeName = basename(fileName).replace(/[<>:"/\\|?*\u0000-\u001f]/gu, "_").replace(/^(?:\.+)$/, "_").trim();
      if (safeName === "" || safeName === "." || safeName === "..") {
        throw new Error("fileName \u975E\u6CD5");
      }
      const buffer = Buffer.from(contentBase64, "base64");
      if (buffer.length === 0) {
        throw new Error("\u6587\u4EF6\u5185\u5BB9\u4E3A\u7A7A\u6216 base64 \u65E0\u6548");
      }
      if (buffer.length > UPLOAD_MAX_BYTES) {
        throw new Error(`\u6587\u4EF6\u8D85\u8FC7 ${Math.floor(UPLOAD_MAX_BYTES / 1024 / 1024)}MB \u4E0A\u9650`);
      }
      const dir = join(cwd, UPLOAD_DIR);
      await mkdir(dir, { recursive: true });
      const path = join(dir, safeName);
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
  ctx.typert.register({
    package: "lawyer-tools",
    face: "host",
    schemas: [],
    model: { services: [], events: [], objects: [] },
    invocations: [SAVE_INVOCATION]
  });
}
export {
  apply,
  inject,
  name
};

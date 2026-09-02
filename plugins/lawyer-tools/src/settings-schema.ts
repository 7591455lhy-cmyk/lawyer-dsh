/**
 * lawyer-workbench 设置 namespace 的零依赖 schema（“鸭子 Schemastery”）。
 *
 * 为什么不用 @deepseek-ai/schemastery：本插件经 `dsh plugin add` 安装进
 * profile 后，运行时 import 只能从 profile 的 node_modules 解析（顶层仅
 * 本包自带依赖），harness 私有包（schemastery / dsh-settings）不在其中
 * ——与 index.ts“不导出 Schemastery Config”是同一条部署边界。
 *
 * 而 ctx.settings.register(ns, schema) 对 schema 的全部使用面（逐行核对
 * deepseek-harness/packages/settings/settings/src/index.ts 与 vendor/
 * schemastery/src/index.ts）只有三个：
 *   1. 可调用：schema(merged) —— 解析候选值（nullable → meta.default、
 *      类型校验、非 strict 时保留未知键），非法抛错；
 *   2. schema.toJSON() —— describe 序列化。格式为 { uid, refs } 信封：
 *      refs 内每个节点是 plain object（type / meta / dict | inner，嵌套
 *      子 schema 以数字 uid 引用），client 端 dsh-client-ui-settings 用
 *      `new Schema(serialized)` 原样 rehydrate 并校验；
 *   3. redactSecrets(schema, value) —— 只读 type / meta.role / dict /
 *      inner 做结构遍历（本 namespace 无 secret，字段存在即可）。
 *
 * 本文件按这三条契约实现一个迷你子集（object / array / string / boolean
 * + default / required），解析语义逐条对齐 vendor/schemastery 源码：
 *   - object / array 构造时自动置 meta.default = {} / []（对齐
 *     defineMethod 尾部的默认值行为）；
 *   - nullable 且非 required：有 default 用 default（深拷贝），否则保持
 *     null/undefined；
 *   - object resolver：值非 plain object 抛错；逐 dict 键解析，键值为
 *     nullable 且未显式存在时不写入结果（对齐 `!isNullable(value) ||
 *     key in data`），未知键原样保留（非 strict merge）；
 *   - array resolver：值非数组抛错；逐元素解析（元素 nullable 走同一
 *     默认值规则）；
 *   - 报错消息带 `$path` 前缀，风格对齐 schemastery 的 ValidationError。
 */

/** 迷你 schema 节点：可调用的解析器 + 结构字段 + refs 序列化。 */
export interface MiniSchema {
  /** 解析并校验候选值；nullable 走 default，非法值抛 Error。 */
  (data: unknown): unknown
  /** 节点类型（redactSecrets 遍历与 client rehydrate 都按它分派）。 */
  readonly type: 'object' | 'array' | 'string' | 'boolean'
  /** 元数据（default / required；redactSecrets 只读 meta.role）。 */
  readonly meta: { default?: unknown; required?: boolean }
  /** object 类型的属性表（键 → 子 schema）。 */
  readonly dict?: Record<string, MiniSchema>
  /** array 类型的元素 schema。 */
  readonly inner?: MiniSchema
  /** describe 序列化：{ uid, refs } 信封（见文件头注释第 2 条）。 */
  toJSON(): { uid: number; refs: Record<number, unknown> }
}

/** 迷你 schema 的可变构造态（meta / dict / inner 在构造期赋值）。 */
type DraftSchema = MiniSchema & {
  meta: { default?: unknown; required?: boolean }
  dict?: Record<string, MiniSchema>
  inner?: MiniSchema
}

/** 是否为 plain object（对齐 schemastery 的 isPlainObject 使用面）。 */
function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** 错误消息里的值描述（对齐 schemastery 的 `${data}` 插值）。 */
function describe(value: unknown): string {
  return typeof value === 'string' ? JSON.stringify(value) : String(value)
}

/**
 * 解析并校验一个候选值（对齐 Schema.resolve + 各类型 resolver 的合并
 * 语义；本 namespace 不需要 sKey / tuple / union 等更多类型）。
 * @param data - 候选值（可能来自 user 层、base 层合并或写入校验）。
 * @param schema - 目标节点。
 * @param path - 错误消息前缀（根为 '$'）。
 * @returns 解析后的新值（不修改入参）。
 */
function resolve(data: unknown, schema: MiniSchema, path: string): unknown {
  if (data === undefined || data === null) {
    if (schema.meta.required === true) {
      throw new Error(`${path} missing required value`)
    }
    // 对齐 schemastery：nullable 且有 default 时替换 data 后继续按类型
    // 解析（不提前返回——顶层 object 的 default {} 会继续解析出子键的
    // 默认值，如 entries 的三内置入口）。
    if (schema.meta.default === undefined) {
      return data
    }
    data = structuredClone(schema.meta.default)
  }
  switch (schema.type) {
    case 'object': {
      if (!isPlainObject(data)) {
        throw new Error(`${path} expected object but got ${describe(data)}`)
      }
      const dict = schema.dict ?? {}
      const result: Record<string, unknown> = {}
      for (const [key, child] of Object.entries(dict)) {
        const value = resolve(
          data[key],
          child,
          path === '$' ? `$.${key}` : `${path}.${key}`,
        )
        // 对齐 schemastery：值为 nullable 时仅当键显式存在才写入。
        if ((value !== undefined && value !== null) || key in data) {
          result[key] = value
        }
      }
      // 非 strict merge：未知键原样保留（数组等复合默认值不受影响）。
      for (const [key, value] of Object.entries(data)) {
        if (!(key in dict)) result[key] = value
      }
      return result
    }
    case 'array': {
      if (!Array.isArray(data)) {
        throw new Error(`${path} expected array but got ${describe(data)}`)
      }
      const inner = schema.inner
      if (inner === undefined) return [...data]
      return data.map((item, index) => resolve(item, inner, `${path}[${index}]`))
    }
    case 'string': {
      if (typeof data !== 'string') {
        throw new Error(`${path} expected string but got ${describe(data)}`)
      }
      return data
    }
    case 'boolean': {
      if (typeof data !== 'boolean') {
        throw new Error(`${path} expected boolean but got ${describe(data)}`)
      }
      return data
    }
  }
}

/**
 * 序列化为 { uid, refs } 信封（对齐 Schema.prototype.toJSON 的产物结构：
 * 根节点也在 refs 内，嵌套子 schema 以数字 uid 引用，meta.default 内联）。
 */
function serialize(root: MiniSchema): { uid: number; refs: Record<number, unknown> } {
  const refs: Record<number, unknown> = {}
  let nextUid = 1
  const visit = (node: MiniSchema): number => {
    const uid = nextUid++
    const plain: Record<string, unknown> = { type: node.type, meta: node.meta }
    if (node.dict !== undefined) {
      plain.dict = Object.fromEntries(
        Object.entries(node.dict).map(([key, child]) => [key, visit(child)]),
      )
    }
    if (node.inner !== undefined) {
      plain.inner = visit(node.inner)
    }
    refs[uid] = plain
    return uid
  }
  const uid = visit(root)
  return { uid, refs }
}

/** 通用节点工厂：可调用 + toJSON，meta / dict / inner 由各类型构造器补齐。 */
function create(draft: DraftSchema): MiniSchema {
  const node = draft
  const callable = (data: unknown): unknown => resolve(data, node, '$')
  Object.assign(callable, node)
  callable.toJSON = () => serialize(callable as MiniSchema)
  return callable as MiniSchema
}

/** object 节点；meta.default 自动为 {}（对齐 schemastery defineMethod）。 */
export function object(dict: Record<string, MiniSchema>): MiniSchema {
  return create({ type: 'object', meta: { default: {} }, dict })
}

/** array 节点；meta.default 自动为 []（对齐 schemastery defineMethod）。 */
export function array(inner: MiniSchema): MiniSchema {
  return create({ type: 'array', meta: { default: [] }, inner })
}

/** string 节点（无默认值）。 */
export function string(): MiniSchema {
  return create({ type: 'string', meta: {} })
}

/** boolean 节点（无默认值）。 */
export function boolean(): MiniSchema {
  return create({ type: 'boolean', meta: {} })
}

/** 置 required：nullable 输入直接报错（不落 default）。 */
export function required(node: MiniSchema): MiniSchema {
  ;(node as DraftSchema).meta.required = true
  return node
}

/** 置 default：nullable 输入落到该值（深拷贝返回）。 */
export function defaultValue(node: MiniSchema, value: unknown): MiniSchema {
  ;(node as DraftSchema).meta.default = value
  return node
}

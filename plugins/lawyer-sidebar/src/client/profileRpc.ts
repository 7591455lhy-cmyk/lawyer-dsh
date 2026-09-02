/**
 * 实务画像的 Host RPC 客户端封装（lawyerProfile 服务，M8）。
 *
 * 画像正文落盘在 Host 侧（<dshHome>/legal-zh/<domain>/CLAUDE.md），Client
 * 插件不能读文件系统（项目铁律），所有读写都经本模块的 Typert RPC。
 *
 * 调用范式照抄 index.ts 的 uploadWorkspaceFile（已验证）：
 *   ctx.get('connection').rpc.call('/api', 'lawyerProfile/<method>', { args }, signal)
 * 失败一律降级为 Error 对象而非抛出——面板要能把错误显示在界面上，而不是
 * 让悬浮窗白屏。
 */
import type { ConnectionHandle } from '@deepseek-ai/dsh-api-remotes/client'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'

/** 画像状态（Host 侧实时查文件的产物）。 */
export interface ProfileStatus {
  /** 画像文件绝对路径（canonical）。 */
  readonly path: string
  /** 文件是否已存在。 */
  readonly exists: boolean
  /** 是否已填充（无 [PLACEHOLDER]）。 */
  readonly configured: boolean
  /** 剩余占位符数量（0 即已配置）。 */
  readonly placeholderCount: number
}

/** 画像读取结果。 */
export interface ProfileContent {
  readonly path: string
  readonly exists: boolean
  readonly content: string
}

/** 画像模板（仓库内 <repo>/<domain>/CLAUDE.md）。 */
export interface ProfileTemplate {
  readonly path: string
  readonly content: string
}

/** 画像 API（由 createProfileApi 构造后注入组件）。 */
export interface LawyerProfileApi {
  /** 查画像状态（每次打开面板/表单时调用，实时反映模型写入的结果）。 */
  readonly status: (domain: string, signal?: AbortSignal) => Promise<ProfileStatus | Error>
  /** 读画像正文；不存在时 exists:false 而非 Error。 */
  readonly read: (domain: string, signal?: AbortSignal) => Promise<ProfileContent | Error>
  /** 写画像正文；返回落盘路径。 */
  readonly write: (
    domain: string,
    content: string,
    signal?: AbortSignal,
  ) => Promise<{ path: string } | Error>
  /** 读仓库内的领域画像模板。 */
  readonly template: (domain: string, signal?: AbortSignal) => Promise<ProfileTemplate | Error>
}

/** RPC 返回信封（与 index.ts 的声明同形）。 */
interface RpcEnvelope {
  readonly ok: boolean
  readonly value?: unknown
  readonly error?: { readonly message?: string }
}

/** ConnectionHandle 上我们用到的 rpc 成员。 */
interface RpcCapable {
  rpc: {
    call(
      channel: string,
      endpoint: string,
      payload: unknown,
      signal?: AbortSignal,
    ): Promise<RpcEnvelope>
  }
}

/**
 * 把 RPC 结果归一为「值或 Error」；Host 未升级到含 lawyerProfile 的版本时
 * 给出可操作的提示（lawyer-tools 需重建并重装，这一点在历史踩坑中验证过：
 * 光 bump 版本号不触发 file: 依赖内容更新，必须 remove 再 add）。
 * @param result - RPC 返回。
 * @param fallback - 无错误消息时的兜底文案。
 */
function unwrap<T>(result: RpcEnvelope, fallback: string): T | Error {
  if (result.ok && result.value !== undefined) return result.value as T
  const message = result.error?.message
  return new Error(
    typeof message === 'string' && message !== ''
      ? message
      : `${fallback}（lawyer-tools 是否已重建并重装到含 lawyerProfile 服务的版本？）`,
  )
}

/**
 * 构造画像 API。
 * @param ctx - 客户端根上下文（取其 connection 服务的 rpc 通道）。
 * @returns 画像读写 API。
 */
export function createProfileApi(ctx: ClientContext): LawyerProfileApi {
  const call = <T>(
    method: string,
    args: Record<string, unknown>,
    signal: AbortSignal | undefined,
  ): Promise<T | Error> => {
    const { rpc } = ctx.get('connection') as ConnectionHandle & RpcCapable
    return rpc.call('/api', `lawyerProfile/${method}`, { args }, signal).then(
      result => unwrap<T>(result, `lawyerProfile/${method} 返回异常`),
      error => new Error(`${method} 请求失败：${error instanceof Error ? error.message : String(error)}`),
    )
  }
  return {
    status: (domain, signal) => call<ProfileStatus>('status', { domain }, signal),
    read: (domain, signal) => call<ProfileContent>('read', { domain }, signal),
    write: (domain, content, signal) =>
      call<{ path: string }>('write', { domain, content }, signal),
    template: (domain, signal) => call<ProfileTemplate>('template', { domain }, signal),
  }
}

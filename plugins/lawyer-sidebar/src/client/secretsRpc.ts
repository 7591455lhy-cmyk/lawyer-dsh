/**
 * 元典 MCP 凭据的 Host RPC 客户端封装（lawyerSecrets 服务，M8.6）。
 *
 * 元典 API Key 存在 Host 的环境变量 / <dshHome>/lawyer-secrets.json 里，
 * Client 插件既读不到 env 也读不到文件系统（项目铁律），状态与写入一律
 * 经本模块的 Typert RPC；Key 明文只在「用户输入 → 保存」这一个方向上过
 * 线一次，读取侧永远只回打码形态（masked）。
 *
 * 调用范式照抄 profileRpc.ts（已验证）：
 *   ctx.get('connection').rpc.call('/api', 'lawyerSecrets/<method>', { args }, signal)
 * 失败一律降级为 Error 对象而非抛出——引导弹窗要能把错误显示在界面上。
 */
import type { ConnectionHandle } from '@deepseek-ai/dsh-api-remotes/client'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'

/** verify 结果码（Host 侧 VerifyCode 的 Client 副本）。 */
export type VerifyCode =
  | 'reachable'
  | 'unauthorized'
  | 'server-error'
  | 'timeout'
  | 'unreachable'
  | 'missing'

/** 连通性校验结果。 */
export interface VerifyResult {
  readonly ok: boolean
  readonly code: VerifyCode
  readonly message: string
}

/** 凭据状态（无明文）。 */
export interface SecretStatus {
  /** 环境变量名（固定 YUANDIAN_API_KEY）。 */
  readonly env: string
  /** 是否已配置。 */
  readonly configured: boolean
  /** 取值来源：系统环境变量 / 本工作台保存的文件 / 未配置。 */
  readonly source: 'env' | 'file' | 'none'
  /** 打码形态（如 sk-a****9f2e）；未配置时缺省。 */
  readonly masked?: string
  /** 落盘文件绝对路径（提示用户用）。 */
  readonly path: string
}

/** 保存结果：落盘路径 + 立即校验的结论。 */
export interface SaveSecretResult {
  readonly path: string
  readonly ok: boolean
  readonly code: VerifyCode
  readonly message: string
}

/** 凭据 API（由 createSecretsApi 构造后注入组件）。 */
export interface LawyerSecretsApi {
  /** 查元典 Key 状态（每次打开功能入口时调用，实时反映 Host 侧变化）。 */
  readonly status: (signal?: AbortSignal) => Promise<SecretStatus | Error>
  /** 保存 Key（落盘 + 注入进程 env）并立即校验一次。 */
  readonly save: (apiKey: string, signal?: AbortSignal) => Promise<SaveSecretResult | Error>
  /** 清除已保存的 Key。 */
  readonly clear: (signal?: AbortSignal) => Promise<{ path: string } | Error>
  /** 用当前生效的 Key 重新校验连通性。 */
  readonly verify: (signal?: AbortSignal) => Promise<VerifyResult | Error>
}

/** RPC 返回信封（与 profileRpc.ts 的声明同形）。 */
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
 * 把 RPC 结果归一为「值或 Error」；Host 未升级到含 lawyerSecrets 的版本时
 * 给出可操作的提示（lawyer-tools 需重建并重装：光 bump 版本号不触发
 * file: 依赖内容更新，必须 remove 再 add）。
 * @param result - RPC 返回。
 * @param fallback - 无错误消息时的兜底文案。
 */
function unwrap<T>(result: RpcEnvelope, fallback: string): T | Error {
  if (result.ok && result.value !== undefined) return result.value as T
  const message = result.error?.message
  return new Error(
    typeof message === 'string' && message !== ''
      ? message
      : `${fallback}（lawyer-tools 是否已重建并重装到含 lawyerSecrets 服务的版本？）`,
  )
}

/**
 * 构造凭据 API。
 * @param ctx - 客户端根上下文（取其 connection 服务的 rpc 通道）。
 * @returns 凭据读写与校验 API。
 */
export function createSecretsApi(ctx: ClientContext): LawyerSecretsApi {
  const call = <T>(
    method: string,
    args: Record<string, unknown>,
    signal: AbortSignal | undefined,
  ): Promise<T | Error> => {
    const { rpc } = ctx.get('connection') as ConnectionHandle & RpcCapable
    return rpc.call('/api', `lawyerSecrets/${method}`, { args }, signal).then(
      result => unwrap<T>(result, `lawyerSecrets/${method} 返回异常`),
      error => new Error(`${method} 请求失败：${error instanceof Error ? error.message : String(error)}`),
    )
  }
  return {
    status: signal => call<SecretStatus>('status', {}, signal),
    save: (apiKey, signal) => call<SaveSecretResult>('save', { apiKey }, signal),
    clear: signal => call<{ path: string }>('clear', {}, signal),
    verify: signal => call<VerifyResult>('verify', {}, signal),
  }
}

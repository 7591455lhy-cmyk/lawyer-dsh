/**
 * 元典 MCP 注册引导弹窗（M8.6）。
 *
 * 法规检索（mcp__law__*）与类案检索（mcp__case__*）由元典开放平台的 MCP
 * 提供，鉴权走环境变量 YUANDIAN_API_KEY——律师用户第一次用右侧功能栏时
 * 手里没有这个 Key，而缺失的后果是静默的：技能按降级指引继续，输出里的
 * 法条只能靠模型记忆，用户未必察觉。
 *
 * 因此在使用入口处做一次前置引导：
 *   - 未配置：讲清「注册 → 创建 Key → 粘贴」，给可点的平台链接，并提供
 *     直接粘贴保存的输入框（保存后 Host 立即注入进程 env，下一次发起任务
 *     就带上，不用重启）；
 *   - 保存后立刻校验一次：401/403 说明 Key 被拒（提示重新确认并再给一次
 *     平台链接），超时/不可达与「Key 无效」分开提示，避免断网被误报成
 *     Key 错；
 *   - 已配置：显示打码形态、来源与「重新验证 / 清除」入口，随时可换号；
 *   - 两条退路：本次跳过（不改任何持久化状态）与不再提醒（写
 *     lawyer-workbench.mcpDismissed）。
 *
 * 全程不阻塞：没有 Key 也能继续用，只是法条与类案要标注「需验证」。
 */
import { useEffect, useRef, useState } from 'react'
import { openExternalUrl } from './externalLink.ts'
import type { LawyerSecretsApi, SecretStatus, VerifyResult } from './secretsRpc.ts'

/** 元典开放平台入口（注册 / 控制台）。 */
const YUANDIAN_LINKS: readonly { readonly label: string; readonly url: string; readonly note: string }[] = [
  {
    label: '打开元典开放平台',
    url: 'https://open.chineselaw.com',
    note: '注册账号并登录控制台',
  },
  {
    label: '去控制台创建 API Key',
    url: 'https://open.chineselaw.com',
    note: '在「API 密钥 / 开发者设置」里新建，复制后粘贴到下方',
  },
  {
    label: '查看 MCP 配置说明',
    url: 'https://open.chineselaw.com/mcp-config/',
    note: '官方接入文档：端点、认证方式与配置示例',
  },
]

/** 校验结果的中文提示（按 code 给可操作文案）。 */
function verifyHint(result: VerifyResult): string {
  if (result.ok) return result.message
  switch (result.code) {
    case 'unauthorized':
      return `${result.message}——Key 无效、已过期或账号未开通该服务，请回平台确认后重新粘贴`
    case 'timeout':
    case 'unreachable':
      return `${result.message}——网络不通时无法判断 Key 是否有效，Key 已保存，稍后可点「重新验证」`
    case 'server-error':
      return `${result.message}——平台侧暂时异常，Key 已保存，稍后重试即可`
    case 'missing':
      return result.message
    default:
      return result.message
  }
}

/** 来源文案。 */
function sourceLabel(source: SecretStatus['source']): string {
  if (source === 'env') return '来自系统环境变量'
  if (source === 'file') return '来自本工作台保存的凭据文件'
  return '未配置'
}

/** 弹窗入参。 */
export interface YuandianMcpDialogProps {
  /** 当前凭据状态（null=还在查，此时不显示来源行）。 */
  readonly status: SecretStatus | null
  /** 凭据的 Host RPC 封装。 */
  readonly secretsApi: LawyerSecretsApi
  /** 配置状态变化后回调（侧栏据此刷新卡片简述）。 */
  readonly onChanged: (status: SecretStatus | null) => void
  /** 关闭并继续（不写任何持久化状态）。 */
  readonly onClose: () => void
  /** 不再提醒（写 mcpDismissed 后关闭）。 */
  readonly onDismiss: () => void
}

/**
 * 元典 MCP 注册引导。
 * @param props - 状态、RPC 与回调。
 * @returns 引导弹窗。
 */
export function YuandianMcpDialog({
  status,
  secretsApi,
  onChanged,
  onClose,
  onDismiss,
}: YuandianMcpDialogProps) {
  const [apiKey, setApiKey] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<VerifyResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  // 已配置时自动检测一次连接，直接告诉用户「MCP 可用 / 不可用」。
  const [availability, setAvailability] = useState<VerifyResult | null>(null)
  const autoVerified = useRef(false)

  // 状态变化时只重置输入框与进行中标志；验证结果（result）与错误（error）
  // 不在这里清空——save 成功后会经 onChanged 更新 status，若此处清空 result，
  // 用户刚看到的「已连通」结论会被立刻抹掉，造成「验证出错」的错觉。
  useEffect(() => {
    setApiKey('')
    setBusy(false)
  }, [status?.configured, status?.masked])

  // 已配置时自动探测一次连接可用性（每次打开弹窗只做一次；save 后 status
  // 变化时 autoVerified 已置位，不会重复探测）。
  useEffect(() => {
    if (status?.configured !== true || autoVerified.current) return
    autoVerified.current = true
    let cancelled = false
    void secretsApi.verify(new AbortController().signal).then(checked => {
      if (cancelled) return
      setAvailability(checked instanceof Error ? null : checked)
    })
    return () => { cancelled = true }
  }, [status?.configured, secretsApi])

  /** 保存并校验。 */
  const save = (): void => {
    const key = apiKey.trim()
    if (key === '') {
      setError('请先粘贴 API Key')
      return
    }
    setBusy(true)
    setError(null)
    setResult(null)
    void (async () => {
      const saved = await secretsApi.save(key, new AbortController().signal)
      setBusy(false)
      if (saved instanceof Error) {
        setError(saved.message)
        return
      }
      setResult({ ok: saved.ok, code: saved.code, message: saved.message })
      // save 内部已做过一次握手校验，直接复用其结果给「连接可用性」，
      // 并置位 autoVerified，避免 autoVerify effect 再发一次重复请求。
      setAvailability({ ok: saved.ok, code: saved.code, message: saved.message })
      autoVerified.current = true
      setApiKey('')
      const next = await secretsApi.status(new AbortController().signal)
      onChanged(next instanceof Error ? null : next)
    })()
  }

  /** 用当前生效的 Key 重新校验。 */
  const reverify = (): void => {
    setBusy(true)
    setError(null)
    setResult(null)
    void (async () => {
      const checked = await secretsApi.verify(new AbortController().signal)
      setBusy(false)
      if (checked instanceof Error) {
        setError(checked.message)
        return
      }
      setResult(checked)
      // 重新验证的结论同样要同步到「连接可用性」，保持两处一致。
      setAvailability(checked)
    })()
  }

  /** 清除已保存的 Key。 */
  const clear = (): void => {
    setBusy(true)
    setError(null)
    setResult(null)
    setAvailability(null)
    autoVerified.current = false
    void (async () => {
      await secretsApi.clear(new AbortController().signal)
      const next = await secretsApi.status(new AbortController().signal)
      setBusy(false)
      onChanged(next instanceof Error ? null : next)
    })()
  }

  return (
    <div className="lawyer-dialog-mask" role="dialog" aria-modal="true" aria-label="配置元典法规检索">
      <div className="lawyer-dialog lawyer-guide">
        <div className="lawyer-dialog__header">
          <h2 className="lawyer-dialog__title">接上元典法规检索（可选）</h2>
          <button type="button" className="lawyer-dialog__close" aria-label="关闭" onClick={onClose}>
            ✕
          </button>
        </div>

        <p className="lawyer-profile__hint">
          合同审核、案件分析与文书生成查法条和类案时，走的是元典开放平台的 MCP
          工具（<code>mcp__law__*</code> 法规、<code>mcp__case__*</code> 案例）。
          不配也能用——只是法条只能凭模型记忆，输出会全部标注「需验证」。
        </p>

        {status?.configured === true && (
          <div className="lawyer-profile__notice">
            当前已配置：{status.masked ?? '（已保存）'} · {sourceLabel(status.source)}
            <br />
            {availability === null
              ? 'MCP 连接：正在检测…'
              : availability.ok
                ? 'MCP 连接：可用'
                : 'MCP 连接：不可用，可点「重新验证」重试'}
            <br />
            保存位置：{status.path}
          </div>
        )}

        {status?.configured !== true && (
          <>
            <ol className="lawyer-profile__steps">
              <li>打开元典开放平台注册账号；</li>
              <li>在控制台创建 API Key 并复制；</li>
              <li>粘贴到下方输入框保存，立即生效，不用重启。</li>
            </ol>
            <div className="lawyer-guide__links">
              {YUANDIAN_LINKS.map(link => (
                <button
                  key={link.label}
                  type="button"
                  className="lawyer-guide__link"
                  onClick={() => { openExternalUrl(link.url) }}
                >
                  <span className="lawyer-guide__link-label">
                    {link.label}
                    <span className="lawyer-guide__link-arrow" aria-hidden="true">↗</span>
                  </span>
                  <span className="lawyer-guide__link-note">{link.note}</span>
                </button>
              ))}
            </div>
          </>
        )}

        <label className="lawyer-dialog__label" htmlFor="lawyer-yuandian-key">
          {status?.configured === true ? '更换 API Key' : '粘贴元典 API Key'}
        </label>
        <input
          id="lawyer-yuandian-key"
          className="lawyer-dialog__input"
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="sk-…"
          value={apiKey}
          onChange={event => { setApiKey(event.target.value) }}
          disabled={busy}
        />

        {result !== null && (
          <p className={result.ok ? 'lawyer-guide__result lawyer-guide__result--ok' : 'lawyer-guide__result'}>
            {verifyHint(result)}
          </p>
        )}
        {error !== null && <p className="lawyer-profile__error">{error}</p>}

        <div className="lawyer-dialog__actions">
          <button type="button" className="lawyer-profile__link" onClick={onDismiss}>
            不再提醒
          </button>
          {status?.configured === true && (
            <>
              <button type="button" className="lawyer-dialog__cancel" onClick={clear} disabled={busy}>
                清除
              </button>
              <button type="button" className="lawyer-dialog__cancel" onClick={reverify} disabled={busy}>
                {busy ? '验证中…' : '重新验证'}
              </button>
            </>
          )}
          <button type="button" className="lawyer-dialog__cancel" onClick={onClose}>
            暂不配置，继续
          </button>
          <button type="button" className="lawyer-dialog__submit" onClick={save} disabled={busy}>
            {busy ? '保存中…' : '保存并验证'}
          </button>
        </div>
      </div>
    </div>
  )
}

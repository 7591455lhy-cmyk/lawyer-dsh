/**
 * 首启引导第 1 步：先去 DeepSeek 开放平台拿到 API Key（M8.6）。
 *
 * 官方 ui-settings-models 的 DeepSeekOnboardingDialog 只有一个 Key 输入框
 * （并且是 dsh 上游代码，不能改）：没注册过 DeepSeek 的用户看到它时手里
 * 并没有 Key，只能先关掉、自己找地方注册，再回来——首启动线断在这里。
 *
 * 本组件以 settings.onboarding 列表槽的一个**独立步骤**插在它前面
 * （order: -50，官方那步是 0）：先把「去哪注册、在哪建 Key、注意什么」
 * 讲清楚并给出可点链接，用户点「去填写」才 complete()，把控制权交给
 * 官方输入框那一步。槽契约要求每步自带可见外观与 #root inert 所有权，
 * 判定期间渲染 null（不画任何东西、不阻塞）。
 *
 * 只在两种情况下让路（自动 complete）：
 *   1. 用户已看过本引导（lawyer-workbench.apiKeyGuideDone / localStorage）；
 *   2. DeepSeek 凭据已配置（credentials.describe 实时判断）。
 * 两种都自动记为「已看过」，避免配好 Key 后每次空白会话都再问一遍。
 */
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { openExternalUrl } from './externalLink.ts'

/** 凭据查询的兜底超时（毫秒；超时按「未配置」处理，见下方 useEffect）。 */
const CHECK_TIMEOUT_MS = 3000

/** DeepSeek 开放平台的三个入口（注册登录 / 建 Key / 充值）。 */
const PLATFORM_LINKS: readonly { readonly label: string; readonly url: string; readonly note: string }[] = [
  {
    label: '打开 DeepSeek 开放平台',
    url: 'https://platform.deepseek.com/sign_in',
    note: '手机号注册并登录',
  },
  {
    label: '去「API Keys」创建 Key',
    url: 'https://platform.deepseek.com/api_keys',
    note: '点「创建 API Key」，复制后妥善保存',
  },
  {
    label: '充值 / 查看余额',
    url: 'https://platform.deepseek.com/top_up',
    note: '新用户赠额用完后需先充值',
  },
]

/** 引导步骤（owner 侧的 complete 由槽协调器注入）。 */
export interface DeepSeekKeyGuideProps {
  /** 结束本步，把控制权交给下一个引导步骤（官方的 Key 输入框）。 */
  readonly complete: () => void
  /** DeepSeek 凭据是否已配置（查 Host 的 credentials.describe）。 */
  readonly checkKeyConfigured: () => Promise<boolean>
  /** 用户是否已看过本引导。 */
  readonly isGuideDone: () => boolean
  /** 记下「已看过」（settings 通道 + localStorage 双写）。 */
  readonly markGuideDone: () => void
}

/**
 * 首启的 API Key 获取引导。
 * @param props - 槽协调器状态与注入的依赖。
 * @returns 引导弹窗；判定期间或无需引导时为 null。
 */
export function DeepSeekKeyGuide({
  complete,
  checkKeyConfigured,
  isGuideDone,
  markGuideDone,
}: DeepSeekKeyGuideProps) {
  /** null=判定中（槽契约：判定期间渲染 null，不画也不阻塞）。 */
  const [visible, setVisible] = useState<boolean | null>(null)

  // 判定只跑一次：已看过 / 已配置都直接让路，并把「已看过」落盘。
  //
  // 超时保护是必需的：协调器一次只挂载一个步骤，本步不 complete() 后面的
  // 官方 Key 输入框就永远不会出现——那才是真正卡住用户的死路。凭据查询
  // （一次 RPC）迟迟不落定时按「未配置」处理，代价只是多弹一次引导，而
  // 引导里的「去填写」按钮会把控制权交给官方输入框，不会堵死。
  useEffect(() => {
    let settled = false
    const finish = (configured: boolean): void => {
      if (settled) return
      settled = true
      if (configured) {
        markGuideDone()
        complete()
        return
      }
      setVisible(true)
    }
    if (isGuideDone()) {
      complete()
      return
    }
    void checkKeyConfigured().then(finish, () => { finish(false) })
    const timer = setTimeout(() => { finish(false) }, CHECK_TIMEOUT_MS)
    return () => { clearTimeout(timer) }
    // 只在挂载时判定一次；四个回调都是 apply 期构造的稳定引用。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // #root inert 所有权归本步（与官方 OnboardingModal 同款：弹窗期间
  // 主界面不可交互，关闭后恢复原值）。
  useEffect(() => {
    if (visible !== true) return
    const root = document.getElementById('root') as (HTMLElement & { inert: boolean }) | null
    if (root === null) return
    const previous = root.inert
    root.inert = true
    return () => { root.inert = previous }
  }, [visible])

  if (visible !== true) return null

  // 必须 portal 到 body：本组件是 settings.onboarding 列表槽里的一步，被
  // 渲染在 settings 壳（#root 内部）；而下方的 useEffect 会把 #root 置为
  // inert（官方 OnboardingModal 同款，为的是锁住背景）——若不 portal，
  // 我们自己的弹窗也会跟着变 inert，按钮点不动、也没法跳过（首启卡死）。
  // 官方 Modal 正是靠 createPortal 到 body 才不受 #root inert 影响。
  return createPortal(
    <div className="lawyer-dialog-mask" role="dialog" aria-modal="true" aria-label="准备 DeepSeek API Key">
      <div className="lawyer-dialog lawyer-guide">
        <div className="lawyer-dialog__header">
          <h2 className="lawyer-dialog__title">第 1 步：准备一个 DeepSeek API Key</h2>
        </div>

        <p className="lawyer-profile__hint">
          本工作台的模型调用用的是你自己的 DeepSeek API Key——不填就用不了。
          没有 Key 的话按下面三步走，两三分钟就能拿到。
        </p>

        <ol className="lawyer-profile__steps">
          <li>打开 DeepSeek 开放平台，用手机号注册并登录；</li>
          <li>进入「API Keys」→「创建 API Key」，复制生成的 Key（只在创建时完整显示一次）；</li>
          <li>回到这里点「去填写」，把 Key 粘进输入框保存即可。</li>
        </ol>

        <div className="lawyer-guide__links">
          {PLATFORM_LINKS.map(link => (
            <button
              key={link.url}
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

        <p className="lawyer-profile__hint">
          链接会在系统默认浏览器里打开。注册与充值都在那边完成，完成后回到本窗口继续。
        </p>

        <div className="lawyer-dialog__actions">
          <button
            type="button"
            className="lawyer-profile__link"
            onClick={() => {
              markGuideDone()
              complete()
            }}
          >
            我已用其他模型，不再提示
          </button>
          <button
            type="button"
            className="lawyer-dialog__submit"
            onClick={() => {
              markGuideDone()
              complete()
            }}
          >
            去填写 API Key
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}

/**
 * 实务画像配置面板（M8）：claude-for-legal-ZH 的 cold-start-interview 入口。
 *
 * 三层形态对应三种配置深度，取舍见 profileFields.ts 头注释——画像不是配置
 * 表，而是一份给人读的散文式 Markdown，仓库明文禁止把它做成 YAML。
 *
 *   L1 快速配置：结构化表单填高频字段，未填的落 [PLACEHOLDER]（即"留空
 *      按通用标准"），对应仓库访谈脚本的「2 分钟快速」档。
 *   L2 完整问卷：就地分步填完该领域全部可表单化的占位符——商事与诉讼各按
 *      执业身份分成「律师版」与「公司法务版」两套问题链（身份无关的步骤
 *      两版共用，身份专属的步骤各自分叉），答完直接写盘，不发起会话。
 *      表格类内容（审批矩阵、保险清单、种子文件）在末步留「进对话补充」
 *      的进阶入口。
 *   L3 原文直编：Markdown 文本域直达全文，任何字段都能改，也是模型访谈
 *      产出的画像的默认展示形态（避免表单把它覆盖掉）。
 *
 * 画像状态永远实时问 Host（lawyerProfile/status）：画像是模型在会话里写的，
 * 前端无从感知，本地缓存会立刻失真。
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import type { LawyerProfileApi, ProfileStatus } from './profileRpc.ts'
import {
  PRIMARY_PROFILE_DOMAINS,
  PROFILE_DOMAINS,
  findProfileDomain,
  fullProfileFieldsFor,
  hasFullQuestionnaire,
  hasSpecializedFields,
  identityFor,
  mergeFieldsForSave,
  profileFieldsFor,
  profileSteps,
  visibleSteps,
  IDENTITY_STEP,
  type ProfileIdentity,
} from './profileFields.ts'
import { isFormGenerated, parseProfileFields, renderProfileMarkdown } from './profileMarkdown.ts'
import type { ProfileInterviewMode } from './legalZh.ts'

/** 面板 Tab（导出：上层从功能入口进入时可直接定位到完整问卷）。 */
export type ProfileTab = 'quick' | 'interview' | 'raw'

/** 各领域承载执业身份的字段 id（完整问卷首步就写这个键，与 L1 共用）。 */
const IDENTITY_FIELD: Readonly<Record<string, string>> = {
  'commercial-legal': 'practiceSetting',
  'litigation-legal': 'litigationRole',
}

/** 身份选项卡（seed 为点击后写入身份字段的值，因领域的选项措辞而异）。 */
const IDENTITY_CARDS: readonly {
  readonly identity: ProfileIdentity
  readonly label: string
  readonly hint: string
  readonly seeds: Readonly<Record<string, string>>
}[] = [
  {
    identity: 'lawyer',
    label: '执业律师',
    hint: '在律所执业或独立执业，服务多个客户。会多问事项隔离、收费模式、客户汇报与利益冲突排查。',
    seeds: { 'commercial-legal': '个人执业', 'litigation-legal': '律所律师' },
  },
  {
    identity: 'inhouse',
    label: '公司法务',
    hint: '在一家公司里做法务，只服务本单位。会多问审批上报链、重大性阈值、和解权限、保险覆盖与外部律师库。',
    seeds: { 'commercial-legal': '企业法务', 'litigation-legal': '企业法务' },
  },
]

/** 注册 inject 工厂注入 / 父组件传入的 props。 */
export interface PracticeProfileDialogProps {
  /** 初始选中的领域（从功能入口进入时带上）。 */
  readonly initialDomain?: string
  /** 初始 Tab（引导页「完整问卷」传 interview，快速配置传 quick）。 */
  readonly initialTab?: ProfileTab
  /** 关闭面板。 */
  readonly onCancel: () => void
  /** L1/L3 保存成功后回调（父组件据此刷新侧栏卡片状态）。 */
  readonly onSaved?: (domain: string) => void
  /** L2：发起完整访谈会话（新建会话并注入访谈指令）。 */
  readonly onStartInterview: (domain: string, mode: ProfileInterviewMode) => void
  /** Host RPC 封装。 */
  readonly profileApi: LawyerProfileApi
  /** 自定义功能里绑定过的领域（自动纳入列表并标注来源）。 */
  readonly customDomains: readonly string[]
  /** 已跳过引导的领域。 */
  readonly dismissedDomains: readonly string[]
  /** 恢复该领域的画像引导（从已跳过名单里移除）。 */
  readonly onRestoreGuide?: (domain: string) => void
}

/** 一个访谈模式的展示信息。 */
interface ModeOption {
  readonly mode: ProfileInterviewMode
  readonly label: string
  readonly hint: string
  readonly primary: boolean
}

/** L2 Tab 的四个入口（对齐 cold-start-interview 的 argument-hint）。 */
const INTERVIEW_MODES: readonly ModeOption[] = [
  {
    mode: 'quick',
    label: '开始 2 分钟快速配置',
    hint: '角色、执业场景、管辖与审查方向，加上审查指引、上报阈值、责任上限、行文风格的工作默认值',
    primary: true,
  },
  {
    mode: 'full',
    label: '开始 15 分钟完整访谈',
    hint: '真实的审查指引立场（按方向校准）、deal-breaker、带金额阈值的上报矩阵，以及从已签署协议提取的实际立场',
    primary: true,
  },
  {
    mode: 'redo',
    label: '重新访谈（--redo）',
    hint: '画像已存在时重跑一遍，覆盖前先展示与旧版的差异',
    primary: false,
  },
  {
    mode: 'integrations',
    label: '仅重新检测集成',
    hint: '只检测 MCP 工具与文件访问等集成的实际连接状态并汇报，不重跑访谈',
    primary: false,
  },
]

/** 实务画像配置面板：左侧领域列表 + 右侧三层 Tab 工作区。 */
export function PracticeProfileDialog({
  initialDomain,
  initialTab,
  onCancel,
  onSaved,
  onStartInterview,
  profileApi,
  customDomains,
  dismissedDomains,
  onRestoreGuide,
}: PracticeProfileDialogProps) {
  const [domain, setDomain] = useState<string>(initialDomain ?? PRIMARY_PROFILE_DOMAINS[0])
  const [tab, setTab] = useState<ProfileTab>(initialTab ?? 'quick')
  /** 完整问卷的当前步骤下标（步骤集合会随身份变化，越界时按下文收敛）。 */
  const [stepIndex, setStepIndex] = useState(0)
  const [moreOpen, setMoreOpen] = useState(false)
  const [status, setStatus] = useState<ProfileStatus | null>(null)
  const [values, setValues] = useState<Record<string, string>>({})
  const [raw, setRaw] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  /**
   * 首次读取画像后是否保留上层指定的 initialTab。
   * 引导页点「完整问卷」进来时，首次读取不该把它推断回 quick；切到别的
   * 领域之后才恢复自动推断。
   */
  const keepInitialTab = useRef(initialTab !== undefined)

  const meta = findProfileDomain(domain)
  const fields = useMemo(() => profileFieldsFor(domain), [domain])
  /** 当前执业身份（决定完整问卷走律师版还是法务版）。 */
  const identity = useMemo(() => identityFor(domain, values), [domain, values])
  /** 按身份过滤后的完整问卷字段（该领域没有内置问卷时为 undefined）。 */
  const fullFields = useMemo(() => fullProfileFieldsFor(domain, values), [domain, values])
  /** 该身份的全部步骤（含被操作方隐藏的另一本合同手册）。 */
  const allSteps = useMemo(() => profileSteps(fullFields ?? []), [fullFields])
  /** 当前实际要走的步骤（商事按「当前操作方」隐藏另一本手册）。 */
  const steps = useMemo(() => visibleSteps(allSteps, domain, values), [allSteps, domain, values])
  /** 越界收敛后的下标（改选身份或操作方使步骤变少时不会停在空步骤上）。 */
  const safeIndex = Math.min(stepIndex, Math.max(0, steps.length - 1))
  const currentStep = steps[safeIndex]
  /** 当前步要渲染的字段。 */
  const stepFields = useMemo(
    () => currentStep === undefined
      ? []
      : (fullFields ?? []).filter(field => field.step === currentStep),
    [fullFields, currentStep],
  )

  // 身份切换后专属步骤整段改变，回到首步重新走——停在已消失的步骤上会让
  // 用户面对一个空白页。
  useEffect(() => { setStepIndex(0) }, [identity])

  // 领域列表：两个常用领域常驻；自定义功能涉及的领域紧随其后并标注来源；
  // 其余 11 个收在「更多领域」折叠区。
  const customOnly = useMemo(
    () => customDomains.filter(
      item => !PRIMARY_PROFILE_DOMAINS.includes(item) && findProfileDomain(item) !== undefined,
    ),
    [customDomains],
  )
  const moreDomains = useMemo(
    () => PROFILE_DOMAINS.filter(
      item => !PRIMARY_PROFILE_DOMAINS.includes(item.domain) && !customOnly.includes(item.domain),
    ),
    [customOnly],
  )

  // 切换领域时重新向 Host 取状态与正文（画像可能被模型在会话里改写过，
  // 不做本地缓存）。
  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    setLoading(true)
    setError('')
    void (async () => {
      const [nextStatus, content] = await Promise.all([
        profileApi.status(domain, controller.signal),
        profileApi.read(domain, controller.signal),
      ])
      if (cancelled) return
      if (nextStatus instanceof Error) {
        setError(nextStatus.message)
        setLoading(false)
        return
      }
      setStatus(nextStatus)
      const text = content instanceof Error ? '' : content.content
      setRaw(text)
      // 回填分两步：先用 L1 字段集把执业身份读出来，再据此取该身份的完整
      // 字段集读一遍——完整问卷的专属字段键与 L1 不同，两边合并后无论停在
      // 哪个 Tab 都不会丢值。
      const quickValues = parseProfileFields(text, fields)
      const table = fullProfileFieldsFor(domain, quickValues)
      setValues(table === undefined
        ? quickValues
        : { ...quickValues, ...parseProfileFields(text, table) })
      setStepIndex(0)
      // 模型访谈撰写的画像格式自由，解析不出表单元数据时默认停在直编，
      // 避免快速配置把它的内容整个覆盖掉。上层指定了初始 Tab 时首次不推断。
      if (keepInitialTab.current) keepInitialTab.current = false
      else setTab(text === '' || isFormGenerated(text) ? 'quick' : 'raw')
      setLoading(false)
    })()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [domain, fields, profileApi])

  /** 落盘并回查状态（回查而非乐观更新：占位符计数由 Host 判定）。 */
  const persist = async (content: string): Promise<void> => {
    setSaving(true)
    setError('')
    const written = await profileApi.write(domain, content)
    setSaving(false)
    if (written instanceof Error) {
      setError(written.message)
      return
    }
    const refreshed = await profileApi.status(domain)
    if (!(refreshed instanceof Error)) setStatus(refreshed)
    setRaw(content)
    onSaved?.(domain)
  }

  /**
   * L1 保存：渲染 L1 字段后落盘，并把完整问卷里已填的独有项一并带上。
   *
   * 两个 Tab 共用一份 values，只渲染自己的表会让另一张表填过的内容在切
   * Tab 保存时凭空消失（完整问卷有 40+ 个 L1 没有的条目，丢不起）。
   */
  const saveQuick = (): void => {
    const table = mergeFieldsForSave(fields, fullFields ?? [], values)
    void persist(renderProfileMarkdown(`${meta?.label ?? domain}实务画像`, table, values))
  }

  /**
   * L2 保存：只渲染当前身份的字段后落盘。
   *
   * 另一版本的专属字段不写进画像——它们是按身份互斥的，写进去只会让模型
   * 读到一堆与自己身份无关的空占位符。L1 填过而完整问卷没拆到的高频项则
   * 会被带上，避免切 Tab 丢内容。
   */
  const saveFull = (): void => {
    if (fullFields === undefined) return
    const table = mergeFieldsForSave(fullFields, fields, values)
    void persist(renderProfileMarkdown(`${meta?.label ?? domain}实务画像`, table, values, 'full'))
  }

  /** 渲染一个字段控件。 */
  const renderField = (field: (typeof fields)[number]) => (
    <div className="lawyer-profile__field" key={field.id}>
      <label className="lawyer-dialog__label" htmlFor={`profile-${field.id}`}>
        {field.label}
      </label>
      {field.type === 'select' && (
        <select
          id={`profile-${field.id}`}
          className="lawyer-dialog__select"
          value={values[field.id] ?? ''}
          onChange={event => setValues(current => ({ ...current, [field.id]: event.target.value }))}
          disabled={loading || saving}
        >
          <option value="">（留空，按通用标准）</option>
          {(field.options ?? []).map(option => <option key={option} value={option}>{option}</option>)}
        </select>
      )}
      {field.type === 'text' && (
        <input
          id={`profile-${field.id}`}
          type="text"
          className="lawyer-dialog__input"
          placeholder={field.placeholder ?? '留空则按通用标准'}
          value={values[field.id] ?? ''}
          onChange={event => setValues(current => ({ ...current, [field.id]: event.target.value }))}
          disabled={loading || saving}
        />
      )}
      {field.type === 'textarea' && (
        <textarea
          id={`profile-${field.id}`}
          className="lawyer-dialog__input lawyer-profile__textarea"
          placeholder={field.placeholder ?? '留空则按通用标准'}
          rows={2}
          value={values[field.id] ?? ''}
          onChange={event => setValues(current => ({ ...current, [field.id]: event.target.value }))}
          disabled={loading || saving}
        />
      )}
      {field.hint !== undefined && <p className="lawyer-profile__hint">{field.hint}</p>}
    </div>
  )

  /** 领域列表项。 */
  const renderDomain = (item: { domain: string; label: string }, badge?: string) => (
    <button
      key={item.domain}
      type="button"
      className={item.domain === domain
        ? 'lawyer-profile__domain lawyer-profile__domain--active'
        : 'lawyer-profile__domain'}
      onClick={() => setDomain(item.domain)}
    >
      <span>{item.label}</span>
      {badge !== undefined && <span className="lawyer-profile__badge">{badge}</span>}
    </button>
  )

  const groups: string[] = []
  for (const field of fields) {
    if (!groups.includes(field.group)) groups.push(field.group)
  }

  /** 当前问卷步骤内的分组（顺序即字段表里的出现顺序）。 */
  const stepGroups: string[] = []
  for (const field of stepFields) {
    if (!stepGroups.includes(field.group)) stepGroups.push(field.group)
  }

  return (
    <div
      className="lawyer-dialog-mask"
      role="dialog"
      aria-modal="true"
      aria-label="实务画像配置"
      onClick={event => { if (event.target === event.currentTarget) onCancel() }}
    >
      <div className="lawyer-dialog lawyer-profile">
        <div className="lawyer-dialog__header">
          <h2 className="lawyer-dialog__title">实务画像配置</h2>
          <button type="button" className="lawyer-dialog__close" aria-label="关闭" onClick={onCancel}>
            ✕
          </button>
        </div>

        <div className="lawyer-profile__body">
          <aside className="lawyer-profile__domains">
            {PRIMARY_PROFILE_DOMAINS.map(name => {
              const item = findProfileDomain(name)
              return item === undefined ? null : renderDomain(item)
            })}
            {customOnly.map(name => {
              const item = findProfileDomain(name)
              return item === undefined ? null : renderDomain(item, '自定义功能')
            })}
            <button
              type="button"
              className="lawyer-profile__more"
              onClick={() => setMoreOpen(current => !current)}
              aria-expanded={moreOpen}
            >
              {moreOpen ? '▾' : '▸'} 更多领域（{moreDomains.length}）
            </button>
            {moreOpen && moreDomains.map(item => renderDomain(item))}
          </aside>

          <section className="lawyer-profile__main">
            {!hasSpecializedFields(domain) && (
              <p className="lawyer-profile__notice">
                该领域没有内置问卷：请在「L2 完整问卷」里用会话访谈让模型按仓库脚本逐项捕获，或在「原文直编」里直接写。
              </p>
            )}
            {dismissedDomains.includes(domain) && onRestoreGuide !== undefined && (
              <p className="lawyer-profile__notice">
                已跳过该领域的画像引导。
                <button type="button" className="lawyer-profile__link" onClick={() => onRestoreGuide(domain)}>
                  恢复提醒
                </button>
              </p>
            )}

            <div className="lawyer-profile__tabs" role="tablist">
              {([
                ['quick', 'L1 快速配置'],
                ['interview', 'L2 完整问卷'],
                ['raw', 'L3 原文直编'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={tab === key}
                  className={tab === key
                    ? 'lawyer-profile__tab lawyer-profile__tab--active'
                    : 'lawyer-profile__tab'}
                  onClick={() => setTab(key)}
                >
                  {label}
                </button>
              ))}
            </div>

            {error !== '' && <p className="lawyer-profile__error">{error}</p>}

            {tab === 'quick' && (
              <div className="lawyer-profile__pane">
                {loading
                  ? <p className="lawyer-profile__hint">正在读取画像…</p>
                  : groups.map(group => (
                    <div className="lawyer-profile__group" key={group}>
                      <h3 className="lawyer-profile__group-title">{group}</h3>
                      {fields.filter(field => field.group === group).map(renderField)}
                    </div>
                  ))}
                <p className="lawyer-profile__hint">留空的字段将按通用标准处理（画像里落 [PLACEHOLDER]）。</p>
              </div>
            )}

            {tab === 'interview' && fullFields === undefined && (
              <div className="lawyer-profile__pane">
                <p className="lawyer-profile__hint">
                  该领域还没有内置问卷，访谈在会话里进行：模型按 {domain}/skills/
                  cold-start-interview/SKILL.md 的脚本每轮问 2-3 题、需要输入时会等你
                  回答、可随时说「暂停」。完成后由它把画像写入
                  {status === null ? '画像文件' : ` ${status.path}`}。
                </p>
                {INTERVIEW_MODES.map(option => (
                  <div className="lawyer-profile__mode" key={option.mode}>
                    <button
                      type="button"
                      className={option.primary
                        ? 'lawyer-dialog__submit lawyer-profile__mode-btn'
                        : 'lawyer-dialog__cancel lawyer-profile__mode-btn'}
                      onClick={() => onStartInterview(domain, option.mode)}
                      disabled={loading}
                    >
                      {option.label}
                    </button>
                    <p className="lawyer-profile__hint">{option.hint}</p>
                  </div>
                ))}
              </div>
            )}

            {tab === 'interview' && fullFields !== undefined && (
              <div className="lawyer-profile__pane">
                <div className="lawyer-profile__stepbar">
                  <p className="lawyer-profile__step-title">
                    第 {safeIndex + 1}/{steps.length} 步 · {currentStep}
                    <span className="lawyer-profile__identity-tag">
                      {identity === 'inhouse' ? '公司法务版' : '执业律师版'}
                    </span>
                  </p>
                  <div className="lawyer-profile__progress">
                    <div
                      className="lawyer-profile__progress-fill"
                      style={{
                        width: steps.length === 0
                          ? '0%'
                          : `${((safeIndex + 1) / steps.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {currentStep === IDENTITY_STEP && (
                  <div className="lawyer-profile__identity">
                    {IDENTITY_CARDS.map(card => {
                      const active = identity === card.identity
                      const key = IDENTITY_FIELD[domain]
                      return (
                        <button
                          key={card.identity}
                          type="button"
                          aria-pressed={active}
                          className={active
                            ? 'lawyer-profile__identity-card lawyer-profile__identity-card--active'
                            : 'lawyer-profile__identity-card'}
                          onClick={() => {
                            if (key === undefined) return
                            setValues(current => ({
                              ...current,
                              [key]: card.seeds[domain] ?? '',
                            }))
                          }}
                          disabled={loading || saving}
                        >
                          <span className="lawyer-profile__identity-name">{card.label}</span>
                          <span className="lawyer-profile__identity-hint">{card.hint}</span>
                        </button>
                      )
                    })}
                  </div>
                )}

                {loading
                  ? <p className="lawyer-profile__hint">正在读取画像…</p>
                  : stepGroups.map(group => (
                    <div className="lawyer-profile__group" key={group}>
                      <h3 className="lawyer-profile__group-title">{group}</h3>
                      {stepFields.filter(field => field.group === group).map(renderField)}
                    </div>
                  ))}

                <div className="lawyer-profile__step-nav">
                  <button
                    type="button"
                    className="lawyer-dialog__cancel"
                    onClick={() => setStepIndex(Math.max(0, safeIndex - 1))}
                    disabled={loading || saving || safeIndex === 0}
                  >
                    上一步
                  </button>
                  {safeIndex >= steps.length - 1
                    ? (
                      <button
                        type="button"
                        className="lawyer-dialog__submit"
                        onClick={saveFull}
                        disabled={loading || saving}
                      >
                        {saving ? '保存中…' : '保存画像'}
                      </button>
                    )
                    : (
                      <button
                        type="button"
                        className="lawyer-dialog__submit"
                        onClick={() => setStepIndex(safeIndex + 1)}
                        disabled={loading || saving}
                      >
                        下一步
                      </button>
                    )}
                </div>

                <p className="lawyer-profile__hint">
                  表格类内容（审批矩阵、保险清单、已审阅的种子文件）表单放不下，
                  <button
                    type="button"
                    className="lawyer-profile__link"
                    onClick={() => onStartInterview(domain, 'full')}
                    disabled={loading}
                  >
                    进对话让 AI 补充提取
                  </button>
                  。留空的字段按通用标准处理（画像里落 [PLACEHOLDER]）。
                </p>
              </div>
            )}

            {tab === 'raw' && (
              <div className="lawyer-profile__pane">
                <p className="lawyer-profile__hint">
                  这是画像原文，可直接编辑；本工作台所有法律功能在动笔前都会读取它。
                </p>
                <textarea
                  className="lawyer-dialog__input lawyer-profile__raw"
                  value={raw}
                  onChange={event => setRaw(event.target.value)}
                  disabled={loading || saving}
                  spellCheck={false}
                />
              </div>
            )}
          </section>
        </div>

        <div className="lawyer-profile__status">
          {status === null
            ? '画像状态未知'
            : status.exists
              ? status.configured
                ? `已配置 · ${status.path}`
                : `已存在，仍有 ${status.placeholderCount} 处 [PLACEHOLDER] · ${status.path}`
              : `未配置 · ${status.path}`}
        </div>

        <div className="lawyer-dialog__actions">
          <button type="button" className="lawyer-dialog__cancel" onClick={onCancel} disabled={saving}>
            关闭
          </button>
          {tab !== 'interview' && (
            <button
              type="button"
              className="lawyer-dialog__submit"
              onClick={() => { if (tab === 'quick') saveQuick(); else void persist(raw) }}
              disabled={loading || saving}
            >
              {saving ? '保存中…' : '保存画像'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * 实务画像引导的两块 UI（M8）。
 *
 * ProfileGuideDialog：功能入口首次使用时的前置引导。仓库要求画像含
 * [PLACEHOLDER] 时先跑 cold-start-interview，但直接把它塞进任务指令会让
 * 每次发起任务都被访谈卡住——用户选定的口径是「首次使用时弹引导，留空才
 * 按通用标准输出」，于是引导前移到 UI 层，指令层只负责读取已配置的画像。
 *
 * ProfileEntryButton：三个功能表单里的常驻画像入口（引导被跳过或画像未
 * 填完时，用户仍能随时回头配置）。
 */
/** 首次引导的选项回调。 */
export interface ProfileGuideDialogProps {
  /** 领域中文名（文案里提示用户配的是哪一块）。 */
  readonly domainLabel: string
  /** 走完整问卷（打开画像面板的 L2 分步问卷，就地填完即写盘）。 */
  readonly onFullSetup: () => void
  /** 走快速配置（打开画像面板的 L1 表单）。 */
  readonly onQuickSetup: () => void
  /** 留空，按通用标准输出（记入免打扰名单）。 */
  readonly onSkip: () => void
}

/** 功能入口的首次引导小窗：三步说明 + 三条路径。 */
export function ProfileGuideDialog({
  domainLabel,
  onFullSetup,
  onQuickSetup,
  onSkip,
}: ProfileGuideDialogProps) {
  return (
    <div className="lawyer-dialog-mask" role="dialog" aria-modal="true" aria-label="配置实务画像">
      <div className="lawyer-dialog lawyer-profile-guide">
        <div className="lawyer-dialog__header">
          <h2 className="lawyer-dialog__title">先花两分钟，说说你怎么做「{domainLabel}」</h2>
        </div>

        <p className="lawyer-profile__hint">
          本工作台的法律功能会先读取一份「实务画像」——你们团队的立场、阈值与行文习惯。
          没有它也能用，只是每条提醒都是通用口径，读起来像给别人写的。
        </p>

        <ol className="lawyer-profile__steps">
          <li>先选执业身份：执业律师与公司法务是两套问题链——前者问事项隔离、收费与客户汇报，后者问审批上报链、重大性阈值与保险覆盖。</li>
          <li>问的是你实际怎么干活：责任上限给多少、什么情况必须上报、文书什么腔调。</li>
          <li>答不上来的可以留空，缺失项按通用标准处理，随时能回来补。</li>
          <li>画像是一份可编辑的 Markdown，不是配置文件，你完全可以自己改。</li>
        </ol>

        <div className="lawyer-profile__mode">
          <button
            type="button"
            className="lawyer-dialog__submit lawyer-profile__mode-btn"
            onClick={onFullSetup}
          >
            完整问卷（推荐）
          </button>
          <p className="lawyer-profile__hint">
            选完身份后分步填完该身份的问题链（5–7 步），就地完成、不发起会话、不占上下文。
            答不上来的项留空，不会编造。
          </p>
        </div>

        <div className="lawyer-profile__mode">
          <button
            type="button"
            className="lawyer-dialog__cancel lawyer-profile__mode-btn"
            onClick={onQuickSetup}
          >
            快速配置
          </button>
          <p className="lawyer-profile__hint">打开表单直接填高频字段，两三分钟，不发起会话。</p>
        </div>

        <div className="lawyer-dialog__actions">
          <button type="button" className="lawyer-profile__link" onClick={onSkip}>
            留空，按通用标准输出
          </button>
        </div>
      </div>
    </div>
  )
}

/** 功能表单里的常驻画像入口。 */
export interface ProfileEntryButtonProps {
  /** 状态文案（「未配置 · 点此完善」/「已配置」等）。 */
  readonly label: string
  /** 点击后打开画像配置面板。 */
  readonly onClick: () => void
}

/** 表单底部的一行画像状态入口。 */
export function ProfileEntryButton({ label, onClick }: ProfileEntryButtonProps) {
  return (
    <button type="button" className="lawyer-profile__entry" onClick={onClick}>
      <span className="lawyer-profile__entry-icon" aria-hidden="true">▤</span>
      <span>实务画像：{label} ›</span>
    </button>
  )
}

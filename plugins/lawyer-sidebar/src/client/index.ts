/**
 * lawyer-sidebar 浏览器半：向布局壳的全局覆盖槽 shell.overlay（右侧固定
 * 悬浮层，root 作用域）注册功能栏。
 *
 * M6 品牌统一：全站以「摸鱼工作站 · 一站式律师 AI 工作站」替代 DeepSeek 品牌——
 *   - 以更高优先级（priority: -1，升序渲染取首个）的槽位 occupant 遮蔽
 *     ui-brand-official / 本地构建 fallback 注入的鲸鱼标与字标
 *     （sidebar.brand.mark / sidebar.brand.name / conversation.hero.brand.mark）；
 *   - document.title、favicon 与会话 hero 标语（"探索未至之境" 等 locale
 *     文案）由 DOM 替换纠正（Client 插件可操作 DOM；locale.register 对
 *     重复 (ns, locale) 会抛错，ui-conversation 已持有其命名空间）。
 *
 * M4 起页签列表由 lawyer-workbench 设置分节驱动（lawyer-wizard 编辑、
 * $DSH_HOME/settings.yaml 持久化、官方 settings 通道实时同步），内置
 * 入口映射既有三个悬浮窗表单，自定义入口以 /技能名 手势走同一注入
 * 链路；通道不可用时回退默认三入口（M1~M3 零回归）。M6 起功能入口以
 * 圆角矩形卡片呈现、边栏可收缩/展开（见 LawyerSidebar.tsx）。
 *
 * 点击流程：弹出悬浮窗表单（见各 Dialog 组件）→ 提交后新建一个专属空白
 * 会话（M6.2 会话隔离：每次任务一律新开会话，不复用当前空白会话——任务
 * 之间零上下文污染，也规避"指令尚在队列、会话未脱离 blank 态"时第二个
 * 任务混入同一会话的竞态）→ 经 RPC 把会话切到 lawyer agent preset
 * （blank 会话才允许切换；lawyer preset 提供元典 MCP 工具）→ 注入含
 * /技能名 手势的入口指令 + 图片附件（tool-skill 强制加载对应 SKILL.md
 * 全文）。
 *
 * 导出纪律与 dsh 官方 Client 插件一致：具名导出 inject + apply，
 * 禁止 export default；跨插件协作走 cordis 服务而非直接 import。
 */
import type { ClientContext, SessionFace } from '@deepseek-ai/dsh-client-runtime/client'
// 类型副作用：把 ui-layout 声明的槽位键（shell.overlay）合并进 SlotMap。
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
// 类型副作用：把 ui-sidebar（sidebar.brand.mark/name）与 ui-conversation
// （conversation.hero.brand.mark）声明的品牌槽位键合并进 SlotMap。
import type {} from '@deepseek-ai/dsh-client-ui-sidebar/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
// 类型副作用：把 api-remotes 声明的 ConnectionHandle（含 IApiClient 的
// agentPresets 命名空间）、PromptContentPart 与 FileReferenceCandidate
// （含 Context.remote 的 fileReferences 命名空间）合并进本模块的编译面。
import type {
  ConnectionHandle, FileReferenceCandidate, PromptContentPart, SkillEntry,
} from '@deepseek-ai/dsh-api-remotes/client'
import { buildContractReviewPrompt } from './prompt.ts'
import type { ContractReviewRequest } from './ContractReviewDialog.tsx'
import { buildCaseAnalysisPrompt } from './prompt.ts'
import type { CaseAnalysisRequest } from './CaseAnalysisDialog.tsx'
import { buildDocGenerationPrompt } from './prompt.ts'
import type { DocGenerationRequest } from './DocGenerationDialog.tsx'
import { buildCustomEntryPrompt, collectImages } from './prompt.ts'
import type { CustomEntryRequest } from './CustomEntryDialog.tsx'
import { buildDemoReplayPrompt, buildProfileInterviewPrompt } from './prompt.ts'
import { DEMO_ARTIFACTS, hydrateArtifactPaths, type DemoArtifact } from './demoArtifacts.ts'
// 编译期常量：由 build.ps1 的 --define:__LAWYER_DEMO__=true|false 注入
// （-NoDemo 出无演示数据版本）。本文件里所有演示回放入口都以它为条件：
// 常量折叠后 DEMO_ARTIFACTS 的引用随之消失，demoArtifacts.data.ts（131KB
// 预录 docx base64）才会被 tree-shaking 掉，而不是白白打进包里。
declare const __LAWYER_DEMO__: boolean
import type { PickedImage } from './FilePicker.tsx'
import { FALLBACK_ENTRIES, normalizeEntries, type LawyerConfig, type LawyerEntry } from './config.ts'
import { createProfileApi } from './profileRpc.ts'
import { createSecretsApi } from './secretsRpc.ts'
import { DeepSeekKeyGuide } from './DeepSeekKeyGuide.tsx'
import { findProfileDomain } from './profileFields.ts'
import { BRAND_LOGO_PNG_URI } from './brandLogo.ts'
import type { ProfileContext, ProfileInterviewMode } from './legalZh.ts'
import { MoyuBrandName, MoyuHeroMark, SaltedFishMark, LawyerSidebar } from './LawyerSidebar.tsx'

/** 依赖服务：槽注册表、会话、工作区、Host 连接（启动期提供）。 */
export const inject = ['slots', 'sessions', 'workspaces', 'connection']

/** 律师会话使用的 agent preset id（部署于 $DSH_HOME/.agent-presets/lawyer/）。 */
const LAWYER_PRESET = 'lawyer'

/** 样式标记（幂等注入 + 供 client HMR 认领清理）。 */
const STYLE_TAG = 'lawyer-sidebar/entry'

/** 入口样式：沿用 dsw 主题令牌；右侧固定边栏（卡片式，可收缩）+ 悬浮窗表单。 */
const ENTRY_CSS = `
/* 主窗口避让：布局壳根（[data-shell-overlay] 容器的直接父级，即 AppFrame
   的 .frame）按边栏状态让出对应宽度——展开/收缩两态均不覆盖主界面。
   margin-right 过渡与 .lawyer-sidebar 的 width 动画同步（180ms ease），
   并保留 .frame 自身的 grid-template-columns 动画曲线。 */
:has(> [data-shell-overlay] .lawyer-sidebar:not(.lawyer-sidebar--collapsed)) {
  margin-right: 236px;
}
:has(> [data-shell-overlay] .lawyer-sidebar--collapsed) {
  margin-right: 64px;
}
:has(> [data-shell-overlay] .lawyer-sidebar) {
  transition:
    margin-right 180ms ease,
    grid-template-columns var(--ds-transition-duration-slow) var(--ds-ease-in-out);
}
@media (prefers-reduced-motion: reduce) {
  :has(> [data-shell-overlay] .lawyer-sidebar) {
    transition: none;
  }
}
.lawyer-sidebar {
  position: fixed;
  right: 0;
  top: 0;
  bottom: 0;
  width: 236px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: var(--dsw-alias-button-elevated-fill);
  border-left: 1px solid var(--dsw-alias-border-l2);
  box-shadow: -4px 0 16px rgb(0 0 0 / 6%);
  font-family: inherit;
  overflow: hidden;
  transition: width 180ms ease;
}
.lawyer-sidebar--collapsed {
  width: 64px;
}
.lawyer-sidebar__header {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 14px 12px 10px;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}
.lawyer-sidebar--collapsed .lawyer-sidebar__header {
  flex-direction: column;
  gap: 10px;
  padding: 12px 6px 10px;
}
.lawyer-sidebar__brand {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 9px;
}
.lawyer-sidebar--collapsed .lawyer-sidebar__brand {
  flex: none;
}
/* 收缩轨道仅 64px 宽：藏品牌字标图与副标题（溢出裁剪不雅），只留咸鱼标。 */
.lawyer-sidebar--collapsed .lawyer-sidebar__brand-text {
  display: none;
}
.lawyer-sidebar__brand-mark {
  flex: none;
  display: inline-flex;
  color: var(--dsw-alias-brand-text, var(--dsw-alias-label-primary));
}
.lawyer-sidebar__brand-text {
  min-width: 0;
  display: flex;
  flex-direction: column;
  line-height: 1.2;
  white-space: nowrap;
}
/* 品牌主名：「鱼字象形」字标图（高 26px，宽按图自身比例自适应）替代
   原金橙→珊瑚粉渐变文字；alt 提供无障碍名称。 */
.lawyer-sidebar__brand-name {
  display: block;
  height: 26px;
  width: auto;
}
.lawyer-sidebar__brand-sub {
  margin-top: 2px;
  font-size: 10.5px;
  font-weight: 450;
  letter-spacing: 0.06em;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-sidebar__toggle {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  font-family: inherit;
  cursor: pointer;
  transition: background-color 120ms ease, color 120ms ease;
}
.lawyer-sidebar__toggle:hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.lawyer-sidebar__scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 12px;
}
.lawyer-sidebar--collapsed .lawyer-sidebar__scroll {
  padding: 10px 8px;
}
.lawyer-sidebar__section-title {
  margin: 2px 2px 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--dsw-alias-label-tertiary);
  white-space: nowrap;
}
.lawyer-sidebar__section-title:not(:first-child) {
  margin-top: 14px;
}
.lawyer-sidebar__group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.lawyer-sidebar__card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  padding: 9px 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1, transparent);
  color: var(--dsw-alias-label-primary);
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 120ms ease, background-color 120ms ease, transform 120ms ease, box-shadow 120ms ease;
}
.lawyer-sidebar__card:hover {
  border-color: var(--dsw-alias-brand-primary);
  transform: translateY(-1px);
  box-shadow: 0 4px 14px rgb(0 0 0 / 8%);
}
.lawyer-sidebar__card:active {
  transform: translateY(0);
  opacity: 0.88;
}
.lawyer-sidebar__card-icon {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-brand-text, var(--dsw-alias-label-primary));
}
.lawyer-sidebar__card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.lawyer-sidebar__card-title {
  font-size: 13px;
  font-weight: 550;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lawyer-sidebar__card-hint {
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lawyer-sidebar__card-badge {
  flex: none;
  padding: 1px 6px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 999px;
  font-size: 10px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-sidebar__add {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  box-sizing: border-box;
  margin-top: 10px;
  padding: 10px 12px;
  border: 1.5px dashed var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, inherit);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 120ms ease, color 120ms ease, background-color 120ms ease;
}
.lawyer-sidebar__add:hover {
  border-color: var(--dsw-alias-brand-primary);
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-sidebar__add-icon {
  display: inline-flex;
}
.lawyer-sidebar__rail {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}
.lawyer-sidebar__rail-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1, transparent);
  color: var(--dsw-alias-label-primary);
  font-family: inherit;
  cursor: pointer;
  transition: border-color 120ms ease, background-color 120ms ease;
}
.lawyer-sidebar__rail-btn:hover {
  border-color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-sidebar__rail-btn:active {
  opacity: 0.88;
}
.lawyer-sidebar__rail-btn--add {
  border-style: dashed;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-sidebar__empty {
  margin: 8px 4px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--dsw-alias-label-tertiary);
}
/* 品牌遮蔽：注入 dsh 左侧栏 brand 行（.brandName 容器为 inline-flex）与
   会话 hero 的名称/标识（组件见 LawyerSidebar.tsx；标记见下方品牌常量）。 */
/* 品牌主名（dsh 左侧栏品牌行）：「鱼字象形」字标图替代渐变文字
   （高 20px 与原 15px 文字视觉量级相当）。 */
.lawyer-brand-name-main {
  display: block;
  height: 20px;
  width: auto;
}
/* 会话 hero：大咸鱼标染珊瑚粉，大标题（fishHitbox 的紧邻兄弟
   headlineText——:has 结构锚点精确定位）以「鱼字象形」字标图呈现——
   文字本体设为透明占位（DOM 文本仍是"摸鱼工作站"，读屏与复制可读；
   React 重渲染只改文本节点，不影响背景图）；preview 徽标（第二个
   兄弟 span）保持原生样式不受影响。 */
.lawyer-hero-mark {
  color: #FB7185;
}
span:has(> .lawyer-hero-mark) + span {
  background: url("${BRAND_LOGO_PNG_URI}") center / contain no-repeat;
  color: transparent;
}
.lawyer-dialog-mask {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  justify-content: center;
  overflow-y: auto;
  background: rgb(0 0 0 / 45%);
  font-family: inherit;
}
.lawyer-dialog {
  width: min(560px, calc(100vw - 48px));
  max-height: calc(100vh - 64px);
  margin: 32px auto;
  overflow-y: auto;
  box-sizing: border-box;
  padding: 20px 22px;
  border-radius: 14px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-button-elevated-fill);
  box-shadow: 0 18px 48px rgb(0 0 0 / 24%);
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
}
.lawyer-dialog__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.lawyer-dialog__demo {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: -4px 0 14px;
}
.lawyer-dialog__demo-btn {
  flex: none;
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: border-color 120ms ease, background-color 120ms ease;
}
.lawyer-dialog__demo-btn:not(:disabled):hover {
  border-color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-bg-layer-1, transparent);
}
.lawyer-dialog__demo-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.lawyer-dialog__demo-hint {
  min-width: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #2da44e;
}
/* 聊天区文件路径点击打开（M6.3）：weak=混合文本仅手势提示，strong=整段
   即路径的强提示（下划虚线 + 品牌色）。 */
.lawyer-file-hit {
  cursor: pointer;
}
.lawyer-file-hit--strong {
  cursor: pointer;
  color: var(--dsw-alias-brand-text, var(--dsw-alias-label-primary));
  text-decoration: underline dotted;
  text-underline-offset: 3px;
}
.lawyer-file-hit--strong:hover {
  text-decoration-style: solid;
}
.lawyer-dialog__title {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
}
.lawyer-dialog__close {
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, inherit);
  font-size: 14px;
  cursor: pointer;
}
.lawyer-dialog__close:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-dialog__label {
  display: block;
  margin: 14px 0 6px;
  font-weight: 500;
}
.lawyer-dialog__select,
.lawyer-dialog__input {
  width: 100%;
  box-sizing: border-box;
  height: 36px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-fill-normal, transparent);
  color: inherit;
  font-size: 14px;
  font-family: inherit;
}
.lawyer-dialog__select:focus,
.lawyer-dialog__input:focus {
  outline: none;
  border-color: var(--dsw-alias-brand-primary);
}
.lawyer-dialog__textarea {
  width: 100%;
  box-sizing: border-box;
  min-height: 72px;
  padding: 8px 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-fill-normal, transparent);
  color: inherit;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}
.lawyer-dialog__textarea:focus {
  outline: none;
  border-color: var(--dsw-alias-brand-primary);
}
.lawyer-dialog__file-zone {
  border: 1.5px dashed var(--dsw-alias-border-l2);
  border-radius: 10px;
  padding: 10px;
}
.lawyer-dialog__file-zone--active {
  border-color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-dialog__search-row {
  display: flex;
  gap: 8px;
}
.lawyer-dialog__search-input {
  flex: 1;
  min-width: 0;
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-fill-normal, transparent);
  color: inherit;
  font-size: 13px;
  font-family: inherit;
}
.lawyer-dialog__search-input:focus {
  outline: none;
  border-color: var(--dsw-alias-brand-primary);
}
.lawyer-dialog__browse {
  flex: none;
  height: 34px;
  padding: 0 12px;
  border: none;
  border-radius: 8px;
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
}
.lawyer-dialog__browse:not(:disabled):hover {
  opacity: 0.85;
}
.lawyer-dialog__candidates {
  list-style: none;
  margin: 8px 0 0;
  padding: 0;
  max-height: 176px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.lawyer-dialog__candidate {
  display: block;
  width: 100%;
  box-sizing: border-box;
  padding: 5px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.lawyer-dialog__candidate:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-dialog__candidate:disabled {
  cursor: default;
}
.lawyer-dialog__candidate--hint {
  color: var(--dsw-alias-label-tertiary);
  cursor: default;
}
.lawyer-dialog__candidate--hint:hover {
  background: transparent;
}
.lawyer-dialog__candidate--selected {
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-dialog__candidate-row {
  display: flex;
  align-items: stretch;
  gap: 4px;
}
.lawyer-dialog__candidate-row .lawyer-dialog__candidate--grow {
  flex: 1;
  min-width: 0;
}
.lawyer-dialog__candidate-add {
  flex: none;
  padding: 5px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-secondary, inherit);
  font-size: 12px;
  font-family: inherit;
  white-space: nowrap;
  cursor: pointer;
}
.lawyer-dialog__candidate-add:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-primary);
}
.lawyer-dialog__candidate-add:disabled {
  cursor: default;
  opacity: 0.7;
}
.lawyer-dialog__drop-hint {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-dialog__files {
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lawyer-dialog__file {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 8px;
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-dialog__file-name {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 13px;
}
.lawyer-dialog__file-remove {
  flex: none;
  width: 22px;
  height: 22px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  cursor: pointer;
}
.lawyer-dialog__file-remove:not(:disabled):hover {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-border-l2);
}
.lawyer-dialog__notice {
  overflow-wrap: anywhere;
  margin: 10px 0 0;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-dialog__strictness {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.lawyer-dialog__strictness-option {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 8px;
  cursor: pointer;
}
.lawyer-dialog__strictness-option input {
  accent-color: var(--dsw-alias-button-primary-fill);
  margin-top: 2px;
}
.lawyer-dialog__strictness-name {
  display: block;
  font-weight: 500;
}
.lawyer-dialog__strictness-hint {
  display: block;
  font-size: 12px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-dialog__advanced-toggle {
  display: block;
  width: 100%;
  margin-top: 14px;
  padding: 6px 0;
  border: none;
  border-top: 1px dashed var(--dsw-alias-border-l2);
  background: transparent;
  color: var(--dsw-alias-label-secondary, inherit);
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.lawyer-dialog__advanced-toggle:not(:disabled):hover {
  color: var(--dsw-alias-label-primary);
}
.lawyer-dialog__advanced {
  padding: 10px 0 4px;
}
.lawyer-dialog__skill-option {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 8px;
  cursor: pointer;
}
.lawyer-dialog__skill-option:hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-dialog__skill-option input {
  accent-color: var(--dsw-alias-button-primary-fill);
  margin-top: 2px;
}
.lawyer-dialog__skill-category {
  display: inline-block;
  margin-right: 8px;
  padding: 0 6px;
  border-radius: 4px;
  background: var(--dsw-alias-interactive-bg-hover);
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-dialog__skill-name {
  display: inline-block;
  font-weight: 500;
  font-size: 13px;
}
.lawyer-dialog__actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 18px;
}
.lawyer-dialog__cancel,
.lawyer-dialog__submit {
  height: 34px;
  padding: 0 16px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  cursor: pointer;
}
.lawyer-dialog__cancel {
  background: transparent;
  color: var(--dsw-alias-label-primary);
}
.lawyer-dialog__cancel:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-dialog__submit {
  background: var(--dsw-alias-button-primary-fill);
  /* 主按钮文字必须用 label-primary-foreground（亮主题=白/暗主题=近黑），
     与 dsh 官方 Button.primary / primaryButton 同款。之前误用
     brand-primary-invert：它在亮主题下是 bluish-1000（近黑），落到近黑
     底上就是黑字压黑底、文字不可读。 */
  color: var(--dsw-alias-label-primary-foreground, #fff);
  font-weight: 500;
}
.lawyer-dialog__submit:not(:disabled):hover {
  background: var(--dsw-alias-button-primary-hover);
}
.lawyer-dialog__cancel:disabled,
.lawyer-dialog__submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
/* 自定义入口通用表单（M8：按配置字段渲染） */
.lawyer-dialog__field + .lawyer-dialog__field {
  margin-top: 2px;
}
.lawyer-dialog__options {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.lawyer-dialog__option {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
}
.lawyer-dialog__option input {
  accent-color: var(--dsw-alias-button-primary-fill);
}

/* ── M8 实务画像 ──────────────────────────────────────────────────────────
   配置类操作用品牌橙高亮，与任务入口的中性色区分开——传达「这是一次性
   配置，不是日常任务」。橙值与品牌安全帽图标一致（#E8833A），不跟主题
   令牌，亮暗两主题下都保持同一品牌识别。 */
.lawyer-sidebar__dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  margin-left: 6px;
  border: 1px solid #E8833A;
  border-radius: 50%;
  vertical-align: middle;
}
.lawyer-sidebar__dot--on {
  background: #E8833A;
}
.lawyer-profile {
  width: min(760px, calc(100vw - 48px));
}
.lawyer-profile__body {
  display: flex;
  gap: 16px;
  margin-top: 12px;
}
.lawyer-profile__domains {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 0 0 190px;
}
.lawyer-profile__domain {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
  padding: 8px 10px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.lawyer-profile__domain:not(:disabled):hover {
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-profile__domain--active {
  background: rgb(232 131 58 / 10%);
  border-color: rgb(232 131 58 / 35%);
  color: var(--dsw-alias-label-primary);
  font-weight: 500;
}
.lawyer-profile__badge {
  flex: none;
  padding: 1px 5px;
  border-radius: 4px;
  background: rgb(232 131 58 / 14%);
  color: #C96A28;
  font-size: 10px;
}
.lawyer-profile__more {
  margin-top: 4px;
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
}
.lawyer-profile__more:not(:disabled):hover {
  color: var(--dsw-alias-label-primary);
}
.lawyer-profile__main {
  flex: 1 1 auto;
  min-width: 0;
}
.lawyer-profile__tabs {
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--dsw-alias-border-l2);
}
.lawyer-profile__tab {
  padding: 7px 12px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
}
.lawyer-profile__tab--active {
  border-bottom-color: #E8833A;
  color: var(--dsw-alias-label-primary);
  font-weight: 500;
}
.lawyer-profile__pane {
  padding-top: 12px;
}
.lawyer-profile__group {
  padding: 10px 12px;
  margin-bottom: 10px;
  border-radius: 10px;
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-profile__group-title {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: var(--dsw-alias-label-secondary);
}
.lawyer-profile__field + .lawyer-profile__field {
  margin-top: 10px;
}
.lawyer-profile__hint {
  margin: 6px 0 0;
  font-size: 11px;
  line-height: 1.6;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-profile__textarea {
  min-height: 54px;
  resize: vertical;
}
.lawyer-profile__raw {
  min-height: 260px;
  resize: vertical;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.6;
}
.lawyer-profile__notice {
  padding: 8px 10px;
  margin: 0 0 10px;
  border-radius: 8px;
  background: rgb(232 131 58 / 10%);
  font-size: 12px;
  line-height: 1.6;
  color: var(--dsw-alias-label-secondary);
}
.lawyer-profile__error {
  padding: 8px 10px;
  margin: 10px 0 0;
  border-radius: 8px;
  background: rgb(214 69 69 / 10%);
  font-size: 12px;
  line-height: 1.6;
  color: #D64545;
}
.lawyer-profile__mode {
  margin-top: 12px;
}
.lawyer-profile__mode-btn {
  width: 100%;
}
/* ── L2 完整问卷（M8.7）：步骤进度 + 执业身份选项卡 + 步骤导航 ──
   身份卡决定后续步骤走律师版还是法务版，故做成两张大卡而非下拉：
   用户第一眼就要意识到「两套问题链」这件事。 */
.lawyer-profile__stepbar {
  margin-bottom: 12px;
}
.lawyer-profile__step-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 0 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}
.lawyer-profile__identity-tag {
  padding: 1px 7px;
  border-radius: 999px;
  background: rgb(232 131 58 / 14%);
  color: #C96A28;
  font-size: 11px;
  font-weight: 500;
}
.lawyer-profile__progress {
  height: 4px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-profile__progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #F5A76A, #E8833A);
  transition: width .25s ease;
}
.lawyer-profile__identity {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
}
.lawyer-profile__identity-card {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  border: 1.5px solid var(--dsw-alias-border-primary);
  border-radius: 12px;
  background: var(--dsw-alias-bg-primary);
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition: border-color .18s ease, background .18s ease, transform .18s ease;
}
.lawyer-profile__identity-card:not(:disabled):hover {
  border-color: #F5A76A;
  transform: translateY(-1px);
}
.lawyer-profile__identity-card--active {
  border-color: #E8833A;
  background: rgb(232 131 58 / 8%);
}
.lawyer-profile__identity-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--dsw-alias-label-primary);
}
.lawyer-profile__identity-card--active .lawyer-profile__identity-name {
  color: #C96A28;
}
.lawyer-profile__identity-hint {
  font-size: 11px;
  line-height: 1.6;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-profile__step-nav {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 14px;
}
.lawyer-profile__step-nav .lawyer-dialog__submit,
.lawyer-profile__step-nav .lawyer-dialog__cancel {
  min-width: 96px;
}
.lawyer-profile__steps {
  margin: 10px 0 0;
  padding-left: 18px;
  font-size: 12px;
  line-height: 1.8;
  color: var(--dsw-alias-label-secondary);
}
.lawyer-profile__status {
  margin-top: 12px;
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-profile__link {
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
  text-decoration: underline;
}
.lawyer-profile__link:not(:disabled):hover {
  color: var(--dsw-alias-label-primary);
}
.lawyer-profile__entry {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 0;
  border: none;
  background: transparent;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-family: inherit;
  cursor: pointer;
}
.lawyer-profile__entry:not(:disabled):hover {
  color: #C96A28;
}
.lawyer-profile__entry-icon {
  color: #E8833A;
}
.lawyer-profile-guide {
  width: min(520px, calc(100vw - 48px));
}
/* ── M8.6 引导弹窗（首启 API Key 引导 / 元典 MCP 注册引导）───────────────
   两块引导共用一套外观：正文下方一列「可点外链」卡片，每个链接一行主
   文案 + 一行说明，右侧 ↗ 提示会跳出应用（走系统浏览器）。 */
.lawyer-guide {
  width: min(600px, calc(100vw - 48px));
}
.lawyer-guide__links {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
}
.lawyer-guide__link {
  display: flex;
  flex-direction: column;
  gap: 2px;
  box-sizing: border-box;
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 10px;
  background: var(--dsw-alias-bg-layer-1, transparent);
  color: var(--dsw-alias-label-primary);
  font-size: 13px;
  font-family: inherit;
  text-align: left;
  cursor: pointer;
  transition: border-color 120ms ease, background-color 120ms ease;
}
.lawyer-guide__link:not(:disabled):hover {
  border-color: var(--dsw-alias-brand-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}
.lawyer-guide__link-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}
.lawyer-guide__link-arrow {
  color: var(--dsw-alias-brand-text, var(--dsw-alias-label-tertiary));
}
.lawyer-guide__link-note {
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-guide__result {
  margin: 10px 0 0;
  padding: 8px 10px;
  border-radius: 8px;
  background: rgb(214 69 69 / 10%);
  font-size: 12px;
  line-height: 1.6;
  color: #D64545;
}
.lawyer-guide__result--ok {
  background: rgb(45 164 78 / 10%);
  color: #2da44e;
}
/* 官方 Key 输入框里补的那一行（DOM 注入，见 installOfficialKeyHint）——
   贴着说明段落后，字号与说明一致，链接用品牌色。 */
.lawyer-guide__hint {
  margin: 6px 0 0;
  font-size: 12px;
  line-height: 1.7;
  color: var(--dsw-alias-label-tertiary);
}
.lawyer-guide__hint-link {
  color: var(--dsw-alias-brand-text, var(--dsw-alias-label-primary));
  text-decoration: underline;
  text-underline-offset: 2px;
}
.lawyer-guide code {
  padding: 1px 4px;
  border-radius: 4px;
  background: var(--dsw-alias-interactive-bg-hover);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 11.5px;
}
@media (max-width: 720px) {
  .lawyer-profile__body {
    flex-direction: column;
  }
  .lawyer-profile__domains {
    flex: none;
    flex-direction: row;
    flex-wrap: wrap;
  }
}
`

/** 幂等注入入口样式（Client 插件可操作 DOM；data-plugin 供 HMR 清理认领）。 */
function injectStyles(): void {
  const marker = `style[data-plugin-css="${STYLE_TAG}"]`
  if (document.querySelector(marker) !== null) return
  const tag = document.createElement('style')
  tag.dataset.plugin = 'lawyer-sidebar'
  tag.dataset.pluginCss = STYLE_TAG
  tag.textContent = ENTRY_CSS
  document.head.appendChild(tag)
}

/** 品牌名称与副标题（全站统一）。 */
const BRAND_NAME = '摸鱼工作站'
const BRAND_SUBTITLE = '一站式律师 AI 工作站'
const BRAND_TITLE = `${BRAND_NAME} · ${BRAND_SUBTITLE}`

/**
 * 会话 hero 与 document.title 的 DeepSeek 文案 → 品牌文案映射（整串 trim
 * 匹配，避免误伤包含相同子串的正常消息文本；hero.headline / hero.preview
 * 属于 ui-conversation 的 locale 命名空间——重复注册同一 (ns, locale) 会
 * 抛错，故走 DOM 文本替换）。
 */
const DEEPSEEK_TEXT_REPLACEMENTS: Readonly<Record<string, string>> = {
  // hero.headline（中/英）
  '探索未至之境': BRAND_NAME,
  'Into the Unknown': BRAND_NAME,
  // hero.preview 徽标 → 副标题（中/英）
  '预览版': BRAND_SUBTITLE,
  'Preview': BRAND_SUBTITLE,
  // 构建期注入的 document.title（official / local 两类构建产物）
  'DeepSeek Harness': BRAND_TITLE,
  'DSH Local Build': BRAND_TITLE,
}

/** 品牌 favicon（data URI，橙色圆角底 + 白色可爱躺平咸鱼）。 */
const BRAND_FAVICON_URI = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">'
    + '<rect width="24" height="24" rx="6" fill="#F59E0B"/>'
    + '<ellipse cx="10.6" cy="9.4" rx="6.4" ry="4.6" stroke="#fff" stroke-width="1.4"/>'
    + '<path d="M16.8 9.4l2.8-2c.3-.21.7.02.7.37v3.26c0 .35-.4.58-.7.37l-2.8-2Z" fill="#fff"/>'
    + '<path d="M6.9 9.1c.45.45 1.1.45 1.55 0M9.9 9.1c.45.45 1.1.45 1.55 0" stroke="#F59E0B" stroke-width="1.1" stroke-linecap="round"/>'
    + '<circle cx="8.4" cy="11" r=".7" stroke="#F59E0B" stroke-width="1"/>'
    + '<circle cx="5.6" cy="10.6" r=".75" fill="#fff" opacity=".5"/>'
    + '<path d="M13 7.2c.7-.55 1.6-.55 2.3 0" stroke="#fff" stroke-width="1" stroke-linecap="round" opacity=".6"/>'
    + '<path d="M3.2 17.6c.9-.8 1.9-.8 2.8 0s1.9.8 2.8 0 1.9-.8 2.8 0 1.9.8 2.8 0 1.9-.8 2.8 0" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/>'
    + '</svg>',
)}`

/** 单个文本节点命中映射表时替换（nodeValue 含首尾空格则原样保留）。 */
function patchDeepSeekText(node: Node): void {
  if (node.nodeType !== Node.TEXT_NODE) return
  const raw = node.nodeValue
  if (raw === null || raw.trim() === '') return
  // title 文本：dsh 切会话时会动态拼接"会话名 — DSH Local Build"，整串
  // 匹配不上——title 内做子串替换（M6.4 修复品牌标题被拼接串带回）。
  const parent = node.parentElement as HTMLElement | null
  if (parent !== null && parent.tagName === 'TITLE') {
    const patched = raw
      .replaceAll('DeepSeek Harness', BRAND_TITLE)
      .replaceAll('DSH Local Build', BRAND_TITLE)
    if (patched !== raw) node.nodeValue = patched
    return
  }
  const replacement = DEEPSEEK_TEXT_REPLACEMENTS[raw.trim()]
  // 已是品牌文案时跳过，保证 Observer 修改自身触发的回调收敛。
  if (replacement !== undefined && raw.trim() !== replacement) {
    node.nodeValue = raw.replace(raw.trim(), replacement)
  }
}

/** 对子树内的全部文本节点跑一遍替换（新增节点 / 初始扫描）。 */
function patchDeepSeekTree(root: Node): void {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let current = walker.nextNode()
  while (current !== null) {
    patchDeepSeekText(current)
    current = walker.nextNode()
  }
}

/**
 * 品牌落地：document.title、favicon、hero 文案（DOM 替换 + MutationObserver
 * 持续纠正 React 重渲染）与三个品牌槽位的遮蔽注册（priority: -1——single
 * 槽位按 priority 升序取首个渲染者，official 品牌插件默认 0，故 -1 即
 * 胜出；本地构建无 official 插件时同样以注册者身份替换 fallback 鲸鱼标）。
 * @param ctx - 客户端根上下文。
 */
function applyBranding(ctx: ClientContext): void {
  // 1) 文档标题与 favicon（Electron 壳的窗口标题由 packaging/main.js 设置）。
  document.title = BRAND_TITLE
  const icon = document.querySelector<HTMLLinkElement>('link[rel="icon"], link[rel="shortcut icon"]')
  if (icon !== null) {
    icon.href = BRAND_FAVICON_URI
  } else {
    const created = document.createElement('link')
    created.rel = 'icon'
    created.href = BRAND_FAVICON_URI
    document.head.appendChild(created)
  }

  // 2) hero / 标题文案：初始扫描 + Observer 持续纠正（observe 自身修改会
  //    再次进入回调，但“已是品牌文案”分支保证收敛，无循环）。
  patchDeepSeekTree(document.documentElement)
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        patchDeepSeekText(mutation.target)
      } else if (mutation.type === 'childList') {
        for (const added of mutation.addedNodes) {
          if (added.nodeType === Node.TEXT_NODE) {
            patchDeepSeekText(added)
          } else if (added.nodeType === Node.ELEMENT_NODE) {
            patchDeepSeekTree(added)
          }
        }
      }
    }
  })
  observer.observe(document.documentElement, { subtree: true, childList: true, characterData: true })
  ctx.on('dispose', () => { observer.disconnect() })

  // 3) 品牌槽位遮蔽：声明感知注册（不依赖与 ui-sidebar / ui-conversation
  //    的相对加载顺序）。名称槽渲染「摸鱼工作站 + 副标题」横排（容器
  //    .brandName 为 inline-flex，见 ui-sidebar SidebarRoot）。
  ctx.slots.inject('sidebar.brand.mark', () => ctx.slots.register(
    { name: 'sidebar.brand.mark', priority: -1 },
    SaltedFishMark,
  ))
  ctx.slots.inject('sidebar.brand.name', () => ctx.slots.register(
    { name: 'sidebar.brand.name', priority: -1 },
    MoyuBrandName,
  ))
  ctx.slots.inject('conversation.hero.brand.mark', () => ctx.slots.register(
    { name: 'conversation.hero.brand.mark', priority: -1 },
    MoyuHeroMark,
  ))
}

// ── 聊天区文件路径点击打开（M6.3，M6.4 修复）───────────────────────────────
//
// 模型输出（如合同审核的"审核报告已保存至 D:\...\.docx"）在 dsh 聊天里是
// 纯文本/行内代码，原生仅用户消息的 @ 提及可点击。这里以事件委托补齐：
// 点击命中文件路径文本时经 ctx.workspaces.openPath（Host 的 host.openPath
// RPC，系统默认程序打开）。实现不改动 harness 的 DOM 结构——只用
// MutationObserver 给命中路径的文本父元素加 class（视觉提示），点击定位
// 用 caretRangeFromPoint。
//
// M6.4 修复：路径 token 需兼容 dsh 引用形态——@ 前缀与 @"含空格路径"
// 引号包裹（旧实现按空白扩展 token，@ 前缀破坏 ^盘符 锚定、空格截断
// 引号路径，导致点击无反应）；click 改 capture 阶段监听，防 harness
// 容器 stopPropagation 吞掉冒泡。

// ── M8.6：官方 Key 输入框里的「去哪弄 Key」提示 ────────────────────────────
//
// 官方 DeepSeekOnboardingDialog 是 dsh 上游代码，只有一个 Key 输入框，屏幕
// 上没有任何「去哪注册 / 在哪创建」的出口。上面那一步引导（order -50）已经
// 把完整三步讲过，但用户也可能是关掉引导、稍后从 Settings → Models 回来，
// 那时同样需要这个出口。
//
// 故再用 DOM 注入补一条紧凑提示（Client 插件可操作 DOM，与品牌遮蔽同机制）：
// 按窗口标题与说明文案定位官方弹窗，在说明段落后插一行链接。定位失败
// （上游改文案 / 换语言）就什么都不做——纯增强，不会把原生流程改坏。

/** 官方首启 Key 窗口的标题（中/英；aria-label 与标题节点同源）。 */
const OFFICIAL_KEY_WINDOW_TITLES: readonly string[] = [
  '添加一个 API Key 开始使用',
  'Add an API key to get started',
]

/** 官方首启 Key 窗口的说明文案（中/英；提示插在它后面）。 */
const OFFICIAL_KEY_WINDOW_DESCRIPTIONS: readonly string[] = [
  '配置 DeepSeek 官方模型，即可开始使用。',
  'Configure the official DeepSeek provider to start building.',
]

/** 已处理过的弹窗标记（幂等，同时切断 Observer 自身修改引发的回流）。 */
const KEY_HINT_FLAG = 'data-lawyer-key-hint'

/** 在子树内找文案命中官方说明的段落（整串 trim 匹配，避免误伤）。 */
function findDescriptionParagraph(root: Element): Element | null {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let current = walker.nextNode()
  while (current !== null) {
    const text = current.nodeValue?.trim() ?? ''
    if (OFFICIAL_KEY_WINDOW_DESCRIPTIONS.includes(text)) {
      const parent = current.parentElement
      if (parent === null) return null
      return parent.closest('p') ?? parent
    }
    current = walker.nextNode()
  }
  return null
}

/** 构造要插入的那一行提示（三个可点外链；走系统浏览器打开）。 */
function buildKeyHint(): HTMLElement {
  const hint = document.createElement('p')
  hint.className = 'lawyer-guide__hint'
  hint.append('还没有 Key？去 DeepSeek 开放平台注册并创建即可（')
  const links: readonly (readonly [string, string])[] = [
    ['注册 / 登录', 'https://platform.deepseek.com/sign_in'],
    ['创建 API Key', 'https://platform.deepseek.com/api_keys'],
    ['充值', 'https://platform.deepseek.com/top_up'],
  ]
  links.forEach(([label, url], index) => {
    if (index > 0) hint.append(' · ')
    const anchor = document.createElement('a')
    anchor.className = 'lawyer-guide__hint-link'
    anchor.href = url
    anchor.target = '_blank'
    anchor.rel = 'noopener noreferrer'
    anchor.textContent = label
    hint.append(anchor)
  })
  hint.append('）。')
  return hint
}

/** 给官方首启 Key 窗口补一行「去哪弄 Key」的提示（幂等，失败静默）。 */
function installOfficialKeyHint(ctx: ClientContext): void {
  const patch = (): void => {
    for (const dialog of document.querySelectorAll('[role="dialog"]')) {
      if (dialog.hasAttribute(KEY_HINT_FLAG)) continue
      dialog.setAttribute(KEY_HINT_FLAG, '1')
      const ariaLabel = dialog.getAttribute('aria-label')?.trim() ?? ''
      if (!OFFICIAL_KEY_WINDOW_TITLES.includes(ariaLabel)) continue
      const description = findDescriptionParagraph(dialog)
      const parent = description?.parentElement
      if (description === null || parent === undefined || parent === null) continue
      parent.insertBefore(buildKeyHint(), description.nextSibling)
    }
  }
  patch()
  const observer = new MutationObserver(patch)
  observer.observe(document.body, { subtree: true, childList: true, characterData: true })
  ctx.on('dispose', () => { observer.disconnect() })
}

/** 路径 token 全局正则：@?"..."（引号内允许空格）｜@?'...'｜@?裸路径｜UNC。 */
const FILE_PATH_TOKEN_RE = /@?"(?:[A-Za-z]:[\\/][^"\n]*|\\\\[^"\n]*)"?|@?'(?:[A-Za-z]:[\\/][^'\n]*|\\\\[^'\n]*)'?|@?(?:[A-Za-z]:[\\/]|\\\\)[^\s`'“”‘’()[\]【】{}<>:"|,，。；、！？*_~]*/gu

/** 路径核心形态（剥壳后）：盘符或 UNC 绝对路径。 */
const FILE_PATH_CORE_RE = /^(?:[A-Za-z]:[\\/].+|\\\\.+)$/su

/** 常见文档/图片/数据扩展名（避免把目录或无扩展串误当文件）。 */
const FILE_EXT_RE = /\.(?:docx?|pdf|md|txt|xlsx?|pptx?|csv|png|jpe?g|gif|webp|bmp|html?|json|xml|zip|7z|rar|py|js|mjs|cjs|ts|tsx|ps1|bat|cmd|yaml|yml)$/iu

/**
 * 把路径 token 规范化为可直接打开的绝对路径：剥 @ 引用前缀、配对包裹
 * 引号与尾部标点，再验证核心形态与扩展名；不合格返回 null。
 */
function normalizePathToken(token: string): string | null {
  let candidate = token.trim()
  if (candidate.startsWith('@')) candidate = candidate.slice(1)
  if (candidate.length >= 2) {
    const first = candidate[0] ?? ''
    const last = candidate[candidate.length - 1] ?? ''
    if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
      candidate = candidate.slice(1, -1)
    }
  }
  // 引号可选包裹未闭合时残端处理 + 句尾标点剥除。
  candidate = candidate.replace(/^["']|["']$/gu, '').replace(/[.,;:!?；，。]+$/u, '')
  if (candidate === '' || !FILE_PATH_CORE_RE.test(candidate)) return null
  if (!FILE_EXT_RE.test(candidate)) return null
  return candidate
}

/** 文本节点是否包含（或整串是）可打开的文件路径；返回标记强度。 */
function classifyTextNode(text: string): 'strong' | 'weak' | null {
  const trimmed = text.trim()
  if (trimmed === '') return null
  FILE_PATH_TOKEN_RE.lastIndex = 0
  const matches = trimmed.match(FILE_PATH_TOKEN_RE)
  if (matches === null) return null
  // 整段剥壳后就是一个带扩展名的完整路径 → strong（下划虚线强提示）。
  if (matches.length === 1 && normalizePathToken(trimmed) !== null) return 'strong'
  return 'weak'
}

/** 给文本节点的父元素打上命中 class（幂等）。 */
function markOpenableText(node: Node): void {
  if (node.nodeType !== Node.TEXT_NODE) return
  const parent = node.parentElement
  if (parent === null) return
  const kind = classifyTextNode(node.nodeValue ?? '')
  if (kind === 'strong') parent.classList.add('lawyer-file-hit--strong')
  else if (kind === 'weak') parent.classList.add('lawyer-file-hit')
}

/** 子树内全部文本节点跑一遍标记。 */
function markOpenableTree(root: Node): void {
  if (root.nodeType === Node.TEXT_NODE) { markOpenableText(root); return }
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT)
  let current = walker.nextNode()
  while (current !== null) {
    markOpenableText(current)
    current = walker.nextNode()
  }
}

/**
 * 安装聊天区路径点击打开支持（事件委托 + 视觉标记 observer）。
 * @param ctx - 客户端根上下文（workspaces.openPath + dispose 清理）。
 */
function installChatPathLinks(ctx: ClientContext): void {
  let lastOpenAt = 0
  const handleClick = (event: MouseEvent): void => {
    if (Date.now() - lastOpenAt < 500) return
    const target = event.target
    if (!(target instanceof Element)) return
    // 交互控件自身的点击不劫持（按钮/链接/输入框/mention chip 等）。
    if (target.closest('button, a, input, textarea, select, [contenteditable]') !== null) return
    // caret 定位点击处字符（Chromium / 标准 API 双兼容）。
    let container: Node | undefined
    let offset = 0
    if (typeof document.caretRangeFromPoint === 'function') {
      const range = document.caretRangeFromPoint(event.clientX, event.clientY)
      if (range !== null) { container = range.startContainer; offset = range.startOffset }
    } else if (typeof document.caretPositionFromPoint === 'function') {
      const position = document.caretPositionFromPoint(event.clientX, event.clientY)
      if (position !== null) { container = position.offsetNode; offset = position.offset }
    }
    if (container === undefined || container.nodeType !== Node.TEXT_NODE) return
    const text = container.nodeValue ?? ''
    if (offset < 0 || offset > text.length) return
    // 全局正则找覆盖点击位置（含边界）的路径 token——兼容 @ 前缀与
    // @"含空格路径" 引号形态（按空白扩展 token 会把这两种形态截坏）。
    FILE_PATH_TOKEN_RE.lastIndex = 0
    let match: RegExpExecArray | null
    while ((match = FILE_PATH_TOKEN_RE.exec(text)) !== null) {
      if (match.index > offset) break
      if (offset <= match.index + match[0].length) {
        const path = normalizePathToken(match[0])
        if (path !== null) {
          lastOpenAt = Date.now()
          void ctx.workspaces.openPath(path).catch((error: unknown) => {
            console.warn(`[lawyer-sidebar] 打开文件失败（${path}）：${
              error instanceof Error ? error.message : String(error)
            }`)
          })
        }
        break
      }
    }
  }
  // capture 阶段监听：harness 容器（如消息卡片）可能 stopPropagation 吞掉
  // 冒泡，捕获阶段先于任何目标处理器触发。
  document.addEventListener('click', handleClick, true)

  markOpenableTree(document.body)
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      if (mutation.type === 'characterData') {
        const parent = mutation.target.parentElement
        if (parent !== null) parent.classList.remove('lawyer-file-hit', 'lawyer-file-hit--strong')
        markOpenableText(mutation.target)
      } else if (mutation.type === 'childList') {
        for (const added of mutation.addedNodes) {
          if (added.nodeType === Node.TEXT_NODE) markOpenableText(added)
          else if (added.nodeType === Node.ELEMENT_NODE) markOpenableTree(added)
        }
      }
    }
  })
  observer.observe(document.body, { subtree: true, childList: true, characterData: true })
  ctx.on('dispose', () => {
    document.removeEventListener('click', handleClick, true)
    observer.disconnect()
  })
}

/** 设置 namespace（与 lawyer-tools/src/index.ts 的常量一致）。 */
const LAWYER_SETTINGS_NAMESPACE = 'lawyer-workbench'

/**
 * settingsScope 服务的鸭子类型视图（真实声明在 dsh-client-ui-settings；
 * 本包 tsconfig 不指向它，运行时经 ctx.inject 按服务键注入——先例见
 * 下方 remote.fileReferences 注释）。只声明本插件用到的成员。
 */
interface SettingsScopeLike {
  getSnapshot(): {
    status: 'loading' | 'ready' | 'unavailable'
    value: LawyerConfig | undefined
  }
  subscribe(listener: () => void): () => void
  /** 写回一个字段（经 api.settings.mutate 持久化到 settings.yaml）。 */
  set(field: string, value: unknown): Promise<void>
}

/** 领域目录名列表的清洗（丢弃非字符串、空串与重复项）。 */
function normalizeDomainList(raw: unknown): readonly string[] {
  if (!Array.isArray(raw)) return []
  const seen = new Set<string>()
  const items: string[] = []
  for (const item of raw) {
    if (typeof item !== 'string') continue
    const trimmed = item.trim()
    if (trimmed === '' || seen.has(trimmed)) continue
    seen.add(trimmed)
    items.push(trimmed)
  }
  return items
}

/**
 * 浏览器半 apply：注入样式，注册槽位占位。
 * @param ctx - 客户端根上下文。
 */
export function apply(ctx: ClientContext): void {
  injectStyles()
  applyBranding(ctx)
  installOfficialKeyHint(ctx)
  installChatPathLinks(ctx)

  const { api } = ctx.get('connection') as ConnectionHandle

  // ── 入口列表数据源（M4：lawyer-workbench 分节的响应式投影）────────────
  //
  // 官方 settings 通道（ui-settings 的 settingsScope 服务）可用时订阅其
  // 快照；不可用（服务缺席、namespace 未注册、非 loopback）时维持回退
  // 默认三入口——M1~M3 行为零回归。getSnapshot 引用稳定，可直接喂给
  // useSyncExternalStore。
  let entriesSnapshot: readonly LawyerEntry[] = FALLBACK_ENTRIES
  const entriesListeners = new Set<() => void>()
  const entriesSource = {
    getSnapshot(): readonly LawyerEntry[] {
      return entriesSnapshot
    },
    subscribe(listener: () => void): () => void {
      entriesListeners.add(listener)
      return () => { entriesListeners.delete(listener) }
    },
  }
  const publishEntries = (): void => {
    for (const listener of entriesListeners) listener()
  }

  // ── 已跳过画像引导的领域（M8：同一分节的 profileDismissed 投影）────────
  let dismissedSnapshot: readonly string[] = []
  const dismissedListeners = new Set<() => void>()
  const dismissedSource = {
    getSnapshot(): readonly string[] {
      return dismissedSnapshot
    },
    subscribe(listener: () => void): () => void {
      dismissedListeners.add(listener)
      return () => { dismissedListeners.delete(listener) }
    },
  }
  const publishDismissed = (): void => {
    for (const listener of dismissedListeners) listener()
  }

  /** settings 通道句柄（写 profileDismissed 用；通道未就绪时为 undefined）。 */
  let settingsScope: SettingsScopeLike | undefined

  /**
   * 持久化「已跳过画像引导」的领域名单（整体替换 profileDismissed 字段）。
   * 写失败只返回 false——这只是免打扰标记，失败不应打断任务流程。
   */
  const persistProfileDismissed = async (domains: readonly string[]): Promise<boolean> => {
    if (settingsScope === undefined) return false
    try {
      await settingsScope.set('profileDismissed', [...domains])
      return true
    } catch {
      return false
    }
  }

  // ── M8.6 元典 MCP 引导 ──────────────────────────────────────────────────
  //
  // 元典 API Key 存在 Host 的 process.env / <dshHome>/lawyer-secrets.json，
  // Client 读不到（浏览器沙箱），状态与写入一律经 lawyerSecrets RPC；
  // 「不再提醒」是纯 UI 状态，存在同一分节的 mcpDismissed 字段。
  const secretsApi = createSecretsApi(ctx)

  /** 「不再提醒元典引导」的响应式投影（settings 通道；不可用即 false）。 */
  const mcpDismissedListeners = new Set<() => void>()
  let mcpDismissedSnapshot = false
  const mcpDismissedSource = {
    getSnapshot(): boolean {
      return mcpDismissedSnapshot
    },
    subscribe(listener: () => void): () => void {
      mcpDismissedListeners.add(listener)
      return () => { mcpDismissedListeners.delete(listener) }
    },
  }
  const publishMcpDismissed = (): void => {
    for (const listener of mcpDismissedListeners) listener()
  }

  /** 持久化「不再提醒元典引导」。 */
  const persistMcpDismissed = async (dismissed: boolean): Promise<boolean> => {
    mcpDismissedSnapshot = dismissed
    publishMcpDismissed()
    if (settingsScope === undefined) return false
    try {
      await settingsScope.set('mcpDismissed', dismissed)
      return true
    } catch {
      return false
    }
  }

  // ── M8.6 首启 API Key 引导的「已看过」标记 ──────────────────────────────
  //
  // 引导是否弹过优先读 settings 分节（跨机器随配置走）；settings 通道不可用
  // （ui-settings 缺席、非 loopback）时退回 localStorage，保证「看过一次就
  // 不再看」在任何部署形态下都成立。
  const API_KEY_GUIDE_STORAGE_KEY = 'lawyer-sidebar:apiKeyGuideDone'
  let apiKeyGuideDone = ((): boolean => {
    try { return localStorage.getItem(API_KEY_GUIDE_STORAGE_KEY) === '1' } catch { return false }
  })()

  /** 记下「首启 API Key 引导已看过」（settings + localStorage 双写）。 */
  const persistApiKeyGuideDone = (): void => {
    apiKeyGuideDone = true
    try { localStorage.setItem(API_KEY_GUIDE_STORAGE_KEY, '1') } catch { /* 隐私模式忽略 */ }
    if (settingsScope === undefined) return
    void settingsScope.set('apiKeyGuideDone', true).catch(() => {})
  }

  /**
   * DeepSeek 模型凭据是否已配置（决定首启引导要不要弹）。
   *
   * 经 Host 的 credentials.describe 实时查询——与官方 onboarding 用的是同一
   * 个事实源，不另立标记，也不缓存（用户可能刚在 Settings → Models 填完）。
   * 两个 ref 都问：部署默认的 DEEPSEEK_API_KEY 与官方派生规则
   * （deriveKeyRef：DEEPSEEK_OFFICIAL_API_KEY）各覆盖一种配置形态。
   * 查询失败一律按「未配置」——引导弹一次不痛，漏弹才痛。
   */
  const DEEPSEEK_CREDENTIAL_REFS = ['DEEPSEEK_API_KEY', 'DEEPSEEK_OFFICIAL_API_KEY']
  const deepSeekKeyConfigured = async (): Promise<boolean> => {
    const credentials = (api as {
      credentials?: {
        describe(payload: { refs: readonly string[] }): Promise<{
          result: {
            ok: boolean
            value?: { credentials?: Record<string, { configured?: boolean } | undefined> }
          }
        }>
      }
    }).credentials
    if (credentials === undefined || typeof credentials.describe !== 'function') return false
    try {
      const response = await credentials.describe({ refs: DEEPSEEK_CREDENTIAL_REFS })
      if (!response.result.ok) return false
      const described = response.result.value?.credentials ?? {}
      return DEEPSEEK_CREDENTIAL_REFS.some(ref => described[ref]?.configured === true)
    } catch {
      return false
    }
  }

  ctx.inject(['settingsScope'], (scopeCtx: ClientContext) => {
    const scope = (scopeCtx as { settingsScope?: { bind(spec: { namespace: string }): unknown } })
      .settingsScope?.bind({ namespace: LAWYER_SETTINGS_NAMESPACE }) as SettingsScopeLike | undefined
    if (scope === undefined) return
    settingsScope = scope
    const update = (): void => {
      const snapshot = scope.getSnapshot()
      // ready 之外的态（loading/unavailable）维持当前快照：loading 先以
      // 默认渲染（就绪后替换），unavailable 即回退默认。
      if (snapshot.status === 'ready' && snapshot.value !== undefined) {
        entriesSnapshot = normalizeEntries(snapshot.value.entries)
        dismissedSnapshot = normalizeDomainList(snapshot.value.profileDismissed)
        // M8.6：两个免打扰标记（settings 通道可用时以它为准）。
        mcpDismissedSnapshot = snapshot.value.mcpDismissed === true
        if (snapshot.value.apiKeyGuideDone === true) apiKeyGuideDone = true
      } else if (snapshot.status === 'unavailable') {
        entriesSnapshot = FALLBACK_ENTRIES
        dismissedSnapshot = []
      }
      publishEntries()
      publishDismissed()
      publishMcpDismissed()
    }
    scope.subscribe(update)
    update()
  })

  /**
   * 把（空白）会话切换到目标 agent preset（Host 仅允许 blank 会话切换）。
   * 内置三入口固定 lawyer；自定义入口可指定自己的 preset（M8）。
   * @param sessionId - 目标会话。
   * @param preset - preset 名（缺省 lawyer）。
   * @returns 是否成功；失败仅记录，调用方据此中止注入。
   */
  const selectPreset = async (sessionId: string, preset: string): Promise<boolean> => {
    try {
      const response = await api.agentPresets.select({ sessionId, agentPreset: preset })
      if (!response.result.ok) {
        console.error(
          `[lawyer-sidebar] 切换到 preset "${preset}" 失败：${response.result.error.message}` +
            `（preset 需部署到 $DSH_HOME/.agent-presets/${preset}/，运行 debug-web.cmd 可自动部署 lawyer）`,
        )
        return false
      }
      // 本地标签同步（Host 的 agent-preset/selected 转发事件也会到达，
      // note 幂等，双写无害）。
      ctx.sessions.noteAgentPreset(sessionId as never, response.result.value.agentPreset)
      return true
    } catch (error) {
      console.error(
        `[lawyer-sidebar] 切换 preset "${preset}" 请求异常：${
          error instanceof Error ? error.message : String(error)
        }`,
      )
      return false
    }
  }

  /** 把入口指令与图片附件排进目标会话的输入队列（失败仅记录）。 */
  const sendParts = async (session: SessionFace, parts: readonly PromptContentPart[]): Promise<void> => {
    const result = await session.prompt([...parts], 'queue')
    if (!result.ok) {
      console.error(
        `[lawyer-sidebar] 注入律师任务指令失败：${result.error.code} ${result.error.message}`,
      )
    }
  }

  /**
   * 在指定会话发起任务：必要时先切 preset（仅 blank 会话允许切换），再注入
   * 指令与附件。preset 为空串表示沿用会话当前 preset、不请求切换（自定义
   * 入口配置为「不切换」时走这条路）。
   */
  const startTaskIn = async (
    sessionId: string,
    parts: readonly PromptContentPart[],
    preset: string = LAWYER_PRESET,
  ): Promise<void> => {
    if (preset !== '') {
      const summary = ctx.sessions.list.getSnapshot().byId[sessionId]
      if (summary === undefined || summary.agentPreset !== preset) {
        if (!await selectPreset(sessionId, preset)) return
      }
    }
    const session = ctx.sessions.binding(sessionId)?.session
    if (session === undefined) {
      console.warn('[lawyer-sidebar] 会话绑定不可用，律师任务指令未注入')
      return
    }
    await sendParts(session, parts)
  }

  /**
   * 强制新建专属会话并注入任务（M6.7 重写）：不再依赖 startSession 订阅
   * 等待——workspaces.startSession 内部的 connectWorkspace 会**复用当前
   * blank 会话**（返回同一 id），current 不变、订阅永远不触发，表现为
   * "新建会话超时，指令未注入"（正是用户实测的"选了工作区点开始仍无反应"）。
   * 现直接 ctx.sessions.create({ workspaceId }) 强制新建（每次任务独立
   * 会话，M6.2 会话隔离），拿到 sessionId 后导航并注入。
   * @param parts - 注入的 prompt 内容。
   * @param workspaceId - 显式目标工作区；缺省按 current→recent 解析。
   * @param preset - 目标 agent preset；缺省 lawyer，空串表示不切换。
   */
  const runWhenSessionReady = async (
    parts: readonly PromptContentPart[],
    workspaceId?: string,
    preset: string = LAWYER_PRESET,
  ): Promise<void> => {
    const wsList = ctx.workspaces.list.getSnapshot()
    let target = workspaceId
    if (target === undefined) {
      const current = ctx.sessions.list.getSnapshot().current
      const currentWs = current !== undefined
        ? wsList.items.find(item => item.sessionIds.includes(current))?.workspaceId
        : undefined
      target = currentWs ?? wsList.recentWorkspaceId
    }
    if (target === undefined) {
      console.warn('[lawyer-sidebar] 无可用工作区，律师任务指令未注入')
      return
    }
    try {
      const sessionId = await ctx.sessions.create({ workspaceId: target })
      await ctx.sessions.open(sessionId)
      await startTaskIn(sessionId, parts, preset)
    } catch (error) {
      console.warn(`[lawyer-sidebar] 新建会话失败：${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /** 把指令文本与图片附件组装为 prompt parts（三入口通用）。 */
  const withImages = (text: string, images: readonly PickedImage[]): PromptContentPart[] => {
    const parts: PromptContentPart[] = [{ type: 'text', text }]
    for (const image of images) {
      parts.push({ type: 'image', mediaType: image.mediaType, data: image.data, name: image.name })
    }
    return parts
  }

  /**
   * 兜底工作区目录名（Host home 下自动创建）。
   *
   * 这条能力不是演示数据，去掉演示数据后必须保留：没有工作区时发起任务会
   * 静默失败（用户表现为"点了没反应"），而打包环境的 Host 目录选择器没有
   * browse 能力，只能由 Electron 主进程预创建目录。目录名随版本改为中性的
   * 「摸鱼工作站-工作区」（旧版叫「摸鱼工作站-演示」，是为开箱演示起的）。
   */
  const FALLBACK_WORKSPACE_DIR_NAME = '摸鱼工作站-工作区'

  /**
   * 确保至少存在一个工作区（M6.7）：干净首启无任何工作区时，此前回放/
   * 任务在入口处静默 console.warn 返回——用户表现为"点开始后毫无反应"。
   * 现改为自动在 Host home 下创建兜底目录并注册为工作区
   * （workspace.create 对已注册目录幂等，重复执行安全）。
   * @returns undefined=已有工作区（保持 startSession 默认选择）；string=
   *   新建工作区 id；null=自动创建失败。
   */
  const ensureFallbackWorkspace = async (): Promise<string | undefined | null> => {
    const items = ctx.workspaces.list.getSnapshot().items
    if (items.length > 0) return undefined
    try {
      // 打包壳经 preload 注入（localStorage，isolated world 跨世界共享）的
      // 兜底工作区目录（Electron 主进程预创建）；打包环境 Host 目录选择器
      // 无 browse 能力，listDirectory 会抛 directory-picker-unavailable，故
      // 不能走 listDirectory/createDirectory。调试环境（浏览器直连，无
      // preload）退回 listDirectory 的 home 兜底。
      // 先后读两个键：新键 dsh.defaultWorkspaceDir，旧键 dsh.demoWorkspaceDir
      // （老版本装的壳注入的，指向「摸鱼工作站-演示」，沿用即可，不重复建目录）。
      const preinjected = (() => {
        try {
          return localStorage.getItem('dsh.defaultWorkspaceDir')
            ?? localStorage.getItem('dsh.demoWorkspaceDir')
        } catch { return null }
      })()
      let dir: string
      if (typeof preinjected === 'string' && preinjected.length > 0) {
        dir = preinjected
      } else {
        const listing = await ctx.workspaces.listDirectory()
        try {
          dir = await ctx.workspaces.createDirectory(listing.home, FALLBACK_WORKSPACE_DIR_NAME)
        } catch {
          // 目录已存在（Host 重复创建报错）时退回拼接路径。
          const sep = listing.home.includes('\\') ? '\\' : '/'
          dir = listing.home + sep + FALLBACK_WORKSPACE_DIR_NAME
        }
      }
      const view = await ctx.workspaces.create({ path: dir })
      return view.workspaceId
    } catch (error) {
      console.warn(`[lawyer-sidebar] 自动创建兜底工作区失败：${
        error instanceof Error ? error.message : String(error)
      }`)
      return null
    }
  }

  /**
   * 通用注入：每次任务新建一个专属空白会话承载（M6.2 会话隔离——
   * 即使当前会话仍为空白也不复用：不同功能/同功能多次执行之间零上下文
   * 污染，且避免"上一任务指令尚在队列、会话未脱离 blank 态"时第二个
   * 任务混入同一会话的竞态）。无工作区时自动建兜底工作区（M6.7）。
   * @param preset - 目标 agent preset（自定义入口可指定；缺省 lawyer）。
   */
  const injectTask = (parts: readonly PromptContentPart[], preset: string = LAWYER_PRESET): void => {
    void (async () => {
      const workspaceId = await ensureFallbackWorkspace()
      if (workspaceId === null) {
        console.warn('[lawyer-sidebar] 暂无工作区且自动创建失败，无法发起律师任务——请先手动创建工作区')
        return
      }
      await runWhenSessionReady(parts, workspaceId, preset)
    })()
  }

  /**
   * 演示回放（M6.3）：部署预录成果文件到工作区（lawyerFiles/save 写
   * .lawyer-uploads/，uploadWorkspaceFile 有 workspaces[0] 兜底；失败降级
   * 为提示行不阻塞）→ 新建专属会话注入回放指令——模型把预录成果原样
   * 作为自己的答复输出，成果以 AI 消息形态呈现，末尾文件路径可点击
   * 打开（installChatPathLinks）。无工作区时自动建兜底工作区（M6.7）。
   *
   * 整体写成条件表达式而不是普通函数：常量折叠时连同 body 里对
   * buildDemoReplayPrompt / hydrateArtifactPaths 的引用一起消失，
   * 这两个函数才会被 tree-shaking 掉（普通函数即使没人调用，esbuild 也不会
   * 删它——demoData.ts 就是这么被顺带留在包里的，见 build.ps1 的注释）。
   */
  const replayDemo: ((artifact: DemoArtifact) => void) | undefined = __LAWYER_DEMO__
    ? (artifact: DemoArtifact): void => {
    void (async () => {
      const workspaceId = await ensureFallbackWorkspace()
      if (workspaceId === null) {
        console.warn('[lawyer-sidebar] 暂无工作区且自动创建失败，无法回放演示成果——请先手动创建工作区')
        return
      }
      const pathsByFile = new Map<string, string>()
      for (const file of artifact.files) {
        const uploaded = await uploadWorkspaceFile(file.fileName, file.contentBase64, new AbortController().signal)
        if (typeof uploaded === 'string') {
          pathsByFile.set(file.fileName, uploaded)
        } else {
          console.warn(`[lawyer-sidebar] 演示成果文件 ${file.fileName} 部署失败：${uploaded.message}`)
        }
      }
      const promptText = buildDemoReplayPrompt(
        artifact.title,
        hydrateArtifactPaths(artifact.markdown, pathsByFile),
      )
      await runWhenSessionReady([{ type: 'text', text: promptText }], workspaceId)
    })()
  } : undefined

  // ── M8 实务画像 ──
  //
  // 画像正文落盘在 Host（<dshHome>/legal-zh/<domain>/CLAUDE.md），Client 不能
  // 读文件系统，状态与正文一律经 lawyerProfile RPC。查失败时返回 undefined
  // 而不是抛错：画像路径只是增强，不该拖慢或打断任务发起。
  const profileApi = createProfileApi(ctx)

  /**
   * 查领域画像状态（Host 实时查文件；画像是模型在会话里写的，前端无从
   * 感知，不能缓存）。
   * @param domain - 领域目录名。
   * @returns 画像状态；RPC 不可用时 undefined。
   */
  const profileStatusOf = async (domain: string): Promise<ProfileContext | undefined> => {
    const result = await profileApi.status(domain, new AbortController().signal)
    if (result instanceof Error) {
      console.warn(`[lawyer-sidebar] 画像状态查询失败，按无画像处理：${result.message}`)
      return undefined
    }
    return {
      path: result.path,
      configured: result.configured,
      placeholderCount: result.placeholderCount,
    }
  }

  /**
   * 发起画像访谈会话（L2）：新建律师模式会话并注入 cold-start-interview
   * 指令，由模型在对话里访谈，并把画像写入 Host 给定的 canonical 路径
   * （指令会硬覆盖技能原文里的 ~/.claude/... 路径）。
   * @param domain - 领域目录名。
   * @param mode - 访谈模式（quick/full/redo/integrations）。
   */
  const submitProfileInterview = (domain: string, mode: ProfileInterviewMode): void => {
    void (async () => {
      const meta = findProfileDomain(domain)
      const status = await profileApi.status(domain, new AbortController().signal)
      if (meta === undefined || status instanceof Error) {
        console.warn(
          `[lawyer-sidebar] 画像访谈未发起：${meta === undefined ? `未知领域 ${domain}` : status.message}`,
        )
        return
      }
      injectTask([{
        type: 'text',
        text: buildProfileInterviewPrompt({
          domain,
          adapter: meta.adapter,
          profilePath: status.path,
          profileExists: status.exists,
          mode,
        }),
      }])
    })()
  }

  /** 合同审核表单提交回调：组装指令与附件，新建律师模式会话后注入。 */
  const submitContractReview = (request: ContractReviewRequest): void => {
    if (__LAWYER_DEMO__ && request.demoReplay === true) {
      const artifact = DEMO_ARTIFACTS['contract-review']
      if (artifact !== undefined) { replayDemo?.(artifact); return }
      console.warn('[lawyer-sidebar] 合同审核的预录成果尚未固化，本次按真实任务执行')
    }
    void (async () => {
      const profile = await profileStatusOf('commercial-legal')
      injectTask(withImages(buildContractReviewPrompt(request, profile), request.images))
    })()
  }

  /** 案件分析表单提交回调：同上（/case-analysis 手势）。 */
  const submitCaseAnalysis = (request: CaseAnalysisRequest): void => {
    if (__LAWYER_DEMO__ && request.demoReplay === true) {
      const artifact = DEMO_ARTIFACTS['case-analysis']
      if (artifact !== undefined) { replayDemo?.(artifact); return }
      console.warn('[lawyer-sidebar] 案件分析的预录成果尚未固化，本次按真实任务执行')
    }
    void (async () => {
      const profile = await profileStatusOf('litigation-legal')
      injectTask(withImages(buildCaseAnalysisPrompt(request, profile), request.images))
    })()
  }

  /** 文书生成表单提交回调：同上（/doc-generation 手势）。 */
  const submitDocGeneration = (request: DocGenerationRequest): void => {
    if (__LAWYER_DEMO__ && request.demoReplay === true) {
      const artifact = DEMO_ARTIFACTS[`doc:${request.docType}`]
      if (artifact !== undefined) { replayDemo?.(artifact); return }
      console.warn(`[lawyer-sidebar] ${request.docType} 的预录成果尚未固化，本次按真实任务执行`)
    }
    void (async () => {
      const profile = await profileStatusOf('litigation-legal')
      injectTask(withImages(buildDocGenerationPrompt(request, profile), request.images))
    })()
  }

  /**
   * 自定义入口表单提交回调（M8 配置驱动）：渲染模板 → 收集图片附件 →
   * 新建专属会话 → 切入口指定的 preset → 注入指令。
   * 指令首行是「法律 adapter（若开启法律事项）→ 主技能 → 附加技能」的
   * 手势串，tool-skill 据此强制加载对应 SKILL.md 全文。
   */
  const submitCustomEntry = (request: CustomEntryRequest): void => {
    const parts: PromptContentPart[] = [{ type: 'text', text: buildCustomEntryPrompt(request) }]
    for (const image of collectImages(request.values)) {
      parts.push({ type: 'image', mediaType: image.mediaType, data: image.data, name: image.name })
    }
    injectTask(parts, request.entry.agentPreset ?? LAWYER_PRESET)
  }

  /**
   * 按 dsh fileReferences 索引搜索当前会话工作区文件（@ 引用同款数据源）。
   * 以当前会话的 cwd 为界（dsh 语义）；无当前会话或 Host 拒绝时返回 undefined。
   */
  const searchWorkspaceFiles = (
    query: string,
    signal: AbortSignal,
  ): Promise<readonly FileReferenceCandidate[] | undefined> => {
    const sessionId = ctx.sessions.list.getSnapshot().current
    if (sessionId === undefined) return Promise.resolve(undefined)
    // dsh 的 Remote 命名空间以独立 Cordis Service 键（'remote.<namespace>'）注册，
    // 不是 ctx.remote 的子属性；ui-reference 走 ctx.remote.fileReferences 是因为
    // 它的注入声明合并了 Context.remote 类型。运行时必须用 ctx.get 取。
    const fileReferences = ctx.get('remote.fileReferences') as
      | { list(sessionId: string, query: string, signal: AbortSignal): Promise<{ ok: boolean; value?: readonly FileReferenceCandidate[] }> }
      | undefined
    if (fileReferences === undefined) return Promise.resolve(undefined)
    return fileReferences.list(sessionId, query, signal).then(
      result => result.ok && result.value !== undefined ? result.value : undefined,
      () => undefined,
    )
  }

  /**
   * 列出当前会话可用的已安装技能目录（dsh skills RPC：含 disable-model-
   * invocation 的技能，modelInvocable=false 标注）。供表单"高级选项"下拉。
   * @returns 技能条目；无当前会话或 Host 拒绝时为 undefined。
   */
  const listInstalledSkills = (): Promise<readonly SkillEntry[] | undefined> => {
    const sessionId = ctx.sessions.list.getSnapshot().current
    if (sessionId === undefined) return Promise.resolve(undefined)
    return api.skills.list({ sessionId }).then(
      result => result.ok ? result.value.skills : undefined,
      () => undefined,
    )
  }

  /**
   * 把浏览器读到的文件内容（base64）上传进当前工作区（Host 侧 lawyerFiles
   * 服务写入 <工作区>/.lawyer-uploads/<fileName>），返回工作区内的绝对路径。
   * 浏览器沙箱拿不到拖入文件的真实路径——写入工作区后模型即可用文件读取
   * 工具读取，无需 Full access。
   * @returns 成功时为绝对路径；失败时为 Error（携带 Host 侧消息）。
   */
  const uploadWorkspaceFile = (
    fileName: string,
    contentBase64: string,
    signal: AbortSignal,
  ): Promise<string | Error> => {
    // 写入目录取当前工作区：优先当前会话所属工作区，退回第一个工作区。
    const sessions = ctx.sessions.list.getSnapshot()
    const currentSession = sessions.current !== undefined
      ? sessions.byId[sessions.current]
      : undefined
    const workspaces = ctx.workspaces.list.getSnapshot().items
    const workspace = workspaces.find(
      item => currentSession !== undefined && item.workspaceId === currentSession.workspaceId,
    ) ?? workspaces[0]
    if (workspace === undefined) return Promise.resolve(new Error('暂无工作区，无法上传合同文件'))

    const { rpc } = ctx.get('connection') as ConnectionHandle & {
      rpc: { call(channel: string, endpoint: string, payload: unknown, signal?: AbortSignal): Promise<{ ok: boolean; value?: unknown; error?: { message?: string } }> }
    }
    return rpc.call(
      '/api',
      'lawyerFiles/save',
      { args: { cwd: workspace.path, fileName, contentBase64 } },
      signal,
    ).then(
      result => {
        if (result.ok && typeof (result.value as { path?: unknown } | undefined)?.path === 'string') {
          return (result.value as { path: string }).path
        }
        const message = !result.ok && result.error !== undefined && typeof result.error.message === 'string'
          ? result.error.message
          : 'lawyerFiles/save 返回异常'
        return new Error(`上传失败：${message}（lawyer-tools 是否已更新到含上传服务的版本？）`)
      },
      error => new Error(`上传请求失败：${error instanceof Error ? error.message : String(error)}`),
    )
  }

  // 声明感知注册：不依赖本插件与 ui-layout 的相对加载顺序。
  // shell.overlay 是布局壳的全局覆盖槽（list、root 作用域）：容器
  // pointer-events: none、直接子元素恢复可点击，专供固定悬浮元素。
  ctx.slots.inject('shell.overlay', () => ctx.slots.register(
    {
      id: 'lawyer-sidebar',
      name: 'shell.overlay',
      inject: () => ({
        submitContractReview,
        submitCaseAnalysis,
        submitDocGeneration,
        submitCustomEntry,
        entriesSource,
        searchWorkspaceFiles,
        uploadWorkspaceFile,
        listInstalledSkills,
        // M8 实务画像：Host RPC 封装 + 已跳过引导的领域名单及其写入。
        profileApi,
        dismissedSource,
        persistProfileDismissed,
        submitProfileInterview,
        // M8.6 元典 MCP 引导：Host RPC 封装 + 「不再提醒」标记及其写入。
        secretsApi,
        mcpDismissedSource,
        persistMcpDismissed,
      }),
    },
    LawyerSidebar,
  ))

  // ── M8.6 首启引导第 1 步：DeepSeek API Key 获取引导 ────────────────────
  //
  // settings.onboarding 是 ui-settings-general 声明的 list 槽，协调器**一次
  // 只挂载一个**有序步骤（按 order 升序），当前步骤 complete() 后才轮到下一
  // 个。官方 DeepSeekOnboardingDialog 的 order 是 0（只有一个 Key 输入框，
  // 且属 dsh 上游代码不可改），故本步以 order -50 插在它前面：先把「去哪
  // 注册、在哪建 Key」讲完，用户点「去填写」才把控制权交给输入框那一步。
  // 内测声明 WelcomeNotice 是 -100，仍在最前。
  ctx.slots.inject('settings.onboarding', () => ctx.slots.register({
    name: 'settings.onboarding',
    id: 'lawyer-deepseek-key-guide',
    order: -50,
    inject: () => ({
      checkKeyConfigured: deepSeekKeyConfigured,
      isGuideDone: () => apiKeyGuideDone,
      markGuideDone: persistApiKeyGuideDone,
    }),
  }, DeepSeekKeyGuide))
}

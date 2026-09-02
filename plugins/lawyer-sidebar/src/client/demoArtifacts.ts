/**
 * 演示回放的预录成果（M6.3）：真实 API 运行 demoData.ts 演示数据后固化的
 * AI 输出与产物文件。演示模式下（入口表单载入演示数据后点"开始"），前端
 * 不重新执行任务，而是：
 *   1. 把成果文件（docx 等）经 lawyerFiles/save 部署到当前工作区
 *      .lawyer-uploads/，得到工作区内的绝对路径；
 *   2. 新建专属会话，发送 buildDemoReplayPrompt 组装的回放指令——模型把
 *      预录成果原样作为自己的答复输出，成果以 AI 消息形态出现在对话框，
 *      与真实运行的呈现一致；
 *   3. 成果末尾的文件路径行由聊天区路径点击支持直接打开。
 *
 * markdown 中的 `{{file:<fileName>}}` 占位符在部署时替换为实际绝对路径
 * （以 dsh @ 引用语法 @path / @"path with spaces" 写入，路径含空白时
 * 自动加引号，与 prompt.ts 的 fileMention 规则一致）。
 */
import type { DocType } from './DocGenerationDialog.tsx'

/** 演示成果键（与三个入口的演示数据一一对应）。 */
export type DemoArtifactKey =
  | 'contract-review'
  | 'case-analysis'
  | `doc:${DocType}`

/** 随回放部署到工作区的成果文件。 */
export interface DemoArtifactFile {
  /** 展示文件名（部署为 <工作区>/.lawyer-uploads/<fileName>；与占位符一致）。 */
  readonly fileName: string
  /** 文件内容 base64（docx 二进制）。 */
  readonly contentBase64: string
}

/** 单套演示成果。 */
export interface DemoArtifact {
  /** 演示场景标题（回放指令首行）。 */
  readonly title: string
  /** 预录成果全文（Markdown；文件路径用 {{file:<fileName>}} 占位）。 */
  readonly markdown: string
  /** 随回放部署的成果文件（可为空：纯文本成果无文件）。 */
  readonly files: readonly DemoArtifactFile[]
}

/**
 * 把 markdown 中的 {{file:...}} 占位符替换为 dsh @ 引用（按路径是否含
 * 空白选择裸 @ 或 @"" 语法）。
 * M6.4 修复：占位符在成果 markdown 里被反引号包裹（`{{file:x}}`，源自
 * _collect.js 提取的行内代码形态），旧正则要求"标签："行首形态导致永不
 * 匹配、占位符原样进入指令与 AI 输出——现改为全局宽松匹配（任意位置、
 * 反引号外壳保留）。
 * @param markdown - 成果 Markdown 模板。
 * @param pathsByFile - 文件名 → 部署后的绝对路径。
 * @returns 替换后的 Markdown。
 */
export function hydrateArtifactPaths(
  markdown: string,
  pathsByFile: ReadonlyMap<string, string>,
): string {
  return markdown.replace(/\{\{file:([^}]+)\}\}/gu, (_match, fileName: string) => {
    const path = pathsByFile.get(fileName)
    if (path === undefined) return `（成果文件 ${fileName} 部署失败——请确认 lawyer-tools 已更新且工作区可写）`
    return /\s/u.test(path) ? `@"${path}"` : `@${path}`
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// 预录成果数据（真实 API 运行固化；demo-artifacts/ 保存原始产物与工具链）：
//   1. _start-demo.ps1 -DemoName <ws>（_runner.js 以 spawn 完整传 prompt）；
//   2. _collect.js <ws>（run.log → artifact.md，路径→占位符；docx → base64）；
//   3. _gen-artifact-ts.js（registry.json 全量重建本数据文件）。
// ─────────────────────────────────────────────────────────────────────────────

import { GENERATED_DEMO_ARTIFACTS } from './demoArtifacts.data.ts'

export const DEMO_ARTIFACTS: Readonly<Partial<Record<DemoArtifactKey, DemoArtifact>>> =
  GENERATED_DEMO_ARTIFACTS as Readonly<Partial<Record<DemoArtifactKey, DemoArtifact>>>

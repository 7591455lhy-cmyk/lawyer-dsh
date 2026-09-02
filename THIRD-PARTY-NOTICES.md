# 第三方组件声明

本文件列出「摸鱼工作站（lawyer-dsh）」源码与安装包中**随附的第三方组件**、
它们的许可协议、分发形态，以及本项目对上游做的改动。遵守这些许可是再分发
的前提，出包时不要删减本文件。

- 本项目自身代码采用 [Apache License 2.0](./LICENSE)。
- 署名摘要见 [NOTICE](./NOTICE)。
- 安装包内已随附 `LICENSE`、`NOTICE` 与本文件（安装目录 `resources/` 下）。

## 一、运行时框架

### DeepSeek Harness（dsh）0.1.1-rc.2

| 项 | 内容 |
| --- | --- |
| 许可 | **MIT License**，Copyright (c) 2026 DeepSeek |
| 获取 | npm `@deepseek-ai/dsh@0.1.1-rc.2` |
| 分发形态 | 安装包 `resources/runtime/dsh/`（npm 安装的自包含依赖树） |
| 用途 | 本地 Agent 运行时：会话、工作区、技能、MCP、插件体系，以及 web profile |

说明：`runtime/dsh/node_modules/` 下还有 dsh 的传递依赖（如 `node-pty`、
`@vscode/ripgrep`、`yaml` 等），它们各自的许可见对应包目录内的 `LICENSE`
文件；本文件不逐一罗列。

### Node.js 24.19.0

| 项 | 内容 |
| --- | --- |
| 许可 | **MIT License**，Copyright Node.js contributors |
| 获取 | https://nodejs.org/dist/v24.19.0/ |
| 分发形态 | 安装包 `resources/runtime/node/`（官方 win-x64 发行包） |
| 用途 | 运行 dsh CLI（与 Electron 内置 Node 解耦，满足 dsh 的 engines 要求） |

### Electron 43.4.1

| 项 | 内容 |
| --- | --- |
| 许可 | **MIT License**，Copyright (c) OpenJS Foundation |
| 获取 | npm `electron` |
| 分发形态 | 应用壳（安装目录根） |
| 用途 | 桌面壳：启动/守护本地 dsh 服务、系统浏览器外链、目录预创建 |

Electron 内含 Chromium 等第三方组件，其许可见 Electron 发行包自带的
`LICENSE` / `LICENSES.chromium.html`。

## 二、法律领域语料

### claude-for-legal-ZH

| 项 | 内容 |
| --- | --- |
| 许可 | **Apache License 2.0** |
| 上游 | https://github.com/CSlawyer1985/claude-for-legal-ZH |
| 分发形态 | 安装包 `resources/runtime/legal-zh/`；首次启动时由 Electron 主进程装配进 dsh 用户目录（`skills/chinese-legal-*` 共 18 个 adapter、仓库指针 `legal-zh/repo`、`AGENTS.md` 受管块） |
| 用途 | 合同审核 / 案件分析 / 文书生成三个入口的中国法工作流与质量门禁 |

**本项目对上游的改动**（Apache-2.0 要求的变更说明）：

1. 18 个 `chinese-legal-*` adapter 由本项目的 `scripts/install-legal-zh.ps1`
   复制进 dsh 技能目录；为适配 Windows 安装与打包版 `DSH_HOME`，adapter 内
   的 `~/.dsh/...` 路径在指令层补充了 `$env:DSH_HOME` 兜底（打包版的
   `DSH_HOME` 是 `userData\dsh-home`，与原文写的 `~/.dsh` 不是同一处）。
2. 随包分发时跳过 `docs/`（约 26MB，adapter 不引用）、`.git/`、`.github/`
   以及其它端的适配层（`.agents/`、`.workbuddy/`），其余内容原样复制，
   上游的 `LICENSE` 一并保留在 `runtime/legal-zh/LICENSE`。

## 三、随包分发的插件

### dsh-worktable 0.2.2

| 项 | 内容 |
| --- | --- |
| 许可 | **MIT License** |
| 分发形态 | 安装包 `resources/runtime/plugins/dsh-worktable/`（`lib/` + `package.json` + 上游 `LICENSE` 等） |
| 用途 | 左侧栏的 agent 级项目容器（工作台） |

**改动**：上游 `package.json` 同时声明 `dsh.bundle` 与 `dsh.client`，会被 dsh
运行时当作 bundle 包而跳过客户端装配（表现为 `/plugins/dsh-worktable/client.js`
404、界面不渲染）。打包脚本复制时剥除了 `dsh.bundle` 字段，使其与本项目插件
走同一条客户端装配路径。

## 四、本项目自有的插件与技能

以下为本项目自研部分，随源码采用 Apache License 2.0 一并授权，非第三方组件：

- `plugins/lawyer-sidebar`（右侧功能栏，Client 插件）
- `plugins/lawyer-tools`（技能注册 + 文件上传 / 实务画像 / 元典凭据三个 Host RPC 服务）
- `plugins/lawyer-wizard`（配置引导与自定义入口管理，Client 插件）
- `skills/`：`contract-review`、`case-analysis`、`doc-generation`、`docx-tracked-changes`
- `profiles/lawyer/`（lawyer agent preset，含元典 MCP 配置）

## 五、不随本项目分发的组件

| 组件 | 说明 |
| --- | --- |
| `pdfkit-py`（PDF 工具箱） | 来自 CodeBuddy 技能市场的第三方技能（含安装者本机元数据），**不随仓库与安装包分发**。合同审核表单的「输入预处理」与三个技能的 PDF 处理章节会引用它；本机未安装时相关能力不可用，其余功能不受影响。需要请自行从技能市场安装到 `skills/` |
| DeepSeek 开放平台 | 在线模型服务，用户自备 API Key，属外部服务而非本发行物的组成部分 |
| 元典（open.chineselaw.com） | 在线法规 / 案例检索 MCP 服务，用户自备 `YUANDIAN_API_KEY`，属外部服务而非本发行物的组成部分 |

## 六、图标与素材

- 应用图标 `packaging/build/icon.png` 与界面品牌字标（内嵌于
  `plugins/lawyer-sidebar/src/client/brandLogo.ts`）为本项目自制素材，
  随本项目一同授权。
- 界面文案中的品牌名与 logo 用于标识本项目，与任何第三方商标无关联。

## 七、出包时的合规清单

1. 安装包必须包含 `LICENSE`、`NOTICE`、`THIRD-PARTY-NOTICES.md`
   （由 `packaging/package.json` 的 `extraResources` 带入 `resources/`）。
2. `runtime/legal-zh/LICENSE`（Apache-2.0 全文）由 `prepare-runtime.ps1`
   复制上游语料时一并带入，不要剔除。
3. `runtime/plugins/dsh-worktable/LICENSE` 由打包脚本复制，不要剔除。
4. 版本升级重新出包后，请重新执行 `packaging/.check-pkg.mjs`，它会校验
   产物中的功能锚点与版本一致性。

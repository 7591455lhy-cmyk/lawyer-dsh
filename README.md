# 摸鱼工作站 · 一站式律师 AI 工作台

> 右侧一个功能栏，把「合同审核 / 案件分析 / 文书生成」变成**填表即发起**的任务。
> 基于 [DeepSeek Harness（dsh）](https://github.com/deepseek-ai) 的律师行业 Agent 工作台。

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Windows%2010%2B-blue)](./docs/安装-安装包版.md)

---

## 一、两种用法，任选其一

|  | **安装包版**（本仓库） | **插件版**（[lawyer-sidebar 仓库](https://github.com/7591455lhy-cmyk/lawyer-sidebar)） |
| --- | --- | --- |
| 适合谁 | 想直接用的律师 / 法务 | 已有 dsh 环境、只想要右侧栏的开发者 |
| 拿到什么 | `摸鱼工作站-Setup-0.80.exe`（175MB，含本地 dsh 运行时、Node、中国法语料） | `lawyer-sidebar-plugin-v0.80.zip`（约 4MB：两个插件 + lawyer preset + 一键安装脚本） |
| 装到哪 | 独立桌面应用，双击即用 | 装进你自己的 dsh web profile |
| 前置条件 | 无（自备 DeepSeek API Key） | Node 22.19+/24+、pnpm 11.7.0、dsh 0.1.1-rc.2 |

两条路走到的是同一套功能：插件版不含 Electron 桌面壳。

## 二、能做什么

- **三个开箱任务**：合同审核（立场 / 严格程度 / 材料）、案件分析、文书生成（民事起诉状、答辩状、代理词、法律意见书）——填表即发起，每次任务**独立新建会话**，任务之间零上下文污染。
- **自定义功能入口**：在侧栏加自己的任务卡片，字段、模板、附加技能与 agent preset 都能配。
- **实务画像三层**：快速表单（高频字段）／完整问卷（按**执业律师 · 公司法务**分叉成 4 套问题链）／原文直编。画像随任务指令一起喂给模型，一次填写长期复用。
- **首启引导**：DeepSeek API Key 与元典法规检索 Key 都能在界面里配齐，不再出现「以为你有 Key」的断头路。
- **中国法工作流**：按 [claude-for-legal-ZH](https://github.com/CSlawyer1985/claude-for-legal-ZH) 的规范路由领域 adapter、技能与质量门禁（技能 / MCP / 子代理三层规程）。
- **顺手的小事**：聊天区里的成果文件路径可直接点击打开；无工作区时自动建兜底目录；侧栏可整体收缩成图标轨道。

## 三、快速开始（安装包版）

1. 到本仓库右侧 **Releases** 下载 `摸鱼工作站-Setup-0.80.exe` 并安装。
2. 首次启动按引导填入 **DeepSeek API Key**（没有可在引导里直接跳到开放平台注册）。
3. 点右侧栏「合同审核」→ 选立场、加材料、选严格程度 →「开始」。

可选：填入**元典 Key**（法规 / 案例检索）。不填也能用——技能会按内置降级指引继续，法条靠模型记忆。

完整步骤、卸载与日志位置见 [`docs/安装-安装包版.md`](./docs/安装-安装包版.md)。

## 四、系统要求

- Windows 10 1803 及以上、x64
- 磁盘：安装包 175MB，安装后约 500MB，建议预留 1GB
- 网络：需联网（本地 Agent 运行时 + 模型调用 + 法规检索）
- 凭据：自备 DeepSeek API Key（[申请入口](https://platform.deepseek.com/api_keys)）；元典 Key 可选（[申请入口](https://open.chineselaw.com)）

## 五、从源码构建

```powershell
# 1) 构建三个插件（出「无演示数据」版本时给 sidebar 加 -NoDemo）
powershell -ExecutionPolicy Bypass -File plugins\lawyer-sidebar\build.ps1 -NoDemo
powershell -ExecutionPolicy Bypass -File plugins\lawyer-tools\build.ps1
powershell -ExecutionPolicy Bypass -File plugins\lawyer-wizard\build.ps1

# 2) 组装 runtime（需联网：Node 发行包 + dsh + pnpm 依赖）
cd packaging
npm install
npm run prepare-runtime

# 3) 出安装包（产物 packaging\dist\摸鱼工作站-Setup-0.80.exe）
powershell -ExecutionPolicy Bypass -File scripts\_clean-dist.ps1
npm run dist
```

另有 `START-HERE.cmd`（环境自检 + 一键恢复）与 `debug-web.cmd`（本地调试，http://127.0.0.1:3080）。
细节与三个必踩的坑见 [`docs/构建与出包.md`](./docs/构建与出包.md)。

## 六、目录结构

```
lawyer-dsh/
├── plugins/
│   ├── lawyer-sidebar/   右侧功能栏（Client 插件）：三个任务入口 + 自定义入口 + 实务画像
│   ├── lawyer-tools/     Host 插件：技能注册 + 文件上传 / 实务画像 / 元典凭据 三个 RPC 服务
│   └── lawyer-wizard/    配置引导与自定义入口管理（Client 插件）
├── skills/               律师技能（合同审核 / 案件分析 / 文书生成 / 修订留痕）
├── profiles/lawyer/      lawyer agent preset（含元典 MCP 配置）
├── scripts/              claude-for-legal-ZH 的 Windows 安装脚本等
├── packaging/            Electron 壳 + electron-builder 打包
├── demo-artifacts/       演示成果的生产与固化脚本（源码公开的演示数据用虚构所名）
└── docs/                 安装 / 构建 / 常见问题 / 发布
```

## 七、常见问题

见 [`docs/常见问题.md`](./docs/常见问题.md)。

## 八、许可与第三方声明

- 本项目代码：**Apache License 2.0**，见 [`LICENSE`](./LICENSE) 与 [`NOTICE`](./NOTICE)。
- 随包分发的第三方组件（dsh 为 MIT © 2026 DeepSeek、claude-for-legal-ZH 为 Apache-2.0、dsh-worktable / Node / Electron 为 MIT）清单、改动说明与合规要求见 [`THIRD-PARTY-NOTICES.md`](./THIRD-PARTY-NOTICES.md)。

## 九、免责声明

本软件的产出由大语言模型生成，**仅供法律实务工作参考，不构成法律意见，也不替代执业律师的独立判断**。使用者应对最终成果自行核验并承担相应责任。

「摸鱼工作站」是本项目产品名称；DeepSeek 是相应权利人的商标，本项目与 DeepSeek 官方无隶属或背书关系。

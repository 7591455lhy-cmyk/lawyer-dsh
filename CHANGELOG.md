# 更新日志

本项目的版本格式遵循 [语义化版本](https://semver.org/lang/zh-CN/)：`主版本.次版本.修订号`。
发布记录与下载见本仓库 Releases（安装包 tag 形如 `app-v0.80`）。

## 0.81.0 —— 2026-09-18

### 变更

- **移除演示数据**：删除 `demo-artifacts/`、`demoData.ts`、`demoArtifacts.data.ts`、
  `demoArtifacts.ts`，以及三个功能表单的「⚡ 载入演示数据」按钮、演示回放链路与
  `buildDemoReplayPrompt`。配套的 `-NoDemo` 构建开关、`__LAWYER_DEMO__` 编译期常量、
  `.check-nodemo.mjs` / `.check-demo-build.mjs` 一并删除——**构建产物不再区分
  「带演示 / 无演示」两种形态**（`client.js` 约 360KB）。需要跑完整流程时请自备
  合同 / 案件材料，用对话框的文件选择器或粘贴路径提交。
- 升级 dsh 运行时到 v0.1.5-rc.2。

### 修复

- `prepare-runtime` 的 dsh 版本自检：旧守卫只看 `bin.js` 是否存在，改了版本号仍会
  沿用旧安装树（实测声明 0.1.5-alpha.2 而实际装的是 0.1.1-rc.2）。现已比对已装版本
  与目标版本，不一致自动重装。
- `debug-web.cmd` 清除宿主注入的 `NODE_OPTIONS`：该垫片会让 npm / pnpm 安装静默中断
  （日志停在 `added N/1266` 且没有 `Done in`），并留下大面积依赖链接缺失。

## 0.80.0 —— 首个公开发行版

产品形态：Windows 桌面应用「摸鱼工作站」（Electron 壳 + 本地 dsh 运行时）。

### 新增

**任务与交互**

- 右侧功能栏：卡片式布局，可整体收缩为图标轨道，状态持久化。
- 四个入口：合同审核、案件分析、文书生成、自定义功能。前三个为填表即发起
  的完整任务（立场 / 严格程度 / 材料、模块选择、四种文书类型）。
- 自定义功能入口：字段、模板、附加技能与 agent preset 可配，走同一条注入链路。
- **会话隔离**：每次任务一律新建专属空白会话，任务之间零上下文污染。
- 聊天区里的成果文件路径可直接点击用系统默认程序打开。
- 无工作区时自动在用户目录下创建兜底工作区（打包环境无目录选择器）。

**律师实务能力**

- 实务画像三层形态：L1 快速表单 / L2 完整问卷 / L3 原文直编；未填字段一律落
  `[PLACEHOLDER]`，即「留空按通用标准」。
- **完整问卷按执业身份分叉**：执业律师与公司法务各一套问题链（商事 / 诉讼
  共 4 套），分叉依据来自画像模板原文而非自行设计。
- 中国法工作流：按 claude-for-legal-ZH 的规范路由领域 adapter、技能与质量
  门禁，指令内置技能 / MCP / 子代理三层调用规程与法律输出规则。
- 律师技能：`contract-review`、`case-analysis`、`doc-generation`、
  `docx-tracked-changes`（修订留痕审阅稿）。

**首启与凭据**

- 首启 DeepSeek API Key 引导：讲清注册 / 创建 / 充值三步并给可点外链，再交棒
  给官方输入框；官方输入框下方也补了同样的出口。
- 元典 MCP 引导：引导 + 粘贴保存 + 立即校验 + 平台外链；保存后即刻写进本进程
  环境变量（不必重启），跨重启从 `<dshHome>/lawyer-secrets.json` 回填。

**打包与工程**

- Electron 壳 + NSIS 安装包，随包分发 dsh 运行时、Node、web profile、
  lawyer preset、中国法语料与工作台项目数据。
- 编译期演示数据开关：`build.ps1 -NoDemo` 出无演示数据版本（本次发布即该形态）。

### 修复

- 首启引导弹窗被 `#root` 的 `inert` 一并锁死（按钮点不动、流程走不下去）——
  弹窗改为 `createPortal` 到 `document.body`。
- 自建界面主按钮「黑字压黑底」：主按钮文字改用
  `--dsw-alias-label-primary-foreground`（此前误用了亮主题下近黑的
  `brand-primary-invert`）。
- 演示回放的成果路径占位符被反引号包裹时永不替换，导致路径点击无反应。
- `dsh-worktable` 因同时声明 `dsh.bundle` 与 `dsh.client` 被运行时跳过静态装配
  （界面不渲染 / `client.js` 404）——打包时剥除 `dsh.bundle`。
- esbuild 默认不做死代码消除，`--define` 剔除演示数据后留下悬空标识符
  （`DEMO_ARTIFACTS` 等）——加 `--minify-syntax` 做语法级死代码消除。

### 已知问题

- 元典 MCP 端点**握手阶段不校验 Key 归属**：空 Key 返回 401，任意非空 Key 返回
  200。因此校验只能证伪不能证实，Key 是否真正可用以会话内实际检索为准。
- 打包环境的 Host 目录选择器无 `browse` 能力，选择工作区只能由 Electron 主进程
  预创建目录兜底。
- 非表单产物（模型在会话里写成的画像）默认停在 L3 原文直编，避免被表单覆盖。
- `pdfkit-py`（PDF 工具箱）是技能市场的第三方技能，不随仓库与安装包分发；
  未安装时 PDF 相关能力不可用，其余功能不受影响。
- 仓库内不含工作台项目数据，出包时生成一个占位项目（可用
  `prepare-runtime.ps1 -WorktableDataDir <目录>` 替换成自己的数据）。

### 合规

- 本项目采用 Apache License 2.0；随包分发的第三方组件清单、许可与改动说明见
  [`THIRD-PARTY-NOTICES.md`](./THIRD-PARTY-NOTICES.md)。
- 演示数据中的律所署名已全部替换为虚构名称，仓库不含真实机构名与个人路径。

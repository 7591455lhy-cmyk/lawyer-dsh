# 律师工作台（lawyer-dsh）开发方案

> 基于 DeepSeek Harness (dsh) 的律师行业 Agent 工作台 —— 比赛项目
> 目标：Windows exe 安装包，开箱即用，右侧固定功能入口 + 可配置引导

## 1. 项目概述

以 dsh 开源框架（Cordis 插件体系）为底座，开发符合律师日常工作习惯的桌面应用：

- 主界面右侧固定功能入口：合同审核、案件分析、案件文书生成
- 功能由内置 skills + MCP server 实现，随包分发，用户零配置
- 功能入口支持用户自定义，提供配置引导程序（wizard）
- 最终交付：Windows NSIS 安装包（exe）

## 2. 技术架构

```
┌─────────────────────────────────────────────┐
│  Electron 壳（Windows 桌面窗口）              │
│  └─ 内嵌 http://127.0.0.1:3080 (dsh web UI) │
├─────────────────────────────────────────────┤
│  dsh 运行时（本地 Node 服务）                  │
│  ├─ Client 插件: lawyer-sidebar（右侧功能栏） │
│  ├─ Client 插件: lawyer-wizard（配置引导）    │
│  ├─ Host 插件:  lawyer-tools（内置工具）      │
│  ├─ 内置 skills: 合同审核/案件分析/文书生成    │
│  └─ 预置 profile: MCP server 配置随包分发     │
└─────────────────────────────────────────────┘
```

### 需求映射

| 需求 | 实现 |
|---|---|
| 右侧固定功能入口 | Client 插件注册侧边栏 UI（参考 dsh-workspace-enhance） |
| 功能免配置 | 预置 profile，skills + MCP 配置打进分发包 |
| 入口自定义 + 配置引导 | Client 插件 wizard UI，写 profile 配置，右侧栏动态渲染 |
| Windows exe | Electron 壳 + electron-builder (NSIS) |

### 关键约束（dsh 插件铁律）

1. 插件 = TypeScript 具名导出 name + inject + apply(ctx)，禁止 export default
2. output schema 是对象时必须 additionalProperties: false
3. Host 插件（Node 端）不能操作 DOM；Client 插件（浏览器端）不能读文件系统；跨端走事件总线
4. Windows 下 cordis.yml 路径必须 file:/// 协议格式
5. dsh 为 v0.1 预览版，锁定一个版本开发，不随意升级

## 3. 项目结构

```
<lawyer-dsh 仓库路径>\
├─ docs\               # 需求、里程碑、本方案
├─ plugins\
│  ├─ lawyer-sidebar\    # Client插件：右侧功能栏
│  ├─ lawyer-wizard\     # Client插件：配置引导程序
│  └─ lawyer-tools\      # Host插件：内置工具
├─ skills\              # 内置skills
│  ├─ contract-review\   # 合同审核
│  ├─ case-analysis\     # 案件分析
│  └─ doc-generation\    # 文书生成
├─ profiles\lawyer\     # 预置profile（含MCP配置）
└─ packaging\           # Electron壳 + electron-builder
```

## 4. 里程碑

| 里程碑 | 内容 | 验收标准 |
|---|---|---|
| M1 最小UI插件 | 右侧栏"合同审核"按钮，点击注入预设指令 | dsh web 里能看到并触发 |
| M2 合同审核全链路 | skill + 法规检索 MCP | 上传合同→输出审核意见 |
| M3 功能复制 | 案件分析、文书生成 | 三个入口均可用 |
| M4 配置引导 | wizard + 自定义入口 | 新入口出现在右侧栏 |
| M5 exe 打包 | Electron + electron-builder | 干净 Windows 机器安装即用 |

风险提示：M5 打包风险最高，M2 完成后先做一次打包验证。

## 5. CODEBUDDY.md（放在 <lawyer-dsh 仓库路径>\ 根目录）

```markdown
# lawyer-dsh 律师工作台

## 项目背景
基于 DeepSeek Harness (dsh) 开发的律师行业 Agent 工作台，比赛项目。
dsh 于 2026 年 8 月开源（Cordis 插件框架），你的训练数据中没有它的知识。
工作区为 multi-root：本目录是项目代码，../deepseek-harness 是 dsh 源码（只读参考）。
开发任何 dsh 插件前必须先读 dsh 源码，禁止凭记忆编造 API。

## 动手前必读
- ../deepseek-harness/docs/development.md
- ../deepseek-harness/vendor/cordis/src/（Context / inject / apply 机制）
- ../deepseek-harness/packages/core/tools/src/（defineTool 定义）
- 社区 UI 插件参考：dsh-workspace-enhance（Client 插件范例）

## 插件铁律
1. 具名导出 name + inject + apply(ctx)，禁止 export default
2. output schema 是对象时必须 additionalProperties: false
3. Host 插件不能操作 DOM；Client 插件不能读文件系统，跨端走事件总线
4. Windows 下 cordis.yml 路径必须 file:/// 协议格式
5. 配置用 Schemastery：export const Config = Schema.object({...})

## 架构约定
- plugins/lawyer-sidebar：右侧功能栏（Client 插件）
- plugins/lawyer-wizard：配置引导程序（Client 插件）
- plugins/lawyer-tools：内置工具（Host 插件）
- skills/：合同审核、案件分析、文书生成
- profiles/lawyer/：预置 profile，MCP 配置随包分发
- packaging/：Electron 壳 + electron-builder NSIS 打包

## 里程碑
M1 最小UI插件 → M2 合同审核全链路 → M3 功能复制 → M4 配置引导 → M5 exe打包
当前阶段：M1

## 常用命令
- dsh 开发调试：在 ../deepseek-harness 下 pnpm dsh web --patch <插件cordis.yml>
- Web 界面：http://127.0.0.1:3080
```

## 6. M1 启动 prompt（在 CodeBuddy Craft 模式第一句）

> 请先阅读 CODEBUDDY.md，然后通读 ../deepseek-harness/docs/development.md、
> vendor/cordis/src 的核心代码，并找一个官方或社区 Client 插件（UI 插件）的源码，
> 向我总结：1) Client 插件如何注册侧边栏 UI 组件；2) 插件如何向 Agent 注入指令；
> 3) 完整开发调试流程。确认无误后，我们实现 M1：在右侧栏添加"合同审核"固定入口，
> 点击后向对话注入合同审核的预设指令。

## 7. M5 打包预验证（Electron 壳 + NSIS）

### 7.1 架构

```
Electron 壳（process.resourcesPath/runtime/）
├─ node/node.exe             官方 Node 22.19+（跑 dsh CLI，与 Electron 内置 Node 解耦）
├─ dsh/                      npm install @deepseek-ai/dsh（自包含依赖树）
│                             bundles 解析从 INSTALL_ANCHOR（这棵依赖树）走，
│                             装到用户机器的可写 DSH_HOME 也能正确解析
├─ profile-web/              预组装 web profile（hoisted，file: 律师插件已复制进 node_modules）
├─ plugins/lawyer-*          profile 依赖源（pnpm install 时的 file: 目标）
├─ agent-presets/lawyer/     律师 preset（部署到 $DSH_HOME/.agent-presets/lawyer/）
├─ skills/                   三个律师技能
└─ VERSION                   lawyer-sidebar 版本号，Electron 用它判断是否需重部署
```

### 7.2 首启流程（Electron 主进程）

1. `assertRuntime` 校验 runtime/ 必备文件（node.exe / dsh bin / profile-web / preset / VERSION）
2. `deployRuntime`：版本标记命中则复用；否则
   - `rmSync + cpSync` 复制 `profile-web/` → `$DSH_HOME/profiles/web/`
   - `rmSync + cpSync` 复制 `agent-presets/lawyer/` → `$DSH_HOME/.agent-presets/lawyer/`
   - **写 `cordis.patch.yml`（profile user layer）为律师 overlay**，包含两行 insert：
     - `lawyer-sidebar`（Client 插件，靠 name 从 profile node_modules 解析）
     - `lawyer-tools`（Host 插件，`config.skillsDir` 指向 `process.resourcesPath/runtime/skills`）
   - 写 `VERSION` marker
3. `startDsh`：`spawn(runtime/node/node.exe, [...dshBin, 'web', '--no-open'])`
   - `cwd = app.getPath('home')`（UI 里会话 cwd 用户可选）
   - `env: { ...process.env, DSH_HOME: dshHome }`
   - stdio 写到 `$APPDATA\lawyer-workbench\logs\dsh-web.log`
4. `waitForServer`：轮询 `http://127.0.0.1:3080`（500ms × 240 次 = 120s 超时）
5. `createMainWindow`：`session.setProxy({mode:'direct'})` 防系统代理劫持 loopback，
   `BrowserWindow 1480×940`，`loadURL` 最多 10 次重试
6. 关闭：`before-quit` → `taskkill /pid /T /F` 杀 dsh 进程树（含 pwsh 子进程）

### 7.3 关键决策与坑

- **`--patch` 不可用**：built `dsh web --patch X` 子命令 commander 不识别 parent `--patch`，会报
  `web takes none of parent --profile, --patch, ...`；把 `--patch` 放 `web` 之前又被同函数拦截；
  `--patch X web`（web 吞下）会让下游 web app commander 报 `unknown option '--patch'`。
  → **改用 profile user layer（`cordis.patch.yml`）写入律师 overlay**，更稳且 dsh 官方推荐位置。

- **独立 node.exe 而非 ELECTRON_RUN_AS_NODE**：dsh 依赖 `node-addon-require-builtin`
  （native N-API addon），Electron 内置 Node ABI 与官方 Node 存在差异，最简路径是带
  官方 Node v24.19.0（dsh engines `^22.19 || >=24` 都满足）。

- **bundles 解析契约**：`dsh-app-boot` 的 `healProfilesModuleFallback` 只在
  `$DSH_HOME/profiles/node_modules` 建 junction 树，**不写 dsh 安装目录**——安装到
  Program Files 只读位置也安全。

- **pnpm hoisted + file: 依赖**：profile 用 `nodeLinker: hoisted` 平铺 node_modules，
  `file:../plugins/lawyer-*` 走 file 协议（pnpm 复制语义而非 hardlink），保证
  `node_modules/lawyer-sidebar` 是真实目录，`fs.cpSync` 复制到 userData 后自包含。

- **NSIS oneClick + perMachine=false**：装到 `%LOCALAPPDATA%\Programs\LawyerWorkbench`，
  userData 在 `%APPDATA%\lawyer-workbench\dsh-home`（可写）；`shortcutName: 律师工作台`
  让开始菜单项中文，安装目录与 productName 一致保持英文避开中文路径风险。

- **代理问题**：`session.setProxy({mode:'direct'})` 必加，否则系统代理可能劫持
  127.0.0.1 导致 `loadURL` 失败。

### 7.4 产物指标（M5 预验证通过）

- `dist/LawyerWorkbench-Setup-0.1.0.exe` ≈ 171 MB（NSIS 压缩）
- `resources/runtime/` 解包 ≈ 295 MB（dsh node_modules 占大头，含 node-pty、ripgrep 等）
- 开发验证：`npm run dev:launch` → HTTP-3080 200 / 5 个 electron 进程
- 干净首启：`npm run dist:launch` → 清空 userData → 自动部署 .agent-presets + profiles/web + cordis.patch.yml overlay
- dsh-web.log 干净，无错误（早期 `--patch` 报错已修）

### 7.5 不在本里程碑做的事（已知留口）

- 用户首次启动要在 Web UI 里登录 DeepSeek 账号（`$DSH_HOME/.credentials.yaml`）；
  YUANDIAN_API_KEY 需用户自行设置系统环境变量
- electron-builder 自动 sign（signtool.exe 找不到证书告警，使用 test 签名）；生产环境
  应配置代码签名证书
- NSIS 安装包尚无应用图标（用默认 Electron 图标）
- profile 升级覆盖策略会清空用户在 web profile 里手动 `dsh plugin add` 的其他插件（最小可用版本接受）

## 8. M5.1 多文件与文件夹输入（案件分析 / 案件文书起草 / 合同审核）

三个入口共用 `FilePicker`（M3 抽取的通用组件），本轮在组件层一次改造、三入口同时获得能力。

### 8.1 交互与数据流

| 输入方式 | 行为 |
|---|---|
| 拖入文件夹 | `dataTransfer.items` 的 `webkitGetAsEntry()` 递归展开（≤60 文件，跳过隐藏项与 Thumbs.db/desktop.ini）；图片/文本照旧直接读取，二进制按 `顶层目录名/相对路径` 上传 |
| "选择文件夹"按钮 | `<input webkitdirectory>`，`file.webkitRelativePath` 提供相对路径，走同一展开管线 |
| 工作区候选目录 | 目录行新增"＋ 引用目录"按钮：把 `@dir/`（dsh 原生 directory mention 语法，尾斜杠）加入已选清单；点目录名仍是逐级进入 |
| 粘贴路径 | 以 `/` 结尾（规范化后）即视为目录引用加入 |
| 上传后的引用 | 文件夹成员上传进 `<工作区>/.lawyer-uploads/<顶层目录名>/…` 保留结构，client 从返回路径解析顶层目录，以单个 `@dir/` 引用（指令短，模型有明确探索起点）；散文件逐个 `@path` |

**paths 约定**：`FilePickerValue.paths` 中以 `/` 结尾的条目是目录引用；prompt 组装（`appendMaterialLines`）对目录行生成"请先用文件列表工具列出该目录下的全部文件，再逐个读取后使用，勿遗漏"，文件行保持"读取全文"指令。dsh 的 `@` 提及是纯文本语义（`FILE_REFERENCE_PROMPT` 指导模型用文件工具读取），目录引用安全。

### 8.2 关键实现点

- **Host 上传子路径**：`lawyerFiles.save` 的 fileName 支持相对子路径，段清洗提取为
  `normalizeUploadSegments()`（可单测导出）；**必须先 filter 掉 `..`/`.`/空段再做字符替换**
  ——顺序反了 `..` 会先被替换成 `_` 逃过遍历过滤（冒烟抓到的真实 bug）。
- **stale 覆盖 bug 修复**：`handleFiles` 异步循环里多次 `onChange({...value})` 基于同一
  渲染快照互相覆盖（M2 以来拖多个二进制文件只保留最后一个路径）；改为本地累积
  `paths/images/texts` 副本、结束时单次提交。
- **文件夹成员不走索引匹配**：文件夹里同名文件常见（两个"合同.pdf"），按 basename
  匹配工作区索引会错引；只有散文件保留"索引唯一命中即零拷贝引用"。
- **Electron 壳加固**（本轮顺带）：`startDsh` spawn 时剥离 `NODE_OPTIONS`（开发机
  注入的 safe-delete 垫片会拦截 dsh heal 的 junction 重建）；`deployRuntime` 重部署时
  一并清 `$DSH_HOME/profiles/node_modules`（junction 缓存树，让 dsh 全新 heal）。

### 8.3 验证（全过）

- prompt 冒烟（`plugins/lawyer-sidebar/smoke-prompt.ps1`，11 断言）：三入口手势、目录行
  指令、散文件行、相对路径文件、含空格目录 `@"…"/` 引号语法、图片计数、内嵌文本、空材料提示
- Host 冒烟（`plugins/lawyer-tools/smoke-save.ps1`，11 断言）：子路径保留结构、`..`
  遍历防护（含带空白的 `..` 段）、保留字符替换、嵌套目录真实落盘
- 构建：两插件 esbuild 通过（sidebar 0.5.1 / tools 0.2.1，bump 触发 Electron 重部署）
- 端到端（playwright + Edge 对 http://127.0.0.1:3080）：案件分析弹窗渲染"选择文件夹"
  按钮、新 label/placeholder；粘贴目录路径回车后已选清单出现 `📁 名称/` 条目与移除按钮
- 注意：PowerShell 命令行向 playwright-cli fill 中文会 GBK→UTF-8 乱码，不影响验证
  结论（目录判定只看尾斜杠）；真实用户输入无此问题

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
D:\codes\lawyer-dsh\
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

## 5. CODEBUDDY.md（放在 D:\codes\lawyer-dsh\ 根目录）

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

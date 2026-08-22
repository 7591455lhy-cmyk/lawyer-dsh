# dsh 源码调研总结（M1 前置）

> 调研范围：CODEBUDDY.md、lawyer-dsh 开发方案、deepseek-harness/docs/development(.zh).md、cordis-primer、vendor/cordis/src 核心机制、packages/client/modules（Client 模块系统）、ui-slots / ui-sidebar / ui-workspace / ui-brand-official 源码、packages/bundle/web-app/cordis.patch.yml（Web 组合清单）、extension-cookbook 及相关子系统文档。

## 1) Client 插件如何注册侧边栏 UI 组件

**插件形态（双面包）**：一个 Client UI 插件是一个 npm 包，两个入口：

- Node 半（`src/index.ts`）：导出空 `apply()`，仅作 Host loader 入口（参考 `packages/client/ui-sidebar/src/index.ts`）
- 浏览器半（`src/client/index.ts`）：导出 `inject`（依赖服务数组）+ `apply(ctx: ClientContext)`，UI 注册全在这里
- `package.json` 必须声明 `"dsh.client": { "platform": "web" }` 且 `exports["./client"]` 指向构建好的浏览器 bundle（`lib/client.js`）

**UI 组装靠 slot 系统**（`ctx.slots`，由 `dsh-client-ui-slots` + `dsh-client-runtime` 提供）：

```ts
// ui-sidebar/src/client/index.ts:40-57 —— 声明方（壳）
ctx.effect(() => ctx.slots.register({
  name: 'sidebar',
  children: {
    'sidebar.brand.mark':      { kind: 'single', scope: 'root' },
    'sidebar.workspaces':      { kind: 'single', scope: 'root' },
    'sidebar.settings':        { kind: 'single', scope: 'root' },
    'sidebar.footer.action':   { kind: 'list',   scope: 'root' },  // ← 多占位者列表槽
  },
  inject: injectProps,   // 回调通过工厂注入组件
}, SidebarRoot), '...')
```

**侧边栏现有槽位及归属**（`ui-sidebar/src/client/contract/slots.ts`）：

| 槽位 | kind | 现状 | 律师项目可用性 |
|---|---|---|---|
| `sidebar.workspaces` | single | 被 ui-workspace 占用 | 不可用 |
| `sidebar.settings` | single | 被 ui-settings 占用 | 不可用 |
| **`sidebar.footer.action`** | **list** | 空置 | **功能入口天然落点，可注册多个组件** |
| `sidebar.brand.mark/name` | single | 被 ui-brand-official 占用 | 可覆盖 |

**注册方式（occupant 侧）**——加载顺序无关的声明感知注册，参考 `ui-brand-official/src/client/index.ts`：

```ts
export const inject = ['slots', 'sessions', 'locale']
export function apply(ctx: ClientContext): void {
  ctx.slots.inject('sidebar.footer.action', () =>
    ctx.slots.register({ name: 'sidebar.footer.action' }, LawyerEntryButton))
}
```

`ctx.slots.inject(槽名, 工厂)` 会等该槽被声明后再注册，不依赖插件先后顺序。组件 props 由四股组成：owner props（如 `wide` 折叠状态）、子槽渲染、inject 工厂回调、locale。业务数据走全局 hooks（`useSessions` 等），动作走 inject 工厂闭包里的 `ctx`。卸载时注册自动撤销（`ctx.effect` 生命周期）。

> 注：方案文档里提到的 `dsh-workspace-enhance` 在本仓库不存在，实际最佳参考是 **ui-brand-official（最小 occupant）** 和 **ui-workspace（完整 occupant）**。

## 2) 插件如何向 Agent 注入指令

**Client 端路径（M1 用这个）**：`ctx.sessions` 服务 → 会话脸 `ISession`：

```ts
// 拿当前会话
const current = ctx.sessions.list.getSnapshot().current
const session = ctx.sessions.binding(current)?.session
// 注入预设指令（内建 composer 同款调用，ui-conversation/src/client/service.ts:132）
await session.prompt([{ type: 'text', text: '请对以下合同进行审核...' }], 'queue' | 'steer')
```

- `'queue'`：排队追加一轮（助手空闲时立即执行）
- `'steer'`：打断当前正在运行的轮次
- `session.command('/xxx')` 可执行斜杠命令
- 若当前无会话，需先 `ctx.workspaces.startSession()` 新建（注意异步时序，M1 需处理）

**Host 端路径（M2+ lawyer-tools/skills 用）**：

- `ctx.agents.get(agentId)?.followup(createUserMessage(...))` / `.steer()` — 排队消息/中途引导
- `agent.inject()` — mid-turn 上下文注入（AGENTS.md 子目录、定时任务通知就是这么做的）
- `ctx.systemPrompt.section()` — 系统提示词段落（skill = section + 工具注册，调用时 `inject()` 注入 skill 内容）
- 跨端约束：Client 不能直接碰 `ctx.agents`，必须走 `ctx.sessions` / `ctx.remote`（Typert Remote 网关）

## 3) 完整开发调试流程

**一次性准备**：

```sh
cd d:\codes\deepseek-harness
pnpm install && pnpm run build   # 准备 Host/Client/Web 全部产物
```

**插件包要求**（lawyer-sidebar 为例）：

- `package.json`：`"dsh.client": { "platform": "web" }` + `exports["./client"]` → 打包产物（CJS bundle）
- Node 半空 `apply`，浏览器半 `inject + apply`
- **包名必须能从 profile 的 `ctx.baseUrl` 解析**（client-modules 扫描用 `createRequire(ctx.baseUrl).resolve('<name>/package.json')`）——按项目铁律，Windows 下本地包依赖用 `file:///` 协议路径引用

**启动调试**：

```sh
# deepseek-harness 目录下
pnpm dsh web --patch d:/codes/lawyer-dsh/plugins/lawyer-sidebar/cordis.yml
# patch 内容：- insert: - id: lawyer-sidebar, name: <包名>
# 浏览器打开 http://127.0.0.1:3080
```

`--patch` 是叠加在 web profile（dsh-base + dsh-web-app 层）之上的 overlay，只贡献配置行不改解析锚点。Host 插件（lawyer-tools）调试更简单：patch 行 `name` 直接写 `.ts` 源文件绝对路径，Host 经 tsx 从源码启动（SRC 回退），无需构建。

**热更新**：

- Client 插件 bundle 内容变化会改变内容哈希 rev，`client-hmr` 行（Web 组合常驻）经 SSE 推给浏览器。仓库内开发配 `pnpm run dev:web`（只监听带 `dsh.client` 声明的插件并重写 `lib/client.js`）；lawyer-dsh 作为外部包需自建构建脚本重打 bundle，刷新页面即生效
- Host 源码插件配 cordis-plugin-hmr 可热替换（注意：web-app 层当前把共享 HMR 行置为 `disabled`）

**一个重要架构提醒（影响 M2）**：web-app bundle 里 bash/fs/skill/workflow 等 agent 侧工具行全部被 `disabled`，能力改由 **agent preset** 按会话组装。lawyer-tools、skills（合同审核等）属于 agent 侧能力，届时不能只靠 patch insert 一个 Host 插件行，需要通过预置 profile 的 agent preset 组装（方案里 `profiles/lawyer/` 正好对应这个机制）。

## 下一步（待确认）

确认无误后开始 M1：创建 `lawyer-sidebar` Client 插件，在 `sidebar.footer.action` 槽位注册"合同审核"入口，点击后向当前会话 `prompt()` 注入合同审核预设指令。

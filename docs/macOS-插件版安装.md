# macOS（插件版）安装与使用

macOS 上**不用打包**：dsh 原生支持 macOS（官方运行方式就是 `npx @deepseek-ai/dsh web`），
律师插件是纯 JS 的 npm 包、平台无关，构建产物 `lib/` 已随仓库入库。所以只要装好
Node / pnpm / dsh，一条命令就能把整套律师工作台装进你自己的 dsh web profile。

与 Windows 安装包版的差异：没有 Electron 桌面壳、不自带 dsh 运行时，其余功能一致
（三个任务入口、实务画像、首启引导、中国法工作流；左侧工作台为第三方插件，官方标注
macOS 为实验性支持）。

## 一、前置

| 依赖 | 要求 | macOS 装法 |
| --- | --- | --- |
| Node | 22.19+ 或 24+ | `brew install node@24` |
| pnpm | 11.7.0 | `corepack enable && corepack prepare pnpm@11.7.0 --activate` |
| dsh | 0.1.1-rc.2 | `npm i -g @deepseek-ai/dsh@0.1.1-rc.2` |
| DeepSeek API Key | 自备 | [申请](https://platform.deepseek.com/api_keys) |
| claude-for-legal-ZH | 可选 | `git clone https://github.com/CSlawyer1985/claude-for-legal-ZH.git` |

**pnpm 是硬依赖**：`dsh plugin` 命令内部就是 pnpm 转发器，PATH 里没有 pnpm 时安装会直接
退出 127。脚本自检会拦在这里并给出上面的命令。

## 二、三步装好

```bash
# 1) 取得源码（lib/ 已入库，不需要 esbuild，也不需要 deepseek-harness 源码）
git clone https://github.com/7591455lhy-cmyk/lawyer-dsh.git
cd lawyer-dsh

# 2) 装（中国法语料可选，缺失只告警不阻断）
node scripts/install-plugin.mjs --legal-zh ../claude-for-legal-ZH
#   语料还没克隆时，加 --clone-legal-zh 让脚本自己拉

# 3) 启动（脚本结束会打印确切命令）
dsh web --patch "$HOME/.dsh/lawyer-overlay.yml" --no-open
#    浏览器打开 http://127.0.0.1:3080，首次 Cmd+Shift+R 强刷一次
```

> **`--patch` 必须排在 `--no-open` 之前。** `dsh web` 的子命令开了透传未知参数，
> 顺序反了 `--patch` 会被当成 web 应用的参数，commander 直接报 unknown option。

脚本做的事：自检环境 → 安装 `lawyer-sidebar` / `lawyer-tools` / `lawyer-wizard`
（先 remove 再 add，避免 pnpm 缓存旧产物）→ 装 `dsh-worktable`（官方 latest 的 tgz）
→ 部署 lawyer preset → 装中国法 adapter → 生成填好本机路径的 overlay → 打印验证清单。

## 三、脚本参数

| 参数 | 说明 |
| --- | --- |
| `--profile <name>` | 目标 dsh profile，默认 `web` |
| `--dsh-home <dir>` | dsh 用户目录，默认 `$DSH_HOME`，其次 `~/.dsh` |
| `--dsh-version <ver>` | PATH 里没有 dsh 时用 npx 拉的版本，默认 `0.1.1-rc.2` |
| `--legal-zh <dir>` | 中国法语料仓库目录（默认与本仓并排） |
| `--clone-legal-zh` | 语料缺失时自动 `git clone` |
| `--link` | 中国法 adapter 用符号链接（git pull 即更新） |
| `--skip-worktable` | 不装左侧工作台（macOS 实验性，出问题先用它隔离） |
| `--skip-legal-zh` | 不装中国法语料 |
| `--in-place` | 把填充好的路径写回仓库内的 `cordis.yml`（默认写到 DSH_HOME） |
| `--uninstall` | 卸载插件、preset、adapter 与生成的 overlay |

## 四、数据都在哪

| 内容 | 路径 |
| --- | --- |
| dsh 用户目录 | `~/.dsh`（或 `$DSH_HOME`） |
| web profile | `~/.dsh/profiles/web` |
| lawyer preset | `~/.dsh/.agent-presets/lawyer` |
| 中国法 adapter | `~/.dsh/skills/chinese-legal-*` |
| 语料仓库登记 | `~/.dsh/legal-zh/repo` |
| 全局指令 | `~/.dsh/AGENTS.md`（legal-zh 受管块） |
| overlay | `~/.dsh/lawyer-overlay.yml` |
| 设置 / 画像 / 凭据 | `~/.dsh/settings.yaml`、`~/.dsh/legal-zh/<领域>/CLAUDE.md`、`~/.dsh/lawyer-secrets.json` |

## 五、真机验证清单（逐条勾）

- [ ] 侧栏出现「合同审核 / 案件分析 / 文书生成」三个入口
- [ ] 点「合同审核」弹出表单（立场 / 材料 / 严格程度），提交后**独立新建会话**
- [ ] 「＋ 添加自定义功能」能新增入口（`lawyer-wizard`，插件版此前缺失的组件）
- [ ] 侧栏底部实务画像可打开，快速表单保存成功
- [ ] 左侧工作台显示项目卡片（`dsh-worktable`，见下方已知限制）
- [ ] 设置 → 模型填入 DeepSeek Key 后能正常对话
- [ ] 中国法：`~/.dsh/skills` 下 `chinese-legal-*` 有 18 个，会话里能路由到领域工作流
- [ ] 会话里生成的文件路径可点击打开

CI 侧有等价的自动验证：`.github/workflows/verify-mac-plugin.yml`（Apple Silicon runner
上跑完整安装并拉起 `dsh web`，断言主页与 `/plugins/*/client.js` 可访问）。

## 六、已知限制

- **左侧工作台（dsh-worktable）在 macOS 是实验性支持**（其官方 README 原话：Windows 是
  完整验证平台）。装上后界面空白属已知风险，用 `--skip-worktable` 隔离，其余功能不受影响。
- 没有桌面壳：需要先自己装 Node/pnpm/dsh，服务随终端生命周期（关掉终端即停）。
- `dsh` 版本以 0.1.1-rc.2 为准；用更高版本（如 0.1.5）时脚本会打印版本不匹配的警告。

## 七、卸载

```bash
node scripts/install-plugin.mjs --uninstall
```

只移除四个插件、lawyer preset、中国法 adapter 与生成的 overlay；`~/.dsh` 里的设置、
画像与凭据刻意保留。

## 八、排障

| 现象 | 原因与处理 |
| --- | --- |
| 安装报退出码 127、提示 pnpm not found | PATH 里没有 pnpm：`corepack enable && corepack prepare pnpm@11.7.0 --activate` |
| `error: unknown option '--patch'` | 启动命令顺序错了，写成 `dsh web --patch <文件> --no-open` |
| 改完插件源码不生效 | pnpm 对 `file:` 依赖在 spec 不变时会跳过内容更新；重跑安装脚本（它先 remove 再 add），并重启 dsh |
| 3080 端口被占用 | `lsof -i :3080` 找到旧进程 kill 掉，或 `dsh web --port 3081` |
| 侧栏不显示 | 强刷（Cmd+Shift+R）；确认 profile 依赖里有三个插件（脚本结束会打印验证清单） |
| 工作台区域空白 | 见「已知限制」；确认 `/plugins/dsh-worktable/client.js` 是否 404 |

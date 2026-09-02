# 参与开发

谢谢愿意动手改它。先把环境跑起来，再改代码，最后跑自检。

## 一、环境准备

硬性布局：**`deepseek-harness` 与 `lawyer-dsh` 必须并排放在同一个父目录下**
（盘符与目录名不限）。

```powershell
# 前置：Node 22.19+ 或 24+；pnpm 11.7.0
npm install -g pnpm@11.7.0

# 一键自检 + 装依赖 + 构建 + 装中国法语料 + 启动调试
lawyer-dsh\START-HERE.cmd
```

日常调试：`debug-web.cmd` → 浏览器打开 http://127.0.0.1:3080（Ctrl+F5 强刷）。
可选环境变量 `YUANDIAN_API_KEY`：不设置时法规检索工具不可用，合同审核按技能
内置降级指引继续。

## 二、改了什么，要做什么

| 改动位置 | 后续动作 |
| --- | --- |
| 插件 `src/`（ts/tsx） | 对应 `plugins/<包>/build.ps1` 重建 → 重跑 `debug-web.cmd`（内部先 remove 再 add，确保取到新产物） |
| `profiles/lawyer/`（preset） | 重跑 `debug-web.cmd`（幂等覆盖到 `%USERPROFILE%\.dsh\.agent-presets\lawyer`） |
| `skills/` | 直接重跑即可（技能源目录直接指向源码） |
| 侧栏 UI 文案 / 品牌 | 重建 lawyer-sidebar 并强刷浏览器 |

## 三、插件铁律（dsh 插件，违反即启动失败或静默失效）

1. 具名导出 `name` + `inject` + `apply(ctx)`，**禁止 `export default`**。
2. output schema 是对象时必须 `additionalProperties: false`。
3. Host 插件不能操作 DOM；Client 插件不能读文件系统；跨端一律走事件总线 / RPC。
4. Windows 下 cordis.yml 的路径必须是 `file:///` 三斜杠协议格式。
5. 配置用 Schemastery：`export const Config = Schema.object({...})`。

补充两条踩过的坑：

- `ctx.typert.register` 以 `(package, face)` 为主键，重复注册会抛
  `package face "lawyer-tools#host" is already registered`——新增 Host 服务
  只返回 descriptors，由 `apply` 合并成**一次**注册。
- PowerShell 脚本含中文字面量时必须**带 BOM**，否则 PS 5.1 按 GBK 解析会
  直接报语法错；命令行里传中文路径也会被弄乱，涉及中文的操作请写进
  UTF-8 脚本文件里跑。

## 四、自检：提交与出包前必跑

```powershell
# 逻辑冒烟（四套，全部应 PASS）
powershell -File plugins\lawyer-sidebar\smoke-profile.ps1   # 画像 128 条断言
powershell -File plugins\lawyer-sidebar\smoke-prompt.ps1    # 指令生成全场景
powershell -File plugins\lawyer-tools\smoke-secrets.ps1     # 元典凭据服务
powershell -File plugins\lawyer-tools\smoke-save.ps1        # 文件上传落盘

# 构建产物自检（跑在对应的构建之后）
node plugins\lawyer-sidebar\.check-nodemo.mjs   # -NoDemo 构建：无演示残留、无悬空引用
node plugins\lawyer-sidebar\.check-demo-build.mjs
node packaging\.check-pkg.mjs                    # 安装包产物：功能锚点 + 版本一致性
```

## 五、提交约定

- Commit message 用 `类型: 简述`，类型取 `feat` / `fix` / `docs` / `refactor` /
  `test` / `chore`。
- 一个提交一件事；重构与功能改动分开。
- **不要提交**：密钥、`packaging/runtime/`、`packaging/dist/`、
  `packaging/.cache/`、`node_modules/`、`*.log`、冒烟自检产出的临时目录。
- 新功能请补一条 smoke 断言或 `.check-*.mjs` 里的锚点，让别人出包时能验。

## 六、许可

贡献即表示同意你的贡献按本仓库的 [Apache License 2.0](./LICENSE) 授权。

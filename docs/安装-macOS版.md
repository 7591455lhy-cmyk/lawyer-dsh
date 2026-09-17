# macOS 桌面版（dmg）安装与使用

与 Windows 安装包版同一套功能，只是形态换成 macOS 的 dmg：挂载后把
「摸鱼工作站」拖进 Applications，双击即用，**不需要自己装 Node / pnpm / dsh**
（这些都随包分发）。

如果你已经有 dsh 环境，只想把右侧栏装进去，用
[插件版](./macOS-插件版安装.md) 更轻（约 4MB，不自带运行时）。

## 一、选对架构

| 你的 Mac | 下载 |
| --- | --- |
| Apple Silicon（M1/M2/M3/M4，2020 年后） | `MoyuWorkbench-<版本>-arm64.dmg` |
| Intel 芯片 | `MoyuWorkbench-<版本>-x64.dmg` |

不确定就点左上角苹果图标 →「关于本机」：芯片栏写 Apple M\* 选 arm64，写 Intel 选 x64。

## 二、安装

1. 双击 dmg 挂载，把 **摸鱼工作站** 拖到 **Applications** 快捷方式上。
2. 弹出「无法打开，因为它来自身份不明的开发者」或「已损坏」——这是**未签名**
   包的正常现象（本项目尚未做 Apple 开发者签名与公证），按下面任一方式放行：

   ```bash
   # 方式 A（推荐，一次生效）
   xattr -cr /Applications/摸鱼工作站.app

   # 方式 B：在 Finder 里右键点应用 →「打开」→ 在弹出的警告里点「打开」
   ```

3. 首次启动按引导填入 **DeepSeek API Key**（没有可在引导里直接跳到开放平台注册）。
   元典 Key（法规 / 案例检索）可选，不填也能用。
4. 首次启动较慢（要部署 dsh 运行时、web profile、preset 与中国法语料），
   之后由 `VERSION` 标记跳过。

## 三、数据在 macOS 的哪里

| 内容 | 路径 |
| --- | --- |
| dsh 用户目录（`DSH_HOME`） | `~/Library/Application Support/lawyer-workbench/dsh-home` |
| 日志 | `~/Library/Application Support/lawyer-workbench/logs/dsh-web.log` |
| 中国法语料 | `~/Library/Application Support/lawyer-workbench/legal-zh` |
| 工作台项目数据 | `~/Library/Application Support/lawyer-workbench/dsh-worktable/data` |
| 元典 Key | `~/Library/Application Support/lawyer-workbench/dsh-home/lawyer-secrets.json` |
| 兜底工作区 | `~/摸鱼工作站-工作区` |

## 四、已知限制

- **未签名未公证**：首次打开必须 `xattr -cr` 或右键打开（见上）。这是当前版本的
  既定状态，不是安装失败。
- **左侧工作台（dsh-worktable）在 macOS 是实验性支持**（其官方 README 原话：
  Windows 才是完整验证平台）。界面空白时可忽略，其余功能不受影响。
- 随包 dsh 为 0.1.5-rc.2：Web 根路径的一次性 token 已由应用自动处理
  （从启动日志解析后拼进首个 URL），用户无需感知。

## 五、卸载

把 `/Applications/摸鱼工作站.app` 拖到废纸篓；要连数据一起清，再删除
`~/Library/Application Support/lawyer-workbench`（里面的画像、设置与凭据会一并消失）。

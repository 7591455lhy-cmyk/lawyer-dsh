# 发布到 GitHub

本项目发**两样东西、两个仓库**：

| 仓库 | 内容 | Release tag | 资产 |
| --- | --- | --- | --- |
| `lawyer-dsh`（本仓库） | 全部源码 + 安装包 | `app-v0.80` | `摸鱼工作站-Setup-0.80.exe`（175MB） |
| `lawyer-sidebar` | 插件最小可运行包 + 安装脚本 | `plugin-v0.80` | `lawyer-sidebar-plugin-v0.80.zip`（约 4MB） |

本文把每一步的命令与网页操作都写出来了，照抄即可。

## 零、一次性的准备

```powershell
# 1) 安装 GitHub CLI（可选，但传 175MB 的 exe 比网页稳）
winget install --id GitHub.cli

# 2) 登录（按提示用浏览器授权）
gh auth login
```

不装 `gh` 也能发：网页端 New repository / New release 都能完成，只是大文件
上传更容易超时。

## 一、发布前自检（两个仓库都要）

```powershell
# 1) 逻辑冒烟：四套全过
powershell -File plugins\lawyer-sidebar\smoke-profile.ps1
powershell -File plugins\lawyer-sidebar\smoke-prompt.ps1
powershell -File plugins\lawyer-tools\smoke-secrets.ps1
powershell -File plugins\lawyer-tools\smoke-save.ps1

# 2) 构建产物自检
node plugins\lawyer-sidebar\.check-nodemo.mjs
node packaging\.check-pkg.mjs

# 3) 提交前体检：不该进仓库的都别进
git status --short                                  # 扫一眼改动列表
git check-ignore -v packaging/runtime/VERSION        # 确认体积产物被忽略
git check-ignore -v packaging/build/icon.png         # 确认图标**没有**被忽略
# 4) 密钥复查（应无输出）
git grep -nIE 'sk-[A-Za-z0-9]{20,}|YUANDIAN_API_KEY\s*=' -- .
```

体积红线：单个文件 **100MB 硬上限**，超过 50MB 会有警告。本仓库源码约 4MB，
安装包走 Release 资产（**不计入仓库容量**，单资产上限 2GB）。

> **坑：GitHub 会剥掉 Release 资产名里的非 ASCII 字符。**
> 上传 `摸鱼工作站-Setup-0.80.exe` 之后，资产名会变成 `-Setup-0.80.exe`
> （中文被整段删掉，不是替换成连字符）。因此上传时用 ASCII 名
> （如 `MoyuWorkbench-Setup-0.80.exe`），并在 Release 正文里说明一句；
> 本地构建产物保持中文名即可。同理，`--notes-file` 的正文里可以写中文，
> 但资产文件名不要指望非 ASCII 能留住。

## 二、主仓 lawyer-dsh

远端分支是 `master`（不是 main），别建错分支。

```powershell
cd <lawyer-dsh>

git add -A
git commit -m "feat: 摸鱼工作站 0.80 —— 律师 AI 工作台（右侧栏 / 画像 / 引导 / 打包）"
git branch -M master
git push -u origin master
```

> 若远端已有内容且本地落后，先 `git pull --rebase origin master` 再推。

打 tag 并发 Release：

```powershell
# SHA256（填进 Release 正文）
$sha = (certutil -hashfile packaging\dist\摸鱼工作站-Setup-0.80.exe SHA256)[1] -replace '\s',''
$sha

git tag -a app-v0.80 -m "摸鱼工作站 0.80（无演示数据）"
git push origin app-v0.80

gh release create app-v0.80 .\packaging\dist\摸鱼工作站-Setup-0.80.exe `
  --title "摸鱼工作站 0.80" `
  --notes-file docs\release-notes\app-v0.80.md
```

正文模板见 [`release-template.md`](./release-template.md)。

网页操作等价路径：Releases → **Draft a new release** → Choose a tag 输入
`app-v0.80` → 填标题与正文 → 把 exe 拖进 Attach assets → Publish release。

## 三、插件仓 lawyer-sidebar

```powershell
cd <lawyer-sidebar>

# 1) 打包（产物 dist\lawyer-sidebar-plugin-v0.80.zip）
powershell -ExecutionPolicy Bypass -File scripts\make-plugin-zip.ps1

# 2) 提交
git init
git add -A
git commit -m "feat: 律师工作台插件包 v0.80（lawyer-sidebar + lawyer-tools + lawyer preset）"
git branch -M main

# 3) 建仓并推送（gh）
gh repo create lawyer-sidebar --public --source=. --remote=origin --push
```

网页建仓时**不要勾选生成 README / LICENSE / .gitignore**（本地已经有了）：
New repository → 建好后

```powershell
git remote add origin https://github.com/<你的用户名>/lawyer-sidebar.git
git push -u origin main
```

发 Release：

```powershell
git tag -a plugin-v0.80 -m "律师工作台插件包 v0.80"
git push origin plugin-v0.80
gh release create plugin-v0.80 .\dist\lawyer-sidebar-plugin-v0.80.zip `
  --title "律师工作台插件包 v0.80" --notes-file docs\release-notes\plugin-v0.80.md
```

## 四、发布后核对

- [ ] 两个仓库首页 README 渲染正常、图片与相对链接有效
- [ ] 两个 Release 页面资产可下载，SHA256 与本地一致
- [ ] 仓库体积正常（源码约 4MB，没有把 runtime/dist 推上去）
- [ ] 用另一台机器（或干净的用户目录）装一遍 exe，走通首启引导
- [ ] 把插件 zip 解压到干净机器跑 `install-plugin.ps1`，走通自检

## 五、两个仓库的内容划分

| 内容 | lawyer-dsh | lawyer-sidebar |
| --- | --- | --- |
| 三个插件源码与产物 | ✅ | 仅 lawyer-sidebar + lawyer-tools |
| `profiles/lawyer` preset | ✅ | ✅ |
| `skills/` | ✅ | ✅（不含第三方市场技能） |
| `packaging/`（Electron 壳与打包脚本） | ✅ | ➖ |
| `demo-artifacts/`（演示数据生产脚本） | ✅ | ➖ |
| 一键安装脚本 | `START-HERE.cmd` | `scripts/install-plugin.ps1` |
| LICENSE / NOTICE / THIRD-PARTY-NOTICES | ✅ | ✅（只列包内实际包含的上游） |
| README / CHANGELOG / SECURITY | ✅ | ✅（README 与 FAQ 为插件版口径） |

## 六、几点约定

- tag 命名：`app-<版本>` 与 `plugin-<版本>`，两者版本同源（都随
  `lawyer-sidebar` 的 `version`）。
- 每次升版：`改版本 → 重建插件 → prepare-runtime → dist → 自检 → 提交 → 发版`，
  顺序不能乱（详见 [`构建与出包.md`](./构建与出包.md) 的「版本号同步规则」）。
- Release 正文先写在 `docs/release-notes/` 下再发布，方便下次复用与回溯。

## 摸鱼工作站 0.81

运行时与内容升级：底层 dsh 升级到 **v0.1.5-rc.2**，并**移除全部演示数据**与
演示回放链路（源码不再分发演示案情与预录成果）。

### 下载

| 文件 | 大小 | SHA256 |
| --- | --- | --- |
| `MoyuWorkbench-Setup-0.81.exe` | 176.2 MB | `c4d960009398824c2a3db1b88d0de748eb2fe975cbdcb77c6b14e7d9fcefbe9c` |

```powershell
certutil -hashfile MoyuWorkbench-Setup-0.81.exe SHA256
```

> **关于文件名**：GitHub 会剥掉 Release 资产名里的非 ASCII 字符，所以这里上传的
> 名字是 ASCII 的 `MoyuWorkbench-Setup-0.81.exe`；安装程序本身仍是中文界面与
> 「摸鱼工作站」产品名，下载后随意改名不影响安装。本地构建产物
> （`packaging/dist/`）依然是 `摸鱼工作站-Setup-0.81.exe`。

> 只要右侧栏、不需要桌面壳？用插件版：
> [lawyer-sidebar 仓库](https://github.com/7591455lhy-cmyk/lawyer-sidebar) 的
> Releases（仅律师插件，不含 Electron 壳）。

### 系统要求

- Windows 10 1803 及以上、x64
- 磁盘：安装后约 500MB，建议预留 1GB
- 网络：需联网
- 自备 DeepSeek API Key（[申请](https://platform.deepseek.com/api_keys)）；
  元典 Key（法规 / 案例检索）可选

### 本次更新

**变更**

- dsh 运行时 0.1.5-alpha.2 → 0.1.5-rc.2（会话数据格式 V3、Web 根路径一次性
  token 鉴权等）。
- **移除演示数据与演示回放链路**：三个功能表单不再有「⚡ 载入演示数据」按钮，
  安装包内也不含演示案情与预录成果（`client.js` 约 358KB）。需要跑完整流程请
  自备合同 / 案件材料，用对话框的文件选择器或粘贴路径提交。

**修复**

- 出包时的 dsh 版本自检：此前改了版本号仍会沿用旧安装树（出现过"脚本声称
  0.1.5、实际装的是 0.1.1"的脱节）。现已比对已装版本与目标版本，不一致自动
  重装，无需手工清理。
- 启动时清除宿主注入的 `NODE_OPTIONS`：该语言垫片会让依赖安装静默中断（日志
  停在 `added N/1266` 且没有 `Done in`），并留下大量缺失的依赖链接，后续表现
  为构建报找不到包、类型检查报上千个错误这两个看似无关的故障。
- 三个功能表单的清理逻辑此前挂在 `ctx.on('dispose')` 上——cordis 并没有这个
  事件名，监听器注册成功但永不触发，实际从未执行清理。已改为 `ctx.effect`。

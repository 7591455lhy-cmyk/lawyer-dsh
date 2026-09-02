# 安全策略

## 支持的版本

| 版本 | 是否支持 |
| --- | --- |
| 0.80.x | ✅ |
| < 0.80 | ❌（未公开发行） |

## 报告漏洞

请通过 GitHub 的 **Security → Report a vulnerability**（私有报告）提交，
或在 Issue 中只描述现象、隐去敏感细节。请附：

- 版本号（侧栏底部 / 安装包文件名）与 Windows 版本
- 复现步骤
- 日志（见下）中**已脱敏**的相关片段

## 关于密钥：绝不要提交

- 本仓库**不包含也绝不接受**任何 API Key。提交前请自查，CI 与人工都会拦。
- `DEEPSEEK_API_KEY`：在应用内 Settings → Models 或首启引导里填写，由 dsh 的
  凭据体系保管，不落在本仓库。
- `YUANDIAN_API_KEY`：在应用的元典引导里填写，落到 dsh 用户目录下的
  `lawyer-secrets.json`（**明文，依赖操作系统账户权限保护**），
  路径随部署形态不同：
  - 开发调试：`%USERPROFILE%\.dsh\lawyer-secrets.json`
  - 安装包版：`%APPDATA%\lawyer-workbench\dsh-home\lawyer-secrets.json`
- 若怀疑 Key 泄露：立即到对应平台吊销并重新签发，不要只删除本地文件。

## 日志与隐私

- 安装包版日志：`%APPDATA%\lawyer-workbench\logs\`
- 调试模式日志：仓库根 `.dsh-web.log`
- 日志可能包含**本机文件路径与会话内容片段**。贴到 Issue 前请自行脱敏。
- 任务材料（合同、案件材料）只在工作区内处理，不会上传到本项目或任何
  第三方；但会发送给你所配置的模型服务与法规检索服务，请按所在机构的
  保密要求自行判断。

## 第三方依赖

本项目随包分发 dsh、Node、Electron、claude-for-legal-ZH 等组件，
清单与许可见 [`THIRD-PARTY-NOTICES.md`](./THIRD-PARTY-NOTICES.md)。
上游组件的安全问题请同时向上游报告。

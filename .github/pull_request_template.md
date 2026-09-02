## 改了什么

<!-- 一句话说清用户能感知的变化；改多个不相关的东西请拆成多个 PR。 -->

## 影响范围

- [ ] 仅文档
- [ ] 插件源码（lawyer-sidebar / lawyer-tools / lawyer-wizard）
- [ ] 技能 / preset
- [ ] 打包与构建（packaging）
- [ ] 演示数据

## 自检

改动源码时勾选已跑过的项：

- [ ] `powershell -File plugins/lawyer-sidebar/smoke-profile.ps1`
- [ ] `powershell -File plugins/lawyer-sidebar/smoke-prompt.ps1`
- [ ] `powershell -File plugins/lawyer-tools/smoke-secrets.ps1`
- [ ] `powershell -File plugins/lawyer-tools/smoke-save.ps1`
- [ ] 已按 `plugins/<包>/build.ps1` 重新构建，产物一并提交
- [ ] 出过包：`node packaging/.check-pkg.mjs` 通过

## 其他

- 是否需要同步版本号（见 `docs/构建与出包.md` 的「版本号同步规则」）：是 / 否
- 截图或前后对比（界面改动请附）：

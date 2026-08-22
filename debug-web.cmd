@echo off
rem lawyer-dsh M1 调试启动脚本：
rem   1) 安装 lawyer-sidebar 进 web profile（幂等，可重复执行）
rem   2) 以 patch overlay 启动 dsh web
rem 输出写入 d:\codes\lawyer-dsh\.dsh-web.log；浏览器访问 http://127.0.0.1:3080
rem 停止服务：关闭弹出的 "dsh-web" 窗口，或 taskkill /FI "WINDOWTITLE eq dsh-web*"
setlocal
cd /d d:\codes\deepseek-harness

rem 依赖已安装完毕，跳过 pnpm run 前的依赖校验（避免再次触发全量 auto-install）
set npm_config_verify_deps_before_run=false

rem 绕过 corepack 版本检查，直接使用项目锁定的 pnpm 11.7.0
set PNPM=C:\Users\lhf75\AppData\Local\node\corepack\v1\pnpm\11.7.0\bin\pnpm.cjs
if not exist "%PNPM%" set PNPM=pnpm

echo [lawyer-dsh] [1/2] installing plugin into web profile ...
node "%PNPM%" dsh plugin --profile web add file:///d:/codes/lawyer-dsh/plugins/lawyer-sidebar
if errorlevel 1 (
  echo [lawyer-dsh] plugin install failed - see output above
  pause
  exit /b 1
)

echo [lawyer-dsh] [2/2] starting dsh web with patch overlay ...
node "%PNPM%" dsh web --patch d:\codes\lawyer-dsh\plugins\lawyer-sidebar\cordis.yml > d:\codes\lawyer-dsh\.dsh-web.log 2>&1
endlocal

@echo off
rem lawyer-dsh M2.1 调试启动脚本：
rem   0) 停掉已在运行的 dsh web（按 3080 端口定位进程树；旧进程持有
rem      profile 文件句柄，不杀会导致插件重装失败）
rem   1) 强制重装 lawyer-sidebar 与 lawyer-tools 进 web profile
rem      关键：pnpm 对 file: 依赖在路径 spec 不变时直接跳过内容更新
rem      （版本号 bump 也不触发），必须先 remove 再 add 才能取到最新
rem      构建产物——否则浏览器永远加载旧版 client.js
rem   2) 部署 lawyer agent preset 到 %USERPROFILE%\.dsh\.agent-presets（幂等覆盖）
rem   3) 以 patch overlay 启动 dsh web
rem 前置：
rem   - 两个插件的构建产物已生成（分别在 plugins/lawyer-sidebar 与
rem     plugins/lawyer-tools 下运行 powershell -ExecutionPolicy Bypass -File build.ps1）
rem   - 元典 MCP 需要环境变量 YUANDIAN_API_KEY（open.chineselaw.com 注册获取；
rem     未设置时法规检索工具不可用，合同审核按技能降级指引继续）
rem 输出写入 d:\codes\lawyer-dsh\.dsh-web.log；浏览器访问 http://127.0.0.1:3080
rem （启动后请在浏览器 Ctrl+F5 强刷一次）
setlocal
cd /d d:\codes\deepseek-harness

rem 依赖已安装完毕，跳过 pnpm run 前的依赖校验（避免再次触发全量 auto-install）
set npm_config_verify_deps_before_run=false

rem 绕过 corepack 版本检查，直接使用项目锁定的 pnpm 11.7.0
set PNPM=C:\Users\lhf75\AppData\Local\node\corepack\v1\pnpm\11.7.0\bin\pnpm.cjs
if not exist "%PNPM%" set PNPM=pnpm

echo [lawyer-dsh] [0/3] stopping any running dsh web on port 3080 ...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":3080.*LISTENING"') do taskkill /T /F /PID %%a >nul 2>&1

echo [lawyer-dsh] [1/3] reinstalling plugins into web profile ...
rem remove 容错（首次运行时包不存在会失败，忽略即可）
node "%PNPM%" dsh plugin --profile web remove lawyer-sidebar >nul 2>&1
node "%PNPM%" dsh plugin --profile web remove lawyer-tools >nul 2>&1
node "%PNPM%" dsh plugin --profile web add file:///d:/codes/lawyer-dsh/plugins/lawyer-sidebar
if errorlevel 1 (
  echo [lawyer-dsh] lawyer-sidebar install failed - see output above
  pause
  exit /b 1
)
node "%PNPM%" dsh plugin --profile web add file:///d:/codes/lawyer-dsh/plugins/lawyer-tools
if errorlevel 1 (
  echo [lawyer-dsh] lawyer-tools install failed - see output above
  pause
  exit /b 1
)

echo [lawyer-dsh] [2/3] deploying lawyer agent preset ...
if not exist "%USERPROFILE%\.dsh\.agent-presets" mkdir "%USERPROFILE%\.dsh\.agent-presets"
xcopy /E /I /Y d:\codes\lawyer-dsh\profiles\lawyer "%USERPROFILE%\.dsh\.agent-presets\lawyer" >nul
if errorlevel 1 (
  echo [lawyer-dsh] preset deploy failed - see output above
  pause
  exit /b 1
)

echo [lawyer-dsh] [3/3] starting dsh web with patch overlay ...
node "%PNPM%" dsh web --patch d:\codes\lawyer-dsh\plugins\lawyer-sidebar\cordis.yml > d:\codes\lawyer-dsh\.dsh-web.log 2>&1
endlocal

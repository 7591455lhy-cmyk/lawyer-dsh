@echo off
rem lawyer-dsh M2.1 调试启动脚本：
rem   0) 停掉已在运行的 dsh web（按 3080 端口定位进程树；旧进程持有
rem      profile 文件句柄，不杀会导致插件重装失败）
rem   1) 强制重装 lawyer-sidebar / lawyer-tools / lawyer-wizard 进 web profile
rem      关键：pnpm 对 file: 依赖在路径 spec 不变时直接跳过内容更新
rem      （版本号 bump 也不触发），必须先 remove 再 add 才能取到最新
rem      构建产物——否则浏览器永远加载旧版 client.js
rem   2) 部署 lawyer agent preset 到 %USERPROFILE%\.dsh\.agent-presets（幂等覆盖）
rem   3) 安装 claude-for-legal-ZH 的 dsh adapter skills（M7，缺失则告警跳过）
rem   4) 以 patch overlay 启动 dsh web
rem 前置：
rem   - 三个插件的构建产物已生成（分别在 plugins/lawyer-sidebar、
rem     plugins/lawyer-tools 与 plugins/lawyer-wizard 下运行
rem     powershell -ExecutionPolicy Bypass -File build.ps1；
rem     或直接运行 START-HERE.cmd 一键恢复环境并构建）
rem   - 元典 MCP 需要环境变量 YUANDIAN_API_KEY（open.chineselaw.com 注册获取；
rem     未设置时法规检索工具不可用，合同审核按技能降级指引继续）
rem 路径定位（无硬编码，交接任意机器可用）：
rem   - lawyer-dsh 根 = 本脚本所在目录（%~dp0 推导）
rem   - deepseek-harness = 环境变量 DSH_HARNESS_ROOT；未设置时取与
rem     lawyer-dsh 并排的 ..\deepseek-harness（两目录须放在同一父目录下）
rem   - pnpm 优先用 corepack 锁定的 11.7.0（经 %LOCALAPPDATA% 定位，
rem     绕过版本检查）；不存在时退回 PATH 里的 pnpm
rem 输出写入 <lawyer-dsh 根>\.dsh-web.log；浏览器访问 http://127.0.0.1:3080
rem （启动后请在浏览器 Ctrl+F5 强刷一次）
setlocal
for %%i in ("%~dp0.") do set "LAWYER_ROOT=%%~fi"

rem --- 定位 deepseek-harness ---
if defined DSH_HARNESS_ROOT (
  set "HARNESS=%DSH_HARNESS_ROOT%"
) else (
  for %%i in ("%LAWYER_ROOT%\..\deepseek-harness") do set "HARNESS=%%~fi"
)
if not exist "%HARNESS%\package.json" (
  echo [lawyer-dsh] deepseek-harness not found at "%HARNESS%"
  echo [lawyer-dsh] keep deepseek-harness next to lawyer-dsh, or set DSH_HARNESS_ROOT to the harness root
  pause
  exit /b 1
)
cd /d "%HARNESS%"

rem 依赖已安装完毕，跳过 pnpm run 前的依赖校验（避免再次触发全量 auto-install）
set npm_config_verify_deps_before_run=false

rem --- pnpm 调用方式：corepack 锁定的 11.7.0 优先，退回 PATH 里的 pnpm ---
set "PNPM=%LOCALAPPDATA%\node\corepack\v1\pnpm\11.7.0\bin\pnpm.cjs"
set "PNPM_CALL=node "%PNPM%""
if not exist "%PNPM%" set "PNPM_CALL=pnpm"

rem --- lawyer-dsh 根的 file:/// 形式（反斜杠转正斜杠，盘符大小写不敏感）---
set "LR_URL=%LAWYER_ROOT:\=/%"

echo [lawyer-dsh] [0/3] stopping any running dsh web on port 3080 ...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":3080.*LISTENING"') do taskkill /T /F /PID %%a >nul 2>&1

echo [lawyer-dsh] [1/3] reinstalling plugins into web profile ...
rem remove 容错（首次运行时包不存在会失败，忽略即可）
%PNPM_CALL% dsh plugin --profile web remove lawyer-sidebar >nul 2>&1
%PNPM_CALL% dsh plugin --profile web remove lawyer-tools >nul 2>&1
%PNPM_CALL% dsh plugin --profile web remove lawyer-wizard >nul 2>&1
%PNPM_CALL% dsh plugin --profile web add file:///%LR_URL%/plugins/lawyer-sidebar
if errorlevel 1 (
  echo [lawyer-dsh] lawyer-sidebar install failed - see output above
  pause
  exit /b 1
)
%PNPM_CALL% dsh plugin --profile web add file:///%LR_URL%/plugins/lawyer-tools
if errorlevel 1 (
  echo [lawyer-dsh] lawyer-tools install failed - see output above
  pause
  exit /b 1
)
%PNPM_CALL% dsh plugin --profile web add file:///%LR_URL%/plugins/lawyer-wizard
if errorlevel 1 (
  echo [lawyer-dsh] lawyer-wizard install failed - see output above
  pause
  exit /b 1
)

echo [lawyer-dsh] [2/3] deploying lawyer agent preset ...
if not exist "%USERPROFILE%\.dsh\.agent-presets" mkdir "%USERPROFILE%\.dsh\.agent-presets"
xcopy /E /I /Y "%LAWYER_ROOT%\profiles\lawyer" "%USERPROFILE%\.dsh\.agent-presets\lawyer" >nul
if errorlevel 1 (
  echo [lawyer-dsh] preset deploy failed - see output above
  pause
  exit /b 1
)

echo [lawyer-dsh] [3/4] installing claude-for-legal-ZH dsh adapters ...
rem M7：侧栏三个入口的指令按该仓库的中国法规范路由（adapter skill → 领域
rem CLAUDE.md → skills/SKILL.md）。仓库须与 lawyer-dsh 并排放在同一父目录；
rem 缺失时只告警不阻断——侧栏仍可用，只是拿不到该仓库的领域工作流与门禁。
for %%i in ("%LAWYER_ROOT%\..\claude-for-legal-ZH") do set "LEGALZH=%%~fi"
if exist "%LEGALZH%\.dsh\skills" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%LAWYER_ROOT%\scripts\install-legal-zh.ps1" -RepoDir "%LEGALZH%"
) else (
  echo [lawyer-dsh] [!] 未找到 claude-for-legal-ZH: %LEGALZH%
  echo     侧栏三个入口的中国法规范路由不可用。克隆到该目录即可:
  echo     git clone https://github.com/CSlawyer1985/claude-for-legal-ZH.git "%LEGALZH%"
)

echo [lawyer-dsh] [4/4] starting dsh web with patch overlay ...
%PNPM_CALL% dsh web --patch "%LAWYER_ROOT%\plugins\lawyer-sidebar\cordis.yml" > "%LAWYER_ROOT%\.dsh-web.log" 2>&1
endlocal

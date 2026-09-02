@echo off
setlocal
chcp 65001 >nul 2>&1
title lawyer-dsh 交接包打包

rem ============================================================
rem  lawyer-dsh 交接包一键打包（在交接人自己的机器上运行）
rem  产物: <lawyer-dsh 上级目录>\lawyer-dsh-handoff-<日期>.zip
rem  内容: lawyer-dsh 全部源码 + deepseek-harness 源码与已构建
rem        产物（lib/）+ CODEBUDDY.md
rem  排除: 两侧 node_modules、packaging 可重建产物（dist/runtime/
rem        release/.cache）、日志、pyc 缓存等
rem ============================================================

for %%i in ("%~dp0.") do set "LAWYER_ROOT=%%~fi"
for %%i in ("%LAWYER_ROOT%\..") do set "CODES_ROOT=%%~fi"
set "HARNESS=%CODES_ROOT%\deepseek-harness"
set "STAGING=%TEMP%\lawyer-dsh-handoff-staging"

if not exist "%HARNESS%\package.json" (
  echo [X] 未找到 %HARNESS%
  echo     本脚本假定 deepseek-harness 与 lawyer-dsh 并排放置
  pause
  exit /b 1
)

for /f %%d in ('powershell -NoProfile -Command "Get-Date -Format yyyyMMdd"') do set "TODAY=%%d"
set "ZIP=%CODES_ROOT%\lawyer-dsh-handoff-%TODAY%.zip"

echo.
echo [1/5] 清理旧暂存目录 ...
if exist "%STAGING%" rd /s /q "%STAGING%"
mkdir "%STAGING%" 2>nul
if not exist "%STAGING%" (
  echo [X] 无法创建暂存目录 %STAGING%
  pause
  exit /b 1
)

echo [2/5] 复制 lawyer-dsh（排除 node_modules/缓存/日志/pyc/测试残留）...
rem .link-test/.link-test2/.link-test3 是早期 pnpm 装配实验的残留，不进交接包
robocopy "%LAWYER_ROOT%" "%STAGING%\lawyer-dsh" /E ^
  /XD node_modules .pnpm-store __pycache__ .codebuddy .vscode .idea .git .link-test .link-test2 .link-test3 ^
  /XF *.pyc *.log *.tmp Thumbs.db desktop.ini ^
  /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 (
  echo [X] 复制 lawyer-dsh 失败，robocopy 退出码 %ERRORLEVEL%
  goto :cleanup_fail
)

echo [3/5] 复制 deepseek-harness（源码 + 已构建 lib 产物，排除 node_modules）...
robocopy "%HARNESS%" "%STAGING%\deepseek-harness" /E ^
  /XD node_modules .pnpm-store __pycache__ .codebuddy .vscode .idea .git ^
  /XF *.log *.tmp Thumbs.db desktop.ini ^
  /NFL /NDL /NJH /NJS /NP >nul
if errorlevel 8 (
  echo [X] 复制 deepseek-harness 失败，robocopy 退出码 %ERRORLEVEL%
  goto :cleanup_fail
)

echo [4/5] 剔除 lawyer-dsh 内可重建的打包产物（packaging 下 dist/runtime 等）...
for %%d in (dist runtime release .cache) do (
  if exist "%STAGING%\lawyer-dsh\packaging\%%d" rd /s /q "%STAGING%\lawyer-dsh\packaging\%%d"
)
rem CODEBUDDY.md 是项目约定速览（同事必读），随包带上
if exist "%CODES_ROOT%\CODEBUDDY.md" copy /Y "%CODES_ROOT%\CODEBUDDY.md" "%STAGING%\CODEBUDDY.md" >nul

echo [5/5] 压缩中（文件较多，可能需要几分钟）...
if exist "%ZIP%" del /f /q "%ZIP%"
rem 用系统自带 bsdtar 生成 zip。Compress-Archive 与 .NET ZipFile 在
rem PowerShell 5.1 下都会生成反斜杠路径的 entry（非标准 zip），部分
rem 解压工具会把整条路径当成文件名；bsdtar 生成标准正斜杠路径。
rem tar 需要 Windows 10 1803+（系统自带）。
where tar >nul 2>&1
if errorlevel 1 (
  echo [X] 未找到 tar —— 需要Windows 10 1803+ 自带的 tar.exe
  goto :cleanup_fail
)
set "ZIP_ITEMS=lawyer-dsh deepseek-harness"
if exist "%STAGING%\CODEBUDDY.md" set "ZIP_ITEMS=%ZIP_ITEMS% CODEBUDDY.md"
tar -a -cf "%ZIP%" -C "%STAGING%" %ZIP_ITEMS%
if errorlevel 1 (
  echo [X] 压缩失败 —— 暂存目录已保留供排查: %STAGING%
  pause
  exit /b 1
)

echo.
echo 打包完成: %ZIP%
powershell -NoProfile -Command "'大小: ' + [math]::Round((Get-Item '%ZIP%').Length / 1MB, 1) + ' MB'"
rd /s /q "%STAGING%" >nul 2>&1
echo.
echo 交接提醒:
echo   1. zip 不含任何密钥 —— YUANDIAN_API_KEY 请私下交接给同事
echo   2. 同事解压后保持 deepseek-harness 与 lawyer-dsh 并排，双击 lawyer-dsh\START-HERE.cmd
echo   3. 同事需自备 DeepSeek 模型 key（Web 界面 Settings - Models 填写）
pause
exit /b 0

:cleanup_fail
rd /s /q "%STAGING%" >nul 2>&1
pause
exit /b 1

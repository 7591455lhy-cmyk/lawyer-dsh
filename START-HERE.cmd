@echo off
setlocal
chcp 65001 >nul 2>&1
title lawyer-dsh 环境恢复引导

rem ============================================================
rem  lawyer-dsh 交接环境一键恢复（拿到交接包后双击这里）
rem  前置：Windows 10/11 + Node 22.19+/24+ + pnpm 11.7.0
rem  布局要求：本脚本所在的 lawyer-dsh 与 deepseek-harness
rem            放在同一父目录下（盘符与目录名不限）
rem  详细说明：docs\交接指南.md
rem ============================================================

for %%i in ("%~dp0.") do set "LAWYER_ROOT=%%~fi"
for %%i in ("%LAWYER_ROOT%\..\deepseek-harness") do set "HARNESS=%%~fi"

echo.
echo ===== [0/5] 环境自检 =====

where node >nul 2>&1
if errorlevel 1 (
  echo [X] 未检测到 Node.js —— 请先安装 Node 22.19+ 或 24+：https://nodejs.org
  goto :fail
)
for /f "delims=" %%v in ('node -v 2^>nul') do set "NODEV=%%v"
if not defined NODEV set "NODEV=v0.0.0"
set "NODEMAJOR=%NODEV:~1,2%"
if %NODEMAJOR% LSS 22 (
  echo [X] Node %NODEV% 版本过低 —— 需要 22.19+ 或 24+，请到 https://nodejs.org 升级
  goto :fail
)
echo [OK] Node %NODEV%

where pnpm >nul 2>&1
if errorlevel 1 (
  echo [X] 未检测到 pnpm —— 请运行: npm install -g pnpm@11.7.0
  goto :fail
)
for /f "delims=" %%v in ('pnpm -v 2^>nul') do set "PNPMV=%%v"
echo [OK] pnpm %PNPMV%

if not exist "%HARNESS%\package.json" (
  echo [X] 未找到 deepseek-harness: %HARNESS%
  echo     请将交接包中的 deepseek-harness 与 lawyer-dsh 放在同一父目录下
  goto :fail
)
echo [OK] deepseek-harness 就位: %HARNESS%

echo.
echo ===== [1/5] 安装 deepseek-harness 依赖 =====
if exist "%HARNESS%\node_modules\.pnpm" (
  echo [OK] harness 依赖已存在，跳过安装
  goto :build
)
echo 将在 deepseek-harness 下执行 pnpm install —— 需联网，可能耗时几分钟。
choice /C YN /M "现在安装"
if errorlevel 2 (
  echo 已跳过 —— 之后请手动执行: cd /d "%HARNESS%" 然后运行 pnpm install
  goto :build
)
pushd "%HARNESS%"
call pnpm install
set "RC=%ERRORLEVEL%"
popd
if not "%RC%"=="0" (
  echo [X] pnpm install 失败，退出码 %RC% —— 请检查网络/代理后重试
  goto :fail
)
echo [OK] harness 依赖安装完成

:build
echo.
echo ===== [2/5] 构建三个插件 =====
for %%p in (lawyer-sidebar lawyer-tools lawyer-wizard) do (
  echo ---- %%p ----
  powershell -NoProfile -ExecutionPolicy Bypass -File "%LAWYER_ROOT%\plugins\%%p\build.ps1"
  if errorlevel 1 (
    echo [X] %%p 构建失败 —— 请检查上方报错，常见原因是 harness 依赖未安装
    goto :fail
  )
)
echo [OK] 三个插件构建完成

echo.
echo ===== [3/5] 安装 claude-for-legal-ZH（中国法技能语料，M7）=====
rem 侧栏三个入口（合同审核/案件分析/文书生成）的指令按该仓库的中国法规范
rem 路由：/chinese-legal-* adapter → 领域 CLAUDE.md → skills/SKILL.md。
rem 需与 lawyer-dsh 并排放在同一父目录；缺失时功能降级为无领域工作流。
for %%i in ("%LAWYER_ROOT%\..\claude-for-legal-ZH") do set "LEGALZH=%%~fi"
if exist "%LEGALZH%\.dsh\skills" (
  powershell -NoProfile -ExecutionPolicy Bypass -File "%LAWYER_ROOT%\scripts\install-legal-zh.ps1" -RepoDir "%LEGALZH%"
  if errorlevel 1 (
    echo [X] claude-for-legal-ZH adapter 安装失败 —— 请检查上方报错
    goto :fail
  )
  echo [OK] claude-for-legal-ZH adapter 已装入 dsh 技能目录
) else (
  echo [!] 未找到 claude-for-legal-ZH: %LEGALZH%
  echo     侧栏三个入口将缺少中国法领域工作流与质量门禁。克隆后重跑本脚本:
  echo     git clone https://github.com/CSlawyer1985/claude-for-legal-ZH.git "%LEGALZH%"
)

echo.
echo ===== [4/5] 检查环境变量 =====
if defined YUANDIAN_API_KEY (
  echo [OK] YUANDIAN_API_KEY 已设置
) else (
  echo [!] 未设置 YUANDIAN_API_KEY —— 元典法规检索工具将不可用
  echo     合同审核会按技能内置的降级指引继续，不影响其他功能
  echo     获取方式: https://open.chineselaw.com 注册，key 向交接同事索取
  echo     设置命令: setx YUANDIAN_API_KEY "你的key"   注意 setx 后需新开终端生效
)

echo.
echo ===== [5/5] 完成 =====
echo.
echo 恢复完成！建议下一步：
echo   1. 双击 debug-web.cmd 启动调试（也可现在直接启动）
echo   2. 浏览器打开 http://127.0.0.1:3080 并 Ctrl+F5 强刷
echo   3. 在 Web 界面 Settings - Models 填入你自己的 DeepSeek API key
echo   4. 阅读项目约定: CODEBUDDY.md 与 docs\交接指南.md
choice /C YN /M "是否立即启动调试（debug-web.cmd）"
if errorlevel 2 goto :done
call "%LAWYER_ROOT%\debug-web.cmd"

:done
echo.
echo 日常调试: 双击 debug-web.cmd
pause
exit /b 0

:fail
echo.
echo 恢复未完成 —— 请按上方提示处理后重新运行本脚本，详见 docs\交接指南.md
pause
exit /b 1

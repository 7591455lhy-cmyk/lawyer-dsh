# lawyer-sidebar 构建脚本：用 esbuild 生成双面产物（lib/client.js + lib/index.js）。
# 产物格式与 deepseek-harness 的 tsdown 预设一致（闭包工厂 bundle），
# 也可在用户终端改用 tsdown：见 tsdown.config.mjs。
#
# 用法：powershell -ExecutionPolicy Bypass -File build.ps1 [-NoDemo]
param(
  # deepseek-harness 仓库根目录（提供 esbuild 工具链）。
  # 默认自动探测：lawyer-dsh 同级的 deepseek-harness（本脚本向上三级）；
  # 目录布局不同时可显式传 -Harness <路径>
  [string]$Harness = '',
  # 出「无演示数据」版本：把 __LAWYER_DEMO__ 定义为 false，三个功能表单的
  # 「⚡ 载入演示数据」按钮与演示回放链路整体消失，demoData.ts（21KB 案情
  # 文本）与 demoArtifacts.data.ts（131KB 预录 docx base64）因此变成未引用
  # 模块而被 tree-shaking 掉。默认（不带本开关）仍出带演示数据的版本。
  [switch]$NoDemo
)

$ErrorActionPreference = 'Stop'

# --- 定位 harness：未显式指定时按并排布局自动探测 ---
if (-not $Harness) {
  $root = Split-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) -Parent
  $candidate = Join-Path $root 'deepseek-harness'
  if (Test-Path (Join-Path $candidate 'package.json')) {
    $Harness = $candidate
  } else {
    throw "deepseek-harness not found at '$candidate'. Keep deepseek-harness next to lawyer-dsh, or pass -Harness <path>."
  }
}
$plugin = Split-Path -Parent $MyInvocation.MyCommand.Path

# --- 定位 esbuild 可执行文件 ---
# 优先 pnpm store 里的原生 exe（不经过 node_modules 符号链接，
# 在禁用重解析点遍历的环境里也能工作）；退回 .bin shim。
$storeRoot = Join-Path $Harness 'node_modules\.pnpm'
$esbuild = $null
if (Test-Path $storeRoot) {
  $candidate = Get-ChildItem $storeRoot -Directory -Filter '@esbuild+win32-x64@*' |
    Sort-Object Name -Descending | Select-Object -First 1
  if ($null -ne $candidate) {
    $exe = Join-Path $candidate.FullName 'node_modules\@esbuild\win32-x64\esbuild.exe'
    if (Test-Path $exe) { $esbuild = $exe }
  }
}
if ($null -eq $esbuild) {
  $shim = Join-Path $Harness 'node_modules\.bin\esbuild.CMD'
  if (Test-Path $shim) { $esbuild = $shim }
}
if ($null -eq $esbuild) {
  throw "esbuild not found under $Harness (looked in .pnpm store and .bin)"
}
Write-Host "esbuild: $esbuild"

# --- 演示数据开关：编译期常量，配合源码里的 __LAWYER_DEMO__ ---
$demoMode = if ($NoDemo) { 'false' } else { 'true' }
Write-Host "demo data: $demoMode"

# --- 浏览器半：闭包工厂 client bundle ---
$clientArgs = @(
  (Join-Path $plugin 'src\client\index.ts'),
  '--bundle', '--format=cjs', '--platform=browser', '--jsx=automatic',
  "--define:__LAWYER_DEMO__=$demoMode",
  # 关键：不加这一项，esbuild 只把 __LAWYER_DEMO__ 替换成字面量，却**保留**
  # `if (false) {...}` / `false ? A : B` 的原文——死分支里的引用还在，而它
  # 引用的模块已被判定为未引用而删掉，产物里就会留下**悬空标识符**
  # （实测：DEMO_ARTIFACTS / CONTRACT_REVIEW_DEMO / buildDemoReplayPrompt
  # 全是 dangling ref）。--minify-syntax 做真正的死代码消除，让这些引用连
  # 着分支一起消失。注意它不是完整 minify：不改标识符、不压空白。
  '--minify-syntax',
  '--external:react', '--external:react/jsx-runtime',
  '--external:react-dom', '--external:react-dom/client',
  '--external:@deepseek-ai/cordis',
  '--external:@deepseek-ai/dsh-client-ui-slots',
  '--external:@deepseek-ai/dsh-client-ui-primitives',
  '--external:@deepseek-ai/dsh-client-runtime/client',
  '--external:@deepseek-ai/dsh-api-remotes/client',
  '--sourcemap',
  ('--outfile=' + (Join-Path $plugin 'lib\client.js')),
  '--banner:js=window.__ModuleLoader__.load({ id: \"lawyer-sidebar\", factory: (require) => { var module = { exports: {} }; var exports = module.exports;',
  '--footer:js=return module.exports; } });'
)
& $esbuild @clientArgs
if ($LASTEXITCODE -ne 0) { throw 'client bundle build failed' }

# --- Node 半：Host loader 入口（空 apply）---
$nodeArgs = @(
  (Join-Path $plugin 'src\index.ts'),
  '--format=esm', '--platform=node',
  ('--outfile=' + (Join-Path $plugin 'lib\index.js'))
)
& $esbuild @nodeArgs
if ($LASTEXITCODE -ne 0) { throw 'node half build failed' }

Write-Host "build OK: $plugin\lib\client.js + lib\index.js"

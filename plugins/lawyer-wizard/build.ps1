# lawyer-wizard 构建脚本：用 esbuild 生成双面产物（lib/client.js + lib/index.js）。
# 与 lawyer-sidebar/build.ps1 同构，仅插件目录与 PLUGIN_ID 不同。
#
# 用法：powershell -ExecutionPolicy Bypass -File build.ps1
param(
  # deepseek-harness 仓库根目录（提供 esbuild 工具链）。
  # 默认自动探测：lawyer-dsh 同级的 deepseek-harness（本脚本向上三级）；
  # 目录布局不同时可显式传 -Harness <路径>
  [string]$Harness = ''
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
$pluginId = 'lawyer-wizard'

# --- 定位 esbuild 可执行文件 ---
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

# --- 浏览器半：闭包工厂 client bundle ---
$clientArgs = @(
  (Join-Path $plugin 'src\client\index.ts'),
  '--bundle', '--format=cjs', '--platform=browser', '--jsx=automatic',
  '--external:react', '--external:react/jsx-runtime',
  '--external:react-dom', '--external:react-dom/client',
  '--external:@deepseek-ai/cordis',
  '--external:@deepseek-ai/dsh-client-ui-slots',
  '--external:@deepseek-ai/dsh-client-ui-primitives',
  '--external:@deepseek-ai/dsh-client-runtime/client',
  '--external:@deepseek-ai/dsh-api-remotes/client',
  '--sourcemap',
  ('--outfile=' + (Join-Path $plugin 'lib\client.js')),
  ('--banner:js=window.__ModuleLoader__.load({ id: \"' + $pluginId + '\", factory: (require) => { var module = { exports: {} }; var exports = module.exports;'),
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

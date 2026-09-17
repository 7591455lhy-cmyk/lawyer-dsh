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

# --- 定位 harness：环境变量 > 显式参数 > 并排布局自动探测 ---
# DSH_HARNESS_ROOT 是给「同一台机器上并存多个 harness 版本」用的开关：
# 升级验证期把它指向 0.1.5 副本（deepseek-harness-015），不设则继续用并排的
# deepseek-harness（0.1.1-rc.2）。debug-web.cmd 与 START-HERE.cmd 只需设置
# 同一个环境变量即可整体切换，不必改任何脚本。
if (-not $Harness -and $env:DSH_HARNESS_ROOT) { $Harness = $env:DSH_HARNESS_ROOT }
if (-not $Harness) {
  $root = Split-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) -Parent
  # 依次探测：优先当前在用的 0.1.5 副本（deepseek-harness-015），其次并排的
  # deepseek-harness。M8.12 为省空间清掉了旧副本的工作树（仅保留共享 .git），
  # 只探测主目录会拿到一个没有 package.json / node_modules 的空壳。
  $candidates = @('deepseek-harness-015', 'deepseek-harness') | ForEach-Object { Join-Path $root $_ }
  $candidate = $candidates | Where-Object { Test-Path (Join-Path $_ 'package.json') } | Select-Object -First 1
  if ($candidate) {
    $Harness = $candidate
  } else {
    throw "deepseek-harness not found (tried: $($candidates -join ', ')). Keep a harness checkout next to lawyer-dsh, or pass -Harness <path>."
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
  # 0.1.5 起 @deepseek-ai/dsh-client-runtime 已不存在（改名 dsh-client-modules
  # 后不再导出插件面类型），本项目已无任何对它的 import，故不再 external 它——
  # 它其实是引导包（含模块系统 bootstrap），普通插件声明它会污染加载。
  # 剩下的这一项不在 dsh 的 PLATFORM_MODULES 基线里，必须同时在 package.json
  # 的 dsh.client.external 声明，运行时模块表才会提供。
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

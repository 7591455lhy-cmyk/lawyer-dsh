# lawyer-dsh prompt 冒烟（可复跑）：bundle smoke-prompt-entry.ts 并断言输出。
# 用法：powershell -ExecutionPolicy Bypass -File smoke-prompt.ps1 [-Harness <dsh 源码根目录>]
param(
  # deepseek-harness 根目录（提供 esbuild 工具链）。默认按并排布局自动探测。
  [string]$Harness = ''
)
$ErrorActionPreference = 'Stop'
$plugin = $PSScriptRoot
if (-not $Harness) {
  $Harness = Join-Path (Split-Path (Split-Path (Split-Path $plugin -Parent) -Parent) -Parent) 'deepseek-harness'
}

$store = Get-ChildItem (Join-Path $Harness 'node_modules\.pnpm') -Directory -Filter '@esbuild+win32-x64@*' |
  Sort-Object Name -Descending | Select-Object -First 1
$esbuild = Join-Path $store.FullName 'node_modules\@esbuild\win32-x64\esbuild.exe'
$entry = Join-Path $plugin 'smoke-prompt-entry.ts'
$out = Join-Path $plugin '.smoke-prompt.mjs'
& $esbuild $entry --bundle --format=esm --platform=node --outfile=$out
if ($LASTEXITCODE -ne 0) { Write-Host 'BUNDLE-FAIL'; exit 1 }
node $out
exit $LASTEXITCODE
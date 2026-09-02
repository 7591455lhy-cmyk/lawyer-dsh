# lawyer-dsh Host 冒烟（可复跑）：lawyerSecrets 凭据服务的读写、env 注入与落盘。
# 用法：powershell -ExecutionPolicy Bypass -File smoke-secrets.ps1 [-Harness <dsh 源码根目录>]
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
# lawyer-tools 的依赖（yaml）在 web profile 的 hoisted node_modules 里；未跑过
# prepare-runtime 时该目录不存在，跳过即可（yaml 会从本机 node_modules 解析）。
$profileModules = Join-Path (Split-Path (Split-Path $plugin -Parent) -Parent) 'packaging\runtime\profile-web\node_modules'
if (Test-Path $profileModules) { $env:NODE_PATH = $profileModules }
$entry = Join-Path $plugin 'smoke-secrets-entry.ts'
$out = Join-Path $plugin '.smoke-secrets.mjs'
& $esbuild $entry --bundle --format=esm --platform=node `
  --banner:js="import { createRequire } from 'node:module'; const require = createRequire(import.meta.url);" `
  --outfile=$out
if ($LASTEXITCODE -ne 0) { Write-Host 'BUNDLE-FAIL'; exit 1 }
node $out
exit $LASTEXITCODE

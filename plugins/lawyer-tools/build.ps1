# lawyer-tools 构建脚本：用 esbuild 生成 Host 半产物（lib/index.js，ESM transpile）。
# yaml 等运行时依赖保持 external（由 profile 的 node_modules 解析）。
#
# 用法：powershell -ExecutionPolicy Bypass -File build.ps1
param(
  # deepseek-harness 仓库根目录（提供 esbuild 工具链）
  [string]$Harness = 'd:\codes\deepseek-harness'
)

$ErrorActionPreference = 'Stop'
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

# --- Host 半：ESM transpile（import 原样保留）---
$nodeArgs = @(
  (Join-Path $plugin 'src\index.ts'),
  '--format=esm', '--platform=node', '--target=es2022',
  ('--outfile=' + (Join-Path $plugin 'lib\index.js'))
)
& $esbuild @nodeArgs
if ($LASTEXITCODE -ne 0) { throw 'node half build failed' }

Write-Host "build OK: $plugin\lib\index.js"

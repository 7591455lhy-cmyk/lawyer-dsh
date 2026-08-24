# lawyer-sidebar 构建脚本：用 esbuild 生成双面产物（lib/client.js + lib/index.js）。
# 产物格式与 deepseek-harness 的 tsdown 预设一致（闭包工厂 bundle），
# 也可在用户终端改用 tsdown：见 tsdown.config.mjs。
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

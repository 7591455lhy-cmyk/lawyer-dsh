# 复制本机 dsh 凭证到 Electron 壳的 DSH_HOME（验证便利；不动源文件）。
$ErrorActionPreference = 'Stop'
$dshHome = Join-Path $env:APPDATA 'lawyer-workbench\dsh-home'
New-Item -ItemType Directory -Force -Path $dshHome | Out-Null
foreach ($name in @('.credentials.yaml', 'settings.yaml', '.anonymous-user-id')) {
  $src = Join-Path $env:USERPROFILE ".dsh\$name"
  if (Test-Path $src) { Copy-Item $src (Join-Path $dshHome $name) -Force }
}
Write-Host 'credentials copied'
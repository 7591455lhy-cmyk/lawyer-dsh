# 等待 debug-web.cmd 的 dsh web 就绪（M2 路径：~/.dsh profile + --patch overlay）。
$ErrorActionPreference = 'Continue'
$ok = $false
for ($i = 0; $i -lt 45; $i++) {
  Start-Sleep -Seconds 2
  try {
    $r = Invoke-WebRequest -Uri 'http://127.0.0.1:3080' -UseBasicParsing -TimeoutSec 3
    Write-Host ("HTTP-3080: " + $r.StatusCode)
    $ok = $true
    break
  } catch {
    Write-Host ("waiting... " + ($i + 1))
  }
}
$log = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) '.dsh-web.log'
if (Test-Path $log) {
  Write-Host '--- .dsh-web.log tail ---'
  Get-Content $log -Tail 12 | ForEach-Object { Write-Host ("  " + $_) }
}
if (-not $ok) { Write-Host 'SERVER-NOT-READY' }
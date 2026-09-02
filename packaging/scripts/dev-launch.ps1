# 开发模式启动 Electron 壳并探测 3080（lawyer-dsh M5 验证用）。
$ErrorActionPreference = 'Continue'
Set-Location (Split-Path $PSScriptRoot -Parent)

Start-Process -FilePath (Join-Path (Get-Location) 'node_modules\.bin\electron.cmd') `
  -ArgumentList '.' -WorkingDirectory (Get-Location) -WindowStyle Hidden

$ok = $false
for ($i = 0; $i -lt 40; $i++) {
  Start-Sleep -Seconds 2
  try {
    $res = Invoke-WebRequest -Uri 'http://127.0.0.1:3080' -UseBasicParsing -TimeoutSec 3
    Write-Host ("HTTP-3080: " + $res.StatusCode)
    $ok = $true
    break
  } catch {
    Write-Host ("waiting... " + ($i + 1))
  }
}

$procs = Get-Process electron -ErrorAction SilentlyContinue
Write-Host ("electron processes: " + (@($procs).Count))
foreach ($p in $procs) {
  if ($p.MainWindowTitle) { Write-Host ("  window: [" + $p.MainWindowTitle + "] pid=" + $p.Id) }
}

$home2 = Join-Path $env:APPDATA 'lawyer-workbench\dsh-home'
if (Test-Path $home2) {
  Write-Host '--- deployed dsh-home ---'
  Get-ChildItem $home2 -Force | ForEach-Object { Write-Host ("  " + $_.Name) }
  $log = Join-Path $env:APPDATA 'lawyer-workbench\logs\dsh-web.log'
  if (Test-Path $log) {
    Write-Host '--- dsh-web.log tail ---'
    Get-Content $log -Tail 15 | ForEach-Object { Write-Host ("  " + $_) }
  }
}
if (-not $ok) { Write-Host 'SERVER-NOT-READY' }

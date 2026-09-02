# 干净机器首启模拟：清掉 userData 后从打包后的 win-unpacked 启动。
# 不真跑 NSIS 安装（oneClick 装完即启动体验等价于直接跑 unpacked exe）。
$ErrorActionPreference = 'Continue'
$packaging = Split-Path $PSScriptRoot -Parent
Set-Location $packaging

$userData = Join-Path $env:APPDATA 'lawyer-workbench'
Write-Host ("cleaning userData: " + $userData)
if (Test-Path $userData) { Remove-Item -Recurse -Force $userData }

$exe = Join-Path (Get-Location) 'dist\win-unpacked\摸鱼工作站.exe'
Write-Host ("starting: " + $exe)
Start-Process -FilePath $exe -WorkingDirectory (Split-Path $exe -Parent) -WindowStyle Hidden

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

Write-Host ("electron procs: " + @(Get-Process -Name '摸鱼工作站','包工头','LawyerWorkbench','electron' -ErrorAction SilentlyContinue).Count)
Get-Process -Name '摸鱼工作站','包工头','LawyerWorkbench','electron' -ErrorAction SilentlyContinue | ForEach-Object {
  if ($_.MainWindowTitle) { Write-Host ("  window: [" + $_.MainWindowTitle + "] pid=" + $_.Id) }
}

$deployed = Test-Path (Join-Path $userData 'dsh-home\.lawyer-runtime-version')
Write-Host ("userData\dsh-home deployed: " + $deployed)
if ($deployed) {
  Write-Host '--- deployed tree ---'
  Get-ChildItem (Join-Path $userData 'dsh-home') -Force | ForEach-Object { Write-Host ("  " + $_.Name) }
  Write-Host '--- profile-web ---'
  Get-ChildItem (Join-Path $userData 'dsh-home\profiles\web') -Force | ForEach-Object { Write-Host ("  " + $_.Name) }
  Write-Host '--- cordis.patch.yml (first 12 lines) ---'
  Get-Content (Join-Path $userData 'dsh-home\profiles\web\cordis.patch.yml') -TotalCount 12 | ForEach-Object { Write-Host ("  " + $_) }
  $log = Join-Path $userData 'logs\dsh-web.log'
  if (Test-Path $log) {
    Write-Host '--- dsh-web.log last 15 ---'
    Get-Content $log -Tail 15 | ForEach-Object { Write-Host ("  " + $_) }
  }
}
if (-not $ok) { Write-Host 'SERVER-NOT-READY' }
# Temporary helper: stop any dsh web on :3080 (and wait for the port to be
# released), then start debug-web.cmd detached and wait for the server.
#
# 坑：taskkill 是异步的，进程句柄（含 .dsh-web.log）不会立刻释放——不等端口
# 真正空出来就重启，会误判成"服务已就绪"（其实连的是旧进程，加载的还是旧
# 构建）。
$ErrorActionPreference = 'Continue'
$root = Split-Path $PSScriptRoot -Parent
$log = Join-Path $root '.dsh-web.log'

function Get-Listener {
  Get-NetTCPConnection -LocalPort 3080 -State Listen -ErrorAction SilentlyContinue
}

for ($round = 0; $round -lt 3; $round++) {
  $conns = Get-Listener
  if ($conns -eq $null) { break }
  foreach ($c in $conns) { Stop-Process -Id $c.OwningProcess -Force -ErrorAction SilentlyContinue }
  Start-Sleep -Seconds 2
}

for ($i = 0; $i -lt 20; $i++) {
  if ((Get-Listener) -eq $null) { break }
  Start-Sleep -Seconds 1
}
if ((Get-Listener) -ne $null) {
  Write-Host 'PORT STILL BUSY — aborting'
  exit 1
}

if (Test-Path $log) { Remove-Item $log -Force -ErrorAction SilentlyContinue }

Start-Process -FilePath 'cmd.exe' -ArgumentList '/c', (Join-Path $root 'debug-web.cmd') -WorkingDirectory $root -WindowStyle Minimized

$ok = $false
for ($i = 0; $i -lt 90; $i++) {
  Start-Sleep -Seconds 2
  if ((Get-Listener) -ne $null) { $ok = $true; break }
}
if ($ok) { Write-Host 'SERVER UP on 3080' } else { Write-Host 'SERVER TIMEOUT' }
Start-Sleep -Seconds 8
Write-Host '--- log tail ---'
if (Test-Path $log) { Get-Content $log -Tail 40 } else { Write-Host '(no log)' }

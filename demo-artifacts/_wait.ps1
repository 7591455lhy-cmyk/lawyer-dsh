param([int]$DemoIndex)
# 等待 registry[$DemoIndex] 的运行完成（[runner] exited 出现），最长 ~8 分钟。
$root = $PSScriptRoot
$registry = Get-Content (Join-Path $root 'registry.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$ws = Join-Path $root $registry[$DemoIndex].ws
$log = Join-Path $ws 'run.log'
$deadline = (Get-Date).AddMinutes(9)
while ((Get-Date) -lt $deadline) {
  if ((Test-Path $log) -and (Select-String -Path $log -Pattern 'exited with' -Quiet -ErrorAction SilentlyContinue)) {
    Write-Host 'DONE'
    break
  }
  Start-Sleep -Seconds 20
}
$found = (Test-Path $log) -and (Select-String -Path $log -Pattern 'exited with' -Quiet -ErrorAction SilentlyContinue)
if (-not $found) { Write-Host 'TIMEOUT-or-running' }
Write-Host '--- files ---'
Get-ChildItem $ws -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
  Write-Host ($_.FullName.Substring($ws.Length + 1) + ' ' + $_.Length + 'B')
}

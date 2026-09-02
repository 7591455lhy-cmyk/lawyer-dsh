Get-Process electron -ErrorAction SilentlyContinue | Stop-Process -Force
$conns = Get-NetTCPConnection -LocalPort 3080 -State Listen -ErrorAction SilentlyContinue
if ($conns) {
  $conns | ForEach-Object { taskkill /T /F /PID $_.OwningProcess 2>$null }
}
Start-Sleep -Seconds 2
Write-Host 'stopped'
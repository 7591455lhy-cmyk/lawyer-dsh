# 关掉打包版（摸鱼工作站.exe / 旧版 包工头.exe / LawyerWorkbench.exe + 子进程 + 3080 端口）
Get-Process -Name '摸鱼工作站','包工头','LawyerWorkbench','electron','node' -ErrorAction SilentlyContinue | Stop-Process -Force 2>$null
$conns = Get-NetTCPConnection -LocalPort 3080 -State Listen -ErrorAction SilentlyContinue
if ($conns) {
  $conns | ForEach-Object { taskkill /T /F /PID $_.OwningProcess 2>$null }
}
Start-Sleep -Seconds 2
Write-Host 'stopped'
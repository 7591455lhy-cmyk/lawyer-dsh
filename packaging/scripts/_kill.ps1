Get-Process | Where-Object { $_.MainWindowTitle -ne '' -and $_.Path -like '*win-unpacked*' } | Stop-Process -Force
Write-Host killed
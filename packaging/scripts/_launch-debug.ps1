$unpacked = Join-Path (Split-Path $PSScriptRoot -Parent) 'dist\win-unpacked'
$exe = Get-ChildItem $unpacked -Filter '*.exe' |
  Where-Object { $_.Name -ne 'elevate.exe' -and $_.Name -notlike '*unins*' } |
  Select-Object -First 1
Write-Host ('launching: ' + $exe.FullName)
Start-Process -FilePath $exe.FullName -ArgumentList '--remote-debugging-port=9222'
Write-Host 'started'
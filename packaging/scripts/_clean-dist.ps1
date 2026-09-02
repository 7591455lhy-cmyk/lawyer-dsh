# 路径由脚本位置推导（仓库可放在任意目录）：
#   <本脚本>\..\..\dist  ==  packaging\dist
$dist = Join-Path (Split-Path $PSScriptRoot -Parent) 'dist'
if (Test-Path $dist) {
  Remove-Item $dist -Recurse -Force
  Write-Host 'dist removed'
} else { Write-Host 'dist absent' }

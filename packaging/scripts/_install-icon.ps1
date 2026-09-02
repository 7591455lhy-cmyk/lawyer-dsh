$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing
# 通配定位（脚本含中文字面量会被 PS5.1 按 ANSI 误读）。
$src = Get-ChildItem "$env:TEMP" -Filter '*.541fac0027.png' | Select-Object -First 1
if ($null -eq $src) { $src = Get-ChildItem "$env:TEMP" -Filter '*.png' | Where-Object { $_.Length -gt 90KB -and $_.Length -lt 120KB } | Sort-Object LastWriteTime -Descending | Select-Object -First 1 }
if ($null -eq $src) { Write-Host 'icon source not found'; exit 1 }
Write-Host ('source: ' + $src.FullName + ' ' + $src.Length + 'B')
$img = [System.Drawing.Image]::FromFile($src.FullName)
Write-Host ("dimensions: " + $img.Width + "x" + $img.Height)
$min = [Math]::Min($img.Width, $img.Height)
# electron-builder win icon 最小 256；不足则等比放大到 512 见方（保真拉伸）。
$target = 512
$bmp = New-Object System.Drawing.Bitmap($target, $target)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
# 非正方形源图等比缩放、透明画布居中（避免拉伸变形）。
$scale = [Math]::Min($target / $img.Width, $target / $img.Height)
$w = [int]([Math]::Round($img.Width * $scale))
$h = [int]([Math]::Round($img.Height * $scale))
$x = [int](($target - $w) / 2)
$y = [int](($target - $h) / 2)
$g.DrawImage($img, $x, $y, $w, $h)
$g.Dispose()
$outDir = Join-Path (Split-Path $PSScriptRoot -Parent) 'build'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$out = Join-Path $outDir 'icon.png'
$bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose(); $bmp.Dispose()
Write-Host ('written: ' + $out + ' (512x512)')

# 生成品牌应用图标 build/icon.png（橙色圆角底 + 白色安全帽，与 UI 内
# HardHatMark 同形）。electron-builder 会自动把 >=256px 的 PNG 转成
# Windows 各尺寸 ico（win.icon 默认查找 build/icon.*）。
$ErrorActionPreference = 'Stop'
$packaging = Split-Path $PSScriptRoot -Parent
$outDir = Join-Path $packaging 'build'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$out = Join-Path $outDir 'icon.png'

Add-Type -AssemblyName System.Drawing
$size = 256
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

try {
  $orange = [System.Drawing.Color]::FromArgb(245, 158, 11)   # #F59E0B
  $white = [System.Drawing.Color]::White

  # 圆角方形底（半径 60）
  $radius = 60
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddArc(0, 0, $radius, $radius, 180, 90)
  $path.AddArc($size - $radius, 0, $radius, $radius, 270, 90)
  $path.AddArc($size - $radius, $size - $radius, $radius, $radius, 0, 90)
  $path.AddArc(0, $size - $radius, $radius, $radius, 90, 90)
  $path.CloseFigure()
  $bg = New-Object System.Drawing.SolidBrush($orange)
  $g.FillPath($bg, $path)

  $brush = New-Object System.Drawing.SolidBrush($white)

  # 顶脊（帽壳上方凸条）
  $g.FillRectangle($brush, 118, 62, 20, 30)

  # 帽壳（上半椭圆：中心 (128,150) 半径 70x62）
  $g.FillEllipse($brush, 58, 88, 140, 124)

  # 帽檐（圆角横条，与帽壳底缘相接）
  $cap = New-Object System.Drawing.Drawing2D.GraphicsPath
  $r2 = 13
  $cap.AddArc(48, 172, $r2, $r2, 180, 90)
  $cap.AddArc(208 - $r2, 172, $r2, $r2, 270, 90)
  $cap.AddArc(208 - $r2, 198 - $r2, $r2, $r2, 0, 90)
  $cap.AddArc(48, 198 - $r2, $r2, $r2, 90, 90)
  $cap.CloseFigure()
  $g.FillPath($brush, $cap)

  $bmp.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  Write-Host ("written: " + $out)
} finally {
  $g.Dispose()
  $bmp.Dispose()
}

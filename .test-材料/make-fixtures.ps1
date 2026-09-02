# 生成测试占位二进制与图片（.test-材料 下），供拖入文件夹链路测试。
$ErrorActionPreference = 'Stop'
$root = Join-Path $PSScriptRoot '.test-材料'

# 占位 PDF / DOCX（字节流占位，验证上传落盘与引用链路足够；
# 需验证模型真实读取时请替换为真实文件）
$placeholderPdf = [Text.Encoding]::UTF8.GetBytes("%PDF-1.4 测试占位：装修工程施工合同扫描件")
[IO.File]::WriteAllBytes((Join-Path $root '案卷\合同.pdf'), $placeholderPdf)
$placeholderDocx = [Text.Encoding]::UTF8.GetBytes("PK 测试占位：司法鉴定意见书")
[IO.File]::WriteAllBytes((Join-Path $root '案卷\鉴定意见.docx'), $placeholderDocx)

# 1x1 真实 PNG（红色像素）
$pngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
[IO.File]::WriteAllBytes((Join-Path $root '案卷\证据\收据照片.png'), [Convert]::FromBase64String($pngBase64))

Write-Host 'fixtures ready:'
Get-ChildItem $root -Recurse -File | ForEach-Object { Write-Host ("  " + $_.FullName.Substring($root.Length + 1) + " (" + $_.Length + " B)") }
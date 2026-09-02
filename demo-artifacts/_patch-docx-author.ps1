# Demo artifact docx author patch (ASCII-only script; Chinese strings come
# from patch-config.json read as UTF-8 -- PS 5.1 misreads BOM-less UTF-8
# scripts as GBK, so no literal non-ASCII here).
# Usage: powershell -ExecutionPolicy Bypass -File _patch-docx-author.ps1
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$root = $PSScriptRoot
$config = Get-Content (Join-Path $root 'patch-config.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$registry = Get-Content (Join-Path $root 'registry.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$oldAuthor = $config.oldAuthor

$totalPatched = 0
for ($i = 0; $i -lt $registry.Count; $i++) {
  $ws = Join-Path $root $registry[$i].ws
  $manifestPath = Join-Path $ws 'manifest.json'
  if (-not (Test-Path $manifestPath)) { continue }
  $manifest = Get-Content $manifestPath -Raw -Encoding UTF8 | ConvertFrom-Json
  $target = $config.firmByIndex.$i
  if ($null -eq $target -or $target -eq '') { $target = $config.defaultFirm }
  $newAuthor = "$target-$($config.lawyerSuffix)"
  if ($null -eq $config.lawyerSuffix) { $newAuthor = "$target" }
  foreach ($name in $manifest.files) {
    $docx = Join-Path $ws $name
    if (-not (Test-Path $docx)) { continue }
    $zip = [System.IO.Compression.ZipFile]::Open($docx, 'Update')
    $patched = 0
    try {
      foreach ($entry in @($zip.Entries)) {
        if ($entry.FullName -notlike '*.xml') { continue }
        $stream = $entry.Open()
        $reader = New-Object System.IO.StreamReader($stream, [System.Text.Encoding]::UTF8)
        $content = $reader.ReadToEnd()
        $reader.Close()
        if ($content.Contains($oldAuthor)) {
          $new = $content.Replace($oldAuthor, $newAuthor)
          $wstream = $entry.Open()
          $wstream.SetLength(0)
          $writer = New-Object System.IO.StreamWriter($wstream, (New-Object System.Text.UTF8Encoding($false)))
          $writer.Write($new)
          $writer.Dispose()
          $patched++
        }
      }
    } finally { $zip.Dispose() }
    if ($patched -gt 0) { Write-Host ("[$i] $name : $patched entry(s) patched") }
    $totalPatched += $patched
  }
}
Write-Host ("total patched entries: " + $totalPatched)

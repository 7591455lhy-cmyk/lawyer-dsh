# Verify patched docx: zip entries load, XML well-formed, new author present.
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
$root = $PSScriptRoot
$config = Get-Content (Join-Path $root 'patch-config.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$registry = Get-Content (Join-Path $root 'registry.json') -Raw -Encoding UTF8 | ConvertFrom-Json
for ($i = 0; $i -lt $registry.Count; $i++) {
  $ws = Join-Path $root $registry[$i].ws
  $manifest = Get-Content (Join-Path $ws 'manifest.json') -Raw -Encoding UTF8 | ConvertFrom-Json
  foreach ($name in $manifest.files) {
    $docx = Join-Path $ws $name
    $zip = [System.IO.Compression.ZipFile]::OpenRead($docx)
    $newAuthor = "$($config.firmByIndex."$i")-$($config.lawyerSuffix)"
    if ($null -eq $config.firmByIndex."$i") { $newAuthor = "$($config.defaultFirm)-$($config.lawyerSuffix)" }
    $oldLeft = 0; $newFound = 0; $xmlBad = 0
    try {
      foreach ($entry in $zip.Entries) {
        if ($entry.FullName -like 'word/*.xml' -or $entry.FullName -like 'docProps/*') {
          $reader = New-Object System.IO.StreamReader($entry.Open(), [System.Text.Encoding]::UTF8)
          $content = $reader.ReadToEnd()
          $reader.Close()
          try {
            $xml = New-Object System.Xml.XmlDocument
            $xml.LoadXml($content)
          } catch { $xmlBad++ }
          if ($content.Contains($config.oldAuthor)) { $oldLeft++ }
          if ($content.Contains($newAuthor)) { $newFound++ }
        }
      }
    } finally { $zip.Dispose() }
    Write-Host ("[$i] $name entries=" + $zip.GetType().Name + " oldLeft=$oldLeft newFound=$newFound xmlBad=$xmlBad")
  }
}

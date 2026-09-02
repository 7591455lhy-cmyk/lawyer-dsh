# Temporary helper: re-encode a UTF-8 (no BOM) file as UTF-8 with BOM so that
# Windows PowerShell 5.1 parses non-ASCII string literals correctly.
param([string]$Path)

$full = (Resolve-Path -LiteralPath $Path).Path
$bytes = [System.IO.File]::ReadAllBytes($full)

# Strip an existing UTF-8 BOM if present.
if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
  $bytes = $bytes[3..($bytes.Length - 1)]
}

$out = New-Object System.Collections.Generic.List[byte]
$out.Add(0xEF)
$out.Add(0xBB)
$out.Add(0xBF)
$out.AddRange([byte[]]$bytes)

[System.IO.File]::WriteAllBytes($full, $out.ToArray())
Write-Host ("BOM added: " + $full + " (" + $out.Count + " bytes)")

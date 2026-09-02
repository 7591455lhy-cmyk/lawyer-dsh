# Temporary helper: report directory sizes under a path (top level only).
param([string]$Path)

$files = Get-ChildItem -LiteralPath $Path -Recurse -File -ErrorAction SilentlyContinue |
  Where-Object { -not $_.FullName.Contains('\.git\') }

$total = 0
foreach ($f in $files) { $total += $f.Length }
Write-Host ('total files = ' + $files.Count)
Write-Host ('total size  = ' + [math]::Round($total / 1MB, 2) + ' MB')

foreach ($d in (Get-ChildItem -LiteralPath $Path -Directory)) {
  $sum = 0
  foreach ($f in (Get-ChildItem -LiteralPath $d.FullName -Recurse -File -ErrorAction SilentlyContinue)) { $sum += $f.Length }
  Write-Host ('  ' + $d.Name.PadRight(28) + [math]::Round($sum / 1KB, 1) + ' KB')
}

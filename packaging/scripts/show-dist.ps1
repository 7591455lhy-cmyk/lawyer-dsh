Set-Location (Split-Path $PSScriptRoot -Parent)
Get-ChildItem dist | ForEach-Object {
  $mb = [math]::Round($_.Length / 1MB, 1)
  Write-Host ($_.Name + " ($mb MB)")
}
Write-Host '--- runtime inside installer ---'
$total = (Get-ChildItem dist\win-unpacked\resources\runtime -Recurse -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
Write-Host ("runtime total: " + [math]::Round($total / 1MB, 1) + " MB")
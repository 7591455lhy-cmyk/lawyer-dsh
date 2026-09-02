param([string]$DemoName = 'workspace-case-analysis')
$ws = Join-Path $PSScriptRoot $DemoName
Write-Host '--- run.log tail ---'
Get-Content (Join-Path $ws 'run.log') -Tail 8 -ErrorAction SilentlyContinue
Write-Host '--- run.err.log tail ---'
Get-Content (Join-Path $ws 'run.err.log') -Tail 8 -ErrorAction SilentlyContinue
Write-Host '--- workspace files ---'
Get-ChildItem $ws -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
  Write-Host ($_.FullName.Substring($ws.Length + 1) + ' ' + $_.Length + 'B')
}

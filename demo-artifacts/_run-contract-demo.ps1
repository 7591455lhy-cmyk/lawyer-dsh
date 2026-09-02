$ErrorActionPreference = 'Continue'
$bin = Join-Path (Split-Path (Split-Path $PSScriptRoot -Parent) -Parent) 'deepseek-harness\apps\cli\lib\bin.js'
$ws = Join-Path $PSScriptRoot 'workspace-contract-review'
$prompt = Get-Content (Join-Path $ws 'prompt.txt') -Raw
$log = Join-Path $ws 'run.log'
if (Test-Path $log) { Remove-Item $log -Force }
$args = @($bin, '--profile', 'headless', '--patch', (Join-Path $PSScriptRoot 'headless-lawyer.yml'), $prompt)
$proc = Start-Process -FilePath 'node' -ArgumentList $args -WorkingDirectory $ws -RedirectStandardOutput $log -RedirectStandardError (Join-Path $ws 'run.err.log') -PassThru -WindowStyle Hidden
Write-Host ('started pid=' + $proc.Id)

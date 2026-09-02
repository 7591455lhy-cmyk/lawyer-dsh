param([int]$DemoIndex = -1, [string]$DemoName = '')
$ErrorActionPreference = 'Continue'
$root = $PSScriptRoot
# 命令行传中文会被 GBK 弄乱——优先用 registry 序号（PowerShell 读 JSON 是 UTF-8 安全的）。
if ($DemoIndex -ge 0) {
  $registry = Get-Content (Join-Path $root 'registry.json') -Raw -Encoding UTF8 | ConvertFrom-Json
  $DemoName = $registry[$DemoIndex].ws
}
if ($DemoName -eq '') { Write-Host 'usage: _start-demo.ps1 -DemoIndex <n> | -DemoName <ws>'; exit 2 }
Write-Host ('demo: ' + $DemoName)
$ws = Join-Path $root $DemoName
$log = Join-Path $ws 'run.log'
$errlog = Join-Path $ws 'run.err.log'
if (Test-Path $log) { Remove-Item $log -Force }
if (Test-Path $errlog) { Remove-Item $errlog -Force }
$runner = Join-Path $root '_runner.js'
$proc = Start-Process -FilePath 'node' -ArgumentList @($runner, $DemoName) -WorkingDirectory $root -RedirectStandardOutput $log -RedirectStandardError $errlog -PassThru -WindowStyle Hidden
Write-Host ('started pid=' + $proc.Id)

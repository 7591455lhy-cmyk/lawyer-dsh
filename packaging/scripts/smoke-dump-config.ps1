# 第二次冒烟：律师 overlay 写入 profile user layer（cordis.patch.yml）。
$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)

$smokeHome = Join-Path (Get-Location) '.smoke-home'
if (Test-Path $smokeHome) { Remove-Item -Recurse -Force $smokeHome }

New-Item -ItemType Directory -Force -Path (Join-Path $smokeHome 'profiles/web') | Out-Null
Copy-Item runtime\profile-web\* (Join-Path $smokeHome 'profiles/web') -Recurse -Force
New-Item -ItemType Directory -Force -Path (Join-Path $smokeHome '.agent-presets') | Out-Null
Copy-Item runtime\agent-presets\lawyer (Join-Path $smokeHome '.agent-presets/lawyer') -Recurse -Force

# 直接把 overlay 写进 profile 的 user layer
$skills = (Join-Path (Get-Location) 'runtime/skills') -replace '\\', '/'
$overlay = @"
# smoke overlay
- insert:
  - id: lawyer-sidebar
    name: lawyer-sidebar
  - id: lawyer-tools
    name: lawyer-tools
    config:
      skillsDir: "$skills"
"@
[IO.File]::WriteAllText((Join-Path $smokeHome 'profiles/web/cordis.patch.yml'), $overlay, (New-Object System.Text.UTF8Encoding($false)))

$env:DSH_HOME = $smokeHome
& .\runtime\node\node.exe .\runtime\dsh\node_modules\@deepseek-ai\dsh\lib\bin.js web --dump-config 2>&1 |
  Select-String -Pattern 'lawyer-sidebar|lawyer-tools|skillsDir' |
  ForEach-Object { $_.Line.TrimEnd() }
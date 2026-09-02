<#
.SYNOPSIS
  安装 claude-for-legal-ZH 的 DeepSeek Harness（dsh）适配层。

.DESCRIPTION
  仓库 https://github.com/CSlawyer1985/claude-for-legal-ZH 只提供 bash 版安装脚本
  （scripts/install-dsh.sh）。本脚本是其在 Windows 上的等价实现，严格对齐原脚本
  的三步语义：

    1. 把 <repo>/.dsh/skills/chinese-legal-* 安装到 $DSH_HOME/skills/
    2. 把仓库绝对路径登记到 $DSH_HOME/legal-zh/repo
       （adapter 通过它解析领域 CLAUDE.md / skills/*/SKILL.md 的仓库相对路径）
    3. 向 $DSH_HOME/AGENTS.md 幂等写入 legal-zh 受管块

  原脚本的 link 模式在 Windows 上需要管理员权限或开发者模式，故默认 Copy 模式；
  指定 -Mode Link 时若创建符号链接失败会自动回退到 Copy。

.PARAMETER RepoDir
  claude-for-legal-ZH 仓库根目录。

.PARAMETER Mode
  Copy（默认，独立快照）或 Link（符号链接，git pull 即更新）。

.PARAMETER DshHome
  dsh 用户目录，默认 $env:DSH_HOME，未设置时取 ~/.dsh。

.PARAMETER Uninstall
  卸载：移除 chinese-legal-* 技能、repo 登记文件与 AGENTS.md 受管块。

.EXAMPLE
  powershell -ExecutionPolicy Bypass -File scripts/install-legal-zh.ps1
  powershell -ExecutionPolicy Bypass -File scripts/install-legal-zh.ps1 -Mode Link
  powershell -ExecutionPolicy Bypass -File scripts/install-legal-zh.ps1 -Uninstall
#>
[CmdletBinding()]
param(
  [string]$RepoDir = '',
  [ValidateSet('Copy', 'Link')]
  [string]$Mode = 'Copy',
  [string]$DshHome = $(if ($env:DSH_HOME) { $env:DSH_HOME } else { Join-Path $HOME '.dsh' }),
  [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'

# 未显式给出 -RepoDir 时，按「本脚本所在目录的上两级」定位仓库，即
# <parent>/lawyer-dsh/scripts/.. -> <parent> ，再取 <parent>/claude-for-legal-ZH。
if ([string]::IsNullOrWhiteSpace($RepoDir)) {
  $scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
  $workspace = Split-Path -Parent (Split-Path -Parent $scriptDir)
  $RepoDir = Join-Path $workspace 'claude-for-legal-ZH'
}
if ([string]::IsNullOrWhiteSpace($RepoDir)) {
  throw '无法推导仓库路径，请用 -RepoDir 显式指定 claude-for-legal-ZH 的根目录。'
}

$BlockStart = '<!-- legal-zh:start -->'
$BlockEnd = '<!-- legal-zh:end -->'

# 受管块：与 scripts/install-dsh.sh 的 heredoc 内容一致。
$ManagedLines = @(
  ''
  $BlockStart
  '## 中国法律工作守则（claude-for-legal-zh）'
  ''
  '任务涉及中国法律实务时：'
  ''
  '- 优先调用匹配的 `chinese-legal-*` skill，路由到对应领域的工作流（领域 CLAUDE.md + skills/*/SKILL.md）。'
  '- 领域文件的仓库相对路径以 `~/.dsh/legal-zh/repo` 中登记的仓库根目录为基准解析。'
  '- 所有法律输出均为律师审查草稿，不替代律师专业判断。'
  '- 法条、案例、期限、监管动态等时效性内容，未经可靠来源核验前一律标注“需验证”。'
  '- 保留原工作流的升级、审批、保密与来源标注要求。'
  $BlockEnd
)

function Get-SkillDirs {
  param([string]$SourceDir)
  if (-not (Test-Path -LiteralPath $SourceDir)) { return @() }
  @(Get-ChildItem -LiteralPath $SourceDir -Directory -Filter 'chinese-legal-*' | Sort-Object Name)
}

function Remove-ManagedBlock {
  param([string]$AgentsFile)
  if (-not (Test-Path -LiteralPath $AgentsFile)) { return }
  $kept = [System.Collections.Generic.List[string]]::new()
  $skip = $false
  foreach ($line in (Get-Content -LiteralPath $AgentsFile)) {
    if ($line.Contains($BlockStart)) { $skip = $true; continue }
    if ($skip) {
      if ($line.Contains($BlockEnd)) { $skip = $false }
      continue
    }
    $kept.Add($line)
  }
  Set-Content -LiteralPath $AgentsFile -Value $kept -Encoding utf8
}

if ($Uninstall) {
  $targetDir = Join-Path $DshHome 'skills'
  foreach ($skill in (Get-SkillDirs -SourceDir $targetDir)) {
    Remove-Item -LiteralPath $skill.FullName -Recurse -Force
    Write-Host "已移除：$($skill.FullName)"
  }
  $repoFile = Join-Path $DshHome 'legal-zh/repo'
  if (Test-Path -LiteralPath $repoFile) {
    Remove-Item -LiteralPath $repoFile -Force
    Write-Host "已移除：$repoFile"
  }
  Remove-ManagedBlock -AgentsFile (Join-Path $DshHome 'AGENTS.md')
  Write-Host 'claude-for-legal-ZH 适配层已卸载。'
  return
}

$sourceDir = Join-Path $RepoDir '.dsh/skills'
if (-not (Test-Path -LiteralPath $sourceDir)) {
  throw "未找到 dsh skills 目录：$sourceDir（请先确认仓库已就位：$RepoDir）"
}

$skills = Get-SkillDirs -SourceDir $sourceDir
if ($skills.Count -eq 0) {
  throw "在 $sourceDir 下未找到 chinese-legal-* 技能目录。"
}

$targetDir = Join-Path $DshHome 'skills'
$stateDir = Join-Path $DshHome 'legal-zh'
New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
New-Item -ItemType Directory -Force -Path $stateDir | Out-Null

$linkMode = ($Mode -eq 'Link')
$copied = 0
$linked = 0

foreach ($skill in $skills) {
  $dest = Join-Path $targetDir $skill.Name
  if (Test-Path -LiteralPath $dest) { Remove-Item -LiteralPath $dest -Recurse -Force }

  if ($linkMode) {
    try {
      New-Item -ItemType SymbolicLink -Path $dest -Target $skill.FullName -ErrorAction Stop | Out-Null
      $linked++
      continue
    }
    catch {
      Write-Warning "符号链接创建失败（$($skill.Name)），回退为复制：$($_.Exception.Message)"
      $linkMode = $false
    }
  }

  Copy-Item -LiteralPath $skill.FullName -Destination $dest -Recurse -Force
  $copied++
}

# 登记仓库根目录：adapter 用它解析领域文件的仓库相对路径。纯文本，无密钥。
$resolvedRepo = (Resolve-Path -LiteralPath $RepoDir).Path
$repoFile = Join-Path $stateDir 'repo'
Set-Content -LiteralPath $repoFile -Value $resolvedRepo -Encoding utf8
Write-Host "已登记仓库路径：$repoFile -> $resolvedRepo"

# 幂等写入全局指令受管块。
$agentsFile = Join-Path $DshHome 'AGENTS.md'
if (-not (Test-Path -LiteralPath $AgentsFile)) { New-Item -ItemType File -Path $agentsFile -Force | Out-Null }
Remove-ManagedBlock -AgentsFile $agentsFile
$existing = @(Get-Content -LiteralPath $agentsFile)
$all = New-Object System.Collections.Generic.List[string]
foreach ($line in $existing) { $all.Add($line) }
foreach ($line in $ManagedLines) { $all.Add($line) }
Set-Content -LiteralPath $agentsFile -Value $all -Encoding utf8
Write-Host "已更新全局指令：$agentsFile（legal-zh 受管块）"

Write-Host ''
Write-Host "DeepSeek Harness 适配技能已安装到：$targetDir"
Write-Host "  链接 $linked 个 / 复制 $copied 个（共 $($skills.Count) 个）"
foreach ($skill in $skills) { Write-Host "  - $($skill.Name)" }
Write-Host ''
Write-Host '请重启 dsh 会话（或重新打开 dsh web 页面），让新的 skills 进入索引。'

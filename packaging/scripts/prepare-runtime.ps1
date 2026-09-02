#Requires -Version 5.1
<#
  lawyer-dsh M5 打包预验证：组装 Electron 壳的 runtime/ 目录。

  产物（lawyer-dsh/packaging/runtime/）：
    node/node.exe                官方 Node win-x64（跑 dsh CLI，与 Electron 内置 Node 解耦，
                                 dsh engines 要求 ^22.19 || >=24）
    dsh/                         npm 安装的 @deepseek-ai/dsh（自包含依赖树，bundles 从
                                 安装位置解析的契约依赖它）
    plugins/                     lawyer-sidebar / lawyer-tools 构建产物（profile 依赖源）
    profile-web/                 预组装 web profile（pnpm hoisted，file: 依赖复制进
                                 node_modules，用户机器免 pnpm）
    agent-presets/lawyer/        lawyer agent preset（部署到 $DSH_HOME/.agent-presets/lawyer）
    skills/                      三个律师技能目录
    VERSION                      部署版本标记（lawyer-sidebar 版本），Electron 首启用它
                                 决定是否重新部署 profile/preset

  前置：
    - 两个插件已构建（plugins/<pkg>/lib 存在；构建命令见项目根 CODEBUDDY.md）
    - 本机可联网（npm registry + nodejs.org；pnpm 只用于装 profile 的 file: 依赖与
      传递依赖 yaml）
#>
param(
  [string]$DshVersion = '0.1.1-rc.2',
  [string]$NodeVersion = '24.19.0',
  # 工作台（dsh-worktable）项目数据源目录：内容整体复制进安装包，首启
  # 部署到 userData\dsh-worktable\data。
  # 仓库里不含实际项目数据（属个人数据，不随源码公开），故默认为空：留空时
  # 生成一个占位项目，保证安装包可启动（assertRuntime 要求 worktable-data 与
  # worktable-projects.json 必须存在）。带自己的数据时用本参数指定目录。
  [string]$WorktableDataDir = '',
  [string]$WorktablePlaceholderName = '示例项目',
  # claude-for-legal-ZH 仓库根目录（M7：中国法律技能语料 + 18 个 dsh adapter
  # skill）。默认取 lawyer-dsh 的同级目录，可用本参数指向任意位置的克隆。
  [string]$LegalZhDir = ''
)

$ErrorActionPreference = 'Stop'
$packaging = Split-Path $PSScriptRoot -Parent
$lawyerRoot = Split-Path $packaging -Parent
$runtime = Join-Path $packaging 'runtime'
$cache = Join-Path $packaging '.cache'
$nodeExe = Join-Path $runtime 'node/node.exe'
$verifyScript = Join-Path $PSScriptRoot 'verify-node-modules.cjs'

function Step($msg) { Write-Host "[packaging] $msg" -ForegroundColor Cyan }
function Die($msg) { Write-Host "[packaging] $msg" -ForegroundColor Red; exit 1 }

# node_modules 完整性校验：任何一个"存在却缺 package.json"的包目录都是 npm 安装中断的
# 残留（真实案例：@mixmark-io/domino 只剩 test/ 子目录，打进安装包后 dsh 挂载 standard
# preset 时 Cannot find module，用户表现为"选择工作区失败"）。
# 校验脚本只写 stdout（退出码区分成败）；调用点仍临时放宽 EAP，双保险防 PS 5.1 的
# NativeCommandError。
function Test-NodeModulesComplete([string]$modulesDir) {
  if (-not (Test-Path $modulesDir)) { return $false }
  $prev = $ErrorActionPreference
  $ErrorActionPreference = 'Continue'
  try {
    $report = @(& $nodeExe $verifyScript $modulesDir 2>&1)
  }
  finally { $ErrorActionPreference = $prev }
  if ($LASTEXITCODE -ne 0) {
    Write-Host '[packaging] broken packages:' -ForegroundColor Yellow
    $report | ForEach-Object { Write-Host ("  " + $_) -ForegroundColor Yellow }
    return $false
  }
  return $true
}

# 前置检查：插件构建产物
foreach ($p in @('lawyer-sidebar', 'lawyer-tools', 'lawyer-wizard')) {
  if (-not (Test-Path (Join-Path $lawyerRoot "plugins/$p/lib"))) {
    Die "plugins/$p/lib 不存在 —— 请先在 plugins/$p 下运行 powershell -ExecutionPolicy Bypass -File build.ps1"
  }
}

# 前置检查：dsh-worktable（第三方插件，安装在本机 web profile；M6.6 起随包分发）
$worktableSrc = Join-Path $env:USERPROFILE '.dsh\profiles\web\node_modules\dsh-worktable'
if (-not (Test-Path (Join-Path $worktableSrc 'lib\client.js'))) {
  Die "dsh-worktable 未安装（$worktableSrc 无构建产物）—— 请先按其 README 安装到本机 web profile：dsh plugin --profile web add <release-tgz>"
}

# 前置检查：工作台项目数据源（缺失不致命 —— 会退化成占位项目，见 5.5 节）
if (-not [string]::IsNullOrWhiteSpace($WorktableDataDir) -and -not (Test-Path $WorktableDataDir)) {
  Write-Host "[packaging] 工作台数据源不存在（$WorktableDataDir），本次使用占位项目" -ForegroundColor Yellow
  $WorktableDataDir = ''
}

New-Item -ItemType Directory -Force -Path $runtime, $cache | Out-Null

# ── 1) Node 运行时 ────────────────────────────────────────────────────────────
if (-not (Test-Path (Join-Path $runtime 'node/node.exe'))) {
  $zip = Join-Path $cache "node-v$NodeVersion-win-x64.zip"
  if (-not (Test-Path $zip)) {
    Step "downloading Node v$NodeVersion ..."
    Invoke-WebRequest "https://nodejs.org/dist/v$NodeVersion/node-v$NodeVersion-win-x64.zip" -OutFile $zip
  }
  Step 'extracting Node ...'
  $tmp = Join-Path $runtime '.node-extract'
  if (Test-Path $tmp) { Remove-Item -Recurse -Force $tmp }
  Expand-Archive $zip -DestinationPath $tmp -Force
  if (Test-Path (Join-Path $runtime 'node')) { Remove-Item -Recurse -Force (Join-Path $runtime 'node') }
  Move-Item (Join-Path $tmp "node-v$NodeVersion-win-x64") (Join-Path $runtime 'node')
  Remove-Item -Recurse -Force $tmp
}

# ── 2) dsh CLI（npm 安装，自包含依赖树） ─────────────────────────────────────
$dshDir = Join-Path $runtime 'dsh'
$dshBin = Join-Path $dshDir 'node_modules/@deepseek-ai/dsh/lib/bin.js'
$dshModules = Join-Path $dshDir 'node_modules'
$needDshInstall = -not (Test-Path $dshBin)
if (-not $needDshInstall -and -not (Test-NodeModulesComplete $dshModules)) {
  # bin.js 在但依赖树残缺：只看 bin 的跳过逻辑会把中断的安装固化进安装包，强制重装。
  Step 'dsh node_modules incomplete (broken packages found) — reinstalling ...'
  Remove-Item -Recurse -Force $dshDir
  $needDshInstall = $true
}
if ($needDshInstall) {
  Step "installing @deepseek-ai/dsh@$DshVersion via npm ..."
  New-Item -ItemType Directory -Force -Path $dshDir | Out-Null
  Set-Content -Path (Join-Path $dshDir 'package.json') -Value '{"name":"lawyer-dsh-runtime","private":true}'
  Push-Location $dshDir
  try {
    npm install "@deepseek-ai/dsh@$DshVersion" --no-audit --no-fund --loglevel warn
    if ($LASTEXITCODE -ne 0) { Die 'npm install @deepseek-ai/dsh 失败' }
  }
  finally { Pop-Location }
  Step 'verifying dsh node_modules completeness ...'
  if (-not (Test-NodeModulesComplete $dshModules)) {
    Die 'dsh 依赖树校验失败（存在缺 package.json 的残缺包）。多为 npm 缓存损坏所致，请先运行：npm cache clean --force，再重跑本脚本'
  }
}

# ── 3) 插件构建产物 ───────────────────────────────────────────────────────────
foreach ($p in @('lawyer-sidebar', 'lawyer-tools', 'lawyer-wizard')) {
  $src = Join-Path $lawyerRoot "plugins/$p"
  $dst = Join-Path $runtime "plugins/$p"
  Step "copying plugin $p ..."
  if (Test-Path $dst) { Remove-Item -Recurse -Force $dst }
  New-Item -ItemType Directory -Force -Path (Join-Path $dst 'lib') | Out-Null
  Copy-Item (Join-Path $src 'lib/*') (Join-Path $dst 'lib') -Recurse -Force
  Copy-Item (Join-Path $src 'package.json') $dst -Force
}

# dsh-worktable：复制本机 profile 安装包（lib + package.json + cordis.patch.yml
# + dsh.plugin.json；README/LICENSE 一并带上）。它是已构建的发布包，无源依赖。
Step 'copying plugin dsh-worktable ...'
$wtDst = Join-Path $runtime 'plugins/dsh-worktable'
if (Test-Path $wtDst) { Remove-Item -Recurse -Force $wtDst }
New-Item -ItemType Directory -Force -Path (Join-Path $wtDst 'lib') | Out-Null
Copy-Item (Join-Path $worktableSrc 'lib/*') (Join-Path $wtDst 'lib') -Recurse -Force
foreach ($f in @('package.json', 'cordis.patch.yml', 'dsh.plugin.json', 'README.md', 'LICENSE')) {
  $p = Join-Path $worktableSrc $f
  if (Test-Path $p) { Copy-Item $p $wtDst -Force }
}

# 关键：dsh-worktable 同时声明 dsh.bundle 与 dsh.client，会被 dsh 运行时
# 当作 bundle 包而**跳过**静态 __DSH_BOOT__ 装配（导致侧栏 UI 不渲染、
# /plugins/dsh-worktable/client.js 返回 404）。剥除 dsh.bundle 后，
# 即按客户端插件路径加入 boot entries（与 lawyer-sidebar/wizard 同
# 路径）。
$wtPkgPath = Join-Path $wtDst 'package.json'
$wtPkgBytes = [IO.File]::ReadAllBytes($wtPkgPath)
$wtPkgJson = [System.Text.Encoding]::UTF8.GetString($wtPkgBytes)
if ($wtPkgBytes.Length -ge 3 -and $wtPkgBytes[0] -eq 0xEF -and $wtPkgBytes[1] -eq 0xBB -and $wtPkgBytes[2] -eq 0xBF) {
  $wtPkgJson = $wtPkgJson.Substring(1)
}
$wtPkg = $wtPkgJson | ConvertFrom-Json
$isBundle = $wtPkg.dsh.bundle -ne $null
if ($isBundle) {
  $wtPkg.dsh.PSObject.Properties.Remove('bundle')
  # 无 BOM 写出（ps5.1 Set-Content -Encoding UTF8 会带 BOM，导致 pnpm 解析失败）。
  [IO.File]::WriteAllText(
    $wtPkgPath,
    ($wtPkg | ConvertTo-Json -Depth 10),
    (New-Object System.Text.UTF8Encoding($false)))
  Write-Host '[packaging] stripped dsh.bundle from dsh-worktable (becomes client-only)'
}

# ── 4) web profile（预组装，用户机器免 pnpm） ─────────────────────────────────
$profileDir = Join-Path $runtime 'profile-web'
Step 'assembling profile-web ...'
if (Test-Path $profileDir) { Remove-Item -Recurse -Force $profileDir }
New-Item -ItemType Directory -Force -Path $profileDir | Out-Null
Set-Content -Path (Join-Path $profileDir 'package.json') -Value @'
{
  "name": "dsh-profile-web",
  "private": true,
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-web-app"
      ]
    }
  },
  "dependencies": {
    "lawyer-sidebar": "file:../plugins/lawyer-sidebar",
    "lawyer-tools": "file:../plugins/lawyer-tools",
    "lawyer-wizard": "file:../plugins/lawyer-wizard",
    "dsh-worktable": "file:../plugins/dsh-worktable"
  }
}
'@
Set-Content -Path (Join-Path $profileDir 'pnpm-workspace.yaml') -Value @'
packages:
  - .

nodeLinker: hoisted
autoInstallPeers: false
'@
Set-Content -Path (Join-Path $profileDir 'cordis.yml') -Value "# dsh profile root — an empty entry list. The tree is composed as patches.`n[]`n"
Set-Content -Path (Join-Path $profileDir 'cordis.patch.yml') -Value "# Your patch layer for this dsh profile.`n[]`n"

$pnpm = Join-Path $env:LOCALAPPDATA 'node\corepack\v1\pnpm\11.7.0\bin\pnpm.cjs'
if (-not (Test-Path $pnpm)) { $pnpm = 'pnpm' }
Step 'pnpm install for profile-web (file: deps + transitive yaml, needs network) ...'
if ($pnpm -eq 'pnpm') {
  & pnpm --dir $profileDir install
} else {
  & node $pnpm --dir $profileDir install
}
if ($LASTEXITCODE -ne 0) { Die 'profile-web pnpm install 失败' }

Step 'verifying profile-web node_modules completeness ...'
if (-not (Test-NodeModulesComplete (Join-Path $profileDir 'node_modules'))) {
  Die 'profile-web 依赖树校验失败（存在缺 package.json 的残缺包），请删除 runtime/profile-web 后重跑本脚本'
}

# ── 5) agent preset + skills ──────────────────────────────────────────────────
Step 'copying lawyer preset ...'
$presetDst = Join-Path $runtime 'agent-presets/lawyer'
if (Test-Path $presetDst) { Remove-Item -Recurse -Force $presetDst }
Copy-Item (Join-Path $lawyerRoot 'profiles/lawyer') $presetDst -Recurse -Force

Step 'copying skills ...'
$skillsDst = Join-Path $runtime 'skills'
if (Test-Path $skillsDst) { Remove-Item -Recurse -Force $skillsDst }
Copy-Item (Join-Path $lawyerRoot 'skills') $skillsDst -Recurse -Force
Get-ChildItem $skillsDst -Recurse -Include '*.pyc' -File -ErrorAction SilentlyContinue | Remove-Item -Force
Get-ChildItem $skillsDst -Recurse -Directory -Filter '__pycache__' -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force

# ── 5.2) claude-for-legal-ZH（中国法律语料 + dsh adapter skills，M7）─────────
# 侧栏三个入口的指令按该仓库的规范路由：/chinese-legal-* adapter → 领域
# CLAUDE.md → skills/<name>/SKILL.md。仓库随包分发后，Electron 首启再把它
# 装配进 dsh 用户目录（见 electron/main.js 的 deployLegalZh）。
# 跳过 docs/（约 26MB，adapter 不引用）、.git/、.github/ 与其他端的适配层
# （.agents、.workbuddy 是 Codex / WorkBuddy 目录，dsh 不消费）。
if ([string]::IsNullOrWhiteSpace($LegalZhDir)) {
  $LegalZhDir = Join-Path (Split-Path $lawyerRoot -Parent) 'claude-for-legal-ZH'
}
if (-not (Test-Path (Join-Path $LegalZhDir '.dsh/skills'))) {
  Die "claude-for-legal-ZH 未就位（$LegalZhDir 下无 .dsh/skills）—— 请先克隆：git clone https://github.com/CSlawyer1985/claude-for-legal-ZH.git，或用 -LegalZhDir 指定已有克隆"
}

Step 'copying claude-for-legal-ZH ...'
$legalDst = Join-Path $runtime 'legal-zh'
if (Test-Path $legalDst) { Remove-Item -Recurse -Force $legalDst }
New-Item -ItemType Directory -Force -Path $legalDst | Out-Null
$skipLegal = @('.git', 'docs', '.github', '.agents', '.workbuddy')
foreach ($entry in (Get-ChildItem -LiteralPath $LegalZhDir -Force)) {
  if ($skipLegal -contains $entry.Name) { continue }
  Copy-Item -LiteralPath $entry.FullName -Destination (Join-Path $legalDst $entry.Name) -Recurse -Force
}
$adapterCount = (Get-ChildItem (Join-Path $legalDst '.dsh/skills') -Directory -Filter 'chinese-legal-*').Count
if ($adapterCount -eq 0) { Die "legal-zh 产物异常：未复制到任何 chinese-legal-* adapter（$legalDst\.dsh\skills）" }
Write-Host ("[packaging] legal-zh adapters: " + $adapterCount)

# ── 5.5) 工作台项目数据 + 预置清单（M6.6：开箱即演示）──────────────────────
# 数据目录整体复制为 runtime/worktable-data（Electron extraResources 随包分发，
# 首启部署到 userData\dsh-worktable\data）；同时生成 worktable-projects.json
# 清单（每个一级子目录一个项目），Electron 首启据此构造 dsh-worktable 的
# localStorage 项目列表（dsh.worktable.projects.v1），文件夹绑定指向部署后的
# 实际路径——安装到任何机器路径都自适应。
Step 'copying worktable project data ...'
$wtDataDst = Join-Path $runtime 'worktable-data'
if (Test-Path $wtDataDst) { Remove-Item -Recurse -Force $wtDataDst }
New-Item -ItemType Directory -Force -Path $wtDataDst | Out-Null
if ([string]::IsNullOrWhiteSpace($WorktableDataDir)) {
  # 占位项目：仓库不含实际项目数据，但 assertRuntime 要求 worktable-data 与
  # worktable-projects.json 必须存在（缺了安装包直接拒绝启动），故造一个空壳。
  $placeholder = Join-Path $wtDataDst $WorktablePlaceholderName
  New-Item -ItemType Directory -Force -Path $placeholder | Out-Null
  [System.IO.File]::WriteAllText(
    (Join-Path $placeholder 'README.md'),
    "# $WorktablePlaceholderName`n`n这是 prepare-runtime 生成的占位项目：仓库不含实际工作台数据。`n用 -WorktableDataDir <你的项目目录> 重跑本脚本即可替换（一级子目录 = 一个项目）。`n",
    (New-Object System.Text.UTF8Encoding($false)))
  $projectDirs = @(Get-Item $placeholder)
} else {
  $projectDirs = Get-ChildItem $WorktableDataDir -Directory | Sort-Object Name
  if ($projectDirs.Count -eq 0) { Die "工作台数据源没有一级子目录：$WorktableDataDir" }
  foreach ($pd in $projectDirs) {
    Copy-Item $pd.FullName (Join-Path $wtDataDst $pd.Name) -Recurse -Force
  }
}
$projectList = @()
$index = 0
foreach ($pd in $projectDirs) {
  $projectList += [ordered]@{
    id = ('layout-seed' + ($index + 1))
    name = $pd.Name
    dir = $pd.Name
    preset = '2h'
  }
  $index++
}
# 无 BOM 写入（PS 5.1 的 Set-Content -Encoding UTF8 带 BOM，Electron 侧
# JSON.parse 需要 UTF-8 无 BOM——读侧也做了剥 BOM 双保险）。
[System.IO.File]::WriteAllText(
  (Join-Path $runtime 'worktable-projects.json'),
  ($projectList | ConvertTo-Json -Depth 4),
  (New-Object System.Text.UTF8Encoding($false)))
Write-Host ("[packaging] worktable projects: " + (($projectDirs | ForEach-Object { $_.Name }) -join ', '))

# ── 6) VERSION 部署标记 ───────────────────────────────────────────────────────
$sidebarVersion = (Get-Content (Join-Path $lawyerRoot 'plugins/lawyer-sidebar/package.json') -Raw | ConvertFrom-Json).version
Set-Content -Path (Join-Path $runtime 'VERSION') -Value $sidebarVersion

Step "runtime ready: $runtime (version $sidebarVersion)"

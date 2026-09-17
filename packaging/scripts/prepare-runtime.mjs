#!/usr/bin/env node
/**
 * 组装 Electron 壳的 runtime/ 目录 —— 跨平台版（macOS / Linux；Windows 用
 * scripts/prepare-runtime.ps1）。
 *
 * 产物（packaging/runtime/）与 Windows 版逐项一致，Electron 的部署逻辑
 * （electron/main.js 的 assertRuntime / deployRuntime）才能照旧工作：
 *   node/        官方 Node（darwin: bin/node；linux: bin/node）
 *   dsh/         npm 安装的 @deepseek-ai/dsh（自包含依赖树）
 *   plugins/     lawyer-sidebar / lawyer-tools / lawyer-wizard / dsh-worktable
 *   profile-web/ 预组装 web profile（pnpm hoisted，file: 依赖已复制）
 *   agent-presets/lawyer/  lawyer agent preset
 *   skills/      律师技能
 *   legal-zh/    中国法语料 + 18 个 adapter
 *   worktable-data/ + worktable-projects.json
 *   VERSION      部署版本标记
 *
 * 用法：
 *   node scripts/prepare-runtime.mjs
 *   node scripts/prepare-runtime.mjs --platform darwin --arch arm64
 *   node scripts/prepare-runtime.mjs --legal-zh <语料目录> --worktable-data <项目数据目录>
 *
 * 与 ps1 的分工：ps1 是 Windows 已验证链路，不动；本脚本服务 macOS/CI。两者共用
 * 同一份产物契约，改任一侧时请同步另一侧（尤其：dsh 版本、Node 版本、profile-web
 * 的 pnpm-workspace.yaml 内容、dsh-worktable 剥除 dsh.bundle、VERSION 语义）。
 */

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const PACKAGING = path.dirname(SCRIPT_DIR)
const REPO_ROOT = path.dirname(PACKAGING)

const DEFAULTS = {
  // 与开发态验证过的 harness 副本一致（M8.11，deepseek-harness-015）。
  // ★ 守卫陷阱同 ps1：安装与否只看 dsh bin 是否存在 + 依赖树是否完整，
  //   dshVersion 不参与判断——换版本必须先删掉 runtime/dsh 再跑本脚本，
  //   否则会静默沿用旧安装树。
  dshVersion: '0.1.5-rc.2',
  nodeVersion: '24.19.0',
  worktableTgz: 'https://github.com/Aisland-SJL/dsh-worktable/releases/latest/download/dsh-worktable.tgz',
  placeholderName: '示例项目',
}

const USAGE = `用法：node scripts/prepare-runtime.mjs [选项]

选项：
  --platform <darwin|linux>   目标平台（默认当前平台；Windows 请用 prepare-runtime.ps1）
  --arch <arm64|x64>          目标架构（默认当前架构）
  --dsh-version <ver>         dsh 版本（默认 ${DEFAULTS.dshVersion}）
  --node-version <ver>        随包 Node 版本（默认 ${DEFAULTS.nodeVersion}）
  --legal-zh <dir>            中国法语料仓库（默认与 lawyer-dsh 并排）
  --worktable-tgz <url|path>  dsh-worktable 的 npm tgz（默认官方 latest）
  --worktable-data <dir>      工作台项目数据（一级子目录 = 一个项目），可选
  --out <dir>                 输出目录（默认 packaging/runtime）
  -h, --help                  显示本帮助`

function parseArgs(argv) {
  const opts = {
    platform: process.platform,
    arch: process.arch,
    dshVersion: DEFAULTS.dshVersion,
    nodeVersion: DEFAULTS.nodeVersion,
    legalZh: '',
    worktableTgz: DEFAULTS.worktableTgz,
    worktableData: '',
    out: '',
    help: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    switch (arg) {
      case '--platform': opts.platform = argv[++i] ?? opts.platform; break
      case '--arch': opts.arch = argv[++i] ?? opts.arch; break
      case '--dsh-version': opts.dshVersion = argv[++i] ?? opts.dshVersion; break
      case '--node-version': opts.nodeVersion = argv[++i] ?? opts.nodeVersion; break
      case '--legal-zh': opts.legalZh = argv[++i] ?? ''; break
      case '--worktable-tgz': opts.worktableTgz = argv[++i] ?? opts.worktableTgz; break
      case '--worktable-data': opts.worktableData = argv[++i] ?? ''; break
      case '--out': opts.out = argv[++i] ?? ''; break
      case '-h': case '--help': opts.help = true; break
      default: throw new Error(`未知参数：${arg}\n\n${USAGE}`)
    }
  }
  return opts
}

function step(msg) { console.log(`[packaging] ${msg}`) }
function warn(msg) { console.warn(`[packaging] ${msg}`) }
function die(msg) { console.error(`[packaging] ${msg}`); process.exit(1) }

function run(cmd, args, options = {}) {
  console.log(`  $ ${[cmd, ...args].join(' ')}`)
  const result = spawnSync(cmd, args, {
    stdio: options.quiet ? 'pipe' : 'inherit',
    cwd: options.cwd,
    env: options.env,
    shell: false,
  })
  if (result.error || result.status !== 0) {
    die(`${cmd} 失败（退出码 ${result.status}）：${[cmd, ...args].join(' ')}`)
  }
  return result
}

function hasCommand(cmd) {
  const result = spawnSync(cmd, ['--version'], { stdio: 'pipe' })
  return !result.error && result.status === 0
}

async function download(url, dest) {
  if (fs.existsSync(dest)) {
    console.log(`  已缓存：${dest}`)
    return dest
  }
  step(`下载 ${url}`)
  const response = await fetch(url)
  if (!response.ok) die(`下载失败（HTTP ${response.status}）：${url}`)
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.writeFileSync(dest, Buffer.from(await response.arrayBuffer()))
  return dest
}

/** npm/pnpm 安装中断会留下「有目录却缺 package.json」的残缺包，必须拦下。 */
function verifyNodeModules(modulesDir) {
  const script = path.join(SCRIPT_DIR, 'verify-node-modules.cjs')
  const result = spawnSync(process.execPath, [script, modulesDir], { stdio: 'inherit' })
  if (result.status !== 0) {
    warn(`依赖树不完整：${modulesDir}`)
    return false
  }
  return true
}

// ── 1) 随包 Node ────────────────────────────────────────────────────────────
function setupNode(runtimeDir, opts) {
  const nodeRoot = path.join(runtimeDir, 'node')
  const nodeBin = path.join(nodeRoot, 'bin', 'node')
  if (fs.existsSync(nodeBin)) {
    step('Node 已就位，跳过')
    return
  }
  const ext = opts.platform === 'linux' ? 'tar.xz' : 'tar.gz'
  const name = `node-v${opts.nodeVersion}-${opts.platform}-${opts.arch}`
  const url = `https://nodejs.org/dist/v${opts.nodeVersion}/${name}.${ext}`
  const cacheDir = path.join(PACKAGING, '.cache')
  const archive = path.join(cacheDir, `${name}.${ext}`)
  return download(url, archive).then(() => {
    const tmp = path.join(runtimeDir, '.node-extract')
    fs.rmSync(tmp, { recursive: true, force: true })
    fs.mkdirSync(tmp, { recursive: true })
    run('tar', [opts.platform === 'linux' ? '-xJf' : '-xzf', archive, '-C', tmp])
    const extracted = path.join(tmp, name)
    if (!fs.existsSync(extracted)) die(`解压结果异常：${extracted}`)
    fs.rmSync(nodeRoot, { recursive: true, force: true })
    fs.cpSync(extracted, nodeRoot, { recursive: true })
    fs.rmSync(tmp, { recursive: true, force: true })
    // 解压通常保留执行位，但 cpSync 之后复查一次：缺了 Electron 起不来。
    fs.chmodSync(nodeBin, 0o755)
    step(`Node 就位：${nodeBin}`)
  })
}

// ── 2) dsh CLI ──────────────────────────────────────────────────────────────
function setupDsh(runtimeDir, opts) {
  const dshDir = path.join(runtimeDir, 'dsh')
  const dshBin = path.join(dshDir, 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js')
  const modulesDir = path.join(dshDir, 'node_modules')
  // 版本比对（M8.11）：旧逻辑只看 bin.js + 依赖树完整性，改了 dshVersion 也会跳过
  // 安装，导致「声明版本与实际安装树不一致」被固化进安装包（实测踩过）。与 ps1 同款。
  const dshPkgJson = path.join(dshDir, 'node_modules', '@deepseek-ai', 'dsh', 'package.json')
  let installedDshVersion = null
  try {
    installedDshVersion = JSON.parse(fs.readFileSync(dshPkgJson, 'utf8')).version
  } catch {
    installedDshVersion = null
  }
  const dshVersionMatches = installedDshVersion === opts.dshVersion
  if (fs.existsSync(dshBin) && dshVersionMatches && verifyNodeModules(modulesDir)) {
    step('dsh 已就位，跳过')
    return
  }
  if (fs.existsSync(dshBin) && !dshVersionMatches) {
    step(`dsh 版本不一致（已装 ${installedDshVersion ?? '未知'}，目标 ${opts.dshVersion}）- 重装`)
  }
  step(`安装 @deepseek-ai/dsh@${opts.dshVersion}`)
  fs.rmSync(dshDir, { recursive: true, force: true })
  fs.mkdirSync(dshDir, { recursive: true })
  fs.writeFileSync(
    path.join(dshDir, 'package.json'),
    `${JSON.stringify({ name: 'lawyer-dsh-runtime', private: true }, null, 2)}\n`,
    'utf8',
  )
  // 交叉构建（在 Apple Silicon 上打 x64 包）时必须让 npm 按**目标**平台挑原生
  // 依赖（koffi 等），否则会把本机的 arm64 二进制打进 x64 包，Intel Mac 上加载失败。
  run('npm', ['install', `@deepseek-ai/dsh@${opts.dshVersion}`, '--no-audit', '--no-fund', '--loglevel', 'warn'], {
    cwd: dshDir,
    env: { ...process.env, npm_config_platform: opts.platform, npm_config_arch: opts.arch },
  })
  if (!verifyNodeModules(modulesDir)) {
    die('dsh 依赖树校验失败（存在缺 package.json 的残缺包）。多为 npm 缓存损坏，请先 npm cache clean --force 再重跑')
  }
}

// ── 3) 律师插件（产物已入库，直接复制）────────────────────────────────────
function copyPlugins(runtimeDir) {
  for (const name of ['lawyer-sidebar', 'lawyer-tools', 'lawyer-wizard']) {
    const src = path.join(REPO_ROOT, 'plugins', name)
    if (!fs.existsSync(path.join(src, 'lib'))) {
      die(`plugins/${name}/lib 不存在 —— 请先在 plugins/${name} 下运行构建脚本`)
    }
    const dst = path.join(runtimeDir, 'plugins', name)
    fs.rmSync(dst, { recursive: true, force: true })
    fs.mkdirSync(dst, { recursive: true })
    fs.cpSync(path.join(src, 'lib'), path.join(dst, 'lib'), { recursive: true })
    fs.copyFileSync(path.join(src, 'package.json'), path.join(dst, 'package.json'))
    step(`复制插件 ${name}`)
  }
}

// ── 4) dsh-worktable（官方 tgz，剥除 dsh.bundle）───────────────────────────
async function setupWorktable(runtimeDir, opts) {
  const dst = path.join(runtimeDir, 'plugins', 'dsh-worktable')
  const cacheDir = path.join(PACKAGING, '.cache')
  let archive = opts.worktableTgz
  if (/^https?:\/\//i.test(archive)) {
    archive = await download(archive, path.join(cacheDir, 'dsh-worktable.tgz'))
  } else if (!fs.existsSync(archive)) {
    die(`dsh-worktable tgz 不存在：${archive}`)
  }
  const tmp = path.join(cacheDir, '.worktable-extract')
  fs.rmSync(tmp, { recursive: true, force: true })
  fs.mkdirSync(tmp, { recursive: true })
  run('tar', ['-xzf', archive, '-C', tmp])
  // npm tgz 内是 package/ 目录
  const src = fs.existsSync(path.join(tmp, 'package')) ? path.join(tmp, 'package') : tmp
  if (!fs.existsSync(path.join(src, 'lib', 'client.js'))) {
    die(`dsh-worktable 压缩包结构异常：${src} 下没有 lib/client.js`)
  }
  fs.rmSync(dst, { recursive: true, force: true })
  fs.mkdirSync(dst, { recursive: true })
  fs.cpSync(path.join(src, 'lib'), path.join(dst, 'lib'), { recursive: true })
  for (const file of ['package.json', 'cordis.patch.yml', 'dsh.plugin.json', 'README.md', 'LICENSE']) {
    if (fs.existsSync(path.join(src, file))) fs.copyFileSync(path.join(src, file), path.join(dst, file))
  }
  // 关键：同时声明 dsh.bundle 与 dsh.client 时，运行时会把它当 bundle 包而跳过
  // 客户端静态装配（/plugins/dsh-worktable/client.js 404、界面空白）。
  const manifestPath = path.join(dst, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(manifestPath, 'utf8').replace(/^﻿/, ''))
  if (pkg.dsh?.bundle && pkg.dsh?.client) {
    delete pkg.dsh.bundle
    // 无 BOM 写出：BOM 会让 pnpm 解析 package.json 失败。
    fs.writeFileSync(manifestPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')
    step('已剥除 dsh-worktable 的 dsh.bundle（按客户端插件装配）')
  }
  fs.rmSync(tmp, { recursive: true, force: true })
}

// ── 5) web profile（预组装，用户机器免 pnpm）───────────────────────────────
function setupProfileWeb(runtimeDir) {
  const profileDir = path.join(runtimeDir, 'profile-web')
  step('组装 profile-web')
  fs.rmSync(profileDir, { recursive: true, force: true })
  fs.mkdirSync(profileDir, { recursive: true })
  fs.writeFileSync(path.join(profileDir, 'package.json'), `${JSON.stringify({
    name: 'dsh-profile-web',
    private: true,
    dsh: { profile: { bundles: ['@deepseek-ai/dsh-base', '@deepseek-ai/dsh-web-app'] } },
    dependencies: {
      'lawyer-sidebar': 'file:../plugins/lawyer-sidebar',
      'lawyer-tools': 'file:../plugins/lawyer-tools',
      'lawyer-wizard': 'file:../plugins/lawyer-wizard',
      'dsh-worktable': 'file:../plugins/dsh-worktable',
    },
  }, null, 2)}\n`, 'utf8')
  // nodeLinker: hoisted —— 与 dsh 官方 initProfile 生成的模板逐字一致，缺了会
  // 让插件解析不到宿主提供的 cordis。
  fs.writeFileSync(path.join(profileDir, 'pnpm-workspace.yaml'), 'packages:\n  - .\n\nnodeLinker: hoisted\nautoInstallPeers: false\n', 'utf8')
  fs.writeFileSync(path.join(profileDir, 'cordis.yml'), '# dsh profile root — an empty entry list. The tree is composed as patches.\n[]\n', 'utf8')
  fs.writeFileSync(path.join(profileDir, 'cordis.patch.yml'), '# Your patch layer for this dsh profile.\n[]\n', 'utf8')

  if (!hasCommand('pnpm')) {
    die('未检测到 pnpm —— 请先执行 corepack enable && corepack prepare pnpm@11.7.0 --activate')
  }
  run('pnpm', ['install'], { cwd: profileDir })
  if (!verifyNodeModules(path.join(profileDir, 'node_modules'))) {
    die('profile-web 依赖树校验失败，请删除 runtime/profile-web 后重跑')
  }
}

// ── 6) preset / skills / 中国法语料 ────────────────────────────────────────
function copyPresetAndSkills(runtimeDir) {
  step('复制 lawyer preset 与 skills')
  const presetDst = path.join(runtimeDir, 'agent-presets', 'lawyer')
  fs.rmSync(presetDst, { recursive: true, force: true })
  fs.cpSync(path.join(REPO_ROOT, 'profiles', 'lawyer'), presetDst, { recursive: true })

  const skillsDst = path.join(runtimeDir, 'skills')
  fs.rmSync(skillsDst, { recursive: true, force: true })
  fs.cpSync(path.join(REPO_ROOT, 'skills'), skillsDst, { recursive: true, filter: src => path.basename(src) !== '__pycache__' && !src.endsWith('.pyc') })
}

function copyLegalZh(runtimeDir, opts) {
  const src = opts.legalZh || path.join(path.dirname(REPO_ROOT), 'claude-for-legal-ZH')
  if (!fs.existsSync(path.join(src, '.dsh', 'skills'))) {
    die(`未找到 claude-for-legal-ZH：${src}（请先克隆，或用 --legal-zh 指定）`)
  }
  step('复制 claude-for-legal-ZH')
  const dst = path.join(runtimeDir, 'legal-zh')
  fs.rmSync(dst, { recursive: true, force: true })
  fs.mkdirSync(dst, { recursive: true })
  // 跳过 docs/（约 26MB，adapter 不引用）、.git 与其它端的适配层
  const skip = new Set(['.git', 'docs', '.github', '.agents', '.workbuddy'])
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (skip.has(entry.name)) continue
    fs.cpSync(path.join(src, entry.name), path.join(dst, entry.name), { recursive: true })
  }
  const adapters = fs.readdirSync(path.join(dst, '.dsh', 'skills'), { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('chinese-legal-'))
    .length
  if (adapters === 0) die(`legal-zh 产物异常：未复制到任何 chinese-legal-* adapter（${dst}/.dsh/skills）`)
  console.log(`[packaging] legal-zh adapters: ${adapters}`)
}

// ── 7) 工作台项目数据 ──────────────────────────────────────────────────────
function copyWorktableData(runtimeDir, opts) {
  step('复制工作台项目数据')
  const dataDst = path.join(runtimeDir, 'worktable-data')
  fs.rmSync(dataDst, { recursive: true, force: true })
  fs.mkdirSync(dataDst, { recursive: true })
  let projectDirs = []
  if (opts.worktableData && fs.existsSync(opts.worktableData)) {
    projectDirs = fs.readdirSync(opts.worktableData, { withFileTypes: true })
      .filter(entry => entry.isDirectory())
      .map(entry => entry.name)
      .sort()
    for (const name of projectDirs) {
      fs.cpSync(path.join(opts.worktableData, name), path.join(dataDst, name), { recursive: true })
    }
  } else {
    // 占位项目：仓库里不含实际项目数据，但 assertRuntime 要求该目录与清单存在
    projectDirs = [DEFAULTS.placeholderName]
    fs.mkdirSync(path.join(dataDst, DEFAULTS.placeholderName), { recursive: true })
    fs.writeFileSync(
      path.join(dataDst, DEFAULTS.placeholderName, 'README.md'),
      `# ${DEFAULTS.placeholderName}\n\n这是 prepare-runtime 生成的占位项目：仓库不含实际工作台数据。\n用 --worktable-data <你的项目目录> 重跑本脚本即可替换（一级子目录 = 一个项目）。\n`,
      'utf8',
    )
  }
  const projects = projectDirs.map((name, index) => ({
    id: `layout-seed${index + 1}`,
    name,
    dir: name,
    preset: '2h',
  }))
  // UTF-8 无 BOM（Electron 侧要 JSON.parse）
  fs.writeFileSync(path.join(runtimeDir, 'worktable-projects.json'), `${JSON.stringify(projects, null, 2)}\n`, 'utf8')
  console.log(`[packaging] worktable projects: ${projectDirs.join(', ')}`)
}

async function main() {
  let opts
  try {
    opts = parseArgs(process.argv.slice(2))
  } catch (error) {
    die(error.message)
  }
  if (opts.help) {
    console.log(USAGE)
    return
  }
  if (opts.platform === 'win32') {
    die('Windows 请用 scripts/prepare-runtime.ps1（本脚本服务 macOS / Linux）')
  }
  if (!['darwin', 'linux'].includes(opts.platform)) die(`不支持的平台：${opts.platform}`)

  const runtimeDir = path.resolve(opts.out || path.join(PACKAGING, 'runtime'))
  fs.mkdirSync(runtimeDir, { recursive: true })

  await setupNode(runtimeDir, opts)
  setupDsh(runtimeDir, opts)
  copyPlugins(runtimeDir)
  await setupWorktable(runtimeDir, opts)
  setupProfileWeb(runtimeDir)
  copyPresetAndSkills(runtimeDir)
  copyLegalZh(runtimeDir, opts)
  copyWorktableData(runtimeDir, opts)

  const sidebarVersion = JSON.parse(
    fs.readFileSync(path.join(REPO_ROOT, 'plugins', 'lawyer-sidebar', 'package.json'), 'utf8'),
  ).version
  fs.writeFileSync(path.join(runtimeDir, 'VERSION'), `${sidebarVersion}\n`, 'utf8')

  step(`runtime ready: ${runtimeDir} (version ${sidebarVersion})`)
}

main().catch(error => die(error.stack ?? String(error)))

#!/usr/bin/env node
/**
 * 律师工作台（lawyer-dsh）插件一键安装 —— 跨平台版（Windows / macOS / Linux）。
 *
 * Windows 上的等价实现是插件仓的 scripts/install-plugin.ps1（PowerShell 5.1），
 * macOS / Linux 用不了，本脚本是它的 Node 等价物，并补齐了插件版原本缺失的
 * lawyer-wizard 与 dsh-worktable。
 *
 * 做六件事：
 *   0) 环境自检：Node 版本、pnpm（dsh plugin 内部转发 pnpm，缺它直接 127）、
 *      dsh 可用性、DSH_HOME
 *   1) 把 lawyer-sidebar / lawyer-tools / lawyer-wizard 装进 web profile
 *      （先 remove 再 add：pnpm 对 file: 依赖在 spec 不变时会跳过内容更新）
 *   2) 装 dsh-worktable（官方 latest release 的 tgz）并剥除 dsh.bundle
 *   3) 部署 lawyer agent preset
 *   4) 安装 claude-for-legal-ZH 的 dsh adapter（可选；缺失只告警）
 *   5) 生成填好本机路径的 overlay，并打印验证清单与启动命令
 *
 * 用法：
 *   node scripts/install-plugin.mjs
 *   node scripts/install-plugin.mjs --skip-worktable
 *   node scripts/install-plugin.mjs --legal-zh <语料仓库目录>
 *   node scripts/install-plugin.mjs --uninstall
 *
 * 注意几个已踩过的坑（改动时别踩回去）：
 *   - `dsh plugin` 是 pnpm 转发器，PATH 里必须有 pnpm，否则退出码 127。
 *   - 本地插件 spec 用 file:/// + 绝对路径（pathToFileURL 生成），相对路径会被
 *     dsh 按「调用方 cwd」重写。
 *   - dsh-worktable 的 package.json 同时声明 dsh.bundle 与 dsh.client 时，会被
 *     运行时当作 bundle 包而跳过客户端静态装配（/plugins/dsh-worktable/client.js
 *     404、界面空白），故装完必须剥除 dsh.bundle，并把它从 profile 的
 *     dsh.profile.bundles 里摘掉（装配改由 overlay 的 insert 负责，与打包一致）。
 *   - 启动命令里 --patch 必须排在 --no-open 之前：`dsh web --patch X --no-open`。
 *     顺序反了会被 web 子命令当成透传参数，commander 报 unknown option。
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.dirname(SCRIPT_DIR)

// 0.1.5-rc.2：与开发态验证过的 harness 副本一致（M8.11）。注意 0.1.5 起 Web
// 根路径需要一次性 token，见文末启动提示。
const DSH_VERSION = '0.1.5-rc.2'
const PNPM_VERSION = '11.7.0'
const LOCAL_PLUGINS = ['lawyer-sidebar', 'lawyer-tools', 'lawyer-wizard']
const WORKTABLE_TGZ = 'https://github.com/Aisland-SJL/dsh-worktable/releases/latest/download/dsh-worktable.tgz'

const USAGE = `用法：node scripts/install-plugin.mjs [选项]

选项：
  --profile <name>     目标 dsh profile（默认 web）
  --dsh-home <dir>     dsh 用户目录（默认：$DSH_HOME，其次 ~/.dsh）
  --dsh-version <ver>  PATH 里没有 dsh 时用 npx 拉的版本（默认 ${DSH_VERSION}）
  --legal-zh <dir>     claude-for-legal-ZH 仓库目录（默认：与本仓并排）
  --clone-legal-zh     语料缺失时自动 git clone
  --link               中国法 adapter 用符号链接（git pull 即更新）
  --skip-worktable     不装 dsh-worktable（其 macOS 支持为实验性）
  --skip-legal-zh      不装中国法语料
  --in-place           把填充好的路径写回仓库里的 cordis.yml（默认写到 DSH_HOME）
  --uninstall          卸载：移除插件、preset、中国法 adapter 与生成的 overlay
  -h, --help           显示本帮助`

function parseArgs(argv) {
  const opts = {
    profile: 'web',
    dshHome: '',
    dshVersion: DSH_VERSION,
    legalZh: '',
    cloneLegalZh: false,
    link: false,
    skipWorktable: false,
    skipLegalZh: false,
    inPlace: false,
    uninstall: false,
    help: false,
  }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    switch (arg) {
      case '--profile': opts.profile = argv[++i] ?? 'web'; break
      case '--dsh-home': opts.dshHome = argv[++i] ?? ''; break
      case '--dsh-version': opts.dshVersion = argv[++i] ?? DSH_VERSION; break
      case '--legal-zh': opts.legalZh = argv[++i] ?? ''; break
      case '--clone-legal-zh': opts.cloneLegalZh = true; break
      case '--link': opts.link = true; break
      case '--skip-worktable': opts.skipWorktable = true; break
      case '--skip-legal-zh': opts.skipLegalZh = true; break
      case '--in-place': opts.inPlace = true; break
      case '--uninstall': opts.uninstall = true; break
      case '-h': case '--help': opts.help = true; break
      default:
        throw new Error(`未知参数：${arg}\n\n${USAGE}`)
    }
  }
  return opts
}

function step(msg) { console.log(`[install] ${msg}`) }
function warn(msg) { console.warn(`[install] ${msg}`) }
function die(msg) { console.error(`[install] ${msg}`); process.exit(1) }

/** 跑一条命令，返回 { ok, status }；失败时打印命令原文便于复现。 */
function run(cmd, args, options = {}) {
  const printable = [cmd, ...args].join(' ')
  if (!options.quiet) console.log(`  $ ${printable}`)
  const result = spawnSync(cmd, args, {
    stdio: options.quiet ? 'pipe' : 'inherit',
    // Windows 上 .cmd / .ps1 shim（pnpm、npx、dsh.cmd）必须经 shell 才能执行；
    // 直接跑 node 时不要 shell，避免路径含空格被 cmd 二次解析。
    shell: cmd === process.execPath ? false : process.platform === 'win32',
    ...options.spawn,
  })
  if (result.error) return { ok: false, status: null, printable, error: result.error }
  return { ok: result.status === 0, status: result.status, printable }
}

function hasCommand(cmd, args) {
  const result = spawnSync(cmd, args, { stdio: 'pipe', shell: process.platform === 'win32' })
  return !result.error && result.status === 0
}

/**
 * dsh 的调用方式：优先 PATH 里的 dsh，否则回退 npx（首次会下载，稍慢）。
 * Windows 上 npx 是 .cmd，靠 run() 的 shell:true 执行。
 */
function makeDshRunner(version) {
  let base = null
  const useGlobal = hasCommand('dsh', ['--version'])
  if (useGlobal) {
    const probe = spawnSync('dsh', ['--version'], { stdio: 'pipe', shell: process.platform === 'win32' })
    const printed = `${probe.stdout ?? ''}`.trim()
    base = ['dsh']
    console.log(`  dsh: ${printed || 'dsh'}（PATH）  ok`)
    if (printed && !printed.includes(version)) {
      warn(`本机 dsh 是 ${printed}，本项目验证过的版本是 ${version}；继续安装，出问题先换版本。`)
    }
  } else {
    base = ['npx', '-y', `@deepseek-ai/dsh@${version}`]
    console.log(`  dsh: 使用 npx @deepseek-ai/dsh@${version}（建议先 npm i -g 该版本以加速）`)
  }
  return function runDsh(args, options = {}) {
    const [cmd, ...prefix] = base
    return run(cmd, [...prefix, ...args], options)
  }
}

/** 环境自检：Node 版本 + pnpm（dsh plugin 的硬依赖）。 */
function checkEnvironment() {
  step('环境自检')
  const nodeVersion = process.versions.node
  const [majorText, minorText] = nodeVersion.split('.')
  const major = Number(majorText)
  const minor = Number(minorText)
  // dsh 官方验证范围：^22.19.0 || >=24
  const ok = major > 22 ? major >= 24 : (major === 22 && minor >= 19)
  if (!ok) die(`Node ${nodeVersion} 版本过低 —— 需要 22.19+ 或 24+（macOS：brew install node@24）`)
  console.log(`  Node v${nodeVersion}  ok`)

  if (!hasCommand('pnpm', ['--version'])) {
    die(`未检测到 pnpm —— dsh plugin 内部转发 pnpm，缺它安装会直接退出 127。
      先执行：corepack enable && corepack prepare pnpm@${PNPM_VERSION} --activate
      （macOS 也可用：brew install pnpm）`)
  }
  console.log('  pnpm  ok')
}

/** 先 remove 再 add：pnpm 对 file: 依赖在 spec 不变时会跳过内容更新。 */
function addPlugin(runDsh, profile, spec, label) {
  runDsh(['plugin', '--profile', profile, 'remove', label], { quiet: true })
  const result = runDsh(['plugin', '--profile', profile, 'add', spec])
  if (!result.ok) {
    die(`${label} 安装失败（退出码 ${result.status}）—— 命令：${result.printable}
      常见原因：pnpm 未装（见上）、路径含空格未加引号、dsh 版本不匹配。`)
  }
  console.log(`  installed ${label}`)
}

/**
 * 找到 dsh-worktable 装到 profile 后的 package.json。
 * hoisted 布局下是 node_modules/dsh-worktable；isolated 布局下真实目录在
 * .pnpm 里，node_modules 下那个只是符号链接（直接改写会污染源包）。
 */
function locateWorktableManifest(profileDir) {
  const direct = path.join(profileDir, 'node_modules', 'dsh-worktable', 'package.json')
  if (fs.existsSync(direct)) {
    const stat = fs.lstatSync(path.join(profileDir, 'node_modules', 'dsh-worktable'))
    if (!stat.isSymbolicLink()) return direct
  }
  const pnpmDir = path.join(profileDir, 'node_modules', '.pnpm')
  if (fs.existsSync(pnpmDir)) {
    for (const entry of fs.readdirSync(pnpmDir)) {
      if (!entry.startsWith('dsh-worktable@')) continue
      const candidate = path.join(pnpmDir, entry, 'node_modules', 'dsh-worktable', 'package.json')
      if (fs.existsSync(candidate)) return candidate
    }
  }
  return fs.existsSync(direct) ? direct : null
}

/**
 * 剥除 dsh-worktable 的 dsh.bundle：同时声明 dsh.bundle 与 dsh.client 时，
 * 运行时会把它当 bundle 包而跳过客户端静态装配（界面空白 / client.js 404）。
 * 剥除后装配改由 overlay 的 insert 负责，与打包版一致，因此还要把它从
 * profile 的 dsh.profile.bundles 里摘掉，避免重复加载。
 */
function stripWorktableBundle(profileDir) {
  const manifestPath = locateWorktableManifest(profileDir)
  if (!manifestPath) {
    warn('未能定位 dsh-worktable 的 package.json，跳过 dsh.bundle 剥除（若左侧工作台空白，请检查该包是否装成功）')
    return false
  }
  const raw = fs.readFileSync(manifestPath, 'utf8').replace(/^﻿/, '')
  let pkg
  try {
    pkg = JSON.parse(raw)
  } catch (error) {
    warn(`解析 ${manifestPath} 失败，跳过剥除：${error.message}`)
    return false
  }
  if (!pkg.dsh?.bundle || !pkg.dsh?.client) return false

  delete pkg.dsh.bundle
  // 无 BOM 写出：BOM 会让 pnpm 解析 package.json 失败。
  fs.writeFileSync(manifestPath, `${JSON.stringify(pkg, null, 2)}\n`, 'utf8')
  console.log(`  已剥除 dsh.bundle：${manifestPath}`)

  const profileManifestPath = path.join(profileDir, 'package.json')
  if (fs.existsSync(profileManifestPath)) {
    const profilePkg = JSON.parse(fs.readFileSync(profileManifestPath, 'utf8').replace(/^﻿/, ''))
    const bundles = profilePkg.dsh?.profile?.bundles
    if (Array.isArray(bundles) && bundles.includes('dsh-worktable')) {
      profilePkg.dsh.profile.bundles = bundles.filter(name => name !== 'dsh-worktable')
      fs.writeFileSync(profileManifestPath, `${JSON.stringify(profilePkg, null, 2)}\n`, 'utf8')
      console.log('  已从 profile 的 dsh.profile.bundles 中摘除 dsh-worktable（改由 overlay 装配）')
    }
  }
  return true
}

/** 部署 lawyer agent preset。 */
function deployPreset(dshHome) {
  const src = path.join(REPO_ROOT, 'profiles', 'lawyer')
  if (!fs.existsSync(path.join(src, 'agent.cordis.yml'))) {
    warn(`未找到 lawyer preset：${src}`)
    return
  }
  const dest = path.join(dshHome, '.agent-presets', 'lawyer')
  fs.rmSync(dest, { recursive: true, force: true })
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.cpSync(src, dest, { recursive: true })
  console.log(`  deployed: ${dest}`)
}

/** 生成填好本机路径的 overlay。默认写到 DSH_HOME，避免污染仓库文件。 */
function buildOverlay(opts, dshHome, withWorktable) {
  const templatePath = path.join(REPO_ROOT, 'plugins', 'lawyer-sidebar', 'cordis.yml')
  if (!fs.existsSync(templatePath)) {
    warn(`未找到 overlay 模板：${templatePath}`)
    return null
  }
  let text = fs.readFileSync(templatePath, 'utf8').replace(/^﻿/, '')
  const repoForYaml = REPO_ROOT.replaceAll('\\', '/')
  text = text.replaceAll('<lawyer-dsh 仓库绝对路径>', repoForYaml)
  if (withWorktable) {
    text = `${text.replace(/\s*$/, '')}\n  - id: dsh-worktable\n    name: dsh-worktable\n`
  }
  const dest = opts.inPlace
    ? templatePath
    : path.join(dshHome, 'lawyer-overlay.yml')
  fs.writeFileSync(dest, text, 'utf8')
  console.log(`  overlay: ${dest}`)
  if (opts.inPlace) warn('已就地改写仓库内的 cordis.yml（--in-place）；多人共用仓库时建议改用默认输出位置。')
  return dest
}

function uninstall(opts, runDsh, dshHome) {
  step('卸载插件')
  for (const name of [...LOCAL_PLUGINS, 'dsh-worktable']) {
    runDsh(['plugin', '--profile', opts.profile, 'remove', name], { quiet: true })
    console.log(`  removed ${name}`)
  }
  const preset = path.join(dshHome, '.agent-presets', 'lawyer')
  if (fs.existsSync(preset)) {
    fs.rmSync(preset, { recursive: true, force: true })
    console.log(`  removed preset: ${preset}`)
  }
  const overlay = path.join(dshHome, 'lawyer-overlay.yml')
  if (fs.existsSync(overlay)) {
    fs.rmSync(overlay, { force: true })
    console.log(`  removed overlay: ${overlay}`)
  }
  const legalZhScript = path.join(SCRIPT_DIR, 'install-legal-zh.mjs')
  if (fs.existsSync(legalZhScript)) {
    run(process.execPath, [legalZhScript, '--dsh-home', dshHome, '--uninstall'])
  }
  console.log('')
  console.log('卸载完成。DSH_HOME 里的设置、画像与凭据保留未动。')
}

function printVerification(opts, dshHome, profileDir, withWorktable) {
  step('验证')
  const profileManifest = path.join(profileDir, 'package.json')
  if (fs.existsSync(profileManifest)) {
    const pkg = JSON.parse(fs.readFileSync(profileManifest, 'utf8').replace(/^﻿/, ''))
    const deps = pkg.dependencies ?? {}
    const expected = withWorktable ? [...LOCAL_PLUGINS, 'dsh-worktable'] : LOCAL_PLUGINS
    for (const name of expected) {
      if (deps[name]) console.log(`  profile 依赖 ${name}  ok`)
      else warn(`profile 依赖里没有 ${name}`)
    }
    const bundles = pkg.dsh?.profile?.bundles ?? []
    if (bundles.includes('dsh-worktable')) warn('profile 的 bundles 里仍有 dsh-worktable（应已摘除）')
  } else {
    warn(`未找到 ${profileManifest}（profile 未初始化？）`)
  }

  const presetFile = path.join(dshHome, '.agent-presets', 'lawyer', 'agent.cordis.yml')
  if (fs.existsSync(presetFile)) console.log('  preset 就位  ok')
  else warn('preset 缺少 agent.cordis.yml')

  const skillsDir = path.join(dshHome, 'skills')
  const adapters = fs.existsSync(skillsDir)
    ? fs.readdirSync(skillsDir, { withFileTypes: true })
      .filter(entry => entry.isDirectory() && entry.name.startsWith('chinese-legal-'))
      .length
    : 0
  if (adapters > 0) console.log(`  中国法 adapter: ${adapters} 个  ok`)
  else warn('未安装中国法 adapter（功能降级，见上方提示）')
}

function main() {
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

  const dshHome = path.resolve(opts.dshHome || (process.env.DSH_HOME ?? '').trim() || path.join(os.homedir(), '.dsh'))
  const profileDir = path.join(dshHome, 'profiles', opts.profile)

  checkEnvironment()
  const runDsh = makeDshRunner(opts.dshVersion)
  console.log(`  DSH_HOME: ${dshHome}`)
  console.log(`  profile:  ${profileDir}`)

  if (opts.uninstall) {
    uninstall(opts, runDsh, dshHome)
    return
  }

  // ── 1) 三个本地插件（先 remove 再 add）───────────────────────────────────
  step('安装本地插件（先 remove 再 add，确保取到最新产物）')
  for (const name of LOCAL_PLUGINS) {
    const dir = path.join(REPO_ROOT, 'plugins', name)
    if (!fs.existsSync(path.join(dir, 'package.json'))) {
      die(`未找到插件目录：${dir}（请在完整的 lawyer-dsh 仓库里运行本脚本）`)
    }
    // 与既有的 install-plugin.ps1 / debug-web.cmd 保持一致：手写 file:/// +
    // 正斜杠绝对路径（不用 pathToFileURL，避免空格被编码成 %20 后 pnpm 解析分歧）。
    addPlugin(runDsh, opts.profile, `file:///${dir.replaceAll('\\', '/')}`, name)
  }
  console.log('  注：这三个插件只声明 dsh.client，dsh 会打印 “declares no dsh.bundle” 警告 —— 属预期，装配由 overlay 负责。')

  // ── 2) dsh-worktable（官方最新 tgz）──────────────────────────────────────
  let withWorktable = false
  if (opts.skipWorktable) {
    step('跳过 dsh-worktable（--skip-worktable）')
  } else {
    step('安装 dsh-worktable（官方 latest release）')
    const result = runDsh(['plugin', '--profile', opts.profile, 'add', WORKTABLE_TGZ])
    if (result.ok) {
      withWorktable = true
      console.log('  installed dsh-worktable')
      // 官方 README 标注 macOS 为实验性支持，装成功也只是「能装上」，真机效果见文档。
      stripWorktableBundle(profileDir)
    } else {
      warn(`dsh-worktable 安装失败（退出码 ${result.status}）—— 跳过，其余功能不受影响。
      需要左侧工作台时手动重跑：${result.printable}`)
    }
  }

  // ── 3) lawyer preset ─────────────────────────────────────────────────────
  step('部署 lawyer agent preset')
  deployPreset(dshHome)

  // ── 4) 中国法语料（可选）─────────────────────────────────────────────────
  if (opts.skipLegalZh) {
    step('跳过中国法语料（--skip-legal-zh）')
  } else {
    step('安装 claude-for-legal-ZH 的 dsh adapter（可选）')
    let legalZhDir = opts.legalZh
      ? path.resolve(opts.legalZh)
      : path.join(path.dirname(REPO_ROOT), 'claude-for-legal-ZH')
    if (!fs.existsSync(path.join(legalZhDir, '.dsh', 'skills'))) {
      if (opts.cloneLegalZh) {
        console.log(`  克隆 claude-for-legal-ZH 到 ${legalZhDir} ...`)
        const cloned = run('git', ['clone', 'https://github.com/CSlawyer1985/claude-for-legal-ZH.git', legalZhDir])
        if (!cloned.ok) warn('克隆失败，跳过中国法语料安装。')
      } else {
        warn(`未找到 claude-for-legal-ZH：${legalZhDir}
      三个入口仍可用，但拿不到中国法的领域工作流与质量门禁。克隆后重跑本脚本：
      git clone https://github.com/CSlawyer1985/claude-for-legal-ZH.git "${legalZhDir}"
      （或加 --clone-legal-zh 让本脚本自动克隆）`)
      }
    }
    if (fs.existsSync(path.join(legalZhDir, '.dsh', 'skills'))) {
      const args = [path.join(SCRIPT_DIR, 'install-legal-zh.mjs'), '--repo', legalZhDir, '--dsh-home', dshHome]
      if (opts.link) args.push('--link')
      run(process.execPath, args)
    }
  }

  // ── 5) overlay ───────────────────────────────────────────────────────────
  step('生成 overlay')
  const overlay = buildOverlay(opts, dshHome, withWorktable)

  // ── 6) 验证与启动命令 ────────────────────────────────────────────────────
  printVerification(opts, dshHome, profileDir, withWorktable)

  console.log('')
  console.log('安装完成。启动方式：')
  const patchArg = overlay ? ` --patch "${overlay}"` : ''
  console.log(`  dsh web${patchArg} --no-open`)
  console.log('  浏览器打开 http://127.0.0.1:3080（首次请 Cmd/Ctrl+Shift+R 强刷一次）。')
  console.log('')
  console.log('注意：--patch 必须排在 --no-open 之前，顺序反了会被 web 子命令当成透传参数而报 unknown option。')
  console.log('若 3080 端口已被旧的 dsh web 占用，先停掉它再启动（插件重装后必须重启 dsh 才生效）。')
  console.log('0.1.5 起根路径需要一次性 token：启动后从终端输出里找')
  console.log('  dsh web: http://127.0.0.1:3080/?token=...')
  console.log('这一行，用**完整 URL** 打开（无 token 直连会 401；首次访问会落一个 30 天 cookie，之后直连即可）。')
  console.log('可选：设置环境变量 YUANDIAN_API_KEY 后，法规 / 案例检索工具才可用。')
}

main()

#!/usr/bin/env node
/**
 * 打包「跨平台插件包」：dist/lawyer-plugins-v<版本>.zip
 *
 * 给不想克隆整个仓库的 macOS / Linux 用户一条下载即用路径：包里只有运行所需
 * 的插件产物、preset、技能与两个安装脚本（插件 lib/ 已入库，故产物可直接复制，
 * 不需要 esbuild 与 deepseek-harness 源码）。
 *
 * 与插件仓的 scripts/make-plugin-zip.ps1 的区别：那份只含 lawyer-sidebar +
 * lawyer-tools（无 wizard、无 worktable），且只能在 Windows 上跑；本脚本产出
 * 的是**完整四插件**的跨平台包（wizard 取本仓当前版本，worktable 由安装脚本
 * 从官方 latest release 拉）。
 *
 * 用法：node scripts/make-plugin-zip.mjs
 *
 * 压缩命令按平台择优：macOS 用 ditto（保留资源分支与元数据，最稳），其次 zip，
 * Windows 用自带的 bsdtar（tar -a）。不用 PowerShell 的 Compress-Archive：
 * 它会写出反斜杠路径的非标准 zip，部分解压工具会把整条路径当成文件名。
 */

import fs from 'node:fs'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.dirname(SCRIPT_DIR)
const STAGING_NAME = 'lawyer-plugins'

function step(msg) { console.log(`[zip] ${msg}`) }
function die(msg) { console.error(`[zip] ${msg}`); process.exit(1) }

function hasCommand(cmd) {
  const result = spawnSync(cmd, ['--version'], { stdio: 'pipe', shell: process.platform === 'win32' })
  return !result.error
}

function run(cmd, args, cwd) {
  console.log(`  $ ${[cmd, ...args].join(' ')}`)
  const result = spawnSync(cmd, args, { stdio: 'inherit', cwd, shell: process.platform === 'win32' })
  if (result.error || result.status !== 0) die(`${cmd} 失败（退出码 ${result.status}）`)
}

function copyDir(src, dest, skip = []) {
  if (!fs.existsSync(src)) return false
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.cpSync(src, dest, {
    recursive: true,
    filter: source => !skip.some(name => path.basename(source) === name),
  })
  return true
}

function copyFile(src, dest) {
  if (!fs.existsSync(src)) return false
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
  return true
}

function pack(srcDir, zipPath) {
  const parent = path.dirname(srcDir)
  const base = path.basename(srcDir)
  fs.rmSync(zipPath, { force: true })
  if (process.platform === 'darwin' && hasCommand('ditto')) {
    run('ditto', ['-c', '-k', '--sequesterRsrc', '--keepParent', base, zipPath], parent)
  } else if (hasCommand('zip')) {
    run('zip', ['-r', '-q', zipPath, base], parent)
  } else {
    // Windows 10 1803+ 自带 bsdtar
    run('tar', ['-a', '-cf', zipPath, base], parent)
  }
}

function main() {
  const version = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'plugins', 'lawyer-sidebar', 'package.json'), 'utf8')).version
  const stagingRoot = path.join(REPO_ROOT, '.zip-staging')
  const staging = path.join(stagingRoot, STAGING_NAME)
  const outDir = path.join(REPO_ROOT, 'dist')
  const zipPath = path.join(outDir, `lawyer-plugins-v${version}.zip`)

  step(`version ${version}`)
  fs.rmSync(stagingRoot, { recursive: true, force: true })
  fs.mkdirSync(staging, { recursive: true })

  const items = [
    ['plugins/lawyer-sidebar', ['node_modules']],
    ['plugins/lawyer-tools', ['node_modules']],
    ['plugins/lawyer-wizard', ['node_modules']],
    ['profiles/lawyer', ['node_modules']],
    ['skills', ['__pycache__', 'node_modules']],
  ]
  for (const [rel, skip] of items) {
    const ok = copyDir(path.join(REPO_ROOT, rel), path.join(staging, rel), skip)
    if (!ok) die(`缺少 ${rel} —— 请在完整的 lawyer-dsh 仓库里运行本脚本`)
    console.log(`  + ${rel}`)
  }
  for (const rel of [
    'scripts/install-plugin.mjs',
    'scripts/install-legal-zh.mjs',
    'docs/macOS-插件版安装.md',
    'LICENSE',
    'NOTICE',
    'THIRD-PARTY-NOTICES.md',
  ]) {
    if (!copyFile(path.join(REPO_ROOT, rel), path.join(staging, rel))) die(`缺少 ${rel}`)
    console.log(`  + ${rel}`)
  }

  // 包内自带一份简短说明（主仓 README 面向 Windows 安装包版，容易混淆）。
  fs.writeFileSync(path.join(staging, 'README.md'), [
    `# 摸鱼工作站 · 跨平台插件包 v${version}`,
    '',
    '把律师工作台装进你自己的 dsh（Windows / macOS / Linux 通用）。',
    '',
    '## 三步',
    '',
    '```bash',
    '# 1) 前置：Node 22.19+/24+、pnpm 11.7.0、dsh 0.1.1-rc.2',
    '#    macOS：brew install node@24 \\',
    '#          && corepack enable \\',
    '#          && corepack prepare pnpm@11.7.0 --activate \\',
    '#          && npm i -g @deepseek-ai/dsh@0.1.1-rc.2',
    '',
    '# 2) 安装（中国法语料可选，加 --clone-legal-zh 可自动克隆）',
    'node scripts/install-plugin.mjs',
    '',
    '# 3) 启动（脚本结束会打印确切命令；--patch 必须在 --no-open 之前）',
    'dsh web --patch "$HOME/.dsh/lawyer-overlay.yml" --no-open',
    '```',
    '',
    '完整说明、真机验证清单与排障见 `docs/macOS-插件版安装.md`。',
    '卸载：`node scripts/install-plugin.mjs --uninstall`。',
    '',
    'Apache License 2.0。第三方组件声明见 THIRD-PARTY-NOTICES.md。',
  ].join('\n'), 'utf8')

  fs.mkdirSync(outDir, { recursive: true })
  step(`packing -> ${zipPath}`)
  pack(staging, zipPath)

  fs.rmSync(stagingRoot, { recursive: true, force: true })
  const sizeMB = (fs.statSync(zipPath).size / 1024 / 1024).toFixed(2)
  console.log(`[zip] written: ${zipPath} (${sizeMB} MB)`)
}

main()

#!/usr/bin/env node
/**
 * macOS 安装包产物自检：node .check-mac-pkg.mjs --arch arm64
 *
 * 校验 dmg 与 .app 结构、runtime 关键路径、随包 Node 可执行位、VERSION 一致性、
 * 插件产物无演示数据残留、中国法 adapter 数量与 Info.plist 字段。
 * 出包后必跑（对应 Windows 侧的 .check-pkg.mjs）。
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.dirname(HERE)
const APP_NAME = '摸鱼工作站'

const args = process.argv.slice(2)
function value(flag, fallback = undefined) {
  const i = args.indexOf(flag)
  return i >= 0 ? args[i + 1] : fallback
}
const ARCH = value('--arch', 'arm64')

let failed = 0
let checked = 0
function ok(msg) { checked++; console.log(`  ok   ${msg}`) }
function bad(msg) { checked++; failed++; console.error(`  FAIL ${msg}`) }
function expect(condition, msg) { condition ? ok(msg) : bad(msg) }

const distDir = path.join(HERE, 'dist')
const version = JSON.parse(fs.readFileSync(path.join(HERE, 'package.json'), 'utf8')).version
const sidebarVersion = JSON.parse(fs.readFileSync(path.join(REPO_ROOT, 'plugins', 'lawyer-sidebar', 'package.json'), 'utf8')).version

console.log(`[check-mac] version ${version}  arch ${ARCH}`)

// ── 1) dmg ──────────────────────────────────────────────────────────────────
const dmgName = `MoyuWorkbench-${version}-${ARCH}.dmg`
const dmgPath = path.join(distDir, dmgName)
if (fs.existsSync(dmgPath)) {
  const sizeMB = (fs.statSync(dmgPath).size / 1024 / 1024).toFixed(1)
  ok(`dmg 存在：${dmgName}（${sizeMB} MB）`)
} else {
  bad(`dmg 缺失：${dmgPath}`)
}

// ── 2) .app ─────────────────────────────────────────────────────────────────
const macDirs = fs.existsSync(distDir)
  ? fs.readdirSync(distDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('mac'))
    .map(entry => path.join(distDir, entry.name))
  : []
let appDir = null
for (const dir of macDirs) {
  const candidate = path.join(dir, `${APP_NAME}.app`)
  if (fs.existsSync(candidate)) { appDir = candidate; break }
}
if (appDir === null) {
  bad(`未找到 ${APP_NAME}.app（已查找：${macDirs.join(', ') || 'dist 下无 mac* 目录'}）`)
  console.error(`\n[check-mac] ${failed} 项失败（共 ${checked} 项）`)
  process.exit(1)
}
ok(`.app 存在：${path.relative(distDir, appDir)}`)

// ── 3) Info.plist ───────────────────────────────────────────────────────────
const plistPath = path.join(appDir, 'Contents', 'Info.plist')
if (fs.existsSync(plistPath)) {
  const plist = fs.readFileSync(plistPath, 'utf8')
  expect(plist.includes('com.lawyer.dsh.workbench'), 'Info.plist 的 CFBundleIdentifier 正确')
} else {
  bad('Info.plist 缺失')
}

// ── 4) runtime ──────────────────────────────────────────────────────────────
const runtimeDir = path.join(appDir, 'Contents', 'Resources', 'runtime')
const nodeBin = path.join(runtimeDir, 'node', 'bin', 'node')
const required = [
  ['随包 Node', nodeBin],
  ['dsh CLI', path.join(runtimeDir, 'dsh', 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js')],
  ['koffi 原生模块', path.join(runtimeDir, 'dsh', 'node_modules', 'koffi', 'index.js')],
  ['web profile', path.join(runtimeDir, 'profile-web', 'package.json')],
  ['lawyer preset', path.join(runtimeDir, 'agent-presets', 'lawyer', 'agent.cordis.yml')],
  ['律师技能', path.join(runtimeDir, 'skills')],
  ['工作台插件', path.join(runtimeDir, 'plugins', 'dsh-worktable', 'lib', 'client.js')],
  ['工作台数据', path.join(runtimeDir, 'worktable-data')],
  ['工作台清单', path.join(runtimeDir, 'worktable-projects.json')],
  ['中国法语料', path.join(runtimeDir, 'legal-zh', '.dsh', 'skills')],
  ['VERSION', path.join(runtimeDir, 'VERSION')],
]
for (const [label, target] of required) {
  expect(fs.existsSync(target), `${label} 就位`)
}
if (fs.existsSync(nodeBin)) {
  // 执行位丢失是 macOS 上最常见的打包事故（表现为启动时 dsh 起不来）
  const mode = fs.statSync(nodeBin).mode
  // eslint-disable-next-line no-bitwise
  expect((mode & 0o111) !== 0, '随包 Node 有可执行位')
}

// ── 5) VERSION 一致性 ───────────────────────────────────────────────────────
const versionFile = path.join(runtimeDir, 'VERSION')
if (fs.existsSync(versionFile)) {
  const deployed = fs.readFileSync(versionFile, 'utf8').trim()
  expect(deployed === sidebarVersion, `runtime/VERSION 与 lawyer-sidebar 一致（${deployed}）`)
  expect(deployed === version, `runtime/VERSION 与 packaging 版本一致（${deployed}）`)
}

// ── 6) 插件产物：无演示数据残留 ─────────────────────────────────────────────
const clientPath = path.join(runtimeDir, 'plugins', 'lawyer-sidebar', 'lib', 'client.js')
if (fs.existsSync(clientPath)) {
  const raw = fs.readFileSync(clientPath, 'utf8')
  // 中文是 \uXXXX，Latin-1 字符（如「·」）是 \xXX，两种都要反转义再查，否则误判
  const text = raw
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
  expect(!text.includes('载入演示数据'), 'client.js 无演示数据入口')
  expect(text.includes('合同审核'), 'client.js 含功能锚点（合同审核）')
}

// ── 7) 中国法 adapter ───────────────────────────────────────────────────────
const adaptersDir = path.join(runtimeDir, 'legal-zh', '.dsh', 'skills')
if (fs.existsSync(adaptersDir)) {
  const adapters = fs.readdirSync(adaptersDir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('chinese-legal-'))
    .length
  expect(adapters > 0, `中国法 adapter 数量：${adapters}`)
  if (adapters !== 18) console.warn(`  warn 期望 18 个 adapter，实际 ${adapters}`)
}

console.log('')
console.log(failed === 0
  ? `[check-mac] 全部通过（${checked} 项）`
  : `[check-mac] ${failed} 项失败（共 ${checked} 项）`)
process.exit(failed === 0 ? 0 : 1)

#!/usr/bin/env node
/**
 * 安装 claude-for-legal-ZH 的 DeepSeek Harness（dsh）适配层 —— 跨平台版。
 *
 * 仓库 https://github.com/CSlawyer1985/claude-for-legal-ZH 只提供 bash 版安装
 * 脚本（scripts/install-dsh.sh）。Windows 上的等价实现是
 * scripts/install-legal-zh.ps1（PowerShell 5.1），macOS / Linux 用不了，本脚本
 * 是它的 Node 等价物，严格对齐同一套三步语义：
 *
 *   1. <repo>/.dsh/skills/chinese-legal-*  →  <dshHome>/skills/
 *   2. 仓库绝对路径登记到 <dshHome>/legal-zh/repo
 *      （adapter 通过它解析领域 CLAUDE.md / skills/<name>/SKILL.md 的仓库相对路径）
 *   3. 向 <dshHome>/AGENTS.md 幂等写入 legal-zh 受管块
 *
 * 用法：
 *   node scripts/install-legal-zh.mjs
 *   node scripts/install-legal-zh.mjs --repo <语料仓库目录>
 *   node scripts/install-legal-zh.mjs --dsh-home <dsh 用户目录>
 *   node scripts/install-legal-zh.mjs --link        # 符号链接（git pull 即更新）
 *   node scripts/install-legal-zh.mjs --uninstall
 *
 * 说明：
 *   - 受管块内容与 scripts/install-legal-zh.ps1 逐字一致（同源于上游
 *     install-dsh.sh 的 heredoc）；**不要**改用 packaging/electron/main.js 里
 *     那份带 `$env:DSH_HOME` 兜底措辞的打包版变体。
 *   - 默认 Copy 模式（独立快照）。--link 建符号链接，失败自动回退为 Copy。
 *   - 全部文件按 UTF-8 无 BOM 写出（PS 5.1 的 Set-Encoding utf8 会带 BOM）。
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url))

const BLOCK_START = '<!-- legal-zh:start -->'
const BLOCK_END = '<!-- legal-zh:end -->'

/** 受管块：与 scripts/install-legal-zh.ps1 的 $ManagedLines 逐字一致。 */
const MANAGED_BLOCK = [
  '',
  BLOCK_START,
  '## 中国法律工作守则（claude-for-legal-zh）',
  '',
  '任务涉及中国法律实务时：',
  '',
  '- 优先调用匹配的 `chinese-legal-*` skill，路由到对应领域的工作流（领域 CLAUDE.md + skills/*/SKILL.md）。',
  '- 领域文件的仓库相对路径以 `~/.dsh/legal-zh/repo` 中登记的仓库根目录为基准解析。',
  '- 所有法律输出均为律师审查草稿，不替代律师专业判断。',
  '- 法条、案例、期限、监管动态等时效性内容，未经可靠来源核验前一律标注“需验证”。',
  '- 保留原工作流的升级、审批、保密与来源标注要求。',
  BLOCK_END,
  '',
].join('\n')

const USAGE = `用法：node scripts/install-legal-zh.mjs [选项]

选项：
  --repo <dir>         claude-for-legal-ZH 仓库根目录（默认：与本仓并排的
                       claude-for-legal-ZH 目录）
  --dsh-home <dir>     dsh 用户目录（默认：$DSH_HOME，其次 ~/.dsh）
  --link               用符号链接而不是复制（git pull 即更新，失败自动回退）
  --uninstall          卸载：移除 chinese-legal-*、repo 登记文件与 AGENTS.md 受管块
  -h, --help           显示本帮助`

function parseArgs(argv) {
  const opts = { repo: '', dshHome: '', link: false, uninstall: false, help: false }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    switch (arg) {
      case '--repo': opts.repo = argv[++i] ?? ''; break
      case '--dsh-home': opts.dshHome = argv[++i] ?? ''; break
      case '--link': opts.link = true; break
      case '--uninstall': opts.uninstall = true; break
      case '-h': case '--help': opts.help = true; break
      default:
        throw new Error(`未知参数：${arg}\n\n${USAGE}`)
    }
  }
  return opts
}

function step(msg) { console.log(`[legal-zh] ${msg}`) }
function warn(msg) { console.warn(`[legal-zh] ${msg}`) }
function die(msg) { console.error(`[legal-zh] ${msg}`); process.exit(1) }

/** 去掉文本里已有的 legal-zh 受管块（含起止标记行），用于幂等重写。 */
function stripManagedBlock(text) {
  const kept = []
  let skipping = false
  for (const line of text.split(/\r?\n/)) {
    if (line.includes(BLOCK_START)) { skipping = true; continue }
    if (skipping) {
      if (line.includes(BLOCK_END)) skipping = false
      continue
    }
    kept.push(line)
  }
  return kept.join('\n')
}

/** 列出目录下所有 chinese-legal-* 子目录名（排序，保证输出稳定）。 */
function listAdapterNames(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && entry.name.startsWith('chinese-legal-'))
    .map(entry => entry.name)
    .sort()
}

function removeDir(target) {
  fs.rmSync(target, { recursive: true, force: true })
}

function uninstall(dshHome) {
  const skillsDir = path.join(dshHome, 'skills')
  let removed = 0
  for (const name of listAdapterNames(skillsDir)) {
    removeDir(path.join(skillsDir, name))
    console.log(`  已移除：${path.join(skillsDir, name)}`)
    removed++
  }
  const repoFile = path.join(dshHome, 'legal-zh', 'repo')
  if (fs.existsSync(repoFile)) {
    fs.rmSync(repoFile, { force: true })
    console.log(`  已移除：${repoFile}`)
  }
  const agentsFile = path.join(dshHome, 'AGENTS.md')
  if (fs.existsSync(agentsFile)) {
    const next = stripManagedBlock(fs.readFileSync(agentsFile, 'utf8').replace(/^﻿/, ''))
    fs.writeFileSync(agentsFile, next, 'utf8')
    console.log(`  已清理受管块：${agentsFile}`)
  }
  console.log(`claude-for-legal-ZH 适配层已卸载（移除 ${removed} 个 adapter）。`)
}

function install(opts) {
  const dshHome = path.resolve(opts.dshHome)
  // 未显式指定时按「本脚本所在目录的上两级」定位并排的语料仓库：
  // <parent>/lawyer-dsh/scripts/.. -> <parent> ，再取 <parent>/claude-for-legal-ZH
  const repoDir = path.resolve(opts.repo || path.join(path.dirname(path.dirname(SCRIPT_DIR)), 'claude-for-legal-ZH'))

  const sourceDir = path.join(repoDir, '.dsh', 'skills')
  if (!fs.existsSync(sourceDir)) {
    die(`未找到 dsh skills 目录：${sourceDir}\n请先克隆语料仓库：git clone https://github.com/CSlawyer1985/claude-for-legal-ZH.git "${repoDir}"`)
  }
  const adapters = listAdapterNames(sourceDir)
  if (adapters.length === 0) {
    die(`在 ${sourceDir} 下未找到 chinese-legal-* 技能目录。`)
  }

  const targetDir = path.join(dshHome, 'skills')
  const stateDir = path.join(dshHome, 'legal-zh')
  fs.mkdirSync(targetDir, { recursive: true })
  fs.mkdirSync(stateDir, { recursive: true })

  let linkMode = opts.link
  let linked = 0
  let copied = 0
  for (const name of adapters) {
    const dest = path.join(targetDir, name)
    removeDir(dest)
    if (linkMode) {
      try {
        // Windows 下目录链接用 junction（无需管理员权限），POSIX 用 dir。
        fs.symlinkSync(path.join(sourceDir, name), dest, process.platform === 'win32' ? 'junction' : 'dir')
        linked++
        continue
      } catch (error) {
        warn(`符号链接创建失败（${name}），回退为复制：${error.message}`)
        linkMode = false
      }
    }
    fs.cpSync(path.join(sourceDir, name), dest, { recursive: true })
    copied++
  }

  // 登记仓库根目录：adapter 用它解析领域文件的仓库相对路径。纯文本，无密钥。
  const repoFile = path.join(stateDir, 'repo')
  fs.writeFileSync(repoFile, `${repoDir}\n`, 'utf8')
  console.log(`  已登记仓库路径：${repoFile} -> ${repoDir}`)

  // 幂等写入全局指令受管块（先剥旧块，再追加）。
  const agentsFile = path.join(dshHome, 'AGENTS.md')
  if (!fs.existsSync(agentsFile)) fs.writeFileSync(agentsFile, '', 'utf8')
  const previous = stripManagedBlock(fs.readFileSync(agentsFile, 'utf8').replace(/^﻿/, ''))
  fs.writeFileSync(agentsFile, previous + MANAGED_BLOCK, 'utf8')
  console.log(`  已更新全局指令：${agentsFile}（legal-zh 受管块）`)

  console.log('')
  console.log(`DeepSeek Harness 适配技能已安装到：${targetDir}`)
  console.log(`  链接 ${linked} 个 / 复制 ${copied} 个（共 ${adapters.length} 个）`)
  for (const name of adapters) console.log(`  - ${name}`)
  console.log('')
  console.log('请重启 dsh 会话（或重新打开 dsh web 页面），让新的 skills 进入索引。')
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
  if (!opts.dshHome) {
    opts.dshHome = (process.env.DSH_HOME ?? '').trim() || path.join(os.homedir(), '.dsh')
  }
  step(`DSH_HOME: ${path.resolve(opts.dshHome)}`)
  if (opts.uninstall) uninstall(path.resolve(opts.dshHome))
  else install(opts)
}

main()

#!/usr/bin/env node
// 打包前完整性校验：扫描一个 node_modules 树，任何"存在但没有 package.json"的包
// 目录都视为残缺（npm 安装中断的典型产物——例：@mixmark-io/domino 只剩 test/ 子目录，
// 导致运行期 Cannot find module）。prepare-runtime.ps1 在安装/复用 dsh 依赖树前调用。
//
// 用法：node verify-node-modules.cjs <node_modules-dir>
// 输出：残缺包清单打 stdout（一行一个，带 broken: 前缀）——刻意不写 stderr，
//       避开 PowerShell 5.1 + $ErrorActionPreference=Stop 下原生 stderr 触发
//       NativeCommandError 中断脚本的老坑。
// 退出码：0 = 完整；1 = 存在残缺包。
'use strict'

const fs = require('node:fs')
const path = require('node:path')

const root = process.argv[2]
if (root === undefined || !fs.existsSync(root)) {
  process.stdout.write(`verify-node-modules: directory not found: ${root ?? '(missing)'}\n`)
  process.exit(1)
}

const broken = []

/** 只在 node_modules 层级识别包：作用域目录的下级、普通目录、包内嵌套 node_modules。 */
function walkNodeModules(nmDir) {
  let entries
  try {
    entries = fs.readdirSync(nmDir, { withFileTypes: true })
  } catch {
    return
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === '.bin' || entry.name.startsWith('.')) continue
    const dir = path.join(nmDir, entry.name)
    if (entry.name.startsWith('@')) {
      let scoped
      try {
        scoped = fs.readdirSync(dir, { withFileTypes: true })
      } catch {
        broken.push(path.relative(root, dir) + path.sep)
        continue
      }
      for (const sub of scoped) {
        if (!sub.isDirectory() || sub.name.startsWith('.')) continue
        checkPackage(path.join(dir, sub.name))
      }
    } else {
      checkPackage(dir)
    }
  }
}

function checkPackage(pkgDir) {
  if (!fs.existsSync(path.join(pkgDir, 'package.json'))) {
    broken.push(path.relative(root, pkgDir))
  }
  const nested = path.join(pkgDir, 'node_modules')
  if (fs.existsSync(nested)) walkNodeModules(nested)
}

walkNodeModules(root)

if (broken.length > 0) {
  for (const b of broken) process.stdout.write(`broken: ${b}\n`)
  process.stdout.write(`verify-node-modules: ${broken.length} broken package(s) under ${root}\n`)
  process.exit(1)
}
process.exit(0)

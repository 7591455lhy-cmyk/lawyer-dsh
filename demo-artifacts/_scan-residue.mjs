// 扫描六套 artifact.md 的绝对路径残留与占位律所分布
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.dirname(fileURLToPath(import.meta.url))
const registry = JSON.parse(fs.readFileSync(path.join(root, 'registry.json'), 'utf8'))
for (const [index, item] of registry.entries()) {
  const md = fs.readFileSync(path.join(root, item.ws, 'artifact.md'), 'utf8')
  const wsPath = path.join(root, item.ws)
  const absHits = []
  for (const sep of ['\\', '/']) {
    const probe = wsPath.split(path.sep).join(sep)
    const re = new RegExp(probe.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '[\\\\/][^\\s`"\'）。，；]', 'gi')
    for (const m of md.matchAll(re)) absHits.push(m[0].slice(0, 90))
  }
  const placeholders = (md.match(/\{\{file:[^}]+\}\}/gu) ?? []).length
  const firmYunfan = (md.match(/云帆律师事务所-张律师/g) ?? []).length
  const firmXX = (md.match(/XX 律师事务所-[王李]律师/g) ?? []).length
  const diskPaths = (md.match(/[A-Za-z]:[\\/][^\s`'"）。，；]{6,}/gu) ?? []).filter(p => !p.includes('demo-artifacts'))
  console.log(`[${index}] ${item.key}`)
  console.log(`  ws-absolute-path residue: ${absHits.length} ${absHits.length > 0 ? JSON.stringify(absHits.slice(0, 3)) : ''}`)
  console.log(`  {{file:}} placeholders: ${placeholders}`)
  console.log(`  云帆署名: ${firmYunfan}, XX律所署名: ${firmXX}`)
  console.log(`  other disk paths: ${diskPaths.length} ${diskPaths.length > 0 ? JSON.stringify(diskPaths.slice(0, 3)) : ''}`)
}

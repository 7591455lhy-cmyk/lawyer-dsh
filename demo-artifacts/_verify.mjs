import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = path.dirname(fileURLToPath(import.meta.url))
const registry = JSON.parse(fs.readFileSync(path.join(root, 'registry.json'), 'utf8'))
// 署名分布自检：演示数据在两家虚构律所之间平均分布（公开仓库不含真实所名）。
let totalGd = 0, totalSh = 0
for (const [index, item] of registry.entries()) {
  const md = fs.readFileSync(path.join(root, item.ws, 'artifact.md'), 'utf8')
  const gd = (md.match(/甲律师事务所/g) ?? []).length
  const sh = (md.match(/乙律师事务所/g) ?? []).length
  const xx = (md.match(/XX\s?律师事务所|云帆律师事务所/g) ?? []).length
  const firmNameRow = (md.match(/\| 律师事务所名称 \|/g) ?? []).length
  const abs = (md.match(/[A-Za-z]:[\\/]codes[\\/]/gi) ?? []).length
  console.log(`[${index}] ${item.key}: 甲=${gd} 乙=${sh} 占位残留=${xx} 待填律所行=${firmNameRow} 绝对路径残留=${abs}`)
  totalGd += gd; totalSh += sh
}
console.log(`TOTAL: 甲=${totalGd} 乙=${totalSh}`)

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
const root = path.dirname(fileURLToPath(import.meta.url))
const registry = JSON.parse(fs.readFileSync(path.join(root, 'registry.json'), 'utf8'))
for (const [index, item] of registry.entries()) {
  const md = fs.readFileSync(path.join(root, item.ws, 'artifact.md'), 'utf8')
  const lines = md.split('\n').filter(l => /律师|律师事务所|代理|特别授权|落款/.test(l))
  console.log(`[${index}] ${item.key}`)
  for (const l of lines.slice(0, 6)) console.log('   ' + l.trim().slice(0, 90))
}

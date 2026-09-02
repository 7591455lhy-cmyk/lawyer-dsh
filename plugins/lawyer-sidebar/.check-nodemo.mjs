/**
 * 无演示数据构建的自检（build.ps1 -NoDemo 之后跑）：
 *   node .check-nodemo.mjs
 *
 * esbuild 默认 charset=ascii，bundle 里中文是 \uXXXX 转义——必须先反转义
 * 再查，否则会误判（历史踩坑：以为演示数据已清干净，其实只是搜不到）。
 */
import { readFileSync } from 'node:fs'

const raw = readFileSync('lib/client.js', 'utf8')
const s = raw.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))

const mustBeAbsent = [
  '载入演示数据',
  '演示回放',
  '演示数据',
  '软件开发委托合同',
  '建材买卖合同货款纠纷',
  '民间借贷',
  'UEsDB',
  'demoArtifacts.data',
  'src/client/demoData.ts',
  '摸鱼工作站-演示',
]
const mustBePresent = [
  '摸鱼工作站-工作区',
  'dsh.defaultWorkspaceDir',
  'lawyer-deepseek-key-guide',
  'lawyerSecrets/',
  'platform.deepseek.com/api_keys',
  'open.chineselaw.com',
]

let bad = 0
for (const k of mustBeAbsent) {
  const hit = s.includes(k)
  if (hit) bad++
  console.log('  absent?', k.padEnd(26), hit ? 'STILL PRESENT' : 'ok')
}
for (const k of mustBePresent) {
  const hit = s.includes(k)
  if (!hit) bad++
  console.log('  present?', k.padEnd(25), hit ? 'ok' : 'MISSING')
}
console.log('size', (raw.length / 1024).toFixed(1) + 'kb')
console.log(bad === 0 ? 'ALL OK' : `${bad} PROBLEM(S)`)
process.exit(bad === 0 ? 0 : 1)

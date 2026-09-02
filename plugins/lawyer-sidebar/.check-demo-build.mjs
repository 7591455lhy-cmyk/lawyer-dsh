/**
 * 带演示数据构建的自检（build.ps1 不带 -NoDemo 之后跑）：
 *   node .check-demo-build.mjs
 *
 * 与 .check-nodemo.mjs 成对：确认开关没有把演示链路弄坏（载入按钮、回放
 * 指令、预录 docx base64 都还在），也没有留下悬空引用。
 */
import { readFileSync } from 'node:fs'

const raw = readFileSync('lib/client.js', 'utf8')
const s = raw.replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))

const mustBePresent = [
  '载入演示数据',
  '演示回放',
  '软件开发委托合同',
  '建材买卖合同货款纠纷',
  'UEsDB',
  'lawyer-dialog__demo-btn',
]
let bad = 0
for (const k of mustBePresent) {
  const hit = s.includes(k)
  if (!hit) bad++
  console.log('  present?', k.padEnd(24), hit ? 'ok' : 'MISSING')
}
// 悬空引用检查：每个被引用的符号都应有自己的声明
for (const [ref, decl] of [
  ['DEMO_ARTIFACTS[', 'var DEMO_ARTIFACTS'],
  ['CONTRACT_REVIEW_DEMO.', 'CONTRACT_REVIEW_DEMO ='],
  ['CASE_ANALYSIS_DEMO.', 'CASE_ANALYSIS_DEMO ='],
  ['DOC_GENERATION_DEMOS[', 'DOC_GENERATION_DEMOS ='],
  ['buildDemoReplayPrompt(', 'function buildDemoReplayPrompt'],
]) {
  const used = s.includes(ref)
  const declared = s.includes(decl)
  const ok = !used || declared
  if (!ok) bad++
  console.log('  bound?  ', ref.padEnd(24), used ? (declared ? 'ok' : 'DANGLING') : 'unused')
}
console.log('size', (raw.length / 1024).toFixed(1) + 'kb')
console.log(bad === 0 ? 'ALL OK' : `${bad} PROBLEM(S)`)
process.exit(bad === 0 ? 0 : 1)

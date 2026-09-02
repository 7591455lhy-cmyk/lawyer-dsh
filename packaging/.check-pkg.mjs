/**
 * 安装包产物自检（npm run dist 之后跑）：node .check-pkg.mjs
 * 校验：exe 与打包 client.js 存在；无演示数据残留；M8.6 引导 + portal 修复在。
 * esbuild 默认 charset=ascii，中文是 \uXXXX 转义，须先反转义再查。
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const exe = join('dist', '摸鱼工作站-Setup-0.80.exe')
let bad = 0
if (existsSync(exe)) console.log('exe:', exe, (statSync(exe).size / 1024 / 1024).toFixed(1) + 'MB')
else { bad++; console.log('exe MISSING') }

const base = join('dist', 'win-unpacked/resources/runtime')
const packed = join(base, 'plugins/lawyer-sidebar/lib/client.js')
if (!existsSync(packed)) { bad++; console.log('packed client.js MISSING'); process.exit(bad) }
const raw = readFileSync(packed, 'utf8')
// 两种转义都要反转义：中文是 \uXXXX，而 «·» 这类 Latin-1 字符是 \xXX
// （只处理前者会漏掉「实务画像 · 完整问卷」这类含间隔号的串）。
const un = (x) => x
  .replace(/\\u([0-9a-fA-F]{4})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
  .replace(/\\x([0-9a-fA-F]{2})/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
const s = un(raw)
console.log('packed client.js:', (statSync(packed).size / 1024).toFixed(1) + 'kb')

for (const k of ['UEsDB', '载入演示数据', '演示回放', '软件开发委托合同', '建材买卖合同货款纠纷', '摸鱼工作站-演示']) {
  const hit = s.includes(k)
  if (hit) bad++
  console.log('  absent?', k.padEnd(18), hit ? 'STILL PRESENT' : 'ok')
}
for (const k of ['摸鱼工作站-工作区', 'dsh.defaultWorkspaceDir', 'lawyer-deepseek-key-guide', 'lawyerSecrets/', 'platform.deepseek.com/api_keys', 'open.chineselaw.com']) {
  const hit = s.includes(k)
  if (!hit) bad++
  console.log('  present?', k.padEnd(17), hit ? 'ok' : 'MISSING')
}
// portal 修复（M8.7 首启卡死修复）：弹窗必须 createPortal 到 body
console.log('  portal? createPortal', s.includes('createPortal') ? 'ok' : 'MISSING')
console.log('  portal? require react-dom', /require\(["']react-dom["']\)/.test(raw) ? 'ok' : 'MISSING')
// 按钮文字颜色修复（黑底白字）：主按钮文字必须用 label-primary-foreground
const colorFixed = s.includes('color: var(--dsw-alias-label-primary-foreground')
const colorBad = s.includes('brand-primary-invert, #fff')
if (colorFixed && !colorBad) console.log('  color? label-primary-foreground ok')
else { bad++; console.log('  color? label-primary-foreground', colorFixed ? 'ok' : 'MISSING', '| 旧写法残留:', colorBad) }

// ── 功能在位检查（按里程碑：M6 品牌 / M7 三层规程 / M8 画像 / M8.6 引导 /
//    M8.8 完整问卷四套分叉）——每次出包都该全绿，缺一项即功能被打包漏掉。
// 注意手势串是运行时拼的（`/` + adapter 名），只能查 adapter 名本身。
for (const k of ['合同审核', '案件分析', '文书生成', '自定义功能',
  'chinese-legal-commercial', 'chinese-legal-litigation',
  'mcp__law__', 'mcp__case__', 'cold-start-interview',
  'lawyerProfile/', 'lawyerSecrets/', 'lawyerFiles/save',
  '实务画像', '完整问卷', '执业身份', '销售方合同手册', '采购方合同手册',
  '企业法务', '公司法务', '其它已填项', '[PLACEHOLDER]']) {
  const hit = s.includes(k)
  if (!hit) bad++
  console.log('  feature?', k.padEnd(24), hit ? 'ok' : 'MISSING')
}

const toolsPacked = join(base, 'plugins/lawyer-tools/lib/index.js')
if (existsSync(toolsPacked)) {
  const t = readFileSync(toolsPacked, 'utf8')
  const ok = ['registerProvider', 'lawyerFiles', 'lawyerProfile', 'lawyerSecrets'].every(k => t.includes(k))
  if (!ok) bad++
  console.log('  feature? lawyer-tools 服务', ok ? 'ok' : 'MISSING')
} else { bad++; console.log('  feature? lawyer-tools MISSING') }

// ── 版本一致性：runtime/VERSION 与三个插件包版本必须同源（都是
//    lawyer-sidebar/package.json 的 version）——安装到用户机器时，VERSION
//    是「要不要重新部署 profile/preset」的唯一判据。
const runtimeVersion = readFileSync(join(base, 'VERSION'), 'utf8').trim()
const pluginVersions = ['lawyer-sidebar', 'lawyer-tools', 'lawyer-wizard']
  .map(p => JSON.parse(readFileSync(join(base, `plugins/${p}/package.json`), 'utf8')).version)
const versionOk = runtimeVersion === '0.80.0' && pluginVersions.every(v => v === '0.80.0')
if (!versionOk) bad++
console.log(`  version? runtime=${runtimeVersion} plugins=${pluginVersions.join('/')}`, versionOk ? 'ok' : 'MISMATCH')

const adapters = readdirSync(join(base, 'legal-zh/.dsh/skills')).filter(d => d.startsWith('chinese-legal-')).length
if (adapters !== 18) bad++
console.log('  legal-zh adapters', adapters, adapters === 18 ? 'ok' : 'MISMATCH')

const wizardPacked = join(base, 'plugins/lawyer-wizard/lib/client.js')
if (existsSync(wizardPacked)) {
  const w = readFileSync(wizardPacked, 'utf8')
  if (w.includes('color: var(--dsw-alias-label-primary-foreground') && !w.includes('brand-primary-invert, #fff')) {
    console.log('  color? wizard label-primary-foreground ok')
  } else { bad++; console.log('  color? wizard label-primary-foreground PROBLEM') }
} else { bad++; console.log('  color? wizard client.js MISSING') }

console.log(bad === 0 ? 'ALL OK' : `${bad} PROBLEM(S)`)
process.exit(bad === 0 ? 0 : 1)

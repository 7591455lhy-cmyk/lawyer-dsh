// 演示成果收集：从 headless run.log 提取 AI 最终输出 → artifact.md（绝对
// 路径替换为 {{file:...}} 占位符；残余工作区路径剥为纯文件名——跨机器
// 自适应，回放部署到任何工作区都不会出现旧机器路径），并把成果文件
// base64 供 demoArtifacts.ts 固化；占位律所署名按 registry 序号替换为
// 真实律所名（平均分布）。
// 用法：node _collect.js <registry序号>（命令行传中文 ws 名会被 GBK 弄乱，
// 成果文件清单经 manifest.json（UTF-8）传递）。
const fs = require('node:fs')
const path = require('node:path')

const root = __dirname
const registry = JSON.parse(fs.readFileSync(path.join(root, 'registry.json'), 'utf8'))
const registryIndex = Number(process.argv[2])
const entry = registry[registryIndex]
if (entry === undefined) {
  console.error('usage: node _collect.js <registry-index>')
  process.exit(2)
}
const wsName = entry.ws
const ws = path.join(root, wsName)
const manifest = JSON.parse(fs.readFileSync(path.join(ws, 'manifest.json'), 'utf8'))
const fileNames = manifest.files

// 1) AI 文本：run.log 去掉 [runner] 行（headless 把最终答复打到 stdout）。
const raw = fs.readFileSync(path.join(ws, 'run.log'), 'utf8')
const aiText = raw.split('\n').filter(line => !line.startsWith('[runner]')).join('\n').trim()
if (aiText.length < 200) {
  console.error(`AI text too short (${aiText.length}B) — run may have failed`)
  process.exit(1)
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// 2) 署名归一：占位律所 → 演示署名律所（按套平均分布；-李律师 统一署名）。
//    两家都是**虚构**所名（甲 / 乙）：演示数据会随源码公开，不能出现真实
//    律所名。分布：[0] 合同审核 / [4] 代理词 → 甲；[2] 民事起诉状 /
//    [5] 法律意见书 → 乙；[1]/[3] 成果无署名落款，自然不替换。
const FIRM_BY_INDEX = {
  0: '甲律师事务所',
  2: '乙律师事务所',
  4: '甲律师事务所',
  5: '乙律师事务所',
}
let markdown = aiText
const firm = FIRM_BY_INDEX[registryIndex]
if (firm !== undefined) {
  const before = markdown
  markdown = markdown
    .replaceAll('云帆律师事务所-张律师', `${firm}-李律师`)
    .replaceAll('XX律师事务所【待填：律师事务所全称】', firm)
    .replaceAll('XX 律师事务所', firm)
    .replaceAll('XX律师事务所', firm)
    .replaceAll('委托代理人：王律师', '委托代理人：李律师')
    .replaceAll('（现以"XX律师事务所"代称）', `：${firm}（已按委托信息填写）`)
    .replaceAll('| 律师事务所名称 |', `| ${firm} |`)
    .replaceAll('| 经办律师姓名 |', '| 李律师 |')
  const firmHits = (before.match(/云帆律师事务所|XX\s?律师事务所/g) ?? []).length
  console.log(`firm normalization: ${firmHits} hit(s) -> ${firm}`)
}

// 3) 交付文件路径 → {{file:}} 占位符（正反斜杠两形态；盘符大小写不敏感）。
for (const name of fileNames) {
  for (const sep of [path.sep, '/']) {
    const abs = path.join(ws, name).split(path.sep).join(sep)
    markdown = markdown.replace(new RegExp(escapeRe(abs), 'gi'), `{{file:${name}}}`)
  }
}

// 4) 残余工作区绝对路径 → 剥目录留文件名（中间产物如 doc.json/基础 docx；
//    若恰为交付文件则升级为占位符）。自适应：任何机器上回放都不残留
//    demo-artifacts 的源机路径。
for (const sep of [path.sep, '/']) {
  const prefix = ws.split(path.sep).join(sep)
  const residue = new RegExp(escapeRe(prefix) + '[\\\\/][^\\s`"\'）。，；】』»]+', 'gi')
  markdown = markdown.replace(residue, matched => {
    const base = matched.split(/[\\/]/).pop()
    return fileNames.includes(base) ? `{{file:${base}}}` : base
  })
}

fs.writeFileSync(path.join(ws, 'artifact.md'), markdown, 'utf8')
console.log(`artifact.md: ${Buffer.byteLength(markdown)}B (ai text ${Buffer.byteLength(aiText)}B)`)
console.log('placeholder count:', (markdown.match(/\{\{file:[^}]+\}\}/g) ?? []).length)
const residueLeft = markdown.match(new RegExp(escapeRe(ws.split(path.sep).join(path.sep)), 'gi')) ?? []
console.log('workspace-path residue:', residueLeft.length)

// 5) 成果文件 base64（过长内容写文件而非 stdout）。
const b64 = {}
for (const name of fileNames) {
  const p = path.join(ws, name)
  if (!fs.existsSync(p)) { console.error(`MISSING artifact file: ${name}`); process.exit(1) }
  b64[name] = fs.readFileSync(p).toString('base64')
}
fs.writeFileSync(path.join(ws, 'files.b64.json'), JSON.stringify(b64), 'utf8')
for (const name of fileNames) console.log(`${name}: ${Buffer.from(b64[name], 'base64').length}B raw`)

// 生成 lawyer-sidebar/src/client/demoArtifacts.data.ts（自动产物，勿手改）：
// registry.json 各条目读取 workspace 的 artifact.md + files.b64.json，固化成
// DemoArtifact 常量。幂等：全量重建（跳过尚未完成的 workspace，生成占位注释）。
const fs = require('node:fs')
const path = require('node:path')

const root = __dirname
const registry = JSON.parse(fs.readFileSync(path.join(root, 'registry.json'), 'utf8'))
const out = []
const mapEntries = []
let pending = 0

registry.forEach((item, index) => {
  const ws = path.join(root, item.ws)
  const mdPath = path.join(ws, 'artifact.md')
  const b64Path = path.join(ws, 'files.b64.json')
  if (!fs.existsSync(mdPath)) {
    pending++
    mapEntries.push(`  // '${item.key}': 待 headless 运行完成后由 _collect.js + 本脚本固化`)
    return
  }
  const markdown = fs.readFileSync(mdPath, 'utf8').trimEnd()
  const b64 = JSON.parse(fs.readFileSync(b64Path, 'utf8'))
  const manifest = JSON.parse(fs.readFileSync(path.join(ws, 'manifest.json'), 'utf8'))
  const files = manifest.files.map(name => {
    if (b64[name] === undefined) throw new Error(`${item.key}: files.b64.json 缺 ${name}`)
    return [
      '    {',
      `      fileName: ${JSON.stringify(name)},`,
      `      contentBase64: ${JSON.stringify(b64[name])},`,
      '    },',
    ].join('\n')
  }).join('\n')
  // 常量名用序号（中文 key 无法直接做标识符）。
  const constName = `ARTIFACT_${index}`
  out.push([
    `/** ${item.title}（真实 API 运行固化：${item.ws}/）。 */`,
    `const ${constName}: DemoArtifact = {`,
    `  title: ${JSON.stringify(item.title)},`,
    `  markdown: ${JSON.stringify(markdown)},`,
    '  files: [',
    files,
    '  ],',
    '}',
    '',
  ].join('\n'))
  mapEntries.push(`  '${item.key}': ${constName},`)
})

const header = [
  '/**',
  ' * 演示回放预录成果数据（M6.3）——由 demo-artifacts/_gen-artifact-ts.js 从',
  ' * 真实 API 运行产物自动生成，请勿手改；重跑演示后执行 _collect.js + 本脚本重建。',
  ' */',
  "import type { DemoArtifact } from './demoArtifacts.ts'",
  '',
].join('\n')

const map = [
  '/** 演示键 → 预录成果（键定义见 demoArtifacts.ts 的 DemoArtifactKey）。 */',
  'export const GENERATED_DEMO_ARTIFACTS: Readonly<Record<string, DemoArtifact>> = {',
  ...mapEntries,
  '}',
  '',
].join('\n')

// __dirname = <仓库根>/demo-artifacts → 上一级即仓库根。
const target = path.resolve(__dirname, '..', 'plugins', 'lawyer-sidebar', 'src', 'client', 'demoArtifacts.data.ts')
fs.writeFileSync(target, header + out.join('') + map, 'utf8')
const totalKB = Math.round(fs.statSync(target).size / 1024)
console.log(`written ${target} (${totalKB}KB; ${registry.length - pending}/${registry.length} entries, ${pending} pending)`)

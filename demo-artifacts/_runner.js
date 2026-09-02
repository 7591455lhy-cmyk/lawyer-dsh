// headless 演示运行包装：以 spawn 数组参数完整传递 prompt（保换行），
// stdio 直通（PowerShell Start-Process 引号转义不可靠，弃用）。
const { spawn } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const demoName = process.argv[2]
if (!demoName) {
  console.error('usage: node _runner.js <workspace-dir-name>')
  process.exit(2)
}
const root = __dirname
const bin = path.resolve(__dirname, '..', '..', 'deepseek-harness', 'apps', 'cli', 'lib', 'bin.js')
const ws = path.join(root, demoName)
const prompt = fs.readFileSync(path.join(ws, 'prompt.txt'), 'utf8')
console.log(`[runner] starting ${demoName}, prompt ${Buffer.byteLength(prompt)}B`)

const child = spawn(process.execPath, [
  bin,
  '--profile', 'headless',
  '--patch', path.join(root, 'headless-lawyer.yml'),
  prompt,
], { cwd: ws, stdio: 'inherit' })

child.on('error', error => { console.error(`[runner] spawn failed: ${error.message}`); process.exit(1) })
child.on('exit', code => { console.log(`[runner] exited with ${code}`); process.exit(code ?? 0) })

// lawyerFiles 上传服务冒烟测试（临时文件，验证后删除）：
// mock ctx 跑 apply，从注册面取回 receiver 与 descriptor，直接调用 save
// 验证：正常写入（base64 往返）、文件名清洗、路径穿越拒绝、参数校验。
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { apply } from './.smoke-lawyer-files.mjs'

let failed = false
const fail = (message) => { console.error('FAIL:', message); failed = true }

// --- mock ctx：捕获 reflect.provide 与 typert.register ---
let receiver
let contribution
const ctx = {
  logger: { warn: () => {} },
  skills: { registerProvider: () => {} },
  reflect: { provide: (key, instance) => { if (key === 'lawyerFiles') receiver = instance } },
  typert: { register: (value) => { contribution = value } },
}
apply(ctx, { skillsDir: 'd:/codes/lawyer-dsh/skills' })

if (receiver === undefined) fail('lawyerFiles 服务未注册（reflect.provide 未被调用）')
if (contribution === undefined) fail('typert 贡献未注册')

// descriptor 形状
const d = contribution?.invocations?.[0]
if (d?.namespace !== 'lawyerFiles' || d?.method !== 'save' || d?.result?.mode !== 'src-json') {
  fail(`invocation descriptor 形状异常：${JSON.stringify(d)}`)
} else {
  console.log('descriptor OK:', d.id, d.parameters.map(p => `${p.name}:${p.source}`).join(','))
}
// binding 形状（网关 validateBinding 只做形状检查）
const binding = receiver?.typertRemote
if (binding?.service !== receiver || binding?.serviceKey !== 'lawyerFiles' || binding?.namespace !== 'lawyerFiles') {
  fail('typertRemote binding 形状异常')
} else {
  console.log('binding OK')
}

const cwd = await mkdtemp(join(tmpdir(), 'lawyer-smoke-'))
try {
  // 1) 正常写入：base64 往返
  const content = '合同内容测试 contract-content-中文'
  const base64 = Buffer.from(content, 'utf8').toString('base64')
  const result = await receiver.save(cwd, '采购合同.docx', base64)
  const expectedDir = join(cwd, '.lawyer-uploads')
  if (result.path !== join(expectedDir, '采购合同.docx')) fail(`路径异常：${result.path}`)
  const written = await readFile(result.path, 'utf8')
  if (written !== content) fail('内容往返不一致')
  console.log('save OK:', result.path, `(${written.length} chars)`)

  // 2) 路径穿越清洗
  const evil = await receiver.save(cwd, '..\\..\\evil<>.txt', base64)
  if (evil.path.includes('..')) fail(`路径穿越未清洗：${evil.path}`)
  if (evil.path !== join(expectedDir, 'evil__.txt')) fail(`清洗结果异常：${evil.path}`)
  console.log('sanitize OK:', evil.path)

  // 3) 参数校验
  for (const [label, args] of [
    ['相对 cwd', ['relative/path', 'a.docx', base64]],
    ['空文件名', [cwd, '', base64]],
    ['空内容', [cwd, 'a.docx', '']],
    ['非字符串', [cwd, 123, base64]],
  ]) {
    try {
      await receiver.save(...args)
      fail(`${label} 未被拒绝`)
    } catch {
      console.log(`reject OK: ${label}`)
    }
  }

  // 4) 覆盖写入（同名再传）
  const again = await receiver.save(cwd, '采购合同.docx', Buffer.from('v2', 'utf8').toString('base64'))
  const rewritten = await readFile(again.path, 'utf8')
  if (rewritten !== 'v2') fail('覆盖写入失败')
  console.log('overwrite OK')
} finally {
  await rm(cwd, { recursive: true, force: true })
}

console.log(failed ? 'SMOKE FAIL' : 'SMOKE OK')
if (failed) process.exitCode = 1

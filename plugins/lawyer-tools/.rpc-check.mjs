/**
 * 临时校验：直接驱动 lawyer-tools 的 apply，取出 lawyerProfile receiver
 * 并跑一遍四个方法（不改真实 dsh home——DSH_HOME 指向临时目录）。
 */
import { mkdtempSync, rmSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { apply } from './lib/index.js'

const home = mkdtempSync(join(tmpdir(), 'lawyer-profile-'))
process.env.DSH_HOME = home

// 造一个最小的 repo 登记文件 + 领域模板，供 template() 读取。
mkdirSync(join(home, 'legal-zh'), { recursive: true })
writeFileSync(join(home, 'legal-zh', 'repo'), 'D:/repo\n')
mkdirSync('D:/repo/commercial-legal', { recursive: true })
writeFileSync('D:/repo/commercial-legal/CLAUDE.md', '# 商事合同实务画像\n\n**执业场景：** [PLACEHOLDER]\n')

const provided = {}
const registrations = []
const ctx = {
  logger: { warn: m => console.log('[warn]', m), info: m => console.log('[info]', m), error: m => console.log('[error]', m) },
  reflect: { provide: (key, value) => { provided[key] = value } },
  typert: { register: spec => { registrations.push(spec) } },
  skills: { registerProvider: () => () => {} },
  inject: () => {},
}

apply(ctx, { skillsDir: join(home, 'skills') })

const receiver = provided.lawyerProfile
let failures = 0
const check = (name, ok, detail) => {
  if (ok) console.log('  PASS', name)
  else { failures++; console.error('  FAIL', name, detail ?? '') }
}

check('lawyerProfile 已注册', receiver !== undefined)
// Typert 以 (package, face) 为主键，重复注册会抛错——必须只有一次注册，
// 两个服务的 5 条 descriptor 合并在这一次里。
check('typert 只注册一次（package face 唯一）', registrations.length === 1, String(registrations.length))
check('单次注册含 5 条 invocation（files/save + 画像 4 条）',
  registrations[0].invocations.length === 5, String(registrations[0].invocations.length))
check('descriptor 方法名齐全',
  registrations[0].invocations.map(i => i.method).join(',') === 'save,status,read,write,template',
  registrations[0].invocations.map(i => i.method).join(','))

// 1) 未配置
let status = await receiver.status('commercial-legal')
check('status：初始存在=false', status.exists === false && status.configured === false, JSON.stringify(status))
check('status：路径在 dshHome 下', status.path === join(home, 'legal-zh', 'commercial-legal', 'CLAUDE.md'), status.path)

// 2) 写入含占位符的画像
const partial = '# 商事合同实务画像\n\n**执业场景：** 中型律所\n**责任上限：** [PLACEHOLDER]\n'
const written = await receiver.write('commercial-legal', partial)
check('write：返回落盘路径', written.path === join(home, 'legal-zh', 'commercial-legal', 'CLAUDE.md'))
status = await receiver.status('commercial-legal')
check('status：存在但未配置，占位符=1',
  status.exists === true && status.configured === false && status.placeholderCount === 1,
  JSON.stringify(status))

// 3) 填满后变成已配置
await receiver.write('commercial-legal', partial.replace('[PLACEHOLDER]', '12 个月服务费'))
status = await receiver.status('commercial-legal')
check('status：填满后已配置', status.configured === true && status.placeholderCount === 0, JSON.stringify(status))

// 4) read
const content = await receiver.read('commercial-legal')
check('read：正文回读一致', content.content.includes('12 个月服务费'))

// 5) template
const template = await receiver.template('commercial-legal')
check('template：读到仓库模板', template.content.includes('商事合同实务画像'), template.content.slice(0, 40))

// 6) 路径遍历 / 非法领域必须被拒
for (const bad of ['../evil', 'a/b', 'Bad_Domain', '', 'law/../../x']) {
  let rejected = false
  try { await receiver.status(bad) } catch { rejected = true }
  check(`非法领域被拒：${JSON.stringify(bad)}`, rejected)
}

// 7) 未知领域的模板要给出可操作错误
let message = ''
try { await receiver.template('no-such-domain') } catch (error) { message = error.message }
check('template：未知领域报错可读', message.includes('仓库内无该领域的画像模板'), message)

rmSync(home, { recursive: true, force: true })
rmSync('D:/repo', { recursive: true, force: true })

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAIL`)
if (failures > 0) process.exitCode = 1

/**
 * lawyer-dsh Host 冒烟入口（smoke-save.ps1 bundle 后 node 执行）：
 * lawyerFiles.save 的子路径清洗与真实落盘。直接用 normalizeUploadSegments
 * （save 的段清洗逻辑）+ 与 save 相同的落盘路径拼装，断言：目录结构保留、
 * 路径遍历被防、非法字符被替换。改动 lawyerFiles.save 后请复跑。
 */
import { mkdir, writeFile, rm } from 'node:fs/promises'
import { isAbsolute, join, sep } from 'node:path'
import { existsSync } from 'node:fs'
import { normalizeUploadSegments } from './src/index.ts'

const UPLOAD_DIR = '.lawyer-uploads'
let failures = 0
function check(name: string, condition: boolean, detail?: string): void {
  if (condition) {
    console.log(`  PASS ${name}`)
  } else {
    failures++
    console.error(`  FAIL ${name}${detail !== undefined ? `: ${detail}` : ''}`)
  }
}

// ── normalizeUploadSegments 纯逻辑 ──
console.log('── 段清洗逻辑 ──')
check('相对子路径保留结构',
  JSON.stringify(normalizeUploadSegments('案卷/证据/合同.pdf')) === JSON.stringify(['案卷', '证据', '合同.pdf']),
  JSON.stringify(normalizeUploadSegments('案卷/证据/合同.pdf')))
check('反斜杠子路径',
  JSON.stringify(normalizeUploadSegments('案卷\\证据\\合同.pdf')) === JSON.stringify(['案卷', '证据', '合同.pdf']))
check('纯文件名（旧版行为）',
  JSON.stringify(normalizeUploadSegments('合同.pdf')) === JSON.stringify(['合同.pdf']))
check('路径遍历 ".." 段被丢弃',
  JSON.stringify(normalizeUploadSegments('案卷/../../etc/passwd')) === JSON.stringify(['案卷', 'etc', 'passwd']),
  JSON.stringify(normalizeUploadSegments('案卷/../../etc/passwd')))
check('带空白的 ".." 段也被丢弃',
  JSON.stringify(normalizeUploadSegments('案卷/ .. /合同.pdf')) === JSON.stringify(['案卷', '合同.pdf']),
  JSON.stringify(normalizeUploadSegments('案卷/ .. /合同.pdf')))
check('全部非法时为空', normalizeUploadSegments('../../..').length === 0)
check('Windows 保留字符被替换', normalizeUploadSegments('a<b>:c.pdf').join('/') === 'a_b__c.pdf',
  normalizeUploadSegments('a<b>:c.pdf').join('/'))
check('空段被丢弃', normalizeUploadSegments('案卷//合同.pdf').join('/') === '案卷/合同.pdf')

// ── 与 save 相同的落盘路径拼装（真实写盘） ──
console.log('── 落盘路径拼装（真实写盘） ──')
const cwd = process.cwd()
if (!isAbsolute(cwd)) throw new Error('cwd 必须绝对路径')
async function saveLike(fileName: string, content: string): Promise<string> {
  const segments = normalizeUploadSegments(fileName)
  if (segments.length === 0) throw new Error('fileName 非法')
  const dir = join(cwd, UPLOAD_DIR, ...segments.slice(0, -1))
  await mkdir(dir, { recursive: true })
  const path = join(dir, segments[segments.length - 1])
  await writeFile(path, content, 'utf8')
  return path
}

const p1 = await saveLike('冒烟案卷/证据/合同.pdf', 'x')
check('子路径文件落盘到嵌套目录',
  p1.includes(`${UPLOAD_DIR}${sep}冒烟案卷${sep}证据${sep}合同.pdf`) && existsSync(p1), p1)
const p2 = await saveLike('冒烟案卷/起诉状.docx', 'y')
check('同顶层目录第二文件共享目录',
  p2.includes(`${UPLOAD_DIR}${sep}冒烟案卷${sep}起诉状.docx`) && existsSync(p2), p2)
const p3 = await saveLike('散文件.txt', 'z')
check('散文件直接落 .lawyer-uploads 根', p3 === join(cwd, UPLOAD_DIR, '散文件.txt') && existsSync(p3), p3)

// 清理冒烟落盘产物
await rm(join(cwd, UPLOAD_DIR, '冒烟案卷'), { recursive: true, force: true })
await rm(p3, { force: true })

console.log(failures === 0 ? '\nALL PASS' : `\n${failures} FAIL`)
if (failures > 0) process.exitCode = 1
// 临时脚本：探测本机是否已缓存 github.com 的 git 凭据（只取用、不打印明文）。
// 用途：创建 Release 需要 GitHub 授权；若凭据可用就不必向用户索要 PAT。
import { spawnSync } from 'node:child_process'

const r = spawnSync('git', ['credential', 'fill'], {
  input: 'protocol=https\nhost=github.com\n\n',
  encoding: 'utf8',
})
const out = (r.stdout || '') + (r.stderr || '')
const pick = (key) => {
  const m = out.split('\n').find((l) => l.startsWith(key + '='))
  return m ? m.slice(key.length + 1).trim() : ''
}
const user = pick('username')
const pass = pick('password')
console.log('git exit:', r.status)
console.log('username:', user || '(none)')
if (!pass) {
  console.log('password: (none)')
} else {
  console.log('password: <hidden> len=' + pass.length + ' prefix=' + pass.slice(0, 4))
  console.log('looks-like:', /^gh[pousr]_/.test(pass) ? 'github token' : (pass.length === 40 ? '可能是 40 位 PAT' : '未知形态'))
}

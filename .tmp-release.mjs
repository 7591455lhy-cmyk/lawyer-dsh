// 临时脚本：创建 GitHub Release 并上传安装包资产（跑完删除）。
// 凭据只从 git credential 取到内存里用，不写盘、不打印。
import { spawnSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const OWNER = '7591455lhy-cmyk'
const REPO = 'lawyer-dsh'
const TAG = 'app-v0.80'
const TITLE = '摸鱼工作站 0.80'
const NOTES_FILE = 'docs/release-notes/app-v0.80.md'
const ASSET = 'packaging/dist/' + fs.readdirSync('packaging/dist').find((f) => f.endsWith('.exe') && !f.includes('unins'))

function token() {
  const r = spawnSync('git', ['credential', 'fill'], { input: 'protocol=https\nhost=github.com\n\n', encoding: 'utf8' })
  const line = ((r.stdout || '') + (r.stderr || '')).split('\n').find((l) => l.startsWith('password='))
  if (!line) throw new Error('未取到 GitHub 凭据')
  return line.slice(9).trim()
}

const GH = { Authorization: '', Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28', 'User-Agent': 'lawyer-dsh-release' }

async function main() {
  GH.Authorization = 'Bearer ' + token()

  // 1) 确认身份与 scope
  const me = await fetch('https://api.github.com/user', { headers: GH })
  if (!me.ok) { console.log('auth FAILED', me.status, await me.text()); process.exit(1) }
  const meJson = await me.json()
  console.log('login:', meJson.login)
  console.log('scopes:', me.headers.get('x-oauth-scopes'))

  // 2) 读发布说明（仓库内用相对链接，Release 正文换成绝对地址）
  let body = fs.readFileSync(NOTES_FILE, 'utf8')
  body = body
    .replace(/\]\(\.\.\//g, `](https://github.com/${OWNER}/${REPO}/blob/master/docs/`)
    .replace(/\]\(\.\.\/\.\.\//g, `](https://github.com/${OWNER}/${REPO}/blob/master/`)

  // 3) 建 Release（已存在则复用）
  let rel = await (await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases/tags/${TAG}`, { headers: GH })).json()
  if (rel && rel.id) {
    console.log('release 已存在，更新正文:', rel.html_url)
    rel = await (await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases/${rel.id}`, {
      method: 'PATCH', headers: { ...GH, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: TITLE, body }),
    })).json()
  } else {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases`, {
      method: 'POST', headers: { ...GH, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tag_name: TAG, name: TITLE, body, draft: false, prerelease: false }),
    })
    rel = await res.json()
    if (!res.ok) { console.log('create FAILED', res.status, JSON.stringify(rel).slice(0, 400)); process.exit(1) }
    console.log('release created:', rel.html_url)
  }

  // 4) 上传资产
  const name = path.basename(ASSET)
  const existing = (rel.assets || []).find((a) => a.name === name)
  if (existing) {
    await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases/assets/${existing.id}`, { method: 'DELETE', headers: GH })
    console.log('removed old asset:', name)
  }
  const uploadUrl = rel.upload_url.replace(/\{.*\}$/, '') + '?name=' + encodeURIComponent(name)
  const form = new FormData()
  form.append('file', new Blob([fs.readFileSync(ASSET)]), name)
  const up = await fetch(uploadUrl, {
    method: 'POST',
    headers: { ...GH, 'Content-Type': undefined },
    body: form,
  })
  const upJson = await up.json().catch(() => ({}))
  if (!up.ok) { console.log('upload FAILED', up.status, JSON.stringify(upJson).slice(0, 500)); process.exit(1) }
  console.log('asset uploaded:', upJson.name, (upJson.size / 1048576).toFixed(1) + 'MB', upJson.state)
  console.log('RELEASE URL:', rel.html_url)
}

main().catch((e) => { console.log('ERROR', e.message); process.exit(1) })

'use strict'

// 摸鱼工作站（一站式律师 AI 工作台）Electron 壳（lawyer-dsh 打包预验证，最小可用版本）。
//
// 职责：
//   1. 首启把 resources/runtime 里的 web profile 与 lawyer preset 部署到
//      userData/dsh-home（作为 DSH_HOME，可写），版本标记控制是否重新部署；
//   2. 生成 lawyer overlay patch（--patch 注入 lawyer-sidebar / lawyer-tools
//      两行，skillsDir 指向安装目录下的 skills）；
//   3. 用自带的 node.exe 启动 npm 安装的 dsh CLI：dsh web --no-open --patch ...；
//   4. 轮询 http://127.0.0.1:3080 就绪后加载窗口；退出时杀掉 dsh 进程树。
//
// 布局（打包后 process.resourcesPath/runtime，开发模式 packaging/runtime）：
//   runtime/node/node.exe                         官方 Node（跑 dsh CLI）
//   runtime/dsh/node_modules/@deepseek-ai/dsh     npm 安装的 dsh（自包含依赖树）
//   runtime/profile-web/                          预组装 web profile（含 lawyer 插件）
//   runtime/agent-presets/lawyer/                 lawyer agent preset
//   runtime/skills/                               三个律师技能
//   runtime/VERSION                               部署版本标记

const { app, BrowserWindow, dialog, session, shell } = require('electron')
const { execSync, spawn } = require('node:child_process')
const fs = require('node:fs')
const http = require('node:http')
const path = require('node:path')

const APP_TITLE = '摸鱼工作站 · 一站式律师 AI 工作台'
const PORT = 3080
const BASE_URL = `http://127.0.0.1:${PORT}`
const READY_TIMEOUT_MS = 120_000
const READY_POLL_INTERVAL_MS = 500

let dshProcess = null
let mainWindow = null
let splashWindow = null
let quitting = false

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow === null) return
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()
  })

  app.whenReady().then(main).catch(fatal)
  app.on('window-all-closed', () => { app.quit() })
  app.on('before-quit', () => {
    quitting = true
    killDsh()
  })
}

function fatal(error) {
  const logsDir = path.join(app.getPath('userData'), 'logs')
  dialog.showErrorBox(`${APP_TITLE} 启动失败`, `${error && error.stack ? error.stack : String(error)}\n\n日志目录：${logsDir}`)
  app.exit(1)
}

/** Resources root: the packaged resources/ dir, or packaging/ in dev mode. */
function resourcesRoot() {
  return app.isPackaged ? process.resourcesPath : path.resolve(__dirname, '..')
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** Verify the shipped runtime exists before touching userData. */
function assertRuntime(runtimeDir) {
  const required = [
    path.join(runtimeDir, 'node', 'node.exe'),
    path.join(runtimeDir, 'dsh', 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js'),
    // turndown 的传递依赖：npm 安装中断时它曾只剩 test/ 子目录，运行期才以
    // “选择工作区失败”（standard preset 挂载 Cannot find module）暴露。
    path.join(runtimeDir, 'dsh', 'node_modules', '@mixmark-io', 'domino', 'package.json'),
    path.join(runtimeDir, 'dsh', 'node_modules', 'koffi', 'index.js'),
    path.join(runtimeDir, 'profile-web', 'package.json'),
    path.join(runtimeDir, 'agent-presets', 'lawyer', 'agent.cordis.yml'),
    path.join(runtimeDir, 'skills'),
    path.join(runtimeDir, 'plugins', 'dsh-worktable', 'lib', 'client.js'),
    path.join(runtimeDir, 'worktable-data'),
    path.join(runtimeDir, 'worktable-projects.json'),
    // M7：中国法律语料 + 18 个 dsh adapter skill（claude-for-legal-ZH），
    // 侧栏三个入口的指令按它路由。
    path.join(runtimeDir, 'legal-zh', '.dsh', 'skills'),
    path.join(runtimeDir, 'VERSION'),
  ]
  const missing = required.filter(p => !fs.existsSync(p))
  if (missing.length > 0) {
    throw new Error(`安装不完整，缺少运行时文件：\n${missing.join('\n')}\n\n请重新安装，或在开发模式下先运行 scripts/prepare-runtime.ps1`)
  }
}

/**
 * Deploy the shipped profile + preset into DSH_HOME (userData/dsh-home).
 *
 * The lawyer sidebar/tools overlay is written into the profile's user layer
 * (`cordis.patch.yml`) rather than passed via `--patch`: `dsh web` rejects
 * parent flags (`--patch`) appearing before the `web` subcommand, and
 * downstream subcommand parsing silently swallowed a trailing `--patch`,
 * making it unreliable in the packaged CLI.
 *
 * Skipped when the shipped VERSION marker matches the deployed one.
 * @returns the DSH_HOME path.
 */
function deployRuntime(runtimeDir) {
  const dshHome = path.join(app.getPath('userData'), 'dsh-home')
  const version = fs.readFileSync(path.join(runtimeDir, 'VERSION'), 'utf8').trim()
  const marker = path.join(dshHome, '.lawyer-runtime-version')
  let deployed = ''
  try {
    deployed = fs.readFileSync(marker, 'utf8').trim()
  } catch { /* first run */ }
  const profileReady = fs.existsSync(path.join(dshHome, 'profiles', 'web', 'package.json'))
  if (deployed === version && profileReady) return dshHome

  fs.rmSync(path.join(dshHome, 'profiles', 'web'), { recursive: true, force: true })
  fs.cpSync(path.join(runtimeDir, 'profile-web'), path.join(dshHome, 'profiles', 'web'), { recursive: true })
  fs.rmSync(path.join(dshHome, '.agent-presets', 'lawyer'), { recursive: true, force: true })
  fs.cpSync(path.join(runtimeDir, 'agent-presets', 'lawyer'), path.join(dshHome, '.agent-presets', 'lawyer'), { recursive: true })
  // profiles/node_modules 是 dsh heal 建的 junction 缓存树，重部署时一并清掉
  // 让 dsh 全新重建（否则 heal 走“删 500 个旧链接”路径，可能被外层
  // node 注入的 safe-delete 垫片拦截；junction 不被跟随，删除安全）。
  fs.rmSync(path.join(dshHome, 'profiles', 'node_modules'), { recursive: true, force: true })

  // user layer — always overwrite with the lawyer overlay (the shipped template's cordis.patch.yml is empty `[]`).
  const skillsDir = path.join(runtimeDir, 'skills').replaceAll('\\', '/')
  const profilePatch = path.join(dshHome, 'profiles', 'web', 'cordis.patch.yml')
  fs.writeFileSync(profilePatch, overlayYaml(skillsDir))

  // 工作台（dsh-worktable）：项目数据部署到 userData\dsh-worktable\data，并
  // 按清单生成 localStorage 预置种子（dsh.worktable.projects.v1，文件夹绑定
  // 指向部署后的实际路径——安装到任何机器都自适应）。随 VERSION 一起更新，
  // 版本不变时用户机器上的数据与种子保持不动。失败不阻塞启动（工作台
  // 仍可手动添加项目），但记日志便于排查。
  try {
    const wtDataSrc = path.join(runtimeDir, 'worktable-data')
    const wtProjectsFile = path.join(runtimeDir, 'worktable-projects.json')
    if (fs.existsSync(wtDataSrc) && fs.existsSync(wtProjectsFile)) {
      const wtDataDst = path.join(app.getPath('userData'), 'dsh-worktable', 'data')
      fs.cpSync(wtDataSrc, wtDataDst, { recursive: true })
      const seed = buildWorktableSeed(wtDataDst, wtProjectsFile)
      fs.writeFileSync(path.join(app.getPath('userData'), 'worktable-seed.json'), JSON.stringify(seed))
    }
  } catch (error) {
    console.error('[main] worktable seed 部署失败（不影响其余启动流程）：', error)
  }

  fs.mkdirSync(dshHome, { recursive: true })
  fs.writeFileSync(marker, `${version}\n`)
  return dshHome
}

// ── claude-for-legal-ZH（M7）─────────────────────────────────────────────────
// 受管块内容与仓库 scripts/install-dsh.sh 的 heredoc 逐字一致（Windows 侧在
// lawyer-dsh/scripts/install-legal-zh.ps1 中有等价实现）。dsh 把
// <dshHome>/AGENTS.md 作为用户全局指令注入每个会话。
const LEGAL_ZH_BLOCK_START = '<!-- legal-zh:start -->'
const LEGAL_ZH_BLOCK_END = '<!-- legal-zh:end -->'
const LEGAL_ZH_BLOCK = [
  '',
  LEGAL_ZH_BLOCK_START,
  '## 中国法律工作守则（claude-for-legal-zh）',
  '',
  '任务涉及中国法律实务时：',
  '',
  '- 优先调用匹配的 `chinese-legal-*` skill，路由到对应领域的工作流（领域 CLAUDE.md + skills/*/SKILL.md）。',
  // 与上游 install-dsh.sh 的唯一差异：打包版把 DSH_HOME 指到安装目录下的
  // dsh-home，不是 ~/.dsh，故此处补一条 $env:DSH_HOME 兜底路径，让会话在两种
  // 部署形态下都能解析到仓库根（其余逐字一致）。
  '- 领域文件的仓库相对路径以 `~/.dsh/legal-zh/repo` 中登记的仓库根目录为基准解析（本工作台打包版的 DSH_HOME 在安装目录下，该文件为 `$env:DSH_HOME/legal-zh/repo`，两条路径都试一次）。',
  '- 所有法律输出均为律师审查草稿，不替代律师专业判断。',
  '- 法条、案例、期限、监管动态等时效性内容，未经可靠来源核验前一律标注“需验证”。',
  '- 保留原工作流的升级、审批、保密与来源标注要求。',
  LEGAL_ZH_BLOCK_END,
  '',
].join('\n')

/** 去掉文本中已有的 legal-zh 受管块（含起止标记行），用于幂等重写。 */
function stripLegalZhBlock(text) {
  const kept = []
  let skipping = false
  for (const line of text.split(/\r?\n/)) {
    if (line.includes(LEGAL_ZH_BLOCK_START)) {
      skipping = true
      continue
    }
    if (skipping) {
      if (line.includes(LEGAL_ZH_BLOCK_END)) skipping = false
      continue
    }
    kept.push(line)
  }
  return kept.join('\n')
}

/**
 * 部署 claude-for-legal-ZH（M7），严格对齐该仓库 scripts/install-dsh.sh 的
 * 三步语义（Windows 等价实现见 lawyer-dsh/scripts/install-legal-zh.ps1）：
 *   1. .dsh/skills/chinese-legal-* → <dshHome>/skills
 *      dsh 本地发现 rank 400（`user-dsh`），见 docs/subsystems/skills.zh.md
 *   2. 仓库绝对路径 → <dshHome>/legal-zh/repo
 *      adapter 通过它把领域 CLAUDE.md / skills/<name>/SKILL.md 的仓库相对
 *      路径解析成绝对路径（Path Resolution）
 *   3. 向 <dshHome>/AGENTS.md 幂等追加 legal-zh 受管块
 *
 * 语料本体放在 userData\legal-zh（dshHome 之外的稳定路径，避免被 dsh 的
 * profile/preset 重部署波及），每次启动全量重写（幂等）——约 2.4MB，成本
 * 可接受，且保证升级后不留旧语料。失败只记日志，不阻塞启动。
 * @param runtimeDir - 随包 runtime 目录。
 * @param dshHome - DSH_HOME（userData\dsh-home）。
 */
function deployLegalZh(runtimeDir, dshHome) {
  const src = path.join(runtimeDir, 'legal-zh')
  if (!fs.existsSync(path.join(src, '.dsh', 'skills'))) {
    console.warn('[main] legal-zh 语料缺失，跳过部署（侧栏入口的 claude-for-legal-ZH 路由不可用）')
    return
  }
  try {
    const corpusDir = path.join(app.getPath('userData'), 'legal-zh')
    fs.rmSync(corpusDir, { recursive: true, force: true })
    fs.cpSync(src, corpusDir, { recursive: true })

    const skillsDir = path.join(dshHome, 'skills')
    fs.mkdirSync(skillsDir, { recursive: true })
    const srcSkills = path.join(corpusDir, '.dsh', 'skills')
    let installed = 0
    for (const entry of fs.readdirSync(srcSkills, { withFileTypes: true })) {
      if (!entry.isDirectory() || !entry.name.startsWith('chinese-legal-')) continue
      const dest = path.join(skillsDir, entry.name)
      fs.rmSync(dest, { recursive: true, force: true })
      fs.cpSync(path.join(srcSkills, entry.name), dest, { recursive: true })
      installed++
    }

    const stateDir = path.join(dshHome, 'legal-zh')
    fs.mkdirSync(stateDir, { recursive: true })
    fs.writeFileSync(path.join(stateDir, 'repo'), `${corpusDir}\n`, 'utf8')

    const agentsFile = path.join(dshHome, 'AGENTS.md')
    const previous = fs.existsSync(agentsFile) ? fs.readFileSync(agentsFile, 'utf8') : ''
    fs.writeFileSync(agentsFile, stripLegalZhBlock(previous) + LEGAL_ZH_BLOCK, 'utf8')

    console.log(`[main] legal-zh 部署完成：${installed} 个 adapter skill，语料目录 ${corpusDir}`)
  }
  catch (error) {
    console.error('[main] legal-zh 部署失败（不影响启动，但侧栏入口的领域路由不可用）：', error)
  }
}

/**
 * 预创建兜底工作区目录并落盘其路径（每次启动都执行，幂等）——不能放在
 * deployRuntime 内：那里仅在版本变化时跑全量，版本不变会提前 return，
 * 目录/路径文件就不再生效。打包环境的 Host 目录选择器仅 native 能力
 * （browse/listDirectory 不可用），lawyer-sidebar 据此路径直接
 * workspace.create({ path }) 注册。
 *
 * 这不是演示数据：没有工作区时发起任务会静默失败（"点了没反应"），所以
 * 去演示数据版本同样需要它——只是目录名从「摸鱼工作站-演示」改成了中性的
 * 「摸鱼工作站-工作区」。
 */
function ensureDefaultWorkspaceDir() {
  try {
    const workspaceDir = path.join(app.getPath('home'), '摸鱼工作站-工作区')
    fs.mkdirSync(workspaceDir, { recursive: true })
    fs.writeFileSync(path.join(app.getPath('userData'), 'default-workspace-dir.txt'), workspaceDir, 'utf8')
  } catch (error) {
    console.error('[main] 预创建兜底工作区目录失败：', error)
  }
}

/**
 * 构造 dsh-worktable 的项目列表种子（dsh.worktable.projects.v1 的值）。
 * 结构对齐插件 client.js 的 DEFAULT_PROJECTS + buildLayout：每项目一个
 * "2h" 预设布局（单主窗，资源管理器窗格），folders 绑定部署后的项目目录。
 * @param dataDir - userData 下的工作台数据目录（绝对路径）。
 * @param projectsFile - 打包清单 worktable-projects.json。
 */
function buildWorktableSeed(dataDir, projectsFile) {
  // PS 5.1 的 Set-Content -Encoding UTF8 带 BOM——JSON.parse 前剥掉，双保险。
  const raw = fs.readFileSync(projectsFile, 'utf8').replace(/^\uFEFF/, '')
  const projects = JSON.parse(raw)
  const layouts = []
  const folders = {}
  const order = []
  for (const project of projects) {
    layouts.push({
      id: project.id,
      title: project.name,
      left: null,
      top: null,
      main: [{ id: 'p1', title: '窗口1', min: 200, content: { kind: 'builtin', type: 'explorer' } }],
      leftWidth: { default: 260, min: 160, max: 480 },
      chatWidth: { default: 360, min: 240, max: 600 },
      topHeight: { default: 200, min: 120, max: 480 },
      topHeightRatio: 0.35,
      chatSide: 'right',
      chatFullHeight: false,
    })
    folders[project.id] = path.join(dataDir, project.dir)
    order.push(project.id)
  }
  return {
    order,
    lastUsed: {},
    hidden: [],
    nameOverrides: {},
    iconOverrides: {},
    removed: [],
    views: {},
    shortcuts: [],
    layouts,
    bindings: {},
    folders,
  }
}

/** The lawyer overlay: sidebar client plugin + skills provider (Host) + config wizard + worktable host plugin. Written into cordis.patch.yml. */
function overlayYaml(skillsDir) {
  return [
    '# lawyer-dsh packaged overlay (written into the web profile user layer).',
    '- insert:',
    '  - id: lawyer-sidebar',
    '    name: lawyer-sidebar',
    '  - id: lawyer-tools',
    '    name: lawyer-tools',
    '    config:',
    `      skillsDir: "${skillsDir}"`,
    '  - id: lawyer-wizard',
    '    name: lawyer-wizard',
    '  - id: dsh-worktable',
    '    name: dsh-worktable',
    '',
  ].join('\n')
}

/** Spawn the bundled Node running the dsh CLI's web profile. */
function startDsh(runtimeDir, dshHome) {
  const nodeExe = path.join(runtimeDir, 'node', 'node.exe')
  const dshBin = path.join(runtimeDir, 'dsh', 'node_modules', '@deepseek-ai', 'dsh', 'lib', 'bin.js')
  const logsDir = path.join(app.getPath('userData'), 'logs')
  fs.mkdirSync(logsDir, { recursive: true })
  const logFd = fs.openSync(path.join(logsDir, 'dsh-web.log'), 'a')

  dshProcess = spawn(nodeExe, [
    dshBin,
    'web',
    '--no-open',
  ], {
    cwd: app.getPath('home'),
    // 剥离开发/宿主环境注入（NODE_OPTIONS 会把 safe-delete 等垫片带进
    // dsh 进程，干扰 heal 的 junction 重建；ELECTRON_RUN_AS_NODE 对纯
    // node.exe 无意义但一并清掉更干净）。
    env: { ...process.env, DSH_HOME: dshHome, NODE_OPTIONS: undefined, ELECTRON_RUN_AS_NODE: undefined },
    stdio: ['ignore', logFd, logFd],
    windowsHide: true,
  })
  dshProcess.on('exit', (code, signal) => {
    if (quitting) return
    fatal(new Error(`dsh web 服务意外退出（code=${code} signal=${signal}），请查看日志：${path.join(logsDir, 'dsh-web.log')}`))
  })
}

/** Kill the dsh process tree (it may own pwsh / MCP child processes). */
function killDsh() {
  if (dshProcess !== null && dshProcess.pid !== undefined) {
    try {
      execSync(`taskkill /pid ${dshProcess.pid} /T /F`, { stdio: 'ignore', windowsHide: true })
    } catch { /* already gone */ }
    dshProcess = null
  }
}

/** Resolve once the local server answers anything on BASE_URL. */
function waitForServer() {
  return new Promise((resolve, reject) => {
    const startedAt = Date.now()
    const attempt = () => {
      const req = http.get(BASE_URL, res => {
        res.resume()
        resolve(undefined)
      })
      req.on('error', () => {
        if (Date.now() - startedAt > READY_TIMEOUT_MS) {
          reject(new Error(`等待 ${BASE_URL} 就绪超时（${READY_TIMEOUT_MS / 1000}s），请查看 dsh-web.log`))
        } else {
          setTimeout(attempt, READY_POLL_INTERVAL_MS)
        }
      })
    }
    attempt()
  })
}

function createSplash() {
  const win = new BrowserWindow({
    width: 460,
    height: 200,
    frame: false,
    resizable: false,
    minimizable: false,
    maximizable: false,
    show: true,
    center: true,
  })
  const html = [
    '<!doctype html><html><head><meta charset="utf-8">',
    '<style>body{font-family:"Microsoft YaHei",sans-serif;display:flex;flex-direction:column;',
    'justify-content:center;align-items:center;height:100vh;margin:0;background:#f7f7f7}',
    'h1{font-size:20px;margin:0 0 12px}p{color:#666;font-size:13px;margin:0}</style></head>',
    `<body><h1>${APP_TITLE}</h1><p>正在启动本地服务，请稍候…</p></body></html>`,
  ].join('')
  win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`)
  return win
}

async function createMainWindow() {
  // 直连 loopback，避免系统代理劫持 127.0.0.1。
  await session.defaultSession.setProxy({ mode: 'direct' })
  // 工作台项目列表种子：preload 在页面脚本前注入 localStorage（仅首启、
  // 不覆盖用户后续修改）。seed JSON 经 argv 传递，preload 零 Node 依赖
  // （renderer sandbox 默认开启也能工作）。
  const additionalArguments = []
  try {
    const seedFile = path.join(app.getPath('userData'), 'worktable-seed.json')
    if (fs.existsSync(seedFile)) {
      additionalArguments.push(`--worktable-seed=${encodeURIComponent(fs.readFileSync(seedFile, 'utf8'))}`)
    }
  } catch { /* seed 缺失不影响启动 */ }
  try {
    const workspaceDirFile = path.join(app.getPath('userData'), 'default-workspace-dir.txt')
    if (fs.existsSync(workspaceDirFile)) {
      additionalArguments.push(`--default-workspace-dir=${encodeURIComponent(fs.readFileSync(workspaceDirFile, 'utf8'))}`)
    }
  } catch { /* 兜底目录缺失不影响启动 */ }
  mainWindow = new BrowserWindow({
    width: 1480,
    height: 940,
    show: false,
    autoHideMenuBar: true,
    title: APP_TITLE,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      additionalArguments,
    },
  })
  mainWindow.on('closed', () => { mainWindow = null })

  // 外链交给系统默认浏览器（M8.6 引导流程）：首启的 DeepSeek 开放平台与
  // 元典开放平台都要完成注册/登录/创建 Key，留在无地址栏的应用内窗口里
  // 走不通（没有密码管理器、无法完成第三方登录回调）。只放行本窗口承载
  // 的 loopback 地址，其余 https/http 一律转出并拒绝在应用内打开。
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//i.test(url) && !url.startsWith(BASE_URL)) {
      shell.openExternal(url).catch(() => {})
      return { action: 'deny' }
    }
    return { action: 'allow' }
  })

  // loadURL occasionally lands before the HTTP listener is fully warm — retry a few times.
  for (let attempt = 0; ; attempt++) {
    try {
      await mainWindow.loadURL(BASE_URL)
      break
    } catch (error) {
      if (attempt >= 10) throw error
      await sleep(1000)
    }
  }
  mainWindow.show()
}

async function main() {
  const runtimeDir = path.join(resourcesRoot(), 'runtime')
  assertRuntime(runtimeDir)
  const dshHome = deployRuntime(runtimeDir)
  deployLegalZh(runtimeDir, dshHome)
  ensureDefaultWorkspaceDir()
  splashWindow = createSplash()
  startDsh(runtimeDir, dshHome)
  await waitForServer()
  await createMainWindow()
  if (splashWindow !== null && !splashWindow.isDestroyed()) splashWindow.destroy()
}

'use strict'

// Electron preload：开箱即演示支持（M6.6）。
//
// dsh-worktable 的项目列表（layouts / folders 绑定 / 排序）存在浏览器
// localStorage（dsh.worktable.projects.v1），新装机为空。main.js 在首启
// 部署时按打包清单生成种子 JSON，经 BrowserWindow additionalArguments 传入
// （encodeURIComponent 编码，规避 argv 里的空白/引号），本脚本在页面脚本
// 运行前把它写入 localStorage——仅当键不存在时注入，用户后续的改动永不
// 被覆盖。零 Node API 依赖（renderer sandbox 默认开启也能工作）。

const FLAG = '--worktable-seed='
const KEY = 'dsh.worktable.projects.v1'

try {
  const flag = process.argv.find(argument => argument.startsWith(FLAG))
  if (flag !== undefined) {
    if (localStorage.getItem(KEY) === null) {
      localStorage.setItem(KEY, decodeURIComponent(flag.slice(FLAG.length)))
    }
  }
} catch {
  // localStorage 不可用（极端环境）时静默跳过——工作台仍可手动添加项目。
}

// 兜底工作区目录（Electron 主进程预创建，路径经 argv 注入）：打包环境的
// Host 目录选择器无 browse 能力，lawyer-sidebar 据此直接 workspace.create。
// 没有工作区时发起任务会静默失败（"点了没反应"），所以这不是演示数据，
// 去演示数据版本同样注入。注意：preload 运行在 isolated world，window 自定义
// 属性对页面主世界不可见，必须走 localStorage（与 worktable seed 同机制，
// 同 origin 跨 world 共享）。
try {
  const workspaceFlag = '--default-workspace-dir='
  const workspaceArg = process.argv.find(argument => argument.startsWith(workspaceFlag))
  if (workspaceArg !== undefined) {
    localStorage.setItem('dsh.defaultWorkspaceDir', decodeURIComponent(workspaceArg.slice(workspaceFlag.length)))
  }
} catch {
  // 忽略——无此注入时插件退回 listDirectory 兜底路径。
}

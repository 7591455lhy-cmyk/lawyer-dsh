/**
 * 外链打开（M8.6 引导流程用）。
 *
 * Client 插件跑在渲染进程里，没有 shell 能力：这里只发一个 target=_blank
 * 的导航，由 Electron 主进程的 setWindowOpenHandler 转交 shell.openExternal
 * （见 packaging/electron/main.js）；浏览器直连调试时即原生新标签页。
 *
 * 引导里的链接都是「去第三方平台注册 / 创建 Key」这类必须留在浏览器里
 * 完成的流程——留在应用内的无框窗口里既没有地址栏也没有密码管理器，用户
 * 走不完。
 */

/** 在系统默认浏览器里打开外链。 */
export function openExternalUrl(url: string): void {
  const opened = window.open(url, '_blank', 'noopener,noreferrer')
  if (opened !== null && opened !== undefined) return
  // 被弹窗拦截器挡下时退回锚点点击（用户手势内触发，通常不会被拦）。
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.target = '_blank'
  anchor.rel = 'noopener noreferrer'
  anchor.click()
}

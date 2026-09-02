/**
 * lawyer-sidebar 构建配置：Node 半（ESM）+ 浏览器 client bundle。
 *
 * client bundle 是 dsh 模块加载器要求的闭包工厂产物：
 *   window.__ModuleLoader__.load({ id, factory: (require) => {...} })
 * 外部依赖（react / cordis / ui 基线包）通过注入的 require 解析（模块表基线，
 * 见 deepseek-harness/packages/client/web/src/platform.ts）。
 *
 * 用 deepseek-harness 工具链构建（本包自身无 devDependencies）：
 *   pnpm --dir <deepseek-harness 仓库路径> exec tsdown --config <本文件绝对路径>
 */
import { fileURLToPath } from 'node:url'

const PLUGIN_ID = 'lawyer-sidebar'

/** 模块表基线（浏览器启动时已就绪的外部依赖，无需 dsh.client.external 声明）。 */
const EXTERNALS = new Set([
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
  '@deepseek-ai/dsh-client-runtime/client',
  '@deepseek-ai/dsh-api-remotes/client',
])

/** 以本配置文件所在目录为锚的绝对路径（tsdown 的 cwd 可能是别的目录）。 */
const root = (relative) => fileURLToPath(new URL(relative, import.meta.url))

export default [
  {
    // 浏览器半：闭包工厂 bundle（classic script 加载，无顶层 import/export）。
    name: `${PLUGIN_ID}/client`,
    entry: { client: root('./src/client/index.ts') },
    outDir: root('./lib'),
    format: 'cjs',
    platform: 'browser',
    dts: false,
    sourcemap: true,
    clean: false,
    tsconfig: root('./tsconfig.json'),
    deps: {
      neverBundle: (specifier) => EXTERNALS.has(specifier),
      alwaysBundle: (specifier) => !EXTERNALS.has(specifier),
    },
    outputOptions: {
      entryFileNames: 'client.js',
      banner: `window.__ModuleLoader__.load({ id: ${JSON.stringify(PLUGIN_ID)}, factory: (require) => {`,
      footer: 'return module.exports; } });',
      intro: 'var module = { exports: {} }; var exports = module.exports;',
    },
  },
  {
    // Node 半：Host loader 入口（空 apply，仅占 Host 侧行）。
    name: PLUGIN_ID,
    entry: { index: root('./src/index.ts') },
    outDir: root('./lib'),
    format: 'esm',
    platform: 'node',
    target: 'es2022',
    dts: false,
    clean: false,
    outputOptions: { entryFileNames: 'index.js' },
  },
]

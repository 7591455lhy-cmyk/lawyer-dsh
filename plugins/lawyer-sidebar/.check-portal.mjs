import { readFileSync } from 'node:fs'
const s = readFileSync('lib/client.js', 'utf8')
console.log('require react-dom:', /require\(["']react-dom["']\)/.test(s))
console.log('createPortal used:', s.includes('createPortal'))
console.log('document.body portal target:', s.includes('document.body'))

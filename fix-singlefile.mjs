/**
 * Post-processes the single-file build so it runs from file:// on double-click.
 *
 * Two changes to dist/index.html:
 *  1. Strip `type="module"` (Chrome blocks module scripts on the file:// origin).
 *  2. Move the now-classic inline script to the end of <body>, because a classic
 *     script in <head> executes before <div id="root"> exists and React can't mount.
 */
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'

const dist = new URL('./dist/index.html', import.meta.url)
let html = readFileSync(dist, 'utf8')

// 1. Make the module script a classic script.
html = html.replace('<script type="module" crossorigin>', '<script>')

// 2. Relocate the big inline app script to just before </body>.
const m = html.match(/<script>(?:(?!<\/script>)[\s\S])*<\/script>/)
if (!m) throw new Error('Could not find inline app script to relocate')
const scriptTag = m[0]
// Only move it if it is actually the large app bundle (not a tiny shim).
if (scriptTag.length > 10000) {
  html = html.replace(scriptTag, '')
  html = html.replace('</body>', `  ${scriptTag}\n  </body>`)
}

writeFileSync(dist, html)

// 3. Copy to the portable location next to the project folder.
const out = new URL('../DV360-Simulation.html', import.meta.url)
copyFileSync(dist, out)
console.log('Single-file build fixed and copied to', out.pathname)

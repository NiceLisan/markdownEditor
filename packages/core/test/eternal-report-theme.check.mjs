import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(testDir, '../../..')
const sharedDir = path.resolve(testDir, '../../shared/src/configs')
const cssPath = path.join(sharedDir, 'theme-css/eternal-report.css')
const themeCssIndexPath = path.join(sharedDir, 'theme-css/index.ts')
const themeOptionsPath = path.join(sharedDir, 'theme.ts')
const mcpServerPath = path.join(rootDir, 'packages/mcp-server/src/index.ts')
const coreRendererPath = path.join(rootDir, 'packages/core/src/renderer/renderer-impl.ts')
const cliRendererPath = path.join(rootDir, 'packages/md-cli/renderer.js')
const webThemeMenuPaths = [
  path.join(rootDir, 'apps/web/src/components/editor/RightSlider.vue'),
  path.join(rootDir, 'apps/web/src/components/editor/editor-header/StyleDropdown.vue'),
]

const themeCssIndex = fs.readFileSync(themeCssIndexPath, 'utf8')
const themeOptions = fs.readFileSync(themeOptionsPath, 'utf8')
const mcpServer = fs.readFileSync(mcpServerPath, 'utf8')
const coreRenderer = fs.readFileSync(coreRendererPath, 'utf8')
const cliRenderer = fs.readFileSync(cliRendererPath, 'utf8')

assert.match(themeCssIndex, /import eternalReportCSS from ['"]\.\/eternal-report\.css\?raw['"]/)
assert.match(themeCssIndex, /['"]eternal-report['"]:\s*eternalReportCSS/)
assert.match(themeOptions, /['"]eternal-report['"]:\s*\{/)
assert.match(themeOptions, /label:\s*`永恒报道`/)
assert.match(themeOptions, /value:\s*`eternal-report`/)
assert.match(mcpServer, /eternal-report/)
for (const renderer of [coreRenderer, cliRenderer]) {
  assert.match(renderer, /text\.split\([^)]*\^/)
  assert.match(renderer, /customRenderers\.hr/)
  assert.match(renderer, /counter2/)
  assert.match(renderer, /padStart\(2/)
  for (const placeholder of ['title', 'text1', 'text2']) {
    assert.match(renderer, new RegExp(String.raw`\\\$\\\{${placeholder}\\\}`))
  }
}

for (const webThemeMenuPath of webThemeMenuPaths) {
  const source = fs.readFileSync(webThemeMenuPath, 'utf8')
  assert.match(source, /themeOptions/, `${path.basename(webThemeMenuPath)} should use shared themeOptions`)
}

assert.ok(fs.existsSync(cssPath), 'eternal-report.css should exist')
const css = fs.readFileSync(cssPath, 'utf8')

assert.match(css, /WeChat Markdown Eternal Report Theme/)
for (const token of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr']) {
  assert.match(css, new RegExp(String.raw`\/\*\s*@renderer\s+${token}\b`), `${token} renderer should exist`)
}
assert.match(css, /\$\{title\}/)
assert.match(css, /\$\{text1\}/)
assert.match(css, /\$\{text2\}/)
assert.match(css, /\$\{counter2\}/)
assert.match(css, /data-eternal-report-part="title"/)
assert.match(css, /data-eternal-report-part="text1"/)
assert.match(css, /data-eternal-report-part="text2"/)
assert.match(css, /Xdje5Twr0jyamSsYNQG2bPPk5LZUYdHRxaqImV5wKIia9DbYxpia0xxo1hiaERzU4SpibbHiaFQfgibKERKAY7miaAKAw/)
assert.match(css, /82T7RdA2RDsLk0C1udzmLiaXwajtoRIR56VUZa1WyDC6O3xV62WUUHKVFBk0r6c272eME119YBqSDEWWydIiaicMw/)
assert.match(css, /mwn4P2Y35jdrDvOlzHuolMeUqNFISib48XGmLjhicmCvLytEuIAU62TaibCrWg7GbKic2H1z2KqHq9JtAaSGFI1RAA/)
assert.match(css, /aMTnCGKCBxyT35jwHQKngJ0yushtHcKuclibm9ibu735qeqlaoC5mzE91QiagppcC2ibDWiavxB20C61HgELeeWmevA/)
assert.match(css, /iaGGQyXglunBRtROatqgbx3XX0R9FUhFAOb7kpYyaWaiasyOMFbtrbzxgdibUDYHQPiblibcY3vpbtNeCicXQY68cMNw/)
assert.match(css, /OIzBKuXvkvpk6FpPCpL6k62TtwB1X1SRxtH2uwOp4kOFibibLY1JJCEuIicMZ98xBN0bwn77leNPnC3ia2icvib7icghA/)
assert.match(css, /mtxuL5w2yQyEaDBpnA9oxjibAVV1I8wVmXFD1El4ZALdibFn5E6cGykWc5jk1vyG5SAibqiah8trBkziaZfNvfOmHwQ/)
assert.doesNotMatch(css, />END<\/p>/)
assert.match(css, /#bde6ff/i)
assert.match(css, /#69add6/i)
assert.match(css, /#136b9f/i)
assert.match(css, /border-collapse:\s*collapse/)
assert.match(css, /word-break:\s*break-word/)
assert.match(css, /tbody tr:nth-child\(even\) td/)
assert.match(css, /tbody tr:hover td/)

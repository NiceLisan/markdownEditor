import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(testDir, '../../..')
const sharedDir = path.resolve(testDir, '../../shared/src/configs')
const cssPath = path.join(sharedDir, 'theme-css/svg_fengshang.css')
const themeCssIndexPath = path.join(sharedDir, 'theme-css/index.ts')
const themeOptionsPath = path.join(sharedDir, 'theme.ts')
const mcpServerPath = path.join(rootDir, 'packages/mcp-server/src/index.ts')

{
  const themeCssIndex = fs.readFileSync(themeCssIndexPath, 'utf8')
  const themeOptions = fs.readFileSync(themeOptionsPath, 'utf8')
  const mcpServer = fs.readFileSync(mcpServerPath, 'utf8')

  assert.match(themeCssIndex, /import svgFengshangCSS from ['"]\.\/svg_fengshang\.css\?raw['"]/)
  assert.match(themeCssIndex, /['"]?svg_fengshang['"]?:\s*svgFengshangCSS/)
  assert.match(themeOptions, /['"]?svg_fengshang['"]?:\s*\{/)
  assert.match(themeOptions, /label:\s*`封赏表彰`/)
  assert.match(themeOptions, /value:\s*`svg_fengshang`/)
  assert.match(mcpServer, /value:\s*`svg_fengshang`/)
}

{
  assert.ok(fs.existsSync(cssPath), 'svg_fengshang.css should exist')
  const css = fs.readFileSync(cssPath, 'utf8')

  assert.match(css, /WeChat Markdown SVG Fengshang Theme/)
  for (const token of ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'hr']) {
    assert.match(css, new RegExp(String.raw`\/\*\s*@renderer\s+${token}\b`), `${token} renderer should exist`)
  }

  assert.match(css, /<svg viewBox="0 0 110 58"/)
  assert.match(css, /9JSliclRicqM1ADUkzSuVaetNsR7BMneFSiajUIlJr1ZFq5zQM3BnvgNAKNRYic6G8ianYicaFibmXqUKp5lHzNlhBEJh8BbLvTUtnsNEhicLPic1ETU/)
  assert.match(css, /radial-gradient\(circle at 32% 35%/)
  assert.match(css, /9JSliclRicqM0NLSAK8vicGlLDBK9aRCgtABN1mWUGR2rBiatGPoe18tnzbEfazEUznSzhJL59xlmK5csF53NfXzRP0xkF9QYNuGmRLvC9CXUHQ/)
  assert.match(css, /9JSliclRicqM0FwPITEtOILznpeSp86OUqtczfmn98C4I8yQbicl5V6IYryOGic2vcySvZpvNhbHBy5fiaB3GsIYEjVhlymak7uHRZoT1NXub6ibw/)
  assert.match(css, /9JSliclRicqM2MVxjLbyFR83cbEBBBJZlkALKMMhGtSk1XnCn3uA5naThZjvKfe3xh8yVJA5TmF8HmbPy6mHehn79lZGEoib9nDnCLMlqsQicP8/)
  assert.match(css, /9JSliclRicqM2EUkLKvHOL9fegCemybyxW47jJtH4h4r0Om7IrZhBr0oTsKzqv2efyux8Yz8wAD2y2s8IaILgP8Dq31M4PLibM0a0U3RcgibLmw/)
  assert.match(css, /上汽集团青年五四奖章标兵集体/)
  assert.match(css, /承五四精神/)
  assert.match(css, /做智造先锋/)
  assert.match(css, /智能岛制造体系总装车身团队/)
  assert.match(css, /以创新奔赴智造新征程/)
  assert.match(css, /以青年智慧定义制造新范式/)
  assert.match(css, /勇闯技术/)
  assert.match(css, /追求卓越/)
  assert.match(css, /word-spacing:\s*999px/)
  assert.match(css, /<strong style="color:\s*#fffff4; font-size:\s*17px/)
  assert.match(css, /9JSliclRicqM0rRQAb81INIjE4BWTThe8FIiawgllgO0Mzs9QsfxTG8qulGxibRzAL8Zaz40vRSsInoRA9bsS1ehtUNXPNMTzQgpic9zCP2ibnB1w/)
  const h6Renderer = css.split('/* @renderer h6\n')[1]?.split('*/')[0] ?? ''
  assert.doesNotMatch(h6Renderer, /9JSliclRicqM1Nib7rYt7k6qS0gVVWbIXsBO9POMeUPWhQV2nXibGG1DbbctfA1CsqULP/)
  assert.match(css, /border-color:\s*#e5c8ac/i)
  assert.match(css, /background-color:\s*#c25452/i)
  assert.match(css, /color:\s*#bb5851/i)
  assert.match(css, /border-collapse:\s*collapse/)
  assert.match(css, /word-break:\s*break-word/)
}

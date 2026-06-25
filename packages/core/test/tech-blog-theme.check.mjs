import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const testDir = path.dirname(fileURLToPath(import.meta.url))
const sharedDir = path.resolve(testDir, '../../shared/src/configs')
const cssPath = path.join(sharedDir, 'theme-css/tech_blog.css')
const themeCssIndexPath = path.join(sharedDir, 'theme-css/index.ts')
const themeOptionsPath = path.join(sharedDir, 'theme.ts')
const cssEditorPath = path.resolve(testDir, '../../../apps/web/src/components/editor/CssEditor.vue')
const startApiPath = path.resolve(testDir, '../../../start-api.bat')

{
  const themeCssIndex = fs.readFileSync(themeCssIndexPath, 'utf8')
  const themeOptions = fs.readFileSync(themeOptionsPath, 'utf8')

  assert.match(themeCssIndex, /import techBlogCSS from ['"]\.\/tech_blog\.css\?raw['"]/)
  assert.match(themeCssIndex, /tech_blog:\s*techBlogCSS/)
  assert.match(themeOptions, /tech_blog:\s*\{/)
  assert.match(themeOptions, /label:\s*`技术博客`/)
  assert.match(themeOptions, /value:\s*`tech_blog`/)
  assert.match(themeOptions, /desc:\s*`TRAE`/)
}

{
  const cssEditor = fs.readFileSync(cssEditorPath, 'utf8')

  assert.match(cssEditor, /import\s*\{[^}]*themeOptions[^}]*\}\s*from\s*['"]@md\/shared['"]/)
  assert.match(cssEditor, /v-for="\{\s*label,\s*value\s*\}\s+in\s+themeOptions"/)
}

{
  const startApi = fs.readFileSync(startApiPath, 'utf8')

  assert.match(startApi, /pnpm --dir apps\\web build/)
  assert.match(startApi, /apps\\web\\dist/)
  assert.match(startApi, /packages\\md-cli\\dist/)
}

{
  assert.ok(fs.existsSync(cssPath), 'tech_blog.css should exist')
  const css = fs.readFileSync(cssPath, 'utf8')

  assert.match(css, /#10bc61/i)
  assert.match(css, /font-size:\s*15px/)
  assert.match(css, /line-height:\s*2(?:;|\s)/)
  assert.match(css, /pre\.code__pre/)
  assert.match(css, /overflow-x:\s*auto/)
  assert.match(css, /border-collapse:\s*collapse/)
  assert.match(css, /word-break:\s*break-word/)
}

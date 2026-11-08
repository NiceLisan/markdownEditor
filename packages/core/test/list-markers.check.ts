import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import process from 'node:process'
import cliRenderer from '../../md-cli/renderer.js'

const require = createRequire(new URL('../../../apps/web/package.json', import.meta.url))
const { parseHTML } = require('linkedom')

const { renderMarkdown } = cliRenderer

const markdown = [
  '- **稳妥争胜**\n  - 第一层子项\n    - 第二层子项\n  - 返回第一层\n- 冲击总榜',
  '3. **蓝方先手**\n   - 无序子项\n   7. 有序子项七\n   8. 有序子项八\n4. 红方后手',
  '- 松散列表首段\n\n  保留第二段内容。\n\n- 松散列表第二项',
  '> - 引用里的条目',
  '- 原文符号 `• 保留` 和 `1. 保留`',
  '1. 常规第一项\n2. 常规第二项',
  '<ul><li>原生 HTML 列表</li></ul>',
].join('\n\n')

const expectedMarkers = ['•', '•', '•', '•', '•', '3.', '•', '7.', '8.', '4.', '•', '•', '•', '•', '1.', '2.']

async function main() {
  for (const theme of ['tech_blog', 'default,tech_blog']) {
    for (const isUseDefaultTheme of [true, false]) {
      const { html } = await renderMarkdown(markdown, { theme, isUseDefaultTheme })
      const { document } = parseHTML(`<html><body>${html}</body></html>`)
      const items = [...document.querySelectorAll('li.listitem')]
      assert.equal(items.length, expectedMarkers.length)
      assert.deepEqual(items.map(item => item.firstElementChild.textContent.trim()), expectedMarkers)

      for (const item of items) {
        const markers = [...item.children].filter(child => child.classList.contains('list-marker'))
        assert.equal(markers.length, 1, 'each list item must have exactly one explicit marker')
        assert.equal(item.firstChild, markers[0], 'no unwrapped duplicate prefix may precede the marker')
        assert.match(item.getAttribute('style'), /display:\s*block/)
        assert.match(item.getAttribute('style'), /list-style:\s*none/)
        assert.match(markers[0].getAttribute('style'), /color:\s*#10bc61/i)
        assert.equal(markers[0].nextSibling?.nodeName === 'P', false, 'a loose item must not leave the marker on a separate line')
      }

      assert.equal(document.querySelectorAll('li.listitem ul ul').length, 1, 'nested list structure must survive')
      assert.ok(document.querySelector('strong').textContent.includes('稳妥争胜'))
      assert.ok([...document.querySelectorAll('p')].some(p => p.textContent === '保留第二段内容。'))
      assert.deepEqual([...document.querySelectorAll('code')].map(code => code.textContent), ['• 保留', '1. 保留'])
      const rawItem = document.querySelector('li:not(.listitem)')
      assert.equal(rawItem.textContent, '原生 HTML 列表')
      assert.equal(rawItem.querySelector('.list-marker'), null)
      assert.match(rawItem.getAttribute('style'), /display:\s*list-item/)
      assert.doesNotMatch(html, /md-list-prefix|\$\{(?:prefix|marker)\}/)

      // Receiving editors can strip classes; the single explicit marker and suppression survive inline.
      for (const element of document.querySelectorAll('[class]')) element.removeAttribute('class')
      assert.equal(document.querySelectorAll('li > span').length, expectedMarkers.length)
      for (const item of items) assert.match(item.getAttribute('style'), /list-style:\s*none/)
    }
  }

  for (const theme of ['default', 'grace', 'simple', 'rainbow']) {
    const { html } = await renderMarkdown('- 保留点号\n\n5. 保留起始编号', { theme })
    const { document } = parseHTML(`<html><body>${html}</body></html>`)
    assert.deepEqual([...document.querySelectorAll('.list-marker')].map(marker => marker.textContent.trim()), ['•', '5.'])
    for (const marker of document.querySelectorAll('.list-marker')) {
      assert.doesNotMatch(marker.getAttribute('style') || '', /display:\s*none/)
    }
  }

  const reset = await renderMarkdown('1. 新列表', { theme: 'tech_blog' })
  const { document } = parseHTML(reset.html)
  assert.equal(document.querySelector('.list-marker').textContent.trim(), '1.')
  process.stdout.write('List marker checks passed: single green markers, nesting, ordered starts, loose paragraphs, raw HTML, class stripping and theme compatibility.\n')
}

void main()

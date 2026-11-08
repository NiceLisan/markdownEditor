import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import process from 'node:process'
import cliRenderer from '../../md-cli/renderer.js'
import { getHeadingDecoration } from '../src/renderer/heading-decoration'

const require = createRequire(new URL('../../../apps/web/package.json', import.meta.url))
const { parseHTML } = require('linkedom')

const { renderMarkdown } = cliRenderer

const markdown = [
  '# 主标题',
  ...Array.from({ length: 12 }, (_, index) => `## 第${index + 1}节 **重要内容**\n\n正文${index + 1}。`),
  '### 三级标题\n\n#### 四级标题\n\n##### 五级标题\n\n###### 六级标题',
  '| 项目 | 数值 |\n| --- | --- |\n| 保留数据 | 160 |',
  '![原配图](https://example.test/editorial.png)',
].join('\n\n')

async function main() {
  for (const isUseDefaultTheme of [true, false]) {
    const result = await renderMarkdown(markdown, { theme: 'tech_blog', isUseDefaultTheme })
    const { document } = parseHTML(`<html><body>${result.html}</body></html>`)
    const headings = [...document.querySelectorAll('h2')]
    const images = [...document.querySelectorAll('img.h2-image')]

    assert.equal(headings.length, 12)
    assert.equal(images.length, 7, 'the seven original chapter artworks must be real images')
    assert.equal(document.querySelectorAll('.h2-image:not(img)').length, 0)
    assert.equal(new Set(images.map(image => image.getAttribute('src'))).size, 7)
    for (const [index, image] of images.entries()) {
      assert.ok(image.classList.contains(`h2-image-${index + 1}`))
      const source = new URL(image.getAttribute('src'))
      assert.equal(source.hostname, 'mmbiz.qpic.cn')
      assert.equal(source.searchParams.get('from'), 'appmsg', 'URL entities must not be double escaped')
      const style = image.getAttribute('style') || ''
      assert.match(style, /height:\s*auto/)
      assert.match(style, /width:\s*100%/)
      assert.match(style, /border-radius:\s*0/)
      assert.match(style, /box-shadow:\s*none/)
      assert.doesNotMatch(style, /background-image|padding-bottom:\s*12\.31%|height:\s*0(?:;|px)/)
      assert.ok(headings[index].parentElement.contains(image))
    }
    assert.deepEqual([...document.querySelectorAll('.h2-number')].map(node => node.textContent), ['08', '09', '10', '11', '12'])
    for (const [index, heading] of headings.entries()) {
      assert.equal(heading.getAttribute('data-heading'), 'true')
      assert.equal(heading.textContent.trim(), `第${index + 1}节 重要内容`)
    }
    // The default theme already uses a section-based custom h3 template.
    const thirdHeading = isUseDefaultTheme
      ? document.querySelector('strong[data-brushtype="text"]')
      : document.querySelector('h3[data-heading="true"]')
    assert.equal(thirdHeading?.textContent.trim(), '三级标题')
    for (const tag of ['h1', 'h4', 'h5', 'h6']) {
      assert.equal(document.querySelectorAll(tag).length, 1, `${tag} structure must remain intact`)
    }
    assert.equal(document.querySelectorAll('table').length, 1)
    assert.ok(document.querySelector('table').textContent.includes('160'))
    assert.equal(document.querySelectorAll('figure img[src="https://example.test/editorial.png"]').length, 1)
    assert.doesNotMatch(result.html, /\$\{(?:decoration|counter|counter2)\}|wsrv\.nl|weserv\.nl/)

    // Source images remain present if a receiving editor strips classes or styles.
    for (const node of document.querySelectorAll('*')) {
      node.removeAttribute('class')
      node.removeAttribute('style')
    }
    assert.equal(document.querySelectorAll('img[src*="mmbiz.qpic.cn"]').length, 7)
    assert.equal(document.querySelectorAll('h2').length, 12)
    assert.ok(document.body.textContent.includes('12'))
  }

  const reset = await renderMarkdown('## 新文章', { theme: 'tech_blog' })
  assert.match(reset.html, /h2-image-1/)
  assert.doesNotMatch(reset.html, /h2-image-2|h2-number/)
  const combined = await renderMarkdown('## 组合主题', { theme: 'default,tech_blog' })
  assert.match(combined.html, /<img[^>]+h2-image-1/)
  const plain = await renderMarkdown('## 普通主题', { theme: 'grace' })
  assert.doesNotMatch(plain.html, /h2-image|h2-number|\$\{decoration\}/)
  assert.equal(getHeadingDecoration({ 'h2-decoration': `\${counter2}` }, 'h2', 100), `\${counter2}`)
  assert.equal(getHeadingDecoration({}, 'h3', 1), '')
  process.stdout.write('Tech Blog rendered HTML checks passed: 01-07 images, 08-12 fallback, reset, h1-h6, original URLs and class/style stripping.\n')
}

void main()

import assert from 'node:assert/strict'
import process from 'node:process'
import cliRenderer from '../../md-cli/renderer.js'

const { renderMarkdown } = cliRenderer

const markdown = `---
title: theme-check
---
# 主标题^副标题^日期

## 二级标题

> 引用内容
`

async function main() {
  for (const theme of [`morning_news`, `svg_fengshang`]) {
    const result = await renderMarkdown(markdown, { theme })

    assert.equal(result.frontMatter.title, `theme-check`)
    assert.match(result.html, /主标题/)
    assert.match(result.html, /二级标题/)
    assert.match(result.html, /引用内容/)
  }

  const morningNews = await renderMarkdown(markdown, { theme: `morning_news` })
  assert.match(morningNews.html, /data-mode="svg"/)
  assert.match(morningNews.html, /MORNING POST/)

  const svgFengshang = await renderMarkdown(markdown, { theme: `svg_fengshang` })
  assert.match(svgFengshang.html, /viewBox="0 0 110 58"/)
  assert.match(svgFengshang.html, /radial-gradient/)

  process.stdout.write(`CLI theme render checks passed.\n`)
}

void main()

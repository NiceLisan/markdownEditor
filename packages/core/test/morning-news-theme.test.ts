import fs from 'node:fs'
import path from 'node:path'
import { themeMap } from '@md/shared/configs'

import { describe, expect, it, vi } from 'vitest'
import { initRenderer } from '../src/renderer/renderer-impl'
import { postProcessHtml, renderMarkdown } from '../src/utils/markdownHelpers'

vi.mock('@md/shared/configs', async (importOriginal: any) => {
  const actual = await importOriginal()

  const morningNewsCssPath = path.resolve(__dirname, '../../shared/src/configs/theme-css/morning_news.css')
  const morningNewsCSSContent = fs.readFileSync(morningNewsCssPath, 'utf-8')

  return {
    ...actual,
    themeMap: {
      ...actual.themeMap,
      morning_news: morningNewsCSSContent,
    },
  }
})

const markdownText = `
# 早报

> 每日早报让您速览昨日今晨新资讯
> 一起来看看一觉醒来发生了什么事

## 新闻要览

> ![](https://bcn.135editor.com/files/images/editor_styles/523a88910b36f44ddc69adc5a00de92a.png)
> 神舟十四号返回舱成功着陆，飞行任务取得圆满成功，宁夏“西电东送”外送电量突破6000亿千瓦时，我国秋粮收购累计超7000万吨。

## 要闻速览

> 12月30日发布的《2022年全国未成年人互联网使用情况研究报告》显示...
>
> ### 经济普查
>
> ![](https://bcn.135editor.com/files/images/editor_styles/5791f325fbd7ae1fbf2cf1c9f728c346.png)

## 资讯速览

> 截至12月30日0时，宁夏“西电东送”累计外送电量突破6000亿千瓦时...

---
`

describe('morning_news theme registration and custom rendering', () => {
  it('registers morning_news CSS correctly in themeMap', () => {
    expect(themeMap).toHaveProperty('morning_news')
    expect(themeMap.morning_news).toContain('WeChat Markdown Morning News Theme')
  })

  it('renders custom morning_news h1, h2, h3 and blockquote renderers', () => {
    const renderer = initRenderer({
      themeName: 'morning_news',
      isMacCodeBlock: true,
      isShowLineNumber: true,
      citeStatus: true,
      countStatus: true,
    })

    const { html: baseHtml, readingTime } = renderMarkdown(markdownText, renderer)
    const processedHtml = postProcessHtml(baseHtml, readingTime, renderer)

    // Save to root for manual inspection
    const outputPath = path.resolve(__dirname, '../../../morning_news_theme_verification.html')
    fs.writeFileSync(outputPath, processedHtml, 'utf-8')

    // 1. h1 custom renderer check
    expect(processedHtml).toContain('data-role="absolute-layout"')
    expect(processedHtml).toContain('<svg xmlns="http://www.w3.org/2000/svg"')
    expect(processedHtml).toContain('早报')
    expect(processedHtml).toContain('MORNING POST')
    expect(processedHtml).not.toContain('foreignobject')
    expect(processedHtml).not.toContain('1b902e094d0fffcc6908ec4906b398a2.gif')

    // 2. h2 custom renderer check
    expect(processedHtml).toContain('6da18cb69846079857eaab45b338c4f5.gif')
    expect(processedHtml).toContain('新闻要览')
    expect(processedHtml).toContain('要闻速览')

    // 3. h3 custom renderer check
    expect(processedHtml).toContain('经济普查')

    // 4. blockquote custom renderer check
    expect(processedHtml).toContain('border: 1px solid #3d97d7')
    expect(processedHtml).toContain('background-color: #ffffff')
  })
})

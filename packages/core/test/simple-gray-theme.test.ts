import fs from 'node:fs'
import path from 'node:path'
import { vi, describe, expect, it } from 'vitest'

vi.mock('@md/shared/configs', async (importOriginal: any) => {
  const actual = await importOriginal()
  
  const simpleGrayCssPath = path.resolve(__dirname, '../../shared/src/configs/theme-css/simple_gray.css')
  const simpleGrayCSSContent = fs.readFileSync(simpleGrayCssPath, 'utf-8')
  
  return {
    ...actual,
    themeMap: {
      ...actual.themeMap,
      simple_gray: simpleGrayCSSContent
    }
  }
})

import { initRenderer } from '../src/renderer/renderer-impl'
import { renderMarkdown, postProcessHtml } from '../src/utils/markdownHelpers'
import { themeMap } from '@md/shared/configs'

const markdownText = `
# 简约浅灰主题测试

> 这是一个引言块，用来测试简约浅灰主题的引用块样式是否正确。

## 章节标题一

这是正文内容。包含**粗体文字**和一个[超链接](https://example.com)以及 *斜体文字* 和 \`inline code\`。

### 步骤标题

#### 四级标题
##### 五级标题
###### 六级标题

- 无序列表项 1
- 无序列表项 2

1. 有序列表项 1
2. 有序列表项 2

![测试图片](https://example.com/image.png)

| 头部 1 | 头部 2 |
| --- | --- |
| 内容 1 | 内容 2 |

---
`

describe('simple_gray theme registration and custom rendering', () => {
  it('registers simple_gray CSS correctly in themeMap', () => {
    expect(themeMap).toHaveProperty('simple_gray')
    expect(themeMap.simple_gray).toContain('WeChat Markdown Simple Gray Theme')
  })

  it('renders custom simple_gray h1, h2, h3 and blockquote renderers', () => {
    const renderer = initRenderer({
      themeName: 'simple_gray',
      isMacCodeBlock: true,
      isShowLineNumber: true,
      citeStatus: true,
      countStatus: true,
    })

    const { html: baseHtml, readingTime } = renderMarkdown(markdownText, renderer)
    const processedHtml = postProcessHtml(baseHtml, readingTime, renderer)

    // Save to root for manual inspection
    const outputPath = path.resolve(__dirname, '../../../simple_gray_theme_verification.html')
    fs.writeFileSync(outputPath, processedHtml, 'utf-8')

    // 1. h1 custom renderer check (header image in h1)
    expect(processedHtml).toContain('9386c708c9275ab3bef27e0283b9b55b.jpg')
    expect(processedHtml).toContain('简约浅灰主题测试')

    // 2. h2 custom renderer check
    expect(processedHtml).toContain('border-bottom: 1px solid var(--md-primary-color, #849aa6)')
    expect(processedHtml).toContain('章节标题一')

    // 3. h3 custom renderer check (counter auto-number badge)
    expect(processedHtml).toContain('STEPS')
    expect(processedHtml).toContain('步骤标题')

    // 4. blockquote custom renderer check (double corner borders)
    expect(processedHtml).toContain('border-left: 4px solid var(--md-primary-color, #849aa6)')
    expect(processedHtml).toContain('border-bottom: 4px solid var(--md-primary-color, #849aa6)')

    // 5. Basic elements & fallbacks checks
    // Fallback headers
    expect(processedHtml).toContain('四级标题')
    expect(processedHtml).toContain('五级标题')
    expect(processedHtml).toContain('六级标题')

    // Inline elements
    expect(processedHtml).toContain('<strong class="strong">粗体文字</strong>')
    expect(processedHtml).toContain('超链接')
    expect(processedHtml).toContain('<em class="em">斜体文字</em>')
    expect(processedHtml).toContain('<code class="codespan">inline code</code>')

    // Lists
    expect(processedHtml).toContain('class="ul"')
    expect(processedHtml).toContain('class="ol"')
    expect(processedHtml).toContain('class="listitem"')
    expect(processedHtml).toContain('无序列表项 1')
    expect(processedHtml).toContain('有序列表项 1')

    // Image
    expect(processedHtml).toContain('<img')
    expect(processedHtml).toContain('https://example.com/image.png')

    // Table
    expect(processedHtml).toContain('<table class="preview-table">')
    expect(processedHtml).toContain('头部 1')
    expect(processedHtml).toContain('内容 1')

    // Horizontal rule
    expect(processedHtml).toContain('<hr')
  })
})

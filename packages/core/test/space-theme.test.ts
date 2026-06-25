import fs from 'node:fs'
import path from 'node:path'
import { themeMap } from '@md/shared/configs'

import { describe, expect, it, vi } from 'vitest'
import { initRenderer } from '../src/renderer/renderer-impl'
import { postProcessHtml, renderMarkdown } from '../src/utils/markdownHelpers'

vi.mock('@md/shared/configs', async (importOriginal: any) => {
  const actual = await importOriginal()

  const spaceCssPath = path.resolve(__dirname, '../../shared/src/configs/theme-css/space.css')
  const spaceCSSContent = fs.readFileSync(spaceCssPath, 'utf-8')

  return {
    ...actual,
    themeMap: {
      ...actual.themeMap,
      space: spaceCSSContent,
    },
  }
})

const markdownText = `
# 探索宇宙，童心向太空

:::topwar-intro
中国航天日特别报道
:::

> 中国航天日，这个充满梦想与探索的日子，为孩子们带来了无限的遐想与热情。学校精心策划了一系列丰富多彩的活动，旨在激发孩子们对航天的兴趣，培养他们的科学精神和创新思维。

## 主题升旗仪式

全体师生齐聚操场，参加以“逐梦星辰，点亮童心”为主题的升旗仪式。

### 航天故事演绎

孩子们身着自制的航天服，扮演着勇敢的航天员，踏上了探索太空的奇妙之旅。他们用活泼的表演和生动的语言，讲述了航天员在太空中的冒险经历。

- **第一阶段**: 航天服自制与走秀展示
- **第二阶段**: 太空生存科学小实验
- **第三阶段**: 航天知识有奖问答

> [!TIP]
> 宇航服的设计可以使用环保废旧纸盒与锡纸进行拼接，模拟金属宇航舱壁效果。

[中国航天科技集团](https://www.spacechina.com) 提供了专业的科普支持。

| 序号 | 活动名称 | 参与年级 | 负责老师 |
| :--- | :--- | :--- | :--- |
| 01 | 升旗仪式 | 全体师生 | 张老师 |
| 02 | 舞台剧 | 三、四年级 | 李老师 |
| 03 | 知识问答 | 五、六年级 | 王老师 |

---

让我们的梦想在太空中自由翱翔！
`

describe('space theme registration and custom rendering', () => {
  it('registers space CSS correctly in themeMap', () => {
    expect(themeMap).toHaveProperty('space')
    expect(themeMap.space).toContain('航天主题（space）')
  })

  it('renders custom space h1, h2, h3 and blockquote renderers', () => {
    const renderer = initRenderer({
      themeName: 'space',
      isMacCodeBlock: true,
      isShowLineNumber: true,
      citeStatus: true,
      countStatus: true,
    })

    const { html: baseHtml, readingTime } = renderMarkdown(markdownText, renderer)
    const processedHtml = postProcessHtml(baseHtml, readingTime, renderer)

    // Save to root for manual inspection
    const outputPath = path.resolve(__dirname, '../../../space_theme_verification.html')
    fs.writeFileSync(outputPath, processedHtml, 'utf-8')

    // h1 check (Astronaut and rocket gifs)
    expect(processedHtml).toContain('fac47723a39224edd792d36321b1f88c.gif')
    expect(processedHtml).toContain('004f49f0015659ef462060e08000f089.gif')
    expect(processedHtml).toContain('探索宇宙，童心向太空')

    // h2 check (Orbital line SVG / star capsule)
    expect(processedHtml).toContain('svg')
    expect(processedHtml).toContain('box-shadow: 0 4px 10px rgba(92, 126, 235, 0.4)')
    expect(processedHtml).toContain('主题升旗仪式')

    // h3 check (counter auto-number badge)
    expect(processedHtml).toContain('class="autonum"')
    expect(processedHtml).toContain('航天故事演绎')

    // blockquote check (dashed space card box)
    expect(processedHtml).toContain('border: 1px dashed #526ec8')
    expect(processedHtml).toContain('box-shadow: 0 4px 15px rgba(40, 31, 73, 0.5)')
  })
})

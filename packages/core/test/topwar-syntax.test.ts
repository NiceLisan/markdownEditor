import { marked } from 'marked'
import { describe, expect, it } from 'vitest'
import { initRenderer } from '../src/renderer/renderer-impl'

describe('topwar syntax', () => {
  const opts = { themeName: 'topwar_game' }
  initRenderer(opts)

  it('renders topwar-intro correctly', () => {
    const md = `:::topwar-intro\nHello Intro\n:::`
    const html = marked.parse(md) as string
    expect(html).toContain('class="topwar-intro"')
    expect(html).toContain('class="topwar-intro-border"')
    expect(html).toContain('Hello Intro')
  })

  it('renders video correctly', () => {
    const md = `:::video\n口袋奇兵\n印石之乱前线速递\n:::`
    const html = marked.parse(md) as string
    expect(html).toContain('wxw_wechannel_card')
    expect(html).toContain('口袋奇兵')
    expect(html).toContain('印石之乱前线速递')
  })

  it('renders topwar-data correctly', () => {
    const md = `:::topwar-data\n**-首周数据透视-**\n“统治力”的代名词\n:::`
    const html = marked.parse(md) as string
    expect(html).toContain('class="topwar-data-container"')
    expect(html).toContain('class="topwar-data-header"')
    expect(html).toContain('“统治力”的代名词')
  })

  it('renders topwar-buff correctly', () => {
    const md = `:::topwar-buff\n荒芜之地的增益属性\n:::`
    const html = marked.parse(md) as string
    expect(html).toContain('class="topwar-buff"')
    expect(html).toContain('荒芜之地的增益属性')
  })

  it('renders topwar-bubble correctly', () => {
    const md = `:::topwar-bubble\n另外，我们已经紧急改进了\n:::`
    const html = marked.parse(md) as string
    expect(html).toContain('class="topwar-bubble"')
    expect(html).toContain('class="topwar-bubble-avatar"')
    expect(html).toContain('class="topwar-bubble-content"')
    expect(html).toContain('另外，我们已经')
  })

  it('renders topwar-tip correctly', () => {
    const md = `:::topwar-tip\n**Tip：**\n○跳跃宣战：若荒芜之地\n:::`
    const html = marked.parse(md) as string
    expect(html).toContain('class="topwar-tip"')
    expect(html).toContain('class="topwar-tip-header"')
    expect(html).toContain('class="topwar-tip-content"')
    expect(html).toContain('○跳跃宣战')
  })

  it('renders topwar-review correctly', () => {
    const md = `:::topwar-review\n[往期回顾](link)\n:::`
    const html = marked.parse(md) as string
    expect(html).toContain('class="topwar-review"')
    expect(html).toContain('往期回顾')
  })

  it('renders topwar-end correctly', () => {
    const md = `:::topwar-end\n记得点赞和在看\n:::`
    const html = marked.parse(md) as string
    expect(html).toContain('class="topwar-end"')
    expect(html).toContain('记得点赞和在看')
    expect(html).toContain('<img')
  })

  it('renders custom hr correctly for topwar_game theme', () => {
    const md = `---`
    const html = marked.parse(md) as string
    expect(html).toContain('<svg')
    expect(html).toContain('<img') // contains the right star image
  })
})

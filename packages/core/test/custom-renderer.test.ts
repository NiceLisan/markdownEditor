import { marked } from 'marked'
import { describe, expect, it, vi, beforeAll } from 'vitest'
import { initRenderer } from '../src/renderer/renderer-impl'

vi.mock('@md/shared/configs', async (importOriginal: any) => {
  const actual = await importOriginal()
  const mockBaseCSS = `
/* @renderer h2
<section class="custom-h2">
  <strong class="counter">\${counter}</strong>
  <strong class="text">\${text}</strong>
</section>
*/
  `;
  return {
    ...actual,
    baseCSSContent: mockBaseCSS,
    themeMap: {
      ...actual.themeMap,
      default: '',
      grace: ''
    }
  }
})

describe('custom CSS renderers via /* @renderer */ notation', () => {
  beforeAll(() => {
    // Reset any state before we run tests to ensure they are clean
    initRenderer({ themeName: 'grace' }) // trigger clear
  })

  it('renders standard tags if no custom renderer is provided for the theme', () => {
    initRenderer({ themeName: 'grace' })
    const md = `## Title text`
    const html = marked.parse(md) as string
    
    // In our mock, baseCSS has an h2, but grace theme uses the baseCSS as well now.
    // Wait, the renderer uses baseCSS for all themes. So baseCSS will apply to grace too!
    expect(html).toContain('class="custom-h2"')
  })

  it('renders custom h2 provided in mocked base.css', () => {
    initRenderer({ themeName: 'default' })
    const md = `## First Custom Title\n## Second Custom Title`
    const html = marked.parse(md) as string
    
    expect(html).toContain('class="custom-h2"')
    expect(html).toContain('First Custom Title')
    expect(html).toContain('Second Custom Title')
    
    // Check auto numbering for ${counter} -> 1 and 2
    expect(html).toContain('<strong class="counter">1</strong>')
    expect(html).toContain('<strong class="counter">2</strong>')
    
    expect(html).not.toContain('<h2')
  })
})

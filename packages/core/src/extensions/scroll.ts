import type { MarkedExtension } from 'marked'

/**
 * A marked extension to support a vertically scrollable container for WeChat Articles.
 * Syntax:
 * ::: scroll [height=240px]
 * Content...
 * :::
 */
export function markedScroll(): MarkedExtension {
  return {
    extensions: [
      {
        name: 'scrollContainer',
        level: 'block',
        start(src) {
          return src.match(/^:::\s*scroll/m)?.index
        },
        tokenizer(src) {
          const match = /^:::\s*scroll(?:\s+height=(\S+))?\s*\n([\s\S]*?)\n:::/.exec(src)
          if (match) {
            const height = match[1] || '240px'
            const content = match[2].trim()
            return {
              type: 'scrollContainer',
              raw: match[0],
              height,
              text: content,
              tokens: this.lexer.blockTokens(content),
            }
          }
          return undefined
        },
        renderer(token) {
          const height = token.height || '240px'
          const contentHtml = this.parser.parse(token.tokens || [])

          return `
<section style="box-sizing: border-box;font-style: normal;font-weight: 400;text-align: justify;font-size: 16px;color: #3e3e3e;">
  <section style="margin-top: 10px;margin-bottom: 10px;display: inline-block;width: 100%;border: 2px dashed #c0c8d1;padding: 10px;background-color: #efefef;box-sizing:border-box;max-width:100% !important;">
    <section style="text-align: center;width: 100%;box-sizing:border-box;max-width:100% !important;">
      <section style="display: inline-block;width: 100%;height: ${height};vertical-align: top;overflow-y: auto;box-sizing:border-box;max-width:100% !important;">
        <section style="box-sizing: border-box;">
          ${contentHtml}
        </section>
      </section>
    </section>
  </section>
</section>\n`
        },
      },
    ],
  }
}

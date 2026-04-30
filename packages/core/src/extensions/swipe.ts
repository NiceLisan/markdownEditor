import type { MarkedExtension } from 'marked'

/**
 * A marked extension to support WeChat-style image sliders.
 * Syntax:
 * ::: swipe
 * Some descriptive text
 * 
 * ![alt](url)
 * ![alt](url)
 * :::
 */
export function markedSwipe(): MarkedExtension {
  return {
    extensions: [
      {
        name: `swipeContainer`,
        level: `block`,
        start(src) {
          return src.match(/^:::\s*swipe/m)?.index
        },
        tokenizer(src) {
          const match = /^:::\s*swipe\s*\n([\s\S]*?)\n:::/.exec(src)
          if (match) {
            let content = match[1]
            // 自动给加粗的 ** 符号前后补空格，解决中文/全角符号边界下检测失败的问题
            content = content
              .replace(/([^\s\*])(\*\*[^\s\*]+?\*\*)/g, '$1 $2')
              .replace(/(\*\*[^\s\*]+?\*\*)([^\s\*])/g, '$1 $2')

            return {
              type: `swipeContainer`,
              raw: match[0],
              text: content,
              tokens: this.lexer.blockTokens(content),
            }
          }
          return undefined
        },
        renderer(token) {
          const tokens = token.tokens || []
          const images: Array<{ src: string, alt: string }> = []
          const descriptionTokens: any[] = []

          for (const t of tokens) {
            if (t.type === 'paragraph') {
              const imageTokens = t.tokens?.filter((child: any) => child.type === 'image') || []
              const hasText = t.tokens?.some((child: any) => 
                child.type !== 'image' && 
                child.type !== 'space' && 
                !(child.type === 'text' && !child.raw.trim())
              )

              if (imageTokens.length > 0 && !hasText) {
                // Paragraph with only images
                imageTokens.forEach((img: any) => {
                  images.push({ src: img.href, alt: img.text || '' })
                })
              } else {
                // Paragraph containing text, may also contain inline images
                descriptionTokens.push(t)
              }
            } else {
              descriptionTokens.push(t)
            }
          }

          // @ts-ignore
          const descriptionHtml = this.parser.parse(descriptionTokens)
          
          const divisor = images.length || 1
          const containerWidth = Math.max(100, divisor * 100)
          const itemWidth = 100 / divisor

          const imagesHtml = images.length > 0 ? images.map(img => `
            <section data-svg-blockname="图文组合" data-svg-op="copy delete" data-svg-role="block" data-width="${itemWidth}%" style="display: inline-block;overflow-wrap: break-word;vertical-align: top;width: ${itemWidth}%;padding-bottom: 15px;box-sizing:border-box;max-width:${itemWidth}% !important;">
              <section>
                <section data-width="100%" style="width: 100%;max-width: 100% !important;box-sizing:border-box;">
                  <section nodeleaf="" style="padding: 12px;">
                    <img alt="${img.alt}" class="rich_pages wxw-img" data-width="100%" src="${img.src}" style="box-shadow: #979899 3.53553px 3.53553px 8px;margin: 0px 8px 8px 0px;border-radius: 0px;width: 100%;vertical-align:baseline;box-sizing:border-box;max-width:100% !important;"/>
                  </section>
                </section>
              </section>
            </section>`).join('') : ''

          return `
<section data-id="115710" data-tools="135编辑器">
  <section style="margin: 20px auto;">
    <section>
      <section>
        <section style="background-color: #f0f4fb;">
          <section style="padding: 15px 10px;box-sizing:border-box;">
            <section data-autoskip="1" style="text-align: justify;line-height:1.75em;letter-spacing: 1.5px;font-size:14px;color:#333;background: transparent;">
              ${descriptionHtml}
            </section>
          </section>
        </section>
      </section>
      <section data-role="animate" data-width="100%" style="border:0px none;padding:0px;overflow:hidden;width:100%;margin:10px auto;overflow-x:auto;max-width:100% !important;box-sizing:border-box;transform: translateZ(5px);-webkit-transform: translateZ(5px);-moz-transform: translateZ(5px);-o-transform: translateZ(5px);">
        <section data-divisor="${divisor}" data-width="${containerWidth}%" style="width: ${containerWidth}%;display: flex;flex-flow: row;max-width: ${containerWidth}% !important;box-sizing:border-box;">
          ${imagesHtml}
        </section>
      </section>
    </section>
    <section style="font-size: 14px;color: #aaaaaa;letter-spacing: 1.5px;text-align: center;padding-top: 10px;box-sizing:border-box;">
      <span leaf=""><br/></span>
    </section>
  </section>
</section>
`
        }
      }
    ]
  }
}

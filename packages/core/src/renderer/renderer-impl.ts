import type { IOpts, RendererAPI } from '@md/shared/types'
import type { ReadTimeResults } from '@md/shared/utils/readingTime'
import type { RendererObject, Tokens } from 'marked'
import { baseCSSContent, themeMap } from '@md/shared/configs'
import readingTime from '@md/shared/utils/readingTime'
import frontMatter from 'front-matter'
import hljs from 'highlight.js/lib/core'
import { marked } from 'marked'
import {
  markedAlert,
  markedFootnotes,
  markedInfographic,
  markedMarkup,
  markedMermaid,
  markedPlantUML,
  markedRuby,
  markedScroll,
  markedSlider,
  markedSwipe,
  markedToc,
  markedTopwar,
  MDKatex,
} from '../extensions'
import { COMMON_LANGUAGES, highlightAndFormatCode } from '../utils/languages'
import { getHeadingDecoration } from './heading-decoration'
import { renderListItemContent } from './list-item'

Object.entries(COMMON_LANGUAGES).forEach(([name, lang]) => {
  hljs.registerLanguage(name, lang)
})

export { hljs }

marked.setOptions({
  breaks: true,
})

// 自动给加粗的 ** 符号前后补空格，解决中文/全角符号边界下检测失败的问题
marked.use({
  hooks: {
    preprocess(md) {
      return md
        .replace(/([^\s*])(\*\*[^\s*]+\*\*)/g, '$1 $2')
        .replace(/(\*\*[^\s*]+\*\*)([^\s*])/g, '$1 $2')
    },
  },
})

marked.use(markedSlider())

const AMPERSAND_REGEX = /&/g
const LESS_THAN_REGEX = /</g
const GREATER_THAN_REGEX = />/g
const DOUBLE_QUOTE_REGEX = /"/g
const SINGLE_QUOTE_REGEX = /'/g
const BACKTICK_REGEX = /`/g
const UNDERSCORE_REGEX = /_/g
const HEADING_TAG_REGEX = /^h\d$/
const MP_WEIXIN_LINK_REGEX = /^https?:\/\/mp\.weixin\.qq\.com/

function escapeHtml(text: string): string {
  return text
    .replace(AMPERSAND_REGEX, `&amp;`) // 转义 &
    .replace(LESS_THAN_REGEX, `&lt;`) // 转义 <
    .replace(GREATER_THAN_REGEX, `&gt;`) // 转义 >
    .replace(DOUBLE_QUOTE_REGEX, `&quot;`) // 转义 "
    .replace(SINGLE_QUOTE_REGEX, `&#39;`) // 转义 '
    .replace(BACKTICK_REGEX, `&#96;`) // 转义 `
}

/**
 * 通过 weserv.nl 代理图片 URL，解决防盗链问题
 * 仅代理外部 http/https 图片，不处理 data URI、相对路径等
 */
function proxyImageUrl(url: string): string {
  if (!url)
    return url
  // 已经是 weserv 代理的 URL，不重复代理
  if (url.includes('images.weserv.nl'))
    return url
  // 仅代理 http/https 开头的外部图片
  if (/^https?:\/\//i.test(url)) {
    return `https://images.weserv.nl/?url=${encodeURIComponent(url)}`
  }
  return url
}

function buildAddition(): string {
  return `
    <style>
      .preview-wrapper pre::before {
        position: absolute;
        top: 0;
        right: 0;
        color: #ccc;
        text-align: center;
        font-size: 0.8em;
        padding: 5px 10px 0;
        line-height: 15px;
        height: 15px;
        font-weight: 600;
      }
    </style>
  `
}

function buildFootnoteArray(footnotes: [number, string, string][]): string {
  return footnotes
    .map(([index, title, link]) =>
      link === title
        ? `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code>: <i style="word-break: break-all">${title}</i><br/>`
        : `<code style="font-size: 90%; opacity: 0.6;">[${index}]</code> ${title}: <i style="word-break: break-all">${link}</i><br/>`,
    )
    .join(`\n`)
}

function extractFileName(href: string): string {
  try {
    // 移除查询参数和哈希
    const urlPath = href.split('?')[0].split('#')[0]
    // 获取最后一个 / 之后的部分
    const fileName = urlPath.split('/').pop() || ''
    // 移除文件扩展名
    const nameWithoutExt = fileName.replace(/\.[^.]*$/, '')
    return nameWithoutExt
  }
  catch {
    return ''
  }
}

function transform(legend: string, text: string | null, title: string | null, href: string = ''): string {
  const options = legend.split(`-`)
  for (const option of options) {
    if (option === `alt` && text) {
      return text
    }
    if (option === `title` && title) {
      return title
    }
    if (option === `filename` && href) {
      const fileName = extractFileName(href)
      if (fileName) {
        return escapeHtml(fileName)
      }
    }
  }
  return ``
}

const macCodeSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" version="1.1" x="0px" y="0px" width="45px" height="13px" viewBox="0 0 450 130">
    <ellipse cx="50" cy="65" rx="50" ry="52" stroke="rgb(220,60,54)" stroke-width="2" fill="rgb(237,108,96)" />
    <ellipse cx="225" cy="65" rx="50" ry="52" stroke="rgb(218,151,33)" stroke-width="2" fill="rgb(247,193,81)" />
    <ellipse cx="400" cy="65" rx="50" ry="52" stroke="rgb(27,161,37)" stroke-width="2" fill="rgb(100,200,86)" />
  </svg>
`.trim()

interface ParseResult {
  yamlData: Record<string, any>
  markdownContent: string
  readingTime: ReadTimeResults
}

function parseFrontMatterAndContent(markdownText: string): ParseResult {
  try {
    const parsed = frontMatter(markdownText)
    const yamlData = parsed.attributes
    const markdownContent = parsed.body

    const readingTimeResult = readingTime(markdownContent)

    return {
      yamlData: yamlData as Record<string, any>,
      markdownContent,
      readingTime: readingTimeResult,
    }
  }
  catch (error) {
    console.error(`Error parsing front-matter:`, error)
    return {
      yamlData: {},
      markdownContent: markdownText,
      readingTime: readingTime(markdownText),
    }
  }
}

export function initRenderer(opts: IOpts = {}): RendererAPI {
  const footnotes: [number, string, string][] = []
  let footnoteIndex: number = 0
  const listOrderedStack: boolean[] = []
  const listCounters: number[] = []
  const headingCounts: Record<string, number> = {}
  let customRenderers: Record<string, string> = {}
  let lastThemeName: string | undefined

  function parseCustomRenderers(themeName: string) {
    if (lastThemeName === themeName)
      return
    lastThemeName = themeName
    customRenderers = {}

    const cssContent = `${baseCSSContent}\n${themeMap[themeName as keyof typeof themeMap] || ''}`

    // Match /* @renderer [token] \n [html] \n */
    const regex = /\/\*\s*@renderer\s+([\w-]+)[\t ]*\r?\n([\s\S]*?)\*\//g
    for (const match of cssContent.matchAll(regex)) {
      const token = match[1]
      const html = match[2].trim()
      customRenderers[token] = html
    }
  }

  function getOpts(): IOpts {
    return opts
  }

  /**
   * 生成带 CSS 类的内容（新主题系统）
   * @param styleLabel CSS 类名标识
   * @param content 内容
   * @param tagName HTML 标签名（可选）
   * @param style 内联样式（可选）
   */
  function styledContent(styleLabel: string, content: string, tagName?: string, style?: string): string {
    const tag = tagName ?? styleLabel
    const className = `${styleLabel.replace(UNDERSCORE_REGEX, `-`)}`
    const headingAttr = HEADING_TAG_REGEX.test(tag) ? ` data-heading="true"` : ``
    const styleAttr = style ? ` style="${style}"` : ``
    return `<${tag} class="${className}"${headingAttr}${styleAttr}>${content}</${tag}>`
  }

  function addFootnote(title: string, link: string): number {
    // 检查是否已经存在相同的链接
    const existingFootnote = footnotes.find(
      ([, , existingLink]) => existingLink === link,
    )
    if (existingFootnote) {
      return existingFootnote[0] // 返回已存在的脚注索引
    }

    // 如果不存在，创建新的脚注
    footnotes.push([++footnoteIndex, title, link])
    return footnoteIndex
  }

  function reset(newOpts: Partial<IOpts>): void {
    footnotes.length = 0
    footnoteIndex = 0
    for (const key in headingCounts) {
      delete headingCounts[key]
    }
    setOptions(newOpts)
  }

  function setOptions(newOpts: Partial<IOpts>): void {
    opts = { ...opts, ...newOpts }
    marked.use(markedInfographic({ themeMode: newOpts.themeMode }))
  }

  function buildReadingTime(readingTime: ReadTimeResults): string {
    if (!opts.countStatus) {
      return ``
    }
    if (!readingTime.words) {
      return ``
    }
    return `
      <blockquote class="md-blockquote">
        <p class="md-blockquote-p">字数 ${
          readingTime?.words
        }，阅读大约需 ${Math.ceil(readingTime?.minutes)} 分钟</p>
      </blockquote>
    `
  }

  const buildFootnotes = () => {
    if (!footnotes.length) {
      return ``
    }

    return (
      styledContent(`h4`, `引用链接`)
      + styledContent(`footnotes`, buildFootnoteArray(footnotes), `p`)
    )
  }

  const renderer: RendererObject = {
    heading({ tokens, depth }: Tokens.Heading) {
      const text = this.parser.parseInline(tokens)
      const tag = `h${depth}`

      headingCounts[tag] = (headingCounts[tag] || 0) + 1

      parseCustomRenderers(opts.themeName || 'default')

      if (customRenderers[tag]) {
        const [title = ``, text1 = ``, text2 = ``] = text.split(`^`, 3)

        return customRenderers[tag]
          .replace(/\$\{decoration\}/g, () => getHeadingDecoration(customRenderers, tag, headingCounts[tag]))
          .replace(/\$\{counter\}/g, () => String(headingCounts[tag]))
          .replace(/\$\{counter2\}/g, () => String(headingCounts[tag]).padStart(2, `0`))
          .replace(/\$\{title\}/g, () => title)
          .replace(/\$\{text1\}/g, () => text1)
          .replace(/\$\{text2\}/g, () => text2)
          .replace(/\$\{text\}/g, () => text)
      }

      if (opts.themeName === 'topwar_game' && depth === 2) {
        return `
<section style="display: flex;justify-content: center;align-items: center;margin-bottom: 30px;margin-top: 30px;box-sizing:border-box;">
  <section style="margin-right: -15px;margin-top: 12px;display: inline-block;vertical-align: middle;width: auto;min-width: 5%;flex: 0 0 auto;height: auto;align-self: center;box-sizing:border-box;z-index: 2;">
    <section style="display: flex;width: 50px;flex-flow: column;box-sizing:border-box;">
      <section style="z-index: 1;">
        <section style="line-height: 0;">
          <section style="vertical-align: middle;display: inline-block;line-height: 0;width: 50px;height: auto;box-sizing:border-box;">
            <section style="text-align:center;">
              <img src="https://mmbiz.qpic.cn/mmbiz_png/1Fv7Rib30SzPkpRdEP3bxovreWaicQfI45wkWIqFpwnp1sibhp8ibk4mftrp5WSF5u4BenzjddVbeoeiarY3zsicb95Q/640?wx_fmt=png&from=appmsg" class="rich_pages wxw-img" style="vertical-align: middle;width: 100%;box-sizing:border-box;max-width:100% !important;" />
            </section>
          </section>
        </section>
      </section>
    </section>
  </section>
  <section style="width: 250px;background-color: var(--md-primary-color, #4154b5);height: 48px;display: flex;justify-content: center;align-items: center;box-sizing: border-box;color: #fff;font-weight: 700;font-size: 20px;letter-spacing: 2px;z-index: 1;">
    <section style="margin-left: 10px;" data-heading="true">
      ${text}
    </section>
  </section>
</section>`
      }
      const finalTag = `h${depth}`
      return styledContent(finalTag, text)
    },

    paragraph({ tokens }: Tokens.Paragraph): string {
      const text = this.parser.parseInline(tokens)
      const isEmpty = text.trim() === ``

      parseCustomRenderers(opts.themeName || 'default')

      const isFigureImage = text.includes(`<figure`) && text.includes(`<img`)
      if (isFigureImage || isEmpty) {
        return text
      }

      if (customRenderers.p || customRenderers.paragraph) {
        const template = customRenderers.p || customRenderers.paragraph
        return template.replace(/\$\{text\}/g, () => text)
      }

      // Top War Disclaimer Style (Lines starting with '*')
      if (opts.themeName === 'topwar_game' && text.trim().startsWith('*')) {
        return `<p style="text-align: justify; line-height: 2.5;" align="justify"><span style="font-weight: 400; text-shadow: none; letter-spacing: 1.5px; color: #7f7f7f; font-size: 12px;">${text}</span></p>\n`
      }

      return styledContent(`p`, text)
    },

    blockquote({ tokens }: Tokens.Blockquote): string {
      const text = this.parser.parse(tokens)

      parseCustomRenderers(opts.themeName || 'default')
      if (customRenderers.blockquote) {
        return customRenderers.blockquote.replace(/\$\{text\}/g, () => text)
      }

      // 新主题系统：blockquote 内的 p 标签由 CSS 选择器 `blockquote p` 控制
      return styledContent(`blockquote`, text)
    },

    code({ text, lang = `` }: Tokens.Code): string {
      const langText = lang.split(` `)[0]
      const isLanguageRegistered = hljs.getLanguage(langText)
      const language = isLanguageRegistered ? langText : `plaintext`

      const highlighted = highlightAndFormatCode(
        text,
        language,
        hljs,
        !!opts.isShowLineNumber,
      )

      const span = `<span class="mac-sign" style="padding: 10px 14px 0;">${macCodeSvg}</span>`
      // 如果语言未注册，添加 data-language-pending 属性和原始代码文本用于后续动态加载
      let pendingAttr = ``
      if (!isLanguageRegistered && langText !== `plaintext`) {
        const escapedText = text.replace(DOUBLE_QUOTE_REGEX, `&quot;`)
        pendingAttr = ` data-language-pending="${langText}" data-raw-code="${escapedText}" data-show-line-number="${opts.isShowLineNumber}"`
      }
      const code = `<code class="language-${lang}"${pendingAttr}>${highlighted}</code>`

      return `<pre class="hljs code__pre">${span}${code}</pre>`
    },

    codespan({ text }: Tokens.Codespan): string {
      const escapedText = escapeHtml(text)
      return styledContent(`codespan`, escapedText, `code`)
    },

    list({ ordered, items, start = 1 }: Tokens.List) {
      listOrderedStack.push(ordered)
      listCounters.push(Number(start))

      const html = items.map(item => this.listitem(item)).join(``)

      listOrderedStack.pop()
      listCounters.pop()

      return styledContent(ordered ? `ol` : `ul`, html)
    },

    // 2. listitem：从栈顶取 ordered + counter，由共享逻辑生成唯一显式标记
    listitem(token: Tokens.ListItem) {
      const ordered = listOrderedStack[listOrderedStack.length - 1]
      const idx = listCounters[listCounters.length - 1]!

      // 准备下一个
      listCounters[listCounters.length - 1] = idx + 1

      // 渲染内容：优先 inline，块级内容交给共享逻辑处理首段
      let content: string
      try {
        content = this.parser.parseInline(token.tokens)
      }
      catch {
        content = this.parser.parse(token.tokens)
      }

      return styledContent(`listitem`, renderListItemContent(content, ordered, idx), `li`)
    },

    image({ href, title, text }: Tokens.Image): string {
      let widthAttr = ``
      let heightAttr = ``
      let altText = text

      const sizeMatch = text.match(/\|(\d+)(?:x(\d+))?$/)
      if (sizeMatch) {
        altText = text.replace(/\|(\d+)(?:x(\d+))?$/, ``)
        widthAttr = sizeMatch[1] ? ` width="${sizeMatch[1]}"` : ``
        heightAttr = sizeMatch[2] ? ` height="${sizeMatch[2]}"` : ``
      }

      const imgHref = opts.useImageProxy ? proxyImageUrl(href) : href
      const newText = opts.legend ? transform(opts.legend, altText, title, imgHref) : ``
      const subText = newText ? styledContent(`figcaption`, newText) : ``
      const titleAttr = title ? ` title="${title}"` : ``
      return `<figure><img src="${imgHref}"${titleAttr}${widthAttr}${heightAttr} alt="${altText}"/>${subText}</figure>`
    },

    link({ href, title, text, tokens }: Tokens.Link): string {
      const isImageLink
        = tokens && tokens.length === 1 && tokens[0].type === `image`

      if (isImageLink) {
        const imageToken = tokens[0] as Tokens.Image
        const imgSrc = opts.useImageProxy ? proxyImageUrl(imageToken.href) : imageToken.href
        const imgAlt = imageToken.text
        const newText = opts.legend
          ? transform(opts.legend, imgAlt, imageToken.title)
          : ``
        const subText = newText ? styledContent(`figcaption`, newText) : ``
        const titleAttr = imageToken.title
          ? ` title="${imageToken.title}"`
          : ``

        return `<figure><section style="display: inline-block;line-height: 0;height: auto !important;box-sizing:border-box;"><a data-itemshowtype="0" data-linktype="1" href="${href}" imgurl="${imgSrc}" linktype="image" tab="innerlink" target="_blank"><span class="js_jump_icon h5_image_link"><img class="rich_pages wxw-img" src="${imgSrc}"${titleAttr} alt="${imgAlt}" style="vertical-align: middle;box-sizing:border-box;max-width: 100%;height: auto;"></span></a></section>${subText}</figure>`
      }

      const parsedText = this.parser.parseInline(tokens)
      if (MP_WEIXIN_LINK_REGEX.test(href)) {
        return `<a href="${href}" title="${title || text}">${parsedText}</a>`
      }
      if (href === text) {
        return parsedText
      }
      if (opts.citeStatus) {
        const ref = addFootnote(title || text, href)
        return `<a href="${href}" title="${
          title || text
        }">${parsedText}<sup>[${ref}]</sup></a>`
      }
      return `<a href="${href}" title="${title || text}">${parsedText}</a>`
    },

    strong({ tokens }: Tokens.Strong): string {
      return styledContent(`strong`, this.parser.parseInline(tokens))
    },

    em({ tokens }: Tokens.Em): string {
      return styledContent(`em`, this.parser.parseInline(tokens))
    },

    table({ header, rows }: Tokens.Table): string {
      const headerRow = header
        .map((cell) => {
          const text = this.parser.parseInline(cell.tokens)
          const thStyle = opts.themeName === 'topwar_game'
            ? `background-color: var(--md-primary-color, #4154b5); color: #fff; padding: 12px; text-align: left; font-weight: 700;`
            : `text-align: ${cell.align || `left`}`
          return styledContent(`th`, text, undefined, thStyle)
        })
        .join(``)
      const body = rows
        .map((row) => {
          const rowContent = row.map(cell => this.tablecell(cell)).join(``)
          return styledContent(`tr`, rowContent)
        })
        .join(``)
      const tableStyle = opts.themeName === 'topwar_game'
        ? `style="width: 100%; border-collapse: collapse; margin: 20px 8px; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); border: 1px solid var(--md-primary-color, #4154b5);"`
        : `class="preview-table"`

      return `
        <section style="max-width: 100%; overflow: auto; -webkit-overflow-scrolling: touch">
          <table ${tableStyle}>
            <thead>${headerRow}</thead>
            <tbody>${body}</tbody>
          </table>
        </section>
      `
    },

    tablecell(token: Tokens.TableCell): string {
      const text = this.parser.parseInline(token.tokens)
      return styledContent(`td`, text, undefined, `text-align: ${token.align || `left`}`)
    },

    hr(token: Tokens.Hr): string {
      parseCustomRenderers(opts.themeName || 'default')
      if (customRenderers.hr) {
        return customRenderers.hr
      }
      if (opts.themeName === 'topwar_game') {
        const img = `<img src="https://mmbiz.qpic.cn/mmbiz_png/1Fv7Rib30SzPkpRdEP3bxovreWaicQfI45DTicD3yVhjS82gPhwzPialkLLicctIWF6q4ogqbBkSdic3Tv7I4xgZNJtg/640?wx_fmt=png&from=appmsg" class="rich_pages wxw-img" style="margin: 0; padding: 0; width: 100%; display: block;" />`
        // Generate a 5000-unit long path by repeating the wave cycle (~270 times)
        const cycle = `c4.632,0,4.632,2.99,9.264,2.99s4.631-2.99,9.263-2.99`
        const pathData = `M0,0.5${cycle.repeat(270)}`
        return `
<section style="margin: 25px 0 15px; display: flex; align-items: center;">
  <section style="flex: 1;">
    <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="5" viewBox="0 0 5000 5" preserveAspectRatio="xMinYMin slice" style="display: block;" xml:space="default">
      <path style="fill: none;stroke: var(--md-primary-color, #4154b5);stroke-width: 1px;fill-rule: evenodd;" d="${pathData}" />
    </svg>
  </section>
  <section style="width: 35px; flex-shrink: 0;">${img}</section>
</section>\n`
      }
      const raw = token.raw.trim()
      let variant = `dash`
      if (raw.includes(`*`)) {
        variant = `star`
      }
      else if (raw.includes(`_`)) {
        variant = `underscore`
      }
      return `<hr class="hr hr-${variant}">`
    },
  }

  marked.use({ renderer })
  // 新主题系统：扩展不再需要 styles 参数
  marked.use(markedMarkup())
  marked.use(markedToc())
  marked.use(markedSlider())
  marked.use(markedSwipe())
  marked.use(markedAlert({}))
  marked.use(MDKatex({ nonStandard: true }, true))
  marked.use(markedFootnotes())
  marked.use(markedMermaid())
  marked.use(
    markedPlantUML({
      inlineSvg: true, // 启用SVG内嵌，适用于微信公众号
    }),
  )
  marked.use(markedInfographic({ themeMode: opts.themeMode }))
  marked.use(markedRuby())
  marked.use(markedScroll())
  marked.use(markedTopwar())

  return {
    buildAddition,
    buildFootnotes,
    setOptions,
    reset,
    parseFrontMatterAndContent,
    buildReadingTime,
    createContainer(content: string) {
      return styledContent(`container mx-auto`, content, `section`)
    },
    getOpts,
  }
}

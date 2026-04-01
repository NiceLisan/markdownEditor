import type { IOpts, RendererAPI } from '@md/shared/types'
import type { RendererObject, Tokens } from 'marked'
import type { ReadTimeResults } from 'reading-time'
import frontMatter from 'front-matter'
import hljs from 'highlight.js/lib/core'
import { marked } from 'marked'
import readingTime from 'reading-time'
import {
  markedAlert,
  markedFootnotes,
  markedInfographic,
  markedMarkup,
  markedMermaid,
  markedPlantUML,
  markedRuby,
  markedSlider,
  markedSwipe,
  markedToc,
  markedTopwar,
  MDKatex,
} from '../extensions'
import { COMMON_LANGUAGES, highlightAndFormatCode } from '../utils/languages'

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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, `&amp;`) // 转义 &
    .replace(/</g, `&lt;`) // 转义 <
    .replace(/>/g, `&gt;`) // 转义 >
    .replace(/"/g, `&quot;`) // 转义 "
    .replace(/'/g, `&#39;`) // 转义 '
    .replace(/`/g, `&#96;`) // 转义 `
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

function transform(
  legend: string,
  text: string | null,
  title: string | null,
): string {
  const options = legend.split(`-`)
  for (const option of options) {
    if (option === `alt` && text) {
      return text
    }
    if (option === `title` && title) {
      return title
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

  function getOpts(): IOpts {
    return opts
  }

  /**
   * 生成带 CSS 类的内容（新主题系统）
   * @param styleLabel CSS 类名标识
   * @param content 内容
   * @param tagName HTML 标签名（可选）
   */
  function styledContent(
    styleLabel: string,
    content: string,
    tagName?: string,
  ): string {
    const tag = tagName ?? styleLabel
    const className = `${styleLabel.replace(/_/g, `-`)}`
    const headingAttr = /^h\d$/.test(tag) ? ` data-heading="true"` : ``
    return `<${tag} class="${className}"${headingAttr}>${content}</${tag}>`
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
  <section style="width: 250px;background-color: #4154b5;height: 48px;display: flex;justify-content: center;align-items: center;box-sizing: border-box;color: #fff;font-weight: 700;font-size: 20px;letter-spacing: 2px;z-index: 1;">
    <section style="margin-left: 10px;" data-heading="true">
      ${text}
    </section>
  </section>
</section>`
      }
      const tag = `h${depth}`
      return styledContent(tag, text)
    },

    paragraph({ tokens }: Tokens.Paragraph): string {
      const text = this.parser.parseInline(tokens)
      const isFigureImage = text.includes(`<figure`) && text.includes(`<img`)
      const isEmpty = text.trim() === ``
      if (isFigureImage || isEmpty) {
        return text
      }

      // Top War Disclaimer Style (Lines starting with '*')
      if (opts.themeName === 'topwar_game' && text.trim().startsWith('*')) {
        return `<p style="text-align: justify; line-height: 2.5;" align="justify"><span style="font-weight: 400; text-shadow: none; letter-spacing: 1.5px; color: #7f7f7f; font-size: 12px;">${text}</span></p>\n`
      }

      return styledContent(`p`, text)
    },

    blockquote({ tokens }: Tokens.Blockquote): string {
      const text = this.parser.parse(tokens)
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
        const escapedText = text.replace(/"/g, `&quot;`)
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

    // 2. listitem：从栈顶取 ordered + counter，计算 prefix 并自增
    listitem(token: Tokens.ListItem) {
      const ordered = listOrderedStack[listOrderedStack.length - 1]
      const idx = listCounters[listCounters.length - 1]!

      // 准备下一个
      listCounters[listCounters.length - 1] = idx + 1

      const prefix = ordered ? `${idx}. ` : `• `

      // 渲染内容：优先 inline，fallback 去掉 <p> 包裹
      let content: string
      try {
        content = this.parser.parseInline(token.tokens)
      }
      catch {
        content = this.parser
          .parse(token.tokens)
          .replace(/^<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/, `$1`)
      }

      return styledContent(`listitem`, `${prefix}${content}`, `li`)
    },

    image({ href, title, text }: Tokens.Image): string {
      const newText = opts.legend ? transform(opts.legend, text, title) : ``
      const subText = newText ? styledContent(`figcaption`, newText) : ``
      const titleAttr = title ? ` title="${title}"` : ``
      return `<figure><img src="${href}"${titleAttr} alt="${text}"/>${subText}</figure>`
    },

    link({ href, title, text, tokens }: Tokens.Link): string {
      const isImageLink
        = tokens && tokens.length === 1 && tokens[0].type === `image`

      if (isImageLink) {
        const imageToken = tokens[0] as Tokens.Image
        const imgSrc = imageToken.href
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
      if (/^https?:\/\/mp\.weixin\.qq\.com/.test(href)) {
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
          return styledContent(`th`, text)
        })
        .join(``)
      const body = rows
        .map((row) => {
          const rowContent = row.map(cell => this.tablecell(cell)).join(``)
          return styledContent(`tr`, rowContent)
        })
        .join(``)
      return `
        <section style="max-width: 100%; overflow: auto">
          <table class="preview-table">
            <thead>${headerRow}</thead>
            <tbody>${body}</tbody>
          </table>
        </section>
      `
    },

    tablecell(token: Tokens.TableCell): string {
      const text = this.parser.parseInline(token.tokens)
      return styledContent(`td`, text)
    },

    hr(_: Tokens.Hr): string {
      if (opts.themeName === 'topwar_game') {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 520 4.97" style="display: block;" xml:space="default"><path style="fill: none;stroke: #4154b5;stroke-width: 1px;fill-rule: evenodd;" d="M373,2214.99c4.632,0,4.632,2.99,9.264,2.99s4.631-2.99,9.263-2.99,4.632,2.99,9.263,2.99,4.633-2.99,9.266-2.99,4.634,2.99,9.267,2.99,4.632-2.99,9.264-2.99,4.632,2.99,9.264,2.99,4.633-2.99,9.265-2.99,4.634,2.99,9.268,2.99,4.633-2.99,9.266-2.99,4.632,2.99,9.264,2.99,4.633-2.99,9.266-2.99,4.634,2.99,9.268,2.99,4.633-2.99,9.265-2.99,4.633,2.99,9.266,2.99,4.633-2.99,9.266-2.99,4.634,2.99,9.267,2.99,4.633-2.99,9.266-2.99,4.633,2.99,9.267,2.99,4.633-2.99,9.267-2.99,4.633,2.99,9.266,2.99,4.634-2.99,9.268-2.99,4.634,2.99,9.267,2.99,4.633-2.99,9.267-2.99,4.634,2.99,9.268,2.99,4.634-2.99,9.267-2.99,4.634,2.99,9.269,2.99,4.634-2.99,9.267-2.99,4.635,2.99,9.269,2.99,4.634-2.99,9.268-2.99,4.634,2.99,9.268,2.99,4.634-2.99,9.268-2.99,4.634,2.99,9.268,2.99,4.634-2.99,9.269-2.99,4.635,2.99,9.269,2.99,4.635-2.99,9.269-2.99,4.634,2.99,9.269,2.99,4.634-2.99,9.268-2.99,4.635,2.99,9.269,2.99,4.634-2.99,9.269-2.99,4.633,2.99,9.266,2.99,4.634-2.99,9.268-2.99,4.634,2.99,9.269,2.99,4.634-2.99,9.268-2.99,4.634,2.99,9.269,2.99,4.634-2.99,9.269-2.99,4.635,2.99,9.271,2.99,4.635-2.99,9.269-2.99,4.635,2.99,9.27,2.99,4.636-2.99,9.271-2.99,4.634,2.99,9.267,2.99,4.635-2.99,9.27-2.99,4.637,2.99,9.273,2.99,4.635-2.99,9.27-2.99,4.639,2.99,9.277,2.99,4.638-2.99,9.276-2.99" transform="translate(-372.5 -2214.5)"/></svg>`
        const img = `<img src="https://mmbiz.qpic.cn/mmbiz_png/1Fv7Rib30SzPkpRdEP3bxovreWaicQfI45DTicD3yVhjS82gPhwzPialkLLicctIWF6q4ogqbBkSdic3Tv7I4xgZNJtg/640?wx_fmt=png&from=appmsg" class="rich_pages wxw-img" style="margin: 0; padding: 0; width: 100%; display: block;" />`
        return `
<section style="margin: 25px 0 15px; display: flex; align-items: center;">
  <section style="width: 100%;">${svg}</section>
  <section style="width: 35px; flex-shrink: 0; margin-left: 5px;">${img}</section>
</section>\n`
      }
      return styledContent(`hr`, ``)
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
  marked.use(markedTopwar())

  return {
    buildAddition,
    buildFootnotes,
    setOptions,
    reset,
    parseFrontMatterAndContent,
    buildReadingTime,
    createContainer(content: string) {
      return styledContent(`container`, content, `section`)
    },
    getOpts,
  }
}

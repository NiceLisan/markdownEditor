import { initRenderer } from '@md/core'
import { postProcessHtml, renderMarkdown } from '@/utils'
import { useThemeStore } from './theme'
import { useUIStore } from './ui'

const WSRV_PROXY_PREFIX = `https://wsrv.nl/?url=`

function shouldProxyWechatImageUrl(url: string) {
  try {
    const parsed = new URL(url)
    return parsed.protocol.startsWith(`http`)
      && (parsed.hostname.endsWith(`qpic.cn`) || parsed.hostname.endsWith(`qlogo.cn`))
      && !url.startsWith(WSRV_PROXY_PREFIX)
  }
  catch {
    return false
  }
}

function toPreviewImageUrl(url: string) {
  if (!shouldProxyWechatImageUrl(url))
    return url
  return `${WSRV_PROXY_PREFIX}${encodeURIComponent(url)}`
}

function proxyWechatImagesForPreview(html: string) {
  if (!html || typeof document === `undefined`)
    return html

  const div = document.createElement(`div`)
  div.innerHTML = html

  div.querySelectorAll<HTMLImageElement>(`img[src]`).forEach((img) => {
    img.setAttribute(`src`, toPreviewImageUrl(img.getAttribute(`src`) || ``))
  })

  div.querySelectorAll<HTMLElement>(`[style*="url("]`).forEach((element) => {
    const style = element.getAttribute(`style`)
    if (!style)
      return

    element.setAttribute(
      `style`,
      style.replace(/url\((['"]?)(https?:\/\/[^'")]+)\1\)/g, (_match, quote = ``, url: string) => {
        return `url(${quote}${toPreviewImageUrl(url)}${quote})`
      }),
    )
  })

  return div.innerHTML
}

/**
 * 渲染 Store
 * 负责 Markdown 渲染、HTML 输出、标题提取等
 */
export const useRenderStore = defineStore(`render`, () => {
  // 输出的 HTML
  const output = ref(``)
  const previewOutput = computed(() => proxyWechatImagesForPreview(output.value))

  // 阅读时间统计
  const readingTime = reactive({
    chars: 0,
    words: 0,
    minutes: 0,
  })

  // 文章标题列表（用于生成目录）
  const titleList = ref<{
    url: string
    title: string
    level: number
  }[]>([])

  // 渲染器实例（延迟初始化）
  let renderer: ReturnType<typeof initRenderer> | null = null

  /**
   * 初始化渲染器（新主题系统）
   * 主题样式通过 useThemeStore().applyCurrentTheme() 注入到 <style> 标签
   */
  const initRendererInstance = (options?: {
    isMacCodeBlock?: boolean
    isShowLineNumber?: boolean
  }) => {
    renderer = initRenderer(options || {})
    return renderer
  }

  // 获取渲染器
  const getRenderer = () => renderer

  // 提取标题
  const extractTitles = () => {
    const div = document.createElement(`div`)
    div.innerHTML = output.value
    const list = div.querySelectorAll<HTMLElement>(`[data-heading]`)

    titleList.value = []
    let i = 0
    for (const item of list) {
      item.setAttribute(`id`, `${i}`)
      titleList.value.push({
        url: `#${i}`,
        title: `${item.textContent}`,
        level: Number(item.tagName.slice(1)),
      })
      i++
    }
    output.value = div.innerHTML
  }

  // 渲染内容
  const render = (content: string) => {
    if (!renderer) {
      throw new Error(`Renderer not initialized. Call initRendererInstance first.`)
    }

    const themeStore = useThemeStore()
    const uiStore = useUIStore()

    // 重置渲染器配置
    // 注意：isUseIndent 和 isUseJustify 通过 CSS 变量处理，不需要传递给渲染器
    renderer.reset({
      citeStatus: themeStore.isCiteStatus,
      legend: themeStore.legend,
      countStatus: themeStore.isCountStatus,
      isMacCodeBlock: themeStore.isMacCodeBlock,
      isShowLineNumber: themeStore.isShowLineNumber,
      themeName: themeStore.theme,
      themeMode: uiStore.isDark ? 'dark' : 'light',
      useImageProxy: false,
    })

    // 渲染 Markdown
    const { html: baseHtml, readingTime: readingTimeResult } = renderMarkdown(content, renderer)

    // 更新统计信息
    readingTime.chars = content.length
    readingTime.words = readingTimeResult.words
    readingTime.minutes = Math.ceil(readingTimeResult.minutes)

    // 后处理 HTML
    output.value = postProcessHtml(baseHtml, readingTimeResult, renderer)

    // 提取标题
    extractTitles()

    return output.value
  }

  return {
    // State
    output,
    previewOutput,
    readingTime,
    titleList,

    // Actions
    initRendererInstance,
    getRenderer,
    render,
    extractTitles,
  }
})

const LEADING_PARAGRAPH_REGEX = /^<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/

/** Keep an explicit marker for WeChat, on the same line as a loose item's first paragraph. */
export function renderListItemContent(content: string, ordered: boolean | undefined, index: number): string {
  const marker = ordered ? `${index}. ` : `• `
  const body = content.replace(LEADING_PARAGRAPH_REGEX, `$1`)
  return `<span class="list-marker">${marker}</span>${body}`
}

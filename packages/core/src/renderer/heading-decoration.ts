/** Select a theme-owned heading decoration, with a fallback for longer articles. */
export function getHeadingDecoration(
  renderers: Record<string, string>,
  tag: string,
  counter: number,
): string {
  return renderers[`${tag}-decoration-${counter}`]
    ?? renderers[`${tag}-decoration`]
    ?? ``
}

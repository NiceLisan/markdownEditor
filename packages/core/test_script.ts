import { marked } from 'marked'
import { initRenderer } from './src/renderer/renderer-impl'

initRenderer({ themeName: 'default' })
const md = `## First Custom Title\n## Second Custom Title`
const html = marked.parse(md)

console.log('=== OUTPUT ===')
console.log(html)
console.log('=== END OUTPUT ===')

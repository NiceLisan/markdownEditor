const cssContent = `
/* @renderer h2
<section style="margin: 10px auto; display: flex; justify-content: flex-start;">
	<strong>0</strong><strong class="autonum">\${counter}</strong>
</section>
*/
`

const regex = /\/\*\s*@renderer\s+([\w-]+)\s*\n([\s\S]*?)\*\//g
let match
while ((match = regex.exec(cssContent)) !== null) {
  console.log('MATCH:', match[1])
  console.log('HTML:', match[2])
}

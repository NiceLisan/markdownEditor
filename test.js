import fs from 'node:fs'

fetch('http://127.0.0.1:8800/api/render/html', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    markdown: '# Hello Rainbow\\n\\n**wow**',
    theme: 'rainbow',
    title: 'Rainbow Theme Test',
  }),
})
  .then(res => res.text())
  .then((html) => {
    fs.writeFileSync('rainbow_output.html', html)
    console.log('Saved to rainbow_output.html')
  })
  .catch(console.error)

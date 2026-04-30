import fs from 'node:fs'

fetch('http://127.0.0.1:8800/api/render/html', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    markdown: '# Hello Grace and Rainbow\\n\\n**wow combined themes!**',
    theme: 'grace,rainbow',
    title: 'Combined Themes Test',
  }),
})
  .then(res => res.text())
  .then((html) => {
    fs.writeFileSync('combined_themes_output.html', html)
    console.log('Saved to combined_themes_output.html')
  })
  .catch(console.error)

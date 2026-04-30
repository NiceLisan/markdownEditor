import fs from 'node:fs'

fetch('http://127.0.0.1:8800/api/render/html', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    markdown: '# 自定参数测试\\n\\n这是一段测试文本。\\n\\n[链接](https://example.com)',
    theme: 'rainbow',
    title: 'Custom Parameters Test',
    primaryColor: '#11A4BEB8',
    isUseIndent: false,
    isUseJustify: false,
    highlightTheme: 'xcode',
    isCountStatus: true,
    isCiteStatus: true,
  }),
})
  .then(res => res.text())
  .then((html) => {
    fs.writeFileSync('custom_params_output.html', html)
    console.log('Saved to custom_params_output.html')
  })
  .catch(console.error)

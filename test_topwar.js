import fs from 'node:fs'

try {
  // const markdown = fs.readFileSync('demo/demo_topwar.md', 'utf-8');
  const markdown = fs.readFileSync('demo/test-scroll.md', 'utf-8')

  fetch('http://127.0.0.1:8800/api/render/html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      markdown,
      theme: 'topwar_game',

      // primaryColor: '#4154b5',
      primaryColor: '#009874',
      title: 'TopWar Theme Test',
    }),
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`)
      }
      return res.text()
    })
    .then((html) => {
      fs.writeFileSync('demo/wechat_article_sc2026_output999.html', html)
      console.log('转换成功！已保存到 demo/wechat_article_sc2026_output999.html')
    })
    .catch((err) => {
      console.error('转换失败:', err.message)
      console.log('请确保已通过 npm run cli start (或 start-api 脚本) 启动了本地 API 服务(默认端口 8800)。')
    })
}
catch (err) {
  console.error('读取 markdown 文件失败:', err.message)
}

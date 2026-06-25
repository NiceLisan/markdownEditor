import fs from 'node:fs'

const markdown = `
:::topwar-head
「测试 topwar 语法在不同主题下的渲染效果」
:::

:::topwar-intro
「测试 topwar 语法在不同主题下的渲染效果」
:::
:::video
test
:::

:::topwar-data -数据测试-
**测试数据容器** 这里是数据内容。
:::

:::topwar-buff
这是一个 buff 容器测试。
:::

---
## htest
---

:::topwar-bubble{![](https://mmbiz.qpic.cn/mmbiz_png/1Fv7Rib30SzOZvQcFIOZwV9wyCicC9gLJcnWgMpZj97mibF2FCDtcMOZicXdf5ibFQMe4Ug3Bu9rbVAQODpu8kfkWNQ/640?wx_fmt=png&from=appmsg)}
这是气泡容器测试内容。
:::

:::topwar-end
**测试结束**
:::
`.trim()

const themes = ['default', 'grace', 'simple', 'topwar_game']

async function testTheme(theme) {
  try {
    const res = await fetch('http://127.0.0.1:8800/api/render/html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        markdown,
        theme,
        primaryColor: '#dc1a9fff',
        title: `TopWar Syntax - ${theme} theme`,
      }),
    })
    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`)
    }
    const html = await res.text()

    // Check for topwar containers in output
    const checks = [
      { name: 'topwar-intro SVG wave', pattern: /viewBox.*580 19\.62/ },
      { name: 'topwar-data container', pattern: /数据测试/ },
      { name: 'topwar-buff', pattern: /buff 容器测试/ },
      { name: 'topwar-bubble', pattern: /气泡容器测试/ },
      { name: 'topwar-end', pattern: /测试结束/ },
    ]

    console.log(`\n=== Theme: ${theme} ===`)
    let allPassed = true
    for (const check of checks) {
      const found = check.pattern.test(html)
      console.log(`  ${found ? '✓' : '✗'} ${check.name}`)
      if (!found)
        allPassed = false
    }
    console.log(`  ${allPassed ? '✓ ALL PASSED' : '✗ SOME FAILED'}`)

    // Save output for inspection
    fs.writeFileSync(`/tmp/topwar_test_${theme}.html`, html)
    return allPassed
  }
  catch (err) {
    console.error(`  ✗ Theme ${theme} failed: ${err.message}`)
    return false
  }
}

(async () => {
  console.log('Testing topwar syntax rendering across all themes...')
  let allOk = true
  for (const theme of themes) {
    const ok = await testTheme(theme)
    if (!ok)
      allOk = false
  }
  console.log(`\n${allOk ? '✓ All themes passed!' : '✗ Some themes failed!'}`)
})()

#!/usr/bin/env node

const { readFileSync } = require("fs");
const {
  colors,
  parseArgv,
} = require("./util.cjs");
const { createServer } = require("./server.cjs");

const packageJson = JSON.parse(readFileSync(new URL('./package.json', ("file://" + __filename)), 'utf8'))

const arg = parseArgv()

async function startServer() {
  const { default: getPort } = await import("get-port");
  try {
    let { port = 8800 } = arg
    port = Number(port)

    port = await getPort({ port }).catch(_ => {
      console.log(`端口 ${port} 被占用，正在寻找可用端口...`)
      return getPort()
    })

    // 固定使用指定端口，不自动切换
    // port = await getPort({ port }).catch(_ => {
    //   console.log(`端口 ${port} 被占用，正在寻找可用端口...`)
    //   return getPort()
    // })

    console.log(`doocs/md-cli v${packageJson.version}`)
    console.log(`服务启动中...`)

    const app = createServer(port)

    app.listen(port, '127.0.0.1', () => {
      console.log(`服务已启动:`)
      console.log(`打开链接 ${colors.green(`http://127.0.0.1:${port}`)} 即刻使用吧~`)
      console.log(``)

      const { spaceId, clientSecret } = arg
      if (spaceId && clientSecret) {
        console.log(`${colors.green('✅ 云存储已配置，可通过自定义代码上传图片')}`)
      }
    })

    process.once('SIGINT', () => {
      console.log('\\n服务器已关闭 (SIGINT)')
      process.exit(0)
    })

    process.once('SIGTERM', () => {
      console.log('\\n服务器已关闭 (SIGTERM)')
      process.exit(0)
    })

    process.on('uncaughtException', err => {
      console.error('Uncaught Exception:', err)
      process.exit(1)
    })

    process.on('unhandledRejection', err => {
      console.error('Unhandled Rejection:', err)
      process.exit(1)
    })

    process.on('exit', code => {
      console.log('Process exit with code', code)
    })

  } catch (err) {
    console.error('启动服务器失败:', err)
    process.exit(1)
  }
}

startServer()

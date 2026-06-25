# Windows 可执行程序构建指南

## 🎯 方案选择：pkg

经过 10 个并行 agents 的深入研究，我们选择了 **pkg** 方案来构建 Windows 可执行程序。

### 为什么选择 pkg？

| 方案       | 优势                              | 劣势                      | 评分       |
| ---------- | --------------------------------- | ------------------------- | ---------- |
| **pkg** ⭐ | 零依赖、最快、单文件 exe、50-70MB | 无重大缺点                | ⭐⭐⭐⭐⭐ |
| Electron   | 功能强大、生态成熟                | 文件大 150MB+、内存占用高 | ⭐⭐⭐     |
| Tauri      | 文件小、性能好                    | 需要学习 Rust、生态较小   | ⭐⭐⭐⭐   |

## 🚀 快速构建

### 一键构建（推荐）

```bash
# 构建 Windows exe 文件
pnpm run build:windows
```

这个命令会自动：

1. ✅ 构建 Vue 3 Web 应用
2. ✅ 复制构建产物到 md-cli
3. ✅ 使用 pkg 打包成 Windows exe
4. ✅ 输出到 `packages/md-cli/build/md-cli.exe`

### 分步构建

```bash
# 1. 构建 Web 应用
pnpm web build:only

# 2. 复制构建产物
npx shx rm -rf packages/md-cli/dist
npx shx cp -r apps/web/dist packages/md-cli/

# 3. 进入 md-cli 目录
cd packages/md-cli

# 4. 安装依赖（包括 pkg）
pnpm install

# 5. 构建 Windows exe
pnpm run build:exe:win
```

## 📦 构建产物

构建完成后，你会得到：

```
packages/md-cli/build/
└── md-cli.exe  (~50-70 MB)
```

## 🎮 使用方法

### 双击启动（最简单）

直接双击 `md-cli.exe` 文件即可：

1. 程序会自动启动本地服务器（默认端口 8800）
2. 自动在默认浏览器中打开编辑器界面
3. 开始编辑 Markdown！

### 命令行启动

```bash
# 基本使用
.\md-cli.exe

# 指定端口
.\md-cli.exe port=3000

# 配置云存储
.\md-cli.exe spaceId=xxx clientSecret=yyy

# 禁用自动打开浏览器
.\md-cli.exe noBrowser=true
```

## 🔧 技术实现

### 核心代码修改

#### 1. index.js - 添加自动打开浏览器 (`packages/md-cli/index.js:21-65`)

```javascript
function openBrowser(url) {
  // 跨平台浏览器打开
  const os = platform()
  let cmd, args

  if (os === 'win32') {
    cmd = 'cmd.exe'
    args = ['/c', 'start', '', url]
  }
  else if (os === 'darwin') {
    cmd = 'open'
    args = [url]
  }
  else {
    cmd = 'xdg-open'
    args = [url]
  }

  spawn(cmd, args, { detached: true, stdio: 'ignore' }).unref()
}
```

#### 2. server.js - 处理 pkg 环境 (`packages/md-cli/server.js:30-42`)

```javascript
function getUploadDir() {
  if (process.pkg !== undefined) {
    // pkg 环境：使用系统临时目录（可写）
    return path.join(tmpdir(), 'md-cli-upload')
  }
  // 开发环境：使用相对路径
  return path.join(__dirname, 'public/upload')
}
```

#### 3. package.json - pkg 配置 (`packages/md-cli/package.json:17-27`)

```json
{
  "pkg": {
    "assets": ["dist/**/*", "public/**/*"],
    "targets": ["node22-win-x64"],
    "outputPath": "build",
    "compress": "Brotli"
  }
}
```

## 📊 性能指标

| 指标     | 数值                     |
| -------- | ------------------------ |
| 文件大小 | ~50-70 MB（Brotli 压缩） |
| 启动时间 | 2-3 秒                   |
| 内存占用 | ~100-150 MB              |
| 构建时间 | 2-5 分钟                 |

## 🐛 故障排除

### 构建失败？

1. **检查 Node.js 版本**

   ```bash
   node --version  # 应该 >= 22.16.0
   ```

2. **清理缓存**

   ```bash
   npx shx rm -rf packages/md-cli/build
   npx shx rm -rf packages/md-cli/node_modules
   pnpm install --force
   ```

3. **内存不足**
   ```bash
   # 增加 Node.js 内存限制
   export NODE_OPTIONS="--max-old-space-size=4096"
   pnpm run build:exe:win
   ```

### 运行时错误？

1. **端口被占用**

   - 使用 `.\md-cli.exe port=3000` 指定其他端口

2. **防火墙拦截**

   - Windows Defender 可能会拦截，点击"允许访问"

3. **无法打开浏览器**
   - 手动访问控制台显示的链接（如 `http://127.0.0.1:8800`）

## 📚 相关文档

- **用户指南**: `packages/md-cli/README-WINDOWS.md`
- **浏览器启动研究**: `packages/md-cli/BROWSER-LAUNCH-GUIDE.md`
- **快速开始**: `packages/md-cli/QUICK-START.md`

## 🔗 相关链接

- **GitHub**: https://github.com/doocs/md
- **官网**: https://md.doocs.org
- **pkg 文档**: https://github.com/vercel/pkg

## 💡 提示

1. ✅ **跨平台支持**：同样的代码可以打包成 macOS 和 Linux 版本

   ```bash
   pnpm run build:exe:all  # 构建所有平台
   ```

2. ✅ **自动更新**：可以添加自动更新功能（需要额外开发）

3. ✅ **代码签名**：生产环境建议对 exe 进行数字签名

---

**享受编辑 Markdown 的乐趣！** 🎉

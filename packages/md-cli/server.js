import express from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import os, { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import { createProxyMiddleware } from "http-proxy-middleware";
import { dcloud, parseArgv, colors } from "./util.js";
import { renderMarkdown } from "./renderer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const arg = parseArgv();

// unicloud 服务空间配置
const spaceInfo = {
  spaceId: ``,
  clientSecret: ``,
  ...arg,
};

/**
 * 获取上传目录
 * pkg 打包环境下，虚拟文件系统不可写，需要使用系统临时目录
 */
function getUploadDir() {
  // 检测是否在 pkg 打包环境中
  if (process.pkg !== undefined) {
    // pkg 环境：使用系统临时目录
    const dir = path.join(tmpdir(), "md-cli-upload");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    return dir;
  }
  // 开发环境：使用相对路径
  return path.join(__dirname, "public/upload");
}

/**
 * 获取静态资源目录
 */
function getPublicDir() {
  // pkg 环境下，静态资源在虚拟文件系统中，可以正常访问
  return path.join(__dirname, "public");
}

/**
 * 创建 Express 服务器
 * @param {number} port - 服务器端口
 */
export function createServer(port = 8800) {
  const app = express();

  // 获取上传目录
  const uploadDir = getUploadDir();
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  // 获取静态资源目录
  const publicDir = getPublicDir();

  // 配置 multer 用于文件上传
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

  const upload = multer({ storage });

  // 中间件
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // 静态资源服务
  app.use("/public", express.static(publicDir));

  // 如果使用临时目录，添加额外的上传文件访问路由
  if (process.pkg !== undefined) {
    app.use("/uploads", express.static(uploadDir));
  }

  async function parseAndRender(req) {
    let {
      markdown,
      path: filePath,
      title,
      theme = "default",
      primaryColor = "#0F4C81",
      fontFamily = "-apple-system-font,BlinkMacSystemFont, Helvetica Neue, PingFang SC, Hiragino Sans GB , Microsoft YaHei UI , Microsoft YaHei ,Arial,sans-serif",
      fontSize = "16px",
      highlightTheme = "github",
      isMacCodeBlock = true,
      isShowLineNumber = false,
      legend = "alt",
      isCiteStatus = false,
      isCountStatus = false,
      isUseIndent = false,
      isUseJustify = false,
      isUseDefaultTheme = true,
      themeMode = "light",
    } = req.body;

    if (!markdown && filePath) {
      if (fs.existsSync(filePath)) {
        markdown = fs.readFileSync(filePath, "utf-8");
      } else {
        throw new Error("File not found");
      }
    }

    if (!markdown) {
      throw new Error("Markdown content is required");
    }

    // 确保 markdown 是字符串类型，防止 front-matter 解析崩溃
    if (typeof markdown !== "string") {
      markdown = String(markdown);
    }

    const result = await renderMarkdown(markdown, {
      theme,
      primaryColor,
      fontFamily,
      fontSize,
      highlightTheme,
      isMacCodeBlock,
      isShowLineNumber,
      legend,
      isCiteStatus,
      isCountStatus,
      isUseIndent,
      isUseJustify,
      isUseDefaultTheme,
      themeMode,
    });

    return { ...result, filePath, title };
  }

  // API Route for Rendering Markdown
  app.post("/api/render", async (req, res) => {
    try {
      const { html } = await parseAndRender(req);
      res.json({ html });
    } catch (error) {
      console.error("Render error:", error);
      if (
        error.message === "File not found" ||
        error.message === "Markdown content is required"
      ) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // API Route for Rendering Markdown to HTML file (Preview)
  app.post("/api/render/html", async (req, res) => {
    try {
      const { html, filePath, title } = await parseAndRender(req);

      // 确定页面标题
      let pageTitle = title || "Markdown Render Preview";
      if (!title && filePath) {
        pageTitle = path.basename(filePath, path.extname(filePath));
      }

      // 封装成完整 HTML 页面
      const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <style>
    body { margin: 0; padding: 20px; background: #fff; }
    .preview-wrapper { max-width: 750px; margin: 0 auto; }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;

      // 确定输出文件名
      let filename = "output.html";
      if (filePath) {
        const base = path.basename(filePath, path.extname(filePath));
        filename = `${base}.html`;
      }

      const downloadDir = path.join(__dirname, "output");
      if (!fs.existsSync(downloadDir)) {
        fs.mkdirSync(downloadDir, { recursive: true });
      }

      const savePath = path.join(downloadDir, filename);
      fs.writeFileSync(savePath, fullHtml, "utf-8");
      console.log(`Rendered HTML saved to: ${savePath}`);

      res.download(savePath, filename);
    } catch (error) {
      console.error("Render error:", error);
      if (
        error.message === "File not found" ||
        error.message === "Markdown content is required"
      ) {
        return res.status(400).send(error.message);
      }
      res.status(500).send(error.message);
    }
  });

  // 文件上传 API
  app.post("/upload", upload.single("file"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = req.file;
      // pkg 环境下使用不同的 URL 路径
      const uploadPath =
        process.pkg !== undefined ? "/uploads" : "/public/upload";
      let url = `http://127.0.0.1:${port}${uploadPath}/${file.filename}`;

      try {
        if (spaceInfo.spaceId && spaceInfo.clientSecret) {
          url = await dcloud(spaceInfo)({
            name: file.originalname,
            file: fs.createReadStream(file.path),
          });

          // 上传成功后删除本地临时文件
          fs.unlinkSync(file.path);
          console.log("文件已上传到云端:", url);
        } else {
          console.log(`${colors.yellow("未配置云存储，降级到本地存储")}`);
        }
      } catch (err) {
        // 云上传失败，降级到本地存储
        console.log("云存储上传失败，降级到本地存储:", err.message);
      }

      res.json({ url });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // 服务本地构建的 web 应用
  const distDir = path.resolve(__dirname, "dist");
  if (fs.existsSync(distDir)) {
    console.log("使用本地构建的 web 应用:", distDir);
    // Vite 构建的 base 是 /md/，所以需要挂载到 /md 路径下
    app.use("/md", express.static(distDir));
    // SPA 路由回退 - 匹配 /md 路径
    app.use((req, res, next) => {
      if (
        req.path.startsWith("/md") &&
        !req.path.startsWith("/api") &&
        !req.path.startsWith("/public") &&
        !req.path.startsWith("/upload")
      ) {
        res.sendFile(path.join(distDir, "index.html"));
      } else {
        next();
      }
    });
  } else {
    console.log("未找到本地构建产物，代理到远程服务");
    app.use(
      createProxyMiddleware({
        target: "https://md.doocs.org/",
        changeOrigin: true,
        on: {
          error: (err, req, res) => {
            console.error(`代理错误 ${req.path}:`, err);
            res
              .status(502)
              .send(`代理服务暂不可用，请检查网络连接 ${err.message}`);
          },
        },
      })
    );
  }

  return app;
}

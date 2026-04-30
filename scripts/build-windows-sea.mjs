#!/usr/bin/env node

/**
 * 使用 Node.js SEA (Single Executable Application) 打包
 *
 * 不依赖 pkg，使用 Node.js 22 内置的 SEA 功能
 * 将 JS 代码嵌入 node.exe，运行时读取外部 node_modules
 * 完全避免 pkg 的静态分析问题
 */

import { spawn } from "child_process";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  rmSync,
  copyFileSync,
  statSync,
  readdirSync,
  lstatSync,
} from "fs";
import os from "os";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rootDir = join(__dirname, "..");
const cliDir = join(rootDir, "packages/md-cli");
const buildDir = join(cliDir, "build");

function runCommand(command, args, cwd) {
  return new Promise((resolve, reject) => {
    console.log(`▶️  ${command} ${args.join(" ")}`);
    const child = spawn(command, args, {
      cwd,
      stdio: "inherit",
      shell: true,
    });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`命令失败，退出代码: ${code}`));
    });
    child.on("error", reject);
  });
}

function copyDirRecursive(src, dest, skip = []) {
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true });
  const items = readdirSync(src);
  for (const item of items) {
    if (skip.includes(item)) continue;
    const srcPath = join(src, item);
    const destPath = join(dest, item);
    const stat = lstatSync(srcPath);
    if (stat.isDirectory()) {
      copyDirRecursive(srcPath, destPath, skip);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

async function build() {
  let tempDir = null;

  try {
    console.log("🚀 使用 Node.js SEA 构建 Windows 可执行程序\n");
    console.log("=".repeat(60));

    // 1. 确保 web 构建产物存在
    console.log("\n📦 步骤 1/6: 检查 Web 构建产物...");
    const webDist = join(rootDir, "apps/web/dist");
    const cliDist = join(cliDir, "dist");

    if (!existsSync(webDist)) {
      console.log("⚠️  Web 产物不存在，请先运行 pnpm web build");
      process.exit(1);
    }

    if (existsSync(cliDist)) rmSync(cliDist, { recursive: true, force: true });
    mkdirSync(cliDist, { recursive: true });
    copyDirRecursive(webDist, cliDist);
    console.log("✅ Web 产物已复制");

    // 2. 创建临时目录
    console.log("\n📋 步骤 2/6: 创建隔离的 npm 环境...");
    const tempBase = join(os.tmpdir(), "md-cli-sea");
    const hash = crypto
      .createHash("md5")
      .update(cliDir)
      .digest("hex")
      .slice(0, 8);
    tempDir = join(tempBase, hash);

    if (existsSync(tempDir)) rmSync(tempDir, { recursive: true, force: true });
    mkdirSync(tempDir, { recursive: true });

    // 复制必要文件
    copyDirRecursive(join(cliDir, "dist-cli"), join(tempDir, "dist-cli"));
    copyDirRecursive(join(cliDir, "dist"), join(tempDir, "dist"));
    if (existsSync(join(cliDir, "public"))) {
      copyDirRecursive(join(cliDir, "public"), join(tempDir, "public"));
    }

    // 修复 Vite base path: /md/ -> / 并移除 Google 广告脚本
    const indexHtmlPath = join(tempDir, "dist", "index.html");
    if (existsSync(indexHtmlPath)) {
      let html = readFileSync(indexHtmlPath, "utf8");
      // 修复 base path
      html = html.replace(/\/md\//g, "/");
      // 移除 Google Analytics 脚本
      html = html.replace(
        /<script src="https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=G-7NZL3PZ0NK"[\s\S]*?<\/script>/g,
        ""
      );
      html = html.replace(
        /<script>window\.dataLayer[\s\S]*?gtag\('config', 'G-7NZL3PZ0NK'\);[\s\S]*?<\/script>/g,
        ""
      );
      // 移除 VitePluginRadar 的 Google Analytics
      html = html.replace(
        /VitePluginRadar\([\s\S]*?analytics:[\s\S]*?\},[\s\S]*?\},/g,
        ""
      );
      writeFileSync(indexHtmlPath, html, "utf8");
      console.log("✅ 已修复 Vite base path 并移除 Google 广告脚本");
    }

    // 创建 package.json
    const pkg = {
      name: "@doocs/md-cli",
      version: "2.1.3",
      type: "commonjs",
      main: "dist-cli/index.cjs",
      dependencies: {
        express: "^5.2.1",
        fflate: "^0.8.2",
        "form-data": "4.0.5",
        "front-matter": "^4.0.2",
        "get-port": "7.1.0",
        "highlight.js": "^11.9.0",
        "http-proxy-middleware": "^3.0.5",
        "isomorphic-dompurify": "^2.35.0",
        juice: "^11.0.3",
        katex: "^0.16.21",
        marked: "^17.0.1",
        mermaid: "^11.12.2",
        multer: "^2.0.2",
        "node-fetch": "^3.3.2",
        postcss: "^8.5.3",
        "postcss-calc": "^10.1.1",
        "postcss-custom-properties": "^14.0.4",
        "reading-time": "^1.5.0",
      },
    };

    writeFileSync(join(tempDir, "package.json"), JSON.stringify(pkg, null, 2));
    console.log("✅ 临时目录已准备");

    // 3. 使用 npm 安装依赖
    console.log("\n📥 步骤 3/6: 使用 npm 安装依赖...");
    await runCommand("npm", ["install", "--no-audit", "--no-fund"], tempDir);
    console.log("✅ 依赖安装完成");

    // 4. 创建 SEA 配置
    console.log("\n🔧 步骤 4/6: 准备 SEA 配置...");
    const seaConfig = `"use strict";
const { join, dirname } = require("path");
const { createRequire } = require("module");
const { cwd, env } = require("process");

// 获取 exe 所在目录
const exeDir = dirname(process.execPath);

// 设置 NODE_PATH 指向 node_modules
env.NODE_PATH = join(exeDir, "node_modules");
require("module").Module._initPaths();

// 使用 createRequire 加载外部模块
const req = createRequire(join(exeDir, "package.json"));

// 加载主程序
req(join(exeDir, "dist-cli", "index.cjs"));
`;
    writeFileSync(join(tempDir, "sea-entry.cjs"), seaConfig);

    const seaConfigJson = {
      main: "sea-entry.cjs",
      output: "sea-prep.blob",
    };
    writeFileSync(
      join(tempDir, "sea-config.json"),
      JSON.stringify(seaConfigJson, null, 2)
    );
    console.log("✅ SEA 配置已创建");

    // 5. 生成 SEA blob
    console.log("\n🔨 步骤 5/6: 生成 SEA blob...");
    await runCommand(
      "node",
      ["--experimental-sea-config", "sea-config.json"],
      tempDir
    );

    // 获取当前 node.exe 路径
    const nodePath = process.execPath;

    if (!existsSync(buildDir)) mkdirSync(buildDir, { recursive: true });

    const seaExe = join(buildDir, "md-cli-v22.exe");
    if (existsSync(seaExe)) {
      try {
        rmSync(seaExe, { force: true });
      } catch (e) {
        console.warn(`⚠️  无法删除旧文件，尝试重命名...`);
        const backupName = join(buildDir, `md-cli-v22-old-${Date.now()}.exe`);
        try {
          const { execSync } = await import("child_process");
          execSync(`move /Y "${seaExe}" "${backupName}"`, { shell: true });
        } catch (e2) {
          throw new Error(`无法移除旧文件，请手动删除: ${seaExe}`);
        }
      }
    }

    // 复制 node.exe
    copyFileSync(nodePath, seaExe);

    // 注入 SEA blob
    await runCommand(
      "npx",
      [
        "postject",
        seaExe,
        "NODE_SEA_BLOB",
        join(tempDir, "sea-prep.blob"),
        "--sentinel-fuse",
        "NODE_SEA_FUSE_fce680ab2cc467b6e072b8b5df1996b2",
      ],
      tempDir
    );

    // 6. 复制运行时文件到 build 目录
    console.log("\n📦 步骤 6/6: 复制运行时文件...");
    const buildNodeModules = join(buildDir, "node_modules");
    if (existsSync(buildNodeModules))
      rmSync(buildNodeModules, { recursive: true, force: true });
    copyDirRecursive(join(tempDir, "node_modules"), buildNodeModules, [
      ".package-lock.json",
    ]);

    copyDirRecursive(join(tempDir, "dist-cli"), join(buildDir, "dist-cli"));
    copyDirRecursive(join(tempDir, "dist"), join(buildDir, "dist"));
    if (existsSync(join(tempDir, "public"))) {
      copyDirRecursive(join(tempDir, "public"), join(buildDir, "public"));
    }
    copyFileSync(join(tempDir, "package.json"), join(buildDir, "package.json"));

    // 验证
    if (existsSync(seaExe)) {
      const size = statSync(seaExe).size;
      console.log(`\n📦 可执行文件大小: ${(size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`📍 位置: ${seaExe}`);
    } else {
      throw new Error("可执行文件不存在");
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 Windows 程序构建成功!");
    console.log("\n💡 使用方法:");
    console.log(`   将 ${buildDir} 整个目录复制到目标机器`);
    console.log("   双击 md-cli-v22.exe 即可启动");
    console.log("");
  } catch (err) {
    console.error("\n❌ 构建失败:", err.message);
    console.error(err.stack);
    process.exit(1);
  } finally {
    if (tempDir && existsSync(tempDir)) {
      console.log("\n🧹 清理临时目录...");
      try {
        rmSync(tempDir, { recursive: true, force: true });
        console.log("✅ 清理完成");
      } catch (e) {
        console.warn("⚠️  清理临时目录失败:", e.message);
      }
    }
  }
}

build();

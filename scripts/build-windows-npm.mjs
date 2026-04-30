#!/usr/bin/env node

/**
 * 使用 npm 创建隔离的 node_modules 来打包 Windows exe
 *
 * 问题：pnpm 的符号链接结构与 pkg 不兼容
 * 解决：在临时目录使用 npm 安装扁平化的 node_modules
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
    console.log("🚀 开始构建 Windows 可执行程序\n");
    console.log("=".repeat(60));

    // 1. 确保 web 构建产物存在
    console.log("\n📦 步骤 1/5: 检查 Web 构建产物...");
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
    console.log("\n📋 步骤 2/5: 创建隔离的 npm 环境...");
    const tempBase = join(os.tmpdir(), "md-cli-pkg");
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
    // 复制入口包装文件（显式 require ESM-only 依赖）
    if (existsSync(join(cliDir, "entry-wrapper.cjs"))) {
      copyFileSync(
        join(cliDir, "entry-wrapper.cjs"),
        join(tempDir, "entry-wrapper.cjs")
      );
    }

    // 创建 package.json（固定版本，无 pnpm catalog）
    const pkg = {
      name: "@doocs/md-cli",
      version: "2.1.3",
      type: "commonjs",
      main: "entry-wrapper.cjs",
      bin: { "md-cli": "entry-wrapper.cjs" },
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
        "@csstools/css-calc": "^3.0.0",
        "@csstools/css-color-parser": "^4.0.0",
        "@asamuzakjp/css-color": "^4.1.0",
        cssstyle: "^5.0.0",
      },
      devDependencies: {
        "@yao-pkg/pkg": "^6.14.2",
      },
      pkg: {
        assets: ["dist/**/*", "public/**/*"],
        scripts: ["entry-wrapper.cjs", "dist-cli/**/*.cjs"],
        targets: ["node22-win-x64"],
        outputPath: "build",
        compress: "Brotli",
      },
    };

    writeFileSync(join(tempDir, "package.json"), JSON.stringify(pkg, null, 2));
    console.log("✅ 临时目录已准备");

    // 3. 使用 npm 安装依赖
    console.log("\n📥 步骤 3/5: 使用 npm 安装依赖...");
    await runCommand("npm", ["install", "--no-audit", "--no-fund"], tempDir);
    console.log("✅ 依赖安装完成");

    // 4. 使用 pkg 打包
    console.log("\n🔨 步骤 4/5: 使用 @yao-pkg/pkg 打包...");
    if (!existsSync(buildDir)) mkdirSync(buildDir, { recursive: true });

    await runCommand(
      "npx",
      [
        "@yao-pkg/pkg",
        ".",
        "--targets",
        "node22-win-x64",
        "--compress",
        "Brotli",
        "--options",
        "max-old-space-size=4096",
        "--public-packages",
        "postcss-calc,postcss-custom-properties,@csstools/*,@asamuzakjp/*,cssstyle,path-data-parser,points-on-curve,points-on-path,@iconify/*",
        "--output",
        join(buildDir, "md-cli-v22.exe"),
      ],
      tempDir
    );

    // 5. 验证
    console.log("\n✅ 步骤 5/5: 验证结果...");
    const exePath = join(buildDir, "md-cli-v22.exe");
    if (existsSync(exePath)) {
      const size = statSync(exePath).size;
      console.log(`📦 文件大小: ${(size / 1024 / 1024).toFixed(2)} MB`);
      console.log(`📍 位置: ${exePath}`);
    } else {
      throw new Error("打包产物不存在");
    }

    console.log("\n" + "=".repeat(60));
    console.log("🎉 Windows 程序构建成功!");
    console.log("\n💡 使用方法:");
    console.log("   双击 md-cli-v22.exe 即可启动");
    console.log("");
  } catch (err) {
    console.error("\n❌ 构建失败:", err.message);
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

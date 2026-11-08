# AGENTS.md

本项目是一个 pnpm workspace monorepo，主要目标是把 Markdown 渲染为适合公众号、Web 预览、CLI/API、MCP、插件等多端复用的 HTML。处理代码时优先保持各端渲染链路一致，不要只修单一入口。

## 项目结构

- `apps/web`：Vue/WXT 前端编辑器和浏览器插件入口。编辑、预览、复制、导出等交互主要在 `src/components`、`src/stores` 和 `src/utils`。
- `packages/core`：Markdown 渲染核心，包含 marked 扩展、主题应用、HTML 后处理、导出辅助逻辑。这里的行为会影响 Web、CLI/API、MCP 等多端。
- `packages/shared`：共享配置、主题列表、主题 CSS、类型定义和编辑器常量。新增主题时要同步主题 CSS、主题枚举/选项和相关导出。
- `packages/md-cli`：CLI 与 Express API 服务，`start-api.bat` 走这里启动 `/md` 页面和 API 渲染能力。
- `packages/mcp-server`：MCP 服务封装，主题能力需要和 CLI/API 的渲染入口保持一致。
- `apps/vscode`、`apps/utools`：额外客户端入口，涉及共享渲染逻辑时要注意不要破坏这些端。

## 渲染架构

- `packages/core` 是 Markdown 到 HTML 的核心事实来源；不要在 Web、CLI、MCP 中各自实现一套不一致的渲染规则。
- `packages/shared/src/configs/theme-css` 存放主题 CSS，`packages/shared/src/configs/theme.ts` 和主题选项需要与 CSS 文件保持同步。
- 主题 CSS 中的自定义块通常通过 `/* @renderer ... */` 声明标题、容器或特殊节点渲染器。修改这类主题时要验证 SVG、标题、图片和表格的真实 HTML 输出。
- Web 预览中可以为微信域图片使用代理，避免预览防盗链；复制公众号 HTML、导出 HTML/PDF、CLI/API/MCP 渲染必须保留原始图片 URL。
- `renderStore.output` 应保存原始可复制 HTML；`renderStore.previewOutput` 只用于 Web 预览层。需要临时切换 DOM 输出时必须用 `try/finally` 恢复预览内容。

## 主题开发

- 新增主题至少检查这些位置：主题 CSS 文件、主题映射、主题下拉选项、CLI/API/MCP 可见主题列表和相关测试。
- 主题样式应兼顾公众号兼容性。避免依赖 Web 端独有的复杂交互；SVG、内联样式和表格样式要在复制后的 HTML 中仍能工作。
- 修改标题样式时同时检查 h1-h6、目录、复制模式和无样式导出是否出现结构破坏。
- Tech Blog 章节装饰使用 `@renderer h2` 的 `${decoration}` 插槽，由 core 的 `heading-decoration.ts` 共用选择 `h2-decoration-N`，缺少原图时选择 `h2-decoration`。01–07 保留原图 URL 的真实 `img`，之后用 `${counter2}` 文字编号；不能恢复为零高度空背景容器，也不能把预览代理地址写进复制或导出结果。新增模板插槽须先插值装饰、最后插入用户标题，避免把用户标题内容当作模板再次处理。
- Markdown 列表的显式点号/序号由 core 的 `list-item.ts` 统一生成到 `.list-marker`；Tech Blog 对 `li.listitem` 关闭原生 marker，保留绿色显式标记和嵌套缩进。不要同时显示原生 marker 和文字前缀；松散列表的首段须与标记同行。
- 表格、图片和 SVG 是最容易跨端失真的区域，变更后要用真实渲染结果验证，而不是只看 CSS。

## 验证命令

PowerShell 环境中 pnpm 可能受 trust policy 影响，必要时先设置：

```powershell
$env:pnpm_config_verify_deps_before_run='false'
$env:pnpm_config_trust_policy='off'
```

常用检查：

```powershell
pnpm --dir apps/web type-check
pnpm --dir apps/web build:only
```

主题或 API 改动还应按影响面补充：

```powershell
node packages/core/test/svg-fengshang-theme.check.mjs
node packages/core/test/tech-blog-theme.check.mjs
pnpm --dir packages/md-cli exec tsx ../core/test/tech-blog-render.check.ts
pnpm --dir packages/md-cli exec tsx ../core/test/list-markers.check.ts
.\start-api.bat
```

启动 API 后优先验证 `/md/` 页面可访问，并用 `/api/render` 或项目已有测试样例确认主题名可以渲染。

## 编辑规则

- 先读现有实现，再做小范围修改。优先复用已有 store、renderer、theme registry 和 utility。
- 不要提交本地截图、临时 HTML、手工验证输出和构建产物；需要保留证据时写进最终说明。
- 不要为了整理结构而移动大量文件，除非同时更新所有入口、导入和测试。
- 遇到已有未提交改动时，默认视为用户工作；只提交本次任务明确相关的文件。
- 提交前查看 `git diff --cached`，确认 staged 内容形成一个可以独立构建的改动集。

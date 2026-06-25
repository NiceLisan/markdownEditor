# Tech Blog Theme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add and register a TRAE-green technical blog theme with WeChat-compatible typography, code blocks, callouts, and tables.

**Architecture:** Keep the feature entirely inside the existing shared theme configuration. A raw CSS file defines presentation, `theme-css/index.ts` registers its content, and `theme.ts` exposes the theme in the selector. A focused core test reads the real CSS and validates the public theme contracts without changing renderer behavior.

**Tech Stack:** CSS, TypeScript, Vitest, pnpm workspace

---

## Tasks

### Task 1: Add the failing theme contract test

**Files:**

- Create: `packages/core/test/tech-blog-theme.test.ts`

- [ ] **Step 1: Write the failing test**

Create a Vitest test that imports `themeMap`, `themeOptionsMap`, and `themeOptions`, then asserts:

```javascript
expect(themeMap).toHaveProperty('tech_blog')
expect(themeOptionsMap.tech_blog).toMatchObject({
  label: '技术博客',
  value: 'tech_blog',
})
expect(themeOptions).toContainEqual(expect.objectContaining({
  label: '技术博客',
  value: 'tech_blog',
}))
expect(themeMap.tech_blog).toContain('#10bc61')
expect(themeMap.tech_blog).toContain('line-height: 2')
expect(themeMap.tech_blog).toContain('overflow-x: auto')
expect(themeMap.tech_blog).toContain('border-collapse: collapse')
expect(themeMap.tech_blog).toContain('word-break: break-word')
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```powershell
pnpm exec vitest run packages/core/test/tech-blog-theme.test.ts
```

Expected: FAIL because `tech_blog` is not registered.

### Task 2: Implement and register the theme

**Files:**

- Create: `packages/shared/src/configs/theme-css/tech_blog.css`
- Modify: `packages/shared/src/configs/theme-css/index.ts`
- Modify: `packages/shared/src/configs/theme.ts`

- [ ] **Step 1: Add the CSS theme**

Implement the approved design using the exact primary color `#10bc61`. Cover headings, paragraphs, lists, links, emphasis, blockquotes, alerts, inline code, fenced code, images, captions, horizontal rules, tables, footnotes, formulas, and markup helpers.

- [ ] **Step 2: Register the raw CSS**

Add:

```text
import techBlogCSS from "./tech_blog.css?raw"
```

and:

```text
tech_blog: techBlogCSS,
```

to `themeMap`.

- [ ] **Step 3: Add selector metadata**

Add this entry to both `themeOptionsMap` and `themeOptions`:

```text
{
  label: "技术博客",
  value: "tech_blog",
  desc: "TRAE",
}
```

- [ ] **Step 4: Run the focused test**

Run:

```powershell
pnpm exec vitest run packages/core/test/tech-blog-theme.test.ts
```

Expected: PASS.

### Task 3: Verify and commit

**Files:**

- Verify all files from Tasks 1 and 2.

- [ ] **Step 1: Run focused and existing theme tests**

Run:

```powershell
pnpm exec vitest run packages/core/test/tech-blog-theme.test.ts packages/core/test/simple-gray-theme.test.ts packages/core/test/space-theme.test.ts
```

Expected: all selected tests pass.

- [ ] **Step 2: Run TypeScript validation**

Run:

```powershell
pnpm type-check
```

Expected: exit code 0.

- [ ] **Step 3: Review the scoped diff**

Run:

```powershell
git diff --check
git diff -- docs/superpowers packages/core/test/tech-blog-theme.test.ts packages/shared/src/configs/theme-css packages/shared/src/configs/theme.ts
```

Expected: no whitespace errors and no unrelated edits.

- [ ] **Step 4: Commit**

Stage only the planned files and commit:

```powershell
git add docs/superpowers/specs/2026-06-25-tech-blog-theme-design.md docs/superpowers/plans/2026-06-25-tech-blog-theme.md packages/core/test/tech-blog-theme.test.ts packages/shared/src/configs/theme-css/tech_blog.css packages/shared/src/configs/theme-css/index.ts packages/shared/src/configs/theme.ts
git commit -m "feat: add tech blog theme"
```

# Tech Blog Theme Design

## Goal

Add a reusable WeChat public-account technical blog theme inspired by the local reference file `docs/TRAE技术博客主题.html`. The theme uses TRAE's signature green as its visual identity while remaining suitable for general technical articles.

## Scope

- Add `packages/shared/src/configs/theme-css/tech_blog.css`.
- Register the theme under the key `tech_blog`.
- Expose it in the theme selector as `技术博客`.
- Add a focused automated test for registration and key CSS contracts.
- Do not modify existing theme styles or renderer behavior.

## Visual Language

- Primary color: `#10bc61`.
- Body: 15px, line-height 2, dark gray text, justified alignment, generous spacing.
- H1: centered and prominent with a restrained green accent.
- H2: 21px green heading with ample vertical whitespace.
- H3: green left border and subtle light-gray-to-transparent background.
- H4-H6: progressively quieter green-accented hierarchy.
- Blockquotes and callouts: light-gray cards, 10px rounded corners, comfortable padding.
- Inline code: pale green background with dark green text.
- Code blocks: dark editor-style surface with readable monospace text.
- Images: full-width safe, lightly rounded, with restrained shadow.

## Table Compatibility

Tables use only broadly supported CSS suitable for WeChat article output:

- `width: 100%` and `border-collapse: collapse`.
- Green header cells with white text.
- Visible light-gray cell borders.
- Alternating row backgrounds.
- Normal wrapping and `word-break: break-word` for long content.
- A minimum table width and horizontal overflow support where the renderer/container preserves it.
- No dependency on advanced selectors or `color-mix()`.

## Verification

- A focused Vitest test must fail before registration and CSS are added.
- The test verifies registration, selector metadata, TRAE green, typography, code block styling, and table compatibility declarations.
- Run the focused test and the shared/core TypeScript checks before committing.

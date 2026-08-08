# CSS Cascade Audit

> **Task:** G2-F3.5 R0 Phase D  
> **Audit date:** 2026-08-08

## Global CSS Files

| File | Layer | Purpose |
|---|---|---|
| `src/styles/tokens.css` | unlayered (CSS custom properties) | Graphite Canvas `--gc-*` design tokens |
| `src/styles/globals.css` | declares layer order | Cascade management + Tailwind + Astryx imports |
| `@astryxdesign/theme-neutral/theme.css` | `@layer reset` | Astryx neutral theme reset + tokens |
| `@astryxdesign/core/astryx.css` | `@layer astryx-base` | Astryx component compiled StyleX styles |

## Layer Order (low → high priority)

```css
@layer reset, tw-preflight, astryx-reset, astryx-base, astryx-theme, graphite-base, tw-components, tw-utilities;
```

| Layer | Content | Priority |
|---|---|---|
| `reset` | (reserved for future CommerceCanvas reset) | lowest |
| `tw-preflight` | Tailwind v3 `@tailwind base` (preflight) | low |
| `astryx-reset` | Astryx theme-neutral reset (h1-h6 font reset) | low |
| `astryx-base` | Astryx component styles (StyleX compiled) | medium |
| `astryx-theme` | Astryx theme tokens | medium |
| `graphite-base` | Graphite Canvas global base (body, scrollbar, mono) | medium-high |
| `tw-components` | Tailwind components (`gc-section-label` etc.) | high |
| `tw-utilities` | Tailwind utilities (layout, flex, spacing) | highest |

## Why No Silent Override

1. **Tailwind preflight is explicitly layered** (`@layer tw-preflight`), so it cannot override Astryx or Graphite unlayered styles
2. **Astryx reset** (`@layer reset` in theme.css) only resets heading fonts within `[data-astryx-theme="neutral"]` scope
3. **Graphite Canvas base** (body background, scrollbar, mono font) is in `@layer graphite-base`, higher priority than Astryx base
4. **Tailwind utilities** remain highest priority for layout (flex, gap, padding)
5. **No unlayered reset** exists — all resets are in explicit layers

## Verification

- Build passes with 1627 modules
- 151/151 tests pass (no visual regression in jsdom)
- Tailwind utilities still work (layout components render correctly)
- Astryx components render with their own styles (verified in Smoke Test)

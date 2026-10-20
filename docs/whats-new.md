---
title: "What's New"
description: 'Release notes for @html2canvas/html2canvas since the fork from v1.4.1'
previousUrl: './proxy'
previousTitle: 'Proxy'
---

This page summarises every release since the fork from the original **html2canvas** project at
`v1.4.1`. Versions are listed newest-first.

---

## v1.14.0 — 2026-10-19

### Features

- **CSS `backdrop-filter`** — full support (`blur`, `brightness`, `contrast`, `drop-shadow`, `grayscale`, `hue-rotate`, `invert`, `opacity`, `saturate`, `sepia`; multiple functions)
- **CSS `mask` / `mask-image`** — images, all gradient types, multiple layers, `mask-size`, `mask-position`, `mask-repeat`, `mask-origin`, `mask-clip`, `mask-mode`, `mask-composite`; `-webkit-mask-*` fallback supported
- **CSS `outline`** — `outline-color`, `outline-style`, `outline-width`, `outline-offset`
- **`imageResolver` hook** — bypass CORS restrictions by providing a custom image-loading function
- **`onProgress` callback** — rendering progress events with phase and clone sub-step details

### Bug Fixes

- Lint errors in `mask-mode` and `mask-size` resolved

---

## v1.13.0 — 2026-09-28

### Bug Fixes

- **Gradients** — double-position color stops (e.g. `red 0% 25%`) now parse and render correctly
- **List markers** — `::marker` `font-size` honoured when drawing list markers; markers now align with the first text line; `linear-gradient` `list-style-image` markers supported
- **Group opacity** — elements with `opacity < 1` composited correctly on an offscreen surface, eliminating bleed-through artefacts

---

## v1.12.0 — 2026-09-04

### Features

- **Borders** — `groove`, `ridge`, `inset`, `outset` border styles; `<fieldset>`/`<legend>` top-border gap
- **Image cache** — `Cache.clear()` method; `clearImageCache` option; LRU-bounded cache via `maxCacheSize`; `isResourceSameOrigin` override option
- **`onError` callback** — notified when any resource fails to load
- **`image-rendering`** — `pixelated`, `crisp-edges`, `smooth` and vendor prefixes respected
- **Ruby annotations** — `ruby-align` and `ruby-position` rendered
- **`-webkit-line-clamp`** — truncates to N lines with a trailing ellipsis
- **`unicode-bidi`** — `bidi-override` for `<bdo>` elements

### Bug Fixes

- Border corner seams on solid borders eliminated
- Document clone serialised with a valid doctype (keeps standards mode)
- `<select>` list-box rendering corrected across browser engines

### Performance

- Rasterised `linear-gradient` canvases cached and reused
- Resized background images memoised
- Opt-in viewport culling of offscreen nodes (`viewportCulling` option)
- Offscreen canvas pool reduces GC pressure
- Native `ctx.letterSpacing` used where available with per-grapheme fallback

---

## v1.11.0 — 2026-08-31

### Features

- **Pseudo-elements** — `::first-letter`, `::first-line`, `::placeholder`, `::marker`
- **`<canvas>` elements** — actual pixel content of the canvas captured
- **`<details>` / `<summary>`** — open/closed state respected
- **`background-attachment`** — `scroll`, `fixed`, `local`
- **`<object>` element** — rendered as image when `data` points to an image; fallback children otherwise
- **`border-image`** — full shorthand plus `border-image-source`, `slice`, `width`, `outset`, `repeat`
- **`object-position`** — controls the alignment of replaced elements

### Bug Fixes

- `::placeholder` improved; input text vertical centering fixed
- Per-layer `background-clip` with `border-radius` applied correctly
- `<q>` element `open-quote`/`close-quote` rendered via `quotes: auto`

---

## v1.10.0 — 2026-08-28

### Features

- **`text-decoration-style: wavy`** — continuous wavy underlines
- **`text-decoration-inset`** and **`text-underline-offset`** / **`text-underline-position`**
- **CSS `zoom`** — accumulated nested zoom supported
- **`box-decoration-break`** — `slice` and `clone` for inline elements

### Bug Fixes

- `linear-gradient` offscreen canvas height restored
- Text-decoration lines drawn once per visual line (performance and visual correctness)

---

## v1.9.0 — 2026-08-23

### Features

- **CSS `clip-path`** — `inset()`, `circle()`, `ellipse()`, `polygon()`, `path()`; legacy `clip: rect()` also supported
- **Full CSS `transform`** — all 2D functions; 3D functions projected to 2D
- **Additional gradient types** — `repeating-linear-gradient`, `repeating-radial-gradient`, `conic-gradient`, `repeating-conic-gradient`

### Bug Fixes

- Stylesheet rules applied correctly in Chromium iframe clone
- `iframeLoader` race condition in Firefox resolved
- `getComputedStyle` now uses the element's own `window`

---

## v1.8.0 — 2026-08-22

### Features

- **`background-blend-mode`** — all blend modes
- **`background-clip: text`**
- **CSS `filter`** — `blur`, `brightness`, `contrast`, `drop-shadow`, `grayscale`, `hue-rotate`, `invert`, `opacity`, `saturate`, `sepia`; rendered via offscreen canvas
- **`mix-blend-mode`** — all blend modes
- **`text-decoration-style`** and **`text-decoration-thickness`**
- **`text-transform`** — `full-width`, `full-size-kana`, `math-auto`

### Bug Fixes

- `text-shadow` and `text-decoration-color` rendering improved

---

## v1.7.1 — 2026-08-20

### Build

- Proper TypeScript type declarations added to build output
- Unbundled ESM build added to deduplicate **colorjs.io** in TypeScript projects

### Performance

- Hot paths in CSS parsing, DOM cloning, and rendering optimised
- Bundle size reduced via minimal **colorjs.io** import

---

## v1.7.0 — 2026-08-20

### Features

- **`writing-mode`** — `vertical-rl`, `vertical-lr`, `sideways-rl`, `sideways-lr` on text and list markers
- **Form elements** — `<input type="range">`, `<meter>`, `<progress>` rendered
- **Extended color functions** — `oklab()`, `oklch()`, `lch()`, `lab()`, `hwb()`, `hsl()`, `color()`, `color-mix()` via [colorjs.io](https://colorjs.io/)
- **`calc()`** — supported in CSS length and other numeric values

### Bug Fixes

- **`<textarea>`** — multi-line wrapping on word boundaries, explicit newlines, `padding`, `line-height`, `letter-spacing`, `scrollTop`; long words break character by character; break after hyphens
- **`letter-spacing`** — inter-character gaps rendered and wrap-budget calculated correctly
- **`box-shadow`** — Bézier curves rebuilt with spread-adjusted `border-radius`
- **Text baseline** — measured font baseline used for consistent cross-browser vertical alignment
- **CSS custom properties** — performance issue fixed; associated `box-shadow` regression resolved
- **SVG** — embedded images inside `<svg>` elements render correctly

### Infrastructure

- Documentation migrated from Gatsby to **Astro**
- Bundler migrated from webpack to **Rollup**

---

## v1.6.3 — 2024-07-18

### Bug Fixes

- Build for browsers fixed
- `TextNode` content no longer overlooked during rendering
- Characters moving up in non-Firefox browsers corrected
- `textDecorationLine` offset on high-resolution devices corrected (uses element heights)

---

## v1.6.2 — 2024-06-15

### Bug Fixes

- Underline rendering fixed
- `renderBackgroundImage` no longer crashes on zero-width or zero-height images
- Font loading fixed
- Concurrent invocations now clean up all created iframes on completion
- CORS and browser-extension image handling fixed
- Global cache used; images retried after cache eviction

---

## v1.6.1 — 2024-06-04

### Features

- CSS `lch()` color function parsed and rendered

### Bug Fixes

- Image loading in Firefox fixed

---

## v1.6.0 — 2024-05-08

> First release after forking to `@html2canvas/html2canvas`

### Features

- **`object-fit`** for `<img>` elements (`contain`, `cover`, `fill`, `scale-down`, `none`)
- `style.content` accepts the `"normal"` value
- Vertical text alignment improvements

### Bug Fixes

- Text alignment issues resolved
- Rendering order of `transform` and `clip` effects corrected
- `object-fit` on SVG images in Safari fixed
- Deprecated `String.prototype.substr()` replaced
- `<base>` tag added to iframe clone to fix relative URL resolution
- Duplicate `LIST_STYLE_TYPE` enum value removed
- `box-shadow` without `inset`, and blur-radius rendering fixed
- `willReadFrequently` attribute set on canvases to suppress Chrome warnings

# Releases Backup for html2canvas-next

This file contains all releases information from the original html2canvas repo.

## v1.8.0 (2026-08-22)

### Features
* add background-blend-mode support
* add background-clip: text support
* add full CSS filter property support (drop-shadow, blur, brightness, contrast, grayscale, hue-rotate, invert, opacity, saturate, sepia)
* add mix-blend-mode support
* add text-decoration-style and text-decoration-thickness support
* add text-transform full-width, full-size-kana & math-auto

### Bug Fixes
* add site and base to astro config for github.io/html2canvas subpath
* **filter:** render all CSS filters via offscreen canvas
* improve text-shadow and text-decoration-color rendering
* prefix all links and assets with /html2canvas base path
* rename webpack.config to .cjs, lazy-load iOS deps in karma, remove Safari iOS CI job
* update jest matchers to use toHaveBeenCalled() with jest.Mock cast

---

## v1.7.1 (2026-08-20)

### build
- add proper TypeScript type declarations to build output
- add unbundled ESM build to deduplicate colorjs.io in TS projects

### perf
- optimize hot paths in CSS parsing, DOM cloning, and rendering
- reduce bundle size by using minimal colorjs.io import

---

## v1.7.0 (2026-08-20)

### feat
- **writing-mode**: add support for `writing-mode: vertical-rl`, `vertical-lr`, `sideways-rl` and `sideways-lr` on text and list markers
- **input**: add rendering support for `<input type="range">`, `<meter>` and `<progress>` elements
- **color**: add support for `oklab()`, `oklch()`, `lch()`, `lab()`, `hwb()`, `hsl()`, `color()` and `color-mix()` CSS color functions via color.io
- **css**: add `calc()` support in CSS values

### fix
- **textarea**: implement proper multi-line rendering — text now wraps on word boundaries, respects explicit newlines, `padding`, `line-height`, `letter-spacing` and `scrollTop`
- **textarea**: long words that exceed the box width now break character by character, matching browser behaviour
- **textarea**: break opportunities are now recognized after hyphens
- **letter-spacing**: fix inter-character spacing not being applied when rendering text with `letter-spacing`
- **letter-spacing**: fix wrap-budget calculation to account for `letter-spacing`
- **box-shadow**: rebuild Bézier curves with spread-adjusted border-radius
- **text**: align text and list markers using measured font baseline for consistent cross-browser vertical positioning
- **css**: resolve CSS custom properties performance issue and fix associated box-shadow rendering regression
- **svg**: SVG elements with embedded images now render correctly

---

## v1.6.3 (2024-07-18)

### fix
- Fix build for browsers
- Fix the issue of TextNode content being overlooked
- Fixed an issue with characters moving up in non-Firefox
- Correcting the issue of textDecorationLine displaying offsets on high-resolution devices by utilizing element heights.

---

## v1.6.2 (2024-06-14)

### fix
- Fix underline
- Fix renderBackgroundImage When receiving an image with 0 width or height
- Fix font loading
- When running async with many invocations cleanup all iframes
- Fix cors and browser extension image handling
- Use global cache and retry image after deleting from cache

---

## v1.6.1 (2024-06-03)

### feat
- Parse CSS lch support

### fix
- Loading images in Firefox

---

## v1.6.0 (2024-05-08)

### feat
- Add support for css style `object-fit` of `<img>` elements
- Accept "normal" value for style.content
- Update canvas-renderer.ts to fix Vertical alignment issues with text

### fix
- Text alignment issues
- The rendering order of transform and clip effects
- On Safari, the object-fit property for SVG images is not effective
- Replace deprecated String.prototype.substr()
- add <base> to fix relative error in iframe
- Avoid duplicate enum value of LIST_STYLE_TYPE
- Resolve that box shadow cannot be displayed without inset attribute, and No blur effect when blur radius is set
- Set the document clone iframe container's size via the style attribute
- "Canvas2D: Multiple readback operations using getImageData are faster with the willReadFrequently attribute set to true" warning in chrome browser

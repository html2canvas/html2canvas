# Changelog
All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.10.0](https://github.com/html2canvas/html2canvas/compare/v1.9.0...v1.10.0) (2026-08-28)

### Features

* add Playwright visual regression tests for all reftest ([3e7a959](https://github.com/html2canvas/html2canvas/commit/3e7a95942aaeaf6009c5cd8141afc0494a05a1f1))
* add text-decoration-style wavy, text-decoration-inset, text-underline-offset & text-underline-position support ([64f0f77](https://github.com/html2canvas/html2canvas/commit/64f0f775403e73c74b52a12f893de7d398bfdc21))
* **css:** add CSS zoom property support ([1fb273e](https://github.com/html2canvas/html2canvas/commit/1fb273ec4dd608bd23f20116268b1646c3733fbc))
* implement box-decoration-break (slice & clone) for inline elements ([3879e24](https://github.com/html2canvas/html2canvas/commit/3879e244fdc18d13db3311bab3460047c58f42b4))

### Bug Fixes

* **background:** restore missing canvas.height for linear-gradient offscreen canvas ([c783f00](https://github.com/html2canvas/html2canvas/commit/c783f008114bca7cac9bc98390b8bae4175715b3))
* exclude tests/visual/ from Jest to avoid Playwright import conflict ([06f8e15](https://github.com/html2canvas/html2canvas/commit/06f8e154f266dff886810fd3dd6e0633b488506c))
* exclude tests/visual/ from Jest to avoid Playwright import conflict ([089cc7a](https://github.com/html2canvas/html2canvas/commit/089cc7a9c064d1b8e2bbe12f8ec31ca49ca59167))
* include src/global.d.ts in tests tsconfig to resolve textDecorationInset TS2551 error ([30799f3](https://github.com/html2canvas/html2canvas/commit/30799f3b1e35b8fdde9ae3ca8061aa325e49a3c6))
* regenerate snapshots with Docker Playwright and add docker test scripts ([542cfda](https://github.com/html2canvas/html2canvas/commit/542cfda8f98c2a5b391f5adb07209428f01b828d))
* run visual tests in Playwright Docker container for consistent snapshots ([3a98121](https://github.com/html2canvas/html2canvas/commit/3a98121cfaa499adca71be7e4ba43f8891731452))
* set explicit font-size on overflow-wrap test to prevent dimension drift across environments ([68e079d](https://github.com/html2canvas/html2canvas/commit/68e079dcab2977ad4bf499ef835aa6529985754f))
* **text-decoration:** continuous WAVY and line-level inset ([4c398db](https://github.com/html2canvas/html2canvas/commit/4c398db3fb3634512905ac6ca60c580dd1a46ed8))
* wait for embedded fonts to load before Playwright capture ([ea4c7d7](https://github.com/html2canvas/html2canvas/commit/ea4c7d7b1c9f5280836b827670c3c16e9fede0a4))

### Performance Improvements

* draw text-decoration lines once per visual line instead of per word ([bb5de5b](https://github.com/html2canvas/html2canvas/commit/bb5de5b397cdd9c8e37bf1dbb43a180a0e691dd2))

## [1.9.0](https://github.com/html2canvas/html2canvas/compare/v1.8.0...v1.9.0) (2026-08-23)

### Features

* add CSS clip-path and clip:rect() support ([1472db0](https://github.com/html2canvas/html2canvas/commit/1472db063d465a3e7ef330549d51a89c346793a3))
* add full CSS transform function support ([406573a](https://github.com/html2canvas/html2canvas/commit/406573a2d13935ae25a36d4e61a61163f55eb2ea))
* add support for repeating-linear-gradient, repeating-radial-gradient, conic-gradient and repeating-conic-gradient ([27bc1c6](https://github.com/html2canvas/html2canvas/commit/27bc1c60364ad8fe36215bcf3f0c83a56e5f9c5d))
* **www:** refactor styles, remove Carbon, add Examples page ([44581a6](https://github.com/html2canvas/html2canvas/commit/44581a68288d8318f2c1829be7644d781a1decc0))

### Bug Fixes

* apply stylesheet rules correctly in Chromium iframe clone ([6822053](https://github.com/html2canvas/html2canvas/commit/68220538987d61d17a067e9a4610c1eae0a5701b))
* CI — dist artifact before www/npm install, Safari continue-on-error ([3533d21](https://github.com/html2canvas/html2canvas/commit/3533d21ac48576a523e86c4525e454b64fbe5ec3))
* CI fixes — prettier, webpack tsconfig, puppeteer executablePath, Node versions ([f9e67f9](https://github.com/html2canvas/html2canvas/commit/f9e67f9a5796cf532b3bf33fd014075cb38384c2))
* remove Safari macOS from CI — Karma v6 crashes on arm64, is deprecated ([d789faf](https://github.com/html2canvas/html2canvas/commit/d789fafcbc0b4603b70da72a4c6df8fc26990f97))
* resolve iframeLoader race condition in Firefox ([5d59f5c](https://github.com/html2canvas/html2canvas/commit/5d59f5cd67b48dd7f62238e80db479329a4eebca))
* use element's own window for getComputedStyle in ElementContainer ([b89847c](https://github.com/html2canvas/html2canvas/commit/b89847c69c6c0b977687b6d43cef2dacffabb4e8))

## [1.8.0](https://github.com/html2canvas/html2canvas/compare/v1.7.1...v1.8.0) (2026-08-22)

### Features

* add background-blend-mode support ([32ef597](https://github.com/html2canvas/html2canvas/commit/32ef59741670294f32b1142dfb1685b558f6dd7e))
* add background-clip: text support ([6ffc3a2](https://github.com/html2canvas/html2canvas/commit/6ffc3a223ec51bb3b5c7355cda15d80974e6fd79))
* add full CSS filter property support (drop-shadow, blur, brightness, contrast, grayscale, hue-rotate, invert, opacity, saturate, sepia) ([012b161](https://github.com/html2canvas/html2canvas/commit/012b161a0c8460dc0d3097be5839bd1a12b766ef))
* add mix-blend-mode support ([c8ba021](https://github.com/html2canvas/html2canvas/commit/c8ba02194023eecfa49bbd20820ad7f239efa0c3))
* add text-decoration-style and text-decoration-thickness support ([c6ba375](https://github.com/html2canvas/html2canvas/commit/c6ba3759801ee5d28684fac105294e93d9e36b1c))
* add text-transform full-width, full-size-kana & math-auto ([3da2f5f](https://github.com/html2canvas/html2canvas/commit/3da2f5fb6c7cafd4940ef4e9fb1598da9c2e76f5))

### Bug Fixes

* add site and base to astro config for github.io/html2canvas subpath ([68f563e](https://github.com/html2canvas/html2canvas/commit/68f563e08016a9eb8add6a96864f8f6ec5b7fc23))
* **filter:** render all CSS filters via offscreen canvas ([739f0f8](https://github.com/html2canvas/html2canvas/commit/739f0f8f44902e8a590a35b247278e53f397ae8b))
* improve text-shadow and text-decoration-color rendering ([b5f9aa2](https://github.com/html2canvas/html2canvas/commit/b5f9aa25131b4e9d4d0508c902db2901dc3e44c1))
* prefix all links and assets with /html2canvas base path ([84101e0](https://github.com/html2canvas/html2canvas/commit/84101e04e014be518872fbbf5dbb36b7c4378a60))
* rename webpack.config to .cjs, lazy-load iOS deps in karma, remove Safari iOS CI job ([0103dae](https://github.com/html2canvas/html2canvas/commit/0103dae1bcc01d09309d80f6d4715317705f194e))
* update jest matchers to use toHaveBeenCalled() with jest.Mock cast ([7f63ed5](https://github.com/html2canvas/html2canvas/commit/7f63ed567eb97837e58d10b866c466f4edf340ec))

# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.7.1](https://github.com/html2canvas/html2canvas/compare/v1.7.0...v1.7.1) (2026-08-20)

### build

- add proper TypeScript type declarations to build output ([f677a13](https://github.com/html2canvas/html2canvas/commit/f677a131344a1facf43b0c26a6b878deb90266a2))
- add unbundled ESM build to deduplicate colorjs.io in TS projects ([613608c](https://github.com/html2canvas/html2canvas/commit/613608c6d319315297721f0936233cba044a6e2e))

### perf

- optimize hot paths in CSS parsing, DOM cloning, and rendering ([6b1a9ba](https://github.com/html2canvas/html2canvas/commit/6b1a9ba6b6763c11414c594cb81f2d67ee0e3e6d))
- reduce bundle size by using minimal colorjs.io import ([b2b9f82](https://github.com/html2canvas/html2canvas/commit/b2b9f82a689b5945b1b6f42cdae1234b7d8ff1bc))

## [1.7.0](https://github.com/html2canvas/html2canvas/compare/v1.6.3...v1.7.0) (2026-08-20)

### feat

- **writing-mode**: add support for `writing-mode: vertical-rl`, `vertical-lr`, `sideways-rl` and `sideways-lr` on text and list markers
- **input**: add rendering support for `<input type="range">`, `<meter>` and `<progress>` elements
- **color**: add support for `oklab()`, `oklch()`, `lch()`, `lab()`, `hwb()`, `hsl()`, `color()` and `color-mix()` CSS color functions via color.io ([4cb3d76](https://github.com/html2canvas/html2canvas/commit/4cb3d76))
- **css**: add `calc()` support in CSS values ([64d5b2a](https://github.com/html2canvas/html2canvas/commit/64d5b2a))

### fix

- **textarea**: implement proper multi-line rendering — text now wraps on word boundaries, respects explicit newlines, `padding`, `line-height`, `letter-spacing` and `scrollTop` ([2773452](https://github.com/html2canvas/html2canvas/commit/2773452))
- **textarea**: long words that exceed the box width now break character by character, matching browser behaviour
- **textarea**: break opportunities are now recognized after hyphens (e.g. `many-word` wraps after the dash)
- **letter-spacing**: fix inter-character spacing not being applied when rendering text with `letter-spacing` — characters were drawn without any gap between them
- **letter-spacing**: fix wrap-budget calculation to account for `letter-spacing` using `(n-1)` inter-character gaps, matching the browser's line-breaking model
- **box-shadow**: rebuild Bézier curves with spread-adjusted border-radius so spread correctly inflates/deflates rounded corners ([0b99c4c](https://github.com/html2canvas/html2canvas/commit/0b99c4c))
- **text**: align text and list markers using measured font baseline for consistent cross-browser vertical positioning ([908115a](https://github.com/html2canvas/html2canvas/commit/908115a))
- **css**: resolve CSS custom properties performance issue and fix associated box-shadow rendering regression ([7a51e66](https://github.com/html2canvas/html2canvas/commit/7a51e66))
- **svg**: SVG elements with embedded images now render correctly ([d5e7049](https://github.com/html2canvas/html2canvas/commit/d5e7049))

### test

- add `tests/reftests/text/letter-spacing.html` covering plain text, kerning pairs, block wrap, `input`, `textarea`, emoji and `text-align` combinations
- add `tests/reftests/text/textarea.html` covering word-wrap, padding, line-height, letter-spacing, newlines, long words, hyphens and kerning
- add `tests/reftests/native-elements/progress-meter-range.html` covering `<progress>`, `<meter>` and `<input type="range">` rendering
- add `tests/reftests/writing-mode/` — five reference tests for `horizontal-tb`, `vertical-rl`, `vertical-lr`, `sideways-rl` and `sideways-lr`

### chore

- migrate documentation site from Gatsby to Astro
- migrate bundler from webpack to rollup
- update README: remove proxy package reference, drop IE/experimental notes

## [1.6.3](https://github.com/html2canvas/html2canvas/compare/v1.6.2...v1.6.3) (2024-07-18)

### fix

- Fix build for browsers #7 (thanks @jamie-zaharopoulos-fh)
- Fix the issue of TextNode content being overlooke… #8 (thanks @xweiba)
- Fixed an issue with characters moving up in non-Firefox #9 (thanks @xweiba)
- Correcting the issue of textDecorationLine displaying offsets on high-resolution devices by utilizing element heights. #10 (thanks @xweiba)

## [1.6.2](https://github.com/html2canvas/html2canvas/compare/v1.6.1...v1.6.2) (2024-06-15)

### fix

- Fix underline ([b2911f3](https://github.com/html2canvas/html2canvas/commit/b2911f3f6cf4d0991716a07ff61d6d7fbfdf80df))
- Fix renderBackgroundImage When receiving an image with 0 width or height ([c7eb296](https://github.com/html2canvas/html2canvas/commit/c7eb296dbee488af46c63540de79fe44026ca85b))
- Fix font loading ([50a8365](https://github.com/html2canvas/html2canvas/commit/50a8365470dd7f2fc07acf7e959c8de3709d1fd3))
- When running async with many invocations cleanup all iframes ([724fe62](https://github.com/html2canvas/html2canvas/commit/724fe62e7e59c30e9bd212911b5408434781062c))
- Fix cors and browser extension image handling ([714c08f](https://github.com/html2canvas/html2canvas/commit/714c08fa9a406555da26c5b93008ae039527a13a))
- Use global cache and retry image after deleting from cache ([e359d90](https://github.com/html2canvas/html2canvas/commit/e359d90def9b2354508e240cb9c57ea26efab4b5))

## [1.6.1](https://github.com/html2canvas/html2canvas/compare/v1.6.0...v1.6.1) (2024-06-04)

### feat

- Parse CSS lch support ([6463cd6](https://github.com/html2canvas/html2canvas/commit/6463cd6921f26ffbd4d14f7096311bb139342928)), closes [#3174](https://github.com/niklasvh/html2canvas/issues/3174)

### fix

- Loading images in Firefox ([184e558](https://github.com/html2canvas/html2canvas/commit/184e5589570a733ea61a06522b9bf5b201a06874))

## [1.6.0](https://github.com/html2canvas/html2canvas/compare/v1.4.1...v1.6.0) (2024-05-08)

> Change repository to `@html2canvas/html2canvas`

> Merge form `acurrieclark/text-align-changes` & `wtto00/master`

### feat

- Add support for css style `object-fit` of `<img>` elements ([627dbac84](https://github.com/html2canvas/html2canvas/commit/627dbac84336d60f614131fee698af8e6028a085))
- Accept "normal" value for style.content ([a70cd49c3](https://github.com/html2canvas/html2canvas/commit/a70cd49c3434ec1ca47fe1427c3680f2df62aa1f))
- Update canvas-renderer.ts to fix Vertical alignment issues with text ([ad65ffb6](https://github.com/html2canvas/html2canvas/commit/ad65ffb6ae8faf20220fef7cb886d846fb24142d))

### fix

- Text alignment issues ([9db98f52](https://github.com/html2canvas/html2canvas/commit/9db98f529de8196f9b25da242b6468596416cb18))
- The rendering order of transform and clip effects ([18bef2f](https://github.com/html2canvas/html2canvas/commit/18bef2fb84f66f22c2522bce7ef2070d1c9c5c00))
- On Safari, the object-fit property for SVG images is not effective. ([55bfd47f](https://github.com/html2canvas/html2canvas/commit/55bfd47f2a1da39d715773cc06e09ae690118ab2))
- Replace deprecated String.prototype.substr() ([d83ba946](https://github.com/html2canvas/html2canvas/commit/d83ba9469882f828538c325077d8128a2b422707))
- add <base> to fix relative error in iframe ([4e6c022b](https://github.com/html2canvas/html2canvas/commit/4e6c022b3edd5a591f7d8ff6784d7bec9458609b))
- Avoid duplicate enum value of LIST_STYLE_TYPE ([fbab3ccf](https://github.com/html2canvas/html2canvas/commit/fbab3ccf5da04010c279690b174b648cf0f38516))
- Resolve that box shadow cannot be displayed without inset attribute,and No blur effect when blur radius is set ([a6651e38](https://github.com/html2canvas/html2canvas/commit/a6651e38a2a0bf2f6f163c87dc61d857f3f5e3df))
- Set the document clone iframe container's size via the style attribute ([9855c6c4](https://github.com/html2canvas/html2canvas/commit/9855c6c4f24607254a3e71b50508eebf27b19e70))
- "Canvas2D: Multiple readback operations using getImageData are faster with the willReadFrequently attribute set to true" warning in chrome browser ([1a7839db](https://github.com/html2canvas/html2canvas/commit/1a7839dbb613912fad93111bfa41a1e462815c15))
- Resolve that box shadow cannot be displayed without inset attribute,and No blur effect when blur radius is set ([a6651e38](https://github.com/html2canvas/html2canvas/commit/a6651e38a2a0bf2f6f163c87dc61d857f3f5e3df))
- fix: renderBackgroundImage lineLength ([34bee729](https://github.com/html2canvas/html2canvas/commit/34bee729674fe63e2e2a1c392a663f2761b07286))
- refacto ([667f6a9](https://github.com/html2canvas/html2canvas/commit/667f6a9cebd0a50a22535a65e3b1ad47e96545ac))
- Fix project configuration ([f6551987](https://github.com/html2canvas/html2canvas/commit/f6551987e2faa3399bb1d8c84b1edf3b938b7de6))

## [1.4.1](https://github.com/html2canvas/html2canvas/compare/v1.4.0...v1.4.1) (2022-01-22)

### deps

- fix source maps (#2812) ([67c5e8d](https://github.com/html2canvas/html2canvas/commit/67c5e8dec4b2af9260a2b5b75b3399495fd1fee9)), closes [#2812](https://github.com/niklasvh/html2canvas/issues/2812)

### feat

- add support for `<video>` elements (#2788) ([181d1b1](https://github.com/html2canvas/html2canvas/commit/181d1b1103910d6e1b5277d5c007fc5e3006c6bf)), closes [#2788](https://github.com/niklasvh/html2canvas/issues/2788)

### fix

- Properties x and y of BoundingRect is undefined in old browser (#2797) ([e587a82](https://github.com/html2canvas/html2canvas/commit/e587a82dca01d9ada78cae34fd1bdb934e547f9b)), closes [#2797](https://github.com/niklasvh/html2canvas/issues/2797)
- source maps (#2787) ([46db867](https://github.com/html2canvas/html2canvas/commit/46db86755f064828559a4b0b37310f3ae94f5494)), closes [#2787](https://github.com/niklasvh/html2canvas/issues/2787)

# [1.4.0](https://github.com/html2canvas/html2canvas/compare/v1.3.4...v1.4.0) (2022-01-01)

### feat

- use native text segmenter where available (#2782) ([6521a48](https://github.com/html2canvas/html2canvas/commit/6521a487d78172f7179f7c973c1a3af40eb92009)), closes [#2782](https://github.com/niklasvh/html2canvas/issues/2782)

### fix

- adopted stylesheets (#2785) ([74696fa](https://github.com/html2canvas/html2canvas/commit/74696faf47c07b48b9c9587db0b999da1c08a8be)), closes [#2785](https://github.com/niklasvh/html2canvas/issues/2785)
- ios text wrapping with 0 width rect (#2786) ([0476d06](https://github.com/html2canvas/html2canvas/commit/0476d065158c33d2020a9f602b3043e5e2f90c75)), closes [#2786](https://github.com/niklasvh/html2canvas/issues/2786)
- reduce SLICE_STACK_SIZE to 50k (#2784) ([1cc853a](https://github.com/html2canvas/html2canvas/commit/1cc853a3186853eaca00af060f651697dc3497a9)), closes [#2784](https://github.com/niklasvh/html2canvas/issues/2784)

## [1.3.4](https://github.com/html2canvas/html2canvas/compare/v1.3.3...v1.3.4) (2021-12-29)

### ci

- add ios 15.0 testing (#2780) ([d922207](https://github.com/html2canvas/html2canvas/commit/d9222075daaed08884491b0563fc899ee0ced731)), closes [#2780](https://github.com/niklasvh/html2canvas/issues/2780)

### fix

- ios 15 font rendering crash (#2645) ([ba2b1cd](https://github.com/html2canvas/html2canvas/commit/ba2b1cd8e9a9d7932675d7abffce1526a609e769)), closes [#2645](https://github.com/niklasvh/html2canvas/issues/2645)

## [1.3.3](https://github.com/html2canvas/html2canvas/compare/v1.3.2...v1.3.3) (2021-11-23)

### ci

- fix macos action runners (#2757) ([ed57781](https://github.com/html2canvas/html2canvas/commit/ed577815949b6a565df54f2101cf6f0fb731c290)), closes [#2757](https://github.com/niklasvh/html2canvas/issues/2757)

### fix

- "offsets" text when font is big ([fd22a01](https://github.com/html2canvas/html2canvas/commit/fd22a01a3c9e39293f47caaed0c0e13d2dc8170c))
- const enums (#2651) ([eeda86b](https://github.com/html2canvas/html2canvas/commit/eeda86bd5e81fb4e97675fe9bee3d4d15899997f)), closes [#2651](https://github.com/niklasvh/html2canvas/issues/2651)

## [1.3.2](https://github.com/html2canvas/html2canvas/compare/v1.3.1...v1.3.2) (2021-08-15)

### docs

- add warning for webgl cloning with preserveDrawingBuffer=false (#2661) ([01ed879](https://github.com/html2canvas/html2canvas/commit/01ed87907ad9c7688880e2c5cb8ebc22ef73a4d8)), closes [#2661](https://github.com/niklasvh/html2canvas/issues/2661)
- include src files on www (#2660) ([58ff000](https://github.com/html2canvas/html2canvas/commit/58ff0003f77d825ac027eeec95fa80c0123eaf8f)), closes [#2660](https://github.com/niklasvh/html2canvas/issues/2660)

### feat

- add support for data-html2canvas-debug property for debugging (#2658) ([cd0d725](https://github.com/html2canvas/html2canvas/commit/cd0d7258c3a93f2989d5d9ec0244ba2763ea2d23)), closes [#2658](https://github.com/niklasvh/html2canvas/issues/2658)

### fix

- disable transition properties (#2659) ([f143166](https://github.com/html2canvas/html2canvas/commit/f1431665513e0a4636fb167a241f4a0571ba728a)), closes [#2659](https://github.com/niklasvh/html2canvas/issues/2659)
- overflows with absolutely positioned content (#2663) ([38c6829](https://github.com/html2canvas/html2canvas/commit/38c682955a9299ca7785af71d8f251df799405b0)), closes [#2663](https://github.com/niklasvh/html2canvas/issues/2663)

## [1.3.1](https://github.com/html2canvas/html2canvas/compare/v1.3.0...v1.3.1) (2021-08-14)

### fix

- multi arg transition/animation duration (#2657) ([1b55ed5](https://github.com/html2canvas/html2canvas/commit/1b55ed5668dcbbe1c6d8d7e94736d8f2da2d31c5)), closes [#2657](https://github.com/niklasvh/html2canvas/issues/2657)

# [1.3.0](https://github.com/html2canvas/html2canvas/compare/v1.2.2...v1.3.0) (2021-08-13)

### feat

- add rtl render support (#2653) ([6947982](https://github.com/html2canvas/html2canvas/commit/694798284838b16882e648914da0905818aa366c)), closes [#2653](https://github.com/niklasvh/html2canvas/issues/2653)
- correctly break graphemes (#2652) ([437b367](https://github.com/html2canvas/html2canvas/commit/437b367d3ba9dfd7f9a4c8042ac8d00208c09770)), closes [#2652](https://github.com/niklasvh/html2canvas/issues/2652)

### fix

- correctly handle allowTaint canvas cloning (#2649) ([c378e22](https://github.com/html2canvas/html2canvas/commit/c378e220694c14cb7b3b4b8650a7757f8fc23c7a)), closes [#2649](https://github.com/niklasvh/html2canvas/issues/2649)
- finish animation/transitions for elements (#2632) ([969638f](https://github.com/html2canvas/html2canvas/commit/969638fb94a0a14c64a667fa6e5689f79d9f1044)), closes [#2632](https://github.com/niklasvh/html2canvas/issues/2632)

### test

- add letter-spacing test for zwj emoji (#2650) ([f919204](https://github.com/html2canvas/html2canvas/commit/f919204efa06af219f155ca279f96124bb92862b)), closes [#2650](https://github.com/niklasvh/html2canvas/issues/2650)

## [1.2.2](https://github.com/html2canvas/html2canvas/compare/v1.2.1...v1.2.2) (2021-08-10)

### ci

- add ios15 target (#2564) ([e429e04](https://github.com/html2canvas/html2canvas/commit/e429e0443adf5c7ca3041b97a8157b8911302206)), closes [#2564](https://github.com/niklasvh/html2canvas/issues/2564)

### docs

- update test previewer (#2637) ([7a06d0c](https://github.com/html2canvas/html2canvas/commit/7a06d0c2c2f3b8a1d1a8a85c540f8288b782e8c6)), closes [#2637](https://github.com/niklasvh/html2canvas/issues/2637)

### fix

- parsing counter content in pseudo element (#2640) ([1941b9e](https://github.com/html2canvas/html2canvas/commit/1941b9e0acfd9243da0beaf70e1643cab1b4a963)), closes [#2640](https://github.com/niklasvh/html2canvas/issues/2640)
- radial gradient ry check (#2631) ([a0dd38a](https://github.com/html2canvas/html2canvas/commit/a0dd38a8be4e540ae1c1f4b4e41f6c386f3e454f)), closes [#2631](https://github.com/niklasvh/html2canvas/issues/2631)
- test for ios range line break error (#2635) ([f43f942](https://github.com/html2canvas/html2canvas/commit/f43f942fcd793dde9cdc6c0438f379ec3c05c405)), closes [#2635](https://github.com/niklasvh/html2canvas/issues/2635)

### test

- large base64 encoded background (#2636) ([e36408a](https://github.com/html2canvas/html2canvas/commit/e36408ad030fe31acd9969a37fe24c1621c0bd04)), closes [#2636](https://github.com/niklasvh/html2canvas/issues/2636)

## [1.2.1](https://github.com/html2canvas/html2canvas/compare/v1.2.0...v1.2.1) (2021-08-05)

### fix

- none image (#2627) ([6651fc6](https://github.com/html2canvas/html2canvas/commit/6651fc6789d5902d171dc53b4094887870433018)), closes [#2627](https://github.com/niklasvh/html2canvas/issues/2627)
- type import that is only available ts 3.8 or higher (#2629) ([c5c6fa0](https://github.com/html2canvas/html2canvas/commit/c5c6fa00d71f36ef963ba5170ebc7b668d39c407)), closes [#2629](https://github.com/niklasvh/html2canvas/issues/2629)

# [1.2.0](https://github.com/html2canvas/html2canvas/compare/v1.1.5...v1.2.0) (2021-08-04)

### fix

- element cropping & scrolling (#2625) ([878e37a](https://github.com/html2canvas/html2canvas/commit/878e37a24272d0412fe589975ef8eed931c56e0b)), closes [#2625](https://github.com/niklasvh/html2canvas/issues/2625)
- overflow-wrap break-word (#2626) ([95a46b0](https://github.com/html2canvas/html2canvas/commit/95a46b00c53563722c035a0e45fdf5fb507275e4)), closes [#2626](https://github.com/niklasvh/html2canvas/issues/2626)

### test

- element with scrolled window (#2624) ([1338c7b](https://github.com/html2canvas/html2canvas/commit/1338c7b203535d53509416358d74014200a994eb)), closes [#2624](https://github.com/niklasvh/html2canvas/issues/2624)

## [1.1.5](https://github.com/html2canvas/html2canvas/compare/v1.1.4...v1.1.5) (2021-08-02)

### docs

- update README to github discussion Q/A ([5dea36b](https://github.com/html2canvas/html2canvas/commit/5dea36bd6964164e8ba3f8780309e792f5d16255))

### fix

- emoji line breaking (fix #1813) (#2621) ([7d788c6](https://github.com/html2canvas/html2canvas/commit/7d788c6f3d221b87f6b59fcda8517731340b2d1f)), closes [#1813](https://github.com/niklasvh/html2canvas/issues/1813) [#2621](https://github.com/niklasvh/html2canvas/issues/2621) [#1813](https://github.com/niklasvh/html2canvas/issues/1813)
- natural sizes for images with srcset (#2622) ([96e23d1](https://github.com/html2canvas/html2canvas/commit/96e23d185198b7131cf0cfa31c14c165790464e9)), closes [#2622](https://github.com/niklasvh/html2canvas/issues/2622)

## [1.1.4](https://github.com/html2canvas/html2canvas/compare/v1.1.3...v1.1.4) (2021-07-15)

### feat

- add support for webkit-text-stroke and paint-order (#2591) ([522e5aa](https://github.com/html2canvas/html2canvas/commit/522e5aac5fdad090953d095b5d558053a5e2d43d)), closes [#2591](https://github.com/niklasvh/html2canvas/issues/2591)

### fix

- don't copy 'all' css property (#2586) ([fa60716](https://github.com/html2canvas/html2canvas/commit/fa60716d07ed590ec64543a586a7960cbc8557df)), closes [#2586](https://github.com/niklasvh/html2canvas/issues/2586)
- svg d path getting truncated on copy (#2589) ([dd6d885](https://github.com/html2canvas/html2canvas/commit/dd6d8856eca820a13a0990c467b9e531433fd4a9)), closes [#2589](https://github.com/niklasvh/html2canvas/issues/2589)
- text position for form elements and list markers (#2588) ([cd99f11](https://github.com/html2canvas/html2canvas/commit/cd99f11b1b9eb1260a548a63e2a370a0a5ddafa0)), closes [#2588](https://github.com/niklasvh/html2canvas/issues/2588)
- this.canvas.ownerDocument is undefined (#2590) ([45efe54](https://github.com/html2canvas/html2canvas/commit/45efe54da8145f97b9ee0463e686103280e3c8b1)), closes [#2590](https://github.com/niklasvh/html2canvas/issues/2590)
- word-break seperators (#2593) ([e9f7f48](https://github.com/html2canvas/html2canvas/commit/e9f7f48d571304be14610a181feedca3c3b42864)), closes [#2593](https://github.com/niklasvh/html2canvas/issues/2593)

### test

- refactor language tests (#2594) ([4c360fc](https://github.com/html2canvas/html2canvas/commit/4c360fc1f059f4dcab71a79f9dc8a5b2e25411ea)), closes [#2594](https://github.com/niklasvh/html2canvas/issues/2594)
- update box-shadow with radius ([578bb77](https://github.com/html2canvas/html2canvas/commit/578bb771bfeb7e81362e9e355d6cc9ae910e3920))

## [1.1.3](https://github.com/html2canvas/html2canvas/compare/v1.1.2...v1.1.3) (2021-07-14)

### feat

- allow access to reference element in onclone (#2584) ([58b4591](https://github.com/html2canvas/html2canvas/commit/58b45911741c0dbbccd462b2976560bb3999eaef)), closes [#2584](https://github.com/niklasvh/html2canvas/issues/2584)
- support for custom and slot elements (#2581) ([acb4cd2](https://github.com/html2canvas/html2canvas/commit/acb4cd24b85527908c02a60794768949578678f0)), closes [#2581](https://github.com/niklasvh/html2canvas/issues/2581)

### fix

- iframe load to ensure images are loaded (#2577) ([eeb5a3e](https://github.com/html2canvas/html2canvas/commit/eeb5a3ea1d6c94e0f6dcfd40695eb88ebb3e0041)), closes [#2577](https://github.com/niklasvh/html2canvas/issues/2577)
- image blob rendering ([1acdc82](https://github.com/html2canvas/html2canvas/commit/1acdc827a4e05933c2f7c9558405c66b7cd82f58))
- responsive svg images (#2583) ([92fa448](https://github.com/html2canvas/html2canvas/commit/92fa448913192d5e4e82bfe14f6644b669d4e6ef)), closes [#2583](https://github.com/niklasvh/html2canvas/issues/2583)

### test

- add test cases for text-stroke and textarea from (#1540 and #2132) (#2585) ([1d00bfe](https://github.com/html2canvas/html2canvas/commit/1d00bfe175d51e663d0bae88b6dbd10a266a71f1)), closes [#1540](https://github.com/niklasvh/html2canvas/issues/1540) [#2132](https://github.com/niklasvh/html2canvas/issues/2132) [#2585](https://github.com/niklasvh/html2canvas/issues/2585)

## [1.1.2](https://github.com/html2canvas/html2canvas/compare/v1.1.1...v1.1.2) (2021-07-13)

### ci

- implement screenshot diffing (#2571) ([e29af58](https://github.com/html2canvas/html2canvas/commit/e29af586618125bbad10ad6bee3d69fddbc5d22a)), closes [#2571](https://github.com/niklasvh/html2canvas/issues/2571)

### fix

- logger unique names (#2575) ([1715854](https://github.com/html2canvas/html2canvas/commit/171585491dd1bee4f30691328bd22e978f3ac79e)), closes [#2575](https://github.com/niklasvh/html2canvas/issues/2575)
- text-shadow position with baseline (#2576) ([439e365](https://github.com/html2canvas/html2canvas/commit/439e365ea8c703b528778a268dcfc3bf9ccad6a9)), closes [#2576](https://github.com/niklasvh/html2canvas/issues/2576)

## [1.1.1](https://github.com/html2canvas/html2canvas/compare/v1.1.0...v1.1.1) (2021-07-12)

### fix

- allow proxy url with parameters (#2100) ([a4a3ce8](https://github.com/html2canvas/html2canvas/commit/a4a3ce8a2eb6a4f43f1bc9a7935eb16f2b98a3cd)), closes [#2100](https://github.com/niklasvh/html2canvas/issues/2100)
- crash on background-size with calc() (fix #2469) (#2569) ([084017a](https://github.com/html2canvas/html2canvas/commit/084017a67319a993d73c6bdf612dd8532f1b8dbe)), closes [#2469](https://github.com/niklasvh/html2canvas/issues/2469) [#2569](https://github.com/niklasvh/html2canvas/issues/2569)
- handle unhandled promise rejections (#2568) ([4555940](https://github.com/html2canvas/html2canvas/commit/4555940d0bc17b7fd9327dd0164c382a3dbf1858)), closes [#2568](https://github.com/niklasvh/html2canvas/issues/2568)

# [1.1.0](https://github.com/html2canvas/html2canvas/compare/v1.0.0...v1.1.0) (2021-07-11)

### ci

- fail build if no artifacts uploaded (#2566) ([e7a021a](https://github.com/html2canvas/html2canvas/commit/e7a021ab931f3c0de060b4643e88fad85345c3d3)), closes [#2566](https://github.com/niklasvh/html2canvas/issues/2566)

### deps

- update dependencies with lint fixes (#2565) ([b2902ec](https://github.com/html2canvas/html2canvas/commit/b2902ec31c2a414ea26f864f8e00aa8846890ffc)), closes [#2565](https://github.com/niklasvh/html2canvas/issues/2565)

### docs

- update border-style support ([cf35a28](https://github.com/html2canvas/html2canvas/commit/cf35a282b2c9d41b601c3148e8c08fe7ba61a5f9))

### fix

- Ensure resizeImage's canvas has at least 1px of width and height (#2409) ([bb92371](https://github.com/html2canvas/html2canvas/commit/bb9237155cf0ec090432ee6c5d9c555eb6ffa81f)), closes [#2409](https://github.com/niklasvh/html2canvas/issues/2409)
- text-decoration-line fallback (#2088) (#2567) ([44296e5](https://github.com/html2canvas/html2canvas/commit/44296e529368140ec06a937383e05f3074b19ee2)), closes [#2088](https://github.com/niklasvh/html2canvas/issues/2088) [#2567](https://github.com/niklasvh/html2canvas/issues/2567)
- use baseline for text positioning (#2109) ([85f79c1](https://github.com/html2canvas/html2canvas/commit/85f79c1a5e4c0b422ace552c430dd389c8477a44)), closes [#2109](https://github.com/niklasvh/html2canvas/issues/2109)

# [1.0.0](https://github.com/html2canvas/html2canvas/compare/v1.0.0-rc.7...v1.0.0) (2021-07-04)

### ci

- update docs publish action (#2451) ([7222aba](https://github.com/html2canvas/html2canvas/commit/7222aba1b42138c3d466525172411b3d9869095f)), closes [#2451](https://github.com/niklasvh/html2canvas/issues/2451)

### deps

- update www deps (#2525) ([2a013e2](https://github.com/html2canvas/html2canvas/commit/2a013e20c814b7dbaea98f54f0bde8f553eb79a2)), closes [#2525](https://github.com/niklasvh/html2canvas/issues/2525)

### feat

- add support for border-style dashed, dotted, double (#2531) ([72cd528](https://github.com/html2canvas/html2canvas/commit/72cd5284296e4cdb3fe88f2982ec7528604b6618))

### fix

- opacity with overflow hidden (#2450) ([82b7da5](https://github.com/html2canvas/html2canvas/commit/82b7da558c342e7f53d298bb1d843a5db86c3b21)), closes [#2450](https://github.com/niklasvh/html2canvas/issues/2450)
- top right border radius (#2522) ([ba17267](https://github.com/html2canvas/html2canvas/commit/ba172678f07f962e9f54b398df087e86217d7a13))

### test

- update karma runner (#2524) ([ff35c7d](https://github.com/html2canvas/html2canvas/commit/ff35c7dbd33f863f5b614d778baf8cb1e8dded60)), closes [#2524](https://github.com/niklasvh/html2canvas/issues/2524)

# [1.0.0-rc.7](https://github.com/html2canvas/html2canvas/compare/v1.0.0-rc.6...v1.0.0-rc.7) (2020-08-09)

### fix

- concatenate contiguous font-family tokens (#2219) ([bacfadf](https://github.com/html2canvas/html2canvas/commit/bacfadff96d907d9e8ab4ef515ca6487de9e51fc)), closes [#2219](https://github.com/niklasvh/html2canvas/issues/2219)
- external styles on svg elements (#2320) ([1514220](https://github.com/html2canvas/html2canvas/commit/1514220812cfb22d64d0974558d9c14fe90a41d3)), closes [#2320](https://github.com/niklasvh/html2canvas/issues/2320)

# [1.0.0-rc.6](https://github.com/html2canvas/html2canvas/compare/v1.0.0-rc.5...v1.0.0-rc.6) (2020-08-08)

### ci

- Azure Pipelines: upgrade from macOS 10.13 -> 10.14 (#2204) ([c366e87](https://github.com/html2canvas/html2canvas/commit/c366e8790d346ea981b24b7425aef6bf6d7ebcec)), closes [#2204](https://github.com/niklasvh/html2canvas/issues/2204)
- build docs (#2305) ([51de347](https://github.com/html2canvas/html2canvas/commit/51de34787ad8aba3f213800be45e878cddb064e9)), closes [#2305](https://github.com/niklasvh/html2canvas/issues/2305)

### fix

- #1868 Clone node, Setting className for SVG element raises error (#2079) ([f139b51](https://github.com/html2canvas/html2canvas/commit/f139b513c5cf9673dc727fd47124e0d779891e3a)), closes [#1868](https://github.com/niklasvh/html2canvas/issues/1868) [#2079](https://github.com/niklasvh/html2canvas/issues/2079) [#1868](https://github.com/niklasvh/html2canvas/issues/1868)
- image loading="lazy" fix #2312 (#2314) ([f23e6f6](https://github.com/html2canvas/html2canvas/commit/f23e6f6f2690dc0dbd02621c3bb81025904e6647)), closes [#2312](https://github.com/niklasvh/html2canvas/issues/2312) [#2314](https://github.com/niklasvh/html2canvas/issues/2314)

# [1.0.0-rc.5](https://github.com/html2canvas/html2canvas/compare/v1.0.0-rc.4...v1.0.0-rc.5) (2019-09-27)

### fix

- correctly respect logging option (#2013) ([34b06d6365603c3b16664ab7804efe94c7945946](https://github.com/html2canvas/html2canvas/commit/34b06d6365603c3b16664ab7804efe94c7945946)), closes [#2013](https://github.com/niklasvh/html2canvas/issues/2013)
- safari pseudo element content parsing (#2018) ([3f599103fb139f218ffe917800e74af2c7cc7ad5](https://github.com/html2canvas/html2canvas/commit/3f599103fb139f218ffe917800e74af2c7cc7ad5)), closes [#2018](https://github.com/niklasvh/html2canvas/issues/2018)
- using existing canvas option (#2017) ([076492042a73d67b30e4562f2964200e07d25f5e](https://github.com/html2canvas/html2canvas/commit/076492042a73d67b30e4562f2964200e07d25f5e)), closes [#2017](https://github.com/niklasvh/html2canvas/issues/2017)

# [1.0.0-rc.4](https://github.com/html2canvas/html2canvas/compare/v1.0.0-rc.3...v1.0.0-rc.4) (2019-09-22)

### docs

- fix typo (#1864) ([9a63797aa7fb81454008745d2a1c069ca24339a4](https://github.com/html2canvas/html2canvas/commit/9a63797aa7fb81454008745d2a1c069ca24339a4)), closes [#1864](https://github.com/niklasvh/html2canvas/issues/1864)

### feat

- ignore unsupported image functions (#1873) ([61f4819e02102b112513d57b16ec7d37e989af20](https://github.com/html2canvas/html2canvas/commit/61f4819e02102b112513d57b16ec7d37e989af20)), closes [#1873](https://github.com/niklasvh/html2canvas/issues/1873)

### fix

- correctly render partial borders (fix #1920) (#2010) ([eedb81ef9e114366a7e286e975659360cf9d0983](https://github.com/html2canvas/html2canvas/commit/eedb81ef9e114366a7e286e975659360cf9d0983)), closes [#1920](https://github.com/niklasvh/html2canvas/issues/1920) [#2010](https://github.com/niklasvh/html2canvas/issues/2010)
- nested z-index ordering (#2011) ([00555cf1efddfed5877811d8a03a326f9943ab06](https://github.com/html2canvas/html2canvas/commit/00555cf1efddfed5877811d8a03a326f9943ab06)), closes [#2011](https://github.com/niklasvh/html2canvas/issues/2011) [#1978](https://github.com/niklasvh/html2canvas/issues/1978)
- null backgroundColor option as transparent (#2012) ([7d3456b78c37e7333db087601805b32ec7ca0253](https://github.com/html2canvas/html2canvas/commit/7d3456b78c37e7333db087601805b32ec7ca0253)), closes [#2012](https://github.com/niklasvh/html2canvas/issues/2012)
- zero size iframe rendering (#1863) ([81dcf7b6be66920260a60908aa4b86e7530f6e17](https://github.com/html2canvas/html2canvas/commit/81dcf7b6be66920260a60908aa4b86e7530f6e17)), closes [#1863](https://github.com/niklasvh/html2canvas/issues/1863)

# [1.0.0-rc.3](https://github.com/html2canvas/html2canvas/compare/v1.0.0-rc.2...v1.0.0-rc.3) (2019-05-30)

### fix

- stack exceeding for css tokenizer (#1862) ([cbaecdca28cfaf9bd854e1b0c005cc8058208b36](https://github.com/html2canvas/html2canvas/commit/cbaecdca28cfaf9bd854e1b0c005cc8058208b36)), closes [#1862](https://github.com/niklasvh/html2canvas/issues/1862)
- typescript options type definition (#1861) ([cae44a6f0a6649bd8a7c4250a20792bb5c2e5b42](https://github.com/html2canvas/html2canvas/commit/cae44a6f0a6649bd8a7c4250a20792bb5c2e5b42)), closes [#1861](https://github.com/niklasvh/html2canvas/issues/1861)

# [1.0.0-rc.2](https://github.com/html2canvas/html2canvas/compare/v1.0.0-rc.1...v1.0.0-rc.2) (2019-05-29)

### ci

- refactor browser tests (#1804) ([a7d881019bfe1fd6404c341ca1c6fa69e0274ef5](https://github.com/html2canvas/html2canvas/commit/a7d881019bfe1fd6404c341ca1c6fa69e0274ef5)), closes [#1804](https://github.com/niklasvh/html2canvas/issues/1804)

### docs

- fix README documentation ([20a797cbeb21baca4ce5b9a0642a5959cdf94a51](https://github.com/html2canvas/html2canvas/commit/20a797cbeb21baca4ce5b9a0642a5959cdf94a51))
- remove dead donation link (fix #1802) ([43058241b420a5dabe94b0a4e4f6534d16a75ec0](https://github.com/html2canvas/html2canvas/commit/43058241b420a5dabe94b0a4e4f6534d16a75ec0)), closes [#1802](https://github.com/niklasvh/html2canvas/issues/1802)

### fix

- multi token overflow #1850 (#1851) ([409674fba6f8038eb174b9c89360ef8b342971e9](https://github.com/html2canvas/html2canvas/commit/409674fba6f8038eb174b9c89360ef8b342971e9)), closes [#1850](https://github.com/niklasvh/html2canvas/issues/1850) [#1851](https://github.com/niklasvh/html2canvas/issues/1851)

### test

- include reftests previewer with docs website (#1799) ([cdc4ca8296570bf842e937c6fb7cc32a1ce2bc09](https://github.com/html2canvas/html2canvas/commit/cdc4ca8296570bf842e937c6fb7cc32a1ce2bc09)), closes [#1799](https://github.com/niklasvh/html2canvas/issues/1799)

# [1.0.0-rc.1](https://github.com/html2canvas/html2canvas/compare/v1.0.0-rc.0...v1.0.0-rc.1) (2019-04-10)

### ci

- add ios simulator tests (#1794) ([a63cb3c0f132b1af915d9ef55a4c174f6e5502ce](https://github.com/html2canvas/html2canvas/commit/a63cb3c0f132b1af915d9ef55a4c174f6e5502ce)), closes [#1794](https://github.com/niklasvh/html2canvas/issues/1794)

### docs

- fix release date in changelog ([238de790a9f223becbc8726633c0f2a2dabf2cb7](https://github.com/html2canvas/html2canvas/commit/238de790a9f223becbc8726633c0f2a2dabf2cb7))
- remove invalid `async` option from docs (fix #1769) (#1796) ([7775d3c0d6f3efca00611bedd5fc9200689a9f7a](https://github.com/html2canvas/html2canvas/commit/7775d3c0d6f3efca00611bedd5fc9200689a9f7a)), closes [#1769](https://github.com/niklasvh/html2canvas/issues/1769) [#1796](https://github.com/niklasvh/html2canvas/issues/1796)

### fix

- context scale for high resolution displays with foreignobjectrendering (#1782) ([7027900f4993dcd00745a4db045ed1c0e3255f8a](https://github.com/html2canvas/html2canvas/commit/7027900f4993dcd00745a4db045ed1c0e3255f8a)), closes [#1782](https://github.com/niklasvh/html2canvas/issues/1782)
- don't apply text shadows on elements (#1795) ([397595afb59ee50f0d128abb5945b5b9ddc6650d](https://github.com/html2canvas/html2canvas/commit/397595afb59ee50f0d128abb5945b5b9ddc6650d)), closes [#1795](https://github.com/niklasvh/html2canvas/issues/1795)
- safari data url taints (#1797) ([4e4a231683904dfdc1f82472ece5a160a158dbb8](https://github.com/html2canvas/html2canvas/commit/4e4a231683904dfdc1f82472ece5a160a158dbb8)), closes [#1797](https://github.com/niklasvh/html2canvas/issues/1797)

### test

- fix RefTestRenderer.js inclusion with karma ([49f87fb680dbfe1898b3aeb60f2f5c3a93bfbe6d](https://github.com/html2canvas/html2canvas/commit/49f87fb680dbfe1898b3aeb60f2f5c3a93bfbe6d))

# [1.0.0-rc.0](https://github.com/html2canvas/html2canvas/compare/v1.0.0-alpha.12...v1.0.0-rc.0) (2019-04-07)

### build

- update webpack and babel (#1793) ([44f3d79f68836624c2673a86f9ad47c17ef843c3](https://github.com/html2canvas/html2canvas/commit/44f3d79f68836624c2673a86f9ad47c17ef843c3)), closes [#1793](https://github.com/niklasvh/html2canvas/issues/1793)

### ci

- automate changelog generation (#1792) ([7ebef72e927eaafd34a1792ece431d2a73109230](https://github.com/html2canvas/html2canvas/commit/7ebef72e927eaafd34a1792ece431d2a73109230)), closes [#1792](https://github.com/niklasvh/html2canvas/issues/1792)
- Improve CI pipeline (#1790) ([c45ef099fe8f7142e174f4fce39448a370a987d5](https://github.com/html2canvas/html2canvas/commit/c45ef099fe8f7142e174f4fce39448a370a987d5)), closes [#1790](https://github.com/niklasvh/html2canvas/issues/1790)

### docs

- improve canvas size limit documentation (#1576) ([3212184146b33c3564c2f416e1bfda911737c38b](https://github.com/html2canvas/html2canvas/commit/3212184146b33c3564c2f416e1bfda911737c38b)), closes [#1576](https://github.com/niklasvh/html2canvas/issues/1576)

### fix

- enforce colorstop min 0 (#1743) ([349bbf137abd83464e074db3948fc79a541c2ef3](https://github.com/html2canvas/html2canvas/commit/349bbf137abd83464e074db3948fc79a541c2ef3)), closes [#1743](https://github.com/niklasvh/html2canvas/issues/1743)
- prevent unhandled promise rejections for hidden frames (#1762) ([5cbe5db35155e3a9790a30de09feb17843053b7a](https://github.com/html2canvas/html2canvas/commit/5cbe5db35155e3a9790a30de09feb17843053b7a)), closes [#1762](https://github.com/niklasvh/html2canvas/issues/1762)
- wrap .sheet.cssRules access in try...catch. (#1693) ([2c018d19875ced30caafdc40f84ca531de6e6f91](https://github.com/html2canvas/html2canvas/commit/2c018d19875ced30caafdc40f84ca531de6e6f91)), closes [#1693](https://github.com/niklasvh/html2canvas/issues/1693)

# [1.0.0-alpha.12](https://github.com/html2canvas/html2canvas/compare/v1.0.0-alpha.12...v1.0.0-alpha.13) (2018-04-05)

- Fix white space appearing on element rendering (Fix #1438)
- Reset canvas transform on finish (Fix #1494)

# v1.0.0-alpha.11 - 1.4.2018

- Fix IE11 member not found error
- Support blob image resources in non-foreignObjectRendering mode

# v1.0.0-alpha.10 - 15.2.2018

- Re-introduce `onclone` option (Fix #1434)
- Add `ignoreElements` predicate function option
- Fix version console logging

# v1.0.0-alpha.9 - 7.1.2018

- Fix dynamic style sheets
- Fix > 50% border-radius values

# v1.0.0-alpha.8 - 2.1.2018

- Use correct doctype in cloned Document (Fix #1298)
- Fix individual border rendering (Fix #1349)

# v1.0.0-alpha.7 - 31.12.2017

- Fix form input rendering (#1338)
- Improve word line breaking algorithm

# v1.0.0-alpha.6 - 28.12.2017

- Fix list-style: none (#1340)
- Extend supported values for pseudo element content

# v1.0.0-alpha.5 - 21.12.2017

- Fix underline positioning
- Fix canvas rendering on Chrome
- Fix overflow: auto
- Added support for rendering list-style

v1.0.0-alpha.4 - 12.12.2017

- Fix rendering with multiple fonts defined (Fix #796)
- Add support for radial-gradients
- Fix logging option (#1302)
- Add support for rendering webgl canvas content (#646)
- Fix external SVG loading with proxies (#802)

# v1.0.0-alpha.3 - 9.12.2017

- Disable `foreignObjectRendering` by default (#1295)
- Fix background-size when using background-origin and background-size: cover/contain (#1299)
- Added support for background-origin: content-box (#1299)

# v1.0.0-alpha.2 - 7.12.2017

- Fix scroll positions for CanvasRenderer (#1259)
- Fix `data-html2canvas-ignore` attribute (#1253)
- Fix decimal `letter-spacing` values (#1293)

# v1.0.0-alpha.1 - 5.12.2017

- Complete rewrite of library

##### Breaking Changes

- Remove deprecated onrendered callback, calling `html2canvas` returns a `Promise<HTMLCanvasElement>`
- Removed option `type`, same results can be achieved by assigning `x`, `y`, `scrollX`, `scrollY`, `width` and `height` properties.

## New featues / fixes

- Add support for scaling canvas (defaults to device pixel ratio)
- Add support for multiple text-shadows
- Add support for multiple text-decorations
- Add support for text-decoration-color
- Add support for percentage values for border-radius
- Correctly handle px and percentage values in linear-gradients
- Correctly support all angle types for linear-gradients
- Add support for multiple values for background-repeat, background-position and background-size

# v0.5.0-beta4 - 23.1.2016

- Fix logger requiring access to window object
- Derequire browserify build
- Fix rendering of specific elements when window is scrolled and `type` isn't set to `view`

# v0.5.0-beta3 - 6.12.2015

- Handle color names in linear gradients

# v0.5.0-beta2 - 20.10.2015

- Remove Promise polyfill (use native or provide it yourself)

# v0.5.0-beta1 - 19.10.2015

- Fix bug with unmatched color stops in gradients
- Fix scrolling issues with iOS
- Correctly handle named colors in gradients
- Accept matrix3d transforms
- Fix transparent colors breaking gradients
- Preserve scrolling positions on render

# v0.5.0-alpha2 - 3.2.2015

- Switch to using browserify for building
- Fix (#517) Chrome stretches background images with 'auto' or single attributes

# v0.5.0-alpha - 19.1.2015

- Complete rewrite of library
- Switched interface to return Promise
- Uses hidden iframe window to perform rendering, allowing async rendering and doesn't force the viewport to be scrolled to the top anymore.
- Better support for unicode
- Checkbox/radio button rendering
- SVG rendering
- iframe rendering
- Changed format for proxy requests, permitting binary responses with CORS headers as well
- Fixed many layering issues (see z-index tests)

# v0.4.1 - 7.9.2013

- Added support for bower
- Improved z-index ordering
- Basic implementation for CSS transformations
- Fixed inline text in top element
- Basic implementation for text-shadow

# v0.4.0 - 30.1.2013

- Added rendering tests with <a href="https://github.com/niklasvh/webdriver.js">webdriver</a>
- Switched to using grunt for building
- Removed support for IE<9, including any FlashCanvas bits
- Support for border-radius
- Support for multiple background images, size, and clipping
- Support for :before and :after pseudo elements
- Support for placeholder rendering
- Reformatted all tests to small units to test specific features

# v0.3.4 - 26.6.2012

- Removed (last?) jQuery dependencies (<a href="https://github.com/html2canvas/html2canvas/commit/343b86705fe163766fcf735eb0217130e4bd5b17">niklasvh</a>)
- SVG-powered rendering (<a href="https://github.com/html2canvas/html2canvas/commit/67d3e0d0f59a5a654caf71a2e3be6494ff146c75">niklasvh</a>)
- Radial gradients (<a href="https://github.com/html2canvas/html2canvas/commit/4f22c18043a73c0c3bbf3b5e4d62714c56acd3c7">SunboX</a>)
- Split renderers to their own objects (<a href="https://github.com/html2canvas/html2canvas/commit/94f2f799a457cd29a21cc56ef8c06f1697866739">niklasvh</a>)
- Simplified API, cleaned up code (<a href="https://github.com/html2canvas/html2canvas/commit/c7d526c9eaa6a4abf4754d205fe1dee360c7660e">niklasvh</a>)

# v0.3.3 - 2.3.2012

- SVG taint fix, and additional taint testing options for rendering (<a href="https://github.com/html2canvas/html2canvas/commit/2dc8b9385e656696cb019d615bdfa1d98b17d5d4">niklasvh</a>)
- Added support for CORS images and option to create canvas as tainted (<a href="https://github.com/html2canvas/html2canvas/commit/3ad49efa0032cde25c6ed32a39e35d1505d3b2ef">niklasvh</a>)
- Improved minification saved ~1K! (<a href="https://github.com/cobexer/html2canvas/commit/b82be022b2b9240bd503e078ac980bde2b953e43">cobexer</a>)
- Added integrated support for Flashcanvas (<a href="https://github.com/html2canvas/html2canvas/commit/e9257191519f67d74fd5e364d8dee3c0963ba5fc">niklasvh</a>)
- Fixed a variety of legacy IE bugs (<a href="https://github.com/html2canvas/html2canvas/commit/b65357c55d0701017bafcd357bc654b54d458f8f">niklasvh</a>)

# v0.3.2 - 20.2.2012

- Added changelog!
- Added bookmarklet (<a href="https://github.com/html2canvas/html2canvas/commit/b320dd306e1a2d32a3bc5a71b6ebf6d8c060cde5">cobexer</a>)
- Option to select single element to render (<a href="https://github.com/html2canvas/html2canvas/commit/0cb252ada91c84ef411288b317c03e97da1f12ad">niklasvh</a>)
- Fixed closure compiler warnings (<a href="https://github.com/html2canvas/html2canvas/commit/36ff1ec7aadcbdf66851a0b77f0b9e87e4a8e4a1">cobexer</a>)
- Enable profiling in FF (<a href="https://github.com/html2canvas/html2canvas/commit/bbd75286a8406cf9e5aea01fdb7950d547edefb9">cobexer</a>)

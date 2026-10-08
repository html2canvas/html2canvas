---
title: 'Options'
description: 'Explore the different configuration options available for html2canvas'
previousUrl: './getting-started'
previousTitle: 'Getting Started'
nextUrl: './features'
nextTitle: 'Features'
---

These are all of the available configuration options.

| Name                   |           Default            | Description                                                                                                                                                                                                                                                                                                                                                                |
| ---------------------- | :--------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| allowTaint             |           `false`            | Whether to allow cross-origin images to taint the canvas                                                                                                                                                                                                                                                                                                                   |
| backgroundColor        |          `#ffffff`           | Canvas background color, if none is specified in DOM. Set `null` for transparent                                                                                                                                                                                                                                                                                           |
| canvas                 |            `null`            | Existing `canvas` element to use as a base for drawing on                                                                                                                                                                                                                                                                                                                  |
| clearImageCache        |           `false`            | Empty the shared image cache after rendering to release loaded-image memory. Useful in long-lived apps (SPAs) capturing many screenshots. Leave `false` to keep caching images across calls; do not enable when sharing a cache between concurrent captures.                                                                                                               |
| cullOffscreen          |           `false`            | Skip painting element nodes whose bounds fall entirely outside the captured viewport, speeding up long pages. Conservative: nodes with a CSS transform (own or inherited) or fixed/sticky positioning are always painted. Enable when capturing a viewport-sized region of a large page.                                                                                   |
| forceImageQuality      |           `false`            | When `true`, apply `imageSmoothing`/`imageSmoothingQuality` to every image and ignore each element's CSS `image-rendering`. When `false`, CSS `image-rendering` takes precedence when present.                                                                                                                                                                             |
| foreignObjectRendering |           `false`            | Whether to use ForeignObject rendering if the browser supports it                                                                                                                                                                                                                                                                                                          |
| imageSmoothing         |            `true`            | Default image smoothing (anti-aliasing) when drawing/scaling images. Set `false` for nearest-neighbour sampling (crisp pixel art, no blur on upscale). Overridden per element by CSS `image-rendering` unless `forceImageQuality` is set.                                                                                                                                  |
| imageSmoothingQuality  |            `low`             | Quality hint when smoothing is enabled: `low`, `medium`, or `high`. Maps to `CanvasRenderingContext2D.imageSmoothingQuality`.                                                                                                                                                                                                                                              |
| imageTimeout           |           `15000`            | Timeout for loading an image (in milliseconds). Set to `0` to disable timeout.                                                                                                                                                                                                                                                                                             |
| ignoreElements         |     `(element) => false`     | Predicate function which removes the matching elements from the render.                                                                                                                                                                                                                                                                                                    |
| isResourceSameOrigin   |         `undefined`          | Callback `(src) => boolean \| undefined` overriding the same-origin check for resource URLs. Return `true`/`false` to force the decision (e.g. treat a CDN as same-origin), or `undefined` to fall back to the default origin comparison.                                                                                                                                  |
| imageResolver          |         `undefined`          | Async (or sync) callback `(src) => string \| null \| undefined` called for every image URL before the built-in CORS/proxy logic. Return a data URL (or any URL loadable by `<img>`) to override loading, or `null`/`undefined` to fall back to the default behaviour. Ideal for working around CORS restrictions by converting remote images to base64 on the caller side. |
| logging                |            `true`            | Enable logging for debug purposes                                                                                                                                                                                                                                                                                                                                          |
| maxCacheSize           |         `undefined`          | Maximum number of images kept in the shared cache. When exceeded, least-recently-used entries are evicted. Leave undefined (or `<= 0`) for an unbounded cache. Useful in long-lived apps to bound memory without clearing the cache entirely.                                                                                                                              |
| onclone                |            `null`            | Callback function which is called when the Document has been cloned for rendering, can be used to modify the contents that will be rendered without affecting the original source document.                                                                                                                                                                                |
| onCopyProperty         |         `undefined`          | Callback invoked for each CSS property during style cloning. Receives `(property, style, element)`. Return `true` to mark the property as handled and skip the default copy. Useful to filter out CSS custom properties or override specific styles in the clone.                                                                                                          |
| onError                |         `undefined`          | Callback `(error) => void` invoked when a resource (image, svg, background-image, etc.) fails to load or render. Rendering continues; this is a notification hook. Errors are also written to the logger.                                                                                                                                                                  |
| onProgress             |         `undefined`          | Callback `(event: ProgressEvent) => void` invoked at each significant step of the rendering pipeline. Provides `state` (`'start'`/`'progress'`/`'end'`), `percentage` (0–100), `phase`, `elapsedMs`, and for per-element events: `renderedElements` / `totalElements`. See the [onProgress section](#onprogress) below for the full event schema and examples.             |
| progressWeights        | `{clone:1,parse:1,render:8}` | Relative weights for the three pipeline phases. Controls where the percentage breakpoints fall. Only the ratios matter — they are normalised to [0, 100] automatically. See the [progressWeights section](#progressweights) below.                                                                                                                                         |
| proxy                  |            `null`            | Url to the [proxy](./proxy) which is to be used for loading cross-origin images. If left empty, cross-origin images won't be loaded.                                                                                                                                                                                                                                       |
| removeContainer        |            `true`            | Whether to cleanup the cloned DOM elements html2canvas creates temporarily                                                                                                                                                                                                                                                                                                 |
| scale                  |  `window.devicePixelRatio`   | The scale to use for rendering. Defaults to the browsers device pixel ratio.                                                                                                                                                                                                                                                                                               |
| useCORS                |           `false`            | Whether to attempt to load images from a server using CORS                                                                                                                                                                                                                                                                                                                 |
| width                  |       `Element` width        | The width of the `canvas`                                                                                                                                                                                                                                                                                                                                                  |
| height                 |       `Element` height       | The height of the `canvas`                                                                                                                                                                                                                                                                                                                                                 |
| x                      |      `Element` x-offset      | Crop canvas x-coordinate                                                                                                                                                                                                                                                                                                                                                   |
| y                      |      `Element` y-offset      | Crop canvas y-coordinate                                                                                                                                                                                                                                                                                                                                                   |
| scrollX                |      `Element` scrollX       | The x-scroll position to used when rendering element, (for example if the Element uses `position: fixed`)                                                                                                                                                                                                                                                                  |
| scrollY                |      `Element` scrollY       | The y-scroll position to used when rendering element, (for example if the Element uses `position: fixed`)                                                                                                                                                                                                                                                                  |
| windowWidth            |     `Window.innerWidth`      | Window width to use when rendering `Element`, which may affect things like Media queries                                                                                                                                                                                                                                                                                   |
| windowHeight           |     `Window.innerHeight`     | Window height to use when rendering `Element`, which may affect things like Media queries                                                                                                                                                                                                                                                                                  |

If you wish to exclude certain `Element`s from getting rendered, you can add a `data-html2canvas-ignore` attribute to those elements and html2canvas will exclude them from the rendering.

## onCopyProperty example

The `onCopyProperty` callback is useful when the cloned document should not inherit certain styles.
For example, to strip all CSS custom properties from the clone:

```javascript
html2canvas(element, {
    onCopyProperty: property => {
        // Return true to skip copying this property
        return property.startsWith('--');
    },
});
```

Or to override a specific property in the clone:

```javascript
html2canvas(element, {
    onCopyProperty: (property, style, target) => {
        if (property === 'font-family') {
            target.style.setProperty('font-family', 'Arial, sans-serif');
            return true; // mark as handled
        }
    },
});
```

## isResourceSameOrigin example

Treat assets served from a CDN as same-origin so they load directly without CORS
or a proxy. Returning `undefined` for other URLs keeps the default behaviour:

```javascript
html2canvas(element, {
    isResourceSameOrigin: src => {
        if (src.includes('cdn.example.com')) {
            return true;
        }
        return undefined; // fall back to the default origin check
    },
});
```

## onError example

Surface resource loading failures without stopping the render:

```javascript
html2canvas(element, {
    onError: error => {
        console.warn('html2canvas resource failed:', error.message);
    },
});
```

## imageResolver example

`imageResolver` is the recommended way to handle CORS restrictions without a proxy server.
The callback receives the original image URL and must return a value loadable by an `<img>` element
(typically a base64 data URL), or `null`/`undefined` to let html2canvas fall back to its default
CORS/proxy logic.

Convert remote images to base64 before html2canvas tries to load them cross-origin:

```javascript
const urlToBase64 = src =>
    fetch(src)
        .then(r => r.blob())
        .then(
            blob =>
                new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = reject;
                    reader.readAsDataURL(blob);
                }),
        );

html2canvas(element, {
    imageResolver: async src => {
        // Only intercept images from a specific CDN; let everything else
        // go through the default path.
        if (src.startsWith('https://cdn.example.com/')) {
            return await urlToBase64(src);
        }
        return undefined;
    },
});
```

Returning `undefined` (or `null`) for a given URL leaves html2canvas in full control
of that image — `useCORS`, `proxy`, and `allowTaint` still apply normally for those URLs.

## onProgress

The `onProgress` callback lets you track how far along the rendering pipeline is.
It is invoked at every significant step, from the initial DOM clone to the final canvas draw.

### ProgressEvent schema

```typescript
interface ProgressEvent {
    /** Current pipeline stage. */
    state: 'start' | 'progress' | 'end';

    /** Completion percentage in the range [0, 100]. */
    percentage: number;

    /**
     * The pipeline phase that just completed:
     * - 'clone'   — DOM clone + iframe injection finished.
     * - 'parse'   — Element tree built from the clone.
     * - 'element' — A single element has been drawn (fires once per element).
     * - 'render'  — Canvas fully rendered (final event).
     */
    phase: 'clone' | 'parse' | 'element' | 'render';

    /** Elapsed milliseconds since rendering started. */
    elapsedMs: number;

    /** (phase 'element' only) Number of elements drawn so far. */
    renderedElements?: number;

    /** (phase 'element' only) Total number of elements to draw. */
    totalElements?: number;
}
```

### Event sequence and percentages

| state      | phase     | percentage | When it fires                                       |
| ---------- | --------- | :--------: | --------------------------------------------------- |
| `start`    | `clone`   |    `0`     | Immediately when rendering begins                   |
| `progress` | `clone`   |    `20`    | DOM cloned, iframe loaded, fonts ready              |
| `progress` | `parse`   |    `35`    | Element tree built                                  |
| `progress` | `element` |  `35–95`   | After each element is drawn (proportional to count) |
| `end`      | `render`  |   `100`    | Canvas fully rendered                               |

### Basic usage — progress bar

```javascript
const bar = document.querySelector('#progress-bar');

html2canvas(element, {
    onProgress(event) {
        bar.style.width = event.percentage + '%';

        if (event.state === 'end') {
            bar.style.display = 'none';
        }
    },
});
```

### Measuring performance by phase

```javascript
html2canvas(element, {
    onProgress(event) {
        if (event.phase !== 'element') {
            // Log only phase-level milestones, skip the per-element noise
            console.log(`[${event.state}] ${event.phase} — ${event.percentage}% (${event.elapsedMs}ms)`);
        }
    },
});

// Example output:
// [start]    clone   —   0% (0ms)
// [progress] clone   —  20% (312ms)
// [progress] parse   —  35% (318ms)
// [end]      render  — 100% (1042ms)
```

### Fine-grained element tracking

```javascript
html2canvas(element, {
    onProgress(event) {
        if (event.phase === 'element') {
            console.log(`Drawing element ${event.renderedElements} / ${event.totalElements}`);
        }
    },
});
```

### Combining onProgress with onError

Both callbacks are independent and can be used together:

```javascript
html2canvas(element, {
    onProgress(event) {
        updateProgressUI(event.percentage);
    },
    onError(error) {
        console.warn('Resource failed to load:', error.message);
    },
});
```

## progressWeights

The three pipeline phases — `clone`, `parse`, and `render` — rarely take the same
amount of time. `progressWeights` lets you tune where the percentage breakpoints fall
so that the progress bar advances in a way that feels natural for your page.

Only the **ratios** between the three values matter. They are normalised internally
so that the final percentage always reaches 100.

### Default weights

```typescript
{ clone: 1, parse: 1, render: 8 }
```

With these defaults the breakpoints are:

| Phase ends | Percentage |
| ---------- | :--------: |
| clone      |   `9 %`    |
| parse      |   `19 %`   |
| render     |  `100 %`   |

The render phase gets the most room because it emits one event per drawn element,
making it the richest source of progress feedback.

### Adjusting for heavy clone phases

If your page loads many images during cloning (e.g. with `inlineImages: true`),
increase the clone weight to give it more screen time:

```javascript
html2canvas(element, {
    progressWeights: { clone: 4, parse: 1, render: 5 },
    onProgress(event) {
        console.log(event.percentage);
    },
});
// Breakpoints → clone: 40 %, parse: 50 %, render: 100 %
```

### Equal weights

```javascript
html2canvas(element, {
    progressWeights: { clone: 1, parse: 1, render: 1 },
    onProgress(event) {
        /* ... */
    },
});
// Breakpoints → clone: 32 %, parse: 63 %, render: 100 %
```

### Partial override

Only the fields you specify are overridden; missing fields fall back to their defaults:

```javascript
// Only increase the render weight; clone and parse stay at 1
html2canvas(element, {
    progressWeights: { render: 20 },
    onProgress(event) {
        /* ... */
    },
});
```

## Performance

For tips on speeding up rendering on large pages — including the `ignoreElements`
clone optimization and `onProgress`/`progressWeights` usage — see the dedicated
[Performance](./performance) page.

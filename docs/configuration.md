---
title: 'Options'
description: 'Explore the different configuration options available for html2canvas'
previousUrl: './getting-started'
previousTitle: 'Getting Started'
nextUrl: './features'
nextTitle: 'Features'
---

These are all of the available configuration options.

| Name                   |          Default          | Description                                                                                                                                                                                                                                                       |
| ---------------------- | :-----------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| allowTaint             |          `false`          | Whether to allow cross-origin images to taint the canvas                                                                                                                                                                                                          |
| backgroundColor        |         `#ffffff`         | Canvas background color, if none is specified in DOM. Set `null` for transparent                                                                                                                                                                                  |
| canvas                 |          `null`           | Existing `canvas` element to use as a base for drawing on                                                                                                                                                                                                         |
| foreignObjectRendering |          `false`          | Whether to use ForeignObject rendering if the browser supports it                                                                                                                                                                                                 |
| imageTimeout           |          `15000`          | Timeout for loading an image (in milliseconds). Set to `0` to disable timeout.                                                                                                                                                                                    |
| ignoreElements         |   `(element) => false`    | Predicate function which removes the matching elements from the render.                                                                                                                                                                                           |
| isResourceSameOrigin   |        `undefined`        | Callback `(src) => boolean \| undefined` overriding the same-origin check for resource URLs. Return `true`/`false` to force the decision (e.g. treat a CDN as same-origin), or `undefined` to fall back to the default origin comparison.                         |
| logging                |          `true`           | Enable logging for debug purposes                                                                                                                                                                                                                                 |
| onclone                |          `null`           | Callback function which is called when the Document has been cloned for rendering, can be used to modify the contents that will be rendered without affecting the original source document.                                                                       |
| onCopyProperty         |        `undefined`        | Callback invoked for each CSS property during style cloning. Receives `(property, style, element)`. Return `true` to mark the property as handled and skip the default copy. Useful to filter out CSS custom properties or override specific styles in the clone. |
| onError                |        `undefined`        | Callback `(error) => void` invoked when a resource (image, svg, background-image, etc.) fails to load or render. Rendering continues; this is a notification hook. Errors are also written to the logger.                                                         |
| proxy                  |          `null`           | Url to the [proxy](./proxy) which is to be used for loading cross-origin images. If left empty, cross-origin images won't be loaded.                                                                                                                              |
| removeContainer        |          `true`           | Whether to cleanup the cloned DOM elements html2canvas creates temporarily                                                                                                                                                                                        |
| scale                  | `window.devicePixelRatio` | The scale to use for rendering. Defaults to the browsers device pixel ratio.                                                                                                                                                                                      |
| useCORS                |          `false`          | Whether to attempt to load images from a server using CORS                                                                                                                                                                                                        |
| width                  |      `Element` width      | The width of the `canvas`                                                                                                                                                                                                                                         |
| height                 |     `Element` height      | The height of the `canvas`                                                                                                                                                                                                                                        |
| x                      |    `Element` x-offset     | Crop canvas x-coordinate                                                                                                                                                                                                                                          |
| y                      |    `Element` y-offset     | Crop canvas y-coordinate                                                                                                                                                                                                                                          |
| scrollX                |     `Element` scrollX     | The x-scroll position to used when rendering element, (for example if the Element uses `position: fixed`)                                                                                                                                                         |
| scrollY                |     `Element` scrollY     | The y-scroll position to used when rendering element, (for example if the Element uses `position: fixed`)                                                                                                                                                         |
| windowWidth            |    `Window.innerWidth`    | Window width to use when rendering `Element`, which may affect things like Media queries                                                                                                                                                                          |
| windowHeight           |   `Window.innerHeight`    | Window height to use when rendering `Element`, which may affect things like Media queries                                                                                                                                                                         |

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

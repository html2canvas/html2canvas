---
title: 'Getting Started'
description: 'Learn how to start using html2canvas'
previousUrl: './documentation'
previousTitle: 'About'
nextUrl: './configuration'
nextTitle: 'Configuration'
---

## Installing

You can install `html2canvas` through npm or [download a built release](https://github.com/html2canvas/html2canvas/releases).

### npm / yarn / pnpm

```shell
npm install @html2canvas/html2canvas
# yarn add @html2canvas/html2canvas
# pnpm add @html2canvas/html2canvas
```

### CDN

```html
<script
    src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas-next/1.8.0/html2canvas.min.js"
    crossorigin="anonymous"
    referrerpolicy="no-referrer"
></script>
```

## Usage

Call `html2canvas(element, options?)` with any DOM element. The function returns a
[Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise)
that resolves with a `<canvas>` element.

### Promise `.then()`

```javascript
html2canvas(document.body).then(function (canvas) {
    document.body.appendChild(canvas);
});
```

### Arrow function

```javascript
html2canvas(document.body).then(canvas => {
    document.body.appendChild(canvas);
});
```

### async / await

```javascript
const canvas = await html2canvas(document.body);
document.body.appendChild(canvas);
```

### TypeScript

```typescript
import html2canvas from '@html2canvas/html2canvas';

const canvas = await html2canvas(document.body);
document.body.appendChild(canvas);
```

## Browser compatibility

**html2canvas** works on all modern evergreen browsers:

| Browser                                  | Support |
| ---------------------------------------- | ------- |
| Chrome / Chromium-based (Edge, Opera, …) | ✓       |
| Firefox                                  | ✓       |
| Safari                                   | ✓       |

The library runs entirely in the browser — **no server rendering required**. However,
because it depends on browser APIs it is **not suitable for Node.js**.

## Cross-origin content

**html2canvas** cannot circumvent browser content policy restrictions. Images or resources
loaded from a different origin will taint the canvas, making it unreadable.

To include cross-origin content, use a proxy that accepts a `?url=` query parameter and
returns the resource as a base64 data URI, then pass it via the `proxy` option:

```javascript
html2canvas(document.body, {
    proxy: 'https://your-proxy-server.com/proxy',
}).then(canvas => {
    document.body.appendChild(canvas);
});
```

See the [Proxy](./proxy) page for available options.

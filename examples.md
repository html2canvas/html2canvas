---
title: 'Examples'
description: 'Live examples of html2canvas in action'
previousUrl: './features'
previousTitle: 'Features'
nextUrl: './proxy'
nextTitle: 'Proxy'
---

## Playground

Try html2canvas directly in your browser with the interactive playground. Edit HTML and CSS on the left, see the browser rendering and the html2canvas output side by side.

- [Open the Playground](/html2canvas/examples/playground.html)

## Live demos

Static demo pages that you can open directly in your browser to see html2canvas in action.

- [Display / Box / Float / Clear test](/html2canvas/examples/demo.html) — A complex CSS rendering test with floats, borders, background colors and form elements.
- [Nested elements test](/html2canvas/examples/demo2.html) — Nested `<div>` elements with various background colors, borders, links and headings.
- [Existing canvas](/html2canvas/examples/existing_canvas.html) — Demonstrates rendering HTML content onto an already existing canvas element.

## Basic usage

Capture any element on the page and append the resulting canvas to the document.

```javascript
html2canvas(document.querySelector('#capture')).then(canvas => {
    document.body.appendChild(canvas);
});
```

## Save as image

Use `toDataURL()` to convert the canvas to a PNG and trigger a download.

```javascript
html2canvas(document.body).then(canvas => {
    const link = document.createElement('a');
    link.download = 'screenshot.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
});
```

## Capture a specific region

Pass `x`, `y`, `width` and `height` options to crop the output.

```javascript
html2canvas(document.body, {
    x: 100,
    y: 100,
    width: 400,
    height: 300,
}).then(canvas => {
    document.body.appendChild(canvas);
});
```

## Scale for high-DPI screens

Use `scale` to match the device pixel ratio and get a sharp result on retina displays.

```javascript
html2canvas(document.querySelector('#capture'), {
    scale: window.devicePixelRatio,
}).then(canvas => {
    document.body.appendChild(canvas);
});
```

## Cross-origin images

If your page includes images from another domain, configure `useCORS` or point to a
[proxy](./proxy) server.

```javascript
html2canvas(document.querySelector('#capture'), {
    useCORS: true,
}).then(canvas => {
    document.body.appendChild(canvas);
});
```

## Ignore specific elements

Add `data-html2canvas-ignore` to any element you want excluded from the screenshot.

```html
<div id="capture">
    <p>This will be captured.</p>
    <p data-html2canvas-ignore>This will be ignored.</p>
</div>
```

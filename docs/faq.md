---
title: 'FAQ'
description: 'Explore Frequently Asked Questions regarding html2canvas'
---

## Why aren't my images rendered?

html2canvas cannot circumvent content policy restrictions set by your browser. Drawing images that
reside outside of the [origin](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)
of the current page [taints the canvas](https://developer.mozilla.org/en-US/docs/Web/HTML/CORS_enabled_image),
making it unreadable. html2canvas checks whether an image would taint the canvas before applying it,
and skips it if `allowTaint` is `false` (the default).

To include cross-origin images, either:

- Enable `useCORS: true` if the image server sends the appropriate `Access-Control-Allow-Origin` header, or
- Use a [proxy](./proxy) to fetch the image through the same origin.

## Why is the produced canvas empty or cuts off half way through?

The canvas may hit [browser size limits](https://stackoverflow.com/questions/6081483/maximum-size-of-a-canvas-element).
Use the `windowWidth` / `windowHeight` options to match the element's scroll dimensions:

```javascript
await html2canvas(element, {
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
});
```

Size limits vary by browser and platform. Rather than documenting fixed numbers that change
with browser updates, the [`canvas-size`](https://github.com/jhildenbiddle/canvas-size) library
maintains up-to-date test results for each browser/platform combination.

As a rough guide based on current evergreen browsers:

| Browser           | Max dimension | Notes                                   |
| ----------------- | ------------- | --------------------------------------- |
| Chrome / Chromium | ~32,767 px    | Max area ~268 Mpx; varies by GPU and OS |
| Firefox           | ~32,767 px    | Max area ~472 Mpx                       |
| Safari (desktop)  | ~32,767 px    | Similar to Chrome                       |
| Safari (iOS)      | lower         | Depends on device RAM                   |

When a canvas exceeds the limit, the browser silently produces a blank or partially rendered
output without throwing an error — which is why this is hard to debug.

## Why doesn't CSS property X render correctly or only partially?

Every CSS property must be manually implemented to render correctly, so html2canvas will never
have full CSS support. The library targets the most
[commonly used CSS properties](./features). If a property is missing or incomplete, create
a test case and open an issue.

## How do I get html2canvas to work in a browser extension?

You should not use html2canvas in a browser extension. All major browsers expose a native
screenshot API in their extension APIs that is more reliable and does not have canvas size limits:

- **Chrome / Edge / Opera** — [`chrome.tabs.captureVisibleTab()`](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-captureVisibleTab)
- **Firefox** — [`browser.tabs.captureVisibleTab()`](https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/captureVisibleTab)
  (note: `CanvasRenderingContext2D.drawWindow()` was removed in Firefox 70)

## Why doesn't html2canvas work in Node.js?

html2canvas relies on browser APIs (`window`, `document`, computed styles, etc.) that do not
exist in Node.js. It is a client-side only library and cannot be used server-side.

If you need server-side screenshot generation, consider tools like
[Puppeteer](https://pptr.dev/) or [Playwright](https://playwright.dev/) which drive a real
browser headlessly.

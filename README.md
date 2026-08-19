# html2canvas

This project is a fork of [niklasvh/html2canvas](https://github.com/niklasvh/html2canvas).

[Homepage](https://html2canvas.github.io/html2canvas) | [Downloads](https://github.com/html2canvas/html2canvas/releases) | [Questions](https://github.com/html2canvas/html2canvas/discussions/categories/q-a)

![CI](https://github.com/html2canvas/html2canvas/workflows/CI/badge.svg?branch=master)
[![NPM Downloads](https://img.shields.io/npm/dm/@html2canvas/html2canvas.svg)](https://www.npmjs.org/package/@html2canvas/html2canvas)
[![NPM Version](https://img.shields.io/npm/v/@html2canvas/html2canvas.svg)](https://www.npmjs.org/package/@html2canvas/html2canvas)

#### JavaScript HTML renderer

The script allows you to take "screenshots" of webpages or parts of it, directly on the users browser. The screenshot is based on the DOM and as such may not be 100% accurate to the real representation as it does not make an actual screenshot, but builds the screenshot based on the information available on the page.

### How does it work?

The script renders the current page as a canvas image, by reading the DOM and the different styles applied to the elements.

It does **not require any rendering from the server**, as the whole image is created on the **client's browser**. However, as it is heavily dependent on the browser, this library is _not suitable_ to be used in nodejs.
It doesn't magically circumvent any browser content policy restrictions either, so rendering cross-origin content will require a proxy to get the content to the [same origin](http://en.wikipedia.org/wiki/Same_origin_policy). You can pass a proxy URL via the `proxy` option — the proxy must accept a `?url=` query parameter and return the resource as a base64 data URI.

### Browser compatibility

The library works on all modern evergreen browsers:

- Firefox
- Chrome / Chromium-based browsers (Edge, Opera, …)
- Safari

As each CSS property needs to be manually built to be supported, there are a number of properties that are not yet supported.

### Install

```shell
npm i @html2canvas/html2canvas
# yarn add @html2canvas/html2canvas
# pnpm add @html2canvas/html2canvas
```

### Usage

To render an `element` with html2canvas, simply call:
`html2canvas(element[, options]);`

The function returns a [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) containing the `<canvas>` element. Simply add a promise fulfillment handler to the promise using `then`:

```js
html2canvas(document.body).then(function (canvas) {
    document.body.appendChild(canvas);
});
```

or

```js
html2canvas(document.body).then((canvas) => {
    document.body.appendChild(canvas);
});
```

or

```js
const canvas = await html2canvas(document.body);
document.body.appendChild(canvas);
```

### Building

You can download ready builds [here](https://github.com/html2canvas/html2canvas/releases).

Clone git repository:

```shell
git clone git://github.com/html2canvas/html2canvas.git
```

Install dependencies:

```shell
npm install
```

Build browser bundle:

```shell
npm run build
```

### Testing

**Unit tests** (no browser required):

```shell
npm run unittest
```

**Visual reftests** (requires a browser):

1. Build the project first (only needed once, or after source changes):

    ```shell
    npm run build
    ```

2. Start the local dev server:

    ```shell
    npm start
    ```

3. Open the test runner in your browser:

    ```
    http://localhost:8080/tests/testrunner.html
    ```

    Each reftest renders a page through html2canvas and compares the output against a reference PNG stored in `tests/reftests/`. Results are shown inline with pass/fail status.

    Individual reftest pages (e.g. `tests/reftests/background/box-shadow.html`) can also be opened directly to inspect a specific feature.

### Website

The website source lives in the `www/` directory and is built with [Astro](https://astro.build). Documentation pages are Markdown files in `docs/`.

To run the website locally:

```shell
cd www
npm install
npm run dev
```

### Examples

For more information and examples, please visit the [homepage](https://html2canvas.github.io/html2canvas) or try the [test console](https://html2canvas.github.io/html2canvas/tests/).

### Contributing

If you wish to contribute to the project, please send the pull requests to the develop branch. Before submitting any changes, try and test that the changes work with all the support browsers. If some CSS property isn't supported or is incomplete, please create appropriate tests for it as well before submitting any code changes.

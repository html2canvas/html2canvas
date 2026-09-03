---
title: 'Features'
description: 'Discover the different features supported by html2canvas'
previousUrl: './configuration'
previousTitle: 'Configuration'
nextUrl: './examples'
nextTitle: 'Examples'
---

Below is a list of all the supported CSS properties and values.

## Properties

- background
    - background-attachment (`scroll`, `fixed`, `local`)
    - background-blend-mode
    - background-clip
    - background-color
    - background-image
        - url()
        - linear-gradient()
        - radial-gradient()
        - repeating-linear-gradient()
        - repeating-radial-gradient()
        - conic-gradient()
        - repeating-conic-gradient()
    - background-origin
    - background-position
    - background-size
- border
    - border-color
    - border-image
        - border-image-source (`url()` and all gradient types)
        - border-image-slice (number, percentage, `fill`)
        - border-image-width (length, number multiplier, percentage, `auto`)
        - border-image-outset (length, number multiplier)
        - border-image-repeat (`stretch`, `repeat`, `round`, `space`)
    - border-radius
    - border-style (`solid`, `dashed`, `dotted`, `double`, `groove`, `ridge`, `inset`, `outset`)
    - border-width
- bottom
- box-decoration-break (`slice` and `clone`)
- box-shadow
- box-sizing
- clip
- clip-path
    - inset()
    - circle()
    - ellipse()
    - polygon()
    - path()
- content
- color
- display
- filter
    - blur()
    - brightness()
    - contrast()
    - drop-shadow()
    - grayscale()
    - hue-rotate()
    - invert()
    - opacity()
    - saturate()
    - sepia()
- flex
- float
- font
    - font-family
    - font-size
    - font-style
    - font-variant
    - font-weight
- height
- left
- letter-spacing
- line-break
- list-style
    - list-style-image
    - list-style-position
    - list-style-type
- margin
- max-height
- max-width
- min-height
- min-width
- mix-blend-mode
- object-fit
- object-position
- opacity
- overflow
- overflow-wrap
- padding
- paint-order
- position
- right
- text-align
- text-decoration
    - text-decoration-color
    - text-decoration-line
    - text-decoration-style
    - text-decoration-thickness
    - text-decoration-inset
- text-underline-offset
- text-underline-position
- text-shadow
- text-transform
- top
- transform
    - matrix()
    - matrix3d() (**3D components projected to 2D**)
    - translate()
    - translateX()
    - translateY()
    - translate3d() (**tz ignored**)
    - translateZ() (**no-op in 2D**)
    - scale()
    - scaleX()
    - scaleY()
    - scale3d() (**sz ignored**)
    - scaleZ() (**no-op in 2D**)
    - rotate()
    - rotateZ()
    - rotateX() (**no-op in 2D**)
    - rotateY() (**no-op in 2D**)
    - rotate3d() (**only z-axis rotation maps to 2D**)
    - skew()
    - skewX()
    - skewY()
    - perspective() (**no-op in 2D**)
- visibility
- white-space
- writing-mode (**Limited support**)
- width
- word-break
- word-spacing
- word-wrap
- z-index
- zoom (**accumulated nested zoom supported**)
- -webkit-text-stroke

## Values

- bend-mode
    - multiply
    - screen
    - overlay
    - darken
    - lighten
    - color-dodge
    - color-burn
    - hard-light
    - soft-light
    - difference
    - exclusion
    - hue
    - saturation
    - color
    - luminosity
- color
    - color name
    - hexa
    - rgb()
    - hsl()
    - lch()
    - lab()
    - oklch()
    - oklab()
    - hwb()
    - color()
    - color-mix()

### Pseudo-elements

- `::before`, `::after` — `content`, `attr()`, `counter()`, `counters()`, quotes, url images
- `::first-letter` — first character wrapped in a synthetic element; supports `color`, `font-size`, `font-weight`, `font-style`, `font-family`, `text-transform`, `float`, `line-height`
- `::first-line` — partial: `color`, `font-style` only (properties that do not affect text layout); layout-affecting properties like `font-size`, `font-weight`, `letter-spacing` cannot be supported because TextBounds are measured after the native pseudo is neutralised
- `::placeholder` — `color`, `opacity`, `font-weight`, `font-style`, `background-color` on `<input>` and `<textarea>` elements when the placeholder text is shown (empty value)
- `::marker` — `color`, `font-family` on `<li>` elements; overrides the default list marker color/font

### Unsupported CSS properties

These CSS properties are **NOT** currently supported

- [font-variant-ligatures](https://github.com/niklasvh/html2canvas/pull/1085) : no canvas API
- `::selection`

## HTML elements

### Replaced elements (custom rendering)

- `<img>` — loaded via cache, supports `object-fit` and `object-position`, SVG images
- `<canvas>` — pixels captured from the original canvas (2D and WebGL)
- `<svg>` — serialised and rendered as an image
- `<video>` — current frame captured as a canvas snapshot
- `<iframe>` — content document parsed and rendered recursively
- `<object>` — rendered as image when `data` points to an image; fallback children rendered otherwise

### Form controls

- `<input type="text|password|email|tel|url|search|number">` — text rendered with vertical centering; password masked with bullets
- `<input type="checkbox">` — styled checkbox with checkmark when checked
- `<input type="radio">` — styled radio with filled circle when checked
- `<input type="range">` — track and thumb rendered based on min/max/value
- `<textarea>` — multi-line text with word-wrap, scroll offset, and letter-spacing
- `<select>` — selected option text rendered
- `<progress>` — bar with grey track and blue fill
- `<meter>` — bar with green/yellow/red fill based on low/high/optimum thresholds
- `<button>`, `<input type="submit|reset|button">` — rendered via generic CSS (no native chrome)
- `<fieldset>`, `<legend>` — top border gap around the legend, with the legend centered on the border line

### List elements

- `<ul>`, `<ol>`, `<menu>` — list owners for marker numbering
- `<li>` — list markers rendered with `list-style-type`, `list-style-position`, `list-style-image`; supports `::marker` color/font override

### Structural elements (generic CSS rendering)

These elements have no special rendering logic — they are painted using their computed CSS styles (backgrounds, borders, text, layout):

`<div>`, `<span>`, `<p>`, `<section>`, `<article>`, `<nav>`, `<aside>`, `<main>`, `<header>`, `<footer>`, `<h1>`–`<h6>`, `<figure>`, `<figcaption>`, `<blockquote>`, `<pre>`, `<code>`, `<address>`, `<a>`, `<em>`, `<strong>`, `<b>`, `<i>`, `<u>`, `<s>`, `<small>`, `<mark>`, `<del>`, `<ins>`, `<sub>`, `<sup>`, `<abbr>`, `<cite>`, `<kbd>`, `<samp>`, `<var>`, `<time>`, `<ruby>`, `<rt>`, `<bdi>`, `<bdo>`, `<wbr>`, `<br>`, `<hr>`

### Table elements

`<table>`, `<thead>`, `<tbody>`, `<tfoot>`, `<tr>`, `<td>`, `<th>`, `<caption>`

### Special handling

- `<q>` — quotation marks rendered via `::before`/`::after` with `open-quote`/`close-quote`; supports `quotes` CSS property and falls back to English-style typographic quotes (`"` `"`)
- `<details>` / `<summary>` — closed details hides all children except summary
- `<slot>` — assigned nodes are rendered instead of slot content (Shadow DOM)
- Custom elements (tags with `-`) — replaced by a generic container with copied styles
- `<style>` — CSS rules extracted and preserved in the clone
- `<script>` — always ignored

### Not supported

- `<audio>` — no visual rendering (native controls not captured)
- `<embed>` — content not accessible
- `<dialog>` `::backdrop` — dialog element renders via CSS but backdrop pseudo is not captured

---
title: 'Performance'
description: 'Tips for speeding up html2canvas on large or complex pages'
previousUrl: './features'
previousTitle: 'Features'
nextUrl: './examples'
nextTitle: 'Examples'
---

Rendering with html2canvas happens in three phases: **clone** (a full copy of the
document is built in a hidden iframe), **parse** (the clone is turned into an internal
tree), and **render** (that tree is painted to the canvas). On most pages this is fast,
but on large or complex pages one phase can dominate. This page explains how to find the
bottleneck and the levers available to reduce it.

## Measure first

Before optimizing, find out which phase is slow. The [`onProgress`](./configuration#onprogress)
callback reports each phase boundary with an `elapsedMs` timestamp, so you can see where
the time goes:

```javascript
html2canvas(element, {
    onProgress(event) {
        // Skip the per-element noise, keep the phase milestones
        if (event.phase !== 'element') {
            console.log(`${event.phase} — ${event.percentage}% @ ${event.elapsedMs}ms`);
        }
    },
});
```

The clone phase also emits sub-steps (`dom-cloned`, `html-written`, `iframe-loaded`,
`fonts-ready`, `images-ready`, `onclone-done`) through `event.step`, so a slow clone can
be pinned down precisely:

```javascript
html2canvas(element, {
    onProgress(event) {
        if (event.phase === 'clone' && event.step) {
            console.log(`clone:${event.step} @ ${event.elapsedMs}ms`);
        }
    },
});
```

A typical finding on a large app is that the clone phase accounts for the large majority
of the total time — see the next section.

## Speeding up the clone phase

Before rendering, html2canvas clones the **entire** `<html>` document into a hidden
iframe — not just the element you pass in. This is required to preserve the full CSS
cascade (stylesheets in `<head>`, inherited variables, etc.). On a small page this is
cheap, but on a large app (many DOM nodes, menus, dialogs, long lists) the clone can
dominate total render time, because every element triggers several `getComputedStyle`
calls and a full copy of its computed styles.

If you are capturing a **small element inside a large page**, you can cut most of that
cost with [`ignoreElements`](./configuration): skip the subtrees that are not part of
your target. When `ignoreElements` returns `true` for an element, html2canvas does not
clone it, does not read its computed styles, and does not descend into it — so entire
branches are dropped from the expensive clone walk.

### The pattern

Ignore everything that is **not** the target, an ancestor of the target, or a descendant
of the target:

```javascript
const target = document.getElementById('capture-me');

html2canvas(target, {
    ignoreElements: element => {
        // Never ignore anything outside <body> (keep <head>, <html>, <body>).
        if (!document.body.contains(element) || element === document.body) {
            return false;
        }
        // Keep the target, its ancestors, and its descendants; drop the rest.
        return !target.contains(element) && !element.contains(target);
    },
});
```

In a real app this took the clone phase from ~7 s down to ~2 s on a page with thousands
of nodes, with no visible difference in the output.

### Important caveats

The clone optimization is only safe when everything the target depends on is reachable
through the kept nodes. Keep these rules in mind:

- **Never ignore the `<head>`** or its `<style>` / `<link>` children. Global
  stylesheets (and therefore most backgrounds, fonts, and `var()` values) live there.
  The guard `!document.body.contains(element)` above protects them.
- **Never ignore ancestors of the target.** They carry layout context and inherited
  properties. `element.contains(target)` keeps them.
- **Watch out for inherited CSS custom properties.** If your styles rely on CSS variables
  set on `<body>` or an ancestor (e.g. `--brand-color` applied high up and read deep
  inside the target), those ancestors are kept by the pattern above, so the variables
  still cascade in. But if a style depends on a class or variable set on a **sibling**
  branch that you are ignoring, that style will be lost. In that case, widen the predicate
  to also keep the needed branch.

If in doubt, compare the output with and without `ignoreElements` on a representative
page before shipping.

## Reducing the render phase

When the render phase is the bottleneck — usually because the output is large or the page
has many elements — these options can help:

- **[`cullOffscreen`](./configuration)** — skip painting element nodes whose bounds fall
  entirely outside the captured viewport. Useful when capturing a viewport-sized region
  of a long page. It is conservative: nodes with a CSS transform (own or inherited) or
  fixed/sticky positioning are always painted.
- **`scale`** — the output is drawn at `width * scale` × `height * scale` pixels. A high
  `scale` (e.g. `window.devicePixelRatio` on a HiDPI screen, or an explicit `2`) multiplies
  the number of pixels to fill. Lower it when you do not need the extra resolution.
- **`width` / `height`** — capture only the region you need rather than the full element.

## Managing image memory

Images are cached across html2canvas calls so repeated captures of the same resources are
fast. In long-lived apps (SPAs) that capture many **distinct** screenshots, this cache can
grow indefinitely. Two options bound it:

- **[`maxCacheSize`](./configuration)** — cap the number of images kept; least-recently-used
  entries are evicted when the limit is exceeded.
- **[`clearImageCache`](./configuration)** — empty the cache after a render completes. Do
  not enable it when sharing a cache between concurrent captures.

## Keeping the UI responsive

Rendering a large page is CPU-bound and runs on the main thread, so the UI will not update
on its own while it is in progress. Use [`onProgress`](./configuration#onprogress) to drive
a progress bar, and [`progressWeights`](./configuration#progressweights) to tune where the
percentage breakpoints fall so the bar advances in a way that matches your page's actual
timing (for example, giving the clone phase more weight when it dominates).

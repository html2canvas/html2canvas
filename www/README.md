# html2canvas website

Source for [https://html2canvas.hertzen.com](https://html2canvas.hertzen.com), built with [Astro](https://astro.build) + React.

## Stack

- **Astro 5** — SSG, routing, layouts
- **React 18** — interactive components (`example`, `navigation`, `carbon`)
- **marked + shiki** — Markdown rendering with syntax highlighting (solarized-light theme)
- **webpack** — compiles `src/preview.ts` for the interactive test runner

## Structure

```
www/
├── astro.config.mjs
├── webpack.config.js          # compiles src/preview.ts → static/tests/preview.js
├── src/
│   ├── components/            # React components (.jsx)
│   │   ├── carbon.jsx
│   │   ├── example.jsx        # interactive html2canvas demo
│   │   ├── footer.jsx
│   │   └── navigation.jsx
│   ├── layouts/
│   │   ├── BaseLayout.astro   # HTML shell + global CSS
│   │   └── DocsLayout.astro   # documentation layout (nav + pagination)
│   ├── pages/
│   │   ├── index.astro        # home page
│   │   ├── [slug].astro       # doc pages generated from ../docs/*.md
│   │   └── 404.astro
│   ├── styles/global.css
│   ├── utils/markdown.ts      # marked + shiki highlighter
│   └── preview.ts             # compiled separately by webpack
└── static/                    # files served at root (publicDir)
    ├── *.svg
    └── tests/                 # webpack output
```

## Development

Install dependencies:

```shell
npm install
```

Start the development server:

```shell
npm run dev
```

## Build

Copy the dist files from the main project then build the site:

```shell
npm run build
```

The site is generated in `dist-site/`.

To build the interactive preview separately (requires webpack):

```shell
npx webpack --config webpack.config.js
```

## Documentation pages

Doc pages are automatically generated from Markdown files in `../docs/`. Each `.md` file produces a `/{slug}` route. The frontmatter supports:

| Field           | Description                        |
|-----------------|------------------------------------|
| `title`         | Page title                         |
| `description`   | Subtitle / meta description        |
| `previousUrl`   | URL of the previous page           |
| `previousTitle` | Title of the previous page         |
| `nextUrl`       | URL of the next page               |
| `nextTitle`     | Title of the next page             |

# html2canvas website

Source du site [https://html2canvas.hertzen.com](https://html2canvas.hertzen.com), construit avec [Astro](https://astro.build) + React.

## Stack

- **Astro 5** — SSG, routing, layouts
- **React 18** — composants interactifs (`example`, `navigation`, `carbon`)
- **marked + shiki** — rendu Markdown avec syntax highlighting (thème solarized-light)
- **webpack** — compile `src/preview.ts` pour le test runner interactif

## Structure

```
www/
├── astro.config.mjs
├── webpack.config.js          # compile src/preview.ts → static/tests/preview.js
├── src/
│   ├── components/            # composants React (.jsx)
│   │   ├── carbon.jsx
│   │   ├── example.jsx        # démo interactive html2canvas
│   │   ├── footer.jsx
│   │   └── navigation.jsx
│   ├── layouts/
│   │   ├── BaseLayout.astro   # shell HTML + CSS global
│   │   └── DocsLayout.astro   # layout documentation (nav + pagination)
│   ├── pages/
│   │   ├── index.astro        # page d'accueil
│   │   ├── [slug].astro       # pages docs générées depuis ../docs/*.md
│   │   └── 404.astro
│   ├── styles/global.css
│   ├── utils/markdown.ts      # marked + shiki highlighter
│   └── preview.ts             # compilé par webpack séparément
└── static/                    # fichiers servis à la racine (publicDir)
    ├── *.svg
    └── tests/                 # output webpack
```

## Développement

Installer les dépendances :

```shell
npm install
```

Lancer le serveur de développement :

```shell
npm run dev
```

## Build

Copier les fichiers dist du projet principal puis builder le site :

```shell
npm run build
```

Le site est généré dans `dist-site/`.

Pour builder le preview interactif (séparé, nécessite webpack) :

```shell
npx webpack --config webpack.config.js
```

## Pages de documentation

Les pages de doc sont générées automatiquement depuis les fichiers Markdown dans `../docs/`. Chaque fichier `.md` donne une route `/{slug}`. Le frontmatter supporte :

| Champ           | Description                        |
|-----------------|------------------------------------|
| `title`         | Titre de la page                   |
| `description`   | Sous-titre / meta description      |
| `previousUrl`   | URL de la page précédente          |
| `previousTitle` | Titre de la page précédente        |
| `nextUrl`       | URL de la page suivante            |
| `nextTitle`     | Titre de la page suivante          |

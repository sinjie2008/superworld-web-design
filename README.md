# Superworld Electronics wireframe

This site uses a framework-free SCSS and ES6+ JavaScript foundation.

## Source files

- `src/app/` — browser features, site lifecycle modules, SEO metadata, and the Worker source.
- `src/pages/` — route fragments and shared HTML layouts.
- `src/styles.scss` and `src/styles/` — scoped SCSS entry point and partials.
- `src/data/` — source data used by Specification Search.
- `scripts/build.mjs` — cross-platform build entry point.
- `worker/index.js` — generated deployment bundle; do not edit directly.

## Commands

```sh
npm run dev
npm run build
npm run validate
```

The build compiles SCSS, bundles the ES6 JavaScript, then creates the Sites Worker artifact:

```text
dist/
├── .openai/
│   └── hosting.json
└── server/
    └── index.js
```

`dist/server/index.js` is an ES module with a default `fetch(request, env, ctx)` export.

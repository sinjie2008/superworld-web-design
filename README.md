# Superworld Electronics wireframe

This site uses a framework-free SCSS and ES6+ JavaScript foundation.

## Source files

- `src/styles.scss` — all visual styles and responsive rules.
- `src/app.js` — all browser-side behavior written in framework-free ES6+ JavaScript and loaded as a module.
- `src/worker.js` — the ES module Worker shell, HTML document, and embedded assets.
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

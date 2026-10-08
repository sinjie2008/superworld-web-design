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

# Catalog Missing-Data Diagnostics

## Quick start

Use Node.js and npm with the committed lockfile. Start Apache and MySQL in Laragon for
live catalog data; PHP is not involved in choosing the frontend build mode.

```powershell
Set-Location 'C:\laragon\www\superworld-web-design'
npm ci
npm run dev
```

Open [the frontend preview](http://localhost:4173/) and
[Product Catalog Manager](http://localhost/Foundational-Electronics-Core-Systems/public/catalog_ui.html).
The preview forwards `/api/` to
`http://localhost/Foundational-Electronics-Core-Systems/api/`. Check
[API health](http://localhost:4173/api/health) if products fail to load.

## Turn diagnostics ON

Run `npm run dev` in the frontend folder. It builds development assets, then starts the
existing preview on port 4173. For a development artifact without starting a server, use
`npm run build:dev`. On a product page, missing supported content has a red outline and
a small **Check: …** button. Click or tap that button, or focus it and press Enter/Space,
to inspect details. Mouse hover also opens details. Close dismisses them; Escape and
clicking outside dismiss them too. Loading labels have a neutral style and no red outline.
Touch layouts use a compact `!` marker with a 44-pixel touch target so labels do not
cover product text; tapping reveals the same full content label and details.

Stop an existing preview with Ctrl+C before starting another one. The preview loads its
worker once at startup: after building a different mode, restart it to serve that artifact.
`npm run dev` always rebuilds development output. To preview an already-built artifact
without changing its mode, run `node scripts/dev.mjs`.

## Turn diagnostics OFF

```powershell
Set-Location 'C:\laragon\www\superworld-web-design'
npm run build:prod
npm run check:catalog-diagnostics
npm run validate
```

`npm run build` also produces production output by default. Both commands exclude the
diagnostic module, labels, editor guidance and SCSS during compilation. Public layouts,
placeholders, API values, selection, search, pagination and Inquiry remain available.
Building does not deploy anything. Deploy only a production `dist/` artifact.

To inspect production locally, stop the old preview, run `node scripts/dev.mjs`, then
refresh the browser. There should be no diagnostic labels or red diagnostic outlines,
including with `?debug=true`. The artifact checker verifies the actual worker and served
JavaScript/CSS/HTML, rather than relying on what is visually hidden.

## Command reference

| Command | Purpose | Diagnostics |
| --- | --- | --- |
| `npm run dev` | Build and start local preview | ON |
| `npm run build:dev` | Build development worker | ON |
| `npm run build:prod` | Build production worker and check for leakage | OFF |
| `npm run build` | Default production build and leakage check | OFF |
| `npm run validate` | HTML, source/artifact and Spec Search lifecycle validation | N/A; checks the current artifact |
| `npm run check:catalog-diagnostics` | Reject diagnostic leakage in production output | Requires production output |
| `node scripts/dev.mjs` | Serve the currently built worker with the local API proxy | Uses current artifact |

Build modes are explicitly validated; unknown modes fail. There is no query, storage,
browser toggle, PHP switch or debug endpoint that enables production diagnostics.

## Understand the red borders

The label belongs to the affected content, and its details distinguish missing content
from unfinished integration and technical errors. Existing fallback text is retained
for layout review; it is never counted as a successfully returned API value.
Hierarchy comes from actual tree IDs/paths and parent-child relationships, including
nested categories. Part diagnostics add the real SKU. A global marketing placeholder
without a verified catalog owner has no invented category or field.

| Status | Meaning and action |
| --- | --- |
| Missing value (`MISSING_VALUE`) | A verified public field required by this layout or by the product definition has no usable value. Update its value. |
| Missing field (`MISSING_FIELD`) | Reserved classifier state for an independently verified absent definition. Current public-only UI checks cannot emit it because omitted definitions may be hidden. Verify absence before creating a definition. |
| Missing Public API mapping (`MISSING_PUBLIC_API_MAPPING`) | The backend supports the content scope, but the Public Product API does not expose it. Category custom fields are an example. A separate mapping change is required. |
| Missing frontend mapping (`MISSING_FRONTEND_MAPPING`) | A verified public value is usable but this layout does not consume it. Entering more data will not implement the consumer. |
| API request failure (`API_REQUEST_FAILED`) | A request, HTTP response, JSON payload or expected resource failed. Check API health and Network; this does not establish missing backend data. |
| Loading (`LOADING`) | A relevant request is pending. Wait; no permanent missing-data conclusion has been made. |
| Resolved (`RESOLVED`) | The required public content is rendered, or the field is optional/not applicable. Its diagnostic is removed. |
| Mapping not verified (`MAPPING_NOT_VERIFIED`) | No exact field/association is verified, or explicit value versus default cannot be determined. Verify the source before changing data. |

Illustrative example using real API names and a verified key (not a claim that every
series lacks this value): **Series overview** → **General Products → EMC Components →
Chip Array Ferrite Bead → A4K SERIES**, field `series_notes`, source
`/api/series/general-products/emc-components/chip-array-ferrite-bead/a4k-series`
→ `metadata[series_notes].value`. Select that series and edit **Series Metadata Values**.
Saving a public nonempty Series Notes value replaces the overview fallback on the next
successful fetch/refresh and removes that overview diagnostic. It does not resolve the
separate image, compliance or document placeholders.

The UI displays exact keys only when supported by source evidence or the public
definition. It opens the normal manager entry page; ambiguous name-based manager
query parameters are deliberately not used as direct-edit links.

## Add backend data

1. Open Product Catalog Manager and expand **Hierarchy** to the category shown in the
   diagnostic. Match the full ancestor chain, especially for duplicate series names.
2. To rename a category or series, select its node and use **Update Selected Node**.
3. For category content, select the category and open **Category Fields Set**. Its
   **Category Fields Editor** supports a Field Key, Field Type and value/file, with
   **Add** and **Save**. These are arbitrary per-category fields, not a predefined
   description/image schema, and are currently absent from the Public Product API.
4. Select the correct series. To define series metadata, use **Series Metadata Field
   Editor** with the verified key, label, type and visibility/required settings, then
   **Save Metadata Field**. Review existing definitions before creating another.
5. Set its value in **Series Metadata Values** and press **Save Metadata**.
6. To define a part attribute, use **Product Attribute Field Editor** and **Save Field**.
7. Under **Products**, select the correct product row. The **Product Form** contains
   SKU, Name, Description and the generated **Custom Fields**. Update the specific
   public attribute shown by the diagnostic and press **Save Product**.
8. Confirm the manager reports a successful save. Required field validation must pass.
9. Refresh the frontend, or trigger its normal next parts fetch. The tree and family
   facets have a 15-second runtime cache; a full browser refresh starts a fresh runtime.
10. Inspect the same content. Its red outline disappears when the supported public
    value is successfully rendered. No import, migration or manual synchronization is
    needed for an already-supported field.

The manager field forms do not offer a default-value input. Required/default and
visibility behavior comes from the backend; do not guess defaults or enable hidden
fields just to remove a border. Editing a definition can clear a preexisting default,
so review definition changes carefully.

## API mapping limitations

- Category Fields Set stores scoped variables. `/api/categories/{path}` exposes only
  hierarchy properties and children; it does not expose those variables. Diagnostics
  identify this mapping gap without inventing an exact category field key.
- `series_notes` is the supported overview consumer. Existing `acf.*` part fields feed
  the table/ranges. Empty optional product attributes are not completion errors.
- The backend recognizes `series_product_image` and `series_product_spec` in its
  Specification Search. When these definitions are returned by the Public Product API,
  development diagnostics distinguish empty values from this page's missing media or
  document consumer. These keys are not guaranteed to exist on every series.
- Compliance, 3D media, pack quantity, temperature, environmental information,
  performance curves, physical drawings, tape/reel and soldering placeholders have no
  verified exact field mapping here. They remain visible and marked as unverified.
- Family layouts fetch tree/facets/field definitions, not series metadata. Their media
  labels remain unverified; an image/PDF value elsewhere does not prove it is consumed.
- Public API definitions intentionally omit public-hidden fields. An absent definition
  therefore cannot prove a field is missing. Diagnostics do not fetch private admin
  definitions or recommend making intentionally hidden content public.
- Product fields expose `required` and `defaultValue`; metadata omits required/default
  provenance. Only the chosen overview/media slots impose layout requirements on
  metadata. A nonempty API default does not prove explicit content entry; required
  product values matching a default remain unverified.
- A failed API request must be repaired before evaluating content. Creating fields or
  entering values cannot fix missing API/frontend mapping code.

## Production security

Diagnostics expose development editor paths, field mappings and the local manager URL,
so production defaults to OFF. CSS hiding would still deliver that information to the
browser. The build replaces `__CATALOG_DIAGNOSTICS__` at compile time and removes guarded
calls and the unused module; diagnostic Sass is compiled only for development.
The checker scans generated files and invokes the worker's public asset/page routes,
rejecting specific diagnostic signatures, source maps and accidentally served sources.
Public product keys and labels remain legitimate public data.

Each build clears previous generated output. Development and production asset query
keys differ, preventing a five-minute cached development asset from being reused by
the production document. Restart an existing preview after changing artifacts.
Never publish `build:dev` output or the source repository as a public static directory.
Query parameters and browser storage cannot restore code omitted from the artifact.

The preview binds to loopback by default. `node scripts/dev.mjs --host 0.0.0.0` explicitly
allows LAN access and exposes development guidance to other devices; use only on a
trusted network with appropriate access controls. Port and `/api/` proxy stay unchanged.

**Separate backend remediation:** repository defaults show no authentication guard on
the standalone manager and writable catalog/Typst routes; Laravel middleware defaults
to an empty list. Hosting may add protection, but frontend build isolation does not
secure these endpoints. Protect them with authentication/authorization in a separate
task. The legacy `v1.publicCatalogSnapshot` also does not apply the new API's public-hidden
filter; review that exposure separately. No backend code or database is changed here.

## Troubleshooting

| Symptom | Check |
| --- | --- |
| Border remains after saving | Match hierarchy/key, confirm successful save and the public API value, then refresh. A mapping gap needs code, not more data. |
| Border on an optional field | Check the returned `required` flag and whether the label describes an unverified layout mapping. Empty optional attributes should have no missing-value label; report the exact key if they do. |
| Wrong category in label | Compare `/api/tree` IDs/parents and the label's full chain; restart/refresh past the 15-second tree cache. Do not infer ownership from page text. |
| Cannot find backend field | An unverified label has no confirmed key. Hidden definitions are omitted publicly; verify scope/visibility in the manager before creating anything. |
| API value exists but placeholder remains | Check for missing frontend mapping, media/document consumers, defaults ambiguity, and whether it is the exact expected key. |
| No development labels | Start with `npm run dev`, ensure the old preview stopped, refresh, and inspect genuinely missing content rather than an optional null. |
| Production shows labels | Stop serving/publishing that artifact. Rebuild with `npm run build:prod`, run the checker, restart the preview, and inspect the new asset query keys. |
| Preview cannot reach API | Start Apache/MySQL, check `/api/health`, verify the upstream Foundational-Electronics-Core-Systems `/api/` URL; do not assume `/test/api/`. |
| Browser shows old assets | Hard refresh; verify asset query versions and restart the preview after rebuilding. |
| Production leakage check fails | Read the named file/signature or route, remove diagnostic code/SCSS from production compilation, and rebuild; never bypass the check to deploy. |
| Unexpected change after switching modes | Stop the old preview and restart the already-built worker with `node scripts/dev.mjs`. `npm run dev` deliberately rebuilds ON. |

## Technical maintenance

`src/app/catalog-missing-diagnostics.js` owns state classification, API-tree hierarchy,
verified editor guidance, escaped DOM details and overlay lifecycle. All consumers in
`src/app/product-pages.js` are guarded by the compile-time constant. Its `cancel()`
destroys diagnostic observers/listeners/controls; stale SPA requests are ignored, and
table replacement prunes old controls. Static news placeholders have no invented
catalog association. Public Series Notes rendering belongs to product business logic.

`src/styles/pages/_catalog-diagnostics.scss` is the development-only stylesheet.
`scripts/build.mjs` compiles modes, clears output, embeds assets and checks production;
`scripts/check-catalog-diagnostics.mjs` audits the actual generated worker and routes.
`scripts/dev.mjs` serves that worker and proxies the existing public endpoints.

To support a new field, verify its backend definition/scope, public visibility and API
path first; add a real public consumer and a guarded diagnostic beside it. Preserve
optional/required semantics and never use fallback text as API evidence. Do not add
private metadata requests. New nested categories/series are discovered through the
existing tree registry; the diagnostic hierarchy itself has no fixed series list.

```powershell
npm run build:dev
npm run validate
npm run build:prod
npm run check:catalog-diagnostics
npm run validate
npm run build
```

`validate` includes HTML formatting, all 20 original routes, generated asset/SEO checks
and Spec Search lifecycle behavior. Also exercise live General/Automotive routes and
parts search, pagination, selection, losses and Inquiry in both modes. Controlled
missing/resolved/error fixtures must intercept browser responses or use disposable
data, never modify the live MySQL catalog. Test dev → prod → default → dev → prod
when changing the build pipeline, and confirm unknown modes fail.

# LO Wireframe Project Memory

## Project snapshot

- Project ID: `appgprj_6a573c28aa488191a3f5547d0918f47b`
- Public site: `https://lo-wireframe.yoongsinjie.chatgpt.site`
- Snapshot date: 2026-07-30
- Stack: static site build using esbuild and Sass.

## Durable decisions

- Specification Search passes selected product IDs to Inquiry as repeated positive `inquiry` query parameters.
- Inquiry resolves those IDs from `/spec-search/mock-data.json`, preserves query order, and starts each selected product at quantity 1.
- Removing a cart row also removes its `inquiry` parameter; decrementing quantity 1 removes the row.
- The A4K detail page keeps the site's global header and adapts the standalone product-spec wireframe without its `.topbar`.
- A4K table selections use category `159` and real product IDs from the specification-search data; Analyze Losses reports estimated I²R loss at rated current.
- A4K section navigation owns its vertical offset using the live sticky header and section-nav heights; horizontally center buttons by scrolling `.a4k-section-nav`, because button `scrollIntoView()` also moves the page vertically.
- In the shared Our Products menu, General Components links to `/products/general`; Automotive Components remains non-interactive until its page is ready.
- The Contact Us page lives at `/support` and uses the `type` query parameter for General Inquiry, Request for Quotation, Technical Support, Quality / Complaint, Book An Appointment, and Anonymous layouts.
- Book An Appointment adds location and preferred-date fields; Anonymous omits contact and business fields while keeping attachment and remarks.
- The Support page locations section is a responsive slider across all six company offices: three cards on desktop, two on tablet, and one on mobile. It advances one card every 4.5 seconds, loops to the start, pauses on hover/focus or reduced-motion settings, and keeps manual Prev/Next controls without a position counter.
- Inquiry and Support text, date, and select controls share a 52 px standard height; selects use the same custom chevron with consistent right spacing.
- Support product categories use a searchable, grouped multi-checkbox picker with subcategories. Selecting Other reveals a required free-text field.
- Selecting a Support product subcategory reveals an inline optional field for its series name or part number; clearing the checkbox hides and disables that field.
- Support inquiry fields and the Contact/Business column rows align to shared vertical positions. Nested two-field groups use a 14 px row gap without last-child grid stretching, and both bordered detail panels share the same height.
- The Global Presence `/locations` page defaults to the `ALL` filter and groups visible cards under `OFFICE`, `AGENT`, and `DISTRIBUTOR` labels. Search and category filters hide any group whose cards have no matches.
- The `/locations` category filter is URL-addressable through `?category=office`, `?category=agent`, and `?category=distributor`; selecting `ALL` removes the parameter. Direct links and browser history restore the selected category.
- The `/locations` filter toolbar uses a dedicated two-column grid on desktop: four 96 px category buttons, a 24 px gap, a flexible search field, and 31 px symmetric vertical padding. At 760 px and below it stacks the tabs above search; at 560 px and below the tabs keep their 96 px width and scroll inside their own container without a visible scrollbar.
- Every application-market detail item displays a descriptive `Explore <item>` link centered below its separate image placeholder when a destination exists. AI, HPC & Emerging Tech links use `?system=server`, `?system=router`, and `?system=settopbox` to activate communication tabs. Automotive links use `?application=<slug>` to open and scroll to the matching automotive sub-application card without rendering or normalizing a `system` parameter. Other markets show a non-interactive `Details unavailable` label until destinations exist.
- All sub-application action links rendered inside `.subapp-actions` use the label `View Bundle` and navigate to Specification Search with `root=1`, categories `159` and `161`, and inquiry products `1447` and `1448`.
- Specification Search reparses `window.location.search` on every `initialize()` call so first-time SPA navigation applies bundle query parameters immediately instead of reusing the query captured at the initial page load.
- Every shared application `series-chip` reveals a mapping-row dimension panel on hover or keyboard focus; the row keeps the panel open so its link remains reachable, and clicking pins it until the chip is clicked again. Visibility, active styling, and `aria-expanded` are controlled together: visible means `true`, hidden means `false`. The panel uses the wireframe range `xxxx × xxxx × xxxx ~ xxxx × xxxx × xxxx` and links to Specification Search with `root=1`, categories `159` and `161`, and inquiry products `1447` and `1448`.
- Application detail CTA button groups stay on one horizontal row on desktop and may wrap only on narrow mobile layouts.
- All empty `.ph` image placeholders use the shared `placeholderImage()` helper with dimension-only `https://placehold.co/{width}x{height}` URLs; meaningful context stays in `alt` text and existing real images remain unchanged.
- The Support hero logo slot uses a 430 × 152 `https://placehold.co/` image, preserving the original 215:76 logo ratio while the existing CSS scales it within the container on smaller screens.
- The Quality hero brand slot uses a 420 × 148 `https://placehold.co/` image. Its desktop shell uses `var(--container-width)` and its panel is 410 px high; at 680 px and below the existing `height:auto` rule keeps the stacked mobile layout content-driven.
- Quality certificate cards render a real 300 × 201 `https://placehold.co/` `<img>` inside `.quality-certificate-visual`; the existing visual frame and Certification tag remain, and `object-fit:contain` keeps the placeholder dimensions readable at responsive card widths.
- The Event Calendar route omits its `.page-intro`; the page starts with the shared news hero immediately after the breadcrumb while other routes keep their intro sections.
- Image fitting is purpose-driven: banners, heroes, cards, thumbnails, and photographic placeholders use the reusable `image-cover` container class with hidden overflow; logos, certificates, full-product imagery, maps, and technical diagrams remain `contain`.
- `src/app/seo.js` is the single metadata registry for all 20 canonical routes. The worker renders route-specific title, description, canonical, robots, Open Graph, Twitter, JSON-LD, and a crawlable heading fallback before client JavaScript runs.
- `/robots.txt` and `/sitemap.xml` are generated by `src/app/worker.js`; sitemap entries come only from indexable metadata records. Unknown routes return a noindex 404, and known non-root trailing-slash URLs redirect permanently to the canonical path.
- `/inquiry` and `/thank-you` are intentionally `noindex,follow` because they are transactional cart/confirmation states. All other registered pages are indexable.
- Social metadata uses the generated `/assets/og.png` card. Structured data is limited to content-backed Organization, WebSite, BreadcrumbList, Product, and ContactPage entities.
- All page-level content boundaries derive from the shared `--container-width` token. Full-bleed visuals may span the viewport, but their readable content, top-level anchor navigation, confirmation panels, and every `.container` must stay within that boundary at desktop, tablet, and mobile widths.
- Shared paragraphs have no global character-based maximum width; their width comes from the parent container or an explicit component-specific rule.
- The shared header logo always preserves its 215:76 aspect ratio. Mobile changes the `.brand` width to 178 px while `.brand img` uses automatic height, keeping the primary navigation at 72 px and leaving the Menu control inside the container.
- Every shared `.hero-brand` renders a 560 × 320 dimension-only `placehold.co` image with 280w, 560w, 840w, and 1120w `srcset` candidates, contextual alt text, and a preserved 7:4 ratio. The company hero slider uses the same helper for all three slides.
- The News feature carousel keeps 44 px dot buttons while rendering 8 px circles through `::before`; its `.carousel.news-feature-carousel` rules must outrank the later global carousel normalization. The News search places borders on its input and button rather than the grid wrapper so the control stays single-bordered.
- News detail pages keep the `Share` label outside the image-backed `.socials` component. `.news-share` aligns the label and icon group with a 12 px gap so the label cannot overlap the icons; footer social icons continue using `.socials` alone.
- Header News mega-menu event placeholders are 320 × 130 and explicitly reset `.ph` minimum height to zero; otherwise the shared 180 px placeholder minimum forces cropping and hides the dimension label.
- The Achievements detail sections use a dedicated desktop hierarchy of 32 px section titles, 24 px award titles, 14 px years, and 13 px descriptions. Distinguished keeps its heading above the two-column grid with a 540:620 image frame; Customer places its heading inside the left column so it aligns with the 540:670 image frame. Both sections become text-first single columns at 560 px and below.

## Known pitfalls

- Keep the Specification Search and Inquiry query schema aligned; the Inquiry action must navigate to `/inquiry`, not open a `mailto:` URL.
- When JavaScript or CSS changes, bump the asset query version in `src/pages/layouts/document.html` (the worker imports this layout); otherwise returning visitors can receive the previous five-minute cached asset.
- Keep the inline A4K table IDs and electrical values aligned with `src/data/spec-search/mock-data.json` when that mock data changes.
- On Windows, npm scripts must not invoke a bare `bash`: CMD resolves `C:\Windows\System32\bash.exe` before Git Bash, and Git may also check shell scripts out with CRLF. The build entry point is therefore `node scripts/build.mjs`, so `npm run build` and `npm run dev` work consistently in CMD, PowerShell, and POSIX shells.
- Splitting browser modules must carry local render helpers such as `ph()` and provider-level state such as `mockDataPromise`; a green bundle does not exercise those paths, so final validation must include browser-console checks and a real mock-provider initialization.
- Specification Search scoping must preserve the former build semantics: integration tokens and sizing belong on the scope wrapper, while standalone `:root`, `html`, and `body` rules stay nested descendants rather than becoming wrapper `&` rules. Mapping `body { margin: 0 }` onto the wrapper removes the shared `.container` margins and enlarges the page title; compare wrapper geometry and screenshots against baseline after SCSS changes.

- The General Components Chip Array Ferrite Bead card links to `/products/general/emc#superworld_electronics_products_general_emc_chip_array_ferrite_bead`; update the asset query version in `src/pages/layouts/document.html` whenever client assets change.

## Typography and spacing system

- Shared type roles use Poppins for headings, navigation, and actions, and Inter for body copy, labels, form controls, and tables.
- Responsive type tokens are: page title 28-42 px, section title 22-29 px, subheading 18-20 px, card title 16 px, body 14 px (15 px on narrow viewports), label 13 px, caption 12 px, action 13 px, and table content 14 px. Mobile text-entry controls use 16 px to avoid browser zoom and improve readability.
- Every `.card` and `*-card` uses the shared card roles: 16 px titles, 14 px desktop body text, 15 px narrow-view body text, and 13 px tags/chips/badges. Numeric callouts such as `.design-card-number` keep their emphasis size.
- Bordered card slides inside `.carousel-window` need 1 px bottom padding on the clipping window so their bottom border remains visible. The shared selector covers `.card`, `.media-card`, `.release-product-card`, and `.certification-card`; governance principle cards intentionally remain left-border-only.
- Shared spacing uses a 4 px base scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, and 80 px. Section spacing is responsive from 48-72 px, compact sections from 36-48 px, standard form controls are 52 px high, and interactive targets are at least 44 px.
- Specification Search maps its embedded styles to the same monochrome Poppins/Inter type roles, spacing scale, and 52 px controls. Category and facet `.form-check` rows and labels intentionally omit the 44 px minimum height and retain an 8 px inline gap; result-table inquiry checkboxes are 20 × 20 px, and wide tables remain horizontally scrollable inside their container.
- Specification Search `.content-column` intentionally has no padding at any viewport width; its inner sections own the visible spacing so content is not inset twice.
- Specification Search facet inputs are 40 px high and use one real `.facet-search-action` button that shows a magnifier when empty, switches to a clear cross when text is entered, and restores every hidden option when cleared.
- Specification Search result-table `.series-image` cells render a real borderless 80 × 80 `<img>` from `https://placehold.co/80x80`; the image has no padding or border and keeps `object-fit:contain` at desktop and narrow widths.
- A4K product selection is rendered by the shared `a4kProductTable()` component and initialized per `[data-a4k-product-table]` instance. The A4K product page and Radial-Leaded Inductor article now share the same search, selectable rows, loss analysis, selected-parts summary, downloads, and Inquiry flow; the article no longer renders its legacy generic table or pagination.
- Communication and automotive route sections use an 18 px desktop overlap below the hero; the existing 24 px mobile overlap remains at 760 px and below.
- The Sustainability pillars section is a deliberate exception to the shared compact card typography: at desktop it uses a 1210 px three-column grid, responsive 30 px card titles, 28 px leads, 14-16 px body copy, and 13-16 px tags. Its centered 910:526 carousel overlaps the cards by 51 px; at 900 px and below the cards stack and the carousel no longer overlaps them.
- Typography/spacing QA covers all 20 routes at 1440x1000, 1024x900, and 390x844. Dynamic checks include mobile navigation, carousels, Support category/form controls, and Specification Search category, facet, result-selection, and inquiry states.
- Browser and worker JavaScript lives under `src/app/`, the 20 route fragments and shared layouts live under `src/pages/`, SCSS entry/partials live under `src/styles.scss` and `src/styles/`, and Specification Search source data lives under `src/data/`. The build imports HTML as text and does not reconstruct fixed page markup in JavaScript.
- All 23 `src/pages/**/*.html` source files use pinned Prettier 3.9.6 with CSS-aware whitespace, preserved prose wrapping, a 100-column print width, and LF endings. Use `npm run format:html`; `npm run validate` begins with `npm run check:html` so compressed or inconsistently formatted HTML cannot return unnoticed. JavaScript template literals that generate dynamic HTML remain outside this source-formatting boundary.
- `src/app/site/pages.js` fills only finite `<!--APP_SLOT:...-->` regions for dynamic news, location, support, and inquiry content; fixed route markup remains owned by the HTML fragments, and artifact validation enforces these placement and responsibility boundaries.
- Stateful browser and worker runtime modules use class-based Vanilla ES2020 boundaries: `SiteApplication` owns routing, rendering, and query-driven Inquiry loading; `SiteInteractions` exposes feature-specific setup methods plus per-render cleanup; `SiteEnhancements` owns its observer, cleanup callbacks, and every `prepare*` lifecycle as explicit instance methods; and `PageRegistry`, `SeoRegistry`, and `SiteWorker` own their registries and request lifecycle. Stateful runtime data must not live in module-scope `let` declarations.
- Specification Search composes class-based singleton collaborators for the application, state, DOM cache, query synchronization, data providers/service, rendering, requests, and events. Stateless query parsing/building, data copying, column derivation, and API contract validation intentionally remain pure functions; the artifact validator enforces these class boundaries and rejects `var` and jQuery usage.
- Main-site SCSS uses the overridable `$scope_prefix: "#app" !default` in `src/styles/base/_scope.scss`; scoped partials emit through `:where(#app)` so the boundary adds no selector specificity. Only document-level `:root`, `html`, `body`, `@font-face`, and the pre-`#app` `.skip-link` remain global.
- Main-site SCSS ownership is `layout/`, `components/`, and `pages/`, with the late `src/styles/_overrides.scss` retained as a scoped compatibility layer. Partials use BEM-style `&` nesting and keep responsive `@media` rules inside the selector they modify; `src/styles.scss` composes them with `@use`, not deprecated `@import`.
- Specification Search remains a separate CSS bundle under its overridable `$scope_prefix: "#superworld_electronics_tools_spec_search_specification_search" !default`; its integration `:root`, `html`, and `body` selectors intentionally remain descendants of that wrapper so embedded geometry does not change.
- SiteApplication is the sole SPA route owner: it destroys stateful interaction/enhancement controllers and aborts the Inquiry request before replacing `#app`; stateful widgets retain their own initialize/destroy ownership.
- Specification Search composes its stateful collaborators in `SpecificationSearchApplication`; `initialize()` first tears down the previous mount, non-Spec routes therefore act as an idempotent unload, and the private application instance is exposed only through the frozen `window.SpecSearchApp` facade (`initialize`, `getConfig`, `getState`).
- SiteApplication calls `window.SpecSearchApp.initialize()` after every route render, including non-Spec routes, so the facade also releases Spec Search listeners, cached DOM, renderer listeners, and active requests on unload.
- `scripts/validate-artifact.mjs` runs `src/app/features/spec-search/lifecycle-check.mjs`; that behavioral check covers repeated initialize/destroy listener counts, stale DOM invalidation, request abort, and the frozen facade keys. Generated artifacts remain build-only; never edit `worker/index.js`, `dist/**`, or `.generated/**` by hand.
- The esbuild `--minify` flag minifies the JavaScript wrapper but preserves HTML imported through `--loader:.html=text`; keep that flag enabled while maintaining readable, non-minified HTML in `src/pages/`.
- Current cache query versions are `/styles.css?v=132`, `/spec-search.css?v=108`, `/app.js?v=127`, and `/spec-search.js?v=101`.

## Local restoration

- On 2026-08-03, the latest Sites-linked source was restored locally, then moved to `C:\laragon\www\lo-wireframe` as the canonical local checkout.
- Use npm with the committed `package-lock.json`: `npm ci`, `npm run build`, `npm run validate`, and `npm run dev`.
- The verified local preview is `http://localhost:4173`; the build and artifact validation pass for all 20 registered routes.
- Source access uses a short-lived credential obtained from the Sites connector. The remote URL contains no credential, and no Git authorization header is persisted.
- Hosted configuration at restoration time has no production environment variables and no D1 or R2 binding.
- npm 11 may warn that `@parcel/watcher` and `esbuild` install scripts are pending approval; the current install, build, validation, and preview still succeed without changing that policy.
- GitHub mirror: `https://github.com/sinjie2008/superworld-web-design.git`; keep the Sites repository as `origin` and use a separate `github` remote for mirror pushes.

# LO Wireframe Project Memory

## Project snapshot

- Project ID: `appgprj_6a573c28aa488191a3f5547d0918f47b`
- Public site: `https://lo-wireframe.yoongsinjie.chatgpt.site`
- Snapshot date: 2026-07-27
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
- Every application-market detail item displays a descriptive `Explore <item>` link centered below its separate image placeholder when a destination exists. AI, HPC & Emerging Tech links use `?system=server`, `?system=router`, and `?system=settopbox` to activate communication tabs. Automotive links use `?application=<slug>` to open and scroll to the matching automotive sub-application card without rendering or normalizing a `system` parameter. Other markets show a non-interactive `Details unavailable` label until destinations exist.
- All sub-application action links rendered inside `.subapp-actions` use the label `View Bundle` and navigate to Specification Search with `root=1`, categories `159` and `161`, and inquiry products `1447` and `1448`.
- Specification Search reparses `window.location.search` on every `initialize()` call so first-time SPA navigation applies bundle query parameters immediately instead of reusing the query captured at the initial page load.
- Every shared application `series-chip` reveals a mapping-row dimension panel on hover or keyboard focus; the row keeps the panel open so its link remains reachable, and clicking pins it until the chip is clicked again. Visibility, active styling, and `aria-expanded` are controlled together: visible means `true`, hidden means `false`. The panel uses the wireframe range `xxxx × xxxx × xxxx ~ xxxx × xxxx × xxxx` and links to Specification Search with `root=1`, categories `159` and `161`, and inquiry products `1447` and `1448`.
- Application detail CTA button groups stay on one horizontal row on desktop and may wrap only on narrow mobile layouts.
- All empty `.ph` image placeholders use the shared `placeholderImage()` helper with dimension-only `https://placehold.co/{width}x{height}` URLs; meaningful context stays in `alt` text and existing real images remain unchanged.
- Image fitting is purpose-driven: banners, heroes, cards, thumbnails, and photographic placeholders use the reusable `image-cover` container class with hidden overflow; logos, certificates, full-product imagery, maps, and technical diagrams remain `contain`.
- `src/seo.js` is the single metadata registry for all 20 canonical routes. The worker renders route-specific title, description, canonical, robots, Open Graph, Twitter, JSON-LD, and a crawlable heading fallback before client JavaScript runs.
- `/robots.txt` and `/sitemap.xml` are generated by `src/worker.js`; sitemap entries come only from indexable metadata records. Unknown routes return a noindex 404, and known non-root trailing-slash URLs redirect permanently to the canonical path.
- `/inquiry` and `/thank-you` are intentionally `noindex,follow` because they are transactional cart/confirmation states. All other registered pages are indexable.
- Social metadata uses the generated `/assets/og.png` card. Structured data is limited to content-backed Organization, WebSite, BreadcrumbList, Product, and ContactPage entities.
- All page-level content boundaries derive from the shared `--container-width` token. Full-bleed visuals may span the viewport, but their readable content, top-level anchor navigation, confirmation panels, and every `.container` must stay within that boundary at desktop, tablet, and mobile widths.
- The shared header logo always preserves its 215:76 aspect ratio. Mobile changes the `.brand` width to 178 px while `.brand img` uses automatic height, keeping the primary navigation at 72 px and leaving the Menu control inside the container.
- Every shared `.hero-brand` renders a 560 × 320 dimension-only `placehold.co` image with 280w, 560w, 840w, and 1120w `srcset` candidates, contextual alt text, and a preserved 7:4 ratio. The company hero slider uses the same helper for all three slides.
- The News feature carousel keeps 44 px dot buttons while rendering 8 px circles through `::before`; its `.carousel.news-feature-carousel` rules must outrank the later global carousel normalization. The News search places borders on its input and button rather than the grid wrapper so the control stays single-bordered.
- Header News mega-menu event placeholders are 320 × 130 and explicitly reset `.ph` minimum height to zero; otherwise the shared 180 px placeholder minimum forces cropping and hides the dimension label.

## Known pitfalls

- Keep the Specification Search and Inquiry query schema aligned; the Inquiry action must navigate to `/inquiry`, not open a `mailto:` URL.
- When JavaScript or CSS changes, bump the asset query version in `src/worker.js`; otherwise returning visitors can receive the previous five-minute cached asset.
- Keep the inline A4K table IDs and electrical values aligned with `src/spec-search/mock-data.json` when that mock data changes.

- The General Components Chip Array Ferrite Bead card links to `/products/general/emc#superworld_electronics_products_general_emc_chip_array_ferrite_bead`; update the asset query version in `src/worker.js` whenever client assets change.

## Typography and spacing system

- Shared type roles use Poppins for headings, navigation, and actions, and Inter for body copy, labels, form controls, and tables.
- Responsive type tokens are: page title 28-42 px, section title 22-29 px, subheading 18-20 px, card title 16 px, body 14 px (15 px on narrow viewports), label 13 px, caption 12 px, action 13 px, and table content 14 px. Mobile text-entry controls use 16 px to avoid browser zoom and improve readability.
- Every `.card` and `*-card` uses the shared card roles: 16 px titles, 14 px desktop body text, 15 px narrow-view body text, and 13 px tags/chips/badges. Numeric callouts such as `.design-card-number` keep their emphasis size.
- Shared spacing uses a 4 px base scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, and 80 px. Section spacing is responsive from 48-72 px, compact sections from 36-48 px, standard form controls are 52 px high, and interactive targets are at least 44 px.
- Specification Search maps its embedded styles to the same monochrome Poppins/Inter type roles, spacing scale, and 52 px controls. Category and facet `.form-check` rows and labels intentionally omit the 44 px minimum height and retain an 8 px inline gap; result-table inquiry checkboxes are 20 × 20 px, and wide tables remain horizontally scrollable inside their container.
- Specification Search facet inputs share a `.facet-search` wrapper with a decorative CSS magnifier and 48 px right padding; every dynamically rendered Series/custom-field search uses this pattern without changing its filtering behavior.
- Typography/spacing QA covers all 20 routes at 1440x1000, 1024x900, and 390x844. Dynamic checks include mobile navigation, carousels, Support category/form controls, and Specification Search category, facet, result-selection, and inquiry states.
- Current cache query versions are `/styles.css?v=119`, `/spec-search.css?v=104`, `/app.js?v=116`, and `/spec-search.js?v=94`.

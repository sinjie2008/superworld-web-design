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

## Known pitfalls

- Keep the Specification Search and Inquiry query schema aligned; the Inquiry action must navigate to `/inquiry`, not open a `mailto:` URL.
- When JavaScript or CSS changes, bump the asset query version in `src/worker.js`; otherwise returning visitors can receive the previous five-minute cached asset.
- Keep the inline A4K table IDs and electrical values aligned with `src/spec-search/mock-data.json` when that mock data changes.

- The General Components Chip Array Ferrite Bead card links to `/products/general/emc/#superworld_electronics_products_general_emc_chip_array_ferrite_bead`; update the asset query version in `src/worker.js` whenever client assets change.

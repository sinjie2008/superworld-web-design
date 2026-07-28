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

## Known pitfalls

- Keep the Specification Search and Inquiry query schema aligned; the Inquiry action must navigate to `/inquiry`, not open a `mailto:` URL.
- When JavaScript or CSS changes, bump the asset query version in `src/worker.js`; otherwise returning visitors can receive the previous five-minute cached asset.
- Keep the inline A4K table IDs and electrical values aligned with `src/spec-search/mock-data.json` when that mock data changes.

- The General Components Chip Array Ferrite Bead card links to `/products/general/emc/#superworld_electronics_products_general_emc_chip_array_ferrite_bead`; update the asset query version in `src/worker.js` whenever client assets change.

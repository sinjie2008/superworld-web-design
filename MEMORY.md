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

## Known pitfalls

- Keep the Specification Search and Inquiry query schema aligned; the Inquiry action must navigate to `/inquiry`, not open a `mailto:` URL.
- When JavaScript or CSS changes, bump the asset query version in `src/worker.js`; otherwise returning visitors can receive the previous five-minute cached asset.

# Design QA

## Comparison Target

- Source visual truth: `/workspace/scratch/0bbd922b2b27/wireframe-reference-20260715/`
- Primary source screen: `/workspace/scratch/0bbd922b2b27/wireframe-reference-20260715/Lo - Home.jpg` (1440 × 6839)
- Product-detail source screen: `/workspace/scratch/0bbd922b2b27/wireframe-reference-20260715/Lo - Our Products _ General _ EMC _ CAFB _ A4K.png`
- Focused source region: `/workspace/scratch/0bbd922b2b27/wireframe-reference-20260715/Lo - Footer.png`
- Browser-rendered implementation screenshot: `/workspace/sites/lo-wireframe/qa/home-implementation.jpg` (1348 × 6923)
- Focused implementation screenshot: `/workspace/sites/lo-wireframe/qa/footer-implementation.jpg`
- Browser viewport: 1363 × 936; the screenshot content width excludes the vertical scrollbar.
- State: desktop, monochrome wireframe, home route, initial carousel position. A4K product detail, application expansion, specification filters, inquiry cart, and inquiry success states were also inspected.

## Findings

- No actionable P0, P1, or P2 differences remain.
- The final implementation preserves the source information architecture, section order, rectangular wireframe surfaces, large whitespace blocks, footer structure, product tables, and major page proportions.
- The remaining color difference is intentional: the source logo contains brand color, while the implementation is grayscale because the brief explicitly requested no color in this frame-review phase.

## Full-View Comparison Evidence

- The source home screenshot and the browser-rendered home screenshot were opened together in the same comparison input at the desktop state.
- The initial and post-fix comparisons covered the header, hero placeholder, achievement strip, product carousels, company overview, product lines, applications, global support, certification cards, news cards, and footer.
- The A4K product-detail source and browser-rendered product-detail page were also opened together. The implementation retains the source hierarchy, product raster, metrics, specifications table, environmental and performance sections, physical-dimension panels, tape-and-reel area, soldering area, and inquiry CTA.

## Focused Region Comparison Evidence

- Footer source and implementation crops were opened together after the final fixes.
- The footer now uses the real source WeChat and LinkedIn raster, a source-derived grayscale logo, six matching navigation columns, and the same legal-text alignment.

## Required Fidelity Surfaces

- Fonts and typography: Poppins is loaded locally for headings and navigation; Inter is loaded locally for body text. Computed browser styles confirmed both families. Weight hierarchy and uppercase display treatment match the wireframes; small wrapping differences are attributable to the 77 px viewport-width difference.
- Spacing and layout rhythm: major grids, section spacing, border weight, card proportions, and page height align closely with the source. The final home page remains within roughly one section-gap of the source height despite the narrower browser viewport.
- Colors and visual tokens: the implementation uses white, black, and neutral grays only. No brand color was introduced. Borders, fills, controls, and focus states share the monochrome token system.
- Image quality and asset fidelity: the header/footer logo, social icons, automotive system map, communication/server map, and A4K product image are source-derived raster assets embedded in the Worker and served at native aspect ratios. No handcrafted SVG or CSS illustration replaces these visible assets.
- Copy and content: section labels, navigation groups, product names, application categories, inquiry fields, and representative news/product copy follow the supplied wireframe screens.

## Comparison History

1. Initial pass
   - [P2] A fixed “Black & white wireframe” note leaked the build brief into the interface.
   - [P2] Footer social marks were text placeholders rather than the source icons.
   - Fixes: hid the build-only note; cropped, converted, embedded, and applied the source social raster.
   - Post-fix evidence: `/workspace/sites/lo-wireframe/qa/home-implementation.jpg` and `/workspace/sites/lo-wireframe/qa/footer-implementation.jpg`.
2. Focused footer pass
   - [P2] Footer logo rendered smaller than the source target.
   - Fix: set the footer logo image to fill its measured 315 px container.
   - Post-fix evidence: `/workspace/sites/lo-wireframe/qa/footer-implementation.jpg`.
3. Final pass
   - The home reference and implementation were compared again in the initial carousel state, followed by a focused footer comparison. No P0/P1/P2 findings remained.
4. User refinement pass
   - [P2] Carousel dots were not centered, dropdown carets were too small, carousel navigation lacked the reference chevrons, and the regional-support description did not share the heading's centered alignment.
   - [P2] General and Automotive tabs were visual-only, and the product-release overview link needed explicit verification.
   - Fixes: centered standalone and in-control carousel dots; added high-contrast CSS chevrons to menus, links, and carousel controls; centered the regional description; made the site header sticky; connected General and Automotive card sets; retained auto-slide behavior; and verified the Product Releases destination at `/news?category=product`.
   - Post-fix browser evidence: desktop home route at 1363 × 936, including visible header carets, centered carousel dot, right-aligned Prev/Next chevrons, both tab states, sticky header position, and centered regional-support copy. No new P0/P1/P2 findings remained.
5. Milestone and typography refinement pass
   - [P2] The milestone section was static and did not reproduce the supplied centered timeline-slider composition. The center milestone also lacked the larger double-ring treatment, active description, and dedicated Prev/Next controls.
   - [P2] Site-wide display and body typography appeared oversized relative to the supplied wireframes, and legacy carousel-dot indicators remained visible below card sliders.
   - Fixes: rebuilt the milestone area as a five-up infinite slider with a 230 px active circle versus 170 px surrounding circles, centered active copy, 4.5-second automatic movement, and working Prev/Next buttons; removed every `.carousel-dots` element; and reduced global body, navigation, heading, statistic, and card typography while preserving Poppins headings and Inter body copy.
   - Post-fix browser evidence: the supplied milestone reference `/workspace/scratch/0bbd922b2b27/upload/db4c0ba6-6634-4658-b45b-db9c11b916cb.png` and the `/company#milestones` browser state show the same five-milestone structure, enlarged center emphasis, lower active description, and right-aligned slider controls. No new P0/P1/P2 findings remained.
6. Product-table thumbnail refinement pass
   - [P2] Empty `.ph` product thumbnails inherited the global 180 px placeholder minimum height and appeared too tall in the Chip Inductor results table.
   - Fix: scoped product-table placeholders to an exact 86 × 64 px frame, matching the existing real product-thumbnail dimensions without changing placeholders elsewhere on the site.
   - Post-fix browser evidence: `/products/general/emc` rendered all 12 empty table thumbnails with the new scoped sizing and retained aligned table cells.
7. Home-hero indicator refinement pass
   - User clarification: carousel dots should remain for the `.home-hero` carousel only, positioned between the hero field and the overlapping achievement cards.
   - Fix: restored the three home-hero indicators as a centered 118 × 8 px group, placed 30 px above the achievement-card edge, while continuing to remove dot containers from every other carousel.
   - Post-fix browser evidence: the home route rendered three 34 × 8 px clickable indicators centered at the requested location; their active state advanced with the 4.5-second automatic hero rotation. No other `.carousel-dots` containers remained.

## Primary Interactions Tested

- About and News header panels open and switch correctly.
- Every carousel advances automatically; transform changes were verified after the configured interval, including the milestone slider's 4.5-second rotation.
- General and Automotive tabs switch to the matching five-card product sets; the Automotive set continues to auto-slide.
- The Latest Product Releases overview link opens the Product Releases listing state.
- Sticky header position, visible dropdown carets, the home-hero-only dot placement, and centered regional-support copy were verified from computed browser styles and visual inspection.
- Milestone Prev/Next moved the active state in both directions; the centered active milestone enlarged to 230 px while surrounding milestones remained 170 px.
- Site-wide computed typography confirmed the reduced 15 px Inter body size and smaller Poppins display scale.
- Chip Inductor table placeholders use an exact 86 × 64 px scoped rule; the matching real product image already uses the same dimensions.
- The three home-hero dots are clickable and track the automatic slide state; all non-hero dot containers remain removed.
- Application “View All” expands all six market cards and updates to “Collapse All.”
- Specification categories update the selected count; Clear resets checked filters.
- Inquiry quantity controls update the cart.
- Required inquiry fields and consent accept realistic test data; Submit navigates to the thank-you state.
- Browser console checked after the final flow: no errors originating from the Site.

## Follow-up Polish

- [P3] A dedicated mobile screenshot was not captured because the selected cloud browser exposed a fixed desktop viewport. Responsive breakpoints and mobile navigation are implemented, but this remains a residual visual test gap.

## Implementation Checklist

- [x] Source screens inspected and route/state inventory implemented.
- [x] Monochrome frame preserved.
- [x] Poppins headings and Inter body verified in-browser.
- [x] All visible sliders configured for automatic movement.
- [x] Core navigation, filters, expansion states, cart controls, and inquiry conversion flow tested.
- [x] Source-derived raster assets embedded and checked.
- [x] Post-fix full-view and focused comparisons completed.

final result: passed

# Superworld Applications QA report

**PARTIALLY VERIFIED / BLOCKED**. The four pages, 16 system routes, 56 circuit blocks, product data, responsive layout, navigation and protected-page regression passed their checks in the local preview. Four verified images appear inline. Twelve systems still require qualifying exploded-view sources or verified commercial reuse rights. Fifty-two circuit blocks still require evidence for precise physical positions.

Baseline test date 2026-11-24 22:38:16 SGT. Latest test date 2026-11-25 04:48 SGT. Frontend `C:/laragon/www/lo-wireframe`. Updated preview `http://127.0.0.1:4174`. Read-only FECS `http://localhost/Foundational-Electronics-Core-Systems/api/`.

## Coverage and evidence

| Market | Browser-tested system routes |
|---|---|
| Consumer | `/applications/consumer?system=speakers`<br>`/applications/consumer?system=hearables`<br>`/applications/consumer?system=uav`<br>`/applications/consumer?system=robotic-cleaner`<br>`/applications/consumer?system=air-purifier` |
| Healthcare Devices | `/applications/healthcare?system=blood-pressure`<br>`/applications/healthcare?system=thermometer`<br>`/applications/healthcare?system=hearing-aid` |
| Industrial & Energy | `/applications/industrial?system=industrial-robots`<br>`/applications/industrial?system=3d-printers`<br>`/applications/industrial?system=security-products`<br>`/applications/industrial?system=smart-meter`<br>`/applications/industrial?system=led-lighting` |
| Smart Home | `/applications/smart-home?system=thermostat`<br>`/applications/smart-home?system=coffee-machine`<br>`/applications/smart-home?system=door-lock` |

Also tested `/applications`, all four base routes, the four protected routes, `/tools/spec-search`, and `/support?type=Technical%20Support`. The artifact validator serves and validates metadata, canonical URLs and structured breadcrumbs on 24 routes.

| Check | Result |
|---|---|
| Approved structure | 16 systems and 56 modules. Sensor is under Robotic Cleaner, Hearing Aid is present, and LED Lighting has its own system. Browser checks confirmed unique IDs on all 16 system URLs. |
| System selection | Every deep link selected its system. Default and invalid values fall back to the first system. Desktop clicked 16 tabs and mobile tapped 16. Reload, history back/forward, keyboard Arrow and preserved unrelated query input passed. |
| Circuit navigation | 56 numbered links, 112 trigger and icon checks, plus Expand All and Collapse All per system. Both physical markers opened their intended cards. The 375px touch run expanded all modules for each system and checked overflow. |
| Product interaction | 13 Series detail controls exercised using real FECS summaries and part records. All 13 PDF URLs returned HTTP 200 with PDF content. Available FECS product images decoded in Chromium. Explicit image, dimension and PDF messages passed with simulated missing data. A simulated API 503 showed a Retry control and the retry returned live details. |
| Bundle links | 15 exact links and 28 generic Specification Search links. Exact search kept categories 161 and 195 and two series facets. The existing widget displayed Showing 1 to 6 of 6 entries. Generic fallback opened the unfiltered tool from Speakers. |
| Overview | Four View Details controls, their per-market searches, the empty-result state and the updated System Details and Explore Market links passed. Mobile Sensor search returned Robotic Cleaner and the deep link opened it. |
| Header and support | Opened the four-link market menu, used it for Smart Home on desktop and Healthcare on mobile, and reached the Technical Support route. Internal support and enquiry destinations remain on existing routes. |
| Browser health | No page exceptions or failed local requests were recorded in the successful functional and layout checks. Deliberate simulated failures were evaluated separately. |

Exact bundle tested in browser. [Hearable Products](http://127.0.0.1:4173/applications/consumer?system=hearables) · [Result URL](http://127.0.0.1:4173/tools/spec-search?root=1&category=161&category=195&filter.series=C0+SERIES&filter.series=SCI0402C+SERIES)

## Responsive review

Chrome verified four market pages at widths 1440, 1024, 768, 390 and 375. The automated run recorded 20 layout measurements, consistent stage dimensions and no page overflow. All three images decoded at each width. Both physical positions tracked the contained image rectangle and passed touch activation.

Terra independently compared the markets and the three images with the AI/HPC reference. The first review found in-word tab wrapping at 768, 390 and 375. The scoped grid correction gives three columns at 768 and two at 390/375, with desktop tabs in one row. Terra independently rechecked 12 page-width combinations, normal word wrapping, preserved stage dimensions and sampled hero layouts.

Chrome DevTools and Ego captured the initial baseline. Chromium via Playwright provided reproducible screenshots and DOM/action comparisons. The comparison contexts isolated unrelated external placeholder traffic. New image assets, local endpoints and FECS media were verified. Evidence files include `pw-baseline.json`, `pw-after.json`, `protected-flow-before.json`, `protected-flow-after.json`, `market-browser-results.json`, `market-browser-extra.json`, `visual-review.md` and PNGs under `%TEMP%/superworld-applications-01a20cc9`.

## Engineering and imagery

Engineers assessed 20 exact Series, including 13 published and seven deferred. All 56 module entries have a source and disposition. Astra independently checked all 13 exact FECS Series names, IDs, paths, categories and manufacturer PDFs, along with part and topology constraints. Forty-three modules have conditional options and thirteen have technical consultation. Circuit qualification requires the actual product design. [Product mapping and PDF evidence](PRODUCT_MAPPING_RESEARCH.md)

Three images have original and permission evidence. The only physical markers with source-supported locations are one Boombot REX driver and the BLE SoC on the documented cuffless wristband. A physical marker is omitted for the LED system because the source cannot establish the electrical positions. Thirteen other stages use their labeled placeholder with numbered circuit navigation. [Image and hotspot source register](HOTSPOT_IMAGE_SOURCES.md)

## Regression and build

- Automotive and AI/HPC Server, Router and Set Top Box matched the original main DOM checksums, section IDs, layout geometry, stage, images and original header link targets in all 20 protected route-width comparisons. Their source templates and shared Applications Sass SHA-256 values matched the baseline. The new market dropdown is additive in the shared header.
- Six before-and-after action records matched. They cover Automotive query selection, AI/HPC tab switching/history, existing hotspot and accordion actions, Series detail and bundle links, and the two completed market cards' search and links.
- `npm run build` passed with `LO_WIREFRAME_HOSTING_MANIFEST` pointing to an unchanged temporary copy of the tracked HEAD manifest. The original working-tree manifest deletion pre-dated the task and was preserved. The build produces `worker/index.js` and the ignored `dist/` package.
- `npm run validate` passed Prettier, artifact validation for all 24 routes and the existing Specification Search lifecycle check. The validator now checks the four additional routes, approved system/module counts and the three assets. `git diff --check` passed.
- The FECS Git status matched its initial status. Public health reported `database=connected` and `writeOperations=false`. Integration only made read requests. No FECS schema, API contract or product records were edited.

The preview uses same-origin read endpoints for published Series because the current FECS public JSON API does not emit browser CORS headers. The local preview defaults to the given FECS API mount. A hosted Worker can receive a browser-reachable public FECS base through `FECS_PUBLIC_API_BASE`. Exact bundles use the existing `root`, `category` and `filter.series` conventions. The existing Specification Search dataset limits which bundles it can represent.

## Agents and routing

The actual `jev` MCP server executed `jev_decide` with provider TypeSafe and `jev-latest`. Recorded choices were four market owners with independent visual and engineering work (0.95 confidence), targeted open-hardware and rights follow-up (1.00), and resuming from saved review evidence (0.96). Jev used no subagent slot.

| Role | Actual model or tool | Actual reasoning effort | Work |
|---|---|---|---|
| Sol | gpt-6.2-sol | max | Baseline, integration, live browser verification, regression |
| Jev | jev-latest via jev MCP | — | Three successful routing decisions |
| Luna 01 | gpt-6-luna | medium | Consumer research and draft |
| Luna 02 | gpt-6-luna | medium | Healthcare research and draft |
| Luna 03 | gpt-6-luna | medium | Industrial research and draft |
| Luna 04 | gpt-6-luna | medium | Smart Home research and draft |
| Terra | gpt-6.1-terra | medium | Original image and visual QA, responsive retest |
| Astra | gpt-6.2-astra | high | All 56 modules, corrections, catalog and hotspot evidence |

Effective model and effort were read from the relevant local session `turn_context` events. Six subagents actually spawned. Follow-up turns reused them. Some follow-up turns hit a usage limit before the resume. The independent integrated content review and responsive retest both finished after it.

## Files and remaining work

- Added four `src/pages/applications/` page templates and `src/pages/layouts/market-application.html`, four market configurations and one Series reference file in `src/data/applications/`, five `market-*.js` modules and scoped market Sass, three WebP assets, this report and its companion research registers, and `TASK_STATUS.md`.
- Updated the Applications overview, header, page and SEO registry, frontend lifecycle, Worker, build/preview/validation scripts, Sass entry and generated Worker artifact. The pre-existing deletion records were preserved.
- Open evidence requirements are the 13 pending images and 54 deferred physical coordinates. An original asset with reuse rights and model-specific documentation resolves each image or position gap. Final visual design is outside the requested layout phase.

## Historical functional overview revision

Verified 2026-11-24 23:24:52 SGT. The 13 systems awaiting verified images now have compact, grouped functional navigation. The `Verified Exploded View Pending` label records asset status. The 13 modules awaiting exact Series now offer category and purpose guidance drawn from the public FECS categories. The three genuine views and two physical markers were exercised in Chromium.

- The browser run checked 64 system-width cases at 1440, 768, 390 and 375px. Each view was checked for horizontal overflow, and each grouped overview was checked for clipping and consistent numbering.
- Tapped 45 grouped links and exercised keyboard opening on 13 overviews. Checked all 13 category-guidance panels and support links.
- The 4 Automotive and AI/HPC desktop DOM checksums matched the saved baseline. `npm run build` and `npm run validate` passed for the rebuilt preview.
- Test evidence and sample captures are in `%TEMP%/superworld-applications-01a20cc9`, including `functional-overview-qa.json`.

## Genuine exploded views and source links

Verified 2026-11-24 23:36:28 SGT. The preview displays three genuine exploded views with source credit, and one short source link on each of the other thirteen systems. The references all returned HTTP 200. Web pages, manuals and teardowns with unresolved image-publication rights are linked as sources.

- Chromium passed 80 system-width comparisons at 1440, 1024, 768, 390 and 375px. The three real images decoded at every width. The two supported physical hotspots were visible in the image checks.
- All 56 numbered controls opened the corresponding circuit card. All 13 category-guidance panels were present.
- Automotive and the three protected AI/HPC desktop DOM checksums matched the saved baseline. Build, 24-route validation and Git whitespace checks passed.
- Screenshots and results are in `%TEMP%/superworld-applications-01a20cc9`, including `exploded-view-references-qa.json` and `exploded-view-source-links.json`.

## OLSK Small 3D Printer V3

- Actual Jev MCP routing returned `olsksol_independent_review_and_bounded_search` with 0.88 confidence and 0.90 probability. Astra verified the assembly-model-specific license and identified the power supply and stepper driver mesh objects against the manual. Sol imported all 760 meshes in the pinned GLB, produced the exploded render in Blender 5.2.1 and checked that projection rays reached each marker's source mesh.
- The 1800 × 1240 WebP is 95,064 bytes. The preview serves the same bytes with `image/webp`. Asset metadata and the page caption credit both rights holders, disclose the changes and link the original and CC BY-SA 4.0.
- In the first desktop and mobile review, Terra found each circular marker concealed some target detail. The final design moves the numbers away from the parts, adds leader lines and retains 40 × 40px click targets. Terra's fresh 1440px and 390px captures confirmed both components remain visible and the lines identify their positions. The driver is small and its fine detail remains limited at 390px.
- Chromium passed 80 system-width cases at 1440, 1024, 768, 390 and 375px. Four images decoded, twelve source references rendered, all 56 numbered controls opened their cards, all 13 guidance panels rendered and both printer markers opened and focused the correct cards at each width. Four protected desktop DOM digests and three protected source hashes matched the baseline.
- `npm run build` with the temporary original manifest, `npm run validate` for 24 routes and `git -c core.safecrlf=false diff --check` passed. `olsk-exploded-view-qa.json`, `olsk-stage-1440.png`, `olsk-stage-390.png` and Terra's `olsk-marker-clean-*.png` are under `%TEMP%/superworld-applications-01a20cc9`. Render inputs and `final-projection.json` are in its `olsk-v3` subdirectory.

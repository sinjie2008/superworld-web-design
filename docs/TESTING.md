# Foundation verification record

Scope: `codex/wordpress-elementor-foundation`, frontend source baseline `921e44e098419baa5a6f1b463355f44cb50617d1`; read-only backend contract `c10faf4b5314668f7695a9c138a8e9333bee469d`. This is an integration foundation, not a completed WordPress migration or universal Elementor certification.

## Executed results

| Check | Status | Evidence / limits |
|---|---|---|
| Official WordPress and Elementor API research | PASS | Vendor-owned source/documentation snapshots and links in `ARCHITECTURE.md`; Elementor developer website itself was blocked, official GitHub docs were read. |
| PHP syntax | PASS | All plugin PHP files linted with PHP 8.3.35, including tests/templates/optional integration classes. |
| Component asset build | PASS | `cd superworld-core && npm ci --ignore-scripts && npm run build`; lockfile-backed esbuild/Sass; built assets included. |
| JavaScript behavior | PASS | `npm test`: **9 tests**, zero failures/skips. Init idempotence, multi-instance isolation, stale aborts, exact dotted/multi-value filter keys, search/page-size state, cross-page selection, safe text insertion, removal/replacement cleanup. |
| Actual WordPress + API adapter | PASS | **159 assertions**, WordPress 7.1.3 / PHP 8.3.35 / MariaDB 11.4 with ACF Free 6.8.10 and Elementor 4.4.0. Real WordPress functions/REST/transients; mock responses injected through its HTTP API hook. No backend DB connection. |
| Public Product API contracts | PASS (offline) | Index/health/tree/category/series resolution, fields, parts, facets, search, two pages and empty responses; exact mapped URLs/methods/query; correlation/error formats, malformed/network/redirect/oversize failures. Source-derived synthetic fixtures, not a live catalog assertion. |
| Separate Specification Search mapping | PASS (offline) | GET roots/groups and POST JSON facets/products, case-sensitive keys, list filters/object map and separate nested error envelope. No full Spec Search page migration claimed. |
| WordPress components/security | PASS | Activation/deactivation/reactivation, CPT registration, shortcode SSR/navigation including configured subtree, HTML escaping, safe PHP error output, fixed REST operations/input limits, mutation rejection, nonce/capability denial, bounded request budget. |
| Cache | PASS | Real transient hit, invalidation and backend isolation; high-cardinality requests excluded. `no-store` including repeated headers and `Vary:*` lists prevents storage. Current live backend's no-store policy is honored. |
| ACF and Elementor PHP | PASS | Local JSON fields, allow-listed editorial shortcode, dynamic-tag registration and escaped render. Authorized preview fallback for absent revision field and preservation of intentionally empty revision data. |
| ZIP installation | PASS | Final archive installed using actual WordPress `Plugin_Upgrader`, activated on a separate fresh prefix/filesystem, then tested after replacement with final package. No ACF/Elementor installed there. |
| Installed dependency-free ZIP | PASS | **150 assertions** on WordPress 7.1.3 / PHP 8.3.35. Optional ACF/Elementor cases correctly reported BLOCKED in that deliberately dependency-free installation; those cases separately pass in the full instance above. |
| Published-page browser | PASS | Real Chromium + Playwright: two parts components, page two/previous/filter/search/page-size REST requests (5 requests, all 200), retained selection and paired inquiry/SKU parameters, no browser/console/HTTP errors. Widths 390/768/1440 had no page overflow; table scroll contained. Theme font inherited. |
| Native Atomic GUI creation/edit/save | PASS (version-qualified) | Visible Elementor UI created Flexbox + Heading, edited title and used Save Options → Save Draft. Full reload retained native elements. No internal API/document-meta injection. |
| Mixed native/ACF/shortcode POC | PASS (version-qualified) | Real Shortcode widget saved editorial + parts shortcodes. Saved editor and standalone preview display native heading, ACF title and mock-backed table; Next retrieves second SKU with HTTP 200. No JS page exception. |
| Standalone frontend regression | PASS | Production build, production diagnostic-exclusion gate, Prettier HTML check, artifact/SEO/asset/lifecycle checks for all **20 routes**, run in an external copy to preserve tracked Worker. |
| Git source/backend preservation | PASS | Final source fetch returned the same baseline SHA (zero incoming commits); no merge required. Original frontend runtime/style/HTML/build/lockfile/Worker unchanged. Backend working tree clean; no backend code, DB, schema or import commands ran. |

The last archive's SHA-256 is recorded in `artifacts/superworld-core-0.1.0.zip.sha256`. It contains the plugin root, built assets and fixtures, with no `node_modules`, session configuration or credentials. Packaging is reproducible with fixed ZIP metadata.

## External and unexecuted acceptance

| Check | Status | Required next step |
|---|---|---|
| Tailscale/private live PHP API | BLOCKED | `vpn_configured:false`; no actual private API URL/binding supplied. Configure the managed connection and exact host/port, then run `tests/php/live.php` as described in `TAILSCALE_TESTING.md`. No live result is claimed. |
| User WordPress staging integration | BLOCKED | No staging URL/authentication supplied. Install ZIP in authorized staging, configure actual API base, use data-derived paths and repeat published/editor checks. |
| Elementor MCP create/edit/save | BLOCKED | No callable MCP tool/connection in this runtime. Use the installed site's discovered schemas and official ability workflow when connected. No MCP operation was simulated. |
| Preview external fonts/avatar resources | BLOCKED | Environment policy rejected `fonts.googleapis.com` and `secure.gravatar.com`. Plugin JS and product REST worked; these resource errors are distinct from page exceptions. Production font/branding choices were not changed. |
| Native Atomic GUI binding of custom dynamic tag | NOT TESTED | PHP registry/render passes; native GUI binding must be accepted in the chosen version. The saved native heading is static editable content; the separate shortcode supplies the ACF title. |
| ACF Pro and Elementor Pro features | NOT TESTED | Not installed/licensed. Foundation uses Free-compatible fields; no Pro compatibility claim. |
| Repeated editor AJAX-render stress / editor responsive controls | NOT TESTED | Independent lifecycle/replacement tests and actual saved editor/preview pass, but do not cover every editor interaction. Test the selected production version and templates. |
| Full visual parity/all-page Elementor migration | NOT TESTED | Original frontend stays the reference. Header/footer/marketing pages, full Spec Search, inquiry destination/submission, calculator ports and page-by-page layout migration remain future work. |
| Production load, failure recovery and supported minimum versions | NOT TESTED | Edge limits/monitoring and representative data-volume tests are required. WP 6.8+ is the declared floor; the runtime verification was specifically on WP 7.1.3 / PHP 8.3.35. |

No required offline check remains failing. Early integration failures (CPT hook timing, web-user file permissions, mobile table overflow, scoped catalog navigation and ACF preview revisions) were diagnosed and corrected, with affected checks rerun. Do not turn the blocked/unexecuted rows into a blanket 100% compatibility statement.

## Re-run commands

```bash
cd superworld-core
npm ci --ignore-scripts
npm run build
npm test
php tests/php/run.php /actual/path/to/disposable/wordpress
SW_WP_TEST_URL="$ACTUAL_PUBLISHED_TEST_PAGE_URL" SW_CHROMIUM=/actual/path/to/chromium node tests/browser/smoke.mjs
npm run package
cd ../artifacts
sha256sum -c superworld-core-0.1.0.zip.sha256
```

For the exact task instances, PHP commands ran through `docker --host=unix:///var/run/docker.sock exec sw-foundation-wp php .../tests/php/run.php /var/www/html` and separately `sw-foundation-zip`. The internally created published test endpoint was `http://127.0.0.1:8887/?page_id=5`; draft 6 held the saved Atomic POC. These are observed disposable test addresses, not invented user/staging URLs or public previews. The ZIP installation harness used WordPress admin `file.php`, `class-wp-upgrader.php`, `Plugin_Upgrader::install()` and `activate_plugin()` in that disposable environment.

Browser evidence retained in the task workspace includes `/tmp/sw-parts-390.png`, `/tmp/sw-parts-768.png`, `/tmp/sw-parts-1440.png`, `/tmp/sw-sol-saved-reload.png` and `/tmp/sw-final-elementor-preview.png`. Session login data stays outside the repository and is excluded from artifacts. For a new site follow `superworld-core/README.md` and `examples/elementor-poc.md`, using its actual URLs and secure authentication.

# Reproducing foundation checks

Use a disposable WordPress database and filesystem. The runner refuses `WP_ENVIRONMENT_TYPE=production`; it activates the plugin, tests actual WordPress APIs, uses transients/temporary posts and never touches the external catalog database.

## Verified offline environment

- PHP 8.3.35, WordPress 7.1.3, MariaDB 11.4.
- ACF Free 6.8.10 (official source `fa4ceb7b2773ac520d9b3c36d7271853bccd7a8f`).
- Elementor 4.4.0, official GitHub build `4.4.0-latest-1792145704`. This is a latest/nightly build, not a claim about every V4 version.
- Node 24.19.0, npm 11.9.0, Chromium 154; Playwright Core 1.56.1 and jsdom 26.1.0 are pinned in this plugin's lockfile.
- Backend source contract SHA `c10faf4b5314668f7695a9c138a8e9333bee469d`, read-only. Fixture identifiers/values are synthetic; no real product records were accessed.

The development containers used the official WordPress manifest `sha256:81a34254acaa6ff3b9a67268c2745e9a041c4094cbe5ccd35b75ed3bbdc033b5` and MariaDB manifest `sha256:1292844148b311e4ed4300022a996d39083f415a963e970cf47cad1b3b18e3a6`. They are isolated from the backend repository and database. Live processes and test database state are not part of the installable plugin.

## Commands from the source checkout

```bash
cd superworld-core
npm ci --ignore-scripts
npm run build
npm test
php tests/php/run.php /actual/path/to/disposable/wordpress
npm run package
```

PHP tests use real WordPress HTTP request hooks to provide source-derived mock transport responses; they do not replace WordPress with stubs. The runner covers all public/spec request mappings, flat/nested errors, health/tree/resolution/series/fields/parts/facets/search, pagination/empty results, unsafe inputs, network/JSON/schema/size/redirect errors, timeout/TLS options, cache hits/invalidation/no-store, shortcode escaping/navigation, REST permissions/rate budget, activation/deactivation and actual ACF/Elementor PHP tags. Optional ACF/Elementor cases print BLOCKED if those host plugins are absent. **9 JavaScript tests PASS**, including repeated initialization, isolation, stale requests, multi-value filter encoding and cleanup on removal/replacement. Exact latest assertion counts and archive installation results are in repository `docs/TESTING.md`.

For this task the equivalent PHP command ran inside the actual test container:

```bash
docker --host=unix:///var/run/docker.sock exec sw-foundation-wp \
  php /var/www/html/wp-content/plugins/superworld-core/tests/php/run.php /var/www/html
```

For another installation use its actual WordPress path, not this task's container names. Bind-mounted source directories must be readable by the PHP web user (normal directory 0755/file 0644 permissions); CLI-only success does not establish HTTP readiness. The packaged ZIP supplies normal readable permissions.

## Browser smoke

Install/activate ACF, enable explicit local fixture mode, then run the standard-API sample creator:

```bash
php examples/create-poc.php /actual/path/to/disposable/wordpress
```

It prints the created Page ID. Supply that installation's actual published Page URL. The fixture deliberately contains two tables with page size 1 so the second page is exercised:

```bash
SW_WP_TEST_URL="$ACTUAL_PUBLISHED_TEST_PAGE_URL" \
  SW_CHROMIUM=/actual/path/to/chromium \
  node tests/browser/smoke.mjs
```

The smoke checks two-instance isolation, real WordPress REST page two/previous-page/filter/search/page-size responses, retained selections/inquiry parameters, browser console/page/HTTP errors and viewport overflow at 390/768/1440. The inspected task instance used its internally created loopback endpoint `http://127.0.0.1:8887/?page_id=5`; this is not the user's staging address or a public preview. Screenshots are written to `/tmp/sw-parts-{width}.png`; inspect them for layout issues alongside the DOM checks. The test does not compare the component foundation to every original page or claim a complete responsive migration.

## External acceptance

Live Tailscale API, actual user WordPress staging and Elementor MCP remain **BLOCKED** without their configured services/URLs. `tests/php/live.php` requires the actual `SW_PRODUCT_API_BASE_URL` and uses data-derived paths, never guessed SKUs. See repository `docs/TAILSCALE_TESTING.md`.

Published WordPress rendering and the Elementor PHP tag are different from native Atomic element creation/edit/save, editor preview, ACF Pro dynamic tags and MCP operations. Record those outcomes separately in repository `docs/TESTING.md` and follow `examples/elementor-poc.md`. The plugin does not claim universal Elementor editor compatibility.

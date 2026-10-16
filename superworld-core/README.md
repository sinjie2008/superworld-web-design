# Superworld Core 0.1.0

An installable WordPress foundation for the existing standalone PHP MVC Public Product API V1. Requires PHP 8.3+ and WordPress 6.8+. Elementor and ACF are optional; this phase is not a complete site migration or a visual redesign. Tested versions and limits are in [TESTING.md](TESTING.md).

## Install

1. Download `artifacts/superworld-core-0.1.0.zip` from this branch. In an authorized WordPress installation, use **Plugins → Add Plugin → Upload Plugin**, upload the ZIP, install and activate. The ZIP contains the `superworld-core/` root and built assets; Composer/Node are not needed on the WordPress server.
2. Add the actual backend base to `wp-config.php`, before WordPress loads. Include its real project prefix and `/api`; do not point at a Laravel route or an administrative catalog URL:

   ```php
   define('SUPERWORLD_PRODUCT_API_BASE_URL', getenv('SW_PRODUCT_API_BASE_URL'));
   ```

   Configure that environment variable in the host's approved settings, or use your actual non-secret URL in server configuration. An unset URL renders a safe unavailable message; it never uses demo products automatically.
3. Open **Tools → Superworld Core** and run the authenticated health check. Cache invalidation on this page requires administrator capability and a nonce.
4. Add `[superworld_catalog]` to a page or a supported Elementor Shortcode widget. Follow a hierarchy link to inspect a series. For a standalone table component, use `[superworld_parts path="<exact-series-path-returned-by-the-API>" per_page="10"]`. No SKU or ID mapping is required.

Plugin requests use the WordPress HTTP API. Host administrators should configure normal proxy/CA settings when necessary, while retaining TLS verification. The live backend's `no-store` response is respected; there is no product import or background synchronization.

## Offline development

On a **non-production** disposable WordPress site, set:

```php
define('WP_ENVIRONMENT_TYPE', 'local');
define('SUPERWORLD_API_MODE', 'fixture');
```

The sample series path is then `general/emc/ax-10` with clearly synthetic fixture parts. Remove fixture mode before production. In development only, `SUPERWORLD_ALLOW_PRIVATE_API=true` permits the one explicitly configured private/HTTP base for Tailscale tests. It does not configure Tailscale, bypass the environment policy or disable TLS checks. See [private testing instructions](../docs/TAILSCALE_TESTING.md).

## Components and editorial content

- `[superworld_catalog path="<optional-category-path>"]`: server-rendered dynamic hierarchy. It resolves the `sw_path` query parameter for catalog navigation, independently of the standalone SPA; a configured category restricts navigation to its subtree.
- `[superworld_parts path="<series-path>" per_page="10" inquiry_url="<optional-same-site-page>"]`: dynamic columns, facets, search, server pagination and per-instance inquiry selection. Selection passes repeated `inquiry`/`sku` parameters plus the actual series path; it does not submit an inquiry, send email or implement the destination form. The initial table is readable without JavaScript; interaction requires JavaScript.
- `[superworld_editorial field="hero_title"]` or `hero_intro`: escaped ACF content from the current page/editorial post. Other field names are rejected.
- Editorial CPTs: `sw_news`, `sw_event`, `sw_announcement`, with normal WordPress editing and REST support. No product CPT or custom database table is created.
- `acf-json/` is the single schema source for shared hero fields (Pages and the three CPTs) and event dates. PHP appends this load path and registers the same JSON definitions when needed. It does not redirect other plugins' ACF save paths. Modify schemas in source rather than maintaining duplicate PHP definitions. ACF Pro repeaters are not required or claimed tested.
- Optional Elementor **Superworld Hero Title** text dynamic tag uses the documented registry and Atomic bridge. Native layout and marketing content remain Elementor elements. Shortcode-generated children are not individually editable native elements.

Public GET routes under `superworld/v1`: `tree`, `resolve`, `categories`, `series`, `fields`, `parts`, `facets`, `search`. Path resources take the exact `path` query argument. `parts` accepts `page`, `per_page` (1–100), `search`, `sort`, `direction` and nested `filter[field]`/`filter[field][]`; `search` takes `q`. Responses are decoded data; errors use the normal WordPress REST error structure. Specification Search's separate POST adapters are tested PHP capabilities; a full Specification Search widget/REST surface has not been migrated.

## Build, test and package from source

```bash
cd superworld-core
npm ci --ignore-scripts
npm run build
npm test
php tests/php/run.php /actual/path/to/disposable/wordpress
npm run package
```

The PHP runner requires an activated plugin, a non-production WordPress database and fixture files. Optional ACF/Elementor checks report BLOCKED when dependencies are absent. It changes only the selected disposable WordPress installation, using temporary posts/transients and activation state; never use it on production. Browser and live checks require explicitly configured actual URLs, documented in [TESTING.md](TESTING.md).

Development assets live in ES modules and scoped SCSS; built files are included in the ZIP. `npm ci --ignore-scripts` preserves esbuild's JS launcher and uses the lockfile's verified platform binary. The existing frontend build is not replaced. For an isolated frontend regression build, copy it outside the checkout, since its supported build rewrites tracked `worker/index.js`.

See the repository's [architecture](../docs/ARCHITECTURE.md), [API mapping](../docs/PUBLIC_API_V1.md), [JavaScript inventory](../docs/JS_COMPONENT_MAP.md), [Elementor acceptance guide](../docs/ELEMENTOR_COMPATIBILITY.md) and [upstream synchronization procedure](../docs/UPSTREAM_SYNC.md).

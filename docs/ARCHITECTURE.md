# WordPress integration foundation

The standalone frontend remains the design reference. `superworld-core/` is an installable PHP 8.3 / WordPress 6.8+ plugin, independent of its SPA, generated Worker and SCSS entry points. This phase does not migrate all pages or redesign their appearance.

## Ownership and flow

```text
Native Elementor marketing layout + ACF editorial fields
  └─ component shortcodes → templates → ProductApiInterface
Browser PartsTable → WordPress REST → validated operation
  └─ ProductApiClient → WordPress HTTP API → existing PHP MVC /api
```

`Core/Plugin` wires dependencies. `Api/` contains the replaceable backend adapter, strict input/response validation and transient cache. `Services/FixtureProductApi` provides explicit non-production demos. `Shortcodes/` and `templates/` render catalog components before JavaScript. `Rest/` exposes only fixed public read operations. `Controllers/` owns administrator diagnostics and cache invalidation. `Fields/`, `PostTypes/` and `Elementor/` contain optional editorial integrations.

There is no Laravel dependency, import, product CPT, custom table or product synchronization job. A future backend adapter implements `ProductApiInterface::request($operation, $arguments)` and returns the same normalized data/error boundary; it can be supplied through the trusted PHP filter `superworld_core/api`.

## Product and editorial boundaries

Product category paths, hierarchy, series, SKUs, IDs, definitions, values, facets, counts and pagination come from the Public Product API. Definitions drive table columns; field keys are preserved. Fixture records exist only for development and are explicitly synthetic. WordPress stores news, events, announcements and structured hero content. ACF JSON is the sole field-schema source; no product attributes are copied into ACF.

Shortcodes are component boundaries, not complete page layouts. `[superworld_catalog]` renders hierarchy and follows its own `sw_path` links through server-side resolution. `[superworld_parts path="<API-returned-series-path>"]` renders a series table. `PartsTable` owns one root, selection, abortable REST requests and cleanup. It retains selection across pagination, supports repeated instances and never invokes the standalone router. General site interaction modules and full Specification Search have not been migrated.

## Security and freshness

Only `wp-config.php`/trusted PHP configuration sets the backend base URL, including its real deployment prefix ending in `/api`. REST/shortcode input cannot choose a host, endpoint or file. Redirects are disabled; TLS verification remains enabled; requests have bounded timeouts and a 5 MiB body limit. Inputs reject URLs, traversal, encoded paths, unsupported arguments and oversized queries. Response schemas are checked before rendering; API text is escaped in PHP and inserted with DOM text methods in JavaScript. Safe correlation IDs are retained without logging payloads or credentials.

Production requires HTTPS and WordPress URL safety checks. `SUPERWORLD_ALLOW_PRIVATE_API=true` is honored by the normal factory only outside production and only for the exact configured base; it does not open arbitrary destinations. Metadata/link-local destinations remain blocked. WordPress's standard URL validation does not guarantee DNS pinning: restrict outbound traffic at the host/proxy as well.

Only validated successful low-cardinality reads are cache candidates. Transients are backend/operation/input/generation scoped, expire within 120 seconds and can be invalidated by an administrator with a nonce. Errors, health, searches, parts/filter combinations and spec queries are not cached. Upstream `no-store`, `no-cache`, `private`, `max-age`, `Age`, `Vary:*` and cookies constrain storage. **The current PHP public controller sends `Cache-Control: no-store`, so those responses are not persisted.** Cache invalidation rotates the namespace; old entries expire naturally.

Public REST has a fixed site-wide budget of 90 requests/minute, a bounded single transient fallback, and atomic object-cache increments when persistent object caching exists. The transient fallback is best-effort under concurrency, not a DDoS control. Production needs reverse-proxy rate limiting, health monitoring and capacity testing. The backend loads a series' entire part set before filtering/pagination; a small page size alone does not bound backend work. Server-rendered shortcode calls also need page/cache and edge budgets.

Fixture mode is never an automatic outage fallback and is disabled in production. Plugin activation succeeds without ACF, Elementor or API configuration; unavailable data renders a safe diagnostic. Optional components register only when their host APIs exist. No uninstall data deletion is performed.

`Services/EditorialValue` reads only the two plain hero text fields. Authorized previews inherit the canonical saved value when the latest WordPress revision lacks that field's metadata; an explicitly empty revision value remains empty. This addresses the observed Elementor/ACF preview case without disabling ACF preview filters or copying product/editorial records.

## Official references reviewed

- WordPress official 7.0 source documentation, commit `b16cd68ea199838d8f9daf0ff7e3f35042ba0ad0`: [HTTP API docblocks](https://github.com/WordPress/WordPress/blob/7.0/wp-includes/http.php), [REST registration](https://github.com/WordPress/WordPress/blob/7.0/wp-includes/rest-api.php), [shortcode API](https://github.com/WordPress/WordPress/blob/7.0/wp-includes/shortcodes.php), [script registration](https://github.com/WordPress/WordPress/blob/7.0/wp-includes/functions.wp-scripts.php).
- Elementor official v4 documentation at commit `a1680caf4bdeb38be6ecbb6736af0d2970d5b4ec`: [Atomic Builder](https://github.com/elementor/elementor/tree/a1680caf4bdeb38be6ecbb6736af0d2970d5b4ec/docs/atomic-builder), dynamic tag bridge, widget catalog, MCP composition workflow and hooks. Published developer-host requests were denied by the environment policy; the vendor's in-repository documentation was available.
- ACF official source snapshot `fa4ceb7b2773ac520d9b3c36d7271853bccd7a8f`: supported local JSON loading and local field registration.

The runtime's existing main agent owned integration and review; its model cannot be switched or independently identified through the available tools. Supported GPT-6.1 Sol handled the complex adapter, GPT-6 Luna handled independent inventory/fixtures/components, and GPT-6 Astra reviewed architecture. Unsupported `adaptive` effort was replaced with `high`; the optional Jev router was unavailable and omitted. No more than four subagents ran concurrently; write scopes were separated and reviewed by the main agent.

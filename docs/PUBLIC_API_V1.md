# Public catalog and Specification Search API contracts

This document describes the contracts implemented by the read-only backend reference at commit `c10faf4b5314668f7695a9c138a8e9333bee469d` (`plan/public-product-api-v1`). The examples in `superworld-core/tests/fixtures/` are synthetic contract examples. They do not represent a live database, deployed endpoint, or observed catalog data.

## Public Product API

The browser-facing Public Product API is a separate GET-only API mounted at `/api/` (the entrypoint is `api/index.php`; a deployment may rewrite nested `/api/...` paths to that entrypoint). It reads the existing Product Catalog Manager data and does not mutate it. Do not conflate it with the older `/catalog.php?action=v1.*` compatibility API or the Specification Search API below.

All successful responses use this envelope:

```json
{"success":true,"data":{},"correlationId":"example-request-001"}
```

Errors use this envelope, including HTTP and unexpected server errors:

```json
{"success":false,"errorCode":"NOT_FOUND","message":"Public catalog path not found.","details":{"path":"missing"},"correlationId":"example-request-001"}
```

The request may supply `X-Correlation-ID`. The backend keeps only ASCII letters, digits, `-`, `_`, and `.`, trims to 64 characters, and generates a 32-character lowercase hexadecimal ID if the sanitized value is empty. The same ID is returned in the JSON body and `X-Correlation-ID` response header. Responses set `Cache-Control: no-store` and `X-Content-Type-Options: nosniff`. Non-GET requests receive HTTP 405, `Allow: GET`, and `METHOD_NOT_ALLOWED`.

### Routes and response data

The endpoint root may be requested as `/api/` or `/api/index.php`. The route can also be passed as a `route` query parameter, which takes precedence over the request path. With a rewrite, the same routes are `/api/health`, `/api/tree`, and so on.

| Method and route | `data` shape |
|---|---|
| `GET /api/` | API metadata: `name`, `sourceOfTruth`, `readOnly`, `requiresMigration`, `requiresImport`, `requiresManualSync`, `endpointCount`, `endpoints`, and a full `tree`. |
| `GET /api/health` | `{status, database, writeOperations}`. This checks database connectivity. |
| `GET /api/tree` | Array of top-level catalog nodes recursively containing `children`; series nodes also contain `partCount`. |
| `GET /api/search?q={keyword}` | `{query, nodes, parts}`. Blank query returns empty arrays; product results are capped at 100. |
| `GET /api/resolve/{path}` | `{resource, breadcrumb}` for a category or series node. |
| `GET /api/categories/{path}` | `{resource, breadcrumb, children}`. Children are direct nodes; series children include `partCount`. |
| `GET /api/series/{path}` | `{resource, breadcrumb, metadata, fields, partCount}`. |
| `GET /api/series/{path}/fields` | Array of public product-attribute field definitions. |
| `GET /api/series/{path}/parts` | `{series, fields, parts, pagination}`. |
| `GET /api/series/{path}/facets` | `{series, totalParts, facets}`. |

Every public node has `id`, `parentId`, `name`, `type`, `slug`, `path`, and `displayOrder`. `parentId` is `null` for roots. `type` is `category` or `series`. A part contains `id`, `sku`, `name`, `description`, and `values`, with each public field key mapped to its value (including `null` when no value/default exists). Series metadata entries contain `key`, `label`, `type`, `value`, and `sortOrder`. Public fields contain `id`, `key`, `label`, `type`, `defaultValue`, `sortOrder`, and boolean `required`. Definitions marked hidden from the public portal are excluded.

Parts accept query parameters `search`, `filter[fieldKey]=value` or array values such as `filter[fieldKey][]=a&filter[fieldKey][]=b`, `sort`, `direction`, `page`, and `per_page`. Repeating an unbracketed scalar key does not create a PHP array. `filter` must parse as an array and every filter key must be a public field. Sorting supports `id`, `sku`, `name`, or a known public field; direction is `asc` or `desc`. Invalid filters, sort fields, or directions return HTTP 422 with `INVALID_QUERY`. Page is at least 1, `per_page` is clamped to 1–100 (default 25), and out-of-range pages are clamped to the final page. Pagination is `{page, per_page, total, last_page}`.

### Path handling

Paths use the backend-generated lowercase Unicode-aware slug for each hierarchy node, joined with `/`. Duplicate sibling slugs gain `-{id}`. Keep hierarchy separators literal and percent-encode reserved characters inside each segment. The controller rejects malformed percent escapes in the URL path as `INVALID_PATH` (422), strips the script directory and `index.php`, then URL-decodes each segment. The service also URL-decodes the joined path before lookup. Do not encode a full hierarchy as one opaque segment. A missing path returns `NOT_FOUND` (404) with `details.path`; a non-category category lookup returns `CATEGORY_NOT_FOUND`; a non-series series lookup returns `SERIES_NOT_FOUND`; invalid paths (empty or containing `..`) return `INVALID_PATH` (422). Unknown routes return `NOT_FOUND` (404) with `API route not found.`

## Separate Specification Search API

Specification Search uses PHP file endpoints under `/api/spec-search/` and has its own request methods and envelopes. It is not the `/api/series/{path}/facets` or `/api/series/{path}/parts` interface.

| Method and route | Request | `data` shape |
|---|---|---|
| `GET /api/spec-search/root-categories.php` | None | `{categories: [{id, name}]}` |
| `GET /api/spec-search/product-categories.php?root_id={id}` | Query `root_id` | `{groups: [{group, categories: [{id, name}]}]}` |
| `POST /api/spec-search/facets.php` | JSON `{category_ids: [id, ...]}` | `{facets: [{key, label, values: [string, ...]}]}` |
| `POST /api/spec-search/products.php` | JSON `{category_ids: [id, ...], filters: {key: [string, ...]}}` | `{items: [product, ...], total: number}` |

Product items contain `id`, `sku`, `name`, `series`, `seriesId`, `category`, `categoryId`, `seriesImage`, `pdfDownload`, and dynamic product attribute fields keyed by their backend field keys. `seriesImage` and `pdfDownload` are strings; an unavailable URL is `""`. Facets include the `series` facet when applicable, then public catalog product attribute facets with string values. Empty category selections yield empty facets or products; products are capped at 500.

Specification Search success is `{"success":true,"data":{},"correlationId":"..."}`. Its error envelope is instead `{"error":{"code":"internal_error","message":"Unexpected error","correlationId":"..."}}` with HTTP 500. This family does not share the Public Product API's top-level `errorCode`, `details`, or `success:false` error representation. Both families echo a sanitized `X-Correlation-ID` value in the response header and body.

The fixtures under `superworld-core/tests/fixtures/` demonstrate the response shapes and representative POST request bodies. They are test inputs/examples only; no endpoint was called and no database was read to create them.

# Synthetic Public Product API v1 fixtures

These files are synthetic examples that conform to the inspected backend contract. They are not captured responses, do not claim live database values, and were created without contacting an API or database. Names, IDs, measurements, product records, and correlation IDs are invented.

`catalog.json` maps endpoint names to request methods, paths, optional JSON request bodies, response fixture files, and representative status codes. It intentionally includes both the GET-only Public Product API and the separate GET/POST Specification Search API so consumers can preserve their distinct routes and envelopes.

The contract was checked against backend commit `c10faf4b5314668f7695a9c138a8e9333bee469d` on branch `plan/public-product-api-v1`, specifically:

- `app/Controllers/PublicProductApiController.php`: GET-only dispatch, route parsing, suffix routing, status/error behavior.
- `app/Services/PublicProductApiService.php`: public root, health, tree, resolve, category, series, fields, parts, facets, search shapes and path lookup.
- `app/Controllers/SpecSearchController.php`: Specification Search endpoint methods, input extraction, response envelopes, and error handling.
- `app/Services/SpecSearchService.php`: category grouping, facets and product response shapes.
- `app/Repositories/SpecSearchRepository.php`: root/group hierarchy queries and product/facet source behavior.
- `api/index.php`, `public/api/spec-search/*.php`, `app/Http/HttpResponder.php`, `app/Http/Response.php`, `app/Http/CorrelationId.php`: entrypoints, envelopes, and correlation ID behavior.

Fixture names follow the endpoint contract. `public-parts-page-1.json` and `public-parts-page-2.json` model two pages from an invented two-row series. `public-facets-empty.json` models a series whose definitions exist but which has no products. Error examples show the API's error shapes; they are not assertions that the sample requests fail in any deployment.

export const APP_CONFIG = Object.freeze({
    dataSource: "mock",
    defaultRootId: 1,
    mockDataUrl: "/spec-search/mock-data.json",
    mockDataScriptUrl: "/spec-search/mock-data.js",
    apiBaseUrl: "http://localhost/test/public/",
    endpoints: Object.freeze({
        rootCategories: "api/spec-search/root-categories.php",
        productCategories: "api/spec-search/product-categories.php",
        facets: "api/spec-search/facets.php",
        products: "api/spec-search/products.php"
    }),
    requestHeaders: Object.freeze({}),
    credentials: "same-origin",
    requestTimeoutMs: 30000,
    mockLatencyMs: 120
});

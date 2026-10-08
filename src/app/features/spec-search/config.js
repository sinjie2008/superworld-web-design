export const APP_CONFIG = Object.freeze({
  dataSource: "api",
  defaultRootId: 1,
  apiBaseUrl: "/",
  endpoints: Object.freeze({
    rootCategories: "/api/spec-search/root-categories/",
    productCategories: "/api/spec-search/product-categories/",
    facets: "/api/spec-search/facets/",
    products: "/api/spec-search/products/",
  }),
  requestHeaders: Object.freeze({}),
  credentials: "same-origin",
  requestTimeoutMs: 30000,
});

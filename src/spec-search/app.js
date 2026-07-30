"use strict";

// ======================================================
// 1. Application Configuration
// ======================================================

const APP_CONFIG = Object.freeze({
    dataSource: "mock", // Change only this value to "api" for the real provider.
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

// ======================================================
// 2. Original JSON and API Contract Notes
// ======================================================

/*
Original source inspected on 2026-07-22:
  http://localhost/test/public/spec-search.html
  http://localhost/test/public/assets/js/spec_search.js

No local or embedded JSON file is used by the original page. Its only data
sources are these four endpoints:

  GET  api/spec-search/root-categories.php
       Response data: { categories: [{ id: number, name: string }] }

  GET  api/spec-search/product-categories.php?root_id={number}
       Response data: {
         groups: [{ group: string, categories: [{ id: number, name: string }] }]
       }

  POST api/spec-search/facets.php
       JSON body: { category_ids: number[] }
       Response data: {
         facets: [{ key: string, label: string, values: string[] }]
       }

  POST api/spec-search/products.php
       JSON body: {
         category_ids: number[],
         filters: { [facetKey: string]: string[] }
       }
       Response data: { items: Product[], total: number }

Every successful response is:
  { success: true, data: object, correlationId: string }

The observed error response is:
  { error: { code: string, message: string, correlationId: string } }

Product fixed fields and observed types:
  id:number, sku:string, name:string, series:string, seriesId:number,
  category:string, categoryId:number, seriesImage:string, pdfDownload:string.
Dynamic specification fields use dotted `acf.*` keys and string values.
Missing dynamic fields are omitted. In all 4,342 records inspected,
seriesImage and pdfDownload existed as empty strings when unavailable; no
JSON null was observed in a normal product response.

The original API has no keyword, sorting, or pagination parameters. The page
performs its single all-column search, column sorting, page-size selection,
and pagination in the browser. Multiple category IDs are OR. Multiple values
within one facet are OR. Different facet keys are AND. Facets depend on the
selected categories only; selecting a facet does not recalculate other facet
options.

Authentication and transport:
  - No Authorization, API key, CSRF header, cookie, localStorage, or
    sessionStorage requirement was observed.
  - The original fetch calls use browser-default same-origin credentials.
  - Responses expose X-Correlation-ID but no Access-Control-Allow-Origin.
  - Mock mode reads APP_CONFIG.mockDataUrl with fetch over HTTP. For file://,
    it loads the generated APP_CONFIG.mockDataScriptUrl mirror instead.
  - API mode also does not currently work from file://. Host this folder on
    the same scheme/host/port as the API, or configure the API for CORS. JSON POST
    needs an OPTIONS response allowing POST and Content-Type. Credentialed
    cross-origin use additionally needs an exact allowed origin,
    Access-Control-Allow-Credentials:true, suitable cookies, and
    APP_CONFIG.credentials = "include". mode:"no-cors" cannot expose JSON.
  - Do not put bearer tokens or API secrets in this static file.

Mock source:
  mock-data.json contains a reduced 127-product snapshot read from the original
  SpecSearchService without modifying the source database. It covers every real
  product category with the lowest-ID records plus larger pagination samples. All
  records preserve the actual field spelling, casing, types, dotted specification
  keys, ID/category relationships, and response envelopes. Empty source
  seriesImage and pdfDownload values contain placeholder resources in the mock
  product fields; the renderer has no hardcoded image or PDF fallback.
  The outer maps store one API-shaped response per root while the mock provider
  applies the actual request rules.
  mock-data.js is the file:// mirror and must be regenerated after JSON changes.

Switching to the real API:
  1. Change APP_CONFIG.dataSource from "mock" to "api".
  2. Adjust apiBaseUrl/endpoints/requestHeaders/credentials only if the
     deployment differs from the inspected original.
  No HTML, state, search, filter, event, or rendering code changes are needed.

Unverified against a real browser POST because the original was protected:
  browser-generated POST request headers, database collation for manually
  supplied case variants, and records beyond the backend LIMIT 500 ceiling.
*/

// ======================================================
// 3. Mock JSON Loader
// ======================================================

let mockDataPromise = null;

function validateMockData(data) {
    expectContract(isPlainObject(data), "mockData", "object", data);
    validateRootResponse(data.rootCategories);

    expectContract(
        isPlainObject(data.productCategoriesByRootId),
        "mockData.productCategoriesByRootId",
        "object",
        data.productCategoriesByRootId
    );
    Object.entries(data.productCategoriesByRootId).forEach(([rootId, response]) => {
        expectContract(/^\d+$/.test(rootId), `mockData.productCategoriesByRootId.${rootId}`, "numeric root ID", rootId);
        validateProductCategoryResponse(response);
    });

    validateProductResponse(data.products, { categoryIds: [], filters: {} });
    validateProductResponse(data.emptyProducts, { categoryIds: [], filters: {} });
    expectContract(isPlainObject(data.error), "mockData.error", "object", data.error);
    validateErrorEnvelope(data.error.error, "mockData.error.error");

    expectContract(Array.isArray(data.facetDefinitions), "mockData.facetDefinitions", "array", data.facetDefinitions);
    const seenFacetKeys = new Set();
    data.facetDefinitions.forEach((definition, index) => {
        const path = `mockData.facetDefinitions[${index}]`;
        expectContract(isPlainObject(definition), path, "object", definition);
        expectContract(typeof definition.key === "string" && definition.key.length > 0, `${path}.key`, "non-empty string", definition.key);
        expectContract(typeof definition.label === "string" && definition.label.length > 0, `${path}.label`, "non-empty string", definition.label);
        expectContract(!seenFacetKeys.has(definition.key), `${path}.key`, "unique facet key", definition.key);
        seenFacetKeys.add(definition.key);
    });

    return data;
}

async function requestMockData() {
    expectContract(
        typeof APP_CONFIG.mockDataUrl === "string" && APP_CONFIG.mockDataUrl.length > 0,
        "config.mockDataUrl",
        "non-empty string",
        APP_CONFIG.mockDataUrl
    );

    if (window.location.protocol === "file:") {
        await new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.src = new URL(APP_CONFIG.mockDataScriptUrl, window.location.href).href;
            script.addEventListener("load", resolve, { once: true });
            script.addEventListener("error", () => reject(createDataError(
                "network",
                `Unable to load ${APP_CONFIG.mockDataScriptUrl}`
            )), { once: true });
            document.head.append(script);
        });
        return validateMockData(window.SPEC_SEARCH_MOCK_DATA);
    }

    let response;
    try {
        response = await fetch(new URL(APP_CONFIG.mockDataUrl, window.location.href), { cache: "no-store" });
    } catch (error) {
        throw createDataError("network", `Unable to load ${APP_CONFIG.mockDataUrl}`, { cause: error });
    }

    if (!response.ok) {
        throw createDataError("http", `Unable to load ${APP_CONFIG.mockDataUrl}: HTTP ${response.status}`, {
            status: response.status
        });
    }

    const text = await response.text();
    if (text.trim().length === 0) {
        throw createDataError("empty-response", `${APP_CONFIG.mockDataUrl} is empty`);
    }

    let data;
    try {
        data = JSON.parse(text);
    } catch (error) {
        throw createDataError("invalid-json", `${APP_CONFIG.mockDataUrl} contains invalid JSON`, { cause: error });
    }

    return validateMockData(data);
}

function loadMockData() {
    if (!mockDataPromise) {
        mockDataPromise = requestMockData().catch((error) => {
            mockDataPromise = null;
            throw error;
        });
    }
    return mockDataPromise;
}
// ======================================================
// 4. Response Validation
// ======================================================

function createDataError(kind, message, details = {}) {
    const error = new Error(message);
    error.name = "SpecSearchDataError";
    error.kind = kind;
    Object.assign(error, details);
    return error;
}

function actualType(value) {
    if (value === null) return "null";
    if (Array.isArray(value)) return "array";
    return typeof value;
}

function safeValue(value) {
    if (value === null || ["string", "number", "boolean", "undefined"].includes(typeof value)) {
        return String(value).slice(0, 120);
    }
    return Array.isArray(value) ? `[array length=${value.length}]` : "[object]";
}

function contractFailure(path, expected, value) {
    const details = {
        path,
        expected,
        actualType: actualType(value),
        safeValue: safeValue(value)
    };
    console.error("Spec Search contract error", details);
    throw createDataError(
        "contract",
        `Invalid response at ${path}: expected ${expected}, received ${details.actualType}`,
        details
    );
}

function expectContract(condition, path, expected, value) {
    if (!condition) contractFailure(path, expected, value);
}

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateErrorEnvelope(error, path) {
    expectContract(isPlainObject(error), path, "error object", error);
    expectContract(
        typeof error.code === "string" && error.code.length > 0,
        `${path}.code`,
        "non-empty string",
        error.code
    );
    expectContract(
        typeof error.message === "string" && error.message.length > 0,
        `${path}.message`,
        "non-empty string",
        error.message
    );
    expectContract(
        typeof error.correlationId === "string" && error.correlationId.length > 0,
        `${path}.correlationId`,
        "non-empty string",
        error.correlationId
    );
    return error;
}

function validateEnvelope(response, endpointName) {
    expectContract(isPlainObject(response), endpointName, "response object", response);

    if (isPlainObject(response.error)) {
        const error = validateErrorEnvelope(response.error, `${endpointName}.error`);
        throw createDataError("api", error.message, {
            code: error.code,
            correlationId: error.correlationId
        });
    }

    expectContract(response.success === true, `${endpointName}.success`, "true", response.success);
    expectContract(isPlainObject(response.data), `${endpointName}.data`, "object", response.data);
    expectContract(
        typeof response.correlationId === "string" && response.correlationId.length > 0,
        `${endpointName}.correlationId`,
        "non-empty string",
        response.correlationId
    );
    return response;
}

function validateIdName(value, path) {
    expectContract(isPlainObject(value), path, "object", value);
    expectContract(Number.isInteger(value.id) && value.id > 0, `${path}.id`, "positive integer", value.id);
    expectContract(typeof value.name === "string" && value.name.length > 0, `${path}.name`, "non-empty string", value.name);
}

function validateRootResponse(response) {
    const valid = validateEnvelope(response, "rootCategories");
    const categories = valid.data.categories;
    expectContract(Array.isArray(categories), "rootCategories.data.categories", "array", categories);
    const seen = new Set();
    categories.forEach((category, index) => {
        validateIdName(category, `rootCategories.data.categories[${index}]`);
        expectContract(!seen.has(category.id), `rootCategories.data.categories[${index}].id`, "unique ID", category.id);
        seen.add(category.id);
    });
    return valid;
}

function validateProductCategoryResponse(response) {
    const valid = validateEnvelope(response, "productCategories");
    const groups = valid.data.groups;
    expectContract(Array.isArray(groups), "productCategories.data.groups", "array", groups);
    const seen = new Set();
    groups.forEach((group, groupIndex) => {
        const path = `productCategories.data.groups[${groupIndex}]`;
        expectContract(isPlainObject(group), path, "object", group);
        expectContract(typeof group.group === "string", `${path}.group`, "string", group.group);
        expectContract(Array.isArray(group.categories), `${path}.categories`, "array", group.categories);
        group.categories.forEach((category, categoryIndex) => {
            const categoryPath = `${path}.categories[${categoryIndex}]`;
            validateIdName(category, categoryPath);
            expectContract(!seen.has(category.id), `${categoryPath}.id`, "unique category ID", category.id);
            seen.add(category.id);
        });
    });
    return valid;
}

function validateFacetResponse(response) {
    const valid = validateEnvelope(response, "facets");
    const facets = valid.data.facets;
    expectContract(Array.isArray(facets), "facets.data.facets", "array", facets);
    const seenKeys = new Set();
    facets.forEach((facet, facetIndex) => {
        const path = `facets.data.facets[${facetIndex}]`;
        expectContract(isPlainObject(facet), path, "object", facet);
        expectContract(typeof facet.key === "string" && facet.key.length > 0, `${path}.key`, "non-empty string", facet.key);
        expectContract(typeof facet.label === "string" && facet.label.length > 0, `${path}.label`, "non-empty string", facet.label);
        expectContract(!seenKeys.has(facet.key), `${path}.key`, "unique facet key", facet.key);
        seenKeys.add(facet.key);
        expectContract(Array.isArray(facet.values), `${path}.values`, "string array", facet.values);
        const seenValues = new Set();
        facet.values.forEach((value, valueIndex) => {
            expectContract(
                typeof value === "string" && value.length > 0,
                `${path}.values[${valueIndex}]`,
                "non-empty string",
                value
            );
            expectContract(!seenValues.has(value), `${path}.values[${valueIndex}]`, "unique value", value);
            seenValues.add(value);
        });
    });
    return valid;
}

function validateProductResponse(response, input) {
    const valid = validateEnvelope(response, "products");
    const { items, total } = valid.data;
    expectContract(Array.isArray(items), "products.data.items", "array", items);
    expectContract(Number.isInteger(total) && total >= 0, "products.data.total", "non-negative integer", total);
    expectContract(total === items.length, "products.data.total", "items.length", total);

    const selectedCategoryIds = new Set(input.categoryIds);
    const seenIds = new Set();
    const requiredStrings = ["sku", "name", "series", "category"];
    const optionalUrlStrings = ["seriesImage", "pdfDownload"];

    items.forEach((product, productIndex) => {
        const path = `products.data.items[${productIndex}]`;
        expectContract(isPlainObject(product), path, "object", product);
        expectContract(Number.isInteger(product.id) && product.id > 0, `${path}.id`, "positive integer", product.id);
        expectContract(!seenIds.has(product.id), `${path}.id`, "unique product ID", product.id);
        seenIds.add(product.id);
        requiredStrings.forEach((key) => {
            expectContract(typeof product[key] === "string" && product[key].length > 0, `${path}.${key}`, "non-empty string", product[key]);
        });
        expectContract(Number.isInteger(product.seriesId) && product.seriesId > 0, `${path}.seriesId`, "positive integer", product.seriesId);
        expectContract(Number.isInteger(product.categoryId) && product.categoryId > 0, `${path}.categoryId`, "positive integer", product.categoryId);
        if (selectedCategoryIds.size > 0) {
            expectContract(selectedCategoryIds.has(product.categoryId), `${path}.categoryId`, "selected category ID", product.categoryId);
        }
        optionalUrlStrings.forEach((key) => {
            expectContract(typeof product[key] === "string", `${path}.${key}`, "string", product[key]);
        });
        Object.keys(product).filter((key) => key.startsWith("acf.")).forEach((key) => {
            expectContract(typeof product[key] === "string", `${path}.${key}`, "string", product[key]);
        });
        Object.entries(input.filters).forEach(([key, values]) => {
            const productValue = key === "series" ? product.series : product[key];
            expectContract(values.includes(productValue), `${path}.${key}`, `one of ${values.join(", ")}`, productValue);
        });
    });
    return valid;
}

// ======================================================
// 5. Mock Data Provider
// ======================================================

function deepCopy(value) {
    return JSON.parse(JSON.stringify(value));
}

function mockDelay(signal) {
    return new Promise((resolve, reject) => {
        if (signal && signal.aborted) {
            reject(new DOMException("Request aborted", "AbortError"));
            return;
        }
        const timer = window.setTimeout(resolve, APP_CONFIG.mockLatencyMs);
        if (signal) {
            signal.addEventListener("abort", () => {
                window.clearTimeout(timer);
                reject(new DOMException("Request aborted", "AbortError"));
            }, { once: true });
        }
    });
}

function mockEnvelope(data, correlationId) {
    return { success: true, data, correlationId };
}

const mockDataProvider = {
    async getRootCategories({ signal } = {}) {
        const [mockData] = await Promise.all([loadMockData(), mockDelay(signal)]);
        return deepCopy(mockData.rootCategories);
    },

    async getProductCategories({ rootId, signal }) {
        const [mockData] = await Promise.all([loadMockData(), mockDelay(signal)]);
        const response = mockData.productCategoriesByRootId[String(rootId)]
            || mockEnvelope({ groups: [] }, `mock-categories-${rootId}`);
        return deepCopy(response);
    },

    async getFacets({ categoryIds, signal }) {
        const [mockData] = await Promise.all([loadMockData(), mockDelay(signal)]);
        const selected = new Set(categoryIds);
        const products = mockData.products.data.items.filter((item) => selected.has(item.categoryId));
        const facets = mockData.facetDefinitions.map((definition) => {
            const values = new Set();
            products.forEach((product) => {
                const value = definition.key === "series" ? product.series : product[definition.key];
                if (typeof value === "string") values.add(value);
            });
            return {
                key: definition.key,
                label: definition.label,
                values: Array.from(values).sort((left, right) => left.localeCompare(right))
            };
        }).filter((facet) => facet.values.length > 0);

        return mockEnvelope({ facets }, `mock-facets-${categoryIds.join("-") || "empty"}`);
    },

    async getProducts({ categoryIds, filters, signal }) {
        const [mockData] = await Promise.all([loadMockData(), mockDelay(signal)]);
        const selected = new Set(categoryIds);
        const items = mockData.products.data.items.filter((product) => {
            if (!selected.has(product.categoryId)) return false;
            return Object.entries(filters).every(([key, values]) => {
                const productValue = key === "series" ? product.series : product[key];
                return Array.isArray(values) && values.includes(productValue);
            });
        });
        return mockEnvelope(
            { items: deepCopy(items), total: items.length },
            `mock-products-${categoryIds.join("-") || "empty"}`
        );
    }
};

// ======================================================
// 6. Real API Provider
// ======================================================

async function requestApi(endpointName, { method = "GET", query, json, signal } = {}) {
    const endpoint = APP_CONFIG.endpoints[endpointName];
    if (typeof endpoint !== "string" || endpoint.length === 0) {
        throw createDataError("config", `Missing endpoint configuration: ${endpointName}`);
    }

    let url;
    try {
        url = new URL(endpoint, APP_CONFIG.apiBaseUrl);
    } catch (error) {
        throw createDataError("config", `Invalid API URL for ${endpointName}`);
    }

    if (query) {
        Object.entries(query).forEach(([key, value]) => url.searchParams.set(key, String(value)));
    }

    const controller = new AbortController();
    let timedOut = false;
    const abortFromCaller = () => controller.abort();
    if (signal) {
        if (signal.aborted) controller.abort();
        else signal.addEventListener("abort", abortFromCaller, { once: true });
    }

    const timeoutId = window.setTimeout(() => {
        timedOut = true;
        controller.abort();
    }, APP_CONFIG.requestTimeoutMs);

    const headers = new Headers(APP_CONFIG.requestHeaders);
    const options = {
        method,
        headers,
        credentials: APP_CONFIG.credentials,
        signal: controller.signal
    };
    if (json !== undefined) {
        headers.set("Content-Type", "application/json");
        options.body = JSON.stringify(json);
    }

    let response;
    let text;
    try {
        response = await fetch(url, options);
        text = await response.text();
    } catch (error) {
        if (error && error.name === "AbortError") {
            throw createDataError(timedOut ? "timeout" : "aborted", timedOut ? "The API request timed out." : "The API request was cancelled.");
        }
        throw createDataError("network", "The API could not be reached.", { cause: error });
    } finally {
        window.clearTimeout(timeoutId);
        if (signal) signal.removeEventListener("abort", abortFromCaller);
    }

    let payload = null;
    let jsonIsValid = false;
    if (text) {
        try {
            payload = JSON.parse(text);
            jsonIsValid = true;
        } catch (error) {
            jsonIsValid = false;
        }
    }

    if (!response.ok) {
        const apiError = isPlainObject(payload) && Object.prototype.hasOwnProperty.call(payload, "error")
            ? validateErrorEnvelope(payload.error, `${endpointName}.error`)
            : null;
        const message = apiError && typeof apiError.message === "string"
            ? apiError.message
            : (isPlainObject(payload) && typeof payload.message === "string" ? payload.message : `Request failed: ${response.status}`);
        throw createDataError("http", message, {
            status: response.status,
            code: apiError && apiError.code ? apiError.code : "request_failed",
            correlationId: (apiError && apiError.correlationId)
                || (isPlainObject(payload) && payload.correlationId)
                || response.headers.get("X-Correlation-ID")
                || ""
        });
    }

    if (!text) {
        throw createDataError("empty-response", `The ${endpointName} endpoint returned an empty response.`);
    }
    if (!jsonIsValid) {
        throw createDataError("invalid-json", `The ${endpointName} endpoint returned invalid JSON.`);
    }

    return payload;
}

const realApiProvider = {
    getRootCategories({ signal } = {}) {
        return requestApi("rootCategories", { method: "GET", signal });
    },

    getProductCategories({ rootId, signal }) {
        return requestApi("productCategories", {
            method: "GET",
            query: { root_id: rootId },
            signal
        });
    },

    getFacets({ categoryIds, signal }) {
        return requestApi("facets", {
            method: "POST",
            json: { category_ids: categoryIds },
            signal
        });
    },

    getProducts({ categoryIds, filters, signal }) {
        return requestApi("products", {
            method: "POST",
            json: { category_ids: categoryIds, filters },
            signal
        });
    }
};

// ======================================================
// 7. Shared Data Service
// ======================================================

const activeProvider = {
    mock: mockDataProvider,
    api: realApiProvider
}[APP_CONFIG.dataSource];

if (!activeProvider) {
    throw createDataError("config", `Unknown dataSource: ${APP_CONFIG.dataSource}`);
}

function normalizeRootId(rootId) {
    const normalized = Number(rootId);
    expectContract(Number.isInteger(normalized) && normalized > 0, "request.rootId", "positive integer", rootId);
    return normalized;
}

function normalizeCategoryIds(categoryIds) {
    expectContract(Array.isArray(categoryIds), "request.categoryIds", "array", categoryIds);
    return Array.from(new Set(categoryIds.map((categoryId, index) => {
        const normalized = Number(categoryId);
        expectContract(
            Number.isInteger(normalized) && normalized > 0,
            `request.categoryIds[${index}]`,
            "positive integer",
            categoryId
        );
        return normalized;
    })));
}

function normalizeFilters(filters) {
    expectContract(isPlainObject(filters), "request.filters", "object", filters);
    const normalized = {};
    Object.entries(filters).forEach(([key, values]) => {
        expectContract(key.length > 0, "request.filters key", "non-empty string", key);
        expectContract(Array.isArray(values), `request.filters.${key}`, "string array", values);
        if (values.length === 0) return;
        normalized[key] = Array.from(new Set(values.map((value, index) => {
            expectContract(
                typeof value === "string" && value.length > 0,
                `request.filters.${key}[${index}]`,
                "non-empty string",
                value
            );
            return value;
        })));
    });
    return normalized;
}

const dataService = Object.freeze({
    async getRootCategories(input = {}) {
        return validateRootResponse(await activeProvider.getRootCategories(input));
    },

    async getProductCategories(input) {
        const normalized = { rootId: normalizeRootId(input.rootId), signal: input.signal };
        return validateProductCategoryResponse(await activeProvider.getProductCategories(normalized));
    },

    async getFacets(input) {
        const normalized = { categoryIds: normalizeCategoryIds(input.categoryIds), signal: input.signal };
        return validateFacetResponse(await activeProvider.getFacets(normalized));
    },

    async getProducts(input) {
        const normalized = {
            categoryIds: normalizeCategoryIds(input.categoryIds),
            filters: normalizeFilters(input.filters),
            signal: input.signal
        };
        return validateProductResponse(await activeProvider.getProducts(normalized), normalized);
    }
});

// ======================================================
// 8. Application State
// ======================================================

// Repeat `category`, `filter.<field>`, and `inquiry` parameters to preselect multiple values.
function parseQuerySelection(search) {
    const params = new URLSearchParams(search);
    const rootId = Number(params.get("root"));
    const categoryIds = Array.from(new Set(params.getAll("category")
        .map(Number)
        .filter((value) => Number.isInteger(value) && value > 0)));
    const inquiryProductIds = Array.from(new Set(params.getAll("inquiry")
        .map(Number)
        .filter((value) => Number.isInteger(value) && value > 0)));
    const filterValues = new Map();

    params.forEach((value, key) => {
        if (!key.startsWith("filter.") || value.length === 0) return;
        const filterKey = key.slice("filter.".length);
        if (!filterKey) return;
        const values = filterValues.get(filterKey) || [];
        if (!values.includes(value)) values.push(value);
        filterValues.set(filterKey, values);
    });

    return {
        rootId: Number.isInteger(rootId) && rootId > 0 ? rootId : null,
        categoryIds,
        filters: Object.fromEntries(filterValues),
        inquiryProductIds
    };
}

function selectAvailableFilters(requestedFilters, facets) {
    const available = new Map(facets.map((facet) => [facet.key, new Set(facet.values)]));
    return Object.fromEntries(Object.entries(requestedFilters).flatMap(([key, values]) => {
        const options = available.get(key);
        if (!options) return [];
        const selected = values.filter((value) => options.has(value));
        return selected.length > 0 ? [[key, selected]] : [];
    }));
}

function buildQueryString(rootId, categoryIds, filters, inquiryProductIds = []) {
    const params = new URLSearchParams();
    if (Number.isInteger(rootId) && rootId > 0) params.set("root", String(rootId));
    categoryIds.forEach((categoryId) => params.append("category", String(categoryId)));
    Object.entries(filters).forEach(([key, values]) => {
        values.forEach((value) => params.append(`filter.${key}`, value));
    });
    inquiryProductIds.forEach((productId) => params.append("inquiry", String(productId)));
    return params.toString();
}

function buildInquiryUrl() {
    const query = buildQueryString(state.rootId, state.categoryIds, state.filters, [...state.inquiryProductIds]);
    return `/inquiry${query ? `?${query}` : ""}`;
}

function syncQueryString() {
    const url = new URL(window.location.href);
    Array.from(url.searchParams.keys()).forEach((key) => {
        if (key === "root" || key === "category" || key === "inquiry" || key.startsWith("filter.")) {
            url.searchParams.delete(key);
        }
    });
    new URLSearchParams(buildQueryString(
        state.rootId,
        state.categoryIds,
        state.filters,
        Array.from(state.inquiryProductIds)
    ))
        .forEach((value, key) => url.searchParams.append(key, value));
    window.history.replaceState(null, "", url.href);
}

let initialQuerySelection = parseQuerySelection(window.location.search);

const state = {
    roots: [],
    groups: [],
    facets: [],
    products: [],
    resultTotal: 0,
    inquiryProductIds: new Set(),
    rootId: null,
    categoryIds: [],
    filters: {},
    status: "idle",
    error: null,
    requestRevision: 0,
    requestController: null,
    table: {
        query: "",
        sortKey: null,
        sortDirection: "asc",
        page: 1,
        pageSize: 10,
        columns: []
    }
};

const dom = {};

function cacheDom() {
    const ids = [
        "status-message", "root-count", "root-category-options", "category-count",
        "product-categories", "clear-filters", "selected-filters", "facet-container",
        "result-count", "page-size", "table-search", "table-search-submit", "inquiry-button", "results-table",
        "table-info", "pagination"
    ];
    ids.forEach((id) => {
        const element = document.getElementById(id);
        if (!element) throw createDataError("config", `Missing required element #${id}`);
        dom[id] = element;
    });
    dom.tableHead = dom["results-table"].querySelector("thead");
    dom.tableBody = dom["results-table"].querySelector("tbody");
}

// ======================================================
// 9. Search and Filter Logic
// ======================================================

const FIXED_PRODUCT_SPEC_COLUMNS = Object.freeze([
    { key: "acf.length", title: "Length (mm)", sourceKeys: ["acf.length"] },
    { key: "acf.width", title: "Width (mm)", sourceKeys: ["acf.width"] },
    { key: "acf.height", title: "Height (mm)", sourceKeys: ["acf.height"] },
    { key: "acf.inductance", title: "Inductance (uH)", sourceKeys: ["acf.inductance"] },
    { key: "acf.impedance", title: "Impedance (Ω)", sourceKeys: ["acf.impedance"] },
    { key: "acf.dcr", title: "DCR (mΩ)", sourceKeys: ["acf.dcr"] },
    { key: "acf.isat", title: "Isat (mA)", sourceKeys: ["acf.isat"] },
    { key: "acf.irms", title: "Irms (mA)", sourceKeys: ["acf.irms"] },
    { key: "spq", title: "SPQ", sourceKeys: ["spq", "acf.spq"] }
]);

function displayFieldLabel(value) {
    return String(value)
        .replace(/^acf(?:\.|\s+)/i, "")
        .replace(/[._]+/g, " ")
        .replace(/\b\w/g, (character) => character.toUpperCase());
}

function defaultColumns() {
    return productColumns([]);
}

function productColumns(products) {
    const fixedSpecKeys = new Set(FIXED_PRODUCT_SPEC_COLUMNS.flatMap((column) => column.sourceKeys));
    const excluded = new Set([
        "id", "sku", "name", "series", "category", "seriesImage", "pdfDownload",
        "seriesId", "categoryId", ...fixedSpecKeys
    ]);
    const dynamicKeys = new Set();
    products.forEach((product) => {
        Object.keys(product).forEach((key) => {
            if (!excluded.has(key)) dynamicKeys.add(key);
        });
    });

    const fixedColumns = FIXED_PRODUCT_SPEC_COLUMNS.map(({ key, title, sourceKeys }) => ({
        key,
        title,
        sortable: true,
        searchable: true,
        value: (row) => sourceKeys.map((sourceKey) => row[sourceKey])
            .find((value) => value !== undefined && value !== null) ?? ""
    }));
    const spqColumn = fixedColumns.pop();

    return [
        {
            key: "series",
            title: "Product",
            sortable: true,
            searchable: true,
            kind: "product",
            value: (row) => row.series || ""
        },
        { key: "category", title: "Category", sortable: true, searchable: true, value: (row) => row.category || "" },
        ...fixedColumns,
        ...Array.from(dynamicKeys).map((key) => ({
            key,
            title: displayFieldLabel(key),
            sortable: true,
            searchable: true,
            value: (row) => row[key] === undefined || row[key] === null ? "" : row[key]
        })),
        spqColumn,
        {
            key: "pdfDownload",
            title: "PDF Download",
            sortable: false,
            searchable: false,
            kind: "pdf",
            value: (row) => row.pdfDownload || ""
        }
    ];
}

function resetTableInteraction() {
    state.table.query = "";
    state.table.sortKey = null;
    state.table.sortDirection = "asc";
    state.table.page = 1;
    state.table.pageSize = 10;
    state.inquiryProductIds.clear();
    dom["table-search"].value = "";
    dom["page-size"].value = "10";
}

function deriveTableRows() {
    const query = state.table.query.trim().toLocaleLowerCase();
    const searchableColumns = state.table.columns.filter((column) => column.searchable);
    const filtered = query
        ? state.products.filter((product) => searchableColumns.some((column) => String(column.value(product)).toLocaleLowerCase().includes(query)))
        : state.products.slice();

    const sortColumn = state.table.columns.find((column) => column.key === state.table.sortKey && column.sortable);
    if (sortColumn) {
        const direction = state.table.sortDirection === "desc" ? -1 : 1;
        const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });
        filtered.sort((left, right) => direction * collator.compare(String(sortColumn.value(left)), String(sortColumn.value(right))));
    }

    const pageCount = Math.max(1, Math.ceil(filtered.length / state.table.pageSize));
    if (state.table.page > pageCount) state.table.page = pageCount;
    const startIndex = (state.table.page - 1) * state.table.pageSize;
    return {
        filtered,
        pageRows: filtered.slice(startIndex, startIndex + state.table.pageSize),
        pageCount,
        startIndex
    };
}

function updateFilter(key, value, checked) {
    const current = state.filters[key] || [];
    state.filters[key] = checked
        ? Array.from(new Set([...current, value]))
        : current.filter((item) => item !== value);
    if (state.filters[key].length === 0) delete state.filters[key];
    state.table.page = 1;
    state.inquiryProductIds.clear();
    syncQueryString();
    renderSelectedFilters();
    void loadProducts();
}

function isSafeResourceUrl(value, allowedDataPrefix = "") {
    if (!value) return false;
    try {
        const parsed = new URL(value, window.location.href);
        return ["http:", "https:", "file:", "blob:"].includes(parsed.protocol)
            || (allowedDataPrefix && parsed.protocol === "data:" && value.startsWith(allowedDataPrefix));
    } catch (error) {
        return false;
    }
}

// ======================================================
// 10. DOM Rendering
// ======================================================

function setStatus(message, mode = "idle") {
    state.status = mode;
    state.error = mode === "error" ? message : null;
    dom["status-message"].replaceChildren();
    dom["status-message"].classList.toggle("error", mode === "error");
    dom["status-message"].setAttribute("aria-busy", mode === "loading" ? "true" : "false");
    dom["status-message"].setAttribute("role", mode === "error" ? "alert" : "status");
    if (mode === "loading") {
        const spinner = document.createElement("span");
        spinner.className = "spinner";
        spinner.setAttribute("aria-hidden", "true");
        dom["status-message"].append(spinner);
    }
    if (message) dom["status-message"].append(document.createTextNode(message));
}

function appendMutedMessage(container, message) {
    const element = document.createElement("div");
    element.className = "muted";
    element.style.fontSize = "14px";
    element.textContent = message;
    container.append(element);
}

function renderRoots() {
    const container = dom["root-category-options"];
    container.replaceChildren();
    dom["root-count"].textContent = `${state.roots.length} roots`;
    if (state.roots.length === 0) {
        appendMutedMessage(container, "No roots available.");
        return;
    }

    state.roots.forEach((root) => {
        const label = document.createElement("label");
        label.className = "form-check";
        const input = document.createElement("input");
        input.type = "radio";
        input.name = "root_category";
        input.value = String(root.id);
        input.checked = root.id === state.rootId;
        input.addEventListener("change", () => {
            state.rootId = root.id;
            state.categoryIds = [];
            state.filters = {};
            state.inquiryProductIds.clear();
            syncQueryString();
            void loadCategories(root.id);
        });
        const text = document.createElement("span");
        text.textContent = root.name;
        label.append(input, text);
        container.append(label);
    });
}

function renderCategories(message = "") {
    const container = dom["product-categories"];
    container.replaceChildren();
    dom["category-count"].textContent = `${state.categoryIds.length} selected`;
    if (message) {
        appendMutedMessage(container, message);
        return;
    }
    if (state.groups.length === 0) {
        appendMutedMessage(container, "No categories found.");
        return;
    }

    state.groups.forEach((group) => {
        const card = document.createElement("div");
        card.className = "facet-card";
        const title = document.createElement("h3");
        title.textContent = group.group;
        const list = document.createElement("div");
        list.className = "category-list";

        group.categories.forEach((category) => {
            const label = document.createElement("label");
            label.className = "form-check";
            const input = document.createElement("input");
            input.type = "checkbox";
            input.value = String(category.id);
            input.checked = state.categoryIds.includes(category.id);
            input.addEventListener("change", handleCategoryChange);
            const text = document.createElement("span");
            text.textContent = category.name;
            label.append(input, text);
            list.append(label);
        });

        card.append(title, list);
        container.append(card);
    });
}

function renderSelectedFilters() {
    const container = dom["selected-filters"];
    container.replaceChildren();
    const entries = Object.entries(state.filters);
    if (entries.length === 0) {
        const text = document.createElement("span");
        text.className = "muted";
        text.style.fontSize = "14px";
        text.textContent = "No filters applied.";
        container.append(text);
        return;
    }

    entries.forEach(([key, values]) => {
        values.forEach((value) => {
            const chip = document.createElement("span");
            chip.className = "chip";
            const text = document.createElement("span");
            text.textContent = `${displayFieldLabel(key)}: ${value}`;
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = "×";
            button.setAttribute("aria-label", `Remove ${displayFieldLabel(key)} ${value}`);
            button.addEventListener("click", () => {
                document.querySelectorAll("#facet-container input[type='checkbox']").forEach((input) => {
                    if (input.dataset.key === key && input.value === value) input.checked = false;
                });
                updateFilter(key, value, false);
            });
            chip.append(text, button);
            container.append(chip);
        });
    });
}

function renderFacets() {
    const container = dom["facet-container"];
    container.replaceChildren();
    if (state.facets.length === 0) {
        appendMutedMessage(container, "No filters yet. Select categories.");
        return;
    }

    state.facets.forEach((facet, facetIndex) => {
        const card = document.createElement("div");
        card.className = "facet-card";
        const title = document.createElement("h3");
        const displayLabel = displayFieldLabel(facet.label);
        title.textContent = displayLabel;
        const search = document.createElement("input");
        search.type = "search";
        search.className = "form-control";
        search.placeholder = `Search ${displayLabel}...`;
        search.setAttribute("aria-label", `Search ${displayLabel}`);
        const searchField = document.createElement("div");
        searchField.className = "facet-search";
        const searchAction = document.createElement("button");
        searchAction.type = "button";
        searchAction.className = "facet-search-action";
        searchAction.setAttribute("aria-label", `Search ${displayLabel}`);
        searchField.append(search, searchAction);
        const list = document.createElement("ul");
        list.className = "facet-list";
        list.dataset.key = facet.key;

        facet.values.forEach((value, valueIndex) => {
            const item = document.createElement("li");
            const check = document.createElement("div");
            check.className = "form-check";
            const input = document.createElement("input");
            input.type = "checkbox";
            input.id = `facet-${facetIndex}-${valueIndex}`;
            input.value = value;
            input.dataset.key = facet.key;
            input.checked = (state.filters[facet.key] || []).includes(value);
            input.addEventListener("change", () => updateFilter(facet.key, value, input.checked));
            const label = document.createElement("label");
            label.htmlFor = input.id;
            label.textContent = value;
            check.append(input, label);
            item.append(check);
            list.append(item);
        });

        const filterFacetItems = () => {
            const term = search.value.toLocaleLowerCase().trim();
            list.querySelectorAll("li").forEach((item) => {
                item.hidden = Boolean(term) && !item.textContent.toLocaleLowerCase().includes(term);
            });
            const hasValue = Boolean(search.value);
            searchAction.classList.toggle("is-clear", hasValue);
            searchAction.setAttribute("aria-label", hasValue ? `Clear ${displayLabel} search` : `Search ${displayLabel}`);
        };
        search.addEventListener("input", filterFacetItems);
        searchAction.addEventListener("click", () => {
            if (search.value) {
                search.value = "";
                filterFacetItems();
            }
            search.focus();
        });

        card.append(title, searchField, list);
        container.append(card);
    });
}

function renderCell(cell, column, product) {
    const value = column.value(product);
    if (column.kind === "product") {
        cell.className = "product-column";
        const content = document.createElement("div");
        content.className = "product-cell";
        if (isSafeResourceUrl(product.seriesImage, "data:image/")) {
            const image = document.createElement("img");
            image.className = "series-image";
            image.src = product.seriesImage;
            image.alt = product.series || "Series image";
            image.width = 80;
            image.height = 48;
            content.append(image);
        }
        const name = document.createElement("span");
        name.className = "product-name";
        name.textContent = String(value);
        content.append(name);
        cell.append(content);
        return;
    }
    if (column.kind === "pdf") {
        if (isSafeResourceUrl(value, "data:application/pdf")) {
            const link = document.createElement("a");
            link.className = "btn btn-sm btn-outline-secondary";
            link.href = value;
            link.download = `${product.sku || "product"}.pdf`;
            link.textContent = "Download";
            cell.append(link);
        }
        return;
    }
    cell.textContent = value === undefined || value === null ? "" : String(value);
}

function makePageButton(label, page, { active = false, disabled = false, ariaLabel = "" } = {}) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `page-button${active ? " active" : ""}`;
    button.textContent = label;
    button.disabled = disabled;
    if (active) button.setAttribute("aria-current", "page");
    if (ariaLabel) button.setAttribute("aria-label", ariaLabel);
    button.addEventListener("click", () => {
        state.table.page = page;
        renderTable();
    });
    return button;
}

function renderPagination(pageCount, rowCount) {
    const container = dom.pagination;
    container.replaceChildren();
    container.append(makePageButton("Previous", Math.max(1, state.table.page - 1), {
        disabled: state.table.page === 1,
        ariaLabel: "Previous page"
    }));
    if (rowCount > 0) {
        for (let page = 1; page <= pageCount; page += 1) {
            container.append(makePageButton(String(page), page, { active: page === state.table.page }));
        }
    }
    container.append(makePageButton("Next", Math.min(pageCount, state.table.page + 1), {
        disabled: state.table.page === pageCount,
        ariaLabel: "Next page"
    }));
}

function renderInquiryAction() {
    const count = state.inquiryProductIds.size;
    dom["inquiry-button"].disabled = count === 0;
    dom["inquiry-button"].textContent = count > 0 ? `Inquiry (${count})` : "Inquiry";
}

function renderTable() {
    const { filtered, pageRows, pageCount, startIndex } = deriveTableRows();
    dom.tableHead.replaceChildren();
    dom.tableBody.replaceChildren();

    const headerRow = document.createElement("tr");
    const selectHeader = document.createElement("th");
    selectHeader.className = "inquiry-select-column";
    const selectLabel = document.createElement("span");
    selectLabel.className = "visually-hidden";
    selectLabel.textContent = "Select for inquiry";
    selectHeader.append(selectLabel);
    headerRow.append(selectHeader);
    state.table.columns.forEach((column) => {
        const header = document.createElement("th");
        header.dataset.column = column.key;
        if (column.sortable) {
            const button = document.createElement("button");
            button.type = "button";
            button.className = "sort-button";
            const isSorted = state.table.sortKey === column.key;
            button.setAttribute("aria-sort", isSorted ? (state.table.sortDirection === "asc" ? "ascending" : "descending") : "none");
            const text = document.createElement("span");
            text.textContent = column.title;
            const icon = document.createElement("span");
            icon.className = "sort-icon";
            icon.setAttribute("aria-hidden", "true");
            icon.textContent = isSorted ? (state.table.sortDirection === "asc" ? "▲" : "▼") : "◆";
            button.append(text, icon);
            button.addEventListener("click", () => {
                if (state.table.sortKey === column.key) {
                    state.table.sortDirection = state.table.sortDirection === "asc" ? "desc" : "asc";
                } else {
                    state.table.sortKey = column.key;
                    state.table.sortDirection = "asc";
                }
                state.table.page = 1;
                renderTable();
            });
            header.append(button);
        } else {
            header.textContent = column.title;
        }
        headerRow.append(header);
    });
    dom.tableHead.append(headerRow);

    if (pageRows.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.className = "empty-cell";
        cell.colSpan = state.table.columns.length + 1;
        cell.textContent = "No products found.";
        row.append(cell);
        dom.tableBody.append(row);
    } else {
        pageRows.forEach((product) => {
            const row = document.createElement("tr");
            const selectCell = document.createElement("td");
            selectCell.className = "inquiry-select-column";
            const selectInput = document.createElement("input");
            selectInput.type = "checkbox";
            selectInput.checked = state.inquiryProductIds.has(product.id);
            selectInput.setAttribute("aria-label", `Select ${product.sku || product.series || "product"} for inquiry`);
            row.classList.toggle("is-selected", selectInput.checked);
            selectInput.addEventListener("change", () => {
                if (selectInput.checked) state.inquiryProductIds.add(product.id);
                else state.inquiryProductIds.delete(product.id);
                row.classList.toggle("is-selected", selectInput.checked);
                syncQueryString();
                renderInquiryAction();
            });
            selectCell.append(selectInput);
            row.append(selectCell);
            state.table.columns.forEach((column) => {
                const cell = document.createElement("td");
                cell.dataset.column = column.key;
                renderCell(cell, column, product);
                row.append(cell);
            });
            dom.tableBody.append(row);
        });
    }

    renderInquiryAction();

    const visibleStart = filtered.length === 0 ? 0 : startIndex + 1;
    const visibleEnd = filtered.length === 0 ? 0 : Math.min(startIndex + state.table.pageSize, filtered.length);
    const filteredSuffix = state.table.query.trim()
        ? ` (filtered from ${state.products.length} total entries)`
        : "";
    dom["table-info"].textContent = `Showing ${visibleStart} to ${visibleEnd} of ${filtered.length} entries${filteredSuffix}`;
    renderPagination(pageCount, filtered.length);
}

function renderResults() {
    dom["result-count"].textContent = `${state.resultTotal} items`;
    renderTable();
}

// ======================================================
// 11. Event Listeners
// ======================================================

function applyTableSearch() {
    state.table.query = dom["table-search"].value;
    state.table.page = 1;
    renderTable();
}

function bindEvents() {
    dom["clear-filters"].addEventListener("click", () => {
        state.filters = {};
        state.facets = [];
        state.inquiryProductIds.clear();
        syncQueryString();
        renderSelectedFilters();
        renderFacets();
        void loadProducts();
    });

    dom["table-search"].addEventListener("input", applyTableSearch);
    dom["table-search-submit"].addEventListener("click", applyTableSearch);
    dom["inquiry-button"].addEventListener("click", () => {
        if (state.inquiryProductIds.size > 0) window.location.href = buildInquiryUrl();
    });

    dom["page-size"].addEventListener("change", () => {
        state.table.pageSize = Number(dom["page-size"].value);
        state.table.page = 1;
        renderTable();
    });
}

function handleCategoryChange() {
    state.categoryIds = Array.from(dom["product-categories"].querySelectorAll("input[type='checkbox']:checked"))
        .map((input) => Number(input.value));
    state.filters = {};
    state.facets = [];
    state.inquiryProductIds.clear();
    syncQueryString();
    dom["category-count"].textContent = `${state.categoryIds.length} selected`;
    renderSelectedFilters();
    renderFacets();

    if (state.categoryIds.length === 0) {
        cancelActiveRequest();
        state.products = [];
        state.resultTotal = 0;
        state.table.columns = defaultColumns();
        resetTableInteraction();
        renderResults();
        setStatus("");
        return;
    }
    void loadFacetsAndProducts();
}

// ======================================================
// 12. Application Initialization
// ======================================================

function cancelActiveRequest() {
    if (state.requestController) state.requestController.abort();
    state.requestController = null;
}

function beginRequest(message) {
    cancelActiveRequest();
    state.requestRevision += 1;
    state.requestController = new AbortController();
    setStatus(message, "loading");
    return {
        revision: state.requestRevision,
        signal: state.requestController.signal
    };
}

function requestIsCurrent(revision) {
    return revision === state.requestRevision;
}

function finishRequest(revision) {
    if (!requestIsCurrent(revision)) return;
    state.requestController = null;
    setStatus("");
}

function handleLoadError(prefix, error, revision) {
    if (!requestIsCurrent(revision) || error.kind === "aborted" || error.name === "AbortError") return;
    state.requestController = null;
    const correlation = error.correlationId ? ` (Correlation ID: ${error.correlationId})` : "";
    setStatus(`${prefix}: ${error.message}${correlation}`, "error");
}

async function loadRoots() {
    const request = beginRequest("Loading roots...");
    try {
        const response = await dataService.getRootCategories({ signal: request.signal });
        if (!requestIsCurrent(request.revision)) return;
        state.roots = response.data.categories.slice().sort((left, right) =>
            Number(right.id === APP_CONFIG.defaultRootId) - Number(left.id === APP_CONFIG.defaultRootId)
        );
        const requestedRoot = state.roots.find((root) => root.id === initialQuerySelection.rootId);
        state.rootId = requestedRoot ? requestedRoot.id : (state.roots[0]?.id ?? null);
        renderRoots();
        if (state.rootId === null) {
            finishRequest(request.revision);
            return;
        }
        await loadCategories(state.rootId, true);
    } catch (error) {
        state.roots = [];
        state.rootId = null;
        state.groups = [];
        state.categoryIds = [];
        state.filters = {};
        state.facets = [];
        state.products = [];
        state.resultTotal = 0;
        state.table.columns = defaultColumns();
        resetTableInteraction();
        renderRoots();
        renderCategories();
        renderSelectedFilters();
        renderFacets();
        renderResults();
        handleLoadError("Error loading roots", error, request.revision);
    }
}

async function loadCategories(rootId, applyQuerySelection = false) {
    const request = beginRequest("Loading categories...");
    renderCategories("Loading...");
    try {
        const response = await dataService.getProductCategories({ rootId, signal: request.signal });
        if (!requestIsCurrent(request.revision)) return;
        state.groups = response.data.groups;
        const availableCategoryIds = new Set(state.groups.flatMap((group) =>
            group.categories.map((category) => category.id)
        ));
        state.categoryIds = applyQuerySelection
            ? initialQuerySelection.categoryIds.filter((categoryId) => availableCategoryIds.has(categoryId))
            : [];
        state.filters = {};
        state.facets = [];
        state.products = [];
        state.resultTotal = 0;
        state.table.columns = defaultColumns();
        resetTableInteraction();
        renderCategories();
        renderFacets();
        renderSelectedFilters();
        renderResults();
        if (applyQuerySelection && state.categoryIds.length > 0) {
            await loadFacetsAndProducts(
                initialQuerySelection.filters,
                initialQuerySelection.inquiryProductIds
            );
            return;
        }
        finishRequest(request.revision);
    } catch (error) {
        state.groups = [];
        state.categoryIds = [];
        state.filters = {};
        state.facets = [];
        state.products = [];
        state.resultTotal = 0;
        state.table.columns = defaultColumns();
        resetTableInteraction();
        renderCategories();
        renderSelectedFilters();
        renderFacets();
        renderResults();
        handleLoadError("Error loading categories", error, request.revision);
    }
}

async function loadFacetsAndProducts(requestedFilters = null, requestedInquiryProductIds = []) {
    const request = beginRequest("Loading filters...");
    const input = { categoryIds: state.categoryIds.slice(), signal: request.signal };
    let stage = "filters";
    try {
        const facetResponse = await dataService.getFacets(input);
        if (!requestIsCurrent(request.revision)) return;
        state.facets = facetResponse.data.facets;
        if (requestedFilters) state.filters = selectAvailableFilters(requestedFilters, state.facets);
        renderFacets();
        renderSelectedFilters();
        stage = "products";
        setStatus("Loading products...", "loading");

        const productResponse = await dataService.getProducts({
            categoryIds: state.categoryIds.slice(),
            filters: deepCopy(state.filters),
            signal: request.signal
        });
        if (!requestIsCurrent(request.revision)) return;
        state.products = productResponse.data.items;
        state.resultTotal = productResponse.data.total;
        state.table.columns = productColumns(state.products);
        resetTableInteraction();
        const availableProductIds = new Set(state.products.map((product) => product.id));
        requestedInquiryProductIds.forEach((productId) => {
            if (availableProductIds.has(productId)) state.inquiryProductIds.add(productId);
        });
        syncQueryString();
        renderResults();
        finishRequest(request.revision);
    } catch (error) {
        state.products = [];
        state.resultTotal = 0;
        state.table.columns = defaultColumns();
        resetTableInteraction();
        renderResults();
        const prefix = error.kind === "contract"
            ? "Invalid API response"
            : (stage === "filters" ? "Error loading filters" : "Error loading products");
        handleLoadError(prefix, error, request.revision);
    }
}

async function loadProducts() {
    if (state.categoryIds.length === 0) {
        cancelActiveRequest();
        state.products = [];
        state.resultTotal = 0;
        state.table.columns = defaultColumns();
        resetTableInteraction();
        renderResults();
        setStatus("");
        return;
    }

    const request = beginRequest("Loading products...");
    try {
        const response = await dataService.getProducts({
            categoryIds: state.categoryIds.slice(),
            filters: deepCopy(state.filters),
            signal: request.signal
        });
        if (!requestIsCurrent(request.revision)) return;
        state.products = response.data.items;
        state.resultTotal = response.data.total;
        state.table.columns = productColumns(state.products);
        resetTableInteraction();
        renderResults();
        finishRequest(request.revision);
    } catch (error) {
        state.products = [];
        state.resultTotal = 0;
        state.table.columns = defaultColumns();
        resetTableInteraction();
        renderResults();
        handleLoadError(error.kind === "contract" ? "Invalid API response" : "Error loading products", error, request.revision);
    }
}

function initialize() {
    initialQuerySelection = parseQuerySelection(window.location.search);
    cacheDom();
    bindEvents();
    state.table.columns = defaultColumns();
    renderSelectedFilters();
    renderFacets();
    renderTable();
    void loadRoots();
}

window.SpecSearchApp = Object.freeze({
    initialize,
    getConfig: () => APP_CONFIG,
    getState: () => deepCopy({
        roots: state.roots,
        groups: state.groups,
        facets: state.facets,
        products: state.products,
        resultTotal: state.resultTotal,
        rootId: state.rootId,
        categoryIds: state.categoryIds,
        filters: state.filters,
        status: state.status,
        error: state.error,
        table: {
            query: state.table.query,
            sortKey: state.table.sortKey,
            sortDirection: state.table.sortDirection,
            page: state.table.page,
            pageSize: state.table.pageSize
        }
    })
});

if (document.getElementById("status-message")) initialize();

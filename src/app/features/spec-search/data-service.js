import { APP_CONFIG } from "./config.js";
import {
  createDataError,
  expectContract,
  isPlainObject,
  validateErrorEnvelope,
  validateFacetResponse,
  validateProductCategoryResponse,
  validateProductResponse,
  validateRootResponse,
} from "./contracts.js";

function validateMockData(data) {
  expectContract(isPlainObject(data), "mockData", "object", data);
  validateRootResponse(data.rootCategories);

  expectContract(
    isPlainObject(data.productCategoriesByRootId),
    "mockData.productCategoriesByRootId",
    "object",
    data.productCategoriesByRootId,
  );
  Object.entries(data.productCategoriesByRootId).forEach(
    ([rootId, response]) => {
      expectContract(
        /^\d+$/.test(rootId),
        `mockData.productCategoriesByRootId.${rootId}`,
        "numeric root ID",
        rootId,
      );
      validateProductCategoryResponse(response);
    },
  );

  validateProductResponse(data.products, { categoryIds: [], filters: {} });
  validateProductResponse(data.emptyProducts, { categoryIds: [], filters: {} });
  expectContract(
    isPlainObject(data.error),
    "mockData.error",
    "object",
    data.error,
  );
  validateErrorEnvelope(data.error.error, "mockData.error.error");

  expectContract(
    Array.isArray(data.facetDefinitions),
    "mockData.facetDefinitions",
    "array",
    data.facetDefinitions,
  );
  const seenFacetKeys = new Set();
  data.facetDefinitions.forEach((definition, index) => {
    const path = `mockData.facetDefinitions[${index}]`;
    expectContract(isPlainObject(definition), path, "object", definition);
    expectContract(
      typeof definition.key === "string" && definition.key.length > 0,
      `${path}.key`,
      "non-empty string",
      definition.key,
    );
    expectContract(
      typeof definition.label === "string" && definition.label.length > 0,
      `${path}.label`,
      "non-empty string",
      definition.label,
    );
    expectContract(
      !seenFacetKeys.has(definition.key),
      `${path}.key`,
      "unique facet key",
      definition.key,
    );
    seenFacetKeys.add(definition.key);
  });

  return data;
}

async function requestMockData(
  config,
  signal,
  windowObject,
  documentObject,
  fetchFunction,
) {
  expectContract(
    typeof config.mockDataUrl === "string" && config.mockDataUrl.length > 0,
    "config.mockDataUrl",
    "non-empty string",
    config.mockDataUrl,
  );

  if (windowObject.location.protocol === "file:") {
    await new Promise((resolve, reject) => {
      const script = documentObject.createElement("script");
      script.src = new URL(
        config.mockDataScriptUrl,
        windowObject.location.href,
      ).href;
      const cleanup = () => signal?.removeEventListener("abort", abort);
      const load = () => {
        cleanup();
        resolve();
      };
      const fail = () => {
        cleanup();
        reject(
          createDataError(
            "network",
            `Unable to load ${config.mockDataScriptUrl}`,
          ),
        );
      };
      const abort = () => {
        script.remove();
        reject(new DOMException("Request aborted", "AbortError"));
      };
      script.addEventListener("load", load, { once: true });
      script.addEventListener("error", fail, { once: true });
      if (signal?.aborted) abort();
      else {
        signal?.addEventListener("abort", abort, { once: true });
        documentObject.head.append(script);
      }
    });
    return validateMockData(windowObject.SPEC_SEARCH_MOCK_DATA);
  }

  let response;
  try {
    response = await fetchFunction(
      new URL(config.mockDataUrl, windowObject.location.href),
      { cache: "no-store", signal },
    );
  } catch (error) {
    throw createDataError(
      "network",
      `Unable to load ${config.mockDataUrl}`,
      { cause: error },
    );
  }

  if (!response.ok) {
    throw createDataError(
      "http",
      `Unable to load ${config.mockDataUrl}: HTTP ${response.status}`,
      {
        status: response.status,
      },
    );
  }

  const text = await response.text();
  if (text.trim().length === 0) {
    throw createDataError(
      "empty-response",
      `${config.mockDataUrl} is empty`,
    );
  }

  let data;
  try {
    data = JSON.parse(text);
  } catch (error) {
    throw createDataError(
      "invalid-json",
      `${config.mockDataUrl} contains invalid JSON`,
      { cause: error },
    );
  }

  return validateMockData(data);
}

export function deepCopy(value) {
  return JSON.parse(JSON.stringify(value));
}

function mockDelay(signal, config, windowObject) {
  return new Promise((resolve, reject) => {
    if (signal && signal.aborted) {
      reject(new DOMException("Request aborted", "AbortError"));
      return;
    }
    const finish = () => {
      signal?.removeEventListener("abort", abort);
      resolve();
    };
    const abort = () => {
      windowObject.clearTimeout(timer);
      reject(new DOMException("Request aborted", "AbortError"));
    };
    const timer = windowObject.setTimeout(finish, config.mockLatencyMs);
    signal?.addEventListener("abort", abort, { once: true });
  });
}

function mockEnvelope(data, correlationId) {
  return { success: true, data, correlationId };
}

export class MockDataProvider {
  constructor(
    config = APP_CONFIG,
    windowObject = window,
    documentObject = document,
    fetchFunction = fetch,
  ) {
    this.config = config;
    this.window = windowObject;
    this.document = documentObject;
    this.fetch = fetchFunction;
    this.data = null;
  }

  loadData(signal) {
    if (this.data) return Promise.resolve(this.data);
    return requestMockData(
      this.config,
      signal,
      this.window,
      this.document,
      this.fetch,
    ).then((data) => {
      this.data = data;
      return data;
    });
  }

  async getRootCategories({ signal } = {}) {
    const [mockData] = await Promise.all([
      this.loadData(signal),
      mockDelay(signal, this.config, this.window),
    ]);
    return deepCopy(mockData.rootCategories);
  }

  async getProductCategories({ rootId, signal }) {
    const [mockData] = await Promise.all([
      this.loadData(signal),
      mockDelay(signal, this.config, this.window),
    ]);
    const response =
      mockData.productCategoriesByRootId[String(rootId)] ||
      mockEnvelope({ groups: [] }, `mock-categories-${rootId}`);
    return deepCopy(response);
  }

  async getFacets({ categoryIds, signal }) {
    const [mockData] = await Promise.all([
      this.loadData(signal),
      mockDelay(signal, this.config, this.window),
    ]);
    const selected = new Set(categoryIds);
    const products = mockData.products.data.items.filter((item) =>
      selected.has(item.categoryId),
    );
    const facets = mockData.facetDefinitions
      .map((definition) => {
        const values = new Set();
        products.forEach((product) => {
          const value =
            definition.key === "series"
              ? product.series
              : product[definition.key];
          if (typeof value === "string") values.add(value);
        });
        return {
          key: definition.key,
          label: definition.label,
          values: Array.from(values).sort((left, right) =>
            left.localeCompare(right),
          ),
        };
      })
      .filter((facet) => facet.values.length > 0);

    return mockEnvelope(
      { facets },
      `mock-facets-${categoryIds.join("-") || "empty"}`,
    );
  }

  async getProducts({ categoryIds, filters, signal }) {
    const [mockData] = await Promise.all([
      this.loadData(signal),
      mockDelay(signal, this.config, this.window),
    ]);
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
      `mock-products-${categoryIds.join("-") || "empty"}`,
    );
  }
}

async function requestApi(
  config,
  windowObject,
  fetchFunction,
  endpointName,
  { method = "GET", query, json, signal } = {},
) {
  const endpoint = config.endpoints[endpointName];
  if (typeof endpoint !== "string" || endpoint.length === 0) {
    throw createDataError(
      "config",
      `Missing endpoint configuration: ${endpointName}`,
    );
  }

  let url;
  try {
    url = new URL(endpoint, config.apiBaseUrl);
  } catch (error) {
    throw createDataError("config", `Invalid API URL for ${endpointName}`);
  }

  if (query) {
    Object.entries(query).forEach(([key, value]) =>
      url.searchParams.set(key, String(value)),
    );
  }

  const controller = new AbortController();
  let timedOut = false;
  const abortFromCaller = () => controller.abort();
  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener("abort", abortFromCaller, { once: true });
  }

  const timeoutId = windowObject.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, config.requestTimeoutMs);

  const headers = new Headers(config.requestHeaders);
  const options = {
    method,
    headers,
    credentials: config.credentials,
    signal: controller.signal,
  };
  if (json !== undefined) {
    headers.set("Content-Type", "application/json");
    options.body = JSON.stringify(json);
  }

  let response;
  let text;
  try {
    response = await fetchFunction(url, options);
    text = await response.text();
  } catch (error) {
    if (error && error.name === "AbortError") {
      throw createDataError(
        timedOut ? "timeout" : "aborted",
        timedOut
          ? "The API request timed out."
          : "The API request was cancelled.",
      );
    }
    throw createDataError("network", "The API could not be reached.", {
      cause: error,
    });
  } finally {
    windowObject.clearTimeout(timeoutId);
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
    const apiError =
      isPlainObject(payload) &&
      Object.prototype.hasOwnProperty.call(payload, "error")
        ? validateErrorEnvelope(payload.error, `${endpointName}.error`)
        : null;
    const message =
      apiError && typeof apiError.message === "string"
        ? apiError.message
        : isPlainObject(payload) && typeof payload.message === "string"
          ? payload.message
          : `Request failed: ${response.status}`;
    throw createDataError("http", message, {
      status: response.status,
      code: apiError && apiError.code ? apiError.code : "request_failed",
      correlationId:
        (apiError && apiError.correlationId) ||
        (isPlainObject(payload) && payload.correlationId) ||
        response.headers.get("X-Correlation-ID") ||
        "",
    });
  }

  if (!text) {
    throw createDataError(
      "empty-response",
      `The ${endpointName} endpoint returned an empty response.`,
    );
  }
  if (!jsonIsValid) {
    throw createDataError(
      "invalid-json",
      `The ${endpointName} endpoint returned invalid JSON.`,
    );
  }

  return payload;
}

export class ApiDataProvider {
  constructor(
    config = APP_CONFIG,
    windowObject = window,
    fetchFunction = fetch,
  ) {
    this.config = config;
    this.window = windowObject;
    this.fetch = fetchFunction;
  }

  getRootCategories({ signal } = {}) {
    return requestApi(this.config, this.window, this.fetch, "rootCategories", {
      method: "GET",
      signal,
    });
  }

  getProductCategories({ rootId, signal }) {
    return requestApi(
      this.config,
      this.window,
      this.fetch,
      "productCategories",
      {
        method: "GET",
        query: { root_id: rootId },
        signal,
      },
    );
  }

  getFacets({ categoryIds, signal }) {
    return requestApi(this.config, this.window, this.fetch, "facets", {
      method: "POST",
      json: { category_ids: categoryIds },
      signal,
    });
  }

  getProducts({ categoryIds, filters, signal }) {
    return requestApi(this.config, this.window, this.fetch, "products", {
      method: "POST",
      json: { category_ids: categoryIds, filters },
      signal,
    });
  }
}

function normalizeRootId(rootId) {
  const normalized = Number(rootId);
  expectContract(
    Number.isInteger(normalized) && normalized > 0,
    "request.rootId",
    "positive integer",
    rootId,
  );
  return normalized;
}

function normalizeCategoryIds(categoryIds) {
  expectContract(
    Array.isArray(categoryIds),
    "request.categoryIds",
    "array",
    categoryIds,
  );
  return Array.from(
    new Set(
      categoryIds.map((categoryId, index) => {
        const normalized = Number(categoryId);
        expectContract(
          Number.isInteger(normalized) && normalized > 0,
          `request.categoryIds[${index}]`,
          "positive integer",
          categoryId,
        );
        return normalized;
      }),
    ),
  );
}

function normalizeFilters(filters) {
  expectContract(isPlainObject(filters), "request.filters", "object", filters);
  const normalized = {};
  Object.entries(filters).forEach(([key, values]) => {
    expectContract(
      key.length > 0,
      "request.filters key",
      "non-empty string",
      key,
    );
    expectContract(
      Array.isArray(values),
      `request.filters.${key}`,
      "string array",
      values,
    );
    if (values.length === 0) return;
    normalized[key] = Array.from(
      new Set(
        values.map((value, index) => {
          expectContract(
            typeof value === "string" && value.length > 0,
            `request.filters.${key}[${index}]`,
            "non-empty string",
            value,
          );
          return value;
        }),
      ),
    );
  });
  return normalized;
}

export class SpecificationSearchDataService {
  constructor(provider) {
    this.provider = provider;
  }

  async getRootCategories(input = {}) {
    return validateRootResponse(await this.provider.getRootCategories(input));
  }

  async getProductCategories(input) {
    const normalized = {
      rootId: normalizeRootId(input.rootId),
      signal: input.signal,
    };
    return validateProductCategoryResponse(
      await this.provider.getProductCategories(normalized),
    );
  }

  async getFacets(input) {
    const normalized = {
      categoryIds: normalizeCategoryIds(input.categoryIds),
      signal: input.signal,
    };
    return validateFacetResponse(await this.provider.getFacets(normalized));
  }

  async getProducts(input) {
    const normalized = {
      categoryIds: normalizeCategoryIds(input.categoryIds),
      filters: normalizeFilters(input.filters),
      signal: input.signal,
    };
    return validateProductResponse(
      await this.provider.getProducts(normalized),
      normalized,
    );
  }
}

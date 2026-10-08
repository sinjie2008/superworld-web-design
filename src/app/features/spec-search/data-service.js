import { APP_CONFIG } from "./config.js";
import { CatalogTreeStore, seriesUrl } from "../../product-catalog.js";
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

function abortedRequestError() {
  return createDataError("aborted", "The API request was cancelled.");
}

async function loadCatalogIndex(catalogTreeStore, signal) {
  if (!signal) return catalogTreeStore.load();
  if (signal.aborted) throw abortedRequestError();

  let abort;
  const aborted = new Promise((_, reject) => {
    abort = () => reject(abortedRequestError());
    signal.addEventListener("abort", abort, { once: true });
  });

  try {
    return await Promise.race([catalogTreeStore.load(), aborted]);
  } finally {
    signal.removeEventListener("abort", abort);
  }
}

function seriesUrlsById(index) {
  const urls = new Map();
  index.series.forEach((node) => {
    urls.set(node.id, seriesUrl(index, node.path));
  });
  return urls;
}

function addSeriesUrls(response, urls) {
  return {
    ...response,
    data: {
      ...response.data,
      items: response.data.items.map((item) => ({
        ...item,
        seriesUrl: urls?.get(item.seriesId) ?? null,
      })),
    },
  };
}

export function deepCopy(value) {
  return JSON.parse(JSON.stringify(value));
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
    throw createDataError("config", `Missing endpoint configuration: ${endpointName}`);
  }

  let url;
  try {
    url = new URL(endpoint, new URL(config.apiBaseUrl, windowObject.location.href));
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
        timedOut ? "The API request timed out." : "The API request was cancelled.",
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
      isPlainObject(payload) && Object.prototype.hasOwnProperty.call(payload, "error")
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
    throw createDataError("invalid-json", `The ${endpointName} endpoint returned invalid JSON.`);
  }

  return payload;
}

export class ApiDataProvider {
  constructor(config = APP_CONFIG, windowObject = window, fetchFunction = fetch) {
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
    return requestApi(this.config, this.window, this.fetch, "productCategories", {
      method: "GET",
      query: { root_id: rootId },
      signal,
    });
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
  expectContract(Array.isArray(categoryIds), "request.categoryIds", "array", categoryIds);
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
    expectContract(key.length > 0, "request.filters key", "non-empty string", key);
    expectContract(Array.isArray(values), `request.filters.${key}`, "string array", values);
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
  constructor(provider, catalogTreeStore = new CatalogTreeStore()) {
    this.provider = provider;
    this.catalogTreeStore = catalogTreeStore;
  }

  async getRootCategories(input = {}) {
    return validateRootResponse(await this.provider.getRootCategories(input));
  }

  async getProductCategories(input) {
    const normalized = {
      rootId: normalizeRootId(input.rootId),
      signal: input.signal,
    };
    return validateProductCategoryResponse(await this.provider.getProductCategories(normalized));
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
    const response = validateProductResponse(
      await this.provider.getProducts(normalized),
      normalized,
    );
    if (response.data.items.length === 0) return response;

    let urls = null;
    try {
      urls = seriesUrlsById(
        await loadCatalogIndex(this.catalogTreeStore, normalized.signal),
      );
    } catch (error) {
      if (normalized.signal?.aborted) throw error;
    }

    return addSeriesUrls(response, urls);
  }
}

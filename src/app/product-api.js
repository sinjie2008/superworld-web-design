const API_PREFIX = "/api/";

function encodePath(path) {
  return String(path)
    .split("/")
    .filter(Boolean)
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

export class ProductApiError extends Error {
  constructor(message, status = 0, code = "API_UNAVAILABLE") {
    super(message);
    this.name = "ProductApiError";
    this.status = status;
    this.code = code;
  }
}

export class ProductApiClient {
  constructor(fetchFunction = globalThis.fetch.bind(globalThis)) {
    this.fetch = fetchFunction;
  }

  async request(endpoint, { signal, query } = {}) {
    const params = new URLSearchParams();
    Object.entries(query || {}).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      if (Array.isArray(value)) value.forEach((item) => params.append(key, String(item)));
      else params.set(key, String(value));
    });
    const url = `${API_PREFIX}${endpoint}${params.size ? `?${params}` : ""}`;
    const response = await this.fetch(url, {
      headers: { Accept: "application/json" },
      credentials: "same-origin",
      signal,
    });
    let payload;
    try {
      payload = await response.json();
    } catch {
      throw new ProductApiError("Product API returned invalid JSON.", response.status);
    }
    if (!response.ok || payload?.success !== true || !("data" in payload)) {
      throw new ProductApiError(
        payload?.error?.message || `Product API request failed (${response.status}).`,
        response.status,
        payload?.error?.code,
      );
    }
    return payload.data;
  }

  index(options) {
    return this.request("", options);
  }

  health(options) {
    return this.request("health", options);
  }

  tree(options) {
    return this.request("tree", options);
  }

  resolve(path, options) {
    return this.request(`resolve/${encodePath(path)}`, options);
  }

  category(path, options) {
    return this.request(`categories/${encodePath(path)}`, options);
  }

  series(path, options) {
    return this.request(`series/${encodePath(path)}`, options);
  }

  fields(path, options) {
    return this.request(`series/${encodePath(path)}/fields`, options);
  }

  parts(path, { signal, page = 1, perPage = 25, search = "", filters = {} } = {}) {
    const query = { page, per_page: perPage, search };
    Object.entries(filters).forEach(([key, values]) => {
      if (values !== "" && values !== null && values !== undefined)
        query[`filter[${key}]`] = values;
    });
    return this.request(`series/${encodePath(path)}/parts`, { signal, query });
  }

  facets(path, options) {
    return this.request(`series/${encodePath(path)}/facets`, options);
  }

  search(keyword, options = {}) {
    return this.request("search", { ...options, query: { q: keyword } });
  }
}

export const productApi = new ProductApiClient();

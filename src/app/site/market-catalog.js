import { buildQueryString } from "../features/spec-search/query.js";

const catalogPrefix = "/api/application-catalog/series/";
export const specificationSearch = "/tools/spec-search";

export class MarketCatalog {
  constructor() {
    this.requests = new Map();
  }

  read(path, suffix = "") {
    const key = path + suffix;
    if (!this.requests.has(key)) {
      const url = catalogPrefix + path.split("/").map(encodeURIComponent).join("/") + suffix;
      const request = (async () => {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Catalog request failed");
        const payload = await response.json();
        if (!payload.success) throw new Error("Catalog response unavailable");
        return payload.data;
      })().catch((error) => {
        this.requests.delete(key);
        throw error;
      });
      this.requests.set(key, request);
    }
    return this.requests.get(key);
  }
}

export function exactSearchHref(selections) {
  const rootId = selections[0]?.rootId;
  if (!rootId || !selections.every((selection) => selection?.rootId === rootId)) return null;
  const categories = [...new Set(selections.map(({ categoryId }) => categoryId))];
  const series = [...new Set(selections.map((entry) => entry.series))];
  const query = buildQueryString(rootId, categories, { series });
  return specificationSearch + "?" + query;
}

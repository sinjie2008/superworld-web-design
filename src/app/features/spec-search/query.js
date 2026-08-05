export function parseQuerySelection(search) {
  const params = new URLSearchParams(search);
  const rootId = Number(params.get("root"));
  const categoryIds = Array.from(
    new Set(
      params
        .getAll("category")
        .map(Number)
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  );
  const inquiryProductIds = Array.from(
    new Set(
      params
        .getAll("inquiry")
        .map(Number)
        .filter((value) => Number.isInteger(value) && value > 0),
    ),
  );
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
    inquiryProductIds,
  };
}

export function selectAvailableFilters(requestedFilters, facets) {
  const available = new Map(
    facets.map((facet) => [facet.key, new Set(facet.values)]),
  );
  return Object.fromEntries(
    Object.entries(requestedFilters).flatMap(([key, values]) => {
      const options = available.get(key);
      if (!options) return [];
      const selected = values.filter((value) => options.has(value));
      return selected.length > 0 ? [[key, selected]] : [];
    }),
  );
}

export function buildQueryString(
  rootId,
  categoryIds,
  filters,
  inquiryProductIds = [],
) {
  const params = new URLSearchParams();
  if (Number.isInteger(rootId) && rootId > 0)
    params.set("root", String(rootId));
  categoryIds.forEach((categoryId) =>
    params.append("category", String(categoryId)),
  );
  Object.entries(filters).forEach(([key, values]) => {
    values.forEach((value) => params.append(`filter.${key}`, value));
  });
  inquiryProductIds.forEach((productId) =>
    params.append("inquiry", String(productId)),
  );
  return params.toString();
}

export class SpecificationSearchQuery {
  constructor(searchState, windowObject = window) {
    this.state = searchState;
    this.window = windowObject;
    this.initialSelection = parseQuerySelection("");
  }

  setInitialSelection(search) {
    this.initialSelection = parseQuerySelection(search);
  }

  buildInquiryUrl() {
    const queryString = buildQueryString(
      this.state.rootId,
      this.state.categoryIds,
      this.state.filters,
      [...this.state.inquiryProductIds],
    );
    return `/inquiry${queryString ? `?${queryString}` : ""}`;
  }

  sync() {
    const url = new URL(this.window.location.href);
    Array.from(url.searchParams.keys()).forEach((key) => {
      if (
        key === "root" ||
        key === "category" ||
        key === "inquiry" ||
        key.startsWith("filter.")
      ) {
        url.searchParams.delete(key);
      }
    });
    new URLSearchParams(
      buildQueryString(
        this.state.rootId,
        this.state.categoryIds,
        this.state.filters,
        Array.from(this.state.inquiryProductIds),
      ),
    ).forEach((value, key) => url.searchParams.append(key, value));
    this.window.history.replaceState(null, "", url.href);
  }
}

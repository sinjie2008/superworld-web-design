import { APP_CONFIG } from "./config.js";
import { deepCopy } from "./data-service.js";
import { selectAvailableFilters } from "./query.js";
import { defaultColumns, productColumns } from "./render.js";

export class SpecificationSearchRequests {
  constructor(state, dataService, query, renderer, config = APP_CONFIG) {
    this.state = state;
    this.dataService = dataService;
    this.query = query;
    this.renderer = renderer;
    this.config = config;
    this.requestRevision = 0;
    this.requestController = null;
  }

  cancelActive() {
    if (this.requestController) this.requestController.abort();
    this.requestController = null;
    this.requestRevision += 1;
  }

  destroy() {
    this.cancelActive();
  }

  begin(message) {
    this.cancelActive();
    this.requestRevision += 1;
    this.requestController = new AbortController();
    this.renderer.setStatus(message, "loading");
    return {
      revision: this.requestRevision,
      signal: this.requestController.signal,
    };
  }

  isCurrent(revision) {
    return revision === this.requestRevision;
  }

  finish(revision) {
    if (!this.isCurrent(revision)) return;
    this.requestController = null;
    this.renderer.setStatus("");
  }

  handleLoadError(prefix, error, revision) {
    if (
      !this.isCurrent(revision) ||
      error.kind === "aborted" ||
      error.name === "AbortError"
    )
      return;
    this.state.scopeLoading = false;
    this.requestController = null;
    const correlation = error.correlationId
      ? ` (Correlation ID: ${error.correlationId})`
      : "";
    this.renderer.setStatus(
      `${prefix}: ${error.message}${correlation}`,
      "error",
    );
  }

  async loadRoots() {
    this.state.pendingInquiryProductIds = this.query.initialSelection.inquiryProductIds ?? [];
    const request = this.begin("Loading roots...");
    try {
      const response = await this.dataService.getRootCategories({
        signal: request.signal,
      });
      if (!this.isCurrent(request.revision)) return;
      this.state.roots = response.data.categories
        .slice()
        .sort(
          (left, right) =>
            Number(right.id === this.config.defaultRootId) -
            Number(left.id === this.config.defaultRootId),
        );
      const requestedRoot = this.state.roots.find(
        (root) => root.id === this.query.initialSelection.rootId,
      );
      this.state.rootId = requestedRoot ? requestedRoot.id : null;
      this.renderer.renderRoots();
      await this.loadCategories(this.state.rootId ?? this.state.roots[0]?.id, true);
    } catch (error) {
      if (!this.isCurrent(request.revision)) return;
      this.state.roots = [];
      this.state.rootId = null;
      this.state.groups = [];
      this.state.categoryIds = [];
      this.state.filters = {};
      this.state.facets = [];
      this.state.products = [];
      this.state.resultTotal = 0;
      this.state.productResponseReady = false;
      this.state.table.columns = defaultColumns();
      this.state.table.page = 1;
      this.renderer.renderRoots();
      this.renderer.renderCategories();
      this.renderer.renderSelectedFilters();
      this.renderer.renderFacets();
      this.renderer.renderResults();
      this.handleLoadError("Error loading roots", error, request.revision);
    }
  }

  async loadCategories(rootId, applyQuerySelection = false) {
    this.state.scopeLoading = true;
    this.state.table.page = 1;
    this.state.products = [];
    this.state.resultTotal = 0;
    this.state.productResponseReady = false;
    this.renderer.renderResults();
    const request = this.begin("Loading categories...");
    this.renderer.renderCategories("Loading...");
    try {
      const groups = rootId === undefined
        ? []
        : (await this.dataService.getProductCategories({ rootId, signal: request.signal })).data.groups;
      if (!this.isCurrent(request.revision)) return;
      this.state.groups = groups;
      const availableCategoryIds = new Set(
        this.state.groups.flatMap((group) =>
          group.categories.map((category) => category.id),
        ),
      );
      this.state.categoryIds = applyQuerySelection
        ? this.query.initialSelection.categoryIds.filter((categoryId) =>
            availableCategoryIds.has(categoryId),
          )
        : [];
      this.state.filters = {};
      this.state.facets = [];
      this.state.table.columns = defaultColumns();
      this.renderer.renderCategories();
      this.renderer.renderFacets();
      this.renderer.renderSelectedFilters();
      this.renderer.renderResults();
      const initialFilters = applyQuerySelection ? this.query.initialSelection.filters : null;
      await this.loadFacetsAndProducts(initialFilters);
    } catch (error) {
      if (!this.isCurrent(request.revision)) return;
      this.state.groups = [];
      this.state.scopeLoading = false;
      this.state.categoryIds = [];
      this.state.filters = {};
      this.state.facets = [];
      this.state.products = [];
      this.state.resultTotal = 0;
      this.state.table.page = 1;
      this.state.table.columns = defaultColumns();
      this.renderer.resetTableInteraction();
      this.renderer.renderCategories();
      this.renderer.renderSelectedFilters();
      this.renderer.renderFacets();
      this.renderer.renderResults();
      this.handleLoadError("Error loading categories", error, request.revision);
    }
  }

  async loadFacetsAndProducts(requestedFilters = null) {
    if (this.state.categoryIds.length === 0) {
      this.state.scopeLoading = false;
      this.state.facets = [];
      this.renderer.renderFacets();
      await this.loadProducts();
      return;
    }
    this.state.scopeLoading = true;
    const request = this.begin("Loading filters...");
    const input = {
      categoryIds: this.state.categoryIds.slice(),
      signal: request.signal,
    };
    try {
      const facetResponse = await this.dataService.getFacets(input);
      if (!this.isCurrent(request.revision)) return;
      this.state.facets = facetResponse.data.facets;
      this.state.scopeLoading = false;
      if (requestedFilters && !this.state.skipInitialFilters)
        this.state.filters = selectAvailableFilters(
          requestedFilters,
          this.state.facets,
        );
      this.renderer.renderFacets();
      this.renderer.renderSelectedFilters();
      return this.loadProducts();
    } catch (error) {
      if (!this.isCurrent(request.revision)) return;
      this.state.products = [];
      this.state.resultTotal = 0;
      this.state.productResponseReady = false;
      this.state.table.page = 1;
      this.state.table.columns = defaultColumns();
      this.renderer.renderResults();
      const prefix = error.kind === "contract" ? "Invalid API response" : "Error loading filters";
      this.handleLoadError(prefix, error, request.revision);
    }
  }

  async loadProducts() {
    if (this.state.scopeLoading) return;
    const table = this.state.table;
    const inquiryIds = this.state.pendingInquiryProductIds;
    const request = this.begin("Loading products...");
    try {
      const response = await this.dataService.getProducts({
        rootId: this.state.rootId,
        categoryIds: this.state.categoryIds.slice(),
        filters: deepCopy(this.state.filters),
        pagination: { page: table.page, per_page: table.pageSize },
        search: table.query,
        sortKey: table.sortKey,
        sortDirection: table.sortDirection,
        inquiryIds,
        signal: request.signal,
      });
      if (!this.isCurrent(request.revision)) return;
      this.state.products = response.data.items;
      this.state.resultTotal = response.data.total;
      table.page = response.data.pagination.page;
      table.columns = productColumns(response.data.column_keys);
      this.state.productResponseReady = true;
      response.data.inquiry_items.forEach(({ id, sku }) => this.state.inquiryProductSkus.set(id, sku));
      this.state.pendingInquiryProductIds = [];
      this.query.sync();
      this.renderer.renderResults();
      this.finish(request.revision);
    } catch (error) {
      if (!this.isCurrent(request.revision)) return;
      this.state.products = [];
      this.state.resultTotal = 0;
      this.state.productResponseReady = false;
      this.state.table.page = 1;
      this.state.table.columns = defaultColumns();
      this.renderer.renderResults();
      this.handleLoadError(
        error.kind === "contract"
          ? "Invalid API response"
          : "Error loading products",
        error,
        request.revision,
      );
    }
  }
}

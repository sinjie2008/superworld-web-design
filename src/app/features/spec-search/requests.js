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
      this.state.rootId = requestedRoot
        ? requestedRoot.id
        : (this.state.roots[0]?.id ?? null);
      this.renderer.renderRoots();
      if (this.state.rootId === null) {
        this.finish(request.revision);
        return;
      }
      await this.loadCategories(this.state.rootId, true);
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
      this.state.table.columns = defaultColumns();
      this.renderer.resetTableInteraction();
      this.renderer.renderRoots();
      this.renderer.renderCategories();
      this.renderer.renderSelectedFilters();
      this.renderer.renderFacets();
      this.renderer.renderResults();
      this.handleLoadError("Error loading roots", error, request.revision);
    }
  }

  async loadCategories(rootId, applyQuerySelection = false) {
    const request = this.begin("Loading categories...");
    this.renderer.renderCategories("Loading...");
    try {
      const response = await this.dataService.getProductCategories({
        rootId,
        signal: request.signal,
      });
      if (!this.isCurrent(request.revision)) return;
      this.state.groups = response.data.groups;
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
      this.state.products = [];
      this.state.resultTotal = 0;
      this.state.table.columns = defaultColumns();
      this.renderer.resetTableInteraction();
      this.renderer.renderCategories();
      this.renderer.renderFacets();
      this.renderer.renderSelectedFilters();
      this.renderer.renderResults();
      if (applyQuerySelection && this.state.categoryIds.length > 0) {
        await this.loadFacetsAndProducts(
          this.query.initialSelection.filters,
          this.query.initialSelection.inquiryProductIds,
        );
        return;
      }
      this.finish(request.revision);
    } catch (error) {
      if (!this.isCurrent(request.revision)) return;
      this.state.groups = [];
      this.state.categoryIds = [];
      this.state.filters = {};
      this.state.facets = [];
      this.state.products = [];
      this.state.resultTotal = 0;
      this.state.table.columns = defaultColumns();
      this.renderer.resetTableInteraction();
      this.renderer.renderCategories();
      this.renderer.renderSelectedFilters();
      this.renderer.renderFacets();
      this.renderer.renderResults();
      this.handleLoadError("Error loading categories", error, request.revision);
    }
  }

  async loadFacetsAndProducts(
    requestedFilters = null,
    requestedInquiryProductIds = [],
  ) {
    const request = this.begin("Loading filters...");
    const input = {
      categoryIds: this.state.categoryIds.slice(),
      signal: request.signal,
    };
    let stage = "filters";
    try {
      const facetResponse = await this.dataService.getFacets(input);
      if (!this.isCurrent(request.revision)) return;
      this.state.facets = facetResponse.data.facets;
      if (requestedFilters)
        this.state.filters = selectAvailableFilters(
          requestedFilters,
          this.state.facets,
        );
      this.renderer.renderFacets();
      this.renderer.renderSelectedFilters();
      stage = "products";
      this.renderer.setStatus("Loading products...", "loading");

      const productResponse = await this.dataService.getProducts({
        categoryIds: this.state.categoryIds.slice(),
        filters: deepCopy(this.state.filters),
        signal: request.signal,
      });
      if (!this.isCurrent(request.revision)) return;
      this.state.products = productResponse.data.items;
      this.state.resultTotal = productResponse.data.total;
      this.state.table.columns = productColumns(this.state.products);
      this.renderer.resetTableInteraction();
      const availableProductIds = new Set(
        this.state.products.map((product) => product.id),
      );
      requestedInquiryProductIds.forEach((productId) => {
        if (availableProductIds.has(productId))
          this.state.inquiryProductIds.add(productId);
      });
      this.query.sync();
      this.renderer.renderResults();
      this.finish(request.revision);
    } catch (error) {
      if (!this.isCurrent(request.revision)) return;
      this.state.products = [];
      this.state.resultTotal = 0;
      this.state.table.columns = defaultColumns();
      this.renderer.resetTableInteraction();
      this.renderer.renderResults();
      const prefix =
        error.kind === "contract"
          ? "Invalid API response"
          : stage === "filters"
            ? "Error loading filters"
            : "Error loading products";
      this.handleLoadError(prefix, error, request.revision);
    }
  }

  async loadProducts() {
    if (this.state.categoryIds.length === 0) {
      this.cancelActive();
      this.state.products = [];
      this.state.resultTotal = 0;
      this.state.table.columns = defaultColumns();
      this.renderer.resetTableInteraction();
      this.renderer.renderResults();
      this.renderer.setStatus("");
      return;
    }

    const request = this.begin("Loading products...");
    try {
      const response = await this.dataService.getProducts({
        categoryIds: this.state.categoryIds.slice(),
        filters: deepCopy(this.state.filters),
        signal: request.signal,
      });
      if (!this.isCurrent(request.revision)) return;
      this.state.products = response.data.items;
      this.state.resultTotal = response.data.total;
      this.state.table.columns = productColumns(this.state.products);
      this.renderer.resetTableInteraction();
      this.renderer.renderResults();
      this.finish(request.revision);
    } catch (error) {
      if (!this.isCurrent(request.revision)) return;
      this.state.products = [];
      this.state.resultTotal = 0;
      this.state.table.columns = defaultColumns();
      this.renderer.resetTableInteraction();
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

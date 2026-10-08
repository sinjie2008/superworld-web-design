import { APP_CONFIG } from "./config.js";
import { createDataError } from "./contracts.js";
import { ApiDataProvider, deepCopy, SpecificationSearchDataService } from "./data-service.js";
import { SpecificationSearchDom } from "./dom.js";
import { SpecificationSearchEvents } from "./events.js";
import { SpecificationSearchQuery } from "./query.js";
import { defaultColumns, SpecificationSearchRenderer } from "./render.js";
import { SpecificationSearchRequests } from "./requests.js";
import { SpecificationSearchState } from "./state.js";

export class SpecificationSearchApplication {
  constructor(dependencies = {}) {
    this.config = dependencies.config ?? APP_CONFIG;
    this.window = dependencies.window ?? window;
    this.document = dependencies.document ?? document;
    this.state = dependencies.state ?? new SpecificationSearchState();
    this.dom = dependencies.dom ?? new SpecificationSearchDom(this.document);
    this.query = dependencies.query ?? new SpecificationSearchQuery(this.state, this.window);

    this.provider =
      dependencies.provider ?? dependencies.dataService?.provider ?? this.createProvider();
    this.dataService =
      dependencies.dataService ?? new SpecificationSearchDataService(this.provider);

    this.renderer =
      dependencies.renderer ??
      new SpecificationSearchRenderer(this.state, this.dom, this.query, {
        loadCategories: (...args) => this.requests.loadCategories(...args),
        loadProducts: (...args) => this.requests.loadProducts(...args),
        handleCategoryChange: (...args) => this.events.handleCategoryChange(...args),
      });
    this.requests =
      dependencies.requests ??
      new SpecificationSearchRequests(
        this.state,
        this.dataService,
        this.query,
        this.renderer,
        this.config,
      );
    this.events =
      dependencies.events ??
      new SpecificationSearchEvents(
        this.state,
        this.dom,
        this.query,
        this.renderer,
        this.requests,
        this.window,
      );
    this.initialized = false;
  }

  createProvider() {
    const fetchFunction = this.window.fetch.bind(this.window);
    if (this.config.dataSource === "api") {
      return new ApiDataProvider(this.config, this.window, fetchFunction);
    }
    throw createDataError("config", `Unknown dataSource: ${this.config.dataSource}`);
  }

  initialize() {
    this.destroy();
    if (!this.document.getElementById("status-message")) return;
    this.state.reset();
    this.query.setInitialSelection(this.window.location.search);
    try {
      this.dom.cache();
      this.events.bind();
      this.state.table.columns = defaultColumns();
      this.renderer.renderSelectedFilters();
      this.renderer.renderFacets();
      this.renderer.renderTable();
      this.initialized = true;
      void this.requests.loadRoots();
    } catch (error) {
      this.destroy();
      throw error;
    }
  }

  destroy() {
    this.events.unbind();
    this.requests.destroy();
    this.renderer.destroy();
    this.dom.invalidate();
    this.initialized = false;
  }

  getConfig() {
    return this.config;
  }

  getState() {
    return deepCopy({
      roots: this.state.roots,
      groups: this.state.groups,
      facets: this.state.facets,
      products: this.state.products,
      resultTotal: this.state.resultTotal,
      rootId: this.state.rootId,
      categoryIds: this.state.categoryIds,
      filters: this.state.filters,
      status: this.state.status,
      error: this.state.error,
      table: {
        query: this.state.table.query,
        sortKey: this.state.table.sortKey,
        sortDirection: this.state.table.sortDirection,
        page: this.state.table.page,
        pageSize: this.state.table.pageSize,
      },
    });
  }
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  const application = new SpecificationSearchApplication();
  window.SpecSearchApp = Object.freeze({
    initialize: () => application.initialize(),
    getConfig: () => application.getConfig(),
    getState: () => application.getState(),
  });

  if (document.getElementById("status-message")) window.SpecSearchApp.initialize();
}

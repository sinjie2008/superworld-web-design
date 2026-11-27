export class SpecificationSearchEvents {
  constructor(state, dom, query, renderer, requests, windowObject = window) {
    this.state = state;
    this.dom = dom;
    this.query = query;
    this.renderer = renderer;
    this.requests = requests;
    this.window = windowObject;
    this.bound = false;
    this.searchTimer = null;
    this.handleTableSearchInput = this.handleTableSearchInput.bind(this);
    this.submitTableSearch = this.submitTableSearch.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
    this.openInquiry = this.openInquiry.bind(this);
    this.changePageSize = this.changePageSize.bind(this);
  }

  updateTableSearch() {
    this.state.table.query = this.dom["table-search"].value;
    this.state.table.page = 1;
    this.query.syncSearch();
  }

  submitTableSearch() {
    if (this.searchTimer !== null) this.window.clearTimeout(this.searchTimer);
    this.searchTimer = null;
    this.updateTableSearch();
    if (!this.state.scopeLoading) void this.requests.loadProducts();
  }

  handleTableSearchInput() {
    this.updateTableSearch();
    if (this.searchTimer !== null) this.window.clearTimeout(this.searchTimer);
    this.searchTimer = null;
    if (this.state.scopeLoading) return;
    this.searchTimer = this.window.setTimeout(() => this.submitTableSearch(), 190);
  }

  bind() {
    if (this.bound) return;
    this.dom["clear-filters"].addEventListener("click", this.clearFilters);
    this.dom["table-search"].addEventListener("input", this.handleTableSearchInput);
    this.dom["table-search-submit"].addEventListener(
      "click",
      this.submitTableSearch,
    );
    this.dom["inquiry-button"].addEventListener("click", this.openInquiry);
    this.dom["page-size"].addEventListener("change", this.changePageSize);
    this.bound = true;
  }

  unbind() {
    if (!this.bound) return;
    this.dom["clear-filters"].removeEventListener("click", this.clearFilters);
    this.dom["table-search"].removeEventListener("input", this.handleTableSearchInput);
    this.dom["table-search-submit"].removeEventListener(
      "click",
      this.submitTableSearch,
    );
    this.dom["inquiry-button"].removeEventListener("click", this.openInquiry);
    this.dom["page-size"].removeEventListener("change", this.changePageSize);
    if (this.searchTimer !== null) this.window.clearTimeout(this.searchTimer);
    this.searchTimer = null;
    this.bound = false;
  }

  clearFilters() {
    this.state.filters = {};
    this.state.inquiryProductSkus.clear();
    this.state.pendingInquiryProductIds = [];
    this.state.table.query = "";
    this.state.table.page = 1;
    this.dom["table-search"].value = "";
    if (this.searchTimer !== null) this.window.clearTimeout(this.searchTimer);
    this.searchTimer = null;
    if (this.state.scopeLoading) {
      this.state.skipInitialFilters = true;
      this.query.syncSearch();
      return;
    }
    this.query.sync();
    this.renderer.renderSelectedFilters();
    this.renderer.renderFacets();
    void this.requests.loadProducts();
  }

  openInquiry() {
    if (this.state.inquiryProductSkus.size > 0)
      this.window.location.href = this.query.buildInquiryUrl();
  }

  changePageSize() {
    this.state.table.pageSize = Number(this.dom["page-size"].value);
    this.state.table.page = 1;
    if (!this.state.scopeLoading) void this.requests.loadProducts();
  }

  handleCategoryChange() {
    this.state.categoryIds = Array.from(
      this.dom["product-categories"].querySelectorAll(
        "input[type='checkbox']:checked",
      ),
    ).map((input) => Number(input.value));
    this.state.filters = {};
    this.state.facets = [];
    this.state.inquiryProductSkus.clear();
    this.state.pendingInquiryProductIds = [];
    this.state.table.page = 1;
    this.state.table.sortKey = null;
    this.state.table.sortDirection = "asc";
    if (this.searchTimer !== null) this.window.clearTimeout(this.searchTimer);
    this.searchTimer = null;
    this.state.scopeLoading = true;
    this.state.products = [];
    this.state.resultTotal = 0;
    this.state.productResponseReady = false;
    this.renderer.renderResults();
    this.query.sync();
    this.dom["category-count"].textContent = `${this.state.categoryIds.length} selected`;
    this.renderer.renderSelectedFilters();
    this.renderer.renderFacets();

    void this.requests.loadFacetsAndProducts();
  }
}

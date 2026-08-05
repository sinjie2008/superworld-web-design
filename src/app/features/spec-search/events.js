import { defaultColumns } from "./render.js";

export class SpecificationSearchEvents {
  constructor(state, dom, query, renderer, requests, windowObject = window) {
    this.state = state;
    this.dom = dom;
    this.query = query;
    this.renderer = renderer;
    this.requests = requests;
    this.window = windowObject;
    this.bound = false;
    this.applyTableSearch = this.applyTableSearch.bind(this);
    this.clearFilters = this.clearFilters.bind(this);
    this.openInquiry = this.openInquiry.bind(this);
    this.changePageSize = this.changePageSize.bind(this);
  }

  applyTableSearch() {
    this.state.table.query = this.dom["table-search"].value;
    this.state.table.page = 1;
    this.renderer.renderTable();
  }

  bind() {
    if (this.bound) return;
    this.dom["clear-filters"].addEventListener("click", this.clearFilters);
    this.dom["table-search"].addEventListener("input", this.applyTableSearch);
    this.dom["table-search-submit"].addEventListener(
      "click",
      this.applyTableSearch,
    );
    this.dom["inquiry-button"].addEventListener("click", this.openInquiry);
    this.dom["page-size"].addEventListener("change", this.changePageSize);
    this.bound = true;
  }

  unbind() {
    if (!this.bound) return;
    this.dom["clear-filters"].removeEventListener("click", this.clearFilters);
    this.dom["table-search"].removeEventListener("input", this.applyTableSearch);
    this.dom["table-search-submit"].removeEventListener(
      "click",
      this.applyTableSearch,
    );
    this.dom["inquiry-button"].removeEventListener("click", this.openInquiry);
    this.dom["page-size"].removeEventListener("change", this.changePageSize);
    this.bound = false;
  }

  clearFilters() {
    this.state.filters = {};
    this.state.facets = [];
    this.state.inquiryProductIds.clear();
    this.query.sync();
    this.renderer.renderSelectedFilters();
    this.renderer.renderFacets();
    void this.requests.loadProducts();
  }

  openInquiry() {
    if (this.state.inquiryProductIds.size > 0)
      this.window.location.href = this.query.buildInquiryUrl();
  }

  changePageSize() {
    this.state.table.pageSize = Number(this.dom["page-size"].value);
    this.state.table.page = 1;
    this.renderer.renderTable();
  }

  handleCategoryChange() {
    this.state.categoryIds = Array.from(
      this.dom["product-categories"].querySelectorAll(
        "input[type='checkbox']:checked",
      ),
    ).map((input) => Number(input.value));
    this.state.filters = {};
    this.state.facets = [];
    this.state.inquiryProductIds.clear();
    this.query.sync();
    this.dom["category-count"].textContent = `${this.state.categoryIds.length} selected`;
    this.renderer.renderSelectedFilters();
    this.renderer.renderFacets();

    if (this.state.categoryIds.length === 0) {
      this.requests.cancelActive();
      this.state.products = [];
      this.state.resultTotal = 0;
      this.state.table.columns = defaultColumns();
      this.renderer.resetTableInteraction();
      this.renderer.renderResults();
      this.renderer.setStatus("");
      return;
    }
    void this.requests.loadFacetsAndProducts();
  }
}

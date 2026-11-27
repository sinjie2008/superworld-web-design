export class SpecificationSearchState {
  constructor() {
    this.reset();
  }

  reset() {
    this.roots = [];
    this.groups = [];
    this.facets = [];
    this.products = [];
    this.resultTotal = 0;
    this.productResponseReady = false;
    this.scopeLoading = true;
    this.skipInitialFilters = false;
    this.inquiryProductSkus = new Map();
    this.pendingInquiryProductIds = [];
    this.rootId = null;
    this.categoryIds = [];
    this.filters = {};
    this.status = "idle";
    this.error = null;
    this.table = {
      query: "",
      sortKey: null,
      sortDirection: "asc",
      page: 1,
      pageSize: 10,
      columns: [],
    };
    return this;
  }
}

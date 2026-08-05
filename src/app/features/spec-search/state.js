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
    this.inquiryProductIds = new Set();
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

import { createDataError } from "./contracts.js";

export class SpecificationSearchDom {
  constructor(documentObject = document) {
    this.document = documentObject;
    this.ids = [
      "status-message",
      "root-count",
      "root-category-options",
      "category-count",
      "product-categories",
      "clear-filters",
      "selected-filters",
      "facet-container",
      "result-count",
      "page-size",
      "table-search",
      "table-search-submit",
      "inquiry-button",
      "results-table",
      "table-info",
      "pagination",
    ];
    this.invalidate();
  }

  cache() {
    this.invalidate();
    this.ids.forEach((id) => {
      const element = this.document.getElementById(id);
      if (!element)
        throw createDataError("config", `Missing required element #${id}`);
      this[id] = element;
    });
    this.tableHead = this["results-table"].querySelector("thead");
    this.tableBody = this["results-table"].querySelector("tbody");
    return this;
  }

  invalidate() {
    this.ids.forEach((id) => delete this[id]);
    this.tableHead = null;
    this.tableBody = null;
  }
}

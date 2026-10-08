const FIXED_PRODUCT_SPEC_COLUMNS = Object.freeze([
  { key: "acf.length", title: "Length (mm)", sourceKeys: ["acf.length"] },
  { key: "acf.width", title: "Width (mm)", sourceKeys: ["acf.width"] },
  { key: "acf.height", title: "Height (mm)", sourceKeys: ["acf.height"] },
  {
    key: "acf.inductance",
    title: "Inductance (uH)",
    sourceKeys: ["acf.inductance"],
  },
  {
    key: "acf.impedance",
    title: "Impedance (Ω)",
    sourceKeys: ["acf.impedance"],
  },
  { key: "acf.dcr", title: "DCR (mΩ)", sourceKeys: ["acf.dcr"] },
  { key: "acf.isat", title: "Isat (mA)", sourceKeys: ["acf.isat"] },
  { key: "acf.irms", title: "Irms (mA)", sourceKeys: ["acf.irms"] },
  { key: "spq", title: "SPQ", sourceKeys: ["spq", "acf.spq"] },
]);

export function displayFieldLabel(value) {
  return String(value)
    .replace(/^acf(?:\.|\s+)/i, "")
    .replace(/[._]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function defaultColumns() {
  return productColumns([]);
}

export function productColumns(products) {
  const fixedSpecKeys = new Set(
    FIXED_PRODUCT_SPEC_COLUMNS.flatMap((column) => column.sourceKeys),
  );
  const excluded = new Set([
    "id",
    "sku",
    "name",
    "series",
    "category",
    "seriesImage",
    "pdfDownload",
    "seriesId",
    "seriesUrl",
    "categoryId",
    ...fixedSpecKeys,
  ]);
  const dynamicKeys = new Set();
  products.forEach((product) => {
    Object.keys(product).forEach((key) => {
      if (!excluded.has(key)) dynamicKeys.add(key);
    });
  });

  const fixedColumns = FIXED_PRODUCT_SPEC_COLUMNS.map(
    ({ key, title, sourceKeys }) => ({
      key,
      title,
      sortable: true,
      searchable: true,
      value: (row) =>
        sourceKeys
          .map((sourceKey) => row[sourceKey])
          .find((value) => value !== undefined && value !== null) ?? "",
    }),
  );
  const spqColumn = fixedColumns.pop();

  return [
    {
      key: "name",
      title: "Product",
      sortable: true,
      searchable: true,
      kind: "product",
      value: (row) => row.name || "",
    },
    {
      key: "category",
      title: "Category",
      sortable: true,
      searchable: true,
      value: (row) => row.category || "",
    },
    ...fixedColumns,
    ...Array.from(dynamicKeys).map((key) => ({
      key,
      title: displayFieldLabel(key),
      sortable: true,
      searchable: true,
      value: (row) =>
        row[key] === undefined || row[key] === null ? "" : row[key],
    })),
    spqColumn,
    {
      key: "pdfDownload",
      title: "PDF Download",
      sortable: false,
      searchable: false,
      kind: "pdf",
      value: (row) => row.pdfDownload || "",
    },
  ];
}

export class SpecificationSearchRenderer {
  constructor(state, dom, query, actions) {
    this.state = state;
    this.dom = dom;
    this.query = query;
    this.actions = actions;
    this.listenerControllers = new Map();
  }

  listenerSignal(scope) {
    this.listenerControllers.get(scope)?.abort();
    const controller = new AbortController();
    this.listenerControllers.set(scope, controller);
    return controller.signal;
  }

  destroy() {
    this.listenerControllers.forEach((controller) => controller.abort());
    this.listenerControllers.clear();
  }

  resetTableInteraction() {
    this.state.table.query = "";
    this.state.table.sortKey = null;
    this.state.table.sortDirection = "asc";
    this.state.table.page = 1;
    this.state.table.pageSize = 10;
    this.state.inquiryProductIds.clear();
    this.dom["table-search"].value = "";
    this.dom["page-size"].value = "10";
  }

  deriveTableRows() {
    const query = this.state.table.query.trim().toLocaleLowerCase();
    const searchableColumns = this.state.table.columns.filter(
      (column) => column.searchable,
    );
    const filtered = query
      ? this.state.products.filter((product) =>
          String(product.series || "").toLocaleLowerCase().includes(query) ||
          searchableColumns.some((column) =>
            String(column.value(product)).toLocaleLowerCase().includes(query),
          ),
        )
      : this.state.products.slice();

    const sortColumn = this.state.table.columns.find(
      (column) => column.key === this.state.table.sortKey && column.sortable,
    );
    if (sortColumn) {
      const direction = this.state.table.sortDirection === "desc" ? -1 : 1;
      const collator = new Intl.Collator(undefined, {
        numeric: true,
        sensitivity: "base",
      });
      filtered.sort(
        (left, right) =>
          direction *
          collator.compare(
            String(sortColumn.value(left)),
            String(sortColumn.value(right)),
          ),
      );
    }

    const pageCount = Math.max(
      1,
      Math.ceil(filtered.length / this.state.table.pageSize),
    );
    if (this.state.table.page > pageCount) this.state.table.page = pageCount;
    const startIndex = (this.state.table.page - 1) * this.state.table.pageSize;
    return {
      filtered,
      pageRows: filtered.slice(
        startIndex,
        startIndex + this.state.table.pageSize,
      ),
      pageCount,
      startIndex,
    };
  }

  updateFilter(key, value, checked) {
    const current = this.state.filters[key] || [];
    this.state.filters[key] = checked
      ? Array.from(new Set([...current, value]))
      : current.filter((item) => item !== value);
    if (this.state.filters[key].length === 0) delete this.state.filters[key];
    this.state.table.page = 1;
    this.state.inquiryProductIds.clear();
    this.query.sync();
    this.renderSelectedFilters();
    void this.actions.loadProducts();
  }

  isSafeResourceUrl(value, allowedDataPrefix = "") {
    if (!value) return false;
    try {
      const parsed = new URL(value, window.location.href);
      return (
        ["http:", "https:", "file:", "blob:"].includes(parsed.protocol) ||
        (allowedDataPrefix &&
          parsed.protocol === "data:" &&
          value.startsWith(allowedDataPrefix))
      );
    } catch (error) {
      return false;
    }
  }

  setStatus(message, mode = "idle") {
    this.state.status = mode;
    this.state.error = mode === "error" ? message : null;
    this.dom["status-message"].replaceChildren();
    this.dom["status-message"].classList.toggle("error", mode === "error");
    this.dom["status-message"].setAttribute(
      "aria-busy",
      mode === "loading" ? "true" : "false",
    );
    this.dom["status-message"].setAttribute(
      "role",
      mode === "error" ? "alert" : "status",
    );
    if (mode === "loading") {
      const spinner = document.createElement("span");
      spinner.className = "spinner";
      spinner.setAttribute("aria-hidden", "true");
      this.dom["status-message"].append(spinner);
    }
    if (message)
      this.dom["status-message"].append(document.createTextNode(message));
  }

  appendMutedMessage(container, message) {
    const element = document.createElement("div");
    element.className = "muted";
    element.style.fontSize = "14px";
    element.textContent = message;
    container.append(element);
  }

  renderRoots() {
    const signal = this.listenerSignal("roots");
    const container = this.dom["root-category-options"];
    container.replaceChildren();
    this.dom["root-count"].textContent = `${this.state.roots.length} roots`;
    if (this.state.roots.length === 0) {
      this.appendMutedMessage(container, "No roots available.");
      return;
    }

    this.state.roots.forEach((root) => {
      const label = document.createElement("label");
      label.className = "form-check";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "root_category";
      input.value = String(root.id);
      input.checked = root.id === this.state.rootId;
      input.addEventListener(
        "change",
        () => {
          this.state.rootId = root.id;
          this.state.categoryIds = [];
          this.state.filters = {};
          this.state.inquiryProductIds.clear();
          this.query.sync();
          void this.actions.loadCategories(root.id);
        },
        { signal },
      );
      const text = document.createElement("span");
      text.textContent = root.name;
      label.append(input, text);
      container.append(label);
    });
  }

  renderCategories(message = "") {
    const signal = this.listenerSignal("categories");
    const container = this.dom["product-categories"];
    container.replaceChildren();
    this.dom["category-count"].textContent = `${this.state.categoryIds.length} selected`;
    if (message) {
      this.appendMutedMessage(container, message);
      return;
    }
    if (this.state.groups.length === 0) {
      this.appendMutedMessage(container, "No categories found.");
      return;
    }

    this.state.groups.forEach((group) => {
      const card = document.createElement("div");
      card.className = "facet-card";
      const title = document.createElement("h3");
      title.textContent = group.group;
      const list = document.createElement("div");
      list.className = "category-list";

      group.categories.forEach((category) => {
        const label = document.createElement("label");
        label.className = "form-check";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.value = String(category.id);
        input.checked = this.state.categoryIds.includes(category.id);
        input.addEventListener(
          "change",
          () => this.actions.handleCategoryChange(),
          { signal },
        );
        const text = document.createElement("span");
        text.textContent = category.name;
        label.append(input, text);
        list.append(label);
      });

      card.append(title, list);
      container.append(card);
    });
  }

  renderSelectedFilters() {
    const signal = this.listenerSignal("selected-filters");
    const container = this.dom["selected-filters"];
    container.replaceChildren();
    const entries = Object.entries(this.state.filters);
    if (entries.length === 0) {
      const text = document.createElement("span");
      text.className = "muted";
      text.style.fontSize = "14px";
      text.textContent = "No filters applied.";
      container.append(text);
      return;
    }

    entries.forEach(([key, values]) => {
      values.forEach((value) => {
        const chip = document.createElement("span");
        chip.className = "chip";
        const text = document.createElement("span");
        text.textContent = `${displayFieldLabel(key)}: ${value}`;
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = "×";
        button.setAttribute(
          "aria-label",
          `Remove ${displayFieldLabel(key)} ${value}`,
        );
        button.addEventListener(
          "click",
          () => {
            document
              .querySelectorAll("#facet-container input[type='checkbox']")
              .forEach((input) => {
                if (input.dataset.key === key && input.value === value)
                  input.checked = false;
              });
            this.updateFilter(key, value, false);
          },
          { signal },
        );
        chip.append(text, button);
        container.append(chip);
      });
    });
  }

  renderFacets() {
    const signal = this.listenerSignal("facets");
    const container = this.dom["facet-container"];
    container.replaceChildren();
    if (this.state.facets.length === 0) {
      this.appendMutedMessage(container, "No filters yet. Select categories.");
      return;
    }

    this.state.facets.forEach((facet, facetIndex) => {
      const card = document.createElement("div");
      card.className = "facet-card";
      const title = document.createElement("h3");
      const displayLabel = displayFieldLabel(facet.label);
      title.textContent = displayLabel;
      const search = document.createElement("input");
      search.type = "search";
      search.className = "form-control";
      search.placeholder = `Search ${displayLabel}...`;
      search.setAttribute("aria-label", `Search ${displayLabel}`);
      const searchField = document.createElement("div");
      searchField.className = "facet-search";
      const searchAction = document.createElement("button");
      searchAction.type = "button";
      searchAction.className = "facet-search-action";
      searchAction.setAttribute("aria-label", `Search ${displayLabel}`);
      searchField.append(search, searchAction);
      const list = document.createElement("ul");
      list.className = "facet-list";
      list.dataset.key = facet.key;

      facet.values.forEach((value, valueIndex) => {
        const item = document.createElement("li");
        const check = document.createElement("div");
        check.className = "form-check";
        const input = document.createElement("input");
        input.type = "checkbox";
        input.id = `facet-${facetIndex}-${valueIndex}`;
        input.value = value;
        input.dataset.key = facet.key;
        input.checked = (this.state.filters[facet.key] || []).includes(value);
        input.addEventListener(
          "change",
          () => this.updateFilter(facet.key, value, input.checked),
          { signal },
        );
        const label = document.createElement("label");
        label.htmlFor = input.id;
        label.textContent = value;
        check.append(input, label);
        item.append(check);
        list.append(item);
      });

      const filterFacetItems = () => {
        const term = search.value.toLocaleLowerCase().trim();
        list.querySelectorAll("li").forEach((item) => {
          item.hidden =
            Boolean(term) &&
            !item.textContent.toLocaleLowerCase().includes(term);
        });
        const hasValue = Boolean(search.value);
        searchAction.classList.toggle("is-clear", hasValue);
        searchAction.setAttribute(
          "aria-label",
          hasValue ? `Clear ${displayLabel} search` : `Search ${displayLabel}`,
        );
      };
      search.addEventListener("input", filterFacetItems, { signal });
      searchAction.addEventListener(
        "click",
        () => {
          if (search.value) {
            search.value = "";
            filterFacetItems();
          }
          search.focus();
        },
        { signal },
      );

      card.append(title, searchField, list);
      container.append(card);
    });
  }

  renderCell(cell, column, product) {
    const value = column.value(product);
    if (column.kind === "product") {
      cell.className = "product-column";
      const content = document.createElement("div");
      content.className = "product-cell";
      const image = document.createElement("img");
      image.className = "series-image";
      image.src = "https://placehold.co/80x80";
      image.alt = product.series || "Series image";
      image.width = 80;
      image.height = 80;
      content.append(image);
      const name = document.createElement(product.seriesUrl ? "a" : "span");
      name.className = "product-name";
      if (product.seriesUrl) name.href = product.seriesUrl;
      name.textContent = String(value);
      content.append(name);
      cell.append(content);
      return;
    }
    if (column.kind === "pdf") {
      if (this.isSafeResourceUrl(value, "data:application/pdf")) {
        const link = document.createElement("a");
        link.className = "btn btn-sm btn-outline-secondary";
        link.href = value;
        link.download = `${product.sku || "product"}.pdf`;
        link.textContent = "Download";
        cell.append(link);
      }
      return;
    }
    cell.textContent =
      value === undefined || value === null ? "" : String(value);
  }

  makePageButton(
    label,
    page,
    { active = false, disabled = false, ariaLabel = "", signal } = {},
  ) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `page-button${active ? " active" : ""}`;
    button.textContent = label;
    button.disabled = disabled;
    if (active) button.setAttribute("aria-current", "page");
    if (ariaLabel) button.setAttribute("aria-label", ariaLabel);
    button.addEventListener(
      "click",
      () => {
        this.state.table.page = page;
        this.renderTable();
      },
      { signal },
    );
    return button;
  }

  renderPagination(pageCount, rowCount) {
    const signal = this.listenerSignal("pagination");
    const container = this.dom.pagination;
    container.replaceChildren();
    container.append(
      this.makePageButton(
        "Previous",
        Math.max(1, this.state.table.page - 1),
        {
          disabled: this.state.table.page === 1,
          ariaLabel: "Previous page",
          signal,
        },
      ),
    );
    if (rowCount > 0) {
      const currentPage = this.state.table.page;
      const pages = new Set([1, pageCount]);
      const start = pageCount <= 7 ? 1 : Math.max(2, Math.min(currentPage - 1, pageCount - 3));
      const end = pageCount <= 7 ? pageCount : Math.min(pageCount - 1, Math.max(currentPage + 1, 4));
      for (let page = start; page <= end; page += 1) pages.add(page);

      let previousPage = 0;
      Array.from(pages).sort((left, right) => left - right).forEach((page) => {
        if (previousPage && page - previousPage > 1) {
          const ellipsis = document.createElement("span");
          ellipsis.className = "page-ellipsis";
          ellipsis.textContent = "…";
          ellipsis.setAttribute("aria-hidden", "true");
          container.append(ellipsis);
        }
        container.append(
          this.makePageButton(String(page), page, {
            active: page === currentPage,
            signal,
          }),
        );
        previousPage = page;
      });
    }
    container.append(
      this.makePageButton(
        "Next",
        Math.min(pageCount, this.state.table.page + 1),
        {
          disabled: this.state.table.page === pageCount,
          ariaLabel: "Next page",
          signal,
        },
      ),
    );
  }

  renderInquiryAction() {
    const count = this.state.inquiryProductIds.size;
    this.dom["inquiry-button"].disabled = count === 0;
    this.dom["inquiry-button"].textContent =
      count > 0 ? `Inquiry (${count})` : "Inquiry";
  }

  renderTable() {
    const signal = this.listenerSignal("table");
    const { filtered, pageRows, pageCount, startIndex } =
      this.deriveTableRows();
    this.dom.tableHead.replaceChildren();
    this.dom.tableBody.replaceChildren();

    const headerRow = document.createElement("tr");
    const selectHeader = document.createElement("th");
    selectHeader.className = "inquiry-select-column";
    const selectLabel = document.createElement("span");
    selectLabel.className = "visually-hidden";
    selectLabel.textContent = "Select for inquiry";
    selectHeader.append(selectLabel);
    headerRow.append(selectHeader);
    this.state.table.columns.forEach((column) => {
      const header = document.createElement("th");
      header.dataset.column = column.key;
      if (column.sortable) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "sort-button";
        const isSorted = this.state.table.sortKey === column.key;
        button.setAttribute(
          "aria-sort",
          isSorted
            ? this.state.table.sortDirection === "asc"
              ? "ascending"
              : "descending"
            : "none",
        );
        const text = document.createElement("span");
        text.textContent = column.title;
        const icon = document.createElement("span");
        icon.className = "sort-icon";
        icon.setAttribute("aria-hidden", "true");
        icon.textContent = isSorted
          ? this.state.table.sortDirection === "asc"
            ? "▲"
            : "▼"
          : "◆";
        button.append(text, icon);
        button.addEventListener(
          "click",
          () => {
            if (this.state.table.sortKey === column.key) {
              this.state.table.sortDirection =
                this.state.table.sortDirection === "asc" ? "desc" : "asc";
            } else {
              this.state.table.sortKey = column.key;
              this.state.table.sortDirection = "asc";
            }
            this.state.table.page = 1;
            this.renderTable();
          },
          { signal },
        );
        header.append(button);
      } else {
        header.textContent = column.title;
      }
      headerRow.append(header);
    });
    this.dom.tableHead.append(headerRow);

    if (pageRows.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.className = "empty-cell";
      cell.colSpan = this.state.table.columns.length + 1;
      cell.textContent = "No products found.";
      row.append(cell);
      this.dom.tableBody.append(row);
    } else {
      pageRows.forEach((product) => {
        const row = document.createElement("tr");
        const selectCell = document.createElement("td");
        selectCell.className = "inquiry-select-column";
        const selectInput = document.createElement("input");
        selectInput.type = "checkbox";
        selectInput.checked = this.state.inquiryProductIds.has(product.id);
        selectInput.setAttribute(
          "aria-label",
          `Select ${product.sku || product.series || "product"} for inquiry`,
        );
        row.classList.toggle("is-selected", selectInput.checked);
        selectInput.addEventListener(
          "change",
          () => {
            if (selectInput.checked)
              this.state.inquiryProductIds.add(product.id);
            else this.state.inquiryProductIds.delete(product.id);
            row.classList.toggle("is-selected", selectInput.checked);
            this.query.sync();
            this.renderInquiryAction();
          },
          { signal },
        );
        selectCell.append(selectInput);
        row.append(selectCell);
        this.state.table.columns.forEach((column) => {
          const cell = document.createElement("td");
          cell.dataset.column = column.key;
          this.renderCell(cell, column, product);
          row.append(cell);
        });
        this.dom.tableBody.append(row);
      });
    }

    this.renderInquiryAction();

    const visibleStart = filtered.length === 0 ? 0 : startIndex + 1;
    const visibleEnd =
      filtered.length === 0
        ? 0
        : Math.min(startIndex + this.state.table.pageSize, filtered.length);
    const filteredSuffix = this.state.table.query.trim()
      ? ` (filtered from ${this.state.products.length} total entries)`
      : "";
    this.dom["table-info"].textContent =
      `Showing ${visibleStart} to ${visibleEnd} of ${filtered.length} entries${filteredSuffix}`;
    this.renderPagination(pageCount, filtered.length);
  }

  renderResults() {
    this.dom["result-count"].textContent = `${this.state.resultTotal} items`;
    this.renderTable();
  }
}

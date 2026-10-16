const PAGE_SIZES = new Set([10, 25, 50, 100]);
const instances = new Set();
const tables = new WeakMap();
const cleanupObservers = new Map();

const asText = (value) => (value === null || value === undefined || value === "" ? "—" : String(value));

function appendQuery(url, params) {
  const target = new URL(url, globalThis.location?.href || "http://localhost/");
  for (const [key, value] of params) target.searchParams.append(key, value);
  return target;
}

function formValue(form, name) {
  return form.elements.namedItem(name)?.value ?? "";
}

export class PartsTable {
  constructor(root, { fetch: fetcher = globalThis.fetch?.bind(globalThis) } = {}) {
    if (!root?.matches?.("[data-sw-parts]")) throw new TypeError("PartsTable needs a [data-sw-parts] root.");
    if (!fetcher) throw new TypeError("PartsTable needs fetch support.");
    this.root = root;
    this.fetch = fetcher;
    this.form = root.querySelector("[data-sw-search-form]");
    this.table = root.querySelector("[data-sw-table]");
    this.body = this.table?.tBodies?.[0] || this.table?.querySelector("tbody");
    this.head = this.table?.tHead?.rows?.[0] || this.table?.querySelector("thead tr");
    this.summary = root.querySelector("[data-sw-summary]");
    this.previous = root.querySelector("[data-sw-prev]");
    this.next = root.querySelector("[data-sw-next]");
    this.inquiry = root.querySelector("[data-sw-inquiry]");
    this.selectedCount = root.querySelector("[data-sw-selected-count]");
    this.path = root.dataset.path || "";
    this.restUrl = root.dataset.restUrl || "";
    this.inquiryUrl = root.dataset.inquiryUrl || "";
    this.page = this.positiveInt(root.dataset.page, 1);
    this.lastPage = this.positiveInt(root.dataset.lastPage, 1);
    this.total = this.nonNegativeInt(root.dataset.total, 0);
    const initialPageSize = this.positiveInt(root.dataset.perPage, 10);
    this.perPage = initialPageSize <= 100 ? initialPageSize : 10;
    this.selected = new Map();
    this.requestController = null;
    this.requestSequence = 0;
    this.destroyed = false;
    this.events = new root.ownerDocument.defaultView.AbortController();
    this.bindEvents();
    this.syncSelection();
    this.syncControls();
  }

  positiveInt(value, fallback) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : fallback;
  }

  nonNegativeInt(value, fallback) {
    const number = Number(value);
    return Number.isInteger(number) && number >= 0 ? number : fallback;
  }

  bindEvents() {
    const signal = this.events.signal;
    this.form?.addEventListener("submit", (event) => {
      event.preventDefault();
      this.load(1);
    }, { signal });
    this.form?.addEventListener("change", (event) => {
      const target = event.target;
      if (target.name === "per_page") {
        const size = Number(target.value);
        if (!PAGE_SIZES.has(size)) return;
        this.perPage = size;
        this.load(1);
      } else if (target.matches?.("[data-sw-filter]")) {
        this.load(1);
      }
    }, { signal });
    this.previous?.addEventListener("click", () => {
      if (this.page > 1) this.load(this.page - 1);
    }, { signal });
    this.next?.addEventListener("click", () => {
      if (this.page < this.lastPage) this.load(this.page + 1);
    }, { signal });
    this.inquiry?.addEventListener("click", (event) => {
      if (!this.selected.size) event.preventDefault();
    }, { signal });
    this.body?.addEventListener("change", (event) => {
      const checkbox = event.target.closest?.("[data-sw-select]");
      if (checkbox) this.setSelected(checkbox);
    }, { signal });
  }

  queryParams(page) {
    const params = new URLSearchParams();
    params.set("path", this.path);
    params.set("page", String(page));
    params.set("per_page", String(this.perPage));
    params.set("search", String(formValue(this.form, "search")).trim());
    for (const control of this.root.querySelectorAll("[data-sw-filter]")) {
      const field = control.dataset.field;
      if (!field) continue;
      const values = control instanceof control.ownerDocument.defaultView.HTMLSelectElement && control.multiple
        ? [...control.selectedOptions].map((option) => option.value)
        : [control.value];
      const selected = values.filter(Boolean);
      const key = selected.length > 1 ? `filter[${field}][]` : `filter[${field}]`;
      selected.forEach((value) => params.append(key, value));
    }
    return params;
  }

  async load(page) {
    if (this.destroyed || !this.restUrl || !this.path) return;
    this.requestController?.abort();
    const controller = new this.root.ownerDocument.defaultView.AbortController();
    this.requestController = controller;
    const sequence = ++this.requestSequence;
    const url = new URL(this.restUrl, globalThis.location?.href || "http://localhost/");
    const params = this.queryParams(page);
    params.forEach((value, key) => url.searchParams.append(key, value));
    this.body?.setAttribute("aria-busy", "true");
    this.setSummary("Loading parts…");
    this.syncControls(true);
    try {
      const response = await this.fetch(url.toString(), {
        method: "GET",
        credentials: "same-origin",
        headers: { Accept: "application/json" },
        signal: controller.signal,
      });
      const payload = await response.json();
      if (!response.ok) throw new Error("parts request failed");
      if (controller.signal.aborted || this.destroyed || sequence !== this.requestSequence) return;
      this.paint(payload);
    } catch {
      if (controller.signal.aborted || this.destroyed || sequence !== this.requestSequence) return;
      this.setSummary("Unable to load parts. Please try again.");
    } finally {
      if (sequence === this.requestSequence) {
        this.body?.removeAttribute("aria-busy");
        this.requestController = null;
        this.syncControls();
      }
    }
  }

  paint(data) {
    if (!data || !Array.isArray(data.fields) || !Array.isArray(data.parts) ||
      !data.pagination || typeof data.pagination !== "object") {
      throw new TypeError("Invalid parts response.");
    }
    const { parts, fields, pagination } = data;
    if (fields.some((field) => !field || typeof field.key !== "string") ||
      !Number.isInteger(Number(pagination.page)) || !Number.isInteger(Number(pagination.per_page)) ||
      !Number.isInteger(Number(pagination.total)) || !Number.isInteger(Number(pagination.last_page))) {
      throw new TypeError("Invalid parts response.");
    }
    this.page = this.positiveInt(pagination.page, this.page);
    const responsePageSize = Number(pagination.per_page);
    this.perPage = Number.isInteger(responsePageSize) && responsePageSize > 0 && responsePageSize <= 100
      ? responsePageSize
      : this.perPage;
    this.lastPage = this.positiveInt(pagination.last_page, 1);
    this.total = this.nonNegativeInt(pagination.total, parts.length);
    this.paintHead(fields);
    if (this.body) {
      const rows = parts.map((part) => this.makeRow(part, fields));
      this.body.replaceChildren(...(rows.length ? rows : [this.makeEmptyRow(fields.length + 2)]));
    }
    this.syncSelection();
    const start = this.total ? (this.page - 1) * this.perPage + 1 : 0;
    const end = this.total ? Math.min(start + parts.length - 1, this.total) : 0;
    this.setSummary(`Showing ${start} to ${end} of ${this.total} parts`);
    this.root.dataset.page = String(this.page);
    this.root.dataset.lastPage = String(this.lastPage);
    this.root.dataset.total = String(this.total);
    this.root.dataset.perPage = String(this.perPage);
  }

  paintHead(fields) {
    if (!this.head) return;
    const cells = ["Select", "SKU", "Product", ...fields.map((field) => field.label || field.key)]
      .map((label) => {
      const cell = this.root.ownerDocument.createElement("th");
      cell.scope = "col";
      cell.textContent = label;
      return cell;
    });
    this.head.replaceChildren(...cells);
  }

  makeRow(part, fields) {
    const doc = this.root.ownerDocument;
    const row = doc.createElement("tr");
    const id = String(part.id ?? "");
    const sku = String(part.sku ?? "");
    const name = String(part.name ?? "");
    const checkCell = doc.createElement("td");
    const checkbox = doc.createElement("input");
    checkbox.type = "checkbox";
    checkbox.dataset.swSelect = "";
    checkbox.dataset.id = id;
    checkbox.dataset.sku = sku;
    checkbox.dataset.name = name;
    checkbox.checked = this.selected.has(id);
    checkbox.setAttribute("aria-label", `Select ${sku || name || `part ${id}`} for inquiry`);
    checkCell.append(checkbox);
    row.append(checkCell);
    const skuCell = doc.createElement("td");
    skuCell.textContent = asText(sku);
    row.append(skuCell);
    const productCell = doc.createElement("td");
    productCell.textContent = asText(name);
    row.append(productCell);
    for (const field of fields) {
      const cell = doc.createElement("td");
      cell.dataset.field = String(field.key ?? "");
      cell.textContent = asText(part.values?.[field.key]);
      row.append(cell);
    }
    return row;
  }

  makeEmptyRow(columns) {
    const row = this.root.ownerDocument.createElement("tr");
    const cell = this.root.ownerDocument.createElement("td");
      cell.colSpan = Math.max(columns + 1, 1);
    cell.textContent = "No matching parts.";
    row.append(cell);
    return row;
  }

  setSelected(checkbox) {
    const id = checkbox.dataset.id;
    if (!id) return;
    if (checkbox.checked) this.selected.set(id, {
      id,
      sku: checkbox.dataset.sku || "",
      name: checkbox.dataset.name || "",
    });
    else this.selected.delete(id);
    this.syncSelection();
  }

  syncSelection() {
    if (this.selectedCount) this.selectedCount.textContent = String(this.selected.size);
    if (this.inquiry) {
      const params = new URLSearchParams();
      params.set("series", this.path);
      for (const part of this.selected.values()) {
        params.append("inquiry", part.id);
        if (part.sku) params.append("sku", part.sku);
      }
      try {
        const href = appendQuery(this.inquiryUrl, params);
        const sameOrigin = !globalThis.location || href.origin === globalThis.location.origin;
        if (sameOrigin) this.inquiry.href = `${href.pathname}${href.search}${href.hash}`;
      } catch { /* Keep the server-rendered inquiry link if the URL is malformed. */ }
      this.inquiry.setAttribute("aria-disabled", String(this.selected.size === 0));
      if ("disabled" in this.inquiry) this.inquiry.disabled = this.selected.size === 0;
    }
  }

  setSummary(message) {
    if (this.summary) this.summary.textContent = message;
  }

  syncControls(busy = false) {
    if (this.previous) this.previous.disabled = busy || this.page <= 1;
    if (this.next) this.next.disabled = busy || this.page >= this.lastPage;
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.requestSequence += 1;
    this.requestController?.abort();
    this.events.abort();
    instances.delete(this);
    tables.delete(this.root);
    releaseCleanupObserver(this.root.ownerDocument);
  }
}

function ensureCleanupObserver(doc) {
  const Observer = doc?.defaultView?.MutationObserver;
  if (cleanupObservers.has(doc) || !Observer || !doc?.documentElement) return;
  const observer = new Observer(() => {
    for (const instance of instances) {
      if (instance.root.ownerDocument === doc && !instance.root.isConnected) instance.destroy();
    }
  });
  cleanupObservers.set(doc, observer);
  observer.observe(doc.documentElement, { childList: true, subtree: true });
}

function releaseCleanupObserver(doc) {
  if ([...instances].some((instance) => instance.root.ownerDocument === doc)) return;
  cleanupObservers.get(doc)?.disconnect();
  cleanupObservers.delete(doc);
}

export function initComponents(scope = globalThis.document) {
  if (!scope) return [];
  const roots = [];
  if (scope.matches?.("[data-sw-parts]")) roots.push(scope);
  roots.push(...(scope.querySelectorAll?.("[data-sw-parts]") || []));
  ensureCleanupObserver(scope.nodeType === 9 ? scope : scope.ownerDocument);
  return roots.map((root) => {
    let instance = tables.get(root);
    if (!instance) {
      instance = new PartsTable(root);
      tables.set(root, instance);
      instances.add(instance);
    }
    return instance;
  });
}

export function destroyComponents(scope = globalThis.document) {
  if (!scope) return;
  for (const instance of [...instances]) {
    if (scope === instance.root || scope.contains?.(instance.root)) instance.destroy();
  }
}

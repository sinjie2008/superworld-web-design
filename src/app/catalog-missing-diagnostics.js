// Development-only module. Every consumer is guarded by the compiler constant.
export const DIAGNOSTIC_STATUS = {
  MISSING_VALUE: "Missing value",
  MISSING_FIELD: "Missing field",
  MISSING_PUBLIC_API_MAPPING: "Missing Public API mapping",
  MISSING_FRONTEND_MAPPING: "Missing frontend mapping",
  API_REQUEST_FAILED: "API request failure",
  LOADING: "Loading",
  RESOLVED: "Resolved",
  MAPPING_NOT_VERIFIED: "Mapping not verified",
};

const MANAGER_URL = "http://localhost/Foundational-Electronics-Core-Systems/public/catalog_ui.html";
const hasValue = (value) => value !== null && value !== undefined && String(value).trim() !== "";

export function contentStatus({
  pending = false, failed = false, required = true, hidden = false,
  definition, definitionAbsentVerified = false, publicMapping = true,
  sourceVerified = true, value, rendered = false, defaultValue,
} = {}) {
  if (hidden || !required) return "RESOLVED";
  if (pending) return "LOADING";
  if (failed) return "API_REQUEST_FAILED";
  if (!sourceVerified) return "MAPPING_NOT_VERIFIED";
  if (definitionAbsentVerified) return "MISSING_FIELD";
  if (!publicMapping) return "MISSING_PUBLIC_API_MAPPING";
  // An absent PUBLIC definition can also mean intentionally hidden. Never guess.
  if (!definition) return "MAPPING_NOT_VERIFIED";
  if (!hasValue(value)) return "MISSING_VALUE";
  if (hasValue(defaultValue) && String(value) === String(defaultValue))
    return "MAPPING_NOT_VERIFIED";
  return rendered ? "RESOLVED" : "MISSING_FRONTEND_MAPPING";
}

export function catalogHierarchy(tree, node, part) {
  function find(nodes, ancestors) {
    for (const current of nodes || []) {
      const chain = [...ancestors, current];
      if (node && (current.id === node.id || current.path === node.path)) return chain;
      const result = find(current.children, chain);
      if (result) return result;
    }
    return null;
  }
  const chain = find(tree, []) || [];
  const names = chain.map((item) => item.name);
  if (part && names.length) names.push(part.sku || part.name || `Part ID ${part.id}`);
  return names;
}

const editors = {
  category: "Select Category → Category Fields Set",
  metadata: "Select Series → Series Metadata Values (definitions: Series Metadata Field Editor)",
  attribute: "Select Series → Products → Select Product → Custom Fields (definitions: Product Attribute Field Editor)",
  product: "Select Series → Products → Product Form",
  node: "Hierarchy → Update Selected Node",
};

export class CatalogMissingDiagnostics {
  constructor(main, tree = []) {
    this.main = main;
    this.tree = tree;
    this.records = new Map();
    this.frame = null;
    this.active = null;
    this.pinned = false;
    this.layer = document.createElement("div");
    this.layer.className = "catalog-diagnostic-layer";
    main.append(this.layer);
    this.panel = document.createElement("div");
    this.panel.className = "catalog-diagnostic-panel";
    this.panel.id = "catalog-diagnostic-details";
    this.panel.hidden = true;
    this.panel.setAttribute("role", "region");
    this.panel.setAttribute("aria-label", "Catalog content diagnostic details");
    this.layer.append(this.panel);
    this.schedule = () => {
      if (this.frame !== null) return;
      this.frame = requestAnimationFrame(() => { this.frame = null; this.position(); });
    };
    this.dismiss = (event) => {
      if (event.key === "Escape") this.close(true);
      else if (event.type === "pointerdown" && !this.layer.contains(event.target)) this.close();
    };
    window.addEventListener("scroll", this.schedule, true);
    window.addEventListener("resize", this.schedule);
    document.addEventListener("keydown", this.dismiss);
    document.addEventListener("pointerdown", this.dismiss);
    this.observer = typeof ResizeObserver === "function" ? new ResizeObserver(this.schedule) : null;
    this.observer?.observe(main);
  }

  set(element, info) {
    if (!element) return;
    this.clear(element);
    if (info.status === "RESOLVED") return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "catalog-diagnostic-label";
    button.dataset.status = info.status;
    const caption = document.createElement("span");
    caption.className = "catalog-diagnostic-caption";
    caption.textContent = `${info.status === "LOADING" ? "Loading" : info.status === "API_REQUEST_FAILED" ? "API failed" : "Check"}: ${info.content}`;
    button.append(caption);
    button.title = caption.textContent;
    button.setAttribute("aria-label", `${info.content}: ${DIAGNOSTIC_STATUS[info.status]}. Open diagnostic details`);
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", this.panel.id);
    const record = { element, button, info };
    button.addEventListener("click", () => this.active === record && this.pinned ? this.close() : this.open(record, true));
    button.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "mouse" && !this.pinned) this.open(record);
    });
    element.classList.add(info.status === "LOADING" ? "catalog-diagnostic-loading" : "catalog-api-missing");
    this.records.set(element, record);
    this.layer.append(button);
    this.observer?.observe(element);
    this.schedule();
  }

  clear(element) {
    const record = this.records.get(element);
    if (!record) return;
    if (this.active === record) this.close();
    element.classList.remove("catalog-api-missing", "catalog-diagnostic-loading");
    record.button.remove();
    this.observer?.unobserve(element);
    this.records.delete(element);
  }

  prune() {
    for (const [element] of this.records) if (!element.isConnected) this.clear(element);
  }

  close(restoreFocus = false) {
    const button = this.active?.button;
    button?.setAttribute("aria-expanded", "false");
    this.active = null;
    this.pinned = false;
    this.panel.hidden = true;
    if (restoreFocus && button?.isConnected) {
      // Focus is already on the trigger in normal keyboard use.
      if (document.activeElement !== button) button.focus({ preventScroll: true });
    }
  }

  open(record, pinned = false) {
    this.close();
    this.active = record;
    this.pinned = pinned;
    const { info, button } = record;
    const heading = document.createElement("strong");
    heading.textContent = info.status === "LOADING" ? "Loading Product Data" : info.status === "API_REQUEST_FAILED" ? "Product API Request Failed" : "Missing Backend Content";
    const close = document.createElement("button");
    close.type = "button";
    close.className = "catalog-diagnostic-close";
    close.textContent = "Close";
    close.addEventListener("click", () => this.close(true));
    const list = document.createElement("dl");
    const hierarchy = catalogHierarchy(this.tree, info.node, info.part);
    const values = [
      ["Content", info.content],
      ["Status", DIAGNOSTIC_STATUS[info.status]],
      ["Hierarchy", hierarchy.join(" → ") || "Catalog association not verified"],
      ["Backend location", info.editor ? `Product Catalog Manager → ${editors[info.editor]}` : "No verified editor for this content"],
      ["Backend field", info.field || "Not yet defined / not verified"],
      ["API source", info.source || "No verified public mapping"],
      ["Next step", info.note || "Update the verified field, save, then refresh this page."],
    ];
    for (const [name, value] of values) {
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = name;
      dd.textContent = value;
      list.append(dt, dd);
    }
    const link = document.createElement("a");
    link.href = MANAGER_URL;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open Product Catalog Manager";
    this.panel.replaceChildren(heading, close, list, link);
    this.panel.hidden = false;
    button.setAttribute("aria-expanded", "true");
    this.position();
  }

  position() {
    this.prune();
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    for (const { element, button } of this.records.values()) {
      const rect = element.getBoundingClientRect();
      const visible = rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.top < innerHeight && rect.right > 0 && rect.left < innerWidth;
      button.hidden = !visible;
      if (!visible) continue;
      button.style.maxWidth = `${coarse ? 44 : Math.min(210, rect.width, innerWidth - 16)}px`;
      button.style.left = `${Math.max(4, Math.min(innerWidth - button.offsetWidth - 4, rect.right - button.offsetWidth + (coarse ? 14 : 0)))}px`;
      // Sit on the upper border; fixed overlays do not change the layout or table geometry.
      button.style.top = `${Math.max(4, rect.top - (coarse ? 22 : button.offsetHeight - 2))}px`;
    }
    if (this.active) {
      if (this.active.button.hidden) { this.close(); return; }
      const rect = this.active.button.getBoundingClientRect();
      this.panel.style.left = `${Math.max(8, Math.min(rect.left, innerWidth - this.panel.offsetWidth - 8))}px`;
      this.panel.style.top = `${Math.max(8, Math.min(rect.bottom + 4, innerHeight - this.panel.offsetHeight - 8))}px`;
    }
  }

  field(element, { node, part, field, value, rendered, source, content, metadata = false }) {
    if (element?.matches(".a4k-spec-mini b")) element = element.parentElement;
    this.set(element, {
      node, part, content: content || field?.label || field?.key || "Product value",
      field: field?.key, source, editor: metadata ? "metadata" : "attribute",
      status: contentStatus({ definition: field, required: metadata || field?.required === true, value, rendered, defaultValue: field?.defaultValue }),
      note: "Only public fields are inspected. Optional part values are allowed to be empty. API defaults do not prove a value was explicitly entered.",
    });
  }

  unverified(element, content, node, { editor, source, note, part } = {}) {
    this.set(element, { content, node, part, status: "MAPPING_NOT_VERIFIED", editor, source, note: note || "No exact public field is verified for this placeholder. Confirm a suitable definition and public/frontend mapping; do not enter data in an unrelated field." });
  }

  category(element, content, node) {
    this.set(element, { content, node, editor: "category", status: "MISSING_PUBLIC_API_MAPPING", source: `/api/categories/${node.path} → resource (category custom fields omitted)`, note: "Category Fields Set exists, but this API exposes only hierarchy properties. Confirm the appropriate per-category field key in the manager; a separate API/frontend mapping change is needed." });
  }

  findNode(path) {
    const visit = (nodes) => {
      for (const node of nodes || []) {
        if (node.path === path) return node;
        const found = visit(node.children);
        if (found) return found;
      }
      return null;
    };
    return visit(this.tree);
  }

  layout(main, index, route) {
    if (route.type === "root") {
      // The global hero and marketing carousel have no verified catalog owner.
      this.unverified(main.querySelector(".hero-panel p"), "Product landing introduction", null);
      this.unverified(main.querySelector(".hero-brand"), "Product landing visual", null);
      return;
    }
    this.category(main.querySelector(".hero-panel p"), "Category introduction", route.node);
    this.category(main.querySelector(".hero-brand"), "Category visual", route.node);
    if (route.type === "group") {
      const families = (route.node.children || []).filter((node) => node.type === "category");
      [...main.querySelectorAll("section.product-family")].forEach((section, position) => {
        const family = families[position];
        if (!family) return;
        this.category(section.querySelector(".ph.tall"), "Category image", family);
        const categories = (family.children || []).filter((node) => node.type === "category");
        section.querySelectorAll(".family-icon").forEach((icon, index) => {
          if (categories[index]) this.category(icon.querySelector(".ph, img"), "Category icon", categories[index]);
        });
      });
    } else {
      main.querySelectorAll("tr[data-catalog-api-path]").forEach((row) => {
        const node = this.findNode(row.dataset.catalogApiPath);
        const category = this.findNode(node?.path.split("/").slice(0, -1).join("/"));
        this.category(row.closest("section")?.querySelector(".container > p"), "Category overview", category || route.node);
        this.unverified(row.cells[0], "Series image", node, { source: `/api/series/${node.path} → metadata`, note: "The tree contains no media. Series image definitions/values are not fetched by this family layout; verify series_product_image in the public series response before changing content." });
        this.unverified(row.cells[6], "Series datasheet", node, { source: `/api/series/${node.path} → metadata`, note: "The tree contains no document URL. Verify series_product_spec in the public series response; this family layout has no document mapping yet." });
      });
    }
  }

  familyRanges(row, fields = [], facets = []) {
    const node = this.findNode(row.dataset.catalogApiPath);
    const keys = [["acf.length", "acf.width", "acf.height"], ["acf.impedance"], ["acf.dcr"], ["acf.irms"]];
    keys.forEach((group, position) => {
      this.clear(row.cells[position + 2]);
      for (const key of group) {
        const field = fields.find((item) => item.key === key);
        if (!field?.required) continue;
        const values = facets.find((item) => item.key === key)?.values || [];
        if (!values.length) this.field(row.cells[position + 2], { node, field, value: null, rendered: false, source: `/api/series/${node.path}/facets → facets[${key}].values` });
      }
    });
  }

  series(main, detail, fields, facets, embedded = false) {
    const node = detail.resource;
    const source = `/api/series/${node.path}`;
    if (!embedded) {
      const notes = detail.metadata?.find((field) => field.key === "series_notes");
      this.set(main.querySelector(".a4k-intro p"), { node, content: "Series overview", field: notes?.key, editor: "metadata", source: `${source} → metadata[series_notes].value`, status: contentStatus({ definition: notes, value: notes?.value, rendered: hasValue(notes?.value) }), note: notes ? "The layout overview uses the public Series Notes value. Save Series Metadata Values and refresh. Metadata may include backend defaults; explicit-value provenance is unavailable." : "series_notes is not in the public response. It may be undefined or hidden; verify its definition and visibility in Series Metadata Field Editor." });
      const selectors = [
        [".a4k-intro ul", "Series features"], [".a4k-compliance", "Compliance"],
        [".a4k-product-media", "Series image / 3D view"],
        [".a4k-spec-mini > div:nth-child(4)", "Standard pack quantity"],
        [".a4k-summary-grid > div:nth-child(3)", "Test frequency summary"],
        [".a4k-summary-grid > div:nth-child(4)", "Operating temperature"],
        ["#environmental", "Environmental information"], ["#physical", "Physical characteristics"],
        ["#tape-reel", "Tape and reel"], ["#soldering", "Soldering / washing"],
        ["#downloads", "Download documents"], ["#performance-curves h3", "Performance curves"],
      ];
      selectors.forEach(([selector, content]) => this.unverified(main.querySelector(selector), content, node, { source }));
      [[".a4k-product-media", "Series image", "series_product_image"], ["#downloads", "Series datasheet", "series_product_spec"]].forEach(([selector, content, key]) => {
        const field = detail.metadata?.find((item) => item.key === key);
        if (field) this.set(main.querySelector(selector), { node, content, field: key, editor: "metadata", source: `${source} → metadata[${key}].value`, status: contentStatus({ definition: field, value: field.value, rendered: false }), note: "This verified metadata key is supported by backend Specification Search, but this page has no media/document consumer. A frontend mapping change is needed for a usable returned URL; empty values can be edited in Series Metadata Values." });
      });
      ["acf.length", "acf.width", "acf.height"].forEach((key, position) => {
        const field = fields.find((item) => item.key === key);
        const values = facets.find((item) => item.key === key)?.values || [];
        this.field(main.querySelectorAll(".a4k-spec-mini > div b")[position], { node, field, value: values.length ? values.map((item) => item.value).join("–") : null, rendered: values.length > 0, source: `${source}/facets → facets[${key}].values` });
      });
    }
  }

  table(table, { node, metadata, fields, parts, columns, defaultHeadings, apiPath }) {
    this.prune();
    const source = `/api/series/${apiPath}/parts`;
    columns.forEach((field, index) => {
      if (!field) this.unverified(table.tHead.rows[0].cells[index + 2], defaultHeadings[index], node, { source: `/api/series/${apiPath}/fields`, note: "No suitable public attribute definition is verified for this layout column. It may be undefined, hidden, or not applicable; review before adding a field." });
    });
    const downloadHeading = table.tHead.rows[0].cells[6];
    const spec = metadata?.find((item) => item.key === "series_product_spec");
    if (spec) this.set(downloadHeading, { node, content: "Series datasheet", field: spec.key, editor: "metadata", source: `/api/series/${apiPath} → metadata[${spec.key}].value`, status: contentStatus({ definition: spec, value: spec.value, rendered: false }), note: "This is a series-level document. This table does not yet consume its URL; it is not a part attribute." });
    else this.unverified(downloadHeading, "Series datasheet", node, { source, note: "No verified public document URL is consumed by this table. The retained PDF controls are layout placeholders." });
    for (const row of table.querySelectorAll("tr[data-product-id]")) {
      const part = parts.find((item) => item.id === Number(row.dataset.productId));
      if (!part) continue;
      for (const cell of row.querySelectorAll("[data-product-field]")) {
        const field = fields.find((item) => item.key === cell.dataset.productField);
        this.field(cell, { node, part, field, value: part.values?.[field?.key], rendered: hasValue(part.values?.[field?.key]), source: `${source} → parts[id=${part.id}].values[${field?.key}]` });
      }
    }
    this.schedule();
  }

  destroy() {
    this.close();
    for (const [element] of this.records) this.clear(element);
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.observer?.disconnect();
    window.removeEventListener("scroll", this.schedule, true);
    window.removeEventListener("resize", this.schedule);
    document.removeEventListener("keydown", this.dismiss);
    document.removeEventListener("pointerdown", this.dismiss);
    this.layer.remove();
  }
}

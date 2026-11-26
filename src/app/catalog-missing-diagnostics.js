// Development-only module. Every consumer is guarded by the compiler constant.
import { catalogValueState } from "./catalog-availability.js";

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

  category(element, content, node, field, results) {
    const outcome = results?.get(node.path);
    const bound = element?.hasAttribute("data-catalog-content-bound")
      || Boolean(element?.querySelector("[data-catalog-content-bound]"));
    const value = outcome?.response?.content?.[field];
    this.set(element, {
      content, node, field,
      status: contentStatus({
        failed: outcome?.status === "rejected", definition: { key: field },
        sourceVerified: outcome?.status === "fulfilled", value, rendered: bound,
      }),
      source: `/api/categories/${node.path} → content[${field}]`,
      note: "Fill this column on the category row in the Catalog CSV. For an image, use the UUID of a ready Media Library asset.",
    });
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

  layout(main, index, route, categoryContent) {
    if (route.type === "root") {
      // The global hero and marketing carousel have no verified catalog owner.
      this.unverified(main.querySelector(".hero-panel p"), "Product landing introduction", null);
      this.unverified(main.querySelector(".hero-brand"), "Product landing visual", null);
      return;
    }
    this.category(main.querySelector(".hero-panel p"), "Category introduction", route.node, "category_introduction", categoryContent);
    this.category(main.querySelector(".hero-brand"), "Category visual", route.node, "category_hero_image_media_id", categoryContent);
    if (route.type === "group") {
      const families = (route.node.children || []).filter((node) => node.type === "category");
      [...main.querySelectorAll("section.product-family")].forEach((section, position) => {
        const family = families[position];
        if (!family) return;
        this.category(section.querySelector(".product-family-visual"), "Category image", family, "category_banner_image_media_id", categoryContent);
        const categories = (family.children || []).filter((node) => node.type === "category");
        section.querySelectorAll(".family-icon").forEach((icon, index) => {
          if (categories[index]) this.category(icon, "Category icon", categories[index], "category_icon_image_media_id", categoryContent);
        });
      });
    } else {
      main.querySelectorAll("tr[data-catalog-api-path]").forEach((row) => {
        const node = this.findNode(row.dataset.catalogApiPath);
        const category = this.findNode(node?.path.split("/").slice(0, -1).join("/"));
        this.category(row.closest("section")?.querySelector(".container > p"), "Category overview", category || route.node, "category_introduction", categoryContent);
        if (!this.records.has(row.cells[0]) && !row.cells[0].dataset.catalogContentBound)
          this.unverified(row.cells[0], "Series image", node, { source: `/api/series/${node.path} → media`, note: "This row loads Series media when it enters view. Use series_image_media_id on the Series CSV row." });
        if (!this.records.has(row.cells[6]) && !row.cells[6].dataset.catalogContentBound)
          this.unverified(row.cells[6], "Series datasheet", node, { source: `/api/series/${node.path} → media`, note: "This row loads Series media when it enters view. Use series_pdf_media_id on the Series CSV row." });
      });
    }
  }

  familyMedia(row, detail) {
    const node = this.findNode(row.dataset.catalogApiPath);
    if (!node) return;
    [
      [row.cells[0], "Series image", "series_product_image", "series_image_media_id"],
      [row.cells[6], "Series datasheet", "series_product_spec", "series_pdf_media_id"],
    ].forEach(([element, content, key, field]) => {
      const value = detail?.metadata?.find((item) => item.key === key)?.value;
      this.set(element, {
        node, content, field, editor: "metadata",
        status: contentStatus({
          failed: !detail, definition: { key }, value, rendered: Boolean(element.dataset.catalogContentBound),
        }),
        source: `/api/series/${node.path} → media[${key}]`,
        note: "Use a ready Media Library UUID in this column on the Series CSV row.",
      });
    });
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

  series(main, detail, embedded = false) {
    if (embedded) return;
    const overview = main.querySelector(".a4k-intro p");
    const notes = detail.metadata.find((field) => field.key === "series_notes");
    this.set(overview, {
      node: detail.resource,
      content: "Series overview",
      field: notes?.key,
      editor: "metadata",
      source: "/api/series/" + detail.resource.path + " → metadata[series_notes].value",
      status: contentStatus({
        definition: notes,
        value: notes?.value,
        rendered: overview?.dataset.catalogContentBound === "series_notes",
      }),
      note: "Save the public Series Notes value and refresh the page. API defaults do not prove that a value was explicitly entered.",
    });
  }

  table(table, { node, fields, parts, apiPath }) {
    this.prune();
    const source = "/api/series/" + apiPath + "/parts";
    const partsById = new Map(parts.map((part) => [String(part.id), part]));
    const fieldsByKey = new Map(fields.map((field) => [field.key, field]));
    for (const row of table.querySelectorAll("tr[data-product-id]")) {
      const part = partsById.get(row.dataset.productId);
      if (!part) continue;
      for (const cell of row.querySelectorAll("[data-product-field]")) {
        const field = fieldsByKey.get(cell.dataset.productField);
        if (!field) continue;
        const raw = part.values?.[field.key];
        const valid = catalogValueState(raw) === "available";
        this.field(cell, {
          node,
          part,
          field,
          value: valid ? raw : null,
          rendered: valid,
          source: source + " → parts[id=" + part.id + "].values[" + field.key + "]",
        });
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

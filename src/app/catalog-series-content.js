import { catalogValueState, meaningfulText } from "./catalog-availability.js";
import { bindSeriesDownload, imageNode, mediaFrom, mediaPanels, primaryMedia } from "./catalog-series-media.js";

const SECTION_LABELS = {
  overview: "Introduction",
  specifications: "Specifications",
  environmental: "Environmental",
  "performance-curves": "Performance Curves",
  physical: "Physical Characteristics",
  "tape-reel": "Tape & Reel",
  soldering: "Soldering / Washing",
  downloads: "Downloads",
  enquiry: "Enquiry",
};

const FILE_INFO = {
  series_product_spec: ["datasheet", "Datasheet PDF"],
  download_brochure_pdf: ["brochure", "Product Brochure PDF"],
  download_application_note_pdf: ["application-note", "Application Note PDF"],
  series_model_3d: ["model", "3D Model (GLB)"],
};

const COMPLIANCE_LABELS = {
  compliance_rohs: ["RoHS", "R"],
  compliance_reach: ["REACH", "R"],
  compliance_rohs_reach: ["RoHS / REACH", "R"],
  compliance_halogen_free: ["Halogen Free", "H"],
  compliance_aec_q200: ["AEC-Q200", "A"],
};

const FORMATTING_TAGS = new Set(["b", "strong", "i", "em", "br"]);
const DISCARDED_TAGS = new Set(["script", "style", "iframe", "object", "template", "svg", "math"]);

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function bound(node, field) {
  if (field) node.dataset.catalogContentBound = field;
  return node;
}

function section(id, withHeading = true) {
  const node = element("section", id === "overview" ? "a4k-hero" : "a4k-section");
  node.id = id;
  node.dataset.sectionIdPreserve = "";
  if (withHeading) node.append(element("h2", null, SECTION_LABELS[id]));
  return node;
}

function statusPanel(state, message, retry) {
  const node = element("div", "a4k-series-status");
  node.dataset.seriesState = state;
  node.setAttribute("role", state === "error" ? "alert" : "status");
  node.append(element("p", null, message));
  if (retry) {
    const button = element("button", null, "Retry");
    button.type = "button";
    button.addEventListener("click", retry, { once: true });
    node.append(button);
  }
  return node;
}

export function showSeriesStatus(main, { state, message, retry }) {
  const target = main.querySelector("[data-series-status]");
  if (!target) return;
  target.hidden = state === "available";
  if (state === "available") {
    target.replaceChildren();
    return;
  }
  main.querySelector("[data-series-content]")?.replaceChildren();
  target.replaceChildren(statusPanel(state, message, retry));
  delete main.dataset.catalogSeriesId;
  delete main.dataset.catalogCategoryId;
  delete main.dataset.catalogSummaryStatus;
}

function displayField(field) {
  const value = typeof field?.value === "boolean"
    ? (field.value ? "Yes" : "No")
    : meaningfulText(field?.value);
  const label = meaningfulText(field?.label);
  return field?.type !== "file" && value !== null && label !== null
    ? { label, value, key: field.key }
    : null;
}

function metadataList(fields, keys) {
  return keys.map((key) => displayField(fields.get(key))).filter(Boolean);
}

function summaryDisplay(item) {
  return item?.status === "available" ? meaningfulText(item.display) : null;
}

function miniDimensions(summary, fields) {
  const values = ["length", "width", "height"].flatMap((key) => {
    const value = summaryDisplay(summary?.dimensions?.[key]);
    return value === null ? [] : [{ label: key[0].toUpperCase() + key.slice(1), value }];
  });
  const spq = meaningfulText(fields.get("series_spq_per_reel")?.value);
  if (spq !== null) {
    const count = Number(spq);
    const value = /^\d+$/.test(spq) && Number.isSafeInteger(count) ? count.toLocaleString("en-US") : spq;
    values.push({ label: "SPQ per Reel", value, key: "series_spq_per_reel" });
  }
  return values;
}

function specificationSummary(summary, fields) {
  const rows = metadataList(fields, ["series_product_type", "series_voltage", "series_test_frequency"]);
  if (Number.isSafeInteger(summary?.partCount) && summary.partCount >= 0)
    rows.push({ label: "Number of Parts", value: summary.partCount.toLocaleString("en-US") });
  const dimensions = summaryDisplay(summary?.dimensions);
  if (dimensions !== null) rows.push({ label: "Dimensions", value: dimensions });
  for (const [key, specification] of Object.entries(summary?.specifications || {})) {
    if (["acf.length", "acf.width", "acf.height"].includes(key)) continue;
    const value = summaryDisplay(specification);
    const label = meaningfulText(specification?.label);
    if (label === null || value === null) continue;
    const isRange = typeof specification.min === "number" && specification.min !== specification.max;
    rows.push({ label: isRange ? label + " Range" : label, value, key });
  }
  return rows;
}

function valueGrid(className, rows) {
  if (!rows.length) return null;
  const grid = element("div", className);
  for (const { label, value, key } of rows) {
    const cell = element("div");
    cell.append(element("span", null, label), bound(element("b", null, value), key));
    grid.append(cell);
  }
  return grid;
}

function copyFeatureNodes(target, source) {
  for (const node of source.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) target.append(node.textContent);
    else if (FORMATTING_TAGS.has(node.localName)) {
      const inline = element(node.localName);
      copyFeatureNodes(inline, node);
      target.append(inline);
    } else if (node.nodeType === Node.ELEMENT_NODE && !DISCARDED_TAGS.has(node.localName)) {
      copyFeatureNodes(target, node);
    }
  }
}

function featureList(value) {
  const items = Array.isArray(value) ? value : [value];
  let list = element("ul");
  for (const item of items) {
    const text = meaningfulText(item) || meaningfulText(item?.text ?? item?.description);
    if (text === null) continue;
    const template = element("template");
    template.innerHTML = text;
    const root = template.content.firstElementChild;
    const isList = ["ul", "ol"].includes(root?.localName);
    if (items.length === 1 && isList && root.localName === "ol") list = element("ol");
    const children = isList ? [...root.children].filter((child) => child.localName === "li") : [template.content];
    for (const child of children) {
      const entry = element("li");
      copyFeatureNodes(entry, child);
      if (meaningfulText(entry.textContent) !== null) list.append(entry);
    }
  }
  return list.childElementCount ? list : null;
}

function verifiedCompliance(value, key) {
  const confirmed = {
    compliance_aec_q200: "Qualified",
    compliance_halogen_free: "Halogen Free",
  }[key] || "Compliant";
  const text = meaningfulText(value);
  if (value === true || /^(?:yes|true)$/i.test(text || "")) return confirmed;
  if (text === null ||
      /\b(?:no|not|non[-\s]?(?:compliant|qualified|certified)|without|false|fail(?:ed|s)?|pending|unknown|unverified|target|planned|expected|awaiting|under (?:review|testing|assessment)|may|might|could|should|would|will|can|if|eligible|seeking|intended|required|requires)\b/i.test(text))
    return null;
  if (key === "compliance_halogen_free" && /^(?:free|halogen[- ]free)$/i.test(text)) return "Halogen Free";
  return /\b(?:compliant|pass(?:ed)?|qualified|certified|meets|complies with)\b/i.test(text) ? text : null;
}

function compliance(fields) {
  const combinedKey = "compliance_rohs_reach";
  const separateKeys = ["compliance_rohs", "compliance_reach"];
  const individual = separateKeys.map((key) => fields.get(key)?.value);
  const showCombined = Boolean(verifiedCompliance(fields.get(combinedKey)?.value, combinedKey)) &&
    individual.every((value, index) => catalogValueState(value) === "missing" || verifiedCompliance(value, separateKeys[index]));
  const badges = [];
  for (const [key, [label, initial]] of Object.entries(COMPLIANCE_LABELS)) {
    if ((key === combinedKey && !showCombined) || (showCombined && separateKeys.includes(key))) continue;
    const value = verifiedCompliance(fields.get(key)?.value, key);
    if (value === null) continue;
    const badge = bound(element("div"), key);
    const text = element("span");
    text.append(element("strong", null, label), document.createTextNode(value));
    badge.append(element("b", null, initial), text);
    badges.push(badge);
  }
  if (!badges.length) return null;
  const region = element("div", "a4k-compliance");
  region.setAttribute("aria-label", "Product compliance status");
  const heading = element("div");
  heading.append(element("b", null, "Compliance"));
  region.append(heading, ...badges);
  return region;
}

function fieldsList(rows, dimensions) {
  const list = dimensions ? element("dl", "a4k-dimension-list") : element("ul");
  for (const { label, value, key } of rows) {
    if (dimensions) list.append(element("dt", null, label), bound(element("dd", null, value), key));
    else {
      const row = bound(element("li"), key);
      row.append(element("strong", null, label + ":"), document.createTextNode(" " + value));
      list.append(row);
    }
  }
  return list;
}

function technicalSection(id, cards, { signal, onSectionChange }) {
  const visible = cards.filter(({ rows = [], notes = [], drawings = [] }) =>
    rows.length || notes.length || drawings.length,
  );
  if (!visible.length) return null;
  const region = section(id);
  const grid = visible.length > 1 ? element("div", "a4k-two-col") : region;
  if (grid !== region) region.append(grid);
  for (const { title, rows = [], notes = [], drawings = [], dimensions = false } of visible) {
    const card = element("article", dimensions || drawings.length ? "a4k-diagram-card" : "a4k-info-card");
    card.append(element("h3", null, title));
    for (const note of notes) card.append(bound(element("p", null, note.value), note.key));
    for (const { asset, key, label, caption, captionKey } of drawings) {
      const figure = bound(element("figure", dimensions ? "a4k-diagram-box" : null), key);
      figure.append(imageNode(asset, label, {
        signal,
        onError: () => {
          figure.remove();
          if (rows.length || notes.length || card.querySelector("figure")) return;
          card.remove();
          if (!region.querySelector("article")) {
            region.remove();
            onSectionChange();
          }
        },
      }));
      if (caption) figure.append(bound(element("figcaption", null, caption), captionKey));
      card.append(figure);
    }
    if (rows.length) card.append(fieldsList(rows, dimensions));
    grid.append(card);
  }
  return region;
}

function drawing(detail, key, label) {
  const asset = mediaFrom(detail, key, "image");
  return asset ? [{ asset, key, label }] : [];
}

function physicalCards(detail, fields) {
  const rows = (prefix) => [...fields.values()]
    .filter((field) => field.key.startsWith(prefix) && field.key.endsWith("_mm"))
    .map(displayField).filter(Boolean);
  const packageDrawings = [
    ...drawing(detail, "physical_configuration_drawing", "Configuration drawing"),
    ...drawing(detail, "physical_dimension_drawing", "Dimension drawing"),
  ].filter((item, index, all) => all.findIndex(({ asset }) => asset.url === item.asset.url) === index);
  const pcb = drawing(detail, "physical_pcb_layout", "PCB layout drawing");
  const shared = packageDrawings.find((item) => item.asset.url === pcb[0]?.asset.url);
  if (shared) {
    shared.label = "Package dimensions and recommended PCB layout";
    shared.caption = shared.label;
  }
  return [
    {
      title: shared ? "Configuration, Dimensions & PCB Layout" : "Configuration & Dimensions",
      notes: metadataList(fields, ["physical_configuration_notes", "physical_dimension_notes"]),
      rows: rows("physical_dimension_"),
      drawings: packageDrawings,
      dimensions: true,
    },
    {
      title: "Recommended PCB Layout",
      notes: metadataList(fields, ["physical_pcb_notes"]),
      rows: rows("physical_pcb_"),
      drawings: shared ? [] : pcb,
      dimensions: true,
    },
  ];
}

function performanceCards(detail, fields) {
  const curves = Object.keys(detail.media || {}).flatMap((key) => {
    const curve = /^performance_curve_(\d+)_image$/.exec(key);
    if (!curve) return [];
    const captionKey = "performance_curve_" + curve[1] + "_caption";
    const caption = meaningfulText(fields.get(captionKey)?.value);
    return drawing(detail, key, caption || "Performance curve " + curve[1]).map(
      (item) => ({ ...item, caption, captionKey }),
    );
  });
  return [{
    title: meaningfulText(fields.get("performance_curve_title")?.value) || "Characteristics Curves",
    notes: metadataList(fields, ["performance_curve_description", "performance_test_conditions", "performance_notes"]),
    drawings: curves,
  }];
}

function engineeringSections(detail, fields, lifecycle) {
  const operating = displayField(fields.get("environment_operating_temperature"))
    ? "environment_operating_temperature" : "series_operating_temperature";
  const packaging = metadataList(fields, [
    "tape_chip_per_reel", "tape_inner_box_qty", "tape_middle_box_qty", "tape_carton_qty",
  ]);
  const spq = displayField(fields.get("series_spq_per_reel"));
  if (spq && !packaging.some(({ key }) => key === "tape_chip_per_reel")) {
    packaging.unshift({ ...spq, label: "Chips per Reel" });
  }
  return [
    technicalSection("environmental", [
      { title: "Operating Conditions", rows: metadataList(fields, [
        operating, "environment_storage_temperature", "environment_test_ambient",
      ]) },
      { title: "Storage Conditions", rows: metadataList(fields, [
        "environment_storage_instructions", "environment_max_storage_temp", "environment_max_humidity", "environment_notes",
      ]) },
    ], lifecycle),
    technicalSection("performance-curves", performanceCards(detail, fields), lifecycle),
    technicalSection("physical", physicalCards(detail, fields), lifecycle),
    technicalSection("tape-reel", [
      { title: "Packaging Quantity", rows: packaging, notes: metadataList(fields, ["tape_notes"]) },
      {
        title: "Reel & Tape Dimensions",
        rows: metadataList(fields, ["tape_reel_size", "tape_width_mm", "tape_tear_force"]),
        drawings: drawing(detail, "tape_drawing", "Tape and reel drawing"),
      },
    ], lifecycle),
    technicalSection("soldering", [
      {
        title: "Reflow Soldering",
        rows: metadataList(fields, ["solder_reflow_max_times", "solder_reflow_standard"]),
        drawings: drawing(detail, "solder_reflow_profile", "Reflow soldering profile"),
      },
      { title: "Hand Soldering & Handling", rows: metadataList(fields, [
        "solder_hand_notes", "solder_washing_notes", "solder_process_notes",
      ]) },
    ], lifecycle),
  ];
}

function sectionNavigation(regions, previousNav) {
  const wrap = element("div", "a4k-section-nav-wrap");
  const nav = element("nav", "a4k-section-nav");
  nav.setAttribute("aria-label", "Product detail sections");
  const active = previousNav?.querySelector('[aria-current="location"]')?.dataset.a4kSection;
  const current = regions.some(({ id }) => id === active) ? active : "overview";
  for (const { id } of regions) {
    const button = element("button", null, SECTION_LABELS[id]);
    button.type = "button";
    button.dataset.a4kSection = id;
    button.setAttribute("aria-controls", id);
    if (id === current) {
      button.classList.add("is-active");
      button.setAttribute("aria-current", "location");
    }
    nav.append(button);
  }
  const arrow = (step, label, glyph) => {
    const button = element("button", "a4k-nav-arrow", glyph);
    button.type = "button";
    button.dataset.a4kNavStep = String(step);
    button.setAttribute("aria-label", label);
    return button;
  };
  wrap.append(element("strong", null, "Product Details"),
    arrow(-1, "Previous product detail sections", "‹"),
    nav,
    arrow(1, "Next product detail sections", "›"));
  return wrap;
}

function buildOverview(name, familyName, categoryName, fields) {
  const overview = section("overview", false);
  const heroCopy = element("div", "a4k-hero-copy");
  const details = element("div");
  const heading = element("div", "a4k-heading-row");
  const title = element("h1");
  title.append(element("span", null, name));
  if (categoryName) title.append(element("small", null, categoryName));
  heading.append(title);
  if (familyName) heading.append(element("span", "tag", familyName));
  const intro = element("div", "a4k-intro");
  const description = meaningfulText(fields.get("series_notes")?.value);
  if (description || categoryName) intro.append(
    element("strong", null, "Introduction"),
    bound(element("p", null, description || name + " is listed under " + categoryName + "."), description && "series_notes"),
  );
  const features = featureList(fields.get("series_features")?.value) ||
    featureList(["series_feature_1", "series_feature_2", "series_feature_3"].map((key) => fields.get(key)?.value));
  if (features) intro.append(element("h2", "a4k-features-heading", "Features"), bound(features, "series_features"));
  details.append(heading);
  if (intro.childElementCount) details.append(intro);
  heroCopy.append(details);
  const certifications = compliance(fields);
  if (certifications) heroCopy.append(certifications);
  overview.append(heroCopy);
  return overview;
}

function buildSpecifications(summary, fields, tableState, summaryState, retry) {
  const region = section("specifications");
  const summaryGrid = valueGrid("a4k-summary-grid", specificationSummary(summary, fields));
  if (summaryGrid) region.append(summaryGrid);
  const table = tableState === "available" ? element("div") : null;
  if (table) {
    table.dataset.a4kProductTable = "";
    region.append(table);
  } else if (tableState === "missing") {
    region.append(statusPanel("missing", "No parts are listed for this series."));
  }
  if (tableState === "error" || summaryState === "error") {
    const message = tableState === "error"
      ? (summaryState === "error" ? "Could not load the series summary or electrical specifications." : "Could not load the electrical specifications.")
      : "Could not load the series summary.";
    region.append(statusPanel("error", message, retry));
  }
  return { region: region.childElementCount > 1 ? region : null, table };
}

function buildDownloads(fields, assets, downloadLink) {
  const region = section("downloads");
  const grid = element("div", "a4k-download-grid");
  const usedUrls = new Set();
  for (const [key, asset] of assets) {
    if (!asset || usedUrls.has(asset.url)) continue;
    usedUrls.add(asset.url);
    const [kind, title] = FILE_INFO[key] || ["document", meaningfulText(fields.get(key)?.label) || "Technical Document PDF"];
    const card = element("article");
    card.dataset.downloadKind = kind;
    card.dataset.seriesDownloadUrl = asset.url;
    const copy = element("div");
    copy.append(element("h3", null, title));
    const descriptionKey = "download_datasheet_description";
    const description = key === "series_product_spec" ? meaningfulText(fields.get(descriptionKey)?.value) : null;
    if (description !== null) copy.append(bound(element("p", null, description), descriptionKey));
    card.append(copy, downloadLink(key, key === "series_model_3d" ? "Download GLB" : "Download PDF", asset, card));
    grid.append(card);
  }
  if (!grid.childElementCount) return null;
  region.append(grid);
  return region;
}

function buildEnquiry(fields) {
  const region = section("enquiry", false);
  const card = element("div", "a4k-selection-cta");
  const copy = element("div");
  copy.append(element("h2", null, "Need help selecting components for your design?"));
  const description = meaningfulText(fields.get("inquiry_support_description")?.value);
  copy.append(bound(element("p", null, description || "Share your target series and electrical requirements with our team."),
    description && "inquiry_support_description"));
  const actions = element("div");
  const link = element("a", "button", "Send Inquiry");
  link.href = "/inquiry";
  link.dataset.link = "";
  link.dataset.seriesEnquiry = "";
  actions.append(link);
  card.append(copy, actions);
  region.append(card);
  return region;
}

export function renderSeriesContent(main, {
  detail, summary, familyName, categoryName, tableState, summaryState, signal, onSectionChange, retry,
}) {
  const content = main.querySelector("[data-series-content]");
  const fields = new Map((detail.metadata || []).map((field) => [field.key, field]));
  const name = detail.resource.name;
  const image = primaryMedia(detail, summary, "series_product_image", "image");
  const datasheet = primaryMedia(detail, summary, "series_product_spec", "pdf");
  const model = mediaFrom(detail, "series_model_3d", "glb");
  const overview = buildOverview(name, familyName, categoryName, fields);
  const refreshNav = () => {
    if (signal?.aborted || !content.contains(overview)) return;
    const previous = content.querySelector(".a4k-section-nav-wrap");
    const focused = previous?.contains(document.activeElement)
      ? document.activeElement.dataset.a4kSection
      : null;
    const nav = sectionNavigation([...content.querySelectorAll(":scope > section")], previous);
    previous.replaceWith(nav);
    onSectionChange?.();
    if (focused) {
      const buttons = [...nav.querySelectorAll("[data-a4k-section]")];
      const target = buttons.find((button) => button.dataset.a4kSection === focused) ||
        nav.querySelector('[aria-current="location"]');
      target?.focus({ preventScroll: true });
    }
  };

  const sidebar = element("aside", "a4k-product-card");
  sidebar.setAttribute("aria-label", "Product summary");
  const pruneSidebar = () => {
    if (sidebar.childElementCount === 0) sidebar.remove();
  };
  const media = mediaPanels({ image, model, name, signal, onEmpty: pruneSidebar });
  if (media) sidebar.append(media);
  const mini = valueGrid("a4k-spec-mini", miniDimensions(summary, fields));
  if (mini) sidebar.append(mini);
  const status = element("p", "a4k-series-media-status");
  status.setAttribute("role", "status");
  status.hidden = true;
  const downloadTargets = [];
  const removeUnavailable = (url) => {
    for (const target of downloadTargets) {
      if (target.asset.url === url) (target.card || target.link).remove();
    }
    pruneSidebar();
    const downloads = content.querySelector("#downloads");
    if (downloads && !downloads.querySelector("article")) {
      downloads.remove();
      refreshNav();
    }
  };
  function downloadLink(key, label, asset, card) {
    const link = bound(element("a", "button", label), key);
    bindSeriesDownload(link, asset, {
      signal,
      onError: (unavailable) => {
        if (!content.contains(overview)) return;
        status.hidden = false;
        status.textContent = unavailable ? asset.filename + " is no longer available."
          : "Could not download " + asset.filename + ". Please try again.";
        const downloadSection = link.closest("#downloads");
        if (downloadSection && unavailable) downloadSection.before(status);
        else link.after(status);
        if (!unavailable) return;
        if (!downloadSection) overview.after(status);
        main.dispatchEvent(new CustomEvent("series-download-invalid", { detail: { url: asset.url } }));
      },
    });
    downloadTargets.push({ asset, card, link });
    return link;
  }
  main.addEventListener("series-download-invalid", (event) => {
    if (content.contains(overview)) removeUnavailable(event.detail.url);
  }, { signal });
  if (datasheet) sidebar.append(downloadLink("series_product_spec", "Download Datasheet", datasheet));
  if (sidebar.childElementCount) overview.append(sidebar);

  const specs = buildSpecifications(summary, fields, tableState, summaryState, retry);
  const engineering = engineeringSections(detail, fields, { signal, onSectionChange: refreshNav });
  const assets = [
    ["series_product_spec", datasheet],
    ...Object.keys(detail.media || {}).filter((key) => key.startsWith("download_"))
      .map((key) => [key, mediaFrom(detail, key, "pdf")]),
    ["series_model_3d", model],
  ];
  const downloads = buildDownloads(fields, assets, downloadLink);
  const enquiry = buildEnquiry(fields);

  const regions = [overview, specs.region, ...engineering, downloads, enquiry].filter(Boolean);
  for (const region of regions) {
    if (region.querySelector("[data-catalog-content-bound]")) region.dataset.catalogContentBound = "true";
  }
  content.replaceChildren(...regions, status);
  overview.after(sectionNavigation(regions));
  showSeriesStatus(main, { state: "available" });
  return { table: specs.table, datasheet, image };
}

import { catalogMediaUrl } from "./catalog-media.js";

const TEXT_FIELDS = Object.freeze({
  series_notes: ".a4k-intro p",
  series_feature_1: ".a4k-intro ul li:nth-child(1)",
  series_feature_2: ".a4k-intro ul li:nth-child(2)",
  series_feature_3: ".a4k-intro ul li:nth-child(3)",
  series_product_type: ".a4k-summary-grid > div:nth-child(1) b",
  series_test_frequency: ".a4k-summary-grid > div:nth-child(3) b",
  series_operating_temperature: ".a4k-summary-grid > div:nth-child(4) b",
  series_spq_per_reel: ".a4k-spec-mini > div:nth-child(4) b",
  compliance_rohs_reach: ".a4k-compliance > div:nth-child(2) span",
  compliance_halogen_free: ".a4k-compliance > div:nth-child(3) span",
  compliance_aec_q200: ".a4k-compliance > div:nth-child(4) span",
  environment_operating_temperature: "#environmental .a4k-info-card:nth-child(1) li:nth-child(1)",
  environment_storage_temperature: "#environmental .a4k-info-card:nth-child(1) li:nth-child(2)",
  environment_test_ambient: "#environmental .a4k-info-card:nth-child(1) li:nth-child(3)",
  environment_storage_instructions: "#environmental .a4k-info-card:nth-child(2) li:nth-child(1)",
  environment_max_storage_temp: "#environmental .a4k-info-card:nth-child(2) li:nth-child(2)",
  environment_max_humidity: "#environmental .a4k-info-card:nth-child(2) li:nth-child(3)",
  environment_notes: "#environmental .a4k-info-card:nth-child(2) li:nth-child(4)",
  performance_curve_title: "#performance-curves .a4k-diagram-card h3",
  performance_curve_description: "#performance-curves .a4k-diagram-card > p",
  physical_dimension_notes: "#physical .a4k-diagram-card:nth-child(1) > p",
  physical_pcb_notes: "#physical .a4k-diagram-card:nth-child(2) > p",
  tape_chip_per_reel: "#tape-reel .a4k-info-card:nth-child(1) li:nth-child(1)",
  tape_inner_box_qty: "#tape-reel .a4k-info-card:nth-child(1) li:nth-child(2)",
  tape_middle_box_qty: "#tape-reel .a4k-info-card:nth-child(1) li:nth-child(3)",
  tape_carton_qty: "#tape-reel .a4k-info-card:nth-child(1) li:nth-child(4)",
  tape_reel_size: "#tape-reel .a4k-info-card:nth-child(2) li:nth-child(1)",
  tape_width_mm: "#tape-reel .a4k-info-card:nth-child(2) li:nth-child(2)",
  tape_tear_force: "#tape-reel .a4k-info-card:nth-child(2) li:nth-child(3)",
  tape_notes: "#tape-reel .a4k-info-card:nth-child(2) li:nth-child(4)",
  solder_reflow_max_times: "#soldering .a4k-info-card:nth-child(1) li:nth-child(2)",
  solder_reflow_standard: "#soldering .a4k-info-card:nth-child(1) li:nth-child(3)",
  solder_hand_notes: "#soldering .a4k-info-card:nth-child(2) li:nth-child(1)",
  solder_washing_notes: "#soldering .a4k-info-card:nth-child(2) li:nth-child(2)",
  solder_process_notes: "#soldering .a4k-info-card:nth-child(2) li:nth-child(3)",
  download_datasheet_description: "#downloads .a4k-download-grid article:first-child p",
  inquiry_support_description: ".a4k-selection-cta p",
});

const MEDIA_FIELDS = Object.freeze({
  series_product_image: ".a4k-media-panel[data-a4k-panel='image'] img",
  physical_dimension_drawing: "#physical [data-physical-drawing='dimensions']",
  physical_pcb_layout: "#physical [data-physical-drawing='pcb']",
  tape_drawing: "#tape-reel [data-tape-drawing]",
  solder_reflow_profile: "#soldering [data-reflow-profile]",
});

const VALUE_FIELDS = Object.freeze({
  series_model_3d: ".a4k-media-panel[data-a4k-panel='3d']",
  series_product_spec: "#downloads .a4k-download-grid article:first-child a",
});

const present = (value) => value !== null && value !== undefined && String(value).trim() !== "";
const featureFormattingTags = new Set(["b", "strong", "i", "em", "br"]);

function appendText(parent, tagName, value, className = "") {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  element.textContent = String(value);
  parent.append(element);
  return element;
}

function fieldMap(detail) {
  return new Map((Array.isArray(detail?.metadata) ? detail.metadata : []).map((field) => [field.key, field]));
}

function markBound(element, key) {
  if (!element) return;
  element.dataset.catalogContentBound = key;
}

function setField(main, fields, key, selector) {
  const field = fields.get(key);
  const element = main.querySelector(selector);
  if (!element || !present(field?.value)) return;
  element.textContent = String(field.value);
  markBound(element, key);
}

function copyFeatureFormatting(target, source) {
  for (const node of source.childNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      target.append(node.textContent);
    } else if (featureFormattingTags.has(node.localName)) {
      const format = document.createElement(node.localName);
      copyFeatureFormatting(format, node);
      target.append(format);
    }
  }
}

function renderFeatureList(main, value) {
  const placeholder = main.querySelector(".a4k-intro > :is(ul, ol)");
  if (!placeholder || !present(value)) return;
  const template = document.createElement("template");
  template.innerHTML = String(value);
  const source = template.content.firstElementChild;
  if (!source || !["ul", "ol"].includes(source.localName)) return;

  const list = document.createElement(source.localName);
  for (const item of source.children) {
    if (item.localName !== "li") continue;
    const li = document.createElement("li");
    copyFeatureFormatting(li, item);
    list.append(li);
  }
  if (!list.childElementCount) return;
  markBound(list, "series_features");
  placeholder.replaceWith(list);
}

function setMedia(main, media, key, selector, alt) {
  const fallbackTargets = {
    physical_dimension_drawing: "#physical .a4k-diagram-card:nth-child(1) .a4k-diagram-box",
    physical_pcb_layout: "#physical .a4k-diagram-card:nth-child(2) .a4k-diagram-box",
    tape_drawing: "#tape-reel .a4k-info-card:nth-child(2)",
    solder_reflow_profile: "#soldering .a4k-info-card:nth-child(1)",
  };
  const element = main.querySelector(selector) || (fallbackTargets[key] ? main.querySelector(fallbackTargets[key]) : null);
  const url = catalogMediaUrl(media?.[key]);
  if (!element || !url) return;
  if (element instanceof HTMLImageElement) {
    element.src = url;
    element.alt = alt;
  } else {
    const image = document.createElement("img");
    image.src = url;
    image.alt = alt;
    image.loading = "lazy";
    if (element.classList.contains("a4k-diagram-box")) element.replaceChildren(image);
    else element.append(image);
  }
  markBound(element, key);
}

function setDownload(main, fields, media, key, selector, label) {
  const field = fields.get(key);
  const url = catalogMediaUrl(media?.[key]);
  const link = main.querySelector(selector);
  if (!link || !present(field?.value) || !url) return;
  link.href = url;
  link.textContent = label;
  link.removeAttribute("aria-disabled");
  link.removeAttribute("tabindex");
  link.setAttribute("download", "");
  markBound(link, key);
}

function addCurves(main, fields, media) {
  const card = main.querySelector("#performance-curves .a4k-diagram-card");
  const output = card?.querySelector("[data-a4k-losses-output]");
  if (!card || !output) return;
  const conditions = fields.get("performance_test_conditions")?.value;
  if (present(conditions)) {
    const p = appendText(card, "p", conditions);
    p.dataset.a4kPerformanceConditions = "";
    markBound(p, "performance_test_conditions");
  }
  const notes = fields.get("performance_notes")?.value;
  if (present(notes)) {
    const p = appendText(card, "p", notes);
    p.dataset.a4kPerformanceNotes = "";
    markBound(p, "performance_notes");
  }
  [1, 2, 3].forEach((number) => {
    const key = `performance_curve_${number}_image`;
    const url = catalogMediaUrl(media?.[key]);
    const field = fields.get(key);
    if (!url || !present(field?.value)) return;
    const figure = document.createElement("figure");
    figure.dataset.performanceCurve = String(number);
    const image = document.createElement("img");
    image.src = url;
    image.alt = String(fields.get(`performance_curve_${number}_caption`)?.value || `Performance curve ${number}`);
    image.loading = "lazy";
    figure.append(image);
    const caption = fields.get(`performance_curve_${number}_caption`)?.value;
    if (present(caption)) appendText(figure, "figcaption", caption);
    output.before(figure);
    markBound(figure, key);
    if (present(caption)) markBound(figure.querySelector("figcaption"), `performance_curve_${number}_caption`);
  });
}

function addDimensionValues(main, fields) {
  const groups = [
    {
      selector: "#physical .a4k-diagram-card:nth-child(1) .a4k-diagram-box",
      dimensions: ["A", "B", "C", "D1", "D2", "P"],
      prefix: "physical_dimension_",
    },
    {
      selector: "#physical .a4k-diagram-card:nth-child(2) .a4k-diagram-box",
      dimensions: ["G", "H", "I", "J", "L"],
      prefix: "physical_pcb_",
    },
  ];
  groups.forEach(({ selector, dimensions, prefix }) => {
    const box = main.querySelector(selector);
    const values = dimensions.flatMap((dimension) => {
      const suffix = dimension.toLowerCase();
      const key = `${prefix}${suffix}_mm`;
      const field = fields.get(key);
      return present(field?.value) ? [[dimension, key, field.value]] : [];
    });
    if (!box || !values.length) return;
    const list = document.createElement("dl");
    list.className = "a4k-dimension-list";
    values.forEach(([dimension, key, value]) => {
      appendText(list, "dt", `${dimension} (mm)`);
      const dd = appendText(list, "dd", value);
      markBound(dd, key);
    });
    if (box.querySelector("img")) box.append(list);
    else box.replaceChildren(list);
  });
}

function addDocument(main, key, title, fields, media) {
  const grid = main.querySelector("#downloads .a4k-download-grid");
  const url = catalogMediaUrl(media?.[key]);
  const field = fields.get(key);
  if (!grid || !url || !present(field?.value)) return;
  const article = document.createElement("article");
  article.dataset.downloadKind = key === "download_brochure_pdf" ? "brochure" : "application-note";
  const copy = document.createElement("div");
  appendText(copy, "h3", title);
  const link = appendText(article, "a", `Download ${title}`, "button");
  link.href = url;
  link.setAttribute("download", "");
  article.prepend(copy);
  grid.append(article);
  markBound(link, key);
}

export function renderSeriesContent(main, detail) {
  if (!main || !detail) return;
  const fields = fieldMap(detail);
  const media = detail.media && typeof detail.media === "object" ? detail.media : {};

  Object.entries(TEXT_FIELDS).forEach(([key, selector]) => setField(main, fields, key, selector));
  renderFeatureList(main, fields.get("series_features")?.value);
  Object.entries(MEDIA_FIELDS).forEach(([key, selector]) => setMedia(main, media, key, selector, fields.get(key)?.label || "Series media"));

  const environmentalNotes = fields.get("environment_notes")?.value;
  const environmentalList = main.querySelector("#environmental .a4k-info-card:nth-child(2) ul");
  if (environmentalList && present(environmentalNotes) && !main.querySelector("#environmental [data-catalog-content-bound='environment_notes']")) {
    const note = appendText(environmentalList, "li", environmentalNotes);
    markBound(note, "environment_notes");
  }

  const image = main.querySelector(".a4k-media-panel[data-a4k-panel='image'] img");
  const width = fields.get("image_width_px")?.value;
  const height = fields.get("image_height_px")?.value;
  if (image?.dataset.catalogContentBound === "series_product_image" && /^\d+$/.test(String(width)) && Number(width) > 0 && Number(width) <= 10000) {
    image.width = Number(width);
  }
  if (image?.dataset.catalogContentBound === "series_product_image" && /^\d+$/.test(String(height)) && Number(height) > 0 && Number(height) <= 10000) {
    image.height = Number(height);
  }

  setDownload(main, fields, media, "series_product_spec", VALUE_FIELDS.series_product_spec, "Download PDF");
  setDownload(main, fields, media, "series_product_spec", ".a4k-product-card > a.button", "Download Datasheet");
  setDownload(main, fields, media, "download_brochure_pdf", "#enquiry a.button", "Download Brochure");

  const modelUrl = catalogMediaUrl(media.series_model_3d);
  if (modelUrl && present(fields.get("series_model_3d")?.value)) {
    const panel = main.querySelector(VALUE_FIELDS.series_model_3d);
    if (panel) {
      panel.replaceChildren();
      const link = appendText(panel, "a", "Open / download 3D model (GLB)");
      link.href = modelUrl;
      link.target = "_blank";
      link.rel = "noopener";
      link.setAttribute("download", "");
      markBound(link, "series_model_3d");
      markBound(panel, "series_model_3d");
    }
  }

  addCurves(main, fields, media);
  addDimensionValues(main, fields);
  addDocument(main, "download_brochure_pdf", "Product Brochure PDF", fields, media);
  addDocument(main, "download_application_note_pdf", "Application Note PDF", fields, media);

  const sections = ["#overview", "#specifications", "#environmental", "#performance-curves", "#physical", "#tape-reel", "#soldering", "#downloads"];
  sections.forEach((selector) => {
    const section = main.querySelector(selector);
    if (section?.querySelector("[data-catalog-content-bound]")) {
      section.dataset.catalogContentBound = "true";
    }
  });
}

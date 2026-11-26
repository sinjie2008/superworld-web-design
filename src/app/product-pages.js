import { productApi } from "./product-api.js";
import { CatalogMissingDiagnostics } from "./catalog-missing-diagnostics.js";
import { hydrateCategoryContent } from "./catalog-category-content.js";
import { catalogMediaUrl } from "./catalog-media.js";
import { renderSeriesContent, showSeriesStatus } from "./catalog-series-content.js";
import { catalogValueState, meaningfulText, seriesMediaAsset } from "./catalog-availability.js";
import { bindSeriesDownload, primaryMedia } from "./catalog-series-media.js";
import {
  CatalogTreeStore,
  PRODUCT_ROUTES,
  matchProductRoute,
  resolveCatalogRoute,
  seriesUrl,
} from "./product-catalog.js";

const API_ERROR_MESSAGE = "Product data unavailable.";
const DEFAULT_PARTS_PAGE_SIZE = 10;
const FIELD_LABELS = Object.freeze({
  "acf.length": "Length (mm)",
  "acf.width": "Width (mm)",
  "acf.height": "Height (mm)",
  "acf.impedance": "Impedance (Ω)",
  "acf.dcr": "DCR (mΩ)",
  "acf.irms": "Irms (mA)",
  "acf.isat": "Isat (mA)",
  "acf.inductance": "Inductance (μH)",
});

const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
  );
export const productFieldLabel = (field) => {
  const supplied = meaningfulText(field.label);
  const label = (supplied || field.key).replace(/^Acf\s+/i, "");
  const unit = meaningfulText(field.unit);
  if (unit) return label.endsWith("(" + unit + ")") || label.endsWith(" " + unit) ? label : label + " (" + unit + ")";
  const fallback = FIELD_LABELS[field.key];
  if (fallback && (!supplied || fallback.split(" (")[0].toLowerCase() === label.toLowerCase())) return fallback;
  return label;
};

function showCatalogRouteStatus(main, { state, message, retry }) {
  let panel = main.querySelector("[data-catalog-route-status]");
  if (!panel) {
    panel = document.createElement("div");
    panel.className = "a4k-series-status";
    panel.dataset.catalogRouteStatus = "";
    main.prepend(panel);
  }
  panel.replaceChildren();
  panel.dataset.seriesState = state;
  panel.setAttribute("role", state === "error" ? "alert" : "status");
  const text = document.createElement("p");
  text.textContent = message;
  panel.append(text);
  if (retry) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = "Retry";
    button.addEventListener("click", retry, { once: true });
    panel.append(button);
  }
}

function countSeries(node) {
  return node.type === "series"
    ? 1
    : (node.children || []).reduce((count, child) => count + countSeries(child), 0);
}

function sectionAnchor(group, family, categorySlug) {
  return `superworld_electronics_products_${group}_${family}_${categorySlug.replace(/-/g, "_")}`;
}

function groupSectionAnchor(group, familyAlias) {
  const suffix = ["emc", "magnetic"].includes(familyAlias) ? "_components" : "";
  return `superworld_electronics_products_${group}_${familyAlias.replace(/-/g, "_")}${suffix}`;
}

function setBreadcrumb(main, items) {
  const nav = main.querySelector("nav.crumb");
  if (!nav) return;
  nav.innerHTML = items
    .map(
      ({ name, href }, index) =>
        `${index ? " &gt; " : ""}${href ? `<a data-link href="${escapeHtml(href)}">${escapeHtml(name.toUpperCase())}</a>` : `<span aria-current="page">${escapeHtml(name.toUpperCase())}</span>`}`,
    )
    .join("");
}

function familyUrl(index, apiPath) {
  return [...index.families].find(([, node]) => node.path === apiPath)?.[0] || null;
}

function breadcrumbHref(index, crumb, route) {
  if (!crumb?.path) return null;
  const group = [...index.groups].find(([, node]) => node.path === crumb.path)?.[0];
  if (group) return group;
  const family = familyUrl(index, crumb.path);
  if (family) return family;
  const series = seriesUrl(index, crumb.path);
  if (series) return series;
  if (crumb.type === "category" && route.group && route.family && crumb.slug)
    return `/products/${route.group}/${route.family}#${sectionAnchor(route.group, route.family, crumb.slug)}`;
  return null;
}

function seriesCategories(family) {
  const result = [];
  function visit(node) {
    const direct = (node.children || []).filter((child) => child.type === "series");
    if (direct.length) result.push({ category: node, series: direct });
    (node.children || []).filter((child) => child.type === "category").forEach(visit);
  }
  visit(family);
  return result;
}

function renderRoot(main, index) {
  index.tree.forEach((root) => {
    const group = Object.entries(PRODUCT_ROUTES).find(
      ([, config]) => config.rootSlug === root.slug,
    )?.[0];
    const section = group
      ? main.querySelector(`#superworld_electronics_products_${group}_components`)
      : null;
    if (!section || !group) return;
    section.id = `superworld_electronics_products_${group}_components`;
    const title = section.querySelector(".section-heading h2");
    title.innerHTML = `<a data-link href="/products/${group}">${escapeHtml(root.name.toUpperCase())}</a>`;
    const action = section.querySelector(".section-heading .link-arrow");
    if (action) {
      action.href = `/products/${group}`;
      action.textContent = "View More";
    }
    section.querySelector(".category-columns").innerHTML = (root.children || [])
      .filter((family) => family.type === "category")
      .map((family) => {
        const href = familyUrl(index, family.path);
        const categories = (family.children || []).filter((node) => node.type === "category");
        return `<div><h3><a data-link href="${escapeHtml(href)}">${escapeHtml(family.name)}</a></h3><ul>${categories.map((category) => `<li><span class="check-square category-index-icon" data-category-path="${escapeHtml(category.path)}" aria-hidden="true"></span><a data-link href="${escapeHtml(href)}#${escapeHtml(sectionAnchor(group, href.split("/").at(-1), category.slug))}">${escapeHtml(category.name)}</a></li>`).join("")}</ul></div>`;
      })
      .join("");
  });
}

function renderGroup(main, index, route) {
  const root = route.node;
  setBreadcrumb(main, [
    { name: "Home", href: "/" },
    { name: "Our Products", href: "/products" },
    { name: root.name },
  ]);
  main.querySelector(".hero-panel h1").textContent = root.name.toUpperCase();
  const families = (root.children || []).filter((node) => node.type === "category");
  const sections = [...main.querySelectorAll("section.product-family")];
  const template = sections[0].cloneNode(true);
  families.forEach((family, position) => {
    const section = sections[position] || template.cloneNode(true);
    if (!sections[position]) main.append(section);
    const href = familyUrl(index, family.path);
    section.id = groupSectionAnchor(route.group, href.split("/").at(-1));
    section.querySelector(".section-heading h2").textContent = family.name;
    section.querySelector(".section-heading p").textContent =
      `${countSeries(family)} current series`;
    const defaultIcons = new Map(
      [...section.querySelectorAll(".family-icon")].map((icon) => [
        icon.querySelector("span")?.textContent.trim().toLowerCase(),
        icon,
      ]),
    );
    section.querySelector(".family-icons").innerHTML = (family.children || [])
      .filter((category) => category.type === "category")
      .map((category) => {
        const defaultImage = defaultIcons.get(category.name.toLowerCase())?.querySelector("img");
        const media = defaultImage?.parentElement.classList.contains("ph")
          ? defaultImage.parentElement.cloneNode(true)
          : defaultImage?.cloneNode(true);
        const visual =
          media?.outerHTML ||
          '<div class="ph"><img src="https://placehold.co/86x66" alt="" width="86" height="66"></div>';
        return `<a data-link class="family-icon" href="${escapeHtml(href)}#${escapeHtml(sectionAnchor(route.group, href.split("/").at(-1), category.slug))}">${visual}<span>${escapeHtml(category.name)}</span></a>`;
      })
      .join("");
  });
  sections.slice(families.length).forEach((section) => section.remove());
  main.querySelector("nav.anchor-nav .anchor-nav-track").innerHTML = families
    .map(
      (family) =>
        `<a href="#${escapeHtml(groupSectionAnchor(route.group, familyUrl(index, family.path).split("/").at(-1)))}">${escapeHtml(family.name)}</a>`,
    )
    .join("");
}

function renderFamily(main, index, route) {
  const family = route.node;
  const group = index.groups.get(`/products/${route.group}`);
  setBreadcrumb(main, [
    { name: "Home", href: "/" },
    { name: "Our Products", href: "/products" },
    { name: group.name, href: `/products/${route.group}` },
    { name: family.name },
  ]);
  main.querySelector(".hero-panel h1").textContent = family.name;
  const categories = seriesCategories(family);
  const sections = [...main.querySelectorAll("section.section-sm")];
  const template = sections[0].cloneNode(true);
  categories.forEach(({ category, series }, position) => {
    const section = sections[position] || template.cloneNode(true);
    if (!sections[position]) main.append(section);
    section.id = sectionAnchor(route.group, route.family, category.slug);
    section.dataset.catalogCategoryPath = category.path;
    section.querySelector("h2").textContent = category.name;
    const tbody = section.querySelector("tbody");
    const familyTable = tbody.closest("table");
    familyTable.setAttribute("role", "table");
    familyTable.setAttribute("aria-label", `${category.name} series`);
    familyTable.querySelector("thead").setAttribute("role", "rowgroup");
    tbody.setAttribute("role", "rowgroup");
    const familyHeadings = [...familyTable.querySelectorAll("th")].map((heading) => {
      heading.setAttribute("role", "columnheader");
      heading.scope = "col";
      return heading.textContent.trim();
    });
    familyTable.querySelector("thead tr").setAttribute("role", "row");
    const defaultRow = tbody.querySelector("tr").cloneNode(true);
    const defaultHref = defaultRow.querySelector("td:nth-child(2) a")?.getAttribute("href");
    tbody.replaceChildren(
      ...series.map((node) => {
        const row = defaultRow.cloneNode(true);
        row.setAttribute("role", "row");
        [...row.cells].forEach((cell, cellIndex) => {
          cell.setAttribute("role", "cell");
          cell.dataset.label = familyHeadings[cellIndex];
        });
        const href = seriesUrl(index, node.path);
        row.dataset.catalogApiPath = node.path;
        row.dataset.catalogSeriesId = String(node.id);
        row.dataset.catalogSummaryStatus = "loading";
        const image = row.querySelector("td:first-child img");
        if (image) {
          image.loading = "lazy";
          if (defaultHref !== href) {
            const sourceWidth = Number(image.getAttribute("width")) || 255;
            const sourceHeight = Number(image.getAttribute("height")) || 195;
            image.src = `https://placehold.co/${sourceWidth}x${sourceHeight}`;
            image.alt = `${node.name} image unavailable`;
          }
          if (image.getAttribute("src")?.startsWith("https://placehold.co/")) {
            let picture = image.closest("picture");
            if (!picture) {
              picture = document.createElement("picture");
              image.replaceWith(picture);
              picture.append(image);
            }
            let source = picture.querySelector("source");
            if (!source) {
              source = document.createElement("source");
              picture.prepend(source);
            }
            source.media = "(max-width: 1024px)";
            source.srcset = "https://placehold.co/80x80";
          }
          image.closest("picture")?.querySelectorAll("source").forEach((source) => {
            source.srcset = "https://placehold.co/80x80";
          });
        }
        const seriesCell = row.cells[1];
        let link = seriesCell.querySelector("a, .product-series");
        if (link.tagName !== "A") {
          const anchor = document.createElement("a");
          anchor.className = link.className;
          anchor.innerHTML = link.innerHTML;
          link.replaceWith(anchor);
          link = anchor;
        }
        link.href = href;
        link.dataset.link = "";
        link.classList.add("product-series");
        link.querySelector("u").textContent = node.name;
        let partCount = seriesCell.querySelector("small");
        if (!partCount) {
          partCount = document.createElement("small");
          seriesCell.append(partCount);
        }
        partCount.textContent = " Loading…";
        row.cells[2].textContent = "Loading…";
        row.cells[3].textContent = "—";
        row.cells[4].textContent = "—";
        row.cells[5].textContent = "—";
        const download = row.cells[6].querySelector("button");
        if (download) {
          download.setAttribute("aria-label", `Download ${node.name} specification`);
          download.setAttribute("aria-disabled", "true");
          download.disabled = true;
        }
        return row;
      }),
    );
  });
  sections.slice(categories.length).forEach((section) => section.remove());
  main.querySelector("nav.anchor-nav .anchor-nav-track").innerHTML = categories
    .map(
      ({ category }) =>
        `<a href="#${escapeHtml(sectionAnchor(route.group, route.family, category.slug))}">${escapeHtml(category.name)}</a>`,
    )
    .join("");
}

function clearFamilyTemplate(main) {
  main.dataset.catalogSummaryStatus = "loading";
  main.querySelectorAll("section.section-sm tbody tr").forEach((row) => {
    const image = row.cells[0]?.querySelector("img");
    if (image) {
      image.onerror = null;
      const width = Number(image.getAttribute("width")) || 255;
      const height = Number(image.getAttribute("height")) || 195;
      image.loading = "lazy";
      image.src = `https://placehold.co/${width}x${height}`;
      image.alt = "Product image loading";
      image.closest("picture")?.querySelectorAll("source").forEach((source) => {
        source.srcset = "https://placehold.co/80x80";
      });
    }
    row.cells[0]?.removeAttribute("data-catalog-content-bound");
    row.cells[6]?.removeAttribute("data-catalog-content-bound");
    row.cells[1]?.querySelector("a u")?.replaceChildren("Loading…");
    const partCount = row.cells[1]?.querySelector("small");
    if (partCount) partCount.textContent = " Loading…";
    if (row.cells[2]) row.cells[2].textContent = "Loading…";
    for (const cell of [row.cells[3], row.cells[4], row.cells[5]])
      if (cell) cell.textContent = "—";
    const download = row.cells[6]?.querySelector("button");
    if (download) {
      download.disabled = true;
      download.setAttribute("aria-disabled", "true");
    }
  });
}

function facetValue(option) {
  const bucket = option && typeof option === "object" ? option : null;
  if (bucket && "count" in bucket && !(Number(bucket.count) > 0)) return null;
  const value = bucket ? (bucket.value ?? bucket.key) : option;
  return typeof value === "boolean" || meaningfulText(value) !== null ? value : null;
}

function seriesTableFields(fields = [], facets = []) {
  const populated = new Set(facets.filter((facet) => facet.values?.some((option) => facetValue(option) !== null))
    .map((facet) => facet.key));
  return fields.filter((field) => {
    if (!field || field.public === false || field.type === "file" || field.type === "image") return false;
    if (["sku", "part_number", "product_sku", "id"].includes(field.key)) return false;
    return field.required === true || populated.has(field.key);
  });
}

function canonicalPart(part) {
  return Boolean(part && Number.isSafeInteger(Number(part.id)) && Number(part.id) > 0 && meaningfulText(part.sku));
}

function belongsToSeries(response, path, id) {
  return response?.series?.path === path && String(response.series.id) === String(id);
}

function validPartsPage(response, path, id) {
  if (!belongsToSeries(response, path, id) || !Array.isArray(response.parts) || !response.parts.every(canonicalPart) ||
    new Set(response.parts.map((part) => String(part.id))).size !== response.parts.length) return false;
  const { page, per_page: perPage, total, last_page: lastPage } = response.pagination || {};
  if (![page, perPage, total, lastPage].every((value) => Number.isInteger(Number(value)))) return false;
  const current = Number(page);
  const size = Number(perPage);
  const count = Number(total);
  const pages = Math.max(1, Math.ceil(count / size));
  return current >= 1 && size >= 1 && count >= response.parts.length && Number(lastPage) === pages &&
    response.parts.length <= size && (count === 0 ? response.parts.length === 0 : current <= pages && response.parts.length > 0);
}

function validSeriesFields(fields) {
  if (!Array.isArray(fields)) return false;
  const keys = new Set();
  return fields.every((field) => {
    const key = meaningfulText(field?.key);
    const label = meaningfulText(field?.label);
    if (!key || !label || keys.has(key)) return false;
    keys.add(key);
    return field.required === undefined || typeof field.required === "boolean";
  });
}

function validPdfCount(response, facets) {
  const candidates = [response?.validPdfCount, ...facets.map((facet) => facet.validPdfCount)];
  const counts = candidates.map(Number).filter((value) => Number.isInteger(value) && value >= 0);
  return counts.length ? Math.max(...counts) : 0;
}

function mediaDetailsValue(source, key, requireDetails = false) {
  if (Object.hasOwn(source || {}, "mediaDetails")) {
    return Object.hasOwn(source.mediaDetails || {}, key) ? source.mediaDetails[key] : null;
  }
  return requireDetails ? null : undefined;
}

function partMediaAssets(part, fields, kind, requireDetails) {
  const assets = [];
  for (const field of fields || []) {
    if (field.type !== "file") continue;
    const details = mediaDetailsValue(part, field.key, requireDetails);
    const asset = seriesMediaAsset(part.media?.[field.key], kind, details);
    if (asset && !assets.some((item) => item.url === asset.url)) assets.push(asset);
  }
  return assets;
}

function partMediaAsset(part, fields, kind, requireDetails) {
  return partMediaAssets(part, fields, kind, requireDetails)[0] || null;
}

function electricalValue(value, field, kind) {
  if (catalogValueState(value) !== "available") return null;
  const source = typeof value === "number" ? String(value) : String(value).trim();
  const match = /^([+]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?)\s*([\p{L}Ωωµμ]+)?$/iu.exec(source);
  if (!match) return null;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount < 0) return null;
  const token = match[2] || measurementUnit(field, kind);
  const scale = unitScale(token, kind);
  return scale === null ? null : amount * scale;
}

function measurementUnit(field, kind) {
  const explicit = meaningfulText(field?.unit);
  if (explicit) return explicit;
  const label = String(field?.label || "");
  if (/\d\s*(?:-|–|—|to)\s*\d/i.test(label)) return null;
  const candidates = label.match(/(?<![\p{L}\p{N}])(?:[kMmunµμ]?Ω|[kMmunµμ]?A|[kMmunµμ]?ohms?|[kMmunµμ]?amps?|milliohms?|milliamp(?:s)?)(?![\p{L}\p{N}])/gu) || [];
  const unit = candidates.find((candidate) => unitScale(candidate, kind) !== null || /(?:Ω|ω|A)$/u.test(candidate));
  if (unit) return unit;
  if (/^(?:Acf Dcr|DCR)$/i.test(label) && kind === "resistance") return "mΩ";
  if (/^(?:Acf Irms|Irms)$/i.test(label) && kind === "current") return "mA";
  return null;
}

function unitScale(rawUnit, kind) {
  if (!rawUnit) return null;
  const unit = rawUnit.trim().replace(/[µμ]/g, "u").replace(/[ω]/g, "Ω");
  if (kind === "current") {
    if (unit === "mA" || /^milliamp(?:s)?$/i.test(unit)) return 0.001;
    if (unit === "A" || /^amps?$/i.test(unit)) return 1;
    return null;
  }
  if (unit === "mΩ" || (unit.startsWith("m") && /^mohms?$/i.test(unit))) return 0.001;
  if (unit === "Ω" || /^ohms?$/i.test(unit)) return 1;
  return null;
}

function tableFieldValue(value, field) {
  const key = field.key;
  const kind = key === "acf.dcr" ? "resistance" : key === "acf.irms" ? "current" : null;
  if (!kind || typeof value !== "string") return String(value);
  const hasUnit = /(?:\d+(?:\.\d+)?|\.\d+)\s*[\p{L}Ωωµμ]+/u.test(value);
  if (!hasUnit) return value;
  const base = electricalValue(value, field, kind);
  const targetUnit = measurementUnit(field, kind);
  const targetScale = unitScale(targetUnit, kind);
  if (base === null || targetScale === null) return "Unavailable";
  return String(Number((base / targetScale).toPrecision(8)));
}

function tableDisplayValue(value, field) {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  return tableFieldValue(value, field);
}

function partLossMilliwatts(part, fields) {
  const dcrField = fields.find((field) => field.key === "acf.dcr");
  const currentField = fields.find((field) => field.key === "acf.irms");
  if (!dcrField || !currentField) return null;
  const resistance = electricalValue(part.values?.[dcrField.key], dcrField, "resistance");
  const current = electricalValue(part.values?.[currentField.key], currentField, "current");
  return resistance === null || current === null ? null : current ** 2 * resistance * 1000;
}

function summaryDisplay(value) {
  if (value?.status === "invalid") return "Unavailable";
  return value?.status === "available" && typeof value.display === "string" && value.display
    ? value.display
    : "—";
}

function familyColumnSlots(columns = []) {
  const slots = { image: null, series: null, dimensions: null, specifications: [], pdf: null };
  columns.forEach((column) => {
    const key = String(column.key || "");
    const type = String(column.type || "").toLowerCase();
    if (type === "image" || key === "media.series_product_image") slots.image = column;
    else if (type === "series" || key === "series") slots.series = column;
    else if (type === "dimension" || key === "dimensions" || key.startsWith("dimensions."))
      slots.dimensions = column;
    else if (type === "pdf" || key === "media.series_product_spec") slots.pdf = column;
    else if (type === "specification" || key.startsWith("acf.") || key.startsWith("specifications."))
      slots.specifications.push(column);
  });
  return slots;
}

function specificationKey(column) {
  return String(column.key || "").replace(/^specifications\./, "");
}

function updateFamilyHeadings(table, columns) {
  const slots = familyColumnSlots(columns);
  const values = [
    slots.image?.label || "Product",
    slots.series?.label || "Series",
    slots.dimensions?.label || "Dimension",
    ...Array.from({ length: 3 }, (_, index) => slots.specifications[index]?.label || "—"),
    slots.pdf?.label || "Specification",
  ];
  [...table.querySelectorAll("thead th")].forEach((heading, index) => {
    heading.textContent = values[index] || heading.textContent;
  });
  table.querySelectorAll("tbody tr").forEach((row) => {
    [...row.cells].forEach((cell, index) => {
      cell.dataset.label = values[index] || cell.dataset.label || "";
    });
  });
  return slots;
}

function setFamilyMedia(row, summary) {
  const imageCell = row.cells[0];
  const image = imageCell.querySelector("img");
  const imageUrl = catalogMediaUrl(summary.media?.series_product_image);
  if (image) {
    image.loading = "lazy";
    if (imageUrl) {
      const picture = image.closest("picture");
      const fallbackSrc = image.src;
      const fallbackSources = [...(picture?.querySelectorAll("source") || [])].map((source) => ({
        media: source.media,
        srcset: source.srcset,
      }));
      picture?.querySelectorAll("source").forEach((source) => source.remove());
      image.onerror = () => {
        image.onerror = null;
        if (picture && fallbackSources.length) {
          const source = document.createElement("source");
          source.media = fallbackSources[0].media || "(max-width: 1024px)";
          source.srcset = fallbackSources[0].srcset;
          picture.prepend(source);
        }
        image.src = fallbackSrc;
        image.alt = `${summary.series.name} image unavailable`;
        imageCell.dataset.catalogSummaryStatus = "invalid";
        delete imageCell.dataset.catalogContentBound;
      };
      image.src = imageUrl;
      image.alt = summary.mediaDetails?.series_product_image?.alt || summary.series.name;
      imageCell.dataset.catalogContentBound = "series_product_image";
    } else {
      image.onerror = null;
      image.alt = `${summary.series.name} image unavailable`;
    }
  }
  imageCell.dataset.catalogSummaryStatus = imageUrl
    ? summary.mediaStatus?.series_product_image || "available"
    : summary.media?.series_product_image
      ? "invalid"
      : summary.mediaStatus?.series_product_image || "missing";

  const downloadCell = row.cells[6];
  const button = downloadCell.querySelector("button");
  const pdfUrl = catalogMediaUrl(summary.media?.series_product_spec);
  if (button && pdfUrl) {
    const link = document.createElement("a");
    link.className = button.className;
    link.href = pdfUrl;
    link.download = summary.mediaDetails?.series_product_spec?.filename || "";
    link.setAttribute("aria-label", button.getAttribute("aria-label"));
    link.append(...button.childNodes);
    link.addEventListener("click", async (event) => {
      if (link.dataset.catalogDownloadVerified === "true") {
        delete link.dataset.catalogDownloadVerified;
        return;
      }
      event.preventDefault();
      if (link.dataset.catalogDownloadChecking === "true" || !link.hasAttribute("href")) return;
      link.dataset.catalogDownloadChecking = "true";
      link.setAttribute("aria-busy", "true");
      const unavailable = () => {
        link.removeAttribute("href");
        link.removeAttribute("download");
        link.setAttribute("aria-disabled", "true");
        link.setAttribute("aria-label", "Specification unavailable");
        link.textContent = "Unavailable";
        downloadCell.dataset.catalogSummaryStatus = "invalid";
        delete downloadCell.dataset.catalogContentBound;
      };
      try {
        const response = await fetch(link.href, {
          method: "HEAD",
          credentials: "same-origin",
          headers: { Accept: "application/pdf" },
          cache: "no-store",
        });
        const contentType = (response.headers.get("content-type") || "")
          .split(";", 1)[0]
          .trim()
          .toLowerCase();
        if (!response.ok || contentType !== "application/pdf") {
          unavailable();
          return;
        }
        if (link.isConnected) {
          link.dataset.catalogDownloadVerified = "true";
          link.click();
        }
      } catch (error) {
        if (error?.name === "AbortError" || !link.isConnected) return;
        unavailable();
      } finally {
        link.removeAttribute("aria-busy");
        delete link.dataset.catalogDownloadChecking;
      }
    });
    button.replaceWith(link);
    downloadCell.dataset.catalogContentBound = "series_product_spec";
  } else if (button) {
    button.disabled = true;
    button.setAttribute("aria-disabled", "true");
    button.title = "Specification unavailable";
  }
  downloadCell.dataset.catalogSummaryStatus = pdfUrl
    ? summary.mediaStatus?.series_product_spec || "available"
    : summary.media?.series_product_spec
      ? "invalid"
      : summary.mediaStatus?.series_product_spec || "missing";
}

function applyFamilySummary(row, summary, slots, parentPath) {
  if (
    summary.series?.path !== row.dataset.catalogApiPath ||
    String(summary.series?.id) !== row.dataset.catalogSeriesId ||
    summary.series?.parentPath !== parentPath
  ) {
    row.dataset.catalogSummaryStatus = "error";
    return false;
  }
  row.dataset.catalogSummaryStatus = "loaded";
  const seriesLink = row.cells[1].querySelector(".product-series u");
  if (seriesLink && summary.series.name) seriesLink.textContent = summary.series.name;
  const partCount = row.cells[1].querySelector("small");
  if (partCount) partCount.textContent = ` ${Number(summary.partCount)} parts`;
  row.cells[2].textContent = summaryDisplay(summary.dimensions);
  slots.specifications.slice(0, 3).forEach((column, index) => {
    const key = specificationKey(column);
    const specification = summary.specifications?.[key];
    const cell = row.cells[index + 3];
    cell.textContent = summaryDisplay(specification);
    cell.dataset.catalogSpecificationStatus = specification?.status || "missing";
  });
  for (let index = slots.specifications.length; index < 3; index += 1) {
    row.cells[index + 3].textContent = "—";
    row.cells[index + 3].dataset.catalogSpecificationStatus = "not_applicable";
  }
  setFamilyMedia(row, summary);
  return true;
}

function resetFamilySummaryRow(row, index, series) {
  const path = series.path;
  row.dataset.catalogApiPath = path;
  row.dataset.catalogSeriesId = String(series.id);
  row.dataset.catalogSummaryStatus = "loading";
  const image = row.cells[0].querySelector("img");
  if (image) {
    image.onerror = null;
    const width = Number(image.getAttribute("width")) || 255;
    const height = Number(image.getAttribute("height")) || 195;
    image.loading = "lazy";
    image.src = `https://placehold.co/${width}x${height}`;
    image.alt = `${series.name} image loading`;
    image.closest("picture")?.querySelectorAll("source").forEach((source) => {
      source.srcset = "https://placehold.co/80x80";
    });
  }
  const link = row.cells[1].querySelector("a, .product-series");
  const href = seriesUrl(index, path);
  if (link) {
    link.querySelector("u").textContent = series.name || "Series";
    if (href) {
      link.href = href;
      link.dataset.link = "";
    } else {
      link.removeAttribute("href");
      link.removeAttribute("data-link");
      link.setAttribute("aria-disabled", "true");
    }
  }
  const partCount = row.cells[1].querySelector("small");
  if (partCount) partCount.textContent = " Loading…";
  row.cells[2].textContent = "Loading…";
  for (const cell of [row.cells[3], row.cells[4], row.cells[5]]) cell.textContent = "—";
  const download = row.cells[6].querySelector("button");
  if (download) {
    download.disabled = true;
    download.setAttribute("aria-disabled", "true");
    download.setAttribute("aria-label", `Download ${series.name} specification`);
  }
  return row;
}

function reconcileFamilyRows(main, index, groups) {
  const groupsByCategory = new Map(groups.map((group) => [group.category?.path, group]));
  main.querySelectorAll("section.section-sm").forEach((section) => {
    const group = groupsByCategory.get(section.dataset.catalogCategoryPath);
    const tbody = section.querySelector("tbody");
    if (!group || !tbody) return;
    const template = tbody.querySelector("tr");
    if (!template) return;
    const defaultRow = template.cloneNode(true);
    const rows = group.series.map((summary) =>
      resetFamilySummaryRow(defaultRow.cloneNode(true), index, summary.series || {}),
    );
    tbody.replaceChildren(...rows);
    updateFamilyHeadings(tbody.closest("table"), group.columns);
  });
}

function markFamilySummaryError(row) {
  row.dataset.catalogSummaryStatus = "error";
  row.cells[1].querySelector("small")?.replaceChildren(" Data unavailable");
  const image = row.cells[0].querySelector("img");
  if (image) image.alt = "Product image unavailable";
  row.cells[2].textContent = "Data unavailable";
  for (const cell of [row.cells[3], row.cells[4], row.cells[5]]) {
    cell.textContent = "Data unavailable";
    cell.dataset.catalogSpecificationStatus = "error";
  }
  const button = row.cells[6].querySelector("button");
  if (button) {
    button.disabled = true;
    button.setAttribute("aria-disabled", "true");
  }
}

export class ProductPages {
  constructor({ api = productApi, treeStore = new CatalogTreeStore(api), navigate, onReady } = {}) {
    this.api = api;
    this.treeStore = treeStore;
    this.navigate = navigate;
    this.onReady = onReady;
    this.partsController = null;
    this.tableControlsController = null;
    this.seriesRequestController = null;
    this.seriesRenderController = null;
    this.seriesRequestId = 0;
    this.selectedParts = new Map();
    this.sectionScrollCleanup = null;
    this.searchTimer = null;
    this.familyFacetCleanup = null;
    this.categoryContentCache = new Map();
  }

  cancel() {
    if (__CATALOG_DIAGNOSTICS__) {
      this.diagnostics?.destroy();
      this.diagnostics = null;
    }
    this.partsController?.abort();
    this.partsController = null;
    this.tableControlsController?.abort();
    this.tableControlsController = null;
    this.seriesRequestController?.abort();
    this.seriesRequestController = null;
    this.seriesRenderController?.abort();
    this.seriesRenderController = null;
    this.seriesRequestId += 1;
    this.sectionScrollCleanup?.();
    this.sectionScrollCleanup = null;
    window.clearTimeout(this.searchTimer);
    this.searchTimer = null;
    this.familyFacetCleanup?.();
    this.familyFacetCleanup = null;
    this.selectedParts.clear();
  }

  async hydrate(pathname, root, { signal, isCurrent = () => true, embedded = false } = {}) {
    const match = matchProductRoute(pathname);
    const main = root.querySelector("main#main-content");
    if (!main) return;
    if (!match) {
      if (String(pathname).startsWith("/products/")) {
        if (main.querySelector("[data-series-status]")) showSeriesStatus(main, { state: "not-found", message: "This product page could not be found." });
        else showCatalogRouteStatus(main, { state: "not-found", message: "This product page could not be found." });
      }
      return;
    }
    const scope = embedded ? main.querySelector("[data-a4k-product-table]") : main;
    if (!scope) return;
    if (match.type === "family") clearFamilyTemplate(main);
    this.cancel();
    if (__CATALOG_DIAGNOSTICS__) {
      this.diagnostics = new CatalogMissingDiagnostics(main);
      this.diagnostics.set(scope, { content: "Catalog data", status: "LOADING", source: "/api/tree", note: "Wait for the current request; no missing backend value has been established." });
    }
    scope.setAttribute("aria-busy", "true");
    try {
      const index = await this.treeStore.load();
      if (signal?.aborted || !isCurrent()) return;
      const route = resolveCatalogRoute(index, match.path);
      if (!route?.nodes && !route?.node) throw new Error("Product route is unavailable.");
      if (__CATALOG_DIAGNOSTICS__) {
        this.diagnostics.tree = index.tree;
        this.diagnostics.node = route.node;
        this.diagnostics.clear(scope);
      }
      if (route.type === "series") {
        if (__CATALOG_DIAGNOSTICS__) this.diagnostics.set(scope, { content: "Series data", node: route.node, status: "LOADING", source: `/api/series/${route.node.path}`, note: "Series, fields, parts, and facets are still loading." });
        await this.hydrateSeries(index, route, main, { signal, isCurrent, embedded });
        if (__CATALOG_DIAGNOSTICS__) this.diagnostics.clear(scope);
      } else if (!embedded) {
        if (route.type === "root") renderRoot(main, index);
        else if (route.type === "group") renderGroup(main, index, route);
        else {
          renderFamily(main, index, route);
          const summaryTask = this.setupFamilySummaries(main, route, { index, signal, isCurrent });
          const contentTask = hydrateCategoryContent(this.api, route, main, {
            signal,
            isCurrent,
            cache: this.categoryContentCache,
          }).then((content) => {
            if (__CATALOG_DIAGNOSTICS__ && !signal?.aborted && isCurrent())
              this.diagnostics.layout(main, index, route, content);
          });
          await Promise.all([summaryTask, contentTask]);
        }
        if (route.type !== "family") {
          const content = await hydrateCategoryContent(this.api, route, main, {
            signal,
            isCurrent,
            cache: this.categoryContentCache,
          });
          if (__CATALOG_DIAGNOSTICS__ && !signal?.aborted && isCurrent())
            this.diagnostics.layout(main, index, route, content);
        }
      }
      if (signal?.aborted || !isCurrent()) return;
      scope.removeAttribute("aria-busy");
      this.onReady?.(route.node?.name || "Our Products");
      if (location.hash) {
        let targetId = location.hash.slice(1);
        try { targetId = decodeURIComponent(targetId); } catch { /* Keep the literal fragment. */ }
        const target = [...main.querySelectorAll("[id]")].find((element) => element.id === targetId) || document.getElementById(targetId);
        if (target && route.type === "series" && target.closest("[data-series-content]")) {
          const nav = main.querySelector(".a4k-section-nav-wrap");
          const stickyTop = parseFloat(getComputedStyle(nav || document.body).top) || 0;
          const headerBottom = document.querySelector(".site-header")?.getBoundingClientRect().bottom || 0;
          const offset = nav ? Math.max(stickyTop, headerBottom) + nav.offsetHeight + 16 : headerBottom + 16;
          window.scrollTo({ top: Math.max(0, target.getBoundingClientRect().top + window.scrollY - offset), behavior: "instant" });
        } else {
          target?.scrollIntoView({ block: "start", behavior: "instant" });
        }
      }
    } catch (error) {
      if (signal?.aborted || !isCurrent() || error?.name === "AbortError") return;
      scope.removeAttribute("aria-busy");
      if (match.type === "series" && main.querySelector("[data-series-status]")) {
        const notFound = error?.message === "Product route is unavailable.";
        showSeriesStatus(main, {
          state: notFound ? "not-found" : "error",
          message: notFound ? "This product series could not be found." : "Series data is temporarily unavailable.",
          retry: notFound ? undefined : () => { void this.hydrate(pathname, root, { signal, isCurrent, embedded }).catch(() => {}); },
        });
      } else {
        const notFound = error?.message === "Product route is unavailable.";
        showCatalogRouteStatus(main, {
          state: notFound ? "not-found" : "error",
          message: notFound ? "This product page could not be found." : API_ERROR_MESSAGE,
          retry: () => { void this.hydrate(pathname, root, { signal, isCurrent, embedded }).catch(() => {}); },
        });
      }
      if (match.type === "family") {
        main.dataset.catalogSummaryStatus = "error";
        main.querySelectorAll("section.section-sm tbody tr").forEach(markFamilySummaryError);
      }
      if (__CATALOG_DIAGNOSTICS__)
        this.diagnostics.set(scope, { content: "Catalog data", node: this.diagnostics.node, status: "API_REQUEST_FAILED", source: this.diagnostics.node?.type === "series" ? `/api/resolve/${this.diagnostics.node.path}; /api/series/${this.diagnostics.node.path} (+ /fields, /parts, /facets)` : "/api/tree", note: "Check the network response, Laragon services, and /api/health. This is a technical failure, not evidence of missing content." });
      scope.setAttribute("aria-label", API_ERROR_MESSAGE);
    }
  }

  async setupFamilySummaries(main, route, { index, signal, isCurrent }) {
    let rows = [...main.querySelectorAll("tr[data-catalog-api-path]")];
    const controller = new AbortController();
    let stopped = false;
    const stop = () => {
      stopped = true;
      controller.abort();
      rows.forEach((row) => row.removeAttribute("aria-busy"));
      signal?.removeEventListener("abort", stop);
    };
    signal?.addEventListener("abort", stop, { once: true });
    this.familyFacetCleanup = stop;
    rows.forEach((row) => {
      row.setAttribute("aria-busy", "true");
      if (__CATALOG_DIAGNOSTICS__)
        this.diagnostics.set(row.cells[2], {
          content: "Series summary",
          status: "LOADING",
          node: this.diagnostics.findNode(row.dataset.catalogApiPath),
          source: `/api/categories/${route.node.path}/summaries`,
        });
    });
    try {
      const groups = new Map();
      let lastPage = 1;
      for (let page = 1; page <= lastPage; page += 1) {
        const response = await this.api.categorySummaries(route.node.path, {
          signal: controller.signal,
          page,
          perPage: 300,
        });
        if (stopped || controller.signal.aborted || !isCurrent()) return;
        lastPage = Math.max(1, Number(response.pagination?.last_page) || 1);
        (response.groups || []).forEach((group) => {
          const path = group.category?.path;
          if (!path) return;
          const existing = groups.get(path) || { ...group, series: [] };
          existing.columns = group.columns || existing.columns || [];
          existing.series.push(...(group.series || []));
          groups.set(path, existing);
        });
      }
      const summaries = new Map();
      groups.forEach((group) =>
        group.series.forEach((summary) => {
          const path = summary.series?.path;
          if (path) summaries.set(path, summary);
        }),
      );
      const categoryGroups = new Map(groups);
      reconcileFamilyRows(main, index, [...categoryGroups.values()]);
      rows = [...main.querySelectorAll("tr[data-catalog-api-path]")];
      const summaryGroups = new Map();
      categoryGroups.forEach((group) =>
        group.series.forEach((item) => {
          if (item.series?.path) summaryGroups.set(item.series.path, group);
        }),
      );
      rows.forEach((row) => {
        const summary = summaries.get(row.dataset.catalogApiPath);
        const category = summaryGroups.get(row.dataset.catalogApiPath);
        const slots = familyColumnSlots(category?.columns || []);
        if (!summary || !applyFamilySummary(row, summary, slots, category?.category?.path))
          markFamilySummaryError(row);
        row.removeAttribute("aria-busy");
        if (__CATALOG_DIAGNOSTICS__ && summary)
          this.diagnostics.set(row.cells[2], {
            content: "Series summary",
            node: this.diagnostics.findNode(row.dataset.catalogApiPath),
            status: summary.dimensions?.status?.toUpperCase() || "MISSING",
            source: `/api/categories/${route.node.path}/summaries`,
          });
      });
      main.dataset.catalogSummaryStatus = rows.every(
        (row) => row.dataset.catalogSummaryStatus === "loaded",
      )
        ? "loaded"
        : "partial";
    } catch (error) {
      if (stopped || controller.signal.aborted || !isCurrent() || error?.name === "AbortError") return;
      rows.forEach((row) => {
        if (row.isConnected) markFamilySummaryError(row);
        row.removeAttribute("aria-busy");
      });
      if (__CATALOG_DIAGNOSTICS__)
        this.diagnostics.set(main, {
          content: "Series summaries",
          node: route.node,
          status: "API_REQUEST_FAILED",
          source: `/api/categories/${route.node.path}/summaries`,
          note: "The category summary request failed. Row values are shown as unavailable.",
        });
      main.dataset.catalogSummaryStatus = "error";
    }
  }

  async hydrateSeries(index, route, main, { signal, isCurrent, embedded }) {
    const apiPath = route.node.path;
    this.seriesRequestController?.abort();
    this.partsController?.abort();
    this.tableControlsController?.abort();
    window.clearTimeout(this.searchTimer);
    this.searchTimer = null;
    this.sectionScrollCleanup?.();
    this.sectionScrollCleanup = null;
    this.seriesRenderController?.abort();
    const requestId = ++this.seriesRequestId;
    const controller = new AbortController();
    this.seriesRequestController = controller;
    const renderController = new AbortController();
    this.seriesRenderController = renderController;
    const abort = () => controller.abort();
    const abortRender = () => renderController.abort();
    signal?.addEventListener("abort", abort, { once: true });
    signal?.addEventListener("abort", abortRender, { once: true });
    const current = () => !controller.signal.aborted && !renderController.signal.aborted && !signal?.aborted && isCurrent() && requestId === this.seriesRequestId;
    const retrySeries = () => {
      const retryTask = this.hydrateSeries(index, route, main, { signal, isCurrent, embedded });
      const retryId = this.seriesRequestId;
      void retryTask.catch(() => {
        if (signal?.aborted || !isCurrent() || retryId !== this.seriesRequestId) return;
        showSeriesStatus(main, { state: "error", message: "Series data is temporarily unavailable.", retry: retrySeries });
      });
    };
    const requestOptions = { signal: controller.signal };
    const initial = await Promise.allSettled([
      this.api.resolve(apiPath, requestOptions),
      this.api.series(apiPath, requestOptions),
      this.api.fields(apiPath, requestOptions),
      this.api.parts(apiPath, { ...requestOptions, perPage: DEFAULT_PARTS_PAGE_SIZE }),
      this.api.facets(apiPath, requestOptions),
      embedded ? Promise.resolve(null) : this.api.seriesSummary(apiPath, requestOptions),
    ]);
    if (!current()) return;
    const [resolvedResult, detailResult, fieldsResult, pageResult, facetsResult, summaryResult] = initial;
    const resolved = resolvedResult.status === "fulfilled" ? resolvedResult.value : null;
    const detail = detailResult.status === "fulfilled" ? detailResult.value : null;
    if (!resolved || !detail || resolved.resource?.path !== apiPath || detail.resource?.path !== apiPath ||
      String(resolved.resource?.id) !== String(route.node.id) || String(detail.resource?.id) !== String(route.node.id) ||
      !meaningfulText(detail.resource?.name) || !validSeriesFields(detail.metadata)) {
      const message = "Series details are unavailable. Please try again.";
      if (!embedded) showSeriesStatus(main, { state: "error", message, retry: retrySeries });
      throw new Error("Product API could not resolve this series.");
    }
    const fieldsOk = fieldsResult.status === "fulfilled" && validSeriesFields(fieldsResult.value);
    const page = pageResult.status === "fulfilled" ? pageResult.value : null;
    const partsOk = validPartsPage(page, apiPath, route.node.id);
    const facetResponse = facetsResult.status === "fulfilled" ? facetsResult.value : null;
    const facetsOk = Boolean(belongsToSeries(facetResponse, apiPath, route.node.id) && Array.isArray(facetResponse.facets) &&
      facetResponse.facets.every((facet) => meaningfulText(facet?.key) && Array.isArray(facet.values)));
    const summary = summaryResult.status === "fulfilled" ? summaryResult.value : null;
    const summaryValid = summary?.series?.path === apiPath && String(summary.series.id) === String(detail.resource.id);
    const tableState = !fieldsOk || !partsOk || !facetsOk
      ? "error"
      : page.parts.length === 0 ? "missing" : "available";
    const crumbs = detail.breadcrumb || resolved.breadcrumb || [];
    const category = crumbs.at(-2);
    const family = index.families.get(`/products/${route.group}/${route.family}`);
    const metadata = Array.isArray(detail.metadata) ? detail.metadata : [];
    const fields = fieldsOk ? fieldsResult.value : [];
    const facets = facetsOk ? facetResponse.facets : [];
    const columns = seriesTableFields(fields, facets);
    const pageData = partsOk ? page : { parts: [], pagination: { page: 1, per_page: DEFAULT_PARTS_PAGE_SIZE, total: 0, last_page: 1 } };
    main.dataset.catalogSeriesId = String(detail.resource.id);
    if (category?.id) main.dataset.catalogCategoryId = String(category.id);
    if (!embedded) main.dataset.catalogSummaryStatus = summaryValid ? "loaded" : "error";
    let seriesView = null;
    if (!embedded) {
      setBreadcrumb(main, [
        { name: "Home", href: "/" },
        { name: "Our Products", href: "/products" },
        ...crumbs.map((crumb, position) => ({
          name: crumb.name,
          href: position === crumbs.length - 1 ? null : breadcrumbHref(index, crumb, route),
        })),
      ]);
      const retry = retrySeries;
      seriesView = renderSeriesContent(main, {
        detail,
        summary: summaryValid ? summary : null,
        familyName: family?.name || "",
        categoryName: category?.name || "",
        tableState,
        summaryState: summaryValid ? "available" : "error",
        signal: renderController.signal,
        retry,
        onSectionChange: () => { if (current()) this.setupPageControls(main, { signal: renderController.signal, isCurrent: current }); },
      });
      this.setupPageControls(main, { signal: renderController.signal, isCurrent: current });
    }
    if (!fieldsOk || !partsOk || !facetsOk) {
      if (__CATALOG_DIAGNOSTICS__) this.diagnostics.set(main, { content: "Series table", node: detail.resource, status: "API_REQUEST_FAILED", source: `/api/series/${apiPath}/fields; /parts; /facets`, note: "Required data endpoint failed; summary content remains available." });
      return;
    }
    if (__CATALOG_DIAGNOSTICS__) this.diagnostics.series(main, detail, embedded);
    const verifiedImage = seriesView?.image || (embedded ? primaryMedia(detail, null, "series_product_image", "image") : null);
    const verifiedDatasheet = seriesView?.datasheet || (embedded ? primaryMedia(detail, null, "series_product_spec", "pdf") : null);
    const table = main.querySelector("[data-a4k-product-table]");
    if (table && tableState === "available") this.setupApiTable(table, {
      apiPath, seriesId: detail.resource.id, rootId: crumbs[0]?.id, categoryId: category?.id, fields: columns, allFields: fields,
      facets, media: detail.media || {}, mediaDetails: detail.mediaDetails, summary: summaryValid ? summary : null,
      page: pageData, signal: renderController.signal, isCurrent: current, name: detail.resource.name,
      datasheet: verifiedDatasheet,
      image: verifiedImage,
      validPdfCount: validPdfCount(facetResponse, facets),
      lossSupported: columns.some((field) => field.key === "acf.dcr") && columns.some((field) => field.key === "acf.irms"),
      ...(__CATALOG_DIAGNOSTICS__ ? { node: detail.resource, metadata } : {}),
    });
    signal?.removeEventListener("abort", abort);
    signal?.removeEventListener("abort", abortRender);
    if (this.seriesRequestController === controller) this.seriesRequestController = null;
  }

  setupPageControls(main, { signal, isCurrent = () => true } = {}) {
    this.sectionScrollCleanup?.();
    const controls = new AbortController();
    const listenerOptions = { signal: controls.signal };
    const sectionButtons = [...main.querySelectorAll("[data-a4k-section]")];
    const sections = new Map([...main.querySelectorAll("[data-series-content] > section")]
      .map((section) => [section.id, section]));
    const sectionNav = main.querySelector(".a4k-section-nav");
    const sectionNavWrap = main.querySelector(".a4k-section-nav-wrap");
    const scrollBehavior = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth";
    let arrowScrollTimer;
    main.querySelectorAll("[data-a4k-nav-step]").forEach((button) =>
      button.addEventListener("click", (event) => {
        event.preventDefault();
        if (!sectionNav || !isCurrent()) return;
        window.clearTimeout(arrowScrollTimer);
        const start = sectionNav.scrollLeft;
        const distance = Number(button.dataset.a4kNavStep) * Math.max(184, sectionNav.clientWidth * 0.8);
        const left = Math.max(0, Math.min(start + distance, sectionNav.scrollWidth - sectionNav.clientWidth));
        const behavior = scrollBehavior();
        sectionNav.scrollTo({ left, behavior });
        if (behavior === "smooth" && start !== left) {
          // Retry without animation if the scroll has not started.
          arrowScrollTimer = window.setTimeout(() => {
            if (sectionNav.scrollLeft === start && isCurrent()) sectionNav.scrollTo({ left, behavior: "instant" });
          }, 250);
        }
      }, listenerOptions),
    );
    let activeSectionId = sectionButtons.find((button) => button.classList.contains("is-active"))?.dataset.a4kSection || "overview";
    const centerButton = (button, behavior = scrollBehavior()) => {
      if (!sectionNav || !button) return;
      const viewport = sectionNav.getBoundingClientRect();
      const bounds = button.getBoundingClientRect();
      const delta = bounds.left + bounds.width / 2 - (viewport.left + viewport.width / 2);
      sectionNav.scrollTo({ left: sectionNav.scrollLeft + delta, behavior });
    };
    const centerActive = (behavior) => centerButton(
      sectionButtons.find((button) => button.dataset.a4kSection === activeSectionId),
      behavior,
    );
    const activateSection = (sectionId, center = false) => {
      if (sectionId !== activeSectionId) window.clearTimeout(arrowScrollTimer);
      activeSectionId = sectionId;
      sectionButtons.forEach((button) => {
        const active = button.dataset.a4kSection === sectionId;
        button.classList.toggle("is-active", active);
        if (active) button.setAttribute("aria-current", "location");
        else button.removeAttribute("aria-current");
        if (active && center) centerButton(button);
      });
    };
    activateSection(activeSectionId);
    const sectionOffset = () => {
      if (!sectionNavWrap) return 0;
      const stickyTop = parseFloat(getComputedStyle(sectionNavWrap).top) || 0;
      const headerBottom =
        document.querySelector(".site-header")?.getBoundingClientRect().bottom || 0;
      return Math.max(stickyTop, headerBottom) + sectionNavWrap.offsetHeight + 16;
    };
    sectionButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const section = sections.get(button.dataset.a4kSection);
        if (!section || section.hidden || !isCurrent()) return;
        window.scrollTo({
          top: Math.max(0, section.getBoundingClientRect().top + window.scrollY - sectionOffset()),
          behavior: scrollBehavior(),
        });
        activateSection(button.dataset.a4kSection, true);
      }, listenerOptions);
      button.addEventListener("focus", () => centerButton(button), listenerOptions);
    });
    const syncSection = () => {
      const offset = sectionOffset();
      const current = [...sections.values()]
        .filter((section) => !section.hidden && section.getClientRects().length && section.getBoundingClientRect().top <= offset + 1)
        .at(-1);
      if (current && current.id !== activeSectionId) activateSection(current.id, true);
    };
    let centerFrame = 0;
    let railWidth = -1;
    const scheduleCenter = () => {
      window.cancelAnimationFrame(centerFrame);
      centerFrame = window.requestAnimationFrame(() => {
        syncSection();
        if (sectionNav && sectionNav.clientWidth !== railWidth) {
          railWidth = sectionNav.clientWidth;
          centerActive("auto");
        }
      });
    };
    window.addEventListener("scroll", syncSection, { ...listenerOptions, passive: true });
    window.addEventListener("resize", scheduleCenter, listenerOptions);
    const resizeObserver = sectionNav ? new ResizeObserver(scheduleCenter) : null;
    if (sectionNav) resizeObserver.observe(sectionNav);
    scheduleCenter();
    this.sectionScrollCleanup = () => {
      controls.abort();
      resizeObserver?.disconnect();
      window.cancelAnimationFrame(centerFrame);
      window.clearTimeout(arrowScrollTimer);
    };
    if (signal?.aborted) this.sectionScrollCleanup();
    else signal?.addEventListener("abort", this.sectionScrollCleanup, { once: true });
  }

  setupApiTable(wrapper, context) {
    const abort = new AbortController();
    this.tableControlsController?.abort();
    this.tableControlsController = abort;
    const { signal } = abort;
    const requestSignal = context.signal;
    const fields = context.fields || [];
    const facets = context.facets || [];
    const filters = new Map();
    const selected = this.selectedParts;
    const defaultsPerPage = Math.max(1, Number(context.page.pagination?.per_page) || DEFAULT_PARTS_PAGE_SIZE);
    let pageSize = defaultsPerPage;
    let currentPage = context.page;
    let sequence = 0;
    let activeRequest = null;
    const make = (tag, className, text) => {
      const element = document.createElement(tag);
      if (className) element.className = className;
      if (text !== undefined) element.textContent = text;
      return element;
    };
    wrapper.replaceChildren();
    wrapper.dataset.catalogApiPath = context.apiPath;
    const tools = make("div", "a4k-table-tools");
    const searchBox = make("div", "a4k-table-search");
    const search = make("input");
    search.type = "search";
    search.dataset.a4kSearch = "";
    search.setAttribute("aria-label", `Search ${context.name} parts`);
    search.placeholder = "Search part number and specifications";
    searchBox.append(search);
    const searchButton = make("button", "", "Search");
    searchButton.type = "button";
    searchButton.dataset.a4kSearchAction = "";
    tools.append(searchBox, searchButton);
    const filterDetails = make("details", "a4k-table-filters");
    filterDetails.append(make("summary", "", "Filter specifications"));
    const filterGrid = make("div", "a4k-filter-grid");
    const filterControls = [];
    facets.forEach((facet) => {
      if (!facet?.key || facet.type === "file" || /^(?:media\.|file\.)/.test(facet.key) || !Array.isArray(facet.values) || !facet.values.length) return;
      const label = make("label", "a4k-filter");
      const caption = make("span", "", facet.label || productFieldLabel({ key: facet.key, label: facet.label }));
      const select = make("select");
      select.setAttribute("aria-label", `Filter by ${caption.textContent}`);
      const all = make("option", "", "All");
      all.value = "";
      select.append(all);
      facet.values.forEach((option) => {
        const raw = facetValue(option);
        if (raw === null) return;
        const labelText = meaningfulText(option?.label) || (typeof raw === "boolean" ? (raw ? "Yes" : "No") : String(raw));
        const item = make("option", "", labelText);
        item.value = String(raw);
        select.append(item);
      });
      if (select.options.length <= 1) return;
      select.addEventListener("change", () => {
        window.clearTimeout(this.searchTimer);
        this.searchTimer = null;
        if (select.value === "") filters.delete(facet.key);
        else filters.set(facet.key, select.value);
        void loadPage(1);
      }, { signal });
      label.append(caption, select);
      filterGrid.append(label);
      filterControls.push(select);
    });
    if (filterControls.length) {
      filterDetails.append(filterGrid);
    } else {
      filterDetails.remove();
    }
    const inquiryButton = make("button", "a4k-primary", "Inquire Selected");
    inquiryButton.type = "button";
    inquiryButton.dataset.a4kInquiry = "";
    const lossButton = context.lossSupported ? make("button", "", "Analyze Losses") : null;
    if (lossButton) {
      lossButton.type = "button";
      lossButton.dataset.a4kLosses = "";
    }
    tools.append(inquiryButton);
    if (lossButton) tools.append(lossButton);
    const help = make("p", "a4k-table-selection");
    help.setAttribute("role", "status");
    help.setAttribute("aria-live", "polite");
    const selectedPartsLabel = make("span", "a4k-selected-parts");
    selectedPartsLabel.dataset.a4kSelectedParts = "";
    help.append(document.createTextNode("Selected: "), selectedPartsLabel);
    const tableWrap = make("div", "a4k-table-wrap");
    const table = make("table");
    table.setAttribute("role", "table");
    table.setAttribute("aria-label", `${context.name} Specifications`);
    const thead = make("thead");
    const headRow = make("tr");
    const verifiedSeriesPdf = context.datasheet || null;
    const seriesImage = context.image || null;
    const invalidMediaUrls = new Set();
    const hasPartDownloads = Number(context.validPdfCount) > 0 || currentPage.parts.some((part) => {
      return Boolean(partMediaAsset(part, context.allFields, "pdf", context.mediaDetails !== undefined));
    });
    let hasDownloads = Boolean(verifiedSeriesPdf || hasPartDownloads);
    const headings = ["Select", "Part Number", ...fields.map((field) => productFieldLabel(field)), ...(hasDownloads ? ["Download"] : [])];
    headings.forEach((heading, index) => {
      const th = make("th", index === 0 ? "a4k-select-cell" : "", heading);
      th.scope = "col";
      th.setAttribute("role", "columnheader");
      headRow.append(th);
    });
    thead.append(headRow);
    const tbody = make("tbody");
    tbody.setAttribute("role", "rowgroup");
    table.append(thead, tbody);
    tableWrap.append(table);
    const lossPanel = make("div", "a4k-table-losses a4k-loss-result");
    lossPanel.dataset.a4kTableLossPanel = "";
    lossPanel.hidden = true;
    lossPanel.setAttribute("role", "status");
    lossPanel.setAttribute("aria-live", "polite");
    const footer = make("div", "a4k-table-footer");
    const pageSizeLabel = make("label", "a4k-page-size", "Show ");
    const pageSizeSelect = make("select");
    pageSizeSelect.setAttribute("aria-label", "Parts per page");
    [10, 25, 50, 100].forEach((size) => {
      const option = make("option", "", String(size));
      option.value = String(size);
      pageSizeSelect.append(option);
    });
    pageSizeSelect.value = String([10, 25, 50, 100].includes(pageSize) ? pageSize : 10);
    pageSize = Number(pageSizeSelect.value);
    pageSizeLabel.append(pageSizeSelect, document.createTextNode(" entries"));
    const pageInfo = make("span");
    pageInfo.setAttribute("role", "status");
    pageInfo.setAttribute("aria-live", "polite");
    const pagination = make("nav", "a4k-pagination");
    pagination.setAttribute("aria-label", `${context.name} part pages`);
    const previous = make("button", "", "Previous");
    previous.type = "button";
    const pageLabel = make("span");
    const next = make("button", "", "Next");
    next.type = "button";
    pagination.append(previous, pageLabel, next);
    footer.append(pageSizeLabel, pageInfo, pagination);
    const compareBar = make("div", "a4k-compare-bar");
    const compareLabel = make("span", "a4k-compare-selection");
    compareLabel.setAttribute("aria-live", "polite");
    compareLabel.setAttribute("role", "status");
    const compareAction = make("a", "button a4k-primary", "Go to Inquiry");
    compareAction.href = "/inquiry";
    compareAction.dataset.link = "";
    compareAction.dataset.seriesEnquiry = "";
    compareBar.append(compareLabel, compareAction);
    wrapper.append(tools);
    if (filterControls.length) wrapper.append(filterDetails);
    const missingRequired = fields.filter((field) => field.required &&
      !facets.some((facet) => facet.key === field.key && facet.values.some((option) => facetValue(option) !== null)));
    if (missingRequired.length) {
      const message = make("p", "a4k-table-status",
        "Required specification data is missing for " + missingRequired.map(productFieldLabel).join(", ") + ".");
      message.setAttribute("role", "status");
      wrapper.append(message);
    }
    wrapper.append(help, tableWrap, lossPanel, footer, compareBar);
    const seriesPdf = verifiedSeriesPdf;
    const main = wrapper.closest("main");
    const mediaStatus = make("span", "a4k-download-status");
    mediaStatus.setAttribute("role", "status");
    mediaStatus.setAttribute("aria-live", "polite");
    help.append(mediaStatus);
    let lossSelection = null;
    main?.addEventListener("series-download-invalid", (event) => {
      const url = event.detail?.url;
      if (!url) return;
      const affected = [...wrapper.querySelectorAll("a[data-series-media-url]")]
        .some((link) => link.dataset.seriesMediaUrl === url);
      if (!affected && seriesPdf?.url !== url) return;
      invalidMediaUrls.add(url);
      mediaStatus.textContent = "A specification file is no longer available; its download has been disabled.";
      if (hasDownloads && !hasPartDownloads && seriesPdf?.url === url) {
        hasDownloads = false;
        headRow.lastElementChild.remove();
      }
      setRows(currentPage.parts);
    }, { signal });
    const syncSelection = () => {
      const selectedList = [...selected.values()];
      const selectionKey = selectedList
        .map((part) => [part.id, part.values?.["acf.dcr"], part.values?.["acf.irms"]].join(":"))
        .sort()
        .join(",");
      if (lossSelection !== null && selectionKey !== lossSelection) {
        lossPanel.hidden = true;
        lossPanel.replaceChildren();
      }
      lossSelection = selectionKey;
      selectedPartsLabel.textContent = selectedList.map((part) => part.sku || part.id).join(", ") || "None";
      compareLabel.textContent = selectedList.length
        ? `Selected: ${selectedList.map((part) => part.sku || part.id).join(", ")}`
        : "No parts selected";
      inquiryButton.disabled = selectedList.length === 0;
      if (lossButton) {
        const eligible = (part) => partLossMilliwatts(part, fields) !== null;
        const canAnalyze = selectedList.some(eligible);
        lossButton.disabled = !canAnalyze;
        lossButton.hidden = !canAnalyze && !currentPage.parts.some(eligible);
      }
      wrapper.closest("main")?.querySelectorAll("[data-series-enquiry]").forEach((link) => {
        if (!selectedList.length) {
          link.href = "/inquiry";
          if (link === compareAction) link.textContent = "Go to Inquiry";
          return;
        }
        const params = new URLSearchParams({ series: context.apiPath });
        if (context.rootId) params.set("root", String(context.rootId));
        if (context.categoryId) params.append("category", String(context.categoryId));
        selectedList.forEach((part) => params.append("inquiry", String(part.id)));
        link.href = `/inquiry?${params}`;
        if (link === compareAction) link.textContent = "Inquire Selected";
      });
    };
    const syncPagination = (busy = false) => {
      const info = currentPage.pagination || {};
      const page = Math.max(1, Number(info.page) || 1);
      const perPage = Math.max(1, Number(info.per_page) || pageSize);
      const total = Math.max(0, Number(info.total) || 0);
      const lastPage = Math.max(1, Number(info.last_page) || 1);
      const start = total ? (page - 1) * perPage + 1 : 0;
      const end = total ? Math.min(start + (currentPage.parts?.length || 0) - 1, total) : 0;
      pageInfo.textContent = `Showing ${start} to ${end} of ${total} entries`;
      pageLabel.textContent = `Page ${page} of ${lastPage}`;
      previous.disabled = busy || page <= 1;
      next.disabled = busy || page >= lastPage;
    };
    const setRows = (parts) => {
      parts.forEach((part) => {
        if (selected.has(part.id)) selected.set(part.id, part);
      });
      const rows = parts.map((part) => {
        const row = make("tr");
        row.setAttribute("role", "row");
        row.dataset.a4kRow = "";
        row.dataset.productId = String(part.id);
        row.dataset.productSku = String(part.sku);
        const selectCell = make("td", "a4k-select-cell");
        selectCell.dataset.label = "Select";
        const checkbox = make("input");
        checkbox.type = "checkbox";
        checkbox.dataset.a4kSelect = "";
        checkbox.checked = selected.has(part.id);
        checkbox.setAttribute("aria-label", `Select ${part.sku} for inquiry or loss analysis`);
        selectCell.append(checkbox);
        row.append(selectCell);
        const identity = make("td");
        identity.dataset.label = "Part Number";
        const partImageAsset = partMediaAsset(part, context.allFields, "image", context.mediaDetails !== undefined);
        const imageAsset = partImageAsset || seriesImage;
        if (imageAsset) {
          const image = make("img", "a4k-part-image");
          image.alt = imageAsset.alt || "";
          image.width = 80;
          image.height = 80;
          image.loading = "lazy";
          image.addEventListener("error", () => {
            if (partImageAsset && seriesImage && partImageAsset.url !== seriesImage.url) {
              image.addEventListener("error", () => image.remove(), { once: true, signal: requestSignal });
              image.src = seriesImage.url;
            } else {
              image.remove();
            }
          }, { once: true, signal: requestSignal });
          image.src = imageAsset.url;
          identity.append(image);
        }
        const link = make("a", "a4k-part-link", part.sku);
        link.href = "#specifications";
        identity.append(link);
        row.append(identity);
        fields.forEach((field) => {
          const cell = make("td");
          cell.dataset.label = productFieldLabel(field);
          cell.dataset.productField = field.key;
          const raw = part.values?.[field.key];
          const valueState = catalogValueState(raw);
          const value = make("span", "a4k-cell-value", valueState === "available" ? tableDisplayValue(raw, field) : valueState === "invalid" ? "Unavailable" : "—");
          cell.append(value);
          row.append(cell);
        });
        const downloadCell = make("td", "a4k-download-cell");
        downloadCell.dataset.label = "Download";
        if (hasDownloads) {
          const partPdfs = partMediaAssets(part, context.allFields, "pdf", context.mediaDetails !== undefined)
            .filter((pdf) => !invalidMediaUrls.has(pdf.url));
          const availablePdfs = partPdfs.length ? partPdfs : (seriesPdf && !invalidMediaUrls.has(seriesPdf.url) ? [seriesPdf] : []);
          availablePdfs.forEach((pdf) => {
            const download = make("a", "button small", availablePdfs.length > 1 ? pdf.filename : "PDF");
            download.dataset.seriesMediaUrl = pdf.url;
            downloadCell.append(download);
            bindSeriesDownload(download, pdf, {
              signal: requestSignal,
              onError: (unavailable) => {
                if (requestSignal?.aborted || !download.isConnected) return;
                mediaStatus.textContent = unavailable
                  ? `${pdf.filename} is no longer available.`
                  : `Could not download ${pdf.filename}. Please try again.`;
                if (unavailable) main?.dispatchEvent(new CustomEvent("series-download-invalid", { detail: { url: pdf.url } }));
              },
            });
          });
          row.append(downloadCell);
        }
        return row;
      });
      if (!rows.length) {
        const row = make("tr");
        row.dataset.a4kEmpty = "";
        const cell = make("td", "", "No matching parts.");
        cell.colSpan = headRow.cells.length;
        row.append(cell);
        rows.push(row);
      }
      tbody.replaceChildren(...rows);
      syncSelection();
      if (__CATALOG_DIAGNOSTICS__) {
        this.diagnostics.clear(wrapper);
        this.diagnostics.table(table, { node: context.node, fields, parts, apiPath: context.apiPath });
      }
    };
    const loadPage = async (requestedPage) => {
      if (requestSignal?.aborted || !context.isCurrent()) return;
      activeRequest?.abort();
      const controller = new AbortController();
      activeRequest = controller;
      const requestId = ++sequence;
      this.partsController = controller;
      const abortOuter = () => controller.abort();
      requestSignal?.addEventListener("abort", abortOuter, { once: true });
      tbody.setAttribute("aria-busy", "true");
      syncPagination(true);
      try {
        const response = await this.api.parts(context.apiPath, {
          signal: controller.signal,
          page: requestedPage,
          perPage: pageSize,
          search: search.value.trim(),
          filters: Object.fromEntries(filters),
        });
        if (controller.signal.aborted || requestSignal?.aborted || !context.isCurrent() || requestId !== sequence) return;
        if (!validPartsPage(response, context.apiPath, context.seriesId)) throw new Error("Parts response does not match the active series or has invalid pagination.");
        currentPage = response;
        setRows(response.parts);
        mediaStatus.textContent = "";
        syncPagination();
      } catch (error) {
        if (controller.signal.aborted || requestSignal?.aborted || !context.isCurrent() || requestId !== sequence) return;
        mediaStatus.textContent = "Could not load parts. The last valid results are still shown.";
        if (__CATALOG_DIAGNOSTICS__) this.diagnostics.set(wrapper, { content: "Product parts", node: context.node, status: "API_REQUEST_FAILED", source: `/api/series/${context.apiPath}/parts`, note: "The table request failed. Existing rows remain visible." });
      } finally {
        requestSignal?.removeEventListener("abort", abortOuter);
        if (activeRequest === controller && requestId === sequence) {
          tbody.removeAttribute("aria-busy");
          this.partsController = null;
          activeRequest = null;
          syncPagination();
        }
      }
    };
    const listeners = { signal };
    searchButton.addEventListener("click", () => {
      window.clearTimeout(this.searchTimer);
      this.searchTimer = null;
      void loadPage(1);
    }, listeners);
    search.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        window.clearTimeout(this.searchTimer);
        this.searchTimer = null;
        void loadPage(1);
      }
    }, listeners);
    search.addEventListener("input", () => {
      activeRequest?.abort();
      sequence += 1;
      window.clearTimeout(this.searchTimer);
      this.searchTimer = window.setTimeout(() => void loadPage(1), 250);
    }, listeners);
    pageSizeSelect.addEventListener("change", () => {
      window.clearTimeout(this.searchTimer);
      this.searchTimer = null;
      pageSize = Number(pageSizeSelect.value);
      void loadPage(1);
    }, listeners);
    previous.addEventListener("click", () => void loadPage(Math.max(1, Number(currentPage.pagination.page) - 1)), listeners);
    next.addEventListener("click", () => void loadPage(Number(currentPage.pagination.page) + 1), listeners);
    tbody.addEventListener("change", (event) => {
      const checkbox = event.target.closest("[data-a4k-select]");
      if (!checkbox) return;
      const part = currentPage.parts.find((item) => Number(item.id) === Number(checkbox.closest("tr")?.dataset.productId));
      if (!part) return;
      if (checkbox.checked) selected.set(part.id, part);
      else selected.delete(part.id);
      syncSelection();
    }, listeners);
    inquiryButton.addEventListener("click", () => {
      if (!selected.size) return;
      const params = new URLSearchParams({ series: context.apiPath });
      if (context.rootId) params.set("root", String(context.rootId));
      if (context.categoryId) params.append("category", String(context.categoryId));
      selected.forEach((part) => params.append("inquiry", String(part.id)));
      this.navigate(`/inquiry?${params}`);
    }, listeners);
    lossButton?.addEventListener("click", () => {
      if (!context.lossSupported || !selected.size) return;
      lossPanel.hidden = false;
      lossPanel.replaceChildren();
      const results = [...selected.values()].map((part) => {
        const loss = partLossMilliwatts(part, fields);
        if (loss === null)
          return `${part.sku}: unavailable`;
        return `${part.sku}: ${loss.toFixed(2)} mW`;
      });
      lossPanel.textContent = `Estimated I²R loss at rated current: ${results.join(" · ")}`;
    }, listeners);
    syncSelection();
    syncPagination();
    setRows(currentPage.parts || []);
    return () => { activeRequest?.abort(); abort.abort(); };
  }
}

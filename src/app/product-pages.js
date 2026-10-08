import { productApi } from "./product-api.js";
import {
  CatalogTreeStore,
  PRODUCT_ROUTES,
  matchProductRoute,
  resolveCatalogRoute,
  seriesUrl,
} from "./product-catalog.js";

const API_ERROR_MESSAGE = "Product data unavailable.";
const MILLI_PER_BASE_UNIT = 1000;
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
const displayValue = (value) =>
  value === null || value === undefined || value === "" ? "—" : escapeHtml(value);
export const productFieldLabel = (field) =>
  FIELD_LABELS[field.key] ||
  String(field.label || field.key)
    .replace(/^Acf\s+/i, "")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

function markMissing(element) {
  if (!element) return;
  element.classList.add("catalog-api-missing");
  element.title = "Not provided by the product API";
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
      action.textContent = `View ${root.name}`;
    }
    section.querySelector(".category-columns").innerHTML = (root.children || [])
      .filter((family) => family.type === "category")
      .map((family) => {
        const href = familyUrl(index, family.path);
        const categories = (family.children || []).filter((node) => node.type === "category");
        return `<div><h3><a data-link href="${escapeHtml(href)}">${escapeHtml(family.name)}</a></h3><ul>${categories.map((category) => `<li><span class="check-square"></span><a data-link href="${escapeHtml(href)}#${escapeHtml(sectionAnchor(group, href.split("/").at(-1), category.slug))}">${escapeHtml(category.name)}</a></li>`).join("")}</ul></div>`;
      })
      .join("");
  });
  main.querySelectorAll(".carousel .media-card").forEach(markMissing);
  markMissing(main.querySelector(".hero-panel p"));
  markMissing(main.querySelector(".hero-brand"));
}

function renderGroup(main, index, route) {
  const root = route.node;
  setBreadcrumb(main, [
    { name: "Home", href: "/" },
    { name: "Our Products", href: "/products" },
    { name: root.name },
  ]);
  main.querySelector(".hero-panel h1").textContent = root.name.toUpperCase();
  markMissing(main.querySelector(".hero-panel p"));
  markMissing(main.querySelector(".hero-brand"));
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
    markMissing(section.querySelector(".ph.tall"));
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
        if (media) markMissing(media);
        const visual =
          media?.outerHTML ||
          '<div class="ph catalog-api-missing" title="Not provided by the product API"><img src="https://placehold.co/86x66" alt="" width="86" height="66"></div>';
        return `<a data-link class="family-icon" href="${escapeHtml(href)}#${escapeHtml(sectionAnchor(route.group, href.split("/").at(-1), category.slug))}">${visual}<span>${escapeHtml(category.name)}</span></a>`;
      })
      .join("");
  });
  sections.slice(families.length).forEach((section) => section.remove());
  main.querySelector("nav.anchor-nav").innerHTML = families
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
  markMissing(main.querySelector(".hero-panel p"));
  markMissing(main.querySelector(".hero-brand"));
  const categories = seriesCategories(family);
  const sections = [...main.querySelectorAll("section.section-sm")];
  const template = sections[0].cloneNode(true);
  categories.forEach(({ category, series }, position) => {
    const section = sections[position] || template.cloneNode(true);
    if (!sections[position]) main.append(section);
    section.id = sectionAnchor(route.group, route.family, category.slug);
    section.querySelector("h2").textContent = category.name;
    markMissing(section.querySelector(".container > p"));
    section.querySelectorAll("thead th").forEach((heading, index) => {
      if (index >= 2 && index <= 5) markMissing(heading);
    });
    const tbody = section.querySelector("tbody");
    const defaultRow = tbody.querySelector("tr").cloneNode(true);
    const defaultHref = defaultRow.querySelector("td:nth-child(2) a")?.getAttribute("href");
    tbody.replaceChildren(
      ...series.map((node) => {
        const row = defaultRow.cloneNode(true);
        const href = seriesUrl(index, node.path);
        row.dataset.catalogApiPath = node.path;
        const image = row.querySelector("td:first-child img");
        if (image) {
          if (defaultHref !== href) {
            image.src = `https://placehold.co/${image.width || 255}x${image.height || 195}`;
            image.alt = `${node.name} image unavailable`;
          }
          markMissing(image.parentElement);
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
        partCount.textContent = ` ${Number(node.partCount || 0)} parts`;
        [...row.cells].slice(2, 6).forEach(markMissing);
        const download = row.cells[6].querySelector("button");
        if (download) {
          download.setAttribute("aria-label", `Download ${node.name} specification`);
          download.setAttribute("aria-disabled", "true");
        }
        markMissing(download || row.cells[6]);
        return row;
      }),
    );
  });
  sections.slice(categories.length).forEach((section) => section.remove());
  main.querySelector("nav.anchor-nav").innerHTML = categories
    .map(
      ({ category }) =>
        `<a href="#${escapeHtml(sectionAnchor(route.group, route.family, category.slug))}">${escapeHtml(category.name)}</a>`,
    )
    .join("");
}

function activeFields(fields, parts, facets) {
  const populated = new Set(
    (facets || []).filter((facet) => facet.values?.length).map((facet) => facet.key),
  );
  parts.forEach((part) =>
    Object.entries(part.values || {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") populated.add(key);
    }),
  );
  return fields.filter((field) => populated.has(field.key));
}

function facetRange(facets, key, unit, divisor = 1) {
  const values = facets.find((facet) => facet.key === key)?.values?.map((item) => item.value) || [];
  if (!values.length) return null;
  if (divisor !== 1 && values.some((value) => !Number.isFinite(Number(value)))) return null;
  const sorted = values
    .map((value) => (divisor === 1 ? value : Number((Number(value) / divisor).toPrecision(12))))
    .sort((left, right) => Number(left) - Number(right));
  return `${sorted.length === 1 ? sorted[0] : `${sorted[0]}–${sorted.at(-1)}`}${unit ? ` ${unit}` : ""}`;
}

function applyFamilyFacets(row, facets) {
  const dimensions = ["acf.length", "acf.width", "acf.height"].map((key) =>
    facetRange(facets, key, ""),
  );
  const values = [
    dimensions.some(Boolean) ? `${dimensions.map((value) => value || "—").join(" × ")} mm` : null,
    facetRange(facets, "acf.impedance", "Ω"),
    facetRange(facets, "acf.dcr", "Ω", MILLI_PER_BASE_UNIT),
    facetRange(facets, "acf.irms", "mA"),
  ];
  values.forEach((value, position) => {
    if (!value) return;
    const cell = row.cells[position + 2];
    cell.textContent = value;
    if (position === 0 && !dimensions.every(Boolean)) markMissing(cell);
    else {
      cell.classList.remove("catalog-api-missing");
      cell.removeAttribute("title");
    }
    const heading = row.closest("table").tHead.rows[0].cells[position + 2];
    heading.classList.remove("catalog-api-missing");
    heading.removeAttribute("title");
  });
}

function tableColumns(fields, defaultHeadings) {
  const electrical = fields.filter(
    (field) => !["acf.length", "acf.width", "acf.height"].includes(field.key),
  );
  const selected = defaultHeadings.map((heading) => {
    if (/test frequency/i.test(heading))
      return (
        fields.find((field) => /test[\s_]*frequency/i.test(`${field.key} ${field.label}`)) || null
      );
    const key = /impedance/i.test(heading)
      ? "acf.impedance"
      : /\bdcr\b/i.test(heading)
        ? "acf.dcr"
        : /current/i.test(heading)
          ? "acf.irms"
          : /inductance/i.test(heading)
            ? "acf.inductance"
            : null;
    return fields.find((field) => field.key === key) || null;
  });
  const unused = [
    ...electrical.filter((field) => !selected.includes(field)),
    ...fields.filter((field) => !electrical.includes(field)),
  ];
  return selected.map(
    (field, index) =>
      field || (/test frequency/i.test(defaultHeadings[index]) ? null : unused.shift() || null),
  );
}

export class ProductPages {
  constructor({ api = productApi, treeStore = new CatalogTreeStore(api), navigate, onReady } = {}) {
    this.api = api;
    this.treeStore = treeStore;
    this.navigate = navigate;
    this.onReady = onReady;
    this.partsController = null;
    this.selectedParts = new Map();
    this.sectionScrollCleanup = null;
    this.searchTimer = null;
    this.familyFacetCleanup = null;
    this.familyFacetCache = new Map();
  }

  cancel() {
    this.partsController?.abort();
    this.partsController = null;
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
    if (!match || !main) return;
    const scope = embedded ? main.querySelector("[data-a4k-product-table]") : main;
    if (!scope) return;
    scope.setAttribute("aria-busy", "true");
    try {
      const index = await this.treeStore.load();
      if (signal?.aborted || !isCurrent()) return;
      const route = resolveCatalogRoute(index, match.path);
      if (!route?.nodes && !route?.node) throw new Error("Product route is unavailable.");
      this.cancel();
      if (route.type === "series") {
        await this.hydrateSeries(index, route, main, { signal, isCurrent, embedded });
      } else if (!embedded) {
        if (route.type === "root") renderRoot(main, index);
        else if (route.type === "group") renderGroup(main, index, route);
        else {
          renderFamily(main, index, route);
          this.setupFamilyFacets(main, { signal, isCurrent });
        }
      }
      if (signal?.aborted || !isCurrent()) return;
      scope.removeAttribute("aria-busy");
      this.onReady?.(route.node?.name || "Our Products");
      if (location.hash)
        document
          .getElementById(decodeURIComponent(location.hash.slice(1)))
          ?.scrollIntoView({ block: "start", behavior: "instant" });
    } catch (error) {
      if (signal?.aborted || !isCurrent() || error?.name === "AbortError") return;
      console.error("Product catalog request failed", error);
      scope.removeAttribute("aria-busy");
      markMissing(scope);
      scope.setAttribute("aria-label", API_ERROR_MESSAGE);
    }
  }

  setupFamilyFacets(main, { signal, isCurrent }) {
    const rows = [...main.querySelectorAll("tr[data-catalog-api-path]")];
    const queue = [];
    const queued = new Set();
    const visibilityTimers = new Map();
    const controller = new AbortController();
    let active = 0;
    let stopped = false;
    let observer;
    const stop = () => {
      stopped = true;
      observer?.disconnect();
      controller.abort();
      visibilityTimers.forEach((timer) => window.clearTimeout(timer));
      visibilityTimers.clear();
      queue.forEach((row) => row.removeAttribute("aria-busy"));
      queue.length = 0;
      signal?.removeEventListener("abort", stop);
    };
    signal?.addEventListener("abort", stop, { once: true });
    this.familyFacetCleanup = stop;
    const load = async (row) => {
      const path = row.dataset.catalogApiPath;
      try {
        let cached = this.familyFacetCache.get(path);
        if (!cached || Date.now() - cached.loadedAt >= 15000) {
          const response = await this.api.facets(path, { signal: controller.signal });
          if (stopped || controller.signal.aborted || !isCurrent()) return;
          cached = { facets: response.facets || [], loadedAt: Date.now() };
          this.familyFacetCache.set(path, cached);
          if (this.familyFacetCache.size > 64)
            this.familyFacetCache.delete(this.familyFacetCache.keys().next().value);
        }
        if (!stopped && isCurrent() && row.isConnected) applyFamilyFacets(row, cached.facets);
      } catch (error) {
        if (!stopped && error?.name !== "AbortError")
          console.warn("Product ranges unavailable", error);
      } finally {
        row.removeAttribute("aria-busy");
        active -= 1;
        pump();
      }
    };
    const pump = () => {
      while (!stopped && active < 4 && queue.length) {
        const row = queue.shift();
        const bounds = row.getBoundingClientRect();
        if (observer && (bounds.bottom < -200 || bounds.top > window.innerHeight + 200)) {
          queued.delete(row);
          row.removeAttribute("aria-busy");
          observer.observe(row);
          continue;
        }
        active += 1;
        void load(row);
      }
    };
    const enqueue = (row) => {
      if (queued.has(row)) return;
      queued.add(row);
      observer?.unobserve(row);
      row.setAttribute("aria-busy", "true");
      queue.push(row);
      pump();
    };
    if (typeof IntersectionObserver === "function") {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            const row = entry.target;
            if (!entry.isIntersecting) {
              window.clearTimeout(visibilityTimers.get(row));
              visibilityTimers.delete(row);
            } else if (!queued.has(row) && !visibilityTimers.has(row)) {
              visibilityTimers.set(
                row,
                window.setTimeout(() => {
                  visibilityTimers.delete(row);
                  if (!stopped && row.isConnected) enqueue(row);
                }, 200),
              );
            }
          });
        },
        { rootMargin: "200px 0px" },
      );
      rows.forEach((row) => observer.observe(row));
    } else rows.slice(0, 8).forEach(enqueue);
  }

  async hydrateSeries(index, route, main, { signal, isCurrent, embedded }) {
    const apiPath = route.node.path;
    const [resolved, detail, fields, page, facetResponse] = await Promise.all([
      this.api.resolve(apiPath, { signal }),
      this.api.series(apiPath, { signal }),
      this.api.fields(apiPath, { signal }),
      this.api.parts(apiPath, { signal, perPage: DEFAULT_PARTS_PAGE_SIZE }),
      this.api.facets(apiPath, { signal }),
    ]);
    if (signal?.aborted || !isCurrent()) return;
    if (resolved.resource?.path !== apiPath || detail.resource?.path !== apiPath)
      throw new Error("Product API resolved a different series.");
    const crumbs = detail.breadcrumb || resolved.breadcrumb || [];
    const category = crumbs.at(-2);
    main.dataset.catalogSeriesId = String(detail.resource.id);
    if (category?.id) main.dataset.catalogCategoryId = String(category.id);
    const selectedFields = activeFields(fields, page.parts || [], facetResponse.facets || []);
    if (!embedded) {
      const group = index.groups.get(`/products/${route.group}`);
      const family = index.families.get(`/products/${route.group}/${route.family}`);
      setBreadcrumb(main, [
        { name: "Home", href: "/" },
        { name: "Our Products", href: "/products" },
        { name: group.name, href: `/products/${route.group}` },
        { name: family.name, href: `/products/${route.group}/${route.family}` },
        {
          name: category?.name || family.name,
          href: `/products/${route.group}/${route.family}#${sectionAnchor(route.group, route.family, category?.slug || "")}`,
        },
        { name: detail.resource.name },
      ]);
      main.querySelector(".a4k-heading-row h1 span").textContent = detail.resource.name;
      main.querySelector(".a4k-heading-row h1 small").textContent = category?.name || family.name;
      main.querySelector(".a4k-heading-row .tag").textContent = family.name;
      const intro = main.querySelector(".a4k-intro p");
      intro.textContent = `${detail.resource.name} is listed under ${category?.name || family.name} with ${detail.partCount} current parts.`;
      markMissing(main.querySelector(".a4k-intro ul"));
      markMissing(main.querySelector(".a4k-compliance"));
      markMissing(main.querySelector(".a4k-product-media"));
      if (route.node.slug !== "a4k-series") {
        const image = main.querySelector(".a4k-media-panel img");
        image.src = "https://placehold.co/255x195";
        image.alt = `${detail.resource.name} image unavailable`;
      }
      ["acf.length", "acf.width", "acf.height"].forEach((key, position) => {
        const value = main.querySelectorAll(".a4k-spec-mini > div b")[position];
        const range = facetRange(facetResponse.facets || [], key, "mm");
        if (range) value.textContent = range;
        else markMissing(value);
      });
      markMissing(main.querySelectorAll(".a4k-spec-mini > div b")[3]);
      const summary = main.querySelectorAll(".a4k-summary-grid > div b");
      summary[0].textContent = category?.name || family.name;
      const impedance = facetRange(facetResponse.facets || [], "acf.impedance", "Ω");
      if (impedance) summary[1].textContent = impedance;
      else markMissing(summary[1]);
      markMissing(summary[2]);
      markMissing(summary[3]);
      ["environmental", "physical", "tape-reel", "soldering", "downloads"].forEach((id) =>
        markMissing(main.querySelector(`#${id}`)),
      );
      markMissing(main.querySelector("#performance-curves h3"));
      markMissing(main.querySelector("#performance-curves p"));
      const datasheetDescription = main.querySelector("#downloads .a4k-download-grid article p");
      if (datasheetDescription)
        datasheetDescription.textContent = `Full ${detail.resource.name} technical specification.`;
      main.querySelectorAll('a[href^="/downloads/"]').forEach((link) => {
        markMissing(link);
        link.setAttribute("aria-disabled", "true");
        link.removeAttribute("href");
        link.tabIndex = -1;
        link.addEventListener("click", (event) => event.preventDefault());
      });
      this.setupPageControls(main);
    }
    this.setupTable(main.querySelector("[data-a4k-product-table]"), {
      apiPath,
      rootId: crumbs[0]?.id,
      categoryId: category?.id,
      fields: selectedFields,
      page,
      signal,
      isCurrent,
      lossSupported:
        selectedFields.some((field) => field.key === "acf.dcr") &&
        selectedFields.some((field) => field.key === "acf.irms"),
      name: detail.resource.name,
    });
  }

  setupPageControls(main) {
    main.querySelectorAll("[data-a4k-media]").forEach((button) =>
      button.addEventListener("click", () => {
        main.querySelectorAll("[data-a4k-media]").forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-pressed", String(active));
        });
        main
          .querySelectorAll("[data-a4k-panel]")
          .forEach((panel) =>
            panel.classList.toggle("is-active", panel.dataset.a4kPanel === button.dataset.a4kMedia),
          );
      }),
    );
    const sectionButtons = [...main.querySelectorAll("[data-a4k-section]")];
    const sectionNav = main.querySelector(".a4k-section-nav");
    const sectionNavWrap = main.querySelector(".a4k-section-nav-wrap");
    let activeSectionId = "overview";
    const activateSection = (sectionId, center = false) => {
      activeSectionId = sectionId;
      sectionButtons.forEach((button) => {
        const active = button.dataset.a4kSection === sectionId;
        button.classList.toggle("is-active", active);
        if (active && center && sectionNav)
          sectionNav.scrollTo({
            left: button.offsetLeft - (sectionNav.clientWidth - button.offsetWidth) / 2,
            behavior: "smooth",
          });
      });
    };
    const sectionOffset = () => {
      if (!sectionNavWrap) return 0;
      const stickyTop = parseFloat(getComputedStyle(sectionNavWrap).top) || 0;
      const headerBottom =
        document.querySelector(".site-header")?.getBoundingClientRect().bottom || 0;
      return Math.max(stickyTop, headerBottom) + sectionNavWrap.offsetHeight + 16;
    };
    sectionButtons.forEach((button) =>
      button.addEventListener("click", () => {
        const section = document.getElementById(button.dataset.a4kSection);
        if (!section) return;
        window.scrollTo({
          top: Math.max(0, section.getBoundingClientRect().top + window.scrollY - sectionOffset()),
          behavior: "smooth",
        });
        activateSection(button.dataset.a4kSection, true);
      }),
    );
    const syncSection = () => {
      const current = sectionButtons
        .map((button) => document.getElementById(button.dataset.a4kSection))
        .filter((section) => section?.getBoundingClientRect().top <= sectionOffset() + 1)
        .at(-1);
      if (current && current.id !== activeSectionId) activateSection(current.id, true);
    };
    window.addEventListener("scroll", syncSection, { passive: true });
    this.sectionScrollCleanup = () => window.removeEventListener("scroll", syncSection);
  }

  setupTable(wrapper, context) {
    const table = wrapper.querySelector("table");
    const rows = wrapper.querySelector("tbody");
    const selectedLabel = wrapper.querySelector("[data-a4k-selected-parts]");
    const lossOutput =
      wrapper.querySelector("[data-a4k-losses-output]") ||
      document.querySelector("[data-a4k-losses-output]");
    const inquiryButtons = [
      ...new Set([
        ...wrapper.querySelectorAll("[data-a4k-inquiry]"),
        ...(wrapper.closest(".a4k-page")?.querySelectorAll("[data-a4k-inquiry]") || []),
      ]),
    ];
    const lossButton = wrapper.querySelector("[data-a4k-losses]");
    let currentPage = context.page;
    let pageSize = context.page.pagination.per_page;
    const footer = document.createElement("div");
    footer.className = "a4k-table-footer";
    footer.dataset.catalogTableFooter = "";
    footer.innerHTML = `<label class="a4k-page-size">Show <select data-catalog-page-size aria-label="Parts per page">${[10, 25, 50, 100].map((size) => `<option value="${size}">${size}</option>`).join("")}</select> entries</label><span data-catalog-page-info role="status" aria-live="polite"></span><nav class="a4k-pagination" data-catalog-pagination aria-label="${escapeHtml(context.name)} part pages"><button type="button" data-catalog-prev>Previous</button><span data-catalog-page-label></span><button type="button" data-catalog-next>Next</button></nav>`;
    wrapper.querySelector(".a4k-table-wrap").after(footer);
    const pageSizeSelect = footer.querySelector("[data-catalog-page-size]");
    pageSizeSelect.value = String(pageSize);
    const syncPagination = (busy = false) => {
      const { page, per_page: perPage, total, last_page: lastPage } = currentPage.pagination;
      const start = total > 0 ? (page - 1) * perPage + 1 : 0;
      const end = total > 0 ? Math.min(start + currentPage.parts.length - 1, total) : 0;
      footer.querySelector("[data-catalog-page-info]").textContent =
        `Showing ${start} to ${end} of ${total} entries`;
      footer.querySelector("[data-catalog-page-label]").textContent = `Page ${page} of ${lastPage}`;
      footer.querySelector("[data-catalog-prev]").disabled = busy || page <= 1;
      footer.querySelector("[data-catalog-next]").disabled = busy || page >= lastPage;
    };
    table.setAttribute("aria-label", `${context.name} Electrical Characteristics`);
    wrapper.dataset.catalogApiPath = context.apiPath;
    const defaultHeadings = [...table.querySelectorAll("thead th")]
      .slice(2, 6)
      .map((heading) => heading.textContent);
    const columns = tableColumns(context.fields, defaultHeadings);
    const extraFields = context.fields.filter(
      (field) =>
        !columns.includes(field) && !["acf.length", "acf.width", "acf.height"].includes(field.key),
    );
    const extraColumn = columns.findIndex(Boolean);
    const defaultRows = new Map(
      [...rows.querySelectorAll("tr[data-product-sku]")].map((row) => [
        row.dataset.productSku,
        [...row.querySelectorAll("td")].map((cell) => cell.innerHTML),
      ]),
    );
    const defaultSelectedSkus = new Set(
      [...rows.querySelectorAll("tr[data-product-sku]")]
        .filter((row) => row.querySelector("[data-a4k-select]:checked"))
        .map((row) => row.dataset.productSku),
    );
    context.page.parts.forEach((part) => {
      if (defaultSelectedSkus.has(part.sku)) this.selectedParts.set(part.id, part);
    });
    table.querySelector("thead tr").innerHTML =
      `<th class="a4k-select-cell">Inquire / Losses Compare</th><th>Part Number</th>${columns.map((field, index) => `<th ${field ? "" : 'class="catalog-api-missing" title="Not provided by the product API"'}>${escapeHtml(field ? productFieldLabel(field) : defaultHeadings[index])}</th>`).join("")}<th class="catalog-api-missing" title="Not provided by the product API">Download</th>`;
    const syncSelection = () => {
      const selected = [...this.selectedParts.values()];
      selectedLabel.textContent = selected.map((part) => part.sku || part.id).join(", ") || "None";
      inquiryButtons.forEach((button) => {
        button.disabled = selected.length === 0;
      });
      if (lossButton) {
        lossButton.disabled = !context.lossSupported || selected.length === 0;
        if (!context.lossSupported) markMissing(lossButton);
      }
      if (!context.lossSupported) markMissing(lossOutput);
    };
    const paint = (response) => {
      currentPage = response;
      rows.innerHTML = response.parts.length
        ? response.parts
            .map((part) => {
              const defaults = defaultRows.get(part.sku) || [];
              const values = columns
                .map((field, index) => {
                  const value = field ? part.values?.[field.key] : null;
                  const present = value !== null && value !== undefined && value !== "";
                  const extraValues =
                    index === extraColumn
                      ? extraFields
                          .map((extra) => {
                            const extraValue = part.values?.[extra.key];
                            const missing =
                              extraValue === null || extraValue === undefined || extraValue === "";
                            return `<br><small data-product-field="${escapeHtml(extra.key)}" ${missing ? 'class="catalog-api-missing" title="Not provided by the product API"' : ""}>${escapeHtml(productFieldLabel(extra))}: ${displayValue(extraValue)}</small>`;
                          })
                          .join("")
                      : "";
                  return `<td ${field ? `data-product-field="${escapeHtml(field.key)}"` : ""} ${present ? "" : 'class="catalog-api-missing" title="Not provided by the product API"'}>${present ? displayValue(value) : defaults[index + 2] || "—"}${extraValues}</td>`;
                })
                .join("");
              const download = defaults.at(-1) || '<span class="button small">PDF</span>';
              return `<tr data-a4k-row data-product-id="${part.id}" data-product-sku="${escapeHtml(part.sku)}"><td class="a4k-select-cell"><input type="checkbox" data-a4k-select aria-label="Select ${escapeHtml(part.sku)} for inquiry or loss analysis" ${this.selectedParts.has(part.id) ? "checked" : ""}></td><td><a class="a4k-part-link" href="#specifications">${escapeHtml(part.sku || part.name)}</a></td>${values}<td class="catalog-api-missing" title="Not provided by the product API">${download}</td></tr>`;
            })
            .join("")
        : `<tr data-a4k-empty><td colspan="7">No matching parts.</td></tr>`;
      syncSelection();
      syncPagination();
    };
    const loadPage = async (number) => {
      if (context.signal?.aborted || !context.isCurrent()) return;
      this.partsController?.abort();
      const controller = new AbortController();
      this.partsController = controller;
      const onAbort = () => controller.abort();
      context.signal?.addEventListener("abort", onAbort, { once: true });
      rows.setAttribute("aria-busy", "true");
      syncPagination(true);
      try {
        const response = await this.api.parts(context.apiPath, {
          signal: controller.signal,
          page: number,
          perPage: pageSize,
          search: wrapper.querySelector("[data-a4k-search]").value.trim(),
        });
        if (controller.signal.aborted || context.signal?.aborted || !context.isCurrent()) return;
        paint(response);
      } catch (error) {
        if (controller.signal.aborted || !context.isCurrent()) return;
        pageSize = currentPage.pagination.per_page;
        pageSizeSelect.value = String(pageSize);
        console.error("Product parts request failed", error);
        markMissing(wrapper);
      } finally {
        context.signal?.removeEventListener("abort", onAbort);
        if (this.partsController === controller) {
          rows.removeAttribute("aria-busy");
          this.partsController = null;
          syncPagination();
        }
      }
    };
    rows.addEventListener("change", (event) => {
      const input = event.target.closest("[data-a4k-select]");
      if (!input) return;
      const part = currentPage.parts.find(
        (item) => item.id === Number(input.closest("tr").dataset.productId),
      );
      if (!part) return;
      if (input.checked) this.selectedParts.set(part.id, part);
      else this.selectedParts.delete(part.id);
      syncSelection();
    });
    const search = () => {
      window.clearTimeout(this.searchTimer);
      this.searchTimer = null;
      void loadPage(1);
    };
    wrapper.querySelector("[data-a4k-search-action]")?.addEventListener("click", search);
    const searchInput = wrapper.querySelector("[data-a4k-search]");
    searchInput?.setAttribute("aria-label", `Search ${context.name} specifications`);
    searchInput?.addEventListener("input", () => {
      window.clearTimeout(this.searchTimer);
      this.searchTimer = window.setTimeout(search, 200);
    });
    searchInput?.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        window.clearTimeout(this.searchTimer);
        search();
      }
    });
    pageSizeSelect.addEventListener("change", () => {
      pageSize = Number(pageSizeSelect.value);
      search();
    });
    wrapper.addEventListener("click", (event) => {
      const previous = event.target.closest("[data-catalog-prev]");
      const next = event.target.closest("[data-catalog-next]");
      if (previous && !previous.disabled)
        void loadPage(currentPage.pagination.page - 1);
      if (next && !next.disabled)
        void loadPage(currentPage.pagination.page + 1);
    });
    inquiryButtons.forEach((button) =>
      button.addEventListener("click", () => {
        if (!this.selectedParts.size) return;
        const params = new URLSearchParams({ series: context.apiPath });
        if (context.rootId) params.set("root", String(context.rootId));
        if (context.categoryId) params.append("category", String(context.categoryId));
        this.selectedParts.forEach((part) => params.append("inquiry", String(part.id)));
        this.navigate(`/inquiry?${params}`);
      }),
    );
    lossButton?.addEventListener("click", () => {
      if (!context.lossSupported || !lossOutput) return;
      const calculations = [...this.selectedParts.values()]
        .map((part) => {
          const dcrValue = part.values?.["acf.dcr"];
          const currentValue = part.values?.["acf.irms"];
          const dcr = Number(dcrValue);
          const current = Number(currentValue);
          if (
            dcrValue === null ||
            dcrValue === undefined ||
            dcrValue === "" ||
            currentValue === null ||
            currentValue === undefined ||
            currentValue === "" ||
            !Number.isFinite(dcr) ||
            !Number.isFinite(current)
          )
            return `${part.sku}: unavailable`;
          return `${part.sku}: ${((current / MILLI_PER_BASE_UNIT) ** 2 * (dcr / MILLI_PER_BASE_UNIT) * MILLI_PER_BASE_UNIT).toFixed(2)} mW`;
        })
        .filter(Boolean);
      lossOutput.textContent = calculations.length
        ? `Estimated I²R loss at rated current: ${calculations.join(" · ")}`
        : "Loss analysis is unavailable for the selected parts.";
    });
    paint(context.page);
  }
}

import { SiteInteractions } from "./site/interactions.js";
import { SiteEnhancements } from "./site/enhancements.js";
import { footer as siteFooter, header as siteHeader, pageRegistry } from "./site/pages.js";
import { SITE_ORIGIN, SOCIAL_IMAGE_PATH, seo } from "./seo.js";
import { ProductPages } from "./product-pages.js";
import { matchProductRoute } from "./product-catalog.js";
import { productApi } from "./product-api.js";

async function mapInBatches(items, batchSize, callback) {
  const results = [];
  for (let offset = 0; offset < items.length; offset += batchSize) {
    const batch = items.slice(offset, offset + batchSize);
    results.push(
      ...(await Promise.all(batch.map((item, index) => callback(item, offset + index)))),
    );
  }
  return results;
}

const ROUTES = Object.freeze({
  home: "/",
  company: "/company",
  achievements: "/company/achievements",
  quality: "/company/quality",
  sustainability: "/company/sustainability",
  applications: "/applications",
  automotive: "/applications/automotive",
  communication: "/applications/communication",
  products: "/products",
  general: "/products/general",
  emc: "/products/general/emc",
  a4k: "/products/general/emc/a4k",
  tools: "/tools/spec-search",
  news: "/news",
  calendar: "/news/event-calendar",
  detail: "/news/radial-leaded-inductor",
  locations: "/locations",
  support: "/support",
  inquiry: "/inquiry",
  thanks: "/thank-you",
});

class SiteState {
  constructor() {
    this.cart = [];
    this.inquiryProducts = [];
    this.inquiryQueryKey = null;
    this.inquiryResolvedKey = null;
    this.inquiryLoading = false;
    this.inquiryError = "";
    this.newsPage = 1;
  }
}

export class SiteApplication {
  constructor(root = document.getElementById("app")) {
    if (!root) throw new Error("Site application root #app is missing");
    this.root = root;
    this.routes = ROUTES;
    this.state = new SiteState();
    this.started = false;
    this.inquiryAbortController = null;
    this.productAbortController = null;
    this.renderVersion = 0;
    this.navigate = this.navigate.bind(this);
    this.removeInquiryItem = this.removeInquiryItem.bind(this);
    this.render = this.render.bind(this);
    this.handleDocumentClick = this.handleDocumentClick.bind(this);
    this.handleHistoryChange = this.handleHistoryChange.bind(this);
    this.interactions = new SiteInteractions({
      app: this.root,
      navigate: this.navigate,
      removeInquiryItem: this.removeInquiryItem,
      render: this.render,
      routes: this.routes,
      state: this.state,
      updateInquiryQuery: () => this.updateInquiryQuery(),
    });
    this.enhancements = new SiteEnhancements();
    this.productPages = new ProductPages({
      navigate: this.navigate,
      onReady: (name) => this.setProductMetadata(name),
    });
  }

  start() {
    if (this.started) return this;
    this.started = true;
    document.addEventListener("click", this.handleDocumentClick);
    window.addEventListener("popstate", this.handleHistoryChange);
    this.render();
    return this;
  }

  stop() {
    if (!this.started) return this;
    this.started = false;
    document.removeEventListener("click", this.handleDocumentClick);
    window.removeEventListener("popstate", this.handleHistoryChange);
    this.interactions.destroy();
    this.enhancements.destroy();
    this.cancelInquiryRequest();
    this.cancelProductRequest();
    return this;
  }

  destroy() {
    return this.stop();
  }

  cancelInquiryRequest() {
    if (this.inquiryAbortController) {
      this.inquiryAbortController.abort();
      this.state.inquiryLoading = false;
    }
    this.inquiryAbortController = null;
  }

  cancelProductRequest() {
    this.productAbortController?.abort();
    this.productAbortController = null;
    this.productPages.cancel();
  }

  inquiryIdsFromQuery() {
    return Array.from(
      new Set(
        new URLSearchParams(location.search)
          .getAll("inquiry")
          .map(Number)
          .filter((value) => Number.isInteger(value) && value > 0),
      ),
    );
  }

  inquirySelectionKey() {
    const params = new URLSearchParams(location.search);
    return JSON.stringify({
      ids: this.inquiryIdsFromQuery(),
      series: params.get("series") || "",
      skus: params.getAll("sku"),
    });
  }

  syncInquiryStateFromQuery() {
    if (location.pathname !== this.routes.inquiry) return;
    const key = this.inquirySelectionKey();
    if (key === this.state.inquiryQueryKey) return;
    Object.assign(this.state, {
      inquiryQueryKey: key,
      inquiryResolvedKey: null,
      inquiryLoading: false,
      inquiryError: "",
      inquiryProducts: [],
      cart: [],
    });
  }

  async loadInquiryProducts() {
    const ids = this.inquiryIdsFromQuery();
    const key = this.inquirySelectionKey();
    if (ids.length === 0 || this.state.inquiryLoading || this.state.inquiryResolvedKey === key) {
      if (ids.length === 0) this.state.inquiryResolvedKey = key;
      return;
    }

    this.cancelInquiryRequest();
    this.state.inquiryLoading = true;
    const requestController = new AbortController();
    this.inquiryAbortController = requestController;
    try {
      const params = new URLSearchParams(location.search);
      const seriesPath = params.get("series");
      const skus = params.getAll("sku");
      const products = seriesPath
        ? await this.loadSeriesInquiryParts(seriesPath, ids, requestController.signal)
        : await this.loadSkuInquiryParts(ids, skus, requestController.signal);
      if (this.state.inquiryQueryKey !== key) return;
      this.state.inquiryProducts = products;
      this.state.cart = this.state.inquiryProducts.map(() => 1);
      this.state.inquiryError = "";
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error(error);
      if (this.state.inquiryQueryKey === key) {
        this.state.inquiryProducts = [];
        this.state.cart = [];
        this.state.inquiryError = "Product data unavailable.";
      }
    } finally {
      if (this.inquiryAbortController === requestController) {
        this.inquiryAbortController = null;
      }
      if (
        !requestController.signal.aborted &&
        location.pathname === this.routes.inquiry &&
        this.state.inquiryQueryKey === key
      ) {
        this.state.inquiryLoading = false;
        this.state.inquiryResolvedKey = key;
        this.render(false);
      }
    }
  }

  async loadSeriesInquiryParts(seriesPath, ids, signal) {
    const wanted = new Set(ids);
    const resolved = await productApi.resolve(seriesPath, { signal });
    if (resolved.resource?.type !== "series") throw new Error("Inquiry series is invalid.");
    const found = new Map();
    let page = 1;
    let lastPage = 1;
    do {
      const response = await productApi.parts(seriesPath, { signal, page, perPage: 100 });
      lastPage = response.pagination.last_page;
      response.parts.forEach((part) => {
        if (wanted.has(part.id)) {
          found.set(part.id, {
            ...part,
            fields: response.fields,
            series: resolved.resource.name,
            category: resolved.breadcrumb.at(-2)?.name || "",
            seriesPath,
          });
        }
      });
      page += 1;
    } while (found.size < wanted.size && page <= lastPage);
    if (found.size !== wanted.size) throw new Error("Selected parts are unavailable.");
    return ids.map((id) => found.get(id));
  }

  async loadSkuInquiryParts(ids, skus, signal) {
    if (ids.length !== skus.length) throw new Error("Selected part identifiers are incomplete.");
    const selections = await mapInBatches(ids, 4, async (id, index) => {
      const sku = skus[index];
      const matches = await productApi.search(sku, { signal });
      const match = matches.parts.find((part) => part.id === id && part.sku === sku);
      if (!match?.series?.path) throw new Error("Selected part is unavailable.");
      return { id, sku, seriesPath: match.series.path };
    });
    const grouped = new Map();
    selections.forEach(({ id, seriesPath }) => {
      if (!grouped.has(seriesPath)) grouped.set(seriesPath, []);
      grouped.get(seriesPath).push(id);
    });
    const groups = await mapInBatches([...grouped], 4, ([seriesPath, groupIds]) =>
      this.loadSeriesInquiryParts(seriesPath, groupIds, signal),
    );
    const partsById = new Map(groups.flat().map((part) => [part.id, part]));
    return selections.map(({ id, sku }) => {
      const part = partsById.get(id);
      if (part?.sku !== sku) throw new Error("Selected part is unavailable.");
      return part;
    });
  }

  updateInquiryQuery() {
    const params = new URLSearchParams(location.search);
    params.delete("inquiry");
    params.delete("sku");
    this.state.inquiryProducts.forEach((product) => params.append("inquiry", String(product.id)));
    this.state.inquiryProducts.forEach((product) =>
      params.append("sku", String(product.sku || "")),
    );
    const query = params.toString();
    history.replaceState({}, "", `${location.pathname}${query ? `?${query}` : ""}${location.hash}`);
    const key = this.inquirySelectionKey();
    this.state.inquiryQueryKey = key;
    this.state.inquiryResolvedKey = key;
  }

  removeInquiryItem(index) {
    this.state.inquiryProducts.splice(index, 1);
    this.state.cart.splice(index, 1);
    this.updateInquiryQuery();
    this.render(false);
  }

  navigate(href, scrollTop = true) {
    const url = new URL(href, location.origin);
    history.pushState({}, "", url.pathname + url.search + url.hash);
    this.render(scrollTop);
  }

  syncPageMetadata() {
    const metadata = seo.metadataForPath(location.pathname);
    const canonicalUrl = `${SITE_ORIGIN}${location.pathname.replace(/\/+$/, "") || "/"}`;
    const socialImageUrl = `${SITE_ORIGIN}${SOCIAL_IMAGE_PATH}`;

    document.title = metadata.title;
    this.upsertMeta("name", "description", metadata.description);
    this.upsertMeta(
      "name",
      "robots",
      metadata.index === false ? "noindex,follow" : "index,follow,max-image-preview:large",
    );
    this.upsertMeta("property", "og:title", metadata.title);
    this.upsertMeta("property", "og:description", metadata.description);
    this.upsertMeta("property", "og:type", "website");
    this.upsertMeta("property", "og:url", canonicalUrl);
    this.upsertMeta("property", "og:image", socialImageUrl);
    this.upsertMeta("property", "og:image:width", "1200");
    this.upsertMeta("property", "og:image:height", "630");
    this.upsertMeta("property", "og:site_name", "Superworld Electronics");
    this.upsertMeta("name", "twitter:card", "summary_large_image");
    this.upsertMeta("name", "twitter:title", metadata.title);
    this.upsertMeta("name", "twitter:description", metadata.description);
    this.upsertMeta("name", "twitter:image", socialImageUrl);

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.append(canonical);
    }
    canonical.href = canonicalUrl;

    const structuredData = seo.structuredDataForPath(location.pathname);
    let script = document.getElementById("page-structured-data");
    if (!structuredData) {
      script?.remove();
      return;
    }
    if (!script) {
      script = document.createElement("script");
      script.id = "page-structured-data";
      script.type = "application/ld+json";
      document.head.append(script);
    }
    script.textContent = JSON.stringify(structuredData);
  }

  setProductMetadata(name) {
    if (!matchProductRoute(location.pathname)) return;
    const title = `${name} | Superworld Electronics`;
    const description = `Browse current ${name} products and specifications from Superworld Electronics.`;
    document.title = title;
    this.upsertMeta("name", "description", description);
    this.upsertMeta("property", "og:title", title);
    this.upsertMeta("property", "og:description", description);
    this.upsertMeta("name", "twitter:title", title);
    this.upsertMeta("name", "twitter:description", description);
  }

  upsertMeta(attribute, name, content) {
    let element = document.head.querySelector(`meta[${attribute}="${name}"]`);
    if (!element) {
      element = document.createElement("meta");
      element.setAttribute(attribute, name);
      document.head.append(element);
    }
    element.setAttribute("content", content);
  }

  render(scrollTop = true) {
    const version = ++this.renderVersion;
    this.interactions.destroy();
    this.enhancements.destroy();
    this.cancelInquiryRequest();
    this.cancelProductRequest();
    this.syncInquiryStateFromQuery();
    const pageSlots = pageRegistry.slotsForPath(location.pathname, this.state);
    this.root.innerHTML =
      siteHeader + pageRegistry.render(location.pathname, pageSlots) + siteFooter;
    this.syncPageMetadata();
    this.enhancements.initialize();
    this.interactions.initialize();
    window.SpecSearchApp?.initialize?.();
    const articleSeries =
      location.pathname === this.routes.detail
        ? this.root.querySelector("[data-a4k-product-table]")
        : null;
    if (matchProductRoute(location.pathname) || articleSeries) {
      const controller = new AbortController();
      this.productAbortController = controller;
      void this.productPages.hydrate(
        articleSeries ? this.routes.a4k : location.pathname,
        this.root,
        {
          signal: controller.signal,
          isCurrent: () => version === this.renderVersion,
          embedded: Boolean(articleSeries),
        },
      );
    }
    if (location.pathname === this.routes.inquiry) void this.loadInquiryProducts();
    const hashTarget = location.hash
      ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
      : null;
    if (hashTarget) hashTarget.scrollIntoView({ block: "start", behavior: "instant" });
    else if (scrollTop) window.scrollTo({ top: 0, behavior: "instant" });
  }

  handleDocumentClick(event) {
    const anchor = event.target.closest("a[data-link]");
    if (
      !anchor ||
      event.defaultPrevented ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const href = anchor.getAttribute("href");
    if (!href || href.startsWith("#")) return;
    event.preventDefault();
    this.navigate(href);
  }

  handleHistoryChange() {
    this.render();
  }
}

new SiteApplication().start();

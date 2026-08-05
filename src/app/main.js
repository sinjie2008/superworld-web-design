import { SiteInteractions } from "./site/interactions.js";
import { SiteEnhancements } from "./site/enhancements.js";
import {
  footer as siteFooter,
  header as siteHeader,
  pageRegistry,
} from "./site/pages.js";
import { SITE_ORIGIN, SOCIAL_IMAGE_PATH, seo } from "./seo.js";

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

  syncInquiryStateFromQuery() {
    if (location.pathname !== this.routes.inquiry) return;
    const key = this.inquiryIdsFromQuery().join(",");
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
    const key = ids.join(",");
    if (
      !key ||
      this.state.inquiryLoading ||
      this.state.inquiryResolvedKey === key
    ) {
      if (!key) this.state.inquiryResolvedKey = key;
      return;
    }

    this.state.inquiryLoading = true;
    this.cancelInquiryRequest();
    const requestController = new AbortController();
    this.inquiryAbortController = requestController;
    try {
      const response = await fetch("/spec-search/mock-data.json", {
        signal: requestController.signal,
      });
      if (!response.ok)
        throw new Error(`Product data request failed (${response.status})`);
      const payload = await response.json();
      const products = payload?.products?.data?.items;
      if (!Array.isArray(products))
        throw new Error("Product data is unavailable");
      if (this.state.inquiryQueryKey !== key) return;
      const productsById = new Map(
        products.map((product) => [Number(product.id), product]),
      );
      this.state.inquiryProducts = ids
        .map((id) => productsById.get(id))
        .filter(Boolean);
      this.state.cart = this.state.inquiryProducts.map(() => 1);
      this.state.inquiryError = "";
    } catch (error) {
      if (error.name === "AbortError") return;
      console.error(error);
      if (this.state.inquiryQueryKey === key) {
        this.state.inquiryProducts = [];
        this.state.cart = [];
        this.state.inquiryError =
          "Selected products could not be loaded. Please return to Specification Search and try again.";
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

  updateInquiryQuery() {
    const params = new URLSearchParams(location.search);
    params.delete("inquiry");
    this.state.inquiryProducts.forEach((product) =>
      params.append("inquiry", String(product.id)),
    );
    const query = params.toString();
    history.replaceState(
      {},
      "",
      `${location.pathname}${query ? `?${query}` : ""}${location.hash}`,
    );
    const key = this.state.inquiryProducts
      .map((product) => product.id)
      .join(",");
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
      metadata.index === false
        ? "noindex,follow"
        : "index,follow,max-image-preview:large",
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
    this.interactions.destroy();
    this.enhancements.destroy();
    this.cancelInquiryRequest();
    this.syncInquiryStateFromQuery();
    const pageSlots = pageRegistry.slotsForPath(location.pathname, this.state);
    this.root.innerHTML =
      siteHeader +
      pageRegistry.render(location.pathname, pageSlots) +
      siteFooter;
    this.syncPageMetadata();
    this.enhancements.initialize();
    this.interactions.initialize();
    window.SpecSearchApp?.initialize?.();
    if (location.pathname === this.routes.inquiry)
      void this.loadInquiryProducts();
    const hashTarget = location.hash
      ? document.getElementById(decodeURIComponent(location.hash.slice(1)))
      : null;
    if (hashTarget)
      hashTarget.scrollIntoView({ block: "start", behavior: "instant" });
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

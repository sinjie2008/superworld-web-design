import { exactSearchHref, MarketCatalog, specificationSearch } from "./market-catalog.js";

export class MarketApplicationController {
  constructor() {
    this.catalog = new MarketCatalog();
    this.listeners = null;
    this.root = null;
  }

  initialize() {
    if (this.listeners) return;
    this.root = document.querySelector("[data-market-systems]");
    if (!this.root) return;

    this.listeners = new AbortController();
    const { signal } = this.listeners;
    this.root.addEventListener("click", (event) => this.handleClick(event), { signal });
    this.root.addEventListener("keydown", (event) => this.handleKeys(event), { signal });
    this.root.addEventListener(
      "pointerover",
      (event) => {
        if (event.pointerType !== "mouse") return;
        const chip = event.target.closest("[data-series-path]");
        if (chip) void this.showSeries(chip);
      },
      { signal },
    );
    this.root.addEventListener(
      "focusin",
      (event) => {
        const chip = event.target.closest("[data-series-path]");
        if (chip && chip.matches(":focus-visible")) void this.showSeries(chip);
      },
      { signal },
    );

    for (const type of ["pointerout", "focusout"]) {
      this.root.addEventListener(
        type,
        (event) => {
          if (type === "pointerout" && event.pointerType !== "mouse") return;
          const row = event.target.closest(".mapping-row");
          if (row && !row.contains(event.relatedTarget)) this.restoreSeries(row);
        },
        { signal },
      );
    }
    for (const image of this.root.querySelectorAll(".system-hotspot-image.has-image > img")) {
      const fallback = () => {
        const stage = image.closest(".system-hotspot-stage");
        stage.querySelector(".has-image").hidden = true;
        stage.querySelector("[data-system-image-fallback]").hidden = false;
        stage.nextElementSibling.hidden = true;
      };
      image.addEventListener("error", fallback, { signal, once: true });
      if (image.complete && !image.naturalWidth) fallback();
    }

    const selected = this.root.querySelector(".system-tab-btn.active");
    const params = new URLSearchParams(location.search);
    if (params.get("system") !== selected.dataset.system) {
      params.set("system", selected.dataset.system);
      history.replaceState(history.state, "", location.pathname + "?" + params + location.hash);
    }
    this.loadPanel(this.panelFor(selected));
  }

  destroy() {
    this.listeners?.abort();
    this.listeners = null;
    this.root = null;
  }

  panelFor(tab) {
    return document.getElementById(tab.getAttribute("aria-controls"));
  }

  activate(tab) {
    if (tab.classList.contains("active")) return;
    for (const item of this.root.querySelectorAll(".system-tab-btn")) {
      const active = item === tab;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
      const panel = this.panelFor(item);
      panel.hidden = !active;
      panel.classList.toggle("active", active);
    }
    const params = new URLSearchParams(location.search);
    params.set("system", tab.dataset.system);
    history.pushState({}, "", location.pathname + "?" + params + location.hash);
    this.loadPanel(this.panelFor(tab));
  }

  loadPanel(panel) {
    for (const card of panel.querySelectorAll("[data-subapp-card]")) {
      const bundle = card.querySelector("[data-market-bundle]");
      if (!bundle) continue;
      const chips = [...card.querySelectorAll("[data-series-path]")];
      const paths = [...new Set(chips.map((chip) => chip.dataset.seriesPath))];
      const requests = new Map(
        paths.map((path) => [path, this.catalog.read(path).catch(() => null)]),
      );
      for (const chip of chips) {
        void requests.get(chip.dataset.seriesPath).then((series) => {
          if (!chip.isConnected || !series) return;
          chip.textContent = series.name;
          const row = chip.closest(".mapping-row");
          if (
            chip === row.querySelector("[data-series-path]") &&
            row.querySelector(".series-detail").hidden
          ) {
            this.setImage(row, series);
          }
        });
      }
      void Promise.all(requests.values()).then((series) => {
        if (!bundle.isConnected) return;
        const href = exactSearchHref(series.map((entry) => entry?.search));
        bundle.href = href ?? specificationSearch;
        bundle.textContent = href ? "View Bundle" : "Specification Search";
        bundle.title = href
          ? "Open the matching series in Specification Search"
          : "Browse available categories in Specification Search";
      });
    }
  }

  setImage(row, series) {
    const container = row.querySelector("[data-market-series-image]");
    if (container.dataset.image === (series.image ?? "")) return;
    const label = document.createElement("span");
    label.textContent = "Product image unavailable";
    container.dataset.image = series.image ?? "";
    if (!series.image) {
      container.replaceChildren(label);
      return;
    }
    const image = document.createElement("img");
    image.alt = series.name;
    image.loading = "lazy";
    image.addEventListener(
      "error",
      () => {
        if (container.firstElementChild === image) container.replaceChildren(label);
      },
      { once: true },
    );
    image.src = series.image;
    container.replaceChildren(image);
  }

  restoreSeries(row) {
    const pinned = row.querySelector("[data-series-path].is-selected");
    if (pinned) void this.showSeries(pinned);
    else this.hideSeries(row);
  }

  hideSeries(row) {
    const detail = row.querySelector(".series-detail");
    detail.hidden = true;
    delete detail.dataset.activeSeries;
    row.querySelectorAll("[data-series-path]").forEach((chip) => {
      chip.classList.remove("is-active");
      chip.setAttribute("aria-expanded", "false");
    });
  }

  async showSeries(chip, retry = false) {
    const row = chip.closest(".mapping-row");
    const detail = row.querySelector(".series-detail");
    const path = chip.dataset.seriesPath;
    if (!retry && !detail.hidden && detail.dataset.activeSeries === path) return;

    row.querySelectorAll("[data-series-path]").forEach((item) => {
      item.classList.toggle("is-active", item === chip);
      item.setAttribute("aria-expanded", String(item === chip));
    });
    detail.dataset.activeSeries = path;
    detail.hidden = false;
    detail.textContent = "Loading series information…";
    const isCurrent = () =>
      detail.isConnected && !detail.hidden && detail.dataset.activeSeries === path;

    try {
      const [series, sample] = await Promise.all([
        this.catalog.read(path),
        this.catalog.read(path, "/parts").catch(() => null),
      ]);
      if (!isCurrent()) return;
      this.setImage(row, series);
      const name = document.createElement("strong");
      name.textContent = series.name;
      const dimensions = document.createElement("span");
      dimensions.textContent = sample?.dimensions
        ? sample.sku + " dimensions: " + sample.dimensions.join(" × ") + " mm (L × W × H)"
        : "Catalog dimensions unavailable";
      const specification = document.createElement(series.datasheet ? "a" : "span");
      if (series.datasheet) {
        specification.href = series.datasheet;
        specification.target = "_blank";
        specification.rel = "noopener";
        specification.textContent = "Series datasheet";
      } else specification.textContent = "Series datasheet unavailable";
      detail.replaceChildren(name, dimensions, specification);
    } catch {
      if (!isCurrent()) return;
      const retryButton = document.createElement("button");
      retryButton.type = "button";
      retryButton.className = "series-chip";
      retryButton.dataset.retrySeries = "";
      retryButton.textContent = "Retry";
      detail.replaceChildren("Series information is temporarily unavailable.", retryButton);
    }
  }

  setCard(card, open) {
    const panel = card.querySelector(".subapp-panel");
    card.classList.toggle("is-open", open);
    panel.classList.toggle("is-open", open);
    panel.hidden = !open;
    card.querySelector(".subapp-trigger").setAttribute("aria-expanded", String(open));
    const icon = card.querySelector(".accordion-icon");
    icon.textContent = open ? "−" : "+";
    icon.setAttribute("aria-expanded", String(open));
  }

  handleKeys(event) {
    const tab = event.target.closest(".system-tab-btn");
    if (tab) {
      const tabs = [...this.root.querySelectorAll(".system-tab-btn")];
      const index = tabs.indexOf(tab);
      const offsets = { ArrowRight: 1, ArrowLeft: -1 };
      const next =
        event.key === "Home"
          ? tabs[0]
          : event.key === "End"
            ? tabs[tabs.length - 1]
            : offsets[event.key]
              ? tabs[(index + offsets[event.key] + tabs.length) % tabs.length]
              : null;
      if (next) {
        event.preventDefault();
        this.activate(next);
        next.focus();
      }
    }
    const detail = event.target.closest(".mapping-row")?.querySelector(".series-detail");
    if (detail && !detail.hidden && event.key === "Escape") {
      const row = detail.closest(".mapping-row");
      const chip = row.querySelector(".series-chip.is-active");
      chip?.classList.remove("is-selected");
      chip?.focus();
      this.hideSeries(row);
    }
  }

  handleClick(event) {
    const tab = event.target.closest(".system-tab-btn");
    if (tab) {
      this.activate(tab);
      return;
    }

    const hotspot = event.target.closest("[data-open-card]");
    if (hotspot) {
      const card = document.getElementById(hotspot.dataset.openCard);
      if (!card || !hotspot.closest(".system-panel").contains(card)) return;
      event.preventDefault();
      this.setCard(card, true);
      card.querySelector(".subapp-trigger").focus({ preventScroll: true });
      card.scrollIntoView({
        block: "start",
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth",
      });
      return;
    }

    const toolbar = event.target.closest(".show-all-btn, .collapse-all-btn");
    if (toolbar) {
      toolbar
        .closest(".system-panel")
        .querySelectorAll("[data-subapp-card]")
        .forEach((card) => this.setCard(card, toolbar.classList.contains("show-all-btn")));
      return;
    }

    const toggle = event.target.closest(".subapp-trigger, .accordion-icon");
    if (toggle) {
      const card = toggle.closest("[data-subapp-card]");
      this.setCard(card, !card.classList.contains("is-open"));
      return;
    }

    const chip = event.target.closest("[data-series-path]");
    if (chip) {
      const row = chip.closest(".mapping-row");
      const select = !chip.classList.contains("is-selected");
      row
        .querySelectorAll("[data-series-path]")
        .forEach((item) => item.classList.toggle("is-selected", item === chip && select));
      if (select) void this.showSeries(chip);
      else this.hideSeries(row);
      return;
    }

    const retry = event.target.closest("[data-retry-series]");
    if (retry) {
      const active = retry.closest(".mapping-row").querySelector(".series-chip.is-active");
      if (active) {
        active.focus();
        void this.showSeries(active, true);
      }
    }
  }
}

const COMMUNICATION_SYSTEM_ORDER = Object.freeze(["server", "router", "settopbox"]);

class CarouselWidget {
  constructor(root) {
    this.root = root;
    this.track = root.querySelector(".carousel-track");
    this.windowElement = root.querySelector(".carousel-window");
    this.slides = [...root.querySelectorAll(".slide")];
    this.dots = root.querySelector(".carousel-dots");
    this.configuredVisible = 1;
    this.index = 0;
    this.timer = 0;
    this.abortController = null;
    this.mounted = false;
    this.handlePrevious = () => this.move(-1);
    this.handleNext = () => this.move(1);
    this.handleDots = this.handleDots.bind(this);
    this.update = this.update.bind(this);
  }

  visibleCount() {
    if (window.innerWidth <= 560) return 1;
    if (window.innerWidth <= 820) return Math.min(2, this.configuredVisible);
    return this.configuredVisible;
  }

  maxIndex() {
    return Math.max(0, this.slides.length - this.visibleCount());
  }

  renderDots() {
    if (!this.dots) return;
    this.dots.innerHTML = Array.from(
      { length: this.maxIndex() + 1 },
      (_, index) =>
        `<button class="carousel-dot ${index === this.index ? "is-active" : ""}" type="button" data-dot="${index}" aria-label="Go to slide ${index + 1}"></button>`,
    ).join("");
  }

  update() {
    if (!this.mounted || !this.root.isConnected || !this.windowElement) return;
    this.index = Math.min(this.index, this.maxIndex());
    const gap = 22;
    const visible = this.visibleCount();
    const cardWidth = (this.windowElement.clientWidth - gap * (visible - 1)) / visible;
    this.track.style.transform = `translateX(-${this.index * (cardWidth + gap)}px)`;
    this.renderDots();
  }

  move(delta) {
    if (!this.mounted) return;
    this.index += delta;
    if (this.index > this.maxIndex()) this.index = 0;
    if (this.index < 0) this.index = this.maxIndex();
    this.update();
  }

  handleDots(event) {
    const button = event.target.closest("[data-dot]");
    if (!button) return;
    this.index = Number(button.dataset.dot);
    this.update();
  }

  mount() {
    if (this.mounted || !this.track || this.slides.length < 2) return this;
    this.mounted = true;
    this.configuredVisible = Number(getComputedStyle(this.root).getPropertyValue("--visible")) || 1;
    this.abortController = new AbortController();
    const options = { signal: this.abortController.signal };
    this.root.querySelector("[data-prev]")?.addEventListener("click", this.handlePrevious, options);
    this.root.querySelector("[data-next]")?.addEventListener("click", this.handleNext, options);
    this.dots?.addEventListener("click", this.handleDots, options);
    window.addEventListener("resize", this.update, {
      passive: true,
      signal: this.abortController.signal,
    });
    this.timer = window.setInterval(() => this.move(1), 4500);
    this.update();
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    this.mounted = false;
    window.clearInterval(this.timer);
    this.timer = 0;
    this.abortController?.abort();
    this.abortController = null;
    return this;
  }
}

class CarouselController {
  constructor() {
    this.widgets = [];
    this.mounted = false;
  }

  initialize() {
    if (this.mounted) return this;
    this.mounted = true;
    this.widgets = [...document.querySelectorAll("[data-carousel]:not(.company-product-carousel)")]
      .map((root) => new CarouselWidget(root))
      .filter((widget) => widget.track && widget.slides.length > 1);
    this.widgets.forEach((widget) => widget.mount());
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    this.widgets.forEach((widget) => widget.destroy());
    this.widgets = [];
    this.mounted = false;
    return this;
  }
}

class CommunicationController {
  constructor(context) {
    Object.assign(this, context);
    this.communicationSystemOrder = COMMUNICATION_SYSTEM_ORDER;
    this.cleanups = [];
    this.timers = [];
    this.mounted = false;
  }

  setupCommunicationSystemTabs() {
    const { communicationSystemOrder, navigate } = this;
    const root = document.getElementById("systemTabsRoot");
    if (!root || root.dataset.systemTabsReady === "true") return;
    root.dataset.systemTabsReady = "true";
    const hasSystemTabs = Boolean(root.querySelector(".system-tabs-nav"));
    const renderSeriesDetail = (row, activeChip) => {
      row.querySelectorAll(".series-chip").forEach((chip) => {
        chip.classList.toggle("is-active", chip === activeChip);
        chip.setAttribute("aria-expanded", String(chip === activeChip));
      });
      const detail = row.querySelector(".series-detail");
      if (detail) detail.hidden = !activeChip;
    };
    const setCardState = (card, open) => {
      const panel = card.querySelector(".subapp-panel");
      const trigger = card.querySelector(".subapp-trigger");
      const icon = card.querySelector(".accordion-icon");
      card.classList.toggle("is-open", open);
      panel?.classList.toggle("is-open", open);
      if (panel) panel.hidden = !open;
      trigger?.setAttribute("aria-expanded", String(open));
      if (icon) icon.textContent = open ? "−" : "+";
    };
    const activateSystem = (system, updateQuery = false) => {
      root.querySelectorAll(".system-tab-btn").forEach((button) => {
        const active = button.dataset.system === system;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
      });
      root.querySelectorAll(".system-panel").forEach((panel) => {
        const active = panel.dataset.systemPanel === system;
        panel.classList.toggle("active", active);
        panel.hidden = !active;
      });
      if (updateQuery) {
        const params = new URLSearchParams(location.search);
        params.set("system", system);
        const nextUrl = `${location.pathname}?${params}${location.hash}`;
        if (nextUrl !== `${location.pathname}${location.search}${location.hash}`)
          history.pushState({}, "", nextUrl);
      }
    };
    if (hasSystemTabs) {
      const requestedSystem = new URLSearchParams(location.search).get("system");
      const initialSystem = communicationSystemOrder.includes(requestedSystem)
        ? requestedSystem
        : "server";
      activateSystem(initialSystem);
      if (requestedSystem !== initialSystem) {
        const params = new URLSearchParams(location.search);
        params.set("system", initialSystem);
        history.replaceState({}, "", `${location.pathname}?${params}${location.hash}`);
      }
    } else {
      const params = new URLSearchParams(location.search);
      const requestedApplication = params.get("application");
      const requestedCard = requestedApplication
        ? document.getElementById(`automotive-${requestedApplication}`)
        : null;
      const validCard = Boolean(
        requestedCard && root.contains(requestedCard) && requestedCard.matches(".subapp-card"),
      );
      if (validCard) {
        root
          .querySelectorAll(".subapp-card")
          .forEach((card) => setCardState(card, card === requestedCard));
        requestAnimationFrame(() =>
          requestedCard.scrollIntoView({ behavior: "instant", block: "start" }),
        );
      }
      const hadSystem = params.has("system");
      const removedInvalidApplication = Boolean(requestedApplication && !validCard);
      params.delete("system");
      if (removedInvalidApplication) params.delete("application");
      if (hadSystem || removedInvalidApplication) {
        const query = params.toString();
        history.replaceState(
          {},
          "",
          `${location.pathname}${query ? `?${query}` : ""}${location.hash}`,
        );
      }
    }
    root.querySelectorAll(".mapping-row").forEach((row) => {
      const restorePinnedDetail = () =>
        renderSeriesDetail(row, row.querySelector(".series-chip.is-selected"));
      row.addEventListener("pointerover", (event) => {
        const chip = event.target.closest(".series-chip");
        if (chip) renderSeriesDetail(row, chip);
      });
      row.addEventListener("pointerleave", restorePinnedDetail);
      row.addEventListener("focusin", (event) => {
        const chip = event.target.closest(".series-chip");
        if (chip) renderSeriesDetail(row, chip);
      });
      row.addEventListener("focusout", (event) => {
        if (!row.contains(event.relatedTarget)) restorePinnedDetail();
      });
    });
    root.addEventListener("click", (event) => {
      const seriesChip = event.target.closest(".series-chip");
      if (seriesChip) {
        const row = seriesChip.closest(".mapping-row");
        const selected = !seriesChip.classList.contains("is-selected");
        row
          .querySelectorAll(".series-chip")
          .forEach((chip) => chip.classList.remove("is-selected"));
        if (selected) seriesChip.classList.add("is-selected");
        renderSeriesDetail(row, selected ? seriesChip : null);
        return;
      }
      const tab = event.target.closest(".system-tab-btn");
      if (tab) {
        activateSystem(tab.dataset.system, true);
        return;
      }
      const hotspot = event.target.closest("[data-open-card]");
      if (hotspot) {
        event.preventDefault();
        const panel = hotspot.closest(".system-panel");
        const card = panel?.querySelector(`#${hotspot.dataset.openCard}`);
        if (card) {
          setCardState(card, true);
          card.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        return;
      }
      const toggle = event.target.closest(".subapp-trigger,.accordion-icon");
      if (toggle) {
        event.preventDefault();
        const card = toggle.closest(".subapp-card");
        if (card) setCardState(card, !card.classList.contains("is-open"));
        return;
      }
      const showAll = event.target.closest(".show-all-btn");
      if (showAll) {
        showAll
          .closest(".system-panel")
          ?.querySelectorAll(".subapp-card")
          .forEach((card) => setCardState(card, true));
        return;
      }
      const collapseAll = event.target.closest(".collapse-all-btn");
      if (collapseAll)
        collapseAll
          .closest(".system-panel")
          ?.querySelectorAll(".subapp-card")
          .forEach((card) => setCardState(card, false));
    });
  }

  initialize() {
    if (this.mounted) return this;
    this.mounted = true;
    this.setupCommunicationSystemTabs();
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    this.mounted = false;
    this.timers.forEach((timer) => window.clearInterval(timer));
    this.timers = [];
    this.cleanups
      .splice(0)
      .reverse()
      .forEach((cleanup) => cleanup());
    return this;
  }
}

class MegaNewsSliderWidget {
  constructor(root) {
    this.root = root;
    this.windowElement = root.querySelector(".mega-news-window");
    this.track = root.querySelector(".mega-news-track");
    this.slides = [...root.querySelectorAll(".mega-news-card")];
    this.index = 0;
    this.abortController = null;
    this.mounted = false;
    this.handlePrevious = () => this.move(-1);
    this.handleNext = () => this.move(1);
    this.update = this.update.bind(this);
  }

  visibleCount() {
    return window.innerWidth <= 560 ? 1 : 2;
  }

  maxIndex() {
    return Math.max(0, this.slides.length - this.visibleCount());
  }

  update() {
    if (!this.mounted || !this.root.isConnected) return;
    this.index = Math.min(this.index, this.maxIndex());
    const gap = 22;
    const visible = this.visibleCount();
    const cardWidth = (this.windowElement.clientWidth - gap * (visible - 1)) / visible;
    this.slides.forEach((slide) => (slide.style.flexBasis = `${cardWidth}px`));
    this.track.style.transform = `translateX(-${this.index * (cardWidth + gap)}px)`;
  }

  move(delta) {
    this.index += delta;
    if (this.index > this.maxIndex()) this.index = 0;
    if (this.index < 0) this.index = this.maxIndex();
    this.update();
  }

  mount() {
    if (this.mounted || !this.windowElement || !this.track) return this;
    this.mounted = true;
    this.abortController = new AbortController();
    const options = { signal: this.abortController.signal };
    this.root
      .querySelector("[data-mega-news-prev]")
      ?.addEventListener("click", this.handlePrevious, options);
    this.root
      .querySelector("[data-mega-news-next]")
      ?.addEventListener("click", this.handleNext, options);
    this.root.addEventListener("mega:open", this.update, options);
    window.addEventListener("resize", this.update, {
      passive: true,
      signal: this.abortController.signal,
    });
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    this.abortController?.abort();
    this.abortController = null;
    this.mounted = false;
    return this;
  }
}

class HeaderController {
  constructor() {
    this.cleanups = [];
    this.timers = [];
    this.sliders = [];
    this.mounted = false;
  }

  setupHeaderNavigation() {
    const state = this;
    document.querySelector(".mobile-toggle")?.addEventListener("click", (e) => {
      const header = document.querySelector(".site-header");
      header.classList.toggle("mobile-open");
      e.currentTarget.setAttribute(
        "aria-expanded",
        String(header.classList.contains("mobile-open")),
      );
    });
    document.querySelectorAll("[data-menu]").forEach((btn) =>
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const name = btn.dataset.menu;
        const panel = document.querySelector(`[data-panel="${name}"]`);
        document.querySelectorAll(".mega-panel").forEach((p) => {
          if (p !== panel) p.classList.remove("is-open");
        });
        panel?.classList.toggle("is-open");
        if (panel?.classList.contains("is-open"))
          panel
            .querySelector("[data-mega-news-slider]")
            ?.dispatchEvent(new CustomEvent("mega:open"));
      }),
    );
    const closeMegaPanels = () =>
      document
        .querySelectorAll(".mega-panel")
        .forEach((panel) => panel.classList.remove("is-open"));
    document.addEventListener("click", closeMegaPanels, { once: true });
    state.cleanups.push(() => document.removeEventListener("click", closeMegaPanels));
    document
      .querySelectorAll(".mega-panel")
      .forEach((p) => p.addEventListener("click", (e) => e.stopPropagation()));
    this.sliders = [...document.querySelectorAll("[data-mega-news-slider]")].map(
      (root) => new MegaNewsSliderWidget(root),
    );
    this.sliders.forEach((slider) => slider.mount());
    document.querySelectorAll("[data-language]").forEach((a) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        alert(
          `${a.dataset.language} is shown as a wireframe option. Translation will be added in the content phase.`,
        );
      }),
    );
  }

  initialize() {
    if (this.mounted) return this;
    this.mounted = true;
    this.setupHeaderNavigation();
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    this.mounted = false;
    this.sliders.forEach((slider) => slider.destroy());
    this.sliders = [];
    this.timers.forEach((timer) => window.clearInterval(timer));
    this.timers = [];
    this.cleanups
      .splice(0)
      .reverse()
      .forEach((cleanup) => cleanup());
    return this;
  }
}

class GeneralPageController {
  constructor() {
    this.cleanups = [];
    this.timers = [];
    this.mounted = false;
  }

  setupMarketCards() {
    const marketAllButton = document.querySelector("[data-market-all]");
    const syncMarketAllLabel = () => {
      if (marketAllButton) {
        const cards = [...document.querySelectorAll(".market-card")];
        marketAllButton.textContent =
          cards.length && cards.every((card) => card.classList.contains("is-open"))
            ? "Collapse All"
            : "View All";
      }
    };
    const setMarketCardState = (card, open) => {
      card.classList.toggle("is-open", open);
      card
        .querySelectorAll(".market-toggle,.market-state-toggle")
        .forEach((control) => control.setAttribute("aria-expanded", String(open)));
      const name = card.querySelector(".market-summary h3")?.textContent || "market";
      card
        .querySelector(".market-state-toggle")
        ?.setAttribute("aria-label", `${open ? "Close" : "Open"} ${name} details`);
    };
    marketAllButton?.addEventListener("click", () => {
      const cards = [...document.querySelectorAll(".market-card")];
      const allOpen = cards.every((c) => c.classList.contains("is-open"));
      cards.forEach((card) => setMarketCardState(card, !allOpen));
      syncMarketAllLabel();
    });
    document.querySelectorAll(".market-toggle,.market-state-toggle").forEach((btn) =>
      btn.addEventListener("click", () => {
        const card = btn.closest(".market-card");
        setMarketCardState(card, !card.classList.contains("is-open"));
        syncMarketAllLabel();
      }),
    );
    document.querySelectorAll("[data-market-card]").forEach((card) => {
      const input = card.querySelector("[data-market-search]");
      const action = card.querySelector("[data-market-search-action]");
      const items = [...card.querySelectorAll("[data-market-item]")];
      const empty = card.querySelector("[data-market-no-results]");
      const applyMarketSearch = () => {
        const query = input.value.trim().toLowerCase();
        let visibleCount = 0;
        items.forEach((item) => {
          const visible = !query || item.textContent.toLowerCase().includes(query);
          item.hidden = !visible;
          if (visible) visibleCount += 1;
        });
        action.classList.toggle("is-clear", Boolean(query));
        action.setAttribute(
          "aria-label",
          query
            ? `Clear ${card.querySelector(".market-summary h3")?.textContent || "market"} search`
            : `Focus ${card.querySelector(".market-summary h3")?.textContent || "market"} search`,
        );
        if (empty) empty.hidden = visibleCount !== 0;
      };
      input?.addEventListener("input", applyMarketSearch);
      input?.addEventListener("search", applyMarketSearch);
      action?.addEventListener("click", () => {
        if (input.value) {
          input.value = "";
          applyMarketSearch();
        }
        input.focus();
      });
      applyMarketSearch();
    });
  }

  setupGeneralControls() {
    document.querySelectorAll(".accordion-head").forEach((btn) =>
      btn.addEventListener("click", () => {
        const box = btn.closest(".accordion");
        box.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", String(box.classList.contains("is-open")));
        const symbol = btn.querySelector(".accordion-symbol");
        if (symbol) symbol.textContent = box.classList.contains("is-open") ? "−" : "+";
      }),
    );
    document.querySelectorAll("[data-accordion-all]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const open = btn.dataset.accordionAll === "open";
        document.querySelectorAll(".accordion").forEach((box) => {
          box.classList.toggle("is-open", open);
          box.querySelector(".accordion-head")?.setAttribute("aria-expanded", String(open));
          const s = box.querySelector(".accordion-symbol");
          if (s) s.textContent = open ? "−" : "+";
        });
      }),
    );
    document.querySelectorAll(".lab-tab").forEach((btn) =>
      btn.addEventListener("click", () => {
        document.querySelectorAll(".lab-tab").forEach((b) => b.classList.remove("is-active"));
        btn.classList.add("is-active");
      }),
    );
    document
      .querySelectorAll("[data-scroll-target]")
      .forEach((btn) =>
        btn.addEventListener("click", () =>
          document.getElementById(btn.dataset.scrollTarget)?.scrollIntoView({ behavior: "smooth" }),
        ),
      );
    document.querySelectorAll(".category-check").forEach((c) =>
      c.addEventListener("change", () => {
        const count = document.querySelectorAll(".category-check:checked").length;
        const label = document.querySelector("[data-selected-count]");
        if (label) label.textContent = `${count} selected`;
      }),
    );
    document.querySelector("[data-clear-filters]")?.addEventListener("click", () => {
      document
        .querySelectorAll(".search-block input[type=checkbox]")
        .forEach((c) => (c.checked = false));
      const l = document.querySelector("[data-selected-count]");
      if (l) l.textContent = "0 selected";
    });
    document
      .querySelector("[data-spec-search]")
      ?.addEventListener("click", () =>
        alert("Wireframe search applied. The results table below represents the result state."),
      );
  }

  setupPagination() {
    document.querySelectorAll("[data-page]").forEach((btn) =>
      btn.addEventListener("click", () => {
        document.querySelectorAll("[data-page]").forEach((b) => {
          b.style.background = "#fff";
          b.style.color = "#111";
        });
        btn.style.background = "#111";
        btn.style.color = "#fff";
      }),
    );
  }

  initialize() {
    if (this.mounted) return this;
    this.mounted = true;
    this.setupMarketCards();
    this.setupGeneralControls();
    this.setupPagination();
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    this.mounted = false;
    this.timers.forEach((timer) => window.clearInterval(timer));
    this.timers = [];
    this.cleanups
      .splice(0)
      .reverse()
      .forEach((cleanup) => cleanup());
    return this;
  }
}

class InquiryController {
  constructor(context) {
    Object.assign(this, context);
    this.cleanups = [];
    this.timers = [];
    this.mounted = false;
  }

  setupInquiryControls() {
    const { navigate, removeInquiryItem, render, routes, state } = this;
    document.querySelectorAll("[data-qty]").forEach((btn) =>
      btn.addEventListener("click", () => {
        const i = Number(btn.dataset.qty);
        const quantity = state.cart[i] + Number(btn.dataset.delta);
        if (quantity <= 0) {
          removeInquiryItem(i);
          return;
        }
        state.cart[i] = quantity;
        render(false);
      }),
    );
    document
      .querySelectorAll("[data-remove]")
      .forEach((btn) =>
        btn.addEventListener("click", () => removeInquiryItem(Number(btn.dataset.remove))),
      );
    document.querySelector("[data-back]")?.addEventListener("click", () => history.back());
    document.querySelector("[data-inquiry-form]")?.addEventListener("submit", (e) => {
      e.preventDefault();
      navigate(routes.thanks);
    });
  }

  initialize() {
    if (this.mounted) return this;
    this.mounted = true;
    this.setupInquiryControls();
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    this.mounted = false;
    this.timers.forEach((timer) => window.clearInterval(timer));
    this.timers = [];
    this.cleanups
      .splice(0)
      .reverse()
      .forEach((cleanup) => cleanup());
    return this;
  }
}

class SupportController {
  constructor(context) {
    Object.assign(this, context);
    this.cleanups = [];
    this.timers = [];
    this.mounted = false;
    this.supportLocationTimer = 0;
    this.supportLocationHoverPaused = false;
    this.supportLocationFocusPaused = false;
  }

  setupSupportControls() {
    const { navigate, render, routes } = this;
    const state = this;
    document.querySelector("[data-support-request-type]")?.addEventListener("change", (event) => {
      history.replaceState(
        {},
        "",
        `${routes.support}?type=${encodeURIComponent(event.currentTarget.value)}`,
      );
      render(false);
    });
    const supportCategory = document.querySelector("[data-support-category]");
    if (supportCategory) {
      const trigger = supportCategory.querySelector("[data-support-category-trigger]");
      const panel = supportCategory.querySelector("[data-support-category-panel]");
      const search = supportCategory.querySelector("[data-support-category-search]");
      const summary = supportCategory.querySelector("[data-support-category-summary]");
      const checkboxes = [
        ...supportCategory.querySelectorAll("[data-support-category-option] input[type=checkbox]"),
      ];
      const otherCheckbox = supportCategory.querySelector("[data-support-category-other]");
      const otherField = supportCategory.querySelector("[data-support-category-other-field]");
      const otherInput = supportCategory.querySelector("[data-support-category-other-input]");
      const setCategoryOpen = (open) => {
        panel.hidden = !open;
        trigger.setAttribute("aria-expanded", String(open));
        supportCategory.classList.toggle("is-open", open);
        if (open) window.requestAnimationFrame(() => search.focus());
      };
      const updateCategorySummary = () => {
        const selected = checkboxes.filter((input) => input.checked).map((input) => input.value);
        summary.textContent =
          selected.length === 0
            ? "Select product categories"
            : selected.length <= 2
              ? selected.join(", ")
              : `${selected.length} product categories selected`;
        const showOther = Boolean(otherCheckbox?.checked);
        if (otherField) otherField.hidden = !showOther;
        if (otherInput) {
          otherInput.disabled = !showOther;
          otherInput.required = showOther;
        }
        checkboxes.forEach((checkbox) => {
          const option = checkbox.closest("[data-support-category-option]");
          const detail = option?.querySelector("[data-support-category-detail]");
          const detailInput = option?.querySelector("[data-support-category-detail-input]");
          if (detail) detail.hidden = !checkbox.checked;
          if (detailInput) detailInput.disabled = !checkbox.checked;
        });
      };
      const filterCategories = () => {
        const query = search.value.trim().toLowerCase();
        let visible = 0;
        supportCategory.querySelectorAll("[data-support-category-group]").forEach((group) => {
          let groupVisible = 0;
          group.querySelectorAll("[data-support-category-option]").forEach((option) => {
            const show = !query || option.textContent.toLowerCase().includes(query);
            option.hidden = !show;
            if (show) {
              groupVisible += 1;
              visible += 1;
            }
          });
          group.hidden = groupVisible === 0;
        });
        const empty = supportCategory.querySelector("[data-support-category-empty]");
        if (empty) empty.hidden = visible !== 0;
      };
      const handleCategoryDocumentClick = (event) => {
        if (!supportCategory.contains(event.target)) setCategoryOpen(false);
      };
      trigger.addEventListener("click", () => setCategoryOpen(panel.hidden));
      search.addEventListener("input", filterCategories);
      supportCategory.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !panel.hidden) {
          event.preventDefault();
          setCategoryOpen(false);
          trigger.focus();
        }
      });
      checkboxes.forEach((checkbox) =>
        checkbox.addEventListener("change", () => {
          updateCategorySummary();
          if (checkbox === otherCheckbox && checkbox.checked) {
            setCategoryOpen(false);
            window.requestAnimationFrame(() => otherInput?.focus());
            return;
          }
          if (checkbox.checked)
            window.requestAnimationFrame(() =>
              checkbox
                .closest("[data-support-category-option]")
                ?.querySelector("[data-support-category-detail-input]")
                ?.focus(),
            );
        }),
      );
      document.addEventListener("click", handleCategoryDocumentClick);
      state.cleanups.push(() => document.removeEventListener("click", handleCategoryDocumentClick));
      updateCategorySummary();
      filterCategories();
    }
    const supportFile = document.querySelector("[data-support-file]");
    supportFile?.addEventListener("change", () => {
      const file = supportFile.files?.[0];
      const name = document.querySelector("[data-support-file-name]");
      const status = document.querySelector("[data-support-file-status]");
      if (file && file.size > 6 * 1024 * 1024) {
        supportFile.value = "";
        if (name) name.textContent = "No file selected";
        if (status) {
          status.textContent = "This file is larger than 6 MB. Please choose a smaller file.";
          status.classList.add("is-error");
        }
        return;
      }
      if (name) name.textContent = file?.name || "No file selected";
      if (status) {
        status.textContent = "Maximum allowed file size is 6 MB";
        status.classList.remove("is-error");
      }
    });
    document.querySelector("[data-support-form]")?.addEventListener("submit", (event) => {
      event.preventDefault();
      navigate(routes.thanks);
    });
    const supportLocationGrid = document.querySelector("[data-support-location-grid]");
    const supportLocationPrev = document.querySelector("[data-support-location-prev]");
    const supportLocationNext = document.querySelector("[data-support-location-next]");
    if (supportLocationGrid && supportLocationPrev && supportLocationNext) {
      const supportLocationCards = [
        ...supportLocationGrid.querySelectorAll("[data-support-location-card]"),
      ];
      const supportLocationSection = supportLocationGrid.closest(".support-locations");
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      this.supportLocationTimer = 0;
      this.supportLocationHoverPaused = false;
      this.supportLocationFocusPaused = false;
      const sliderMetrics = () => {
        const card = supportLocationCards[0];
        const gap = parseFloat(getComputedStyle(supportLocationGrid).columnGap) || 0;
        const step = (card?.getBoundingClientRect().width || supportLocationGrid.clientWidth) + gap;
        const visible = Math.max(1, Math.round((supportLocationGrid.clientWidth + gap) / step));
        const maxScroll = Math.max(
          0,
          supportLocationGrid.scrollWidth - supportLocationGrid.clientWidth,
        );
        return { step, visible, maxScroll };
      };
      const updateSupportLocationControls = () => {
        const { maxScroll } = sliderMetrics();
        supportLocationPrev.disabled = supportLocationGrid.scrollLeft <= 2;
        supportLocationNext.disabled = supportLocationGrid.scrollLeft >= maxScroll - 2;
      };
      const moveSupportLocations = (direction) => {
        if (!this.mounted || !supportLocationGrid.isConnected) return;
        const { step, maxScroll } = sliderMetrics();
        const atStart = supportLocationGrid.scrollLeft <= 2;
        const atEnd = supportLocationGrid.scrollLeft >= maxScroll - 2;
        if (direction > 0 && atEnd) {
          supportLocationGrid.scrollTo({ left: 0, behavior: "smooth" });
          return;
        }
        if (direction < 0 && atStart) {
          supportLocationGrid.scrollTo({ left: maxScroll, behavior: "smooth" });
          return;
        }
        supportLocationGrid.scrollBy({
          left: step * direction,
          behavior: "smooth",
        });
      };
      const stopSupportLocationAuto = () => {
        window.clearInterval(this.supportLocationTimer);
        this.supportLocationTimer = 0;
      };
      const startSupportLocationAuto = () => {
        stopSupportLocationAuto();
        if (
          !this.mounted ||
          reducedMotion ||
          this.supportLocationHoverPaused ||
          this.supportLocationFocusPaused ||
          document.hidden ||
          supportLocationCards.length < 2
        )
          return;
        this.supportLocationTimer = window.setInterval(() => moveSupportLocations(1), 4500);
      };
      const resetSupportLocationAuto = () => {
        stopSupportLocationAuto();
        startSupportLocationAuto();
      };
      const onSupportLocationScroll = () =>
        window.requestAnimationFrame(updateSupportLocationControls);
      const onSupportLocationResize = () => {
        updateSupportLocationControls();
        resetSupportLocationAuto();
      };
      const onSupportLocationPointerEnter = () => {
        this.supportLocationHoverPaused = true;
        stopSupportLocationAuto();
      };
      const onSupportLocationPointerLeave = () => {
        this.supportLocationHoverPaused = false;
        startSupportLocationAuto();
      };
      const onSupportLocationFocusIn = () => {
        this.supportLocationFocusPaused = true;
        stopSupportLocationAuto();
      };
      const onSupportLocationFocusOut = (event) => {
        if (supportLocationSection?.contains(event.relatedTarget)) return;
        this.supportLocationFocusPaused = false;
        startSupportLocationAuto();
      };
      const onSupportLocationVisibility = () => {
        if (document.hidden) stopSupportLocationAuto();
        else startSupportLocationAuto();
      };
      supportLocationPrev.addEventListener("click", () => {
        moveSupportLocations(-1);
        resetSupportLocationAuto();
      });
      supportLocationNext.addEventListener("click", () => {
        moveSupportLocations(1);
        resetSupportLocationAuto();
      });
      supportLocationGrid.addEventListener("scroll", onSupportLocationScroll, {
        passive: true,
      });
      supportLocationSection?.addEventListener("pointerenter", onSupportLocationPointerEnter);
      supportLocationSection?.addEventListener("pointerleave", onSupportLocationPointerLeave);
      supportLocationSection?.addEventListener("focusin", onSupportLocationFocusIn);
      supportLocationSection?.addEventListener("focusout", onSupportLocationFocusOut);
      document.addEventListener("visibilitychange", onSupportLocationVisibility);
      window.addEventListener("resize", onSupportLocationResize, {
        passive: true,
      });
      state.cleanups.push(() => {
        stopSupportLocationAuto();
        supportLocationGrid.removeEventListener("scroll", onSupportLocationScroll);
        supportLocationSection?.removeEventListener("pointerenter", onSupportLocationPointerEnter);
        supportLocationSection?.removeEventListener("pointerleave", onSupportLocationPointerLeave);
        supportLocationSection?.removeEventListener("focusin", onSupportLocationFocusIn);
        supportLocationSection?.removeEventListener("focusout", onSupportLocationFocusOut);
        document.removeEventListener("visibilitychange", onSupportLocationVisibility);
        window.removeEventListener("resize", onSupportLocationResize);
      });
      updateSupportLocationControls();
      startSupportLocationAuto();
    }
  }

  initialize() {
    if (this.mounted) return this;
    this.mounted = true;
    this.setupSupportControls();
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    this.mounted = false;
    this.timers.forEach((timer) => window.clearInterval(timer));
    this.timers = [];
    this.cleanups
      .splice(0)
      .reverse()
      .forEach((cleanup) => cleanup());
    return this;
  }
}

class LocationsController {
  constructor() {
    this.cleanups = [];
    this.timers = [];
    this.mounted = false;
    this.activeLocationFilter = "all";
  }

  locationCategoryFromQuery() {
    const category = new URLSearchParams(location.search).get("category");
    return ["office", "agent", "distributor"].includes(category) ? category : "all";
  }

  setupLocationFilters() {
    const locationSearch = document.querySelector("[data-location-search]");
    const locationFilterButtons = [...document.querySelectorAll("[data-location-filter]")];
    const locationGroups = [...document.querySelectorAll("[data-location-group]")];
    const locationCards = [...document.querySelectorAll("[data-location-groups] .location-card")];
    this.activeLocationFilter = this.locationCategoryFromQuery();
    const applyLocationFilters = () => {
      const query = locationSearch?.value.trim().toLowerCase() || "";
      let visibleCount = 0;
      locationCards.forEach((card) => {
        const typeMatches =
          this.activeLocationFilter === "all" ||
          card.dataset.locationType === this.activeLocationFilter;
        const searchMatches = !query || card.textContent.toLowerCase().includes(query);
        const visible = typeMatches && searchMatches;
        card.hidden = !visible;
        if (visible) visibleCount += 1;
      });
      locationGroups.forEach((group) => {
        const hasVisibleCards = [...group.querySelectorAll(".location-card")].some(
          (card) => !card.hidden,
        );
        group.hidden = !hasVisibleCards;
      });
      const empty = document.querySelector("[data-location-empty]");
      if (empty) empty.hidden = visibleCount !== 0;
    };
    const updateLocationCategoryQuery = () => {
      const params = new URLSearchParams(location.search);
      if (this.activeLocationFilter === "all") params.delete("category");
      else params.set("category", this.activeLocationFilter);
      const query = params.toString();
      const nextUrl = `${location.pathname}${query ? `?${query}` : ""}${location.hash}`;
      const currentUrl = `${location.pathname}${location.search}${location.hash}`;
      if (nextUrl !== currentUrl) history.pushState({}, "", nextUrl);
    };
    locationSearch?.addEventListener("input", applyLocationFilters);
    locationFilterButtons.forEach((btn) =>
      btn.addEventListener("click", () => {
        this.activeLocationFilter = btn.dataset.locationFilter;
        locationFilterButtons.forEach((button) => {
          const active = button === btn;
          button.classList.toggle("is-active", active);
          button.setAttribute("aria-pressed", String(active));
        });
        updateLocationCategoryQuery();
        applyLocationFilters();
      }),
    );
    applyLocationFilters();
  }

  initialize() {
    if (this.mounted) return this;
    this.mounted = true;
    this.setupLocationFilters();
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    this.mounted = false;
    this.timers.forEach((timer) => window.clearInterval(timer));
    this.timers = [];
    this.cleanups
      .splice(0)
      .reverse()
      .forEach((cleanup) => cleanup());
    return this;
  }
}

class NewsEventFiltersController {
  constructor(context) {
    Object.assign(this, context);
    this.cleanups = [];
    this.timers = [];
    this.mounted = false;
  }

  setupNewsFilters() {
    const { navigate, routes } = this;
    const newsType = document.querySelector("[data-news-type]");
    const newsYear = document.querySelector("[data-news-year]");
    const newsSearch = document.querySelector("[data-news-search]");
    const newsSearchButton = document.querySelector("[data-news-search-button]");
    const newsItems = [...document.querySelectorAll("[data-news-search-item]")];
    const applyNewsFilters = () => {
      const query = newsSearch?.value.trim().toLowerCase() || "";
      const year = newsYear?.value || "";
      let visible = 0;
      newsItems.forEach((item) => {
        const show =
          (!query || item.textContent.toLowerCase().includes(query)) &&
          (!year || item.dataset.newsYear === year);
        item.hidden = !show;
        if (show) visible += 1;
      });
      const empty = document.querySelector("[data-news-empty]");
      if (empty) empty.hidden = visible !== 0;
    };
    newsType?.addEventListener("change", () => {
      const filterTop = newsType.closest(".news-filters")?.getBoundingClientRect().top ?? 0;
      navigate(
        routes.news +
          (newsType.value && newsType.value !== "all" ? `?category=${newsType.value}` : ""),
        false,
      );
      const nextFilter = document.querySelector(".news-filters");
      if (nextFilter)
        window.scrollBy({
          top: nextFilter.getBoundingClientRect().top - filterTop,
          behavior: "instant",
        });
    });
    newsYear?.addEventListener("change", applyNewsFilters);
    newsSearch?.addEventListener("input", applyNewsFilters);
    newsSearchButton?.addEventListener("click", () => newsSearch?.focus());
  }

  setupEventFilters() {
    const eventYear = document.querySelector("[data-event-year-filter]");
    const eventSearch = document.querySelector("[data-event-search]");
    const eventSearchButton = document.querySelector("[data-event-search-button]");
    const eventItems = [...document.querySelectorAll("[data-event-search-item]")];
    const applyEventFilters = () => {
      const query = eventSearch?.value.trim().toLowerCase() || "";
      const year = eventYear?.value || "";
      let visible = 0;
      eventItems.forEach((item) => {
        const show =
          (!query || item.textContent.toLowerCase().includes(query)) &&
          (!year || item.dataset.eventYear === year);
        item.hidden = !show;
        if (show) visible += 1;
      });
      const empty = document.querySelector("[data-event-empty]");
      if (empty) empty.hidden = visible !== 0;
    };
    eventYear?.addEventListener("change", applyEventFilters);
    eventSearch?.addEventListener("input", applyEventFilters);
    eventSearchButton?.addEventListener("click", () => eventSearch?.focus());
  }

  initialize() {
    if (this.mounted) return this;
    this.mounted = true;
    this.setupNewsFilters();
    this.setupEventFilters();
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    this.mounted = false;
    this.timers.forEach((timer) => window.clearInterval(timer));
    this.timers = [];
    this.cleanups
      .splice(0)
      .reverse()
      .forEach((cleanup) => cleanup());
    return this;
  }
}

export class SiteInteractions {
  constructor(context) {
    this.controllers = [
      new HeaderController(),
      new GeneralPageController(),
      new InquiryController(context),
      new SupportController(context),
      new LocationsController(),
      new NewsEventFiltersController(context),
      new CommunicationController(context),
      new CarouselController(),
    ];
    this.mounted = false;
  }

  initialize() {
    if (this.mounted) return this;
    this.mounted = true;
    this.controllers.forEach((controller) => controller.initialize());
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    this.controllers
      .slice()
      .reverse()
      .forEach((controller) => controller.destroy());
    this.mounted = false;
    return this;
  }
}

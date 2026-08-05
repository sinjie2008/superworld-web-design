const escapeHtml = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
const placeholderImage = (imageName, width, height, altText = imageName) =>
  `<img src="https://placehold.co/${width}x${height}" alt="${escapeHtml(altText)}" width="${width}" height="${height}"/>`;
const heroBrandImage = (altText) =>
  `<img src="https://placehold.co/560x320" srcset="https://placehold.co/280x160 280w, https://placehold.co/560x320 560w, https://placehold.co/840x480 840w, https://placehold.co/1120x640 1120w" sizes="(max-width: 820px) calc(100vw - 72px), 470px" alt="${escapeHtml(altText)}" width="560" height="320"/>`;
const ph = (className, imageName, width, height, label = imageName) =>
  `<div class="ph${className ? ` ${className}` : ""}">${placeholderImage(imageName, width, height, label)}</div>`;

const PRODUCT_SETS = {
  general: [
    [
      "EMC Components",
      "Solutions supporting noise suppression, compliance, and product stability in electronic systems.",
      "/products/general/emc",
    ],
    [
      "Magnetic Components",
      "Core magnetic products supporting a wide range of electronic, industrial, and power-related applications.",
      "/products/general",
    ],
    [
      "Transformers",
      "Transformer solutions developed for consistent performance, manufacturing control, and application fit.",
      "/products/general",
    ],
    [
      "Wireless Power Transfer",
      "Wireless charging-related solutions supporting evolving demand in modern electronics and mobility.",
      "/products/general",
    ],
    [
      "General Components",
      "Reliable component solutions for electronic, industrial, and power applications.",
      "/products/general",
    ],
  ],
  automotive: [
    [
      "Automotive EMC Components",
      "AEC-Q200-ready components supporting noise suppression and stable vehicle electronics.",
      "/products",
    ],
    [
      "Automotive Power Inductors",
      "High-current magnetic components developed for demanding automotive power systems.",
      "/products",
    ],
    [
      "Automotive Ferrite Beads",
      "Compact EMI suppression solutions for connected and electrified vehicles.",
      "/products",
    ],
    [
      "Automotive Transformers",
      "Controlled transformer solutions for reliable automotive power conversion.",
      "/products",
    ],
    [
      "Automotive Wireless Power",
      "Magnetic component support for in-vehicle wireless charging applications.",
      "/products",
    ],
  ],
};

const MILESTONE_DATA = [
  [
    "2011 – 2014",
    "Recognition",
    "Expanded customer and enterprise recognition.",
  ],
  [
    "2007 – 2010",
    "Growth",
    "Strengthened manufacturing and global customer support.",
  ],
  [
    "2000 – 2006",
    "Foundation",
    "Established Singapore Headquarters Office\nResearch and Development Center and Ferrite Bead Plant in Taiwan\nTransformer and Inductor factory in South China",
  ],
  ["1993 – 1999", "Expansion", "Built regional operations and customer reach."],
  ["1975", "Origins", "The beginning of the company journey."],
];

const QUALITY_VALIDATION_DATA = [
  {
    key: "reliability",
    number: "01",
    title: "Reliability System",
    slides: [
      [
        "Comprehensive Reliability Verification System",
        "Ensuring reliable, long-term performance of magnetic components in real-world operation.",
        "System Sections",
        [
          "Application Environment Simulation",
          "Electrical & Functional Analysis",
          "Composition Analysis",
          "Failure Analysis",
          "Environmental Endurance",
          "Mechanical Analysis",
        ],
      ],
      [
        "Application Environment Simulation",
        "Simulates application-related stress and damage conditions before product use.",
        "Actual Items",
        [
          "Impulse / Surge simulation Board Flex",
          "Surge Current Damage Simulation",
          "Heat Conduction Simulation",
          "Stress Analysis / Simulation",
        ],
      ],
      [
        "Electrical & Functional Analysis",
        "Checks electrical behavior and functional performance of the component.",
        "Actual Items",
        [
          "Inner Circuit Isolation Simulation",
          "S-Parameter Analysis",
          "Power Loss",
        ],
      ],
      [
        "Composition Analysis",
        "Supports material and composition verification.",
        "Actual Item",
        ["XRF"],
      ],
      [
        "Failure Analysis",
        "Supports defect investigation and internal structure review.",
        "Actual Items",
        [
          "3D / 2D X-ray (CT)",
          "Thickness Analyzer",
          "Grinder",
          "High Power Stereo Microscope",
        ],
      ],
      [
        "Environmental Endurance",
        "Tests endurance under temperature, humidity, thermal shock, moisture, and salt atmosphere conditions.",
        "Actual Items",
        [
          "High Temperature Storage",
          "Low Temperature Storage",
          "High Temperature & Humidity Storage",
          "Thermal Shock (180°C↔-60°C)",
          "Temperature Cycling",
          "Moisture Resistance",
          "Salt Atmosphere",
        ],
      ],
      [
        "Mechanical Analysis",
        "Validates mechanical strength and durability under physical stress.",
        "Actual Items",
        [
          "Vibration",
          "Terminal Strength",
          "Destructive Endurance",
          "Shock Test",
        ],
      ],
    ],
  },
  {
    key: "magnetic",
    number: "02",
    title: "Magnetic Analysis",
    slides: [
      [
        "Advanced Magnetic Testing Capability",
        "Supports material properties verification, inductor specification testing, and system-level efficiency validation.",
        "Actual Sections",
        [
          "Material Properties Verification",
          "Inductor Spec Testing",
          "Efficiency Verification Tester",
        ],
      ],
      [
        "Material Properties Verification",
        "Verifies magnetic material characteristics and frequency response behavior.",
        "Actual Items",
        [
          "Magnetic material properties",
          "Frequency response analysis",
          "IWATSU SY-8218",
          "Agilent 4991A",
        ],
      ],
      [
        "High Current Testing",
        "Checks inductor performance under high-current conditions using DC bias testing.",
        "Actual Items",
        [
          "DC bias testing up to 200A",
          "Saturation behavior measurement",
          "200A DC Bias",
        ],
      ],
      [
        "System-Level Validation",
        "Supports efficiency verification and thermal testing at system or application level.",
        "Actual Items",
        [
          "EVB compatibility",
          "Efficiency and thermal testing",
          "Efficiency Verification System",
          "Compatible with Customer-Provided EVB",
        ],
      ],
    ],
  },
  {
    key: "emc",
    number: "03",
    title: "EMI / EMC Center",
    slides: [
      [
        "In-House EMI / EMC Validation",
        "In-house EMI / EMC validation for high-reliability electronics.",
        "Actual Sections",
        [
          "1 Anechoic Chamber",
          "4 EMI Shielding Room",
          "EMI / EMC Test Capability",
          "Standards Supported",
        ],
      ],
      [
        "Anechoic Chamber & EMI Shielding Room",
        "Facility support for EMI / EMC validation and testing work.",
        "Actual Facilities",
        ["1 Anechoic Chamber", "4 EMI Shielding Room"],
      ],
      [
        "EMI / EMC Test Capability",
        "Supports key EMI / EMC test requirements for electronic components and applications.",
        "Actual Test Items",
        [
          "Conducted emission testing",
          "Radiated emission testing",
          "Immunity testing",
          "ESD testing",
          "Transient simulation testing",
        ],
      ],
      [
        "Standards Supported",
        "Supports EMI / EMC validation based on recognized international and automotive standards.",
        "Actual Standard Scope",
        ["ISO standards", "IEC standards", "Automotive EMC standards"],
      ],
    ],
  },
];

const INDUSTRY_SELECTOR_DATA = [
  ["Automotive", "ADAS, TCU, lighting, wireless charging."],
  ["Communication", "Server, router, interface, LAN, RF."],
  ["Consumer", "Compact connected electronics."],
  ["Healthcare", "Portable and monitoring devices."],
  ["Industrial & Energy", "Automation and power systems."],
  ["Smart Home", "IoT, sensors, and control devices."],
];

const REGIONAL_MAP_POINTS = [
  ["Singapore (HQ)", 76.5, 68],
  ["USA", 20.5, 42],
  ["UK", 45, 32],
  ["France", 47, 39],
  ["Italy", 50.5, 43],
  ["North China", 75, 40],
  ["South China", 74, 51],
  ["Taiwan", 79.5, 50],
  ["Malaysia", 75.5, 64],
  ["Israel", 57, 48],
];

const HERO_BRAND_SLIDES = [
  "Company feature image 1",
  "Company feature image 2",
  "Company feature image 3",
];


const cardMarkup = ([title, copy, href]) => {
  return (
    '<article class="media-card slide">' +
    ph("soft", title + " Image", 320, 220, title + "\nImage") +
    '<div class="media-card-body"><h3>' +
    title +
    "</h3><p>" +
    copy +
    '</p><div class="media-card-footer"><a href="' +
    href +
    '" class="link-arrow" data-link>View More<span class="sr-only">: ' +
    title +
    "</span></a></div></div></article>"
  );
};

const selectProductSet = (type, carouselId) => {
  const root = document.querySelector('[data-carousel="' + carouselId + '"]');
  const items = PRODUCT_SETS[type];
  if (!root || !items) return;
  const track = root.querySelector(".carousel-track");
  if (track) {
    track.innerHTML = items.map((item) => cardMarkup(item)).join("");
    track.style.transform = "translateX(0px)";
  }
  root
    .closest("section")
    ?.querySelectorAll("[data-product-tab]")
    .forEach((button) => {
      const active = button.dataset.productTab === type;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
};

const prepareReleaseCards = () => {
  const root = document.querySelector('[data-carousel="home-releases"]');
  if (!root || root.dataset.releaseCardsEnhanced === "true") return;
  const track = root.querySelector(".carousel-track");
  if (!track) return;
  root.dataset.releaseCardsEnhanced = "true";
  track.innerHTML = Array.from(
    { length: 6 },
    () =>
      '<a class="release-product-card slide" href="/products/general/emc/a4k" data-link aria-label="View A4K Series Chip Array Ferrite Bead"><div class="ph image-cover" aria-hidden="true">' +
      placeholderImage(
        "A4K Series Product",
        250,
        194,
        "A4K Series\nProduct",
      ) +
      '</div><div class="release-product-copy"><div><h3>A4K Series</h3><p>Chip Array Ferrite Bead</p></div><span class="release-product-arrow" aria-hidden="true"></span></div></a>',
  ).join("");
  track.style.transform = "translateX(0px)";
};

const prepareCertificationCards = () => {
  const root = document.querySelector('[data-carousel="home-certs"]');
  if (!root || root.dataset.certificationCardsEnhanced === "true") return;
  const track = root.querySelector(".carousel-track");
  if (!track) return;
  root.dataset.certificationCardsEnhanced = "true";
  track.innerHTML = Array.from(
    { length: 6 },
    () =>
      '<article class="certification-card slide"><div class="certification-visual"><div class="ph">' +
      placeholderImage(
        "IATF 16949 Certification",
        300,
        176,
        "IATF 16949\nCertification",
      ) +
      '<span class="certification-tag">Certification</span></div></div><div class="certification-content"><h3>IATF 16949</h3><p>Quality management certification.</p><div class="certification-footer"><a class="certification-download" href="/company/quality" data-link>View Certificate Details</a><span>17 December 2025</span></div></div></article>',
  ).join("");
  track.style.transform = "translateX(0px)";
  const viewMore = root
    .closest("section")
    ?.querySelector(".section-heading .link-arrow");
  if (viewMore) {
    viewMore.classList.remove("link-arrow");
    viewMore.classList.add("certification-view-more");
  }
};

const prepareCertificationVault = (controller) => {
  const section =
    document.querySelector(
      "#superworld_electronics_company_quality_certification_vault",
    ) ||
    [...document.querySelectorAll("section")].find(
      (item) =>
        item.querySelector("h2")?.textContent.trim() ===
        "CERTIFICATION VAULT",
    );
  if (!section || section.dataset.certificationVaultEnhanced === "true")
    return;
  const input = section.querySelector("[data-certificate-search]");
  const cards = [...section.querySelectorAll("[data-certificate-card]")];
  const buttons = [...section.querySelectorAll("[data-certificate-page]")];
  const empty = section.querySelector("[data-certificate-empty]");
  if (!input || !cards.length || !buttons.length) return;
  section.dataset.certificationVaultEnhanced = "true";
  const pageSize = 8;
  controller.page = 1;

  const render = () => {
    const query = input.value.trim().toLowerCase();
    const matching = cards.filter((card) =>
      card.textContent.toLowerCase().includes(query),
    );
    const pageCount = Math.max(1, Math.ceil(matching.length / pageSize));
    controller.page = Math.min(controller.page, pageCount);
    cards.forEach((card) => {
      card.hidden = true;
    });
    matching
      .slice(
        (controller.page - 1) * pageSize,
        controller.page * pageSize,
      )
      .forEach((card) => {
      card.hidden = false;
      });
    buttons.forEach((button, index) => {
      const buttonPage = index + 1;
      const available = buttonPage <= pageCount && matching.length > 0;
      button.hidden = !available;
      button.classList.toggle(
        "is-active",
        buttonPage === controller.page && available,
      );
      if (buttonPage === controller.page && available)
        button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    if (empty) empty.hidden = matching.length > 0;
  };

  input.addEventListener("input", () => {
    controller.page = 1;
    render();
  });
  section
    .querySelector(".quality-certificate-search")
    ?.addEventListener("submit", (event) => event.preventDefault());
  buttons.forEach((button) =>
    button.addEventListener("click", () => {
      controller.page = Number(button.dataset.certificatePage);
      render();
      section
        .querySelector("[data-certificate-grid]")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }),
  );
  render();
};

const prepareNewsCards = () => {
  const root = document.querySelector('[data-carousel="home-news"]');
  if (!root || root.dataset.newsCardsEnhanced === "true") return;
  const track = root.querySelector(".carousel-track");
  if (!track) return;
  root.dataset.newsCardsEnhanced = "true";
  track.innerHTML = Array.from(
    { length: 6 },
    () =>
      '<article class="media-card home-news-card slide"><div class="ph home-news-visual image-cover">' +
      placeholderImage(
        "Johor Bahru Facility News",
        300,
        220,
        "Johor Bahru Facility\nNews",
      ) +
      '<span class="home-news-tag">Business Updates</span></div><div class="home-news-content"><h3>Our Johor Bahru facility is progressing</h3><div class="home-news-footer"><a class="home-news-more" href="/news/radial-leaded-inductor" data-link>View More<span class="sr-only">: Our Johor Bahru facility is progressing</span></a><span>17 December 2025</span></div></div></article>',
  ).join("");
  track.style.transform = "translateX(0px)";
  const viewMore = root
    .closest("section")
    ?.querySelector(".section-heading .link-arrow");
  if (viewMore) {
    viewMore.classList.remove("link-arrow");
    viewMore.classList.add("home-news-view-more");
  }
};

const prepareSectionIds = () => {
  const sectionPrefix = "superworld_electronics_";
  const sections = [...document.querySelectorAll("section")];
  if (
    sections.length &&
    !sections.every((section) => section.id.startsWith(sectionPrefix))
  ) {
    const routeName =
      location.pathname.split("/").filter(Boolean).join("_") || "home";
    const slugify = (value) =>
      value
        .toLowerCase()
        .replace(/&/g, " and ")
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
    const usedIds = new Set();
    const updatedIds = new Map();

    sections.forEach((section, index) => {
      const previousId = section.id;
      if (section.hasAttribute("data-section-id-preserve") && previousId) {
        usedIds.add(previousId);
        return;
      }
      const heading = section.querySelector("h1, h2, h3");
      const fallback =
        previousId ||
        [...section.classList]
          .filter(
            (name) =>
              name !== "section" &&
              name !== "section-sm" &&
              name !== "section-rule",
          )
          .join("_") ||
        "section_" + (index + 1);
      const sectionName =
        slugify(heading?.textContent.trim() || fallback) ||
        "section_" + (index + 1);
      const baseId = sectionPrefix + slugify(routeName) + "_" + sectionName;
      let uniqueId = baseId;
      let suffix = 2;
      while (usedIds.has(uniqueId)) uniqueId = baseId + "_" + suffix++;
      usedIds.add(uniqueId);
      if (previousId) updatedIds.set(previousId, uniqueId);
      section.id = uniqueId;
    });

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      const previousTarget = anchor.getAttribute("href").slice(1);
      if (updatedIds.has(previousTarget))
        anchor.setAttribute("href", "#" + updatedIds.get(previousTarget));
    });
    document.querySelectorAll("[data-scroll-target]").forEach((control) => {
      const previousTarget = control.dataset.scrollTarget;
      if (updatedIds.has(previousTarget))
        control.dataset.scrollTarget = updatedIds.get(previousTarget);
    });

    const currentTarget = location.hash.slice(1);
    if (updatedIds.has(currentTarget)) {
      history.replaceState(
        history.state,
        "",
        location.pathname +
          location.search +
          "#" +
          updatedIds.get(currentTarget),
      );
    }
    const hashTarget = document.getElementById(
      decodeURIComponent(location.hash.slice(1)),
    );
    if (hashTarget)
      hashTarget.scrollIntoView({ block: "start", behavior: "instant" });
  }
};

const prepareStaticEnhancements = () => {
  const companyStats = document.getElementById("who-we-are");
  const companyStatsSection =
    companyStats || document.querySelector('[id$="_who_we_are"]');
  if (
    companyStatsSection &&
    companyStatsSection.dataset.statsEnhanced !== "true"
  ) {
    const cards = [...companyStatsSection.querySelectorAll(".stat")];
    const details = [
      "EMC Components, Magnetic Components, Transformers & Wireless Power Transfer",
      "28 Invention Patents",
      "Ongoing investment in development capability",
      "Automotive 20% · Industrial & Medical 6% · Proven reliability for mission-critical electronics",
    ];
    if (cards.length >= 7) {
      const secondaryGrid = cards[3].parentElement;
      secondaryGrid.classList.remove("grid", "grid-4");
      secondaryGrid.classList.add("company-stat-secondary");
      secondaryGrid.removeAttribute("style");
      details.forEach((detail, index) => {
        const card = cards[index + 3];
        if (!card.querySelector("span")) {
          const copy = document.createElement("span");
          copy.textContent = detail;
          card.append(copy);
        }
      });
      companyStatsSection.dataset.statsEnhanced = "true";
    }
  }
  document.querySelectorAll(".carousel-dots").forEach((dots) => {
    if (
      !dots.closest(".home-hero") &&
      !dots.closest(".esg-pillars-carousel") &&
      !dots.closest(".news-feature-carousel")
    )
      dots.remove();
  });
  document
    .querySelectorAll('[data-product-tab="general"]')
    .forEach((general) => {
      if (!general.hasAttribute("aria-pressed"))
        selectProductSet("general", general.dataset.productCarousel);
    });
  const releaseCarousel = document.querySelector(
    '[data-carousel="home-releases"]',
  );
  prepareReleaseCards();
  prepareCertificationCards();
  prepareNewsCards();
  const releaseLink = releaseCarousel
    ?.closest("section")
    ?.querySelector(".section-heading .link-arrow");
  if (releaseLink) releaseLink.setAttribute("href", "/news?category=product");
};

class CertificationVaultController {
  constructor() {
    this.page = 1;
    this.mounted = false;
  }

  initialize() {
    if (this.mounted) return this;
    this.mounted = true;
    prepareCertificationVault(this);
    return this;
  }

  destroy() {
    this.mounted = false;
    return this;
  }
}

class ProductTabsController {
  constructor() {
    this.mounted = false;
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick(event) {
    const button = event.target.closest("[data-product-tab]");
    if (!button) return;
    selectProductSet(
      button.dataset.productTab,
      button.dataset.productCarousel,
    );
  }

  initialize() {
    if (this.mounted) return this;
    this.mounted = true;
    document.addEventListener("click", this.handleClick);
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    document.removeEventListener("click", this.handleClick);
    this.mounted = false;
    return this;
  }
}

class ProductCarouselController {
  constructor() {
    this.mounted = false;
    this.cleanup = null;
    this.productType = "general";
    this.activeIndex = 0;
    this.timer = 0;
  }

  initialize() {
    if (this.mounted) return this;
    this.mounted = true;
    this.prepareCompanyProductLines();
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    this.cleanup?.();
    this.cleanup = null;
    this.mounted = false;
    return this;
  }

  prepareCompanyProductLines() {
    const section =
      location.pathname === "/company"
        ? [...document.querySelectorAll("section")].find(
            (item) =>
              item.querySelector("h2")?.textContent.trim() === "PRODUCT LINES",
          )
        : null;
    if (!section) {
      if (this.cleanup) this.cleanup();
      this.cleanup = null;
      return;
    }
    if (section.dataset.companyProductsEnhanced === "true") return;
    if (this.cleanup) this.cleanup();
    section.dataset.companyProductsEnhanced = "true";

    const originalGrid = section.querySelector(".grid.grid-4");
    const tabs = [...section.querySelectorAll(".button-group button")];
    if (!originalGrid || tabs.length < 2) return;

    const carousel = document.createElement("div");
    carousel.className = "carousel company-product-carousel";
    carousel.dataset.carousel = "company-products";
    carousel.style.setProperty("--visible", "4");
    carousel.innerHTML =
      '<div class="carousel-window"><div class="carousel-track"></div></div><div class="carousel-controls"><button type="button" data-company-prev aria-label="Previous product">Prev</button><button type="button" data-company-next aria-label="Next product">Next</button></div>';
    originalGrid.replaceWith(carousel);

    const track = carousel.querySelector(".carousel-track");
    this.productType = "general";
    this.activeIndex = 0;
    this.timer = 0;
    const visible = () =>
      window.innerWidth <= 560 ? 1 : window.innerWidth <= 820 ? 2 : 4;
    const maxIndex = () => Math.max(0, PRODUCT_SETS[this.productType].length - visible());
    const update = () => {
      if (!this.mounted || !carousel.isConnected) return;
      this.activeIndex = Math.max(0, Math.min(this.activeIndex, maxIndex()));
      carousel.style.setProperty("--visible", String(visible()));
      const gap = 22;
      const width = carousel.querySelector(".carousel-window").clientWidth;
      const cardWidth = (width - gap * (visible() - 1)) / visible();
      track.style.transform =
        "translateX(-" + this.activeIndex * (cardWidth + gap) + "px)";
    };
    const restart = () => {
      window.clearInterval(this.timer);
      if (!this.mounted) return;
      this.timer = window.setInterval(() => {
        this.activeIndex = this.activeIndex >= maxIndex() ? 0 : this.activeIndex + 1;
        update();
      }, 4500);
    };
    const render = (nextType) => {
      this.productType = nextType;
      this.activeIndex = 0;
      track.innerHTML = PRODUCT_SETS[this.productType]
        .map((item) => cardMarkup(item))
        .join("");
      tabs.forEach((tab) => {
        const active = tab.dataset.companyProductTab === this.productType;
        tab.classList.toggle("is-active", active);
        tab.setAttribute("aria-pressed", String(active));
      });
      update();
      restart();
    };
    const move = (delta) => {
      this.activeIndex += delta;
      if (this.activeIndex > maxIndex()) this.activeIndex = 0;
      if (this.activeIndex < 0) this.activeIndex = maxIndex();
      update();
      restart();
    };

    tabs.forEach((tab, tabIndex) => {
      tab.classList.add("button", "small");
      tab.dataset.companyProductTab = tabIndex === 0 ? "general" : "automotive";
      tab.addEventListener("click", () =>
        render(tab.dataset.companyProductTab),
      );
    });
    carousel
      .querySelector("[data-company-prev]")
      .addEventListener("click", () => move(-1));
    carousel
      .querySelector("[data-company-next]")
      .addEventListener("click", () => move(1));
    window.addEventListener("resize", update, { passive: true });
    this.cleanup = () => {
      window.clearInterval(this.timer);
      window.removeEventListener("resize", update);
    };
    render("general");
  }
}

class MilestoneController {
  constructor() {
    this.mounted = false;
    this.cleanup = null;
    this.currentIndex = 7;
    this.locked = false;
    this.resetTimer = 0;
    this.autoTimer = 0;
  }

  initialize() {
    if (this.mounted) return this;
    this.mounted = true;
    this.prepareMilestoneSlider();
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    this.cleanup?.();
    this.cleanup = null;
    this.mounted = false;
    return this;
  }

  prepareMilestoneSlider() {
    const timeline = document.querySelector("#milestones .timeline");
    if (!timeline) {
      if (this.cleanup) this.cleanup();
      return;
    }
    if (timeline.dataset.milestoneEnhanced === "true") return;
    if (this.cleanup) this.cleanup();

    timeline.closest("section")?.classList.add("milestone-section");
    timeline.dataset.milestoneEnhanced = "true";
    const row = timeline.querySelector(".timeline-row");
    if (!row) return;
    const repeated = MILESTONE_DATA.concat(MILESTONE_DATA, MILESTONE_DATA);
    row.innerHTML = repeated
      .map(
        (item, index) =>
          '<article class="timeline-item" data-milestone-index="' +
          index +
          '"><h3>' +
          item[0] +
          '</h3><div class="timeline-circle" role="img" aria-label="Milestone image placeholder"><span class="milestone-image-label">Image Placeholder</span><strong class="milestone-image-size milestone-size-default">170 × 170 px</strong><strong class="milestone-image-size milestone-size-active">230 × 230 px</strong></div></article>',
      )
      .join("");

    const activeDetail = document.createElement("div");
    activeDetail.className =
      "milestone-detail milestone-active-detail is-active";
    activeDetail.setAttribute("aria-live", "polite");
    activeDetail.innerHTML = "<h3></h3><p></p>";
    timeline.append(activeDetail);
    const detailTitle = activeDetail.querySelector("h3");
    const detailCopy = activeDetail.querySelector("p");

    const controls = document.createElement("div");
    controls.className = "milestone-controls";
    controls.innerHTML =
      '<button type="button" data-milestone-prev aria-label="Previous milestone">Prev</button><button type="button" data-milestone-next aria-label="Next milestone">Next</button>';
    timeline.insertAdjacentElement("afterend", controls);

    this.currentIndex = 7;
    this.locked = false;
    this.resetTimer = 0;
    const items = [...row.querySelectorAll(".timeline-item")];

    const position = (animate = true) => {
      if (!this.mounted || !timeline.isConnected) return;
      const visible =
        Number(
          getComputedStyle(timeline).getPropertyValue("--milestone-visible"),
        ) || 5;
      const step = timeline.clientWidth / visible;
      const centerSlot = Math.floor(visible / 2);
      row.style.transition = animate ? "" : "none";
      row.style.transform =
        "translate3d(" + (centerSlot - this.currentIndex) * step + "px,0,0)";
      items.forEach((item, index) => {
        const active = index === this.currentIndex;
        item.classList.toggle("active", active);
        if (active) item.setAttribute("aria-current", "true");
        else item.removeAttribute("aria-current");
      });
      const detail =
        MILESTONE_DATA[
          ((this.currentIndex % MILESTONE_DATA.length) + MILESTONE_DATA.length) %
            MILESTONE_DATA.length
        ];
      detailTitle.textContent = detail[1];
      detailCopy.textContent = detail[2];
      if (!animate)
        requestAnimationFrame(() => {
          row.style.transition = "";
        });
    };

    const move = (delta) => {
      if (!this.mounted || this.locked) return;
      this.locked = true;
      this.currentIndex += delta;
      position(true);
      clearTimeout(this.resetTimer);
      this.resetTimer = setTimeout(() => {
        if (!this.mounted) return;
        if (this.currentIndex >= 10) this.currentIndex -= 5;
        if (this.currentIndex <= 4) this.currentIndex += 5;
        position(false);
        this.locked = false;
      }, 700);
    };

    const previous = controls.querySelector("[data-milestone-prev]");
    const next = controls.querySelector("[data-milestone-next]");
    previous.addEventListener("click", () => move(-1));
    next.addEventListener("click", () => move(1));
    this.autoTimer = setInterval(() => move(1), 4500);
    const handleResize = () => position(false);
    window.addEventListener("resize", handleResize, { passive: true });
    position(false);

    this.cleanup = () => {
      clearInterval(this.autoTimer);
      clearTimeout(this.resetTimer);
      window.removeEventListener("resize", handleResize);
      this.cleanup = null;
    };
  }
}

class QualityValidationController {
  constructor() {
    this.mounted = false;
    this.cleanup = null;
    this.slideState = {};
    this.activeKey = QUALITY_VALIDATION_DATA[0].key;
    this.paused = false;
    this.interactionPaused = false;
    this.timer = 0;
    this.scrollTimer = 0;
  }

  initialize() {
    if (this.mounted) return this;
    this.mounted = true;
    this.prepareQualityValidation();
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    this.cleanup?.();
    this.cleanup = null;
    this.mounted = false;
    return this;
  }

  qualityPanelMarkup(tab) {
    const slides = tab.slides
      .map(
        (slide) =>
          '<div class="quality-image-slide"><div class="quality-image-ph" role="img" aria-label="Image placeholder for ' +
          slide[0] +
          '"><span>Image Placeholder</span><strong>' +
          slide[0] +
          "</strong><small>740 × 640 px</small></div></div>",
      )
      .join("");
    const contents = tab.slides
      .map((slide, index) => {
        const items = slide[3]
          .map((item, itemIndex) => {
            const overviewRoute =
              tab.key === "emc"
                ? [1, 1, 2, 3][itemIndex]
                : Math.min(itemIndex + 1, tab.slides.length - 1);
            const routeIndex = index === 0 ? overviewRoute : index;
            return `<li role="button" tabindex="0" data-quality-go="${routeIndex}">${item}</li>`;
          })
          .join("");
        return `<div class="quality-slide-content${index === 0 ? " active" : ""}" data-quality-content="${index}"><div class="quality-small-label">${tab.title} / ${String(index + 1).padStart(2, "0")}</div><h3>${slide[0]}</h3><p>${slide[1]}</p><div class="quality-content-group"><h4>${slide[2]}</h4><ul>${items}</ul></div></div>`;
      })
      .join("");
    const dots = tab.slides
      .map(
        (slide, index) =>
          `<button class="quality-slider-dot${index === 0 ? " active" : ""}" type="button" data-quality-slide="${index}" aria-label="Show ${slide[0]}">${index === 0 ? "Overview" : String(index + 1).padStart(2, "0")}</button>`,
      )
      .join("");
    return `<div class="quality-tab-panel${tab.number === "01" ? " active" : ""}" id="quality-panel-${tab.key}" role="tabpanel" aria-labelledby="quality-tab-${tab.key}" data-quality-panel="${tab.key}"><div class="quality-panel-layout"><div class="quality-image-slider"><div class="quality-image-slides">${slides}</div></div><aside class="quality-content-side"><div class="quality-content-wrap">${contents}</div><div class="quality-slider-controls"><div class="quality-slider-dots">${dots}</div><div class="quality-arrows"><button class="quality-arrow" type="button" data-quality-prev aria-label="Previous slide">←</button><button class="quality-pause-toggle" type="button" data-quality-pause aria-label="Pause autoplay">Pause</button><button class="quality-arrow" type="button" data-quality-next aria-label="Next slide">→</button></div></div></aside></div></div>`;
  }

  prepareQualityValidation() {
    const heading = [...document.querySelectorAll("h2")].find(
      (item) => item.textContent.trim() === "IN-HOUSE VALIDATION CAPABILITIES",
    );
    const section = heading?.closest("section");
    if (!section) {
      if (this.cleanup) this.cleanup();
      return;
    }
    if (section.dataset.qualityEnhanced === "true") return;
    if (this.cleanup) this.cleanup();

    const container = heading.closest(".container");
    if (!container) return;
    section.dataset.qualityEnhanced = "true";
    container.innerHTML =
      '<div class="quality-section-header"><h2>IN-HOUSE VALIDATION CAPABILITIES</h2><p>Verifies component quality through reliability testing, magnetic analysis, and EMI / EMC validation.</p></div><div class="quality-main-tabs" role="tablist" aria-label="Validation capability tabs">' +
      QUALITY_VALIDATION_DATA.map(
        (tab, index) =>
          '<button class="quality-main-tab' +
          (index === 0 ? " active" : "") +
          '" id="quality-tab-' +
          tab.key +
          '" type="button" role="tab" aria-selected="' +
          (index === 0 ? "true" : "false") +
          '" aria-controls="quality-panel-' +
          tab.key +
          '" data-quality-tab="' +
          tab.key +
          '"><span>' +
          tab.number +
          "</span><strong>" +
          tab.title +
          "</strong></button>",
      ).join("") +
      "</div>" +
      QUALITY_VALIDATION_DATA.map((tab) => this.qualityPanelMarkup(tab)).join(
        "",
      );

    this.slideState = Object.fromEntries(
      QUALITY_VALIDATION_DATA.map((tab) => [tab.key, 0]),
    );
    this.activeKey = QUALITY_VALIDATION_DATA[0].key;
    this.paused = false;
    this.interactionPaused = false;
    this.timer = 0;
    this.scrollTimer = 0;

    const updatePauseButtons = () => {
      section.querySelectorAll("[data-quality-pause]").forEach((button) => {
        button.textContent = this.paused ? "Play" : "Pause";
        button.setAttribute(
          "aria-label",
          this.paused ? "Resume autoplay" : "Pause autoplay",
        );
      });
    };

    const updatePanel = (key) => {
      if (!this.mounted || !section.isConnected) return;
      const panel = section.querySelector('[data-quality-panel="' + key + '"]');
      const tab = QUALITY_VALIDATION_DATA.find((item) => item.key === key);
      if (!panel || !tab) return;
      const safeIndex =
        ((this.slideState[key] % tab.slides.length) + tab.slides.length) %
        tab.slides.length;
      this.slideState[key] = safeIndex;
      const track = panel.querySelector(".quality-image-slides");
      if (track)
        track.style.transform = "translateX(-" + safeIndex * 100 + "%)";
      panel.querySelectorAll("[data-quality-slide]").forEach((dot) => {
        const active = Number(dot.dataset.qualitySlide) === safeIndex;
        dot.classList.toggle("active", active);
        dot.setAttribute("aria-current", active ? "true" : "false");
      });
      panel
        .querySelectorAll("[data-quality-content]")
        .forEach((content) =>
          content.classList.toggle(
            "active",
            Number(content.dataset.qualityContent) === safeIndex,
          ),
        );
      panel
        .querySelectorAll("[data-quality-go]")
        .forEach((item) =>
          item.classList.toggle(
            "active-route",
            Number(item.dataset.qualityGo) === safeIndex,
          ),
        );
      clearTimeout(this.scrollTimer);
      const list = panel.querySelector(".quality-slide-content.active ul");
      if (list) {
        list.scrollTop = 0;
        this.scrollTimer = setTimeout(() => {
          if (!this.mounted) return;
          const maxScroll = list.scrollHeight - list.clientHeight;
          if (maxScroll > 4)
            list.scrollTo({ top: maxScroll, behavior: "smooth" });
        }, 1000);
      }
    };

    const setActiveTab = (key, reset = false) => {
      this.activeKey = key;
      if (reset) this.slideState[key] = 0;
      section.querySelectorAll("[data-quality-tab]").forEach((button) => {
        const active = button.dataset.qualityTab === key;
        button.classList.toggle("active", active);
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
      });
      section
        .querySelectorAll("[data-quality-panel]")
        .forEach((panel) =>
          panel.classList.toggle("active", panel.dataset.qualityPanel === key),
        );
      updatePanel(key);
    };

    const shouldPlay = () =>
      this.mounted &&
      !this.paused &&
      !this.interactionPaused &&
      !document.hidden;
    const restartAuto = () => {
      clearInterval(this.timer);
      this.timer = 0;
      if (shouldPlay())
        this.timer = setInterval(() => {
          const tabIndex = QUALITY_VALIDATION_DATA.findIndex(
            (tab) => tab.key === this.activeKey,
          );
          const tab = QUALITY_VALIDATION_DATA[tabIndex];
          if (this.slideState[this.activeKey] < tab.slides.length - 1) {
            this.slideState[this.activeKey] += 1;
            updatePanel(this.activeKey);
          } else {
            const nextTab =
              QUALITY_VALIDATION_DATA[
                (tabIndex + 1) % QUALITY_VALIDATION_DATA.length
              ];
            setActiveTab(nextTab.key, true);
          }
        }, 4500);
      updatePauseButtons();
    };

    const handleClick = (event) => {
      const tabButton = event.target.closest("[data-quality-tab]");
      if (tabButton) setActiveTab(tabButton.dataset.qualityTab, true);
      const dot = event.target.closest("[data-quality-slide]");
      if (dot) {
        this.slideState[this.activeKey] = Number(dot.dataset.qualitySlide);
        updatePanel(this.activeKey);
      }
      if (event.target.closest("[data-quality-prev]")) {
        this.slideState[this.activeKey] -= 1;
        updatePanel(this.activeKey);
      }
      if (event.target.closest("[data-quality-next]")) {
        this.slideState[this.activeKey] += 1;
        updatePanel(this.activeKey);
      }
      if (event.target.closest("[data-quality-pause]")) this.paused = !this.paused;
      const route = event.target.closest("[data-quality-go]");
      if (route) {
        this.slideState[this.activeKey] = Number(route.dataset.qualityGo);
        updatePanel(this.activeKey);
      }
      restartAuto();
    };
    const handleKeydown = (event) => {
      if (
        (event.key === "Enter" || event.key === " ") &&
        event.target.matches("[data-quality-go]")
      ) {
        event.preventDefault();
        event.target.click();
      }
    };
    const handleEnter = () => {
      this.interactionPaused = true;
      clearInterval(this.timer);
    };
    const handleLeave = () => {
      this.interactionPaused = false;
      restartAuto();
    };
    const handleFocusIn = () => {
      this.interactionPaused = true;
      clearInterval(this.timer);
    };
    const handleFocusOut = (event) => {
      if (!section.contains(event.relatedTarget)) {
        this.interactionPaused = false;
        restartAuto();
      }
    };
    const handleVisibility = () => restartAuto();

    section.addEventListener("click", handleClick);
    section.addEventListener("keydown", handleKeydown);
    section.addEventListener("mouseenter", handleEnter);
    section.addEventListener("mouseleave", handleLeave);
    section.addEventListener("focusin", handleFocusIn);
    section.addEventListener("focusout", handleFocusOut);
    document.addEventListener("visibilitychange", handleVisibility);
    setActiveTab(this.activeKey, true);
    restartAuto();

    this.cleanup = () => {
      clearInterval(this.timer);
      clearTimeout(this.scrollTimer);
      document.removeEventListener("visibilitychange", handleVisibility);
      this.cleanup = null;
    };
  }
}

class IndustrySelectorController {
  constructor() {
    this.mounted = false;
    this.cleanup = null;
    this.activeIndex = 0;
    this.timer = 0;
  }

  initialize() {
    if (this.mounted) return this;
    this.mounted = true;
    this.prepareIndustrySelector();
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    this.cleanup?.();
    this.cleanup = null;
    this.mounted = false;
    return this;
  }

  prepareIndustrySelector() {
    const layout = document.querySelector(".industries-layout");
    if (!layout) {
      if (this.cleanup) this.cleanup();
      return;
    }
    if (layout.dataset.industryEnhanced === "true") return;
    if (this.cleanup) this.cleanup();
    layout.dataset.industryEnhanced = "true";
    layout.innerHTML =
      '<div class="industry-slider" aria-live="polite"><div class="industry-slides">' +
      INDUSTRY_SELECTOR_DATA.map(
        (item) =>
          '<div class="industry-slide"><div class="ph industry-image-ph image-cover">' +
          placeholderImage(
            item[0] + " Industry",
            560,
            292,
            item[0] + "\nIndustry",
          ) +
          "</div></div>",
      ).join("") +
      '</div></div><div class="industry-list">' +
      INDUSTRY_SELECTOR_DATA.map(
        (item, index) =>
          '<button class="industry-row' +
          (index === 0 ? " is-active" : "") +
          '" type="button" data-industry-index="' +
          index +
          '" aria-pressed="' +
          (index === 0 ? "true" : "false") +
          '"><h3>' +
          item[0] +
          "</h3><p>" +
          item[1] +
          '</p><span class="industry-row-arrow" aria-hidden="true"></span></button>',
      ).join("") +
      "</div>";

    this.activeIndex = 0;
    this.timer = 0;
    const render = () => {
      if (!this.mounted || !layout.isConnected) return;
      const track = layout.querySelector(".industry-slides");
      if (track) track.style.transform = "translateX(-" + this.activeIndex * 100 + "%)";
      layout.querySelectorAll("[data-industry-index]").forEach((button) => {
        const active = Number(button.dataset.industryIndex) === this.activeIndex;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-pressed", String(active));
      });
    };
    const restart = () => {
      clearInterval(this.timer);
      if (!this.mounted) return;
      this.timer = setInterval(() => {
        this.activeIndex = (this.activeIndex + 1) % INDUSTRY_SELECTOR_DATA.length;
        render();
      }, 4500);
    };
    const handleClick = (event) => {
      const button = event.target.closest("[data-industry-index]");
      if (!button) return;
      this.activeIndex = Number(button.dataset.industryIndex);
      render();
      restart();
    };
    layout.addEventListener("click", handleClick);
    render();
    restart();
    this.cleanup = () => {
      clearInterval(this.timer);
      this.cleanup = null;
    };
  }
}

class RegionalMapController {
  constructor() {
    this.mounted = false;
    this.cleanup = null;
    this.activeIndex = 0;
    this.timer = 0;
    this.stageVisible = false;
    this.observer = null;
  }

  initialize() {
    if (this.mounted) return this;
    this.mounted = true;
    this.prepareRegionalMap();
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    this.cleanup?.();
    this.cleanup = null;
    this.mounted = false;
    return this;
  }

  prepareRegionalMap() {
    const heading = [...document.querySelectorAll("h2")].find(
      (item) =>
        item.textContent.trim() === "REGIONAL SUPPORT FOR GLOBAL CUSTOMERS",
    );
    const section = heading?.closest("section");
    const placeholder = section?.querySelector(".ph.map");
    const regions = section?.querySelector(".regions");
    if (!section || !regions) {
      if (this.cleanup) this.cleanup();
      this.cleanup = null;
      return;
    }
    if (regions.dataset.regionMapEnhanced === "true") return;
    if (!placeholder) return;

    const cards = [...regions.querySelectorAll(".region")];
    if (cards.length !== REGIONAL_MAP_POINTS.length) return;
    if (this.cleanup) this.cleanup();
    regions.dataset.regionMapEnhanced = "true";

    const map = document.createElement("div");
    map.className = "regional-map";
    map.setAttribute("aria-label", "Interactive regional support world map");
    map.innerHTML =
      '<div class="regional-map-stage"><img src="/assets/world-map.webp" alt="World map showing Superworld Electronics regional support locations" width="800" height="400">' +
      REGIONAL_MAP_POINTS.map(
        (point, index) =>
          '<button class="regional-map-pin" type="button" style="--x:' +
          point[1] +
          "%;--y:" +
          point[2] +
          '%" data-region-pin="' +
          index +
          '" aria-label="Highlight ' +
          point[0] +
          ' regional support" aria-pressed="false"></button>',
      ).join("") +
      "</div>";
    placeholder.replaceWith(map);

    const stage = map.querySelector(".regional-map-stage");
    const pins = [...map.querySelectorAll("[data-region-pin]")];
    this.activeIndex = 0;
    this.timer = 0;
    this.stageVisible = false;
    const activate = (index) => {
      if (!this.mounted || !map.isConnected) return;
      this.activeIndex = index;
      pins.forEach((pin, pinIndex) => {
        const active = pinIndex === index;
        pin.classList.toggle("is-active", active);
        pin.setAttribute("aria-pressed", String(active));
      });
      cards.forEach((card, cardIndex) => {
        const active = cardIndex === index;
        card.classList.toggle("is-active", active);
        card.setAttribute("aria-pressed", String(active));
      });
      regions.dataset.activeRegion = String(index);
    };

    const startAutoPlay = () => {
      window.clearInterval(this.timer);
      if (
        !this.mounted ||
        !this.stageVisible ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        document.hidden
      )
        return;
      this.timer = window.setInterval(
        () => activate((this.activeIndex + 1) % pins.length),
        3000,
      );
    };

    pins.forEach((pin) =>
      pin.addEventListener("click", () => {
        activate(Number(pin.dataset.regionPin));
        startAutoPlay();
      }),
    );
    cards.forEach((card, index) => {
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute(
        "aria-label",
        "Highlight " + REGIONAL_MAP_POINTS[index][0] + " on the map",
      );
      card.addEventListener("click", () => {
        activate(index);
        startAutoPlay();
      });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          activate(index);
          startAutoPlay();
        }
      });
    });
    const visibilityHandler = () => startAutoPlay();
    document.addEventListener("visibilitychange", visibilityHandler);
    this.observer = new IntersectionObserver(
      (entries) => {
        this.stageVisible = entries.some(
          (entry) => entry.isIntersecting && entry.intersectionRatio >= 0.2,
        );
        startAutoPlay();
      },
      { threshold: [0, 0.2] },
    );
    if (stage) this.observer.observe(stage);
    this.cleanup = () => {
      window.clearInterval(this.timer);
      this.observer.disconnect();
      document.removeEventListener("visibilitychange", visibilityHandler);
    };
    activate(0);
  }
}

class CompanyGlobalMapController {
  constructor() {
    this.mounted = false;
    this.cleanup = null;
    this.activeIndex = 0;
    this.timer = 0;
  }

  initialize() {
    if (this.mounted) return this;
    this.mounted = true;
    this.prepareCompanyGlobalMap();
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    this.cleanup?.();
    this.cleanup = null;
    this.mounted = false;
    return this;
  }

  prepareCompanyGlobalMap() {
    const heading = [...document.querySelectorAll("h2")].find(
      (item) => item.textContent.trim() === "GLOBAL PRESENCE",
    );
    const section =
      location.pathname === "/company" ? heading?.closest("section") : null;
    const placeholder = section?.querySelector(".ph.map");
    if (!section || !placeholder) {
      if (this.cleanup) this.cleanup();
      this.cleanup = null;
      return;
    }
    if (section.dataset.companyGlobalMapEnhanced === "true") return;
    if (this.cleanup) this.cleanup();
    section.dataset.companyGlobalMapEnhanced = "true";

    const map = document.createElement("div");
    map.className = "regional-map company-regional-map";
    map.setAttribute("aria-label", "Interactive global presence world map");
    map.innerHTML =
      '<div class="regional-map-stage"><img src="/assets/world-map.webp" alt="World map showing Superworld Electronics global presence" width="800" height="400">' +
      REGIONAL_MAP_POINTS.map(
        (point, index) =>
          '<button class="regional-map-pin" type="button" style="--x:' +
          point[1] +
          "%;--y:" +
          point[2] +
          '%" data-company-region-pin="' +
          index +
          '" aria-label="Highlight ' +
          point[0] +
          ' global presence" aria-pressed="false"></button>',
      ).join("") +
      "</div>";
    placeholder.replaceWith(map);

    const pins = [...map.querySelectorAll("[data-company-region-pin]")];
    this.activeIndex = 0;
    this.timer = 0;
    const activate = (index) => {
      if (!this.mounted || !map.isConnected) return;
      this.activeIndex = index;
      pins.forEach((pin, pinIndex) => {
        const active = pinIndex === index;
        pin.classList.toggle("is-active", active);
        pin.setAttribute("aria-pressed", String(active));
      });
    };
    const startAutoPlay = () => {
      window.clearInterval(this.timer);
      if (
        !this.mounted ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        document.hidden
      )
        return;
      this.timer = window.setInterval(
        () => activate((this.activeIndex + 1) % pins.length),
        3000,
      );
    };
    pins.forEach((pin) =>
      pin.addEventListener("click", () => {
        activate(Number(pin.dataset.companyRegionPin));
        startAutoPlay();
      }),
    );
    const visibilityHandler = () => startAutoPlay();
    document.addEventListener("visibilitychange", visibilityHandler);
    this.cleanup = () => {
      window.clearInterval(this.timer);
      document.removeEventListener("visibilitychange", visibilityHandler);
    };
    activate(0);
    startAutoPlay();
  }
}

class HeroSliderController {
  constructor() {
    this.mounted = false;
    this.cleanup = null;
    this.activeIndex = 0;
    this.timer = 0;
  }

  initialize() {
    if (this.mounted) return this;
    this.mounted = true;
    this.prepareHeroBrandSlider();
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    this.cleanup?.();
    this.cleanup = null;
    this.mounted = false;
    return this;
  }

  prepareHeroBrandSlider() {
    if (location.pathname !== "/company") {
      if (this.cleanup) this.cleanup();
      this.cleanup = null;
      return;
    }
    const brand = document.querySelector(".hero-panel .hero-brand");
    if (!brand) {
      if (this.cleanup) this.cleanup();
      this.cleanup = null;
      return;
    }
    if (brand.dataset.heroSliderEnhanced === "true") return;
    if (this.cleanup) this.cleanup();
    brand.dataset.heroSliderEnhanced = "true";
    brand.setAttribute("aria-label", "Company feature image slider");
    brand.innerHTML =
      '<div class="hero-brand-slides">' +
      HERO_BRAND_SLIDES.map(
        (slide, index) =>
          '<div class="hero-brand-slide' +
          (index === 0 ? " is-active" : "") +
          '" aria-hidden="' +
          (index === 0 ? "false" : "true") +
          '">' +
          heroBrandImage(slide) +
          "</div>",
      ).join("") +
      '</div><div class="hero-brand-dots" role="group" aria-label="Choose company feature image">' +
      HERO_BRAND_SLIDES.map(
        (slide, index) =>
          '<button class="hero-brand-dot' +
          (index === 0 ? " is-active" : "") +
          '" type="button" data-hero-brand-dot="' +
          index +
          '" aria-label="Show slide ' +
          (index + 1) +
          '" aria-pressed="' +
          (index === 0 ? "true" : "false") +
          '"></button>',
      ).join("") +
      "</div>";

    const slides = [...brand.querySelectorAll(".hero-brand-slide")];
    const dots = [...brand.querySelectorAll("[data-hero-brand-dot]")];
    this.activeIndex = 0;
    this.timer = 0;
    const activate = (index) => {
      if (!this.mounted || !brand.isConnected) return;
      this.activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const active = slideIndex === this.activeIndex;
        slide.classList.toggle("is-active", active);
        slide.setAttribute("aria-hidden", String(!active));
      });
      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === this.activeIndex;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-pressed", String(active));
      });
    };
    const startAutoPlay = () => {
      window.clearInterval(this.timer);
      if (
        !this.mounted ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        document.hidden
      )
        return;
      this.timer = window.setInterval(() => activate(this.activeIndex + 1), 4500);
    };
    dots.forEach((dot) =>
      dot.addEventListener("click", () => {
        activate(Number(dot.dataset.heroBrandDot));
        startAutoPlay();
      }),
    );
    const visibilityHandler = () => startAutoPlay();
    document.addEventListener("visibilitychange", visibilityHandler);
    startAutoPlay();
    this.cleanup = () => {
      window.clearInterval(this.timer);
      document.removeEventListener("visibilitychange", visibilityHandler);
    };
  }
}

export class SiteEnhancements {
  constructor() {
    this.certificationVault = new CertificationVaultController();
    this.controllers = [
      new ProductTabsController(),
      new IndustrySelectorController(),
      new MilestoneController(),
      new QualityValidationController(),
      new RegionalMapController(),
      new CompanyGlobalMapController(),
      new HeroSliderController(),
      new ProductCarouselController(),
    ];
    this.mounted = false;
  }

  initialize() {
    if (this.mounted) return this;
    this.mounted = true;
    prepareStaticEnhancements();
    this.controllers.forEach((controller) => controller.initialize());
    prepareSectionIds();
    this.certificationVault.initialize();
    return this;
  }

  destroy() {
    if (!this.mounted) return this;
    this.certificationVault.destroy();
    this.controllers
      .slice()
      .reverse()
      .forEach((controller) => controller.destroy());
    this.mounted = false;
    return this;
  }
}

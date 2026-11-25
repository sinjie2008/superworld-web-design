import marketsTemplate from "../../pages/layouts/market-application.html";
import {
  applicationMarkets,
  findMarket,
  marketFitId,
  marketHref,
  marketIllustrations,
  seriesReferences,
  systemHref,
} from "./market-data.js";

const supportHref = "/support?type=Technical%20Support";
const searchHref = "/tools/spec-search";

const marketCopy = {
  consumer: {
    fit: "CONSUMER",
    overview:
      "Compact magnetic and EMC components for audio, portable devices and powered appliances.",
    quality: "CONSUMER ELECTRONICS",
  },
  healthcare: {
    fit: "HEALTHCARE",
    overview: "Component options for low-power sensor, display and control circuits.",
    quality: "HEALTHCARE DEVICES",
  },
  industrial: {
    fit: "INDUSTRIAL",
    overview: "Magnetic and EMC components for controls, power conversion and connected equipment.",
    quality: "INDUSTRIAL & ENERGY SYSTEMS",
  },
  "smart-home": {
    fit: "SMART HOME",
    overview:
      "Component options for connected controls, appliance boards and low-power electronics.",
    quality: "CONNECTED SMART HOME SYSTEMS",
  },
};

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

const cardId = (system, block) => system.id + "-" + block.id;
const seriesLabel = (path) => seriesReferences[path].name;

function circuitBlockLink(system, block, index) {
  const id = cardId(system, block);
  return `<li><a class="hotspot-link" href="#${id}" data-open-card="${id}">
    <span class="market-hotspot-number">${index + 1}</span>${escapeHtml(block.title)}
  </a></li>`;
}

function explodedViewReference(reference) {
  const source = reference
    ? `<a href="${escapeHtml(reference.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(reference.label)}<span class="sr-only"> (opens in a new tab)</span></a>`
    : "";
  return `<p class="market-exploded-reference">
    <span>Verified Exploded View Pending</span>
    ${source}
  </p>`;
}

function publishedExplodedView(system, illustration) {
  const markers =
    illustration.hotspots
      ?.map(({ blockId, x, y, label, labelPosition }) => {
        const index = system.modules.findIndex((block) => block.id === blockId);
        if (index < 0) return "";
        const id = cardId(system, system.modules[index]);
        const labelX = labelPosition?.x ?? x;
        const labelY = labelPosition?.y ?? y;
        const leader = labelPosition ? `<svg class="market-hotspot-leader" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <line x1="${x}" y1="${y}" x2="${labelX}" y2="${labelY}" vector-effect="non-scaling-stroke"></line>
          </svg>` : "";
        const markerClass = labelPosition ? " has-leader" : "";
        return `${leader}<a class="hotspot-link market-physical-hotspot${markerClass}" href="#${id}" data-open-card="${id}" style="left:${labelX}%;top:${labelY}%" aria-label="${index + 1}. ${escapeHtml(label)}"><span>${index + 1}</span></a>`;
      })
      .join("") || "";
  const publisher = illustration.sourcePublisher ? " (" + escapeHtml(illustration.sourcePublisher) + ")" : "";
  const layout = illustration.width / illustration.height < 1.5 ? " market-image-narrow" : "";
  return `<div class="system-hotspot-stage has-system-image${layout}" style="--market-image-ratio:${illustration.width}/${illustration.height}">
        <div class="system-hotspot-image has-image market-image-frame">
            <img src="${illustration.path}" alt="${escapeHtml(illustration.alt)}" width="${illustration.width}" height="${illustration.height}" loading="lazy">
          ${markers}
        </div>
        <div class="system-hotspot-image market-stage-placeholder" data-system-image-fallback hidden>Verified Exploded View Pending</div>
      </div>
      <p class="market-image-credit">
        ${escapeHtml(illustration.title)} · <a href="${escapeHtml(illustration.source)}">${escapeHtml(illustration.creator)}</a>
        / <a href="${escapeHtml(illustration.licenseUrl)}">${escapeHtml(illustration.license)}</a>${publisher} (${escapeHtml(illustration.changes)}). ${escapeHtml(illustration.context)}
      </p>`;
}

function systemStage(system) {
  const illustration = marketIllustrations[system.id];
  const view = illustration
    ? publishedExplodedView(system, illustration)
    : explodedViewReference(system.explodedViewReference);

  return `${view}
    <nav class="market-functional-nav" aria-label="${escapeHtml(system.title)} circuit block navigation">
      <p>Open a circuit block</p>
      <ul>
        ${system.modules.map((block, index) => circuitBlockLink(system, block, index)).join("")}
      </ul>
    </nav>`;
}

function mappingRow(mapping, id) {
  const categories = [...new Set(mapping.series.map((path) => seriesReferences[path].category))];
  const selectionNotes = mapping.condition
    ? `<details class="market-selection-notes">
        <summary>Selection notes</summary>
        <p>${escapeHtml(mapping.condition)}</p>
      </details>`
    : "";
  return `<div class="mapping-row">
    <div class="component-image-placeholder" data-market-series-image><span>Product image unavailable</span></div>
    <div>
      <div class="component-name">${escapeHtml(mapping.role)}</div>
      <div class="market-component-category">${escapeHtml(categories.join(" / "))}</div>
      <div class="component-desc">${escapeHtml(mapping.why)}</div>
      ${selectionNotes}
    </div>
    <div class="series-chips">
      ${mapping.series.map((path) => `<button class="series-chip" type="button" aria-expanded="false" aria-controls="${id}" data-series-path="${escapeHtml(path)}">${escapeHtml(seriesLabel(path))}</button>`).join("")}
    </div>
    <div class="series-detail" id="${id}" aria-live="polite" hidden></div>
  </div>`;
}

function subApplication(system, block, index) {
  const id = cardId(system, block);
  const open = index === 0;
  const componentGuidance = block.componentGuidance;
  const componentContent = componentGuidance
    ? `<h4 class="mapping-title">Component guidance</h4>
      <dl class="market-component-guidance">
        <dt class="component-name">${escapeHtml(componentGuidance.category)}</dt>
        <dd class="component-desc">${escapeHtml(componentGuidance.purpose)}</dd>
      </dl>`
    : `<h4 class="mapping-title">Component Families &amp; Series Candidates</h4>
      <div class="mapping-list">
        ${block.mappings.map((mapping, row) => mappingRow(mapping, id + "-series-" + (row + 1))).join("")}
      </div>`;
  const consultation = block.consultation
    ? `<p class="market-consultation">${escapeHtml(block.consultation)}
        <a data-link href="${supportHref}">Ask Technical Support</a>
      </p>`
    : "";
  const action = block.mappings.length
    ? `<a data-link class="system-action-btn bundle-btn" href="${searchHref}" data-market-bundle>Specification Search</a>`
    : `<a data-link class="system-action-btn bundle-btn" href="${supportHref}">Technical Support</a>`;
  return `<article class="subapp-card${open ? " is-open" : ""}" id="${id}" data-subapp-card>
    <div class="subapp-summary">
      <button class="subapp-trigger" id="${id}-trigger" type="button" aria-expanded="${open}" aria-controls="${id}-panel">
        <span class="subapp-no">${String(index + 1).padStart(2, "0")}</span>
        <span class="subapp-image market-thumbnail" aria-hidden="true"></span>
        <span class="subapp-title"><span class="market-subapp-title">${escapeHtml(block.title)}</span></span>
        <span class="subapp-desc">${escapeHtml(block.description)}</span>
      </button>
      <div class="subapp-actions">
        ${action}
        <button class="accordion-icon" type="button" aria-label="Toggle ${escapeHtml(block.title)}" aria-controls="${id}-panel" aria-expanded="${open}">${open ? "−" : "+"}</button>
      </div>
    </div>
    <div class="subapp-panel${open ? " is-open" : ""}" id="${id}-panel" aria-labelledby="${id}-trigger" ${open ? "" : "hidden"}>
      <div class="subapp-panel-grid">
        <div class="design-block panel-block">
          <h4>Design Need</h4>
          <p>${escapeHtml(block.need)}</p>
        </div>
        <div>
          ${componentContent}
          ${consultation}
        </div>
      </div>
    </div>
  </article>`;
}

function systemTabs(market, search) {
  const requested = new URLSearchParams(search).get("system");
  const initial = market.systems.find((system) => system.id === requested) ?? market.systems[0];
  return `<div class="system-tabs-nav" role="tablist" aria-label="${escapeHtml(market.name)} systems">
    ${market.systems
      .map((system) => {
        const active = system === initial;
        return `<button class="system-tab-btn${active ? " active" : ""}" id="${system.id}-tab" type="button" role="tab" aria-selected="${active}" aria-controls="${system.id}-system" tabindex="${active ? 0 : -1}" data-system="${system.id}">${escapeHtml(system.title)}</button>`;
      })
      .join("")}
  </div>
  ${market.systems
    .map((system) => {
      const active = system === initial;
      return `<section class="system-panel${active ? " active" : ""}" id="${system.id}-system" role="tabpanel" aria-labelledby="${system.id}-tab" data-system-panel="${system.id}" data-section-id-preserve ${active ? "" : "hidden"}>
      ${systemStage(system)}
      <div class="accordion-toolbar">
        <button class="system-action-btn show-all-btn" type="button">Expand All</button>
        <button class="system-action-btn is-outline collapse-all-btn" type="button">Collapse All</button>
      </div>
      <div class="subapp-list market-detail-list">${system.modules.map((block, index) => subApplication(system, block, index)).join("")}</div>
    </section>`;
    })
    .join("")}`;
}

function overviewCard(market) {
  const title = escapeHtml(market.name);
  return `<article class="market-card" data-market-card data-market-name="${title}">
    <div class="ph image-cover market-overview-placeholder" aria-hidden="true"></div>
    <div class="market-summary">
      <div class="market-summary-copy">
        <h3>${title}</h3>
        <p>${escapeHtml(marketCopy[market.id].overview)}</p>
      </div>
      <button class="market-state-toggle" type="button" aria-expanded="false" aria-label="Open ${title} details">
        <span class="market-state-icon" aria-hidden="true"></span>
      </button>
    </div>
    <div class="market-details">
      <div class="market-search">
        <input type="search" data-market-search aria-label="Search within ${title}" placeholder="Search ..." autocomplete="off">
        <button type="button" data-market-search-action aria-label="Focus ${title} search">
          <span class="market-search-icon" aria-hidden="true"></span>
        </button>
      </div>
      <div class="market-detail-list">
        ${market.systems
          .map(
            (system) => `<article class="market-detail-item" data-market-item>
          <div class="market-detail-copy">
            <h4>${escapeHtml(system.title)}</h4>
            <ul>${system.modules.map((block) => "<li>" + escapeHtml(block.title) + "</li>").join("")}</ul>
          </div>
          <div class="market-detail-image">
            <div class="market-detail-image-placeholder" aria-hidden="true"></div>
            <div class="market-detail-actions">
              <a data-link class="link-arrow" href="${systemHref(market, system)}">System Details<span class="sr-only"> for ${escapeHtml(system.title)}</span></a>
            </div>
          </div>
        </article>`,
          )
          .join("")}
      </div>
      <p class="market-no-results" data-market-no-results hidden>No matching application.</p>
    </div>
    <div class="market-actions">
      <button class="market-toggle" type="button" aria-expanded="false">View Details</button>
      <a data-link class="button market-more-link" href="${marketHref(market)}">Explore Market<span class="sr-only"> ${title}</span></a>
    </div>
  </article>`;
}

export function marketPageSlots(path, search, replaceSlot) {
  if (path === "/applications") {
    return { APPLICATION_MARKET_CARDS: applicationMarkets.map(overviewCard).join("") };
  }
  const market = findMarket(path);
  if (!market) return null;
  const copy = marketCopy[market.id];
  const areaCount = market.systems.reduce((count, system) => count + system.modules.length, 0);
  const slots = {
    MARKET_NAME: escapeHtml(market.name),
    MARKET_HEADING: escapeHtml(market.heroTitle).replace("COMPONENTS FOR ", "COMPONENTS FOR<br />"),
    MARKET_INTRO: escapeHtml(market.intro),
    MARKET_SUMMARY_HEADING: escapeHtml(market.summary.heading),
    MARKET_SUMMARY_INTRO: escapeHtml(market.summary.text),
    MARKET_SYSTEM_COUNT: String(market.systems.length),
    MARKET_AREA_COUNT: String(areaCount),
    MARKET_DESIGN_FOCUS: escapeHtml(market.summary.focus),
    MARKET_FIT_ID: marketFitId(market),
    MARKET_FIT_TITLE: "FIND THE RIGHT SERIES BY " + copy.fit + " SYSTEM",
    MARKET_DESIGN_HEADING: escapeHtml(market.designTitle),
    MARKET_DESIGN_INTRO: escapeHtml(market.designIntro),
    MARKET_DESIGN_CARDS: market.needs
      .map(
        ({ title, text }, index) =>
          `<article class="design-card">
        <p class="design-card-number">${String(index + 1).padStart(2, "0")}</p>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(text)}</p>
      </article>`,
      )
      .join(""),
    MARKET_SYSTEM_TABS: systemTabs(market, search),
    MARKET_QUALITY_MARKET: escapeHtml(copy.quality),
    MARKET_QUALITY_MANUFACTURING: escapeHtml(market.quality.manufacturing),
    MARKET_QUALITY_PERFORMANCE: escapeHtml(market.quality.performance),
    MARKET_QUALITY_ENGINEERING: escapeHtml(market.quality.engineering),
    MARKET_JOURNEY_IDENTIFY: escapeHtml(market.journey.identify),
    MARKET_JOURNEY_REVIEW: escapeHtml(market.journey.review),
    MARKET_JOURNEY_MATCH: escapeHtml(market.journey.match),
    MARKET_JOURNEY_CONTACT: escapeHtml(market.journey.contact),
    MARKET_SUPPORT: escapeHtml(market.support),
  };

  return {
    MARKET_CONTENT: Object.entries(slots).reduce(
      (markup, [slot, value]) => replaceSlot(markup, slot, value),
      marketsTemplate,
    ),
  };
}

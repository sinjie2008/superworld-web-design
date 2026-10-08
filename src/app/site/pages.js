import header from "../../pages/layouts/header.html";
import footer from "../../pages/layouts/footer.html";
import home from "../../pages/home.html";
import company from "../../pages/company.html";
import achievements from "../../pages/company/achievements.html";
import quality from "../../pages/company/quality.html";
import sustainability from "../../pages/company/sustainability.html";
import applications from "../../pages/applications.html";
import automotive from "../../pages/applications/automotive.html";
import communication from "../../pages/applications/communication.html";
import { matchProductRoute } from "../product-catalog.js";
import { productFieldLabel } from "../product-pages.js";
import products from "../../pages/products.html";
import productGroup from "../../pages/products/general.html";
import productFamily from "../../pages/products/general/emc.html";
import productSeries from "../../pages/products/general/emc/a4k.html";
import specSearch from "../../pages/tools/spec-search.html";
import news from "../../pages/news.html";
import calendar from "../../pages/news/event-calendar.html";
import newsDetail from "../../pages/news/radial-leaded-inductor.html";
import locations from "../../pages/locations.html";
import support from "../../pages/support.html";
import inquiry from "../../pages/inquiry.html";
import thanks from "../../pages/thank-you.html";

const pages = new Map([
  ["/", home],
  ["/company", company],
  ["/company/achievements", achievements],
  ["/company/quality", quality],
  ["/company/sustainability", sustainability],
  ["/applications", applications],
  ["/applications/automotive", automotive],
  ["/applications/communication", communication],
  ["/products", products],
  ["/tools/spec-search", specSearch],
  ["/news", news],
  ["/news/event-calendar", calendar],
  ["/news/radial-leaded-inductor", newsDetail],
  ["/locations", locations],
  ["/support", support],
  ["/inquiry", inquiry],
  ["/thank-you", thanks],
]);

const slot = (name) => `<!--APP_SLOT:${name}-->`;
const replaceSlot = (markup, name, value) => markup.split(slot(name)).join(value || "");

const routes = {
  detail: "/news/radial-leaded-inductor",
  support: "/support",
  tools: "/tools/spec-search",
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
const placeholderImage = (width, height, alt) =>
  `<img src="https://placehold.co/${width}x${height}" alt="${escapeHtml(alt)}" width="${width}" height="${height}"/>`;
const ph = (className, imageName, width, height, label = imageName) =>
  `<div class="ph${className ? ` ${className}` : ""}">${placeholderImage(width, height, label)}</div>`;
const link = (href, label, className = "") =>
  `<a data-link class="${className}" href="${href}">${label}</a>`;
const buttonLink = (href, label, className = "") => link(href, label, `button ${className}`);
const pagination = () =>
  `<div class="pagination">${[1, 2, 3, 4, 5].map((page) => `<button type="button" data-page="${page}">${page}</button>`).join("")}</div>`;

const generalCategories = {
  "EMC Components": [
    "Chip Array Ferrite Bead",
    "Chip Inductor",
    "Ferrite Bead Assembly",
    "Ferrite Chip Bead",
    "Ferrite Chip Bead (Large Current)",
    "Multilayer Power Chip Inductor",
  ],
  "Magnetic Components": [
    "Ceramic Wire Wound Inductor",
    "Common Mode Choke",
    "Trans-inductor Voltage Regulator Inductor",
    "Molded Power Inductor",
    "Planar Inductor",
    "Power Bead",
    "Radial-Leaded Inductor",
    "Semi-Shielded Power Inductor",
    "Shielded Power Inductor",
    "Unshielded Power Inductor",
    "Transponder Coil",
    "Wire Wound Inductor",
  ],
  Transformer: ["Lan Transformer", "Power Converter Transformer", "Planar Transformer"],
  "Wireless Power Transfer": [
    "Receiver Coil",
    "Transmitter Coil",
    "Receiver Module",
    "Transmitter Module",
  ],
};

const newsCategories = {
  all: "ALL",
  latest: "Latest Product News",
  product: "Product Releases",
  brochures: "Brochures",
  events: "Exhibitions & Trade Shows",
  csr: "Corporate Social Responsibility",
  eol: "End-of-Life Notices",
  business: "Business Updates",
  announcements: "Announcements",
};

function newsSlots(search = globalThis.location?.search || "") {
  const category = new URLSearchParams(search).get("category") || "all";
  const allNewsCards = [
    ["Latest Product News", "Radial-Leaded Inductor: Fully Automated Production Overview"],
    ["Business Updates", "Our Johor Bahru facility is progressing"],
    ["Exhibitions & Trade Shows", "NEPCON Japan 2026 Recap: Innovations, Insights & Trends"],
    ["Corporate Social Responsibility", "Superworld Electronics’ CSR Program at Gladiolus Place"],
    ["Announcements", "Holiday closure notice"],
    ["Brochures", "Superworld Product Brochure"],
    ["Latest Product News", "New A4K Series Release"],
    ["Business Updates", "Superworld Electronics expands regional support"],
  ];
  const categoryCards = {
    latest: allNewsCards.filter((item) => item[0] === "Latest Product News"),
    events: allNewsCards.filter((item) => item[0] === "Exhibitions & Trade Shows"),
    csr: allNewsCards.filter((item) => item[0] === "Corporate Social Responsibility"),
    business: allNewsCards.filter((item) =>
      ["Business Updates", "Corporate Social Responsibility", "Announcements"].includes(item[0]),
    ),
    announcements: allNewsCards.filter((item) => item[0] === "Announcements"),
    brochures: allNewsCards.filter((item) => item[0] === "Brochures"),
  };
  const selectedCards = category === "all" ? allNewsCards : categoryCards[category] || allNewsCards;
  const cards = Array.from(
    { length: 8 },
    (_, index) => selectedCards[index % selectedCards.length],
  ).map(
    (item) =>
      `<article class="news-card" data-news-search-item data-news-year="2025"><div class="ph news-card-visual image-cover">${placeholderImage(300, 190, `${item[1]}\nNews`)}<span class="tag">${item[0]}</span></div><div class="news-card-body"><h3>${item[1]}</h3><div class="news-card-footer">${link(routes.detail, `View More<span class="sr-only">: ${escapeHtml(item[1])}</span>`, "link-arrow")}<span>17 December 2025</span></div></div></article>`,
  );
  const list = Array.from(
    { length: 5 },
    () =>
      `<article class="news-list-item" data-news-search-item data-news-year="2026"><div class="ph news-list-image">${placeholderImage(140, 108, "Molded Power\nInductor")}</div><div class="news-list-copy"><h3>Molded Power Inductor</h3><p>Low profile as low as 1mm. Capable of handling high current ratings while maintaining optimal performance in high-temperature environments.</p></div><div class="news-list-meta"><span class="tag">General</span><h3>PHA0301S</h3><p class="catalog-api-missing" title="Not provided by the product API">Dimension Range : XXX - XXX</p><small>${category === "eol" ? "End-of-Life" : "Release Date"} : 15/04/2026</small></div>${link(routes.detail, '<span class="news-list-arrow" aria-hidden="true"></span><span class="sr-only">View Molded Power Inductor</span>', "news-list-arrow-link")}</article>`,
  ).join("");
  const results =
    category === "product" || category === "eol"
      ? `<div class="news-list">${list}</div>`
      : `<div class="news-grid">${cards.join("")}</div>`;
  return {
    NEWS_CATEGORY_OPTIONS: Object.entries(newsCategories)
      .map(
        ([value, name]) =>
          `<option value="${value}" ${value === category ? "selected" : ""}>${name}</option>`,
      )
      .join(""),
    NEWS_RESULTS: `${results}<p class="news-empty" data-news-empty hidden>No news matches your search.</p>${pagination()}`,
  };
}

const locationData = [
  {
    type: "office",
    title: "Head Office (Singapore)",
    office: "Superworld Electronics (S) Pte Ltd",
    address: "16 New Industrial Road, #06-01 To 08, Hudson TechnoCentre, Singapore 536204",
    email: "sales@superworld.com.sg",
    contact: "(65) 6298 2866",
    fax: "(65) 6298 8900",
  },
  {
    type: "office",
    title: "Hong Kong",
    office: "Superworld Electronics (HK) Limited",
    address:
      "Unit 8-9 1/F, Hope Sea Industrial Centre No. 26 Lam Hing Street, Kowloon Bay Kowloon, Hong Kong",
    email: "sales@superworld.com.sg",
    contact: "(852) 2612 2969",
  },
  {
    type: "office",
    title: "Dongguan",
    office: "Superworld Electronics (Dongguan) Co., Ltd",
    address:
      "No. 2 East Ring Street 5, Jitigang Village Huangjiang Town, Dongguan City Guangdong Province, China 523757",
    email: "sales@superworld.com.sg",
    contact: "(86) 769 8353 6633",
  },
  {
    type: "office",
    title: "Kunshan",
    office: "Superworld Electronics (Dongguan) Co., Ltd",
    address:
      "No. 925 Guoshi Road Hi-Tech Industrial Development Zone Kunshan, Jiangsu Province, China 215333",
    email: "sales@superworld.com.sg",
    contact: "(86) 512 5525 8255",
  },
  {
    type: "office",
    title: "Taiwan",
    office: "Superworld Electronics Co., Ltd",
    address: "5F No. 479 Zhongyang Road Xinzhuang District, New Taipei City Taiwan 24251",
    email: "sales@superworld.com.sg",
    contact: "(886) 2 8521 1890",
    fax: "(886) 2 8521 1831",
  },
  {
    type: "office",
    title: "Malaysia",
    office: "Superworld Electronics (M) Sdn. Bhd",
    address: "1-14-01C, Menara IJM Land No. 1 Lebuh Tunku Kudin 3 11700 Gelugor, Penang, Malaysia",
    email: "sales@superworld.com.sg",
    contact: "(604) 287 3689",
  },
  {
    type: "agent",
    title: "Agent (Israel)",
    office: "Ziontronics Ltd",
    address: "10th Moshe Dayan St. Metropark Center Building C Petah Tikva 4951810 Israel",
    email: "info@ziontronics.co.ilj",
    contact: "(972) 3649 8642",
  },
  {
    type: "agent",
    title: "Agent (China)",
    office: "SEMTEK Technology Trading(Hong Kong) Limited",
    address: "4/F, 4B, No.51, South 4th section of the second ring road, Wuhou Dist, ChengDu",
    email: "steven.tang@semtek.cn",
    contact: "13193139115",
  },
  {
    type: "agent",
    title: "Agent (China)",
    office: "Shenzhen Lavincon Technology Ltd",
    address: "Rm807, Block B, Ipark Bg, No.26 Dengliang Rd, Nanshan ShenZhen, China",
    email: "landchan@kc-hk.com",
    contact: "+86-755-83662336 83668001",
  },
  {
    type: "agent",
    title: "Agent (Taiwan)",
    office: "LSH Electronics Co., Ltd",
    address:
      "No.1, Sec 1 Xuecheng Rd., Dashu Dist., Kaohsiung City, Taiwan (R.O.C) (Rm.61107,11F, International College)",
    email: "Benjamin@Ishe.com.tw",
    contact: "0935-346-196",
  },
  {
    type: "agent",
    title: "Agent (Taiwan)",
    office: "Chuan Yuan Electronics Co., Ltd",
    address: "No. 176-1, Minguang Rd., Taoyuan Dist., Taoyuan City 33043 (R.O.C.)",
    email: "angela@cye-co.com.tw",
    contact: "0935-551-771",
  },
  {
    type: "agent",
    title: "Agent (Japan)",
    office: "Fuji Tech Sales",
    address:
      "1-11-1 Kitasaiwai, Mizunobu Bldg. 7th Floor, Nish-ku,Yokohama, Kanagawa, Japan 220-0004",
    email: "info@fuji-tech.biz",
    contact: "+81 80-1240-3595",
    website: "www.fuji-tech.biz",
  },
  {
    type: "distributor",
    title: "Distributor (Netherlands)",
    office: "INNOVA Technologies",
    address: "Weesperzijde 25, 1091EC Amsterdam, The Netherlands",
    email: "eyal@innovatechnolog.com",
    contact: "(31) 20 670 21 82",
  },
  {
    type: "distributor",
    title: "Distributor (Italy)",
    office: "Starday S.R.L.",
    address: "Via Serra, 34 40012 Lippo di Calderara di Reno BO, Italy",
    email: "gianluca.guarnieri@stardaysrl.it",
    contact: "(39) 0513175148",
  },
  {
    type: "distributor",
    title: "Distributor (United Kingdom)",
    office: "Jauch Quartz UK Ltd",
    address: "Unit 4.7, Frimley 4 Business Park Frimley, Surrey, GU16 7SG, United Kingdom",
    email: "sales@jauch.com",
    contact: "+44-1276-6059-10",
  },
  {
    type: "distributor",
    title: "Distributor (France)",
    office: "Jauch Quartz France",
    address: "116 Rue de Silly, 92100 Boulogne-Billancourt, France",
    email: "celine.patureau@jauch.com",
    contact: "+33-1-469995-50",
  },
  {
    type: "distributor",
    title: "Distributor (America)",
    office: "Jauch Quartz America, Inc.",
    address: "43-100 Cook St, Suite 200, Palm Desert, CA 92211",
    email: "neil.floodgate@jauch.com",
    contact: "+1 760.282.3527",
  },
  {
    type: "distributor",
    title: "Distributor (Singapore)",
    office: "Supreme Components International (SCI)",
    address: "62 Jalan Eunos, Singapore 419591",
    email: "arvin@supremecomponents.com",
    contact: "+65 6848 1178",
    fax: "+65 6848 1176",
  },
];

const locationCategoryFromQuery = (search = globalThis.location?.search || "") => {
  const category = new URLSearchParams(search).get("category");
  return ["office", "agent", "distributor"].includes(category) ? category : "all";
};

function locationSlots(search) {
  const activeCategory = locationCategoryFromQuery(search);
  const button = (value, label) =>
    `<button class="${activeCategory === value ? "is-active" : ""}" type="button" data-location-filter="${value}" aria-pressed="${activeCategory === value}">${label}</button>`;
  const cards = (items) =>
    items
      .map(
        (item) =>
          `<article class="location-card" data-location-type="${item.type}"><h3>${item.title}</h3><p>${item.office}<br>${item.address}</p><p><a href="mailto:${item.email}">${item.email}</a></p><p>${item.contact}</p>${item.fax ? `<p>Fax: ${item.fax}</p>` : ""}${item.website ? `<p><a href="https://${item.website}" target="_blank" rel="noopener">${item.website}</a></p>` : ""}</article>`,
      )
      .join("");
  const groups = [
    ["office", "OFFICE"],
    ["agent", "AGENT"],
    ["distributor", "DISTRIBUTOR"],
  ]
    .map(
      ([type, label]) =>
        `<section class="location-group" data-location-group data-location-type="${type}" aria-labelledby="location-group-${type}"><h3 id="location-group-${type}" class="location-group-label">${label}</h3><div class="location-grid">${cards(locationData.filter((item) => item.type === type))}</div></section>`,
    )
    .join("");
  return {
    LOCATION_FILTER_BUTTONS:
      button("all", "ALL") +
      button("office", "Office") +
      button("agent", "Agent") +
      button("distributor", "Distributor"),
    LOCATION_GROUPS: groups,
  };
}

const supportRequestTypes = [
  "General Inquiry",
  "Request for Quotation",
  "Technical Support",
  "Quality / Complaint",
  "Book An Appointment",
  "Anonymous",
];

const supportProductCategoryGroups = [
  ["EMC Components", generalCategories["EMC Components"]],
  ["Magnetic Components", generalCategories["Magnetic Components"]],
  ["Transformers", generalCategories["Transformer"]],
  ["Wireless Power Transfer", generalCategories["Wireless Power Transfer"]],
  [
    "Automotive Components",
    [
      "Automotive Chip Array Ferrite Bead",
      "Automotive Ferrite Chip Bead",
      "Automotive Ferrite Chip Bead (Large Current)",
      "Automotive Semi-Shielded Power Inductor",
      "Automotive Common Mode Choke",
      "Automotive Molded Power Inductor",
      "Automotive Planar Inductor",
      "Automotive Transponder Coil",
      "Automotive Receiver Coil",
      "Automotive Transmitter Coil",
    ],
  ],
];

function supportRequestFromQuery(search = globalThis.location?.search || "") {
  const params = new URLSearchParams(search);
  const firstEntry = params.entries().next().value;
  const candidate =
    params.get("type") ||
    params.get("request") ||
    params.get("support") ||
    params.get("inquiry") ||
    params.get("help") ||
    firstEntry?.[1] ||
    firstEntry?.[0] ||
    "General Inquiry";
  const normalized = candidate
    .trim()
    .toLowerCase()
    .replace(/[_+-]+/g, " ")
    .replace(/\s+/g, " ");
  const aliases = {
    general: "General Inquiry",
    "general inquiry": "General Inquiry",
    quotation: "Request for Quotation",
    rfq: "Request for Quotation",
    "request for quotation": "Request for Quotation",
    technical: "Technical Support",
    "technical support": "Technical Support",
    quality: "Quality / Complaint",
    complaint: "Quality / Complaint",
    "quality complaint": "Quality / Complaint",
    "quality / complaint": "Quality / Complaint",
    appointment: "Book An Appointment",
    "book appointment": "Book An Appointment",
    "book an appointment": "Book An Appointment",
    anonymous: "Anonymous",
  };
  return (
    aliases[normalized] ||
    supportRequestTypes.find((type) => type.toLowerCase() === normalized) ||
    "General Inquiry"
  );
}

function supportSelectOptions(selectedType) {
  return supportRequestTypes
    .map(
      (type) =>
        `<option value="${type}" ${type === selectedType ? "selected" : ""}>${type}</option>`,
    )
    .join("");
}

function supportField(id, label, type = "text", attributes = "") {
  return `<div class="support-field"><label for="${id}">${label}</label><input id="${id}" name="${id}" type="${type}" ${attributes}></div>`;
}

function supportProductCategoryField() {
  const groups = supportProductCategoryGroups
    .map(([group, items], groupIndex) => {
      const options = items
        .map((item, itemIndex) => {
          const id = `support-category-${groupIndex}-${itemIndex}`;
          const detailId = `${id}-detail`;
          return `<div class="support-category-option-row" data-support-category-option>
          <label class="support-category-option" for="${id}">
            <input id="${id}" name="support-product-categories" type="checkbox" value="${escapeHtml(item)}">
            <span>${escapeHtml(item)}</span>
          </label>
          <div class="support-category-detail" data-support-category-detail hidden>
            <label class="sr-only" for="${detailId}">Series name or part number for ${escapeHtml(item)}</label>
            <input id="${detailId}" name="support-product-reference-${groupIndex}-${itemIndex}" type="text" placeholder="Series name or part number" data-support-category-detail-input disabled>
          </div>
        </div>`;
        })
        .join("");
      return `<section class="support-category-group" data-support-category-group>
        <h3>${escapeHtml(group)}</h3>
        ${options}
      </section>`;
    })
    .join("");
  return `<div class="support-field support-product-category-field" data-support-category>
      <span class="support-field-label" id="support-product-category-label">Product Category</span>
      <button class="support-category-trigger" type="button" data-support-category-trigger aria-haspopup="true" aria-expanded="false" aria-controls="support-product-category-panel">
        <span data-support-category-summary>Select product categories</span>
      </button>
      <div class="support-category-panel" id="support-product-category-panel" data-support-category-panel hidden>
        <label for="support-product-category-search">Search product categories</label>
        <input id="support-product-category-search" type="search" autocomplete="off" placeholder="Search category or subcategory" data-support-category-search>
        <div class="support-category-options">
          ${groups}
          <section class="support-category-group support-category-other-group" data-support-category-group>
            <h3>Other</h3>
            <div class="support-category-option-row" data-support-category-option>
              <label class="support-category-option" for="support-category-other">
                <input id="support-category-other" name="support-product-categories" type="checkbox" value="Other" data-support-category-other>
                <span>Other</span>
              </label>
            </div>
          </section>
          <p class="support-category-empty" data-support-category-empty hidden>No matching product categories.</p>
        </div>
      </div>
      <div class="support-category-other-field" data-support-category-other-field hidden>
        <label for="support-category-other-text">Other product category</label>
        <input id="support-category-other-text" name="support-product-category-other" type="text" placeholder="Please specify" data-support-category-other-input disabled>
      </div>
    </div>`;
}

function supportContactAndBusinessFields() {
  return `<div class="support-details-columns">
      <section class="support-detail-column" aria-labelledby="support-contact-heading">
        <h2 id="support-contact-heading">Contact details</h2>
        <div class="support-field-panel">
          ${supportField("support-full-name", "Full Name", "text", 'autocomplete="name" required')}
          <div class="support-two-fields">
            ${supportField("support-job-title", "Job Title / Department", "text", 'autocomplete="organization-title"')}
            ${supportField("support-phone", "Phone Number", "tel", 'autocomplete="tel"')}
          </div>
          ${supportField("support-email", "Business Email", "email", 'autocomplete="email" required')}
        </div>
      </section>
      <section class="support-detail-column" aria-labelledby="support-business-heading">
        <h2 id="support-business-heading">Business / project info</h2>
        <div class="support-field-panel">
          <div class="support-two-fields">
            ${supportField("support-company", "Company Name", "text", 'autocomplete="organization" required')}
            ${supportField("support-industry", "Industry")}
            ${supportField("support-country", "Country / Region", "text", 'autocomplete="country-name"')}
            <div class="support-field"><label for="support-timeline">Project Timeline</label><select id="support-timeline" name="support-timeline"><option>1–3 months</option><option>3–6 months</option><option>6–12 months</option><option>More than 12 months</option></select></div>
          </div>
          ${supportField("support-website", "Company Website", "url", 'autocomplete="url"')}
        </div>
      </section>
    </div>`;
}

function supportAttachmentField() {
  return `<section class="support-form-section">
      <h2>Attachment</h2>
      <label class="support-file-control" for="support-attachment">
        <span data-support-file-name>No file selected</span>
        <strong>Choose file</strong>
      </label>
      <input class="sr-only" id="support-attachment" name="support-attachment" type="file" data-support-file accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg">
      <small class="support-help" data-support-file-status>Maximum allowed file size is 6 MB</small>
    </section>`;
}

function supportAppointmentFields() {
  return `<section class="support-form-section">
      <h2>Appointment Location</h2>
      <div class="support-field support-wide-select"><label class="sr-only" for="support-appointment-location">Appointment Location</label><select id="support-appointment-location" name="support-appointment-location"><option>Singapore Office</option><option>Hong Kong Office</option><option>Dongguan Office</option></select></div>
    </section>
    <section class="support-form-section">
      <h2>Book An Appointment Date</h2>
      <div class="support-appointment-grid">
        <fieldset class="support-appointment-card">
          <legend>Preferred date 1</legend>
          <div class="support-two-fields">
            ${supportField("support-date-one", "Date", "date", "required")}
            <div class="support-field"><label for="support-time-one">Time</label><select id="support-time-one" name="support-time-one"><option value="">Select time</option><option>9:00 AM</option><option>10:00 AM</option><option>11:00 AM</option><option>2:00 PM</option><option>3:00 PM</option><option>4:00 PM</option></select></div>
          </div>
        </fieldset>
        <fieldset class="support-appointment-card">
          <legend>Preferred date 2</legend>
          <div class="support-two-fields">
            ${supportField("support-date-two", "Date", "date")}
            <div class="support-field"><label for="support-time-two">Time</label><select id="support-time-two" name="support-time-two"><option value="">Select time</option><option>9:00 AM</option><option>10:00 AM</option><option>11:00 AM</option><option>2:00 PM</option><option>3:00 PM</option><option>4:00 PM</option></select></div>
          </div>
        </fieldset>
      </div>
    </section>`;
}

function supportOfficeCards() {
  const supportLocations = locationData.filter((item) => item.type === "office");
  const cards = supportLocations
    .map((item, index) => {
      const isHeadOffice = index === 0;
      return `<article class="support-location-card" data-support-location-card aria-label="${escapeHtml(item.title)}">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.office)}<br>${escapeHtml(item.address)}</p>
        <p><a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a></p>
        <p>${escapeHtml(item.contact)}</p>
        ${item.fax ? `<p>${escapeHtml(item.fax)}</p>` : ""}
        ${item.website ? `<p><a href="https://${escapeHtml(item.website)}" target="_blank" rel="noopener">${escapeHtml(item.website)}</a></p>` : ""}
        ${isHeadOffice ? `<p><a href="https://maps.google.com/?q=16+New+Industrial+Road+Singapore+536204" target="_blank" rel="noopener">Get Directions</a></p><p>${link(routes.support + "?type=Book%20An%20Appointment", "Book an Appointment")}</p>` : ""}
      </article>`;
    })
    .join("");
  return `<section id="superworld_electronics_support_superworld_electronics_locations" class="support-locations" aria-labelledby="support-locations-heading">
      <h2 id="support-locations-heading">SUPERWORLD ELECTRONICS LOCATIONS</h2>
      <div id="support-location-slider" class="support-location-grid" data-support-location-grid tabindex="0" aria-label="Superworld Electronics locations slider">
        ${cards}
      </div>
      <div class="support-location-controls">
        <button type="button" data-support-location-prev aria-controls="support-location-slider" aria-label="Previous location"><span aria-hidden="true">‹</span> Prev</button>
        <button type="button" data-support-location-next aria-controls="support-location-slider" aria-label="Next location">Next <span aria-hidden="true">›</span></button>
      </div>
    </section>`;
}

function supportSlots(search) {
  const requestType = supportRequestFromQuery(search);
  return {
    SUPPORT_REQUEST_TYPE_OPTIONS: supportSelectOptions(requestType),
    SUPPORT_PRODUCT_CATEGORIES: supportProductCategoryField(),
    SUPPORT_CONTACT_BUSINESS_FIELDS:
      requestType === "Anonymous" ? "" : supportContactAndBusinessFields(),
    SUPPORT_APPOINTMENT_FIELDS:
      requestType === "Book An Appointment" ? supportAppointmentFields() : "",
    SUPPORT_OFFICE_CARDS: supportOfficeCards(),
  };
}

function inquirySummaryContent(state) {
  const cartRows = state.inquiryProducts
    .map((product, i) => {
      const sku = escapeHtml(product.sku || product.name || product.series || "Product");
      const specifications = (product.fields || [])
        .filter((field) => {
          const value = product.values?.[field.key];
          return value !== null && value !== undefined && value !== "";
        })
        .map(
          (field) =>
            `<div><dt>${escapeHtml(productFieldLabel(field))}</dt><dd>${escapeHtml(product.values[field.key])}</dd></div>`,
        )
        .join("");
      return `<div class="cart-row" data-cart-row="${i}"><div class="cart-number">${i + 1}</div><div class="cart-product">${ph("", `${sku} Product`, 140, 96, `${sku}\nProduct`)}<div class="cart-product-copy"><h3>${sku}</h3><p><strong>Part ID</strong><br>${product.id}</p><p><strong>Series</strong><br>${escapeHtml(product.series || "—")}</p><p><strong>Category</strong><br>${escapeHtml(product.category || "—")}</p>${specifications ? `<dl class="cart-specs">${specifications}</dl>` : ""}</div></div><div class="cart-quantity"><div class="quantity"><button type="button" data-qty="${i}" data-delta="1" aria-label="Increase quantity for ${sku}">+</button><output aria-label="Quantity for ${sku}">${state.cart[i]}</output><button type="button" data-qty="${i}" data-delta="-1" aria-label="Decrease quantity for ${sku}">−</button></div><button class="cart-remove" type="button" data-remove="${i}">Remove</button></div></div>`;
    })
    .join("");
  const pending = state.inquiryQueryKey && state.inquiryResolvedKey !== state.inquiryQueryKey;
  const summaryContent = pending
    ? `<div class="inquiry-empty" role="status">Loading selected products…</div>`
    : state.inquiryError
      ? `<div class="inquiry-empty inquiry-error" role="alert">${escapeHtml(state.inquiryError)}</div>`
      : cartRows ||
        `<div class="inquiry-empty"><h3>Your inquiry cart is empty.</h3>${buttonLink(routes.tools, "Search Products")}</div>`;
  return summaryContent;
}

export class PageRegistry {
  constructor(templates) {
    this.templates = templates;
  }

  slotsForPath(path, state, search = globalThis.location?.search || "") {
    path = path.replace(/\/+$/, "") || "/";
    if (path === "/news") return newsSlots(search);
    if (path === "/locations") return locationSlots(search);
    if (path === "/support") return supportSlots(search);
    if (path === "/inquiry") return { INQUIRY_SUMMARY_CONTENT: inquirySummaryContent(state) };
    return {};
  }

  render(path, slots = {}) {
    path = path.replace(/\/+$/, "") || "/";
    let markup = this.templates.get(path);
    if (!markup) {
      const productRoute = matchProductRoute(path);
      if (productRoute?.type === "group") markup = productGroup;
      else if (productRoute?.type === "family") markup = productFamily;
      else if (productRoute?.type === "series") markup = productSeries;
    }
    if (!markup)
      return `<main id="main-content" class="page-main"><section class="section"><div class="container"><h1>Page not found</h1><a data-link class="button " href="/">Return Home</a></div></section></main>`;
    Object.entries(slots).forEach(([name, value]) => {
      markup = replaceSlot(markup, name, value);
    });
    return markup.replace(/<!--APP_SLOT:[A-Z_]+-->/g, "");
  }
}

export const pageRegistry = new PageRegistry(pages);
export { footer, header, pages };

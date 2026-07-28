import specSearchMarkup from "../.generated/spec-search-markup.txt";

(function clientApp() {
  const app = document.getElementById("app");
  const state = {
    cart: [],
    inquiryProducts: [],
    inquiryQueryKey: null,
    inquiryResolvedKey: null,
    inquiryLoading: false,
    inquiryError: "",
    timers: [],
    cleanups: [],
    newsPage: 1
  };

  const routes = {
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
    thanks: "/thank-you"
  };

  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);

  const inquiryIdsFromQuery = () => Array.from(new Set(new URLSearchParams(location.search)
    .getAll("inquiry")
    .map(Number)
    .filter((value) => Number.isInteger(value) && value > 0)));

  const safeDataUrl = (value, prefix) => typeof value === "string" && value.startsWith(prefix) && !/["<>\s]/.test(value) ? value : "";

  const ph = (className = "") => `<div class="ph ${className}" aria-label="Image placeholder"></div>`;
  const logo = (className = "") => `<img class="${className}" src="/assets/logo.webp" alt="Superworld Electronics">`;
  const a4kImage = (className = "") => `<img class="${className}" src="/assets/a4k-product.webp" alt="A4K chip array ferrite bead">`;
  const link = (href, label, className = "") => `<a data-link class="${className}" href="${href}">${label}</a>`;
  const buttonLink = (href, label, className = "") => link(href, label, `button ${className}`);
  const crumb = (items) => `<div class="container crumb">${items.map((item, i) => i === items.length - 1 ? `<span>${item[0]}</span>` : `${link(item[1], item[0])} &gt; `).join("")}</div>`;
  const tags = (items) => `<div class="tag-row">${items.map((x) => `<span class="tag">${x}</span>`).join("")}</div>`;
  const pagination = () => `<div class="pagination">${[1,2,3,4,5].map(n => `<button type="button" data-page="${n}">${n}</button>`).join("")}</div>`;
  const heroPanel = (title, copy, tagItems = [], compact = false) => `
    <div class="container">
      <div class="hero-panel ${compact ? "compact" : ""}">
        <div>
          <h1>${title}</h1>
          <p>${copy}</p>
          ${tagItems.length ? tags(tagItems) : ""}
        </div>
        <div class="hero-brand">${logo()}</div>
      </div>
    </div>`;

  function card(title, copy, className = "") {
    return `<article class="card ${className}"><h3>${title}</h3><p>${copy}</p></article>`;
  }

  function mediaCard(title, copy, label = "View More", href = "#") {
    return `<article class="media-card slide">
      ${ph("soft")}
      <div class="media-card-body"><h3>${title}</h3><p>${copy}</p>
      <div class="media-card-footer">${href === "#" ? `<button class="link-arrow" type="button">${label}</button>` : link(href, label, "link-arrow")}<span>17 December 2025</span></div></div>
    </article>`;
  }

  function carousel(id, slides, visible = 4, controls = true, extraClass = "") {
    return `<div class="carousel ${extraClass}" data-carousel="${id}" style="--visible:${visible}">
      <div class="carousel-window"><div class="carousel-track">${slides.join("")}</div></div>
      ${controls ? `<div class="carousel-controls"><button type="button" data-prev aria-label="Previous slide">Prev</button><div class="carousel-dots"></div><button type="button" data-next aria-label="Next slide">Next</button></div>` : `<div class="carousel-dots"></div>`}
    </div>`;
  }

  function header() {
    return `<header class="site-header">
      <div class="utility"><div class="container">
        <button type="button" data-menu="about">About <span class="menu-caret">⌄</span></button>
        ${link(routes.calendar, "Events", "nav-link")}
        <button type="button" data-menu="support">Support <span class="menu-caret">⌄</span></button>
        <button type="button" data-menu="language">EN <span class="menu-caret">⌄</span></button>
      </div></div>
      <div class="primary-nav"><div class="container">
        ${link(routes.home, logo(), "brand")}
        <button class="mobile-toggle" type="button" aria-label="Open navigation" aria-expanded="false">Menu</button>
        <nav class="nav-list" aria-label="Main navigation">
          <button class="nav-menu-button" type="button" data-menu="products">Our Products <span class="menu-caret">⌄</span></button>
          ${link(routes.applications, "Applications", "nav-link")}
          ${link(routes.tools, "Tools", "nav-link")}
          <button class="nav-menu-button" type="button" data-menu="news">News</button>
        </nav>
      </div></div>
      <div class="mega-panel" data-panel="about"><div class="container mega-inner simple">
        ${link(routes.company, "Our Company")}
        ${link(routes.achievements, "Key Achievements")}
        ${link(routes.quality, "Quality Standards")}
        ${link(routes.sustainability, "Sustainability")}
        ${link(routes.locations, "Global Presence")}
      </div></div>
      <div class="mega-panel" data-panel="support"><div class="container mega-inner simple">
        ${link(routes.support+"?type=Request%20for%20Quotation", "Request for Quotation")}
        ${link(routes.support+"?type=Technical%20Support", "Technical Support")}
        ${link(routes.support+"?type=Quality%20%2F%20Complaint", "Quality / Complaint")}
        ${link(routes.locations, "Service & Sales Offices")}
      </div></div>
      <div class="mega-panel" data-panel="language"><div class="container mega-inner languages">
        <a href="#" data-language="English">English</a><a href="#" data-language="Chinese (Simplified)">Chinese (Simplified)</a>
        <a href="#" data-language="Chinese (Traditional)">Chinese (Traditional)</a><a href="#" data-language="German">German</a>
        <a href="#" data-language="Japanese">Japanese</a><a href="#" data-language="Korean">Korean</a>
      </div></div>
      <div class="mega-panel" data-panel="products"><div class="container mega-inner simple">
        ${link(routes.products, "All Products")}
        ${link(routes.general, "General Components")}
        <span aria-disabled="true">Automotive Components</span>
      </div></div>
      <div class="mega-panel" data-panel="news"><div class="container mega-inner news-mega">
        <div class="mega-column"><h4>Company News</h4>
          ${link(routes.news + "?category=announcements", "Announcements")}
          ${link(routes.news + "?category=csr", "CSR")}
          ${link(routes.news + "?category=business", "Business Updates")}
        </div>
        <div class="mega-column"><h4>Events & Activities</h4>
          ${link(routes.calendar, "Event Calendar")}
          ${link(routes.news + "?category=events", "Exhibitions & Trade Shows")}
          ${link(routes.news + "?category=events", "Corporate Events")}
        </div>
        <div class="mega-column"><h4>Product News</h4>
          ${link(routes.news + "?category=product", "New Product Releases")}
          ${link(routes.news + "?category=latest", "Product Enhancements")}
          ${link(routes.news + "?category=eol", "End-of-Life (EOL) Notices")}
        </div>
        <div class="mega-news-slider" data-mega-news-slider>
          <button class="mega-news-control mega-news-prev" type="button" data-mega-news-prev aria-label="Previous news events"><span aria-hidden="true"></span></button>
          <div class="mega-news-window"><div class="mega-news-track">
            <article class="mega-news-card">${ph()}<strong>Electronica — India</strong><small>Bangalore International Exhibition Centre</small>${link(routes.calendar,"Learn More","mega-news-link")}</article>
            <article class="mega-news-card">${ph()}<strong>NEPCON Japan 2026</strong><small>Tokyo Big Sight, Japan</small>${link(routes.calendar,"Learn More","mega-news-link")}</article>
            <article class="mega-news-card">${ph()}<strong>Electronica — India</strong><small>Bangalore International Exhibition Centre</small>${link(routes.calendar,"Learn More","mega-news-link")}</article>
            <article class="mega-news-card">${ph()}<strong>NEPCON Japan 2026</strong><small>Tokyo Big Sight, Japan</small>${link(routes.calendar,"Learn More","mega-news-link")}</article>
          </div></div>
          <button class="mega-news-control mega-news-next" type="button" data-mega-news-next aria-label="Next news events"><span aria-hidden="true"></span></button>
        </div>
      </div></div>
    </header>`;
  }

  function footer() {
    return `<footer class="footer"><div class="container">
      <div class="footer-top"><div class="footer-brand">${logo()}</div><div class="socials"><span class="social">Chat</span><span class="social">in</span></div></div>
      <div class="footer-grid">
        <div><h3>About</h3>${link(routes.company,"Our Company")}${link(routes.achievements,"Key Achievements")}${link(routes.quality,"Quality Standards")}${link(routes.sustainability,"Sustainability")}</div>
        <div><h3>Our Products</h3>${link(routes.general,"General")}${link(routes.products,"Automotive")}</div>
        <div><h3>Applications</h3>${link(routes.automotive,"Automotive")}${link(routes.communication,"AI, HPC & Emerging Tech")}${link(routes.applications,"Consumer")}${link(routes.applications,"Healthcare Devices")}${link(routes.applications,"Industrial & Energy")}${link(routes.applications,"Smart Home")}</div>
        <div><h3>News</h3>${link(routes.news+"?category=business","Company News")}${link(routes.news+"?category=product","Product News")}${link(routes.news+"?category=events","Events & Activities")}${link(routes.news+"?category=brochures","Resources")}</div>
        <div><h3>Tools</h3>${link(routes.tools,"Specification Search")}</div>
        <div><h3>Contact Us</h3>${link(routes.support+"?type=Request%20for%20Quotation","Request for Quotation")}${link(routes.support+"?type=Technical%20Support","Technical Support")}${link(routes.support+"?type=Quality%20%2F%20Complaint","Quality / Complaint")}${link(routes.locations,"Service & Sales Offices")}</div>
      </div>
      <div class="footer-bottom"><span>Terms of Use | Privacy Policy</span><span>© Superworld Electronics (S) Pte Ltd. All Rights Reserved.</span></div>
    </div></footer>`;
  }

  function homePage() {
    const heroSlides = [1,2,3].map(() => `<div class="slide">${ph("hero-ph")}</div>`);
    const achievements = [
      ["SINGAPORE","Headquarter Office","Established 1993"],
      ["GLOBAL","Manufacturing & support","SG · MY · CN · TW · TH"],
      ["ISO","ISO 9001:2015 &","ISO 14001:2015 Certified"],
      ["IATF 16949","2016 Certified",""],
      ["WPC","Wireless power member","Consortium Since 2017"]
    ];
    const releases = Array.from({length:6},() => mediaCard("A4K Series","Chip Array Ferrite Bead","View More",routes.a4k));
    const productLines = [
      ["EMC Components","Solutions supporting noise suppression, compliance, and product stability in electronic systems.",routes.emc],
      ["Magnetic Components","Core magnetic products supporting a wide range of electronic, industrial, and power-related applications.",routes.general],
      ["Transformers","Transformer solutions developed for consistent performance, manufacturing control, and application fit.",routes.general],
      ["Wireless Power Transfer","Wireless charging-related solutions supporting evolving demand in modern electronics and mobility.",routes.general],
      ["Automotive Components","Reliable component solutions for connected vehicle electronics.",routes.products]
    ].map(x => mediaCard(x[0],x[1],"View More",x[2]));
    const certs = Array.from({length:6},() => mediaCard("IATF 16949","Quality management certification.","Download","#"));
    const news = Array.from({length:6},() => mediaCard("Our Johor Bahru facility is progressing","Business Updates","View More",routes.detail));
    return `<main id="main-content" class="page-main">
      <section class="home-hero">${carousel("home-hero",heroSlides,1,false,"home-hero-carousel")}</section>
      <div class="container achievement-strip">${achievements.map(x=>`<div class="achievement"><h3>${x[0]}</h3><p>${x[1]}<br><small>${x[2]}</small></p></div>`).join("")}</div>
      <section class="section"><div class="container">
        <div class="section-heading"><h2>LATEST PRODUCT RELEASES</h2>${link(routes.news+"?category=product","View More","link-arrow")}</div>
        ${carousel("home-releases",releases,5)}
      </div></section>
      <section class="section-sm"><div class="container company-overview">
        <div><h2>COMPANY OVERVIEW</h2><p>A component partner supporting design, manufacturing, quality control, and customer enquiries.</p>
        <div class="company-values"><div class="company-value"><h3>Engineering</h3><p>Design support</p></div><div class="company-value"><h3>Production</h3><p>Process control</p></div><div class="company-value"><h3>Quality</h3><p>Testing support</p></div><div class="company-value"><h3>Service</h3><p>Global response</p></div></div>
        ${link(routes.company,"View Our Company","link-arrow")}</div>${ph("tall")}
      </div></section>
      <section class="section"><div class="container">
        <div class="section-heading"><h2>DISCOVER OUR CORE PRODUCT LINES</h2><div class="button-group"><button class="button small" type="button" data-product-tab="general" data-product-carousel="home-products">General</button><button class="button small" type="button" data-product-tab="automotive" data-product-carousel="home-products">Automotive</button></div></div>
        ${carousel("home-products",productLines,4)}
      </div></section>
      <section class="section"><div class="container">
        <h2>INDUSTRIES WE SERVE</h2><div class="industries-layout">${ph("tall")}<div class="industry-list">
          ${["Automotive","Communication","Consumer","Healthcare","Industrial & Energy","Smart Home"].map(x=>`<article class="industry-row"><h3>${x}</h3><p>Application-specific component support.</p></article>`).join("")}
        </div></div>
      </div></section>
      <section class="section"><div class="container">
        <div class="section-heading center"><h2>REGIONAL SUPPORT FOR GLOBAL CUSTOMERS</h2><p>Manufacturing, engineering, sales, and logistics support across key markets.</p></div>${ph("map")}
        <div class="regions" style="margin-top:38px">${regionCards()}</div>
      </div></section>
      <section class="section section-rule"><div class="container">
        <div class="section-heading"><h2>QUALITY CERTIFIED, PERFORMANCE ASSURED</h2>${link(routes.quality,"View More","link-arrow")}</div>${carousel("home-certs",certs,4)}
      </div></section>
      <section class="section section-rule"><div class="container">
        <div class="section-heading"><h2>LATEST NEWS</h2>${link(routes.news,"View More","link-arrow")}</div>${carousel("home-news",news,4)}
      </div></section>
    </main>`;
  }

  function regionCards() {
    const data = [
      ["Singapore (HQ)","R&D Engineering Support<br>Sales Support<br>Logistic Hub"],
      ["USA","Sales and Engineering Support<br>Logistic Hub"],
      ["UK","Sales and Engineering Support<br>Logistic Hub"],
      ["France","Sales and Engineering Support<br>Logistic Hub"],
      ["Italy","Sales and Engineering Support<br>Logistic Hub"],
      ["North China","Manufacturing<br>R&D Engineering Support<br>Sales Support"],
      ["South China","Manufacturing<br>R&D Engineering Support<br>Sales Support<br>Logistic Hub"],
      ["Taiwan","Manufacturing<br>R&D Engineering Support<br>Sales Support<br>Logistic Hub"],
      ["Malaysia","Engineering Support<br>Sales Support"],
      ["Israel","Sales and Engineering Support<br>Logistic Hub"]
    ];
    return data.map(x=>`<article class="region"><h3>${x[0]}</h3><p>${x[1]}</p></article>`).join("");
  }

  function companyPage() {
    const productLines = [
      ["EMC Components","Solutions supporting noise suppression, compliance, and product stability in electronic systems."],
      ["Magnetic Components","Core magnetic products supporting a wide range of electronic, industrial, and power-related applications."],
      ["Transformers","Transformer solutions developed for consistent performance, manufacturing control, and application fit."],
      ["Wireless Power Transfer","Wireless charging-related solutions supporting evolving demand in modern electronics and mobility."]
    ];
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["OUR COMPANY"]])}
      ${heroPanel("YOUR SOLUTIONS TO<br>ELECTRO-MAGNETIC COMPONENTS","Superworld Electronics is a leading designer and manufacturer of magnetics and electronic products and solutions, offering a wide range of products for diverse industry needs.",["Established 1993","Design & Engineering","Automotive Compliance","Manufacturing Capabilities"])}
      <nav class="anchor-nav">${["WHAT DRIVES US","WHO WE ARE","INDUSTRIES","GLOBAL PRESENCE","MILESTONES"].map(x=>`<a href="#${x.toLowerCase().replaceAll(" ","-")}">${x}</a>`).join("")}</nav>
      <section id="what-drives-us" class="section-sm"><div class="container split">
        <div><h2>WHAT DRIVES US</h2><p>The values that shape how we build, support, & grow.</p></div>
        <div class="grid grid-3">${card("CORE BUSINESS","Design & Manufacture of Magnetic Components")}${card("VISION","Quality · Well-Being · Better Life")}${card("MISSION","Passion. Pride. Speed. Innovative magnetic solutions for stronger businesses & a better world.")}</div>
      </div></section>
      <section id="who-we-are" class="section"><div class="container"><h2>WHO WE ARE</h2><p>A snapshot of our scale, experience, and innovation.</p>
        <div class="stat-grid"><div class="stat"><strong>Singapore</strong><b>Headquarter Office</b><span>Established 1993</span></div><div class="stat"><strong>2400</strong><b>Employees</b><span>Singapore · Taiwan · China · Hong Kong · Malaysia</span></div><div class="stat"><strong>8</strong><b>Factories</b><span>Singapore · Malaysia · Taiwan · China · Thailand</span></div></div>
        <div class="grid grid-4" style="margin-top:24px"><div class="stat"><strong>4</strong><b>Core Product Lines</b></div><div class="stat"><strong>145</strong><b>Patents</b></div><div class="stat"><strong>3%</strong><b>R&D Investment Ratio</b></div><div class="stat"><strong>26%</strong><b>High-Reliability Market Exposure</b></div></div>
      </div></section>
      <section class="section"><div class="container"><div class="section-heading"><h2>PRODUCT LINES</h2><div class="button-group"><button>General</button><button>Automotive</button></div></div>
        <div class="grid grid-4">${productLines.map(x=>`<article class="media-card">${ph()}<div class="media-card-body"><h3>${x[0]}</h3><p>${x[1]}</p>${link(routes.products,"View More","link-arrow")}</div></article>`).join("")}</div>
      </div></section>
      <section id="industries" class="section"><div class="container"><h2>INDUSTRIES</h2><p>Serving a broad range of electronics markets.</p>
        ${carousel("company-industries",["Automotive","Healthcare","Consumer","Industrial","Communication"].map(x=>`<div class="slide card">${ph("tall")}<h3 style="margin-top:18px">${x}</h3></div>`),4)}
      </div></section>
      <section id="global-presence" class="section section-rule"><div class="container split"><div><h2>GLOBAL PRESENCE</h2><p>Headquartered in Singapore with regional manufacturing and operations across Asia.</p><h3>REGIONAL FOOTPRINT</h3><p>Singapore · China · Malaysia · Taiwan · Thailand</p><h3>WORKING MODEL</h3><p>Development, manufacturing, and customer support aligned across locations.</p></div>${ph("map")}</div></section>
      <section id="milestones" class="section section-rule"><div class="container"><div class="section-heading center"><h2>MILESTONES</h2><p>A timeline of important milestones that have shaped Superworld Electronics' journey and success.</p></div>
        <div class="timeline"><div class="timeline-row">${["2011 – 2014","2007 – 2010","2000 – 2006","1993 – 1999","1975"].map((x,i)=>`<div class="timeline-item ${i===2?"active":""}"><h3>${x}</h3><div class="timeline-circle"></div>${i===2?`<h3>Foundation</h3><p>Established Singapore Headquarters Office</p>`:""}</div>`).join("")}</div></div>
      </div></section>
      <section class="section"><div class="container"><div class="section-heading center"><h2>STRENGTHS BEYOND THE PRODUCT</h2></div><div class="grid grid-4">
        ${card("Diversified Manufacturing & Engineering Sites","Regional factory presence supports capacity, continuity, and long-term supply programs.")}
        ${card("Design & Engineering Support","Technical resources help bridge customer requirements with practical manufacturing execution.")}
        ${card("Innovation & Patents","R&D investment and patent activity reflect continuous product and process improvement.")}
        ${card("Higher-Reliability Exposure","Automotive, industrial, and medical market experience strengthens credibility.")}
      </div><div class="cta" style="margin-top:70px"><div><h2>Ready to Work with Superworld Electronics?</h2><p>Connect with our team to discuss your product requirements and explore the right solution.</p></div><div class="button-group">${buttonLink(routes.inquiry,"Contact Us")}${buttonLink(routes.products,"View Product Lines")}</div></div></div></section>
    </main>`;
  }

  function achievementsPage() {
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["OUR COMPANY",routes.company],["KEY ACHIEVEMENTS"]])}
      ${heroPanel("ACHIEVEMENTS","A visual record of our commitment to excellence, innovation, and global supply chain reliability.",["Customer Recognition","Enterprise Achievement","Corporate Distinction"])}
      <nav class="anchor-nav"><a href="#customer-awards">CUSTOMER AWARDS</a><a href="#enterprise">SINGAPORE ENTERPRISE 50</a><a href="#distinguished">DISTINGUISHED AWARDS</a></nav>
      <section id="enterprise" class="section"><div class="container"><h2>SINGAPORE ENTERPRISE 50</h2><div class="award-grid enterprise-awards-grid">
        <article class="award-card featured"><div class="award-featured-image" role="img" aria-label="Enterprise 50 award image placeholder, 320 by 400 pixels"><span>Image Placeholder</span><strong>320 × 400 px</strong></div><div class="award-featured-copy"><span>2012</span><h2>5 Years Award</h2><p>Consecutive Recognition Milestone</p></div></article>
        ${[["2012","03"],["2011","05"],["2010","24"],["2009","21"],["2007","39"]].map(x=>`<article class="award-card"><span>${x[0]}</span><div class="display" style="font-size:62px">${x[1]}</div><p>National Rank</p></article>`).join("")}
        <article class="award-card"><h3>Superworld Electronics<br>Growth Legacy</h3></article>
      </div></div></section>
      <section id="distinguished" class="section"><div class="container"><h2>DISTINGUISHED AWARDS</h2><div class="achievement-detail-layout">
        <div class="achievement-list"><article class="achievement-list-item"><span>2019</span><h3>SINGAPORE INTERNATIONAL 100 COMPANY AWARD</h3><p>Presented by Singapore 1000</p></article><article class="achievement-list-item"><span>2012</span><h3>SME ONE ASIA AWARDS – DISTINGUISHED AWARD</h3><p>Asia Pacific Excellence</p></article><article class="achievement-list-item"><span>2008</span><h3>STANDARD CHARTERED – Top 100 SMEs Award</h3></article><article class="achievement-list-item"><span>2007 / 2008</span><h3>SME GROWTH EXCELLENCE RECOGNITION</h3><p>Growth Excellence for Net Profit Award (2007)<br>Growth Excellence for Top Internationalising SMEs Award (2007)<br>Growth Excellence for Top Internationalising SMEs Award (2008)</p></article></div><div class="achievement-image-placeholder" role="img" aria-label="Distinguished awards image placeholder, 540 by 670 pixels"><span>Image Placeholder</span><strong>540 × 670 px</strong></div></div>
      </div></section>
      <section id="customer-awards" class="section"><div class="container"><h2>CUSTOMER AWARDS</h2><div class="achievement-detail-layout">
        <div class="achievement-list"><article class="achievement-list-item"><span>2019</span><h3>Quality Excellence Award</h3><p>Client Recognition</p></article><article class="achievement-list-item"><span>2018</span><h3>Excellent Supply Performance</h3><p>Operational Milestone</p></article><article class="achievement-list-item"><span>2012</span><h3>Supplier Day Appreciation Award</h3></article><article class="achievement-list-item"><span>2011</span><h3>Excellent Manufacturer Award</h3></article><article class="achievement-list-item"><span>2008</span><h3>Silver Supplier</h3></article></div><div class="achievement-image-placeholder" role="img" aria-label="Customer awards image placeholder, 540 by 670 pixels"><span>Image Placeholder</span><strong>540 × 670 px</strong></div></div>
      </div></section>
    </main>`;
  }

  function qualityPage() {
    const qms = [
      ["01","Supplier Quality","Approved materials & source control."],
      ["02","Incoming Inspection","Defined checks before production."],
      ["03","Qualification","Validation for product readiness."],
      ["04","Process Control","In-process & final release control."],
      ["05","Support","24–48hrs Response<br>Dedicated Engineering<br>Quality Team"]
    ];
    const complianceCards = [
      ["RoHS 3.0", "Directive 2015/863/EU compliance.", "Download Declaration", "/downloads/rohs-declaration.pdf", "Superworld-RoHS-Declaration.pdf"],
      ["REACH", "SVHC disclosure and monitoring.", "Download Statement", "/downloads/reach-statement.pdf", "Superworld-REACH-Statement.pdf"],
      ["CONFLICT MINERALS", "Ethical 3TG sourcing report.", "Download RMI Template", "/downloads/rmi-template.pdf", "Superworld-RMI-Template.pdf"]
    ].map((item) => `<article class="quality-compliance-card"><h3>${item[0]}</h3><p>${item[1]}</p><a class="quality-download-link" href="${item[3]}" download="${item[4]}">${item[2]}</a></article>`).join("");
    const certCards = Array.from({length:40},(_, index) => `<article class="quality-certificate-card" data-certificate-card${index >= 8 ? " hidden" : ""}>
      <div class="quality-certificate-visual" role="img" aria-label="Certification image placeholder ${index + 1}"><span class="certification-tag">Certification</span></div>
      <div class="quality-certificate-copy"><h3>IATF 16949</h3><p>Quality management certification.</p>
        <div class="quality-certificate-footer"><a class="quality-download-link" href="/downloads/iatf-16949-certificate.pdf" download="Superworld-IATF-16949-Certificate.pdf">Download</a><span>17 December 2025</span></div>
      </div>
    </article>`).join("");
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["OUR COMPANY",routes.company],["QUALITY STANDARDS"]])}
      <div class="quality-hero-shell"><div class="quality-hero-panel"><div class="quality-hero-copy"><h1>QUALITY BUILT<br>INTO EVERY STEP</h1><p>At Superworld Electronics, "QUALITY MEANS DOING THINGS RIGHT THE FIRST TIME"<br>— through disciplined processes, controlled inspection, and dependable validation.</p><div class="quality-hero-tags"><span><strong>SYSTEM</strong><small>Certified quality framework</small></span><span><strong>PROCESS</strong><small>Controlled inspection flow</small></span><span><strong>TRUST</strong><small>Customer-ready documentation</small></span></div></div><div class="quality-hero-brand">${logo()}</div></div></div>
      <nav class="anchor-nav"><a href="#qms">QUALITY MANAGEMENT SYSTEM</a><a href="#reliability">RELIABILITY TEST STANDARDS</a><a href="#compliance">COMPLIANCE & ENVIRONMENT</a><a href="#certs">CERTIFICATION VAULT</a></nav>
      <section id="qms" class="section quality-wireframe-section quality-qms"><div class="container"><h2>QUALITY MANAGEMENT SYSTEM</h2><p class="quality-section-intro">End-to-end structural integrity through rigorous supplier audits, Statistical Process Control (SPC), and strict global standards to eliminate defects at every production stage.</p><div class="quality-qms-grid">${qms.map(x=>`<article class="quality-step-card"><span class="quality-step-number">${x[0]}</span><h3>${x[1]}</h3><p>${x[2]}</p></article>`).join("")}</div></div></section>
      <section id="reliability" class="section"><div class="container"><h2>RELIABILITY TEST STANDARDS</h2><p>From commercial to automotive standards, our components are tested to ensure reliable performance.</p><div class="grid grid-2 reliability-standard-grid">
        <article class="card reliability-standard-card"><h3>Automotive Grade</h3><p>For demanding environments such as automotive and high-reliability systems.</p><a class="reliability-download link-arrow" href="/downloads/automotive-test-specs.pdf" download="Superworld-Automotive-Test-Specifications.pdf" aria-label="Download Automotive Test Specifications PDF">Download Automotive Test Specs (PDF)</a></article>
        <article class="card reliability-standard-card"><h3>Commercial Grade</h3><p>For stable environments such as consumer and industrial electronics.</p><a class="reliability-download link-arrow" href="/downloads/general-test-specs.pdf" download="Superworld-General-Test-Specifications.pdf" aria-label="Download General Test Specifications PDF">Download General Test Specs (PDF)</a></article>
      </div></div></section>
      <section id="compliance" class="section quality-wireframe-section quality-compliance"><div class="container"><h2>COMPLIANCE & ENVIRONMENT</h2><p class="quality-section-intro">Committed to sustainability through global hazardous substance regulation compliance (RoHS/REACH) and transparent, ethical conflict-free mineral sourcing.</p><div class="quality-compliance-grid">${complianceCards}</div></div></section>
      <section class="section"><div class="container"><div class="section-heading center"><h2>IN-HOUSE VALIDATION CAPABILITIES</h2><p>Verifies component quality through reliability testing, magnetic analysis, and EMI / EMC validation.</p></div>
        <div class="lab-tabs"><button class="lab-tab is-active" type="button">01<br>RELIABILITY TEST SYSTEM</button><button class="lab-tab" type="button">02<br>MAGNETIC ANALYSIS</button><button class="lab-tab" type="button">03<br>EMI / EMC CENTER</button></div>
        <div class="lab-view">${ph("tall")}<div class="lab-copy"><h3>COMPREHENSIVE RELIABILITY VERIFICATION SYSTEM</h3><p>Ensuring reliable, long-term performance of magnetic components in real-world operation.</p><hr><p>SYSTEM SECTIONS</p>${["Application Environment Simulation","Electrical & Functional Analysis","Composition Analysis","Failure Analysis","Environmental Endurance","Mechanical Analysis"].map(x=>`<p>${x}</p>`).join("")}<div class="button-group"><button>Prev</button><button class="wide">Play</button><button>Next</button></div></div></div>
      </div></section>
      <section id="certs" class="section section-rule quality-certificates"><div class="container"><div class="section-heading center"><h2>CERTIFICATION VAULT</h2><p>Official Accreditation Documents</p></div><form class="quality-certificate-search" role="search"><label for="quality-certificate-search-input">Search certificates</label><input id="quality-certificate-search-input" type="search" placeholder="Search certificate..." autocomplete="off" data-certificate-search></form><div class="quality-certificate-grid" data-certificate-grid>${certCards}</div><p class="quality-certificate-empty" data-certificate-empty hidden>No certificates found.</p><nav class="quality-certificate-pagination" aria-label="Certification pages">${[1,2,3,4,5].map((page) => `<button type="button" data-certificate-page="${page}"${page === 1 ? ' class="is-active" aria-current="page"' : ''}>${page}</button>`).join("")}</nav></div></section>
    </main>`;
  }

  function sustainabilityPage() {
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["OUR COMPANY",routes.company],["SUSTAINABILITY"]])}
      ${heroPanel("ESG Commitment &<br>Sustainability Strategy","At Superworld Electronics, we integrate Environmental, Social, and Governance (ESG) principles into our global manufacturing operations to drive ethical growth and long-term value.",["Environment","Social","Governance"])}
      <nav class="anchor-nav"><a href="#esg-vision">ESG VISION</a><a href="#superworld_electronics_company_sustainability_esg_and_sustainability_pillars">ESG & SUSTAINABILITY PILLARS</a><a href="#environment">ENVIRONMENTAL STEWARDSHIP</a><a href="#superworld_electronics_company_sustainability_integrity_and_accountability">INTEGRITY & ACCOUNTABILITY</a></nav>
      <section id="esg-vision" class="section"><div class="container split"><div><h2>OUR ESG VISION</h2><p>We are evolving beyond traditional corporate citizenship to a robust ESG framework. Our goal is to ensure that every electronic component we produce contributes to a sustainable technological ecosystem.</p><p>Through transparent reporting and rigorous standards, we provide our global partners with confidence that their supply chain meets the highest ethical requirements.</p></div>${ph("tall")}</div></section>
      <section id="superworld_electronics_company_sustainability_esg_and_sustainability_pillars" class="section esg-pillars-section"><div class="container"><div class="section-heading center"><h2>ESG & SUSTAINABILITY PILLARS</h2></div>
        <div class="esg-pillars-grid">
          <article class="esg-pillar-card"><h3>SOCIAL</h3><p class="esg-pillar-lead">Empowering People</p><div class="esg-pillar-copy"><p>Supporting growth &amp; inclusion with fair, Tripartite standards.</p><p>Active member of Responsible Business Alliance (RBA) to ensure worker rights.</p></div><div class="esg-pillar-tags" aria-label="Social standards"><span>Tripartite Standards</span><span>RBA Member</span></div></article>
          <article class="esg-pillar-card"><h3>ENVIRONMENTAL</h3><p class="esg-pillar-lead">Sustainability &amp; Safety</p><div class="esg-pillar-copy"><p>RoHS &amp; REACH compliant products.<br>Ensuring conflict-free sourcing</p><p>Maintaining zero-hazard environmental management systems.</p></div><div class="esg-pillar-tags" aria-label="Environmental standards"><span>RoHS Compliant</span><span>REACH Standards</span></div></article>
          <article class="esg-pillar-card"><h3>GOVERNANCE</h3><p class="esg-pillar-lead">Ethical Governance</p><div class="esg-pillar-copy"><p>Ethics &amp; transparency through ESG-aligned supplier standards.</p><p>Maintaining rigorous internal audits and anti-corruption policies.</p></div><div class="esg-pillar-tags" aria-label="Governance standards"><span>ESG Aligned</span><span>ISO Certified</span></div></article>
        </div>
        ${carousel("esg-pillars",[1,2,3].map((item)=>`<div class="slide"><div class="esg-pillar-image" role="img" aria-label="ESG sustainability image placeholder ${item}"></div></div>`),1,false,"esg-pillars-carousel")}
      </div></section>
      <section id="environment" class="section"><div class="container"><div class="split"><div><h2>ENVIRONMENTAL STEWARDSHIP</h2><p>Our manufacturing processes are designed to minimize ecological impact through precision engineering and resource optimization.</p></div><div class="grid grid-2">${card("Energy Efficiency","Transitioning to low-emission machinery and optimizing facility power consumption.")}${card("Waste Management","Comprehensive recycling protocols for manufacturing scrap and chemical byproducts.")}</div></div><div style="margin-top:32px">${carousel("environment-slider",[1,2,3].map(()=>`<div class="slide">${ph("map")}</div>`),1,false)}</div></div></section>
      <section id="superworld_electronics_company_sustainability_integrity_and_accountability" class="section integrity-accountability-section"><div class="container">
        <h2>INTEGRITY &amp; ACCOUNTABILITY</h2>
        <p class="integrity-intro">Superworld corporate affairs are managed to enhance long-term shareholder value through improved<br class="integrity-desktop-break"> performance and accountability. Our Company's mission is guided by five core governance principles:</p>
        <div class="integrity-principles-grid">
          <article class="integrity-principle-card"><strong>01</strong><p>Transparency and<br>efficient management</p></article>
          <article class="integrity-principle-card"><strong>02</strong><p>Compliance with laws<br>and business ethics</p></article>
          <article class="integrity-principle-card"><strong>03</strong><p>Safeguard integrity in<br>financial reporting</p></article>
          <article class="integrity-principle-card"><strong>04</strong><p>Control of company<br>information</p></article>
          <article class="integrity-principle-card"><strong>05</strong><p>Recognize and<br>manage risk</p></article>
        </div>
        <div class="misconduct-panel"><div class="misconduct-copy"><h2>Confidential Misconduct Reporting</h2><p>Superworld is dedicated to the highest moral and ethical standards.<br>Communicate concerns regarding ethical misconduct via our<br class="integrity-desktop-break"> confidential channels.</p></div><aside class="misconduct-contact" aria-label="Confidential misconduct reporting contact information"><h3>CONTACT INFORMATION</h3><p>Hotline: +65 6298 2866 (Ext 223)<br>Email: adeline@superworld.com.sg</p></aside></div>
      </div></section>
    </main>`;
  }

  const applicationMarkets = [
    {name:"Automotive",copy:"Connected, sensing, control, and wireless vehicle electronics.",items:[
      {name:"TCU",components:[]},{name:"Sensing Camera",components:[]},{name:"Infotainment",components:[]},{name:"TPMS",components:[]},{name:"Headlamp",components:[]},{name:"Keyless Entry System",components:[]},{name:"Wireless Charging",components:[]},{name:"ADAS",components:[]}
    ],href:routes.automotive},
    {name:"AI, HPC & Emerging Tech",copy:"Reliable power, filtering, and signal support for next-generation systems.",items:[
      {name:"AI/HPC Server",components:["CPU","DC-DC Converter","LAN Interface","Hard Disk Drive","Network Adapter"]},
      {name:"Router",components:["AC-DC Converter","DC-DC Converter","LAN Interface","WiFi Module","Ethernet Interface"]},
      {name:"Set Top Box",components:["Interface","DC-DC Converter","Signal Processor","RF Tuner"]}
    ],href:routes.communication},
    {name:"Consumer",copy:"Compact solutions for high-volume, space-sensitive electronics.",items:[
      {name:"Speakers",components:["WiFi / Bluetooth","DC-DC Converter","Power Conditioning","Speaker, Headphone and Microphone"]},
      {name:"Hearable Products",components:["Connectivity","DC-DC Converter","Battery"]},
      {name:"Unmanned Aerial Vehicle",components:["Remote Control","Charger","Camera","Vehicle Control Module"]},
      {name:"Robotic Cleaner",components:["CPU","Wireless Connectivity"]},
      {name:"Sensor",components:["AC-DC Converter","DC-DC Converter","Display Panel"]},
      {name:"Air Purifier",components:["CPU","Driver Board","DC-DC Converter","Power Supply"]}
    ],href:routes.applications},
    {name:"Healthcare Devices",copy:"Reliable power, control, and wireless functions in medical-support electronics.",items:[
      {name:"Blood Pressure Devices",components:["Power Supply Unit","Display Panel","Wireless Connectivity","Wireless Charging","CPU"]},
      {name:"Electronic Thermometer",components:["Wireless Connectivity","Temperature Detection","CPU","Display Panel","Wireless Charging"]}
    ],href:routes.applications},
    {name:"Industrial & Energy",copy:"Power conversion, automation, and electrically noisy operating environments.",items:[
      {name:"Industrial Robots",components:["Controller Board"]},
      {name:"3D Printers",components:["Interface","WiFi Connection","Motor Driver","Power Supply"]},
      {name:"Security Products",components:["Camera Module","DC-DC Converter","WiFi","USB / HDMI"]},
      {name:"Smart Meter",components:["Power Supply Circuit","AC-DC Converter","Wireless Module","LED Lighting","AC Power","AC-DC Converter"]}
    ],href:routes.applications},
    {name:"Smart Home",copy:"Connected home controls and power management.",items:[
      {name:"Thermostat",components:["Display Panel","Interface","Power Management"]},
      {name:"Smart Coffee Machine",components:["Power Board","Connectivity","NFC Module","Intelligent Control Board"]},
      {name:"Keyless Entry Door Lock",components:["Wireless Communication","Main Control Board","DC-DC Converter"]}
    ],href:routes.applications}
  ];

  function marketCard(m) {
    return `<article class="market-card" data-market-card data-market-name="${m.name}">
      ${ph()}
      <div class="market-summary"><div class="market-summary-copy"><h3>${m.name}</h3><p>${m.copy}</p></div><button class="market-state-toggle" type="button" aria-expanded="false" aria-label="Open ${m.name} details"><span class="market-state-icon" aria-hidden="true"></span></button></div>
      <div class="market-details"><div class="market-search"><input type="search" data-market-search aria-label="Search within ${m.name}" placeholder="Search ..." autocomplete="off"><button type="button" data-market-search-action aria-label="Focus ${m.name} search"><span class="market-search-icon" aria-hidden="true"></span></button></div><div class="market-detail-list">${m.items.map(item=>`<article class="market-detail-item" data-market-item><div class="market-detail-copy"><h4>${item.name}</h4>${item.components.length?`<ul>${item.components.map(component=>`<li>${component}</li>`).join("")}</ul>`:""}</div><div class="market-detail-image" role="img" aria-label="Image placeholder for ${item.name}"></div></article>`).join("")}</div><p class="market-no-results" data-market-no-results hidden>No matching application.</p></div>
      <div class="market-actions"><button class="market-toggle" type="button" aria-expanded="false">View Details</button>${link(m.href,"View More","button market-more-link")}</div>
    </article>`;
  }

  function applicationsPage() {
    const productLines = [
      ["EMC Components","Solutions supporting noise suppression, compliance, and product stability in electronic systems.",routes.emc],
      ["Magnetic Components","Core magnetic products supporting a wide range of electronic, industrial, and power-related applications.",routes.general],
      ["Transformers","Transformer solutions developed for consistent performance, manufacturing control, and application fit.",routes.general],
      ["Wireless Power Transfer","Wireless charging-related solutions supporting evolving demand in modern electronics and mobility.",routes.general],
      ["General Components","Reliable component solutions for electronic, industrial, and power applications.",routes.general]
    ].map(x=>mediaCard(x[0],x[1],"View More",x[2]));
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["APPLICATION"]])}
      ${heroPanel("SOLUTIONS BUILT AROUND<br>REAL APPLICATION NEEDS","Superworld provides core power and connectivity solutions for automotive, industrial, healthcare, and consumer systems, with technologies designed to support efficiency, reliability, and innovation.",["EXPLORE INDUSTRIES","DISCUSS YOUR PROJECT"])}
      <nav class="anchor-nav"><a href="#markets">APPLICATION MARKETS</a><a href="#core-solutions">CORE SOLUTIONS ACROSS APPLICATIONS</a><a href="#system-design">HOW SUPERWORLD FITS INTO SYSTEM DESIGN</a><a href="#why">WHY WORK WITH SUPERWORLD</a></nav>
      <section id="markets" class="section"><div class="container"><div class="section-heading"><div><h2>APPLICATION MARKETS</h2><p>Explore the key markets we support and the system needs behind each application.</p></div><button type="button" data-market-all>View All</button></div><div class="market-grid">${applicationMarkets.map(marketCard).join("")}</div></div></section>
      <section id="core-solutions" class="section section-rule"><div class="container"><div class="section-heading"><div><h2>CORE SOLUTIONS ACROSS APPLICATIONS</h2><p>Our component capabilities support a wide range of system requirements across multiple markets.</p></div><div class="button-group"><button class="button small" type="button" data-product-tab="general" data-product-carousel="app-products">General</button><button class="button small" type="button" data-product-tab="automotive" data-product-carousel="app-products">Automotive</button></div></div>${carousel("app-products",productLines,4)}</div></section>
      <section id="system-design" class="section section-rule"><div class="container"><div class="section-heading center"><h2>HOW SUPERWORLD FITS INTO SYSTEM DESIGN</h2><p>From input filtering to power conversion and connectivity, our solutions support key functions across modern electronic systems.</p></div><div class="flow">${[["Input / Interface","EMC filtering"],["Power Conversion","Inductors + transformers"],["Control Board","Stable signal support"],["Connectivity","LAN / wireless support"],["End Device Function","Application-specific output"]].map((x,i)=>`<article class="flow-card">${ph()}<div class="flow-card-copy"><h3>${x[0]}</h3><p>${x[1]}</p></div></article>${i<4?`<span class="flow-arrow" aria-hidden="true"></span>`:""}`).join("")}</div></div></section>
      <section id="why" class="section section-rule"><div class="container"><div class="section-heading center"><h2>WHY WORK WITH SUPERWORLD</h2><p>A trusted partner for application-focused component solutions.</p></div><div class="grid grid-4">${["Application Breadth","Integrated Manufacturing","Quality & Reliability","Project Support"].map(x=>`<article class="media-card">${ph()}<div class="media-card-body"><h3>${x}</h3><p>Practical support for repeatable component selection and project delivery.</p></div></article>`).join("")}</div><div class="cta" style="margin-top:70px"><div><h2>NEED SUPPORT FOR A SPECIFIC APPLICATION?</h2><p>Keep the final section clean, visual, and action-driven.</p></div><div class="button-group">${buttonLink(routes.products,"View Products")}${buttonLink(routes.inquiry,"Contact Sales")}</div></div></div></section>
    </main>`;
  }

  const automotiveSystems = [
    ["TCU","Telematics Control Unit","Telematics and connected vehicle communication."],
    ["Sensing Camera","Vision / camera module","Camera module power and signal filtering."],
    ["Infotainment","Display and interface system","Display, audio, interface, and control electronics."],
    ["TPMS","Tire Pressure Monitoring","Tire pressure monitoring and sensor identification."],
    ["Headlamp","Lighting electronics","Lighting power and noise suppression."],
    ["Keyless Entry","Vehicle access system","Vehicle access and identification system."],
    ["Wireless Charging","In-cabin charging module","In-cabin wireless power transfer."],
    ["ADAS","Driver-assistance system","Advanced driver-assistance sensing and control systems."]
  ];
  const serverSystems = [
    ["CPU / GPU VRM","Processor and accelerator power area","High-current, low-voltage rails for CPU, GPU, ASIC, and AI accelerator loads."],
    ["AI Accelerator Module","GPU / AI accelerator power and signal area","Supports GPU, accelerator card, HBM, and high-density AI compute board requirements."],
    ["High-Current DC–DC Converter","Board-level power conversion","Stable conversion support for AI server power distribution and point-of-load rails."],
    ["High-Speed LAN / Ethernet Interface","Data interface filtering","Supports high-speed data movement between AI servers, storage, and network fabrics."],
    ["NVMe Storage / SSD","High-speed storage power area","Supports high-speed storage and data loading paths."],
    ["Network Adapter / NIC","High-speed network adapter area","Supports external network adapters and high-throughput AI data paths."]
  ];

  const communicationSystemData = {
    server: {
      name: "AI/HPC Server",
      image: "AI/HPC Server Application Image Placeholder",
      imageSrc: "/assets/server-map.webp",
      imageAlt: "AI and HPC server exploded diagram with six component hotspots",
      caption: "1 CPU / GPU VRM / 2 AI Accelerator Module / 3 High-Current DC-DC / 4 High-Speed LAN / 5 NVMe Storage / 6 Network Adapter",
      hotspots: [["1","server-cpu","server-h1"],["2","server-gpu","server-h2"],["3","server-dcdc","server-h3"],["4","server-lan","server-h4"],["5","server-storage","server-h5"],["6","server-adapter","server-h6"]],
      cards: [
        {id:"server-cpu",no:"01",name:"CPU / GPU VRM",type:"Processor and accelerator power area",desc:"High-current, low-voltage rails for CPU, GPU, ASIC, and AI accelerator loads.",design:"High current density, low DCR, fast transient response, EMI control, and thermal stability for AI compute power stages.",bundle:"View AI VRM Bundle",rows:[["Molded Power Inductors","High-current VRM power support",["PBP","PIAQ","PICQ","PIFQ"]],["Trans-Inductor Voltage Regulator Inductor","Fast transient support for multiphase VRM",["SMF"]],["Power Bead","Power noise suppression and low-DCR support",["SMC"]],["Planar Inductors","Converter support",["SPQ"]],["Ferrite Chip Beads","EMI suppression around processor power rails",["Z","Z Large Current"]]]},
        {id:"server-gpu",no:"02",name:"AI Accelerator Module",type:"GPU / AI accelerator power and signal area",desc:"Supports GPU, accelerator card, HBM, and high-density AI compute board requirements.",design:"High-current power delivery, tight thermal margin, low loss, compact PCB layout, and EMI suppression for dense AI modules.",bundle:"View AI Accelerator Bundle",rows:[["Molded Power Inductors","High-current AI accelerator and HBM rail support",["PBP","PIAQ","PICQ","PIFQ"]],["Trans-Inductor Voltage Regulator Inductor","Fast transient support for GPU and AI accelerator VRM",["SMF"]],["Power Bead","Power-path noise suppression in dense AI boards",["SMC"]],["Ferrite Chip Beads","EMI suppression component",["Z","Z Large Current"]]]},
        {id:"server-dcdc",no:"03",name:"High-Current DC-DC Converter",type:"Board-level power conversion",desc:"Stable conversion support for AI server power distribution and point-of-load rails.",design:"Efficient power conversion, stable inductance, low DCR, and thermal reliability under continuous AI workloads.",bundle:"View DC-DC Bundle",rows:[["Molded Power Inductors","High-current DC-DC conversion support",["PBP","PIAQ","PICQ","PIFQ"]],["Semi-Shielded Power Inductors","Stable DC-DC conversion support",["SPA","PNS"]],["Shielded Power Inductors","Stable power conversion support",["SDB","PDC"]],["Planar Inductors","Power conversion support",["SPQ"]],["Ferrite Chip Beads","Power rail EMI suppression",["Z","Z Large Current"]]]},
        {id:"server-lan",no:"04",name:"High-Speed LAN / Ethernet Interface",type:"Data interface filtering",desc:"Supports high-speed data movement between AI servers, storage, and network fabrics.",design:"Clean interface signal path, isolation, common mode noise filtering, and EMI control.",bundle:"View LAN Bundle",rows:[["LAN Transformers","LAN interface support",["SLT"]],["Common Mode Chokes","LAN and Ethernet interface filtering",["W"]],["Ferrite Chip Beads","EMI suppression component",["Z","Z Large Current"]]]},
        {id:"server-storage",no:"05",name:"NVMe Storage / SSD",type:"High-speed storage power area",desc:"Supports high-speed storage and data loading paths used in AI training and inference systems.",design:"Stable storage power, low-noise operation, and EMI suppression for high-speed storage interfaces.",bundle:"View Storage Bundle",rows:[["Ferrite Chip Beads","Storage circuit EMI support",["Z","Z Large Current"]],["Semi-Shielded Power Inductors","Storage power support",["SPA","PNS"]],["Shielded Power Inductors","Stable storage power conversion",["SDB","PDC"]]]},
        {id:"server-adapter",no:"06",name:"Network Adapter / NIC",type:"High-speed network adapter area",desc:"Supports external network adapters, accelerator interconnect cards, and high-throughput AI data paths.",design:"Power conversion stability, EMI reduction, and interface filtering for high-bandwidth network cards.",bundle:"View Adapter Bundle",rows:[["Power Converter Transformers","Adapter power conversion support",["EP Core","EE Core","EFD Core"]],["Common Mode Chokes","Network interface noise filtering",["W"]],["Ferrite Chip Beads","Adapter EMI support",["Z","Z Large Current"]]]}
      ]
    },
    router: {
      name: "Router",
      image: "Router Application Image Placeholder",
      caption: "1 AC-DC Converter / 2 DC-DC Converter / 3 WiFi Module / 4 Ethernet Interface",
      hotspots: [["1","router-acdc","router-h1"],["2","router-dcdc","router-h2"],["3","router-wifi","router-h3"],["4","router-ethernet","router-h4"]],
      cards: [
        {id:"router-acdc",no:"01",name:"AC-DC Converter",type:"Input power conversion",desc:"AC-DC conversion support for router power input.",design:"Power conversion support, EMI control, and compact transformer selection.",bundle:"View AC-DC Bundle",rows:[["Power Converter Transformers","AC-DC power conversion support",["EP Core"]],["Planar Transformers","Compact transformer solution",["SPTPQ"]],["Ferrite Chip Beads","EMI suppression component",["Z","Z Large Current"]],["Semi-Shielded Power Inductors","Power support",["SPA","PNS"]]]},
        {id:"router-dcdc",no:"02",name:"DC-DC Converter",type:"Internal power conversion",desc:"DC-DC power stability for router circuits.",design:"Power stability and compact conversion support.",bundle:"View DC-DC Bundle",rows:[["Semi-Shielded Power Inductors","DC-DC conversion support",["SPA","PNS"]],["Multilayer Power Chip Inductors","Compact power conversion support",["L"]],["Ferrite Chip Beads","EMI suppression component",["Z","Z Large Current"]]]},
        {id:"router-wifi",no:"03",name:"WiFi Module",type:"Wireless communication area",desc:"RF and module power support.",design:"RF stability and compact power support.",bundle:"View WiFi Bundle",rows:[["Chip Inductors","WiFi module RF support",["C"]],["Semi-Shielded Power Inductors","Module power support",["SPA","PNS"]]]},
        {id:"router-ethernet",no:"04",name:"Ethernet Interface",type:"Wired data interface",desc:"Ethernet interface filtering and EMI suppression.",design:"Common mode noise filtering and interface stability.",bundle:"View Ethernet Bundle",rows:[["Common Mode Chokes","Ethernet interface filtering",["W"]],["Ferrite Chip Beads","EMI suppression component",["Z","Z Large Current"]]]}
      ]
    },
    settopbox: {
      name: "Set Top Box",
      image: "Set Top Box Application Image Placeholder",
      caption: "1 Interface / 2 DC-DC Converter / 3 Signal Processor / 4 RF Tuner",
      hotspots: [["1","stb-interface","stb-h1"],["2","stb-dcdc","stb-h2"],["3","stb-signal","stb-h3"],["4","stb-rf","stb-h4"]],
      cards: [
        {id:"stb-interface",no:"01",name:"Interface",type:"Signal and connection area",desc:"Interface EMI control and power support.",design:"Signal clarity, EMI suppression, and interface noise filtering.",bundle:"View Interface Bundle",rows:[["Ferrite Chip Beads","EMI suppression component",["Z","Z Large Current"]],["Common Mode Chokes","Interface noise filtering",["W"]],["Semi-Shielded Power Inductors","Interface power support",["SPS","PNS"]],["Shielded Power Inductors","Stable power support",["SDB"]]]},
        {id:"stb-dcdc",no:"02",name:"DC-DC Converter",type:"Internal power conversion",desc:"Stable DC-DC conversion inside set top box circuits.",design:"Stable power conversion and EMI control.",bundle:"View DC-DC Bundle",rows:[["Semi-Shielded Power Inductors","DC-DC conversion support",["SPS","PNS"]],["Molded Power Inductors","Stable power conversion support",["PIAQ","PICQ","PIFQ"]],["Planar Inductors","Power conversion support",["SPQ"]],["Custom Coils","Custom magnetic support",["Custom Coils"]],["Common Mode Chokes","Noise filtering support",["W"]],["Ferrite Chip Beads","EMI suppression component",["Z"]]]},
        {id:"stb-signal",no:"03",name:"Signal Processor",type:"Signal processing area",desc:"Signal processor EMI and power conversion support.",design:"Signal clarity and compact power support.",bundle:"View Signal Bundle",rows:[["Ferrite Chip Beads","EMI suppression component",["Z","Z Large Current"]],["Semi-Shielded Power Inductors","Signal processor power support",["SPS","PNS"]],["Shielded Power Inductors","Stable power support",["SDB"]]]},
        {id:"stb-rf",no:"04",name:"RF Tuner",type:"RF tuning area",desc:"RF tuning and signal support.",design:"RF stability, noise suppression, and signal tuning support.",bundle:"View RF Bundle",rows:[["Ferrite Chip Beads","EMI suppression component",["Z","Z Large Current"]],["Chip Inductors","RF tuning support",["C"]],["Ceramic Wire Wound Inductors","RF tuning support",["SCI"]],["Wire Wound Inductors","Signal tuning support",["WI"]]]}
      ]
    }
  };
  const communicationSystemOrder = ["server","router","settopbox"];

  function communicationSeriesChips(items) {
    return items.map(item=>`<span class="series-chip">${item}</span>`).join("");
  }

  function communicationMappingRows(rows) {
    return rows.map(row=>`<div class="mapping-row"><div class="component-image-placeholder">IMAGE</div><div><div class="component-name">${row[0]}</div><div class="component-desc">${row[1]}</div></div><div class="series-chips">${communicationSeriesChips(row[2])}</div></div>`).join("");
  }

  function communicationCardMarkup(card,index) {
    const isOpen=index===0;
    return `<article class="subapp-card ${isOpen?"is-open":""}" id="${card.id}" data-subapp-card><div class="subapp-summary"><button class="subapp-trigger" type="button" aria-expanded="${isOpen}" aria-controls="${card.id}-panel"><span class="subapp-no">${card.no}</span><span class="subapp-image">IMAGE</span><span class="subapp-title"><h3>${card.name}</h3><small class="subapp-type">${card.type}</small></span><span class="subapp-desc">${card.desc}</span></button><div class="subapp-actions"><a class="system-action-btn bundle-btn" href="${routes.products}" data-link>${card.bundle}</a><button class="accordion-icon" type="button" aria-label="Toggle ${card.name}">${isOpen?"−":"+"}</button></div></div><div class="subapp-panel ${isOpen?"is-open":""}" id="${card.id}-panel" ${isOpen?"":"hidden"}><div class="subapp-panel-grid"><div class="design-block panel-block"><h4>Design Need</h4><p>${card.design}</p></div><div><h4 class="mapping-title">Component / Series Mapping</h4><div class="mapping-list">${communicationMappingRows(card.rows)}</div></div></div></div></article>`;
  }

  function communicationPanelMarkup(key) {
    const data=communicationSystemData[key];
    const active=key==="server";
    const hasImage=Boolean(data.imageSrc);
    return `<section class="system-panel ${active?"active":""}" role="tabpanel" data-system-panel="${key}" ${active?"":"hidden"}><div class="system-hotspot-stage ${hasImage?"has-system-image":""}"><div class="hotspot-title">Hotspot Image — ${data.name}</div><div class="system-hotspot-image ${hasImage?"has-image":""}">${hasImage?`<img src="${data.imageSrc}" alt="${data.imageAlt}">`:data.image}</div>${data.hotspots.map(h=>`<a class="hotspot-link ${h[2]}" href="#${h[1]}" data-open-card="${h[1]}" aria-label="Open ${data.cards.find(card=>card.id===h[1])?.name||"application"}">${h[0]}</a>`).join("")}<p class="hotspot-caption">${data.caption}</p></div><div class="accordion-toolbar"><button class="system-action-btn show-all-btn" type="button">Show All</button><button class="system-action-btn is-outline collapse-all-btn" type="button">Collapse All</button></div><div class="subapp-list">${data.cards.map(communicationCardMarkup).join("")}</div></section>`;
  }

  function communicationSystemTabsMarkup() {
    return `<div class="system-tabs-shell"><div class="system-tabs-nav" role="tablist" aria-label="Communication systems">${communicationSystemOrder.map(key=>`<button class="system-tab-btn ${key==="server"?"active":""}" type="button" role="tab" aria-selected="${key==="server"}" data-system="${key}">${communicationSystemData[key].name}</button>`).join("")}</div>${communicationSystemOrder.map(communicationPanelMarkup).join("")}</div>`;
  }

  const automotiveMappingRows = [
    ["Ferrite Chip Beads","EMI suppression component",["ZQ","ZQ Large Current"]],
    ["Molded Power Inductors","Stable power conversion support",["PIAQ","PICQ","PIFQ"]],
    ["Common Mode Chokes","Noise filtering for signal lines",["WAQ"]]
  ];

  function automotiveSystemFeatureMarkup() {
    const ids=["tcu","sensing-camera","infotainment","tpms","headlamp","keyless-entry","wireless-charging","adas"];
    const cards=automotiveSystems.map((item,index)=>({
      id:`automotive-${ids[index]}`,
      no:String(index+1).padStart(2,"0"),
      name:item[0],
      type:item[1],
      desc:item[2],
      design:"EMI control and stable module power.",
      bundle:"View Bundle",
      rows:automotiveMappingRows
    }));
    const hotspots=cards.map((card,index)=>[String(index+1),card.id,`automotive-h${index+1}`]);
    return `<div id="systemTabsRoot" class="automotive-system-feature"><section class="system-panel active" role="tabpanel" data-system-panel="automotive"><div class="system-hotspot-stage has-system-image"><div class="system-hotspot-image has-image"><img src="/assets/automotive-map.webp" alt="Automotive application map"></div>${hotspots.map(h=>`<a class="hotspot-link ${h[2]}" href="#${h[1]}" data-open-card="${h[1]}" aria-label="Open ${cards.find(card=>card.id===h[1])?.name||"application"}">${h[0]}</a>`).join("")}</div><div class="accordion-toolbar"><button class="system-action-btn show-all-btn" type="button">Show All</button><button class="system-action-btn is-outline collapse-all-btn" type="button">Collapse All</button></div><div class="subapp-list">${cards.map(communicationCardMarkup).join("")}</div></section></div>`;
  }

  function accordionItem(item, index, kind) {
    const series = kind === "automotive"
      ? [["Ferrite Chip Beads","EMI suppression component",["ZQ","ZQ Large Current"]],["Molded Power Inductors","Stable power conversion support",["PIAQ","PICQ","PIFQ"]],["Common Mode Chokes","Noise filtering for signal lines",["WAQ"]]]
      : [["Molded Power Inductors","High-current VRM power support",["PBP","PIAQ","PICQ","PIFQ"]],["Trans-Inductor Voltage Regulator Inductor","Fast transient support",["SMF"]],["Power Bead","Power noise suppression",["SMC"]],["Planar Inductors","Converter support",["SPQ"]],["Ferrite Chip Beads","EMI suppression",["Z","Z Large Current"]]];
    return `<article class="accordion ${index===0?"is-open":""}">
      <button class="accordion-head" type="button" aria-expanded="${index===0}">
        <strong>${String(index+1).padStart(2,"0")}</strong>${ph()}<span><h3>${item[0]}</h3><small>${item[1]}</small></span><span class="accordion-desc">${item[2]}</span><span class="button small">View Bundle</span><span class="accordion-symbol">${index===0?"−":"+"}</span>
      </button>
      <div class="accordion-panel"><div><h4>DESIGN NEED</h4><p>${kind==="automotive"?"EMI control and stable module power.":"High current density, fast transient response, EMI control, and thermal stability."}</p></div><div><h4>COMPONENT / SERIES MAPPING</h4>${series.map(s=>`<div class="series-row">${ph()}<div><strong>${s[0]}</strong><br><small>${s[1]}</small></div><div class="chips">${s[2].map(c=>`<span class="chip">${c}</span>`).join("")}</div></div>`).join("")}</div></div>
    </article>`;
  }

  function industryDetailPage(kind) {
    const automotive = kind === "automotive";
    const title = automotive ? "RELIABLE COMPONENTS FOR<br>AUTOMOTIVE ELECTRONICS." : "COMPONENTS FOR<br>AI, HPC & EMERGING TECH";
    const copy = automotive ? "Magnetic and EMC component support for stable power, signal integrity, and reliable in-vehicle performance." : "Magnetic and EMC component support for AI/HPC servers, routers, set top boxes, and connected signal and power circuits.";
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["APPLICATION",routes.applications],[automotive?"AUTOMOTIVE":"COMMUNICATION & NETWORKING"]])}
      ${heroPanel(title,copy,["VIEW APPLICATION FIT","CONTACT SALES"])}
      ${automotive?`<section class="communication-route-section automotive-route-section"><div class="container"><div class="communication-route-panel"><div class="communication-route-copy"><h2>One clear route from vehicle<br> area to product family.</h2><p>Identify the automotive system, understand the circuit need, and access<br class="communication-route-break"> the relevant series bundle without reading repeated product lists.</p></div><div class="communication-route-metrics"><div class="stat"><strong>8</strong><b>Application Areas</b></div><div class="stat"><strong>10+</strong><b>Component Types</b></div><div class="stat"><strong>IATF 16949</strong><b>Design Focus</b></div><div class="stat"><strong>Global</strong><b>Selection Support</b></div></div></div></div></section>`:`<section class="communication-route-section"><div class="container"><div class="communication-route-panel"><div class="communication-route-copy"><h2>One clear route from system<br> area to product family.</h2><p>Identify the communication system, understand the circuit need, and access<br class="communication-route-break"> the relevant series bundle without reading repeated product lists.</p></div><div class="communication-route-metrics"><div class="stat"><strong>3</strong><b>System Groups</b></div><div class="stat"><strong>14</strong><b>Application Areas</b></div><div class="stat"><strong>AI / EMI</strong><b>Design Focus</b></div><div class="stat"><strong>Series</strong><b>Selection Support</b></div></div></div></div></section>`}
      <nav class="anchor-nav"><a href="#design-needs">${automotive?"AUTOMOTIVE ":""}DESIGN NEEDS</a><a href="#fit">APPLICATION FIT</a><a href="#confidence">QUALITY CONFIDENCE</a><a href="#journey">USER JOURNEY</a></nav>
      <section id="design-needs" class="section section-rule"><div class="container"><div class="section-heading center"><h2>${automotive?"WHAT THE PAGE SHOULD COMMUNICATE FIRST":"SUPPORT STABLE COMMUNICATION CIRCUIT DESIGN"}</h2><p>${automotive?"":"Reduce noise, support power conversion, and keep signal paths clean."}</p></div><div class="design-cards">
        ${(automotive?[["Reduce electrical noise","Show how EMC components support cleaner power and signal paths."],["Stabilise power circuits","Position inductors and transformers around power conversion needs."],["Support compact modules","Connect product families to space-conscious automotive electronics."],["Build selection confidence","Link application choices to quality, testing, and enquiry support."]]:[["Control EMI & Signal noise","Support EMI suppression and noise filtering across LAN, Ethernet, RF, and interface circuits."],["Support AI power conversion","Provide suitable inductor and transformer options."],["Protect Data interfaces","Help users identify components for connected interface stability."],["Speed up series selection","Connect each device area to related component families."]]).map((x,i)=>`<article class="design-card"><h2>0${i+1}</h2><h3>${x[0]}</h3><p>${x[1]}</p></article>`).join("")}
      </div></div></section>
      <section id="fit" class="section section-rule"><div class="container"><div class="section-heading center"><h2>FIND THE RIGHT SERIES BY ${automotive?"AUTOMOTIVE":"COMMUNICATION"} SYSTEM</h2><p>Use the ${automotive?"vehicle":"system"} map to jump to a system. Expand a card only when needed.</p></div>${automotive?automotiveSystemFeatureMarkup():`<div id="systemTabsRoot">${communicationSystemTabsMarkup()}</div>`}</div></section>
      <section id="confidence" class="section section-rule"><div class="container"><div class="section-heading center"><h2>${automotive?"BUILT FOR AUTOMOTIVE-ORIENTED RELIABILITY EXPECTATIONS":"QUALITY SUPPORT FOR RELIABLE COMMUNICATION SYSTEMS."}</h2></div><div class="grid grid-3">
        ${card(automotive?"IATF / ISO Focus":"Controlled Manufacturing","Consistent production and inspection for repeat requirements.")}
        ${card(automotive?"Reliability Testing":"Stable Electrical Performance","Supports EMI suppression, power stability, and signal integrity.")}
        ${card("Engineering Support","Helps match circuit needs with suitable component series.")}
      </div></div></section>
      <section id="journey" class="section section-rule"><div class="container"><div class="section-heading center"><h2>SIMPLE FLOW FROM APPLICATION TO ENQUIRY</h2></div><div class="grid grid-4">${["01 Identify System","02 Review Needs","03 Match Product","04 Contact Sales"].map(x=>card(x,"Choose the relevant system, review the circuit need, match a product family, and share requirements.")) .join("")}</div><div class="cta" style="margin-top:60px"><div><h2>NEED HELP SELECTING COMPONENTS FOR ${automotive?"AUTOMOTIVE":"COMMUNICATION & NETWORKING"} SYSTEMS?</h2><p>Share your device type, circuit area, target series, and electrical requirement so our team can help.</p></div><div class="button-group">${buttonLink(routes.inquiry,"Send Enquiry")}${buttonLink(routes.news+"?category=brochures","Download Brochure")}</div></div></div></section>
    </main>`;
  }

  const generalCategories = {
    "EMC Components":["Chip Array Ferrite Bead","Chip Inductor","Ferrite Bead Assembly","Ferrite Chip Bead","Ferrite Chip Bead (Large Current)","Multilayer Power Chip Inductor"],
    "Magnetic Components":["Ceramic Wire Wound Inductor","Common Mode Choke","Trans-inductor Voltage Regulator Inductor","Molded Power Inductor","Planar Inductor","Power Bead","Radial-Leaded Inductor","Semi-Shielded Power Inductor","Shielded Power Inductor","Unshielded Power Inductor","Transponder Coil","Wire Wound Inductor"],
    "Transformer":["Lan Transformer","Power Converter Transformer","Planar Transformer"],
    "Wireless Power Transfer":["Receiver Coil","Transmitter Coil","Receiver Module","Transmitter Module"]
  };

  function productsPage() {
    const chipArrayTarget = routes.emc+"/#superworld_electronics_products_general_emc_chip_array_ferrite_bead";
    const categoryColumns = Object.entries(generalCategories).map(([k,vals])=>`<div><h3>${k==="EMC Components"?link(routes.emc+"/",k):k}</h3><ul>${vals.map(x=>`<li><span class="check-square"></span>${k==="EMC Components"&&x==="Chip Array Ferrite Bead"?link(chipArrayTarget,x):x}</li>`).join("")}</ul></div>`).join("");
    const releases = Array.from({length:6},()=>mediaCard("A4K Series","Chip Array Ferrite Bead","View More",routes.a4k));
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["OUR PRODUCTS"]])}
      ${heroPanel("OUR PRODUCTS","Comprehensive range of general and automotive electronic components, including EMC, magnetic, transformer, and wireless power solutions, engineered for high efficiency and reliable performance.")}
      <section id="superworld_electronics_products_general_components" class="section"><div class="container"><div class="section-heading"><h2>${link(routes.general,"GENERAL COMPONENTS")}</h2>${link(routes.general,"View More","link-arrow")}</div><div class="category-columns">${categoryColumns}</div></div></section>
      <section id="superworld_electronics_products_automotive_components" class="section"><div class="container"><div class="section-heading"><h2>AUTOMOTIVE COMPONENTS</h2>${link(routes.products,"View More","link-arrow")}</div><div class="category-columns">${Object.entries(generalCategories).slice(0,3).map(([k,vals])=>`<div><h3>${k}</h3><ul>${vals.slice(0,5).map(x=>`<li><span class="check-square"></span>${x}</li>`).join("")}</ul></div>`).join("")}</div></div></section>
      <section class="section"><div class="container"><div class="section-heading"><h2>LATEST RELEASE</h2>${link(routes.news+"?category=product","View More","link-arrow")}</div>${carousel("product-releases",releases,4)}</div></section>
    </main>`;
  }

  function generalPage() {
    const families = [
      ["EMC Components","superworld_electronics_products_general_emc_components","Designed to reduce electrical noise and prevent interference between electronic devices.",Object.values(generalCategories)[0]],
      ["Magnetic Components","superworld_electronics_products_general_magnetic_components","Essential parts that use magnetic fields to store energy, filter noise, and ensure efficient power conversion.",Object.values(generalCategories)[1].slice(0,8)],
      ["Transformer","superworld_electronics_products_general_transformer","Electronic components that transfer electrical energy between circuits, enabling voltage conversion and isolation.",Object.values(generalCategories)[2]],
      ["Wireless Power Transfer","superworld_electronics_products_general_wireless_power_transfer","Wireless charging components developed for dependable power transfer between transmitter and receiver systems.",Object.values(generalCategories)[3]]
    ];
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["OUR PRODUCTS",routes.products],["GENERAL COMPONENTS"]])}
      ${heroPanel("GENERAL COMPONENTS","Essential electronic parts that manage power, reduce electromagnetic interference (EMI), and support efficient signal transmission, ensuring reliable performance in electronic circuits.")}
      <nav class="anchor-nav">${families.map(f=>`<a href="#${f[1]}">${f[0]}</a>`).join("")}</nav>
      ${families.map((f,i)=>`<section id="${f[1]}" class="product-family"><div class="container"><div class="section-heading center"><h2>${f[0]}</h2><p>${f[2]}</p></div>${ph("tall")}<div class="family-icons">${f[3].map((x,j)=>i===0&&j===0?link(`${routes.emc}/#superworld_electronics_products_general_emc_chip_array_ferrite_bead`,`${a4kImage("product-thumb")}<span>${x}</span>`,"family-icon"):`<div class="family-icon">${ph()}<span>${x}</span></div>`).join("")}</div></div></section>`).join("")}
    </main>`;
  }

  const productRows = (series, count = 4) => Array.from({length:count},(_,i)=>`<tr><td>${i===0&&series==="A4K"?a4kImage("product-thumb"):ph()}</td><td><a data-link href="${series==="A4K"?routes.a4k:"#"}"><u>${series}${i?i:""}</u></a></td><td>XXXXX</td><td>XXX - XXX</td><td>XXX - XXX</td><td>XXX - XXX</td><td><button class="button small">Download</button></td></tr>`).join("");

  function emcPage() {
    const emcSections = [
      ["Chip Array Ferrite Bead","superworld_electronics_products_general_emc_chip_array_ferrite_bead","Combining four 0603 chips into a single package reduces both board space and processing time.","A4K",1],
      ["Chip Inductor","superworld_electronics_products_general_emc_chip_inductor","Design of multilayer construction with excellent reliability. Small form factor, low profile, high current capability.","C",4],
      ["Ferrite Bead Assembly","superworld_electronics_products_general_emc_ferrite_bead_assembly","High Current capabilities. Suitable for application in EMI filtering for differential mode noise.","Z",3],
      ["Ferrite Chip Bead","superworld_electronics_products_general_emc_ferrite_chip_bead","Multilayer construction, ideal for power lines, general and high-speed signal lines.","Z",5]
    ];
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["OUR PRODUCTS",routes.products],["GENERAL COMPONENTS",routes.general],["EMC COMPONENTS"]])}
      ${heroPanel("EMC Components","Designed to reduce electrical noise and prevent interference between electronic devices. They ensure products operate reliably, safely, and in compliance with international standards.",[],true)}
      <nav class="anchor-nav">${emcSections.map(x=>`<a href="#${x[1]}">${x[0]}</a>`).join("")}</nav>
      ${emcSections.map(x=>`<section id="${x[1]}" class="section-sm"><div class="container"><h2>${x[0]}</h2><p>${x[2]}</p><div class="table-wrap"><table><thead><tr><th>Product</th><th>Series</th><th>Dimension</th><th>Impedance Range (ohm)</th><th>DCR Range (ohm)</th><th>Current Range (mA)</th><th>Specification</th></tr></thead><tbody>${productRows(x[3],x[4])}</tbody></table></div></div></section>`).join("")}
    </main>`;
  }

  function productDataRows(count=4) {
    return Array.from({length:count},(_,i)=>`<tr><td><input type="checkbox" ${i===0?"checked":""}></td><td>${a4kImage("product-thumb")}<u>${i===0?"A4K300-RE-10":"XXXXXX"}</u></td><td>Chip Inductor</td><td>xxxxx</td><td>xxxxx</td><td>xxxxx</td><td>xxxxx</td><td>xxxxx</td><td>xxxxx</td><td>xxxxx</td><td>xxxxx</td><td>xxxxx</td><td><button class="button small">Download</button></td></tr>`).join("");
  }

  const a4kParts = [
    {id:1449,sku:"A4K300-RE-10",impedance:"30",dcr:"0.20",current:"500"},
    {id:1451,sku:"A4K600-RD-10",impedance:"60",dcr:"0.25",current:"400"},
    {id:1448,sku:"A4K121-RD-10",impedance:"120",dcr:"0.30",current:"350"},
    {id:1450,sku:"A4K301-RC-10",impedance:"300",dcr:"0.40",current:"250"},
    {id:1452,sku:"A4K601-RB-10",impedance:"600",dcr:"0.50",current:"200"},
    {id:1447,sku:"A4K102-RB-10",impedance:"1000",dcr:"0.75",current:"150"}
  ];

  const a4kProductRows = () => a4kParts.map((part,i)=>`<tr data-a4k-row data-product-id="${part.id}" data-product-sku="${part.sku}"><td class="a4k-select-cell"><input type="checkbox" data-a4k-select aria-label="Select ${part.sku} for inquiry or loss analysis" ${i<2?"checked":""}></td><td><a class="a4k-part-link" href="#specifications">${part.sku}</a></td><td>${part.impedance}</td><td>100 MHz</td><td>${part.dcr}</td><td>${part.current}</td><td><a class="button small" href="/downloads/a4k-series-datasheet.pdf" download>PDF</a></td></tr>`).join("");

  function a4kPage() {
    const sections = [["overview","Introduction"],["specifications","Specifications"],["environmental","Environmental"],["performance-curves","Performance Curves"],["physical","Physical Characteristics"],["tape-reel","Tape & Reel"],["soldering","Soldering / Washing"]];
    return `<main id="main-content" class="page-main a4k-page" data-a4k-page>${crumb([["HOME",routes.home],["OUR PRODUCTS",routes.products],["GENERAL COMPONENTS",routes.general],["EMC COMPONENTS",routes.emc],["CHIP ARRAY FERRITE BEAD",routes.emc],["A4K SERIES"]])}<div class="container a4k-shell">
      <section class="a4k-hero" id="overview" data-section-id-preserve><div class="a4k-hero-copy"><div><div class="a4k-heading-row"><h1><span>A4K Series</span><small>Chip Array Ferrite Bead</small></h1><span class="tag">EMC COMPONENTS</span></div><div class="a4k-intro"><strong>Introduction</strong><p>A4K Series is a compact chip array ferrite bead for multi-line EMI noise suppression in high-density electronic circuits.</p><ul><li><b>4-line array design</b> supports compact filtering in one package.</li><li><b>Multiple impedance options</b> support different noise suppression needs.</li><li><b>Low DCR selection</b> helps reduce unwanted circuit power loss.</li></ul></div></div><div class="a4k-compliance" aria-label="Product compliance status"><div><b>Compliance</b><span>Product status</span></div><div><b>R</b><span><strong>RoHS / REACH</strong>Compliant</span></div><div><b>H</b><span><strong>Halogen</strong>Free</span></div><div><b>A</b><span><strong>AEC</strong>Q200 / -125°C</span></div></div></div><aside class="a4k-product-card" aria-label="Product summary"><div class="a4k-product-media"><div class="a4k-media-toggle" aria-label="Product media view"><button class="is-active" type="button" data-a4k-media="image" aria-pressed="true">Image</button><button type="button" data-a4k-media="3d" aria-pressed="false">3D View</button></div><div class="a4k-media-panel is-active" data-a4k-panel="image">${a4kImage()}</div><div class="a4k-media-panel" data-a4k-panel="3d"><div class="a4k-3d-object" aria-hidden="true"></div><span>Interactive 3D product view</span></div></div><div class="a4k-spec-mini"><div><span>Length</span><b>3.20 mm</b></div><div><span>Width</span><b>1.60 mm</b></div><div><span>Height</span><b>0.90 mm</b></div><div><span>SPQ</span><b>3,000 / reel</b></div></div><a class="button" href="/downloads/a4k-series-datasheet.pdf" download>Download Datasheet</a></aside></section>
      <div class="a4k-section-nav-wrap"><strong>Product Details</strong><nav class="a4k-section-nav" aria-label="Product detail sections">${sections.map((section,i)=>`<button class="${i===0?"is-active":""}" type="button" data-a4k-section="${section[0]}">${section[1]}</button>`).join("")}</nav></div>
      <section class="a4k-section" id="specifications" data-section-id-preserve><h2>Specifications</h2><div class="a4k-summary-grid"><div><span>Product Type</span><b>Chip Array Ferrite Bead</b></div><div><span>Impedance Range</span><b>30–1000 Ω</b></div><div><span>Test Frequency</span><b>100 MHz</b></div><div><span>Operating Temp.</span><b>-40°C to +125°C</b></div></div><div class="a4k-table-tools"><input type="search" data-a4k-search aria-label="Search A4K specifications" placeholder="Search part number, impedance, DCR, current..."><button type="button" data-a4k-search-action>Search</button><button class="a4k-primary" type="button" data-a4k-inquiry>Inquire Selected</button><button type="button" data-a4k-losses>Analyze Losses</button></div><p>Choose the products you need, then submit an inquiry or compare their losses.</p><div class="a4k-table-wrap"><table aria-label="A4K Series Electrical Characteristics"><thead><tr><th class="a4k-select-cell">Inquire / Losses Compare</th><th>Part Number</th><th>Impedance Ω ±25%</th><th>Test Frequency</th><th>DCR Ω Max</th><th>Rated Current mA Max</th><th>Download</th></tr></thead><tbody>${a4kProductRows()}<tr data-a4k-empty hidden><td colspan="7">No A4K parts match your search.</td></tr></tbody></table></div><div class="a4k-compare-bar"><span><b>Selected parts:</b> <span data-a4k-selected-parts></span></span><button class="a4k-primary" type="button" data-a4k-inquiry>Send Selected Parts to Inquiry</button></div></section>
      <section class="a4k-section" id="environmental" data-section-id-preserve><h2>Environmental</h2><div class="a4k-two-col"><article class="a4k-info-card"><h3>Operating Conditions</h3><ul><li>Operating temperature: -40°C to +125°C</li><li>Storage temperature: -40°C to +125°C on board</li><li>Electrical data referenced to 25°C ambient</li></ul></article><article class="a4k-info-card"><h3>Storage Conditions</h3><ul><li>Store components in original packaging before use</li><li>Recommended storage: less than 40°C</li><li>Recommended humidity: less than 60% RH</li></ul></article></div></section>
      <section class="a4k-section" id="performance-curves" data-section-id-preserve><h2>Performance Curves</h2><article class="a4k-diagram-card"><h3>Characteristics Curve</h3><p>Impedance characteristics by selected part number</p><div class="a4k-diagram-box" data-a4k-losses-output role="status" aria-live="polite">Select products in the specification table, then choose Analyze Losses.</div></article></section>
      <section class="a4k-section" id="physical" data-section-id-preserve><h2>Physical Characteristics</h2><div class="a4k-two-col"><article class="a4k-diagram-card"><h3>Configuration & Dimensions</h3><p>Package drawing and dimension table</p><div class="a4k-diagram-box">Dimension Drawing<br>A / B / C / D1 / D2 / P</div></article><article class="a4k-diagram-card"><h3>Recommended PCB Layout</h3><p>PCB land pattern reference</p><div class="a4k-diagram-box">PCB Layout<br>G / H / I / J / L</div></article></div></section>
      <section class="a4k-section" id="tape-reel" data-section-id-preserve><h2>Tape & Reel</h2><div class="a4k-two-col"><article class="a4k-info-card"><h3>Packaging Quantity</h3><ul><li>Chip / Reel: 3,000 pcs</li><li>Inner Box: 15,000 pcs</li><li>Middle Box: 75,000 pcs</li><li>Carton: 150,000 pcs</li></ul></article><article class="a4k-info-card"><h3>Reel & Tape Dimensions</h3><ul><li>7” × 8 mm reel format</li><li>Tape reference for B0, A0, K0, P, T, and W</li><li>Tearing-off force reference by tape size</li></ul></article></div></section>
      <section class="a4k-section" id="soldering" data-section-id-preserve><h2>Soldering / Washing</h2><div class="a4k-two-col"><article class="a4k-info-card"><h3>Reflow Soldering</h3><ul><li>Pb-free reflow profile reference</li><li>Reflow times: 3 times max</li><li>Profile based on IPC / JEDEC J-STD-020F</li></ul></article><article class="a4k-info-card"><h3>Iron Soldering / Handling</h3><ul><li>Hand soldering is not preferred</li><li>Use controlled tip temperature and short soldering time</li><li>Follow the full datasheet for process precautions</li></ul></article></div></section>
      <section class="a4k-section" id="downloads" data-section-id-preserve><h2>Downloads & Support</h2><div class="a4k-download-grid"><article><div><h3>Datasheet PDF</h3><p>Full A4K Series technical specification.</p></div><a class="button" href="/downloads/a4k-series-datasheet.pdf" download>Download PDF</a></article><article><div><h3>Product Catalogue</h3><p>Explore EMC and magnetic components.</p></div>${buttonLink(routes.products,"View Products")}</article><article><div><h3>Need Help Selecting?</h3><p>Send selected part numbers and application requirements.</p></div><button class="button a4k-primary" type="button" data-a4k-inquiry>Go to Inquiry</button></article></div></section>
      <section class="a4k-section" id="enquiry" data-section-id-preserve><div class="a4k-selection-cta"><div><h2>Need help selecting components for your design?</h2><p>Share your device type, circuit area, target series, and electrical requirements so our team can help review suitable options.</p></div><div><button type="button" data-a4k-inquiry>Send Inquiry</button><a class="button" href="/downloads/a4k-series-datasheet.pdf" download>Download Brochure</a></div></div></section>
    </div></main>`;
  }

  function specSearchPage() {
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["TOOLS"],["Specification Search"]])}
      <section id="superworld_electronics_tools_spec_search_specification_search" class="container" data-section-id-preserve>
        ${specSearchMarkup}
      </section>
    </main>`;
  }

  const newsCategories = {
    all:"ALL", latest:"Latest Product News", product:"Product Releases", brochures:"Brochures", events:"Exhibitions & Trade Shows", csr:"Corporate Social Responsibility", eol:"End-of-Life Notices", business:"Business Updates", announcements:"Announcements"
  };

  function newsHero() {
    const features = [
      ["Program at Gladiolus Place","Corporate Social Responsibility"],
      ["New A4K Series Release","Latest Product News"],
      ["Electronica India Preview","Exhibitions & Trade Shows"]
    ].map(x=>`<div class="slide"><article class="feature-news"><div class="ph feature-news-visual" role="img" aria-label="Featured news image placeholder"><span class="tag">${x[1]}</span></div><div class="feature-news-content"><h2>${x[0]}</h2><p>Gladiolus Place is a non-profit Children’s Home, that provides a safe refuge for vulnerable teenage Girls aged 11-21 years old, ...</p>${link(routes.detail,"View More","link-arrow")}</div></article></div>`);
    return `<div class="news-top">${carousel("news-feature",features,1,false,"news-feature-carousel")}<aside class="event-box"><h2>Event Calendar</h2><div class="event-list">${Array.from({length:5},()=>`<div class="event-row"><div class="event-date"><b>JAN</b><span>21</span></div><div><h4>NEPCON Japan 2026 - Tokyo</h4><p>Booth no : # E36 – 27</p></div></div>`).join("")}</div>${buttonLink(routes.calendar,"Full Schedule","wide")}</aside></div>`;
  }

  function newsPage() {
    const params = new URLSearchParams(location.search);
    const category = params.get("category") || "all";
    const label = newsCategories[category] || newsCategories.latest;
    const allNewsCards = [
      ["Latest Product News","Radial-Leaded Inductor: Fully Automated Production Overview"],
      ["Business Updates","Our Johor Bahru facility is progressing"],
      ["Exhibitions & Trade Shows","NEPCON Japan 2026 Recap: Innovations, Insights & Trends"],
      ["Corporate Social Responsibility","Superworld Electronics’ CSR Program at Gladiolus Place"],
      ["Announcements","Holiday closure notice"],
      ["Brochures","Superworld Product Brochure"],
      ["Latest Product News","New A4K Series Release"],
      ["Business Updates","Superworld Electronics expands regional support"]
    ];
    const categoryCards = {
      latest: allNewsCards.filter(item=>item[0]==="Latest Product News"),
      events: allNewsCards.filter(item=>item[0]==="Exhibitions & Trade Shows"),
      csr: allNewsCards.filter(item=>item[0]==="Corporate Social Responsibility"),
      business: allNewsCards.filter(item=>["Business Updates","Corporate Social Responsibility","Announcements"].includes(item[0])),
      announcements: allNewsCards.filter(item=>item[0]==="Announcements"),
      brochures: allNewsCards.filter(item=>item[0]==="Brochures")
    };
    const selectedCards = category==="all" ? allNewsCards : (categoryCards[category]||allNewsCards);
    const cards = Array.from({length:8},(_,i)=>selectedCards[i%selectedCards.length]).map((item,i)=>`<article class="news-card" data-news-search-item data-news-year="2025"><div class="ph news-card-visual" role="img" aria-label="Image placeholder for ${item[1]}"><span class="tag">${item[0]}</span></div><div class="news-card-body"><h3>${item[1]}</h3><div class="news-card-footer">${link(routes.detail,"View More","link-arrow")}<span>17 December 2025</span></div></div></article>`);
    const list = Array.from({length:5},()=>`<article class="news-list-item" data-news-search-item data-news-year="2026"><div class="ph news-list-image" role="img" aria-label="Molded Power Inductor image placeholder"></div><div class="news-list-copy"><h3>Molded Power Inductor</h3><p>Low profile as low as 1mm. Capable of handling high current ratings while maintaining optimal performance in high-temperature environments.</p></div><div class="news-list-meta"><span class="tag">General</span><h3>PHA0301S</h3><p>Dimension Range : XXX - XXX</p><small>${category==="eol"?"End-of-Life":"Release Date"} : 15/04/2026</small></div>${link(routes.detail,`<span class="news-list-arrow" aria-hidden="true"></span><span class="sr-only">View Molded Power Inductor</span>`,"news-list-arrow-link")}</article>`).join("");
    const listMode = category === "product" || category === "eol";
    const categoryOptions = Object.entries(newsCategories).map(([value,name])=>`<option value="${value}" ${value===category?"selected":""}>${name}</option>`).join("");
    return `<main id="main-content" class="page-main news-page">${crumb([["HOME",routes.home],["NEWS"]])}<section class="section-sm news-page-section"><div class="container news-page-container">${newsHero()}
      <nav class="anchor-nav">${[["Latest News","latest"],["Product News","product"],["Events & Activities","events"],["Company News","business"],["Resources","brochures"]].map(x=>link(routes.news+"?category="+x[1],x[0])).join("")}</nav>
      <div class="news-filters"><select aria-label="Category" data-news-type>${categoryOptions}</select><select aria-label="Year" data-news-year><option value="">Year</option><option value="2026">2026</option><option value="2025">2025</option></select><div class="news-search"><input type="search" aria-label="Search news" data-news-search autocomplete="off"><button type="button" data-news-search-button aria-label="Search news"><span class="news-search-icon" aria-hidden="true"></span></button></div></div>
      <div class="news-results">${listMode?`<div class="news-list">${list}</div>`:`<div class="news-grid">${cards.join("")}</div>`}<p class="news-empty" data-news-empty hidden>No news matches your search.</p>${pagination()}</div>
    </div></section></main>`;
  }

  function eventCalendarPage() {
    const rows = Array.from({length:6},(_,index)=>`<tr data-event-search-item data-event-year="2026"><td>${ph()}</td><td>${index<3?"21 Jan (Wed) – 23 Jan (Fri)":"15 Apr (Wed) – 17 Apr (Fri)"}</td><td><strong>${index<3?"Tokyo Big Sight, Japan":"Bangalore International Exhibition Centre, India"}</strong><br>${index<3?"# E36 – 27":"# Hall 2 – B18"}</td><td><button>Learn More</button></td><td><button>Learn More</button><br>Book an Appointment</td></tr>`).join("");
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["NEWS",routes.news],["EVENT CALENDAR"]])}<section class="section-sm"><div class="container">${newsHero()}<nav class="anchor-nav">${link(routes.news,"Latest News")}${link(routes.news+"?category=product","Product News")}${link(routes.news+"?category=events","Events & Activities")}${link(routes.news+"?category=business","Company News")}${link(routes.news+"?category=brochures","Resources")}</nav><div class="news-filters"><select aria-label="Event category"><option>ALL</option></select><select aria-label="Event year" data-event-year-filter><option value="">Year</option><option value="2026">2026</option></select><div class="news-search"><input type="search" aria-label="Search events" data-event-search autocomplete="off"><button type="button" data-event-search-button aria-label="Search events"><span class="news-search-icon" aria-hidden="true"></span></button></div></div><div class="table-wrap" style="margin-top:56px"><table><thead><tr><th>Event</th><th>Date</th><th>Location, Booth No</th><th>Exhibition website</th><th>Our Expo Page</th></tr></thead><tbody>${rows}</tbody></table></div><p class="news-empty" data-event-empty hidden>No events match your search.</p>${pagination()}</div></section></main>`;
  }

  function newsDetailPage() {
    const related = Array.from({length:6},()=>mediaCard("Our Johor Bahru facility is progressing","Business Updates","View More",routes.detail));
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["NEWS",routes.news],["ARTICLE"]])}
      ${heroPanel("Radial-Leaded Inductor :<br>Fully Automated Production Overview","",["Latest Product News"],true)}
      <section class="section-sm"><div class="container"><div class="section-heading"><h3>17 December 2025</h3><div class="socials"><span>Share</span><span class="social">Chat</span><span class="social">in</span></div></div>
        <p>Superworld Electronics produces Radial-Leaded Inductors through a fully automated, controlled process for high precision and consistent quality.</p><p>Automated winding, soldering, and electrical testing ensure reliability, supported by strict inspection. All products undergo in-house reliability tests such as vibration, thermal shock, and solderability to confirm durability.</p><p>Certified to IATF 16949, ISO 9001, ISO 50001:2018, and AEC-Q200, our inductors meet global standards for quality and traceability.</p>${ph("map")}<div style="height:30px"></div>${ph("map")}
        <p style="margin-top:60px">Superworld Electronics produces Radial-Leaded Inductors through a fully automated, controlled process for high precision and consistent quality.</p>
        <div class="table-wrap"><table><thead><tr><th></th><th>Product</th><th>Category</th><th>Length (mm)</th><th>Width (mm)</th><th>Height (mm)</th><th>Inductance (uH)</th><th>Impedance (Ω)</th><th>DCR (mΩ)</th><th>Isat (mA)</th><th>Irms (mA)</th><th>SPQ</th><th></th></tr></thead><tbody>${productDataRows()}</tbody></table></div>${pagination()}<div class="section-heading" style="margin-top:50px">${buttonLink(routes.news,"Back to News")}<div class="button-group"><button>PREV</button><button>NEXT</button></div></div>
      </div></section><section class="section section-rule"><div class="container"><div class="section-heading center"><h2>SUPERWORLD ELECTRONICS LATEST NEWS</h2></div>${carousel("related-news",related,4)}</div></section>
    </main>`;
  }

  const locationData = [
    {type:"office",title:"Head Office (Singapore)",office:"Superworld Electronics (S) Pte Ltd",address:"16 New Industrial Road, #06-01 To 08, Hudson TechnoCentre, Singapore 536204",email:"sales@superworld.com.sg",contact:"(65) 6298 2866",fax:"(65) 6298 8900"},
    {type:"office",title:"Hong Kong",office:"Superworld Electronics (HK) Limited",address:"Unit 8-9 1/F, Hope Sea Industrial Centre No. 26 Lam Hing Street, Kowloon Bay Kowloon, Hong Kong",email:"sales@superworld.com.sg",contact:"(852) 2612 2969"},
    {type:"office",title:"Dongguan",office:"Superworld Electronics (Dongguan) Co., Ltd",address:"No. 2 East Ring Street 5, Jitigang Village Huangjiang Town, Dongguan City Guangdong Province, China 523757",email:"sales@superworld.com.sg",contact:"(86) 769 8353 6633"},
    {type:"office",title:"Kunshan",office:"Superworld Electronics (Dongguan) Co., Ltd",address:"No. 925 Guoshi Road Hi-Tech Industrial Development Zone Kunshan, Jiangsu Province, China 215333",email:"sales@superworld.com.sg",contact:"(86) 512 5525 8255"},
    {type:"office",title:"Taiwan",office:"Superworld Electronics Co., Ltd",address:"5F No. 479 Zhongyang Road Xinzhuang District, New Taipei City Taiwan 24251",email:"sales@superworld.com.sg",contact:"(886) 2 8521 1890",fax:"(886) 2 8521 1831"},
    {type:"office",title:"Malaysia",office:"Superworld Electronics (M) Sdn. Bhd",address:"1-14-01C, Menara IJM Land No. 1 Lebuh Tunku Kudin 3 11700 Gelugor, Penang, Malaysia",email:"sales@superworld.com.sg",contact:"(604) 287 3689"},
    {type:"agent",title:"Agent (Israel)",office:"Ziontronics Ltd",address:"10th Moshe Dayan St. Metropark Center Building C Petah Tikva 4951810 Israel",email:"info@ziontronics.co.ilj",contact:"(972) 3649 8642"},
    {type:"agent",title:"Agent (China)",office:"SEMTEK Technology Trading(Hong Kong) Limited",address:"4/F, 4B, No.51, South 4th section of the second ring road, Wuhou Dist, ChengDu",email:"steven.tang@semtek.cn",contact:"13193139115"},
    {type:"agent",title:"Agent (China)",office:"Shenzhen Lavincon Technology Ltd",address:"Rm807, Block B, Ipark Bg, No.26 Dengliang Rd, Nanshan ShenZhen, China",email:"landchan@kc-hk.com",contact:"+86-755-83662336 83668001"},
    {type:"agent",title:"Agent (Taiwan)",office:"LSH Electronics Co., Ltd",address:"No.1, Sec 1 Xuecheng Rd., Dashu Dist., Kaohsiung City, Taiwan (R.O.C) (Rm.61107,11F, International College)",email:"Benjamin@Ishe.com.tw",contact:"0935-346-196"},
    {type:"agent",title:"Agent (Taiwan)",office:"Chuan Yuan Electronics Co., Ltd",address:"No. 176-1, Minguang Rd., Taoyuan Dist., Taoyuan City 33043 (R.O.C.)",email:"angela@cye-co.com.tw",contact:"0935-551-771"},
    {type:"agent",title:"Agent (Japan)",office:"Fuji Tech Sales",address:"1-11-1 Kitasaiwai, Mizunobu Bldg. 7th Floor, Nish-ku,Yokohama, Kanagawa, Japan 220-0004",email:"info@fuji-tech.biz",contact:"+81 80-1240-3595",website:"www.fuji-tech.biz"},
    {type:"distributor",title:"Distributor (Netherlands)",office:"INNOVA Technologies",address:"Weesperzijde 25, 1091EC Amsterdam, The Netherlands",email:"eyal@innovatechnolog.com",contact:"(31) 20 670 21 82"},
    {type:"distributor",title:"Distributor (Italy)",office:"Starday S.R.L.",address:"Via Serra, 34 40012 Lippo di Calderara di Reno BO, Italy",email:"gianluca.guarnieri@stardaysrl.it",contact:"(39) 0513175148"},
    {type:"distributor",title:"Distributor (United Kingdom)",office:"Jauch Quartz UK Ltd",address:"Unit 4.7, Frimley 4 Business Park Frimley, Surrey, GU16 7SG, United Kingdom",email:"sales@jauch.com",contact:"+44-1276-6059-10"},
    {type:"distributor",title:"Distributor (France)",office:"Jauch Quartz France",address:"116 Rue de Silly, 92100 Boulogne-Billancourt, France",email:"celine.patureau@jauch.com",contact:"+33-1-469995-50"},
    {type:"distributor",title:"Distributor (America)",office:"Jauch Quartz America, Inc.",address:"43-100 Cook St, Suite 200, Palm Desert, CA 92211",email:"neil.floodgate@jauch.com",contact:"+1 760.282.3527"},
    {type:"distributor",title:"Distributor (Singapore)",office:"Supreme Components International (SCI)",address:"62 Jalan Eunos, Singapore 419591",email:"arvin@supremecomponents.com",contact:"+65 6848 1178",fax:"+65 6848 1176"}
  ];

  const locationCategoryFromQuery = () => {
    const category = new URLSearchParams(location.search).get("category");
    return ["office","agent","distributor"].includes(category) ? category : "all";
  };

  function locationsPage() {
    const activeCategory = locationCategoryFromQuery();
    const locationFilterButton = (value,label)=>`<button class="${activeCategory===value?"is-active":""}" type="button" data-location-filter="${value}" aria-pressed="${activeCategory===value}">${label}</button>`;
    const locationCards = (items)=>items.map(item=>`<article class="location-card" data-location-type="${item.type}"><h3>${item.title}</h3><p>${item.office}<br>${item.address}</p><p><a href="mailto:${item.email}">${item.email}</a></p><p>${item.contact}</p>${item.fax?`<p>Fax: ${item.fax}</p>`:""}${item.website?`<p><a href="https://${item.website}" target="_blank" rel="noopener">${item.website}</a></p>`:""}</article>`).join("");
    const locationGroups = [
      ["office","OFFICE"],
      ["agent","AGENT"],
      ["distributor","DISTRIBUTOR"]
    ].map(([type,label])=>`<section class="location-group" data-location-group data-location-type="${type}" aria-labelledby="location-group-${type}">
      <h3 id="location-group-${type}" class="location-group-label">${label}</h3>
      <div class="location-grid">${locationCards(locationData.filter(item=>item.type===type))}</div>
    </section>`).join("");
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["ABOUT US",routes.company],["GLOBAL PRESENCE"]])}
      ${heroPanel("GLOBAL PRESENCE","Our global operations enable us to deliver consistent quality, engineering expertise, and scalable production to customers across key markets worldwide.")}
      <nav class="anchor-nav"><a href="#regional">REGIONAL SUPPORT</a><a href="#locations">OUR LOCATIONS</a></nav>
      <section id="regional" class="section"><div class="container"><div class="section-heading center"><h2>REGIONAL SUPPORT FOR GLOBAL CUSTOMERS</h2><p>Manufacturing, engineering, sales, and logistics support across key markets.</p></div>${ph("map")}<div class="regions" style="margin-top:52px">${regionCards()}</div></div></section>
      <section id="locations" class="section section-rule"><div class="container"><div class="section-heading center"><h2>SUPERWORLD ELECTRONICS LOCATIONS</h2></div><div class="section-heading location-controls"><div class="location-tabs" aria-label="Filter locations">${locationFilterButton("all","ALL")}${locationFilterButton("office","Office")}${locationFilterButton("agent","Agent")}${locationFilterButton("distributor","Distributor")}</div><input type="search" data-location-search aria-label="Search locations" placeholder="Search Locations ..."></div><div class="location-groups" data-location-groups>${locationGroups}</div><p class="location-empty" data-location-empty hidden>No locations match your selection.</p>
      </div></section>
    </main>`;
  }

  function syncInquiryStateFromQuery() {
    if (location.pathname !== routes.inquiry) return;
    const key = inquiryIdsFromQuery().join(",");
    if (key === state.inquiryQueryKey) return;
    state.inquiryQueryKey = key;
    state.inquiryResolvedKey = null;
    state.inquiryLoading = false;
    state.inquiryError = "";
    state.inquiryProducts = [];
    state.cart = [];
  }

  async function loadInquiryProducts() {
    const ids = inquiryIdsFromQuery();
    const key = ids.join(",");
    if (!key || state.inquiryLoading || state.inquiryResolvedKey === key) {
      if (!key) state.inquiryResolvedKey = key;
      return;
    }
    state.inquiryLoading = true;
    try {
      const response = await fetch("/spec-search/mock-data.json");
      if (!response.ok) throw new Error(`Product data request failed (${response.status})`);
      const payload = await response.json();
      const products = payload?.products?.data?.items;
      if (!Array.isArray(products)) throw new Error("Product data is unavailable");
      if (state.inquiryQueryKey !== key) return;
      const productsById = new Map(products.map((product) => [Number(product.id), product]));
      state.inquiryProducts = ids.map((id) => productsById.get(id)).filter(Boolean);
      state.cart = state.inquiryProducts.map(() => 1);
      state.inquiryError = "";
    } catch (error) {
      console.error(error);
      if (state.inquiryQueryKey === key) {
        state.inquiryProducts = [];
        state.cart = [];
        state.inquiryError = "Selected products could not be loaded. Please return to Specification Search and try again.";
      }
    } finally {
      if (state.inquiryQueryKey === key) {
        state.inquiryLoading = false;
        state.inquiryResolvedKey = key;
        render(false);
      }
    }
  }

  function updateInquiryQuery() {
    const params = new URLSearchParams(location.search);
    params.delete("inquiry");
    state.inquiryProducts.forEach((product) => params.append("inquiry", String(product.id)));
    const query = params.toString();
    history.replaceState({}, "", `${location.pathname}${query ? `?${query}` : ""}${location.hash}`);
    const key = state.inquiryProducts.map((product) => product.id).join(",");
    state.inquiryQueryKey = key;
    state.inquiryResolvedKey = key;
  }

  function removeInquiryItem(index) {
    state.inquiryProducts.splice(index, 1);
    state.cart.splice(index, 1);
    updateInquiryQuery();
    render(false);
  }

  const supportRequestTypes = [
    "General Inquiry",
    "Request for Quotation",
    "Technical Support",
    "Quality / Complaint",
    "Book An Appointment",
    "Anonymous"
  ];

  const supportProductCategoryGroups = [
    ["EMC Components", generalCategories["EMC Components"]],
    ["Magnetic Components", generalCategories["Magnetic Components"]],
    ["Transformers", generalCategories["Transformer"]],
    ["Wireless Power Transfer", generalCategories["Wireless Power Transfer"]],
    ["Automotive Components", [
      "Automotive Chip Array Ferrite Bead",
      "Automotive Ferrite Chip Bead",
      "Automotive Ferrite Chip Bead (Large Current)",
      "Automotive Semi-Shielded Power Inductor",
      "Automotive Common Mode Choke",
      "Automotive Molded Power Inductor",
      "Automotive Planar Inductor",
      "Automotive Transponder Coil",
      "Automotive Receiver Coil",
      "Automotive Transmitter Coil"
    ]]
  ];

  function supportRequestFromQuery() {
    const params = new URLSearchParams(location.search);
    const firstEntry = params.entries().next().value;
    const candidate = params.get("type")
      || params.get("request")
      || params.get("support")
      || params.get("inquiry")
      || params.get("help")
      || firstEntry?.[1]
      || firstEntry?.[0]
      || "General Inquiry";
    const normalized = candidate.trim().toLowerCase().replace(/[_+-]+/g," ").replace(/\s+/g," ");
    const aliases = {
      "general": "General Inquiry",
      "general inquiry": "General Inquiry",
      "quotation": "Request for Quotation",
      "rfq": "Request for Quotation",
      "request for quotation": "Request for Quotation",
      "technical": "Technical Support",
      "technical support": "Technical Support",
      "quality": "Quality / Complaint",
      "complaint": "Quality / Complaint",
      "quality complaint": "Quality / Complaint",
      "quality / complaint": "Quality / Complaint",
      "appointment": "Book An Appointment",
      "book appointment": "Book An Appointment",
      "book an appointment": "Book An Appointment",
      "anonymous": "Anonymous"
    };
    return aliases[normalized] || supportRequestTypes.find(type=>type.toLowerCase()===normalized) || "General Inquiry";
  }

  function supportSelectOptions(selectedType) {
    return supportRequestTypes.map(type=>`<option value="${type}" ${type===selectedType?"selected":""}>${type}</option>`).join("");
  }

  function supportField(id,label,type="text",attributes="") {
    return `<div class="support-field"><label for="${id}">${label}</label><input id="${id}" name="${id}" type="${type}" ${attributes}></div>`;
  }

  function supportProductCategoryField() {
    const groups = supportProductCategoryGroups.map(([group,items],groupIndex)=>{
      const options = items.map((item,itemIndex)=>{
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
      }).join("");
      return `<section class="support-category-group" data-support-category-group>
        <h3>${escapeHtml(group)}</h3>
        ${options}
      </section>`;
    }).join("");
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
          ${supportField("support-full-name","Full Name","text","autocomplete=\"name\" required")}
          <div class="support-two-fields">
            ${supportField("support-job-title","Job Title / Department","text","autocomplete=\"organization-title\"")}
            ${supportField("support-phone","Phone Number","tel","autocomplete=\"tel\"")}
          </div>
          ${supportField("support-email","Business Email","email","autocomplete=\"email\" required")}
        </div>
      </section>
      <section class="support-detail-column" aria-labelledby="support-business-heading">
        <h2 id="support-business-heading">Business / project info</h2>
        <div class="support-field-panel">
          <div class="support-two-fields">
            ${supportField("support-company","Company Name","text","autocomplete=\"organization\" required")}
            ${supportField("support-industry","Industry")}
            ${supportField("support-country","Country / Region","text","autocomplete=\"country-name\"")}
            <div class="support-field"><label for="support-timeline">Project Timeline</label><select id="support-timeline" name="support-timeline"><option>1–3 months</option><option>3–6 months</option><option>6–12 months</option><option>More than 12 months</option></select></div>
          </div>
          ${supportField("support-website","Company Website","url","autocomplete=\"url\"")}
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
            ${supportField("support-date-one","Date","date","required")}
            <div class="support-field"><label for="support-time-one">Time</label><select id="support-time-one" name="support-time-one"><option value="">Select time</option><option>9:00 AM</option><option>10:00 AM</option><option>11:00 AM</option><option>2:00 PM</option><option>3:00 PM</option><option>4:00 PM</option></select></div>
          </div>
        </fieldset>
        <fieldset class="support-appointment-card">
          <legend>Preferred date 2</legend>
          <div class="support-two-fields">
            ${supportField("support-date-two","Date","date")}
            <div class="support-field"><label for="support-time-two">Time</label><select id="support-time-two" name="support-time-two"><option value="">Select time</option><option>9:00 AM</option><option>10:00 AM</option><option>11:00 AM</option><option>2:00 PM</option><option>3:00 PM</option><option>4:00 PM</option></select></div>
          </div>
        </fieldset>
      </div>
    </section>`;
  }

  function supportOfficeCards() {
    const supportLocations = locationData.filter(item=>item.type==="office");
    const cards = supportLocations.map((item,index)=>{
      const isHeadOffice = index === 0;
      return `<article class="support-location-card" data-support-location-card aria-label="${escapeHtml(item.title)}">
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.office)}<br>${escapeHtml(item.address)}</p>
        <p><a href="mailto:${escapeHtml(item.email)}">${escapeHtml(item.email)}</a></p>
        <p>${escapeHtml(item.contact)}</p>
        ${item.fax?`<p>${escapeHtml(item.fax)}</p>`:""}
        ${item.website?`<p><a href="https://${escapeHtml(item.website)}" target="_blank" rel="noopener">${escapeHtml(item.website)}</a></p>`:""}
        ${isHeadOffice?`<p><a href="https://maps.google.com/?q=16+New+Industrial+Road+Singapore+536204" target="_blank" rel="noopener">Get Directions</a></p><p>${link(routes.support+"?type=Book%20An%20Appointment","Book an Appointment")}</p>`:""}
      </article>`;
    }).join("");
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

  function supportPage() {
    const requestType = supportRequestFromQuery();
    const isAnonymous = requestType === "Anonymous";
    const isAppointment = requestType === "Book An Appointment";
    return `<main id="main-content" class="page-main support-page">
      ${crumb([["HOME",routes.home],["CONTACT US"]])}
      <div class="container">
        <section class="support-hero">
          <div><h1>CONTACT US</h1><p>Get in touch with our team for product inquiries, quotations, or technical support.<br>We support your design and application needs with reliable magnetic solutions.</p></div>
          <div class="support-hero-logo">${logo()}</div>
        </section>
        <form class="support-form" data-support-form>
          <section class="support-form-section">
            <h2>Inquiry Details</h2>
            <div class="support-inquiry-panel">
              <div class="support-field"><label for="support-request-type">How can we help you?</label><select id="support-request-type" name="support-request-type" data-support-request-type>${supportSelectOptions(requestType)}</select></div>
              ${supportProductCategoryField()}
            </div>
          </section>
          ${isAnonymous?"":supportContactAndBusinessFields()}
          ${supportAttachmentField()}
          ${isAppointment?supportAppointmentFields():""}
          <section class="support-form-section">
            <h2>Overall remarks</h2>
            <div class="support-field"><label class="sr-only" for="support-remarks">Overall remarks</label><textarea id="support-remarks" name="support-remarks" required></textarea></div>
          </section>
          <div class="support-form-actions">
            <label class="support-consent"><input type="checkbox" required><span>Kindly consent to the terms and conditions. Click "Read More" for further comprehension.</span></label>
            <button type="submit">Submit</button>
          </div>
        </form>
        ${supportOfficeCards()}
      </div>
    </main>`;
  }

  function inquiryPage() {
    const value = (product, key) => escapeHtml(product[key] || "—");
    const cartRows = state.inquiryProducts.map((product, i) => {
      const sku = escapeHtml(product.sku || product.name || product.series || "Product");
      const image = safeDataUrl(product.seriesImage, "data:image/");
      const pdf = safeDataUrl(product.pdfDownload, "data:application/pdf;base64,");
      return `<div class="cart-row" data-cart-row="${i}"><div class="cart-number">${i + 1}</div><div class="cart-product">${image ? `<img src="${image}" alt="${sku}">` : ph()}<div class="cart-product-copy"><h3>${sku}</h3><p class="cart-dimensions"><strong>L × W × H</strong><span>${value(product,"acf.length")} × ${value(product,"acf.width")} × ${value(product,"acf.height")} mm</span></p><p><strong>Series</strong><br>${value(product,"series")}</p><p><strong>Category</strong><br>${value(product,"category")}</p><dl class="cart-specs"><div><dt>Inductance (uH)</dt><dd>${value(product,"acf.inductance")}</dd></div><div><dt>Impedance (Ω)</dt><dd>${value(product,"acf.impedance")}</dd></div><div><dt>DCR (mΩ)</dt><dd>${value(product,"acf.dcr")}</dd></div><div><dt>Isat (mA)</dt><dd>${value(product,"acf.isat")}</dd></div><div><dt>Irms (mA)</dt><dd>${value(product,"acf.irms")}</dd></div><div><dt>Specification</dt><dd>${pdf ? `<a href="${pdf}" download="${sku}.pdf">Download</a>` : "—"}</dd></div></dl></div></div><div class="cart-quantity"><div class="quantity"><button type="button" data-qty="${i}" data-delta="1" aria-label="Increase quantity for ${sku}">+</button><output aria-label="Quantity for ${sku}">${state.cart[i]}</output><button type="button" data-qty="${i}" data-delta="-1" aria-label="Decrease quantity for ${sku}">−</button></div><button class="cart-remove" type="button" data-remove="${i}">Remove</button></div></div>`;
    }).join("");
    const pending = state.inquiryQueryKey && state.inquiryResolvedKey !== state.inquiryQueryKey;
    const summaryContent = pending
      ? `<div class="inquiry-empty" role="status">Loading selected products…</div>`
      : state.inquiryError
        ? `<div class="inquiry-empty inquiry-error" role="alert">${escapeHtml(state.inquiryError)}</div>`
        : cartRows || `<div class="inquiry-empty"><h3>Your inquiry cart is empty.</h3>${buttonLink(routes.tools,"Search Products")}</div>`;
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["INQUIRY CART"]])}<section class="section-sm"><div class="container"><div class="section-heading"><h1>INQUIRY CART SUMMARY</h1><button type="button" data-back>Back</button></div><div class="inquiry-summary"><div class="inquiry-summary-header"><span aria-hidden="true"></span><h2>Product Details</h2><strong>Quantity</strong></div><div data-cart-container>${summaryContent}</div></div>
      <section class="section inquiry-details"><h1>INQUIRY DETAILS</h1><form class="inquiry-form" data-inquiry-form><div class="form-columns"><div><h2>CONTACT DETAILS</h2><div class="field"><label for="fullname">Full Name</label><input id="fullname" name="fullname" required></div><div class="form-grid-2"><div class="field"><label>Job Title / Department</label><input name="job"></div><div class="field"><label>Phone Number</label><input name="phone" type="tel"></div></div><div class="field"><label>Business Email</label><input name="email" type="email" required></div></div><div><h2>BUSINESS / PROJECT INFO</h2><div class="form-grid-2"><div class="field"><label>Company Name</label><input name="company" required></div><div class="field"><label>Industry</label><input name="industry"></div><div class="field"><label>Country / Region</label><input name="country"></div><div class="field"><label>Project Timeline</label><select name="timeline"><option>1–3 months</option><option>3–6 months</option><option>6–12 months</option></select></div></div><div class="field"><label>Company Website</label><input name="website" type="url"></div></div></div><h2>OVERALL REMARKS</h2><div class="field"><textarea name="remarks"></textarea></div><div class="section-heading"><label><input type="checkbox" required> Kindly consent to the terms and conditions.<br>Click "Read More" for further comprehension.</label><button class="button wide" type="submit">Submit</button></div></form></section>
    </div></section></main>`;
  }

  function thanksPage() {
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["INQUIRY CART",routes.inquiry],["THANKS YOU"]])}<section class="thanks"><h1>Thank you for<br>your inquiry.</h1><div><p>Our team has received your request and will review the details shortly.<br>You can expect a response within 1–2 working days.</p><p>In the meantime, feel free to:<br>– Continue browsing our products<br>– Submit additional inquiries<br>– Contact us directly for urgent support</p><p>We appreciate your interest in Superworld Electronics.</p>${buttonLink(routes.products,"Continue Browsing")}</div></section></main>`;
  }

  function pageForPath() {
    const p = location.pathname.replace(/\/+$/,"") || "/";
    if (p === routes.home) return homePage();
    if (p === routes.company) return companyPage();
    if (p === routes.achievements) return achievementsPage();
    if (p === routes.quality) return qualityPage();
    if (p === routes.sustainability) return sustainabilityPage();
    if (p === routes.applications) return applicationsPage();
    if (p === routes.automotive) return industryDetailPage("automotive");
    if (p === routes.communication) return industryDetailPage("communication");
    if (p === routes.products) return productsPage();
    if (p === routes.general) return generalPage();
    if (p === routes.emc) return emcPage();
    if (p === routes.a4k) return a4kPage();
    if (p === routes.tools) return specSearchPage();
    if (p === routes.calendar) return eventCalendarPage();
    if (p === routes.detail) return newsDetailPage();
    if (p === routes.locations) return locationsPage();
    if (p === routes.support) return supportPage();
    if (p === routes.inquiry) return inquiryPage();
    if (p === routes.thanks) return thanksPage();
    if (p === routes.news) return newsPage();
    return `<main id="main-content" class="page-main"><section class="section"><div class="container"><h1>Page not found</h1>${buttonLink(routes.home,"Return Home")}</div></section></main>`;
  }

  function stopTimers() {
    state.timers.forEach(clearInterval);
    state.timers = [];
    state.cleanups.forEach(cleanup=>cleanup());
    state.cleanups = [];
  }

  function setupCarousels() {
    document.querySelectorAll("[data-carousel]").forEach((root) => {
      const track = root.querySelector(".carousel-track");
      const slides = [...root.querySelectorAll(".slide")];
      const dots = root.querySelector(".carousel-dots");
      if (!track || slides.length < 2) return;
      let index = 0;
      const configured = Number(getComputedStyle(root).getPropertyValue("--visible")) || 1;
      const visible = () => window.innerWidth <= 560 ? 1 : window.innerWidth <= 820 ? Math.min(2,configured) : configured;
      const maxIndex = () => Math.max(0, slides.length - visible());
      const renderDots = () => {
        if (!dots) return;
        dots.innerHTML = Array.from({length:maxIndex()+1},(_,i)=>`<button class="carousel-dot ${i===index?"is-active":""}" type="button" data-dot="${i}" aria-label="Go to slide ${i+1}"></button>`).join("");
      };
      const update = () => {
        index = Math.min(index,maxIndex());
        const gap = 22;
        const width = root.querySelector(".carousel-window").clientWidth;
        const cardWidth = (width - gap * (visible()-1)) / visible();
        track.style.transform = `translateX(-${index*(cardWidth+gap)}px)`;
        renderDots();
      };
      const move = (delta) => { index += delta; if(index > maxIndex()) index = 0; if(index < 0) index = maxIndex(); update(); };
      root.querySelector("[data-prev]")?.addEventListener("click",()=>move(-1));
      root.querySelector("[data-next]")?.addEventListener("click",()=>move(1));
      dots?.addEventListener("click",(e)=>{const b=e.target.closest("[data-dot]");if(b){index=Number(b.dataset.dot);update();}});
      const timer = setInterval(()=>move(1),4500);
      state.timers.push(timer);
      window.addEventListener("resize",update,{passive:true});
      update();
    });
  }

  function setupCommunicationSystemTabs() {
    const root=document.getElementById("systemTabsRoot");
    if(!root||root.dataset.systemTabsReady==="true") return;
    root.dataset.systemTabsReady="true";
    const setCardState=(card,open)=>{
      const panel=card.querySelector(".subapp-panel");
      const trigger=card.querySelector(".subapp-trigger");
      const icon=card.querySelector(".accordion-icon");
      card.classList.toggle("is-open",open);
      panel?.classList.toggle("is-open",open);
      if(panel) panel.hidden=!open;
      trigger?.setAttribute("aria-expanded",String(open));
      if(icon) icon.textContent=open?"−":"+";
    };
    const activateSystem=system=>{
      root.querySelectorAll(".system-tab-btn").forEach(button=>{
        const active=button.dataset.system===system;
        button.classList.toggle("active",active);
        button.setAttribute("aria-selected",String(active));
      });
      root.querySelectorAll(".system-panel").forEach(panel=>{
        const active=panel.dataset.systemPanel===system;
        panel.classList.toggle("active",active);
        panel.hidden=!active;
      });
    };
    root.addEventListener("click",event=>{
      const tab=event.target.closest(".system-tab-btn");
      if(tab){activateSystem(tab.dataset.system);return;}
      const hotspot=event.target.closest("[data-open-card]");
      if(hotspot){
        event.preventDefault();
        const panel=hotspot.closest(".system-panel");
        const card=panel?.querySelector(`#${hotspot.dataset.openCard}`);
        if(card){setCardState(card,true);card.scrollIntoView({behavior:"smooth",block:"start"});}
        return;
      }
      const toggle=event.target.closest(".subapp-trigger,.accordion-icon");
      if(toggle){
        event.preventDefault();
        const card=toggle.closest(".subapp-card");
        if(card) setCardState(card,!card.classList.contains("is-open"));
        return;
      }
      const showAll=event.target.closest(".show-all-btn");
      if(showAll){showAll.closest(".system-panel")?.querySelectorAll(".subapp-card").forEach(card=>setCardState(card,true));return;}
      const collapseAll=event.target.closest(".collapse-all-btn");
      if(collapseAll) collapseAll.closest(".system-panel")?.querySelectorAll(".subapp-card").forEach(card=>setCardState(card,false));
    });
  }

  function setupA4kPage() {
    const root=document.querySelector("[data-a4k-page]");
    if(!root) return;
    root.querySelectorAll("[data-a4k-media]").forEach(button=>button.addEventListener("click",()=>{
      const view=button.dataset.a4kMedia;
      root.querySelectorAll("[data-a4k-media]").forEach(control=>{
        const active=control===button;
        control.classList.toggle("is-active",active);
        control.setAttribute("aria-pressed",String(active));
      });
      root.querySelectorAll("[data-a4k-panel]").forEach(panel=>panel.classList.toggle("is-active",panel.dataset.a4kPanel===view));
    }));
    const sectionButtons=[...root.querySelectorAll("[data-a4k-section]")];
    const sectionNav=root.querySelector(".a4k-section-nav");
    const sectionNavWrap=root.querySelector(".a4k-section-nav-wrap");
    let activeSectionId="overview";
    const activateSection=(sectionId,center=false)=>{
      activeSectionId=sectionId;
      sectionButtons.forEach(button=>{
        const active=button.dataset.a4kSection===sectionId;
        button.classList.toggle("is-active",active);
        if(active&&center&&sectionNav) sectionNav.scrollTo({left:button.offsetLeft-(sectionNav.clientWidth-button.offsetWidth)/2,behavior:"smooth"});
      });
    };
    const sectionOffset=()=>{
      const stickyTop=parseFloat(getComputedStyle(sectionNavWrap).top)||0;
      const headerBottom=document.querySelector(".site-header")?.getBoundingClientRect().bottom||0;
      return Math.max(stickyTop,headerBottom)+sectionNavWrap.offsetHeight+16;
    };
    const scrollToSection=sectionId=>{
      const section=document.getElementById(sectionId);
      if(!section||!sectionNavWrap) return;
      window.scrollTo({top:Math.max(0,section.getBoundingClientRect().top+window.scrollY-sectionOffset()),behavior:"smooth"});
      activateSection(sectionId,true);
    };
    sectionButtons.forEach(button=>button.addEventListener("click",()=>scrollToSection(button.dataset.a4kSection)));
    const syncSection=()=>{
      const current=sectionButtons.map(button=>document.getElementById(button.dataset.a4kSection)).filter(section=>section?.getBoundingClientRect().top<=sectionOffset()+1).at(-1);
      if(current&&current.id!==activeSectionId) activateSection(current.id,true);
    };
    window.addEventListener("scroll",syncSection,{passive:true});
    state.cleanups.push(()=>window.removeEventListener("scroll",syncSection));
    const rows=[...root.querySelectorAll("[data-a4k-row]")];
    const selectedParts=()=>rows.filter(row=>row.querySelector("[data-a4k-select]")?.checked).map(row=>a4kParts.find(part=>part.id===Number(row.dataset.productId))).filter(Boolean);
    const syncSelection=()=>{
      const parts=selectedParts();
      const label=root.querySelector("[data-a4k-selected-parts]");
      if(label) label.textContent=parts.length?parts.map(part=>part.sku).join(", "):"None";
      root.querySelectorAll("[data-a4k-inquiry],[data-a4k-losses]").forEach(button=>button.disabled=parts.length===0);
    };
    rows.forEach(row=>row.querySelector("[data-a4k-select]")?.addEventListener("change",syncSelection));
    const searchInput=root.querySelector("[data-a4k-search]");
    const applySearch=()=>{
      const query=searchInput?.value.trim().toLowerCase()||"";
      let visible=0;
      rows.forEach(row=>{const show=!query||row.textContent.toLowerCase().includes(query);row.hidden=!show;if(show)visible+=1;});
      const empty=root.querySelector("[data-a4k-empty]");
      if(empty) empty.hidden=visible!==0;
    };
    searchInput?.addEventListener("input",applySearch);
    root.querySelector("[data-a4k-search-action]")?.addEventListener("click",applySearch);
    root.querySelectorAll("[data-a4k-inquiry]").forEach(button=>button.addEventListener("click",()=>{
      const params=new URLSearchParams({root:"1",category:"159"});
      selectedParts().forEach(part=>params.append("inquiry",String(part.id)));
      navigate(`${routes.inquiry}?${params}`);
    }));
    root.querySelector("[data-a4k-losses]")?.addEventListener("click",()=>{
      const parts=selectedParts();
      const output=root.querySelector("[data-a4k-losses-output]");
      if(output) output.textContent=`Estimated I²R loss at rated current: ${parts.map(part=>`${part.sku} ${(Number(part.dcr)*Math.pow(Number(part.current)/1000,2)*1000).toFixed(1)} mW`).join(" · ")}`;
      scrollToSection("performance-curves");
    });
    syncSelection();
  }

  function setupInteractions() {
    document.querySelector(".mobile-toggle")?.addEventListener("click",(e)=>{
      const header = document.querySelector(".site-header");
      header.classList.toggle("mobile-open");
      e.currentTarget.setAttribute("aria-expanded",String(header.classList.contains("mobile-open")));
    });
    document.querySelectorAll("[data-menu]").forEach(btn=>btn.addEventListener("click",(e)=>{
      e.stopPropagation();
      const name = btn.dataset.menu;
      const panel = document.querySelector(`[data-panel="${name}"]`);
      document.querySelectorAll(".mega-panel").forEach(p=>{if(p!==panel)p.classList.remove("is-open");});
      panel?.classList.toggle("is-open");
      if(panel?.classList.contains("is-open")) panel.querySelector("[data-mega-news-slider]")?.dispatchEvent(new CustomEvent("mega:open"));
    }));
    document.addEventListener("click",()=>document.querySelectorAll(".mega-panel").forEach(p=>p.classList.remove("is-open")),{once:true});
    document.querySelectorAll(".mega-panel").forEach(p=>p.addEventListener("click",e=>e.stopPropagation()));
    document.querySelectorAll("[data-mega-news-slider]").forEach(root=>{
      const windowEl=root.querySelector(".mega-news-window");
      const track=root.querySelector(".mega-news-track");
      const slides=[...root.querySelectorAll(".mega-news-card")];
      let index=0;
      const visible=()=>window.innerWidth<=560?1:2;
      const maxIndex=()=>Math.max(0,slides.length-visible());
      const update=()=>{
        if(!windowEl||!track) return;
        index=Math.min(index,maxIndex());
        const gap=22;
        const cardWidth=(windowEl.clientWidth-gap*(visible()-1))/visible();
        slides.forEach(slide=>slide.style.flexBasis=`${cardWidth}px`);
        track.style.transform=`translateX(-${index*(cardWidth+gap)}px)`;
      };
      const move=delta=>{index+=delta;if(index>maxIndex())index=0;if(index<0)index=maxIndex();update();};
      root.querySelector("[data-mega-news-prev]")?.addEventListener("click",()=>move(-1));
      root.querySelector("[data-mega-news-next]")?.addEventListener("click",()=>move(1));
      root.addEventListener("mega:open",update);
      window.addEventListener("resize",update,{passive:true});
    });
    document.querySelectorAll("[data-language]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();alert(`${a.dataset.language} is shown as a wireframe option. Translation will be added in the content phase.`);}));
    const marketAllButton=document.querySelector("[data-market-all]");
    const syncMarketAllLabel=()=>{if(marketAllButton){const cards=[...document.querySelectorAll(".market-card")];marketAllButton.textContent=cards.length&&cards.every(card=>card.classList.contains("is-open"))?"Collapse All":"View All";}};
    const setMarketCardState=(card,open)=>{
      card.classList.toggle("is-open",open);
      card.querySelectorAll(".market-toggle,.market-state-toggle").forEach(control=>control.setAttribute("aria-expanded",String(open)));
      const name=card.querySelector(".market-summary h3")?.textContent||"market";
      card.querySelector(".market-state-toggle")?.setAttribute("aria-label",`${open?"Close":"Open"} ${name} details`);
    };
    marketAllButton?.addEventListener("click",()=>{
      const cards=[...document.querySelectorAll(".market-card")];
      const allOpen=cards.every(c=>c.classList.contains("is-open"));
      cards.forEach(card=>setMarketCardState(card,!allOpen));
      syncMarketAllLabel();
    });
    document.querySelectorAll(".market-toggle,.market-state-toggle").forEach(btn=>btn.addEventListener("click",()=>{const card=btn.closest(".market-card");setMarketCardState(card,!card.classList.contains("is-open"));syncMarketAllLabel();}));
    document.querySelectorAll("[data-market-card]").forEach(card=>{
      const input=card.querySelector("[data-market-search]");
      const action=card.querySelector("[data-market-search-action]");
      const items=[...card.querySelectorAll("[data-market-item]")];
      const empty=card.querySelector("[data-market-no-results]");
      const applyMarketSearch=()=>{
        const query=input.value.trim().toLowerCase();
        let visibleCount=0;
        items.forEach(item=>{const visible=!query||item.textContent.toLowerCase().includes(query);item.hidden=!visible;if(visible)visibleCount+=1;});
        action.classList.toggle("is-clear",Boolean(query));
        action.setAttribute("aria-label",query?`Clear ${card.querySelector(".market-summary h3")?.textContent||"market"} search`:`Focus ${card.querySelector(".market-summary h3")?.textContent||"market"} search`);
        if(empty) empty.hidden=visibleCount!==0;
      };
      input?.addEventListener("input",applyMarketSearch);
      input?.addEventListener("search",applyMarketSearch);
      action?.addEventListener("click",()=>{if(input.value){input.value="";applyMarketSearch();}input.focus();});
      applyMarketSearch();
    });
    document.querySelectorAll(".accordion-head").forEach(btn=>btn.addEventListener("click",()=>{
      const box=btn.closest(".accordion"); box.classList.toggle("is-open");
      btn.setAttribute("aria-expanded",String(box.classList.contains("is-open")));
      const symbol=btn.querySelector(".accordion-symbol"); if(symbol) symbol.textContent=box.classList.contains("is-open")?"−":"+";
    }));
    document.querySelectorAll("[data-accordion-all]").forEach(btn=>btn.addEventListener("click",()=>{
      const open=btn.dataset.accordionAll==="open";
      document.querySelectorAll(".accordion").forEach(box=>{box.classList.toggle("is-open",open);box.querySelector(".accordion-head")?.setAttribute("aria-expanded",String(open));const s=box.querySelector(".accordion-symbol");if(s)s.textContent=open?"−":"+";});
    }));
    document.querySelectorAll(".lab-tab").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll(".lab-tab").forEach(b=>b.classList.remove("is-active"));btn.classList.add("is-active");}));
    document.querySelectorAll("[data-scroll-target]").forEach(btn=>btn.addEventListener("click",()=>document.getElementById(btn.dataset.scrollTarget)?.scrollIntoView({behavior:"smooth"})));
    document.querySelectorAll(".category-check").forEach(c=>c.addEventListener("change",()=>{
      const count=document.querySelectorAll(".category-check:checked").length; const label=document.querySelector("[data-selected-count]"); if(label)label.textContent=`${count} selected`;
    }));
    document.querySelector("[data-clear-filters]")?.addEventListener("click",()=>{document.querySelectorAll(".search-block input[type=checkbox]").forEach(c=>c.checked=false);const l=document.querySelector("[data-selected-count]");if(l)l.textContent="0 selected";});
    document.querySelector("[data-spec-search]")?.addEventListener("click",()=>alert("Wireframe search applied. The results table below represents the result state."));
    document.querySelectorAll("[data-qty]").forEach(btn=>btn.addEventListener("click",()=>{
      const i=Number(btn.dataset.qty);
      const quantity=state.cart[i]+Number(btn.dataset.delta);
      if(quantity<=0){removeInquiryItem(i);return;}
      state.cart[i]=quantity;
      render(false);
    }));
    document.querySelectorAll("[data-remove]").forEach(btn=>btn.addEventListener("click",()=>removeInquiryItem(Number(btn.dataset.remove))));
    document.querySelector("[data-back]")?.addEventListener("click",()=>history.back());
    document.querySelector("[data-inquiry-form]")?.addEventListener("submit",(e)=>{e.preventDefault();navigate(routes.thanks);});
    document.querySelector("[data-support-request-type]")?.addEventListener("change",(event)=>{
      history.replaceState({}, "", `${routes.support}?type=${encodeURIComponent(event.currentTarget.value)}`);
      render(false);
    });
    const supportCategory=document.querySelector("[data-support-category]");
    if(supportCategory){
      const trigger=supportCategory.querySelector("[data-support-category-trigger]");
      const panel=supportCategory.querySelector("[data-support-category-panel]");
      const search=supportCategory.querySelector("[data-support-category-search]");
      const summary=supportCategory.querySelector("[data-support-category-summary]");
      const checkboxes=[...supportCategory.querySelectorAll("[data-support-category-option] input[type=checkbox]")];
      const otherCheckbox=supportCategory.querySelector("[data-support-category-other]");
      const otherField=supportCategory.querySelector("[data-support-category-other-field]");
      const otherInput=supportCategory.querySelector("[data-support-category-other-input]");
      const setCategoryOpen=open=>{
        panel.hidden=!open;
        trigger.setAttribute("aria-expanded",String(open));
        supportCategory.classList.toggle("is-open",open);
        if(open) window.requestAnimationFrame(()=>search.focus());
      };
      const updateCategorySummary=()=>{
        const selected=checkboxes.filter(input=>input.checked).map(input=>input.value);
        summary.textContent=selected.length===0
          ?"Select product categories"
          :selected.length<=2
            ?selected.join(", ")
            :`${selected.length} product categories selected`;
        const showOther=Boolean(otherCheckbox?.checked);
        if(otherField) otherField.hidden=!showOther;
        if(otherInput){
          otherInput.disabled=!showOther;
          otherInput.required=showOther;
        }
        checkboxes.forEach(checkbox=>{
          const option=checkbox.closest("[data-support-category-option]");
          const detail=option?.querySelector("[data-support-category-detail]");
          const detailInput=option?.querySelector("[data-support-category-detail-input]");
          if(detail) detail.hidden=!checkbox.checked;
          if(detailInput) detailInput.disabled=!checkbox.checked;
        });
      };
      const filterCategories=()=>{
        const query=search.value.trim().toLowerCase();
        let visible=0;
        supportCategory.querySelectorAll("[data-support-category-group]").forEach(group=>{
          let groupVisible=0;
          group.querySelectorAll("[data-support-category-option]").forEach(option=>{
            const show=!query||option.textContent.toLowerCase().includes(query);
            option.hidden=!show;
            if(show){groupVisible+=1;visible+=1;}
          });
          group.hidden=groupVisible===0;
        });
        const empty=supportCategory.querySelector("[data-support-category-empty]");
        if(empty) empty.hidden=visible!==0;
      };
      const handleCategoryDocumentClick=event=>{
        if(!supportCategory.contains(event.target)) setCategoryOpen(false);
      };
      trigger.addEventListener("click",()=>setCategoryOpen(panel.hidden));
      search.addEventListener("input",filterCategories);
      supportCategory.addEventListener("keydown",event=>{
        if(event.key==="Escape"&&!panel.hidden){
          event.preventDefault();
          setCategoryOpen(false);
          trigger.focus();
        }
      });
      checkboxes.forEach(checkbox=>checkbox.addEventListener("change",()=>{
        updateCategorySummary();
        if(checkbox===otherCheckbox&&checkbox.checked){
          setCategoryOpen(false);
          window.requestAnimationFrame(()=>otherInput?.focus());
          return;
        }
        if(checkbox.checked) window.requestAnimationFrame(()=>checkbox.closest("[data-support-category-option]")?.querySelector("[data-support-category-detail-input]")?.focus());
      }));
      document.addEventListener("click",handleCategoryDocumentClick);
      state.cleanups.push(()=>document.removeEventListener("click",handleCategoryDocumentClick));
      updateCategorySummary();
      filterCategories();
    }
    const supportFile=document.querySelector("[data-support-file]");
    supportFile?.addEventListener("change",()=>{
      const file=supportFile.files?.[0];
      const name=document.querySelector("[data-support-file-name]");
      const status=document.querySelector("[data-support-file-status]");
      if(file&&file.size>6*1024*1024){
        supportFile.value="";
        if(name) name.textContent="No file selected";
        if(status){status.textContent="This file is larger than 6 MB. Please choose a smaller file.";status.classList.add("is-error");}
        return;
      }
      if(name) name.textContent=file?.name||"No file selected";
      if(status){status.textContent="Maximum allowed file size is 6 MB";status.classList.remove("is-error");}
    });
    document.querySelector("[data-support-form]")?.addEventListener("submit",(event)=>{event.preventDefault();navigate(routes.thanks);});
    const supportLocationGrid=document.querySelector("[data-support-location-grid]");
    const supportLocationPrev=document.querySelector("[data-support-location-prev]");
    const supportLocationNext=document.querySelector("[data-support-location-next]");
    if(supportLocationGrid&&supportLocationPrev&&supportLocationNext){
      const supportLocationCards=[...supportLocationGrid.querySelectorAll("[data-support-location-card]")];
      const supportLocationSection=supportLocationGrid.closest(".support-locations");
      const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let supportLocationAutoTimer=0;
      let supportLocationHoverPaused=false;
      let supportLocationFocusPaused=false;
      const sliderMetrics=()=>{
        const card=supportLocationCards[0];
        const gap=parseFloat(getComputedStyle(supportLocationGrid).columnGap)||0;
        const step=(card?.getBoundingClientRect().width||supportLocationGrid.clientWidth)+gap;
        const visible=Math.max(1,Math.round((supportLocationGrid.clientWidth+gap)/step));
        const maxScroll=Math.max(0,supportLocationGrid.scrollWidth-supportLocationGrid.clientWidth);
        return {step,visible,maxScroll};
      };
      const updateSupportLocationControls=()=>{
        const {maxScroll}=sliderMetrics();
        supportLocationPrev.disabled=supportLocationGrid.scrollLeft<=2;
        supportLocationNext.disabled=supportLocationGrid.scrollLeft>=maxScroll-2;
      };
      const moveSupportLocations=direction=>{
        const {step,maxScroll}=sliderMetrics();
        const atStart=supportLocationGrid.scrollLeft<=2;
        const atEnd=supportLocationGrid.scrollLeft>=maxScroll-2;
        if(direction>0&&atEnd){
          supportLocationGrid.scrollTo({left:0,behavior:"smooth"});
          return;
        }
        if(direction<0&&atStart){
          supportLocationGrid.scrollTo({left:maxScroll,behavior:"smooth"});
          return;
        }
        supportLocationGrid.scrollBy({left:step*direction,behavior:"smooth"});
      };
      const stopSupportLocationAuto=()=>{
        window.clearInterval(supportLocationAutoTimer);
        supportLocationAutoTimer=0;
      };
      const startSupportLocationAuto=()=>{
        stopSupportLocationAuto();
        if(reducedMotion||supportLocationHoverPaused||supportLocationFocusPaused||document.hidden||supportLocationCards.length<2) return;
        supportLocationAutoTimer=window.setInterval(()=>moveSupportLocations(1),4500);
      };
      const resetSupportLocationAuto=()=>{
        stopSupportLocationAuto();
        startSupportLocationAuto();
      };
      const onSupportLocationScroll=()=>window.requestAnimationFrame(updateSupportLocationControls);
      const onSupportLocationResize=()=>{updateSupportLocationControls();resetSupportLocationAuto();};
      const onSupportLocationPointerEnter=()=>{supportLocationHoverPaused=true;stopSupportLocationAuto();};
      const onSupportLocationPointerLeave=()=>{supportLocationHoverPaused=false;startSupportLocationAuto();};
      const onSupportLocationFocusIn=()=>{supportLocationFocusPaused=true;stopSupportLocationAuto();};
      const onSupportLocationFocusOut=event=>{
        if(supportLocationSection?.contains(event.relatedTarget)) return;
        supportLocationFocusPaused=false;
        startSupportLocationAuto();
      };
      const onSupportLocationVisibility=()=>{if(document.hidden) stopSupportLocationAuto();else startSupportLocationAuto();};
      supportLocationPrev.addEventListener("click",()=>{moveSupportLocations(-1);resetSupportLocationAuto();});
      supportLocationNext.addEventListener("click",()=>{moveSupportLocations(1);resetSupportLocationAuto();});
      supportLocationGrid.addEventListener("scroll",onSupportLocationScroll,{passive:true});
      supportLocationSection?.addEventListener("pointerenter",onSupportLocationPointerEnter);
      supportLocationSection?.addEventListener("pointerleave",onSupportLocationPointerLeave);
      supportLocationSection?.addEventListener("focusin",onSupportLocationFocusIn);
      supportLocationSection?.addEventListener("focusout",onSupportLocationFocusOut);
      document.addEventListener("visibilitychange",onSupportLocationVisibility);
      window.addEventListener("resize",onSupportLocationResize,{passive:true});
      state.cleanups.push(()=>{
        stopSupportLocationAuto();
        supportLocationGrid.removeEventListener("scroll",onSupportLocationScroll);
        supportLocationSection?.removeEventListener("pointerenter",onSupportLocationPointerEnter);
        supportLocationSection?.removeEventListener("pointerleave",onSupportLocationPointerLeave);
        supportLocationSection?.removeEventListener("focusin",onSupportLocationFocusIn);
        supportLocationSection?.removeEventListener("focusout",onSupportLocationFocusOut);
        document.removeEventListener("visibilitychange",onSupportLocationVisibility);
        window.removeEventListener("resize",onSupportLocationResize);
      });
      updateSupportLocationControls();
      startSupportLocationAuto();
    }
    const locationSearch=document.querySelector("[data-location-search]");
    const locationFilterButtons=[...document.querySelectorAll("[data-location-filter]")];
    const locationGroups=[...document.querySelectorAll("[data-location-group]")];
    const locationCards=[...document.querySelectorAll("[data-location-groups] .location-card")];
    let activeLocationFilter=locationCategoryFromQuery();
    const applyLocationFilters=()=>{
      const query=locationSearch?.value.trim().toLowerCase()||"";
      let visibleCount=0;
      locationCards.forEach(card=>{
        const typeMatches=activeLocationFilter==="all"||card.dataset.locationType===activeLocationFilter;
        const searchMatches=!query||card.textContent.toLowerCase().includes(query);
        const visible=typeMatches&&searchMatches;
        card.hidden=!visible;
        if(visible) visibleCount+=1;
      });
      locationGroups.forEach(group=>{
        const hasVisibleCards=[...group.querySelectorAll(".location-card")].some(card=>!card.hidden);
        group.hidden=!hasVisibleCards;
      });
      const empty=document.querySelector("[data-location-empty]");
      if(empty) empty.hidden=visibleCount!==0;
    };
    const updateLocationCategoryQuery=()=>{
      const params=new URLSearchParams(location.search);
      if(activeLocationFilter==="all") params.delete("category");
      else params.set("category",activeLocationFilter);
      const query=params.toString();
      const nextUrl=`${location.pathname}${query?`?${query}`:""}${location.hash}`;
      const currentUrl=`${location.pathname}${location.search}${location.hash}`;
      if(nextUrl!==currentUrl) history.pushState({}, "", nextUrl);
    };
    locationSearch?.addEventListener("input",applyLocationFilters);
    locationFilterButtons.forEach(btn=>btn.addEventListener("click",()=>{
      activeLocationFilter=btn.dataset.locationFilter;
      locationFilterButtons.forEach(button=>{
        const active=button===btn;
        button.classList.toggle("is-active",active);
        button.setAttribute("aria-pressed",String(active));
      });
      updateLocationCategoryQuery();
      applyLocationFilters();
    }));
    applyLocationFilters();
    document.querySelectorAll("[data-page]").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll("[data-page]").forEach(b=>{b.style.background="#fff";b.style.color="#111"});btn.style.background="#111";btn.style.color="#fff";}));
    const newsType=document.querySelector("[data-news-type]");
    const newsYear=document.querySelector("[data-news-year]");
    const newsSearch=document.querySelector("[data-news-search]");
    const newsSearchButton=document.querySelector("[data-news-search-button]");
    const newsItems=[...document.querySelectorAll("[data-news-search-item]")];
    const applyNewsFilters=()=>{
      const query=newsSearch?.value.trim().toLowerCase()||"";
      const year=newsYear?.value||"";
      let visible=0;
      newsItems.forEach(item=>{const show=(!query||item.textContent.toLowerCase().includes(query))&&(!year||item.dataset.newsYear===year);item.hidden=!show;if(show)visible+=1;});
      const empty=document.querySelector("[data-news-empty]");
      if(empty) empty.hidden=visible!==0;
    };
    newsType?.addEventListener("change",()=>{
      const filterTop=newsType.closest(".news-filters")?.getBoundingClientRect().top??0;
      navigate(routes.news+(newsType.value&&newsType.value!=="all"?`?category=${newsType.value}`:""),false);
      const nextFilter=document.querySelector(".news-filters");
      if(nextFilter) window.scrollBy({top:nextFilter.getBoundingClientRect().top-filterTop,behavior:"instant"});
    });
    newsYear?.addEventListener("change",applyNewsFilters);
    newsSearch?.addEventListener("input",applyNewsFilters);
    newsSearchButton?.addEventListener("click",()=>newsSearch?.focus());
    const eventYear=document.querySelector("[data-event-year-filter]");
    const eventSearch=document.querySelector("[data-event-search]");
    const eventSearchButton=document.querySelector("[data-event-search-button]");
    const eventItems=[...document.querySelectorAll("[data-event-search-item]")];
    const applyEventFilters=()=>{
      const query=eventSearch?.value.trim().toLowerCase()||"";
      const year=eventYear?.value||"";
      let visible=0;
      eventItems.forEach(item=>{const show=(!query||item.textContent.toLowerCase().includes(query))&&(!year||item.dataset.eventYear===year);item.hidden=!show;if(show)visible+=1;});
      const empty=document.querySelector("[data-event-empty]");
      if(empty) empty.hidden=visible!==0;
    };
    eventYear?.addEventListener("change",applyEventFilters);
    eventSearch?.addEventListener("input",applyEventFilters);
    eventSearchButton?.addEventListener("click",()=>eventSearch?.focus());
    setupA4kPage();
    setupCommunicationSystemTabs();
    setupCarousels();
  }

  function navigate(href,scrollTop=true) {
    const url = new URL(href,location.origin);
    history.pushState({}, "", url.pathname + url.search + url.hash);
    render(scrollTop);
  }

  function render(scrollTop = true) {
    stopTimers();
    syncInquiryStateFromQuery();
    app.innerHTML = header() + pageForPath() + footer() + `<div class="wireframe-note">Black & white wireframe · Poppins headings · Inter body</div>`;
    setupInteractions();
    if (location.pathname === routes.tools) window.SpecSearchApp?.initialize();
    if (location.pathname === routes.inquiry) void loadInquiryProducts();
    document.title = "Superworld Electronics — Wireframe";
    const hashTarget=location.hash?document.getElementById(decodeURIComponent(location.hash.slice(1))):null;
    if(hashTarget) hashTarget.scrollIntoView({block:"start",behavior:"instant"});
    else if (scrollTop) window.scrollTo({top:0,behavior:"instant"});
  }

  document.addEventListener("click",(e)=>{
    const a=e.target.closest("a[data-link]");
    if(!a || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const href=a.getAttribute("href");
    if(!href || href.startsWith("#")) return;
    e.preventDefault();
    navigate(href);
  });
  window.addEventListener("popstate",()=>render());
  render();
})();

(() => {
  const productSets = {
    general: [
      ["EMC Components", "Solutions supporting noise suppression, compliance, and product stability in electronic systems.", "/products/general/emc"],
      ["Magnetic Components", "Core magnetic products supporting a wide range of electronic, industrial, and power-related applications.", "/products/general"],
      ["Transformers", "Transformer solutions developed for consistent performance, manufacturing control, and application fit.", "/products/general"],
      ["Wireless Power Transfer", "Wireless charging-related solutions supporting evolving demand in modern electronics and mobility.", "/products/general"],
      ["General Components", "Reliable component solutions for electronic, industrial, and power applications.", "/products/general"]
    ],
    automotive: [
      ["Automotive EMC Components", "AEC-Q200-ready components supporting noise suppression and stable vehicle electronics.", "/products"],
      ["Automotive Power Inductors", "High-current magnetic components developed for demanding automotive power systems.", "/products"],
      ["Automotive Ferrite Beads", "Compact EMI suppression solutions for connected and electrified vehicles.", "/products"],
      ["Automotive Transformers", "Controlled transformer solutions for reliable automotive power conversion.", "/products"],
      ["Automotive Wireless Power", "Magnetic component support for in-vehicle wireless charging applications.", "/products"]
    ]
  };

  const cardMarkup = ([title, copy, href]) =>
    '<article class="media-card slide"><div class="ph soft"></div><div class="media-card-body"><h3>' + title + '</h3><p>' + copy + '</p><div class="media-card-footer"><a href="' + href + '" class="link-arrow" data-link>View More</a></div></div></article>';

  function selectProductSet(type, carouselId) {
    const root = document.querySelector('[data-carousel="' + carouselId + '"]');
    const items = productSets[type];
    if (!root || !items) return;
    const track = root.querySelector('.carousel-track');
    if (track) {
      track.innerHTML = items.map(cardMarkup).join('');
      track.style.transform = 'translateX(0px)';
    }
    root.closest('section')?.querySelectorAll('[data-product-tab]').forEach((button) => {
      const active = button.dataset.productTab === type;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  let companyProductCleanup = null;

  function prepareCompanyProductLines() {
    const section = location.pathname === '/company'
      ? [...document.querySelectorAll('section')].find((item) => item.querySelector('h2')?.textContent.trim() === 'PRODUCT LINES')
      : null;
    if (!section) {
      if (companyProductCleanup) companyProductCleanup();
      companyProductCleanup = null;
      return;
    }
    if (section.dataset.companyProductsEnhanced === 'true') return;
    if (companyProductCleanup) companyProductCleanup();
    section.dataset.companyProductsEnhanced = 'true';

    const originalGrid = section.querySelector('.grid.grid-4');
    const tabs = [...section.querySelectorAll('.button-group button')];
    if (!originalGrid || tabs.length < 2) return;

    const carousel = document.createElement('div');
    carousel.className = 'carousel company-product-carousel';
    carousel.dataset.carousel = 'company-products';
    carousel.style.setProperty('--visible', '4');
    carousel.innerHTML = '<div class="carousel-window"><div class="carousel-track"></div></div><div class="carousel-controls"><button type="button" data-company-prev aria-label="Previous product">Prev</button><button type="button" data-company-next aria-label="Next product">Next</button></div>';
    originalGrid.replaceWith(carousel);

    const track = carousel.querySelector('.carousel-track');
    let type = 'general';
    let index = 0;
    let timer;
    const visible = () => window.innerWidth <= 560 ? 1 : window.innerWidth <= 820 ? 2 : 4;
    const maxIndex = () => Math.max(0, productSets[type].length - visible());
    const update = () => {
      index = Math.max(0, Math.min(index, maxIndex()));
      carousel.style.setProperty('--visible', String(visible()));
      const gap = 22;
      const width = carousel.querySelector('.carousel-window').clientWidth;
      const cardWidth = (width - gap * (visible() - 1)) / visible();
      track.style.transform = 'translateX(-' + index * (cardWidth + gap) + 'px)';
    };
    const restart = () => {
      window.clearInterval(timer);
      timer = window.setInterval(() => {
        index = index >= maxIndex() ? 0 : index + 1;
        update();
      }, 4500);
    };
    const render = (nextType) => {
      type = nextType;
      index = 0;
      track.innerHTML = productSets[type].map(cardMarkup).join('');
      tabs.forEach((tab) => {
        const active = tab.dataset.companyProductTab === type;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-pressed', String(active));
      });
      update();
      restart();
    };
    const move = (delta) => {
      index += delta;
      if (index > maxIndex()) index = 0;
      if (index < 0) index = maxIndex();
      update();
      restart();
    };

    tabs.forEach((tab, tabIndex) => {
      tab.classList.add('button', 'small');
      tab.dataset.companyProductTab = tabIndex === 0 ? 'general' : 'automotive';
      tab.addEventListener('click', () => render(tab.dataset.companyProductTab));
    });
    carousel.querySelector('[data-company-prev]').addEventListener('click', () => move(-1));
    carousel.querySelector('[data-company-next]').addEventListener('click', () => move(1));
    window.addEventListener('resize', update, {passive:true});
    companyProductCleanup = () => {
      window.clearInterval(timer);
      window.removeEventListener('resize', update);
    };
    render('general');
  }

  const milestoneData = [
    ["2011 – 2014", "Recognition", "Expanded customer and enterprise recognition."],
    ["2007 – 2010", "Growth", "Strengthened manufacturing and global customer support."],
    ["2000 – 2006", "Foundation", "Established Singapore Headquarters Office\nResearch and Development Center and Ferrite Bead Plant in Taiwan\nTransformer and Inductor factory in South China"],
    ["1993 – 1999", "Expansion", "Built regional operations and customer reach."],
    ["1975", "Origins", "The beginning of the company journey."]
  ];
  let milestoneCleanup = null;

  function prepareMilestoneSlider() {
    const timeline = document.querySelector('#milestones .timeline');
    if (!timeline) {
      if (milestoneCleanup) milestoneCleanup();
      return;
    }
    if (timeline.dataset.milestoneEnhanced === 'true') return;
    if (milestoneCleanup) milestoneCleanup();

    timeline.closest('section')?.classList.add('milestone-section');
    timeline.dataset.milestoneEnhanced = 'true';
    const row = timeline.querySelector('.timeline-row');
    if (!row) return;
    const repeated = milestoneData.concat(milestoneData, milestoneData);
    row.innerHTML = repeated.map((item, index) =>
      '<article class="timeline-item" data-milestone-index="' + index + '"><h3>' + item[0] + '</h3><div class="timeline-circle" role="img" aria-label="Milestone image placeholder"><span class="milestone-image-label">Image Placeholder</span><strong class="milestone-image-size milestone-size-default">170 × 170 px</strong><strong class="milestone-image-size milestone-size-active">230 × 230 px</strong></div></article>'
    ).join('');

    const activeDetail = document.createElement('div');
    activeDetail.className = 'milestone-detail milestone-active-detail is-active';
    activeDetail.setAttribute('aria-live', 'polite');
    activeDetail.innerHTML = '<h3></h3><p></p>';
    timeline.append(activeDetail);
    const detailTitle = activeDetail.querySelector('h3');
    const detailCopy = activeDetail.querySelector('p');

    const controls = document.createElement('div');
    controls.className = 'milestone-controls';
    controls.innerHTML = '<button type="button" data-milestone-prev aria-label="Previous milestone">Prev</button><button type="button" data-milestone-next aria-label="Next milestone">Next</button>';
    timeline.insertAdjacentElement('afterend', controls);

    let current = 7;
    let locked = false;
    let resetTimer = 0;
    const items = [...row.querySelectorAll('.timeline-item')];

    const position = (animate = true) => {
      const visible = Number(getComputedStyle(timeline).getPropertyValue('--milestone-visible')) || 5;
      const step = timeline.clientWidth / visible;
      const centerSlot = Math.floor(visible / 2);
      row.style.transition = animate ? '' : 'none';
      row.style.transform = 'translate3d(' + ((centerSlot - current) * step) + 'px,0,0)';
      items.forEach((item, index) => {
        const active = index === current;
        item.classList.toggle('active', active);
        if (active) item.setAttribute('aria-current', 'true');
        else item.removeAttribute('aria-current');
      });
      const detail = milestoneData[((current % milestoneData.length) + milestoneData.length) % milestoneData.length];
      detailTitle.textContent = detail[1];
      detailCopy.textContent = detail[2];
      if (!animate) requestAnimationFrame(() => { row.style.transition = ''; });
    };

    const move = (delta) => {
      if (locked) return;
      locked = true;
      current += delta;
      position(true);
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        if (current >= 10) current -= 5;
        if (current <= 4) current += 5;
        position(false);
        locked = false;
      }, 700);
    };

    const previous = controls.querySelector('[data-milestone-prev]');
    const next = controls.querySelector('[data-milestone-next]');
    previous.addEventListener('click', () => move(-1));
    next.addEventListener('click', () => move(1));
    const autoTimer = setInterval(() => move(1), 4500);
    const handleResize = () => position(false);
    window.addEventListener('resize', handleResize, {passive:true});
    position(false);

    milestoneCleanup = () => {
      clearInterval(autoTimer);
      clearTimeout(resetTimer);
      window.removeEventListener('resize', handleResize);
      milestoneCleanup = null;
    };
  }

  const qualityValidationData = [
    {
      key: "reliability",
      number: "01",
      title: "Reliability System",
      slides: [
        ["Comprehensive Reliability Verification System", "Ensuring reliable, long-term performance of magnetic components in real-world operation.", "System Sections", ["Application Environment Simulation", "Electrical & Functional Analysis", "Composition Analysis", "Failure Analysis", "Environmental Endurance", "Mechanical Analysis"]],
        ["Application Environment Simulation", "Simulates application-related stress and damage conditions before product use.", "Actual Items", ["Impulse / Surge simulation Board Flex", "Surge Current Damage Simulation", "Heat Conduction Simulation", "Stress Analysis / Simulation"]],
        ["Electrical & Functional Analysis", "Checks electrical behavior and functional performance of the component.", "Actual Items", ["Inner Circuit Isolation Simulation", "S-Parameter Analysis", "Power Loss"]],
        ["Composition Analysis", "Supports material and composition verification.", "Actual Item", ["XRF"]],
        ["Failure Analysis", "Supports defect investigation and internal structure review.", "Actual Items", ["3D / 2D X-ray (CT)", "Thickness Analyzer", "Grinder", "High Power Stereo Microscope"]],
        ["Environmental Endurance", "Tests endurance under temperature, humidity, thermal shock, moisture, and salt atmosphere conditions.", "Actual Items", ["High Temperature Storage", "Low Temperature Storage", "High Temperature & Humidity Storage", "Thermal Shock (180°C↔-60°C)", "Temperature Cycling", "Moisture Resistance", "Salt Atmosphere"]],
        ["Mechanical Analysis", "Validates mechanical strength and durability under physical stress.", "Actual Items", ["Vibration", "Terminal Strength", "Destructive Endurance", "Shock Test"]]
      ]
    },
    {
      key: "magnetic",
      number: "02",
      title: "Magnetic Analysis",
      slides: [
        ["Advanced Magnetic Testing Capability", "Supports material properties verification, inductor specification testing, and system-level efficiency validation.", "Actual Sections", ["Material Properties Verification", "Inductor Spec Testing", "Efficiency Verification Tester"]],
        ["Material Properties Verification", "Verifies magnetic material characteristics and frequency response behavior.", "Actual Items", ["Magnetic material properties", "Frequency response analysis", "IWATSU SY-8218", "Agilent 4991A"]],
        ["High Current Testing", "Checks inductor performance under high-current conditions using DC bias testing.", "Actual Items", ["DC bias testing up to 200A", "Saturation behavior measurement", "200A DC Bias"]],
        ["System-Level Validation", "Supports efficiency verification and thermal testing at system or application level.", "Actual Items", ["EVB compatibility", "Efficiency and thermal testing", "Efficiency Verification System", "Compatible with Customer-Provided EVB"]]
      ]
    },
    {
      key: "emc",
      number: "03",
      title: "EMI / EMC Center",
      slides: [
        ["In-House EMI / EMC Validation", "In-house EMI / EMC validation for high-reliability electronics.", "Actual Sections", ["1 Anechoic Chamber", "4 EMI Shielding Room", "EMI / EMC Test Capability", "Standards Supported"]],
        ["Anechoic Chamber & EMI Shielding Room", "Facility support for EMI / EMC validation and testing work.", "Actual Facilities", ["1 Anechoic Chamber", "4 EMI Shielding Room"]],
        ["EMI / EMC Test Capability", "Supports key EMI / EMC test requirements for electronic components and applications.", "Actual Test Items", ["Conducted emission testing", "Radiated emission testing", "Immunity testing", "ESD testing", "Transient simulation testing"]],
        ["Standards Supported", "Supports EMI / EMC validation based on recognized international and automotive standards.", "Actual Standard Scope", ["ISO standards", "IEC standards", "Automotive EMC standards"]]
      ]
    }
  ];
  let qualityValidationCleanup = null;

  const qualityPanelMarkup = (tab) => {
    const slides = tab.slides.map((slide) =>
      '<div class="quality-image-slide"><div class="quality-image-ph" role="img" aria-label="Image placeholder for ' + slide[0] + '"><span>Image Placeholder</span><strong>' + slide[0] + '</strong><small>740 × 640 px</small></div></div>'
    ).join('');
    const contents = tab.slides.map((slide, index) => {
      const items = slide[3].map((item, itemIndex) => {
        const overviewRoute = tab.key === 'emc' ? [1, 1, 2, 3][itemIndex] : Math.min(itemIndex + 1, tab.slides.length - 1);
        const routeIndex = index === 0 ? overviewRoute : index;
        return '<li role="button" tabindex="0" data-quality-go="' + routeIndex + '">' + item + '</li>';
      }).join('');
      return '<div class="quality-slide-content' + (index === 0 ? ' active' : '') + '" data-quality-content="' + index + '"><div class="quality-small-label">' + tab.title + ' / ' + String(index + 1).padStart(2, '0') + '</div><h3>' + slide[0] + '</h3><p>' + slide[1] + '</p><div class="quality-content-group"><h4>' + slide[2] + '</h4><ul>' + items + '</ul></div></div>';
    }).join('');
    const dots = tab.slides.map((slide, index) =>
      '<button class="quality-slider-dot' + (index === 0 ? ' active' : '') + '" type="button" data-quality-slide="' + index + '" aria-label="Show ' + slide[0] + '">' + (index === 0 ? 'Overview' : String(index + 1).padStart(2, '0')) + '</button>'
    ).join('');
    return '<div class="quality-tab-panel' + (tab.number === '01' ? ' active' : '') + '" id="quality-panel-' + tab.key + '" role="tabpanel" aria-labelledby="quality-tab-' + tab.key + '" data-quality-panel="' + tab.key + '"><div class="quality-panel-layout"><div class="quality-image-slider"><div class="quality-image-slides">' + slides + '</div></div><aside class="quality-content-side"><div class="quality-content-wrap">' + contents + '</div><div class="quality-slider-controls"><div class="quality-slider-dots">' + dots + '</div><div class="quality-arrows"><button class="quality-arrow" type="button" data-quality-prev aria-label="Previous slide">←</button><button class="quality-pause-toggle" type="button" data-quality-pause aria-label="Pause autoplay">Pause</button><button class="quality-arrow" type="button" data-quality-next aria-label="Next slide">→</button></div></div></aside></div></div>';
  };

  function prepareQualityValidation() {
    const heading = [...document.querySelectorAll('h2')].find((item) => item.textContent.trim() === 'IN-HOUSE VALIDATION CAPABILITIES');
    const section = heading?.closest('section');
    if (!section) {
      if (qualityValidationCleanup) qualityValidationCleanup();
      return;
    }
    if (section.dataset.qualityEnhanced === 'true') return;
    if (qualityValidationCleanup) qualityValidationCleanup();

    const container = heading.closest('.container');
    if (!container) return;
    section.dataset.qualityEnhanced = 'true';
    container.innerHTML = '<div class="quality-section-header"><h2>IN-HOUSE VALIDATION CAPABILITIES</h2><p>Verifies component quality through reliability testing, magnetic analysis, and EMI / EMC validation.</p></div><div class="quality-main-tabs" role="tablist" aria-label="Validation capability tabs">' + qualityValidationData.map((tab, index) => '<button class="quality-main-tab' + (index === 0 ? ' active' : '') + '" id="quality-tab-' + tab.key + '" type="button" role="tab" aria-selected="' + (index === 0 ? 'true' : 'false') + '" aria-controls="quality-panel-' + tab.key + '" data-quality-tab="' + tab.key + '"><span>' + tab.number + '</span><strong>' + tab.title + '</strong></button>').join('') + '</div>' + qualityValidationData.map(qualityPanelMarkup).join('');

    const state = Object.fromEntries(qualityValidationData.map((tab) => [tab.key, 0]));
    let activeKey = qualityValidationData[0].key;
    let paused = false;
    let interactionPaused = false;
    let timer = 0;
    let scrollTimer = 0;

    const updatePauseButtons = () => {
      section.querySelectorAll('[data-quality-pause]').forEach((button) => {
        button.textContent = paused ? 'Play' : 'Pause';
        button.setAttribute('aria-label', paused ? 'Resume autoplay' : 'Pause autoplay');
      });
    };

    const updatePanel = (key) => {
      const panel = section.querySelector('[data-quality-panel="' + key + '"]');
      const tab = qualityValidationData.find((item) => item.key === key);
      if (!panel || !tab) return;
      const safeIndex = ((state[key] % tab.slides.length) + tab.slides.length) % tab.slides.length;
      state[key] = safeIndex;
      const track = panel.querySelector('.quality-image-slides');
      if (track) track.style.transform = 'translateX(-' + (safeIndex * 100) + '%)';
      panel.querySelectorAll('[data-quality-slide]').forEach((dot) => {
        const active = Number(dot.dataset.qualitySlide) === safeIndex;
        dot.classList.toggle('active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
      });
      panel.querySelectorAll('[data-quality-content]').forEach((content) => content.classList.toggle('active', Number(content.dataset.qualityContent) === safeIndex));
      panel.querySelectorAll('[data-quality-go]').forEach((item) => item.classList.toggle('active-route', Number(item.dataset.qualityGo) === safeIndex));
      clearTimeout(scrollTimer);
      const list = panel.querySelector('.quality-slide-content.active ul');
      if (list) {
        list.scrollTop = 0;
        scrollTimer = setTimeout(() => {
          const maxScroll = list.scrollHeight - list.clientHeight;
          if (maxScroll > 4) list.scrollTo({top:maxScroll, behavior:'smooth'});
        }, 1000);
      }
    };

    const setActiveTab = (key, reset = false) => {
      activeKey = key;
      if (reset) state[key] = 0;
      section.querySelectorAll('[data-quality-tab]').forEach((button) => {
        const active = button.dataset.qualityTab === key;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', String(active));
        button.tabIndex = active ? 0 : -1;
      });
      section.querySelectorAll('[data-quality-panel]').forEach((panel) => panel.classList.toggle('active', panel.dataset.qualityPanel === key));
      updatePanel(key);
    };

    const shouldPlay = () => !paused && !interactionPaused && !document.hidden;
    const restartAuto = () => {
      clearInterval(timer);
      timer = 0;
      if (shouldPlay()) timer = setInterval(() => {
        const tabIndex = qualityValidationData.findIndex((tab) => tab.key === activeKey);
        const tab = qualityValidationData[tabIndex];
        if (state[activeKey] < tab.slides.length - 1) {
          state[activeKey] += 1;
          updatePanel(activeKey);
        } else {
          const nextTab = qualityValidationData[(tabIndex + 1) % qualityValidationData.length];
          setActiveTab(nextTab.key, true);
        }
      }, 4500);
      updatePauseButtons();
    };

    const handleClick = (event) => {
      const tabButton = event.target.closest('[data-quality-tab]');
      if (tabButton) setActiveTab(tabButton.dataset.qualityTab, true);
      const dot = event.target.closest('[data-quality-slide]');
      if (dot) {
        state[activeKey] = Number(dot.dataset.qualitySlide);
        updatePanel(activeKey);
      }
      if (event.target.closest('[data-quality-prev]')) {
        state[activeKey] -= 1;
        updatePanel(activeKey);
      }
      if (event.target.closest('[data-quality-next]')) {
        state[activeKey] += 1;
        updatePanel(activeKey);
      }
      if (event.target.closest('[data-quality-pause]')) paused = !paused;
      const route = event.target.closest('[data-quality-go]');
      if (route) {
        state[activeKey] = Number(route.dataset.qualityGo);
        updatePanel(activeKey);
      }
      restartAuto();
    };
    const handleKeydown = (event) => {
      if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[data-quality-go]')) {
        event.preventDefault();
        event.target.click();
      }
    };
    const handleEnter = () => { interactionPaused = true; clearInterval(timer); };
    const handleLeave = () => { interactionPaused = false; restartAuto(); };
    const handleFocusIn = () => { interactionPaused = true; clearInterval(timer); };
    const handleFocusOut = (event) => { if (!section.contains(event.relatedTarget)) { interactionPaused = false; restartAuto(); } };
    const handleVisibility = () => restartAuto();

    section.addEventListener('click', handleClick);
    section.addEventListener('keydown', handleKeydown);
    section.addEventListener('mouseenter', handleEnter);
    section.addEventListener('mouseleave', handleLeave);
    section.addEventListener('focusin', handleFocusIn);
    section.addEventListener('focusout', handleFocusOut);
    document.addEventListener('visibilitychange', handleVisibility);
    setActiveTab(activeKey, true);
    restartAuto();

    qualityValidationCleanup = () => {
      clearInterval(timer);
      clearTimeout(scrollTimer);
      document.removeEventListener('visibilitychange', handleVisibility);
      qualityValidationCleanup = null;
    };
  }

  function prepareReleaseCards() {
    const root = document.querySelector('[data-carousel="home-releases"]');
    if (!root || root.dataset.releaseCardsEnhanced === 'true') return;
    const track = root.querySelector('.carousel-track');
    if (!track) return;
    root.dataset.releaseCardsEnhanced = 'true';
    track.innerHTML = Array.from({length:6}, () =>
      '<a class="release-product-card slide" href="/products/general/emc/a4k" data-link aria-label="View A4K Series Chip Array Ferrite Bead"><div class="ph" aria-hidden="true"></div><div class="release-product-copy"><div><h3>A4K Series</h3><p>Chip Array Ferrite Bead</p></div><span class="release-product-arrow" aria-hidden="true"></span></div></a>'
    ).join('');
    track.style.transform = 'translateX(0px)';
  }

  const industrySelectorData = [
    ["Automotive", "ADAS, TCU, lighting, wireless charging."],
    ["Communication", "Server, router, interface, LAN, RF."],
    ["Consumer", "Compact connected electronics."],
    ["Healthcare", "Portable and monitoring devices."],
    ["Industrial & Energy", "Automation and power systems."],
    ["Smart Home", "IoT, sensors, and control devices."]
  ];
  let industrySelectorCleanup = null;

  function prepareIndustrySelector() {
    const layout = document.querySelector('.industries-layout');
    if (!layout) {
      if (industrySelectorCleanup) industrySelectorCleanup();
      return;
    }
    if (layout.dataset.industryEnhanced === 'true') return;
    if (industrySelectorCleanup) industrySelectorCleanup();
    layout.dataset.industryEnhanced = 'true';
    layout.innerHTML = '<div class="industry-slider" aria-live="polite"><div class="industry-slides">' + industrySelectorData.map((item) => '<div class="industry-slide"><div class="ph industry-image-ph" role="img" aria-label="Image placeholder for ' + item[0] + '"><span>Image Placeholder</span><strong>' + item[0] + '</strong><small>560 × 292 px</small></div></div>').join('') + '</div></div><div class="industry-list">' + industrySelectorData.map((item, index) => '<button class="industry-row' + (index === 0 ? ' is-active' : '') + '" type="button" data-industry-index="' + index + '" aria-pressed="' + (index === 0 ? 'true' : 'false') + '"><h3>' + item[0] + '</h3><p>' + item[1] + '</p><span class="industry-row-arrow" aria-hidden="true"></span></button>').join('') + '</div>';

    let current = 0;
    let timer = 0;
    const render = () => {
      const track = layout.querySelector('.industry-slides');
      if (track) track.style.transform = 'translateX(-' + (current * 100) + '%)';
      layout.querySelectorAll('[data-industry-index]').forEach((button) => {
        const active = Number(button.dataset.industryIndex) === current;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
    };
    const restart = () => {
      clearInterval(timer);
      timer = setInterval(() => {
        current = (current + 1) % industrySelectorData.length;
        render();
      }, 4500);
    };
    const handleClick = (event) => {
      const button = event.target.closest('[data-industry-index]');
      if (!button) return;
      current = Number(button.dataset.industryIndex);
      render();
      restart();
    };
    layout.addEventListener('click', handleClick);
    render();
    restart();
    industrySelectorCleanup = () => {
      clearInterval(timer);
      industrySelectorCleanup = null;
    };
  }

  function prepareCertificationCards() {
    const root = document.querySelector('[data-carousel="home-certs"]');
    if (!root || root.dataset.certificationCardsEnhanced === 'true') return;
    const track = root.querySelector('.carousel-track');
    if (!track) return;
    root.dataset.certificationCardsEnhanced = 'true';
    track.innerHTML = Array.from({length:6}, () => '<article class="certification-card slide"><div class="certification-visual"><div class="ph" role="img" aria-label="Certification image placeholder"><span class="certification-tag">Certification</span></div></div><div class="certification-content"><h3>IATF 16949</h3><p>Quality management certification.</p><div class="certification-footer"><a class="certification-download" href="/company/quality" data-link>Download</a><span>17 December 2025</span></div></div></article>').join('');
    track.style.transform = 'translateX(0px)';
    const viewMore = root.closest('section')?.querySelector('.section-heading .link-arrow');
    if (viewMore) {
      viewMore.classList.remove('link-arrow');
      viewMore.classList.add('certification-view-more');
    }
  }

  function prepareCertificationVault() {
    const section = document.querySelector('#superworld_electronics_company_quality_certification_vault') || [...document.querySelectorAll('section')].find((item) => item.querySelector('h2')?.textContent.trim() === 'CERTIFICATION VAULT');
    if (!section || section.dataset.certificationVaultEnhanced === 'true') return;
    const input = section.querySelector('[data-certificate-search]');
    const cards = [...section.querySelectorAll('[data-certificate-card]')];
    const buttons = [...section.querySelectorAll('[data-certificate-page]')];
    const empty = section.querySelector('[data-certificate-empty]');
    if (!input || !cards.length || !buttons.length) return;
    section.dataset.certificationVaultEnhanced = 'true';
    const pageSize = 8;
    let page = 1;

    const render = () => {
      const query = input.value.trim().toLowerCase();
      const matching = cards.filter((card) => card.textContent.toLowerCase().includes(query));
      const pageCount = Math.max(1, Math.ceil(matching.length / pageSize));
      page = Math.min(page, pageCount);
      cards.forEach((card) => { card.hidden = true; });
      matching.slice((page - 1) * pageSize, page * pageSize).forEach((card) => { card.hidden = false; });
      buttons.forEach((button, index) => {
        const buttonPage = index + 1;
        const available = buttonPage <= pageCount && matching.length > 0;
        button.hidden = !available;
        button.classList.toggle('is-active', buttonPage === page && available);
        if (buttonPage === page && available) button.setAttribute('aria-current', 'page');
        else button.removeAttribute('aria-current');
      });
      if (empty) empty.hidden = matching.length > 0;
    };

    input.addEventListener('input', () => { page = 1; render(); });
    section.querySelector('.quality-certificate-search')?.addEventListener('submit', (event) => event.preventDefault());
    buttons.forEach((button) => button.addEventListener('click', () => {
      page = Number(button.dataset.certificatePage);
      render();
      section.querySelector('[data-certificate-grid]')?.scrollIntoView({behavior:'smooth',block:'start'});
    }));
    render();
  }

  function prepareNewsCards() {
    const root = document.querySelector('[data-carousel="home-news"]');
    if (!root || root.dataset.newsCardsEnhanced === 'true') return;
    const track = root.querySelector('.carousel-track');
    if (!track) return;
    root.dataset.newsCardsEnhanced = 'true';
    track.innerHTML = Array.from({length:6}, () => '<article class="media-card home-news-card slide"><div class="ph home-news-visual" role="img" aria-label="News image placeholder"><span class="home-news-tag">Business Updates</span></div><div class="home-news-content"><h3>Our Johor Bahru facility is progressing</h3><div class="home-news-footer"><a class="home-news-more" href="/news/radial-leaded-inductor" data-link>View More</a><span>17 December 2025</span></div></div></article>').join('');
    track.style.transform = 'translateX(0px)';
    const viewMore = root.closest('section')?.querySelector('.section-heading .link-arrow');
    if (viewMore) {
      viewMore.classList.remove('link-arrow');
      viewMore.classList.add('home-news-view-more');
    }
  }

  const regionalMapPoints = [
    ["Singapore (HQ)", 76.5, 68],
    ["USA", 20.5, 42],
    ["UK", 45, 32],
    ["France", 47, 39],
    ["Italy", 50.5, 43],
    ["North China", 75, 40],
    ["South China", 74, 51],
    ["Taiwan", 79.5, 50],
    ["Malaysia", 75.5, 64],
    ["Israel", 57, 48]
  ];

  let regionalMapCleanup = null;

  function prepareRegionalMap() {
    const heading = [...document.querySelectorAll('h2')].find((item) => item.textContent.trim() === 'REGIONAL SUPPORT FOR GLOBAL CUSTOMERS');
    const section = heading?.closest('section');
    const placeholder = section?.querySelector('.ph.map');
    const regions = section?.querySelector('.regions');
    if (!section || !regions) {
      if (regionalMapCleanup) regionalMapCleanup();
      regionalMapCleanup = null;
      return;
    }
    if (regions.dataset.regionMapEnhanced === 'true') return;
    if (!placeholder) return;

    const cards = [...regions.querySelectorAll('.region')];
    if (cards.length !== regionalMapPoints.length) return;
    if (regionalMapCleanup) regionalMapCleanup();
    regions.dataset.regionMapEnhanced = 'true';

    const map = document.createElement('div');
    map.className = 'regional-map';
    map.setAttribute('aria-label', 'Interactive regional support world map');
    map.innerHTML = '<div class="regional-map-stage"><img src="/assets/world-map.webp" alt="World map showing Superworld Electronics regional support locations">' + regionalMapPoints.map((point, index) => '<button class="regional-map-pin" type="button" style="--x:' + point[1] + '%;--y:' + point[2] + '%" data-region-pin="' + index + '" aria-label="Highlight ' + point[0] + ' regional support" aria-pressed="false"></button>').join('') + '</div>';
    placeholder.replaceWith(map);

    const stage = map.querySelector('.regional-map-stage');
    const pins = [...map.querySelectorAll('[data-region-pin]')];
    let activeIndex = 0;
    let autoPlayTimer;
    let stageVisible = false;
    const activate = (index) => {
      activeIndex = index;
      pins.forEach((pin, pinIndex) => {
        const active = pinIndex === index;
        pin.classList.toggle('is-active', active);
        pin.setAttribute('aria-pressed', String(active));
      });
      cards.forEach((card, cardIndex) => {
        const active = cardIndex === index;
        card.classList.toggle('is-active', active);
        card.setAttribute('aria-pressed', String(active));
      });
      regions.dataset.activeRegion = String(index);
    };

    const startAutoPlay = () => {
      window.clearInterval(autoPlayTimer);
      if (!stageVisible || window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden) return;
      autoPlayTimer = window.setInterval(() => activate((activeIndex + 1) % pins.length), 3000);
    };

    pins.forEach((pin) => pin.addEventListener('click', () => {
      activate(Number(pin.dataset.regionPin));
      startAutoPlay();
    }));
    cards.forEach((card, index) => {
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'Highlight ' + regionalMapPoints[index][0] + ' on the map');
      card.addEventListener('click', () => {
        activate(index);
        startAutoPlay();
      });
      card.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          activate(index);
          startAutoPlay();
        }
      });
    });
    const visibilityHandler = () => startAutoPlay();
    document.addEventListener('visibilitychange', visibilityHandler);
    const observer = new IntersectionObserver((entries) => {
      stageVisible = entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= .2);
      startAutoPlay();
    }, {threshold:[0,.2]});
    if (stage) observer.observe(stage);
    regionalMapCleanup = () => {
      window.clearInterval(autoPlayTimer);
      observer.disconnect();
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
    activate(0);
  }

  let companyGlobalMapCleanup = null;

  function prepareCompanyGlobalMap() {
    const heading = [...document.querySelectorAll('h2')].find((item) => item.textContent.trim() === 'GLOBAL PRESENCE');
    const section = location.pathname === '/company' ? heading?.closest('section') : null;
    const placeholder = section?.querySelector('.ph.map');
    if (!section || !placeholder) {
      if (companyGlobalMapCleanup) companyGlobalMapCleanup();
      companyGlobalMapCleanup = null;
      return;
    }
    if (section.dataset.companyGlobalMapEnhanced === 'true') return;
    if (companyGlobalMapCleanup) companyGlobalMapCleanup();
    section.dataset.companyGlobalMapEnhanced = 'true';

    const map = document.createElement('div');
    map.className = 'regional-map company-regional-map';
    map.setAttribute('aria-label', 'Interactive global presence world map');
    map.innerHTML = '<div class="regional-map-stage"><img src="/assets/world-map.webp" alt="World map showing Superworld Electronics global presence">' + regionalMapPoints.map((point, index) => '<button class="regional-map-pin" type="button" style="--x:' + point[1] + '%;--y:' + point[2] + '%" data-company-region-pin="' + index + '" aria-label="Highlight ' + point[0] + ' global presence" aria-pressed="false"></button>').join('') + '</div>';
    placeholder.replaceWith(map);

    const pins = [...map.querySelectorAll('[data-company-region-pin]')];
    let activeIndex = 0;
    let timer;
    const activate = (index) => {
      activeIndex = index;
      pins.forEach((pin, pinIndex) => {
        const active = pinIndex === index;
        pin.classList.toggle('is-active', active);
        pin.setAttribute('aria-pressed', String(active));
      });
    };
    const startAutoPlay = () => {
      window.clearInterval(timer);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden) return;
      timer = window.setInterval(() => activate((activeIndex + 1) % pins.length), 3000);
    };
    pins.forEach((pin) => pin.addEventListener('click', () => {
      activate(Number(pin.dataset.companyRegionPin));
      startAutoPlay();
    }));
    const visibilityHandler = () => startAutoPlay();
    document.addEventListener('visibilitychange', visibilityHandler);
    companyGlobalMapCleanup = () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
    activate(0);
    startAutoPlay();
  }

  const heroBrandSlides = [
    "Company feature image 1",
    "Company feature image 2",
    "Company feature image 3"
  ];
  let heroBrandCleanup = null;

  function prepareHeroBrandSlider() {
    if (location.pathname !== '/company') {
      if (heroBrandCleanup) heroBrandCleanup();
      heroBrandCleanup = null;
      return;
    }
    const brand = document.querySelector('.hero-panel .hero-brand');
    if (!brand) {
      if (heroBrandCleanup) heroBrandCleanup();
      heroBrandCleanup = null;
      return;
    }
    if (brand.dataset.heroSliderEnhanced === 'true') return;
    if (heroBrandCleanup) heroBrandCleanup();
    brand.dataset.heroSliderEnhanced = 'true';
    brand.setAttribute('aria-label', 'Company feature image slider');
    brand.innerHTML = '<div class="hero-brand-slides">' + heroBrandSlides.map((slide, index) => '<div class="hero-brand-slide' + (index === 0 ? ' is-active' : '') + '" role="img" aria-label="Image placeholder for ' + slide + ', recommended size 560 by 320 pixels"><span>Image Placeholder</span><strong>560 × 320 px</strong></div>').join('') + '</div><div class="hero-brand-dots" role="group" aria-label="Choose company feature image">' + heroBrandSlides.map((slide, index) => '<button class="hero-brand-dot' + (index === 0 ? ' is-active' : '') + '" type="button" data-hero-brand-dot="' + index + '" aria-label="Show slide ' + (index + 1) + '" aria-pressed="' + (index === 0 ? 'true' : 'false') + '"></button>').join('') + '</div>';

    const slides = [...brand.querySelectorAll('.hero-brand-slide')];
    const dots = [...brand.querySelectorAll('[data-hero-brand-dot]')];
    let activeIndex = 0;
    let timer;
    const activate = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === activeIndex));
      dots.forEach((dot, dotIndex) => {
        const active = dotIndex === activeIndex;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-pressed', String(active));
      });
    };
    const startAutoPlay = () => {
      window.clearInterval(timer);
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden) return;
      timer = window.setInterval(() => activate(activeIndex + 1), 4500);
    };
    dots.forEach((dot) => dot.addEventListener('click', () => {
      activate(Number(dot.dataset.heroBrandDot));
      startAutoPlay();
    }));
    const visibilityHandler = () => startAutoPlay();
    document.addEventListener('visibilitychange', visibilityHandler);
    startAutoPlay();
    heroBrandCleanup = () => {
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', visibilityHandler);
    };
  }

  function prepareSectionIds() {
    const sectionPrefix = 'superworld_electronics_';
    const sections = [...document.querySelectorAll('section')];
    if (sections.length && !sections.every((section) => section.id.startsWith(sectionPrefix))) {
      const routeName = location.pathname.split('/').filter(Boolean).join('_') || 'home';
      const slugify = (value) => value
        .toLowerCase()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
      const usedIds = new Set();
      const updatedIds = new Map();

      sections.forEach((section, index) => {
        const previousId = section.id;
        if (section.hasAttribute('data-section-id-preserve') && previousId) {
          usedIds.add(previousId);
          return;
        }
        const heading = section.querySelector('h1, h2, h3');
        const fallback = previousId || [...section.classList].filter((name) => name !== 'section' && name !== 'section-sm' && name !== 'section-rule').join('_') || 'section_' + (index + 1);
        const sectionName = slugify(heading?.textContent.trim() || fallback) || 'section_' + (index + 1);
        const baseId = sectionPrefix + slugify(routeName) + '_' + sectionName;
        let uniqueId = baseId;
        let suffix = 2;
        while (usedIds.has(uniqueId)) uniqueId = baseId + '_' + suffix++;
        usedIds.add(uniqueId);
        if (previousId) updatedIds.set(previousId, uniqueId);
        section.id = uniqueId;
      });

      document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
        const previousTarget = anchor.getAttribute('href').slice(1);
        if (updatedIds.has(previousTarget)) anchor.setAttribute('href', '#' + updatedIds.get(previousTarget));
      });
      document.querySelectorAll('[data-scroll-target]').forEach((control) => {
        const previousTarget = control.dataset.scrollTarget;
        if (updatedIds.has(previousTarget)) control.dataset.scrollTarget = updatedIds.get(previousTarget);
      });

      const currentTarget = location.hash.slice(1);
      if (updatedIds.has(currentTarget)) {
        history.replaceState(history.state, '', location.pathname + location.search + '#' + updatedIds.get(currentTarget));
      }
    }
  }

  function prepareHomeControls() {
    const companyStats = document.getElementById('who-we-are');
    const companyStatsSection = companyStats || document.querySelector('[id$="_who_we_are"]');
    if (companyStatsSection && companyStatsSection.dataset.statsEnhanced !== 'true') {
      const cards = [...companyStatsSection.querySelectorAll('.stat')];
      const details = [
        'EMC Components, Magnetic Components, Transformers & Wireless Power Transfer',
        '28 Invention Patents',
        'Ongoing investment in development capability',
        'Automotive 20% · Industrial & Medical 6% · Proven reliability for mission-critical electronics'
      ];
      if (cards.length >= 7) {
        const secondaryGrid = cards[3].parentElement;
        secondaryGrid.classList.remove('grid', 'grid-4');
        secondaryGrid.classList.add('company-stat-secondary');
        secondaryGrid.removeAttribute('style');
        details.forEach((detail, index) => {
          const card = cards[index + 3];
          if (!card.querySelector('span')) {
            const copy = document.createElement('span');
            copy.textContent = detail;
            card.append(copy);
          }
        });
        companyStatsSection.dataset.statsEnhanced = 'true';
      }
    }
    document.querySelectorAll('.carousel-dots').forEach((dots) => {
      if (!dots.closest('.home-hero') && !dots.closest('.esg-pillars-carousel') && !dots.closest('.news-feature-carousel')) dots.remove();
    });
    document.querySelectorAll('[data-product-tab="general"]').forEach((general) => {
      if (!general.hasAttribute('aria-pressed')) selectProductSet('general', general.dataset.productCarousel);
    });
    const releaseCarousel = document.querySelector('[data-carousel="home-releases"]');
    prepareReleaseCards();
    prepareIndustrySelector();
    prepareCertificationCards();
    prepareNewsCards();
    const releaseLink = releaseCarousel?.closest('section')?.querySelector('.section-heading .link-arrow');
    if (releaseLink) releaseLink.setAttribute('href', '/news?category=product');
    prepareMilestoneSlider();
    prepareQualityValidation();
    prepareRegionalMap();
    prepareCompanyGlobalMap();
    prepareHeroBrandSlider();
    prepareCompanyProductLines();
    prepareSectionIds();
    prepareCertificationVault();
  }

  document.addEventListener('click', (event) => {
    const button = event.target.closest('[data-product-tab]');
    if (button) selectProductSet(button.dataset.productTab, button.dataset.productCarousel);
  });

  const appRoot = document.getElementById('app');
  if (appRoot) new MutationObserver(prepareHomeControls).observe(appRoot, {childList:true, subtree:true});
  prepareHomeControls();
})();

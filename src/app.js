(function clientApp() {
  const app = document.getElementById("app");
  const state = { cart: [1, 1, 1], timers: [], newsPage: 1 };

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
    inquiry: "/inquiry",
    thanks: "/thank-you"
  };

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
        ${link(routes.inquiry, "Request for Quotation")}
        ${link(routes.inquiry, "Technical Support")}
        ${link(routes.inquiry, "Quality / Complaint")}
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
        ${link(routes.emc, "EMC Components")}
        ${link(routes.a4k, "A4K Series")}
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
        <div class="mega-news-cards">
          <article class="mega-news-card">${ph()}<strong>Electronica — India</strong><small>Bangalore International Exhibition Centre</small></article>
          <article class="mega-news-card">${ph()}<strong>Electronica — India</strong><small>Bangalore International Exhibition Centre</small></article>
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
        <div><h3>Contact Us</h3>${link(routes.inquiry,"Request for Quotation")}${link(routes.inquiry,"Technical Support")}${link(routes.inquiry,"Quality / Complaint")}${link(routes.locations,"Service & Sales Offices")}</div>
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
        <div class="section-heading"><h2>DISCOVER OUR CORE PRODUCT LINES</h2><div class="button-group"><button class="button small" type="button" data-product-tab="general">General</button><button class="button small" type="button" data-product-tab="automotive">Automotive</button></div></div>
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
    {name:"Automotive",copy:"Connected, sensing, control, and wireless vehicle electronics.",items:["TCU","Sensing Camera","Infotainment","TPMS","Headlamp","Keyless Entry System","Wireless Charging","ADAS"],href:routes.automotive},
    {name:"AI, HPC & Emerging Tech",copy:"Reliable power, filtering, and signal support for next-generation systems.",items:["AI/HPC Server","Router","Set Top Box"],href:routes.communication},
    {name:"Consumer",copy:"Compact solutions for high-volume, space-sensitive electronics.",items:["Speakers","Hearable Products","Unmanned Aerial Vehicle","Robotic Cleaner","Sensor","Air Purifier"],href:routes.applications},
    {name:"Healthcare Devices",copy:"Reliable power, control, and wireless functions in medical-support electronics.",items:["Blood Pressure Devices","Electronic Thermometer"],href:routes.applications},
    {name:"Industrial & Energy",copy:"Power conversion, automation, and electrically noisy operating environments.",items:["Industrial Robots","3D Printers","Security Products","Smart Meter"],href:routes.applications},
    {name:"Smart Home",copy:"Connected home controls and power management.",items:["Thermostat","Smart Coffee Machine","Keyless Entry Door Lock"],href:routes.applications}
  ];

  function marketCard(m) {
    return `<article class="market-card">
      ${ph()}
      <div class="market-summary"><h3>${m.name}</h3><p>${m.copy}</p></div>
      <div class="market-details"><input type="search" placeholder="Search...">${m.items.map(x=>`<div class="market-detail-item"><div><h4>${x}</h4><p>Power, interface, control and connectivity support.</p></div>${ph()}</div>`).join("")}</div>
      <button class="market-toggle" type="button">View details</button>
      ${link(m.href,"View More","button")}
    </article>`;
  }

  function applicationsPage() {
    const productLines = ["EMC Components","Magnetic Components","Transformers","Wireless Power Transfer"].map(x=>mediaCard(x,"Component capabilities for a wide range of system requirements.","View More",routes.products));
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["APPLICATION"]])}
      ${heroPanel("SOLUTIONS BUILT AROUND<br>REAL APPLICATION NEEDS","Superworld provides core power and connectivity solutions for automotive, industrial, healthcare, and consumer systems, with technologies designed to support efficiency, reliability, and innovation.",["EXPLORE INDUSTRIES","DISCUSS YOUR PROJECT"])}
      <nav class="anchor-nav"><a href="#markets">APPLICATION MARKETS</a><a href="#core-solutions">CORE SOLUTIONS ACROSS APPLICATIONS</a><a href="#system-design">HOW SUPERWORLD FITS INTO SYSTEM DESIGN</a><a href="#why">WHY WORK WITH SUPERWORLD</a></nav>
      <section id="markets" class="section"><div class="container"><div class="section-heading"><div><h2>APPLICATION MARKETS</h2><p>Explore the key markets we support and the system needs behind each application.</p></div><button type="button" data-market-all>View All</button></div><div class="market-grid">${applicationMarkets.map(marketCard).join("")}</div></div></section>
      <section id="core-solutions" class="section section-rule"><div class="container"><div class="section-heading"><div><h2>CORE SOLUTIONS ACROSS APPLICATIONS</h2><p>Our component capabilities support a wide range of system requirements across multiple markets.</p></div><div class="button-group"><button>General</button><button>Automotive</button></div></div>${carousel("app-products",productLines,4)}</div></section>
      <section id="system-design" class="section section-rule"><div class="container"><div class="section-heading center"><h2>HOW SUPERWORLD FITS INTO SYSTEM DESIGN</h2><p>From input filtering to power conversion and connectivity, our solutions support key functions across modern electronic systems.</p></div><div class="flow">${[["Input / Interface","EMC filtering"],["Power Conversion","Inductors + transformers"],["Control Board","Stable signal support"],["Connectivity","LAN / wireless support"],["End Device Function","Application-specific output"]].map(x=>`<article class="flow-card">${ph()}<h3>${x[0]}</h3><p>${x[1]}</p></article>`).join("")}</div></div></section>
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
    const systems = automotive ? automotiveSystems : serverSystems;
    const title = automotive ? "RELIABLE COMPONENTS FOR<br>AUTOMOTIVE ELECTRONICS." : "COMPONENTS FOR<br>AI, HPC & EMERGING TECH";
    const copy = automotive ? "Magnetic and EMC component support for stable power, signal integrity, and reliable in-vehicle performance." : "Magnetic and EMC component support for AI/HPC servers, routers, set top boxes, and connected signal and power circuits.";
    const mapSrc = automotive ? "/assets/automotive-map.webp" : "/assets/server-map.webp";
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["APPLICATION",routes.applications],[automotive?"AUTOMOTIVE":"COMMUNICATION & NETWORKING"]])}
      ${heroPanel(title,copy,["VIEW APPLICATION FIT","CONTACT SALES"])}
      ${automotive?`<section class="section-sm"><div class="container"><div class="hero-panel compact" style="grid-template-columns:1.3fr 1fr"><div><h2>One clear route from vehicle area to product family.</h2><p>Identify the automotive system, understand the circuit need, and access the relevant series bundle without reading repeated product lists.</p></div><div class="grid grid-2"><div class="stat"><strong>8</strong><b>Application Areas</b></div><div class="stat"><strong>10+</strong><b>Component Types</b></div><div class="stat"><strong>IATF 16949</strong><b>Design Focus</b></div><div class="stat"><strong>Global</strong><b>Selection Support</b></div></div></div></div></section>`:`<section class="communication-route-section"><div class="container"><div class="communication-route-panel"><div class="communication-route-copy"><h2>One clear route from system<br> area to product family.</h2><p>Identify the communication system, understand the circuit need, and access<br class="communication-route-break"> the relevant series bundle without reading repeated product lists.</p></div><div class="communication-route-metrics"><div class="stat"><strong>3</strong><b>System Groups</b></div><div class="stat"><strong>14</strong><b>Application Areas</b></div><div class="stat"><strong>AI / EMI</strong><b>Design Focus</b></div><div class="stat"><strong>Series</strong><b>Selection Support</b></div></div></div></div></section>`}
      <nav class="anchor-nav"><a href="#design-needs">${automotive?"AUTOMOTIVE ":""}DESIGN NEEDS</a><a href="#fit">APPLICATION FIT</a><a href="#confidence">QUALITY CONFIDENCE</a><a href="#journey">USER JOURNEY</a></nav>
      <section id="design-needs" class="section section-rule"><div class="container"><div class="section-heading center"><h2>${automotive?"WHAT THE PAGE SHOULD COMMUNICATE FIRST":"SUPPORT STABLE COMMUNICATION CIRCUIT DESIGN"}</h2><p>${automotive?"":"Reduce noise, support power conversion, and keep signal paths clean."}</p></div><div class="design-cards">
        ${(automotive?[["Reduce electrical noise","Show how EMC components support cleaner power and signal paths."],["Stabilise power circuits","Position inductors and transformers around power conversion needs."],["Support compact modules","Connect product families to space-conscious automotive electronics."],["Build selection confidence","Link application choices to quality, testing, and enquiry support."]]:[["Control EMI & Signal noise","Support EMI suppression and noise filtering across LAN, Ethernet, RF, and interface circuits."],["Support AI power conversion","Provide suitable inductor and transformer options."],["Protect Data interfaces","Help users identify components for connected interface stability."],["Speed up series selection","Connect each device area to related component families."]]).map((x,i)=>`<article class="design-card"><h2>0${i+1}</h2><h3>${x[0]}</h3><p>${x[1]}</p></article>`).join("")}
      </div></div></section>
      <section id="fit" class="section section-rule"><div class="container"><div class="section-heading center"><h2>FIND THE RIGHT SERIES BY ${automotive?"AUTOMOTIVE":"COMMUNICATION"} SYSTEM</h2><p>Use the ${automotive?"vehicle":"system"} map to jump to a system. Expand a card only when needed.</p></div>${automotive?`<div class="system-map"><img src="${mapSrc}" alt="Automotive application map"></div><div class="system-controls"><button type="button" data-accordion-all="open">Show All</button><button type="button" data-accordion-all="close">Collapse All</button></div><div class="accordion-list">${systems.map((x,i)=>accordionItem(x,i,kind)).join("")}</div>`:`<div id="systemTabsRoot">${communicationSystemTabsMarkup()}</div>`}</div></section>
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
    const categoryColumns = Object.entries(generalCategories).map(([k,vals])=>`<div><h3>${k}</h3><ul>${vals.map(x=>`<li><span class="check-square"></span>${x}</li>`).join("")}</ul></div>`).join("");
    const releases = Array.from({length:6},()=>mediaCard("A4K Series","Chip Array Ferrite Bead","View More",routes.a4k));
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["OUR PRODUCTS"]])}
      ${heroPanel("OUR PRODUCTS","Comprehensive range of general and automotive electronic components, including EMC, magnetic, transformer, and wireless power solutions, engineered for high efficiency and reliable performance.")}
      <section class="section"><div class="container"><div class="section-heading"><h2>GENERAL COMPONENTS</h2>${link(routes.general,"View More","link-arrow")}</div><div class="category-columns">${categoryColumns}</div></div></section>
      <section class="section"><div class="container"><div class="section-heading"><h2>AUTOMOTIVE COMPONENTS</h2>${link(routes.products,"View More","link-arrow")}</div><div class="category-columns">${Object.entries(generalCategories).slice(0,3).map(([k,vals])=>`<div><h3>${k}</h3><ul>${vals.slice(0,5).map(x=>`<li><span class="check-square"></span>${x}</li>`).join("")}</ul></div>`).join("")}</div></div></section>
      <section class="section"><div class="container"><div class="section-heading"><h2>LATEST RELEASE</h2>${link(routes.news+"?category=product","View More","link-arrow")}</div>${carousel("product-releases",releases,4)}</div></section>
    </main>`;
  }

  function generalPage() {
    const families = [
      ["EMC Components","Designed to reduce electrical noise and prevent interference between electronic devices.",Object.values(generalCategories)[0]],
      ["Magnetic Components","Essential parts that use magnetic fields to store energy, filter noise, and ensure efficient power conversion.",Object.values(generalCategories)[1].slice(0,8)],
      ["Transformer","Electronic components that transfer electrical energy between circuits, enabling voltage conversion and isolation.",Object.values(generalCategories)[2]]
    ];
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["OUR PRODUCTS",routes.products],["GENERAL COMPONENTS"]])}
      ${heroPanel("GENERAL COMPONENTS","Essential electronic parts that manage power, reduce electromagnetic interference (EMI), and support efficient signal transmission, ensuring reliable performance in electronic circuits.")}
      <nav class="anchor-nav">${["EMC Components","Magnetic Components","Transformer","Wireless Power Transfer"].map(x=>`<a href="#${x.split(" ")[0].toLowerCase()}">${x}</a>`).join("")}</nav>
      ${families.map((f,i)=>`<section id="${f[0].split(" ")[0].toLowerCase()}" class="product-family"><div class="container"><div class="section-heading center"><h2>${f[0]}</h2><p>${f[1]}</p></div>${ph("tall")}<div class="family-icons">${f[2].map((x,j)=>`<div class="family-icon">${j===0&&i===0?`<div class="ph" style="display:grid;place-items:center">${a4kImage("product-thumb")}</div>`:ph()}<span>${x}</span></div>`).join("")}</div></div></section>`).join("")}
    </main>`;
  }

  const productRows = (series, count = 4) => Array.from({length:count},(_,i)=>`<tr><td>${i===0&&series==="A4K"?a4kImage("product-thumb"):ph()}</td><td><a data-link href="${series==="A4K"?routes.a4k:"#"}"><u>${series}${i?i:""}</u></a></td><td>XXXXX</td><td>XXX - XXX</td><td>XXX - XXX</td><td>XXX - XXX</td><td><button class="button small">Download</button></td></tr>`).join("");

  function emcPage() {
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["OUR PRODUCTS",routes.products],["GENERAL COMPONENTS",routes.general],["EMC COMPONENTS"]])}
      ${heroPanel("EMC Components","Designed to reduce electrical noise and prevent interference between electronic devices. They ensure products operate reliably, safely, and in compliance with international standards.",[],true)}
      <nav class="anchor-nav">${Object.values(generalCategories)[0].slice(0,5).map(x=>`<a href="#${x.toLowerCase().replaceAll(" ","-")}">${x}</a>`).join("")}</nav>
      ${[
        ["Chip Array Ferrite Bead","Combining four 0603 chips into a single package reduces both board space and processing time.","A4K",1],
        ["Chip Inductor","Design of multilayer construction with excellent reliability. Small form factor, low profile, high current capability.","C",4],
        ["Ferrite Bead Assembly","High Current capabilities. Suitable for application in EMI filtering for differential mode noise.","Z",3],
        ["Ferrite Chip Bead","Multilayer construction, ideal for power lines, general and high-speed signal lines.","Z",5]
      ].map((x,i)=>`<section id="${x[0].toLowerCase().replaceAll(" ","-")}" class="section-sm"><div class="container"><h2>${x[0]}</h2><p>${x[1]}</p><div class="table-wrap"><table><thead><tr><th>Product</th><th>Series</th><th>Dimension</th><th>Impedance Range (ohm)</th><th>DCR Range (ohm)</th><th>Current Range (mA)</th><th>Specification</th></tr></thead><tbody>${productRows(x[2],x[3])}</tbody></table></div></div></section>`).join("")}
    </main>`;
  }

  function productDataRows(count=4) {
    return Array.from({length:count},(_,i)=>`<tr><td><input type="checkbox" ${i===0?"checked":""}></td><td>${a4kImage("product-thumb")}<u>${i===0?"A4K300-RE-10":"XXXXXX"}</u></td><td>Chip Inductor</td><td>xxxxx</td><td>xxxxx</td><td>xxxxx</td><td>xxxxx</td><td>xxxxx</td><td>xxxxx</td><td>xxxxx</td><td>xxxxx</td><td>xxxxx</td><td><button class="button small">Download</button></td></tr>`).join("");
  }

  function a4kPage() {
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["OUR PRODUCTS",routes.products],["GENERAL COMPONENTS",routes.general],["EMC COMPONENTS",routes.emc],["CHIP ARRAY FERRITE BEAD",routes.emc],["A4K"]])}
      <section class="section-sm"><div class="container product-hero"><div><div class="section-heading"><h1>A4K Series<br>Chip Array Ferrite Bead</h1><span class="tag">EMC COMPONENTS</span></div><hr><h2>INTRODUCTION</h2><p>A4K Series Is A Compact Chip Array Ferrite Bead For Multi-Line EMI Noise Suppression In High-Density Electronic Circuits.</p><ul><li>4-Line Array Design: Supports Compact Filtering In One Package.</li><li>Multiple Impedance: Options Support Different Noise Suppression Needs.</li><li>Low DCR Selection: Helps Reduce Unwanted Circuit Power Loss.</li></ul><div class="grid grid-4" style="margin-top:56px">${card("Compliance","Product Status")}${card("RoHS / REACH","Compliant")}${card("Halogen","Free")}${card("AEC","Q200 / -125°C")}</div></div><div class="product-visual">${a4kImage()}<div class="spec-metrics"><div class="spec-metric"><b>LENGTH</b><br>3.20 mm</div><div class="spec-metric"><b>WIDTH</b><br>1.60 mm</div><div class="spec-metric"><b>HEIGHT</b><br>0.90 mm</div><div class="spec-metric"><b>SPQ</b><br>3,000 / reel</div></div><button class="button" style="width:100%;margin-top:16px">Download Specifications</button></div></div></section>
      <section class="section-sm"><div class="container"><div class="tabs"><h3>PRODUCT DETAILS</h3>${["Introduction","Specifications","Environmental","Performance Curves","Physical Dimension","Tape & Reel","Soldering / Washing"].map(x=>`<button type="button" data-scroll-target="${x.toLowerCase().replaceAll(" ","-").replaceAll("/","")}">${x}</button>`).join("")}</div></div></section>
      <section id="specifications" class="product-detail-section"><div class="container"><h2>SPECIFICATIONS</h2><div class="spec-metrics"><div class="spec-metric"><h3>PRODUCT TYPE</h3>Chip Array Ferrite Bead</div><div class="spec-metric"><h3>IMPEDANCE</h3>30–1000 Ω</div><div class="spec-metric"><h3>TEST FREQUENCY</h3>100 MHz</div><div class="spec-metric"><h3>OPERATING TEMP</h3>-40°C to +125°C</div></div><div class="search-actions"><input type="search" placeholder="Search Terms:"><button>Search</button>${buttonLink(routes.inquiry,"Inquiry")}</div><p>Choose the part numbers you need and submit your inquiry.</p><div class="table-wrap"><table><thead><tr><th></th><th>Product</th><th>Category</th><th>Length (mm)</th><th>Width (mm)</th><th>Height (mm)</th><th>Inductance (uH)</th><th>Impedance (Ω)</th><th>DCR (mΩ)</th><th>Isat (mA)</th><th>Irms (mA)</th><th>SPQ</th><th></th></tr></thead><tbody>${productDataRows()}</tbody></table></div>${pagination()}</div></section>
      <section id="environmental" class="product-detail-section"><div class="container"><h2>ENVIRONMENTAL</h2><div class="grid grid-2">${card("Operating Conditions","Operating temperature: -40°C to +125°C. Storage temperature: -40°C to +125°C on board. Electrical data referenced to 25°C ambient.")}${card("Storage Conditions","Store components in original packaging before use. Recommended storage: less than 40°C. Recommended humidity: less than 60% RH.")}</div></div></section>
      <section id="performance-curves" class="product-detail-section"><div class="container"><h2>PERFORMANCE CURVES</h2><div class="card"><h3>Characteristics Curve</h3><p>Impedance characteristics by selected part number</p>${ph("map")}</div></div></section>
      <section id="physical-dimension" class="product-detail-section"><div class="container"><h2>PHYSICAL DIMENSION</h2><div class="grid grid-2">${card("Configuration & Dimensions",ph("tall"))}${card("Recommended PCB Layout",ph("tall"))}</div></div></section>
      <section id="tape-&-reel" class="product-detail-section"><div class="container"><h2>TAPE & REEL</h2><div class="grid grid-2">${card("Packaging Quantity","Chip / Reel: 3,000 pcs<br>Inner Box: 15,000 pcs<br>Middle Box: 75,000 pcs<br>Carton: 150,000 pcs")}${card("Reel & Tape Dimensions","7” × 8 mm reel form<br>Tape dimension reference for B0, A0, K0, P, T, and W<br>Tearing-off force reference by tape size")}</div></div></section>
      <section id="soldering--washing" class="product-detail-section"><div class="container"><h2>SOLDERING / WASHING</h2><div class="grid grid-2">${card("Reflow Soldering","Pb-free reflow profile reference. Reflow times: 3 times max. Profile based on IPC / JEDEC J-STD-020F.")}${card("Iron Soldering / Handling","Hand soldering is not preferred. Use controlled tip temperature and short soldering time. Follow full datasheet for process precautions.")}</div><div class="cta" style="margin-top:60px"><div><h2>NEED SUPPORT SELECTING AUTOMOTIVE COMPONENTS?</h2><p>Share your application, design need, and target component family with Superworld.</p></div>${buttonLink(routes.inquiry,"Send Enquiry")}</div></div></section>
    </main>`;
  }

  function specSearchPage() {
    const filters = [
      ["Series",["C0","C1","C2","C3","SCT20022R0K","SCT50036R3KA11S"]],
      ["Length",["xx"]],["Width",["xx"]],["Height",["xx"]],["Impedance",["xxxx","xxxx","xxxx","xxxx","xxxx","xxxx"]],
      ["Dcr",["xxxx","xxxx","xxxx","xxxx","xxxx","xxxx"]],["Irms",["xxxx","xxxx","xxxx","xxxx","xxxx","xxxx"]],
      ["Qi Standard",["xxxx","xxxx","xxxx","xxxx","xxxx","xxxx"]],["Power",["xxxx","xxxx","xxxx","xxxx","xxxx","xxxx"]],["SPQ",["Reel"]]
    ];
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["TOOLS"],["Specification Search"]])}<section class="section-sm"><div class="container"><h1>SPECIFICATION SEARCH</h1>
      <div class="search-block"><h4>Choose starting category</h4><div class="radio-row"><label><input type="radio" name="start" value="application"> Application</label><label><input type="radio" name="start" checked value="general"> General Products</label><label><input type="radio" name="start" value="automotive"> Automotive Products</label></div></div>
      <div class="search-block"><div class="section-heading"><div><h4>Product Categories</h4><p>Pick one or more</p></div><span class="tag" data-selected-count>2 selected</span></div><div class="category-picker">${Object.entries(generalCategories).map(([k,vals])=>`<div class="filter-box"><h4>${k}</h4>${vals.slice(0,12).map((x,i)=>`<label class="filter-option"><input class="category-check" type="checkbox" ${((k==="EMC Components"&&i===1)||(k==="Wireless Power Transfer"&&i===1))?"checked":""}>${x}</label>`).join("")}</div>`).join("")}</div></div>
      <div class="search-block"><div class="section-heading"><div><h4>Filters</h4><p>Series & custom fields</p></div><button type="button" data-clear-filters>Clear</button></div><div class="filter-grid">${filters.map(f=>`<div class="filter-box"><h4>${f[0]}</h4><input type="search" aria-label="Search ${f[0]}">${f[1].map(x=>`<label class="filter-option"><input type="checkbox">${x}</label>`).join("")}</div>`).join("")}</div></div>
      <div class="search-actions"><input type="search" placeholder="Search Terms:"><button type="button" data-spec-search>Search</button>${buttonLink(routes.inquiry,"Inquiry")}</div><p>Choose the part numbers you need and submit your inquiry.</p><div class="table-wrap"><table><thead><tr><th></th><th>Product</th><th>Category</th><th>Length (mm)</th><th>Width (mm)</th><th>Height (mm)</th><th>Inductance (uH)</th><th>Impedance (Ω)</th><th>DCR (mΩ)</th><th>Isat (mA)</th><th>Irms (mA)</th><th>SPQ</th><th></th></tr></thead><tbody>${productDataRows()}</tbody></table></div>${pagination()}</div></section></main>`;
  }

  const newsCategories = {
    latest:"Latest Product News", product:"Product Releases", brochures:"Brochures", events:"Exhibitions & Trade Shows", csr:"Corporate Social Responsibility", eol:"End-of-Life Notices", business:"Business Updates", announcements:"Announcements"
  };

  function newsHero() {
    const features = [
      ["Program at Gladiolus Place","Corporate Social Responsibility"],
      ["New A4K Series Release","Latest Product News"],
      ["Electronica India Preview","Exhibitions & Trade Shows"]
    ].map(x=>`<div class="slide"><div class="feature-news">${ph()}<span class="tag">${x[1]}</span><h2>${x[0]}</h2><p>Superworld Electronics news and activity highlight.</p>${link(routes.detail,"View More","link-arrow")}</div></div>`);
    return `<div class="news-top">${carousel("news-feature",features,1,false)}<aside class="event-box"><h2>Event Calendar</h2>${Array.from({length:5},()=>`<div class="event-row"><div class="event-date"><b>JAN</b><br>21</div><div><h4>NEPCON Japan 2026 - Tokyo</h4><p>Booth no : # E36 – 27</p></div></div>`).join("")}${buttonLink(routes.calendar,"Full Schedule","wide")}</aside></div>`;
  }

  function newsPage() {
    const params = new URLSearchParams(location.search);
    const category = params.get("category") || "latest";
    const label = newsCategories[category] || newsCategories.latest;
    const cards = Array.from({length:8},(_,i)=>`<article class="news-card">${ph()}<span class="tag">${i===0?label:"Business Updates"}</span><h3>${i===0?(category==="events"?"NEPCON Japan 2026 Recap: Innovations, Insights & Trends":category==="csr"?"Superworld Electronics’ CSR Program at Gladiolus Place":category==="brochures"?"Radial-Leaded Inductor: Fully Automated Production Overview":"Radial-Leaded Inductor: Fully Automated Production Overview"):"Our Johor Bahru facility is progressing"}</h3><div class="media-card-footer">${link(routes.detail,"View More","link-arrow")}<span>17 December 2025</span></div></article>`);
    const list = Array.from({length:5},()=>`<article class="news-list-item">${ph()}<div><h3>Molded Power Inductor</h3><p>Low profile as low as 1mm. Capable of handling high current ratings while maintaining optimal performance.</p></div><div><span class="tag">General</span><h3>PHA0301S</h3><p>Dimension Range : XXX - XXX</p><small>Release Date : 15/04/2026</small></div></article>`).join("");
    const listMode = category === "product" || category === "eol";
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["NEWS"]])}<section class="section-sm"><div class="container">${newsHero()}
      <nav class="anchor-nav">${[["Latest News","latest"],["Product News","product"],["Events & Activities","events"],["Company News","business"],["Resources","brochures"]].map(x=>link(routes.news+"?category="+x[1],x[0])).join("")}</nav>
      <div class="news-filters"><select aria-label="Category"><option>${label}</option><option>All</option></select><select aria-label="Year"><option>Year</option><option>2026</option><option>2025</option></select><input type="search" placeholder="Search news"></div>
      <section class="section-sm">${listMode?`<div class="news-list">${list}</div>`:`<div class="news-grid">${cards.join("")}</div>`}${pagination()}</section>
    </div></section></main>`;
  }

  function eventCalendarPage() {
    const rows = Array.from({length:6},()=>`<tr><td>${ph()}</td><td>21 Jan (Wed) – 23 Jan (Fri)</td><td><strong>Tokyo Big Sight, Japan</strong><br># E36 – 27</td><td><button>Learn More</button></td><td><button>Learn More</button><br>Book an Appointment</td></tr>`).join("");
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["NEWS",routes.news],["EVENT CALENDAR"]])}<section class="section-sm"><div class="container">${newsHero()}<nav class="anchor-nav">${link(routes.news,"Latest News")}${link(routes.news+"?category=product","Product News")}${link(routes.news+"?category=events","Events & Activities")}${link(routes.news+"?category=business","Company News")}${link(routes.news+"?category=brochures","Resources")}</nav><div class="news-filters"><select><option>ALL</option></select><select><option>Year</option></select><input type="search" placeholder="Search events"></div><div class="table-wrap" style="margin-top:56px"><table><thead><tr><th>Event</th><th>Date</th><th>Location, Booth No</th><th>Exhibition website</th><th>Our Expo Page</th></tr></thead><tbody>${rows}</tbody></table></div>${pagination()}</div></section></main>`;
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

  function locationsPage() {
    const locationCards = (items=locationData)=>items.map(item=>`<article class="location-card" data-location-type="${item.type}"><h3>${item.title}</h3><p>${item.office}<br>${item.address}</p><p><a href="mailto:${item.email}">${item.email}</a></p><p>${item.contact}</p>${item.fax?`<p>Fax: ${item.fax}</p>`:""}${item.website?`<p><a href="https://${item.website}" target="_blank" rel="noopener">${item.website}</a></p>`:""}</article>`).join("");
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["ABOUT US",routes.company],["GLOBAL PRESENCE"]])}
      ${heroPanel("GLOBAL PRESENCE","Our global operations enable us to deliver consistent quality, engineering expertise, and scalable production to customers across key markets worldwide.")}
      <nav class="anchor-nav"><a href="#regional">REGIONAL SUPPORT</a><a href="#locations">OUR LOCATIONS</a></nav>
      <section id="regional" class="section"><div class="container"><div class="section-heading center"><h2>REGIONAL SUPPORT FOR GLOBAL CUSTOMERS</h2><p>Manufacturing, engineering, sales, and logistics support across key markets.</p></div>${ph("map")}<div class="regions" style="margin-top:52px">${regionCards()}</div></div></section>
      <section id="locations" class="section section-rule"><div class="container"><div class="section-heading center"><h2>SUPERWORLD ELECTRONICS LOCATIONS</h2></div><div class="section-heading location-controls"><div class="location-tabs" aria-label="Filter locations"><button class="is-active" type="button" data-location-filter="all" aria-pressed="true">ALL</button><button type="button" data-location-filter="office" aria-pressed="false">Office</button><button type="button" data-location-filter="agent" aria-pressed="false">Agent</button><button type="button" data-location-filter="distributor" aria-pressed="false">Distributor</button></div><input type="search" data-location-search aria-label="Search locations" placeholder="Search Locations ..."></div><div class="location-grid" data-location-grid>${locationCards()}</div><p class="location-empty" data-location-empty hidden>No locations match your selection.</p>
      </div></section>
    </main>`;
  }

  function inquiryPage() {
    const cartRows = state.cart.map((qty,i)=>`<div class="cart-row" data-cart-row="${i}"><div class="cart-number">${i+1}</div><div class="cart-product">${ph()}<div><h3>C0-10NJ-E-10</h3><p><strong>L W H</strong> &nbsp; XXXXX &nbsp; <strong>SPQ</strong> (reel) : 1000</p><p><strong>Category</strong><br>General Products &gt; EMC Components &gt; Chip Inductor</p><div class="grid grid-2"><p><strong>Inductance (uH)</strong> XXXXX<br><strong>Impedance (Ω)</strong> XXXXX<br><strong>DCR (mΩ)</strong> XXXXX</p><p><strong>Isat (mA)</strong> XXXXX<br><strong>Irms (mA)</strong> XXXXX<br><strong>Specification</strong> Download</p></div></div></div><div class="cart-quantity"><strong>Quantity</strong><div class="quantity"><button type="button" data-qty="${i}" data-delta="1">+</button><output>${qty}</output><button type="button" data-qty="${i}" data-delta="-1">−</button></div><button type="button" data-remove="${i}">Remove</button></div></div>`).join("");
    return `<main id="main-content" class="page-main">${crumb([["HOME",routes.home],["INQUIRY CART"]])}<section class="section-sm"><div class="container"><div class="section-heading"><h1>INQUIRY CART SUMMARY</h1><button type="button" data-back>Back</button></div><div class="inquiry-summary"><h2 style="padding:18px 96px;border-bottom:1px solid #111">Product Details</h2><div data-cart-container>${cartRows||`<div class="card"><h3>Your inquiry cart is empty.</h3>${buttonLink(routes.products,"Browse Products")}</div>`}</div></div>
      <section class="section"><h1>INQUIRY DETAILS</h1><form class="inquiry-form" data-inquiry-form><div class="form-columns"><div><h2>CONTACT DETAILS</h2><div class="field"><label for="fullname">Full Name</label><input id="fullname" name="fullname" required></div><div class="form-grid-2"><div class="field"><label>Job Title / Department</label><input name="job"></div><div class="field"><label>Phone Number</label><input name="phone" type="tel"></div></div><div class="field"><label>Business Email</label><input name="email" type="email" required></div></div><div><h2>BUSINESS / PROJECT INFO</h2><div class="form-grid-2"><div class="field"><label>Company Name</label><input name="company" required></div><div class="field"><label>Industry</label><input name="industry"></div><div class="field"><label>Country / Region</label><input name="country"></div><div class="field"><label>Project Timeline</label><select name="timeline"><option>1–3 months</option><option>3–6 months</option><option>6–12 months</option></select></div></div><div class="field"><label>Company Website</label><input name="website" type="url"></div></div></div><h2>OVERALL REMARKS</h2><div class="field"><textarea name="remarks"></textarea></div><div class="section-heading"><label><input type="checkbox" required> Kindly consent to the terms and conditions.<br>Click "Read More" for further comprehension.</label><button class="button wide" type="submit">Submit</button></div></form></section>
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
    if (p === routes.inquiry) return inquiryPage();
    if (p === routes.thanks) return thanksPage();
    if (p === routes.news) return newsPage();
    return `<main id="main-content" class="page-main"><section class="section"><div class="container"><h1>Page not found</h1>${buttonLink(routes.home,"Return Home")}</div></section></main>`;
  }

  function stopTimers() {
    state.timers.forEach(clearInterval);
    state.timers = [];
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
    }));
    document.addEventListener("click",()=>document.querySelectorAll(".mega-panel").forEach(p=>p.classList.remove("is-open")),{once:true});
    document.querySelectorAll(".mega-panel").forEach(p=>p.addEventListener("click",e=>e.stopPropagation()));
    document.querySelectorAll("[data-language]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();alert(`${a.dataset.language} is shown as a wireframe option. Translation will be added in the content phase.`);}));
    document.querySelector("[data-market-all]")?.addEventListener("click",(e)=>{
      const cards=[...document.querySelectorAll(".market-card")];
      const allOpen=cards.every(c=>c.classList.contains("is-open"));
      cards.forEach(c=>c.classList.toggle("is-open",!allOpen));
      e.currentTarget.textContent=allOpen?"View All":"Collapse All";
    });
    document.querySelectorAll(".market-toggle").forEach(btn=>btn.addEventListener("click",()=>btn.closest(".market-card").classList.toggle("is-open")));
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
      const i=Number(btn.dataset.qty); state.cart[i]=Math.max(1,state.cart[i]+Number(btn.dataset.delta)); render(false);
    }));
    document.querySelectorAll("[data-remove]").forEach(btn=>btn.addEventListener("click",()=>{state.cart.splice(Number(btn.dataset.remove),1);render(false);}));
    document.querySelector("[data-back]")?.addEventListener("click",()=>history.back());
    document.querySelector("[data-inquiry-form]")?.addEventListener("submit",(e)=>{e.preventDefault();navigate(routes.thanks);});
    const locationSearch=document.querySelector("[data-location-search]");
    const locationFilterButtons=[...document.querySelectorAll("[data-location-filter]")];
    const locationCards=[...document.querySelectorAll("[data-location-grid] .location-card")];
    let activeLocationFilter="all";
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
      const empty=document.querySelector("[data-location-empty]");
      if(empty) empty.hidden=visibleCount!==0;
    };
    locationSearch?.addEventListener("input",applyLocationFilters);
    locationFilterButtons.forEach(btn=>btn.addEventListener("click",()=>{
      activeLocationFilter=btn.dataset.locationFilter;
      locationFilterButtons.forEach(button=>{
        const active=button===btn;
        button.classList.toggle("is-active",active);
        button.setAttribute("aria-pressed",String(active));
      });
      applyLocationFilters();
    }));
    document.querySelectorAll("[data-page]").forEach(btn=>btn.addEventListener("click",()=>{document.querySelectorAll("[data-page]").forEach(b=>{b.style.background="#fff";b.style.color="#111"});btn.style.background="#111";btn.style.color="#fff";}));
    setupCommunicationSystemTabs();
    setupCarousels();
  }

  function navigate(href) {
    const url = new URL(href,location.origin);
    history.pushState({}, "", url.pathname + url.search + url.hash);
    render();
  }

  function render(scrollTop = true) {
    stopTimers();
    app.innerHTML = header() + pageForPath() + footer() + `<div class="wireframe-note">Black & white wireframe · Poppins headings · Inter body</div>`;
    setupInteractions();
    document.title = "Superworld Electronics — Wireframe";
    if (scrollTop) window.scrollTo({top:0,behavior:"instant"});
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

  function selectProductSet(type) {
    const root = document.querySelector('[data-carousel="home-products"]');
    const items = productSets[type];
    if (!root || !items) return;
    const track = root.querySelector('.carousel-track');
    if (track) {
      track.innerHTML = items.map(cardMarkup).join('');
      track.style.transform = 'translateX(0px)';
    }
    document.querySelectorAll('[data-product-tab]').forEach((button) => {
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

  function prepareRegionalMap() {
    const heading = [...document.querySelectorAll('h2')].find((item) => item.textContent.trim() === 'REGIONAL SUPPORT FOR GLOBAL CUSTOMERS');
    const section = heading?.closest('section');
    const placeholder = section?.querySelector('.ph.map');
    const regions = section?.querySelector('.regions');
    if (!section || !placeholder || !regions || regions.dataset.regionMapEnhanced === 'true') return;

    const cards = [...regions.querySelectorAll('.region')];
    if (cards.length !== regionalMapPoints.length) return;
    regions.dataset.regionMapEnhanced = 'true';

    const map = document.createElement('div');
    map.className = 'regional-map';
    map.setAttribute('aria-label', 'Interactive regional support world map');
    map.innerHTML = '<div class="regional-map-stage"><img src="/assets/world-map.webp" alt="World map showing Superworld Electronics regional support locations">' + regionalMapPoints.map((point, index) => '<button class="regional-map-pin" type="button" style="--x:' + point[1] + '%;--y:' + point[2] + '%" data-region-pin="' + index + '" aria-label="Highlight ' + point[0] + ' regional support" aria-pressed="false"></button>').join('') + '</div>';
    placeholder.replaceWith(map);

    const pins = [...map.querySelectorAll('[data-region-pin]')];
    let activeIndex = 0;
    let autoPlayTimer;
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
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.hidden) return;
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
    document.addEventListener('visibilitychange', startAutoPlay);
    activate(0);
    startAutoPlay();
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
      if (!dots.closest('.home-hero') && !dots.closest('.esg-pillars-carousel')) dots.remove();
    });
    const general = document.querySelector('[data-product-tab="general"]');
    if (general && !general.hasAttribute('aria-pressed')) selectProductSet('general');
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
    if (button) selectProductSet(button.dataset.productTab);
  });

  const appRoot = document.getElementById('app');
  if (appRoot) new MutationObserver(prepareHomeControls).observe(appRoot, {childList:true, subtree:true});
  prepareHomeControls();
})();

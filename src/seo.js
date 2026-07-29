export const SITE_ORIGIN = "https://lo-wireframe.yoongsinjie.chatgpt.site";
export const SOCIAL_IMAGE_PATH = "/assets/og.png";

export const PAGE_METADATA = {
  "/": {
    title: "Electronic Components & Support | Superworld Electronics",
    description: "Explore Superworld Electronics components, application solutions, quality standards, global support, product releases and company news.",
    heading: "Superworld Electronics Components & Solutions",
    breadcrumbs: []
  },
  "/company": {
    title: "About Superworld Electronics | Component Design & Manufacturing",
    description: "Learn about Superworld Electronics, its component design and manufacturing capabilities, product lines, industries, milestones and global presence.",
    heading: "Your Solutions to Electro-Magnetic Components",
    breadcrumbs: [["Home", "/"], ["Our Company", "/company"]]
  },
  "/company/achievements": {
    title: "Company Achievements & Awards | Superworld Electronics",
    description: "Review Superworld Electronics enterprise, customer, supply performance and manufacturing awards and recognitions.",
    heading: "Achievements",
    breadcrumbs: [["Home", "/"], ["Our Company", "/company"], ["Achievements", "/company/achievements"]]
  },
  "/company/quality": {
    title: "Quality Standards & Validation | Superworld Electronics",
    description: "Explore Superworld Electronics quality management, reliability testing, compliance, in-house validation capabilities and certifications.",
    heading: "Quality Built Into Every Step",
    breadcrumbs: [["Home", "/"], ["Our Company", "/company"], ["Quality Standards", "/company/quality"]]
  },
  "/company/sustainability": {
    title: "ESG & Sustainability Strategy | Superworld Electronics",
    description: "Read about Superworld Electronics environmental, social and governance commitments, stewardship and accountability practices.",
    heading: "ESG Commitment & Sustainability Strategy",
    breadcrumbs: [["Home", "/"], ["Our Company", "/company"], ["Sustainability", "/company/sustainability"]]
  },
  "/applications": {
    title: "Electronic Component Applications | Superworld Electronics",
    description: "Explore component solutions for automotive, AI and HPC, communication, consumer, healthcare, industrial, energy and smart home applications.",
    heading: "Solutions Built Around Real Application Needs",
    breadcrumbs: [["Home", "/"], ["Applications", "/applications"]]
  },
  "/applications/automotive": {
    title: "Automotive Electronic Components | Superworld Electronics",
    description: "Find magnetic and EMC component support for automotive power, signal integrity, compact modules and in-vehicle electronic systems.",
    heading: "Reliable Components for Automotive Electronics",
    breadcrumbs: [["Home", "/"], ["Applications", "/applications"], ["Automotive", "/applications/automotive"]]
  },
  "/applications/communication": {
    title: "AI, HPC & Communication Components | Superworld Electronics",
    description: "Explore magnetic and EMC component options for AI and HPC servers, routers, set-top boxes, power conversion and data interfaces.",
    heading: "Components for AI, HPC & Emerging Tech",
    breadcrumbs: [["Home", "/"], ["Applications", "/applications"], ["AI, HPC & Emerging Tech", "/applications/communication"]]
  },
  "/products": {
    title: "Electronic Component Products | Superworld Electronics",
    description: "Browse Superworld Electronics general, automotive, EMC, magnetic, transformer and wireless power component product lines.",
    heading: "Our Products",
    breadcrumbs: [["Home", "/"], ["Products", "/products"]]
  },
  "/products/general": {
    title: "General Electronic Components | Superworld Electronics",
    description: "Explore EMC components, magnetic components, transformers and wireless power transfer products from Superworld Electronics.",
    heading: "General Components",
    breadcrumbs: [["Home", "/"], ["Products", "/products"], ["General Components", "/products/general"]]
  },
  "/products/general/emc": {
    title: "EMC Components & Noise Suppression | Superworld Electronics",
    description: "Browse chip array ferrite beads, chip inductors and ferrite bead components for EMI filtering and electrical noise suppression.",
    heading: "EMC Components",
    breadcrumbs: [["Home", "/"], ["Products", "/products"], ["General Components", "/products/general"], ["EMC Components", "/products/general/emc"]]
  },
  "/products/general/emc/a4k": {
    title: "A4K Chip Array Ferrite Bead | Superworld Electronics",
    description: "Review A4K Series chip array ferrite bead specifications, impedance options, environmental limits, packaging and support resources.",
    heading: "A4K Series Chip Array Ferrite Bead",
    breadcrumbs: [["Home", "/"], ["Products", "/products"], ["General Components", "/products/general"], ["EMC Components", "/products/general/emc"], ["A4K Series", "/products/general/emc/a4k"]]
  },
  "/tools/spec-search": {
    title: "Product Specification Search | Superworld Electronics",
    description: "Search Superworld Electronics products by category, series, specifications and part number, then add selected items to an inquiry.",
    heading: "Specification Search",
    breadcrumbs: [["Home", "/"], ["Specification Search", "/tools/spec-search"]]
  },
  "/news": {
    title: "Company & Product News | Superworld Electronics",
    description: "Read Superworld Electronics product releases, business updates, event coverage, announcements, resources and company news.",
    heading: "Superworld Electronics News",
    breadcrumbs: [["Home", "/"], ["News", "/news"]]
  },
  "/news/event-calendar": {
    title: "Electronics Events Calendar | Superworld Electronics",
    description: "View upcoming Superworld Electronics exhibitions, trade shows, event dates, locations and appointment information.",
    heading: "Event Calendar",
    breadcrumbs: [["Home", "/"], ["News", "/news"], ["Event Calendar", "/news/event-calendar"]]
  },
  "/news/radial-leaded-inductor": {
    title: "Radial-Leaded Inductor Production | Superworld Electronics",
    description: "Learn how Superworld Electronics uses automated production, inspection and reliability testing for radial-leaded inductors.",
    heading: "Radial-Leaded Inductor: Fully Automated Production Overview",
    breadcrumbs: [["Home", "/"], ["News", "/news"], ["Radial-Leaded Inductor Production", "/news/radial-leaded-inductor"]]
  },
  "/locations": {
    title: "Global Offices & Support Locations | Superworld Electronics",
    description: "Find Superworld Electronics offices, agents and distributors across Asia, Europe, the Americas and other key markets.",
    heading: "Global Presence",
    breadcrumbs: [["Home", "/"], ["Our Company", "/company"], ["Global Presence", "/locations"]]
  },
  "/support": {
    title: "Contact Product & Technical Support | Superworld Electronics",
    description: "Contact Superworld Electronics for product inquiries, quotations, technical support, quality concerns or appointments.",
    heading: "Contact Us",
    breadcrumbs: [["Home", "/"], ["Contact Us", "/support"]]
  },
  "/inquiry": {
    title: "Product Inquiry Cart | Superworld Electronics",
    description: "Review selected products and submit project, contact and quantity details to Superworld Electronics.",
    heading: "Inquiry Cart Summary",
    breadcrumbs: [["Home", "/"], ["Inquiry Cart", "/inquiry"]],
    index: false
  },
  "/thank-you": {
    title: "Inquiry Received | Superworld Electronics",
    description: "Confirmation that Superworld Electronics received a submitted product inquiry.",
    heading: "Thank You for Your Inquiry",
    breadcrumbs: [["Home", "/"], ["Inquiry Cart", "/inquiry"], ["Inquiry Received", "/thank-you"]],
    index: false
  }
};

const NOT_FOUND_METADATA = {
  title: "Page Not Found | Superworld Electronics",
  description: "The requested Superworld Electronics page could not be found.",
  heading: "Page Not Found",
  breadcrumbs: [],
  index: false
};

export const normalizePathname = (pathname) => {
  const normalized = String(pathname || "/").replace(/\/+$/, "");
  return normalized || "/";
};

export const metadataForPath = (pathname) => PAGE_METADATA[normalizePathname(pathname)] || NOT_FOUND_METADATA;

const breadcrumbData = (metadata) => metadata.breadcrumbs.length > 1 ? {
  "@type": "BreadcrumbList",
  itemListElement: metadata.breadcrumbs.map(([name, path], index) => ({
    "@type": "ListItem",
    position: index + 1,
    name,
    item: `${SITE_ORIGIN}${path}`
  }))
} : null;

export const structuredDataForPath = (pathname) => {
  const path = normalizePathname(pathname);
  const metadata = metadataForPath(path);
  const graph = [];

  if (path === "/") {
    graph.push({
      "@type": "Organization",
      "@id": `${SITE_ORIGIN}/#organization`,
      name: "Superworld Electronics (S) Pte Ltd",
      url: SITE_ORIGIN,
      logo: `${SITE_ORIGIN}/assets/logo.webp`
    }, {
      "@type": "WebSite",
      "@id": `${SITE_ORIGIN}/#website`,
      name: "Superworld Electronics",
      url: SITE_ORIGIN,
      publisher: { "@id": `${SITE_ORIGIN}/#organization` }
    });
  }

  const breadcrumb = breadcrumbData(metadata);
  if (breadcrumb) graph.push(breadcrumb);

  if (path === "/products/general/emc/a4k") {
    graph.push({
      "@type": "Product",
      name: "A4K Series Chip Array Ferrite Bead",
      description: metadata.description,
      image: `${SITE_ORIGIN}/assets/a4k-product.webp`,
      brand: { "@type": "Brand", name: "Superworld Electronics" },
      url: `${SITE_ORIGIN}${path}`
    });
  }

  if (path === "/support") {
    graph.push({
      "@type": "ContactPage",
      name: metadata.heading,
      description: metadata.description,
      url: `${SITE_ORIGIN}${path}`
    });
  }

  return graph.length ? { "@context": "https://schema.org", "@graph": graph } : null;
};

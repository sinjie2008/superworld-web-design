export const NEWS_GROUPS = Object.freeze(
  [
    { id: "latest", label: "Latest News" },
    { id: "product", label: "Product News" },
    { id: "events", label: "Events & Activities" },
    { id: "business", label: "Company News" },
    { id: "brochures", label: "Resources" },
  ].map((group) => Object.freeze(group)),
);

export const NEWS_CATEGORIES = Object.freeze(
  [
    { id: "latest", label: "Latest Product News", groupId: "product" },
    { id: "product", label: "Product Releases", groupId: "product" },
    { id: "eol", label: "End-of-Life Notices", groupId: "product" },
    { id: "events", label: "Exhibitions & Trade Shows", groupId: "events" },
    { id: "business", label: "Business Updates", groupId: "business" },
    { id: "csr", label: "Corporate Social Responsibility", groupId: "business" },
    { id: "announcements", label: "Announcements", groupId: "business" },
    { id: "brochures", label: "Brochures", groupId: "brochures" },
  ].map((category) => Object.freeze(category)),
);

export const NEWS_ARTICLES = Object.freeze(
  [
    {
      id: "radial-leaded-inductor-production-overview",
      categoryId: "latest",
      title: "Radial-Leaded Inductor: Fully Automated Production Overview",
      publishedAt: "2025-12-17",
      href: "/news/radial-leaded-inductor",
    },
    {
      id: "johor-bahru-facility-progress",
      categoryId: "business",
      title: "Our Johor Bahru facility is progressing",
      publishedAt: "2025-12-17",
      href: "/news/radial-leaded-inductor",
    },
    {
      id: "nepcon-japan-2026-recap",
      categoryId: "events",
      title: "NEPCON Japan 2026 Recap: Innovations, Insights & Trends",
      publishedAt: "2025-12-17",
      href: "/news/radial-leaded-inductor",
    },
    {
      id: "csr-program-gladiolus-place",
      categoryId: "csr",
      title: "Superworld Electronics’ CSR Program at Gladiolus Place",
      publishedAt: "2025-12-17",
      href: "/news/radial-leaded-inductor",
    },
    {
      id: "holiday-closure-notice",
      categoryId: "announcements",
      title: "Holiday closure notice",
      publishedAt: "2025-12-17",
      href: "/news/radial-leaded-inductor",
    },
    {
      id: "superworld-product-brochure",
      categoryId: "brochures",
      title: "Superworld Product Brochure",
      publishedAt: "2025-12-17",
      href: "/news/radial-leaded-inductor",
    },
    {
      id: "new-a4k-series-release",
      categoryId: "latest",
      title: "New A4K Series Release",
      publishedAt: "2025-12-17",
      href: "/news/radial-leaded-inductor",
    },
    {
      id: "regional-support-expansion",
      categoryId: "business",
      title: "Superworld Electronics expands regional support",
      publishedAt: "2025-12-17",
      href: "/news/radial-leaded-inductor",
    },
    {
      id: "molded-power-inductor-pha0301s",
      categoryId: "product",
      title: "Molded Power Inductor",
      publishedAt: "2026-04-15",
      href: "/news/radial-leaded-inductor",
      summary:
        "Low profile as low as 1mm. Capable of handling high current ratings while maintaining optimal performance in high-temperature environments.",
      sku: "PHA0301S",
      dimensions: "XXX - XXX",
      productCategory: "General",
      imageAlt: "Molded Power\nInductor",
    },
  ].map((article) => Object.freeze(article)),
);

export const NEWS_PAGE_SIZE = 8;

export function newsCategoriesForGroup(group) {
  return group === "latest"
    ? NEWS_CATEGORIES
    : NEWS_CATEGORIES.filter((category) => category.groupId === group);
}

export function newsYears(articles = NEWS_ARTICLES) {
  return [...new Set(articles.map((article) => article.publishedAt.slice(0, 4)))].sort(
    (left, right) => Number(right) - Number(left),
  );
}

function positivePage(value) {
  const text = String(value ?? "");
  const page = Number(text);
  return /^\d+$/.test(text) && Number.isSafeInteger(page) && page > 0 ? page : 1;
}

export function newsStateFromSearch(search, articles = NEWS_ARTICLES) {
  const parameters = new URLSearchParams(search);
  const category = parameters.get("category") || "latest";
  const legacyCategory = NEWS_CATEGORIES.find((item) => item.id === category);
  const group = NEWS_GROUPS.some((item) => item.id === category)
    ? category
    : legacyCategory?.groupId || "latest";
  const requestedSubcategory = parameters.has("subcategory")
    ? parameters.get("subcategory")
    : legacyCategory && !NEWS_GROUPS.some((item) => item.id === category)
      ? category
      : "";
  const subcategory = newsCategoriesForGroup(group).some(
    (item) => item.id === requestedSubcategory,
  )
    ? requestedSubcategory
    : "";
  const requestedYear = parameters.get("year") || "";

  return {
    group,
    subcategory,
    year: newsYears(articles).includes(requestedYear) ? requestedYear : "",
    query: (parameters.get("q") || "").trim(),
    page: positivePage(parameters.get("page")),
  };
}

export function queryNews(search, articles = NEWS_ARTICLES) {
  const state = newsStateFromSearch(search, articles);
  const categories = newsCategoriesForGroup(state.group);
  const query = state.query.toLowerCase();
  const matches = articles
    .map((article, index) => ({ article, index }))
    .filter(({ article }) => {
      const category = categories.find((item) => item.id === article.categoryId);
      if (!category || (state.subcategory && article.categoryId !== state.subcategory)) {
        return false;
      }
      if (state.year && !article.publishedAt.startsWith(state.year)) return false;
      const searchableText = [
        article.title,
        article.summary,
        category.label,
        article.productCategory,
        article.sku,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return !query || searchableText.includes(query);
    })
    .sort(
      (left, right) =>
        Date.parse(right.article.publishedAt) - Date.parse(left.article.publishedAt) ||
        left.index - right.index,
    );
  const total = matches.length;
  const totalPages = Math.max(1, Math.ceil(total / NEWS_PAGE_SIZE));
  const page = Math.min(state.page, totalPages);

  return {
    state: { ...state, page },
    total,
    totalPages,
    items: matches
      .slice((page - 1) * NEWS_PAGE_SIZE, page * NEWS_PAGE_SIZE)
      .map(({ article }) => article),
  };
}

export function newsUrl(search, changes = {}, { resetPage = false } = {}) {
  const parameters = new URLSearchParams(search);
  const current = newsStateFromSearch(parameters);
  const next = { ...current, ...changes };
  if (
    Object.prototype.hasOwnProperty.call(changes, "group") &&
    changes.group !== current.group &&
    !Object.prototype.hasOwnProperty.call(changes, "subcategory")
  ) {
    next.subcategory = "";
  }
  if (resetPage) next.page = 1;

  const owned = new URLSearchParams({
    category: String(next.group ?? ""),
    subcategory: String(next.subcategory ?? ""),
    year: String(next.year ?? ""),
    q: String(next.query ?? ""),
    page: String(next.page ?? ""),
  });
  const state = newsStateFromSearch(owned);
  for (const name of ["category", "subcategory", "year", "q", "page"]) {
    parameters.delete(name);
  }
  parameters.set("category", state.group);
  if (state.subcategory) parameters.set("subcategory", state.subcategory);
  if (state.year) parameters.set("year", state.year);
  if (state.query) parameters.set("q", state.query);
  if (state.page > 1) parameters.set("page", String(state.page));
  return `/news?${parameters.toString()}`;
}

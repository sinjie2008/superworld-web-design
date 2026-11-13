import { catalogMediaUrl } from "./catalog-media.js";

const categoryChildren = (node) =>
  (node?.children || []).filter((child) => child?.type === "category");

const textValue = (...values) => {
  for (const value of values) {
    const text = String(value ?? "").trim();
    if (text) return text;
  }
  return "";
};

function mark(element, path, field) {
  if (element) element.dataset.catalogContentBound = `${path}:${field}`;
}

function setText(element, value, path, field) {
  if (!element || !value) return;
  element.textContent = value;
  mark(element, path, field);
}

function setImage(element, value, alt, path, field) {
  const url = catalogMediaUrl(value);
  if (!element || !url) return;
  if (alt) element.alt = alt;
  element.removeAttribute("srcset");
  element.removeAttribute("sizes");
  element.closest("picture")?.querySelectorAll("source").forEach((source) => source.remove());
  element.src = url;
  mark(element, path, field);
  mark(element.closest(".hero-brand, .product-family-visual, .ph, .family-icon"), path, field);
}

/** Hydrate category-owned copy and imagery for product group and family routes. */
export async function hydrateCategoryContent(api, route, main, { signal, isCurrent } = {}) {
  const results = new Map();
  if (!route?.node || !["group", "family"].includes(route.type)) return results;

  const root = route.node;
  const children = categoryChildren(root);
  const targets = [root, ...children];
  if (route.type === "group") targets.push(...children.flatMap(categoryChildren));

  const uniqueTargets = [...new Map(targets.map((node) => [node.path, node])).values()];
  const settled = await Promise.allSettled(uniqueTargets.map((node) =>
    api.category(node.path, { signal })
  ));
  if (signal?.aborted || (typeof isCurrent === "function" && !isCurrent())) return results;

  uniqueTargets.forEach((node, index) => {
    const outcome = settled[index];
    results.set(node.path, outcome.status === "fulfilled"
      ? { status: "fulfilled", response: outcome.value }
      : { status: "rejected", error: outcome.reason });
  });
  const responseFor = (node) => results.get(node.path)?.response;

  const rootResponse = responseFor(root);
  const rootContent = rootResponse?.content || {};
  setText(
    main.querySelector(".hero-panel p"),
    textValue(rootContent.category_introduction),
    root.path,
    "category_introduction",
  );
  setImage(
    main.querySelector(".hero-brand img"),
    rootResponse?.media?.category_hero_image_media_id,
    textValue(rootContent.category_hero_image_alt, `${root.name} hero image`),
    root.path,
    "category_hero_image_media_id",
  );

  if (route.type === "group") {
    const sections = [...main.querySelectorAll("section.product-family")];
    children.forEach((family, index) => {
      const response = responseFor(family);
      const content = response?.content || {};
      const section = sections.find((candidate) =>
        candidate.querySelector(".section-heading h2")?.textContent.trim() === family.name
      ) || sections[index];
      if (!section) return;
      setText(
        section.querySelector(".section-heading p"),
        textValue(content.category_banner_description),
        family.path,
        "category_banner_description",
      );
      setImage(
        section.querySelector(".product-family-visual img"),
        response?.media?.category_banner_image_media_id,
        textValue(content.category_banner_image_alt, `${family.name} banner`),
        family.path,
        "category_banner_image_media_id",
      );
      const links = section.querySelectorAll(".family-icon");
      categoryChildren(family).forEach((leaf, index) => {
        const link = links[index];
        const leafResponse = responseFor(leaf);
        const icon = link?.querySelector("img");
        setImage(
          icon,
          leafResponse?.media?.category_icon_image_media_id,
          `${leaf.name} icon`,
          leaf.path,
          "category_icon_image_media_id",
        );
      });
    });
  } else {
    const sections = [...main.querySelectorAll("section.section-sm")];
    children.forEach((leaf) => {
      const response = responseFor(leaf);
      const section = sections.find((candidate) => candidate.querySelector("h2")?.textContent.trim() === leaf.name);
      if (!section) return;
      setText(
        section.querySelector(":scope > .container > p"),
        textValue(response?.content?.category_introduction),
        leaf.path,
        "category_introduction",
      );
    });
  }

  return results;
}

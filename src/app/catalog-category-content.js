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

/** Hydrate category-owned copy and imagery for product routes. */
export async function hydrateCategoryContent(api, route, main, { signal, isCurrent, cache } = {}) {
  const results = new Map();
  if (!["root", "group", "family"].includes(route?.type)) return results;

  const isActive = () => !signal?.aborted && (typeof isCurrent !== "function" || isCurrent());
  const rootIcons = new Map(
    [...main.querySelectorAll(".category-index-icon[data-category-path]")].map((element) => [element.dataset.categoryPath, element]),
  );
  const rootTargets = route.type === "root"
    ? (route.nodes || []).flatMap((group) => categoryChildren(group).flatMap(categoryChildren))
      .filter((node) => rootIcons.has(node.path))
    : [];

  const root = route.node;
  const children = categoryChildren(root);
  const targets = route.type === "root" ? rootTargets : [root, ...children];
  if (route.type === "group") targets.push(...children.flatMap(categoryChildren));

  const uniqueTargets = [...new Map(targets.map((node) => [node.path, node])).values()];
  let nextTarget = 0;
  async function loadNext() {
    while (nextTarget < uniqueTargets.length && isActive()) {
      const node = uniqueTargets[nextTarget++];
      try {
        const cached = cache?.get(node.path);
        const response = cached && Date.now() - cached.loadedAt < 15000
          ? cached.response
          : await api.category(node.path, { signal });
        if (!isActive()) return;
        if (cache && response !== cached?.response) {
          cache.delete(node.path);
          cache.set(node.path, { response, loadedAt: Date.now() });
          if (cache.size > 64) cache.delete(cache.keys().next().value);
        }
        results.set(node.path, { status: "fulfilled", response });
        const icon = rootIcons.get(node.path);
        const url = catalogMediaUrl(response?.media?.category_icon_image_media_id);
        if (icon && url) {
          const image = document.createElement("img");
          image.alt = "";
          image.addEventListener("load", () => {
            if (!isActive()) return;
            icon.replaceChildren(image);
            icon.classList.add("has-image");
            mark(icon, node.path, "category_icon_image_media_id");
          }, { once: true });
          image.src = url;
        }
      } catch (error) {
        if (isActive()) results.set(node.path, { status: "rejected", error });
      }
    }
  }
  await Promise.all(Array.from({ length: Math.min(4, uniqueTargets.length) }, loadNext));
  if (!isActive() || route.type === "root") return results;
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
        if (icon) icon.alt = "";
        setImage(
          icon,
          leafResponse?.media?.category_icon_image_media_id,
          "",
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

import { productApi } from "./product-api.js";

// These aliases are URL configuration. Names, IDs, counts and series still come from /api/tree.
export const PRODUCT_ROUTES = Object.freeze({
  general: Object.freeze({
    rootSlug: "general-products",
    families: Object.freeze({
      emc: "emc-components",
      magnetic: "magnetic-components",
      transformer: "transformer",
      "wireless-power-transfer": "wireless-power-transfer",
    }),
  }),
  automotive: Object.freeze({
    rootSlug: "automotive-products",
    families: Object.freeze({
      emc: "automotive-emc-components",
      magnetic: "automotive-magnetic-components",
      "wireless-power-transfer": "automotive-wireless-power-transfer",
    }),
  }),
});

export function matchProductRoute(pathname) {
  const segments = String(pathname).replace(/\/+$/, "").split("/").filter(Boolean);
  if (segments[0] !== "products" || segments.length > 4) return null;
  if (segments.length === 1) return { type: "root", path: "/products" };
  const group = segments[1];
  if (!PRODUCT_ROUTES[group]) return null;
  const path = `/${segments.join("/")}`;
  if (segments.length === 2) return { type: "group", group, path };
  const family = segments[2];
  if (!family) return null;
  if (segments.length === 3) return { type: "family", group, family, path };
  return { type: "series", group, family, slug: segments[3], path };
}

export function friendlySeriesSlug(slug) {
  const value = String(slug || "");
  return value.endsWith("-series") ? value.slice(0, -7) : value;
}

function familyAlias(group, apiSlug) {
  const configured = Object.entries(PRODUCT_ROUTES[group].families).find(
    ([, slug]) => slug === apiSlug,
  );
  return configured?.[0] || apiSlug;
}

function descendantSeries(node) {
  const result = [];
  function visit(current) {
    if (current.type === "series") result.push(current);
    else (current.children || []).forEach(visit);
  }
  visit(node);
  return result;
}

export function buildCatalogIndex(tree) {
  if (!Array.isArray(tree)) throw new Error("Invalid product hierarchy.");
  const groups = new Map();
  const families = new Map();
  const series = new Map();
  const routeByPath = new Map();
  const collisions = new Map();

  Object.entries(PRODUCT_ROUTES).forEach(([groupAlias, config]) => {
    const root = tree.find((node) => node.slug === config.rootSlug);
    if (!root || root.type !== "category") return;
    const groupUrl = `/products/${groupAlias}`;
    groups.set(groupUrl, root);
    (root.children || []).forEach((family) => {
      if (family.type !== "category") return;
      const familyUrl = `${groupUrl}/${familyAlias(groupAlias, family.slug)}`;
      families.set(familyUrl, family);
      const nodes = descendantSeries(family);
      const counts = new Map();
      nodes.forEach((node) => {
        const base = friendlySeriesSlug(node.slug);
        counts.set(base, (counts.get(base) || 0) + 1);
      });
      const occupied = new Set(counts.keys());
      nodes.forEach((node) => {
        const base = friendlySeriesSlug(node.slug);
        let routeSlug = base;
        if (counts.get(base) > 1) {
          routeSlug = `${base}--id-${node.id}`;
          while (occupied.has(routeSlug)) routeSlug += `-${node.id}`;
          occupied.add(routeSlug);
          const ambiguousUrl = `${familyUrl}/${encodeURIComponent(base)}`;
          collisions.set(ambiguousUrl, (collisions.get(ambiguousUrl) || 0) + 1);
        }
        const url = `${familyUrl}/${encodeURIComponent(routeSlug)}`;
        if (series.has(url) || routeByPath.has(node.path))
          throw new Error(`Duplicate product series route: ${url}`);
        series.set(url, node);
        routeByPath.set(node.path, url);
      });
    });
  });
  return { tree, groups, families, series, routeByPath, collisions };
}

export function resolveCatalogRoute(index, pathname) {
  const match = matchProductRoute(pathname);
  if (!match) return null;
  if (match.type === "root") return { ...match, nodes: index.tree };
  if (match.type === "group") return { ...match, node: index.groups.get(match.path) || null };
  if (match.type === "family") return { ...match, node: index.families.get(match.path) || null };
  return {
    ...match,
    node: index.series.get(match.path) || null,
    ambiguous: index.collisions.has(match.path),
  };
}

export function seriesUrl(index, apiPath) {
  return index.routeByPath.get(apiPath) || null;
}

export class CatalogTreeStore {
  constructor(api = productApi, maxAgeMs = 15000) {
    this.api = api;
    this.maxAgeMs = maxAgeMs;
    this.index = null;
    this.loadedAt = 0;
    this.pending = null;
  }

  async load() {
    if (this.index && Date.now() - this.loadedAt < this.maxAgeMs) return this.index;
    if (!this.pending) {
      this.pending = this.api
        .tree()
        .then((tree) => {
          this.index = buildCatalogIndex(tree);
          this.loadedAt = Date.now();
          return this.index;
        })
        .finally(() => {
          this.pending = null;
        });
    }
    return this.pending;
  }
}

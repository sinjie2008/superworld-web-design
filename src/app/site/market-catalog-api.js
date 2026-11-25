import { publishedSeriesPaths } from "./market-data.js";

export const marketCatalogPrefix = "/api/application-catalog/";

const json = (body, status = 200) => Response.json(body, { status });
const unavailable = (status) => json({ success: false }, status);

function mediaUrl(value, base) {
  if (typeof value !== "string" || !value.startsWith("/api/media/public.php?")) return null;
  const media = new URL("media/public.php", base);
  const path = new URL(value, base).searchParams.get("path");
  if (!path) return null;
  media.searchParams.set("path", path);
  return "/api/media/public.php?" + media.searchParams.toString();
}

function partSample(part) {
  if (!part?.sku) return null;
  const dimensions = ["acf.length", "acf.width", "acf.height"].map((key) => {
    const value = String(part.values?.[key] ?? "");
    return /^\d+(?:\.\d+)?$/.test(value) && Number(value) > 0 ? value : null;
  });
  return {
    sku: part.sku,
    dimensions: dimensions.every(Boolean) ? dimensions : null,
  };
}

export class MarketCatalogApi {
  async searchSelection(resource, breadcrumb, base) {
    const rootId = breadcrumb?.[0]?.id;
    if (!Number.isInteger(rootId) || !Number.isInteger(resource.parentId)) return null;
    const response = await fetch(new URL("tree", base), {
      headers: { accept: "application/json" }, signal: AbortSignal.timeout(6000),
    });
    if (!response.ok) return null;
    const payload = await response.json();
    if (!payload.success || !Array.isArray(payload.data)) return null;
    const flatten = items => items.flatMap(item => [item, ...flatten(item.children || [])]);
    const matches = flatten(payload.data).filter(item => item.type === "series" &&
      item.parentId === resource.parentId && item.name === resource.name);
    if (matches.length !== 1 || matches[0].id !== resource.id) return null;
    return { rootId, categoryId: resource.parentId, series: resource.name };
  }

  async handle(request, apiBase) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response(null, { status: 405, headers: { allow: "GET, HEAD" } });
    }
    const url = new URL(request.url);
    const segments = url.pathname.slice(marketCatalogPrefix.length).split("/");
    if (segments.shift() !== "series") return unavailable(404);
    const sample = segments[segments.length - 1] === "parts";
    if (sample) segments.pop();
    const path = segments.join("/");
    if (!publishedSeriesPaths.has(path)) return unavailable(404);
    if (!apiBase) return unavailable(503);

    try {
      const base = new URL(apiBase);
      if (!["http:", "https:"].includes(base.protocol) || base.username || base.password) {
        return unavailable(503);
      }
      base.pathname = base.pathname.replace(/\/?$/, "/");
      const upstream = new URL("series/" + segments.map(encodeURIComponent).join("/"), base);
      if (sample) {
        upstream.pathname += "/parts";
        upstream.searchParams.set("per_page", "1");
      }
      const response = await fetch(upstream, {
        headers: { accept: "application/json" },
        redirect: "error",
        signal: AbortSignal.timeout(6000),
      });
      if (!response.ok) return unavailable(response.status === 404 ? 404 : 502);
      const payload = await response.json();
      const data = payload?.data;
      const resource = sample ? data?.series : data?.resource;
      if (!payload.success || resource?.type !== "series" || resource.path !== path) {
        return unavailable(502);
      }

      const output = sample
        ? partSample(data.parts?.[0])
        : {
            name: resource.name,
            image: mediaUrl(data.media?.series_product_image, base),
            datasheet: mediaUrl(data.media?.series_product_spec, base),
            search: await this.searchSelection(resource, data.breadcrumb, base).catch(() => null),
          };
      if (request.method === "HEAD") return new Response(null);
      return json({ success: true, data: output });
    } catch {
      return unavailable(502);
    }
  }
}

import { catalogMediaUrl } from "../../catalog-media.js";

const publicMediaEndpoint = "/api/media/public.php";
const storageMediaPrefix = "/storage/media/";
const storageAliasPrefix = storageMediaPrefix + "__library__/";

export const specSearchImageFallback =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Crect width='80' height='80' fill='%23f4f4f4'/%3E%3Crect x='12' y='12' width='56' height='56' rx='2' fill='none' stroke='%23b8b8b8' stroke-width='2'/%3E%3Ccircle cx='29' cy='30' r='5' fill='%23b8b8b8'/%3E%3Cpath d='M17 60 35 41l10 10 8-8 10 17Z' fill='%23b8b8b8'/%3E%3C/svg%3E";

function storageAliasUrl(url) {
  if (url.search) return null;
  try {
    const alias = decodeURIComponent(url.pathname.slice(storageMediaPrefix.length));
    return catalogMediaUrl(publicMediaEndpoint + "?path=" + encodeURIComponent(alias));
  } catch {
    return null;
  }
}

/** Resolve public Series media and legacy catalog paths to a safe URL. */
export function specSearchMediaUrl(
  value,
  baseUrl = globalThis.location?.href || "http://localhost/",
) {
  if (typeof value !== "string" || /[\\\u0000-\u001f\u007f]/.test(value)) return null;
  const input = value.trim()
    .replace(/^\.\/(?=[^/])/, "")
    .replace(/^\.\.\/(?=storage\/)/, "/");
  const path = input.split(/[?#]/, 1)[0];
  if (!path || /(?:^|\/)(?:\.|%2e){1,2}(?:\/|$)/i.test(path)) return null;

  let url;
  let origin;
  try {
    origin = new URL("/", baseUrl);
    url = new URL(input, origin);
  } catch {
    return null;
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") return null;
  if (url.username || url.password) return null;

  if (url.origin !== origin.origin || url.pathname.startsWith("//")) return url.href;
  if (url.pathname === publicMediaEndpoint) return catalogMediaUrl(url.pathname + url.search);
  if (url.pathname.startsWith(storageAliasPrefix)) return storageAliasUrl(url);
  return url.pathname + url.search + url.hash;
}

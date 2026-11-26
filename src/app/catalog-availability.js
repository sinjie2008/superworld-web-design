import { catalogMediaUrl } from "./catalog-media.js";

const PLACEHOLDER = /^(?:[-–—−?\s/]+|\[\s*\]|\{\s*\}|#?n\s*[./]?\s*a\.?|none|null|undefined|unknown|tbd|n[./]?d\.?|not (?:applicable|available|provided|specified|supported|tested)|unavailable|see (?:the )?datasheet)\.?$/i;
const MEDIA_TYPES = {
  image: /^(?:image\/(?:png|jpeg|gif|webp|avif|bmp))$/i,
  pdf: /^application\/pdf$/i,
  glb: /^(?:model\/gltf-binary|application\/octet-stream)$/i,
};
const MEDIA_EXTENSIONS = {
  image: /\.(?:png|jpe?g|gif|webp|avif|bmp)$/i,
  pdf: /\.pdf$/i,
  glb: /\.glb$/i,
};

export function meaningfulText(value) {
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : null;
  if (typeof value !== "string") return null;
  const text = value.replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  return text && !PLACEHOLDER.test(text) ? text : null;
}

export function catalogValueState(value) {
  if (value == null) return "missing";
  if (typeof value === "string") return meaningfulText(value) === null ? "missing" : "available";
  if (typeof value === "boolean") return "available";
  if (typeof value === "number") return Number.isFinite(value) ? "available" : "invalid";
  if (typeof value !== "object") return "invalid";
  const states = Object.values(value).map(catalogValueState);
  if (states.includes("available")) return "available";
  return states.includes("invalid") ? "invalid" : "missing";
}

export function seriesMediaAsset(reference, kind, details) {
  const url = catalogMediaUrl(reference);
  if (!url || !MEDIA_TYPES[kind] || details === null) return null;
  const alias = new URLSearchParams(url.split("?")[1]).get("path");
  const storedName = alias.split("/").at(-1);
  const mimeType = meaningfulText(details?.mimeType);
  if (mimeType ? !MEDIA_TYPES[kind].test(mimeType) : !MEDIA_EXTENSIONS[kind].test(storedName))
    return null;
  if (kind === "glb" && !MEDIA_EXTENSIONS.glb.test(storedName)) return null;
  const label = meaningfulText(details?.filename);
  let filename = label && !/[/\\\u0000-\u001f\u007f]/.test(label) ? label : storedName;
  if (kind !== "image" && !MEDIA_EXTENSIONS[kind].test(filename))
    filename = filename.replace(/\.[^.]+$/, "") + "." + kind;
  return {
    url,
    kind,
    filename,
    alt: meaningfulText(details?.alt),
    width: details?.width,
    height: details?.height,
  };
}

export function matchesSeriesMediaType(contentType, kind) {
  return MEDIA_TYPES[kind]?.test(contentType?.split(";")[0].trim()) === true;
}

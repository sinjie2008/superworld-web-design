import { matchesSeriesMediaType, seriesMediaAsset } from "./catalog-availability.js";

export function mediaFrom(source, key, kind) {
  if (!source?.media) return null;
  if ("mediaDetails" in source && !source.mediaDetails?.[key]) return null;
  return seriesMediaAsset(source.media[key], kind, source.mediaDetails?.[key]);
}

export function primaryMedia(detail, summary, key, kind) {
  if (summary?.mediaStatus && Object.hasOwn(summary.mediaStatus, key))
    return summary.mediaStatus[key] === "available" ? mediaFrom(summary, key, kind) : null;
  return mediaFrom(detail, key, kind);
}

export function imageNode(asset, alt, { lazy = true, signal, onError }) {
  const image = document.createElement("img");
  image.alt = asset.alt || alt;
  image.loading = lazy ? "lazy" : "eager";
  for (const dimension of ["width", "height"]) {
    const size = Number(asset[dimension]);
    if (Number.isInteger(size) && size > 0 && size <= 10000) image[dimension] = size;
  }
  image.addEventListener("error", onError, { once: true, signal });
  image.src = asset.url;
  return image;
}

export function mediaPanels({ image, model, name, signal, onEmpty }) {
  if (!image && !model) return null;
  const root = document.createElement("div");
  root.className = "a4k-product-media";
  const toggle = document.createElement("div");
  toggle.className = "a4k-media-toggle";
  toggle.setAttribute("role", "group");
  toggle.setAttribute("aria-label", "Product media view");
  const items = new Map();
  let active;

  function remove(kind) {
    const item = items.get(kind);
    if (!item || signal?.aborted) return;
    const movedFocus = toggle.contains(document.activeElement) || item.panel.contains(document.activeElement);
    items.delete(kind);
    item.panel.remove();
    item.button.remove();
    if (items.size < 2) toggle.remove();
    if (active === kind && items.size) activate(items.keys().next().value);
    if (movedFocus) items.get(active)?.panel.focus({ preventScroll: true });
    if (!items.size) {
      root.remove();
      onEmpty();
    }
  }

  function activate(kind) {
    active = kind;
    for (const [type, { panel, button }] of items) {
      const selected = type === kind;
      panel.hidden = !selected;
      panel.classList.toggle("is-active", selected);
      button.classList.toggle("is-active", selected);
      button.setAttribute("aria-pressed", String(selected));
    }
    if (kind !== "3d") return;
    const { panel } = items.get(kind);
    if (panel.childElementCount) return;
    const status = document.createElement("p");
    status.setAttribute("role", "status");
    status.textContent = "Loading 3D model…";
    panel.append(status);

    const moduleUrl = new URL("/series-model-viewer.js?v=4.4.0", location.origin);
    import(moduleUrl.href).then(() => {
      if (signal?.aborted || !panel.isConnected) return;
      const viewer = document.createElement("model-viewer");
      viewer.setAttribute("alt", name + " 3D model");
      viewer.setAttribute("camera-controls", "");
      viewer.setAttribute("loading", "eager");
      viewer.setAttribute("touch-action", "pan-y");
      viewer.setAttribute("aria-busy", "true");
      viewer.addEventListener("load", () => viewer.removeAttribute("aria-busy"), { once: true, signal });
      viewer.addEventListener("error", () => remove(kind), { once: true, signal });
      viewer.setAttribute("src", model.url);
      panel.replaceChildren(viewer);
    }).catch(() => remove(kind));
  }

  function addPanel(kind, label, key) {
    const panel = document.createElement("div");
    panel.className = "a4k-media-panel";
    panel.id = "series-media-" + kind;
    panel.dataset.a4kPanel = kind;
    panel.dataset.catalogContentBound = key;
    panel.tabIndex = -1;
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.dataset.a4kMedia = kind;
    button.setAttribute("aria-controls", panel.id);
    button.addEventListener("click", () => activate(kind), { signal });
    toggle.append(button);
    root.append(panel);
    items.set(kind, { panel, button });
    return panel;
  }

  if (image) addPanel("image", "Image", "series_product_image").append(
    imageNode(image, name + " product image", { lazy: false, signal, onError: () => remove("image") }),
  );
  if (model) addPanel("3d", "3D View", "series_model_3d");
  if (items.size > 1) root.prepend(toggle);
  activate(image ? "image" : "3d");
  return root;
}

export function bindSeriesDownload(link, asset, { signal, onError }) {
  link.href = asset.url;
  link.download = asset.filename;
  link.addEventListener("click", async (event) => {
    if (event.defaultPrevented || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (link.hasAttribute("aria-busy")) return;
    link.setAttribute("aria-busy", "true");
    try {
      const response = await fetch(asset.url, { credentials: "same-origin", signal });
      const unavailable = [403, 404, 410].includes(response.status) ||
        (response.ok && !matchesSeriesMediaType(response.headers.get("Content-Type"), asset.kind));
      if (!response.ok || unavailable) {
        await response.body?.cancel();
        if (!signal?.aborted) onError?.(unavailable);
        return;
      }
      const file = await response.blob();
      if (signal?.aborted) return;
      if (!file.size) {
        onError?.(true);
        return;
      }
      const url = URL.createObjectURL(file);
      const download = document.createElement("a");
      download.href = url;
      download.download = asset.filename;
      document.body.append(download);
      download.click();
      download.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      if (!signal?.aborted) onError?.(false);
    } finally {
      link.removeAttribute("aria-busy");
    }
  }, { signal });
}

import { initComponents } from "./parts-table.js";

let started = false;
let observer = null;
const hookedFrontends = new WeakSet();

function registerElementor(doc) {
  const win = doc.defaultView;
  const frontend = win?.elementorFrontend;
  if (!frontend?.hooks?.addAction || hookedFrontends.has(frontend)) return;
  hookedFrontends.add(frontend);
  frontend.hooks.addAction("frontend/element_ready/global", (scopeElement) => {
    const element = scopeElement?.[0] || scopeElement;
    if (element?.querySelectorAll || element?.matches) initComponents(element);
  });
}

export function startPartsTables(scope = globalThis.document) {
  if (!scope) return [];
  const instances = initComponents(scope);
  if (!started && scope.nodeType === 9) {
    started = true;
    const doc = scope;
    const Observer = doc.defaultView?.MutationObserver;
    if (Observer && doc.documentElement) {
      observer = new Observer((records) => {
        for (const record of records) {
          for (const node of record.addedNodes) {
            if (node.nodeType === 1) initComponents(node);
          }
        }
      });
      observer.observe(doc.documentElement, { childList: true, subtree: true });
    }
    registerElementor(doc);
    const win = doc.defaultView;
    const onElementorInit = () => {
      registerElementor(doc);
      initComponents(doc);
    };
    if (win?.jQuery) win.jQuery(win).on("elementor/frontend/init", onElementorInit);
    else win?.addEventListener("elementor/frontend/init", onElementorInit, { once: true });
  }
  return instances;
}

if (globalThis.document) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => startPartsTables(document), { once: true });
  } else {
    startPartsTables(document);
  }
}

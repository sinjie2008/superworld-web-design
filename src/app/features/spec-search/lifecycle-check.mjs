import assert from "node:assert/strict";

import { SpecificationSearchEvents } from "./events.js";
import { SpecificationSearchRenderer } from "./render.js";
import { SpecificationSearchRequests } from "./requests.js";
import { SpecificationSearchState } from "./state.js";

globalThis.window = {
  location: { search: "", href: "http://localhost/" },
  history: { replaceState() {} },
  fetch: async () => {},
};
globalThis.document = { getElementById: () => null };

const { SpecificationSearchApplication } = await import("./app.js");

assert.equal(Object.isFrozen(window.SpecSearchApp), true);
assert.deepEqual(Object.keys(window.SpecSearchApp).sort(), [
  "getConfig",
  "getState",
  "initialize",
]);
assert.equal("destroy" in window.SpecSearchApp, false);

class FakeTarget {
  constructor() {
    this.listeners = new Map();
    this.value = "";
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? new Set();
    listeners.add(listener);
    this.listeners.set(type, listeners);
  }

  removeEventListener(type, listener) {
    this.listeners.get(type)?.delete(listener);
  }

  listenerCount() {
    return Array.from(this.listeners.values()).reduce(
      (count, listeners) => count + listeners.size,
      0,
    );
  }
}

const state = new SpecificationSearchState();
const allTargets = [];
const dom = {
  cache() {
    [
      "clear-filters",
      "table-search",
      "table-search-submit",
      "inquiry-button",
      "page-size",
    ].forEach((id) => {
      this[id] = new FakeTarget();
      allTargets.push(this[id]);
    });
  },
  invalidate() {
    this.invalidated = true;
  },
};
const query = {
  setInitialSelection() {},
  sync() {},
  buildInquiryUrl: () => "/inquiry",
};
const renderer = {
  renderSelectedFilters() {},
  renderFacets() {},
  renderTable() {},
  destroy() {},
};
const requests = {
  active: false,
  destroy() {
    this.active = false;
  },
  loadRoots() {
    this.active = true;
  },
  loadProducts() {},
};
const windowObject = { location: { search: "", href: "http://localhost/" } };
const events = new SpecificationSearchEvents(
  state,
  dom,
  query,
  renderer,
  requests,
  windowObject,
);
const application = new SpecificationSearchApplication({
  config: {},
  window: windowObject,
  document: { getElementById: () => ({}) },
  state,
  dom,
  query,
  provider: {},
  dataService: {},
  renderer,
  requests,
  events,
});
const activeListenerCount = () =>
  allTargets.reduce((count, target) => count + target.listenerCount(), 0);

application.initialize();
assert.equal(activeListenerCount(), 5);
assert.equal(requests.active, true);

application.initialize();
assert.equal(activeListenerCount(), 5);
assert.equal(requests.active, true);

application.document.getElementById = () => null;
application.initialize();
assert.equal(activeListenerCount(), 0);
assert.equal(requests.active, false);
assert.equal(dom.invalidated, true);

application.document.getElementById = () => ({});
application.initialize();
assert.equal(activeListenerCount(), 5);
application.destroy();
assert.equal(activeListenerCount(), 0);

const renderedListeners = new SpecificationSearchRenderer({}, {}, {}, {});
const renderedSignal = renderedListeners.listenerSignal("table");
renderedListeners.destroy();
assert.equal(renderedSignal.aborted, true);

{
  let requestSignal;
  const pendingRequest = new SpecificationSearchRequests(
    new SpecificationSearchState(),
    {
      getRootCategories({ signal }) {
        requestSignal = signal;
        return new Promise((resolve, reject) =>
          signal.addEventListener(
            "abort",
            () => reject(new DOMException("Request aborted", "AbortError")),
            { once: true },
          ),
        );
      },
    },
    { initialSelection: {} },
    { setStatus() {} },
    { defaultRootId: 1 },
  );
  const load = pendingRequest.loadRoots();
  pendingRequest.destroy();
  await load;
  assert.equal(requestSignal.aborted, true);
}

console.log("Spec Search lifecycle check passed");

delete globalThis.window;
delete globalThis.document;

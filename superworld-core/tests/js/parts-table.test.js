import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { PartsTable, destroyComponents, initComponents } from "../../assets/js/parts-table.js";
import { startPartsTables } from "../../assets/js/index.js";

const markup = (path = "general/emc/ax-10") => `
  <section data-sw-parts data-rest-url="/wp-json/superworld/v1/parts" data-path="${path}"
    data-inquiry-url="/inquiry" data-page="1" data-last-page="2" data-total="2" data-per-page="10">
    <form data-sw-search-form>
      <input name="search" value="">
      <select name="per_page"><option value="10" selected>10</option><option value="25">25</option></select>
      <select data-sw-filter data-field="values.voltage"><option value="">All</option><option value="48">48</option></select>
      <button type="submit">Search</button>
    </form>
    <table data-sw-table><thead><tr><th>Select</th><th>SKU</th><th>Product</th></tr></thead>
      <tbody><tr><td><input type="checkbox" data-sw-select data-id="1" data-sku="P-1" data-name="Initial"></td><td>P-1</td><td>Initial</td></tr></tbody></table>
    <p data-sw-summary aria-live="polite">Initial parts</p>
    <button data-sw-prev type="button">Previous</button><button data-sw-next type="button">Next</button>
    <a data-sw-inquiry href="/inquiry">Inquire</a><span data-sw-selected-count>0</span>
  </section>`;

function page(part, page = 1, total = 2) {
  return {
    series: { path: "general/emc/ax-10" },
    fields: [{ key: "values.voltage", label: "Rated voltage" }],
    parts: [part],
    pagination: { page, per_page: 10, total, last_page: total > 10 ? 2 : 1 },
  };
}

function setup(html = markup()) {
  const dom = new JSDOM(`<main>${html}</main>`, { url: "https://example.test/catalog" });
  const root = dom.window.document.querySelector("[data-sw-parts]");
  return { dom, root };
}

function submit(dom, root) {
  root.querySelector("form").dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
}

test("init is idempotent, does not fetch initial server-rendered content, and destroy removes listeners", async () => {
  const { dom, root } = setup();
  let calls = 0;
  dom.window.fetch = async () => { calls += 1; return { ok: true, json: async () => page({ id: 1 }) }; };
  const [first] = initComponents(root);
  assert.equal(initComponents(root)[0], first);
  assert.equal(calls, 0);
  destroyComponents(root);
  submit(dom, root);
  await Promise.resolve();
  assert.equal(calls, 0);
  dom.window.close();
});

test("instances build isolated requests with exact path, search, page size, and filter keys", async () => {
  const { dom, root } = setup(markup());
  const otherRoot = dom.window.document.createElement("div");
  otherRoot.innerHTML = markup("automotive/power/ax-20");
  const second = otherRoot.firstElementChild;
  dom.window.document.querySelector("main").append(second);
  const calls = [];
  const fetcher = async (url) => {
    calls.push(new URL(url));
    return { ok: true, json: async () => page({ id: calls.length, sku: `SKU-${calls.length}`, name: "Item", values: {} }) };
  };
  const first = new PartsTable(root, { fetch: fetcher });
  const secondTable = new PartsTable(second, { fetch: fetcher });
  root.querySelector('[name="search"]').value = "part 7";
  root.querySelector('[data-sw-filter]').value = "48";
  submit(dom, root);
  submit(dom, second);
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(calls.length, 2);
  assert.equal(calls[0].searchParams.get("path"), "general/emc/ax-10");
  assert.equal(calls[0].searchParams.get("search"), "part 7");
  assert.equal(calls[0].searchParams.get("filter[values.voltage]"), "48");
  assert.equal(calls[0].searchParams.get("page"), "1");
  assert.equal(calls[1].searchParams.get("path"), "automotive/power/ax-20");
  assert.equal(calls[1].searchParams.get("search"), "");
  first.destroy();
  secondTable.destroy();
  dom.window.close();
});

test("multi-select facets use PHP array query syntax and preserve dotted field keys", async () => {
  const { dom, root } = setup();
  const facet = root.querySelector("[data-sw-filter]");
  facet.multiple = true;
  facet.options[1].selected = true;
  facet.add(new dom.window.Option("60", "60", false, true));
  let requestUrl;
  const table = new PartsTable(root, { fetch: async (url) => {
    requestUrl = new URL(url);
    return { ok: true, json: async () => page({ id: 5, sku: "P-5", name: "Part 5", values: {} }) };
  } });
  facet.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.deepEqual(requestUrl.searchParams.getAll("filter[values.voltage][]"), ["48", "60"]);
  table.destroy();
  dom.window.close();
});

test("a newer request aborts and supersedes an older response", async () => {
  const { dom, root } = setup();
  const pending = [];
  const table = new PartsTable(root, { fetch: (url, options) => new Promise((resolve) => pending.push({ resolve, signal: options.signal })) });
  const oldRequest = table.load(1);
  const newRequest = table.load(2);
  assert.equal(pending[0].signal.aborted, true);
  pending[1].resolve({ ok: true, json: async () => page({ id: 2, sku: "NEW", name: "Newest", values: { "values.voltage": "48" } }, 2, 20) });
  await newRequest;
  pending[0].resolve({ ok: true, json: async () => page({ id: 1, sku: "OLD", name: "Old", values: {} }, 1, 20) });
  await oldRequest;
  assert.match(root.querySelector("tbody").textContent, /Newest/);
  assert.doesNotMatch(root.querySelector("tbody").textContent, /Old/);
  table.destroy();
  dom.window.close();
});

test("changing page size reloads the first page with the selected size", async () => {
  const { dom, root } = setup();
  let requestUrl;
  const table = new PartsTable(root, { fetch: async (url) => {
    requestUrl = new URL(url);
    return { ok: true, json: async () => page({ id: 9, sku: "P-9", name: "Part 9", values: {} }) };
  } });
  table.page = 2;
  const select = root.querySelector('[name="per_page"]');
  select.value = "25";
  select.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(requestUrl.searchParams.get("page"), "1");
  assert.equal(requestUrl.searchParams.get("per_page"), "25");
  table.destroy();
  dom.window.close();
});

test("selection survives pagination and builds repeated inquiry and SKU parameters", async () => {
  const { dom, root } = setup();
  let call = 0;
  const table = new PartsTable(root, { fetch: async () => ({ ok: true, json: async () => {
    call += 1;
    return call === 1
      ? page({ id: 41, sku: "P-41", name: "Part 41", values: { "values.voltage": "48" } }, 1, 20)
      : page({ id: 42, sku: "P-42", name: "Part 42", values: { "values.voltage": "60" } }, 2, 20);
  } }) });
  await table.load(1);
  assert.deepEqual([...root.querySelectorAll("thead th")].map((cell) => cell.textContent), ["Select", "SKU", "Product", "Rated voltage"]);
  assert.deepEqual([...root.querySelector("tbody tr").cells].map((cell) => cell.textContent.trim()), ["", "P-41", "Part 41", "48"]);
  const firstCheckbox = root.querySelector("[data-sw-select]");
  firstCheckbox.checked = true;
  firstCheckbox.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  await table.load(2);
  assert.equal(root.querySelector("[data-sw-selected-count]").textContent, "1");
  const secondCheckbox = root.querySelector("[data-sw-select]");
  secondCheckbox.checked = true;
  secondCheckbox.dispatchEvent(new dom.window.Event("change", { bubbles: true }));
  const inquiry = new URL(root.querySelector("[data-sw-inquiry]").href);
  assert.deepEqual(inquiry.searchParams.getAll("inquiry"), ["41", "42"]);
  assert.deepEqual(inquiry.searchParams.getAll("sku"), ["P-41", "P-42"]);
  assert.equal(inquiry.searchParams.get("series"), "general/emc/ax-10");
  table.destroy();
  dom.window.close();
});

test("remote labels and values are inserted as text and errors stay URL-free", async () => {
  const { dom, root } = setup();
  const table = new PartsTable(root, { fetch: async () => ({ ok: true, json: async () => ({
    fields: [{ key: "x", label: '<img src=x onerror="alert(1)">' }],
    parts: [{ id: 7, sku: "<script>bad</script>", name: "<b>Unsafe</b>", values: { x: "<svg onload=bad>" } }],
    pagination: { page: 1, per_page: 10, total: 1, last_page: 1 },
  }) }) });
  await table.load(1);
  assert.equal(root.querySelector("thead img"), null);
  assert.equal(root.querySelector("tbody script"), null);
  assert.equal(root.querySelector("tbody tr").textContent.includes("<svg onload=bad>"), true);
  const retainedRow = root.querySelector("tbody tr");
  table.fetch = async () => ({ ok: true, json: async () => ({ parts: [] }) });
  await table.load(1);
  assert.equal(root.querySelector("tbody tr"), retainedRow);
  assert.equal(root.querySelector("[data-sw-summary]").textContent, "Unable to load parts. Please try again.");
  table.fetch = async () => { throw new Error("https://secret.example/path"); };
  await table.load(1);
  assert.equal(root.querySelector("[data-sw-summary]").textContent, "Unable to load parts. Please try again.");
  assert.doesNotMatch(root.querySelector("[data-sw-summary]").textContent, /https?:/);
  table.destroy();
  dom.window.close();
});

test("detached roots are cleaned up by the observer", async () => {
  const { dom, root } = setup();
  const table = initComponents(root)[0];
  root.remove();
  await new Promise((resolve) => dom.window.setTimeout(resolve, 0));
  assert.equal(table.destroyed, true);
  dom.window.close();
});

test("replacing a root destroys its instance and initializes the replacement once", async () => {
  const { dom, root } = setup();
  const [original] = startPartsTables(dom.window.document);
  let calls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    calls += 1;
    return { ok: true, json: async () => page({ id: 11, sku: "P-11", name: "Part 11", values: {} }) };
  };
  const replacementHost = dom.window.document.createElement("div");
  replacementHost.innerHTML = markup("general/emc/ax-11");
  const replacement = replacementHost.firstElementChild;
  root.replaceWith(replacement);
  await new Promise((resolve) => dom.window.setTimeout(resolve, 0));
  assert.equal(original.destroyed, true);
  try {
    submit(dom, replacement);
    await new Promise((resolve) => dom.window.setTimeout(resolve, 0));
    assert.equal(calls, 1);
    assert.match(replacement.querySelector("tbody").textContent, /Part 11/);
    assert.equal(startPartsTables(replacement)[0], initComponents(replacement)[0]);
  } finally {
    globalThis.fetch = originalFetch;
    dom.window.close();
  }
});

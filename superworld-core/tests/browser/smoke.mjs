import assert from "node:assert/strict";
import { chromium } from "playwright-core";

const targetUrl = process.env.SW_WP_TEST_URL;
if (!targetUrl) throw new Error("Set SW_WP_TEST_URL to the actual disposable WordPress page URL.");

const browser = await chromium.launch({
  executablePath: process.env.SW_CHROMIUM || "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const failures = [];
const observations = { pageErrors: [], consoleErrors: [], failedResponses: [], restRequests: [], viewports: [], components: [] };

try {
  const page = await browser.newPage();
  page.on("pageerror", (error) => observations.pageErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") observations.consoleErrors.push(message.text());
  });
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname.includes("/superworld/v1/parts") || url.searchParams.get("rest_route")?.endsWith("/superworld/v1/parts")) {
      observations.restRequests.push(request.url());
    }
  });
  page.on("response", (response) => {
    if (response.status() >= 400) observations.failedResponses.push({ status: response.status(), url: response.url() });
  });
  const response = await page.goto(targetUrl, { waitUntil: "networkidle", timeout: 45000 });
  assert(response?.ok(), `Page returned HTTP ${response?.status() ?? "no response"}.`);
  await page.locator("[data-sw-parts]").first().waitFor({ state: "visible", timeout: 20000 });
  const componentCount = await page.locator("[data-sw-parts]").count();
  assert(componentCount >= 2, `Expected at least two parts components, found ${componentCount}.`);

  const roots = page.locator("[data-sw-parts]");
  observations.components = await roots.evaluateAll((elements) => elements.map((root) => ({
    path: root.dataset.path,
    initialRows: root.querySelectorAll("tbody tr").length,
    headings: [...root.querySelectorAll("thead th")].map((cell) => cell.textContent.trim()),
    initialSummary: root.querySelector("[data-sw-summary]")?.textContent.trim(),
    font: getComputedStyle(root).fontFamily,
  })));

  const first = roots.nth(0);
  const second = roots.nth(1);
  const secondBefore = await second.locator('tbody').innerText();
  const isPartsResponse = (response) => {
    const url = new URL(response.url());
    return url.pathname.endsWith('/superworld/v1/parts') || url.searchParams.get('rest_route')?.endsWith('/superworld/v1/parts');
  };
  const act = async (action, label) => {
    const pending = page.waitForResponse(isPartsResponse, { timeout: 20000 });
    await action();
    const response = await pending;
    assert.equal(response.status(), 200, label);
    const data = await response.json();
    await page.waitForFunction((root) => !root.querySelector('tbody').hasAttribute('aria-busy'), await first.elementHandle());
    return data;
  };
  const search = first.locator('[name="search"]');
  const select = first.locator('[data-sw-select]').first();
  const initialSku = await select.getAttribute('data-sku');
  await select.check();
  assert.equal(await first.locator("[data-sw-selected-count]").textContent(), "1");
  assert.equal(await second.locator("[data-sw-selected-count]").textContent(), "0", "Selection leaked between component instances.");
  assert.equal(await first.locator('[data-sw-inquiry]').getAttribute("aria-disabled"), "false");

  const next = first.locator('[data-sw-next]');
  assert(await next.isEnabled(), 'The smoke fixture must contain a second page.');
  const pageTwo = await act(() => next.click(), 'page two request');
  assert.equal(pageTwo.pagination.page, 2);
  assert.notEqual(pageTwo.parts[0].sku, initialSku);
  await first.locator('[data-sw-select]').first().check();
  assert.equal(await first.locator('[data-sw-selected-count]').textContent(), '2');
  await act(() => first.locator('[data-sw-prev]').click(), 'previous page request');
  assert(await first.locator('[data-sw-select]').first().isChecked(), 'Selection was lost across pages.');

  const facet = first.locator("[data-sw-filter]").first();
  if (await facet.count()) {
    const optionValue = await facet.locator("option").evaluateAll((options) => options.map((option) => option.value).find(Boolean));
    if (optionValue) {
      const field = await facet.getAttribute('data-field');
      const filtered = await act(() => facet.selectOption(optionValue), 'facet request');
      assert(filtered.parts.length > 0, 'A populated facet unexpectedly returned no parts.');
      assert(filtered.parts.every((part) => String(part.values[field]) === optionValue), 'Facet values do not match the selected value.');
      assert.equal(filtered.pagination.page, 1);
    }
  }
  const sku = await first.locator("[data-sw-select]").first().getAttribute("data-sku");
  if (sku) {
    await search.fill(sku);
    const searched = await act(() => first.locator('[data-sw-search-form] button[type="submit"]').click(), 'search request');
    assert(searched.parts.length > 0 && searched.parts.every((part) => part.sku.includes(sku)), 'Search did not return the requested SKU.');
  }
  const size = first.locator('[name="per_page"]');
  if (await size.count()) {
    const options = await size.locator("option").evaluateAll((items) => items.map((item) => item.value));
    const current = await size.inputValue();
    const alternate = options.find((value) => value !== current);
    if (alternate) {
      const resized = await act(() => size.selectOption(alternate), 'page-size request');
      assert.equal(resized.pagination.per_page, Number(alternate));
    }
  }
  assert.equal(await second.locator('tbody').innerText(), secondBefore, 'Requests repainted the other component.');
  assert.equal(await second.locator('[data-sw-selected-count]').textContent(), '0');

  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(100);
    const dimensions = await page.evaluate(() => ({
      width: innerWidth,
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
    }));
    observations.viewports.push(dimensions);
    await page.screenshot({ path: `/tmp/sw-parts-${width}.png`, fullPage: true });
  }

  observations.inquiryHref = await first.locator("[data-sw-inquiry]").getAttribute("href");
  const inquiry = new URL(observations.inquiryHref, targetUrl);
  assert.equal(inquiry.searchParams.getAll('inquiry').length, 2);
  assert.equal(inquiry.searchParams.getAll('sku').length, 2);
  observations.requestCount = observations.restRequests.length;
  assert(observations.requestCount > 0, "No parts REST requests were observed during interactions.");
  assert(observations.viewports.every((item) => item.scroll <= item.client + 1), `Horizontal overflow: ${JSON.stringify(observations.viewports)}`);
  assert.equal(observations.failedResponses.length, 0, `Failed responses: ${JSON.stringify(observations.failedResponses)}`);
  assert.equal(observations.pageErrors.length, 0, `Page errors: ${observations.pageErrors.join(" | ")}`);
  assert.equal(observations.consoleErrors.length, 0, `Console errors: ${observations.consoleErrors.join(" | ")}`);
  console.log(JSON.stringify(observations, null, 2));
} catch (error) {
  failures.push(error.message);
  console.error(JSON.stringify({ failures, observations }, null, 2));
  process.exitCode = 1;
} finally {
  await browser.close();
}

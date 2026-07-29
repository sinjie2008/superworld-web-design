import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { PAGE_METADATA, SITE_ORIGIN } from "../src/seo.js";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const workerPath = resolve(projectRoot, "dist/server/index.js");
const manifestPath = resolve(projectRoot, "dist/.openai/hosting.json");
const appModulePath = resolve(projectRoot, "src/app.js");
const specSearchModulePath = resolve(projectRoot, "src/spec-search/app.js");

const [source, manifest, appModuleSource, specSearchModuleSource] = await Promise.all([
  readFile(workerPath, "utf8"),
  readFile(manifestPath, "utf8"),
  readFile(appModulePath, "utf8"),
  readFile(specSearchModulePath, "utf8"),
]);
JSON.parse(manifest);

// A data URL forces ESM parsing even though the generated output has no package.json.
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const workerModule = await import(moduleUrl);
assert.equal(
  typeof workerModule.default?.fetch,
  "function",
  `${pathToFileURL(workerPath)} must export default.fetch`,
);

const appResponse = await workerModule.default.fetch(new Request("https://lo-wireframe.test/app.js"));
const appSource = await appResponse.text();
const stylesResponse = await workerModule.default.fetch(new Request("https://lo-wireframe.test/styles.css"));
const stylesSource = await stylesResponse.text();
assert.match(appSource, /\?system=server#superworld_electronics_applications_communication_find_the_right_series_by_communication_system/);
assert.match(appSource, /\?system=router#superworld_electronics_applications_communication_find_the_right_series_by_communication_system/);
assert.match(appSource, /\?system=settopbox#superworld_electronics_applications_communication_find_the_right_series_by_communication_system/);
assert.match(appSource, /URLSearchParams\(location\.search\)\.get\("system"\)/);
for (const application of ["tcu", "sensing-camera", "infotainment", "tpms", "headlamp", "keyless-entry", "wireless-charging", "adas"]) {
  assert.match(appSource, new RegExp(`\\?application=${application}`));
}
assert.match(appSource, /get\("application"\)/);
assert.match(appSource, /delete\("system"\)/);
assert.match(appSource, /class="system-action-btn bundle-btn"[^>]*>View Bundle<\/a>/);
assert.match(appSource, /\?root=1&category=159&category=161&inquiry=1447&inquiry=1448/);
assert.match(appSource, /class="market-detail-image-placeholder"/);
assert.match(appSource, /aria-disabled="true">Details unavailable<\/span>/);
assert.match(appSource, /class="series-chip" type="button" aria-expanded="false"/);
assert.match(appSource, /Dimensions Range : LWH\(mm\)/);
assert.match(appModuleSource, /href="\$\{routes\.tools\}\?root=1&category=159&category=161&inquiry=1447&inquiry=1448" data-link>Search compatible products<\/a>/);
assert.match(appModuleSource, /setAttribute\("aria-expanded",String\(chip===activeChip\)\)/);
assert.match(appModuleSource, /addEventListener\("pointerover"/);
assert.match(appModuleSource, /addEventListener\("pointerleave",restorePinnedDetail\)/);
assert.doesNotMatch(stylesSource, /\.mapping-row:hover \.series-detail\[hidden\]/);
assert.match(stylesSource, /\.cta>\.button-group\{flex:0 0 auto;flex-wrap:nowrap\}/);
assert.match(specSearchModuleSource, /function initialize\(\)\s*{\s*initialQuerySelection = parseQuerySelection\(window\.location\.search\);/);

const titles = new Set();
const descriptions = new Set();
for (const [route, metadata] of Object.entries(PAGE_METADATA)) {
  const response = await workerModule.default.fetch(new Request(`${SITE_ORIGIN}${route}`));
  const html = await response.text();
  assert.equal(response.status, 200, `${route} must resolve successfully`);
  assert.match(html, /<title>[^<]+<\/title>/, `${route} must have a title`);
  assert.match(html, /<meta name="description" content="[^"]+">/, `${route} must have a description`);
  assert.match(html, new RegExp(`<link rel="canonical" href="${SITE_ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}${route}">`));
  assert.match(html, /<meta property="og:title"/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
  assert.match(html, /<main id="main-content"/);
  assert.match(html, /<h1>[^<]+<\/h1>/);
  assert.equal(html.includes('content="noindex,follow"'), metadata.index === false, `${route} indexing directive must match metadata`);
  assert.ok(!titles.has(metadata.title), `duplicate title: ${metadata.title}`);
  assert.ok(!descriptions.has(metadata.description), `duplicate description: ${metadata.description}`);
  titles.add(metadata.title);
  descriptions.add(metadata.description);
}

const robotsResponse = await workerModule.default.fetch(new Request(`${SITE_ORIGIN}/robots.txt`));
assert.equal(robotsResponse.headers.get("content-type"), "text/plain; charset=utf-8");
assert.match(await robotsResponse.text(), new RegExp(`Sitemap: ${SITE_ORIGIN}/sitemap\\.xml`));

const sitemapResponse = await workerModule.default.fetch(new Request(`${SITE_ORIGIN}/sitemap.xml`));
const sitemap = await sitemapResponse.text();
for (const [route, metadata] of Object.entries(PAGE_METADATA)) {
  assert.equal(sitemap.includes(`<loc>${SITE_ORIGIN}${route}</loc>`), metadata.index !== false, `${route} sitemap inclusion must match indexing directive`);
}

const missingResponse = await workerModule.default.fetch(new Request(`${SITE_ORIGIN}/missing-page`));
assert.equal(missingResponse.status, 404);
assert.match(await missingResponse.text(), /content="noindex,follow"/);

const trailingSlashResponse = await workerModule.default.fetch(new Request(`${SITE_ORIGIN}/company/`));
assert.equal(trailingSlashResponse.status, 308);
assert.equal(trailingSlashResponse.headers.get("location"), `${SITE_ORIGIN}/company`);

const socialImageResponse = await workerModule.default.fetch(new Request(`${SITE_ORIGIN}/assets/og.png`));
assert.equal(socialImageResponse.status, 200);
assert.equal(socialImageResponse.headers.get("content-type"), "image/png");

console.log(`Artifact is valid ESM and includes SEO metadata for ${titles.size} routes`);

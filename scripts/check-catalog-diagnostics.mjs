import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { PAGE_METADATA, SITE_ORIGIN } from "../src/app/seo.js";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const workerPath = resolve(projectRoot, "worker/index.js");
const distRoot = resolve(projectRoot, "dist");
const deployedWorkerPath = resolve(distRoot, "server/index.js");
const textExtensions = new Set([".css", ".html", ".js", ".json", ".map", ".txt"]);

// These names and instructions belong only to development diagnostics. Generic
// catalog words and public API field names are deliberately not leak signatures.
const diagnosticOnlySignatures = [
  ["catalog API missing marker", /catalog-api-missing/i],
  ["catalog diagnostic interface", /catalog-diagnostic/i],
  ["diagnostic module reference", /catalog-missing-diagnostics/i],
  ["diagnostic class or exports", /CatalogMissingDiagnostics|DIAGNOSTIC_STATUS/],
  ["missing backend label", /Missing Backend Content/i],
  ["catalog manager label", /Product Catalog Manager/i],
  ["series metadata editor label", /Series Metadata Values/i],
  [
    "field editor guidance",
    /Category Fields Set|Series Metadata Field Editor|Product Attribute Field Editor/i,
  ],
  ["diagnostic status constant", /\bMISSING_[A-Z0-9_]+\b/],
  ["diagnostic failure or verification state", /\b(?:MAPPING_NOT_VERIFIED|API_REQUEST_FAILED)\b/],
  ["local catalog manager URL", /Foundational-Electronics-Core-Systems\/public\/catalog_ui\.html/i],
];

async function listFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      return entry.isDirectory() ? listFiles(path) : [path];
    }),
  );
  return nested.flat();
}

function assertNoDiagnosticBytes(label, contents) {
  for (const [description, signature] of diagnosticOnlySignatures) {
    if (signature.test(contents)) throw new Error(`${label} leaked ${description}`);
  }
  if (/sourceMappingURL\s*=/i.test(contents)) throw new Error(`${label} references a source map`);
}

const workerSource = await readFile(workerPath, "utf8");
const deployedWorkerSource = await readFile(deployedWorkerPath, "utf8");
assert.ok(/^\/\* BUILD_MODE=prod \*\//.test(workerSource), "worker must be a production build");
assert.ok(deployedWorkerSource === workerSource, "dist must contain the production worker output");

const distFiles = await listFiles(distRoot);
const sourceMapFiles = distFiles.filter((path) => extname(path).toLowerCase() === ".map");
assert.deepEqual(sourceMapFiles, [], "production dist must not contain source maps");
const checkedFiles = new Set([workerPath]);
for (const path of distFiles) {
  if (textExtensions.has(extname(path).toLowerCase())) checkedFiles.add(path);
  assert.doesNotMatch(
    path.replaceAll("\\", "/"),
    /catalog-(?:missing-)?diagnostics?/i,
    "production dist must not contain a diagnostic module or source map",
  );
}

for (const path of checkedFiles) {
  const contents = await readFile(path, "utf8");
  assertNoDiagnosticBytes(path, contents);
}

assert.equal(
  Object.keys(PAGE_METADATA).length,
  20,
  "the production route check expects all 20 routes",
);
const workerModule = await import(pathToFileURL(workerPath).href);
assert.equal(typeof workerModule.default?.fetch, "function");

const publicAssetPaths = ["/app.js", "/styles.css", "/spec-search.js", "/spec-search.css"];
const publicAssetContents = new Map();
for (const path of publicAssetPaths) {
  const response = await workerModule.default.fetch(new Request(`${SITE_ORIGIN}${path}`));
  assert.equal(response.status, 200, `${path} must remain available from the production worker`);
  const contents = await response.text();
  assertNoDiagnosticBytes(path, contents);
  publicAssetContents.set(path, contents);
}

for (const path of ["/app.js", "/styles.css"]) {
  const response = await workerModule.default.fetch(
    new Request(`${SITE_ORIGIN}${path}?debug=true`),
  );
  assert.equal(response.status, 200, `${path}?debug=true must remain available`);
  const debugContents = await response.text();
  assert.ok(
    debugContents === publicAssetContents.get(path),
    `${path}?debug=true must match the clean production asset exactly`,
  );
  assertNoDiagnosticBytes(`${path}?debug=true`, debugContents);
}

const cleanRouteHtml = new Map();
for (const route of Object.keys(PAGE_METADATA)) {
  const response = await workerModule.default.fetch(new Request(`${SITE_ORIGIN}${route}`));
  assert.equal(response.status, 200, `${route} must remain available from the production worker`);
  const html = await response.text();
  assertNoDiagnosticBytes(route, html);
  assert.match(html, /\/styles\.css\?v=136(?:["'\s])/);
  assert.match(html, /\/app\.js\?v=138(?:["'\s])/);
  assert.doesNotMatch(html, /\?v=dev-/);
  cleanRouteHtml.set(route, html);
}

const representativeProductRoutes = [
  "/products/general",
  "/products/general/emc",
  "/products/general/emc/a4k",
];
const diagnosticQueryVariants = [
  "?debug=true",
  "?diagnostics=true",
  "?catalog-diagnostics=1",
  "?catalogDiagnostics=1",
  "?showMissingContent=true",
  "?mode=dev",
  "?__CATALOG_DIAGNOSTICS__=true",
];
for (const route of representativeProductRoutes) {
  for (const query of diagnosticQueryVariants) {
    const response = await workerModule.default.fetch(
      new Request(`${SITE_ORIGIN}${route}${query}`),
    );
    assert.equal(response.status, 200, `${route}${query} must remain available`);
    const html = await response.text();
    assert.equal(html, cleanRouteHtml.get(route), `${route}${query} must not toggle diagnostics`);
    assertNoDiagnosticBytes(`${route}${query}`, html);
  }
}

const diagnosticOnlyPaths = [
  "/catalog-missing-diagnostics.js",
  "/catalog-missing-diagnostics.js.map",
  "/catalog-diagnostics.js",
  "/catalog-diagnostics.js.map",
  "/catalog-diagnostics.css",
  "/catalog-diagnostics.css.map",
  "/src/app/catalog-missing-diagnostics.js",
  "/Foundational-Electronics-Core-Systems/public/catalog_ui.html",
  "/app.js.map",
  "/styles.css.map",
  "/spec-search.js.map",
  "/spec-search.css.map",
  "/.generated/app.js",
  "/worker/index.js",
  "/dist/server/index.js",
];
for (const path of diagnosticOnlyPaths) {
  const response = await workerModule.default.fetch(new Request(`${SITE_ORIGIN}${path}`));
  assert.equal(response.status, 404, `${path} must not be served by the production worker`);
  const notFoundPage = await response.text();
  // The normal 404 page echoes the requested path into canonical and Open Graph URLs.
  assertNoDiagnosticBytes(path, notFoundPage.replaceAll(path, ""));
}

console.log("Production catalog diagnostics exclusion check passed");

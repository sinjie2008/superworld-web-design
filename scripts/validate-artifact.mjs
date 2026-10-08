import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { readFile, readdir } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { PAGE_METADATA, SITE_ORIGIN } from "../src/app/seo.js";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const sourceRoot = resolve(projectRoot, "src");
const workerPath = resolve(projectRoot, "dist/server/index.js");
const manifestPath = resolve(projectRoot, "dist/.openai/hosting.json");
const lifecycleCheckPath = resolve(projectRoot, "src/app/features/spec-search/lifecycle-check.mjs");
const execFileAsync = promisify(execFile);

const listFiles = async (directory) =>
  (
    await Promise.all(
      (await readdir(directory, { withFileTypes: true })).map((entry) => {
        const path = resolve(directory, entry.name);
        return entry.isDirectory() ? listFiles(path) : path;
      }),
    )
  ).flat();

const escapeAttribute = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );

const sourceFiles = await listFiles(sourceRoot);
const sourcePaths = sourceFiles.map((path) => relative(projectRoot, path).replaceAll("\\", "/"));
const misplacedJavaScript = sourcePaths.filter(
  (path) => path.endsWith(".js") && !path.startsWith("src/app/"),
);
const misplacedHtml = sourcePaths.filter(
  (path) => path.endsWith(".html") && !path.startsWith("src/pages/"),
);
const misplacedJson = sourcePaths.filter(
  (path) => path.endsWith(".json") && !path.startsWith("src/data/"),
);

assert.deepEqual(
  misplacedJavaScript,
  [],
  `source JavaScript must live under src/app/: ${misplacedJavaScript.join(", ")}`,
);
assert.deepEqual(
  misplacedHtml,
  [],
  `source HTML must live under src/pages/: ${misplacedHtml.join(", ")}`,
);
assert.deepEqual(
  misplacedJson,
  [],
  `source JSON must live under src/data/: ${misplacedJson.join(", ")}`,
);

const requiredSourcePaths = [
  "src/app/main.js",
  "src/app/worker.js",
  "src/app/seo.js",
  "src/app/product-api.js",
  "src/app/product-catalog.js",
  "src/app/product-pages.js",
  "src/app/catalog-missing-diagnostics.js",
  "src/app/site/pages.js",
  "src/app/site/interactions.js",
  "src/app/site/enhancements.js",
  ...[
    "app",
    "config",
    "contracts",
    "data-service",
    "query",
    "state",
    "dom",
    "render",
    "events",
    "requests",
  ].map((name) => `src/app/features/spec-search/${name}.js`),
  "src/pages/layouts/document.html",
  "src/pages/layouts/header.html",
  "src/pages/layouts/footer.html",
  ...[
    "home",
    "company",
    "applications",
    "products",
    "news",
    "locations",
    "support",
    "inquiry",
    "thank-you",
  ].map((name) => `src/pages/${name}.html`),
  ...[
    "company/achievements",
    "company/quality",
    "company/sustainability",
    "applications/automotive",
    "applications/communication",
    "products/general",
    "products/general/emc",
    "products/general/emc/a4k",
    "tools/spec-search",
    "news/event-calendar",
    "news/radial-leaded-inductor",
  ].map((name) => `src/pages/${name}.html`),
  "src/styles.scss",
  "src/styles/_tokens.scss",
  "src/styles/_overrides.scss",
  ...["scope", "reset", "globals"].map((name) => `src/styles/base/_${name}.scss`),
  ...["header", "footer"].map((name) => `src/styles/layout/_${name}.scss`),
  ...["buttons", "forms", "grid", "cards", "carousel", "tables", "placeholders", "socials"].map(
    (name) => `src/styles/components/_${name}.scss`,
  ),
  ...[
    "home",
    "company",
    "quality",
    "sustainability",
    "applications",
    "products",
    "a4k",
    "news",
    "locations",
    "support",
    "inquiry",
    "thank-you",
    "spec-search",
    "catalog-diagnostics",
  ].map((name) => `src/styles/pages/_${name}.scss`),
];

for (const path of requiredSourcePaths) {
  assert.ok(sourcePaths.includes(path), `required source file is missing: ${path}`);
}

assert.deepEqual(
  sourcePaths.filter((path) => path.startsWith("src/styles/general/")),
  [],
  "legacy src/styles/general/ partials are not allowed",
);

const scopedScssPaths = [
  ...["header", "footer"].map((name) => `src/styles/layout/_${name}.scss`),
  ...["buttons", "forms", "grid", "cards", "carousel", "tables", "placeholders", "socials"].map(
    (name) => `src/styles/components/_${name}.scss`,
  ),
  ...[
    "home",
    "company",
    "quality",
    "sustainability",
    "applications",
    "products",
    "a4k",
    "news",
    "locations",
    "support",
    "inquiry",
    "thank-you",
  ].map((name) => `src/styles/pages/_${name}.scss`),
  "src/styles/_overrides.scss",
];

for (const path of scopedScssPaths) {
  const scss = await readFile(resolve(projectRoot, path), "utf8");
  assert.match(scss, /@use\s+["'][^"']*scope["'];/, `${path} must import the shared scope helper`);
  assert.match(
    scss,
    /@include\s+scope\.within\s*\{/,
    `${path} must emit rules inside the shared scope`,
  );
  assert.doesNotMatch(scss, /^@media\b/m, `${path} must keep responsive rules selector-local`);
}

const appModulePaths = sourceFiles.filter(
  (path) =>
    relative(sourceRoot, path).replaceAll("\\", "/").startsWith("app/") && path.endsWith(".js"),
);
const specSearchModulePaths = appModulePaths.filter((path) =>
  path.replaceAll("\\", "/").includes("/features/spec-search/"),
);
const pageTemplatePaths = sourceFiles.filter(
  (path) =>
    relative(sourceRoot, path).replaceAll("\\", "/").startsWith("pages/") && path.endsWith(".html"),
);

const [
  source,
  manifest,
  appModuleSources,
  specSearchModuleSources,
  pageTemplateSources,
  specSearchScssSource,
  mainScssSource,
  documentLayoutSource,
] = await Promise.all([
  readFile(workerPath, "utf8"),
  readFile(manifestPath, "utf8"),
  Promise.all(appModulePaths.map((path) => readFile(path, "utf8"))),
  Promise.all(specSearchModulePaths.map((path) => readFile(path, "utf8"))),
  Promise.all(pageTemplatePaths.map((path) => readFile(path, "utf8"))),
  readFile(resolve(projectRoot, "src/styles/pages/_spec-search.scss"), "utf8"),
  readFile(resolve(projectRoot, "src/styles.scss"), "utf8"),
  readFile(resolve(projectRoot, "src/pages/layouts/document.html"), "utf8"),
]);
const buildModeMatch = source.match(/^\/\* BUILD_MODE=(dev|prod) \*\//);
assert.ok(buildModeMatch, "generated worker must include explicit build-mode metadata");
const buildMode = buildModeMatch[1];
const appModuleSource = appModuleSources.join("\n");
const specSearchModuleSource = specSearchModuleSources.join("\n");
const pageTemplateSource = pageTemplateSources.join("\n");
const [mainEntrySource, pagesRegistrySource] = await Promise.all([
  readFile(resolve(projectRoot, "src/app/main.js"), "utf8"),
  readFile(resolve(projectRoot, "src/app/site/pages.js"), "utf8"),
]);
JSON.parse(manifest);

const routeTemplateSources = pageTemplatePaths
  .map((path, index) => ({ path, source: pageTemplateSources[index] }))
  .filter(({ path }) => !path.replaceAll("\\", "/").includes("/pages/layouts/"));
const pagesRoot = resolve(sourceRoot, "pages");
const pageTemplateByPath = new Map(
  pageTemplatePaths.map((path, index) => [
    relative(pagesRoot, path).replaceAll("\\", "/"),
    pageTemplateSources[index],
  ]),
);
const headerTemplateSource = pageTemplateByPath.get("layouts/header.html");
const footerTemplateSource = pageTemplateByPath.get("layouts/footer.html");
const routeTemplateByRoute = new Map(
  routeTemplateSources.map(({ path, source: routeSource }) => {
    const templatePath = relative(pagesRoot, path).replaceAll("\\", "/");
    return [templatePath === "home.html" ? "/" : `/${templatePath.slice(0, -5)}`, routeSource];
  }),
);
assert.equal(routeTemplateSources.length, 20, "exactly 20 route HTML fragments are required");
assert.ok(
  headerTemplateSource && footerTemplateSource,
  "shared header and footer templates are required",
);
assert.deepEqual(
  [...routeTemplateByRoute.keys()].sort(),
  Object.keys(PAGE_METADATA).sort(),
  "route HTML fragments must match the SEO registry",
);
for (const { path, source: routeSource } of routeTemplateSources) {
  assert.equal(
    (routeSource.match(/id="main-content"/g) || []).length,
    1,
    `${relative(projectRoot, path)} must contain one #main-content`,
  );
}
assert.equal(Object.keys(PAGE_METADATA).length, 20, "SEO metadata must cover exactly 20 routes");
assert.doesNotMatch(
  mainEntrySource,
  /function\s+[A-Za-z0-9_]+Page\s*\(/,
  "main.js must not own route HTML templates",
);
assert.doesNotMatch(
  mainEntrySource,
  /<main\s+id=["']main-content["']/,
  "main.js must not embed fixed page markup",
);
assert.doesNotMatch(
  pagesRegistrySource,
  /DOMParser|legacyMarkup|legacyPage/,
  "pages.js must render imported HTML without rebuilding legacy pages",
);
assert.doesNotMatch(
  appModuleSource,
  /^let\s+/m,
  "mutable runtime state must live on class instances instead of module scope",
);
assert.doesNotMatch(
  appModuleSource,
  /\bvar\s+/,
  "browser and worker source must use block-scoped declarations",
);
assert.doesNotMatch(
  appModuleSource,
  /\bjQuery\b|\$\s*\(/,
  "browser source must remain dependency-free Vanilla JavaScript",
);
assert.match(
  specSearchScssSource,
  /^\s*\$scope_prefix:\s*"#superworld_electronics_tools_spec_search_specification_search"\s*!default;\s*#\{\$scope_prefix\}\s*\{/,
);
assert.doesNotMatch(
  specSearchScssSource,
  /^@media\b/m,
  "Specification Search responsive rules must stay selector-local",
);
assert.doesNotMatch(
  mainScssSource,
  /@import\b/,
  "styles.scss must use Sass modules instead of deprecated @import",
);
assert.match(documentLayoutSource, /\/styles\.css\?v=136/);
assert.match(documentLayoutSource, /\/spec-search\.css\?v=109/);
assert.match(documentLayoutSource, /\/spec-search\.js\?v=103/);
assert.match(documentLayoutSource, /\/app\.js\?v=138/);

const { stdout: lifecycleOutput } = await execFileAsync(process.execPath, [lifecycleCheckPath], {
  cwd: projectRoot,
});
assert.match(
  lifecycleOutput,
  /Spec Search lifecycle check passed/,
  "Spec Search must repeatedly initialize and tear down listeners, cached DOM, and active requests while preserving its frozen public API",
);

// A data URL forces ESM parsing even though the generated output has no package.json.
const moduleUrl = `data:text/javascript;base64,${Buffer.from(source).toString("base64")}`;
const workerModule = await import(moduleUrl);
assert.equal(
  typeof workerModule.default?.fetch,
  "function",
  `${pathToFileURL(workerPath)} must export default.fetch`,
);

const publicAssetPaths = [
  "/app.js",
  "/spec-search.js",
  "/styles.css",
  "/spec-search.css",
  "/assets/og.png",
];
const publicAssetResponses = await Promise.all(
  publicAssetPaths.map((path) =>
    workerModule.default.fetch(new Request(`https://lo-wireframe.test${path}`)),
  ),
);
for (let index = 0; index < publicAssetPaths.length; index += 1) {
  assert.equal(
    publicAssetResponses[index].status,
    200,
    `${publicAssetPaths[index]} must remain publicly available`,
  );
}
const [appSource, specSearchSource, stylesSource, specSearchStylesSource] = await Promise.all(
  publicAssetResponses.slice(0, 4).map((response) => response.text()),
);
assert.match(specSearchSource, /SpecSearchApp/);
assert.match(
  specSearchStylesSource,
  /#superworld_electronics_tools_spec_search_specification_search/,
);
assert.match(
  appSource,
  /\?system=server#superworld_electronics_applications_communication_find_the_right_series_by_communication_system/,
);
assert.match(
  appSource,
  /\?system=router#superworld_electronics_applications_communication_find_the_right_series_by_communication_system/,
);
assert.match(
  appSource,
  /\?system=settopbox#superworld_electronics_applications_communication_find_the_right_series_by_communication_system/,
);
assert.match(appSource, /URLSearchParams\(location\.search\)\.get\("system"\)/);
for (const application of [
  "tcu",
  "sensing-camera",
  "infotainment",
  "tpms",
  "headlamp",
  "keyless-entry",
  "wireless-charging",
  "adas",
]) {
  assert.match(appSource, new RegExp(`\\?application=${application}`));
}
assert.match(appSource, /get\("application"\)/);
assert.match(appSource, /delete\("system"\)/);
assert.match(
  pageTemplateSource,
  /class="system-action-btn bundle-btn"[^>]*>\s*View Bundle<\/a\s*>/,
);
assert.doesNotMatch(appSource, /\?root=1&category=159&category=161&inquiry=1447&inquiry=1448/);
assert.match(appSource, /class="market-detail-image-placeholder"/);
assert.match(appSource, /aria-disabled="true"\s*>\s*Details unavailable<\/span\s*>/);
assert.match(pageTemplateSource, /class="series-chip"\s+type="button"\s+aria-expanded="false"/);
assert.match(pageTemplateSource, /Dimensions Range : LWH\(mm\)/);
assert.match(
  pageTemplateSource,
  /href="\/tools\/spec-search"\s+data-link\s*>\s*Search compatible products<\/a\s*>/,
);
assert.match(
  appModuleSource,
  /setAttribute\(\s*"aria-expanded",\s*String\(\s*chip\s*===\s*activeChip\s*\)\s*\)/,
);
assert.match(appModuleSource, /addEventListener\("pointerover"/);
assert.match(appModuleSource, /addEventListener\(\s*"pointerleave",\s*restorePinnedDetail\s*\)/);
assert.doesNotMatch(stylesSource, /\.mapping-row:hover \.series-detail\[hidden\]/);
assert.match(stylesSource, /\.cta>\.button-group\{flex:0 0 auto;flex-wrap:nowrap\}/);
assert.match(specSearchModuleSource, /setInitialSelection\(this\.window\.location\.search\)/);

const titles = new Set();
const descriptions = new Set();
for (const [route, metadata] of Object.entries(PAGE_METADATA)) {
  const response = await workerModule.default.fetch(new Request(`${SITE_ORIGIN}${route}`));
  const html = await response.text();
  assert.equal(response.status, 200, `${route} must resolve successfully`);
  assert.match(html, /<title>[^<]+<\/title>/, `${route} must have a title`);
  assert.match(
    html,
    /<meta\s+name="description"\s+content="[^"]+"\s*\/?>/,
    `${route} must have a description`,
  );
  assert.match(
    html,
    new RegExp(
      `<link\\s+rel="canonical"\\s+href="${SITE_ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}${route}"\\s*\\/?>`,
    ),
  );
  assert.match(html, /<meta\s+property="og:title"/);
  assert.match(html, /<meta\s+name="twitter:card"\s+content="summary_large_image"\s*\/?>/);
  assert.match(html, /<main\s+id="main-content"/);
  assert.ok(
    html.includes(`<h1>${escapeAttribute(metadata.heading)}</h1>`),
    `${route} must include its crawlable heading fallback`,
  );
  assert.doesNotMatch(html, /<!--APP_SLOT:/, `${route} must not expose unresolved document slots`);
  if (route === "/") {
    assert.match(html, new RegExp(`/styles\\.css\\?v=${buildMode === "dev" ? "dev-136" : "136"}`));
    assert.match(html, /\/spec-search\.css\?v=109/);
    assert.match(html, /\/spec-search\.js\?v=103/);
    assert.match(html, new RegExp(`/app\\.js\\?v=${buildMode === "dev" ? "dev-138" : "138"}`));
  }
  assert.equal(
    html.includes('content="noindex,follow"'),
    metadata.index === false,
    `${route} indexing directive must match metadata`,
  );
  assert.ok(!titles.has(metadata.title), `duplicate title: ${metadata.title}`);
  assert.ok(
    !descriptions.has(metadata.description),
    `duplicate description: ${metadata.description}`,
  );
  titles.add(metadata.title);
  descriptions.add(metadata.description);
}

const robotsResponse = await workerModule.default.fetch(new Request(`${SITE_ORIGIN}/robots.txt`));
assert.equal(robotsResponse.headers.get("content-type"), "text/plain; charset=utf-8");
assert.match(await robotsResponse.text(), new RegExp(`Sitemap: ${SITE_ORIGIN}/sitemap\\.xml`));

const sitemapResponse = await workerModule.default.fetch(new Request(`${SITE_ORIGIN}/sitemap.xml`));
const sitemap = await sitemapResponse.text();
for (const [route, metadata] of Object.entries(PAGE_METADATA)) {
  assert.equal(
    sitemap.includes(`<loc>${SITE_ORIGIN}${route}</loc>`),
    metadata.index !== false,
    `${route} sitemap inclusion must match indexing directive`,
  );
}

const missingResponse = await workerModule.default.fetch(
  new Request(`${SITE_ORIGIN}/missing-page`),
);
assert.equal(missingResponse.status, 404);
assert.match(await missingResponse.text(), /content="noindex,follow"/);

const trailingSlashResponse = await workerModule.default.fetch(
  new Request(`${SITE_ORIGIN}/company/`),
);
assert.equal(trailingSlashResponse.status, 308);
assert.equal(trailingSlashResponse.headers.get("location"), `${SITE_ORIGIN}/company`);

const socialImageResponse = await workerModule.default.fetch(
  new Request(`${SITE_ORIGIN}/assets/og.png`),
);
assert.equal(socialImageResponse.status, 200);
assert.equal(socialImageResponse.headers.get("content-type"), "image/png");

if (buildMode === "prod") {
  const diagnosticsCheckPath = resolve(projectRoot, "scripts/check-catalog-diagnostics.mjs");
  const { stdout: diagnosticsCheckOutput } = await execFileAsync(
    process.execPath,
    [diagnosticsCheckPath],
    { cwd: projectRoot },
  );
  assert.match(
    diagnosticsCheckOutput,
    /Production catalog diagnostics exclusion check passed/,
    "production validation must check that diagnostic-only bytes are absent",
  );
}

console.log(`Artifact and lifecycle checks passed for ${titles.size} routes`);

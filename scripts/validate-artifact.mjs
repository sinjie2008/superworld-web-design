import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const projectRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const workerPath = resolve(projectRoot, "dist/server/index.js");
const manifestPath = resolve(projectRoot, "dist/.openai/hosting.json");
const specSearchModulePath = resolve(projectRoot, "src/spec-search/app.js");

const [source, manifest, specSearchModuleSource] = await Promise.all([
  readFile(workerPath, "utf8"),
  readFile(manifestPath, "utf8"),
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
assert.match(appSource, /aria-disabled="true">Learn More<\/span>/);
assert.match(appSource, /class="series-chip" type="button" aria-expanded="false"/);
assert.match(appSource, /Dimensions Range : LWH\(mm\)/);
assert.match(appSource, /Click Here To learn More/);
assert.match(stylesSource, /:has\(\.series-chip:hover\)/);
assert.match(specSearchModuleSource, /function initialize\(\)\s*{\s*initialQuerySelection = parseQuerySelection\(window\.location\.search\);/);

console.log("Artifact is valid ESM and includes communication system deep links");

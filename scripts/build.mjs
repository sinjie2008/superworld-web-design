import { build as buildWithEsbuild } from "esbuild";
import { cpSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = resolve(import.meta.dirname, "..");

function resolveWorkspaceDirectory(relativeTarget) {
  const targetPath = resolve(projectRoot, relativeTarget);
  const pathFromProjectRoot = relative(projectRoot, targetPath);
  if (
    !isAbsolute(projectRoot) ||
    !isAbsolute(targetPath) ||
    pathFromProjectRoot !== relativeTarget
  ) {
    throw new Error(`Refusing to access a build directory outside the project: ${targetPath}`);
  }
  return targetPath;
}

function removeWorkspaceDirectory(relativeTarget) {
  rmSync(resolveWorkspaceDirectory(relativeTarget), { recursive: true, force: true });
}

const distRoot = resolveWorkspaceDirectory("dist");
const generatedRoot = resolveWorkspaceDirectory(".generated");
const sassCli = resolve(projectRoot, "node_modules/sass/sass.js");
const esbuildCli = resolve(projectRoot, "node_modules/esbuild/bin/esbuild");
const workerPath = resolve(projectRoot, "worker/index.js");

function parseMode(args) {
  let mode = "prod";

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    let value;

    if (argument === "--mode") {
      value = args[index + 1];
      index += 1;
    } else if (argument.startsWith("--mode=")) {
      value = argument.slice("--mode=".length);
    } else {
      throw new Error(`Unknown build option: ${argument}`);
    }

    if (value !== "dev" && value !== "prod") {
      throw new Error(`Unknown build mode: ${value || "(empty)"}. Use --mode=dev or --mode=prod.`);
    }
    mode = value;
  }

  return mode;
}

const mode = parseMode(process.argv.slice(2));
const isDevelopment = mode === "dev";

function run(script, args = []) {
  const result = spawnSync(process.execPath, [script, ...args], {
    stdio: "inherit",
    cwd: projectRoot,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function documentVersionPlugin() {
  let transformedDocumentCount = 0;

  return {
    plugin: {
      name: "document-asset-versions",
      setup(build) {
        build.onLoad(
          { filter: /[\\/]src[\\/]pages[\\/]layouts[\\/]document\.html$/ },
          async ({ path }) => {
            let contents = readFileSync(path, "utf8");
            const productionVersions = [
              ["/styles.css", "136"],
              ["/app.js", "138"],
            ];

            for (const [assetPath, version] of productionVersions) {
              const productionReference = `${assetPath}?v=${version}`;
              const matches = contents.split(productionReference).length - 1;
              if (matches !== 1) {
                throw new Error(
                  `Expected one ${productionReference} reference in src/pages/layouts/document.html; found ${matches}.`,
                );
              }
              if (isDevelopment) {
                contents = contents.replace(productionReference, `${assetPath}?v=dev-${version}`);
              }
            }

            transformedDocumentCount += 1;
            return { contents, loader: "text" };
          },
        );
      },
    },
    wasApplied: () => transformedDocumentCount === 1,
  };
}

removeWorkspaceDirectory("dist");
removeWorkspaceDirectory(".generated");
mkdirSync(resolve(distRoot, "server"), { recursive: true });
mkdirSync(resolve(distRoot, ".openai"), { recursive: true });
mkdirSync(generatedRoot, { recursive: true });

const mainStylesEntry = isDevelopment
  ? resolve(generatedRoot, "styles-dev.scss")
  : resolve(projectRoot, "src/styles.scss");
if (isDevelopment) {
  writeFileSync(
    mainStylesEntry,
    '@use "../src/styles";\n@use "../src/styles/pages/catalog-diagnostics";\n',
  );
}

run(sassCli, [
  "--no-source-map",
  "--style=compressed",
  mainStylesEntry,
  resolve(generatedRoot, "styles.css"),
]);
run(sassCli, [
  "--no-source-map",
  "--style=compressed",
  resolve(projectRoot, "src/styles/pages/_spec-search.scss"),
  resolve(generatedRoot, "spec-search.css"),
]);

run(esbuildCli, [
  resolve(projectRoot, "src/app/main.js"),
  "--bundle",
  "--format=esm",
  "--target=es2020",
  "--loader:.html=text",
  "--minify",
  `--define:__CATALOG_DIAGNOSTICS__=${isDevelopment}`,
  `--outfile=${resolve(generatedRoot, "app.js")}`,
]);
cpSync(resolve(generatedRoot, "app.js"), resolve(generatedRoot, "app.txt"));

run(esbuildCli, [
  resolve(projectRoot, "src/app/features/spec-search/app.js"),
  "--bundle",
  "--format=iife",
  "--target=es2020",
  "--minify",
  `--outfile=${resolve(generatedRoot, "spec-search-app.js")}`,
]);
cpSync(resolve(generatedRoot, "spec-search-app.js"), resolve(generatedRoot, "spec-search-app.txt"));

const documentTransform = documentVersionPlugin();
await buildWithEsbuild({
  entryPoints: [resolve(projectRoot, "src/app/worker.js")],
  bundle: true,
  format: "esm",
  platform: "neutral",
  target: "es2020",
  loader: {
    ".css": "text",
    ".html": "text",
    ".txt": "text",
    ".png": "dataurl",
  },
  minify: true,
  outfile: workerPath,
  plugins: [documentTransform.plugin],
});
if (!documentTransform.wasApplied()) {
  throw new Error("The document.html asset-version transform did not run exactly once.");
}

writeFileSync(workerPath, `/* BUILD_MODE=${mode} */\n${readFileSync(workerPath, "utf8")}`);
cpSync(workerPath, resolve(distRoot, "server/index.js"));
cpSync(resolve(projectRoot, ".openai/hosting.json"), resolve(distRoot, ".openai/hosting.json"));

if (!isDevelopment) {
  run(resolve(projectRoot, "scripts/check-catalog-diagnostics.mjs"));
}

removeWorkspaceDirectory(".generated");

console.log(`Built ${distRoot} (${mode})`);

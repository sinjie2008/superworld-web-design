import { cpSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const projectRoot = resolve(import.meta.dirname, "..");
const distRoot = resolve(projectRoot, "dist");
const generatedRoot = resolve(projectRoot, ".generated");
const sassCli = resolve(projectRoot, "node_modules/sass/sass.js");
const esbuildCli = resolve(projectRoot, "node_modules/esbuild/bin/esbuild");

function run(script, args = []) {
  const result = spawnSync(process.execPath, [script, ...args], {
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

rmSync(distRoot, { recursive: true, force: true });
rmSync(generatedRoot, { recursive: true, force: true });
mkdirSync(resolve(distRoot, "server"), { recursive: true });
mkdirSync(resolve(distRoot, ".openai"), { recursive: true });
mkdirSync(generatedRoot, { recursive: true });

run(sassCli, [
  "--no-source-map",
  "--style=compressed",
  resolve(projectRoot, "src/styles.scss"),
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
run(esbuildCli, [
  resolve(projectRoot, "src/app/worker.js"),
  "--bundle",
  "--format=esm",
  "--platform=neutral",
  "--target=es2020",
  "--loader:.css=text",
  "--loader:.html=text",
  "--loader:.txt=text",
  "--loader:.png=dataurl",
  "--minify",
  `--outfile=${resolve(projectRoot, "worker/index.js")}`,
]);

cpSync(resolve(projectRoot, "worker/index.js"), resolve(distRoot, "server/index.js"));
cpSync(resolve(projectRoot, ".openai/hosting.json"), resolve(distRoot, ".openai/hosting.json"));
rmSync(generatedRoot, { recursive: true, force: true });

console.log(`Built ${distRoot}`);

#!/usr/bin/env bash
set -euo pipefail

project_root=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
dist_root="$project_root/dist"
generated_root="$project_root/.generated"

rm -rf "$dist_root" "$generated_root"
mkdir -p "$dist_root/server" "$dist_root/.openai"
mkdir -p "$generated_root"

"$project_root/node_modules/.bin/sass" \
  --no-source-map \
  --style=compressed \
  "$project_root/src/styles.scss" \
  "$generated_root/styles.css"

"$project_root/node_modules/.bin/esbuild" \
  "$project_root/src/app.js" \
  --bundle \
  --format=esm \
  --target=es2020 \
  --minify \
  --outfile="$generated_root/app.js"
cp "$generated_root/app.js" "$generated_root/app.txt"

"$project_root/node_modules/.bin/esbuild" \
  "$project_root/src/worker.js" \
  --bundle \
  --format=esm \
  --platform=neutral \
  --target=es2020 \
  --loader:.css=text \
  --loader:.txt=text \
  --minify \
  --outfile="$project_root/worker/index.js"

cp "$project_root/worker/index.js" "$dist_root/server/index.js"
cp "$project_root/.openai/hosting.json" "$dist_root/.openai/hosting.json"
rm -rf "$generated_root"

echo "Built $dist_root"

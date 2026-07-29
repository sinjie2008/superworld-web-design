import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const projectRoot = resolve(import.meta.dirname, "..");
const sourcePath = resolve(projectRoot, "src/spec-search/index.html");
const generatedRoot = resolve(projectRoot, ".generated");
const targetId = "superworld_electronics_tools_spec_search_specification_search";
const source = readFileSync(sourcePath, "utf8");

const styleMatch = source.match(/<style>([\s\S]*?)<\/style>/i);
const bodyMatch = source.match(/<body>\s*([\s\S]*?)\s*<script\s+src="app\.js"><\/script>\s*<\/body>/i);

if (!styleMatch || !bodyMatch) {
  throw new Error("Unable to extract the specification-search source.");
}

const markup = bodyMatch[1]
  .replace('<main class="content-column">', '<div class="content-column">')
  .replace("</main>", "</div>");

const scopedScss = `
#${targetId} {
  --blue: #111;
  --muted: #666;
  --border: #1d1d1d;
  --surface: #ffffff;
  --page: #ffffff;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --font-size-page-title: 28px;
  --font-size-subheading: 18px;
  --font-size-body: 14px;
  --font-size-label: 13px;
  --font-size-caption: 12px;
  --font-size-action: 13px;
  --line-height-body: 1.55;
  --control-height: 52px;
  --touch-target: 44px;
  min-width: 0;
  color: #111;
  background: var(--page);
  font-family: Inter, Arial, sans-serif;
  font-size: var(--font-size-body);
  line-height: var(--line-height-body);

  h1, h2, h3, h4, h5, h6, .section-title {
    font-family: Poppins, Arial, sans-serif;
  }

  button {
    font-family: Poppins, Arial, sans-serif;
  }

  input, select {
    font-family: Inter, Arial, sans-serif;
  }

  .section-heading {
    align-items: flex-start;
    margin-bottom: 0;
  }

  button:hover {
    color: inherit;
    background: #fff;
  }

${styleMatch[1]}
}
`;

writeFileSync(resolve(generatedRoot, "spec-search-markup.txt"), markup.trim());
writeFileSync(resolve(generatedRoot, "spec-search.scss"), scopedScss.trimStart());

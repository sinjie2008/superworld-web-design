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
  --blue: #0d6efd;
  --muted: #6c757d;
  --border: #e6e9ef;
  --surface: #ffffff;
  --page: #f7f8fb;
  min-width: 0;
  color: #111827;
  background: var(--page);
  font-family: Inter, Arial, sans-serif;
  font-size: 16px;
  line-height: 1.5;

  h1, h2, h3, h4, h5, h6, .section-title {
    font-family: Poppins, Arial, sans-serif;
  }

  button, input, select {
    font-family: Inter, Arial, sans-serif;
  }

  .section-heading {
    align-items: center;
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

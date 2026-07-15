import http from "node:http";
import { Readable } from "node:stream";
import worker from "../worker/index.js";

const args = process.argv.slice(2);
const valueAfter = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const host = valueAfter("--host", "0.0.0.0");
const port = Number(valueAfter("--port", "4173"));

const server = http.createServer(async (request, response) => {
  try {
    const origin = `http://${request.headers.host || `${host}:${port}`}`;
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const webRequest = new Request(new URL(request.url || "/", origin), {
      method: request.method,
      headers: request.headers,
      body: hasBody ? Readable.toWeb(request) : undefined,
      duplex: hasBody ? "half" : undefined,
    });
    const webResponse = await worker.fetch(webRequest, {}, { waitUntil() {} });
    response.writeHead(webResponse.status, Object.fromEntries(webResponse.headers.entries()));
    if (!webResponse.body || request.method === "HEAD") {
      response.end();
      return;
    }
    Readable.fromWeb(webResponse.body).pipe(response);
  } catch (error) {
    response.writeHead(500, { "content-type": "text/plain; charset=utf-8" });
    response.end(`Preview error: ${error instanceof Error ? error.message : String(error)}`);
  }
});

server.listen(port, host, () => {
  process.stdout.write(`Wireframe preview ready on ${host}:${port}\n`);
});

const close = () => server.close(() => process.exit(0));
process.on("SIGTERM", close);
process.on("SIGINT", close);

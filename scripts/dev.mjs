import http from "node:http";
import { Readable } from "node:stream";
import worker from "../worker/index.js";

const args = process.argv.slice(2);
const valueAfter = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] ? args[index + 1] : fallback;
};

const host = valueAfter("--host", "127.0.0.1");
const port = Number(valueAfter("--port", "4173"));
const productApiBase = "http://localhost/Foundational-Electronics-Core-Systems/api/";
const productRoot = new URL("../", productApiBase);
const publicStorageRoutes = [
  {
    path: "/storage/media/catalog-hierarchy/",
    upstream: "storage/media/catalog-hierarchy/",
  },
  { path: "/storage/typst-pdfs/", upstream: "public/storage/typst-pdfs/" },
  { path: "/storage/latex-pdfs/", upstream: "storage/latex-pdfs/" },
];

function publicStorageUrl(rawPath) {
  const route = publicStorageRoutes.find((candidate) => rawPath.startsWith(candidate.path));
  if (!route) return null;
  const encodedPath = rawPath.slice(route.path.length);
  const segments = encodedPath.split("/");
  if (!encodedPath || segments.some((segment) => !segment)) return null;

  const safeSegments = [];
  for (const segment of segments) {
    let decoded;
    try {
      decoded = decodeURIComponent(segment);
    } catch {
      return null;
    }
    if (
      !decoded ||
      decoded === "." ||
      decoded === ".." ||
      /[\\/\u0000-\u001f\u007f?:#]/.test(decoded)
    ) {
      return null;
    }
    safeSegments.push(encodeURIComponent(decoded));
  }

  return new URL(`${route.upstream}${safeSegments.join("/")}`, productRoot);
}

const server = http.createServer(async (request, response) => {
  try {
    const origin = `http://${request.headers.host || `${host}:${port}`}`;
    const incomingUrl = new URL(request.url || "/", origin);
    if (incomingUrl.pathname.startsWith("/storage/")) {
      const rawPath = (request.url || "/").split(/[?#]/, 1)[0];
      const upstreamUrl = publicStorageUrl(rawPath);
      if (!upstreamUrl) {
        response.writeHead(404, { "content-type": "text/plain; charset=utf-8" });
        response.end("Not found");
        return;
      }
      if (request.method !== "GET" && request.method !== "HEAD") {
        response.writeHead(405, {
          allow: "GET, HEAD",
          "content-type": "text/plain; charset=utf-8",
        });
        response.end("Method not allowed");
        return;
      }
      const upstream = await fetch(upstreamUrl, {
        method: request.method,
        cache: "no-store",
        headers: { Accept: "image/*, application/pdf" },
        redirect: "manual",
      });
      const contentType = (upstream.headers.get("content-type") || "")
        .split(";", 1)[0]
        .trim()
        .toLowerCase();
      const supportedType =
        contentType === "application/pdf" ||
        [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
          "image/avif",
          "image/bmp",
        ].includes(contentType);
      if (!upstream.ok || !supportedType) {
        await upstream.body?.cancel();
        const status = upstream.status >= 400 ? upstream.status : 404;
        response.writeHead(status, {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store",
          "x-content-type-options": "nosniff",
        });
        response.end("Not found");
        return;
      }
      response.writeHead(upstream.status, {
        "content-type": contentType,
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      });
      response.end(request.method === "HEAD" ? undefined : Buffer.from(await upstream.arrayBuffer()));
      return;
    }
    if (!incomingUrl.pathname.startsWith("/api/application-catalog/") && (incomingUrl.pathname === "/api" || incomingUrl.pathname.startsWith("/api/"))) {
      const suffix = incomingUrl.pathname.replace(/^\/api\/?/, "");
      const upstreamUrl = new URL(suffix + incomingUrl.search, productApiBase);
      const hasBody = request.method !== "GET" && request.method !== "HEAD";
      const upstream = await fetch(upstreamUrl, {
        method: request.method,
        headers: {
          Accept: request.headers.accept || "application/json",
          ...(request.headers["content-type"]
            ? { "Content-Type": request.headers["content-type"] }
            : {}),
        },
        body: hasBody ? Readable.toWeb(request) : undefined,
        duplex: hasBody ? "half" : undefined,
        cache: "no-store",
      });
      response.writeHead(upstream.status, {
        "content-type": upstream.headers.get("content-type") || "application/json; charset=utf-8",
        "cache-control": "no-store",
      });
      response.end(
        request.method === "HEAD" ? undefined : Buffer.from(await upstream.arrayBuffer()),
      );
      return;
    }
    const hasBody = request.method !== "GET" && request.method !== "HEAD";
    const webRequest = new Request(incomingUrl, {
      method: request.method,
      headers: request.headers,
      body: hasBody ? Readable.toWeb(request) : undefined,
      duplex: hasBody ? "half" : undefined,
    });
    const webResponse = await worker.fetch(webRequest, { FECS_PUBLIC_API_BASE: productApiBase }, { waitUntil() {} });
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

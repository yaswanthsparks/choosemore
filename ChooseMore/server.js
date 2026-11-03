const http = require("node:http");
const https = require("node:https");
const fs = require("node:fs/promises");
const path = require("node:path");

const root = __dirname;
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 8989);
const readOnlyMode = process.env.READ_ONLY_MODE === "1";
const products = require("./catalog.json");
const validReasons = new Set(["damage", "replacement", "service", "product-question"]);
const publicFiles = new Set([
  "about.html",
  "breadcrumbs.js",
  "category-nav.js",
  "contact.html",
  "index.html",
  "legal.html",
  "order-help.html",
  "order-help.js",
  "products.html",
  "signin.html",
  "site-layout.css",
  "storefront.css",
  "storefront.js",
  "styles.css"
]);
const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"]
]);

function sendJson(response, statusCode, body) {
  response.writeHead(statusCode, {
    "Cache-Control": "no-store",
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(JSON.stringify(body));
}

function sendMethodNotAllowed(response) {
  response.writeHead(405, {
    "Allow": "GET, HEAD",
    "Cache-Control": "no-store",
    "Content-Type": "text/plain; charset=utf-8",
    "X-Content-Type-Options": "nosniff"
  });
  response.end("Method not allowed.");
}

async function readJsonBody(request) {
  const chunks = [];
  let bytes = 0;
  for await (const chunk of request) {
    bytes += chunk.length;
    if (bytes > 32_768) {
      const error = new Error("Request body is too large.");
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Request body must be valid JSON.");
    error.statusCode = 400;
    throw error;
  }
}

function validText(value, maxLength) {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

async function serveStatic(request, response, pathname) {
  let decodedPath;
  try {
    decodedPath = decodeURIComponent(pathname);
  } catch {
    sendJson(response, 400, { error: "The requested path is invalid." });
    return;
  }

  const relativePath = decodedPath === "/" ? "index.html" : decodedPath.replace(/^[/\\]+/, "");
  const filePath = path.resolve(root, relativePath);
  const relativeToRoot = path.relative(root, filePath);
  const publicPath = relativeToRoot.split(path.sep).join("/");
  if (relativeToRoot.startsWith("..") || path.isAbsolute(relativeToRoot)) {
    sendJson(response, 403, { error: "That path is not available." });
    return;
  }
  if (!publicFiles.has(publicPath)) {
    sendJson(response, 404, { error: "File not found." });
    return;
  }

  let file;
  try {
    const stat = await fs.stat(filePath);
    if (!stat.isFile()) {
      sendJson(response, 404, { error: "File not found." });
      return;
    }
    file = await fs.readFile(filePath);
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "EISDIR") {
      sendJson(response, 404, { error: "File not found." });
      return;
    }
    throw error;
  }

  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Length": file.length,
    "Content-Type": contentTypes.get(path.extname(filePath).toLowerCase()) || "application/octet-stream",
    "X-Content-Type-Options": "nosniff"
  });
  response.end(request.method === "HEAD" ? undefined : file);
}

async function handleRequest(request, response) {
  if (readOnlyMode && request.method !== "GET" && request.method !== "HEAD") {
    request.resume();
    sendMethodNotAllowed(response);
    return;
  }

  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  if (url.pathname === "/preview-config.js") {
    const config = `window.CHOOSEMORE_READ_ONLY = ${readOnlyMode};\n`
      + `if (window.CHOOSEMORE_READ_ONLY) document.documentElement.classList.add("read-only-preview");\n`;
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Length": Buffer.byteLength(config),
      "Content-Type": "text/javascript; charset=utf-8",
      "X-Content-Type-Options": "nosniff"
    });
    response.end(request.method === "HEAD" ? undefined : config);
    return;
  }

  if (url.pathname === "/api/health" && request.method === "GET") {
    sendJson(response, 200, { status: "ok", mode: readOnlyMode ? "read-only-preview" : "local-demo" });
    return;
  }

  if (url.pathname === "/api/products" && request.method === "GET") {
    sendJson(response, 200, products);
    return;
  }

  if (url.pathname === "/api/enquiries" && request.method === "POST") {
    const contentType = request.headers["content-type"]?.split(";")[0].trim().toLowerCase();
    if (contentType !== "application/json") {
      sendJson(response, 415, { error: "Send the enquiry as application/json." });
      return;
    }

    const body = await readJsonBody(request);
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      sendJson(response, 400, { error: "Request body must be a JSON object." });
      return;
    }
    const product = products.find((item) => item.id === body.productId);
    const validEmail = typeof body.email === "string"
      && body.email.length <= 160
      && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email);
    if (!product
        || !validReasons.has(body.reason)
        || !validText(body.name, 100)
        || !validEmail
        || !validText(body.message, 2400)
        || (body.orderReference != null && (typeof body.orderReference !== "string" || body.orderReference.length > 100))) {
      sendJson(response, 400, {
        error: "Choose a listed sample product and enquiry type, and provide valid preview contact details and a message."
      });
      return;
    }

    sendJson(response, 200, {
      status: "preview-only",
      product: { id: product.id, name: product.name },
      enquiryType: body.reason,
      message: "The local API accepted this preview only. No support ticket was created, and the submitted details were not saved."
    });
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    sendJson(response, 404, { error: "API route not found." });
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    sendJson(response, 405, { error: "Method not allowed." });
    return;
  }

  await serveStatic(request, response, url.pathname);
}

const requestHandler = (request, response) => {
  handleRequest(request, response).catch((error) => {
    if (!response.headersSent) {
      sendJson(response, error.statusCode || 500, {
        error: error.statusCode ? error.message : "The local server could not complete the request."
      });
    } else {
      response.destroy();
    }
    if (!error.statusCode) {
      console.error("Local request failed:", error.message);
    }
  });
};

async function startServer() {
  const certificatePath = process.env.TLS_CERT_PATH;
  const privateKeyPath = process.env.TLS_KEY_PATH;
  if (Boolean(certificatePath) !== Boolean(privateKeyPath)) {
    throw new Error("Set both TLS_CERT_PATH and TLS_KEY_PATH to enable HTTPS.");
  }

  const secure = Boolean(certificatePath && privateKeyPath);
  let server;
  if (secure) {
    const [cert, key] = await Promise.all([
      fs.readFile(path.resolve(certificatePath)),
      fs.readFile(path.resolve(privateKeyPath))
    ]);
    server = https.createServer({ cert, key }, requestHandler);
  } else {
    server = http.createServer(requestHandler);
  }

  if (readOnlyMode) {
    const rejectProtocolSwitch = (socket) => {
      socket.end("HTTP/1.1 405 Method Not Allowed\r\n"
        + "Allow: GET, HEAD\r\n"
        + "Connection: close\r\n"
        + "Content-Length: 0\r\n\r\n");
    };
    server.on("connect", (_request, socket) => rejectProtocolSwitch(socket));
    server.on("upgrade", (_request, socket) => rejectProtocolSwitch(socket));
  }

  server.on("error", (error) => {
    console.error(`Could not start the local server: ${error.message}`);
    process.exitCode = 1;
  });
  server.listen(port, host, () => {
    const protocol = secure ? "https" : "http";
    console.log(`ChooseMore app and API: ${protocol}://127.0.0.1:${port}/`);
    console.log(`Health check: ${protocol}://127.0.0.1:${port}/api/health`);
    if (readOnlyMode) {
      console.log("Read-only preview mode is enabled; only GET and HEAD requests are allowed.");
    }
    if (secure) {
      console.log("HTTPS is enabled with the configured certificate and private key.");
    } else {
      console.log(`Android emulator URL: http://10.0.2.2:${port}/`);
    }
  });
}

startServer().catch((error) => {
  console.error(`Could not configure the local server: ${error.message}`);
  process.exitCode = 1;
});

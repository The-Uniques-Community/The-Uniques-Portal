import http from "http";

// Set VERCEL environment variable to avoid launching the standalone bootstrap during test import
process.env.VERCEL = "1";

const { default: app } = await import("../index.js");

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ PASS: ${message}`);
    totalPassed++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    totalFailed++;
  }
}

console.log("==================================================");
console.log("   SERVER BOOTSTRAP & MIDDLEWARE PIPELINE AUDIT   ");
console.log("==================================================\n");

// 1. Inspect Route Stack Order
console.log("[Phase 1] Inspecting Express Middleware & Route Order...");

const stack = app._router.stack;
const simplifiedStack = [];

for (const layer of stack) {
  if (layer.route) {
    const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase()).join(",");
    simplifiedStack.push({
      type: "route",
      path: layer.route.path,
      methods,
    });
  } else if (layer.name === "router") {
    simplifiedStack.push({
      type: "router",
      regexp: layer.regexp.toString(),
    });
  } else {
    simplifiedStack.push({
      type: "middleware",
      name: layer.name,
      fnSource: layer.handle ? layer.handle.toString() : "",
    });
  }
}

// Find index of decoupled endpoints
const rootRouteIdx = simplifiedStack.findIndex(s => s.type === "route" && s.path === "/");
const healthRouteIdx = simplifiedStack.findIndex(s => s.type === "route" && s.path === "/health");
const apiHealthRouteIdx = simplifiedStack.findIndex(s => s.type === "route" && s.path === "/api/health");
const imageProxyRouteIdx = simplifiedStack.findIndex(s => s.type === "route" && s.path === "/api/image-proxy/:fileId");

// Find index of DB guard middleware (contains dbconnect)
const dbGuardIdx = simplifiedStack.findIndex(s => s.type === "middleware" && s.fnSource.includes("dbconnect"));

// Find index of downstream routers
const firstDownstreamRouterIdx = simplifiedStack.findIndex(
  (s, idx) => idx > dbGuardIdx && (s.type === "router" || s.type === "route")
);

console.log("Stack Positions Detected:");
console.log(`  - GET /: index ${rootRouteIdx}`);
console.log(`  - GET /health: index ${healthRouteIdx}`);
console.log(`  - GET /api/health: index ${apiHealthRouteIdx}`);
console.log(`  - GET /api/image-proxy/:fileId: index ${imageProxyRouteIdx}`);
console.log(`  - DB Guard Middleware: index ${dbGuardIdx}`);
console.log(`  - First Downstream Router/Route: index ${firstDownstreamRouterIdx}`);

assert(rootRouteIdx !== -1, "GET / is registered");
assert(healthRouteIdx !== -1, "GET /health is registered");
assert(apiHealthRouteIdx !== -1, "GET /api/health is registered");
assert(imageProxyRouteIdx !== -1, "GET /api/image-proxy/:fileId is registered");
assert(dbGuardIdx !== -1, "DB Guard middleware is registered");

assert(rootRouteIdx < dbGuardIdx, "GET / is mounted BEFORE DB guard middleware");
assert(healthRouteIdx < dbGuardIdx, "GET /health is mounted BEFORE DB guard middleware");
assert(apiHealthRouteIdx < dbGuardIdx, "GET /api/health is mounted BEFORE DB guard middleware");
assert(imageProxyRouteIdx < dbGuardIdx, "GET /api/image-proxy/:fileId is mounted BEFORE DB guard middleware");
assert(firstDownstreamRouterIdx > dbGuardIdx, "Downstream routes/routers are mounted AFTER DB guard middleware");

// 2. HTTP Endpoint Verification using Ephemeral Port
console.log("\n[Phase 2] Verifying Decoupled HTTP Endpoints on Ephemeral Port...");

const server = http.createServer(app);

await new Promise((resolve, reject) => {
  server.listen(0, (err) => {
    if (err) return reject(err);
    resolve();
  });
});

const port = server.address().port;
const baseUrl = `http://127.0.0.1:${port}`;
console.log(`Ephemeral test server listening on ${baseUrl}\n`);

async function fetchJson(path) {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}${path}`, (res) => {
      let data = "";
      res.on("data", chunk => (data += chunk));
      res.on("end", () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: data ? JSON.parse(data) : null, raw: data });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: null, raw: data });
        }
      });
    }).on("error", reject);
  });
}

try {
  // Test 1: GET /
  console.log("Testing GET / ...");
  const rootRes = await fetchJson("/");
  assert(rootRes.status === 200, "GET / returns HTTP 200");
  assert(rootRes.raw === "hello its working", "GET / returns correct text message");

  // Test 2: GET /health (Liveness)
  console.log("Testing GET /health (Liveness Probe) ...");
  const healthRes = await fetchJson("/health");
  assert(healthRes.status === 200, "GET /health returns HTTP 200");
  assert(healthRes.body?.status === "alive", "GET /health returns status: 'alive'");
  assert(!!healthRes.body?.timestamp, "GET /health contains ISO timestamp");

  // Test 3: GET /api/health (Readiness)
  console.log("Testing GET /api/health (Readiness Probe) ...");
  const apiHealthRes = await fetchJson("/api/health");
  assert(apiHealthRes.status === 200 || apiHealthRes.status === 503, `GET /api/health returns valid status (${apiHealthRes.status})`);
  assert(apiHealthRes.body?.database !== undefined, "GET /api/health payload includes database object");
  assert(typeof apiHealthRes.body?.database?.readyState === "number", "GET /api/health reports readyState number");
  assert(typeof apiHealthRes.body?.uptime === "number", "GET /api/health reports uptime number");

  // Test 4: GET /api/image-proxy/:fileId route reaches handler (Decoupled from DB)
  console.log("Testing GET /api/image-proxy/:fileId decoupling ...");
  // When an invalid fileId is requested without credentials, Google Drive service will error out with 500 'Error retrieving image',
  // but it NEVER hits the DB Guard (which would return 503 DATABASE_UNAVAILABLE)
  const imageRes = await fetchJson("/api/image-proxy/test-file-id");
  assert(
    imageRes.raw === "Error retrieving image" || imageRes.status === 500 || imageRes.status === 400,
    "GET /api/image-proxy/:fileId executes image handler without DB guard intervention"
  );
  assert(
    imageRes.body?.code !== "DATABASE_UNAVAILABLE",
    "GET /api/image-proxy/:fileId is not blocked by DB Guard"
  );

} finally {
  await new Promise((resolve) => server.close(resolve));
  console.log("Ephemeral test server closed.");
}

console.log("\n==================================================");
console.log(`   AUDIT COMPLETE: ${totalPassed} PASSED, ${totalFailed} FAILED   `);
console.log("==================================================");

if (totalFailed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

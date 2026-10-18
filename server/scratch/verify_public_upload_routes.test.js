/**
 * @file verify_public_upload_routes.test.js
 * @description Verifies that the requested file upload endpoints are public (unprotected)
 * and accessible without authentication tokens, while ensuring protected endpoints remain intact.
 */
import assert from "assert";
import http from "http";

process.env.VERCEL = "1";
process.env.NODE_ENV = "production";

console.log("===============================================================");
console.log("🚀 Testing Public Access to Image / Document Upload Endpoints");
console.log("===============================================================\n");

// 1. Inspect Upload Router Layer Stack
console.log("[Test 1] Inspecting Upload Router Middlewares...");
const { default: uploadRouter } = await import("../routes/googleDriveUpload.routes.js");

const routesMap = {};
for (const layer of uploadRouter.stack) {
  if (layer.route) {
    const routePath = layer.route.path;
    const methods = Object.keys(layer.route.methods);
    const handlerNames = layer.route.stack.map((s) => s.name || s.handle.name || "anonymous");
    routesMap[routePath] = { methods, handlerNames };
  }
}

const targetRoutes = [
  "/file_upload",
  "/trainer_file_upload",
  "/event_file_upload",
  "/fine_file_upload",
];

for (const target of targetRoutes) {
  assert(routesMap[target], `Route ${target} should exist on uploadRouter`);
  const handlers = routesMap[target].handlerNames;
  
  // verifyToken and verifyRole must NOT be in the handler stack
  const hasVerifyToken = handlers.includes("verifyToken");
  const hasVerifyRole = handlers.includes("verifyRole");
  
  assert(!hasVerifyToken, `Route ${target} should NOT have verifyToken middleware`);
  assert(!hasVerifyRole, `Route ${target} should NOT have verifyRole middleware`);
  console.log(`   ✅ POST ${target} has no verifyToken or verifyRole middleware`);
}

// Ensure protected routes still have protection
assert(routesMap["/create_main_folder"].handlerNames.includes("verifyToken"), "/create_main_folder remains protected");
assert(routesMap["/project_file_upload"].handlerNames.includes("verifyToken"), "/project_file_upload remains protected");
console.log("   ✅ Protected routes (/create_main_folder, /project_file_upload) remain protected");

// 2. HTTP Requests against live app instance
console.log("\n[Test 2] Testing Unauthenticated HTTP Requests against Express App...");
const { default: app } = await import("../index.js");

const testRequest = (options) => {
  return new Promise((resolve, reject) => {
    const server = http.createServer(app);
    server.listen(0, "127.0.0.1", () => {
      const port = server.address().port;
      const reqOpts = {
        hostname: "127.0.0.1",
        port,
        path: options.path,
        method: options.method,
        headers: {
          Origin: "https://www.theuniques.in",
          ...options.headers,
        },
      };

      const req = http.request(reqOpts, (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
          server.close(() => {
            resolve({
              statusCode: res.statusCode,
              headers: res.headers,
              body: body ? JSON.parse(body) : null,
            });
          });
        });
      });

      req.on("error", (err) => server.close(() => reject(err)));
      req.end();
    });
  });
};

// Test unauthenticated requests to each target endpoint (without body/files)
// Because there is no token, if it was protected it would return 401 or 403.
// Being public, it enters the Multer / validator and returns 400 (missing fields or files), NOT 401/403.
for (const endpoint of targetRoutes) {
  // Test both /upload and /api/upload
  for (const prefix of ["/upload", "/api/upload"]) {
    const res = await testRequest({
      path: `${prefix}${endpoint}`,
      method: "POST",
    });

    assert.notStrictEqual(
      res.statusCode,
      401,
      `${prefix}${endpoint} returned 401 Unauthorized - should be public!`
    );
    assert.notStrictEqual(
      res.statusCode,
      403,
      `${prefix}${endpoint} returned 403 Forbidden - should be public!`
    );
    assert.strictEqual(
      res.statusCode,
      400,
      `${prefix}${endpoint} should reach controller validation (400 Bad Request)`
    );
    assert.strictEqual(
      res.headers["access-control-allow-origin"],
      "https://www.theuniques.in",
      `${prefix}${endpoint} should include CORS header for https://www.theuniques.in`
    );
    console.log(`   ✅ POST ${prefix}${endpoint} is unauthenticated & accessible by public (status 400 validation, CORS OK)`);
  }
}

// Verify protected route returns 401 when unauthenticated
const protectedRes = await testRequest({
  path: "/upload/create_main_folder",
  method: "POST",
});
assert.strictEqual(protectedRes.statusCode, 401, "/upload/create_main_folder must return 401 when unauthenticated");
console.log("   ✅ POST /upload/create_main_folder correctly returns 401 when unauthenticated");

console.log("\n===============================================================");
console.log("🎉 ALL PUBLIC UPLOAD ROUTE VERIFICATIONS PASSED!");
console.log("===============================================================\n");
process.exit(0);

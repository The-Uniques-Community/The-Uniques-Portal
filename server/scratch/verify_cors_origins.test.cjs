/**
 * @file verify_cors_origins.test.cjs
 * @description Automated test suite validating CORS origin whitelist resolution,
 * dynamic ALLOWED_ORIGINS parsing, preview domain matching, and prevention of 500 errors.
 */

const assert = require("assert");

async function runTests() {
  console.log("========================================================");
  console.log("🚀 Starting CORS Origin and Error Handling Verification");
  console.log("========================================================\n");

  // Prevent standalone listen binding port 5001 during test execution
  process.env.VERCEL = "1";
  process.env.ALLOWED_ORIGINS = "https://custom-domain.org, https://staging-portal.vercel.app";

  // Dynamically import the ES module server
  const serverModule = await import("../index.js");
  const isAllowedOrigin = serverModule.isAllowedOrigin;

  // Set NODE_ENV to production to rigorously test production whitelist behavior
  process.env.NODE_ENV = "production";

  assert(typeof isAllowedOrigin === "function", "isAllowedOrigin should be exported as a function");

  console.log("1. Testing isAllowedOrigin resolution...");

  // Test 1: Production URL with hyphens
  assert.strictEqual(
    isAllowedOrigin("https://the-uniques-portal.vercel.app"),
    true,
    "Should allow https://the-uniques-portal.vercel.app"
  );
  console.log("   ✅ https://the-uniques-portal.vercel.app is allowed");

  // Test 2: Production URL without hyphens
  assert.strictEqual(
    isAllowedOrigin("https://theuniquesportal.vercel.app"),
    true,
    "Should allow https://theuniquesportal.vercel.app"
  );
  console.log("   ✅ https://theuniquesportal.vercel.app is allowed");

  // Test 3: Vercel preview deployment URLs
  assert.strictEqual(
    isAllowedOrigin("https://the-uniques-portal-git-feat-login.vercel.app"),
    true,
    "Should allow preview deployment: the-uniques-portal-git-feat-login.vercel.app"
  );
  assert.strictEqual(
    isAllowedOrigin("https://theuniquesportal-server-git-main.vercel.app"),
    true,
    "Should allow backend preview deployment: theuniquesportal-server-git-main.vercel.app"
  );
  assert.strictEqual(
    isAllowedOrigin("https://theuniquescommunity.vercel.app"),
    true,
    "Should allow community production domain: theuniquescommunity.vercel.app"
  );
  assert.strictEqual(
    isAllowedOrigin("https://the-uniques-community.vercel.app"),
    true,
    "Should allow community production domain with hyphens: the-uniques-community.vercel.app"
  );
  assert.strictEqual(
    isAllowedOrigin("https://theuniquescommunity-git-main.vercel.app"),
    true,
    "Should allow community preview deployment: theuniquescommunity-git-main.vercel.app"
  );
  assert.strictEqual(
    isAllowedOrigin("https://the-uniques-community-git-feature.vercel.app"),
    true,
    "Should allow community preview deployment with hyphens: the-uniques-community-git-feature.vercel.app"
  );
  console.log("   ✅ Vercel preview & community URLs match pattern correctly");

  // Test 3b: Production custom domain theuniques.in & www.theuniques.in
  assert.strictEqual(
    isAllowedOrigin("https://www.theuniques.in"),
    true,
    "Should allow https://www.theuniques.in"
  );
  assert.strictEqual(
    isAllowedOrigin("https://theuniques.in"),
    true,
    "Should allow https://theuniques.in"
  );
  console.log("   ✅ https://www.theuniques.in and https://theuniques.in are allowed");

  // Test 4: Dynamic origins from ALLOWED_ORIGINS
  assert.strictEqual(
    isAllowedOrigin("https://custom-domain.org"),
    true,
    "Should allow origin from ALLOWED_ORIGINS: custom-domain.org"
  );
  assert.strictEqual(
    isAllowedOrigin("https://staging-portal.vercel.app"),
    true,
    "Should allow origin from ALLOWED_ORIGINS: staging-portal.vercel.app"
  );
  console.log("   ✅ Dynamic origins from ALLOWED_ORIGINS are allowed");

  // Test 5: Local development URLs
  assert.strictEqual(
    isAllowedOrigin("http://localhost:5173"),
    true,
    "Should allow http://localhost:5173"
  );
  assert.strictEqual(
    isAllowedOrigin("http://localhost:3000"),
    true,
    "Should allow http://localhost:3000"
  );
  console.log("   ✅ Localhost origins are allowed");

  // Test 6: Disallowed external / malicious origin
  assert.strictEqual(
    isAllowedOrigin("https://malicious-attacker.com"),
    false,
    "Should reject disallowed origin: malicious-attacker.com"
  );
  assert.strictEqual(
    isAllowedOrigin("https://evil-uniques-portal.com"),
    false,
    "Should reject malicious spoof origin"
  );
  console.log("   ✅ Disallowed origins are rejected");

  console.log("\n2. Testing HTTP requests against Express app instance...");
  const app = serverModule.default;
  const http = require("http");

  // Helper to run a test HTTP request against app
  const testRequest = (options, postData = null) => {
    return new Promise((resolve, reject) => {
      const server = http.createServer(app);
      server.listen(0, "127.0.0.1", () => {
        const port = server.address().port;
        const reqOpts = {
          hostname: "127.0.0.1",
          port: port,
          path: options.path,
          method: options.method,
          headers: options.headers || {},
        };

        const req = http.request(reqOpts, (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            server.close(() => {
              resolve({
                statusCode: res.statusCode,
                headers: res.headers,
                body: body,
              });
            });
          });
        });

        req.on("error", (err) => {
          server.close(() => reject(err));
        });

        if (postData) {
          req.write(postData);
        }
        req.end();
      });
    });
  };

  // Test 7: OPTIONS Preflight from https://the-uniques-portal.vercel.app
  const preflightRes = await testRequest({
    path: "/auth/emaillogin",
    method: "OPTIONS",
    headers: {
      Origin: "https://the-uniques-portal.vercel.app",
      "Access-Control-Request-Method": "POST",
      "Access-Control-Request-Headers": "Content-Type",
    },
  });

  assert.strictEqual(preflightRes.statusCode, 204, "Preflight OPTIONS should return 204");
  assert.strictEqual(
    preflightRes.headers["access-control-allow-origin"],
    "https://the-uniques-portal.vercel.app",
    "Should return Access-Control-Allow-Origin for https://the-uniques-portal.vercel.app"
  );
  console.log("   ✅ OPTIONS preflight for https://the-uniques-portal.vercel.app returned 204 with CORS headers");

  // Test 7b: OPTIONS Preflight from https://www.theuniques.in
  const preflightResUniques = await testRequest({
    path: "/api/public/members?batch=The+Uniques+1.0",
    method: "OPTIONS",
    headers: {
      Origin: "https://www.theuniques.in",
      "Access-Control-Request-Method": "GET",
      "Access-Control-Request-Headers": "Content-Type",
    },
  });

  assert.strictEqual(preflightResUniques.statusCode, 204, "Preflight OPTIONS should return 204 for https://www.theuniques.in");
  assert.strictEqual(
    preflightResUniques.headers["access-control-allow-origin"],
    "https://www.theuniques.in",
    "Should return Access-Control-Allow-Origin for https://www.theuniques.in"
  );
  console.log("   ✅ OPTIONS preflight for https://www.theuniques.in returned 204 with CORS headers");

  // Test 8: Disallowed origin does NOT return 500 error
  const disallowedRes = await testRequest(
    {
      path: "/auth/emaillogin",
      method: "POST",
      headers: {
        Origin: "https://disallowed-site.com",
        "Content-Type": "application/json",
      },
    },
    JSON.stringify({ email: "invalid@example.com", password: "pwd" })
  );

  assert.notStrictEqual(
    disallowedRes.statusCode,
    500,
    "Disallowed origin request should NOT return 500 Internal Server Error!"
  );
  assert.strictEqual(
    disallowedRes.headers["access-control-allow-origin"],
    undefined,
    "Disallowed origin must NOT receive Access-Control-Allow-Origin header"
  );
  console.log("   ✅ Disallowed origin does NOT trigger 500 error and omits CORS headers");

  // Test 9: Request from https://the-uniques-portal.vercel.app receives CORS header and does NOT return 500
  const allowedPostRes = await testRequest(
    {
      path: "/auth/emaillogin",
      method: "POST",
      headers: {
        Origin: "https://the-uniques-portal.vercel.app",
        "Content-Type": "application/json",
      },
    },
    JSON.stringify({ email: "nonexistent@example.com", password: "password123" })
  );

  assert.notStrictEqual(
    allowedPostRes.statusCode,
    500,
    "POST /auth/emaillogin with production origin must NOT return 500!"
  );
  assert.strictEqual(
    allowedPostRes.headers["access-control-allow-origin"],
    "https://the-uniques-portal.vercel.app",
    "POST /auth/emaillogin must include Access-Control-Allow-Origin header"
  );
  console.log(`   ✅ POST /auth/emaillogin with production origin returned status ${allowedPostRes.statusCode} with valid CORS headers`);

  console.log("\n========================================================");
  console.log("🎉 ALL CORS ORIGIN & ERROR HANDLING TESTS PASSED!");
  console.log("========================================================\n");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("❌ Test suite failed:", err);
  process.exit(1);
});

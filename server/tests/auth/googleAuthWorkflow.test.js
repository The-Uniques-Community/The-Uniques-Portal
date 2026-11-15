import { test, describe } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import authRoutes from "../../routes/Authentication/auth.routes.js";
import { googleCallback } from "../../controller/Authentication/auth.controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createMockResponse = () => {
  const res = {
    statusCode: 200,
    headers: {},
    cookies: {},
    body: null,
    redirectUrl: null,
  };
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.setHeader = (key, val) => {
    res.headers[key.toLowerCase()] = val;
    return res;
  };
  res.cookie = (name, val, options) => {
    res.cookies[name] = { value: val, options };
    return res;
  };
  res.send = (html) => {
    res.body = html;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  res.redirect = (url) => {
    res.redirectUrl = url;
    return res;
  };
  return res;
};

describe("Google OAuth Workflow & Vercel Rewrite Verification Tests", () => {
  describe("server/vercel.json configuration integrity", () => {
    test("server/vercel.json must not rewrite incoming routes to /index.js", () => {
      const vercelJsonPath = path.resolve(__dirname, "../../vercel.json");
      assert.ok(fs.existsSync(vercelJsonPath), "server/vercel.json must exist");

      const config = JSON.parse(fs.readFileSync(vercelJsonPath, "utf8"));

      // If rewrites exist, ensure they do not map all paths to /index.js
      if (config.rewrites) {
        for (const rw of config.rewrites) {
          assert.notStrictEqual(
            rw.destination,
            "/index.js",
            "server/vercel.json must not rewrite to /index.js because it causes Cannot GET /index.js in Express"
          );
        }
      }

      // If legacy builds & routes are used, verify proper structure
      if (config.version === 2) {
        assert.ok(Array.isArray(config.builds), "builds array must exist");
        assert.ok(Array.isArray(config.routes), "routes array must exist");
        const nodeBuild = config.builds.find((b) => b.src === "index.js");
        assert.ok(nodeBuild, "builds must include index.js");
        assert.strictEqual(nodeBuild.use, "@vercel/node", "index.js builder must use @vercel/node");
      }
    });
  });

  describe("Vercel Edge Rewrite Normalization Middleware Simulation", () => {
    // Normalization middleware logic extracted directly from server/index.js
    const normalizeVercelUrl = (req) => {
      const isRewrittenToIndex =
        req.url === "/index.js" ||
        req.url.startsWith("/index.js?") ||
        req.path === "/index.js" ||
        req.url === "/index" ||
        req.url.startsWith("/index?") ||
        req.path === "/index";

      if (isRewrittenToIndex) {
        const rawForwarded =
          req.headers["x-forwarded-uri"] ||
          req.headers["x-matched-path"] ||
          req.headers["x-vercel-matched-path"] ||
          req.headers["x-original-uri"] ||
          req.headers["x-now-route-matches"];

        const queryIndex = req.url.indexOf("?");
        const queryString = queryIndex !== -1 ? req.url.slice(queryIndex) : "";

        if (rawForwarded && rawForwarded !== "/index.js" && rawForwarded !== "/index") {
          const targetPath = rawForwarded.includes("?") ? rawForwarded : `${rawForwarded}${queryString}`;
          req.url = targetPath;
          req.originalUrl = targetPath;
        } else if (req.query && (req.query.code || req.query.scope || req.query.iss)) {
          const targetPath = `/auth/google/callback${queryString}`;
          req.url = targetPath;
          req.originalUrl = targetPath;
        }
      } else if (req.url.startsWith("/index.js/")) {
        const targetPath = req.url.slice(9);
        req.url = targetPath;
        req.originalUrl = targetPath;
      }
    };

    test("recovers /auth/google/callback when rewritten to /index.js with Google OAuth query params", () => {
      const mockReq = {
        url: "/index.js?iss=https://accounts.google.com&code=4/0AUn6Hd_test&scope=email+profile",
        path: "/index.js",
        headers: {},
        query: {
          iss: "https://accounts.google.com",
          code: "4/0AUn6Hd_test",
          scope: "email profile",
        },
      };

      normalizeVercelUrl(mockReq);

      assert.strictEqual(
        mockReq.url,
        "/auth/google/callback?iss=https://accounts.google.com&code=4/0AUn6Hd_test&scope=email+profile"
      );
      assert.strictEqual(mockReq.originalUrl, mockReq.url);
    });

    test("recovers original route from x-matched-path header when present", () => {
      const mockReq = {
        url: "/index.js?test=1",
        path: "/index.js",
        headers: {
          "x-matched-path": "/health",
        },
        query: { test: "1" },
      };

      normalizeVercelUrl(mockReq);

      assert.strictEqual(mockReq.url, "/health?test=1");
      assert.strictEqual(mockReq.originalUrl, "/health?test=1");
    });

    test("recovers original route from x-forwarded-uri header when present", () => {
      const mockReq = {
        url: "/index.js",
        path: "/index.js",
        headers: {
          "x-forwarded-uri": "/api/health",
        },
        query: {},
      };

      normalizeVercelUrl(mockReq);

      assert.strictEqual(mockReq.url, "/api/health");
      assert.strictEqual(mockReq.originalUrl, "/api/health");
    });

    test("strips /index.js/ prefix if prepended by edge router", () => {
      const mockReq = {
        url: "/index.js/auth/google/callback?code=123",
        path: "/index.js/auth/google/callback",
        headers: {},
        query: { code: "123" },
      };

      normalizeVercelUrl(mockReq);

      assert.strictEqual(mockReq.url, "/auth/google/callback?code=123");
      assert.strictEqual(mockReq.originalUrl, "/auth/google/callback?code=123");
    });
  });

  describe("Express Auth Routes Definitions", () => {
    test("auth router mounts /google, /google/callback, and /google/failure routes", () => {
      const routes = authRoutes.stack
        .filter((layer) => layer.route)
        .map((layer) => ({
          path: layer.route.path,
          methods: Object.keys(layer.route.methods),
        }));

      const googleRoute = routes.find((r) => r.path === "/google");
      assert.ok(googleRoute, "Route GET /google must be registered");
      assert.ok(googleRoute.methods.includes("get"), "Route /google must support GET");

      const callbackRoute = routes.find((r) => r.path === "/google/callback");
      assert.ok(callbackRoute, "Route GET /google/callback must be registered");
      assert.ok(callbackRoute.methods.includes("get"), "Route /google/callback must support GET");

      const failureRoute = routes.find((r) => r.path === "/google/failure");
      assert.ok(failureRoute, "Route GET /google/failure must be registered");
      assert.ok(failureRoute.methods.includes("get"), "Route /google/failure must support GET");
    });
  });

  describe("Google OAuth Failure and Success Controller Handlers", () => {
    test("googleCallback generates JWT, sets cookie, and outputs popup messaging HTML", () => {
      const mockUser = {
        _id: "60d0fe4f5311236168a109ca",
        fullName: "Test Member",
        email: "test.member@example.com",
        role: "member",
        batch: "Uniques 6.0",
        toObject: function () {
          return {
            _id: this._id,
            fullName: this.fullName,
            email: this.email,
            role: this.role,
            batch: this.batch,
          };
        },
      };

      const mockReq = { user: mockUser };
      const mockRes = createMockResponse();

      googleCallback(mockReq, mockRes);

      assert.strictEqual(mockRes.statusCode, 200);
      assert.ok(mockRes.cookies.token, "token cookie must be set");
      assert.strictEqual(mockRes.cookies.token.options.httpOnly, true);
      assert.ok(typeof mockRes.body === "string", "HTML body must be returned");
      assert.ok(mockRes.body.includes("window.opener.postMessage"), "HTML must trigger postMessage to opener");
      assert.ok(mockRes.body.includes("token"), "HTML must include token payload");
      assert.ok(mockRes.body.includes("window.close()"), "HTML must close popup window");
    });

    test("google/failure handler returns 401 with postMessage error script and window.close", () => {
      // Find the failure handler directly from authRoutes stack
      const failureLayer = authRoutes.stack.find(
        (layer) => layer.route && layer.route.path === "/google/failure"
      );
      assert.ok(failureLayer, "GET /google/failure route must exist");

      const failureHandler = failureLayer.route.stack[0].handle;
      const mockReq = {
        query: {
          message: "Account not registered in portal",
        },
      };
      const mockRes = createMockResponse();

      failureHandler(mockReq, mockRes);

      assert.strictEqual(mockRes.statusCode, 401);
      assert.ok(typeof mockRes.body === "string", "HTML body must be returned");
      assert.ok(mockRes.body.includes("not-member"), "HTML must identify not-member error");
      assert.ok(mockRes.body.includes("Account not registered in portal"), "HTML must include error description");
      assert.ok(mockRes.body.includes("window.opener.postMessage"), "HTML must postMessage error to opener");
      assert.ok(mockRes.body.includes("window.close()"), "HTML must close the popup window");
    });
  });
});

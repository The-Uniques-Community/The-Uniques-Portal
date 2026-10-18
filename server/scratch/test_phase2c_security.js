/**
 * @file test_phase2c_security.js
 * @description Standalone verification suite for Phase 2C:
 * 1. Community content mutation security (projectRoute, batchRoute, statsRoute, communityBenefitsRoute)
 * 2. Leave IDOR authorization remediation in leaveController:getLeaveById
 *
 * Execution:
 *   node server/scratch/test_phase2c_security.js
 */

import assert from "node:assert/strict";

// Import routers
import projectRouter from "../routes/community/projectRoute.js";
import batchRouter from "../routes/community/batchRoute.js";
import statsRouter from "../routes/community/statsRoute.js";
import communityBenefitsRouter from "../routes/community/communityBenefitsRoute.js";

// Import middlewares
import verifyRole from "../middlewares/verifyRole.js";

// Import model and controller for IDOR tests
import Leave from "../models/member/leaveModel.js";
import { getLeaveById } from "../controller/member/leaveController.js";

// Mock response builder
function createMockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
    send(data) {
      this.body = data;
      return this;
    },
  };
}

// Inspect router registered layers
function inspectRouter(router) {
  const routes = [];
  for (const layer of router.stack) {
    if (layer.route) {
      const path = layer.route.path;
      for (const [method, enabled] of Object.entries(layer.route.methods)) {
        if (enabled) {
          routes.push({
            path,
            method: method.toUpperCase(),
            stackLength: layer.route.stack.length,
            handlers: layer.route.stack.map((s) => s.name || "anonymous"),
          });
        }
      }
    }
  }
  return routes;
}

let passed = 0;
let failed = 0;

function runTest(name, fn) {
  try {
    fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

async function runAsyncTest(name, fn) {
  try {
    await fn();
    console.log(`  ✓ PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

console.log("===============================================================");
console.log("PHASE 2C VERIFICATION SUITE: ROUTE SECURITY & LEAVE IDOR CHECKS");
console.log("===============================================================\n");

// -------------------------------------------------------------
// SECTION 1: Community Content Mutation Route Guard Inspection
// -------------------------------------------------------------
console.log("Section 1: Inspecting Community Content Mutation Route Guards");

runTest("projectRoute guards POST, PUT, DELETE with auth while keeping GET public", () => {
  const routes = inspectRouter(projectRouter);
  
  // Public GET endpoints (length 1: controller only)
  const getRoot = routes.find((r) => r.path === "/" && r.method === "GET");
  assert.ok(getRoot, "GET / must exist");
  assert.equal(getRoot.stackLength, 1, "GET / should not have auth middleware");

  const getId = routes.find((r) => r.path === "/:id" && r.method === "GET");
  assert.ok(getId, "GET /:id must exist");
  assert.equal(getId.stackLength, 1, "GET /:id should not have auth middleware");

  // Protected mutation endpoints (length 3: verifyToken, verifyRole, controller)
  const postRoot = routes.find((r) => r.path === "/" && r.method === "POST");
  assert.ok(postRoot, "POST / must exist");
  assert.equal(postRoot.stackLength, 3, "POST / must have verifyToken + verifyRole guards");
  assert.equal(postRoot.handlers[0], "verifyToken");

  const putId = routes.find((r) => r.path === "/:id" && r.method === "PUT");
  assert.ok(putId, "PUT /:id must exist");
  assert.equal(putId.stackLength, 3, "PUT /:id must have verifyToken + verifyRole guards");
  assert.equal(putId.handlers[0], "verifyToken");

  const deleteId = routes.find((r) => r.path === "/:id" && r.method === "DELETE");
  assert.ok(deleteId, "DELETE /:id must exist");
  assert.equal(deleteId.stackLength, 3, "DELETE /:id must have verifyToken + verifyRole guards");
  assert.equal(deleteId.handlers[0], "verifyToken");
});

runTest("batchRoute guards POST /add and profile updates while keeping GET public", () => {
  const routes = inspectRouter(batchRouter);

  // Public GET endpoints
  const getAll = routes.find((r) => r.path === "/all" && r.method === "GET");
  assert.ok(getAll, "GET /all must exist");
  assert.equal(getAll.stackLength, 1, "GET /all must be public");

  const getProfiles = routes.find((r) => r.path === "/profiles" && r.method === "GET");
  assert.ok(getProfiles, "GET /profiles must exist");
  assert.equal(getProfiles.stackLength, 1, "GET /profiles must be public");

  // Protected mutations
  const postAdd = routes.find((r) => r.path === "/add" && r.method === "POST");
  assert.ok(postAdd, "POST /add must exist");
  assert.equal(postAdd.stackLength, 3, "POST /add must be protected");
  assert.equal(postAdd.handlers[0], "verifyToken");

  const postProfiles = routes.find((r) => r.path === "/profiles/update" && r.method === "POST");
  assert.ok(postProfiles, "POST /profiles/update must exist");
  assert.equal(postProfiles.stackLength, 3, "POST /profiles/update must be protected");
  assert.equal(postProfiles.handlers[0], "verifyToken");

  const putProfiles = routes.find((r) => r.path === "/profiles/update" && r.method === "PUT");
  assert.ok(putProfiles, "PUT /profiles/update must exist");
  assert.equal(putProfiles.stackLength, 3, "PUT /profiles/update must be protected");
  assert.equal(putProfiles.handlers[0], "verifyToken");
});

runTest("statsRoute guards all POST and PUT endpoints while keeping GET public", () => {
  const routes = inspectRouter(statsRouter);

  // Public GET endpoints
  for (const path of ["/", "/all", "/counts"]) {
    const getRoute = routes.find((r) => r.path === path && r.method === "GET");
    assert.ok(getRoute, `GET ${path} must exist`);
    assert.equal(getRoute.stackLength, 1, `GET ${path} must be public`);
  }

  // Protected mutation endpoints
  for (const path of ["/", "/update"]) {
    const postRoute = routes.find((r) => r.path === path && r.method === "POST");
    assert.ok(postRoute, `POST ${path} must exist`);
    assert.equal(postRoute.stackLength, 3, `POST ${path} must have verifyToken + verifyRole`);
    assert.equal(postRoute.handlers[0], "verifyToken");

    const putRoute = routes.find((r) => r.path === path && r.method === "PUT");
    assert.ok(putRoute, `PUT ${path} must exist`);
    assert.equal(putRoute.stackLength, 3, `PUT ${path} must have verifyToken + verifyRole`);
    assert.equal(putRoute.handlers[0], "verifyToken");
  }
});

runTest("communityBenefitsRoute guards POST and PUT /update while keeping GET public", () => {
  const routes = inspectRouter(communityBenefitsRouter);

  // Public GET endpoint
  const getRoot = routes.find((r) => r.path === "/" && r.method === "GET");
  assert.ok(getRoot, "GET / must exist");
  assert.equal(getRoot.stackLength, 1, "GET / must be public");

  // Protected mutation endpoints
  const postUpdate = routes.find((r) => r.path === "/update" && r.method === "POST");
  assert.ok(postUpdate, "POST /update must exist");
  assert.equal(postUpdate.stackLength, 3, "POST /update must have verifyToken + verifyRole");
  assert.equal(postUpdate.handlers[0], "verifyToken");

  const putUpdate = routes.find((r) => r.path === "/update" && r.method === "PUT");
  assert.ok(putUpdate, "PUT /update must exist");
  assert.equal(putUpdate.stackLength, 3, "PUT /update must have verifyToken + verifyRole");
  assert.equal(putUpdate.handlers[0], "verifyToken");
});

// -------------------------------------------------------------
// SECTION 2: Role Authorization Middleware Unit Verification
// -------------------------------------------------------------
console.log("\nSection 2: Testing verifyRole(['admin', 'coordinator']) Behavior");

runTest("verifyRole blocks unauthenticated requests with 401", () => {
  const guard = verifyRole(["admin", "coordinator"]);
  const req = {};
  const res = createMockRes();
  let nextCalled = false;

  guard(req, res, () => { nextCalled = true; });

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.success, false);
  assert.equal(nextCalled, false);
});

runTest("verifyRole blocks unauthorized member with 403", () => {
  const guard = verifyRole(["admin", "coordinator"]);
  const req = { user: { id: "user1", role: "member" } };
  const res = createMockRes();
  let nextCalled = false;

  guard(req, res, () => { nextCalled = true; });

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.success, false);
  assert.equal(nextCalled, false);
});

runTest("verifyRole permits coordinator role", () => {
  const guard = verifyRole(["admin", "coordinator"]);
  const req = { user: { id: "user2", role: "coordinator" } };
  const res = createMockRes();
  let nextCalled = false;

  guard(req, res, () => { nextCalled = true; });

  assert.equal(res.statusCode, null);
  assert.equal(nextCalled, true);
});

runTest("verifyRole permits admin role (case-insensitive)", () => {
  const guard = verifyRole(["admin", "coordinator"]);
  const req = { user: { id: "user3", role: "Admin" } };
  const res = createMockRes();
  let nextCalled = false;

  guard(req, res, () => { nextCalled = true; });

  assert.equal(res.statusCode, null);
  assert.equal(nextCalled, true);
});

// -------------------------------------------------------------
// SECTION 3: leaveController.getLeaveById IDOR Protection Tests
// -------------------------------------------------------------
console.log("\nSection 3: Testing leaveController.getLeaveById IDOR Authorization");

async function executeIdorTests() {
  const originalFindById = Leave.findById;
  let mockLeave = null;

  Leave.findById = () => ({
    populate: async () => mockLeave,
  });

  try {
    await runAsyncTest("getLeaveById returns 401 if req.user is absent", async () => {
      const req = { params: { id: "leave123" } };
      const res = createMockRes();

      await getLeaveById(req, res);

      assert.equal(res.statusCode, 401);
      assert.equal(res.body.success, false);
    });

    await runAsyncTest("getLeaveById returns 404 when leave document does not exist", async () => {
      mockLeave = null;
      const req = { params: { id: "nonexistent" }, user: { id: "user123", role: "member" } };
      const res = createMockRes();

      await getLeaveById(req, res);

      assert.equal(res.statusCode, 404);
      assert.equal(res.body.message, "Leave request not found");
    });

    await runAsyncTest("getLeaveById allows owner access (populated memberId object)", async () => {
      mockLeave = {
        _id: "leave123",
        memberId: { _id: "member001", fullName: "Alice Doe", email: "alice@test.com" },
        reason: "Medical appointment",
        status: "Pending",
      };
      const req = { params: { id: "leave123" }, user: { id: "member001", role: "member" } };
      const res = createMockRes();

      await getLeaveById(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.message, "Leave retrieved successfully");
      assert.equal(res.body.leave._id, "leave123");
    });

    await runAsyncTest("getLeaveById allows owner access (unpopulated memberId string & _id fallback)", async () => {
      mockLeave = {
        _id: "leave123",
        memberId: "member001",
        reason: "Family emergency",
        status: "Pending",
      };
      const req = { params: { id: "leave123" }, user: { _id: "member001", role: "member" } };
      const res = createMockRes();

      await getLeaveById(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.message, "Leave retrieved successfully");
    });

    await runAsyncTest("getLeaveById blocks non-owner member with 403 Forbidden (IDOR Prevention)", async () => {
      mockLeave = {
        _id: "leave123",
        memberId: { _id: "member001", fullName: "Alice Doe" },
        reason: "Confidential reason",
        status: "Pending",
      };
      const req = { params: { id: "leave123" }, user: { id: "attacker999", role: "member" } };
      const res = createMockRes();

      await getLeaveById(req, res);

      assert.equal(res.statusCode, 403);
      assert.equal(res.body.success, false);
      assert.equal(res.body.message, "Forbidden: Not authorized to view this leave request");
    });

    await runAsyncTest("getLeaveById allows coordinator to view other members' leaves", async () => {
      mockLeave = {
        _id: "leave123",
        memberId: { _id: "member001", fullName: "Alice Doe" },
        reason: "Academic project presentation",
        status: "Pending",
      };
      const req = { params: { id: "leave123" }, user: { id: "coordinator01", role: "coordinator" } };
      const res = createMockRes();

      await getLeaveById(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.message, "Leave retrieved successfully");
    });

    await runAsyncTest("getLeaveById allows admin to view other members' leaves", async () => {
      mockLeave = {
        _id: "leave123",
        memberId: { _id: "member001", fullName: "Alice Doe" },
        reason: "Hackathon attendance",
        status: "Approved",
      };
      const req = { params: { id: "leave123" }, user: { id: "admin01", role: "admin" } };
      const res = createMockRes();

      await getLeaveById(req, res);

      assert.equal(res.statusCode, 200);
      assert.equal(res.body.message, "Leave retrieved successfully");
    });

    await runAsyncTest("getLeaveById normalizes role case (e.g., 'COORDINATOR')", async () => {
      mockLeave = {
        _id: "leave123",
        memberId: { _id: "member001", fullName: "Alice Doe" },
        reason: "Personal",
        status: "Pending",
      };
      const req = { params: { id: "leave123" }, user: { id: "coord02", role: "COORDINATOR" } };
      const res = createMockRes();

      await getLeaveById(req, res);

      assert.equal(res.statusCode, 200);
    });
  } finally {
    Leave.findById = originalFindById;
  }
}

await executeIdorTests();

console.log("\n===============================================================");
console.log(`SUMMARY: ${passed} Passed, ${failed} Failed`);
console.log("===============================================================");

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}

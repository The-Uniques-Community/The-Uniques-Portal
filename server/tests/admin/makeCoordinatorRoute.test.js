import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import User from "../../models/user/userModel.js";
import { makeCoordinator } from "../../controller/admin/adminControllers.js";
import verifyRole from "../../middlewares/verifyRole.js";
import adminRoute from "../../routes/admin/adminRoute.js";
import memberAdminRouter from "../../routes/admin/memberRoute.js";

const createMockResponse = () => {
  const res = {};
  res.statusCode = 200;
  res.body = null;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

describe("Admin Make Coordinator Route & Controller Tests", () => {
  let originalFindById;
  let originalFindOne;
  let originalFindByIdAndUpdate;

  beforeEach(() => {
    originalFindById = User.findById;
    originalFindOne = User.findOne;
    originalFindByIdAndUpdate = User.findByIdAndUpdate;
  });

  afterEach(() => {
    User.findById = originalFindById;
    User.findOne = originalFindOne;
    User.findByIdAndUpdate = originalFindByIdAndUpdate;
  });

  describe("RBAC Access Guardrails", () => {
    test("verifyRole(['admin']) allows admin users", () => {
      const guard = verifyRole(["admin"]);
      const req = { user: { role: "admin" } };
      const res = createMockResponse();
      let nextCalled = false;

      guard(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, true, "Admin should be authorized");
    });

    test("verifyRole(['admin']) rejects coordinators with 403", () => {
      const guard = verifyRole(["admin"]);
      const req = { user: { role: "coordinator" } };
      const res = createMockResponse();
      let nextCalled = false;

      guard(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false, "Coordinator should not proceed");
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
    });

    test("verifyRole(['admin']) rejects regular members with 403", () => {
      const guard = verifyRole(["admin"]);
      const req = { user: { role: "member" } };
      const res = createMockResponse();
      let nextCalled = false;

      guard(req, res, () => {
        nextCalled = true;
      });

      assert.strictEqual(nextCalled, false, "Member should not proceed");
      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
    });
  });

  describe("Controller Input Validations", () => {
    test("returns 400 when role is invalid", async () => {
      const req = { params: {}, body: { email: "student@example.com", role: "superadmin" } };
      const res = createMockResponse();

      await makeCoordinator(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /Invalid role/i);
    });

    test("returns 400 when no identifier (id, email, or admno) is provided", async () => {
      const req = { params: {}, body: {} };
      const res = createMockResponse();

      await makeCoordinator(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /Please provide a member ID, email, or admission number/i);
    });

    test("returns 400 when invalid ObjectId format is passed", async () => {
      const req = { params: { id: "invalid-id-123" }, body: {} };
      const res = createMockResponse();

      await makeCoordinator(req, res);

      assert.strictEqual(res.statusCode, 400);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /Invalid user ID format/i);
    });

    test("returns 404 when target user is not found", async () => {
      User.findOne = async () => null;

      const req = { params: {}, body: { email: "nonexistent@example.com" } };
      const res = createMockResponse();

      await makeCoordinator(req, res);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, "Member not found");
    });

    test("returns 403 when attempting to modify an Admin user", async () => {
      User.findOne = async () => ({
        _id: new mongoose.Types.ObjectId(),
        email: "admin@theuniques.in",
        role: "admin",
      });

      const req = { params: {}, body: { email: "admin@theuniques.in", role: "coordinator" } };
      const res = createMockResponse();

      await makeCoordinator(req, res);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.match(res.body.message, /Cannot modify an Administrator account/i);
    });
  });

  describe("Successful Role Transition Execution", () => {
    test("successfully promotes a member to coordinator and increments tokenVersion", async () => {
      const targetId = new mongoose.Types.ObjectId();
      const mockUser = {
        _id: targetId,
        fullName: "Test Student",
        email: "student@example.com",
        admno: "2024BTCS001",
        role: "member",
        tokenVersion: 0,
      };

      User.findOne = async (query) => {
        if (query.email === "student@example.com") return mockUser;
        return null;
      };

      let capturedUpdate = null;
      User.findByIdAndUpdate = (id, update) => {
        capturedUpdate = update;
        return {
          select: () => ({
            ...mockUser,
            role: "coordinator",
            designation: "Technical Coordinator",
            tokenVersion: 1,
          }),
        };
      };

      const req = {
        params: {},
        body: {
          email: "student@example.com",
          role: "coordinator",
          designation: "Technical Coordinator",
        },
      };
      const res = createMockResponse();

      await makeCoordinator(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.role, "coordinator");
      assert.strictEqual(res.body.data.designation, "Technical Coordinator");
      assert.strictEqual(capturedUpdate.$set.role, "coordinator");
      assert.strictEqual(capturedUpdate.$set.designation, "Technical Coordinator");
      assert.strictEqual(capturedUpdate.$inc.tokenVersion, 1);
      assert.match(res.body.message, /promoted to coordinator/i);
    });

    test("successfully reverts a coordinator to member", async () => {
      const targetId = new mongoose.Types.ObjectId();
      const mockCoordinator = {
        _id: targetId,
        fullName: "Coord User",
        email: "coord@example.com",
        role: "coordinator",
        tokenVersion: 1,
      };

      User.findById = async (id) => {
        if (id.toString() === targetId.toString()) return mockCoordinator;
        return null;
      };

      let capturedUpdate = null;
      User.findByIdAndUpdate = (id, update) => {
        capturedUpdate = update;
        return {
          select: () => ({
            ...mockCoordinator,
            role: "member",
            tokenVersion: 2,
          }),
        };
      };

      const req = {
        params: { id: targetId.toString() },
        body: { role: "member" },
      };
      const res = createMockResponse();

      await makeCoordinator(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.data.role, "member");
      assert.strictEqual(capturedUpdate.$set.role, "member");
      assert.strictEqual(capturedUpdate.$inc.tokenVersion, 1);
      assert.match(res.body.message, /reverted to member/i);
    });
  });

  describe("Route Definitions Verification", () => {
    test("POST /makeCoordinator is registered on adminRoute", () => {
      const route = adminRoute.stack.find(
        (layer) => layer.route && layer.route.path === "/makeCoordinator" && layer.route.methods.post
      );
      assert(route, "adminRoute should have POST /makeCoordinator");
    });

    test("PATCH /:id/role is registered on memberAdminRouter", () => {
      const route = memberAdminRouter.stack.find(
        (layer) => layer.route && layer.route.path === "/:id/role" && layer.route.methods.patch
      );
      assert(route, "memberAdminRouter should have PATCH /:id/role");
    });
  });
});

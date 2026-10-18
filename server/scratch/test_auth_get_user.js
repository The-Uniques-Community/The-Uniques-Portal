/**
 * server/scratch/test_auth_get_user.js
 * Verification test for getCurrentUser controller logic
 */
import assert from "assert";
import { getCurrentUser } from "../controller/Authentication/auth.controller.js";

function mockResponse() {
  const res = {
    statusCode: null,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.jsonData = data;
      return this;
    },
  };
  return res;
}

async function runTests() {
  console.log("Starting getCurrentUser verification tests...\n");

  // Test 1: Unauthorized when req.user is missing
  {
    const req = {};
    const res = mockResponse();
    getCurrentUser(req, res);
    assert.strictEqual(res.statusCode, 401, "Expected 401 status when req.user is undefined");
    assert.deepStrictEqual(res.jsonData, { message: "Unauthorized" });
    console.log("✓ Test 1 Passed: Returns 401 when req.user is missing");
  }

  // Test 2: 200 OK with sanitized user when req.user is present
  {
    const req = {
      user: {
        id: "user123",
        _id: "user123",
        email: "test@sviet.ac.in",
        role: "member",
        batch: "2024",
      },
    };
    const res = mockResponse();
    getCurrentUser(req, res);
    assert.strictEqual(res.statusCode, 200, "Expected 200 status when req.user is present");
    assert.strictEqual(res.jsonData.email, "test@sviet.ac.in");
    assert.strictEqual(res.jsonData.role, "member");
    assert.strictEqual(res.jsonData.id, "user123");
    console.log("✓ Test 2 Passed: Returns 200 and expected user payload");
  }

  // Test 3: Strips password and __v from user object
  {
    const req = {
      user: {
        id: "user456",
        _id: "user456",
        email: "admin@sviet.ac.in",
        role: "admin",
        password: "hashed_secret_password",
        __v: 0,
      },
    };
    const res = mockResponse();
    getCurrentUser(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.password, undefined, "password must be removed");
    assert.strictEqual(res.jsonData.__v, undefined, "__v must be removed");
    assert.strictEqual(res.jsonData.email, "admin@sviet.ac.in");
    console.log("✓ Test 3 Passed: Strips sensitive fields (password, __v)");
  }

  // Test 4: Handles Mongoose document object (toObject method)
  {
    const req = {
      user: {
        toObject: () => ({
          id: "user789",
          _id: "user789",
          email: "coordinator@sviet.ac.in",
          role: "coordinator",
          password: "super_secret_hash",
          __v: 2,
        }),
      },
    };
    const res = mockResponse();
    getCurrentUser(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.jsonData.password, undefined, "password must be removed from Mongoose doc");
    assert.strictEqual(res.jsonData.__v, undefined, "__v must be removed from Mongoose doc");
    assert.strictEqual(res.jsonData.email, "coordinator@sviet.ac.in");
    console.log("✓ Test 4 Passed: Sanitizes Mongoose document objects (.toObject)");
  }

  console.log("\nAll getCurrentUser tests passed successfully!");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});

/**
 * @file verify_password_reset.js
 * @description Comprehensive unit and behavioral verification suite for Password Reset & Auth Security.
 */

import assert from "assert";
import mongoose from "mongoose";
import crypto from "crypto";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

let totalPassed = 0;
let totalFailed = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`  ✓ ${description}`);
    totalPassed++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    Error: ${err.message}`);
    totalFailed++;
  }
}

async function itAsync(description, fn) {
  try {
    await fn();
    console.log(`  ✓ ${description}`);
    totalPassed++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    Error: ${err.message}`);
    totalFailed++;
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("PASSWORD RESET & AUTH SECURITY VERIFICATION SUITE");
  console.log("==================================================");

  // SUITE 1: PasswordResetToken Schema & Model Verification
  console.log("\nTest Suite 1: PasswordResetToken Schema & Indexes");
  const modelModule = await import(
    path.join(projectRoot, "server/models/auth/passwordResetTokenModel.js")
  );
  const PasswordResetToken = modelModule.default;

  it("PasswordResetToken model is defined and compiles", () => {
    assert(PasswordResetToken, "PasswordResetToken model should be exported");
    assert(PasswordResetToken.schema, "PasswordResetToken should have a schema");
  });

  it("PasswordResetToken has required paths with correct configurations", () => {
    const paths = PasswordResetToken.schema.paths;
    assert(paths.email, "email path should exist");
    assert.strictEqual(paths.email.options.lowercase, true, "email should be lowercase");
    assert(paths.otpHash, "otpHash path should exist");
    assert(paths.attempts, "attempts path should exist");
    assert.strictEqual(paths.attempts.defaultValue, 0, "attempts default should be 0");
    assert(paths.verified, "verified path should exist");
    assert.strictEqual(paths.verified.defaultValue, false, "verified default should be false");
    assert(paths.resetToken, "resetToken path should exist");
    assert(paths.expiresAt, "expiresAt path should exist");
  });

  it("PasswordResetToken defines TTL index on expiresAt and compound index on email + verified", () => {
    const indexes = PasswordResetToken.schema.indexes();
    const ttlIndex = indexes.find(
      (idx) => idx[0].expiresAt !== undefined && idx[1]?.expireAfterSeconds === 0
    );
    assert(ttlIndex, "TTL index on expiresAt with expireAfterSeconds: 0 must exist");

    const compoundIndex = indexes.find(
      (idx) => idx[0].email === 1 && idx[0].verified === 1
    );
    assert(compoundIndex, "Compound index on { email: 1, verified: 1 } must exist");
  });

  // SUITE 2: Cryptographic Security & OTP Generation
  console.log("\nTest Suite 2: Cryptographic Functions & Entropy");
  const controllerModule = await import(
    path.join(projectRoot, "server/controller/Authentication/passwordReset.controller.js")
  );
  const {
    generateOTP,
    generateSecureOTP,
    hashOTP,
    hashToken,
  } = controllerModule;

  it("generateOTP produces 6-digit numeric string using CSPRNG", () => {
    for (let i = 0; i < 50; i++) {
      const otp = generateOTP();
      assert.strictEqual(typeof otp, "string", "OTP must be a string");
      assert.strictEqual(otp.length, 6, "OTP must be 6 digits");
      const num = parseInt(otp, 10);
      assert(num >= 100000 && num <= 999999, "OTP must be between 100000 and 999999");
    }
  });

  it("generateSecureOTP is an alias of generateOTP", () => {
    assert.strictEqual(generateSecureOTP, generateOTP);
  });

  it("hashOTP produces deterministic HMAC-SHA256 hex digest", () => {
    const h1 = hashOTP("123456");
    const h2 = hashOTP("123456");
    const h3 = hashOTP("654321");
    assert.strictEqual(h1, h2, "Same OTP must generate identical hash");
    assert.notStrictEqual(h1, h3, "Different OTPs must generate different hashes");
    assert.strictEqual(h1.length, 64, "SHA-256 HMAC must be 64 hex characters");
  });

  it("hashToken produces SHA-256 hex digest", () => {
    const t1 = hashToken("abc123xyz");
    const t2 = hashToken("abc123xyz");
    assert.strictEqual(t1, t2, "Same token must generate identical hash");
    assert.strictEqual(t1.length, 64, "SHA-256 must be 64 hex characters");
  });

  // SUITE 3: Controller Logic Simulation (Account Enumeration & Rate Limiting)
  console.log("\nTest Suite 3: Controller Logic Simulation");
  const { sendResetOTP, verifyResetOTP, resetPassword } = controllerModule;
  const MemberMod = (await import(path.join(projectRoot, "server/models/member/memberModel.js"))).default;
  const AdminMod = (await import(path.join(projectRoot, "server/models/admin/adminModel.js"))).default;
  const CommMod = (await import(path.join(projectRoot, "server/models/community/communityAdmin.js"))).default;
  const transporterMod = (await import(path.join(projectRoot, "server/config/emailConfig.js"))).default;

  // Mock transporter to avoid SMTP network attempts
  transporterMod.sendMail = async () => ({ messageId: "mock-id" });

  await itAsync("sendResetOTP defends against account enumeration on unknown email", async () => {
    const origMFind = MemberMod.findOne;
    const origAFind = AdminMod.findOne;
    const origCFind = CommMod.findOne;

    MemberMod.findOne = async () => null;
    AdminMod.findOne = async () => null;
    CommMod.findOne = async () => null;

    const req = {
      body: { email: "nonexistent_user_xyz@theuniques.org" },
    };
    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            jsonResponse = data;
          },
        };
      },
    };

    try {
      await sendResetOTP(req, res);
      assert.strictEqual(statusCode, 200, "Should return HTTP 200");
      assert.strictEqual(jsonResponse.success, true, "Should return success: true");
      assert(
        jsonResponse.message.includes("If an account with that email exists"),
        "Should return generic enumeration-safe message"
      );
    } finally {
      MemberMod.findOne = origMFind;
      AdminMod.findOne = origAFind;
      CommMod.findOne = origCFind;
    }
  });

  await itAsync("sendResetOTP requires email in request body", async () => {
    const req = { body: {} };
    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            jsonResponse = data;
          },
        };
      },
    };

    await sendResetOTP(req, res);
    assert.strictEqual(statusCode, 400, "Should return HTTP 400 when email is missing");
    assert.strictEqual(jsonResponse.success, false);
  });

  await itAsync("sendResetOTP enforces 60-second cooldown per email", async () => {
    const origMFind = MemberMod.findOne;
    const origPFind = PasswordResetToken.findOne;

    MemberMod.findOne = async () => ({ _id: new mongoose.Types.ObjectId(), fullName: "Test User" });
    // Simulate token requested 20 seconds ago
    PasswordResetToken.findOne = async () => ({
      lastRequestedAt: new Date(Date.now() - 20 * 1000),
      windowStartedAt: new Date(Date.now() - 20 * 1000),
      hourlyRequestCount: 1,
    });

    const req = { body: { email: "member@theuniques.org" } };
    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: (d) => { jsonResponse = d; } };
      },
    };

    try {
      await sendResetOTP(req, res);
      assert.strictEqual(statusCode, 429, "Should reject with 429 within 60-second cooldown");
      assert(jsonResponse.message.includes("wait 60 seconds"));
    } finally {
      MemberMod.findOne = origMFind;
      PasswordResetToken.findOne = origPFind;
    }
  });

  await itAsync("sendResetOTP enforces max 5 OTP requests per hour", async () => {
    const origMFind = MemberMod.findOne;
    const origPFind = PasswordResetToken.findOne;

    MemberMod.findOne = async () => ({ _id: new mongoose.Types.ObjectId(), fullName: "Test User" });
    // Simulate token requested 70 seconds ago but 5 requests in current window
    PasswordResetToken.findOne = async () => ({
      lastRequestedAt: new Date(Date.now() - 70 * 1000),
      windowStartedAt: new Date(Date.now() - 500 * 1000), // Within 1 hour
      hourlyRequestCount: 5,
    });

    const req = { body: { email: "member@theuniques.org" } };
    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: (d) => { jsonResponse = d; } };
      },
    };

    try {
      await sendResetOTP(req, res);
      assert.strictEqual(statusCode, 429, "Should reject with 429 when hourly quota exceeded");
      assert(jsonResponse.message.includes("Too many OTP requests"));
    } finally {
      MemberMod.findOne = origMFind;
      PasswordResetToken.findOne = origPFind;
    }
  });

  await itAsync("verifyResetOTP requires both email and otp", async () => {
    const req = { body: { email: "test@example.com" } };
    let statusCode = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return { json: () => {} };
      },
    };

    await verifyResetOTP(req, res);
    assert.strictEqual(statusCode, 400, "Should return HTTP 400 when OTP is missing");
  });

  await itAsync("resetPassword enforces validation of all required fields & token", async () => {
    // Missing resetToken
    let statusCode = null;
    let jsonResponse = null;
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: (data) => {
            jsonResponse = data;
          },
        };
      },
    };

    await resetPassword(
      {
        body: {
          email: "test@example.com",
          newPassword: "password123",
          confirmPassword: "password123",
        },
      },
      res
    );
    assert.strictEqual(statusCode, 400, "Should return 400 when resetToken missing");
    assert(jsonResponse.message.includes("Reset token missing"));

    // Mismatched passwords
    await resetPassword(
      {
        body: {
          email: "test@example.com",
          resetToken: "some-token",
          newPassword: "password123",
          confirmPassword: "different-password",
        },
      },
      res
    );
    assert.strictEqual(statusCode, 400, "Should return 400 when passwords do not match");
    assert(jsonResponse.message.includes("Passwords do not match"));

    // Password too short (< 6 chars)
    await resetPassword(
      {
        body: {
          email: "test@example.com",
          resetToken: "some-token",
          newPassword: "123",
          confirmPassword: "123",
        },
      },
      res
    );
    assert.strictEqual(statusCode, 400, "Should return 400 when password < 6 chars");
  });

  // SUITE 4: ifTokenVerify Middleware Verification
  console.log("\nTest Suite 4: ifTokenVerify.js Header/Fallthrough Guard");
  const ifTokenVerifyPath = path.join(projectRoot, "server/middlewares/ifTokenVerify.js");
  const ifTokenVerifyMod = await import(`${ifTokenVerifyPath}?t=${Date.now()}`);
  const ifTokenVerify = ifTokenVerifyMod.default;

  it("handles missing cookies object without throwing", () => {
    let nextCalled = false;
    const req = {}; // No cookies property
    const res = {};
    const next = () => {
      nextCalled = true;
    };

    assert.doesNotThrow(() => {
      ifTokenVerify(req, res, next);
    });
    assert.strictEqual(nextCalled, true, "Should call next() when req.cookies is undefined");
  });

  it("returns 401 on invalid token and does NOT call next()", () => {
    let nextCalled = false;
    let statusCode = null;
    const req = { cookies: { token: "invalid.jwt.token" } };
    const res = {
      status: (code) => {
        statusCode = code;
        return {
          json: () => {},
        };
      },
    };
    const next = () => {
      nextCalled = true;
    };

    ifTokenVerify(req, res, next);
    assert.strictEqual(statusCode, 401, "Should respond with 401 on invalid token");
    assert.strictEqual(nextCalled, false, "Should NOT call next() after 401 response");
  });

  // SUITE 5: User Models tokenVersion Verification
  console.log("\nTest Suite 5: User Models tokenVersion Support");
  const Member = (await import(path.join(projectRoot, "server/models/member/memberModel.js"))).default;
  const Admin = (await import(path.join(projectRoot, "server/models/admin/adminModel.js"))).default;
  const CommunityAdmin = (await import(path.join(projectRoot, "server/models/community/communityAdmin.js"))).default;

  it("Member schema includes tokenVersion field with default 0", () => {
    assert(Member.schema.paths.tokenVersion, "Member schema must have tokenVersion");
    assert.strictEqual(Member.schema.paths.tokenVersion.defaultValue, 0);
  });

  it("Admin schema includes tokenVersion field with default 0", () => {
    assert(Admin.schema.paths.tokenVersion, "Admin schema must have tokenVersion");
    assert.strictEqual(Admin.schema.paths.tokenVersion.defaultValue, 0);
  });

  it("CommunityAdmin schema includes tokenVersion field with default 0", () => {
    assert(CommunityAdmin.schema.paths.tokenVersion, "CommunityAdmin schema must have tokenVersion");
    assert.strictEqual(CommunityAdmin.schema.paths.tokenVersion.defaultValue, 0);
  });

  // SUITE 6: End-to-End Mock State Transition Verification
  console.log("\nTest Suite 6: Complete OTP Verification & Reset Token Cycle");
  const mockEmail = "student@theuniques.org";
  const mockOtp = "789123";
  const mockOtpHash = hashOTP(mockOtp);

  // Simulate mock database document
  const mockDoc = {
    _id: new mongoose.Types.ObjectId(),
    email: mockEmail,
    otpHash: mockOtpHash,
    attempts: 0,
    verified: false,
    resetToken: null,
    resetTokenHash: null,
    resetTokenExpiresAt: null,
    expiresAt: new Date(Date.now() + 600000),
    lastRequestedAt: new Date(),
    hourlyRequestCount: 1,
    windowStartedAt: new Date(),
    save: async function () {
      return this;
    },
  };

  // Mock PasswordResetToken methods temporarily
  const origFindOne = PasswordResetToken.findOne;
  const origFindByIdAndUpdate = PasswordResetToken.findByIdAndUpdate;
  const origDeleteOne = PasswordResetToken.deleteOne;

  PasswordResetToken.findOne = async (query) => {
    if (query.email === mockEmail) {
      if (query.verified === true && !mockDoc.verified) return null;
      return mockDoc;
    }
    return null;
  };

  PasswordResetToken.findByIdAndUpdate = async (id, update) => {
    if (update.$inc?.attempts) {
      mockDoc.attempts += update.$inc.attempts;
    }
    return mockDoc;
  };

  let deleted = false;
  PasswordResetToken.deleteOne = async (query) => {
    deleted = true;
    return { acknowledged: true, deletedCount: 1 };
  };

  // Test 1: Invalid OTP increments attempts
  await itAsync("verifyResetOTP increments attempts on incorrect OTP", async () => {
    let resStatus = null;
    let resJson = null;
    const req = { body: { email: mockEmail, otp: "000000" } };
    const res = {
      status: (code) => {
        resStatus = code;
        return { json: (d) => { resJson = d; } };
      },
    };

    await verifyResetOTP(req, res);
    assert.strictEqual(resStatus, 400);
    assert.strictEqual(mockDoc.attempts, 1);
    assert(resJson.message.includes("4 attempt(s) remaining"));
  });

  // Test 2: 5 failed attempts locks out
  await itAsync("verifyResetOTP locks and deletes token after 5 attempts", async () => {
    mockDoc.attempts = 4; // 5th attempt coming
    let resStatus = null;
    let resJson = null;
    const req = { body: { email: mockEmail, otp: "000000" } };
    const res = {
      status: (code) => {
        resStatus = code;
        return { json: (d) => { resJson = d; } };
      },
    };

    deleted = false;
    await verifyResetOTP(req, res);
    assert.strictEqual(resStatus, 429);
    assert(deleted, "Token document must be deleted on max attempts exceeded");
    assert(resJson.message.includes("Too many failed attempts") || resJson.message.includes("invalidated"));
  });

  // Test 3: Successful verification issues resetToken
  await itAsync("verifyResetOTP successfully verifies valid OTP and returns resetToken", async () => {
    mockDoc.attempts = 0;
    mockDoc.otpHash = mockOtpHash;
    mockDoc.verified = false;

    let resStatus = null;
    let resJson = null;
    const req = { body: { email: mockEmail, otp: mockOtp } };
    const res = {
      status: (code) => {
        resStatus = code;
        return { json: (d) => { resJson = d; } };
      },
    };

    await verifyResetOTP(req, res);
    assert.strictEqual(resStatus, 200);
    assert.strictEqual(resJson.success, true);
    assert(resJson.resetToken, "Response must include resetToken");
    assert.strictEqual(mockDoc.verified, true);
    assert.strictEqual(mockDoc.otpHash, null, "otpHash must be cleared");
    assert.strictEqual(mockDoc.resetToken, resJson.resetToken);
    assert.strictEqual(mockDoc.resetTokenHash, hashToken(resJson.resetToken));
  });

  // Test 4: resetPassword successfully consumes resetToken and deletes token
  await itAsync("resetPassword verifies resetToken, increments tokenVersion, and deletes token", async () => {
    const validResetToken = mockDoc.resetToken;
    deleted = false;

    // Mock Member lookup and update
    let updatedPassword = null;
    let incrementedTokenVersion = null;
    const origMemberFindOne = Member.findOne;
    const origMemberFindOneAndUpdate = Member.findOneAndUpdate;

    Member.findOne = async () => ({
      _id: new mongoose.Types.ObjectId(),
      email: mockEmail,
      fullName: "Test Member",
      tokenVersion: 0,
    });

    Member.findOneAndUpdate = async (query, update) => {
      updatedPassword = update.$set?.password;
      incrementedTokenVersion = update.$inc?.tokenVersion;
      return { email: mockEmail, tokenVersion: 1 };
    };

    let resStatus = null;
    let resJson = null;
    const req = {
      body: {
        email: mockEmail,
        resetToken: validResetToken,
        newPassword: "BrandNewSecurePassword123!",
        confirmPassword: "BrandNewSecurePassword123!",
      },
    };
    const res = {
      status: (code) => {
        resStatus = code;
        return { json: (d) => { resJson = d; } };
      },
    };

    await resetPassword(req, res);
    assert.strictEqual(resStatus, 200);
    assert.strictEqual(resJson.success, true);
    assert(updatedPassword, "Password hash must be updated");
    assert.strictEqual(incrementedTokenVersion, 1, "tokenVersion must be incremented by 1");
    assert(deleted, "PasswordResetToken must be deleted after password reset");

    // Restore Member mocks
    Member.findOne = origMemberFindOne;
    Member.findOneAndUpdate = origMemberFindOneAndUpdate;
  });

  // Restore mocks
  PasswordResetToken.findOne = origFindOne;
  PasswordResetToken.findByIdAndUpdate = origFindByIdAndUpdate;
  PasswordResetToken.deleteOne = origDeleteOne;

  // Summary
  console.log("\n==================================================");
  console.log(`RESULTS: ${totalPassed} PASSED, ${totalFailed} FAILED`);
  console.log("==================================================");

  if (totalFailed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error("Verification test runner crashed:", err);
  process.exit(1);
});

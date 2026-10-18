/**
 * @file verify_auth_fallback.test.cjs
 * @description Validates multi-collection authentication fallback logic,
 * ensuring users in legacy 'members' and 'admins' collections can authenticate
 * seamlessly alongside unified 'users' collection records.
 */

const assert = require("assert");
const bcrypt = require("bcryptjs");

async function runTests() {
  console.log("========================================================");
  console.log("🚀 Starting Multi-Collection Auth Fallback Verification");
  console.log("========================================================\n");

  process.env.VERCEL = "1";
  process.env.NODE_ENV = "test";

  const { default: app } = await import("../index.js");
  const { default: dbconnect } = await import("../config/dbConfig.js");
  const mongoose = (await import("mongoose")).default;

  console.log("1. Connecting to database...");
  await dbconnect();
  const db = mongoose.connection.db;
  assert(db, "Database handle must be active");
  console.log(`   ✅ Connected to active DB: "${db.databaseName}"`);

  const testMemberEmail = "fallback_member_test@uniques.org";
  const testAdminEmail = "fallback_admin_test@uniques.org";
  const testPassword = "SecurePassword123!";
  const hashedPassword = await bcrypt.hash(testPassword, 10);

  // Clean up any previous test artifacts
  await db.collection("members").deleteOne({ email: testMemberEmail });
  await db.collection("admins").deleteOne({ email: testAdminEmail });
  await db.collection("users").deleteMany({ email: { $in: [testMemberEmail, testAdminEmail] } });

  console.log("\n2. Seeding legacy test documents (ONLY in legacy collections, NOT in 'users')...");
  const memberInsert = await db.collection("members").insertOne({
    fullName: "Fallback Test Member",
    email: testMemberEmail,
    password: hashedPassword,
    role: "member",
    batch: "The Uniques 2.0",
    admno: "2024BTCS999",
    createdAt: new Date(),
  });
  console.log(`   ✅ Seeded legacy member: ${testMemberEmail} (ID: ${memberInsert.insertedId})`);

  const adminInsert = await db.collection("admins").insertOne({
    fullName: "Fallback Test Admin",
    email: testAdminEmail,
    password: hashedPassword,
    role: "admin",
    createdAt: new Date(),
  });
  console.log(`   ✅ Seeded legacy admin: ${testAdminEmail} (ID: ${adminInsert.insertedId})`);

  // Verify that these accounts do NOT exist in 'users'
  const inUsersCount = await db.collection("users").countDocuments({ email: { $in: [testMemberEmail, testAdminEmail] } });
  assert.strictEqual(inUsersCount, 0, "Test users must NOT exist in 'users' collection to verify fallback");

  console.log("\n3. Testing emailLogin with legacy member (not in 'users')...");
  const { emailLogin } = await import("../controller/Authentication/auth.controller.js");

  const runLogin = (body) => {
    return new Promise((resolve) => {
      const req = { body };
      let responseStatus = 200;
      let responseData = null;
      let setCookies = {};

      const res = {
        status(s) {
          responseStatus = s;
          return this;
        },
        json(data) {
          responseData = data;
          resolve({ status: responseStatus, data: responseData, cookies: setCookies });
        },
        cookie(name, val, opts) {
          setCookies[name] = { val, opts };
          return this;
        },
      };

      emailLogin(req, res).catch((err) => {
        resolve({ status: 500, error: err });
      });
    });
  };

  // 3a. Correct password for legacy member
  const memberLoginSuccess = await runLogin({ email: testMemberEmail, password: testPassword });
  assert.strictEqual(memberLoginSuccess.status, 200, "Should authenticate legacy member with 200 OK");
  assert(memberLoginSuccess.data.token, "Response must include JWT token");
  assert.strictEqual(memberLoginSuccess.data.role, "member", "Role should match member");
  assert.strictEqual(memberLoginSuccess.data.member.email, testMemberEmail, "Sanitized profile email should match");
  assert.strictEqual(memberLoginSuccess.data.member.password, undefined, "Password must be stripped from response");
  console.log("   ✅ 3a: Legacy member authenticated successfully via fallback");

  // 3b. Wrong password for legacy member
  const memberLoginWrongPwd = await runLogin({ email: testMemberEmail, password: "WrongPassword999" });
  assert.strictEqual(memberLoginWrongPwd.status, 401, "Should return 401 for wrong password");
  assert.strictEqual(memberLoginWrongPwd.data.message, "Invalid credentials.", "Message should be 'Invalid credentials.'");
  console.log("   ✅ 3b: Wrong password for legacy member properly rejected with 401 'Invalid credentials.'");

  console.log("\n4. Testing emailLogin with legacy admin (not in 'users')...");
  // 4a. Correct password for legacy admin
  const adminLoginSuccess = await runLogin({ email: testAdminEmail, password: testPassword });
  assert.strictEqual(adminLoginSuccess.status, 200, "Should authenticate legacy admin with 200 OK");
  assert(adminLoginSuccess.data.token, "Response must include JWT token");
  assert.strictEqual(adminLoginSuccess.data.role, "admin", "Role should match admin");
  console.log("   ✅ 4a: Legacy admin authenticated successfully via fallback");

  console.log("\n5. Testing emailLogin with non-existent user...");
  const nonExistentLogin = await runLogin({ email: "doesnotexist_ever@uniques.org", password: "somePassword" });
  assert.strictEqual(nonExistentLogin.status, 401, "Should return 401 for non-existent account");
  assert.strictEqual(nonExistentLogin.data.message, "Not a member, please contact tech team.");
  console.log("   ✅ 5: Non-existent user properly returns 401 'Not a member, please contact tech team.'");

  console.log("\n6. Cleaning up test documents...");
  await db.collection("members").deleteOne({ email: testMemberEmail });
  await db.collection("admins").deleteOne({ email: testAdminEmail });
  console.log("   ✅ Test documents cleaned up.");

  console.log("\n========================================================");
  console.log("🎉 ALL AUTHENTICATION FALLBACK TESTS PASSED!");
  console.log("========================================================\n");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});

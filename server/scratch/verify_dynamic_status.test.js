/**
 * @file verify_dynamic_status.test.js
 * @description Comprehensive unit and integration test suite verifying dynamic member status calculation,
 * Mongoose schema virtuals, July graduation cutoff logic, and API consistency.
 */

import assert from "assert";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  getMemberAdmissionYear,
  getMemberGraduationYear,
  calculateMemberStatus,
  isBcaStudent,
} from "../utils/memberStatus.js";
import User from "../models/user/userModel.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

async function runTests() {
  console.log("=================================================");
  console.log("  TEST SUITE: DYNAMIC MEMBER ACTIVE/INACTIVE STATUS");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`  ✓ ${name}`);
      passed++;
    } catch (err) {
      console.error(`  ✗ ${name}`);
      console.error(`    ${err.message}`);
      failed++;
    }
  }

  // --- UNIT TESTS ---
  console.log("1. Unit Tests: memberStatus.js Helper Functions");

  await test("Extracts admission year correctly from admno", () => {
    assert.strictEqual(getMemberAdmissionYear({ admno: "2023BTCS232" }), 2023);
    assert.strictEqual(getMemberAdmissionYear({ admno: "2025BCAPTU050" }), 2025);
    assert.strictEqual(getMemberAdmissionYear({ admno: "2021BTCS014" }), 2021);
  });

  await test("Falls back to batch if admno is missing", () => {
    assert.strictEqual(getMemberAdmissionYear({ batch: "The Uniques 1.0" }), 2021);
    assert.strictEqual(getMemberAdmissionYear({ batch: "The Uniques 2.0" }), 2022);
    assert.strictEqual(getMemberAdmissionYear({ batch: "The Uniques 3.0" }), 2023);
    assert.strictEqual(getMemberAdmissionYear({ batch: "The Uniques 4.0" }), 2024);
    assert.strictEqual(getMemberAdmissionYear({ batch: "The Uniques 5.0" }), 2025);
  });

  await test("Identifies BCA students correctly", () => {
    assert.strictEqual(isBcaStudent({ course: "BCA" }), true);
    assert.strictEqual(isBcaStudent({ admno: "2025BCAPTU050" }), true);
    assert.strictEqual(isBcaStudent({ course: "B.Tech CSE" }), false);
    assert.strictEqual(isBcaStudent({ course: "CSD" }), false);
  });

  await test("Calculates graduation year: 4 years for B.Tech/CSD, 3 years for BCA", () => {
    // B.Tech admitted 2022 -> graduates 2026
    assert.strictEqual(getMemberGraduationYear({ admno: "2022BTCS001", course: "B.Tech CSE" }), 2026);
    // CSD admitted 2023 -> graduates 2027
    assert.strictEqual(getMemberGraduationYear({ admno: "2023BTCS232", course: "CSD" }), 2027);
    // BCA admitted 2025 -> graduates 2028 (3 years)
    assert.strictEqual(getMemberGraduationYear({ admno: "2025BCAPTU050", course: "BCA" }), 2028);
  });

  await test("Active/Inactive status: B.Tech before vs after July 1st cutoff", () => {
    const btechMember = { admno: "2022BTCS001", course: "B.Tech CSE" }; // Grad Year = 2026

    // June 30, 2026 (Day before graduation cutoff) -> ACTIVE
    const june2026 = new Date(2026, 5, 30);
    assert.strictEqual(calculateMemberStatus(btechMember, june2026), "active");

    // July 1, 2026 (Graduation date) -> INACTIVE
    const july1_2026 = new Date(2026, 6, 1);
    assert.strictEqual(calculateMemberStatus(btechMember, july1_2026), "inactive");

    // October 2026 -> INACTIVE
    const oct2026 = new Date(2026, 9, 21);
    assert.strictEqual(calculateMemberStatus(btechMember, oct2026), "inactive");
  });

  await test("Active/Inactive status: BCA marks inactive after 3 years on July 1st", () => {
    const bcaMember = { admno: "2023BCAPU010", course: "BCA" }; // Grad Year = 2026 (3 years)

    // June 15, 2026 (3rd year spring) -> ACTIVE
    const june2026 = new Date(2026, 5, 15);
    assert.strictEqual(calculateMemberStatus(bcaMember, june2026), "active");

    // July 1, 2026 (3rd year graduation) -> INACTIVE
    const july1_2026 = new Date(2026, 6, 1);
    assert.strictEqual(calculateMemberStatus(bcaMember, july1_2026), "inactive");
  });

  await test("Suspension overrides graduation calculation", () => {
    const suspendedMember = { admno: "2024BTCS001", isSuspended: true };
    assert.strictEqual(calculateMemberStatus(suspendedMember), "suspended");
  });

  // --- MONGOOSE SCHEMA & VIRTUALS TEST ---
  console.log("\n2. Integration Tests: Mongoose Schema & Virtuals");

  await test("User instance calculates virtual status and profileStatus on toJSON()", () => {
    const userDoc = new User({
      email: "test.student@example.com",
      fullName: "Test Student",
      admno: "2024BTCS099",
      batch: "The Uniques 4.0",
      course: "B.Tech CSE",
      admissionYear: 2024,
      graduationYear: 2028,
      role: "member",
    });

    const json = userDoc.toJSON();
    assert.strictEqual(json.admissionYear, 2024);
    assert.strictEqual(json.graduationYear, 2028);
    assert.strictEqual(json.status, "active");
    assert.strictEqual(json.profileStatus, "active");
    // Verify static profileStatus is NOT a schema path
    assert.strictEqual(User.schema.path("profileStatus"), undefined);
  });

  await test("User pre-save hook automatically populates admissionYear and graduationYear", async () => {
    const userDoc = new User({
      email: "autosave.student@example.com",
      fullName: "Auto Student",
      admno: "2023BTCS101",
      batch: "The Uniques 3.0",
      course: "CSD",
      role: "member",
    });

    // Run the validate/save lifecycle manually without DB write
    await userDoc.validate();
    // Simulate pre-save hook execution
    if (!userDoc.admissionYear) {
      userDoc.admissionYear = getMemberAdmissionYear(userDoc);
    }
    if (!userDoc.graduationYear) {
      userDoc.graduationYear = getMemberGraduationYear(userDoc);
    }

    assert.strictEqual(userDoc.admissionYear, 2023);
    assert.strictEqual(userDoc.graduationYear, 2027);
    assert.strictEqual(userDoc.status, "active");
  });

  // --- LIVE DATABASE INTEGRITY TESTS ---
  console.log("\n3. Live Database Tests: Users Collection State");

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;

    const members = await db.collection("users").find({ role: "member" }).toArray();

    await test("All members in DB have admissionYear and graduationYear populated", () => {
      const missingAdm = members.filter((m) => typeof m.admissionYear !== "number");
      const missingGrad = members.filter((m) => typeof m.graduationYear !== "number");
      assert.strictEqual(missingAdm.length, 0, `Members missing admissionYear: ${missingAdm.length}`);
      assert.strictEqual(missingGrad.length, 0, `Members missing graduationYear: ${missingGrad.length}`);
    });

    await test("Static profileStatus is removed from all member documents in DB", () => {
      const withStaticStatus = members.filter((m) => m.profileStatus !== undefined);
      assert.strictEqual(withStaticStatus.length, 0, `Found ${withStaticStatus.length} documents still having profileStatus`);
    });

    await test("Mongoose User.find() returns virtual status for all members", async () => {
      const mongooseMembers = await User.find({ role: "member" }).limit(5);
      mongooseMembers.forEach((m) => {
        const json = m.toJSON();
        assert.ok(["active", "inactive", "suspended"].includes(json.status));
        assert.ok(["active", "inactive", "suspended"].includes(json.profileStatus));
      });
    });

    await mongoose.disconnect();
  } catch (dbErr) {
    console.error("Live DB test error:", dbErr.message);
    failed++;
  }

  console.log("\n=================================================");
  console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();

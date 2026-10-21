/**
 * @file verify_member_endpoints.test.js
 * @description Verifies memberController functions with dynamic status calculation and count metrics.
 */

import assert from "assert";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  getAllMembers,
  getAdminMemberCounts,
  getMembersByProfileStatus,
} from "../controller/admin/memberController.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

async function run() {
  console.log("=================================================");
  console.log("  TEST SUITE: MEMBER CONTROLLER ENDPOINTS");
  console.log("=================================================\n");

  await mongoose.connect(process.env.MONGODB_URI);

  // 1. Test getAdminMemberCounts
  const mockReqCounts = {};
  let countsResult = null;
  const mockResCounts = {
    status: (code) => {
      assert.strictEqual(code, 200);
      return {
        json: (data) => {
          countsResult = data;
          return data;
        },
      };
    },
  };

  await getAdminMemberCounts(mockReqCounts, mockResCounts);
  assert.ok(countsResult && countsResult.success);
  console.log("  ✓ getAdminMemberCounts succeeded:", countsResult.data);

  // 2. Test getAllMembers
  const mockReqAll = { query: { limit: 10, page: 1 } };
  let allMembersResult = null;
  const mockResAll = {
    status: (code) => {
      assert.strictEqual(code, 200);
      return {
        json: (data) => {
          allMembersResult = data;
          return data;
        },
      };
    },
  };

  await getAllMembers(mockReqAll, mockResAll);
  assert.ok(allMembersResult && allMembersResult.success);
  assert.ok(allMembersResult.data.length > 0);
  const sample = allMembersResult.data[0];
  console.log(`  ✓ getAllMembers returned ${allMembersResult.data.length} members. Sample:`, {
    fullName: sample.fullName,
    batch: sample.batch,
    admno: sample.admno,
    admissionYear: sample.admissionYear,
    graduationYear: sample.graduationYear,
    status: sample.status,
    profileStatus: sample.profileStatus,
  });
  assert.ok(["active", "inactive", "suspended"].includes(sample.status));

  // 3. Test getMembersByProfileStatus('active')
  const mockReqActive = { params: { status: "active" } };
  let activeResult = null;
  const mockResActive = {
    status: (code) => {
      assert.strictEqual(code, 200);
      return {
        json: (data) => {
          activeResult = data;
          return data;
        },
      };
    },
  };

  await getMembersByProfileStatus(mockReqActive, mockResActive);
  assert.ok(activeResult && activeResult.success);
  console.log(`  ✓ getMembersByProfileStatus('active') returned ${activeResult.count} active members.`);
  activeResult.data.forEach((m) => {
    assert.strictEqual(m.status, "active");
  });

  // 4. Test getMembersByProfileStatus('inactive')
  const mockReqInactive = { params: { status: "inactive" } };
  let inactiveResult = null;
  const mockResInactive = {
    status: (code) => {
      assert.strictEqual(code, 200);
      return {
        json: (data) => {
          inactiveResult = data;
          return data;
        },
      };
    },
  };

  await getMembersByProfileStatus(mockReqInactive, mockResInactive);
  assert.ok(inactiveResult && inactiveResult.success);
  console.log(`  ✓ getMembersByProfileStatus('inactive') returned ${inactiveResult.count} inactive members.`);
  inactiveResult.data.forEach((m) => {
    assert.strictEqual(m.status, "inactive");
  });

  await mongoose.disconnect();
  console.log("\n=================================================");
  console.log("  ALL CONTROLLER ENDPOINT TESTS PASSED!");
  console.log("=================================================\n");
}

run();

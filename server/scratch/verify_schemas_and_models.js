import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "../..");

let totalPassed = 0;
let totalFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    totalPassed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    totalFailed++;
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("SCHEMA & MODEL INTEGRITY VERIFICATION SUITE");
  console.log("==================================================\n");

  // TEST 1: Verify src/.env is removed
  console.log("Test Suite 1: Security Hygiene - Frontend Credential Removal");
  const srcEnvPath = path.join(projectRoot, "src/.env");
  assert(!fs.existsSync(srcEnvPath), "src/.env must not exist on disk");

  // TEST 2: Idempotent Model Compilation (Re-importing with cache-busting)
  console.log("\nTest Suite 2: Idempotent Model Compilation");
  const modelFiles = [
    "server/models/admin/adminModel.js",
    "server/models/admin/trainerModel.js",
    "server/models/member/formResponse.js",
    "server/models/member/memberModel.js",
    "server/models/member/fileModel.js",
    "server/models/member/formModel.js",
    "server/models/member/eventModel.js",
    "server/models/member/guestModel.js",
    "server/models/member/leaveModel.js",
    "server/models/Enquiry/enquiryModel.js",
    "server/models/uniques360/Report.js",
    "server/models/uniques360/Task.js",
    "server/models/community/campusAmbassadorModel.js",
    "server/models/community/communityAdmin.js",
  ];

  for (const relPath of modelFiles) {
    const fullPath = path.join(projectRoot, relPath);
    try {
      // First import
      const mod1 = await import(`${fullPath}?t1=${Date.now()}`);
      const model1 = mod1.default;
      assert(!!model1, `First import succeeded for ${relPath}`);

      // Second import (forces re-evaluation of the module body)
      const mod2 = await import(`${fullPath}?t2=${Date.now()}`);
      const model2 = mod2.default;
      assert(
        model1 === model2,
        `Idempotent re-import succeeded without OverwriteModelError for ${relPath}`
      );
    } catch (err) {
      assert(false, `Model re-import failed for ${relPath}: ${err.message}`);
    }
  }

  // TEST 3: Schema Foreign Key Referential Integrity
  console.log("\nTest Suite 3: Schema Foreign Key Referential Integrity");
  
  // Event model checks
  const eventMod = await import(path.join(projectRoot, "server/models/member/eventModel.js"));
  const Event = eventMod.default;
  const eventPaths = Event.schema.paths;

  const eventUserIdPaths = [
    "budget.lastUpdatedBy.userId",
    "expenses.createdBy.userId",
    "expenses.updatedBy.userId",
    "budgetAllocations.createdBy.userId",
    "budgetAllocations.updatedBy.userId",
    "budgetHistory.performedBy.userId",
  ];

  for (const p of eventUserIdPaths) {
    const schemaType = Event.schema.path(p);
    assert(
      schemaType && schemaType.options && schemaType.options.ref === "Member",
      `Event schema path '${p}' must reference 'Member' (found: ${schemaType?.options?.ref})`
    );
  }

  // Ensure no path in Event schema references 'User'
  let foundEventUserRef = false;
  for (const [pathname, schemaType] of Object.entries(Event.schema.paths)) {
    if (schemaType.options && schemaType.options.ref === "User") {
      foundEventUserRef = true;
      console.error(`Found invalid 'User' ref in Event path: ${pathname}`);
    }
  }
  assert(!foundEventUserRef, "No paths in Event schema reference non-existent 'User' model");

  // Enquiry model checks
  const enquiryMod = await import(path.join(projectRoot, "server/models/Enquiry/enquiryModel.js"));
  const Enquiry = enquiryMod.default;
  const respondedByPath = Enquiry.schema.path("responseDetails.respondedBy");
  assert(
    respondedByPath && respondedByPath.options && respondedByPath.options.ref === "Admin",
    `Enquiry schema path 'responseDetails.respondedBy' must reference 'Admin' (found: ${respondedByPath?.options?.ref})`
  );

  let foundEnquiryUserRef = false;
  for (const [pathname, schemaType] of Object.entries(Enquiry.schema.paths)) {
    if (schemaType.options && schemaType.options.ref === "User") {
      foundEnquiryUserRef = true;
      console.error(`Found invalid 'User' ref in Enquiry path: ${pathname}`);
    }
  }
  assert(!foundEnquiryUserRef, "No paths in Enquiry schema reference non-existent 'User' model");

  // TEST 4: Static Import and Direct Method in memberController.js
  console.log("\nTest Suite 4: memberController.js Model Loading Analysis");
  const memberControllerContent = fs.readFileSync(
    path.join(projectRoot, "server/controller/admin/memberController.js"),
    "utf-8"
  );
  assert(
    memberControllerContent.includes('import File from "../../models/member/fileModel.js";'),
    "memberController.js contains static File model import"
  );
  assert(
    !memberControllerContent.includes('mongoose.model("File")'),
    "memberController.js does not use dynamic mongoose.model('File') lookup"
  );
  assert(
    memberControllerContent.includes("await File.findByIdAndDelete(fileId);"),
    "memberController.js invokes File.findByIdAndDelete(fileId) directly"
  );

  // TEST 5: Connection Lifecycle in seedProjects.js
  console.log("\nTest Suite 5: Connection Lifecycle in seedProjects.js");
  const seedProjectsContent = fs.readFileSync(
    path.join(projectRoot, "server/seedProjects.js"),
    "utf-8"
  );
  
  // Extract seedProjects function text
  const seedProjectsFuncMatch = seedProjectsContent.match(/export const seedProjects = async \(\) => {([\s\S]*?)};/);
  const seedProjectsBody = seedProjectsFuncMatch ? seedProjectsFuncMatch[1] : "";
  assert(
    !seedProjectsBody.includes("mongoose.disconnect()"),
    "seedProjects() function body does not disconnect Mongoose"
  );
  assert(
    seedProjectsContent.includes("if (isDirectRun)"),
    "seedProjects.js guards CLI execution with isDirectRun check"
  );

  // TEST 6: ifTokenVerify.js Fallthrough Bug Fix
  console.log("\nTest Suite 6: ifTokenVerify.js Fallthrough Behavior");
  const ifTokenVerifyPath = path.join(projectRoot, "server/middlewares/ifTokenVerify.js");
  const ifTokenVerifyContent = fs.readFileSync(ifTokenVerifyPath, "utf-8");
  assert(
    ifTokenVerifyContent.includes("return next();"),
    "ifTokenVerify.js has explicit 'return next();' when !token"
  );

  // Functional test of ifTokenVerify
  const ifTokenVerifyMod = await import(`${ifTokenVerifyPath}?t=${Date.now()}`);
  const ifTokenVerify = ifTokenVerifyMod.default;

  let nextCalled = false;
  let statusCalled = false;
  const mockReq = { cookies: {} };
  const mockRes = {
    status: (code) => {
      statusCalled = true;
      return { json: () => {} };
    }
  };
  const mockNext = () => {
    nextCalled = true;
  };

  ifTokenVerify(mockReq, mockRes, mockNext);
  assert(nextCalled, "ifTokenVerify calls next() when token cookie is missing");
  assert(!statusCalled, "ifTokenVerify does NOT send 401 when token cookie is missing");

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
  console.error("Verification script encountered an unhandled error:", err);
  process.exit(1);
});

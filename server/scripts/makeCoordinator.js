/**
 * @file makeCoordinator.js
 * @description Safe CLI utility to promote a member to coordinator (or revert) across unified 'users' and legacy 'members' collections.
 * @usage
 *   # Dry-run inspection (default):
 *   node server/scripts/makeCoordinator.js --email user@example.com
 *   node server/scripts/makeCoordinator.js --admno 2022BTCS013
 * 
 *   # Live execution against local/dev DB:
 *   node server/scripts/makeCoordinator.js --email user@example.com --execute
 * 
 *   # Dry-run against Production DB:
 *   node server/scripts/makeCoordinator.js --email user@example.com --prod
 * 
 *   # Live execution against Production DB (Requires confirmation):
 *   node server/scripts/makeCoordinator.js --email user@example.com --prod --execute
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

// Parse command line arguments
const args = process.argv.slice(2);
const getArg = (flag) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && args[idx + 1] ? args[idx + 1] : null;
};
const hasFlag = (flag) => args.includes(flag);

const emailArg = getArg("--email");
const admnoArg = getArg("--admno");
const idArg = getArg("--id");
const customRoleArg = getArg("--role") || "coordinator";
const designationArg = getArg("--designation");
const isProd = hasFlag("--prod");
const isExecute = hasFlag("--execute");
const isDryRun = !isExecute;
const customUri = getArg("--uri");

const PROD_MONGODB_URI = process.env.PROD_MONGODB_URI;

async function main() {
  console.log("====================================================");
  console.log("  COORDINATOR ROLE MANAGEMENT UTILITY");
  console.log(`  Mode: ${isDryRun ? "DRY-RUN (Simulation - DB will NOT change)" : "LIVE EXECUTION (Database will be updated!)"}`);
  console.log(`  Target Environment: ${isProd ? "PRODUCTION" : "LOCAL / DEV"}`);
  console.log("====================================================\n");

  if (!emailArg && !admnoArg && !idArg) {
    console.error("❌ Error: Target identifier required. Please provide --email, --admno, or --id.");
    console.error("Example: node server/scripts/makeCoordinator.js --email user@example.com\n");
    process.exit(1);
  }

  const validRoles = ["coordinator", "member", "admin", "communityadmin"];
  if (!validRoles.includes(customRoleArg.toLowerCase())) {
    console.error(`❌ Error: Invalid role "${customRoleArg}". Allowed roles: ${validRoles.join(", ")}`);
    process.exit(1);
  }
  const targetRole = customRoleArg.toLowerCase();

  // Select URI
  let uri = process.env.MONGODB_URI;
  if (customUri) {
    uri = customUri;
  } else if (isProd) {
    uri = PROD_MONGODB_URI;
    if (!uri) {
      console.error("❌ Error: --prod requested, but PROD_MONGODB_URI environment variable is not defined.");
      console.error("   Please set PROD_MONGODB_URI in your environment or pass --uri <connection_string>.");
      process.exit(1);
    }
  }

  if (!uri) {
    console.error("❌ Error: No MongoDB connection URI found. Set MONGODB_URI in .env or pass --uri.");
    process.exit(1);
  }

  console.log(`--> Connecting to MongoDB (${isProd ? "Production" : "Dev"})...`);
  const conn = await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });
  const db = mongoose.connection.db;
  console.log(`✅ Connected successfully to database: "${mongoose.connection.name}"\n`);

  try {
    // 1. Build lookup query
    const query = {};
    if (emailArg) {
      query.email = emailArg.toLowerCase().trim();
    } else if (admnoArg) {
      query.admno = admnoArg.toUpperCase().trim();
    } else if (idArg) {
      query._id = mongoose.Types.ObjectId.isValid(idArg)
        ? new mongoose.Types.ObjectId(idArg)
        : idArg;
    }

    console.log("--> Searching for user with criteria:", query);
    const userDoc = await db.collection("users").findOne(query);

    if (!userDoc) {
      console.error("❌ User not found in 'users' collection!");
      // Check legacy members collection to advise if they only exist there
      const legacyMember = await db.collection("members").findOne(query);
      if (legacyMember) {
        console.warn("⚠️ Note: User was found in legacy 'members' collection but NOT in unified 'users' collection.");
        console.warn("   Run 'server/scripts/migrateToUnifiedUser.js' first or investigate unmigrated record.");
      }
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`✅ User found in 'users' collection:`);
    console.log(`   - ID: ${userDoc._id}`);
    console.log(`   - Full Name: ${userDoc.fullName || "(unnamed)"}`);
    console.log(`   - Email: ${userDoc.email}`);
    console.log(`   - Admission No: ${userDoc.admno || "N/A"}`);
    console.log(`   - Batch: ${userDoc.batch || "N/A"}`);
    console.log(`   - Current Role: "${userDoc.role || "member"}"`);
    console.log(`   - Current Designation: "${userDoc.designation || "(none)"}"`);
    console.log(`   - Google ID: ${userDoc.googleId ? "Linked" : "Not Linked"}\n`);

    // Check legacy collection existence
    const legacyMemberDoc = await db.collection("members").findOne({ _id: userDoc._id });
    const existsInLegacy = Boolean(legacyMemberDoc);
    console.log(`   - Exists in legacy 'members' collection: ${existsInLegacy ? "YES" : "NO"}\n`);

    if (userDoc.role === targetRole) {
      console.log(`ℹ️ User already has role: "${targetRole}".`);
      if (!designationArg || designationArg === userDoc.designation) {
        console.log("   No changes needed. Exiting.");
        await mongoose.disconnect();
        return;
      }
    }

    // 2. Prepare Update Payload
    const updateSet = {
      role: targetRole,
      updatedAt: new Date(),
    };
    if (designationArg !== null && designationArg !== undefined) {
      updateSet.designation = designationArg;
    }

    console.log("--> Planned Changes:");
    console.log(`   • role: "${userDoc.role || "member"}" ➔ "${targetRole}"`);
    if (designationArg !== null && designationArg !== undefined) {
      console.log(`   • designation: "${userDoc.designation || ""}" ➔ "${designationArg}"`);
    }
    console.log(`   • tokenVersion: ${userDoc.tokenVersion || 0} ➔ ${(userDoc.tokenVersion || 0) + 1} (Invalidates active sessions)`);
    console.log(`   • collections affected: 'users'${existsInLegacy ? ", 'members' (mirror sync)" : ""}\n`);

    if (isDryRun) {
      console.log("====================================================");
      console.log("✨ DRY-RUN COMPLETED. ZERO CHANGES MADE TO DATABASE.");
      console.log("To apply this change live, re-run with --execute:");
      const cmdParts = ["node server/scripts/makeCoordinator.js"];
      if (emailArg) cmdParts.push(`--email ${emailArg}`);
      else if (admnoArg) cmdParts.push(`--admno ${admnoArg}`);
      else if (idArg) cmdParts.push(`--id ${idArg}`);
      if (targetRole !== "coordinator") cmdParts.push(`--role ${targetRole}`);
      if (designationArg) cmdParts.push(`--designation "${designationArg}"`);
      if (isProd) cmdParts.push("--prod");
      cmdParts.push("--execute");
      console.log(`   ${cmdParts.join(" ")}`);
      console.log("====================================================");
      await mongoose.disconnect();
      return;
    }

    // 3. Live Execution
    console.log("--> STEP 1: Updating document in 'users' collection...");
    const userUpdateResult = await db.collection("users").updateOne(
      { _id: userDoc._id },
      {
        $set: updateSet,
        $inc: { tokenVersion: 1 },
      }
    );
    console.log(`✅ 'users' collection updated. Matched: ${userUpdateResult.matchedCount}, Modified: ${userUpdateResult.modifiedCount}`);

    if (existsInLegacy) {
      console.log("--> STEP 2: Synchronizing role in legacy 'members' collection...");
      const legacyUpdateResult = await db.collection("members").updateOne(
        { _id: userDoc._id },
        {
          $set: updateSet,
        }
      );
      console.log(`✅ 'members' collection synchronized. Matched: ${legacyUpdateResult.matchedCount}, Modified: ${legacyUpdateResult.modifiedCount}`);
    }

    // 4. Verification Check
    console.log("--> STEP 3: Verifying updated document from DB...");
    const verifiedUser = await db.collection("users").findOne({ _id: userDoc._id });
    console.log(`✅ Verification Success:`);
    console.log(`   - ID: ${verifiedUser._id}`);
    console.log(`   - Full Name: ${verifiedUser.fullName}`);
    console.log(`   - Email: ${verifiedUser.email}`);
    console.log(`   - Verified Role: "${verifiedUser.role}"`);
    console.log(`   - Token Version: ${verifiedUser.tokenVersion}\n`);

    console.log("====================================================");
    console.log("🎉 SUCCESS: User has been promoted to COORDINATOR!");
    console.log("Next Steps for the user:");
    console.log("1. Advise the user to log out and log back in to get a fresh JWT token with role 'coordinator'.");
    console.log("2. Upon login, they will be automatically redirected to: /coordinator/dashboard");
    console.log("3. They will now have access to all coordinator views, leave approvals, event budget CRUD, and Uniques360 task delegation.");
    console.log("====================================================");
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((err) => {
  console.error("❌ Fatal Error:", err);
  process.exit(1);
});

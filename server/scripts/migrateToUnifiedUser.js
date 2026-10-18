/**
 * @file migrateToUnifiedUser.js
 * @description Production database migration script consolidating Member, Admin, and CommunityAdmin collections into 'users'.
 * @usage
 *   node server/scripts/migrateToUnifiedUser.js --dry-run
 *   node server/scripts/migrateToUnifiedUser.js
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const isDryRun = process.argv.includes("--dry-run");
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, "-");
const BACKUP_PREFIX = `backup_${TIMESTAMP}_`;

async function main() {
  console.log(`====================================================`);
  console.log(`UNIFIED USER MODEL DATABASE MIGRATION`);
  console.log(`Mode: ${isDryRun ? "DRY-RUN (Validation & Simulation Only)" : "LIVE MIGRATION"}`);
  console.log(`Timestamp: ${TIMESTAMP}`);
  console.log(`====================================================\n`);

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is missing.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // 1. PRE-FLIGHT INTEGRITY & DUPLICATE CHECKS
  console.log("--> STEP 1: Running Pre-flight Integrity & Collision Analysis...");
  const preflight = await runPreflightCheck(db);
  if (!preflight.success) {
    console.error("❌ Pre-flight check failed! Halting migration.");
    console.error(preflight.errors);
    await mongoose.disconnect();
    process.exit(1);
  }
  console.log("✅ Pre-flight checks passed.");
  console.log(`   Total consolidated users planned: ${preflight.deduplicationPlan.documentsToInsert.length}`);
  console.log(`   Total merged ID mappings: ${preflight.deduplicationPlan.idMapping.size}\n`);

  if (isDryRun) {
    console.log("--> DRY-RUN SIMULATION:");
    console.log("   Validating schema transformations on planned documents...");
    validateTransformedDocuments(preflight.deduplicationPlan.documentsToInsert);
    console.log("   Simulating index integrity...");
    simulateIndexUniqueness(preflight.deduplicationPlan.documentsToInsert);
    console.log("\n✨ Dry run completed successfully with ZERO errors! Database unchanged.");
    await mongoose.disconnect();
    return;
  }

  // Check if users collection already exists
  const existingUsers = await db.listCollections({ name: "users" }).toArray();
  if (existingUsers.length > 0) {
    const userCount = await db.collection("users").countDocuments();
    if (userCount > 0) {
      throw new Error(
        `Collection 'users' already exists with ${userCount} documents. Run rollbackUnifiedUser.js first if you wish to re-run migration.`
      );
    }
  }

  // 2. CREATE BACKUP COLLECTIONS
  console.log("--> STEP 2: Creating Point-in-Time Collection Backups...");
  await createBackups(db, TIMESTAMP);
  console.log("✅ Backups created successfully.\n");

  // 3. EXECUTE MIGRATION & INSERTION
  console.log("--> STEP 3: Inserting Documents into 'users' Collection...");
  const migrationResult = await executeMigration(db, preflight.deduplicationPlan);
  console.log(`✅ Migrated ${migrationResult.expectedCount} unified users.\n`);

  // 4. CASCADE FOREIGN REFERENCES
  console.log("--> STEP 4: Cascading Foreign Reference Updates for Merged IDs...");
  await repointForeignReferences(db, migrationResult.idMapping);
  console.log("✅ Foreign references validated and re-pointed.\n");

  // 5. CREATE INDEXES
  console.log("--> STEP 5: Creating Unique & Partial Indexes on 'users'...");
  await createIndexes(db);
  console.log("✅ Indexes verified.\n");

  // 6. POST-MIGRATION VERIFICATION
  console.log("--> STEP 6: Running Post-Migration Verification Queries...");
  await verifyMigrationIntegrity(db, migrationResult.expectedCount);
  console.log("✅ All post-migration integrity tests PASSED.\n");

  console.log(`====================================================`);
  console.log(`MIGRATION COMPLETED SUCCESSFULLY!`);
  console.log(`Backup snapshots available under prefix: ${BACKUP_PREFIX}`);
  console.log(`====================================================`);

  await mongoose.disconnect();
}

/**
 * Pre-flight check analyzes source collections, resolves known duplicates,
 * and builds canonical document list and ID remapping dictionary.
 */
async function runPreflightCheck(db) {
  const members = await db.collection("members").find().toArray();
  const admins = await db.collection("admins").find().toArray();
  const communityAdmins = await db.collection("communityadmins").find().toArray();

  console.log(`   Discovered: ${members.length} Members, ${admins.length} Admins, ${communityAdmins.length} CommunityAdmins.`);

  const idMapping = new Map();
  const emailToCanonicalDoc = new Map();
  const errors = [];

  // Step A: Process Admins
  for (const admin of admins) {
    const email = admin.email?.toLowerCase().trim();
    if (!email) {
      errors.push(`Admin ${admin._id} is missing an email address.`);
      continue;
    }
    const adminDoc = {
      _id: admin._id,
      fullName: admin.fullName || "",
      email: email,
      password: admin.password,
      role: "admin",
      profileStatus: admin.profileStatus || "active",
      contact: admin.adminContact || admin.contact || "",
      designation: admin.adminDesignation || admin.designation || "Administrator",
      profilePic: mongoose.Types.ObjectId.isValid(admin.profilePic)
        ? new mongoose.Types.ObjectId(admin.profilePic)
        : null,
      avatarUrl:
        typeof admin.profilePic === "string" && !mongoose.Types.ObjectId.isValid(admin.profilePic)
          ? admin.profilePic
          : "",
      googleId: admin.googleId ? admin.googleId.toString().trim() : undefined,
      isVerified: true,
      isSuspended: false,
      tokenVersion: 0,
      createdAt: admin.createdAt || new Date(),
      updatedAt: admin.updatedAt || new Date(),
    };
    if (!adminDoc.googleId) delete adminDoc.googleId;
    emailToCanonicalDoc.set(email, adminDoc);
  }

  // Step B: Process CommunityAdmins
  for (const ca of communityAdmins) {
    const email = ca.email?.toLowerCase().trim();
    if (!email) {
      errors.push(`CommunityAdmin ${ca._id} is missing an email address.`);
      continue;
    }
    if (emailToCanonicalDoc.has(email)) {
      const existing = emailToCanonicalDoc.get(email);
      idMapping.set(ca._id.toString(), existing._id.toString());
      console.log(`   [MERGE] Merging CommunityAdmin ${ca._id} into Admin ${existing._id} (${email})`);
    } else {
      const caDoc = {
        _id: ca._id,
        fullName: ca.fullName || "",
        email: email,
        password: ca.password,
        role: "communityadmin",
        profileStatus: "active",
        contact: ca.coordinatorContact || ca.contact || "",
        designation: ca.coordinatorDesignation || ca.designation || "Community Admin",
        profilePic: mongoose.Types.ObjectId.isValid(ca.profilePic)
          ? new mongoose.Types.ObjectId(ca.profilePic)
          : null,
        avatarUrl:
          typeof ca.profilePic === "string" && !mongoose.Types.ObjectId.isValid(ca.profilePic)
            ? ca.profilePic
            : "",
        googleId: ca.googleId ? ca.googleId.toString().trim() : undefined,
        isVerified: true,
        isSuspended: false,
        tokenVersion: 0,
        createdAt: ca.createdAt || new Date(),
        updatedAt: ca.updatedAt || new Date(),
      };
      if (!caDoc.googleId) delete caDoc.googleId;
      emailToCanonicalDoc.set(email, caDoc);
    }
  }

  // Step C: Process Members
  for (const member of members) {
    const email = member.email?.toLowerCase().trim();
    if (!email) {
      errors.push(`Member ${member._id} is missing an email address.`);
      continue;
    }

    if (emailToCanonicalDoc.has(email)) {
      const existing = emailToCanonicalDoc.get(email);

      // Case 1: Cross-collection overlap between Member and Admin/CommunityAdmin (e.g., hyggefieed96@gmail.com)
      if (existing.role === "admin" || existing.role === "communityadmin") {
        console.log(
          `   [MERGE] Member ${member._id} overlaps with ${existing.role} (${email}). Adopting Member ID as canonical and elevating role to '${existing.role}'.`
        );
        const oldAdminId = existing._id.toString();
        const canonicalMemberId = member._id.toString();
        idMapping.set(oldAdminId, canonicalMemberId);

        const mergedDoc = {
          ...member,
          _id: member._id,
          email: email,
          role: existing.role, // Elevate role to 'admin' / 'communityadmin'
          password: existing.password || member.password,
          designation: existing.designation || member.designation || "",
          contact: existing.contact || member.contact || "",
          profileStatus: existing.profileStatus || member.profileStatus || "active",
          isVerified: true,
          googleId: member.googleId || existing.googleId || undefined,
          tokenVersion: 0,
          updatedAt: new Date(),
        };
        if (!mergedDoc.googleId) delete mergedDoc.googleId;
        if (!mergedDoc.admno || mergedDoc.admno.toString().trim() === "") delete mergedDoc.admno;
        emailToCanonicalDoc.set(email, mergedDoc);
      } else {
        // Case 2: Duplicate Member in members collection (e.g. Khushiporwal98@gmail.com vs khushiporwal98@gmail.com)
        console.log(`   [MERGE] Deduplicating case-variant Member records for ${email}`);
        if (member.admno && !existing.admno) {
          // New member doc has admno, existing does not: adopt member._id as canonical
          idMapping.set(existing._id.toString(), member._id.toString());
          const merged = {
            ...existing,
            ...member,
            _id: member._id,
            email: email,
            tokenVersion: 0,
          };
          if (!merged.googleId) delete merged.googleId;
          if (!merged.admno || merged.admno.toString().trim() === "") delete merged.admno;
          emailToCanonicalDoc.set(email, merged);
        } else {
          // Existing member doc already has admno or is canonical: map member._id to existing._id
          idMapping.set(member._id.toString(), existing._id.toString());
          const merged = {
            ...member,
            ...existing,
            _id: existing._id,
            email: email,
            tokenVersion: 0,
          };
          if (!merged.googleId) delete merged.googleId;
          if (!merged.admno || merged.admno.toString().trim() === "") delete merged.admno;
          emailToCanonicalDoc.set(email, merged);
        }
      }
    } else {
      // Standard member insertion
      const memberDoc = {
        ...member,
        _id: member._id,
        email: email,
        role: member.role ? member.role.toLowerCase().trim() : "member",
        profileStatus: member.profileStatus || "inactive",
        tokenVersion: 0,
      };
      if (memberDoc.googleId) {
        memberDoc.googleId = memberDoc.googleId.toString().trim();
      } else {
        delete memberDoc.googleId;
      }
      if (!memberDoc.admno || memberDoc.admno.toString().trim() === "") {
        delete memberDoc.admno;
      }
      emailToCanonicalDoc.set(email, memberDoc);
    }
  }

  // Pre-flight validation on planned documents
  const plannedDocs = Array.from(emailToCanonicalDoc.values());
  const emailSet = new Set();
  const admnoSet = new Set();
  const googleIdSet = new Set();

  for (const doc of plannedDocs) {
    if (emailSet.has(doc.email)) {
      errors.push(`Duplicate email found in canonical plan: ${doc.email}`);
    }
    emailSet.add(doc.email);

    if (doc.admno) {
      const cleanAdm = doc.admno.toString().trim().toUpperCase();
      if (admnoSet.has(cleanAdm)) {
        errors.push(`Duplicate admno found in canonical plan: ${cleanAdm}`);
      }
      admnoSet.add(cleanAdm);
    }

    if (doc.googleId) {
      const cleanGid = doc.googleId.toString().trim();
      if (googleIdSet.has(cleanGid)) {
        errors.push(`Duplicate googleId found in canonical plan: ${cleanGid}`);
      }
      googleIdSet.add(cleanGid);
    }
  }

  return {
    success: errors.length === 0,
    errors,
    deduplicationPlan: {
      documentsToInsert: plannedDocs,
      idMapping,
    },
  };
}

function validateTransformedDocuments(docs) {
  for (const doc of docs) {
    if (!doc.email || typeof doc.email !== "string") {
      throw new Error(`Invalid email on doc ${doc._id}`);
    }
    if (!doc.role || typeof doc.role !== "string") {
      throw new Error(`Invalid role on doc ${doc._id}`);
    }
    if (doc.admno && typeof doc.admno !== "string") {
      throw new Error(`Invalid admno format on doc ${doc._id}`);
    }
  }
  console.log(`   Validated schema for all ${docs.length} planned user documents.`);
}

function simulateIndexUniqueness(docs) {
  const emails = new Set();
  const admnos = new Set();
  const googleIds = new Set();

  for (const doc of docs) {
    if (emails.has(doc.email)) {
      throw new Error(`Index Simulation Failure: Duplicate email ${doc.email}`);
    }
    emails.add(doc.email);

    if (doc.admno) {
      const a = doc.admno.toString().trim().toUpperCase();
      if (admnos.has(a)) {
        throw new Error(`Index Simulation Failure: Duplicate admno ${a}`);
      }
      admnos.add(a);
    }

    if (doc.googleId) {
      const g = doc.googleId.toString().trim();
      if (googleIds.has(g)) {
        throw new Error(`Index Simulation Failure: Duplicate googleId ${g}`);
      }
      googleIds.add(g);
    }
  }
  console.log(`   Simulated index uniqueness verified (${emails.size} emails, ${admnos.size} admnos, ${googleIds.size} googleIds).`);
}

/**
 * Creates automated timestamped backup collections.
 */
async function createBackups(db, timestamp) {
  const collections = [
    "members",
    "admins",
    "communityadmins",
    "tasks",
    "files",
    "events",
    "leaves",
    "blogs",
    "reports",
    "formresponses",
  ];

  for (const collName of collections) {
    const backupName = `backup_${timestamp}_${collName}`;
    const docs = await db.collection(collName).find().toArray();
    if (docs.length > 0) {
      await db.collection(backupName).insertMany(docs);
      console.log(`   Snapshot created: '${collName}' (${docs.length} docs) -> '${backupName}'`);
    } else {
      console.log(`   Skipped empty collection: '${collName}'`);
    }
  }
}

/**
 * Normalizes and inserts unified documents into 'users'.
 */
async function executeMigration(db, deduplicationPlan) {
  const usersCollection = db.collection("users");
  const { documentsToInsert, idMapping } = deduplicationPlan;

  const cleanedDocs = documentsToInsert.map((doc) => {
    const cleaned = { ...doc };
    cleaned.email = cleaned.email.toLowerCase().trim();
    if (cleaned.role) cleaned.role = cleaned.role.toLowerCase().trim();

    if (!cleaned.admno || cleaned.admno.toString().trim() === "") {
      delete cleaned.admno;
    } else {
      cleaned.admno = cleaned.admno.toString().trim().toUpperCase();
    }

    if (!cleaned.googleId || cleaned.googleId.toString().trim() === "") {
      delete cleaned.googleId;
    } else {
      cleaned.googleId = cleaned.googleId.toString().trim();
    }

    delete cleaned.__v;
    return cleaned;
  });

  await usersCollection.insertMany(cleanedDocs, { ordered: true });
  return { expectedCount: cleanedDocs.length, idMapping };
}

/**
 * Cascades foreign references across referencing collections for all merged IDs.
 */
async function repointForeignReferences(db, idMapping) {
  if (idMapping.size === 0) {
    console.log("   Zero merged IDs requiring reference cascading.");
    return;
  }

  for (const [oldIdStr, newIdStr] of idMapping.entries()) {
    const oldId = new mongoose.Types.ObjectId(oldIdStr);
    const newId = new mongoose.Types.ObjectId(newIdStr);

    console.log(`   Cascading updates for merged ID: ${oldIdStr} -> ${newIdStr}`);

    // Tasks
    const tBy = await db.collection("tasks").updateMany({ assignedBy: oldId }, { $set: { assignedBy: newId } });
    const tTo = await db
      .collection("tasks")
      .updateMany({ "assignedTo.member": oldId }, { $set: { "assignedTo.$.member": newId } });
    if (tBy.modifiedCount > 0 || tTo.modifiedCount > 0) {
      console.log(`     tasks updated: assignedBy=${tBy.modifiedCount}, assignedTo=${tTo.modifiedCount}`);
    }

    // Files
    const files = await db.collection("files").updateMany({ fileOwner: oldId }, { $set: { fileOwner: newId } });
    if (files.modifiedCount > 0) {
      console.log(`     files updated: fileOwner=${files.modifiedCount}`);
    }

    // Events
    const ev1 = await db.collection("events").updateMany(
      { "eventMembers.contributionTeam": oldId },
      { $set: { "eventMembers.$[].contributionTeam.$[elem]": newId } },
      { arrayFilters: [{ elem: oldId }] }
    );
    const ev2 = await db
      .collection("events")
      .updateMany({ "budget.lastUpdatedBy.userId": oldId }, { $set: { "budget.lastUpdatedBy.userId": newId } });
    const ev3 = await db
      .collection("events")
      .updateMany({ "expenses.createdBy.userId": oldId }, { $set: { "expenses.$[].createdBy.userId": newId } });
    const ev4 = await db
      .collection("events")
      .updateMany({ "expenses.updatedBy.userId": oldId }, { $set: { "expenses.$[].updatedBy.userId": newId } });
    const ev5 = await db
      .collection("events")
      .updateMany(
        { "budgetAllocations.createdBy.userId": oldId },
        { $set: { "budgetAllocations.$[].createdBy.userId": newId } }
      );
    const ev6 = await db
      .collection("events")
      .updateMany(
        { "budgetAllocations.updatedBy.userId": oldId },
        { $set: { "budgetAllocations.$[].updatedBy.userId": newId } }
      );
    const ev7 = await db
      .collection("events")
      .updateMany(
        { "budgetHistory.performedBy.userId": oldId },
        { $set: { "budgetHistory.$[].performedBy.userId": newId } }
      );
    const evTotal =
      ev1.modifiedCount +
      ev2.modifiedCount +
      ev3.modifiedCount +
      ev4.modifiedCount +
      ev5.modifiedCount +
      ev6.modifiedCount +
      ev7.modifiedCount;
    if (evTotal > 0) {
      console.log(`     events updated: modified=${evTotal}`);
    }

    // Leaves
    const leaves = await db.collection("leaves").updateMany({ memberId: oldId }, { $set: { memberId: newId } });
    if (leaves.modifiedCount > 0) {
      console.log(`     leaves updated: memberId=${leaves.modifiedCount}`);
    }

    // Reports
    const reports = await db.collection("reports").updateMany({ studentId: oldId }, { $set: { studentId: newId } });
    if (reports.modifiedCount > 0) {
      console.log(`     reports updated: studentId=${reports.modifiedCount}`);
    }

    // Blogs
    const blogs = await db.collection("blogs").updateMany({ author: oldId }, { $set: { author: newId } });
    if (blogs.modifiedCount > 0) {
      console.log(`     blogs updated: author=${blogs.modifiedCount}`);
    }

    // FormResponses
    const formResp = await db
      .collection("formresponses")
      .updateMany({ "respondent.member": oldId }, { $set: { "respondent.member": newId } });
    if (formResp.modifiedCount > 0) {
      console.log(`     formresponses updated: respondent.member=${formResp.modifiedCount}`);
    }
  }
}

/**
 * Creates unique and partial indexes on 'users'.
 */
async function createIndexes(db) {
  const users = db.collection("users");
  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex(
    { admno: 1 },
    {
      unique: true,
      partialFilterExpression: { admno: { $type: "string" } },
    }
  );
  await users.createIndex(
    { googleId: 1 },
    {
      unique: true,
      partialFilterExpression: { googleId: { $type: "string" } },
    }
  );
  await users.createIndex({ role: 1 });
  await users.createIndex({ profileStatus: 1 });
  await users.createIndex({ batch: 1 });
}

/**
 * Verifies post-migration database consistency.
 */
async function verifyMigrationIntegrity(db, expectedCount) {
  const actualCount = await db.collection("users").countDocuments();
  if (actualCount !== expectedCount) {
    throw new Error(`Count mismatch: Expected ${expectedCount}, found ${actualCount}`);
  }

  const dupEmails = await db
    .collection("users")
    .aggregate([
      { $group: { _id: "$email", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ])
    .toArray();

  if (dupEmails.length > 0) {
    throw new Error(`Integrity Failure: Duplicate emails in 'users': ${JSON.stringify(dupEmails)}`);
  }

  const dupAdmnos = await db
    .collection("users")
    .aggregate([
      { $match: { admno: { $exists: true, $ne: null } } },
      { $group: { _id: "$admno", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ])
    .toArray();

  if (dupAdmnos.length > 0) {
    throw new Error(`Integrity Failure: Duplicate admission numbers in 'users': ${JSON.stringify(dupAdmnos)}`);
  }

  const dupGoogleIds = await db
    .collection("users")
    .aggregate([
      { $match: { googleId: { $exists: true, $ne: null } } },
      { $group: { _id: "$googleId", count: { $sum: 1 } } },
      { $match: { count: { $gt: 1 } } },
    ])
    .toArray();

  if (dupGoogleIds.length > 0) {
    throw new Error(`Integrity Failure: Duplicate googleIds in 'users': ${JSON.stringify(dupGoogleIds)}`);
  }

  const roles = await db.collection("users").distinct("role");
  console.log(`   Verified active roles in 'users': ${roles.join(", ")}`);
}

main().catch((err) => {
  console.error("❌ Fatal migration error:", err);
  process.exit(1);
});

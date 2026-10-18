/**
 * @file migrate_files_to_embedded.js
 * @description Enterprise-grade, idempotent database migration script that converts normalized
 * `File` model references (ObjectIds) into embedded subdocuments across `members`, `trainers`,
 * `events`, `users`, and `formresponses` collections.
 *
 * Usage:
 *   # Dry-run on active database (server/.env):
 *   node server/scripts/migrate_files_to_embedded.js --dry-run
 *
 *   # Live execution with automatic pre-migration backup:
 *   node server/scripts/migrate_files_to_embedded.js --backup
 *
 *   # Targeted execution on specific URI:
 *   node server/scripts/migrate_files_to_embedded.js --uri="mongodb+srv://..." --backup
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Parse command line arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const shouldBackup = args.includes("--backup") || !isDryRun; // Default to backup for live runs
const targetUriArg = args.find((a) => a.startsWith("--uri="))?.slice("--uri=".length);
const targetDbNameArg = args.find((a) => a.startsWith("--dbName="))?.slice("--dbName=".length);

const MONGO_URI = targetUriArg || process.env.MONGODB_URI;
const DB_NAME = targetDbNameArg || process.env.DB_NAME;

if (!MONGO_URI) {
  console.error("❌ Fatal: No MongoDB connection URI found in environment or --uri flag.");
  process.exit(1);
}

const maskedUri = MONGO_URI.replace(/:([^@]+)@/, ":****@");

/**
 * Transforms a raw file reference (ObjectId, string ID, or existing object) into a standardized embedded file subdocument.
 *
 * @param {any} ref - The raw field value
 * @param {Map<string, Object>} filesMap - In-memory index of File documents
 * @returns {{ subdoc: Object|null, changed: boolean, missing: boolean }}
 */
function resolveFileSubdocument(ref, filesMap) {
  if (!ref) {
    return { subdoc: null, changed: false, missing: false };
  }

  // Case 1: Already an embedded object with fileId or fileUrl
  if (typeof ref === "object" && !(ref instanceof mongoose.Types.ObjectId)) {
    if (ref.fileId || ref.fileUrl || ref.url) {
      // Ensure url is mirrored if missing
      const url = ref.url || ref.fileUrl || "";
      const fileUrl = ref.fileUrl || ref.url || "";
      const needsMirror = !ref.url || !ref.fileUrl;
      return {
        subdoc: {
          _id: ref._id || new mongoose.Types.ObjectId(),
          fileId: ref.fileId || "",
          fileUrl: fileUrl,
          url: url,
          fileName: ref.fileName || "",
          createdAt: ref.createdAt || new Date(),
          updatedAt: ref.updatedAt || new Date(),
        },
        changed: needsMirror,
        missing: false,
      };
    }
    // If it's an object wrapping an ObjectId (e.g. BSON)
    if (ref._id && mongoose.Types.ObjectId.isValid(ref._id)) {
      ref = ref._id;
    }
  }

  // Case 2: ObjectId or string representation of ObjectId
  const idStr = ref.toString();
  if (mongoose.Types.ObjectId.isValid(idStr)) {
    const fileDoc = filesMap.get(idStr);
    if (fileDoc) {
      const url = fileDoc.fileUrl || "";
      return {
        subdoc: {
          _id: fileDoc._id,
          fileId: fileDoc.fileId || "",
          fileUrl: url,
          url: url,
          fileName: fileDoc.fileName || "",
          createdAt: fileDoc.createdAt || new Date(),
          updatedAt: fileDoc.updatedAt || new Date(),
        },
        changed: true,
        missing: false,
      };
    } else {
      // Orphan reference: File record no longer exists
      return { subdoc: null, changed: true, missing: true };
    }
  }

  // Case 3: Plain URL string (legacy fallback)
  if (typeof ref === "string" && (ref.startsWith("http://") || ref.startsWith("https://"))) {
    return {
      subdoc: {
        _id: new mongoose.Types.ObjectId(),
        fileId: "",
        fileUrl: ref,
        url: ref,
        fileName: "",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      changed: true,
      missing: false,
    };
  }

  return { subdoc: null, changed: false, missing: false };
}

/**
 * Executes a full database backup for target collections.
 *
 * @param {import('mongodb').Db} db
 * @param {string[]} collections
 * @returns {Promise<Record<string, string>>} Mapping of original collection to backup collection name
 */
async function backupCollections(db, collections) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupMap = {};

  console.log(`\n📦 Creating pre-migration backups (Timestamp: ${timestamp})...`);

  for (const collName of collections) {
    const backupName = `backup_${timestamp}_files_${collName}`;
    const count = await db.collection(collName).countDocuments();
    if (count > 0) {
      await db.collection(collName).aggregate([{ $out: backupName }]).toArray();
      const backupCount = await db.collection(backupName).countDocuments();
      console.log(`   ✅ Backed up "${collName}" (${count} docs) -> "${backupName}" (${backupCount} docs)`);
      backupMap[collName] = backupName;
    } else {
      console.log(`   ℹ️ Skipped empty collection "${collName}"`);
    }
  }

  return backupMap;
}

/**
 * Main migration driver.
 */
async function runMigration() {
  console.log("================================================================================");
  console.log(`🚀 Starting Database Migration: Normalized File Model -> Embedded Subdocuments`);
  console.log(`   Mode: ${isDryRun ? "DRY-RUN (Simulated - No writes will be made)" : "LIVE EXECUTION"}`);
  console.log(`   Target URI: ${maskedUri}`);
  if (DB_NAME) console.log(`   Target Database: "${DB_NAME}"`);
  console.log("================================================================================\n");

  const connOptions = {
    serverSelectionTimeoutMS: 8000,
    family: 4,
    ...(DB_NAME ? { dbName: DB_NAME } : {}),
  };

  const mongooseInstance = await mongoose.connect(MONGO_URI, connOptions);
  const db = mongooseInstance.connection.db;
  const activeDbName = db.databaseName;

  console.log(`✅ Connected successfully to active database: "${activeDbName}"\n`);

  // Step 1: Pre-load all File documents into in-memory Map for O(1) lookups
  console.log("⏳ Indexing all documents from 'files' collection...");
  const rawFiles = await db.collection("files").find({}).toArray();
  const filesMap = new Map();

  for (const f of rawFiles) {
    filesMap.set(f._id.toString(), f);
  }
  console.log(`   Indexed ${filesMap.size} files in memory.\n`);

  // Step 2: Target collections to migrate
  const targetCollections = ["members", "trainers", "events", "users", "formresponses"];

  // Step 3: Pre-migration backup if requested and not in dry-run
  if (shouldBackup && !isDryRun) {
    await backupCollections(db, targetCollections);
  }

  const stats = {
    members: { scanned: 0, updated: 0, profilePicMigrated: 0, certsMigrated: 0, finesMigrated: 0, orphans: 0 },
    trainers: { scanned: 0, updated: 0, profilePicMigrated: 0, orphans: 0 },
    events: { scanned: 0, updated: 0, bannerMigrated: 0, galleryMigrated: 0, expensesMigrated: 0, sponsorsMigrated: 0, orphans: 0 },
    users: { scanned: 0, updated: 0, profilePicMigrated: 0, certsMigrated: 0, finesMigrated: 0, orphans: 0 },
    formresponses: { scanned: 0, updated: 0, filesMigrated: 0, orphans: 0 },
  };

  // -------------------------------------------------------------------------
  // MIGRATION: MEMBERS
  // -------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------------");
  console.log("🔄 Processing 'members' collection...");
  const membersCursor = db.collection("members").find({});
  const memberBulkOps = [];

  while (await membersCursor.hasNext()) {
    const member = await membersCursor.next();
    stats.members.scanned++;
    let docChanged = false;
    const updateFields = {};

    // 1. ProfilePic
    if (member.profilePic) {
      const res = resolveFileSubdocument(member.profilePic, filesMap);
      if (res.changed) {
        updateFields.profilePic = res.subdoc;
        docChanged = true;
        stats.members.profilePicMigrated++;
        if (res.missing) stats.members.orphans++;
      }
    }

    // 2. Certifications (array)
    if (Array.isArray(member.certifications) && member.certifications.length > 0) {
      let certsChanged = false;
      const newCerts = [];

      for (const certRef of member.certifications) {
        const res = resolveFileSubdocument(certRef, filesMap);
        if (res.changed) {
          certsChanged = true;
          stats.members.certsMigrated++;
        }
        if (res.missing) stats.members.orphans++;
        if (res.subdoc) newCerts.push(res.subdoc);
      }

      if (certsChanged) {
        updateFields.certifications = newCerts;
        docChanged = true;
      }
    }

    // 3. Fines Proof of Payment
    if (Array.isArray(member.fines) && member.fines.length > 0) {
      let finesChanged = false;
      const newFines = member.fines.map((fine) => {
        if (fine.proofOfPayment) {
          const res = resolveFileSubdocument(fine.proofOfPayment, filesMap);
          if (res.changed) {
            finesChanged = true;
            stats.members.finesMigrated++;
            if (res.missing) stats.members.orphans++;
            return { ...fine, proofOfPayment: res.subdoc };
          }
        }
        return fine;
      });

      if (finesChanged) {
        updateFields.fines = newFines;
        docChanged = true;
      }
    }

    if (docChanged) {
      stats.members.updated++;
      memberBulkOps.push({
        updateOne: {
          filter: { _id: member._id },
          update: { $set: updateFields },
        },
      });
    }
  }

  if (memberBulkOps.length > 0 && !isDryRun) {
    await db.collection("members").bulkWrite(memberBulkOps);
  }
  console.log(`   Scanned: ${stats.members.scanned} | Updated: ${stats.members.updated} docs`);
  console.log(`   -> profilePic: ${stats.members.profilePicMigrated} | certifications: ${stats.members.certsMigrated} | fine proofs: ${stats.members.finesMigrated} | orphans: ${stats.members.orphans}`);

  // -------------------------------------------------------------------------
  // MIGRATION: TRAINERS
  // -------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------------");
  console.log("🔄 Processing 'trainers' collection...");
  const trainersCursor = db.collection("trainers").find({});
  const trainerBulkOps = [];

  while (await trainersCursor.hasNext()) {
    const trainer = await trainersCursor.next();
    stats.trainers.scanned++;
    let docChanged = false;
    const updateFields = {};

    if (trainer.profilePic) {
      const res = resolveFileSubdocument(trainer.profilePic, filesMap);
      if (res.changed) {
        updateFields.profilePic = res.subdoc;
        docChanged = true;
        stats.trainers.profilePicMigrated++;
        if (res.missing) stats.trainers.orphans++;
      }
    }

    if (docChanged) {
      stats.trainers.updated++;
      trainerBulkOps.push({
        updateOne: {
          filter: { _id: trainer._id },
          update: { $set: updateFields },
        },
      });
    }
  }

  if (trainerBulkOps.length > 0 && !isDryRun) {
    await db.collection("trainers").bulkWrite(trainerBulkOps);
  }
  console.log(`   Scanned: ${stats.trainers.scanned} | Updated: ${stats.trainers.updated} docs`);
  console.log(`   -> profilePic: ${stats.trainers.profilePicMigrated} | orphans: ${stats.trainers.orphans}`);

  // -------------------------------------------------------------------------
  // MIGRATION: EVENTS
  // -------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------------");
  console.log("🔄 Processing 'events' collection...");
  const eventsCursor = db.collection("events").find({});
  const eventBulkOps = [];

  while (await eventsCursor.hasNext()) {
    const event = await eventsCursor.next();
    stats.events.scanned++;
    let docChanged = false;
    const updateFields = {};

    // 1. eventBanner
    if (event.eventBanner) {
      const res = resolveFileSubdocument(event.eventBanner, filesMap);
      if (res.changed) {
        updateFields.eventBanner = res.subdoc;
        docChanged = true;
        stats.events.bannerMigrated++;
        if (res.missing) stats.events.orphans++;
      }
    }

    // 2. eventGallery (array)
    if (Array.isArray(event.eventGallery) && event.eventGallery.length > 0) {
      let galleryChanged = false;
      const newGallery = [];

      for (const itemRef of event.eventGallery) {
        const res = resolveFileSubdocument(itemRef, filesMap);
        if (res.changed) {
          galleryChanged = true;
          stats.events.galleryMigrated++;
        }
        if (res.missing) stats.events.orphans++;
        if (res.subdoc) newGallery.push(res.subdoc);
      }

      if (galleryChanged) {
        updateFields.eventGallery = newGallery;
        docChanged = true;
      }
    }

    // 3. expenses[].receiptId
    if (Array.isArray(event.expenses) && event.expenses.length > 0) {
      let expensesChanged = false;
      const newExpenses = event.expenses.map((expense) => {
        if (expense.receiptId) {
          const res = resolveFileSubdocument(expense.receiptId, filesMap);
          if (res.changed) {
            expensesChanged = true;
            stats.events.expensesMigrated++;
            if (res.missing) stats.events.orphans++;
            return { ...expense, receiptId: res.subdoc };
          }
        }
        return expense;
      });

      if (expensesChanged) {
        updateFields.expenses = newExpenses;
        docChanged = true;
      }
    }

    // 4. sponsors[].receiptId
    if (Array.isArray(event.sponsors) && event.sponsors.length > 0) {
      let sponsorsChanged = false;
      const newSponsors = event.sponsors.map((sponsor) => {
        if (sponsor.receiptId) {
          const res = resolveFileSubdocument(sponsor.receiptId, filesMap);
          if (res.changed) {
            sponsorsChanged = true;
            stats.events.sponsorsMigrated++;
            if (res.missing) stats.events.orphans++;
            return { ...sponsor, receiptId: res.subdoc };
          }
        }
        return sponsor;
      });

      if (sponsorsChanged) {
        updateFields.sponsors = newSponsors;
        docChanged = true;
      }
    }

    if (docChanged) {
      stats.events.updated++;
      eventBulkOps.push({
        updateOne: {
          filter: { _id: event._id },
          update: { $set: updateFields },
        },
      });
    }
  }

  if (eventBulkOps.length > 0 && !isDryRun) {
    await db.collection("events").bulkWrite(eventBulkOps);
  }
  console.log(`   Scanned: ${stats.events.scanned} | Updated: ${stats.events.updated} docs`);
  console.log(`   -> eventBanner: ${stats.events.bannerMigrated} | eventGallery: ${stats.events.galleryMigrated} | expenses: ${stats.events.expensesMigrated} | sponsors: ${stats.events.sponsorsMigrated} | orphans: ${stats.events.orphans}`);

  // -------------------------------------------------------------------------
  // MIGRATION: USERS (Unified User Collection)
  // -------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------------");
  console.log("🔄 Processing 'users' collection...");
  const usersCursor = db.collection("users").find({});
  const userBulkOps = [];

  while (await usersCursor.hasNext()) {
    const user = await usersCursor.next();
    stats.users.scanned++;
    let docChanged = false;
    const updateFields = {};

    // 1. ProfilePic
    if (user.profilePic) {
      const res = resolveFileSubdocument(user.profilePic, filesMap);
      if (res.changed) {
        updateFields.profilePic = res.subdoc;
        docChanged = true;
        stats.users.profilePicMigrated++;
        if (res.missing) stats.users.orphans++;
      }
    }

    // 2. Certifications (array)
    if (Array.isArray(user.certifications) && user.certifications.length > 0) {
      let certsChanged = false;
      const newCerts = [];

      for (const certRef of user.certifications) {
        const res = resolveFileSubdocument(certRef, filesMap);
        if (res.changed) {
          certsChanged = true;
          stats.users.certsMigrated++;
        }
        if (res.missing) stats.users.orphans++;
        if (res.subdoc) newCerts.push(res.subdoc);
      }

      if (certsChanged) {
        updateFields.certifications = newCerts;
        docChanged = true;
      }
    }

    // 3. Fines Proof of Payment
    if (Array.isArray(user.fines) && user.fines.length > 0) {
      let finesChanged = false;
      const newFines = user.fines.map((fine) => {
        if (fine.proofOfPayment) {
          const res = resolveFileSubdocument(fine.proofOfPayment, filesMap);
          if (res.changed) {
            finesChanged = true;
            stats.users.finesMigrated++;
            if (res.missing) stats.users.orphans++;
            return { ...fine, proofOfPayment: res.subdoc };
          }
        }
        return fine;
      });

      if (finesChanged) {
        updateFields.fines = newFines;
        docChanged = true;
      }
    }

    if (docChanged) {
      stats.users.updated++;
      userBulkOps.push({
        updateOne: {
          filter: { _id: user._id },
          update: { $set: updateFields },
        },
      });
    }
  }

  if (userBulkOps.length > 0 && !isDryRun) {
    await db.collection("users").bulkWrite(userBulkOps);
  }
  console.log(`   Scanned: ${stats.users.scanned} | Updated: ${stats.users.updated} docs`);
  console.log(`   -> profilePic: ${stats.users.profilePicMigrated} | certifications: ${stats.users.certsMigrated} | fine proofs: ${stats.users.finesMigrated} | orphans: ${stats.users.orphans}`);

  // -------------------------------------------------------------------------
  // MIGRATION: FORMRESPONSES
  // -------------------------------------------------------------------------
  console.log("\n--------------------------------------------------------------------------------");
  console.log("🔄 Processing 'formresponses' collection...");
  const formResponsesCursor = db.collection("formresponses").find({});
  const formResponseBulkOps = [];

  while (await formResponsesCursor.hasNext()) {
    const resp = await formResponsesCursor.next();
    stats.formresponses.scanned++;
    let docChanged = false;
    const updateFields = {};

    if (Array.isArray(resp.files) && resp.files.length > 0) {
      let filesChanged = false;
      const newFiles = resp.files.map((fileEntry) => {
        if (fileEntry.fileId && mongoose.Types.ObjectId.isValid(fileEntry.fileId.toString())) {
          const res = resolveFileSubdocument(fileEntry.fileId, filesMap);
          if (res.changed) {
            filesChanged = true;
            stats.formresponses.filesMigrated++;
            if (res.missing) stats.formresponses.orphans++;
            return {
              ...fileEntry,
              file: res.subdoc,
              fileId: res.subdoc?.fileId || fileEntry.fileId.toString(),
            };
          }
        }
        return fileEntry;
      });

      if (filesChanged) {
        updateFields.files = newFiles;
        docChanged = true;
      }
    }

    if (docChanged) {
      stats.formresponses.updated++;
      formResponseBulkOps.push({
        updateOne: {
          filter: { _id: resp._id },
          update: { $set: updateFields },
        },
      });
    }
  }

  if (formResponseBulkOps.length > 0 && !isDryRun) {
    await db.collection("formresponses").bulkWrite(formResponseBulkOps);
  }
  console.log(`   Scanned: ${stats.formresponses.scanned} | Updated: ${stats.formresponses.updated} docs`);

  // -------------------------------------------------------------------------
  // VERIFICATION & INTEGRITY CHECK
  // -------------------------------------------------------------------------
  console.log("\n================================================================================");
  console.log("🔍 Post-Migration Integrity Verification");
  console.log("================================================================================");

  if (!isDryRun) {
    // 1. Verify Member profilePic
    const sampleMember = await db.collection("members").findOne({ "profilePic.fileId": { $exists: true, $ne: "" } });
    console.log(`   Sample migrated Member profilePic:`, sampleMember ? { _id: sampleMember._id, profilePic: sampleMember.profilePic } : "None with fileId");

    // 2. Verify Member certifications
    const sampleCertMember = await db.collection("members").findOne({ "certifications.0.fileId": { $exists: true } });
    console.log(`   Sample migrated Member certifications:`, sampleCertMember ? { count: sampleCertMember.certifications.length, firstCert: sampleCertMember.certifications[0] } : "None with certifications");

    // 3. Verify Trainer profilePic
    const sampleTrainer = await db.collection("trainers").findOne({ "profilePic.fileId": { $exists: true, $ne: "" } });
    console.log(`   Sample migrated Trainer profilePic:`, sampleTrainer ? { _id: sampleTrainer._id, profilePic: sampleTrainer.profilePic } : "None with fileId");

    // 4. Verify Event banner & gallery
    const sampleEvent = await db.collection("events").findOne({ "eventBanner.fileId": { $exists: true, $ne: "" } });
    console.log(`   Sample migrated Event banner:`, sampleEvent ? { _id: sampleEvent._id, eventBanner: sampleEvent.eventBanner } : "None with eventBanner");

    const sampleGalleryEvent = await db.collection("events").findOne({ "eventGallery.0.fileId": { $exists: true } });
    console.log(`   Sample migrated Event gallery:`, sampleGalleryEvent ? { count: sampleGalleryEvent.eventGallery.length, firstImage: sampleGalleryEvent.eventGallery[0] } : "None with eventGallery");

    // 5. Check if any raw ObjectIds still exist in profilePic across members
    const unmigratedMembers = await db.collection("members").countDocuments({
      profilePic: { $type: "objectId" }
    });
    console.log(`   Raw unmigrated ObjectId profilePic count in 'members': ${unmigratedMembers} (Target: 0)`);

    const unmigratedTrainers = await db.collection("trainers").countDocuments({
      profilePic: { $type: "objectId" }
    });
    console.log(`   Raw unmigrated ObjectId profilePic count in 'trainers': ${unmigratedTrainers} (Target: 0)`);

    const unmigratedBanners = await db.collection("events").countDocuments({
      eventBanner: { $type: "objectId" }
    });
    console.log(`   Raw unmigrated ObjectId eventBanner count in 'events': ${unmigratedBanners} (Target: 0)`);
  }

  console.log("\n================================================================================");
  console.log(`🎉 Migration ${isDryRun ? "Dry-Run" : "Execution"} Completed Successfully!`);
  console.log("================================================================================\n");

  await mongoose.disconnect();
}

runMigration().catch((err) => {
  console.error("\n❌ Fatal error during migration execution:", err);
  process.exit(1);
});

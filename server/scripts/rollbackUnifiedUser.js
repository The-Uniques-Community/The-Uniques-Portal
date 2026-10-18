/**
 * @file rollbackUnifiedUser.js
 * @description Rollback script for unified user model migration.
 * @usage
 *   node server/scripts/rollbackUnifiedUser.js
 *   node server/scripts/rollbackUnifiedUser.js --restore-collections <timestamp>
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

async function main() {
  console.log(`====================================================`);
  console.log(`UNIFIED USER MODEL ROLLBACK UTILITY`);
  console.log(`====================================================\n`);

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI environment variable is missing.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;

  // 1. Drop users collection if present
  console.log("--> STEP 1: Checking and dropping 'users' collection...");
  const colls = await db.listCollections({ name: "users" }).toArray();
  if (colls.length > 0) {
    const userCount = await db.collection("users").countDocuments();
    await db.collection("users").drop();
    console.log(`✅ Dropped collection 'users' (contained ${userCount} documents).`);
  } else {
    console.log("ℹ️  Collection 'users' does not exist.");
  }

  // 2. Discover available backup snapshots
  console.log("\n--> STEP 2: Scanning for backup snapshots...");
  const allColls = await db.listCollections().toArray();
  const backupColls = allColls.filter((c) => c.name.startsWith("backup_")).map((c) => c.name);

  if (backupColls.length === 0) {
    console.log("ℹ️  No backup collections detected in database.");
  } else {
    console.log(`Discovered ${backupColls.length} backup collections:`);
    const timestamps = new Set();
    for (const b of backupColls) {
      const match = b.match(/^backup_([^_]+)_/);
      if (match) timestamps.add(match[1]);
    }
    console.log("Available snapshot timestamps:", Array.from(timestamps));

    // Check if restore requested
    const restoreIdx = process.argv.indexOf("--restore-collections");
    if (restoreIdx !== -1 && process.argv[restoreIdx + 1]) {
      const targetTs = process.argv[restoreIdx + 1];
      console.log(`\n--> Restoring collections from snapshot '${targetTs}'...`);
      const targetBackups = backupColls.filter((b) => b.startsWith(`backup_${targetTs}_`));
      for (const backupName of targetBackups) {
        const originalName = backupName.replace(`backup_${targetTs}_`, "");
        const backupDocs = await db.collection(backupName).find().toArray();
        if (backupDocs.length > 0) {
          await db.collection(originalName).deleteMany({});
          await db.collection(originalName).insertMany(backupDocs);
          console.log(`  Restored '${originalName}' (${backupDocs.length} docs from '${backupName}')`);
        }
      }
      console.log("✅ Collections restored from backup snapshot.");
    }
  }

  console.log("\n=====================================================");
  console.log("ROLLBACK COMPLETED");
  console.log("=====================================================");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Fatal rollback error:", err);
  process.exit(1);
});

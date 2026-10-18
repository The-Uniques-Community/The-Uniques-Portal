/**
 * @file clone_database.js
 * @description Accurately and completely clones all collections, documents, and indexes
 * from the source database ('test') to the target database ('uniques_portal').
 * Strictly treats the source database as READ-ONLY.
 */
import mongoose from "mongoose";

const SOURCE_URI = "mongodb+srv://theuniquescommunity:8tDZKcVhognadlOr@theuniques.tv8sz.mongodb.net/test?retryWrites=true&w=majority&appName=TheUniques";
const TARGET_URI = "mongodb+srv://jimfleax:jimfleax@local.f18dsim.mongodb.net/uniques_portal?appName=Local";

const BATCH_SIZE = 500;

async function runClone() {
  console.log("=================================================================");
  console.log("   MONGODB COMPLETE DATABASE CLONE UTILITY                       ");
  console.log("=================================================================\n");

  console.log("1. Connecting to SOURCE database (READ-ONLY)...");
  const sourceConn = await mongoose.createConnection(SOURCE_URI, {
    family: 4,
    serverSelectionTimeoutMS: 10000,
  }).asPromise();
  console.log(`   Connected to Source: "${sourceConn.name}" on ${sourceConn.host}`);

  console.log("2. Connecting to TARGET database...");
  const targetConn = await mongoose.createConnection(TARGET_URI, {
    family: 4,
    serverSelectionTimeoutMS: 10000,
  }).asPromise();
  console.log(`   Connected to Target: "${targetConn.name}" on ${targetConn.host}\n`);

  const sourceDb = sourceConn.db;
  const targetDb = targetConn.db;

  // List all collections in source (excluding system collections)
  const collectionsList = await sourceDb.listCollections().toArray();
  const collectionNames = collectionsList
    .map((c) => c.name)
    .filter((name) => !name.startsWith("system."))
    .sort();

  console.log(`Found ${collectionNames.length} collections to clone from "${sourceConn.name}" to "${targetConn.name}".\n`);

  const summary = [];

  for (const colName of collectionNames) {
    console.log(`-----------------------------------------------------------------`);
    console.log(`Processing Collection: "${colName}"`);
    console.log(`-----------------------------------------------------------------`);

    const sourceCol = sourceDb.collection(colName);
    const targetCol = targetDb.collection(colName);

    // 1. Get source document count
    const sourceCount = await sourceCol.countDocuments();
    console.log(`   Source document count: ${sourceCount}`);

    // 2. Drop target collection if it exists to ensure a clean clone
    try {
      const exists = (await targetDb.listCollections({ name: colName }).toArray()).length > 0;
      if (exists) {
        await targetCol.drop();
        console.log(`   Cleared existing target collection "${colName}".`);
      }
    } catch (dropErr) {
      console.log(`   Note on collection drop: ${dropErr.message}`);
    }

    // 3. Clone documents in batches
    let copiedCount = 0;
    if (sourceCount > 0) {
      const cursor = sourceCol.find({});
      let batch = [];

      while (await cursor.hasNext()) {
        const doc = await cursor.next();
        batch.push(doc);

        if (batch.length === BATCH_SIZE) {
          await targetCol.insertMany(batch, { ordered: true });
          copiedCount += batch.length;
          process.stdout.write(`   Cloned ${copiedCount}/${sourceCount} documents...\r`);
          batch = [];
        }
      }

      if (batch.length > 0) {
        await targetCol.insertMany(batch, { ordered: true });
        copiedCount += batch.length;
      }
      console.log(`\n   ✓ Successfully copied ${copiedCount} documents.`);
    } else {
      // If collection is empty, create it on target
      await targetDb.createCollection(colName);
      console.log(`   ✓ Created empty collection "${colName}".`);
    }

    // 4. Clone indexes (skip default _id_ index)
    try {
      const sourceIndexes = await sourceCol.indexes();
      const customIndexes = sourceIndexes.filter((idx) => idx.name !== "_id_");

      if (customIndexes.length > 0) {
        console.log(`   Cloning ${customIndexes.length} index(es)...`);
        for (const indexDef of customIndexes) {
          const { key, name, unique, sparse, background, expireAfterSeconds, weights, default_language } = indexDef;
          const options = { name };
          if (unique) options.unique = true;
          if (sparse) options.sparse = true;
          if (background) options.background = true;
          if (expireAfterSeconds !== undefined) options.expireAfterSeconds = expireAfterSeconds;
          if (weights) options.weights = weights;
          if (default_language) options.default_language = default_language;

          await targetCol.createIndex(key, options);
          console.log(`     - Created index: ${name} on ${JSON.stringify(key)}`);
        }
      } else {
        console.log(`   No custom indexes (only default _id_).`);
      }
    } catch (idxErr) {
      console.warn(`   ⚠️ Warning copying indexes for "${colName}":`, idxErr.message);
    }

    // 5. Verification check
    const finalTargetCount = await targetCol.countDocuments();
    const isMatch = sourceCount === finalTargetCount;
    console.log(`   Verification: Source=${sourceCount} | Target=${finalTargetCount} -> ${isMatch ? "✅ MATCH" : "❌ MISMATCH"}\n`);

    summary.push({
      collection: colName,
      sourceCount,
      targetCount: finalTargetCount,
      status: isMatch ? "MATCH" : "MISMATCH",
    });
  }

  // Final summary verification table
  console.log("=================================================================");
  console.log("   FINAL VERIFICATION SUMMARY TABLE                             ");
  console.log("=================================================================");
  console.log("Collection".padEnd(25) + "Source".padEnd(12) + "Target".padEnd(12) + "Status");
  console.log("-----------------------------------------------------------------");

  let allMatched = true;
  let totalDocs = 0;

  for (const item of summary) {
    totalDocs += item.targetCount;
    if (item.status !== "MATCH") allMatched = false;
    const statusIcon = item.status === "MATCH" ? "✅ MATCH" : "❌ MISMATCH";
    console.log(item.collection.padEnd(25) + String(item.sourceCount).padEnd(12) + String(item.targetCount).padEnd(12) + statusIcon);
  }

  console.log("-----------------------------------------------------------------");
  console.log(`Total Collections Cloned: ${summary.length}`);
  console.log(`Total Documents Cloned:   ${totalDocs}`);
  console.log(`Overall Status:           ${allMatched ? "🎉 ALL COLLECTIONS MATCHED 100%" : "⚠️ ERRORS DETECTED"}`);
  console.log("=================================================================\n");

  await sourceConn.close();
  await targetConn.close();

  if (!allMatched) {
    throw new Error("One or more collections failed document count verification!");
  }
}

runClone()
  .then(() => {
    console.log("Database cloning operation completed successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("FATAL: Cloning failed:", err);
    process.exit(1);
  });

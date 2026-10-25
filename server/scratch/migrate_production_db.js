/**
 * @file migrate_production_db.js
 * @description Production database migration script for batch collection consolidation and feature data sync.
 */
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROD_URI =
  "mongodb+srv://theuniquescommunity:8tDZKcVhognadlOr@theuniques.tv8sz.mongodb.net/test?retryWrites=true&w=majority&appName=TheUniques";

async function runProductionMigration() {
  console.log("=== STARTING PRODUCTION DATABASE MIGRATION ===");
  console.log(`Connecting to: ${PROD_URI.replace(/:([^@]+)@/, ":****@")} ...`);

  await mongoose.connect(PROD_URI);
  const db = mongoose.connection.db;
  console.log(`Connected successfully. Database name: "${mongoose.connection.name}"\n`);

  // -------------------------------------------------------------
  // STEP 1: Backup `batchnames` in Production
  // -------------------------------------------------------------
  console.log("--- Step 1: Backup batchnames collection ---");
  const batchNames = await db.collection("batchnames").find().toArray();
  console.log(`Found ${batchNames.length} batchnames in production:`, batchNames.map((b) => b.name));

  await db
    .collection("batchnames")
    .aggregate([{ $out: "backup_2026-10-25_batchnames" }])
    .toArray();
  console.log("✓ Successfully created backup collection: backup_2026-10-25_batchnames\n");

  // -------------------------------------------------------------
  // STEP 2: Fix and Consolidate `batchprofiles` in Production
  // -------------------------------------------------------------
  console.log("--- Step 2: Fix and Validate batchprofiles ---");
  const existingProfiles = await db.collection("batchprofiles").find().toArray();
  console.log(`Existing profiles count: ${existingProfiles.length}`);

  // Fix typo in uniques-5.0 if present (where title was accidentally "The Uniques Batch 6.0")
  const p5 = existingProfiles.find((p) => p.id === "uniques-5.0");
  if (p5 && p5.title === "The Uniques Batch 6.0") {
    console.log("Fixing typo in uniques-5.0 title ('The Uniques Batch 6.0' -> 'The Uniques Batch 5.0')...");
    await db.collection("batchprofiles").updateOne(
      { id: "uniques-5.0" },
      {
        $set: {
          title: "The Uniques Batch 5.0",
          updatedAt: new Date(),
        },
      }
    );
    console.log("✓ Fixed uniques-5.0 title.");
  }

  // Ensure canonical DEFAULT_PROFILES exist
  const DEFAULT_PROFILES = [
    {
      id: "uniques-1.0",
      label: "Uniques 1.0",
      title: "The Uniques Batch 1.0",
      description:
        "The Uniques 1.0 batch is the pioneering group within The Uniques Community. These senior members have successfully completed their journey and are now placed in various esteemed organizations.\n\nThey have contributed immensely to the growth of the community and continue to mentor and inspire the upcoming batches.\n\nWith a strong foundation of innovation and leadership, Batch 1.0 has set high standards for excellence, paving the way for future cohorts to follow in their footsteps.",
      image: "/src/assets/img/About/uniques1.webp",
      customImage: false,
    },
    {
      id: "uniques-2.0",
      label: "Uniques 2.0",
      title: "The Uniques Batch 2.0",
      description:
        "The Uniques 2.0 batch consists of highly driven junior members who are actively enhancing their skills in modern technologies.\n\nWith a focus on collaboration and hands-on learning, they engage in real-world projects and hackathons, ensuring they are industry-ready.\n\nBatch 2.0 members benefit from mentorship programs, networking opportunities, and workshops to sharpen their expertise. They are on the path to becoming future innovators, following the footsteps of their predecessors while bringing fresh perspectives to the community.",
      image: "/src/assets/img/About/uniques2.webp",
      customImage: false,
    },
    {
      id: "uniques-3.0",
      label: "Uniques 3.0",
      title: "The Uniques Batch 3.0",
      description:
        "The latest addition to The Uniques Community, Batch 3.0, is a dynamic and ambitious group of individuals passionate about pushing boundaries.\n\nAs they embark on their journey, they are exposed to cutting-edge technologies, problem-solving challenges, and research-driven initiatives.\n\nWith an eagerness to learn and innovate, Batch 3.0 aims to make a lasting impact, bringing new ideas and energy to the community. They are being nurtured to be future leaders and trailblazers in their respective fields.",
      image: "/src/assets/img/About/uniques3.webp",
      customImage: false,
    },
    {
      id: "uniques-4.0",
      label: "Uniques 4.0",
      title: "The Uniques Batch 4.0",
      description:
        "The Uniques 4.0 batch is the newest cohort carrying forward the legacy of innovation. They are actively engaged in advanced skills training across Python, Full-Stack Development, DSA, and Salesforce CRM modules.\n\nFocused on real-world implementation, Batch 4.0 is collaborating with community mentors on modern engineering challenges to prepare for elite placements.",
      image: "/src/assets/img/About/uniques4.webp",
      customImage: false,
    },
    {
      id: "uniques-5.0",
      label: "Uniques 5.0",
      title: "The Uniques Batch 5.0",
      description:
        "The Uniques 5.0 batch accelerates modern engineering, working across full-stack applications, distributed architectures, and AI-driven workflows.\n\nCommitted to technical excellence, Batch 5.0 is building impactful software and leading collaborative community initiatives.",
      image: "/src/assets/img/About/uniques4.webp",
      customImage: false,
    },
    {
      id: "uniques-6.0",
      label: "Uniques 6.0",
      title: "The Uniques Batch 6.0",
      description:
        "The Uniques 6.0 batch represents the newest cohort of ambitious builders and innovators. Embracing emerging technologies and real-world problem-solving, Batch 6.0 is carrying the community forward.",
      image: "/src/assets/img/About/uniques4.webp",
      customImage: false,
    },
  ];

  for (const def of DEFAULT_PROFILES) {
    const exists = await db.collection("batchprofiles").findOne({
      $or: [{ id: def.id }, { label: def.label }],
    });
    if (!exists) {
      console.log(`Inserting missing profile in production: ${def.label}...`);
      await db.collection("batchprofiles").insertOne({
        ...def,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  // Remove any test timestamp entries if present
  const deletedTest = await db.collection("batchprofiles").deleteMany({
    $or: [{ id: /-\d{10,}/ }, { title: /-\d{10,}/ }, { label: /-\d{10,}/ }],
  });
  if (deletedTest.deletedCount > 0) {
    console.log(`Cleaned up ${deletedTest.deletedCount} corrupt/test profiles from production.`);
  }

  const updatedProfiles = await db.collection("batchprofiles").find().toArray();
  console.log(`\nUpdated production batchprofiles (${updatedProfiles.length}):`);
  updatedProfiles.forEach((p) => {
    console.log(` - [${p.id}] "${p.title}" (label: "${p.label}", customImage: ${p.customImage})`);
  });

  // -------------------------------------------------------------
  // STEP 3: Seed / Sync `successstories` in Production
  // -------------------------------------------------------------
  console.log("\n--- Step 3: Seed / Sync successstories in Production ---");
  const dataModulePath = path.resolve(__dirname, "../seeds/data/successStoriesData.js");
  const { SUCCESS_STORIES } = await import(dataModulePath);
  const { normalizeBatchName } = await import("../controller/Community/successStories.controller.js");

  let order = 1;
  for (const story of SUCCESS_STORIES) {
    const normalizedStory = {
      ...story,
      batch: normalizeBatchName(story.batch),
      displayOrder: order++,
      isFeatured: true,
      updatedAt: new Date(),
    };

    await db.collection("successstories").updateOne(
      { id: story.id },
      {
        $set: normalizedStory,
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true }
    );
  }

  const totalStories = await db.collection("successstories").countDocuments();
  console.log(`✓ Production successstories collection seeded: ${totalStories} stories present.`);

  // -------------------------------------------------------------
  // STEP 4: Final Diagnostics
  // -------------------------------------------------------------
  console.log("\n--- Step 4: Final Diagnostics ---");
  const memberBatches = await db.collection("members").distinct("batch");
  const userBatches = await db.collection("users").distinct("batch");
  console.log("Production members distinct batches:", memberBatches);
  console.log("Production users distinct batches:", userBatches);

  console.log("\n🎉 ALL PRODUCTION DATABASE MIGRATIONS COMPLETED SUCCESSFULLY!");
  await mongoose.disconnect();
}

runProductionMigration().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

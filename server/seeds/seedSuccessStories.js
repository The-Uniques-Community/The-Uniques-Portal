/**
 * @file seedSuccessStories.js
 * @description Migration and seeding utility script that upserts official community success stories into MongoDB.
 * @architecture Reads the comprehensive alumni records from frontend data and synchronizes them with the MongoDB SuccessStory collection.
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import dbconnect from "../config/dbConfig.js";
import SuccessStory from "../models/community/successStoryModel.js";
import { normalizeBatchName } from "../controller/Community/successStories.controller.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

/**
 * @desc Connects to MongoDB and synchronizes all predefined success stories via upsert.
 * @async
 * @returns {Promise<void>} Resolves when all success stories have been seeded.
 */
export const seedSuccessStories = async () => {
  try {
    const dataModulePath = path.resolve(__dirname, "./data/successStoriesData.js");
    const { SUCCESS_STORIES } = await import(dataModulePath);

    await dbconnect();
    console.log("Connected to MongoDB, seeding success stories...");

    let order = 1;
    for (const story of SUCCESS_STORIES) {
      const normalizedStory = {
        ...story,
        batch: normalizeBatchName(story.batch),
        displayOrder: order++,
        isFeatured: true,
      };

      await SuccessStory.findOneAndUpdate(
        { id: story.id },
        { $set: normalizedStory },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`✓ Success story synced: ${story.name} (${normalizedStory.batch})`);
    }

    const total = await SuccessStory.countDocuments();
    console.log(`\n🎉 Success! Total ${total} success stories stored in MongoDB.`);
  } catch (error) {
    console.error("Error seeding success stories:", error);
    throw error;
  }
};

const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith("seedSuccessStories.js") ||
    process.argv[1].includes("seedSuccessStories.js"));

if (isDirectRun) {
  seedSuccessStories()
    .then(async () => {
      console.log("Seeding completed.");
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log("MongoDB disconnected.");
      }
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("Seeding failed:", err);
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
        console.log("MongoDB disconnected.");
      }
      process.exit(1);
    });
}

/**
 * @file backfillGraduationYears.js
 * @description Idempotent database script to calculate and persist admissionYear & graduationYear,
 * and unset legacy static profileStatus on user documents.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import {
  getMemberAdmissionYear,
  getMemberGraduationYear,
  calculateMemberStatus,
} from "../utils/memberStatus.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

async function backfill() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI is not set in environment");
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected successfully.");

    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");

    const members = await usersCollection.find({ role: "member" }).toArray();
    console.log(`Found ${members.length} members to process.`);

    let updatedCount = 0;
    const summaryByGradYear = {};
    const summaryByStatus = {};

    for (const member of members) {
      const admissionYear = getMemberAdmissionYear(member);
      const graduationYear = getMemberGraduationYear({ ...member, admissionYear });
      const currentStatus = calculateMemberStatus({ ...member, admissionYear, graduationYear });

      summaryByGradYear[graduationYear || "unknown"] =
        (summaryByGradYear[graduationYear || "unknown"] || 0) + 1;
      summaryByStatus[currentStatus] =
        (summaryByStatus[currentStatus] || 0) + 1;

      const updateOp = {
        $set: {
          admissionYear,
          graduationYear,
        },
        $unset: {
          profileStatus: "",
        },
      };

      await usersCollection.updateOne({ _id: member._id }, updateOp);
      updatedCount++;
    }

    console.log(`\nSuccessfully backfilled ${updatedCount} members:`);
    console.log("Graduation Year Distribution:", summaryByGradYear);
    console.log("Calculated Dynamic Status Distribution:", summaryByStatus);

    await mongoose.disconnect();
    console.log("Database disconnected.");
  } catch (error) {
    console.error("Backfill failed:", error);
    process.exit(1);
  }
}

backfill();

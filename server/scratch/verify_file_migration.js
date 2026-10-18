/**
 * @file verify_file_migration.js
 * @description Automated verification suite for the embedded file subdocument migration.
 */

import assert from "assert";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

import dbconnect from "../config/dbConfig.js";
import Member from "../models/member/memberModel.js";
import Trainer from "../models/admin/trainerModel.js";
import Event from "../models/member/eventModel.js";
import User from "../models/user/userModel.js";

async function runVerification() {
  console.log("====================================================");
  console.log("🧪 Verifying Embedded File Migration in uniques_portal");
  console.log("====================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  const test = async (name, fn) => {
    totalTests++;
    try {
      await fn();
      passedTests++;
      console.log(`✅ [PASS] ${name}`);
    } catch (error) {
      console.error(`❌ [FAIL] ${name}`);
      console.error(`   Error: ${error.message}`);
      throw error;
    }
  };

  const conn = await dbconnect();
  const db = conn.connection.db;

  try {
    // TEST 1: Member profilePic and certifications structure
    await test("Member documents contain valid embedded profilePic subdocument", async () => {
      const member = await Member.findOne({ "profilePic.fileId": { $exists: true, $ne: "" } });
      assert(member, "Must find at least one member with embedded profilePic");
      assert(member.profilePic, "member.profilePic must exist");
      assert.strictEqual(typeof member.profilePic, "object", "profilePic must be an object");
      assert(member.profilePic.fileId, "profilePic.fileId must exist");
      assert(member.profilePic.fileUrl, "profilePic.fileUrl must exist");
      assert.strictEqual(member.profilePic.url, member.profilePic.fileUrl, "profilePic.url must mirror fileUrl");
      assert(member.profilePic._id, "profilePic._id must exist");
      console.log(`   ℹ️ Verified Member "${member.fullName || member.email}": fileId="${member.profilePic.fileId}"`);
    });

    // TEST 2: Member certifications array contains embedded subdocuments
    await test("Member certifications array contains valid embedded subdocuments", async () => {
      const member = await Member.findOne({ "certifications.0.fileId": { $exists: true } });
      assert(member, "Must find member with certifications");
      assert(Array.isArray(member.certifications), "certifications must be an array");
      assert(member.certifications.length > 0, "certifications array must not be empty");

      const firstCert = member.certifications[0];
      assert(firstCert.fileId, "firstCert.fileId must exist");
      assert(firstCert.fileUrl, "firstCert.fileUrl must exist");
      assert.strictEqual(firstCert.url, firstCert.fileUrl, "firstCert.url must mirror fileUrl");
      assert(firstCert._id, "firstCert._id must exist");
      console.log(`   ℹ️ Verified Member with ${member.certifications.length} embedded certifications`);
    });

    // TEST 3: Trainer profilePic embedded structure
    await test("Trainer documents contain valid embedded profilePic subdocument", async () => {
      const trainer = await Trainer.findOne({ "profilePic.fileId": { $exists: true, $ne: "" } });
      assert(trainer, "Must find at least one trainer with embedded profilePic");
      assert(trainer.profilePic.fileId, "trainer.profilePic.fileId must exist");
      assert(trainer.profilePic.fileUrl, "trainer.profilePic.fileUrl must exist");
      assert.strictEqual(trainer.profilePic.url, trainer.profilePic.fileUrl, "trainer.profilePic.url must mirror fileUrl");
      console.log(`   ℹ️ Verified Trainer "${trainer.fullName}": fileId="${trainer.profilePic.fileId}"`);
    });

    // TEST 4: Event eventBanner and eventGallery embedded structure
    await test("Event documents contain valid embedded eventBanner and eventGallery", async () => {
      const event = await Event.findOne({ "eventBanner.fileId": { $exists: true, $ne: "" } });
      assert(event, "Must find at least one event with embedded eventBanner");
      assert(event.eventBanner.fileId, "event.eventBanner.fileId must exist");
      assert(event.eventBanner.fileUrl, "event.eventBanner.fileUrl must exist");
      assert.strictEqual(event.eventBanner.url, event.eventBanner.fileUrl, "eventBanner.url must mirror fileUrl");

      const galleryEvent = await Event.findOne({ "eventGallery.0.fileId": { $exists: true } });
      assert(galleryEvent, "Must find event with gallery items");
      assert(Array.isArray(galleryEvent.eventGallery), "eventGallery must be an array");
      assert(galleryEvent.eventGallery[0].fileId, "gallery item fileId must exist");
      console.log(`   ℹ️ Verified Event "${event.eventName}": Banner fileId="${event.eventBanner.fileId}", Gallery images=${galleryEvent.eventGallery.length}`);
    });

    // TEST 5: Zero raw ObjectId references in target collections
    await test("Zero raw ObjectId references remain across target collections", async () => {
      const rawMemberPics = await db.collection("members").countDocuments({ profilePic: { $type: "objectId" } });
      assert.strictEqual(rawMemberPics, 0, "No raw ObjectId profilePic in members");

      const rawTrainerPics = await db.collection("trainers").countDocuments({ profilePic: { $type: "objectId" } });
      assert.strictEqual(rawTrainerPics, 0, "No raw ObjectId profilePic in trainers");

      const rawEventBanners = await db.collection("events").countDocuments({ eventBanner: { $type: "objectId" } });
      assert.strictEqual(rawEventBanners, 0, "No raw ObjectId eventBanner in events");

      const rawUserPics = await db.collection("users").countDocuments({ profilePic: { $type: "objectId" } });
      assert.strictEqual(rawUserPics, 0, "No raw ObjectId profilePic in users");

      console.log("   ℹ️ Confirmed: 0 raw ObjectId references remain across members, trainers, events, users.");
    });

    console.log("\n====================================================");
    console.log(`🎉 All ${passedTests}/${totalTests} Verification Tests Passed!`);
    console.log("====================================================\n");
  } finally {
    await mongoose.disconnect();
  }
}

runVerification().catch((err) => {
  console.error("\n❌ Verification failed:", err);
  process.exit(1);
});

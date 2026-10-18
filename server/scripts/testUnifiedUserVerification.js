/**
 * @file testUnifiedUserVerification.js
 * @description Comprehensive test suite verifying Unified User model, legacy re-exports, virtuals, populates, and authentication queries.
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

import User from "../models/user/userModel.js";
import Member from "../models/member/memberModel.js";
import Admin from "../models/admin/adminModel.js";
import CommunityAdmin from "../models/community/communityAdmin.js";
import Trainer from "../models/admin/trainerModel.js";
import Task from "../models/uniques360/Task.js";
import File from "../models/member/fileModel.js";
import Event from "../models/member/eventModel.js";
import Leave from "../models/member/leaveModel.js";
import Report from "../models/uniques360/Report.js";
import Blog from "../models/member/blogModel.js";
import FormResponse from "../models/member/formResponse.js";

async function runTests() {
  console.log("====================================================");
  console.log("STARTING UNIFIED USER VERIFICATION TESTS");
  console.log("====================================================\n");

  await mongoose.connect(process.env.MONGODB_URI);
  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (!condition) {
      console.error(`❌ FAIL [Test ${totalTests}]: ${message}`);
      throw new Error(`Test failed: ${message}`);
    }
    passedTests++;
    console.log(`✅ PASS [Test ${totalTests}]: ${message}`);
  }

  try {
    // Test 1: User collection document count
    const totalUsers = await User.countDocuments();
    assert(totalUsers === 112, `User collection should have exactly 112 documents (found: ${totalUsers})`);

    // Test 2: Legacy model re-export equivalence
    assert(Member === User, "Member model should be strictly equal to User model");
    assert(Admin === User, "Admin model should be strictly equal to User model");
    assert(CommunityAdmin === User, "CommunityAdmin model should be strictly equal to User model");

    // Test 3: Trainer model remains independent
    assert(Trainer !== User, "Trainer model should NOT be equal to User model");
    const trainerCount = await Trainer.countDocuments();
    assert(trainerCount > 0, `Trainer collection should remain intact (found ${trainerCount} trainers)`);

    // Test 4: Querying via legacy Member/Admin models accesses 'users' collection
    const queriedViaMember = await Member.countDocuments();
    assert(queriedViaMember === 112, `Member.countDocuments() should return 112 (found: ${queriedViaMember})`);
    const queriedViaAdmin = await Admin.countDocuments();
    assert(queriedViaAdmin === 112, `Admin.countDocuments() should return 112 (found: ${queriedViaAdmin})`);

    // Test 5: Cross-collection duplicate 'hyggefieed96@gmail.com'
    const hyggeUser = await User.findOne({ email: "hyggefieed96@gmail.com" });
    assert(!!hyggeUser, "Hygge user should exist in users collection");
    assert(
      hyggeUser._id.toString() === "67e3ff5c898900ac09e041b2",
      `Hygge should use canonical Member ID 67e3ff5c898900ac09e041b2 (found: ${hyggeUser._id})`
    );
    assert(hyggeUser.role === "admin", `Hygge role should be elevated to 'admin' (found: ${hyggeUser.role})`);

    // Test 6: Case-variant duplicate 'khushiporwal98@gmail.com'
    const khushiUser = await User.findOne({ email: "khushiporwal98@gmail.com" });
    assert(!!khushiUser, "Khushi user should exist in users collection");
    assert(
      khushiUser._id.toString() === "689203532c78b20e28bbc722",
      `Khushi should use canonical Member ID 689203532c78b20e28bbc722 (found: ${khushiUser._id})`
    );
    assert(khushiUser.admno === "2023BTCS024", `Khushi admno should be 2023BTCS024 (found: ${khushiUser.admno})`);

    const oldKhushiExists = await User.findById("67e3fb3282085d88ed487349");
    assert(!oldKhushiExists, "Old duplicate Khushi ID 67e3fb3282085d88ed487349 must not exist in users");

    // Test 7: CommunityAdmin user migrated properly
    const caUser = await User.findOne({ email: "communityadmin@gmail.com" });
    assert(!!caUser, "Community admin user should exist");
    assert(caUser.role === "communityadmin", `Community admin role should be 'communityadmin' (found: ${caUser.role})`);

    // Test 8: Virtual properties
    assert(hyggeUser.name === hyggeUser.fullName, `Virtual 'name' should match 'fullName': ${hyggeUser.name}`);
    assert(khushiUser.admnNo === khushiUser.admno, `Virtual 'admnNo' should match 'admno': ${khushiUser.admnNo}`);
    assert(typeof khushiUser.cgpa === "string", `Virtual 'cgpa' should return string: ${khushiUser.cgpa}`);

    // Test 9: Population on Task model
    const task = await Task.findOne({ "assignedTo.member": { $exists: true } })
      .populate("assignedBy")
      .populate("assignedTo.member");
    if (task) {
      assert(
        !task.assignedBy || task.assignedBy instanceof User,
        `task.assignedBy should populate as User instance (${task.assignedBy?.fullName})`
      );
      if (task.assignedTo && task.assignedTo.length > 0 && task.assignedTo[0].member) {
        assert(
          task.assignedTo[0].member instanceof User,
          `task.assignedTo.member should populate as User instance (${task.assignedTo[0].member?.fullName})`
        );
      }
    }

    // Test 10: Population on File model
    const file = await File.findOne({ fileOwner: { $ne: null } }).populate("fileOwner");
    if (file && file.fileOwner) {
      assert(file.fileOwner instanceof User, "file.fileOwner should populate as User instance");
    }

    // Test 11: Population on Event model
    const event = await Event.findOne({ "eventMembers.0": { $exists: true } }).populate(
      "eventMembers.contributionTeam"
    );
    if (event) {
      for (const em of event.eventMembers) {
        if (em.contributionTeam && em.contributionTeam.length > 0) {
          assert(
            em.contributionTeam[0] instanceof User,
            "event contributionTeam member should populate as User instance"
          );
          break;
        }
      }
    }

    // Test 12: Population on Leave model
    const leave = await Leave.findOne().populate("memberId");
    if (leave) {
      assert(leave.memberId instanceof User, "leave.memberId should populate as User instance");
    }

    // Test 13: Population on Report model
    const report = await Report.findOne().populate("studentId");
    if (report) {
      assert(report.studentId instanceof User, "report.studentId should populate as User instance");
    }

    // Test 14: Population on Blog model
    const blog = await Blog.findOne().populate("author");
    if (blog) {
      assert(blog.author instanceof User, "blog.author should populate as User instance");
    }

    // Test 15: Population on FormResponse model
    const formResp = await FormResponse.findOne({ "respondent.member": { $ne: null } }).populate(
      "respondent.member"
    );
    if (formResp && formResp.respondent?.member) {
      assert(
        formResp.respondent.member instanceof User,
        "formResponse respondent.member should populate as User instance"
      );
    }

    // Test 16: Authentication hydration query simulation for all roles
    const adminUser = await User.findOne({ role: "admin" }).select("-password");
    assert(!!adminUser, "Should find admin user with select('-password')");
    assert(adminUser.password === undefined, "Password field should be excluded by select('-password')");

    const commAdmin = await User.findOne({ role: "communityadmin" }).select("-password");
    assert(!!commAdmin, "Should find communityadmin user with select('-password')");

    const memberUser = await User.findOne({ role: "member" }).select("-password");
    assert(!!memberUser, "Should find member user with select('-password')");

    // Test 17: Raw aggregation lookup on events from 'users'
    const eventWithTeam = await Event.findOne({ "eventMembers.contributionTeam.0": { $exists: true } });
    if (eventWithTeam) {
      const pipeline = [
        { $match: { _id: eventWithTeam._id } },
        {
          $lookup: {
            from: "users",
            localField: "eventMembers.contributionTeam",
            foreignField: "_id",
            as: "teamMembers",
          },
        },
      ];
      const [aggResult] = await Event.aggregate(pipeline);
      assert(
        aggResult && Array.isArray(aggResult.teamMembers) && aggResult.teamMembers.length > 0,
        `Raw aggregate lookup from 'users' should hydrate teamMembers (found: ${aggResult?.teamMembers?.length})`
      );
    }

    console.log(`\n====================================================`);
    console.log(`ALL TESTS PASSED: ${passedTests} / ${totalTests}`);
    console.log(`====================================================\n`);
  } finally {
    await mongoose.disconnect();
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

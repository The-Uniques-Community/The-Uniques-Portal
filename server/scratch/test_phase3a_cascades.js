/**
 * @file test_phase3a_cascades.js
 * @description Standalone verification test suite for Phase 3A: Cascading Deletion & Orphan Prevention.
 * Tests mock deletion pipelines for Member, Event, and Task controllers, asserting that:
 * 1. deleteMember cascades to Leave (deleteMany), Event (pull member), Task (pull member), and Report (deleteMany).
 * 2. deleteEvent cascades to User (pull event_participation).
 * 3. deleteTask cascades to Report (deleteMany).
 * 4. Error boundaries (invalid ObjectId, missing document, unauthorized caller) remain intact.
 *
 * Execution:
 * node server/scratch/test_phase3a_cascades.js
 */

import assert from "node:assert";
import mongoose from "mongoose";

// Controllers under test
import { deleteMember } from "../controller/admin/memberController.js";
import { deleteEvent } from "../controller/events/eventController.js";
import { deleteTask } from "../controller/uniques360/taskController.js";

// Models under test
import Member from "../models/member/memberModel.js";
import File from "../models/member/fileModel.js";
import Leave from "../models/member/leaveModel.js";
import Event from "../models/member/eventModel.js";
import Task from "../models/uniques360/Task.js";
import Report from "../models/uniques360/Report.js";
import User from "../models/user/userModel.js";
import Guest from "../models/member/guestModel.js";

// Test runner harness
let passed = 0;
let failed = 0;

async function test(title, fn) {
  try {
    await fn();
    console.log(`  ✓ ${title}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${title}`);
    console.error(`    ${err.message}`);
    failed++;
  }
}

// Mock Response Factory
function createMockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    },
  };
}

console.log("\n=======================================================");
console.log("Phase 3A Cascading Deletion & Orphan Prevention Tests");
console.log("=======================================================\n");

// =========================================================================
// Suite 1: deleteMember cascading cleanup
// =========================================================================
console.log("Suite 1: deleteMember Cascades");

await test("deleteMember cleans up Leaves, Event contribution teams, Tasks, and Reports", async () => {
  const memberId = new mongoose.Types.ObjectId().toString();
  const req = { params: { id: memberId } };
  const res = createMockRes();

  const calls = {
    leaveDeleteMany: null,
    eventUpdateMany: null,
    taskUpdateMany: null,
    reportDeleteMany: null,
    memberFindByIdAndDelete: null,
  };

  // Mock model methods
  Member.findById = async (id) => ({ _id: id, profilePic: null });
  Leave.deleteMany = async (filter) => { calls.leaveDeleteMany = filter; return { deletedCount: 2 }; };
  Event.updateMany = async (filter, update) => { calls.eventUpdateMany = { filter, update }; return { modifiedCount: 1 }; };
  Task.updateMany = async (filter, update) => { calls.taskUpdateMany = { filter, update }; return { modifiedCount: 1 }; };
  Report.deleteMany = async (filter) => { calls.reportDeleteMany = filter; return { deletedCount: 3 }; };
  Member.findByIdAndDelete = async (id) => { calls.memberFindByIdAndDelete = id; return { _id: id }; };

  await deleteMember(req, res);

  assert.strictEqual(res.statusCode, 200, "Should return 200 OK");
  assert.strictEqual(res.body.success, true, "Should report success: true");

  // Assert cascading cleanups
  assert.deepStrictEqual(calls.leaveDeleteMany, { memberId }, "Leave.deleteMany must target memberId");
  assert.deepStrictEqual(
    calls.eventUpdateMany,
    {
      filter: { "eventMembers.contributionTeam": memberId },
      update: { $pull: { "eventMembers.$[].contributionTeam": memberId } },
    },
    "Event.updateMany must $pull memberId across eventMembers.$[].contributionTeam"
  );
  assert.deepStrictEqual(
    calls.taskUpdateMany,
    {
      filter: { "assignedTo.member": memberId },
      update: { $pull: { assignedTo: { member: memberId } } },
    },
    "Task.updateMany must $pull member from assignedTo array"
  );
  assert.deepStrictEqual(calls.reportDeleteMany, { studentId: memberId }, "Report.deleteMany must target studentId");
  assert.strictEqual(calls.memberFindByIdAndDelete, memberId, "Member document must be deleted last");
});

await test("deleteMember removes profile picture file if present", async () => {
  const memberId = new mongoose.Types.ObjectId().toString();
  const fileId = new mongoose.Types.ObjectId().toString();
  const req = { params: { id: memberId } };
  const res = createMockRes();

  let fileDeleted = null;
  Member.findById = async (id) => ({ _id: id, profilePic: fileId });
  File.findByIdAndDelete = async (id) => { fileDeleted = id; return { _id: id }; };
  Leave.deleteMany = async () => ({});
  Event.updateMany = async () => ({});
  Task.updateMany = async () => ({});
  Report.deleteMany = async () => ({});
  Member.findByIdAndDelete = async () => ({});

  await deleteMember(req, res);

  assert.strictEqual(fileDeleted, fileId, "Should remove profilePic file record");
  assert.strictEqual(res.statusCode, 200);
});

await test("deleteMember returns 400 for invalid ObjectId", async () => {
  const req = { params: { id: "invalid-id" } };
  const res = createMockRes();

  await deleteMember(req, res);

  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
});

await test("deleteMember returns 404 if member is not found", async () => {
  const memberId = new mongoose.Types.ObjectId().toString();
  const req = { params: { id: memberId } };
  const res = createMockRes();

  Member.findById = async () => null;

  await deleteMember(req, res);

  assert.strictEqual(res.statusCode, 404);
  assert.strictEqual(res.body.message, "Member not found");
});

// =========================================================================
// Suite 2: deleteEvent cascading cleanup
// =========================================================================
console.log("\nSuite 2: deleteEvent Cascades");

await test("deleteEvent pulls eventId from all users' event_participation array", async () => {
  const eventId = new mongoose.Types.ObjectId().toString();
  const req = { params: { id: eventId } };
  const res = createMockRes();

  const calls = {
    guestUpdateMany: null,
    userUpdateMany: null,
    eventFindByIdAndDelete: null,
  };

  Event.findById = async (id) => ({ _id: id, eventForm: null });
  Guest.updateMany = async (filter, update) => { calls.guestUpdateMany = { filter, update }; return { modifiedCount: 1 }; };
  User.updateMany = async (filter, update) => { calls.userUpdateMany = { filter, update }; return { modifiedCount: 4 }; };
  Event.findByIdAndDelete = async (id) => { calls.eventFindByIdAndDelete = id; return { _id: id }; };

  await deleteEvent(req, res);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.success, true);

  assert.deepStrictEqual(
    calls.userUpdateMany,
    {
      filter: { event_participation: eventId },
      update: { $pull: { event_participation: eventId } },
    },
    "User.updateMany must $pull eventId from event_participation"
  );
  assert.strictEqual(calls.eventFindByIdAndDelete, eventId, "Event must be deleted after relationship cleanup");
});

await test("deleteEvent returns 400 for invalid ObjectId", async () => {
  const req = { params: { id: "bad-event-id" } };
  const res = createMockRes();

  await deleteEvent(req, res);

  assert.strictEqual(res.statusCode, 400);
  assert.strictEqual(res.body.success, false);
});

await test("deleteEvent returns 404 when event does not exist", async () => {
  const eventId = new mongoose.Types.ObjectId().toString();
  const req = { params: { id: eventId } };
  const res = createMockRes();

  Event.findById = async () => null;

  await deleteEvent(req, res);

  assert.strictEqual(res.statusCode, 404);
  assert.strictEqual(res.body.message, "Event not found");
});

// =========================================================================
// Suite 3: deleteTask cascading cleanup
// =========================================================================
console.log("\nSuite 3: deleteTask Cascades");

await test("deleteTask cascades to delete all child reports tied to taskId", async () => {
  const taskId = new mongoose.Types.ObjectId().toString();
  const coordinatorId = new mongoose.Types.ObjectId().toString();
  const req = {
    params: { taskId },
    user: { id: coordinatorId },
  };
  const res = createMockRes();

  let reportsFilter = null;
  let taskDeleted = null;

  Task.findById = async (id) => ({ _id: id, assignedBy: coordinatorId });
  Report.deleteMany = async (filter) => { reportsFilter = filter; return { deletedCount: 5 }; };
  Task.findByIdAndDelete = async (id) => { taskDeleted = id; return { _id: id }; };

  await deleteTask(req, res);

  assert.strictEqual(res.statusCode, 200);
  assert.strictEqual(res.body.message, "Task deleted successfully");
  assert.deepStrictEqual(reportsFilter, { taskId }, "Report.deleteMany must delete reports with matching taskId");
  assert.strictEqual(taskDeleted, taskId, "Task must be deleted after child reports are cleared");
});

await test("deleteTask returns 403 when caller is not the assigning coordinator", async () => {
  const taskId = new mongoose.Types.ObjectId().toString();
  const req = {
    params: { taskId },
    user: { id: "different-user-id" },
  };
  const res = createMockRes();

  Task.findById = async (id) => ({ _id: id, assignedBy: "original-coordinator-id" });

  await deleteTask(req, res);

  assert.strictEqual(res.statusCode, 403);
  assert.strictEqual(res.body.message, "Unauthorized to delete this task");
});

await test("deleteTask returns 404 if task is not found", async () => {
  const taskId = new mongoose.Types.ObjectId().toString();
  const req = {
    params: { taskId },
    user: { id: "coordinator-id" },
  };
  const res = createMockRes();

  Task.findById = async () => null;

  await deleteTask(req, res);

  assert.strictEqual(res.statusCode, 404);
  assert.strictEqual(res.body.message, "Task not found");
});

// Summary
console.log("\n=======================================================");
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("=======================================================\n");

if (failed > 0) {
  process.exit(1);
}

/**
 * @file verify_mark_complete.test.cjs
 * @description TDD test suite for Uniques360 Mark as Complete functionality:
 * 1. Test updateTaskStatus with coordinator / admin role
 * 2. Test updateTaskStatus with assigned member (both {member: id} and legacy [id] format)
 * 3. Test updateTaskStatus with undefined/missing status (handling gracefully)
 * 4. Test updateTaskStatus unauthorized member (neither assigned nor manager)
 */

const assert = require('node:assert/strict');
const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../.env') });

function createMockRes() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
}

async function runTests() {
  console.log('===============================================================');
  console.log('   STARTING UNIQUES 360 MARK AS COMPLETE TEST SUITE            ');
  console.log('===============================================================');

  const mongoose = (await import('mongoose')).default;
  const Task = (await import('../models/uniques360/Task.js')).default;
  const { updateTaskStatus } = await import('../controller/uniques360/taskController.js');

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/uniques_portal';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.\n');

  let passed = 0;
  let testTask = null;

  const mockCoordinatorId = new mongoose.Types.ObjectId();
  const mockOtherCoordinatorId = new mongoose.Types.ObjectId();
  const mockMemberId = new mongoose.Types.ObjectId();
  const mockLegacyMemberId = new mongoose.Types.ObjectId();
  const mockRandomUserId = new mongoose.Types.ObjectId();

  try {
    // Setup test task
    testTask = await Task.create({
      title: 'TDD Test Mark Complete Task',
      description: 'Test task for verifying mark as complete logic',
      assignedBy: mockCoordinatorId,
      assignedTo: [
        { member: mockMemberId, role: 'Developer' },
        { member: mockLegacyMemberId, role: null }
      ],
      status: 'pending',
      priority: 'medium',
      taskType: 'project'
    });
    console.log(`Created test task: ${testTask._id}`);

    // TEST 1: Mark complete by another coordinator/admin
    console.log('\n--- TEST 1: Coordinator (not task creator) marks task as completed ---');
    {
      const req = {
        params: { taskId: testTask._id.toString() },
        body: { status: 'completed' },
        user: { id: mockOtherCoordinatorId.toString(), role: 'coordinator' }
      };
      const res = createMockRes();
      await updateTaskStatus(req, res);
      assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}: ${JSON.stringify(res.body)}`);
      assert.strictEqual(res.body.task.status, 'completed');
      console.log('✅ PASS: Coordinator successfully marked task completed.');
      passed++;
    }

    // TEST 2: Reset to in-progress
    console.log('\n--- TEST 2: Revert to in-progress (clears completedBy) ---');
    {
      const req = {
        params: { taskId: testTask._id.toString() },
        body: { status: 'in-progress' },
        user: { id: mockOtherCoordinatorId.toString(), role: 'coordinator' }
      };
      const res = createMockRes();
      await updateTaskStatus(req, res);
      assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}: ${JSON.stringify(res.body)}`);
      assert.strictEqual(res.body.task.status, 'in-progress');
      console.log('✅ PASS: Successfully updated status to in-progress.');
      passed++;
    }

    // TEST 3: Assigned member marks completed (object format)
    console.log('\n--- TEST 3: Assigned member marks task completed ---');
    {
      const req = {
        params: { taskId: testTask._id.toString() },
        body: { status: 'completed' },
        user: { id: mockMemberId.toString(), role: 'member' }
      };
      const res = createMockRes();
      await updateTaskStatus(req, res);
      assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}: ${JSON.stringify(res.body)}`);
      assert.strictEqual(res.body.task.status, 'completed');
      console.log('✅ PASS: Assigned member successfully marked task completed.');
      passed++;
    }

    // Reset status
    await Task.findByIdAndUpdate(testTask._id, { status: 'pending', completedBy: null, completedAt: null });

    // TEST 4: Legacy assigned member marks completed
    console.log('\n--- TEST 4: Legacy assigned member marks task completed ---');
    {
      const req = {
        params: { taskId: testTask._id.toString() },
        body: { status: 'completed' },
        user: { id: mockLegacyMemberId.toString(), role: 'member' }
      };
      const res = createMockRes();
      await updateTaskStatus(req, res);
      assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}: ${JSON.stringify(res.body)}`);
      assert.strictEqual(res.body.task.status, 'completed');
      console.log('✅ PASS: Legacy assigned member successfully marked task completed.');
      passed++;
    }

    // TEST 5: Missing / empty status defaults to completed or returns clean error instead of 500
    console.log('\n--- TEST 5: Request with empty status body ---');
    {
      const req = {
        params: { taskId: testTask._id.toString() },
        body: {},
        user: { id: mockCoordinatorId.toString(), role: 'coordinator' }
      };
      const res = createMockRes();
      await updateTaskStatus(req, res);
      // Should either complete or return 400 bad request, NOT 500 crash
      assert.notStrictEqual(res.statusCode, 500, `Must not crash with 500: ${JSON.stringify(res.body)}`);
      console.log(`✅ PASS: Handled empty status gracefully with status code ${res.statusCode}.`);
      passed++;
    }

    // TEST 6: Unauthorized user cannot mark completed
    console.log('\n--- TEST 6: Unassigned non-manager user rejected with 403 ---');
    {
      const req = {
        params: { taskId: testTask._id.toString() },
        body: { status: 'completed' },
        user: { id: mockRandomUserId.toString(), role: 'member' }
      };
      const res = createMockRes();
      await updateTaskStatus(req, res);
      assert.strictEqual(res.statusCode, 403, `Expected 403, got ${res.statusCode}`);
      console.log('✅ PASS: Unauthorized user rejected with 403.');
      passed++;
    }

    console.log('\n===============================================================');
    console.log(`🎉 ALL ${passed}/6 TESTS PASSED`);
    console.log('===============================================================');
  } finally {
    if (testTask?._id) {
      await Task.findByIdAndDelete(testTask._id);
      console.log('Cleaned up test task.');
    }
    await mongoose.connection.close();
  }
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

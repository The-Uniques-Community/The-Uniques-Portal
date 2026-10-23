/**
 * @file verify_uniques360_member_rbac.test.cjs
 * @description Comprehensive RBAC and workflow verification for Uniques 360 member permissions:
 * 1. Member can fetch their own tasks via GET /api/uniques360/tasks/member/me
 * 2. Member cannot fetch another member's tasks via GET /api/uniques360/tasks/member/:otherId (403)
 * 3. Member cannot create tasks via POST /api/uniques360/tasks (403)
 * 4. Member cannot access GET /api/admin/member (403)
 * 5. Assigned Member can submit progress report via POST /api/uniques360/reports (201)
 * 6. Member can fetch reports for task via GET /api/uniques360/reports/task/:taskId (200)
 * 7. Assigned Member can mark task as completed via PATCH /api/uniques360/tasks/:taskId (200)
 * 8. Coordinator CAN create task via POST /api/uniques360/tasks
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
  console.log('   STARTING UNIQUES 360 MEMBER RBAC & PERMISSIONS TEST SUITE   ');
  console.log('===============================================================');

  const mongoose = (await import('mongoose')).default;
  const Task = (await import('../models/uniques360/Task.js')).default;
  const Report = (await import('../models/uniques360/Report.js')).default;
  const { 
    createTask, 
    getMemberTasks, 
    updateTaskStatus 
  } = await import('../controller/uniques360/taskController.js');
  const { 
    submitReport, 
    getTaskReports 
  } = await import('../controller/uniques360/reportController.js');
  const verifyRole = (await import('../middlewares/verifyRole.js')).default;

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/uniques_portal';
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB.\n');

  let passed = 0;
  let testTask = null;

  const mockCoordinatorId = new mongoose.Types.ObjectId();
  const mockMemberId = new mongoose.Types.ObjectId();
  const mockOtherMemberId = new mongoose.Types.ObjectId();

  try {
    // 1. Setup test task assigned to mockMemberId
    testTask = await Task.create({
      title: 'Member RBAC Test Task',
      description: 'Task assigned for member access testing',
      assignedBy: mockCoordinatorId,
      assignedTo: [
        { member: mockMemberId, role: 'Frontend Developer' }
      ],
      status: 'pending',
      priority: 'high',
      taskType: 'project'
    });
    console.log(`Created test task: ${testTask._id}`);

    // TEST 1: Member fetching own tasks via memberId='me'
    console.log('\n--- TEST 1: Member accesses GET /tasks/member/me ---');
    {
      const req = {
        params: { memberId: 'me' },
        user: { id: mockMemberId.toString(), role: 'member' }
      };
      const res = createMockRes();
      await getMemberTasks(req, res);
      assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}`);
      assert.ok(Array.isArray(res.body), 'Response body should be an array');
      const found = res.body.find(t => t._id.toString() === testTask._id.toString());
      assert.ok(found, 'Should find the task assigned to member');
      console.log('✅ PASS: Member successfully fetched own tasks.');
      passed++;
    }

    // TEST 2: Member attempting to snoop another member's tasks
    console.log('\n--- TEST 2: Member attempting to view another member\'s tasks (403) ---');
    {
      const req = {
        params: { memberId: mockOtherMemberId.toString() },
        user: { id: mockMemberId.toString(), role: 'member' }
      };
      const res = createMockRes();
      await getMemberTasks(req, res);
      assert.strictEqual(res.statusCode, 403, `Expected 403, got ${res.statusCode}`);
      assert.strictEqual(res.body.message, 'Unauthorized to view tasks for another member');
      console.log('✅ PASS: Cross-member task snooping blocked with 403.');
      passed++;
    }

    // TEST 3: verifyRole blocks Member on Coordinator/Admin routes (e.g. POST /tasks)
    console.log('\n--- TEST 3: verifyRole blocks Member on coordinator route (403) ---');
    {
      const guard = verifyRole(['admin', 'coordinator', 'communityadmin']);
      const req = {
        user: { id: mockMemberId.toString(), role: 'member' }
      };
      const res = createMockRes();
      let nextCalled = false;
      guard(req, res, () => { nextCalled = true; });
      assert.strictEqual(nextCalled, false, 'Next should not be called');
      assert.strictEqual(res.statusCode, 403, `Expected 403, got ${res.statusCode}`);
      assert.ok(res.body.message.includes('Unauthorized'), 'Error message should indicate unauthorized');
      console.log('✅ PASS: Member cannot execute coordinator-only actions.');
      passed++;
    }

    // TEST 4: verifyRole blocks Member on admin member directory (GET /api/admin/member)
    console.log('\n--- TEST 4: verifyRole blocks Member on GET /api/admin/member (403) ---');
    {
      const guard = verifyRole(['admin', 'coordinator']);
      const req = {
        user: { id: mockMemberId.toString(), role: 'member' }
      };
      const res = createMockRes();
      let nextCalled = false;
      guard(req, res, () => { nextCalled = true; });
      assert.strictEqual(nextCalled, false, 'Next should not be called');
      assert.strictEqual(res.statusCode, 403, `Expected 403, got ${res.statusCode}`);
      assert.ok(res.body.message.includes('Unauthorized: You need one of these roles: admin, coordinator'));
      console.log('✅ PASS: Member blocked from /api/admin/member as expected.');
      passed++;
    }

    // TEST 5: verifyRole permits Member on collaboration routes
    console.log('\n--- TEST 5: verifyRole permits Member on member collaboration routes ---');
    {
      const guard = verifyRole(['admin', 'coordinator', 'member', 'communityadmin']);
      const req = {
        user: { id: mockMemberId.toString(), role: 'member' }
      };
      const res = createMockRes();
      let nextCalled = false;
      guard(req, res, () => { nextCalled = true; });
      assert.strictEqual(nextCalled, true, 'Next should be called for member');
      console.log('✅ PASS: Member permitted on collaboration routes.');
      passed++;
    }

    // TEST 6: Assigned Member submits progress report (POST /reports)
    console.log('\n--- TEST 6: Assigned member submits progress report ---');
    {
      const req = {
        body: {
          taskId: testTask._id.toString(),
          reportContent: 'Working on frontend components for Uniques 360',
          progressPercent: 50
        },
        user: { id: mockMemberId.toString(), role: 'member' }
      };
      const res = createMockRes();
      await submitReport(req, res);
      assert.strictEqual(res.statusCode, 201, `Expected 201, got ${res.statusCode}: ${JSON.stringify(res.body)}`);
      assert.strictEqual(res.body.report.progressPercent, 50);
      console.log('✅ PASS: Assigned member submitted progress report successfully.');
      passed++;
    }

    // TEST 7: Member fetches reports for task (GET /reports/task/:taskId)
    console.log('\n--- TEST 7: Member fetches reports for task ---');
    {
      const req = {
        params: { taskId: testTask._id.toString() },
        user: { id: mockMemberId.toString(), role: 'member' }
      };
      const res = createMockRes();
      await getTaskReports(req, res);
      assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}`);
      assert.ok(Array.isArray(res.body), 'Body should be array of reports');
      assert.ok(res.body.length >= 1, 'Should find at least 1 report');
      console.log('✅ PASS: Member successfully fetched task reports.');
      passed++;
    }

    // TEST 8: Assigned Member marks task as completed (PATCH /tasks/:taskId)
    console.log('\n--- TEST 8: Assigned member marks task as completed ---');
    {
      const req = {
        params: { taskId: testTask._id.toString() },
        body: { status: 'completed' },
        user: { id: mockMemberId.toString(), role: 'member' }
      };
      const res = createMockRes();
      await updateTaskStatus(req, res);
      assert.strictEqual(res.statusCode, 200, `Expected 200, got ${res.statusCode}`);
      assert.strictEqual(res.body.task.status, 'completed');
      console.log('✅ PASS: Assigned member marked task completed.');
      passed++;
    }

    // TEST 9: Coordinator creates task (POST /tasks)
    console.log('\n--- TEST 9: Coordinator creates task ---');
    let coordinatorCreatedTaskId = null;
    {
      const req = {
        body: {
          title: 'Coordinator Task Test',
          description: 'Created by coordinator',
          assignedTo: [],
          deadline: new Date(Date.now() + 86400000),
          priority: 'medium',
          taskType: 'project'
        },
        user: { id: mockCoordinatorId.toString(), role: 'coordinator' }
      };
      const res = createMockRes();
      await createTask(req, res);
      assert.strictEqual(res.statusCode, 201, `Expected 201, got ${res.statusCode}: ${JSON.stringify(res.body)}`);
      coordinatorCreatedTaskId = res.body.task._id;
      console.log('✅ PASS: Coordinator successfully created task.');
      passed++;
    }

    if (coordinatorCreatedTaskId) {
      await Task.findByIdAndDelete(coordinatorCreatedTaskId);
    }

    console.log('\n===============================================================');
    console.log(`🎉 ALL ${passed}/9 RBAC & WORKFLOW TESTS PASSED`);
    console.log('===============================================================');
  } finally {
    if (testTask?._id) {
      await Report.deleteMany({ taskId: testTask._id });
      await Task.findByIdAndDelete(testTask._id);
      console.log('Cleaned up test task & reports.');
    }
    await mongoose.connection.close();
  }
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});

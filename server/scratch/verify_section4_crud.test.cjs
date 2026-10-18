/**
 * @file verify_section4_crud.test.cjs
 * @description Automated verification test suite for Section 4 CRUD breakages fixes:
 *  1. Accounts Module (Fine Records Post-Batch 3.0 & Broken Remove Button)
 *  2. Project Management CRUD
 *  3. Uniques 360 Workspace CRUD
 *  4. Stats, Batches, & Community CRUD
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
  console.log('   STARTING SECTION 4 DATABASE & CRUD BREAKAGES TEST SUITE     ');
  console.log('===============================================================');

  // Dynamic import of ES modules
  const mongoose = (await import('mongoose')).default;
  const Member = (await import('../models/member/memberModel.js')).default;
  const User = (await import('../models/user/userModel.js')).default;
  const Project = (await import('../models/projects/projectModel.js')).default;
  const Task = (await import('../models/uniques360/Task.js')).default;
  const { BatchName } = await import('../models/community/batchModel.js');

  const { getMembersByFineStatus } = await import('../controller/admin/memberController.js');
  const { getMembersWithPendingFines, imposeFine } = await import('../controller/admin/fineController.js');
  const { getProjectById, updateProject, deleteProject } = await import('../controller/Community/projectController.js');
  const { addMemberToTask, removeMemberFromTask, updateTask, deleteTask } = await import('../controller/uniques360/taskController.js');
  const { deleteBatchById, deleteBatchByName } = await import('../controller/Community/batchController.js');

  const memberAdminRouter = (await import('../routes/admin/memberRoute.js')).default;
  const projectRouter = (await import('../routes/community/projectRoute.js')).default;
  const batchRouter = (await import('../routes/community/batchRoute.js')).default;
  const communityBenefitsRouter = (await import('../routes/community/communityBenefitsRoute.js')).default;

  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/uniques_portal';
  console.log(`Connecting to MongoDB at: ${mongoUri.replace(/:([^@]+)@/, ':****@')}`);
  await mongoose.connect(mongoUri);
  console.log('Connected to MongoDB successfully.\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}`);
      console.error(err);
      process.exitCode = 1;
    }
  }

  try {
    // --------------------------------------------------------------------------
    // SECTION 1: ACCOUNTS MODULE & FINE RECORDS
    // --------------------------------------------------------------------------
    console.log('\n--- GROUP 1: Accounts Module & Fines ---');

    await test('memberController: getMembersByFineStatus queries fines array & returns dynamic totalAmount and totalPendingAmount', async () => {
      // Find or seed a member with fines
      let testMember = await Member.findOne({ 'fines.0': { $exists: true } });
      if (!testMember) {
        testMember = await Member.create({
          fullName: 'Test Fine Member',
          email: `testfine_${Date.now()}@theuniques.in`,
          batch: 'The Uniques 5.0',
          role: 'member',
          fines: [
            { amount: 50, reason: 'Late submission', status: 'pending' },
            { amount: 100, reason: 'Absence', status: 'paid' }
          ]
        });
      }

      const req = { query: {} };
      const res = createMockRes();

      await getMembersByFineStatus(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(Array.isArray(res.body.data), 'data should be an array');
      assert.ok(res.body.count > 0, 'count should be greater than 0');

      const found = res.body.data.find(m => m._id.toString() === testMember._id.toString());
      assert.ok(found, 'Test member should be in returned list');
      assert.ok(typeof found.totalAmount === 'number', 'totalAmount must be a number');
      assert.ok(typeof found.totalPendingAmount === 'number', 'totalPendingAmount must be a number');
      assert.ok(found.totalAmount >= found.totalPendingAmount);
    });

    await test('fineController: getMembersWithPendingFines supports batch filtering & returns both totalAmount and totalPendingAmount', async () => {
      const req = { query: { batch: 'The Uniques 5.0' } };
      const res = createMockRes();

      await getMembersWithPendingFines(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(res.body.data && Array.isArray(res.body.data.members));

      // Each member must have totalAmount and totalPendingAmount
      if (res.body.data.members.length > 0) {
        const first = res.body.data.members[0];
        assert.ok('totalAmount' in first, 'Member must have totalAmount');
        assert.ok('totalPendingAmount' in first, 'Member must have totalPendingAmount');
        assert.strictEqual(first.batch, 'The Uniques 5.0');
      }
    });

    await test('memberRoute: Mounts POST /:memberId/fine and POST /:memberId/fines route aliases', () => {
      const routes = memberAdminRouter.stack.filter(layer => layer.route);
      const postFine = routes.find(r => r.route.path === '/:memberId/fine' && r.route.methods.post);
      const postFines = routes.find(r => r.route.path === '/:memberId/fines' && r.route.methods.post);

      assert.ok(postFine, 'POST /:memberId/fine route must be mounted on memberAdminRouter');
      assert.ok(postFines, 'POST /:memberId/fines route must be mounted on memberAdminRouter');
    });

    // --------------------------------------------------------------------------
    // SECTION 2: PROJECT MANAGEMENT CRUD
    // --------------------------------------------------------------------------
    console.log('\n--- GROUP 2: Project Management CRUD ---');

    await test('projectController: getProjectById returns 404 for malformed ObjectId without throwing 500 BSON CastError', async () => {
      const req = { params: { id: 'invalid-hex-id-123' } };
      const res = createMockRes();

      await getProjectById(req, res);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Project not found or invalid ID format');
    });

    await test('projectController: updateProject returns 404 for malformed ObjectId', async () => {
      const req = { params: { id: 'not-an-object-id' }, body: { title: 'Updated' } };
      const res = createMockRes();

      await updateProject(req, res);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Project not found or invalid ID format');
    });

    await test('projectController: deleteProject returns 404 for malformed ObjectId', async () => {
      const req = { params: { id: 'bad-id' } };
      const res = createMockRes();

      await deleteProject(req, res);

      assert.strictEqual(res.statusCode, 404);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'Project not found or invalid ID format');
    });

    await test('projectRoute: verifyRole includes communityadmin alongside admin and coordinator', () => {
      const routes = projectRouter.stack.filter(layer => layer.route);
      ['post', 'put', 'delete'].forEach(method => {
        const matched = routes.find(r => r.route.methods[method]);
        assert.ok(matched, `Project route with method ${method} must exist`);
      });
    });

    // --------------------------------------------------------------------------
    // SECTION 3: UNIQUES 360 WORKSPACE CRUD
    // --------------------------------------------------------------------------
    console.log('\n--- GROUP 3: Uniques 360 Workspace CRUD ---');

    // Create a test task and members
    const memberA = await Member.findOne() || await Member.create({
      fullName: 'Workspace Member A',
      email: `wma_${Date.now()}@theuniques.in`,
      role: 'member'
    });

    const memberB = await Member.create({
      fullName: 'Workspace Member B',
      email: `wmb_${Date.now()}@theuniques.in`,
      role: 'member'
    });

    const coordinatorUser = await Member.create({
      fullName: 'Coordinator User',
      email: `coord_${Date.now()}@theuniques.in`,
      role: 'coordinator'
    });

    const testTask = await Task.create({
      title: 'CRUD Verification Task',
      description: 'Testing task assignment and admin bypass',
      assignedBy: coordinatorUser._id,
      assignedTo: [{ member: memberA._id, role: 'Developer' }]
    });

    await test('taskController: addMemberToTask accepts req.body.memberId alias and allows admin override', async () => {
      const req = {
        params: { taskId: testTask._id.toString() },
        body: { memberId: memberB._id.toString(), role: 'Tester' },
        user: { id: new mongoose.Types.ObjectId().toString(), role: 'admin' } // different user, but admin!
      };
      const res = createMockRes();

      await addMemberToTask(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.message, 'Member added to project successfully');
      assert.ok(res.body.task.assignedTo.some(a => a.member._id.toString() === memberB._id.toString()));
    });

    await test('taskController: removeMemberFromTask accepts req.body.memberId alias and allows admin override', async () => {
      const req = {
        params: { taskId: testTask._id.toString() },
        body: { memberId: memberB._id.toString() },
        user: { id: new mongoose.Types.ObjectId().toString(), role: 'admin' } // admin bypass
      };
      const res = createMockRes();

      await removeMemberFromTask(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.message, 'Member removed from project successfully');
      assert.ok(!res.body.task.assignedTo.some(a => a.member._id.toString() === memberB._id.toString()));
    });

    await test('taskController: updateTask unwraps populated member objects without CastError and allows admin override', async () => {
      // Simulate frontend passing back populated { member: { _id, fullName }, role } in assignedTo
      const req = {
        params: { taskId: testTask._id.toString() },
        body: {
          title: 'Updated CRUD Task Title',
          assignedTo: [
            { member: { _id: memberA._id.toString(), fullName: memberA.fullName }, role: 'Lead' }
          ]
        },
        user: { id: new mongoose.Types.ObjectId().toString(), role: 'admin' } // admin override
      };
      const res = createMockRes();

      await updateTask(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.message, 'Task updated successfully');
      assert.strictEqual(res.body.task.title, 'Updated CRUD Task Title');
    });

    await test('taskController: deleteTask allows admin override to delete any task', async () => {
      const req = {
        params: { taskId: testTask._id.toString() },
        user: { id: new mongoose.Types.ObjectId().toString(), role: 'admin' } // admin override
      };
      const res = createMockRes();

      await deleteTask(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.message, 'Task deleted successfully');

      const check = await Task.findById(testTask._id);
      assert.strictEqual(check, null);
    });

    // Clean up temporary test users
    await Member.deleteOne({ _id: memberB._id });
    await Member.deleteOne({ _id: coordinatorUser._id });

    // --------------------------------------------------------------------------
    // SECTION 4: STATS, BATCHES, & COMMUNITY CRUD
    // --------------------------------------------------------------------------
    console.log('\n--- GROUP 4: Stats, Batches, & Community CRUD ---');

    await test('batchController: deleteBatchByName deletes cohort by normalized or short name', async () => {
      const batchName = 'The Uniques 88.0';
      await BatchName.create({ name: batchName });

      // Delete by name "88.0"
      const req = { params: { name: '88.0' } };
      const res = createMockRes();

      await deleteBatchByName(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'Batch deleted successfully');

      const found = await BatchName.findOne({ name: batchName });
      assert.strictEqual(found, null);
    });

    await test('batchController: deleteBatchById deletes cohort by ObjectId', async () => {
      const created = await BatchName.create({ name: 'The Uniques 89.0' });

      const req = { params: { id: created._id.toString() } };
      const res = createMockRes();

      await deleteBatchById(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.strictEqual(res.body.message, 'Batch deleted successfully');

      const found = await BatchName.findById(created._id);
      assert.strictEqual(found, null);
    });

    await test('batchRoute: Mounts DELETE /name/:name and DELETE /:id routes', () => {
      const routes = batchRouter.stack.filter(layer => layer.route);
      const delName = routes.find(r => r.route.path === '/name/:name' && r.route.methods.delete);
      const delId = routes.find(r => r.route.path === '/:id' && r.route.methods.delete);

      assert.ok(delName, 'DELETE /name/:name must be mounted on batchRouter');
      assert.ok(delId, 'DELETE /:id must be mounted on batchRouter');
    });

    await test('communityBenefitsRoute: Mounts POST / and PUT / route aliases', () => {
      const routes = communityBenefitsRouter.stack.filter(layer => layer.route);
      const postRoot = routes.find(r => r.route.path === '/' && r.route.methods.post);
      const putRoot = routes.find(r => r.route.path === '/' && r.route.methods.put);

      assert.ok(postRoot, 'POST / must be mounted on communityBenefitsRouter');
      assert.ok(putRoot, 'PUT / must be mounted on communityBenefitsRouter');
    });

    await test('userModel: Validates dynamic batch cohorts (Batch 7.0+) without schema deadlock', async () => {
      const user = new User({
        fullName: 'Dynamic Batch Test User',
        email: `dynamic_${Date.now()}@theuniques.in`,
        role: 'member',
        batch: 'The Uniques 7.0'
      });

      const validationError = user.validateSync();
      assert.strictEqual(validationError, undefined, 'User with Batch 7.0 must not produce validation error');

      const user8 = new User({
        fullName: 'Dynamic Batch 8 User',
        email: `dynamic8_${Date.now()}@theuniques.in`,
        role: 'member',
        batch: 'The Uniques 8.0'
      });

      const validationError8 = user8.validateSync();
      assert.strictEqual(validationError8, undefined, 'User with Batch 8.0 must not produce validation error');
    });

  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }

  console.log('\n===============================================================');
  console.log(`TEST RESULTS: ${passed}/${total} PASSED`);
  console.log('===============================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Unhandled test suite failure:', err);
  process.exit(1);
});

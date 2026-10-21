const http = require('http');
const assert = require('assert');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  console.log('===============================================================');
  console.log('🧪 MASTER PORTAL END-TO-END CRUD & INTEGRATION TEST SUITE');
  console.log('===============================================================\n');

  const appModule = await import('../index.js');
  const app = appModule.default;
  const User = (await import('../models/user/userModel.js')).default;
  const Event = (await import('../models/member/eventModel.js')).default;
  const Guest = (await import('../models/member/guestModel.js')).default;
  const Leave = (await import('../models/member/leaveModel.js')).default;
  const Batch = (await import('../models/community/batchModel.js')).default;
  const Project = (await import('../models/projects/projectModel.js')).default;
  const Task = (await import('../models/uniques360/Task.js')).default;
  const CampusAmbassador = (await import('../models/community/campusAmbassadorModel.js')).default;
  const mongoose = (await import('mongoose')).default;

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const adminId = new mongoose.Types.ObjectId();
  const coordinatorId = new mongoose.Types.ObjectId();
  const memberId = new mongoose.Types.ObjectId();

  const adminToken = jwt.sign(
    { id: adminId.toString(), role: 'admin' },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1h' }
  );
  const coordToken = jwt.sign(
    { id: coordinatorId.toString(), role: 'coordinator' },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1h' }
  );
  const memberToken = jwt.sign(
    { id: memberId.toString(), role: 'member' },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1h' }
  );

  const adminHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${adminToken}` };
  const coordHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${coordToken}` };
  const memberHeaders = { 'Content-Type': 'application/json', Authorization: `Bearer ${memberToken}` };

  let totalTests = 0;
  let passedTests = 0;

  async function test(name, fn) {
    totalTests++;
    try {
      await fn();
      passedTests++;
      console.log(`✅ [PASS] ${name}`);
    } catch (err) {
      console.error(`❌ [FAIL] ${name}:`, err.message);
      throw err;
    }
  }

  try {
    // Section 1: Guest Speakers CRUD
    let testGuestId = null;
    await test('1.1: POST /api/guest (Create Guest)', async () => {
      const res = await fetch(`${baseUrl}/api/guest`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          guestName: 'Master Test Guest',
          guestEmail: 'master_guest@example.com',
          guestDesignation: 'Principal Architect',
          guestCompany: 'Alpha Tech'
        })
      });
      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert(data.success);
      testGuestId = data.guest._id;
    });

    await test('1.2: GET /api/guest (List Guests)', async () => {
      const res = await fetch(`${baseUrl}/api/guest`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert(data.success && Array.isArray(data.guests));
    });

    await test('1.3: PUT /api/guest/:id (Update Guest)', async () => {
      const res = await fetch(`${baseUrl}/api/guest/${testGuestId}`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({ guestDesignation: 'VP Innovation' })
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual(data.guest.guestDesignation, 'VP Innovation');
    });

    await test('1.4: DELETE /api/guest/:id (Delete Guest)', async () => {
      const res = await fetch(`${baseUrl}/api/guest/${testGuestId}`, {
        method: 'DELETE',
        headers: adminHeaders
      });
      assert.strictEqual(res.status, 200);
      const resCheck = await fetch(`${baseUrl}/api/guest/${testGuestId}`);
      assert.strictEqual(resCheck.status, 404);
    });

    // Section 2: Events & Member Assignment CRUD
    let testEventId = null;
    await test('2.1: POST /api/events (Create Event with Embedded Banner & Guests)', async () => {
      const res = await fetch(`${baseUrl}/api/events`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({
          eventName: 'Master E2E Event',
          eventDescription: 'Verifying end-to-end event lifecycle and assignments',
          eventType: 'Hackathon',
          eventOrganizerBatch: 'The Uniques 2.0',
          eventBanner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87',
          eventMembers: [
            {
              contributionType: 'technical team',
              contributionTeam: [memberId]
            }
          ]
        })
      });
      assert(res.status === 200 || res.status === 201, `Expected 200/201, got ${res.status}`);
      const data = await res.json();
      assert(data.success);
      testEventId = (data.event || data.data)?._id;
      assert(testEventId);
    });

    await test('2.2: GET /api/events/:id (Fetch Event)', async () => {
      const res = await fetch(`${baseUrl}/api/events/${testEventId}`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.strictEqual((data.event || data.data)?.eventName, 'Master E2E Event');
    });

    await test('2.3: DELETE /api/events/:id/members/:memberId (Remove Event Member REST)', async () => {
      const res = await fetch(`${baseUrl}/api/events/${testEventId}/members/${memberId.toString()}`, {
        method: 'DELETE',
        headers: adminHeaders
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert(data.success);
    });

    await test('2.4: DELETE /api/events/:id (Delete Event)', async () => {
      const res = await fetch(`${baseUrl}/api/events/${testEventId}`, {
        method: 'DELETE',
        headers: adminHeaders
      });
      assert.strictEqual(res.status, 200);
    });

    // Section 3: Fine Management & Receipts
    let fineTestMemberId = new mongoose.Types.ObjectId();
    let fineSubId = new mongoose.Types.ObjectId();
    await test('3.1: Seed Member with Fine & Test PATCH /api/admin/fine with Proof', async () => {
      const testMember = new User({
        _id: fineTestMemberId,
        fullName: 'E2E Fine Student',
        email: `e2e_fine_${Date.now()}@example.com`,
        password: 'password123',
        admno: `2022BTCS${Math.floor(100 + Math.random() * 899)}`,
        role: 'member',
        batch: 'The Uniques 1.0',
        fines: [
          {
            _id: fineSubId,
            amount: 100,
            reason: 'Lab equipment delay',
            status: 'pending'
          }
        ]
      });
      await testMember.save();

      const res = await fetch(
        `${baseUrl}/api/admin/fine/members/${fineTestMemberId.toString()}/fines/${fineSubId.toString()}`,
        {
          method: 'PATCH',
          headers: adminHeaders,
          body: JSON.stringify({
            status: 'paid',
            proofOfPayment: {
              fileId: '1GoogleDriveReceiptId',
              fileUrl: 'https://drive.google.com/file/d/1GoogleDriveReceiptId/preview',
              url: 'https://drive.google.com/file/d/1GoogleDriveReceiptId/preview',
              fileName: 'receipt_e2e.pdf'
            }
          })
        }
      );
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert(data.success);
      assert.strictEqual(data.data.fine.proofOfPayment.fileUrl, 'https://drive.google.com/file/d/1GoogleDriveReceiptId/preview');
    });

    await test('3.2: GET /api/fine (Member Fine Self-Service)', async () => {
      const token = jwt.sign(
        { id: fineTestMemberId.toString(), role: 'member' },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1h' }
      );
      const res = await fetch(`${baseUrl}/api/fine`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert(Array.isArray(data.data?.fines));
      assert.strictEqual(data.data.fines.length, 1);
    });

    await User.findByIdAndDelete(fineTestMemberId);

    // Section 4: Batches & Campus Ambassador
    let testBatchId = null;
    await test('4.1: GET /api/batches and POST /api/batches (Batch REST)', async () => {
      const resGet = await fetch(`${baseUrl}/api/batches`);
      assert.strictEqual(resGet.status, 200);

      const resPost = await fetch(`${baseUrl}/api/batches`, {
        method: 'POST',
        headers: adminHeaders,
        body: JSON.stringify({ name: `8.0-${Date.now()}` })
      });
      assert(resPost.status === 200 || resPost.status === 201);
      const dataPost = await resPost.json();
      assert(dataPost.success);
    });

    await test('4.2: POST /api/apply-campus-ambassador (Campus Ambassador REST)', async () => {
      const res = await fetch(`${baseUrl}/api/apply-campus-ambassador`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Master E2E Ambassador',
          email: `e2e_amb_${Date.now()}@example.com`,
          phone: '9123456789',
          college: 'Master University',
          course: 'Computer Science',
          graduationYear: '2026',
          whyJoin: 'I am excited to represent the community and empower students to learn cutting edge tech and AI.',
          heardFrom: 'Social Media'
        })
      });
      assert.strictEqual(res.status, 201);
      const data = await res.json();
      assert(data.success);
    });

    // Section 5: Leave Management
    let testLeaveId = null;
    let leaveMemberId = new mongoose.Types.ObjectId();
    await test('5.1: POST /api/leave/submit & PUT /api/leave/:id/approve', async () => {
      const member = new User({
        _id: leaveMemberId,
        fullName: 'Leave Test User',
        email: `leave_master_${Date.now()}@example.com`,
        password: 'password123',
        admno: `2022BTCS${Math.floor(100 + Math.random() * 899)}`,
        role: 'member',
        batch: 'The Uniques 2.0'
      });
      await member.save();

      const memberTokenLocal = jwt.sign(
        { id: leaveMemberId.toString(), role: 'member' },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '1h' }
      );

      const resSubmit = await fetch(`${baseUrl}/api/leave/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${memberTokenLocal}` },
        body: JSON.stringify({
          type: 'Sick Leave',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 86400000).toISOString(),
          reason: 'Medical recovery and health rest'
        })
      });
      assert.strictEqual(resSubmit.status, 201);
      const dataSubmit = await resSubmit.json();
      testLeaveId = dataSubmit.leave._id;

      const resApprove = await fetch(`${baseUrl}/api/leave/${testLeaveId}/approve`, {
        method: 'PUT',
        headers: adminHeaders,
        body: JSON.stringify({ remarks: 'Approved' })
      });
      assert.strictEqual(resApprove.status, 200);
      const dataApprove = await resApprove.json();
      assert.strictEqual(dataApprove.leave.status, 'Approved');

      await Leave.findByIdAndDelete(testLeaveId);
      await User.findByIdAndDelete(leaveMemberId);
    });

    // Section 6: Uniques360 Tasks
    let testTaskId = null;
    let taskMemberId = new mongoose.Types.ObjectId();
    await test('6.1: POST /api/uniques360/tasks & GET /api/uniques360/tasks/coordinator/current', async () => {
      const taskMember = new User({
        _id: taskMemberId,
        fullName: 'Task Assigned Member',
        email: `task_member_${Date.now()}@example.com`,
        password: 'password123',
        admno: `2022BTCS${Math.floor(100 + Math.random() * 899)}`,
        role: 'member',
        batch: 'The Uniques 2.0'
      });
      await taskMember.save();

      const resPost = await fetch(`${baseUrl}/api/uniques360/tasks`, {
        method: 'POST',
        headers: coordHeaders,
        body: JSON.stringify({
          title: 'Master E2E Task',
          description: 'Testing task assignment flow',
          assignedTo: [taskMemberId.toString()],
          priority: 'medium',
          deadline: new Date(Date.now() + 86400000).toISOString()
        })
      });
      assert.strictEqual(resPost.status, 201);
      const dataPost = await resPost.json();
      testTaskId = dataPost.task?._id || dataPost._id;

      const resGet = await fetch(`${baseUrl}/api/uniques360/tasks/coordinator/current`, {
        headers: coordHeaders
      });
      assert.strictEqual(resGet.status, 200);

      if (testTaskId) {
        await Task.findByIdAndDelete(testTaskId);
      }
      await User.findByIdAndDelete(taskMemberId);
    });

    // Section 7: Trainers Directory
    await test('7.1: GET /api/admin/trainers/all-trainers', async () => {
      const res = await fetch(`${baseUrl}/api/admin/trainers/all-trainers`);
      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert(Array.isArray(data) || Array.isArray(data.trainers));
    });

    console.log(`\n===============================================================`);
    console.log(`🎉 ALL ${passedTests}/${totalTests} MASTER INTEGRATION TESTS PASSED GREEN!`);
    console.log(`===============================================================\n`);
    process.exit(0);
  } finally {
    server.close();
  }
}

run().catch(err => {
  console.error('\n❌ MASTER SUITE FAILED:', err);
  process.exit(1);
});

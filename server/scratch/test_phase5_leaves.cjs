const http = require('http');
const assert = require('assert');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  console.log('[Phase 5 Test] Booting Express App & Testing Leave Management Endpoints...');
  const appModule = await import('../index.js');
  const app = appModule.default;
  const User = (await import('../models/user/userModel.js')).default;
  const Leave = (await import('../models/member/leaveModel.js')).default;
  const mongoose = (await import('mongoose')).default;

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const memberId = new mongoose.Types.ObjectId();
  const adminId = new mongoose.Types.ObjectId();

  const memberToken = jwt.sign(
    { id: memberId.toString(), role: 'member' },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1h' }
  );
  const adminToken = jwt.sign(
    { id: adminId.toString(), role: 'admin' },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1h' }
  );

  const memberHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${memberToken}`
  };
  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`
  };

  let leaveId = null;

  try {
    // Create test member and admin users in DB
    const randomMemberAdm = `2022BTCS${Math.floor(100 + Math.random() * 899)}`;
    const testMember = new User({
      _id: memberId,
      fullName: 'TDD Leave Applicant',
      email: `leave_test_${Date.now()}@example.com`,
      password: 'password123',
      admno: randomMemberAdm,
      role: 'member',
      batch: 'The Uniques 3.0'
    });
    await testMember.save();

    const randomAdminAdm = `2022BTCS${Math.floor(100 + Math.random() * 899)}`;
    const testAdmin = new User({
      _id: adminId,
      fullName: 'TDD Leave Admin',
      email: `leave_admin_${Date.now()}@example.com`,
      password: 'password123',
      admno: randomAdminAdm,
      role: 'admin',
      batch: 'The Uniques 3.0'
    });
    await testAdmin.save();

    // 1. Submit leave request (POST /api/leave/submit)
    console.log('\nTesting POST /api/leave/submit ...');
    const leavePayload = {
      type: 'Casual Leave',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 86400000).toISOString(),
      reason: 'Attending regional hackathon event for project development'
    };
    const resSubmit = await fetch(`${baseUrl}/api/leave/submit`, {
      method: 'POST',
      headers: memberHeaders,
      body: JSON.stringify(leavePayload)
    });
    assert.strictEqual(resSubmit.status, 201, `Expected 201, got ${resSubmit.status}`);
    const dataSubmit = await resSubmit.json();
    assert(dataSubmit.success === true, 'Expected dataSubmit.success === true');
    const leaveId = dataSubmit.leave._id;
    assert(leaveId, 'Expected created leave to have _id');

    // 2. Fetch my leaves (GET /api/leave/my-leaves)
    console.log('\nTesting GET /api/leave/my-leaves ...');
    const resMyLeaves = await fetch(`${baseUrl}/api/leave/my-leaves`, {
      headers: memberHeaders
    });
    assert.strictEqual(resMyLeaves.status, 200, `Expected 200, got ${resMyLeaves.status}`);
    const dataMyLeaves = await resMyLeaves.json();
    assert(Array.isArray(dataMyLeaves.leaves), 'Expected leaves array');
    assert(dataMyLeaves.leaves.some(l => l._id.toString() === leaveId.toString()), 'Created leave should appear in my-leaves');

    // 3. Fetch all leaves as admin (GET /api/leave/all)
    console.log('\nTesting GET /api/leave/all ...');
    const resAllLeaves = await fetch(`${baseUrl}/api/leave/all`, {
      headers: adminHeaders
    });
    assert.strictEqual(resAllLeaves.status, 200, `Expected 200, got ${resAllLeaves.status}`);
    const dataAllLeaves = await resAllLeaves.json();
    assert(Array.isArray(dataAllLeaves.leaves), 'Expected leaves array');

    // 4. Approve leave (PUT /api/leave/:id/approve)
    console.log(`\nTesting PUT /api/leave/${leaveId}/approve ...`);
    const resApprove = await fetch(`${baseUrl}/api/leave/${leaveId}/approve`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ remarks: 'Approved for hackathon', approvedBy: 'Admin' })
    });
    assert.strictEqual(resApprove.status, 200, `Expected 200, got ${resApprove.status}`);
    const dataApprove = await resApprove.json();
    assert.strictEqual(dataApprove.leave.status, 'Approved');

    console.log('\n[Phase 5 Test] ALL LEAVE MANAGEMENT ENDPOINTS PASSED! ✅');
  } finally {
    if (leaveId) {
      await Leave.findByIdAndDelete(leaveId).catch(err => {
        console.error('Error cleaning up leave:', err);
      });
    }
    if (memberId) {
      await User.findByIdAndDelete(memberId).catch(err => {
        console.error('Error cleaning up test member:', err);
      });
    }
    if (adminId) {
      await User.findByIdAndDelete(adminId).catch(err => {
        console.error('Error cleaning up test admin:', err);
      });
    }
    server.close();
  }
}

run().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('\n❌ [Phase 5 Test Failed]:', err);
  process.exit(1);
});

/**
 * @file verify_coordinator_service.test.js
 * @description Integration verification script testing coordinator login, profile retrieval, profile updates with rollback, task queries, and dashboard metrics.
 */
process.env.VERCEL = '1'; // Prevents server/index.js startServer() port collision

import assert from 'assert';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import dbconnect from '../config/dbConfig.js';
import app from '../index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const COORDINATOR_CREDENTIALS = {
  email: 'officialid.yashkesarwani@gmail.com',
  password: 'Yash@251198',
};

async function runTests() {
  console.log('====================================================');
  console.log('🚀 Starting Coordinator Service Integration Test Suite');
  console.log('====================================================\n');

  console.log('1. Connecting to database...');
  await dbconnect();
  console.log('   ✅ MongoDB connected successfully.\n');

  // Start app on ephemeral port to avoid conflicts
  const server = app.listen(0);
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`2. Test HTTP server running on ${baseUrl}\n`);

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Coordinator Login via /auth/emaillogin
    // -------------------------------------------------------------------------
    console.log('3. Testing coordinator login (/auth/emaillogin)...');
    const loginRes = await fetch(`${baseUrl}/auth/emaillogin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(COORDINATOR_CREDENTIALS),
    });

    const loginData = await loginRes.json();
    assert.strictEqual(loginRes.status, 200, `Login failed: ${JSON.stringify(loginData)}`);
    assert(loginData.token, 'Expected JWT token in login response');
    const token = loginData.token;
    const coordinatorUser = loginData.member;
    const coordinatorId = coordinatorUser._id || coordinatorUser.id;
    console.log(`   ✅ Login successful! Role: "${loginData.role}", Member ID: "${coordinatorId}"\n`);

    const authHeaders = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // -------------------------------------------------------------------------
    // TEST 2: GET /api/member/getProfile
    // -------------------------------------------------------------------------
    console.log('4. Testing GET /api/member/getProfile...');
    const profileRes = await fetch(`${baseUrl}/api/member/getProfile`, {
      method: 'GET',
      headers: authHeaders,
    });
    const profileData = await profileRes.json();
    assert.strictEqual(profileRes.status, 200, `getProfile returned ${profileRes.status}`);
    assert(profileData.member, 'Expected response to contain "member" object');
    assert.strictEqual(
      profileData.member.email.toLowerCase(),
      COORDINATOR_CREDENTIALS.email.toLowerCase(),
      'Member email should match logged-in coordinator'
    );
    console.log(`   ✅ Profile retrieved: ${profileData.member.fullName || profileData.member.name} (${profileData.member.email})\n`);

    // -------------------------------------------------------------------------
    // TEST 3: PUT /api/admin/member/:id with rollback
    // -------------------------------------------------------------------------
    console.log(`5. Testing PUT /api/admin/member/${coordinatorId} (with immediate rollback)...`);
    const originalBio = profileData.member.bio || '';
    const testBio = `Test bio update [${Date.now()}]`;

    const updateRes = await fetch(`${baseUrl}/api/admin/member/${coordinatorId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ bio: testBio }),
    });
    const updateData = await updateRes.json();
    assert.strictEqual(updateRes.status, 200, `PUT /api/admin/member/:id failed: ${JSON.stringify(updateData)}`);
    assert.strictEqual(updateData.success, true, 'Expected success: true');
    assert.strictEqual(updateData.data.bio, testBio, 'Bio should be updated to test value');
    console.log(`   ✅ Profile updated to temporary test value.`);

    // Rollback
    const restoreRes = await fetch(`${baseUrl}/api/admin/member/${coordinatorId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ bio: originalBio }),
    });
    const restoreData = await restoreRes.json();
    assert.strictEqual(restoreRes.status, 200, 'Rollback failed');
    assert.strictEqual(restoreData.data.bio, originalBio, 'Bio should be restored');
    console.log(`   ✅ Rollback successful. Original bio restored.\n`);

    // -------------------------------------------------------------------------
    // TEST 4: GET /api/uniques360/tasks/coordinator/current
    // -------------------------------------------------------------------------
    console.log('6. Testing GET /api/uniques360/tasks/coordinator/current...');
    const tasksRes = await fetch(`${baseUrl}/api/uniques360/tasks/coordinator/current`, {
      method: 'GET',
      headers: authHeaders,
    });
    const tasksData = await tasksRes.json();
    assert.strictEqual(tasksRes.status, 200, `getCoordinatorTasks returned ${tasksRes.status}`);
    assert(Array.isArray(tasksData), 'Expected tasks response to be an array');
    console.log(`   ✅ Coordinator tasks retrieved: ${tasksData.length} task(s) found.\n`);

    // -------------------------------------------------------------------------
    // TEST 5: GET /api/admin/member/counts
    // -------------------------------------------------------------------------
    console.log('7. Testing GET /api/admin/member/counts...');
    const memberCountsRes = await fetch(`${baseUrl}/api/admin/member/counts`, {
      method: 'GET',
      headers: authHeaders,
    });
    const memberCountsData = await memberCountsRes.json();
    assert.strictEqual(memberCountsRes.status, 200, `getAdminMemberCounts returned ${memberCountsRes.status}`);
    assert.strictEqual(memberCountsData.success, true, 'Expected success: true');
    assert(memberCountsData.data && typeof memberCountsData.data.all === 'number', 'Expected data.all to be a number');
    console.log(`   ✅ Member counts retrieved: Total members = ${memberCountsData.data.all}\n`);

    // -------------------------------------------------------------------------
    // TEST 6: GET /api/events/counts
    // -------------------------------------------------------------------------
    console.log('8. Testing GET /api/events/counts...');
    const eventCountsRes = await fetch(`${baseUrl}/api/events/counts`, {
      method: 'GET',
      headers: authHeaders,
    });
    const eventCountsData = await eventCountsRes.json();
    assert.strictEqual(eventCountsRes.status, 200, `getEventCount returned ${eventCountsRes.status}`);
    assert.strictEqual(eventCountsData.success, true, 'Expected success: true');
    assert(eventCountsData.data && typeof eventCountsData.data.totalCount === 'number', 'Expected data.totalCount to be a number');
    console.log(`   ✅ Event counts retrieved: Total events = ${eventCountsData.data.totalCount}\n`);

    console.log('====================================================');
    console.log('🎉 ALL 6 INTEGRATION TESTS PASSED (100%)');
    console.log('====================================================');
  } finally {
    server.close();
    await mongoose.connection.close();
    console.log('Server and database connection closed cleanly.');
  }
}

runTests().catch((err) => {
  console.error('❌ Test execution error:', err);
  process.exit(1);
});

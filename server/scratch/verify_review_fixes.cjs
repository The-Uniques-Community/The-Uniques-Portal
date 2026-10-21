const http = require('http');
const assert = require('assert');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  console.log('[Review Fixes Verification] Starting test...');
  const appModule = await import('../index.js');
  const app = appModule.default;
  const User = (await import('../models/user/userModel.js')).default;
  const Event = (await import('../models/member/eventModel.js')).default;
  const mongoose = (await import('mongoose')).default;

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const adminToken = jwt.sign(
    { id: '65e9d9b4b0a1d4001c8e1234', role: 'admin' },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1h' }
  );
  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`
  };

  try {
    // 1. Check batch name non-string and empty string -> 400
    console.log('\n1. Testing batch name validation (reject non-string/empty)...');
    const resBatchNum = await fetch(`${baseUrl}/api/batches`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ name: 12345 })
    });
    assert.strictEqual(resBatchNum.status, 400, 'Non-string name must return 400');

    const resBatchEmpty = await fetch(`${baseUrl}/api/batches`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ name: '   ' })
    });
    assert.strictEqual(resBatchEmpty.status, 400, 'Whitespace name must return 400');

    // 2. Check campus ambassador missing email -> 400
    console.log('\n2. Testing campus ambassador missing email -> 400...');
    const resAmbNoEmail = await fetch(`${baseUrl}/api/apply-campus-ambassador`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fullName: 'No Email User',
        phone: '9876543210',
        college: 'Test College',
        course: 'CSE',
        graduationYear: '2026',
        whyJoin: 'A'.repeat(55),
        heardFrom: 'invalid_source_here'
      })
    });
    assert.strictEqual(resAmbNoEmail.status, 400, 'Missing email must return 400');

    // 3. Check fine proofOfPayment object validation & https sanitization
    console.log('\n3. Testing fine proofOfPayment URL sanitization...');
    const testMemberId = new mongoose.Types.ObjectId();
    const fineId = new mongoose.Types.ObjectId();
    const testMember = new User({
      _id: testMemberId,
      fullName: 'Review Test Member',
      email: `review_${Date.now()}@example.com`,
      password: 'password123',
      admno: `2022BTCS${Math.floor(100 + Math.random() * 899)}`,
      role: 'member',
      batch: 'The Uniques 2.0',
      fines: [{ _id: fineId, amount: 20, reason: 'Test', status: 'pending' }]
    });
    await testMember.save();

    const resPatchUnsafe = await fetch(
      `${baseUrl}/api/admin/fine/members/${testMemberId.toString()}/fines/${fineId.toString()}`,
      {
        method: 'PATCH',
        headers: adminHeaders,
        body: JSON.stringify({
          status: 'paid',
          proofOfPayment: {
            _id: 'invalid-id-not-objectid',
            fileUrl: 'javascript:alert(1)',
            url: 'http://insecure.com',
            fileId: 9999,
            name: 1234
          }
        })
      }
    );
    assert.strictEqual(resPatchUnsafe.status, 200);
    const dataPatch = await resPatchUnsafe.json();
    const savedProof = dataPatch.data.fine.proofOfPayment;
    assert(mongoose.Types.ObjectId.isValid(savedProof._id), '_id must be valid ObjectId');
    assert.strictEqual(savedProof.fileUrl, '', 'Non-https fileUrl must be sanitized to empty string');
    assert.strictEqual(savedProof.url, '', 'Non-https url must be sanitized to empty string');
    assert.strictEqual(typeof savedProof.fileId, 'string', 'fileId must be string');
    assert.strictEqual(typeof savedProof.fileName, 'string', 'fileName must be string');

    await User.findByIdAndDelete(testMemberId);

    // 4. Check event member removal does not drop other teams
    console.log('\n4. Testing event member removal preserves team subdocuments...');
    const memberToRemove = new mongoose.Types.ObjectId();
    const memberToKeep = new mongoose.Types.ObjectId();
    const testEvent = new Event({
      eventName: 'Review Event Test',
      eventDescription: 'Testing team retention',
      eventType: 'Workshop',
      eventOrganizerBatch: 'The Uniques 1.0',
      eventMembers: [
        {
          contributionType: 'technical team',
          contributionTeam: [memberToRemove, memberToKeep]
        },
        {
          contributionType: 'branding team',
          contributionTeam: [memberToKeep]
        }
      ]
    });
    await testEvent.save();

    const resDel = await fetch(
      `${baseUrl}/api/events/${testEvent._id.toString()}/members/${memberToRemove.toString()}`,
      {
        method: 'DELETE',
        headers: adminHeaders
      }
    );
    assert.strictEqual(resDel.status, 200);
    const refreshedEvent = await Event.findById(testEvent._id);
    assert.strictEqual(refreshedEvent.eventMembers.length, 2, 'Must preserve both team subdocuments');
    assert.strictEqual(refreshedEvent.eventMembers[0].contributionTeam.length, 1);
    assert.strictEqual(
      refreshedEvent.eventMembers[0].contributionTeam[0].toString(),
      memberToKeep.toString()
    );

    await Event.findByIdAndDelete(testEvent._id);

    console.log('\n[Review Fixes Verification] ALL 4 REVIEW FIXES VERIFIED SUCCESSFULLY! ✅');
    process.exit(0);
  } finally {
    server.close();
  }
}

run().catch(err => {
  console.error('\n❌ [Review Fixes Verification Failed]:', err);
  process.exit(1);
});

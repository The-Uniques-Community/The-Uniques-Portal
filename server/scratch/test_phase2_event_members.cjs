const http = require('http');
const assert = require('assert');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  console.log('[Phase 2 Test] Booting Express App & Testing Event Member REST Route...');
  const appModule = await import('../index.js');
  const app = appModule.default;
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
  const authHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`
  };

  try {
    const testMemberId = new mongoose.Types.ObjectId();
    const testEvent = new Event({
      eventName: 'TDD Event Member Test',
      eventDescription: 'Testing DELETE /api/events/:id/members/:memberId',
      eventType: 'Workshop',
      eventOrganizerBatch: 'The Uniques 1.0',
      eventMembers: [
        {
          contributionType: 'technical team',
          contributionTeam: [testMemberId]
        }
      ]
    });
    await testEvent.save();
    const eventId = testEvent._id.toString();
    console.log(`Created test event ${eventId} with member ${testMemberId.toString()}`);

    // Call DELETE /api/events/:id/members/:memberId
    console.log(`\nTesting DELETE /api/events/${eventId}/members/${testMemberId.toString()} ...`);
    const resDel = await fetch(`${baseUrl}/api/events/${eventId}/members/${testMemberId.toString()}`, {
      method: 'DELETE',
      headers: authHeaders
    });

    assert.strictEqual(resDel.status, 200, `Expected 200, got ${resDel.status}`);
    const dataDel = await resDel.json();
    assert(dataDel.success === true, 'Expected dataDel.success to be true');

    // Verify member removed in DB
    const refreshed = await Event.findById(eventId);
    const hasMember = refreshed.eventMembers.some(em => 
      em.contributionTeam && em.contributionTeam.some(m => m.toString() === testMemberId.toString())
    );
    assert.strictEqual(hasMember, false, 'Member should no longer exist in event team');

    // Clean up
    await Event.findByIdAndDelete(eventId);
    console.log('\n[Phase 2 Test] EVENT MEMBER REMOVAL REST TEST PASSED! ✅');
    process.exit(0);
  } finally {
    server.close();
  }
}

run().catch(err => {
  console.error('\n❌ [Phase 2 Test Failed]:', err);
  process.exit(1);
});

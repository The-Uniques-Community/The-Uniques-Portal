const http = require('http');
const assert = require('assert');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  console.log('[Phase 1 Test] Booting Express App & Connecting DB...');
  const appModule = await import('../index.js');
  const app = appModule.default;

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;
  console.log(`Test server running on ${baseUrl}`);

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
    // 1. GET /api/guest (REST route)
    console.log('\nTesting GET /api/guest ...');
    const resGet = await fetch(`${baseUrl}/api/guest`);
    assert.strictEqual(resGet.status, 200, `Expected 200, got ${resGet.status}`);
    const dataGet = await resGet.json();
    assert(dataGet.success === true, 'Expected dataGet.success to be true');

    // 2. POST /api/guest (REST route)
    console.log('\nTesting POST /api/guest ...');
    const newGuestPayload = {
      guestName: 'TDD Test Speaker',
      guestEmail: 'tdd_speaker@example.com',
      guestDesignation: 'Chief Architect',
      guestCompany: 'TDD Tech'
    };
    const resPost = await fetch(`${baseUrl}/api/guest`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(newGuestPayload)
    });
    assert.strictEqual(resPost.status, 201, `Expected 201, got ${resPost.status}`);
    const dataPost = await resPost.json();
    assert(dataPost.success === true, 'Expected dataPost.success to be true');
    const createdId = dataPost.guest._id;
    assert(createdId, 'Expected created guest to have _id');

    // 3. GET /api/guest/:id (REST route)
    console.log(`\nTesting GET /api/guest/${createdId} ...`);
    const resGetOne = await fetch(`${baseUrl}/api/guest/${createdId}`);
    assert.strictEqual(resGetOne.status, 200, `Expected 200, got ${resGetOne.status}`);
    const dataGetOne = await resGetOne.json();
    assert.strictEqual(dataGetOne.guest.guestName, 'TDD Test Speaker');

    // 4. PUT /api/guest/:id (Update route)
    console.log(`\nTesting PUT /api/guest/${createdId} ...`);
    const resPut = await fetch(`${baseUrl}/api/guest/${createdId}`, {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify({ guestDesignation: 'VP Engineering' })
    });
    assert.strictEqual(resPut.status, 200, `Expected 200, got ${resPut.status}`);
    const dataPut = await resPut.json();
    assert(dataPut.success === true, 'Expected dataPut.success to be true');
    assert.strictEqual(dataPut.guest.guestDesignation, 'VP Engineering');

    // 5. DELETE /api/guest/:id (Delete route)
    console.log(`\nTesting DELETE /api/guest/${createdId} ...`);
    const resDel = await fetch(`${baseUrl}/api/guest/${createdId}`, {
      method: 'DELETE',
      headers: authHeaders
    });
    assert.strictEqual(resDel.status, 200, `Expected 200, got ${resDel.status}`);
    const dataDel = await resDel.json();
    assert(dataDel.success === true, 'Expected dataDel.success to be true');

    // Verify deleted
    const resVerify = await fetch(`${baseUrl}/api/guest/${createdId}`);
    assert.strictEqual(resVerify.status, 404, 'Expected 404 after deletion');

    console.log('\n[Phase 1 Test] ALL GUEST CRUD TESTS PASSED SUCCESSFULLY! ✅');
  } finally {
    server.close();
  }
}

run().catch(err => {
  console.error('\n❌ [Phase 1 Test Failed]:', err);
  process.exit(1);
});

const http = require('http');
const assert = require('assert');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  console.log('[Review Fixes Test] Booting Express App & Connecting DB...');
  const appModule = await import('../index.js');
  const app = appModule.default;
  const Guest = (await import('../models/member/guestModel.js')).default;
  const mongoose = (await import('mongoose')).default;

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
  const memberToken = jwt.sign(
    { id: '65e9d9b4b0a1d4001c8e5678', role: 'member' },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1h' }
  );

  const adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`
  };
  const memberHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${memberToken}`
  };

  let testGuestId;

  try {
    // ---------------------------------------------------------
    // Issue 4: GET /api/guest/get-all-guests route ordering
    // ---------------------------------------------------------
    console.log('\n--- Issue 4: Testing GET /api/guest/get-all-guests ---');
    const resGetAll = await fetch(`${baseUrl}/api/guest/get-all-guests`);
    assert.strictEqual(resGetAll.status, 200, `Expected 200 for /get-all-guests, got ${resGetAll.status}`);
    const dataGetAll = await resGetAll.json();
    assert.strictEqual(dataGetAll.success, true, 'Expected dataGetAll.success to be true');
    assert(Array.isArray(dataGetAll.guests), 'Expected dataGetAll.guests to be an array');
    console.log('✅ GET /api/guest/get-all-guests matched getAllGuests controller and returned 200');

    // ---------------------------------------------------------
    // Issue 3: Auth middleware on POST /api/guest/bulkUpload
    // ---------------------------------------------------------
    console.log('\n--- Issue 3: Testing auth middleware on POST /api/guest/bulkUpload ---');
    // Without token -> 401
    const resBulkNoAuth = await fetch(`${baseUrl}/api/guest/bulkUpload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    assert.strictEqual(resBulkNoAuth.status, 401, `Expected 401 without auth, got ${resBulkNoAuth.status}`);
    console.log('✅ POST /bulkUpload rejected unauthenticated request with 401');

    // With member token (not admin or coordinator) -> 403
    const resBulkMemberAuth = await fetch(`${baseUrl}/api/guest/bulkUpload`, {
      method: 'POST',
      headers: memberHeaders
    });
    assert.strictEqual(resBulkMemberAuth.status, 403, `Expected 403 with member role, got ${resBulkMemberAuth.status}`);
    console.log('✅ POST /bulkUpload rejected unauthorized role with 403');

    // ---------------------------------------------------------
    // Create a test guest for update tests
    // ---------------------------------------------------------
    const createRes = await fetch(`${baseUrl}/api/guest`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        guestName: 'Validation Test Guest',
        guestEmail: 'test_validation@example.com',
        guestCompany: 'Test Corp'
      })
    });
    assert.strictEqual(createRes.status, 201);
    const createdData = await createRes.json();
    testGuestId = createdData.guest._id;
    console.log(`Created test guest with ID: ${testGuestId}`);

    // ---------------------------------------------------------
    // Issue 1: updateGuest string and events validation
    // ---------------------------------------------------------
    console.log('\n--- Issue 1: Testing updateGuest field validations ---');

    // 1a. String fields must be strings
    console.log('Testing non-string guestName rejection...');
    const resNumName = await fetch(`${baseUrl}/api/guest/${testGuestId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ guestName: 12345 })
    });
    assert.strictEqual(resNumName.status, 400, 'Non-string guestName must return 400');
    const dataNumName = await resNumName.json();
    assert.strictEqual(dataNumName.success, false);

    console.log('Testing non-string guestEmail rejection...');
    const resNumEmail = await fetch(`${baseUrl}/api/guest/${testGuestId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ guestEmail: true })
    });
    assert.strictEqual(resNumEmail.status, 400, 'Non-string guestEmail must return 400');

    // 1b. Empty / whitespace guestName
    console.log('Testing empty whitespace guestName rejection...');
    const resEmptyName = await fetch(`${baseUrl}/api/guest/${testGuestId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ guestName: '   ' })
    });
    assert.strictEqual(resEmptyName.status, 400, 'Whitespace guestName must return 400');

    // 1c. Events array validation: non-array
    console.log('Testing non-array events rejection...');
    const resNonArrayEvents = await fetch(`${baseUrl}/api/guest/${testGuestId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ events: 'not-an-array' })
    });
    assert.strictEqual(resNonArrayEvents.status, 400, 'Non-array events must return 400');

    // 1d. Events array validation: invalid entry
    console.log('Testing invalid event entry rejection (null/primitive)...');
    const resNullEntry = await fetch(`${baseUrl}/api/guest/${testGuestId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ events: [null] })
    });
    assert.strictEqual(resNullEntry.status, 400, 'Null entry in events must return 400');

    // 1e. Events array validation: invalid event ID
    console.log('Testing invalid event ID in events entry rejection...');
    const resInvalidEventId = await fetch(`${baseUrl}/api/guest/${testGuestId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ events: [{ event: 'invalid-id' }] })
    });
    assert.strictEqual(resInvalidEventId.status, 400, 'Invalid event ID must return 400');

    // 1f. Empty update payload / no allowed fields
    console.log('Testing empty payload rejection (no allowed keys)...');
    const resEmptyPayload = await fetch(`${baseUrl}/api/guest/${testGuestId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({})
    });
    assert.strictEqual(resEmptyPayload.status, 400, 'Empty update body must return 400');
    const dataEmptyPayload = await resEmptyPayload.json();
    assert.strictEqual(dataEmptyPayload.success, false);
    assert(dataEmptyPayload.message, 'Must return error message');

    const resUnallowedPayload = await fetch(`${baseUrl}/api/guest/${testGuestId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ unknownField: 'ignore me' })
    });
    assert.strictEqual(resUnallowedPayload.status, 400, 'Payload with no allowed fields must return 400');

    console.log('✅ Issue 1: All updateGuest pre-validations and empty-payload checks passed');

    // ---------------------------------------------------------
    // Issue 2: Catch block ValidationError and CastError handling
    // ---------------------------------------------------------
    console.log('\n--- Issue 2: Testing catch block ValidationError & CastError ---');

    // 2a. ValidationError from Mongoose runValidators (e.g. invalid enum value on guestTag)
    const validEventId = new mongoose.Types.ObjectId().toString();
    console.log('Testing Mongoose ValidationError handling (invalid enum guestTag)...');
    const resValidationError = await fetch(`${baseUrl}/api/guest/${testGuestId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        events: [{ event: validEventId, guestTag: 'non_existent_enum_role' }]
      })
    });
    assert.strictEqual(resValidationError.status, 400, 'Mongoose ValidationError must return 400');
    const dataValError = await resValidationError.json();
    assert.strictEqual(dataValError.success, false, 'Expected success: false');
    assert.strictEqual(dataValError.message, 'Validation failed', 'Expected "Validation failed" message');
    assert(typeof dataValError.error === 'string' && dataValError.error.length > 0, 'Expected validation error message');
    console.log('✅ ValidationError returned 400 with "Validation failed" and error message');

    // 2b. CastError handling preserved for invalid guest ObjectId
    console.log('Testing CastError handling preserved for invalid guest ID in URL...');
    const resCastError = await fetch(`${baseUrl}/api/guest/invalid-object-id`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({ guestName: 'Valid New Name' })
    });
    assert.strictEqual(resCastError.status, 400, 'Invalid guest ID must return 400');
    const dataCastError = await resCastError.json();
    assert.strictEqual(dataCastError.success, false);
    assert.strictEqual(dataCastError.message, 'Invalid guest ID format');
    console.log('✅ CastError returned 400 with "Invalid guest ID format"');

    // ---------------------------------------------------------
    // Valid Update Flow Preserved
    // ---------------------------------------------------------
    console.log('\n--- Testing valid update flow preservation ---');
    const resValidUpdate = await fetch(`${baseUrl}/api/guest/${testGuestId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        guestDesignation: 'Principal Engineer',
        events: [{ event: validEventId, guestTag: 'keynote' }] // Note: "keynote" is not in enum, wait: enum has:
        // ["speaker", "moderator", "panelist", "judge", "mentor", "organizer", "sponsor", "partner", "chief guest", "others"]
      })
    });
    // Let's test with a valid enum: "speaker"
    const resValidUpdate2 = await fetch(`${baseUrl}/api/guest/${testGuestId}`, {
      method: 'PUT',
      headers: adminHeaders,
      body: JSON.stringify({
        guestDesignation: 'Principal Engineer',
        events: [{ event: validEventId, guestTag: 'speaker' }]
      })
    });
    assert.strictEqual(resValidUpdate2.status, 200, `Expected 200 for valid update, got ${resValidUpdate2.status}`);
    const dataValidUpdate2 = await resValidUpdate2.json();
    assert.strictEqual(dataValidUpdate2.success, true);
    assert.strictEqual(dataValidUpdate2.guest.guestDesignation, 'Principal Engineer');
    assert.strictEqual(dataValidUpdate2.guest.events.length, 1);
    assert.strictEqual(dataValidUpdate2.guest.events[0].guestTag, 'speaker');
    console.log('✅ Valid update preserved and returned 200 with updated guest document');

    console.log('\n🎉 ALL 4 REVIEW ISSUES VERIFIED SUCCESSFULLY! 🎉');
    process.exit(0);
  } finally {
    if (testGuestId) {
      await Guest.findByIdAndDelete(testGuestId);
    }
    server.close();
  }
}

run().catch(err => {
  console.error('\n❌ [Test Failed]:', err);
  process.exit(1);
});

const http = require('http');
const assert = require('assert');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  console.log('[Phase 4 Test] Booting Express App & Testing Batches + Ambassador REST Routes...');
  const appModule = await import('../index.js');
  const app = appModule.default;
  const { BatchName } = await import('../models/community/batchModel.js');

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

  let createdBatchName = null;

  try {
    // 1. Test GET /api/batches (REST alias)
    console.log('\nTesting GET /api/batches ...');
    const resGetBatches = await fetch(`${baseUrl}/api/batches`);
    assert.strictEqual(resGetBatches.status, 200, `Expected 200, got ${resGetBatches.status}`);
    const dataGetBatches = await resGetBatches.json();
    assert(dataGetBatches.success === true, 'Expected dataGetBatches.success === true');

    // 2. Test POST /api/batches (REST alias)
    console.log('\nTesting POST /api/batches ...');
    const batchPayload = {
      batchName: `TDD Batch ${Date.now()}`,
      batchYear: '2026',
      description: 'Created during TDD phase 4'
    };
    const resPostBatch = await fetch(`${baseUrl}/api/batches`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify(batchPayload)
    });
    assert(resPostBatch.status === 200 || resPostBatch.status === 201, `Expected 200/201, got ${resPostBatch.status}`);
    const dataPostBatch = await resPostBatch.json();
    assert(dataPostBatch.success === true, 'Expected dataPostBatch.success === true');
    createdBatchName = dataPostBatch.data;

    // 3. Test POST /api/apply-campus-ambassador
    console.log('\nTesting POST /api/apply-campus-ambassador ...');
    const ambassadorPayload = {
      fullName: 'TDD Ambassador Applicant',
      email: `ambassador_${Date.now()}@example.com`,
      phoneNumber: '9876543210',
      collegeName: 'TDD Tech Institute',
      degree: 'B.Tech CSE',
      yearOfStudy: '2026',
      whyJoin: 'I am deeply passionate about student tech communities, leadership, organizing workshops, and mentoring peers in engineering.',
      leadershipExperience: 'Led coding club',
      heardFrom: 'Social Media'
    };
    const resAmbassador = await fetch(`${baseUrl}/api/apply-campus-ambassador`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ambassadorPayload)
    });
    assert.strictEqual(resAmbassador.status, 201, `Expected 201, got ${resAmbassador.status}`);
    const dataAmbassador = await resAmbassador.json();
    assert(dataAmbassador.success === true, 'Expected dataAmbassador.success === true');

    console.log('\n[Phase 4 Test] ALL BATCHES & AMBASSADOR REST TESTS PASSED! ✅');
  } finally {
    if (createdBatchName) {
      try {
        const batchDoc = await BatchName.findOne({ name: createdBatchName });
        if (batchDoc) {
          await BatchName.findByIdAndDelete(batchDoc._id);
        }
      } catch (err) {
        console.error('Error cleaning up test batch:', err);
      }
    }
    server.close();
  }
}

run().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('\n❌ [Phase 4 Test Failed]:', err);
  process.exit(1);
});

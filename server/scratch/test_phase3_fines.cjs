const http = require('http');
const assert = require('assert');
const path = require('path');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function run() {
  if (process.env.NODE_ENV === 'production' || (process.env.MONGO_URI && process.env.MONGO_URI.toLowerCase().includes('production'))) {
    throw new Error('Refusing to execute test against production database');
  }

  console.log('[Phase 3 Test] Booting Express App & Testing Fine Receipt + Route...');
  const appModule = await import('../index.js');
  const app = appModule.default;
  const User = (await import('../models/user/userModel.js')).default;
  const mongoose = (await import('mongoose')).default;

  const server = http.createServer(app);
  await new Promise(resolve => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  const memberId = new mongoose.Types.ObjectId();
  const fineId = new mongoose.Types.ObjectId();

  const adminToken = jwt.sign(
    { id: '65e9d9b4b0a1d4001c8e1234', role: 'admin' },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1h' }
  );
  const memberToken = jwt.sign(
    { id: memberId.toString(), role: 'member' },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '1h' }
  );

  try {
    // 1. Create a test member with a fine
    const randomAdm = `2022BTCS${Math.floor(100 + Math.random() * 899)}`;
    const testMember = new User({
      _id: memberId,
      fullName: 'TDD Fine Member',
      email: `tdd_fine_${Date.now()}@example.com`,
      password: 'password123',
      admno: randomAdm,
      role: 'member',
      batch: 'The Uniques 3.0',
      fines: [
        {
          _id: fineId,
          amount: 50,
          reason: 'Late submission test',
          status: 'pending'
        }
      ]
    });
    await testMember.save();
    console.log(`Created test member ${memberId.toString()} with fine ${fineId.toString()}`);

    // 2. Test updating fine with proofOfPayment object
    console.log('\nTesting PATCH fine status with proofOfPayment object ...');
    const proofPayload = {
      status: 'paid',
      proofOfPayment: {
        fileId: '1abcDriveFileIdTest',
        fileUrl: 'https://drive.google.com/file/d/1abcDriveFileIdTest/view',
        url: 'https://drive.google.com/file/d/1abcDriveFileIdTest/view',
        fileName: 'receipt_test.pdf'
      }
    };

    const resPatch = await fetch(
      `${baseUrl}/api/admin/fine/members/${memberId.toString()}/fines/${fineId.toString()}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`
        },
        body: JSON.stringify(proofPayload)
      }
    );

    assert.strictEqual(resPatch.status, 200, `Expected 200 from fine update, got ${resPatch.status}`);
    const dataPatch = await resPatch.json();
    assert(dataPatch.success === true, 'Expected patch success to be true');
    assert(dataPatch.data.fine.proofOfPayment, 'proofOfPayment must be present');
    assert.strictEqual(
      dataPatch.data.fine.proofOfPayment.fileUrl,
      'https://drive.google.com/file/d/1abcDriveFileIdTest/view',
      'fileUrl must be preserved in fine proofOfPayment'
    );

    // 3. Test GET /api/fine (member profile fines route)
    console.log('\nTesting GET /api/fine with member auth token ...');
    const resGetFines = await fetch(`${baseUrl}/api/fine`, {
      headers: {
        Authorization: `Bearer ${memberToken}`
      }
    });

    assert.strictEqual(resGetFines.status, 200, `Expected 200 from GET /api/fine, got ${resGetFines.status}`);
    const dataFines = await resGetFines.json();
    assert(Array.isArray(dataFines.data?.fines), 'Expected fines array in data.fines');
    assert.strictEqual(dataFines.data.fines.length, 1, 'Expected 1 fine in history');

    console.log('\n[Phase 3 Test] ALL FINE RECEIPT & ROUTE TESTS PASSED! ✅');
  } finally {
    if (memberId) {
      await User.findByIdAndDelete(memberId).catch(err => {
        console.error('Error cleaning up test member:', err);
      });
    }
    server.close();
  }
}

run().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('\n❌ [Phase 3 Test Failed]:', err);
  process.exit(1);
});

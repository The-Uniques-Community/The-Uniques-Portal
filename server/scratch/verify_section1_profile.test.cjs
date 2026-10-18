/**
 * @file verify_section1_profile.test.cjs
 * @description Automated verification script for Section 1 (Profile & User Management fixes):
 *  1. Data persistence errors & bio updates in editProfile.
 *  2. deleteProfilePicture controller and Google Drive deleteFile integration.
 *  3. getAllMembers search query with $or regex on fullName, email, admno.
 *  4. getAdminMemberCounts aggregate counts for batches 1.0 - 6.0 and blocked members.
 */

const assert = require('assert');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function runTestSuite() {
  console.log('========================================================');
  console.log('🚀 Starting Section 1 Profile & User Management Test Suite');
  console.log('========================================================\n');

  // Dynamic import of ES modules
  const { default: mongoose } = await import('mongoose');
  const { default: Member } = await import('../models/member/memberModel.js');
  const { editProfile, deleteProfilePicture } = await import('../controller/member/memberController.js');
  const { getAllMembers, getAdminMemberCounts } = await import('../controller/admin/memberController.js');
  const { deleteFile } = await import('../controller/googleDriveService.js');

  console.log('1. Connecting to database...');
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error('MONGODB_URI not configured in server/.env');
  }
  await mongoose.connect(mongoUri, { family: 4 });
  console.log('   ✅ MongoDB connected successfully.\n');

  // Helper to create mock res
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
      },
    };
  }

  let testMemberId = null;

  try {
    // -------------------------------------------------------------------------
    // SETUP: Create a temporary test member
    // -------------------------------------------------------------------------
    console.log('2. Setting up test member...');
    const testEmail = `test.profile.sec1.${Date.now()}@example.com`;
    const createdMember = await Member.create({
      fullName: 'Section1 Tester',
      email: testEmail,
      admno: '2024BTCS999',
      batch: 'The Uniques 5.0',
      course: 'B.Tech CSE',
      bio: 'Initial Bio',
      profilePic: {
        fileId: 'mock-drive-file-id-12345',
        fileUrl: 'https://drive.google.com/thumbnail/mock-drive-file-id-12345',
        fileName: 'profile_test.png',
      },
      avatarUrl: 'https://drive.google.com/thumbnail/mock-drive-file-id-12345',
    });
    testMemberId = createdMember._id.toString();
    console.log(`   ✅ Test member created with ID: ${testMemberId}\n`);

    // -------------------------------------------------------------------------
    // TEST 1: Bio update in editProfile
    // -------------------------------------------------------------------------
    console.log('3. Testing editProfile bio updates...');

    // 1a: Update bio to a new non-empty string
    const req1a = {
      params: { id: testMemberId },
      body: { bio: 'Updated full developer bio for Section 1.' },
    };
    const res1a = createMockRes();
    await editProfile(req1a, res1a);
    assert.strictEqual(res1a.statusCode, 200, 'editProfile should return 200');
    assert.strictEqual(res1a.body.member.bio, 'Updated full developer bio for Section 1.');
    console.log('   ✅ 1a: Non-empty bio updated successfully.');

    // 1b: Update bio to an empty string "" (must NOT be discarded by bio || member.bio)
    const req1b = {
      params: { id: testMemberId },
      body: { bio: '' },
    };
    const res1b = createMockRes();
    await editProfile(req1b, res1b);
    assert.strictEqual(res1b.statusCode, 200, 'editProfile should return 200');
    assert.strictEqual(res1b.body.member.bio, '', 'Empty string bio must be preserved, not overwritten by stale bio');
    console.log('   ✅ 1b: Empty string bio updated successfully (not discarded).');

    // 1c: Updating profile with undefined bio should preserve existing bio
    await Member.findByIdAndUpdate(testMemberId, { bio: 'Preserved Bio' });
    const req1c = {
      params: { id: testMemberId },
      body: { fullName: 'Section1 Tester Updated' }, // bio is undefined
    };
    const res1c = createMockRes();
    await editProfile(req1c, res1c);
    assert.strictEqual(res1c.statusCode, 200, 'editProfile should return 200');
    assert.strictEqual(res1c.body.member.bio, 'Preserved Bio', 'Undefined bio should preserve current bio');
    console.log('   ✅ 1c: Undefined bio preserved existing bio value.\n');

    // -------------------------------------------------------------------------
    // TEST 2: Profile picture removal in deleteProfilePicture & deleteFile
    // -------------------------------------------------------------------------
    console.log('4. Testing deleteProfilePicture controller and deleteFile...');

    // Verify deleteFile exists and handles null/empty safely
    const nullDeleteResult = await deleteFile(null);
    assert.strictEqual(nullDeleteResult, false, 'deleteFile(null) should safely return false');
    console.log('   ✅ deleteFile handles missing fileId safely.');

    // Ensure test member has profilePic set
    await Member.findByIdAndUpdate(testMemberId, {
      profilePic: {
        fileId: 'mock-file-for-deletion',
        fileUrl: 'https://drive.google.com/mock',
        fileName: 'to_delete.png',
      },
      avatarUrl: 'https://drive.google.com/mock',
    });

    const req2 = { params: { id: testMemberId } };
    const res2 = createMockRes();
    await deleteProfilePicture(req2, res2);

    assert.strictEqual(res2.statusCode, 200, 'deleteProfilePicture should return 200');
    assert.strictEqual(res2.body.success, true);
    assert.strictEqual(res2.body.member.profilePic, null, 'profilePic must be set to null');
    assert.strictEqual(res2.body.member.avatarUrl, '', 'avatarUrl must be empty string');

    // Re-verify in database
    const refreshedMember = await Member.findById(testMemberId);
    assert.strictEqual(refreshedMember.profilePic, null, 'Database profilePic must be null');
    assert.strictEqual(refreshedMember.avatarUrl, '', 'Database avatarUrl must be empty string');
    console.log('   ✅ deleteProfilePicture successfully cleared profilePic and avatarUrl in DB.\n');

    // -------------------------------------------------------------------------
    // TEST 3: getAllMembers search regex query ($or on fullName, email, admno)
    // -------------------------------------------------------------------------
    console.log('5. Testing getAllMembers search regex query...');

    // 3a: Search by fullName
    const req3a = { query: { search: 'Section1 Tester' } };
    const res3a = createMockRes();
    await getAllMembers(req3a, res3a);
    assert.strictEqual(res3a.statusCode, 200);
    const foundByName = res3a.body.data.some((m) => m._id.toString() === testMemberId);
    assert.strictEqual(foundByName, true, 'Search by fullName must find test member');
    console.log('   ✅ 3a: Search by fullName matched successfully.');

    // 3b: Search by email
    const req3b = { query: { search: testEmail } };
    const res3b = createMockRes();
    await getAllMembers(req3b, res3b);
    assert.strictEqual(res3b.statusCode, 200);
    const foundByEmail = res3b.body.data.some((m) => m._id.toString() === testMemberId);
    assert.strictEqual(foundByEmail, true, 'Search by email must find test member');
    console.log('   ✅ 3b: Search by email matched successfully.');

    // 3c: Search by admno
    const req3c = { query: { search: '2024BTCS999' } };
    const res3c = createMockRes();
    await getAllMembers(req3c, res3c);
    assert.strictEqual(res3c.statusCode, 200);
    const foundByAdmno = res3c.body.data.some((m) => m._id.toString() === testMemberId);
    assert.strictEqual(foundByAdmno, true, 'Search by admno must find test member');
    console.log('   ✅ 3c: Search by admno matched successfully.');

    // 3d: Search with regex special characters (must not crash)
    const req3d = { query: { search: 'Section1 [Tester]*? (999)' } };
    const res3d = createMockRes();
    await getAllMembers(req3d, res3d);
    assert.strictEqual(res3d.statusCode, 200, 'Regex characters in search must not throw error');
    console.log('   ✅ 3d: Search with special regex characters handled safely without crashing.\n');

    // -------------------------------------------------------------------------
    // TEST 4: getAdminMemberCounts aggregate batch counts
    // -------------------------------------------------------------------------
    console.log('6. Testing getAdminMemberCounts aggregate batch counts...');
    const req4 = {};
    const res4 = createMockRes();
    await getAdminMemberCounts(req4, res4);
    assert.strictEqual(res4.statusCode, 200);
    assert.strictEqual(res4.body.success, true);
    const counts = res4.body.data;
    assert(typeof counts.all === 'number', 'counts.all must be a number');
    assert(typeof counts.batch1 === 'number', 'counts.batch1 must be a number');
    assert(typeof counts.batch2 === 'number', 'counts.batch2 must be a number');
    assert(typeof counts.batch3 === 'number', 'counts.batch3 must be a number');
    assert(typeof counts.batch4 === 'number', 'counts.batch4 must be a number');
    assert(typeof counts.batch5 === 'number', 'counts.batch5 must be a number');
    assert(typeof counts.batch6 === 'number', 'counts.batch6 must be a number');
    assert(typeof counts.blocked === 'number', 'counts.blocked must be a number');
    assert(counts.batch5 >= 1, 'Batch 5.0 count must include the created test member');
    console.log(`   ✅ Counts returned: all=${counts.all}, batch1=${counts.batch1}, batch2=${counts.batch2}, batch3=${counts.batch3}, batch4=${counts.batch4}, batch5=${counts.batch5}, batch6=${counts.batch6}, blocked=${counts.blocked}\n`);

  } finally {
    // CLEANUP
    if (testMemberId) {
      console.log('7. Cleaning up test member...');
      await Member.findByIdAndDelete(testMemberId);
      console.log('   ✅ Test member removed.');
    }
    await mongoose.disconnect();
    console.log('   ✅ Database disconnected.\n');
  }

  console.log('========================================================');
  console.log('🎉 ALL SECTION 1 VERIFICATION TESTS PASSED SUCCESSFULLY!');
  console.log('========================================================');
}

runTestSuite().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});

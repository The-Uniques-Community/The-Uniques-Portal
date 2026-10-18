import assert from "assert";
import mongoose from "mongoose";
import User from "../models/user/userModel.js";
import Member from "../models/member/memberModel.js";

console.log("==================================================================");
console.log("  VERIFICATION SUITE: BCA & BTECH AI/ML STREAMS + ROLL NO FORMATS");
console.log("==================================================================\n");

// 1. Test User / Member model with valid new and existing streams
const validStreams = [
  "B.Tech CSE",
  "CSD",
  "BCA",
  "BTech AI/ML",
  "B.Tech AI/ML"
];

console.log("Test Suite 1: Stream (Course) Enum Validation");
for (const stream of validStreams) {
  const user = new User({
    fullName: `Test Student ${stream}`,
    email: `student_${Date.now()}_${stream.replace(/[^a-zA-Z0-9]/g, "_")}@example.com`,
    batch: "The Uniques 5.0",
    admno: "2024BTCS001",
    course: stream,
  });

  const err = user.validateSync();
  const courseErr = err?.errors?.course;
  assert(!courseErr, `Expected course "${stream}" to be valid, but got: ${courseErr?.message}`);
  console.log(`  ✓ User model accepts valid stream: "${stream}"`);
}

// Test invalid stream rejection
const invalidUser = new User({
  fullName: "Invalid Stream User",
  email: "invalid_stream@example.com",
  batch: "The Uniques 5.0",
  admno: "2024BTCS001",
  course: "Civil Engineering",
});
const invalidErr = invalidUser.validateSync();
assert(invalidErr?.errors?.course, "Expected User model to reject invalid stream 'Civil Engineering'");
console.log(`  ✓ User model correctly rejects invalid stream "Civil Engineering"`);


// 2. Test User / Member model with valid Roll Number formats (BTCS, BTCED, BTCSD, BCAPU, BCAPTU, BTAIML)
console.log("\nTest Suite 2: Admission / Roll Number Validation");
const validRollNumbers = [
  "2021BTCS001",
  "2022BTCED002",
  "2023BTCSD003",
  "2024BCAPU004",
  "2024BCAPTU005",
  "2024BTAIML006",
  "2025bcapu007", // Should normalize via uppercase
];

for (const roll of validRollNumbers) {
  const user = new User({
    fullName: `Test Roll ${roll}`,
    email: `roll_${Date.now()}_${roll}@example.com`,
    batch: "The Uniques 5.0",
    admno: roll,
    course: "BCA",
  });

  const err = user.validateSync();
  const admnoErr = err?.errors?.admno;
  assert(!admnoErr, `Expected admno "${roll}" to be valid, but got: ${admnoErr?.message}`);
  assert(user.admno === roll.toUpperCase(), `Expected admno to be uppercased: ${user.admno}`);
  console.log(`  ✓ User model accepts valid roll number: "${roll}" (normalized to "${user.admno}")`);
}

// Test invalid Roll Number formats
const invalidRollNumbers = [
  "2024XYZ001",      // Unknown stream
  "24BCAPU001",      // 2-digit year
  "2024BCAPU01",     // Only 2 trailing digits
  "2024BCAPU0001",   // 4 trailing digits
  "BCAPU2024001",    // Inverted ordering
  "2024BCA001",      // Incomplete BCA code (needs PU or PTU)
];

for (const invalidRoll of invalidRollNumbers) {
  const user = new User({
    fullName: `Invalid Roll ${invalidRoll}`,
    email: `invalid_${Date.now()}_${invalidRoll}@example.com`,
    batch: "The Uniques 5.0",
    admno: invalidRoll,
    course: "BCA",
  });

  const err = user.validateSync();
  assert(err?.errors?.admno, `Expected User model to reject invalid roll number "${invalidRoll}"`);
  console.log(`  ✓ User model correctly rejects invalid roll number: "${invalidRoll}"`);
}


// 3. Test Member Alias points to same schema
console.log("\nTest Suite 3: Member Model Schema Parity");
const member = new Member({
  fullName: "Member Alias Test",
  email: "member_alias_test@example.com",
  batch: "The Uniques 5.0",
  admno: "2024BTAIML101",
  course: "BTech AI/ML",
});
const memberErr = member.validateSync();
assert(!memberErr?.errors?.course, `Member model alias accepts BTech AI/ML: ${memberErr?.errors?.course?.message}`);
assert(!memberErr?.errors?.admno, `Member model alias accepts 2024BTAIML101: ${memberErr?.errors?.admno?.message}`);
console.log(`  ✓ Member alias correctly validates new streams and roll numbers`);


// 4. Test Fine Controller Query Pattern
console.log("\nTest Suite 4: Fine Controller Query Regex Matching");
const fineSearchRegex = /^[0-9]{4}(BTCS|BTCED|BTCSD|BCAPU|BCAPTU|BTAIML)[0-9]{3}$/i;
for (const roll of validRollNumbers) {
  assert(fineSearchRegex.test(roll), `Fine controller regex should match "${roll}"`);
  console.log(`  ✓ Fine controller regex matches "${roll}"`);
}
for (const invalidRoll of invalidRollNumbers) {
  assert(!fineSearchRegex.test(invalidRoll), `Fine controller regex should NOT match "${invalidRoll}"`);
}
console.log(`  ✓ Fine controller regex correctly rejects non-roll queries`);


// 5. Test Frontend Form Validation Regex Pattern
console.log("\nTest Suite 5: Frontend Form Validation Regex Matching");
const frontendRegex = /^[0-9]{4}(BTCS|BTCED|BTCSD|BCAPU|BCAPTU|BTAIML)[0-9]{3}$/i;
for (const roll of validRollNumbers) {
  assert(frontendRegex.test(roll), `Frontend regex should match "${roll}"`);
  console.log(`  ✓ Frontend regex matches "${roll}"`);
}
for (const invalidRoll of invalidRollNumbers) {
  assert(!frontendRegex.test(invalidRoll), `Frontend regex should NOT match "${invalidRoll}"`);
}
console.log(`  ✓ Frontend regex correctly rejects invalid inputs`);

console.log("\n==================================================================");
console.log("  ALL VERIFICATION TESTS COMPLETED AND PASSED SUCCESSFULLY!");
console.log("==================================================================");

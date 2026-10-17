import Member from "../models/member/memberModel.js";
import Event from "../models/member/eventModel.js";
import assert from "assert";

console.log("==================================================");
console.log("  TESTING MONGOOSE BATCH ENUM VALIDATION (OFFLINE)");
console.log("==================================================");

// 1. Test Member model with valid batches
const validBatches = [
  "The Uniques 1.0",
  "The Uniques 2.0",
  "The Uniques 3.0",
  "The Uniques 4.0",
  "The Uniques 5.0",
  "The Uniques 6.0",
];

for (const batch of validBatches) {
  const member = new Member({
    fullName: `Test Member ${batch}`,
    email: `test_${batch.replace(/\s+/g, "_")}@example.com`,
    admno: "2024BTCS001",
    batch: batch,
    course: "B.Tech CSE",
  });

  const err = member.validateSync();
  // Filter out any errors not related to batch
  const batchErr = err?.errors?.batch;
  assert(!batchErr, `Expected batch "${batch}" to be valid in Member model, but got error: ${batchErr?.message}`);
  console.log(`✅ PASS: Member model accepts valid batch "${batch}"`);
}

// 2. Test Member model with invalid batch
const invalidMember = new Member({
  fullName: "Invalid Member",
  email: "invalid@example.com",
  batch: "The Uniques 99.0",
});
const invalidMemberErr = invalidMember.validateSync();
assert(invalidMemberErr?.errors?.batch, "Expected Member model to reject invalid batch 'The Uniques 99.0'");
console.log(`✅ PASS: Member model correctly rejects invalid batch "The Uniques 99.0"`);

// 3. Test Event model with valid eventOrganizerBatch
for (const batch of validBatches) {
  const event = new Event({
    eventName: `Test Event ${batch}`,
    eventDescription: "Test event description",
    eventType: "Workshop",
    eventOrganizerBatch: batch,
  });

  const eventErr = event.validateSync();
  const batchErr = eventErr?.errors?.eventOrganizerBatch;
  assert(!batchErr, `Expected eventOrganizerBatch "${batch}" to be valid in Event model, but got error: ${batchErr?.message}`);
  console.log(`✅ PASS: Event model accepts valid eventOrganizerBatch "${batch}"`);
}

// 4. Test Event model with invalid eventOrganizerBatch
const invalidEvent = new Event({
  eventName: "Invalid Event",
  eventDescription: "Test invalid event",
  eventType: "Workshop",
  eventOrganizerBatch: "The Uniques 99.0",
});
const invalidEventErr = invalidEvent.validateSync();
assert(invalidEventErr?.errors?.eventOrganizerBatch, "Expected Event model to reject invalid organizer batch 'The Uniques 99.0'");
console.log(`✅ PASS: Event model correctly rejects invalid eventOrganizerBatch "The Uniques 99.0"`);

console.log("\n🎉 ALL SCHEMA ENUM VALIDATION TESTS PASSED SUCCESSFULLY!");

/**
 * @file verify_events_crud.js
 * @description Comprehensive test suite verifying Events CRUD and robust handling of
 * eventBanner (subdocument vs string/id/empty), eventGuests (empty strings vs valid ObjectIds),
 * eventGallery, sponsors, and expenses.
 */

import assert from "assert";
import mongoose from "mongoose";
import dbconnect from "../config/dbConfig.js";
import Event from "../models/member/eventModel.js";
import Guest from "../models/member/guestModel.js";
import User from "../models/user/userModel.js";
import * as eventController from "../controller/events/eventController.js";

function mockRes() {
  const res = {
    statusCode: 200,
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
  };
  return res;
}

async function runTests() {
  console.log("=================================================");
  console.log("🧪 Starting Events CRUD & Resiliency Verification");
  console.log("=================================================\n");

  await dbconnect();

  let totalTests = 0;
  let passedTests = 0;

  const test = async (name, fn) => {
    totalTests++;
    try {
      await fn();
      passedTests++;
      console.log(`✅ [PASS] ${name}`);
    } catch (error) {
      console.error(`❌ [FAIL] ${name}`);
      console.error(`   Error: ${error.message}`);
      if (error.stack) console.error(error.stack);
      throw error;
    }
  };

  // Find or create a test guest
  let testGuest = await Guest.findOne();
  if (!testGuest) {
    testGuest = await Guest.create({
      guestName: "Test Guest Speaker",
      guestEmail: "testguest@example.com",
      guestCompany: "The Uniques",
      guestDesignation: "Keynote Speaker",
    });
  }

  const createdEventIds = [];

  try {
    // TEST 1: The exact error reproduction payload
    // eventBanner: string ObjectId, eventGuests: [{ guestId: "" }]
    await test("CREATE Event with String banner ID and empty string guestId succeeds", async () => {
      const fakeBannerId = new mongoose.Types.ObjectId().toString();
      const req = {
        body: {
          eventName: "Automated Error Repro Test Event",
          eventDescription: "Testing fix for Cast to Embedded and Cast to ObjectId errors",
          eventType: "Workshop",
          eventStatus: "upcoming",
          eventBanner: fakeBannerId,
          eventGuests: [{ guestId: "", guestTag: "others" }],
          sponsors: [],
        },
        user: { _id: new mongoose.Types.ObjectId(), role: "admin" },
      };
      const res = mockRes();

      await eventController.createEvent(req, res);

      assert.strictEqual(res.statusCode, 201, `Expected status 201, got ${res.statusCode}: ${JSON.stringify(res.data)}`);
      assert(res.data?.success === true, "Response success must be true");
      assert(res.data?.event, "Created event must exist in response");
      assert.strictEqual(res.data.event.eventName, "Automated Error Repro Test Event");
      
      // eventBanner should be normalized to an embedded subdoc with fileId
      assert(res.data.event.eventBanner, "eventBanner should not be null");
      assert.strictEqual(res.data.event.eventBanner.fileId, fakeBannerId);
      
      // eventGuests with empty guestId should be filtered out
      assert.strictEqual(res.data.event.eventGuests.length, 0, "Empty guest must be filtered out");

      createdEventIds.push(res.data.event._id);
    });

    // TEST 2: CREATE Event with empty string banner and valid guest
    await test("CREATE Event with empty string banner and valid guestId succeeds", async () => {
      const req = {
        body: {
          eventName: "Automated Empty Banner Test Event",
          eventDescription: "Testing empty banner string converts to null",
          eventType: "Seminar",
          eventStatus: "upcoming",
          eventBanner: "",
          eventGuests: [
            { guestId: "", guestTag: "others" },
            { guestId: testGuest._id.toString(), guestTag: "speaker" },
          ],
          sponsors: [],
        },
        user: { _id: new mongoose.Types.ObjectId(), role: "admin" },
      };
      const res = mockRes();

      await eventController.createEvent(req, res);

      assert.strictEqual(res.statusCode, 201, `Expected status 201, got ${res.statusCode}: ${JSON.stringify(res.data)}`);
      assert(res.data?.event, "Created event must exist");
      assert.strictEqual(res.data.event.eventBanner, null, "Empty banner must normalize to null");
      assert.strictEqual(res.data.event.eventGuests.length, 1, "Only valid guest must remain");

      createdEventIds.push(res.data.event._id);
    });

    // TEST 3: CREATE Event with embedded file attachment object
    await test("CREATE Event with embedded file attachment object succeeds", async () => {
      const req = {
        body: {
          eventName: "Automated Object Banner Test Event",
          eventDescription: "Testing full object banner attachment",
          eventType: "Hackathon",
          eventStatus: "upcoming",
          eventBanner: {
            fileId: "drive-banner-12345",
            fileUrl: "https://drive.google.com/uc?id=drive-banner-12345",
            url: "https://drive.google.com/uc?id=drive-banner-12345",
            fileName: "banner-asset.png",
          },
          eventGallery: [
            {
              fileId: "drive-gal-1",
              fileUrl: "https://drive.google.com/uc?id=drive-gal-1",
              fileName: "pic1.png",
            },
          ],
          eventGuests: [],
          sponsors: [
            {
              name: "Sponsor A",
              amount: 5000,
              type: "cash",
              receiptId: "",
            },
          ],
        },
        user: { _id: new mongoose.Types.ObjectId(), role: "admin" },
      };
      const res = mockRes();

      await eventController.createEvent(req, res);

      assert.strictEqual(res.statusCode, 201, `Expected status 201, got ${res.statusCode}: ${JSON.stringify(res.data)}`);
      assert(res.data?.event, "Created event must exist");
      assert.strictEqual(res.data.event.eventBanner.fileId, "drive-banner-12345");
      assert.strictEqual(res.data.event.eventGallery.length, 1);
      assert.strictEqual(res.data.event.sponsors[0].receiptId, null, "Empty receiptId must normalize to null");

      createdEventIds.push(res.data.event._id);
    });

    // TEST 4: READ Event by ID
    const targetEventId = createdEventIds[0];
    await test("READ Event by ID (GET /api/events/:id)", async () => {
      const req = { params: { id: targetEventId.toString() }, query: {} };
      const res = mockRes();

      await eventController.getEventById(req, res);

      assert.strictEqual(res.statusCode, 200, `Expected status 200, got ${res.statusCode}`);
      assert(res.data?.success === true, "Response success must be true");
      assert.strictEqual(res.data.event._id.toString(), targetEventId.toString());
    });

    // TEST 5: UPDATE Event
    await test("UPDATE Event with empty banner string and populated guest objects (PUT /api/events/:id)", async () => {
      const req = {
        params: { id: targetEventId.toString() },
        body: {
          eventName: "Automated Error Repro Test Event - UPDATED",
          eventBanner: "",
          eventGuests: [
            { guestId: { _id: testGuest._id.toString(), guestName: "Test Guest" }, guestTag: "mentor" },
            { guestId: "", guestTag: "others" },
          ],
        },
        user: { _id: new mongoose.Types.ObjectId(), role: "admin" },
      };
      const res = mockRes();

      await eventController.updateEvent(req, res);

      assert.strictEqual(res.statusCode, 200, `Expected status 200, got ${res.statusCode}: ${JSON.stringify(res.data)}`);
      assert.strictEqual(res.data.event.eventName, "Automated Error Repro Test Event - UPDATED");
      assert.strictEqual(res.data.event.eventBanner, null, "eventBanner must update to null when empty string provided");
      assert.strictEqual(res.data.event.eventGuests.length, 1, "Only valid guest must remain after update");
    });

    // TEST 6: ADD Sponsor with receipt
    await test("ADD Sponsor with receipt (POST /api/events/:id/sponsors)", async () => {
      const req = {
        params: { id: targetEventId.toString() },
        body: {
          name: "Tech Sponsor Corp",
          amount: 25000,
          type: "cash",
          receiptId: {
            fileId: "receipt-file-999",
            fileUrl: "https://drive.google.com/uc?id=receipt-file-999",
            fileName: "sponsor_receipt.pdf",
          },
        },
        user: { _id: new mongoose.Types.ObjectId(), role: "coordinator" },
      };
      const res = mockRes();

      await eventController.addEventSponsor(req, res);

      assert.strictEqual(res.statusCode, 201, `Expected status 201, got ${res.statusCode}: ${JSON.stringify(res.data)}`);
      assert(res.data.sponsors && res.data.sponsors.length > 0, "Sponsor must be present");
      const addedSponsor = res.data.sponsors.find((s) => s.name === "Tech Sponsor Corp");
      assert(addedSponsor, "Tech Sponsor Corp must exist");
      assert.strictEqual(addedSponsor.receiptId.fileId, "receipt-file-999");
    });

    // TEST 7: ADD Expense with empty receipt string
    await test("ADD Expense with empty receipt string (POST /api/events/:id/expenses)", async () => {
      const req = {
        params: { id: targetEventId.toString() },
        body: {
          category: "Logistics",
          title: "Stage and Sound Equipment",
          amount: 12000,
          paymentMethod: "bank",
          paymentStatus: "pending",
          receiptId: "",
        },
        user: { _id: new mongoose.Types.ObjectId(), role: "coordinator" },
      };
      const res = mockRes();

      await eventController.addEventExpense(req, res);

      assert.strictEqual(res.statusCode, 201, `Expected status 201, got ${res.statusCode}: ${JSON.stringify(res.data)}`);
      assert(res.data.expenses && res.data.expenses.length > 0, "Expense must be present");
      const addedExpense = res.data.expenses.find((e) => e.title === "Stage and Sound Equipment");
      assert(addedExpense, "Expense must exist");
      assert.strictEqual(addedExpense.receiptId, null, "Empty receiptId must be null");
    });

    // TEST 8: UPDATE Event Gallery
    await test("UPDATE Event Gallery with image additions and removals (PATCH /api/events/:id/gallery)", async () => {
      // First add an image
      const addReq = {
        params: { id: targetEventId.toString() },
        body: {
          imagesToAdd: [
            {
              fileId: "gallery-img-123",
              fileUrl: "https://drive.google.com/uc?id=gallery-img-123",
              fileName: "event_moment.jpg",
            },
          ],
        },
      };
      const addRes = mockRes();
      await eventController.updateEventGallery(addReq, addRes);

      assert.strictEqual(addRes.statusCode, 200, `Expected status 200, got ${addRes.statusCode}`);
      assert(addRes.data.gallery && addRes.data.gallery.length > 0, "Gallery should have added image");
      const addedImg = addRes.data.gallery.find((g) => g.fileId === "gallery-img-123");
      assert(addedImg, "Added gallery image must exist");

      // Now remove the image by its subdocument _id
      const removeReq = {
        params: { id: targetEventId.toString() },
        body: {
          imagesToRemove: [addedImg._id.toString()],
        },
      };
      const removeRes = mockRes();
      await eventController.updateEventGallery(removeReq, removeRes);

      assert.strictEqual(removeRes.statusCode, 200, `Expected status 200, got ${removeRes.statusCode}`);
      const stillExists = removeRes.data.gallery.some((g) => g._id.toString() === addedImg._id.toString());
      assert(!stillExists, "Image should have been removed from gallery");
    });

    // TEST 9: DELETE Event
    await test("DELETE Event and verify removal (DELETE /api/events/:id)", async () => {
      for (const eventId of createdEventIds) {
        const req = { params: { id: eventId.toString() } };
        const res = mockRes();

        await eventController.deleteEvent(req, res);
        assert.strictEqual(res.statusCode, 200, `Expected status 200 on delete, got ${res.statusCode}`);

        const checkEvent = await Event.findById(eventId);
        assert.strictEqual(checkEvent, null, `Event ${eventId} should no longer exist in database`);
      }
    });

    console.log("\n=================================================");
    console.log(`🎉 All ${passedTests}/${totalTests} Tests Passed Successfully!`);
    console.log("=================================================");
  } catch (error) {
    console.error("\n❌ Verification suite failed!");
  } finally {
    // Cleanup any lingering test events
    for (const eventId of createdEventIds) {
      await Event.findByIdAndDelete(eventId).catch(() => {});
    }
    await mongoose.connection.close();
  }
}

runTests();

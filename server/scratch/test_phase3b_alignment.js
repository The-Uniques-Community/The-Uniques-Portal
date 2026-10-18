/**
 * @file test_phase3b_alignment.js
 * @description Standalone TDD test suite validating Phase 3B fixes:
 *  1. createAdmin explicit role: "admin" assignment.
 *  2. imposeFine canonical fines schema push ($push to user.fines).
 *  3. listNewEvent eventOrganizerBatch normalization and fallback.
 *  4. editBlog mass-assignment defense and whitelisting.
 */

import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../models/admin/adminModel.js';
import Member from '../models/member/memberModel.js';
import Event from '../models/member/eventModel.js';
import Blog from '../models/member/blogModel.js';
import { createAdmin, imposeFine, listNewEvent } from '../controller/admin/adminControllers.js';
import { editBlog } from '../controller/member/blogController.js';

// Helper: Mock Express Response
function createMockRes() {
  return {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(data) {
      this.body = data;
      return this;
    }
  };
}

async function runTests() {
  console.log('--- STARTING PHASE 3B ALIGNMENT & SECURITY TEST SUITE ---');
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`  [PASS] ${name}`);
      passed++;
    } catch (err) {
      console.error(`  [FAIL] ${name}`);
      console.error(err);
      process.exitCode = 1;
    }
  }

  // --------------------------------------------------------------------------
  // TEST GROUP 1: createAdmin Role Assignment
  // --------------------------------------------------------------------------
  await test('createAdmin: explicitly assigns role: "admin" when creating document', async () => {
    let savedAdminDoc = null;
    const origFindOne = Admin.findOne;
    const origSave = Admin.prototype.save;

    Admin.findOne = async () => null; // No existing admin
    Admin.prototype.save = async function () {
      savedAdminDoc = this;
      return this;
    };

    try {
      const req = {
        body: {
          email: 'admin.phase3b@theuniques.in',
          password: 'SecurePassword123!'
        }
      };
      const res = createMockRes();

      await createAdmin(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.message, 'Admin created successfully');
      assert.ok(savedAdminDoc, 'Admin document should have been saved');
      assert.strictEqual(savedAdminDoc.email, 'admin.phase3b@theuniques.in');
      assert.strictEqual(savedAdminDoc.role, 'admin', 'Admin role must strictly equal "admin"');
      assert.notStrictEqual(savedAdminDoc.role, 'member', 'Admin must not inherit default "member" role');
    } finally {
      Admin.findOne = origFindOne;
      Admin.prototype.save = origSave;
    }
  });

  // --------------------------------------------------------------------------
  // TEST GROUP 2: imposeFine Schema Alignment
  // --------------------------------------------------------------------------
  await test('imposeFine: pushes fine object to user.fines array and omits fineStatus mutation', async () => {
    let updatePayload = null;
    const origFindOne = Member.findOne;
    const origUpdateOne = Member.updateOne;

    Member.findOne = async () => ({ email: 'student@theuniques.in' });
    Member.updateOne = async (filter, update) => {
      updatePayload = { filter, update };
      return { modifiedCount: 1 };
    };

    try {
      const req = {
        body: {
          email: 'student@theuniques.in',
          fine: 250,
          reason: 'Late event registration'
        }
      };
      const res = createMockRes();

      await imposeFine(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.message, 'Fine imposed successfully');
      assert.ok(updatePayload, 'Member.updateOne must be called');
      assert.strictEqual(updatePayload.filter.email, 'student@theuniques.in');

      // Verify fineStatus is NOT set
      assert.strictEqual(updatePayload.update.fineStatus, undefined, 'Must not mutate nonexistent fineStatus');

      // Verify $push to fines
      assert.ok(updatePayload.update.$push, 'Update must contain $push operator');
      assert.ok(updatePayload.update.$push.fines, '$push must target fines array');
      const fineObj = updatePayload.update.$push.fines;
      assert.strictEqual(fineObj.amount, 250);
      assert.strictEqual(fineObj.reason, 'Late event registration');
      assert.strictEqual(fineObj.status, 'pending');
      assert.ok(fineObj.dateImposed instanceof Date, 'dateImposed must be a valid Date');
    } finally {
      Member.findOne = origFindOne;
      Member.updateOne = origUpdateOne;
    }
  });

  await test('imposeFine: handles string fine amount and sets default reason when omitted', async () => {
    let updatePayload = null;
    const origFindOne = Member.findOne;
    const origUpdateOne = Member.updateOne;

    Member.findOne = async () => ({ email: 'student2@theuniques.in' });
    Member.updateOne = async (filter, update) => {
      updatePayload = { filter, update };
      return { modifiedCount: 1 };
    };

    try {
      const req = {
        body: {
          email: 'student2@theuniques.in',
          fine: '150'
        }
      };
      const res = createMockRes();

      await imposeFine(req, res);

      assert.strictEqual(res.statusCode, 200);
      const fineObj = updatePayload.update.$push.fines;
      assert.strictEqual(fineObj.amount, 150, 'String fine amount must be converted to number');
      assert.strictEqual(fineObj.reason, 'Administrative fine', 'Default reason must be assigned');
      assert.strictEqual(fineObj.status, 'pending');
    } finally {
      Member.findOne = origFindOne;
      Member.updateOne = origUpdateOne;
    }
  });

  // --------------------------------------------------------------------------
  // TEST GROUP 3: listNewEvent eventOrganizerBatch Realignment
  // --------------------------------------------------------------------------
  await test('listNewEvent: correctly sets eventOrganizerBatch from eventOrganizer input', async () => {
    let savedEvent = null;
    const origSave = Event.prototype.save;
    Event.prototype.save = async function () {
      savedEvent = this;
      return this;
    };

    try {
      const req = {
        body: {
          eventName: 'Web3 & AI Workshop',
          eventDescription: 'Deep dive into decentralized intelligence',
          eventDate: new Date(),
          eventTime: '10:00 AM',
          eventVenue: 'Auditorium Hall',
          eventOrganizer: 'The Uniques 2.0',
          eventType: 'Workshop'
        }
      };
      const res = createMockRes();

      await listNewEvent(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.ok(savedEvent, 'Event should be saved');
      assert.strictEqual(savedEvent.eventOrganizerBatch, 'The Uniques 2.0');
    } finally {
      Event.prototype.save = origSave;
    }
  });

  await test('listNewEvent: defaults eventOrganizerBatch to "The Uniques 1.0" when omitted', async () => {
    let savedEvent = null;
    const origSave = Event.prototype.save;
    Event.prototype.save = async function () {
      savedEvent = this;
      return this;
    };

    try {
      const req = {
        body: {
          eventName: 'Internal Hackathon',
          eventDescription: 'Collaborative builder sprint',
          eventDate: new Date(),
          eventTime: '02:00 PM',
          eventVenue: 'Lab 3',
          eventType: 'Hackathon'
        }
      };
      const res = createMockRes();

      await listNewEvent(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.ok(savedEvent, 'Event should be saved');
      assert.strictEqual(savedEvent.eventOrganizerBatch, 'The Uniques 1.0', 'Fallback batch must be applied');
    } finally {
      Event.prototype.save = origSave;
    }
  });

  // --------------------------------------------------------------------------
  // TEST GROUP 4: editBlog Mass-Assignment Sanitization
  // --------------------------------------------------------------------------
  await test('editBlog: whitelists permitted fields and rejects mass assignment attempts (author, views, likes)', async () => {
    const mockBlogId = new mongoose.Types.ObjectId().toString();
    const authorId = new mongoose.Types.ObjectId().toString();

    let capturedSet = null;
    const origFindById = Blog.findById;
    const origFindByIdAndUpdate = Blog.findByIdAndUpdate;

    Blog.findById = async (id) => ({
      _id: id,
      title: 'Original Title',
      author: new mongoose.Types.ObjectId(authorId)
    });

    Blog.findByIdAndUpdate = (id, updateQuery, options) => {
      capturedSet = updateQuery.$set;
      return {
        populate: async () => ({
          _id: id,
          ...capturedSet,
          author: { fullName: 'Blog Author', email: 'author@theuniques.in' }
        })
      };
    };

    try {
      const req = {
        user: { id: authorId, role: 'member' },
        params: { blogId: mockBlogId },
        body: {
          // Whitelisted fields:
          title: 'Remediated Blog Title',
          content: 'Updated content body',
          tags: ['security', 'sanitization'],
          coverImage: 'https://cdn.theuniques.in/cover.jpg',
          summary: 'Security hardening summary',

          // Malicious / Disallowed fields attempted via mass assignment:
          author: new mongoose.Types.ObjectId().toString(),
          views: 999999,
          likes: 50000,
          status: 'archived',
          __v: 10,
          createdAt: new Date('2020-01-01')
        }
      };
      const res = createMockRes();

      await editBlog(req, res);

      assert.strictEqual(res.statusCode, 200);
      assert.strictEqual(res.body.success, true);
      assert.ok(capturedSet, '$set object must exist in findByIdAndUpdate');

      // Verify Whitelisted fields are preserved
      assert.strictEqual(capturedSet.title, 'Remediated Blog Title');
      assert.strictEqual(capturedSet.content, 'Updated content body');
      assert.deepStrictEqual(capturedSet.tags, ['security', 'sanitization']);
      assert.strictEqual(capturedSet.coverImage, 'https://cdn.theuniques.in/cover.jpg');
      assert.strictEqual(capturedSet.summary, 'Security hardening summary');

      // Verify Malicious fields are completely stripped
      assert.strictEqual(capturedSet.author, undefined, 'author must not be overwritten');
      assert.strictEqual(capturedSet.views, undefined, 'views must not be injected');
      assert.strictEqual(capturedSet.likes, undefined, 'likes must not be injected');
      assert.strictEqual(capturedSet.status, undefined, 'status must not be altered via editBlog');
      assert.strictEqual(capturedSet.__v, undefined, '__v must not be mutated');
      assert.strictEqual(capturedSet.createdAt, undefined, 'createdAt must not be mutated');
    } finally {
      Blog.findById = origFindById;
      Blog.findByIdAndUpdate = origFindByIdAndUpdate;
    }
  });

  await test('editBlog: blocks unauthorized users from modifying others’ blogs (403)', async () => {
    const mockBlogId = new mongoose.Types.ObjectId().toString();
    const originalAuthorId = new mongoose.Types.ObjectId().toString();
    const attackerId = new mongoose.Types.ObjectId().toString();

    const origFindById = Blog.findById;
    Blog.findById = async (id) => ({
      _id: id,
      title: 'Original Title',
      author: new mongoose.Types.ObjectId(originalAuthorId)
    });

    try {
      const req = {
        user: { id: attackerId, role: 'member' },
        params: { blogId: mockBlogId },
        body: { title: 'Defaced Blog' }
      };
      const res = createMockRes();

      await editBlog(req, res);

      assert.strictEqual(res.statusCode, 403);
      assert.strictEqual(res.body.success, false);
      assert.strictEqual(res.body.message, 'You are not authorized to edit this blog');
    } finally {
      Blog.findById = origFindById;
    }
  });

  console.log(`\n========================================`);
  console.log(`PHASE 3B TESTS COMPLETED: ${passed}/${total} PASSED`);
  console.log(`========================================`);
}

runTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});

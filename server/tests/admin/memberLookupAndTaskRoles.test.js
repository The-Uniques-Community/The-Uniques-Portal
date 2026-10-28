import { test, describe } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Member from "../../models/member/memberModel.js";
import { getMemberLookup, getAllMembers } from "../../controller/admin/memberController.js";
import { updateTask } from "../../controller/uniques360/taskController.js";
import Task from "../../models/uniques360/Task.js";

/** Helper to create mock Express response object */
const createMockResponse = () => {
  const res = {};
  res.statusCode = 200;
  res.body = null;
  res.status = (code) => {
    res.statusCode = code;
    return res;
  };
  res.json = (data) => {
    res.body = data;
    return res;
  };
  return res;
};

describe("Member Lookup & Uniques 360 Logic Audit Tests", () => {
  describe("getMemberLookup Controller", () => {
    test("getMemberLookup returns projected lightweight fields and sorts alphabetically", async () => {
      const mockMembers = [
        {
          _id: new mongoose.Types.ObjectId(),
          fullName: "Alice Sharma",
          email: "alice@theuniques.in",
          batch: "Uniques 4.0",
          role: "member",
          isSuspended: false,
          isVerified: true,
        },
        {
          _id: new mongoose.Types.ObjectId(),
          fullName: "Bob Verma",
          email: "bob@theuniques.in",
          batch: "Uniques 4.0",
          role: "member",
          isSuspended: false,
          isVerified: true,
        },
      ];

      // Save original Member.find
      const originalFind = Member.find;

      let capturedFilter = null;
      let capturedSelect = null;
      let capturedSort = null;

      Member.find = (filter) => {
        capturedFilter = filter;
        return {
          select: (sel) => {
            capturedSelect = sel;
            return {
              sort: (srt) => {
                capturedSort = srt;
                return {
                  lean: async () => mockMembers,
                };
              },
            };
          },
        };
      };

      try {
        const req = {
          query: {
            batch: "The Uniques 4.0",
            role: "member",
          },
        };
        const res = createMockResponse();

        await getMemberLookup(req, res);

        assert.equal(res.statusCode, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.count, 2);
        assert.deepEqual(res.body.data, mockMembers);

        // Verify filter excludes suspended accounts by default
        assert.deepEqual(capturedFilter.isSuspended, { $ne: true });
        assert.equal(capturedFilter.role, "member");
        // Verify batch regex matches normalized batch
        assert.ok(capturedFilter.batch instanceof RegExp);
        assert.ok(capturedFilter.batch.test("Uniques 4.0"));
        assert.ok(capturedFilter.batch.test("The Uniques 4.0"));

        // Verify projection and alphabetical sorting
        assert.equal(capturedSelect, "_id fullName email batch role avatar profilePic isVerified");
        assert.deepEqual(capturedSort, { fullName: 1 });
      } finally {
        Member.find = originalFind;
      }
    });

    test("getMemberLookup handles search query across name, email, and admno", async () => {
      const originalFind = Member.find;
      let capturedFilter = null;

      Member.find = (filter) => {
        capturedFilter = filter;
        return {
          select: () => ({
            sort: () => ({
              lean: async () => [],
            }),
          }),
        };
      };

      try {
        const req = {
          query: {
            search: "john",
          },
        };
        const res = createMockResponse();

        await getMemberLookup(req, res);

        assert.equal(res.statusCode, 200);
        assert.ok(capturedFilter.$or);
        assert.equal(capturedFilter.$or.length, 3);
        assert.equal(capturedFilter.$or[0].fullName.$regex, "john");
        assert.equal(capturedFilter.$or[1].email.$regex, "john");
        assert.equal(capturedFilter.$or[2].admno.$regex, "john");
      } finally {
        Member.find = originalFind;
      }
    });
  });

  describe("getAllMembers with all=true bypasses 10-limit pagination", () => {
    test("returns all matching records when all=true is passed", async () => {
      const originalFind = Member.find;
      const twentyMembers = Array.from({ length: 20 }, (_, i) => ({
        _id: new mongoose.Types.ObjectId(),
        fullName: `Member ${i + 1}`,
      }));

      Member.find = () => ({
        sort: () => ({
          select: () => ({
            populate: () => ({
              lean: async () => twentyMembers,
            }),
          }),
        }),
      });

      try {
        const req = {
          query: {
            all: "true",
          },
        };
        const res = createMockResponse();

        await getAllMembers(req, res);

        assert.equal(res.statusCode, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.length, 20);
        assert.equal(res.body.count, 20);
        assert.equal(res.body.pagination.total, 20);
        assert.equal(res.body.pagination.limit, 20);
      } finally {
        Member.find = originalFind;
      }
    });
  });

  describe("Task Role Preservation in updateTask", () => {
    test("preserves assigned member roles when assignedTo contains { member, role } objects", async () => {
      const originalFindById = Task.findById;
      const originalFindByIdAndUpdate = Task.findByIdAndUpdate;
      const originalMemberFind = Member.find;

      const memberId1 = new mongoose.Types.ObjectId();
      const memberId2 = new mongoose.Types.ObjectId();
      const taskId = new mongoose.Types.ObjectId();
      const coordinatorId = new mongoose.Types.ObjectId();

      const existingTask = {
        _id: taskId,
        title: "Deploy Uniques 360",
        assignedBy: coordinatorId,
        assignedTo: [
          { member: memberId1, role: "Frontend Lead" },
        ],
      };

      Task.findById = async (id) => (id.toString() === taskId.toString() ? existingTask : null);
      Member.find = () => ({
        select: async () => [{ _id: memberId1 }, { _id: memberId2 }],
      });

      let updatedPayload = null;
      Task.findByIdAndUpdate = (id, payload) => {
        updatedPayload = payload;
        return {
          populate: async () => ({
            ...existingTask,
            ...payload,
          }),
        };
      };

      try {
        const req = {
          params: { taskId: taskId.toString() },
          body: {
            title: "Deploy Uniques 360 v2",
            assignedTo: [
              { member: memberId1.toString(), role: "Frontend Lead" },
              { member: memberId2.toString(), role: "Backend Architect" },
            ],
          },
          user: {
            id: coordinatorId.toString(),
            role: "coordinator",
          },
        };
        const res = createMockResponse();

        await updateTask(req, res);

        assert.equal(res.statusCode, 200);
        assert.ok(updatedPayload);
        assert.equal(updatedPayload.title, "Deploy Uniques 360 v2");
        assert.equal(updatedPayload.assignedTo.length, 2);
        assert.equal(updatedPayload.assignedTo[0].role, "Frontend Lead");
        assert.equal(updatedPayload.assignedTo[1].role, "Backend Architect");
      } finally {
        Task.findById = originalFindById;
        Task.findByIdAndUpdate = originalFindByIdAndUpdate;
        Member.find = originalMemberFind;
      }
    });
  });
});

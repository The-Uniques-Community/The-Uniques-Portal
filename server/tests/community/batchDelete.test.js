import { test, describe } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { Batch } from "../../models/community/batchModel.js";
import {
  getAllBatches,
  getBatchProfiles,
  addBatch,
  deleteBatchByName,
  deleteBatchById,
} from "../../controller/Community/batchController.js";

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

describe("Unified Batch Controller Tests (Single Source of Truth)", () => {
  describe("getAllBatches & getBatchProfiles", () => {
    test("getAllBatches projects naturally sorted string names from unified Batch collection", async () => {
      const originalFind = Batch.find;
      Batch.find = () => ({
        sort: () => [
          { id: "uniques-2.0", label: "Uniques 2.0", title: "The Uniques 2.0" },
          { id: "uniques-1.0", label: "Uniques 1.0", title: "The Uniques 1.0" },
          { id: "uniques-3.0", label: "Uniques 3.0", title: "The Uniques 3.0" },
        ],
      });

      try {
        const req = {};
        const res = createMockResponse();
        await getAllBatches(req, res);

        assert.equal(res.statusCode, 200);
        assert.equal(res.body.success, true);
        assert.deepEqual(res.body.data, [
          "The Uniques 1.0",
          "The Uniques 2.0",
          "The Uniques 3.0",
        ]);
      } finally {
        Batch.find = originalFind;
      }
    });

    test("getBatchProfiles returns full cohort metadata naturally sorted", async () => {
      const originalFind = Batch.find;
      Batch.find = () => ({
        sort: () => [
          { id: "uniques-2.0", label: "Uniques 2.0", title: "The Uniques 2.0", description: "Desc 2" },
          { id: "uniques-1.0", label: "Uniques 1.0", title: "The Uniques 1.0", description: "Desc 1" },
        ],
      });

      try {
        const req = {};
        const res = createMockResponse();
        await getBatchProfiles(req, res);

        assert.equal(res.statusCode, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data[0].id, "uniques-1.0");
        assert.equal(res.body.data[1].id, "uniques-2.0");
      } finally {
        Batch.find = originalFind;
      }
    });
  });

  describe("addBatch", () => {
    test("returns 400 when batch name is missing", async () => {
      const req = { body: {} };
      const res = createMockResponse();
      await addBatch(req, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
    });

    test("successfully creates a new unified cohort with normalized metadata", async () => {
      const originalFindOne = Batch.findOne;
      const originalCreate = Batch.create;

      Batch.findOne = async () => null;
      let createdDoc = null;
      Batch.create = async (doc) => {
        createdDoc = doc;
        return doc;
      };

      try {
        const req = { body: { name: "7.0" } };
        const res = createMockResponse();
        await addBatch(req, res);

        assert.equal(res.statusCode, 200);
        assert.equal(res.body.success, true);
        assert.equal(createdDoc.id, "uniques-7.0");
        assert.equal(createdDoc.label, "Uniques 7.0");
        assert.equal(createdDoc.title, "The Uniques 7.0");
      } finally {
        Batch.findOne = originalFindOne;
        Batch.create = originalCreate;
      }
    });
  });

  describe("deleteBatchByName", () => {
    test("returns 400 when name parameter is empty or whitespace", async () => {
      const req = { params: { name: "   " } };
      const res = createMockResponse();
      await deleteBatchByName(req, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /batch name is required/i);
    });

    test("returns 404 when batch does not exist in unified collection", async () => {
      const originalFindOneAndDelete = Batch.findOneAndDelete;
      Batch.findOneAndDelete = async () => null;

      try {
        const req = { params: { name: "NonExistentBatch" } };
        const res = createMockResponse();
        await deleteBatchByName(req, res);
        assert.equal(res.statusCode, 404);
        assert.equal(res.body.success, false);
        assert.match(res.body.message, /batch not found/i);
      } finally {
        Batch.findOneAndDelete = originalFindOneAndDelete;
      }
    });

    test("successfully deletes batch atomically from unified collection", async () => {
      const originalFindOneAndDelete = Batch.findOneAndDelete;
      Batch.findOneAndDelete = async () => ({
        _id: new mongoose.Types.ObjectId(),
        id: "uniques-7.0",
        label: "Uniques 7.0",
        title: "The Uniques 7.0",
      });

      try {
        const req = { params: { name: "Uniques 7.0" } };
        const res = createMockResponse();
        await deleteBatchByName(req, res);

        assert.equal(res.statusCode, 200);
        assert.equal(res.body.success, true);
        assert.match(res.body.message, /deleted completely/i);
        assert.equal(res.body.data.batch.title, "The Uniques 7.0");
      } finally {
        Batch.findOneAndDelete = originalFindOneAndDelete;
      }
    });
  });

  describe("deleteBatchById", () => {
    test("returns 404 when document not found in unified collection", async () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const originalFindOneAndDelete = Batch.findOneAndDelete;
      Batch.findOneAndDelete = async () => null;

      try {
        const req = { params: { id: validId } };
        const res = createMockResponse();
        await deleteBatchById(req, res);
        assert.equal(res.statusCode, 404);
        assert.equal(res.body.success, false);
      } finally {
        Batch.findOneAndDelete = originalFindOneAndDelete;
      }
    });

    test("successfully deletes batch atomically by ID", async () => {
      const validId = new mongoose.Types.ObjectId().toString();
      const originalFindOneAndDelete = Batch.findOneAndDelete;
      Batch.findOneAndDelete = async () => ({
        _id: validId,
        id: "uniques-8.0",
        label: "Uniques 8.0",
        title: "The Uniques 8.0",
      });

      try {
        const req = { params: { id: validId } };
        const res = createMockResponse();
        await deleteBatchById(req, res);
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.id, "uniques-8.0");
      } finally {
        Batch.findOneAndDelete = originalFindOneAndDelete;
      }
    });
  });
});

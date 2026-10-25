import { test, describe } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import Project from "../../models/projects/projectModel.js";
import {
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
} from "../../controller/Community/projectController.js";

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

describe("Project Showcase CRUD & Schema Validation Tests", () => {
  describe("Project Mongoose Schema Validation (validateSync)", () => {
    test("valid minimal model instance passes validation with defaults", () => {
      const project = new Project({
        title: "Test Platform",
        batch: "Uniques 2.0",
        description: "A test project description explaining the portal.",
      });
      const error = project.validateSync();
      assert.equal(error, undefined);
      assert.equal(project.image, "/projects/unicare.webp");
      assert.deepEqual(project.technologies, ["REACT", "NODE.JS"]);
      assert.equal(project.status, "Active");
      assert.equal(project.featured, false);
      assert.equal(project.buttonColor, "#ea384c");
    });

    test("missing title fails validation with descriptive error", () => {
      const project = new Project({
        batch: "Uniques 2.0",
        description: "A description without title",
      });
      const error = project.validateSync();
      assert.ok(error);
      assert.ok(error.errors.title);
      assert.match(error.errors.title.message, /title is required/i);
    });

    test("missing batch fails validation with descriptive error", () => {
      const project = new Project({
        title: "Test Title",
        description: "A description without batch",
      });
      const error = project.validateSync();
      assert.ok(error);
      assert.ok(error.errors.batch);
      assert.match(error.errors.batch.message, /batch is required/i);
    });

    test("missing description fails validation with descriptive error", () => {
      const project = new Project({
        title: "Test Title",
        batch: "Uniques 2.0",
      });
      const error = project.validateSync();
      assert.ok(error);
      assert.ok(error.errors.description);
      assert.match(error.errors.description.message, /description is required/i);
    });

    test("custom image-proxy path is accepted cleanly by schema", () => {
      const project = new Project({
        title: "Cloud Hub",
        batch: "Uniques 3.0",
        description: "Test description with Drive proxy image.",
        image: "/api/image-proxy/1UeXEfwitlrN5aCve8GyJNSLLIxBRJdA_",
      });
      const error = project.validateSync();
      assert.equal(error, undefined);
      assert.equal(project.image, "/api/image-proxy/1UeXEfwitlrN5aCve8GyJNSLLIxBRJdA_");
    });

    test("invalid status enum value fails validation", () => {
      const project = new Project({
        title: "Test Title",
        batch: "Uniques 2.0",
        description: "A valid description",
        status: "InvalidStatusValue",
      });
      const error = project.validateSync();
      assert.ok(error);
      assert.ok(error.errors.status);
    });
  });

  describe("Controller Input Guardrails & Invalid ID Handling", () => {
    test("createProject returns 400 when title is missing", async () => {
      const req = {
        body: {
          batch: "Uniques 1.0",
          description: "Missing title",
        },
      };
      const res = createMockResponse();
      await createProject(req, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /title, batch, and description are required/i);
    });

    test("createProject returns 400 when batch is missing", async () => {
      const req = {
        body: {
          title: "My Project",
          description: "Missing batch",
        },
      };
      const res = createMockResponse();
      await createProject(req, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /title, batch, and description are required/i);
    });

    test("createProject returns 400 when description is missing", async () => {
      const req = {
        body: {
          title: "My Project",
          batch: "Uniques 1.0",
        },
      };
      const res = createMockResponse();
      await createProject(req, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /title, batch, and description are required/i);
    });

    test("getProjectById returns 404 for malformed/non-ObjectId id", async () => {
      const req = { params: { id: "not-a-valid-mongo-id" } };
      const res = createMockResponse();
      await getProjectById(req, res);
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /invalid ID format/i);
    });

    test("updateProject returns 404 for malformed/non-ObjectId id", async () => {
      const req = { params: { id: "invalid-id" }, body: { title: "Updated" } };
      const res = createMockResponse();
      await updateProject(req, res);
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.success, false);
    });

    test("deleteProject returns 404 for malformed/non-ObjectId id", async () => {
      const req = { params: { id: "invalid-id" } };
      const res = createMockResponse();
      await deleteProject(req, res);
      assert.equal(res.statusCode, 404);
      assert.equal(res.body.success, false);
    });
  });

  describe("Controller Execution Mock Tests", () => {
    test("createProject successfully creates and returns 201 with saved document", async () => {
      const mockSaved = {
        _id: new mongoose.Types.ObjectId(),
        title: "Mock Project",
        batch: "Uniques 5.0",
        description: "Mock description",
        image: "/api/image-proxy/sample-id-12345",
      };

      const originalSave = Project.prototype.save;
      Project.prototype.save = async function () {
        return mockSaved;
      };

      try {
        const req = {
          body: {
            title: "Mock Project",
            batch: "Uniques 5.0",
            description: "Mock description",
            image: "/api/image-proxy/sample-id-12345",
          },
        };
        const res = createMockResponse();
        await createProject(req, res);
        assert.equal(res.statusCode, 201);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.title, "Mock Project");
      } finally {
        Project.prototype.save = originalSave;
      }
    });

    test("getProjectById returns 200 when project exists", async () => {
      const validId = new mongoose.Types.ObjectId();
      const mockFound = {
        _id: validId,
        title: "Found Project",
        batch: "Uniques 1.0",
      };

      const originalFindById = Project.findById;
      Project.findById = async (id) => {
        if (String(id) === String(validId)) return mockFound;
        return null;
      };

      try {
        const req = { params: { id: validId.toString() } };
        const res = createMockResponse();
        await getProjectById(req, res);
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.title, "Found Project");
      } finally {
        Project.findById = originalFindById;
      }
    });

    test("updateProject returns 200 when project is updated", async () => {
      const validId = new mongoose.Types.ObjectId();
      const mockUpdated = {
        _id: validId,
        title: "Updated Title",
        batch: "Uniques 1.0",
      };

      const originalFindByIdAndUpdate = Project.findByIdAndUpdate;
      Project.findByIdAndUpdate = async (id, updates) => {
        return mockUpdated;
      };

      try {
        const req = {
          params: { id: validId.toString() },
          body: { title: "Updated Title" },
        };
        const res = createMockResponse();
        await updateProject(req, res);
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.title, "Updated Title");
      } finally {
        Project.findByIdAndUpdate = originalFindByIdAndUpdate;
      }
    });

    test("deleteProject returns 200 when project is deleted", async () => {
      const validId = new mongoose.Types.ObjectId();
      const mockDeleted = {
        _id: validId,
        title: "Deleted Project",
      };

      const originalFindByIdAndDelete = Project.findByIdAndDelete;
      Project.findByIdAndDelete = async (id) => {
        return mockDeleted;
      };

      try {
        const req = { params: { id: validId.toString() } };
        const res = createMockResponse();
        await deleteProject(req, res);
        assert.equal(res.statusCode, 200);
        assert.equal(res.body.success, true);
        assert.equal(res.body.data.title, "Deleted Project");
      } finally {
        Project.findByIdAndDelete = originalFindByIdAndDelete;
      }
    });
  });
});

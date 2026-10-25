import { test, describe } from "node:test";
import assert from "node:assert/strict";
import SuccessStory from "../../models/community/successStoryModel.js";
import {
  normalizeBatchName,
  createSuccessStory,
  getSuccessStoryById,
  updateSuccessStory,
  deleteSuccessStory,
} from "../../controller/Community/successStories.controller.js";

describe("Success Stories Module Tests", () => {
  describe("normalizeBatchName()", () => {
    test("normalizes 'The Uniques X.0' to 'Uniques X.0'", () => {
      assert.equal(normalizeBatchName("The Uniques 1.0"), "Uniques 1.0");
      assert.equal(normalizeBatchName("the uniques 4.0"), "Uniques 4.0");
      assert.equal(normalizeBatchName("theuniques 2.0"), "Uniques 2.0");
      assert.equal(normalizeBatchName("The Uniques"), "Uniques");
    });

    test("preserves already canonical 'Uniques X.0'", () => {
      assert.equal(normalizeBatchName("Uniques 3.0"), "Uniques 3.0");
      assert.equal(normalizeBatchName("Uniques 5.0"), "Uniques 5.0");
    });

    test("handles null, undefined, or empty gracefully", () => {
      assert.equal(normalizeBatchName(null), "Uniques 1.0");
      assert.equal(normalizeBatchName(undefined), "Uniques 1.0");
      assert.equal(normalizeBatchName(""), "Uniques 1.0");
    });
  });

  describe("SuccessStory Mongoose Schema Validation (validateSync)", () => {
    test("valid minimal model instance passes validation", () => {
      const story = new SuccessStory({
        id: "test-story-1",
        name: "Test Candidate",
        role: "Software Development Engineer",
        company: "Acme Corp",
        batch: "Uniques 2.0",
      });
      const error = story.validateSync();
      assert.equal(error, undefined);
    });

    test("missing name fails validation", () => {
      const story = new SuccessStory({
        id: "test-story-2",
        role: "SDE",
        company: "Acme Corp",
        batch: "Uniques 2.0",
      });
      const error = story.validateSync();
      assert.ok(error);
      assert.ok(error.errors.name);
    });

    test("missing company fails validation", () => {
      const story = new SuccessStory({
        id: "test-story-3",
        name: "Test Candidate",
        role: "SDE",
        batch: "Uniques 2.0",
      });
      const error = story.validateSync();
      assert.ok(error);
      assert.ok(error.errors.company);
    });

    test("missing role fails validation", () => {
      const story = new SuccessStory({
        id: "test-story-4",
        name: "Test Candidate",
        company: "Acme Corp",
        batch: "Uniques 2.0",
      });
      const error = story.validateSync();
      assert.ok(error);
      assert.ok(error.errors.role);
    });

    test("valid nested subdocuments (timeline, education, experience, projects, skills)", () => {
      const story = new SuccessStory({
        id: "full-journey-story",
        name: "Full Journey Candidate",
        role: "Full Stack Engineer",
        company: "Global Tech",
        batch: "Uniques 3.0",
        education: {
          institution: "University Institute of Engineering",
          degree: "B.Tech Computer Science",
          duration: "2020 - 2024",
          location: "Mohali, India",
          details: "Graduated with honors",
        },
        timeline: [
          { year: 2021, achievements: ["Won Hackathon", "Joined The Uniques"] },
          { year: 2023, achievements: ["Completed Internship"] },
        ],
        experience: [
          {
            company: "Global Tech",
            role: "Software Engineer",
            duration: "2024 - Present",
            location: "Bangalore",
            responsibilities: ["Build distributed microservices"],
          },
        ],
        projects: [
          {
            name: "Cloud Portal",
            technologies: "React, Node, MongoDB",
            date: "2023",
            description: "Enterprise management system",
            achievements: ["Served 10k users"],
            projectUrl: "https://example.com",
          },
        ],
        skills: {
          languages: ["JavaScript", "Python"],
          technologies: ["React", "Express", "MongoDB"],
          tools: ["Docker", "Git"],
        },
        leadership: {
          organization: "The Uniques Community",
          role: "Technical Lead",
          duration: "2023 - 2024",
          achievements: ["Mentored 40+ junior developers"],
        },
      });

      const error = story.validateSync();
      assert.equal(error, undefined);
      assert.equal(story.timeline.length, 2);
      assert.equal(story.experience.length, 1);
      assert.equal(story.projects.length, 1);
      assert.equal(story.skills.languages[0], "JavaScript");
    });
  });

  describe("Controller Input Validation Guardrails", () => {
    // Helper to mock Express req and res
    const createMockRes = () => {
      const res = {
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
      return res;
    };

    test("createSuccessStory returns 400 when name is missing", async () => {
      const req = {
        body: { role: "SDE", company: "Google", batch: "Uniques 1.0" },
      };
      const res = createMockRes();

      await createSuccessStory(req, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /name is required/i);
    });

    test("createSuccessStory returns 400 when role is missing", async () => {
      const req = {
        body: { name: "Alice", company: "Google", batch: "Uniques 1.0" },
      };
      const res = createMockRes();

      await createSuccessStory(req, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /role is required/i);
    });

    test("createSuccessStory returns 400 when company is missing", async () => {
      const req = {
        body: { name: "Alice", role: "SDE", batch: "Uniques 1.0" },
      };
      const res = createMockRes();

      await createSuccessStory(req, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /company is required/i);
    });

    test("createSuccessStory returns 400 when batch is missing", async () => {
      const req = {
        body: { name: "Alice", role: "SDE", company: "Google" },
      };
      const res = createMockRes();

      await createSuccessStory(req, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
      assert.match(res.body.message, /batch is required/i);
    });
  });
});

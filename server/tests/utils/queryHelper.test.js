import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  escapeRegex,
  parsePaginationParams,
  buildSearchQuery,
  paginateQuery,
  DEFAULT_PAGE,
  DEFAULT_LIMIT,
  MAX_LIMIT,
} from "../../utils/queryHelper.js";

describe("queryHelper Unit & Integration Tests", () => {
  describe("escapeRegex()", () => {
    test("escape special chars", () => {
      const input = ".*+?^${}()|[]\\test";
      const escaped = escapeRegex(input);
      assert.equal(escaped, "\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\test");
      assert.doesNotThrow(() => new RegExp(escaped));
    });

    test("handle null, undefined, non-strings", () => {
      assert.equal(escapeRegex(null), "");
      assert.equal(escapeRegex(undefined), "");
      assert.equal(escapeRegex(123), "");
      assert.equal(escapeRegex(""), "");
      assert.equal(escapeRegex("   "), "");
    });
  });

  describe("parsePaginationParams()", () => {
    test("default pagination on empty input", () => {
      const res = parsePaginationParams({});
      assert.deepEqual(res, { page: DEFAULT_PAGE, limit: DEFAULT_LIMIT, skip: 0 });
    });

    test("parse valid string numbers", () => {
      const res = parsePaginationParams({ page: "3", limit: "25" });
      assert.deepEqual(res, { page: 3, limit: 25, skip: 50 });
    });

    test("guard negative and non-numeric page", () => {
      assert.equal(parsePaginationParams({ page: "0" }).page, 1);
      assert.equal(parsePaginationParams({ page: "-4" }).page, 1);
      assert.equal(parsePaginationParams({ page: "abc" }).page, 1);
    });

    test("guard limit bounds and MAX_LIMIT", () => {
      assert.equal(parsePaginationParams({ limit: "0" }).limit, DEFAULT_LIMIT);
      assert.equal(parsePaginationParams({ limit: "-10" }).limit, DEFAULT_LIMIT);
      assert.equal(parsePaginationParams({ limit: "999" }).limit, MAX_LIMIT);
    });
  });

  describe("buildSearchQuery()", () => {
    test("empty when search blank or fields empty", () => {
      assert.deepEqual(buildSearchQuery("", ["name"]), {});
      assert.deepEqual(buildSearchQuery("alice", []), {});
      assert.deepEqual(buildSearchQuery(null, ["name"]), {});
    });

    test("build safe $or regex", () => {
      const res = buildSearchQuery("alice", ["fullName", "email"]);
      assert.ok(res.$or);
      assert.equal(res.$or.length, 2);
      assert.equal(res.$or[0].fullName.source, "alice");
      assert.equal(res.$or[1].email.source, "alice");
    });
  });

  describe("paginateQuery() math and envelope", () => {
    const mockData = Array.from({ length: 45 }, (_, i) => ({ id: i + 1 }));
    const mockModel = {
      find: () => {
        let skipVal = 0;
        let limitVal = 10;
        const chain = {
          sort: () => chain,
          skip: (s) => { skipVal = s; return chain; },
          limit: (l) => { limitVal = l; return chain; },
          select: () => chain,
          populate: () => chain,
          lean: () => chain,
          exec: async () => mockData.slice(skipVal, skipVal + limitVal),
        };
        return chain;
      },
      countDocuments: () => ({ exec: async () => mockData.length }),
    };

    test("return standardized envelope with metadata", async () => {
      const result = await paginateQuery(mockModel, {}, { page: 1, limit: 10 });
      assert.equal(result.success, true);
      assert.equal(result.data.length, 10);
      assert.deepEqual(result.pagination, {
        total: 45,
        page: 1,
        limit: 10,
        pages: 5,
        hasNextPage: true,
        hasPrevPage: false,
      });
    });

    test("boundary condition: last page hasNextPage is false", async () => {
      const result = await paginateQuery(mockModel, {}, { page: 5, limit: 10 });
      assert.equal(result.data.length, 5);
      assert.equal(result.pagination.hasNextPage, false);
      assert.equal(result.pagination.hasPrevPage, true);
    });
  });

  describe("paginateAggregate() facet pagination", () => {
    const mockData = Array.from({ length: 30 }, (_, i) => ({ id: i + 1 }));
    const mockModel = {
      aggregate: (pipeline) => ({
        exec: async () => [{
          data: mockData.slice(0, 10),
          totalCount: [{ total: 30 }],
        }],
      }),
    };

    test("return standardized facet envelope", async () => {
      const { paginateAggregate } = await import("../../utils/queryHelper.js");
      const result = await paginateAggregate(mockModel, [], { page: 1, limit: 10 });
      assert.equal(result.success, true);
      assert.equal(result.data.length, 10);
      assert.deepEqual(result.pagination, {
        total: 30,
        page: 1,
        limit: 10,
        pages: 3,
        hasNextPage: true,
        hasPrevPage: false,
      });
    });
  });
});

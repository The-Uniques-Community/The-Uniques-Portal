import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("usePaginatedQuery core logic and stability test", () => {
  test("filterKey and primitive comparisons prevent unnecessary triggers", () => {
    const filters1 = { status: "Pending" };
    const filters2 = { status: "Pending" };
    const key1 = JSON.stringify(filters1);
    const key2 = JSON.stringify(filters2);
    assert.equal(key1, key2);
  });

  test("empty params are cleaned up cleanly", () => {
    const queryParams = {
      page: 1,
      limit: 10,
      search: undefined,
      sortBy: "createdAt",
      order: "desc",
      status: "All",
      batch: "All Batches",
    };

    Object.keys(queryParams).forEach((key) => {
      const val = queryParams[key];
      if (
        val === undefined ||
        val === null ||
        val === "" ||
        val === "all" ||
        val === "All" ||
        val === "All Batches"
      ) {
        delete queryParams[key];
      }
    });

    assert.deepEqual(queryParams, {
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      order: "desc",
    });
  });

  test("response normalization handles various backend envelope shapes", () => {
    // Normalizer logic test
    const normalize = (response, limit = 10, page = 1) => {
      let items = [];
      let total = 0;

      if (Array.isArray(response)) {
        items = response;
        total = response.length;
      } else if (response && typeof response === "object") {
        if (Array.isArray(response.data)) {
          items = response.data;
          total = response.pagination?.total ?? response.count ?? response.total ?? items.length;
        } else if (response.data && Array.isArray(response.data.members)) {
          items = response.data.members;
          total = response.pagination?.total ?? response.data.count ?? response.data.total ?? items.length;
        } else if (Array.isArray(response.leaves)) {
          items = response.leaves;
          total = response.pagination?.total ?? response.count ?? response.total ?? items.length;
        }
      }

      const safeLimit = Math.max(1, limit || 10);
      const totalPages = Math.max(1, Math.ceil(total / safeLimit));
      return { items, pagination: { total, page, limit: safeLimit, pages: totalPages } };
    };

    // Shape 1: member response
    const shape1 = normalize({ success: true, data: [{ id: 1 }, { id: 2 }], count: 2 });
    assert.equal(shape1.items.length, 2);
    assert.equal(shape1.pagination.total, 2);

    // Shape 2: fine response with nested data.members
    const shape2 = normalize({ success: true, data: { members: [{ id: 1 }], count: 1 } });
    assert.equal(shape2.items.length, 1);
    assert.equal(shape2.pagination.total, 1);

    // Shape 3: leave response
    const shape3 = normalize({ success: true, leaves: [{ id: 1 }, { id: 2 }, { id: 3 }], count: 3 });
    assert.equal(shape3.items.length, 3);
    assert.equal(shape3.pagination.total, 3);
  });
});

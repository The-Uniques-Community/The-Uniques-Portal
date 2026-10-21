/**
 * @file queryHelper.js
 * @description Centralized pagination, regex escaping, and query execution helper.
 */

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export const escapeRegex = (string) => {
  if (typeof string !== "string") return "";
  return string.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const parsePaginationParams = (query = {}, options = {}) => {
  const defaultLimit = options.defaultLimit || DEFAULT_LIMIT;
  const maxLimit = options.maxLimit || MAX_LIMIT;

  const rawPage = parseInt(query.page, 10);
  const rawLimit = parseInt(query.limit, 10);

  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : DEFAULT_PAGE;
  let limit = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : defaultLimit;

  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const buildSearchQuery = (search, fields = []) => {
  if (!search || typeof search !== "string" || !search.trim() || !fields.length) {
    return {};
  }
  const escaped = escapeRegex(search);
  const regex = new RegExp(escaped, "i");
  return {
    $or: fields.map((field) => ({ [field]: regex })),
  };
};

export const paginateQuery = async (Model, filter = {}, options = {}) => {
  const { page, limit, skip } = parsePaginationParams(options, {
    defaultLimit: options.defaultLimit,
    maxLimit: options.maxLimit,
  });

  const sort = options.sort || { createdAt: -1 };
  const lean = options.lean !== false;

  let query = Model.find(filter).sort(sort).skip(skip).limit(limit);

  if (options.select) {
    query = query.select(options.select);
  }

  if (options.populate) {
    if (Array.isArray(options.populate)) {
      options.populate.forEach((p) => {
        query = query.populate(p);
      });
    } else {
      query = query.populate(options.populate);
    }
  }

  if (lean) {
    query = query.lean();
  }

  const [data, total] = await Promise.all([
    query.exec(),
    Model.countDocuments(filter).exec(),
  ]);

  const pages = Math.ceil(total / limit) || 1;

  return {
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages,
      hasNextPage: page < pages,
      hasPrevPage: page > 1,
    },
  };
};

export const paginateAggregate = async (Model, pipeline = [], options = {}) => {
  const { page, limit, skip } = parsePaginationParams(options, {
    defaultLimit: options.defaultLimit,
    maxLimit: options.maxLimit,
  });

  const facetPipeline = [
    ...pipeline,
    {
      $facet: {
        data: [{ $skip: skip }, { $limit: limit }],
        totalCount: [{ $count: "total" }],
      },
    },
  ];

  const [result] = await Model.aggregate(facetPipeline).exec();
  const data = result?.data || [];
  const total = result?.totalCount?.[0]?.total || 0;
  const pages = Math.ceil(total / limit) || 1;

  return {
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages,
      hasNextPage: page < pages,
      hasPrevPage: page > 1,
    },
  };
};

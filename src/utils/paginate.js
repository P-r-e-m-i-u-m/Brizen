const logger = require("../services/logger");

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

const clampLimit = (value, defaultLimit = DEFAULT_LIMIT, maxLimit = MAX_LIMIT) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return defaultLimit;
  return Math.max(1, Math.min(maxLimit, Math.floor(parsed)));
};

const parseCursorFromRequest = (req = {}) => req.query?.cursor || null;

const encodeCursor = (item) => {
  if (!item) return null;
  return String(item.id);
};

const decodeCursor = (cursor) => {
  if (!cursor) return null;
  return String(cursor);
};

const paginate = async (model, options = {}) => {
  const limit = clampLimit(options.limit);
  const cursor = options.cursor ? decodeCursor(options.cursor) : null;
  const query = { ...options.where, take: limit + 1 };
  if (cursor) query.cursor = cursor;

  const timer = logger.time?.("paginate");
  const rows = await model.findMany(query);
  timer?.end?.();

  const hasMore = rows.length > limit;
  const data = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? encodeCursor(data[data.length - 1]) : null;

  return {
    data,
    meta: {
      limit,
      hasMore,
      nextCursor
    }
  };
};

const paginateOffset = async (model, options = {}) => {
  const page = Math.max(1, Number(options.page) || 1);
  const limit = clampLimit(options.limit);
  const skip = (page - 1) * limit;
  const [data, total] = await Promise.all([
    model.findMany({ ...options.where, skip, take: limit }),
    model.count(options.where)
  ]);
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasPrev: page > 1,
      hasNext: page < totalPages
    }
  };
};

module.exports = {
  clampLimit,
  decodeCursor,
  encodeCursor,
  paginate,
  paginateOffset,
  parseCursorFromRequest
};

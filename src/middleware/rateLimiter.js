const redis = require("../config/redis");
const logger = require("../services/logger");

const slidingWindow = async (key, windowMs, max) => {
  const now = Date.now();
  const windowStart = now - windowMs;
  await redis.zremrangebyscore(key, "-inf", windowStart);
  const count = await redis.zcard(key);
  if (count >= max) return false;
  await redis.zadd(key, now, now + "-" + Math.random());
  await redis.pexpire(key, windowMs);
  return true;
};

const slidingWindowLimiter = (options = {}) => {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const max = options.max || 100;
  const prefix = options.prefix || "rate";

  return async (req, res, next) => {
    const key = prefix + ":" + (req.ip || req.headers?.["x-forwarded-for"] || "unknown");
    try {
      const now = Date.now();
      await redis.zremrangebyscore(key, "-inf", now - windowMs);
      const count = await redis.zcard(key);
      const remaining = Math.max(0, max - count - 1);

      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", remaining);

      if (count >= max) {
        const oldest = await redis.zrange(key, 0, 0, "WITHSCORES");
        const resetMs = oldest?.[1] ? Number(oldest[1]) + windowMs : now + windowMs;
        res.setHeader("Retry-After", Math.ceil((resetMs - now) / 1000));
        return res.status(429).json({ error: "Too many requests" });
      }

      await redis.zadd(key, now, now + "-" + Math.random());
      await redis.pexpire(key, windowMs);
      return next();
    } catch (err) {
      logger.warn("Rate limiter failed open", { error: err.message });
      return next();
    }
  };
};

module.exports = { slidingWindow, slidingWindowLimiter };

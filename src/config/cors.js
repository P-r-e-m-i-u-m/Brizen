/**
 * @file cors.js
 * @description CORS configuration with environment-based origin whitelisting
 * @updated 2026-05-30
 */
const logger = require("../services/logger");

const getAllowedOrigins = () => {
  const raw = process.env.ALLOWED_ORIGINS || "";
  return raw.split(",").map((o) => o.trim()).filter(Boolean);
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowed = getAllowedOrigins();
    if (!origin) return callback(null, true);
    if (allowed.length === 0 && process.env.NODE_ENV !== "production") return callback(null, true);
    if (allowed.includes(origin)) return callback(null, true);
    logger.warn("CORS blocked", { origin, allowed });
    callback(new Error("CORS policy violation: origin not allowed"));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Request-ID", "X-API-Key", "X-Correlation-ID"],
  exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset", "X-Request-ID"],
  credentials: true,
  maxAge: 86400,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

module.exports = corsOptions;

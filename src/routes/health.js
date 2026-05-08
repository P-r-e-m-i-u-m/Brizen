const express = require("express");
const db = require("../config/db");
const redis = require("../config/redis");
const logger = require("../services/logger");
const pkg = require("../../package.json");

const router = express.Router();

const checkDb = async () => {
  const start = Date.now();
  try {
    if (db.raw) {
      await db.raw("SELECT 1 AS health_check");
    } else {
      const client = await db.pool.connect();
      try {
        await client.query("SELECT 1");
      } finally {
        client.release();
      }
    }
    return { status: "healthy", latencyMs: Date.now() - start };
  } catch (err) {
    logger.error("Database health check failed", err);
    return { status: "unhealthy", error: err.message };
  }
};

const checkCache = async () => {
  const start = Date.now();
  try {
    await redis.ping();
    const info = redis.info ? await redis.info() : "";
    return { status: "healthy", latencyMs: Date.now() - start, info };
  } catch (err) {
    logger.error("Redis health check failed", err);
    return { status: "unhealthy", error: err.message };
  }
};

router.get("/health", async (_req, res) => {
  const [database, cache] = await Promise.all([checkDb(), checkCache()]);
  const healthy = database.status === "healthy" && cache.status === "healthy";
  res.status(healthy ? 200 : 503).json({
    status: healthy ? "healthy" : "degraded",
    version: pkg.version,
    uptime: process.uptime(),
    dependencies: { database, cache }
  });
});

router.get("/ready", (_req, res) => {
  res.status(200).json({ ready: true });
});

router.get("/live", (_req, res) => {
  res.status(200).json({ alive: true, uptime: process.uptime() });
});

module.exports = router;

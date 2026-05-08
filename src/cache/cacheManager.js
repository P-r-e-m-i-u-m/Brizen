const redis = require("../config/redis");
const logger = require("../services/logger");

const normalizeCacheKey = (prefix, params) => {
  const sorted = Object.keys(params).sort().reduce((acc, key) => {
    if (params[key] !== undefined && params[key] !== null) acc[key] = params[key];
    return acc;
  }, {});
  return prefix + ":" + Buffer.from(JSON.stringify(sorted)).toString("base64");
};

class CacheManager {
  constructor(prefix = "cache") {
    this.prefix = prefix;
    this.local = new Map();
    this.stats = { hits: 0, misses: 0, localHits: 0, sets: 0, errors: 0 };
  }

  _key(key) {
    return this.prefix + ":" + key;
  }

  _setLocal(key, value, ttlSeconds) {
    this.local.set(this._key(key), {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000
    });
  }

  _getLocal(key) {
    const entry = this.local.get(this._key(key));
    if (!entry) return undefined;
    if (entry.expiresAt <= Date.now()) {
      this.local.delete(this._key(key));
      return undefined;
    }
    return entry.value;
  }

  async get(key) {
    const localValue = this._getLocal(key);
    if (localValue !== undefined) {
      this.stats.localHits++;
      return localValue;
    }

    try {
      const raw = await redis.get(this._key(key));
      if (!raw) {
        this.stats.misses++;
        return null;
      }
      this.stats.hits++;
      const parsed = JSON.parse(raw);
      this._setLocal(key, parsed, 60);
      return parsed;
    } catch (err) {
      this.stats.errors++;
      logger.warn("Cache get failed", { key, error: err.message });
      return null;
    }
  }

  async set(key, value, ttlSeconds = 300) {
    await redis.setex(this._key(key), ttlSeconds, JSON.stringify(value));
    this._setLocal(key, value, ttlSeconds);
    this.stats.sets++;
  }

  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      ...this.stats,
      hitRatio: total === 0 ? "0.000" : (this.stats.hits / total).toFixed(3)
    };
  }
}

const withCache = (fn, options = {}) => {
  const cache = new CacheManager(options.prefix || fn.name || "fn");
  return async (...args) => {
    const key = normalizeCacheKey("args", { args });
    const cached = await cache.get(key);
    if (cached !== null) return cached;
    const result = await fn(...args);
    await cache.set(key, result, options.ttl || 300);
    return result;
  };
};

const USER_PROFILE_TTL = 3600;

module.exports = { CacheManager, USER_PROFILE_TTL, normalizeCacheKey, withCache };

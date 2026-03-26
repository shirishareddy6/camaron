const Redis = require('ioredis');
const logger = require('../utils/logger');

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  maxRetriesPerRequest: 3,
  lazyConnect: true,
});

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error('Redis error', { error: err.message }));
redis.on('reconnecting', () => logger.warn('Redis reconnecting'));

const connectRedis = async () => {
  await redis.connect();
};

// ── Typed helpers ────────────────────────────────────────────────────────────

const setEx = (key, seconds, value) =>
  redis.setex(key, seconds, JSON.stringify(value));

const get = async (key) => {
  const raw = await redis.get(key);
  if (!raw) return null;
  try { return JSON.parse(raw); }
  catch { return raw; }
};

const del = (key) => redis.del(key);

const exists = (key) => redis.exists(key);

module.exports = { redis, connectRedis, setEx, get, del, exists };

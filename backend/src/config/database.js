const { Pool } = require('pg');
const logger = require('../utils/logger');

const pool = new Pool({
  host:     process.env.POSTGRES_HOST,
  port:     parseInt(process.env.POSTGRES_PORT, 10) || 5432,
  database: process.env.POSTGRES_DB,
  user:     process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  max:      parseInt(process.env.POSTGRES_POOL_MAX, 10) || 20,
  idleTimeoutMillis:    parseInt(process.env.POSTGRES_POOL_IDLE, 10)    || 10000,
  connectionTimeoutMillis: parseInt(process.env.POSTGRES_POOL_ACQUIRE, 10) || 30000,
  ssl: false,
});

pool.on('connect', () => logger.debug('New DB client connected'));
pool.on('error',   (err) => logger.error('Unexpected DB client error', { error: err.message }));

const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    logger.debug('DB query executed', { text, duration: Date.now() - start, rows: result.rowCount });
    return result;
  } catch (err) {
    logger.error('DB query error', { text, error: err.message });
    throw err;
  }
};

const getClient = () => pool.connect();

module.exports = { query, getClient, pool };

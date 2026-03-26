const jwt = require('jsonwebtoken');
const { query, getClient } = require('../config/database');
const logger = require('../utils/logger');

const requestOTP = async (phone) => {
  logger.info('[DEMO] OTP requested - use 121212 to login', { phone });
};

const verifyOTP = async (phone, otp) => {
  if (otp !== '121212') {
    throw { statusCode: 400, message: 'Invalid OTP. Use 121212 for demo.', code: 'OTP_INVALID' };
  }
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const existing = await client.query(
      'SELECT id, role, name, is_active FROM users WHERE phone = $1', [phone]
    );
    let user;
    if (existing.rows.length) {
      user = existing.rows[0];
      if (!user.is_active) throw { statusCode: 403, message: 'Account suspended', code: 'SUSPENDED' };
    } else {
      const res = await client.query(
        "INSERT INTO users (phone, role) VALUES ($1, 'farmer') RETURNING id, role, name, is_active",
        [phone]
      );
      user = res.rows[0];
      await client.query('INSERT INTO farmer_profiles (user_id) VALUES ($1)', [user.id]);
      logger.info('New user registered', { userId: user.id, phone });
    }
    await client.query('COMMIT');
    return issueTokens(user);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const refreshTokens = async (refreshToken) => {
  let decoded;
  try {
    decoded = require('jsonwebtoken').verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (e) {
    throw { statusCode: 401, message: 'Invalid refresh token', code: 'TOKEN_INVALID' };
  }
  const { rows } = await query(
    'SELECT id, role, name, is_active FROM users WHERE id = $1', [decoded.sub]
  );
  if (!rows.length || !rows[0].is_active) {
    throw { statusCode: 401, message: 'User not found', code: 'UNAUTHENTICATED' };
  }
  return issueTokens(rows[0]);
};

const issueTokens = (user) => {
  const payload = { sub: user.id, role: user.role };
  const accessToken  = require('jsonwebtoken').sign(payload, process.env.JWT_SECRET,         { expiresIn: process.env.JWT_EXPIRES_IN  || '15m' });
  const refreshToken = require('jsonwebtoken').sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' });
  return { accessToken, refreshToken, user: { id: user.id, role: user.role, name: user.name } };
};

module.exports = { requestOTP, verifyOTP, refreshTokens };

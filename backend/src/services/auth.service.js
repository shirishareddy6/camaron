const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { query, getClient } = require('../config/database');
const { setEx, get, del } = require('../config/redis');
const { sendOTP } = require('./sms.service');
const { AppError } = require('../middleware/errorHandler');
const logger = require('../utils/logger');

const OTP_TTL      = parseInt(process.env.OTP_EXPIRES_MINUTES, 10) * 60 || 600;
const OTP_LENGTH   = parseInt(process.env.OTP_LENGTH, 10) || 6;
const MAX_ATTEMPTS = 5;

// ── OTP helpers ──────────────────────────────────────────────────────────────

const generateOTP = () =>
  crypto.randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH).toString();

const otpKey      = (phone) => `otp:${phone}`;
const attemptKey  = (phone) => `otp_attempts:${phone}`;

// ── Public methods ────────────────────────────────────────────────────────────

const requestOTP = async (phone) => {
  // Check lockout
  const attempts = await get(attemptKey(phone));
  if (attempts && attempts.count >= MAX_ATTEMPTS) {
    throw new AppError(
      'Too many OTP requests. Try again in 10 minutes.',
      429,
      'OTP_LOCKED'
    );
  }

  const otp = generateOTP();
  // Store hashed OTP in Redis
  const hashed = crypto.createHash('sha256').update(otp).digest('hex');
  await setEx(otpKey(phone), OTP_TTL, { hashed, phone });

  await sendOTP(phone, otp);
  logger.info('OTP sent', { phone });
};

const verifyOTP = async (phone, otp) => {
  const stored = await get(otpKey(phone));
  if (!stored) {
    throw new AppError('OTP expired or not requested', 400, 'OTP_INVALID');
  }

  const hashed = crypto.createHash('sha256').update(otp).digest('hex');
  if (hashed !== stored.hashed) {
    // Increment failure count
    const att = (await get(attemptKey(phone))) || { count: 0 };
    await setEx(attemptKey(phone), 600, { count: att.count + 1 });
    throw new AppError('Invalid OTP', 400, 'OTP_INVALID');
  }

  // OTP valid — clean up
  await del(otpKey(phone));
  await del(attemptKey(phone));

  // Upsert user
  const client = await getClient();
  try {
    await client.query('BEGIN');

    const existing = await client.query(
      'SELECT id, role, name, is_active FROM users WHERE phone = $1',
      [phone]
    );

    let user;
    if (existing.rows.length) {
      user = existing.rows[0];
      if (!user.is_active) {
        throw new AppError('Account suspended', 403, 'ACCOUNT_SUSPENDED');
      }
    } else {
      const res = await client.query(
        `INSERT INTO users (phone, role) VALUES ($1, 'farmer')
         RETURNING id, role, name, is_active`,
        [phone]
      );
      user = res.rows[0];
      // Auto-create farmer profile
      await client.query(
        'INSERT INTO farmer_profiles (user_id) VALUES ($1)',
        [user.id]
      );
      logger.info('New farmer registered', { userId: user.id, phone });
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
    decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401, 'TOKEN_INVALID');
  }

  const { rows } = await query(
    'SELECT id, role, name, is_active FROM users WHERE id = $1',
    [decoded.sub]
  );
  if (!rows.length || !rows[0].is_active) {
    throw new AppError('User not found', 401, 'UNAUTHENTICATED');
  }

  return issueTokens(rows[0]);
};

// ── Private helpers ───────────────────────────────────────────────────────────

const issueTokens = (user) => {
  const payload = { sub: user.id, role: user.role };

  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

  const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, role: user.role, name: user.name },
  };
};

module.exports = { requestOTP, verifyOTP, refreshTokens };

const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMITED', message: 'Too many requests, try again later' },
});

const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMITED', message: 'Too many OTP requests. Wait 10 minutes.' },
});

const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, code: 'RATE_LIMITED', message: 'Too many attempts' },
});

module.exports = { apiLimiter, otpLimiter, strictLimiter };

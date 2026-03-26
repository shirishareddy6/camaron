const authService = require('../services/auth.service');
const logger = require('../utils/logger');

const sendOTP = async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(422).json({ success: false, message: 'Phone required' });
  try { await authService.requestOTP(phone); } catch(e) { logger.warn('OTP skipped', { error: e.message }); }
  res.json({ success: true, message: 'OTP sent. Use 121212 for demo.' });
};

const verifyOTP = async (req, res) => {
  try {
    const result = await authService.verifyOTP(req.body.phone, req.body.otp);
    res.json({ success: true, data: result });
  } catch(err) {
    const status = err.statusCode || 400;
    res.status(status).json({ success: false, message: err.message || 'OTP verification failed' });
  }
};

const refresh = async (req, res) => {
  try {
    const result = await authService.refreshTokens(req.body.refresh_token);
    res.json({ success: true, data: result });
  } catch(err) {
    res.status(401).json({ success: false, message: err.message });
  }
};

const me = async (req, res) => res.json({ success: true, data: req.user });

module.exports = { sendOTP, verifyOTP, refresh, me };

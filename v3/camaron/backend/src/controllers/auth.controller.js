const authService = require('../services/auth.service');

const sendOTP = async (req, res) => {
  await authService.requestOTP(req.body.phone);
  res.json({ success: true, message: 'OTP sent successfully' });
};

const verifyOTP = async (req, res) => {
  const result = await authService.verifyOTP(req.body.phone, req.body.otp);
  res.json({ success: true, data: result });
};

const refresh = async (req, res) => {
  const result = await authService.refreshTokens(req.body.refresh_token);
  res.json({ success: true, data: result });
};

const me = async (req, res) => {
  res.json({ success: true, data: req.user });
};

module.exports = { sendOTP, verifyOTP, refresh, me };

const logger = require('../utils/logger');

/**
 * Sends an OTP SMS via the configured provider.
 * Supports: twilio | msg91
 */
const sendOTP = async (phone, otp) => {
  const provider = process.env.SMS_PROVIDER || 'twilio';
  const message = `Your Camaron OTP is ${otp}. Valid for ${process.env.OTP_EXPIRES_MINUTES || 10} minutes. Do not share.`;

  if (process.env.NODE_ENV !== 'production') {
    // In dev/test just log — no actual SMS
    logger.info(`[DEV] OTP for ${phone}: ${otp}`);
    return { success: true, dev: true };
  }

  if (provider === 'twilio') {
    return sendViaTwilio(phone, message);
  }
  if (provider === 'msg91') {
    return sendViaMSG91(phone, otp);
  }
  throw new Error(`Unknown SMS provider: ${provider}`);
};

const sendViaTwilio = async (phone, message) => {
  const twilio = require('twilio');
  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
  const msg = await client.messages.create({
    body: message,
    from: process.env.TWILIO_FROM_NUMBER,
    to: phone,
  });
  logger.info('SMS sent via Twilio', { sid: msg.sid });
  return { success: true, sid: msg.sid };
};

const sendViaMSG91 = async (phone, otp) => {
  const axios = require('axios');
  // Remove leading + for MSG91
  const mobile = phone.replace(/^\+/, '');
  const resp = await axios.post('https://api.msg91.com/api/v5/otp', {
    template_id: process.env.MSG91_TEMPLATE_ID,
    mobile,
    authkey: process.env.MSG91_API_KEY,
    otp,
  });
  logger.info('SMS sent via MSG91', { resp: resp.data });
  return { success: true };
};

module.exports = { sendOTP };

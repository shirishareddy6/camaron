const logger = require('../utils/logger');

const sendOTP = async (phone, otp) => {
  // Demo mode — log OTP, no SMS sent
  // TODO: Replace with MSG91 when ready
  logger.info(`[DEMO] OTP for ${phone}: ${otp} (use 121212 to login)`);
  return { success: true };
};

module.exports = { sendOTP };

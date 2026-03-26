const router1 = require('express').Router();
const ctrl    = require('../controllers/auth.controller');
const v       = require('../middleware/validate');
const s       = require('../validators/schemas');
const { authenticate } = require('../middleware/auth');

router1.post('/send-otp',   v(s.sendOTPSchema),   ctrl.sendOTP);
router1.post('/verify-otp', v(s.verifyOTPSchema), ctrl.verifyOTP);
router1.post('/refresh',    v(s.refreshSchema),   ctrl.refresh);
router1.get('/me',          authenticate,         ctrl.me);

module.exports = router1;

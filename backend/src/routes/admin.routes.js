const router = require('express').Router();
const ac = require('../controllers/admin.controller');
const v  = require('../middleware/validate');
const s  = require('../validators/schemas');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('admin'));

router.get('/analytics/overview',        ac.aOverview);
router.get('/analytics/monthly-revenue', ac.aMonthlyRevenue);
router.get('/analytics/top-products',    ac.aTopProducts);
router.get('/users',                     ac.aListUsers);
router.post('/users',                    v(s.createUserSchema), ac.aCreateUser);
router.patch('/users/:id/status',        v(s.setUserStatusSchema), ac.aSetUserStatus);
router.patch('/users/:id/role',          v(s.setUserRoleSchema),   ac.aSetUserRole);
router.patch('/vendors/:id/verify',      ac.aVerifyVendor);
router.get('/orders',                    ac.aListOrders);

module.exports = router;

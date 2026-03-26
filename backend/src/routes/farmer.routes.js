const router = require('express').Router();
const ctrl   = require('../controllers/farmer.controller');
const v      = require('../middleware/validate');
const s      = require('../validators/schemas');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('farmer', 'admin'));

router.get('/profile',        ctrl.getProfile);
router.put('/profile',        v(s.updateFarmerSchema), ctrl.updateProfile);
router.get('/ponds',          ctrl.getPonds);
router.post('/ponds',         v(s.createPondSchema), ctrl.createPond);
router.put('/ponds/:id',      v(s.updatePondSchema), ctrl.updatePond);
router.delete('/ponds/:id',   ctrl.deletePond);
router.get('/orders',         ctrl.getMyOrders);

module.exports = router;

const router = require('express').Router();
const { vendorController: ctrl } = require('../controllers/controllers');
const v = require('../middleware/validate');
const s = require('../validators/schemas');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.use(authorize('vendor', 'admin'));

router.get('/profile',           ctrl.vGetProfile);
router.put('/profile',           v(s.vendorProfileSchema), ctrl.vUpsertProfile);
router.get('/inventory',         ctrl.vListInventory);
router.post('/inventory',        v(s.addInventorySchema),    ctrl.vAddInventory);
router.put('/inventory/:id',     v(s.updateInventorySchema), ctrl.vUpdateInventory);
router.delete('/inventory/:id',  ctrl.vRemoveInventory);
router.get('/orders',            ctrl.vGetOrders);
router.patch('/orders/:id/status', v(s.updateOrderStatusSchema), ctrl.vUpdateOrderStatus);

module.exports = router;

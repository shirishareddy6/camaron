// product.routes.js
const pRouter = require('express').Router();
const { productController: pc } = require('../controllers/controllers');
const v  = require('../middleware/validate');
const s  = require('../validators/schemas');
const { authenticate, authorize } = require('../middleware/auth');

pRouter.get('/',     pc.list);
pRouter.get('/:id',  pc.getById);
pRouter.post('/',    authenticate, authorize('admin'), v(s.createProductSchema), pc.create);
pRouter.put('/:id',  authenticate, authorize('admin'), v(s.updateProductSchema), pc.update);

module.exports.productRoutes = pRouter;

// ─────────────────────────────────────────────────────────────────────────────

// admin.routes.js
const aRouter = require('express').Router();
const { adminController: ac } = require('../controllers/controllers');

aRouter.use(authenticate);
aRouter.use(authorize('admin'));

aRouter.get('/analytics/overview',        ac.aOverview);
aRouter.get('/analytics/monthly-revenue', ac.aMonthlyRevenue);
aRouter.get('/analytics/top-products',    ac.aTopProducts);
aRouter.get('/users',                     ac.aListUsers);
aRouter.patch('/users/:id/status',        v(s.setUserStatusSchema), ac.aSetUserStatus);
aRouter.patch('/users/:id/role',          v(s.setUserRoleSchema),   ac.aSetUserRole);
aRouter.patch('/vendors/:id/verify',      ac.aVerifyVendor);
aRouter.get('/orders',                    ac.aListOrders);

module.exports.adminRoutes = aRouter;

// ─────────────────────────────────────────────────────────────────────────────

// order.routes.js
const oRouter = require('express').Router();
const { orderController: oc } = require('../controllers/controllers');

oRouter.use(authenticate);
oRouter.post('/',    authorize('farmer'), v(s.placeOrderSchema), oc.placeOrder);
oRouter.get('/:id',  oc.getOrder);

module.exports.orderRoutes = oRouter;

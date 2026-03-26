// ── product.controller.js ────────────────────────────────────────────────────
const productService = require('../services/product.service');

const list    = async (req, res) => {
  const data = await productService.list(req.query);
  res.json({ success: true, ...data });
};
const getById = async (req, res) => {
  const data = await productService.getById(req.params.id);
  res.json({ success: true, data });
};
const create  = async (req, res) => {
  const data = await productService.create(req.body);
  res.status(201).json({ success: true, data });
};
const update  = async (req, res) => {
  const data = await productService.update(req.params.id, req.body);
  res.json({ success: true, data });
};

module.exports.productController = { list, getById, create, update };

// ── vendor.controller.js ─────────────────────────────────────────────────────
const vendorService = require('../services/vendor.service');

const vGetProfile     = async (req, res) => {
  const data = await vendorService.getProfile(req.user.id);
  res.json({ success: true, data });
};
const vUpsertProfile  = async (req, res) => {
  const data = await vendorService.upsertProfile(req.user.id, req.body);
  res.json({ success: true, data });
};
const vListInventory  = async (req, res) => {
  const data = await vendorService.listInventory(req.user.id, req.query);
  res.json({ success: true, ...data });
};
const vAddInventory   = async (req, res) => {
  const data = await vendorService.addInventory(req.user.id, req.body);
  res.status(201).json({ success: true, data });
};
const vUpdateInventory = async (req, res) => {
  const data = await vendorService.updateInventory(req.user.id, req.params.id, req.body);
  res.json({ success: true, data });
};
const vRemoveInventory = async (req, res) => {
  await vendorService.removeInventory(req.user.id, req.params.id);
  res.status(204).send();
};
const vGetOrders      = async (req, res) => {
  const data = await vendorService.getOrders(req.user.id, req.query);
  res.json({ success: true, ...data });
};
const vUpdateOrderStatus = async (req, res) => {
  const data = await vendorService.updateOrderStatus(req.user.id, req.params.id, req.body.status);
  res.json({ success: true, data });
};

module.exports.vendorController = {
  vGetProfile, vUpsertProfile,
  vListInventory, vAddInventory, vUpdateInventory, vRemoveInventory,
  vGetOrders, vUpdateOrderStatus,
};

// ── admin.controller.js ──────────────────────────────────────────────────────
const adminService = require('../services/admin.service');

const aOverview        = async (req, res) => res.json({ success: true, data: await adminService.getOverview() });
const aMonthlyRevenue  = async (req, res) => res.json({ success: true, data: await adminService.getMonthlyRevenue(req.query.months) });
const aTopProducts     = async (req, res) => res.json({ success: true, data: await adminService.getTopProducts(req.query.limit) });
const aListUsers       = async (req, res) => {
  const data = await adminService.listUsers(req.query);
  res.json({ success: true, ...data });
};
const aSetUserStatus   = async (req, res) => {
  const data = await adminService.setUserStatus(req.params.id, req.body.is_active);
  res.json({ success: true, data });
};
const aSetUserRole     = async (req, res) => {
  const data = await adminService.setUserRole(req.params.id, req.body.role);
  res.json({ success: true, data });
};
const aVerifyVendor    = async (req, res) => {
  const data = await adminService.verifyVendor(req.params.id);
  res.json({ success: true, data });
};
const aListOrders      = async (req, res) => {
  const data = await adminService.listAllOrders(req.query);
  res.json({ success: true, ...data });
};

module.exports.adminController = {
  aOverview, aMonthlyRevenue, aTopProducts,
  aListUsers, aSetUserStatus, aSetUserRole, aVerifyVendor,
  aListOrders,
};

// ── order.controller.js ──────────────────────────────────────────────────────
const orderService = require('../services/order.service');

const placeOrder  = async (req, res) => {
  const data = await orderService.placeOrder(req.user.id, req.body);
  res.status(201).json({ success: true, data });
};
const getOrder    = async (req, res) => {
  const data = await orderService.getOrderById(req.params.id, req.user.id);
  res.json({ success: true, data });
};

module.exports.orderController = { placeOrder, getOrder };

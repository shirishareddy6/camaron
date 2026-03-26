const adminService = require('../services/admin.service');

const aOverview       = async (req, res) => res.json({ success: true, data: await adminService.getOverview() });
const aMonthlyRevenue = async (req, res) => res.json({ success: true, data: await adminService.getMonthlyRevenue(req.query.months) });
const aTopProducts    = async (req, res) => res.json({ success: true, data: await adminService.getTopProducts(req.query.limit) });

const aListUsers = async (req, res) => {
  const data = await adminService.listUsers(req.query);
  res.json({ success: true, ...data });
};

const aCreateUser = async (req, res) => {
  const data = await adminService.createUser(req.body);
  res.status(201).json({ success: true, data });
};

const aSetUserStatus = async (req, res) => {
  const data = await adminService.setUserStatus(req.params.id, req.body.is_active);
  res.json({ success: true, data });
};

const aSetUserRole = async (req, res) => {
  const data = await adminService.setUserRole(req.params.id, req.body.role);
  res.json({ success: true, data });
};

const aVerifyVendor = async (req, res) => {
  const data = await adminService.verifyVendor(req.params.id);
  res.json({ success: true, data });
};

const aListOrders = async (req, res) => {
  const data = await adminService.listAllOrders(req.query);
  res.json({ success: true, ...data });
};

module.exports = {
  aOverview, aMonthlyRevenue, aTopProducts,
  aListUsers, aCreateUser, aSetUserStatus, aSetUserRole,
  aVerifyVendor, aListOrders,
};

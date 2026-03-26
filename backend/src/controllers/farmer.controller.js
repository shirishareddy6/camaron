const farmerService = require('../services/farmer.service');

const getProfile  = async (req, res) => {
  const data = await farmerService.getProfile(req.user.id);
  res.json({ success: true, data });
};
const updateProfile = async (req, res) => {
  const data = await farmerService.updateProfile(req.user.id, req.body);
  res.json({ success: true, data });
};
const getPonds    = async (req, res) => {
  const data = await farmerService.getPonds(req.user.id);
  res.json({ success: true, data });
};
const createPond  = async (req, res) => {
  const data = await farmerService.createPond(req.user.id, req.body);
  res.status(201).json({ success: true, data });
};
const updatePond  = async (req, res) => {
  const data = await farmerService.updatePond(req.user.id, req.params.id, req.body);
  res.json({ success: true, data });
};
const deletePond  = async (req, res) => {
  await farmerService.deletePond(req.user.id, req.params.id);
  res.status(204).send();
};
const getMyOrders = async (req, res) => {
  const data = await farmerService.getMyOrders(req.user.id, req.query);
  res.json({ success: true, ...data });
};

module.exports = { getProfile, updateProfile, getPonds, createPond, updatePond, deletePond, getMyOrders };

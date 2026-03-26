const Joi = require('joi');

const phone = Joi.string().min(7).max(15).required()
  .messages({ 'string.base': 'Invalid phone number' });

exports.sendOTPSchema    = Joi.object({ phone });
exports.verifyOTPSchema  = Joi.object({ phone, otp: Joi.string().length(6).pattern(/^\d+$/).required() });
exports.refreshSchema    = Joi.object({ refresh_token: Joi.string().required() });

exports.updateFarmerSchema = Joi.object({
  name: Joi.string().min(2).max(100), email: Joi.string().email(),
  state: Joi.string().max(100), district: Joi.string().max(100),
  village: Joi.string().max(100), pincode: Joi.string().max(10),
  total_pond_area: Joi.number().positive(), experience_years: Joi.number().integer().min(0).max(80),
  community: Joi.string().max(100), gender: Joi.string().valid('male','female','other'),
  bank_account: Joi.string().max(30), ifsc_code: Joi.string().max(15),
  age: Joi.number().integer().min(1).max(120),
  address: Joi.string().max(500), location: Joi.string().max(200),
  num_ponds: Joi.number().integer().min(0),
});

exports.createPondSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  area_acres: Joi.number().positive(), shrimp_variety: Joi.string().max(100),
  stocking_date: Joi.date().iso(), expected_harvest: Joi.date().iso(),
  notes: Joi.string().max(1000),
});

exports.updatePondSchema = Joi.object({
  name: Joi.string().min(1).max(100), area_acres: Joi.number().positive(),
  shrimp_variety: Joi.string(), stocking_date: Joi.date().iso(),
  expected_harvest: Joi.date().iso(), status: Joi.string().valid('active','fallow','harvested'),
  notes: Joi.string().max(1000),
});

exports.vendorProfileSchema = Joi.object({
  name: Joi.string().max(100), email: Joi.string().email(),
  business_name: Joi.string().min(2).max(255), gst_number: Joi.string().max(20).allow(''),
  state: Joi.string().max(100), district: Joi.string().max(100),
  address: Joi.string().max(500), pincode: Joi.string().max(10),
});

exports.addInventorySchema = Joi.object({
  product_id: Joi.string().uuid().required(),
  price_per_unit: Joi.number().positive().required(),
  unit: Joi.string().valid('kg','bag','litre','piece').required(),
  stock_qty: Joi.number().integer().min(0).required(),
  min_order_qty: Joi.number().integer().min(1),
});

exports.updateInventorySchema = Joi.object({
  price_per_unit: Joi.number().positive(), stock_qty: Joi.number().integer().min(0),
  min_order_qty: Joi.number().integer().min(1), is_available: Joi.boolean(),
});

exports.updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('confirmed','shipped','delivered','cancelled').required(),
});

exports.placeOrderSchema = Joi.object({
  vendor_id: Joi.string().uuid().required(),
  delivery_address: Joi.string().max(500).required(),
  notes: Joi.string().max(500),
  items: Joi.array().items(Joi.object({
    inventory_id: Joi.string().uuid().required(),
    quantity: Joi.number().integer().min(1).required(),
  })).min(1).required(),
});

exports.createProductSchema = Joi.object({
  name: Joi.string().min(1).max(255).required(),
  category: Joi.string().valid('feed','health_care','equipment','other').required(),
  description: Joi.string().max(2000).allow(''),
  features: Joi.array().items(Joi.string()),
  image_url: Joi.string().uri().allow(''),
  sort_order: Joi.number().integer(),
  is_active: Joi.boolean(),
});

exports.updateProductSchema = Joi.object({
  name: Joi.string().min(1).max(255),
  category: Joi.string().valid('feed','health_care','equipment','other'),
  description: Joi.string().max(2000).allow(''),
  features: Joi.alternatives().try(Joi.array().items(Joi.string()), Joi.string()),
  image_url: Joi.string().uri().allow('', null),
  is_active: Joi.boolean(),
  sort_order: Joi.number().integer(),
});

exports.setUserStatusSchema = Joi.object({ is_active: Joi.boolean().required() });
exports.setUserRoleSchema   = Joi.object({ role: Joi.string().valid('farmer','vendor','admin').required() });

exports.createUserSchema = Joi.object({
  phone: Joi.string().min(7).max(15).required(),
  name: Joi.string().min(2).max(100).required(),
  role: Joi.string().valid('farmer','vendor','admin').required(),
  email: Joi.string().email().allow(''),
});

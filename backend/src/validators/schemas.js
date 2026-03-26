const Joi = require('joi');

const phone = Joi.string()
  .pattern(/^\+?[1-9]\d{9,14}$/)
  .required()
  .messages({ 'string.pattern.base': 'Invalid phone number format' });

// ── Auth ──────────────────────────────────────────────────────────────────────
exports.sendOTPSchema = Joi.object({ phone });

exports.verifyOTPSchema = Joi.object({
  phone,
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
});

exports.refreshSchema = Joi.object({
  refresh_token: Joi.string().required(),
});

// ── Farmer ────────────────────────────────────────────────────────────────────
exports.updateFarmerSchema = Joi.object({
  name:             Joi.string().min(2).max(100),
  email:            Joi.string().email(),
  state:            Joi.string().max(100),
  district:         Joi.string().max(100),
  village:          Joi.string().max(100),
  pincode:          Joi.string().pattern(/^\d{6}$/),
  total_pond_area:  Joi.number().positive(),
  experience_years: Joi.number().integer().min(0).max(80),
  community:        Joi.string().max(100),
  gender:           Joi.string().valid('male','female','other'),
  bank_account:     Joi.string().max(30),
  ifsc_code:        Joi.string().pattern(/^[A-Z]{4}0[A-Z0-9]{6}$/),
});

exports.createPondSchema = Joi.object({
  name:             Joi.string().min(1).max(100).required(),
  area_acres:       Joi.number().positive(),
  shrimp_variety:   Joi.string().valid('vannamei','black_tiger','other'),
  stocking_date:    Joi.date().iso(),
  expected_harvest: Joi.date().iso(),
  notes:            Joi.string().max(1000),
});

exports.updatePondSchema = Joi.object({
  name:             Joi.string().min(1).max(100),
  area_acres:       Joi.number().positive(),
  shrimp_variety:   Joi.string(),
  stocking_date:    Joi.date().iso(),
  expected_harvest: Joi.date().iso(),
  status:           Joi.string().valid('active','fallow','harvested'),
  notes:            Joi.string().max(1000),
});

// ── Vendor ────────────────────────────────────────────────────────────────────
exports.vendorProfileSchema = Joi.object({
  name:           Joi.string().max(100),
  email:          Joi.string().email(),
  business_name:  Joi.string().min(2).max(255),
  gst_number:     Joi.string().pattern(/^\d{2}[A-Z]{5}\d{4}[A-Z]{1}\d[Z]{1}[A-Z\d]{1}$/).allow(''),
  state:          Joi.string().max(100),
  district:       Joi.string().max(100),
  address:        Joi.string().max(500),
  pincode:        Joi.string().pattern(/^\d{6}$/),
});

exports.addInventorySchema = Joi.object({
  product_id:     Joi.string().uuid().required(),
  price_per_unit: Joi.number().positive().required(),
  unit:           Joi.string().valid('kg','bag','litre','piece').required(),
  stock_qty:      Joi.number().integer().min(0).required(),
  min_order_qty:  Joi.number().integer().min(1),
});

exports.updateInventorySchema = Joi.object({
  price_per_unit: Joi.number().positive(),
  stock_qty:      Joi.number().integer().min(0),
  min_order_qty:  Joi.number().integer().min(1),
  is_available:   Joi.boolean(),
});

exports.updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid('confirmed','shipped','delivered','cancelled')
    .required(),
});

// ── Order ─────────────────────────────────────────────────────────────────────
exports.placeOrderSchema = Joi.object({
  vendor_id:        Joi.string().uuid().required(),
  delivery_address: Joi.string().max(500).required(),
  notes:            Joi.string().max(500),
  items: Joi.array().items(Joi.object({
    inventory_id: Joi.string().uuid().required(),
    quantity:     Joi.number().integer().min(1).required(),
  })).min(1).required(),
});

// ── Product ───────────────────────────────────────────────────────────────────
exports.createProductSchema = Joi.object({
  name:        Joi.string().min(2).max(255).required(),
  category:    Joi.string().valid('feed','health_care','equipment','other').required(),
  description: Joi.string().max(2000),
  features:    Joi.array().items(Joi.string()),
  image_url:   Joi.string().uri(),
  sort_order:  Joi.number().integer(),
});

exports.updateProductSchema = Joi.object({
  name:        Joi.string().min(2).max(255),
  category:    Joi.string().valid('feed','health_care','equipment','other'),
  description: Joi.string().max(2000),
  features:    Joi.array().items(Joi.string()),
  image_url:   Joi.string().uri(),
  is_active:   Joi.boolean(),
  sort_order:  Joi.number().integer(),
});

// ── Admin ─────────────────────────────────────────────────────────────────────
exports.setUserStatusSchema = Joi.object({ is_active: Joi.boolean().required() });
exports.setUserRoleSchema   = Joi.object({ role: Joi.string().valid('farmer','vendor','admin').required() });

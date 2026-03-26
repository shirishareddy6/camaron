const { query, getClient } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

// ── Profile ───────────────────────────────────────────────────────────────────

const getProfile = async (userId) => {
  const { rows } = await query(
    `SELECT u.id, u.phone, u.email, u.name, u.avatar_url,
            vp.id AS vendor_profile_id, vp.business_name, vp.gst_number,
            vp.state, vp.district, vp.address, vp.pincode, vp.is_verified
     FROM users u
     LEFT JOIN vendor_profiles vp ON vp.user_id = u.id
     WHERE u.id = $1`,
    [userId]
  );
  if (!rows.length) throw new AppError('Vendor not found', 404);
  return rows[0];
};

const upsertProfile = async (userId, data) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    if (data.name || data.email) {
      await client.query(
        `UPDATE users SET
           name  = COALESCE($1, name),
           email = COALESCE($2, email)
         WHERE id = $3`,
        [data.name, data.email, userId]
      );
    }

    // Upsert vendor_profiles
    await client.query(
      `INSERT INTO vendor_profiles (user_id, business_name, gst_number, state, district, address, pincode)
       VALUES ($1,$2,$3,$4,$5,$6,$7)
       ON CONFLICT (user_id) DO UPDATE SET
         business_name = COALESCE(EXCLUDED.business_name, vendor_profiles.business_name),
         gst_number    = COALESCE(EXCLUDED.gst_number,    vendor_profiles.gst_number),
         state         = COALESCE(EXCLUDED.state,         vendor_profiles.state),
         district      = COALESCE(EXCLUDED.district,      vendor_profiles.district),
         address       = COALESCE(EXCLUDED.address,       vendor_profiles.address),
         pincode       = COALESCE(EXCLUDED.pincode,       vendor_profiles.pincode)`,
      [userId, data.business_name, data.gst_number,
       data.state, data.district, data.address, data.pincode]
    );

    await client.query('COMMIT');
    return getProfile(userId);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ── Inventory ─────────────────────────────────────────────────────────────────

const getVendorProfileId = async (userId) => {
  const { rows } = await query(
    'SELECT id FROM vendor_profiles WHERE user_id = $1',
    [userId]
  );
  if (!rows.length) throw new AppError('Complete your vendor profile first', 400);
  return rows[0].id;
};

const listInventory = async (userId, { page = 1, limit = 20 } = {}) => {
  const vpId = await getVendorProfileId(userId);
  const offset = (page - 1) * limit;

  const { rows } = await query(
    `SELECT vi.*, p.name AS product_name, p.category, p.image_url,
            COUNT(*) OVER() AS total_count
     FROM vendor_inventory vi
     JOIN products p ON p.id = vi.product_id
     WHERE vi.vendor_id = $1
     ORDER BY p.name ASC
     LIMIT $2 OFFSET $3`,
    [vpId, limit, offset]
  );
  const total = rows[0]?.total_count ?? 0;
  return {
    data: rows.map(({ total_count, ...r }) => r),
    pagination: { page, limit, total: parseInt(total, 10), pages: Math.ceil(total / limit) },
  };
};

const addInventory = async (userId, data) => {
  const vpId = await getVendorProfileId(userId);

  const { rows } = await query(
    `INSERT INTO vendor_inventory
       (vendor_id, product_id, price_per_unit, unit, stock_qty, min_order_qty)
     VALUES ($1,$2,$3,$4,$5,$6)
     ON CONFLICT (vendor_id, product_id) DO UPDATE SET
       price_per_unit = EXCLUDED.price_per_unit,
       unit           = EXCLUDED.unit,
       stock_qty      = EXCLUDED.stock_qty,
       min_order_qty  = EXCLUDED.min_order_qty,
       is_available   = TRUE
     RETURNING *`,
    [vpId, data.product_id, data.price_per_unit, data.unit,
     data.stock_qty, data.min_order_qty || 1]
  );
  return rows[0];
};

const updateInventory = async (userId, inventoryId, data) => {
  const vpId = await getVendorProfileId(userId);

  const { rows } = await query(
    `UPDATE vendor_inventory
     SET price_per_unit = COALESCE($1, price_per_unit),
         stock_qty      = COALESCE($2, stock_qty),
         min_order_qty  = COALESCE($3, min_order_qty),
         is_available   = COALESCE($4, is_available)
     WHERE id = $5 AND vendor_id = $6
     RETURNING *`,
    [data.price_per_unit, data.stock_qty, data.min_order_qty,
     data.is_available, inventoryId, vpId]
  );
  if (!rows.length) throw new AppError('Inventory item not found', 404);
  return rows[0];
};

const removeInventory = async (userId, inventoryId) => {
  const vpId = await getVendorProfileId(userId);
  const { rowCount } = await query(
    'DELETE FROM vendor_inventory WHERE id = $1 AND vendor_id = $2',
    [inventoryId, vpId]
  );
  if (!rowCount) throw new AppError('Inventory item not found', 404);
};

// ── Orders for vendor ─────────────────────────────────────────────────────────

const getOrders = async (userId, { status, page = 1, limit = 20 } = {}) => {
  const vpId = await getVendorProfileId(userId);
  const offset = (page - 1) * limit;
  const conditions = ['o.vendor_id = $1'];
  const params = [vpId];
  let i = 2;

  if (status) {
    conditions.push(`o.status = $${i++}`);
    params.push(status);
  }

  const { rows } = await query(
    `SELECT o.*, u.name AS buyer_name, u.phone AS buyer_phone,
            COUNT(*) OVER() AS total_count
     FROM orders o
     JOIN users u ON u.id = o.buyer_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY o.created_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );
  const total = rows[0]?.total_count ?? 0;
  return {
    data: rows.map(({ total_count, ...r }) => r),
    pagination: { page, limit, total: parseInt(total, 10), pages: Math.ceil(total / limit) },
  };
};

const updateOrderStatus = async (userId, orderId, status) => {
  const vpId = await getVendorProfileId(userId);
  const { rows } = await query(
    `UPDATE orders SET status = $1
     WHERE id = $2 AND vendor_id = $3
     RETURNING *`,
    [status, orderId, vpId]
  );
  if (!rows.length) throw new AppError('Order not found', 404);
  return rows[0];
};

module.exports = {
  getProfile, upsertProfile,
  listInventory, addInventory, updateInventory, removeInventory,
  getOrders, updateOrderStatus,
};

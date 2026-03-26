const { query, getClient } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

// ── Profile ───────────────────────────────────────────────────────────────────

const getProfile = async (userId) => {
  const { rows } = await query(
    `SELECT u.id, u.phone, u.email, u.name, u.avatar_url, u.created_at,
            fp.state, fp.district, fp.village, fp.pincode,
            fp.total_pond_area, fp.experience_years, fp.community, fp.gender,
            fp.bank_account, fp.ifsc_code
     FROM users u
     LEFT JOIN farmer_profiles fp ON fp.user_id = u.id
     WHERE u.id = $1`,
    [userId]
  );
  if (!rows.length) throw new AppError('Farmer not found', 404);
  return rows[0];
};

const updateProfile = async (userId, data) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');

    if (data.name || data.email) {
      await client.query(
        `UPDATE users
         SET name = COALESCE($1, name),
             email = COALESCE($2, email)
         WHERE id = $3`,
        [data.name, data.email, userId]
      );
    }

    await client.query(
      `UPDATE farmer_profiles
       SET state            = COALESCE($1, state),
           district         = COALESCE($2, district),
           village          = COALESCE($3, village),
           pincode          = COALESCE($4, pincode),
           total_pond_area  = COALESCE($5, total_pond_area),
           experience_years = COALESCE($6, experience_years),
           community        = COALESCE($7, community),
           gender           = COALESCE($8, gender),
           bank_account     = COALESCE($9, bank_account),
           ifsc_code        = COALESCE($10, ifsc_code)
       WHERE user_id = $11`,
      [
        data.state, data.district, data.village, data.pincode,
        data.total_pond_area, data.experience_years,
        data.community, data.gender,
        data.bank_account, data.ifsc_code,
        userId,
      ]
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

// ── Ponds ─────────────────────────────────────────────────────────────────────

const getPonds = async (userId) => {
  const { rows } = await query(
    `SELECT p.*
     FROM ponds p
     JOIN farmer_profiles fp ON fp.id = p.farmer_id
     WHERE fp.user_id = $1
     ORDER BY p.created_at DESC`,
    [userId]
  );
  return rows;
};

const createPond = async (userId, data) => {
  const { rows: fp } = await query(
    'SELECT id FROM farmer_profiles WHERE user_id = $1',
    [userId]
  );
  if (!fp.length) throw new AppError('Farmer profile not found', 404);

  const { rows } = await query(
    `INSERT INTO ponds
       (farmer_id, name, area_acres, shrimp_variety, stocking_date, expected_harvest, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [
      fp[0].id, data.name, data.area_acres,
      data.shrimp_variety, data.stocking_date,
      data.expected_harvest, data.notes,
    ]
  );
  return rows[0];
};

const updatePond = async (userId, pondId, data) => {
  // Verify ownership
  const { rows: check } = await query(
    `SELECT p.id FROM ponds p
     JOIN farmer_profiles fp ON fp.id = p.farmer_id
     WHERE p.id = $1 AND fp.user_id = $2`,
    [pondId, userId]
  );
  if (!check.length) throw new AppError('Pond not found', 404);

  const { rows } = await query(
    `UPDATE ponds
     SET name            = COALESCE($1, name),
         area_acres      = COALESCE($2, area_acres),
         shrimp_variety  = COALESCE($3, shrimp_variety),
         stocking_date   = COALESCE($4, stocking_date),
         expected_harvest = COALESCE($5, expected_harvest),
         status          = COALESCE($6, status),
         notes           = COALESCE($7, notes)
     WHERE id = $8
     RETURNING *`,
    [
      data.name, data.area_acres, data.shrimp_variety,
      data.stocking_date, data.expected_harvest,
      data.status, data.notes, pondId,
    ]
  );
  return rows[0];
};

const deletePond = async (userId, pondId) => {
  const { rows: check } = await query(
    `SELECT p.id FROM ponds p
     JOIN farmer_profiles fp ON fp.id = p.farmer_id
     WHERE p.id = $1 AND fp.user_id = $2`,
    [pondId, userId]
  );
  if (!check.length) throw new AppError('Pond not found', 404);
  await query('DELETE FROM ponds WHERE id = $1', [pondId]);
};

// ── Orders ────────────────────────────────────────────────────────────────────

const getMyOrders = async (userId, { page = 1, limit = 20 } = {}) => {
  const offset = (page - 1) * limit;
  const { rows } = await query(
    `SELECT o.*, vp.business_name AS vendor_name,
            json_agg(json_build_object(
              'product_name', pr.name,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'subtotal', oi.subtotal
            )) AS items
     FROM orders o
     JOIN vendor_profiles vp ON vp.id = o.vendor_id
     JOIN order_items oi ON oi.order_id = o.id
     JOIN vendor_inventory vi ON vi.id = oi.inventory_id
     JOIN products pr ON pr.id = vi.product_id
     WHERE o.buyer_id = $1
     GROUP BY o.id, vp.business_name
     ORDER BY o.created_at DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );
  return rows;
};

module.exports = {
  getProfile, updateProfile,
  getPonds, createPond, updatePond, deletePond,
  getMyOrders,
};

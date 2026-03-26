const { query } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

// ── Overview analytics ────────────────────────────────────────────────────────

const getOverview = async () => {
  const [users, orders, revenue, ponds] = await Promise.all([
    query(`
      SELECT
        COUNT(*) FILTER (WHERE role = 'farmer') AS farmers,
        COUNT(*) FILTER (WHERE role = 'vendor') AS vendors,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS new_this_month
      FROM users
    `),
    query(`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE status = 'pending')   AS pending,
        COUNT(*) FILTER (WHERE status = 'delivered') AS delivered,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') AS this_month
      FROM orders
    `),
    query(`
      SELECT
        COALESCE(SUM(total_amount), 0) AS total_revenue,
        COALESCE(SUM(total_amount) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days'), 0) AS monthly_revenue
      FROM orders WHERE status = 'delivered'
    `),
    query(`
      SELECT
        COUNT(*) AS total_ponds,
        COUNT(*) FILTER (WHERE status = 'active') AS active_ponds
      FROM ponds
    `),
  ]);

  return {
    users: users.rows[0],
    orders: orders.rows[0],
    revenue: revenue.rows[0],
    ponds: ponds.rows[0],
  };
};

const getMonthlyRevenue = async (months = 12) => {
  const { rows } = await query(
    `SELECT
       TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
       DATE_TRUNC('month', created_at) AS month_date,
       COALESCE(SUM(total_amount), 0)::NUMERIC(14,2) AS revenue,
       COUNT(*) AS order_count
     FROM orders
     WHERE status = 'delivered'
       AND created_at >= NOW() - INTERVAL '${months} months'
     GROUP BY DATE_TRUNC('month', created_at)
     ORDER BY month_date ASC`
  );
  return rows;
};

const getTopProducts = async (limit = 10) => {
  const { rows } = await query(
    `SELECT
       p.name, p.category,
       SUM(oi.quantity) AS total_qty,
       SUM(oi.subtotal) AS total_revenue,
       COUNT(DISTINCT o.id) AS order_count
     FROM order_items oi
     JOIN vendor_inventory vi ON vi.id = oi.inventory_id
     JOIN products p ON p.id = vi.product_id
     JOIN orders o ON o.id = oi.order_id
     WHERE o.status != 'cancelled'
     GROUP BY p.id, p.name, p.category
     ORDER BY total_qty DESC
     LIMIT $1`,
    [limit]
  );
  return rows;
};

// ── User management ───────────────────────────────────────────────────────────

const listUsers = async ({ role, search, page = 1, limit = 20 } = {}) => {
  const conditions = [];
  const params = [];
  let i = 1;

  if (role) { conditions.push(`u.role = $${i++}`); params.push(role); }
  if (search) {
    conditions.push(`(u.name ILIKE $${i} OR u.phone ILIKE $${i} OR u.email ILIKE $${i})`);
    params.push(`%${search}%`); i++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const { rows } = await query(
    `SELECT u.id, u.phone, u.email, u.name, u.role, u.is_active, u.created_at,
            COUNT(*) OVER() AS total_count
     FROM users u
     ${where}
     ORDER BY u.created_at DESC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );

  const total = rows[0]?.total_count ?? 0;
  return {
    data: rows.map(({ total_count, ...r }) => r),
    pagination: { page, limit, total: parseInt(total, 10), pages: Math.ceil(total / limit) },
  };
};

const setUserStatus = async (userId, isActive) => {
  const { rows } = await query(
    `UPDATE users SET is_active = $1 WHERE id = $2 RETURNING id, phone, role, is_active`,
    [isActive, userId]
  );
  if (!rows.length) throw new AppError('User not found', 404);
  return rows[0];
};

const setUserRole = async (userId, role) => {
  const { rows } = await query(
    `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, phone, role`,
    [role, userId]
  );
  if (!rows.length) throw new AppError('User not found', 404);
  return rows[0];
};

const verifyVendor = async (vendorProfileId) => {
  const { rows } = await query(
    `UPDATE vendor_profiles SET is_verified = TRUE
     WHERE id = $1 RETURNING *`,
    [vendorProfileId]
  );
  if (!rows.length) throw new AppError('Vendor profile not found', 404);
  return rows[0];
};

// ── Order oversight ───────────────────────────────────────────────────────────

const listAllOrders = async ({ status, page = 1, limit = 20 } = {}) => {
  const conditions = [];
  const params = [];
  let i = 1;
  if (status) { conditions.push(`o.status = $${i++}`); params.push(status); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const { rows } = await query(
    `SELECT o.*, u.name AS buyer_name, u.phone AS buyer_phone,
            vp.business_name AS vendor_name,
            COUNT(*) OVER() AS total_count
     FROM orders o
     JOIN users u ON u.id = o.buyer_id
     JOIN vendor_profiles vp ON vp.id = o.vendor_id
     ${where}
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

module.exports = {
  getOverview, getMonthlyRevenue, getTopProducts,
  listUsers, setUserStatus, setUserRole, verifyVendor,
  listAllOrders,
};

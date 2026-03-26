const { query } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const list = async ({ category, search, page = 1, limit = 20 } = {}) => {
  const conditions = ['p.is_active = TRUE'];
  const params = [];
  let i = 1;

  if (category) {
    conditions.push(`p.category = $${i++}`);
    params.push(category);
  }
  if (search) {
    conditions.push(`(p.name ILIKE $${i} OR p.description ILIKE $${i})`);
    params.push(`%${search}%`);
    i++;
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const { rows } = await query(
    `SELECT p.*,
            COUNT(*) OVER() AS total_count
     FROM products p
     ${where}
     ORDER BY p.sort_order ASC, p.name ASC
     LIMIT $${i} OFFSET $${i + 1}`,
    [...params, limit, offset]
  );

  const total = rows[0]?.total_count ?? 0;
  return {
    data: rows.map(({ total_count, ...r }) => r),
    pagination: {
      page, limit,
      total: parseInt(total, 10),
      pages: Math.ceil(total / limit),
    },
  };
};

const getById = async (id) => {
  const { rows } = await query(
    `SELECT p.*,
            json_agg(json_build_object(
              'vendor_id',       vp.id,
              'business_name',   vp.business_name,
              'price_per_unit',  vi.price_per_unit,
              'unit',            vi.unit,
              'stock_qty',       vi.stock_qty,
              'min_order_qty',   vi.min_order_qty
            ) ORDER BY vi.price_per_unit ASC)
            FILTER (WHERE vp.id IS NOT NULL) AS vendors
     FROM products p
     LEFT JOIN vendor_inventory vi ON vi.product_id = p.id AND vi.is_available = TRUE
     LEFT JOIN vendor_profiles vp ON vp.id = vi.vendor_id AND vp.is_verified = TRUE
     WHERE p.id = $1 OR p.slug = $1
     GROUP BY p.id`,
    [id]
  );
  if (!rows.length) throw new AppError('Product not found', 404);
  return rows[0];
};

const create = async (data) => {
  const slug = data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const { rows } = await query(
    `INSERT INTO products (name, slug, category, description, features, image_url, sort_order)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING *`,
    [data.name, slug, data.category, data.description,
     JSON.stringify(data.features || []), data.image_url, data.sort_order || 0]
  );
  return rows[0];
};

const update = async (id, data) => {
  const { rows } = await query(
    `UPDATE products
     SET name        = COALESCE($1, name),
         category    = COALESCE($2, category),
         description = COALESCE($3, description),
         features    = COALESCE($4, features),
         image_url   = COALESCE($5, image_url),
         is_active   = COALESCE($6, is_active),
         sort_order  = COALESCE($7, sort_order)
     WHERE id = $8
     RETURNING *`,
    [data.name, data.category, data.description,
     data.features ? JSON.stringify(data.features) : null,
     data.image_url, data.is_active, data.sort_order, id]
  );
  if (!rows.length) throw new AppError('Product not found', 404);
  return rows[0];
};

module.exports = { list, getById, create, update };

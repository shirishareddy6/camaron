const { query, getClient } = require('../config/database');
const { AppError } = require('../middleware/errorHandler');

const placeOrder = async (buyerId, { vendor_id, items, delivery_address, notes }) => {
  if (!items || !items.length) throw new AppError('Order must have at least one item', 400);

  const client = await getClient();
  try {
    await client.query('BEGIN');

    // Validate inventory and compute total
    let totalAmount = 0;
    const resolvedItems = [];

    for (const item of items) {
      const { rows } = await client.query(
        `SELECT vi.id, vi.stock_qty, vi.price_per_unit, vi.min_order_qty, vi.vendor_id,
                p.name AS product_name
         FROM vendor_inventory vi
         JOIN products p ON p.id = vi.product_id
         WHERE vi.id = $1 AND vi.is_available = TRUE
         FOR UPDATE`,
        [item.inventory_id]
      );
      if (!rows.length) throw new AppError(`Inventory item ${item.inventory_id} not found`, 400);
      const inv = rows[0];

      if (inv.stock_qty < item.quantity) {
        throw new AppError(`Insufficient stock for ${inv.product_name}`, 400);
      }
      if (item.quantity < inv.min_order_qty) {
        throw new AppError(`Minimum order for ${inv.product_name} is ${inv.min_order_qty}`, 400);
      }

      totalAmount += inv.price_per_unit * item.quantity;
      resolvedItems.push({ ...item, unit_price: inv.price_per_unit, inventory: inv });
    }

    // Insert order
    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (buyer_id, vendor_id, total_amount, delivery_address, notes)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [buyerId, vendor_id, totalAmount, delivery_address, notes]
    );
    const order = orderRows[0];

    // Insert items + deduct stock
    for (const item of resolvedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, inventory_id, quantity, unit_price)
         VALUES ($1,$2,$3,$4)`,
        [order.id, item.inventory_id, item.quantity, item.unit_price]
      );
      await client.query(
        `UPDATE vendor_inventory SET stock_qty = stock_qty - $1 WHERE id = $2`,
        [item.quantity, item.inventory_id]
      );
    }

    await client.query('COMMIT');

    const { rows: full } = await query(
      `SELECT o.*,
              json_agg(json_build_object(
                'product_name', pr.name,
                'quantity', oi.quantity,
                'unit_price', oi.unit_price,
                'subtotal', oi.subtotal
              )) AS items
       FROM orders o
       JOIN order_items oi ON oi.order_id = o.id
       JOIN vendor_inventory vi ON vi.id = oi.inventory_id
       JOIN products pr ON pr.id = vi.product_id
       WHERE o.id = $1
       GROUP BY o.id`,
      [order.id]
    );
    return full[0];
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const getOrderById = async (orderId, userId) => {
  const { rows } = await query(
    `SELECT o.*,
            json_agg(json_build_object(
              'product_name', pr.name,
              'quantity', oi.quantity,
              'unit_price', oi.unit_price,
              'subtotal', oi.subtotal
            )) AS items
     FROM orders o
     JOIN order_items oi ON oi.order_id = o.id
     JOIN vendor_inventory vi ON vi.id = oi.inventory_id
     JOIN products pr ON pr.id = vi.product_id
     WHERE o.id = $1 AND (o.buyer_id = $2 OR EXISTS (
       SELECT 1 FROM vendor_profiles vp WHERE vp.id = o.vendor_id AND vp.user_id = $2
     ))
     GROUP BY o.id`,
    [orderId, userId]
  );
  if (!rows.length) throw new AppError('Order not found', 404);
  return rows[0];
};

module.exports = { placeOrder, getOrderById };

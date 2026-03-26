// vendor/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { vendorApi } from '../../services/api';
import { StatCard, PageHeader, Card, Badge, EmptyState, Spinner } from '../../components/common/UI';
import styles from '../DashPages.module.css';

export function VendorDashboard() {
  const [inventory, setInventory] = useState([]);
  const [orders,    setOrders]    = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([vendorApi.listInventory({ limit: 5 }), vendorApi.getOrders({ limit: 5 })])
      .then(([inv, ord]) => {
        setInventory(inv.data.data || []);
        setOrders(ord.data.data   || []);
      }).finally(() => setLoading(false));
  }, []);

  const pendingOrders  = orders.filter((o) => o.status === 'pending').length;
  const totalStock     = inventory.reduce((a, i) => a + (i.stock_qty || 0), 0);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size="lg" /></div>;

  return (
    <div>
      <PageHeader title="Vendor Dashboard" subtitle="Manage your inventory and incoming orders." />
      <div className={styles.statsGrid}>
        <StatCard label="Products Listed" value={inventory.length} icon="📋" color="teal" />
        <StatCard label="Total Stock (units)" value={totalStock} icon="📦" color="blue" />
        <StatCard label="Pending Orders" value={pendingOrders} icon="⏳" color="gold" />
        <StatCard label="Total Orders" value={orders.length} icon="✅" color="green" />
      </div>
      <div className={styles.twoCol}>
        <Card>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Recent Inventory</h3>
            <Link to="/vendor/inventory" className={styles.viewAll}>Manage →</Link>
          </div>
          {inventory.length === 0
            ? <EmptyState icon="📋" title="No inventory" description="Add products to start receiving orders." />
            : <div className={styles.itemList}>
                {inventory.map((item) => (
                  <div key={item.id} className={styles.listItem}>
                    <div className={styles.listMain}>
                      <div className={styles.listName}>{item.product_name}</div>
                      <div className={styles.listMeta}>₹{item.price_per_unit}/{item.unit} · {item.stock_qty} in stock</div>
                    </div>
                    <Badge variant={item.is_available ? 'success' : 'error'}>
                      {item.is_available ? 'Listed' : 'Hidden'}
                    </Badge>
                  </div>
                ))}
              </div>
          }
        </Card>
        <Card>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Recent Orders</h3>
            <Link to="/vendor/orders" className={styles.viewAll}>View All →</Link>
          </div>
          {orders.length === 0
            ? <EmptyState icon="📦" title="No orders yet" description="Orders from farmers will appear here." />
            : <div className={styles.itemList}>
                {orders.map((o) => (
                  <div key={o.id} className={styles.listItem}>
                    <div className={styles.listMain}>
                      <div className={styles.listName}>{o.order_number}</div>
                      <div className={styles.listMeta}>{o.buyer_name} · ₹{parseFloat(o.total_amount).toLocaleString('en-IN')}</div>
                    </div>
                    <Badge variant={o.status==='delivered'?'success':o.status==='cancelled'?'error':'warning'}>{o.status}</Badge>
                  </div>
                ))}
              </div>
          }
        </Card>
      </div>
    </div>
  );
}

export default VendorDashboard;

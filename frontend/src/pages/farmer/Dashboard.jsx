import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUser } from '../../store/slices/authSlice';
import { farmerApi } from '../../services/api';
import { StatCard, PageHeader, Card, Badge, EmptyState, Spinner } from '../../components/common/UI';
import styles from '../DashPages.module.css';

export default function FarmerDashboard() {
  const user    = useSelector(selectUser);
  const [ponds,  setPonds]  = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([farmerApi.getPonds(), farmerApi.getOrders({ limit: 5 })])
      .then(([p, o]) => {
        setPonds(p.data.data || []);
        setOrders(o.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const activePonds    = ponds.filter((p) => p.status === 'active').length;
  const pendingOrders  = orders.filter((o) => o.status === 'pending').length;

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size="lg" /></div>;

  return (
    <div>
      <PageHeader
        title={`Welcome back${user?.name ? ', ' + user.name : ''} 🌊`}
        subtitle="Here's an overview of your aquaculture operations today."
      />

      {/* Stats */}
      <div className={styles.statsGrid}>
        <StatCard label="Total Ponds"   value={ponds.length}  icon="🌊" color="teal" />
        <StatCard label="Active Ponds"  value={activePonds}   icon="✅" color="green" />
        <StatCard label="Pending Orders" value={pendingOrders} icon="📦" color="gold" />
        <StatCard label="Total Orders"  value={orders.length} icon="📋" color="blue" />
      </div>

      <div className={styles.twoCol}>
        {/* Ponds */}
        <Card>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>My Ponds</h3>
            <Link to="/farmer/ponds" className={styles.viewAll}>Manage →</Link>
          </div>
          {ponds.length === 0 ? (
            <EmptyState icon="🌊" title="No ponds yet" description="Add your first pond to start tracking.">
              <Link to="/farmer/ponds"><button className={styles.addBtn}>+ Add Pond</button></Link>
            </EmptyState>
          ) : (
            <div className={styles.itemList}>
              {ponds.slice(0, 5).map((pond) => (
                <div key={pond.id} className={styles.listItem}>
                  <div className={styles.listMain}>
                    <div className={styles.listName}>{pond.name}</div>
                    <div className={styles.listMeta}>
                      {pond.shrimp_variety || 'Unknown variety'} · {pond.area_acres || '—'} acres
                    </div>
                  </div>
                  <Badge variant={pond.status === 'active' ? 'success' : pond.status === 'harvested' ? 'teal' : 'default'}>
                    {pond.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Orders */}
        <Card>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Recent Orders</h3>
            <Link to="/farmer/orders" className={styles.viewAll}>View All →</Link>
          </div>
          {orders.length === 0 ? (
            <EmptyState icon="📦" title="No orders yet" description="Browse the catalogue and place your first order.">
              <Link to="/products"><button className={styles.addBtn}>Browse Products</button></Link>
            </EmptyState>
          ) : (
            <div className={styles.itemList}>
              {orders.map((order) => (
                <div key={order.id} className={styles.listItem}>
                  <div className={styles.listMain}>
                    <div className={styles.listName}>{order.order_number}</div>
                    <div className={styles.listMeta}>{order.vendor_name} · ₹{parseFloat(order.total_amount).toLocaleString('en-IN')}</div>
                  </div>
                  <Badge variant={
                    order.status === 'delivered' ? 'success' :
                    order.status === 'cancelled' ? 'error' :
                    order.status === 'shipped'   ? 'teal' : 'warning'
                  }>{order.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

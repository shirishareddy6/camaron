import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../services/api';
import { PageHeader, Table, Badge, Spinner, EmptyState } from '../../components/common/UI';
import styles from '../DashPages.module.css';

const STATUS_VARIANT = {
  pending:   'warning',
  confirmed: 'teal',
  shipped:   'teal',
  delivered: 'success',
  cancelled: 'error',
};

export default function AdminOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [status,  setStatus]  = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.listOrders({ status: status || undefined, limit: 200 });
      setOrders(data.data || []);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: 'order_number', label: 'Order #',  width: 140 },
    { key: 'buyer_name',   label: 'Farmer',   render: (v, r) => v || r.buyer_phone },
    { key: 'vendor_name',  label: 'Vendor' },
    { key: 'total_amount', label: 'Amount',   render: (v) => `₹${parseFloat(v).toLocaleString('en-IN')}` },
    { key: 'status',       label: 'Status',   render: (v) => <Badge variant={STATUS_VARIANT[v] || 'default'}>{v}</Badge> },
    { key: 'created_at',   label: 'Date',     render: (v) => new Date(v).toLocaleDateString('en-IN') },
  ];

  return (
    <div>
      <PageHeader
        title="All Orders"
        subtitle={`${orders.length} order${orders.length !== 1 ? 's' : ''}`}
      />

      <div className={styles.tableHeader}>
        <select
          className={styles.searchBox}
          style={{ maxWidth: 200 }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          {['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'].map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><Spinner /></div>
      ) : orders.length === 0 ? (
        <EmptyState icon="📦" title="No orders found" description="Orders will appear here once farmers start purchasing." />
      ) : (
        <Table columns={columns} data={orders} loading={false} />
      )}
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { farmerApi } from '../../services/api';
import { PageHeader, Table, Badge, Spinner, EmptyState } from '../../components/common/UI';

const statusVariant = (s) => ({ delivered:'success', cancelled:'error', shipped:'teal', confirmed:'teal', pending:'warning' }[s] || 'default');

export default function FarmerOrders() {
  const [orders,  setOrders]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    farmerApi.getOrders({ limit: 50 })
      .then(({ data }) => setOrders(data.data || []))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { key: 'order_number', label: 'Order #', width: 140 },
    { key: 'vendor_name',  label: 'Vendor' },
    { key: 'total_amount', label: 'Amount', render: (v) => `₹${parseFloat(v).toLocaleString('en-IN')}` },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={statusVariant(v)}>{v}</Badge> },
    { key: 'created_at', label: 'Date', render: (v) => new Date(v).toLocaleDateString('en-IN') },
  ];

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner /></div>;

  return (
    <div>
      <PageHeader title="My Orders" subtitle={`${orders.length} order${orders.length !== 1 ? 's' : ''} total`} />
      {orders.length === 0
        ? <EmptyState icon="📦" title="No orders yet" description="Browse the catalogue to place your first order." />
        : <Table columns={columns} data={orders} loading={false} />
      }
    </div>
  );
}

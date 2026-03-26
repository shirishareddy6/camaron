import React, { useEffect, useState, useCallback } from 'react';
import { vendorApi } from '../../services/api';
import { PageHeader, Table, Badge, Button, Select, Spinner, EmptyState } from '../../components/common/UI';
import { useToast } from '../../hooks';

const STATUS_VARIANT = { pending:'warning', confirmed:'teal', shipped:'blue', delivered:'success', cancelled:'error' };
const NEXT_STATUS = { pending:'confirmed', confirmed:'shipped', shipped:'delivered' };

export default function VendorOrders() {
  const toast = useToast();
  const [orders,  setOrders]  = useState([]);
  const [filter,  setFilter]  = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await vendorApi.getOrders({ status: filter || undefined, limit: 100 });
      setOrders(data.data || []);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const advance = async (order) => {
    const next = NEXT_STATUS[order.status];
    if (!next) return;
    setUpdating(order.id);
    try {
      await vendorApi.updateOrderStatus(order.id, next);
      toast.success(`Order marked as ${next}`);
      setOrders((prev) => prev.map((o) => o.id === order.id ? { ...o, status: next } : o));
    } catch {
      toast.error('Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const columns = [
    { key: 'order_number', label: 'Order #', width: 140 },
    { key: 'buyer_name',   label: 'Farmer' },
    { key: 'buyer_phone',  label: 'Phone' },
    { key: 'total_amount', label: 'Amount', render: (v) => `₹${parseFloat(v).toLocaleString('en-IN')}` },
    { key: 'status', label: 'Status', render: (v) => <Badge variant={STATUS_VARIANT[v] || 'default'}>{v}</Badge> },
    { key: 'created_at', label: 'Date', render: (v) => new Date(v).toLocaleDateString('en-IN') },
    { key: 'id', label: 'Action', render: (_, row) => {
      const next = NEXT_STATUS[row.status];
      if (!next) return <span style={{ color:'var(--text-muted)', fontSize:12 }}>—</span>;
      return (
        <Button size="sm" loading={updating === row.id} onClick={() => advance(row)}>
          Mark {next}
        </Button>
      );
    }},
  ];

  return (
    <div>
      <PageHeader title="Orders" subtitle="Manage incoming orders from farmers." />

      <div style={{ marginBottom:20 }}>
        <Select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ maxWidth:200 }}>
          <option value="">All Statuses</option>
          {['pending','confirmed','shipped','delivered','cancelled'].map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner /></div>
      ) : orders.length === 0 ? (
        <EmptyState icon="📦" title="No orders found" description="Orders placed by farmers will appear here." />
      ) : (
        <Table columns={columns} data={orders} loading={false} />
      )}
    </div>
  );
}

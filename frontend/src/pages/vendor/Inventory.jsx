import React, { useEffect, useState, useCallback } from 'react';
import { vendorApi, productApi } from '../../services/api';
import { PageHeader, Table, Button, Modal, Input, Select, Badge, Spinner, EmptyState } from '../../components/common/UI';
import { useToast } from '../../hooks';
import styles from '../DashPages.module.css';

const BLANK = { product_id: '', price_per_unit: '', unit: 'kg', stock_qty: '', min_order_qty: '1' };

export default function VendorInventory() {
  const toast   = useToast();
  const [items,     setItems]     = useState([]);
  const [products,  setProducts]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [modal,     setModal]     = useState(false);
  const [editing,   setEditing]   = useState(null);
  const [form,      setForm]      = useState(BLANK);
  const [saving,    setSaving]    = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [inv, prods] = await Promise.all([
        vendorApi.listInventory({ limit: 100 }),
        productApi.list({ limit: 100 }),
      ]);
      setItems(inv.data.data     || []);
      setProducts(prods.data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setEditing(null); setForm(BLANK); setModal(true); };
  const openEdit = (item) => {
    setEditing(item);
    setForm({
      product_id:     item.product_id,
      price_per_unit: item.price_per_unit,
      unit:           item.unit,
      stock_qty:      item.stock_qty,
      min_order_qty:  item.min_order_qty,
      is_available:   item.is_available,
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.product_id) { toast.error('Select a product'); return; }
    if (!form.price_per_unit || +form.price_per_unit <= 0) { toast.error('Enter a valid price'); return; }
    setSaving(true);
    try {
      if (editing) {
        await vendorApi.updateInventory(editing.id, form);
        toast.success('Inventory updated');
      } else {
        await vendorApi.addInventory(form);
        toast.success('Product added to inventory');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this item from inventory?')) return;
    try {
      await vendorApi.removeInventory(id);
      toast.success('Item removed');
      setItems((prev) => prev.filter((x) => x.id !== id));
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const toggleAvail = async (item) => {
    try {
      await vendorApi.updateInventory(item.id, { is_available: !item.is_available });
      setItems((prev) => prev.map((x) => x.id === item.id ? { ...x, is_available: !x.is_available } : x));
    } catch {
      toast.error('Update failed');
    }
  };

  const field = (key) => ({
    value: form[key] ?? '',
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const columns = [
    { key: 'product_name',  label: 'Product' },
    { key: 'category',      label: 'Category', render: (v) => <Badge variant="teal">{v?.replace('_',' ')}</Badge> },
    { key: 'price_per_unit', label: 'Price', render: (v, r) => `₹${parseFloat(v).toLocaleString('en-IN')} / ${r.unit}` },
    { key: 'stock_qty',     label: 'Stock' },
    { key: 'min_order_qty', label: 'Min Order' },
    { key: 'is_available',  label: 'Status',
      render: (v, row) => (
        <button onClick={() => toggleAvail(row)} style={{ cursor:'pointer', background:'none', border:'none' }}>
          <Badge variant={v ? 'success' : 'error'}>{v ? 'Listed' : 'Hidden'}</Badge>
        </button>
      )
    },
    { key: 'id', label: 'Actions', render: (_, row) => (
      <div style={{ display:'flex', gap:6 }}>
        <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>Edit</Button>
        <Button variant="danger"    size="sm" onClick={() => handleRemove(row.id)}>Remove</Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader
        title="My Inventory"
        subtitle={`${items.length} product${items.length !== 1 ? 's' : ''} listed`}
        action={<Button onClick={openAdd}>+ Add Product</Button>}
      />

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size="lg" /></div>
      ) : items.length === 0 ? (
        <EmptyState icon="📋" title="No inventory yet" description="Add products to make them available to farmers."
          action={<Button onClick={openAdd}>+ Add Product</Button>} />
      ) : (
        <Table columns={columns} data={items} loading={false} />
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Edit Inventory Item' : 'Add Product to Inventory'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>{editing ? 'Save' : 'Add'}</Button>
          </>
        }
      >
        <div className={styles.formGrid}>
          {!editing && (
            <div className={styles.formFull}>
              <Select label="Product *" value={form.product_id} onChange={(e) => setForm((f) => ({ ...f, product_id: e.target.value }))}>
                <option value="">Select a product</option>
                {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </div>
          )}
          <Input label="Price per unit (₹) *" type="number" step="0.01" placeholder="250.00" {...field('price_per_unit')} />
          <Select label="Unit *" {...field('unit')}>
            <option value="kg">kg</option>
            <option value="bag">bag (25 kg)</option>
            <option value="litre">litre</option>
            <option value="piece">piece</option>
          </Select>
          <Input label="Stock Quantity *" type="number" min="0" placeholder="500" {...field('stock_qty')} />
          <Input label="Min Order Qty"    type="number" min="1" placeholder="1"   {...field('min_order_qty')} />
        </div>
      </Modal>
    </div>
  );
}

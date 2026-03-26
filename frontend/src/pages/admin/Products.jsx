// admin/Products.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { adminApi, productApi } from '../../services/api';
import { PageHeader, Table, Badge, Button, Modal, Input, Select, Spinner } from '../../components/common/UI';
import { useToast } from '../../hooks';
import { fetchProducts } from '../../store/slices/productSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectProducts, selectProductLoading } from '../../store/slices/productSlice';
import styles from '../DashPages.module.css';

const BLANK = { name:'', category:'feed', description:'', features:'', image_url:'', sort_order:0 };

export function AdminProducts() {
  const dispatch  = useDispatch();
  const products  = useSelector(selectProducts);
  const loading   = useSelector(selectProductLoading);
  const toast     = useToast();
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form,    setForm]    = useState(BLANK);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => { dispatch(fetchProducts({ limit: 100 })); }, [dispatch]);

  const openAdd  = () => { setEditing(null); setForm(BLANK); setModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ ...p, features: Array.isArray(p.features) ? p.features.join('\n') : '' });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Product name required'); return; }
    setSaving(true);
    const payload = { ...form, features: form.features ? form.features.split('\n').filter(Boolean) : [] };
    try {
      if (editing) {
        await productApi.update(editing.id, payload);
        toast.success('Product updated');
      } else {
        await productApi.create(payload);
        toast.success('Product created');
      }
      setModal(false);
      dispatch(fetchProducts({ limit: 100 }));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (p) => {
    try {
      await productApi.update(p.id, { is_active: !p.is_active });
      toast.success(`Product ${p.is_active ? 'hidden' : 'listed'}`);
      dispatch(fetchProducts({ limit: 100 }));
    } catch { toast.error('Update failed'); }
  };

  const field = (key) => ({
    value: form[key] ?? '',
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const columns = [
    { key: 'name',      label: 'Name' },
    { key: 'category',  label: 'Category', render: (v) => <Badge variant="teal">{v?.replace('_',' ')}</Badge> },
    { key: 'is_active', label: 'Status', render: (v) => <Badge variant={v?'success':'error'}>{v?'Active':'Hidden'}</Badge> },
    { key: 'sort_order', label: 'Order' },
    { key: 'id', label: 'Actions', render: (_, row) => (
      <div style={{ display:'flex', gap:6 }}>
        <Button variant="secondary" size="sm" onClick={() => openEdit(row)}>Edit</Button>
        <Button variant={row.is_active?'danger':'secondary'} size="sm" onClick={() => toggleActive(row)}>
          {row.is_active ? 'Hide' : 'Show'}
        </Button>
      </div>
    )},
  ];

  return (
    <div>
      <PageHeader title="Products" subtitle="Manage the feed and health care catalogue."
        action={<Button onClick={openAdd}>+ New Product</Button>} />
      {loading
        ? <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner /></div>
        : <Table columns={columns} data={products} loading={false} />
      }
      <Modal open={modal} onClose={() => setModal(false)}
        title={editing ? 'Edit Product' : 'New Product'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>{editing ? 'Save' : 'Create'}</Button>
          </>
        }
      >
        <div className={styles.formGrid}>
          <div className={styles.formFull}><Input label="Name *" {...field('name')} /></div>
          <Select label="Category *" {...field('category')}>
            <option value="feed">Feed</option>
            <option value="health_care">Health Care</option>
            <option value="equipment">Equipment</option>
            <option value="other">Other</option>
          </Select>
          <Input label="Sort Order" type="number" {...field('sort_order')} />
          <div className={styles.formFull}><Input label="Description" {...field('description')} /></div>
          <div className={styles.formFull}><Input label="Image URL" {...field('image_url')} /></div>
          <div className={styles.formFull}>
            <Input label="Features (one per line)" placeholder="Feature 1&#10;Feature 2" {...field('features')} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default AdminProducts;

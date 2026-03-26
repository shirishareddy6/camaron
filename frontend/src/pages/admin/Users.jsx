import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../services/api';
import { PageHeader, Table, Badge, Button, Modal, Input, Select, Spinner, EmptyState } from '../../components/common/UI';
import { useToast } from '../../hooks';
import styles from '../DashPages.module.css';

const BLANK = { phone: '', name: '', role: 'farmer', email: '' };

export default function AdminUsers() {
  const toast = useToast();
  const [users,    setUsers]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [search,   setSearch]  = useState('');
  const [roleFilter, setRole]  = useState('');
  const [updating, setUpdating] = useState(null);
  const [modal,    setModal]   = useState(false);
  const [form,     setForm]    = useState(BLANK);
  const [saving,   setSaving]  = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.listUsers({ search, role: roleFilter || undefined, limit: 100 });
      setUsers(data.data || []);
    } finally { setLoading(false); }
  }, [search, roleFilter]);

  useEffect(() => { load(); }, [load]);

  const toggleStatus = async (user) => {
    setUpdating(user.id);
    try {
      await adminApi.setUserStatus(user.id, !user.is_active);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
    } catch { toast.error('Update failed'); }
    finally { setUpdating(null); }
  };

  const changeRole = async (user, newRole) => {
    try {
      await adminApi.setUserRole(user.id, newRole);
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, role: newRole } : u));
      toast.success(`Role changed to ${newRole}`);
    } catch { toast.error('Role change failed'); }
  };

  const handleCreate = async () => {
    if (!form.phone || !form.name) { toast.error('Phone and name are required'); return; }
    setSaving(true);
    try {
      await adminApi.listUsers({ search: form.phone });
      const res = await fetch('/api/v1/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success(`User ${form.name} created as ${form.role}`);
      setModal(false);
      setForm(BLANK);
      load();
    } catch (err) { toast.error(err.message || 'Failed to create user'); }
    finally { setSaving(false); }
  };

  const f = (key) => ({
    value: form[key] || '',
    onChange: (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  const columns = [
    { key: 'name',      label: 'Name',   render: (v, r) => <span style={{ fontWeight:600, color:'var(--text-primary)' }}>{v || '—'}</span> },
    { key: 'phone',     label: 'Phone' },
    { key: 'email',     label: 'Email',  render: (v) => v || '—' },
    { key: 'role',      label: 'Role',
      render: (v, row) => (
        <select
          value={v}
          onChange={(e) => changeRole(row, e.target.value)}
          style={{ background:'var(--bg-input)', border:'1px solid var(--border-subtle)', borderRadius:6, padding:'4px 8px', fontSize:12, color:'var(--text-primary)', cursor:'pointer' }}
        >
          <option value="farmer">farmer</option>
          <option value="vendor">vendor</option>
          <option value="admin">admin</option>
        </select>
      )
    },
    { key: 'is_active', label: 'Status', render: (v) => <Badge variant={v ? 'success' : 'error'}>{v ? 'Active' : 'Inactive'}</Badge> },
    { key: 'created_at', label: 'Joined', render: (v) => new Date(v).toLocaleDateString('en-IN') },
    { key: 'id', label: 'Actions', render: (_, row) => (
      <Button size="sm" variant={row.is_active ? 'danger' : 'secondary'}
        loading={updating === row.id} onClick={() => toggleStatus(row)}>
        {row.is_active ? 'Deactivate' : 'Activate'}
      </Button>
    )},
  ];

  return (
    <div>
      <PageHeader title="User Management"
        subtitle={`${users.length} users`}
        action={<Button onClick={() => { setForm(BLANK); setModal(true); }}>+ Add User</Button>}
      />

      <div className={styles.tableHeader}>
        <input className={styles.searchBox} placeholder="Search by name or phone..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={styles.searchBox} style={{ maxWidth:160 }}
          value={roleFilter} onChange={(e) => setRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="farmer">Farmer</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading
        ? <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner /></div>
        : users.length === 0
          ? <EmptyState icon="👥" title="No users found" />
          : <Table columns={columns} data={users} loading={false} />
      }

      <Modal open={modal} onClose={() => setModal(false)} title="Add New User"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleCreate}>Create User</Button>
          </>
        }
      >
        <div className={styles.formGrid}>
          <Input label="Phone Number *" placeholder="+919876543210" {...f('phone')} />
          <Input label="Full Name *"    placeholder="Full name"     {...f('name')} />
          <Input label="Email"          type="email" placeholder="user@email.com" {...f('email')} />
          <Select label="Role *"        value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))}>
            <option value="farmer">Farmer</option>
            <option value="vendor">Vendor</option>
            <option value="admin">Admin</option>
          </Select>
        </div>
        <p style={{ fontSize:12, color:'var(--text-muted)', marginTop:14 }}>
          User will log in using their phone number + OTP. No password needed.
        </p>
      </Modal>
    </div>
  );
}

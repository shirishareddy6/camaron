// admin/Users.jsx
import React, { useEffect, useState, useCallback } from 'react';
import { adminApi } from '../../services/api';
import { PageHeader, Table, Badge, Button, Spinner, EmptyState } from '../../components/common/UI';
import { useToast } from '../../hooks';
import styles from '../DashPages.module.css';

export function AdminUsers() {
  const toast = useToast();
  const [users,    setUsers]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [search,   setSearch]  = useState('');
  const [roleFilter, setRole]  = useState('');
  const [updating, setUpdating] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminApi.listUsers({ search, role: roleFilter || undefined, limit: 100 });
      setUsers(data.data || []);
    } finally {
      setLoading(false);
    }
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

  const columns = [
    { key: 'name',       label: 'Name',  render: (v, r) => v || r.phone },
    { key: 'phone',      label: 'Phone' },
    { key: 'email',      label: 'Email', render: (v) => v || '—' },
    { key: 'role',       label: 'Role',  render: (v) => <Badge variant={v==='admin'?'gold':v==='vendor'?'teal':'default'}>{v}</Badge> },
    { key: 'is_active',  label: 'Status', render: (v) => <Badge variant={v?'success':'error'}>{v?'Active':'Inactive'}</Badge> },
    { key: 'created_at', label: 'Joined', render: (v) => new Date(v).toLocaleDateString('en-IN') },
    { key: 'id', label: 'Actions', render: (_, row) => (
      <Button size="sm" variant={row.is_active?'danger':'secondary'}
        loading={updating === row.id}
        onClick={() => toggleStatus(row)}
      >
        {row.is_active ? 'Deactivate' : 'Activate'}
      </Button>
    )},
  ];

  return (
    <div>
      <PageHeader title="User Management" subtitle={`${users.length} users`} />
      <div className={styles.tableHeader}>
        <input className={styles.searchBox} placeholder="Search by name, phone or email..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={styles.searchBox} style={{ maxWidth:160 }}
          value={roleFilter} onChange={(e) => setRole(e.target.value)}>
          <option value="">All Roles</option>
          <option value="farmer">Farmer</option>
          <option value="vendor">Vendor</option>
          <option value="admin">Admin</option>
        </select>
      </div>
      {loading ? <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner /></div>
        : users.length === 0 ? <EmptyState icon="👥" title="No users found" />
        : <Table columns={columns} data={users} loading={false} />
      }
    </div>
  );
}

export default AdminUsers;

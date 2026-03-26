import React, { useEffect, useState, useCallback } from 'react';
import { farmerApi } from '../../services/api';
import { PageHeader, Button, Card, Badge, Modal, Input, Select, EmptyState, Spinner } from '../../components/common/UI';
import { useToast } from '../../hooks';
import styles from '../DashPages.module.css';

const BLANK = { name: '', area_acres: '', shrimp_variety: 'vannamei', stocking_date: '', expected_harvest: '', notes: '' };

export default function FarmerPonds() {
  const toast = useToast();
  const [ponds,   setPonds]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(false);
  const [editing, setEditing] = useState(null); // pond object
  const [form,    setForm]    = useState(BLANK);
  const [saving,  setSaving]  = useState(false);
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await farmerApi.getPonds();
      setPonds(data.data || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setEditing(null); setForm(BLANK); setModal(true); };
  const openEdit = (pond) => {
    setEditing(pond);
    setForm({
      name:             pond.name || '',
      area_acres:       pond.area_acres || '',
      shrimp_variety:   pond.shrimp_variety || 'vannamei',
      stocking_date:    pond.stocking_date?.slice(0,10) || '',
      expected_harvest: pond.expected_harvest?.slice(0,10) || '',
      notes:            pond.notes || '',
      status:           pond.status || 'active',
    });
    setModal(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Pond name is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await farmerApi.updatePond(editing.id, form);
        toast.success('Pond updated successfully');
      } else {
        await farmerApi.createPond(form);
        toast.success('Pond created successfully');
      }
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save pond');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pond? This cannot be undone.')) return;
    setDeleting(id);
    try {
      await farmerApi.deletePond(id);
      toast.success('Pond deleted');
      setPonds((p) => p.filter((x) => x.id !== id));
    } catch {
      toast.error('Failed to delete pond');
    } finally {
      setDeleting(null);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  return (
    <div>
      <PageHeader
        title="My Ponds"
        subtitle={`${ponds.length} pond${ponds.length !== 1 ? 's' : ''} registered`}
        action={<Button onClick={openAdd}>+ Add Pond</Button>}
      />

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size="lg" /></div>
      ) : ponds.length === 0 ? (
        <EmptyState icon="🌊" title="No ponds yet" description="Register your first pond to start tracking growth cycles."
          action={<Button onClick={openAdd}>+ Add Pond</Button>} />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px,1fr))', gap:16 }}>
          {ponds.map((pond) => (
            <Card key={pond.id}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                <h3 style={{ fontSize:17, fontWeight:700, color:'var(--white)' }}>{pond.name}</h3>
                <Badge variant={pond.status === 'active' ? 'success' : pond.status === 'harvested' ? 'teal' : 'default'}>
                  {pond.status}
                </Badge>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:20 }}>
                {[
                  ['🦐 Variety',   pond.shrimp_variety || '—'],
                  ['📐 Area',      pond.area_acres ? `${pond.area_acres} acres` : '—'],
                  ['📅 Stocked',   pond.stocking_date?.slice(0,10) || '—'],
                  ['🎯 Harvest',   pond.expected_harvest?.slice(0,10) || '—'],
                ].map(([label, val]) => (
                  <div key={label} style={{ display:'flex', justifyContent:'space-between', fontSize:13 }}>
                    <span style={{ color:'var(--text-muted)' }}>{label}</span>
                    <span style={{ color:'var(--text-secondary)', fontWeight:500 }}>{val}</span>
                  </div>
                ))}
              </div>
              {pond.notes && <p style={{ fontSize:12, color:'var(--text-muted)', marginBottom:16, lineHeight:1.5 }}>{pond.notes}</p>}
              <div style={{ display:'flex', gap:8 }}>
                <Button variant="secondary" size="sm" onClick={() => openEdit(pond)}>Edit</Button>
                <Button variant="danger" size="sm" loading={deleting === pond.id} onClick={() => handleDelete(pond.id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editing ? 'Edit Pond' : 'Add New Pond'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>{editing ? 'Save Changes' : 'Create Pond'}</Button>
          </>
        }
      >
        <div className={styles.formGrid}>
          <div className={styles.formFull}><Input label="Pond Name *" placeholder="e.g. Pond A" {...field('name')} /></div>
          <Input label="Area (acres)" type="number" step="0.1" placeholder="2.5" {...field('area_acres')} />
          <Select label="Shrimp Variety" {...field('shrimp_variety')}>
            <option value="vannamei">Vannamei</option>
            <option value="black_tiger">Black Tiger</option>
            <option value="other">Other</option>
          </Select>
          <Input label="Stocking Date" type="date" {...field('stocking_date')} />
          <Input label="Expected Harvest" type="date" {...field('expected_harvest')} />
          {editing && (
            <Select label="Status" {...field('status')}>
              <option value="active">Active</option>
              <option value="fallow">Fallow</option>
              <option value="harvested">Harvested</option>
            </Select>
          )}
          <div className={styles.formFull}>
            <Input label="Notes" placeholder="Optional notes about this pond..." {...field('notes')} />
          </div>
        </div>
      </Modal>
    </div>
  );
}

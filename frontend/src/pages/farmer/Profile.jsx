import React, { useEffect, useState } from 'react';
import { farmerApi } from '../../services/api';
import { PageHeader, Card, Input, Select, Button, Spinner, Badge } from '../../components/common/UI';
import { useToast } from '../../hooks';
import styles from '../DashPages.module.css';

export default function FarmerProfile() {
  const toast = useToast();
  const [form, setForm]       = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [tab,     setTab]     = useState('personal');

  useEffect(() => {
    farmerApi.getProfile()
      .then(({ data }) => setForm(data.data || {}))
      .finally(() => setLoading(false));
  }, []);

  const f = (key) => ({
    value: form[key] || '',
    onChange: (e) => setForm((prev) => ({ ...prev, [key]: e.target.value })),
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await farmerApi.updateProfile(form);
      toast.success('Profile saved successfully');
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size="lg" /></div>;

  const TABS = [
    { id: 'personal',  label: '👤 Personal' },
    { id: 'farm',      label: '🌾 Farm Details' },
    { id: 'bank',      label: '🏦 Bank & KYC' },
  ];

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Keep your information up to date." />

      {/* Profile card header */}
      <Card style={{ marginBottom: 20, padding: 24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
          <div style={{
            width:72, height:72, borderRadius:'50%',
            background:'linear-gradient(135deg,var(--orange),var(--orange-light))',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:28, fontWeight:700, color:'#fff', flexShrink:0,
          }}>
            {(form.name || form.phone || '?')[0].toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize:20, fontWeight:700, color:'var(--text-primary)' }}>{form.name || 'Your Name'}</div>
            <div style={{ fontSize:14, color:'var(--text-muted)', marginTop:3 }}>{form.phone}</div>
            <div style={{ marginTop:6 }}><Badge variant="teal">Farmer</Badge></div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding:'8px 20px', borderRadius:50, fontSize:13, fontWeight:600, cursor:'pointer',
              background: tab === t.id ? 'var(--orange)' : 'var(--bg-card)',
              color:       tab === t.id ? '#fff' : 'var(--text-muted)',
              border:      tab === t.id ? 'none' : '1px solid var(--border-subtle)',
              transition: 'all 0.2s',
            }}>{t.label}</button>
        ))}
      </div>

      <Card>
        {tab === 'personal' && (
          <div className={styles.formGrid}>
            <Input label="Full Name"       placeholder="Your full name"       {...f('name')} />
            <Input label="Email"           type="email" placeholder="you@email.com" {...f('email')} />
            <Input label="Age"             type="number" min="1" max="120" placeholder="35" {...f('age')} />
            <Select label="Gender"         {...f('gender')}>
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </Select>
            <div className={styles.formFull}>
              <Input label="Address"       placeholder="Your full address"    {...f('address')} />
            </div>
            <Input label="Location / City" placeholder="e.g. Bhubaneswar"    {...f('location')} />
            <Input label="State"           placeholder="Odisha"               {...f('state')} />
            <Input label="District"        placeholder="Puri"                 {...f('district')} />
            <Input label="Village"         placeholder="Village name"         {...f('village')} />
            <Input label="Pincode"         placeholder="752001" maxLength={6} {...f('pincode')} />
          </div>
        )}

        {tab === 'farm' && (
          <div className={styles.formGrid}>
            <Input label="Years of Experience" type="number" min="0" placeholder="5" {...f('experience_years')} />
            <Input label="Number of Ponds"     type="number" min="0" placeholder="3" {...f('num_ponds')} />
            <Input label="Total Pond Area (acres)" type="number" step="0.5" placeholder="12.5" {...f('total_pond_area')} />
            <Input label="Community / Cooperative" placeholder="Farmer group name" {...f('community')} />
          </div>
        )}

        {tab === 'bank' && (
          <div className={styles.formGrid}>
            <Input label="Bank Account Number" placeholder="Account number"  {...f('bank_account')} />
            <Input label="IFSC Code"           placeholder="SBIN0001234"     {...f('ifsc_code')} />
            <Input label="Aadhaar Number"      placeholder="XXXX XXXX XXXX" maxLength={14} {...f('aadhaar_number')} />
          </div>
        )}

        <div className={styles.formActions} style={{ marginTop:20 }}>
          <Button loading={saving} onClick={handleSave}>Save Profile</Button>
        </div>
      </Card>
    </div>
  );
}

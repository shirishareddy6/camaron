// ============================================================
// farmer/Profile.jsx
// ============================================================
import React, { useEffect, useState } from 'react';
import { farmerApi } from '../../services/api';
import { PageHeader, Card, Input, Select, Button, Spinner } from '../../components/common/UI';
import { useToast } from '../../hooks';
import styles from '../DashPages.module.css';

export function FarmerProfile() {
  const toast = useToast();
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    farmerApi.getProfile().then(({ data }) => {
      setForm(data.data || {});
    }).finally(() => setLoading(false));
  }, []);

  const field = (key) => ({
    value: form[key] || '',
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await farmerApi.updateProfile(form);
      toast.success('Profile updated successfully');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner size="lg" /></div>;

  return (
    <div>
      <PageHeader title="My Profile" subtitle="Manage your personal and farm details." />
      <Card>
        <div className={styles.formGrid}>
          <Input label="Full Name"     placeholder="Your name"      {...field('name')} />
          <Input label="Email"         type="email" placeholder="you@example.com" {...field('email')} />
          <Input label="State"         placeholder="Odisha"         {...field('state')} />
          <Input label="District"      placeholder="Puri"           {...field('district')} />
          <Input label="Village"       placeholder="Village name"   {...field('village')} />
          <Input label="Pincode"       placeholder="752001"         {...field('pincode')} maxLength={6} />
          <Input label="Total Pond Area (acres)" type="number" step="0.5" {...field('total_pond_area')} />
          <Input label="Experience (years)"      type="number" min="0"    {...field('experience_years')} />
          <Select label="Gender" {...field('gender')}>
            <option value="">Select</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </Select>
          <Input label="Community"      placeholder="Community name" {...field('community')} />
          <Input label="Bank Account"   placeholder="Account number" {...field('bank_account')} />
          <Input label="IFSC Code"      placeholder="SBIN0001234"    {...field('ifsc_code')} />
        </div>
        <div className={styles.formActions}>
          <Button loading={saving} onClick={handleSave}>Save Profile</Button>
        </div>
      </Card>
    </div>
  );
}

export default FarmerProfile;

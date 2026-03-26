import React, { useEffect, useState } from 'react';
import { vendorApi } from '../../services/api';
import { PageHeader, Card, Input, Button, Spinner } from '../../components/common/UI';
import { useToast } from '../../hooks';
import styles from '../DashPages.module.css';

export default function VendorProfile() {
  const toast = useToast();
  const [form, setForm]     = useState({});
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    vendorApi.getProfile().then(({ data }) => setForm(data.data || {}))
      .finally(() => setLoading(false));
  }, []);

  const field = (key) => ({
    value: form[key] || '',
    onChange: (e) => setForm((f) => ({ ...f, [key]: e.target.value })),
  });

  const handleSave = async () => {
    if (!form.business_name?.trim()) { toast.error('Business name is required'); return; }
    setSaving(true);
    try {
      await vendorApi.updateProfile(form);
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:60 }}><Spinner /></div>;

  return (
    <div>
      <PageHeader title="Vendor Profile" subtitle="Your business details shown to farmers." />
      <Card>
        <div className={styles.formGrid}>
          <Input label="Contact Name"   placeholder="Your name"           {...field('name')} />
          <Input label="Email"          type="email"                      {...field('email')} />
          <Input label="Business Name *" placeholder="Your company name" {...field('business_name')} />
          <Input label="GST Number"     placeholder="22AAAAA0000A1Z5"    {...field('gst_number')} />
          <Input label="State"          placeholder="Odisha"             {...field('state')} />
          <Input label="District"       placeholder="Cuttack"            {...field('district')} />
          <div className={styles.formFull}>
            <Input label="Address"      placeholder="Full business address" {...field('address')} />
          </div>
          <Input label="Pincode"        placeholder="753001"              {...field('pincode')} maxLength={6} />
        </div>
        <div className={styles.formActions}>
          <Button loading={saving} onClick={handleSave}>Save Profile</Button>
        </div>
      </Card>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { StatCard, PageHeader, Card, Spinner } from '../../components/common/UI';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, CartesianGrid } from 'recharts';
import styles from '../DashPages.module.css';

export default function AdminDashboard() {
  const [overview,  setOverview]  = useState(null);
  const [revenue,   setRevenue]   = useState([]);
  const [topProds,  setTopProds]  = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.overview(),
      adminApi.monthlyRevenue(6),
      adminApi.topProducts(5),
    ]).then(([ov, rev, tp]) => {
      setOverview(ov.data.data);
      setRevenue(rev.data.data);
      setTopProds(tp.data.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size="lg" /></div>;

  const ov = overview || {};
  const tooltipStyle = {
    backgroundColor: 'var(--ocean-mid)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    fontSize: 13,
  };

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Platform-wide analytics and operations overview." />

      {/* Top stats */}
      <div className={styles.statsGrid}>
        <StatCard label="Total Farmers" value={ov.users?.farmers || 0}   icon="🌾" color="teal" />
        <StatCard label="Total Vendors"  value={ov.users?.vendors || 0}   icon="🏪" color="blue" />
        <StatCard label="Total Orders"   value={ov.orders?.total || 0}    icon="📦" color="gold" />
        <StatCard label="Total Revenue"
          value={`₹${parseFloat(ov.revenue?.total_revenue || 0).toLocaleString('en-IN')}`}
          icon="💰" color="green"
        />
      </div>

      <div className={styles.twoCol} style={{ marginBottom: 20 }}>
        <StatCard label="New Users (30d)"     value={ov.users?.new_this_month   || 0} icon="👥" color="teal" />
        <StatCard label="Orders (30d)"        value={ov.orders?.this_month       || 0} icon="📋" color="gold" />
        <StatCard label="Pending Orders"      value={ov.orders?.pending          || 0} icon="⏳" color="gold" />
        <StatCard label="Monthly Revenue"
          value={`₹${parseFloat(ov.revenue?.monthly_revenue || 0).toLocaleString('en-IN')}`}
          icon="📈" color="green"
        />
      </div>

      {/* Charts */}
      <div className={styles.twoCol}>
        <Card>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--white)', marginBottom:20 }}>Monthly Revenue (₹)</h3>
          {revenue.length === 0 ? (
            <p style={{ color:'var(--text-muted)', fontSize:13 }}>No revenue data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenue} margin={{ top:5, right:10, left:0, bottom:0 }}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#00b4a0" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#00b4a0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill:'#6b8ba4', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#6b8ba4', fontSize:11 }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                <Tooltip contentStyle={tooltipStyle}
                  formatter={(v) => [`₹${parseFloat(v).toLocaleString('en-IN')}`, 'Revenue']} />
                <Area type="monotone" dataKey="revenue" stroke="#00b4a0" strokeWidth={2}
                  fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--white)', marginBottom:20 }}>Top Products by Volume</h3>
          {topProds.length === 0 ? (
            <p style={{ color:'var(--text-muted)', fontSize:13 }}>No product data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProds} layout="vertical" margin={{ top:0, right:10, left:60, bottom:0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill:'#6b8ba4', fontSize:11 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fill:'#a8c0d6', fontSize:11 }} axisLine={false} tickLine={false} width={55} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="total_qty" fill="#00b4a0" radius={[0,4,4,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </div>
  );
}

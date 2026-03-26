import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/api';
import { StatCard, PageHeader, Card, Spinner, Badge } from '../../components/common/UI';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';
import styles from '../DashPages.module.css';

const COLORS = ['#e8621a','#0d9488','#f5a623','#16a34a','#0284c7','#7c3aed'];

const TIP = {
  contentStyle: { background:'var(--bg-card)', border:'1px solid var(--border-subtle)', borderRadius:10, color:'var(--text-primary)', fontSize:13 },
  cursor: { fill: 'rgba(232,98,26,0.06)' },
};

export default function AdminDashboard() {
  const [overview, setOverview]  = useState(null);
  const [revenue,  setRevenue]   = useState([]);
  const [topProds, setTopProds]  = useState([]);
  const [loading,  setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.overview(),
      adminApi.monthlyRevenue(6),
      adminApi.topProducts(6),
    ]).then(([ov, rev, tp]) => {
      setOverview(ov.data.data);
      setRevenue(rev.data.data || []);
      setTopProds(tp.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display:'flex', justifyContent:'center', padding:80 }}><Spinner size="lg" /></div>;

  const ov = overview || {};
  const farmers  = parseInt(ov.users?.farmers  || 0);
  const vendors  = parseInt(ov.users?.vendors  || 0);
  const admins   = parseInt(ov.users?.admins   || 0);
  const roleData = [
    { name: 'Farmers', value: farmers },
    { name: 'Vendors', value: vendors },
    { name: 'Admins',  value: admins  },
  ].filter(d => d.value > 0);

  const orderStatusData = [
    { name: 'Pending',   value: parseInt(ov.orders?.pending   || 0) },
    { name: 'Delivered', value: parseInt(ov.orders?.delivered || 0) },
    { name: 'Other',     value: Math.max(0, parseInt(ov.orders?.total || 0) - parseInt(ov.orders?.pending || 0) - parseInt(ov.orders?.delivered || 0)) },
  ].filter(d => d.value > 0);

  return (
    <div>
      <PageHeader title="Admin Analytics" subtitle="Platform-wide metrics and performance overview." />

      {/* KPI cards */}
      <div className={styles.statsGrid} style={{ gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))' }}>
        <StatCard label="Total Farmers"    value={ov.users?.farmers  || 0} icon="🌾" color="teal"   />
        <StatCard label="Total Vendors"    value={ov.users?.vendors  || 0} icon="🏪" color="orange" />
        <StatCard label="Total Orders"     value={ov.orders?.total   || 0} icon="📦" color="gold"   />
        <StatCard label="Pending Orders"   value={ov.orders?.pending || 0} icon="⏳" color="gold"   />
        <StatCard label="Delivered Orders" value={ov.orders?.delivered || 0} icon="✅" color="green" />
        <StatCard label="Total Revenue"
          value={`₹${parseFloat(ov.revenue?.total_revenue || 0).toLocaleString('en-IN')}`}
          icon="💰" color="green" />
        <StatCard label="Monthly Revenue"
          value={`₹${parseFloat(ov.revenue?.monthly_revenue || 0).toLocaleString('en-IN')}`}
          icon="📈" color="teal" />
        <StatCard label="New Users (30d)"  value={ov.users?.new_this_month || 0} icon="👥" color="blue" />
      </div>

      {/* Charts row 1 */}
      <div className={styles.twoCol} style={{ marginBottom:20 }}>
        <Card>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:20 }}>
            Monthly Revenue (₹)
          </h3>
          {revenue.length === 0
            ? <p style={{ color:'var(--text-muted)', fontSize:13, padding:'40px 0', textAlign:'center' }}>No revenue data yet</p>
            : <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={revenue} margin={{ top:5, right:10, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#e8621a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#e8621a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                  <XAxis dataKey="month" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip {...TIP} formatter={(v) => [`₹${parseFloat(v).toLocaleString('en-IN')}`, 'Revenue']} />
                  <Area type="monotone" dataKey="revenue" stroke="#e8621a" strokeWidth={2.5} fill="url(#revGrad)" />
                </AreaChart>
              </ResponsiveContainer>
          }
        </Card>

        <Card>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:20 }}>
            Top Products by Volume
          </h3>
          {topProds.length === 0
            ? <p style={{ color:'var(--text-muted)', fontSize:13, padding:'40px 0', textAlign:'center' }}>No orders yet</p>
            : <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topProds} layout="vertical" margin={{ top:0, right:16, left:60, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" horizontal={false} />
                  <XAxis type="number" tick={{ fill:'var(--text-muted)', fontSize:11 }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="name" type="category" tick={{ fill:'var(--text-secondary)', fontSize:11 }} axisLine={false} tickLine={false} width={55} />
                  <Tooltip {...TIP} />
                  <Bar dataKey="total_qty" fill="#e8621a" radius={[0,6,6,0]} />
                </BarChart>
              </ResponsiveContainer>
          }
        </Card>
      </div>

      {/* Charts row 2 */}
      <div className={styles.twoCol}>
        <Card>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:20 }}>
            User Distribution
          </h3>
          {roleData.length === 0
            ? <p style={{ color:'var(--text-muted)', fontSize:13, padding:'40px 0', textAlign:'center' }}>No users yet</p>
            : <div style={{ display:'flex', alignItems:'center', gap:24 }}>
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie data={roleData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      paddingAngle={3} dataKey="value">
                      {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip {...TIP} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {roleData.map((d, i) => (
                    <div key={d.name} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:12, height:12, borderRadius:3, background:COLORS[i], flexShrink:0 }} />
                      <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{d.name}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', marginLeft:'auto' }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
          }
        </Card>

        <Card>
          <h3 style={{ fontSize:15, fontWeight:700, color:'var(--text-primary)', marginBottom:20 }}>
            Order Status Breakdown
          </h3>
          {orderStatusData.length === 0
            ? <p style={{ color:'var(--text-muted)', fontSize:13, padding:'40px 0', textAlign:'center' }}>No orders yet</p>
            : <div style={{ display:'flex', alignItems:'center', gap:24 }}>
                <ResponsiveContainer width="60%" height={200}>
                  <PieChart>
                    <Pie data={orderStatusData} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                      paddingAngle={3} dataKey="value">
                      {orderStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip {...TIP} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                  {orderStatusData.map((d, i) => (
                    <div key={d.name} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:12, height:12, borderRadius:3, background:COLORS[i], flexShrink:0 }} />
                      <span style={{ fontSize:13, color:'var(--text-secondary)' }}>{d.name}</span>
                      <span style={{ fontSize:13, fontWeight:700, color:'var(--text-primary)', marginLeft:'auto' }}>{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>
          }
        </Card>
      </div>
    </div>
  );
}

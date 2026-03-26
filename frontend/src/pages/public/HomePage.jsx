import React from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

const STATS = [
  { value: '1,000+', label: 'Active Farms' },
  { value: '250+',   label: 'Technical Experts' },
  { value: '5',      label: 'Feed Brands' },
  { value: '48hr',   label: 'Support SLA' },
];

const PRODUCTS = [
  { name: 'Manamei',   category: 'Vannamei Feed', icon: '🌊', tag: 'Bestseller' },
  { name: 'Profeed 3M', category: 'Vannamei Feed', icon: '⚡', tag: null },
  { name: 'Prostar',   category: 'Black Tiger',   icon: '🐯', tag: null },
  { name: 'Titan',     category: 'Premium Feed',  icon: '💪', tag: 'Premium' },
  { name: 'High Boost', category: 'Advanced',    icon: '🚀', tag: null },
  { name: 'Health Care', category: 'Pond Health', icon: '🧪', tag: null },
];

const CERTS = ['FDA / VQIP', 'EIC India', 'BAP Certified', 'ISO / BSI', 'HACCP', 'IAF MLA'];

export default function HomePage() {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg} />
        <div className={styles.bubbles}>
          <div className={styles.bubble} />
          <div className={styles.bubble} />
          <div className={styles.bubble} />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.dot} />
            AI-Powered Aquaculture Platform
          </div>
          <h1 className={styles.heroH1}>
            Feeding the Future of<br />
            <em>Shrimp Farming</em> in India
          </h1>
          <p className={styles.heroP}>
            Camaron connects shrimp farmers, feed vendors, and aquaculture experts —
            delivering certified feeds, real-time farm analytics, and expert support
            across Odisha and beyond.
          </p>
          <div className={styles.heroActions}>
            <Link to="/login"    className={styles.btnPrimary}>Start for Free</Link>
            <Link to="/products" className={styles.btnSecondary}>Explore Products →</Link>
          </div>
        </div>
        <div className={styles.heroStats}>
          {STATS.map((s) => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statValue}>{s.value}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Products */}
      <section className={styles.section} id="products">
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.tag}>Our Feed Range</span>
            <h2 className={styles.h2}>Scientifically Formulated<br />Feed Brands</h2>
          </div>
          <Link to="/products" className={styles.btnSecondary}>View All →</Link>
        </div>
        <div className={styles.productGrid}>
          {PRODUCTS.map((p) => (
            <div key={p.name} className={styles.productCard}>
              {p.tag && <span className={styles.productTag}>{p.tag}</span>}
              <div className={styles.productIcon}>{p.icon}</div>
              <div className={styles.productName}>{p.name}</div>
              <div className={styles.productCat}>{p.category}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={styles.featuresSection} id="services">
        <span className={styles.tag}>Why Camaron</span>
        <h2 className={styles.h2} style={{ textAlign: 'center', marginBottom: 48 }}>
          Everything a Modern Farm Needs
        </h2>
        <div className={styles.featuresGrid}>
          {[
            { icon: '📊', title: 'AI Farm Analytics', desc: 'Real-time dashboards with predictive insights on feed consumption, growth rates, and harvest windows.' },
            { icon: '🛒', title: 'Integrated Marketplace', desc: 'Farmers browse and order certified feeds and health products directly from verified vendors.' },
            { icon: '🤖', title: 'Mei — AI Chatbot', desc: 'Multilingual AI assistant answering farmer queries 24/7, from feed recommendations to pond troubleshooting.' },
            { icon: '🔔', title: 'WhatsApp & SMS Alerts', desc: 'Automated notifications via Gupshup and Brevo for orders, advisories, and disease alerts.' },
            { icon: '🌾', title: 'Pond Cycle Tracking', desc: 'Log stocking dates, shrimp varieties, and expected harvest schedules for every pond.' },
            { icon: '🏦', title: 'Loan Management', desc: 'Farmers can apply for aquaculture loans directly from the platform with full document management.' },
          ].map((f) => (
            <div key={f.title} className={styles.featureCard}>
              <div className={styles.featureIco}>{f.icon}</div>
              <h4 className={styles.featureTitle}>{f.title}</h4>
              <p className={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Certifications */}
      <section className={styles.certSection}>
        <span className={styles.tag} style={{ display: 'block', textAlign: 'center', marginBottom: 12 }}>
          Compliance
        </span>
        <h2 className={styles.h2} style={{ textAlign: 'center', marginBottom: 36 }}>
          Certified by World-Leading Bodies
        </h2>
        <div className={styles.certGrid}>
          {CERTS.map((c) => (
            <div key={c} className={styles.certBadge}>{c}</div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <h2>Ready to Grow Smarter?</h2>
          <p>Join 1,000+ farms already using Camaron's AI-powered platform.</p>
          <Link to="/login" className={styles.btnPrimary} style={{ fontSize: 16, padding: '14px 44px' }}>
            Register Your Farm Today
          </Link>
        </div>
      </section>
    </div>
  );
}

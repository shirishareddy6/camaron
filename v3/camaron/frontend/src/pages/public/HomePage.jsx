import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './HomePage.module.css';

// Hero slides — admin-uploadable in future (stored in DB, served via API)
const HERO_SLIDES = [
  {
    id: 1,
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1400&q=80',
    title: 'Feeding the Future of Shrimp Farming',
    subtitle: 'Scientifically formulated feeds trusted by 1,000+ farms across India',
    cta: 'Explore Products',
    ctaLink: '/products',
  },
  {
    id: 2,
    image: 'https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=1400&q=80',
    title: 'AI-Driven Aquaculture Intelligence',
    subtitle: 'Real-time pond analytics, yield predictions, and raw material optimization',
    cta: 'See the Platform',
    ctaLink: '/login',
  },
  {
    id: 3,
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1400&q=80',
    title: 'From Farm to Global Markets',
    subtitle: 'BAP, FDA, ISO and HACCP certified — trusted by international buyers',
    cta: 'Get Started',
    ctaLink: '/login',
  },
];

const AI_ENGINES = [
  {
    icon: '🧬',
    title: 'Feed Formula Optimizer',
    desc: 'AI minimizes cost while meeting exact nutritional targets — protein, lipid, moisture, ash. Input today\'s raw material prices and get the optimal blend instantly.',
    tags: ['Least-cost formulation', 'Nutritional compliance', 'Multi-ingredient'],
    color: 'orange',
  },
  {
    icon: '📦',
    title: 'Raw Material Planner',
    desc: 'Tracks fishmeal, soy protein, wheat bran, and 40+ inputs. Predicts shortages, suggests buy/hold decisions based on price trends and production schedule.',
    tags: ['Inventory forecasting', 'Price alerts', 'Supplier scoring'],
    color: 'teal',
  },
  {
    icon: '🌡️',
    title: 'Storage & Shelf-Life Monitor',
    desc: 'Monitors temperature, humidity and moisture across all warehouse zones. Alerts when conditions risk aflatoxin growth or lipid oxidation in stored batches.',
    tags: ['IoT sensor ready', 'Expiry tracking', 'FIFO automation'],
    color: 'amber',
  },
  {
    icon: '📈',
    title: 'Yield & FCR Predictor',
    desc: 'Predicts harvest weight, Feed Conversion Ratio and survival rate for each pond using growth curve models trained on thousands of Vannamei and Tiger shrimp cycles.',
    tags: ['Growth modelling', 'Harvest planning', 'FCR benchmarking'],
    color: 'green',
  },
  {
    icon: '🔬',
    title: 'Quality & Compliance Engine',
    desc: 'Tracks BAP, FDA VQIP, HACCP, ISO certificate expiry dates. Auto-generates batch traceability reports — from raw material lot to finished feed bag — for audits and exports.',
    tags: ['Batch traceability', 'Certificate expiry', 'Export compliance'],
    color: 'blue',
  },
  {
    icon: '💰',
    title: 'Farmer Profitability Calculator',
    desc: 'Real-time cost-per-kg analysis per pond cycle. Factors in feed cost, seed, chemicals, and labour to show break-even price and projected ROI before harvest.',
    tags: ['Cost per kg', 'Break-even analysis', 'ROI projection'],
    color: 'purple',
  },
];

const PRODUCTS = [
  { name: 'Manamei',    category: 'Vannamei Feed', icon: '🌊', tag: 'Bestseller', slug: 'manamei' },
  { name: 'Profeed 3M', category: 'Vannamei Feed', icon: '⚡', tag: null,         slug: 'profeed-3m' },
  { name: 'Prostar',    category: 'Black Tiger',   icon: '🐯', tag: null,         slug: 'prostar' },
  { name: 'Titan',      category: 'Premium Feed',  icon: '💪', tag: 'Premium',    slug: 'titan' },
  { name: 'High Boost', category: 'Advanced',      icon: '🚀', tag: null,         slug: 'high-boost' },
  { name: 'Avant Pro W', category: 'Health Care',  icon: '🧪', tag: null,         slug: 'avant-pro-w' },
];

const STATS = [
  { value: '1,000+', label: 'Active Farms' },
  { value: '6L MT',  label: 'Annual Capacity' },
  { value: '5',      label: 'Certified Plants' },
  { value: '48hr',   label: 'Support SLA' },
];

const CERTS = ['FDA / VQIP', 'EIC India', 'BAP Certified', 'ISO / BSI', 'HACCP', 'IAF MLA'];

export default function HomePage() {
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5000);
    return () => clearInterval(t);
  }, []);

  const current = HERO_SLIDES[slide];

  return (
    <div className={styles.page}>

      {/* ── Hero Banner ──────────────────────────────────────────────────── */}
      <section className={styles.hero}>
        {HERO_SLIDES.map((s, i) => (
          <div key={s.id} className={`${styles.heroSlide} ${i === slide ? styles.heroSlideActive : ''}`}
            style={{ backgroundImage: `url(${s.image})` }} />
        ))}
        <div className={styles.heroOverlay} />

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.dot} />
            AI-Powered Aquaculture Platform
          </div>
          <h1 className={styles.heroH1}>{current.title}</h1>
          <p className={styles.heroP}>{current.subtitle}</p>
          <div className={styles.heroActions}>
            <Link to={current.ctaLink} className={styles.btnPrimary}>{current.cta}</Link>
            <Link to="/login"          className={styles.btnSecondary}>Login →</Link>
          </div>
        </div>

        {/* Slide indicators */}
        <div className={styles.heroDots}>
          {HERO_SLIDES.map((_, i) => (
            <button key={i} className={`${styles.heroDot} ${i === slide ? styles.heroDotActive : ''}`}
              onClick={() => setSlide(i)} />
          ))}
        </div>

        {/* Stats strip */}
        <div className={styles.heroStats}>
          {STATS.map((s) => (
            <div key={s.label} className={styles.statChip}>
              <span className={styles.statVal}>{s.value}</span>
              <span className={styles.statLbl}>{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Products ─────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.tag}>Our Feed Range</span>
            <h2 className={styles.h2}>Scientifically Formulated<br />Feed Brands</h2>
          </div>
          <Link to="/products" className={styles.btnOutline}>View All Products →</Link>
        </div>
        <div className={styles.productGrid}>
          {PRODUCTS.map((p) => (
            <Link to={`/products/${p.slug}`} key={p.name} className={styles.productCard}>
              {p.tag && <span className={styles.productTag}>{p.tag}</span>}
              <div className={styles.productIcon}>{p.icon}</div>
              <div className={styles.productName}>{p.name}</div>
              <div className={styles.productCat}>{p.category}</div>
              <div className={styles.productArrow}>View details →</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── AI Engines ───────────────────────────────────────────────────── */}
      <section className={styles.aiSection} id="ai">
        <div className={styles.aiHeader}>
          <span className={styles.tag}>Intelligence Layer</span>
          <h2 className={styles.h2}>AI Engines Built for<br />Sea Feed Manufacturing</h2>
          <p className={styles.aiSubtitle}>
            Six purpose-built models covering the full production chain —
            from raw material procurement to farmer profitability.
          </p>
        </div>
        <div className={styles.aiGrid}>
          {AI_ENGINES.map((e) => (
            <div key={e.title} className={`${styles.aiCard} ${styles['aiCard_' + e.color]}`}>
              <div className={styles.aiIcon}>{e.icon}</div>
              <h3 className={styles.aiTitle}>{e.title}</h3>
              <p className={styles.aiDesc}>{e.desc}</p>
              <div className={styles.aiTags}>
                {e.tags.map((t) => <span key={t} className={styles.aiTag}>{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Certifications ───────────────────────────────────────────────── */}
      <section className={styles.certSection}>
        <span className={styles.tag} style={{ display:'block', textAlign:'center', marginBottom:12 }}>Compliance</span>
        <h2 className={styles.h2} style={{ textAlign:'center', marginBottom:32 }}>
          Certified by World-Leading Bodies
        </h2>
        <div className={styles.certGrid}>
          {CERTS.map((c) => <div key={c} className={styles.certBadge}>{c}</div>)}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className={styles.cta}>
        <h2>Ready to Grow Smarter?</h2>
        <p>Join 1,000+ farms already using Camaron's AI-powered platform.</p>
        <Link to="/login" className={styles.btnPrimary} style={{ fontSize:16, padding:'14px 44px' }}>
          Register Your Farm Today
        </Link>
      </section>

    </div>
  );
}

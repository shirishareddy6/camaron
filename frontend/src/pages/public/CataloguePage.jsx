// CataloguePage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProducts, selectProducts, selectProductLoading, selectProductPag } from '../../store/slices/productSlice';
import { Spinner, EmptyState, Badge } from '../../components/common/UI';
import styles from './CataloguePage.module.css';

const CATEGORIES = [
  { value: '',            label: 'All' },
  { value: 'feed',        label: 'Feed' },
  { value: 'health_care', label: 'Health Care' },
  { value: 'equipment',   label: 'Equipment' },
];

export default function CataloguePage() {
  const dispatch    = useDispatch();
  const products    = useSelector(selectProducts);
  const loading     = useSelector(selectProductLoading);
  const pagination  = useSelector(selectProductPag);

  const [category, setCategory] = useState('');
  const [search,   setSearch]   = useState('');
  const [page,     setPage]     = useState(1);

  useEffect(() => {
    dispatch(fetchProducts({ category, search, page, limit: 12 }));
  }, [dispatch, category, search, page]);

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <span className={styles.tag}>Our Products</span>
        <h1 className={styles.h1}>Feed & Health Care Catalogue</h1>
        <p className={styles.sub}>Scientifically formulated shrimp feeds and pond health products from certified manufacturers.</p>
      </div>

      <div className={styles.container}>
        {/* Filters */}
        <div className={styles.filters}>
          <input
            className={styles.search}
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
          <div className={styles.catTabs}>
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                className={`${styles.catTab} ${category === c.value ? styles.catTabActive : ''}`}
                onClick={() => { setCategory(c.value); setPage(1); }}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className={styles.loading}><Spinner size="lg" /></div>
        ) : products.length === 0 ? (
          <EmptyState icon="🔍" title="No products found" description="Try a different search or category." />
        ) : (
          <>
            <div className={styles.grid}>
              {products.map((p) => (
                <Link to={`/products/${p.id}`} key={p.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <Badge variant={p.category === 'feed' ? 'teal' : 'gold'}>
                      {p.category.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className={styles.cardIcon}>
                    {p.category === 'feed' ? '🌊' : p.category === 'health_care' ? '🧪' : '⚙️'}
                  </div>
                  <h3 className={styles.cardName}>{p.name}</h3>
                  <p className={styles.cardDesc}>{p.description?.slice(0, 90)}...</p>
                  {p.features?.slice(0, 3).map((f) => (
                    <div key={f} className={styles.cardFeature}>✓ {f}</div>
                  ))}
                  <div className={styles.cardCta}>View Details →</div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className={styles.pagination}>
                <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className={styles.pageBtn}>← Prev</button>
                <span className={styles.pageInfo}>Page {page} of {pagination.pages}</span>
                <button disabled={page >= pagination.pages} onClick={() => setPage(p => p + 1)} className={styles.pageBtn}>Next →</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

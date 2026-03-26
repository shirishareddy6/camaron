import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById, selectProduct, selectProductLoading } from '../../store/slices/productSlice';
import { Spinner, Badge, Button } from '../../components/common/UI';
import styles from './ProductPage.module.css';

export default function ProductPage() {
  const { id }     = useParams();
  const dispatch   = useDispatch();
  const product    = useSelector(selectProduct);
  const loading    = useSelector(selectProductLoading);

  useEffect(() => { dispatch(fetchProductById(id)); }, [id, dispatch]);

  if (loading) return <div className={styles.loading}><Spinner size="lg" /></div>;
  if (!product) return null;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <Link to="/products" className={styles.back}>← Back to Catalogue</Link>

        <div className={styles.grid}>
          {/* Left */}
          <div className={styles.left}>
            <div className={styles.iconBox}>
              {product.category === 'feed' ? '🌊' : '🧪'}
            </div>
            <Badge variant={product.category === 'feed' ? 'teal' : 'gold'} className={styles.badge}>
              {product.category.replace('_', ' ')}
            </Badge>
            <h1 className={styles.name}>{product.name}</h1>
            <p className={styles.desc}>{product.description}</p>

            {product.features?.length > 0 && (
              <div className={styles.features}>
                <h3 className={styles.featuresTitle}>Key Benefits</h3>
                {product.features.map((f) => (
                  <div key={f} className={styles.featureItem}>
                    <span className={styles.featureCheck}>✓</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right — Vendors */}
          <div className={styles.right}>
            <h2 className={styles.vendorsTitle}>
              {product.vendors?.length > 0 ? 'Available from Vendors' : 'Availability'}
            </h2>

            {!product.vendors?.length ? (
              <div className={styles.noVendors}>
                <p>No vendors currently listing this product.</p>
                <Link to="/login">
                  <Button variant="secondary" size="sm">Log in to see all vendors</Button>
                </Link>
              </div>
            ) : product.vendors.map((v, i) => (
              <div key={i} className={styles.vendorCard}>
                <div className={styles.vendorName}>{v.business_name}</div>
                <div className={styles.vendorPrice}>
                  ₹{parseFloat(v.price_per_unit).toLocaleString('en-IN')}
                  <span className={styles.vendorUnit}> / {v.unit}</span>
                </div>
                <div className={styles.vendorStock}>
                  {v.stock_qty > 0
                    ? <span className={styles.inStock}>✓ In Stock ({v.stock_qty} {v.unit})</span>
                    : <span className={styles.outStock}>✕ Out of Stock</span>}
                </div>
                <div className={styles.vendorMin}>Min order: {v.min_order_qty} {v.unit}</div>
                <Link to="/login">
                  <Button size="sm" fullWidth>Order Now</Button>
                </Link>
              </div>
            ))}

            <div className={styles.loginCta}>
              <Link to="/login" className={styles.loginLink}>
                Sign in as a farmer to place orders →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

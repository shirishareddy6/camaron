import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuth, selectRole } from '../../store/slices/authSlice';
import styles from './PublicLayout.module.css';

export default function PublicLayout() {
  const isAuth   = useSelector(selectIsAuth);
  const role     = useSelector(selectRole);
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const dashPath = role === 'admin' ? '/admin' : role === 'vendor' ? '/vendor' : '/farmer';

  return (
    <div className={styles.wrapper}>
      <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
        <Link to="/" className={styles.logo}>
          <div className={styles.logoMark}>C</div>
          <span className={styles.logoText}>Camaron<span>.</span></span>
        </Link>

        <nav className={styles.links}>
          <NavLink to="/"         end className={({ isActive }) => isActive ? styles.active : ''}>Home</NavLink>
          <NavLink to="/products" className={({ isActive }) => isActive ? styles.active : ''}>Products</NavLink>
          <a href="#services">Services</a>
          <a href="#about">About</a>
        </nav>

        <div className={styles.actions}>
          {isAuth ? (
            <button className={styles.ctaBtn} onClick={() => navigate(dashPath)}>
              Go to Dashboard →
            </button>
          ) : (
            <Link to="/login" className={styles.ctaBtn}>Get Started</Link>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <div className={styles.logo} style={{ marginBottom: 12 }}>
              <div className={styles.logoMark}>C</div>
              <span className={styles.logoText}>Camaron<span>.</span></span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, maxWidth: 280 }}>
              India's intelligent aquaculture platform — built in Odisha.
            </p>
          </div>
          <div className={styles.footerLinks}>
            <h5>Platform</h5>
            <Link to="/products">Products</Link>
            <Link to="/login">Farmer Login</Link>
            <Link to="/login">Vendor Login</Link>
          </div>
          <div className={styles.footerLinks}>
            <h5>Company</h5>
            <a href="#about">About Us</a>
            <a href="#services">Services</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} Camaron. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

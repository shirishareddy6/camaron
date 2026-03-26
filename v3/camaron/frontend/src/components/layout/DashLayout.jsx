import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar, selectSidebarOpen } from '../../store/slices/uiSlice';
import { selectUser } from '../../store/slices/authSlice';
import styles from './DashLayout.module.css';

const NAV = {
  farmer: [
    { to: '/farmer',         label: 'Dashboard', icon: '📊' },
    { to: '/farmer/ponds',   label: 'My Ponds',  icon: '🌊' },
    { to: '/farmer/orders',  label: 'Orders',    icon: '📦' },
    { to: '/farmer/profile', label: 'Profile',   icon: '👤' },
    { to: '/products',       label: 'Catalogue',  icon: '🛒' },
  ],
  vendor: [
    { to: '/vendor',            label: 'Dashboard', icon: '📊' },
    { to: '/vendor/inventory',  label: 'Inventory', icon: '📋' },
    { to: '/vendor/orders',     label: 'Orders',    icon: '📦' },
    { to: '/vendor/profile',    label: 'Profile',   icon: '👤' },
  ],
  admin: [
    { to: '/admin',          label: 'Dashboard', icon: '📊' },
    { to: '/admin/users',    label: 'Users',     icon: '👥' },
    { to: '/admin/products', label: 'Products',  icon: '🌿' },
    { to: '/admin/orders',   label: 'Orders',    icon: '📦' },
  ],
};

export default function DashLayout({ role }) {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const user        = useSelector(selectUser);
  const sidebarOpen = useSelector(selectSidebarOpen);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className={`${styles.shell} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}>
          <div className={styles.logoMark}>C</div>
          {sidebarOpen && <span className={styles.logoText}>Camaron</span>}
        </div>

        <nav className={styles.nav}>
          {NAV[role]?.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === `/${role}`}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.active : ''}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {sidebarOpen && <span className={styles.navLabel}>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          {sidebarOpen && (
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                {(user?.name || user?.phone || '?')[0].toUpperCase()}
              </div>
              <div className={styles.userMeta}>
                <div className={styles.userName}>{user?.name || 'User'}</div>
                <div className={styles.userRole}>{role}</div>
              </div>
            </div>
          )}
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
            🚪{sidebarOpen && ' Logout'}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className={styles.main}>
        {/* Topbar */}
        <header className={styles.topbar}>
          <button
            className={styles.menuBtn}
            onClick={() => dispatch(toggleSidebar())}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div className={styles.topbarRight}>
            <span className={styles.roleBadge}>{role}</span>
          </div>
        </header>

        {/* Content */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

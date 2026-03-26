import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuth, selectRole, setUser } from './store/slices/authSlice';
import { authApi } from './services/api';

// Layouts
import PublicLayout   from './components/layout/PublicLayout';
import DashLayout     from './components/layout/DashLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';

// Public pages
import HomePage     from './pages/public/HomePage';
import CataloguePage from './pages/public/CataloguePage';
import ProductPage  from './pages/public/ProductPage';

// Farmer pages
import FarmerDashboard from './pages/farmer/Dashboard';
import FarmerProfile   from './pages/farmer/Profile';
import FarmerPonds     from './pages/farmer/Ponds';
import FarmerOrders    from './pages/farmer/Orders';

// Vendor pages
import VendorDashboard from './pages/vendor/Dashboard';
import VendorProfile   from './pages/vendor/Profile';
import VendorInventory from './pages/vendor/Inventory';
import VendorOrders    from './pages/vendor/Orders';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminUsers     from './pages/admin/Users';
import AdminProducts  from './pages/admin/Products';
import AdminOrders    from './pages/admin/Orders';

// Shared components
import ToastContainer from './components/common/ToastContainer';

// ── Guards ────────────────────────────────────────────────────────────────────
const RequireAuth = ({ children, roles }) => {
  const isAuth = useSelector(selectIsAuth);
  const role   = useSelector(selectRole);
  if (!isAuth) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

const RedirectIfAuth = ({ children }) => {
  const isAuth = useSelector(selectIsAuth);
  const role   = useSelector(selectRole);
  if (isAuth) {
    const dest = role === 'admin' ? '/admin' : role === 'vendor' ? '/vendor' : '/farmer';
    return <Navigate to={dest} replace />;
  }
  return children;
};

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  const dispatch = useDispatch();
  const isAuth   = useSelector(selectIsAuth);

  // Hydrate user on load
  useEffect(() => {
    if (isAuth) {
      authApi.me()
        .then(({ data }) => dispatch(setUser(data.data)))
        .catch(() => {});
    }
  }, [isAuth, dispatch]);

  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        {/* Public */}
        <Route element={<PublicLayout />}>
          <Route path="/"          element={<HomePage />} />
          <Route path="/products"  element={<CataloguePage />} />
          <Route path="/products/:id" element={<ProductPage />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={
          <RedirectIfAuth><LoginPage /></RedirectIfAuth>
        } />

        {/* Farmer */}
        <Route path="/farmer" element={
          <RequireAuth roles={['farmer']}>
            <DashLayout role="farmer" />
          </RequireAuth>
        }>
          <Route index           element={<FarmerDashboard />} />
          <Route path="profile"  element={<FarmerProfile />} />
          <Route path="ponds"    element={<FarmerPonds />} />
          <Route path="orders"   element={<FarmerOrders />} />
        </Route>

        {/* Vendor */}
        <Route path="/vendor" element={
          <RequireAuth roles={['vendor']}>
            <DashLayout role="vendor" />
          </RequireAuth>
        }>
          <Route index              element={<VendorDashboard />} />
          <Route path="profile"     element={<VendorProfile />} />
          <Route path="inventory"   element={<VendorInventory />} />
          <Route path="orders"      element={<VendorOrders />} />
        </Route>

        {/* Admin */}
        <Route path="/admin" element={
          <RequireAuth roles={['admin']}>
            <DashLayout role="admin" />
          </RequireAuth>
        }>
          <Route index            element={<AdminDashboard />} />
          <Route path="users"     element={<AdminUsers />} />
          <Route path="products"  element={<AdminProducts />} />
          <Route path="orders"    element={<AdminOrders />} />
        </Route>

        {/* Fallbacks */}
        <Route path="/unauthorized" element={
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:16 }}>
            <h1 style={{ fontSize:48, color:'var(--teal)' }}>403</h1>
            <p style={{ color:'var(--text-secondary)' }}>You don't have permission to view this page.</p>
          </div>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

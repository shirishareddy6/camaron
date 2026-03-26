import axios from 'axios';
import { store } from '../store/store';
import { logout, refreshTokens } from '../store/slices/authSlice';

const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

// ── Base client ───────────────────────────────────────────────────────────────

const client = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach access token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let isRefreshing = false;
let failedQueue  = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => error ? prom.reject(error) : prom.resolve());
  failedQueue = [];
};

client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => client(original))
          .catch((e) => Promise.reject(e));
      }
      original._retry = true;
      isRefreshing = true;
      try {
        await store.dispatch(refreshTokens());
        processQueue(null);
        return client(original);
      } catch (e) {
        processQueue(e);
        store.dispatch(logout());
        window.location.href = '/login';
        return Promise.reject(e);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(err);
  }
);

// ── Auth API ──────────────────────────────────────────────────────────────────
export const authApi = {
  sendOTP:   (phone)           => client.post('/auth/send-otp',   { phone }),
  verifyOTP: (phone, otp)      => client.post('/auth/verify-otp', { phone, otp }),
  refresh:   (refresh_token)   => client.post('/auth/refresh',    { refresh_token }),
  me:        ()                => client.get('/auth/me'),
};

// ── Farmer API ────────────────────────────────────────────────────────────────
export const farmerApi = {
  getProfile:    ()         => client.get('/farmers/profile'),
  updateProfile: (data)     => client.put('/farmers/profile', data),
  getPonds:      ()         => client.get('/farmers/ponds'),
  createPond:    (data)     => client.post('/farmers/ponds', data),
  updatePond:    (id, data) => client.put(`/farmers/ponds/${id}`, data),
  deletePond:    (id)       => client.delete(`/farmers/ponds/${id}`),
  getOrders:     (params)   => client.get('/farmers/orders', { params }),
};

// ── Product API ───────────────────────────────────────────────────────────────
export const productApi = {
  list:      (params) => client.get('/products', { params }),
  getById:   (id)     => client.get(`/products/${id}`),
  create:    (data)   => client.post('/products', data),
  update:    (id, d)  => client.put(`/products/${id}`, d),
};

// ── Vendor API ────────────────────────────────────────────────────────────────
export const vendorApi = {
  getProfile:        ()         => client.get('/vendors/profile'),
  updateProfile:     (data)     => client.put('/vendors/profile', data),
  listInventory:     (params)   => client.get('/vendors/inventory', { params }),
  addInventory:      (data)     => client.post('/vendors/inventory', data),
  updateInventory:   (id, data) => client.put(`/vendors/inventory/${id}`, data),
  removeInventory:   (id)       => client.delete(`/vendors/inventory/${id}`),
  getOrders:         (params)   => client.get('/vendors/orders', { params }),
  updateOrderStatus: (id, s)    => client.patch(`/vendors/orders/${id}/status`, { status: s }),
};

// ── Admin API ─────────────────────────────────────────────────────────────────
export const adminApi = {
  overview:       ()       => client.get('/admin/analytics/overview'),
  monthlyRevenue: (months) => client.get('/admin/analytics/monthly-revenue', { params: { months } }),
  topProducts:    (limit)  => client.get('/admin/analytics/top-products', { params: { limit } }),
  listUsers:      (params) => client.get('/admin/users', { params }),
  setUserStatus:  (id, v)  => client.patch(`/admin/users/${id}/status`, { is_active: v }),
  setUserRole:    (id, r)  => client.patch(`/admin/users/${id}/role`, { role: r }),
  verifyVendor:   (id)     => client.patch(`/admin/vendors/${id}/verify`),
  listOrders:     (params) => client.get('/admin/orders', { params }),
};

// ── Order API ─────────────────────────────────────────────────────────────────
export const orderApi = {
  place:   (data) => client.post('/orders', data),
  getById: (id)   => client.get(`/orders/${id}`),
};

export default client;

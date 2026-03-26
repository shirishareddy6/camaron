import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { addToast, removeToast, selectToasts } from '../store/slices/uiSlice';
import { selectUser, selectIsAuth, selectRole } from '../store/slices/authSlice';

// ── useToast ──────────────────────────────────────────────────────────────────
export const useToast = () => {
  const dispatch = useDispatch();
  const toasts   = useSelector(selectToasts);

  const toast = useCallback((message, type = 'info', duration = 4000) => {
    dispatch(addToast({ message, type, duration }));
  }, [dispatch]);

  const dismiss = useCallback((id) => dispatch(removeToast(id)), [dispatch]);

  return {
    toasts,
    dismiss,
    success: (msg) => toast(msg, 'success'),
    error:   (msg) => toast(msg, 'error'),
    info:    (msg) => toast(msg, 'info'),
    warn:    (msg) => toast(msg, 'warning'),
  };
};

// ── useAuth ───────────────────────────────────────────────────────────────────
export const useAuth = () => {
  const user   = useSelector(selectUser);
  const isAuth = useSelector(selectIsAuth);
  const role   = useSelector(selectRole);
  return { user, isAuth, role, isFarmer: role === 'farmer', isVendor: role === 'vendor', isAdmin: role === 'admin' };
};

// ── useApi — generic async state wrapper ─────────────────────────────────────
import { useState } from 'react';

export const useApi = (apiFn) => {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiFn(...args);
      setData(res.data);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'An error occurred';
      setError(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFn]);

  return { data, loading, error, execute };
};

// ── usePagination ─────────────────────────────────────────────────────────────
export const usePagination = (defaultLimit = 20) => {
  const [page,  setPage]  = useState(1);
  const [limit, setLimit] = useState(defaultLimit);

  const next = () => setPage((p) => p + 1);
  const prev = () => setPage((p) => Math.max(1, p - 1));
  const go   = (n) => setPage(n);
  const reset = () => setPage(1);

  return { page, limit, setPage: go, setLimit, next, prev, reset };
};

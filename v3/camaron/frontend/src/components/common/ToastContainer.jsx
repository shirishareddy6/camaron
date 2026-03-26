import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectToasts, removeToast } from '../../store/slices/uiSlice';
import styles from './ToastContainer.module.css';

const ICONS = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };

function Toast({ id, message, type, duration }) {
  const dispatch = useDispatch();
  const dismiss  = () => dispatch(removeToast(id));

  useEffect(() => {
    const t = setTimeout(dismiss, duration);
    return () => clearTimeout(t);
  }, [id, duration]);

  return (
    <div className={`${styles.toast} ${styles[type]}`} role="alert">
      <span className={styles.icon}>{ICONS[type]}</span>
      <span className={styles.msg}>{message}</span>
      <button className={styles.close} onClick={dismiss} aria-label="Dismiss">✕</button>
    </div>
  );
}

export default function ToastContainer() {
  const toasts = useSelector(selectToasts);
  if (!toasts.length) return null;

  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map((t) => <Toast key={t.id} {...t} />)}
    </div>
  );
}

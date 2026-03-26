import React from 'react';
import styles from './UI.module.css';

// ── Button ────────────────────────────────────────────────────────────────────
export const Button = ({
  children, variant = 'primary', size = 'md',
  loading = false, disabled = false, fullWidth = false,
  className = '', ...props
}) => (
  <button
    className={[
      styles.btn,
      styles[`btn_${variant}`],
      styles[`btn_${size}`],
      fullWidth ? styles.fullWidth : '',
      loading ? styles.loading : '',
      className,
    ].join(' ')}
    disabled={disabled || loading}
    {...props}
  >
    {loading && <span className={styles.spinner} />}
    {children}
  </button>
);

// ── Card ──────────────────────────────────────────────────────────────────────
export const Card = ({ children, className = '', padding = true, ...props }) => (
  <div className={`${styles.card} ${padding ? styles.cardPadded : ''} ${className}`} {...props}>
    {children}
  </div>
);

// ── Input ─────────────────────────────────────────────────────────────────────
export const Input = React.forwardRef(({
  label, error, hint, prefix, className = '', ...props
}, ref) => (
  <div className={styles.inputWrapper}>
    {label && <label className={styles.label}>{label}</label>}
    <div className={styles.inputInner}>
      {prefix && <span className={styles.inputPrefix}>{prefix}</span>}
      <input
        ref={ref}
        className={`${styles.input} ${prefix ? styles.inputWithPrefix : ''} ${error ? styles.inputError : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <p className={styles.errorMsg}>{error}</p>}
    {hint && !error && <p className={styles.hint}>{hint}</p>}
  </div>
));
Input.displayName = 'Input';

// ── Select ────────────────────────────────────────────────────────────────────
export const Select = React.forwardRef(({ label, error, children, className = '', ...props }, ref) => (
  <div className={styles.inputWrapper}>
    {label && <label className={styles.label}>{label}</label>}
    <select ref={ref} className={`${styles.input} ${styles.select} ${className}`} {...props}>
      {children}
    </select>
    {error && <p className={styles.errorMsg}>{error}</p>}
  </div>
));
Select.displayName = 'Select';

// ── Textarea ──────────────────────────────────────────────────────────────────
export const Textarea = React.forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className={styles.inputWrapper}>
    {label && <label className={styles.label}>{label}</label>}
    <textarea ref={ref} className={`${styles.input} ${styles.textarea} ${className}`} {...props} />
    {error && <p className={styles.errorMsg}>{error}</p>}
  </div>
));
Textarea.displayName = 'Textarea';

// ── Badge ─────────────────────────────────────────────────────────────────────
export const Badge = ({ children, variant = 'default', className = '' }) => (
  <span className={`${styles.badge} ${styles[`badge_${variant}`]} ${className}`}>
    {children}
  </span>
);

// ── Spinner ───────────────────────────────────────────────────────────────────
export const Spinner = ({ size = 'md', className = '' }) => (
  <div className={`${styles.spinnerStandalone} ${styles[`spinner_${size}`]} ${className}`} />
);

// ── PageHeader ────────────────────────────────────────────────────────────────
export const PageHeader = ({ title, subtitle, action }) => (
  <div className={styles.pageHeader}>
    <div>
      <h1 className={styles.pageTitle}>{title}</h1>
      {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </div>
);

// ── StatCard ──────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, icon, change, color = 'teal' }) => (
  <Card className={styles.statCard}>
    <div className={styles.statTop}>
      <div className={`${styles.statIcon} ${styles[`statIcon_${color}`]}`}>{icon}</div>
      {change !== undefined && (
        <span className={`${styles.statChange} ${change >= 0 ? styles.up : styles.down}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </span>
      )}
    </div>
    <div className={styles.statValue}>{value}</div>
    <div className={styles.statLabel}>{label}</div>
  </Card>
);

// ── Empty State ───────────────────────────────────────────────────────────────
export const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div className={styles.emptyState}>
    <div className={styles.emptyIcon}>{icon}</div>
    <h3 className={styles.emptyTitle}>{title}</h3>
    {description && <p className={styles.emptyDesc}>{description}</p>}
    {action && <div style={{ marginTop: 20 }}>{action}</div>}
  </div>
);

// ── Modal ─────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, footer }) => {
  if (!open) return null;
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{title}</h2>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>
        <div className={styles.modalBody}>{children}</div>
        {footer && <div className={styles.modalFooter}>{footer}</div>}
      </div>
    </div>
  );
};

// ── Table ─────────────────────────────────────────────────────────────────────
export const Table = ({ columns, data, loading, emptyMessage = 'No data found' }) => {
  if (loading) return <div className={styles.tableLoading}><Spinner /></div>;
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={styles.th} style={{ width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className={styles.tdEmpty}>{emptyMessage}</td>
            </tr>
          ) : data.map((row, i) => (
            <tr key={row.id || i} className={styles.tr}>
              {columns.map((col) => (
                <td key={col.key} className={styles.td}>
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

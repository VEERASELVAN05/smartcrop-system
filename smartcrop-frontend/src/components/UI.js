import { theme } from '../theme';

// Primary Button
export const PrimaryButton = ({
  children, onClick, loading, disabled,
  color, width, size
}) => (
  <button
    onClick={onClick}
    disabled={disabled || loading}
    style={{
      width: width || '100%',
      padding: size === 'sm' ? '8px 16px' :
               size === 'lg' ? '16px 24px' : '13px 20px',
      backgroundColor: disabled
        ? '#a0aec0'
        : color || theme.colors.primary,
      color: theme.colors.white,
      border: 'none',
      borderRadius: theme.radius.md,
      fontSize: size === 'sm' ? '13px' : '15px',
      fontWeight: '600',
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      boxShadow: disabled ? 'none' : theme.shadows.sm,
      letterSpacing: '0.3px',
    }}
  >
    {loading ? (
      <>
        <div style={{
          width: '16px', height: '16px',
          border: '2px solid rgba(255,255,255,0.3)',
          borderTop: '2px solid white',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
        Processing...
      </>
    ) : children}
  </button>
);

// Input Field
export const InputField = ({
  label, name, type, value,
  onChange, placeholder, icon
}) => (
  <div style={{ marginBottom: '16px' }}>
    {label && (
      <label style={{
        display: 'block', marginBottom: '6px',
        fontSize: '13px', fontWeight: '600',
        color: theme.colors.textSecondary,
        letterSpacing: '0.3px'
      }}>
        {icon} {label}
      </label>
    )}
    <input
      type={type || 'text'}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        width: '100%', padding: '11px 14px',
        borderRadius: theme.radius.sm,
        border: `1.5px solid ${theme.colors.border}`,
        fontSize: '14px', color: theme.colors.textPrimary,
        backgroundColor: '#fafbfc',
        transition: 'all 0.2s ease',
      }}
    />
  </div>
);

// Select Field
export const SelectField = ({
  label, name, value, onChange,
  options, placeholder, icon
}) => (
  <div style={{ marginBottom: '16px' }}>
    {label && (
      <label style={{
        display: 'block', marginBottom: '6px',
        fontSize: '13px', fontWeight: '600',
        color: theme.colors.textSecondary,
        letterSpacing: '0.3px'
      }}>
        {icon} {label}
      </label>
    )}
    <select
      name={name}
      value={value}
      onChange={onChange}
      style={{
        width: '100%', padding: '11px 14px',
        borderRadius: theme.radius.sm,
        border: `1.5px solid ${theme.colors.border}`,
        fontSize: '14px', color: theme.colors.textPrimary,
        backgroundColor: '#fafbfc',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%234a5568' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'right 14px center',
        paddingRight: '36px',
      }}
    >
      <option value="">{placeholder}</option>
      {options?.map((opt, i) => (
        <option
          key={i}
          value={opt.value || opt}
        >
          {opt.label || opt}
        </option>
      ))}
    </select>
  </div>
);

// Card
export const Card = ({ children, style }) => (
  <div style={{
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.radius.lg,
    padding: '24px',
    boxShadow: theme.shadows.md,
    border: `1px solid ${theme.colors.border}`,
    animation: 'fadeIn 0.4s ease',
    ...style
  }}>
    {children}
  </div>
);

// Stat Card
export const StatCard = ({
  icon, label, value, color, trend
}) => (
  <div style={{
    backgroundColor: theme.colors.cardBg,
    borderRadius: theme.radius.lg,
    padding: '20px',
    boxShadow: theme.shadows.md,
    borderLeft: `4px solid ${color}`,
    animation: 'fadeIn 0.4s ease',
    transition: 'transform 0.2s ease',
  }}
    onMouseEnter={e =>
      e.currentTarget.style.transform = 'translateY(-2px)'}
    onMouseLeave={e =>
      e.currentTarget.style.transform = 'translateY(0)'}
  >
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'flex-start'
    }}>
      <div>
        <p style={{
          fontSize: '12px', color: theme.colors.textMuted,
          fontWeight: '600', letterSpacing: '0.5px',
          textTransform: 'uppercase', marginBottom: '6px'
        }}>
          {label}
        </p>
        <p style={{
          fontSize: '26px', fontWeight: '700', color,
          lineHeight: 1
        }}>
          {value}
        </p>
      </div>
      <div style={{
        width: '42px', height: '42px',
        backgroundColor: `${color}18`,
        borderRadius: theme.radius.md,
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: '20px'
      }}>
        {icon}
      </div>
    </div>
    {trend && (
      <p style={{
        fontSize: '12px', color: theme.colors.textMuted,
        marginTop: '8px'
      }}>
        {trend}
      </p>
    )}
  </div>
);

// Badge
export const Badge = ({ text, type }) => {
  const styles = {
    success: { bg: '#e6f4ea', color: '#2e7d32' },
    danger:  { bg: '#fce8e6', color: '#c62828' },
    warning: { bg: '#fff3e0', color: '#e65100' },
    info:    { bg: '#e3f2fd', color: '#1565c0' },
  };
  const s = styles[type] || styles.info;
  return (
    <span style={{
      padding: '3px 10px',
      backgroundColor: s.bg, color: s.color,
      borderRadius: theme.radius.full,
      fontSize: '11px', fontWeight: '700',
      letterSpacing: '0.5px',
      textTransform: 'uppercase'
    }}>
      {text}
    </span>
  );
};

// Navbar
export const Navbar = ({
  title, subtitle, icon, buttons
}) => (
  <div style={{
    background: `linear-gradient(135deg, 
      ${theme.colors.primary} 0%, 
      ${theme.colors.primaryLight} 100%)`,
    padding: '0 24px',
    height: '60px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 12px rgba(26,60,94,0.3)',
    position: 'sticky', top: 0, zIndex: 100,
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{ fontSize: '22px' }}>{icon}</span>
      <div>
        <div style={{
          color: 'white', fontWeight: '700',
          fontSize: '16px', lineHeight: 1.2
        }}>
          {title}
        </div>
        {subtitle && (
          <div style={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: '11px'
          }}>
            {subtitle}
          </div>
        )}
      </div>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {buttons}
    </div>
  </div>
);

// NavButton
export const NavButton = ({
  children, onClick, variant
}) => (
  <button
    onClick={onClick}
    style={{
      backgroundColor: variant === 'solid'
        ? 'rgba(255,255,255,0.2)'
        : 'transparent',
      border: '1.5px solid rgba(255,255,255,0.4)',
      color: 'white', padding: '6px 14px',
      borderRadius: theme.radius.full,
      cursor: 'pointer', fontSize: '12px',
      fontWeight: '600', transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </button>
);

// Page wrapper
export const PageWrapper = ({ children }) => (
  <div style={{
    minHeight: '100vh',
    backgroundColor: theme.colors.background,
    fontFamily: "'Segoe UI', -apple-system, sans-serif",
  }}>
    {children}
  </div>
);

// Loading Spinner
export const Spinner = ({ text }) => (
  <div style={{
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    padding: '60px', gap: '16px'
  }}>
    <div style={{
      width: '40px', height: '40px',
      border: `3px solid ${theme.colors.border}`,
      borderTop: `3px solid ${theme.colors.primary}`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <p style={{ color: theme.colors.textMuted, fontSize: '14px' }}>
      {text || 'Loading...'}
    </p>
  </div>
);

// Error Alert
export const ErrorAlert = ({ message }) => message ? (
  <div style={{
    backgroundColor: '#fff5f5',
    border: '1.5px solid #fed7d7',
    borderRadius: theme.radius.sm,
    padding: '12px 16px',
    marginBottom: '16px',
    color: '#c53030', fontSize: '13px',
    display: 'flex', alignItems: 'center', gap: '8px',
    animation: 'fadeIn 0.3s ease'
  }}>
    ⚠️ {message}
  </div>
) : null;

// Success Alert
export const SuccessAlert = ({ message }) => message ? (
  <div style={{
    backgroundColor: '#f0fff4',
    border: '1.5px solid #9ae6b4',
    borderRadius: theme.radius.sm,
    padding: '12px 16px',
    marginBottom: '16px',
    color: '#276749', fontSize: '13px',
    display: 'flex', alignItems: 'center', gap: '8px',
    animation: 'fadeIn 0.3s ease'
  }}>
    ✅ {message}
  </div>
) : null;
export default function ActionButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  fullWidth = false,
  style,
  ...props
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        ...sizeStyles[size],
        width: fullWidth ? '100%' : undefined,
        opacity: disabled ? 0.55 : 1,
        cursor: disabled ? 'default' : 'pointer',
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}

const baseStyle = {
  border: 'none',
  borderRadius: 10,
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 6,
  minWidth: 0,
  fontFamily: 'inherit',
  fontWeight: 800,
  lineHeight: 1.1,
  whiteSpace: 'nowrap',
  transition: 'background 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease',
  touchAction: 'manipulation',
};

const variantStyles = {
  primary: {
    background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
    color: '#fff',
    boxShadow: '0 2px 10px rgba(var(--color-primary-rgb),0.28)',
  },
  subtle: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    color: '#cbd5e1',
    boxShadow: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'inherit',
    boxShadow: 'none',
  },
  danger: {
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.25)',
    color: '#f87171',
    boxShadow: 'none',
  },
};

const sizeStyles = {
  sm: { padding: '0.45rem 0.85rem', fontSize: '0.78rem' },
  md: { padding: '0.62rem 1rem', fontSize: '0.86rem' },
  lg: { padding: '0.78rem 1.15rem', fontSize: '0.98rem' },
};

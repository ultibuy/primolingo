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
  borderRadius: 'var(--radius-pill)',
  boxSizing: 'border-box',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  minWidth: 0,
  fontFamily: 'var(--font-body)',
  fontWeight: 700,
  lineHeight: 1.1,
  whiteSpace: 'nowrap',
  transition: 'all var(--motion-base)',
  touchAction: 'manipulation',
};

const variantStyles = {
  primary: {
    background: 'var(--gradient-brand)',
    color: 'var(--text-white)',
    boxShadow: 'var(--shadow-glow)',
  },
  subtle: {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
    color: 'var(--text-light)',
    boxShadow: 'none',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-primary)',
    border: '1.5px solid var(--color-primary)',
    boxShadow: 'none',
  },
  gold: {
    background: 'var(--gradient-flame)',
    color: 'var(--color-bg1)',
    boxShadow: 'var(--shadow-glow-gold)',
  },
  danger: {
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.25)',
    color: 'var(--color-red)',
    boxShadow: 'none',
  },
};

const sizeStyles = {
  sm: { padding: '8px 16px', fontSize: 13 },
  md: { padding: '12px 24px', fontSize: 14 },
  lg: { padding: '16px 36px', fontSize: 17 },
};

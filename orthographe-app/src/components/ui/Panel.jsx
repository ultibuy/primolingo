export default function Panel({
  children,
  variant = 'default',
  interactive = false,
  style,
  ...props
}) {
  return (
    <div
      style={{
        ...baseStyle,
        ...variantStyles[variant],
        cursor: interactive ? 'pointer' : undefined,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}

const baseStyle = {
  width: '100%',
  minWidth: 0,
  boxSizing: 'border-box',
  borderRadius: 'var(--radius-md)',
  overflowWrap: 'anywhere',
  backdropFilter: 'blur(var(--blur-md))',
  WebkitBackdropFilter: 'blur(var(--blur-md))',
};

const variantStyles = {
  default: {
    background: 'var(--glass-bg)',
    border: '1px solid var(--glass-border)',
  },
  highlighted: {
    background: 'rgba(var(--color-primary-rgb),0.12)',
    border: '1px solid rgba(var(--color-primary-rgb),0.3)',
  },
  elevated: {
    background: 'linear-gradient(180deg, rgba(var(--color-bg1-rgb),0.94), rgba(var(--color-bg2-rgb),0.84))',
    border: '1px solid rgba(var(--color-primary-rgb),0.16)',
    boxShadow: 'var(--shadow-md), inset 0 1px 0 rgba(255,255,255,0.03)',
  },
};

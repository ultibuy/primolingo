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
  borderRadius: 14,
  overflowWrap: 'anywhere',
};

const variantStyles = {
  default: {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
  },
  highlighted: {
    background: 'rgba(var(--color-primary-rgb),0.08)',
    border: '1px solid rgba(var(--color-primary-rgb),0.3)',
  },
  elevated: {
    background: 'linear-gradient(180deg, rgba(var(--color-bg1-rgb),0.96), rgba(var(--color-bg2-rgb),0.88))',
    border: '1px solid rgba(var(--color-primary-rgb),0.16)',
    boxShadow: '0 12px 30px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.03)',
  },
};

export default function StatBadge({
  icon,
  value,
  label,
  color = 'var(--color-accent)',
  compact = false,
  onClick,
  title,
  style,
}) {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      title={title}
      style={{
        minWidth: 0,
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: compact ? '0.16rem' : '0.3rem',
        background: `${color}10`,
        border: `1px solid ${color}25`,
        borderRadius: 10,
        padding: compact ? '0.28rem 0.22rem' : '0.3rem 0.6rem',
        cursor: onClick ? 'pointer' : 'default',
        color,
        fontFamily: 'inherit',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        transition: 'all 0.15s ease',
        ...style,
      }}
    >
      {icon}
      <span style={{ fontSize: compact ? '0.76rem' : '0.82rem', fontWeight: 900, color, flexShrink: 0 }}>
        {value}
      </span>
      {label && (
        <span style={{
          minWidth: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          fontSize: compact ? '0.54rem' : '0.62rem',
          color: '#6b7280',
          fontWeight: 700,
        }}>
          {label}
        </span>
      )}
    </Component>
  );
}

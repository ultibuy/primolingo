export default function PageShell({
  children,
  compact = false,
  mounted = true,
  style,
}) {
  return (
    <div
      style={{
        maxWidth: 640,
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
        padding: compact ? '0 0.9rem 2rem' : '0 1.5rem 3rem',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.6s ease',
        position: 'relative',
        zIndex: 1,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

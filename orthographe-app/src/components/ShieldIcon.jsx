export default function ShieldIcon({ size = 28, active = true, showTooltip = false }) {
  const opacity = active ? 1 : 0.3;
  return (
    <div style={{
      width: size, height: size, display: 'inline-flex',
      animation: active ? 'shield-bob 3s ease-in-out infinite' : 'none',
      flexShrink: 0, opacity,
      position: 'relative',
    }}
      title={showTooltip ? 'Bouclier de flamme — protège 1 jour raté' : undefined}
    >
      <svg viewBox="0 0 40 44" width={size} height={size}>
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="shieldShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0.3" />
            <stop offset="50%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <filter id="shieldShadow">
            <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#2563eb" floodOpacity="0.4" />
          </filter>
        </defs>
        {/* Shield shape */}
        <path d="M20 2 L36 10 L36 24 C36 34 20 42 20 42 C20 42 4 34 4 24 L4 10 Z"
          fill="url(#shieldGrad)" filter="url(#shieldShadow)" />
        {/* Shine overlay */}
        <path d="M20 2 L36 10 L36 24 C36 34 20 42 20 42 C20 42 4 34 4 24 L4 10 Z"
          fill="url(#shieldShine)" />
        {/* Inner border */}
        <path d="M20 6 L32 12.5 L32 23 C32 31 20 38 20 38 C20 38 8 31 8 23 L8 12.5 Z"
          fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
        {/* Check mark */}
        <path d="M14 22 L18 26 L26 16" fill="none" stroke="white" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      </svg>
    </div>
  );
}

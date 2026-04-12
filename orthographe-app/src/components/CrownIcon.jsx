export default function CrownIcon({ size = 32, active = true, animate = true }) {
  const opacity = active ? 1 : 0.2;
  return (
    <div style={{
      width: size, height: size, display: 'inline-flex', opacity,
      animation: active && animate ? 'crown-wobble 4s ease-in-out infinite' : 'none',
    }}>
      <svg viewBox="0 0 48 40" width={size} height={size * 40 / 48}>
        <defs>
          <linearGradient id="crownGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffe066" />
            <stop offset="40%" stopColor="#fbbf24" />
            <stop offset="70%" stopColor="#d99e0b" />
            <stop offset="100%" stopColor="#b8860b" />
          </linearGradient>
          <linearGradient id="crownShine" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="white" stopOpacity="0.4" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>
          <filter id="crownGlow">
            <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#fbbf24" floodOpacity={active ? 0.5 : 0} />
          </filter>
        </defs>
        {/* Base band */}
        <rect x="6" y="28" width="36" height="8" rx="3" fill="url(#crownGold)" filter="url(#crownGlow)" />
        {/* Crown body */}
        <path d="M6 28 L2 12 L14 20 L24 6 L34 20 L46 12 L42 28 Z"
          fill="url(#crownGold)" filter="url(#crownGlow)" />
        {/* Shine overlay */}
        <path d="M6 28 L2 12 L14 20 L24 6 L34 20 L46 12 L42 28 Z"
          fill="url(#crownShine)" />
        {/* Gems */}
        <circle cx="24" cy="22" r="3" fill="#ef4444" opacity="0.85" />
        <circle cx="15" cy="25" r="2.2" fill="#3b82f6" opacity="0.8" />
        <circle cx="33" cy="25" r="2.2" fill="#22c55e" opacity="0.8" />
        {/* Tips sparkle */}
        {active && (
          <>
            <circle cx="24" cy="6" r="2" fill="#fff" opacity="0.7">
              <animate attributeName="opacity" values="0.7;0.2;0.7" dur="2s" repeatCount="indefinite" />
              <animate attributeName="r" values="2;3;2" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="2" cy="12" r="1.5" fill="#ffe066" opacity="0.5">
              <animate attributeName="opacity" values="0.5;0.1;0.5" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="46" cy="12" r="1.5" fill="#ffe066" opacity="0.5">
              <animate attributeName="opacity" values="0.1;0.5;0.1" dur="2.5s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </svg>
    </div>
  );
}

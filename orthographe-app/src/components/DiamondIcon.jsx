export default function DiamondIcon({ size = 32, active = true, animate = true }) {
  const opacity = active ? 1 : 0.2;
  return (
    <div style={{
      width: size, height: size, display: 'inline-flex', opacity,
      animation: active && animate ? 'diamond-sparkle 3s ease-in-out infinite' : 'none',
    }}>
      <svg viewBox="0 0 48 48" width={size} height={size}>
        <defs>
          <linearGradient id="diamondFace1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#93c5fd" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id="diamondFace2" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id="diamondTop" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="#bfdbfe" />
            <stop offset="100%" stopColor="#60a5fa" />
          </linearGradient>
          <filter id="diamondGlow">
            <feDropShadow dx="0" dy="1" stdDeviation="2.5" floodColor="#3b82f6" floodOpacity={active ? 0.5 : 0} />
          </filter>
        </defs>
        {/* Top facet */}
        <path d="M24 4 L38 18 L24 18 Z" fill="url(#diamondTop)" filter="url(#diamondGlow)" />
        <path d="M24 4 L10 18 L24 18 Z" fill="#93c5fd" filter="url(#diamondGlow)" />
        {/* Left facet */}
        <path d="M10 18 L24 44 L24 18 Z" fill="url(#diamondFace1)" />
        {/* Right facet */}
        <path d="M38 18 L24 44 L24 18 Z" fill="url(#diamondFace2)" />
        {/* Shine line */}
        <path d="M16 14 L20 18 L24 10" fill="none" stroke="white" strokeWidth="1.2" opacity="0.5" />
        {/* Sparkles */}
        {active && (
          <>
            <circle cx="18" cy="12" r="1.5" fill="white" opacity="0.8">
              <animate attributeName="opacity" values="0.8;0.1;0.8" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="r" values="1.5;2.5;1.5" dur="1.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="32" cy="16" r="1" fill="white" opacity="0.6">
              <animate attributeName="opacity" values="0.2;0.7;0.2" dur="2s" repeatCount="indefinite" />
            </circle>
            <circle cx="24" cy="8" r="1" fill="white" opacity="0.7">
              <animate attributeName="opacity" values="0.7;0;0.7" dur="1.8s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </svg>
    </div>
  );
}

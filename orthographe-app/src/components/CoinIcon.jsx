export default function CoinIcon({ size = 24, animate = false }) {
  return (
    <div style={{
      width: size, height: size, display: 'inline-flex',
      animation: animate ? 'coin-spin 0.6s ease-in-out' : 'none',
      perspective: 200,
      flexShrink: 0,
    }}>
      <svg viewBox="0 0 40 40" width={size} height={size}>
        <defs>
          <radialGradient id="coinGold" cx="35%" cy="35%">
            <stop offset="0%" stopColor="#ffe066" />
            <stop offset="40%" stopColor="#fbbf24" />
            <stop offset="80%" stopColor="#d4940a" />
            <stop offset="100%" stopColor="#92650a" />
          </radialGradient>
          <radialGradient id="coinInner" cx="40%" cy="40%">
            <stop offset="0%" stopColor="#ffe680" />
            <stop offset="60%" stopColor="#f5c842" />
            <stop offset="100%" stopColor="#c8920a" />
          </radialGradient>
          <filter id="coinShadow">
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.3" />
          </filter>
        </defs>
        {/* Outer ring */}
        <circle cx="20" cy="20" r="18" fill="url(#coinGold)" filter="url(#coinShadow)" />
        {/* Inner disc */}
        <circle cx="20" cy="20" r="14" fill="url(#coinInner)" />
        {/* Rim highlight */}
        <circle cx="20" cy="20" r="17" fill="none" stroke="#ffe680" strokeWidth="0.8" opacity="0.6" />
        {/* Inner rim */}
        <circle cx="20" cy="20" r="14" fill="none" stroke="#d4940a" strokeWidth="0.6" opacity="0.5" />
        {/* Star / "O" emboss */}
        <text x="20" y="25.5" textAnchor="middle" fontSize="16" fontWeight="900"
          fill="#b8860b" opacity="0.4" fontFamily="serif">
          O
        </text>
        <text x="20" y="25" textAnchor="middle" fontSize="16" fontWeight="900"
          fill="#ffe680" opacity="0.7" fontFamily="serif">
          O
        </text>
        {/* Top shine */}
        <ellipse cx="14" cy="12" rx="6" ry="3" fill="white" opacity="0.25" transform="rotate(-20 14 12)" />
      </svg>
    </div>
  );
}

export function CoinStack({ count, size = 20 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.1rem' }}>
      {[...Array(Math.min(count, 3))].map((_, i) => (
        <div key={i} style={{ marginLeft: i > 0 ? -size * 0.3 : 0, zIndex: 3 - i }}>
          <CoinIcon size={size} />
        </div>
      ))}
    </div>
  );
}

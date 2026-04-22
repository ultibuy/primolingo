export default function CoinIcon({ size = 24, animate = false, variant = 'gold' }) {
  const isGold = variant === 'gold';
  const uid = isGold ? 'G' : 'S';
  return (
    <div style={{
      width: size, height: size, display: 'inline-flex',
      animation: animate ? 'coin-spin 0.6s ease-in-out' : 'none',
      perspective: 200,
      flexShrink: 0,
    }}>
      <svg viewBox="0 0 40 40" width={size} height={size}>
        <defs>
          <radialGradient id={`coinOuter${uid}`} cx="35%" cy="35%">
            <stop offset="0%" stopColor={isGold ? '#ffe066' : '#d4d4d8'} />
            <stop offset="40%" stopColor={isGold ? '#fbbf24' : '#a1a1aa'} />
            <stop offset="80%" stopColor={isGold ? '#d4940a' : '#71717a'} />
            <stop offset="100%" stopColor={isGold ? '#92650a' : '#52525b'} />
          </radialGradient>
          <radialGradient id={`coinInner${uid}`} cx="40%" cy="40%">
            <stop offset="0%" stopColor={isGold ? '#ffe680' : '#e4e4e7'} />
            <stop offset="60%" stopColor={isGold ? '#f5c842' : '#a1a1aa'} />
            <stop offset="100%" stopColor={isGold ? '#c8920a' : '#71717a'} />
          </radialGradient>
          <filter id={`coinShadow${uid}`}>
            <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#000" floodOpacity="0.3" />
          </filter>
        </defs>
        <circle cx="20" cy="20" r="18" fill={`url(#coinOuter${uid})`} filter={`url(#coinShadow${uid})`} />
        <circle cx="20" cy="20" r="14" fill={`url(#coinInner${uid})`} />
        <circle cx="20" cy="20" r="17" fill="none" stroke={isGold ? '#ffe680' : '#d4d4d8'} strokeWidth="0.8" opacity="0.6" />
        <circle cx="20" cy="20" r="14" fill="none" stroke={isGold ? '#d4940a' : '#71717a'} strokeWidth="0.6" opacity="0.5" />
        <text x="20" y="25.5" textAnchor="middle" fontSize="16" fontWeight="900"
          fill={isGold ? '#b8860b' : '#52525b'} opacity="0.4" fontFamily="serif">O</text>
        <text x="20" y="25" textAnchor="middle" fontSize="16" fontWeight="900"
          fill={isGold ? '#ffe680' : '#d4d4d8'} opacity="0.7" fontFamily="serif">O</text>
        <ellipse cx="14" cy="12" rx="6" ry="3" fill="white" opacity={isGold ? 0.25 : 0.15} transform="rotate(-20 14 12)" />
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

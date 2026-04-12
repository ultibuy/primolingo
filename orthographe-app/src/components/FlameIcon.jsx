export default function FlameIcon({ size = 40, intensity = 1 }) {
  // intensity: 0=dim, 1=normal, 2=hot, 3=inferno
  const colors = [
    { outer: '#f59e0b', inner: '#fbbf24', core: '#fef3c7' },  // 0-1
    { outer: '#f59e0b', inner: '#fb923c', core: '#fde68a' },  // 2
    { outer: '#ef4444', inner: '#f97316', core: '#fbbf24' },  // 3+
  ];
  const c = colors[Math.min(intensity, 2)];

  return (
    <div style={{
      width: size, height: size, display: 'inline-flex',
      animation: `fire-dance ${1.8 - intensity * 0.2}s ease-in-out infinite`,
    }}>
      <svg viewBox="0 0 48 48" width={size} height={size}>
        <defs>
          <linearGradient id={`flameGrad${intensity}`} x1="0.5" y1="1" x2="0.5" y2="0">
            <stop offset="0%" stopColor={c.outer} />
            <stop offset="50%" stopColor={c.inner} />
            <stop offset="100%" stopColor={c.core} />
          </linearGradient>
          <filter id="flameGlow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Outer flame */}
        <path d="M24 4 C24 4 10 18 10 30 C10 38 16 44 24 44 C32 44 38 38 38 30 C38 18 24 4 24 4Z"
          fill={`url(#flameGrad${intensity})`} filter="url(#flameGlow)" opacity="0.9" />
        {/* Inner flame */}
        <path d="M24 16 C24 16 16 24 16 32 C16 37 19 40 24 40 C29 40 32 37 32 32 C32 24 24 16 24 16Z"
          fill={c.inner} opacity="0.7" />
        {/* Core */}
        <path d="M24 26 C24 26 20 30 20 34 C20 37 22 39 24 39 C26 39 28 37 28 34 C28 30 24 26 24 26Z"
          fill={c.core} opacity="0.9" />
        {/* Spark */}
        <circle cx="18" cy="20" r="1.5" fill={c.core} opacity="0.6">
          <animate attributeName="opacity" values="0.6;0;0.6" dur="1.2s" repeatCount="indefinite" />
          <animate attributeName="cy" values="20;14;20" dur="1.2s" repeatCount="indefinite" />
        </circle>
        <circle cx="30" cy="18" r="1" fill={c.core} opacity="0.5">
          <animate attributeName="opacity" values="0.5;0;0.5" dur="0.9s" repeatCount="indefinite" />
          <animate attributeName="cy" values="18;12;18" dur="0.9s" repeatCount="indefinite" />
        </circle>
      </svg>
    </div>
  );
}

/**
 * PrimoLingo brand logo icon — SVG matching the landing page brand guidelines.
 * Usage: <AppLogo size={48} />
 * Usage: <AppLogo size={48} animated /> — flames flicker
 */
export default function AppLogo({ size = 48, style = {}, animated = false }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      style={{ borderRadius: '22.37%', flexShrink: 0, ...style }}
    >
      <defs>
        <linearGradient id="al-bg" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#1e1e2e"/>
          <stop offset="0.5" stopColor="#2d2b55"/>
          <stop offset="1" stopColor="#1a1a2e"/>
        </linearGradient>
        <linearGradient id="al-r" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#c4b5fd"/>
          <stop offset="1" stopColor="#a78bfa"/>
        </linearGradient>
        <linearGradient id="al-f" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fbbf24"/>
          <stop offset="1" stopColor="#fb923c"/>
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22.37" fill="url(#al-bg)"/>
      <circle cx="14" cy="18" r="0.7" fill="#ffffff" opacity="0.85"/>
      <circle cx="84" cy="14" r="0.6" fill="#ffffff" opacity="0.7"/>
      <circle cx="88" cy="34" r="0.9" fill="#fbbf24" opacity="0.95"/>
      <circle cx="92" cy="62" r="0.55" fill="#c4b5fd" opacity="0.85"/>
      <g transform="translate(82 24)">
        <path d="M0 -3 L0 3 M-3 0 L3 0" stroke="#fbbf24" strokeWidth="0.7" strokeLinecap="round" opacity="0.95"/>
      </g>
      <text x="49" y="92" fontSize="13" fill="#c4b5fd" fontFamily="Fredoka, sans-serif" fontWeight="700" opacity="0.9">é</text>
      <text x="54" y="80" fontSize="14" fill="#fbbf24" fontFamily="Fredoka, sans-serif" fontWeight="700" opacity="0.95">a</text>
      <text x="65" y="94" fontSize="15" fill="#ffffff" fontFamily="Fredoka, sans-serif" fontWeight="700" opacity="0.95">b</text>
      <g transform="translate(-0.23 -7.76) rotate(-20 50 50)">
        <path d="M50 12 Q70 30 70 65 L30 65 Q30 30 50 12 Z" fill="#ffffff"/>
        <path d="M50 12 Q70 30 70 65 L60 65 Q60 30 50 12 Z" fill="url(#al-r)" opacity="0.25"/>
        <circle cx="50" cy="40" r="9" fill="url(#al-r)"/>
        <circle cx="50" cy="40" r="5" fill="#1e1e2e"/>
        <path d="M30 65 L20 84 L38 70 Z" fill="#a78bfa"/>
        <path d="M70 65 L80 84 L62 70 Z" fill="#a78bfa"/>
      </g>
      <g transform="translate(-4.65 -5.54) rotate(-20 50 50)">
        <g className={animated ? 'al-f1' : undefined}>
          <path d="M40 68 Q44 88 48 68 Z" fill="url(#al-f)"/>
        </g>
      </g>
      <g transform="translate(-4.92 -5.42) rotate(-20 50 50)">
        <g className={animated ? 'al-f2' : undefined}>
          <path d="M48 68 Q51 84 55 68 Z" fill="url(#al-f)"/>
          <path d="M55 68 Q58 84 62 68 Z" fill="url(#al-f)"/>
        </g>
      </g>
      <g transform="translate(-4.91 -5.4) rotate(-20 50 50)">
        <g className={animated ? 'al-f3' : undefined}>
          <path d="M62 68 Q66 88 70 68 Z" fill="url(#al-f)"/>
        </g>
      </g>
      {animated && (
        <style>{`
          @keyframes al-flicker {
            0% { transform: scaleY(1) scaleX(1); opacity: 1; }
            100% { transform: scaleY(1.3) scaleX(0.82); opacity: 0.75; }
          }
          .al-f1 { transform-origin: 44px 68px; animation: al-flicker 0.6s ease-in-out infinite alternate; }
          .al-f2 { transform-origin: 55px 68px; animation: al-flicker 0.5s ease-in-out 0.15s infinite alternate; }
          .al-f3 { transform-origin: 66px 68px; animation: al-flicker 0.7s ease-in-out 0.3s infinite alternate; }
        `}</style>
      )}
    </svg>
  );
}

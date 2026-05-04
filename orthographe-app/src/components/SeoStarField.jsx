export default function SeoStarField({ subtle = false }) {
  const opacity = subtle ? 0.62 : 0.8;

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1920 1600"
      preserveAspectRatio="xMidYMid slice"
      style={starFieldStyle}
    >
      <g opacity={opacity}>
        <circle cx="120" cy="180" r="1.4" fill="#fff" opacity="0.85" />
        <circle cx="280" cy="60" r="1" fill="#fff" opacity="0.6" />
        <circle cx="440" cy="240" r="1.6" fill="#fbbf24" opacity="0.9" />
        <circle cx="640" cy="120" r="1" fill="#fff" opacity="0.7" />
        <circle cx="820" cy="280" r="1.2" fill="#c4b5fd" opacity="0.8" />
        <circle cx="1180" cy="220" r="1.4" fill="#fff" opacity="0.7" />
        <circle cx="1380" cy="100" r="1.2" fill="#fbbf24" opacity="0.85" />
        <circle cx="1740" cy="140" r="1.3" fill="#c4b5fd" opacity="0.8" />
        <circle cx="80" cy="420" r="1" fill="#fff" opacity="0.6" />
        <circle cx="380" cy="500" r="1.4" fill="#fbbf24" opacity="0.85" />
        <circle cx="600" cy="460" r="1.1" fill="#fff" opacity="0.7" />
        <circle cx="900" cy="540" r="0.9" fill="#c4b5fd" opacity="0.7" />
        <circle cx="1200" cy="480" r="1.3" fill="#fff" opacity="0.7" />
        <circle cx="1820" cy="500" r="1.2" fill="#fbbf24" opacity="0.85" />
        <circle cx="160" cy="720" r="1.5" fill="#fff" opacity="0.85" />
        <circle cx="400" cy="780" r="1" fill="#c4b5fd" opacity="0.75" />
        <circle cx="700" cy="700" r="1.2" fill="#fff" opacity="0.65" />
        <circle cx="1020" cy="820" r="1.4" fill="#fbbf24" opacity="0.9" />
        <circle cx="1340" cy="740" r="1" fill="#fff" opacity="0.6" />
        <circle cx="1640" cy="800" r="1.3" fill="#c4b5fd" opacity="0.8" />
        <circle cx="80" cy="980" r="1.2" fill="#fff" opacity="0.7" />
        <circle cx="320" cy="1060" r="1" fill="#fff" opacity="0.55" />
        <circle cx="600" cy="1020" r="1.4" fill="#fbbf24" opacity="0.85" />
        <circle cx="900" cy="1100" r="1.1" fill="#c4b5fd" opacity="0.8" />
        <circle cx="1240" cy="1040" r="1.2" fill="#fff" opacity="0.7" />
        <circle cx="1820" cy="1040" r="1.3" fill="#fbbf24" opacity="0.85" />
        <circle cx="120" cy="1300" r="1.4" fill="#fff" opacity="0.8" />
        <circle cx="440" cy="1260" r="1.1" fill="#c4b5fd" opacity="0.75" />
        <circle cx="760" cy="1340" r="1.2" fill="#fff" opacity="0.7" />
        <circle cx="1080" cy="1300" r="1" fill="#fbbf24" opacity="0.85" />
        <circle cx="1400" cy="1380" r="1.3" fill="#fff" opacity="0.65" />
        <circle cx="1720" cy="1320" r="1.1" fill="#c4b5fd" opacity="0.7" />
        <g transform="translate(380 160)" opacity="0.95">
          <path d="M0 -7 L0 7 M-7 0 L7 0" stroke="#fbbf24" strokeWidth="1.6" strokeLinecap="round" />
        </g>
        <g transform="translate(1280 320)" opacity="0.7">
          <path d="M0 -5 L0 5 M-5 0 L5 0" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
        </g>
        <g transform="translate(720 600)" opacity="0.85">
          <path d="M0 -6 L0 6 M-6 0 L6 0" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        </g>
        <g transform="translate(1100 1180)" opacity="0.7">
          <path d="M0 -6 L0 6 M-6 0 L6 0" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}

const starFieldStyle = {
  position: 'fixed',
  inset: 0,
  width: '100%',
  height: '100%',
  pointerEvents: 'none',
  zIndex: 0,
};

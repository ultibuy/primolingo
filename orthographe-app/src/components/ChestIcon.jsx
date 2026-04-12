/**
 * ChestIcon — SVG treasure chest icon with open/closed states.
 *
 * Props:
 *   size  (number, default 40)  — overall width/height in px
 *   open  (boolean, default false) — when true the lid is rotated open
 *         and golden particles are visible
 */
export default function ChestIcon({ size = 40, open = false }) {
  const id = `chest-${size}-${open ? 'o' : 'c'}`;
  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <svg viewBox="0 0 64 64" width={size} height={size}>
        <defs>
          {/* Body gradient — brown to dark brown */}
          <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c48a3f" />
            <stop offset="50%" stopColor="#8b5e2b" />
            <stop offset="100%" stopColor="#5c3a1a" />
          </linearGradient>

          {/* Lid gradient — slightly lighter */}
          <linearGradient id={`${id}-lid`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d9a04e" />
            <stop offset="100%" stopColor="#8b5e2b" />
          </linearGradient>

          {/* Gold for the lock and trim */}
          <linearGradient id={`${id}-gold`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ffe680" />
            <stop offset="100%" stopColor="#c8920a" />
          </linearGradient>
        </defs>

        {/* === Particles (only when open) === */}
        {open && (
          <g>
            <circle cx="20" cy="14" r="2" fill="#fbbf24" opacity="0.9">
              <animate attributeName="cy" from="20" to="6" dur="1.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.9" to="0" dur="1.2s" repeatCount="indefinite" />
            </circle>
            <circle cx="32" cy="10" r="1.8" fill="#ffe066" opacity="0.85">
              <animate attributeName="cy" from="18" to="2" dur="1s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.85" to="0" dur="1s" repeatCount="indefinite" />
            </circle>
            <circle cx="44" cy="12" r="2.2" fill="#fbbf24" opacity="0.8">
              <animate attributeName="cy" from="19" to="4" dur="1.4s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.8" to="0" dur="1.4s" repeatCount="indefinite" />
            </circle>
            <circle cx="26" cy="8" r="1.4" fill="#ffe680" opacity="0.7">
              <animate attributeName="cy" from="16" to="0" dur="0.9s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.7" to="0" dur="0.9s" repeatCount="indefinite" />
            </circle>
            <circle cx="38" cy="11" r="1.6" fill="#fcd34d" opacity="0.75">
              <animate attributeName="cy" from="17" to="3" dur="1.1s" repeatCount="indefinite" />
              <animate attributeName="opacity" from="0.75" to="0" dur="1.1s" repeatCount="indefinite" />
            </circle>
          </g>
        )}

        {/* === Chest body (bottom box) === */}
        <rect
          x="8" y="32" width="48" height="24" rx="3" ry="3"
          fill={`url(#${id}-body)`}
          stroke="#5c3a1a"
          strokeWidth="1"
        />
        {/* Horizontal gold trim band on body */}
        <rect x="8" y="38" width="48" height="4" fill={`url(#${id}-gold)`} opacity="0.5" />

        {/* === Lid (articulated) === */}
        <g
          style={{
            transformOrigin: '8px 32px',
            transform: open ? 'rotate(-45deg)' : 'rotate(0deg)',
            transition: 'transform 0.4s ease-out',
          }}
        >
          {/* Lid shape — rounded top rectangle */}
          <rect
            x="8" y="20" width="48" height="14" rx="3" ry="3"
            fill={`url(#${id}-lid)`}
            stroke="#5c3a1a"
            strokeWidth="1"
          />
          {/* Lid top arch for a barrel-chest look */}
          <ellipse
            cx="32" cy="21" rx="24" ry="5"
            fill={`url(#${id}-lid)`}
            stroke="#5c3a1a"
            strokeWidth="0.8"
          />
          {/* Gold trim on lid */}
          <rect x="8" y="28" width="48" height="3" fill={`url(#${id}-gold)`} opacity="0.4" />
        </g>

        {/* === Hinge dots (visible on both sides) === */}
        <circle cx="11" cy="32" r="2" fill="#8b5e2b" stroke="#5c3a1a" strokeWidth="0.5" />
        <circle cx="53" cy="32" r="2" fill="#8b5e2b" stroke="#5c3a1a" strokeWidth="0.5" />

        {/* === Lock (front, only visible when closed) === */}
        {!open && (
          <g>
            {/* Lock body */}
            <rect x="28" y="33" width="8" height="7" rx="1.5" fill={`url(#${id}-gold)`} stroke="#b8860b" strokeWidth="0.6" />
            {/* Lock shackle (U-shape) */}
            <path
              d="M30 34 L30 30 A2 2 0 0 1 34 30 L34 34"
              fill="none"
              stroke="#c8920a"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            {/* Keyhole */}
            <circle cx="32" cy="37" r="1" fill="#5c3a1a" />
          </g>
        )}
      </svg>
    </div>
  );
}

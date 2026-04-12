import { useEffect, useRef, useState } from 'react';

// ─── Color helpers ───────────────────────────────────────────────

function getBodyColor(health) {
  if (health >= 0.8) return '#67e8f9'; // cyan vivid
  if (health >= 0.5) return '#94a3b8'; // blue-grey
  if (health >= 0.2) return '#64748b'; // dark blue-grey
  return '#475569';                    // grey
}

function getFacetHighlight(health) {
  if (health >= 0.8) return '#a5f3fc'; // bright cyan highlight
  if (health >= 0.5) return '#b0bec5'; // muted highlight
  if (health >= 0.2) return '#78909c';
  return '#546e7a';
}

function getFacetShadow(health) {
  if (health >= 0.8) return '#22d3ee'; // deep cyan shadow
  if (health >= 0.5) return '#78909c'; // muted shadow
  if (health >= 0.2) return '#546e7a';
  return '#37474f';
}

function getFacetDeep(health) {
  if (health >= 0.8) return '#06b6d4'; // deepest cyan
  if (health >= 0.5) return '#607d8b';
  if (health >= 0.2) return '#455a64';
  return '#263238';
}

function getFacetContrast(health) {
  // Returns 0..1 representing how distinct facets should be
  if (health >= 0.8) return 1.0;
  if (health >= 0.5) return 0.4;
  if (health >= 0.2) return 0.15;
  return 0.05;
}

function getHaloConfig(health) {
  if (health >= 0.8) {
    return {
      color: '#67e8f9',
      radius: health >= 1.0 ? 1.5 : 1.2,
      opacity: health >= 1.0 ? 0.5 : 0.25,
      pulseDur: health >= 1.0 ? '2s' : '3s',
      active: true,
      danger: false,
    };
  }
  if (health >= 0.5) {
    return { color: '#67e8f9', radius: 1.0, opacity: 0, active: false, danger: false, pulseDur: '3s' };
  }
  // health < 0.5 — danger red shadow
  return {
    color: '#ef4444',
    radius: 1.2,
    opacity: 0.12,
    active: false,
    danger: true,
    pulseDur: '3s',
  };
}

// ─── Unique ID generator for SVG defs ────────────────────────────

let _idCounter = 0;
function useUniqueId(prefix) {
  const ref = useRef(null);
  if (ref.current === null) {
    ref.current = `${prefix}-${++_idCounter}`;
  }
  return ref.current;
}

// ─── Crack path definitions ──────────────────────────────────────

const CRACK_PATHS = [
  // Crack 1: from top-center down-left
  'M24 14 L22 20 L19 26 L17 31',
  // Crack 2: from top-right branching down
  'M28 17 L30 23 L28 28 L31 34',
  // Crack 3: from mid-left across
  'M16 22 L20 24 L23 28 L21 33',
];

// ─── Main component ──────────────────────────────────────────────

export default function DiamondStatus({ health = 1.0, size = 48, animate = true }) {
  const id = useUniqueId('ds');
  const [cracksRevealed, setCracksRevealed] = useState(health < 0.5);
  const prevHealthRef = useRef(health);

  // Micro-pulse at full health
  const showPulse = animate && health >= 1.0;

  // Trigger crack-draw animation when health drops below 0.5
  useEffect(() => {
    const prev = prevHealthRef.current;
    prevHealthRef.current = health;
    let rafA = null;
    let rafB = null;

    if (health < 0.5 && prev >= 0.5) {
      // Entering cracked state — reset to trigger animation
      rafA = requestAnimationFrame(() => {
        setCracksRevealed(false);
        rafB = requestAnimationFrame(() => setCracksRevealed(true));
      });
    } else if (health >= 0.5) {
      rafA = requestAnimationFrame(() => setCracksRevealed(false));
    } else {
      rafA = requestAnimationFrame(() => setCracksRevealed(true));
    }

    return () => {
      if (rafA !== null) cancelAnimationFrame(rafA);
      if (rafB !== null) cancelAnimationFrame(rafB);
    };
  }, [health]);

  // Clamp health
  const h = Math.max(0, Math.min(1, health));

  // Derived values
  const bodyColor = getBodyColor(h);
  const highlight = getFacetHighlight(h);
  const shadow = getFacetShadow(h);
  const deep = getFacetDeep(h);
  const contrast = getFacetContrast(h);
  const halo = getHaloConfig(h);

  // Crack config
  const crackCount = h >= 0.5 ? 0 : h >= 0.3 ? 1 : h >= 0.1 ? 3 : 3;
  const crackWidth = h >= 0.3 ? 0.8 : h >= 0.1 ? 1.4 : 2.0;
  const crackRedTint = h < 0.2;

  // Sparkle particles config
  const particleCount = h >= 1.0 ? 6 : h >= 0.8 ? 3 : 0;

  // Veil overlay for health 0.5-0.79
  const showVeil = h >= 0.5 && h < 0.8;

  // Tremble for health 0.01-0.19
  const showTremble = animate && h > 0 && h < 0.2;

  // ─── Sparkle particle data ───────────────────────────────────

  const particles = [];
  if (animate && particleCount > 0) {
    const baseOrbitRadius = 18;
    for (let i = 0; i < particleCount; i++) {
      const angle = (360 / particleCount) * i;
      const orbitR = baseOrbitRadius + (i % 3) * 2.5;
      const dur = 2.5 + (i % 3) * 0.8; // 2.5s - 4.1s
      const fadeDur = 1.2 + (i % 2) * 0.6;
      const delay = (i * 0.4);
      particles.push({ angle, orbitR, dur, fadeDur, delay, idx: i });
    }
  }

  // ─── SVG definitions unique IDs ──────────────────────────────

  const haloGradId = `${id}-halo`;
  const bodyGradId = `${id}-body`;
  const highlightGradId = `${id}-hl`;
  const shineId = `${id}-shine`;

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        animation: showTremble
          ? 'diamond-tremble 0.15s linear infinite'
          : showPulse
            ? 'diamond-micro-pulse 4s ease-in-out infinite'
            : 'none',
        transition: 'transform 0.3s ease',
      }}
    >
      <svg
        viewBox="0 0 48 48"
        width={size}
        height={size}
        style={{ overflow: 'visible' }}
      >
        <defs>
          {/* ── Halo radial gradient ── */}
          <radialGradient id={haloGradId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={halo.color} stopOpacity={halo.danger ? 0.25 : 0.6} />
            <stop offset="70%" stopColor={halo.color} stopOpacity={halo.danger ? 0.08 : 0.15} />
            <stop offset="100%" stopColor={halo.color} stopOpacity="0" />
          </radialGradient>

          {/* ── Body gradient (top facet) ── */}
          <linearGradient id={bodyGradId} x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor={highlight} />
            <stop offset="100%" stopColor={bodyColor} />
          </linearGradient>

          {/* ── Highlight gradient for shine ── */}
          <linearGradient id={highlightGradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>

          {/* ── Inner shine (specular) ── */}
          <radialGradient id={shineId} cx="35%" cy="30%" r="40%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={0.35 * contrast} />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* ═══════════════════════════════════════════════════════
            LAYER 2 — Halo (behind diamond)
            ═══════════════════════════════════════════════════════ */}
        {(halo.opacity > 0) && (
          <ellipse
            cx="24"
            cy="24"
            rx={20 * halo.radius}
            ry={18 * halo.radius}
            fill={`url(#${haloGradId})`}
            opacity={halo.opacity}
            style={{
              transformOrigin: '24px 24px',
              transition: 'opacity 0.5s ease, transform 0.5s ease, rx 0.5s ease, ry 0.5s ease',
            }}
          >
            {animate && halo.active && (
              <animateTransform
                attributeName="transform"
                type="scale"
                values="1;1.08;1"
                dur={halo.pulseDur}
                repeatCount="indefinite"
                additive="sum"
              />
            )}
          </ellipse>
        )}

        {/* ═══════════════════════════════════════════════════════
            LAYER 1 — Diamond body (faceted gem)

            Diamond geometry:
              Top-left point:   (10, 18)
              Top-right point:  (38, 18)
              Apex (top):       (24, 4)
              Nadir (bottom):   (24, 44)
              Center-top:       (24, 18)
            ═══════════════════════════════════════════════════════ */}

        {/* ── Top-left facet ── */}
        <polygon
          points="24,4 10,18 24,18"
          fill={highlight}
          style={{ transition: 'fill 1.2s ease-in-out' }}
        />

        {/* ── Top-right facet ── */}
        <polygon
          points="24,4 38,18 24,18"
          fill={bodyColor}
          style={{ transition: 'fill 1.2s ease-in-out' }}
        />

        {/* ── Bottom-left main facet ── */}
        <polygon
          points="10,18 24,44 24,18"
          fill={shadow}
          style={{ transition: 'fill 1.2s ease-in-out' }}
        />

        {/* ── Bottom-right main facet ── */}
        <polygon
          points="38,18 24,44 24,18"
          fill={deep}
          style={{ transition: 'fill 1.2s ease-in-out' }}
        />

        {/* ── Sub-facets for 3D depth (bottom-left split) ── */}
        <polygon
          points="10,18 17,31 24,18"
          fill={shadow}
          opacity={0.3 + 0.5 * contrast}
          style={{ transition: 'fill 1.2s ease-in-out, opacity 1.2s ease-in-out' }}
        />
        <polygon
          points="10,18 17,31 13,24"
          fill={highlight}
          opacity={0.15 * contrast}
          style={{ transition: 'opacity 1.2s ease-in-out' }}
        />

        {/* ── Sub-facets for 3D depth (bottom-right split) ── */}
        <polygon
          points="38,18 31,31 24,18"
          fill={deep}
          opacity={0.3 + 0.5 * contrast}
          style={{ transition: 'fill 1.2s ease-in-out, opacity 1.2s ease-in-out' }}
        />
        <polygon
          points="38,18 31,31 35,24"
          fill={shadow}
          opacity={0.15 * contrast}
          style={{ transition: 'opacity 1.2s ease-in-out' }}
        />

        {/* ── Lower sub-facets ── */}
        <polygon
          points="17,31 24,44 24,18"
          fill={bodyColor}
          opacity={0.2 * contrast}
          style={{ transition: 'opacity 1.2s ease-in-out' }}
        />
        <polygon
          points="31,31 24,44 24,18"
          fill={bodyColor}
          opacity={0.12 * contrast}
          style={{ transition: 'opacity 1.2s ease-in-out' }}
        />

        {/* ── Edge outlines for gem cut definition ── */}
        <line x1="24" y1="4" x2="24" y2="18" stroke={highlight} strokeWidth="0.4" opacity={0.3 * contrast}
          style={{ transition: 'opacity 1.2s ease-in-out' }} />
        <line x1="10" y1="18" x2="38" y2="18" stroke={highlight} strokeWidth="0.4" opacity={0.25 * contrast}
          style={{ transition: 'opacity 1.2s ease-in-out' }} />
        <line x1="10" y1="18" x2="24" y2="44" stroke={highlight} strokeWidth="0.3" opacity={0.15 * contrast}
          style={{ transition: 'opacity 1.2s ease-in-out' }} />
        <line x1="38" y1="18" x2="24" y2="44" stroke={shadow} strokeWidth="0.3" opacity={0.15 * contrast}
          style={{ transition: 'opacity 1.2s ease-in-out' }} />

        {/* ── Inner diagonal facet lines ── */}
        <line x1="17" y1="31" x2="24" y2="18" stroke={highlight} strokeWidth="0.3" opacity={0.2 * contrast}
          style={{ transition: 'opacity 1.2s ease-in-out' }} />
        <line x1="31" y1="31" x2="24" y2="18" stroke={shadow} strokeWidth="0.3" opacity={0.2 * contrast}
          style={{ transition: 'opacity 1.2s ease-in-out' }} />

        {/* ── Specular shine overlay ── */}
        <polygon
          points="24,4 10,18 24,18 38,18"
          fill={`url(#${shineId})`}
          opacity={contrast}
          style={{ transition: 'opacity 1.2s ease-in-out' }}
        />

        {/* ── Top-left specular highlight ── */}
        <polygon
          points="24,4 14,16 22,16"
          fill="white"
          opacity={0.18 * contrast}
          style={{ transition: 'opacity 1.2s ease-in-out' }}
        />

        {/* ── Shine line (the classic gem flash) ── */}
        <path
          d="M16 14 L20 18 L24 10"
          fill="none"
          stroke="white"
          strokeWidth="1"
          opacity={0.35 * contrast}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ transition: 'opacity 1.2s ease-in-out' }}
        />

        {/* ── Veil overlay for health 0.5-0.79 ── */}
        {showVeil && (
          <polygon
            points="24,4 10,18 24,44 38,18"
            fill="white"
          >
            {animate ? (
              <animate
                attributeName="opacity"
                values="0.04;0.12;0.04"
                dur="3s"
                repeatCount="indefinite"
              />
            ) : (
              <set attributeName="opacity" to="0.08" />
            )}
          </polygon>
        )}

        {/* ═══════════════════════════════════════════════════════
            LAYER 4 — Cracks (health < 0.5)
            ═══════════════════════════════════════════════════════ */}
        {h < 0.5 && crackCount > 0 && (
          <g>
            {CRACK_PATHS.slice(0, crackCount).map((d, i) => {
              const pathLength = 30; // approximate
              return (
                <path
                  key={`crack-${i}`}
                  d={d}
                  fill="none"
                  stroke={crackRedTint ? '#ef4444' : '#1e293b'}
                  strokeWidth={crackWidth}
                  strokeOpacity={crackRedTint ? 0.45 : 0.7}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={pathLength}
                  strokeDashoffset={cracksRevealed ? 0 : pathLength}
                  style={{
                    transition: `stroke-dashoffset 0.8s ease-out ${i * 0.15}s`,
                  }}
                />
              );
            })}
            {/* Secondary lighter crack shadows for depth */}
            {crackRedTint && CRACK_PATHS.slice(0, crackCount).map((d, i) => (
              <path
                key={`crack-shadow-${i}`}
                d={d}
                fill="none"
                stroke="#ef4444"
                strokeWidth={crackWidth + 1.5}
                strokeOpacity={0.12}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={30}
                strokeDashoffset={cracksRevealed ? 0 : 30}
                style={{
                  transition: `stroke-dashoffset 0.8s ease-out ${i * 0.15}s`,
                  filter: 'blur(1.5px)',
                }}
              />
            ))}
          </g>
        )}

        {/* ═══════════════════════════════════════════════════════
            LAYER 3 — Sparkle particles
            ═══════════════════════════════════════════════════════ */}
        {animate && particles.map((p) => {
          // Each particle orbits at a unique radius and speed
          const cx = 24;
          const cy = 24;
          // Pre-compute orbit positions (6 keyframe points)
          const steps = 8;
          const cxValues = [];
          const cyValues = [];
          for (let s = 0; s <= steps; s++) {
            const a = ((p.angle + (360 / steps) * s) * Math.PI) / 180;
            const wobble = 1 + 0.15 * Math.sin(s * 1.3);
            cxValues.push((cx + Math.cos(a) * p.orbitR * wobble).toFixed(1));
            cyValues.push((cy + Math.sin(a) * p.orbitR * 0.75 * wobble).toFixed(1));
          }

          return (
            <circle
              key={`sparkle-${p.idx}`}
              r={h >= 1.0 ? 1.3 : 1.0}
              fill="#fef08a"
              style={{ transition: 'opacity 0.3s ease, r 0.3s ease' }}
            >
              {/* Orbit X */}
              <animate
                attributeName="cx"
                values={cxValues.join(';')}
                dur={`${p.dur}s`}
                begin={`${p.delay}s`}
                repeatCount="indefinite"
                calcMode="spline"
                keySplines={Array(steps).fill('0.45 0.05 0.55 0.95').join(';')}
              />
              {/* Orbit Y */}
              <animate
                attributeName="cy"
                values={cyValues.join(';')}
                dur={`${p.dur}s`}
                begin={`${p.delay}s`}
                repeatCount="indefinite"
                calcMode="spline"
                keySplines={Array(steps).fill('0.45 0.05 0.55 0.95').join(';')}
              />
              {/* Fade in/out */}
              <animate
                attributeName="opacity"
                values="0;0.9;0.9;0"
                dur={`${p.fadeDur}s`}
                begin={`${p.delay}s`}
                repeatCount="indefinite"
                keyTimes="0;0.2;0.7;1"
              />
              {/* Size pulse */}
              <animate
                attributeName="r"
                values={h >= 1.0 ? '1.0;1.8;1.0' : '0.8;1.3;0.8'}
                dur={`${p.fadeDur}s`}
                begin={`${p.delay}s`}
                repeatCount="indefinite"
              />
            </circle>
          );
        })}

        {/* ── Gem outline (subtle) ── */}
        <polygon
          points="24,4 10,18 24,44 38,18"
          fill="none"
          stroke={h >= 0.8 ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}
          strokeWidth="0.5"
          strokeLinejoin="round"
          style={{ transition: 'stroke 1.2s ease-in-out' }}
        />
      </svg>

      {/* ── CSS for diamond animations ── */}
      <style>{`
        @keyframes diamond-tremble {
          0%  { transform: translate(0, 0); }
          10% { transform: translate(-1px, 0.5px); }
          20% { transform: translate(1px, -0.5px); }
          30% { transform: translate(-0.5px, -1px); }
          40% { transform: translate(0.5px, 1px); }
          50% { transform: translate(-1px, -0.5px); }
          60% { transform: translate(1px, 0.5px); }
          70% { transform: translate(0.5px, -1px); }
          80% { transform: translate(-0.5px, 1px); }
          90% { transform: translate(1px, -0.5px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes diamond-micro-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.03); }
        }
      `}</style>
    </div>
  );
}

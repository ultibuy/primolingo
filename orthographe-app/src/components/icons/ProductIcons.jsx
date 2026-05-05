/**
 * ProductIcons — SVG icon library for PrimoLingo.
 * All icons: inline SVG, no emoji, configurable via `size` prop.
 * Colors default to design system tokens.
 */

// ─── Crown ──────────────────────────────────────────────────────────────────

export function CrownIcon({ size = 32, active = true }) {
  const opacity = active ? 1 : 0.2;
  return (
    <div style={{ width: size, height: size, display: 'inline-flex', opacity }}>
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
        <rect x="6" y="28" width="36" height="8" rx="3" fill="url(#crownGold)" filter="url(#crownGlow)" />
        <path d="M6 28 L2 12 L14 20 L24 6 L34 20 L46 12 L42 28 Z" fill="url(#crownGold)" filter="url(#crownGlow)" />
        <path d="M6 28 L2 12 L14 20 L24 6 L34 20 L46 12 L42 28 Z" fill="url(#crownShine)" />
        <circle cx="24" cy="22" r="3" fill="#ef4444" opacity="0.85" />
        <circle cx="15" cy="25" r="2.2" fill="#3b82f6" opacity="0.8" />
        <circle cx="33" cy="25" r="2.2" fill="#22c55e" opacity="0.8" />
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

// ─── Trophy ──────────────────────────────────────────────────────────────────

export function TrophyIcon({ size = 24, color = 'var(--color-gold)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 4h10v2.5c0 2.76-2.24 5-5 5s-5-2.24-5-5V4z" fill={color} />
      <path d="M5 4H7v2c0 1.1-.45 2.1-1.17 2.83A4 4 0 014 6V5a1 1 0 011-1z" fill={color} opacity="0.6" />
      <path d="M19 4h-2v2c0 1.1.45 2.1 1.17 2.83A4 4 0 0020 6V5a1 1 0 00-1-1z" fill={color} opacity="0.6" />
      <rect x="10" y="11" width="4" height="4" rx="0.5" fill={color} opacity="0.7" />
      <rect x="8" y="15" width="8" height="2.5" rx="1" fill={color} />
      <rect x="7" y="17.5" width="10" height="1.5" rx="0.75" fill={color} opacity="0.5" />
    </svg>
  );
}

// ─── Lock ────────────────────────────────────────────────────────────────────

export function LockIcon({ size = 24, color = 'var(--text-muted)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="10" width="14" height="11" rx="2.5" fill={color} />
      <path d="M8 10V7a4 4 0 118 0v3" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.5" fill="var(--color-bg1)" />
      <rect x="11.25" y="15.5" width="1.5" height="2.5" rx="0.75" fill="var(--color-bg1)" />
    </svg>
  );
}

// ─── Unlock ──────────────────────────────────────────────────────────────────

export function UnlockIcon({ size = 24, color = 'var(--color-green)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="5" y="10" width="14" height="11" rx="2.5" fill={color} />
      <path d="M8 10V7a4 4 0 017.87-.8" stroke={color} strokeWidth="2.2" fill="none" strokeLinecap="round" />
      <circle cx="12" cy="15" r="1.5" fill="var(--color-bg1)" />
    </svg>
  );
}

// ─── Check ───────────────────────────────────────────────────────────────────

export function CheckIcon({ size = 24, color = 'var(--color-green)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill={color} opacity="0.15" />
      <path d="M7.5 12.5l3 3 6-6" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

// ─── Bookmark ────────────────────────────────────────────────────────────────

export function BookmarkIcon({ size = 24, color = 'var(--color-primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 2a2 2 0 0 0-2 2v17.5a.5.5 0 0 0 .8.4L12 16l7.2 5.9a.5.5 0 0 0 .8-.4V4a2 2 0 0 0-2-2H6Z" fill={color} />
    </svg>
  );
}

// ─── Cross ───────────────────────────────────────────────────────────────────

export function CrossIcon({ size = 24, color = 'var(--color-red)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill={color} opacity="0.15" />
      <path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
    </svg>
  );
}

// ─── Gift ────────────────────────────────────────────────────────────────────

export function GiftIcon({ size = 24, color = 'var(--color-primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="8" width="18" height="4" rx="1.5" fill={color} />
      <rect x="5" y="12" width="14" height="8" rx="1.5" fill={color} opacity="0.75" />
      <rect x="11" y="8" width="2" height="12" fill="var(--color-bg1)" opacity="0.3" />
      <path d="M12 8c-1-3-4-4-4-2s3 2 4 2z" fill={color} opacity="0.9" />
      <path d="M12 8c1-3 4-4 4-2s-3 2-4 2z" fill={color} opacity="0.9" />
    </svg>
  );
}

// ─── Book ────────────────────────────────────────────────────────────────────

export function BookIcon({ size = 24, color = 'var(--color-primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Spine */}
      <rect x="4" y="3" width="3" height="18" rx="1.5" fill={color} opacity="0.6" />
      {/* Cover */}
      <rect x="6" y="3" width="14" height="18" rx="2" fill={color} opacity="0.2" stroke={color} strokeWidth="1.3" />
      {/* Page edges */}
      <rect x="7.5" y="5" width="11" height="14" rx="1" fill={color} opacity="0.08" />
      {/* Text lines */}
      <line x1="10" y1="8.5" x2="16" y2="8.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <line x1="10" y1="11.5" x2="15" y2="11.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.6" />
      <line x1="10" y1="14.5" x2="13.5" y2="14.5" stroke={color} strokeWidth="1.4" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

// ─── Target ──────────────────────────────────────────────────────────────────

export function TargetIcon({ size = 24, color = 'var(--color-primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9.5" stroke={color} strokeWidth="1.8" />
      <circle cx="12" cy="12" r="6" stroke={color} strokeWidth="1.5" opacity="0.65" />
      <circle cx="12" cy="12" r="2.5" stroke={color} strokeWidth="1.5" opacity="0.65" />
      <circle cx="12" cy="12" r="1" fill={color} />
    </svg>
  );
}

// ─── Chart Medal (7j stats) ──────────────────────────────────────────────────

export function ChartMedalIcon({ size = 24, color = 'var(--color-gold)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="9" r="6" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
      <circle cx="12" cy="9" r="3" fill={color} opacity="0.5" />
      <path d="M9 14l-2 7 5-2.5L17 21l-2-7" fill={color} opacity="0.65" />
    </svg>
  );
}

// ─── Chart Trophy (30j stats) ────────────────────────────────────────────────

export function ChartTrophyIcon({ size = 24, color = 'var(--color-gold)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 3h10v3c0 2.76-2.24 5-5 5s-5-2.24-5-5V3z" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5" />
      <path d="M5 3H7v2a3 3 0 01-3 3h0V5a2 2 0 012-2z" fill={color} opacity="0.5" />
      <path d="M19 3h-2v2a3 3 0 003 3h0V5a2 2 0 00-2-2z" fill={color} opacity="0.5" />
      <rect x="10.5" y="10.5" width="3" height="3.5" rx="0.5" fill={color} opacity="0.6" />
      <rect x="8" y="14" width="8" height="2" rx="1" fill={color} />
      <line x1="7" y1="19" x2="17" y2="19" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="8" y1="21" x2="16" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.25" />
    </svg>
  );
}

// ─── Warning ─────────────────────────────────────────────────────────────────

export function WarningIcon({ size = 24, color = 'var(--color-orange)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L1.5 20.5h21L12 2z" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="14" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="17" r="1" fill={color} />
    </svg>
  );
}

// ─── Explosion (diamondBroken, etc.) ─────────────────────────────────────────

export function ExplosionIcon({ size = 24, color = 'var(--color-red)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l2.5 5.5 5.5.8-4 3.9 1 5.8L12 15l-5 3 1-5.8-4-3.9 5.5-.8z" fill={color} opacity="0.2" />
      <path d="M12 5l1.5 3.3 3.3.5-2.4 2.3.6 3.5L12 12.8l-3 1.8.6-3.5-2.4-2.3 3.3-.5z" fill={color} />
    </svg>
  );
}

// ─── Muscle/Strength ─────────────────────────────────────────────────────────

export function StrengthIcon({ size = 24, color = 'var(--color-orange)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 15l2-6h2l1 3h6l1-3h2l2 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="4" cy="15" r="2" fill={color} opacity="0.6" />
      <circle cx="20" cy="15" r="2" fill={color} opacity="0.6" />
      <rect x="9" y="10" width="6" height="4" rx="1" fill={color} opacity="0.3" />
    </svg>
  );
}

// ─── Palette (themes) ────────────────────────────────────────────────────────

export function PaletteIcon({ size = 24, color = 'var(--color-primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2a10 10 0 00-1 19.95c.56.05 1-.4 1-.95v-2.2c0-.83.68-1.5 1.5-1.3a4 4 0 003.4-6.3A10 10 0 0012 2z" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" />
      <circle cx="8" cy="10" r="1.5" fill="#f87171" />
      <circle cx="12" cy="7" r="1.5" fill="#fbbf24" />
      <circle cx="16" cy="10" r="1.5" fill="#34d399" />
      <circle cx="9" cy="14" r="1.5" fill="#60a5fa" />
    </svg>
  );
}

// ─── Tag (titles) ────────────────────────────────────────────────────────────

export function TagIcon({ size = 24, color = 'var(--color-primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 5.5A2.5 2.5 0 015.5 3h5.59a2 2 0 011.41.59l7.41 7.41a2 2 0 010 2.83l-5.59 5.59a2 2 0 01-2.83 0L4.09 12a2 2 0 01-.59-1.41V5.5z" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" />
      <circle cx="7.5" cy="7.5" r="1.5" fill={color} />
    </svg>
  );
}

// ─── Play/Motion (victoryAnimations) ─────────────────────────────────────────

export function MotionIcon({ size = 24, color = 'var(--color-primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill={color} opacity="0.12" stroke={color} strokeWidth="1.5" />
      <path d="M10 8l6 4-6 4V8z" fill={color} />
    </svg>
  );
}

// ─── Burst (entranceAnimations) ──────────────────────────────────────────────

export function BurstIcon({ size = 24, color = 'var(--color-orange)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l1.8 4.4 4.7.4-3.6 3.1 1.2 4.6L12 12l-4.1 2.5 1.2-4.6L5.5 6.8l4.7-.4z" fill={color} />
      <line x1="12" y1="17" x2="12" y2="22" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <line x1="7" y1="18" x2="5" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <line x1="17" y1="18" x2="19" y2="21" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

// ─── Puzzle (mystery image) ──────────────────────────────────────────────────

export function PuzzleIcon({ size = 24, color = 'var(--color-primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7a2 2 0 012-2h3a2 2 0 014 0h3a2 2 0 012 2v3a2 2 0 010 4v3a2 2 0 01-2 2h-3a2 2 0 01-4 0H6a2 2 0 01-2-2v-3a2 2 0 010-4V7z" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" />
    </svg>
  );
}

// ─── Character (persos) ──────────────────────────────────────────────────────

export function CharacterIcon({ size = 24, color = 'var(--color-primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" fill={color} opacity="0.3" stroke={color} strokeWidth="1.5" />
      <path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── Coins (doubleCoins) ─────────────────────────────────────────────────────

export function CoinsIcon({ size = 24, color = 'var(--color-gold)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="10" cy="14" rx="6" ry="3" fill={color} opacity="0.5" />
      <ellipse cx="10" cy="12" rx="6" ry="3" fill={color} opacity="0.7" />
      <ellipse cx="10" cy="10" rx="6" ry="3" fill={color} />
      <ellipse cx="15" cy="12" rx="5" ry="2.5" fill={color} opacity="0.35" />
      <ellipse cx="15" cy="10.5" rx="5" ry="2.5" fill={color} opacity="0.55" />
    </svg>
  );
}

// ─── Handshake (mystere) ─────────────────────────────────────────────────────

export function HandshakeIcon({ size = 24, color = 'var(--color-primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Left arm */}
      <path d="M2 14l3-5h2.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Right arm */}
      <path d="M22 14l-3-5h-2.5" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      {/* Clasped hands */}
      <path d="M7.5 9l2.5 2 2-1.5 2 1.5 2.5-2" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Hand shape */}
      <path d="M10 11c-1 1-1 2.5 0 3.5l2 1.5 2-1.5c1-1 1-2.5 0-3.5" fill={color} opacity="0.2" stroke={color} strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

// ─── QuestionMark (questionMystery) ──────────────────────────────────────────

export function QuestionMarkIcon({ size = 24, color = 'var(--color-primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill={color} opacity="0.12" stroke={color} strokeWidth="1.5" />
      <path d="M9.5 9a3 3 0 015.5 1.5c0 1.5-2.5 2-2.5 3.5" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="12" cy="17" r="1" fill={color} />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Emotion placeholder SVGs — shown in shop when no character sprite is available
// ═══════════════════════════════════════════════════════════════════════════════

// ─── Walk (default) ─────────────────────────────────────────────────────────

export function EmotionWalkIcon({ size = 46, color = 'var(--color-primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 46 46" fill="none" aria-hidden="true">
      <circle cx="23" cy="10" r="5" fill={color} opacity="0.7" />
      <path d="M23 16v10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M23 26l-5 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M23 26l5 10" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M17 20l6 2 6-2" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Sleep ──────────────────────────────────────────────────────────────────

export function EmotionSleepIcon({ size = 46, color = 'var(--color-primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 46 46" fill="none" aria-hidden="true">
      <circle cx="23" cy="10" r="5" fill={color} opacity="0.7" />
      <path d="M23 16v6c0 2-2 4-4 5h8c-2-1-4-3-4-5z" fill={color} opacity="0.4" />
      <ellipse cx="23" cy="30" rx="7" ry="3" fill={color} opacity="0.25" />
      <text x="30" y="12" fontFamily="var(--font-kid)" fontSize="8" fontWeight="700" fill={color} opacity="0.8">Z</text>
      <text x="34" y="7" fontFamily="var(--font-kid)" fontSize="6" fontWeight="700" fill={color} opacity="0.5">z</text>
    </svg>
  );
}

// ─── Sit ────────────────────────────────────────────────────────────────────

export function EmotionSitIcon({ size = 46, color = 'var(--color-primary)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 46 46" fill="none" aria-hidden="true">
      <circle cx="23" cy="10" r="5" fill={color} opacity="0.7" />
      <path d="M23 16v8" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M23 24h-6v8h12v-8z" fill={color} opacity="0.15" stroke={color} strokeWidth="1.5" rx="2" />
      <path d="M17 20l6 2 6-2" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Wave (Salut) ───────────────────────────────────────────────────────────

export function EmotionWaveIcon({ size = 46 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
      <defs>
        <linearGradient id="emo-wave-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4b5fd"/>
          <stop offset="1" stopColor="#a78bfa"/>
        </linearGradient>
      </defs>
      {/* Face */}
      <circle cx="44" cy="54" r="22" fill="url(#emo-wave-grad)"/>
      {/* Eyes */}
      <circle cx="36" cy="50" r="3" fill="#1e1e2e"/>
      <circle cx="37.2" cy="48.8" r="1" fill="#fff"/>
      <circle cx="52" cy="50" r="3" fill="#1e1e2e"/>
      <circle cx="53.2" cy="48.8" r="1" fill="#fff"/>
      {/* Smile */}
      <path d="M36 60 Q44 68 52 60" stroke="#1e1e2e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Cheeks */}
      <circle cx="28" cy="58" r="3" fill="#fbbf24" opacity="0.55"/>
      <circle cx="60" cy="58" r="3" fill="#fbbf24" opacity="0.55"/>
      {/* Arm raised waving */}
      <path d="M64 46 L76 28" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="78" cy="25" r="4.5" fill="#fbbf24"/>
      {/* Wave motion lines */}
      <path d="M84 18 Q88 23 84 28" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
      <path d="M88 14 Q93 20 88 26" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4"/>
      {/* Other arm down */}
      <path d="M24 60 L14 76" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  );
}

// ─── Kiss (Bisou) ───────────────────────────────────────────────────────────

export function EmotionKissIcon({ size = 46 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
      <defs>
        <linearGradient id="emo-kiss-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4b5fd"/>
          <stop offset="1" stopColor="#a78bfa"/>
        </linearGradient>
      </defs>
      {/* Face */}
      <circle cx="44" cy="54" r="22" fill="url(#emo-kiss-grad)"/>
      {/* Winking eye (left — closed arc) */}
      <path d="M33 48 Q36 44 39 48" stroke="#1e1e2e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Open eye (right) */}
      <circle cx="52" cy="48" r="3" fill="#1e1e2e"/>
      <circle cx="53.2" cy="46.8" r="1" fill="#fff"/>
      {/* Cheeks */}
      <circle cx="28" cy="58" r="3" fill="#f87171" opacity="0.55"/>
      <circle cx="60" cy="58" r="3" fill="#f87171" opacity="0.4"/>
      {/* Puckered lips */}
      <ellipse cx="41" cy="62" rx="4.5" ry="3.5" fill="#1e1e2e"/>
      <ellipse cx="41" cy="62" rx="3" ry="2.2" fill="#f87171" opacity="0.7"/>
      {/* Big heart */}
      <path d="M70 24c-1-4-8-4-8 2 0 6 8 10 8 10s8-4 8-10c0-6-7-6-8-2z" fill="#f87171" opacity="0.9"/>
      {/* Small hearts */}
      <path d="M82 12c-.5-2-4-2-4 1s4 5 4 5 4-2 4-5c0-3-3.5-3-4-1z" fill="#f87171" opacity="0.5"/>
      <path d="M62 12c-.4-1.5-3-1.5-3 1s3 3.5 3 3.5 3-1 3-3.5c0-2.5-2.6-2.5-3-1z" fill="#f87171" opacity="0.35"/>
    </svg>
  );
}

// ─── Clap (Bravo) ───────────────────────────────────────────────────────────

export function EmotionClapIcon({ size = 46 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
      <defs>
        <linearGradient id="emo-clap-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4b5fd"/>
          <stop offset="1" stopColor="#a78bfa"/>
        </linearGradient>
      </defs>
      {/* Face */}
      <circle cx="38" cy="44" r="22" fill="url(#emo-clap-grad)"/>
      {/* Star eyes */}
      <g transform="translate(30 41)"><path d="M0 -4.5 L1.2 -1.2 L4.5 -1 L1.5 1 L2.5 4.5 L0 2.5 L-2.5 4.5 L-1.5 1 L-4.5 -1 L-1.2 -1.2 Z" fill="#fbbf24"/></g>
      <g transform="translate(46 41)"><path d="M0 -4.5 L1.2 -1.2 L4.5 -1 L1.5 1 L2.5 4.5 L0 2.5 L-2.5 4.5 L-1.5 1 L-4.5 -1 L-1.2 -1.2 Z" fill="#fbbf24"/></g>
      {/* Big filled smile */}
      <path d="M28 50 Q38 60 48 50 Q44 56 38 56 Q32 56 28 50 Z" fill="#1e1e2e"/>
      {/* Cheeks */}
      <circle cx="22" cy="50" r="3" fill="#fbbf24" opacity="0.55"/>
      <circle cx="54" cy="50" r="3" fill="#fbbf24" opacity="0.55"/>
      {/* Clapping hands (bottom) */}
      <g transform="translate(26 78) rotate(-20)"><path d="M-7 -7 L5 -7 Q8 -7 8 -4 L8 6 Q8 9 5 9 L-7 9 Q-10 9 -10 6 L-10 -4 Q-10 -7 -7 -7 Z" fill="url(#emo-clap-grad)"/></g>
      <g transform="translate(50 78) rotate(20)"><path d="M-5 -7 L7 -7 Q10 -7 10 -4 L10 6 Q10 9 7 9 L-5 9 Q-8 9 -8 6 L-8 -4 Q-8 -7 -5 -7 Z" fill="url(#emo-clap-grad)"/></g>
    </svg>
  );
}

// ─── Victory (Victoire) ─────────────────────────────────────────────────────

export function EmotionVictoryIcon({ size = 46 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
      <defs>
        <linearGradient id="emo-vict-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4b5fd"/>
          <stop offset="1" stopColor="#a78bfa"/>
        </linearGradient>
      </defs>
      {/* Face */}
      <circle cx="44" cy="58" r="22" fill="url(#emo-vict-grad)"/>
      {/* Happy arc eyes */}
      <path d="M34 52 Q37 47 40 52" stroke="#1e1e2e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M48 52 Q51 47 54 52" stroke="#1e1e2e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Big smile */}
      <path d="M33 64 Q44 74 55 64" stroke="#1e1e2e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      {/* Cheeks */}
      <circle cx="28" cy="62" r="3" fill="#fbbf24" opacity="0.55"/>
      <circle cx="60" cy="62" r="3" fill="#fbbf24" opacity="0.55"/>
      {/* Both arms raised */}
      <path d="M22 52 L8 32" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="6" cy="29" r="4.5" fill="#fbbf24"/>
      <path d="M66 52 L80 32" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round"/>
      <circle cx="82" cy="29" r="4.5" fill="#fbbf24"/>
      {/* Impact lines */}
      <path d="M38 26 L36 16" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
      <path d="M44 24 L44 13" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.55"/>
      <path d="M50 26 L52 16" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" opacity="0.7"/>
      {/* Star */}
      <path d="M16 16 L17.2 19.8 L21 20 L17.5 22.2 L18.5 26 L16 23.5 L13.5 26 L14.5 22.2 L11 20 L14.8 19.8Z" fill="#fbbf24" opacity="0.75"/>
    </svg>
  );
}

// ─── Dance (Danse) ──────────────────────────────────────────────────────────

export function EmotionDanceIcon({ size = 46 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
      <defs>
        <linearGradient id="emo-danse-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4b5fd"/>
          <stop offset="1" stopColor="#a78bfa"/>
        </linearGradient>
      </defs>
      <g transform="rotate(-15 42 50)">
        <circle cx="42" cy="50" r="22" fill="url(#emo-danse-grad)"/>
        <path d="M32 46 Q36 42 40 46" stroke="#1e1e2e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M44 46 Q48 42 52 46" stroke="#1e1e2e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <path d="M32 54 Q42 62 52 54" stroke="#1e1e2e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
        <circle cx="26" cy="54" r="3" fill="#fbbf24" opacity="0.55"/>
        <circle cx="58" cy="54" r="3" fill="#fbbf24" opacity="0.55"/>
      </g>
      <g transform="translate(76 28)">
        <ellipse cx="0" cy="6" rx="5" ry="4" fill="#fbbf24" transform="rotate(-15)"/>
        <rect x="3" y="-12" width="2.8" height="18" rx="0.5" fill="#fbbf24"/>
        <path d="M5.8 -12 Q12 -10, 10 -3" stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      </g>
      <g transform="translate(86 56) scale(0.65)">
        <ellipse cx="0" cy="6" rx="5" ry="4" fill="#fbbf24" transform="rotate(-15)" opacity="0.85"/>
        <rect x="3" y="-12" width="2.8" height="18" rx="0.5" fill="#fbbf24" opacity="0.85"/>
      </g>
      <g transform="translate(14 28) scale(0.55)">
        <ellipse cx="0" cy="6" rx="5" ry="4" fill="#fbbf24" transform="rotate(-15)" opacity="0.7"/>
        <rect x="3" y="-12" width="2.8" height="18" rx="0.5" fill="#fbbf24" opacity="0.7"/>
      </g>
      <path d="M16 82 Q22 78, 28 82 Q34 86, 40 82" stroke="#c4b5fd" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
      <path d="M52 84 Q58 80, 64 84 Q70 88, 76 84" stroke="#c4b5fd" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

// ─── Surprise ───────────────────────────────────────────────────────────────

export function EmotionSurpriseIcon({ size = 46 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
      <defs>
        <linearGradient id="emo-surp-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4b5fd"/>
          <stop offset="1" stopColor="#a78bfa"/>
        </linearGradient>
      </defs>
      <circle cx="42" cy="52" r="22" fill="url(#emo-surp-grad)"/>
      <circle cx="34" cy="48" r="4.5" fill="#1e1e2e"/>
      <circle cx="50" cy="48" r="4.5" fill="#1e1e2e"/>
      <circle cx="35.5" cy="46" r="1.5" fill="#fff"/>
      <circle cx="51.5" cy="46" r="1.5" fill="#fff"/>
      <ellipse cx="42" cy="60" rx="4" ry="5" fill="#1e1e2e"/>
      <circle cx="26" cy="56" r="3" fill="#fbbf24" opacity="0.55"/>
      <circle cx="58" cy="56" r="3" fill="#fbbf24" opacity="0.55"/>
      <g transform="translate(78 32)">
        <rect x="-3" y="-14" width="6" height="14" rx="2.5" fill="#fbbf24"/>
        <circle cx="0" cy="6" r="3" fill="#fbbf24"/>
      </g>
      <path d="M14 28 L8 22" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M22 16 L24 8" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M44 12 L44 4" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
      <path d="M62 16 L66 8" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" opacity="0.7"/>
    </svg>
  );
}

// ─── Think (Hesitation) ─────────────────────────────────────────────────────

export function EmotionThinkIcon({ size = 46 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
      <defs>
        <linearGradient id="emo-hes-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#c4b5fd"/>
          <stop offset="1" stopColor="#a78bfa"/>
        </linearGradient>
      </defs>
      <circle cx="38" cy="50" r="22" fill="url(#emo-hes-grad)"/>
      <circle cx="30" cy="48" r="3" fill="#1e1e2e"/>
      <circle cx="31" cy="46.5" r="1" fill="#fff"/>
      <path d="M42 48 Q46 50 50 48" stroke="#1e1e2e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <path d="M25 39 L34 36" stroke="#1e1e2e" strokeWidth="2.2" strokeLinecap="round"/>
      <path d="M30 60 Q34 58 38 60 Q42 62 46 60" stroke="#1e1e2e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
      <circle cx="22" cy="56" r="2.5" fill="#fbbf24" opacity="0.4"/>
      <circle cx="54" cy="56" r="2.5" fill="#fbbf24" opacity="0.4"/>
      <ellipse cx="74" cy="32" rx="14" ry="9" fill="#c4b5fd" fillOpacity="0.25" stroke="#c4b5fd" strokeWidth="1.5"/>
      <circle cx="69" cy="32" r="1.6" fill="#c4b5fd"/>
      <circle cx="74" cy="32" r="1.6" fill="#c4b5fd"/>
      <circle cx="79" cy="32" r="1.6" fill="#c4b5fd"/>
      <circle cx="62" cy="44" r="2.5" fill="#c4b5fd" fillOpacity="0.25" stroke="#c4b5fd" strokeWidth="1"/>
      <circle cx="58" cy="50" r="1.5" fill="#c4b5fd" fillOpacity="0.25" stroke="#c4b5fd" strokeWidth="0.8"/>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════

// ─── IceShield (streakFreeze) ────────────────────────────────────────────────

export function IceShieldIcon({ size = 24, color = '#93c5fd' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2L4 6v5c0 5.25 3.4 10.15 8 11.4 4.6-1.25 8-6.15 8-11.4V6l-8-4z" fill={color} opacity="0.2" stroke={color} strokeWidth="1.5" />
      <path d="M12 7v10M8 12h8M9.5 8.5l5 7M14.5 8.5l-5 7" stroke={color} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

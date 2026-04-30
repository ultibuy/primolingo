/**
 * Shared diamond-level UI blocks used by both RuleCard and DicteeCard.
 *
 * DiamondReviewBadge  → "⏰ Révision due" badge (goes in BaseCard's `extra` slot)
 * DiamondHealthSection → health bar + "💎 Maîtrisée" message (goes in `belowProgress` slot)
 */

// ── Health color thresholds ─────────────────────────────────────────────────

function healthColor(health) {
  if (health >= 0.8) return '#4ade80';
  if (health >= 0.5) return '#fbbf24';
  return '#f87171';
}

function healthGradient(health) {
  if (health >= 0.8) return 'linear-gradient(90deg, #4ade80, #22c55e)';
  if (health >= 0.5) return 'linear-gradient(90deg, #fbbf24, #f59e0b)';
  return 'linear-gradient(90deg, #f87171, #ef4444)';
}

// ── Badge "Révision due" ────────────────────────────────────────────────────

export function DiamondReviewBadge({ isDue, isDiamondLevel }) {
  if (!isDue || !isDiamondLevel) return null;

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: 'rgba(251,146,0,0.12)', borderRadius: 8,
      padding: '0.3rem 0.7rem', border: '1px solid rgba(251,146,0,0.25)',
      marginBottom: '0.6rem',
    }}>
      <span style={{ fontSize: '0.8rem' }}>⏰</span>
      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fb923c' }}>
        Révision due
      </span>
    </div>
  );
}

// ── Barre de santé diamant + message "brillant" ─────────────────────────────

export function DiamondHealthSection({ isDiamondLevel, isDue, health, progressDesc }) {
  if (!isDiamondLevel || isDue) return null;

  return (
    <>
      {/* Barre de santé */}
      <div style={{ marginBottom: '0.8rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{progressDesc}</span>
          <span style={{ fontSize: '0.72rem', fontWeight: 700, color: healthColor(health) }}>
            {Math.round(health * 100)}%
          </span>
        </div>
        <div style={{
          height: 6, borderRadius: 3,
          background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${Math.round(health * 100)}%`,
            background: healthGradient(health),
            borderRadius: 3,
            transition: 'width 0.6s ease',
          }} />
        </div>
      </div>

      {/* Message "diamant brillant" */}
      {health >= 0.8 && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(96,165,250,0.08), rgba(var(--color-primary-rgb),0.08))',
          borderRadius: 10, padding: '0.5rem 0.8rem', marginBottom: '0.8rem',
          border: '1px solid rgba(96,165,250,0.12)', textAlign: 'center',
          fontSize: '0.78rem', color: '#60a5fa', fontWeight: 600,
        }}>
          💎 Maîtrisée — diamant brillant
        </div>
      )}
    </>
  );
}

import LevelPath from './LevelPath.jsx';

/**
 * BaseCard — shell générique partagé par RuleCard et DicteeCard.
 *
 * Slots JSX :
 *   header        — titre + sous-titre (rendu en haut, avant LevelPath)
 *   extra         — contenu entre LevelPath et la barre de progression
 *   belowProgress — contenu entre la barre de progression et le bouton
 *
 * La barre de progression et le bouton sont gérés ici car leur structure
 * est identique dans les deux cartes ; les différences sont passées en props.
 */
export default function BaseCard({
  // ── container ───────────────────────────────────────────────────────────
  locked = false,
  cardStyle = {},       // surcharge totale du style du container

  // ── slots JSX ───────────────────────────────────────────────────────────
  header = null,
  extra = null,
  belowProgress = null,

  // ── LevelPath ───────────────────────────────────────────────────────────
  ruleLevel = 0,
  progressPct = 0,
  onLevelHelp,
  pandaMood = null,
  characterId = 'panda',
  onCharacterClick,

  // ── barre de progression ────────────────────────────────────────────────
  showProgress = false,
  progressDesc = '',
  progressFraction = '',
  progressColor = '#6b7280',
  progressFractionColor,  // si absent, utilise progressColor
  progressBarExtraStyle = {},

  // ── bouton action ────────────────────────────────────────────────────────
  buttonText,             // absent → bouton non rendu
  buttonDisabled = false,
  buttonStyle = {},
  onPlay,

  // ── bug report (partagé grammaire + dictée) ─────────────────────────────
  onBugReport,            // absent → bouton non rendu
}) {
  const defaultCardStyle = {
    width: '100%',
    minWidth: 0,
    boxSizing: 'border-box',
    background: locked ? 'rgba(255,255,255,0.03)' : 'var(--glass-bg)',
    borderRadius: 'var(--radius-md)',
    padding: '1.4rem 1.5rem',
    border: locked
      ? '1px solid rgba(255,255,255,0.04)'
      : '1px solid var(--glass-border)',
    boxShadow: locked ? 'none' : 'var(--shadow-md)',
    backdropFilter: 'blur(var(--blur-md))',
    WebkitBackdropFilter: 'blur(var(--blur-md))',
    opacity: locked ? 0.45 : 1,
    transition: 'all var(--motion-base)',
    filter: locked ? 'grayscale(0.7)' : 'none',
    position: 'relative',
    ...cardStyle,
  };

  const fractionColor = progressFractionColor ?? progressColor;

  return (
    <div style={defaultCardStyle}>

      {/* Bouton bug report — coin supérieur droit */}
      {onBugReport && (
        <button
          type="button"
          title="Signaler un problème"
          onClick={(e) => { e.stopPropagation(); onBugReport(); }}
          style={{
            position: 'absolute', top: 8, right: 8,
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-xs)', padding: '2px 6px',
            fontSize: '0.75rem', cursor: 'pointer',
            lineHeight: 1.5, zIndex: 2, opacity: 0.55,
          }}
        >
          🐛
        </button>
      )}

      {/* Slot header */}
      {header && (
        <div style={{ marginBottom: '0.5rem' }}>
          {header}
        </div>
      )}

      {/* LevelPath */}
      <div style={{ marginBottom: '0.6rem' }}>
        <LevelPath
          currentLevel={ruleLevel}
          progress={progressPct}
          onNodeClick={onLevelHelp}
          onCharacterClick={onCharacterClick}
          pandaMood={pandaMood}
          characterId={characterId}
        />
      </div>

      {/* Slot extra (ex : badge "révision due") */}
      {extra}

      {/* Barre de progression vers le niveau suivant */}
      {showProgress && (
        <div style={{ marginBottom: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>{progressDesc}</span>
            {progressFraction && (
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: fractionColor }}>
                {progressFraction}
              </span>
            )}
          </div>
          <div style={{ height: 6, borderRadius: 3, background: 'var(--glass-bg)', overflow: 'hidden' }}>
            <div style={{
              height: '100%',
              width: `${Math.round(progressPct * 100)}%`,
              background: `linear-gradient(90deg, ${progressColor}cc, ${progressColor})`,
              borderRadius: 3,
              transition: 'width 0.6s ease',
              ...progressBarExtraStyle,
            }} />
          </div>
        </div>
      )}

      {/* Slot belowProgress (ex : barre santé diamant, texte niveau 0) */}
      {belowProgress}

      {/* Bouton action */}
      {buttonText !== undefined && buttonText !== null && (
        <button
          type="button"
          onClick={onPlay}
          disabled={buttonDisabled}
          style={{
            width: '100%',
            minWidth: 0,
            boxSizing: 'border-box',
            padding: '12px 24px',
            borderRadius: 'var(--radius-pill)',
            border: 'none',
            background: 'var(--gradient-brand)',
            color: 'var(--text-white)',
            cursor: buttonDisabled ? 'default' : 'pointer',
            fontSize: 14,
            fontWeight: 700,
            boxShadow: 'var(--shadow-glow)',
            transition: 'all var(--motion-base)',
            ...buttonStyle,
          }}
        >
          {buttonText}
        </button>
      )}

    </div>
  );
}

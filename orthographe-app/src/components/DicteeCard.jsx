import BaseCard from './BaseCard.jsx';
import DiamondStatus from './DiamondStatus.jsx';
import { DiamondReviewBadge, DiamondHealthSection } from './DiamondSection.jsx';
import { calculateDiamondHealth, getToday } from '../engine/sm2.js';
import { computeCardStyle, computeButtonStyle, formatDate } from '../engine/cardStyles.js';

const LEVEL_LABELS = {
  level1: { label: 'Aventurier', color: '#FFC107' },
  level2: { label: 'Héros',      color: '#4CAF50' },
  level3: { label: 'Légende',    color: '#9C27B0' },
};

const LEVEL_CONFIG = {
  0: { label: 'Pas commencé',   color: '#6b7280', button: 'Commencer' },
  1: { label: 'Bronze',         color: '#cd7f32', button: "S'entraîner" },
  2: { label: 'Argent',         color: '#c0c0c0', button: "S'entraîner" },
  3: { label: 'Couronne',       color: '#fbbf24', button: "S'entraîner" },
  4: { label: 'Diamant',        color: '#60a5fa', button: 'Réviser',    mode: 'reconstruct' },
  5: { label: 'Diamant vivant', color: '#67e8f9', button: 'Réviser',    mode: 'reconstruct' },
};

const DICTEE_GUIDED_SIZE = 40;
const DICTEE_RECONSTRUCT_SIZE = 10;

function getLevelProgress(level, rp, wordCount = 20) {
  if (!rp || level === 0) {
    return { fraction: '', pct: 0, desc: 'Lance une première session pour commencer' };
  }
  // Guided mode (level 1) uses full session, reconstruct (level 2+) uses shorter session
  const sessionSize = level >= 2
    ? Math.min(DICTEE_RECONSTRUCT_SIZE, wordCount)
    : Math.min(DICTEE_GUIDED_SIZE, wordCount);
  const t80 = Math.ceil(sessionSize * 0.8);
  const t90 = Math.ceil(sessionSize * 0.9);
  switch (level) {
    case 1: {
      const n = Math.min(rp.guidedSessionsAbove80 || 0, 3);
      const rem = 3 - n;
      return { fraction: `${n}/3`, pct: n / 3, desc: `Fais ${rem} session${rem > 1 ? 's' : ''} avec ${t80}/${sessionSize} mots ou mieux` };
    }
    case 2: {
      const n = Math.min(rp.directSessionsAbove80 || 0, 3);
      const rem = 3 - n;
      return { fraction: `${n}/3`, pct: n / 3, desc: `Fais ${rem} session${rem > 1 ? 's' : ''} en mode reconstruct avec ${t80}/${sessionSize} ou mieux` };
    }
    case 3: {
      const n = Math.min(rp.directConsecutiveAbove90 || 0, 3);
      const rem = 3 - n;
      return { fraction: `${n}/3`, pct: n / 3, desc: `Fais ${rem} session${rem > 1 ? 's' : ''} consécutive${rem > 1 ? 's' : ''} avec ${t90}/${sessionSize} ou mieux` };
    }
    case 4:
    case 5: {
      const sm2 = rp.sm2;
      if (!sm2) return { fraction: '', pct: 1, desc: 'Diamant obtenu' };
      const health = calculateDiamondHealth(sm2);
      const nextDate = sm2.nextReviewDate;
      const isDue = nextDate <= getToday();
      return {
        fraction: isDue ? 'Due' : '',
        pct: health,
        desc: isDue ? 'Révision disponible maintenant' : `Prochaine révision : ${formatDate(nextDate)}`,
        health,
        isDue,
      };
    }
    default:
      return { fraction: '', pct: 1, desc: 'Diamant obtenu !' };
  }
}

export default function DicteeCard({
  dictee,
  level,
  progress,
  locked,
  onPlay,
  onLevelHelp,
  wordCount,
  isFirst = false,
  pandaMood = null,
  characterId = 'panda',
  onCharacterClick,
  onBugReport,
}) {
  const levelConfig = LEVEL_LABELS[level] || LEVEL_LABELS.level1;
  const ruleLevel = Math.min(progress?.level || 0, 5);
  const config = LEVEL_CONFIG[ruleLevel] || LEVEL_CONFIG[0];
  const prog = getLevelProgress(ruleLevel, progress, wordCount);
  const progressPct = Math.max(0, Math.min(1, prog.pct));
  const subtitle = `${levelConfig.label} · ${wordCount} mot${wordCount > 1 ? 's' : ''}`;

  const isDiamondLevel = ruleLevel >= 4;
  const isDue = prog.isDue || false;
  const health = prog.health ?? 1.0;
  const recentTrophy = progress?.recentTrophy || false;

  // ── Variante compacte "À découvrir" (non commencée) ──────────────────────
  if (ruleLevel === 0) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center',
        background: isFirst ? 'rgba(var(--color-primary-rgb),0.08)' : 'rgba(255,255,255,0.04)',
        border: isFirst ? '1px solid rgba(var(--color-primary-rgb),0.3)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: 14, padding: '0.7rem 1rem',
        gap: '0.7rem',
        opacity: locked ? 0.45 : 1,
        filter: locked ? 'grayscale(0.7)' : 'none',
        cursor: locked ? 'default' : 'pointer',
        flexWrap: 'wrap', position: 'relative',
      }}>
        {onBugReport && (
          <button type="button" title="Signaler un problème"
            onClick={(e) => { e.stopPropagation(); onBugReport({ type: 'dictee', title: dictee.title, id: dictee.id, level }); }}
            style={{
              position: 'absolute', top: 8, right: 8,
              background: 'rgba(255,255,255,0.07)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8, padding: '2px 6px',
              fontSize: '0.75rem', cursor: 'pointer',
              lineHeight: 1.5, zIndex: 2, opacity: 0.55,
            }}>🐛</button>
        )}
        <span style={{ fontSize: '1rem', opacity: 0.4 }}>🔒</span>
        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.7rem', flexWrap: 'nowrap' }}>
            <span style={{
              color: 'var(--color-accent)', fontSize: '0.88rem', fontWeight: 700,
              flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {dictee.title}
            </span>
            {!locked && (
              <button type="button" onClick={() => onPlay?.(dictee, level)} style={{
                padding: '0.45rem 0.9rem', borderRadius: 10, border: 'none',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                color: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0,
                boxShadow: isFirst ? '0 2px 12px rgba(124,58,237,0.35)' : '0 2px 8px rgba(124,58,237,0.25)',
              }}>
                Commencer
              </button>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {isFirst && (
              <span style={{
                display: 'inline-flex', alignSelf: 'flex-start', whiteSpace: 'nowrap',
                fontSize: '0.6rem',
                background: 'rgba(var(--color-primary-rgb),0.2)', color: 'var(--color-accent)',
                padding: '0.1rem 0.45rem', borderRadius: 4, fontWeight: 700, letterSpacing: '0.02em',
              }}>
                Prochaine dictée recommandée
              </span>
            )}
            <span style={{
              fontSize: '0.62rem', color: '#6b7280', fontWeight: 700,
              background: 'rgba(107,114,128,0.15)', padding: '0.1rem 0.4rem', borderRadius: 4,
            }}>
              {subtitle}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ── Carte complète via BaseCard ──────────────────────────────────────────

  const cardStyle = computeCardStyle(isDue, recentTrophy);

  let buttonText = config.button;
  if (isDue && isDiamondLevel) buttonText = 'Réviser';
  else if (isDiamondLevel && !isDue) buttonText = 'À jour';

  const buttonDisabled = isDiamondLevel && !isDue;
  const buttonStyle = computeButtonStyle({ buttonDisabled, isDue, ruleLevel });

  // Slot header
  const header = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)', margin: 0 }}>
          {dictee.title}
        </h3>
        <p style={{ fontSize: '0.73rem', color: '#6b7280', margin: '0.15rem 0 0', lineHeight: 1.4 }}>
          {subtitle}
        </p>
      </div>
      {isDiamondLevel && (
        <div style={{ display: 'flex', flexShrink: 0, marginLeft: '0.6rem', alignItems: 'center' }}>
          <div onClick={(e) => { e.stopPropagation(); onLevelHelp?.('diamond_status'); }} style={{ cursor: 'pointer' }}>
            <DiamondStatus health={health} size={38} />
          </div>
        </div>
      )}
    </div>
  );

  // Barre de progression : non-diamant ou diamant dû
  const showProgress = (!isDiamondLevel || isDue) && ruleLevel > 0;
  const progressFractionColor = progressPct >= 1 ? '#4ade80' : config.color;
  const progressBarExtraStyle = progressPct > 0 && progressPct < 1
    ? { backgroundSize: '200% 100%', animation: 'progress-shimmer 3s ease infinite' }
    : {};

  return (
    <BaseCard
      locked={locked && !isDiamondLevel}
      cardStyle={cardStyle}
      header={header}
      extra={<DiamondReviewBadge isDue={isDue} isDiamondLevel={isDiamondLevel} />}
      belowProgress={
        <DiamondHealthSection
          isDiamondLevel={isDiamondLevel}
          isDue={isDue}
          health={health}
          progressDesc={prog.desc}
        />
      }

      ruleLevel={ruleLevel}
      progressPct={progressPct}
      onLevelHelp={onLevelHelp}
      pandaMood={pandaMood}
      characterId={characterId}
      onCharacterClick={onCharacterClick}

      showProgress={showProgress}
      progressDesc={prog.desc}
      progressFraction={prog.fraction}
      progressColor={config.color}
      progressFractionColor={progressFractionColor}
      progressBarExtraStyle={progressBarExtraStyle}

      buttonText={locked ? undefined : buttonText}
      buttonDisabled={buttonDisabled}
      buttonStyle={buttonStyle}
      onPlay={(e) => { e?.stopPropagation?.(); onPlay?.(dictee, level); }}
      onBugReport={onBugReport ? () => onBugReport({ type: 'dictee', title: dictee.title, id: dictee.id, level }) : undefined}
    />
  );
}

import CoinIcon from './CoinIcon.jsx';
import CrownIcon from './CrownIcon.jsx';
import DiamondIcon from './DiamondIcon.jsx';
import DiamondStatus from './DiamondStatus.jsx';
import LevelPath from './LevelPath.jsx';
import { calculateDiamondHealth, getToday, parseLocalDate } from '../engine/sm2.js';

const LEVEL_CONFIG = {
  0: {
    label: 'Pas commencé',
    color: '#6b7280',
    button: 'Découvrir',
    mode: 'guided',
  },
  1: {
    label: 'Découverte',
    color: '#cd7f32',
    button: "S'entraîner",
    mode: 'guided',
  },
  2: {
    label: 'Entraînement',
    color: '#c0c0c0',
    button: 'Mode direct',
    mode: 'direct',
  },
  3: {
    label: 'Couronne',
    color: '#fbbf24',
    button: 'Viser le diamant',
    mode: 'direct',
  },
  4: {
    label: 'Diamant',
    color: '#60a5fa',
    button: 'Réviser',
    mode: 'direct',
  },
  5: {
    label: 'Diamant vivant',
    color: '#67e8f9',
    button: 'Réviser',
    mode: 'direct',
  },
};

function getRuleLevel(ruleProgress) {
  if (!ruleProgress) return 0;
  if (ruleProgress.level !== undefined) return ruleProgress.level;
  // Derive from old V1 progress if level not set
  if (ruleProgress.hasDiamond) return ruleProgress.sm2 ? 5 : 4;
  if (ruleProgress.hasCrown) return 3;
  if (ruleProgress.directUnlocked) return 2;
  const guided = ruleProgress.guidedSessionsCompleted || 0;
  if (guided >= 1) return 1;
  return 0;
}

function sessionSize() {
  try { return window.__ORTHO_SESSION_SIZE__ || 20; } catch { return 20; }
}
function scoreLabel(pct) {
  const n = sessionSize();
  return `${Math.ceil(n * pct / 100)}/${n}`;
}

function getLevelProgress(level, rp) {
  if (!rp) return { fraction: '0/1', pct: 0, desc: 'Complète 1 session guidée' };

  const guidedAbove80 = rp.guidedSessionsAbove80 || 0;
  const guidedBest = rp.guidedBestScore || 0;
  const directAbove80 = rp.directSessionsAbove80 || 0;
  const directBest = rp.directBestScore || 0;
  const directAbove90 = rp.directConsecutiveAbove90 || rp.directPerfectStreak || 0;

  switch (level) {
    case 0:
      return {
        fraction: `${Math.min(rp.guidedSessionsCompleted || 0, 1)}/1`,
        pct: Math.min(rp.guidedSessionsCompleted || 0, 1),
        desc: 'Complète 1 session guidée',
      };
    case 1: {
      const countGood = Math.min(guidedAbove80, 3);
      return {
        fraction: `${countGood}/3`,
        pct: countGood / 3,
        desc: countGood > 0
          ? `${countGood}/3 sessions guidées ≥ ${scoreLabel(80)}`
          : `Score ≥ ${scoreLabel(80)} en guidé`,
      };
    }
    case 2: {
      const countDirect = Math.min(directAbove80, 3);
      return {
        fraction: `${countDirect}/3`,
        pct: countDirect / 3,
        desc: countDirect > 0
          ? `${countDirect}/3 sessions directes ≥ ${scoreLabel(80)}`
          : `Score ≥ ${scoreLabel(80)} en direct`,
      };
    }
    case 3: {
      const count = Math.min(directAbove90, 3);
      return {
        fraction: `${count}/3`,
        pct: count / 3,
        desc: `${count}/3 sessions directes ≥ ${scoreLabel(90)} d'affilée`,
      };
    }
    case 4:
    case 5: {
      // Diamond with SM-2
      const sm2 = rp.sm2;
      if (!sm2) {
        return {
          fraction: '',
          pct: 1,
          desc: 'Diamant obtenu',
        };
      }
      const health = calculateDiamondHealth(sm2);
      const nextDate = sm2.nextReviewDate;
      const today = getToday();
      const isDue = nextDate <= today;
      return {
        fraction: isDue ? 'Due' : '',
        pct: health,
        desc: isDue
          ? 'Révision disponible maintenant'
          : `Prochaine révision : ${formatDate(nextDate)}`,
        health,
        isDue,
        nextDate,
      };
    }
    default:
      return { fraction: '', pct: 0, desc: '' };
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = parseLocalDate(dateStr);
  const today = parseLocalDate(getToday());
  if (!d || !today) return '';
  const diff = Math.round((d - today) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "aujourd'hui";
  if (diff === 1) return 'demain';
  if (diff < 7) return `dans ${diff} jours`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

export default function RuleCard({ rule, ruleProgress, onPlay, onLevelHelp, onEditRule, onOpenMemo }) {
  const level = getRuleLevel(ruleProgress);
  const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[0];
  const prog = getLevelProgress(level, ruleProgress);
  const progressPct = Math.max(0, Math.min(1, prog.pct));

  const isDiamondLevel = level >= 4;
  const isDue = prog.isDue || false;
  const health = prog.health ?? 1.0;
  const recentTrophy = ruleProgress?.recentTrophy || false;

  // Determine button text and mode
  let buttonText = config.button;
  let buttonMode = config.mode;

  if (isDue && isDiamondLevel) {
    buttonText = 'Réviser';
    buttonMode = 'direct';
  } else if (isDiamondLevel && !isDue) {
    buttonText = 'À jour';
  } else if (level === 0) {
    buttonText = 'Découvrir';
    buttonMode = 'guided';
  }

  const buttonDisabled = isDiamondLevel && !isDue;

  // Card border styles
  const cardBorder = isDue
    ? '1.5px solid rgba(251,146,0,0.5)'
    : recentTrophy
      ? '1px solid rgba(251,191,36,0.35)'
      : '1px solid rgba(255,255,255,0.08)';

  const cardBackground = isDue
    ? 'linear-gradient(135deg, rgba(251,146,0,0.06) 0%, rgba(255,255,255,0.04) 100%)'
    : recentTrophy
      ? 'linear-gradient(135deg, rgba(251,191,36,0.08) 0%, rgba(255,255,255,0.06) 100%)'
      : 'rgba(255,255,255,0.06)';

  const cardAnimation = isDue
    ? 'review-pulse 3s ease-in-out infinite'
    : recentTrophy
      ? 'card-glow 4s ease-in-out infinite'
      : 'none';
  const hasMemo = !!(rule.memoCard?.title || rule.memoCard?.rows?.length);

  return (
    <div style={{
      background: cardBackground,
      borderRadius: 20,
      padding: '1.4rem 1.5rem',
      border: cardBorder,
      boxShadow: recentTrophy
        ? '0 0 30px rgba(251,191,36,0.1)'
        : '0 4px 24px rgba(0,0,0,0.2)',
      transition: 'all 0.4s ease',
      animation: cardAnimation,
    }}>
      {/* Header: title + level icon */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '0.5rem',
      }}>
        <div style={{ flex: 1 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)', margin: 0, display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap' }}>
            {hasMemo ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenMemo?.(rule);
                }}
                style={{
                  padding: 0,
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--color-accent)',
                  cursor: 'pointer',
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                  textAlign: 'left',
                }}
                title="Ouvrir la fiche mémo"
              >
                {rule.title}
              </button>
            ) : (
              rule.title
            )}
            {onEditRule && (
              <button
                onClick={(e) => { e.stopPropagation(); onEditRule(rule.id); }}
                style={{
                  background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)',
                  borderRadius: 6, padding: '0.15rem 0.35rem', cursor: 'pointer',
                  fontSize: '0.6rem', color: '#f87171', fontWeight: 700, flexShrink: 0,
                }}
                title="Debug: éditer la règle"
              >
                ✏️
              </button>
            )}
          </h3>
          <p style={{
            fontSize: '0.73rem', color: '#6b7280',
            margin: '0.15rem 0 0', lineHeight: 1.4,
          }}>
            {rule.description}
          </p>
        </div>

        {/* Level icon — only show for diamond level (others are redundant with LevelPath) */}
        {isDiamondLevel && (
          <div style={{
            display: 'flex', flexShrink: 0, marginLeft: '0.6rem',
            alignItems: 'center',
          }}>
            <div
              onClick={(e) => { e.stopPropagation(); onLevelHelp && onLevelHelp('diamond_status'); }}
              style={{ cursor: 'pointer' }}
            >
              <DiamondStatus health={health} size={38} />
            </div>
          </div>
        )}
      </div>

      {/* Level path */}
      <div style={{ marginBottom: '0.6rem' }}>
        <LevelPath currentLevel={level} progress={progressPct} onNodeClick={onLevelHelp} />
      </div>

      {/* Due review badge */}
      {isDue && isDiamondLevel && (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
          background: 'rgba(251,146,0,0.12)', borderRadius: 8,
          padding: '0.3rem 0.7rem',
          border: '1px solid rgba(251,146,0,0.25)',
          marginBottom: '0.6rem',
        }}>
          <span style={{ fontSize: '0.8rem' }}>⏰</span>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#fb923c' }}>
            Révision due
          </span>
        </div>
      )}

      {/* Progress toward next level */}
      {(!isDiamondLevel || isDue) && level > 0 && (
        <div style={{ marginBottom: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
              {prog.desc}
            </span>
            {prog.fraction && (
              <span style={{
                fontSize: '0.72rem', fontWeight: 700,
                color: progressPct >= 1 ? '#4ade80' : config.color,
              }}>
                {prog.fraction}
              </span>
            )}
          </div>
          <div style={{
            height: 6, borderRadius: 3,
            background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${Math.round(progressPct * 100)}%`,
              background: `linear-gradient(90deg, ${config.color}cc, ${config.color})`,
              borderRadius: 3,
              transition: 'width 0.6s ease',
              backgroundSize: '200% 100%',
              animation: progressPct > 0 && progressPct < 1 ? 'progress-shimmer 3s ease infinite' : 'none',
            }} />
          </div>
        </div>
      )}

      {/* Diamond health bar for diamond levels when not due */}
      {isDiamondLevel && !isDue && (
        <div style={{ marginBottom: '0.8rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
              {prog.desc}
            </span>
            <span style={{
              fontSize: '0.72rem', fontWeight: 700,
              color: health >= 0.8 ? '#4ade80' : health >= 0.5 ? '#fbbf24' : '#f87171',
            }}>
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
              background: health >= 0.8
                ? 'linear-gradient(90deg, #4ade80, #22c55e)'
                : health >= 0.5
                  ? 'linear-gradient(90deg, #fbbf24, #f59e0b)'
                  : 'linear-gradient(90deg, #f87171, #ef4444)',
              borderRadius: 3,
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      )}

      {/* Level 0: invite text */}
      {level === 0 && (
        <div style={{
          marginBottom: '0.8rem',
          padding: '0.5rem 0.7rem',
          background: 'rgba(var(--color-accent-rgb),0.05)',
          borderRadius: 10,
          border: '1px dashed rgba(var(--color-accent-rgb),0.15)',
        }}>
          <p style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.5, margin: 0 }}>
            Découvre cette règle avec une session guidée. Le pavé de décision t'accompagne.
          </p>
        </div>
      )}

      {/* Diamond fully OK message */}
      {isDiamondLevel && !isDue && health >= 0.8 && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(96,165,250,0.08), rgba(var(--color-primary-rgb),0.08))',
          borderRadius: 10, padding: '0.5rem 0.8rem',
          marginBottom: '0.8rem',
          border: '1px solid rgba(96,165,250,0.12)',
          textAlign: 'center',
          fontSize: '0.78rem', color: '#60a5fa', fontWeight: 600,
        }}>
          💎 Maîtrisée — diamant brillant
        </div>
      )}

      {/* Action button */}
      <button
        onClick={() => !buttonDisabled && onPlay(rule.id, buttonMode)}
        disabled={buttonDisabled}
        style={{
          width: '100%',
          padding: '0.8rem',
          borderRadius: 12,
          border: 'none',
          background: buttonDisabled
            ? 'rgba(255,255,255,0.06)'
            : isDue
              ? 'linear-gradient(135deg, #ea580c, #fb923c)'
              : level <= 1
                ? 'linear-gradient(135deg, #7c3aed, var(--color-primary))'
                : level <= 2
                  ? 'linear-gradient(135deg, #059669, #34d399)'
                  : level === 3
                    ? 'linear-gradient(135deg, #d97706, #fbbf24)'
                    : 'linear-gradient(135deg, #2563eb, #60a5fa)',
          color: buttonDisabled ? '#6b7280' : '#fff',
          cursor: buttonDisabled ? 'default' : 'pointer',
          fontSize: '0.95rem',
          fontWeight: 700,
          boxShadow: buttonDisabled
            ? 'none'
            : isDue
              ? '0 4px 15px rgba(234,88,12,0.3)'
              : '0 4px 15px rgba(0,0,0,0.2)',
          transition: 'all 0.15s ease',
        }}
      >
        {level === 0 ? '▶  ' : ''}
        {buttonText}
      </button>
    </div>
  );
}

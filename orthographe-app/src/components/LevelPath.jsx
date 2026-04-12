import CrownIcon from './CrownIcon.jsx';
import DiamondIcon from './DiamondIcon.jsx';

const LEVELS = [
  { label: 'Découverte', icon: '⭐', color: '#cd7f32' },
  { label: 'Entraînement', icon: '⭐', color: '#c0c0c0' },
  { label: 'Couronne', icon: 'crown', color: '#fbbf24' },
  { label: 'Diamant', icon: 'diamond', color: '#60a5fa' },
  { label: 'Vivant', icon: 'diamond-spark', color: '#67e8f9' },
];

export default function LevelPath({ currentLevel, progress = 0 }) {
  // currentLevel: 0 (not started) to 5 (diamond vivant)
  // progress: 0-1 toward next level

  const maxLevel = LEVELS.length;

  return (
    <div
      role="progressbar"
      aria-valuenow={currentLevel}
      aria-valuemin={0}
      aria-valuemax={maxLevel}
      aria-label={`Niveau ${currentLevel} sur ${maxLevel}`}
      style={{
        display: 'flex', alignItems: 'center', gap: 0,
        padding: '0.3rem 0',
      }}
    >
      {LEVELS.map((lvl, i) => {
        const levelNum = i + 1;
        const isCurrent = currentLevel === levelNum;
        const isCompleted = currentLevel > levelNum;
        const isFuture = currentLevel < levelNum;
        const isLast = i === LEVELS.length - 1;

        return (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            {/* Node */}
            <div
              aria-hidden="true"
              style={{
                position: 'relative',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: isCurrent ? 36 : 26,
                height: isCurrent ? 36 : 26,
                borderRadius: '50%',
                background: isCompleted
                  ? `${lvl.color}33`
                  : isCurrent
                    ? `${lvl.color}44`
                    : 'rgba(255,255,255,0.04)',
                border: isCurrent
                  ? `2px solid ${lvl.color}`
                  : isCompleted
                    ? `1.5px solid ${lvl.color}88`
                    : '1.5px solid rgba(255,255,255,0.08)',
                transition: 'all 0.4s ease',
                flexShrink: 0,
                animation: isCurrent ? 'subtle-float 3s ease-in-out infinite' : 'none',
              }}
            >
              {isCompleted ? (
                <svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L19 7" stroke={lvl.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : lvl.icon === 'crown' ? (
                <CrownIcon size={isCurrent ? 20 : 14} active={isCurrent || isCompleted} animate={isCurrent} />
              ) : lvl.icon === 'diamond' ? (
                <DiamondIcon size={isCurrent ? 20 : 14} active={isCurrent || isCompleted} animate={isCurrent} />
              ) : lvl.icon === 'diamond-spark' ? (
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <DiamondIcon size={isCurrent ? 18 : 12} active={isCurrent || isCompleted} animate={isCurrent} />
                  {(isCurrent || isCompleted) && (
                    <span style={{
                      position: 'absolute', top: -4, right: -6,
                      fontSize: isCurrent ? '0.5rem' : '0.4rem',
                      animation: 'glow-gold 2s ease-in-out infinite',
                    }}>
                      ✨
                    </span>
                  )}
                </div>
              ) : (
                <span style={{
                  fontSize: isCurrent ? '0.9rem' : '0.65rem',
                  opacity: isFuture ? 0.3 : 1,
                  filter: isCurrent ? `drop-shadow(0 0 4px ${lvl.color})` : 'none',
                }}>
                  {lvl.icon}
                </span>
              )}
            </div>

            {/* Connector bar */}
            {!isLast && (
              <div
                aria-hidden="true"
                style={{
                  width: 16, height: 3, borderRadius: 2,
                  background: 'rgba(255,255,255,0.06)',
                  position: 'relative', overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {/* Filled portion */}
                <div style={{
                  position: 'absolute', top: 0, left: 0,
                  height: '100%',
                  width: isCompleted
                    ? '100%'
                    : isCurrent
                      ? `${Math.round(progress * 100)}%`
                      : '0%',
                  background: isCompleted
                    ? LEVELS[i + 1].color
                    : isCurrent
                      ? LEVELS[i + 1].color
                      : 'transparent',
                  borderRadius: 2,
                  transition: 'width 0.6s ease',
                  opacity: 0.7,
                }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

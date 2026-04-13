import CrownIcon from './CrownIcon.jsx';
import DiamondIcon from './DiamondIcon.jsx';

const LEVELS = [
  { label: 'Bronze', icon: 'bronze', color: '#cd7f32' },
  { label: 'Argent', icon: 'silver', color: '#c0c0c0' },
  { label: 'Couronne', icon: 'crown', color: '#fbbf24' },
  { label: 'Diamant', icon: 'diamond', color: '#60a5fa' },
];

const NODE_SIZE = 28;
const NODE_ACTIVE = 34;
const BAR_H = 3;
const N = LEVELS.length; // 4

const LEVEL_KEYS = ['bronze', 'silver', 'crown', 'diamond'];

export default function LevelPath({ currentLevel, progress = 0, onNodeClick }) {
  const lvl = Math.max(0, Math.min(currentLevel, 5));

  // Each node sits at center of its flex column = at positions 12.5%, 37.5%, 62.5%, 87.5%
  // (i.e. (2*i+1) / (2*N) * 100%)
  // The bar track goes from center of first node to center of last node.
  const firstCenter = 100 / (2 * N);          // 12.5%
  const lastCenter = 100 - 100 / (2 * N);     // 87.5%
  const trackWidth = lastCenter - firstCenter; // 75%

  // Fill width: how many segments completed out of (N-1) segments
  const segments = N - 1; // 3
  const completedSegments = Math.max(0, Math.min(lvl - 1, segments));
  const partialSegment = (lvl >= 1 && lvl <= N) ? progress : 0;
  const fillFraction = Math.min((completedSegments + partialSegment) / segments, 1);

  // The fill bar goes from firstCenter to firstCenter + fillFraction * trackWidth
  const fillWidthPct = fillFraction * trackWidth;

  // Pick gradient colors
  const fromColor = LEVELS[0].color;
  const toIdx = Math.min(Math.max(lvl - 1, 0), N - 1);
  const toColor = LEVELS[toIdx].color;

  return (
    <div
      role="progressbar"
      aria-valuenow={lvl}
      aria-valuemin={0}
      aria-valuemax={N}
      aria-label={`Niveau ${lvl} sur ${N}`}
      style={{
        position: 'relative',
        display: 'flex',
        justifyContent: 'space-between',
        padding: '0.15rem 0',
        minHeight: NODE_ACTIVE + 20,
      }}
    >
      {/* Grey track: from center of node 0 to center of node 3 */}
      <div aria-hidden="true" style={{
        position: 'absolute',
        top: NODE_ACTIVE / 2 - BAR_H / 2,
        left: `${firstCenter}%`,
        width: `${trackWidth}%`,
        height: BAR_H,
        borderRadius: BAR_H,
        background: 'rgba(255,255,255,0.07)',
        zIndex: 0,
      }} />

      {/* Colored fill: same start, width proportional to progress */}
      {fillWidthPct > 0 && (
        <div aria-hidden="true" style={{
          position: 'absolute',
          top: NODE_ACTIVE / 2 - BAR_H / 2,
          left: `${firstCenter}%`,
          width: `${fillWidthPct}%`,
          height: BAR_H,
          borderRadius: BAR_H,
          background: `linear-gradient(90deg, ${fromColor}, ${toColor})`,
          zIndex: 1,
          transition: 'width 0.6s ease',
        }} />
      )}

      {/* Nodes */}
      {LEVELS.map((level, i) => {
        const num = i + 1;
        const isCurrent = lvl === num || (lvl >= 5 && num === 4);
        const isCompleted = lvl > num;
        const isFuture = lvl < num;
        const sz = isCurrent ? NODE_ACTIVE : NODE_SIZE;

        return (
          <div key={level.label} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '0.2rem', zIndex: 2, flex: '1 1 0', minWidth: 0,
            cursor: onNodeClick ? 'pointer' : 'default',
          }}
            onClick={() => onNodeClick && onNodeClick(LEVEL_KEYS[i])}
          >
            <div style={{
              width: sz, height: sz,
              borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              // Opaque backgrounds so the bar doesn't show through
              background: isCompleted
                ? '#2a2840'
                : isCurrent
                  ? '#2a2840'
                  : '#22213a',
              border: isCurrent
                ? `2.5px solid ${level.color}`
                : isCompleted
                  ? `2px solid ${level.color}90`
                  : '1.5px solid rgba(255,255,255,0.1)',
              boxShadow: isCurrent
                ? `0 0 12px ${level.color}40, inset 0 0 8px ${level.color}15`
                : isCompleted
                  ? `inset 0 0 6px ${level.color}10`
                  : 'none',
              transition: 'all 0.3s ease',
              flexShrink: 0,
            }}>
              {isCompleted ? (
                <svg width={12} height={12} viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L19 7" stroke={level.color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : level.icon === 'crown' ? (
                <CrownIcon size={isCurrent ? 18 : 13} active={isCurrent} animate={false} />
              ) : level.icon === 'diamond' ? (
                <DiamondIcon size={isCurrent ? 18 : 13} active={isCurrent} animate={false} />
              ) : (
                <span style={{
                  fontSize: isCurrent ? '0.65rem' : '0.55rem',
                  fontWeight: 900,
                  color: isFuture ? `${level.color}40` : level.color,
                }}>
                  {level.icon === 'bronze' ? '★' : '★★'}
                </span>
              )}
            </div>
            <span style={{
              fontSize: '0.55rem',
              fontWeight: isCurrent ? 800 : 600,
              color: isCurrent ? '#e2e2e2' : isCompleted ? '#9ca3af' : '#4b5563',
              textAlign: 'center',
            }}>
              {level.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

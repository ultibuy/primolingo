import { getStreakInfo } from '../engine/scoring.js';
import CosmeticFlameIcon from './CosmeticFlameIcon.jsx';

export default function Streak({ streak, shields, flameId = null }) {
  const info = getStreakInfo(streak);
  if (!streak || streak.current === 0) return null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      background: 'rgba(251,191,36,0.08)',
      borderRadius: 10, padding: '0.35rem 0.7rem',
      border: '1px solid rgba(251,191,36,0.15)',
    }}>
      <CosmeticFlameIcon size={28} intensity={streak.current >= 7 ? 1 : 0} flameId={flameId} />
      <span style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1rem' }}>
        {streak.current}j
      </span>
      {shields > 0 && (
        <span style={{ fontSize: '0.8rem', marginLeft: '0.1rem' }} title={`${shields} bouclier(s)`}>
          {'🛡️'.repeat(shields)}
        </span>
      )}
    </div>
  );
}

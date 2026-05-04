/**
 * Debug page that renders reward popups with fixtures.
 * Dev mode only.
 * Usage: /debug/reward?case=couronne
 */
import { useSearchParams, Link } from 'react-router-dom';
import { rewardFixtures, REWARD_FIXTURE_KEYS } from '../debug/rewardFixtures.js';
import CrownIcon from '../components/CrownIcon.jsx';
import DiamondIcon from '../components/DiamondIcon.jsx';
import FlameIcon from '../components/FlameIcon.jsx';
import ShieldIcon from '../components/ShieldIcon.jsx';
import {
  TrophyIcon, UnlockIcon, WarningIcon, ExplosionIcon, StrengthIcon,
} from '../components/icons/ProductIcons.jsx';
import RewardAmount from '../components/rewards/RewardAmount.jsx';

function OverlayIcon({ type }) {
  const s = 64;
  switch (type) {
    case 'flame':     return <FlameIcon size={s} intensity={2} />;
    case 'crown':     return <CrownIcon size={s} animate={false} />;
    case 'diamond':   return <DiamondIcon size={s} animate />;
    case 'shield':    return <ShieldIcon size={s} />;
    case 'trophy':    return <TrophyIcon size={s} color="var(--color-gold)" />;
    case 'unlock':    return <UnlockIcon size={s} color="var(--color-green)" />;
    case 'warning':   return <WarningIcon size={s} />;
    case 'explosion': return <ExplosionIcon size={s} />;
    case 'strength':  return <StrengthIcon size={s} />;
    default:          return <TrophyIcon size={s} color="var(--color-gold)" />;
  }
}

export default function DebugRewardPage() {
  const [params] = useSearchParams();
  const caseName = params.get('case') || REWARD_FIXTURE_KEYS[0];
  const fixture = rewardFixtures[caseName];

  if (!fixture) {
    return (
      <div style={{ padding: '2rem', color: '#fff', fontFamily: 'var(--font-body)' }}>
        <h1>Case "{caseName}" not found</h1>
        <ul>{REWARD_FIXTURE_KEYS.map(k => <li key={k}><Link to={`/debug/reward?case=${k}`}>{k}</Link></li>)}</ul>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-body)', color: '#fff', padding: '1rem',
    }}>
      <div style={{
        textAlign: 'center', padding: '2.5rem 2rem',
        background: 'rgba(var(--color-bg1-rgb),0.85)', borderRadius: 24,
        border: '1px solid rgba(var(--color-accent-rgb),0.2)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.5)', maxWidth: 420,
        animation: 'bounce-in 0.5s ease forwards',
      }}>
        <div style={{ marginBottom: '0.8rem', display: 'flex', justifyContent: 'center' }}>
          <div style={{
            width: 72, height: 72, borderRadius: 'var(--radius-md)',
            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'glow-gold 2s ease-in-out infinite',
          }}>
            <OverlayIcon type={fixture.iconType} />
          </div>
        </div>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 800, margin: '0 0 0.3rem', textAlign: 'center' }}>
          {fixture.title}
        </h3>
        {fixture.amount && (
          <div style={{ display: 'flex', justifyContent: 'center', margin: '0.5rem 0' }}>
            <RewardAmount value={fixture.amount} unit="coins" size="md" glow />
          </div>
        )}
        {fixture.sub && (
          <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', fontWeight: 500, textAlign: 'center', margin: '0.3rem 0 0', lineHeight: 1.5 }}>
            {fixture.sub}
          </p>
        )}
      </div>
    </div>
  );
}

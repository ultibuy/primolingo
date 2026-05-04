/**
 * RewardAmount — displays a numeric gain/score in Fredoka with the right icon.
 *
 * <RewardAmount value="+25" unit="coins" />
 * <RewardAmount value="20/20" unit="score" tone="success" />
 * <RewardAmount value="+100" unit="crown" />
 */
import CoinIcon from '../CoinIcon.jsx';
import CrownIcon from '../CrownIcon.jsx';
import DiamondIcon from '../DiamondIcon.jsx';
import FlameIcon from '../FlameIcon.jsx';
import ShieldIcon from '../ShieldIcon.jsx';
import { TrophyIcon } from '../icons/ProductIcons.jsx';

const UNIT_CONFIG = {
  coins:   { Icon: CoinIcon, color: 'var(--color-gold)',    iconProps: { size: 22 } },
  score:   { Icon: null,     color: 'var(--color-green)' },
  crown:   { Icon: CrownIcon, color: 'var(--color-gold)',   iconProps: { size: 22, animate: false } },
  diamond: { Icon: DiamondIcon, color: '#60a5fa',           iconProps: { size: 22, animate: false } },
  flame:   { Icon: FlameIcon, color: 'var(--color-orange)', iconProps: { size: 22, intensity: 1 } },
  shield:  { Icon: ShieldIcon, color: '#93c5fd',            iconProps: { size: 22 } },
  trophy:  { Icon: TrophyIcon, color: 'var(--color-gold)',  iconProps: { size: 22 } },
};

const TONE_COLORS = {
  reward:  'var(--color-gold)',
  success: 'var(--color-green)',
  diamond: '#60a5fa',
  danger:  'var(--color-red)',
};

export default function RewardAmount({ value, unit = 'coins', tone, size = 'md', glow = false }) {
  const cfg = UNIT_CONFIG[unit] || UNIT_CONFIG.coins;
  const color = tone ? (TONE_COLORS[tone] || cfg.color) : cfg.color;

  const fontSize = size === 'lg' ? '2rem' : size === 'sm' ? '1rem' : '1.4rem';

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      fontFamily: 'var(--font-kid)',
      fontWeight: 700,
      fontSize,
      color,
      lineHeight: 1.1,
      ...(glow ? { textShadow: `0 0 16px ${color}50` } : {}),
    }}>
      {cfg.Icon && <cfg.Icon {...(cfg.iconProps || {})} />}
      {value}
    </span>
  );
}

/**
 * RewardMoment — standard surface for gratification moments.
 *
 * <RewardMoment
 *   icon="crown"
 *   kicker="Niveau Couronne"
 *   title="Couronne gagnée"
 *   amount="+100"
 *   unit="coins"
 *   description="Tu maîtrises cette règle sans aide."
 *   actionLabel="Continuer"
 *   onAction={fn}
 * />
 */
import CoinIcon from '../CoinIcon.jsx';
import { CrownIcon } from '../icons/ProductIcons.jsx';
import DiamondIcon from '../DiamondIcon.jsx';
import FlameIcon from '../FlameIcon.jsx';
import ShieldIcon from '../ShieldIcon.jsx';
import {
  TrophyIcon, GiftIcon, LockIcon, UnlockIcon,
  CheckIcon, WarningIcon, ExplosionIcon, StrengthIcon,
} from '../icons/ProductIcons.jsx';
import RewardAmount from './RewardAmount.jsx';

const ICON_MAP = {
  coins:     (s) => <CoinIcon size={s} />,
  crown:     (s) => <CrownIcon size={s} />,
  diamond:   (s) => <DiamondIcon size={s} animate />,
  flame:     (s) => <FlameIcon size={s} intensity={2} />,
  shield:    (s) => <ShieldIcon size={s} />,
  trophy:    (s) => <TrophyIcon size={s} color="var(--color-gold)" />,
  gift:      (s) => <GiftIcon size={s} color="var(--color-primary)" />,
  lock:      (s) => <LockIcon size={s} />,
  unlock:    (s) => <UnlockIcon size={s} />,
  check:     (s) => <CheckIcon size={s} />,
  warning:   (s) => <WarningIcon size={s} />,
  explosion: (s) => <ExplosionIcon size={s} />,
  strength:  (s) => <StrengthIcon size={s} />,
};

const THEME_MAP = {
  crown:   { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.2)', glow: 'rgba(251,191,36,0.15)' },
  diamond: { bg: 'rgba(96,165,250,0.1)',  border: 'rgba(96,165,250,0.2)', glow: 'rgba(96,165,250,0.15)' },
  flame:   { bg: 'rgba(251,146,60,0.1)',  border: 'rgba(251,146,60,0.2)', glow: 'rgba(251,146,60,0.15)' },
  shield:  { bg: 'rgba(147,197,253,0.1)', border: 'rgba(147,197,253,0.2)', glow: 'rgba(147,197,253,0.15)' },
  coins:   { bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)', glow: 'rgba(251,191,36,0.15)' },
  trophy:  { bg: 'rgba(251,191,36,0.1)',  border: 'rgba(251,191,36,0.2)', glow: 'rgba(251,191,36,0.15)' },
  gift:    { bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)', glow: 'rgba(167,139,250,0.15)' },
  default: { bg: 'rgba(167,139,250,0.1)', border: 'rgba(167,139,250,0.2)', glow: 'rgba(167,139,250,0.15)' },
};

export default function RewardMoment({
  icon = 'trophy',
  kicker,
  title,
  amount,
  unit = 'coins',
  description,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}) {
  const renderIcon = ICON_MAP[icon] || ICON_MAP.trophy;
  const theme = THEME_MAP[icon] || THEME_MAP.default;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.6rem',
      padding: '1.5rem 1.2rem',
      borderRadius: 'var(--radius-lg)',
      background: `radial-gradient(circle at top, ${theme.glow}, transparent 60%), var(--glass-bg)`,
      border: `1px solid ${theme.border}`,
      backdropFilter: 'blur(var(--blur-md))',
      WebkitBackdropFilter: 'blur(var(--blur-md))',
      boxShadow: `0 12px 40px rgba(0,0,0,0.3), 0 0 30px ${theme.glow}`,
      textAlign: 'center',
      animation: 'reward-pop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards',
    }}>
      {/* Icon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 72,
        height: 72,
        borderRadius: 'var(--radius-md)',
        background: theme.bg,
        border: `1px solid ${theme.border}`,
      }}>
        {renderIcon(40)}
      </div>

      {/* Kicker */}
      {kicker && (
        <span style={{
          fontFamily: 'var(--font-display)',
          fontSize: '0.68rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          color: 'var(--text-muted)',
        }}>
          {kicker}
        </span>
      )}

      {/* Title */}
      {title && (
        <h3 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.3rem',
          fontWeight: 800,
          color: 'var(--text-white)',
          margin: 0,
          lineHeight: 1.2,
        }}>
          {title}
        </h3>
      )}

      {/* Amount */}
      {amount && (
        <RewardAmount value={amount} unit={unit} size="lg" glow />
      )}

      {/* Description */}
      {description && (
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: '0.88rem',
          color: 'var(--text-light)',
          lineHeight: 1.55,
          margin: 0,
          maxWidth: '24rem',
        }}>
          {description}
        </p>
      )}

      {/* Primary action */}
      {actionLabel && onAction && (
        <button onClick={onAction} style={primaryBtnStyle}>
          {actionLabel}
        </button>
      )}

      {/* Secondary action */}
      {secondaryLabel && onSecondary && (
        <button onClick={onSecondary} style={secondaryBtnStyle}>
          {secondaryLabel}
        </button>
      )}
    </div>
  );
}

const primaryBtnStyle = {
  marginTop: '0.3rem',
  padding: '0.7rem 2rem',
  borderRadius: 'var(--radius-pill)',
  border: 'none',
  background: 'var(--gradient-brand)',
  color: 'var(--text-white)',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: '0.95rem',
  cursor: 'pointer',
  boxShadow: 'var(--shadow-glow)',
};

const secondaryBtnStyle = {
  padding: '0.4rem 1rem',
  borderRadius: 'var(--radius-pill)',
  border: '1px solid var(--glass-border)',
  background: 'transparent',
  color: 'var(--text-muted)',
  fontFamily: 'var(--font-body)',
  fontWeight: 600,
  fontSize: '0.82rem',
  cursor: 'pointer',
};

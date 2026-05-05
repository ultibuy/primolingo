import ActionButton from './ActionButton.jsx';
import Panel from './Panel.jsx';
import { LockIcon as LockIconBase } from '../icons/ProductIcons.jsx';

export default function ProgressListCard({
  title,
  statusLabel,
  recommendedLabel,
  recommended = false,
  locked = false,
  lockIcon,
  actionLabel,
  onAction,
  onTitleClick,
  titleTitle,
  trailing,
  style,
}) {
  return (
    <Panel
      variant={recommended ? 'highlighted' : 'default'}
      style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0.7rem 1rem',
        gap: '0.7rem',
        opacity: locked ? 0.45 : 1,
        filter: locked ? 'grayscale(0.7)' : 'none',
        ...style,
      }}
    >
      {lockIcon ?? <LockIcon />}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <button
          type="button"
          onClick={onTitleClick}
          title={titleTitle}
          disabled={!onTitleClick}
          style={{
            padding: 0,
            border: 'none',
            background: 'transparent',
            color: 'var(--color-accent)',
            cursor: onTitleClick ? 'pointer' : 'default',
            fontFamily: 'inherit',
            fontSize: '0.88rem',
            fontWeight: 800,
            textAlign: 'left',
            minWidth: 0,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', minWidth: 0 }}>
          {recommended && recommendedLabel && (
            <StatusPill highlighted>{recommendedLabel}</StatusPill>
          )}
          {statusLabel && (
            <StatusPill>{statusLabel}</StatusPill>
          )}
        </div>
      </div>
      {actionLabel && onAction && (
        <ActionButton
          size="sm"
          onClick={onAction}
          style={{
            flexShrink: 0,
            alignSelf: 'center',
            boxShadow: recommended ? '0 2px 12px rgba(124,58,237,0.35)' : '0 2px 8px rgba(124,58,237,0.25)',
          }}
        >
          {actionLabel}
        </ActionButton>
      )}
      {trailing}
    </Panel>
  );
}

function LockIcon() {
  return (
    <span style={{ flexShrink: 0, opacity: 0.42, display: 'inline-flex' }}>
      <LockIconBase size={18} />
    </span>
  );
}

function StatusPill({ children, highlighted = false }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignSelf: 'flex-start',
      maxWidth: '100%',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      fontSize: highlighted ? '0.6rem' : '0.62rem',
      background: highlighted ? 'rgba(var(--color-primary-rgb),0.2)' : 'rgba(107,114,128,0.15)',
      color: highlighted ? 'var(--color-accent)' : '#6b7280',
      padding: '0.1rem 0.45rem',
      borderRadius: 4,
      fontWeight: 800,
      letterSpacing: highlighted ? '0.02em' : 0,
    }}>
      {children}
    </span>
  );
}

import ActionButton from './ActionButton.jsx';
import Panel from './Panel.jsx';

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
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.7rem', minWidth: 0 }}>
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
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </button>
          {actionLabel && onAction && (
            <ActionButton
              size="sm"
              onClick={onAction}
              style={{
                flexShrink: 0,
                boxShadow: recommended ? '0 2px 12px rgba(124,58,237,0.35)' : '0 2px 8px rgba(124,58,237,0.25)',
              }}
            >
              {actionLabel}
            </ActionButton>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', minWidth: 0 }}>
          {recommended && recommendedLabel && (
            <StatusPill highlighted>{recommendedLabel}</StatusPill>
          )}
          {statusLabel && (
            <StatusPill>{statusLabel}</StatusPill>
          )}
        </div>
      </div>
      {trailing}
    </Panel>
  );
}

function LockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      style={{ width: 18, height: 18, flexShrink: 0, opacity: 0.42 }}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
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

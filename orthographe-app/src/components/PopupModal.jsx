import { createPortal } from 'react-dom';
import PopupCloseButton from './PopupCloseButton.jsx';

export default function PopupModal({
  children,
  onClose,
  ariaLabel,
  closeAriaLabel = 'Fermer',
  closeOnBackdrop = true,
  showClose = true,
  zIndex = 1000,
  overlayStyle = {},
  panelStyle = {},
  panelClassName,
  role = 'dialog',
  labelledBy,
  describedBy,
  closeButtonProps = {},
  portal = true,
}) {
  const node = (
    <div
      onClick={closeOnBackdrop ? onClose : undefined}
      style={{
        ...overlayBaseStyle,
        zIndex,
        ...overlayStyle,
      }}
    >
      <div
        onClick={(event) => event.stopPropagation()}
        style={modalShellBaseStyle}
      >
        <div
          role={role}
          aria-modal="true"
          aria-label={ariaLabel}
          aria-labelledby={labelledBy}
          aria-describedby={describedBy}
          className={panelClassName}
          style={{
            ...panelBaseStyle,
            ...panelStyle,
          }}
        >
          {children}
        </div>
        {showClose && onClose && (
          <PopupCloseButton
            onClick={onClose}
            ariaLabel={closeAriaLabel}
            {...closeButtonProps}
          />
        )}
      </div>
    </div>
  );

  if (!portal || typeof document === 'undefined') return node;
  return createPortal(node, document.body);
}

const overlayBaseStyle = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.58)',
  backdropFilter: 'blur(var(--blur-sm))',
  WebkitBackdropFilter: 'blur(var(--blur-sm))',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1rem',
};

const panelBaseStyle = {
  position: 'relative',
  boxSizing: 'border-box',
  width: 'min(420px, calc(100vw - 2rem))',
  maxHeight: 'calc(100vh - 2rem)',
  overflowY: 'auto',
  borderRadius: 'var(--radius-lg)',
  padding: '1.45rem 1.35rem',
  background: 'linear-gradient(180deg, rgba(var(--color-bg1-rgb),0.97), rgba(var(--color-bg2-rgb),0.92))',
  border: '1px solid var(--glass-border)',
  boxShadow: 'var(--shadow-lg)',
};

const modalShellBaseStyle = {
  position: 'relative',
  width: 'fit-content',
  maxWidth: '100%',
  animation: 'bounce-in 0.3s ease forwards',
};

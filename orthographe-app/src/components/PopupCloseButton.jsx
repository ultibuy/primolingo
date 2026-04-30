export default function PopupCloseButton({
  onClick,
  ariaLabel = 'Fermer',
  top,
  right,
  size = 48,
  style,
}) {
  const cornerOffset = -Math.round(size / 2);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        ...baseStyle,
        top: top ?? cornerOffset,
        right: right ?? cornerOffset,
        width: size,
        height: size,
        ...style,
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        style={{
          width: size * 0.46,
          height: size * 0.46,
          display: 'block',
        }}
      >
        <path
          d="M7 7L17 17M17 7L7 17"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.25"
          strokeLinecap="round"
        />
      </svg>
    </button>
  );
}

const baseStyle = {
  position: 'absolute',
  borderRadius: 999,
  border: '1px solid rgba(var(--color-primary-rgb),0.42)',
  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 800,
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 10px 24px rgba(var(--color-primary-rgb),0.34)',
  zIndex: 2,
  padding: 0,
  touchAction: 'manipulation',
};

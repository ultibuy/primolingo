export default function PopupCloseButton({
  onClick,
  ariaLabel = 'Fermer',
  top = -12,
  right = -12,
  size = 48,
  style,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        ...baseStyle,
        top,
        right,
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
  border: '1px solid rgba(167,139,250,0.38)',
  background: 'linear-gradient(135deg, rgba(124,58,237,0.96), rgba(168,85,247,0.92))',
  color: '#fff',
  cursor: 'pointer',
  fontWeight: 800,
  lineHeight: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 10px 24px rgba(124,58,237,0.34)',
  zIndex: 2,
  padding: 0,
  touchAction: 'manipulation',
};

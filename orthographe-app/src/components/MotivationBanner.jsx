import { useState, useEffect } from 'react';
import CoinIcon from './CoinIcon.jsx';

// Variant accent/secondary/emphasis color palette
const VARIANT_COLORS = {
  panda:    { accent: '#f5b400', secondary: '#48bb78', emphasis: '#fbcb3a' },
  flamme:   { accent: '#ff8a47', secondary: '#f5b400', emphasis: '#ff8a47' },
  couronnes:{ accent: '#f5b400', secondary: '#b8a3ff', emphasis: '#fbcb3a' },
  plain:    { accent: '#48bb78', secondary: '#b8a3ff', emphasis: '#86e2a8' },
  diamant:  { accent: '#60cdff', secondary: '#b8a3ff', emphasis: '#60cdff' },
  pieces:   { accent: '#f5b400', secondary: '#f5b400', emphasis: '#fbcb3a' },
};

function renderWithEmphasis(message, emphasis, emphasisColor) {
  if (!emphasis || !message.includes(emphasis)) {
    return message;
  }
  const idx = message.indexOf(emphasis);
  const before = message.slice(0, idx);
  const after = message.slice(idx + emphasis.length);
  return (
    <>
      {before}
      <b style={{ color: emphasisColor }}>{emphasis}</b>
      {after}
    </>
  );
}

export default function MotivationBanner({
  variant,
  emoji,
  message,
  emphasis,
  emphasisColor,
  cta,
  onDismiss: _onDismiss,
  floatEmoji = false,
  style,
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Trigger fade-in on mount
    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(true));
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const colors = VARIANT_COLORS[variant] || VARIANT_COLORS.plain;
  const resolvedEmphasisColor = emphasisColor || colors.emphasis;
  const accent = colors.accent;
  const secondary = colors.secondary;

  const containerStyle = {
    borderRadius: 14,
    padding: '10px 14px',
    border: `1px solid ${accent}40`,
    background: `linear-gradient(90deg, ${accent}1F 0%, ${secondary}0F 100%)`,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    opacity: visible ? 1 : 0,
    transform: visible ? 'translateY(0) scale(1)' : 'translateY(18px) scale(0.96)',
    transition: 'opacity 400ms ease-out, transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    ...style,
  };

  const iconContainerStyle = {
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  };

  const messageStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: '#fff',
    lineHeight: 1.4,
    flex: 1,
    minWidth: 0,
  };

  const ctaStyle = {
    fontSize: 12,
    fontWeight: 800,
    color: '#fbcb3a',
    padding: '0 14px',
    cursor: 'pointer',
    border: 'none',
    background: 'none',
    whiteSpace: 'nowrap',
    fontFamily: 'inherit',
    flexShrink: 0,
  };

  return (
    <div data-testid="motivation-banner" style={containerStyle}>
      {/* Icon */}
      <div style={iconContainerStyle}>
        {emoji && (
          emoji === '🪙'
            ? <CoinIcon size={28} />
            : (
              <span
                className={floatEmoji ? 'banner-emoji' : undefined}
                style={{ fontSize: 24 }}
              >
                {emoji}
              </span>
            )
        )}
      </div>

      {/* Message */}
      <p style={messageStyle}>
        {renderWithEmphasis(message, emphasis, resolvedEmphasisColor)}
      </p>

      {/* CTA */}
      {cta && (
        <button
          type="button"
          style={ctaStyle}
          onClick={cta.onClick}
        >
          {cta.label}
        </button>
      )}
    </div>
  );
}

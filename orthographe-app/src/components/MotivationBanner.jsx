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

function BannerSvgIcon({ emoji, accent, secondary }) {
  if (emoji === '🪙') return <CoinIcon size={28} />;

  const commonProps = {
    width: 34,
    height: 34,
    viewBox: '0 0 40 40',
    fill: 'none',
    className: 'banner-svg-icon',
  };

  switch (emoji) {
    case '📈':
      return (
        <svg {...commonProps} aria-hidden="true">
          <rect x="5" y="6" width="30" height="28" rx="7" fill={`${accent}22`} stroke={`${accent}88`} strokeWidth="1.2" />
          <path d="M11 27.5h18" stroke={`${accent}88`} strokeWidth="2" strokeLinecap="round" />
          <path d="M12 25l6-7 5 4 6-10" stroke={accent} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M27 12h3v3" stroke={accent} strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case '🏆':
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="M14 10h12v5c0 6-2.7 10-6 10s-6-4-6-10v-5Z" fill={`${accent}33`} stroke={accent} strokeWidth="2.4" />
          <path d="M14 13H9c0 4 2 7 5.7 7.8M26 13h5c0 4-2 7-5.7 7.8" stroke={accent} strokeWidth="2.4" strokeLinecap="round" />
          <path d="M20 25v5M14 31h12" stroke={secondary} strokeWidth="2.6" strokeLinecap="round" />
        </svg>
      );
    case '🎁':
      return (
        <svg {...commonProps} aria-hidden="true">
          <rect x="9" y="17" width="22" height="15" rx="3" fill={`${accent}24`} stroke={accent} strokeWidth="2.3" />
          <path d="M20 17v15M8 17h24" stroke={secondary} strokeWidth="2.3" strokeLinecap="round" />
          <path d="M20 16c-5-1-7-3-6-5 1.3-2.5 5 0 6 5Zm0 0c5-1 7-3 6-5-1.3-2.5-5 0-6 5Z" stroke={accent} strokeWidth="2.1" strokeLinejoin="round" />
        </svg>
      );
    case '🔥':
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="M22.5 5.5c1 6-4 8.3-1.4 12.5 1.9-2.2 3.9-4.4 4.2-7 4.2 4.4 6.1 8.3 6.1 13 0 6-4.9 10-11.1 10S9.2 30.1 9.2 24.1c0-4.8 2.9-8.2 6.3-11.5 2.1-2 4.2-4.1 7-7.1Z" fill={`${accent}28`} stroke={accent} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M21 22c2.3 2.4 3.2 4.3 3.2 6.2 0 2.3-1.8 3.8-4.2 3.8s-4.2-1.5-4.2-3.8c0-2.2 1.4-3.8 3.5-6.2.5 1.6 1.1 2.7 1.7 3.5.4-.9.4-2 .1-3.5Z" fill={secondary} />
        </svg>
      );
    case '💎':
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="M12 8h16l6 8-14 17L6 16l6-8Z" fill={`${accent}30`} stroke={accent} strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M6 16h28M12 8l4 8 4-8 4 8 4-8M16 16l4 17 4-17" stroke={secondary} strokeWidth="1.8" strokeLinejoin="round" opacity="0.9" />
        </svg>
      );
    case '👑':
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="M8 29h24l2-15-8 6-6-10-6 10-8-6 2 15Z" fill={`${accent}30`} stroke={accent} strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M10 32h20" stroke={secondary} strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case '🛡️':
      return (
        <svg {...commonProps} aria-hidden="true">
          <path d="M20 6 31 10v8c0 7.3-4.2 12.8-11 16-6.8-3.2-11-8.7-11-16v-8l11-4Z" fill={`${accent}24`} stroke={accent} strokeWidth="2.4" strokeLinejoin="round" />
          <path d="m14.5 20 3.8 3.8 7.6-8.1" stroke={secondary} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case '🛒':
      return (
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="9" cy="21" r="1"/>
          <circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
      );
    case '🧩':
      return (
        <svg width={34} height={34} viewBox="0 0 640 640" fill="none" aria-hidden="true">
          <path d="M288 64C323.3 64 352 85.5 352 112C352 122.4 347.6 132 340 139.9C333.4 146.8 328 155.2 328 164.8C328 179.8 340.2 192 355.2 192L400 192C426.5 192 448 213.5 448 240L448 284.8C448 299.8 460.2 312 475.2 312C484.7 312 493.2 306.6 500.1 300C508 292.5 517.6 288 528 288C554.5 288 576 316.7 576 352C576 387.3 554.5 416 528 416C517.6 416 507.9 411.6 500.1 404C493.2 397.4 484.8 392 475.2 392C460.2 392 448 404.2 448 419.2L448 528C448 554.5 426.5 576 400 576L343.2 576C330.4 576 320 565.6 320 552.8C320 543.6 325.8 535.5 333.2 530C344.8 521.3 352 509.3 352 496C352 469.5 323.3 448 288 448C252.7 448 224 469.5 224 496C224 509.3 231.2 521.3 242.8 530C250.2 535.5 256 543.5 256 552.8C256 565.6 245.6 576 232.8 576L112 576C85.5 576 64 554.5 64 528L64 407.2C64 394.4 74.4 384 87.2 384C96.4 384 104.5 389.8 110 397.2C118.7 408.8 130.7 416 144 416C170.5 416 192 387.3 192 352C192 316.7 170.5 288 144 288C130.7 288 118.7 295.2 110 306.8C104.5 314.2 96.5 320 87.2 320C74.4 320 64 309.6 64 296.8L64 240C64 213.5 85.5 192 112 192L220.8 192C235.8 192 248 179.8 248 164.8C248 155.3 242.6 146.8 236 139.9C228.5 132 224 122.4 224 112C224 85.5 252.7 64 288 64z"
            stroke={accent} strokeWidth="32" strokeLinejoin="round"/>
          <text x="300" y="410" textAnchor="middle" fontFamily="Fredoka, 'Plus Jakarta Sans', sans-serif" fontWeight="600" fontSize="220" fill={accent}>?</text>
        </svg>
      );
    default:
      return (
        <svg {...commonProps} aria-hidden="true">
          <circle cx="20" cy="20" r="13" fill={`${accent}24`} stroke={accent} strokeWidth="2.3" />
          <path d="M20 11v18M11 20h18" stroke={secondary} strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
  }
}

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
          <span className={floatEmoji ? 'banner-emoji' : undefined} style={{ display: 'grid', placeItems: 'center' }}>
            <BannerSvgIcon emoji={emoji} accent={accent} secondary={secondary} />
          </span>
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

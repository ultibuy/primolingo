import CoinIcon from './CoinIcon.jsx';
import PopupModal from './PopupModal.jsx';

export default function PerfectSessionBonusModal({ bonus = 10, onContinue }) {
  return (
    <PopupModal
      onClose={onContinue}
      panelStyle={cardStyle}
    >
        <div style={iconWrapStyle}>
          <CoinIcon size={34} animate />
        </div>
        <h1 style={titleStyle}>20/20. Bonus parfait.</h1>
        <p style={textStyle}>
          <strong style={{ color: '#fbbf24' }}>+{bonus} pièces</strong> pour cette session parfaite. Bravo !
        </p>
        <button type="button" onClick={onContinue} style={buttonStyle}>
          Voir le récapitulatif
        </button>
    </PopupModal>
  );
}

const cardStyle = {
  width: 'min(460px, calc(100vw - 2rem))',
  padding: '1.6rem 1.35rem 1.3rem',
  textAlign: 'center',
};

const iconWrapStyle = {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '0.7rem',
};

const titleStyle = {
  margin: '0 0 0.45rem',
  color: '#fff',
  fontSize: '1.5rem',
  fontWeight: 800,
  letterSpacing: '-0.02em',
};

const textStyle = {
  margin: '0 0 1.1rem',
  color: '#d1d5db',
  fontSize: '0.98rem',
  lineHeight: 1.5,
};

const buttonStyle = {
  border: 'none',
  borderRadius: 14,
  padding: '0.85rem 1.1rem',
  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
  color: '#fff',
  fontSize: '0.95rem',
  fontWeight: 800,
  cursor: 'pointer',
  boxShadow: '0 8px 20px rgba(var(--color-primary-rgb),0.28)',
};

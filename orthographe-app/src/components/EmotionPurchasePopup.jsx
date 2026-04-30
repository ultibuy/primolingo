import CharacterSprite from './CharacterSprite.jsx';
import CoinIcon from './CoinIcon.jsx';
import PopupModal from './PopupModal.jsx';
import { SHOP_EMOTIONS } from '../data/shopCharacters.js';

/**
 * Modal popup to purchase a locked emotion.
 *
 * Props:
 *   charId      — character id (for walk preview)
 *   emotionId   — which emotion to buy (must be in SHOP_EMOTIONS)
 *   coins       — user's current coin balance
 *   onBuy       — () => void  — called when the buy button is clicked (affordability already checked)
 *   onClose     — () => void  — called when "Plus tard" or backdrop is clicked
 */
export default function EmotionPurchasePopup({ charId, emotionId, coins = 0, onBuy, onClose }) {
  const emotion = SHOP_EMOTIONS.find(e => e.id === emotionId);
  if (!emotion) return null;

  const affordable = coins >= emotion.price;

  return (
    <PopupModal
      onClose={onClose}
      zIndex={2200}
      overlayStyle={{ background: 'rgba(0,0,0,0.68)', backdropFilter: 'blur(7px)', WebkitBackdropFilter: 'blur(7px)' }}
      panelStyle={{
        width: 'min(300px, calc(100vw - 2rem))',
        background: 'linear-gradient(180deg, rgba(18,18,38,0.99), rgba(10,10,24,0.99))',
        border: '1px solid rgba(251,191,36,0.22)',
        borderRadius: 22,
        padding: '1.6rem 1.3rem 1.1rem',
        textAlign: 'center',
      }}
      closeButtonProps={{ size: 40 }}
    >
        {/* Character preview in walk */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.9rem' }}>
          <CharacterSprite id={charId} mood="walk" size={86} glow={false} />
        </div>

        {/* Emotion symbol + name */}
        <div style={{ fontSize: '1.7rem', marginBottom: '0.25rem' }}>{emotion.symbol}</div>
        <h3 style={{
          margin: '0 0 0.35rem',
          fontSize: '1.12rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.01em',
        }}>
          {emotion.name}
        </h3>
        <p style={{
          margin: '0 0 1.15rem',
          fontSize: '0.78rem', color: '#9ca3af', lineHeight: 1.45,
          padding: '0 0.4rem',
        }}>
          {emotion.desc}
        </p>

        {/* Buy button */}
        <button
          type="button"
          onClick={affordable ? onBuy : undefined}
          disabled={!affordable}
          style={{
            width: '100%', padding: '0.82rem 0.6rem', borderRadius: 13, border: 'none',
            background: affordable
              ? 'linear-gradient(135deg, #f59e0b, #fbbf24)'
              : 'rgba(255,255,255,0.06)',
            color: affordable ? '#000' : '#6b7280',
            cursor: affordable ? 'pointer' : 'not-allowed',
            fontSize: '0.93rem', fontWeight: 800,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem',
            marginBottom: '0.65rem',
          }}
        >
          {affordable ? (
            <>
              <span>Débloquer pour {emotion.price}</span>
              <CoinIcon size={15} />
            </>
          ) : (
            <>
              <span>Pas assez de pièces</span>
              <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>({emotion.price}</span>
              <CoinIcon size={13} />
              <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>requis)</span>
            </>
          )}
        </button>

        {/* Later */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%', background: 'none', border: 'none',
            color: '#6b7280', fontSize: '0.86rem', cursor: 'pointer',
            padding: '0.3rem', fontFamily: 'inherit',
          }}
        >
          Plus tard
        </button>
    </PopupModal>
  );
}

import { useState, useEffect } from 'react';
import CoinIcon from './CoinIcon.jsx';
import PopupCloseButton from './PopupCloseButton.jsx';
import ShieldIcon from './ShieldIcon.jsx';
import { SHOP_CATALOG, canAfford, isOwned, getEquipped } from '../engine/economy.js';

const CATEGORIES = [
  { key: 'cosmetique', label: 'Cosm\u00e9tique', filter: (item) => ['themes', 'flames', 'titles', 'victoryAnimations', 'backgrounds'].includes(item.category) },
  { key: 'assurance', label: 'Assurance', filter: (item) => ['streakFreeze', 'doubleCoins'].includes(item.category) },
  { key: 'enjeu', label: 'En jeu', filter: (item) => ['revealHint', 'rematch', 'modeSniper', 'questionMystery'].includes(item.category) },
];

const CATEGORY_ICONS = {
  themes: '\uD83C\uDFA8',
  flames: '\uD83D\uDD25',
  titles: '\uD83C\uDFF7\uFE0F',
  victoryAnimations: '\uD83C\uDFAC',
  backgrounds: '\uD83D\uDDBC\uFE0F',
  streakFreeze: '\uD83D\uDEE1\uFE0F',
  doubleCoins: '\uD83D\uDCB0',
  revealHint: '\uD83D\uDCA1',
  rematch: '\uD83D\uDD04',
  modeSniper: '\uD83C\uDFAF',
  questionMystery: '\u2753',
};

const SUBCATEGORY_LABELS = {
  themes: 'Th\u00e8mes',
  flames: 'Flammes',
  titles: 'Titres',
  victoryAnimations: 'Animations de victoire',
  backgrounds: 'Fonds',
};

const EQUIP_SLOT_MAP = {
  themes: 'theme',
  flames: 'flame',
  titles: 'title',
  victoryAnimations: 'victoryAnimation',
  backgrounds: 'dashboardBackground',
};

export default function Shop({ progress, onPurchase, onEquip, onClose }) {
  const [activeTab, setActiveTab] = useState('cosmetique');
  const [purchaseAnim, setPurchaseAnim] = useState(null);
  const [mounted, setMounted] = useState(false);
  // FIX 4 — Purchase confirmation state
  const [confirmItem, setConfirmItem] = useState(null);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const coins = progress.coins || 0;
  const shields = progress.shields || 0;

  const allItems = Object.values(SHOP_CATALOG);
  const activeCat = CATEGORIES.find(c => c.key === activeTab);
  const filteredItems = allItems.filter(activeCat.filter);

  // Group cosm\u00e9tique items by subcategory
  const grouped = {};
  for (const item of filteredItems) {
    const group = item.category;
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(item);
  }

  // FIX 4 — Show confirmation before purchase
  const handleRequestPurchase = (itemId) => {
    const item = SHOP_CATALOG[itemId];
    if (!item) return;
    if (!canAfford(progress, itemId)) return;
    if (itemId === 'streak-freeze' && shields >= 2) return;
    if (item.type === 'permanent' && isOwned(progress, itemId)) return;
    setConfirmItem(item);
  };

  const handleConfirmPurchase = () => {
    if (!confirmItem) return;
    setPurchaseAnim(confirmItem.id);
    setTimeout(() => setPurchaseAnim(null), 800);
    onPurchase(confirmItem.id, confirmItem.price);
    setConfirmItem(null);
  };

  const handleCancelPurchase = () => {
    setConfirmItem(null);
  };

  const handleEquip = (itemId, category, unequip = false) => {
    const equipSlot = EQUIP_SLOT_MAP[category];
    if (equipSlot) {
      onEquip(equipSlot, unequip ? null : itemId);
    }
  };

  return (
    <div style={pageStyle}>
      {/* FIX 4 — Purchase confirmation overlay */}
      {confirmItem && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }} onClick={handleCancelPurchase}>
          <div
            style={{
              background: 'rgba(var(--color-bg1-rgb),0.95)',
              border: '1px solid rgba(var(--color-accent-rgb),0.2)',
              borderRadius: 20, padding: '1.5rem 2rem',
              maxWidth: 340, textAlign: 'center',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              animation: 'bounce-in 0.3s ease forwards',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <PopupCloseButton onClick={handleCancelPurchase} />
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.8rem', lineHeight: 1.4 }}>
              Acheter «&nbsp;{confirmItem.name}&nbsp;» pour {confirmItem.price} <CoinIcon size={18} />&nbsp;?
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
              <button
                onClick={handleCancelPurchase}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  borderRadius: 10,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                }}
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmPurchase}
                style={{
                  flex: 1,
                  padding: '0.65rem 1rem',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, var(--color-primary))',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 10px rgba(124,58,237,0.25)',
                }}
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{
        maxWidth: 640, width: '100%', padding: '1rem 1.5rem 3rem',
        opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.5s ease',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.2rem 0 1rem',
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '0.5rem 0.8rem',
              color: '#9ca3af', cursor: 'pointer',
              fontSize: '0.85rem', fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: '0.3rem',
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Retour
          </button>

          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
            Boutique
          </h1>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.4rem',
            background: 'rgba(251,191,36,0.1)',
            border: '1px solid rgba(251,191,36,0.2)',
            borderRadius: 10, padding: '0.4rem 0.8rem',
          }}>
            <CoinIcon size={18} />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24' }}>
              {coins}
            </span>
          </div>
        </div>

        {/* Category tabs */}
        <div style={{
          display: 'flex', gap: '0.4rem',
          marginBottom: '1.2rem',
          background: 'rgba(255,255,255,0.03)',
          borderRadius: 14, padding: '0.3rem',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {CATEGORIES.map(cat => {
            const isActive = activeTab === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setActiveTab(cat.key)}
                style={{
                  flex: 1,
                  padding: '0.6rem 0.4rem',
                  borderRadius: 10,
                  border: 'none',
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(var(--color-accent-rgb),0.15), rgba(var(--color-accent-rgb),0.08))'
                    : 'transparent',
                  color: isActive ? 'var(--color-accent)' : '#6b7280',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  transition: 'all 0.2s ease',
                }}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Items grouped by subcategory */}
        {Object.entries(grouped).map(([groupKey, items]) => (
          <div key={groupKey} style={{ marginBottom: '1.5rem' }}>
            {/* Subcategory label for cosm\u00e9tique */}
            {activeTab === 'cosmetique' && SUBCATEGORY_LABELS[groupKey] && (
              <div style={{
                fontSize: '0.78rem', color: '#6b7280', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                marginBottom: '0.6rem', paddingLeft: '0.2rem',
                display: 'flex', alignItems: 'center', gap: '0.4rem',
              }}>
                <span>{CATEGORY_ICONS[groupKey] || ''}</span>
                {SUBCATEGORY_LABELS[groupKey]}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {items.map(item => (
                <ShopItemCard
                  key={item.id}
                  item={item}
                  progress={progress}
                  shields={shields}
                  purchaseAnim={purchaseAnim}
                  onPurchase={handleRequestPurchase}
                  onEquip={handleEquip}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '3rem 1rem',
            color: '#4b5563', fontSize: '0.9rem',
          }}>
            Rien ici pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}

function ShopItemCard({ item, progress, shields, purchaseAnim, onPurchase, onEquip }) {
  const owned = item.type === 'permanent' && isOwned(progress, item.id);
  const affordable = canAfford(progress, item.id);
  const coins = progress.coins || 0;
  const missing = item.price - coins;
  const isAnimating = purchaseAnim === item.id;

  // Check if equipped
  const equipSlot = EQUIP_SLOT_MAP[item.category];
  const equipped = equipSlot ? getEquipped(progress, equipSlot) === item.id : false;

  // Special: streak freeze max check
  const isStreakFreeze = item.id === 'streak-freeze';
  const streakFreezeMaxed = isStreakFreeze && shields >= 2;

  // Determine button state — FIX 3: accents on "\u00c9quip\u00e9" / "\u00c9quiper"
  let buttonText = '';
  let buttonAction = null;
  let buttonStyle = {};

  if (owned && equipped) {
    buttonText = 'Désinstaller';
    buttonAction = () => onEquip(item.id, item.category, true);
    buttonStyle = {
      background: 'rgba(74,222,128,0.12)',
      border: '1px solid rgba(74,222,128,0.3)',
      color: '#4ade80',
      cursor: 'pointer',
    };
  } else if (owned && !equipped) {
    buttonText = 'Installer';
    buttonAction = () => onEquip(item.id, item.category);
    buttonStyle = {
      background: 'rgba(var(--color-accent-rgb),0.1)',
      border: '1px solid rgba(var(--color-accent-rgb),0.25)',
      color: 'var(--color-accent)',
      cursor: 'pointer',
    };
  } else if (streakFreezeMaxed) {
    buttonText = 'Max (2/2)';
    buttonStyle = {
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      color: '#4b5563',
      cursor: 'default',
    };
  } else if (!affordable) {
    buttonText = `Manque ${missing}`;
    buttonStyle = {
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      color: '#4b5563',
      cursor: 'default',
    };
  } else {
    buttonText = 'Acheter';
    buttonAction = () => onPurchase(item.id);
    buttonStyle = {
      background: 'linear-gradient(135deg, #7c3aed, var(--color-primary))',
      border: 'none',
      color: '#fff',
      cursor: 'pointer',
      boxShadow: '0 2px 10px rgba(124,58,237,0.25)',
    };
  }

  // Get display icon
  const displayIcon = item.emoji || CATEGORY_ICONS[item.category] || '\uD83D\uDCE6';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.8rem',
      background: owned
        ? 'rgba(74,222,128,0.04)'
        : 'rgba(255,255,255,0.04)',
      border: owned
        ? '1px solid rgba(74,222,128,0.1)'
        : '1px solid rgba(255,255,255,0.06)',
      borderRadius: 16,
      padding: '0.9rem 1rem',
      transition: 'all 0.3s ease',
      animation: isAnimating ? 'bounce-in 0.5s ease' : 'none',
      opacity: (!affordable && !owned) ? 0.6 : 1,
    }}>
      {/* Icon */}
      <div style={{
        width: 42, height: 42,
        borderRadius: 12,
        background: owned ? 'rgba(74,222,128,0.08)' : 'rgba(255,255,255,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '1.3rem',
        flexShrink: 0,
        border: owned ? '1px solid rgba(74,222,128,0.15)' : '1px solid rgba(255,255,255,0.06)',
      }}>
        {isStreakFreeze ? (
          <ShieldIcon size={24} active={true} />
        ) : (
          displayIcon
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '0.88rem', fontWeight: 700,
          color: owned ? '#4ade80' : '#e2e2e2',
          marginBottom: '0.1rem',
          display: 'flex', alignItems: 'center', gap: '0.3rem',
        }}>
          {item.name}
          {owned && equipped && (
            <span style={{
              fontSize: '0.6rem', background: 'rgba(74,222,128,0.15)',
              color: '#4ade80', padding: '0.1rem 0.35rem',
              borderRadius: 4, fontWeight: 700,
            }}>
              ACTIF
            </span>
          )}
          {item.tier === 'premium' && !owned && (
            <span style={{
              fontSize: '0.6rem', background: 'rgba(var(--color-accent-rgb),0.12)',
              color: 'var(--color-accent)', padding: '0.1rem 0.35rem',
              borderRadius: 4, fontWeight: 700,
            }}>
              PREMIUM
            </span>
          )}
        </div>
        <div style={{ fontSize: '0.72rem', color: '#6b7280', lineHeight: 1.4 }}>
          {item.description}
        </div>
        {!owned && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.25rem',
            marginTop: '0.25rem',
          }}>
            <CoinIcon size={13} />
            <span style={{
              fontSize: '0.78rem', fontWeight: 700,
              color: affordable ? '#fbbf24' : '#4b5563',
            }}>
              {item.price}
            </span>
          </div>
        )}
      </div>

      {/* Action button */}
      <button
        onClick={buttonAction || undefined}
        disabled={!buttonAction}
        style={{
          padding: '0.5rem 0.8rem',
          borderRadius: 10,
          fontSize: '0.78rem',
          fontWeight: 700,
          flexShrink: 0,
          transition: 'all 0.15s ease',
          whiteSpace: 'nowrap',
          ...buttonStyle,
        }}
      >
        {buttonText}
      </button>
    </div>
  );
}

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, var(--color-bg1) 0%, var(--color-bg2) 100%)',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  fontFamily: 'var(--font-body)',
  color: '#e2e2e2',
};

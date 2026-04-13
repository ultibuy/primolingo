import { useState, useEffect } from 'react';
import CoinIcon from './CoinIcon.jsx';
import PopupCloseButton from './PopupCloseButton.jsx';
import ShieldIcon from './ShieldIcon.jsx';
import CosmeticFlameIcon from './CosmeticFlameIcon.jsx';
import VictoryAnimationPreview from './VictoryAnimationPreview.jsx';
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
  flames: 'Flamme de ton streak',
  titles: 'Titre sous le streak',
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
  const [previewFlameItem, setPreviewFlameItem] = useState(null);
  const [previewTitleItem, setPreviewTitleItem] = useState(null);
  const [previewVictoryItem, setPreviewVictoryItem] = useState(null);

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

  const handlePreviewFlame = (itemId) => {
    const item = SHOP_CATALOG[itemId];
    if (!item) return;
    setPreviewFlameItem(item);
  };

  const handleConfirmFlamePreview = () => {
    if (!previewFlameItem) return;
    handleEquip(previewFlameItem.id, previewFlameItem.category);
    setPreviewFlameItem(null);
  };

  const handlePreviewTitle = (itemId) => {
    const item = SHOP_CATALOG[itemId];
    if (!item) return;
    setPreviewTitleItem(item);
  };

  const handleConfirmTitlePreview = () => {
    if (!previewTitleItem) return;
    handleEquip(previewTitleItem.id, previewTitleItem.category);
    setPreviewTitleItem(null);
  };

  const handlePreviewVictory = (itemId) => {
    const item = SHOP_CATALOG[itemId];
    if (!item) return;
    setPreviewVictoryItem(item);
  };

  const handleConfirmVictoryPreview = () => {
    if (!previewVictoryItem) return;
    handleEquip(previewVictoryItem.id, previewVictoryItem.category);
    setPreviewVictoryItem(null);
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

      {previewFlameItem && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setPreviewFlameItem(null)}>
          <div
            style={{
              background: 'rgba(var(--color-bg1-rgb),0.96)',
              border: '1px solid rgba(var(--color-accent-rgb),0.2)',
              borderRadius: 24, padding: '1.6rem 2rem',
              maxWidth: 360, width: 'calc(100% - 2rem)', textAlign: 'center',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              animation: 'bounce-in 0.3s ease forwards',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <PopupCloseButton onClick={() => setPreviewFlameItem(null)} />
            <div style={{ marginBottom: '0.55rem', fontSize: '0.68rem', color: '#9ca3af', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Aperçu de la flamme
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <div style={{
                width: 108,
                height: 108,
                borderRadius: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.08), rgba(255,255,255,0.02) 65%)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <CosmeticFlameIcon size={72} intensity={1} flameId={previewFlameItem.id} />
              </div>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
              {previewFlameItem.name}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.5, marginBottom: '1.15rem' }}>
              Voilà l’animation qui sera utilisée pour la flamme de ton streak.
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
              <button
                onClick={() => setPreviewFlameItem(null)}
                style={{
                  flex: 1,
                  padding: '0.7rem 1rem',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                }}
              >
                Fermer
              </button>
              <button
                onClick={handleConfirmFlamePreview}
                style={{
                  flex: 1,
                  padding: '0.7rem 1rem',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, var(--color-primary))',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 10px rgba(124,58,237,0.25)',
                }}
              >
                Installer
              </button>
            </div>
          </div>
        </div>
      )}

      {previewTitleItem && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setPreviewTitleItem(null)}>
          <div
            style={{
              background: 'rgba(var(--color-bg1-rgb),0.96)',
              border: '1px solid rgba(var(--color-accent-rgb),0.2)',
              borderRadius: 24, padding: '1.6rem 2rem',
              maxWidth: 380, width: 'calc(100% - 2rem)', textAlign: 'center',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              animation: 'bounce-in 0.3s ease forwards',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <PopupCloseButton onClick={() => setPreviewTitleItem(null)} />
            <div style={{ marginBottom: '0.55rem', fontSize: '0.68rem', color: '#9ca3af', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Aperçu du titre
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              <div style={{
                minWidth: 200,
                padding: '1rem 1.2rem',
                borderRadius: 18,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
                border: '1px solid rgba(255,255,255,0.08)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  marginBottom: '0.35rem',
                }}>
                  <CosmeticFlameIcon size={28} intensity={1} />
                  <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#fbbf24', lineHeight: 1 }}>
                    8 jours
                  </span>
                </div>
                <div style={{
                  fontSize: '0.82rem',
                  color: '#d4a020',
                  fontWeight: 700,
                  letterSpacing: '0.03em',
                  lineHeight: 1.1,
                }}>
                  {previewTitleItem.titleText}
                </div>
              </div>
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
              {previewTitleItem.name}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.5, marginBottom: '1.15rem' }}>
              Voilà comment le titre apparaîtra sous ton streak sur le dashboard.
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
              <button
                onClick={() => setPreviewTitleItem(null)}
                style={{
                  flex: 1,
                  padding: '0.7rem 1rem',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                }}
              >
                Fermer
              </button>
              <button
                onClick={handleConfirmTitlePreview}
                style={{
                  flex: 1,
                  padding: '0.7rem 1rem',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, var(--color-primary))',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 10px rgba(124,58,237,0.25)',
                }}
              >
                Installer
              </button>
            </div>
          </div>
        </div>
      )}

      {previewVictoryItem && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setPreviewVictoryItem(null)}>
          <div
            style={{
              background: 'rgba(var(--color-bg1-rgb),0.96)',
              border: '1px solid rgba(var(--color-accent-rgb),0.2)',
              borderRadius: 24, padding: '1.6rem 2rem',
              maxWidth: 390, width: 'calc(100% - 2rem)', textAlign: 'center',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              animation: 'bounce-in 0.3s ease forwards',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <PopupCloseButton onClick={() => setPreviewVictoryItem(null)} />
            <div style={{ marginBottom: '0.55rem', fontSize: '0.68rem', color: '#9ca3af', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Aperçu de la victoire
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
              <VictoryAnimationPreview animationId={previewVictoryItem.id} size={144} />
            </div>
            <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginBottom: '0.25rem' }}>
              {previewVictoryItem.name}
            </div>
            <div style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.5, marginBottom: '1.15rem' }}>
              Voilà l’animation qui apparaîtra sur l’écran de fin après une session réussie.
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center' }}>
              <button
                onClick={() => setPreviewVictoryItem(null)}
                style={{
                  flex: 1,
                  padding: '0.7rem 1rem',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.06)',
                  color: '#9ca3af',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                }}
              >
                Fermer
              </button>
              <button
                onClick={handleConfirmVictoryPreview}
                style={{
                  flex: 1,
                  padding: '0.7rem 1rem',
                  borderRadius: 12,
                  border: 'none',
                  background: 'linear-gradient(135deg, #7c3aed, var(--color-primary))',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 10px rgba(124,58,237,0.25)',
                }}
              >
                Installer
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
                  onPreviewFlame={handlePreviewFlame}
                  onPreviewTitle={handlePreviewTitle}
                  onPreviewVictory={handlePreviewVictory}
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

function ShopItemCard({ item, progress, shields, purchaseAnim, onPurchase, onEquip, onPreviewFlame, onPreviewTitle, onPreviewVictory }) {
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
    buttonAction = item.category === 'flames'
      ? () => onPreviewFlame(item.id)
      : item.category === 'titles'
        ? () => onPreviewTitle(item.id)
        : item.category === 'victoryAnimations'
          ? () => onPreviewVictory(item.id)
          : () => onEquip(item.id, item.category);
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

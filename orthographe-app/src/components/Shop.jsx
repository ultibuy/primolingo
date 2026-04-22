import { useState, useEffect } from 'react';
import CoinIcon from './CoinIcon.jsx';
import PopupCloseButton from './PopupCloseButton.jsx';
import ShieldIcon from './ShieldIcon.jsx';
import CosmeticFlameIcon from './CosmeticFlameIcon.jsx';
import VictoryAnimationPreview from './VictoryAnimationPreview.jsx';
import CharacterSprite from './CharacterSprite.jsx';
import mangaImage from '../assets/manga.png';
import ryuImage from '../assets/ryu.png';
import { SHOP_CHARACTERS, SHOP_EMOTIONS } from '../data/shopCharacters.js';
import { isLocalhost } from '../debug.js';
import {
  SHOP_CATALOG,
  canAfford,
  canPurchaseMysteryImagePiece,
  getDoubleCoinsNextUnlockDate,
  getDoubleCoinsRemainingSessions,
  getEquipped,
  getMysteryImageDefinitions,
  getMysteryImageProgress,
  getMysteryNextUnlockDate,
  getMysteryPurchasesLeftToday,
  getMysteryRevealedTileIndices,
  isDoubleCoinsWeeklyLocked,
  MYSTERY_IMAGE_PARTS,
  MYSTERY_IMAGE_PRICE,
  MYSTERY_IMAGE_PURCHASE_PREFIX,
  isOwned,
} from '../engine/economy.js';

const CATEGORIES = [
  { key: 'cosmetique', label: 'Cosm\u00e9tique', filter: (item) => ['themes', 'flames', 'titles', 'victoryAnimations', 'entranceAnimations'].includes(item.category) },
  { key: 'assurance', label: 'Assurance', filter: (item) => ['streakFreeze', 'doubleCoins'].includes(item.category) },
  { key: 'persos', label: 'Persos', filter: () => false },
  { key: 'mystere', label: 'Image mystère', filter: () => false },
];

const CATEGORY_ICONS = {
  themes: '\uD83C\uDFA8',
  flames: '\uD83D\uDD25',
  titles: '\uD83C\uDFF7\uFE0F',
  victoryAnimations: '\uD83C\uDFAC',
  entranceAnimations: '🎬',
  streakFreeze: '\uD83D\uDEE1\uFE0F',
  doubleCoins: '\uD83D\uDCB0',
  revealHint: '\uD83D\uDCA1',
  rematch: '\uD83D\uDD04',
  modeSniper: '\uD83C\uDFAF',
  questionMystery: '\u2753',
  persos: '🧍',
  mystere: '\uD83E\uDDE9',
};

const SUBCATEGORY_LABELS = {
  themes: 'Th\u00e8mes',
  flames: 'Flamme de ton streak',
  titles: 'Titre sous le streak',
  victoryAnimations: 'Animations de victoire',
  entranceAnimations: 'Animations de célébration 🎬',
  streakFreeze: 'Bouclier de streak',
  doubleCoins: 'Double pièces',
};

const SUBCATEGORY_DESCRIPTIONS = {
  themes: "Change le fond d\u2019écran de ton tableau de bord",
  flames: "Personnalise l\u2019icône de ta flamme de streak",
  titles: "Affiche un titre stylé sous ton compteur de jours",
  victoryAnimations: "Joue une animation quand tu valides une bonne réponse",
  entranceAnimations: "Déclenche un effet visuel quand tu passes un niveau",
  streakFreeze: "Protège ton streak si tu oublies une journée",
  doubleCoins: "Double les pièces gagnées pendant 5 sessions",
};

const EQUIP_SLOT_MAP = {
  themes: 'theme',
  flames: 'flame',
  titles: 'title',
  victoryAnimations: 'victoryAnimation',
};

const MYSTERY_IMAGE_ASSETS = {
  manga: ryuImage,
  ryu: mangaImage,
};

function getMysteryImageSource(imageId, mysteryImageDefinitions) {
  return mysteryImageDefinitions?.[imageId]?.imageDataUrl || MYSTERY_IMAGE_ASSETS[imageId] || '';
}

function formatFrenchDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  if (!year || !month || !day) return dateStr;
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
  }).format(new Date(year, month - 1, day));
}

export default function Shop({ progress, adminSettings, onPurchase, onEquip, onClose }) {
  const [activeTab, setActiveTab] = useState('cosmetique');
  const [purchaseAnim, setPurchaseAnim] = useState(null);
  const [mounted, setMounted] = useState(false);
  // FIX 4 — Purchase confirmation state
  const [confirmItem, setConfirmItem] = useState(null);
  const [previewFlameItem, setPreviewFlameItem] = useState(null);
  const [previewTitleItem, setPreviewTitleItem] = useState(null);
  const [previewVictoryItem, setPreviewVictoryItem] = useState(null);
  const [previewMysteryImageId, setPreviewMysteryImageId] = useState(null);
  const [emotionPopup, setEmotionPopup] = useState(null);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const coins = progress.coins || 0;
  const shields = progress.shields || 0;
  const isDebug = isLocalhost();
  const mysteryImageDefinitions = getMysteryImageDefinitions(adminSettings?.customMysteryImages);

  const allItems = Object.values(SHOP_CATALOG);
  const charactersTotal = SHOP_CHARACTERS.length * 500
    + (SHOP_CHARACTERS.length * SHOP_EMOTIONS.reduce((sum, emotion) => sum + emotion.price, 0));
  const baseShopTotal = allItems.reduce((sum, item) => sum + (item.price || 0), 0) + charactersTotal;
  const mysteryImagesTotal = Object.keys(mysteryImageDefinitions).length * MYSTERY_IMAGE_PARTS * MYSTERY_IMAGE_PRICE;
  const globalShopTotal = baseShopTotal + mysteryImagesTotal;
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
    if (itemId === 'double-coins' && isDoubleCoinsWeeklyLocked(progress)) return;
    if (item.type === 'permanent' && isOwned(progress, itemId)) return;
    setConfirmItem(item);
  };

  const handleRequestMysteryPurchase = (imageId) => {
    const definition = mysteryImageDefinitions[imageId];
    if (!definition) return;
    if (!canPurchaseMysteryImagePiece(progress, imageId, undefined, mysteryImageDefinitions)) return;
    setConfirmItem({
      id: `${MYSTERY_IMAGE_PURCHASE_PREFIX}${imageId}`,
      name: `1 fragment - ${definition.name}`,
      price: MYSTERY_IMAGE_PRICE,
    });
  };

  const handleRequestCharacterPurchase = (char) => {
    const itemId = `char-${char.id}`;
    if ((progress.shop?.owned || []).includes(itemId)) return;
    if (coins < 500) return;
    setConfirmItem({
      id: itemId,
      name: char.name,
      price: 500,
      kind: 'character',
    });
  };

  const handleRequestEmotionPurchase = (char, emotion) => {
    const itemId = `char-${char.id}-${emotion.id}`;
    if ((progress.shop?.owned || []).includes(itemId)) {
      setEmotionPopup({ charId: char.id, emotion });
      return;
    }
    if (coins < emotion.price) return;
    setConfirmItem({
      id: itemId,
      name: `${emotion.symbol} ${emotion.name} · ${char.name}`,
      price: emotion.price,
      kind: 'emotion',
      charId: char.id,
      emotion,
    });
  };

  const handleConfirmPurchase = () => {
    if (!confirmItem) return;
    setPurchaseAnim(confirmItem.id);
    setTimeout(() => setPurchaseAnim(null), 800);
    onPurchase(confirmItem.id, confirmItem.price);
    if (confirmItem.kind === 'emotion' && confirmItem.emotion) {
      setEmotionPopup({ charId: confirmItem.charId, emotion: confirmItem.emotion });
    }
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
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 10px rgba(var(--color-primary-rgb),0.25)',
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
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 10px rgba(var(--color-primary-rgb),0.25)',
                }}
              >
                Installer
              </button>
            </div>
          </div>
        </div>
      )}

      {emotionPopup && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
        }} onClick={() => setEmotionPopup(null)}>
          <div
            style={{
              background: 'rgba(var(--color-bg1-rgb),0.96)',
              border: '1px solid rgba(var(--color-accent-rgb),0.2)',
              borderRadius: 24,
              padding: '1.6rem 2rem',
              maxWidth: 360,
              width: 'calc(100% - 2rem)',
              textAlign: 'center',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              animation: 'bounce-in 0.3s ease forwards',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <PopupCloseButton onClick={() => setEmotionPopup(null)} />
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginBottom: '0.4rem' }}>
              {emotionPopup.emotion.symbol} {emotionPopup.emotion.name}
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
              <div style={{
                width: 112,
                height: 112,
                borderRadius: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'radial-gradient(circle at 50% 45%, rgba(255,255,255,0.08), rgba(255,255,255,0.02) 68%)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <CharacterSprite id={emotionPopup.charId} mood={emotionPopup.emotion.id} size={80} glow={false} />
              </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: 1.55, marginBottom: '1rem' }}>
              {emotionPopup.emotion.desc}
            </div>
            <button
              onClick={() => setEmotionPopup(null)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 800,
              }}
            >
              Fermer
            </button>
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
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 10px rgba(var(--color-primary-rgb),0.25)',
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
                  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '0.88rem',
                  fontWeight: 700,
                  boxShadow: '0 2px 10px rgba(var(--color-primary-rgb),0.25)',
                }}
              >
                Installer
              </button>
            </div>
          </div>
        </div>
      )}

      {previewMysteryImageId && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem',
        }} onClick={() => setPreviewMysteryImageId(null)}>
          <div
            style={{
              background: 'rgba(var(--color-bg1-rgb),0.96)',
              border: '1px solid rgba(var(--color-accent-rgb),0.2)',
              borderRadius: 24,
              padding: '1.2rem',
              width: 'min(1120px, calc(100vw - 2rem))',
              boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
              animation: 'bounce-in 0.3s ease forwards',
              position: 'relative',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <PopupCloseButton onClick={() => setPreviewMysteryImageId(null)} />
            <MysteryImageArtwork imageId={previewMysteryImageId} mysteryImageDefinitions={mysteryImageDefinitions} progress={progress} large />
          </div>
        </div>
      )}

      <div style={{
        maxWidth: 700, width: '100%', padding: '1rem 1.5rem 3rem',
        opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.5s ease',
      }}>
        {isDebug && (
          <div style={{
            marginBottom: '0.85rem',
            padding: '0.75rem 0.9rem',
            borderRadius: 16,
            background: 'rgba(248,113,113,0.08)',
            border: '1px dashed rgba(248,113,113,0.28)',
            color: '#fecaca',
            fontSize: '0.8rem',
            lineHeight: 1.45,
          }}>
            <strong style={{ color: '#fff', fontWeight: 800 }}>Debug boutique</strong>
            {' '}catalogue: {baseShopTotal} pièces · images mystère: {mysteryImagesTotal} pièces · total: {globalShopTotal} pièces
          </div>
        )}

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.8rem 0.9rem',
          marginBottom: '0.85rem',
          borderRadius: 20,
          background: 'linear-gradient(180deg, rgba(var(--color-bg1-rgb),0.96), rgba(var(--color-bg2-rgb),0.82))',
          border: '1px solid rgba(var(--color-primary-rgb),0.16)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.03)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(var(--color-primary-rgb),0.1)',
              border: '1px solid rgba(var(--color-primary-rgb),0.18)',
              borderRadius: 12, padding: '0.5rem 0.8rem',
              color: 'var(--color-accent)', cursor: 'pointer',
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
            background: 'linear-gradient(135deg, rgba(var(--color-accent-rgb),0.16), rgba(var(--color-primary-rgb),0.14))',
            border: '1px solid rgba(var(--color-accent-rgb),0.22)',
            borderRadius: 12, padding: '0.42rem 0.82rem',
          }}>
            <CoinIcon size={18} />
            <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-accent)' }}>
              {coins}
            </span>
          </div>
        </div>

        {/* Category tabs */}
        <div style={{
          display: 'flex', gap: '0.4rem',
          marginBottom: '1.2rem',
          background: 'rgba(var(--color-bg1-rgb),0.32)',
          borderRadius: 14, padding: '0.3rem',
          border: '1px solid rgba(var(--color-primary-rgb),0.1)',
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

        {activeTab === 'persos' ? (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            borderRadius: 22,
            background: 'linear-gradient(180deg, rgba(7,19,12,0.52), rgba(15,15,28,0.58))',
            border: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
            <div style={{
              fontSize: '0.78rem', color: '#6b7280', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: '0.6rem', paddingLeft: '0.2rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              <span>{CATEGORY_ICONS.persos}</span>
              Personnages et émotions
            </div>
            <div style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.5, margin: '0 0 1rem 0.2rem' }}>
              Achète un perso pour l’activer dans tes quiz, puis débloque ses émotions spéciales.
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {SHOP_CHARACTERS.map((char) => (
                <ShopCharacterCard
                  key={char.id}
                  char={char}
                  progress={progress}
                  coins={coins}
                  purchaseAnim={purchaseAnim}
                  onBuyCharacter={handleRequestCharacterPurchase}
                  onBuyEmotion={handleRequestEmotionPurchase}
                />
              ))}
            </div>
          </div>
        ) : activeTab === 'mystere' ? (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            borderRadius: 22,
            background: 'linear-gradient(180deg, rgba(7,19,12,0.52), rgba(15,15,28,0.58))',
            border: '1px solid rgba(255,255,255,0.05)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}>
            <div style={{
              fontSize: '0.78rem', color: '#6b7280', fontWeight: 700,
              textTransform: 'uppercase', letterSpacing: '0.06em',
              marginBottom: '0.6rem', paddingLeft: '0.2rem',
              display: 'flex', alignItems: 'center', gap: '0.4rem',
            }}>
              <span>{CATEGORY_ICONS.mystere}</span>
              Image mystère
            </div>
            <div style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.5, margin: '0 0 1rem 0.2rem' }}>
              Dévoile un fragment à la fois. Maximum 2 fragments par jour, sur les deux images confondues.
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {Object.keys(mysteryImageDefinitions).map((imageId) => (
                <MysteryImageCard
                  key={imageId}
                  imageId={imageId}
                  mysteryImageDefinitions={mysteryImageDefinitions}
                  progress={progress}
                  purchaseAnim={purchaseAnim}
                  onPurchase={handleRequestMysteryPurchase}
                  onPreview={() => setPreviewMysteryImageId(imageId)}
                />
              ))}
            </div>
          </div>
        ) : (
          Object.entries(grouped).map(([groupKey, items]) => (
            <div key={groupKey} style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              borderRadius: 22,
              background: 'linear-gradient(180deg, rgba(7,19,12,0.52), rgba(15,15,28,0.58))',
              border: '1px solid rgba(255,255,255,0.05)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
            }}>
              {SUBCATEGORY_LABELS[groupKey] && (
                <div style={{ marginBottom: '0.75rem', paddingLeft: '0.2rem' }}>
                  <div style={{
                    fontSize: '0.78rem', color: '#6b7280', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.06em',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    marginBottom: '0.2rem',
                  }}>
                    <span>{CATEGORY_ICONS[groupKey] || ''}</span>
                    {SUBCATEGORY_LABELS[groupKey]}
                  </div>
                  {SUBCATEGORY_DESCRIPTIONS[groupKey] && (
                    <div style={{ fontSize: '0.8rem', color: '#9ca3af', lineHeight: 1.4 }}>
                      {SUBCATEGORY_DESCRIPTIONS[groupKey]}
                    </div>
                  )}
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
          ))
        )}

        {activeTab !== 'mystere' && activeTab !== 'persos' && filteredItems.length === 0 && (
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

function MysteryImageArtwork({ imageId, mysteryImageDefinitions, progress, large = false, onClick }) {
  const definition = mysteryImageDefinitions[imageId];
  const revealedCount = getMysteryImageProgress(progress, imageId, mysteryImageDefinitions).revealedCount;
  const revealedTiles = new Set(getMysteryRevealedTileIndices(progress, imageId, mysteryImageDefinitions));

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        borderRadius: large ? 20 : 16,
        overflow: 'hidden',
        aspectRatio: '1408 / 768',
        background: 'rgba(9,12,20,0.88)',
        cursor: onClick ? 'pointer' : 'default',
      }}
    >
      <img
        src={getMysteryImageSource(imageId, mysteryImageDefinitions)}
        alt={definition.name}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
      {[0, 1, 2, 3, 4, 5].map((tileIndex) => {
        const col = tileIndex % 3;
        const row = Math.floor(tileIndex / 3);
        const revealed = revealedTiles.has(tileIndex);
        return (
          <div
            key={tileIndex}
            style={{
              position: 'absolute',
              left: `${col * 33.3333}%`,
              top: `${row * 50}%`,
              width: '33.3333%',
              height: '50%',
              border: '1px solid rgba(255,255,255,0.08)',
              boxSizing: 'border-box',
              background: revealed ? 'transparent' : 'linear-gradient(180deg, rgba(7,10,18,0.88), rgba(3,5,10,0.94))',
              backdropFilter: revealed ? 'none' : 'blur(18px) saturate(0.7) brightness(0.55)',
              WebkitBackdropFilter: revealed ? 'none' : 'blur(18px) saturate(0.7) brightness(0.55)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.35s ease',
            }}
          >
            {!revealed && (
              <div style={{
                width: large ? 52 : 34,
                height: large ? 52 : 34,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f8fafc',
                fontSize: large ? '1.3rem' : '1rem',
                fontWeight: 800,
                boxShadow: '0 8px 22px rgba(0,0,0,0.28)',
              }}>
                ?
              </div>
            )}
          </div>
        );
      })}
      <div style={{
        position: 'absolute',
        left: large ? 16 : 12,
        bottom: large ? 16 : 12,
        padding: large ? '0.48rem 0.74rem' : '0.38rem 0.6rem',
        borderRadius: 999,
        background: 'rgba(10,14,24,0.68)',
        border: '1px solid rgba(255,255,255,0.08)',
        color: '#fff',
        fontSize: large ? '0.88rem' : '0.74rem',
        fontWeight: 700,
      }}>
        {revealedCount}/{MYSTERY_IMAGE_PARTS} fragments
      </div>
    </div>
  );
}

function MysteryImageCard({ imageId, mysteryImageDefinitions, progress, purchaseAnim, onPurchase, onPreview }) {
  const definition = mysteryImageDefinitions[imageId];
  const progressEntry = getMysteryImageProgress(progress, imageId, mysteryImageDefinitions);
  const revealedCount = progressEntry.revealedCount;
  const purchasesLeftToday = getMysteryPurchasesLeftToday(progress, undefined, mysteryImageDefinitions);
  const nextUnlockDate = getMysteryNextUnlockDate(progress, undefined, mysteryImageDefinitions);
  const affordable = (progress.coins || 0) >= MYSTERY_IMAGE_PRICE;
  const complete = revealedCount >= MYSTERY_IMAGE_PARTS;
  const dailyLocked = purchasesLeftToday <= 0;
  const canPurchase = canPurchaseMysteryImagePiece(progress, imageId, undefined, mysteryImageDefinitions);
  const isAnimating = purchaseAnim === `${MYSTERY_IMAGE_PURCHASE_PREFIX}${imageId}`;
  const missing = MYSTERY_IMAGE_PRICE - (progress.coins || 0);

  let buttonText = '';
  let buttonAction = null;
  let buttonStyle = {};

  if (complete) {
    buttonText = 'Image complète';
    buttonStyle = {
      background: 'rgba(74,222,128,0.12)',
      border: '1px solid rgba(74,222,128,0.22)',
      color: '#4ade80',
      cursor: 'default',
    };
  } else if (dailyLocked) {
    buttonText = 'Max du jour';
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
  } else if (canPurchase) {
    buttonText = 'Dévoiler 1 fragment';
    buttonAction = () => onPurchase(imageId);
    buttonStyle = {
      background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
      border: 'none',
      color: '#fff',
      cursor: 'pointer',
      boxShadow: '0 2px 10px rgba(var(--color-primary-rgb),0.25)',
    };
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.8rem',
      padding: '0.95rem',
      borderRadius: 18,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.06)',
      animation: isAnimating ? 'bounce-in 0.5s ease' : 'none',
    }}>
      <MysteryImageArtwork imageId={imageId} mysteryImageDefinitions={mysteryImageDefinitions} progress={progress} onClick={onPreview} />

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.6rem', alignItems: 'baseline', marginBottom: '0.15rem' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff' }}>
            {definition.name}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.28rem', color: '#fbbf24', fontSize: '0.78rem', fontWeight: 700 }}>
            <CoinIcon size={14} />
            {MYSTERY_IMAGE_PRICE}
          </div>
        </div>
        <div style={{ fontSize: '0.76rem', color: '#9ca3af', lineHeight: 1.45 }}>
          6 fragments à révéler. La tête se débloque en dernier.
        </div>
        <div style={{ fontSize: '0.74rem', color: '#6b7280', lineHeight: 1.45, marginTop: '0.28rem' }}>
          {complete
            ? 'Image entièrement dévoilée.'
            : dailyLocked
              ? `Limite du jour atteinte. Retour à partir du ${formatFrenchDate(nextUnlockDate)}.`
              : `Il reste ${purchasesLeftToday} fragment${purchasesLeftToday > 1 ? 's' : ''} à dévoiler aujourd’hui.`}
        </div>
      </div>

      <button
        onClick={buttonAction || undefined}
        disabled={!buttonAction}
        style={{
          width: '100%',
          padding: '0.72rem 0.9rem',
          borderRadius: 12,
          fontSize: '0.82rem',
          fontWeight: 800,
          transition: 'all 0.15s ease',
          ...buttonStyle,
        }}
      >
        {buttonText}
      </button>
    </div>
  );
}

function ShopCharacterCard({ char, progress, coins, purchaseAnim, onBuyCharacter, onBuyEmotion }) {
  const ownedIds = progress.shop?.owned || [];
  const charItemId = `char-${char.id}`;
  const ownsCharacter = ownedIds.includes(charItemId);
  const canBuyCharacter = coins >= 500;
  const missingForCharacter = Math.max(0, 500 - coins);
  const isAnimating = purchaseAnim === charItemId;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.8rem',
      padding: '1rem',
      borderRadius: 18,
      background: ownsCharacter ? `${char.color}10` : 'rgba(255,255,255,0.04)',
      border: ownsCharacter ? `1px solid ${char.color}35` : '1px solid rgba(255,255,255,0.06)',
      animation: isAnimating ? 'bounce-in 0.5s ease' : 'none',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
        <div style={{
          width: 46,
          height: 46,
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: ownsCharacter ? `${char.color}18` : 'rgba(255,255,255,0.04)',
          border: `1px solid ${ownsCharacter ? `${char.color}55` : 'rgba(255,255,255,0.08)'}`,
          flexShrink: 0,
          fontSize: '1.4rem',
        }}>
          {ownsCharacter ? <CharacterSprite id={char.id} mood="walk" size={30} glow={false} /> : char.emoji}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '0.92rem', fontWeight: 800, color: ownsCharacter ? char.color : '#fff', marginBottom: '0.12rem' }}>
            {char.name}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#9ca3af', lineHeight: 1.4 }}>
            {char.tag}
          </div>
        </div>
        {ownsCharacter ? (
          <div style={{
            padding: '0.55rem 0.8rem',
            borderRadius: 10,
            background: 'rgba(74,222,128,0.12)',
            border: '1px solid rgba(74,222,128,0.28)',
            color: '#4ade80',
            fontSize: '0.78rem',
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}>
            ✓ Possédé
          </div>
        ) : (
          <button
            onClick={() => onBuyCharacter(char)}
            disabled={!canBuyCharacter}
            style={{
              padding: '0.55rem 0.8rem',
              borderRadius: 10,
              border: 'none',
              background: canBuyCharacter
                ? 'linear-gradient(135deg, var(--color-primary), var(--color-accent))'
                : 'rgba(255,255,255,0.05)',
              color: canBuyCharacter ? '#fff' : '#4b5563',
              cursor: canBuyCharacter ? 'pointer' : 'default',
              fontSize: '0.78rem',
              fontWeight: 800,
              whiteSpace: 'nowrap',
            }}
          >
            {canBuyCharacter ? 'Acheter 500' : `Manque ${missingForCharacter}`}
          </button>
        )}
      </div>

      {ownsCharacter && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.55rem',
        }}>
          {SHOP_EMOTIONS.map((emotion) => {
            const owned = ownedIds.includes(`char-${char.id}-${emotion.id}`);
            const affordable = coins >= emotion.price;
            return (
              <button
                key={emotion.id}
                onClick={() => onBuyEmotion(char, emotion)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  width: '100%',
                  padding: '0.65rem 0.75rem',
                  borderRadius: 12,
                  border: owned
                    ? '1px solid rgba(74,222,128,0.28)'
                    : '1px solid rgba(255,255,255,0.08)',
                  background: owned
                    ? 'rgba(74,222,128,0.08)'
                    : 'rgba(255,255,255,0.03)',
                  color: '#e2e2e2',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '1rem' }}>{emotion.symbol}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontSize: '0.76rem', fontWeight: 800, color: owned ? '#4ade80' : '#fff' }}>
                    {emotion.name}
                  </span>
                  <span style={{ display: 'block', fontSize: '0.65rem', color: '#6b7280', lineHeight: 1.35 }}>
                    {emotion.desc}
                  </span>
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 800, color: owned ? '#4ade80' : affordable ? '#fbbf24' : '#4b5563', whiteSpace: 'nowrap' }}>
                  {owned ? '✓' : emotion.price}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ShopItemCard({ item, progress, shields, purchaseAnim, onPurchase, onEquip, onPreviewFlame, onPreviewTitle, onPreviewVictory }) {
  const owned = item.type === 'permanent' && isOwned(progress, item.id);
  const affordable = canAfford(progress, item.id);
  const coins = progress.coins || 0;
  const missing = item.price - coins;
  const isAnimating = purchaseAnim === item.id;
  const isDoubleCoins = item.id === 'double-coins';
  const doubleCoinsLocked = isDoubleCoins && isDoubleCoinsWeeklyLocked(progress);
  const doubleCoinsNextUnlockDate = isDoubleCoins ? getDoubleCoinsNextUnlockDate(progress) : null;
  const doubleCoinsRemainingSessions = isDoubleCoins ? getDoubleCoinsRemainingSessions(progress) : 0;

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

  if (item.category === 'entranceAnimations' && owned) {
    buttonText = 'Actif';
    buttonStyle = {
      background: 'rgba(74,222,128,0.12)',
      border: '1px solid rgba(74,222,128,0.3)',
      color: '#4ade80',
      cursor: 'default',
    };
  } else if (owned && equipped) {
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
  } else if (doubleCoinsLocked) {
    buttonText = 'Déjà pris';
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
      background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
      border: 'none',
      color: '#fff',
      cursor: 'pointer',
      boxShadow: '0 2px 10px rgba(var(--color-primary-rgb),0.25)',
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
        {isDoubleCoins && doubleCoinsLocked && (
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', lineHeight: 1.4, marginTop: '0.22rem' }}>
            Achat hebdo déjà utilisé. Débloqué à partir du {formatFrenchDate(doubleCoinsNextUnlockDate)}.
          </div>
        )}
        {isDoubleCoins && !doubleCoinsLocked && doubleCoinsRemainingSessions > 0 && (
          <div style={{ fontSize: '0.72rem', color: '#9ca3af', lineHeight: 1.4, marginTop: '0.22rem' }}>
            Boost actif: {doubleCoinsRemainingSessions} quiz restant{doubleCoinsRemainingSessions > 1 ? 's' : ''}.
          </div>
        )}
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
  backgroundColor: 'var(--color-bg1)',
  backgroundImage: 'var(--app-page-overlay), var(--app-page-image)',
  backgroundSize: 'cover, cover',
  backgroundPosition: 'center, center',
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  fontFamily: 'var(--font-body)',
  color: '#e2e2e2',
};

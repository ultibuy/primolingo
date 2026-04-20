/**
 * Economy system — shop catalog, purchasing, equipping, and weekly chest.
 */
import mhaTransparent from '../assets/mha-transparent.png';
import { formatLocalDate, getToday, parseLocalDate } from './sm2.js';

export const DOUBLE_COINS_PRICE = 100;
export const DOUBLE_COINS_SESSION_COUNT = 5;
export const MYSTERY_IMAGE_PRICE = 60;
export const MYSTERY_IMAGE_PARTS = 6;
export const MYSTERY_IMAGE_DAILY_LIMIT = 2;
export const MYSTERY_IMAGE_PURCHASE_PREFIX = 'mystery-piece:';
export const MYSTERY_IMAGE_STATE_VERSION = 2;
export const MYSTERY_IMAGE_DEFINITIONS = {
  manga: {
    id: 'manga',
    name: 'Dragon céleste',
    revealOrder: [1, 2, 3, 4, 5, 0],
  },
  ryu: {
    id: 'ryu',
    name: 'Guerrier fulgurant',
    revealOrder: [0, 2, 3, 4, 5, 1],
  },
};

export function buildMysteryRevealOrder(finalTileIndex) {
  const safeFinalTileIndex = Math.max(0, Math.min(MYSTERY_IMAGE_PARTS - 1, Number(finalTileIndex) || 0));
  const order = [];
  for (let tileIndex = 0; tileIndex < MYSTERY_IMAGE_PARTS; tileIndex += 1) {
    if (tileIndex !== safeFinalTileIndex) order.push(tileIndex);
  }
  order.push(safeFinalTileIndex);
  return order;
}

function getMysteryFinalTileIndex(definition) {
  if (Number.isInteger(definition?.finalTileIndex)) {
    return Math.max(0, Math.min(MYSTERY_IMAGE_PARTS - 1, definition.finalTileIndex));
  }
  const fallback = Array.isArray(definition?.revealOrder)
    ? definition.revealOrder[definition.revealOrder.length - 1]
    : MYSTERY_IMAGE_PARTS - 1;
  return Math.max(0, Math.min(MYSTERY_IMAGE_PARTS - 1, Number(fallback) || 0));
}

function createRandomMysteryRevealOrder(definition) {
  const finalTileIndex = getMysteryFinalTileIndex(definition);
  const order = [];
  for (let tileIndex = 0; tileIndex < MYSTERY_IMAGE_PARTS; tileIndex += 1) {
    if (tileIndex !== finalTileIndex) order.push(tileIndex);
  }

  for (let index = order.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[swapIndex]] = [order[swapIndex], order[index]];
  }

  order.push(finalTileIndex);
  return order;
}

function isValidMysteryRevealOrder(order, definition) {
  if (!Array.isArray(order) || order.length !== MYSTERY_IMAGE_PARTS) return false;
  const normalized = order.map((tileIndex) => Number(tileIndex));
  if (normalized.some((tileIndex) => !Number.isInteger(tileIndex) || tileIndex < 0 || tileIndex >= MYSTERY_IMAGE_PARTS)) {
    return false;
  }
  if (new Set(normalized).size !== MYSTERY_IMAGE_PARTS) return false;
  return normalized[MYSTERY_IMAGE_PARTS - 1] === getMysteryFinalTileIndex(definition);
}

function sanitizeCustomMysteryImageDefinition(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const id = String(entry.id || '').trim();
  const title = String(entry.title || '').trim();
  const imageDataUrl = String(entry.imageDataUrl || '').trim();
  if (!id || !title || !imageDataUrl) return null;
  return {
    id,
    name: title,
    imageDataUrl,
    finalTileIndex: Math.max(0, Math.min(MYSTERY_IMAGE_PARTS - 1, Number(entry.finalTileIndex) || 0)),
    revealOrder: buildMysteryRevealOrder(entry.finalTileIndex),
    source: 'custom',
  };
}

export function getMysteryImageDefinitions(customMysteryImages = []) {
  const definitions = {
    ...MYSTERY_IMAGE_DEFINITIONS,
  };
  for (const entry of customMysteryImages) {
    const sanitized = sanitizeCustomMysteryImageDefinition(entry);
    if (!sanitized) continue;
    definitions[sanitized.id] = sanitized;
  }
  return definitions;
}


/**
 * Complete shop catalog.
 * Categories: themes, flames, titles, victoryAnimations, streakFreeze,
 *             doubleCoins, revealHint, rematch, modeSniper, questionMystery
 */
export const SHOP_CATALOG = {
  // ── Cosmetic: Themes ──
  'theme-dark-blue': {
    id: 'theme-dark-blue',
    category: 'themes',
    name: 'Dark Blue',
    description: 'Une palette bleu profond, sobre et élégante.',
    price: 80,
    type: 'permanent',
    tier: 'basic',
  },
  'theme-forest-green': {
    id: 'theme-forest-green',
    category: 'themes',
    name: 'Forest Green',
    description: 'Vert forêt apaisant pour se concentrer.',
    price: 80,
    type: 'permanent',
    tier: 'basic',
  },
  'theme-warm-amber': {
    id: 'theme-warm-amber',
    category: 'themes',
    name: 'Warm Amber',
    description: 'Tons chauds et dorés, lumière de fin de journée.',
    price: 80,
    type: 'permanent',
    tier: 'basic',
  },
  'theme-aurora': {
    id: 'theme-aurora',
    category: 'themes',
    name: 'Aurora',
    description: 'Palette aurore boréale — vert, violet, cyan.',
    price: 320,
    type: 'permanent',
    tier: 'premium',
  },
  'theme-midnight-purple': {
    id: 'theme-midnight-purple',
    category: 'themes',
    name: 'Midnight Purple',
    description: 'Violet profond et mystérieux.',
    price: 320,
    type: 'permanent',
    tier: 'premium',
  },
  'theme-my-hero-academy': {
    id: 'theme-my-hero-academy',
    category: 'themes',
    name: 'My Hero Academy',
    description: 'Palette héroïque vert olive et or doux avec ambiance manga.',
    price: 360,
    type: 'permanent',
    tier: 'premium',
  },
  // ── Cosmetic: Flames ──
  'flame-lightning': {
    id: 'flame-lightning',
    category: 'flames',
    name: 'Éclair',
    description: 'Électrise ton streak',
    price: 130,
    type: 'permanent',
    emoji: '⚡',
  },
  'flame-wave': {
    id: 'flame-wave',
    category: 'flames',
    name: 'Vague',
    description: 'Surfe sur ta série',
    price: 130,
    type: 'permanent',
    emoji: '🌊',
  },
  'flame-target': {
    id: 'flame-target',
    category: 'flames',
    name: 'Cible',
    description: 'Précision maximale',
    price: 130,
    type: 'permanent',
    emoji: '🎯',
  },
  'flame-skull': {
    id: 'flame-skull',
    category: 'flames',
    name: 'Crâne',
    description: 'Mode hardcore',
    price: 130,
    type: 'permanent',
    emoji: '💀',
  },
  'flame-dragon': {
    id: 'flame-dragon',
    category: 'flames',
    name: 'Dragon',
    description: 'Puissance mythique',
    price: 130,
    type: 'permanent',
    emoji: '🐉',
  },

  // ── Cosmetic: Titles ──
  'title-le-boss': {
    id: 'title-le-boss',
    category: 'titles',
    name: 'Le Boss',
    description: 'Affiche "Le Boss" à la place du titre de streak.',
    price: 240,
    type: 'permanent',
    titleText: 'Le Boss',
  },
  'title-machine': {
    id: 'title-machine',
    category: 'titles',
    name: 'Machine',
    description: 'Affiche "Machine" à la place du titre de streak.',
    price: 240,
    type: 'permanent',
    titleText: 'Machine',
  },
  'title-sniper': {
    id: 'title-sniper',
    category: 'titles',
    name: 'Sniper',
    description: 'Affiche "Sniper" à la place du titre de streak.',
    price: 240,
    type: 'permanent',
    titleText: 'Sniper',
  },
  'title-intouchable': {
    id: 'title-intouchable',
    category: 'titles',
    name: 'Intouchable',
    description: 'Affiche "Intouchable" à la place du titre de streak.',
    price: 240,
    type: 'permanent',
    titleText: 'Intouchable',
  },
  'title-cerebral': {
    id: 'title-cerebral',
    category: 'titles',
    name: 'Cérébral',
    description: 'Affiche "Cérébral" à la place du titre de streak.',
    price: 240,
    type: 'permanent',
    titleText: 'Cérébral',
  },

  // ── Cosmetic: Victory Animations ──
  'anim-neon': {
    id: 'anim-neon',
    category: 'victoryAnimations',
    name: 'Glow Néon',
    description: 'Halo néon clignotant autour du trophée',
    price: 190,
    type: 'permanent',
  },
  'anim-glitch': {
    id: 'anim-glitch',
    category: 'victoryAnimations',
    name: 'Effet Glitch',
    description: 'Distorsion numérique brève',
    price: 190,
    type: 'permanent',
  },
  'anim-shockwave': {
    id: 'anim-shockwave',
    category: 'victoryAnimations',
    name: 'Onde de choc',
    description: 'Cercle qui s\'expand depuis le centre',
    price: 190,
    type: 'permanent',
  },
  'anim-confetti': {
    id: 'anim-confetti',
    category: 'victoryAnimations',
    name: 'Confettis sobres',
    description: 'Quelques confettis dorés qui tombent',
    price: 190,
    type: 'permanent',
  },

  // ── Cosmetic: Entrance Animations (level-up) ──
  'entrance-lightning': {
    id: 'entrance-lightning',
    category: 'entranceAnimations',
    name: '⚡ Frappe de foudre',
    description: 'Éclair électrique à chaque montée de niveau',
    price: 300,
    type: 'permanent',
  },
  'entrance-stars': {
    id: 'entrance-stars',
    category: 'entranceAnimations',
    name: '✨ Explosion d\'étoiles',
    description: 'Pluie d\'étoiles dorées sur l\'écran',
    price: 300,
    type: 'permanent',
  },
  'entrance-inferno': {
    id: 'entrance-inferno',
    category: 'entranceAnimations',
    name: '🔥 Inferno',
    description: 'Flammes infernales envahissent l\'écran',
    price: 300,
    type: 'permanent',
  },
  'entrance-freeze': {
    id: 'entrance-freeze',
    category: 'entranceAnimations',
    name: '❄️ Freeze',
    description: 'Cristaux de glace explosent à l\'écran',
    price: 300,
    type: 'permanent',
  },

  // ── Consumables: Insurance & Comfort ──
  'streak-freeze': {
    id: 'streak-freeze',
    category: 'streakFreeze',
    name: 'Bouclier de streak',
    description: 'Protège ton streak pendant 1 jour. Max 2 en stock.',
    price: 160,
    type: 'consumable',
  },
  'double-coins': {
    id: 'double-coins',
    category: 'doubleCoins',
    name: 'Double coins',
    description: 'Double les gains des 5 prochains quiz. 1 achat par semaine.',
    price: DOUBLE_COINS_PRICE,
    type: 'consumable',
  },

  // ── Consumables: Quiz Lifelines ──
  'reveal-hint': {
    id: 'reveal-hint',
    category: 'revealHint',
    name: 'Indice',
    description: 'Voir les axes de décision pour 1 question en mode direct.',
    price: 50,
    type: 'consumable',
  },
  'rematch': {
    id: 'rematch',
    category: 'rematch',
    name: 'Revanche',
    description: 'Rejouer une session ratée avec les mêmes questions.',
    price: 60,
    type: 'consumable',
  },
  'mode-sniper': {
    id: 'mode-sniper',
    category: 'modeSniper',
    name: 'Mode Sniper',
    description: 'Session courte de 5 questions difficulté max.',
    price: 100,
    type: 'consumable',
  },
  'question-mystery': {
    id: 'question-mystery',
    category: 'questionMystery',
    name: 'Question mystère',
    description: 'Remplace la prochaine question par une question d\'une autre règle.',
    price: 32,
    type: 'consumable',
  },
};

/**
 * Theme definitions for the app color palette.
 */
export const THEMES = {
  default: { primary: '#a78bfa', accent: '#c4b5fd', bg1: '#1e1e2e', bg2: '#2d2b55', pageOverlay: 'linear-gradient(135deg, #1e1e2e 0%, #2d2b55 100%)', pageImage: 'none', pageImageSize: 'cover', pageImagePosition: 'center center', pageImageRepeat: 'no-repeat' },
  'theme-dark-blue': { primary: '#60a5fa', accent: '#93c5fd', bg1: '#0f172a', bg2: '#1e293b', pageOverlay: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', pageImage: 'none', pageImageSize: 'cover', pageImagePosition: 'center center', pageImageRepeat: 'no-repeat' },
  'theme-forest-green': { primary: '#4ade80', accent: '#86efac', bg1: '#14261c', bg2: '#1a3a2a', pageOverlay: 'linear-gradient(135deg, #14261c 0%, #1a3a2a 100%)', pageImage: 'none', pageImageSize: 'cover', pageImagePosition: 'center center', pageImageRepeat: 'no-repeat' },
  'theme-warm-amber': { primary: '#fbbf24', accent: '#fde68a', bg1: '#27200f', bg2: '#3d3112', pageOverlay: 'linear-gradient(135deg, #27200f 0%, #3d3112 100%)', pageImage: 'none', pageImageSize: 'cover', pageImagePosition: 'center center', pageImageRepeat: 'no-repeat' },
  'theme-aurora': { primary: '#34d399', accent: '#a78bfa', bg1: '#0f1729', bg2: '#162033', pageOverlay: 'linear-gradient(135deg, #0f1729 0%, #162033 100%)', pageImage: 'none', pageImageSize: 'cover', pageImagePosition: 'center center', pageImageRepeat: 'no-repeat' },
  'theme-midnight-purple': { primary: '#c084fc', accent: '#e879f9', bg1: '#1a0a2e', bg2: '#2d1452', pageOverlay: 'linear-gradient(135deg, #1a0a2e 0%, #2d1452 100%)', pageImage: 'none', pageImageSize: 'cover', pageImagePosition: 'center center', pageImageRepeat: 'no-repeat' },
  'theme-my-hero-academy': {
    primary: '#b7d94c',
    accent: '#f0d36a',
    bg1: '#111b11',
    bg2: '#23361b',
    pageOverlay: 'linear-gradient(145deg, rgba(10,18,10,0.9) 0%, rgba(25,42,19,0.78) 48%, rgba(12,18,10,0.94) 100%)',
    pageImage: `url(${mhaTransparent})`,
    pageImageSize: 'min(78vw, 540px) auto',
    pageImagePosition: 'center center',
    pageImageRepeat: 'no-repeat',
  },
};

/**
 * Convert a hex color string to an RGB triplet string for use with rgba().
 * Example: '#a78bfa' → '167, 139, 250'
 */
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

/**
 * Apply a theme by setting CSS custom properties on :root.
 *
 * @param {string} themeId - Key from the THEMES object.
 */
export function applyTheme(themeId) {
  const theme = THEMES[themeId] || THEMES.default;
  const root = document.documentElement;
  root.style.setProperty('--color-primary', theme.primary);
  root.style.setProperty('--color-primary-rgb', hexToRgb(theme.primary));
  root.style.setProperty('--color-accent', theme.accent);
  root.style.setProperty('--color-accent-rgb', hexToRgb(theme.accent));
  root.style.setProperty('--color-bg1', theme.bg1);
  root.style.setProperty('--color-bg1-rgb', hexToRgb(theme.bg1));
  root.style.setProperty('--color-bg2', theme.bg2);
  root.style.setProperty('--color-bg2-rgb', hexToRgb(theme.bg2));
  root.style.setProperty('--app-page-overlay', theme.pageOverlay || THEMES.default.pageOverlay);
  root.style.setProperty('--app-page-image', theme.pageImage || 'none');
  root.style.setProperty('--app-page-image-size', theme.pageImageSize || 'cover');
  root.style.setProperty('--app-page-image-position', theme.pageImagePosition || 'center center');
  root.style.setProperty('--app-page-image-repeat', theme.pageImageRepeat || 'no-repeat');
}

/**
 * Check if the player can afford an item.
 *
 * @param {object} progress - Full progress object.
 * @param {string} itemId - ID of the item in SHOP_CATALOG.
 * @returns {boolean} True if player has enough coins.
 */
export function canAfford(progress, itemId) {
  const item = SHOP_CATALOG[itemId];
  if (!item) return false;
  return (progress.coins || 0) >= item.price;
}

function getWeekStartDate(dateStr) {
  const date = parseLocalDate(dateStr) || parseLocalDate(getToday());
  const day = date.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  date.setDate(date.getDate() + offset);
  return date;
}

export function getCurrentShopWeek(dateStr = getToday()) {
  return formatLocalDate(getWeekStartDate(dateStr));
}

export function getNextShopWeek(dateStr = getToday()) {
  const date = getWeekStartDate(dateStr);
  date.setDate(date.getDate() + 7);
  return formatLocalDate(date);
}

export function getDoubleCoinsRemainingSessions(progress) {
  const remaining = Number(progress?.shop?.activeBoosts?.doubleCoinsRemainingSessions || 0);
  if (remaining > 0) return remaining;
  return progress?.shop?.activeBoosts?.doubleCoins ? 1 : 0;
}

export function getDoubleCoinsBonusEarned(progress) {
  return Number(progress?.shop?.activeBoosts?.doubleCoinsBonusEarned || 0);
}

export function hasDoubleCoinsActive(progress) {
  return getDoubleCoinsRemainingSessions(progress) > 0;
}

export function isDoubleCoinsWeeklyLocked(progress, today = getToday()) {
  const lastPurchasedWeek = progress?.shop?.activeBoosts?.doubleCoinsLastPurchasedWeek || null;
  return !!lastPurchasedWeek && lastPurchasedWeek === getCurrentShopWeek(today);
}

export function getDoubleCoinsNextUnlockDate(progress, today = getToday()) {
  if (!isDoubleCoinsWeeklyLocked(progress, today)) return null;
  return getNextShopWeek(today);
}

export function createDefaultMysteryImagesState(definitions = MYSTERY_IMAGE_DEFINITIONS) {
  return {
    version: MYSTERY_IMAGE_STATE_VERSION,
    daily: {
      date: null,
      purchases: 0,
    },
    collections: Object.fromEntries(
      Object.keys(definitions).map((imageId) => [
        imageId,
        {
          revealedCount: 0,
          revealOrder: createRandomMysteryRevealOrder(definitions[imageId]),
        },
      ]),
    ),
  };
}

export function normalizeMysteryImagesState(mysteryImages, definitions = MYSTERY_IMAGE_DEFINITIONS) {
  const next = mysteryImages && typeof mysteryImages === 'object'
    ? JSON.parse(JSON.stringify(mysteryImages))
    : createDefaultMysteryImagesState(definitions);

  const stateVersion = Number(next.version || 0);
  next.version = MYSTERY_IMAGE_STATE_VERSION;

  if (!next.daily || typeof next.daily !== 'object') {
    next.daily = { date: null, purchases: 0 };
  }
  if (!Number.isFinite(next.daily.purchases)) {
    next.daily.purchases = 0;
  }
  if (typeof next.daily.date !== 'string') {
    next.daily.date = null;
  }
  if (stateVersion < MYSTERY_IMAGE_STATE_VERSION) {
    next.daily.date = null;
    next.daily.purchases = 0;
  }
  if (!next.collections || typeof next.collections !== 'object') {
    next.collections = {};
  }

  for (const imageId of Object.keys(definitions)) {
    const entry = next.collections[imageId];
    const revealedCount = Number(entry?.revealedCount || 0);
    const revealOrder = isValidMysteryRevealOrder(entry?.revealOrder, definitions[imageId])
      ? entry.revealOrder.map((tileIndex) => Number(tileIndex))
      : createRandomMysteryRevealOrder(definitions[imageId]);
    next.collections[imageId] = {
      revealedCount: Math.max(0, Math.min(MYSTERY_IMAGE_PARTS, revealedCount)),
      revealOrder,
    };
  }

  return next;
}

export function isMysteryPurchaseId(itemId) {
  return typeof itemId === 'string' && itemId.startsWith(MYSTERY_IMAGE_PURCHASE_PREFIX);
}

export function getMysteryImageIdFromPurchaseId(itemId, definitions = MYSTERY_IMAGE_DEFINITIONS) {
  if (!isMysteryPurchaseId(itemId)) return null;
  const imageId = itemId.slice(MYSTERY_IMAGE_PURCHASE_PREFIX.length);
  return definitions[imageId] ? imageId : null;
}

export function getMysteryImageProgress(progress, imageId, definitions = MYSTERY_IMAGE_DEFINITIONS) {
  const normalized = normalizeMysteryImagesState(progress?.shop?.mysteryImages, definitions);
  return normalized.collections[imageId] || { revealedCount: 0 };
}

export function getMysteryPurchasesToday(progress, today = getToday(), definitions = MYSTERY_IMAGE_DEFINITIONS) {
  const normalized = normalizeMysteryImagesState(progress?.shop?.mysteryImages, definitions);
  if (normalized.daily.date !== today) return 0;
  return normalized.daily.purchases;
}

export function getMysteryPurchasesLeftToday(progress, today = getToday(), definitions = MYSTERY_IMAGE_DEFINITIONS) {
  return Math.max(0, MYSTERY_IMAGE_DAILY_LIMIT - getMysteryPurchasesToday(progress, today, definitions));
}

export function getMysteryNextUnlockDate(progress, today = getToday(), definitions = MYSTERY_IMAGE_DEFINITIONS) {
  return getMysteryPurchasesLeftToday(progress, today, definitions) > 0 ? null : getToday(1);
}

export function getMysteryRevealedTileIndices(progress, imageId, definitions = MYSTERY_IMAGE_DEFINITIONS) {
  const config = definitions[imageId];
  if (!config) return [];
  const mysteryProgress = getMysteryImageProgress(progress, imageId, definitions);
  const revealOrder = isValidMysteryRevealOrder(mysteryProgress.revealOrder, config)
    ? mysteryProgress.revealOrder
    : createRandomMysteryRevealOrder(config);
  return revealOrder.slice(0, mysteryProgress.revealedCount);
}

export function canPurchaseMysteryImagePiece(progress, imageId, today = getToday(), definitions = MYSTERY_IMAGE_DEFINITIONS) {
  if (!definitions[imageId]) return false;
  if ((progress?.coins || 0) < MYSTERY_IMAGE_PRICE) return false;
  if (getMysteryPurchasesLeftToday(progress, today, definitions) <= 0) return false;
  return getMysteryImageProgress(progress, imageId, definitions).revealedCount < MYSTERY_IMAGE_PARTS;
}

export function purchaseMysteryImagePiece(progress, imageId, today = getToday(), definitions = MYSTERY_IMAGE_DEFINITIONS) {
  if (!definitions[imageId]) {
    return { success: false, progress, message: 'Image mystère inconnue.' };
  }
  if ((progress?.coins || 0) < MYSTERY_IMAGE_PRICE) {
    return { success: false, progress, message: 'Tu n’as pas assez de pièces.' };
  }

  if (!progress.shop) {
    progress.shop = createDefaultShop();
  }

  progress.shop.mysteryImages = normalizeMysteryImagesState(progress.shop.mysteryImages, definitions);

  if (getMysteryPurchasesLeftToday(progress, today, definitions) <= 0) {
    return { success: false, progress, message: 'Tu as déjà dévoilé 2 morceaux aujourd’hui.' };
  }

  const collection = progress.shop.mysteryImages.collections[imageId];
  if (collection.revealedCount >= MYSTERY_IMAGE_PARTS) {
    return { success: false, progress, message: 'Cette image est déjà complète.' };
  }

  progress.coins = (progress.coins || 0) - MYSTERY_IMAGE_PRICE;
  collection.revealedCount += 1;
  if (progress.shop.mysteryImages.daily.date !== today) {
    progress.shop.mysteryImages.daily.date = today;
    progress.shop.mysteryImages.daily.purchases = 0;
  }
  progress.shop.mysteryImages.daily.purchases += 1;

  return { success: true, progress, message: 'Nouveau morceau dévoilé !' };
}

/**
 * Purchase an item. Deducts coins and adds to owned (for permanents)
 * or applies the effect (for consumables).
 *
 * @param {object} progress - Full progress object (will be mutated).
 * @param {string} itemId - ID of the item in SHOP_CATALOG.
 * @returns {object} { success, progress, message }
 */
export function purchaseItem(progress, itemId) {
  const item = SHOP_CATALOG[itemId];
  if (!item) {
    return { success: false, progress, message: 'Item inconnu.' };
  }

  if (!canAfford(progress, itemId)) {
    const missing = item.price - (progress.coins || 0);
    return { success: false, progress, message: `Il te manque ${missing} coins.` };
  }

  // Special check: streak-freeze max 2
  if (itemId === 'streak-freeze') {
    if ((progress.shields || 0) >= 2) {
      return { success: false, progress, message: 'Tu as déjà 2 boucliers en stock.' };
    }
  }

  // Deduct coins
  progress.coins = (progress.coins || 0) - item.price;

  // Apply based on type
  if (item.type === 'permanent') {
    // Add to owned list (avoid duplicates)
    if (!progress.shop) {
      progress.shop = createDefaultShop();
    }
    if (!progress.shop.owned.includes(itemId)) {
      progress.shop.owned.push(itemId);
    }
  } else {
    // Consumable effects
    if (!progress.shop) {
      progress.shop = createDefaultShop();
    }

    // Ensure inventory exists
    if (!progress.shop.inventory) {
      progress.shop.inventory = { revealHint: 0, rematch: 0, modeSniper: 0, questionMystery: 0 };
    }

    switch (itemId) {
      case 'streak-freeze':
        progress.shields = Math.min((progress.shields || 0) + 1, 2);
        break;
      case 'double-coins':
        progress.shop.activeBoosts = progress.shop.activeBoosts || {};
        progress.shop.activeBoosts.doubleCoins = true;
        progress.shop.activeBoosts.doubleCoinsRemainingSessions = getDoubleCoinsRemainingSessions(progress) + DOUBLE_COINS_SESSION_COUNT;
        progress.shop.activeBoosts.doubleCoinsLastPurchasedWeek = getCurrentShopWeek();
        break;
      case 'reveal-hint':
        progress.shop.inventory.revealHint = (progress.shop.inventory.revealHint || 0) + 1;
        break;
      case 'rematch':
        progress.shop.inventory.rematch = (progress.shop.inventory.rematch || 0) + 1;
        break;
      case 'mode-sniper':
        progress.shop.inventory.modeSniper = (progress.shop.inventory.modeSniper || 0) + 1;
        break;
      case 'question-mystery':
        progress.shop.inventory.questionMystery = (progress.shop.inventory.questionMystery || 0) + 1;
        break;
      default:
        break;
    }
  }

  return { success: true, progress, message: `${item.name} acheté !` };
}

/**
 * Equip a permanent item (set it as the active item for its category).
 *
 * @param {object} progress - Full progress object (will be mutated).
 * @param {string} itemId - ID of the item in SHOP_CATALOG.
 * @returns {object} { success, progress, message }
 */
export function equipItem(progress, itemId) {
  const item = SHOP_CATALOG[itemId];
  if (!item) {
    return { success: false, progress, message: 'Item inconnu.' };
  }
  if (item.type !== 'permanent') {
    return { success: false, progress, message: 'Seuls les items permanents peuvent être équipés.' };
  }
  if (!isOwned(progress, itemId)) {
    return { success: false, progress, message: 'Tu ne possèdes pas cet item.' };
  }

  if (!progress.shop) {
    progress.shop = createDefaultShop();
  }

  // Map category to equipped slot
  const categoryToSlot = {
    themes: 'theme',
    flames: 'flame',
    titles: 'title',
    victoryAnimations: 'victoryAnimation',
  };

  const slot = categoryToSlot[item.category];
  if (!slot) {
    return { success: false, progress, message: 'Catégorie non équipable.' };
  }

  progress.shop.equipped = progress.shop.equipped || {};
  progress.shop.equipped[slot] = itemId;

  return { success: true, progress, message: `${item.name} équipé !` };
}

/**
 * Check if an item is owned by the player.
 *
 * @param {object} progress - Full progress object.
 * @param {string} itemId - ID of the item in SHOP_CATALOG.
 * @returns {boolean} True if item is in owned list.
 */
export function isOwned(progress, itemId) {
  return (progress.shop?.owned || []).includes(itemId);
}

/**
 * Get the currently equipped item for a given category.
 *
 * @param {object} progress - Full progress object.
 * @param {string} category - Category slot: 'theme', 'flame', 'title', 'victoryAnimation'.
 * @returns {string|null} The equipped item ID, or null.
 */
export function getEquipped(progress, category) {
  const itemId = progress.shop?.equipped?.[category] || null;
  return itemId && SHOP_CATALOG[itemId] ? itemId : null;
}

/**
 * Helper to create the default shop structure.
 */
function createDefaultShop() {
  return {
    owned: [],
    equipped: {
      theme: null,
      flame: null,
      title: null,
      victoryAnimation: null,
    },
    activeBoosts: {
      doubleCoins: false,
      doubleCoinsRemainingSessions: 0,
      doubleCoinsBonusEarned: 0,
      doubleCoinsLastPurchasedWeek: null,
    },
    mysteryImages: createDefaultMysteryImagesState(),
    inventory: {
      revealHint: 0,
      rematch: 0,
      modeSniper: 0,
      questionMystery: 0,
    },
  };
}

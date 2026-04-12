/**
 * Economy system — shop catalog, purchasing, equipping, and weekly chest.
 */

import { getToday, parseLocalDate } from './sm2.js';

/**
 * Complete shop catalog.
 * Categories: themes, flames, titles, victoryAnimations, backgrounds, streakFreeze,
 *             doubleCoins, revealHint, rematch, modeSniper, questionMystery
 */
export const SHOP_CATALOG = {
  // ── Cosmetic: Themes ──
  'theme-dark-blue': {
    id: 'theme-dark-blue',
    category: 'themes',
    name: 'Dark Blue',
    description: 'Une palette bleu profond, sobre et élégante.',
    price: 40,
    type: 'permanent',
    tier: 'basic',
  },
  'theme-forest-green': {
    id: 'theme-forest-green',
    category: 'themes',
    name: 'Forest Green',
    description: 'Vert forêt apaisant pour se concentrer.',
    price: 40,
    type: 'permanent',
    tier: 'basic',
  },
  'theme-warm-amber': {
    id: 'theme-warm-amber',
    category: 'themes',
    name: 'Warm Amber',
    description: 'Tons chauds et dorés, lumière de fin de journée.',
    price: 40,
    type: 'permanent',
    tier: 'basic',
  },
  'theme-aurora': {
    id: 'theme-aurora',
    category: 'themes',
    name: 'Aurora',
    description: 'Palette aurore boréale — vert, violet, cyan.',
    price: 160,
    type: 'permanent',
    tier: 'premium',
  },
  'theme-midnight-purple': {
    id: 'theme-midnight-purple',
    category: 'themes',
    name: 'Midnight Purple',
    description: 'Violet profond et mystérieux.',
    price: 160,
    type: 'permanent',
    tier: 'premium',
  },

  // ── Cosmetic: Flames ──
  'flame-lightning': {
    id: 'flame-lightning',
    category: 'flames',
    name: 'Éclair',
    description: 'Électrise ton streak',
    price: 65,
    type: 'permanent',
    emoji: '⚡',
  },
  'flame-wave': {
    id: 'flame-wave',
    category: 'flames',
    name: 'Vague',
    description: 'Surfe sur ta série',
    price: 65,
    type: 'permanent',
    emoji: '🌊',
  },
  'flame-target': {
    id: 'flame-target',
    category: 'flames',
    name: 'Cible',
    description: 'Précision maximale',
    price: 65,
    type: 'permanent',
    emoji: '🎯',
  },
  'flame-skull': {
    id: 'flame-skull',
    category: 'flames',
    name: 'Crâne',
    description: 'Mode hardcore',
    price: 65,
    type: 'permanent',
    emoji: '💀',
  },
  'flame-dragon': {
    id: 'flame-dragon',
    category: 'flames',
    name: 'Dragon',
    description: 'Puissance mythique',
    price: 65,
    type: 'permanent',
    emoji: '🐉',
  },

  // ── Cosmetic: Titles ──
  'title-le-boss': {
    id: 'title-le-boss',
    category: 'titles',
    name: 'Le Boss',
    description: 'Affiche "Le Boss" à la place du titre de streak.',
    price: 120,
    type: 'permanent',
    titleText: 'Le Boss',
  },
  'title-machine': {
    id: 'title-machine',
    category: 'titles',
    name: 'Machine',
    description: 'Affiche "Machine" à la place du titre de streak.',
    price: 120,
    type: 'permanent',
    titleText: 'Machine',
  },
  'title-sniper': {
    id: 'title-sniper',
    category: 'titles',
    name: 'Sniper',
    description: 'Affiche "Sniper" à la place du titre de streak.',
    price: 120,
    type: 'permanent',
    titleText: 'Sniper',
  },
  'title-intouchable': {
    id: 'title-intouchable',
    category: 'titles',
    name: 'Intouchable',
    description: 'Affiche "Intouchable" à la place du titre de streak.',
    price: 120,
    type: 'permanent',
    titleText: 'Intouchable',
  },
  'title-cerebral': {
    id: 'title-cerebral',
    category: 'titles',
    name: 'Cérébral',
    description: 'Affiche "Cérébral" à la place du titre de streak.',
    price: 120,
    type: 'permanent',
    titleText: 'Cérébral',
  },

  // ── Cosmetic: Victory Animations ──
  'anim-neon': {
    id: 'anim-neon',
    category: 'victoryAnimations',
    name: 'Glow Néon',
    description: 'Halo néon clignotant autour du trophée',
    price: 95,
    type: 'permanent',
  },
  'anim-glitch': {
    id: 'anim-glitch',
    category: 'victoryAnimations',
    name: 'Effet Glitch',
    description: 'Distorsion numérique brève',
    price: 95,
    type: 'permanent',
  },
  'anim-shockwave': {
    id: 'anim-shockwave',
    category: 'victoryAnimations',
    name: 'Onde de choc',
    description: 'Cercle qui s\'expand depuis le centre',
    price: 95,
    type: 'permanent',
  },
  'anim-confetti': {
    id: 'anim-confetti',
    category: 'victoryAnimations',
    name: 'Confettis sobres',
    description: 'Quelques confettis dorés qui tombent',
    price: 95,
    type: 'permanent',
  },

  // ── Cosmetic: Dashboard Backgrounds ──
  'bg-geometric': {
    id: 'bg-geometric',
    category: 'backgrounds',
    name: 'Géométrique',
    description: 'Motif de lignes fines en arrière-plan',
    price: 120,
    type: 'permanent',
  },
  'bg-gradient': {
    id: 'bg-gradient',
    category: 'backgrounds',
    name: 'Gradient doux',
    description: 'Dégradé subtil qui change lentement',
    price: 120,
    type: 'permanent',
  },
  'bg-dots': {
    id: 'bg-dots',
    category: 'backgrounds',
    name: 'Points',
    description: 'Grille de points espacés',
    price: 120,
    type: 'permanent',
  },
  'bg-waves': {
    id: 'bg-waves',
    category: 'backgrounds',
    name: 'Vagues',
    description: 'Lignes ondulées au bas de l\'écran',
    price: 120,
    type: 'permanent',
  },

  // ── Consumables: Insurance & Comfort ──
  'streak-freeze': {
    id: 'streak-freeze',
    category: 'streakFreeze',
    name: 'Bouclier de streak',
    description: 'Protège ton streak pendant 1 jour. Max 2 en stock.',
    price: 80,
    type: 'consumable',
  },
  'double-coins': {
    id: 'double-coins',
    category: 'doubleCoins',
    name: 'Double coins',
    description: 'La prochaine session rapporte 2x les coins.',
    price: 65,
    type: 'consumable',
  },

  // ── Consumables: Quiz Lifelines ──
  'reveal-hint': {
    id: 'reveal-hint',
    category: 'revealHint',
    name: 'Indice',
    description: 'Voir les axes de décision pour 1 question en mode direct.',
    price: 25,
    type: 'consumable',
  },
  'rematch': {
    id: 'rematch',
    category: 'rematch',
    name: 'Revanche',
    description: 'Rejouer une session ratée avec les mêmes questions.',
    price: 30,
    type: 'consumable',
  },
  'mode-sniper': {
    id: 'mode-sniper',
    category: 'modeSniper',
    name: 'Mode Sniper',
    description: 'Session courte de 5 questions difficulté max.',
    price: 50,
    type: 'consumable',
  },
  'question-mystery': {
    id: 'question-mystery',
    category: 'questionMystery',
    name: 'Question mystère',
    description: 'Remplace la prochaine question par une question d\'une autre règle.',
    price: 16,
    type: 'consumable',
  },
};

/**
 * Theme definitions for the app color palette.
 */
export const THEMES = {
  default: { primary: '#a78bfa', accent: '#c4b5fd', bg1: '#1e1e2e', bg2: '#2d2b55' },
  'theme-dark-blue': { primary: '#60a5fa', accent: '#93c5fd', bg1: '#0f172a', bg2: '#1e293b' },
  'theme-forest-green': { primary: '#4ade80', accent: '#86efac', bg1: '#14261c', bg2: '#1a3a2a' },
  'theme-warm-amber': { primary: '#fbbf24', accent: '#fde68a', bg1: '#27200f', bg2: '#3d3112' },
  'theme-aurora': { primary: '#34d399', accent: '#a78bfa', bg1: '#0f1729', bg2: '#162033' },
  'theme-midnight-purple': { primary: '#c084fc', accent: '#e879f9', bg1: '#1a0a2e', bg2: '#2d1452' },
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
    backgrounds: 'dashboardBackground',
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
 * @param {string} category - Category slot: 'theme', 'flame', 'title', 'victoryAnimation', 'dashboardBackground'.
 * @returns {string|null} The equipped item ID, or null.
 */
export function getEquipped(progress, category) {
  return progress.shop?.equipped?.[category] || null;
}

/**
 * Roll the weekly chest. Available on Mondays if streak is active
 * and not already opened this week.
 *
 * Gives 10-50 random coins.
 *
 * @param {object} progress - Full progress object (will be mutated).
 * @returns {object} { opened, coins, progress, message }
 */
export function rollWeeklyChest(progress) {
  const today = getToday();
  const todayDate = parseLocalDate(today);

  // Check it's Monday (getDay() === 1)
  if (todayDate.getDay() !== 1) {
    return { opened: false, coins: 0, progress, message: 'Le coffre est disponible le lundi.' };
  }

  // Check streak is active (>= 1)
  const currentStreak = progress.streak?.current || 0;
  if (currentStreak < 1) {
    return { opened: false, coins: 0, progress, message: 'Il faut un streak actif pour ouvrir le coffre.' };
  }

  // Check not already opened this week
  if (!progress.weeklyChest) {
    progress.weeklyChest = { lastOpened: null };
  }

  if (progress.weeklyChest.lastOpened) {
    const lastOpened = parseLocalDate(progress.weeklyChest.lastOpened);
    // Check if last opened was this week (same Monday or later)
    const startOfWeek = new Date(todayDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1); // Monday of this week
    startOfWeek.setHours(0, 0, 0, 0);
    if (lastOpened >= startOfWeek) {
      return { opened: false, coins: 0, progress, message: 'Coffre déjà ouvert cette semaine.' };
    }
  }

  // Roll random coins 10-50
  const coinsWon = Math.floor(Math.random() * 41) + 10; // 10 to 50 inclusive

  progress.coins = (progress.coins || 0) + coinsWon;
  progress.weeklyChest.lastOpened = today;

  return {
    opened: true,
    coins: coinsWon,
    progress,
    message: `Coffre ouvert ! +${coinsWon} coins.`,
  };
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
      dashboardBackground: null,
    },
    activeBoosts: {
      doubleCoins: false,
    },
    inventory: {
      revealHint: 0,
      rematch: 0,
      modeSniper: 0,
      questionMystery: 0,
    },
  };
}

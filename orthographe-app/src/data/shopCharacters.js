import { getToday } from '../engine/sm2.js';

export const SHOP_CHARACTERS = [
  { id: 'panda',        emoji: '🐼',    name: 'Panda Samouraï',       tag: "Guerrier de l'ombre",        color: '#67e8f9', price: 250 },
  { id: 'fox',          emoji: '🦊',    name: 'Renard Espion',         tag: 'Rusé comme le vent',          color: '#fb923c', price: 500 },
  { id: 'wolf',         emoji: '🐺',    name: 'Loup Fantôme',          tag: 'Chasseur de la pleine lune',  color: '#818cf8', price: 500 },
  { id: 'tiger',        emoji: '🐯',    name: "Tigre de l'Éclair",     tag: 'Vitesse absolue',             color: '#fde047', price: 500 },
  { id: 'lion',         emoji: '🦁',    name: 'Lion Solaire',          tag: 'Roi de la savane',            color: '#fbbf24', price: 500 },
  { id: 'stormEagle',   emoji: '🦅',    name: 'Aigle Tempête',         tag: 'Seigneur des vents',          color: '#67e8f9', price: 500 },
  { id: 'robot',        emoji: '🤖',    name: 'Robot Gardien',         tag: 'Précis et indestructible',    color: '#38bdf8', price: 500 },
  { id: 'bear',         emoji: '🐻',    name: 'Ours Viking',           tag: 'Force et vaillance',          color: '#d4a020', price: 500 },
  { id: 'sharkNinja',   emoji: '🦈',    name: 'Requin Ninja',          tag: 'Maître des profondeurs',      color: '#00BFFF', price: 500 },
  { id: 'owlWitch',     emoji: '🦉',    name: 'Chouette Magicienne',   tag: 'Gardienne des sorts anciens', color: '#a78bfa', price: 500 },
  { id: 'catDetective',  emoji: '🐱',    name: 'Chat Détective',        tag: 'Rien ne lui échappe',          color: '#4ade80', price: 500 },
  { id: 'turtleNomad',  emoji: '🐢',    name: 'Tortue Nomade',         tag: 'Gardien des horizons lointains', color: '#65a30d', price: 500 },
  { id: 'raccoonHacker',emoji: '🦝',    name: 'Raton Hackeur',         tag: 'Maître du code et des ombres', color: '#22d3ee', price: 500 },
  { id: 'spyPenguin',   emoji: '🐧',    name: 'Pingouin Espion',       tag: 'Agent secret des glaces',      color: '#dc2626', price: 500 },
  { id: 'dragon',       emoji: '🐉',    name: 'Dragon de Feu',         tag: 'Souffle incandescent',         color: '#ef4444', price: 500 },
  { id: 'mushroom',     emoji: '🍄',    name: 'Esprit Champignon',     tag: 'Gardien de la forêt',         color: '#e63946', price: 500 },
  { id: 'cosmo',        emoji: '🧑‍🚀', name: 'Cosmonaute Intrépide',  tag: "Explorateur de l'infini",    color: '#38bdf8', price: 500 },
];

// 3 émotions de base — offertes avec chaque perso acheté
export const BASE_EMOTION_IDS = ['walk', 'sleep', 'sit'];
export const BASE_EMOTIONS = [
  { id: 'walk',  symbol: '🚶', name: 'Marche', desc: 'Animation par défaut entre les quiz' },
  { id: 'sleep', symbol: '💤', name: 'Dodo',   desc: 'Apparaît au démarrage tant que moins de 3 quiz réussis' },
  { id: 'sit',   symbol: '🧘', name: 'Assis',  desc: 'Position de repos sur les nœuds de progression' },
];

// 7 émotions spéciales — à débloquer à l'unité
export const SHOP_EMOTIONS = [
  { id: 'wave',    symbol: '👋', name: 'Salut',      price: 130, desc: 'Ton perso te salue avant ta première question !' },
  { id: 'kiss',    symbol: '💋', name: 'Bisou',      price: 130, desc: 'Ton perso t\'envoie un bisou avant ta première question !' },
  { id: 'clap',    symbol: '👏', name: 'Bravo',      price: 130, desc: 'Ton perso t\'applaudit à chaque bonne réponse !' },
  { id: 'victory', symbol: '🏆', name: 'Victoire',   price: 130, desc: 'Ton perso exulte quand tu termines le quiz avec un super score !' },
  { id: 'dance',   symbol: '💃', name: 'Danse',      price: 130, desc: 'Ton perso danse quand tu termines le quiz avec un super score !' },
  { id: 'surprise',symbol: '😲', name: 'Surprise',   price: 130, desc: 'Ton perso est choqué quand tu fais une erreur dans le quiz.' },
  { id: 'think',   symbol: '🤔', name: 'Hésitation', price: 130, desc: 'Ton perso prend un air pensif quand tu fais une erreur dans le quiz.' },
];

export const PURCHASABLE_CHARS = SHOP_CHARACTERS.map((char) => char.id);

export function getOwnedChars(shopOwned = []) {
  return PURCHASABLE_CHARS.filter((id) => shopOwned.includes(`char-${id}`));
}

export function getOwnedEmotions(shopOwned = [], charId) {
  const isCharOwned = shopOwned.includes(`char-${charId}`);
  const explicit = shopOwned
    .filter((id) => id.startsWith(`char-${charId}-`))
    .map((id) => id.replace(`char-${charId}-`, ''));
  // Base emotions are always included when the character is owned
  return isCharOwned ? [...BASE_EMOTION_IDS, ...explicit] : explicit;
}

export function resolveShopCharacter(shopOwned = []) {
  return getOwnedChars(shopOwned)[0] || null;
}

/**
 * Get the character assigned to a rule for today.
 * Assignment is random but stable for the day. Characters are dealt round-robin
 * without replacement: each owned char is used once before any repeats.
 */
export function getCharacterForRule(ruleId, allRuleIds, shopOwned = []) {
  const owned = getOwnedChars(shopOwned);
  if (owned.length === 0) return null;
  if (owned.length === 1) return owned[0];

  const today = getToday();
  const cacheKey = `char_assign:${today}`;

  try {
    const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
    if (cached && typeof cached === 'object' && cached[ruleId]) {
      // Verify the assigned char is still owned
      if (owned.includes(cached[ruleId])) return cached[ruleId];
    }

    // Build assignment for all rules
    const assignment = {};
    const pool = [];
    for (const id of allRuleIds) {
      if (pool.length === 0) {
        // Refill and shuffle
        pool.push(...owned);
        // Seeded shuffle using today's date for stability
        for (let i = pool.length - 1; i > 0; i--) {
          const seed = hashCode(`${today}:${id}:${i}`);
          const j = ((seed % (i + 1)) + (i + 1)) % (i + 1);
          [pool[i], pool[j]] = [pool[j], pool[i]];
        }
      }
      assignment[id] = pool.pop();
    }

    localStorage.setItem(cacheKey, JSON.stringify(assignment));
    return assignment[ruleId] || owned[0];
  } catch {
    return owned[0];
  }
}

function hashCode(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function resolveCharacterMood(rawMood, charId, shopOwned = [], fallbackMood = 'walk') {
  if (!rawMood || rawMood === fallbackMood) return fallbackMood;
  const owned = new Set(getOwnedEmotions(shopOwned, charId));
  return owned.has(rawMood) ? rawMood : fallbackMood;
}

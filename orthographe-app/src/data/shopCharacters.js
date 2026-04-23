export const SHOP_CHARACTERS = [
  { id: 'panda', emoji: '🐼', name: 'Panda Samouraï', tag: "Guerrier de l'ombre", color: '#67e8f9' },
  { id: 'fox', emoji: '🦊', name: 'Renard Espion', tag: 'Rusé comme le vent', color: '#fb923c' },
  { id: 'wolf', emoji: '🐺', name: 'Loup Fantôme', tag: 'Chasseur de la pleine lune', color: '#818cf8' },
  { id: 'tiger', emoji: '🐯', name: "Tigre de l'Éclair", tag: 'Vitesse absolue', color: '#fde047' },
  { id: 'lion', emoji: '🦁', name: 'Lion Solaire', tag: 'Roi de la savane', color: '#fbbf24' },
  { id: 'stormEagle', emoji: '🦅', name: 'Aigle Tempête', tag: 'Seigneur des vents', color: '#67e8f9' },
  { id: 'ice', emoji: '🧊', name: 'Reine des Glaces', tag: 'Froid et beauté', color: '#bae6fd' },
  { id: 'robot', emoji: '🤖', name: 'Robot Gardien', tag: 'Précis et indestructible', color: '#38bdf8' },
  { id: 'sharkNinja', emoji: '🦈', name: 'Requin Ninja', tag: 'Maître des profondeurs', color: '#00BFFF' },
];

export const SHOP_EMOTIONS = [
  { id: 'sleep', symbol: '💤', name: 'Dodo', price: 150, desc: 'Apparaît au démarrage tant que moins de 3 quiz réussis' },
  { id: 'wave', symbol: '👋', name: 'Salut', price: 200, desc: 'Première session · Niveau Bronze atteint' },
  { id: 'victory', symbol: '🏆', name: 'Victoire', price: 200, desc: 'Niveau Argent / Diamant · Couronne · Mode direct / sniper · Révision réussie · Bonne réponse' },
  { id: 'clap', symbol: '👏', name: 'Bravo', price: 200, desc: 'Session parfaite 20/20' },
  { id: 'dance', symbol: '💃', name: 'Danse', price: 200, desc: 'Palier de flamme atteint' },
  { id: 'surprise', symbol: '😲', name: 'Surprise', price: 200, desc: 'Flamme perdue · Révision échouée · Diamant brisé' },
  { id: 'kiss', symbol: '💋', name: 'Bisou', price: 200, desc: 'Bouclier activé' },
  { id: 'think', symbol: '🤔', name: 'Hésitation', price: 200, desc: 'Révision limite' },
];

export const PURCHASABLE_CHARS = SHOP_CHARACTERS.map((char) => char.id);

export function getOwnedChars(shopOwned = []) {
  return PURCHASABLE_CHARS.filter((id) => shopOwned.includes(`char-${id}`));
}

export function getOwnedEmotions(shopOwned = [], charId) {
  return shopOwned
    .filter((id) => id.startsWith(`char-${charId}-`))
    .map((id) => id.replace(`char-${charId}-`, ''));
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

  const today = new Date().toISOString().slice(0, 10);
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

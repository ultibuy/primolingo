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
  { id: 'sleep', symbol: '💤', name: 'Dodo', price: 150, desc: 'Apparaît au démarrage (0–5 min)' },
  { id: 'wave', symbol: '👋', name: 'Salut', price: 200, desc: 'Première session · Niveau Bronze atteint' },
  { id: 'victory', symbol: '🏆', name: 'Victoire', price: 200, desc: 'Niveau Argent / Diamant · Couronne · Mode direct / sniper · Révision SM2 réussie · Bonne réponse' },
  { id: 'clap', symbol: '👏', name: 'Bravo', price: 200, desc: 'Session parfaite 20/20' },
  { id: 'dance', symbol: '💃', name: 'Danse', price: 200, desc: 'Palier de streak atteint' },
  { id: 'surprise', symbol: '😲', name: 'Surprise', price: 200, desc: 'Streak perdu · Révision SM2 échouée · Diamant brisé' },
  { id: 'kiss', symbol: '💋', name: 'Bisou', price: 200, desc: 'Bouclier activé' },
  { id: 'think', symbol: '🤔', name: 'Hésitation', price: 200, desc: 'Révision SM2 limite' },
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

export function resolveCharacterMood(rawMood, charId, shopOwned = [], fallbackMood = 'walk') {
  if (!rawMood || rawMood === fallbackMood) return fallbackMood;
  const owned = new Set(getOwnedEmotions(shopOwned, charId));
  return owned.has(rawMood) ? rawMood : fallbackMood;
}

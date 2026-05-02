// Ménagerie de 50 personnages — PrimoLingo
// Chaque personnage est prévu pour des enfants de 10-12 ans, filles et garçons

export const CHARACTERS = [
  // ── Animaux guerriers ──────────────────────────────────────────
  { id: 'panda',       emoji: '🐼', name: 'Panda Samouraï',      tag: 'Guerrier de l\'ombre',      color: '#67e8f9', cat: 'animaux' },
  { id: 'fox',         emoji: '🦊', name: 'Renard Espion',        tag: 'Rusé comme le vent',         color: '#fb923c', cat: 'animaux' },
  { id: 'wolf',        emoji: '🐺', name: 'Loup Fantôme',         tag: 'Chasseur de la pleine lune', color: '#818cf8', cat: 'animaux' },
  { id: 'tiger',       emoji: '🐯', name: 'Tigre de l\'Éclair',   tag: 'Vitesse absolue',            color: '#fde047', cat: 'animaux' },
  { id: 'lion',        emoji: '🦁', name: 'Lion Solaire',         tag: 'Roi de la savane',           color: '#fbbf24', cat: 'animaux' },
  { id: 'stormEagle',  emoji: '🦅', name: 'Aigle Tempête',        tag: 'Seigneur des vents',         color: '#67e8f9', cat: 'animaux' },
  { id: 'bear',        emoji: '🐻', name: 'Ours Viking',          tag: 'Force et vaillance',         color: '#a78bfa', cat: 'animaux' },
  { id: 'shark',       emoji: '🦈', name: 'Requin Ninja',         tag: 'Prédateur des abysses',      color: '#94a3b8', cat: 'animaux' },
  { id: 'owl',         emoji: '🦉', name: 'Chouette Sage',        tag: 'Gardienne des secrets',      color: '#c4b5fd', cat: 'animaux' },
  { id: 'frog',        emoji: '🐸', name: 'Grenouille Ninja',     tag: 'Maître des arts martiaux',   color: '#4ade80', cat: 'animaux' },
  { id: 'octopus',     emoji: '🐙', name: 'Pieuvre Génie',        tag: 'Huit bras, mille idées',     color: '#e879f9', cat: 'animaux' },
  { id: 'cat',         emoji: '🐱', name: 'Chat Détective',       tag: 'Rien ne lui échappe',        color: '#f9a8d4', cat: 'animaux' },

  // ── Créatures fantastiques ─────────────────────────────────────
  { id: 'dragon',      emoji: '🐉', name: 'Dragon de Feu',        tag: 'Flamme immortelle',          color: '#f87171', cat: 'fantastique' },
  { id: 'unicorn',     emoji: '🦄', name: 'Licorne Galactique',   tag: 'Magie des étoiles',          color: '#e879f9', cat: 'fantastique' },
  { id: 'phoenix',     emoji: '🦅', name: 'Phénix Ardent',        tag: 'Toujours plus fort',         color: '#fb923c', cat: 'fantastique' },
  { id: 'kraken',      emoji: '🦑', name: 'Kraken des Profondeurs', tag: 'Terreur des mers',         color: '#1d4ed8', cat: 'fantastique' },
  { id: 'fairy',       emoji: '🧚', name: 'Fée des Lumières',     tag: 'Étincelle magique',          color: '#f472b6', cat: 'fantastique' },
  { id: 'mermaid',     emoji: '🧜', name: 'Sirène des Abysses',   tag: 'Voix des profondeurs',       color: '#2dd4bf', cat: 'fantastique' },
  { id: 'ghost',       emoji: '👻', name: 'Fantôme Espiègle',     tag: 'Bouh ! Haha, c\'est moi.',   color: '#d1fae5', cat: 'fantastique' },
  { id: 'vampire',     emoji: '🧛', name: 'Comte Nocturne',       tag: 'Seigneur des ténèbres',      color: '#9f1239', cat: 'fantastique' },
  { id: 'skeleton',    emoji: '💀', name: 'Pirate Squelette',     tag: 'Capitaine des sept mers',    color: '#fcd34d', cat: 'fantastique' },
  { id: 'witch',       emoji: '🧙', name: 'Sorcière des Runes',   tag: 'Formules enchantées',        color: '#a78bfa', cat: 'fantastique' },

  // ── Héros et combattants ───────────────────────────────────────
  { id: 'knight',      emoji: '⚔️',  name: 'Chevalier de Cristal', tag: 'Défenseur éternel',         color: '#93c5fd', cat: 'heros' },
  { id: 'archer',      emoji: '🏹',  name: 'Archère des Forêts',   tag: 'Précision infaillible',     color: '#86efac', cat: 'heros' },
  { id: 'ninja',       emoji: '🥷',  name: 'Ninja de l\'Ombre',    tag: 'Invisible et rapide',        color: '#475569', cat: 'heros' },
  { id: 'superhero',   emoji: '🦸',  name: 'Super-héros Urbain',   tag: 'Gardien de la ville',        color: '#3b82f6', cat: 'heros' },
  { id: 'viking',      emoji: '🪖',  name: 'Guerrière Viking',     tag: 'Indomptable et fière',       color: '#f59e0b', cat: 'heros' },
  { id: 'pirate',      emoji: '🏴‍☠️', name: 'Pirate des Éclairs',  tag: 'Les mers lui appartiennent', color: '#fb923c', cat: 'heros' },
  { id: 'samurai',     emoji: '🗡️',  name: 'Samouraï de Jade',    tag: 'Honneur et discipline',      color: '#34d399', cat: 'heros' },

  // ── Robots et futur ────────────────────────────────────────────
  { id: 'robot',       emoji: '🤖', name: 'Robot Gardien',         tag: 'Précis et indestructible',   color: '#38bdf8', cat: 'futur' },
  { id: 'alien',       emoji: '👾', name: 'Alien Explorateur',     tag: 'Venu de très loin',          color: '#a3e635', cat: 'futur' },
  { id: 'astronaut',   emoji: '🧑‍🚀', name: 'Cosmonaute Intrépide', tag: 'Explorateur de galaxies',  color: '#93c5fd', cat: 'futur' },
  { id: 'cyborg',      emoji: '🦾', name: 'Cyborg de l\'Éclair',   tag: 'Mi-chair, mi-métal',         color: '#fde047', cat: 'futur' },
  { id: 'android',     emoji: '🤖', name: 'Androïde IA',           tag: 'Intelligence infinie',       color: '#67e8f9', cat: 'futur' },

  // ── Eléments et nature ─────────────────────────────────────────
  { id: 'fire',        emoji: '🔥', name: 'Maître du Feu',         tag: 'Flamme incontrôlable',       color: '#f97316', cat: 'elements' },
  { id: 'water',       emoji: '🌊', name: 'Esprit de l\'Eau',      tag: 'Fluide et puissant',         color: '#0ea5e9', cat: 'elements' },
  { id: 'thunder',     emoji: '⚡', name: 'Seigneur du Tonnerre',  tag: 'Foudre et tempête',          color: '#fbbf24', cat: 'elements' },
  { id: 'ice',         emoji: '🧊', name: 'Reine des Glaces',      tag: 'Froid et beauté',            color: '#bae6fd', cat: 'elements' },
  { id: 'wind',        emoji: '🌪️', name: 'Esprit du Vent',        tag: 'Libre comme l\'air',         color: '#e0f2fe', cat: 'elements' },
  { id: 'earth',       emoji: '🌍', name: 'Gardien de la Terre',   tag: 'Solide comme un roc',        color: '#a16207', cat: 'elements' },

  // ── Personnages rigolos / décalés ──────────────────────────────
  { id: 'gamer',       emoji: '🎮', name: 'Champion Gamer',        tag: 'Niveau MAX en tout',         color: '#c084fc', cat: 'rigolo' },
  { id: 'rockstar',    emoji: '🎸', name: 'Rockstar de Nuit',      tag: 'La musique, ma vie',         color: '#f472b6', cat: 'rigolo' },
  { id: 'surfer',      emoji: '🏄', name: 'Surfeur des Vagues',    tag: 'Rider éternel',              color: '#38bdf8', cat: 'rigolo' },
  { id: 'mushroom',    emoji: '🍄', name: 'Esprit Champignon',     tag: 'Magique et mystérieux',      color: '#fb7185', cat: 'rigolo' },
  { id: 'cactus',      emoji: '🌵', name: 'Cactus Cowboy',         tag: 'Pique, mais protège',        color: '#4ade80', cat: 'rigolo' },
  { id: 'pizza',       emoji: '🍕', name: 'Monstre Pizza',         tag: 'Il mange tout sur son passage', color: '#fb923c', cat: 'rigolo' },
  { id: 'clown',       emoji: '🤡', name: 'Clown Magique',         tag: 'Rires garantis !',           color: '#f472b6', cat: 'rigolo' },

  // ── Mystère et cosmos ──────────────────────────────────────────
  { id: 'star',        emoji: '🌟', name: 'Gardien des Étoiles',   tag: 'Lumière dans les ténèbres',  color: '#fde047', cat: 'cosmos' },
  { id: 'moon',        emoji: '🌙', name: 'Loup de la Lune',       tag: 'Hurleur des nuits',          color: '#c7d2fe', cat: 'cosmos' },
  { id: 'crystal',     emoji: '💎', name: 'Cristal Vivant',        tag: 'Brillant et précieux',       color: '#67e8f9', cat: 'cosmos' },
  { id: 'trophy',      emoji: '🏆', name: 'Gardien du Trophée',    tag: 'La victoire a un gardien',   color: '#fbbf24', cat: 'cosmos' },
];

export const CHARACTER_CATEGORIES = {
  animaux:    { label: 'Animaux guerriers',         color: '#4ade80' },
  fantastique:{ label: 'Créatures fantastiques',    color: '#e879f9' },
  heros:      { label: 'Héros & combattants',       color: '#60a5fa' },
  futur:      { label: 'Robots & futur',            color: '#38bdf8' },
  elements:   { label: 'Éléments naturels',         color: '#fb923c' },
  rigolo:     { label: 'Personnages rigolos',        color: '#f472b6' },
  cosmos:     { label: 'Mystère & cosmos',           color: '#fde047' },
};

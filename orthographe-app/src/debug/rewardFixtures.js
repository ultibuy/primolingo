/**
 * Reward overlay fixtures for debug preview and documentation screenshots.
 * Simulates the pendingEvents overlay from Dashboard.
 */

export const rewardFixtures = {
  'bronze': {
    iconType: 'trophy',
    title: 'Bronze sur a / à / as',
    sub: 'Prochain niveau : Argent. Fais 3 sessions guidées avec 16/20 ou mieux.',
    amount: null,
  },
  'argent': {
    iconType: 'trophy',
    title: 'Argent sur ce / se',
    sub: 'Mode direct débloqué ! Prochain : Couronne. Fais 3 sessions directes avec 16/20 ou mieux.',
    amount: '+30',
  },
  'couronne': {
    iconType: 'crown',
    title: 'Couronne sur son / sont',
    sub: 'Prochain : Diamant. Fais 3 sessions directes consécutives avec 18/20 ou mieux.',
    amount: '+100',
  },
  'diamant': {
    iconType: 'diamond',
    title: 'Diamant sur ou / où',
    sub: 'Le diamant est vivant. Maintiens-le avec des révisions régulières.',
    amount: '+200',
  },
  'streak-7': {
    iconType: 'flame',
    title: 'Une semaine sans faillir.',
    sub: 'Prochain palier : 14 jours → +200 pièces.',
    amount: '+100',
  },
  'streak-30': {
    iconType: 'flame',
    title: 'Un mois. Tu t\'es prouvé quelque chose.',
    sub: 'Prochain palier : 60 jours → +500 pièces.',
    amount: '+350',
  },
  'shield-used': {
    iconType: 'shield',
    title: 'Bouclier consommé, ta flamme tient.',
    sub: 'Ta flamme de 12 jours est protégée. Pense à en racheter un.',
    amount: null,
  },
  'streak-lost': {
    iconType: 'strength',
    title: 'Pas de chance hier — ta flamme est tombée.',
    sub: 'Ça arrive. L\'important c\'est de revenir aujourd\'hui.',
    amount: null,
  },
  'diamond-review': {
    iconType: 'diamond',
    title: 'Révision réussie ! Le diamant brille.',
    sub: null,
    amount: null,
  },
  'diamond-broken': {
    iconType: 'explosion',
    title: 'Le diamant s\'est brisé.',
    sub: 'Tu es redescendu au niveau Couronne.',
    amount: null,
  },
};

export const REWARD_FIXTURE_KEYS = Object.keys(rewardFixtures);

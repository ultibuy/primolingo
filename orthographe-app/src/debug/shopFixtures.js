/**
 * Shop fixtures for debug preview and documentation screenshots.
 */
import { createDefaultProgress } from '../store/persistence.js';

const baseProgress = () => {
  const p = createDefaultProgress();
  p.coins = 800;
  p.shields = 1;
  p.firstQuizDone = true;
  p.shop.owned = ['char-panda', 'char-panda-wave', 'theme-aurora', 'flame-lightning'];
  p.shop.equipped = { theme: 'theme-aurora', flame: 'flame-lightning', title: null, victoryAnimation: null };
  p.rules = {
    'a-a-as': { level: 3 },
    'ce-se': { level: 2 },
    'son-sont': { level: 1 },
  };
  return p;
};

export const shopFixtures = {
  cosmetique: () => ({ progress: baseProgress(), initialTab: 'cosmetique' }),
  boost: () => ({ progress: baseProgress(), initialTab: 'boost' }),
  persos: () => ({ progress: baseProgress(), initialTab: 'persos' }),
  mystere: () => ({ progress: baseProgress(), initialTab: 'mystere' }),
};

export const SHOP_FIXTURE_KEYS = Object.keys(shopFixtures);

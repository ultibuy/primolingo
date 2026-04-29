/**
 * coaching.js — Narrative arcs coaching engine for GramHero.
 *
 * Pure JS module. No React imports. All arc logic lives here.
 */

import { getToday } from './sm2.js';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const SHOP_EMOTION_IDS = ['wave', 'kiss', 'clap', 'victory', 'dance', 'surprise', 'think'];
const BASE_EMOTION_IDS = ['walk', 'sleep', 'sit'];

const CHAR_NAME_MAP = {
  panda:        'Panda Samouraï 🐼',
  fox:          'Renard Espion 🦊',
  wolf:         'Loup Fantôme 🐺',
  tiger:        'Tigre de l\'Éclair 🐯',
  lion:         'Lion Solaire 🦁',
  stormEagle:   'Aigle Tempête 🦅',
  ice:          'Reine des Glaces 🧊',
  robot:        'Robot Gardien 🤖',
  bear:         'Ours Viking 🐻',
  sharkNinja:   'Requin Ninja 🦈',
  owlWitch:     'Chouette Magicienne 🦉',
  catDetective: 'Chat Détective 🐱',
  dragon:       'Dragon de Feu 🐉',
  mushroom:     'Esprit Champignon 🍄',
  cosmo:        'Cosmonaute Intrépide 🧑‍🚀',
};

// ---------------------------------------------------------------------------
// Default coaching data model
// ---------------------------------------------------------------------------

export function createDefaultCoaching() {
  return {
    shown: {},             // { 'arc1.1': '2026-04-28', ... }
    lastShownByArc: {},    // { 'arc5.8': '2026-04-27', ... }
    dailyShownCount: { date: null, count: 0 },
    lastBannerArc: null,
  };
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function getTotalSessions(progress) {
  const rulesObj = progress.rules || {};
  return Object.values(rulesObj).reduce(
    (sum, rp) => sum + (rp.guidedSessionsCompleted || 0) + (rp.directSessionsCompleted || 0),
    0
  );
}

export function getOwnedChars(shopOwned) {
  return (shopOwned || []).filter(id => /^char-[^-]+$/.test(id));
}

export function getOwnedShopEmotions(shopOwned, charId) {
  return (shopOwned || []).filter(id => {
    for (const emoId of SHOP_EMOTION_IDS) {
      if (id === `char-${charId}-${emoId}`) return true;
    }
    return false;
  });
}

export function findRule(rules, ruleProgress, predicate) {
  for (const rule of rules) {
    const rp = ruleProgress?.[rule.id];
    if (predicate(rp, rule)) return rule;
  }
  return null;
}

function daysBetween(dateStr1, dateStr2) {
  if (!dateStr1 || !dateStr2) return null;
  const d1 = new Date(dateStr1);
  const d2 = new Date(dateStr2);
  return Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
}

function getCharName(charId) {
  return CHAR_NAME_MAP[charId] || charId;
}

function isAlreadyShown(coaching, arcId) {
  return !!(coaching?.shown?.[arcId]);
}

function wasShownWithin24h(coaching, arcId, todayStr) {
  const lastShown = coaching?.lastShownByArc?.[arcId];
  if (!lastShown) return false;
  const diff = daysBetween(lastShown, todayStr);
  return diff !== null && diff < 1;
}

function isCapReached(coaching, todayStr) {
  const dsc = coaching?.dailyShownCount;
  if (!dsc) return false;
  return dsc.date === todayStr && dsc.count >= 4;
}

// ---------------------------------------------------------------------------
// pickCoachingMessage
// ---------------------------------------------------------------------------

/**
 * @param {object} ctx - CoachingContext
 * @returns {CoachingMessage | null}
 */
export function pickCoachingMessage(ctx) {
  const { trigger, progress, todayStr, hour, rules } = ctx;
  const coaching = progress.coaching || createDefaultCoaching();

  // Cap check
  if (isCapReached(coaching, todayStr)) return null;

  const shown = coaching.shown || {};
  const lastShownByArc = coaching.lastShownByArc || {};

  const streak = progress.streak || {};
  const coins = progress.coins || 0;
  const shields = progress.shields || 0;
  const ruleProgress = progress.rules || {};
  const shopOwned = progress.shop?.owned || [];
  const ownedChars = getOwnedChars(shopOwned);

  const totalSessions = getTotalSessions(progress);
  const firstQuizDone = !!(progress.milestones?.firstSession || progress.firstQuizDone);

  const todayDone = streak.lastActiveDate === todayStr;

  // SM2 reviews due today
  const revisionsDueToday = rules.some(rule => {
    const rp = ruleProgress[rule.id];
    return rp && rp.level >= 4 && rp.sm2 && rp.sm2.nextReviewDate <= todayStr;
  });

  // Helper to build a message
  function msg(arcId, variant, copy, emphasis, emoji, cta, opts = {}) {
    return {
      arcId,
      variant: variant || null,
      copy,
      emphasis: emphasis || '',
      emoji: emoji || null,
      cta: cta || null,
      oneShot: opts.oneShot !== false,
      recurring: opts.recurring === true,
    };
  }

  // Allowed arcs for endScreen trigger
  const endScreenArcs = new Set([
    'arc2.1', 'arc2.2', 'arc3.1', 'arc3.2',
    'arc4.1', 'arc4.2', 'arc4.8',
    'arc5.8', 'arc5.9', 'arc9.5',
  ]);

  function allowed(arcId) {
    if (trigger === 'endScreen') return endScreenArcs.has(arcId);
    return true; // dashboard: all arcs allowed
  }

  // --- arc1.1: no sessions yet ---
  if (allowed('arc1.1') && !isAlreadyShown(coaching, 'arc1.1')) {
    if (!firstQuizDone && totalSessions === 0) {
      return msg('arc1.1', 'pieces',
        'Fais ton premier quiz pour remporter 200 pièces de bienvenue 🎁.',
        '200 pièces de bienvenue',
        '🎁',
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc1.3: failed first session (< 60%) ---
  if (allowed('arc1.3') && !isAlreadyShown(coaching, 'arc1.3')) {
    // Detect: first session ever done, but firstSession milestone not set (means score < 60%)
    if (totalSessions === 1 && !firstQuizDone) {
      return msg('arc1.3', 'plain',
        'Pas grave, le bonus de 200 pièces 🎁 t\'attend dès que tu finis une session avec au moins 12/20.',
        '12/20',
        null,
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc5.8: flame at risk (16h+, streak active, not played today) ---
  if (allowed('arc5.8')) {
    const recurringOk = !wasShownWithin24h(coaching, 'arc5.8', todayStr);
    if (recurringOk && streak.current > 0 && streak.lastActiveDate !== todayStr && hour >= 16) {
      const hoursLeft = 23 - hour;
      return msg('arc5.8', 'flamme',
        `Plus que ${hoursLeft} h pour sauver ta flamme de ${streak.current} jours 🔥. Une session de 5 minutes suffit.`,
        `flamme de ${streak.current} jours`,
        '🔥',
        null,
        { oneShot: false, recurring: true }
      );
    }
  }

  // --- arc4.8: diamond degrading (diamond health < 1.0 but > 0) ---
  if (allowed('arc4.8') && !isAlreadyShown(coaching, 'arc4.8')) {
    const degradingRule = findRule(rules, ruleProgress, (rp) => {
      if (!rp || rp.level < 4 || !rp.sm2) return false;
      const overdue = rp.sm2.nextReviewDate < todayStr;
      return overdue;
    });
    if (degradingRule) {
      return msg('arc4.8', 'diamant',
        `Ton diamant sur "${degradingRule.shortTitle || degradingRule.title}" se ternit — fais sa révision avant qu'il ne se brise 💎.`,
        'se ternit',
        '💎',
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc4.5: review due today ---
  if (allowed('arc4.5') && !isAlreadyShown(coaching, 'arc4.5')) {
    if (revisionsDueToday) {
      return msg('arc4.5', 'diamant',
        'Ta première révision diamant est prévue aujourd\'hui — fais-la pour que le diamant brille.',
        'révision diamant',
        '💎',
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc4.1: diamond 1/3 (consecutive ≥90%) ---
  if (allowed('arc4.1') && !isAlreadyShown(coaching, 'arc4.1')) {
    const rule41 = findRule(rules, ruleProgress, (rp) => {
      return rp && rp.level === 3 && (rp.directConsecutiveAbove90 || 0) === 1;
    });
    if (rule41) {
      return msg('arc4.1', 'diamant',
        `18/20 en direct sur "${rule41.shortTitle || rule41.title}". 2 sessions consécutives encore à 18/20 minimum et c'est le diamant 💎.`,
        '2 sessions consécutives',
        '💎',
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc4.2: diamond 2/3 ---
  if (allowed('arc4.2') && !isAlreadyShown(coaching, 'arc4.2')) {
    const rule42 = findRule(rules, ruleProgress, (rp) => {
      return rp && rp.level === 3 && (rp.directConsecutiveAbove90 || 0) === 2;
    });
    if (rule42) {
      return msg('arc4.2', 'diamant',
        `Plus qu'une session à 18/20 sur "${rule42.shortTitle || rule42.title}" et le diamant est à toi. Concentration.`,
        'une session à 18/20',
        '💎',
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc3.1: crown 1/3 ---
  if (allowed('arc3.1') && !isAlreadyShown(coaching, 'arc3.1')) {
    const rule31 = findRule(rules, ruleProgress, (rp) => {
      return rp && rp.level === 2 && (rp.directSessionsAbove80 || 0) === 1;
    });
    if (rule31) {
      return msg('arc3.1', 'couronnes',
        `1 session directe validée sur "${rule31.shortTitle || rule31.title}". Plus que 2 pour décrocher ta couronne 👑 + 100 pièces.`,
        '2 pour décrocher ta couronne',
        '👑',
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc3.2: crown 2/3 ---
  if (allowed('arc3.2') && !isAlreadyShown(coaching, 'arc3.2')) {
    const rule32 = findRule(rules, ruleProgress, (rp) => {
      return rp && rp.level === 2 && (rp.directSessionsAbove80 || 0) === 2;
    });
    if (rule32) {
      return msg('arc3.2', 'couronnes',
        `Plus qu'une session directe à 16/20 sur "${rule32.shortTitle || rule32.title}" et la couronne tombe.`,
        'une session directe à 16/20',
        '👑',
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc2.1: silver 1/3 ---
  if (allowed('arc2.1') && !isAlreadyShown(coaching, 'arc2.1')) {
    const rule21 = findRule(rules, ruleProgress, (rp) => {
      return rp && rp.level === 1 && (rp.guidedSessionsAbove80 || 0) === 1;
    });
    if (rule21) {
      return msg('arc2.1', 'plain',
        `Belle session sur "${rule21.shortTitle || rule21.title}". Plus que 2 sessions à 16/20 pour passer Argent.`,
        '2 sessions à 16/20',
        null,
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc2.2: silver 2/3 ---
  if (allowed('arc2.2') && !isAlreadyShown(coaching, 'arc2.2')) {
    const rule22 = findRule(rules, ruleProgress, (rp) => {
      return rp && rp.level === 1 && (rp.guidedSessionsAbove80 || 0) === 2;
    });
    if (rule22) {
      return msg('arc2.2', 'plain',
        `Plus qu'une session à 16/20 et le mode direct est à toi sur "${rule22.shortTitle || rule22.title}".`,
        'une session à 16/20',
        null,
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc12.2: first emotion unlocked ---
  if (allowed('arc12.2') && !isAlreadyShown(coaching, 'arc12.2')) {
    const firstEmoItem = shopOwned.find(id => {
      const parts = id.split('-');
      return parts.length === 3 && parts[0] === 'char' && SHOP_EMOTION_IDS.includes(parts[2]);
    });
    if (firstEmoItem) {
      const parts = firstEmoItem.split('-');
      const charId = parts[1];
      const emoId = parts[2];
      const emoLabels = { wave: 'salut', kiss: 'bisou', clap: 'bravo', victory: 'victoire', dance: 'danse', surprise: 'zut', think: 'réflexion' };
      const emoLabel = emoLabels[emoId] || emoId;
      return msg('arc12.2', 'panda',
        `Émotion "${emoLabel}" débloquée pour ton ${getCharName(charId)}. Maintenant il t'applaudit à chaque bonne réponse.`,
        `"${emoLabel}"`,
        '👏',
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc12.3: 1-2 emotions ---
  if (allowed('arc12.3') && !isAlreadyShown(coaching, 'arc12.3')) {
    for (const charItemId of ownedChars) {
      const charId = charItemId.slice(5);
      const ownedEmos = getOwnedShopEmotions(shopOwned, charId);
      if (ownedEmos.length >= 1 && ownedEmos.length <= 2) {
        return msg('arc12.3', 'panda',
          `Ton ${getCharName(charId)} a ${ownedEmos.length} émotion${ownedEmos.length > 1 ? 's' : ''} sur 7. Vise "victoire" 🏆 — il s'active sur tes scores ≥ 18/20.`,
          '"victoire"',
          '🏆',
          null,
          { oneShot: true }
        );
      }
    }
  }

  // --- arc12.4: 4/7 emotions ---
  if (allowed('arc12.4') && !isAlreadyShown(coaching, 'arc12.4')) {
    for (const charItemId of ownedChars) {
      const charId = charItemId.slice(5);
      const ownedEmos = getOwnedShopEmotions(shopOwned, charId);
      if (ownedEmos.length === 4) {
        return msg('arc12.4', 'panda',
          `Ton ${getCharName(charId)} a 4 émotions sur 7. Plus que 3 pour le compléter.`,
          '4 émotions sur 7',
          null,
          null,
          { oneShot: true }
        );
      }
    }
  }

  // --- arc12.5: char complete ---
  if (allowed('arc12.5') && !isAlreadyShown(coaching, 'arc12.5')) {
    for (const charItemId of ownedChars) {
      const charId = charItemId.slice(5);
      const ownedEmos = getOwnedShopEmotions(shopOwned, charId);
      if (ownedEmos.length === 7) {
        const remaining = ownedChars.length > 1 ? 15 - ownedChars.length : 14;
        return msg('arc12.5', 'panda',
          `${getCharName(charId)} complet — toutes ses émotions sont à toi. ${remaining} perso${remaining > 1 ? 's' : ''} restant${remaining > 1 ? 's' : ''} à collectionner.`,
          'toutes ses émotions',
          null,
          null,
          { oneShot: true }
        );
      }
    }
  }

  // --- arc13.3: long flame, no shield (≥7 days) ---
  if (allowed('arc13.3') && !isAlreadyShown(coaching, 'arc13.3')) {
    if (coins >= 160 && shields === 0 && streak.current >= 7) {
      return msg('arc13.3', 'flamme',
        `${streak.current} jours sans bouclier 🛡️, c'est jouer avec le feu 🔥. 160 pièces et tu dors tranquille.`,
        '160 pièces',
        '🛡️',
        { label: 'Acheter', action: 'openShop' },
        { oneShot: true }
      );
    }
  }

  // --- arc13.2: medium flame, no shield (≥3 days) ---
  if (allowed('arc13.2') && !isAlreadyShown(coaching, 'arc13.2')) {
    if (coins >= 160 && shields === 0 && streak.current >= 3 && streak.current < 7) {
      return msg('arc13.2', 'flamme',
        `Ta flamme de ${streak.current} jours 🔥 vaut le coup d'être protégée — un bouclier 🛡️ pour 160 pièces.`,
        `flamme de ${streak.current} jours`,
        '🔥',
        { label: 'Acheter', action: 'openShop' },
        { oneShot: true }
      );
    }
  }

  // --- arc13.4: second shield (≥14 days, 1 shield) ---
  if (allowed('arc13.4') && !isAlreadyShown(coaching, 'arc13.4')) {
    if (coins >= 160 && shields === 1 && streak.current >= 14) {
      return msg('arc13.4', 'flamme',
        `Tu as 1 bouclier 🛡️. À ta flamme de ${streak.current} jours, le second pour 160 pièces fait du bien.`,
        '160 pièces',
        '🛡️',
        { label: 'Acheter', action: 'openShop' },
        { oneShot: true }
      );
    }
  }

  // --- arc13.1: first shield nudge (< 3 days) ---
  if (allowed('arc13.1') && !isAlreadyShown(coaching, 'arc13.1')) {
    if (coins >= 160 && shields === 0 && streak.current < 3) {
      return msg('arc13.1', 'flamme',
        '160 pièces 🪙 = 1 bouclier 🛡️. Si tu rates un jour, ta flamme est sauvée.',
        '1 bouclier',
        '🛡️',
        { label: 'Acheter', action: 'openShop' },
        { oneShot: true }
      );
    }
  }

  // --- arc1.5: panda accessible (≥250 coins, no chars) ---
  if (allowed('arc1.5') && !isAlreadyShown(coaching, 'arc1.5')) {
    if (coins >= 250 && ownedChars.length === 0) {
      return msg('arc1.5', 'panda',
        'C\'est bon, tu peux débloquer le Panda 🐼 — va faire un tour dans la boutique.',
        'débloquer le Panda',
        '🐼',
        { label: 'Boutique', action: 'openShopChars' },
        { oneShot: true }
      );
    }
  }

  // --- arc1.4: approaching panda (200-249 coins, no chars) ---
  if (allowed('arc1.4') && !isAlreadyShown(coaching, 'arc1.4')) {
    if (coins >= 200 && coins < 250 && ownedChars.length === 0) {
      const needed = 250 - coins;
      return msg('arc1.4', 'panda',
        `Plus que ${needed} pièces 🪙 pour débloquer le Panda Samouraï 🐼.`,
        `${needed} pièces`,
        '🐼',
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc6.3: 250 coins, panda accessible ---
  if (allowed('arc6.3') && !isAlreadyShown(coaching, 'arc6.3')) {
    if (coins >= 250 && ownedChars.length === 0) {
      return msg('arc6.3', 'panda',
        '250 pièces 🪙 — adopte le Panda Samouraï 🐼 dans la boutique, il vient avec ses 3 émotions de base.',
        'Panda Samouraï',
        '🐼',
        { label: 'Boutique', action: 'openShopChars' },
        { oneShot: true }
      );
    }
  }

  // --- arc6.4: 450-499 coins, 1+ char ---
  if (allowed('arc6.4') && !isAlreadyShown(coaching, 'arc6.4')) {
    if (coins >= 450 && coins < 500 && ownedChars.length >= 1) {
      const needed = 500 - coins;
      return msg('arc6.4', 'pieces',
        `Plus que ${needed} pièces 🪙 pour adopter un 2e perso.`,
        `${needed} pièces`,
        '🪙',
        { label: 'Boutique', action: 'openShopChars' },
        { oneShot: true }
      );
    }
  }

  // --- arc6.5: 500 coins, exactly 1 char ---
  if (allowed('arc6.5') && !isAlreadyShown(coaching, 'arc6.5')) {
    if (coins >= 500 && ownedChars.length === 1) {
      return msg('arc6.5', 'pieces',
        '500 pièces 🪙 — choisis ton 2e perso parmi 14 (Dragon 🐉, Lion 🦁, Loup 🐺, Cosmonaute 🧑‍🚀…).',
        '2e perso',
        '🪙',
        { label: 'Boutique', action: 'openShopChars' },
        { oneShot: true }
      );
    }
  }

  // --- arc6.7: 200 coins, has char, no shop emotions for most recent char ---
  if (allowed('arc6.7') && !isAlreadyShown(coaching, 'arc6.7')) {
    if (coins >= 200 && ownedChars.length > 0) {
      // Find most recently purchased char (last char-X item in owned)
      const lastCharItem = [...shopOwned].reverse().find(id => /^char-[^-]+$/.test(id));
      if (lastCharItem) {
        const charId = lastCharItem.slice(5);
        const ownedEmos = getOwnedShopEmotions(shopOwned, charId);
        if (ownedEmos.length === 0) {
          return msg('arc6.7', 'panda',
            `200 pièces 🪙 = 1 nouvelle émotion pour ton ${getCharName(charId)}. Va dans la boutique → Persos.`,
            `1 nouvelle émotion`,
            '🪙',
            { label: 'Boutique', action: 'openShop' },
            { oneShot: true }
          );
        }
      }
    }
  }

  // --- arc6.6: 500+ coins, 2+ chars ---
  if (allowed('arc6.6') && !isAlreadyShown(coaching, 'arc6.6')) {
    if (coins >= 500 && ownedChars.length >= 2) {
      return msg('arc6.6', 'pieces',
        '500 pièces 🪙 — un nouveau perso à ajouter à ta collection.',
        'un nouveau perso',
        '🪙',
        { label: 'Boutique', action: 'openShopChars' },
        { oneShot: true }
      );
    }
  }

  // --- arc6.13: nearly broke ---
  if (allowed('arc6.13') && !isAlreadyShown(coaching, 'arc6.13')) {
    if (coins < 30 && streak.current > 0) {
      return msg('arc6.13', 'pieces',
        `Plus que ${coins} pièces 🪙. Une session à 16/20 = +20 pièces, vite !`,
        '+20 pièces',
        '🪙',
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc6.1: 80 coins, nothing bought (no themes) ---
  if (allowed('arc6.1') && !isAlreadyShown(coaching, 'arc6.1')) {
    const hasTheme = shopOwned.some(id => id.startsWith('theme-'));
    if (coins >= 80 && !hasTheme) {
      return msg('arc6.1', 'pieces',
        '80 pièces 🪙 — tu peux changer le thème de ton dashboard dans la boutique.',
        'changer le thème',
        '🪙',
        { label: 'Boutique', action: 'openShop' },
        { oneShot: true }
      );
    }
  }

  // --- arc1.7: streak at 5 or 6 ---
  if (allowed('arc1.7.streak5') && !isAlreadyShown(coaching, 'arc1.7.streak5')) {
    if (streak.current === 5) {
      return msg('arc1.7.streak5', 'flamme',
        'Plus que 2 jours pour atteindre 7 jours et empocher 100 pièces 🪙.',
        '100 pièces',
        '🔥',
        null,
        { oneShot: true }
      );
    }
  }

  if (allowed('arc1.7.streak6') && !isAlreadyShown(coaching, 'arc1.7.streak6')) {
    if (streak.current === 6) {
      return msg('arc1.7.streak6', 'flamme',
        'Demain ta flamme passe à 7 jours — 100 pièces 🪙 à la clé.',
        '100 pièces',
        '🔥',
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc5.3: J6 with no play today ---
  if (allowed('arc5.3') && !isAlreadyShown(coaching, 'arc5.3')) {
    if (streak.current === 6 && !todayDone) {
      return msg('arc5.3', 'flamme',
        'Demain ta flamme passe à 7 jours — 100 pièces 🪙.',
        '100 pièces',
        '🔥',
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc5.1: streak 1 ---
  if (allowed('arc5.1') && !isAlreadyShown(coaching, 'arc5.1')) {
    if (streak.current === 1) {
      return msg('arc5.1', 'flamme',
        'Ta flamme est lancée 🔥. Reviens demain, c\'est tout.',
        'Reviens demain',
        '🔥',
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc5.2: streak 2 ---
  if (allowed('arc5.2') && !isAlreadyShown(coaching, 'arc5.2')) {
    if (streak.current === 2) {
      return msg('arc5.2', 'flamme',
        'Deux jours d\'affilée. Demain, palier "Sur la lancée" 🔥🔥.',
        'palier "Sur la lancée"',
        '🔥',
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc5.9: after streak reset ---
  if (allowed('arc5.9') && !isAlreadyShown(coaching, 'arc5.9')) {
    if (streak.current === 0 || (streak.current === 1 && (streak.longest || 0) > 1)) {
      return msg('arc5.9', 'flamme',
        'Flamme à 0. On redémarre aujourd\'hui — un quiz, et c\'est reparti 🔥.',
        'On redémarre aujourd\'hui',
        '🔥',
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc3.4: 2 crowns, spread rules ---
  if (allowed('arc3.4') && !isAlreadyShown(coaching, 'arc3.4')) {
    const crownCount = Object.values(ruleProgress).filter(rp => (rp?.level || 0) >= 3).length;
    const totalRules = rules.length;
    const bronzeCount = Object.values(ruleProgress).filter(rp => (rp?.level || 0) >= 1).length;
    if (crownCount >= 2 && bronzeCount < Math.ceil(totalRules * 0.5)) {
      const remaining = totalRules - bronzeCount;
      return msg('arc3.4', 'couronnes',
        `Tu as ${crownCount} couronnes 👑. Et si tu attaquais une nouvelle règle ? Il en reste ${remaining} à découvrir.`,
        'une nouvelle règle',
        '👑',
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc2.4: failed first direct ---
  if (allowed('arc2.4') && !isAlreadyShown(coaching, 'arc2.4')) {
    const failedDirect = findRule(rules, ruleProgress, (rp) => {
      return rp && rp.level === 2 && rp.directSessionsCompleted >= 1 &&
        (rp.directBestScore || 0) < 0.6 * 20; // rough proxy
    });
    // Simpler: any rule at level 2 with a direct session but directSessionsAbove80 = 0
    const failedDirect2 = findRule(rules, ruleProgress, (rp) => {
      return rp && rp.level === 2 && (rp.directSessionsCompleted || 0) >= 1 &&
        (rp.directSessionsAbove80 || 0) === 0;
    });
    if (failedDirect || failedDirect2) {
      return msg('arc2.4', 'plain',
        'Le mode direct, c\'est exigeant. Refais un guidé pour te remettre dedans, le mode direct t\'attendra.',
        'Refais un guidé',
        null,
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc6.8: mystery image nudge ---
  if (allowed('arc6.8') && !isAlreadyShown(coaching, 'arc6.8')) {
    const mysteryImages = progress.shop?.mysteryImages;
    const hasAnyRevealed = mysteryImages?.collections
      ? Object.values(mysteryImages.collections).some(c => (c?.revealedCount || 0) > 0)
      : false;
    if (!hasAnyRevealed && coins >= 60) {
      return msg('arc6.8', 'pieces',
        '60 pièces 🪙 = 1 morceau d\'image mystère. Découvre ton image cachée morceau par morceau.',
        '1 morceau d\'image mystère',
        '🎁',
        { label: 'Boutique', action: 'openShop' },
        { oneShot: true }
      );
    }
  }

  // --- arc6.10: victory animation ---
  if (allowed('arc6.10') && !isAlreadyShown(coaching, 'arc6.10')) {
    const hasVictoryAnim = shopOwned.some(id => id.startsWith('victory-'));
    if (!hasVictoryAnim && coins >= 190) {
      return msg('arc6.10', 'pieces',
        '190 pièces 🪙 — tu peux acheter une animation qui se déclenche à chaque bonne réponse.',
        'animation',
        '🪙',
        { label: 'Boutique', action: 'openShop' },
        { oneShot: true }
      );
    }
  }

  // --- arc6.11: entrance animation ---
  if (allowed('arc6.11') && !isAlreadyShown(coaching, 'arc6.11')) {
    const hasEntranceAnim = shopOwned.some(id => id.startsWith('entrance-'));
    if (!hasEntranceAnim && coins >= 300) {
      return msg('arc6.11', 'pieces',
        '300 pièces 🪙 — débloque un effet plein écran 💥 pour tes prochains paliers.',
        'effet plein écran',
        '💥',
        { label: 'Boutique', action: 'openShop' },
        { oneShot: true }
      );
    }
  }

  // --- arc6.12: premium theme ---
  if (allowed('arc6.12') && !isAlreadyShown(coaching, 'arc6.12')) {
    const hasPremiumTheme = shopOwned.some(id => id.startsWith('theme-aurora') || id.startsWith('theme-midnight'));
    if (!hasPremiumTheme && coins >= 320) {
      return msg('arc6.12', 'pieces',
        '320 pièces 🪙 — un thème premium est à ta portée (Aurora, Midnight Purple).',
        'thème premium',
        '🪙',
        { label: 'Boutique', action: 'openShop' },
        { oneShot: true }
      );
    }
  }

  // --- arc7.1: double coins available (Monday, ≥100 coins) ---
  if (allowed('arc7.1') && !isAlreadyShown(coaching, 'arc7.1')) {
    const dayOfWeek = new Date(todayStr).getDay(); // 0=Sun, 1=Mon
    const activeBoosts = progress.shop?.activeBoosts || {};
    const hasActiveDoubleCoins = activeBoosts.doubleCoins && (activeBoosts.doubleCoinsRemainingSessions || 0) > 0;
    if (dayOfWeek === 1 && coins >= 100 && !hasActiveDoubleCoins) {
      return msg('arc7.1', 'pieces',
        'Lundi : tu peux relancer le boost Double coins 🪙×2 pour 5 sessions.',
        'Double coins',
        '🪙',
        { label: 'Boutique', action: 'openShop' },
        { oneShot: true }
      );
    }
  }

  // --- arc7.2: double coins active (recurring) ---
  if (allowed('arc7.2')) {
    const recurringOk = !wasShownWithin24h(coaching, 'arc7.2', todayStr);
    if (recurringOk) {
      const activeBoosts = progress.shop?.activeBoosts || {};
      const remaining = activeBoosts.doubleCoinsRemainingSessions || 0;
      if (activeBoosts.doubleCoins && remaining > 0) {
        return msg('arc7.2', 'pieces',
          `Double coins actif — encore ${remaining} session${remaining > 1 ? 's' : ''} ×2 🪙.`,
          `${remaining} session${remaining > 1 ? 's' : ''}`,
          '🪙',
          null,
          { oneShot: false, recurring: true }
        );
      }
    }
  }

  // --- arc8.1: discover dictees ---
  if (allowed('arc8.1') && !isAlreadyShown(coaching, 'arc8.1')) {
    const bronzeCount = Object.values(ruleProgress).filter(rp => (rp?.level || 0) >= 1).length;
    if (bronzeCount >= 1) {
      return msg('arc8.1', 'plain',
        'Tu maîtrises les règles ? Va apprendre de nouveaux mots dans le second onglet 🎧.',
        'second onglet',
        '🎧',
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc9.5: post-return (first day back after a break) ---
  if (allowed('arc9.5') && !isAlreadyShown(coaching, 'arc9.5')) {
    if (streak.current === 1 && (streak.longest || 0) > 1) {
      return msg('arc9.5', 'flamme',
        'Tu es de retour 🔥. Demain, ta flamme passe à 2.',
        'Demain, ta flamme passe à 2',
        '🔥',
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc10.x: mastery ---
  if (allowed('arc10.1') && !isAlreadyShown(coaching, 'arc10.1')) {
    const totalRules = rules.length;
    const crownCount = Object.values(ruleProgress).filter(rp => (rp?.level || 0) >= 3).length;
    if (crownCount === totalRules && totalRules > 0) {
      return msg('arc10.1', 'couronnes',
        'Toutes tes règles ont leur couronne 👑. Maintenant, vise les diamants un par un.',
        'vise les diamants',
        '👑',
        null,
        { oneShot: true }
      );
    }
  }

  if (allowed('arc10.2') && !isAlreadyShown(coaching, 'arc10.2')) {
    const totalRules = rules.length;
    const diamondCount = Object.values(ruleProgress).filter(rp => (rp?.level || 0) >= 4).length;
    if (diamondCount === totalRules && totalRules > 0) {
      return msg('arc10.2', 'diamant',
        'Tous tes diamants sont en place 💎. Légende. À toi de les maintenir.',
        'Légende',
        '💎',
        null,
        { oneShot: true }
      );
    }
  }

  if (allowed('arc10.3') && !isAlreadyShown(coaching, 'arc10.3')) {
    const diamondLiveCount = Object.values(ruleProgress).filter(rp => {
      if (!rp || (rp.level || 0) < 4 || !rp.sm2) return false;
      return rp.sm2.nextReviewDate > todayStr;
    }).length;
    if (diamondLiveCount >= 5 && !revisionsDueToday) {
      return msg('arc10.3', 'diamant',
        '5 diamants vivants 💎. Aucune révision en retard. Tu es chez les meilleurs.',
        '5 diamants vivants',
        '💎',
        null,
        { oneShot: true }
      );
    }
  }

  if (allowed('arc10.4') && !isAlreadyShown(coaching, 'arc10.4')) {
    const diamondCount = Object.values(ruleProgress).filter(rp => (rp?.level || 0) >= 4).length;
    if (diamondCount >= 1 && !revisionsDueToday) {
      return msg('arc10.4', 'diamant',
        'Aucune révision aujourd\'hui. Profites-en pour apprendre de nouveaux mots dans le second onglet 🎧.',
        'second onglet',
        '🎧',
        null,
        { oneShot: true }
      );
    }
  }

  // --- arc11.x: mystery image progress ---
  const mysteryCollections = progress.shop?.mysteryImages?.collections || {};
  for (const [colId, col] of Object.entries(mysteryCollections)) {
    const revealed = col?.revealedCount || 0;

    if (allowed('arc11.1') && !isAlreadyShown(coaching, `arc11.1.${colId}`)) {
      if (revealed === 1) {
        return msg(`arc11.1.${colId}`, 'pieces',
          'Premier morceau dévoilé 🧩. Encore 5 morceaux pour voir l\'image complète.',
          '5 morceaux',
          '🧩',
          null,
          { oneShot: true }
        );
      }
    }

    if (allowed('arc11.2') && !isAlreadyShown(coaching, `arc11.2.${colId}`)) {
      if (revealed === 3) {
        return msg(`arc11.2.${colId}`, 'pieces',
          'Moitié de l\'image dévoilée. Plus que 3 morceaux et le mystère tombe.',
          '3 morceaux',
          '🧩',
          null,
          { oneShot: true }
        );
      }
    }

    if (allowed('arc11.3') && !isAlreadyShown(coaching, `arc11.3.${colId}`)) {
      if (revealed === 5) {
        return msg(`arc11.3.${colId}`, 'pieces',
          'Plus qu\'un morceau pour découvrir l\'image entière 🎁.',
          'l\'image entière',
          '🎁',
          null,
          { oneShot: true }
        );
      }
    }

    if (allowed('arc11.4') && !isAlreadyShown(coaching, `arc11.4.${colId}`)) {
      if (revealed >= 6) {
        return msg(`arc11.4.${colId}`, 'pieces',
          'Image mystère complète. Bravo. Une nouvelle image t\'attend dans la boutique.',
          'Image mystère complète',
          '🎁',
          null,
          { oneShot: true }
        );
      }
    }
  }

  // --- arc6.9: mystery daily limit ---
  if (allowed('arc6.9') && !isAlreadyShown(coaching, 'arc6.9')) {
    const daily = progress.shop?.mysteryImages?.daily;
    if (daily?.date === todayStr && (daily?.count || 0) >= 2) {
      return msg('arc6.9', 'pieces',
        '2 morceaux dévoilés aujourd\'hui ✅. Reviens demain pour 2 nouveaux morceaux.',
        'Reviens demain',
        '✅',
        null,
        { oneShot: true }
      );
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// markCoachingShown
// ---------------------------------------------------------------------------

/**
 * Returns updated progress (deep clone). Does NOT mutate the original.
 */
export function markCoachingShown(progress, msg, todayStr) {
  // Deep clone
  const next = JSON.parse(JSON.stringify(progress));

  if (!next.coaching) {
    next.coaching = createDefaultCoaching();
  }

  if (msg.oneShot) {
    next.coaching.shown[msg.arcId] = todayStr;
  }

  if (msg.recurring) {
    next.coaching.lastShownByArc[msg.arcId] = todayStr;
  }

  // Increment daily count
  const dsc = next.coaching.dailyShownCount;
  if (dsc.date !== todayStr) {
    dsc.date = todayStr;
    dsc.count = 1;
  } else {
    dsc.count = (dsc.count || 0) + 1;
  }

  next.coaching.lastBannerArc = msg.arcId;

  return next;
}

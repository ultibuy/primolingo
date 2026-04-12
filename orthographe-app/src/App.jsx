import { useState, useEffect, useCallback } from 'react';
import './index.css';

// Content
import { allRules } from './content/loader.js';

// Engine
import { selectSessionQuestions, selectSniperQuestions } from './engine/session.js';
import { initRuleSM2, updateRuleSM2, calculateDiamondHealth, getToday, parseLocalDate } from './engine/sm2.js';
import { calculateCoins, checkLevelUp, updateStreak } from './engine/scoring.js';
import { rollWeeklyChest, applyTheme } from './engine/economy.js';

// Persistence
import { loadProgress, saveProgress } from './store/persistence.js';

// Components
import Dashboard from './components/Dashboard.jsx';
import QuizGuided from './components/QuizGuided.jsx';
import QuizDirect from './components/QuizDirect.jsx';
import Shop from './components/Shop.jsx';
import ReturnScreen from './components/ReturnScreen.jsx';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
export const DEBUG_MODE = true;
if (typeof window !== 'undefined') window.__ORTHO_DEBUG__ = DEBUG_MODE;
const SESSION_SIZE = DEBUG_MODE ? 1 : 20;
const FIRST_SESSION_BONUS = 10;
const DIAMOND_PASS_THRESHOLD = 90; // >=90% to pass SM-2 review
const INACTIVITY_DAYS = 2;
const SNIPER_SESSION_SIZE = 5;
const SNIPER_COIN_MULTIPLIER = 1.5;

// Milestone definitions (one-shot coin rewards)
const MILESTONE_COINS = {
  firstSession: 50,
  streak7: 50,
  streak14: 100,
  streak30: 150,
  streak60: 300,
  streak100: 500,
};

const STREAK_MILESTONES = {
  7: 'streak7',
  14: 'streak14',
  30: 'streak30',
  60: 'streak60',
  100: 'streak100',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Migrate V1 progress format to V2 if needed. */
function migrateProgress(p) {
  // Detect old format: rules have 'guidedUnlocked' or 'hasCrown' but no 'level'
  let migrated = false;
  const next = JSON.parse(JSON.stringify(p));

  for (const [, rp] of Object.entries(next.rules || {})) {
    if (rp.level === undefined) {
      migrated = true;
      // Infer level from old fields
      if (rp.hasDiamond) {
        rp.level = 4;
        // Init SM-2 for diamond rules
        if (!rp.sm2) {
          rp.sm2 = {
            easiness: 2.5,
            interval: 1,
            repetitions: 0,
            nextReviewDate: getToday(),
            lastReviewScore: null,
            diamondHealth: 1.0,
          };
        }
      } else if (rp.hasCrown) {
        rp.level = 3;
      } else if (rp.directUnlocked) {
        rp.level = 2;
      } else if ((rp.guidedSessionsCompleted || 0) >= 1) {
        rp.level = 1;
      } else {
        rp.level = 0;
      }

      // Clean up old fields
      delete rp.hasCrown;
      delete rp.hasDiamond;
      delete rp.guidedUnlocked;
      delete rp.directUnlocked;

      // Ensure questionStats exists
      if (!rp.questionStats) {
        rp.questionStats = rp.questions || {};
      }
      delete rp.questions;

      // Ensure recentTrophy field
      if (rp.recentTrophy === undefined) rp.recentTrophy = null;
      if (!rp.sm2) rp.sm2 = null;
      if (rp.guidedSessionsAbove80 === undefined) rp.guidedSessionsAbove80 = 0;
      if (rp.directSessionsAbove80 === undefined) rp.directSessionsAbove80 = 0;
      if (rp.directConsecutiveAbove90 === undefined) {
        rp.directConsecutiveAbove90 = rp.directPerfectStreak || 0;
      }
      if (!Array.isArray(rp.recentlyShown)) rp.recentlyShown = [];
      delete rp.directPerfectStreak;
    }
  }

  // Migrate milestones from array to object if needed
  if (Array.isArray(next.milestones)) {
    const arr = next.milestones;
    next.milestones = {
      firstSession: next.firstQuizDone || arr.includes('firstSession'),
      streak7: arr.includes('streak7'),
      streak14: arr.includes('streak14'),
      streak30: arr.includes('streak30'),
      streak60: arr.includes('streak60'),
      streak100: arr.includes('streak100'),
    };
  } else if (!next.milestones || typeof next.milestones !== 'object') {
    next.milestones = {
      firstSession: !!next.firstQuizDone,
      streak7: false,
      streak14: false,
      streak30: false,
      streak60: false,
      streak100: false,
    };
  }

  // Ensure V2 fields exist
  if (!next.shop) {
    next.shop = {
      owned: [],
      equipped: { theme: null, flame: null, title: null, victoryAnimation: null, dashboardBackground: null },
      activeBoosts: { doubleCoins: false },
      inventory: { revealHint: 0, rematch: 0, modeSniper: 0, questionMystery: 0 },
    };
  }
  // Ensure inventory exists (V5 migration)
  if (!next.shop.inventory) {
    next.shop.inventory = { revealHint: 0, rematch: 0, modeSniper: 0, questionMystery: 0 };
  }
  if (!next.weeklyChest) {
    next.weeklyChest = { lastOpened: null };
  }
  if (next.shields === undefined) next.shields = 0;
  if (next.coins === undefined) next.coins = 0;

  // DEBUG: unlimited coins for testing shop
  if (DEBUG_MODE) next.coins = 9999;

  // Remove deprecated fields
  delete next.firstQuizDone;
  delete next.crowns;
  delete next.diamonds;

  return { progress: next, migrated };
}

/** Count days between two YYYY-MM-DD date strings. */
function daysBetween(dateStrA, dateStrB) {
  const a = parseLocalDate(dateStrA);
  const b = parseLocalDate(dateStrB);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

/** Check if user is returning after inactivity and needs ReturnScreen. */
function checkReturnAfterInactivity(progress) {
  const today = getToday();
  const lastActive = progress.streak?.lastActiveDate;
  if (!lastActive) return null;

  const daysAway = daysBetween(lastActive, today);
  if (daysAway < INACTIVITY_DAYS) return null;

  // Check if streak would be lost (lastActive < yesterday and no shield or more than 1 day missed with shield)
  const streakCurrent = progress.streak?.current || 0;
  const shields = progress.shields || 0;
  const streakLost = daysAway > 1 && (daysAway > 2 || shields === 0) && streakCurrent > 0;

  // Check diamond changes
  const diamondChanges = [];
  for (const [ruleId, rp] of Object.entries(progress.rules || {})) {
    if (rp.level >= 4 && rp.sm2) {
      const oldHealth = rp.sm2.diamondHealth ?? 1.0;
      const newHealth = calculateDiamondHealth(rp.sm2);
      if (newHealth < oldHealth) {
        const rule = allRules.find(r => r.id === ruleId);
        diamondChanges.push({
          ruleId,
          ruleTitle: rule?.shortTitle || rule?.title || ruleId,
          oldHealth,
          newHealth,
          broken: newHealth <= 0,
        });
      }
    }
  }

  // Only show return screen if something noteworthy happened
  if (!streakLost && diamondChanges.length === 0) return null;

  return { streakLost, previousStreak: streakCurrent, diamondChanges };
}

/** Apply diamond health decay and handle demotions. Returns updated progress. */
function applyDiamondDecay(progress) {
  const next = JSON.parse(JSON.stringify(progress));
  for (const [, rp] of Object.entries(next.rules || {})) {
    if (rp.level >= 4 && rp.sm2) {
      const health = calculateDiamondHealth(rp.sm2);
      rp.sm2.diamondHealth = health;
      if (health <= 0) {
        // Demote to level 3 (crown)
        rp.level = 3;
        rp.sm2 = null;
        rp.directConsecutiveAbove90 = 0;
      }
    }
  }
  return next;
}

/** Sort rules by priority: SM-2 due first, then in-progress, then new. */
function sortRulesByPriority(rules, ruleProgress) {
  const today = getToday();

  return [...rules].sort((a, b) => {
    const rpA = ruleProgress[a.id];
    const rpB = ruleProgress[b.id];

    const priorityOf = (rule, rp) => {
      if (!rp || rp.level === 0 || rp.level === undefined) return 3; // new
      if (rp.level >= 4 && rp.sm2 && rp.sm2.nextReviewDate <= today) return 1; // SM-2 due
      if (rp.level >= 1 && rp.level <= 4) return 2; // in progress
      return 2.5; // diamond not due
    };

    const pA = priorityOf(a, rpA);
    const pB = priorityOf(b, rpB);
    if (pA !== pB) return pA - pB;

    // Within same priority, sort by urgency (lower diamond health = more urgent)
    if (pA === 1 && rpA?.sm2 && rpB?.sm2) {
      return (rpA.sm2.diamondHealth ?? 1) - (rpB.sm2.diamondHealth ?? 1);
    }
    return 0;
  });
}

/** Determine quiz mode based on rule level. */
function determineQuizMode(ruleProgress) {
  const level = ruleProgress?.level || 0;
  // SM-2 review is always direct
  if (level >= 4 && ruleProgress.sm2) return 'direct';
  // Level 2+ can do direct
  if (level >= 2) return 'direct';
  // Levels 0-1 use guided
  return 'guided';
}

/** Check and award milestone if not already earned. Returns coins awarded (0 if already earned). */
function awardMilestone(milestones, key) {
  if (milestones[key]) return 0;
  milestones[key] = true;
  return MILESTONE_COINS[key] || 0;
}

/** Create default rule progress for a new rule. */
function createDefaultRuleProgress() {
  return {
    level: 0,
    guidedSessionsCompleted: 0,
    guidedSessionsAbove80: 0,
    guidedBestScore: 0,
    directSessionsCompleted: 0,
    directSessionsAbove80: 0,
    directBestScore: 0,
    directConsecutiveAbove90: 0,
    sm2: null,
    recentTrophy: null,
    recentlyShown: [],
    questionStats: {},
  };
}

// ---------------------------------------------------------------------------
// App Component
// ---------------------------------------------------------------------------
export default function App() {
  const [progress, setProgress] = useState(null);
  const [screen, setScreen] = useState('dashboard');
  const [activeRule, setActiveRule] = useState(null);
  const [activeMode, setActiveMode] = useState('guided');
  const [isSM2Review, setIsSM2Review] = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [returnData, setReturnData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastSessionQuestions, setLastSessionQuestions] = useState(null);
  const [lastSessionRuleId, setLastSessionRuleId] = useState(null);
  const [lastSessionMode, setLastSessionMode] = useState(null);
  const [lastSessionScore, setLastSessionScore] = useState(null);
  const [isSniper, setIsSniper] = useState(false);
  const [saveError, setSaveError] = useState(null);

  const persistProgress = useCallback((nextProgress) => {
    saveProgress(nextProgress).then((result) => {
      if (!result?.success) {
        setSaveError(result?.error || 'La progression n’a pas pu être sauvegardée.');
        return;
      }
      setSaveError(null);
    });
  }, []);

  // ---------------------------------------------------------------------------
  // Load progress on mount
  // ---------------------------------------------------------------------------
  useEffect(() => {
    loadProgress().then(raw => {
      // Migrate old format if needed
      const { progress: migratedProgress } = migrateProgress(raw);
      let p = migratedProgress;

      // Apply diamond health decay
      p = applyDiamondDecay(p);

      // Check for return after inactivity
      const returnInfo = checkReturnAfterInactivity(p);
      if (returnInfo) {
        setReturnData(returnInfo);
        setScreen('return');
      }

      // Save updated progress (decay applied)
      persistProgress(p);
      setProgress(p);
      setLoading(false);

      // Apply equipped theme on load
      const equippedTheme = p.shop?.equipped?.theme;
      if (equippedTheme) applyTheme(equippedTheme);
    });
  }, [persistProgress]);

  // ---------------------------------------------------------------------------
  // Handle play: start a quiz session for a rule
  // ---------------------------------------------------------------------------
  const handlePlay = useCallback((ruleId, mode) => {
    const rule = allRules.find(r => r.id === ruleId);
    if (!rule) return;

    const ruleProgress = progress.rules?.[ruleId];
    const sm2Review = !!(ruleProgress?.level >= 4 && ruleProgress.sm2 &&
      ruleProgress.sm2.nextReviewDate <= getToday());

    // Determine mode: SM-2 review is always direct, otherwise use provided or auto-detect
    const quizMode = sm2Review ? 'direct' : (mode || determineQuizMode(ruleProgress));

    // Select session questions
    const questions = selectSessionQuestions(rule, ruleProgress, SESSION_SIZE);

    setActiveRule(rule);
    setActiveMode(quizMode);
    setIsSM2Review(sm2Review);
    setSessionQuestions(questions);
    setPendingEvents([]);
    setScreen('quiz');
  }, [progress]);

  // ---------------------------------------------------------------------------
  // Handle quiz finish: process results, update progress, build events
  // ---------------------------------------------------------------------------
  const handleQuizFinish = useCallback((score, total, answers) => {
    const pct = Math.round((score / total) * 100);
    const ruleId = activeRule.id;
    const mode = activeMode;
    const wasSmR2Review = isSM2Review;
    const events = [];

    setProgress(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const today = getToday();

      // Sniper mode: questions come from multiple rules, so update
      // question stats per each question's own rule, but skip
      // session-level stats and level-up for any single rule.
      const isSniperSession = ruleId === '__sniper__';

      if (!isSniperSession) {
        // Ensure rule progress exists
        if (!next.rules[ruleId]) {
          next.rules[ruleId] = createDefaultRuleProgress();
        }
      }
      const rp = isSniperSession ? null : next.rules[ruleId];

      // ---------------------------------------------------------------
      // Update question stats (lightweight tracking)
      // ---------------------------------------------------------------
      if (isSniperSession) {
        // In sniper mode, each answer may belong to a different rule
        for (const ans of answers) {
          const qRuleId = ans._ruleId || ruleId;
          if (!next.rules[qRuleId]) next.rules[qRuleId] = createDefaultRuleProgress();
          const qrp = next.rules[qRuleId];
          if (!qrp.questionStats) qrp.questionStats = {};
          const qs = qrp.questionStats[ans.questionId] || { timesShown: 0, timesCorrect: 0 };
          qs.timesShown += 1;
          if (ans.correct) qs.timesCorrect += 1;
          qrp.questionStats[ans.questionId] = qs;
        }
      } else {
        for (const ans of answers) {
          if (!rp.questionStats) rp.questionStats = {};
          const qs = rp.questionStats[ans.questionId] || { timesShown: 0, timesCorrect: 0 };
          qs.timesShown += 1;
          if (ans.correct) qs.timesCorrect += 1;
          rp.questionStats[ans.questionId] = qs;
        }
      }

      // ---------------------------------------------------------------
      // Track recently shown questions for variety (skip for sniper)
      // ---------------------------------------------------------------
      if (!isSniperSession && rp) {
        const currentShown = sessionQuestions.map(q => q.id);
        const previousShown = Array.isArray(rp.recentlyShown) ? rp.recentlyShown : [];
        rp.recentlyShown = [
          ...currentShown,
          ...previousShown.filter(id => !currentShown.includes(id)),
        ].slice(0, SESSION_SIZE * 2);
      }

      // ---------------------------------------------------------------
      // Calculate coins earned
      // ---------------------------------------------------------------
      let sessionCoins = calculateCoins(score, total);

      // First session of day bonus
      const isFirstSessionToday = next.streak?.lastActiveDate !== today;
      if (isFirstSessionToday) {
        sessionCoins += FIRST_SESSION_BONUS;
        events.push({ type: 'firstSessionOfDay', value: FIRST_SESSION_BONUS });
      }

      // Sniper mode bonus (×1.5 coins)
      if (isSniper) {
        sessionCoins = Math.round(sessionCoins * SNIPER_COIN_MULTIPLIER);
        events.push({ type: 'sniperBonus' });
      }

      // Double coins boost
      if (next.shop?.activeBoosts?.doubleCoins) {
        sessionCoins *= 2;
        next.shop.activeBoosts.doubleCoins = false;
        events.push({ type: 'doubleCoins' });
      }

      next.coins = (next.coins || 0) + sessionCoins;
      events.push({ type: 'coinsEarned', value: sessionCoins });

      // ---------------------------------------------------------------
      // SM-2 review processing (skip for sniper)
      // ---------------------------------------------------------------
      if (!isSniperSession && wasSmR2Review && rp && rp.sm2) {
        const updatedSM2 = updateRuleSM2(rp.sm2, score, total);
        rp.sm2 = updatedSM2;

        if (pct >= DIAMOND_PASS_THRESHOLD) {
          events.push({ type: 'sm2ReviewPassed', value: activeRule.shortTitle || activeRule.title });
        } else if (pct >= 80) {
          events.push({ type: 'sm2ReviewFragile', value: activeRule.shortTitle || activeRule.title });
        } else {
          events.push({ type: 'sm2ReviewFailed', value: activeRule.shortTitle || activeRule.title });
        }

        // Check if diamond health dropped to 0 → demote
        if (rp.sm2.diamondHealth <= 0) {
          rp.level = 3;
          rp.sm2 = null;
          rp.directConsecutiveAbove90 = 0;
          events.push({ type: 'diamondBroken', value: activeRule.shortTitle || activeRule.title });
        }
      }

      // ---------------------------------------------------------------
      // Check level up (non-SM2 sessions, skip for sniper)
      // ---------------------------------------------------------------
      if (!isSniperSession && !wasSmR2Review && rp) {
        const oldLevel = rp.level || 0;
        const levelResult = checkLevelUp(rp, mode, score, total);
        Object.assign(rp, levelResult.updatedProgress);

        if (levelResult.newLevel !== null && levelResult.newLevel > oldLevel) {
          rp.level = levelResult.newLevel;
          events.push({ type: 'levelUp', value: levelResult.newLevel, ruleTitle: activeRule.shortTitle || activeRule.title });

          // Award level milestone coins
          if (levelResult.coinsEarned > 0) {
            next.coins += levelResult.coinsEarned;
            events.push({ type: 'levelMilestoneCoins', value: levelResult.coinsEarned, level: levelResult.newLevel });
          }

          // Level 2: direct mode unlocked
          if (levelResult.newLevel === 2 && oldLevel < 2) {
            events.push({ type: 'directUnlocked', value: activeRule.shortTitle || activeRule.title });
          }

          // Level 3: crown earned
          if (levelResult.newLevel === 3 && oldLevel < 3) {
            rp.recentTrophy = 'crown';
            events.push({ type: 'crown', value: activeRule.shortTitle || activeRule.title });
          }

          // Level 4: diamond earned → init SM-2
          if (levelResult.newLevel === 4 && oldLevel < 4) {
            rp.sm2 = initRuleSM2();
            rp.recentTrophy = 'diamond';
            events.push({ type: 'diamond', value: activeRule.shortTitle || activeRule.title });
          }
        }
      }

      // ---------------------------------------------------------------
      // Update streak
      // ---------------------------------------------------------------
      const streakResult = updateStreak(next);
      next.streak = streakResult.streak;

      if (streakResult.shieldUsed) {
        events.push({ type: 'shieldUsed', value: streakResult.streak.current });
      }
      if (streakResult.streakLost) {
        events.push({ type: 'streakLost' });
      }

      // ---------------------------------------------------------------
      // Check milestones (one-shot)
      // ---------------------------------------------------------------
      if (!next.milestones) {
        next.milestones = {
          firstSession: false, streak7: false, streak14: false,
          streak30: false, streak60: false, streak100: false,
        };
      }

      // First session ever
      const firstSessionCoins = awardMilestone(next.milestones, 'firstSession');
      if (firstSessionCoins > 0) {
        next.coins += firstSessionCoins;
        events.push({ type: 'milestone', value: 'firstSession', coins: firstSessionCoins });
      }

      // Streak milestones
      const currentStreak = next.streak.current;
      for (const [threshold, key] of Object.entries(STREAK_MILESTONES)) {
        if (currentStreak >= Number(threshold)) {
          const coins = awardMilestone(next.milestones, key);
          if (coins > 0) {
            next.coins += coins;
            events.push({ type: 'milestone', value: key, coins, streak: Number(threshold) });
          }
        }
      }

      // Streak new milestone notification (from updateStreak)
      if (streakResult.newMilestone) {
        events.push({ type: 'streakMilestone', value: streakResult.newMilestone });
      }

      // ---------------------------------------------------------------
      // Weekly chest eligibility
      // ---------------------------------------------------------------
      const chestResult = rollWeeklyChest(next);
      if (chestResult?.opened) {
        next.coins += chestResult.coins;
        next.weeklyChest = chestResult.weeklyChest;
        events.push({ type: 'weeklyChest', value: chestResult.coins });
      }

      // ---------------------------------------------------------------
      // Save progress
      // ---------------------------------------------------------------
      persistProgress(next);
      return next;
    });

    // Clear recent trophy flags after showing
    setTimeout(() => {
      setProgress(prev => {
        if (!prev) return prev;
        const next = JSON.parse(JSON.stringify(prev));
        for (const rId of Object.keys(next.rules)) {
          next.rules[rId].recentTrophy = null;
        }
        persistProgress(next);
        return next;
      });
    }, 5000);

    // Store last session data for potential rematch
    if (!isSniper) {
      setLastSessionQuestions([...sessionQuestions]);
      setLastSessionRuleId(ruleId);
      setLastSessionMode(mode);
      setLastSessionScore(pct);
    } else {
      // Sniper sessions are not rematchable
      setLastSessionQuestions(null);
      setLastSessionRuleId(null);
      setLastSessionMode(null);
      setLastSessionScore(null);
    }

    setPendingEvents(events);
    setScreen('dashboard');
    setActiveRule(null);
    setActiveMode('guided');
    setIsSM2Review(false);
    setSessionQuestions([]);
    setIsSniper(false);
  }, [activeRule, activeMode, isSM2Review, isSniper, persistProgress, sessionQuestions]);

  // ---------------------------------------------------------------------------
  // FIX 1 — Clear pending events after Dashboard has shown them all
  // ---------------------------------------------------------------------------
  const handleEventsSeen = useCallback(() => {
    setPendingEvents([]);
  }, []);

  // ---------------------------------------------------------------------------
  // Shop handlers
  // ---------------------------------------------------------------------------
  const handlePurchase = useCallback((itemId, cost) => {
    setProgress(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (next.coins < cost) return prev; // not enough coins

      next.coins -= cost;

      if (!next.shop) {
        next.shop = {
          owned: [],
          equipped: { theme: null, flame: null, title: null, victoryAnimation: null, dashboardBackground: null },
          activeBoosts: { doubleCoins: false },
          inventory: { revealHint: 0, rematch: 0, modeSniper: 0, questionMystery: 0 },
        };
      }
      // Ensure inventory exists
      if (!next.shop.inventory) {
        next.shop.inventory = { revealHint: 0, rematch: 0, modeSniper: 0, questionMystery: 0 };
      }

      // Handle consumables vs permanents
      if (itemId === 'streak-freeze') {
        next.shields = Math.min((next.shields || 0) + 1, 2);
      } else if (itemId === 'double-coins') {
        next.shop.activeBoosts.doubleCoins = true;
      } else if (itemId === 'reveal-hint') {
        next.shop.inventory.revealHint = (next.shop.inventory.revealHint || 0) + 1;
      } else if (itemId === 'rematch') {
        next.shop.inventory.rematch = (next.shop.inventory.rematch || 0) + 1;
      } else if (itemId === 'mode-sniper') {
        next.shop.inventory.modeSniper = (next.shop.inventory.modeSniper || 0) + 1;
      } else if (itemId === 'question-mystery') {
        next.shop.inventory.questionMystery = (next.shop.inventory.questionMystery || 0) + 1;
      } else {
        // Permanent item
        if (!next.shop.owned.includes(itemId)) {
          next.shop.owned.push(itemId);
        }
      }

      persistProgress(next);
      return next;
    });
  }, [persistProgress]);

  const handleEquip = useCallback((category, itemId) => {
    setProgress(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next.shop) return prev;
      if (!next.shop.equipped) {
        next.shop.equipped = { theme: null, flame: null, title: null, victoryAnimation: null, dashboardBackground: null };
      }
      next.shop.equipped[category] = itemId;
      persistProgress(next);
      // Apply theme immediately if equipping a theme
      if (category === 'theme') applyTheme(itemId);
      return next;
    });
  }, [persistProgress]);

  const handleCloseShop = useCallback(() => {
    setScreen('dashboard');
  }, []);

  const handleOpenShop = useCallback(() => {
    setScreen('shop');
  }, []);

  // ---------------------------------------------------------------------------
  // B3 — Sniper mode: launch a special hard session across all rules
  // ---------------------------------------------------------------------------
  const handleSniper = useCallback(() => {
    if (!progress) return;
    const inventory = progress.shop?.inventory;
    if (!inventory || inventory.modeSniper <= 0) return;

    // Decrement inventory
    setProgress(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next.shop?.inventory || next.shop.inventory.modeSniper <= 0) return prev;
      next.shop.inventory.modeSniper -= 1;
      persistProgress(next);
      return next;
    });

    // Select sniper questions from all rules
    const questions = selectSniperQuestions(allRules, progress, SNIPER_SESSION_SIZE);
    if (questions.length === 0) return;

    // Use the first question's rule as the "active rule" for display purposes
    // But sniper mode is cross-rule, so we create a synthetic rule
    const sniperRule = {
      id: '__sniper__',
      title: 'Mode Sniper',
      shortTitle: 'Sniper',
      choices: [], // Will be overridden per-question in the quiz component
      decisionAxes: [],
      questions: questions,
    };

    setActiveRule(sniperRule);
    setActiveMode('direct');
    setIsSM2Review(false);
    setIsSniper(true);
    setSessionQuestions(questions);
    setPendingEvents([]);
    setScreen('quiz');
  }, [persistProgress, progress]);

  // ---------------------------------------------------------------------------
  // B2 — Rematch: replay last session with the same questions
  // ---------------------------------------------------------------------------
  const handleRematch = useCallback(() => {
    if (!progress || !lastSessionQuestions || !lastSessionRuleId) return;
    const inventory = progress.shop?.inventory;
    if (!inventory || inventory.rematch <= 0) return;

    // Decrement inventory
    setProgress(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next.shop?.inventory || next.shop.inventory.rematch <= 0) return prev;
      next.shop.inventory.rematch -= 1;
      persistProgress(next);
      return next;
    });

    const rule = allRules.find(r => r.id === lastSessionRuleId);
    if (!rule) return;

    setActiveRule(rule);
    setActiveMode(lastSessionMode || 'direct');
    setIsSM2Review(false);
    setIsSniper(false);
    setSessionQuestions([...lastSessionQuestions]);
    setPendingEvents([]);
    setScreen('quiz');
  }, [lastSessionMode, lastSessionQuestions, lastSessionRuleId, persistProgress, progress]);

  // ---------------------------------------------------------------------------
  // B1 — Use inventory item during quiz (callback passed to quiz components)
  // ---------------------------------------------------------------------------
  const handleUseItem = useCallback((itemKey) => {
    setProgress(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next.shop?.inventory) return prev;
      if ((next.shop.inventory[itemKey] || 0) <= 0) return prev;
      next.shop.inventory[itemKey] -= 1;
      persistProgress(next);
      return next;
    });
  }, [persistProgress]);

  // ---------------------------------------------------------------------------
  // Return screen handler
  // ---------------------------------------------------------------------------
  const handleReturnContinue = useCallback(() => {
    setReturnData(null);
    setScreen('dashboard');
  }, []);

  const handleCloseQuiz = useCallback(() => {
    setScreen('dashboard');
    setActiveRule(null);
    setActiveMode('guided');
    setIsSM2Review(false);
    setSessionQuestions([]);
    setPendingEvents([]);
    setIsSniper(false);
  }, []);

  const renderWithSaveError = (content) => (
    <>
      {saveError && (
        <div style={saveErrorStyle}>
          {saveError}
        </div>
      )}
      {content}
    </>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  if (loading || !progress) {
    return renderWithSaveError(
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, var(--color-bg1) 0%, var(--color-bg2) 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-accent)', fontSize: '1.2rem', fontWeight: 600,
        fontFamily: 'var(--font-body)',
      }}>
        Chargement…
      </div>
    );
  }

  // Return screen after inactivity
  if (screen === 'return' && returnData) {
    return renderWithSaveError(
      <ReturnScreen
        progress={progress}
        streakLost={returnData.streakLost}
        diamondChanges={returnData.diamondChanges}
        onContinue={handleReturnContinue}
      />
    );
  }

  // Quiz screen
  if (screen === 'quiz' && activeRule) {
    const QuizComponent = activeMode === 'direct' ? QuizDirect : QuizGuided;
    const inventory = progress.shop?.inventory || { revealHint: 0, rematch: 0, modeSniper: 0, questionMystery: 0 };
    const hasDoubleCoinsActive = !!progress.shop?.activeBoosts?.doubleCoins;
    const isFirstSessionOfDay = progress.streak?.lastActiveDate !== getToday();
    const ruleProgress = activeRule.id === '__sniper__' ? null : progress.rules?.[activeRule.id];
    return renderWithSaveError(
      <QuizComponent
        rule={activeRule}
        questions={sessionQuestions}
        onFinish={handleQuizFinish}
        inventory={inventory}
        onUseItem={handleUseItem}
        isSniper={isSniper}
        hasDoubleCoinsActive={hasDoubleCoinsActive}
        allRules={allRules}
        isFirstSessionOfDay={isFirstSessionOfDay}
        ruleProgress={ruleProgress}
        streak={progress.streak}
        onClose={handleCloseQuiz}
      />
    );
  }

  // Shop screen
  if (screen === 'shop') {
    return renderWithSaveError(
      <Shop
        progress={progress}
        onPurchase={handlePurchase}
        onEquip={handleEquip}
        onClose={handleCloseShop}
      />
    );
  }

  // Dashboard (default)
  const sortedRules = sortRulesByPriority(allRules, progress.rules || {});
  const canRematch = !!(lastSessionQuestions && lastSessionScore !== null && lastSessionScore < 80
    && (progress.shop?.inventory?.rematch || 0) > 0);

  return (
    renderWithSaveError(
      <Dashboard
        rules={sortedRules}
        progress={progress}
        onPlay={handlePlay}
        onOpenShop={handleOpenShop}
        pendingEvents={pendingEvents}
        onEventsSeen={handleEventsSeen}
        onSniper={handleSniper}
        onRematch={handleRematch}
        canRematch={canRematch}
        lastSessionRuleId={lastSessionRuleId}
        lastSessionScore={lastSessionScore}
      />
    )
  );
}

const saveErrorStyle = {
  position: 'fixed',
  top: 16,
  left: '50%',
  transform: 'translateX(-50%)',
  zIndex: 2000,
  maxWidth: 640,
  width: 'calc(100% - 2rem)',
  padding: '0.85rem 1rem',
  borderRadius: 14,
  border: '1px solid rgba(248,113,113,0.4)',
  background: 'rgba(127,29,29,0.95)',
  color: '#fee2e2',
  boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
  textAlign: 'center',
  fontSize: '0.9rem',
  fontWeight: 600,
};

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../index.css';

// Context
import { useAuth } from '../contexts/AuthContext.jsx';
import { getChild } from '../services/store.js';

// Content
import { allRules } from '../content/loader.js';

// Engine
import { selectSessionQuestions, selectSniperQuestions } from '../engine/session.js';
import { initRuleSM2, updateRuleSM2, calculateDiamondHealth, getToday, parseLocalDate } from '../engine/sm2.js';
import { calculateCoins, calculatePerfectSessionBonus, checkLevelUp, updateStreak } from '../engine/scoring.js';
import {
  applyTheme,
  canPurchaseMysteryImagePiece,
  createDefaultMysteryImagesState,
  DOUBLE_COINS_SESSION_COUNT,
  getCurrentShopWeek,
  hasDoubleCoinsActive,
  getMysteryImageDefinitions,
  getMysteryImageIdFromPurchaseId,
  isMysteryPurchaseId,
  normalizeMysteryImagesState,
  purchaseMysteryImagePiece,
} from '../engine/economy.js';

// Persistence
import {
  createDefaultProgress,
  loadProgress,
  saveProgress,
  getDailyBackups,
  restoreDailyBackup,
  loadAdminSettings,
} from '../store/persistence.js';

// Components
import Dashboard from '../components/Dashboard.jsx';
import LightningEntranceEffect from '../components/LightningEntranceEffect.jsx';
import StarsEntranceEffect from '../components/StarsEntranceEffect.jsx';
import InfernoEntranceEffect from '../components/InfernoEntranceEffect.jsx';
import FreezeEntranceEffect from '../components/FreezeEntranceEffect.jsx';
import QuizGuided from '../components/QuizGuided.jsx';
import QuizDirect from '../components/QuizDirect.jsx';
import Shop from '../components/Shop.jsx';
import ReturnScreen from '../components/ReturnScreen.jsx';
import CoinIcon from '../components/CoinIcon.jsx';
import PopupCloseButton from '../components/PopupCloseButton.jsx';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const DEFAULT_SESSION_SIZE = 20;
const FIRST_SESSION_BONUS = 10;
const DIAMOND_PASS_THRESHOLD = 90;
const INACTIVITY_DAYS = 2;
const SNIPER_SESSION_SIZE = 5;
const SNIPER_COIN_MULTIPLIER = 1.5;
const SECRET_CODE_LENGTH = 4;
const SECRET_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const SECRET_CODE_BASE_LOCK_MS = 15000;

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

function getFirstQuizBonusDismissKey(childId) {
  return `ortho_first_quiz_bonus_dismissed:${childId || 'unknown'}`;
}

function getDebugChildName() {
  if (typeof window === 'undefined') return '';
  try {
    return String(window.localStorage.getItem('debug_child_name') || '').trim();
  } catch {
    return '';
  }
}

function normalizeSecretCode(value) {
  return (value || '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, SECRET_CODE_LENGTH);
}

function generateSecretCode() {
  let code = '';
  for (let i = 0; i < SECRET_CODE_LENGTH; i += 1) {
    code += SECRET_CODE_ALPHABET[Math.floor(Math.random() * SECRET_CODE_ALPHABET.length)];
  }
  return code;
}

function getSecretCodeLockDurationMs(failedAttempts) {
  if (failedAttempts <= 0) return 0;
  return Math.min(SECRET_CODE_BASE_LOCK_MS * (2 ** (failedAttempts - 1)), 60 * 60 * 1000);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function migrateProgress(p, mysteryImageDefinitions) {
  let migrated = false;
  const source = p && typeof p === 'object' ? p : createDefaultProgress();
  const next = JSON.parse(JSON.stringify(source));

  for (const [, rp] of Object.entries(next.rules || {})) {
    if (rp.level === undefined) {
      migrated = true;
      if (rp.hasDiamond) {
        rp.level = 4;
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
      delete rp.hasCrown;
      delete rp.hasDiamond;
      delete rp.guidedUnlocked;
      delete rp.directUnlocked;
      if (!rp.questionStats) {
        rp.questionStats = rp.questions || {};
      }
      delete rp.questions;
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
      streak7: false, streak14: false, streak30: false,
      streak60: false, streak100: false,
    };
  }

  if (!next.shop) {
    next.shop = {
      owned: [],
      equipped: { theme: null, flame: null, title: null, victoryAnimation: null },
      activeBoosts: { doubleCoins: false, doubleCoinsRemainingSessions: 0, doubleCoinsLastPurchasedWeek: null },
      mysteryImages: createDefaultMysteryImagesState(),
      inventory: { revealHint: 0, rematch: 0, modeSniper: 0, questionMystery: 0 },
    };
  }
  if (!next.shop.activeBoosts || typeof next.shop.activeBoosts !== 'object') {
    next.shop.activeBoosts = { doubleCoins: false, doubleCoinsRemainingSessions: 0, doubleCoinsBonusEarned: 0, doubleCoinsLastPurchasedWeek: null };
  }
  if (typeof next.shop.activeBoosts.doubleCoinsRemainingSessions !== 'number') {
    next.shop.activeBoosts.doubleCoinsRemainingSessions = next.shop.activeBoosts.doubleCoins ? 1 : 0;
  }
  if (typeof next.shop.activeBoosts.doubleCoinsBonusEarned !== 'number') {
    next.shop.activeBoosts.doubleCoinsBonusEarned = 0;
  }
  if (typeof next.shop.activeBoosts.doubleCoinsLastPurchasedWeek !== 'string') {
    next.shop.activeBoosts.doubleCoinsLastPurchasedWeek = null;
  }
  next.shop.activeBoosts.doubleCoins = next.shop.activeBoosts.doubleCoinsRemainingSessions > 0;
  next.shop.equipped = next.shop.equipped && typeof next.shop.equipped === 'object'
    ? {
        theme: next.shop.equipped.theme || null,
        flame: next.shop.equipped.flame || null,
        title: next.shop.equipped.title || null,
        victoryAnimation: next.shop.equipped.victoryAnimation || null,
      }
    : { theme: null, flame: null, title: null, victoryAnimation: null };
  next.shop.mysteryImages = normalizeMysteryImagesState(next.shop.mysteryImages, mysteryImageDefinitions);
  if (!next.shop.inventory) {
    next.shop.inventory = { revealHint: 0, rematch: 0, modeSniper: 0, questionMystery: 0 };
  }
  if (next.shields === undefined) next.shields = 0;
  if (next.coins === undefined) next.coins = 0;
  if (!next.parentalCode || typeof next.parentalCode !== 'object') {
    next.parentalCode = {
      code: generateSecretCode(),
      failedAttempts: 0,
      lockedUntil: 0,
    };
  } else {
    next.parentalCode.code = normalizeSecretCode(next.parentalCode.code) || generateSecretCode();
    next.parentalCode.failedAttempts = Number.isFinite(next.parentalCode.failedAttempts) ? next.parentalCode.failedAttempts : 0;
    next.parentalCode.lockedUntil = Number.isFinite(next.parentalCode.lockedUntil) ? next.parentalCode.lockedUntil : 0;
  }

  delete next.firstQuizDone;
  delete next.crowns;
  delete next.diamonds;

  return { progress: next, migrated };
}

function daysBetween(dateStrA, dateStrB) {
  const a = parseLocalDate(dateStrA);
  const b = parseLocalDate(dateStrB);
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}

function checkReturnAfterInactivity(progress) {
  const today = getToday();
  const lastActive = progress.streak?.lastActiveDate;
  if (!lastActive) return null;

  const daysAway = daysBetween(lastActive, today);
  if (daysAway < INACTIVITY_DAYS) return null;

  const streakCurrent = progress.streak?.current || 0;
  const shields = progress.shields || 0;
  const coins = progress.coins || 0;
  const SHIELD_PRICE = 80;

  const daysMissed = daysAway - 1;
  const shieldsToUse = Math.min(shields, Math.min(daysMissed, 2));
  const shieldsToBuy = Math.max(0, Math.min(daysMissed, 2) - shieldsToUse);
  const costToBuy = shieldsToBuy * SHIELD_PRICE;
  const streakSaveable = streakCurrent > 0 && daysMissed <= 2 && coins >= costToBuy;
  const streakLost = !streakSaveable && streakCurrent > 0 && daysMissed >= 1;

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

  if (!streakLost && !streakSaveable && diamondChanges.length === 0) return null;

  return { streakLost, streakSaveable, shieldsToUse, shieldsToBuy, costToBuy, coins, previousStreak: streakCurrent, daysMissed, diamondChanges };
}

function applyDiamondDecay(progress) {
  const next = JSON.parse(JSON.stringify(progress));
  for (const [, rp] of Object.entries(next.rules || {})) {
    if (rp.level >= 4 && rp.sm2) {
      const health = calculateDiamondHealth(rp.sm2);
      rp.sm2.diamondHealth = health;
      if (health <= 0) {
        rp.level = 3;
        rp.sm2 = null;
        rp.directConsecutiveAbove90 = 0;
      }
    }
  }
  return next;
}

function sortRulesByPriority(rules, ruleProgress) {
  const today = getToday();
  return [...rules].sort((a, b) => {
    const rpA = ruleProgress[a.id];
    const rpB = ruleProgress[b.id];
    const priorityOf = (rule, rp) => {
      if (!rp || rp.level === 0 || rp.level === undefined) return 3;
      if (rp.level >= 4 && rp.sm2 && rp.sm2.nextReviewDate <= today) return 1;
      if (rp.level >= 1 && rp.level <= 4) return 2;
      return 2.5;
    };
    const pA = priorityOf(a, rpA);
    const pB = priorityOf(b, rpB);
    if (pA !== pB) return pA - pB;
    if (pA === 1 && rpA?.sm2 && rpB?.sm2) {
      return (rpA.sm2.diamondHealth ?? 1) - (rpB.sm2.diamondHealth ?? 1);
    }
    return 0;
  });
}

function determineQuizMode(ruleProgress) {
  const level = ruleProgress?.level || 0;
  if (level >= 4 && ruleProgress.sm2) return 'direct';
  if (level >= 2) return 'direct';
  return 'guided';
}

function awardMilestone(milestones, key) {
  if (milestones[key]) return 0;
  milestones[key] = true;
  return MILESTONE_COINS[key] || 0;
}

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
// ChildApp Component
// ---------------------------------------------------------------------------
export default function ChildApp() {
  const { childId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const uid = user?.uid;

  const [progress, setProgress] = useState(null);
  const [childName, setChildName] = useState('');
  const [adminSettings, setAdminSettings] = useState(null);
  const [sessionSize, setSessionSize] = useState(DEFAULT_SESSION_SIZE);
  const [screen, setScreen] = useState('dashboard');
  const [pendingEntranceAnim, setPendingEntranceAnim] = useState(null);
  const [showLightning, setShowLightning] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [showInferno, setShowInferno] = useState(false);
  const [showFreeze, setShowFreeze] = useState(false);
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
  const [dailyBackups, setDailyBackups] = useState([]);
  const [showFirstQuizBonusModal, setShowFirstQuizBonusModal] = useState(false);
  const pendingQuizLaunchRef = useRef(null);
  const mysteryImageDefinitions = getMysteryImageDefinitions(adminSettings?.customMysteryImages);

  useEffect(() => {
    if (!adminSettings) return;
    setSessionSize(adminSettings.prodQuestionCount || DEFAULT_SESSION_SIZE);
  }, [adminSettings]);

  const triggerEntranceAnim = useCallback((animId) => {
    if (animId === 'entrance-lightning') setShowLightning(true);
    else if (animId === 'entrance-stars') setShowStars(true);
    else if (animId === 'entrance-inferno') setShowInferno(true);
    else if (animId === 'entrance-freeze') setShowFreeze(true);
  }, []);

  // Drain pendingEntranceAnim immediately (plays while still in shop)
  useEffect(() => {
    if (!pendingEntranceAnim) return;
    triggerEntranceAnim(pendingEntranceAnim);
    setPendingEntranceAnim(null);
  }, [pendingEntranceAnim, triggerEntranceAnim]);

  const dismissFirstQuizBonusForToday = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem(getFirstQuizBonusDismissKey(childId), getToday());
    } catch {
      // ignore storage failures
    }
  }, [childId]);

  const hasDismissedFirstQuizBonusToday = useCallback(() => {
    if (typeof window === 'undefined') return false;
    try {
      return window.localStorage.getItem(getFirstQuizBonusDismissKey(childId)) === getToday();
    } catch {
      return false;
    }
  }, [childId]);

  const launchQuizWithFirstSessionModal = useCallback((launchFn) => {
    const isFirstQuizOfDay = progress?.streak?.lastActiveDate !== getToday();
    if (!isFirstQuizOfDay || hasDismissedFirstQuizBonusToday()) {
      launchFn();
      return;
    }
    pendingQuizLaunchRef.current = launchFn;
    setShowFirstQuizBonusModal(true);
  }, [hasDismissedFirstQuizBonusToday, progress]);

  const refreshDailyBackups = useCallback(async () => {
    const backups = await getDailyBackups(uid, childId);
    setDailyBackups(backups);
    return backups;
  }, [uid, childId]);

  const persistProgress = useCallback(async (nextProgress) => {
    const result = await saveProgress(nextProgress, uid, childId);
    if (!result?.success) {
      setSaveError(result?.error || "La progression n'a pas pu être sauvegardée.");
      return result;
    }
    setSaveError(null);
    return result;
  }, [uid, childId]);

  const handleDebugUpdateStreak = useCallback(async (streak, date) => {
    const next = { ...progress, streak: { ...progress.streak, current: streak, lastActiveDate: date } };
    setProgress(next);
    await persistProgress(next);
  }, [progress, persistProgress]);

  const handleDebugSetCoins = useCallback(async (coins) => {
    const next = { ...progress, coins };
    setProgress(next);
    await persistProgress(next);
  }, [progress, persistProgress]);

  const handleDebugRestoreBackup = useCallback(async (backup) => {
    const result = await restoreDailyBackup(backup, uid, childId);
    if (result?.success) {
      setProgress(result.progress);
      await refreshDailyBackups();
    }
  }, [uid, childId, refreshDailyBackups]);

  // Load progress on mount
  useEffect(() => {
    if (!uid || !childId) return;

    refreshDailyBackups();
    Promise.all([loadProgress(uid, childId), loadAdminSettings(uid, childId)]).then(async ([raw, settings]) => {
      setAdminSettings(settings);
      const definitions = getMysteryImageDefinitions(settings?.customMysteryImages);
      const { progress: migratedProgress } = migrateProgress(raw, definitions);
      let p = migratedProgress;

      p = applyDiamondDecay(p);
      const returnInfo = checkReturnAfterInactivity(p);
      if (returnInfo) {
        setReturnData(returnInfo);
        setScreen('return');
      }

      await persistProgress(p);
      setProgress(p);
      setLoading(false);

      const equippedTheme = p.shop?.equipped?.theme;
      if (equippedTheme) applyTheme(equippedTheme);
    });
  }, [uid, childId, persistProgress]);

  useEffect(() => {
    if (!uid || !childId) return;

    const debugChildName = getDebugChildName();
    if (debugChildName) {
      setChildName(debugChildName);
      return;
    }

    getChild(uid, childId)
      .then((child) => {
        if (!child) return;
        setChildName(String(child.name || '').trim());
      })
      .catch((error) => {
        console.error('Failed to load child profile:', error);
      });
  }, [uid, childId]);

  const handlePlay = useCallback((ruleId, mode) => {
    const rule = allRules.find(r => r.id === ruleId);
    if (!rule) return;

    const ruleProgress = progress.rules?.[ruleId];
    const sm2Review = !!(ruleProgress?.level >= 4 && ruleProgress.sm2 &&
      ruleProgress.sm2.nextReviewDate <= getToday());

    const quizMode = sm2Review ? 'direct' : (mode || determineQuizMode(ruleProgress));
    const questions = selectSessionQuestions(rule, ruleProgress, sessionSize);
    if (questions.length === 0) return;

    launchQuizWithFirstSessionModal(() => {
      setActiveRule(rule);
      setActiveMode(quizMode);
      setIsSM2Review(sm2Review);
      setSessionQuestions(questions);
      setPendingEvents([]);
      setScreen('quiz');
    });
  }, [launchQuizWithFirstSessionModal, progress, sessionSize]);

  const handleQuizFinish = useCallback((score, total, answers) => {
    const pct = Math.round((score / total) * 100);
    const ruleId = activeRule.id;
    const mode = activeMode;
    const wasSmR2Review = isSM2Review;
    const events = [];

    setProgress(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const today = getToday();
      const isSniperSession = ruleId === '__sniper__';

      if (!isSniperSession) {
        if (!next.rules[ruleId]) {
          next.rules[ruleId] = createDefaultRuleProgress();
        }
      }
      const rp = isSniperSession ? null : next.rules[ruleId];

      if (isSniperSession) {
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

      if (!isSniperSession && rp) {
        const currentShown = sessionQuestions.map(q => q.id);
        const previousShown = Array.isArray(rp.recentlyShown) ? rp.recentlyShown : [];
        rp.recentlyShown = [
          ...currentShown,
          ...previousShown.filter(id => !currentShown.includes(id)),
        ].slice(0, sessionSize * 2);
      }

      let sessionCoins = calculateCoins(score, total);
      const perfectSessionBonus = calculatePerfectSessionBonus(score, total);
      if (perfectSessionBonus > 0) {
        sessionCoins += perfectSessionBonus;
        events.push({ type: 'perfectSessionBonus', value: perfectSessionBonus });
      }

      const isFirstSessionToday = next.streak?.lastActiveDate !== today;
      if (isFirstSessionToday) {
        sessionCoins += 10; // FIRST_SESSION_BONUS
        events.push({ type: 'firstSessionOfDay', value: 10 });
      }

      if (isSniper) {
        sessionCoins = Math.round(sessionCoins * SNIPER_COIN_MULTIPLIER);
        events.push({ type: 'sniperBonus' });
      }

      if (hasDoubleCoinsActive(next)) {
        const baseSessionCoins = sessionCoins;
        sessionCoins *= 2;
        next.shop.activeBoosts.doubleCoinsBonusEarned = (next.shop.activeBoosts.doubleCoinsBonusEarned || 0) + baseSessionCoins;
        next.shop.activeBoosts.doubleCoinsRemainingSessions = Math.max((next.shop.activeBoosts.doubleCoinsRemainingSessions || 0) - 1, 0);
        next.shop.activeBoosts.doubleCoins = next.shop.activeBoosts.doubleCoinsRemainingSessions > 0;
        events.push({ type: 'doubleCoins' });
      }

      next.coins = (next.coins || 0) + sessionCoins;
      events.push({ type: 'coinsEarned', value: sessionCoins });

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

        if (rp.sm2.diamondHealth <= 0) {
          rp.level = 3;
          rp.sm2 = null;
          rp.directConsecutiveAbove90 = 0;
          events.push({ type: 'diamondBroken', value: activeRule.shortTitle || activeRule.title });
        }
      }

      if (!isSniperSession && !wasSmR2Review && rp) {
        const oldLevel = rp.level || 0;
        const levelResult = checkLevelUp(rp, mode, score, total);
        Object.assign(rp, levelResult.updatedProgress);

        if (levelResult.newLevel !== null && levelResult.newLevel > oldLevel) {
          rp.level = levelResult.newLevel;
          events.push({ type: 'levelUp', value: levelResult.newLevel, ruleTitle: activeRule.shortTitle || activeRule.title });

          if (levelResult.coinsEarned > 0) {
            next.coins += levelResult.coinsEarned;
            events.push({ type: 'levelMilestoneCoins', value: levelResult.coinsEarned, level: levelResult.newLevel });
          }

          if (levelResult.newLevel === 2 && oldLevel < 2) {
            events.push({ type: 'directUnlocked', value: activeRule.shortTitle || activeRule.title });
          }

          if (levelResult.newLevel === 3 && oldLevel < 3) {
            rp.recentTrophy = 'crown';
            events.push({ type: 'crown', value: activeRule.shortTitle || activeRule.title });
          }

          if (levelResult.newLevel === 4 && oldLevel < 4) {
            rp.sm2 = initRuleSM2();
            rp.recentTrophy = 'diamond';
            events.push({ type: 'diamond', value: activeRule.shortTitle || activeRule.title });
          }
        }
      }

      const streakResult = updateStreak(next);
      next.streak = streakResult.streak;
      if (streakResult.shieldUsed) {
        events.push({ type: 'shieldUsed', value: streakResult.streak.current });
      }

      if (!next.milestones) {
        next.milestones = {
          firstSession: false, streak7: false, streak14: false,
          streak30: false, streak60: false, streak100: false,
        };
      }

      const firstSessionCoins = awardMilestone(next.milestones, 'firstSession');
      if (firstSessionCoins > 0) {
        next.coins += firstSessionCoins;
        events.push({ type: 'milestone', value: 'firstSession', coins: firstSessionCoins });
      }

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

      persistProgress(next);
      return next;
    });

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

    if (!isSniper) {
      setLastSessionQuestions([...sessionQuestions]);
      setLastSessionRuleId(ruleId);
      setLastSessionMode(mode);
      setLastSessionScore(pct);
    } else {
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
  }, [activeRule, activeMode, isSM2Review, isSniper, persistProgress, sessionQuestions, sessionSize]);

  const handleEventsSeen = useCallback(() => {
    setPendingEvents([]);
  }, []);

  const handlePurchase = useCallback((itemId, cost) => {
    setProgress(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (next.coins < cost) return prev;

      if (!next.shop) {
        next.shop = {
          owned: [],
          equipped: { theme: null, flame: null, title: null, victoryAnimation: null },
          activeBoosts: { doubleCoins: false, doubleCoinsRemainingSessions: 0, doubleCoinsBonusEarned: 0, doubleCoinsLastPurchasedWeek: null },
          mysteryImages: createDefaultMysteryImagesState(),
          inventory: { revealHint: 0, rematch: 0, modeSniper: 0, questionMystery: 0 },
        };
      }
      if (!next.shop.activeBoosts) {
        next.shop.activeBoosts = { doubleCoins: false, doubleCoinsRemainingSessions: 0, doubleCoinsBonusEarned: 0, doubleCoinsLastPurchasedWeek: null };
      }
      next.shop.mysteryImages = normalizeMysteryImagesState(next.shop.mysteryImages, mysteryImageDefinitions);
      if (!next.shop.inventory) {
        next.shop.inventory = { revealHint: 0, rematch: 0, modeSniper: 0, questionMystery: 0 };
      }

      if (isMysteryPurchaseId(itemId)) {
        const imageId = getMysteryImageIdFromPurchaseId(itemId, mysteryImageDefinitions);
        if (!imageId || !canPurchaseMysteryImagePiece(next, imageId, undefined, mysteryImageDefinitions)) return prev;
        const result = purchaseMysteryImagePiece(next, imageId, undefined, mysteryImageDefinitions);
        if (!result.success) return prev;
        persistProgress(next);
        return next;
      }

      next.coins -= cost;
      if (itemId === 'streak-freeze') {
        next.shields = Math.min((next.shields || 0) + 1, 2);
      } else if (itemId === 'double-coins') {
        const currentWeek = getCurrentShopWeek();
        if (next.shop.activeBoosts.doubleCoinsLastPurchasedWeek === currentWeek) return prev;
        next.shop.activeBoosts.doubleCoinsRemainingSessions = (next.shop.activeBoosts.doubleCoinsRemainingSessions || 0) + DOUBLE_COINS_SESSION_COUNT;
        next.shop.activeBoosts.doubleCoinsBonusEarned = 0;
        next.shop.activeBoosts.doubleCoinsLastPurchasedWeek = currentWeek;
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
        if (!next.shop.owned.includes(itemId)) {
          next.shop.owned.push(itemId);
          if (itemId.startsWith('entrance-')) {
            setPendingEntranceAnim(itemId);
          }
        }
      }

      persistProgress(next);
      return next;
    });
  }, [mysteryImageDefinitions, persistProgress]);

  const handleEquip = useCallback((category, itemId) => {
    setProgress(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next.shop) return prev;
      if (!next.shop.equipped) {
        next.shop.equipped = { theme: null, flame: null, title: null, victoryAnimation: null };
      }
      next.shop.equipped[category] = itemId;
      persistProgress(next);
      if (category === 'theme') applyTheme(itemId);
      return next;
    });
  }, [persistProgress]);


  const handleSniper = useCallback(() => {
    if (!progress) return;
    const inventory = progress.shop?.inventory;
    if (!inventory || inventory.modeSniper <= 0) return;

    setProgress(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next.shop?.inventory || next.shop.inventory.modeSniper <= 0) return prev;
      next.shop.inventory.modeSniper -= 1;
      persistProgress(next);
      return next;
    });

    const questions = selectSniperQuestions(allRules, progress, SNIPER_SESSION_SIZE);
    if (questions.length === 0) return;

    const sniperRule = {
      id: '__sniper__',
      title: 'Mode Sniper',
      shortTitle: 'Sniper',
      choices: [],
      decisionAxes: [],
      questions: questions,
    };

    launchQuizWithFirstSessionModal(() => {
      setActiveRule(sniperRule);
      setActiveMode('direct');
      setIsSM2Review(false);
      setIsSniper(true);
      setSessionQuestions(questions);
      setPendingEvents([]);
      setScreen('quiz');
    });
  }, [launchQuizWithFirstSessionModal, persistProgress, progress]);

  const handleRematch = useCallback(() => {
    if (!progress || !lastSessionQuestions || !lastSessionRuleId) return;
    const inventory = progress.shop?.inventory;
    if (!inventory || inventory.rematch <= 0) return;

    setProgress(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (!next.shop?.inventory || next.shop.inventory.rematch <= 0) return prev;
      next.shop.inventory.rematch -= 1;
      persistProgress(next);
      return next;
    });

    const rule = allRules.find(r => r.id === lastSessionRuleId);
    if (!rule) return;

    launchQuizWithFirstSessionModal(() => {
      setActiveRule(rule);
      setActiveMode(lastSessionMode || 'direct');
      setIsSM2Review(false);
      setIsSniper(false);
      setSessionQuestions([...lastSessionQuestions]);
      setPendingEvents([]);
      setScreen('quiz');
    });
  }, [lastSessionMode, lastSessionQuestions, lastSessionRuleId, launchQuizWithFirstSessionModal, persistProgress, progress]);

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

  const handleReturnContinue = useCallback(() => {
    if (returnData?.streakLost || returnData?.streakSaveable) {
      setProgress(prev => {
        const next = { ...prev, streak: { ...prev.streak, current: 0 } };
        persistProgress(next);
        return next;
      });
    }
    setReturnData(null);
    setScreen('dashboard');
  }, [returnData, persistProgress]);

  const handleReturnSaveStreak = useCallback(() => {
    const { shieldsToUse = 0, costToBuy = 0 } = returnData || {};
    setProgress(prev => {
      const next = {
        ...prev,
        shields: (prev.shields || 0) - shieldsToUse,
        coins: (prev.coins || 0) - costToBuy,
        streak: { ...prev.streak, lastActiveDate: getToday(-1) },
      };
      persistProgress(next);
      return next;
    });
    setReturnData(null);
    setScreen('dashboard');
  }, [returnData, persistProgress]);


  const handleReturnSecretCodeSubmit = useCallback((rawCode) => {
    const enteredCode = normalizeSecretCode(rawCode);
    const parentalCode = progress?.parentalCode || {};
    const storedCode = normalizeSecretCode(adminSettings?.parentalCode);
    const now = Date.now();

    if (enteredCode.length !== SECRET_CODE_LENGTH) {
      return { ok: false, error: `Le code doit contenir ${SECRET_CODE_LENGTH} caractères.` };
    }

    if (parentalCode.lockedUntil && parentalCode.lockedUntil > now) {
      return { ok: false, error: 'Réessaie un peu plus tard.', lockedUntil: parentalCode.lockedUntil };
    }

    if (enteredCode !== storedCode) {
      const failedAttempts = (parentalCode.failedAttempts || 0) + 1;
      const lockedUntil = now + getSecretCodeLockDurationMs(failedAttempts);

      setProgress(prev => {
        const next = {
          ...prev,
          parentalCode: { ...prev.parentalCode, failedAttempts, lockedUntil },
        };
        persistProgress(next);
        return next;
      });

      return { ok: false, error: 'Code incorrect.', lockedUntil };
    }

    setProgress(prev => {
      const next = {
        ...prev,
        parentalCode: { ...prev.parentalCode, failedAttempts: 0, lockedUntil: 0 },
        streak: { ...prev.streak, lastActiveDate: getToday(-1) },
      };
      persistProgress(next);
      return next;
    });
    setReturnData(null);
    setScreen('dashboard');
    return { ok: true };
  }, [adminSettings, persistProgress, progress]);

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
      {showLightning && <LightningEntranceEffect onDone={() => setShowLightning(false)} />}
      {showStars && <StarsEntranceEffect onDone={() => setShowStars(false)} />}
      {showInferno && <InfernoEntranceEffect onDone={() => setShowInferno(false)} />}
      {showFreeze && <FreezeEntranceEffect onDone={() => setShowFreeze(false)} />}
      {saveError && (
        <div style={saveErrorStyle}>{saveError}</div>
      )}
      {showFirstQuizBonusModal && (
        <div style={firstQuizModalBackdropStyle}>
          <div style={firstQuizModalCardStyle}>
            <PopupCloseButton
              onClick={() => {
                pendingQuizLaunchRef.current = null;
                dismissFirstQuizBonusForToday();
                setShowFirstQuizBonusModal(false);
              }}
              top={12}
              right={12}
              size={38}
            />
            <div style={firstQuizBonusKickerStyle}>Bonus du jour</div>
            <div style={firstQuizBonusTitleStyle}>
              Bonus de 10 <span style={{ display: 'inline-flex', verticalAlign: 'middle', margin: '0 0.12em' }}><CoinIcon size={26} /></span> disponible !
            </div>
            <div style={{ fontSize: '0.9rem', lineHeight: 1.55, color: '#cbd5e1' }}>
              Termine ton premier quiz de la journée pour remporter ce bonus.
            </div>
            <div style={{ display: 'flex', gap: '0.7rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button type="button" onClick={() => { pendingQuizLaunchRef.current = null; dismissFirstQuizBonusForToday(); setShowFirstQuizBonusModal(false); }} style={secondaryBtnStyle}>
                Plus tard
              </button>
              <button type="button" onClick={() => {
                const launchFn = pendingQuizLaunchRef.current;
                pendingQuizLaunchRef.current = null;
                dismissFirstQuizBonusForToday();
                setShowFirstQuizBonusModal(false);
                if (launchFn) launchFn();
              }} style={primaryBtnStyle}>
                Commencer
              </button>
            </div>
          </div>
        </div>
      )}
      {content}
    </>
  );

  // Loading
  if (loading || !progress || !adminSettings) {
    return renderWithSaveError(
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg1)',
        backgroundImage: 'var(--app-page-overlay), var(--app-page-image)',
        backgroundSize: 'cover, cover',
        backgroundPosition: 'center, center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--color-accent)', fontSize: '1.2rem', fontWeight: 600,
        fontFamily: 'var(--font-body)',
      }}>
        Chargement…
      </div>
    );
  }

  // Return screen
  if (screen === 'return' && returnData) {
    return renderWithSaveError(
      <ReturnScreen
        progress={progress}
        streakLost={returnData.streakLost}
        streakSaveable={returnData.streakSaveable}
        shieldsToUse={returnData.shieldsToUse}
        shieldsToBuy={returnData.shieldsToBuy}
        costToBuy={returnData.costToBuy}
        coins={returnData.coins}
        previousStreak={returnData.previousStreak}
        daysMissed={returnData.daysMissed}
        diamondChanges={returnData.diamondChanges}
        onContinue={handleReturnContinue}
        onSaveStreak={handleReturnSaveStreak}
      />
    );
  }

  // Quiz screen
  if (screen === 'quiz' && activeRule) {
    const QuizComponent = activeMode === 'direct' ? QuizDirect : QuizGuided;
    const inventory = progress.shop?.inventory || { revealHint: 0, rematch: 0, modeSniper: 0, questionMystery: 0 };
    const hasDoubleCoinsActiveNow = hasDoubleCoinsActive(progress);
    const isFirstSessionOfDay = progress.streak?.lastActiveDate !== getToday();
    const ruleProgress = activeRule.id === '__sniper__' ? null : progress.rules?.[activeRule.id];
    const victoryAnimationId = progress.shop?.equipped?.victoryAnimation || null;
    return renderWithSaveError(
      <QuizComponent
        rule={activeRule}
        questions={sessionQuestions}
        onFinish={handleQuizFinish}
        inventory={inventory}
        onUseItem={handleUseItem}
        isSniper={isSniper}
        hasDoubleCoinsActive={hasDoubleCoinsActiveNow}
        allRules={allRules}
        isFirstSessionOfDay={isFirstSessionOfDay}
        ruleProgress={ruleProgress}
        streak={progress.streak}
        victoryAnimationId={victoryAnimationId}
        shopOwned={progress.shop?.owned || []}
        onClose={handleCloseQuiz}
      />
    );
  }

  // Shop screen
  if (screen === 'shop') {
    return renderWithSaveError(
      <Shop
        progress={progress}
        adminSettings={adminSettings}
        onPurchase={handlePurchase}
        onEquip={handleEquip}
        onClose={() => setScreen('dashboard')}
      />
    );
  }

  // Dashboard
  const sortedRules = sortRulesByPriority(allRules, progress.rules || {});
  const canRematch = !!(lastSessionQuestions && lastSessionScore !== null && lastSessionScore < 80
    && (progress.shop?.inventory?.rematch || 0) > 0);

  return renderWithSaveError(
    <Dashboard
      rules={sortedRules}
      progress={progress}
      childName={childName}
      onPlay={handlePlay}
      onOpenShop={() => setScreen('shop')}
      pendingEvents={pendingEvents}
      onEventsSeen={handleEventsSeen}
      onSniper={handleSniper}
      onRematch={handleRematch}
      canRematch={canRematch}
      lastSessionRuleId={lastSessionRuleId}
      lastSessionScore={lastSessionScore}
      onDebugUpdateStreak={handleDebugUpdateStreak}
      onDebugSetCoins={handleDebugSetCoins}
      dailyBackups={dailyBackups}
      onDebugRestoreBackup={handleDebugRestoreBackup}
      onTriggerEntranceAnim={triggerEntranceAnim}
    />
  );
}

const saveErrorStyle = {
  position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
  zIndex: 2000, maxWidth: 640, width: 'calc(100% - 2rem)',
  padding: '0.85rem 1rem', borderRadius: 14,
  border: '1px solid rgba(248,113,113,0.4)', background: 'rgba(127,29,29,0.95)',
  color: '#fee2e2', boxShadow: '0 8px 30px rgba(0,0,0,0.35)',
  textAlign: 'center', fontSize: '0.9rem', fontWeight: 600,
};

const firstQuizModalBackdropStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.62)',
  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  zIndex: 1200, padding: '1rem',
};

const firstQuizModalCardStyle = {
  width: 'min(460px, calc(100vw - 2rem))',
  background: 'linear-gradient(180deg, rgba(var(--color-bg1-rgb),0.98), rgba(var(--color-bg2-rgb),0.94))',
  border: '1px solid rgba(var(--color-accent-rgb),0.2)',
  borderRadius: 24, padding: '1.35rem 1.25rem 1.15rem',
  boxShadow: '0 24px 60px rgba(0,0,0,0.38)',
  position: 'relative', display: 'grid', gap: '0.75rem', textAlign: 'center',
};

const firstQuizBonusKickerStyle = {
  fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.12em',
  color: 'var(--color-accent)', fontWeight: 800, marginTop: '0.25rem',
};

const firstQuizBonusTitleStyle = {
  fontSize: '1.3rem', lineHeight: 1.25, fontWeight: 900, color: '#fff',
};

const secondaryBtnStyle = {
  border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14,
  padding: '0.8rem 1rem', background: 'rgba(255,255,255,0.05)',
  color: '#cbd5e1', fontSize: '0.88rem', fontWeight: 800, cursor: 'pointer',
};

const primaryBtnStyle = {
  border: 'none', borderRadius: 14, padding: '0.8rem 1.1rem',
  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
  color: '#fff', fontSize: '0.88rem', fontWeight: 900, cursor: 'pointer',
  boxShadow: '0 12px 28px rgba(var(--color-primary-rgb),0.24)',
};

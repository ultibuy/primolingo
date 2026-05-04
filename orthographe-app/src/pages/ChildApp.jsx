import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { useParams } from 'react-router-dom';
import VersionFooter from '../components/ui/VersionFooter.jsx';
import '../index.css';
import { captureException } from '../services/sentry.js';
import posthog from '../services/analytics.js';

// Context
import { useAuth } from '../contexts/AuthContext.jsx';
import { getChild, loadParentalPin, updateChild } from '../services/store.js';
import { verifyPin } from '../services/pin-crypto.js';

// Content
import { allRules } from '../content/loader.js';
import { allDictees, getDicteeWordsForLevel, LEVELS } from '../content/dicteesLoader.js';
import { getCharacterForRule } from '../data/shopCharacters.js';

// Engine
import { updateStatsHistory } from '../engine/stats.js';
import { selectSessionQuestions } from '../engine/session.js';
import { calculateDiamondHealth, getToday, parseLocalDate } from '../engine/sm2.js';
import { createDefaultCoaching } from '../engine/coaching.js';
import { processSessionResult } from '../engine/scoring.js';
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
  clearCurrentStoredProgress,
} from '../store/persistence.js';

// Components
import Dashboard from '../components/Dashboard.jsx';
import LightningEntranceEffect from '../components/LightningEntranceEffect.jsx';
import StarsEntranceEffect from '../components/StarsEntranceEffect.jsx';
import InfernoEntranceEffect from '../components/InfernoEntranceEffect.jsx';
import FreezeEntranceEffect from '../components/FreezeEntranceEffect.jsx';
import QuizGuided from '../components/QuizGuided.jsx';
import QuizDirect from '../components/QuizDirect.jsx';
import ReturnScreen from '../components/ReturnScreen.jsx';
import DicteesPage from '../pages/DicteesPage.jsx';
import DicteeQuizGuided from '../components/DicteeQuizGuided.jsx';
import DicteeQuizReconstruct from '../components/DicteeQuizReconstruct.jsx';
import CoinIcon from '../components/CoinIcon.jsx';
import { GiftIcon } from '../components/icons/ProductIcons.jsx';
import RewardAmount from '../components/rewards/RewardAmount.jsx';
import PopupModal from '../components/PopupModal.jsx';
import AppLoadingScreen from '../components/AppLoadingScreen.jsx';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const DEFAULT_SESSION_SIZE = 20;
const GRAMMAR_IDS = new Set(allRules.map(r => r.id));
const DICTEE_IDS  = new Set(allDictees.flatMap(d => LEVELS.map(l => `${d.id}-${l}`)));
const INACTIVITY_DAYS = 2;
const PIN_LENGTH = 4;
const PIN_BASE_LOCK_MS = 15000;
const Shop = lazy(() => import('../components/Shop.jsx'));

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

function getPinLockDurationMs(failedAttempts) {
  if (failedAttempts <= 0) return 0;
  return Math.min(PIN_BASE_LOCK_MS * (2 ** (failedAttempts - 1)), 60 * 60 * 1000);
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
      inventory: { questionMystery: 0 },
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
    next.shop.inventory = { questionMystery: 0 };
  }
  if (next.shields === undefined) next.shields = 0;
  if (next.coins === undefined) next.coins = 0;
  // Migrate old parentalCode to pinLockout
  if (next.parentalCode) {
    if (!next.pinLockout) {
      next.pinLockout = {
        failedAttempts: next.parentalCode.failedAttempts || 0,
        lockedUntil: next.parentalCode.lockedUntil || 0,
      };
    }
    delete next.parentalCode;
  }
  if (!next.pinLockout || typeof next.pinLockout !== 'object') {
    next.pinLockout = { failedAttempts: 0, lockedUntil: 0 };
  }

  delete next.firstQuizDone;
  delete next.crowns;
  delete next.diamonds;

  if (!next.coaching) {
    next.coaching = createDefaultCoaching();
    migrated = true;
  }

  // Bootstrap statsHistory for existing accounts that don't have it yet.
  // Creates one initial snapshot from the current (all-time) progress data.
  if (!Array.isArray(next.statsHistory)) {
    updateStatsHistory(next, GRAMMAR_IDS, DICTEE_IDS);
    migrated = true;
  }

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
  const uid = user?.uid;

  const [progress, setProgress] = useState(null);
  const [childName, setChildName] = useState('');
  const [childAvatar, setChildAvatar] = useState('');
  const [adminSettings, setAdminSettings] = useState(null);
  const [sessionSize, setSessionSize] = useState(DEFAULT_SESSION_SIZE);
  const [screen, setScreen] = useState('dashboard');
  const [shopInitialTab, setShopInitialTab] = useState(null);
  const [shopInitialSection, setShopInitialSection] = useState(null);
  const [dashboardTab, setDashboardTab] = useState(null);
  const [pendingEntranceAnim, setPendingEntranceAnim] = useState(null);
  const [showLightning, setShowLightning] = useState(false);
  const [showStars, setShowStars] = useState(false);
  const [showInferno, setShowInferno] = useState(false);
  const [showFreeze, setShowFreeze] = useState(false);
  const [activeRule, setActiveRule] = useState(null);
  const [activeMode, setActiveMode] = useState('guided');
  const [isSM2Review, setIsSM2Review] = useState(false);
  const [isDicteeReview, setIsDicteeReview] = useState(false);
  const [sessionQuestions, setSessionQuestions] = useState([]);
  const [pendingEvents, setPendingEvents] = useState([]);
  const [returnData, setReturnData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeDictee, setActiveDictee] = useState(null);
  const [activeDicteeLevel, setActiveDicteeLevel] = useState(null);
  const [dicteeWords, setDicteeWords] = useState([]);
  const [saveError, setSaveError] = useState(null);
  const [parentalPin, setParentalPin] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [loadRetryCount, setLoadRetryCount] = useState(0);
  const loadSucceededRef = useRef(false);
  const [dailyBackups, setDailyBackups] = useState([]);
  const [showFirstQuizBonusModal, setShowFirstQuizBonusModal] = useState(false);
  const pendingQuizLaunchRef = useRef(null);
  const mysteryImageDefinitions = getMysteryImageDefinitions(adminSettings?.customMysteryImages);

  useEffect(() => {
    if (!adminSettings) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSessionSize(adminSettings.prodQuestionCount || DEFAULT_SESSION_SIZE);
  }, [adminSettings]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    window.__ORTHO_SESSION_SIZE__ = sessionSize || DEFAULT_SESSION_SIZE;
    return undefined;
  }, [sessionSize]);

  const triggerEntranceAnim = useCallback((animId) => {
    if (animId === 'entrance-lightning') setShowLightning(true);
    else if (animId === 'entrance-stars') setShowStars(true);
    else if (animId === 'entrance-inferno') setShowInferno(true);
    else if (animId === 'entrance-freeze') setShowFreeze(true);
  }, []);

  // Drain pendingEntranceAnim immediately (plays while still in shop)
  useEffect(() => {
    if (!pendingEntranceAnim) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
    if (!loadSucceededRef.current) {
      console.warn('persistProgress blocked — initial load has not succeeded yet');
      return { success: false, error: 'Chargement initial incomplet.' };
    }
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

  const handleFlagQuestion = useCallback((question, rule, unflag) => {
    setProgress(prev => {
      const flags = prev.flaggedQuestions || [];
      const ruleId = question._ruleId || rule.id;
      if (unflag) {
        const next = { ...prev, flaggedQuestions: flags.filter(f => !(f.questionId === question.id && f.ruleId === ruleId)) };
        persistProgress(next);
        return next;
      }
      const alreadyFlagged = flags.some(f => f.questionId === question.id && f.ruleId === ruleId);
      if (alreadyFlagged) return prev;
      const next = {
        ...prev,
        flaggedQuestions: [...flags, {
          questionId: question.id,
          ruleId,
          ruleTitle: rule.title || rule.id,
          sentence: question.example || `${question.before || ''}___${question.after || ''}`,
          answer: question.answer || question.word || '',
          flaggedAt: new Date().toISOString(),
        }],
      };
      persistProgress(next);
      return next;
    });
  }, [persistProgress]);

  const handleDebugRestoreBackup = useCallback(async (backup) => {
    const result = await restoreDailyBackup(backup, uid, childId);
    if (result?.success) {
      setProgress(result.progress);
      await refreshDailyBackups();
    }
  }, [uid, childId, refreshDailyBackups]);

  const handleDebugClearProgress = useCallback(async () => {
    const result = await clearCurrentStoredProgress(uid, childId);
    if (result?.success) {
      setProgress(createDefaultProgress());
      await refreshDailyBackups();
    }
    return result;
  }, [uid, childId, refreshDailyBackups]);

  // Load progress on mount
  useEffect(() => {
    if (!uid || !childId) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadError(null);
    loadSucceededRef.current = false;

    refreshDailyBackups().catch((error) => captureException(error));
    Promise.all([loadProgress(uid, childId), loadAdminSettings(uid, childId), loadParentalPin(uid)]).then(async ([raw, settings, pin]) => {
      if (cancelled) return;
      setAdminSettings(settings);
      setParentalPin(pin);
      const definitions = getMysteryImageDefinitions(settings?.customMysteryImages);
      const { progress: migratedProgress } = migrateProgress(raw, definitions);
      let p = migratedProgress;

      p = applyDiamondDecay(p);
      const returnInfo = checkReturnAfterInactivity(p);
      if (returnInfo) {
        setReturnData(returnInfo);
        setScreen('return');
      }

      // Mark load as successful BEFORE persisting, so persistProgress is unlocked.
      loadSucceededRef.current = true;

      // Only persist on load if the document existed in Firestore (raw !== null).
      // If raw is null the store returned nothing — persisting would write a blank
      // profile and permanently erase any data that was there.
      setProgress(p);
      setLoading(false);

      const equippedTheme = p.shop?.equipped?.theme;
      if (equippedTheme) applyTheme(equippedTheme);

      if (raw !== null) {
        persistProgress(p).catch((error) => captureException(error));
      }
    }).catch((error) => {
      if (cancelled) return;
      captureException(error);
      setLoadError(error?.message || 'Impossible de charger la progression.');
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [uid, childId, persistProgress, loadRetryCount]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!uid || !childId) return;

    const debugChildName = getDebugChildName();
    if (debugChildName) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setChildName(debugChildName);
      return;
    }

    getChild(uid, childId)
      .then((child) => {
        if (!child) return;
        setChildName(String(child.name || '').trim());
        setChildAvatar(child.avatar || '');
      })
      .catch((error) => {
        captureException(error);
      });
  }, [uid, childId]);

  const handleAvatarChange = useCallback(async (emoji) => {
    setChildAvatar(emoji);
    await updateChild(uid, childId, { avatar: emoji });
  }, [uid, childId]);

  const handlePlay = useCallback((ruleId, mode) => {
    const rule = allRules.find(r => r.id === ruleId);
    if (!rule) return;

    const ruleProgress = progress.rules?.[ruleId];
    const sm2Review = !!(ruleProgress?.level >= 4 && ruleProgress.sm2 &&
      ruleProgress.sm2.nextReviewDate <= getToday());

    const quizMode = sm2Review ? 'direct' : (mode || determineQuizMode(ruleProgress));
    const questions = selectSessionQuestions(rule, ruleProgress, sessionSize, quizMode);
    if (questions.length === 0) return;

    posthog.capture('quiz_session_started', {
      rule_id: ruleId,
      rule_title: rule.shortTitle || rule.title,
      mode: quizMode,
    });
    launchQuizWithFirstSessionModal(() => {
      setActiveRule(rule);
      setActiveMode(quizMode);
      setIsSM2Review(sm2Review);
      setSessionQuestions(questions);
      setPendingEvents([]);
      setScreen('quiz');
    });
  }, [launchQuizWithFirstSessionModal, progress, sessionSize]);

  // Shared helper: clear all recentTrophy flags after 5 seconds (crown/diamond glow)
  const clearRecentTrophies = useCallback(() => {
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
  }, [persistProgress]);

  const handleQuizFinish = useCallback((score, total, answers) => {
    const ruleId = activeRule.id;
    const mode = activeMode;
    const wasSmR2Review = isSM2Review;
    const events = [];
    let needsTrophyClear = false;

    setProgress(prev => {
      const next = JSON.parse(JSON.stringify(prev));

      if (!next.rules[ruleId]) next.rules[ruleId] = createDefaultRuleProgress();
      const rp = next.rules[ruleId];

      for (const ans of answers) {
        if (!rp.questionStats) rp.questionStats = {};
        const qs = rp.questionStats[ans.questionId] || { timesShown: 0, timesCorrect: 0 };
        qs.timesShown += 1;
        if (ans.correct) qs.timesCorrect += 1;
        rp.questionStats[ans.questionId] = qs;
      }

      // Keep recently-shown ring buffer for session variety
      const currentShown = sessionQuestions.map(q => q.id);
      const previousShown = Array.isArray(rp.recentlyShown) ? rp.recentlyShown : [];
      rp.recentlyShown = [
        ...currentShown,
        ...previousShown.filter(id => !currentShown.includes(id)),
      ].slice(0, sessionSize * 2);

      const result = processSessionResult(next, rp, {
        mode,
        score,
        total,
        wasReview: wasSmR2Review,
        title: activeRule.shortTitle || activeRule.title,
      });

      events.push(...result.events);
      if (result.hasNewTrophy) needsTrophyClear = true;

      // Track grammar vs dictée per-day (used by chart instead of cumulative deltas)
      next.dailyActivity.grammarCount = (next.dailyActivity.grammarCount || 0) + 1;

      updateStatsHistory(next, GRAMMAR_IDS, DICTEE_IDS);
      persistProgress(next);
      return next;
    });

    if (needsTrophyClear) clearRecentTrophies();

    posthog.capture('quiz_session_completed', {
      rule_id: activeRule.id,
      rule_title: activeRule.shortTitle || activeRule.title,
      score,
      total,
      accuracy: total > 0 ? Math.round((score / total) * 100) : 0,
      mode: activeMode,
    });
    setPendingEvents(events);
    setScreen('dashboard');
    setActiveRule(null);
    setActiveMode('guided');
    setIsSM2Review(false);
    setSessionQuestions([]);
  }, [activeRule, activeMode, isSM2Review, persistProgress, sessionQuestions, sessionSize, clearRecentTrophies]);

  // ─── Dictée handlers ─────────────────────────────────────────
  const handleDicteePlay = useCallback((dictee, level) => {
    const allWords = getDicteeWordsForLevel(dictee, level);
    if (allWords.length === 0) return;
    const quizId = `${dictee.id}-${level}`;
    const ruleProgress = progress.rules?.[quizId];
    const internalLevel = ruleProgress?.level || 0;
    const isReconstruct = internalLevel >= 2;
    const DICTEE_SESSION_SIZE = isReconstruct ? 10 : 20;
    const shuffled = [...allWords].sort(() => Math.random() - 0.5);
    const words = shuffled.slice(0, DICTEE_SESSION_SIZE);
    // SM-2 review: level 4+ with overdue review date → reconstruct mode
    const isReview = internalLevel >= 4 && ruleProgress?.sm2 &&
      ruleProgress.sm2.nextReviewDate <= getToday();
    posthog.capture('dictee_session_started', { dictee_id: dictee.id, level });
    setActiveDictee(dictee);
    setActiveDicteeLevel(level);
    setDicteeWords(words);
    setIsDicteeReview(isReview);
    setActiveMode(internalLevel >= 2 ? 'reconstruct' : 'guided');
    setScreen('dictee-quiz');
  }, [progress]);

  const handleDicteeFinish = useCallback((score, total, _answers) => {
    const quizId = `${activeDictee.id}-${activeDicteeLevel}`;
    const wasDicteeReview = isDicteeReview;
    const events = [];
    let needsTrophyClear = false;

    setProgress(prev => {
      const next = JSON.parse(JSON.stringify(prev));

      if (!next.rules[quizId]) next.rules[quizId] = createDefaultRuleProgress();
      const rp = next.rules[quizId];
      const mode = activeMode === 'reconstruct' ? 'direct' : 'guided';

      // Shared: SM-2, level-up, coins, streak, milestones
      const result = processSessionResult(next, rp, {
        mode,
        score,
        total,
        wasReview: wasDicteeReview,
        title: activeDictee.title,
      });

      events.push(...result.events);
      if (result.hasNewTrophy) needsTrophyClear = true;

      // Track grammar vs dictée per-day (used by chart instead of cumulative deltas)
      next.dailyActivity.dicteeCount = (next.dailyActivity.dicteeCount || 0) + 1;

      updateStatsHistory(next, GRAMMAR_IDS, DICTEE_IDS);
      persistProgress(next);
      return next;
    });

    if (needsTrophyClear) clearRecentTrophies();
    if (events.length > 0) setPendingEvents(events);

    posthog.capture('dictee_session_completed', {
      dictee_id: activeDictee.id,
      level: activeDicteeLevel,
      score,
      total,
    });
    setScreen('dashboard');
    setDashboardTab('dictee');
    setActiveDictee(null);
    setActiveDicteeLevel(null);
    setDicteeWords([]);
    setIsDicteeReview(false);
  }, [activeDictee, activeDicteeLevel, activeMode, isDicteeReview, persistProgress, clearRecentTrophies]);

  const handleEventsSeen = useCallback(() => {
    setPendingEvents([]);
  }, []);

  const handlePurchase = useCallback((itemId, cost) => {
    posthog.capture('shop_item_purchased', { item_id: itemId, cost });
    setProgress(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      if (next.coins < cost) return prev;

      if (!next.shop) {
        next.shop = {
          owned: [],
          equipped: { theme: null, flame: null, title: null, victoryAnimation: null },
          activeBoosts: { doubleCoins: false, doubleCoinsRemainingSessions: 0, doubleCoinsBonusEarned: 0, doubleCoinsLastPurchasedWeek: null },
          mysteryImages: createDefaultMysteryImagesState(),
          inventory: { questionMystery: 0 },
        };
      }
      if (!next.shop.activeBoosts) {
        next.shop.activeBoosts = { doubleCoins: false, doubleCoinsRemainingSessions: 0, doubleCoinsBonusEarned: 0, doubleCoinsLastPurchasedWeek: null };
      }
      next.shop.mysteryImages = normalizeMysteryImagesState(next.shop.mysteryImages, mysteryImageDefinitions);
      if (!next.shop.inventory) {
        next.shop.inventory = { questionMystery: 0 };
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
      } else if (itemId === 'question-mystery') {
        next.shop.inventory.questionMystery = (next.shop.inventory.questionMystery || 0) + 1;
      } else {
        if (!next.shop.owned.includes(itemId)) {
          next.shop.owned.push(itemId);
          if (itemId.startsWith('entrance-')) {
            setPendingEntranceAnim(itemId);
          }
          // Buying a character auto-includes the 3 base emotions
          if (itemId.startsWith('char-') && !itemId.includes('-', 5)) {
            const charId = itemId.slice(5);
            for (const emoId of ['walk', 'sleep', 'sit']) {
              const emoItemId = `char-${charId}-${emoId}`;
              if (!next.shop.owned.includes(emoItemId)) next.shop.owned.push(emoItemId);
            }
          }
        }
      }

      persistProgress(next);
      return next;
    });
  }, [mysteryImageDefinitions, persistProgress]);

  const handleBuyEmotion = useCallback((charId, emotionId) => {
    handlePurchase(`char-${charId}-${emotionId}`, 200);
  }, [handlePurchase]);

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


  const handleReturnPinSubmit = useCallback(async (enteredPin) => {
    const lockout = progress?.pinLockout || { failedAttempts: 0, lockedUntil: 0 };
    const now = Date.now();

    if (enteredPin.length !== PIN_LENGTH) {
      return { ok: false, error: `Le code doit contenir ${PIN_LENGTH} chiffres.` };
    }

    if (lockout.lockedUntil && lockout.lockedUntil > now) {
      return { ok: false, error: 'Réessaie un peu plus tard.', lockedUntil: lockout.lockedUntil };
    }

    // parentalPin is { salt, hash } — verify with crypto
    const pinOk = parentalPin?.salt && parentalPin?.hash
      ? await verifyPin(enteredPin, parentalPin.salt, parentalPin.hash)
      : enteredPin === parentalPin; // fallback for legacy plain-text pins

    if (!pinOk) {
      const failedAttempts = (lockout.failedAttempts || 0) + 1;
      const lockedUntil = now + getPinLockDurationMs(failedAttempts);

      setProgress(prev => {
        const next = {
          ...prev,
          pinLockout: { failedAttempts, lockedUntil },
        };
        persistProgress(next);
        return next;
      });

      return { ok: false, error: 'Code incorrect.', lockedUntil };
    }

    setProgress(prev => {
      const next = {
        ...prev,
        pinLockout: { failedAttempts: 0, lockedUntil: 0 },
        streak: { ...prev.streak, lastActiveDate: getToday(-1) },
      };
      persistProgress(next);
      return next;
    });
    setReturnData(null);
    setScreen('dashboard');
    return { ok: true };
  }, [parentalPin, persistProgress, progress]);

  const handleCloseQuiz = useCallback(() => {
    setScreen('dashboard');
    setActiveRule(null);
    setActiveMode('guided');
    setIsSM2Review(false);
    setSessionQuestions([]);
    setPendingEvents([]);
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
      {showFirstQuizBonusModal && (() => {
        const isWelcome = !progress?.milestones?.firstSession;
        const bonusAmount = isWelcome ? 200 : 10;
        return (
          <PopupModal
            onClose={() => {
              pendingQuizLaunchRef.current = null;
              dismissFirstQuizBonusForToday();
              setShowFirstQuizBonusModal(false);
            }}
            ariaLabel={isWelcome ? 'Bonus de bienvenue' : 'Bonus du jour'}
            zIndex={1200}
            overlayStyle={firstQuizModalBackdropStyle}
            panelStyle={firstQuizModalCardStyle}
            closeButtonProps={{ size: 38 }}
          >
              <div style={{ marginBottom: '0.3rem', display: 'flex', justifyContent: 'center' }}><GiftIcon size={40} color="var(--color-primary)" /></div>
              <div style={firstQuizBonusKickerStyle}>{isWelcome ? 'Bienvenue !' : 'Bonus du jour'}</div>
              <div style={firstQuizBonusTitleStyle}>
                {isWelcome ? 'Bonus de bienvenue : ' : 'Bonus de '}<RewardAmount value={bonusAmount} unit="coins" size="md" /> disponible !
              </div>
              <div style={{ fontSize: '0.9rem', lineHeight: 1.55, color: '#cbd5e1' }}>
                {isWelcome
                  ? <>Pour démarrer ton aventure, termine ton premier quiz avec au moins <strong style={{ color: '#fbbf24' }}>{Math.ceil(sessionSize * 0.6)} bonnes réponses sur {sessionSize}</strong> et remporte ce bonus.</>
                  : <>Termine ton premier quiz de la journée avec au moins <strong style={{ color: '#fbbf24' }}>{Math.ceil(sessionSize * 0.6)} bonnes réponses sur {sessionSize}</strong> pour remporter ce bonus.</>
                }
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
          </PopupModal>
        );
      })()}
      {content}
    </>
  );

  // Load error — show retry screen, do NOT render the app with default progress
  if (loadError) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg1)',
        backgroundImage: 'var(--app-page-overlay)',
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-body)',
      }}>
        <div style={{
          background: 'rgba(255,255,255,0.06)', borderRadius: 20,
          padding: '2rem 2.2rem', maxWidth: 400, textAlign: 'center',
          border: '1px solid rgba(248,113,113,0.3)',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ color: '#f87171', fontSize: '1.1rem', margin: '0 0 0.8rem' }}>
            Erreur de chargement
          </h2>
          <p style={{ color: '#d1d5db', fontSize: '0.85rem', lineHeight: 1.5, margin: '0 0 1.2rem' }}>
            Impossible de charger ta progression. Vérifie ta connexion internet et réessaye.
          </p>
          <button
            type="button"
            onClick={() => { setLoading(true); setLoadError(null); setLoadRetryCount(c => c + 1); }}
            style={{
              padding: '0.7rem 1.5rem', borderRadius: 10, border: 'none',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              color: '#fff', fontSize: '0.95rem', fontWeight: 700, cursor: 'pointer',
            }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Loading
  if (loading || !progress || !adminSettings) {
    return renderWithSaveError(
      <AppLoadingScreen />
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
        onPinSubmit={handleReturnPinSubmit}
        pinLockout={progress?.pinLockout}
        hasPinSetup={!!parentalPin}
      />
    );
  }

  // Quiz screen
  if (screen === 'quiz' && activeRule) {
    const QuizComponent = activeMode === 'direct' ? QuizDirect : QuizGuided;
    const inventory = progress.shop?.inventory || { questionMystery: 0 };
    const hasDoubleCoinsActiveNow = hasDoubleCoinsActive(progress);
    const isFirstSessionOfDay = progress.streak?.lastActiveDate !== getToday();
    const ruleProgress = progress.rules?.[activeRule.id];
    const quizCharacterId = getCharacterForRule(activeRule.id, allRules.map(r => r.id), progress.shop?.owned || []);
    const totalSessionsCompleted = Object.values(progress.rules || {}).reduce(
      (sum, rp) => sum + (rp.guidedSessionsCompleted || 0) + (rp.directSessionsCompleted || 0), 0
    );
    const isFirstEverSession = totalSessionsCompleted === 0;
    const isWelcomeBonus = !progress?.milestones?.firstSession;
    return renderWithSaveError(
      <QuizComponent
        rule={activeRule}
        characterId={quizCharacterId}
        questions={sessionQuestions}
        onFinish={handleQuizFinish}
        inventory={inventory}
        hasDoubleCoinsActive={hasDoubleCoinsActiveNow}
        allRules={allRules}
        isFirstSessionOfDay={isFirstSessionOfDay}
        isFirstEverSession={isFirstEverSession}
        firstSessionBonusAmount={isFirstSessionOfDay ? (isWelcomeBonus ? 200 : 10) : 0}
        ruleProgress={ruleProgress}
        streak={progress.streak}
        milestones={progress.milestones}
        shopOwned={progress.shop?.owned || []}
        onBuyEmotion={handleBuyEmotion}
        coins={progress.coins || 0}
        onClose={handleCloseQuiz}
        onFlagQuestion={handleFlagQuestion}
      />
    );
  }

  // Dictées list screen
  if (screen === 'dictees') {
    return renderWithSaveError(
      <DicteesPage
        progress={progress}
        onPlay={handleDicteePlay}
        onBack={() => setScreen('dashboard')}
      />
    );
  }

  // Dictée quiz screen
  if (screen === 'dictee-quiz' && activeDictee) {
    const quizId = `${activeDictee.id}-${activeDicteeLevel}`;
    const ruleProgress = progress.rules?.[quizId];
    const DicteeQuizComponent = activeMode === 'reconstruct' ? DicteeQuizReconstruct : DicteeQuizGuided;
    const dicteeCharacterId = getCharacterForRule(activeDictee.id, allDictees.map(d => d.id), progress.shop?.owned || []);
    const dicteeSessionsTotal = Object.values(progress.rules || {}).reduce(
      (sum, rp) => sum + (rp.guidedSessionsCompleted || 0) + (rp.directSessionsCompleted || 0), 0
    );
    return renderWithSaveError(
      <DicteeQuizComponent
        dictee={activeDictee}
        words={dicteeWords}
        onFinish={handleDicteeFinish}
        onClose={() => { setScreen('dashboard'); setDashboardTab('dictee'); setActiveDictee(null); }}
        characterId={dicteeCharacterId}
        hasDoubleCoinsActive={hasDoubleCoinsActive(progress)}
        isFirstSessionOfDay={progress.streak?.lastActiveDate !== getToday()}
        isFirstEverSession={dicteeSessionsTotal === 0}
        ruleProgress={ruleProgress}
        streak={progress.streak}
        milestones={progress.milestones}
        shopOwned={progress.shop?.owned || []}
        onBuyEmotion={handleBuyEmotion}
        coins={progress.coins || 0}
        onFlagQuestion={handleFlagQuestion}
      />
    );
  }

  // Shop screen
  if (screen === 'shop') {
    return renderWithSaveError(
      <Suspense fallback={<div style={screenLoadingStyle}>Chargement de la boutique...</div>}>
        <Shop
          progress={progress}
          adminSettings={adminSettings}
          childName={childName}
          onPurchase={handlePurchase}
          onEquip={handleEquip}
          onClose={() => setScreen('dashboard')}
          initialTab={shopInitialTab}
          initialSection={shopInitialSection}
        />
      </Suspense>
    );
  }

  // Dashboard
  const sortedRules = sortRulesByPriority(allRules, progress.rules || {});

  return renderWithSaveError(
    <>
      <Dashboard
        rules={sortedRules}
        progress={progress}
        childName={childName}
        childAvatar={childAvatar}
        onAvatarChange={handleAvatarChange}
        onPlay={handlePlay}
        onOpenShop={(tab, section) => { setShopInitialTab(tab || null); setShopInitialSection(section || null); setScreen('shop'); }}
        onOpenDictees={() => setScreen('dictees')}
        pendingEvents={pendingEvents}
        onEventsSeen={handleEventsSeen}
        onDebugUpdateStreak={handleDebugUpdateStreak}
        onDebugSetCoins={handleDebugSetCoins}
        onDebugClearProgress={handleDebugClearProgress}
        dailyBackups={dailyBackups}
        onDebugRestoreBackup={handleDebugRestoreBackup}
        onTriggerEntranceAnim={triggerEntranceAnim}
        sessionSize={sessionSize}
        onDebugSetSessionSize={setSessionSize}
        onPlayDictee={handleDicteePlay}
        initialTab={dashboardTab}
        onTabChange={setDashboardTab}
        parentalPin={parentalPin}
        onProgressChange={(next) => {
          setProgress(next);
          persistProgress(next);
        }}
      />
      <VersionFooter />
    </>
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

const screenLoadingStyle = {
  minHeight: '100vh',
  display: 'grid',
  placeItems: 'center',
  background: 'linear-gradient(180deg, var(--color-bg1), var(--color-bg2))',
  color: '#e5e7eb',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  fontWeight: 900,
};

const firstQuizModalBackdropStyle = {
  background: 'rgba(0,0,0,0.62)',
  backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
  padding: '1rem',
};

const firstQuizModalCardStyle = {
  width: 'min(460px, calc(100vw - 2rem))',
  background: 'linear-gradient(180deg, rgba(var(--color-bg1-rgb),0.98), rgba(var(--color-bg2-rgb),0.94))',
  border: '1px solid rgba(var(--color-accent-rgb),0.2)',
  borderRadius: 24, padding: '1.35rem 1.25rem 1.15rem',
  boxShadow: '0 24px 60px rgba(0,0,0,0.38)',
  display: 'grid', gap: '0.75rem', textAlign: 'center',
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

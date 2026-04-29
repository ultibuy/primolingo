import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import MotivationBanner from './MotivationBanner.jsx';
import { pickCoachingMessage, markCoachingShown, createDefaultCoaching } from '../engine/coaching.js';
import RuleCard from './RuleCard.jsx';
import CoinIcon from './CoinIcon.jsx';
import ShieldIcon from './ShieldIcon.jsx';
import CrownIcon from './CrownIcon.jsx';
import DiamondIcon from './DiamondIcon.jsx';
import DiamondStatus from './DiamondStatus.jsx';
import PopupCloseButton from './PopupCloseButton.jsx';
import LevelHelpPopup from './LevelHelpPopup.jsx';
import RuleEditor from './RuleEditor.jsx';
import { isLocalhost } from '../debug.js';
import CosmeticFlameIcon from './CosmeticFlameIcon.jsx';
import { clearCurrentStoredProgress } from '../store/persistence.js';
import { getStreakInfo } from '../engine/scoring.js';
import { getToday } from '../engine/sm2.js';
import { getDoubleCoinsBonusEarned, getDoubleCoinsRemainingSessions, getEquipped, SHOP_CATALOG } from '../engine/economy.js';
import { exportProgress } from '../store/persistence.js';
import { CHARACTERS, CHARACTER_CATEGORIES } from '../data/characters.js';
import CharacterSprite from './CharacterSprite.jsx';
import { resolveCharacterMood, resolveShopCharacter, getCharacterForRule, SHOP_CHARACTERS } from '../data/shopCharacters.js';
import { allDictees, getDicteeWordsForLevel } from '../content/dicteesLoader.js';
import DicteeCard from './DicteeCard.jsx';

// ---------------------------------------------------------------------------
// FIX 1 & FIX 3 — Corrected milestone messages with proper French accents
// ---------------------------------------------------------------------------
const MILESTONE_MESSAGES = {
  3: "3 jours de suite — tu tiens le cap.\nProchain palier : 7 jours → +100 pièces et un bouclier.",
  7: "Une semaine sans faillir. +100 pièces et 1 bouclier gagné !\nProchain palier : 14 jours → +200 pièces.",
  14: "14 jours. Inarrêtable. +200 pièces !\nProchain palier : 30 jours → +350 pièces.",
  30: "Un mois. Tu t'es prouvé quelque chose. +350 pièces !\nProchain palier : 60 jours → +500 pièces.",
  60: "60 jours. C'est devenu une partie de toi. +500 pièces !\nProchain palier : 100 jours → +1000 pièces.",
  100: "100 jours. Légendaire. +1000 pièces !\nTu as tout débloqué.",
};

// ---------------------------------------------------------------------------
// FIX 1 — Complete event type to message/icon mapping
// ---------------------------------------------------------------------------
const EVENT_CONFIG = {
  firstQuiz:        { msg: "Premi\u00e8re session termin\u00e9e, ta flamme passe \u00e0 1 !\nReviens demain pour le faire grimper.", icon: '🔥' },
  levelUp:          { msg: 'Niveau suivant atteint\ !', icon: '\⭐' },
  level_up_1:       { msg: 'Niveau Découverte atteint\ !', icon: '\⭐' },
  level_up_2:       { msg: 'Mode direct déverrouillé\ ! 🔓', icon: '🔓' },
  direct_unlocked:  { msg: 'Mode direct déverrouillé\ ! 🔓', icon: '🔓', dedupOf: 'level_up_2' },
  level_up_3:       { msg: 'Règle maîtrisée. Cette couronne, tu l\'as gagnée.', icon: '👑' },
  crown_earned:     { msg: 'Règle maîtrisée. Cette couronne, tu l\'as gagnée.', icon: '👑', dedupOf: 'level_up_3' },
  crown:            { msg: 'Règle maîtrisée. Cette couronne, tu l\'as gagnée.', icon: '👑' },
  level_up_4:       { msg: 'Parfait, trois fois de suite. C\'est gravé.', icon: '💎' },
  diamond_earned:   { msg: 'Parfait, trois fois de suite. C\'est gravé.', icon: '💎', dedupOf: 'level_up_4' },
  diamond:          { msg: 'Parfait, trois fois de suite. C\'est gravé.', icon: '💎' },
  sm2_activated:    { msg: 'Le diamant est vivant. Maintiens-le.', icon: '💎✨', dedupOf: 'level_up_4' },
  directUnlocked:   { msg: 'Mode direct déverrouillé\ !', icon: '🔓', dedupOf: 'level_up_2' },
  shieldUsed:       { icon: '🛡️' },
  streakLost:       { msg: 'Raté hier. Ça arrive. Reprends aujourd\'hui.', icon: '💪' },
  streakMilestone:  { icon: '🔥' },
  sm2ReviewPassed:  { msg: 'Révision réussie\ ! Le diamant brille.', icon: '💎' },
  sm2ReviewFragile: { msg: 'Presque\ ! Le diamant exige 90\ %.', icon: '⚠️' },
  sm2ReviewFailed:  { msg: 'Le diamant se fissure… Révise vite.', icon: '💥' },
  diamondBroken:    { msg: 'Le diamant s\'est brisé.', icon: '💥' },
  perfectSessionBonus: null, // silent — mood + entrance anim handled separately
  coinsEarned:      null, // skip — silent event
  firstSessionOfDay: null, // skip
  doubleCoins:      null, // skip
  levelMilestoneCoins: null, // skip
  milestone:        { icon: '🎯' }, // dynamic — handled in buildOverlayData
};

const MOOD_DESCRIPTIONS = {
  walk:      { emoji: '🚶', label: 'Balade', desc: 'Ton perso se promène tranquillement en attendant le prochain quiz.' },
  sleep:     { emoji: '💤', label: 'Dodo', desc: 'Ton perso dort encore… Fais 3 quiz pour le réveiller !' },
  wave:      { emoji: '👋', label: 'Coucou !', desc: 'Il te salue pour fêter tes débuts !' },
  clap:      { emoji: '👏', label: 'Bravo !', desc: 'Il applaudit ta session parfaite !' },
  cheer:     { emoji: '🙌', label: 'Hourra !', desc: 'Il lève les bras pour toi !' },
  kiss:      { emoji: '💋', label: 'Bisou', desc: 'Un bouclier t\'a sauvé — il t\'envoie un bisou de remerciement.' },
  dance:     { emoji: '💃', label: 'Danse !', desc: 'Palier de flamme atteint — il danse pour fêter ça !' },
  surprise:  { emoji: '😲', label: 'Oh !', desc: 'Quelque chose d\'inattendu s\'est passé…' },
  victory:   { emoji: '🏆', label: 'Victoire !', desc: 'Tu as accompli quelque chose de grand !' },
  think:     { emoji: '🤔', label: 'Hmm…', desc: 'Il réfléchit… La révision était limite.' },
  challenge: { emoji: '💪', label: 'Défi', desc: 'Il est prêt pour le défi !' },
};

const STREAK_MILESTONE_COINS = {
  7: 100,
  14: 200,
  30: 350,
  60: 500,
  100: 1000,
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 6) return 'Debout tôt';
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon après-midi';
  return 'Bonsoir';
}

// ---------------------------------------------------------------------------
// A8 — Fix motivation logic: accept todayDone parameter
// ---------------------------------------------------------------------------
function getMotivation(progress, rules, todayDone) {
  // If today's session is done, short congratulation
  if (todayDone) return 'Bien joué pour aujourd\'hui.';

  const streak = progress.streak?.current || 0;
  const rulesObj = progress.rules || {};
  const totalDiamonds = Object.values(rulesObj).filter(r => (r.level || 0) >= 4).length;
  const totalCrowns = Object.values(rulesObj).filter(r => (r.level || 0) >= 3).length;
  const totalRules = rules.length;
  const rulesStarted = Object.values(rulesObj).filter(r => (r.level || 0) >= 1).length;

  // Check firstQuizDone: after migration it lives in milestones.firstSession,
  // but old progress may still have progress.firstQuizDone
  const firstQuizDone = progress.milestones?.firstSession || progress.firstQuizDone;

  if (!firstQuizDone) return "Ta première session t'attend. C'est tout.";
  if (streak === 0 && progress.streak?.longest > 2) return 'Un nouveau départ, ça se prend maintenant.';
  if (totalDiamonds > 0) {
    const r = totalRules - totalDiamonds;
    if (r > 0) return `${totalDiamonds} diamant${totalDiamonds > 1 ? 's' : ''} en poche. Encore ${r} à aller chercher.`;
    return 'Tous les diamants sont à toi. Légende.';
  }
  if (totalCrowns > 0) return `${totalCrowns} couronne${totalCrowns > 1 ? 's' : ''}. Le diamant est à portée.`;
  if (streak >= 14) return 'Série incroyable. Ne lâche rien.';
  if (streak >= 7) return 'Une semaine d\'affilée. L\'habitude se construit.';
  if (streak >= 3) return 'Beau rythme. Le prochain palier approche.';
  if (rulesStarted > 0) return 'Chaque session te rapproche de ta première couronne.';
  return 'Choisis une règle et montre ce que tu sais faire.';
}

function getFlameIntensity(streak) {
  if (streak >= 30) return 2;
  if (streak >= 7) return 1;
  return 0;
}

function getRuleLevel(rp) {
  if (!rp) return 0;
  if (rp.level !== undefined) return rp.level;
  if (rp.hasDiamond) return rp.sm2 ? 5 : 4;
  if (rp.hasCrown) return 3;
  if (rp.directUnlocked) return 2;
  if ((rp.guidedSessionsCompleted || 0) >= 1) return 1;
  return 0;
}

function AnimatedNumber({ value, duration = 800 }) {
  const [displayed, setDisplayed] = useState(value);
  const prevRef = useRef(value);
  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    if (from === to) return undefined;

    const start = Date.now();
    let frameId = null;

    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / duration, 1);
      setDisplayed(Math.round(from + (to - from) * (1 - Math.pow(1 - pct, 3))));
      if (pct < 1) {
        frameId = requestAnimationFrame(tick);
      }
    };

    frameId = requestAnimationFrame(tick);
    prevRef.current = to;
    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [value, duration]);
  return <>{displayed}</>;
}

function computeGlobalLevelSummary(rules, progress) {
  const summary = { diamondVivant: 0, diamant: 0, couronne: 0, enCours: 0, nouveau: 0 };
  // Grammar rules
  for (const rule of rules) {
    const rp = progress.rules?.[rule.id];
    const level = getRuleLevel(rp);
    if (level === 5) summary.diamondVivant++;
    else if (level === 4) summary.diamant++;
    else if (level === 3) summary.couronne++;
    else if (level >= 1) summary.enCours++;
    else summary.nouveau++;
  }
  // Dictée rules (stored as "dicteeId-levelKey" in progress.rules)
  const dicteeKeys = ['level1', 'level2', 'level3'];
  for (const dictee of allDictees) {
    for (const lk of dicteeKeys) {
      const rp = progress.rules?.[`${dictee.id}-${lk}`];
      if (!rp) continue;
      const level = getRuleLevel(rp);
      if (level === 5) summary.diamondVivant++;
      else if (level === 4) summary.diamant++;
      else if (level === 3) summary.couronne++;
      else if (level >= 1) summary.enCours++;
      // Don't count nouveau for dictées — only count started ones
    }
  }
  return summary;
}

// ---------------------------------------------------------------------------
// FIX 1 — Deduplicate events and build overlay data
// ---------------------------------------------------------------------------
function deduplicateEvents(events) {
  const seen = new Set();
  const result = [];
  for (const evt of events) {
    const cfg = EVENT_CONFIG[evt.type];
    // Skip unknown or silent event types gracefully
    if (cfg === null || cfg === undefined) continue;
    // Check dedup — if this event's type is a dedupOf another already seen, skip
    const canonicalType = cfg.dedupOf || evt.type;
    if (seen.has(canonicalType)) continue;
    seen.add(canonicalType);
    // Also mark the current type so its dedupOf targets skip
    seen.add(evt.type);
    result.push(evt);
  }
  return result;
}

function buildOverlayData(evt) {
  const cfg = EVENT_CONFIG[evt.type];
  if (!cfg) return null;

  let msg = cfg.msg || '';
  let icon = cfg.icon || '';
  let sub = '';

  // Special handling for events with dynamic messages
  if (evt.type === 'milestone') {
    if (typeof evt.streak === 'number') {
      msg = MILESTONE_MESSAGES[evt.streak] || `Flamme de ${evt.streak} jours\ !`;
      icon = '🔥';
    } else {
      msg = MILESTONE_MESSAGES[evt.value] || `Flamme de ${evt.value} jours\ !`;
      icon = '🔥';
    }
  } else if (evt.type === 'streakMilestone') {
    msg = MILESTONE_MESSAGES[evt.value] || `Flamme de ${evt.value} jours\ !`;
    icon = '🔥';
  } else if (evt.type === 'shieldUsed') {
    msg = 'Bouclier 🛡️ consommé, ta flamme tient. Pense à en racheter un avant la prochaine fois.';
    sub = evt.value ? `Ta flamme de ${evt.value} jours est protégée.` : '';
  } else if (evt.type === 'directUnlocked') {
    sub = `«\ ${evt.value}\ » — plus d\'aide, juste toi.`;
  } else if (evt.type === 'streakLost') {
    const coins = evt.coins || 0;
    const shields = evt.shields || 0;
    const SHIELD_PRICE = 80;
    const MAX_SHIELDS = 2;
    const canBuy = shields < MAX_SHIELDS && coins >= SHIELD_PRICE;
    if (canBuy) {
      const missing = MAX_SHIELDS - shields;
      const affordable = Math.min(missing, Math.floor(coins / SHIELD_PRICE));
      msg = "Pas de chance hier — ta flamme est tombé.";
      if (affordable >= 2) {
        sub = `Tu as ${coins} pièces, tu peux acheter ${affordable} boucliers (${SHIELD_PRICE} pièces chacun) pour te protéger les prochains jours.`;
      } else {
        sub = `Tu as ${coins} pièces, tu peux acheter 1 bouclier (${SHIELD_PRICE} pièces) pour te protéger la prochaine fois.`;
      }
    } else {
      msg = "Pas de chance hier — ta flamme est tombé.";
      sub = "Ça arrive. L'important c'est de revenir aujourd'hui.";
    }
  } else if (evt.type === 'levelUp' && evt.value) {
    const lvl = evt.value;
    const ruleName = evt.ruleTitle || '';
    const n = (typeof window !== 'undefined' && window.__ORTHO_SESSION_SIZE__) || 20;
    const s80 = `${Math.ceil(n * 0.8)}/${n}`;
    const s90 = `${Math.ceil(n * 0.9)}/${n}`;

    const coinStr = evt.coins > 0 ? ` · +${evt.coins} 🪙` : '';
    if (lvl === 1) {
      msg = `Bronze sur ${ruleName}`;
      sub = `Prochain niveau : Argent. Fais 3 sessions guid\u00e9es avec ${s80} ou mieux.${coinStr}`;
      icon = '\u2B50';
    } else if (lvl === 2) {
      msg = `Argent sur ${ruleName}`;
      sub = `Mode direct d\u00e9bloqu\u00e9 ! Prochain : Couronne. Fais 3 sessions directes avec ${s80} ou mieux.${coinStr}`;
      icon = '\u2B50\u2B50';
    } else if (lvl === 3) {
      msg = `Couronne sur ${ruleName}`;
      sub = `Prochain : Diamant. Fais 3 sessions directes cons\u00e9cutives avec ${s90} ou mieux.${coinStr}`;
      icon = '\uD83D\uDC51';
    } else if (lvl === 4) {
      msg = `Diamant sur ${ruleName}`;
      sub = `Le diamant est vivant. Maintiens-le avec des r\u00e9visions r\u00e9guli\u00e8res.${coinStr}`;
      icon = '\uD83D\uDC8E';
    } else {
      const levelCfg = EVENT_CONFIG[`level_up_${lvl}`];
      if (levelCfg) { msg = levelCfg.msg; icon = levelCfg.icon; }
    }
    if (!sub && evt.ruleTitle) {
      sub = `«\ ${evt.ruleTitle}\ »`;
    }
  }

  if (!msg) return null;
  return { msg, icon, sub };
}

// ---------------------------------------------------------------------------
// A6 — Split rules into 3 sections
// ---------------------------------------------------------------------------
function splitRulesIntoSections(rules, progress) {
  const today = getToday();
  const revisions = [];   // SM-2 review due (level >= 4 with nextReviewDate <= today)
  const inProgress = [];  // level >= 1 and (level < 4 OR level 4+ but not due)
  const toDiscover = [];  // level 0

  for (const rule of rules) {
    const rp = progress.rules?.[rule.id];
    const level = getRuleLevel(rp);

    if (level >= 4 && rp?.sm2 && rp.sm2.nextReviewDate <= today) {
      revisions.push(rule);
    } else if (level >= 1) {
      inProgress.push(rule);
    } else {
      toDiscover.push(rule);
    }
  }

  return { revisions, inProgress, toDiscover };
}

// ---------------------------------------------------------------------------
// Dashboard Component
// ---------------------------------------------------------------------------
export default function Dashboard({
  rules,
  progress,
  childName,
  onPlay,
  onOpenShop,
  pendingEvents,
  onEventsSeen,
  onDebugUpdateStreak,
  onDebugSetCoins,
  dailyBackups = [],
  onDebugRestoreBackup,
  onTriggerEntranceAnim,
  sessionSize,
  onDebugSetSessionSize,
  onOpenDictees,
  onPlayDictee,
  initialTab = 'grammaire',
  onTabChange,
  onProgressChange,
}) {
  const [overlay, setOverlay] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab);
  const handleTabChange = (tab) => { setActiveTab(tab); onTabChange?.(tab); };
  const [showStreakHelp, setShowStreakHelp] = useState(false);
  const [levelHelp, setLevelHelp] = useState(null); // { level: 'bronze', ruleTitle, ruleProgress }
  const [editingRule, setEditingRule] = useState(null); // rule object being edited
  const [memoRule, setMemoRule] = useState(null);
  const [bugTarget, setBugTarget] = useState(null); // { type, title, id, level? }
  const [bugDesc, setBugDesc] = useState('');
  const [bugCopied, setBugCopied] = useState(false);
  const isDebug = isLocalhost();
  const overlayTimeoutsRef = useRef([]);
  const [debugStreak, setDebugStreak] = useState(String(progress.streak?.current || 0));
  const [debugDate, setDebugDate] = useState(progress.streak?.lastActiveDate || '');
  const [debugCoins, setDebugCoins] = useState(String(progress.coins || 0));
  const [restoringBackupDate, setRestoringBackupDate] = useState(null);
  const [debugOpen, setDebugOpen] = useState(false);
  const [streakAlert, setStreakAlert] = useState(null); // { nextMilestone, reward }
  const [moodTooltip, setMoodTooltip] = useState(false); // show character mood popup
  const [pandaMood, setPandaMood] = useState(null); // null = default walk
  const pandaMoodTimerRef = useRef(null);
  const shopOwnedRef = useRef(progress.shop?.owned || []);

  const triggerPandaMood = useCallback((mood, duration = 4000) => {
    if (pandaMoodTimerRef.current) clearTimeout(pandaMoodTimerRef.current);
    setPandaMood(mood);
    pandaMoodTimerRef.current = setTimeout(() => {
      setPandaMood(null);
      pandaMoodTimerRef.current = null;
    }, duration);
  }, []);

  const triggerRandomEntranceAnim = useCallback((ownedAnims) => {
    if (!ownedAnims.length || !onTriggerEntranceAnim) return;
    const pick = ownedAnims[Math.floor(Math.random() * ownedAnims.length)];
    onTriggerEntranceAnim(pick);
  }, [onTriggerEntranceAnim]);

  // Compute total sessions for "never played" detection
  const totalSessionsCompleted = Object.values(progress.rules || {}).reduce(
    (sum, rp) => sum + (rp.guidedSessionsCompleted || 0) + (rp.directSessionsCompleted || 0), 0
  );
  // Dashboard card mood: sleep if 0 sessions done, else LevelPath handles walk/sit automatically
  const dashboardCharMood = totalSessionsCompleted === 0 ? 'sleep' : null;

  useEffect(() => {
    if (!isDebug) return;
    const handler = (e) => {
      if (e.metaKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setDebugOpen(o => !o);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isDebug]);
  const [isCompactLayout, setIsCompactLayout] = useState(() => (
    typeof window !== 'undefined' ? window.innerWidth <= 760 : false
  ));

  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

  // First visit of the day: check if a streak milestone is within reach
  useEffect(() => {
    const current = progress.streak?.current || 0;
    const lastActive = progress.streak?.lastActiveDate;
    const today = getToday();
    if (lastActive === today) return; // already played today
    if (current === 0) return; // no streak yet
    const nextDay = current + 1;
    const milestone = [7, 14, 30, 60, 100].find(d => d === nextDay);
    if (!milestone) return; // not on the eve of a milestone
    const milestoneKey = `streak${milestone}`;
    if (progress.milestones?.[milestoneKey]) return; // already earned
    setStreakAlert({ nextMilestone: milestone, reward: STREAK_MILESTONE_COINS[milestone] });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onResize = () => setIsCompactLayout(window.innerWidth <= 760);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const clearOverlayTimers = useCallback(() => {
    for (const timeoutId of overlayTimeoutsRef.current) {
      clearTimeout(timeoutId);
    }
    overlayTimeoutsRef.current = [];
  }, []);

  const dismissOverlay = useCallback(() => {
    clearOverlayTimers();
    setOverlayVisible(false);
    setOverlay(null);
    if (onEventsSeen) onEventsSeen();
  }, [clearOverlayTimers, onEventsSeen]);

  // ---------------------------------------------------------------------------
  // FIX 1 — Process pending events: deduplicate, show overlays, then clear
  // ---------------------------------------------------------------------------
  const showNextEvent = useCallback((events, idx) => {
    if (idx >= events.length) {
      // All events shown — notify parent to clear
      if (onEventsSeen) onEventsSeen();
      return;
    }
    const evt = events[idx];
    // Entrance animations still fire on significant events
    if (evt.type === 'levelUp' || evt.type === 'milestone' || evt.type === 'streakMilestone' || evt.type === 'diamond' || evt.type === 'directUnlocked' || evt.type === 'crown') {
      const ownedAnims = shopOwnedRef.current.filter(id => id.startsWith('entrance-'));
      triggerRandomEntranceAnim(ownedAnims);
    }
    const data = buildOverlayData(evt);
    if (!data) {
      // Skip this event and move to the next
      showNextEvent(events, idx + 1);
      return;
    }
    setOverlay(data);
    setOverlayVisible(true);
    const hideTimeout = setTimeout(() => {
      setOverlayVisible(false);
      const nextTimeout = setTimeout(() => {
        setOverlay(null);
        showNextEvent(events, idx + 1);
      }, 400);
      overlayTimeoutsRef.current.push(nextTimeout);
    }, 3500);
    overlayTimeoutsRef.current.push(hideTimeout);
  }, [onEventsSeen, triggerRandomEntranceAnim]);

  useEffect(() => {
    if (pendingEvents && pendingEvents.length > 0) {
      clearOverlayTimers();
      const deduped = deduplicateEvents(pendingEvents);
      if (deduped.length > 0) {
        showNextEvent(deduped, 0);
      } else {
        // All events were silent/skipped — clear immediately
        if (onEventsSeen) onEventsSeen();
      }
    }
    return () => clearOverlayTimers();
  }, [clearOverlayTimers, onEventsSeen, pendingEvents, showNextEvent]);

  // ---------------------------------------------------------------------------
  // Derived state
  // ---------------------------------------------------------------------------
  const streakInfo = getStreakInfo(progress.streak);
  const streak = progress.streak?.current || 0;
  const todayDone = progress.streak?.lastActiveDate === getToday();
  const shields = progress.shields || 0;
  const coins = progress.coins || 0;

  const equippedTitle = getEquipped(progress, 'title');
  const titleItem = equippedTitle ? SHOP_CATALOG[equippedTitle] : null;
  const displayTitle = titleItem?.titleText || streakInfo.title;
  const equippedFlame = getEquipped(progress, 'flame');
  const doubleCoinsRemaining = getDoubleCoinsRemainingSessions(progress);
  const doubleCoinsBonusEarned = getDoubleCoinsBonusEarned(progress);
  const shopOwned = progress.shop?.owned || [];
  // Keep ref in sync (used by showNextEvent)
  useEffect(() => { shopOwnedRef.current = shopOwned; }, [shopOwned]);

  const activeCharacterId = resolveShopCharacter(shopOwned);
  const activeCharacterMood = resolveCharacterMood(pandaMood, activeCharacterId, shopOwned);
  const allRuleIds = useMemo(() => rules.map(r => r.id), [rules]);

  // ---------------------------------------------------------------------------
  // Coaching banner
  // Computed once on mount — frozen so markCoachingShown doesn't cause it to
  // disappear by re-evaluating against already-marked coaching state.
  // ---------------------------------------------------------------------------
  const todayStr = getToday();
  const coachingMsgRef = useRef(undefined);
  if (coachingMsgRef.current === undefined) {
    coachingMsgRef.current = pickCoachingMessage({
      trigger: 'dashboard',
      progress,
      rules,
      todayStr,
      hour: new Date().getHours(),
    });
  }
  const coachingMsg = coachingMsgRef.current;

  useEffect(() => {
    if (!coachingMsg || !onProgressChange) return;
    const next = markCoachingShown(progress, coachingMsg, todayStr);
    onProgressChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCtaAction = useCallback((action) => {
    if (action === 'openShop' || action === 'openShopChars') {
      onOpenShop?.();
    }
  }, [onOpenShop]);

  const summary = computeGlobalLevelSummary(rules, progress);

  // A6 — Split rules into sections
  const { revisions, inProgress, toDiscover } = splitRulesIntoSections(rules, progress);


  // A4 — Only show level summary if there's at least one crown or diamond
  const showLevelSummary = summary.couronne > 0 || summary.diamant > 0 || summary.diamondVivant > 0;
  const streakHeadline = streak > 0
    ? `${streak} jour${streak > 1 ? 's' : ''} d'affilée`
    : 'Allume la première flamme';
  const streakSupportText = streak > 0
    ? 'Ta flamme te donne des pièces aux paliers 7, 14, 30, 60 et 100 jours. Il faut au moins 60% de bonnes réponses pour valider un jour.'
    : 'Lance ta première session (60% minimum) pour démarrer ta flamme.';
  const nextCoinMilestone = [7, 14, 30, 60, 100].find((day) => day > streak) || null;
  const nextCoinReward = nextCoinMilestone ? STREAK_MILESTONE_COINS[nextCoinMilestone] : null;
  const nextUsefulLabel = nextCoinMilestone ? `${nextCoinMilestone} jours` : 'Flamme solide';
  const nextUsefulText = nextCoinReward
    ? `+${nextCoinReward} pièces`
    : 'Tous les gros paliers de pièces sont déjà passés.';
  const riskValue = 'Un jour raté = retour à 1';
  const riskText = "La série retombe et les prochaines pièces s'éloignent.";

  // Counter for staggered animation
  let animIdx = 0;

  useEffect(() => {
    if (!showStreakHelp && !memoRule) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (memoRule) setMemoRule(null);
        else setShowStreakHelp(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showStreakHelp, memoRule]);

  return (
    <>
    <div style={{
      ...pageStyle,
      position: 'relative',
      overflow: 'hidden',
      flexDirection: isCompactLayout ? 'column' : 'row',
      alignItems: isCompactLayout ? 'stretch' : 'flex-start',
    }}>
      {/* ---------------------------------------------------------------------------
        Character mood tooltip
      --------------------------------------------------------------------------- */}
      {moodTooltip && (() => {
        const currentMood = activeCharacterMood || 'walk';
        const info = MOOD_DESCRIPTIONS[currentMood] || MOOD_DESCRIPTIONS.walk;
        return (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 998, cursor: 'pointer',
          }} onClick={() => setMoodTooltip(false)}>
            <div style={{
              textAlign: 'center', padding: '1.5rem 1.6rem',
              background: 'rgba(var(--color-bg1-rgb),0.95)',
              borderRadius: 18,
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              maxWidth: 300,
              animation: 'bounce-in 0.3s ease forwards',
            }} onClick={(e) => e.stopPropagation()}>
              <PopupCloseButton onClick={() => setMoodTooltip(false)} />
              <div style={{ fontSize: '3rem', marginBottom: '0.4rem' }}>{info.emoji}</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e2e2e2', marginBottom: '0.3rem' }}>
                {info.label}
              </div>
              <div style={{ fontSize: '0.85rem', color: '#9ca3af', lineHeight: 1.5 }}>
                {info.desc}
              </div>
            </div>
          </div>
        );
      })()}
      {/* ---------------------------------------------------------------------------
        Flamme milestone alert — first visit of the day
      --------------------------------------------------------------------------- */}
      {streakAlert && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
          backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 999, cursor: 'pointer',
        }} onClick={() => setStreakAlert(null)}>
          <div style={{
            textAlign: 'center', padding: '2rem 1.8rem',
            background: 'rgba(var(--color-bg1-rgb),0.92)',
            borderRadius: 22,
            border: '1px solid rgba(250,204,21,0.3)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            maxWidth: 380,
            animation: 'bounce-in 0.4s ease forwards',
          }} onClick={(e) => e.stopPropagation()}>
            <PopupCloseButton onClick={() => setStreakAlert(null)} />
            <div style={{ fontSize: '4rem', marginBottom: '0.6rem' }}>🔥</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fbbf24', marginBottom: '0.5rem' }}>
              Palier {streakAlert.nextMilestone} jours en vue !
            </div>
            <div style={{ fontSize: '0.92rem', color: '#e2e2e2', lineHeight: 1.5, marginBottom: '0.8rem' }}>
              Tu es à <strong style={{ color: '#fbbf24' }}>{streakAlert.nextMilestone - 1} jours</strong> de flamme.
              {'\n'}Finis au moins un quiz aujourd'hui pour débloquer
              {' '}<strong style={{ color: '#4ade80' }}>+{streakAlert.reward} pièces</strong> !
            </div>
            <button
              onClick={() => setStreakAlert(null)}
              style={{
                padding: '0.6rem 1.6rem', borderRadius: 12, border: 'none',
                background: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
                color: '#1e1e2e', fontWeight: 800, fontSize: '0.95rem',
                cursor: 'pointer', boxShadow: '0 2px 12px rgba(251,191,36,0.35)',
              }}
            >
              C'est parti !
            </button>
          </div>
        </div>
      )}
      {/* ---------------------------------------------------------------------------
        Overlay for pending events
      --------------------------------------------------------------------------- */}
      {overlay && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, opacity: overlayVisible ? 1 : 0,
          transition: 'opacity 0.4s ease', cursor: 'pointer',
        }} onClick={dismissOverlay}>
          <div style={{
            textAlign: 'center', padding: '2.5rem 2rem',
            background: 'rgba(var(--color-bg1-rgb),0.85)',
            borderRadius: 24,
            border: '1px solid rgba(var(--color-accent-rgb),0.2)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
            maxWidth: 420,
            position: 'relative',
            animation: overlayVisible ? 'bounce-in 0.5s ease forwards' : 'none',
          }} onClick={(e) => e.stopPropagation()}>
            <PopupCloseButton onClick={dismissOverlay} />
            <div style={{ fontSize: '5.5rem', marginBottom: '1rem', animation: 'glow-gold 2s ease-in-out infinite' }}>
              {overlay.icon}
            </div>
            <div style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 700, maxWidth: 420, lineHeight: 1.5, textShadow: '0 2px 15px rgba(0,0,0,0.5)', marginBottom: overlay.sub ? '0.5rem' : 0, textAlign: 'center' }}>
              {overlay.msg.split('\n').map((line, i) => (
                <div key={i} style={i > 0 ? { fontSize: '0.9rem', color: '#9ca3af', fontWeight: 500, marginTop: '0.4rem' } : undefined}>
                  {line}
                </div>
              ))}
            </div>
            {overlay.sub && <p style={{ fontSize: '0.9rem', color: '#9ca3af', fontWeight: 500 }}>{overlay.sub}</p>}
          </div>
        </div>
      )}

      <div style={{
        maxWidth: 640, width: '100%', padding: isCompactLayout ? '0 0.9rem 2rem' : '0 1.5rem 3rem',
        opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.6s ease',
        position: 'relative',
        zIndex: 1,
      }}>
        {/* =====================================================================
          A1 + A2 + A3 + A7 — Sticky header with merged streak, shop button, shields
        ===================================================================== */}
        <div style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          background: 'linear-gradient(180deg, rgba(var(--color-bg1-rgb),0.96), rgba(var(--color-bg2-rgb),0.82))',
          border: '1px solid rgba(var(--color-primary-rgb),0.16)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.03)',
          borderRadius: 20,
          padding: '0.7rem 0.9rem',
          marginTop: '0.35rem',
          marginBottom: '0.5rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Left side: flame + streak count + tier + today done badge */}
          {streak > 0 ? (
            <button
              type="button"
              onClick={() => setShowStreakHelp(true)}
              className="streak-help-trigger"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              aria-label="En savoir plus sur la flamme"
            >
              <CosmeticFlameIcon size={36} intensity={getFlameIntensity(streak)} flameId={equippedFlame} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{
                    fontSize: '1.6rem', fontWeight: 900,
                    color: 'var(--color-accent)',
                    textShadow: '0 0 12px rgba(var(--color-accent-rgb),0.2)',
                    lineHeight: 1,
                  }}>
                    <AnimatedNumber value={streak} />
                  </span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-accent)', fontWeight: 700 }}>
                    jour{streak !== 1 ? 's' : ''}
                  </span>
                  {/* A1 — Green check badge when todayDone */}
                  {todayDone && (
                    <span style={{
                      fontSize: '0.82rem',
                      color: '#4ade80',
                      fontWeight: 900,
                      marginLeft: '0.15rem',
                    }}>
                      {'✓'}
                    </span>
                  )}
                </div>
                {displayTitle && (
                  <div style={{ fontSize: '0.72rem', color: 'rgba(var(--color-accent-rgb),0.9)', fontWeight: 700, letterSpacing: '0.03em' }}>
                    {displayTitle}
                  </div>
                )}
              </div>
            </button>
          ) : (
            /* Flamme is 0: show muted flame */
            <button
              type="button"
              onClick={() => setShowStreakHelp(true)}
              className="streak-help-trigger"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
              aria-label="En savoir plus sur la flamme"
            >
              <CosmeticFlameIcon size={28} intensity={0} flameId={equippedFlame} />
              <div>
                <span style={{ fontSize: '0.82rem', color: '#4b5563', fontWeight: 700, display: 'block', lineHeight: 1.1 }}>
                  0 jour
                </span>
                {displayTitle && (
                  <span style={{
                    fontSize: '0.72rem',
                    color: 'rgba(var(--color-accent-rgb),0.9)',
                    fontWeight: 700,
                    letterSpacing: '0.03em',
                    display: 'block',
                    marginTop: '0.15rem',
                    lineHeight: 1.1,
                  }}>
                    {displayTitle}
                  </span>
                )}
              </div>
            </button>
          )}

          {/* Right side: shields + coins + shop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            {/* A3 — Shields: only show if streak >= 3, as number not repeated icons */}
            {streak >= 3 && shields > 0 && (
              <div
                title="Boucliers\ : protègent ta flamme si tu rates un jour"
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.2rem',
                  cursor: 'default',
                }}
              >
                <ShieldIcon size={20} active />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#60a5fa' }}>
                  {shields}
                </span>
              </div>
            )}

            {/* A2 — Coin counter + shop icon with hover glow */}
            <button
              type="button"
              onClick={onOpenShop}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                background: 'linear-gradient(135deg, rgba(var(--color-accent-rgb),0.16), rgba(var(--color-primary-rgb),0.14))',
                border: '1px solid rgba(var(--color-accent-rgb),0.22)',
                borderRadius: 12, padding: '0.4rem 0.78rem',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 0 16px rgba(var(--color-accent-rgb),0.22)';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(var(--color-accent-rgb),0.22), rgba(var(--color-primary-rgb),0.18))';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(var(--color-accent-rgb),0.16), rgba(var(--color-primary-rgb),0.14))';
              }}
            >
              <CoinIcon size={16} />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                <AnimatedNumber value={coins} />
              </span>
              <span style={{ fontSize: '0.9rem', marginLeft: '0.15rem' }}>{'🛒'}</span>
            </button>
          </div>
        </div>

        {doubleCoinsRemaining > 0 && (
          <div style={{
            marginBottom: '0.9rem',
            padding: '0.8rem 0.95rem',
            borderRadius: 18,
            background: 'linear-gradient(135deg, rgba(var(--color-accent-rgb),0.16), rgba(var(--color-primary-rgb),0.12))',
            border: '1px solid rgba(var(--color-accent-rgb),0.12)',
            boxShadow: '0 6px 16px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.02)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '0.9rem',
            flexWrap: 'wrap',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', minWidth: 0 }}>
              <div style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'rgba(var(--color-accent-rgb),0.1)',
                border: '1px solid rgba(var(--color-accent-rgb),0.14)',
                fontSize: '1rem',
                flexShrink: 0,
              }}>
                <CoinIcon size={24} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#fff' }}>
                  Double coins actif
                </div>
                <div style={{ fontSize: '0.74rem', color: '#d1d5db', lineHeight: 1.45 }}>
                  +{doubleCoinsBonusEarned} pièces gagnées grâce au boost
                </div>
              </div>
            </div>
            <div style={{
              padding: '0.42rem 0.75rem',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.1)',
              border: '1px solid rgba(var(--color-accent-rgb),0.1)',
              fontSize: '0.76rem',
              fontWeight: 800,
              color: 'var(--color-accent)',
              flexShrink: 0,
            }}>
              {doubleCoinsRemaining} quiz restant{doubleCoinsRemaining > 1 ? 's' : ''}
            </div>
          </div>
        )}

        {/* =====================================================================
          A5 — Conditional greeting: only show if !todayDone
        ===================================================================== */}
        {!todayDone && (
          <div style={{ textAlign: 'center', padding: '0.5rem 1rem 0.8rem' }}>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>
              {getGreeting()}{childName ? `, ${childName}` : ''}
            </h1>
            <p style={{ fontSize: '0.9rem', color: '#9ca3af', fontStyle: 'italic', lineHeight: 1.5, maxWidth: 400, margin: '0 auto' }}>
              {getMotivation(progress, rules, todayDone)}
            </p>
          </div>
        )}

        {/* =====================================================================
          A4 — Global level summary: only show if at least one crown or diamond
        ===================================================================== */}
        {showLevelSummary && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', flexWrap: 'wrap', padding: '0.8rem 0.5rem', marginBottom: '0.6rem',
          }}>
            {summary.diamondVivant > 0 && (
              <LevelBadge icon={<DiamondStatus health={1.0} size={18} />} count={summary.diamondVivant} color="#67e8f9" label="Vivant" onClick={() => setLevelHelp({ level: 'badge_diamond' })} />
            )}
            {summary.diamant > 0 && (
              <LevelBadge icon={<DiamondStatus health={0.7} size={16} />} count={summary.diamant} color="#60a5fa" label="Diamant" onClick={() => setLevelHelp({ level: 'badge_diamond' })} />
            )}
            {summary.couronne > 0 && (
              <LevelBadge icon={<CrownIcon size={14} active animate={false} />} count={summary.couronne} color="#fbbf24" label="Couronne" onClick={() => setLevelHelp({ level: 'crown' })} />
            )}
            {summary.enCours > 0 && (
              <LevelBadge icon={<span style={{ fontSize: '0.7rem' }}>{'\⭐'}</span>} count={summary.enCours} color="#c0c0c0" label="En cours" onClick={() => setLevelHelp({ level: 'badge_en_cours' })} />
            )}
            {summary.nouveau > 0 && (
              <LevelBadge icon={<span style={{ fontSize: '0.7rem' }}>{'🔒'}</span>} count={summary.nouveau} color="#4b5563" label="Nouvelle" onClick={() => setLevelHelp({ level: 'badge_nouvelle' })} />
            )}
          </div>
        )}

        {/* =====================================================================
          Coaching banner
        ===================================================================== */}
        {coachingMsg && (
          <MotivationBanner
            variant={coachingMsg.variant}
            emoji={coachingMsg.emoji}
            message={coachingMsg.copy}
            emphasis={coachingMsg.emphasis}
            floatEmoji={['panda', 'flamme', 'pieces'].includes(coachingMsg.variant)}
            cta={coachingMsg.cta ? {
              label: coachingMsg.cta.label,
              onClick: () => handleCtaAction(coachingMsg.cta.action),
            } : null}
            style={{ marginBottom: '0.75rem' }}
          />
        )}

        {/* =====================================================================
          Grammaire / Dictée switcher
        ===================================================================== */}
        <div style={{
          display: 'flex',
          background: 'rgba(0,0,0,0.32)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 13,
          padding: 3,
          marginTop: '1.25rem',
          gap: 2,
        }}>
          {[
            { key: 'grammaire', label: 'Grammaire', icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4z" />
              </svg>
            )},
            { key: 'dictee', label: 'Vocabulaire', icon: (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
              </svg>
            )},
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleTabChange(tab.key)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                padding: '10px 6px',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                background: activeTab === tab.key ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: activeTab === tab.key ? '#fff' : 'rgba(255,255,255,0.55)',
                fontSize: '0.78rem',
                fontWeight: 700,
                transition: 'background 0.18s ease, color 0.18s ease',
              }}
            >
              <span style={{ width: 14, height: 14, display: 'inline-flex', flexShrink: 0 }}>
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* =====================================================================
          Grammaire tab — RÉVISIONS DU JOUR + groupes AVENTURIER/HÉROS/LÉGENDE
        ===================================================================== */}
        {activeTab === 'grammaire' && (() => {
          const GRAMMAR_GROUPS = [
            { key: 'aventurier', label: 'AVENTURIER', color: '#FFC107' },
            { key: 'heros',      label: 'HÉROS',      color: '#4CAF50' },
            { key: 'legende',    label: 'LÉGENDE',    color: '#9C27B0' },
          ];
          // First not-started rule across all groups (for "recommended" badge)
          const firstNotStartedId = (() => {
            for (const g of GRAMMAR_GROUPS) {
              const r = rules.find(rule => rule.group === g.key && !(progress.rules?.[rule.id]?.level >= 1));
              if (r) return r.id;
            }
            return null;
          })();

          return (
            <>
              {/* Révisions du jour (cross-group) */}
              {revisions.length > 0 && (
                <div style={{ marginTop: '1.5rem' }}>
                  <SectionLabel>
                    {`RÉVISIONS DU JOUR — ${revisions.length} règle${revisions.length > 1 ? 's' : ''} à réviser`}
                  </SectionLabel>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    {revisions.map((rule) => {
                      const rp = progress.rules?.[rule.id];
                      const idx = animIdx++;
                      return (
                        <div key={rule.id} style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(15px)', transition: `all 0.5s ease ${0.15 + idx * 0.08}s` }}>
                          <RuleCard rule={rule} ruleProgress={rp} onPlay={onPlay} onOpenMemo={setMemoRule}
                            onLevelHelp={(lvlKey) => setLevelHelp({ level: lvlKey, ruleTitle: rule.shortTitle || rule.title, ruleProgress: rp })}
                            onEditRule={isDebug ? (ruleId) => { const r = rules.find(x => x.id === ruleId); if (r) setEditingRule(r); } : undefined}
                            pandaMood={dashboardCharMood}
                            characterId={getCharacterForRule(rule.id, allRuleIds, shopOwned)}
                            onCharacterClick={() => setMoodTooltip(true)}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Groupes AVENTURIER / HÉROS / LÉGENDE */}
              {GRAMMAR_GROUPS.map((grp) => {
                const groupRules = rules.filter(r => r.group === grp.key);
                if (groupRules.length === 0) return null;
                const started = groupRules.filter(r => (progress.rules?.[r.id]?.level || 0) >= 1 && !revisions.find(rv => rv.id === r.id));
                const notStarted = groupRules.filter(r => !(progress.rules?.[r.id]?.level >= 1));
                return (
                  <div key={grp.key} style={{ marginTop: '1.5rem' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      marginBottom: '0.75rem', paddingBottom: '0.4rem',
                      borderBottom: `1px solid ${grp.color}28`,
                    }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, color: grp.color, letterSpacing: '0.08em' }}>
                        {grp.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                      {/* In-progress rules: full RuleCard */}
                      {started.map((rule) => {
                        const rp = progress.rules?.[rule.id];
                        const idx = animIdx++;
                        return (
                          <div key={rule.id} style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(15px)', transition: `all 0.5s ease ${0.15 + idx * 0.08}s` }}>
                            <RuleCard rule={rule} ruleProgress={rp} onPlay={onPlay} onOpenMemo={setMemoRule}
                              onLevelHelp={(lvlKey) => setLevelHelp({ level: lvlKey, ruleTitle: rule.shortTitle || rule.title, ruleProgress: rp })}
                              onEditRule={isDebug ? (ruleId) => { const r = rules.find(x => x.id === ruleId); if (r) setEditingRule(r); } : undefined}
                              pandaMood={dashboardCharMood}
                              characterId={getCharacterForRule(rule.id, allRuleIds, shopOwned)}
                              onCharacterClick={() => setMoodTooltip(true)}
                            />
                          </div>
                        );
                      })}

                      {/* Not-started rules: compact row */}
                      {notStarted.map((rule) => {
                        const isRecommended = rule.id === firstNotStartedId;
                        const idx = animIdx++;
                        return (
                          <div key={rule.id} style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(15px)', transition: `all 0.5s ease ${0.15 + idx * 0.08}s` }}>
                            <div style={{
                              display: 'flex', alignItems: 'center',
                              background: isRecommended ? 'rgba(var(--color-primary-rgb),0.08)' : 'rgba(255,255,255,0.04)',
                              border: isRecommended ? '1px solid rgba(var(--color-primary-rgb),0.3)' : '1px solid rgba(255,255,255,0.08)',
                              borderRadius: 14, padding: '0.7rem 1rem', gap: '0.7rem', flexWrap: 'wrap',
                            }}>
                              <span style={{ fontSize: '1rem', opacity: 0.4 }}>🔒</span>
                              <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.7rem', flexWrap: 'nowrap' }}>
                                  <button type="button" onClick={() => setMemoRule(rule)} style={{ padding: 0, border: 'none', background: 'transparent', color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700, textAlign: 'left', flex: 1, minWidth: 0 }} title="Ouvrir la fiche mémo">
                                    {rule.title}
                                  </button>
                                  <button onClick={() => onPlay(rule.id, 'guided')} style={{ padding: '0.45rem 0.9rem', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', color: '#fff', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700, flexShrink: 0, boxShadow: isRecommended ? '0 2px 12px rgba(124,58,237,0.35)' : '0 2px 8px rgba(124,58,237,0.25)' }}>
                                    Découvrir
                                  </button>
                                </div>
                                {isRecommended ? (
                                  <span style={{ display: 'inline-flex', alignSelf: 'flex-start', whiteSpace: 'nowrap', fontSize: '0.6rem', background: 'rgba(var(--color-primary-rgb),0.2)', color: 'var(--color-accent)', padding: '0.1rem 0.45rem', borderRadius: 4, fontWeight: 700, letterSpacing: '0.02em' }}>
                                    Prochaine règle recommandée
                                  </span>
                                ) : (
                                  <span style={{ display: 'inline-flex', alignSelf: 'flex-start', whiteSpace: 'nowrap', fontSize: '0.62rem', background: 'rgba(107,114,128,0.15)', color: '#6b7280', padding: '0.1rem 0.4rem', borderRadius: 4, fontWeight: 700 }}>
                                    Nouvelle
                                  </span>
                                )}
                              </div>
                              {isDebug && (
                                <button onClick={(e) => { e.stopPropagation(); setEditingRule(rules.find(x => x.id === rule.id)); }} style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 6, padding: '0.15rem 0.35rem', cursor: 'pointer', fontSize: '0.6rem', color: '#f87171', fontWeight: 700, flexShrink: 0 }} title="Debug: éditer la règle">✏️</button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </>
          );
        })()}

        {/* =====================================================================
          Dictée tab content
        ===================================================================== */}
        {activeTab === 'dictee' && (
          <div style={{ marginTop: '1rem' }}>
            {[
              { key: 'level1', label: 'AVENTURIER', color: '#FFC107' },
              { key: 'level2', label: 'HÉROS', color: '#4CAF50' },
              { key: 'level3', label: 'LÉGENDE', color: '#9C27B0' },
            ].map((levelDef) => {
              const rulesProgress = progress?.rules || {};
              const unlocked = levelDef.key === 'level1'
                ? true
                : allDictees.map(d => `${d.id}-${levelDef.key === 'level2' ? 'level1' : 'level2'}`).every(id => (rulesProgress[id]?.level || 0) >= 3);
              return (
                <div key={levelDef.key} style={{ marginBottom: '1.5rem' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    marginBottom: '0.75rem',
                    paddingBottom: '0.4rem',
                    borderBottom: `1px solid ${levelDef.color}28`,
                  }}>
                    <span style={{
                      fontSize: '0.72rem', fontWeight: 800,
                      color: levelDef.color, letterSpacing: '0.08em',
                    }}>
                      {levelDef.label}
                    </span>
                    {!unlocked && (
                      <span style={{ fontSize: '0.68rem', color: '#6b7280', fontWeight: 600 }}>
                        {'🔒 '}
                        {levelDef.key === 'level2'
                          ? 'Tous Aventurier en couronne'
                          : 'Tous Héros en couronne'}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {(() => {
                      const allDicteeIds = allDictees.map(d => d.id);
                      let firstNotStartedSeen = false;
                      return allDictees.map((dictee) => {
                        const quizId = `${dictee.id}-${levelDef.key}`;
                        const dicteeProgress = rulesProgress[quizId];
                        const words = getDicteeWordsForLevel(dictee, levelDef.key);
                        const notStarted = (dicteeProgress?.level || 0) === 0;
                        const isFirst = unlocked && notStarted && !firstNotStartedSeen;
                        if (isFirst) firstNotStartedSeen = true;
                        const aidx = animIdx++;
                        return (
                          <div key={quizId} style={{ opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(15px)', transition: `all 0.5s ease ${0.15 + aidx * 0.08}s` }}>
                            <DicteeCard
                              dictee={dictee}
                              level={levelDef.key}
                              progress={dicteeProgress}
                              locked={!unlocked}
                              onPlay={(d, lvl) => onPlayDictee?.(d, lvl)}
                              onLevelHelp={(lvlKey) => setLevelHelp({ level: lvlKey, ruleTitle: dictee.title, ruleProgress: dicteeProgress })}
                              wordCount={words?.length || 0}
                              isFirst={isFirst}
                              pandaMood={dashboardCharMood}
                              characterId={getCharacterForRule(dictee.id, allDicteeIds, shopOwned)}
                              onCharacterClick={() => setMoodTooltip(true)}
                            />
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Export + Debug reset */}
        <div style={{ marginTop: '2.5rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
          <button onClick={() => exportProgress(progress)} style={{
            padding: '0.5rem 1.2rem', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)',
            color: '#4b5563', cursor: 'pointer', fontSize: '0.72rem',
          }}>
            Exporter
          </button>
          {isDebug && (
            <button onClick={async () => {
              if (confirm('Réinitialiser toute la progression, les pièces et les achats ?')) {
                const result = await clearCurrentStoredProgress();
                if (result?.success) window.location.reload();
              }
            }} style={{
              padding: '0.5rem 1.2rem', borderRadius: 8,
              border: '1px solid rgba(248,113,113,0.25)', background: 'rgba(248,113,113,0.08)',
              color: '#f87171', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700,
            }}>
              Réinitialiser
            </button>
          )}
        </div>
      </div>

      {/* ── Debug panel: fixed overlay ── */}
      {isDebug && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999 }}>
          {/* Toggle tab */}
          <div
            onClick={() => setDebugOpen(o => !o)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
              margin: '0 0 0 16px', padding: '0.3rem 0.9rem',
              background: 'rgba(30,20,40,0.95)', border: '1px solid rgba(248,113,113,0.35)',
              borderBottom: 'none', borderRadius: '8px 8px 0 0',
              cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, color: '#f87171',
            }}
          >
            🛠 DEBUG {debugOpen ? '▼' : '▲'}
          </div>
          {debugOpen && (
        <div style={{
          padding: '1rem 1.2rem',
          background: 'rgba(20,10,30,0.97)',
          border: '1px solid rgba(248,113,113,0.2)',
          borderBottom: 'none',
          maxHeight: '60vh', overflowY: 'auto',
        }}>
          <div style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.7rem' }}>
            🛠 Debug — Animations
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
            {[
              { label: '⚡ Frappe de foudre', fn: () => setShowLightning(true), color: '#fde047' },
              { label: '✨ Explosion d\'étoiles', fn: () => setShowStars(true), color: '#fbbf24' },
              { label: '🔥 Inferno', fn: () => setShowInferno(true), color: '#f97316' },
              { label: '❄️ Freeze', fn: () => setShowFreeze(true), color: '#38bdf8' },
            ].map(({ label, fn, color }) => (
              <button key={label} onClick={fn} style={{
                padding: '0.38rem 0.8rem', borderRadius: 6,
                border: `1px solid ${color}55`,
                background: `${color}18`,
                color, cursor: 'pointer',
                fontSize: '0.72rem', fontWeight: 700,
              }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.7rem' }}>
            🐾 Debug — Perso actif
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.8rem' }}>
            {[
              { mood: null,        label: '🚶 Marche',         color: '#86efac' },
              { mood: 'wave',      label: '👋 Coucou',          color: '#86efac' },
              { mood: 'clap',      label: '👏 Applaudissements', color: '#fde047' },
              { mood: 'kiss',      label: '😘 Bisous',          color: '#f472b6' },
              { mood: 'sleep',     label: '😴 Dodo',            color: '#93c5fd' },
              { mood: 'dance',     label: '🕺 Danse',           color: '#a78bfa' },
              { mood: 'surprise',  label: '😲 Surprise',        color: '#fbbf24' },
              { mood: 'victory',   label: '🏆 Victoire',        color: '#fbbf24' },
              { mood: 'think',     label: '🤔 Réflexion',       color: '#60a5fa' },
              { mood: 'sit',       label: '🪑 Assis',           color: '#67e8f9' },
            ].map(({ mood, label, color }) => (
              <button key={label} onClick={() => setPandaMood(mood)} style={{
                padding: '0.38rem 0.8rem', borderRadius: 6,
                border: `1px solid ${color}55`,
                background: pandaMood === mood ? `${color}40` : `${color}18`,
                color, cursor: 'pointer',
                fontSize: '0.72rem', fontWeight: 700,
                outline: pandaMood === mood ? `1px solid ${color}` : 'none',
              }}>
                {label}
              </button>
            ))}
          </div>
          {/* ── Ménagerie ─────────────────────────────────────────── */}
          <div style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.7rem' }}>
            🐾 Ménagerie — {CHARACTERS.length} personnages
          </div>
          {/* ── Boutique ──────────────────────────────────────────── */}
          <div style={{ marginBottom: '0.9rem' }}>
            <div style={{ fontSize: '0.6rem', color: '#a78bfa', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem', opacity: 0.85 }}>
              Boutique ({SHOP_CHARACTERS.length})
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.35rem' }}>
              {SHOP_CHARACTERS.map(ch => (
                <div key={ch.id} style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  background: `${ch.color}12`,
                  border: `1px solid ${ch.color}35`,
                  borderRadius: 10, padding: '0.45rem 0.3rem 0.5rem',
                  gap: '0.1rem',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', marginBottom: '0.1rem' }}>
                    <div style={{ fontSize: '1.8rem', lineHeight: 1, filter: `drop-shadow(0 0 4px ${ch.color}80)` }}>
                      {ch.emoji}
                    </div>
                    <div style={{ width: '80%', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                    <div style={{
                      width: 64, height: 58,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: `radial-gradient(circle at 50% 60%, ${ch.color}18 0%, transparent 70%)`,
                      borderRadius: 6,
                    }}>
                      <CharacterSprite id={ch.id} mood={pandaMood || 'walk'} size={40} glow={true} />
                    </div>
                  </div>
                  <span style={{ fontSize: '0.58rem', fontWeight: 700, color: ch.color, textAlign: 'center', lineHeight: 1.2 }}>{ch.name}</span>
                  <span style={{ fontSize: '0.5rem', color: '#9ca3af', textAlign: 'center', lineHeight: 1.2 }}>{ch.price ?? 500} 🪙</span>
                </div>
              ))}
            </div>
          </div>

          {Object.entries(CHARACTER_CATEGORIES).map(([catKey, cat]) => {
            const chars = CHARACTERS.filter(c => c.cat === catKey);
            return (
              <div key={catKey} style={{ marginBottom: '0.9rem' }}>
                <div style={{ fontSize: '0.6rem', color: cat.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.4rem', opacity: 0.85 }}>
                  {cat.label} ({chars.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '0.35rem' }}>
                  {chars.map(ch => (
                    <div key={ch.id} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      background: `${ch.color}12`,
                      border: `1px solid ${ch.color}35`,
                      borderRadius: 10, padding: '0.45rem 0.3rem 0.5rem',
                      gap: '0.1rem',
                      cursor: 'default',
                    }}>
                      {/* Emoji de référence + sprite animé */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', marginBottom: '0.1rem' }}>
                        {/* Emoji référence */}
                        <div style={{ fontSize: '1.8rem', lineHeight: 1, filter: `drop-shadow(0 0 4px ${ch.color}80)` }}>
                          {ch.emoji}
                        </div>
                        <div style={{ width: '80%', height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                        {/* Sprite SVG animé */}
                        <div style={{
                          width: 64, height: 58,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `radial-gradient(circle at 50% 60%, ${ch.color}18 0%, transparent 70%)`,
                          borderRadius: 6,
                        }}>
                          <CharacterSprite id={ch.id} mood={pandaMood || 'walk'} size={40} glow={true} />
                        </div>
                      </div>
                      <span style={{ fontSize: '0.58rem', fontWeight: 700, color: ch.color, textAlign: 'center', lineHeight: 1.2 }}>{ch.name}</span>
                      <span style={{ fontSize: '0.5rem', color: '#6b7280', textAlign: 'center', lineHeight: 1.2 }}>{ch.tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.7rem' }}>
            🛠 Debug — Flamme
          </div>
          <div style={{ marginBottom: '0.8rem' }}>
            <button
              onClick={() => {
                const body = document.body;
                const foldId = '__debug_fold_line__';
                if (body.style.maxWidth === '390px') {
                  body.style.maxWidth = '';
                  body.style.margin = '';
                  body.style.boxShadow = '';
                  body.style.position = '';
                  document.getElementById(foldId)?.remove();
                } else {
                  body.style.maxWidth = '390px';
                  body.style.margin = '0 auto';
                  body.style.boxShadow = '0 0 0 9999px rgba(0,0,0,0.5)';
                  body.style.position = 'relative';
                  if (!document.getElementById(foldId)) {
                    const el = document.createElement('div');
                    el.id = foldId;
                    el.style.cssText = `
                      position: absolute; top: 844px; left: 0; right: 0; z-index: 99999;
                      border-top: 2px dashed #ef4444;
                      pointer-events: none;
                    `;
                    const label = document.createElement('span');
                    label.textContent = '— ligne de flottaison 844px —';
                    label.style.cssText = `
                      position: absolute; top: 2px; left: 50%; transform: translateX(-50%);
                      background: #ef4444; color: white; font-size: 10px; font-weight: 700;
                      padding: 1px 6px; border-radius: 3px; white-space: nowrap;
                    `;
                    el.appendChild(label);
                    document.body.appendChild(el);
                  }
                }
              }}
              style={{
                padding: '0.38rem 0.9rem', borderRadius: 6,
                border: '1px solid rgba(167,139,250,0.3)',
                background: 'rgba(167,139,250,0.1)',
                color: '#c4b5fd', cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 700,
              }}
            >
              📱 Toggle vue mobile (390px)
            </button>
          </div>
          <div style={{ marginBottom: '0.8rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <a
                href="/admin"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.38rem 0.9rem',
                  borderRadius: 6,
                  border: '1px solid rgba(var(--color-primary-rgb),0.22)',
                  background: 'rgba(var(--color-primary-rgb),0.1)',
                  color: 'var(--color-accent)',
                  textDecoration: 'none',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                Ouvrir /admin
              </a>
            </div>
          </div>
          <div style={{
            display: 'flex',
            gap: '0.6rem',
            alignItems: isCompactLayout ? 'stretch' : 'flex-end',
            flexWrap: 'wrap',
            flexDirection: isCompactLayout ? 'column' : 'row',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
              <label style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Flamme (jours)</label>
              <input
                type="number"
                min="0"
                value={debugStreak}
                onChange={e => setDebugStreak(e.target.value)}
                style={{
                  width: isCompactLayout ? '100%' : 70, padding: '0.35rem 0.5rem', borderRadius: 6,
                  border: '1px solid rgba(248,113,113,0.3)',
                  background: 'rgba(0,0,0,0.3)', color: '#e2e2e2',
                  fontSize: '0.85rem', fontWeight: 700,
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', minWidth: 0 }}>
              <label style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Dernière date active</label>
              <input
                type="date"
                value={debugDate}
                onChange={e => setDebugDate(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.35rem 0.5rem', borderRadius: 6,
                  border: '1px solid rgba(248,113,113,0.3)',
                  background: 'rgba(0,0,0,0.3)', color: '#e2e2e2',
                  fontSize: '0.82rem',
                }}
              />
            </div>
            <button
              onClick={() => {
                const n = parseInt(debugStreak, 10);
                if (!isNaN(n) && n >= 0 && debugDate) {
                  onDebugUpdateStreak(n, debugDate);
                }
              }}
              style={{
                width: isCompactLayout ? '100%' : 'auto',
                padding: '0.38rem 0.9rem', borderRadius: 6,
                border: '1px solid rgba(248,113,113,0.3)',
                background: 'rgba(248,113,113,0.12)',
                color: '#f87171', cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 700,
              }}
            >
              Appliquer
            </button>
          </div>

          {/* Coaching debug */}
          <div style={{ marginTop: '0.8rem', paddingTop: '0.7rem', borderTop: '1px dashed rgba(96,205,255,0.15)' }}>
            <div style={{ fontSize: '0.65rem', color: '#60cdff', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>
              🧠 Coaching
            </div>
            <button
              onClick={() => {
                onProgressChange?.({ ...progress, coaching: createDefaultCoaching() });
                setTimeout(() => window.location.reload(), 150);
              }}
              style={{
                padding: '0.38rem 0.9rem', borderRadius: 6,
                border: '1px solid rgba(96,205,255,0.3)',
                background: 'rgba(96,205,255,0.1)',
                color: '#60cdff', cursor: 'pointer',
                fontSize: '0.72rem', fontWeight: 700,
              }}
            >
              Reset coaching flags
            </button>
            <div style={{ marginTop: '0.4rem', fontSize: '0.6rem', color: '#6b7280', lineHeight: 1.6, maxHeight: 80, overflowY: 'auto' }}>
              {Object.entries(progress.coaching?.shown || {}).map(([arcId, date]) => (
                <div key={arcId}>{arcId}: {date}</div>
              ))}
            </div>
          </div>

          {/* Coins setter */}
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: '0.6rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Pièces</label>
              <input
                type="number"
                min="0"
                value={debugCoins}
                onChange={e => setDebugCoins(e.target.value)}
                style={{
                  width: isCompactLayout ? '100%' : 90, padding: '0.35rem 0.5rem', borderRadius: 6,
                  border: '1px solid rgba(251,191,36,0.3)',
                  background: 'rgba(0,0,0,0.3)', color: '#fbbf24',
                  fontSize: '0.85rem', fontWeight: 700,
                }}
              />
            </div>
            <button
              onClick={() => {
                const n = parseInt(debugCoins, 10);
                if (!isNaN(n) && n >= 0) onDebugSetCoins(n);
              }}
              style={{
                padding: '0.38rem 0.9rem', borderRadius: 6,
                border: '1px solid rgba(251,191,36,0.3)',
                background: 'rgba(251,191,36,0.12)',
                color: '#fbbf24', cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 700,
              }}
            >
              Appliquer
            </button>
          </div>

          {/* Session size setter */}
          {onDebugSetSessionSize && (
            <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-end', flexWrap: 'wrap', marginTop: '0.6rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Questions par session</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={sessionSize || 20}
                  onChange={e => {
                    const n = Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1));
                    onDebugSetSessionSize(n);
                  }}
                  style={{
                    width: isCompactLayout ? '100%' : 70, padding: '0.35rem 0.5rem', borderRadius: 6,
                    border: '1px solid rgba(74,222,128,0.3)',
                    background: 'rgba(0,0,0,0.3)', color: '#4ade80',
                    fontSize: '0.85rem', fontWeight: 700,
                  }}
                />
              </div>
            </div>
          )}

          {onDebugRestoreBackup && (
            <div style={{
              marginTop: '1rem',
              paddingTop: '0.9rem',
              borderTop: '1px dashed rgba(248,113,113,0.18)',
            }}>
              <div style={{ fontSize: '0.65rem', color: '#fca5a5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.6rem' }}>
                Sauvegardes quotidiennes
              </div>
              {dailyBackups.length === 0 ? (
                <div style={{ fontSize: '0.78rem', color: '#9ca3af' }}>
                  Aucune sauvegarde quotidienne disponible.
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '0.45rem' }}>
                  {[...dailyBackups].reverse().map((backup) => (
                    <div
                      key={`${backup.profile || 'prod'}-${backup.date}`}
                      style={{
                        display: 'flex',
                        alignItems: isCompactLayout ? 'stretch' : 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        padding: '0.55rem 0.65rem',
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        flexDirection: isCompactLayout ? 'column' : 'row',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '0.82rem', color: '#fff', fontWeight: 700 }}>
                          {backup.date}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: '#fca5a5', fontWeight: 700 }}>
                          {backup.profile === 'debug' ? 'Profil debug' : 'Profil Damien'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af' }}>
                          {new Date(backup.savedAt).toLocaleString('fr-FR')}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          if (!confirm(`Restaurer la sauvegarde du ${backup.date} (${backup.profile === 'debug' ? 'profil debug' : 'profil Damien'}) ?`)) return;
                          setRestoringBackupDate(`${backup.profile || 'prod'}-${backup.date}`);
                          const ok = await onDebugRestoreBackup(backup);
                          setRestoringBackupDate(null);
                          if (ok) window.location.reload();
                        }}
                        disabled={restoringBackupDate === `${backup.profile || 'prod'}-${backup.date}`}
                        style={{
                          width: isCompactLayout ? '100%' : 'auto',
                          padding: '0.35rem 0.75rem',
                          borderRadius: 8,
                          border: '1px solid rgba(248,113,113,0.28)',
                          background: 'rgba(248,113,113,0.12)',
                          color: '#fca5a5',
                          cursor: 'pointer',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          opacity: restoringBackupDate === `${backup.profile || 'prod'}-${backup.date}` ? 0.65 : 1,
                        }}
                      >
                        {restoringBackupDate === `${backup.profile || 'prod'}-${backup.date}` ? 'Restauration...' : 'Restaurer'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
          )}
        </div>
      )}
    </div>

    {/* =====================================================================
      Flamme Help Popup
    ===================================================================== */}
    {showStreakHelp && (
      <div
        onClick={() => setShowStreakHelp(false)}
        className="streak-help-overlay"
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000,
          animation: 'fade-in 0.2s ease',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="streak-help-shell"
        >
          <PopupCloseButton
            onClick={() => setShowStreakHelp(false)}
            ariaLabel="Fermer la fenêtre flamme"
          />

          <div
            className="streak-help-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="streak-help-title"
            aria-describedby="streak-help-description"
          >
            <div className="streak-help-main">
              <div className="streak-help-hero">
                <div className="streak-help-flame">
                  <CosmeticFlameIcon size={52} intensity={getFlameIntensity(streak)} flameId={equippedFlame} />
                </div>
                <div className="streak-help-counter">
                  <span className="streak-help-counter-value">{streak}</span>
                  <span className="streak-help-counter-label">jour{streak !== 1 ? 's' : ''}</span>
                </div>
              </div>

              <div className="streak-help-body">
              <p className="streak-help-kicker">Pourquoi y faire attention</p>
              <h2
                id="streak-help-title"
                style={{
                    fontSize: '1.85rem',
                    lineHeight: 1.05,
                    fontWeight: 800,
                    color: '#fff7ed',
                    margin: '0 0 0.35rem',
                    fontFamily: 'var(--font-display)',
                  }}
                >
                  {streakHeadline}
                </h2>
                <p
                  id="streak-help-description"
                  style={{
                    fontSize: '0.98rem',
                    color: '#d6d3d1',
                    lineHeight: 1.5,
                    margin: '0 0 1rem',
                    maxWidth: 440,
                  }}
                >
                  {streakSupportText}
                </p>

              <div className="streak-help-stats">
                <div className="streak-help-stat-card">
                  <span className="streak-help-stat-label">Prochain cap utile</span>
                  <strong className="streak-help-stat-value">{nextUsefulLabel}</strong>
                  <span className="streak-help-stat-hint">{nextUsefulText}</span>
                </div>
                <div className="streak-help-stat-card streak-help-stat-card--shield">
                  <span className="streak-help-stat-label">Si tu l'ignores</span>
                  <strong className="streak-help-stat-value">{riskValue}</strong>
                  <span className="streak-help-stat-hint">{riskText}</span>
                </div>
              </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Level help popup */}
    {levelHelp && (
      <LevelHelpPopup
        level={levelHelp.level}
        ruleTitle={levelHelp.ruleTitle}
        ruleProgress={levelHelp.ruleProgress}
        onClose={() => setLevelHelp(null)}
      />
    )}

    {/* ── Bug report modal (partagé grammaire + dictée) ── */}
    {bugTarget && (
      <div
        onClick={() => { setBugTarget(null); setBugDesc(''); setBugCopied(false); }}
        style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1rem',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#1e1e2e', borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '1.4rem 1.5rem', width: 'min(420px, 100%)',
            display: 'grid', gap: '0.9rem',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 800, fontSize: '1rem', color: '#e2e2e2' }}>
              🐛 Signaler un problème
            </span>
            <button
              onClick={() => { setBugTarget(null); setBugDesc(''); setBugCopied(false); }}
              style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: '1.2rem', cursor: 'pointer', lineHeight: 1 }}
            >✕</button>
          </div>
          <div style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--color-accent)' }}>{bugTarget.title}</strong>
            {bugTarget.type === 'dictee' && bugTarget.level && (
              <span> — {bugTarget.level === 'level1' ? 'Aventurier' : bugTarget.level === 'level2' ? 'Héros' : 'Légende'}</span>
            )}
          </div>
          <textarea
            value={bugDesc}
            onChange={(e) => setBugDesc(e.target.value)}
            placeholder="Décris le problème rencontré..."
            rows={3}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 10, padding: '0.7rem', color: '#e2e2e2',
              fontSize: '0.85rem', resize: 'vertical', outline: 'none',
            }}
          />
          <button
            onClick={() => {
              const text = [
                `${bugTarget.type === 'rule' ? 'Règle' : 'Dictée'} : ${bugTarget.title} (${bugTarget.id})`,
                bugTarget.level ? `Groupe : ${bugTarget.level}` : '',
                `Problème : ${bugDesc || '(non renseigné)'}`,
              ].filter(Boolean).join('\n');
              navigator.clipboard?.writeText(text).then(() => {
                setBugCopied(true);
                setTimeout(() => setBugCopied(false), 2500);
              });
            }}
            style={{
              padding: '0.7rem', borderRadius: 10, border: 'none',
              background: bugCopied
                ? 'linear-gradient(135deg, #059669, #34d399)'
                : 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              color: '#fff', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700,
            }}
          >
            {bugCopied ? '✓ Copié !' : 'Copier le rapport'}
          </button>
        </div>
      </div>
    )}

    {memoRule && (
      <div
        onClick={() => setMemoRule(null)}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.66)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1020,
          animation: 'fade-in 0.2s ease',
        }}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="streak-help-shell"
        >
          <PopupCloseButton onClick={() => setMemoRule(null)} ariaLabel="Fermer la fiche mémo" />

          <div
          style={{
            width: 'min(680px, 92vw)',
            maxHeight: 'calc(100vh - 2rem)',
            overflowY: 'auto',
            padding: '1.4rem 1.3rem 1.25rem',
            borderRadius: 22,
            border: '1px solid rgba(var(--color-primary-rgb),0.22)',
            background: 'linear-gradient(160deg, rgba(var(--color-bg1-rgb),0.98), rgba(var(--color-bg2-rgb),0.97))',
            boxShadow: '0 20px 80px rgba(0,0,0,0.56)',
            animation: 'bounce-in 0.3s ease forwards',
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="memo-popup-title"
        >
          <div style={{
            fontSize: '0.68rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
            fontWeight: 800,
            color: 'var(--color-accent)',
            marginBottom: '0.35rem',
          }}>
            Fiche mémo
          </div>
          <h2
            id="memo-popup-title"
            style={{
              fontSize: '1.45rem',
              lineHeight: 1.08,
              fontWeight: 800,
              color: '#f5f3ff',
              margin: '0 0 0.28rem',
              fontFamily: 'var(--font-display)',
            }}
          >
            {memoRule.title}
          </h2>
          <p style={{
            fontSize: '0.92rem',
            color: '#a1a1aa',
            lineHeight: 1.5,
            margin: '0 0 1rem',
          }}>
            {memoRule.memoCard?.title || 'Rappel rapide de la règle.'}
          </p>

          <div style={{ display: 'grid', gap: '0.6rem' }}>
            {(memoRule.memoCard?.rows || []).map((row, index) => (
              <div
                key={`${memoRule.id}-memo-${index}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '88px minmax(0, 1fr)',
                  gap: '0.8rem',
                  alignItems: 'start',
                  padding: '0.85rem 0.9rem',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                <div style={{
                  fontSize: '0.96rem',
                  fontWeight: 800,
                  color: '#fbbf24',
                  lineHeight: 1.2,
                }}>
                  {row.form}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: '0.83rem',
                    color: '#e4e4e7',
                    fontWeight: 700,
                    marginBottom: row.example ? '0.2rem' : 0,
                    lineHeight: 1.35,
                  }}>
                    {row.test}
                  </div>
                  {row.example && (
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#9ca3af',
                      lineHeight: 1.45,
                    }}>
                      {row.example}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        </div>
      </div>
    )}

    {/* Debug: Rule Editor */}
    {editingRule && (
      <RuleEditor
        rule={editingRule}
        onSave={(updated) => {
          // Mutate the rule in-place (debug only — lost on reload)
          Object.assign(editingRule, updated);
          setEditingRule(null);
        }}
        onClose={() => setEditingRule(null)}
      />
    )}
    </>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SectionLabel({ children }) {
  return (
    <div style={{
      fontSize: '0.78rem', color: '#6b7280', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: '0.8rem', paddingLeft: '0.2rem',
    }}>
      {children}
    </div>
  );
}

function LevelBadge({ icon, count, color, label, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.3rem',
        background: `${color}10`,
        border: `1px solid ${color}25`,
        borderRadius: 10, padding: '0.3rem 0.6rem',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.15s ease',
      }}
    >
      {icon}
      <span style={{ fontSize: '0.82rem', fontWeight: 800, color }}>
        {count}
      </span>
      <span style={{ fontSize: '0.62rem', color: '#6b7280', fontWeight: 600 }}>
        {label}
      </span>
    </div>
  );
}


const specialActionButtonStyle = {
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  gap: '0.8rem',
  padding: '0.9rem 1rem',
  borderRadius: 16,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'rgba(255,255,255,0.04)',
  cursor: 'pointer',
  color: 'inherit',
};

const badgeStyle = {
  minWidth: 28,
  padding: '0.2rem 0.45rem',
  borderRadius: 999,
  background: 'rgba(251,191,36,0.14)',
  color: '#fbbf24',
  fontSize: '0.75rem',
  fontWeight: 800,
  textAlign: 'center',
};

function DiamondSparkBadge() {
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <DiamondIcon size={14} active animate={false} />
      <span style={{
        position: 'absolute', top: -3, right: -5,
        fontSize: '0.4rem',
        animation: 'glow-gold 2s ease-in-out infinite',
      }}>
        {'✨'}
      </span>
    </div>
  );
}

const pageStyle = {
  minHeight: '100vh',
  backgroundColor: 'var(--color-bg1)',
  backgroundImage: 'var(--app-page-overlay), var(--app-page-image)',
  backgroundSize: 'cover, cover',
  backgroundPosition: 'center, center',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  fontFamily: 'var(--font-body)',
  color: '#e2e2e2',
};

import { useState, useEffect, useRef, useCallback } from 'react';
import RuleCard from './RuleCard.jsx';
import CoinIcon from './CoinIcon.jsx';
import ShieldIcon from './ShieldIcon.jsx';
import CrownIcon from './CrownIcon.jsx';
import DiamondIcon from './DiamondIcon.jsx';
import DiamondStatus from './DiamondStatus.jsx';
import PopupCloseButton from './PopupCloseButton.jsx';
import LevelHelpPopup from './LevelHelpPopup.jsx';
import RuleEditor from './RuleEditor.jsx';
import CosmeticFlameIcon from './CosmeticFlameIcon.jsx';
import { clearCurrentStoredProgress } from '../store/persistence.js';
import { getStreakInfo } from '../engine/scoring.js';
import { getToday } from '../engine/sm2.js';
import { getEquipped, SHOP_CATALOG } from '../engine/economy.js';
import { exportProgress } from '../store/persistence.js';

// ---------------------------------------------------------------------------
// FIX 1 & FIX 3 — Corrected milestone messages with proper French accents
// ---------------------------------------------------------------------------
const MILESTONE_MESSAGES = {
  3: "3 jours de suite — tu tiens le cap.\nProchain palier : 7 jours \u2192 +50 pi\u00e8ces et un bouclier.",
  7: "Une semaine sans faillir. +50 pi\u00e8ces et 1 bouclier gagn\u00e9 !\nProchain palier : 14 jours \u2192 +100 pi\u00e8ces.",
  14: "14 jours. Inarr\u00eatable. +100 pi\u00e8ces !\nProchain palier : 30 jours \u2192 +150 pi\u00e8ces.",
  30: "Un mois. Tu t'es prouv\u00e9 quelque chose. +150 pi\u00e8ces !\nProchain palier : 60 jours \u2192 +300 pi\u00e8ces.",
  60: "60 jours. C'est devenu une partie de toi. +300 pi\u00e8ces !\nProchain palier : 100 jours \u2192 +500 pi\u00e8ces.",
  100: "100 jours. L\u00e9gendaire. +500 pi\u00e8ces !\nTu as tout d\u00e9bloqu\u00e9.",
};

// ---------------------------------------------------------------------------
// FIX 1 — Complete event type to message/icon mapping
// ---------------------------------------------------------------------------
const EVENT_CONFIG = {
  firstSession:     { msg: "Premi\u00e8re session termin\u00e9e, ton streak passe \u00e0 1 !\nReviens demain pour le faire grimper.", icon: '🔥' },
  firstQuiz:        { msg: "Premi\u00e8re session termin\u00e9e, ton streak passe \u00e0 1 !\nReviens demain pour le faire grimper.", icon: '🔥' },
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
  coinsEarned:      null, // skip — silent event
  firstSessionOfDay: null, // skip
  doubleCoins:      null, // skip
  levelMilestoneCoins: null, // skip
  milestone:        { icon: '🎯' }, // dynamic — handled in buildOverlayData
};

const STREAK_MILESTONE_COINS = {
  7: 50,
  14: 100,
  30: 150,
  60: 300,
  100: 500,
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
  for (const rule of rules) {
    const rp = progress.rules?.[rule.id];
    const level = getRuleLevel(rp);
    if (level === 5) summary.diamondVivant++;
    else if (level === 4) summary.diamant++;
    else if (level === 3) summary.couronne++;
    else if (level >= 1) summary.enCours++;
    else summary.nouveau++;
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
    if (evt.value === 'firstSession') {
      return null; // Already covered by firstSession/firstQuiz event type
    } else if (typeof evt.streak === 'number') {
      msg = MILESTONE_MESSAGES[evt.streak] || `Streak de ${evt.streak} jours\ !`;
      icon = '🔥';
    } else {
      msg = MILESTONE_MESSAGES[evt.value] || `Streak de ${evt.value} jours\ !`;
      icon = '🔥';
    }
  } else if (evt.type === 'streakMilestone') {
    msg = MILESTONE_MESSAGES[evt.value] || `Streak de ${evt.value} jours\ !`;
    icon = '🔥';
  } else if (evt.type === 'shieldUsed') {
    msg = `Bouclier activé — ton streak de ${evt.value} jours est sauvé.`;
    sub = 'Un bouclier a été consommé.';
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
      msg = "Pas de chance hier — ton streak est tombé.";
      if (affordable >= 2) {
        sub = `Tu as ${coins} pièces, tu peux acheter ${affordable} boucliers (${SHIELD_PRICE} pièces chacun) pour te protéger les prochains jours.`;
      } else {
        sub = `Tu as ${coins} pièces, tu peux acheter 1 bouclier (${SHIELD_PRICE} pièces) pour te protéger la prochaine fois.`;
      }
    } else {
      msg = "Pas de chance hier — ton streak est tombé.";
      sub = "Ça arrive. L'important c'est de revenir aujourd'hui.";
    }
  } else if (evt.type === 'levelUp' && evt.value) {
    const lvl = evt.value;
    const ruleName = evt.ruleTitle || '';
    const n = (typeof window !== 'undefined' && window.__ORTHO_SESSION_SIZE__) || 20;
    const s80 = `${Math.ceil(n * 0.8)}/${n}`;
    const s90 = `${Math.ceil(n * 0.9)}/${n}`;

    if (lvl === 1) {
      msg = `Bronze sur ${ruleName}`;
      sub = `Prochain niveau : Argent. Fais 3 sessions guid\u00e9es avec ${s80} ou mieux.`;
      icon = '\u2B50';
    } else if (lvl === 2) {
      msg = `Argent sur ${ruleName}`;
      sub = `Mode direct d\u00e9bloqu\u00e9 ! Prochain : Couronne. Fais 3 sessions directes avec ${s80} ou mieux.`;
      icon = '\u2B50\u2B50';
    } else if (lvl === 3) {
      msg = `Couronne sur ${ruleName}`;
      sub = `Prochain : Diamant. Fais 3 sessions directes cons\u00e9cutives avec ${s90} ou mieux.`;
      icon = '\uD83D\uDC51';
    } else if (lvl === 4) {
      msg = `Diamant sur ${ruleName}`;
      sub = "Le diamant est vivant. Maintiens-le avec des r\u00e9visions r\u00e9guli\u00e8res.";
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
  onPlay,
  onOpenShop,
  pendingEvents,
  onEventsSeen,
  onSniper,
  onRematch,
  canRematch,
  lastSessionRuleId,
  lastSessionScore,
  onDebugUpdateStreak,
  onDebugUpdateSecretCode,
  debugSecretCode,
  dailyBackups = [],
  onDebugRestoreBackup,
}) {
  const [overlay, setOverlay] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showStreakHelp, setShowStreakHelp] = useState(false);
  const [levelHelp, setLevelHelp] = useState(null); // { level: 'bronze', ruleTitle, ruleProgress }
  const [editingRule, setEditingRule] = useState(null); // rule object being edited
  const [memoRule, setMemoRule] = useState(null);
  const isDebug = typeof window !== 'undefined' && window.__ORTHO_DEBUG__;
  const overlayTimeoutsRef = useRef([]);
  const [debugStreak, setDebugStreak] = useState(String(progress.streak?.current || 0));
  const [debugDate, setDebugDate] = useState(progress.streak?.lastActiveDate || '');
  const [debugSecret, setDebugSecret] = useState(debugSecretCode || '');
  const [restoringBackupDate, setRestoringBackupDate] = useState(null);

  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);
  useEffect(() => { setDebugSecret(debugSecretCode || ''); }, [debugSecretCode]);

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
  }, [onEventsSeen]);

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
  const equippedBackground = getEquipped(progress, 'dashboardBackground');

  const summary = computeGlobalLevelSummary(rules, progress);

  // A6 — Split rules into sections
  const { revisions, inProgress, toDiscover } = splitRulesIntoSections(rules, progress);

  const sniperCharges = progress.shop?.inventory?.modeSniper || 0;
  const lastRuleTitle = rules.find(rule => rule.id === lastSessionRuleId)?.shortTitle
    || rules.find(rule => rule.id === lastSessionRuleId)?.title
    || null;

  // A4 — Only show level summary if there's at least one crown or diamond
  const showLevelSummary = summary.couronne > 0 || summary.diamant > 0 || summary.diamondVivant > 0;
  const streakHeadline = streak > 0
    ? `${streak} jour${streak > 1 ? 's' : ''} d'affilée`
    : 'Allume la première flamme';
  const streakSupportText = streak > 0
    ? 'Ton streak te donne des pièces aux paliers 7, 14, 30, 60 et 100 jours, et peut te rapporter un bouclier tous les 7 jours.'
    : 'Lance ta première session pour démarrer ton streak.';
  const nextCoinMilestone = [7, 14, 30, 60, 100].find((day) => day > streak) || null;
  const nextCoinReward = nextCoinMilestone ? STREAK_MILESTONE_COINS[nextCoinMilestone] : null;
  const nextShieldDay = shields >= 2 ? null : Math.max(7, Math.ceil((streak + 1) / 7) * 7);
  const nextUsefulDay = Math.min(nextCoinMilestone ?? Infinity, nextShieldDay ?? Infinity);
  const nextUsefulLabel = Number.isFinite(nextUsefulDay) ? `${nextUsefulDay} jours` : 'Streak solide';
  const nextUsefulBenefits = [];
  if (Number.isFinite(nextUsefulDay) && nextUsefulDay === nextCoinMilestone && nextCoinReward !== null) {
    nextUsefulBenefits.push(`+${nextCoinReward} pièces`);
  }
  if (Number.isFinite(nextUsefulDay) && nextUsefulDay === nextShieldDay) {
    nextUsefulBenefits.push('+1 bouclier');
  }
  const nextUsefulText = Number.isFinite(nextUsefulDay)
    ? nextUsefulBenefits.join(' et ')
    : 'Tous les gros paliers de pièces sont déjà passés.';
  const riskValue = shields > 0 ? 'Un jour raté = 1 bouclier consommé' : 'Un jour raté = retour à 1';
  const riskText = shields > 0
    ? 'Sans bouclier derrière, le prochain jour manqué casse la série et repousse les gains.'
    : "La série retombe et les prochaines pièces s'éloignent.";

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
    <div style={{ ...pageStyle, position: 'relative', overflow: 'hidden' }}>
      <DashboardBackground backgroundId={equippedBackground} />
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
        maxWidth: 640, width: '100%', padding: '0 1.5rem 3rem',
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
          background: 'rgba(var(--color-bg1-rgb),0.9)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          padding: '0.6rem 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          {/* Left side: flame + streak count + tier + today done badge */}
          {streak > 0 ? (
            <button
              type="button"
              onClick={() => setShowStreakHelp(true)}
              className="streak-help-trigger"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              aria-label="En savoir plus sur le streak"
            >
              <CosmeticFlameIcon size={36} intensity={getFlameIntensity(streak)} flameId={equippedFlame} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span style={{
                    fontSize: '1.6rem', fontWeight: 900,
                    color: '#fbbf24',
                    textShadow: '0 0 10px rgba(251,191,36,0.3)',
                    lineHeight: 1,
                  }}>
                    <AnimatedNumber value={streak} />
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 700 }}>
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
                  <div style={{ fontSize: '0.72rem', color: '#d4a020', fontWeight: 700, letterSpacing: '0.03em' }}>
                    {displayTitle}
                  </div>
                )}
              </div>
            </button>
          ) : (
            /* Streak is 0: just show a muted flame */
            <button
              type="button"
              onClick={() => setShowStreakHelp(true)}
              className="streak-help-trigger"
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
              aria-label="En savoir plus sur le streak"
            >
              <CosmeticFlameIcon size={28} intensity={0} flameId={equippedFlame} />
              <div>
                <span style={{ fontSize: '0.82rem', color: '#4b5563', fontWeight: 700, display: 'block', lineHeight: 1.1 }}>
                  0 jour
                </span>
                {displayTitle && (
                  <span style={{
                    fontSize: '0.72rem',
                    color: '#d4a020',
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
                title="Boucliers\ : protègent ton streak si tu rates un jour"
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
              onClick={onOpenShop}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.3rem',
                background: 'rgba(251,191,36,0.1)',
                border: '1px solid rgba(251,191,36,0.2)',
                borderRadius: 10, padding: '0.35rem 0.7rem',
                cursor: 'pointer', transition: 'all 0.2s ease',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.boxShadow = '0 0 12px rgba(251,191,36,0.3)';
                e.currentTarget.style.background = 'rgba(251,191,36,0.16)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = 'rgba(251,191,36,0.1)';
              }}
            >
              <CoinIcon size={16} />
              <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#fbbf24' }}>
                <AnimatedNumber value={coins} />
              </span>
              <span style={{ fontSize: '0.9rem', marginLeft: '0.15rem' }}>{'🛒'}</span>
            </button>
          </div>
        </div>

        {/* =====================================================================
          A5 — Conditional greeting: only show if !todayDone
        ===================================================================== */}
        {!todayDone && (
          <div style={{ textAlign: 'center', padding: '0.5rem 1rem 0.8rem' }}>
            <h1 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', margin: '0 0 0.3rem', letterSpacing: '-0.02em' }}>
              {getGreeting()}, Damien
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

        {(sniperCharges > 0 || canRematch) && (
          <div style={{ marginTop: '1.2rem' }}>
            <SectionLabel>COUPS SPÉCIAUX</SectionLabel>
            <div style={{ display: 'grid', gap: '0.6rem' }}>
              {sniperCharges > 0 && (
                <button
                  onClick={onSniper}
                  style={specialActionButtonStyle}
                >
                  <span style={{ fontSize: '1.2rem' }}>{'🎯'}</span>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                      Mode Sniper
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                      5 questions difficiles, toutes règles confondues.
                    </div>
                  </div>
                  <span style={badgeStyle}>
                    {sniperCharges}
                  </span>
                </button>
              )}

              {canRematch && (
                <button
                  onClick={onRematch}
                  style={specialActionButtonStyle}
                >
                  <span style={{ fontSize: '1.2rem' }}>{'↺'}</span>
                  <div style={{ flex: 1, textAlign: 'left' }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                      Revanche
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#9ca3af' }}>
                      {lastRuleTitle
                        ? `${lastRuleTitle} — ${lastSessionScore}%`
                        : 'Refais immédiatement ta dernière session.'}
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>
        )}

        {/* =====================================================================
          A6 — Separated rule sections
        ===================================================================== */}

        {/* ---- Section 1: Révisions du jour ---- */}
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
                  <div key={rule.id} style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(15px)',
                    transition: `all 0.5s ease ${0.15 + idx * 0.08}s`,
                  }}>
                    <RuleCard
                      rule={rule}
                      ruleProgress={rp}
                      onPlay={onPlay}
                      onOpenMemo={setMemoRule}
                      onLevelHelp={(lvlKey) => setLevelHelp({ level: lvlKey, ruleTitle: rule.shortTitle || rule.title, ruleProgress: rp })}
                      onEditRule={isDebug ? (ruleId) => { const r = rules.find(x => x.id === ruleId); if (r) setEditingRule(r); } : undefined}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---- Section 2: Continue ta progression ---- */}
        {inProgress.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <SectionLabel>CONTINUE TA PROGRESSION</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {inProgress.map((rule) => {
                const rp = progress.rules?.[rule.id];
                const idx = animIdx++;
                return (
                  <div key={rule.id} style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(15px)',
                    transition: `all 0.5s ease ${0.15 + idx * 0.08}s`,
                  }}>
                    <RuleCard
                      rule={rule}
                      ruleProgress={rp}
                      onPlay={onPlay}
                      onOpenMemo={setMemoRule}
                      onLevelHelp={(lvlKey) => setLevelHelp({ level: lvlKey, ruleTitle: rule.shortTitle || rule.title, ruleProgress: rp })}
                      onEditRule={isDebug ? (ruleId) => { const r = rules.find(x => x.id === ruleId); if (r) setEditingRule(r); } : undefined}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ---- Section 3: À découvrir ---- */}
        {toDiscover.length > 0 && (
          <div style={{ marginTop: '1.5rem' }}>
            <SectionLabel>{'À DÉCOUVRIR'}</SectionLabel>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {toDiscover.map((rule, i) => {
                const idx = animIdx++;
                const isRecommended = i === 0; // First undiscovered rule is the recommended one
                return (
                  <div key={rule.id} style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(15px)',
                    transition: `all 0.5s ease ${0.15 + idx * 0.08}s`,
                  }}>
                    <div style={{
                      display: 'flex', alignItems: 'center',
                      background: isRecommended
                        ? 'rgba(var(--color-primary-rgb),0.08)'
                        : 'rgba(255,255,255,0.04)',
                      border: isRecommended
                        ? '1px solid rgba(var(--color-primary-rgb),0.3)'
                        : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: 14, padding: '0.7rem 1rem',
                      gap: '0.7rem',
                      position: 'relative',
                    }}>
                      <span style={{ fontSize: '1rem', opacity: 0.4 }}>{'🔒'}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <button
                          type="button"
                          onClick={() => setMemoRule(rule)}
                          style={{
                            padding: 0,
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--color-accent)',
                            cursor: 'pointer',
                            fontSize: '0.88rem',
                            fontWeight: 700,
                            textAlign: 'left',
                          }}
                          title="Ouvrir la fiche mémo"
                        >
                          {rule.title}
                        </button>
                        {isRecommended ? (
                          <span style={{
                            fontSize: '0.6rem',
                            background: 'rgba(var(--color-primary-rgb),0.2)',
                            color: 'var(--color-accent)',
                            padding: '0.1rem 0.45rem',
                            borderRadius: 4, fontWeight: 700, marginLeft: '0.5rem',
                            letterSpacing: '0.02em',
                          }}>
                            Prochaine règle recommandée
                          </span>
                        ) : (
                          <span style={{
                            fontSize: '0.62rem', background: 'rgba(107,114,128,0.15)',
                            color: '#6b7280', padding: '0.1rem 0.4rem',
                            borderRadius: 4, fontWeight: 700, marginLeft: '0.5rem',
                          }}>
                            Nouvelle
                          </span>
                        )}
                      </div>
                      {isDebug && (
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingRule(rules.find(x => x.id === rule.id)); }}
                          style={{
                            background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)',
                            borderRadius: 6, padding: '0.15rem 0.35rem', cursor: 'pointer',
                            fontSize: '0.6rem', color: '#f87171', fontWeight: 700, flexShrink: 0,
                          }}
                          title="Debug: éditer la règle"
                        >✏️</button>
                      )}
                      <button
                        onClick={() => onPlay(rule.id, 'guided')}
                        style={{
                          padding: '0.45rem 0.9rem',
                          borderRadius: 10,
                          border: 'none',
                          background: isRecommended
                            ? 'linear-gradient(135deg, #7c3aed, var(--color-primary))'
                            : 'linear-gradient(135deg, #7c3aed, var(--color-primary))',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '0.78rem',
                          fontWeight: 700,
                          flexShrink: 0,
                          boxShadow: isRecommended
                            ? '0 2px 12px rgba(124,58,237,0.35)'
                            : '0 2px 8px rgba(124,58,237,0.25)',
                        }}
                      >
                        Découvrir
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
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

      {/* ── Debug: streak editor ── */}
      {isDebug && onDebugUpdateStreak && (
        <div style={{
          margin: '1.5rem 1rem 0',
          padding: '1rem 1.2rem',
          background: 'rgba(248,113,113,0.05)',
          border: '1px dashed rgba(248,113,113,0.2)',
          borderRadius: 14,
        }}>
          <div style={{ fontSize: '0.65rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.7rem' }}>
            🛠 Debug — Streak
          </div>
          <div style={{ marginBottom: '0.8rem' }}>
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.set('debug', '0');
                window.location.href = url.toString();
              }}
              style={{
                padding: '0.38rem 0.9rem',
                borderRadius: 6,
                border: '1px solid rgba(250,204,21,0.28)',
                background: 'rgba(250,204,21,0.12)',
                color: '#fde68a',
                cursor: 'pointer',
                fontSize: '0.75rem',
                fontWeight: 700,
              }}
            >
              Passer en debug = false
            </button>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Streak (jours)</label>
              <input
                type="number"
                min="0"
                value={debugStreak}
                onChange={e => setDebugStreak(e.target.value)}
                style={{
                  width: 70, padding: '0.35rem 0.5rem', borderRadius: 6,
                  border: '1px solid rgba(248,113,113,0.3)',
                  background: 'rgba(0,0,0,0.3)', color: '#e2e2e2',
                  fontSize: '0.85rem', fontWeight: 700,
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Dernière date active</label>
              <input
                type="date"
                value={debugDate}
                onChange={e => setDebugDate(e.target.value)}
                style={{
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
                padding: '0.38rem 0.9rem', borderRadius: 6,
                border: '1px solid rgba(248,113,113,0.3)',
                background: 'rgba(248,113,113,0.12)',
                color: '#f87171', cursor: 'pointer',
                fontSize: '0.75rem', fontWeight: 700,
              }}
            >
              Appliquer
            </button>
            {onDebugUpdateSecretCode && (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <label style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Code secret Papa</label>
                  <input
                    value={debugSecret}
                    maxLength={4}
                    onChange={e => setDebugSecret(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4))}
                    style={{
                      width: 90, padding: '0.35rem 0.5rem', borderRadius: 6,
                      border: '1px solid rgba(248,113,113,0.3)',
                      background: 'rgba(0,0,0,0.3)', color: '#e2e2e2',
                      fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase',
                    }}
                  />
                </div>
                <button
                  onClick={() => {
                    if (onDebugUpdateSecretCode(debugSecret)) {
                      setDebugSecret(debugSecret.toUpperCase());
                    }
                  }}
                  style={{
                    padding: '0.38rem 0.9rem', borderRadius: 6,
                    border: '1px solid rgba(248,113,113,0.3)',
                    background: 'rgba(248,113,113,0.12)',
                    color: '#f87171', cursor: 'pointer',
                    fontSize: '0.75rem', fontWeight: 700,
                  }}
                >
                  Code Papa
                </button>
              </>
            )}
          </div>

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
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '0.75rem',
                        padding: '0.55rem 0.65rem',
                        borderRadius: 10,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
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

    {/* =====================================================================
      Streak Help Popup — explains what the flame/streak is
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
            ariaLabel="Fermer la fenêtre streak"
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
                  <CosmeticFlameIcon size={72} intensity={getFlameIntensity(streak)} flameId={equippedFlame} />
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
                <div className="streak-help-stat-card">
                  <span className="streak-help-stat-label">Bouclier 🛡️</span>
                  <strong className="streak-help-stat-value">{shields > 0 ? `${shields}/2 en réserve` : "Aucun"}</strong>
                  <span className="streak-help-stat-hint">
                    {shields > 0
                      ? "Si tu rates un jour, tu peux consommer un bouclier pour sauver ton streak."
                      : "Atteins 7 jours de streak pour en gagner un. Il peut absorber 1 jour raté."}
                  </span>
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
            border: '1px solid rgba(167,139,250,0.22)',
            background: 'linear-gradient(160deg, rgba(30,30,46,0.98), rgba(39,35,68,0.97))',
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
            color: '#a78bfa',
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

function DashboardBackground({ backgroundId }) {
  if (!backgroundId) return null;

  const baseStyle = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    zIndex: 0,
    overflow: 'hidden',
  };

  if (backgroundId === 'bg-geometric') {
    return (
      <div style={baseStyle} aria-hidden="true">
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.48,
          backgroundImage: `
            linear-gradient(30deg, rgba(255,255,255,0.16) 1px, transparent 1px),
            linear-gradient(150deg, rgba(167,139,250,0.18) 1px, transparent 1px)
          `,
          backgroundSize: '42px 42px, 42px 42px',
          backgroundPosition: '0 0, 21px 21px',
        }} />
        <div style={{
          position: 'absolute',
          top: '-8%',
          right: '-3%',
          width: 320,
          height: 320,
          transform: 'rotate(18deg)',
          border: '1px solid rgba(255,255,255,0.16)',
          borderRadius: 40,
          opacity: 0.42,
        }} />
        <div style={{
          position: 'absolute',
          bottom: '8%',
          left: '-2%',
          width: 220,
          height: 220,
          transform: 'rotate(22deg)',
          border: '1px solid rgba(192,132,252,0.28)',
          borderRadius: 30,
          opacity: 0.56,
        }} />
      </div>
    );
  }

  if (backgroundId === 'bg-gradient') {
    return (
      <div style={baseStyle} aria-hidden="true">
        <div style={{
          position: 'absolute',
          inset: 0,
          background: `
            radial-gradient(circle at 12% 18%, rgba(251,191,36,0.24), transparent 30%),
            radial-gradient(circle at 82% 22%, rgba(96,165,250,0.28), transparent 26%),
            radial-gradient(circle at 68% 76%, rgba(167,139,250,0.34), transparent 30%),
            radial-gradient(circle at 22% 86%, rgba(74,222,128,0.22), transparent 24%)
          `,
          opacity: 1,
        }} />
      </div>
    );
  }

  if (backgroundId === 'bg-dots') {
    return (
      <div style={baseStyle} aria-hidden="true">
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.48,
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.32) 1.6px, transparent 1.6px)',
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0',
        }} />
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.34,
          backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.45) 1.8px, transparent 1.8px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '20px 20px',
        }} />
      </div>
    );
  }

  if (backgroundId === 'bg-waves') {
    return (
      <div style={baseStyle} aria-hidden="true">
        <svg
          viewBox="0 0 1200 900"
          preserveAspectRatio="none"
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.62 }}
        >
          <path d="M0 620 C160 570, 260 710, 420 660 S700 540, 860 610 S1030 740, 1200 680" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="4" />
          <path d="M0 700 C140 660, 300 770, 470 720 S760 600, 910 660 S1060 770, 1200 730" fill="none" stroke="rgba(96,165,250,0.32)" strokeWidth="4" />
          <path d="M0 790 C130 750, 320 850, 500 800 S790 690, 950 750 S1080 850, 1200 810" fill="none" stroke="rgba(167,139,250,0.34)" strokeWidth="4" />
        </svg>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '34%',
          background: 'linear-gradient(180deg, transparent, rgba(59,130,246,0.08) 38%, rgba(167,139,250,0.14))',
        }} />
      </div>
    );
  }

  return null;
}

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, var(--color-bg1) 0%, var(--color-bg2) 100%)',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  fontFamily: 'var(--font-body)',
  color: '#e2e2e2',
};

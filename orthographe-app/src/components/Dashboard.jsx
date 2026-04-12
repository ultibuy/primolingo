import { useState, useEffect, useRef, useCallback } from 'react';
import RuleCard from './RuleCard.jsx';
import CoinIcon from './CoinIcon.jsx';
import ShieldIcon from './ShieldIcon.jsx';
import FlameIcon from './FlameIcon.jsx';
import CrownIcon from './CrownIcon.jsx';
import DiamondIcon from './DiamondIcon.jsx';
import DiamondStatus from './DiamondStatus.jsx';
import { getStreakInfo } from '../engine/scoring.js';
import { getToday, parseLocalDate } from '../engine/sm2.js';
import { getEquipped, SHOP_CATALOG, rollWeeklyChest } from '../engine/economy.js';
import { exportProgress } from '../store/persistence.js';

// ---------------------------------------------------------------------------
// FIX 1 & FIX 3 — Corrected milestone messages with proper French accents
// ---------------------------------------------------------------------------
const MILESTONE_MESSAGES = {
  3: '3 jours de suite — tu tiens le cap.',
  7: 'Une semaine sans faillir. C\’est là que ça commence vraiment.',
  14: '14 jours. Inarrêtable.',
  30: 'Un mois. Tu t\’es prouvé quelque chose.',
  60: '60 jours. C\’est devenu une partie de toi.',
  100: '100 jours. Légendaire.',
};

// ---------------------------------------------------------------------------
// FIX 1 — Complete event type to message/icon mapping
// ---------------------------------------------------------------------------
const EVENT_CONFIG = {
  firstSession:     { msg: 'C\'est parti, Damien. La régularité fait tout.', icon: '🎯' },
  firstQuiz:        { msg: 'C\'est parti, Damien. La régularité fait tout.', icon: '🎯' },
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
  weeklyChest:      { icon: '🎁' },
  coinsEarned:      null, // skip — silent event
  firstSessionOfDay: null, // skip
  doubleCoins:      null, // skip
  levelMilestoneCoins: null, // skip
  milestone:        { icon: '🎯' }, // dynamic — handled in buildOverlayData
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
  if (todayDone) return 'Bien joué pour aujourd\’hui.';

  const streak = progress.streak?.current || 0;
  const rulesObj = progress.rules || {};
  const totalDiamonds = Object.values(rulesObj).filter(r => (r.level || 0) >= 4).length;
  const totalCrowns = Object.values(rulesObj).filter(r => (r.level || 0) >= 3).length;
  const totalRules = rules.length;
  const rulesStarted = Object.values(rulesObj).filter(r => (r.level || 0) >= 1).length;

  // Check firstQuizDone: after migration it lives in milestones.firstSession,
  // but old progress may still have progress.firstQuizDone
  const firstQuizDone = progress.milestones?.firstSession || progress.firstQuizDone;

  if (!firstQuizDone) return 'Ta première session t\’attend. 20 questions, c\’est tout.';
  if (streak === 0 && progress.streak?.longest > 2) return 'Un nouveau départ, ça se prend maintenant.';
  if (totalDiamonds > 0) {
    const r = totalRules - totalDiamonds;
    if (r > 0) return `${totalDiamonds} diamant${totalDiamonds > 1 ? 's' : ''} en poche. Encore ${r} à aller chercher.`;
    return 'Tous les diamants sont à toi. Légende.';
  }
  if (totalCrowns > 0) return `${totalCrowns} couronne${totalCrowns > 1 ? 's' : ''}. Le diamant est à portée.`;
  if (streak >= 14) return 'Série incroyable. Ne lâche rien.';
  if (streak >= 7) return 'Une semaine d\’affilée. L\’habitude se construit.';
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

function canOpenWeeklyChest(progress) {
  const today = parseLocalDate(getToday());
  if (today.getDay() !== 1) return false;
  if ((progress.streak?.current || 0) < 1) return false;
  const lastOpened = progress.weeklyChest?.lastOpened;
  if (!lastOpened) return true;
  const lastDate = parseLocalDate(lastOpened);
  const startOfWeek = new Date(today);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay() + 1);
  startOfWeek.setHours(0, 0, 0, 0);
  return lastDate < startOfWeek;
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
      msg = 'C\'est parti, Damien. La régularité fait tout.';
      icon = '🎯';
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
    sub = `«\ ${evt.value}\ » — plus d\’aide, juste toi.`;
  } else if (evt.type === 'weeklyChest') {
    msg = `Coffre hebdomadaire\ : +${evt.value} pièces\ !`;
  } else if (evt.type === 'levelUp' && evt.value) {
    // Generic level up — pick the right message based on level number
    const levelCfg = EVENT_CONFIG[`level_up_${evt.value}`];
    if (levelCfg) {
      msg = levelCfg.msg;
      icon = levelCfg.icon;
    }
    if (evt.ruleTitle) {
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
}) {
  const [overlay, setOverlay] = useState(null);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [chestOpen, setChestOpen] = useState(false);
  const [chestCoins, setChestCoins] = useState(null);
  const [showStreakHelp, setShowStreakHelp] = useState(false);
  const overlayTimeoutsRef = useRef([]);

  useEffect(() => { requestAnimationFrame(() => setMounted(true)); }, []);

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

  const summary = computeGlobalLevelSummary(rules, progress);

  // A6 — Split rules into sections
  const { revisions, inProgress, toDiscover } = splitRulesIntoSections(rules, progress);

  const showChest = canOpenWeeklyChest(progress);
  const sniperCharges = progress.shop?.inventory?.modeSniper || 0;
  const lastRuleTitle = rules.find(rule => rule.id === lastSessionRuleId)?.shortTitle
    || rules.find(rule => rule.id === lastSessionRuleId)?.title
    || null;

  // A4 — Only show level summary if there's at least one crown or diamond
  const showLevelSummary = summary.couronne > 0 || summary.diamant > 0 || summary.diamondVivant > 0;

  const handleOpenChest = () => {
    const result = rollWeeklyChest(progress);
    if (result.opened) {
      setChestOpen(true);
      setChestCoins(result.coins);
    }
  };

  // Counter for staggered animation
  let animIdx = 0;

  return (
    <>
    <div style={pageStyle}>
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
            <button
              onClick={dismissOverlay}
              aria-label="Fermer"
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                width: 34,
                height: 34,
                borderRadius: 999,
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.06)',
                color: '#d1d5db',
                cursor: 'pointer',
                fontSize: '1rem',
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              ×
            </button>
            <div style={{ fontSize: '5.5rem', marginBottom: '1rem', animation: 'glow-gold 2s ease-in-out infinite' }}>
              {overlay.icon}
            </div>
            <p style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 700, maxWidth: 400, lineHeight: 1.5, textShadow: '0 2px 15px rgba(0,0,0,0.5)', marginBottom: overlay.sub ? '0.5rem' : 0 }}>
              {overlay.msg}
            </p>
            {overlay.sub && <p style={{ fontSize: '0.9rem', color: '#9ca3af', fontWeight: 500 }}>{overlay.sub}</p>}
            <button
              onClick={dismissOverlay}
              style={{
                marginTop: '1.1rem',
                padding: '0.65rem 1.25rem',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, var(--color-primary))',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.92rem',
                fontWeight: 700,
              }}
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      <div style={{
        maxWidth: 640, width: '100%', padding: '0 1.5rem 3rem',
        opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)',
        transition: 'all 0.6s ease',
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
            <div
              onClick={() => setShowStreakHelp(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}
              aria-label="En savoir plus sur le streak"
            >
              <FlameIcon size={36} intensity={getFlameIntensity(streak)} />
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
            </div>
          ) : (
            /* Streak is 0: just show a muted flame */
            <div
              onClick={() => setShowStreakHelp(true)}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}
              aria-label="En savoir plus sur le streak"
            >
              <FlameIcon size={28} intensity={0} />
              <span style={{ fontSize: '0.82rem', color: '#4b5563', fontWeight: 700 }}>
                0 jour
              </span>
            </div>
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
              <LevelBadge icon={<DiamondStatus health={1.0} size={18} />} count={summary.diamondVivant} color="#67e8f9" label="Vivant" />
            )}
            {summary.diamant > 0 && (
              <LevelBadge icon={<DiamondStatus health={0.7} size={16} />} count={summary.diamant} color="#60a5fa" label="Diamant" />
            )}
            {summary.couronne > 0 && (
              <LevelBadge icon={<CrownIcon size={14} active animate={false} />} count={summary.couronne} color="#fbbf24" label="Couronne" />
            )}
            {summary.enCours > 0 && (
              <LevelBadge icon={<span style={{ fontSize: '0.7rem' }}>{'\⭐'}</span>} count={summary.enCours} color="#c0c0c0" label="En cours" />
            )}
            {summary.nouveau > 0 && (
              <LevelBadge icon={<span style={{ fontSize: '0.7rem' }}>{'🔒'}</span>} count={summary.nouveau} color="#4b5563" label="Nouvelle" />
            )}
          </div>
        )}

        {/* Weekly chest */}
        {showChest && !chestOpen && (
          <button
            onClick={handleOpenChest}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, rgba(251,191,36,0.08), rgba(var(--color-accent-rgb),0.06))',
              border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: 18, padding: '1rem 1.3rem',
              marginBottom: '0.8rem',
              display: 'flex', alignItems: 'center', gap: '0.8rem',
              cursor: 'pointer',
              animation: 'card-glow 3s ease-in-out infinite',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ fontSize: '2rem', animation: 'subtle-float 2s ease-in-out infinite' }}>{'🎁'}</div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fbbf24' }}>
                Coffre hebdomadaire
              </div>
              <div style={{ fontSize: '0.73rem', color: '#9ca3af' }}>
                Tap pour ouvrir — bonus surprise !
              </div>
            </div>
          </button>
        )}

        {chestOpen && chestCoins && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(251,191,36,0.1), rgba(var(--color-accent-rgb),0.08))',
            border: '1px solid rgba(251,191,36,0.25)',
            borderRadius: 18, padding: '1rem 1.3rem',
            marginBottom: '0.8rem', textAlign: 'center',
            animation: 'bounce-in 0.5s ease forwards',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.3rem' }}>{'🎁'}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' }}>
              <CoinIcon size={20} animate />
              <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fbbf24' }}>+{chestCoins}</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.2rem' }}>
              Coffre ouvert !
            </div>
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
                        <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--color-accent)' }}>
                          {rule.title}
                        </span>
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

        {/* Export */}
        <div style={{ marginTop: '2.5rem', textAlign: 'center' }}>
          <button onClick={() => exportProgress(progress)} style={{
            padding: '0.5rem 1.2rem', borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.02)',
            color: '#4b5563', cursor: 'pointer', fontSize: '0.72rem',
          }}>
            Exporter ma progression
          </button>
        </div>
      </div>
    </div>

    {/* =====================================================================
      Streak Help Popup — explains what the flame/streak is
    ===================================================================== */}
    {showStreakHelp && (
      <div
        onClick={() => setShowStreakHelp(false)}
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
          style={{
            background: 'rgba(30,30,46,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 28, padding: '2rem 2.2rem',
            maxWidth: 620, width: '92%',
            boxShadow: '0 12px 60px rgba(0,0,0,0.5)',
            animation: 'bounce-in 0.35s ease forwards',
            display: 'flex', gap: '2rem', alignItems: 'center',
          }}
        >
          {/* Left column — flame + streak count */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            minWidth: 140, flexShrink: 0,
          }}>
            <div style={{
              animation: 'flame-dance 1.5s ease-in-out infinite',
              marginBottom: '0.6rem',
            }}>
              <FlameIcon size={80} intensity={getFlameIntensity(streak)} />
            </div>
            <div style={{
              background: 'rgba(251,191,36,0.08)',
              border: '1px solid rgba(251,191,36,0.2)',
              borderRadius: 14, padding: '0.5rem 1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
            }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 900, color: '#fbbf24' }}>
                {streak}
              </span>
              <span style={{ fontSize: '1rem', color: '#fbbf24', fontWeight: 700 }}>
                jour{streak !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Right column — text + tiers */}
          <div style={{ flex: 1, textAlign: 'left' }}>
            <h2 style={{
              fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24',
              margin: '0 0 0.3rem',
            }}>
              Ton streak
            </h2>
            <p style={{
              fontSize: '0.95rem', color: '#9ca3af', lineHeight: 1.5,
              margin: '0 0 1rem',
            }}>
              Joue chaque jour pour maintenir ta flamme. Plus ta série est longue, plus ta flamme grandit.
            </p>

            {/* Tier ladder */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '0.8rem' }}>
              {[
                { min: 1,  label: 'Bon début',     emoji: '🔥',    color: '#f59e0b' },
                { min: 3,  label: 'Sur la lancée',  emoji: '🔥🔥',  color: '#f97316' },
                { min: 7,  label: 'En feu',         emoji: '🔥🔥🔥', color: '#ef4444' },
                { min: 14, label: 'Inarrêtable',    emoji: '⚡',     color: '#a78bfa' },
                { min: 30, label: 'Légende',         emoji: '💥',     color: '#fbbf24' },
              ].map((tier) => {
                const isActive = streak >= tier.min;
                const isCurrent = isActive && (
                  tier.min === 30 ? streak >= 30 :
                  tier.min === 14 ? streak >= 14 && streak < 30 :
                  tier.min === 7 ? streak >= 7 && streak < 14 :
                  tier.min === 3 ? streak >= 3 && streak < 7 :
                  streak >= 1 && streak < 3
                );
                return (
                  <div
                    key={tier.min}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.6rem',
                      padding: '0.4rem 0.7rem',
                      borderRadius: 10,
                      background: isCurrent
                        ? 'rgba(251,191,36,0.12)'
                        : isActive
                          ? 'rgba(255,255,255,0.03)'
                          : 'transparent',
                      border: isCurrent
                        ? '1px solid rgba(251,191,36,0.3)'
                        : '1px solid transparent',
                      opacity: isActive ? 1 : 0.35,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <span style={{ fontSize: '1.1rem', width: 36, textAlign: 'center' }}>
                      {tier.emoji}
                    </span>
                    <span style={{
                      fontSize: '0.95rem', fontWeight: 700,
                      color: isCurrent ? tier.color : isActive ? '#d1d5db' : '#6b7280',
                      flex: 1,
                    }}>
                      {tier.label}
                    </span>
                    <span style={{
                      fontSize: '0.8rem', color: '#6b7280', fontWeight: 600,
                    }}>
                      {tier.min}j+
                    </span>
                    {isCurrent && (
                      <span style={{
                        fontSize: '0.7rem', fontWeight: 800,
                        color: '#fbbf24',
                        background: 'rgba(251,191,36,0.15)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: 4,
                      }}>
                        ICI
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Next tier hint */}
            {streak > 0 && streak < 30 && (() => {
              const nextTier = [3, 7, 14, 30].find(t => t > streak);
              const nextLabel = { 3: 'Sur la lancée', 7: 'En feu', 14: 'Inarrêtable', 30: 'Légende' }[nextTier];
              const daysLeft = nextTier - streak;
              return (
                <p style={{
                  fontSize: '0.9rem', color: '#9ca3af',
                  margin: '0 0 0.6rem', lineHeight: 1.4,
                }}>
                  Encore <span style={{ color: '#fbbf24', fontWeight: 800 }}>{daysLeft} jour{daysLeft > 1 ? 's' : ''}</span> pour atteindre « {nextLabel} »
                </p>
              );
            })()}

            {/* Shield info */}
            {shields > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: '0.4rem',
                fontSize: '0.85rem', color: '#60a5fa',
                marginBottom: '0.6rem',
              }}>
                <ShieldIcon size={18} active />
                <span>{shields} bouclier{shields > 1 ? 's' : ''} — protège{shields > 1 ? 'nt' : ''} ton streak si tu rates un jour</span>
              </div>
            )}

            {/* Close button */}
            <button
              onClick={() => setShowStreakHelp(false)}
              style={{
                padding: '0.6rem 2rem',
                borderRadius: 12,
                border: 'none',
                background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '0.95rem',
                fontWeight: 700,
                boxShadow: '0 2px 12px rgba(124,58,237,0.25)',
                marginTop: '0.3rem',
              }}
            >
              Compris !
            </button>
          </div>
        </div>
      </div>
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

function LevelBadge({ icon, count, color, label }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.3rem',
      background: `${color}10`,
      border: `1px solid ${color}25`,
      borderRadius: 10, padding: '0.3rem 0.6rem',
    }}>
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
  background: 'linear-gradient(135deg, var(--color-bg1) 0%, var(--color-bg2) 100%)',
  display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
  fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
  color: '#e2e2e2',
};

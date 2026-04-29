import { useState, useEffect, useRef } from 'react';
import CoinIcon from './CoinIcon.jsx';
import VictoryAnimationPreview from './VictoryAnimationPreview.jsx';
import CharacterSprite from './CharacterSprite.jsx';
import EmotionPurchasePopup from './EmotionPurchasePopup.jsx';
import { resolveCharacterMood } from '../data/shopCharacters.js';
import { calculateCoins } from '../engine/scoring.js';

// Word displayed in the speech bubble when an emotion is locked
const MOOD_BUBBLE_WORDS = {
  sleep:   'dodo',
  wave:    'salut',
  kiss:    'salut',
  clap:    'bravo',
  think:   'zut',
  surprise:'zut',
  dance:   'super',
  victory: 'super',
};

/**
 * Shared end-of-session screen used by both QuizGuided and QuizDirect.
 *
 * Props:
 *   rule, questions, answers, score, onFinish
 *   hasDoubleCoinsActive (optional, boolean) — doubles the displayed quiz gains
 *   isFirstSessionOfDay (optional, boolean) — shows +10 bonus if first session >= 60%
 *   streakMilestoneJustEarned (optional, { streak, coins }) — if a streak milestone was just earned
 *   levelProgress, streakInfo, victoryAnimationId
 *   characterId (optional) — if provided, shows the character sprite in the header
 *   shopOwned (optional) — needed to resolve character emotions
 */
export default function EndScreen({
  rule,
  questions,
  answers,
  score,
  onFinish,
  hasDoubleCoinsActive,
  isFirstSessionOfDay,
  levelProgress,
  streakInfo,
  victoryAnimationId,
  streakMilestoneJustEarned,
  characterId = null,
  shopOwned = [],
  isFirstEverSession = false,
  onBuyEmotion = null,
  coins = 0,
  coachingLine = null,
}) {
  const total = questions.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const baseCoins = calculateCoins(score, total);
  const qualifies = pct >= 60;
  const firstSessionBonus = isFirstSessionOfDay && qualifies ? 10 : 0;
  const streakBonus = streakMilestoneJustEarned?.coins || 0;
  const coinsBeforeMultiplier = baseCoins + firstSessionBonus;
  const doubleCoinsBonus = hasDoubleCoinsActive ? coinsBeforeMultiplier : 0;
  const totalCoins = coinsBeforeMultiplier + doubleCoinsBonus;
  const emoji = pct === 100 ? '\u{1F3C6}' : pct >= 70 ? '\u{1F44F}' : pct >= 50 ? '\u{1F4AA}' : '\u{1F4DA}';

  // Dynamic thresholds based on question count
  const threshold60 = Math.ceil(total * 0.6);
  const threshold80 = Math.ceil(total * 0.8);
  const threshold100 = total;

  // Which tier is active?
  const activeTier = pct === 100 ? 2 : pct >= 80 ? 1 : pct >= 60 ? 0 : -1;

  const tiers = [
    { range: `${threshold60}-${threshold80 - 1}`, coins: 5, active: activeTier === 0 },
    { range: `${threshold80}-${threshold100 - 1}`, coins: 20, active: activeTier === 1 },
    { range: `${threshold100}`, coins: 30, active: activeTier === 2 },
  ];

  const feedbackMessage = getFeedbackMessage(pct);

  // Animation states
  const [displayedScore, setDisplayedScore] = useState(() => (
    score === 0 || total <= 2 ? score : 0
  ));
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [visibleTier, setVisibleTier] = useState(-1); // -1 = none, 0/1/2 = tiers
  const [animatingCoins, setAnimatingCoins] = useState(false);
  const [displayedCoins, setDisplayedCoins] = useState(0);
  const [showBonuses, setShowBonuses] = useState(false);
  const [displayedDailyBonus, setDisplayedDailyBonus] = useState(0);
  const [displayedStreakBonus, setDisplayedStreakBonus] = useState(0);
  const [showTotal, setShowTotal] = useState(false);
  const [showProgression, setShowProgression] = useState(false);
  const [progressBarAnimated, setProgressBarAnimated] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Step 1: Score count-up
  useEffect(() => {
    if (score === 0 || total <= 2) return;
    const steps = 20;
    const step = Math.max(1, Math.ceil(score / steps));
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= score) { current = score; clearInterval(interval); }
      setDisplayedScore(current);
    }, 50);
    return () => clearInterval(interval);
  }, [score, total]);

  // Step 2: Feedback after score
  useEffect(() => {
    if (displayedScore === score) {
      const t = setTimeout(() => setShowFeedback(true), 200);
      return () => clearTimeout(t);
    }
  }, [displayedScore, score]);

  // Step 3: Show coins section
  useEffect(() => {
    if (showFeedback) {
      const t = setTimeout(() => setShowCoins(true), 400);
      return () => clearTimeout(t);
    }
  }, [showFeedback]);

  // Step 4: Reveal tiers one by one (300ms apart)
  useEffect(() => {
    if (!showCoins) return;
    const timers = [];
    for (let i = 0; i <= 2; i++) {
      timers.push(setTimeout(() => setVisibleTier(i), 200 + i * 300));
    }
    // After all tiers visible, start coin animation on active tier
    timers.push(setTimeout(() => setAnimatingCoins(true), 200 + 3 * 300));
    return () => timers.forEach(clearTimeout);
  }, [showCoins]);

  // Step 5: Animate coin count-up on active tier
  useEffect(() => {
    if (!animatingCoins || activeTier < 0) return;
    const target = tiers[activeTier].coins;
    const duration = 600;
    const steps = 15;
    const stepVal = target / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += stepVal;
      if (current >= target) { current = target; clearInterval(interval); }
      setDisplayedCoins(Math.round(current));
    }, duration / steps);
    return () => clearInterval(interval);
  }, [animatingCoins]); // eslint-disable-line react-hooks/exhaustive-deps

  // Step 6: Show bonuses after coin animation
  useEffect(() => {
    if (displayedCoins === (activeTier >= 0 ? tiers[activeTier].coins : 0) && animatingCoins) {
      const t = setTimeout(() => setShowBonuses(true), 300);
      return () => clearTimeout(t);
    }
  }, [displayedCoins, animatingCoins]); // eslint-disable-line react-hooks/exhaustive-deps

  // Step 6b: Animate daily bonus count-up
  useEffect(() => {
    if (!showBonuses || firstSessionBonus === 0) return;
    const duration = 400;
    const steps = 10;
    const stepVal = firstSessionBonus / steps;
    let current = 0;
    const interval = setInterval(() => {
      current += stepVal;
      if (current >= firstSessionBonus) { current = firstSessionBonus; clearInterval(interval); }
      setDisplayedDailyBonus(Math.round(current));
    }, duration / steps);
    return () => clearInterval(interval);
  }, [showBonuses, firstSessionBonus]);

  // Step 6c: Animate streak bonus count-up
  useEffect(() => {
    if (!showBonuses || streakBonus === 0) return;
    const delay = firstSessionBonus > 0 ? 500 : 0;
    const t = setTimeout(() => {
      const duration = 600;
      const steps = 15;
      const stepVal = streakBonus / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += stepVal;
        if (current >= streakBonus) { current = streakBonus; clearInterval(interval); }
        setDisplayedStreakBonus(Math.round(current));
      }, duration / steps);
    }, delay);
    return () => clearTimeout(t);
  }, [showBonuses, streakBonus, firstSessionBonus]);

  // Step 7: Show total after bonuses are done (or after coin anim if no bonuses)
  useEffect(() => {
    const hasBonuses = firstSessionBonus > 0 || streakBonus > 0 || doubleCoinsBonus > 0;
    if (hasBonuses && showBonuses) {
      const t = setTimeout(() => setShowTotal(true), 600);
      return () => clearTimeout(t);
    }
    if (!hasBonuses && animatingCoins) {
      const t = setTimeout(() => setShowTotal(true), 800);
      return () => clearTimeout(t);
    }
  }, [showBonuses, animatingCoins, firstSessionBonus, streakBonus, doubleCoinsBonus]);

  // Step 7b: Show progression after total
  useEffect(() => {
    if (showTotal) {
      const t = setTimeout(() => setShowProgression(true), 400);
      return () => clearTimeout(t);
    }
  }, [showTotal]);

  useEffect(() => {
    if (showProgression) {
      const t = setTimeout(() => setProgressBarAnimated(true), 100);
      return () => clearTimeout(t);
    }
  }, [showProgression]);

  // Step 8: Show recap
  useEffect(() => {
    if (showProgression) {
      const t = setTimeout(() => setShowRecap(true), 600);
      return () => clearTimeout(t);
    }
  }, [showProgression]);

  // Step 9: Show button
  useEffect(() => {
    if (showRecap) {
      const t = setTimeout(() => setShowButton(true), 400);
      return () => clearTimeout(t);
    }
  }, [showRecap]);

  const showLevelBar = levelProgress && !levelProgress.justLeveledUp;

  // Next coin milestone for streak
  const STREAK_COIN_MILESTONES = { 7: 100, 14: 200, 30: 350, 60: 500, 100: 1000 };
  const currentStreak = streakInfo?.current || 0;
  const nextMilestoneDays = [7, 14, 30, 60, 100].find(d => d > currentStreak) || null;
  const nextMilestoneCoins = nextMilestoneDays ? STREAK_COIN_MILESTONES[nextMilestoneDays] : null;
  const streakDaysLeft = nextMilestoneDays ? nextMilestoneDays - currentStreak : 0;
  const showStreakNext = nextMilestoneDays && streakDaysLeft > 0;

  // Emotion rules for the end screen character (stabilised with useRef so
  // re-renders after emotion purchase don't re-randomise the pick):
  //   isFirstEverSession → sleep
  //   pct ≥ 90 (≥ 18/20) → dance | victory  (random, stable)
  //   pct ≥ 80 (16-17/20) → clap (bravo)
  //   pct ≥ 70 (14-15/20) → walk (neutral)
  //   pct < 70 (< 14/20)  → think | surprise  (random, stable)
  const rawMoodRef = useRef(null);
  if (rawMoodRef.current === null) {
    rawMoodRef.current = (() => {
      if (isFirstEverSession) return 'sleep';
      if (pct >= 90) return Math.random() < 0.5 ? 'dance' : 'victory';
      if (pct >= 80) return 'clap';
      if (pct >= 70) return 'walk';
      return Math.random() < 0.5 ? 'think' : 'surprise';
    })();
  }
  const rawCharMood = rawMoodRef.current;
  // Derive actual mood from ownership — auto-updates when shopOwned changes
  const charMood = characterId ? resolveCharacterMood(rawCharMood, characterId, shopOwned) : 'walk';
  // Is the intended emotion locked?
  const isCharLocked = !!(characterId && rawCharMood !== 'walk' && charMood === 'walk');
  const [showEmotionPopup, setShowEmotionPopup] = useState(false);

  const handleEndScreenBuy = () => {
    if (onBuyEmotion && characterId) onBuyEmotion(characterId, rawCharMood);
    setShowEmotionPopup(false);
  };

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* 1. Header — horizontal with character, or centered without */}
        {characterId ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '0.6rem' }}>
            {/* Character sprite — locked or normal */}
            <div style={{
              flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              animation: 'bounce-in 0.5s ease forwards',
              position: 'relative',
            }}>
              {isCharLocked ? (
                /* Locked emotion indicator (end screen — larger size) */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  {/* Speech bubble — clickable to open purchase popup */}
                  <button
                    type="button"
                    onClick={() => setShowEmotionPopup(true)}
                    title="Débloquer cette émotion"
                    style={{
                      background: 'rgba(255,255,255,0.96)',
                      color: '#1a1a2e',
                      borderRadius: 9,
                      padding: '3px 10px',
                      fontSize: '0.85rem',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      lineHeight: 1.5,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                      letterSpacing: '0.02em',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    🔒 {MOOD_BUBBLE_WORDS[rawCharMood] || ''}
                  </button>
                  {/* Tail */}
                  <div style={{
                    width: 0, height: 0,
                    borderLeft: '5px solid transparent',
                    borderRight: '5px solid transparent',
                    borderTop: '6px solid rgba(255,255,255,0.96)',
                    marginTop: -1,
                  }} />
                  {/* Character — also clickable */}
                  <button
                    type="button"
                    onClick={() => setShowEmotionPopup(true)}
                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: 0 }}
                  >
                    <CharacterSprite id={characterId} mood="walk" size={88} glow={false} />
                  </button>
                </div>
              ) : (
                <CharacterSprite id={characterId} mood={charMood} size={88} glow={false} />
              )}
            </div>
            {/* Score + title block */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {victoryAnimationId && (
                <div style={{ marginBottom: '0.4rem' }}>
                  <VictoryAnimationPreview animationId={victoryAnimationId} size={80} showLabel={false} />
                </div>
              )}
              {!victoryAnimationId && (
                <div style={{ fontSize: '2rem', marginBottom: '0.2rem', lineHeight: 1 }}>{emoji}</div>
              )}
              <h1 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '0.2rem', margin: '0 0 0.2rem 0' }}>
                Session terminée !
              </h1>
              <p style={{ fontSize: '1.2rem', color: '#d1d5db', margin: 0 }}>
                <strong style={{
                  color: pct >= 70 ? '#4ade80' : pct >= 60 ? '#fbbf24' : '#9ca3af',
                  fontSize: '1.7rem', transition: 'all 0.2s',
                }}>
                  {displayedScore}/{total}
                </strong>
              </p>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: '0.6rem' }}>
            <div style={{
              display: 'flex', justifyContent: 'center',
              marginBottom: victoryAnimationId ? '0.55rem' : '0.4rem',
              animation: 'bounce-in 0.5s ease forwards',
            }}>
              {victoryAnimationId ? (
                <VictoryAnimationPreview animationId={victoryAnimationId} size={126} showLabel={false} />
              ) : (
                <div style={{ fontSize: '3.5rem' }}>{emoji}</div>
              )}
            </div>
            {victoryAnimationId && (
              <div style={{ fontSize: '1.25rem', marginBottom: '0.15rem', lineHeight: 1 }}>{emoji}</div>
            )}
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '0.3rem' }}>
              Session terminée !
            </h1>
            <p style={{ fontSize: '1.4rem', color: '#d1d5db', margin: 0 }}>
              <strong style={{
                color: pct >= 70 ? '#4ade80' : pct >= 60 ? '#fbbf24' : '#9ca3af',
                fontSize: '2rem', transition: 'all 0.2s',
              }}>
                {displayedScore}/{total}
              </strong>
            </p>
          </div>
        )}

        {/* 2. Feedback */}
        <div style={{
          textAlign: characterId ? 'left' : 'center', marginBottom: '1.2rem',
          opacity: showFeedback ? 1 : 0,
          transform: showFeedback ? 'translateY(0)' : 'translateY(6px)',
          transition: 'all 0.4s ease',
        }}>
          <p style={{ fontSize: '0.92rem', fontStyle: 'italic', color: '#9ca3af', margin: 0, lineHeight: 1.5 }}>
            {feedbackMessage}
          </p>
        </div>

        {/* 3. Coin tiers — subtle, integrated */}
        <div style={{
          marginBottom: '1.2rem',
          opacity: showCoins ? 1 : 0,
          transform: showCoins ? 'translateY(0)' : 'translateY(8px)',
          transition: 'all 0.5s ease',
        }}>
          {/* Tier rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
            {tiers.map((tier, i) => {
              const visible = visibleTier >= i;
              const isActive = tier.active;
              const showCount = isActive && animatingCoins;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.5rem',
                  padding: '0.3rem 0.6rem',
                  borderRadius: 10,
                  background: isActive ? 'rgba(251,191,36,0.08)' : 'transparent',
                  border: isActive ? '1px solid rgba(251,191,36,0.30)' : '1px solid transparent',
                  opacity: visible ? 1 : 0,
                  transform: visible ? 'translateX(0)' : 'translateX(-8px)',
                  transition: 'all 0.35s ease',
                }}>
                  <span style={{
                    width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                    background: isActive ? '#fbbf24' : 'rgba(255,255,255,0.1)',
                    boxShadow: isActive ? '0 0 6px rgba(251,191,36,0.4)' : 'none',
                  }} />
                  <span style={{
                    flex: 1, fontSize: '0.78rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#d1d5db' : '#4b5563',
                  }}>
                    {tier.range} réponses justes
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
                    fontSize: '0.8rem',
                    fontWeight: isActive ? 800 : 600,
                    color: isActive ? '#fbbf24' : '#4b5563',
                  }}>
                    {showCount ? displayedCoins : tier.coins}
                    <CoinIcon size={isActive ? 14 : 12} animate={isActive && animatingCoins} variant={isActive ? 'gold' : 'silver'} />
                  </span>
                </div>
              );
            })}
          </div>

          {/* Bonuses */}
          {(firstSessionBonus > 0 || streakBonus > 0 || doubleCoinsBonus > 0) && (
            <div style={{
              marginTop: '0.5rem', paddingTop: '0.4rem',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', flexDirection: 'column', gap: '0.1rem',
              opacity: showBonuses ? 1 : 0,
              transform: showBonuses ? 'translateY(0)' : 'translateY(4px)',
              transition: 'all 0.4s ease',
            }}>
              {firstSessionBonus > 0 && (
                <div style={bonusLineStyle}>
                  <span>Bonus du jour</span>
                  <span style={bonusValueStyle}>+{displayedDailyBonus} <CoinIcon size={12} /></span>
                </div>
              )}
              {streakBonus > 0 && (
                <div style={bonusLineStyle}>
                  <span>Palier streak {streakMilestoneJustEarned.streak}j</span>
                  <span style={{ ...bonusValueStyle, color: '#4ade80' }}>+{displayedStreakBonus} <CoinIcon size={12} /></span>
                </div>
              )}
              {doubleCoinsBonus > 0 && (
                <div style={bonusLineStyle}>
                  <span>Double x2</span>
                  <span style={bonusValueStyle}>+{doubleCoinsBonus} <CoinIcon size={12} /></span>
                </div>
              )}
            </div>
          )}

          {/* Total — only if there are bonus lines beyond base coins */}
          {(firstSessionBonus > 0 || streakBonus > 0 || doubleCoinsBonus > 0) && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            gap: '0.35rem', marginTop: '0.5rem',
            opacity: showTotal ? 1 : 0,
            transform: showTotal ? 'translateY(0)' : 'translateY(4px)',
            transition: 'all 0.4s ease',
          }}>
            <span style={{
              fontSize: '1.05rem', fontWeight: 900, color: '#fbbf24',
            }}>
              {totalCoins + streakBonus}
            </span>
            <CoinIcon size={18} animate={showTotal} />
          </div>
          )}
        </div>

        {/* 4. Level progress */}
        {showLevelBar && (
          <div style={{
            marginBottom: '1rem',
            opacity: showProgression ? 1 : 0,
            transform: showProgression ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.5s ease',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)', borderRadius: 14,
              padding: '0.9rem 1rem', border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <p style={{
                margin: '0 0 0.5rem 0', fontSize: '0.82rem',
                color: 'var(--color-accent)', fontWeight: 600, textAlign: 'center',
              }}>
                Prochain objectif : {levelProgress.nextLevelName}
              </p>
              <div role="progressbar" style={{
                width: '100%', height: 10, background: 'rgba(255,255,255,0.1)',
                borderRadius: 5, overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%',
                  width: progressBarAnimated
                    ? `${Math.min((levelProgress.current / levelProgress.target) * 100, 100)}%`
                    : '0%',
                  background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
                  borderRadius: 5, transition: 'width 0.8s ease-out',
                  boxShadow: '0 0 8px rgba(124,58,237,0.4)',
                }} />
              </div>
              <p style={{ margin: '0.35rem 0 0 0', fontSize: '0.72rem', color: '#9ca3af', textAlign: 'center' }}>
                {levelProgress.current}/{levelProgress.target} sessions qualifiantes
              </p>
              {levelProgress.message && (
                <p style={{
                  margin: '0.3rem 0 0 0', fontSize: '0.78rem',
                  color: 'var(--color-accent)', textAlign: 'center', fontStyle: 'italic',
                }}>
                  {levelProgress.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 5. Next streak coin milestone */}
        {showStreakNext && (
          <div style={{
            textAlign: 'center', marginBottom: '0.8rem',
            opacity: showProgression ? 1 : 0,
            transform: showProgression ? 'translateY(0)' : 'translateY(6px)',
            transition: 'all 0.5s ease 0.15s',
          }}>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#6b7280', lineHeight: 1.5 }}>
              {'🔥'} Encore {streakDaysLeft} jour{streakDaysLeft > 1 ? 's' : ''} de streak
              pour gagner {nextMilestoneCoins} <span style={{ display: 'inline-flex', verticalAlign: 'middle' }}><CoinIcon size={13} /></span> au palier {nextMilestoneDays} jours
            </p>
          </div>
        )}

        {/* Separator */}
        <div style={{
          height: 1, background: 'rgba(255,255,255,0.08)', margin: '0 0 0.9rem 0',
          opacity: showRecap ? 1 : 0, transition: 'opacity 0.4s ease',
        }} />

        {/* 6. Recap */}
        <div style={{
          opacity: showRecap ? 1 : 0,
          transform: showRecap ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.4s ease',
        }}>
          <div style={{ maxHeight: 220, overflowY: 'auto', marginBottom: '1rem', paddingRight: '0.3rem' }}>
            {questions.map((q, i) => {
              const a = answers[i];
              const ok = a?.correct;
              const questionChoices = q._ruleChoices || rule.choices || [];
              const chosenLabel = questionChoices.find(c => c.id === a?.chosen)?.label || '';
              const answerLabel = questionChoices.find(c => c.id === q.answer)?.label || '';
              const qHasVerb = q.verb !== undefined;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  padding: '0.5rem 0.7rem', borderRadius: 8, marginBottom: '0.35rem',
                  background: ok ? 'rgba(74,222,128,0.07)' : 'rgba(248,113,113,0.07)',
                  border: `1px solid ${ok ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)'}`,
                }}>
                  <span style={{ fontSize: '0.85rem', width: 22, flexShrink: 0 }}>
                    {ok ? '\u2713' : '\u2717'}
                  </span>
                  <span style={{ fontSize: '0.82rem', color: '#d1d5db', flex: 1 }}>
                    {q.before}
                    {qHasVerb && q.verb}
                    <strong style={{ color: ok ? '#4ade80' : '#f87171' }}>
                      {qHasVerb ? chosenLabel.replace('-', '') : chosenLabel}
                    </strong>
                    {q.after}
                  </span>
                  {!ok && (
                    <span style={{ fontSize: '0.75rem', color: '#9ca3af', flexShrink: 0 }}>
                      {'→'} {answerLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Coaching line */}
        {coachingLine && (
          <div style={{
            fontSize: '0.82rem', color: '#94a3b8', textAlign: 'center',
            padding: '0 1rem', marginTop: '0.25rem', lineHeight: 1.5,
            opacity: showButton ? 1 : 0,
            transition: 'opacity 0.4s ease',
          }}>
            {coachingLine}
          </div>
        )}

        {/* 7. Continue button */}
        <div style={{
          opacity: showButton ? 1 : 0,
          transform: showButton ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.4s ease',
        }}>
          <button
            onClick={onFinish}
            style={{
              width: '100%', padding: '0.85rem', borderRadius: 12, border: 'none',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              color: '#fff', cursor: 'pointer', fontSize: '1rem', fontWeight: 700,
              boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
            }}
          >
            Continuer
          </button>
        </div>
      </div>

      {/* Locked emotion purchase popup */}
      {showEmotionPopup && characterId && (
        <EmotionPurchasePopup
          charId={characterId}
          emotionId={rawCharMood}
          coins={coins}
          onBuy={handleEndScreenBuy}
          onClose={() => setShowEmotionPopup(false)}
        />
      )}
    </div>
  );
}

/* ── Helpers ── */

function getFeedbackMessage(pct) {
  if (pct === 100) return 'Parfait ! Pas une seule erreur.';
  if (pct >= 90) return 'Excellent. Tu maîtrises cette règle.';
  if (pct >= 80) return 'Très bien. Continue comme ça.';
  if (pct >= 60) return 'Pas mal. Quelques points à revoir.';
  return 'Courage. La prochaine sera meilleure.';
}

/* ── Styles ── */

const pageStyle = {
  minHeight: '100vh',
  backgroundColor: 'var(--color-bg1)',
  backgroundImage: 'var(--app-page-overlay), var(--app-page-image)',
  backgroundSize: 'cover, cover',
  backgroundPosition: 'center, center',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--font-body)',
  padding: '1.5rem', color: '#e2e2e2',
};

const cardStyle = {
  maxWidth: 620, width: '100%',
  background: 'rgba(255,255,255,0.06)',
  borderRadius: 20, padding: '1.5rem 1.8rem',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
};

const bonusLineStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0.2rem 0.6rem', fontSize: '0.74rem', color: '#6b7280',
};

const bonusValueStyle = {
  display: 'inline-flex', alignItems: 'center', gap: '0.15rem',
  fontWeight: 700, fontSize: '0.76rem', color: '#fbbf24',
};

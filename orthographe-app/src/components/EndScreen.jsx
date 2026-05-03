import { useState, useEffect, useRef } from 'react';
import CoinIcon from './CoinIcon.jsx';
import CharacterSprite from './CharacterSprite.jsx';
import EmotionPurchasePopup from './EmotionPurchasePopup.jsx';
import { TrophyIcon, CheckIcon } from './icons/ProductIcons.jsx';
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
 *   levelProgress
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
  streakMilestoneJustEarned,
  characterId = null,
  shopOwned = [],
  isFirstEverSession = false,
  onBuyEmotion = null,
  coins = 0,
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

  // Dynamic thresholds based on question count
  const threshold60 = Math.ceil(total * 0.6);
  const threshold80 = Math.ceil(total * 0.8);
  const threshold100 = total;

  // Which tier is active?
  const activeTier = pct === 100 ? 2 : pct >= 80 ? 1 : pct >= 60 ? 0 : -1;

  const tiers = buildCoinTiers(total, threshold60, threshold80, threshold100, activeTier);

  const feedbackMessage = getFeedbackMessage(pct);

  // Animation states
  const [displayedScore, setDisplayedScore] = useState(() => (
    score === 0 || total <= 2 ? score : 0
  ));
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [visibleTier, setVisibleTier] = useState(-1);
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

  // Step 4: Reveal tiers one by one
  useEffect(() => {
    if (!showCoins) return;
    const timers = [];
    for (let i = 0; i <= 2; i++) {
      timers.push(setTimeout(() => setVisibleTier(i), 200 + i * 300));
    }
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

  // Step 7: Show total after bonuses
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

  // Emotion rules for the end screen character
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
  const charMood = characterId ? resolveCharacterMood(rawCharMood, characterId, shopOwned) : 'walk';
  const isCharLocked = !!(characterId && rawCharMood !== 'walk' && charMood === 'walk');
  const [showEmotionPopup, setShowEmotionPopup] = useState(false);

  const handleEndScreenBuy = () => {
    if (onBuyEmotion && characterId) onBuyEmotion(characterId, rawCharMood);
    setShowEmotionPopup(false);
  };

  // Generate actionable level message if absent
  const levelMessage = levelProgress?.message || (levelProgress ? generateLevelMessage(levelProgress) : null);

  return (
    <div style={pageStyle}>
      {/* Scrollable content area */}
      <div style={scrollAreaStyle}>
        <div style={contentWrapperStyle}>
        {/* Header card */}
        <div style={headerCardStyle}>
          {/* Mascot + Title row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            {/* Character mascot */}
            <div style={mascotContainerStyle}>
              {characterId ? (
                isCharLocked ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setShowEmotionPopup(true)}
                      title="Débloquer cette émotion"
                      style={lockedBubbleStyle}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{verticalAlign:'middle',marginRight:3}}><rect x="5" y="10" width="14" height="11" rx="2.5" fill="currentColor"/><path d="M8 10V7a4 4 0 118 0v3" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round"/></svg>{MOOD_BUBBLE_WORDS[rawCharMood] || ''}
                    </button>
                    <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '6px solid rgba(255,255,255,0.96)', marginTop: -1 }} />
                    <button type="button" onClick={() => setShowEmotionPopup(true)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', lineHeight: 0 }}>
                      <CharacterSprite id={characterId} mood="walk" size={68} glow={false} />
                    </button>
                  </div>
                ) : (
                  <CharacterSprite id={characterId} mood={charMood} size={68} glow={false} />
                )
              ) : (
                <div style={mascotFallbackStyle}>
                {pct === 100
                  ? <TrophyIcon size={32} color="#fbbf24" />
                  : <CheckIcon size={32} color="#34d399" />
                }
              </div>
              )}
            </div>

            {/* Title + score column */}
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={scoreDisplayStyle}>
                  {displayedScore}/{total}
                </span>
                <span style={titleStyle}>
                  Session terminée !
                </span>
              </div>
              {/* Feedback subtitle */}
              <div style={{
                opacity: showFeedback ? 1 : 0,
                transform: showFeedback ? 'translateY(0)' : 'translateY(4px)',
                transition: 'all 0.4s ease',
              }}>
                <p style={feedbackStyle}>{feedbackMessage}</p>
              </div>
            </div>
          </div>

          {/* Score rows / coin tiers */}
          <div style={{
            marginTop: 12,
            opacity: showCoins ? 1 : 0,
            transform: showCoins ? 'translateY(0)' : 'translateY(8px)',
            transition: 'all 0.5s ease',
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {tiers.map((tier, i) => {
                const visible = visibleTier >= i;
                const isActive = tier.active;
                const showCount = isActive && animatingCoins;
                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: isActive ? '10px 14px' : '7px 14px',
                    borderRadius: 10,
                    background: isActive ? 'rgba(251,191,36,0.10)' : 'transparent',
                    border: isActive ? '1px solid rgba(251,191,36,0.22)' : '1px solid transparent',
                    opacity: visible ? 1 : 0,
                    transform: visible ? 'translateX(0)' : 'translateX(-10px)',
                    transition: 'all 0.3s ease',
                  }}>
                    <span style={{
                      width: isActive ? 8 : 6, height: isActive ? 8 : 6,
                      borderRadius: '50%', flexShrink: 0,
                      background: isActive ? '#fbbf24' : 'rgba(255,255,255,0.3)',
                      boxShadow: isActive ? '0 0 8px rgba(251,191,36,0.5)' : 'none',
                    }} />
                    <span style={{
                      flex: 1, fontSize: 13, fontFamily: 'var(--font-body)',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.5)',
                    }}>
                      {tier.range}
                    </span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      fontFamily: 'var(--font-kid)', fontSize: 15,
                      fontWeight: 700,
                      color: isActive ? '#fbbf24' : 'rgba(255,255,255,0.3)',
                    }}>
                      {showCount ? displayedCoins : tier.coins}
                      {isActive ? (
                        <CoinIcon size={16} animate={animatingCoins} />
                      ) : (
                        <span style={mutedCoinStyle} />
                      )}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bonus rows */}
            {(firstSessionBonus > 0 || streakBonus > 0 || doubleCoinsBonus > 0) && (
              <div style={{
                marginTop: 8, paddingTop: 8,
                borderTop: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', flexDirection: 'column', gap: 2,
                opacity: showBonuses ? 1 : 0,
                transform: showBonuses ? 'translateY(0)' : 'translateY(4px)',
                transition: 'all 0.4s ease',
              }}>
                {firstSessionBonus > 0 && (
                  <BonusRow label="Bonus du jour" value={`+${displayedDailyBonus}`} />
                )}
                {streakBonus > 0 && (
                  <BonusRow label={`Bonus série ${streakMilestoneJustEarned.streak}j`} value={`+${displayedStreakBonus}`} />
                )}
                {doubleCoinsBonus > 0 && (
                  <BonusRow label="Double x2" value={`+${doubleCoinsBonus}`} />
                )}
              </div>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

            {/* Total */}
            {(firstSessionBonus > 0 || streakBonus > 0 || doubleCoinsBonus > 0) && (
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
                gap: 6, paddingRight: 14, marginTop: 4,
                opacity: showTotal ? 1 : 0,
                transform: showTotal ? 'translateY(0)' : 'translateY(4px)',
                transition: 'all 0.4s ease',
              }}>
                <span style={{ fontFamily: 'var(--font-kid)', fontSize: 26, fontWeight: 700, color: '#fbbf24' }}>
                  {totalCoins + streakBonus}
                </span>
                <CoinIcon size={22} />
              </div>
            )}
          </div>
        </div>

        {/* Prochain objectif — conditional */}
        {showLevelBar && (
          <div style={{
            opacity: showProgression ? 1 : 0,
            transform: showProgression ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.5s ease',
          }}>
            <div style={objectiveCardStyle}>
              <p style={objectiveTitleStyle}>
                Prochain objectif : {levelProgress.nextLevelName}
              </p>
              <div role="progressbar" style={progressTrackStyle}>
                <div style={{
                  height: '100%',
                  width: progressBarAnimated
                    ? `${Math.min((levelProgress.current / levelProgress.target) * 100, 100)}%`
                    : '0%',
                  background: 'linear-gradient(90deg, #34d399, #a78bfa)',
                  borderRadius: 999,
                  transition: 'width 0.9s cubic-bezier(0.16, 1, 0.3, 1)',
                }} />
              </div>
              {levelMessage && (
                <p style={objectiveMessageStyle}>
                  {levelMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Answer recap */}
        <div style={{
          opacity: showRecap ? 1 : 0,
          transform: showRecap ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.4s ease',
          marginBottom: 12,
        }}>
          <div style={recapCardStyle}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[...questions.map((q, i) => ({ q, a: answers[i], i }))].sort((x, y) => {
              const okX = x.a?.correct ? 1 : 0;
              const okY = y.a?.correct ? 1 : 0;
              return okX - okY; // errors first
            }).map(({ q, a, i }) => {
              const ok = a?.correct;
              const questionChoices = q._ruleChoices || rule.choices || [];
              const chosenLabel = questionChoices.find(c => c.id === a?.chosen)?.label || '';
              const answerLabel = questionChoices.find(c => c.id === q.answer)?.label || '';
              const qHasVerb = q.verb !== undefined;
              const isSyllable = !!q.syllable;
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '11px 14px', borderRadius: 12,
                  background: ok ? 'rgba(52,211,153,0.07)' : 'rgba(248,113,113,0.07)',
                  border: `1px solid ${ok ? 'rgba(52,211,153,0.18)' : 'rgba(248,113,113,0.18)'}`,
                  animation: `slide-up 0.28s ease ${i * 40}ms both`,
                }}>
                  {/* Check / Cross SVG */}
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                    background: ok ? 'rgba(52,211,153,0.18)' : 'rgba(248,113,113,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {ok ? (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    )}
                  </div>
                  {isSyllable ? (
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: 500, color: 'rgba(255,255,255,0.85)', flex: 1 }}>
                      <strong style={{ color: '#a78bfa', fontWeight: 700, textDecoration: 'underline', textDecorationColor: 'rgba(167,139,250,0.4)' }}>{q.syllable}</strong>
                      {' '}
                      <strong style={{ color: ok ? '#34d399' : '#f87171' }}>
                        {chosenLabel}
                      </strong>
                    </span>
                  ) : (
                    <span style={{ fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: 500, color: 'rgba(255,255,255,0.85)', flex: 1 }}>
                      {q.before}
                      {qHasVerb && q.verb}
                      <strong style={{ color: ok ? '#34d399' : '#f87171', fontWeight: 700, textDecoration: 'underline', textDecorationColor: ok ? 'rgba(52,211,153,0.4)' : 'rgba(248,113,113,0.4)' }}>
                        {qHasVerb ? chosenLabel.replace('-', '') : chosenLabel}
                      </strong>
                      {q.after}
                    </span>
                  )}
                  {!ok && (
                    <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', flexShrink: 0 }}>
                      {'\u2192'} {answerLabel}
                    </span>
                  )}
                </div>
              );
            })}
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Fixed CTA — always visible */}
      <div style={ctaContainerStyle}>
        <button
          onClick={onFinish}
          style={{
            ...ctaButtonStyle,
            opacity: showButton ? 1 : 0,
            transform: showButton ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.4s ease',
          }}
        >
          Continuer
        </button>
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

/* ── Sub-components ── */

function BonusRow({ label, value }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 14px',
    }}>
      <span style={{
        width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
        background: '#fbbf24',
        boxShadow: '0 0 8px rgba(251,191,36,0.5)',
      }} />
      <span style={{ flex: 1, fontSize: 13, fontFamily: 'var(--font-body)', fontWeight: 500, color: '#ffffff' }}>
        {label}
      </span>
      <span style={{
        fontFamily: 'var(--font-kid)', fontSize: 15, fontWeight: 700, color: '#34d399',
        display: 'inline-flex', alignItems: 'center', gap: 4,
      }}>
        {value}
        <CoinIcon size={14} />
      </span>
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

export function buildCoinTiers(total, t60, t80, t100, activeTier) {
  // For very small sessions, use simple labels instead of ranges
  if (total < 4) {
    return [
      { range: 'Réussite partielle', coins: 5, active: activeTier === 0 },
      { range: 'Bonne session', coins: 20, active: activeTier === 1 },
      { range: 'Parfait', coins: 30, active: activeTier === 2 },
    ];
  }
  // Build ranges, ensuring low <= high (no invalid ranges like 2-2 or 3-2)
  const buildRange = (lo, hi) => {
    if (lo >= hi) return `${lo} réponses justes`;
    return `${lo}\u2013${hi} réponses justes`;
  };
  return [
    { range: buildRange(t60, t80 - 1), coins: 5, active: activeTier === 0 },
    { range: buildRange(t80, t100 - 1), coins: 20, active: activeTier === 1 },
    { range: `${t100} réponses justes`, coins: 30, active: activeTier === 2 },
  ];
}

function generateLevelMessage(levelProgress) {
  if (!levelProgress) return null;
  const remaining = levelProgress.target - levelProgress.current;
  if (remaining <= 0) return null;
  if (remaining === 1) return 'Plus qu\'une session avec 3 bonnes réponses !';
  return `Plus que ${remaining} sessions avec 3 bonnes réponses !`;
}

/* ── Styles ── */

const pageStyle = {
  position: 'fixed',
  inset: 0,
  background: 'linear-gradient(180deg, #1e1e2e 0%, #2d2b55 50%, #1a1a2e 100%)',
  fontFamily: 'var(--font-body)',
  color: '#e2e2e2',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
};

const scrollAreaStyle = {
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  padding: '16px 16px 0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  WebkitOverflowScrolling: 'touch',
};

const contentWrapperStyle = {
  width: '100%',
  maxWidth: 480,
  paddingBottom: 100,
};

const headerCardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 20,
  padding: '18px 20px 14px',
  marginBottom: 12,
  animation: 'fade-in 0.4s ease both',
};

const mascotContainerStyle = {
  flexShrink: 0,
  width: 68,
  height: 68,
  borderRadius: '50%',
  background: 'linear-gradient(145deg, #2d2b55, #1e1e2e)',
  border: '1px solid rgba(255,255,255,0.10)',
  boxShadow: '0 8px 24px rgba(122,92,255,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  animation: 'count-up 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
};

const mascotFallbackStyle = {
  width: 68,
  height: 68,
  borderRadius: '50%',
  background: 'linear-gradient(145deg, #2d2b55, #1e1e2e)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const lockedBubbleStyle = {
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
  gap: 4,
};

const scoreDisplayStyle = {
  fontFamily: 'var(--font-kid)',
  fontSize: 30,
  fontWeight: 700,
  color: '#34d399',
  letterSpacing: '-0.02em',
  animation: 'count-up 0.4s cubic-bezier(0.34,1.56,0.64,1) both',
};

const titleStyle = {
  fontFamily: 'var(--font-display)',
  fontSize: 17,
  fontWeight: 800,
  color: '#a78bfa',
  letterSpacing: '-0.02em',
  whiteSpace: 'nowrap',
};

const feedbackStyle = {
  fontFamily: 'var(--font-body)',
  fontSize: 12,
  fontStyle: 'italic',
  color: '#ffffff',
  margin: '4px 0 0',
  lineHeight: 1.4,
};

const mutedCoinStyle = {
  display: 'inline-block',
  width: 13, height: 13,
  borderRadius: '50%',
  background: 'rgba(255,255,255,0.18)',
};

const recapCardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 16,
  padding: '14px 16px',
};

const objectiveCardStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.10)',
  borderRadius: 16,
  padding: '14px 16px',
  marginBottom: 12,
};

const objectiveTitleStyle = {
  margin: '0 0 8px 0',
  fontFamily: 'var(--font-kid)',
  fontSize: 13,
  fontWeight: 600,
  color: '#a78bfa',
};

const progressTrackStyle = {
  width: '100%',
  height: 7,
  borderRadius: 999,
  background: 'rgba(255,255,255,0.08)',
  overflow: 'hidden',
};

const objectiveMessageStyle = {
  margin: '8px 0 0 0',
  fontSize: 12,
  fontFamily: 'var(--font-body)',
  color: '#a78bfa',
  fontStyle: 'italic',
};

const ctaContainerStyle = {
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: '12px 16px 16px',
  background: 'linear-gradient(to top, #1a1a2e 60%, transparent)',
  display: 'flex',
  justifyContent: 'center',
  pointerEvents: 'none',
  zIndex: 10,
};

const ctaButtonStyle = {
  width: '100%',
  maxWidth: 480, // matches contentWrapperStyle
  padding: '16px 24px',
  borderRadius: 9999,
  border: 'none',
  background: 'linear-gradient(135deg, #34d399 0%, #a78bfa 100%)',
  color: '#ffffff',
  fontFamily: 'var(--font-kid)',
  fontSize: 18,
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 8px 30px rgba(52,211,153,0.35), 0 4px 12px rgba(0,0,0,0.3)',
  pointerEvents: 'auto',
};

import { useState, useEffect, useRef } from 'react';
import CoinIcon from './CoinIcon.jsx';
import VictoryAnimationPreview from './VictoryAnimationPreview.jsx';
import { calculateCoins } from '../engine/scoring.js';

/**
 * Shared end-of-session screen used by both QuizGuided and QuizDirect.
 *
 * Props:
 *   rule, questions, answers, score, onFinish
 *   isFirstSessionOfDay (optional, boolean) — shows +10 bonus if true
 *
 *   levelProgress (optional, object) — progression toward the next level
 *     {
 *       currentLevel: 2,
 *       nextLevel: 3,
 *       nextLevelName: 'Couronne',
 *       current: 2,          // e.g. 2 out of 3 qualifying sessions
 *       target: 3,
 *       justLeveledUp: false, // true if level was reached in this session
 *       message: "Plus qu'une session !"
 *     }
 *
 *   streakInfo (optional, object) — info about the next streak tier
 *     {
 *       current: 5,
 *       title: 'Sur la lancée',
 *       nextTierDays: 7,
 *       nextTierTitle: 'En feu',
 *       daysLeft: 2,
 *     }
 */
export default function EndScreen({
  rule,
  questions,
  answers,
  score,
  onFinish,
  isFirstSessionOfDay,
  levelProgress,
  streakInfo,
  victoryAnimationId,
}) {
  const total = questions.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const baseCoins = calculateCoins(score, total);
  const bonusCoins = isFirstSessionOfDay ? 10 : 0;
  const totalCoins = baseCoins + bonusCoins;
  const emoji = pct === 100 ? '\u{1F3C6}' : pct >= 70 ? '\u{1F44F}' : pct >= 50 ? '\u{1F4AA}' : '\u{1F4DA}';

  // Score feedback message
  const feedbackMessage = getFeedbackMessage(pct);

  // End screen steps: score -> coins -> progression -> recap -> button
  const [displayedScore, setDisplayedScore] = useState(() => (
    score === 0 || total <= 2 ? score : 0
  ));
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCoins, setShowCoins] = useState(false);
  const [showProgression, setShowProgression] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [progressBarAnimated, setProgressBarAnimated] = useState(false);
  const scoreRef = useRef(null);

  // Step 1: Counting animation for score (adapts to question count)
  useEffect(() => {
    if (score === 0) {
      const t = setTimeout(() => setShowFeedback(true), 400);
      return () => clearTimeout(t);
    }

    // For 1 question (debug mode): instant display
    if (total <= 2) {
      return undefined;
    }

    // For larger counts: count up in ~1 second (50ms interval)
    const targetSteps = 20; // ~1s at 50ms per step
    const step = Math.max(1, Math.ceil(score / targetSteps));
    let current = 0;
    const interval = setInterval(() => {
      current += step;
      if (current >= score) {
        current = score;
        clearInterval(interval);
      }
      setDisplayedScore(current);
    }, 50);
    return () => clearInterval(interval);
  }, [score, total]);

  // Step 2: Show feedback after score counting finishes
  useEffect(() => {
    if (displayedScore === score) {
      const t = setTimeout(() => setShowFeedback(true), 200);
      return () => clearTimeout(t);
    }
  }, [displayedScore, score]);

  // Step 3: Show coins after feedback
  useEffect(() => {
    if (showFeedback) {
      const t = setTimeout(() => setShowCoins(true), 400);
      return () => clearTimeout(t);
    }
  }, [showFeedback]);

  // Step 4: Show progression section after coins
  useEffect(() => {
    if (showCoins) {
      const t = setTimeout(() => setShowProgression(true), 500);
      return () => clearTimeout(t);
    }
  }, [showCoins]);

  // Step 4b: Animate the progress bar after it appears
  useEffect(() => {
    if (showProgression) {
      const t = setTimeout(() => setProgressBarAnimated(true), 100);
      return () => clearTimeout(t);
    }
  }, [showProgression]);

  // Step 5: Show recap after progression
  useEffect(() => {
    if (showProgression) {
      const t = setTimeout(() => setShowRecap(true), 600);
      return () => clearTimeout(t);
    }
  }, [showProgression]);

  // Step 6: Show button after recap
  useEffect(() => {
    if (showRecap) {
      const t = setTimeout(() => setShowButton(true), 400);
      return () => clearTimeout(t);
    }
  }, [showRecap]);

  // Determine if we should show the level progress bar
  const showLevelBar = levelProgress && !levelProgress.justLeveledUp;
  // Determine if we should show streak tier info
  const showStreakTier = streakInfo && streakInfo.daysLeft > 0 && streakInfo.nextTierTitle;

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* 1. Big emoji + score with counting animation */}
        <div style={{ textAlign: 'center', marginBottom: '0.6rem' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
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
            <div style={{
              fontSize: '1.25rem',
              marginBottom: '0.15rem',
              lineHeight: 1,
            }}>
              {emoji}
            </div>
          )}
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent)', marginBottom: '0.3rem' }}>
            Session terminée !
          </h1>
          <p ref={scoreRef} style={{ fontSize: '1.4rem', color: '#d1d5db', margin: 0 }}>
            <strong style={{
              color: pct >= 70 ? '#4ade80' : '#fbbf24',
              fontSize: '2rem',
              transition: 'all 0.2s',
            }}>
              {displayedScore}/{total}
            </strong>
            <span style={{ fontSize: '1rem', color: '#9ca3af', marginLeft: '0.5rem' }}>
              ({pct}%)
            </span>
          </p>
        </div>

        {/* 2. Score feedback message */}
        <div style={{
          textAlign: 'center', marginBottom: '1.2rem',
          opacity: showFeedback ? 1 : 0,
          transform: showFeedback ? 'translateY(0)' : 'translateY(6px)',
          transition: 'all 0.4s ease',
        }}>
          <p style={{
            fontSize: '0.92rem', fontStyle: 'italic', color: '#9ca3af',
            margin: 0, lineHeight: 1.5,
          }}>
            {feedbackMessage}
          </p>
        </div>

        {/* 3. Coins earned with breakdown */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          gap: '0.3rem', marginBottom: '1.3rem',
          opacity: showCoins ? 1 : 0,
          transform: showCoins ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.8)',
          transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          {/* Total coins */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CoinIcon size={28} animate={showCoins} />
            <span style={{
              fontSize: '1.3rem', fontWeight: 900, color: '#fbbf24',
              textShadow: '0 0 12px rgba(251,191,36,0.3)',
            }}>
              +{totalCoins}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>pièces gagnées</span>
          </div>
          {/* Breakdown */}
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '0.15rem', marginTop: '0.2rem',
          }}>
            <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>
              Base : +{baseCoins}
            </span>
            {isFirstSessionOfDay && (
              <span style={{ fontSize: '0.72rem', color: '#6b7280' }}>
                Bonus première session : +10
              </span>
            )}
          </div>
        </div>

        {/* 4. Level progress bar toward next level (C1) */}
        {showLevelBar && (
          <div style={{
            marginBottom: '1rem',
            opacity: showProgression ? 1 : 0,
            transform: showProgression ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.5s ease',
          }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 14,
              padding: '0.9rem 1rem',
              border: '1px solid rgba(255,255,255,0.08)',
            }}>
              <p style={{
                margin: '0 0 0.5rem 0',
                fontSize: '0.82rem',
                color: 'var(--color-accent)',
                fontWeight: 600,
                textAlign: 'center',
              }}>
                Prochain objectif : {levelProgress.nextLevelName}
              </p>

              {/* Progress bar */}
              <div
                role="progressbar"
                aria-valuenow={levelProgress.current}
                aria-valuemin={0}
                aria-valuemax={levelProgress.target}
                aria-label={`Progression : ${levelProgress.current} sur ${levelProgress.target}`}
                style={{
                  width: '100%',
                  height: 10,
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: 5,
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                <div style={{
                  height: '100%',
                  width: progressBarAnimated
                    ? `${Math.min((levelProgress.current / levelProgress.target) * 100, 100)}%`
                    : '0%',
                  background: 'linear-gradient(90deg, #7c3aed, var(--color-primary))',
                  borderRadius: 5,
                  transition: 'width 0.8s ease-out',
                  boxShadow: '0 0 8px rgba(124,58,237,0.4)',
                }} />
              </div>

              {/* Count label */}
              <p style={{
                margin: '0.35rem 0 0 0',
                fontSize: '0.72rem',
                color: '#9ca3af',
                textAlign: 'center',
              }}>
                {levelProgress.current}/{levelProgress.target} sessions qualifiantes
              </p>

              {/* Contextual message */}
              {levelProgress.message && (
                <p style={{
                  margin: '0.3rem 0 0 0',
                  fontSize: '0.78rem',
                  color: 'var(--color-accent)',
                  textAlign: 'center',
                  fontStyle: 'italic',
                }}>
                  {levelProgress.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* 5. Next streak tier (C2) */}
        {showStreakTier && (
          <div style={{
            textAlign: 'center',
            marginBottom: '0.8rem',
            opacity: showProgression ? 1 : 0,
            transform: showProgression ? 'translateY(0)' : 'translateY(6px)',
            transition: 'all 0.5s ease 0.15s',
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.78rem',
              color: '#6b7280',
              lineHeight: 1.5,
            }}>
              Encore {streakInfo.daysLeft} jour{streakInfo.daysLeft > 1 ? 's' : ''} pour
              {' '}&#171;&#160;{streakInfo.nextTierTitle}&#160;&#187;
            </p>
          </div>
        )}

        {/* Separator line */}
        <div style={{
          height: 1,
          background: 'rgba(255,255,255,0.08)',
          margin: '0 0 1.2rem 0',
          opacity: showRecap ? 1 : 0,
          transition: 'opacity 0.4s ease',
        }} />

        {/* 6. Recap (scrollable) */}
        <div style={{
          opacity: showRecap ? 1 : 0,
          transform: showRecap ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.4s ease',
        }}>
          <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: '1.5rem', paddingRight: '0.3rem' }}>
            {questions.map((q, i) => {
              const a = answers[i];
              const ok = a?.correct;
              const qHasVerb = q.verb !== undefined;
              const questionChoices = q._ruleChoices || rule.choices || [];
              const chosenLabel = questionChoices.find(c => c.id === a?.chosen)?.label || '';
              const answerLabel = questionChoices.find(c => c.id === q.answer)?.label || '';
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
                      → {answerLabel}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. Continue button */}
        <div style={{
          opacity: showButton ? 1 : 0,
          transform: showButton ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.4s ease',
        }}>
          <button
            onClick={onFinish}
            aria-label="Continuer vers le tableau de bord"
            style={{
              width: '100%', padding: '0.85rem', borderRadius: 12,
              border: 'none',
              background: 'linear-gradient(135deg, #7c3aed, var(--color-primary))',
              color: '#fff', cursor: 'pointer', fontSize: '1rem', fontWeight: 700,
              boxShadow: '0 4px 15px rgba(124,58,237,0.3)',
            }}
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── HELPERS ─── */

function getFeedbackMessage(pct) {
  if (pct === 100) return 'Parfait ! Pas une seule erreur.';
  if (pct >= 90) return 'Excellent. Tu maîtrises cette règle.';
  if (pct >= 80) return 'Très bien. Continue comme ça.';
  if (pct >= 60) return 'Pas mal. Quelques points à revoir.';
  return 'Courage. La prochaine sera meilleure.';
}

/* ─── SHARED STYLES ─── */

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, var(--color-bg1) 0%, var(--color-bg2) 100%)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'var(--font-body)',
  padding: '1.5rem', color: '#e2e2e2',
};

const cardStyle = {
  maxWidth: 620, width: '100%',
  background: 'rgba(255,255,255,0.06)',
  borderRadius: 20, padding: '2rem 2.2rem',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
};

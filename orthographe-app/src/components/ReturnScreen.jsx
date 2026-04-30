import { useState, useEffect, useRef, useCallback } from 'react';
import FlameIcon from './FlameIcon.jsx';
import DiamondIcon from './DiamondIcon.jsx';
import DiamondStatus from './DiamondStatus.jsx';
import CrownIcon from './CrownIcon.jsx';
import ShieldIcon from './ShieldIcon.jsx';
import PinInput from './PinInput.jsx';

/**
 * ReturnScreen — shown when Damien returns after inactivity (>= 2 days).
 *
 * Props:
 *   progress       — full progress object
 *   streakLost     — { was: number, shields: boolean } or null
 *   diamondChanges — [{ ruleId, ruleTitle, oldHealth, newHealth, broken }]
 *   onContinue     — callback to dismiss and go to dashboard
 */
export default function ReturnScreen({
  streakLost,
  streakSaveable,
  shieldsToUse,
  shieldsToBuy,
  costToBuy,
  coins: _coins,
  previousStreak,
  daysMissed,
  diamondChanges,
  onContinue,
  onSaveStreak,
  onPinSubmit,
  pinLockout,
  hasPinSetup,
}) {
  const [step, setStep] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [stepVisible, setStepVisible] = useState(false);
  const [showPinStep, setShowPinStep] = useState(false);
  const [pinError, setPinError] = useState(null);
  const [pinLockedUntil, setPinLockedUntil] = useState(pinLockout?.lockedUntil || 0);

  // Streak animation state
  const [streakCountdown, setStreakCountdown] = useState(previousStreak || 0);
  const [flamePhase, setFlamePhase] = useState('visible'); // 'visible' | 'extinguishing' | 'smoke'
  const countdownRef = useRef(null);

  // Diamond animation state — track displayed health per diamond index
  const [diamondDisplayHealth, setDiamondDisplayHealth] = useState({});

  // Button visibility
  const [showButton, setShowButton] = useState(false);

  const hasStreakStep = streakLost || streakSaveable;
  const hasMissedDaysIntro = hasStreakStep && (daysMissed || 0) > 0;
  const introStep = hasMissedDaysIntro ? 0 : -1;
  const streakStep = hasStreakStep ? (hasMissedDaysIntro ? 1 : 0) : -1;
  const totalSteps = (hasStreakStep ? (hasMissedDaysIntro ? 2 : 1) : 0) + (diamondChanges?.length || 0) + 1;
  const diamondStartStep = hasStreakStep ? streakStep + 1 : 0;
  const actionStep = totalSteps - 1;
  // Mount fade-in
  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Step visibility with float-in delay
  useEffect(() => {
    let frameId = null;
    frameId = requestAnimationFrame(() => setStepVisible(false));
    const timer = setTimeout(() => setStepVisible(true), 80);
    return () => {
      clearTimeout(timer);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [step]);

  // ─── Streak countdown animation ─────────────────────────────────
  useEffect(() => {
    if (step !== streakStep || !streakLost || streakSaveable) return;

    const startVal = previousStreak;
    const duration = 500;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(elapsed / duration, 1);
      const current = Math.round(startVal * (1 - pct));
      setStreakCountdown(current);
      if (pct >= 1) {
        setStreakCountdown(0);
        // Start flame extinguish after countdown hits 0
        setTimeout(() => setFlamePhase('extinguishing'), 150);
        // Show smoke after flame finishes (0.8s animation)
        setTimeout(() => setFlamePhase('smoke'), 950);
      } else {
        countdownRef.current = requestAnimationFrame(tick);
      }
    };

    // Start countdown after initial display
    const timer = setTimeout(() => {
      countdownRef.current = requestAnimationFrame(tick);
    }, 800);

    return () => {
      clearTimeout(timer);
      if (countdownRef.current) cancelAnimationFrame(countdownRef.current);
    };
  }, [step, streakLost, streakStep]); // eslint-disable-line react-hooks/exhaustive-deps

  // ─── Diamond degradation sequence ───────────────────────────────
  useEffect(() => {
    const diamondIndex = step - diamondStartStep;
    if (diamondIndex < 0 || !diamondChanges || diamondIndex >= diamondChanges.length) return;

    const change = diamondChanges[diamondIndex];
    let frameId = null;

    // Show old health first
    frameId = requestAnimationFrame(() => {
      setDiamondDisplayHealth(prev => ({ ...prev, [diamondIndex]: change.oldHealth }));
    });

    // After 0.5s, transition to new health (CSS transitions handle the visual)
    const timer = setTimeout(() => {
      setDiamondDisplayHealth(prev => ({ ...prev, [diamondIndex]: change.newHealth }));
    }, 500);

    return () => {
      clearTimeout(timer);
      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [step, diamondStartStep, diamondChanges]);

  // ─── Auto-advance steps with delay ──────────────────────────────
  useEffect(() => {
    if (step >= actionStep) {
      // Show button after a brief delay
      const timer = setTimeout(() => setShowButton(true), 600);
      return () => clearTimeout(timer);
    }
  }, [step, actionStep]);

  const goNext = useCallback(() => {
    if (step < actionStep) {
      setStep(s => s + 1);
    } else {
      onContinue();
    }
  }, [step, actionStep, onContinue]);


  const renderMissedDaysIntro = () => {
    if (step !== introStep || !hasMissedDaysIntro) return null;

    return (
      <div style={{
        textAlign: 'center',
        opacity: stepVisible ? 1 : 0,
        transform: stepVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        {!showPinStep ? (
          <>
            <div style={{ fontSize: '2.6rem', marginBottom: '0.9rem' }}>{'📆'}</div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#e2e2e2', marginBottom: '0.5rem' }}>
              Retour après une pause
            </h2>
            <p style={{ fontSize: '0.98rem', color: '#cbd5e1', lineHeight: 1.6, maxWidth: 360, margin: '0 auto 1.4rem' }}>
              {daysMissed} jour{daysMissed > 1 ? 's' : ''} de flamme raté{daysMissed > 1 ? 's' : ''}{hasPinSetup ? ', si tu avais une bonne raison demande le code à ton parent.' : '.'}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 320, margin: '0 auto' }}>
              <button
                onClick={goNext}
                style={primaryButtonStyle}
              >
                Continuer
              </button>
              {hasPinSetup && (
                <button
                  onClick={() => setShowPinStep(true)}
                  style={secondaryButtonStyle}
                >
                  Demander à tes parents
                </button>
              )}
            </div>
          </>
        ) : (
          <div style={{ maxWidth: 320, margin: '0 auto' }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.6rem' }}>🔒</div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#e2e2e2', marginBottom: '0.4rem' }}>
              Code parental
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#9ca3af', marginBottom: '1.2rem', lineHeight: 1.5 }}>
              Demande le code à tes parents pour sauver ta flamme.
            </p>
            <PinInput
              onComplete={async (pin) => {
                const result = await onPinSubmit?.(pin);
                if (result?.ok) return;
                setPinError(result?.error || 'Code incorrect.');
                if (result?.lockedUntil) setPinLockedUntil(result.lockedUntil);
              }}
              error={pinError}
              lockedUntil={pinLockedUntil}
            />
            <button
              onClick={() => { setShowPinStep(false); setPinError(null); }}
              style={{ ...secondaryButtonStyle, marginTop: '1rem', width: '100%' }}
            >
              Annuler
            </button>
          </div>
        )}
      </div>
    );
  };

  // ─── Render: Streak news ────────────────────────────────────────
  const renderStreakNews = () => {
    if (step !== streakStep) return null;
    if (!streakLost && !streakSaveable) return null;

    // Streak en danger — can be saved using stock shields + buying more
    if (streakSaveable) {
      // Build detail lines
      const lines = [];
      if (shieldsToUse > 0) lines.push(`${shieldsToUse} bouclier${shieldsToUse > 1 ? 's' : ''} du stock`);
      if (shieldsToBuy > 0) lines.push(`${shieldsToBuy} bouclier${shieldsToBuy > 1 ? 's' : ''} à acheter (${costToBuy} pièces)`);
      const detail = lines.join(' + ');

      const btnLabel = costToBuy > 0
        ? `🛡️ Sauver la flamme — ${costToBuy} pièces`
        : '🛡️ Utiliser mes boucliers';

      return (
        <div style={{
          textAlign: 'center',
          opacity: stepVisible ? 1 : 0,
          transform: stepVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>
          <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
            <ShieldIcon size={64} active={false} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24', marginBottom: '0.5rem' }}>
            Flamme en danger
          </h2>
          <p style={{ fontSize: '1rem', color: '#9ca3af', lineHeight: 1.6, maxWidth: 340, margin: '0 auto 0.5rem' }}>
            Ta flamme de <strong style={{ color: '#fbbf24' }}>{previousStreak} jours</strong> n&apos;est pas encore perdue.
          </p>
          <p style={{ fontSize: '0.85rem', color: '#6b7280', maxWidth: 320, margin: '0 auto 1.5rem' }}>
            {detail}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxWidth: 300, margin: '0 auto' }}>
            <button
              onClick={() => onSaveStreak()}
              style={{
                padding: '0.85rem 1.5rem', borderRadius: 14, border: 'none',
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                color: '#fff', cursor: 'pointer', fontSize: '1rem', fontWeight: 700,
                boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
              }}
            >
              {btnLabel}
            </button>
            <button
              onClick={goNext}
              style={{
                padding: '0.6rem 1.2rem', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'transparent', color: '#6b7280',
                cursor: 'pointer', fontSize: '0.85rem',
              }}
            >
              Laisser tomber la flamme
            </button>
          </div>
        </div>
      );
    }


    // Streak lost — full animation sequence
    return (
      <div style={{
        textAlign: 'center',
        opacity: stepVisible ? 1 : 0,
        transform: stepVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        {/* Flame / smoke area */}
        <div style={{
          marginBottom: '0.8rem',
          display: 'flex', justifyContent: 'center',
          minHeight: 72,
          position: 'relative',
        }}>
          {/* Flame with extinguish animation */}
          {flamePhase !== 'smoke' && (
            <div style={{
              animation: flamePhase === 'extinguishing'
                ? 'rs-flame-extinguish 0.8s ease-in forwards'
                : undefined,
              transformOrigin: 'center bottom',
            }}>
              <FlameIcon size={64} intensity={0} />
            </div>
          )}

          {/* Smoke particles */}
          {flamePhase === 'smoke' && (
            <div style={{
              position: 'relative',
              width: 64, height: 64,
              display: 'flex', justifyContent: 'center', alignItems: 'center',
            }}>
              {[0, 1, 2].map(i => (
                <div
                  key={`smoke-${i}`}
                  style={{
                    position: 'absolute',
                    width: 10 + i * 4,
                    height: 10 + i * 4,
                    borderRadius: '50%',
                    background: `rgba(107, 114, 128, ${0.35 - i * 0.08})`,
                    bottom: 12,
                    left: `${50 + (i - 1) * 15}%`,
                    transform: 'translateX(-50%)',
                    animation: `rs-smoke-rise 1.2s ease-out ${i * 0.15}s forwards`,
                    opacity: 0,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Streak countdown number */}
        <div style={{
          fontSize: '2.5rem', fontWeight: 900, color: '#f87171',
          marginBottom: '0.3rem',
          fontVariantNumeric: 'tabular-nums',
          transition: 'transform 0.1s ease',
          transform: streakCountdown === 0 ? 'scale(1.1)' : 'scale(1)',
        }}>
          {streakCountdown}
        </div>

        <h2 style={{
          fontSize: '1.2rem', fontWeight: 800, color: '#e2e2e2',
          marginBottom: '0.5rem',
        }}>
          Flamme terminée
        </h2>
        <p style={{
          fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.6,
          maxWidth: 340, margin: '0 auto',
        }}>
          Ta flamme de <strong style={{ color: '#fbbf24' }}>{previousStreak} jours</strong> est revenue à zéro.
          <br />Ça arrive. L&apos;important c&apos;est de reprendre.
        </p>
      </div>
    );
  };

  // ─── Render: Diamond news ───────────────────────────────────────
  const renderDiamondNews = (change, index) => {
    const relativeStep = diamondStartStep + index;
    if (step !== relativeStep) return null;

    const displayHealth = diamondDisplayHealth[index] ?? change.oldHealth;
    const healthPct = Math.round(change.newHealth * 100);
    const oldPct = Math.round(change.oldHealth * 100);
    const showDelta = displayHealth === change.newHealth;

    return (
      <div key={change.ruleId} style={{
        textAlign: 'center',
        opacity: stepVisible ? 1 : 0,
        transform: stepVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        <div style={{
          marginBottom: '0.8rem',
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: '1rem',
          minHeight: 64,
        }}>
          {change.broken ? (
            <BrokenDiamondSequence displayHealth={displayHealth} />
          ) : (
            <DiamondStatus health={displayHealth} size={56} animate />
          )}
        </div>

        <h3 style={{
          fontSize: '1.1rem', fontWeight: 700, color: 'var(--color-accent)',
          marginBottom: '0.4rem',
        }}>
          {change.ruleTitle}
        </h3>

        {change.broken ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', marginBottom: '0.5rem',
            opacity: showDelta ? 1 : 0,
            transition: 'opacity 0.5s ease 0.3s',
          }}>
            <span style={{ fontSize: '0.9rem', color: '#f87171', fontWeight: 700 }}>
              Diamant brisé
            </span>
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#f87171" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 700 }}>
              Rétrogradé en couronne
            </span>
          </div>
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: '0.5rem', marginBottom: '0.5rem',
          }}>
            <HealthBadge value={oldPct} />
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"
              style={{
                opacity: showDelta ? 1 : 0,
                transition: 'opacity 0.4s ease',
              }}>
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={{
              opacity: showDelta ? 1 : 0,
              transform: showDelta ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}>
              <HealthBadge value={healthPct} />
            </div>
          </div>
        )}

        <p style={{
          fontSize: '0.82rem', color: '#6b7280', lineHeight: 1.5,
          maxWidth: 320, margin: '0 auto',
          opacity: showDelta ? 1 : 0,
          transition: 'opacity 0.5s ease 0.2s',
        }}>
          {change.broken
            ? 'Le diamant s\'est brisé après trop d\'inactivité. Refais 3 sessions parfaites pour le récupérer.'
            : change.newHealth < 0.5
              ? 'Le diamant se fissure. Une révision permettrait de le restaurer.'
              : 'Le diamant a terni. Révise pour qu\'il retrouve son éclat.'
          }
        </p>
      </div>
    );
  };

  // ─── Render: Action step ────────────────────────────────────────
  const renderAction = () => {
    if (step !== actionStep) return null;

    const dueCount = diamondChanges?.filter(d => !d.broken).length || 0;

    return (
      <div style={{
        textAlign: 'center',
        opacity: stepVisible ? 1 : 0,
        transform: stepVisible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}>
        <div style={{
          fontSize: '2.5rem', marginBottom: '0.8rem',
          animation: 'subtle-float 3s ease-in-out infinite',
        }}>
          💪
        </div>
        <h2 style={{
          fontSize: '1.3rem', fontWeight: 800, color: '#e2e2e2',
          marginBottom: '0.5rem',
        }}>
          On reprend ?
        </h2>
        <p style={{
          fontSize: '0.9rem', color: '#9ca3af', lineHeight: 1.6,
          maxWidth: 340, margin: '0 auto 1.5rem',
        }}>
          {dueCount > 0
            ? `${dueCount} règle${dueCount > 1 ? 's ont' : ' a'} besoin de toi. Commence par la plus urgente.`
            : 'Chaque jour compte. Une session suffit pour relancer la machine.'
          }
        </p>
        <div style={{
          opacity: showButton ? 1 : 0,
          transform: showButton ? 'translateY(0) scale(1)' : 'translateY(12px) scale(0.95)',
          transition: 'opacity 0.5s ease, transform 0.5s ease',
        }}>
          <button
            onClick={onContinue}
            style={{
              padding: '0.9rem 2rem',
              borderRadius: 14,
              border: 'none',
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '1.05rem',
              fontWeight: 700,
              boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
              animation: showButton ? 'card-glow 3s ease-in-out infinite' : 'none',
            }}
          >
            Reprendre
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      backgroundColor: 'rgba(var(--color-bg1-rgb),0.97)',
      backgroundImage: 'var(--app-page-overlay), var(--app-page-image)',
      backgroundSize: 'cover, cover',
      backgroundPosition: 'center, center',
      backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000,
      fontFamily: 'var(--font-body)',
      color: '#e2e2e2',
      opacity: mounted ? 1 : 0,
      transition: 'opacity 0.5s ease',
    }}>
      <div style={{
        maxWidth: 440, width: '100%', padding: '2rem 1.5rem',
      }}>
        {/* Step indicators */}
        {totalSteps > 2 && (
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '0.4rem',
            marginBottom: '2rem',
          }}>
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} style={{
                width: i === step ? 20 : 8, height: 4,
                borderRadius: 2,
                background: i === step ? 'var(--color-accent)' : i < step ? 'rgba(var(--color-accent-rgb),0.3)' : 'rgba(255,255,255,0.08)',
                transition: 'all 0.3s ease',
              }} />
            ))}
          </div>
        )}

        {/* Content */}
        <div style={{ minHeight: 260, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '100%' }}>
            {renderMissedDaysIntro()}
            {renderStreakNews()}
            {diamondChanges?.map((change, i) => renderDiamondNews(change, i))}
            {renderAction()}
          </div>
        </div>

        {/* Navigation — only show before action step, hide on steps that have their own buttons */}
        {step < actionStep && step !== introStep && !(step === streakStep && streakSaveable) && (
          <div style={{
            textAlign: 'center', marginTop: '2rem',
            opacity: stepVisible ? 1 : 0,
            transition: 'opacity 0.4s ease 0.8s',
          }}>
            <button
              onClick={goNext}
              style={{
                padding: '0.7rem 1.5rem',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.06)',
                color: '#9ca3af',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 600,
              }}
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {/* ── ReturnScreen keyframes ── */}
      <style>{`
        @keyframes rs-flame-extinguish {
          0% { transform: scale(1); opacity: 1; }
          40% { transform: scale(0.6) translateY(8px); opacity: 0.6; }
          100% { transform: scale(0) translateY(24px); opacity: 0; }
        }
        @keyframes rs-smoke-rise {
          0% { opacity: 0; transform: translateX(-50%) translateY(0) scale(0.5); }
          30% { opacity: 0.4; transform: translateX(-50%) translateY(-12px) scale(1); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-40px) scale(1.3); }
        }
        @keyframes rs-crossfade-in {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          60% { opacity: 1; transform: translate(-50%, -50%) scale(1.15); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes rs-diamond-shatter {
          0% { transform: scale(1); opacity: 1; }
          20% { transform: scale(1.05) rotate(-2deg); opacity: 0.9; }
          50% { transform: scale(0.9) rotate(3deg); opacity: 0.5; }
          100% { transform: scale(0.3) rotate(15deg); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ─── BrokenDiamondSequence ────────────────────────────────────────
// Shows diamond at 0 with tremble, then crossfades to crown after 1s

function BrokenDiamondSequence({ displayHealth }) {
  const [phase, setPhase] = useState('diamond'); // 'diamond' | 'breaking' | 'crown'

  useEffect(() => {
    if (displayHealth <= 0) {
      // Diamond is at 0: tremble for 1s, then break and show crown
      const breakTimer = setTimeout(() => setPhase('breaking'), 800);
      const crownTimer = setTimeout(() => setPhase('crown'), 1600);
      return () => {
        clearTimeout(breakTimer);
        clearTimeout(crownTimer);
      };
    }
  }, [displayHealth]);

  return (
    <div style={{ position: 'relative', width: 56, height: 56 }}>
      {/* Diamond layer */}
      {phase !== 'crown' && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          animation: phase === 'breaking' ? 'rs-diamond-shatter 0.8s ease-in forwards' : undefined,
        }}>
          <DiamondStatus health={displayHealth} size={56} animate />
        </div>
      )}
      {/* Crown layer */}
      {phase === 'crown' && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          animation: 'rs-crossfade-in 0.6s ease-out forwards',
        }}>
          <CrownIcon size={40} active />
        </div>
      )}
    </div>
  );
}

// ─── HealthBadge ──────────────────────────────────────────────────

function HealthBadge({ value }) {
  const color = value >= 80 ? '#4ade80' : value >= 50 ? '#fbbf24' : '#f87171';
  return (
    <span style={{
      fontSize: '0.85rem', fontWeight: 700, color,
      background: `${color}15`,
      padding: '0.2rem 0.5rem',
      borderRadius: 6,
      border: `1px solid ${color}33`,
    }}>
      {value}%
    </span>
  );
}

const primaryButtonStyle = {
  padding: '0.85rem 1.5rem',
  borderRadius: 14,
  border: 'none',
  background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
  color: '#fff',
  cursor: 'pointer',
  fontSize: '1rem',
  fontWeight: 700,
  boxShadow: '0 4px 20px rgba(124,58,237,0.3)',
};

const secondaryButtonStyle = {
  padding: '0.7rem 1.2rem',
  borderRadius: 12,
  border: '1px solid rgba(255,255,255,0.1)',
  background: 'transparent',
  color: '#9ca3af',
  cursor: 'pointer',
  fontSize: '0.9rem',
  fontWeight: 600,
};

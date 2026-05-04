import { useState } from 'react';
import { Link } from 'react-router-dom';
import AppLogo from './AppLogo.jsx';

/**
 * MiniQuiz — 2-question quiz for SEO rule pages. No auth required.
 * Shows 2 questions (difficulty 1 preferred), feedback per answer,
 * then a CTA gate inviting the user to sign up after completion.
 *
 * Props:
 *   rule      – full rule JSON object
 *   quizIntro – intro sentence from seoContent
 *   onStart   – optional callback (PostHog)
 *   onComplete – optional callback(score, total) (PostHog)
 */
export default function MiniQuiz({ rule, quizIntro, onStart, onComplete }) {
  const [phase, setPhase] = useState('idle'); // idle | playing | done
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [_answers, setAnswers] = useState([]);

  // Pick 2 questions, preferring difficulty 1
  const questions = getQuestions(rule);

  function handleStart() {
    setPhase('playing');
    setCurrentIdx(0);
    setSelected(null);
    setScore(0);
    setAnswers([]);
    onStart?.();
  }

  function handleAnswer(choiceId) {
    if (selected !== null) return; // already answered
    const q = questions[currentIdx];
    const correct = choiceId === q.answer;
    setSelected(choiceId);
    const newScore = correct ? score + 1 : score;
    if (correct) setScore(newScore);
    setAnswers(prev => [...prev, { questionId: q.id, choiceId, correct }]);

    if (currentIdx + 1 >= questions.length) {
      // Last question — move to done after a short delay
      setTimeout(() => {
        setPhase('done');
        onComplete?.(newScore, questions.length);
      }, 1400);
    }
  }

  function handleNext() {
    setCurrentIdx(i => i + 1);
    setSelected(null);
  }

  if (!questions.length) return null;

  const isLastQuestion = currentIdx === questions.length - 1;
  const q = questions[currentIdx];
  const choices = rule.choices || [];

  return (
    <div style={wrapStyle}>
      {phase === 'idle' && (
        <div style={idleWrap}>
          {quizIntro && (
            <p style={introStyle}>{quizIntro}</p>
          )}
          <button style={startBtnStyle} onClick={handleStart}>
            <AppLogo size={30} style={startLogoStyle} />
            Tester avec votre enfant
          </button>
        </div>
      )}

      {phase === 'playing' && (
        <div>
          {quizIntro && currentIdx === 0 && (
            <p style={introStyle}>{quizIntro}</p>
          )}

          {/* Progress dots */}
          <div style={dotsWrap}>
            {questions.map((_, i) => (
              <div
                key={i}
                style={{
                  ...dotStyle,
                  background: i < currentIdx
                    ? '#4ade80'
                    : i === currentIdx
                      ? '#a78bfa'
                      : 'rgba(255,255,255,0.12)',
                }}
              />
            ))}
          </div>

          {/* Question */}
          <div style={questionCard}>
            <p style={questionLabel}>Question {currentIdx + 1} / {questions.length}</p>
            <p style={questionText}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{q.before}</span>
              <span style={blankStyle}>___</span>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>{q.after}</span>
            </p>

            {/* Choice buttons */}
            <div style={choicesGrid(choices.length)}>
              {choices.map(choice => {
                const isSelected = selected === choice.id;
                const isCorrect = choice.id === q.answer;
                let bg = choiceBgDefault;
                let border = '1.5px solid rgba(255,255,255,0.1)';
                let color = 'rgba(255,255,255,0.85)';
                if (selected !== null) {
                  if (isCorrect) { bg = choiceBgCorrect; border = '1.5px solid #4ade80'; color = '#fff'; }
                  else if (isSelected && !isCorrect) { bg = choiceBgWrong; border = '1.5px solid #f87171'; color = '#fff'; }
                  else { bg = 'rgba(255,255,255,0.06)'; color = 'rgba(255,255,255,0.35)'; }
                }
                return (
                  <button
                    key={choice.id}
                    onClick={() => handleAnswer(choice.id)}
                    disabled={selected !== null}
                    style={{ ...choiceBtnStyle, background: bg, border, color }}
                  >
                    {choice.label}
                  </button>
                );
              })}
            </div>

            {/* Feedback */}
            {selected !== null && (
              <div style={{
                ...feedbackBox,
                background: selected === q.answer ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
                borderColor: selected === q.answer ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)',
              }}>
                <span style={feedbackIconWrap}>
                  {selected === q.answer ? <CheckIcon /> : <CrossIcon />}
                </span>
                <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  {q.explanation}
                </span>
              </div>
            )}

            {/* Next button (not on last question — auto-advances) */}
            {selected !== null && !isLastQuestion && (
              <button style={nextBtnStyle} onClick={handleNext}>
                Question suivante →
              </button>
            )}
          </div>
        </div>
      )}

      {phase === 'done' && (
        <DoneScreen score={score} total={questions.length} rule={rule} />
      )}
    </div>
  );
}

function DoneScreen({ score, total }) {
  const pct = score / total;
  const icon = pct === 1 ? 'star' : pct >= 0.5 ? 'check' : 'practice';
  const msg = pct === 1
    ? 'Parfait ! Votre enfant maîtrise cette règle.'
    : pct >= 0.5
      ? 'Bien ! Encore un peu de pratique et ce sera parfait.'
      : 'Cette règle mérite plus d\'entraînement.';

  return (
    <div style={doneWrap}>
      <div style={scoreCircle}>
        <ScoreIcon type={icon} />
        <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fff' }}>{score}/{total}</span>
      </div>
      <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '1rem', textAlign: 'center', margin: '0.5rem 0 0' }}>
        {msg}
      </p>
      <div style={ctaBox}>
        <p style={ctaText}>
          PrimoLingo propose <strong>200+ exercices sur cette règle</strong>, avec progression par niveaux,
          répétition espacée et récompenses pour garder votre enfant motivé.
        </p>
        <Link to="/login" style={ctaBtnStyle}>
          Essayer gratuitement
        </Link>
        <Link to="/regles" style={ctaSecondary}>
          Voir les autres règles →
        </Link>
      </div>
    </div>
  );
}

function getQuestions(rule) {
  if (!rule?.questions?.length) return [];
  const easy = rule.questions.filter(q => q.difficulty === 1);
  const pool = easy.length >= 2 ? easy : rule.questions;
  // Stable slice — same 2 questions every time for this rule
  return pool.slice(0, 2);
}

function CheckIcon() {
  return (
    <svg style={feedbackSvgStyle} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" fill="rgba(52,211,153,0.16)" stroke="#34d399" strokeWidth="2" />
      <path d="m7.2 12.3 3.1 3.1 6.6-7.1" fill="none" stroke="#d1fae5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg style={feedbackSvgStyle} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="10" fill="rgba(248,113,113,0.14)" stroke="#f87171" strokeWidth="2" />
      <path d="m8.5 8.5 7 7M15.5 8.5l-7 7" fill="none" stroke="#fee2e2" strokeWidth="2.4" strokeLinecap="round" />
    </svg>
  );
}

function ScoreIcon({ type }) {
  if (type === 'star') {
    return (
      <svg style={scoreIconStyle} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="miniQuizScoreStar" x1="13" y1="40" x2="34" y2="8" gradientUnits="userSpaceOnUse">
            <stop stopColor="#fb923c" />
            <stop offset="0.48" stopColor="#fbbf24" />
            <stop offset="1" stopColor="#fff7ad" />
          </linearGradient>
          <filter id="miniQuizScoreGlow" x="2" y="0" width="44" height="46" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
            <feDropShadow dx="0" dy="3" stdDeviation="2.4" floodColor="#fbbf24" floodOpacity="0.35" />
          </filter>
        </defs>
        <path
          filter="url(#miniQuizScoreGlow)"
          d="m24 5.7 5.4 10.9 12 1.8-8.7 8.4 2.1 12-10.8-5.7-10.8 5.7 2.1-12-8.7-8.4 12-1.8L24 5.7Z"
          fill="url(#miniQuizScoreStar)"
          stroke="#fde68a"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        <path d="M18.5 15.6 24 8.7l5.5 6.9" fill="none" stroke="#fff" strokeOpacity="0.65" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'check') {
    return (
      <svg style={scoreIconStyle} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
        <circle cx="24" cy="24" r="16" fill="rgba(52,211,153,0.14)" stroke="#34d399" strokeWidth="3" />
        <path d="m15.4 24.2 5.9 5.9 12.1-13.2" fill="none" stroke="#d1fae5" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg style={scoreIconStyle} viewBox="0 0 48 48" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="miniQuizPractice" x1="14" y1="39" x2="34" y2="9" gradientUnits="userSpaceOnUse">
          <stop stopColor="#7c3aed" />
          <stop offset="1" stopColor="#c4b5fd" />
        </linearGradient>
      </defs>
      <path d="M24 8v6M24 34v6M12.7 12.7l4.2 4.2M31.1 31.1l4.2 4.2M8 24h6M34 24h6M12.7 35.3l4.2-4.2M31.1 16.9l4.2-4.2" stroke="rgba(255,255,255,0.55)" strokeWidth="3" strokeLinecap="round" />
      <circle cx="24" cy="24" r="8.5" fill="url(#miniQuizPractice)" stroke="#ddd6fe" strokeWidth="2.5" />
    </svg>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const wrapStyle = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
  padding: '1.5rem',
  marginBottom: '2rem',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
};

const idleWrap = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
};

const introStyle = {
  color: 'rgba(255,255,255,0.5)',
  fontSize: '0.92rem',
  lineHeight: 1.65,
  margin: 0,
  textAlign: 'center',
};

const startBtnStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  color: '#fff',
  border: 'none',
  borderRadius: 999,
  padding: '0.8rem 1.8rem',
  fontSize: '1rem',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 8px 30px rgba(167,139,250,0.35)',
};

const startLogoStyle = {
  border: '1px solid rgba(255,255,255,0.28)',
  boxShadow: '0 6px 16px rgba(30,30,46,0.18)',
};

const dotsWrap = {
  display: 'flex',
  gap: '0.5rem',
  justifyContent: 'center',
  marginBottom: '1rem',
};

const dotStyle = {
  width: 10,
  height: 10,
  borderRadius: '50%',
  transition: 'background 0.3s',
};

const questionCard = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
};

const questionLabel = {
  fontSize: '0.72rem',
  fontWeight: 700,
  color: '#a78bfa',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  margin: 0,
  fontFamily: 'Outfit, sans-serif',
};

const questionText = {
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#fff',
  margin: 0,
  lineHeight: 1.7,
};

const blankStyle = {
  display: 'inline-block',
  color: '#a78bfa',
  fontWeight: 900,
  borderBottom: '2px solid #a78bfa',
  paddingBottom: 1,
  margin: '0 0.15rem',
};

const choicesGrid = (count) => ({
  display: 'grid',
  gridTemplateColumns: count <= 3 ? `repeat(${count}, 1fr)` : 'repeat(2, 1fr)',
  gap: '0.6rem',
});

const choiceBtnStyle = {
  padding: '0.75rem 0.5rem',
  borderRadius: 999,
  border: '1.5px solid rgba(255,255,255,0.1)',
  cursor: 'pointer',
  fontSize: '1.05rem',
  fontWeight: 700,
  transition: 'all 0.15s ease',
  fontFamily: 'inherit',
};

const choiceBgDefault = 'rgba(255,255,255,0.06)';
const choiceBgCorrect = 'linear-gradient(135deg, rgba(34,197,94,0.25), rgba(74,222,128,0.18))';
const choiceBgWrong = 'linear-gradient(135deg, rgba(239,68,68,0.25), rgba(248,113,113,0.18))';

const feedbackBox = {
  display: 'flex',
  gap: '0.6rem',
  alignItems: 'flex-start',
  padding: '0.8rem 1rem',
  borderRadius: 20,
  border: '1px solid',
  lineHeight: 1.5,
};

const feedbackIconWrap = {
  width: 24,
  height: 24,
  flex: '0 0 auto',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginTop: 1,
};

const feedbackSvgStyle = {
  width: 24,
  height: 24,
  display: 'block',
};

const nextBtnStyle = {
  alignSelf: 'flex-end',
  background: 'rgba(167,139,250,0.18)',
  border: '1px solid rgba(167,139,250,0.3)',
  borderRadius: 999,
  padding: '0.55rem 1.1rem',
  color: '#a78bfa',
  fontWeight: 700,
  fontSize: '0.9rem',
  cursor: 'pointer',
  fontFamily: 'inherit',
};

const doneWrap = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '1rem',
};

const scoreCircle = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: 100,
  height: 100,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, rgba(124,58,237,0.32), rgba(167,139,250,0.18))',
  border: '2px solid rgba(167,139,250,0.35)',
};

const scoreIconStyle = {
  width: 42,
  height: 42,
  display: 'block',
};

const ctaBox = {
  width: '100%',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
  padding: '1.2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.8rem',
  marginTop: '0.5rem',
};

const ctaText = {
  color: 'rgba(255,255,255,0.85)',
  fontSize: '0.9rem',
  lineHeight: 1.6,
  textAlign: 'center',
  margin: 0,
};

const ctaBtnStyle = {
  display: 'inline-block',
  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  color: '#fff',
  textDecoration: 'none',
  borderRadius: 999,
  padding: '0.75rem 2rem',
  fontSize: '1rem',
  fontWeight: 800,
  boxShadow: '0 8px 30px rgba(167,139,250,0.35)',
};

const ctaSecondary = {
  color: 'rgba(255,255,255,0.5)',
  fontSize: '0.85rem',
  textDecoration: 'none',
};

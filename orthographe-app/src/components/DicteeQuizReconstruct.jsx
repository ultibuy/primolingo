import { useState, useEffect, useMemo, useCallback } from 'react';
import ProgressBar from './ProgressBar.jsx';
import EndScreen from './EndScreen.jsx';
import PopupCloseButton from './PopupCloseButton.jsx';
import PlayWordButton from './PlayWordButton.jsx';
import { FlagBugButton } from './FlagBugButton.jsx';
import { quizPageStyle, quizCardStyle, quizNextBtnStyle } from './quizStyles.js';
import { getEndScreenLevelProgress, getNextStreakTierInfo, computeStreakMilestone } from '../engine/scoring.js';

// ── Letter pool computation ──────────────────────────────────────────────────
/**
 * Computes the sorted, deduplicated letter pool for a word.
 * Base: all unique letters from guidedChoices.
 * + confusion rules applied on top.
 */
function computeLetterPool(word) {
  const allText = (word.guidedChoices || []).join('').toLowerCase();
  const target = word.word.toLowerCase();
  const letters = new Set();

  // 1. All letters from all choices (no spaces)
  for (const ch of allText) {
    if (ch !== ' ') letters.add(ch);
  }

  // 2. Confusion rules

  // "ss" or "ç" → add s + ç
  if (allText.includes('ss') || allText.includes('ç')) {
    letters.add('s'); letters.add('ç');
  }

  // contains g → always add u
  if (letters.has('g')) letters.add('u');

  // soft g (ge, gi, gé, gê, gy) → add j
  if (/g[eiéêy]/.test(allText)) letters.add('j');

  // word ends with silent-letter-prone endings → add s, t
  if (/[uy]$|eau$|au$|ou$|eux$|oux$|ue$|us$|ut$|ie$|is$|it$/.test(target)) {
    letters.add('s'); letters.add('t');
  }

  // "en/an" nasal sound (en, an, em, am) → add a, e
  if (/[ae][nm]/.test(allText)) {
    letters.add('a'); letters.add('e');
  }

  // "in" nasal sound (in, im, ain, ein, ien) → add a, i, n, e
  if (/in|im|ain|ein|ien/.test(allText)) {
    letters.add('a'); letters.add('i'); letters.add('n'); letters.add('e');
  }

  // space if word contains spaces
  if (word.word.includes(' ')) letters.add(' ');

  // Sort alphabetically (space first if present)
  return [...letters].sort((a, b) => {
    if (a === ' ') return -1;
    if (b === ' ') return 1;
    return a.localeCompare(b, 'fr');
  });
}

// ── Single letter chip in the build zone ────────────────────────────────────
function PoolLetter({ letter, onClick }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onClick={() => { setPressed(true); onClick(); setTimeout(() => setPressed(false), 150); }}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setTimeout(() => setPressed(false), 150)}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setTimeout(() => setPressed(false), 150)}
      style={{
        ...chipStyle,
        minWidth: letter === ' ' ? 52 : 38,
        fontFamily: 'monospace',
        background: pressed ? 'rgba(var(--color-primary-rgb),0.35)' : 'rgba(255,255,255,0.08)',
        borderColor: pressed ? 'var(--color-primary)' : 'rgba(255,255,255,0.18)',
        transform: pressed ? 'scale(0.92)' : 'scale(1)',
        transition: 'background 0.12s ease, border-color 0.12s ease, transform 0.1s ease',
      }}
    >
      {letter === ' ' ? '␣' : letter}
    </button>
  );
}

function LetterChip({ char, onRemove, disabled }) {
  const [hovered, setHovered] = useState(false);
  const isSpace = char === ' ';
  return (
    <span
      onClick={disabled ? undefined : onRemove}
      onMouseEnter={() => !disabled && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: isSpace ? '0 6px 6px' : '0 1px 6px',
        borderBottom: `2px solid ${hovered ? 'rgba(248,113,113,0.6)' : 'rgba(196,181,253,0.55)'}`,
        marginRight: isSpace ? 4 : 1,
        cursor: disabled ? 'default' : 'pointer',
        color: hovered ? '#f87171' : '#e2e2e2',
        transition: 'color 120ms ease, border-bottom-color 120ms ease',
        fontFamily: 'monospace',
        minWidth: isSpace ? 12 : undefined,
        display: 'inline-block',
      }}
    >
      {isSpace ? '\u00A0' : char}
    </span>
  );
}

// ── Mini audio button for wrong-answer feedback ──────────────────────────────
function MiniAudioButton({ word, audioUrl }) {
  const speak = () => {
    if (audioUrl) {
      const a = new Audio(audioUrl);
      a.play().catch(fallback);
    } else {
      fallback();
    }
  };
  const fallback = () => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = 'fr-FR'; u.rate = 0.85;
    window.speechSynthesis.speak(u);
  };
  return (
    <button type="button" onClick={speak} style={miniAudioStyle} aria-label={`Réécouter ${word}`}>
      <span style={miniAudioDotStyle}>
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#1e1e2e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        </svg>
      </span>
      écouter
    </button>
  );
}

// ── Wrong-answer feedback panel ──────────────────────────────────────────────
function WrongFeedback({ word, attemptString, dicteeId }) {
  return (
    <div style={{ animation: 'fadeIn 0.3s ease', marginBottom: '1rem' }}>
      {/* Attempt — crossed out */}
      {attemptString && (
        <div style={attemptRowStyle}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {word.displayPrefix && (
              <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{word.displayPrefix}</span>
            )}
            <span style={tokAttemptStrikeStyle}>{attemptString}</span>
          </div>
          <span style={{ color: '#f87171', fontSize: 16, opacity: 0.7 }}>✗</span>
        </div>
      )}

      {/* Correct card */}
      <div style={correctCardStyle}>
        <div style={correctLabelStyle}>LE BON MOT</div>
        <div style={{ marginBottom: 14 }}>
          {word.displayPrefix && (
            <span style={{ color: '#6b7280', fontSize: '0.9rem', marginRight: 6 }}>{word.displayPrefix}</span>
          )}
          <span style={{ ...tokCorrectStyle }}>{word.word}</span>
        </div>
        {word.example && (
          <div style={exampleStyle}>
            <CorrectExample word={word} dicteeId={dicteeId} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Example sentence with highlighted word + audio (reused in both panels) ──
function CorrectExample({ word, dicteeId }) {
  const idx = word.example ? word.example.indexOf(word.word) : -1;
  if (!word.example) return null;
  if (idx === -1) return <span>{word.example}</span>;
  return (
    <>
      {word.example.slice(0, idx)}
      <span style={wordHighlightStyle}>{word.word}</span>
      {word.example.slice(idx + word.word.length)}{' '}
      <MiniAudioButton
        word={word.word}
        audioUrl={word.audioFile ? `/audio/dictees/${dicteeId}/${word.audioFile}` : undefined}
      />
    </>
  );
}

/**
 * DicteeQuizReconstruct — Letter-by-letter reconstruction mode.
 *
 * The letter pool is computed from guidedChoices + confusion rules,
 * sorted alphabetically, always enabled (letters never disabled).
 * The user clicks letters to build the word, clicks placed letters to remove.
 */
export default function DicteeQuizReconstruct({
  dictee,
  words,
  onFinish,
  onClose,
  characterId,
  hasDoubleCoinsActive,
  isFirstSessionOfDay,
  isFirstEverSession = false,
  ruleProgress,
  streak,
  milestones,
  victoryAnimationId,
  shopOwned = [],
  onBuyEmotion = null,
  coins = 0,
  onFlagQuestion,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [builtChars, setBuiltChars] = useState([]);   // array of chars
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);
  const [showResult, setShowResult] = useState(null); // 'correct' | 'wrong' | null
  const [wrongCount, setWrongCount] = useState(0);
  const [shakeKey, setShakeKey] = useState(0);
  const [wrongAttemptString, setWrongAttemptString] = useState('');

  const word = words[currentIndex];

  const letterPool = useMemo(
    () => (word ? computeLetterPool(word) : []),
    [currentIndex], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    setBuiltChars([]);
    setShowResult(null);
    setWrongCount(0);
    setWrongAttemptString('');
  }, [currentIndex]);

  const assembledString = builtChars.join('');

  const handleLetterClick = useCallback((letter) => {
    if (showResult) return;
    setBuiltChars(prev => [...prev, letter]);
  }, [showResult]);

  const handleRemoveChar = useCallback((idx) => {
    if (showResult) return;
    setBuiltChars(prev => prev.filter((_, i) => i !== idx));
  }, [showResult]);

  const handleClear = useCallback(() => {
    if (showResult) return;
    setBuiltChars([]);
    setWrongCount(0);
  }, [showResult]);

  const handleValidate = useCallback(() => {
    if (showResult) return;
    if (builtChars.length === 0) return;

    const isCorrect = assembledString.toLowerCase() === word.word.toLowerCase();

    if (isCorrect) {
      setShowResult('correct');
      setScore(s => s + 1);
      setAnswers(prev => [...prev, { wordId: word.id, correct: true, attempts: wrongCount + 1, typed: assembledString }]);
    } else {
      setWrongCount(w => w + 1);
      setWrongAttemptString(assembledString);
      setShowResult('wrong');
      setShakeKey(k => k + 1);
      setAnswers(prev => [...prev, { wordId: word.id, correct: false, attempts: wrongCount + 1, typed: assembledString }]);
    }
  }, [showResult, builtChars, assembledString, word, wrongCount, currentIndex, words.length]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= words.length) setFinished(true);
    else setCurrentIndex(i => i + 1);
  }, [currentIndex, words.length]);

  // --- EndScreen ---
  if (finished) {
    const pseudoRule = { id: dictee.id, title: dictee.title, choices: [] };
    const pseudoQuestions = words.map((w, i) => {
      const a = answers[i];
      const typed = a?.typed || '';
      return {
        id: w.id,
        before: (w.displayPrefix || '') ,
        after: '',
        answer: 'correct',
        _ruleChoices: [
          { id: 'correct', label: w.word },
          { id: 'typed', label: typed },
        ],
      };
    });
    const pseudoAnswers = answers.map(a => ({
      questionId: a.wordId,
      chosen: a.correct ? 'correct' : 'typed',
      correct: a.correct,
      _ruleId: dictee.id,
    }));
    const levelProgress = getEndScreenLevelProgress(ruleProgress, 'reconstruct', score, words.length);
    const streakInfo = getNextStreakTierInfo(streak, isFirstSessionOfDay);
    const sessionPct = Math.round((score / words.length) * 100);
    const streakMilestone = computeStreakMilestone(streak, milestones, isFirstSessionOfDay, sessionPct);

    return (
      <EndScreen
        rule={pseudoRule}
        questions={pseudoQuestions}
        answers={pseudoAnswers}
        score={score}
        hasDoubleCoinsActive={hasDoubleCoinsActive}
        isFirstSessionOfDay={isFirstSessionOfDay}
        levelProgress={levelProgress}
        streakInfo={streakInfo}
        streakMilestoneJustEarned={streakMilestone}
        victoryAnimationId={victoryAnimationId}
        characterId={characterId}
        shopOwned={shopOwned}
        isFirstEverSession={isFirstEverSession}
        onBuyEmotion={onBuyEmotion}
        coins={coins}
        onFinish={() => onFinish(score, words.length, answers)}
      />
    );
  }

  if (!word) return null;

  return (
    <div style={quizPageStyle}>
      <div style={quizCardStyle}>
        <PopupCloseButton onClick={onClose} />

        <div style={{ marginBottom: '0.3rem' }}>
          <h1 style={{
            fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-accent)',
            letterSpacing: '-0.02em', margin: 0,
            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {dictee.title}
          </h1>
        </div>

        <ProgressBar
          current={currentIndex}
          total={words.length}
          showResult={showResult === 'correct'}
          shopOwned={shopOwned}
          characterId={characterId}
          lastAnswer={showResult}
          score={score}
          isFirstEverSession={isFirstEverSession}
          onBuyEmotion={onBuyEmotion}
          coins={coins}
        />

        {/* Sentence with audio button replacing the word */}
        {(() => {
          const sentence = word.example || '';
          const audioUrl = word.audioFile ? `/audio/dictees/${dictee.id}/${word.audioFile}` : undefined;
          if (!sentence) {
            return <PlayWordButton key={currentIndex} word={word.word} audioUrl={audioUrl} />;
          }
          const escaped = word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const parts = sentence.split(new RegExp(`(${escaped})`, 'i'));
          return (
            <div style={{ ...sentenceContextStyle, position: 'relative' }}>
              {parts.map((part, i) =>
                new RegExp(`^${escaped}$`, 'i').test(part)
                  ? <PlayWordButton key={`audio-${currentIndex}`} word={word.word} audioUrl={audioUrl} inline />
                  : <span key={i}>{part}</span>
              )}
              {onFlagQuestion && (
                <FlagBugButton key={word.word} onFlag={(unflag) => onFlagQuestion(
                  { id: word.word, word: word.word, example: word.example },
                  { id: `${dictee.id}`, title: dictee.title },
                  unflag,
                )} />
              )}
            </div>
          );
        })()}

        <div style={promptStyle}>Écris le mot :</div>

        {/* Build zone — large continuous word */}
        <div
          key={`build-${shakeKey}`}
          style={{
            ...writeZoneStyle,
            borderColor: showResult === 'correct'
              ? 'rgba(74,222,128,0.35)'
              : showResult === 'wrong'
                ? 'rgba(248,113,113,0.25)'
                : 'transparent',
            animation: showResult === 'wrong' ? 'shake 0.4s ease' : undefined,
          }}
        >
          {word.displayPrefix && (
            <span style={prefixStyle}>{word.displayPrefix}</span>
          )}
          <span style={wordContainerStyle}>
            {builtChars.map((ch, i) => (
              <LetterChip
                key={i}
                char={ch}
                onRemove={() => handleRemoveChar(i)}
                disabled={!!showResult}
              />
            ))}
            {!showResult && builtChars.length === 0 && (
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.18)', fontWeight: 400 }}>
                clique sur les lettres…
              </span>
            )}
          </span>
        </div>

        {/* Letter pool */}
        {!showResult && (
          <div style={poolContainerStyle}>
            {letterPool.map((letter, idx) => (
              <PoolLetter key={idx} letter={letter} onClick={() => handleLetterClick(letter)} />
            ))}
          </div>
        )}

        {/* Action buttons */}
        {!showResult && (
          <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem' }}>
            <button
              onClick={handleClear}
              disabled={builtChars.length === 0}
              style={{ ...clearBtnStyle, opacity: builtChars.length === 0 ? 0.35 : 1 }}
            >
              Effacer tout
            </button>
            <button
              onClick={handleValidate}
              disabled={builtChars.length === 0}
              style={{ ...validateBtnStyle, opacity: builtChars.length === 0 ? 0.35 : 1 }}
            >
              Valider
            </button>
          </div>
        )}

        {/* Correct feedback */}
        {showResult === 'correct' && (
          <div style={{ animation: 'fadeIn 0.3s ease', marginBottom: '1rem' }}>
            <div style={correctCardStyle}>
              <div style={correctLabelStyle}>BRAVO !</div>
              <div style={{ marginBottom: word.example ? 14 : 0 }}>
                {word.displayPrefix && (
                  <span style={{ color: '#6b7280', fontSize: '0.9rem', marginRight: 6 }}>{word.displayPrefix}</span>
                )}
                <span style={tokCorrectStyle}>{word.word}</span>
              </div>
              {word.example && (
                <div style={exampleStyle}>
                  <CorrectExample word={word} dicteeId={dictee.id} />
                </div>
              )}
            </div>
          </div>
        )}

        {showResult === 'correct' && (
          <button onClick={handleNext} style={quizNextBtnStyle}>
            {currentIndex + 1 >= words.length ? 'Voir le résultat final' : 'Mot suivant →'}
          </button>
        )}

        {/* Wrong feedback */}
        {showResult === 'wrong' && (
          <WrongFeedback
            word={word}
            attemptString={wrongAttemptString}
            dicteeId={dictee.id}
          />
        )}

        {showResult === 'wrong' && (
          <button onClick={handleNext} style={quizNextBtnStyle}>
            {currentIndex + 1 >= words.length ? 'Voir le résultat final' : 'Mot suivant →'}
          </button>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

/* ─── LOCAL STYLES ─── */

const sentenceContextStyle = {
  background: 'rgba(0,0,0,0.25)', borderRadius: 12,
  padding: '0.9rem 1.2rem', marginBottom: '0.75rem',
  fontSize: '1rem', lineHeight: 2,
  display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
  gap: '0.15rem', color: '#d1d5db',
  border: '1px solid rgba(255,255,255,0.05)',
};

const promptStyle = {
  color: '#9ca3af', fontSize: 13,
  textAlign: 'center', margin: '0 0 12px',
};

const writeZoneStyle = {
  background: 'rgba(0,0,0,0.32)',
  borderRadius: 14,
  padding: '22px 18px',
  minHeight: 70,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 10,
  marginBottom: 16,
  border: '1px solid transparent',
  transition: 'border-color 0.3s ease',
};

const prefixStyle = {
  color: '#6b7280', fontSize: 18, fontWeight: 500, flexShrink: 0,
};

const wordContainerStyle = {
  fontSize: 28, fontWeight: 600, color: '#e2e2e2',
  letterSpacing: '0.01em', lineHeight: 1,
  display: 'inline-flex', alignItems: 'flex-end',
  fontFamily: 'monospace',
};

const poolContainerStyle = {
  display: 'flex', flexWrap: 'wrap', gap: 6,
  justifyContent: 'center',
  margin: '0 0 1.2rem',
  minHeight: 44,
};

const chipStyle = {
  padding: '9px 0',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.08)',
  border: '1px solid rgba(255,255,255,0.18)',
  color: '#e2e2e2',
  fontSize: 15, fontWeight: 600,
  cursor: 'pointer',
  transition: 'background 0.12s ease',
  textAlign: 'center',
};

const validateBtnStyle = {
  flex: 1, padding: '0.8rem', borderRadius: 10,
  border: '2px solid var(--color-primary)',
  background: 'rgba(var(--color-primary-rgb),0.15)',
  color: 'var(--color-accent)', cursor: 'pointer',
  fontSize: '0.95rem', fontWeight: 700,
};

const clearBtnStyle = {
  padding: '0.8rem 1rem', borderRadius: 10,
  border: '1px solid rgba(255,255,255,0.12)',
  background: 'rgba(255,255,255,0.04)',
  color: '#9ca3af', cursor: 'pointer',
  fontSize: '0.85rem', fontWeight: 600,
};

// Wrong-feedback styles
const attemptRowStyle = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '10px 12px',
  background: 'rgba(255,255,255,0.03)',
  borderRadius: 10, marginBottom: 12,
};

const tokAttemptStrikeStyle = {
  padding: '6px 12px', borderRadius: 10,
  fontSize: 15, fontWeight: 600, fontFamily: 'monospace',
  background: 'rgba(255,255,255,0.04)',
  color: '#6b7280',
  border: '1px dashed rgba(255,255,255,0.12)',
  textDecoration: 'line-through',
  textDecorationColor: 'rgba(248,113,113,0.6)',
};

const correctCardStyle = {
  background: 'rgba(74,222,128,0.06)',
  border: '1px solid rgba(74,222,128,0.2)',
  borderRadius: 14, padding: '16px 18px',
};

const correctLabelStyle = {
  color: '#86efac', fontSize: 12, fontWeight: 600,
  marginBottom: 10, letterSpacing: '0.04em',
};

const tokCorrectStyle = {
  padding: '6px 14px', borderRadius: 10,
  fontSize: 16, fontWeight: 700, fontFamily: 'monospace',
  background: 'rgba(74,222,128,0.14)',
  color: '#86efac',
  border: '1px solid rgba(74,222,128,0.45)',
  display: 'inline-block',
};

const exampleStyle = {
  color: '#d1d5db', fontSize: 13, lineHeight: 1.6,
  paddingTop: 10,
  borderTop: '1px dashed rgba(74,222,128,0.18)',
};

const wordHighlightStyle = {
  color: '#c4b5fd', fontWeight: 700,
  borderBottom: '2px solid rgba(196,181,253,0.5)',
  padding: '0 1px',
};

const miniAudioStyle = {
  display: 'inline-flex', verticalAlign: 'middle',
  alignItems: 'center', gap: 5,
  background: 'rgba(167,139,250,0.16)',
  border: '1px solid rgba(167,139,250,0.3)',
  color: '#c4b5fd', padding: '2px 8px 2px 4px',
  borderRadius: 999, fontSize: 11, fontWeight: 600,
  cursor: 'pointer', marginLeft: 4,
};

const miniAudioDotStyle = {
  width: 16, height: 16, borderRadius: '50%',
  background: '#c4b5fd',
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
};

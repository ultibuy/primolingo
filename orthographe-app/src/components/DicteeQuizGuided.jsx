import { useState, useMemo } from 'react';
import ProgressBar from './ProgressBar.jsx';
import EndScreen from './EndScreen.jsx';
import PopupCloseButton from './PopupCloseButton.jsx';
import PlayWordButton from './PlayWordButton.jsx';
import { FlagBugButton } from './FlagBugButton.jsx';
import { quizPageStyle, quizCardStyle, quizNextBtnStyle } from './quizStyles.js';
import { getEndScreenLevelProgress, getNextStreakTierInfo, computeStreakMilestone } from '../engine/scoring.js';

/**
 * DicteeQuizGuided — Guided-mode quiz for the dictée vocabulary module.
 *
 * Shows a word pronunciation (audio button) and 3 spelling choices.
 * The user picks the correct spelling among shuffled options.
 */
export default function DicteeQuizGuided({
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
  shopOwned = [],
  onBuyEmotion = null,
  coins = 0,
  onFlagQuestion,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);

  // Track which question index triggered autoplay (to re-trigger on question change)
  const [autoPlayKey, setAutoPlayKey] = useState(0);

  const word = words[currentIndex];

  // Shuffle guidedChoices once per question, tracking correct index
  const shuffled = useMemo(() => {
    if (!word) return { choices: [], correctIndex: 0 };
    const choices = word.guidedChoices.map((text, i) => ({ text, originalIndex: i }));
    // Fisher-Yates shuffle
    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // eslint-disable-line react-hooks/purity
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }
    const correctIndex = choices.findIndex(c => c.originalIndex === word.answerIndex);
    return { choices, correctIndex };
  }, [currentIndex, word]); // eslint-disable-line react-hooks/exhaustive-deps

  const isCorrect = selected !== null && selected === shuffled.correctIndex;

  const handleSelect = (idx) => {
    if (showResult) return;
    const correct = idx === shuffled.correctIndex;
    setSelected(idx);
    setShowResult(true);
    if (correct) setScore(s => s + 1);
    setAnswers(prev => [
      ...prev,
      {
        wordId: word.id,
        chosen: shuffled.choices[idx].text,
        correct,
      },
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= words.length) {
      setFinished(true);
    } else {
      setCurrentIndex(i => i + 1);
      setSelected(null);
      setShowResult(false);
      setAutoPlayKey(k => k + 1);
    }
  };

  if (finished) {
    const levelProgress = getEndScreenLevelProgress(ruleProgress, 'guided', score, words.length);
    const streakInfo = getNextStreakTierInfo(streak, isFirstSessionOfDay);
    const sessionPct = Math.round((score / words.length) * 100);
    const streakMilestone = computeStreakMilestone(streak, milestones, isFirstSessionOfDay, sessionPct);

    // Build questions/answers in the format EndScreen expects
    const endQuestions = words.map((w, _i) => ({
      id: w.id,
      before: w.displayPrefix ? w.displayPrefix + ' ' : '',
      after: '',
      answer: w.answerIndex,
      _ruleChoices: w.guidedChoices.map((text, ci) => ({ id: ci, label: text })),
    }));
    const endAnswers = answers.map((a, i) => ({
      questionId: words[i]?.id,
      chosen: words[i]?.guidedChoices.findIndex(c => c === a.chosen) ?? 0,
      correct: a.correct,
      _ruleId: dictee.id,
    }));

    return (
      <EndScreen
        rule={dictee}
        questions={endQuestions}
        answers={endAnswers}
        score={score}
        hasDoubleCoinsActive={hasDoubleCoinsActive}
        isFirstSessionOfDay={isFirstSessionOfDay}
        levelProgress={levelProgress}
        streakInfo={streakInfo}
        streakMilestoneJustEarned={streakMilestone}
        characterId={characterId}
        shopOwned={shopOwned}
        isFirstEverSession={isFirstEverSession}
        onBuyEmotion={onBuyEmotion}
        coins={coins}
        onFinish={() => onFinish(score, words.length, answers)}
      />
    );
  }

  return (
    <div style={quizPageStyle}>
      <div style={quizCardStyle}>
        <PopupCloseButton onClick={onClose} />

        {/* Header */}
        <div style={{ marginBottom: '0.3rem' }}>
          <h1 style={{
            fontSize: '1.15rem', fontWeight: 700,
            color: 'var(--color-accent)', letterSpacing: '-0.02em',
            margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          }}>
            {dictee.title}
          </h1>
        </div>

        <ProgressBar
          current={currentIndex}
          total={words.length}
          showResult={showResult}
          shopOwned={shopOwned}
          characterId={characterId}
          lastAnswer={showResult ? (isCorrect ? 'correct' : 'wrong') : null}
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
            return (
              <PlayWordButton key={autoPlayKey} word={word.word} audioUrl={audioUrl} />
            );
          }
          // Split sentence around the target word (case-insensitive)
          const escaped = word.word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          const parts = sentence.split(new RegExp(`(${escaped})`, 'i'));
          return (
            <div style={{ ...sentenceStyle, position: 'relative' }}>
              {parts.map((part, i) =>
                new RegExp(`^${escaped}$`, 'i').test(part)
                  ? <PlayWordButton key={`audio-${autoPlayKey}`} word={word.word} audioUrl={audioUrl} inline />
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

        {/* Answer buttons (3 choices) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '0.7rem',
          marginBottom: '1.5rem',
        }}>
          {shuffled.choices.map((choice, idx) => {
            const isSelected = selected === idx;
            const isAnswer = idx === shuffled.correctIndex;

            let bg = 'rgba(255,255,255,0.06)';
            let borderColor = 'rgba(255,255,255,0.15)';
            let textColor = '#e2e2e2';
            let opacity = 1;

            if (showResult) {
              if (isSelected && isCorrect) {
                bg = 'rgba(74,222,128,0.2)'; borderColor = '#4ade80'; textColor = '#4ade80';
              } else if (isSelected && !isCorrect) {
                bg = 'rgba(248,113,113,0.2)'; borderColor = '#f87171'; textColor = '#f87171';
              } else if (isAnswer) {
                bg = 'rgba(74,222,128,0.1)'; borderColor = '#4ade80'; textColor = '#4ade80';
              } else {
                opacity = 0.25;
              }
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showResult}
                style={{
                  padding: '1rem',
                  borderRadius: 12,
                  border: `2px solid ${borderColor}`,
                  background: bg,
                  color: textColor,
                  cursor: showResult ? 'default' : 'pointer',
                  fontSize: '1.15rem',
                  fontWeight: 700,
                  opacity,
                  transition: 'all 0.25s ease',
                  textAlign: 'center',
                }}
              >
                {word.displayPrefix && (
                  <span style={{ color: '#9ca3af', fontWeight: 500 }}>
                    {word.displayPrefix}{' '}
                  </span>
                )}
                {choice.text}
              </button>
            );
          })}
        </div>

        {/* Result feedback */}
        {showResult && (
          <div style={{
            background: isCorrect ? 'rgba(74,222,128,0.08)' : 'rgba(248,113,113,0.08)',
            border: `1px solid ${isCorrect ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
            borderRadius: 12, padding: '1.1rem', marginBottom: '1rem',
          }}>
            <div style={{
              fontWeight: 700, fontSize: '1rem',
              color: isCorrect ? '#4ade80' : '#f87171', marginBottom: '0.4rem',
            }}>
              {isCorrect ? 'Bravo !' : 'Raté !'}
            </div>
            {word.example && (
              <div style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#d1d5db', fontStyle: 'italic' }}>
                {word.example}
              </div>
            )}
          </div>
        )}

        {showResult && (
          <button onClick={handleNext} style={quizNextBtnStyle}>
            {currentIndex + 1 >= words.length ? 'Voir le résultat final' : 'Question suivante →'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── LOCAL STYLES ─── */

const sentenceStyle = {
  background: 'rgba(0,0,0,0.3)', borderRadius: 12,
  padding: '1.1rem 1.4rem', fontSize: '1.1rem',
  textAlign: 'center', marginBottom: '1.5rem',
  lineHeight: 2, border: '1px solid rgba(255,255,255,0.05)',
  display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center',
  gap: '0.15rem',
};


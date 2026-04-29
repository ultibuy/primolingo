import { useState } from 'react';
import ProgressBar from './ProgressBar.jsx';
import EndScreen from './EndScreen.jsx';
import PopupCloseButton from './PopupCloseButton.jsx';
import { FlagBugButton } from './FlagBugButton.jsx';
import { quizPageStyle, quizCardStyle, quizNextBtnStyle } from './quizStyles.js';
import { getEndScreenLevelProgress, getNextStreakTierInfo, computeStreakMilestone } from '../engine/scoring.js';

export default function QuizDirect({
  rule,
  questions,
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
  coachingLine = null,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);

  const question = questions[currentIndex];
  const choices = question?._ruleChoices || rule.choices || [];
  const hasVerb = question?.verb !== undefined;
  const isCorrect = selected === question?.answer;

  const handleSelect = (id) => {
    if (showResult) return;
    const correct = id === question.answer;
    setSelected(id);
    setShowResult(true);
    if (correct) setScore(s => s + 1);
    setAnswers(prev => [
      ...prev,
      { questionId: question.id, chosen: id, correct, _ruleId: question._ruleId || rule.id },
    ]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex(i => i + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  if (finished) {
    const levelProgress = getEndScreenLevelProgress(ruleProgress, 'direct', score, questions.length);
    const streakInfo = getNextStreakTierInfo(streak, isFirstSessionOfDay);
    const sessionPct = Math.round((score / questions.length) * 100);
    const streakMilestone = computeStreakMilestone(streak, milestones, isFirstSessionOfDay, sessionPct);
    return (
      <EndScreen
        rule={rule}
        questions={questions}
        answers={answers}
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
        coachingLine={coachingLine}
        onFinish={() => onFinish(score, questions.length, answers)}
      />
    );
  }

  return (
    <div style={quizPageStyle}>
      <div style={quizCardStyle}>
        <PopupCloseButton onClick={onClose} />

        {/* Header */}
        <div style={{ marginBottom: '0.3rem' }}>
          <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-accent)', letterSpacing: '-0.02em', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {rule.title}
          </h1>
        </div>

        <ProgressBar
          current={currentIndex}
          total={questions.length}
          showResult={showResult}
          shopOwned={shopOwned}
          characterId={characterId}
          lastAnswer={showResult ? (isCorrect ? 'correct' : 'wrong') : null}
          score={score}
          isFirstEverSession={isFirstEverSession}
          onBuyEmotion={onBuyEmotion}
          coins={coins}
        />

        {/* Sentence */}
        <div style={{ ...sentenceStyle, position: 'relative' }}>
          {question.before}
          {hasVerb
            ? <><span style={{ whiteSpace: 'nowrap' }}>
                <span style={{ color: '#e2e2e2', fontWeight: 600 }}>{question.verb}</span>
                <span style={{
                  display: 'inline-block', minWidth: 45,
                  borderBottom: '2px dashed var(--color-accent)',
                  color: showResult ? (isCorrect ? '#4ade80' : '#f87171') : 'var(--color-accent)',
                  fontWeight: 700, padding: '0 4px',
                }}>
                  {selected ? choices.find(c => c.id === selected)?.label.replace('-', '') : '___'}
                </span>
              </span>{question.after}</>
            : <><span style={{
                  display: 'inline-block', minWidth: 80,
                  borderBottom: '2px dashed var(--color-accent)',
                  color: showResult ? (isCorrect ? '#4ade80' : '#f87171') : 'var(--color-accent)',
                  fontWeight: 700, padding: '0 4px',
                }}>
                  {selected ? choices.find(c => c.id === selected)?.label : '______'}
                </span>{question.after}</>}
          {onFlagQuestion && <FlagBugButton onFlag={(unflag) => onFlagQuestion(question, rule, unflag)} />}
        </div>

        {/* Answer buttons */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: choices.length <= 4 ? '1fr 1fr' : `repeat(${choices.length}, 1fr)`,
          gap: choices.length <= 4 ? '0.7rem' : '0.5rem',
          marginBottom: '1.5rem',
        }}>
          {choices.map(choice => {
            const isSelected = selected === choice.id;
            const isAnswer = choice.id === question.answer;

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
              <button key={choice.id}
                onClick={() => handleSelect(choice.id)}
                disabled={showResult}
                style={{
                  padding: choices.length <= 4 ? '1rem' : '0.9rem 0.3rem',
                  borderRadius: 12,
                  border: `2px solid ${borderColor}`, background: bg,
                  color: textColor,
                  cursor: showResult ? 'default' : 'pointer',
                  fontSize: choices.length <= 4 ? '1.15rem' : '1.1rem',
                  fontWeight: 700, opacity,
                  transition: 'all 0.25s ease',
                }}
              >
                {choice.label}
              </button>
            );
          })}
        </div>

        {/* Result */}
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
            <div style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#d1d5db' }}>
              {question.explanation}
            </div>
          </div>
        )}

        {showResult && (
          <button onClick={handleNext} style={quizNextBtnStyle}>
            {currentIndex + 1 >= questions.length ? 'Voir le résultat final' : 'Question suivante →'}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── LOCAL STYLES ─── */

const sentenceStyle = {
  background: 'rgba(0,0,0,0.3)', borderRadius: 12,
  padding: '1.3rem 1.5rem', fontSize: '1.2rem',
  textAlign: 'center', marginBottom: '2rem',
  lineHeight: 1.7, border: '1px solid rgba(255,255,255,0.05)',
};

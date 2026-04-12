import { useState } from 'react';
import ProgressBar from './ProgressBar.jsx';
import EndScreen from './EndScreen.jsx';
import { getEndScreenLevelProgress, getNextStreakTierInfo } from '../engine/scoring.js';

function getEliminated(rule, axisSelections) {
  const eliminated = new Set();
  for (const axis of rule.decisionAxes) {
    const sel = axisSelections[axis.id];
    if (sel !== undefined && sel !== null) {
      const opt = axis.options.find(o => {
        if (typeof o.value === 'boolean') return o.value === sel;
        return o.value === sel;
      });
      if (opt) {
        opt.eliminates.forEach(id => eliminated.add(id));
      }
    }
  }
  return eliminated;
}

const CIRCLED_NUMBERS = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];

export default function QuizGuided({
  rule,
  questions,
  onFinish,
  isFirstSessionOfDay,
  ruleProgress,
  streak,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [axisSelections, setAxisSelections] = useState({});
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [finished, setFinished] = useState(false);

  const question = questions[currentIndex];
  const choices = question?._ruleChoices || rule.choices || [];
  const guidedRule = {
    ...rule,
    choices,
    decisionAxes: question?._ruleDecisionAxes || rule.decisionAxes || [],
  };
  const hasVerb = question?.verb !== undefined;
  const eliminated = getEliminated(guidedRule, axisSelections);
  const remaining = choices.filter(c => !eliminated.has(c.id));
  const onlyOneLeft = remaining.length === 1;
  const isCorrect = selected === question?.answer;

  const resetFilters = () => {
    setAxisSelections({});
    setSelected(null);
    setShowResult(false);
  };

  const handleSelect = (id) => {
    if (showResult || eliminated.has(id)) return;
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
      resetFilters();
    }
  };

  if (finished) {
    const levelProgress = getEndScreenLevelProgress(ruleProgress, 'guided', score, questions.length);
    const streakInfo = getNextStreakTierInfo(streak, isFirstSessionOfDay);
    return (
      <EndScreen
        rule={rule}
        questions={questions}
        answers={answers}
        score={score}
        isFirstSessionOfDay={isFirstSessionOfDay}
        levelProgress={levelProgress}
        streakInfo={streakInfo}
        onFinish={() => onFinish(score, questions.length, answers)}
      />
    );
  }

  return (
    <div style={pageStyle}>
      <div style={cardStyle}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--color-accent)', letterSpacing: '-0.02em', margin: 0 }}>
            {rule.title}
          </h1>
          <span style={{ fontSize: '0.85rem', color: '#9ca3af', fontWeight: 600 }}>
            {currentIndex + 1}/{questions.length}
          </span>
        </div>

        <ProgressBar current={currentIndex} total={questions.length} showResult={showResult} />

        <p style={{ textAlign: 'right', fontSize: '0.78rem', color: '#6b7280', marginBottom: '1.2rem' }}>
          Score : {score}/{currentIndex + (showResult ? 1 : 0)}
        </p>

        {/* Sentence */}
        <div style={sentenceStyle}>
          {question.before}
          {hasVerb && <span style={{ color: '#e2e2e2', fontWeight: 600 }}>{question.verb}</span>}
          <span style={{
            display: 'inline-block',
            minWidth: hasVerb ? 50 : 80,
            borderBottom: '2px dashed var(--color-accent)',
            color: showResult ? (isCorrect ? '#4ade80' : '#f87171') : 'var(--color-accent)',
            fontWeight: 700, padding: '0 4px',
          }}>
            {selected
              ? (hasVerb
                ? choices.find(c => c.id === selected)?.label.replace('-', '')
                : choices.find(c => c.id === selected)?.label)
              : (hasVerb ? '___' : '______')}
          </span>
          {question.after}
        </div>

        {/* B5 — Label above the decision panel */}
        {!showResult && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            marginBottom: '0.6rem',
          }}>
            <span style={{ fontSize: '0.9rem' }}>🧠</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--color-accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Aide — Pavé de décision
            </span>
          </div>
        )}

        {/* Decision Panel */}
        {!showResult && (
          <DecisionPanel
            rule={guidedRule}
            axisSelections={axisSelections}
            setAxisSelections={setAxisSelections}
          />
        )}

        {/* B1 — Separator between decision panel and answer buttons */}
        {!showResult && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.8rem',
            margin: '0.5rem 0 1rem',
          }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
            <span style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Ta réponse
            </span>
            <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
          </div>
        )}

        {/* Answer choices */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: choices.length <= 4 ? '1fr 1fr' : `repeat(${choices.length}, 1fr)`,
          gap: choices.length <= 4 ? '0.55rem' : '0.45rem',
          marginBottom: '1.2rem',
        }}>
          {choices.map(choice => {
            const isEliminated = eliminated.has(choice.id);
            const isHighlighted = !isEliminated && eliminated.size > 0;
            const isSelected = selected === choice.id;
            const isAnswer = choice.id === question.answer;

            let bg = 'rgba(255,255,255,0.06)';
            let borderColor = 'rgba(255,255,255,0.12)';
            let textColor = '#e2e2e2';
            let opacity = 1;
            let textDecoration = 'none';

            // B3 — Eliminated options: more visible with line-through
            if (isEliminated) {
              opacity = 0.4;
              textColor = '#6b7280';
              textDecoration = 'line-through';
            }
            // B2 — Gold color for remaining (highlighted) answer options
            if (isHighlighted && !showResult) {
              bg = 'rgba(251,191,36,0.12)';
              borderColor = '#fbbf24';
              textColor = '#fde68a';
            }
            if (showResult && isSelected) {
              bg = isCorrect ? 'rgba(74,222,128,0.2)' : 'rgba(248,113,113,0.2)';
              borderColor = isCorrect ? '#4ade80' : '#f87171';
              textColor = isCorrect ? '#4ade80' : '#f87171';
              opacity = 1;
              textDecoration = 'none';
            }
            if (showResult && isAnswer && !isSelected) {
              bg = 'rgba(74,222,128,0.1)';
              borderColor = '#4ade80';
              textColor = '#4ade80';
              opacity = 1;
              textDecoration = 'none';
            }
            if (showResult && !isSelected && !isAnswer) {
              opacity = 0.2;
              textDecoration = 'none';
            }

            return (
              <button key={choice.id}
                onClick={() => handleSelect(choice.id)}
                disabled={showResult || isEliminated}
                style={{
                  padding: choices.length <= 4 ? '0.85rem' : '0.75rem 0.3rem',
                  borderRadius: 10,
                  border: `2px solid ${borderColor}`, background: bg,
                  color: textColor,
                  cursor: showResult || isEliminated ? 'default' : 'pointer',
                  fontSize: choices.length <= 4 ? '1.1rem' : '1.05rem',
                  fontWeight: 700, opacity,
                  textDecoration,
                  transition: 'all 0.3s ease',
                }}
              >
                {choice.label}
                {onlyOneLeft && !isEliminated && !showResult && (
                  <span style={{
                    display: 'block', fontSize: '0.6rem', fontWeight: 400,
                    color: '#fbbf24', marginTop: 2,
                  }}>
                    Clique pour valider
                  </span>
                )}
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
          <button onClick={handleNext} style={nextBtnStyle}>
            {currentIndex + 1 >= questions.length ? 'Voir le résultat final' : 'Question suivante →'}
          </button>
        )}
      </div>
    </div>
  );
}

function DecisionPanel({ rule, axisSelections, setAxisSelections }) {
  const axes = rule.decisionAxes;
  if (!axes || axes.length === 0) return null;

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem', marginBottom: '1.5rem',
    }}>
      {axes.map((axis, axisIdx) => {
        const dependsOnAxis = axis.dependsOn
          ? axes.find(a => a.id === axis.dependsOn)
          : null;
        const parentValue = dependsOnAxis ? axisSelections[axis.dependsOn] : null;
        const isDisabled = axis.dependsOn && (parentValue === undefined || parentValue === null);

        // Filter options based on showWhen if parent is selected
        let visibleOptions = axis.options;
        if (axis.dependsOn && parentValue !== undefined && parentValue !== null) {
          visibleOptions = axis.options.filter(o => {
            if (o.showWhen === undefined) return true;
            return o.showWhen === parentValue;
          });
        }

        // B4 — Circled number for axis label
        const circledNum = CIRCLED_NUMBERS[axisIdx] || `${axisIdx + 1}.`;

        return (
          <div key={axis.id}>
            <div style={{
              fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.08em',
              color: '#9ca3af', marginBottom: '0.45rem', fontWeight: 600,
            }}>
              <span style={{ color: 'var(--color-accent)', fontWeight: 700 }}>{circledNum}</span>{' '}
              {isDisabled && axis.dependsOn
                ? 'Choisis d\'abord l\'axe 1'
                : axis.question}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {isDisabled ? (
                <div style={{
                  padding: '0.8rem', borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.02)',
                  color: '#4b5563', fontSize: '0.82rem',
                  textAlign: 'center', fontStyle: 'italic',
                }}>
                  Choisis d'abord l'axe 1
                </div>
              ) : visibleOptions.map(opt => {
                const active = axisSelections[axis.id] === opt.value;
                // Build label — use context-aware labels if available
                let label = opt.label;
                if (parentValue === true && opt.labelWhenEtre) label = opt.labelWhenEtre;
                else if (parentValue === false && opt.labelWhenNoEtre) label = opt.labelWhenNoEtre;

                return (
                  <button key={String(opt.value)}
                    onClick={() => {
                      if (active) {
                        setAxisSelections(prev => {
                          const next = { ...prev };
                          delete next[axis.id];
                          return next;
                        });
                      } else {
                        setAxisSelections(prev => {
                          const next = { ...prev, [axis.id]: opt.value };
                          // Reset dependent axes
                          for (const a of rule.decisionAxes) {
                            if (a.dependsOn === axis.id) delete next[a.id];
                          }
                          return next;
                        });
                      }
                    }}
                    style={{
                      padding: '0.55rem 0.9rem', borderRadius: 8, textAlign: 'left',
                      border: active ? '2px solid var(--color-primary)' : '1px solid rgba(255,255,255,0.15)',
                      background: active ? 'rgba(var(--color-primary-rgb),0.2)' : 'rgba(255,255,255,0.04)',
                      color: active ? 'var(--color-accent)' : '#d1d5db',
                      cursor: 'pointer', fontSize: '0.85rem',
                      fontWeight: active ? 600 : 400, transition: 'all 0.2s',
                    }}
                  >
                    {label}
                    {opt.sub && (
                      <span style={{ display: 'block', fontSize: '0.66rem', fontWeight: 400, color: '#6b7280', marginTop: 2 }}>
                        {opt.sub}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─── SHARED STYLES ─── */

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(135deg, var(--color-bg1) 0%, var(--color-bg2) 100%)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
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

const sentenceStyle = {
  background: 'rgba(0,0,0,0.3)', borderRadius: 12,
  padding: '1.2rem 1.5rem', fontSize: '1.15rem',
  textAlign: 'center', marginBottom: '1.5rem',
  lineHeight: 1.7, border: '1px solid rgba(255,255,255,0.05)',
};

const nextBtnStyle = {
  width: '100%', padding: '0.8rem', borderRadius: 10,
  border: '2px solid var(--color-primary)', background: 'rgba(var(--color-primary-rgb),0.15)',
  color: 'var(--color-accent)', cursor: 'pointer', fontSize: '0.95rem', fontWeight: 700,
};

import { useState } from "react";

const CHOICES = [
  { id: "ces", label: "ces" },
  { id: "ses", label: "ses" },
  { id: "sest", label: "s'est" },
  { id: "cest", label: "c'est" },
];

const QUESTIONS = [
  // ── s'est (5) ──
  {
    before: "Le bébé ",
    after: " mis à pleurer d'un coup.",
    answer: "sest",
    explanation: "Le bébé se est mis à pleurer → verbe être (se mettre), pronom réfléchi « se » → s'est.",
  },
  {
    before: "La branche ",
    after: " cassée sous le poids de la neige.",
    answer: "sest",
    explanation: "La branche se est cassée → verbe être (se casser), pronom réfléchi « se » → s'est.",
  },
  {
    before: "Mon voisin ",
    after: " plaint du bruit toute la soirée.",
    answer: "sest",
    explanation: "Mon voisin se est plaint → verbe être (se plaindre), pronom réfléchi « se » → s'est.",
  },
  {
    before: "Le match ",
    after: " terminé par un match nul.",
    answer: "sest",
    explanation: "Le match se est terminé → verbe être (se terminer), pronom réfléchi « se » → s'est.",
  },
  {
    before: "Elle ",
    after: " souvenue de notre rendez-vous.",
    answer: "sest",
    explanation: "Elle se est souvenue → verbe être (se souvenir), pronom réfléchi « se » → s'est.",
  },
  // ── c'est (5) ──
  {
    before: "",
    after: " impossible de tout faire en un jour.",
    answer: "cest",
    explanation: "Cela est impossible → verbe être, « ce » → c'est.",
  },
  {
    before: "",
    after: " lui qui m'a tout appris.",
    answer: "cest",
    explanation: "Cela est lui qui… → verbe être, « ce » → c'est.",
  },
  {
    before: "",
    after: " bizarre, il ne répond plus au téléphone.",
    answer: "cest",
    explanation: "Cela est bizarre → verbe être, « ce » → c'est.",
  },
  {
    before: "Oui, ",
    after: " bien ce que je pensais.",
    answer: "cest",
    explanation: "Cela est bien ce que… → verbe être, « ce » → c'est.",
  },
  {
    before: "",
    after: " pour demain, pas pour aujourd'hui.",
    answer: "cest",
    explanation: "Cela est pour demain → verbe être, « ce » → c'est.",
  },
  // ── ses (5) ──
  {
    before: "L'artiste expose ",
    after: " tableaux dans une galerie parisienne.",
    answer: "ses",
    explanation: "Les tableaux à lui → on peut dire « les siens » → ses.",
  },
  {
    before: "Le médecin a consulté ",
    after: " notes avant de répondre.",
    answer: "ses",
    explanation: "Les notes à lui → on peut dire « les siennes » → ses.",
  },
  {
    before: "Ma fille a mis ",
    after: " bottes pour aller dans les flaques.",
    answer: "ses",
    explanation: "Les bottes à elle → on peut dire « les siennes » → ses.",
  },
  {
    before: "Le pilote a vérifié ",
    after: " instruments avant le décollage.",
    answer: "ses",
    explanation: "Les instruments à lui → on peut dire « les siens » → ses.",
  },
  {
    before: "Le chien a retrouvé ",
    after: " jouets sous le lit.",
    answer: "ses",
    explanation: "Les jouets à lui → on peut dire « les siens » → ses.",
  },
  // ── ces (5) ──
  {
    before: "Qui a laissé ",
    after: " cartons dans le couloir ?",
    answer: "ces",
    explanation: "On désigne des cartons précis (ceux-là) → ces.",
  },
  {
    before: "Je déteste ",
    after: " jours de pluie interminable.",
    answer: "ces",
    explanation: "On parle de jours précis (ceux-là) → ces.",
  },
  {
    before: "",
    after: " nuages annoncent un orage.",
    answer: "ces",
    explanation: "On montre des nuages précis (ceux-là) → ces.",
  },
  {
    before: "Tu te rappelles ",
    after: " étés qu'on passait à la campagne ?",
    answer: "ces",
    explanation: "On parle d'étés précis (ceux-là) → ces.",
  },
  {
    before: "Il faudrait repeindre ",
    after: " murs du salon.",
    answer: "ces",
    explanation: "On désigne des murs précis (ceux-là) → ces.",
  },
];

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function QuizCesSes() {
  const [questions] = useState(() => shuffleArray(QUESTIONS));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]);

  const question = questions[currentIndex];

  const handleSelect = (id) => {
    const correct = id === question.answer;
    setSelected(id);
    setShowResult(true);
    if (correct) setScore((s) => s + 1);
    setAnswers((prev) => [...prev, { index: currentIndex, chosen: id, correct }]);
  };

  const handleNext = () => {
    if (currentIndex + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setSelected(null);
      setShowResult(false);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    setAnswers([]);
    setSelected(null);
    setShowResult(false);
  };

  const isCorrect = selected === question?.answer;

  // ---- Styles ----
  const page = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1e1e2e 0%, #2d2b55 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    padding: "1.5rem",
    color: "#e2e2e2",
  };

  const card = {
    maxWidth: 600,
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    borderRadius: 20,
    padding: "2rem 2.2rem",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(255,255,255,0.1)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
  };

  // ---- END SCREEN ----
  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    const emoji = pct === 100 ? "🏆" : pct >= 70 ? "👏" : pct >= 50 ? "💪" : "📚";
    return (
      <div style={page}>
        <div style={card}>
          <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>{emoji}</div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#c4b5fd", marginBottom: "0.3rem" }}>
              Quiz terminé !
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#d1d5db" }}>
              Score : <strong style={{ color: pct >= 70 ? "#4ade80" : "#fbbf24" }}>{score}/{questions.length}</strong> ({pct}%)
            </p>
          </div>

          {/* Recap */}
          <div style={{
            maxHeight: 400, overflowY: "auto", marginBottom: "1.5rem",
            paddingRight: "0.3rem",
          }}>
            {questions.map((q, i) => {
              const a = answers[i];
              const ok = a?.correct;
              return (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.6rem",
                  padding: "0.5rem 0.7rem",
                  borderRadius: 8,
                  marginBottom: "0.35rem",
                  background: ok ? "rgba(74,222,128,0.07)" : "rgba(248,113,113,0.07)",
                  border: `1px solid ${ok ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
                }}>
                  <span style={{ fontSize: "0.85rem", width: 22, flexShrink: 0 }}>
                    {ok ? "✓" : "✗"}
                  </span>
                  <span style={{ fontSize: "0.82rem", color: "#d1d5db", flex: 1 }}>
                    {q.before}<strong style={{ color: ok ? "#4ade80" : "#f87171" }}>
                      {CHOICES.find((c) => c.id === a?.chosen)?.label}
                    </strong>{q.after}
                  </span>
                  {!ok && (
                    <span style={{ fontSize: "0.75rem", color: "#9ca3af", flexShrink: 0 }}>
                      → {CHOICES.find((c) => c.id === q.answer)?.label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <button onClick={restartQuiz} style={{
            width: "100%",
            padding: "0.85rem",
            borderRadius: 10,
            border: "2px solid #a78bfa",
            background: "rgba(167,139,250,0.15)",
            color: "#c4b5fd",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: 700,
          }}>
            Recommencer le quiz
          </button>
        </div>
      </div>
    );
  }

  // ---- QUESTION SCREEN ----
  return (
    <div style={page}>
      <div style={card}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
          <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "#c4b5fd", letterSpacing: "-0.02em" }}>
            ces · ses · s'est · c'est
          </h1>
          <span style={{ fontSize: "0.85rem", color: "#9ca3af", fontWeight: 600 }}>
            {currentIndex + 1}/{questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{
          height: 4, borderRadius: 2,
          background: "rgba(255,255,255,0.08)",
          marginBottom: "0.5rem", overflow: "hidden",
        }}>
          <div style={{
            height: "100%",
            width: `${((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100}%`,
            background: "linear-gradient(90deg, #a78bfa, #c4b5fd)",
            borderRadius: 2,
            transition: "width 0.4s ease",
          }} />
        </div>

        {/* Score line */}
        <p style={{ textAlign: "right", fontSize: "0.78rem", color: "#6b7280", marginBottom: "1.8rem" }}>
          Score : {score}/{currentIndex + (showResult ? 1 : 0)}
        </p>

        {/* Sentence */}
        <div style={{
          background: "rgba(0,0,0,0.3)",
          borderRadius: 12,
          padding: "1.3rem 1.5rem",
          fontSize: "1.2rem",
          textAlign: "center",
          marginBottom: "2rem",
          lineHeight: 1.7,
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          {question.before}
          <span style={{
            display: "inline-block",
            minWidth: 80,
            borderBottom: "2px dashed #c4b5fd",
            color: showResult ? (isCorrect ? "#4ade80" : "#f87171") : "#c4b5fd",
            fontWeight: 700,
            padding: "0 4px",
          }}>
            {selected ? CHOICES.find((c) => c.id === selected).label : "______"}
          </span>
          {question.after}
        </div>

        {/* 4 Answer buttons */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "0.7rem", marginBottom: "1.5rem",
        }}>
          {CHOICES.map((choice) => {
            const isSelected = selected === choice.id;
            const isAnswer = choice.id === question.answer;

            let bg = "rgba(255,255,255,0.06)";
            let borderColor = "rgba(255,255,255,0.15)";
            let textColor = "#e2e2e2";
            let opacity = 1;

            if (showResult) {
              if (isSelected && isCorrect) {
                bg = "rgba(74,222,128,0.2)";
                borderColor = "#4ade80";
                textColor = "#4ade80";
              } else if (isSelected && !isCorrect) {
                bg = "rgba(248,113,113,0.2)";
                borderColor = "#f87171";
                textColor = "#f87171";
              } else if (isAnswer) {
                bg = "rgba(74,222,128,0.1)";
                borderColor = "#4ade80";
                textColor = "#4ade80";
              } else {
                opacity = 0.3;
              }
            }

            return (
              <button key={choice.id}
                onClick={() => !showResult && handleSelect(choice.id)}
                disabled={showResult}
                style={{
                  padding: "1rem", borderRadius: 12,
                  border: `2px solid ${borderColor}`,
                  background: bg,
                  color: textColor,
                  cursor: showResult ? "default" : "pointer",
                  fontSize: "1.15rem", fontWeight: 700,
                  opacity,
                  transition: "all 0.25s ease",
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
            background: isCorrect ? "rgba(74,222,128,0.08)" : "rgba(248,113,113,0.08)",
            border: `1px solid ${isCorrect ? "rgba(74,222,128,0.3)" : "rgba(248,113,113,0.3)"}`,
            borderRadius: 12, padding: "1.1rem", marginBottom: "1rem",
          }}>
            <div style={{
              fontWeight: 700, fontSize: "1rem",
              color: isCorrect ? "#4ade80" : "#f87171", marginBottom: "0.4rem",
            }}>
              {isCorrect ? "Bravo !" : "Raté !"}
            </div>
            <div style={{ fontSize: "0.85rem", lineHeight: 1.6, color: "#d1d5db" }}>
              {question.explanation}
            </div>
          </div>
        )}

        {/* Next / Finish button */}
        {showResult && (
          <button onClick={handleNext} style={{
            width: "100%", padding: "0.8rem", borderRadius: 10,
            border: "2px solid #a78bfa",
            background: "rgba(167,139,250,0.15)",
            color: "#c4b5fd", cursor: "pointer",
            fontSize: "0.95rem", fontWeight: 700,
          }}>
            {currentIndex + 1 >= questions.length ? "Voir le résultat final" : "Question suivante →"}
          </button>
        )}
      </div>
    </div>
  );
}

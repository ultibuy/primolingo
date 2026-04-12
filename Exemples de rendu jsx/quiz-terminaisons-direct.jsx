import { useState } from "react";

const CHOICES = [
  { id: "er", label: "-er" },
  { id: "e", label: "-é" },
  { id: "ez", label: "-ez" },
  { id: "ais", label: "-ais" },
  { id: "ait", label: "-ait" },
];

const QUESTIONS = [
  // ── -er (4) ──
  {
    before: "Il faut ",
    verb: "mang",
    after: " avant de partir.",
    answer: "er",
    explanation: "On peut dire « il faut mordre » → infinitif → -er.",
  },
  {
    before: "Elle adore ",
    verb: "chant",
    after: " sous la douche.",
    answer: "er",
    explanation: "On peut dire « elle adore mordre » → infinitif → -er.",
  },
  {
    before: "Je vais ",
    verb: "achet",
    after: " du pain.",
    answer: "er",
    explanation: "On peut dire « je vais mordre » → infinitif → -er.",
  },
  {
    before: "Tu peux ",
    verb: "pos",
    after: " tes affaires ici.",
    answer: "er",
    explanation: "On peut dire « tu peux mordre » → infinitif → -er.",
  },
  // ── -é (4) ──
  {
    before: "Il a ",
    verb: "mang",
    after: " toute la tarte.",
    answer: "e",
    explanation: "On peut dire « il a mordu » → participe passé → -é.",
  },
  {
    before: "Elle est ",
    verb: "arriv",
    after: " en retard ce matin.",
    answer: "e",
    explanation: "On peut dire « elle est mordue » → participe passé → -é (arrivée).",
  },
  {
    before: "Le colis a été ",
    verb: "livr",
    after: " hier soir.",
    answer: "e",
    explanation: "On peut dire « le colis a été mordu » → participe passé → -é.",
  },
  {
    before: "J'ai ",
    verb: "oubli",
    after: " mes clés sur la table.",
    answer: "e",
    explanation: "On peut dire « j'ai mordu » → participe passé → -é.",
  },
  // ── -ez (4) ──
  {
    before: "Vous ",
    verb: "parl",
    after: " trop vite pour moi.",
    answer: "ez",
    explanation: "Le sujet est « vous » → verbe conjugué au présent → -ez.",
  },
  {
    before: "Est-ce que vous ",
    verb: "aim",
    after: " le chocolat ?",
    answer: "ez",
    explanation: "Le sujet est « vous » → verbe conjugué → -ez.",
  },
  {
    before: "Vous allez ",
    verb: "ador",
    after: " ce restaurant.",
    answer: "er",
    explanation: "Attention ! « Vous allez » est déjà conjugué → ce qui suit est un infinitif. « Vous allez mordre » → -er.",
  },
  {
    before: "Vous ",
    verb: "trouv",
    after: " toujours une solution.",
    answer: "ez",
    explanation: "Le sujet est « vous » → verbe conjugué au présent → -ez.",
  },
  // ── -ais (4) ──
  {
    before: "Je ",
    verb: "pens",
    after: " que c'était une bonne idée.",
    answer: "ais",
    explanation: "Le sujet est « je » + contexte passé (« c'était ») → imparfait → -ais.",
  },
  {
    before: "Tu ",
    verb: "regard",
    after: " toujours par la fenêtre quand tu étais petit.",
    answer: "ais",
    explanation: "Le sujet est « tu » + habitude passée → imparfait → -ais.",
  },
  {
    before: "Avant, je ",
    verb: "jou",
    after: " au foot tous les mercredis.",
    answer: "ais",
    explanation: "Le sujet est « je » + habitude passée (« avant ») → imparfait → -ais.",
  },
  {
    before: "Tu ",
    verb: "chant",
    after: " faux mais c'était drôle.",
    answer: "ais",
    explanation: "Le sujet est « tu » + contexte passé → imparfait → -ais.",
  },
  // ── -ait (4) ──
  {
    before: "Elle ",
    verb: "dans",
    after: " comme une professionnelle quand elle était jeune.",
    answer: "ait",
    explanation: "Le sujet est « elle » + habitude passée → imparfait → -ait.",
  },
  {
    before: "Il ",
    verb: "neig",
    after: " tous les hivers dans ce village.",
    answer: "ait",
    explanation: "Le sujet est « il » (impersonnel) + habitude passée → imparfait → -ait.",
  },
  {
    before: "On ",
    verb: "parl",
    after: " souvent de ce sujet à l'époque.",
    answer: "ait",
    explanation: "Le sujet est « on » + contexte passé → imparfait → -ait.",
  },
  {
    before: "Le chien ",
    verb: "aboi",
    after: " chaque fois que le facteur passait.",
    answer: "ait",
    explanation: "Le sujet est « le chien » (= il) + habitude passée → imparfait → -ait.",
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

export default function QuizTerminaisons() {
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

  const page = {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    padding: "1.5rem",
    color: "#e2e2e2",
  };

  const card = {
    maxWidth: 620,
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

          <div style={{ maxHeight: 420, overflowY: "auto", marginBottom: "1.5rem", paddingRight: "0.3rem" }}>
            {questions.map((q, i) => {
              const a = answers[i];
              const ok = a?.correct;
              return (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: "0.6rem",
                  padding: "0.5rem 0.7rem", borderRadius: 8, marginBottom: "0.35rem",
                  background: ok ? "rgba(74,222,128,0.07)" : "rgba(248,113,113,0.07)",
                  border: `1px solid ${ok ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)"}`,
                }}>
                  <span style={{ fontSize: "0.85rem", width: 22, flexShrink: 0 }}>{ok ? "✓" : "✗"}</span>
                  <span style={{ fontSize: "0.82rem", color: "#d1d5db", flex: 1 }}>
                    {q.before}{q.verb}<strong style={{ color: ok ? "#4ade80" : "#f87171" }}>
                      {CHOICES.find((c) => c.id === a?.chosen)?.label.replace("-", "")}
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
            width: "100%", padding: "0.85rem", borderRadius: 10,
            border: "2px solid #a78bfa", background: "rgba(167,139,250,0.15)",
            color: "#c4b5fd", cursor: "pointer", fontSize: "1rem", fontWeight: 700,
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
          <h1 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#c4b5fd", letterSpacing: "-0.02em" }}>
            -er · -é · -ez · -ais · -ait
          </h1>
          <span style={{ fontSize: "0.85rem", color: "#9ca3af", fontWeight: 600 }}>
            {currentIndex + 1}/{questions.length}
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", marginBottom: "0.5rem", overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${((currentIndex + (showResult ? 1 : 0)) / questions.length) * 100}%`,
            background: "linear-gradient(90deg, #a78bfa, #c4b5fd)",
            borderRadius: 2, transition: "width 0.4s ease",
          }} />
        </div>

        <p style={{ textAlign: "right", fontSize: "0.78rem", color: "#6b7280", marginBottom: "1.8rem" }}>
          Score : {score}/{currentIndex + (showResult ? 1 : 0)}
        </p>

        {/* Sentence */}
        <div style={{
          background: "rgba(0,0,0,0.3)", borderRadius: 12,
          padding: "1.3rem 1.5rem", fontSize: "1.2rem",
          textAlign: "center", marginBottom: "2rem",
          lineHeight: 1.7, border: "1px solid rgba(255,255,255,0.05)",
        }}>
          {question.before}
          <span style={{ color: "#e2e2e2", fontWeight: 600 }}>{question.verb}</span>
          <span style={{
            display: "inline-block", minWidth: 45,
            borderBottom: "2px dashed #c4b5fd",
            color: showResult ? (isCorrect ? "#4ade80" : "#f87171") : "#c4b5fd",
            fontWeight: 700, padding: "0 3px",
          }}>
            {selected ? CHOICES.find((c) => c.id === selected).label.replace("-", "") : "___"}
          </span>
          {question.after}
        </div>

        {/* 5 Answer buttons */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
          gap: "0.5rem", marginBottom: "1.5rem",
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
                opacity = 0.25;
              }
            }

            return (
              <button key={choice.id}
                onClick={() => !showResult && handleSelect(choice.id)}
                disabled={showResult}
                style={{
                  padding: "0.9rem 0.3rem", borderRadius: 12,
                  border: `2px solid ${borderColor}`, background: bg,
                  color: textColor,
                  cursor: showResult ? "default" : "pointer",
                  fontSize: "1.1rem", fontWeight: 700, opacity,
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

        {/* Next */}
        {showResult && (
          <button onClick={handleNext} style={{
            width: "100%", padding: "0.8rem", borderRadius: 10,
            border: "2px solid #a78bfa", background: "rgba(167,139,250,0.15)",
            color: "#c4b5fd", cursor: "pointer", fontSize: "0.95rem", fontWeight: 700,
          }}>
            {currentIndex + 1 >= questions.length ? "Voir le résultat final" : "Question suivante →"}
          </button>
        )}
      </div>
    </div>
  );
}

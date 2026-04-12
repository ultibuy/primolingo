import { useState } from "react";

const CHOICES = [
  { id: "ces", label: "ces", hasEtre: false, startsWithC: true, hint: "sans être + C → ceux-là → ces" },
  { id: "ses", label: "ses", hasEtre: false, startsWithC: false, hint: "sans être + S → les siens → ses" },
  { id: "sest", label: "s'est", hasEtre: true, startsWithC: false, hint: "avec être + S → se + est → s'est" },
  { id: "cest", label: "c'est", hasEtre: true, startsWithC: true, hint: "avec être + C → cela est → c'est" },
];

const QUESTIONS = [
  // ── s'est (5) ──
  {
    before: "L'enfant ",
    after: " réveillé en pleine nuit.",
    answer: "sest",
    explanation: "L'enfant se est réveillé → verbe être (se réveiller), pronom réfléchi « se » → S. Donc : s'est.",
  },
  {
    before: "Mon collègue ",
    after: " inscrit à un marathon.",
    answer: "sest",
    explanation: "Mon collègue se est inscrit → verbe être (s'inscrire), pronom réfléchi « se » → S. Donc : s'est.",
  },
  {
    before: "La porte ",
    after: " ouverte toute seule.",
    answer: "sest",
    explanation: "La porte se est ouverte → verbe être (s'ouvrir), pronom réfléchi « se » → S. Donc : s'est.",
  },
  {
    before: "L'avion ",
    after: " posé avec du retard.",
    answer: "sest",
    explanation: "L'avion se est posé → verbe être (se poser), pronom réfléchi « se » → S. Donc : s'est.",
  },
  {
    before: "Elle ",
    after: " rendu compte de son erreur.",
    answer: "sest",
    explanation: "Elle se est rendu compte → verbe être (se rendre compte), pronom réfléchi « se » → S. Donc : s'est.",
  },
  // ── c'est (5) ──
  {
    before: "",
    after: " toujours pareil avec lui !",
    answer: "cest",
    explanation: "Cela est toujours pareil → verbe être, « ce » → C. Donc : c'est.",
  },
  {
    before: "",
    after: " dommage de rater ce film.",
    answer: "cest",
    explanation: "Cela est dommage → verbe être, « ce » → C. Donc : c'est.",
  },
  {
    before: "",
    after: " grâce à toi qu'on a gagné.",
    answer: "cest",
    explanation: "Cela est grâce à toi → verbe être, « ce » → C. Donc : c'est.",
  },
  {
    before: "",
    after: " exactement ce que je voulais dire.",
    answer: "cest",
    explanation: "Cela est exactement ce que… → verbe être, « ce » → C. Donc : c'est.",
  },
  {
    before: "Ah, ",
    after: " toi qui as pris mon stylo !",
    answer: "cest",
    explanation: "Cela est toi qui… → verbe être, « ce » → C. Donc : c'est.",
  },
  // ── ses (5) ──
  {
    before: "Le directeur a annulé ",
    after: " réunions de l'après-midi.",
    answer: "ses",
    explanation: "Les réunions à lui → pas de verbe être, on peut dire « les siennes » → S. Donc : ses.",
  },
  {
    before: "Elle cherche ",
    after: " lunettes depuis ce matin.",
    answer: "ses",
    explanation: "Les lunettes à elle → pas de verbe être, on peut dire « les siennes » → S. Donc : ses.",
  },
  {
    before: "Il a oublié ",
    after: " devoirs à la maison.",
    answer: "ses",
    explanation: "Les devoirs à lui → pas de verbe être, on peut dire « les siens » → S. Donc : ses.",
  },
  {
    before: "Ma grand-mère raconte toujours ",
    after: " histoires du passé.",
    answer: "ses",
    explanation: "Les histoires à elle → pas de verbe être, on peut dire « les siennes » → S. Donc : ses.",
  },
  {
    before: "Le joueur a enlevé ",
    after: " crampons après le match.",
    answer: "ses",
    explanation: "Les crampons à lui → pas de verbe être, on peut dire « les siens » → S. Donc : ses.",
  },
  // ── ces (5) ──
  {
    before: "D'où viennent ",
    after: " bruits bizarres la nuit ?",
    answer: "ces",
    explanation: "On parle de bruits précis (ceux-là) → pas de verbe être, « ceux-là » → C. Donc : ces.",
  },
  {
    before: "Il faut arroser ",
    after: " plantes sur le balcon.",
    answer: "ces",
    explanation: "On désigne des plantes précises (celles-là) → pas de verbe être, « ceux-là » → C. Donc : ces.",
  },
  {
    before: "Je me souviens bien de ",
    after: " vacances en Bretagne.",
    answer: "ces",
    explanation: "On parle de vacances précises (celles-là) → pas de verbe être, « ceux-là » → C. Donc : ces.",
  },
  {
    before: "",
    after: " enfants jouent trop près de la route.",
    answer: "ces",
    explanation: "On désigne des enfants précis (ceux-là) → pas de verbe être, « ceux-là » → C. Donc : ces.",
  },
  {
    before: "Tu connais ",
    after: " restaurants près de la gare ?",
    answer: "ces",
    explanation: "On parle de restaurants précis (ceux-là) → pas de verbe être, « ceux-là » → C. Donc : ces.",
  },
];

function getStatus(choice, filterEtre, filterC) {
  const etreMatch = filterEtre === null ? null : choice.hasEtre === filterEtre;
  const cMatch = filterC === null ? null : choice.startsWithC === filterC;
  if (etreMatch === null && cMatch === null) return "neutral";
  if (etreMatch === false || cMatch === false) return "grayed";
  return "highlighted";
}

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
  const [filterEtre, setFilterEtre] = useState(null);
  const [filterC, setFilterC] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]);

  const question = questions[currentIndex];

  const resetFilters = () => {
    setFilterEtre(null);
    setFilterC(null);
    setSelected(null);
    setShowResult(false);
  };

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
      resetFilters();
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setScore(0);
    setFinished(false);
    setAnswers([]);
    resetFilters();
  };

  const isCorrect = selected === question?.answer;

  const remaining = CHOICES.filter(
    (c) => getStatus(c, filterEtre, filterC) !== "grayed"
  );
  const onlyOneLeft = remaining.length === 1;

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
          <div style={{ marginBottom: "1.5rem" }}>
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
          height: 4,
          borderRadius: 2,
          background: "rgba(255,255,255,0.08)",
          marginBottom: "0.5rem",
          overflow: "hidden",
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
        <p style={{ textAlign: "right", fontSize: "0.78rem", color: "#6b7280", marginBottom: "1.5rem" }}>
          Score : {score}/{currentIndex + (showResult ? 1 : 0)}
        </p>

        {/* Subtitle */}
        <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#9ca3af", marginBottom: "1.5rem" }}>
          Utilise le pavé de décision, puis clique sur ta réponse
        </p>

        {/* Sentence */}
        <div style={{
          background: "rgba(0,0,0,0.3)",
          borderRadius: 12,
          padding: "1.2rem 1.5rem",
          fontSize: "1.15rem",
          textAlign: "center",
          marginBottom: "1.6rem",
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

        {/* Decision Panel */}
        {!showResult && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem",
            marginBottom: "1.6rem",
          }}>
            {/* Être filter */}
            <div>
              <div style={{
                fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em",
                color: "#9ca3af", marginBottom: "0.45rem", fontWeight: 600,
              }}>
                1. Verbe être ?
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {[
                  { value: true, label: "Oui, avec être", sub: "s'est / c'est → verbe être conjugué" },
                  { value: false, label: "Non, sans être", sub: "ses / ces → déterminant devant un nom" },
                ].map((opt) => {
                  const active = filterEtre === opt.value;
                  return (
                    <button key={String(opt.value)}
                      onClick={() => setFilterEtre(active ? null : opt.value)}
                      style={{
                        padding: "0.55rem 0.9rem", borderRadius: 8,
                        border: active ? "2px solid #a78bfa" : "1px solid rgba(255,255,255,0.15)",
                        background: active ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.04)",
                        color: active ? "#c4b5fd" : "#d1d5db",
                        cursor: "pointer", fontSize: "0.88rem",
                        fontWeight: active ? 600 : 400, transition: "all 0.2s",
                      }}
                    >
                      {opt.label}
                      {opt.sub && (
                        <span style={{
                          display: "block", fontSize: "0.68rem", fontWeight: 400,
                          color: "#6b7280", marginTop: 2,
                        }}>
                          {opt.sub}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* C/S filter */}
            <div>
              <div style={{
                fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em",
                color: "#9ca3af", marginBottom: "0.45rem", fontWeight: 600,
              }}>
                2. Commence par ?
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {[
                  {
                    value: true,
                    label: filterEtre === true
                      ? <span><strong style={{ color: "#c4b5fd" }}>C</strong> → <strong style={{ color: "#c4b5fd" }}>c</strong>ela est</span>
                      : filterEtre === false
                        ? <span><strong style={{ color: "#c4b5fd" }}>C</strong> → <strong style={{ color: "#c4b5fd" }}>c</strong>eux-là</span>
                        : "C",
                  },
                  {
                    value: false,
                    label: filterEtre === true
                      ? <span><strong style={{ color: "#c4b5fd" }}>S</strong> → <strong style={{ color: "#c4b5fd" }}>s</strong>e + être</span>
                      : filterEtre === false
                        ? <span><strong style={{ color: "#c4b5fd" }}>S</strong> → les <strong style={{ color: "#c4b5fd" }}>s</strong>iens</span>
                        : "S",
                  },
                ].map((opt) => {
                  const active = filterC === opt.value;
                  return (
                    <button key={String(opt.value)}
                      onClick={() => setFilterC(active ? null : opt.value)}
                      style={{
                        padding: "0.55rem 0.9rem", borderRadius: 8,
                        border: active ? "2px solid #a78bfa" : "1px solid rgba(255,255,255,0.15)",
                        background: active ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.04)",
                        color: active ? "#c4b5fd" : "#d1d5db",
                        cursor: "pointer", fontSize: "0.88rem",
                        fontWeight: active ? 600 : 400, transition: "all 0.2s",
                      }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Answer choices */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "0.55rem", marginBottom: "1.2rem",
        }}>
          {CHOICES.map((choice) => {
            const status = getStatus(choice, filterEtre, filterC);
            const isGrayed = status === "grayed";
            const isHighlighted = status === "highlighted";
            const isSelected = selected === choice.id;

            let bg = "rgba(255,255,255,0.06)";
            let borderColor = "rgba(255,255,255,0.12)";
            let textColor = "#e2e2e2";
            let opacity = 1;

            if (isGrayed) opacity = 0.25;
            if (isHighlighted) {
              bg = "rgba(167,139,250,0.15)";
              borderColor = "#a78bfa";
              textColor = "#c4b5fd";
            }
            if (showResult && isSelected) {
              bg = isCorrect ? "rgba(74,222,128,0.2)" : "rgba(248,113,113,0.2)";
              borderColor = isCorrect ? "#4ade80" : "#f87171";
              textColor = isCorrect ? "#4ade80" : "#f87171";
              opacity = 1;
            }
            if (showResult && choice.id === question.answer && !isSelected) {
              bg = "rgba(74,222,128,0.1)";
              borderColor = "#4ade80";
              textColor = "#4ade80";
              opacity = 1;
            }

            return (
              <button key={choice.id}
                onClick={() => !showResult && !isGrayed && handleSelect(choice.id)}
                disabled={showResult || isGrayed}
                style={{
                  padding: "0.85rem", borderRadius: 10,
                  border: `2px solid ${borderColor}`, background: bg,
                  color: textColor,
                  cursor: showResult || isGrayed ? "default" : "pointer",
                  fontSize: "1.1rem", fontWeight: 700, opacity,
                  transition: "all 0.3s ease",
                }}
              >
                {choice.label}
                {onlyOneLeft && isHighlighted && !showResult && (
                  <span style={{
                    display: "block", fontSize: "0.63rem", fontWeight: 400,
                    color: "#9ca3af", marginTop: 2,
                  }}>
                    Clique pour valider
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Hints */}
        {!showResult && (
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "0.35rem", marginBottom: "1.2rem",
          }}>
            {CHOICES.map((choice) => {
              const status = getStatus(choice, filterEtre, filterC);
              return (
                <div key={choice.id} style={{
                  fontSize: "0.68rem", color: "#6b7280", textAlign: "center",
                  opacity: status === "grayed" ? 0.2 : 0.7, transition: "opacity 0.3s",
                }}>
                  {choice.hint}
                </div>
              );
            })}
          </div>
        )}

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

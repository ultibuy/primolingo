import { useState } from "react";

const CHOICES = [
  { id: "er", label: "-er", conjugue: false, sub: "mordre" },
  { id: "e", label: "-é", conjugue: false, sub: "mordu" },
  { id: "ez", label: "-ez", conjugue: true, sub: "vous" },
  { id: "ais", label: "-ais", conjugue: true, sub: "je/tu" },
  { id: "ait", label: "-ait", conjugue: true, sub: "il/elle/on" },
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

function getStatus(choice, filterConjugue, filterSub) {
  let match1 = null;
  let match2 = null;

  if (filterConjugue !== null) {
    match1 = choice.conjugue === filterConjugue;
  }
  if (filterSub !== null) {
    match2 = choice.sub === filterSub;
  }

  if (match1 === null && match2 === null) return "neutral";
  if (match1 === false || match2 === false) return "grayed";
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

export default function QuizTerminaisons() {
  const [questions] = useState(() => shuffleArray(QUESTIONS));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterConjugue, setFilterConjugue] = useState(null);
  const [filterSub, setFilterSub] = useState(null);
  const [selected, setSelected] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]);

  const question = questions[currentIndex];

  const resetFilters = () => {
    setFilterConjugue(null);
    setFilterSub(null);
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
    (c) => getStatus(c, filterConjugue, filterSub) !== "grayed"
  );
  const onlyOneLeft = remaining.length === 1;

  const bold = (text) => <strong style={{ color: "#c4b5fd" }}>{text}</strong>;

  // ---- Styles ----
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

        <p style={{ textAlign: "right", fontSize: "0.78rem", color: "#6b7280", marginBottom: "1.2rem" }}>
          Score : {score}/{currentIndex + (showResult ? 1 : 0)}
        </p>

        <p style={{ textAlign: "center", fontSize: "0.82rem", color: "#9ca3af", marginBottom: "1.3rem" }}>
          Utilise le pavé de décision, puis clique sur ta réponse
        </p>

        {/* Sentence */}
        <div style={{
          background: "rgba(0,0,0,0.3)", borderRadius: 12,
          padding: "1.2rem 1.5rem", fontSize: "1.15rem",
          textAlign: "center", marginBottom: "1.5rem",
          lineHeight: 1.7, border: "1px solid rgba(255,255,255,0.05)",
        }}>
          {question.before}
          <span style={{ color: "#e2e2e2", fontWeight: 600 }}>{question.verb}</span>
          <span style={{
            display: "inline-block", minWidth: 50,
            borderBottom: "2px dashed #c4b5fd",
            color: showResult ? (isCorrect ? "#4ade80" : "#f87171") : "#c4b5fd",
            fontWeight: 700, padding: "0 3px",
          }}>
            {selected ? CHOICES.find((c) => c.id === selected).label.replace("-", "") : "___"}
          </span>
          {question.after}
        </div>

        {/* Decision Panel */}
        {!showResult && (
          <div style={{
            display: "grid", gridTemplateColumns: "1fr 1fr",
            gap: "0.75rem", marginBottom: "1.5rem",
          }}>
            {/* Axe 1: conjugué ou non */}
            <div>
              <div style={{
                fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em",
                color: "#9ca3af", marginBottom: "0.45rem", fontWeight: 600,
              }}>
                1. Verbe conjugué ?
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {[
                  { value: true, label: "Oui, conjugué", sub: "avec un sujet → -ez / -ais / -ait" },
                  { value: false, label: "Non, infinitif ou participe", sub: "pas de sujet → -er / -é" },
                ].map((opt) => {
                  const active = filterConjugue === opt.value;
                  return (
                    <button key={String(opt.value)}
                      onClick={() => {
                        if (active) {
                          setFilterConjugue(null);
                          setFilterSub(null);
                        } else {
                          setFilterConjugue(opt.value);
                          setFilterSub(null);
                        }
                      }}
                      style={{
                        padding: "0.55rem 0.9rem", borderRadius: 8, textAlign: "left",
                        border: active ? "2px solid #a78bfa" : "1px solid rgba(255,255,255,0.15)",
                        background: active ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.04)",
                        color: active ? "#c4b5fd" : "#d1d5db",
                        cursor: "pointer", fontSize: "0.85rem",
                        fontWeight: active ? 600 : 400, transition: "all 0.2s",
                      }}
                    >
                      {opt.label}
                      <span style={{ display: "block", fontSize: "0.66rem", fontWeight: 400, color: "#6b7280", marginTop: 2 }}>
                        {opt.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Axe 2: adaptatif */}
            <div>
              <div style={{
                fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.08em",
                color: "#9ca3af", marginBottom: "0.45rem", fontWeight: 600,
              }}>
                {filterConjugue === null
                  ? "2. Précise…"
                  : filterConjugue
                    ? "2. Quel sujet ?"
                    : "2. Remplace par mordre…"}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                {filterConjugue === null ? (
                  // Pas encore choisi → boutons grisés
                  <div style={{
                    padding: "0.8rem", borderRadius: 8,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.02)",
                    color: "#4b5563", fontSize: "0.82rem",
                    textAlign: "center", fontStyle: "italic",
                  }}>
                    Choisis d'abord l'axe 1
                  </div>
                ) : filterConjugue === false ? (
                  // Non conjugué → mordre / mordu
                  [
                    { value: "mordre", label: <span>On dirait {bold("mordre")} → infinitif</span> },
                    { value: "mordu", label: <span>On dirait {bold("mordu")} → participe passé</span> },
                  ].map((opt) => {
                    const active = filterSub === opt.value;
                    return (
                      <button key={opt.value}
                        onClick={() => setFilterSub(active ? null : opt.value)}
                        style={{
                          padding: "0.55rem 0.9rem", borderRadius: 8, textAlign: "left",
                          border: active ? "2px solid #a78bfa" : "1px solid rgba(255,255,255,0.15)",
                          background: active ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.04)",
                          color: active ? "#c4b5fd" : "#d1d5db",
                          cursor: "pointer", fontSize: "0.85rem",
                          fontWeight: active ? 600 : 400, transition: "all 0.2s",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })
                ) : (
                  // Conjugué → quel sujet
                  [
                    { value: "vous", label: <span>Sujet = {bold("vous")}</span> },
                    { value: "je/tu", label: <span>Sujet = {bold("je")} ou {bold("tu")}</span> },
                    { value: "il/elle/on", label: <span>Sujet = {bold("il")}, {bold("elle")} ou {bold("on")}</span> },
                  ].map((opt) => {
                    const active = filterSub === opt.value;
                    return (
                      <button key={opt.value}
                        onClick={() => setFilterSub(active ? null : opt.value)}
                        style={{
                          padding: "0.5rem 0.9rem", borderRadius: 8, textAlign: "left",
                          border: active ? "2px solid #a78bfa" : "1px solid rgba(255,255,255,0.15)",
                          background: active ? "rgba(167,139,250,0.2)" : "rgba(255,255,255,0.04)",
                          color: active ? "#c4b5fd" : "#d1d5db",
                          cursor: "pointer", fontSize: "0.85rem",
                          fontWeight: active ? 600 : 400, transition: "all 0.2s",
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5 Answer buttons */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(5, 1fr)",
          gap: "0.45rem", marginBottom: "1.2rem",
        }}>
          {CHOICES.map((choice) => {
            const status = getStatus(choice, filterConjugue, filterSub);
            const isGrayed = status === "grayed";
            const isHighlighted = status === "highlighted";
            const isSelected = selected === choice.id;
            const isAnswer = choice.id === question.answer;

            let bg = "rgba(255,255,255,0.06)";
            let borderColor = "rgba(255,255,255,0.12)";
            let textColor = "#e2e2e2";
            let opacity = 1;

            if (isGrayed) opacity = 0.2;
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
            if (showResult && isAnswer && !isSelected) {
              bg = "rgba(74,222,128,0.1)";
              borderColor = "#4ade80";
              textColor = "#4ade80";
              opacity = 1;
            }
            if (showResult && !isSelected && !isAnswer) {
              opacity = 0.2;
            }

            return (
              <button key={choice.id}
                onClick={() => !showResult && !isGrayed && handleSelect(choice.id)}
                disabled={showResult || isGrayed}
                style={{
                  padding: "0.75rem 0.3rem", borderRadius: 10,
                  border: `2px solid ${borderColor}`, background: bg,
                  color: textColor,
                  cursor: showResult || isGrayed ? "default" : "pointer",
                  fontSize: "1.05rem", fontWeight: 700, opacity,
                  transition: "all 0.3s ease",
                }}
              >
                {choice.label}
                {onlyOneLeft && isHighlighted && !showResult && (
                  <span style={{
                    display: "block", fontSize: "0.58rem", fontWeight: 400,
                    color: "#9ca3af", marginTop: 2,
                  }}>
                    Valider
                  </span>
                )}
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

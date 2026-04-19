import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ─── Design tokens (from the real app) ───
const T = {
  bg1: "#1e1e2e",
  bg2: "#2d2b55",
  bg3: "#1a1a2e",
  primary: "#a78bfa",
  primaryLight: "#c4b5fd",
  primaryDark: "#7c3aed",
  accent: "#c4b5fd",
  gold: "#fbbf24",
  green: "#34d399",
  red: "#f87171",
  orange: "#fb923c",
  textWhite: "#ffffff",
  textLight: "rgba(255,255,255,0.85)",
  textMuted: "rgba(255,255,255,0.5)",
  textSubtle: "rgba(255,255,255,0.35)",
  glass: "rgba(255,255,255,0.06)",
  glassBorder: "rgba(255,255,255,0.1)",
  radius: 20,
  radiusSm: 12,
  font: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
  fontDisplay: "'Outfit', 'Plus Jakarta Sans', system-ui, sans-serif",
};

// ─── Styles ───
const css = {
  page: {
    minHeight: "100vh",
    background: `linear-gradient(180deg, ${T.bg1} 0%, ${T.bg2} 50%, ${T.bg1} 100%)`,
    color: T.textWhite,
    fontFamily: T.font,
    overflowX: "hidden",
  },

  // ─── NAV ───
  nav: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 32px",
    background: "rgba(30,30,46,0.85)",
    backdropFilter: "blur(20px)",
    borderBottom: `1px solid ${T.glassBorder}`,
  },
  navLogo: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontFamily: T.fontDisplay,
    fontWeight: 800,
    fontSize: 20,
    color: T.textWhite,
    textDecoration: "none",
  },
  navLogoIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    background: `linear-gradient(135deg, ${T.primaryDark}, ${T.primary})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 900,
    color: "#fff",
  },
  navCta: {
    padding: "10px 24px",
    borderRadius: 50,
    border: `1.5px solid ${T.primary}`,
    background: "transparent",
    color: T.primary,
    fontWeight: 600,
    fontSize: 14,
    cursor: "pointer",
    transition: "all 0.2s",
    fontFamily: T.font,
  },

  // ─── HERO ───
  hero: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 60,
    padding: "80px 48px 60px",
    maxWidth: 1200,
    margin: "0 auto",
    flexWrap: "wrap",
  },
  heroText: {
    flex: "1 1 420px",
    maxWidth: 540,
  },
  heroTagline: {
    fontFamily: T.fontDisplay,
    fontSize: 14,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: T.primary,
    marginBottom: 16,
  },
  heroTitle: {
    fontFamily: T.fontDisplay,
    fontSize: 48,
    fontWeight: 900,
    lineHeight: 1.1,
    marginBottom: 20,
    color: T.textWhite,
  },
  heroHighlight: {
    background: `linear-gradient(135deg, ${T.primary}, ${T.gold})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroDesc: {
    fontSize: 18,
    lineHeight: 1.7,
    color: T.textLight,
    marginBottom: 32,
  },
  heroCta: {
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    padding: "16px 36px",
    borderRadius: 50,
    background: `linear-gradient(135deg, ${T.primaryDark}, ${T.primary})`,
    color: "#fff",
    fontSize: 17,
    fontWeight: 700,
    border: "none",
    cursor: "pointer",
    fontFamily: T.font,
    boxShadow: `0 8px 30px rgba(167,139,250,0.35)`,
    transition: "all 0.2s",
  },
  heroCtaSub: {
    display: "block",
    marginTop: 10,
    fontSize: 13,
    color: T.textSubtle,
  },
  heroVisual: {
    flex: "1 1 380px",
    maxWidth: 480,
    display: "flex",
    justifyContent: "center",
  },

  // ─── SECTIONS ───
  section: {
    padding: "80px 32px",
    maxWidth: 1100,
    margin: "0 auto",
  },
  sectionDivider: {
    width: "100%",
    height: 1,
    background: `linear-gradient(90deg, transparent, ${T.glassBorder}, transparent)`,
    margin: "0 auto",
    maxWidth: 800,
  },
  sectionLabel: {
    fontFamily: T.fontDisplay,
    fontSize: 13,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 2.5,
    color: T.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: T.fontDisplay,
    fontSize: 36,
    fontWeight: 800,
    textAlign: "center",
    marginBottom: 16,
    lineHeight: 1.2,
  },
  sectionSubtitle: {
    fontSize: 17,
    color: T.textLight,
    textAlign: "center",
    maxWidth: 650,
    margin: "0 auto 48px",
    lineHeight: 1.6,
  },

  // ─── PROBLEM SECTION ───
  problemGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: 24,
    marginTop: 40,
  },
  problemCard: {
    background: T.glass,
    border: `1px solid ${T.glassBorder}`,
    borderRadius: T.radius,
    padding: "28px 24px",
    position: "relative",
    overflow: "hidden",
  },
  problemEmoji: {
    fontSize: 32,
    marginBottom: 12,
  },
  problemTitle: {
    fontFamily: T.fontDisplay,
    fontWeight: 700,
    fontSize: 18,
    marginBottom: 8,
  },
  problemDesc: {
    fontSize: 15,
    lineHeight: 1.6,
    color: T.textLight,
  },

  // ─── HOW IT WORKS ───
  howGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 48,
    alignItems: "center",
    marginTop: 48,
  },
  howStep: {
    display: "flex",
    gap: 20,
    alignItems: "flex-start",
    marginBottom: 36,
  },
  howStepNum: {
    width: 44,
    height: 44,
    minWidth: 44,
    borderRadius: 14,
    background: `linear-gradient(135deg, ${T.primaryDark}, ${T.primary})`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: T.fontDisplay,
    fontWeight: 800,
    fontSize: 18,
    color: "#fff",
  },
  howStepTitle: {
    fontFamily: T.fontDisplay,
    fontWeight: 700,
    fontSize: 18,
    marginBottom: 6,
  },
  howStepDesc: {
    fontSize: 15,
    lineHeight: 1.6,
    color: T.textLight,
  },

  // ─── PHONE MOCKUP ───
  phoneMockup: {
    width: 280,
    height: 560,
    borderRadius: 36,
    border: `3px solid rgba(255,255,255,0.15)`,
    background: T.bg1,
    overflow: "hidden",
    boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
    position: "relative",
  },
  phoneNotch: {
    width: 120,
    height: 28,
    background: T.bg3,
    borderRadius: "0 0 16px 16px",
    margin: "0 auto",
    position: "relative",
    zIndex: 2,
  },
  phoneScreen: {
    padding: "8px 12px",
    height: "calc(100% - 28px)",
    overflow: "hidden",
    background: `linear-gradient(180deg, ${T.bg1}, ${T.bg2})`,
  },

  // ─── SMART REVISION ───
  smartSection: {
    background: `linear-gradient(135deg, rgba(167,139,250,0.08), rgba(124,58,237,0.05))`,
    border: `1px solid rgba(167,139,250,0.15)`,
    borderRadius: 28,
    padding: "56px 48px",
    margin: "0 auto",
    maxWidth: 960,
  },
  smartGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 24,
    marginTop: 40,
  },
  smartCard: {
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${T.glassBorder}`,
    borderRadius: T.radiusSm,
    padding: "24px 20px",
    textAlign: "center",
  },
  smartIcon: {
    fontSize: 36,
    marginBottom: 12,
  },
  smartLabel: {
    fontFamily: T.fontDisplay,
    fontWeight: 700,
    fontSize: 15,
    marginBottom: 6,
  },
  smartDesc: {
    fontSize: 13,
    color: T.textMuted,
    lineHeight: 1.5,
  },

  // ─── TIMELINE ───
  timeline: {
    display: "flex",
    alignItems: "stretch",
    gap: 0,
    marginTop: 40,
    position: "relative",
  },
  timelineItem: {
    flex: 1,
    textAlign: "center",
    position: "relative",
    padding: "0 12px",
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: "50%",
    margin: "0 auto 16px",
    position: "relative",
    zIndex: 2,
  },
  timelineLine: {
    position: "absolute",
    top: 7,
    left: "50%",
    right: "-50%",
    height: 2,
    background: T.glassBorder,
    zIndex: 1,
  },

  // ─── PARENT DASHBOARD ───
  parentSection: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 48,
    alignItems: "center",
    marginTop: 48,
  },

  // ─── RULES ───
  rulesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: 12,
    marginTop: 40,
  },
  ruleChip: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "14px 18px",
    background: T.glass,
    border: `1px solid ${T.glassBorder}`,
    borderRadius: T.radiusSm,
    fontSize: 14,
    fontWeight: 500,
  },
  ruleIcon: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    background: T.green,
  },

  // ─── FREE SECTION ───
  freeCard: {
    background: `linear-gradient(135deg, rgba(52,211,153,0.08), rgba(52,211,153,0.03))`,
    border: `1px solid rgba(52,211,153,0.2)`,
    borderRadius: 28,
    padding: "48px",
    textAlign: "center",
    maxWidth: 700,
    margin: "0 auto",
  },

  // ─── FINAL CTA ───
  finalCta: {
    textAlign: "center",
    padding: "80px 32px 60px",
  },

  // ─── FOOTER ───
  footer: {
    textAlign: "center",
    padding: "24px 32px",
    borderTop: `1px solid ${T.glassBorder}`,
    fontSize: 13,
    color: T.textSubtle,
  },
};

// ─── Mini App Mockups (embedded in the page) ───

function MockDashboard() {
  const rules = [
    { name: "a / à / as", level: 4, icon: "💎", color: T.primary, pct: 100 },
    { name: "ces / ses", level: 3, icon: "👑", color: T.gold, pct: 85 },
    { name: "on / ont / on n'", level: 2, icon: "⚡", color: T.orange, pct: 60 },
    { name: "ou / où", level: 1, icon: "🌱", color: T.green, pct: 30 },
    { name: "leur / leurs", level: 0, icon: "🔒", color: T.textSubtle, pct: 0 },
  ];

  return (
    <div style={{ fontSize: 11 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "4px 0" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Bonjour Damien 👋</div>
          <div style={{ fontSize: 10, color: T.textMuted }}>Série : 12 jours 🔥</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: T.gold }}>🪙 340</span>
          <span style={{ fontSize: 11, color: T.primary }}>🛡️ 2</span>
        </div>
      </div>

      {/* Rules */}
      {rules.map((r, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 10px", marginBottom: 6,
          background: "rgba(255,255,255,0.04)",
          borderRadius: 10,
          border: `1px solid rgba(255,255,255,0.06)`,
        }}>
          <span style={{ fontSize: 16 }}>{r.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 3 }}>{r.name}</div>
            <div style={{
              height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}>
              <div style={{
                width: `${r.pct}%`, height: "100%",
                background: r.color, borderRadius: 2,
                transition: "width 1s ease",
              }} />
            </div>
          </div>
          {r.level > 0 && (
            <div style={{
              padding: "3px 8px", borderRadius: 6,
              background: `${r.color}22`, color: r.color,
              fontSize: 9, fontWeight: 700,
            }}>
              Niv. {r.level}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function MockQuiz() {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSelected(1), 1200);
    const t2 = setTimeout(() => setRevealed(true), 2000);
    const t3 = setTimeout(() => { setSelected(null); setRevealed(false); }, 4500);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  // Loop the animation
  useEffect(() => {
    if (!revealed && selected === null) {
      const t = setTimeout(() => {}, 500);
      return () => clearTimeout(t);
    }
  }, [revealed, selected]);

  const choices = [
    { id: 0, label: "a", correct: false },
    { id: 1, label: "à", correct: true },
    { id: 2, label: "as", correct: false },
  ];

  return (
    <div style={{ fontSize: 11, textAlign: "center", padding: "8px 0" }}>
      {/* Progress */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 10, color: T.textMuted }}>Question 7/20</span>
        <span style={{ fontSize: 10, color: T.green }}>6 ✓</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", marginBottom: 20 }}>
        <div style={{ width: "35%", height: "100%", background: T.primary, borderRadius: 2 }} />
      </div>

      {/* Rule badge */}
      <div style={{
        display: "inline-block", padding: "4px 12px", borderRadius: 20,
        background: `${T.primary}22`, color: T.primary,
        fontSize: 10, fontWeight: 600, marginBottom: 16,
      }}>
        a · à · as
      </div>

      {/* Question */}
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, lineHeight: 1.4 }}>
        Il va <span style={{
          display: "inline-block", width: 32, borderBottom: `2px solid ${T.primary}`,
          color: revealed ? (selected === 1 ? T.green : T.red) : T.primary,
          fontWeight: 700,
        }}>{revealed && selected !== null ? choices[selected].label : "…"}</span> la plage.
      </div>

      {/* Choices */}
      <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
        {choices.map((c) => {
          let bg = "rgba(255,255,255,0.06)";
          let border = "rgba(255,255,255,0.1)";
          let color = T.textWhite;

          if (revealed && c.id === selected) {
            if (c.correct) { bg = `${T.green}22`; border = T.green; color = T.green; }
            else { bg = `${T.red}22`; border = T.red; color = T.red; }
          } else if (revealed && c.correct) {
            bg = `${T.green}15`; border = `${T.green}44`; color = T.green;
          } else if (selected === c.id && !revealed) {
            bg = `${T.primary}22`; border = T.primary;
          }

          return (
            <div key={c.id} style={{
              flex: 1, padding: "12px 8px", borderRadius: 12,
              background: bg, border: `1.5px solid ${border}`,
              color, fontWeight: 700, fontSize: 16,
              cursor: "pointer", transition: "all 0.3s",
            }}>
              {c.label}
            </div>
          );
        })}
      </div>

      {/* Explanation */}
      {revealed && (
        <div style={{
          marginTop: 16, padding: "10px 12px", borderRadius: 10,
          background: `${T.green}11`, border: `1px solid ${T.green}33`,
          fontSize: 10, color: T.green, textAlign: "left", lineHeight: 1.5,
        }}>
          ✓ Correct ! On ne peut pas remplacer par « avait », c'est donc <strong>à</strong> (préposition).
        </div>
      )}
    </div>
  );
}

function MockParentView() {
  const children = [
    { name: "Damien", avatar: "🦊", streak: 12, rules: "8/10", lastActive: "Aujourd'hui" },
    { name: "Léa", avatar: "🦄", streak: 3, rules: "2/10", lastActive: "Hier" },
  ];

  return (
    <div style={{ fontSize: 11 }}>
      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>Espace parent</div>
      <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 16 }}>Vos enfants</div>

      {children.map((c, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px", marginBottom: 8,
          background: "rgba(255,255,255,0.04)",
          borderRadius: 14,
          border: `1px solid rgba(255,255,255,0.06)`,
        }}>
          <div style={{ fontSize: 28 }}>{c.avatar}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{c.name}</div>
            <div style={{ fontSize: 10, color: T.textMuted }}>
              🔥 {c.streak}j · {c.rules} règles · {c.lastActive}
            </div>
          </div>
          <div style={{
            padding: "6px 12px", borderRadius: 8,
            background: `${T.primary}22`, color: T.primary,
            fontSize: 10, fontWeight: 700, cursor: "pointer",
          }}>
            Voir
          </div>
        </div>
      ))}

      {/* Stats preview */}
      <div style={{
        marginTop: 12, padding: "12px",
        background: "rgba(255,255,255,0.03)",
        borderRadius: 12, border: `1px solid rgba(255,255,255,0.06)`,
      }}>
        <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 8 }}>Progression de Damien</div>
        <div style={{ display: "flex", gap: 6 }}>
          {[85, 90, 70, 95, 100, 80, 90].map((v, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{
                width: "100%", height: 40, borderRadius: 4,
                background: "rgba(255,255,255,0.06)",
                position: "relative", overflow: "hidden",
              }}>
                <div style={{
                  position: "absolute", bottom: 0, width: "100%",
                  height: `${v * 0.4}px`,
                  background: v >= 90 ? T.green : v >= 70 ? T.primary : T.orange,
                  borderRadius: "4px 4px 0 0",
                }} />
              </div>
              <span style={{ fontSize: 8, color: T.textSubtle }}>
                {["L", "M", "M", "J", "V", "S", "D"][i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Phone Frame Component ───
function PhoneFrame({ children, label }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={css.phoneMockup}>
        <div style={css.phoneNotch} />
        <div style={css.phoneScreen}>{children}</div>
      </div>
      {label && <div style={{ fontSize: 13, color: T.textMuted, fontWeight: 500 }}>{label}</div>}
    </div>
  );
}

// ─── Animated counter ───
function Counter({ end, suffix = "", duration = 2000 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = end / (duration / 16);
        const interval = setInterval(() => {
          start += step;
          if (start >= end) { setValue(end); clearInterval(interval); }
          else setValue(Math.floor(start));
        }, 16);
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return <span ref={ref}>{value}{suffix}</span>;
}

// ─── Revision Timeline Visualization ───
function RevisionTimeline() {
  const stages = [
    { label: "Jour 1", desc: "Découverte", dots: 5, color: T.primary, opacity: 1 },
    { label: "Jour 3", desc: "Rappel rapide", dots: 3, color: T.primary, opacity: 0.8 },
    { label: "Semaine 2", desc: "Consolidation", dots: 2, color: T.green, opacity: 0.7 },
    { label: "Mois 1", desc: "Ancrage", dots: 1, color: T.green, opacity: 0.6 },
    { label: "Mois 3", desc: "Acquis !", dots: 0, color: T.gold, opacity: 1 },
  ];

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, justifyContent: "center", marginTop: 32 }}>
      {stages.map((s, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center", position: "relative" }}>
          {/* Frequency bars */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, marginBottom: 8, minHeight: 60, justifyContent: "flex-end" }}>
            {Array.from({ length: s.dots }).map((_, j) => (
              <div key={j} style={{
                width: 28, height: 8, borderRadius: 4,
                background: s.color, opacity: s.opacity - j * 0.15,
              }} />
            ))}
            {s.dots === 0 && (
              <div style={{ fontSize: 20 }}>✨</div>
            )}
          </div>
          {/* Dot */}
          <div style={{
            width: 12, height: 12, borderRadius: "50%",
            background: s.color, margin: "0 auto 6px",
            boxShadow: `0 0 12px ${s.color}44`,
          }} />
          {/* Line connector */}
          {i < stages.length - 1 && (
            <div style={{
              position: "absolute", top: "calc(100% - 24px)", left: "55%", right: "-45%",
              height: 2, background: `${T.glassBorder}`,
              zIndex: 0,
            }} />
          )}
          <div style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.label}</div>
          <div style={{ fontSize: 10, color: T.textMuted }}>{s.desc}</div>
        </div>
      ))}
    </div>
  );
}

// ═══════════════════════════════════════
// MAIN LANDING PAGE
// ═══════════════════════════════════════
export default function LandingPage() {
  const navigate = useNavigate();

  const rules = [
    "a / à / as", "ces / ses", "terminaisons verbales (-er, -é, -ez, -ais, -ait)",
    "-é / -ée (féminin)", "Groupes de verbes", "leur / leurs",
    "on / ont / on n'", "ou / où", "Participe passé avec avoir",
    "tout / tous / toute / toutes",
  ];

  return (
    <div style={css.page}>
      <style>{`
        @media (max-width: 768px) {
          .oq-nav { padding: 12px 16px !important; }
          .oq-hero { padding: 40px 20px 32px !important; gap: 32px !important; }
          .oq-two-col { grid-template-columns: 1fr !important; gap: 32px !important; }
          .oq-reverse > :first-child { order: 2 !important; }
          .oq-reverse > :last-child { order: 1 !important; }
          .oq-four-col { grid-template-columns: repeat(2, 1fr) !important; }
          .oq-three-col { grid-template-columns: 1fr !important; }
          .oq-smart-section { padding: 32px 20px !important; }
          .oq-section { padding: 56px 20px !important; }
        }
      `}</style>

      {/* ─── NAV ─── */}
      <nav style={css.nav} className="oq-nav">
        <div style={css.navLogo}>
          <div style={css.navLogoIcon}>OQ</div>
          OrthoQuest
        </div>
        <button style={css.navCta}
          onClick={() => navigate('/login')}
          onMouseEnter={e => { e.currentTarget.style.background = T.primary; e.currentTarget.style.color = "#fff"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = T.primary; }}
        >
          Se connecter
        </button>
      </nav>

      {/* ─── HERO ─── */}
      <section style={css.hero} className="oq-hero">
        <div style={css.heroText}>
          <div style={css.heroTagline}>Application gratuite</div>
          <h1 style={css.heroTitle}>
            Votre enfant fait toujours les <span style={css.heroHighlight}>mêmes fautes</span> d'orthographe ?
          </h1>
          <p style={css.heroDesc}>
            C'est normal. Les dictées et les exercices classiques ne suffisent pas à ancrer les règles
            dans la mémoire à long terme. <strong>OrthoQuest</strong> utilise une méthode scientifique
            de révision adaptative pour que chaque règle soit réellement acquise — pas juste « vue en classe ».
          </p>
          <button style={css.heroCta} onClick={() => navigate('/login')}>
            Créer un compte gratuit →
          </button>
          <span style={css.heroCtaSub}>Connexion avec Google · Prêt en 10 secondes</span>
        </div>

        <div style={css.heroVisual}>
          <PhoneFrame label="L'app de votre enfant">
            <MockDashboard />
          </PhoneFrame>
        </div>
      </section>

      <div style={css.sectionDivider} />

      {/* ─── LE PROBLÈME ─── */}
      <section style={css.section} className="oq-section">
        <div style={css.sectionLabel}>Le constat</div>
        <h2 style={css.sectionTitle}>Pourquoi les fautes persistent</h2>
        <p style={css.sectionSubtitle}>
          Votre enfant connaît la règle. Il l'a apprise en classe, il a fait l'exercice dans le cahier.
          Et pourtant, à la dictée suivante, la même faute revient. Pourquoi ?
        </p>

        <div style={css.problemGrid}>
          <div style={css.problemCard}>
            <div style={css.problemEmoji}>📝</div>
            <div style={css.problemTitle}>On apprend, puis on oublie</div>
            <div style={css.problemDesc}>
              Sans révision au bon moment, une règle apprise en classe s'efface de la mémoire en quelques semaines.
              C'est ce qu'on appelle la courbe de l'oubli — et c'est parfaitement normal.
            </div>
          </div>
          <div style={css.problemCard}>
            <div style={css.problemEmoji}>😴</div>
            <div style={css.problemTitle}>Les exercices n'accrochent pas</div>
            <div style={css.problemDesc}>
              Recopier 10 fois « ces » et « ses » dans un cahier, ça ne donne pas envie.
              Et sans motivation, pas de régularité. Sans régularité, pas d'ancrage.
            </div>
          </div>
          <div style={css.problemCard}>
            <div style={css.problemEmoji}>🎯</div>
            <div style={css.problemTitle}>Pas de suivi personnalisé</div>
            <div style={css.problemDesc}>
              En classe, tout le monde avance au même rythme. Votre enfant a du mal avec « a/à » mais
              maîtrise « ou/où » ? Personne ne s'adapte à <em>ses</em> difficultés.
            </div>
          </div>
        </div>
      </section>

      <div style={css.sectionDivider} />

      {/* ─── LA SOLUTION ─── */}
      <section style={css.section} className="oq-section">
        <div style={css.sectionLabel}>La solution</div>
        <h2 style={css.sectionTitle}>5 minutes par jour qui changent tout</h2>
        <p style={css.sectionSubtitle}>
          OrthoQuest transforme chaque règle d'orthographe en une aventure.
          L'enfant joue, le cerveau mémorise.
        </p>

        {/* Step 1 — Guided mode */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", marginBottom: 64 }} className="oq-two-col">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
              <div style={css.howStepNum}>1</div>
              <div style={css.howStepTitle}>Il découvre la règle, pas par cœur</div>
            </div>
            <div style={css.howStepDesc}>
              Chaque règle commence par un <strong>mode guidé</strong> : un arbre de décision interactif
              qui apprend à votre enfant <em>comment raisonner</em>, pas juste quoi répondre.
              « Est-ce qu'on peut remplacer par <em>avait</em> ? Si oui, c'est <em>a</em>. »
            </div>
          </div>
          <div style={{
            background: T.glass, border: `1px solid ${T.glassBorder}`,
            borderRadius: T.radius, padding: 24, minHeight: 220,
          }}>
            {/* Mini guided mode mockup */}
            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10, fontWeight: 600 }}>MODE GUIDÉ — a / à / as</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
              Il ___ un chat depuis 3 ans.
            </div>
            <div style={{
              padding: "14px 16px", borderRadius: 14, marginBottom: 10,
              background: `${T.primary}15`, border: `1.5px solid ${T.primary}44`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.primary, marginBottom: 4 }}>
                🤔 Est-ce qu'on peut remplacer par « avait » ?
              </div>
              <div style={{ fontSize: 11, color: T.textMuted }}>
                « Il <em>avait</em> un chat depuis 3 ans » — ça marche !
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{
                flex: 1, padding: "10px", borderRadius: 10, textAlign: "center",
                background: `${T.green}22`, border: `1.5px solid ${T.green}`,
                fontSize: 13, fontWeight: 700, color: T.green,
              }}>
                ✓ Oui → c'est « a »
              </div>
              <div style={{
                flex: 1, padding: "10px", borderRadius: 10, textAlign: "center",
                background: "rgba(255,255,255,0.04)", border: `1.5px solid ${T.glassBorder}`,
                fontSize: 13, fontWeight: 600, color: T.textMuted,
              }}>
                Non → c'est « à »
              </div>
            </div>
            <div style={{
              marginTop: 12, padding: "8px 12px", borderRadius: 8,
              background: `${T.green}11`, fontSize: 11, color: T.green,
            }}>
              ✓ Bonne réponse ! C'est le verbe avoir → <strong>a</strong>
            </div>
          </div>
        </div>

        {/* Step 2 — Game mode */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", marginBottom: 64 }} className="oq-two-col oq-reverse">
          <div style={{
            background: T.glass, border: `1px solid ${T.glassBorder}`,
            borderRadius: T.radius, padding: 24, minHeight: 220, order: 0,
          }}>
            {/* Mini quiz + rewards mockup */}
            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10, fontWeight: 600 }}>MODE LIBRE — Session en cours</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: T.textLight }}>Question 18/20</span>
              <span style={{ fontSize: 12, color: T.green }}>17 ✓ · 1 ✗</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.08)", marginBottom: 16, overflow: "hidden" }}>
              <div style={{ width: "90%", height: "100%", background: `linear-gradient(90deg, ${T.primary}, ${T.green})`, borderRadius: 3 }} />
            </div>
            {/* Reward preview */}
            <div style={{
              display: "flex", gap: 12, justifyContent: "center", marginBottom: 16,
              padding: "12px", borderRadius: 12, background: "rgba(255,255,255,0.03)",
            }}>
              {[
                { icon: "🪙", label: "+20", color: T.gold },
                { icon: "🔥", label: "Série 12j", color: T.orange },
                { icon: "⭐", label: "Niv. 3 !", color: T.primary },
              ].map((r, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22 }}>{r.icon}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: r.color, marginTop: 2 }}>{r.label}</div>
                </div>
              ))}
            </div>
            {/* Level progression */}
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              {["🌱", "📖", "⚡", "👑", "💎"].map((icon, i) => (
                <div key={i} style={{
                  flex: 1, textAlign: "center", padding: "6px 0", borderRadius: 8,
                  background: i <= 2 ? `${T.primary}22` : "rgba(255,255,255,0.03)",
                  border: i === 2 ? `1.5px solid ${T.primary}` : `1px solid ${T.glassBorder}`,
                  fontSize: 14, opacity: i <= 2 ? 1 : 0.4,
                }}>
                  {icon}
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: T.textMuted, textAlign: "center", marginTop: 6 }}>
              5 niveaux par règle : de la découverte à la maîtrise totale
            </div>
          </div>
          <div style={{ order: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
              <div style={css.howStepNum}>2</div>
              <div style={css.howStepTitle}>Il s'entraîne comme dans un jeu</div>
            </div>
            <div style={css.howStepDesc}>
              20 questions par session. Des pièces à gagner, une série de jours à maintenir,
              des niveaux à débloquer, une boutique de cosmétiques.
              La boucle de motivation d'un jeu vidéo, au service de l'orthographe.
            </div>
          </div>
        </div>

        {/* Step 3 — Adaptive rhythm */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", marginBottom: 64 }} className="oq-two-col">
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
              <div style={css.howStepNum}>3</div>
              <div style={css.howStepTitle}>L'app s'adapte à son rythme</div>
            </div>
            <div style={css.howStepDesc}>
              Une règle où il se trompe souvent ? Elle revient le lendemain.
              20/20 trois fois de suite ? Elle ne reviendra que dans 2 semaines, puis 1 mois, puis 3 mois.
              <strong> Le rythme de révision s'adapte automatiquement</strong> pour ancrer chaque règle
              dans la mémoire à long terme.
            </div>
          </div>
          <div style={{
            background: T.glass, border: `1px solid ${T.glassBorder}`,
            borderRadius: T.radius, padding: 24, minHeight: 220,
          }}>
            {/* Spaced repetition visualization */}
            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 14, fontWeight: 600 }}>RYTHME DE RÉVISION ADAPTATIF</div>
            {[
              { rule: "a / à / as", status: "Acquis", next: "dans 45 jours", color: T.green, bars: 5 },
              { rule: "ces / ses", status: "En progression", next: "dans 6 jours", color: T.gold, bars: 3 },
              { rule: "leur / leurs", status: "Fragile", next: "demain", color: T.red, bars: 1 },
            ].map((r, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 12px", marginBottom: 8,
                background: "rgba(255,255,255,0.03)", borderRadius: 10,
                border: `1px solid rgba(255,255,255,0.05)`,
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>{r.rule}</div>
                  <div style={{ fontSize: 10, color: T.textMuted }}>Prochaine révision : {r.next}</div>
                </div>
                <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <div key={j} style={{
                      width: 6, height: j < r.bars ? 14 + j * 4 : 10,
                      borderRadius: 3,
                      background: j < r.bars ? r.color : "rgba(255,255,255,0.08)",
                      transition: "all 0.3s",
                    }} />
                  ))}
                </div>
                <div style={{
                  padding: "3px 8px", borderRadius: 6,
                  background: `${r.color}22`, color: r.color,
                  fontSize: 9, fontWeight: 700, whiteSpace: "nowrap",
                }}>
                  {r.status}
                </div>
              </div>
            ))}
            <div style={{
              marginTop: 10, padding: "10px 12px", borderRadius: 8,
              background: `${T.primary}11`, border: `1px dashed ${T.primary}33`,
              fontSize: 11, color: T.primaryLight, textAlign: "center", lineHeight: 1.5,
            }}>
              💡 Plus votre enfant maîtrise une règle, moins elle revient — jusqu'à ce qu'elle soit ancrée définitivement.
            </div>
          </div>
        </div>

        {/* Step 4 — Parent view */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="oq-two-col oq-reverse">
          <div style={{
            background: T.glass, border: `1px solid ${T.glassBorder}`,
            borderRadius: T.radius, padding: 24, minHeight: 220, order: 0,
          }}>
            {/* Mini parent dashboard */}
            <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10, fontWeight: 600 }}>ESPACE PARENT</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
              {[
                { name: "Damien", avatar: "🦊", active: true },
                { name: "Léa", avatar: "🦄", active: false },
              ].map((c, i) => (
                <div key={i} style={{
                  flex: 1, padding: "10px", borderRadius: 12, textAlign: "center",
                  background: c.active ? `${T.primary}15` : "rgba(255,255,255,0.03)",
                  border: c.active ? `1.5px solid ${T.primary}55` : `1px solid ${T.glassBorder}`,
                }}>
                  <div style={{ fontSize: 24 }}>{c.avatar}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, color: c.active ? T.textWhite : T.textMuted }}>{c.name}</div>
                </div>
              ))}
              <div style={{
                flex: 1, padding: "10px", borderRadius: 12, textAlign: "center",
                background: "rgba(255,255,255,0.02)", border: `1px dashed ${T.glassBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column",
              }}>
                <div style={{ fontSize: 20, color: T.textSubtle }}>+</div>
                <div style={{ fontSize: 9, color: T.textSubtle, marginTop: 2 }}>Ajouter</div>
              </div>
            </div>
            {/* Weekly chart */}
            <div style={{ padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.05)` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 600 }}>Cette semaine</span>
                <span style={{ fontSize: 10, color: T.green }}>🔥 12 jours</span>
              </div>
              <div style={{ display: "flex", gap: 4, alignItems: "flex-end", height: 50 }}>
                {[85, 90, 70, 95, 100, 80, 0].map((v, i) => (
                  <div key={i} style={{
                    flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                  }}>
                    <div style={{
                      width: "100%", height: v > 0 ? `${v * 0.45}px` : 4,
                      borderRadius: 4,
                      background: v >= 90 ? T.green : v >= 70 ? T.primary : v > 0 ? T.orange : "rgba(255,255,255,0.06)",
                    }} />
                    <span style={{ fontSize: 8, color: i === 6 ? T.textSubtle : T.textMuted }}>
                      {["L", "M", "M", "J", "V", "S", "D"][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ order: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
              <div style={{ ...css.howStepNum, background: `linear-gradient(135deg, ${T.gold}, ${T.orange})` }}>4</div>
              <div style={css.howStepTitle}>Vous suivez ses progrès</div>
            </div>
            <div style={css.howStepDesc}>
              Un espace parent avec un tableau de bord clair : quelles règles sont acquises,
              lesquelles posent encore problème, combien de jours d'affilée il a joué.
              Ajoutez autant de profils enfants que nécessaire — chacun a son propre parcours.
            </div>
          </div>
        </div>
      </section>

      <div style={css.sectionDivider} />

      {/* ─── REVISION INTELLIGENTE (SM-2 explained simply) ─── */}
      <section style={css.section} className="oq-section">
        <div style={css.smartSection} className="oq-smart-section">
          <div style={css.sectionLabel}>Le secret</div>
          <h2 style={{ ...css.sectionTitle, marginBottom: 8 }}>Un rythme de révision qui s'adapte</h2>
          <p style={{ ...css.sectionSubtitle, marginBottom: 0 }}>
            Pas la peine de tout réviser tout le temps. L'app détecte automatiquement
            ce que votre enfant maîtrise et ce qui a besoin de travail.
          </p>

          <RevisionTimeline />

          <div style={css.smartGrid} className="oq-three-col">
            <div style={css.smartCard}>
              <div style={css.smartIcon}>🔴</div>
              <div style={css.smartLabel}>Encore fragile</div>
              <div style={css.smartDesc}>
                Votre enfant se trompe souvent ?<br />
                La règle revient <strong>tous les jours</strong>  jusqu'à ce qu'il soit à l'aise.
              </div>
            </div>
            <div style={css.smartCard}>
              <div style={css.smartIcon}>🟡</div>
              <div style={css.smartLabel}>En progression</div>
              <div style={css.smartDesc}>
                Il commence à bien répondre ?<br />
                La règle revient <strong>toutes les 1-2 semaines</strong> pour consolider.
              </div>
            </div>
            <div style={css.smartCard}>
              <div style={css.smartIcon}>🟢</div>
              <div style={css.smartLabel}>Acquis !</div>
              <div style={css.smartDesc}>
                20/20 plusieurs fois de suite ?<br />
                La règle ne revient que <strong>tous les 1-3 mois</strong>. C'est ancré.
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={css.sectionDivider} />

      {/* ─── ESPACE PARENT ─── */}
      <section style={css.section} className="oq-section">
        <div style={css.sectionLabel}>Pour les parents</div>
        <h2 style={css.sectionTitle}>Suivez ses progrès sans regarder par-dessus son épaule</h2>
        <p style={css.sectionSubtitle}>
          Un espace parent séparé, protégé par un code envoyé par email.
          Votre enfant joue en autonomie, vous gardez un œil sur sa progression.
        </p>

        <div style={css.parentSection} className="oq-two-col">
          <div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>👶</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Multi-enfants</div>
                  <div style={{ fontSize: 14, color: T.textLight }}>
                    Ajoutez autant de profils que nécessaire. Chacun a son propre parcours, ses propres progrès.
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>📊</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Tableau de bord</div>
                  <div style={{ fontSize: 14, color: T.textLight }}>
                    Voyez en un coup d'œil quelles règles sont maîtrisées, lesquelles nécessitent du travail,
                    et le nombre de jours consécutifs de pratique.
                  </div>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                <span style={{ fontSize: 24 }}>🔒</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>Accès sécurisé</div>
                  <div style={{ fontSize: 14, color: T.textLight }}>
                    L'espace parent est protégé par un code temporaire envoyé sur votre email.
                    Votre enfant ne peut pas modifier les réglages.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <PhoneFrame label="Espace parent">
              <MockParentView />
            </PhoneFrame>
          </div>
        </div>
      </section>

      <div style={css.sectionDivider} />

      {/* ─── RULES COVERED ─── */}
      <section style={css.section} className="oq-section">
        <div style={css.sectionLabel}>Le programme</div>
        <h2 style={css.sectionTitle}>10 règles qui couvrent 80% des fautes courantes</h2>
        <p style={css.sectionSubtitle}>
          Chaque règle contient entre 80 et 100 questions, des fiches mémo,
          et un arbre de décision pour apprendre à raisonner.
        </p>

        <div style={css.rulesGrid}>
          {rules.map((r, i) => (
            <div key={i} style={css.ruleChip}>
              <div style={css.ruleIcon} />
              <span>{r}</span>
            </div>
          ))}
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 14, color: T.textMuted }}>
          Plus de <Counter end={950} suffix="" /> questions · Nouvelles règles ajoutées régulièrement
        </p>
      </section>

      <div style={css.sectionDivider} />

      {/* ─── CHIFFRES ─── */}
      <section style={css.section} className="oq-section">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, textAlign: "center" }} className="oq-four-col">
          {[
            { value: 10, suffix: "", label: "règles d'orthographe" },
            { value: 950, suffix: "+", label: "questions uniques" },
            { value: 5, suffix: " min", label: "par jour suffisent" },
            { value: 0, suffix: " €", label: "pour toujours" },
          ].map((s, i) => (
            <div key={i}>
              <div style={{
                fontFamily: T.fontDisplay, fontSize: 42, fontWeight: 900,
                color: i === 3 ? T.green : T.primary,
              }}>
                <Counter end={s.value} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 14, color: T.textLight, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <div style={css.sectionDivider} />

      {/* ─── GRATUIT ─── */}
      <section style={css.section} className="oq-section">
        <div style={css.freeCard}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✨</div>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
            100% gratuit, sans piège
          </h2>
          <p style={{ fontSize: 16, lineHeight: 1.7, color: T.textLight, marginBottom: 0 }}>
            Pas de pub. Pas d'achats in-app. Pas de données revendues. Pas de version premium cachée.
            <br /><br />
            OrthoQuest est un projet indépendant, créé par un parent pour son enfant,
            et partagé gratuitement avec tous ceux qui en ont besoin.
          </p>
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section style={css.finalCta}>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
          Prêt à transformer l'orthographe en aventure ?
        </h2>
        <p style={{ fontSize: 16, color: T.textLight, marginBottom: 28 }}>
          Créez un compte en 10 secondes et laissez votre enfant découvrir OrthoQuest.
        </p>
        <button style={css.heroCta} onClick={() => navigate('/login')}>
          Commencer gratuitement →
        </button>
      </section>

      {/* ─── FOOTER ─── */}
      <footer style={css.footer}>
        <p>Fait avec ❤️ pour les enfants qui veulent dompter l'orthographe</p>
        <p style={{ marginTop: 4 }}>© 2026 OrthoQuest</p>
      </footer>
    </div>
  );
}

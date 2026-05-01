import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CoinIcon from "../components/CoinIcon.jsx";
import AnnotationOverlay from "../components/AnnotationOverlay.jsx";

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

  // ─── DICTEE SECTION ───
  dicteeCard: {
    background: `linear-gradient(135deg, rgba(251,191,36,0.08), rgba(251,191,36,0.03))`,
    border: `1px solid rgba(251,191,36,0.2)`,
    borderRadius: 28,
    padding: "48px",
    maxWidth: 960,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 40,
    alignItems: "center",
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
    { name: "a / \u00e0 / as", level: 4, icon: "\uD83D\uDC8E", color: T.primary, pct: 100 },
    { name: "ces / ses", level: 3, icon: "\uD83D\uDC51", color: T.gold, pct: 85 },
    { name: "on / ont / on n'", level: 2, icon: "\u26A1", color: T.orange, pct: 60 },
    { name: "ou / o\u00f9", level: 1, icon: "\uD83C\uDF31", color: T.green, pct: 30 },
    { name: "leur / leurs", level: 0, icon: "\uD83D\uDD12", color: T.textSubtle, pct: 0 },
  ];

  return (
    <div style={{ fontSize: 11 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "4px 0" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Bonjour Damien \uD83D\uDC4B</div>
          <div style={{ fontSize: 10, color: T.textMuted }}>S\u00e9rie : 12 jours \uD83D\uDD25</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: T.gold, display: 'inline-flex', alignItems: 'center', gap: 2 }}><CoinIcon size={11} /> 340</span>
          <span style={{ fontSize: 11, color: T.primary }}>\uD83D\uDEE1\uFE0F 2</span>
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

  useEffect(() => {
    if (!revealed && selected === null) {
      const t = setTimeout(() => {}, 500);
      return () => clearTimeout(t);
    }
  }, [revealed, selected]);

  const choices = [
    { id: 0, label: "a", correct: false },
    { id: 1, label: "\u00e0", correct: true },
    { id: 2, label: "as", correct: false },
  ];

  return (
    <div style={{ fontSize: 11, textAlign: "center", padding: "8px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 10, color: T.textMuted }}>Question 7/20</span>
        <span style={{ fontSize: 10, color: T.green }}>6 \u2713</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", marginBottom: 20 }}>
        <div style={{ width: "35%", height: "100%", background: T.primary, borderRadius: 2 }} />
      </div>
      <div style={{
        display: "inline-block", padding: "4px 12px", borderRadius: 20,
        background: `${T.primary}22`, color: T.primary,
        fontSize: 10, fontWeight: 600, marginBottom: 16,
      }}>
        a \u00b7 \u00e0 \u00b7 as
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, lineHeight: 1.4 }}>
        Il va <span style={{
          display: "inline-block", width: 32, borderBottom: `2px solid ${T.primary}`,
          color: revealed ? (selected === 1 ? T.green : T.red) : T.primary,
          fontWeight: 700,
        }}>{revealed && selected !== null ? choices[selected].label : "\u2026"}</span> la plage.
      </div>
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
      {revealed && (
        <div style={{
          marginTop: 16, padding: "10px 12px", borderRadius: 10,
          background: `${T.green}11`, border: `1px solid ${T.green}33`,
          fontSize: 10, color: T.green, textAlign: "left", lineHeight: 1.5,
        }}>
          \u2713 Correct ! On ne peut pas remplacer par \u00ab avait \u00bb, c'est donc <strong>\u00e0</strong> (pr\u00e9position).
        </div>
      )}
    </div>
  );
}

function MockParentView() {
  const children = [
    { name: "Damien", avatar: "\uD83E\uDD8A", streak: 12, rules: "8/17", lastActive: "Aujourd'hui" },
    { name: "L\u00e9a", avatar: "\uD83E\uDD84", streak: 3, rules: "2/17", lastActive: "Hier" },
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
              \uD83D\uDD25 {c.streak}j \u00b7 {c.rules} r\u00e8gles \u00b7 {c.lastActive}
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

// ─── NEW MOCKUP: Dictee ───
function MockDictee() {
  return (
    <div style={{
      background: T.glass, border: `1px solid ${T.glassBorder}`,
      borderRadius: T.radius, padding: 24, minHeight: 220,
    }}>
      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 12, fontWeight: 600 }}>
        DICT\u00c9E \u2014 La chouette enchant\u00e9e
      </div>

      {/* Character + speech bubble */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `linear-gradient(135deg, ${T.primary}33, ${T.primaryDark}33)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, flexShrink: 0,
        }}>
          \uD83E\uDD89
        </div>
        <div style={{
          flex: 1, padding: "10px 14px", borderRadius: "4px 14px 14px 14px",
          background: "rgba(255,255,255,0.05)", border: `1px solid ${T.glassBorder}`,
        }}>
          <div style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.5, color: T.textLight }}>
            L'artiste utilise de l'encre dor\u00e9e.
          </div>
        </div>
      </div>

      {/* Audio play button */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginBottom: 16,
        padding: "8px 12px", borderRadius: 10,
        background: `${T.primary}15`, border: `1px solid ${T.primary}33`,
        cursor: "pointer",
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: `linear-gradient(135deg, ${T.primaryDark}, ${T.primary})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, color: "#fff",
        }}>
          \u25B6
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ width: "65%", height: "100%", background: T.primary, borderRadius: 2 }} />
          </div>
        </div>
        <span style={{ fontSize: 10, color: T.textMuted }}>0:04</span>
      </div>

      {/* Choice buttons */}
      {[
        { label: "parfois", state: "neutral" },
        { label: "parfoix", state: "wrong" },
        { label: "parfoit", state: "neutral" },
      ].map((c, i) => (
        <div key={i} style={{
          padding: "10px 14px", borderRadius: 10, marginBottom: 6,
          background: c.state === "wrong" ? `${T.red}18` : "rgba(255,255,255,0.04)",
          border: `1.5px solid ${c.state === "wrong" ? T.red : T.glassBorder}`,
          fontSize: 14, fontWeight: 600, textAlign: "center",
          color: c.state === "wrong" ? T.red : T.textWhite,
        }}>
          {c.label}
          {c.state === "wrong" && <span style={{ marginLeft: 8, fontSize: 12 }}>\u2717</span>}
        </div>
      ))}
    </div>
  );
}

// ─── NEW MOCKUP: Shop Characters ───
function MockShopCharacters() {
  return (
    <div style={{
      background: T.glass, border: `1px solid ${T.glassBorder}`,
      borderRadius: T.radius, padding: 24, minHeight: 220,
    }}>
      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 14, fontWeight: 600 }}>
        MES PERSONNAGES (5)
      </div>

      {/* Main character card */}
      <div style={{
        display: "flex", gap: 14, padding: "14px", marginBottom: 14,
        background: "rgba(255,255,255,0.04)", borderRadius: 14,
        border: `1px solid rgba(255,255,255,0.06)`,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 14,
          background: `linear-gradient(135deg, ${T.bg3}, ${T.bg2})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 32, border: `2px solid ${T.primary}44`,
        }}>
          \uD83D\uDC3C
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>Panda Samoura\u00ef</div>
          <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 6 }}>Guerrier de l'ombre</div>
          <div style={{
            display: "inline-block", padding: "3px 10px", borderRadius: 6,
            background: `${T.green}22`, color: T.green,
            fontSize: 10, fontWeight: 700,
          }}>
            Poss\u00e9d\u00e9
          </div>
        </div>
      </div>

      {/* Emotion thumbnails row — owned */}
      <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 8, fontWeight: 600 }}>\u00c9MOTIONS</div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {[
          { emoji: "\uD83D\uDEB6", label: "Marche" },
          { emoji: "\uD83D\uDE34", label: "Dodo" },
          { emoji: "\uD83E\uDDD8", label: "Assis" },
        ].map((e, i) => (
          <div key={i} style={{
            flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 10,
            background: "rgba(255,255,255,0.04)", border: `1px solid ${T.glassBorder}`,
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{e.emoji}</div>
            <div style={{ fontSize: 9, color: T.textLight, marginBottom: 3 }}>{e.label}</div>
            <div style={{
              display: "inline-block", padding: "2px 6px", borderRadius: 4,
              background: `${T.green}22`, color: T.green,
              fontSize: 8, fontWeight: 700,
            }}>
              INCLUS
            </div>
          </div>
        ))}
      </div>

      {/* Locked emotions row */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { emoji: "\uD83D\uDE18", label: "Bisou", price: 130 },
          { emoji: "\uD83D\uDC4F", label: "Bravo", price: 130 },
        ].map((e, i) => (
          <div key={i} style={{
            flex: 1, textAlign: "center", padding: "8px 4px", borderRadius: 10,
            background: "rgba(255,255,255,0.02)", border: `1px dashed ${T.glassBorder}`,
            opacity: 0.7,
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{e.emoji}</div>
            <div style={{ fontSize: 9, color: T.textMuted, marginBottom: 3 }}>{e.label}</div>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              padding: "2px 6px", borderRadius: 4,
              background: `${T.gold}18`, color: T.gold,
              fontSize: 8, fontWeight: 700,
            }}>
              <CoinIcon size={8} /> {e.price}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── NEW MOCKUP: Themes List ───
function MockThemesList() {
  const themes = [
    { name: "Dark Blue", status: "default", color: "#4a5568" },
    { name: "Forest Green", status: "install", color: "#2d6a4f" },
    { name: "Aurora", status: "active", color: "#7c3aed" },
    { name: "Midnight Purple", status: "locked", color: "#553c9a" },
  ];

  return (
    <div style={{
      background: T.glass, border: `1px solid ${T.glassBorder}`,
      borderRadius: T.radius, padding: 24, minHeight: 220,
    }}>
      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 14, fontWeight: 600 }}>
        TH\u00c8MES
      </div>

      {themes.map((t, i) => (
        <div key={i} style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 12px", marginBottom: 6,
          background: "rgba(255,255,255,0.03)", borderRadius: 10,
          border: `1px solid ${t.status === "active" ? `${T.green}44` : "rgba(255,255,255,0.05)"}`,
        }}>
          {/* Color swatch */}
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: `linear-gradient(135deg, ${t.color}, ${t.color}88)`,
            border: `2px solid rgba(255,255,255,0.15)`,
          }} />
          <div style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{t.name}</div>
          {t.status === "default" && (
            <span style={{ fontSize: 9, color: T.textSubtle, fontWeight: 600 }}>D\u00e9faut</span>
          )}
          {t.status === "install" && (
            <div style={{
              padding: "4px 10px", borderRadius: 6,
              background: `${T.primary}22`, color: T.primary,
              fontSize: 10, fontWeight: 700, cursor: "pointer",
            }}>
              Installer
            </div>
          )}
          {t.status === "active" && (
            <div style={{
              padding: "4px 10px", borderRadius: 6,
              background: `${T.green}22`, color: T.green,
              fontSize: 10, fontWeight: 700,
            }}>
              ACTIF
            </div>
          )}
          {t.status === "locked" && (
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 3,
              padding: "4px 10px", borderRadius: 6,
              background: `${T.gold}18`, color: T.gold,
              fontSize: 10, fontWeight: 700,
            }}>
              <CoinIcon size={9} /> 200
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── NEW MOCKUP: Level Path ───
function MockLevelPath() {
  const levels = [
    { name: "Bronze", icon: "\uD83E\uDD49", color: "#cd7f32", reached: true },
    { name: "Argent", icon: "\uD83E\uDD48", color: "#c0c0c0", reached: true },
    { name: "Couronne", icon: "\uD83D\uDC51", color: T.gold, reached: true },
    { name: "Diamant", icon: "\uD83D\uDC8E", color: T.primary, reached: true },
  ];

  return (
    <div style={{
      background: T.glass, border: `1px solid ${T.glassBorder}`,
      borderRadius: T.radius, padding: 24, minHeight: 220,
    }}>
      {/* Rule name */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 10,
          background: `linear-gradient(135deg, ${T.primary}33, ${T.primaryDark}33)`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 16,
        }}>
          \uD83D\uDC8E
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>a / \u00e0 / as</div>
          <div style={{ fontSize: 10, color: T.textMuted }}>R\u00e8gle ma\u00eetris\u00e9e</div>
        </div>
      </div>

      {/* Horizontal level path */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 16, position: "relative" }}>
        {levels.map((l, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
            {/* Connector line */}
            {i > 0 && (
              <div style={{
                position: "absolute", top: 16, right: "50%", width: "100%", height: 3,
                background: l.reached ? `linear-gradient(90deg, ${levels[i-1].color}, ${l.color})` : T.glassBorder,
                zIndex: 0,
              }} />
            )}
            {/* Level dot */}
            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: l.reached ? `${l.color}33` : "rgba(255,255,255,0.04)",
              border: `2px solid ${l.reached ? l.color : T.glassBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, zIndex: 1,
              boxShadow: l.reached ? `0 0 12px ${l.color}44` : "none",
            }}>
              {l.icon}
            </div>
            <div style={{ fontSize: 9, color: l.reached ? l.color : T.textSubtle, marginTop: 4, fontWeight: 600 }}>
              {l.name}
            </div>
          </div>
        ))}
      </div>

      {/* Next revision */}
      <div style={{
        padding: "10px 14px", borderRadius: 10,
        background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.05)`,
        marginBottom: 10,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: T.textMuted }}>Prochaine r\u00e9vision : dans 6 jours</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: T.green }}>100%</span>
        </div>
      </div>

      {/* Mastered badge */}
      <div style={{
        textAlign: "center", padding: "8px 14px", borderRadius: 10,
        background: `${T.green}15`, border: `1px solid ${T.green}33`,
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: T.green }}>
          \u2728 Ma\u00eetris\u00e9e \u2014 diamant brillant
        </span>
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
    { label: "Jour 1", desc: "D\u00e9couverte", dots: 5, color: T.primary, opacity: 1 },
    { label: "Jour 3", desc: "Rappel rapide", dots: 3, color: T.primary, opacity: 0.8 },
    { label: "Semaine 2", desc: "Consolidation", dots: 2, color: T.green, opacity: 0.7 },
    { label: "Mois 1", desc: "Ancrage", dots: 1, color: T.green, opacity: 0.6 },
    { label: "Mois 3", desc: "Acquis !", dots: 0, color: T.gold, opacity: 1 },
  ];

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, justifyContent: "center", marginTop: 32 }}>
      {stages.map((s, i) => (
        <div key={i} style={{ flex: 1, textAlign: "center", position: "relative" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, marginBottom: 8, minHeight: 60, justifyContent: "flex-end" }}>
            {Array.from({ length: s.dots }).map((_, j) => (
              <div key={j} style={{
                width: 28, height: 8, borderRadius: 4,
                background: s.color, opacity: s.opacity - j * 0.15,
              }} />
            ))}
            {s.dots === 0 && (
              <div style={{ fontSize: 20 }}>\u2728</div>
            )}
          </div>
          <div style={{
            width: 12, height: 12, borderRadius: "50%",
            background: s.color, margin: "0 auto 6px",
            boxShadow: `0 0 12px ${s.color}44`,
          }} />
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
// LANDING PAGE V1
// Angle: "10 minutes par jour suffisent — mais votre enfant voudra en faire plus"
// ═══════════════════════════════════════
export default function LandingPageV1() {
  const navigate = useNavigate();

  const rules = [
    "a / \u00e0 / as",
    "ces / ses",
    "terminaisons verbales (-er, -\u00e9, -ez, -ais, -ait)",
    "-\u00e9 / -\u00e9e (f\u00e9minin)",
    "Groupes de verbes",
    "leur / leurs",
    "on / ont / on n'",
    "ou / o\u00f9",
    "son / sont",
    "ce / se",
    "pluriel des noms et adjectifs",
    "pluriel en -al / -ou",
    "adverbes en -ment",
    "-ant / -ent",
    "g / gu / ge",
    "participe pass\u00e9 (\u00eatre)",
    "participe pass\u00e9 (ir + groupes)",
  ];

  return (
    <AnnotationOverlay variant="v1">
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
            .oq-dictee-card { grid-template-columns: 1fr !important; }
          }
        `}</style>

        {/* ─── NAV ─── */}
        <nav style={css.nav} className="oq-nav" data-section="nav">
          <div style={css.navLogo}>
            <div style={css.navLogoIcon}>PL</div>
            PrimoLinguo
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
        <section style={css.hero} className="oq-hero" data-section="hero">
          <div style={css.heroText}>
            <div style={css.heroTagline}>Application gratuite</div>
            <h1 style={css.heroTitle}>
              Votre enfant fait toujours les <span style={css.heroHighlight}>m\u00eames fautes</span> d'orthographe ?
            </h1>
            <p style={css.heroDesc}>
              10 minutes par jour suffisent pour ancrer les r\u00e8gles dans la m\u00e9moire \u00e0 long terme.
              Mais ne soyez pas surpris s'il en redemande. <strong>PrimoLinguo</strong> utilise une m\u00e9thode
              scientifique de r\u00e9vision adaptative qui transforme l'orthographe en aventure — et chaque
              r\u00e8gle en d\u00e9fi \u00e0 relever.
            </p>
            <button style={css.heroCta} onClick={() => navigate('/login')}>
              Cr\u00e9er un compte gratuit \u2192
            </button>
            <span style={css.heroCtaSub}>Connexion avec Google \u00b7 Pr\u00eat en 10 secondes</span>
          </div>

          <div style={css.heroVisual}>
            <PhoneFrame label="L'app de votre enfant">
              <MockDashboard />
            </PhoneFrame>
          </div>
        </section>

        <div style={css.sectionDivider} />

        {/* ─── LE PROBL\u00c8ME ─── */}
        <section style={css.section} className="oq-section" data-section="problem">
          <div style={css.sectionLabel}>Le constat</div>
          <h2 style={css.sectionTitle}>Pourquoi les fautes persistent</h2>
          <p style={css.sectionSubtitle}>
            Votre enfant conna\u00eet la r\u00e8gle. Il l'a vue, il a fait l'exercice.
            Et pourtant, \u00e0 la dict\u00e9e suivante, la m\u00eame faute revient. Pourquoi ?
          </p>

          <div style={css.problemGrid}>
            <div style={css.problemCard}>
              <div style={css.problemEmoji}>\uD83D\uDCDD</div>
              <div style={css.problemTitle}>On apprend, puis on oublie</div>
              <div style={css.problemDesc}>
                Sans r\u00e9vision r\u00e9guli\u00e8re, une r\u00e8gle comprise s'efface de la m\u00e9moire
                en quelques semaines. C'est la courbe de l'oubli — et c'est parfaitement normal.
              </div>
            </div>
            <div style={css.problemCard}>
              <div style={css.problemEmoji}>\uD83D\uDE34</div>
              <div style={css.problemTitle}>Les exercices classiques ne motivent pas</div>
              <div style={css.problemDesc}>
                Recopier 10 fois un mot dans un cahier, \u00e7a ne donne pas envie d'y revenir demain.
                Et sans r\u00e9gularit\u00e9, pas d'ancrage dans la m\u00e9moire.
              </div>
            </div>
            <div style={css.problemCard}>
              <div style={css.problemEmoji}>\uD83C\uDFAF</div>
              <div style={css.problemTitle}>Chaque enfant a son propre rythme</div>
              <div style={css.problemDesc}>
                Votre enfant a du mal avec \u00ab a/\u00e0 \u00bb mais ma\u00eetrise \u00ab ou/o\u00f9 \u00bb ?
                Il a besoin d'un programme qui s'adapte \u00e0 ses difficult\u00e9s, pas d'un parcours identique pour tous.
              </div>
            </div>
          </div>
        </section>

        <div style={css.sectionDivider} />

        {/* ─── LA SOLUTION ─── */}
        <section style={css.section} className="oq-section" data-section="solution">
          <div style={css.sectionLabel}>La solution</div>
          <h2 style={css.sectionTitle}>10 minutes par jour qui changent tout</h2>
          <p style={css.sectionSubtitle}>
            PrimoLinguo transforme chaque r\u00e8gle en une aventure. 10 minutes suffisent — mais votre enfant aura envie d'y passer plus de temps.
          </p>

          {/* Step 1 — Guided mode */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", marginBottom: 64 }} className="oq-two-col">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <div style={css.howStepNum}>1</div>
                <div style={css.howStepTitle}>Il d\u00e9couvre la r\u00e8gle, pas par c\u0153ur</div>
              </div>
              <div style={css.howStepDesc}>
                Chaque r\u00e8gle commence par un <strong>mode guid\u00e9</strong> : un arbre de d\u00e9cision interactif
                qui apprend \u00e0 votre enfant <em>comment raisonner</em>, pas juste quoi r\u00e9pondre.
                \u00ab Est-ce qu'on peut remplacer par <em>avait</em> ? Si oui, c'est <em>a</em>. \u00bb
              </div>
            </div>
            <div style={{
              background: T.glass, border: `1px solid ${T.glassBorder}`,
              borderRadius: T.radius, padding: 24, minHeight: 220,
            }}>
              {/* Mini guided mode mockup */}
              <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10, fontWeight: 600 }}>MODE GUID\u00c9 — a / \u00e0 / as</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>
                Il ___ un chat depuis 3 ans.
              </div>
              <div style={{
                padding: "14px 16px", borderRadius: 14, marginBottom: 10,
                background: `${T.primary}15`, border: `1.5px solid ${T.primary}44`,
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.primary, marginBottom: 4 }}>
                  \uD83E\uDD14 Est-ce qu'on peut remplacer par \u00ab avait \u00bb ?
                </div>
                <div style={{ fontSize: 11, color: T.textMuted }}>
                  \u00ab Il <em>avait</em> un chat depuis 3 ans \u00bb — \u00e7a marche !
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{
                  flex: 1, padding: "10px", borderRadius: 10, textAlign: "center",
                  background: `${T.green}22`, border: `1.5px solid ${T.green}`,
                  fontSize: 13, fontWeight: 700, color: T.green,
                }}>
                  \u2713 Oui \u2192 c'est \u00ab a \u00bb
                </div>
                <div style={{
                  flex: 1, padding: "10px", borderRadius: 10, textAlign: "center",
                  background: "rgba(255,255,255,0.04)", border: `1.5px solid ${T.glassBorder}`,
                  fontSize: 13, fontWeight: 600, color: T.textMuted,
                }}>
                  Non \u2192 c'est \u00ab \u00e0 \u00bb
                </div>
              </div>
              <div style={{
                marginTop: 12, padding: "8px 12px", borderRadius: 8,
                background: `${T.green}11`, fontSize: 11, color: T.green,
              }}>
                \u2713 Bonne r\u00e9ponse ! C'est le verbe avoir \u2192 <strong>a</strong>
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
                <span style={{ fontSize: 12, color: T.green }}>17 \u2713 \u00b7 1 \u2717</span>
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
                  { icon: "coin", label: "+20", color: T.gold },
                  { icon: "\uD83D\uDD25", label: "S\u00e9rie 12j", color: T.orange },
                  { icon: "\u2B50", label: "Niv. 3 !", color: T.primary },
                ].map((r, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22 }}>{r.icon === 'coin' ? <CoinIcon size={22} /> : r.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 700, color: r.color, marginTop: 2 }}>{r.label}</div>
                  </div>
                ))}
              </div>
              {/* Level progression */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                {["\uD83C\uDF31", "\uD83D\uDCD6", "\u26A1", "\uD83D\uDC51", "\uD83D\uDC8E"].map((icon, i) => (
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
                5 niveaux par r\u00e8gle : de la d\u00e9couverte \u00e0 la ma\u00eetrise totale
              </div>
            </div>
            <div style={{ order: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <div style={css.howStepNum}>2</div>
                <div style={css.howStepTitle}>Il s'entra\u00eene comme dans un jeu</div>
              </div>
              <div style={css.howStepDesc}>
                20 questions par session. Des pi\u00e8ces \u00e0 gagner, une s\u00e9rie de jours \u00e0 maintenir,
                des niveaux \u00e0 d\u00e9bloquer, une boutique de cosm\u00e9tiques.
                La boucle de motivation d'un jeu vid\u00e9o, au service de l'orthographe.
                <strong> C'est addictif — dans le bon sens.</strong>
              </div>
            </div>
          </div>

          {/* Step 3 — Adaptive rhythm */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", marginBottom: 64 }} className="oq-two-col">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <div style={css.howStepNum}>3</div>
                <div style={css.howStepTitle}>L'app s'adapte \u00e0 son rythme</div>
              </div>
              <div style={css.howStepDesc}>
                Une r\u00e8gle o\u00f9 il se trompe souvent ? Elle revient le lendemain.
                20/20 trois fois de suite ? Elle ne reviendra que dans 2 semaines, puis 1 mois, puis 3 mois.
                <strong> Le rythme de r\u00e9vision s'adapte automatiquement</strong> pour ancrer chaque r\u00e8gle
                dans la m\u00e9moire \u00e0 long terme.
              </div>
            </div>
            <div style={{
              background: T.glass, border: `1px solid ${T.glassBorder}`,
              borderRadius: T.radius, padding: 24, minHeight: 220,
            }}>
              {/* Spaced repetition visualization */}
              <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 14, fontWeight: 600 }}>RYTHME DE R\u00c9VISION ADAPTATIF</div>
              {[
                { rule: "a / \u00e0 / as", status: "Acquis", next: "dans 45 jours", color: T.green, bars: 5 },
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
                    <div style={{ fontSize: 10, color: T.textMuted }}>Prochaine r\u00e9vision : {r.next}</div>
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
                \uD83D\uDCA1 Plus votre enfant ma\u00eetrise une r\u00e8gle, moins elle revient — jusqu'\u00e0 ce qu'elle soit ancr\u00e9e d\u00e9finitivement.
              </div>
            </div>
          </div>

          {/* Step 4 — Dictee mode */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center", marginBottom: 64 }} className="oq-two-col oq-reverse">
            <div style={{ order: 0 }}>
              <MockDictee />
            </div>
            <div style={{ order: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <div style={{ ...css.howStepNum, background: `linear-gradient(135deg, ${T.gold}, ${T.orange})` }}>4</div>
                <div style={css.howStepTitle}>Il s'entra\u00eene avec de vraies dict\u00e9es</div>
              </div>
              <div style={css.howStepDesc}>
                13 dict\u00e9es audio int\u00e9gr\u00e9es, avec plus de 600 mots.
                L'enfant \u00e9coute, il \u00e9crit, il progresse — comme \u00e0 l'\u00e9cole, mais \u00e0 son rythme
                et avec un retour imm\u00e9diat sur chaque mot. Les dict\u00e9es compl\u00e8tent les quiz
                pour ancrer l'orthographe dans un contexte r\u00e9el.
              </div>
            </div>
          </div>

          {/* Step 5 — Parent view */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="oq-two-col">
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
                <div style={{ ...css.howStepNum, background: `linear-gradient(135deg, ${T.green}, #059669)` }}>5</div>
                <div style={css.howStepTitle}>Vous suivez ses progr\u00e8s</div>
              </div>
              <div style={css.howStepDesc}>
                Un espace parent avec un tableau de bord clair : quelles r\u00e8gles sont acquises,
                lesquelles posent encore probl\u00e8me, combien de jours d'affil\u00e9e il a jou\u00e9.
                Ajoutez autant de profils enfants que n\u00e9cessaire — chacun a son propre parcours.
              </div>
            </div>
            <div style={{
              background: T.glass, border: `1px solid ${T.glassBorder}`,
              borderRadius: T.radius, padding: 24, minHeight: 220,
            }}>
              {/* Mini parent dashboard */}
              <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10, fontWeight: 600 }}>ESPACE PARENT</div>
              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                {[
                  { name: "Damien", avatar: "\uD83E\uDD8A", active: true },
                  { name: "L\u00e9a", avatar: "\uD83E\uDD84", active: false },
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
                  <span style={{ fontSize: 10, color: T.green }}>\uD83D\uDD25 12 jours</span>
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
          </div>
        </section>

        <div style={css.sectionDivider} />

        {/* ─── GAMIFICATION — WHAT MAKES IT ADDICTIVE ─── */}
        <section style={css.section} className="oq-section" data-section="game">
          <div style={css.sectionLabel}>La boucle de jeu</div>
          <h2 style={css.sectionTitle}>\u00ab Encore une session, maman ! \u00bb</h2>
          <p style={css.sectionSubtitle}>
            PrimoLinguo utilise les m\u00eames m\u00e9caniques que les jeux pr\u00e9f\u00e9r\u00e9s de votre enfant.
            R\u00e9sultat : il <em>veut</em> r\u00e9viser, pas parce qu'on lui demande — parce que c'est fun.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginTop: 40 }}>
            {/* Card 1: Characters (MockShopCharacters) */}
            <div style={{ ...css.problemCard, padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "24px 24px 0" }}>
                <MockShopCharacters />
              </div>
              <div style={{ padding: "16px 24px 24px" }}>
                <div style={css.problemTitle}>Personnages \u00e0 collectionner</div>
                <div style={css.problemDesc}>
                  Des pi\u00e8ces gagn\u00e9es \u00e0 chaque session permettent de d\u00e9bloquer des personnages et accessoires dans la boutique.
                </div>
              </div>
            </div>

            {/* Card 2: Level progression (MockLevelPath) */}
            <div style={{ ...css.problemCard, padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "24px 24px 0" }}>
                <MockLevelPath />
              </div>
              <div style={{ padding: "16px 24px 24px" }}>
                <div style={css.problemTitle}>Niveaux \u00e0 d\u00e9bloquer</div>
                <div style={css.problemDesc}>
                  Chaque r\u00e8gle a 4 niveaux de ma\u00eetrise. Le cerveau adore cette sensation de progression — et en redemande.
                </div>
              </div>
            </div>

            {/* Card 3: Themes (MockThemesList) */}
            <div style={{ ...css.problemCard, padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "24px 24px 0" }}>
                <MockThemesList />
              </div>
              <div style={{ padding: "16px 24px 24px" }}>
                <div style={css.problemTitle}>Th\u00e8mes \u00e0 d\u00e9bloquer</div>
                <div style={css.problemDesc}>
                  Votre enfant personnalise son interface avec des th\u00e8mes color\u00e9s. Plus il joue, plus il d\u00e9bloque d'options.
                </div>
              </div>
            </div>
          </div>
        </section>

        <div style={css.sectionDivider} />

        {/* ─── REVISION INTELLIGENTE (SM-2 explained simply) ─── */}
        <section style={css.section} className="oq-section" data-section="smart">
          <div style={css.smartSection} className="oq-smart-section">
            <div style={css.sectionLabel}>Le secret</div>
            <h2 style={{ ...css.sectionTitle, marginBottom: 8 }}>Un rythme de r\u00e9vision qui s'adapte</h2>
            <p style={{ ...css.sectionSubtitle, marginBottom: 0 }}>
              Pas la peine de tout r\u00e9viser tout le temps. L'app d\u00e9tecte automatiquement
              ce que votre enfant ma\u00eetrise et ce qui a besoin de travail.
            </p>

            <RevisionTimeline />

            <div style={css.smartGrid} className="oq-three-col">
              <div style={css.smartCard}>
                <div style={css.smartIcon}>\uD83D\uDD34</div>
                <div style={css.smartLabel}>Encore fragile</div>
                <div style={css.smartDesc}>
                  Votre enfant se trompe souvent ?<br />
                  La r\u00e8gle revient <strong>tous les jours</strong> jusqu'\u00e0 ce qu'il soit \u00e0 l'aise.
                </div>
              </div>
              <div style={css.smartCard}>
                <div style={css.smartIcon}>\uD83D\uDFE1</div>
                <div style={css.smartLabel}>En progression</div>
                <div style={css.smartDesc}>
                  Il commence \u00e0 bien r\u00e9pondre ?<br />
                  La r\u00e8gle revient <strong>toutes les 1-2 semaines</strong> pour consolider.
                </div>
              </div>
              <div style={css.smartCard}>
                <div style={css.smartIcon}>\uD83D\uDFE2</div>
                <div style={css.smartLabel}>Acquis !</div>
                <div style={css.smartDesc}>
                  20/20 plusieurs fois de suite ?<br />
                  La r\u00e8gle ne revient que <strong>tous les 1-3 mois</strong>. C'est ancr\u00e9.
                </div>
              </div>
            </div>
          </div>
        </section>

        <div style={css.sectionDivider} />

        {/* ─── ESPACE PARENT ─── */}
        <section style={css.section} className="oq-section" data-section="parent">
          <div style={css.sectionLabel}>Pour les parents</div>
          <h2 style={css.sectionTitle}>Suivez ses progr\u00e8s sans regarder par-dessus son \u00e9paule</h2>
          <p style={css.sectionSubtitle}>
            Un espace parent s\u00e9par\u00e9, prot\u00e9g\u00e9 par un code PIN \u00e0 4 chiffres.
            Votre enfant joue en autonomie, vous gardez un \u0153il sur sa progression.
          </p>

          <div style={css.parentSection} className="oq-two-col">
            <div>
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>\uD83D\uDC76</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>Multi-enfants</div>
                    <div style={{ fontSize: 14, color: T.textLight }}>
                      Ajoutez autant de profils que n\u00e9cessaire. Chacun a son propre parcours, ses propres progr\u00e8s.
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>\uD83D\uDCCA</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>Tableau de bord</div>
                    <div style={{ fontSize: 14, color: T.textLight }}>
                      Voyez en un coup d'\u0153il quelles r\u00e8gles sont ma\u00eetris\u00e9es, lesquelles n\u00e9cessitent du travail,
                      et le nombre de jours cons\u00e9cutifs de pratique.
                    </div>
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
                  <span style={{ fontSize: 24 }}>\uD83D\uDD12</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>Acc\u00e8s s\u00e9curis\u00e9</div>
                    <div style={{ fontSize: 14, color: T.textLight }}>
                      L'espace parent est prot\u00e9g\u00e9 par votre connexion Google.
                      Un code PIN emp\u00eache votre enfant de tricher sur sa flamme.
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
        <section style={css.section} className="oq-section" data-section="program">
          <div style={css.sectionLabel}>Le programme</div>
          <h2 style={css.sectionTitle}>17 r\u00e8gles qui couvrent 80% des fautes courantes</h2>
          <p style={css.sectionSubtitle}>
            Chaque r\u00e8gle contient entre 20 et 300 questions, des fiches m\u00e9mo,
            et un arbre de d\u00e9cision pour apprendre \u00e0 raisonner.
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
            Plus de <Counter end={3300} suffix="" /> questions \u00b7 13 dict\u00e9es \u00b7 600+ mots
          </p>
        </section>

        <div style={css.sectionDivider} />

        {/* ─── CHIFFRES ─── */}
        <section style={css.section} className="oq-section" data-section="stats">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, textAlign: "center" }} className="oq-four-col">
            {[
              { value: 17, suffix: "", label: "r\u00e8gles d'orthographe" },
              { value: 3300, suffix: "+", label: "questions uniques" },
              { value: 10, suffix: " min", label: "par jour suffisent" },
              { value: 0, suffix: " \u20ac", label: "pour toujours" },
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
        <section style={css.section} className="oq-section" data-section="free">
          <div style={css.freeCard}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>\u2728</div>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
              100% gratuit, sans pi\u00e8ge
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: T.textLight, marginBottom: 0 }}>
              Pas de pub. Pas d'achats in-app. Pas de donn\u00e9es revendues. Pas de version premium cach\u00e9e.
              <br /><br />
              PrimoLinguo est un projet ind\u00e9pendant, cr\u00e9\u00e9 par un parent pour son enfant,
              et partag\u00e9 gratuitement avec tous ceux qui en ont besoin.
            </p>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section style={css.finalCta} data-section="cta">
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
            Pr\u00eat \u00e0 transformer l'orthographe en aventure ?
          </h2>
          <p style={{ fontSize: 16, color: T.textLight, marginBottom: 28 }}>
            Cr\u00e9ez un compte en 10 secondes et laissez votre enfant d\u00e9couvrir PrimoLinguo.
            10 minutes par jour suffisent — mais il voudra en faire plus.
          </p>
          <button style={css.heroCta} onClick={() => navigate('/login')}>
            Commencer gratuitement \u2192
          </button>
        </section>

        {/* ─── FOOTER ─── */}
        <footer style={css.footer} data-section="footer">
          <p>Fait avec \u2764\uFE0F pour les enfants qui veulent dompter l'orthographe</p>
          <p style={{ marginTop: 8 }}>
            <a href="/legal" style={{ color: T.textSubtle, textDecoration: 'none', borderBottom: `1px solid ${T.glassBorder}` }}>
              Mentions l\u00e9gales & Confidentialit\u00e9
            </a>
          </p>
          <p style={{ marginTop: 4 }}>\u00a9 2026 PrimoLinguo</p>
        </footer>
      </div>
    </AnnotationOverlay>
  );
}

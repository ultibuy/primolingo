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

  // ─── DICTEE SECTION ───
  dicteeSection: {
    background: `linear-gradient(135deg, rgba(251,191,36,0.08), rgba(251,191,36,0.03))`,
    border: `1px solid rgba(251,191,36,0.15)`,
    borderRadius: 28,
    padding: "56px 48px",
    margin: "0 auto",
    maxWidth: 960,
  },
  dicteeGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 20,
    marginTop: 32,
  },
  dicteeCard: {
    background: "rgba(255,255,255,0.04)",
    border: `1px solid ${T.glassBorder}`,
    borderRadius: T.radiusSm,
    padding: "24px 20px",
    textAlign: "center",
  },
  dicteeStats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
    marginTop: 28,
  },
  dicteeStat: {
    textAlign: "center",
    padding: "12px",
    background: "rgba(255,255,255,0.03)",
    borderRadius: T.radiusSm,
    border: `1px solid ${T.glassBorder}`,
  },
};

// ─── Mini App Mockups ───

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, padding: "4px 0" }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700 }}>Bonjour Damien 👋</div>
          <div style={{ fontSize: 10, color: T.textMuted }}>Série : 12 jours 🔥</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: T.gold, display: 'inline-flex', alignItems: 'center', gap: 2 }}><CoinIcon size={11} /> 340</span>
          <span style={{ fontSize: 11, color: T.primary }}>🛡️ 2</span>
        </div>
      </div>
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

  const choices = [
    { id: 0, label: "a", correct: false },
    { id: 1, label: "à", correct: true },
    { id: 2, label: "as", correct: false },
  ];

  return (
    <div style={{ fontSize: 11, textAlign: "center", padding: "8px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 10, color: T.textMuted }}>Question 7/20</span>
        <span style={{ fontSize: 10, color: T.green }}>6 ✓</span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "rgba(255,255,255,0.08)", marginBottom: 20 }}>
        <div style={{ width: "35%", height: "100%", background: T.primary, borderRadius: 2 }} />
      </div>
      <div style={{
        display: "inline-block", padding: "4px 12px", borderRadius: 20,
        background: `${T.primary}22`, color: T.primary,
        fontSize: 10, fontWeight: 600, marginBottom: 16,
      }}>
        a · à · as
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 24, lineHeight: 1.4 }}>
        Il va <span style={{
          display: "inline-block", width: 32, borderBottom: `2px solid ${T.primary}`,
          color: revealed ? (selected === 1 ? T.green : T.red) : T.primary,
          fontWeight: 700,
        }}>{revealed && selected !== null ? choices[selected].label : "…"}</span> la plage.
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
          ✓ Correct ! On ne peut pas remplacer par « avait », c'est donc <strong>à</strong> (préposition).
        </div>
      )}
    </div>
  );
}

function MockParentView() {
  const children = [
    { name: "Damien", avatar: "🦊", streak: 12, rules: "8/17", lastActive: "Aujourd'hui" },
    { name: "Léa", avatar: "🦄", streak: 3, rules: "2/17", lastActive: "Hier" },
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

// ─── NEW V3 Mockup: Dictee ───
function MockDictee() {
  return (
    <div style={{
      background: T.glass, border: `1px solid ${T.glassBorder}`,
      borderRadius: T.radius, padding: 24, minHeight: 220,
    }}>
      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10, fontWeight: 600 }}>
        DICTÉE — La chouette enchantée
      </div>
      {/* Character + speech bubble */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 12,
          background: `linear-gradient(135deg, ${T.primaryDark}, ${T.primary})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22,
        }}>
          🦉
        </div>
        <div style={{
          flex: 1, padding: "10px 14px", borderRadius: "4px 14px 14px 14px",
          background: "rgba(255,255,255,0.06)", border: `1px solid ${T.glassBorder}`,
          fontSize: 13, color: T.textLight, lineHeight: 1.5, fontStyle: "italic",
        }}>
          L'artiste utilise de l'encre dorée.
        </div>
      </div>
      {/* Word choices */}
      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 8, fontWeight: 600 }}>
        Comment s'écrit ce mot ?
      </div>
      {[
        { label: "parfois", correct: true, state: null },
        { label: "parfoix", correct: false, state: "wrong" },
        { label: "parfoit", correct: false, state: null },
      ].map((w, i) => (
        <div key={i} style={{
          padding: "10px 14px", borderRadius: 10, marginBottom: 6,
          background: w.state === "wrong" ? `${T.red}15` : "rgba(255,255,255,0.04)",
          border: `1.5px solid ${w.state === "wrong" ? T.red : T.glassBorder}`,
          fontSize: 14, fontWeight: 600, cursor: "pointer",
          color: w.state === "wrong" ? T.red : T.textWhite,
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <span>{w.label}</span>
          {w.state === "wrong" && <span style={{ fontSize: 12 }}>✗</span>}
        </div>
      ))}
      {/* Audio play */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8, marginTop: 10,
        padding: "8px 12px", borderRadius: 8,
        background: `${T.primary}15`, border: `1px solid ${T.primary}33`,
      }}>
        <div style={{
          width: 28, height: 28, borderRadius: "50%",
          background: `linear-gradient(135deg, ${T.primaryDark}, ${T.primary})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, color: "#fff",
        }}>
          ▶
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ width: "45%", height: "100%", background: T.primary, borderRadius: 2 }} />
          </div>
        </div>
        <span style={{ fontSize: 10, color: T.textMuted }}>0:12</span>
      </div>
    </div>
  );
}

// ─── NEW V3 Mockup: Shop Characters ───
function MockShopCharacters() {
  return (
    <div style={{
      background: T.glass, border: `1px solid ${T.glassBorder}`,
      borderRadius: T.radius, padding: 24, minHeight: 220,
    }}>
      <div style={{ fontSize: 11, color: T.textMuted, marginBottom: 10, fontWeight: 600 }}>
        MES PERSONNAGES (5)
      </div>
      {/* Main character display */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14, marginBottom: 16,
        padding: "14px", borderRadius: 14,
        background: "rgba(255,255,255,0.04)", border: `1px solid ${T.glassBorder}`,
      }}>
        <div style={{
          width: 56, height: 56, borderRadius: 16,
          background: `linear-gradient(135deg, ${T.bg3}, ${T.bg2})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36, border: `2px solid ${T.gold}`,
        }}>
          🐼
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>Panda Samuraï</div>
          <div style={{
            display: "inline-block", padding: "2px 8px", borderRadius: 6,
            background: `${T.gold}22`, color: T.gold,
            fontSize: 9, fontWeight: 700,
          }}>
            POSSÉDÉ
          </div>
        </div>
      </div>
      {/* Emotion thumbnails */}
      <div style={{ fontSize: 10, color: T.textMuted, marginBottom: 8, fontWeight: 600 }}>Émotions</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
        {[
          { label: "Marche", emoji: "🚶", owned: true },
          { label: "Dodo", emoji: "😴", owned: true },
          { label: "Assis", emoji: "🪑", owned: true },
          { label: "Danse", emoji: "💃", price: 50, owned: false },
          { label: "Victoire", emoji: "🏆", price: 80, owned: false },
          { label: "Surprise", emoji: "😲", price: 60, owned: false },
        ].map((em, i) => (
          <div key={i} style={{
            padding: "8px 4px", borderRadius: 10, textAlign: "center",
            background: em.owned ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
            border: `1px solid ${em.owned ? T.glassBorder : "rgba(255,255,255,0.05)"}`,
            opacity: em.owned ? 1 : 0.6,
          }}>
            <div style={{ fontSize: 20, marginBottom: 3 }}>{em.emoji}</div>
            <div style={{ fontSize: 9, fontWeight: 600, color: T.textLight, marginBottom: 2 }}>{em.label}</div>
            {em.owned ? (
              <div style={{
                fontSize: 8, fontWeight: 700, color: T.green,
                background: `${T.green}15`, borderRadius: 4, padding: "1px 6px",
                display: "inline-block",
              }}>INCLUS</div>
            ) : (
              <div style={{
                fontSize: 8, fontWeight: 700, color: T.gold,
                display: "inline-flex", alignItems: "center", gap: 2,
              }}>
                <CoinIcon size={8} /> {em.price}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── NEW V3 Mockup: Level Path ───
function MockLevelPath() {
  const levels = [
    { label: "Bronze", icon: "🥄", color: "#cd7f32", reached: true },
    { label: "Argent", icon: "🪙", color: "#c0c0c0", reached: true },
    { label: "Couronne", icon: "👑", color: T.gold, reached: true },
    { label: "Diamant", icon: "💎", color: T.primary, reached: false },
  ];

  return (
    <div style={{
      background: T.glass, border: `1px solid ${T.glassBorder}`,
      borderRadius: T.radius, padding: 24, minHeight: 220,
    }}>
      {/* Rule header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: `linear-gradient(135deg, ${T.primaryDark}, ${T.primary})`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18,
        }}>
          💎
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>a / à / as</div>
          <div style={{ fontSize: 10, color: T.textMuted }}>Règle de grammaire</div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 18, fontWeight: 900, color: T.green }}>100%</div>
        </div>
      </div>

      {/* Horizontal path */}
      <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 16, padding: "8px 0" }}>
        {levels.map((lvl, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{
              width: 42, height: 42, borderRadius: "50%",
              background: lvl.reached ? `${lvl.color}22` : "rgba(255,255,255,0.04)",
              border: `2px solid ${lvl.reached ? lvl.color : T.glassBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, position: "relative", zIndex: 2,
              boxShadow: lvl.reached ? `0 0 12px ${lvl.color}33` : "none",
            }}>
              {lvl.icon}
            </div>
            {i < levels.length - 1 && (
              <div style={{
                flex: 1, height: 3, borderRadius: 2,
                background: lvl.reached ? `linear-gradient(90deg, ${lvl.color}, ${levels[i + 1].reached ? levels[i + 1].color : T.glassBorder})` : T.glassBorder,
              }} />
            )}
          </div>
        ))}
      </div>
      {/* Level labels */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16 }}>
        {levels.map((lvl, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 9, fontWeight: 700, color: lvl.reached ? lvl.color : T.textSubtle }}>{lvl.label}</div>
          </div>
        ))}
      </div>

      {/* Next revision */}
      <div style={{
        padding: "10px 14px", borderRadius: 10,
        background: "rgba(255,255,255,0.03)", border: `1px solid rgba(255,255,255,0.06)`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        marginBottom: 8,
      }}>
        <div>
          <div style={{ fontSize: 11, color: T.textMuted }}>Prochaine révision</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: T.textWhite }}>dans 6 jours</div>
        </div>
        <div style={{
          padding: "4px 12px", borderRadius: 8,
          background: `${T.green}22`, color: T.green,
          fontSize: 11, fontWeight: 700,
        }}>
          Maîtrisée
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
// V3 LANDING PAGE — "Grammaire ET dictée"
// ═══════════════════════════════════════
export default function LandingPageV3() {
  const navigate = useNavigate();

  const rules = [
    "a / à / as",
    "ces / ses",
    "terminaisons verbales (-er, -é, -ez, -ais, -ait)",
    "-é / -ée (féminin)",
    "Groupes de verbes",
    "leur / leurs",
    "on / ont / on n'",
    "ou / où",
    "son / sont",
    "ce / se",
    "pluriel des noms et adjectifs",
    "pluriel en -al / -ou",
    "adverbes en -ment",
    "-ant / -ent",
    "g / gu / ge",
    "participe passé avec être",
    "participe passé ir + groupes",
  ];

  return (
    <AnnotationOverlay variant="v3">
      <div style={css.page}>
        <style>{`
          @media (max-width: 768px) {
            .oq-nav { padding: 12px 16px !important; }
            .oq-hero { padding: 40px 20px 32px !important; gap: 32px !important; }
            .oq-two-col { grid-template-columns: 1fr !important; gap: 32px !important; }
            .oq-reverse > :first-child { order: 2 !important; }
            .oq-reverse > :last-child { order: 1 !important; }
            .oq-four-col { grid-template-columns: repeat(2, 1fr) !important; }
            .oq-six-col { grid-template-columns: repeat(2, 1fr) !important; }
            .oq-three-col { grid-template-columns: 1fr !important; }
            .oq-smart-section { padding: 32px 20px !important; }
            .oq-dictee-section { padding: 32px 20px !important; }
            .oq-section { padding: 56px 20px !important; }
          }
        `}</style>

        {/* ─── NAV ─── */}
        <nav style={css.nav} className="oq-nav">
          <div style={css.navLogo}>
            <div style={css.navLogoIcon}>PL</div>
            PrimoLingo
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
        <section data-section="hero" style={css.hero} className="oq-hero">
          <div style={css.heroText}>
            <div style={css.heroTagline}>Le compagnon complet pour l'orthographe</div>
            <h1 style={css.heroTitle}>
              Grammaire et dictée : <span style={css.heroHighlight}>tout l'orthographe</span> en une app
            </h1>
            <p style={css.heroDesc}>
              17 règles de grammaire, 13 dictées à thème, un système de révision intelligent — et un enfant qui progresse en autonomie. <strong>10 minutes par jour suffisent</strong>, mais il en redemandera.
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

        {/* ─── LE PROBLEME ─── */}
        <section data-section="problem" style={css.section} className="oq-section">
          <div style={css.sectionLabel}>Le constat</div>
          <h2 style={css.sectionTitle}>Pourquoi les fautes persistent</h2>
          <p style={css.sectionSubtitle}>
            Votre enfant connaît la règle. Il l'a vue, il a fait l'exercice. Et pourtant, la même faute revient. Pourquoi ?
          </p>

          <div style={css.problemGrid}>
            <div style={css.problemCard}>
              <div style={css.problemEmoji}>🧠</div>
              <div style={css.problemTitle}>La mémoire a besoin de rappels</div>
              <div style={css.problemDesc}>
                Une règle comprise aujourd'hui sera oubliée dans 3 semaines sans révision. C'est la courbe de l'oubli — et c'est tout à fait normal.
              </div>
            </div>
            <div style={css.problemCard}>
              <div style={css.problemEmoji}>😴</div>
              <div style={css.problemTitle}>Les exercices répétitifs découragent</div>
              <div style={css.problemDesc}>
                Recopier des mots 10 fois ne crée pas de motivation. Et sans envie, pas de régularité. Sans régularité, pas de progrès durables.
              </div>
            </div>
            <div style={css.problemCard}>
              <div style={css.problemEmoji}>🎯</div>
              <div style={css.problemTitle}>Chaque enfant a ses propres difficultés</div>
              <div style={css.problemDesc}>
                Votre enfant maîtrise « ou/où » mais bloque sur « a/à » ? Il a besoin d'un programme qui s'adapte à lui.
              </div>
            </div>
          </div>
        </section>

        <div style={css.sectionDivider} />

        {/* ─── LA SOLUTION ─── */}
        <section data-section="solution" style={css.section} className="oq-section">
          <div style={css.sectionLabel}>La solution</div>
          <h2 style={css.sectionTitle}>Deux modes d'entraînement complémentaires</h2>
          <p style={css.sectionSubtitle}>
            La grammaire pour les règles, la dictée pour l'orthographe d'usage. Ensemble, ils couvrent tout ce dont votre enfant a besoin.
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
                  { icon: "coin", label: "+20", color: T.gold },
                  { icon: "🔥", label: "Série 12j", color: T.orange },
                  { icon: "⭐", label: "Niv. 3 !", color: T.primary },
                ].map((r, i) => (
                  <div key={i} style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 22 }}>{r.icon === 'coin' ? <CoinIcon size={22} /> : r.icon}</div>
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
            <div>
              <MockLevelPath />
            </div>
          </div>

          {/* Step 4 — Parent view */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }} className="oq-two-col oq-reverse">
            <div style={{ order: 0, display: "flex", justifyContent: "center" }}>
              <PhoneFrame label="Espace parent">
                <MockParentView />
              </PhoneFrame>
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

        {/* ─── MODE DICTEE ─── */}
        <section data-section="dictee" style={css.section} className="oq-section">
          <div style={css.dicteeSection} className="oq-dictee-section">
            <div style={{ ...css.sectionLabel, color: T.gold }}>Mode Dictée</div>
            <h2 style={{ ...css.sectionTitle, marginBottom: 8 }}>13 dictées à thème pour l'orthographe d'usage</h2>
            <p style={{ ...css.sectionSubtitle, marginBottom: 32 }}>
              Harry Potter, Casa Batlló, les Moaïs de l'île de Pâques... Des textes captivants avec 3 niveaux de difficulté.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, alignItems: "start", marginBottom: 36 }} className="oq-two-col">
              <MockDictee />
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {[
                  { icon: "🌱", level: "Aventurier", color: T.green, desc: "Les mots courants du texte. Idéal pour commencer en douceur." },
                  { icon: "⚡", level: "Héros", color: T.gold, desc: "Des mots plus complexes pour progresser. Le vocabulaire s'enrichit." },
                  { icon: "👑", level: "Légende", color: T.primary, desc: "Le texte complet. La dictée ultime pour les plus courageux." },
                ].map((lv, i) => (
                  <div key={i} style={{
                    padding: "16px 18px", borderRadius: 14,
                    background: "rgba(255,255,255,0.04)", border: `1px solid ${T.glassBorder}`,
                    display: "flex", alignItems: "flex-start", gap: 14,
                  }}>
                    <div style={{ fontSize: 28, lineHeight: 1 }}>{lv.icon}</div>
                    <div>
                      <div style={{ fontFamily: T.fontDisplay, fontWeight: 700, fontSize: 16, marginBottom: 4, color: lv.color }}>
                        {lv.level}
                      </div>
                      <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.5 }}>
                        {lv.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={css.dicteeStats} className="oq-three-col">
              <div style={css.dicteeStat}>
                <div style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 900, color: T.gold }}>600+</div>
                <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>mots</div>
              </div>
              <div style={css.dicteeStat}>
                <div style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 900, color: T.gold }}>3</div>
                <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>niveaux</div>
              </div>
              <div style={css.dicteeStat}>
                <div style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 900, color: T.gold }}>🔊</div>
                <div style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>écoute audio intégrée</div>
              </div>
            </div>
          </div>
        </section>

        <div style={css.sectionDivider} />

        {/* ─── REVISION INTELLIGENTE ─── */}
        <section data-section="smart" style={css.section} className="oq-section">
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
                  La règle revient <strong>tous les jours</strong> jusqu'à ce qu'il soit à l'aise.
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
        <section data-section="parent" style={css.section} className="oq-section">
          <div style={css.sectionLabel}>Pour les parents</div>
          <h2 style={css.sectionTitle}>Suivez ses progrès sans regarder par-dessus son épaule</h2>
          <p style={css.sectionSubtitle}>
            Un espace parent séparé, protégé par un code PIN à 4 chiffres.
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
                      L'espace parent est protégé par votre connexion Google.
                      Un code PIN empêche votre enfant de tricher sur sa flamme.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "center" }}>
              <MockShopCharacters />
            </div>
          </div>
        </section>

        <div style={css.sectionDivider} />

        {/* ─── RULES COVERED ─── */}
        <section data-section="program" style={css.section} className="oq-section">
          <div style={css.sectionLabel}>Le programme</div>
          <h2 style={css.sectionTitle}>17 règles qui couvrent 80% des fautes courantes</h2>
          <p style={css.sectionSubtitle}>
            Chaque règle contient entre 20 et 300 questions, des fiches mémo, et un arbre de décision pour apprendre à raisonner.
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
            Plus de <Counter end={3300} suffix="" /> questions · Nouvelles règles ajoutées régulièrement
          </p>
        </section>

        <div style={css.sectionDivider} />

        {/* ─── CHIFFRES ─── */}
        <section data-section="stats" style={css.section} className="oq-section">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 20, textAlign: "center" }} className="oq-six-col">
            {[
              { value: 17, suffix: "", label: "règles de grammaire", color: T.primary },
              { value: 3300, suffix: "+", label: "questions", color: T.primary },
              { value: 13, suffix: "", label: "dictées à thème", color: T.gold },
              { value: 600, suffix: "+", label: "mots", color: T.gold },
              { value: 10, suffix: " min", label: "par jour suffisent", color: T.primary },
              { value: 0, suffix: " €", label: "pour toujours", color: T.green },
            ].map((s, i) => (
              <div key={i}>
                <div style={{
                  fontFamily: T.fontDisplay, fontSize: 36, fontWeight: 900,
                  color: s.color,
                }}>
                  <Counter end={s.value} suffix={s.suffix} />
                </div>
                <div style={{ fontSize: 13, color: T.textLight, marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        <div style={css.sectionDivider} />

        {/* ─── GRATUIT ─── */}
        <section data-section="free" style={css.section} className="oq-section">
          <div style={css.freeCard}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✨</div>
            <h2 style={{ fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 800, marginBottom: 12 }}>
              100% gratuit, sans piège
            </h2>
            <p style={{ fontSize: 16, lineHeight: 1.7, color: T.textLight, marginBottom: 0 }}>
              Pas de pub. Pas d'achats in-app. Pas de données revendues. Pas de version premium cachée.
              <br /><br />
              PrimoLingo est un projet indépendant, créé par un parent pour son enfant,
              et partagé gratuitement avec tous ceux qui en ont besoin.
            </p>
          </div>
        </section>

        {/* ─── FINAL CTA ─── */}
        <section data-section="cta" style={css.finalCta}>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 32, fontWeight: 800, marginBottom: 16 }}>
            Prêt à transformer l'orthographe en aventure ?
          </h2>
          <p style={{ fontSize: 16, color: T.textLight, marginBottom: 28 }}>
            Créez un compte en 10 secondes et laissez votre enfant découvrir PrimoLingo.
          </p>
          <button style={css.heroCta} onClick={() => navigate('/login')}>
            Commencer gratuitement →
          </button>
        </section>

        {/* ─── FOOTER ─── */}
        <footer style={css.footer}>
          <p>Fait avec ❤ pour les enfants qui veulent dompter l'orthographe</p>
          <p style={{ marginTop: 8 }}>
            <a href="/legal" style={{ color: T.textSubtle, textDecoration: 'none', borderBottom: `1px solid ${T.glassBorder}` }}>
              Mentions légales & Confidentialité
            </a>
          </p>
          <p style={{ marginTop: 4 }}>© 2026 PrimoLingo</p>
        </footer>
      </div>
    </AnnotationOverlay>
  );
}

import { useState, useEffect } from "react";

// ─── Design tokens from orthographe-app ───
const T = {
  bg1: "#1e1e2e",
  bg2: "#2d2b55",
  primary: "#a78bfa",
  accent: "#c4b5fd",
  gold: "#fbbf24",
  goldLight: "#fde68a",
  blue: "#60a5fa",
  green: "#4ade80",
  orange: "#fd6e1c",
  coral: "#f87171",
  cyan: "#67e8f9",
  white: "#e2e2e2",
  muted: "rgba(255,255,255,0.45)",
  glass: "rgba(255,255,255,0.05)",
  glassBorder: "rgba(255,255,255,0.08)",
  fontBody: "'Plus Jakarta Sans', 'Avenir Next', 'Trebuchet MS', sans-serif",
  fontDisplay: "'Outfit', 'Avenir Next Condensed', 'Trebuchet MS', sans-serif",
};

const grad = `linear-gradient(135deg, ${T.bg1} 0%, ${T.bg2} 100%)`;

// ─── Shared styles ───
const cardBase = {
  borderRadius: 24,
  border: `1px solid ${T.glassBorder}`,
  background: T.glass,
  padding: "1.2rem",
  transition: "all 0.2s ease",
};

const btnBase = {
  border: "none",
  borderRadius: 16,
  padding: "0.85rem 1.6rem",
  fontFamily: T.fontDisplay,
  fontWeight: 700,
  fontSize: 15,
  cursor: "pointer",
  transition: "all 0.15s ease",
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};

// ─── SVG Icons (matching app style) ───
const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const ShieldIcon = ({ size = 24, color = T.primary }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="M9 12l2 2 4-4" stroke={color}/>
  </svg>
);

const ChildIcon = ({ size = 24, color = T.gold }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M5.5 21c0-3.59 2.91-6.5 6.5-6.5s6.5 2.91 6.5 6.5"/>
  </svg>
);

const LockIcon = ({ size = 24, color = T.coral }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

const GamepadIcon = ({ size = 24, color = T.green }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" y1="12" x2="10" y2="12"/><line x1="8" y1="10" x2="8" y2="14"/>
    <line x1="15" y1="13" x2="15.01" y2="13"/><line x1="18" y1="11" x2="18.01" y2="11"/>
    <path d="M17.32 5H6.68a4 4 0 00-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 003 3c1.11 0 2.08-.474 2.773-1.227L10 15h4l2.227 2.773A3.64 3.64 0 0019 19a3 3 0 003-3c0-1.544-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.152A4 4 0 0017.32 5z"/>
  </svg>
);

const ChartIcon = ({ size = 24, color = T.blue }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
  </svg>
);

const CogIcon = ({ size = 24, color = T.accent }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/>
  </svg>
);

const ArrowRight = ({ size = 20, color = T.muted }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const CheckIcon = ({ size = 18, color = T.green }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const CrossIcon = ({ size = 18, color = T.coral }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const EyeIcon = ({ size = 20, color = T.coral }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);

// ─── Reusable Components ───

const GlassCard = ({ children, style = {}, onClick, hoverable = false }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      style={{
        ...cardBase,
        ...(hoverable && hovered ? { background: "rgba(255,255,255,0.08)", transform: "translateY(-2px)", boxShadow: "0 12px 40px rgba(0,0,0,0.3)" } : {}),
        ...style,
      }}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </div>
  );
};

const Pill = ({ children, color = T.primary, style = {} }) => (
  <span style={{
    display: "inline-block",
    padding: "3px 12px",
    borderRadius: 99,
    background: color + "22",
    color,
    fontSize: 11,
    fontWeight: 700,
    fontFamily: T.fontDisplay,
    letterSpacing: 1.2,
    textTransform: "uppercase",
    ...style,
  }}>{children}</span>
);

const SectionTitle = ({ children, sub }) => (
  <div style={{ marginBottom: 16 }}>
    <h2 style={{
      fontFamily: T.fontDisplay,
      fontSize: 22,
      fontWeight: 800,
      color: T.white,
      margin: 0,
    }}>{children}</h2>
    {sub && <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.muted, margin: "4px 0 0" }}>{sub}</p>}
  </div>
);

const StepNumber = ({ n, color = T.primary, active = false }) => (
  <div style={{
    width: 36, height: 36, borderRadius: 12,
    background: active ? color : color + "22",
    color: active ? "#fff" : color,
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 16,
    flexShrink: 0,
    transition: "all 0.3s ease",
    boxShadow: active ? `0 0 20px ${color}44` : "none",
  }}>{n}</div>
);

const FlowArrow = ({ vertical = false }) => (
  <div style={{
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: vertical ? "6px 0" : "0 4px",
    transform: vertical ? "rotate(90deg)" : "none",
  }}>
    <ArrowRight size={18} color={T.primary + "66"} />
  </div>
);

// ─── Screens ───

// 1. Landing / Google Connect
const ScreenLanding = ({ onNext }) => (
  <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
    <div style={{
      width: 80, height: 80, borderRadius: 24,
      background: `linear-gradient(135deg, ${T.primary}33, ${T.blue}33)`,
      display: "flex", alignItems: "center", justifyContent: "center",
      margin: "0 auto 20px",
    }}>
      <GamepadIcon size={40} color={T.primary} />
    </div>
    <h1 style={{
      fontFamily: T.fontDisplay, fontSize: 28, fontWeight: 800,
      color: T.white, margin: "0 0 6px",
    }}>Orthographe App</h1>
    <p style={{ fontFamily: T.fontBody, fontSize: 14, color: T.muted, margin: "0 0 32px" }}>
      L'orthographe, version fun 🎮
    </p>

    <button
      onClick={onNext}
      style={{
        ...btnBase,
        background: "#fff",
        color: "#333",
        fontSize: 16,
        padding: "14px 28px",
        borderRadius: 99,
        boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
      }}
    >
      <GoogleIcon /> Se connecter avec Google
    </button>

    <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.muted, marginTop: 20, maxWidth: 280, margin: "20px auto 0" }}>
      Connexion sécurisée OAuth 2.0 — aucun mot de passe à créer
    </p>
  </div>
);

// 2. Profile Chooser (after login)
const ScreenProfileChooser = ({ onParent, onChild }) => (
  <div style={{ padding: "1.5rem 1rem", textAlign: "center" }}>
    <Pill color={T.green} style={{ marginBottom: 12 }}>Connecté</Pill>
    <h2 style={{
      fontFamily: T.fontDisplay, fontSize: 22, fontWeight: 800,
      color: T.white, margin: "0 0 4px",
    }}>Bonjour Luc 👋</h2>
    <p style={{ fontFamily: T.fontBody, fontSize: 13, color: T.muted, margin: "0 0 28px" }}>
      Qui utilise l'app ?
    </p>

    <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
      <GlassCard hoverable onClick={onParent} style={{ cursor: "pointer", padding: "1.5rem 1.2rem", flex: 1, maxWidth: 180, textAlign: "center" }}>
        <ShieldIcon size={36} color={T.primary} />
        <div style={{ fontFamily: T.fontDisplay, fontSize: 15, fontWeight: 700, color: T.white, marginTop: 10 }}>Espace Parent</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.muted, marginTop: 4 }}>Paramètres & stats</div>
      </GlassCard>

      <GlassCard hoverable onClick={onChild} style={{ cursor: "pointer", padding: "1.5rem 1.2rem", flex: 1, maxWidth: 180, textAlign: "center" }}>
        <ChildIcon size={36} color={T.gold} />
        <div style={{ fontFamily: T.fontDisplay, fontSize: 15, fontWeight: 700, color: T.white, marginTop: 10 }}>Damien</div>
        <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.muted, marginTop: 4 }}>Jouer ! 🎮</div>
      </GlassCard>
    </div>
  </div>
);

// 3. Parental Code Management (from admin)
const ScreenParentalCode = ({ onBack }) => {
  const [mode, setMode] = useState("view"); // view | change | confirm
  const [currentCode, setCurrentCode] = useState("");
  const [newCode, setNewCode] = useState("");
  const [confirmCode, setConfirmCode] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [showUsage, setShowUsage] = useState(false);

  const PinInput = ({ value, onChange, maxLen = 4, color = T.coral, label }) => (
    <div>
      {label && <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.muted, marginBottom: 8, textAlign: "center" }}>{label}</div>}
      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 12 }}>
        {Array.from({ length: maxLen }).map((_, i) => (
          <div key={i} style={{
            width: 40, height: 48, borderRadius: 12,
            background: value.length > i ? color + "22" : T.glass,
            border: `2px solid ${value.length > i ? color : T.glassBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "all 0.2s ease",
            boxShadow: value.length > i ? `0 0 10px ${color}22` : "none",
          }}>
            {value.length > i && <div style={{ width: 12, height: 12, borderRadius: 99, background: color }} />}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 44px)", gap: 6, justifyContent: "center" }}>
        {[1,2,3,4,5,6,7,8,9,null,0,"←"].map((n, i) => (
          n === null ? <div key={i} /> :
          <button key={i} onClick={() => {
            if (n === "←") onChange(value.slice(0, -1));
            else if (value.length < maxLen) onChange(value + n);
          }} style={{
            ...btnBase, width: 44, height: 44, padding: 0, borderRadius: 12,
            background: T.glass, border: `1px solid ${T.glassBorder}`,
            color: T.white, fontSize: 16, justifyContent: "center",
          }}>{n}</button>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ padding: "1.2rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button onClick={onBack} style={{ ...btnBase, background: T.glass, color: T.muted, padding: "6px 10px", fontSize: 12, borderRadius: 10 }}>←</button>
        <div>
          <Pill color={T.coral}>Sécurité</Pill>
          <h2 style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 800, color: T.white, margin: "6px 0 0" }}>Code Parental</h2>
        </div>
      </div>

      {/* Status card */}
      <GlassCard style={{ marginBottom: 16, padding: "1rem", border: `1px solid ${T.coral}22` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14,
            background: T.green + "18",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>
            <ShieldIcon size={22} color={T.green} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 13, fontWeight: 700, color: T.white }}>Code actif</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.muted, marginTop: 2 }}>
              Défini le 14 avril 2026 · <span style={{ color: T.green }}>hashé côté serveur</span>
            </div>
          </div>
          <div style={{
            padding: "4px 10px", borderRadius: 8,
            background: T.green + "22", color: T.green,
            fontFamily: T.fontDisplay, fontSize: 10, fontWeight: 700,
          }}>● ● ● ●</div>
        </div>
      </GlassCard>

      {/* What is this for */}
      <GlassCard
        hoverable
        onClick={() => setShowUsage(u => !u)}
        style={{ marginBottom: 16, padding: "0.8rem 1rem", cursor: "pointer" }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 12, fontWeight: 700, color: T.accent }}>
            À quoi sert le code parental ?
          </div>
          <span style={{ color: T.muted, fontSize: 12 }}>{showUsage ? "▲" : "▼"}</span>
        </div>
        {showUsage && (
          <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              { emoji: "🔥", text: "Sauver le streak après une absence de 2+ jours" },
              { emoji: "⚙️", text: "Confirmer un changement de paramètres sensibles" },
              { emoji: "🗑️", text: "Réinitialiser la progression de l'enfant" },
            ].map((u, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>{u.emoji}</span>
                <span style={{ fontFamily: T.fontBody, fontSize: 11, color: T.muted }}>{u.text}</span>
              </div>
            ))}
            <div style={{
              marginTop: 4, padding: "8px 10px", borderRadius: 10,
              background: T.coral + "11", border: `1px solid ${T.coral}18`,
            }}>
              <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.coral }}>
                L'enfant ne voit jamais ce code. Il est demandé dans un écran spécial affiché uniquement au parent.
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {saved ? (
        /* Success state */
        <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
          <div style={{
            width: 64, height: 64, borderRadius: 99,
            background: T.green + "22",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px",
          }}>
            <CheckIcon size={32} color={T.green} />
          </div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 800, color: T.white, marginBottom: 4 }}>
            Code mis à jour !
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: 12, color: T.muted, marginBottom: 20 }}>
            Le nouveau code est hashé et sauvegardé
          </div>
          <button onClick={() => { setSaved(false); setMode("view"); setCurrentCode(""); setNewCode(""); setConfirmCode(""); }} style={{
            ...btnBase, background: T.glass, color: T.accent, borderRadius: 99, padding: "10px 24px", fontSize: 13,
          }}>OK</button>
        </div>
      ) : mode === "view" ? (
        /* Default view — actions */
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => setMode("change")} style={{
            ...btnBase, width: "100%", justifyContent: "center",
            background: T.coral, color: "#fff", borderRadius: 14, padding: "14px",
          }}>
            <LockIcon size={16} color="#fff" /> Changer le code
          </button>

          <div style={{
            padding: "10px 14px", borderRadius: 14,
            background: T.glass, border: `1px solid ${T.glassBorder}`,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <EyeIcon size={16} color={T.muted} />
              <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.muted }}>
                Le code n'est jamais stocké en clair. Même ici, on ne peut pas l'afficher — seul le hash SHA-256 est conservé.
              </div>
            </div>
          </div>

          {/* Anti-bruteforce info */}
          <GlassCard style={{ padding: "0.8rem 1rem" }}>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 700, color: T.accent, marginBottom: 6 }}>Protection anti-bruteforce</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {[
                { label: "Tentatives avant blocage", value: "3", color: T.gold },
                { label: "Durée du blocage", value: "15 min (×2 à chaque échec)", color: T.coral },
                { label: "Blocage max", value: "60 min", color: T.coral },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: T.fontBody, fontSize: 10, color: T.muted }}>{r.label}</span>
                  <span style={{ fontFamily: T.fontDisplay, fontSize: 10, fontWeight: 700, color: r.color }}>{r.value}</span>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      ) : mode === "change" ? (
        /* Enter current code first */
        <div style={{ textAlign: "center" }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 14, fontWeight: 700, color: T.white, marginBottom: 4 }}>
            Code actuel
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.muted, marginBottom: 16 }}>
            Entrez votre code actuel pour continuer
          </div>
          <PinInput value={currentCode} onChange={v => { setCurrentCode(v); setError(""); if (v.length === 4) setMode("confirm"); }} color={T.coral} />
          {error && <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.coral, marginTop: 8 }}>{error}</div>}
          <button onClick={() => { setMode("view"); setCurrentCode(""); }} style={{
            ...btnBase, background: "transparent", color: T.muted, fontSize: 12, marginTop: 12,
          }}>Annuler</button>
        </div>
      ) : (
        /* Set new code + confirm */
        <div style={{ textAlign: "center" }}>
          {confirmCode.length === 0 && newCode.length < 4 ? (
            <>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 14, fontWeight: 700, color: T.white, marginBottom: 4 }}>
                Nouveau code
              </div>
              <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.muted, marginBottom: 16 }}>
                Choisissez un code à 4 chiffres
              </div>
              <PinInput value={newCode} onChange={v => setNewCode(v)} color={T.primary} />
            </>
          ) : newCode.length === 4 && confirmCode.length < 4 ? (
            <>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 14, fontWeight: 700, color: T.white, marginBottom: 4 }}>
                Confirmer le code
              </div>
              <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.muted, marginBottom: 16 }}>
                Retapez le même code pour confirmer
              </div>
              <PinInput value={confirmCode} onChange={v => {
                setConfirmCode(v);
                if (v.length === 4) {
                  if (v === newCode) {
                    setTimeout(() => setSaved(true), 300);
                  } else {
                    setError("Les codes ne correspondent pas");
                    setTimeout(() => { setConfirmCode(""); setError(""); }, 1200);
                  }
                }
              }} color={T.green} />
              {error && <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.coral, marginTop: 8 }}>{error}</div>}
            </>
          ) : null}
          <button onClick={() => { setMode("view"); setCurrentCode(""); setNewCode(""); setConfirmCode(""); setError(""); }} style={{
            ...btnBase, background: "transparent", color: T.muted, fontSize: 12, marginTop: 12,
          }}>Annuler</button>
        </div>
      )}
    </div>
  );
};

// 4. Parent Admin Dashboard
const ScreenParentAdmin = ({ onBack, onSetupChild, onParentalCode }) => (
  <div style={{ padding: "1.2rem" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
      <div>
        <Pill color={T.primary}>Espace Parent</Pill>
        <h2 style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 800, color: T.white, margin: "8px 0 0" }}>
          Tableau de bord
        </h2>
      </div>
      <button onClick={onBack} style={{ ...btnBase, background: T.glass, color: T.muted, padding: "8px 14px", fontSize: 12, borderRadius: 12 }}>
        Déconnexion
      </button>
    </div>

    {/* Stats row */}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
      {[
        { label: "Streak", value: "7 🔥", color: T.orange },
        { label: "Règles maîtrisées", value: "4/12", color: T.gold },
        { label: "Temps moyen", value: "12min", color: T.blue },
      ].map((s, i) => (
        <GlassCard key={i} style={{ textAlign: "center", padding: "0.8rem 0.5rem" }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
          <div style={{ fontFamily: T.fontBody, fontSize: 10, color: T.muted, marginTop: 2 }}>{s.label}</div>
        </GlassCard>
      ))}
    </div>

    {/* Admin sections */}
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {[
        { icon: <CogIcon size={22} />, title: "Paramètres Quiz", desc: "20 questions · 12 règles actives", color: T.accent },
        { icon: <ChartIcon size={22} />, title: "Statistiques détaillées", desc: "Progression, scores, historique", color: T.blue },
        { icon: <LockIcon size={22} />, title: "Code Parental", desc: "Hashé · jamais affiché en clair", color: T.coral, action: onParentalCode },
        { icon: <ChildIcon size={22} />, title: "Profil Enfant", desc: "Avatar, prénom, images mystères", color: T.gold, action: onSetupChild },
      ].map((item, i) => (
        <GlassCard key={i} hoverable onClick={item.action} style={{ cursor: item.action ? "pointer" : "default", display: "flex", alignItems: "center", gap: 14, padding: "0.9rem 1rem" }}>
          <div style={{
            width: 42, height: 42, borderRadius: 14,
            background: item.color + "18",
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}>{item.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 14, fontWeight: 700, color: T.white }}>{item.title}</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.muted, marginTop: 2 }}>{item.desc}</div>
          </div>
          <ArrowRight size={16} color={T.muted} />
        </GlassCard>
      ))}
    </div>

    {/* Switch to child button */}
    <button onClick={onSetupChild} style={{
      ...btnBase,
      width: "100%",
      marginTop: 20,
      background: `linear-gradient(135deg, ${T.gold}, ${T.orange})`,
      color: "#1a1a2e",
      justifyContent: "center",
      fontSize: 14,
      borderRadius: 16,
      padding: "14px",
    }}>
      <ChildIcon size={18} color="#1a1a2e" /> Voir l'interface enfant
    </button>
  </div>
);

// 5. Child Setup (first time)
const ScreenChildSetup = ({ onDone }) => {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("Damien");
  const [avatar, setAvatar] = useState(0);
  const [pinSet, setPinSet] = useState("");

  const avatars = [
    { emoji: "🦊", bg: T.orange + "33" },
    { emoji: "🐸", bg: T.green + "33" },
    { emoji: "🦄", bg: T.primary + "33" },
    { emoji: "🐱", bg: T.gold + "33" },
    { emoji: "🐼", bg: T.white + "22" },
    { emoji: "🦁", bg: T.coral + "33" },
  ];

  return (
    <div style={{ padding: "1.5rem 1rem" }}>
      <Pill color={T.gold} style={{ marginBottom: 12 }}>Configuration enfant</Pill>

      {/* Progress */}
      <div style={{ display: "flex", gap: 6, marginBottom: 24 }}>
        {["Prénom", "Avatar", "Code PIN"].map((label, i) => (
          <div key={i} style={{ flex: 1 }}>
            <div style={{
              height: 4, borderRadius: 99,
              background: i <= step ? T.primary : T.glass,
              transition: "all 0.3s ease",
            }} />
            <div style={{ fontFamily: T.fontBody, fontSize: 9, color: i <= step ? T.primary : T.muted, marginTop: 4, textAlign: "center" }}>{label}</div>
          </div>
        ))}
      </div>

      {step === 0 && (
        <div style={{ textAlign: "center" }}>
          <SectionTitle sub="Comment s'appelle l'enfant ?">Prénom</SectionTitle>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            style={{
              background: T.glass,
              border: `2px solid ${T.primary}44`,
              borderRadius: 16,
              padding: "14px 20px",
              color: T.white,
              fontSize: 18,
              fontFamily: T.fontDisplay,
              fontWeight: 700,
              textAlign: "center",
              outline: "none",
              width: 220,
            }}
          />
          <br />
          <button onClick={() => setStep(1)} style={{
            ...btnBase, marginTop: 24, background: T.primary, color: "#fff", borderRadius: 99, padding: "12px 32px",
          }}>Suivant →</button>
        </div>
      )}

      {step === 1 && (
        <div style={{ textAlign: "center" }}>
          <SectionTitle sub="Choisis un avatar pour le profil">Avatar</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 72px)", gap: 12, justifyContent: "center", margin: "16px 0" }}>
            {avatars.map((a, i) => (
              <div key={i} onClick={() => setAvatar(i)} style={{
                width: 72, height: 72, borderRadius: 20,
                background: a.bg,
                border: `3px solid ${avatar === i ? T.primary : "transparent"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, cursor: "pointer",
                transition: "all 0.2s ease",
                transform: avatar === i ? "scale(1.08)" : "scale(1)",
                boxShadow: avatar === i ? `0 0 20px ${T.primary}44` : "none",
              }}>{a.emoji}</div>
            ))}
          </div>
          <button onClick={() => setStep(2)} style={{
            ...btnBase, marginTop: 16, background: T.primary, color: "#fff", borderRadius: 99, padding: "12px 32px",
          }}>Suivant →</button>
        </div>
      )}

      {step === 2 && (
        <div style={{ textAlign: "center" }}>
          <SectionTitle sub="Code simple pour que l'enfant accède à son profil">Code PIN enfant</SectionTitle>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", margin: "16px 0" }}>
            {[0, 1, 2, 3].map(i => (
              <div key={i} style={{
                width: 44, height: 52, borderRadius: 14,
                background: pinSet.length > i ? T.gold + "33" : T.glass,
                border: `2px solid ${pinSet.length > i ? T.gold : T.glassBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s ease",
              }}>
                {pinSet.length > i && <div style={{ width: 12, height: 12, borderRadius: 99, background: T.gold }} />}
              </div>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 48px)", gap: 8, justifyContent: "center", margin: "12px 0" }}>
            {[1,2,3,4,5,6,7,8,9,null,0,"←"].map((n, i) => (
              n === null ? <div key={i} /> :
              <button key={i} onClick={() => {
                if (n === "←") setPinSet(p => p.slice(0, -1));
                else if (pinSet.length < 4) setPinSet(p => p + n);
              }} style={{
                ...btnBase, width: 48, height: 48, padding: 0, borderRadius: 14,
                background: T.glass, border: `1px solid ${T.glassBorder}`,
                color: T.white, fontSize: 18, justifyContent: "center",
              }}>{n}</button>
            ))}
          </div>
          <button onClick={onDone} disabled={pinSet.length < 4} style={{
            ...btnBase, marginTop: 16,
            background: pinSet.length === 4 ? T.green : T.glass,
            color: pinSet.length === 4 ? "#1a1a2e" : T.muted,
            borderRadius: 99, padding: "12px 32px",
            opacity: pinSet.length === 4 ? 1 : 0.5,
          }}>✓ Profil créé !</button>
        </div>
      )}
    </div>
  );
};

// 6. Child Dashboard (simplified mockup)
const ScreenChildDashboard = ({ onBack }) => (
  <div style={{ padding: "1.2rem" }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 14,
          background: T.orange + "33",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22,
        }}>🦊</div>
        <div>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 16, fontWeight: 800, color: T.white }}>Damien</div>
          <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.gold }}>Streak : 7 🔥</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.gold + "22", padding: "6px 12px", borderRadius: 99 }}>
        <span style={{ fontSize: 14 }}>🪙</span>
        <span style={{ fontFamily: T.fontDisplay, fontWeight: 800, fontSize: 14, color: T.gold }}>250</span>
      </div>
    </div>

    <SectionTitle>Mes règles</SectionTitle>
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {[
        { rule: "-er / -é / -ez", level: "Couronne 👑", color: T.gold, pct: 85 },
        { rule: "a / à / as", level: "Entraînement", color: "#c0c0c0", pct: 60 },
        { rule: "ou / où", level: "Découverte", color: "#cd7f32", pct: 30 },
      ].map((r, i) => (
        <GlassCard key={i} hoverable style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 12, padding: "0.75rem 1rem" }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.fontDisplay, fontSize: 14, fontWeight: 700, color: T.white }}>{r.rule}</div>
            <div style={{ fontFamily: T.fontBody, fontSize: 11, color: r.color, marginTop: 2 }}>{r.level}</div>
          </div>
          <div style={{ width: 60, height: 6, borderRadius: 99, background: T.glass, overflow: "hidden" }}>
            <div style={{ width: `${r.pct}%`, height: "100%", borderRadius: 99, background: r.color, transition: "width 0.5s ease" }} />
          </div>
        </GlassCard>
      ))}
    </div>

    <button onClick={onBack} style={{
      ...btnBase, width: "100%", marginTop: 20,
      background: `linear-gradient(135deg, ${T.primary}, ${T.blue})`,
      color: "#fff", justifyContent: "center", borderRadius: 16, padding: 14,
    }}>
      ▶ Jouer !
    </button>

    <div style={{ textAlign: "center", marginTop: 16 }}>
      <button onClick={onBack} style={{ ...btnBase, background: "transparent", color: T.muted, fontSize: 12 }}>
        ← Retour au choix de profil
      </button>
    </div>

    <div style={{
      marginTop: 20, padding: "10px 14px", borderRadius: 14,
      background: T.green + "11",
      border: `1px solid ${T.green}22`,
    }}>
      <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.green, textAlign: "center" }}>
        ✓ Pas de bouton admin · pas de code visible · pas de paramètres
      </div>
    </div>
  </div>
);

// ─── Comparison View ───
const ComparisonView = () => {
  const rows = [
    { label: "Auth parent", before: "Aucune", after: "Google Connect" },
    { label: "Accès admin", before: "Ouvert (/admin)", after: "Protégé par auth" },
    { label: "Code parental", before: "Visible en clair", after: "Hashé, jamais affiché" },
    { label: "Accès enfant", before: "Pas de login", after: "Clic sur avatar, accès direct" },
    { label: "Navigation", before: "Tout mélangé", after: "3 espaces séparés" },
    { label: "Sécurité", before: "Damien voit le code", after: "Rien de sensible visible" },
  ];
  return (
    <div style={{ padding: "0.4rem 0" }}>
      {rows.map((r, i) => (
        <div key={i} style={{
          display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8,
          padding: "8px 0",
          borderBottom: i < rows.length - 1 ? `1px solid ${T.glassBorder}` : "none",
        }}>
          <div style={{ fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 700, color: T.white }}>{r.label}</div>
          <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.coral, display: "flex", alignItems: "center", gap: 4 }}>
            <CrossIcon size={12} /> {r.before}
          </div>
          <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.green, display: "flex", alignItems: "center", gap: 4 }}>
            <CheckIcon size={12} /> {r.after}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Flow Diagram ───
const FlowDiagram = ({ currentStep }) => {
  const steps = [
    { label: "Google Connect", icon: <GoogleIcon />, color: T.coral },
    { label: "Choix profil", icon: <ShieldIcon size={16} color={T.primary} />, color: T.primary },
    { label: "Parent / Enfant", icon: <ChildIcon size={16} color={T.gold} />, color: T.gold },
    { label: "Interface dédiée", icon: <GamepadIcon size={16} color={T.green} />, color: T.green },
  ];
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 2, padding: "8px 0" }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 5,
            padding: "5px 10px", borderRadius: 10,
            background: currentStep === i ? s.color + "33" : T.glass,
            border: `1px solid ${currentStep === i ? s.color + "55" : "transparent"}`,
            transition: "all 0.3s ease",
          }}>
            {s.icon}
            <span style={{ fontFamily: T.fontBody, fontSize: 10, color: currentStep === i ? T.white : T.muted, fontWeight: currentStep === i ? 700 : 400 }}>
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && <ArrowRight size={12} color={T.muted} />}
        </div>
      ))}
    </div>
  );
};

// ─── Main App ───
export default function App() {
  const [screen, setScreen] = useState("landing");
  const [showCompare, setShowCompare] = useState(false);

  const flowStep = { landing: 0, chooser: 1, parentAdmin: 2, parentalCode: 2, childSetup: 2, childDash: 3 }[screen] ?? 0;

  const screenMap = {
    landing: <ScreenLanding onNext={() => setScreen("chooser")} />,
    chooser: <ScreenProfileChooser onParent={() => setScreen("parentAdmin")} onChild={() => setScreen("childDash")} />,
    parentAdmin: <ScreenParentAdmin onBack={() => setScreen("landing")} onSetupChild={() => setScreen("childSetup")} onParentalCode={() => setScreen("parentalCode")} />,
    parentalCode: <ScreenParentalCode onBack={() => setScreen("parentAdmin")} />,
    childSetup: <ScreenChildSetup onDone={() => setScreen("childDash")} />,
    childDash: <ScreenChildDashboard onBack={() => setScreen("chooser")} />,
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: grad,
      fontFamily: T.fontBody,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "24px 16px",
    }}>
      {/* Header */}
      <div style={{ width: "100%", maxWidth: 900, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div>
            <h1 style={{ fontFamily: T.fontDisplay, fontSize: 18, fontWeight: 800, color: T.white, margin: 0 }}>
              Orthographe App — Archi Admin
            </h1>
            <p style={{ fontFamily: T.fontBody, fontSize: 12, color: T.muted, margin: "2px 0 0" }}>
              Démo interactive du parcours proposé
            </p>
          </div>
          <button
            onClick={() => setShowCompare(c => !c)}
            style={{ ...btnBase, background: T.glass, border: `1px solid ${T.glassBorder}`, color: T.accent, fontSize: 12, padding: "8px 14px", borderRadius: 12 }}
          >
            {showCompare ? "Masquer" : "Avant / Après"}
          </button>
        </div>

        {/* Flow breadcrumb */}
        <FlowDiagram currentStep={flowStep} />
      </div>

      {/* Comparison panel */}
      {showCompare && (
        <div style={{ width: "100%", maxWidth: 900, marginBottom: 16 }}>
          <GlassCard style={{ padding: "1rem 1.2rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 700, color: T.muted }}>—</div>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 700, color: T.coral }}>AVANT</div>
              <div style={{ fontFamily: T.fontDisplay, fontSize: 11, fontWeight: 700, color: T.green }}>APRÈS</div>
            </div>
            <ComparisonView />
          </GlassCard>
        </div>
      )}

      {/* Main content — phone mockup */}
      <div style={{
        width: 390,
        minHeight: 520,
        borderRadius: 36,
        background: `linear-gradient(160deg, rgba(30,30,46,0.98), rgba(45,43,85,0.98))`,
        border: `1px solid rgba(167,139,250,0.15)`,
        boxShadow: "0 24px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        overflow: "hidden",
        position: "relative",
      }}>
        {/* Phone notch */}
        <div style={{
          width: 120, height: 28, borderRadius: "0 0 16px 16px",
          background: T.bg1,
          margin: "0 auto",
          border: `1px solid ${T.glassBorder}`,
          borderTop: "none",
        }} />

        {/* Screen content */}
        <div style={{ padding: "0 4px 16px" }}>
          {screenMap[screen]}
        </div>
      </div>

      {/* Navigation hints */}
      <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { label: "Accueil", s: "landing" },
          { label: "Choix profil", s: "chooser" },
          { label: "Admin parent", s: "parentAdmin" },
          { label: "Code parental", s: "parentalCode" },
          { label: "Setup enfant", s: "childSetup" },
          { label: "Dashboard enfant", s: "childDash" },
        ].map(b => (
          <button key={b.s} onClick={() => setScreen(b.s)} style={{
            ...btnBase,
            background: screen === b.s ? T.primary + "33" : T.glass,
            border: `1px solid ${screen === b.s ? T.primary + "55" : T.glassBorder}`,
            color: screen === b.s ? T.primary : T.muted,
            fontSize: 11, padding: "6px 12px", borderRadius: 10,
          }}>{b.label}</button>
        ))}
      </div>

      {/* Architecture note */}
      <GlassCard style={{ maxWidth: 900, width: "100%", marginTop: 20, padding: "1rem 1.2rem" }}>
        <div style={{ fontFamily: T.fontDisplay, fontSize: 13, fontWeight: 700, color: T.accent, marginBottom: 8 }}>
          Principes d'architecture
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { icon: <GoogleIcon />, text: "Auth parent via Google OAuth 2.0 — pas de mdp à gérer" },
            { icon: <LockIcon size={16} />, text: "Code parental hashé côté serveur, jamais affiché" },
            { icon: <ShieldIcon size={16} />, text: "Admin protégé — l'enfant n'y a jamais accès" },
            { icon: <ChildIcon size={16} />, text: "Accès enfant par clic avatar — pas de code, pas de friction" },
          ].map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
              <div style={{ flexShrink: 0, marginTop: 1 }}>{p.icon}</div>
              <div style={{ fontFamily: T.fontBody, fontSize: 11, color: T.muted, lineHeight: 1.5 }}>{p.text}</div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

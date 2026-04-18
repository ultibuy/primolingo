import { Link } from 'react-router-dom';
import { allRules } from '../content/loader.js';

// ─── Shield SVG ───────────────────────────────────────────────────────────────
function ShieldBadge() {
  return (
    <svg
      width="160"
      height="180"
      viewBox="0 0 160 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 8px 32px rgba(124,58,237,0.5))' }}
    >
      <defs>
        <linearGradient id="shieldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7c3aed" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="shieldInner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.15)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <path
        d="M80 8 L148 36 L148 96 C148 136 80 172 80 172 C80 172 12 136 12 96 L12 36 Z"
        fill="url(#shieldGrad)"
      />
      <path
        d="M80 18 L138 42 L138 96 C138 130 80 162 80 162 C80 162 22 130 22 96 L22 42 Z"
        fill="url(#shieldInner)"
      />
      <text
        x="80"
        y="106"
        textAnchor="middle"
        dominantBaseline="middle"
        fontFamily="Outfit, sans-serif"
        fontWeight="800"
        fontSize="40"
        fill="white"
        letterSpacing="-1"
      >
        OQ
      </text>
    </svg>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1e1e2e 0%, #2d2b55 100%)',
    fontFamily: "'Plus Jakarta Sans', 'Avenir Next', 'Trebuchet MS', sans-serif",
    color: '#e2e2e2',
    overflowX: 'hidden',
  },

  // NAV
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 1.5rem',
    maxWidth: '1100px',
    margin: '0 auto',
    width: '100%',
  },
  navLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    textDecoration: 'none',
  },
  navLogoIcon: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Outfit', sans-serif",
    fontWeight: '800',
    fontSize: '14px',
    color: 'white',
    flexShrink: 0,
  },
  navLogoTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: '700',
    fontSize: '1.1rem',
    color: 'white',
  },
  navBtn: {
    padding: '0.5rem 1.1rem',
    borderRadius: '10px',
    border: '1.5px solid rgba(167,139,250,0.4)',
    background: 'rgba(124,58,237,0.15)',
    color: '#a78bfa',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block',
    transition: 'all 0.15s ease',
  },

  // SECTIONS
  section: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '4rem 1.5rem',
  },
  sectionSmall: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '3rem 1.5rem',
  },

  // HERO
  hero: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '1.5rem',
    padding: '3rem 1.5rem 4rem',
    maxWidth: '1100px',
    margin: '0 auto',
  },
  heroTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: '800',
    fontSize: 'clamp(48px, 8vw, 64px)',
    color: 'white',
    lineHeight: 1.05,
    margin: 0,
    background: 'linear-gradient(135deg, #ffffff 0%, #c4b5fd 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  },
  heroSubtitle: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: '600',
    fontSize: 'clamp(1.1rem, 3vw, 1.4rem)',
    color: '#c4b5fd',
    margin: 0,
  },
  heroTagline: {
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: '500',
    fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)',
    color: '#94a3b8',
    maxWidth: '540px',
    lineHeight: 1.6,
    margin: 0,
  },
  ctaBtn: {
    display: 'inline-block',
    padding: '0.9rem 2rem',
    borderRadius: '14px',
    background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    color: 'white',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    fontWeight: '700',
    fontSize: '1.05rem',
    textDecoration: 'none',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 24px rgba(124,58,237,0.4)',
    transition: 'all 0.15s ease',
  },
  freeTag: {
    fontSize: '0.85rem',
    color: '#64748b',
    margin: 0,
  },

  // SECTION TITLE
  sectionTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: '700',
    fontSize: 'clamp(1.5rem, 4vw, 2rem)',
    color: 'white',
    textAlign: 'center',
    marginBottom: '2.5rem',
  },

  // GLASS CARD
  glassCard: {
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
    padding: '1.75rem',
  },

  // FEATURES GRID
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.25rem',
  },
  featureEmoji: {
    fontSize: '2rem',
    marginBottom: '0.75rem',
    display: 'block',
  },
  featureTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: '700',
    fontSize: '1.1rem',
    color: 'white',
    marginBottom: '0.5rem',
  },
  featureDesc: {
    fontSize: '0.9rem',
    color: '#94a3b8',
    lineHeight: 1.6,
    margin: 0,
  },

  // STEPS
  stepsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    maxWidth: '600px',
    margin: '0 auto',
  },
  stepCard: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1.25rem',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '1.25rem 1.5rem',
  },
  stepNumber: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Outfit', sans-serif",
    fontWeight: '800',
    fontSize: '1.1rem',
    color: 'white',
    flexShrink: 0,
  },
  stepText: {
    fontWeight: '600',
    fontSize: '0.95rem',
    color: '#e2e2e2',
    lineHeight: 1.5,
    margin: 0,
    paddingTop: '0.5rem',
  },

  // RULES GRID
  rulesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  },
  ruleItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.6rem',
    background: 'rgba(255,255,255,0.04)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(167,139,250,0.15)',
    borderRadius: '12px',
    padding: '0.75rem 1rem',
  },
  ruleCheckmark: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    background: 'rgba(124,58,237,0.25)',
    border: '1.5px solid rgba(124,58,237,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    fontSize: '10px',
    color: '#a78bfa',
  },
  ruleTitle: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: '#c4b5fd',
    margin: 0,
  },
  rulesNote: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#64748b',
  },

  // FREE SECTION
  freeSection: {
    textAlign: 'center',
    maxWidth: '680px',
    margin: '0 auto',
    padding: '3.5rem 1.5rem',
  },
  freeCard: {
    background: 'rgba(124,58,237,0.08)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(167,139,250,0.2)',
    borderRadius: '24px',
    padding: '2.5rem 2rem',
  },
  freeIcon: {
    fontSize: '2.5rem',
    marginBottom: '1rem',
    display: 'block',
  },
  freeTitle: {
    fontFamily: "'Outfit', sans-serif",
    fontWeight: '700',
    fontSize: 'clamp(1.4rem, 3.5vw, 1.75rem)',
    color: 'white',
    marginBottom: '1rem',
  },
  freeText: {
    fontSize: '0.95rem',
    color: '#94a3b8',
    lineHeight: 1.7,
    margin: '0 0 0.75rem',
  },

  // FOOTER
  footer: {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    padding: '3rem 1.5rem 2.5rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1rem',
  },
  footerTagline: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: 0,
  },
  footerCopy: {
    fontSize: '0.78rem',
    color: '#475569',
    margin: 0,
  },

  // DIVIDER
  divider: {
    height: '1px',
    background: 'rgba(255,255,255,0.05)',
    maxWidth: '1100px',
    margin: '0 auto',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const features = [
    {
      emoji: '🧠',
      title: 'Apprentissage progressif',
      desc: 'Les nouvelles règles sont introduites une à une, avec un rythme adapté à chaque enfant.',
    },
    {
      emoji: '🎯',
      title: 'Méthode éprouvée (SM-2)',
      desc: "L'algorithme de répétition espacée SM-2 garantit que les règles difficiles reviennent plus souvent.",
    },
    {
      emoji: '📊',
      title: 'Suivi intelligent',
      desc: 'En tant que parent, vous voyez exactement quelles règles sont maîtrisées et lesquelles butent.',
    },
    {
      emoji: '🏆',
      title: 'Motivation par le jeu',
      desc: 'Streaks, badges, niveaux et récompenses maintiennent la motivation sur le long terme.',
    },
  ];

  const steps = [
    'Créez un compte parent en 10 secondes avec Google',
    'Ajoutez le profil de votre enfant',
    'Votre enfant joue, vous suivez ses progrès',
  ];

  return (
    <div style={styles.page}>
      {/* ── NAV ────────────────────────────────────────────── */}
      <nav>
        <div style={styles.nav}>
          <Link to="/" style={styles.navLogo}>
            <div style={styles.navLogoIcon}>OQ</div>
            <span style={styles.navLogoTitle}>OrthoQuest</span>
          </Link>
          <Link to="/login" style={styles.navBtn}>
            Se connecter
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section>
        <div style={styles.hero}>
          <ShieldBadge />
          <h1 style={styles.heroTitle}>OrthoQuest</h1>
          <p style={styles.heroSubtitle}>
            L'aventure de l'orthographe pour les 8-14 ans
          </p>
          <p style={styles.heroTagline}>
            Apprendre les règles d'orthographe en s'amusant, une quête à la fois.
          </p>
          <Link to="/login" style={styles.ctaBtn}>
            Commencer l'aventure →
          </Link>
          <p style={styles.freeTag}>C'est gratuit, pour toujours</p>
        </div>
      </section>

      <div style={styles.divider} />

      {/* ── FEATURES ───────────────────────────────────────── */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Pourquoi OrthoQuest ?</h2>
        <div style={styles.featuresGrid}>
          {features.map((f) => (
            <div key={f.title} style={styles.glassCard}>
              <span style={styles.featureEmoji}>{f.emoji}</span>
              <div style={styles.featureTitle}>{f.title}</div>
              <p style={styles.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={styles.divider} />

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Comment ça marche ?</h2>
        <div style={styles.stepsGrid}>
          {steps.map((step, i) => (
            <div key={i} style={styles.stepCard}>
              <div style={styles.stepNumber}>{i + 1}</div>
              <p style={styles.stepText}>{step}</p>
            </div>
          ))}
        </div>
      </section>

      <div style={styles.divider} />

      {/* ── RULES ──────────────────────────────────────────── */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Les {allRules.length} règles couvertes</h2>
        <div style={styles.rulesGrid}>
          {allRules.map((rule) => (
            <div key={rule.id} style={styles.ruleItem}>
              <div style={styles.ruleCheckmark}>✓</div>
              <p style={styles.ruleTitle}>{rule.shortTitle || rule.title}</p>
            </div>
          ))}
        </div>
        <p style={styles.rulesNote}>Nouvelles règles ajoutées régulièrement</p>
      </section>

      <div style={styles.divider} />

      {/* ── FREE ───────────────────────────────────────────── */}
      <div style={styles.freeSection}>
        <div style={styles.freeCard}>
          <span style={styles.freeIcon}>✨</span>
          <div style={styles.freeTitle}>100% gratuit, pour toujours</div>
          <p style={styles.freeText}>
            OrthoQuest est 100% gratuit. Pas de pub, pas d'achats in-app, pas de données revendues.
          </p>
          <p style={styles.freeText}>
            Un projet indépendant créé par un parent pour son enfant, ouvert à tous.
          </p>
        </div>
      </div>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer style={styles.footer}>
        <Link to="/login" style={styles.ctaBtn}>
          Commencer maintenant →
        </Link>
        <p style={styles.footerTagline}>
          Fait avec ❤️ pour les enfants qui veulent dompter l'orthographe
        </p>
        <p style={styles.footerCopy}>
          © {new Date().getFullYear()} OrthoQuest — Tous droits réservés
        </p>
      </footer>
    </div>
  );
}

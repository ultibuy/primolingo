import { Link } from 'react-router-dom';
import SeoHead, { BASE_URL } from '../components/SeoHead.jsx';
import AppLogo from '../components/AppLogo.jsx';
import SeoStarField from '../components/SeoStarField.jsx';
import seoContent from '../data/seoContent.js';
import seoRules from '../data/generated/seoRules.json';

const ALL_RULES = seoRules;

// Schema.org ItemList structured data
const schemaItemList = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: "Règles d'orthographe CE1-CM2",
  description: "20 règles d'orthographe avec exercices gratuits pour les enfants du primaire",
  url: `${BASE_URL}/regles`,
  numberOfItems: ALL_RULES.length,
  itemListElement: ALL_RULES.map((rule, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: seoContent[rule.id]?.h1 || rule.title,
    url: `${BASE_URL}/regles/${rule.id}`,
  })),
};

export default function RulesIndexPage() {
  return (
    <div style={pageStyle}>
      <SeoStarField />
      <SeoHead
        title="Règles d'orthographe CE1-CM2 — Exercices gratuits | PrimoLingo"
        description="20 règles d'orthographe française avec exercices interactifs gratuits pour les enfants de CE1 à CM2. Apprenez a/à/as, ce/se, son/sont et bien plus."
        canonical={`${BASE_URL}/regles`}
      />

      {/* Schema.org */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaItemList) }}
      />

      {/* Nav */}
      <nav style={navStyle}>
        <Link to="/" style={navLogoStyle}>
          <AppLogo size={34} />
          <span style={navLogoTextStyle}>PrimoLingo</span>
        </Link>
        <Link to="/login" style={navLoginStyle}>Se connecter</Link>
      </nav>

      <main style={mainStyle}>
        {/* Header */}
        <header style={headerStyle}>
          <nav style={breadcrumbStyle} aria-label="Fil d'ariane">
            <Link to="/" style={breadcrumbLink}>Accueil</Link>
            <span style={breadcrumbSep}>›</span>
          <span style={{ color: 'rgba(255,255,255,0.85)' }}>Règles d'orthographe</span>
          </nav>

          <h1 style={h1Style}>
            Règles d'orthographe CE1-CM2<br />
            <span style={heroAccentStyle}>Exercices gratuits</span>
          </h1>
          <p style={subtitleStyle}>
            Votre enfant confond <em>a</em> et <em>à</em>, <em>ce</em> et <em>se</em>, <em>son</em> et <em>sont</em> ?
            Chaque règle est expliquée simplement avec une astuce de remplacement
            et un mini-quiz à faire ensemble.
          </p>
        </header>

        {/* Rule grid */}
        <div style={gridStyle}>
          {ALL_RULES.map(rule => {
            const seo = seoContent[rule.id];
            return (
              <Link key={rule.id} to={`/regles/${rule.id}`} style={cardStyle}>
                <h2 style={cardTitleStyle}>{rule.title}</h2>
                {seo?.niveaux && (
                  <span style={levelBadge}>{seo.niveaux}</span>
                )}
                <p style={cardDescStyle}>{rule.description}</p>
                <span style={cardCta}>Voir les exercices →</span>
              </Link>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div style={bottomCtaBox}>
          <p style={{ color: 'rgba(255,255,255,0.85)', margin: 0, fontSize: '1rem', fontWeight: 700 }}>
            Votre enfant veut s'entraîner sur toutes ces règles ?
          </p>
          <p style={{ color: 'rgba(255,255,255,0.5)', margin: '0.4rem 0 0', fontSize: '0.9rem' }}>
            PrimoLingo propose 200+ exercices par règle avec progression, récompenses et suivi parental. Gratuit.
          </p>
          <Link to="/login" style={bottomCtaBtn}>Essayer gratuitement</Link>
        </div>
      </main>

      <footer style={footerStyle}>
        <Link to="/legal" style={footerLink}>Mentions légales</Link>
        <span style={{ color: 'rgba(255,255,255,0.35)' }}>·</span>
        <Link to="/" style={footerLink}>PrimoLingo</Link>
      </footer>
    </div>
  );
}

// ─── styles ──────────────────────────────────────────────────────────────────

const pageStyle = {
  minHeight: '100vh',
  background: 'linear-gradient(180deg, #1e1e2e 0%, #2d2b55 52%, #1a1a2e 100%) fixed',
  color: 'rgba(255,255,255,0.85)',
  fontFamily: 'Plus Jakarta Sans, sans-serif',
  position: 'relative',
  overflowX: 'hidden',
};

const navStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1rem 1.5rem',
  maxWidth: 1100,
  margin: '0 auto',
  position: 'relative',
  zIndex: 1,
};

const navLogoStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  color: '#fff',
  textDecoration: 'none',
};

const navLogoTextStyle = {
  fontFamily: 'Outfit, sans-serif',
  fontWeight: 900,
  fontSize: '1.1rem',
  letterSpacing: 0,
};

const navLoginStyle = {
  background: 'transparent',
  border: '1.5px solid #a78bfa',
  borderRadius: 999,
  padding: '0.55rem 1.1rem',
  color: '#c4b5fd',
  fontWeight: 700,
  fontSize: '0.88rem',
  textDecoration: 'none',
  fontFamily: 'Outfit, sans-serif',
};

const mainStyle = {
  maxWidth: 1100,
  margin: '0 auto',
  padding: '2.5rem 1.5rem 4rem',
  position: 'relative',
  zIndex: 1,
};

const headerStyle = {
  marginBottom: '3rem',
  textAlign: 'center',
};

const breadcrumbStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: '0.82rem',
  marginBottom: '1.5rem',
  justifyContent: 'center',
  color: 'rgba(255,255,255,0.5)',
};

const breadcrumbLink = {
  color: 'rgba(255,255,255,0.5)',
  textDecoration: 'none',
};

const breadcrumbSep = {
  color: 'rgba(255,255,255,0.35)',
};

const h1Style = {
  fontFamily: 'Outfit, sans-serif',
  fontSize: 'clamp(2.4rem, 7vw, 4.7rem)',
  fontWeight: 900,
  lineHeight: 1,
  margin: '0 0 1rem',
  letterSpacing: '-0.02em',
  color: '#fff',
};

const heroAccentStyle = {
  background: 'linear-gradient(135deg, #a78bfa 0%, #fbbf24 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

const subtitleStyle = {
  color: 'rgba(255,255,255,0.5)',
  fontSize: '1.08rem',
  lineHeight: 1.7,
  maxWidth: 690,
  margin: '0 auto',
};

const gridStyle = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
  gap: '1rem',
  marginBottom: '3rem',
};

const cardStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.55rem',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
  padding: '1.35rem 1.4rem',
  textDecoration: 'none',
  transition: 'border-color 0.2s, background 0.2s',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
};

const cardTitleStyle = {
  fontFamily: 'Outfit, sans-serif',
  fontSize: '1.05rem',
  fontWeight: 800,
  color: '#c4b5fd',
  margin: 0,
};

const levelBadge = {
  display: 'inline-flex',
  background: 'rgba(167,139,250,0.18)',
  border: '1px solid rgba(167,139,250,0.35)',
  borderRadius: 999,
  padding: '0.22rem 0.65rem',
  fontSize: '0.72rem',
  fontWeight: 700,
  color: '#c4b5fd',
  alignSelf: 'flex-start',
  fontFamily: 'Outfit, sans-serif',
};

const cardDescStyle = {
  fontSize: '0.83rem',
  color: 'rgba(255,255,255,0.5)',
  lineHeight: 1.6,
  margin: 0,
  flex: 1,
};

const cardCta = {
  fontSize: '0.82rem',
  color: '#c4b5fd',
  fontWeight: 700,
  marginTop: '0.2rem',
};

const bottomCtaBox = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 28,
  padding: '1.8rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.5rem',
  textAlign: 'center',
  backdropFilter: 'blur(20px)',
  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
};

const bottomCtaBtn = {
  display: 'inline-flex',
  background: 'linear-gradient(135deg, #7c3aed, #a78bfa)',
  color: '#fff',
  textDecoration: 'none',
  borderRadius: 999,
  padding: '0.85rem 2rem',
  fontSize: '1rem',
  fontWeight: 800,
  marginTop: '0.8rem',
  boxShadow: '0 8px 30px rgba(167,139,250,0.35)',
};

const footerStyle = {
  display: 'flex',
  justifyContent: 'center',
  gap: '1rem',
  padding: '1.5rem',
  fontSize: '0.82rem',
  position: 'relative',
  zIndex: 1,
};

const footerLink = {
  color: 'rgba(255,255,255,0.35)',
  textDecoration: 'none',
};

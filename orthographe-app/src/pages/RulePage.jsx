import { useParams, Link, Navigate } from 'react-router-dom';
import { useCallback, useEffect } from 'react';
import SeoHead, { BASE_URL } from '../components/SeoHead.jsx';
import AppLogo from '../components/AppLogo.jsx';
import MemoCard from '../components/MemoCard.jsx';
import MiniQuiz from '../components/MiniQuiz.jsx';
import SeoStarField from '../components/SeoStarField.jsx';
import seoContent from '../data/seoContent.js';
import seoRules from '../data/generated/seoRules.json';
import { getEditorialFaqs } from '../data/seoFaq.js';

const RULES_MAP = Object.fromEntries(seoRules.map(rule => [rule.id, rule]));

// Pick the 3 hardest questions (difficulty ≥ 2) as "common traps"
function getTrapQuestions(rule) {
  if (!rule?.questions?.length) return [];
  return rule.questions
    .filter(q => q.difficulty >= 2)
    .sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0))
    .slice(0, 3);
}

export default function RulePage() {
  const { ruleId } = useParams();
  const rule = RULES_MAP[ruleId];

  // All hooks must be called before any early return
  const handleQuizStart = useCallback(() => {
    import('../services/analytics.js').then(({ default: posthog }) => {
      posthog.capture('seo_quiz_started', { rule_id: ruleId });
    }).catch(() => {});
  }, [ruleId]);

  const handleQuizComplete = useCallback((score, total) => {
    import('../services/analytics.js').then(({ default: posthog }) => {
      posthog.capture('seo_quiz_completed', { rule_id: ruleId, score, total });
    }).catch(() => {});
  }, [ruleId]);

  useEffect(() => {
    if (!rule) return;
    import('../services/analytics.js').then(({ default: posthog }) => {
      posthog.capture('seo_page_viewed', { rule_id: ruleId });
    }).catch(() => {});
  }, [ruleId, rule]);

  if (!rule) return <Navigate to="/regles" replace />;

  const seo = seoContent[ruleId] || {};
  const trapQuestions = getTrapQuestions(rule);
  const editorialFaqs = getEditorialFaqs(rule, seo);

  const pageTitle = seo.h1
    ? `${seo.h1} | PrimoLingo`
    : `${rule.title} — exercices gratuits | PrimoLingo`;
  const metaDesc = seo.metaDesc || rule.description;

  const faqItems = editorialFaqs.map(item => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  }));

  const schemaFaq = faqItems.length ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems,
  } : null;

  return (
    <div style={pageStyle}>
      <SeoStarField subtle />
      <SeoHead
        title={pageTitle}
        description={metaDesc}
        canonical={`${BASE_URL}/regles/${ruleId}`}
      />

      {schemaFaq && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaFaq) }}
        />
      )}

      {/* Nav */}
      <nav style={navStyle}>
        <Link to="/" style={navLogoStyle}>
          <AppLogo size={34} />
          <span style={navLogoTextStyle}>PrimoLingo</span>
        </Link>
        <Link to="/login" style={navLoginStyle}>Se connecter</Link>
      </nav>

      <main style={mainStyle}>
        {/* Breadcrumb */}
        <nav style={breadcrumbStyle} aria-label="Fil d'ariane">
          <Link to="/" style={breadcrumbLink}>Accueil</Link>
          <span style={breadcrumbSep}>›</span>
          <Link to="/regles" style={breadcrumbLink}>Règles d'orthographe</Link>
          <span style={breadcrumbSep}>›</span>
          <span style={{ color: 'rgba(255,255,255,0.85)' }}>{rule.title}</span>
        </nav>

        {/* H1 + intro */}
        <header style={headerStyle}>
          {seo.niveaux && (
            <span style={levelBadge}>{seo.niveaux}</span>
          )}
          <h1 style={h1Style}>
            {seo.h1 || rule.title}
          </h1>
          {seo.intro && (
            <p style={introStyle}>{seo.intro}</p>
          )}
        </header>

        {/* Astuce + MemoCard */}
        <section style={sectionStyle} aria-labelledby="section-astuce">
          <h2 id="section-astuce" style={h2Style}>
            L'astuce pour ne plus se tromper
          </h2>
          {seo.astuceIntro && (
            <p style={bodyTextStyle}>{seo.astuceIntro}</p>
          )}
          <MemoCard memoCard={rule.memoCard} />

          {/* Decision axes as prose */}
          {rule.decisionAxes?.length > 0 && (
            <div style={decisionBox}>
              <p style={decisionTitle}>Comment raisonner étape par étape :</p>
              <ol style={decisionList}>
                {rule.decisionAxes.map(axis => (
                  <li key={axis.id} style={decisionItem}>
                    <strong style={{ color: '#c4b5fd' }}>{axis.question}</strong>
                    <ul style={decisionOptions}>
                      {axis.options?.map(opt => (
                        <li key={opt.value?.toString()}>
                          {opt.label}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </section>

        {/* Common traps */}
        {trapQuestions.length > 0 && (
          <section style={sectionStyle} aria-labelledby="section-pieges">
            <h2 id="section-pieges" style={h2Style}>
              Les erreurs les plus fréquentes
            </h2>
            {seo.piegesIntro && (
              <p style={bodyTextStyle}>{seo.piegesIntro}</p>
            )}
            <div style={trapsWrap}>
              {trapQuestions.map(q => (
                <div key={q.id} style={trapCard}>
                  <p style={trapSentence}>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{q.before}</span>
                    <span style={blankStyle}>{rule.choices?.find(c => c.id === q.answer)?.label || '___'}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)' }}>{q.after}</span>
                  </p>
                  <p style={trapExplanation}>
                    <span style={{ color: '#a78bfa', fontWeight: 700 }}>Pourquoi c'est piégeux : </span>
                    {q.explanation}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Mini-quiz */}
        <section style={sectionStyle} aria-labelledby="section-quiz">
          <h2 id="section-quiz" style={h2Style}>
            Testez avec votre enfant
          </h2>
          <MiniQuiz
            rule={rule}
            quizIntro={seo.quizIntro}
            onStart={handleQuizStart}
            onComplete={handleQuizComplete}
          />
        </section>

        {/* Editorial FAQ */}
        <section style={sectionStyle} aria-labelledby="section-faq">
          <h2 id="section-faq" style={h2Style}>
            Questions fréquentes
          </h2>
          <div style={faqWrap}>
            {editorialFaqs.map(item => (
              <details key={item.question} style={faqItem}>
                <summary style={faqQuestion}>{item.question}</summary>
                <p style={faqAnswer}>{item.answer}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Related rules */}
        {seo.related?.length > 0 && (
          <section style={sectionStyle} aria-labelledby="section-related">
            <h2 id="section-related" style={h2Style}>
              Règles souvent confondues
            </h2>
            <div style={relatedGrid}>
              {seo.related.map(id => {
                const relRule = RULES_MAP[id];
                const relSeo = seoContent[id];
                if (!relRule) return null;
                return (
                  <Link key={id} to={`/regles/${id}`} style={relatedCard}>
                    <span style={{ fontWeight: 700, color: '#c4b5fd' }}>{relRule.title}</span>
                    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem', marginTop: '0.2rem' }}>
                      {relSeo?.niveaux || ''}
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Link back to all rules */}
        <div style={allRulesLink}>
          <Link to="/regles" style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', textDecoration: 'none' }}>
            ← Toutes les règles d'orthographe
          </Link>
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
  maxWidth: 860,
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
  maxWidth: 860,
  margin: '0 auto',
  padding: '2rem 1.5rem 4rem',
  position: 'relative',
  zIndex: 1,
};

const breadcrumbStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: '0.82rem',
  marginBottom: '1.5rem',
  flexWrap: 'wrap',
};

const breadcrumbLink = {
  color: 'rgba(255,255,255,0.5)',
  textDecoration: 'none',
};

const breadcrumbSep = {
  color: 'rgba(255,255,255,0.35)',
};

const headerStyle = {
  marginBottom: '2.75rem',
};

const levelBadge = {
  display: 'inline-flex',
  background: 'rgba(167,139,250,0.18)',
  border: '1px solid rgba(167,139,250,0.35)',
  borderRadius: 999,
  padding: '0.25rem 0.75rem',
  fontSize: '0.74rem',
  fontWeight: 700,
  color: '#c4b5fd',
  marginBottom: '0.75rem',
  fontFamily: 'Outfit, sans-serif',
};

const h1Style = {
  fontFamily: 'Outfit, sans-serif',
  fontSize: 'clamp(2rem, 5vw, 3.35rem)',
  fontWeight: 900,
  lineHeight: 1.05,
  margin: '0 0 1rem',
  color: '#fff',
  letterSpacing: '-0.02em',
};

const introStyle = {
  color: 'rgba(255,255,255,0.5)',
  fontSize: '1.03rem',
  lineHeight: 1.75,
  margin: 0,
};

const sectionStyle = {
  marginBottom: '2.5rem',
};

const h2Style = {
  fontFamily: 'Outfit, sans-serif',
  fontSize: '1.25rem',
  fontWeight: 800,
  color: '#fff',
  margin: '0 0 0.85rem',
  paddingBottom: '0.5rem',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
  letterSpacing: '-0.01em',
};

const bodyTextStyle = {
  color: 'rgba(255,255,255,0.5)',
  fontSize: '0.95rem',
  lineHeight: 1.7,
  marginBottom: '1rem',
  marginTop: 0,
};

const decisionBox = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
  padding: '1.15rem 1.25rem',
  marginTop: '1rem',
  backdropFilter: 'blur(20px)',
};

const decisionTitle = {
  fontSize: '0.82rem',
  fontWeight: 700,
  color: '#a78bfa',
  textTransform: 'uppercase',
  letterSpacing: '2px',
  margin: '0 0 0.6rem',
  fontFamily: 'Outfit, sans-serif',
};

const decisionList = {
  margin: 0,
  padding: '0 0 0 1.2rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.5rem',
};

const decisionItem = {
  color: 'rgba(255,255,255,0.85)',
  fontSize: '0.9rem',
  lineHeight: 1.6,
};

const decisionOptions = {
  margin: '0.3rem 0 0 0',
  padding: '0 0 0 1rem',
  color: 'rgba(255,255,255,0.5)',
  fontSize: '0.85rem',
  listStyle: 'disc',
};

const trapsWrap = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.8rem',
};

const trapCard = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
  padding: '1rem 1.15rem',
  backdropFilter: 'blur(20px)',
};

const trapSentence = {
  fontSize: '1rem',
  fontWeight: 600,
  margin: '0 0 0.5rem',
  lineHeight: 1.6,
};

const blankStyle = {
  display: 'inline-block',
  color: '#4ade80',
  fontWeight: 900,
  margin: '0 0.2rem',
  borderBottom: '2px solid #4ade80',
};

const trapExplanation = {
  fontSize: '0.85rem',
  color: 'rgba(255,255,255,0.5)',
  lineHeight: 1.6,
  margin: 0,
};

const relatedGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
  gap: '0.7rem',
};

const faqWrap = {
  display: 'flex',
  flexDirection: 'column',
  gap: '0.75rem',
};

const faqItem = {
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
  padding: '1rem 1.1rem',
  backdropFilter: 'blur(20px)',
};

const faqQuestion = {
  cursor: 'pointer',
  color: '#fff',
  fontWeight: 800,
  fontSize: '0.95rem',
  lineHeight: 1.45,
  fontFamily: 'Outfit, sans-serif',
};

const faqAnswer = {
  color: 'rgba(255,255,255,0.5)',
  fontSize: '0.9rem',
  lineHeight: 1.65,
  margin: '0.65rem 0 0',
};

const relatedCard = {
  display: 'flex',
  flexDirection: 'column',
  background: 'rgba(255,255,255,0.06)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 20,
  padding: '0.95rem 1rem',
  textDecoration: 'none',
  backdropFilter: 'blur(20px)',
};

const allRulesLink = {
  marginTop: '1rem',
  textAlign: 'center',
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

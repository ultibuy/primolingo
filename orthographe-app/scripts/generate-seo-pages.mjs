import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import seoContent from '../src/data/seoContent.js';
import { getEditorialFaqs } from '../src/data/seoFaq.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const BASE_URL = 'https://www.primolingo.fr';
const distDir = join(__dirname, '../dist');
const indexPath = join(distDir, 'index.html');
const rules = JSON.parse(readFileSync(join(__dirname, '../src/data/generated/seoRules.json'), 'utf8'));
const baseHtml = readFileSync(indexPath, 'utf8');
const staticCss = `
  .seo-page{min-height:100vh;background:linear-gradient(180deg,#1e1e2e 0%,#2d2b55 52%,#1a1a2e 100%) fixed;color:rgba(255,255,255,.85);font-family:'Plus Jakarta Sans',system-ui,sans-serif;position:relative;overflow-x:hidden}
  .seo-stars{position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:0}
  .seo-nav{display:flex;align-items:center;justify-content:space-between;max-width:1100px;margin:0 auto;padding:1rem 1.5rem;position:relative;z-index:1}
  .seo-logo,.seo-login,.seo-footer a,.seo-breadcrumb a,.seo-back a{color:inherit;text-decoration:none}
  .seo-logo{display:flex;align-items:center;gap:.55rem;font-family:'Outfit',sans-serif;font-weight:900;color:#fff}.seo-logo img{width:34px;height:34px;border-radius:22.37%;box-shadow:0 4px 12px rgba(30,30,46,.4)}.seo-login{color:#c4b5fd;font-family:'Outfit',sans-serif;font-weight:800;border:1.5px solid #a78bfa;border-radius:999px;padding:.55rem 1.1rem;background:transparent}
  .seo-main{max-width:860px;margin:0 auto;padding:2rem 1.5rem 4rem;position:relative;z-index:1}.seo-wide{max-width:1100px}.seo-header{margin-bottom:2.75rem}.seo-header-centered{text-align:center;margin-bottom:3rem}.seo-header h1{font-family:'Outfit',sans-serif;font-size:clamp(2rem,5vw,3.35rem);line-height:1.05;margin:.4rem 0 1rem;color:#fff;letter-spacing:-.02em}.seo-header-centered h1{font-size:clamp(2.4rem,7vw,4.7rem);line-height:1}.seo-header .accent{background:linear-gradient(135deg,#a78bfa 0%,#fbbf24 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}.seo-header p,.seo-section p{color:rgba(255,255,255,.5);line-height:1.75}
  .seo-level{display:inline-flex;background:rgba(167,139,250,.18);border:1px solid rgba(167,139,250,.35);border-radius:999px;padding:.25rem .75rem;font-family:'Outfit',sans-serif;font-size:.74rem;font-weight:800;color:#c4b5fd}
  .seo-section{margin-bottom:2.5rem}.seo-section h2{font-family:'Outfit',sans-serif;font-size:1.25rem;font-weight:800;color:#fff;border-bottom:1px solid rgba(255,255,255,.1);padding-bottom:.5rem;letter-spacing:-.01em}.seo-section h3{font-family:'Outfit',sans-serif;font-size:1rem;margin:.2rem 0 .4rem;color:#fff}
  .seo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem}.seo-rule-card,.seo-card,.seo-box{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:1.15rem 1.25rem;backdrop-filter:blur(20px);box-shadow:0 2px 8px rgba(0,0,0,.18)}.seo-rule-card{display:flex;flex-direction:column;gap:.55rem;color:inherit;text-decoration:none}.seo-rule-card h2{font-family:'Outfit',sans-serif;font-size:1.05rem;color:#c4b5fd}.seo-rule-card span{align-self:flex-start;color:#c4b5fd;background:rgba(167,139,250,.18);border:1px solid rgba(167,139,250,.35);border-radius:999px;padding:.22rem .65rem;font-family:'Outfit',sans-serif;font-size:.72rem;font-weight:800}.seo-rule-card strong{color:#c4b5fd}
  .seo-memo{overflow:auto;border:1px solid rgba(124,58,237,.22);border-radius:20px;background:rgba(124,58,237,.08);backdrop-filter:blur(20px)}.seo-memo-title{padding:.7rem 1rem;margin:0;text-transform:uppercase;font-family:'Outfit',sans-serif;font-weight:800;letter-spacing:2px;color:#a78bfa}.seo-memo table{width:100%;border-collapse:collapse}.seo-memo th,.seo-memo td{padding:.65rem .9rem;text-align:left;border-top:1px solid rgba(255,255,255,.06)}.seo-memo th{color:rgba(255,255,255,.5);font-size:.75rem;text-transform:uppercase}
  .seo-cards{display:flex;flex-direction:column;gap:.8rem}.seo-sentence strong{color:#34d399;border-bottom:2px solid #34d399;margin:0 .2rem}.seo-label{font-family:'Outfit',sans-serif;font-size:.78rem;text-transform:uppercase;letter-spacing:2px;font-weight:800;color:#a78bfa}.seo-related{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:.7rem}.seo-related a{display:flex;flex-direction:column;gap:.2rem;color:#c4b5fd;text-decoration:none;background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:.95rem 1rem;backdrop-filter:blur(20px)}.seo-related span{color:rgba(255,255,255,.5);font-size:.82rem}
  .seo-breadcrumb{display:flex;flex-wrap:wrap;gap:.4rem;color:rgba(255,255,255,.5);font-size:.82rem;margin-bottom:1.5rem}.seo-cta{display:inline-flex;background:linear-gradient(135deg,#7c3aed,#a78bfa);color:#fff;text-decoration:none;border-radius:999px;padding:.85rem 1.5rem;font-weight:800;box-shadow:0 8px 30px rgba(167,139,250,.35)}.seo-back{text-align:center}.seo-footer{display:flex;justify-content:center;gap:1rem;padding:1.5rem;color:rgba(255,255,255,.35);font-size:.82rem;position:relative;z-index:1}
  @media (max-width:640px){.seo-main{padding:1.5rem 1rem 3rem}.seo-nav{padding:1rem}.seo-header h1{font-size:2.1rem}.seo-header-centered h1{font-size:2.55rem}.seo-grid{grid-template-columns:1fr}}
`;

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeAttr(value = '') {
  return escapeHtml(value);
}

function safeJson(data) {
  return JSON.stringify(data).replaceAll('</script', '<\\/script');
}

function replaceOrInsertHead(html, pattern, replacement) {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace('</head>', `    ${replacement}\n  </head>`);
}

function withHead(html, { title, description, canonical, schema }) {
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`);

  out = replaceOrInsertHead(
    out,
    /<meta name="description" content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapeAttr(description)}" />`
  );
  out = replaceOrInsertHead(
    out,
    /<meta property="og:title" content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapeAttr(title)}" />`
  );
  out = replaceOrInsertHead(
    out,
    /<meta property="og:description" content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapeAttr(description)}" />`
  );
  out = replaceOrInsertHead(
    out,
    /<link rel="canonical" href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${escapeAttr(canonical)}" />`
  );
  out = replaceOrInsertHead(
    out,
    /<meta property="og:url" content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${escapeAttr(canonical)}" />`
  );
  out = replaceOrInsertHead(
    out,
    /<meta name="twitter:card" content="[^"]*"\s*\/?>/,
    '<meta name="twitter:card" content="summary_large_image" />'
  );
  out = replaceOrInsertHead(
    out,
    /<meta name="twitter:title" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escapeAttr(title)}" />`
  );
  out = replaceOrInsertHead(
    out,
    /<meta name="twitter:description" content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escapeAttr(description)}" />`
  );
  out = out.replace(
    '</head>',
    `    <style id="seo-static-styles">${staticCss}</style>\n    <script type="application/ld+json">${safeJson(schema)}</script>\n  </head>`
  );
  return out;
}

function writeRoute(pathname, html) {
  const filePath = join(distDir, `${pathname.replace(/^\//, '')}.html`);
  const dir = dirname(filePath);
  mkdirSync(dir, { recursive: true });
  writeFileSync(filePath, html, 'utf8');
}

function getRuleById(id) {
  return rules.find(rule => rule.id === id);
}

function getTrapQuestions(rule) {
  return (rule.questions || [])
    .filter(q => q.difficulty >= 2)
    .sort((a, b) => (b.difficulty || 0) - (a.difficulty || 0))
    .slice(0, 3);
}

function answerLabel(rule, question) {
  const choices = question.choices || rule.choices || [];
  return choices.find(choice => choice.id === question.answer)?.label || '___';
}

function renderStarField() {
  return `<svg class="seo-stars" aria-hidden="true" viewBox="0 0 1920 1600" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
    <circle cx="120" cy="180" r="1.4" fill="#fff" opacity="0.85"/><circle cx="280" cy="60" r="1" fill="#fff" opacity="0.6"/><circle cx="440" cy="240" r="1.6" fill="#fbbf24" opacity="0.9"/><circle cx="640" cy="120" r="1" fill="#fff" opacity="0.7"/><circle cx="820" cy="280" r="1.2" fill="#c4b5fd" opacity="0.8"/><circle cx="1180" cy="220" r="1.4" fill="#fff" opacity="0.7"/><circle cx="1380" cy="100" r="1.2" fill="#fbbf24" opacity="0.85"/><circle cx="1740" cy="140" r="1.3" fill="#c4b5fd" opacity="0.8"/><circle cx="80" cy="420" r="1" fill="#fff" opacity="0.6"/><circle cx="380" cy="500" r="1.4" fill="#fbbf24" opacity="0.85"/><circle cx="600" cy="460" r="1.1" fill="#fff" opacity="0.7"/><circle cx="900" cy="540" r="0.9" fill="#c4b5fd" opacity="0.7"/><circle cx="1200" cy="480" r="1.3" fill="#fff" opacity="0.7"/><circle cx="1820" cy="500" r="1.2" fill="#fbbf24" opacity="0.85"/><circle cx="160" cy="720" r="1.5" fill="#fff" opacity="0.85"/><circle cx="400" cy="780" r="1" fill="#c4b5fd" opacity="0.75"/><circle cx="700" cy="700" r="1.2" fill="#fff" opacity="0.65"/><circle cx="1020" cy="820" r="1.4" fill="#fbbf24" opacity="0.9"/><circle cx="1340" cy="740" r="1" fill="#fff" opacity="0.6"/><circle cx="1640" cy="800" r="1.3" fill="#c4b5fd" opacity="0.8"/><circle cx="80" cy="980" r="1.2" fill="#fff" opacity="0.7"/><circle cx="600" cy="1020" r="1.4" fill="#fbbf24" opacity="0.85"/><circle cx="1080" cy="1300" r="1" fill="#fbbf24" opacity="0.85"/>
    <g transform="translate(380 160)" opacity="0.95"><path d="M0 -7 L0 7 M-7 0 L7 0" stroke="#fbbf24" stroke-width="1.6" stroke-linecap="round"/></g><g transform="translate(1280 320)" opacity="0.7"><path d="M0 -5 L0 5 M-5 0 L5 0" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></g><g transform="translate(720 600)" opacity="0.85"><path d="M0 -6 L0 6 M-6 0 L6 0" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round"/></g>
  </svg>`;
}

function renderNav() {
  return `<nav class="seo-nav">
    <a class="seo-logo" href="/"><img src="/favicon.svg" alt="" width="34" height="34">PrimoLingo</a>
    <a class="seo-login" href="/login">Se connecter</a>
  </nav>`;
}

function renderFooter() {
  return `<footer class="seo-footer">
    <a href="/legal">Mentions légales</a>
    <span>·</span>
    <a href="/">PrimoLingo</a>
  </footer>`;
}

function renderMemoCard(rule) {
  if (!rule.memoCard?.rows?.length) return '';
  return `<div class="seo-memo">
    ${rule.memoCard.title ? `<p class="seo-memo-title">${escapeHtml(rule.memoCard.title)}</p>` : ''}
    <table>
      <thead><tr><th>Forme</th><th>Test de remplacement</th><th>Exemple</th></tr></thead>
      <tbody>
        ${rule.memoCard.rows.map(row => `<tr>
          <td><strong>${escapeHtml(row.form)}</strong></td>
          <td>${escapeHtml(row.test)}</td>
          <td>${escapeHtml(row.example)}</td>
        </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}

function renderDecisionAxes(rule) {
  if (!rule.decisionAxes?.length) return '';
  return `<div class="seo-box">
    <p class="seo-label">Comment raisonner étape par étape</p>
    <ol>
      ${rule.decisionAxes.map(axis => `<li>
        <strong>${escapeHtml(axis.question)}</strong>
        ${axis.options?.length ? `<ul>${axis.options.map(opt => `<li>${escapeHtml(opt.label)}</li>`).join('')}</ul>` : ''}
      </li>`).join('')}
    </ol>
  </div>`;
}

function renderTrapQuestions(rule, seo) {
  const traps = getTrapQuestions(rule);
  if (!traps.length) return '';
  return `<section class="seo-section">
    <h2>Les erreurs les plus fréquentes</h2>
    ${seo.piegesIntro ? `<p>${escapeHtml(seo.piegesIntro)}</p>` : ''}
    <div class="seo-cards">
      ${traps.map(q => `<article class="seo-card">
        <p class="seo-sentence">${escapeHtml(q.before)}<strong>${escapeHtml(answerLabel(rule, q))}</strong>${escapeHtml(q.after)}</p>
        <p><strong>Pourquoi c'est piégeux : </strong>${escapeHtml(q.explanation)}</p>
      </article>`).join('')}
    </div>
  </section>`;
}

function renderFaq(rule, seo) {
  const faqs = getEditorialFaqs(rule, seo);
  return `<section class="seo-section">
    <h2>Questions fréquentes</h2>
    <div class="seo-cards">
      ${faqs.map(item => `<article class="seo-card">
        <h3>${escapeHtml(item.question)}</h3>
        <p>${escapeHtml(item.answer)}</p>
      </article>`).join('')}
    </div>
  </section>`;
}

function renderRelated(seo) {
  if (!seo.related?.length) return '';
  return `<section class="seo-section">
    <h2>Règles souvent confondues</h2>
    <div class="seo-related">
      ${seo.related.map(id => {
        const rule = getRuleById(id);
        if (!rule) return '';
        return `<a href="/regles/${escapeAttr(id)}">${escapeHtml(rule.title)}<span>${escapeHtml(seoContent[id]?.niveaux || '')}</span></a>`;
      }).join('')}
    </div>
  </section>`;
}

function renderRulesIndex() {
  return `<div class="seo-page">
    ${renderStarField()}
    ${renderNav()}
    <main class="seo-main seo-wide">
      <header class="seo-header seo-header-centered">
        <h1>Règles d'orthographe CE1-CM2<br><span class="accent">Exercices gratuits</span></h1>
        <p>Votre enfant confond <em>a</em> et <em>à</em>, <em>ce</em> et <em>se</em>, <em>son</em> et <em>sont</em> ? Chaque règle est expliquée simplement avec une astuce de remplacement et un mini-quiz à faire ensemble.</p>
      </header>
      <div class="seo-grid">
        ${rules.map(rule => {
          const seo = seoContent[rule.id] || {};
          return `<a class="seo-rule-card" href="/regles/${escapeAttr(rule.id)}">
            <h2>${escapeHtml(rule.title)}</h2>
            ${seo.niveaux ? `<span>${escapeHtml(seo.niveaux)}</span>` : ''}
            <p>${escapeHtml(rule.description)}</p>
            <strong>Voir les exercices</strong>
          </a>`;
        }).join('')}
      </div>
    </main>
    ${renderFooter()}
  </div>`;
}

function renderRulePage(rule) {
  const seo = seoContent[rule.id] || {};
  const h1 = seo.h1 || rule.title;
  return `<div class="seo-page">
    ${renderStarField()}
    ${renderNav()}
    <main class="seo-main">
      <nav class="seo-breadcrumb" aria-label="Fil d'ariane">
        <a href="/">Accueil</a><span>›</span><a href="/regles">Règles d'orthographe</a><span>›</span><span>${escapeHtml(rule.title)}</span>
      </nav>
      <header class="seo-header">
        ${seo.niveaux ? `<span class="seo-level">${escapeHtml(seo.niveaux)}</span>` : ''}
        <h1>${escapeHtml(h1)}</h1>
        ${seo.intro ? `<p>${escapeHtml(seo.intro)}</p>` : ''}
      </header>
      <section class="seo-section">
        <h2>L'astuce pour ne plus se tromper</h2>
        ${seo.astuceIntro ? `<p>${escapeHtml(seo.astuceIntro)}</p>` : ''}
        ${renderMemoCard(rule)}
        ${renderDecisionAxes(rule)}
      </section>
      ${renderTrapQuestions(rule, seo)}
      <section class="seo-section">
        <h2>Testez avec votre enfant</h2>
        ${seo.quizIntro ? `<p>${escapeHtml(seo.quizIntro)}</p>` : ''}
        <a class="seo-cta" href="/login">Essayer gratuitement</a>
      </section>
      ${renderFaq(rule, seo)}
      ${renderRelated(seo)}
      <p class="seo-back"><a href="/regles">Toutes les règles d'orthographe</a></p>
    </main>
    ${renderFooter()}
  </div>`;
}

function renderRulesIndexSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: "Règles d'orthographe CE1-CM2",
    description: "20 règles d'orthographe avec exercices gratuits pour les enfants du primaire",
    url: `${BASE_URL}/regles`,
    numberOfItems: rules.length,
    itemListElement: rules.map((rule, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: seoContent[rule.id]?.h1 || rule.title,
      url: `${BASE_URL}/regles/${rule.id}`,
    })),
  };
}

function renderFaqSchema(rule, seo) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: getEditorialFaqs(rule, seo).map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

function buildPage({ title, description, canonical, schema, body }) {
  return withHead(baseHtml, { title, description, canonical, schema })
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
}

const rulesIndexHtml = buildPage({
  title: "Règles d'orthographe CE1-CM2 — Exercices gratuits | PrimoLingo",
  description: "20 règles d'orthographe française avec exercices interactifs gratuits pour les enfants de CE1 à CM2. Apprenez a/à/as, ce/se, son/sont et bien plus.",
  canonical: `${BASE_URL}/regles`,
  schema: renderRulesIndexSchema(),
  body: renderRulesIndex(),
});
writeRoute('/regles', rulesIndexHtml);

for (const rule of rules) {
  const seo = seoContent[rule.id] || {};
  const title = seo.h1 ? `${seo.h1} | PrimoLingo` : `${rule.title} — exercices gratuits | PrimoLingo`;
  const description = seo.metaDesc || rule.description;
  const canonical = `${BASE_URL}/regles/${rule.id}`;
  const html = buildPage({
    title,
    description,
    canonical,
    schema: renderFaqSchema(rule, seo),
    body: renderRulePage(rule),
  });
  writeRoute(`/regles/${rule.id}`, html);
}

console.log(`Generated SEO HTML pages -> /regles + ${rules.length} rule pages`);

# Plan SEO — Pages statiques par règle d'orthographe

## Objectif

Créer une page publique par règle de grammaire (/regles/a-ou-a, /regles/ce-ou-se, etc.) pour capter le trafic longue traîne ("exercice a ou à CE2", "quand mettre ce ou se"). Chaque page propose 2 questions gratuites en mode "essai" avant de pousser au login.

---

## Phase 1 — Quick wins sur l'existant (15 min)

### 1.1 `index.html` — balises meta déjà en place ✅
Déjà fait : `<title>`, `<meta description>`, `<og:title>`, `<canonical>`.

### 1.2 Schema.org JSON-LD dans `index.html`
Ajouter dans le `<head>` :
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "PrimoLingo",
  "url": "https://www.primolingo.fr",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web",
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "EUR" },
  "audience": {
    "@type": "EducationalAudience",
    "educationalRole": "student",
    "suggestedMinAge": 7,
    "suggestedMaxAge": 12
  },
  "description": "Application gratuite d'orthographe française pour enfants CE1-CM2. Méthode par répétition espacée."
}
</script>
```

### 1.3 Sémantique HTML dans la landing
Remplacer les `<div>` clés par `<h1>`, `<h2>`, `<section>` dans `LandingPageV5.jsx` pour que les crawlers comprennent la structure.

---

## Phase 2 — Pages statiques par règle (45 min)

### 2.1 Nouvelles routes

Ajouter dans `router.jsx` :
```
/regles                → Index de toutes les règles (hub SEO)
/regles/:ruleId        → Page d'une règle (ex: /regles/a-a-as)
```

Les deux sont **publiques** (pas de `ProtectedRoute`).

### 2.2 Architecture des pages

#### Page index `/regles`
- `<h1>` : "Règles d'orthographe CE1-CM2 — Exercices gratuits"
- Grille de cartes, une par règle (20 règles)
- Chaque carte : titre, description courte, lien vers `/regles/{id}`
- Schema.org `ItemList`
- Meta description dynamique

#### Page règle `/regles/:ruleId`

**Stratégie de contenu : s'adresser au parent qui cherche de l'aide**

L'audience cible n'est PAS l'enfant. C'est le parent qui tape dans Google :
- "mon fils confond a et à comment l'aider"
- "exercice ce se CE2 à imprimer"
- "règle son sont explication simple"
- "différence entre et est pour enfant"

Chaque page doit répondre à cette intention en 3 temps :
1. **Rassurer** — "cette erreur est normale, voici comment l'expliquer simplement"
2. **Outiller** — la memo card + l'astuce du test (remplacer par "avait", etc.)
3. **Convertir** — "votre enfant peut s'entraîner seul avec 200+ exercices"

**Structure de la page :**

```
┌─────────────────────────────────────┐
│ Nav (logo + "Se connecter")         │
├─────────────────────────────────────┤
│ Breadcrumb : Accueil > Règles > ... │
├─────────────────────────────────────┤
│ <h1> a, à ou as : comment aider     │
│      votre enfant à ne plus         │
│      confondre                       │
│                                      │
│ <p class="intro"> Votre enfant      │
│ confond a, à et as ? C'est l'une    │
│ des erreurs les plus fréquentes     │
│ en CE1-CE2. Voici une méthode       │
│ simple pour l'aider.                │
├─────────────────────────────────────┤
│ <h2> L'astuce pour ne plus se       │
│      tromper                         │
│ 📋 Memo Card en tableau HTML        │
│ (forme / test / exemple)            │
│ + paragraphe "Comment l'expliquer   │
│   à votre enfant" en langage simple │
├─────────────────────────────────────┤
│ <h2> Les erreurs les plus           │
│      fréquentes                      │
│ 3-4 phrases-pièges commentées       │
│ tirées des questions (difficulté 2-3)│
│ "Pourquoi c'est piégeux" en texte   │
├─────────────────────────────────────┤
│ <h2> Testez avec votre enfant       │
│ 🎯 Mini-quiz (2 questions)          │
│ Score affiché après les 2 questions │
├─────────────────────────────────────┤
│ 🔒 CTA gate                         │
│ "Votre enfant a réussi X/2 !       │
│  PrimoLingo propose 200+ exercices  │
│  sur cette règle, avec progression  │
│  et récompenses. Gratuit."          │
│  [Essayer gratuitement]              │
├─────────────────────────────────────┤
│ <h2> Règles souvent confondues      │
│ 🔗 Liens vers règles similaires     │
│ (ex: a/à → son/sont, ou/où)        │
├─────────────────────────────────────┤
│ Footer (mentions légales)           │
└─────────────────────────────────────┘
```

**Champ lexical à intégrer naturellement dans chaque page :**

| Cluster | Mots-clés à placer dans le texte |
|---------|----------------------------------|
| Problème parent | "confond", "se trompe", "fait souvent l'erreur", "n'arrive pas à", "a du mal avec" |
| Intention aide | "comment expliquer", "aider mon enfant", "exercices pour s'entraîner", "méthode simple" |
| Contexte scolaire | "CE1", "CE2", "CM1", "CM2", "primaire", "dictée", "devoirs", "évaluation" |
| Pédagogie | "astuce", "truc mnémotechnique", "règle simple", "test de remplacement", "mémoriser" |
| Confiance | "erreur fréquente", "normal à cet âge", "avec de la pratique", "progrès visibles" |

**Données enrichies par page :**

Chaque règle JSON fournit les données brutes. Le contenu SEO ajoute une couche éditoriale :

| Source JSON | Utilisation SEO |
|-------------|-----------------|
| `rule.title` | Intégré dans un `<h1>` orienté parent (pas juste "a / à / as" mais "a, à ou as : comment aider votre enfant") |
| `rule.description` | Base du paragraphe intro, reformulé pour le parent |
| `rule.memoCard.rows` | Tableau HTML sémantique `<table>` avec `<caption>` |
| `rule.memoCard.rows[].test` | "L'astuce" mise en avant (ex: "remplacer par avait") |
| `rule.decisionAxes` | Transformé en texte "Comment raisonner étape par étape" |
| `rule.questions` (diff 1) | 2 questions pour le mini-quiz |
| `rule.questions` (diff 2-3) | "Erreurs fréquentes" — phrases-pièges commentées |
| `rule.choices` | Boutons de réponse du mini-quiz |

**Contenu éditorial à générer par règle (stocké dans `seoContent` map) :**

```js
const seoContent = {
  'a-a-as': {
    h1: 'a, à ou as : comment aider votre enfant à ne plus confondre',
    intro: "Votre enfant confond « a », « à » et « as » dans ses dictées ? C'est l'une des confusions les plus courantes en CE1-CE2. La bonne nouvelle : une astuce simple permet de lever le doute à chaque fois.",
    astuceIntro: "Le test de remplacement est la méthode la plus efficace pour les enfants du primaire :",
    piegesIntro: "Certaines phrases piègent même les adultes. Voici celles qui posent le plus de problèmes :",
    quizIntro: "Essayez ces deux phrases avec votre enfant pour voir s'il maîtrise la règle :",
    related: ['son-sont', 'ou-ou', 'ces-ses'],
    niveaux: 'CE1, CE2, CM1',
  },
  'ce-se': {
    h1: 'ce ou se : la méthode simple pour ne plus se tromper',
    intro: "« Se couche » ou « ce couche » ? Votre enfant hésite souvent entre « ce » et « se » ? Cette confusion est très répandue en CE2-CM1. Voici comment l'aider à choisir à coup sûr.",
    // ...
  },
  // ... 20 règles
};
```

**SEO technique par page :**
- `<title>` : "{seoContent.h1} | PrimoLingo" (< 60 caractères)
- `<meta description>` : "{seoContent.intro}" (tronqué à 155 caractères)
- `<link rel="canonical">` : "https://www.primolingo.fr/regles/{ruleId}"
- `<meta property="og:title">` : même que title
- Schema.org `FAQPage` (les erreurs fréquentes comme questions/réponses)
- Schema.org `Quiz` (le mini-quiz)

### 2.3 Mini-quiz gratuit (le coeur de la conversion)

**Flow utilisateur :**

```
Arrive sur /regles/ce-se (via Google)
  │
  ├─ Lit l'explication + memo card
  │
  ├─ Clique "Essayer" → Question 1 s'affiche
  │  ├─ Répond (bonne/mauvaise) → feedback + explication
  │  └─ Question 2 s'affiche
  │     ├─ Répond → feedback + score (ex: "1/2")
  │     └─ ✅ Score affiché
  │
  └─ CTA gate :
     "Tu veux continuer ? Cette règle contient 200+ exercices,
      avec un système de progression et des récompenses."
     [Essayer gratuitement]  [Voir les autres règles]
```

**Implémentation :**
- Composant `MiniQuiz` autonome (pas de dépendance à l'auth)
- Prend 2 questions `difficulty: 1` de la règle
- Même UX que `QuizGuided` mais simplifié (pas d'arbre de décision, juste les choix)
- State local uniquement (pas de persistence)
- Tracking PostHog : `seo_quiz_started`, `seo_quiz_completed` (avec `rule_id`, `score`)

### 2.4 Fichiers à créer

| Fichier | Rôle |
|---------|------|
| `src/pages/RulesIndexPage.jsx` | Page hub `/regles` |
| `src/pages/RulePage.jsx` | Page individuelle `/regles/:ruleId` |
| `src/components/MiniQuiz.jsx` | Quiz 2 questions sans auth |
| `src/components/MemoCard.jsx` | Tableau récapitulatif de la règle |
| `src/components/SeoHead.jsx` | Gestion dynamique du `<title>` et `<meta>` |

### 2.5 Modifications de fichiers existants

| Fichier | Modification |
|---------|-------------|
| `router.jsx` | Ajouter les 2 routes publiques |
| `index.html` | Ajouter Schema.org JSON-LD |
| `LandingPageV5.jsx` | Ajouter lien vers `/regles` dans la nav + `<h1>`/`<h2>` sémantiques |

---

## Phase 3 — Pre-rendering pour Google (20 min)

Google peut exécuter du JS mais c'est lent et peu fiable. Le pre-rendering génère un snapshot HTML au build.

### Option A : `vite-plugin-prerender` (recommandé)
- Au `npm run build`, visite chaque route et sauvegarde le HTML
- Zéro infra serveur, compatible Firebase Hosting
- Configuration : liste des routes à pre-render

```js
// vite.config.js
import prerender from 'vite-plugin-prerender'

prerender({
  routes: [
    '/',
    '/regles',
    '/regles/a-a-as',
    '/regles/ce-se',
    // ... toutes les règles (généré dynamiquement)
  ]
})
```

### Option B : Script de build custom
- Script Node.js qui génère des fichiers HTML statiques dans `dist/regles/`
- Plus de contrôle, moins de dépendances
- Chaque fichier contient le HTML sémantique + un bootstrap React pour l'interactivité

---

## Phase 4 — Maillage et optimisation continue

### 4.1 Maillage interne
- Landing → `/regles` (lien "Toutes les règles" dans le footer)
- Chaque page règle → 3-4 règles similaires (liens "Voir aussi")
- Chaque page règle → landing (breadcrumb)
- Landing → pages règles les plus populaires

### 4.2 Sitemap
Générer `sitemap.xml` au build :
```xml
<urlset>
  <url><loc>https://www.primolingo.fr/</loc><priority>1.0</priority></url>
  <url><loc>https://www.primolingo.fr/regles</loc><priority>0.9</priority></url>
  <url><loc>https://www.primolingo.fr/regles/a-a-as</loc><priority>0.8</priority></url>
  <!-- ... 20 règles -->
</urlset>
```

### 4.3 robots.txt
```
User-agent: *
Allow: /
Disallow: /parent
Disallow: /play
Sitemap: https://www.primolingo.fr/sitemap.xml
```

### 4.4 Tracking PostHog
Nouveaux events :
- `seo_page_viewed` — visite d'une page règle (avec `rule_id`)
- `seo_quiz_started` — l'utilisateur lance le mini-quiz
- `seo_quiz_completed` — score du mini-quiz (`rule_id`, `score`, `total`)
- `seo_cta_signup_clicked` — clic sur le CTA d'inscription

---

## Résumé des livrables

| # | Livrable | Effort |
|---|----------|--------|
| 1 | Schema.org JSON-LD dans index.html | 5 min |
| 2 | Sémantique HTML dans la landing | 15 min |
| 3 | `SeoHead.jsx` — titre/meta dynamiques | 5 min |
| 4 | `RulesIndexPage.jsx` — hub des règles | 15 min |
| 5 | `MemoCard.jsx` — tableau récapitulatif | 10 min |
| 6 | `MiniQuiz.jsx` — 2 questions sans auth | 15 min |
| 7 | `RulePage.jsx` — page complète par règle | 15 min |
| 8 | Routes + maillage interne | 10 min |
| 9 | Pre-rendering (vite plugin ou script) | 20 min |
| 10 | sitemap.xml + robots.txt | 5 min |

**Total estimé : ~2h**

---

## 20 URLs générées

```
/regles/a-a-as                          → Exercice a / à / as
/regles/adverbes-ment                   → Les adverbes en -ment
/regles/ant-ent                         → -ant / -ent
/regles/ce-se                           → ce / se
/regles/ces-ses                         → ces / ses
/regles/conjugaison-3eme-groupe-present → Conjugaison 3e groupe présent
/regles/er-e-ez-ais-ait                 → -er / -é / -ez / -ais / -ait
/regles/feminin-e-ee                    → Féminin -e / -ée
/regles/g-gu-ge                         → g / gu / ge
/regles/groupes-verbes                  → Les groupes de verbes
/regles/leur-leurs                      → leur / leurs
/regles/mais-mes-met-mets              → mais / mes / met / mets
/regles/ou-ou                           → ou / où
/regles/peu-peut-peux                   → peu / peut / peux
/regles/pluriel-al-ou                   → Pluriel -al / -ou
/regles/pluriel-noms-adjectifs         → Pluriel noms et adjectifs
/regles/pp-etre-groupe                  → Participe passé avec être
/regles/pp-ir-groupes                   → Participe passé en -ir
/regles/son-sont                        → son / sont
/regles/tout-tous-toute-toutes         → tout / tous / toute / toutes
```

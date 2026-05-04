# Pages publiques et SEO

## Description

Les pages publiques permettent aux parents de découvrir PrimoLingo via les moteurs de recherche. Une page d'accueil présente l'app, un index liste les 20 règles disponibles, et chaque règle a sa propre page avec une explication détaillée, un mini-quiz gratuit de 2 questions et un appel à l'inscription.

## Parcours utilisateur

### Page d'accueil

La page d'accueil est la vitrine de PrimoLingo. Elle présente le concept de l'app, ses bénéfices pour l'enfant et un bouton d'inscription bien visible. Le header affiche le logo fusée, le lien "Règles d'orthographe" et le bouton "Se connecter".

![Page d'accueil](screenshots/seo-landing.png)

### Index des règles

La page `/regles` affiche les 20 règles d'orthographe sous forme de cartes. Chaque carte montre le nom de la règle et un badge de niveau. En cliquant sur une carte, le parent accède à la page détaillée de la règle.

![Index des 20 règles](screenshots/seo-index.png)

### Page d'une règle

Chaque règle a sa propre page (par exemple `/regles/a-a-as`). Le titre est orienté vers le parent (il mentionne l'aide apportée à l'enfant). La page contient :

- Une **fiche mémo** avec un tableau forme / test / exemple pour comprendre la règle
- Des explications claires et accessibles
- Un **mini-quiz gratuit** de 2 questions pour que le parent (ou l'enfant) puisse tester ses connaissances

![Page d'une règle avec fiche mémo](screenshots/seo-regle.png)

### Mini-quiz et appel à l'inscription

Le mini-quiz se déroule en quelques secondes :

1. L'utilisateur clique sur "Commencer"
2. Il répond à la première question et voit le feedback
3. Il répond à la deuxième question et voit le feedback
4. Son score s'affiche
5. Un **appel à l'inscription** (CTA) l'invite à créer un compte pour accéder à toutes les règles et au jeu complet

![Mini-quiz sur une page de règle](screenshots/seo-quiz.png)

Ce portail CTA est le point de conversion principal : après avoir goûté au quiz, le parent est invité à inscrire son enfant.

### Navigation

La navigation entre les pages est fluide :
- Depuis l'index, cliquer sur une carte mène à la page de la règle
- Un fil d'ariane (breadcrumb) permet de revenir à l'index
- Les pages inexistantes redirigent automatiquement vers l'index

### Référencement

Chaque page possède les balises nécessaires au bon référencement : titre, description, lien canonique et balises pour les réseaux sociaux.

### Aperçu lors d'un partage SMS

Quand un parent partage `https://www.primolingo.fr` par SMS, iMessage, WhatsApp ou une autre messagerie qui lit les balises Open Graph, l'aperçu utilise l'image déclarée dans `og:image` :

- Image source : `public/og-image.png`
- URL publique : `https://www.primolingo.fr/og-image.png`
- Format : PNG
- Dimensions : `1200 x 630`

Cette image est définie dans `index.html` via :

```html
<meta property="og:image" content="https://www.primolingo.fr/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

Les pages SEO statiques générées conservent cette image Open Graph, tout en personnalisant le titre, la description, l'URL canonique et `og:url` selon la page partagée.

## Règles

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| SEO01 | L'index affiche 20 règles | La page /regles montre 20 cartes de règles avec badges de niveau |
| SEO02 | Le titre est orienté parent | Le titre mentionne "enfant" ou "aider" |
| SEO03 | La fiche mémo est visible | Le tableau forme / test / exemple est affiché sur la page |
| SEO04 | Le mini-quiz fonctionne de bout en bout | Démarrage, question 1, feedback, question 2, score, appel à l'inscription |
| SEO05 | Les balises de référencement sont correctes | Titre, description, lien canonique et balises réseaux sociaux sont présents |
| SEO06 | La navigation interne fonctionne | Clic carte mène à la page, fil d'ariane ramène à l'index, page inexistante redirige |

## Assets statiques et PWA

### Icônes PWA

Les trois icônes déclarées dans le manifest sont générées à partir de `public/favicon.svg` (fusée blanche sur fond nuit, lettres a/é/b/c/d flottantes).

| Fichier | Taille | Usage | Lien live |
|---------|--------|-------|-----------|
| `public/icons/icon-192.png` | 192×192 | Icône standard Android / navigateurs | [icon-192.png](http://localhost:5173/icons/icon-192.png) |
| `public/icons/icon-512.png` | 512×512 | Splash screen, stores | [icon-512.png](http://localhost:5173/icons/icon-512.png) |
| `public/icons/icon-512-maskable.png` | 512×512 | Android adaptive icon (fond plein, contenu dans la safe zone 80%) | [icon-512-maskable.png](http://localhost:5173/icons/icon-512-maskable.png) |

Pour regénérer les icônes après modification du SVG : `node scripts/gen-pwa-icons.mjs`

### Favicon

| Fichier | Usage | Lien live |
|---------|-------|-----------|
| `public/favicon.svg` | Favicon navigateur (prod) | [favicon.svg](http://localhost:5173/favicon.svg) |
| `public/favicon-dev.svg` | Favicon en dev local (variante colorée pour distinguer) | [favicon-dev.svg](http://localhost:5173/favicon-dev.svg) |

### Image Open Graph

| Fichier | Dimensions | Lien live |
|---------|-----------|-----------|
| `public/og-image.png` | 1200×630 | [og-image.png](http://localhost:5173/og-image.png) |

### Illustrations (landing page)

Visuels marketing utilisés dans `LandingPageV4.jsx` :

| Fichier | Poids | Lien live |
|---------|-------|-----------|
| `public/illustrations/collectibles.png` | ~1.4 Mo | [collectibles.png](http://localhost:5173/illustrations/collectibles.png) |
| `public/illustrations/dictee-mode.png` | ~2.3 Mo | [dictee-mode.png](http://localhost:5173/illustrations/dictee-mode.png) |
| `public/illustrations/learning-schemas.png` | ~1.6 Mo | [learning-schemas.png](http://localhost:5173/illustrations/learning-schemas.png) |
| `public/illustrations/ludique.png` | ~3.9 Mo | [ludique.png](http://localhost:5173/illustrations/ludique.png) |
| `public/illustrations/revision-dates.png` | ~3.9 Mo | [revision-dates.png](http://localhost:5173/illustrations/revision-dates.png) |
| `public/illustrations/themes.png` | ~1.0 Mo | [themes.png](http://localhost:5173/illustrations/themes.png) |
| `public/illustrations/victory-anims.png` | ~1.0 Mo | [victory-anims.png](http://localhost:5173/illustrations/victory-anims.png) |

## Voir aussi

- [Inscription et connexion](./01-inscription-connexion.md)

# Plan de développement — App d'entraînement orthographe

## Contexte

Application locale d'entraînement aux règles d'orthographe françaises.
Stack : **Vite + React**. Pas de serveur, pas de backend. Tout tourne en local (`npm run dev`).
La progression est persistée dans un **fichier JSON local** (voir section Persistance).

Un exemple de composant JSX fonctionnel est fourni en référence : `quiz-ces-ses.jsx`.
Il illustre le style visuel attendu (dark mode, couleurs `#c4b5fd`, bordures, transitions) et la mécanique de quiz à deux modes.

---

## Architecture des dossiers

```
orthographe-app/
├── public/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── QuizGuided.jsx       # quiz avec pavé de décision
│   │   ├── QuizDirect.jsx       # quiz direct (4-5 boutons)
│   │   ├── RuleCard.jsx         # fiche mémo de la règle
│   │   ├── Dashboard.jsx        # écran d'accueil / progression
│   │   ├── Streak.jsx           # composant streak + couronnes
│   │   └── ProgressBar.jsx
│   ├── engine/
│   │   ├── sm2.js               # algorithme de répétition espacée
│   │   ├── session.js           # logique de session (quelle question ensuite)
│   │   └── scoring.js           # calcul couronnes, streak, déblocage
│   ├── store/
│   │   └── persistence.js       # lecture/écriture fichier JSON local
│   └── content/
│       └── rules/               # ← dossier ingéré automatiquement
│           ├── ces-ses.json
│           ├── er-e-ez-ais-ait.json
│           └── (autres règles...)
├── user-data/
│   └── progress.json            # fichier de progression utilisateur (gitignore)
├── quiz-ces-ses.jsx             # exemple de référence (ne pas intégrer tel quel)
└── PLAN_DEV.md                  # ce fichier
```

---

## 1. Base de données de contenu

### Format d'un fichier de règle (`src/content/rules/*.json`)

Chaque règle est un fichier JSON autonome avec la structure suivante :

```json
{
  "id": "ces-ses",
  "title": "ces · ses · s'est · c'est",
  "shortTitle": "ces / ses",
  "description": "Distinguer les homophones ces, ses, s'est et c'est",

  "choices": [
    { "id": "ces",  "label": "ces",   "hasEtre": false, "startsWithC": true  },
    { "id": "ses",  "label": "ses",   "hasEtre": false, "startsWithC": false },
    { "id": "sest", "label": "s'est", "hasEtre": true,  "startsWithC": false },
    { "id": "cest", "label": "c'est", "hasEtre": true,  "startsWithC": true  }
  ],

  "decisionAxes": [
    {
      "id": "conjugue",
      "question": "Verbe être présent ?",
      "options": [
        {
          "value": true,
          "label": "Oui, avec être",
          "sub": "s'est / c'est → verbe être conjugué",
          "eliminates": ["ces", "ses"]
        },
        {
          "value": false,
          "label": "Non, sans être",
          "sub": "ses / ces → déterminant devant un nom",
          "eliminates": ["sest", "cest"]
        }
      ]
    },
    {
      "id": "initiale",
      "question": "Commence par ?",
      "dependsOn": "conjugue",
      "options": [
        {
          "value": "C",
          "labelWhenEtre": "C → cela est",
          "labelWhenNoEtre": "C → ceux-là",
          "labelDefault": "C",
          "eliminates": ["ses", "sest"]
        },
        {
          "value": "S",
          "labelWhenEtre": "S → se + être",
          "labelWhenNoEtre": "S → les siens",
          "labelDefault": "S",
          "eliminates": ["ces", "cest"]
        }
      ]
    }
  ],

  "memoCard": {
    "title": "La règle en un coup d'œil",
    "rows": [
      { "form": "c'est",  "test": "cela est",  "example": "C'est beau." },
      { "form": "s'est",  "test": "se + est",  "example": "Il s'est trompé." },
      { "form": "ces",    "test": "ceux-là",   "example": "Ces livres-là." },
      { "form": "ses",    "test": "les siens", "example": "Ses affaires." }
    ]
  },

  "questions": [
    {
      "id": "q001",
      "before": "Il ",
      "after": " trompé en faisant ses calculs.",
      "answer": "sest",
      "difficulty": 1,
      "explanation": "Il se est trompé → verbe être (se + est), pronom réfléchi « se » → S. Donc : s'est."
    }
  ]
}
```

### Ingestion automatique des fichiers de règles

L'app utilise l'import glob de Vite pour charger automatiquement tous les fichiers du dossier `src/content/rules/` sans configuration supplémentaire :

```js
// src/content/loader.js
const modules = import.meta.glob('./rules/*.json', { eager: true });
export const allRules = Object.values(modules).map(m => m.default);
```

**Ajouter une nouvelle règle = déposer un fichier `.json` dans `src/content/rules/`. L'app l'ingère au prochain `npm run dev` sans toucher au code.**

---

## 2. Moteur pédagogique

### Deux modes de quiz par règle

**Mode guidé** (`QuizGuided`) — déblocable dès le premier accès à une règle.
Le joueur utilise le pavé de décision (axes d'élimination) avant de cliquer sur sa réponse. Les choix incompatibles se grisent progressivement. Ce mode est défini par les `decisionAxes` du fichier de règle.

**Mode direct** (`QuizDirect`) — **verrouillé** jusqu'à validation du mode guidé.
Condition de déblocage : avoir complété 3 sessions guidées avec un score ≥ 80% sur la règle concernée. Affiche uniquement les boutons de réponse, sans aide.

### Algorithme de répétition espacée (SM-2 simplifié)

Fichier : `src/engine/sm2.js`

Chaque question a un état individuel dans `progress.json` :

```json
{
  "questionId": "ces-ses/q001",
  "easiness": 2.5,
  "interval": 1,
  "repetitions": 0,
  "nextReviewDate": "2026-04-11",
  "lastResult": null
}
```

Après chaque réponse, le moteur met à jour ces valeurs selon SM-2 :
- Bonne réponse → l'intervalle augmente (1j → 6j → 15j → …)
- Mauvaise réponse → la question repart à interval 1

La session suivante présente en priorité les questions dont `nextReviewDate ≤ today`.

### Sélection des questions en session

Fichier : `src/engine/session.js`

Une session = 10 questions maximum, sélectionnées dans cet ordre de priorité :
1. Questions à réviser aujourd'hui (nextReviewDate ≤ today)
2. Questions jamais vues de la règle active
3. Questions les moins bien maîtrisées (easiness la plus basse)

---

## 3. Persistance utilisateur

### Stockage local sur l'ordi

Toute la progression est sauvegardée dans **`user-data/progress.json`** à la racine du projet. Ce fichier est lu au démarrage et écrit après chaque session. Il n'est jamais envoyé nulle part.

Ajouter `user-data/` au `.gitignore` pour ne pas versionner la progression perso.

Fichier : `src/store/persistence.js`

Comme le navigateur ne peut pas écrire directement sur le disque, on utilise l'API File System Access (disponible dans Chrome/Edge) : au premier lancement, l'app demande à l'utilisateur de choisir / confirmer le fichier `progress.json`. Le handle est mémorisé en session pour les écritures suivantes.

**Fallback** : si le navigateur ne supporte pas File System Access (ex. Firefox), on utilise le localStorage et on propose un bouton "Exporter ma progression" pour télécharger un JSON de backup.

### Structure de `progress.json`

```json
{
  "userId": "local",
  "createdAt": "2026-04-11",
  "streak": {
    "current": 4,
    "longest": 12,
    "lastActiveDate": "2026-04-11"
  },
  "coins": 340,
  "crowns": 2,
  "diamonds": 0,
  "rules": {
    "ces-ses": {
      "guidedUnlocked": true,
      "directUnlocked": false,
      "guidedSessionsCompleted": 2,
      "guidedBestScore": 75,
      "questions": {
        "q001": { "easiness": 2.5, "interval": 1, "repetitions": 1, "nextReviewDate": "2026-04-12" }
      }
    }
  }
}
```

---

## 4. Système de récompenses

### Monnaie : Pièces (coins)

Gagnées après chaque session, selon le score :
- 100% → 30 pièces
- ≥ 80% → 20 pièces
- ≥ 60% → 10 pièces
- < 60% → 5 pièces (consolation)

### Trophées : Couronnes et Diamants

**Couronne** (👑) — obtenue quand une règle entière est maîtrisée :
- Condition : score ≥ 90% sur 5 sessions guidées consécutives OU déblocage du mode direct avec score ≥ 80% sur 3 sessions directes.

**Diamant** (💎) — obtenu quand une règle est parfaitement maîtrisée :
- Condition : 100% sur 3 sessions directes consécutives sur la même règle.

Les couronnes et diamants sont affichés dans le Dashboard à côté de chaque règle.

### Streak — système progressif et valorisant

Un streak compte les jours consécutifs où au moins une session a été complétée.

**Règles de base :**
- Le streak s'incrémente si `lastActiveDate` = hier.
- Si `lastActiveDate` < hier − 1, le streak repart à 1.
- Une session commencée mais non terminée ne compte pas.

**Paliers de streak avec bonus croissants :**

Le bonus de streak n'est pas fixe — il augmente avec la longueur du streak pour rendre chaque journée supplémentaire de plus en plus précieuse :

| Streak | Bonus pièces/jour | Titre affiché | Flamme |
|--------|------------------|---------------|--------|
| 1–2j   | +5               | Bon début     | 🔥     |
| 3–6j   | +10              | Sur la lancée | 🔥🔥   |
| 7–13j  | +20              | En feu        | 🔥🔥🔥 |
| 14–29j | +40              | Inarrêtable   | ⚡     |
| 30j+   | +80              | Légende       | 💥     |

**Boucliers de streak :** À partir de 7 jours de streak, Damien gagne 1 bouclier 🛡️ (max 2 en stock). Un bouclier protège le streak si une journée est ratée — il est consommé automatiquement et un message apparaît : *"Ton streak a été protégé par un bouclier !"*

**Jalons de streak fêtés :** Aux jours 3, 7, 14, 30, 60, 100 — une animation spéciale + un message personnalisé s'affiche à l'ouverture de l'app (voir section UI/Animations).

Affichage dans le header : flamme + nombre de jours + titre du palier actuel. Record personnel visible dans le Dashboard.

---

## 5. Motivation utilisateur — Damien

L'app est conçue pour un utilisateur adulte qui s'entraîne seul, sans contrainte externe. La motivation doit donc être **intrinsèque et visible** : Damien doit sentir qu'il progresse, que ses efforts s'accumulent, et que revenir chaque jour a de la valeur.

### Principes directeurs

**Rendre le progrès visible à tout moment.** Damien ne doit jamais avoir l'impression de repartir de zéro. Chaque règle montre explicitement combien de questions sont maîtrisées vs à revoir. L'historique ne disparaît jamais.

**Célébrer sans infantiliser.** Les animations et messages de félicitation doivent être sobres et sincères — pas de confettis criards, pas de sons agaçants. Un effet visuel élégant et un message court suffisent. Damien est adulte.

**Le streak comme rituel quotidien.** L'objectif est que Damien développe une habitude : 10 minutes le matin ou le soir. Le système de paliers et de boucliers fait que perdre un streak long est douloureux (donc motivant à maintenir) mais pas décourageant (le bouclier absorbe un raté).

**La progression par règle comme fierté.** Obtenir la couronne 👑 d'une règle signifie qu'on l'a vraiment intégrée. Obtenir le diamant 💎 c'est un accomplissement rare à montrer (même à soi-même). Ces trophées doivent être visuellement beaux dans le Dashboard.

### Messages personnalisés aux jalons clés

À afficher dans l'écran d'accueil, en overlay ou en bannière animée, lors des jalons :

| Jalon | Message |
|-------|---------|
| 1er quiz complété | *"C'est parti, Damien. La régularité fait tout."* |
| Streak 3 jours | *"3 jours de suite — tu tiens le cap."* |
| Streak 7 jours | *"Une semaine sans faillir. C'est là que ça commence vraiment."* |
| Streak 14 jours | *"14 jours. Inarrêtable."* |
| Streak 30 jours | *"Un mois. Tu t'es prouvé quelque chose."* |
| 1ère couronne | *"Règle maîtrisée. Cette couronne, tu l'as gagnée."* |
| 1er diamant | *"Parfait, trois fois de suite. C'est gravé."* |
| Streak perdu | *"Raté hier. Ça arrive. Reprends aujourd'hui."* |
| Bouclier utilisé | *"Bouclier activé — ton streak de X jours est sauvé."* |

---

## 6. Écran d'accueil / Dashboard

Le Dashboard liste toutes les règles chargées depuis `src/content/rules/`.

Pour chaque règle :
- Titre + nombre de questions disponibles
- Indicateur de progression (% questions maîtrisées)
- Badge mode guidé (toujours disponible) / mode direct (🔒 verrouillé jusqu'à condition remplie)
- Couronne et/ou diamant si obtenus — affichés de façon proéminente
- Bouton "Continuer" (session de révision) ou "Commencer"

Header global : streak actuel 🔥 + palier, total de pièces 🪙, nombre de couronnes 👑, boucliers disponibles 🛡️.

---

## 7. UI / Animations — règles strictes

### Pendant le quiz : zéro distraction

L'écran de quiz est épuré. Aucune animation, aucun badge, aucun compteur de pièces visible pendant la session. Seuls éléments affichés : la barre de progression de session, le score courant, la phrase à compléter, les boutons de réponse, le pavé de décision (mode guidé). L'objectif est que Damien soit 100% concentré sur la question.

### À l'ouverture de l'app (Dashboard) : animations de rappel

Dès l'affichage du Dashboard, animer les éléments de récompense pour rappeler à Damien ce qu'il a déjà accompli et ce qu'il peut encore gagner :

- **Entrée animée du streak** : la flamme 🔥 pulse doucement, le compteur de jours s'incrémente visuellement (counter-up de 0 à N en ~0.8s).
- **Entrée animée des pièces** : le total de pièces s'affiche avec un léger scintillement doré.
- **Jalons** : si un jalon a été atteint depuis la dernière session (streak, couronne, diamant), un overlay plein écran s'affiche 2–3 secondes avec le message personnalisé et une animation (ex. couronne qui descend du haut avec glow). Damien peut le fermer d'un tap.
- **Règles avec trophées récents** : si une couronne ou un diamant a été gagné dans la session précédente, la carte de règle correspondante brille légèrement à l'entrée.

### En sortie de quiz (écran de résultat) : célébration proportionnelle

L'écran de fin de session affiche :
1. Le score (X/10) avec animation de comptage
2. Les pièces gagnées cette session, avec animation +N en jaune qui monte puis se stabilise dans le total
3. Si le streak a avancé : la nouvelle flamme + palier, avec micro-animation
4. Si une couronne ou un diamant est débloqué : animation dédiée (trophée qui apparaît avec glow + message du tableau §5)
5. Si une règle passe en mode direct débloqué : badge "🔓 Mode direct déverrouillé !" avec shimmer

**Ton des animations** : élégant, rapide (< 1s chacune), sans son. Pas de confettis. Style cohérent avec le dark mode de l'app (couleurs `#c4b5fd`, `#4ade80`, `#fbbf24`).

---

## 8. Workflow d'ajout de contenu (séparation des rôles)

**Claude Code** gère l'app — composants, moteur, persistance, UI.

**Cowork / Claude** génère les fichiers de questions — un fichier `.json` par règle, respectant exactement le format décrit en section 1. Ces fichiers sont déposés dans `src/content/rules/` et l'app les ingère automatiquement.

Pour générer un fichier de 40 questions sur une nouvelle règle, il suffit de demander à Cowork : *"Génère-moi un fichier de contenu pour la règle ou/où/ou n', 40 questions"* — il produit le `.json` prêt à déposer.

---

## 9. Pour démarrer

```bash
npm create vite@latest orthographe-app -- --template react
cd orthographe-app
npm install
npm run dev
```

Fournir à Claude Code :
1. Ce fichier `PLAN_DEV.md`
2. Le fichier d'exemple `quiz-ces-ses.jsx` (référence visuelle et mécanique)
3. Un premier fichier de contenu `src/content/rules/ces-ses.json` (exemple complet)

Implémenter dans cet ordre :
1. Loader de contenu (`content/loader.js`) + affichage brut dans Dashboard
2. `QuizGuided` + `QuizDirect` à partir du JSON
3. Moteur SM-2 + session
4. Persistance (`progress.json`)
5. Système de récompenses + streak
6. Polish UI (animations, transitions, responsive)

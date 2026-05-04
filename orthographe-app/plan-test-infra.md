# Plan de dev — Infrastructure de tests PrimoLingo

## Objectif

Créer une infrastructure de tests unifiée qui :

1. Centralise la documentation des tests dans un registre unique.
2. Alimente dynamiquement le panneau debug du dashboard enfant.
3. Fournit des commandes npm claires pour lancer les tests.
4. Permet de bloquer le deploy si les tests critiques échouent.
5. Permet de lancer la suite complète en local avant un gros changement.

Important : séparer clairement deux choses différentes :

- le registre affiché dans l'app : documentation des tests, catégories, critères ;
- l'exécution réelle : fichiers `tests/*.js`, runners Node, Playwright, scripts npm.

Le panneau debug ne doit pas prétendre afficher le résultat live des tests tant qu'il ne lit pas un rapport d'exécution réel. Il reste une checklist/documentation dynamique.

---

## Git / GitHub

Le repo GitHub cible est :

```txt
https://github.com/ultibuy/primolingo.git
```

Avant tout commit ou push, vérifier :

```bash
git remote -v
git status
git branch
```

Si `origin` n'est pas configuré ou pointe ailleurs :

```bash
git remote add origin https://github.com/ultibuy/primolingo.git
```

ou :

```bash
git remote set-url origin https://github.com/ultibuy/primolingo.git
```

Ne pas faire de `git push --force`, ne pas faire de `git reset --hard`, ne pas écraser les changements locaux.

---

## Phase 0 — Préconditions

Avant de construire l'infra, stabiliser l'état de base :

```bash
npm run lint
npm run build
```

Objectif :

- `npm run lint` doit passer ou les erreurs restantes doivent être explicitement documentées ;
- `npm run build` doit passer ;
- les tests critiques existants doivent être lancés au moins une fois pour savoir lesquels sont déjà cassés avant l'infra.

Ne pas construire une infra complète sur une base instable sans distinguer :

- tests cassés par l'infra ;
- tests déjà cassés avant l'infra ;
- vrais bugs applicatifs.

---

## Architecture

```
tests/
  runners/
    run-unit.js              ← lance les tests unitaires Node
    run-e2e.js               ← lance dev server + Playwright E2E
    run-predeploy.js         ← lance les tests contre dist/ (vite preview)
  coaching-banner.test.js    ← existant
  stats.test.js              ← existant
  engine.test.js             ← existant
  seo-pages.test.js          ← existant
  emotion-rules.test.js      ← existant
  characters-moods.test.js   ← existant
  ...                        ← tous les fichiers de test existants

src/debug/
  testRegistry.js            ← source unique de vérité metadata/documentation

src/components/
  DebugTestPanel.jsx         ← nouveau, remplace le tableau en dur dans Dashboard.jsx
```

Pourquoi `src/debug/testRegistry.js` et pas `tests/test-registry.js` :

- le panneau debug est dans l'app, donc il doit importer un module côté `src/` ;
- le bundle app ne doit pas dépendre du dossier `tests/` ;
- le registre doit rester metadata-only : aucun import Playwright, aucun `child_process`, aucune logique d'exécution.

---

## Phase 1 — Créer le registre de tests

### 1.1 Fichier `src/debug/testRegistry.js`

Structure par entrée :

```js
export default [
  // ── COACHING ──
  {
    id: 'C01',
    category: 'coaching',
    categoryLabel: 'Coaching — Messages de motivation',
    categoryIcon: 'target',
    rule: 'Un nouvel utilisateur voit le message de bienvenue',
    criteria: "Le message \"premier quiz\" s'affiche quand le joueur n'a fait aucune session",
    file: 'coaching-banner.test.js',
    type: 'unit',           // 'unit' | 'e2e'
    predeploy: true,        // inclus dans le pre-deploy si compatible build/preview
  },
  {
    id: 'E01',
    category: 'emotions',
    categoryLabel: 'Émotions — Comportement du personnage',
    categoryIcon: 'character',
    rule: 'Dashboard sans session → le personnage dort',
    criteria: "Sur le dashboard, si aucun quiz n'a été fait, le personnage est en mode dodo",
    file: 'emotion-rules.test.js',
    type: 'e2e',
    predeploy: false,       // nécessite mode dev/localStorage, pas en vite preview prod
  },
  // ... tous les tests existants du panneau debug
];
```

Champs :

| Champ | Type | Description |
|-------|------|-------------|
| `id` | string | Identifiant unique (C01, E01, S01, etc.) |
| `category` | string | Clé de groupe (coaching, emotions, shop, etc.) |
| `categoryLabel` | string | Label affiché dans le panneau debug |
| `categoryIcon` | string | Clé icon pour le header de section (target, character, etc.) |
| `rule` | string | Description de ce qui est testé |
| `criteria` | string | Le test passe si... |
| `file` | string | Nom du fichier de test (relatif à `tests/`) |
| `type` | `'unit'` ou `'e2e'` | Tests Node purs ou Playwright |
| `predeploy` | boolean | Inclus dans le check pre-deploy |

Ajouter aussi si utile :

| Champ | Type | Description |
|-------|------|-------------|
| `runner` | string optionnel | Commande spécifique si un fichier ne suit pas le runner standard |
| `requiresDevAuth` | boolean optionnel | `true` si le test dépend de `import.meta.env.DEV` |
| `requiresPreview` | boolean optionnel | `true` si le test doit tourner contre `vite preview` |
| `status` | string optionnel | `active`, `todo`, `manual`, `deprecated` |

Important : une entrée du registre décrit une règle testée, mais le runner exécute souvent un fichier entier. Tant que les fichiers de test ne produisent pas un rapport structuré par ID, le système ne saura pas dire automatiquement "C03 a échoué" ; il saura seulement que `coaching-banner.test.js` a échoué.

### 1.2 Catégories

Reprendre les catégories du panneau debug actuel :

| Catégorie | Icon | Tests existants |
|-----------|------|----------------|
| `coaching` | target | C01-C16 — coaching-banner.test.js |
| `shop` | coins | S01-S07 — (pas de fichier dédié encore) |
| `emotions` | character | E01-E06 — emotion-rules.test.js |
| `dictee` | book | D01-D06 — dictee-flow.test.js |
| `stats` | chart | T01-T04 — stats.test.js |
| `pin` | lock | P01-P05 — pin-parental.test.js |
| `audio` | motion | A01-A03 — play-word-button.test.js |
| `characters` | character | K01-K04 — characters-moods.test.js |
| `engine` | trophy | N01-N33 — engine.test.js |
| `progression` | crown | N14-N25 — progression-flow.test.js |
| `parent` | shield | N26-N31 — parent-dashboard.test.js |
| `seo` | target | SEO01-SEO53 — seo-pages.test.js |
| `design` | palette | DS01-DS... — design-refactor-regression.test.js |

### 1.3 Migration des données

Transférer les ~80 lignes du tableau en dur dans Dashboard.jsx vers `test-registry.js`. Chaque entrée `[id, rule, criteria]` du tableau devient un objet structuré avec le fichier de test correspondant.

---

## Phase 2 — Panneau debug dynamique

### 2.1 Créer `src/components/DebugTestPanel.jsx`

Ce composant :

- Importe `src/debug/testRegistry.js`.
- Groupe les tests par `category`.
- Rend le même tableau que l'actuel (ID, règle testée, le test passe si…).
- Affiche le nombre total de tests et de suites dynamiquement.
- Utilise les icônes SVG de `ProductIcons.jsx` pour les headers de catégorie au lieu des emoji actuels.

### 2.2 Modifier `Dashboard.jsx`

- Supprimer le tableau en dur (~120 lignes de données, lignes 1810-1916).
- Importer et rendre `<DebugTestPanel />` à la place.
- Le panneau debug reste conditionné à `isLocalhost`.

### 2.3 Critères

- Le panneau debug affiche exactement les mêmes informations qu'avant.
- Le compteur "N suites · M tests" est calculé dynamiquement.
- Si on ajoute un test au registre, il apparaît automatiquement dans le panneau.

---

## Phase 3 — Scripts de test

### 3.1 `tests/runners/run-unit.js`

```js
// Lit src/debug/testRegistry.js
// Filtre les tests type === 'unit'
// Déduplique par fichier
// Exécute chaque fichier avec child_process.execSync
// Affiche un résumé pass/fail
// Exit code 1 si un test échoue
```

### 3.2 `tests/runners/run-e2e.js`

```js
// Lit src/debug/testRegistry.js
// Filtre les tests type === 'e2e'
// Déduplique par fichier
// Démarre le dev server (npx vite --port 5199)
// Attend que le serveur soit prêt (polling HTTP)
// Exécute chaque fichier Playwright avec BASE_URL=http://localhost:5199
// Tue le serveur
// Affiche un résumé
// Exit code 1 si un test échoue
```

Ce runner tourne contre un serveur Vite dev. Il est adapté aux tests enfant qui utilisent :

- `import.meta.env.DEV` ;
- user fake `localhost-dev` ;
- injection localStorage.

Il ne doit pas être confondu avec les tests predeploy contre `dist/`.

### 3.3 `tests/runners/run-predeploy.js`

```js
// 1. npm run lint (via execSync)
// 2. npm run build (via execSync) — construit dist/
// 3. Filtre src/debug/testRegistry.js par predeploy === true
// 4. Exécute les tests unitaires predeploy
// 5. Démarre vite preview sur dist/ (port 4173)
// 6. Exécute les tests E2E predeploy contre http://localhost:4173
// 7. Tue le serveur preview
// 8. Exit code 1 si quoi que ce soit échoue → deploy bloqué
```

Attention : `vite preview` exécute l'app en mode production. Les routes protégées n'ont plus le bypass dev `localhost-dev`. Donc seuls les E2E publics ou explicitement compatibles preview doivent être inclus en `predeploy`.

### 3.4 Sélection des tests predeploy

Tests inclus dans le pre-deploy (ne nécessitent pas d'auth) :

| ID | Fichier | Raison |
|----|---------|--------|
| C01-C16 | coaching-banner.test.js | Unit, engine critique |
| T01-T04 | stats.test.js | Unit, calculs |
| N01-N33 | engine.test.js | Unit, scoring/SM-2 |
| SEO* | seo-pages.test.js | E2E public, pas d'auth |
| DS publics | design-refactor-regression.test.js | Seulement les cas publics compatibles preview, si séparés |

Tests exclus du pre-deploy preview (nécessitent mode dev, auth ou état local protégé) :

| ID | Fichier | Raison |
|----|---------|--------|
| E01-E06 | emotion-rules.test.js | Nécessite `/play/:childId` + bypass dev/localStorage |
| S01-S07 | — | Nécessite `/play/:childId`, boutique, état local |
| P01-P05 | pin-parental.test.js | Nécessite `/play/:childId` + bypass dev/localStorage |
| D01-D06 | dictee-flow.test.js | Nécessite `/play/:childId` + bypass dev/localStorage |
| K01-K04 | characters-moods.test.js | Nécessite `/play/:childId` + bypass dev/localStorage |
| EndScreen design | end-screen-redesign.test.js | À lancer en dev tant qu'il dépend du bypass dev |

Ces tests restent importants : ils doivent tourner dans `npm run test:e2e` ou `npm run test:all`, mais pas forcément dans `test:predeploy`.

---

## Phase 4 — Package.json

### 4.1 Scripts à ajouter/modifier

```json
{
  "scripts": {
    "build": "node scripts/generate-seo-data.mjs && node scripts/generate-sitemap.mjs && vite build && node scripts/generate-seo-pages.mjs",
    "lint": "eslint .",
    "test:unit": "node tests/runners/run-unit.js",
    "test:e2e": "node tests/runners/run-e2e.js",
    "test:all": "node tests/runners/run-unit.js && node tests/runners/run-e2e.js",
    "test:predeploy": "node tests/runners/run-predeploy.js",
    "deploy": "node tests/runners/run-predeploy.js && firebase deploy --only hosting",
    "deploy:raw": "firebase deploy --only hosting"
  }
}
```

`deploy:raw` est optionnel et doit être réservé aux cas d'urgence. La commande normale à utiliser est `npm run deploy`.

### 4.2 Commandes utilisateur

| Commande | Quand l'utiliser | Durée estimée |
|----------|-----------------|---------------|
| `npm run lint` | Check rapide après edit | 2s |
| `npm run test:unit` | Après modif engine/coaching/scoring | 5s |
| `npm run test:e2e` | Après modif UI (nécessite dev server auto) | 30-60s |
| `npm run test:all` | Avant un gros merge | 60-90s |
| `npm run deploy` | Remplace `firebase deploy` — teste + build + deploy | 90-120s |

### 4.3 Blocage réel du deploy

`npm run deploy` bloque le deploy seulement si tout le monde l'utilise.

Si on veut empêcher réellement un `firebase deploy --only hosting` direct de contourner les tests, il faut ajouter un hook `predeploy` dans `firebase.json`, ou mettre en place une CI obligatoire.

Option A — simple local :

```json
{
  "hosting": {
    "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run test:predeploy"]
  }
}
```

À adapter à la structure réelle du repo et à `RESOURCE_DIR`.

Option B — CI GitHub Actions :

- lancer `npm ci` ;
- lancer `npm run lint` ;
- lancer `npm run build` ;
- lancer `npm run test:unit` ;
- lancer les tests E2E compatibles CI ;
- autoriser deploy seulement si le workflow passe.

Recommandation pragmatique :

- première étape : `npm run deploy` pour sécuriser les deploys manuels ;
- deuxième étape : GitHub Actions ou hook Firebase si les contournements deviennent un vrai risque.

---

## Phase 5 — Vérification

### 5.1 Vérifier le registre

- Chaque test du panneau debug a un fichier de test correspondant.
- Chaque fichier de test dans `tests/` a au moins une entrée dans le registre.
- Les compteurs (suites et tests) sont corrects.
- Le registre n'importe aucun module Playwright, Node runner ou code qui ne doit pas entrer dans le bundle.

### 5.2 Vérifier les runners

```bash
npm run test:unit      # passe, 0 exit code
npm run test:e2e       # passe, serveur démarré et tué proprement
npm run test:all       # les deux en séquence
npm run deploy         # lint + build + predeploy tests + firebase deploy
```

### 5.3 Vérifier le panneau debug

- Ouvrir `/play/local-child` en local.
- Le panneau debug affiche le même contenu qu'avant.
- Le compteur est dynamique ("N suites · M tests").
- Ajouter une entrée dans le registre → elle apparaît dans le panneau.

### 5.4 Vérifier le blocage deploy

- Introduire volontairement un échec (ex: casser un test unit).
- `npm run deploy` doit échouer et ne pas appeler `firebase deploy`.
- Rétablir le test → `npm run deploy` passe et déploie.
- Si un hook Firebase ou une CI est ajouté, vérifier aussi qu'un deploy direct est bloqué.

---

## Risques

- Les tests E2E qui nécessitent `/play/:childId` dépendent d'un état local (localStorage). Si l'état n'existe pas, les tests échouent. Les runners E2E devront peut-être injecter un état de test minimal.
- Le port du dev server (5199) ou du preview (4173) peut être occupé. Les runners doivent gérer le cas et choisir un port libre ou échouer proprement.
- Le backend local (`server/local-api.mjs` sur port 3001) est souvent déjà lancé ou crashe. Les tests E2E publics (SEO) n'en ont pas besoin. Les tests enfant (`/play/`) peuvent en dépendre pour certains flows.
- Le panneau debug affiche une documentation des tests, pas le statut d'exécution. Ne pas afficher "passed/failed" sans rapport réel.
- Un test file peut couvrir plusieurs IDs. Sans reporter structuré par ID, le runner ne pourra pas produire un résultat atomique par ligne du panneau.
- Les tests preview/prod n'ont pas accès au bypass dev `localhost-dev`. Ne pas classer un test `/play/:childId` en `predeploy` sans stratégie auth explicite.

---

## Ordre d'implémentation

1. Stabiliser `npm run lint` et `npm run build`, ou documenter les échecs préexistants.
2. Créer `src/debug/testRegistry.js` avec toutes les entrées du panneau debug actuel.
2. Créer `src/components/DebugTestPanel.jsx`.
3. Remplacer le tableau en dur dans `Dashboard.jsx` par `<DebugTestPanel />`.
4. Ajouter d'abord des scripts npm simples pour les tests critiques existants.
5. Créer `tests/runners/run-unit.js`.
6. Créer `tests/runners/run-e2e.js`.
7. Créer `tests/runners/run-predeploy.js`.
8. Mettre à jour `package.json`.
9. Tester chaque commande.
10. Vérifier le panneau debug.
11. Vérifier le blocage deploy via `npm run deploy`.
12. Décider ensuite si on ajoute Firebase predeploy ou GitHub Actions pour un blocage non contournable.

---

## Définition de terminé

- Le panneau debug est alimenté dynamiquement par le registre.
- `npm run test:unit` exécute tous les tests unitaires.
- `npm run test:e2e` démarre un serveur, exécute Playwright, tue le serveur.
- `npm run test:all` fait les deux.
- `npm run deploy` bloque si un test predeploy échoue.
- Aucune donnée de test n'est dupliquée entre le registre et le code.
- Le registre de tests est dans `src/debug/testRegistry.js`, metadata-only, utilisable par l'app et les runners.
- Le remote GitHub `origin` pointe vers `https://github.com/ultibuy/primolingo.git` avant tout push.

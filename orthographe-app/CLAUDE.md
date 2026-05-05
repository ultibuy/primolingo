# PrimoLingo

App de grammaire/orthographe française pour enfants (CE1-CM2). React + Vite + Firebase Hosting + Firestore.

## Dev local

Mode debug automatique sur localhost : uid = `localhost-dev`, données dans localStorage (pas Firestore).

```bash
npm run dev          # Vite sur :5173
firebase deploy      # déployer en prod
```

## Sécurité

App utilisée par des enfants — toute donnée personnelle est sensible (RGPD, protection des mineurs).
- Le code parental est hashé (SHA-256 + salt). Ne jamais stocker de PIN en clair.
- Ne jamais exposer de données enfant (prénom, progression) dans les logs, erreurs Sentry, ou URLs publiques.
- Les Firebase Security Rules sont la dernière ligne de défense — ne pas les assouplir sans raison.
- Ne jamais committer de secrets (.env, tokens, service account keys).

## Firebase — maîtriser les coûts

Chaque read Firestore compte. Le design actuel minimise les lectures :
- `progress` est le document unique par enfant — tout est dedans (stats, shop, coaching, streak). Éviter de créer des sous-collections.
- `statsHistory[]` est embarqué dans `progress` (0 read supplémentaire pour les graphiques parent).
- Toujours se demander "combien de reads/writes ça coûte ?" avant d'ajouter un appel Firestore.

## Dates — règle absolue

**Ne jamais utiliser `new Date().toISOString().slice(0, 10)` pour produire une date locale.**
`toISOString()` renvoie l'heure UTC : à UTC+2, minuit local = veille UTC, ce qui décale toutes les comparaisons de dates d'un jour.

Toujours utiliser les fonctions centralisées de `src/engine/sm2.js` :

```js
import { getToday, formatLocalDate, parseLocalDate } from '../engine/sm2.js';

getToday()          // "2026-05-01" — date locale du jour
getToday(-7)        // il y a 7 jours
formatLocalDate(d)  // Date → "YYYY-MM-DD" local
parseLocalDate(s)   // "YYYY-MM-DD" → Date locale (pas new Date(s) qui est UTC)
```

`new Date().toISOString()` est toléré uniquement pour les **timestamps d'affichage** (ex : `savedAt` affiché dans le dashboard parent) — jamais pour construire une clé, comparer deux dates ou calculer un intervalle.

## Intégrité des données

`updateStatsHistory(next, GRAMMAR_IDS)` doit être appelé **avant** chaque `persistProgress(next)` dans ChildApp. Oubli = graphiques parent silencieusement cassés.

## Réutilisation des composants

**Réutiliser avant de recréer.** Avant d'écrire un nouveau composant UI ou du style inline, chercher dans `src/components/` si un composant existant couvre le besoin. Si le besoin est proche, étendre le composant existant plutôt que d'en dupliquer le style à la main. Exemples clés : `UpdateBanner` pour les banners système, `PopupModal` pour les modales, `MotivationBanner` pour les messages de coaching.

## Comportement général

Quand l'utilisateur pose une question (diagnostic, explication, "pourquoi..."), répondre uniquement — ne pas modifier de code sauf si l'utilisateur demande explicitement une action ou un fix.

## Debugging

1. Commencer par lire le code pour formuler des hypothèses
2. Si le diagnostic n'est pas certain, ou si une tentative de fix échoue : consulter les logs avant de réessayer
   - **Firebase Hosting** : `gcloud logging read 'resource.type="firebase_domain"' --project=orthographe-eabb9 --limit=20`
   - **Sentry** : `scripts/sentry-check.sh`
   - **Client** : demander à l'utilisateur DevTools → Network + Console
3. Ne pas enchaîner les tentatives de fix sans données

## Commits

Committer à la fin de chaque tâche demandée par l'utilisateur, une fois que ça fonctionne. Un commit par demande utilisateur, pas par fichier modifié. Message en anglais : `<type>: <description>` — ex: `fix: delta chart inflated by first history entry`. Types : `feat`, `fix`, `refactor`, `test`.

## Tests

Tous en **Playwright** (ESM). Serveur dev requis sur :5173.

Avant de lancer des tests E2E, vérifier que le serveur dev tourne sur `http://localhost:5173`. S'il ne répond pas, le démarrer en arrière-plan (`npm run dev &`). Toujours utiliser les scripts npm (`npm run test:xxx`) plutôt que `node tests/xxx.js` directement — les scripts configurent le `BASE_URL` correct (`localhost`, pas `127.0.0.1`).

Toute nouvelle fonctionnalité doit être couverte par un test Playwright. Les tests existants doivent être mis à jour quand le comportement qu'ils couvrent change. Ne pas lancer la suite de tests systématiquement — uniquement quand c'est pertinent (changement UI, refacto, bug fix).

Pour les modules de `src/engine/`, privilégier le TDD : écrire les tests avant le code pour verrouiller la spec.

```bash
npm run test:visual        # pages publiques
npm run test:emotions      # émotions personnage
npm run test:characters    # 17 personnages + 10 moods
npm run test:pin           # code parental
npm run test:personas      # flow boutique → quiz
npm run test:stats         # unitaires (pas de serveur)
npm run test:stats:e2e     # graphiques parent
```

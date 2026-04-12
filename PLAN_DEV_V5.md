# Plan de développement V5 — Thèmes, polish & rigueur

Ce document compile tout ce qui reste à faire après V3 et V4. Les plans précédents (V2 = architecture, V3 = bugs/polish, V4 = refonte UX) sont majoritairement implémentés. Le V5 se concentre sur trois axes :

1. **Faire fonctionner les thèmes de bout en bout** (migration CSS variables)
2. **Brancher les consommables achetés en boutique** (aujourd'hui l'achat marche mais l'effet en jeu n'existe pas)
3. **Finitions et rigueur** (EndScreen enrichi, mini-cards, accessibilité, tests)

**Contexte :** la boutique a été testée intégralement avec debug 9999 coins. 4 bugs ont été corrigés pendant le test (coffre hebdomadaire +0, équipement cassé, applyTheme jamais appelé, mismatch noms de thèmes). Tout le reste V3/V4 est fait sauf les points listés ci-dessous.

---

## SECTION A — Thèmes : migration des couleurs hardcodées

### A1. Remplacer toutes les couleurs hardcodées par des CSS variables

**Problème :** `applyTheme()` met à jour les CSS variables sur `:root`, mais 95% des composants utilisent des couleurs en dur dans leurs styles inline. Résultat : acheter et équiper un thème ne change que le `<body>` background — le reste de l'app garde la palette violette par défaut.

**Scope :** ~30+ instances à migrer dans 8 fichiers.

**Variables définies dans `index.css` :**
```css
:root {
  --color-primary: #a78bfa;   /* violet principal */
  --color-accent: #c4b5fd;    /* violet clair */
  --color-bg1: #1e1e2e;       /* fond sombre */
  --color-bg2: #2d2b55;       /* fond dégradé */
}
```

**Fichiers à migrer (par ordre de priorité) :**

| Fichier | Couleurs hardcodées à remplacer |
|---------|-------------------------------|
| `Dashboard.jsx` | `#a78bfa` → `var(--color-primary)`, `#c4b5fd` → `var(--color-accent)`, `#1e1e2e` → `var(--color-bg1)`, `#2d2b55` → `var(--color-bg2)`, les `rgba(167,139,250,...)` → `rgba(var(--color-primary-rgb),...)` |
| `RuleCard.jsx` | Idem — boutons, bordures, progress bars |
| `QuizGuided.jsx` | Fond de page, boutons du pavé de décision |
| `QuizDirect.jsx` | Fond de page, boutons de réponse |
| `EndScreen.jsx` | Fond, boutons, barre de progression |
| `Shop.jsx` | Fond de page (`pageStyle`), onglets actifs, boutons d'achat |
| `ReturnScreen.jsx` | Fond, cartes |
| `App.jsx` | Background global si applicable |

**Approche recommandée :**
1. Ajouter une variable RGB compagnon pour chaque couleur (nécessaire pour les `rgba()`) :
   ```css
   :root {
     --color-primary: #a78bfa;
     --color-primary-rgb: 167, 139, 250;
     --color-accent: #c4b5fd;
     --color-accent-rgb: 196, 181, 253;
     --color-bg1: #1e1e2e;
     --color-bg1-rgb: 30, 30, 46;
     --color-bg2: #2d2b55;
     --color-bg2-rgb: 45, 43, 85;
   }
   ```
2. Mettre à jour `applyTheme()` dans `economy.js` pour setter aussi les variantes RGB
3. Faire un search-and-replace fichier par fichier
4. Tester visuellement avec chaque thème

**Attention :** les styles inline React n'acceptent pas `var(--xxx)` directement dans les propriétés numériques. Pour les `rgba()`, utiliser la syntaxe : `background: \`rgba(var(--color-primary-rgb), 0.15)\`` ou passer par des classes CSS.

### A2. Ajouter un bouton "reset thème" / déséquiper

**Problème :** une fois un thème équipé, impossible de revenir au thème par défaut.

**Action :**
- Dans `Shop.jsx`, quand un thème est "Équipé", le bouton devient "Équipé ✓" mais un tap dessus propose "Déséquiper ?" → remet `equipped.theme = null` → appelle `applyTheme('default')`

---

## SECTION B — Consommables : brancher les effets en jeu

### B1. Indice (reveal-hint) — mode direct uniquement

**Problème :** l'item "Indice" (25 coins) est achetable mais n'a aucun effet en jeu. Il est censé montrer les axes de décision pendant 1 question en mode direct.

**Action :**
- Stocker les indices achetés dans `progress.shop.inventory.revealHint` (compteur)
- Dans `QuizDirect.jsx`, ajouter un bouton 💡 discret dans le header de la question
- Au clic : décrémenter `inventory.revealHint`, afficher temporairement le `DecisionPanel` pour cette question
- Le bouton est grisé si `inventory.revealHint === 0`
- Sauvegarder la consommation dans progress

### B2. Revanche (rematch) — après session ratée

**Problème :** l'item "Revanche" (30 coins) est achetable mais non consommable. Il devrait permettre de rejouer une session ratée avec les mêmes questions.

**Action :**
- Dans `EndScreen.jsx`, si le score < 80% ET `inventory.rematch > 0`, afficher un bouton "🔄 Revanche (1 restante)"
- Au clic : décrémenter `inventory.rematch`, relancer `handlePlay` avec les mêmes `sessionQuestions` (les stocker dans le state de App.jsx)
- Le score de la revanche remplace celui de la session initiale

### B3. Mode Sniper — session spéciale

**Problème :** l'item "Mode Sniper" (50 coins) n'a pas d'effet. Il devrait lancer une session courte de 5 questions difficulté max.

**Action :**
- Dans `Dashboard.jsx`, ajouter un bouton "🎯 Mode Sniper" (visible si `inventory.modeSniper > 0`)
- Au clic : décrémenter `inventory.modeSniper`, lancer `handlePlay` avec un mode spécial `'sniper'`
- Dans `session.js`, ajouter une logique `selectSniperQuestions()` : 5 questions, toutes de difficulté max (priorité aux règles de niveau élevé, questions les plus dures)
- Le scoring Sniper peut donner un bonus de coins (×1.5 ou ×2)

### B4. Question mystère — swap pendant le quiz

**Problème :** l'item "Question mystère" (16 coins) n'a pas d'effet. Il devrait remplacer la prochaine question par une d'une autre règle.

**Action :**
- Dans `QuizGuided.jsx` et `QuizDirect.jsx`, ajouter un bouton ❓ dans le header de la question
- Au clic : décrémenter `inventory.questionMystery`, remplacer la question courante par une question aléatoire d'une autre règle
- La question mystère ne compte pas dans le score de la session (bonus pur : +coins si bonne réponse, 0 si mauvaise)

### B5. Double coins — effet session suivante

**Problème :** l'item "Double coins" (65 coins) est achetable mais l'effet n'est pas branché.

**Action :**
- Dans `App.jsx`, à l'achat, mettre un flag `progress.shop.activeEffects.doubleCoins = true`
- Dans `handleSessionEnd`, si ce flag est true : `coins = coins * 2`, puis reset le flag à false
- Afficher un indicateur "×2" doré dans le header du quiz quand le boost est actif

### B6. Bouclier de streak — déjà partiellement branché ?

**Action :** vérifier que le bouclier consomme bien un shield quand le streak serait perdu (dans `updateStreak` / `scoring.js`). Si ce n'est pas le cas, brancher la logique : quand `streak` devrait passer à 0, vérifier `shields > 0`, décrémenter shields, et garder le streak.

---

## SECTION C — EndScreen enrichi

### C1. Barre de progression vers le prochain niveau

**Problème :** l'écran de fin de session montre le score et les coins mais pas la progression vers le prochain niveau. Le joueur ne sait pas où il en est dans la montée de niveau de la règle.

**Action :**
- Après le score et les coins, afficher :
  ```
  Prochain objectif : Couronne 👑
  [████████░░] 2/3 sessions directes ≥ 80%
  Plus qu'une session !
  ```
- La barre s'anime (de l'état avant-session vers le nouvel état, 0.8s ease-out)
- Si le prochain niveau est atteint DANS cette session, ne pas afficher la barre mais l'animation de level-up existante
- Messages contextuels :
  - 1/N → "C'est bien parti."
  - (N-1)/N → "Plus qu'une session !"
  - N/N → animation level-up

### C2. Prochain palier de streak

**Action :**
- Sous le streak dans l'EndScreen, afficher :
  ```
  Encore 3 jours pour "En feu" 🔥🔥🔥
  ```
- Calculer : `prochainPalier.joursMin - streak.current`
- Si le palier vient d'être atteint, afficher le message milestone à la place

---

## SECTION D — Améliorations UX restantes

### D1. Mini-cards pour les règles "À découvrir"

**Problème :** quand il y a 5-6 règles "Nouvelle" (niveau 0), elles prennent autant de place que les règles en cours. L'écran est encombré.

**Action :**
- Dans la section "À découvrir", afficher les règles de niveau 0 sous forme de mini-cards compactes (une seule ligne : titre + bouton "Découvrir")
- Seule la règle "Prochaine règle recommandée" garde une carte pleine
- Les autres sont en format liste compacte

### D2. Indicateur "prochain palier streak" sur le Dashboard

**Action :**
- Dans le header sticky, sous le titre du streak, ajouter en petit :
  ```
  Plus que 3j → "En feu"
  ```
- Disparaît si `todayDone` (pour ne pas encombrer)

### D3. Coffre hebdomadaire — amélioration visuelle

**Problème :** le coffre fonctionne maintenant (bug +0 fixé) mais le visuel est un simple emoji 🎁 avec du texte. Le plan V3 prévoyait un SVG de coffre avec animation d'ouverture.

**Action :**
- Remplacer le bouton emoji par un petit SVG de coffre (rectangle + couvercle + cadenas doré)
- Animation d'ouverture au tap :
  1. Cadenas tombe (translateY +30px, fade out, 0.3s)
  2. Couvercle s'ouvre (rotateX, 0.4s avec rebond)
  3. Particules dorées sortent
  4. Montant de coins apparaît (+XX 🪙, bounce-in)
  5. Après 2s, le coffre disparaît et les coins s'ajoutent au header

---

## SECTION E — Accessibilité

### E1. Ajouter des aria-labels sur tous les boutons interactifs

**Problème :** zéro attribut `aria-*` dans tout le codebase. L'app est inaccessible aux lecteurs d'écran.

**Fichiers à modifier :**

| Composant | Boutons à labelliser |
|-----------|---------------------|
| `Dashboard.jsx` | Bouton shop (`aria-label="Ouvrir la boutique"`), bouton streak, bouton coffre |
| `Shop.jsx` | Bouton retour, onglets, boutons Acheter/Équiper |
| `QuizGuided.jsx` | Boutons de réponse, boutons du pavé de décision |
| `QuizDirect.jsx` | Boutons de réponse |
| `EndScreen.jsx` | Bouton continuer, bouton revanche |
| `RuleCard.jsx` | Bouton S'entraîner |

### E2. Rôles ARIA sur les composants custom

**Action :**
- Onglets de la boutique : `role="tablist"` sur le conteneur, `role="tab"` + `aria-selected` sur chaque onglet
- Overlay de confirmation : `role="dialog"` + `aria-modal="true"`
- Barre de progression des règles : `role="progressbar"` + `aria-valuenow` + `aria-valuemax`

---

## SECTION F — Qualité technique

### F1. Gestion d'erreur localStorage

**Problème :** si le localStorage est plein (quota exceeded), `saveProgress()` échoue silencieusement. Le joueur perd sa progression sans savoir pourquoi.

**Action :**
- Dans `persistence.js`, wraper `localStorage.setItem()` dans un try-catch
- En cas d'erreur quota : afficher un toast/notification "Espace de stockage plein. Ta progression n'a pas pu être sauvegardée."
- Bonus : ajouter un export JSON de la progression (bouton "Exporter mes données" dans un futur écran Paramètres)

### F2. Retirer le mode debug avant la livraison

**Action :**
- Dans `App.jsx` : remettre `DEBUG_MODE = false`
- Retirer la ligne `if (DEBUG_MODE) next.coins = 9999;`
- Vérifier que les seuils de progression sont ceux de production (3 sessions guidées, 3 sessions directes, etc.)

### F3. Tests end-to-end en mode debug

**Checklist :**
- [ ] Niveau 0 → 1 : 1 session guidée → étoile bronze
- [ ] Niveau 1 → 2 : 1 session guidée ≥ 80% → étoile argent, mode direct débloqué
- [ ] Niveau 2 → 3 : 1 session directe ≥ 80% → couronne
- [ ] Niveau 3 → 4 : 1 session directe 100% → diamant, SM-2 activé
- [ ] Niveau 5 : révision SM-2 ≥ 90% → diamant brillant
- [ ] Niveau 5 : révision SM-2 < 80% → diamant ternit
- [ ] Streak : s'incrémente 1 seule fois par jour
- [ ] Bouclier de streak : consommé quand streak serait perdu
- [ ] Boutique : achat déduit les coins
- [ ] Boutique : thème équipé change TOUTE la palette (après A1)
- [ ] Boutique : consommables fonctionnent en jeu (après B1-B6)
- [ ] Coffre hebdomadaire : s'ouvre le lundi, streak ≥ 1, pas de +0

### F4. Tests responsive mobile

**Checklist :**
- [ ] Dashboard scrolle sans accroc sur iPhone 12/13 viewport
- [ ] Boutons du quiz assez grands pour un pouce (min 44×44px)
- [ ] Boutique utilisable en scroll vertical
- [ ] Cartes de règle ne débordent pas
- [ ] Overlays centrés et pas coupés
- [ ] Header sticky ne recouvre pas le contenu

---

## Ordre d'exécution recommandé

```
PHASE 1 — Thèmes fonctionnels (rend l'achat de thèmes utile)
  1. A1 — Migrer les couleurs hardcodées → CSS variables
  2. A2 — Bouton déséquiper thème

PHASE 2 — Consommables fonctionnels (rend les achats En jeu utiles)
  3. B5 — Double coins (le plus simple à brancher)
  4. B6 — Vérifier/brancher bouclier de streak
  5. B1 — Indice en mode direct
  6. B2 — Revanche après session ratée
  7. B4 — Question mystère
  8. B3 — Mode Sniper (le plus complexe)

PHASE 3 — EndScreen & UX
  9. C1 — Barre de progression prochain niveau
  10. C2 — Prochain palier streak
  11. D1 — Mini-cards règles nouvelles
  12. D2 — Indicateur streak dans le header
  13. D3 — Coffre hebdomadaire SVG amélioré

PHASE 4 — Accessibilité & qualité
  14. E1 — Aria-labels sur tous les boutons
  15. E2 — Rôles ARIA sur composants custom
  16. F1 — Gestion erreur localStorage
  17. F2 — Retirer mode debug
  18. F3 — Tests end-to-end
  19. F4 — Tests mobile
```

Phases 1-2 rendent la boutique réellement fonctionnelle (aujourd'hui c'est un catalogue sans effets).
Phase 3 enrichit l'expérience de jeu.
Phase 4 prépare la livraison.

---

## Récapitulatif des bugs corrigés (session de test V4→V5)

| Bug | Fichier | Fix |
|-----|---------|-----|
| Coffre hebdomadaire "+0 pièces" affiché même hors conditions | `App.jsx` L537 | `if (chestResult)` → `if (chestResult?.opened)` |
| Équipement de thème ne fonctionne pas | `Shop.jsx` L90 | Passer `(equipSlot, itemId)` au lieu de `(itemId)` seul |
| `applyTheme()` jamais appelé | `App.jsx` | Ajout import + appel au load et à l'équipement |
| Noms de thèmes incohérents entre SHOP_CATALOG et THEMES | `economy.js` L281-284 | `theme-forest` → `theme-forest-green`, etc. |

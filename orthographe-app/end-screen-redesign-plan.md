# Plan de dev — redesign EndScreen "Session terminee"

## Source design

Lire d'abord :

- `ux-designer/design_handoff_session_terminee/README.md`
- `ux-designer/design_handoff_session_terminee/Session terminée.html`
- `ux-designer/design_handoff_session_terminee/primolingo-tokens.json`

Important : les fichiers HTML sont une reference haute fidelite, pas du code de production a copier. Refaire l'ecran dans les patterns React existants de l'app.

## Objectif

Refondre `src/components/EndScreen.jsx` pour matcher le nouveau design "Session terminee" :

- score clair et premium ;
- pieces gagnees lisibles ;
- objectif suivant compact ;
- recap des reponses scrollable ;
- bouton `Continuer` toujours visible en bas ;
- aucun emoji ;
- aucune coupe/trophee dans le header ;
- vraie mascotte/personnage de la boutique.

Ne pas changer les mecaniques de progression, de score ou de pieces.

## Decisions produit a respecter

### 1. Supprimer les messages d'arc du EndScreen

On ne veut plus de messages d'arc/coaching sur l'ecran de fin.

Actions :

- retirer le rendu `coachingLine` dans `EndScreen`.
- ne plus passer `coachingLine={endScreenCoachingMsg?.copy || null}` depuis `ChildApp`, ou laisser la prop ignoree si plus simple pendant la migration.
- ne pas appeler `pickCoachingMessage({ trigger: 'endScreen', ... })` si ce n'est plus utilise.

Raison produit :

- l'EndScreen doit rester centre sur l'accomplissement immediat : score, pieces, progression de regle, recap.
- les messages d'engagement long terme doivent vivre sur le dashboard, pas a la fin du quiz.

### 2. Garder les messages de streak sur le dashboard, pas sur le EndScreen

Supprimer du EndScreen :

- le bloc prospectif `Encore X jours de flamme pour gagner Y pieces...`;
- toute alerte ou message de streak qui pousse le retour futur.

Conserver cote dashboard :

- les messages de flamme/streak ;
- les milestones ;
- les alertes de retour ou de serie en danger.

Cas particulier :

- si une session credite effectivement des pieces de palier streak, le montant peut rester dans le calcul comptable des gains si necessaire, mais ne pas afficher un message d'engagement type "Encore X jours...".
- privilegier un libelle neutre et court si le montant doit etre explique, par exemple `Bonus serie`, sans texte motivationnel.

### 3. Bloc "Prochain objectif"

Le design montre un bloc `Prochain objectif : Mode direct`.

Adapter ainsi :

- garder le titre `Prochain objectif : {levelProgress.nextLevelName}` ;
- garder la barre de progression ;
- supprimer la ligne `2/3 sessions qualifiantes` ;
- conserver le message utile, par exemple `Plus qu'une session avec 3 bonnes reponses !`.

Important :

- le prototype a supprime ce message, mais il faut le remettre.
- ce message est plus actionnable que le compteur brut.

Exemples attendus :

- `Plus qu'une session avec 3 bonnes reponses !`
- `Plus que 2 sessions avec 8 bonnes reponses !`
- `Encore une session parfaite pour viser le diamant !`

Ne pas afficher :

- `2/3 sessions qualifiantes`
- `66%`
- des compteurs techniques si le message actionnable existe.

### 4. Bouton Continuer toujours visible

Le CTA `Continuer` doit rester visible en bas de l'ecran, meme quand le recap des reponses est long.

Implementation attendue :

- structure en conteneur plein ecran ou plein viewport ;
- zone principale scrollable ;
- CTA sticky/fixed en bas avec fade/gradient de protection ;
- padding bottom suffisant dans la zone scrollable pour que le dernier item ne soit jamais cache sous le bouton.

Contrainte :

- sur mobile 390x844, le bouton doit etre visible sans scroll au moment ou l'EndScreen apparait.
- si 10/20/40 reponses sont affichees, seul le recap doit scroller, pas le bouton.

### 5. Supprimer la coupe et la mecanique "Animations de victoire"

Le prototype contient une coupe dans le header, mais on ne la garde pas.

Actions EndScreen :

- supprimer tout affichage de coupe/trophee dans le header de l'ecran de fin ;
- ne pas utiliser `TrophyIcon` pour le titre `Session terminee`;
- ne pas afficher `VictoryAnimationPreview` dans le nouvel EndScreen ;
- ne plus utiliser la prop `victoryAnimationId` dans `EndScreen`.

Actions boutique/economie :

- retirer la section/categorie `Animations de victoire` de la boutique ;
- supprimer ou masquer les items `victoryAnimations` dans `src/engine/economy.js` ;
- retirer `victoryAnimations` des filtres/categories de `src/components/Shop.jsx` ;
- retirer les textes `Animations de victoire` et `Joue une animation sur ton écran de fin de quiz` ;
- ne plus proposer d'achat/equipement `victoryAnimation`.

Actions plomberie :

- ne plus passer `victoryAnimationId` depuis `ChildApp` vers `QuizGuided`, `QuizDirect`, `DicteeQuizGuided`, `DicteeQuizReconstruct` si cette prop n'a plus d'autre usage utile ;
- si le retrait complet est trop invasif, laisser les champs de donnees existants pour compatibilite avec les anciens profils, mais ne plus les rendre ni les vendre ;
- ne pas supprimer brutalement les anciennes donnees `progress.shop.equipped.victoryAnimation` dans les profils : ignorer ce champ suffit.

Fichiers a verifier :

- `src/components/EndScreen.jsx`
- `src/components/VictoryAnimationPreview.jsx`
- `src/components/Shop.jsx`
- `src/engine/economy.js`
- `src/pages/ChildApp.jsx`
- `src/components/QuizGuided.jsx`
- `src/components/QuizDirect.jsx`
- `src/components/DicteeQuizGuided.jsx`
- `src/components/DicteeQuizReconstruct.jsx`
- `src/data/shopCharacters.js` uniquement si l'emotion personnage `victory` utilise encore un symbole coupe visible.

Clarification :

- retirer les "Animations de victoire" de boutique ne veut pas forcement dire retirer l'emotion personnage `victory` si elle correspond a une animation/sprite du personnage. En revanche, elle ne doit plus etre representee par une coupe emoji.

## Integration technique

Fichier principal :

- `src/components/EndScreen.jsx`

Composants existants a utiliser :

- `CharacterSprite` pour la mascotte/personnage boutique.
- `RewardAmount` pour les scores et montants de pieces.
- `CoinIcon` pour les pieces.
- `ProductIcons` pour check/cross/book si necessaire.

Ne pas utiliser :

- emojis (`🏆`, `🔥`, `🧙`, `⭐`, etc.) ;
- coupe/trophee dans le header ;
- `VictoryAnimationPreview` ;
- SVG ad hoc si une icone produit existe deja ;
- texte brut pour les montants de pieces si `RewardAmount` convient.

## Layout cible

### Page shell

- Background : `linear-gradient(180deg, #1e1e2e 0%, #2d2b55 50%, #1a1a2e 100%)`
- Padding horizontal : `16px`
- Mobile-first.
- Max width raisonnable sur desktop, centre.
- Hauteur : `100dvh` ou equivalent robuste.

Structure recommandee :

```jsx
<div className="end-screen-page">
  <div className="end-screen-scroll">
    <HeaderCard />
    {showLevelBar && <NextObjectiveCard />}
    <AnswerRecap />
  </div>
  <div className="end-screen-cta">
    <button>Continuer</button>
  </div>
</div>
```

### Header card

Doit contenir :

- vraie mascotte/personnage boutique, pas placeholder emoji ;
- titre `Session terminee !`;
- score principal via `RewardAmount value={`${score}/${total}`} unit="score"` ;
- feedback court : `Parfait ! Pas une seule erreur.`, etc. ;
- lignes de pieces ;
- bonus du jour si applicable ;
- total.

Notes :

- Le prototype met score et titre dans la meme ligne. Garder l'esprit, mais privilegier la lisibilite et la robustesse responsive.
- Supprimer la coupe du prototype : le score et le personnage suffisent pour porter le moment de recompense.
- Si le personnage n'est pas disponible, utiliser un fallback produit propre, pas emoji.

### Score rows / pieces

Utiliser une fonction pure pour construire les tiers :

```js
buildCoinTiers(total, score)
```

Exigences :

- jamais de range invalide (`2-2`, `3-2`, `1-0`) ;
- pour petites sessions (`total < 4`), utiliser des libelles simples :
  - `Reussite partielle`
  - `Bonne session`
  - `Parfait`
- pour sessions plus longues, utiliser des bornes valides :
  - `6-7 reponses justes`
  - `8-9 reponses justes`
  - `10 reponses justes`

Les montants doivent passer par `RewardAmount` ou un rendu unique coherent avec `CoinIcon`.

### Bonus row

Afficher uniquement les bonus directement lies a la session :

- bonus du jour ;
- double pieces ;
- eventuellement bonus de palier deja credite, avec libelle court et neutre.

Ne pas afficher de message prospectif de streak.

### Prochain objectif

Rendu conditionnel si `levelProgress` existe.

Contenu :

- `Prochain objectif : {levelProgress.nextLevelName}`
- barre de progression
- `levelProgress.message`

Supprimer :

- `{levelProgress.current}/{levelProgress.target} sessions qualifiantes`
- pourcentage textuel type `66%`

Si `levelProgress.message` est absent, en generer un court et actionnable depuis les donnees disponibles.

### Recap des reponses

Design :

- cartes vertes pour reponses correctes ;
- cartes rouges discretes pour erreurs ;
- check/cross SVG, pas texte `✓` / `✗` si possible ;
- mot/reponse choisie mise en evidence en violet ;
- correction affichee seulement si erreur.

Scroll :

- le recap doit etre la zone qui accepte le scroll quand il y a beaucoup de lignes ;
- le CTA reste visible.

## Nettoyage code

Supprimer ou rendre inutiles :

- `showStreakNext`, `nextMilestoneDays`, `streakDaysLeft`, `nextMilestoneCoins` si seulement utilises pour le message prospectif.
- rendu `coachingLine`.
- imports inutilises (`FlameIcon`, `TrophyIcon`, `VictoryAnimationPreview` si plus utilises dans EndScreen, etc.).
- prop `victoryAnimationId` si elle ne sert plus.
- categorie boutique `victoryAnimations` si elle ne sert qu'a l'ancienne coupe/animation de victoire.

Verifier :

- pas de lint unused import/variable.
- pas de warning React HTML nesting.

## Tests a creer

Créer des tests precis, reutilisables plus tard dans une vraie suite CI.

Important : la construction de la suite CI est hors scope, mais les tests doivent etre suffisamment propres pour y etre branches ensuite sans reecriture.

### Fichier recommande

Ajouter :

- `tests/end-screen-redesign.test.js`

Ou etendre proprement :

- `tests/design-refactor-regression.test.js`

Preference : creer `tests/end-screen-redesign.test.js` pour isoler les specs du nouvel ecran.

### Principes des tests

- Tests deterministes.
- Pas de dependance a un compte prod.
- Utiliser le mode debug/localStorage comme les tests existants.
- Capturer des screenshots dans `tests/screenshots/end-screen-redesign/`.
- Assertions DOM/text/layout, pas seulement screenshots.
- Helpers reutilisables :
  - seed progress local ;
  - ouvrir `/play/:childId` ;
  - lancer une session ;
  - repondre aux questions ;
  - attendre l'EndScreen ;
  - collecter erreurs console.

### Tests unitaires purs

Si `buildCoinTiers` est exportable ou testable separement, ajouter des checks :

- `total=1` : aucun range `1-0`.
- `total=2` : aucun range `2-1`.
- `total=3` : aucun range `2-2` ou `3-2`.
- `total=10` : ranges valides.
- `total=20` : ranges valides.
- `total=34` : ranges valides, utile pour les sessions dictee/orthographe longues.
- `total=40` : ranges valides.

Ces tests peuvent etre dans le meme fichier Node si simple.

### Tests Playwright obligatoires

1. Mobile 390x844 — score parfait petite session

- seed `prodQuestionCount=3`;
- terminer une session 3/3 ;
- verifier :
  - `Session terminee` visible ;
  - `3/3` visible ;
- pas d'emoji visible ;
- pas de coupe/trophee visible ;
- pas de `Animation de victoire` visible dans l'EndScreen ;
- pas de texte `2/2`, `3/2`, `1/0`, `1-0`, `2-2`, `3-2` ;
  - bouton `Continuer` visible dans le viewport ;
  - aucun message `Encore X jours de flamme...`;
  - aucun `sessions qualifiantes`;
  - message actionnable `Plus qu...` visible si objectif actif.

2. Mobile 390x844 — recap long

- seed `prodQuestionCount=10` ou plus ;
- terminer une session ;
- verifier :
  - bouton `Continuer` reste visible ;
  - la zone recap est scrollable ;
  - le dernier item du recap peut etre amene au-dessus du CTA ;
  - pas d'overlap entre recap et CTA.

3. Desktop 1280x800

- terminer une session avec objectif actif ;
- verifier :
  - layout centre ;
  - largeur raisonnable ;
  - CTA visible ;
  - pas d'overflow horizontal ;
  - pas d'emoji.

4. Variante sans objectif

- seed un etat ou `showLevelBar` est false ;
- verifier :
  - bloc `Prochain objectif` absent ;
  - layout reste equilibre ;
- CTA visible.

5. Boutique sans "Animations de victoire"

- ouvrir la boutique ;
- aller dans l'onglet cosmetique ;
- verifier :
  - aucun libelle `Animations de victoire` ;
  - aucun item de categorie `victoryAnimations` visible ;
  - aucune coupe emoji visible ;
  - les autres categories cosmetiques restent accessibles.

6. Console hygiene

Pendant chaque test :

- fail si console contient :
  - `React Router caught`
  - `Cannot set properties of undefined`
  - `cannot contain a nested`
  - `hydration error`
  - `TypeError`

### Commande attendue

Le test doit pouvoir se lancer ainsi :

```bash
BASE_URL=http://127.0.0.1:5173 node tests/end-screen-redesign.test.js
```

Ne pas exiger de CI maintenant.

Optionnel : ajouter un script package pour faciliter l'execution manuelle :

```json
"test:end-screen": "BASE_URL=http://127.0.0.1:5173 node tests/end-screen-redesign.test.js"
```

## Verification manuelle

Avant de rendre le travail :

```bash
npm run lint
npm run build
BASE_URL=http://127.0.0.1:5173 node tests/end-screen-redesign.test.js
BASE_URL=http://127.0.0.1:5173 node tests/design-refactor-regression.test.js
```

Il faut lancer Vite avant les tests Playwright :

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

## Definition of done

- Le nouvel EndScreen respecte le handoff haute fidelite.
- Aucun emoji visible dans l'ecran de fin.
- Aucune coupe/trophee visible dans le header de l'ecran de fin.
- Le personnage vient de la boutique via `CharacterSprite` ou fallback produit propre.
- Les "Animations de victoire" ne sont plus vendues ni visibles dans la boutique.
- Les messages d'arc/coaching ne sont plus affiches sur l'EndScreen.
- Les messages de streak restent reserves au dashboard.
- Le bloc `Prochain objectif` n'affiche plus `2/3 sessions qualifiantes`, mais conserve un message actionnable du type `Plus qu'une session avec 3 bonnes reponses !`.
- Le CTA `Continuer` est toujours visible en bas.
- Le recap des reponses scrolle sans cacher le CTA.
- Aucun range invalide de score/pieces.
- Les tests crees sont reutilisables pour une future suite CI.
- `npm run lint`, `npm run build` et les tests Playwright passent.

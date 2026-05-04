# Plan restant — refacto design system PrimoLingo

## Contexte

Ce plan reprend l'etat actuel apres une premiere passe de refacto design system.

Une partie du socle existe deja :

- `src/components/icons/ProductIcons.jsx`
- `src/components/rewards/RewardAmount.jsx`
- `src/components/rewards/RewardMoment.jsx`
- migration partielle de `EndScreen`, `Dashboard`, `LevelHelpPopup`, `PerfectSessionBonusModal`, `Shop`

Mais l'application n'est pas prete pour deploy :

- `npm run lint` echoue ;
- une erreur React Router est reproductible localement via Playwright ;
- plusieurs emojis restent visibles dans l'app enfant ;
- les popups recompense ne sont pas encore vraiment unifiees autour de `RewardMoment` ;
- `EndScreen` a une regression d'affichage sur les petites sessions.

Objectif : finir le refacto en restant strictement aligne avec `ux-designer/design system/primolingo-design-system.html`, sans changer les mecaniques produit.

## Regles de travail

- Ne pas deploy tant que `npm run build`, `npm run lint` et les verifications Playwright listees plus bas ne passent pas.
- Ne pas reintroduire d'emoji dans les surfaces enfant, hors debug local explicitement marque.
- Utiliser SVG/composants pour les symboles produit : pieces, flamme, bouclier, cadenas, trophee, couronne, diamant, cadeau, livre, check/cross.
- Utiliser Fredoka uniquement pour les moments enfant/recompense : scores, gains, bonus, niveau obtenu.
- Utiliser Outfit pour titres, labels, navigation.
- Utiliser Plus Jakarta Sans pour textes longs, explications, formulaires, surfaces parent.
- Garder le style existant et les tokens CSS du design system : `--font-display`, `--font-body`, `--font-kid`, `--color-gold`, `--color-primary`, `--color-accent`, `--glass-bg`, `--glass-border`, `--radius-*`.

## Phase 0 — stabilisation bloquante

### 0.1 Corriger l'erreur React Router `markCoachingShown`

Symptome vu via Playwright :

```txt
TypeError: Cannot set properties of undefined (setting 'arc6.13')
at markCoachingShown
React Router caught the following error during render
```

Fichiers :

- `src/engine/coaching.js`
- `src/components/Dashboard.jsx`

Cause probable :

- `markCoachingShown(progress, msg, todayStr)` recree `next.coaching` si absent, mais pas ses sous-objets (`shown`, `lastShownByArc`, `dailyShownCount`) quand `progress.coaching` existe sous forme partielle.

Correction attendue :

- ajouter une normalisation defensive dans `markCoachingShown` :
  - si `next.coaching` absent, creer `createDefaultCoaching()`;
  - si `next.coaching.shown` absent, initialiser `{}`;
  - si `next.coaching.lastShownByArc` absent, initialiser `{}`;
  - si `next.coaching.dailyShownCount` absent, initialiser `{}`;
  - conserver les champs existants.

Verifier aussi :

- `pickCoachingMessage` doit utiliser un coaching normalise ou tolerer les champs absents.
- Le reset debug dans `Dashboard.jsx` peut rester, mais ne doit pas masquer le bug.

### 0.2 Corriger les erreurs lint existantes

Commande :

```bash
npm run lint
```

Erreurs observees a corriger :

- `src/components/Dashboard.jsx` : import/variable inutilise(e) `exportProgress`.
- `src/components/MiniQuiz.jsx` : `useEffect`, `answers`, `rule` inutilises.
- `src/pages/ParentDashboard.jsx` : `logoIconStyle` inutilise.
- `src/pages/RulePage.jsx` : hooks appeles conditionnellement apres un early return.

Critere d'acceptation :

- `npm run lint` passe sans erreur.
- Les warnings non critiques peuvent rester uniquement s'ils etaient preexistants et documentes, mais viser zero warning si simple.

## Phase 1 — terminer le remplacement des emojis visibles

### 1.1 Dashboard enfant

Fichier principal :

- `src/components/Dashboard.jsx`

Problemes observes :

- le bandeau motivation affiche encore des emojis venant du moteur de coaching ;
- les cartes peuvent afficher des boutons crayon emoji en local ;
- `MOOD_DESCRIPTIONS` conserve des emojis ;
- `streakAlert` affiche encore `🔥` en texte.

Actions :

- remplacer les emojis de coaching par un `iconType` ou par un composant SVG deduit de `variant`.
- remplacer l'icone de `streakAlert` par `FlameIcon`.
- remplacer les boutons crayon par une icone SVG, ou les cacher hors debug strict.
- verifier que les emojis de debug ne sont pas visibles dans une session enfant normale.

Critere :

- Sur `/play/:childId`, aucun emoji visible dans le dashboard enfant hors panneau debug.

### 1.2 Moteur de coaching

Fichier :

- `src/engine/coaching.js`

Probleme :

- beaucoup de messages contiennent encore des emojis (`🎁`, `🔥`, `💎`, `👑`, etc.).

Actions :

- remplacer le champ `emoji` par `iconType` ou conserver `emoji` uniquement comme compat interne non rendu.
- retirer les emojis dans les textes de coaching eux-memes.
- adapter `MotivationBanner` pour rendre l'icone SVG via `iconType`.

Exemple :

```js
msg('arc5.1', 'flamme', 'Ta flamme est lancee. Reviens demain, c'est tout.', 'Reviens demain', 'flame')
```

Critere :

- Recherche `rg -n "[🎁🔥💎👑⭐🏆🔒✏️🐛]" src` ne doit plus trouver de rendu utilisateur enfant hors fichiers debug/tests/trash/landing mockups explicitement exclus.

### 1.3 Boutique

Fichier :

- `src/components/Shop.jsx`

Problemes observes :

- `char.emoji` encore rendu pour les personnages non possedes ;
- toast cadeau encore en emoji ;
- `item.emoji` encore utilise pour des items ;
- `emo.symbol` encore affiche comme texte.

Actions :

- utiliser `CharacterSprite` ou une silhouette SVG pour les personnages non possedes.
- remplacer le toast `🎁` par `GiftIcon`.
- remplacer `item.emoji` par `CategoryIcon` ou une icone produit explicite.
- remplacer `emo.symbol` par une icone SVG ou un mini sprite coherent.

Critere :

- Boutique mobile et desktop sans emoji visible.

### 1.4 Autres surfaces enfant

Verifier et corriger :

- `src/components/ReturnScreen.jsx`
- `src/pages/DicteesPage.jsx`
- `src/components/CosmeticFlameIcon.jsx`
- `src/components/VictoryAnimationPreview.jsx`
- `src/components/ProgressCharts.jsx`
- `src/components/PerfectSessionBonusModal.jsx`
- `src/components/LevelHelpPopup.jsx`

Principe :

- Les vrais assets produit restent autorises si ce sont des SVG/composants.
- Les emojis texte ne doivent plus etre utilises comme UI.

## Phase 2 — unifier les moments de recompense

### 2.1 Utiliser `RewardMoment` pour les overlays `pendingEvents`

Fichier :

- `src/components/Dashboard.jsx`

Etat actuel :

- `EVENT_CONFIG` a commence a utiliser `iconType`.
- L'overlay rend `OverlayIcon`.
- Mais la popup reste custom et les gains sont encore du texte brut dans `sub`, par exemple ` · +30`.

Actions :

- faire de `RewardMoment` le rendu standard de l'overlay.
- construire une donnee structuree :
  - `iconType`
  - `kicker`
  - `title`
  - `description`
  - `amount`
  - `unit`
  - `tone`
- ne plus concatener les gains dans `sub`.
- rendre les gains avec `RewardAmount`.

Critere :

- Les popups `Argent`, `Couronne`, `Diamant`, `Mode direct debloque`, `Bonus`, `Streak milestone` ont la meme structure visuelle.
- Aucun gain n'est affiche comme texte brut isole.

### 2.2 Corriger la deduplication des evenements niveau

Fichiers :

- `src/engine/scoring.js`
- `src/components/Dashboard.jsx`

Probleme :

- `processSessionResult` emet `levelUp` puis parfois `directUnlocked`, `crown`, `diamond`.
- La dedup actuelle marque `level_up_N`, mais les cles dedup peuvent rester incoherentes selon les types (`levelUp`, `directUnlocked`, `level_up_2`).
- Risque : deux popups pour le meme accomplissement.

Actions :

- definir une cle canonique par accomplissement :
  - niveau 2 : `level:2`
  - niveau 3/couronne : `level:3`
  - niveau 4/diamant : `level:4`
- si `levelUp(value=2)` est present, supprimer/absorber `directUnlocked`.
- si `levelUp(value=3)` est present, supprimer/absorber `crown`.
- si `levelUp(value=4)` est present, supprimer/absorber `diamond` et `sm2_activated` si redondant visuellement.
- garder les infos importantes dans une seule popup.

Critere :

- Une session qui debloque Argent/mode direct affiche une seule popup.
- Une session qui gagne Couronne affiche une seule popup.
- Une session qui gagne Diamant affiche une seule popup.

### 2.3 LevelHelpPopup

Fichier :

- `src/components/LevelHelpPopup.jsx`

Etat actuel :

- Les emojis de couronne/diamant semblent remplaces.
- `RewardAmount` est importe mais peu ou pas utilise.
- Les bonus restent parfois des strings (`+30 pieces`, `+100 pieces`).

Actions :

- utiliser `RewardAmount` pour les bonus.
- garder le haut de popup equilibre :
  - icone seule, pas encadree avec le titre ;
  - titre centre ;
  - contenu compact ;
  - mobile : icone visible, mais dimensionnee.

Critere :

- Couronne/diamant visibles sur mobile et desktop sans dominer le header.
- Pas de texte inutilement long.

## Phase 3 — reparer et polir `EndScreen`

Fichier :

- `src/components/EndScreen.jsx`

### 3.1 Corriger les ranges invalides

Probleme observe via Playwright :

```txt
1-0 reponses justes
```

Cause :

- seuils calcules par `Math.ceil(total * 0.6)`, `Math.ceil(total * 0.8)`, `total`, puis rendu `threshold80 - 1`.
- Pour `total=1`, les bornes deviennent invalides.

Actions :

- creer une fonction pure `buildCoinTiers(total)` testable.
- si `total < 3`, afficher des libelles simples :
  - `Reussite partielle`
  - `Bonne session`
  - `Parfait`
- sinon afficher des ranges valides.
- ne jamais afficher `x-y` si `x > y`.

Critere :

- `total=1`, `total=2`, `total=10`, `total=20`, `total=34`, `total=40` rendent des libelles coherents.

### 3.2 Corriger le HTML invalide

Probleme observe :

```txt
<p> cannot contain a nested <div>
```

Cause :

- `FlameIcon` rend un `div` dans un `<p>`.

Actions :

- remplacer le `<p>` parent par un `<div>` ou rendre `FlameIcon` sous forme inline compatible.

Critere :

- Plus aucun warning React HTML nesting en console Playwright.

### 3.3 Harmoniser score, pieces et recap

Actions :

- garder le score en `RewardAmount unit="score"`.
- utiliser `RewardAmount unit="coins"` pour toutes les lignes de pieces.
- ameliorer le contraste des tiers inactifs.
- remplacer les signes texte `✓`, `✗`, fleches si rendus comme UI par `CheckIcon`, `CrossIcon`, `ArrowIcon`.
- verifier que le bouton `Continuer` reste accessible sans scroll excessif sur mobile.

Critere :

- Capture mobile 390x844 : score, gains, progression et bouton lisibles.
- Capture desktop : layout centre, pas trop large, pas de texte gris illisible.

## Phase 4 — surfaces SEO et landing creees recemment

Fichiers possibles :

- `src/pages/RulesIndexPage.jsx`
- `src/pages/RulePage.jsx`
- `src/components/MiniQuiz.jsx`
- `src/pages/LandingPageV5.jsx`
- `src/components/SeoStarField.jsx`

Actions :

- Corriger les hooks conditionnels dans `RulePage`.
- Remplacer les restes emoji des CTA/score du mini quiz par :
  - logo PrimoLingo petit pour le CTA principal ;
  - icones SVG pour score/recompense.
- Conserver le mini quiz SEO comme passerelle vers signup.
- Garder les FAQ editoriales ajoutees, separees du quiz.

Critere :

- `/regles` et `/regles/:ruleId` passent lint/build.
- CTA sans emoji.
- Mini quiz fonctionne mobile/desktop.

## Phase 5 — verification Playwright obligatoire

Un script de regression Playwright dedie a ete ajoute :

- `tests/design-refactor-regression.test.js`

Il reprend les controles faits pendant la review du refacto partiel :

- dashboard mobile sans crash React Router `markCoachingShown` ;
- absence d'emoji visible dans le dashboard enfant ;
- popup bonus premier quiz sans emoji ;
- `EndScreen` avec session de 1 question sans range invalide `1-0` ;
- absence de warning React HTML nesting ;
- page SEO regle sans crash hooks et sans emoji.

Commande a executer telle quelle apres lancement du serveur dev :

```bash
BASE_URL=http://127.0.0.1:5173 node tests/design-refactor-regression.test.js
```

Les screenshots sont ecrits dans :

```txt
tests/screenshots/design-refactor/
```

Lancer l'app :

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Si le port backend local `3001` est deja pris, ce n'est pas bloquant pour Vite, mais documenter l'etat.

### 5.1 Smoke app publique

Avec Playwright :

- ouvrir `http://127.0.0.1:5173/`
- verifier :
  - pas de double ecran "Chargement" persistant ;
  - fond etoile visible mais pas trop dense en haut ;
  - CTA principal sans emoji ;
  - aucun crash console.

### 5.2 Login

Avec Playwright :

- ouvrir `/login`
- verifier :
  - logo integre proprement ;
  - pas de gros pictogramme mal centre ;
  - pas d'emoji ;
  - pas de debordement mobile.

### 5.3 Dashboard enfant

Avec Playwright, utiliser un compte/test state existant ou injecter un etat local si le projet le permet :

- ouvrir `/play/:childId`
- verifier :
  - aucun crash React Router ;
  - aucun `Cannot set properties of undefined`;
  - aucun emoji visible hors debug ;
  - bandeau motivation avec icone SVG ;
  - cartes regles propres mobile/desktop.

### 5.4 Fin de quiz

Tester au minimum :

- session 1 question, score 0/1 ;
- session 2 questions, score 2/2 ;
- session 10 questions, score 8/10 ;
- session 34 questions, score 28/34 ;
- session 40 questions, score 32/40.

Verifier :

- pas de range invalide type `1-0`;
- pas de warning `<p> cannot contain a nested <div>`;
- pieces affichees avec icone SVG ;
- score en Fredoka ;
- bouton `Continuer` accessible.

### 5.5 Popups recompense

Simuler ou declencher :

- `directUnlocked`
- `levelUp value=2`
- `levelUp value=3`
- `levelUp value=4`
- `firstSessionOfDay`
- `streakMilestone`
- `perfectSessionBonus`

Verifier :

- une seule popup par accomplissement ;
- pas de double popup `Argent` puis `Mode direct` pour le meme debloquage ;
- pas d'emoji ;
- `RewardMoment` utilise ;
- `RewardAmount` utilise pour les pieces ;
- mobile et desktop equilibres.

### 5.6 Boutique

Avec Playwright :

- ouvrir la boutique enfant ;
- verifier personnages possedes/non possedes ;
- verifier achat personnage si possible ;
- verifier toast "emotions offertes".

Critere :

- aucun emoji visible ;
- pas de texte qui deborde ;
- boutons et prix lisibles.

### 5.7 Pages SEO

Avec Playwright :

- `/regles`
- `/regles/a-a-as` ou une regle existante

Verifier :

- template a la charte ;
- CTA avec logo PrimoLingo, pas emoji ;
- mini quiz utilisable ;
- lien signup present ;
- FAQ editoriale presente.

## Phase 6 — Sentry et regressions prod

Script existant :

```bash
./scripts/sentry-check.sh --details
```

Attention :

- le script utilise `curl -s` et peut afficher "Aucune erreur non resolue" si la requete echoue en sandbox/reseau.
- Si besoin, lancer une requete Sentry avec `curl -sS` pour detecter les erreurs reseau.

Verifier avant deploy :

- pas d'issue nouvelle liee a React Router ;
- pas de `TypeError: Cannot set properties of undefined`;
- pas de nouvelle issue `ReferenceError`.

## Phase 7 — commandes finales

Depuis `orthographe-app` :

```bash
npm run lint
npm run build
```

Puis verification Playwright.

Ne deploy que si :

- lint OK ;
- build OK ;
- Playwright OK sur mobile et desktop ;
- aucune erreur console bloquante ;
- aucun emoji visible dans les surfaces enfant normales ;
- popups recompense dedupliquees.

## Definition of done

Le refacto est termine quand :

- toutes les recompenses enfant utilisent le vocabulaire visuel PrimoLingo : pieces, flamme, bouclier, couronne, diamant ;
- Fredoka est reservee aux moments de gratification ;
- les emojis UI ont disparu de l'app enfant ;
- `RewardMoment` et `RewardAmount` sont les composants standards des moments recompense ;
- `EndScreen` ne casse pas sur les petites sessions ;
- React Router ne capture plus d'erreur au dashboard ;
- lint/build/Playwright passent.

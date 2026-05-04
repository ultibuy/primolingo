# Plan de dev — application du design system PrimoLingo

## Objectif

Aligner l'app PrimoLingo sur le design system existant, sans changer les mécaniques produit.

Principes directeurs :

- Conserver les vraies récompenses du jeu : pièces, flamme, bouclier, couronne, diamant.
- Ne pas introduire de nouvelle métaphore produit comme une monnaie en étoiles.
- Utiliser Fredoka seulement pour les moments enfant et gratification : score, gain, bonus, niveau gagné.
- Utiliser Outfit pour titres, navigation, labels et structure.
- Utiliser Plus Jakarta Sans pour textes, explications, formulaires et surfaces parent.
- Remplacer les emoji UI par des SVG ou composants existants, sauf dans le debug local si ce n'est pas prioritaire.

## Référence charte

Source : `ux-designer/design system/primolingo-design-system.html`

Tokens à respecter :

- Background : `--gradient-sky-bg`, `--app-star-field`
- Brand : `--color-primary`, `--color-accent`, `--color-primary-dark`
- Récompenses : `--color-gold`, `--color-orange`, `--shadow-glow-gold`
- Statuts : `--color-green`, `--color-red`
- Glass : `--glass-bg`, `--glass-border`, `--blur-md`
- Radius : `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`
- Fonts : `--font-display`, `--font-body`, `--font-kid`
- Motion récompense : `cubic-bezier(0.34, 1.56, 0.64, 1)`

## Phase 1 — socle icônes et récompenses

But : arrêter la dispersion des emoji et créer une base réutilisable.

### 1.1 Créer une librairie d'icônes produit

Créer ou compléter :

- `src/components/icons/ProductIcons.jsx`

Icônes à exposer :

- `TrophyIcon`
- `CrownIcon` si le composant actuel ne suffit pas partout
- `DiamondIcon` / `DiamondStatus`
- `FlameIcon` / `CosmeticFlameIcon`
- `ShieldIcon`
- `LockIcon`
- `CheckIcon`
- `CrossIcon`
- `GiftIcon`
- `ChartMedalIcon`
- `ChartTrophyIcon`
- `BookIcon`
- `UnlockIcon`
- `TargetIcon`

Critères :

- SVG inline, pas d'emoji.
- Couleurs par défaut alignées avec les tokens CSS.
- Taille configurable par prop `size`.
- `aria-hidden="true"` par défaut pour les icônes décoratives.

### 1.2 Créer un composant RewardAmount

Créer :

- `src/components/rewards/RewardAmount.jsx`

Rôle :

- afficher les grands gains et scores en Fredoka ;
- afficher l'unité correcte : pièces, score, flamme, couronne, diamant.

API proposée :

```jsx
<RewardAmount value="+25" unit="coins" />
<RewardAmount value="20/20" unit="score" tone="success" />
<RewardAmount value="+100" unit="crown" />
```

Critères :

- `font-family: var(--font-kid)`
- poids 700
- couleur gold pour pièces/récompenses
- couleur green pour réussite simple
- couleur diamond pour diamant
- icône SVG associée à l'unité
- dimensions stables sur mobile

### 1.3 Créer un composant RewardMoment

Créer :

- `src/components/rewards/RewardMoment.jsx`

Rôle :

- surface standard pour les moments de gratification : bonus parfait, niveau gagné, milestone streak, bonus de bienvenue.

API proposée :

```jsx
<RewardMoment
  icon="crown"
  kicker="Niveau Couronne"
  title="Couronne gagnée"
  amount="+100"
  unit="coins"
  description="Tu maîtrises cette règle sans aide."
  actionLabel="Continuer"
  onAction={onContinue}
/>
```

Critères :

- fond glass ou radial coloré selon le type ;
- titre en Outfit ;
- montant en Fredoka ;
- texte en Plus Jakarta ;
- bouton pilule design system ;
- animation pop courte ;
- aucun emoji.

## Phase 2 — écran de fin de quiz

Fichier principal :

- `src/components/EndScreen.jsx`

Objectif : en faire le moment enfant le plus premium de l'app.

### 2.1 Remplacer l'emoji de performance

Actuel :

- `emoji = pct === 100 ? trophy : clap : muscle : book`

À remplacer par :

- `PerformanceIcon` SVG, ou `RewardMoment` header.

Mapping :

- 100% : trophy/gold
- 80-99% : check/green ou crown-progress
- 60-79% : progress/primary
- <60% : practice/book en SVG, pas emoji

### 2.2 Mettre le score principal en Fredoka

Changer le rendu score :

- `displayedScore/total` en `RewardAmount unit="score"`
- grand, lisible, centré ou aligné avec la mascotte selon layout

Ne pas utiliser Fredoka sur :

- feedback long ;
- recap des erreurs ;
- textes de coaching.

### 2.3 Recomposer les gains de pièces

Regrouper les éléments :

- base coins
- bonus du jour
- streak bonus
- double coins
- total

Design recommandé :

- chaque ligne en petite carte glass ;
- montant en Fredoka pour le nombre ;
- `CoinIcon` ou nouveau `CoinIcon` amélioré ;
- total avec halo gold.

### 2.4 Nettoyer la progression niveau

Garder l'information, mais aligner le style :

- kicker en Outfit uppercase ;
- barre `--gradient-brand` ;
- textes en Plus Jakarta ;
- pas d'emoji dans les textes.

### 2.5 Tests

Avec Playwright :

- lancer un quiz guidé ;
- finir avec score parfait ;
- capturer mobile et desktop ;
- vérifier absence d'emoji dans l'écran de fin ;
- vérifier présence d'un SVG récompense ;
- vérifier qu'aucun texte ne déborde sur mobile.

## Phase 3 — overlays et popups de récompense

Fichiers :

- `src/components/Dashboard.jsx`
- `src/components/PerfectSessionBonusModal.jsx`
- `src/pages/ChildApp.jsx`
- `src/components/LevelHelpPopup.jsx`
- `src/components/PopupModal.jsx`

### 3.1 Refactoriser l'overlay `pendingEvents`

Actuel :

- `EVENT_CONFIG` stocke des emoji comme icônes.
- l'overlay affiche `overlay.icon` en texte géant.

À faire :

- remplacer `icon` string par `iconType`.
- rendre via `ProductIcon`.
- utiliser `RewardMoment` pour les événements niveau/récompense.

Événements concernés :

- `firstQuiz`
- `levelUp`
- `level_up_1`
- `level_up_2`
- `level_up_3`
- `level_up_4`
- `crown_earned`
- `diamond_earned`
- `streakMilestone`
- `shieldUsed`
- `sm2ReviewPassed`
- `diamondBroken`
- `milestone`

### 3.2 Bonus de bienvenue / bonus du jour

Actuel dans `ChildApp.jsx` :

- emoji fête / main ;
- texte long ;
- style custom.

À faire :

- utiliser `RewardMoment`
- icône `GiftIcon`
- montant `+200` ou `+10` en Fredoka + `CoinIcon`
- action primaire "Commencer"
- action secondaire "Plus tard"

### 3.3 Bonus parfait

Actuel :

- bon début avec `CoinIcon`, mais style isolé.

À faire :

- utiliser `RewardMoment`
- titre plus enfant : `20/20. Bonus parfait.`
- montant `+{bonus}` en Fredoka
- bouton design system.

### 3.4 Popups de niveau

Fichier :

- `src/components/LevelHelpPopup.jsx`

À faire :

- remplacer `icon: '👑'`, `icon: '💎'`, `icon: '⭐'`, `icon: '🔒'` par `iconType`.
- garder le contenu actuel, déjà raccourci.
- sur desktop : icône SVG à gauche, non encadrée avec le titre.
- sur mobile : garder l'icône visible en haut, compacte.
- appliquer Fredoka uniquement aux montants de bonus : `+30`, `+100`, `+200`.

### 3.5 Tests

Playwright :

- ouvrir popup Couronne desktop/mobile ;
- ouvrir popup Diamant desktop/mobile ;
- déclencher ou simuler bonus de bienvenue ;
- vérifier absence d'emoji visibles dans les popups non-debug ;
- vérifier responsive mobile 390px.

## Phase 4 — dashboard enfant

Fichiers :

- `src/components/Dashboard.jsx`
- `src/components/MotivationBanner.jsx`
- `src/components/RuleCard.jsx`
- `src/components/LevelPath.jsx`
- `src/components/CosmeticFlameIcon.jsx`
- `src/pages/DicteesPage.jsx`

### 4.1 Ligne de stats

Actuel :

- `🥇 7j`
- `🏆 30j`
- style texte discret.

À faire :

- remplacer par `ChartMedalIcon` et `ChartTrophyIcon`.
- garder le texte court : `7j : 0`, `30j : 0`.
- éviter l'italique et le soulignement trop "lien web".
- utiliser des chips glass compactes.

### 4.2 MotivationBanner

Actuel :

- déjà partiellement converti en SVG selon `emoji`.
- messages de coaching contiennent encore des emoji inline.

À faire :

- séparer `iconType` et `message`.
- retirer les emoji des strings de coaching affichées.
- utiliser les icônes ProductIcons pour `pieces`, `flamme`, `couronnes`, `diamant`, `panda`, etc.

Fichiers liés :

- `src/engine/coaching.js`
- `src/components/MotivationBanner.jsx`

### 4.3 RuleCard

À faire :

- remplacer les derniers emoji visibles : debug pencil excepté si debug seulement.
- remplacer `💎 Maîtrisée` par `DiamondIcon + Maîtrisée`.
- remplacer le lock texte par `LockIcon`.
- harmoniser les titres de cartes avec Outfit.
- garder les descriptions en Plus Jakarta.

### 4.4 Flamme et monnaie

À faire :

- garder `CosmeticFlameIcon`, mais remplacer ses variantes emoji internes par SVG.
- améliorer `CoinIcon` : retirer le `O` serif dans la pièce, le remplacer par un symbole simple ou un relief abstrait.
- utiliser `RewardAmount` pour les gros gains, pas pour les compteurs permanents.

### 4.5 Tests

Playwright :

- dashboard enfant desktop 1440 ;
- dashboard enfant mobile 390 ;
- avec compte neuf ;
- avec compte avancé si fixture disponible ;
- vérifier absence d'emoji hors debug ;
- vérifier pas de débordement des cartes règle.

## Phase 5 — boutique

Fichiers :

- `src/components/Shop.jsx`
- `src/engine/economy.js`
- `src/components/EmotionPurchasePopup.jsx`
- `src/components/VictoryAnimationPreview.jsx`

### 5.1 Remplacer les category icons

Actuel :

- `CATEGORY_ICONS` contient des emoji.
- `SHOP_CATALOG` contient des `emoji`.
- certains noms d'items incluent directement des emoji.

À faire :

- remplacer par `iconType`.
- retirer les emoji des noms produit.
- afficher les icônes via SVG.

Mapping proposé :

- themes : palette SVG
- flames : flame SVG
- titles : tag SVG
- victoryAnimations : motion/play SVG
- entranceAnimations : burst SVG
- streakFreeze : shield/ice SVG
- doubleCoins : coins SVG
- mystery image : puzzle SVG
- persos : character silhouette SVG ou sprite réel

### 5.2 Boutique = plus utilitaire, moins emoji

Recommandation :

- conserver les visuels des personnages et images mystère comme assets forts ;
- utiliser les icônes seulement pour structurer ;
- ne pas multiplier les effets dorés partout ;
- gold réservé aux achats/récompenses accessibles.

### 5.3 Tests

Playwright :

- ouvrir boutique depuis dashboard ;
- capturer les 4 onglets ;
- vérifier pas d'emoji dans les labels ;
- vérifier prix + pièces lisibles ;
- vérifier popup confirmation achat.

## Phase 6 — parent dashboard et onboarding

Fichiers :

- `src/pages/ParentDashboard.jsx`
- `src/pages/ChildSetup.jsx`
- `src/pages/LoginPage.jsx`
- `src/components/PinInput.jsx`

### 6.1 Parent dashboard

Principe :

- ne pas utiliser Fredoka.
- garder interface dense et sobre.
- utiliser les composants `Panel`, `ActionButton`, `StatBadge`.

À faire :

- remplacer avatars emoji des enfants par `AppLogo`, initiales, ou avatar SVG.
- remplacer emoji flamme/couronne dans stats par composants.
- harmoniser les modales PIN avec `PopupModal`.

### 6.2 Login / onboarding

Déjà assez proche.

À vérifier :

- logo intégré ;
- pas de texte qui déborde mobile ;
- boutons pilule ;
- fond étoilé cohérent.

## Phase 7 — états système

Fichiers :

- `src/components/AppLoadingScreen.jsx`
- `src/router.jsx`
- `src/components/ErrorBoundary.jsx`
- `src/pages/ChildApp.jsx`
- `src/pages/ParentDashboard.jsx`

### 7.1 Loading

Actuel :

- `AppLoadingScreen` est propre.
- il reste des fallbacks texte `Chargement…` isolés.

À faire :

- remplacer les fallbacks texte par `AppLoadingScreen` avec `minHeight` adapté.
- éviter deux écrans de chargement successifs si possible.
- pour fallback local de section : créer `InlineLoading`.

### 7.2 Erreurs

Actuel :

- emoji dans `RouteErrorBoundary` et `ErrorBoundary`.

À faire :

- remplacer par `WarningIcon` SVG.
- fond design system ;
- bouton `ActionButton`.

## Phase 8 — landing et pages publiques

Fichiers :

- `src/pages/LandingPageV5.jsx`
- `src/pages/RulePage.jsx`
- `src/pages/RulesIndexPage.jsx`
- `src/components/MiniQuiz.jsx`

### 8.1 Landing

La landing est déjà proche, mais les mockups contiennent encore beaucoup d'emoji.

À faire :

- remplacer les emoji dans les mockups par ProductIcons.
- attention : ne pas casser l'aspect marketing actuel.
- garder Fredoka seulement dans les mini éléments enfant du mockup.

### 8.2 SEO pages

Déjà bien alignées.

À faire :

- conserver le bouton mini quiz avec petit logo PrimoLingo.
- vérifier que le score final du mini quiz reste sans emoji.

## Phase 9 — critères globaux d'acceptation

### Visuel

- Pas d'emoji visibles dans l'interface principale hors contenu debug/local.
- Les récompenses utilisent Fredoka uniquement pour montants/scores.
- Les pages publiques gardent le ciel nocturne étoilé.
- Les popups ont une structure homogène.
- Les boutons sont pilule sauf cas d'input ou carte compacte.

### Produit

- Aucune nouvelle monnaie.
- Les récompenses restent : pièces, flamme, bouclier, couronne, diamant.
- Les textes de coaching restent informatifs mais sans emoji inline.
- Le niveau Couronne/Diamant garde les seuils réels selon la taille de session.

### Technique

- Pas de dépendance icon externe obligatoire.
- SVG inline ou composants existants.
- Tokens CSS réutilisés.
- Pas de refactor massif non lié.
- Pas de changement de logique scoring.

## Phase 10 — plan d'exécution recommandé

Ordre conseillé :

1. Créer `ProductIcons`, `RewardAmount`, `RewardMoment`.
2. Refactoriser `EndScreen`.
3. Refactoriser bonus de bienvenue et bonus parfait.
4. Refactoriser overlays `Dashboard`.
5. Refactoriser `LevelHelpPopup`.
6. Nettoyer `MotivationBanner` + `coaching.js`.
7. Nettoyer dashboard enfant et `RuleCard`.
8. Nettoyer boutique.
9. Nettoyer parent dashboard, errors, loading fallbacks.
10. Nettoyer landing mockups.

Raison de cet ordre :

- les récompenses sont le plus gros écart visible ;
- les composants partagés évitent de refaire le même travail plusieurs fois ;
- dashboard et boutique dépendent du socle icon/reward ;
- parent et landing peuvent être traités après sans bloquer l'expérience enfant.

## Tests à lancer à chaque phase

Commandes :

```bash
npm run build
npm run test
```

## Vérification Playwright détaillée

La vérification Playwright fait partie du chantier, pas une étape optionnelle.

### Préparation

Lancer l'app en local :

```bash
npm run dev -- --host 127.0.0.1 --port 5173
```

Si le port est occupé, utiliser `5174` et adapter les URLs dans les scripts.

Viewports obligatoires :

- desktop : `1440 x 1000`
- mobile : `390 x 844`

Routes à capturer à chaque grand lot :

- `/`
- `/login`
- `/parent`
- `/play/local-child`
- `/regles`
- `/regles/a-a-as`

### Captures minimum

Générer des screenshots pour :

- landing desktop/mobile ;
- login desktop/mobile ;
- parent dashboard desktop/mobile ;
- dashboard enfant desktop/mobile ;
- boutique enfant desktop/mobile ;
- quiz guidé desktop/mobile ;
- écran de fin de quiz desktop/mobile ;
- popup bonus de bienvenue mobile ;
- popup bonus parfait mobile ;
- popup Couronne desktop/mobile ;
- popup Diamant desktop/mobile ;
- page SEO index desktop/mobile ;
- page SEO règle desktop/mobile.

Nommer les fichiers de façon stable :

```txt
/tmp/ds-audit-home-desktop.png
/tmp/ds-audit-home-mobile.png
/tmp/ds-audit-child-dashboard-mobile.png
/tmp/ds-audit-end-screen-mobile.png
```

### Assertions DOM obligatoires

Sur les surfaces non-debug, vérifier :

```js
const emojiRegex = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u;
const text = await page.locator('body').innerText();
expect(emojiRegex.test(text)).toBe(false);
```

Exceptions autorisées :

- contenu debug local derrière le panneau debug ;
- noms historiques dans des fichiers de data non affichés ;
- contenu explicitement marketing tant qu'il est remplacé dans la phase landing.

Vérifier aussi :

```js
await expect(page.locator('svg')).not.toHaveCount(0);
```

Sur les popups de récompense :

- présence d'au moins une icône SVG ;
- présence d'un montant ou score en `var(--font-kid)` ;
- absence d'emoji texte ;
- bouton d'action visible et cliquable.

Sur mobile :

- aucun texte hors viewport ;
- aucun bouton tronqué ;
- popup scrollable si contenu long ;
- bouton fermer accessible.

### Scénarios Playwright par phase

#### Phase 1 — socle icônes/récompenses

Vérifier avec une page de test réelle, pas seulement le build :

- ouvrir `/play/local-child` ;
- vérifier que les imports ne cassent pas ;
- vérifier que les composants reward rendent des SVG.

#### Phase 2 — EndScreen

Scénario :

1. Ouvrir `/play/local-child`.
2. Cliquer sur la première règle `Découvrir`.
3. Fermer ou accepter le bonus de bienvenue si affiché.
4. Répondre aux questions jusqu'à l'écran de fin.
5. Capturer l'écran.

Assertions :

- `Session terminée` visible ;
- score visible ;
- `CoinIcon` ou SVG pièce visible ;
- aucun emoji dans l'écran de fin ;
- score en Fredoka.

#### Phase 3 — overlays/popups

Scénarios :

- déclencher ou simuler `pendingEvents` si possible ;
- ouvrir `LevelHelpPopup` depuis un badge Couronne ;
- ouvrir `LevelHelpPopup` depuis un badge Diamant ;
- ouvrir bonus de bienvenue.

Assertions :

- popup centrée ;
- icône SVG ;
- contenu lisible mobile ;
- bouton fermer fonctionne ;
- aucun emoji.

#### Phase 4 — dashboard enfant

Scénario :

1. Ouvrir `/play/local-child`.
2. Capturer dashboard initial.
3. Cliquer stats `7j` et `30j`.
4. Capturer les popups stats.
5. Ouvrir l'aide flamme.

Assertions :

- chips stats sans emoji ;
- icônes SVG présentes ;
- cartes règles sans débordement ;
- bouton `Découvrir` visible sur mobile.

#### Phase 5 — boutique

Scénario :

1. Ouvrir `/play/local-child`.
2. Cliquer le compteur de pièces/boutique.
3. Capturer chaque onglet : cosmétique, boost, persos, image mystère.
4. Ouvrir une confirmation d'achat si le compte local a assez de pièces, sinon tester l'état désactivé.

Assertions :

- pas d'emoji dans les labels catégories/items ;
- prix lisible avec pièce SVG ;
- confirmation achat cohérente ;
- onglets accessibles mobile.

#### Phase 6 — parent

Scénario :

1. Ouvrir `/parent`.
2. Capturer dashboard parent.
3. Ouvrir modale PIN si affichée.
4. Ouvrir ajout/modification enfant si possible.

Assertions :

- pas de Fredoka sur les surfaces parent ;
- formulaires lisibles ;
- modales alignées glass ;
- aucun emoji UI non nécessaire.

#### Phase 7 — loading/erreurs

Scénario :

- simuler un fallback lazy si possible ;
- ouvrir une route invalide ;
- forcer un état loading section si possible.

Assertions :

- un seul style de loading plein écran ;
- spinner visible ;
- pas de double écran `Chargement` dans un flow normal ;
- erreurs sans emoji.

#### Phase 8 — landing/pages publiques

Scénario :

1. Ouvrir `/`.
2. Capturer haut de page desktop/mobile.
3. Ouvrir `/regles`.
4. Ouvrir `/regles/a-a-as`.
5. Lancer le mini quiz SEO.
6. Répondre jusqu'au score final.

Assertions :

- fond étoilé visible ;
- CTA sans emoji ;
- mini quiz sans emoji ;
- logo PrimoLingo dans le bouton mini quiz ;
- FAQ visible sur page règle.

### Checklist Playwright avant merge/deploy

Avant déploiement :

1. `npm run build` passe.
2. Playwright desktop/mobile passe sur les routes principales.
3. Captures ouvertes visuellement au moins pour :
   - dashboard enfant mobile ;
   - écran de fin mobile ;
   - boutique mobile ;
   - popup Couronne desktop ;
   - popup Diamant mobile ;
   - landing mobile.
4. Recherche statique des emoji UI :

```bash
rg -n "[\x{1F300}-\x{1FAFF}\x{2600}-\x{27BF}]" src
```

Chaque occurrence restante doit être :

- soit dans debug ;
- soit dans un contenu non affiché ;
- soit documentée comme exception temporaire.

5. Déployer seulement après validation visuelle.

### Assertions utiles supplémentaires

- aucun emoji dans les surfaces non-debug :
  - dashboard enfant
  - quiz
  - écran de fin
  - popups récompense
  - boutique
- présence de SVG dans les icônes de récompense.
- texte contenu dans ses cartes sur mobile.
- boutons accessibles et cliquables.

## Risques

- Remplacer les emoji dans les strings de coaching peut demander un mapping propre pour ne pas perdre le ton enfant.
- La boutique contient beaucoup de données avec emoji dans `economy.js`; il faut migrer progressivement.
- Les captures Playwright sur les flows de fin de quiz peuvent être fragiles si le quiz attend une interaction spécifique.
- Ne pas appliquer Fredoka trop largement : sinon l'app perd le côté sérieux attendu par les parents.

## Définition de terminé

Le chantier est terminé quand :

- les écrans enfant principaux n'affichent plus d'emoji UI ;
- les moments de récompense ont une identité visuelle cohérente ;
- Fredoka est utilisé uniquement dans les contextes enfant/reward ;
- les pages publiques, parent et enfant partagent les mêmes tokens ;
- le build passe ;
- les captures Playwright desktop/mobile ne montrent pas de débordement ou incohérence majeure.

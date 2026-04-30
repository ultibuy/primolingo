# Plan de dev — Arcs narratifs GramHero

> Plan d'implémentation pour transformer les 14 arcs narratifs définis dans [NARRATIVE_ARCS.md](./NARRATIVE_ARCS.md) en feature fonctionnelle. Les composants visuels (le `MotivationBanner` et ses variantes) sont déjà spécifiés dans [`ux-designer/design_handoff_motivation/plan_graphique.md`](./ux-designer/design_handoff_motivation/plan_graphique.md) — ce plan se cale dessus côté présentation et se concentre sur l'engine de décision et la mécanique.

---

## 1. Vue d'ensemble

### Ce qu'il faut construire

Trois briques distinctes qui collaborent :

1. **Un moteur d'arcs (`coachingEngine`)** — fonction pure qui, à partir du `progress` complet et du contexte courant, retourne **au plus un message** à afficher, parmi les ~80 messages possibles (étapes des 14 arcs).
2. **Un stockage d'état narratif (`progress.coaching`)** — flags persistés pour ne pas répéter un message déjà servi, gérer les cooldowns, et tracer l'historique.
3. **Un composant de présentation (`MotivationBanner`)** — déjà designé, à coder dans le projet React. Il consomme le résultat du moteur et s'affiche selon les règles visuelles définies dans le handoff.

### Points d'affichage

Trois canaux distincts, chacun avec une logique propre :

| Canal | Composant | Variantes utilisées | Quand |
|---|---|---|---|
| **Dashboard** | `MotivationBanner` au-dessus du sélecteur Grammaire / Mots | les 6 variantes visuelles (Panda, Flamme, Couronnes, Sans emoji, Diamant, Pièces) | À l'arrivée sur l'écran d'accueil |
| **EndScreen** | Bulle 🔒 sur le perso (déjà en place) + ligne de coaching sous le score | bulle `EmotionPurchasePopup` (déjà fait) + nouveau composant `EndScreenCoachingLine` | Après chaque session |
| **Toasts contextuels** | Petit toast en bas du dashboard, 4 s, dismissible | nouveau composant `CoachingToast` | Suite à un événement précis (palier flamme, level-up déjà géré, etc.) |

Le **MotivationBanner** du dashboard est le canal principal — il porte ~70 % des messages. Les autres canaux servent des moments très précis.

---

## 2. Data model

### 2.1 — Nouveau champ `progress.coaching`

Ajout dans `createDefaultProgress()` (`src/store/persistence.js`) :

```js
coaching: {
  shown: {
    // Flags des arcs déjà servis. Clé = identifiant d'arc + étape, valeur = ISO date.
    // Exemples :
    // 'arc1.welcomeBonus': '2026-04-28',
    // 'arc1.pandaUnlocked': '2026-05-02',
    // 'arc12.firstLockedBubbleSeen': '2026-04-28',
  },
  lastShownByArc: {
    // Pour les arcs qui peuvent revenir périodiquement (ex : arc 5 flamme menacée).
    // Clé = id d'arc, valeur = ISO date du dernier affichage.
  },
  dailyShownCount: {
    // Compteur quotidien pour le cap de 4 messages contextuels par jour.
    // Reset chaque jour. { date: 'YYYY-MM-DD', count: number }
  },
  lastBannerArc: null, // dernier arc affiché en MotivationBanner (pour cooldown)
}
```

Cette structure couvre :
- **One-shot** : arcs joués une seule fois (Onboarding, level-ups, premier déblocage…) → `shown[arcId.step]`.
- **Récurrents** : arcs réactivables (flamme menacée 16h, encouragement de retour…) → `lastShownByArc[arcId]` + cooldown 24h.
- **Cap quotidien** : `dailyShownCount` pour limiter à 4/jour.

Migration : ajouter dans la routine de migration de `loadProgress` un fallback `progress.coaching ||= createDefaultCoaching()` pour les profils existants.

### 2.2 — Persistance

Aucun changement côté Firestore — le champ `coaching` est sérialisé avec le reste de `progress`. La structure est suffisamment plate pour ne pas exploser en taille (max ~40 flags one-shot + 14 entries `lastShownByArc`).

---

## 3. Le moteur d'arcs (`coachingEngine`)

### 3.1 — Localisation

Nouveau fichier : `src/engine/coaching.js`. Structure inspirée de `scoring.js` (fonctions pures, testables).

### 3.2 — API publique

```js
// Contexte d'évaluation
type CoachingContext = {
  trigger: 'dashboard' | 'endScreen' | 'returnScreen' | 'duringQuiz';
  progress: Progress;
  todayStr: string;
  hour: number;          // 0-23, pour les arcs heure-dépendants
  rules: Rule[];         // catalogue complet
  lastSessionEvent?: SessionEvent; // pour endScreen et juste après
};

// Résultat
type CoachingMessage = {
  arcId: string;          // 'arc5.streakAtRisk16h'
  variant: BannerVariant; // 'panda' | 'flamme' | 'couronnes' | 'plain' | 'diamant' | 'pieces' | null
  copy: string;           // texte final, avec interpolations résolues
  emphasis?: string;      // mot mis en gras / coloré dans la copy
  emoji?: string;         // emoji prefix
  cta?: { label: string, action: 'openShop' | 'openShopChars' | 'openLevelHelp' | ... };
  oneShot: boolean;       // doit-on flagger après affichage ?
};

// Fonction principale
function pickCoachingMessage(ctx: CoachingContext): CoachingMessage | null;

// Marqueur post-affichage
function markCoachingShown(progress: Progress, msg: CoachingMessage, todayStr: string): Progress;
```

`pickCoachingMessage` :
1. Évalue les conditions de chaque arc dans l'ordre de priorité.
2. Filtre ceux déjà servis (one-shot) ou en cooldown.
3. Filtre si `dailyShownCount.count >= 4`.
4. Retourne le premier match — ou `null`.

`markCoachingShown` met à jour les flags appropriés et incrémente le cap quotidien.

### 3.3 — Priorité globale

Définie dans NARRATIVE_ARCS.md §Logique de déclenchement. Encodée comme un tableau ordonné dans `coaching.js` :

```js
const PRIORITY_ORDER = [
  'arc1',  // Onboarding (avant que le 1er quiz soit fait, et juste après)
  'arc5.streakAtRisk16h',  // Flamme menacée en journée
  'arc4.diamondInDanger',  // Diamant en danger
  'arc3.crownInSight',     // Couronne à 1 session
  'arc4.diamondInSight',   // Diamant à 1 session
  'arc2.silverInSight',    // Argent à 1 session
  'arc12.firstLockedBubbleSeen',  // Première rencontre du système d'émotions
  'arc13.shieldUrgency',   // Bouclier urgent (flamme ≥ 7j sans bouclier)
  'arc6.shopThresholds',   // Seuils boutique
  'arc1.pandaUnlocked',    // Panda accessible
  // ... et ainsi de suite
];
```

L'ordre est volontairement opinionated : on privilégie ce qui sauve la séance d'aujourd'hui (flamme, diamant) sur ce qui pousse l'engagement long terme (boutique).

### 3.4 — Structure interne

Chaque arc est une fonction `evaluateArcN(ctx)` qui retourne soit une `CoachingMessage`, soit `null`. Elles sont enchaînées dans `pickCoachingMessage` :

```js
const ARC_EVALUATORS = [
  evaluateArc1Onboarding,
  evaluateArc2BronzeArgent,
  evaluateArc3ArgentCouronne,
  // ...
];

function pickCoachingMessage(ctx) {
  if (isCapReached(ctx)) return null;
  for (const arcId of PRIORITY_ORDER) {
    const msg = ARC_EVALUATORS_BY_ID[arcId](ctx);
    if (!msg) continue;
    if (isAlreadyShown(ctx.progress, msg.arcId, ctx.todayStr)) continue;
    return msg;
  }
  return null;
}
```

Chaque évaluateur est une dizaine de lignes au plus. Tests unitaires nominal pour chacun.

### 3.5 — Cooldowns

| Type d'arc | Cooldown |
|---|---|
| One-shot | À vie (flag `shown`) |
| Récurrent quotidien | 24 h après dernier affichage (`lastShownByArc`) |
| Récurrent par session | 1 affichage par session |

Un arc one-shot peut être ré-armé si la condition redevient vraie pour une raison structurelle (ex : Panda revendu et racheté — ne devrait jamais arriver mais pris en compte par sécurité).

---

## 4. Le composant `MotivationBanner`

### 4.1 — Spec

Conforme au handoff `ux-designer/design_handoff_motivation/plan_graphique.md`. Reproduire dans le codebase React :

```
src/components/MotivationBanner.jsx
```

API :

```jsx
<MotivationBanner
  variant="panda" | "flamme" | "couronnes" | "plain" | "diamant" | "pieces"
  emoji={'🐼'}            // optionnel selon variante
  message={'Plus que 30 ● pour débloquer le Panda Samouraï !'}
  emphasisColor={'#fbcb3a'}  // résolu côté engine selon variante
  cta={{ label: 'Voir →', onClick: handleClick }}  // optionnel
  onDismiss={() => ...}    // optionnel — pour permettre fermeture manuelle
/>
```

Animations :
- Float de l'emoji (variante avec `floatEmoji: true`) — keyframe CSS dans `index.css`.
- Apparition : fade-in + translateY 4px → 0 sur 220 ms (cohérent avec les overlays existants).

### 4.2 — Intégration Dashboard

Modifier `src/components/Dashboard.jsx` :

```jsx
// Avant le sélecteur Grammaire / Mots
import MotivationBanner from './MotivationBanner.jsx';
import { pickCoachingMessage, markCoachingShown } from '../engine/coaching.js';

// dans le composant
const coachingMsg = useMemo(
  () => pickCoachingMessage({
    trigger: 'dashboard',
    progress, rules: allRules,
    todayStr: getToday(),
    hour: new Date().getHours(),
  }),
  [progress, allRules]
);

// Affichage
{coachingMsg && (
  <MotivationBanner
    variant={coachingMsg.variant}
    message={coachingMsg.copy}
    emphasis={coachingMsg.emphasis}
    cta={coachingMsg.cta && {
      label: coachingMsg.cta.label,
      onClick: () => handleCtaAction(coachingMsg.cta.action)
    }}
  />
)}

// Au mount, marquer comme vu (one-shot)
useEffect(() => {
  if (coachingMsg?.oneShot) {
    const next = markCoachingShown(progress, coachingMsg, getToday());
    onProgressChange(next);
  }
}, [coachingMsg]);
```

`handleCtaAction` route les CTA vers l'action correspondante : `openShop` → `setScreen('shop')`, `openShopChars` → `setScreen('shop'); setShopTab('persos')`, etc.

### 4.3 — Intégration EndScreen

Nouveau composant léger `EndScreenCoachingLine` pour le rebond après session. Inséré dans `src/components/EndScreen.jsx` entre la zone de score et le bouton Continuer (ou intégré dans la zone de progression existante).

```jsx
{coachingMsg && (
  <div style={endScreenLineStyle}>
    {coachingMsg.copy}
  </div>
)}
```

Pas de variante visuelle complexe ici — un simple texte coloré 13px, parce que l'écran est déjà chargé.

### 4.4 — Toasts

Pour les arcs déclenchés par un événement précis (ex : palier de flamme, perso adopté), utiliser un composant `CoachingToast` qui s'affiche 4 s en bas du dashboard et se dismiss tout seul. Ces messages **ne passent pas par le moteur de priorité** — ils sont déclenchés directement par les events existants. Plutôt que de réinventer un système d'overlay, on peut s'appuyer sur le système d'événements déjà en place dans `Dashboard.jsx` (`pendingEvents`, `EVENT_CONFIG`).

---

## 5. Implémentation par arc

Ce paragraphe détaille la complexité d'implémentation par arc, pour permettre un découpage en tickets.

### Arc 1 — Onboarding *(complexité : faible)*
- Conditions simples sur `milestones.firstSession`, `coins`, `shop.owned`.
- Étapes : 1.1, 1.2, 1.3, 1.4, 1.5, 1.6 (perso adopté toast), 1.7, 1.8.
- Variantes utilisées : `plain`, `panda`, `flamme`.
- Un onboarding linéaire — pas de branches complexes.

### Arc 2 — Bronze → Argent *(faible)*
- Boucle sur les rules en niveau 1 ou 2, comptage de `guidedSessionsAbove80`.
- Variante `plain` ou nouvelle variante `silver` (à ajouter au handoff si voulu — sinon `plain` suffit).

### Arc 3 — Argent → Couronne *(moyenne)*
- Comme Arc 2 mais sur `directSessionsAbove80`.
- Étape 3.4 a une condition globale (≥ 2 couronnes ET < 50 % règles à Bronze) → calcul agrégé.
- Variante `couronnes`.

### Arc 4 — Diamant *(moyenne)*
- 9 étapes, certaines dépendantes du SM-2 (`sm2.nextReviewDate`, `sm2.diamondHealth`).
- Étape 4.8 (diamant en danger) doit fire si **n'importe lequel** des diamants a `health < 1.0` → boucle sur toutes les règles.
- Variante `diamant`.

### Arc 5 — Flamme *(moyenne)*
- Heure-dépendant pour 5.8 (16h+).
- Différencier première session de la veille / aujourd'hui.
- Variante `flamme`.

### Arc 6 — Boutique *(faible)*
- Pure logique de seuils sur `coins`.
- Personnalisation pour la première émotion : trouver le perso possédé le plus récemment via tri par ordre dans `shop.owned`.
- Variantes `pieces`, `panda`.

### Arc 7 — Boosts *(triviale)*
- 2 étapes, conditions simples.
- Variante `pieces`.

### Arc 8 — Apprendre de nouveaux mots *(faible)*
- Conditions sur les niveaux des dictées.
- Pas de variante dédiée → `plain`.

### Arc 9 — Reconquête *(triviale, déjà partiellement géré)*
- Géré dans le ReturnScreen existant. Ajouter juste 9.5 (premier quiz post-retour) au moteur.

### Arc 10 — Mastery *(faible)*
- Comptages agrégés (% diamants, % couronnes).
- Variante `couronnes` ou `diamant`.

### Arc 11 — Image mystère *(triviale)*
- Conditions sur `shop.mysteryImages.collections[id].revealedCount`.
- Variante `pieces` ou nouvelle variante `mystery` à créer.

### Arc 12 — Émotions *(moyenne)*
- 12.1 et 12.6-12.8 sont des **fallbacks de la bulle 🔒 existante** — la bulle elle-même est déjà codée (`EmotionPurchasePopup`). Ne pas dupliquer.
- 12.2-12.5 sont des arcs dashboard classiques.
- Variante `pieces` ou nouvelle `emotion`.

### Arc 13 — Boucliers *(faible)*
- 8 étapes, conditions sur `coins`, `shields`, `streak.current`.
- Étape 13.6 (post-shieldUsed) déclenchée par event existant — passer par un toast plutôt que par le banner.
- Pas de variante dédiée → `flamme` (cohérence visuelle avec l'arc flamme).

### Arc 14 — Encouragements *(faible)*
- Toasts pure et simple, déclenchés par events de session.
- Pas dans le banner.

---

## 6. Roadmap par phases

### Phase 1 — Foundation *(1 sprint)*

**Objectif : avoir un MotivationBanner qui s'affiche, même si seul l'arc 1 est implémenté.**

- [ ] Créer `src/engine/coaching.js` avec API publique et squelette.
- [ ] Créer `src/components/MotivationBanner.jsx` (les 6 variantes visuelles + animations).
- [ ] Étendre `createDefaultProgress` avec `progress.coaching`.
- [ ] Implémenter `evaluateArc1Onboarding`.
- [ ] Câbler dans `Dashboard.jsx`.
- [ ] Tests unitaires sur arc 1.

**Critère de validation** : un nouveau profil voit le bandeau d'onboarding au bon moment, l'enfant peut atteindre le Panda en suivant les nudges.

### Phase 2 — Arcs critiques *(1 sprint)*

**Objectif : couvrir les arcs qui touchent 100 % des joueurs réguliers.**

- [ ] Arc 5 (flamme) — toutes les étapes.
- [ ] Arc 13 (boucliers) — toutes les étapes hors toasts.
- [ ] Arc 9 (reconquête) — étape 9.5.
- [ ] Composant `CoachingToast` pour les rebonds (palier flamme atteint, etc.).

**Critère de validation** : un joueur en cours de série de 7 jours sans bouclier voit l'arc 13 push à 16h.

### Phase 3 — Arcs de progression *(1 sprint)*

**Objectif : pousser la maîtrise des règles.**

- [ ] Arc 2, Arc 3, Arc 4 — toutes les étapes.
- [ ] Variante visuelle `silver` si voulue (sinon réutiliser `plain`).
- [ ] Logique de tri pour identifier la règle la plus proche du prochain palier.

**Critère de validation** : un joueur à 2 sessions de l'Argent voit le push spécifique sur sa règle.

### Phase 4 — Arcs économiques *(1 sprint)*

- [ ] Arc 6 (boutique) — tous les seuils.
- [ ] Arc 7 (boosts) — Double coins.
- [ ] Arc 12 (émotions) — étapes 12.2-12.5 dans le banner.
- [ ] Arc 11 (image mystère).

**Critère de validation** : un joueur avec 200+ pièces et un perso voit le push émotion personnalisé.

### Phase 5 — Polish *(1 sprint)*

- [ ] Arc 8 (apprendre de nouveaux mots).
- [ ] Arc 10 (mastery).
- [ ] Arc 14 (encouragements ponctuels) en toasts.
- [ ] EndScreen `EndScreenCoachingLine` pour les rebonds post-session.
- [ ] Tuning des cooldowns et de la priorité après observation utilisateur.

---

## 7. Tests & QA

### 7.1 — Tests unitaires

Pour chaque évaluateur d'arc, un fichier `tests/coaching/arcN.test.js` qui couvre :
- Cas où l'arc fire correctement.
- Cas où l'arc ne fire pas (condition non remplie).
- Cas où l'arc est en cooldown.
- Interpolations correctes (X jours, X pièces, nom du perso, etc.).

### 7.2 — Tests d'intégration

Un harness qui simule un parcours utilisateur complet :
- J0 : nouveau joueur, doit voir arc 1.1.
- J0 après 1 session : arc 1.2.
- J1 matin : arc 5.1 ou arc 1.6 selon coins.
- J6 soir : arc 5.3.
- J7 après session : arc 5.4.
- Etc.

### 7.3 — Tests visuels Playwright

Le projet a déjà Playwright installé (`package.json` ligne dev-dependencies) ainsi qu'une infra de tests visuels via Puppeteer (`tests/visual.test.js`). On ajoute un nouveau fichier `tests/coaching-banner.test.js` (Playwright) dédié au `MotivationBanner` et au moteur d'arcs.

L'approche est **screenshot-based avec injection d'état** : on précharge un `progress` factice via `localStorage` (clé `debug_progress:{uid}:{childId}` — déjà utilisée par les tests existants), on charge le dashboard, et on compare le rendu visuel à une référence.

#### 7.3.1 — Tests de rendu de chaque variante

Un test par variante visuelle (6 variantes définies dans le handoff). Pour chacun :
1. Injecter un `progress` qui force la condition de l'arc.
2. Charger le dashboard.
3. Capturer le screenshot du banner uniquement (`page.locator('[data-testid="motivation-banner"]').screenshot()`).
4. Comparer à la baseline (`expect(screenshot).toMatchSnapshot('banner-panda.png')`).

Liste des screenshots de référence à produire :
- `banner-panda.png` — Arc 1.4, 250 pièces atteintes, Panda non possédé.
- `banner-flamme.png` — Arc 5.3, J6 soir, flamme à 6 jours.
- `banner-couronnes.png` — Arc 3.3, première couronne décrochée à la session précédente.
- `banner-plain.png` — Arc 1.1, nouveau profil sans aucune session.
- `banner-diamant.png` — Arc 4.2, 2/3 sessions à 18/20 sur une règle.
- `banner-pieces.png` — Arc 6.7, 1040 pièces, perso possédé, vise une émotion.

Total : 6 screenshots de baseline. Régression = diff > 0.1 % de pixels (tolérance pour anti-aliasing).

#### 7.3.2 — Tests de positionnement et animation

- **`banner-position-above-selector`** — vérifier que le banner est rendu au-dessus du sélecteur Grammaire / Mots (assertion sur `getBoundingClientRect`).
- **`banner-emoji-float-animation`** — vérifier que la transformation CSS s'applique sur les variantes avec emoji animé : capturer 2 frames à 800 ms d'intervalle et vérifier que `transform.translateY` change.
- **`banner-no-render-when-cap-reached`** — injecter `dailyShownCount.count === 4`, vérifier que le banner n'apparaît pas.

#### 7.3.3 — Tests d'interaction (CTA)

- **`banner-panda-cta-opens-shop`** — Arc 1.5 (Panda accessible). Cliquer sur « Voir → ». Vérifier la navigation vers `screen=shop` et l'onglet `persos` actif.
- **`banner-cta-marks-shown-flag`** — après affichage, vérifier que `progress.coaching.shown['arc1.pandaUnlocked']` est posé (lecture localStorage post-render).
- **`banner-dismiss-no-replay-same-day`** — afficher le banner, recharger la page, vérifier qu'il ne réapparaît pas (cooldown one-shot).

#### 7.3.4 — Tests de priorité globale

Un test critique qui valide l'ordre. Injecter un état où **plusieurs arcs sont éligibles simultanément** :
- Streak menacée à 16 h (arc 5.8) **ET** seuil 250 pièces atteint (arc 1.5) **ET** diamant en danger (arc 4.8).
- Vérifier que c'est bien `arc4.diamondInDanger` qui sort (priorité plus haute que 5.8 et 1.5 selon la table).

Test : `banner-priority-diamond-over-others.png` + assertion textuelle sur le contenu.

#### 7.3.5 — Tests de scénarios temporels

Le moteur dépend de l'heure pour arc 5.8. Le simuler via `page.evaluate(() => { Date.now = () => fakeTimestamp; })` ou via le debug panel (qui doit accepter un override d'heure).

- **`banner-streak-at-risk-after-16h`** — injecter heure = 17 h, flamme à 4 jours, pas de session du jour. Doit afficher arc 5.8.
- **`banner-streak-at-risk-not-before-16h`** — injecter heure = 14 h, même état. **Ne doit pas** afficher arc 5.8.

#### 7.3.6 — Tests de l'EndScreen

- **`endscreen-coaching-line-rendered`** — capture du EndScreen avec coaching line visible (variante post-arc 4.1 par ex).
- **`endscreen-locked-emotion-bubble`** — capture du EndScreen avec un perso possédé mais émotion verrouillée. Vérifier que la bulle 🔒 est affichée (déjà en place dans le code, à régresser uniquement).

#### 7.3.7 — Convention et exécution

- Tous les screenshots de baseline sont stockés dans `tests/screenshots/coaching-banner/` (à créer).
- Convention de nommage : `banner-{arc}-{etape}.png` ou `endscreen-{description}.png`.
- Commande npm à ajouter au `package.json` :
  ```json
  "test:coaching": "playwright test tests/coaching-banner.test.js",
  "test:coaching:update": "playwright test tests/coaching-banner.test.js --update-snapshots"
  ```
- À intégrer dans la CI : exécuter `npm run test:coaching` avant chaque déploiement, échec si diff > seuil.

#### 7.3.8 — Couverture par phase

| Phase | Tests visuels à livrer |
|---|---|
| Phase 1 (Foundation) | `banner-plain` + `banner-panda` + `banner-position-above-selector` + `banner-no-render-when-cap-reached` |
| Phase 2 (Critique) | `banner-flamme` (3 variantes selon palier) + `banner-streak-at-risk-after-16h` + `banner-shield-urgency` |
| Phase 3 (Progression) | `banner-couronnes` + `banner-diamant` + `banner-priority-diamond-over-others` |
| Phase 4 (Économie) | `banner-pieces` + `banner-panda-cta-opens-shop` |
| Phase 5 (Polish) | `endscreen-coaching-line-rendered` + tests de régression complète |

### 7.4 — Debug panel

Ajouter dans le panel debug existant (`Dashboard.jsx`, déclenché par `Cmd+Shift+D` en localhost) :
- Bouton « Reset coaching flags ».
- Bouton « Force show arc N étape M ».
- Affichage de tous les flags `progress.coaching.shown`.

---

## 8. Métriques à instrumenter

Une fois la feature livrée, mesurer (côté Firestore ou via un service analytics si présent) :

- Taux d'apparition de chaque arc (combien de joueurs l'ont vu).
- Taux de conversion : Arc N affiché → action attendue déclenchée dans les 24h (ex : Arc 6.3 « 250 pièces dispo » → achat du Panda).
- Cap quotidien : combien de joueurs sont saturés à 4 messages/jour.
- Variantes les plus efficaces (CTR du bandeau).

Ces mesures servent à itérer en Phase 5 sur la priorité globale.

---

## 9. Risques et points d'attention

### 9.1 — Sur-sollicitation
**Risque** : trop de messages tuent le message.
**Mitigation** : cap à 4/jour, cooldown 24 h, priorité stricte. Réviser en Phase 5 selon l'usage réel.

### 9.2 — Désync entre `progress.coaching` et l'état observé
**Risque** : un message marqué comme vu mais en fait jamais affiché (race condition).
**Mitigation** : marquer le flag **après** que le composant soit monté (dans un `useEffect`), pas avant. Idempotent côté serveur.

### 9.3 — Migration des profils existants
**Risque** : profils créés avant cette feature n'ont pas de champ `coaching`.
**Mitigation** : migration silencieuse dans `loadProgress` (`progress.coaching ||= createDefaultCoaching()`).

### 9.4 — Tests difficiles à reproduire
**Risque** : les conditions temporelles (16h+, retour après 7j, etc.) sont chiantes à tester en QA manuelle.
**Mitigation** : le debug panel doit permettre d'injecter une heure / une date factice, pas juste de reset les flags.

---

## 10. Annexes

- **Catalogue complet des messages** : voir [NARRATIVE_ARCS.md](./NARRATIVE_ARCS.md). Toutes les copies sont en français, déjà rédigées dans le style attendu (ton complice, horizon court, 1 verbe d'action).
- **Specs visuelles** : voir [`ux-designer/design_handoff_motivation/plan_graphique.md`](./ux-designer/design_handoff_motivation/plan_graphique.md) pour les valeurs hex, animations, padding, et la liste exhaustive des 6 variantes du `MotivationBanner`.
- **Référence gameplay** : voir [GAMEPLAY.md](./GAMEPLAY.md) pour comprendre les seuils et les mécaniques évoqués dans les arcs (niveaux, économie, persos, émotions…).

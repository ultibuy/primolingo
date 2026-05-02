# Plan de développement — Personnages GramHero

> Fichier de référence pour Claude Code. Tous les chemins sont relatifs à `orthographe-app/`.

---

## 0. Vue d'ensemble

4 chantiers indépendants à exécuter dans cet ordre :

2. Ajouter `CharStormEagle` dans `CharacterSprite.jsx`
3. Refonte boutique : onglet "Persos"
4. Personnage sur la barre de progression (quiz)
5. Build + déploiement Firebase

---

## 1. section vide, oublie

## 2. Personnage Aigle Tempête

**Fichier source :** `../skill-sprites/CharStormEagle.jsx`  
**Fichier cible :** `src/components/CharacterSprite.jsx`

### Ce qui change

Le fichier `skill-sprites/CharStormEagle.jsx` contient une fonction `CharStormEagle({ s, m, id, blink })` avec le SVG complet.

#### Étape A — Ajouter la fonction
Copier la fonction `CharStormEagle` dans `CharacterSprite.jsx` juste avant la section `// ─── CHARS MAP ───`.

Le SVG utilise des yeux custom (pas le helper `Eyes`) et un bec spécifique selon `m` — laisser tel quel, ça compile.

#### Étape B — Enregistrer dans la map
```js
const CHARS = {
  // ... existants ...
  stormEagle: CharStormEagle,   // ← ajouter
};
```

#### Étape C — Enregistrer dans `src/data/characters.js`
```js
{ id: 'stormEagle', emoji: '🦅', name: 'Aigle Tempête', tag: 'Seigneur des vents', color: '#67e8f9', cat: 'animaux' },
```
Remplacer l'entrée existante `eagle` dans la liste des 8 persos boutique (voir section 3). L'Aigle Tempête = `stormEagle`, pas `eagle`.

---

## 3. Boutique — onglet "Persos"

**Fichier cible :** `src/components/Shop.jsx`

### 3.1 — Supprimer "En jeu", ajouter "Persos"

Dans le tableau `CATEGORIES` (ligne ~29) :
```js
// Avant
{ key: 'enjeu', label: 'En jeu', filter: (item) => ['revealHint', ...].includes(item.category) },

// Après
{ key: 'persos', label: 'Persos', filter: () => false },
```

### 3.2 — Les 8 personnages

Définir une constante locale dans `Shop.jsx` :

```js
const SHOP_CHARACTERS = [
  { id: 'panda',      emoji: '🐼', name: 'Panda Samouraï',    tag: 'Guerrier de l\'ombre',      color: '#67e8f9' },
  { id: 'fox',        emoji: '🦊', name: 'Renard Espion',      tag: 'Rusé comme le vent',         color: '#fb923c' },
  { id: 'wolf',       emoji: '🐺', name: 'Loup Fantôme',       tag: 'Chasseur de la pleine lune', color: '#818cf8' },
  { id: 'tiger',      emoji: '🐯', name: 'Tigre de l\'Éclair', tag: 'Vitesse absolue',            color: '#fde047' },
  { id: 'lion',       emoji: '🦁', name: 'Lion Solaire',       tag: 'Roi de la savane',           color: '#fbbf24' },
  { id: 'stormEagle', emoji: '🦅', name: 'Aigle Tempête',      tag: 'Seigneur des vents',         color: '#7dd3fc' },
  { id: 'ice',        emoji: '🧊', name: 'Reine des Glaces',   tag: 'Froid et beauté',            color: '#bae6fd' },
  { id: 'robot',      emoji: '🤖', name: 'Robot Gardien',      tag: 'Précis et indestructible',   color: '#38bdf8' },
];
```

### 3.3 — Les émotions

```js
const SHOP_EMOTIONS = [
  { id: 'sleep',    symbol: '💤', name: 'Dodo',      price: 150,
    desc: 'Apparaît au démarrage (0–5 min)' },
  { id: 'wave',     symbol: '👋', name: 'Salut',     price: 200,
    desc: 'Première session · Niveau Bronze atteint' },
  { id: 'cheer',    symbol: '🙌', name: 'Hourra',    price: 200,
    desc: 'Niveau Argent / Couronne · Mode direct débloqué · Révision SM2 réussie' },
  { id: 'victory',  symbol: '🏆', name: 'Victoire',  price: 200,
    desc: 'Niveau Diamant · Trophée diamant · Mode sniper réussi' },
  { id: 'clap',     symbol: '👏', name: 'Bravo',     price: 200,
    desc: 'Session parfaite 20/20' },
  { id: 'dance',    symbol: '💃', name: 'Danse',     price: 200,
    desc: 'Palier de streak atteint' },
  { id: 'surprise', symbol: '😲', name: 'Surprise',  price: 200,
    desc: 'Streak perdu · Révision SM2 échouée · Diamant brisé' },
  { id: 'kiss',     symbol: '💋', name: 'Bisou',     price: 200,
    desc: 'Bouclier activé' },
  { id: 'think',    symbol: '🤔', name: 'Hésitation', price: 200,
    desc: 'Révision SM2 limite' },
];
```

### 3.4 — IDs de purchase

Conventions :
- Acheter un perso : `char-{id}` (ex. `char-panda`) → coût **500**
- Acheter une émotion : `char-{id}-{emotionId}` (ex. `char-panda-sleep`) → coût **150 ou 200**

Ces IDs sont ajoutés directement dans `progress.shop.owned` via `onPurchase(itemId, price)`.  
`isOwned(progress, itemId)` = `(progress.shop?.owned || []).includes(itemId)` → fonctionne sans modifier `economy.js`.

### 3.5 — Composant `ShopCharacterCard`

Nouveau composant interne à `Shop.jsx`.

```
Affichage par ligne :
┌──────────────────────────────────────────────────────────────┐
│  [emoji 32px]  Nom du perso     Tag                [Acheter 500🪙] │
└──────────────────────────────────────────────────────────────┘

Si acheté → l'emoji est remplacé par <CharacterSprite id={char.id} mood="walk" size={30} />

Si acheté → sous la ligne, liste des émotions :
  💤 Dodo       150🪙  [Acheter]  (ou ✓ si possédée)
  👋 Salut      200🪙  [Acheter]
  ...
```

**Logique bouton perso :**
- Non acheté + assez de pièces → `Acheter 500 🪙` → `onPurchase('char-panda', 500)`
- Non acheté + pas assez → griser, afficher manque X
- Acheté → afficher "✓ Possédé" en vert

**Logique bouton émotion :**
- Non possédée + assez → `Acheter` → `onPurchase('char-panda-sleep', 150)` → **ouvrir popup**
- Non possédée + pas assez → griser
- Possédée → symbole + "✓" cliquable → ouvrir popup (pour re-voir l'animation)

### 3.6 — Popup émotion

State : `[emotionPopup, setEmotionPopup] = useState(null)` avec `{ charId, emotion }`.

Contenu :
```
┌─ popup overlay ────────────────────────┐
│  Titre : "[Symbol] [Nom émotion]"      │
│  <CharacterSprite id={charId}          │
│    mood={emotion.id} size={80} />      │
│  Description : "[desc]"                │
│  [Fermer]                              │
└────────────────────────────────────────┘
```

Quand on *achète* une émotion : appeler `onPurchase(...)` puis ouvrir immédiatement la popup pour montrer l'animation.  
Quand on *reclique* une émotion déjà possédée : ouvrir la popup directement (sans achat).

### 3.7 — Rendu de l'onglet "Persos"

```jsx
{activeTab === 'persos' && (
  <div>
    {SHOP_CHARACTERS.map(char => (
      <ShopCharacterCard key={char.id} char={char} progress={progress} coins={coins}
        onPurchase={onPurchase} onOpenPopup={setEmotionPopup} />
    ))}
  </div>
)}
```

### 3.8 — Import à ajouter

```js
import CharacterSprite from './CharacterSprite.jsx';
```

---

## 4. Personnage sur la barre de progression

### 4.1 — Helpers (nouveau fichier ou inline dans ProgressBar.jsx)

```js
// IDs des 8 personnages disponibles à la boutique
const PURCHASABLE_CHARS = ['panda','fox','wolf','tiger','lion','stormEagle','ice','robot'];

// Retourne la liste des persos achetés
function getOwnedChars(shopOwned = []) {
  return PURCHASABLE_CHARS.filter(id => shopOwned.includes(`char-${id}`));
}

// Retourne les émotions achetées pour un perso donné
function getOwnedEmotions(shopOwned = [], charId) {
  return shopOwned
    .filter(id => id.startsWith(`char-${charId}-`))
    .map(id => id.replace(`char-${charId}-`, ''));
}
```

### 4.2 — Modifier `ProgressBar.jsx`

Nouvelles props : `shopOwned`, `lastAnswer`  
(`lastAnswer` = null | 'correct' | 'wrong' → fourni par QuizDirect)

Logique :
- `ownedChars = getOwnedChars(shopOwned)` → si vide, rendu actuel inchangé
- Si ≥ 1 perso : choisir `activeChar = ownedChars[0]` (ou rotation selon question)
- `mood` :
  - `lastAnswer === 'correct'` → `'cheer'` pendant 1.5 s puis retour `'walk'`
  - `lastAnswer === 'wrong'` → `'surprise'` pendant 1.5 s puis retour `'walk'`
  - sinon → `'walk'`
- Position du perso : `left: ${pct}%` (centré sur la tête, clamped 0%–100%)

Structure HTML :
```jsx
<div style={{ position: 'relative', marginBottom: '0.5rem' }}>
  {/* Le perso flottant au-dessus */}
  {activeChar && (
    <div style={{
      position: 'absolute',
      bottom: 6,          // juste au-dessus de la barre
      left: `${pct}%`,
      transform: 'translateX(-50%)',
      transition: 'left 0.4s ease',
      pointerEvents: 'none',
      zIndex: 10,
    }}>
      <CharacterSprite id={activeChar} mood={mood} size={28} glow={false} />
    </div>
  )}
  {/* Barre existante */}
  <div role="progressbar" style={{ height: 4, ... }}>
    <div style={{ width: `${pct}%`, ... }} />
  </div>
</div>
```

**Gestion du mood temporaire :** `useEffect` sur `lastAnswer` → déclenche `setMood(...)` + `setTimeout` reset.

### 4.3 — Modifier `QuizDirect.jsx`

Nouvelles props : `shopOwned`

```jsx
// Ajouter dans la signature
export default function QuizDirect({ ..., shopOwned }) {

// Passer à ProgressBar
<ProgressBar
  current={currentIndex}
  total={questions.length}
  showResult={showResult}
  shopOwned={shopOwned}
  lastAnswer={showResult ? (isCorrect ? 'correct' : 'wrong') : null}
/>
```

Même chose pour `QuizGuided.jsx`.

### 4.4 — Modifier `ChildApp.jsx`

```jsx
<QuizComponent
  ...
  shopOwned={progress.shop?.owned || []}
/>
```

---

## 5. Dashboard — remplacer PandaWalker par le perso actif

**Fichier cible :** `src/components/Dashboard.jsx`

### Logique de sélection du perso actif

```js
// Dans Dashboard.jsx
const ownedChars = getOwnedChars(progress.shop?.owned);
const activeCharId = ownedChars.length > 0 ? ownedChars[0] : 'panda';
```

### Remplacer `<PandaWalker>` par `<CharacterSprite>`

Partout où `<PandaWalker mood={pandaMood || 'walk'} size={...} />` est utilisé :
```jsx
<CharacterSprite
  id={activeCharId}
  mood={resolvedMood}   // voir ci-dessous
  size={40}
/>
```

### Mood résolu — respecter les émotions achetées

```js
function resolveCharMood(rawMood, charId, shopOwned) {
  if (!rawMood || rawMood === 'walk') return 'walk';
  const owned = getOwnedEmotions(shopOwned, charId);
  return owned.includes(rawMood) ? rawMood : 'walk';
}

const resolvedMood = resolveCharMood(pandaMood, activeCharId, progress.shop?.owned);
```

Ainsi : si le joueur n'a pas acheté l'émotion `dance`, le perso reste en `walk` même quand l'événement "streak milestone" est déclenché.

---

## 6. Build + déploiement

```bash
cd orthographe-app
npm run build
firebase deploy --only hosting
```

Vérifier sur `https://orthographe-eabb9.web.app/` :
- Landing page v2 visible
- Boutique → onglet "Persos" présent, "En jeu" absent
- Un perso acheté → SVG walk visible dans la boutique
- Une émotion achetée → popup avec animation + description
- Quiz → personnage visible sur la barre de progression

---

## Résumé des fichiers touchés

| Fichier | Nature de la modif |
|---|---|
| `src/pages/LandingPage.jsx` | Remplacement complet par v2 + `useNavigate` |
| `src/components/CharacterSprite.jsx` | Ajout `CharStormEagle` + entrée dans CHARS |
| `src/data/characters.js` | Ajout entrée `stormEagle` |
| `src/components/Shop.jsx` | Tab "Persos" + composants `ShopCharacterCard` + popup émotion |
| `src/components/ProgressBar.jsx` | Affichage perso + mood temporaire |
| `src/components/QuizDirect.jsx` | Prop `shopOwned` + `lastAnswer` → ProgressBar |
| `src/components/QuizGuided.jsx` | Même chose que QuizDirect |
| `src/pages/ChildApp.jsx` | Passer `shopOwned` aux composants quiz |
| `src/components/Dashboard.jsx` | Remplacer PandaWalker par CharacterSprite avec mood résolu |

**Aucun changement à :** `economy.js`, `characters.js` (sauf ajout stormEagle), routeur, Firebase config.

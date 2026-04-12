# Plan de développement V3 — Corrections et polish

Ce document complète le `PLAN_DEV_V2.md` (qui reste la référence pour l'architecture et le gameplay). Il liste les bugs trouvés lors de l'audit visuel, les éléments manquants, et les améliorations à implémenter. Classé par priorité.

**Contexte de l'audit :** l'app a été testée visuellement via Chrome. Le moteur (SM-2, économie, scoring, session) est complet et conforme au plan V2. Les bugs sont principalement dans l'UI et les animations.

---

## PRIORITÉ 1 — Bugs bloquants

### 1.1 L'overlay milestone est coincé en boucle

**Symptôme :** après la première session, un overlay s'affiche avec "Streak de firstSession jours !" et une grosse flamme animée. Problèmes :
1. Le texte affiche le nom de la clé d'événement (`firstSession`) au lieu du message personnalisé ("C'est parti, Damien. La régularité fait tout.")
2. L'overlay réapparaît à chaque retour au dashboard — les `pendingEvents` ne sont jamais marqués comme vus/consommés après affichage
3. L'overlay apparaît aussi quand on revient de la boutique au dashboard

**Fix attendu :**
- Dans `App.jsx`, après l'affichage de chaque événement dans le Dashboard, vider `pendingEvents` immédiatement (pas à la prochaine session, mais dès que l'overlay est fermé)
- Dans `Dashboard.jsx`, mapper chaque type d'événement vers le bon message personnalisé (voir tableau section 8 du PLAN_DEV_V2) :
  - `firstSession` → "C'est parti, Damien. La régularité fait tout."
  - `streak_3` → "3 jours de suite — tu tiens le cap."
  - `streak_7` → "Une semaine sans faillir. C'est là que ça commence vraiment."
  - `level_up_1` → "Niveau Découverte atteint !"
  - `level_up_2` → "Mode direct déverrouillé ! 🔓"
  - `level_up_3` → "Règle maîtrisée. Cette couronne, tu l'as gagnée. 👑"
  - `level_up_4` → "Parfait, trois fois de suite. C'est gravé. 💎"
  - etc.
- S'assurer que fermer l'overlay (clic ou bouton) purge définitivement l'événement du state

### 1.2 L'overlay est trop sombre / illisible

**Symptôme :** quand l'overlay milestone s'affiche, le fond est quasi noir avec un blur excessif. Le contenu (flamme, message) est à peine visible.

**Fix attendu :**
- Réduire l'opacity du backdrop de l'overlay : passer de ~0.9 à ~0.6-0.7
- Réduire le blur : de ~20px à ~8px
- S'assurer que le contenu de l'overlay (texte, icône) a un z-index supérieur au backdrop
- Le message doit être clairement lisible en blanc sur fond semi-transparent

---

## PRIORITÉ 2 — Corrections textuelles

### 2.1 Ajouter tous les accents dans l'interface

L'app est un outil d'orthographe — des fautes dans l'interface sont inacceptables. Voici la liste exhaustive des textes à corriger dans les composants JSX :

**Dashboard.jsx :**
- "Bon apres-midi" → "Bon après-midi"
- "Ta premiere session" → "Ta première session"
- "Demarre ton streak" → "Démarre ton streak"
- "Fait aujourd'hui" → OK tel quel
- "Decouvre cette regle" → "Découvre cette règle"

**QuizGuided.jsx :**
- "Utilise le pave de decision, puis clique sur ta reponse" → "Utilise le pavé de décision, puis clique sur ta réponse"
- "Voir le resultat final" → "Voir le résultat final"

**QuizDirect.jsx :**
- Mêmes types de corrections si applicable

**Écran de fin de session (dans QuizGuided.jsx ou composant EndScreen) :**
- "Session terminee" → "Session terminée"
- "pieces gagnees" → "pièces gagnées"

**Dashboard milestones / streak :**
- "Bon debut" → "Bon début"
- "Sur la lancee" → "Sur la lancée"
- "Inarretable" → "Inarrêtable"
- "Legende" → "Légende"

**Méthode recommandée :** faire un grep global sur `src/` pour tous les mots français courants sans accent : `premiere`, `regle`, `resultat`, `terminee`, `gagnee`, `pave`, `decision`, `reponse`, `debut`, `lancee`, `decouvre`, `demarre`, `legende`, `inarretable`, `activite`, `protege`, etc.

---

## PRIORITÉ 3 — Contenu boutique manquant

### 3.1 Remplir l'onglet Cosmétique

Actuellement l'onglet Cosmétique n'affiche que les 5 thèmes. Il manque 18 items. Ajouter dans le catalogue `economy.js` (s'ils n'y sont pas déjà) ET dans le rendu de `Shop.jsx` :

**Flammes custom (65 coins chacune) :**

| ID | Nom | Emoji | Description |
|----|-----|-------|-------------|
| `flame-lightning` | Éclair | ⚡ | Électrise ton streak |
| `flame-wave` | Vague | 🌊 | Surfe sur ta série |
| `flame-target` | Cible | 🎯 | Précision maximale |
| `flame-skull` | Crâne | 💀 | Mode hardcore |
| `flame-dragon` | Dragon | 🐉 | Puissance mythique |

**Titres custom (120 coins chacun) :**

| ID | Nom | Remplace le titre streak par |
|----|-----|------------------------------|
| `title-le-boss` | Le Boss | "Le Boss" |
| `title-machine` | Machine | "Machine" |
| `title-sniper` | Sniper | "Sniper" |
| `title-intouchable` | Intouchable | "Intouchable" |
| `title-cerebral` | Cérébral | "Cérébral" |

**Animations de victoire (95 coins chacune) :**

| ID | Nom | Description |
|----|-----|-------------|
| `anim-neon` | Glow Néon | Halo néon clignotant autour du trophée |
| `anim-glitch` | Effet Glitch | Distorsion numérique brève |
| `anim-shockwave` | Onde de choc | Cercle qui s'expand depuis le centre |
| `anim-confetti` | Confettis sobres | Quelques confettis dorés qui tombent |

**Fonds de dashboard (120 coins chacun) :**

| ID | Nom | Description |
|----|-----|-------------|
| `bg-geometric` | Géométrique | Motif de lignes fines en arrière-plan |
| `bg-gradient` | Gradient doux | Dégradé subtil qui change lentement |
| `bg-dots` | Points | Grille de points espacés |
| `bg-waves` | Vagues | Lignes ondulées au bas de l'écran |

**Rendu dans Shop.jsx :**
- Organiser l'onglet Cosmétique avec des sous-sections : 🎨 Thèmes, 🔥 Flammes, 🏷️ Titres, ✨ Animations, 🖼️ Fonds
- Chaque item a une icône représentative à gauche (emoji ou petit SVG)
- Les items achetés affichent un bouton "Équiper" au lieu de "Acheter", et l'item actuellement équipé a un badge "Actif"

### 3.2 Brancher les thèmes sur les CSS variables

Quand un thème est acheté et équipé, il doit changer la palette de l'app. Implémenter :

```js
// Thèmes disponibles
const THEMES = {
  default: { primary: '#a78bfa', accent: '#c4b5fd', bg1: '#1e1e2e', bg2: '#2d2b55' },
  'theme-dark-blue': { primary: '#60a5fa', accent: '#93c5fd', bg1: '#0f172a', bg2: '#1e293b' },
  'theme-forest': { primary: '#4ade80', accent: '#86efac', bg1: '#14261c', bg2: '#1a3a2a' },
  'theme-amber': { primary: '#fbbf24', accent: '#fde68a', bg1: '#27200f', bg2: '#3d3112' },
  'theme-aurora': { primary: '#34d399', accent: '#a78bfa', bg1: '#0f1729', bg2: '#162033' },
  'theme-midnight': { primary: '#c084fc', accent: '#e879f9', bg1: '#1a0a2e', bg2: '#2d1452' },
};
```

Dans `App.jsx`, au chargement et à chaque changement de thème équipé, appliquer les CSS variables sur `:root` :
```js
document.documentElement.style.setProperty('--color-primary', theme.primary);
document.documentElement.style.setProperty('--color-accent', theme.accent);
// etc.
```

Puis remplacer toutes les couleurs hardcodées dans les composants par `var(--color-primary)`, `var(--color-accent)`, etc.

---

## PRIORITÉ 4 — Écran de fin de session enrichi

### 4.1 Ajouter la progression vers le prochain niveau

Après le score et les coins, afficher :

```
Prochain objectif : Couronne 👑
[████████░░] 2/3 sessions directes ≥ 80%
Plus qu'une session !
```

- La barre de progression doit s'animer (de l'état précédent vers le nouvel état, 0.8s ease-out)
- Si le prochain niveau est atteint dans cette session, ne pas afficher la barre mais l'animation de level-up à la place
- Message d'encouragement contextuel :
  - 1/3 → "C'est bien parti."
  - 2/3 → "Plus qu'une session !"
  - 3/3 → (level up, pas de message ici)

### 4.2 Afficher le prochain palier de streak

Si le streak n'a pas changé de palier, afficher sous le streak :
```
Encore 3 jours pour "En feu" 🔥🔥🔥
```

---

## PRIORITÉ 5 — Animations du diamant (qualité Duolingo)

C'est le plus gros chantier. Le `DiamondStatus.jsx` existe mais les transitions ne sont pas animées. Voici l'ordre d'implémentation :

### 5.1 Transitions CSS entre états

Ajouter des CSS transitions sur toutes les propriétés visuelles du diamant :
```css
.diamond-body { transition: fill 1.2s ease-in-out, opacity 1.2s ease-in-out; }
.diamond-halo { transition: opacity 0.5s ease, transform 0.5s ease; }
.diamond-particle { transition: opacity 0.3s ease; }
.diamond-crack { transition: stroke-dashoffset 0.8s ease-in-out; }
```

Ça suffit pour que les changements d'état (React re-render avec nouveau `diamondHealth`) soient fluides au lieu de brutaux.

### 5.2 Animations CSS @keyframes manquantes

Ajouter dans `index.css` (ou un fichier `animations.css`) :

```css
@keyframes diamond-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes diamond-tremble {
  0%, 100% { transform: translate(0, 0); }
  25% { transform: translate(-1px, 1px); }
  50% { transform: translate(1px, -1px); }
  75% { transform: translate(-1px, -1px); }
}

@keyframes particle-orbit {
  0% { transform: rotate(0deg) translateX(20px) rotate(0deg); }
  100% { transform: rotate(360deg) translateX(20px) rotate(-360deg); }
}

@keyframes particle-fade {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

@keyframes halo-pulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 0.4; }
}

@keyframes crack-draw {
  from { stroke-dashoffset: 100; }
  to { stroke-dashoffset: 0; }
}

@keyframes bounce-in {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes float-in {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes diamond-break {
  0% { transform: translate(0, 0) rotate(0deg); opacity: 1; }
  100% { transform: translate(var(--dx), var(--dy)) rotate(var(--rot)); opacity: 0; }
}

@keyframes subtle-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

@keyframes glow-gold {
  0%, 100% { box-shadow: 0 0 10px rgba(251, 191, 36, 0.3); }
  50% { box-shadow: 0 0 20px rgba(251, 191, 36, 0.6); }
}

@keyframes flame-extinguish {
  0% { transform: scale(1); opacity: 1; }
  50% { transform: scale(0.5) translateY(10px); opacity: 0.5; }
  100% { transform: scale(0) translateY(20px); opacity: 0; }
}

@keyframes streak-countdown {
  from { opacity: 1; }
  to { opacity: 0.3; }
}
```

### 5.3 Animation de brisure du diamant

C'est la plus complexe. Approche recommandée :

1. Quand `diamondHealth` atteint 0.0, le composant passe en mode "brisure"
2. Le SVG du diamant est dupliqué en 5-6 `<clipPath>` fragments
3. Chaque fragment a ses propres `--dx`, `--dy`, `--rot` CSS custom properties
4. L'animation `diamond-break` s'applique avec `animation-delay` staggeré (0s, 0.1s, 0.2s...)
5. Après 1.5s, les fragments disparaissent et la couronne 👑 monte avec `bounce-in`

Fragments suggérés (polygones relatifs au centre du diamant) :
```
Fragment 1: haut-gauche (triangle)
Fragment 2: haut-droite (triangle)
Fragment 3: milieu-gauche (trapèze)
Fragment 4: milieu-droite (trapèze)
Fragment 5: bas (triangle inversé)
```

### 5.4 Animation obtention diamant (couronne → diamant)

Quand le niveau passe de 3 à 4 :
1. La couronne pulse (scale 1 → 1.2, 0.5s)
2. Flash blanc (opacity 0 → 0.8 → 0, 0.3s)
3. Morph de la forme : utiliser CSS `clip-path` avec une transition de la forme couronne vers la forme diamant, ou simplement un crossfade (opacity de la couronne 1→0 pendant que diamant 0→1, 0.8s)
4. Burst de particules : 12 éléments `<circle>` qui partent du centre en radial, fade out en 0.6s
5. Le halo apparaît (scale 0 → 1.2 → 1.0)

---

## PRIORITÉ 6 — ReturnScreen animations

### 6.1 Flamme qui s'éteint

Quand le streak est perdu, animer la flamme :
- Appliquer `animation: flame-extinguish 0.8s forwards` sur l'icône flamme
- Après 0.8s, afficher un petit nuage de fumée gris (3 cercles gris qui montent et se dissipent)
- Le compteur de jours fait un countdown rapide (ex. 14 → 0 en 0.5s) avec `animation: streak-countdown`

### 6.2 Séquence diamants

Pour chaque diamant affecté, avec 1s de délai entre chaque :
- Afficher le diamant dans son état **précédent** (brillant)
- Attendre 0.5s
- Transitionner vers l'état actuel (les CSS transitions de 5.1 font le travail)
- Afficher le delta : "💎 1.0 → 0.53" avec `animation: float-in 0.5s`

---

## PRIORITÉ 7 — Coffre hebdomadaire visuel

### 7.1 Design du coffre

Le coffre est un SVG simple : un rectangle avec un couvercle articulé et un cadenas doré.

**État fermé :** le coffre pulse doucement (`animation: subtle-float 3s infinite`) sur le dashboard, le lundi si le streak est actif.

**Ouverture (au tap) :**
1. Le cadenas tombe (translateY +30px, fade out, 0.3s)
2. Le couvercle s'ouvre (rotateX(-110deg) sur le pivot arrière, 0.4s avec rebond)
3. Des particules dorées sortent (burst vers le haut, 0.5s)
4. Le montant de coins apparaît au-dessus (+XX 🪙, scale 0 → 1.2 → 1, 0.3s)
5. Après 2s, le coffre disparaît et les coins sont ajoutés au compteur du header

---

## PRIORITÉ 8 — Améliorations UX

### 8.1 Indicateur "prochain palier streak" sur le dashboard

Dans la zone streak du header ou dans le bandeau streak, ajouter en petit :
```
Plus que 3 jours pour "En feu" 🔥🔥🔥
```

Calculer : `prochainPalier.joursMin - streak.current`

### 8.2 Dashboard — n'afficher qu'une seule règle "en cours" visible

Quand toutes les 7 règles sont "Nouvelle" (lock), l'écran est encombré de 7 cartes identiques. Suggestion : n'afficher les règles "Nouvelle" que sous forme de mini-cartes compactes (titre seul, en une ligne), et n'afficher la carte détaillée que pour les règles en cours et les révisions SM-2 dues.

### 8.3 Ajouter une confirmation d'achat en boutique

Avant de déduire les coins, afficher un petit popup de confirmation :
```
Acheter "Dark Blue" pour 40 🪙 ?
[Annuler] [Confirmer]
```

Évite les achats par erreur. Surtout sur mobile.

---

## PRIORITÉ 9 — Tests

### 9.1 Tester le mode debug end-to-end

Avec le mode debug (1 question, seuils à 1), vérifier que :
- [ ] Niveau 0 → 1 : 1 session guidée (any score) → étoile bronze
- [ ] Niveau 1 → 2 : 1 session guidée ≥ 80% → étoile argent, mode direct débloqué, +30 coins
- [ ] Niveau 2 → 3 : 1 session directe ≥ 80% → couronne, +100 coins
- [ ] Niveau 3 → 4 : 1 session directe 100% → diamant, +200 coins, SM-2 activé
- [ ] Niveau 5 : session de révision SM-2 ≥ 90% → intervalle allongé, diamant reste brillant
- [ ] Niveau 5 : session de révision SM-2 80-89% → intervalle inchangé, message "le diamant exige 90%"
- [ ] Niveau 5 : session de révision SM-2 < 80% → intervalle reset, diamant ternit
- [ ] Streak : s'incrémente après chaque session (même jour = pas double)
- [ ] Milestones : coins attribués une seule fois (pas en boucle)
- [ ] Boutique : achat déduit les coins, item apparaît dans "possédé"
- [ ] Boutique : thème équipé change la palette de l'app

### 9.2 Tester sur mobile

Ouvrir l'app sur un iPhone (ou simulateur Chrome DevTools → iPhone 12/13 viewport). Vérifier :
- [ ] Le dashboard scrolle proprement
- [ ] Les boutons du quiz sont assez grands pour un pouce
- [ ] La boutique est utilisable
- [ ] Les cartes de règle ne débordent pas
- [ ] Les overlays sont bien centrés

---

## Ordre d'exécution recommandé

```
1. Fix overlay milestone (bug bloquant)
2. Fix overlay opacity/blur
3. Corriger tous les accents
4. Remplir boutique cosmétique (flammes/titres/anims/fonds)
5. Brancher les thèmes CSS variables
6. Écran de fin de session enrichi
7. @keyframes manquantes dans CSS
8. Transitions CSS diamant
9. Animation de brisure du diamant
10. Animation obtention diamant
11. ReturnScreen animations
12. Coffre hebdomadaire visuel
13. Améliorations UX (streak indicator, confirmation achat)
14. Tests end-to-end mode debug
15. Tests mobile
```

Phases 1-6 rendent l'app utilisable et agréable.
Phases 7-12 ajoutent le polish Duolingo.
Phases 13-15 finalisent.

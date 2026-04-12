# Plan de développement V4 — Refonte UX Dashboard + Quiz

Ce document complète les plans V2 (architecture/gameplay) et V3 (bugs/polish). Il couvre deux chantiers :
- **A. Refonte du Dashboard** — restructuration de l'information, suppression des redondances
- **B. Corrections UX du Quiz guidé** — séparation visuelle aide/réponses, couleurs, opacités

L'audit visuel détaillé est dans `AUDIT_UX_DASHBOARD.html`.

---

## A. REFONTE DU DASHBOARD

### A1. Fusionner le streak en un seul endroit

**Problème :** « Bon début » apparaît deux fois — dans le header (flamme + "1 jour / Bon début") ET dans une carte streak séparée en dessous. Redondance pure.

**Action :**
- Supprimer entièrement le bloc `{/* Streak card */}` du Dashboard (lignes ~433-471 dans Dashboard.jsx)
- Intégrer l'information « Fait aujourd'hui » comme un petit badge vert ✓ dans le header, à côté du compteur de jours :
  ```
  🔥 1 jour  ✓        🛡 2  🪙 90  🛒
     Bon début
  ```
- Le badge ✓ n'apparaît que si `todayDone === true`
- Le titre du streak ("Bon début", "En feu", etc.) reste uniquement sous le chiffre dans le header
- Si le streak est à 0 et que le joueur n'a jamais joué, afficher un CTA inline à la place de la carte : intégrer le message dans le greeting

### A2. Bouton Boutique explicite

**Problème :** Le badge 🪙 90 est un `<button>` déguisé en compteur. Rien n'indique que c'est cliquable. Le mot « Boutique » n'apparaît nulle part sur le dashboard.

**Action :**
- Ajouter un petit bouton icône à droite du compteur de coins avec un emoji panier 🛒 ou un label « Shop »
- Alternative : transformer le badge coins en un bouton explicite avec une flèche/chevron → qui indique l'interactivité
- Ajouter un léger hover state différencié (scale + glow doré) pour le rendre clairement interactif
- Plus tard (V5+) : envisager une barre de navigation fixe en bas (Dashboard / Boutique)

### A3. Labelliser ou masquer les boucliers

**Problème :** Deux icônes de bouclier bleu en haut à droite sans aucune explication. Un lycéen ne peut pas deviner que ce sont des "streak freeze".

**Action :**
- Option A (recommandée) : masquer les boucliers tant que `streak < 3` — ils n'ont aucun sens pour un débutant
- Option B : ajouter un tooltip au hover/tap qui dit « Boucliers : protègent ton streak (X/2) »
- Dans tous les cas, ajouter un petit chiffre à côté : `🛡 2` au lieu de deux icônes séparées

### A4. Masquer les badges de niveau pour les débutants

**Problème :** La barre « ⭐ 1 En cours 🔒 6 Nouvelle » n'a aucune valeur ajoutée quand le joueur débute — il voit déjà ces infos dans la liste des règles.

**Action :**
- Condition d'affichage : ne rendre le bloc `{/* Global level summary */}` que si `summary.couronne > 0 || summary.diamant > 0 || summary.diamondVivant > 0`
- Quand il apparaît, il montre la collection de trophées (couronnes, diamants) — là ça a du sens

### A5. Réduire les couches au-dessus des règles

**Problème :** 6 blocs visuels avant le contenu réel (les règles). Le joueur doit scroller pour voir plus d'une règle.

**Action :**
- Après les fusions (A1, A4), la structure devient :
  1. Header compact (sticky) : flamme + streak + ✓ + boucliers + coins + boutique
  2. Greeting + motivation (conditionnel : disparaît si `todayDone`)
  3. Section « Continue ta progression » (règles en cours)
  4. Section « À découvrir » (règles nouvelles)
- Le greeting (Bon après-midi, Damien) et le message de motivation ne s'affichent que si la session du jour n'a PAS encore été faite. Après la session, on va direct aux règles.

### A6. Séparer les règles en sections labelisées

**Problème :** Les cartes pleines (règles en cours) et les mini-cartes (nouvelles) sont mélangées sous un même label "AUJOURD'HUI" sans transition.

**Action :**
- Remplacer le label unique "AUJOURD'HUI" par deux sections :
  - **« Continue ta progression »** — pour les règles de niveau ≥ 1 (cartes complètes)
  - **« À découvrir »** — pour les règles de niveau 0 (mini-cartes)
- Ajouter un espacement plus grand entre les deux sections (2rem au lieu de 0.9rem)
- Mettre en avant UNE seule règle comme « Suggérée → » dans la section À découvrir (bordure accent, texte "Prochaine règle recommandée")
- Si des révisions SM-2 sont dues, ajouter une 3e section en haut : **« Révisions du jour »**

### A7. Header sticky

**Action :**
- Rendre le header `position: sticky; top: 0; z-index: 100`
- Ajouter un fond flouté : `backdropFilter: 'blur(12px)'` + `background: 'rgba(30,30,46,0.9)'`
- Ajouter un border-bottom subtil `1px solid rgba(255,255,255,0.06)` pour marquer la séparation

### A8. Corriger la logique du message de motivation

**Problème :** Le message dit « Ta première session t'attend » alors que la carte streak dit « Fait aujourd'hui ». Contradiction.

**Action :**
- Dans `getMotivation()`, vérifier `progress.streak?.lastActiveDate === getToday()` et ne plus proposer « ta première session » si c'est le cas
- Si `todayDone` : ne plus afficher de message de motivation du tout (ou un court message de félicitation genre « Bien joué pour aujourd'hui. »)
- Le flag `progress.firstQuizDone` doit être mis à `true` APRÈS la première session, pas avant

### A9. Ajuster les espacements

**Action :**
- Intra-groupe : `gap: 0.5rem` entre les cartes de règles d'une même section
- Inter-groupe : `margin-top: 1.5rem` entre les sections
- Le header utilise un padding compact de `0.8rem 0`
- Le greeting utilise un padding réduit de `0.5rem 1rem`

---

## B. CORRECTIONS UX DU QUIZ GUIDÉ

### B1. Séparer visuellement le pavé de décision et les boutons de réponse

**Problème :** Le pavé d'aide (axes de décision) et les boutons de réponse (a / as / à) sont visuellement dans le même flux. Même gap, même style de fond, pas de séparation. L'utilisateur ne distingue pas « l'outil d'aide » de « l'endroit où je réponds ».

**Action :**
- Ajouter un séparateur visuel entre le DecisionPanel et les boutons de réponse :
  ```jsx
  {/* Séparation visuelle */}
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.8rem',
    margin: '0.5rem 0 1rem',
  }}>
    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
    <span style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      Ta réponse
    </span>
    <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.08)' }} />
  </div>
  ```
- Optionnel : donner au DecisionPanel un fond légèrement différent (background card avec bordure dashed) pour le distinguer comme un "outil"

### B2. Utiliser un code couleur différent pour les options restantes

**Problème :** Quand on clique sur une règle d'aide (ex: "Oui, c'est un verbe"), la sélection dans le pavé est en violet (`#a78bfa`). Les options de réponse restantes sont AUSSI en violet (`#a78bfa` bordure, `rgba(167,139,250,0.15)` fond). Même couleur = même niveau hiérarchique visuel = confusion.

**Action :**
- Le pavé de décision garde le violet (`#a78bfa`) pour ses sélections — c'est l'outil d'aide
- Les boutons de réponse restants (non éliminés) passent à une couleur **différente** quand l'aide les met en avant :
  - Bordure : `#fbbf24` (doré/amber) ou `#34d399` (vert émeraude)
  - Fond : `rgba(251,191,36,0.12)` ou `rgba(52,211,153,0.1)`
  - Texte : `#fde68a` ou `#6ee7b7`
- Logique : si `eliminated.size > 0 && !isEliminated && !showResult` → utiliser la palette dorée/verte au lieu de violette
- Le message « Clique pour valider » (quand une seule option reste) garde cette même couleur dorée pour rester cohérent

Code modifié dans QuizGuided.jsx, lignes 150-154 :
```jsx
if (isHighlighted && !showResult) {
  bg = 'rgba(251,191,36,0.12)';        // doré au lieu de violet
  borderColor = '#fbbf24';              // doré au lieu de #a78bfa
  textColor = '#fde68a';                // texte doré clair
}
```

### B3. Augmenter la visibilité des options éliminées

**Problème :** Les options éliminées passent à `opacity: 0.2` — c'est trop bas. Elles deviennent quasi invisibles, ce qui perd le contexte de la règle. Le joueur ne voit plus les alternatives qu'il a éliminées, ce qui réduit la valeur pédagogique.

**Action :**
- Passer de `opacity: 0.2` à `opacity: 0.4` — encore clairement "éteint" mais lisible
- Ajouter un style barré sur le texte : `textDecoration: 'line-through'`
- Optionnel : ajouter une petite icône ✕ ou un indicateur "éliminé" pour que ce soit explicite
- Le fond des options éliminées reste neutre (pas de couleur) pour contraster avec les options dorées restantes

Code modifié dans QuizGuided.jsx, ligne 149 :
```jsx
if (isEliminated) {
  opacity = 0.4;       // au lieu de 0.2
  textColor = '#6b7280';
  // + ajouter textDecoration: 'line-through' dans le style du button
}
```

### B4. Meilleure lisibilité des labels d'axe

**Problème mineur :** Les labels "1. EST-CE UN VERBE AVOIR ?" et "2. QUEL EST LE SUJET ?" sont en tout petits caps gris (`0.72rem`, `#9ca3af`). Ils se perdent.

**Action :**
- Augmenter légèrement la taille : `0.78rem`
- Ajouter un numéro encerclé au lieu du chiffre brut : ① ②
- Ou : mettre le numéro en couleur accent `#c4b5fd` pour casser la monotonie grise

### B5. Label du pavé de décision

**Problème :** Rien n'indique visuellement que la zone supérieure est un « outil d'aide ». L'instruction « Utilise le pavé de décision, puis clique sur ta réponse » est en petit texte gris au-dessus et pas assez explicite.

**Action :**
- Remplacer ou compléter l'instruction par un label au-dessus du DecisionPanel :
  ```
  🧠 AIDE — PAVÉ DE DÉCISION
  ```
- Style : même format que les labels de section (caps, petite taille, couleur accent)
- Cela crée une hiérarchie claire : AIDE → (axes) → TA RÉPONSE → (boutons)

---

## Ordre d'exécution recommandé

```
PHASE 1 — Quiz (rapide, impact immédiat)
  1. B2 — Couleur dorée pour les options restantes (au lieu de violet)
  2. B3 — Opacity 0.4 + line-through pour les éliminées
  3. B1 — Séparateur "Ta réponse" entre aide et boutons
  4. B5 — Label "Aide — Pavé de décision"
  5. B4 — Labels d'axe plus lisibles

PHASE 2 — Dashboard structure
  6. A1 — Fusionner le streak (supprimer carte, badge ✓ dans header)
  7. A2 — Bouton Boutique explicite
  8. A3 — Masquer/labelliser boucliers
  9. A4 — Masquer badges de niveau pour débutants
  10. A8 — Corriger logique message de motivation

PHASE 3 — Dashboard polish
  11. A5 — Réduire couches (greeting conditionnel)
  12. A6 — Séparer règles en sections labellisées
  13. A7 — Header sticky
  14. A9 — Ajuster espacements
```

Le quiz (phase 1) est prioritaire car c'est le cœur de l'expérience — c'est là que Damien passe 90% de son temps. Le dashboard (phases 2-3) est ce qu'il voit 10 secondes avant chaque session.

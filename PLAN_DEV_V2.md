# Plan de développement V2 — App d'entraînement orthographe

## Contexte

Application locale d'entraînement aux règles d'orthographe françaises.
Stack : **Vite + React**. Pas de serveur, pas de backend. Tout tourne en local (`npm run dev`).
La progression est persistée dans un **fichier JSON local** (voir section Persistance).

Ce document remplace le `PLAN_DEV.md` initial. Il intègre :
- La refonte du système SM-2 au niveau des **règles** (et non des questions)
- Un dashboard repensé qui "raconte une histoire"
- Une **boutique** complète avec économie de coins équilibrée
- Un système de récompenses revu (pas de bonus streak quotidien, milestones only)

---

## Architecture des dossiers

```
orthographe-app/
├── public/
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── components/
│   │   ├── QuizGuided.jsx       # quiz avec pavé de décision
│   │   ├── QuizDirect.jsx       # quiz direct (boutons seuls)
│   │   ├── RuleCard.jsx         # carte de règle dans le dashboard
│   │   ├── Dashboard.jsx        # écran d'accueil / progression
│   │   ├── Shop.jsx             # boutique de coins
│   │   ├── Streak.jsx           # composant streak + flamme
│   │   ├── ProgressBar.jsx
│   │   ├── LevelPath.jsx        # parcours visuel 5 niveaux d'une règle
│   │   ├── DiamondStatus.jsx    # diamant SVG animé multi-couches
│   │   └── ReturnScreen.jsx     # écran de retour après inactivité
│   ├── engine/
│   │   ├── sm2.js               # algorithme SM-2 appliqué aux RÈGLES
│   │   ├── session.js           # logique de session (sélection questions)
│   │   ├── scoring.js           # calcul coins, milestones, déblocages
│   │   └── economy.js           # gestion boutique, achats, inventaire
│   ├── store/
│   │   └── persistence.js       # lecture/écriture fichier JSON local
│   └── content/
│       └── rules/               # ← dossier ingéré automatiquement
│           ├── ces-ses.json
│           ├── er-e-ez-ais-ait.json
│           └── (autres règles...)
├── user-data/
│   └── progress.json            # fichier de progression utilisateur (gitignore)
└── PLAN_DEV_V2.md               # ce fichier
```

---

## 1. Base de données de contenu

### Format d'un fichier de règle (`src/content/rules/*.json`)

Inchangé par rapport à V1. Chaque règle est un fichier JSON autonome :

```json
{
  "id": "ces-ses",
  "title": "ces · ses · s'est · c'est",
  "shortTitle": "ces / ses",
  "description": "Distinguer les homophones ces, ses, s'est et c'est",
  "choices": [...],
  "decisionAxes": [...],
  "memoCard": {...},
  "questions": [...]
}
```

Voir la V1 pour le détail du format. L'ingestion automatique via `import.meta.glob` reste identique.

**Ajouter une nouvelle règle = déposer un fichier `.json` dans `src/content/rules/`. L'app l'ingère au prochain `npm run dev` sans toucher au code.**

---

## 2. Parcours d'une règle — 5 niveaux

Chaque règle suit une progression en 5 niveaux. C'est le cœur du gameplay. Le joueur voit ce parcours visuellement sur sa carte de règle (composant `LevelPath`).

### Niveau 1 — Découverte (⭐ bronze)

**Condition :** compléter 1 session guidée.
Damien découvre la règle via le pavé de décision. Le mode guidé est disponible dès le départ. Score minimum : aucun — il suffit de terminer la session.

### Niveau 2 — Entraînement (⭐ argent)

**Condition :** compléter 3 sessions guidées avec un score ≥ 80%.
Le mode guidé est maintenant maîtrisé. Damien a intégré le raisonnement par élimination.
**Récompense :** déblocage du mode direct + bonus 30 coins.

### Niveau 3 — Couronne (👑)

**Condition :** compléter 3 sessions directes avec un score ≥ 80%.
Damien prouve qu'il sait répondre sans l'aide du pavé de décision.
**Récompense :** couronne affichée sur la carte + bonus 100 coins.

### Niveau 4 — Diamant (💎)

**Condition :** 3 sessions directes consécutives à 100%.
Maîtrise parfaite confirmée. C'est un accomplissement rare et difficile.
**Récompense :** diamant affiché sur la carte + bonus 200 coins.
**Déclencheur :** le diamant active le système SM-2 au niveau de la règle (voir section 3).

### Niveau 5 — Diamant vivant (💎✨)

**Condition :** maintenir le diamant en réussissant les sessions de révision SM-2.
Le diamant n'est pas acquis pour toujours. Il "brille" tant que la révision SM-2 est à jour. S'il ternit, Damien doit revalider (voir section 3 pour le détail).

### Affichage du parcours

Le composant `LevelPath` affiche les 5 niveaux comme un chemin horizontal ou vertical. Le niveau actuel est mis en surbrillance. Les niveaux futurs sont grisés avec leur condition affichée. Une barre de progression entre chaque niveau montre l'avancement (ex. "2/3 sessions guidées ≥ 80%").

---

## 3. Moteur SM-2 — appliqué aux RÈGLES, pas aux questions

### Principe fondamental

SM-2 ne tourne **pas** au niveau des questions individuelles. Les questions sont des véhicules pour tester la règle — Damien n'a pas besoin de mémoriser "Il s'est trompé en faisant ses calculs", il doit maîtriser la **règle** ces/ses/c'est/s'est.

L'algorithme SM-2 pilote la **fréquence de révision de chaque règle**. À chaque révision, le moteur pioche 10 questions aléatoires (variées, pas toujours les mêmes) pour tester si Damien maîtrise toujours la règle.

### Cycle de vie SM-2 d'une règle

**Phase 1 — Apprentissage (niveaux 1 à 4)**
SM-2 n'intervient pas. La règle est en drill intensif. Le joueur la travaille activement chaque jour s'il le souhaite. La sélection des questions en session est aléatoire parmi toutes les questions de la règle, en évitant de répéter les questions vues récemment (voir section 4).

**Phase 2 — Diamant obtenu → SM-2 s'active**
Quand le diamant est obtenu (3×100% consécutifs en direct), la règle reçoit un état SM-2 :

```json
{
  "ruleId": "ces-ses",
  "sm2": {
    "easiness": 2.5,
    "interval": 1,
    "repetitions": 0,
    "nextReviewDate": "2026-04-12",
    "lastReviewScore": null,
    "diamondHealth": 1.0
  }
}
```

**Phase 3 — Répétition espacée**
La règle revient pour révision quand `nextReviewDate ≤ today`. Le dashboard l'affiche dans la zone "Aujourd'hui" avec un indicateur de révision.

Session de révision = 10 questions en mode direct, piochées aléatoirement dans la banque de la règle.

Après la session :
- **Score ≥ 90% → réussite.** SM-2 allonge l'intervalle (1j → 6j → 15j → 35j → …). Le diamant reste brillant. Le seuil est plus exigeant qu'aux niveaux précédents (80%) car le diamant vivant représente la vraie maîtrise long terme.
- **Score 80-89% → réussite fragile.** L'intervalle n'augmente pas mais ne recule pas non plus. Le diamant reste à son état actuel. Message : *"Pas mal, mais le diamant exige 90%."*
- **Score < 80% → échec.** L'intervalle se raccourcit (repart à 1 jour). Le diamant ternit visuellement. `diamondHealth` diminue.

### Le diamant qui brille et qui ternit

C'est le cœur émotionnel du jeu. Le diamant est un objet vivant, pas un badge statique. Son apparence reflète en temps réel l'état de la mémoire de Damien.

Le `diamondHealth` est un flottant entre 0.0 et 1.0 qui contrôle l'apparence visuelle du diamant :

| diamondHealth | Apparence | Signification |
|---------------|-----------|---------------|
| 1.0 | Brillant — éclat vif, particules scintillantes, halo lumineux | À jour, maîtrisé |
| 0.8–0.99 | Léger voile — les particules ralentissent, le halo faiblit | Révision qui approche |
| 0.5–0.79 | Terne — couleur désaturée, fissures lumineuses visibles, pas de particules | En retard |
| 0.2–0.49 | Fissuré — gris-bleu, fissures sombres, micro-tremblement | Sérieusement en retard |
| 0.01–0.19 | Critique — presque gris, pulsation lente rouge, prêt à se briser | Dernière chance |
| 0.0 | Brisé → rétrogradé à couronne | Perdu |

**Calcul du `diamondHealth` — decay rapide :**

```
Si nextReviewDate est dans le futur :
  diamondHealth = 1.0

Si nextReviewDate est dépassée :
  joursDeRetard = today - nextReviewDate
  gracePeriod = max(7, interval)  ← minimum 7 jours, plafonné à l'intervalle actuel
  diamondHealth = max(0.0, 1.0 - (joursDeRetard / gracePeriod))
```

Le decay est volontairement rapide. Le `gracePeriod` est égal à l'intervalle SM-2 (au lieu de 2× l'intervalle dans la V1), avec un minimum de 7 jours pour les tout premiers intervalles.

**Exemples concrets de decay :**

| Intervalle SM-2 | Grace period | Après 3j de retard | Après 7j | Après 14j |
|-----------------|-------------|--------------------| ---------|-----------|
| 1 jour | 7 jours | 0.57 (terne) | 0.0 (perdu) | — |
| 6 jours | 7 jours | 0.57 (terne) | 0.0 (perdu) | — |
| 15 jours | 15 jours | 0.80 (voile) | 0.53 (terne) | 0.07 (critique) |
| 35 jours | 35 jours | 0.91 (ok) | 0.80 (voile) | 0.60 (terne) |

Pour les premiers intervalles (1-6 jours), le diamant tombe à zéro en seulement une semaine de retard. C'est voulu : les premières révisions sont critiques, la mémoire est encore fragile. Pour les intervalles longs (35j+), la décroissance est plus lente car la mémoire est mieux ancrée.

**Rétrogradation (diamondHealth = 0.0) :** le diamant se brise. Animation de brisure (voir section Animations). La règle repasse au niveau 3 (couronne). Pour retrouver le diamant, Damien doit refaire 3×100% consécutifs en direct. C'est volontairement exigeant — ça motive à ne pas laisser traîner.

**Revalidation réussie (score ≥ 90%) :** le `diamondHealth` remonte à 1.0 immédiatement. Le diamant se "répare" avec une animation de restauration. Pas de dégradation progressive au retour — la réussite est récompensée franchement.

### Écran de retour après inactivité

Quand Damien ouvre l'app après une absence (≥ 2 jours sans session), un écran de "Bilan d'absence" s'affiche AVANT le dashboard. Cet écran montre honnêtement ce qui s'est passé pendant son absence :

**Contenu de l'écran de retour :**

1. **Streak** : si perdu, afficher clairement *"Ton streak de X jours est terminé."* avec l'ancienne flamme qui s'éteint (animation). Si un bouclier a été consommé, le montrer : *"Bouclier utilisé — streak sauvé."*

2. **Diamants affectés** : pour chaque diamant dont le `diamondHealth` a baissé pendant l'absence, afficher la règle avec le diamant dans son état actuel (terni/fissuré) et la perte de santé : *"ces/ses : 💎 1.0 → 0.53"*. Si un diamant a été perdu (→ 0.0), afficher en rouge : *"ces/ses : 💎 brisé → rétrogradé en 👑"*.

3. **Appel à l'action** : un récapitulatif positif en bas — *"X règles ont besoin de toi. Commence par la plus urgente."* avec un bouton direct vers la première révision due.

**Ton de l'écran** : factuel, pas culpabilisant. On montre les conséquences clairement pour que Damien comprenne l'impact de l'inactivité, mais on finit toujours par une invitation à reprendre. Jamais de reproche.

**Cas où l'écran n'apparaît pas** : si aucun streak n'a été perdu ET aucun diamant n'a terni (ex. absence de 2 jours mais tous les intervalles SM-2 étaient longs), pas besoin de l'écran — on va directement au dashboard.

### Intervalles SM-2 typiques

Pour une règle toujours réussie (qualité = 4 sur 5) :

| Révision # | Intervalle |
|-----------|-----------|
| 1 | 1 jour |
| 2 | 6 jours |
| 3 | 15 jours |
| 4 | 35 jours |
| 5 | 80 jours |
| 6+ | ~5-6 mois |

Au bout de 5-6 révisions réussies, la règle ne revient qu'une ou deux fois par an. C'est le signe que c'est vraiment ancré dans la mémoire long terme.

---

## 4. Sélection des questions en session

Fichier : `src/engine/session.js`

Une session = 10 questions maximum, piochées dans la banque de la règle active.

### En phase d'apprentissage (niveaux 1-4)

Les questions sont sélectionnées aléatoirement avec un biais vers la variété :
1. Éviter les questions vues dans les 2 dernières sessions (sauf si la banque est trop petite)
2. Mélanger les niveaux de difficulté (propriété `difficulty` du JSON)
3. Randomiser l'ordre

Pas de SM-2 individuel par question. Le but est de tester la règle sous des angles variés, pas de mémoriser des phrases spécifiques.

### En phase de révision SM-2 (niveau 5)

Même logique de sélection aléatoire. Le moteur pioche 10 questions parmi les 100 disponibles, en maximisant la variété. Le score de la session détermine si la révision SM-2 de la règle est réussie ou non.

### Tracking léger par question (optionnel)

On peut garder un compteur simple par question (`timesShown`, `timesCorrect`) pour alimenter les stats de la boutique (item "Radiographie"), mais ce compteur n'influence PAS la sélection SM-2. C'est purement informatif.

---

## 5. Deux modes de quiz

### Mode guidé (`QuizGuided`)

Disponible dès le premier accès à une règle. Le joueur utilise le pavé de décision (axes d'élimination) avant de répondre. Les choix incompatibles se grisent progressivement.

Pertinent pour les niveaux 1-2 (découverte et entraînement).

### Mode direct (`QuizDirect`)

**Verrouillé** jusqu'au niveau 2 (3 sessions guidées ≥ 80%).
Affiche uniquement les boutons de réponse, sans aide.

Pertinent pour les niveaux 3-5 (couronne, diamant, révisions SM-2).

### Pendant le quiz : zéro distraction

L'écran de quiz est épuré. Aucune animation, aucun badge, aucun compteur de coins visible pendant la session. Seuls éléments affichés :
- Barre de progression de session (question 3/10)
- Score courant
- La phrase à compléter
- Les boutons de réponse
- Le pavé de décision (mode guidé uniquement)

L'objectif est que Damien soit 100% concentré sur la question.

---

## 6. Économie de coins

### Sources de revenus

#### Par session (basé sur le score)

| Score | Coins gagnés |
|-------|-------------|
| 100% | 30 |
| ≥ 80% | 20 |
| ≥ 60% | 10 |
| < 60% | 5 |

#### Bonus "première session du jour" : +10 coins

Récompense le fait de se pointer, indépendamment du score. Un joueur qui galère ne doit pas se sentir pauvre.

#### Milestones (one-shot, non répétables)

| Événement | Coins |
|-----------|-------|
| Toute première session | 50 |
| Déblocage mode direct (par règle, ×7) | 30 |
| Couronne gagnée (par règle, ×7) | 100 |
| Diamant gagné (par règle, ×7) | 200 |
| Streak 7 jours | 50 |
| Streak 14 jours | 100 |
| Streak 30 jours | 150 |
| Streak 60 jours | 300 |
| Streak 100 jours | 500 |
| **Total milestones disponibles** | **3460** |

#### Coffre hebdomadaire (chaque lundi, si streak actif)

Contenu aléatoire : 10-50 coins (moyenne 25). Apparaît sur le dashboard comme un coffre à ouvrir. Condition : avoir un streak actif (≥ 1 jour).

#### PAS de bonus streak quotidien

Le streak ne rapporte pas de coins au quotidien. Il existe pour la fierté, les flammes, les titres et les boucliers — pas comme distributeur de billets. Ça évite l'anxiété type Duolingo où maintenir le streak est une question d'argent.

### Pas de revenus quotidiens liés au streak

Le flux quotidien est stable et prévisible :
- Débutant (~65% score) : **~20 coins/jour**
- Régulier (~80% score) : **~30 coins/jour**
- Expert (~90% score) : **~35 coins/jour**

Le ratio expert/débutant est de 1.75×. Personne ne se sent pauvre, personne ne croule sous les coins.

---

## 7. Boutique

Fichier : `src/engine/economy.js` + composant `src/components/Shop.jsx`

### Catalogue complet

#### Cosmétique — Thèmes et personnalisation (permanents)

| Item | Prix | Description |
|------|------|-------------|
| Thème basique | 40 | Dark blue, forest green, warm amber. Change la palette de l'app. |
| Thème premium | 160 | Palettes rares : aurora, midnight purple, sunset. |
| Flamme custom | 65 | Remplacer l'emoji flamme du streak par ⚡, 🌊, 🎯, 💀, 🐉. |
| Titre custom | 120 | Remplacer "En feu" par "Le Boss", "Machine", "Sniper", etc. |
| Animation de victoire | 95 | Choisir l'animation couronne/diamant : glow néon, glitch, onde de choc. |
| Fond de dashboard | 120 | Motifs de fond : géométrique, gradient, texture minimale. |

#### Assurance et confort (consommables)

| Item | Prix | Description |
|------|------|-------------|
| Streak freeze | 80 | Acheter un bouclier manuellement. Protège le streak 1 jour. Max 2 en stock. |
| Double coins | 65 | La prochaine session rapporte 2× les coins. |

#### Pendant le quiz — Lifelines et modes spéciaux (consommables)

| Item | Prix | Description |
|------|------|-------------|
| Reveal hint | 25 | En mode direct, voir les axes de décision pour 1 question. Un joker. |
| Rematch | 30 | Rejouer immédiatement une session ratée, mêmes questions. Le nouveau score remplace l'ancien. |
| Mode sniper | 50 | Session courte de 5 questions, uniquement celles de difficulté max. Compte pour le streak. |
| Question mystère | 16 | Remplacer la prochaine question par une question d'une autre règle au hasard. |

#### Bonus récurrents (automatique)

| Item | Prix | Description |
|------|------|-------------|
| Coffre hebdo | Gratuit | Chaque lundi, bonus aléatoire 10-50 coins. Condition : streak actif. |

### Inventaire des permanents et coût total

En estimant 5 thèmes (3 basiques + 2 premium), 5 flammes, 5 titres, 4 animations, 4 fonds :

| Catégorie | Quantité × Prix unitaire | Sous-total |
|-----------|-------------------------|-----------|
| Thèmes basiques | 3 × 40 | 120 |
| Thèmes premium | 2 × 160 | 320 |
| Flammes custom | 5 × 65 | 325 |
| Titres custom | 5 × 120 | 600 |
| Animations victoire | 4 × 95 | 380 |
| Fonds dashboard | 4 × 120 | 480 |
| **Total permanents** | | **2225** |

### Équilibre économique vérifié

**Milestones à vie (3460) vs permanents (2225) → ratio 1.55×.**
Les milestones financent 100% des permanents avec un surplus de 1235 coins pour les consommables.

**Flux quotidien vs consommables :**
Un régulier à 30 coins/jour peut s'offrir 1 hint (25) ou 1 mystery (16) par jour, mais pas les deux. Les consommables restent un choix, pas un automatisme.

**Temps d'accès par profil (hors milestones) :**

| Item | Débutant (20/j) | Régulier (30/j) |
|------|-----------------|-----------------|
| Question mystère (16) | < 1 jour | < 1 jour |
| Reveal hint (25) | 1.2 jours | < 1 jour |
| Rematch (30) | 1.5 jours | 1 jour |
| Thème basique (40) | 2 jours | 1.3 jours |
| Mode sniper (50) | 2.5 jours | 1.7 jours |
| Flamme custom (65) | 3.2 jours | 2.2 jours |
| Double coins (65) | 3.2 jours | 2.2 jours |
| Streak freeze (80) | 4 jours | 2.7 jours |
| Animation victoire (95) | 4.7 jours | 3.2 jours |
| Titre custom (120) | 6 jours | 4 jours |
| Fond dashboard (120) | 6 jours | 4 jours |
| Thème premium (160) | 8 jours | 5.3 jours |

**Premier achat possible :** jour 1. Le milestone "première session" (50 coins) + la session elle-même (~10-20 coins) = 60-70 coins. Damien peut acheter un thème basique (40) et une question mystère (16) dès sa première session. La boutique est accessible immédiatement.

**Boutique entièrement vidée :** ~10-12 semaines pour un régulier (en comptant milestones + flux quotidien - consommables). C'est cohérent avec la durée de vie de l'app (7 règles à maîtriser).

### Double coins — pas cassé

Le double coins (65) rapporte un surplus de ~20-30 coins sur la session doublée. Le ROI est négatif sur une seule utilisation (coûte 65, rapporte +25 max). C'est un item "feel good", pas un exploit économique.

### Implémentation de la boutique

La boutique est accessible depuis le dashboard (icône 🏪 dans le header, à côté des coins).

**Écran boutique :**
- Items organisés par catégorie (onglets ou sections scrollables)
- Chaque item affiche : icône, nom, prix, description courte
- Si le joueur n'a pas assez de coins : item grisé avec le manque affiché ("Il te manque 30 🪙")
- Items permanents déjà achetés : marqués "Équipé" ou "Acheté" avec possibilité de changer l'actif
- Confirmation d'achat avec animation de coins qui s'envolent

**Inventaire / équipement :**
- Section "Mon style" dans les paramètres ou directement dans la boutique
- Permet de changer le thème actif, la flamme active, le titre actif, l'animation active, le fond actif
- Seuls les items achetés sont sélectionnables

---

## 8. Streak

### Règles de base

Le streak compte les jours consécutifs où au moins une session a été complétée.

- Le streak s'incrémente si `lastActiveDate` = hier.
- Si `lastActiveDate` < hier − 1 et pas de bouclier → le streak repart à 1.
- Une session commencée mais non terminée ne compte pas.

### Boucliers 🛡️

À partir de 7 jours de streak, Damien gagne 1 bouclier (max 2 en stock). Un bouclier est consommé automatiquement si un jour est raté. Message affiché : *"Bouclier activé — ton streak de X jours est sauvé."*

Le joueur peut aussi acheter un bouclier en boutique (80 coins) sans attendre les 7 jours.

### Paliers visuels (pas de bonus coins)

| Streak | Titre affiché | Flamme |
|--------|---------------|--------|
| 1–2j | Bon début | 🔥 |
| 3–6j | Sur la lancée | 🔥🔥 |
| 7–13j | En feu | 🔥🔥🔥 |
| 14–29j | Inarrêtable | ⚡ |
| 30j+ | Légende | 💥 |

Les titres sont remplaçables via la boutique (titres custom à 120 coins).
La flamme est remplaçable via la boutique (flamme custom à 65 coins).

### Jalons célébrés (avec bonus coins milestone)

| Jalon | Message | Bonus coins |
|-------|---------|-------------|
| 1er quiz | *"C'est parti, Damien. La régularité fait tout."* | 50 |
| Streak 3j | *"3 jours de suite — tu tiens le cap."* | — |
| Streak 7j | *"Une semaine sans faillir. C'est là que ça commence vraiment."* | 50 |
| Streak 14j | *"14 jours. Inarrêtable."* | 100 |
| Streak 30j | *"Un mois. Tu t'es prouvé quelque chose."* | 150 |
| Streak 60j | *"Deux mois. C'est une discipline."* | 300 |
| Streak 100j | *"100 jours. Légendaire."* | 500 |
| 1ère couronne | *"Règle maîtrisée. Cette couronne, tu l'as gagnée."* | (inclus dans milestone couronne) |
| 1er diamant | *"Parfait, trois fois de suite. C'est gravé."* | (inclus dans milestone diamant) |
| Streak perdu | *"Raté hier. Ça arrive. Reprends aujourd'hui."* | — |
| Bouclier utilisé | *"Bouclier activé — ton streak de X jours est sauvé."* | — |

---

## 9. Dashboard — raconter une histoire

Le dashboard est l'écran principal. Il doit répondre en 3 secondes à deux questions : "Où j'en suis ?" et "Qu'est-ce que je fais maintenant ?"

### Zone haute — "Ton niveau"

Résumé global de la progression de Damien :

**Header permanent :**
- Flamme streak + nombre de jours + titre du palier (ou titre custom)
- Total de coins 🪙 (cliquable → ouvre la boutique)
- Boucliers disponibles 🛡️ (0, 1 ou 2)

**Barre de progression globale :**
Affiche le nombre de règles à chaque niveau, visuellement :

```
[💎✨ 2] [💎 1] [👑 2] [⭐ 1] [🔒 1]
 Vivant   Diamant  Couronne  En cours  Nouvelle
```

C'est un résumé en une ligne de tout ce que Damien a accompli. Le nombre total de diamants vivants est le "score" ultime.

### Zone basse — "Aujourd'hui"

Les actions prioritaires, triées dans cet ordre :

1. **Révisions SM-2 dues** (diamants à revalider) — urgentes, affichées en premier avec indicateur visuel "⏰ Révision due". Si le diamant est terni, la carte le montre.
2. **Règles en cours** (niveaux 1-4) — triées par proximité du prochain niveau (ex. "2/3 sessions directes ≥ 80%" passe avant "0/3"). Affiche la progression vers le prochain niveau clairement.
3. **Nouvelles règles** (jamais commencées) — en bas, invitantes mais pas prioritaires.

**Chaque carte de règle affiche :**
- Titre de la règle
- Niveau actuel (icône + label)
- Barre de progression vers le prochain niveau
- Pour les diamants : état du diamant (brillant/terni) + date de prochaine révision
- Bouton "Jouer" (ou "Réviser" pour les SM-2 dues)

**Ce qu'on ne montre PAS sur la carte :** pas de compteurs SM-2, pas d'easiness, pas de "questions mastered/weak/due". Ce sont des métriques internes. Le joueur voit son niveau et sa progression, point.

### Événements overlay

Si un événement s'est produit depuis la dernière session (jalon de streak, couronne, diamant, bouclier utilisé), un overlay plein écran s'affiche 2-3 secondes avec le message personnalisé et une animation sobre. Damien peut le fermer d'un tap.

### Coffre hebdo

Le lundi, si le streak est actif, un coffre animé apparaît sur le dashboard. Damien tape dessus, il s'ouvre avec une animation, et le bonus (10-50 coins) est révélé.

---

## 10. Écran de fin de session

Après chaque session de 10 questions :

1. **Score (X/10)** avec animation de comptage
2. **Coins gagnés** avec animation +N en jaune qui monte
3. **Progression vers le prochain niveau** : barre qui avance, avec texte "Plus que X sessions pour [prochain niveau]"
4. **Si le streak a avancé** : nouvelle flamme + palier avec micro-animation
5. **Si un niveau est débloqué** : animation dédiée (étoile/couronne/diamant qui apparaît avec glow + message du tableau §8)
6. **Si mode direct débloqué** : badge "🔓 Mode direct déverrouillé !"
7. **Bouton "Continuer"** → retour au dashboard

**Ton général des animations** : élégant, fluide, sans son. Style cohérent avec le dark mode (couleurs `#c4b5fd`, `#4ade80`, `#fbbf24`). Les animations de coins et de streak sont rapides (< 1s). Les animations de diamant sont plus lentes et soignées (voir section 11).

---

## 11. Animations — Spécifications détaillées

Le diamant est le personnage central du jeu. Ses animations doivent être au niveau Duolingo : polies, expressives, et émotionnellement parlantes. Ce n'est pas un badge avec un filtre — c'est un objet 3D-like vivant qui réagit à l'état de Damien.

### 11.1 Le diamant : composant `DiamondStatus.jsx`

Le diamant est un SVG animé avec plusieurs couches superposées, chacune contrôlée par `diamondHealth` :

**Couche 1 — Le corps du diamant (SVG polygonal, style gemme à facettes)**

- `health = 1.0` : couleur cyan vif (#67e8f9) avec dégradé interne simulant des facettes. Chaque facette a une luminosité légèrement différente, donnant un effet 3D.
- `health 0.8–0.99` : même forme, couleur qui commence à se désaturer. Le dégradé interne s'aplatit doucement.
- `health 0.5–0.79` : couleur bleu-gris (#94a3b8). Les facettes perdent leur contraste. Un voile translucide blanc-gris apparaît par-dessus (opacity animée lentement, 3s cycle).
- `health 0.2–0.49` : gris-bleu foncé (#64748b). Des lignes de fissure apparaissent (paths SVG supplémentaires avec stroke-dasharray animé — les fissures "grandissent" la première fois qu'on les voit, en 0.8s). Les facettes ne sont presque plus visibles.
- `health 0.01–0.19` : gris (#475569). Fissures profondes et sombres. Le diamant tremble légèrement (animation CSS : translate aléatoire de ±1px, cycle 0.15s, donnant un micro-vibration inquiétant).
- `health = 0.0` : animation de brisure (voir 11.3).

**Couche 2 — Le halo (glow derrière le diamant)**

- `health = 1.0` : halo cyan radial, rayon = 150% du diamant, opacity 0.6, pulse lent (2s cycle, scale 1.0 → 1.1 → 1.0).
- `health 0.8–0.99` : halo réduit à 120%, opacity 0.3, pulse ralenti (3s).
- `health 0.5–0.79` : halo éteint (opacity 0).
- `health < 0.5` : remplacé par une ombre rouge très subtile (opacity 0.15) pour signaler le danger sans être agressif.

**Couche 3 — Les particules scintillantes**

- `health = 1.0` : 6-8 petits points lumineux (#fef08a, jaune clair) qui orbitent autour du diamant à des vitesses différentes. Chaque particule a un timing d'apparition/disparition (fade in/out sur 1s), créant un scintillement naturel. Animation CSS : rotation autour du centre + variation de rayon.
- `health 0.8–0.99` : particules réduites à 3-4, mouvement ralenti.
- `health < 0.8` : aucune particule.

**Couche 4 — Les fissures (health < 0.5)**

Les fissures sont des `<path>` SVG dessinés sur le corps du diamant. Elles apparaissent progressivement :
- `health 0.5` : 1 fissure fine, partant du haut.
- `health 0.3` : 2-3 fissures, plus larges, créant un réseau.
- `health 0.1` : fissures profondes avec un léger liseré rouge (#ef4444, opacity 0.3) sur les bords.

Chaque fissure apparaît avec une animation `stroke-dashoffset` (la fissure se "dessine" en 0.8s la première fois que le joueur la voit).

### 11.2 Transitions entre états

Quand le `diamondHealth` change (ex. Damien ouvre l'app et un diamant a terni depuis hier) :

**Transition dégradation (brillant → terne)** :
1. Le halo pulse une dernière fois, plus fort, puis s'éteint (fade out 0.5s)
2. Les particules ralentissent puis disparaissent une par une (staggered, 0.3s entre chaque)
3. La couleur du corps transitionne (CSS transition sur fill, 1.2s ease-in-out)
4. Si des fissures doivent apparaître : elles se dessinent après la transition de couleur (0.8s)

Durée totale : ~2.5s. C'est une petite scène silencieuse qui raconte "quelque chose s'est dégradé".

**Transition restauration (terne → brillant, après révision réussie ≥ 90%)** :
1. Flash blanc bref sur le diamant entier (opacity 0 → 0.8 → 0 en 0.3s)
2. Les fissures se "referment" (stroke-dashoffset revient à la valeur initiale, 0.6s)
3. La couleur remonte vers le cyan vif (transition 0.8s)
4. Le halo réapparaît (scale de 0 → 1.1 → 1.0, fade in, 0.5s)
5. Les particules réapparaissent une par une (staggered, 0.2s entre chaque)
6. Un dernier éclat : toutes les particules flash simultanément (scale 1 → 1.5 → 1, 0.3s)

Durée totale : ~2.5s. C'est un moment satisfaisant de "réparation".

### 11.3 Animation de brisure (diamondHealth → 0.0, rétrogradation)

C'est l'animation la plus dramatique du jeu. Elle ne joue qu'une fois, quand Damien ouvre l'app et qu'un diamant a atteint 0.0 pendant son absence.

**Séquence (3-4 secondes) :**

1. **Tremblement** (0.5s) : le diamant fissuré tremble de plus en plus fort (amplitude de ±1px à ±3px)
2. **Éclat inversé** (0.2s) : flash sombre (noir, opacity 0.5) au lieu du flash blanc habituel
3. **Brisure** (0.8s) : le diamant se sépare en 5-6 fragments (chaque fragment est un clip-path du SVG original). Les fragments s'écartent du centre avec une légère rotation et un fade out. Gravité simulée : les fragments tombent légèrement vers le bas.
4. **Pause** (0.5s) : espace vide là où était le diamant.
5. **Apparition de la couronne** (1s) : la couronne 👑 monte depuis le bas (translateY avec ease-out), plus petite que le diamant, avec un léger glow doré. Pas triomphale — sobre, presque consolante.

Cette animation est montrée dans l'écran de retour après inactivité (section 3), pas en plein quiz. Damien la voit une seule fois, il comprend la conséquence.

### 11.4 Animation d'obtention du diamant (niveau 3 → 4)

Quand Damien décroche un diamant pour la première fois (3×100% consécutifs) :

1. La couronne actuelle pulse et monte légèrement (scale 1 → 1.2, translateY -10px, 0.5s)
2. Flash blanc (0.3s)
3. La couronne se transforme en diamant : morph SVG de la forme couronne vers la forme diamant (1s, ease-in-out). Pendant le morph, la couleur passe du doré au cyan.
4. Le halo apparaît (scale 0 → 1.2 → 1.0, 0.5s)
5. Explosion de particules : 12-15 particules partent du centre dans toutes les directions (radial burst, 0.6s) puis 6-8 restent en orbite.
6. Message personnalisé en overlay : *"Parfait, trois fois de suite. C'est gravé."*

### 11.5 Animations du dashboard

**Diamant sur la carte de règle :**
- Si `health = 1.0` : le diamant fait un micro-pulse toutes les 4-5s (scale 1 → 1.05 → 1, très subtil). Les particules tournent. C'est vivant mais pas distrayant.
- Si `health < 1.0` : pas de pulse. Le diamant est statique dans son état terni/fissuré. Ça crée un contraste visuel immédiat avec les diamants sains.

**Carte de règle avec révision due :**
- Un liseré animé autour de la carte (border qui pulse doucement entre `#ef4444` opacity 0.3 et 0.6, 2s cycle). Pas criard, mais visible — "cette carte a besoin d'attention".

**Barre de progression globale (zone haute) :**
- Les diamants vivants (💎✨) dans la barre du haut ont leur mini-version du halo + particules. Les diamants ternis sont gris et statiques. La différence visuelle est immédiate : Damien voit en un coup d'œil combien brillent et combien sont éteints.

### 11.6 Animations de l'écran de retour après inactivité

L'écran de retour est séquencé comme une série de "nouvelles", chacune avec sa micro-animation :

1. **Streak** (si perdu) : la flamme actuelle est affichée, puis s'éteint (la flamme shrink vers le bas et disparaît en 0.8s, laissant une petite fumée grise qui se dissipe). Le compteur de jours fait un countdown visuel rapide (ex. 14 → 0 en 0.5s). Nouveau streak affiché : "1 jour".

2. **Diamants** (chacun affiché séquentiellement, 1s entre chaque) : le diamant dans son état précédent apparaît, puis transitionne vers son état actuel (animation de dégradation décrite en 11.2). Si brisé : animation de brisure 11.3. Le nom de la règle est affiché à côté.

3. **Bouton d'action** : après toutes les animations, un bouton "Reprendre" apparaît avec un fade-in et un léger pulse invitant. Pas de culpabilité, pas d'exclamation — juste une porte ouverte.

### 11.7 Autres animations (non-diamant)

**Coins gagnés en fin de session :**
- Le nombre "+N 🪙" monte depuis le score (translateY -30px, 0.5s) avec un fade in.
- Chaque coin individuel fait un mini arc vers le compteur total dans le header (si visible). Style : petits cercles dorés qui suivent une courbe de Bézier, staggered 0.05s entre chaque.

**Coffre hebdomadaire :**
- Le coffre est un SVG avec un couvercle articulé. Au tap, le couvercle s'ouvre (rotation -110deg sur le pivot arrière, 0.4s avec rebond). Des particules dorées sortent (burst vers le haut, 0.5s). Le montant de coins apparaît au-dessus (scale 0 → 1.2 → 1, 0.3s).

**Déblocage mode direct :**
- L'icône cadenas 🔒 tremble (0.3s), puis se "casse" en deux (2 fragments qui tombent avec gravité, 0.5s). À la place, l'icône du mode direct apparaît avec un flash.

**Obtention de couronne :**
- La couronne descend depuis le haut de l'écran (translateY avec ease-out bounce, 1s). Un glow doré pulse 2 fois. Message personnalisé.

---

## 12. Persistance utilisateur

### Structure de `progress.json`

```json
{
  "userId": "local",
  "createdAt": "2026-04-11",

  "streak": {
    "current": 14,
    "longest": 14,
    "lastActiveDate": "2026-04-11"
  },

  "coins": 540,
  "shields": 1,

  "shop": {
    "owned": ["theme-dark-blue", "flame-lightning", "title-le-boss"],
    "equipped": {
      "theme": "theme-dark-blue",
      "flame": "flame-lightning",
      "title": "title-le-boss",
      "victoryAnimation": null,
      "dashboardBackground": null
    },
    "activeBoosts": {
      "doubleCoins": false
    }
  },

  "milestones": {
    "firstSession": true,
    "streak7": true,
    "streak14": true,
    "streak30": false,
    "streak60": false,
    "streak100": false
  },

  "weeklyChest": {
    "lastOpened": "2026-04-07"
  },

  "rules": {
    "ces-ses": {
      "level": 4,
      "guidedSessionsCompleted": 5,
      "guidedBestScore": 90,
      "directSessionsCompleted": 4,
      "directBestScore": 100,
      "directPerfectStreak": 3,
      "sm2": {
        "easiness": 2.5,
        "interval": 6,
        "repetitions": 1,
        "nextReviewDate": "2026-04-17",
        "lastReviewScore": 90,
        "diamondHealth": 1.0
      },
      "recentTrophy": null,
      "questionStats": {
        "q001": { "timesShown": 4, "timesCorrect": 3 },
        "q002": { "timesShown": 3, "timesCorrect": 3 }
      }
    },
    "a-a-as": {
      "level": 2,
      "guidedSessionsCompleted": 3,
      "guidedBestScore": 85,
      "directSessionsCompleted": 0,
      "directBestScore": 0,
      "directPerfectStreak": 0,
      "sm2": null,
      "recentTrophy": null,
      "questionStats": {}
    }
  }
}
```

### Notes sur la structure

- `level` (1-5) est la source de vérité pour le niveau de la règle. Les compteurs de sessions sont le détail.
- `sm2` est `null` tant que le diamant n'est pas obtenu (level < 4 complété).
- `diamondHealth` est calculé dynamiquement à l'affichage (basé sur `nextReviewDate` et `interval`) mais aussi sauvegardé pour ne pas recalculer à chaque ouverture.
- `questionStats` est optionnel et n'influence pas la mécanique SM-2. C'est pour la boutique (item "Radiographie" si implémenté plus tard).
- `shop.equipped` permet de n'avoir qu'un thème/flamme/titre actif à la fois.

### Stockage

Identique à V1 : File System Access API (Chrome/Edge) avec fallback localStorage + bouton export.

---

## 13. Motivation utilisateur — Damien

### Principes directeurs

**Rendre le progrès visible à tout moment.** Le parcours en 5 niveaux par règle et la barre globale donnent une vision claire. Damien ne se demande jamais "où j'en suis".

**Célébrer sans infantiliser.** Animations soignées (voir section 11) mais pas de confettis ni de sons criards. Le diamant qui brille, le diamant qui se fissure — ce sont des animations élégantes, pas des récompenses Candy Crush. Damien est adulte.

**Le streak comme rituel, pas comme pression financière.** Le streak ne rapporte pas de coins au quotidien. Il existe pour la fierté et la constance. Les boucliers absorbent les ratés sans drame.

**Le diamant vivant comme cœur émotionnel.** Voir ses diamants briller est la vraie récompense. Un diamant qui ternit crée une tension émotionnelle immédiate — visuellement, Damien le *voit* en ouvrant l'app. Ce n'est pas un chiffre abstrait, c'est un objet beau qui se dégrade sous ses yeux. C'est cette émotion qui motive le retour quotidien, pas des coins.

**L'écran de retour comme miroir honnête.** Quand Damien revient après une absence, l'app ne le gronde pas. Elle lui montre factuellement ce qui s'est passé : streak éteint, diamants ternis ou brisés. C'est comme ouvrir une plante qu'on n'a pas arrosée — on voit l'état, on comprend, on reprend.

**La boutique comme expression personnelle.** Dépenser ses coins c'est personnaliser son expérience. Chaque achat est un choix qui rend l'app un peu plus "à soi".

---

## 14. Workflow d'ajout de contenu

Inchangé par rapport à V1 :

**Claude Code** gère l'app — composants, moteur, persistance, UI, boutique.

**Cowork / Claude** génère les fichiers de questions — un fichier `.json` par règle, respectant le format section 1. Déposés dans `src/content/rules/`, ingérés automatiquement.

---

## 15. Ordre d'implémentation

### Phase 1 — Fondations (existant à adapter)

1. **Refactorer `sm2.js`** : supprimer le SM-2 par question, implémenter le SM-2 par règle. Nouvelles fonctions : `initRuleSM2()`, `updateRuleSM2(ruleState, sessionScore)` avec seuil à 90% pour réussite et 80-89% pour stagnation, `calculateDiamondHealth(sm2State)` avec grace period = max(7, interval).
2. **Refactorer `session.js`** : sélection aléatoire des questions avec biais variété (plus de priorité SM-2 par question). Ajouter `recentlyShown` tracking pour éviter les répétitions.
3. **Refactorer `scoring.js`** : supprimer le bonus streak quotidien. Implémenter le système de niveaux 1-5 avec conditions de passage. Garder les milestones. Seuil de validation niveau 5 = 90%.

### Phase 2 — Économie

4. **Créer `economy.js`** : catalogue boutique (prix à -20%, voir section 7), logique d'achat, vérification solde, inventaire, équipement. Coffre hebdomadaire.
5. **Refactorer `persistence.js`** : nouvelle structure `progress.json` (section 12). Migration depuis l'ancien format si données existantes.

### Phase 3 — UI Core

6. **Refactorer `Dashboard.jsx`** : deux zones (ton niveau / aujourd'hui), barre globale, tri par priorité SM-2 > en cours > nouvelles.
7. **Créer `LevelPath.jsx`** : parcours visuel 5 niveaux par règle.
8. **Créer `DiamondStatus.jsx`** : diamant SVG multi-couches (corps + halo + particules + fissures) piloté par `diamondHealth`. Voir specs détaillées section 11.1.
9. **Refactorer `RuleCard.jsx`** : simplifier, montrer niveau + progression vers le suivant + état diamant. Supprimer les indicateurs internes (due/weak/new). Liseré animé pour révisions dues.
10. **Créer `Shop.jsx`** : écran boutique avec catégories, achat, équipement. Animation de coins.
11. **Intégrer les thèmes** : système de CSS variables piloté par `shop.equipped.theme`. Appliquer le thème actif au chargement.
12. **Créer `ReturnScreen.jsx`** : écran de retour après inactivité. Détecte l'absence (≥ 2 jours sans session), calcule les pertes (streak, diamants ternis/brisés), affiche le bilan séquencé avec animations (section 11.6).

### Phase 4 — Animations (qualité Duolingo)

C'est une phase critique. Les animations du diamant sont le cœur émotionnel du jeu. Ne pas bâcler.

13. **Animations diamant — transitions entre états** : implémentation des transitions dégradation et restauration (section 11.2). Tester chaque transition entre chaque paire d'états (1.0→0.7, 0.7→0.4, etc.).
14. **Animation de brisure du diamant** : fragment shader / clip-path. 5-6 fragments qui se séparent avec gravité. Apparition de la couronne (section 11.3). C'est l'animation la plus complexe — la tester sur plusieurs tailles d'écran.
15. **Animation d'obtention du diamant** : morph couronne → diamant, burst de particules, message (section 11.4).
16. **Animations écran de retour** : flamme qui s'éteint, countdown streak, séquence de dégradation des diamants (section 11.6).
17. **Animations secondaires** : coins en fin de session, coffre hebdomadaire, déblocage mode direct, obtention couronne (section 11.7).

### Phase 5 — Polish

18. **Écran de fin de session** : refonte complète avec progression vers prochain niveau, message 80-89% pour niveau 5.
19. **Overlays de milestones** : messages personnalisés aux jalons.
20. **Performance** : s'assurer que les animations diamant ne lag pas (requestAnimationFrame, will-change, GPU compositing). Tester avec 7 diamants animés simultanément sur le dashboard.
21. **Responsive + QA** : tester sur mobile (Damien utilisera probablement son téléphone). Les animations diamant doivent être aussi fluides sur un iPhone que sur desktop.

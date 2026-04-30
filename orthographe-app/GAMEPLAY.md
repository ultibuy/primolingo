# GramHero — Documentation complète du gameplay

> Document de référence à jour : tout ce qui se passe dans le jeu, comment c'est rémunéré, et comment l'enfant progresse. Mis à jour avec les évolutions récentes du code (système d'émotions à 3 base + 7 boutique, perso visible pendant le quiz, popup de déblocage d'émotion, 15 persos avec tarification étendue).

---

## 1. Vue d'ensemble

GramHero est une application d'orthographe pour les enfants de 10-12 ans. Elle transforme l'apprentissage des règles de grammaire et l'apprentissage de nouveaux mots en une boucle de jeu vidéo : sessions de quiz, pièces, flamme quotidienne, niveaux par règle, boutique cosmétique, personnages compagnons à émotions multiples, et révisions espacées (SM-2) pour ancrer les acquis dans la mémoire à long terme.

L'app vise une session de **5 minutes par jour** : un quiz de 20 questions, soit sur une règle de grammaire, soit pour apprendre de nouveaux mots. Tout le système d'incentives (pièces, flamme, paliers, persos, émotions à collectionner) est conçu pour ramener l'enfant tous les jours.

Le contenu actuel : **17 règles de grammaire** (a/à/as, leur/leurs, ce/se, ces/ses, son/sont, ou/où, pluriel en -al/-ou, accords du participe passé, conjugaison du 3e groupe au présent, féminin en -e/-ée, adverbes en -ment, ant/ent, g/gu/ge, etc.) et **13 sessions pour apprendre de nouveaux mots** (Harry Potter, Pop Art, Carnaval de Rio, Gauguin, Casa Batlló, Vénus de Milo…).

---

## 2. Boucle de jeu principale

L'enfant atterrit sur le **Dashboard**. Il y voit son personnage compagnon, sa flamme (streak), son compteur de pièces, et trois sections de règles :

1. **Révisions** — règles de niveau Diamant dont la révision SM-2 est due aujourd'hui.
2. **En cours** — règles déjà commencées (niveau ≥ 1).
3. **À découvrir** — règles encore à niveau 0.

Il choisit une règle de grammaire ou une session pour apprendre de nouveaux mots → lance le quiz → joue 20 questions → écran de fin → retour au dashboard avec gains et événements (level-up, paliers, etc.). Une session typique dure 3 à 6 minutes.

Si l'enfant revient après plusieurs jours d'absence, le **ReturnScreen** s'affiche : il l'informe de la perte de la flamme (ou la sauve via un bouclier), et de l'état des diamants (qui peuvent s'être ternis ou brisés).

---

## 3. Les sessions de quiz

### 3.1. Taille et sélection des questions

Une session standard fait **20 questions** (paramètre `prodQuestionCount`, configurable par les parents). Les questions sont tirées de la banque de la règle avec une logique de variété : on évite les questions vues dans les 2 dernières sessions, on équilibre les niveaux de difficulté en round-robin, on mélange l'ordre.

### 3.2. Les deux modes principaux

**Mode guidé** — le mode d'apprentissage. L'enfant voit la phrase à compléter, puis répond d'abord à des questions intermédiaires (les **axes de décision**). Exemple sur leur/leurs : « Le mot suivant est-il un verbe ou un nom ? » puis « Le nom est-il singulier ou pluriel ? ». Chaque réponse à un axe élimine visuellement les choix incorrects, puis l'enfant choisit la réponse finale parmi ceux qui restent. C'est une scaffolding pédagogique : on apprend à raisonner, pas par cœur.

**Mode direct** — débloqué une fois la règle au niveau Argent. Plus d'axes de décision, plus d'aide. L'enfant voit la phrase, choisit directement parmi les réponses possibles. C'est ici que la maîtrise se prouve.

### 3.3. Apprendre de nouveaux mots

Second pilier de l'app, accessible depuis un onglet dédié sur le dashboard. L'enfant écoute un passage (Pop Art, Harry Potter, Carnaval de Rio, Vénus de Milo…) et le reconstruit (mode reconstruct) ou le complète (mode guided). Les sessions sont organisées en 3 niveaux verrouillés :
- **Aventurier** (jaune) : accessible dès le départ.
- **Héros** (vert) : débloqué quand toutes les sessions Aventurier sont au niveau Couronne.
- **Légende** (violet) : débloqué quand toutes les sessions Héros sont au niveau Couronne.


---

## 4. Le système de niveaux par règle

Chaque règle progresse indépendamment selon une échelle à **5 niveaux**. Aucune règle ne peut sauter une étape.

| Niveau | Nom | Condition | Récompense |
|---|---|---|---|
| 0 | Non commencé | — | — |
| 1 | Bronze | 1 session guidée terminée (n'importe quel score) | — |
| 2 | Argent | 3 sessions guidées ≥ 80 % | +30 pièces, **débloque le mode direct** |
| 3 | Couronne | 3 sessions directes ≥ 80 % | +100 pièces |
| 4 | Diamant | 3 sessions directes consécutives ≥ 90 % | +200 pièces, **active la révision espacée SM-2** |
| 5 | Diamant vivant | Maintenu via révisions SM-2 | — |

Les seuils sont calculés en valeur absolue : sur 20 questions, 80 % = 16/20, 90 % = 18/20.

Pour le diamant, **une seule session sous 90 % remet le compteur consécutif à zéro**. C'est volontairement exigeant — c'est ce qui fait du diamant un trophée rare.

### 4.1. Le diamant vivant et SM-2

Quand une règle atteint Diamant, elle entre dans un cycle de révisions espacées calé sur l'algorithme SM-2 :
- Première révision : le lendemain (J+1).
- Si ≥ 90 % : intervalle 1 → 6 → 15 → 35 → 80 jours (puis × facilité).
- Si 80-89 % : intervalle inchangé, le diamant tient mais reste fragile.
- Si < 80 % : intervalle reset à 1 jour, **la santé du diamant chute**.

Chaque diamant a une **santé** (0.0 à 1.0). Si la révision est en retard, la santé baisse au prorata des jours de retard sur une période de grâce (max(7 jours, intervalle courant)). Quand la santé atteint 0, **le diamant se brise** : la règle redescend au niveau 3 (Couronne), il faut refaire 3 sessions consécutives ≥ 90 % pour le récupérer.

Les règles avec une révision due aujourd'hui apparaissent en haut du dashboard, dans la section **Révisions**.

---

## 5. L'économie : les pièces

Les pièces sont la monnaie unique du jeu. Elles s'accumulent sur le compteur global (pas par règle).

### 5.1. Gains en fin de session

Selon le pourcentage de réussite :

| Score | Pièces |
|---|---|
| 100 % | 30 |
| 80–99 % | 20 |
| 60–79 % | 5 |
| < 60 % | 0 (et la flamme ne progresse pas) |

### 5.2. Bonus

- **Bonus de bienvenue** — première session de toute la vie ≥ 60 % : **+200 pièces** (popup dédié au démarrage).
- **Bonus du jour** — première session de la journée ≥ 60 % : **+10 pièces** (popup quotidien).
- **Level-up Argent** : **+30 pièces** (et débloque le mode direct).
- **Level-up Couronne** : **+100 pièces**.
- **Level-up Diamant** : **+200 pièces**.
- **Paliers de flamme** : 7 j → +100, 14 j → +200, 30 j → +350, 60 j → +500, 100 j → +1 000 pièces.
- **Boost Double coins** (consommable, 100 pièces) : double les pièces des 5 prochaines sessions. Limité à 1 achat par semaine.

### 5.3. Notes économiques

- **Aucun gain sous 60 %** : l'enfant ne fait pas progresser sa flamme et ne touche pas de pièces. C'est le seuil de qualification.
- **Le bonus de bienvenue n'est versé qu'une fois.** La toute première session qualifiante peut rapporter **jusqu'à 230 pièces** (200 bienvenue + 30 score parfait), un capital initial qui finance le premier perso (Panda à 250) en deux ou trois sessions.
- **Le palier 100 jours est verrouillé après obtention** : pas de double encaissement, on ne peut plus rien débloquer côté streak après ça.

---

## 6. La flamme (streak)

La flamme est le compteur de jours consécutifs où l'enfant a fait au moins une session qualifiante (≥ 60 %). Elle est affichée en grand sur le dashboard.

### 6.1. Paliers de flamme

| Jours | Titre | Visuel |
|---|---|---|
| 1 | Bon début | 🔥 |
| 3 | Sur la lancée | 🔥🔥 |
| 7 | En feu | 🔥🔥🔥 |
| 14 | Inarrêtable | ⚡ |
| 30 | Légende | 💥 |

### 6.2. Les boucliers

Les boucliers se gagnent **uniquement par achat en boutique** (160 pièces, stock max : **2**). Il n'y a plus d'attribution automatique aux paliers de flamme — c'est désormais un choix explicite de l'enfant.

Si l'enfant rate une journée, son bouclier protège la flamme : pas de perte. La consommation est explicite via le **ReturnScreen** quand l'enfant revient — il choisit s'il veut utiliser un bouclier ou en acheter un avec ses pièces.

### 6.3. Casser la flamme

Sans bouclier, manquer une journée fait tomber la flamme à zéro. La plus longue flamme jamais atteinte (`longest`) est conservée comme record personnel. Le retour génère un événement `streakLost` avec un message d'encouragement et, si possible, une suggestion d'achat de bouclier.

---

## 7. Le personnage compagnon

L'enfant adopte un **personnage** qui l'accompagne en permanence : sur le dashboard, **dans la barre de progression du quiz** (avec des émotions qui changent à chaque question), et dans l'écran de fin de session. Le perso est devenu central — il n'est plus juste décoratif, il réagit en direct à ce qui se passe.

### 7.1. Le catalogue de personnages

50 personnages existent dans `characters.js` (catégories : animaux guerriers, créatures fantastiques, héros & combattants, robots & futur, éléments naturels, personnages rigolos, mystère & cosmos). **15 sont actuellement vendus en boutique**, à deux niveaux de prix :

| Prix | Persos |
|---|---|
| **250** | Panda Samouraï 🐼 — le perso d'entrée d'onboarding |
| **500** | Les 14 autres : Renard Espion 🦊, Loup Fantôme 🐺, Tigre de l'Éclair 🐯, Lion Solaire 🦁, Aigle Tempête 🦅, Reine des Glaces 🧊, Robot Gardien 🤖, Ours Viking 🐻, Requin Ninja 🦈, Chouette Magicienne 🦉, Chat Détective 🐱, Dragon de Feu 🐉, Esprit Champignon 🍄, Cosmonaute Intrépide 🧑‍🚀 |

Le Panda à 250 est l'**ancre d'onboarding** : avec le bonus de bienvenue de 200 pièces + une ou deux sessions correctes, l'enfant peut l'adopter en quelques jours. Les 14 autres persos forment la collection de moyen-long terme (500 pièces ≈ 17 sessions parfaites ou 25 sessions à 80 %).

### 7.2. Les émotions : 3 offertes + 7 à débloquer

Le système d'émotions a été restructuré en deux paquets distincts :

**Émotions de base** *(offertes avec l'achat du perso)* :
| ID | Symbole | Quand elle joue |
|---|---|---|
| `walk` | 🚶 | Animation par défaut entre les quiz |
| `sleep` | 💤 | Apparaît au démarrage tant que < 3 quiz réussis (et lors de la 1re session de la vie) |
| `sit` | 🧘 | Position de repos sur les nœuds de progression |

**Émotions de boutique** *(200 pièces chacune, à débloquer une par une, par perso)* :
| ID | Symbole | Quand elle joue |
|---|---|---|
| `wave` | 👋 | Salut avant la 1re question (random avec kiss) |
| `kiss` | 💋 | Bisou avant la 1re question (random avec wave) |
| `clap` | 👏 | À chaque bonne réponse + score 80–89 % en fin de session |
| `victory` | 🏆 | Fin de session avec score ≥ 90 % (random avec dance) |
| `dance` | 💃 | Fin de session avec score ≥ 90 % (random avec victory) |
| `surprise` | 😲 | Mauvaise réponse pendant le quiz (random avec think) ; aussi score < 70 % en fin |
| `think` | 🤔 | Mauvaise réponse pendant le quiz (random avec surprise) ; aussi score < 70 % en fin |

Conséquence : il y a **7 émotions à acheter par perso × 15 persos = 105 émotions achetables**, soit potentiellement **21 000 pièces** rien que pour tout collectionner. C'est une carotte de très long terme.

### 7.3. La logique d'émotion en jeu

**Pendant le quiz (ProgressBar)** :
- Toute première session de la vie → `sleep` permanent.
- 1re question (avant réponse) → `wave` ou `kiss` (tirage aléatoire stable pour la session).
- Sur une bonne réponse → `clap`.
- Sur une mauvaise réponse → `think` ou `surprise` (random à chaque mauvaise).
- Dernière question avec score final ≥ 90 % → `dance` ou `victory` (tirage stable).
- Sinon → `walk`.

**Sur l'EndScreen** :
- 100 % → `clap`.
- 90–99 % → `dance` ou `victory` (random).
- 80–89 % → `clap`.
- 70–79 % → `walk`.
- < 70 % → `think` ou `surprise` (random).

### 7.4. Le déblocage à chaud (locked emotion popup)

Si le perso devrait jouer une émotion mais que l'enfant ne la possède pas, l'app **affiche le perso en `walk` accompagné d'une bulle 🔒 contenant un mot teaser** (« bravo », « salut », « zut », « super », « dodo »). La bulle est cliquable et ouvre `EmotionPurchasePopup` :
- Aperçu du perso, symbole et nom de l'émotion, description courte.
- Bouton « Débloquer pour 200 🪙 » (désactivé si solde insuffisant) ou « Plus tard ».

C'est le mécanisme d'upsell le plus contextuel du jeu : l'enfant voit en direct ce qu'il rate, et il a toujours assez de pièces fraîches juste après une bonne session pour craquer. Ce système est exposé à la fois dans la **ProgressBar** (pendant le quiz) et dans l'**EndScreen** (dans le header avec le score).

### 7.5. Affectation des persos (multi-persos)

Si l'enfant possède plusieurs persos, chaque règle se voit assigner un perso pour la journée selon un round-robin aléatoire mais stable (cache local sur la date). Cela évite la lassitude tout en garantissant une cohérence visuelle dans la session.

---

## 8. La boutique

Accessible depuis le dashboard. 4 catégories.

### 8.1. Cosmétique

Items permanents qui modifient l'apparence de l'app.

**Thèmes de couleur** (palette du dashboard) :
- Dark Blue, Forest Green, Warm Amber : 80 pièces (basic).
- Aurora, Midnight Purple : 320 pièces (premium).
- My Hero Academy : 360 pièces (premium avec image de fond).

**Flammes** — change l'icône de la flamme du streak (130 pièces chacune) : Éclair ⚡, Vague 🌊, Cible 🎯, Crâne 💀, Dragon 🐉.

**Titres** — affiché sous le compteur de jours à la place du titre de palier (240 pièces) : Le Boss, Machine, Sniper, Intouchable, Cérébral.

**Animations de victoire** — joue un effet quand l'enfant valide une bonne réponse (190 pièces) : Glow Néon, Effet Glitch, Onde de choc, Confettis sobres.

**Animations de célébration / d'entrée** — effet plein écran lors d'un palier (300 pièces) : Frappe de foudre ⚡, Explosion d'étoiles ✨, Inferno 🔥, Freeze ❄️.

### 8.2. Assurance

- **Bouclier de flamme** (160 pièces) — protège la flamme pendant 1 jour. Stock max : 2.
- **Double coins** (100 pièces) — double les gains des 5 prochaines sessions. Limité à 1 achat par semaine (calé sur le lundi).

### 8.3. Persos & émotions

Voir §7. 15 persos (250 à 500 pièces selon le perso) et 7 émotions par perso (200 pièces l'unité). Le perso achète une seule fois ; les émotions s'ajoutent à son répertoire au fur et à mesure des achats. **Les 3 émotions de base (walk, sleep, sit) sont automatiquement incluses** dès qu'on achète un perso — l'enfant n'a rien à débloquer manuellement pour avoir un perso fonctionnel.

### 8.4. Image mystère

Un système de collection : l'enfant achète des morceaux d'une image cachée (60 pièces le morceau, 6 morceaux par image, **max 2 morceaux par jour**). L'ordre de révélation est aléatoire mais le morceau final est fixé par l'image, donc le suspense s'étale jusqu'à la fin.

Deux images dans la collection actuelle :
- **Dragon céleste** (id `manga`)
- **Guerrier fulgurant** (id `ryu`)

Les parents peuvent **uploader des images personnalisées** depuis le ParentDashboard (photos famille, dessins, etc.) qui apparaissent ensuite dans la collection.

---

## 9. Les animations et la couche visuelle

Plusieurs couches de feedback visuel s'empilent :

**Animations de victoire** (cosmétiques achetés) — un effet à l'intérieur du quiz, à chaque bonne réponse ou en fin de session.

**Animations d'entrée / de célébration** (cosmétiques achetés) — effets plein écran déclenchés à des moments forts : passage d'un palier de flamme, obtention d'un diamant. Sans achat, le palier passe sans effet visuel additionnel — c'est exactement le rôle de cet item premium.

**Animations du personnage** — déclenchées par les événements du dashboard (cf §7.2) **et par les questions du quiz** (cf §7.3). Durée typique : 4 secondes, le perso revient ensuite à `walk`.

**Overlays d'événements** (Dashboard) — popups stylisés qui apparaissent à la fin d'un quiz pour annoncer un level-up, un palier de flamme, l'activation d'un bouclier, etc. Les événements sont dédupliqués (ex : `level_up_2` et `direct_unlocked` sont fusionnés) et présentés à la file.

---

## 10. Le ReturnScreen (retour après absence)

Si l'enfant rouvre l'app après ≥ 2 jours d'absence (`INACTIVITY_DAYS = 2`), un écran de retour multi-étapes prend le pas sur le dashboard.

Étapes possibles, dans l'ordre :
1. **Intro** : « Tu as raté X jours. »
2. **Streak** : animation d'extinction de la flamme. Si l'enfant a (ou peut acheter) un bouclier, on lui propose de l'utiliser pour sauver la flamme. Sinon la flamme retombe à 0.
3. **Diamants** : un step par diamant impacté, montrant la perte de santé ou la rupture.
4. **Action finale** : retour au dashboard.

Cet écran est aussi le moment de l'**OTP** (vérification parentale via code parent) si la flamme est sauvée par un achat — pour éviter les abus.

---

## 11. Le rôle du parent (ParentDashboard)

Espace séparé, accessible via le compte Google parent. Il permet de :
- Créer/configurer un ou plusieurs profils enfants.
- Définir un **code parental** (4 caractères, défaut `PAPA`) pour valider certaines actions sensibles.
- Régler la taille des sessions (`prodQuestionCount`).
- Charger des **images mystère personnalisées** (photos famille, etc.) → l'enfant les débloque morceau par morceau.
- Voir les sauvegardes quotidiennes (`getDailyBackups`) et restaurer une journée.

---

## 12. Persistance et architecture des données

L'état du joueur vit dans un objet `progress` dont la forme principale est :

```
{
  userId, createdAt,
  streak: { current, longest, lastActiveDate },
  coins: number,
  shields: number,
  shop: {
    owned: string[],            // items permanents : 'theme-...', 'char-panda', 'char-panda-clap', etc.
    equipped: { theme, flame, title, victoryAnimation },
    activeBoosts: { doubleCoins, doubleCoinsRemainingSessions, ... },
    inventory: { /* legacy keys — consommables historiques */ },
    mysteryImages: { ... }
  },
  milestones: { firstSession, streak7, streak14, streak30, streak60, streak100 },
  rules: {
    [ruleId]: {
      level, guidedSessionsCompleted, guidedSessionsAbove80, guidedBestScore,
      directSessionsCompleted, directSessionsAbove80, directBestScore,
      directConsecutiveAbove90, sm2: { easiness, interval, repetitions, nextReviewDate, ... } | null,
      recentlyShown, questionStats
    }
  }
}
```

Le format des items dans `shop.owned` :
- `theme-aurora`, `flame-dragon`, `title-le-boss`, `anim-neon`, `entrance-stars` — items du SHOP_CATALOG.
- `char-panda`, `char-dragon`, `char-cosmo` — persos achetés.
- `char-panda-clap`, `char-panda-victory` — émotions débloquées (ID composé `char-{charId}-{emotionId}`).
- `mystery-piece:manga` (instances multiples) — pièces d'image mystère.

Stockage : Firestore en cloud + sauvegardes journalières glissantes sur 30 jours + restore-points avant chaque restauration. En local, possibilité de fonctionner sans cloud via un backend Node (`/api`) qui écrit dans `user-data/`.

---

## 13. Synthèse des leviers de motivation

Le jeu empile plusieurs mécaniques de fidélisation, chacune à un horizon différent :

| Horizon | Mécanique | Ce qui pousse à revenir |
|---|---|---|
| Intra-session | Pièces, animations de victoire, **émotions du perso à chaque question** | Voir le score grimper, voir le perso applaudir, déclencher l'effet visuel |
| Pendant le quiz | **Bulle 🔒 sur émotion locked** | Acheter l'émotion immédiatement avec les pièces qu'on vient de gagner |
| Quotidien | Bonus du jour (+10), flamme | Ne pas rater la journée, faire avancer le compteur |
| Hebdomadaire | Boucliers offerts (tous les 7 j), Double coins relaunch | Atteindre un palier, profiter d'un boost |
| Mensuel | Niveaux par règle (Couronne, Diamant), nouveau perso | Maîtriser une règle, débloquer un compagnon |
| Long terme | SM-2, paliers 30/60/100 j, image mystère, **collection complète des 105 émotions** | Maintenir les diamants vivants, devenir Légende, tout collectionner |

À chaque horizon, une récompense en pièces qui finance les leviers du dessus (cosmétique, perso, émotions, image mystère). Les pièces sont le carburant, mais elles ne se dépensent que dans des objets qui rendent l'expérience plus belle ou plus facile — jamais pour avancer plus vite. Le perso et ses émotions sont devenus le **puits sans fond** côté collection : c'est ce qui peut tenir l'enfant 6 mois après qu'il a déjà tous ses diamants.

# GramHero — Arcs narratifs et messages courts de guidage

> Ce document recense les arcs narratifs que l'app peut faire vivre à l'enfant via des **messages courts d'une phrase** (parfois deux). Chaque arc est une suite de nudges qui pointent toujours vers une action concrète : faire un quiz, dépenser des pièces, lancer une révision, équiper un cosmétique, débloquer une émotion. L'objectif est de transformer chaque feature de l'app en une étape d'un récit. **Mis à jour avec le nouveau système d'émotions (3 base + 7 boutique à 200 🪙) et la tarification étendue des persos (250 → 500 🪙).**

## Principes d'écriture

- **Une phrase, un verbe d'action**. Ne jamais expliquer la mécanique en détail — la cible est toujours visible (« commence ton premier quiz », « va dans la boutique », « lance une révision »).
- **Tutoiement, ton complice**. L'enfant a 10-12 ans, le ton suit celui déjà adopté dans les overlays existants : direct, encourageant, pas mielleux.
- **Toujours un horizon court**. « Plus que 50 pièces », « plus qu'une session », « demain ta flamme passe à 7 ». Les horizons flous (« continue comme ça ! ») sont à éviter.
- **Pas de double objectif**. Un message vise une action.
- **Émojis avec parcimonie** (1 max), seulement quand ils renforcent l'objet : 🪙 pièces, 🔥 flamme, 💎 diamant, 👑 couronne, 🛡️ bouclier, 🎁 cadeau, 🔒 émotion bloquée.
- **Quantités exactes**. Pas « beaucoup de pièces » mais « 200 pièces ».

Les messages peuvent prendre plusieurs formes selon l'emplacement : popup à l'arrivée sur le dashboard, ligne de coaching sous le compteur de pièces, toast après un événement, overlay de fin de session, **bulle perso en haut de l'EndScreen**.

---

## Arc 1 — Onboarding : la première semaine

C'est l'arc le plus critique : il transforme un visiteur en habitué. Il va du tout premier lancement jusqu'au moment où la flamme atteint 7 jours et où l'enfant a son premier perso compagnon.

### Étape 1.1 — Avant le tout premier quiz
Déclencheur : `progress.milestones.firstSession === false` et aucune session jamais commencée.
- **« Fais ton premier quiz pour remporter 200 pièces de bienvenue 🎁. »**
- Variante si l'enfant hésite après 30 s : **« Choisis n'importe quelle règle — la première session débloque tes 200 pièces. »**

### Étape 1.2 — Première session terminée avec succès (≥ 60 %)
Déclencheur : événement `firstSession` + `firstSessionOfDay` avec `isWelcome: true`.
- **« Bravo, tu as débloqué tes 200 pièces de bienvenue 🎁. »**
- Toast complémentaire 4 secondes plus tard : **« Ta flamme est lancée — reviens demain pour la faire grimper à 2 jours 🔥. »**

### Étape 1.3 — Première session ratée (< 60 %)
Déclencheur : première session de la vie, score < 60 %.
- **« Pas grave, le bonus de 200 pièces 🎁 t'attend dès que tu finis une session avec au moins 12/20. »**

### Étape 1.4 — Approche du Panda (entre 200 et 249 pièces)
Déclencheur : `coins >= 200` ET `coins < 250` ET aucun perso possédé.
- **« Plus que {250 - coins} pièces 🪙 pour débloquer le Panda Samouraï 🐼. »**

### Étape 1.5 — Panda accessible (≥ 250 pièces)
Déclencheur : `coins >= 250` ET aucun perso possédé.
- **« C'est bon, tu peux débloquer le Panda 🐼 — va faire un tour dans la boutique. »**
- Variante si l'enfant procrastine 2 jours : **« Ton Panda Samouraï t'attend toujours dans la boutique 🐼. »**

### Étape 1.6 — Le perso adopté
Déclencheur : achat du premier perso (Panda).
- **« Le Panda est à toi avec ses 3 émotions de base. Termine 3 quiz pour qu'il se réveille — il fait dodo en attendant 💤. »**
- Quand le 3ᵉ quiz est terminé : **« Ton Panda est réveillé. Fais un 20/20 pour le voir applaudir 👏 — l'émotion "bravo" se débloque pour 200 pièces. »**

### Étape 1.7 — Vers la flamme 7 jours
Déclencheur : flamme à 5 ou 6 jours.
- À 5 jours : **« Plus que 2 jours pour atteindre 7 jours et empocher 100 pièces 🪙 + un bouclier. »**
- À 6 jours, soir : **« Demain ta flamme passe à 7 jours — bouclier offert et +100 pièces. »**
- À 7 jours, après la session : **« Une semaine d'affilée 🔥. +100 pièces, et ton premier bouclier protège ta flamme. »**

### Étape 1.8 — La première règle Bronze
Déclencheur : `level_up_1` sur la première règle.
- **« Bronze sur "leur / leurs". Encore 2 sessions guidées avec 16/20 pour passer Argent et débloquer le mode direct. »**

---

## Arc 2 — Devenir un habitué : du Bronze à l'Argent

Cet arc accompagne l'enfant pendant qu'il transforme une règle en compétence. Il met en avant le **mode direct** comme déblocage majeur.

### Étape 2.1 — Une session guidée à ≥ 80 %
Déclencheur : `guidedSessionsAbove80` passe de 0 à 1 sur une règle de niveau 1.
- **« Belle session sur "a / à / as". Plus que 2 sessions à 16/20 pour passer Argent. »**

### Étape 2.2 — Deuxième session ≥ 80 %
- **« Plus qu'une session à 16/20 et le mode direct est à toi sur "a / à / as". »**

### Étape 2.3 — Argent atteint
Déclencheur : `level_up_2`.
- **« Argent sur "a / à / as" 🥈 — mode direct déverrouillé, +30 pièces. Essaie-le, plus de pavé d'aide. »**
- Toast 6 s plus tard : **« Le mode direct rapporte autant de pièces, mais il prouve que tu maîtrises sans aide. »**

### Étape 2.4 — Première session directe ratée
Déclencheur : score < 60 % en mode direct.
- **« Le mode direct, c'est exigeant. Refais un guidé pour te remettre dedans, le mode direct t'attendra. »**

---

## Arc 3 — Maîtriser une règle : Argent → Couronne

Cet arc joue sur l'horizon « décrocher ta première couronne ». Il célèbre la couronne comme un trophée social.

### Étape 3.1 — Première session directe ≥ 80 %
- **« 1 session directe validée sur "ce / se". Plus que 2 pour décrocher ta couronne 👑 + 100 pièces. »**

### Étape 3.2 — Couronne en vue (2/3)
- **« Plus qu'une session directe à 16/20 sur "ce / se" et la couronne tombe. »**

### Étape 3.3 — Couronne obtenue
Déclencheur : `crown` event.
- **« Couronne sur "ce / se" 👑. Tu sais répondre sans aide. +100 pièces. »**
- Toast plus tard : **« Vise maintenant le diamant : 3 sessions directes consécutives à 18/20. »**

### Étape 3.4 — Encourager d'autres règles
Déclencheur : ≥ 2 couronnes obtenues, mais < 50 % des règles à Bronze.
- **« Tu as 2 couronnes 👑. Et si tu attaquais une nouvelle règle ? Il en reste 12 à découvrir. »**

---

## Arc 4 — Le diamant : la perfection rare

Le diamant est le trophée le plus dur. L'arc valorise l'exigence et explique sans peser le mécanisme du « 3 d'affilée ».

### Étape 4.1 — Direct ≥ 90 % (1/3)
- **« 18/20 en direct sur "leur / leurs". 2 sessions consécutives encore à 18/20 minimum et c'est le diamant 💎. »**

### Étape 4.2 — Direct ≥ 90 % (2/3)
- **« Plus qu'une session à 18/20 sur "leur / leurs" et le diamant est à toi. Concentration. »**

### Étape 4.3 — Compteur reset après une session < 90 %
- **« Le compteur diamant retombe à 0 sur "leur / leurs". Refais 3 sessions à 18/20 d'affilée. »**

### Étape 4.4 — Diamant obtenu
Déclencheur : `diamond` event.
- **« Diamant sur "leur / leurs" 💎. +200 pièces. Le diamant est vivant : reviens le polir avec une révision demain. »**

### Étape 4.5 — Première révision SM-2 due
Déclencheur : `sm2.nextReviewDate <= today`, premier jour.
- **« Ta première révision diamant est prévue aujourd'hui — fais-la pour que le diamant brille. »**

### Étape 4.6 — Révision réussie ≥ 90 %
- **« Révision réussie. Prochaine dans 6 jours, le diamant tient parfaitement. »**

### Étape 4.7 — Révision fragile (80–89 %)
- **« Le diamant tient mais il a tremblé. Une révision parfaite la prochaine fois et il repart sur l'intervalle long. »**

### Étape 4.8 — Révision en retard
Déclencheur : `diamondHealth < 1.0` mais > 0.
- **« Ton diamant sur "leur / leurs" se ternit — fais sa révision avant qu'il ne se brise 💎. »**

### Étape 4.9 — Diamant brisé
Déclencheur : `diamondBroken` event.
- **« Le diamant sur "leur / leurs" s'est brisé. Reprends 3 directes à 18/20 d'affilée pour le retailler. »**

---

## Arc 5 — Construire une habitude : la flamme

Cet arc tourne autour des paliers de streak. Il a sa propre dramaturgie indépendante des règles.

### Étape 5.1 — Flamme à 1 jour
- **« Ta flamme est lancée 🔥. Reviens demain, c'est tout. »**

### Étape 5.2 — Flamme à 2 jours
- **« Deux jours d'affilée. Demain, palier "Sur la lancée" 🔥🔥. »**

### Étape 5.3 — Soir de J6 (avant J7)
Déclencheur : pas encore joué aujourd'hui, flamme actuelle = 6, J7 = palier.
- **« Demain ta flamme passe à 7 jours — bouclier 🛡️ + 100 pièces 🪙. »**

### Étape 5.4 — Palier 7 jours atteint
- **« Une semaine sans faillir. +100 pièces. Prochain palier : 14 jours, +200 pièces. »**

### Étape 5.5 — Palier 14 jours
- **« 14 jours. Inarrêtable ⚡. +200 pièces. Prochain palier : 30 jours, +350 pièces. »**

### Étape 5.6 — Palier 30 jours
- **« Un mois. Tu t'es prouvé quelque chose 💥. +350 pièces. Prochain palier : 60 jours, +500 pièces. »**

### Étape 5.7 — Palier 60 jours, puis 100 jours
- **« 60 jours d'affilée. +500 pièces. Légende est à 100 jours, +1 000 pièces. »**
- À 100 j : **« 100 jours. Légende. +1 000 pièces. Tu as tout débloqué côté flamme. »**

### Étape 5.8 — Flamme menacée en journée (J après 16 h, pas de session aujourd'hui)
Déclencheur : flamme active, pas de session validée aujourd'hui, heure ≥ 16 h, l'enfant ouvre l'app.
- **« Plus que 5 h pour sauver ta flamme de X jours 🔥. Une session de 5 minutes suffit. »**

### Étape 5.9 — Flamme reset (lendemain d'un raté, ReturnScreen passé)
Déclencheur : nouveau jour qui suit un `streakLost`, dashboard atteint.
- **« Flamme à 0. On redémarre aujourd'hui — un quiz, et c'est reparti 🔥. »**

---

## Arc 6 — Économie : transformer les pièces en plaisir

L'arc « shop » garde l'enfant connecté au compteur de pièces et lui donne envie d'en gagner.

### Étape 6.1 — Premières dépenses possibles (≥ 80 pièces)
Déclencheur : seuil 80 pièces atteint, rien d'acheté.
- **« 80 pièces 🪙 — tu peux changer le thème de ton dashboard dans la boutique. »**

### Étape 6.2 — Vers le premier perso (≥ 200 pièces)
- **« Encore 50 pièces 🪙 et tu peux adopter le Panda Samouraï 🐼. »**

### Étape 6.3 — Premier perso accessible (≥ 250 pièces)
- **« 250 pièces 🪙 — adopte le Panda Samouraï 🐼 dans la boutique, il vient avec ses 3 émotions de base. »**

### Étape 6.4 — Approche d'un 2e perso (≥ 450 pièces, Panda déjà possédé)
Déclencheur : `coins >= 450` ET `coins < 500` ET au moins 1 perso possédé hors Panda non encore acheté.
- **« Plus que {500 − coins} pièces 🪙 pour adopter un 2e perso. »**

### Étape 6.5 — 2e perso accessible (≥ 500 pièces, 1 seul perso)
Déclencheur : `coins >= 500` ET un seul perso possédé.
- **« 500 pièces 🪙 — choisis ton 2e perso parmi 14 (Dragon 🐉, Lion 🦁, Loup 🐺, Cosmonaute 🧑‍🚀…). »**

### Étape 6.6 — Vers la collection (≥ 500 pièces, ≥ 2 persos déjà possédés)
- **« 500 pièces 🪙 — un nouveau perso à ajouter à ta collection. »**

### Étape 6.7 — Vers la première émotion (perso possédé, ≥ 200 pièces)
Déclencheur : `coins >= 200` ET au moins un perso possédé ET aucune émotion shop débloquée pour ce perso. Le message se personnalise avec le nom du perso le plus récemment acheté (ou le plus utilisé).
- **« 200 pièces 🪙 = 1 nouvelle émotion pour ton {Panda 🐼 / Dragon 🐉 / Lion 🦁 / …}. Va dans la boutique → Persos. »**
- Variantes selon le perso :
  - Panda : « 1 nouvelle émotion pour ton Panda 🐼. »
  - Dragon : « 1 nouvelle émotion pour ton Dragon 🐉. »
  - Renard : « 1 nouvelle émotion pour ton Renard 🦊. »
  - *(et ainsi de suite pour chaque perso)*

### Étape 6.8 — Image mystère (≥ 60 pièces)
Déclencheur : aucun morceau d'image mystère encore acheté.
- **« 60 pièces 🪙 = 1 morceau d'image mystère. Découvre ton image cachée morceau par morceau. »**

### Étape 6.9 — Limite quotidienne d'image mystère atteinte
- **« 2 morceaux dévoilés aujourd'hui ✅. Reviens demain pour 2 nouveaux morceaux. »**

### Étape 6.10 — Vers une animation de victoire (≥ 190 pièces)
- **« 190 pièces 🪙 — tu peux acheter une animation qui se déclenche à chaque bonne réponse. »**

### Étape 6.11 — Vers une animation de célébration (≥ 300 pièces)
- **« 300 pièces 🪙 — débloque un effet plein écran 💥 pour tes prochains paliers. »**

### Étape 6.12 — Cosmétique premium (≥ 320 pièces)
- **« 320 pièces 🪙 — un thème premium est à ta portée (Aurora, Midnight Purple). »**

### Étape 6.13 — Coffre vide
Déclencheur : `coins < 30` et flamme active.
- **« Plus que 12 pièces 🪙. Une session à 16/20 = +20 pièces, vite ! »**

---

## Arc 7 — Boosts et consommables : amplifier les sessions

Cet arc explique les consommables au moment opportun, jamais en abstrait.

### Étape 7.1 — Double coins disponible (lundi, ≥ 100 pièces)
- **« Lundi : tu peux relancer le boost Double coins 🪙×2 pour 5 sessions. »**

### Étape 7.2 — Double coins actif, sessions restantes
- **« Double coins actif — encore 3 sessions ×2 🪙. »**

---

## Arc 8 — Apprendre de nouveaux mots

Cet arc met en avant le second pilier de l'app : à côté des règles de grammaire, l'enfant peut apprendre de nouveaux mots à travers des passages (Pop Art, Harry Potter, Carnaval de Rio, Vénus de Milo…). Il ne se déclenche qu'une fois la grammaire amorcée.

### Étape 8.1 — Découvrir l'autre onglet (≥ 1 règle Bronze)
- **« Tu maîtrises les règles ? Va apprendre de nouveaux mots dans le second onglet 🎧. »**

### Étape 8.2 — Première session Aventurier terminée
- **« Première session bouclée 🟡. Termine toutes les Aventurier au niveau Couronne pour débloquer Héros. »**

### Étape 8.3 — Niveau Aventurier complet
- **« Toutes les Aventurier sont en Couronne 👑. Niveau Héros débloqué 🟢 — des mots plus rares t'attendent. »**

### Étape 8.4 — Niveau Héros complet
- **« Niveau Héros bouclé 🟢. Bienvenue chez les Légendes 🟣, les mots les plus exigeants t'attendent. »**

---

## Arc 9 — Reconquête : retour après absence

Cet arc se joue uniquement dans le ReturnScreen et les jours qui suivent.

### Étape 9.1 — Retour après 2-3 jours, flamme sauvée par bouclier
- **« Bouclier 🛡️ utilisé : ta flamme de X jours est sauvée. Bien joué d'avoir préparé le coup. »**

### Étape 9.2 — Retour après 2-3 jours, flamme cassée
- **« Tu as raté X jours. Ça arrive. Reprends aujourd'hui, rien n'est perdu côté pièces et niveaux. »**

### Étape 9.3 — Retour après ≥ 7 jours
- **« Bon retour. Tes diamants sont à vérifier — fais une révision pour qu'ils retrouvent leur éclat 💎. »**

### Étape 9.4 — Diamant en danger (santé < 0.5)
- **« Le diamant sur "X" est ternit. Une révision réussie aujourd'hui et il repart neuf. »**

### Étape 9.5 — Premier quiz post-retour fini
- **« Tu es de retour 🔥. Demain, ta flamme passe à 2. »**

---

## Arc 10 — Mastery : le joueur avancé

Pour les enfants qui ont déjà au moins 3 diamants. L'objectif change : il s'agit de tenir.

### Étape 10.1 — Toutes les règles à au moins Couronne
- **« Toutes tes règles ont leur couronne 👑. Maintenant, vise les diamants un par un. »**

### Étape 10.2 — Toutes les règles à Diamant
- **« Tous tes diamants sont en place 💎. Légende. À toi de les maintenir. »**

### Étape 10.3 — 5+ diamants vivants
- **« 5 diamants vivants 💎. Aucune révision en retard. Tu es chez les meilleurs. »**

### Étape 10.4 — Pas de quiz aujourd'hui mais 0 révision due
- **« Aucune révision aujourd'hui. Profites-en pour apprendre de nouveaux mots dans le second onglet 🎧. »**

### Étape 10.5 — Légende à 100 jours
- **« 100 jours d'affilée. +1 000 pièces. Tu as tout débloqué côté flamme. »**

---

## Arc 11 — Image mystère : la collection longue

L'arc mystère se vit sur 2-3 semaines, à raison de 2 morceaux/jour max.

### Étape 11.1 — Premier morceau acheté
- **« Premier morceau dévoilé 🧩. Encore 5 morceaux pour voir l'image complète. »**

### Étape 11.2 — Mi-parcours (3/6)
- **« Moitié de l'image dévoilée. Plus que 3 morceaux et le mystère tombe. »**

### Étape 11.3 — Avant-dernier morceau (5/6)
- **« Plus qu'un morceau pour découvrir l'image entière 🎁. »**

### Étape 11.4 — Image complète
- **« Image mystère complète. Bravo. Une nouvelle image t'attend dans la boutique. »**

---

## Arc 12 — Émotions : le puits sans fond *(nouveau)*

C'est l'arc à plus long terme du jeu. **105 émotions à collectionner** (15 persos × 7 émotions à 200 🪙) = 21 000 pièces si on veut tout. Cet arc s'appuie sur le mécanisme `EmotionPurchasePopup` qui se déclenche à chaud quand le perso devrait jouer une émotion non possédée.

### Étape 12.1 — Première bulle 🔒 dans le quiz
Déclencheur : pendant un quiz, le perso devrait jouer `wave`/`kiss`/`clap`/`think`/etc. mais l'enfant ne possède pas l'émotion.
- *(via le composant lui-même, bulle « 🔒 salut » au-dessus du perso)*
- En complément texte : **« Cliquer sur la bulle 🔒 débloque l'émotion pour 200 pièces. »** *(une seule fois, à la première apparition)*

### Étape 12.2 — Première émotion débloquée
Déclencheur : premier item `char-{X}-{emotion}` dans `shop.owned`.
- **« Émotion "bravo" 👏 débloquée pour ton Panda. Maintenant il t'applaudit à chaque bonne réponse. »**

### Étape 12.3 — Encourager la suite (1-2 émotions débloquées)
- **« Ton Panda a 1 émotion sur 7. Vise "victoire" 🏆 — il s'active sur tes scores ≥ 18/20. »**

### Étape 12.4 — Mi-collection sur un perso (4/7)
- **« Ton Panda a 4 émotions sur 7. Plus que 3 pour le compléter. »**

### Étape 12.5 — Premier perso entièrement complété
Déclencheur : 7 émotions débloquées sur un même perso.
- **« Panda complet 🐼 — toutes ses émotions sont à toi. 14 persos restants à collectionner. »**

### Étape 12.6 — Bulle 🔒 sur l'EndScreen avec score 100 %
Déclencheur : score parfait, perso devrait jouer `clap` mais émotion locked.
- **« 20/20 et ton perso aurait applaudi 👏 — débloque "bravo" pour 200 pièces, ton perso te le rendra. »**

### Étape 12.7 — Émotion "salut" non possédée
Déclencheur : 1re question du quiz, `wave`/`kiss` random tiré mais locked.
- **« Pour que ton perso t'accueille à chaque quiz, débloque "salut" 👋 pour 200 pièces. »**

### Étape 12.8 — Émotion "zut" non possédée après 3 mauvaises réponses
- **« Quand tu te trompes, ton perso pourrait t'encourager — débloque "zut" 🤔 pour 200 pièces. »**

---

## Arc 13 — Boucliers : ne plus jamais perdre sa flamme *(nouveau)*

Depuis la suppression de l'attribution automatique tous les 7 jours, **les boucliers se gagnent uniquement par achat** (160 pièces, stock max 2). Cet arc transforme le bouclier en réflexe d'enfant prévoyant : il pousse à acheter avant que la flamme ne soit en danger, pas après. Plus la flamme est longue, plus l'arc devient pressant.

### Étape 13.1 — Premier seuil (≥ 160 pièces, 0 bouclier, flamme < 3 jours)
Déclencheur : `coins >= 160` ET `shields === 0` ET `streak.current < 3`.
- **« 160 pièces 🪙 = 1 bouclier 🛡️. Si tu rates un jour, ta flamme est sauvée. »**

### Étape 13.2 — Flamme qui mérite protection (≥ 160 pièces, 0 bouclier, flamme ≥ 3 jours)
Déclencheur : `coins >= 160` ET `shields === 0` ET `streak.current >= 3`.
- **« Ta flamme de {streak} jours 🔥 vaut le coup d'être protégée — un bouclier 🛡️ pour 160 pièces. »**

### Étape 13.3 — Flamme longue, urgence d'assurance (≥ 160 pièces, 0 bouclier, flamme ≥ 7 jours)
Déclencheur : `coins >= 160` ET `shields === 0` ET `streak.current >= 7`.
- **« {streak} jours sans bouclier 🛡️, c'est jouer avec le feu 🔥. 160 pièces et tu dors tranquille. »**

### Étape 13.4 — Vers le 2e bouclier (≥ 160 pièces, 1 bouclier, flamme ≥ 14 jours)
Déclencheur : `coins >= 160` ET `shields === 1` ET `streak.current >= 14`.
- **« Tu as 1 bouclier 🛡️. À ta flamme de {streak} jours, le second pour 160 pièces fait du bien. »**

### Étape 13.5 — Stock max atteint (2 boucliers)
Déclencheur : `shields === 2` (event ponctuel après achat).
- **« 2 boucliers en stock 🛡️🛡️. Tu peux rater 2 jours sans casser ta flamme. »**

### Étape 13.6 — Bouclier consommé (post-ReturnScreen)
Déclencheur : événement `shieldUsed`, retour sur le dashboard.
- **« Bouclier 🛡️ consommé, ta flamme tient. Pense à en racheter un avant la prochaine fois. »**

### Étape 13.7 — Bouclier consommé, solde suffisant pour racheter
Déclencheur : événement `shieldUsed` ET `coins >= 160` ET `shields < 2` quelques heures plus tard.
- **« Tu as 160 pièces 🪙 — rachète ton bouclier 🛡️ tant que la flamme est longue. »**

### Étape 13.8 — Flamme cassée, post-mortem éducatif
Déclencheur : événement `streakLost` traité au ReturnScreen, dashboard atteint, le joueur n'avait aucun bouclier.
- **« La prochaine fois, garde 1 bouclier 🛡️ d'avance — 160 pièces 🪙, ça évite de tout reperdre. »**

---

## Arc 14 — Encouragements et rebonds émotionnels

Petits messages contextuels qui ne forment pas un arc mais qui sont cousus dans tous les autres.

### Sur une session parfaite (20/20)
- **« 20/20 parfait 👏. +30 pièces + bonus de session parfaite. »**

### Sur une série de 3 sessions parfaites
- **« 3 parfaits d'affilée. Tu es entré dans la zone 💥. »**

### Sur une session moyenne après un échec
- **« Bien remonté, +5 pièces. Demain, vise les 16/20. »**

### Sur un réveil (1ère session du jour avant 8 h)
- **« Debout tôt et déjà à l'entraînement 🔥. Bonus du jour empoché. »**

### Sur une session du soir tardif (après 21 h)
- **« Session de fin de journée — flamme sauvée, dodo 💤. »**

### Sur un score < 40 %
- **« Cette règle te résiste — refais une guidée, le pavé de décision t'aide à raisonner. »**

---

## Logique de déclenchement (recommandations techniques)

Pour orchestrer ces messages sans les rendre envahissants :

1. **Une règle = un canal**. Au plus 2 messages courts par session (en plus des overlays existants pour les events) : un avant le quiz (coaching), un après (rebond).
2. **Cap quotidien** : 4 messages contextuels par jour max, hors overlays événementiels et hors bulles 🔒 du perso (qui sont déjà gérées par les composants).
3. **Priorisation** : si plusieurs arcs se déclenchent, suivre l'ordre Onboarding > Flamme menacée > Diamant en danger > Niveau en vue > Émotion locked à chaud > Économie générale.
4. **Cooldown par arc** : un message d'un arc donné ne se rejoue pas avant 24 h, sauf si la condition change (ex : palier de pièces nouvellement franchi, nouvelle émotion locked apparue dans le quiz).
5. **Personnage = porte-voix**. Quand un message s'affiche, déclencher l'émotion associée du perso (`wave` pour bienvenue, `victory` pour palier, `surprise` pour danger). Si l'émotion n'est pas possédée, fallback sur `walk` + bulle 🔒 cliquable. Cela transforme chaque nudge en opportunité de vente d'émotion.
6. **Persistance des seuils franchis** : stocker dans `progress.coachingFlags` (à créer dans `createDefaultProgress`) les arcs déjà servis (`welcomeBonusReached`, `firstPersoNudgeShown`, `firstEmotionLockedSeenInQuiz`, etc.) pour ne pas répéter.

---

## Synthèse : couverture des features par les arcs

| Feature | Arc(s) qui la met en avant |
|---|---|
| Bonus de bienvenue (200 pièces) | Arc 1 (Onboarding) |
| Bonus du jour (10 pièces) | Arc 5, Arc 14 |
| Flamme et paliers | Arc 5 |
| Boucliers (achat manuel uniquement, 160 🪙) | **Arc 13 (nouveau)**, Arc 9 |
| Niveau Bronze | Arc 1 |
| Niveau Argent + mode direct | Arc 2 |
| Niveau Couronne | Arc 3 |
| Niveau Diamant + SM-2 | Arc 4 |
| Révisions SM-2 | Arc 4 |
| Personnages compagnons (Panda 250 → rares 500) | Arc 1, Arc 6 |
| Émotions de base (offertes) | Arc 1 |
| Émotions de boutique (200 🪙) | **Arc 12 (nouveau)** |
| Bulle 🔒 / EmotionPurchasePopup | **Arc 12** |
| Thèmes / Flammes / Titres / Animations | Arc 6 |
| Boost Double coins | Arc 7 |
| Image mystère | Arc 11 |
| Module nouveaux mots (3 niveaux) | Arc 8 |
| Retour après absence | Arc 9 |
| Diamants brisés / fissurés | Arc 4, Arc 9 |
| Mastery longue durée | Arc 10 |
| Score parfait, séries | Arc 14 |

Chaque feature de l'app est couverte par au moins un arc, et la majorité par plusieurs angles selon le moment du parcours.

**Priorités d'implémentation** :
1. **Arc 1 (Onboarding)** — touche 100 % des nouveaux joueurs. À activer en premier.
2. **Arc 5 (Flamme)** — touche 100 % des joueurs dès J2. Indispensable pour la rétention quotidienne.
3. **Arc 12 (Émotions)** — exploite le mécanisme déjà en place dans le code. Peut générer beaucoup d'achats avec un coût d'implémentation minimal puisque la bulle 🔒 existe déjà.
4. Les autres arcs peuvent venir progressivement.

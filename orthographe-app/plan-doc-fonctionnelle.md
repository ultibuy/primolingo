# Plan de dev — Documentation fonctionnelle PrimoLingo

## Objectif

Créer une documentation fonctionnelle vivante qui :

1. Décrit chaque domaine de l'app du point de vue utilisateur (enfant ou parent).
2. Liste les règles métier de chaque domaine avec l'ID du test associé.
3. Inclut des screenshots de référence pris automatiquement par Playwright en mobile (390x844).
4. Est servie dynamiquement en HTML sur `/docs` en mode dev uniquement — jamais déployée en prod.
5. Sert de référence pour vérifier la conformité des futurs développements.

---

## Principes

- Aucun terme technique : pas de nom de fonction, pas de nom de fichier, pas de structure de code.
- Le vocabulaire est celui de l'app : flamme, pièces, bouclier, couronne, diamant, quiz, règle, personnage.
- Les screenshots sont pris en mobile 390x844 pour refléter l'usage principal.
- Chaque règle métier a un ID de test (ex: C01, N04) avec une description en langage naturel du comportement attendu et du critère de succès.
- Le sommaire est généré dynamiquement depuis la liste des fichiers.

---

## Architecture

```
docs/
  index.md                        ← sommaire avec liens vers chaque page
  01-inscription-connexion.md
  02-gestion-enfants.md
  03-dashboard-enfant.md
  04-flamme-serie.md
  05-regles-grammaire.md
  06-quiz-guide.md
  07-quiz-direct.md
  08-diamant-revisions.md
  09-ecran-fin-session.md
  10-dictee.md
  11-boutique.md
  12-personnages.md
  13-images-mystere.md
  14-economie-recompenses.md
  15-coaching-messages.md
  16-tableau-bord-parent.md
  17-code-pin-parental.md
  18-pages-publiques-seo.md
  19-ci-cd-tests.md
  screenshots/                    ← images PNG prises par Playwright
    01-login-page.png
    01-login-google-popup.png
    03-dashboard-accueil.png
    03-dashboard-flamme.png
    ...
```

---

## Phase 1 — Serveur de documentation

### 1.1 Route `/docs` en mode dev uniquement

Ajouter une route dans le serveur de dev (ou un middleware Vite) qui :

- lit les fichiers `.md` du dossier `docs/` ;
- les convertit en HTML (avec un parser Markdown simple, ex: `marked`) ;
- les sert avec un style de lecture sobre (fond clair, typographie lisible, images responsives) ;
- génère un sommaire automatique à partir de `docs/index.md` ;
- ne rend rien en production — la route `/docs` n'existe pas en build prod.

### 1.2 Gestion des images

- Les screenshots sont référencés dans le Markdown via des chemins relatifs : `![Dashboard](screenshots/03-dashboard-accueil.png)`
- Le serveur de docs sert aussi le dossier `docs/screenshots/` en statique.
- Les images sont prises en 390x844 (ratio mobile iPhone).

### 1.3 Navigation

- Chaque page a un lien "Sommaire" en haut.
- Le sommaire liste toutes les pages avec un résumé d'une ligne.
- Les pages ont des liens internes entre elles quand un domaine en référence un autre (ex: "voir Économie et récompenses" depuis "Écran de fin de session").

---

## Phase 2 — Rédaction des pages

Chaque page suit la même structure :

```md
# [Titre du domaine]

## Description

[2-3 phrases décrivant ce que fait ce domaine pour l'utilisateur]

## Parcours utilisateur

[Description narrative du flux, étape par étape, avec screenshots intercalés]

![Étape 1](screenshots/XX-etape1.png)

## Règles

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| XX | Description de la règle | Ce qu'on observe quand la règle est respectée |

## Voir aussi

- [Lien vers domaine lié 1](./autre-page.md)
- [Lien vers domaine lié 2](./autre-page.md)
```

---

## Phase 2.1 — Contenu par page

### 01 — Inscription et connexion

Description : Le parent crée un compte via Google pour accéder à l'app. La connexion utilise le compte Google du parent.

Parcours :
1. Arrivée sur la page de connexion → screenshot
2. Clic sur "Se connecter avec Google" → popup Google
3. Redirection vers le tableau de bord parent

Règles :

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| — | La page de connexion affiche le logo PrimoLingo | Le logo est visible, centré, sans emoji |
| — | Le bouton de connexion mentionne Google | Le texte "Se connecter avec Google" est visible |
| — | Une note de confidentialité est affichée | Le texte mentionne que la connexion ne donne pas accès aux e-mails |
| — | Après connexion, le parent arrive sur son tableau de bord | La page `/parent` s'affiche avec la liste des enfants |

Voir aussi : Tableau de bord parent, Code PIN parental

---

### 02 — Gestion des enfants

Description : Le parent ajoute un ou plusieurs profils enfant, choisit un prénom et configure le nombre de questions par session.

Parcours :
1. Depuis le tableau de bord parent, clic sur "Ajouter un enfant" → screenshot
2. Saisie du prénom → screenshot
3. Configuration du nombre de questions → screenshot
4. Retour au tableau de bord avec le nouvel enfant visible

Règles :

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| N28 | Le réglage du nombre de questions est enregistré | La valeur saisie par le parent est persistée et utilisée dans les sessions de l'enfant |
| N26 | Les données de chaque enfant sont isolées | La progression d'un enfant ne peut pas écraser celle d'un autre |

Voir aussi : Tableau de bord parent, Quiz guidé

---

### 03 — Dashboard enfant

Description : L'écran d'accueil de l'enfant affiche sa flamme, ses pièces, ses boucliers, un message de coaching et la liste de ses règles à travailler.

Parcours :
1. Ouverture de l'app enfant → screenshot du dashboard
2. Flamme et compteur de jours visibles en haut → screenshot
3. Bandeau de motivation avec message contextualisé → screenshot
4. Liste des règles en cours et à découvrir → screenshot
5. Onglet dictée accessible → screenshot

Règles :

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| E01 | Sans aucune session, le personnage dort | Le sprite du personnage est en mode dodo sur le dashboard |
| E02 | Après des sessions, le personnage est actif | Le sprite marche ou est assis selon l'humeur calculée |

Voir aussi : Flamme et série, Coaching et messages, Règles de grammaire

---

### 04 — Flamme et série

Description : La flamme représente le nombre de jours consécutifs où l'enfant a joué. Elle monte de 1 chaque jour joué. Si l'enfant rate un jour sans bouclier, elle retombe à zéro.

Parcours :
1. Dashboard avec flamme active → screenshot
2. Alerte flamme en danger le soir → screenshot
3. Palier atteint (7 jours) avec popup récompense → screenshot
4. Écran de retour après 2 jours d'absence → screenshot
5. Achat de bouclier pour protéger la flamme → screenshot

Règles :

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| N09 | La flamme augmente de 1 chaque jour joué | Jouer hier puis aujourd'hui fait passer la flamme de N à N+1 |
| N09 | La flamme se réinitialise après 2 jours sans jouer | 2 jours d'écart remettent la flamme à 1 |
| N10 | Le bouclier n'est pas consommé automatiquement | C'est l'écran de retour qui propose d'utiliser le bouclier |
| N11 | Les paliers de flamme donnent les bonnes pièces | 7j → 100, 14j → 200, 30j → 350, 60j → 500, 100j → 1000 |
| N14 | L'écran de retour apparaît après 2+ jours d'absence | Après 2 jours sans jouer, un écran spécial s'affiche avant le dashboard |
| N14b | L'écran de retour n'apparaît pas si l'enfant a joué hier | Si la dernière session date d'hier, le dashboard s'affiche directement |
| N15 | Le bouclier peut être utilisé depuis l'écran de retour | Le bouton "Sauver la flamme" déduit les pièces et protège la série |

Voir aussi : Dashboard enfant, Économie et récompenses, Boutique

---

### 05 — Règles de grammaire

Description : L'app propose 20 règles d'orthographe, chacune avec 4 niveaux de progression. L'enfant les découvre une par une et progresse de Bronze à Diamant.

Parcours :
1. Liste des règles à découvrir → screenshot
2. Règle en cours de progression (Bronze → Argent) → screenshot
3. Règle maîtrisée (Couronne) → screenshot
4. Règle au niveau Diamant → screenshot
5. Fiche mémo d'une règle → screenshot

Règles :

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| N04 | La progression suit Bronze → Argent → Couronne → Diamant | Après 3 sessions réussies (≥80%), le niveau monte |
| N05 | Le Diamant exige 3 sessions consécutives ≥90% | Une session en dessous de 90% remet le compteur à zéro |

Voir aussi : Quiz guidé, Quiz direct, Diamant et révisions

---

### 06 — Quiz guidé

Description : Le quiz guidé accompagne l'enfant avec un pavé de décision qui élimine les mauvaises réponses étape par étape. C'est le mode de découverte d'une règle.

Parcours :
1. Clic sur "Découvrir" depuis une règle → screenshot
2. Question avec pavé de décision → screenshot
3. Réponse correcte avec feedback → screenshot
4. Réponse incorrecte avec explication → screenshot
5. Personnage animé au-dessus de la barre de progression → screenshot

Règles :

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| S04 | Le personnage est visible pendant le quiz | Le sprite apparaît au-dessus de la barre de progression |
| S05 | Le feedback s'affiche après chaque réponse | "Bravo !" ou "Raté !" apparaît clairement |
| S06 | Le personnage reste visible après réponse | Le sprite ne disparaît pas quand le feedback s'affiche |
| E03 | À la première question, le personnage fait coucou | Le personnage salue le joueur au début du quiz |
| E04 | Après une bonne réponse, le personnage applaudit | Le personnage tape dans ses mains |
| E05 | Au tout premier quiz, le personnage dort | Si c'est la toute première session, le personnage commence endormi |

Voir aussi : Quiz direct, Écran de fin de session, Personnages

---

### 07 — Quiz direct

Description : Le quiz direct ne propose plus de pavé de décision. L'enfant répond directement. C'est le mode de maîtrise, débloqué au niveau Argent.

Parcours :
1. Clic sur "Mode direct" depuis une règle Argent → screenshot
2. Question sans aide → screenshot
3. Réponse et feedback → screenshot

Règles :

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| S07 | Le mode direct affiche le bonus du jour si applicable | Le bouton indique "Bonus de 10" pour la première session du jour |

Voir aussi : Quiz guidé, Règles de grammaire, Écran de fin de session

---

### 08 — Diamant et révisions

Description : Le diamant est le trophée ultime. Une fois obtenu, il est vivant : il faut le maintenir par des révisions espacées. Si les révisions ne sont pas faites à temps, le diamant ternit, se fissure et peut se briser.

Parcours :
1. Dernière session pour obtenir le diamant → screenshot
2. Popup "Diamant obtenu" → screenshot
3. Diamant brillant sur le dashboard → screenshot
4. Révision disponible (due) → screenshot
5. Diamant terni / fissuré → screenshot

Règles :

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| N06 | La santé du diamant diminue avec le temps | Plus le retard de révision augmente, plus la santé baisse (de 1 vers 0) |
| N07 | La prochaine révision est planifiée correctement | Succès → intervalle doublé, fragile → réduit, échec → réinitialisé |
| N08 | Un échec de révision fait redescendre au niveau Couronne | Un score inférieur à 80% en révision brise le diamant |

Voir aussi : Règles de grammaire, Écran de fin de session

---

### 09 — Écran de fin de session

Description : Après chaque quiz, l'enfant voit son score, les pièces gagnées (avec détail des bonus), sa progression vers le prochain niveau et le récapitulatif de ses réponses.

Parcours :
1. Score affiché avec animation → screenshot
2. Détail des pièces (base + bonus du jour + palier flamme + double) → screenshot
3. Barre de progression vers le prochain niveau → screenshot
4. Récapitulatif des réponses (erreurs en premier) → screenshot
5. Bouton "Continuer" → retour au dashboard

Règles :

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| N01 | Les pièces sont calculées selon le score | 0% → 0, 60-79% → 5, 80-99% → 20, 100% → 30 |
| N02 | Le bonus de bienvenue de 200 pièces n'est crédité qu'une fois | À la première session réussie (≥60%), 200 pièces bonus. Jamais après |
| N03 | Le bonus du jour donne 10 pièces | La première session du jour avec ≥60% rapporte 10 pièces supplémentaires |
| N24 | La section pièces est visible | Le total de pièces apparaît sur l'écran de fin |
| N25 | La progression vers le prochain objectif est affichée | La barre de niveau et le texte s'affichent si pas de montée de niveau |
| E06 | Un mauvais score montre un personnage hésitant | Le personnage montre de la surprise ou réfléchit |

Voir aussi : Économie et récompenses, Règles de grammaire

---

### 10 — Dictée

Description : L'onglet dictée propose des mots à écrire en écoutant leur prononciation. Trois niveaux progressifs : Aventurier (accessible), Héros et Légende (déverrouillés par la progression).

Parcours :
1. Onglet Dictée depuis le dashboard → screenshot
2. Niveau Aventurier accessible → screenshot
3. Niveau Héros verrouillé → screenshot
4. Quiz dictée : écoute du mot et saisie → screenshot
5. Fermeture du quiz → retour à l'onglet Dictée

Règles :

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| D01 | L'onglet Dictée est accessible | L'onglet est visible et cliquable depuis le dashboard |
| D02 | "Commencer" lance la dictée | Le quiz s'ouvre quand on clique sur le bouton |
| D03 | "Écouter" joue le mot | L'animation de lecture démarre quand on appuie |
| D04 | La phrase de contexte s'affiche | Le mot est présenté dans une phrase complète |
| D05 | Fermer retourne au bon onglet | On revient sur Dictée, pas sur Grammaire |
| D06 | Les fichiers audio se chargent | L'app charge les bons fichiers audio |
| N23 | Le niveau Héros est verrouillé sans Aventurier complété | Le cadenas est visible avec un message explicatif |
| N23b | Le niveau Aventurier est toujours accessible | L'onglet est cliquable quel que soit le profil |

Voir aussi : Dashboard enfant, Règles de grammaire

---

### 11 — Boutique

Description : La boutique permet d'acheter des cosmétiques (thèmes, flammes, titres, animations) et des consommables (bouclier de flamme, double pièces) avec les pièces gagnées.

Parcours :
1. Ouverture de la boutique → screenshot
2. Onglet Cosmétique → screenshot
3. Onglet Boost → screenshot
4. Achat d'un item → popup de confirmation → screenshot
5. Item installé → screenshot

Règles :

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| S01 | L'achat déduit les pièces | Le solde diminue du prix exact après achat |
| N16 | Le double pièces dure 5 sessions | Le compteur décrémente à chaque session jouée |
| N17 | Le double pièces est verrouillé 1 semaine | On ne peut pas acheter deux fois la même semaine |

Voir aussi : Économie et récompenses, Personnages, Images mystère

---

### 12 — Personnages

Description : L'enfant peut acheter des personnages qui l'accompagnent pendant les quiz. Chaque personnage a 10 émotions différentes qui s'activent selon les événements du jeu.

Parcours :
1. Onglet Persos dans la boutique → screenshot
2. Personnage non possédé (silhouette) → screenshot
3. Achat d'un personnage → toast "3 émotions offertes" → screenshot
4. Grille des émotions → screenshot
5. Personnage dans le quiz → screenshot

Règles :

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| S02 | Un personnage acheté est marqué "Possédé" | La carte affiche "Possédé" à la place du prix |
| S03 | On peut équiper une émotion | Après achat, l'émotion est sélectionnable |
| K01 | 14 personnages sont disponibles | Tous les noms sont visibles dans la boutique |
| K02 | Les anciens personnages ont été retirés | Grenouille, Licorne et Phénix n'apparaissent plus |
| K03 | 10 émotions par personnage | Marche, dodo, assis, coucou, bisou, applaudissement, victoire, danse, surprise, réflexion |
| K04 | Les sprites s'affichent correctement | Chaque personnage se charge sans erreur |
| N12d | Si une émotion n'est pas possédée, le personnage marche | Le personnage retombe sur l'animation de marche |

Voir aussi : Boutique, Quiz guidé

---

### 13 — Images mystère

Description : L'enfant peut acheter des fragments d'image mystère pour révéler progressivement une illustration. Maximum 2 fragments par jour, sur toutes les images confondues.

Parcours :
1. Section Image mystère dans la boutique → screenshot
2. Achat d'un fragment → tuile révélée → screenshot
3. Image complète → screenshot

Règles :

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| N18 | Maximum 2 morceaux par jour | Le 3e achat est refusé même si les pièces suffisent |
| N19 | Révélation progressive en 6 tuiles | Les tuiles se révèlent dans l'ordre, la dernière n'est jamais en premier |

Voir aussi : Boutique, Économie et récompenses

---

### 14 — Économie et récompenses

Description : Les pièces sont la monnaie du jeu. Elles sont gagnées par les quiz, les bonus et les paliers de flamme. Elles servent à acheter dans la boutique. Les popups de récompense célèbrent les accomplissements.

Parcours :
1. Pièces gagnées en fin de session → screenshot
2. Popup montée de niveau (Argent) → screenshot
3. Popup Couronne gagnée → screenshot
4. Popup Diamant obtenu → screenshot
5. Popup palier de flamme (7 jours) → screenshot
6. Popup bonus de bienvenue → screenshot

Règles :

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| N01 | Les pièces suivent le barème | 60-79% → 5, 80-99% → 20, 100% → 30 |
| N02 | Le bonus de bienvenue est unique | 200 pièces à la première session réussie, jamais après |
| N03 | Le bonus du jour est quotidien | +10 pièces pour la première session réussie du jour |
| N11 | Les paliers de flamme donnent les bonnes récompenses | 7j/100, 14j/200, 30j/350, 60j/500, 100j/1000 |

Voir aussi : Écran de fin de session, Flamme et série, Boutique

---

### 15 — Coaching et messages

Description : Un bandeau de motivation s'affiche sur le dashboard avec un message contextuel. Le message dépend de la situation du joueur : nouveau, en progression, flamme en danger, proche d'un palier, etc.

Parcours :
1. Message de bienvenue (nouveau joueur) → screenshot
2. Message de progression (proche de la Couronne) → screenshot
3. Alerte flamme en danger → screenshot
4. Suggestion d'achat (assez de pièces) → screenshot

Règles :

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| C01 | Un nouveau joueur voit le message de bienvenue | Le message "premier quiz" s'affiche quand aucune session n'a été faite |
| C02 | Un message déjà vu ne réapparaît pas | Après affichage, il ne revient plus |
| C03 | La flamme en danger alerte après 16h | Le soir, si le joueur n'a pas joué et a une flamme active, l'alerte apparaît |
| C04 | Pas d'alerte flamme avant 16h | L'alerte n'apparaît pas avant 16h |
| C05 | Les messages uniques sont marqués définitivement | Un message unique ne revient jamais |
| C06 | Les messages récurrents peuvent revenir | Un message récurrent peut réapparaître plus tard |
| C07 | Le compteur de messages repart à zéro chaque jour | Le lendemain, le compteur est réinitialisé |
| C08 | L'écran de fin ne montre que certains messages | Seuls les messages de progression apparaissent après un quiz |
| C09 | Le message de bienvenue est réservé au dashboard | Il n'apparaît jamais sur l'écran de fin |
| C10 | Le message le plus prioritaire gagne | Quand deux messages sont éligibles, le plus prioritaire est choisi |
| C11 | Assez de pièces sans personnage → suggestion | Le joueur avec 250+ pièces et 0 personnage reçoit une suggestion |
| C12 | Longue série sans bouclier → alerte | Le joueur avec 7+ jours et 0 bouclier voit un message d'alerte |
| C13 | Perte de la flamme → réconfort | Le joueur dont la flamme est tombée voit un encouragement |
| C14 | Le total de sessions est bien calculé | La somme des sessions de toutes les règles est correcte |
| C15 | Seuls les personnages sont comptés | Les émotions et thèmes ne comptent pas comme personnages |
| C16 | Les émotions sont filtrées par personnage | Les émotions du dragon ne comptent pas dans celles du panda |
| N13 | Nudge matin avec flamme active | Le matin sans session et avec une flamme, un message de rappel est affiché |
| N33 | Le personnage associé à une règle est stable par jour | Le même personnage est affiché pour la même règle le même jour |

Voir aussi : Dashboard enfant, Flamme et série

---

### 16 — Tableau de bord parent

Description : Le parent voit la progression de chaque enfant (flamme, règles maîtrisées, pièces), peut modifier les profils, configurer le code PIN et gérer les sauvegardes.

Parcours :
1. Vue d'ensemble des enfants → screenshot
2. Stats d'un enfant (flamme, règles) → screenshot
3. Modification d'un profil → screenshot
4. Gestion des sauvegardes → screenshot

Règles :

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| N26 | Les données sont isolées par enfant | Chaque enfant a sa propre progression |
| N28 | Le réglage du nombre de questions fonctionne | La valeur est enregistrée et utilisée |
| N29 | Les sauvegardes sont créées automatiquement | Après une session, un snapshot est sauvé |
| N30 | Les sauvegardes sont restaurables | Un backup relu retourne les mêmes données |

Voir aussi : Gestion des enfants, Code PIN parental

---

### 17 — Code PIN parental

Description : Le parent peut configurer un code à 4 chiffres que l'enfant doit saisir pour accéder au tableau de bord parent. Le code est stocké de manière sécurisée et un verrouillage progressif empêche les tentatives répétées.

Parcours :
1. Configuration du code PIN → screenshot
2. Confirmation du code (saisie deux fois) → screenshot
3. Saisie du code depuis l'app enfant → screenshot
4. Mauvais code → message d'erreur → screenshot
5. Verrouillage après tentatives → screenshot

Règles :

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| P01 | "Demander à Papa" est visible si un code est actif | Le bouton n'apparaît que quand un code a été configuré |
| P02 | Le bon code ramène au jeu | La saisie correcte sauvegarde la flamme et affiche le dashboard |
| P03 | Le mauvais code affiche une erreur | Un message d'erreur s'affiche avec verrouillage progressif |
| P04 | Le code doit être confirmé à la création | Il faut retaper le même code sinon erreur |
| P05 | Le code n'est jamais stocké en clair | Seul un hash sécurisé est enregistré |
| N31 | Le compteur d'échecs s'incrémente | Après un mauvais code, le compteur monte et le verrouillage s'active |
| N31b | Le verrouillage est progressif | 1 échec → 15s, 2 → 30s, plafonné à 1 heure |

Voir aussi : Tableau de bord parent

---

### 18 — Pages publiques et SEO

Description : Les pages publiques permettent aux parents de découvrir PrimoLingo via Google. Chaque règle a sa propre page avec une explication, un mini-quiz gratuit de 2 questions et un appel à l'inscription.

Parcours :
1. Page d'accueil marketing → screenshot
2. Index des règles → screenshot
3. Page d'une règle (a/à/as) → screenshot
4. Mini-quiz : question → screenshot
5. Mini-quiz : résultat + CTA → screenshot

Règles :

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| SEO01 | L'index affiche 20 règles | /regles montre 20 liens de règles avec badges niveau |
| SEO02 | Le titre est orienté parent | Le h1 mentionne "enfant" ou "aider" |
| SEO03 | La fiche mémo est visible | Le tableau forme/test/exemple est affiché |
| SEO04 | Le mini-quiz fonctionne de bout en bout | Start → Q1 → feedback → Q2 → score → CTA |
| SEO05 | Les balises SEO sont correctes | title, description, canonical, og:title sont présents |
| SEO06 | La navigation interne fonctionne | Clic carte → page, breadcrumb → retour, 404 → redirect |

Voir aussi : Inscription et connexion

---

### 19 — CI/CD et politique de tests

Description : Avant chaque mise en production, une série de vérifications automatiques est lancée pour garantir que l'app fonctionne correctement. Aucun déploiement ne peut avoir lieu si une vérification échoue.

#### Commandes

| Commande | Quand l'utiliser | Ce qu'elle vérifie |
|----------|-----------------|-------------------|
| `npm run test:unit` | Après modification des calculs ou du coaching | Les calculs de pièces, de flamme, de niveaux et les messages de coaching |
| `npm run test:e2e` | Après modification de l'interface | Les parcours utilisateur complets en navigateur simulé |
| `npm run test:all` | Avant un gros changement | Tout : calculs + interface |
| `npm run deploy` | Pour mettre en production | Vérifie tout, construit l'app, teste contre la version finale, puis déploie |
| `npm run deploy:raw` | Urgence uniquement | Déploie sans vérification — à éviter |

#### Ce qui est vérifié avant chaque déploiement

1. **Qualité du code** — Le code ne contient pas d'erreur de syntaxe ou de variable inutilisée.
2. **Construction** — L'app se construit correctement pour la production.
3. **Calculs** — Les pièces, les niveaux, la flamme et les messages de coaching fonctionnent conformément aux règles.
4. **Pages publiques** — Les 20 pages de règles SEO s'affichent correctement, le mini-quiz fonctionne, les balises SEO sont présentes.

#### Ce qui est vérifié manuellement (suite complète)

Les parcours qui nécessitent un profil enfant (dashboard, quiz, boutique, personnages, dictée, PIN) sont vérifiés en local via `npm run test:all`. Ils ne font pas partie du déploiement automatique car ils nécessitent un état local simulé.

#### Tests par domaine

| Domaine | Tests automatiques (pre-deploy) | Tests manuels (suite complète) |
|---------|-------------------------------|-------------------------------|
| Coaching et messages | C01-C16 | — |
| Calculs et progression | N01-N33 | — |
| Stats | T01-T04 | — |
| Pages SEO | SEO01-SEO06 | — |
| Émotions et personnages | — | E01-E06, K01-K04 |
| Boutique et quiz | — | S01-S07 |
| Dictée | — | D01-D06 |
| PIN parental | — | P01-P05 |
| Audio | — | A01-A03 |
| Progression E2E | — | N14, N14b, N15, N23-N25 |
| Parent | — | N26-N31 |

---

## Phase 3 — Screenshots Playwright

### 3.1 Script de capture

Créer un script Playwright dédié `docs/capture-screenshots.js` qui :

- ouvre chaque parcours en mobile 390x844 ;
- prend les screenshots listés ci-dessus ;
- les enregistre dans `docs/screenshots/` avec des noms stables ;
- peut être relancé à tout moment pour mettre à jour les captures.

### 3.2 Pages qui nécessitent un état

Pour les pages enfant (dashboard, quiz, boutique, etc.), le script doit :

- injecter un état localStorage minimal via Playwright (profil de test) ;
- naviguer sur `/play/local-child` ;
- capturer les différents écrans.

Pour les pages publiques (landing, SEO), pas besoin d'état.

### 3.3 Liste des screenshots

| Fichier | Page | Description |
|---------|------|-------------|
| `01-login.png` | /login | Page de connexion |
| `03-dashboard-accueil.png` | /play/local-child | Dashboard initial |
| `03-dashboard-flamme.png` | /play/local-child | Header avec flamme et pièces |
| `04-flamme-palier.png` | /play/local-child | Popup palier 7 jours |
| `04-retour-absence.png` | /play/local-child | Écran de retour |
| `05-regles-liste.png` | /play/local-child | Liste des règles |
| `05-regles-memo.png` | /play/local-child | Fiche mémo ouverte |
| `06-quiz-guide-question.png` | /play/local-child | Question avec pavé |
| `06-quiz-guide-feedback.png` | /play/local-child | Feedback après réponse |
| `09-fin-session-score.png` | /play/local-child | Score de fin |
| `09-fin-session-pieces.png` | /play/local-child | Détail des pièces |
| `10-dictee-onglet.png` | /play/local-child | Onglet dictée |
| `11-boutique-cosmetique.png` | /play/local-child | Boutique cosmétique |
| `11-boutique-boost.png` | /play/local-child | Boutique boost |
| `12-persos-liste.png` | /play/local-child | Liste des personnages |
| `13-mystere-grille.png` | /play/local-child | Grille image mystère |
| `15-coaching-message.png` | /play/local-child | Bandeau motivation |
| `16-parent-dashboard.png` | /parent | Tableau de bord parent |
| `17-pin-saisie.png` | /play/local-child | Saisie du code PIN |
| `18-seo-index.png` | /regles | Index des règles |
| `18-seo-regle.png` | /regles/a-a-as | Page d'une règle |
| `18-seo-quiz.png` | /regles/a-a-as | Mini-quiz en cours |
| `18-landing.png` | / | Page d'accueil |

---

## Phase 4 — Vérification

### 4.1 Vérifier le serveur docs

- `npm run dev` lance le serveur
- `/docs` affiche le sommaire
- Chaque lien mène à une page rendue en HTML
- Les images sont visibles
- Les tableaux de règles sont lisibles
- `/docs` n'existe PAS en production (`npm run build` + `vite preview`)

### 4.2 Vérifier la couverture

- Chaque ID de test du registre apparaît dans au moins une page de la doc
- Chaque règle métier importante a un ID de test associé
- Les domaines sans test sont explicitement mentionnés comme non couverts

### 4.3 Vérifier les screenshots

- Relancer `node docs/capture-screenshots.js`
- Toutes les images sont générées
- Les images correspondent aux parcours décrits

---

## Ordre d'implémentation

1. Créer le dossier `docs/` et `docs/screenshots/`.
2. Implémenter le serveur de docs (middleware Vite ou plugin).
3. Créer `docs/index.md` (sommaire).
4. Rédiger les 19 pages Markdown.
5. Créer le script de capture Playwright.
6. Lancer les captures pour générer les screenshots.
7. Insérer les screenshots dans les pages Markdown.
8. Vérifier le rendu complet sur `/docs`.
9. Vérifier que `/docs` n'existe pas en prod.

---

## Définition de terminé

- 19 pages de documentation fonctionnelle accessibles sur `/docs` en dev.
- Chaque page a des screenshots mobile de référence.
- Chaque règle métier est identifiée par un ID de test avec critère de succès.
- La page CI/CD décrit quels tests sont lancés quand.
- `/docs` n'est pas accessible en production.
- Les screenshots peuvent être régénérés par un script Playwright.

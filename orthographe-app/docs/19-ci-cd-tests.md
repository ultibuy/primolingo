# Politique de tests et déploiement

## Description

Avant chaque mise en production, une série de vérifications automatiques est lancée pour garantir que l'app fonctionne correctement. Aucun déploiement ne peut avoir lieu si une vérification échoue. Certains tests sont lancés automatiquement, d'autres doivent être lancés manuellement car ils nécessitent un profil enfant simulé.

## Commandes disponibles

| Commande | Quand l'utiliser | Ce qu'elle vérifie |
|----------|-----------------|-------------------|
| `test:unit` | Après modification des calculs ou du coaching | Les calculs de pièces, de flamme, de niveaux et les messages de coaching |
| `test:e2e` | Après modification de l'interface | Les parcours utilisateur complets en navigateur simulé |
| `test:all` | Avant un gros changement | Tout : calculs + interface |
| `test:auth` | Après modification du flux d'authentification | L01–L07 : connexion, inscription, redirection, hachage PIN |
| `test:auth:real` | Validation Firebase réelle (compte test) | L03b : connexion e-mail effective et redirection vers `/parent` |
| `deploy` | Pour mettre en production | Vérifie tout, construit l'app, teste contre la version finale, puis déploie |
| `deploy:raw` | Urgence uniquement | Déploie sans vérification — à éviter |

## Ce qui est vérifié automatiquement avant chaque déploiement

Le déploiement standard lance quatre étapes dans l'ordre. Si l'une échoue, le déploiement s'arrête.

1. **Qualité du code** — Le code ne contient pas d'erreur de syntaxe ou de variable inutilisée. Commande : `npm run lint`.
2. **Construction** — L'app se construit correctement pour la production.
3. **Calculs** — Les pièces, les niveaux, la flamme et les messages de coaching fonctionnent conformément aux règles.
4. **Pages publiques** — Les 20 pages de règles s'affichent correctement, le mini-quiz fonctionne, les balises de référencement sont présentes.

## Ce qui doit être vérifié manuellement

Les parcours qui nécessitent un profil enfant (dashboard, quiz, boutique, personnages, dictée, code PIN) sont vérifiés en local via la commande `test:all`. Ils ne font pas partie du déploiement automatique car ils nécessitent un état local simulé qui ne peut pas être reproduit sur le serveur de déploiement.

La suite manuelle doit être lancée avant tout changement important touchant l'interface ou les mécaniques de jeu.

Quand un changement est important, il faut aussi demander à l'utilisateur si la documentation fonctionnelle doit être mise à jour. Si oui, la page de documentation concernée doit être mise à jour dans la même intervention.

## Tests par domaine

### Coaching et messages

| ID | Exécution | Fichier | Règle vérifiée |
|----|-----------|---------|----------------|
| C01 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `coaching-banner.test.js` | Un nouvel utilisateur voit le message de bienvenue |
| C02 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `coaching-banner.test.js` | Un message déjà vu ne réapparaît pas |
| C03 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `coaching-banner.test.js` | La flamme en danger alerte après 16h |
| C04 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `coaching-banner.test.js` | Pas d'alerte flamme avant 16h |
| C05 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `coaching-banner.test.js` | Les messages uniques sont marqués définitivement |
| C06 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `coaching-banner.test.js` | Les messages récurrents peuvent revenir |
| C07 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `coaching-banner.test.js` | Le compteur de messages repart à zéro chaque jour |
| C08 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `coaching-banner.test.js` | L'écran de fin ne montre que certains messages |
| C09 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `coaching-banner.test.js` | Le message de bienvenue est réservé au dashboard |
| C10 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `coaching-banner.test.js` | Le message le plus prioritaire gagne |
| C11 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `coaching-banner.test.js` | Assez de pièces sans personnage → suggestion d'achat |
| C12 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `coaching-banner.test.js` | Longue série sans bouclier → alerte urgente |
| C13 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `coaching-banner.test.js` | Perte du streak → message de réconfort |
| C14 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `coaching-banner.test.js` | Le total de sessions est bien calculé |
| C15 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `coaching-banner.test.js` | Seuls les personnages sont comptés |
| C16 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `coaching-banner.test.js` | Les émotions sont filtrées par personnage |

### Inscription et connexion

Les tests L01–L07 s’exécutent sans compte Firebase réel : le flag `ortho_disable_dev_auth` désactive l’auto-login localhost pour que la vraie page de connexion s’affiche. Le test L03b nécessite un compte Firebase de test (`test-parent@primolingo.fr` / `Test1234!`) et s’active via `AUTH_REAL=1`.

| ID | Exécution | Fichier | Règle vérifiée |
|----|-----------|---------|----------------|
| L01 | <span class="test-chip test-chip-predeploy">Predeploy (e2e)</span> | `auth-flow.test.js` | Deux méthodes de connexion : Google et e-mail/mot de passe |
| L02 | <span class="test-chip test-chip-predeploy">Predeploy (e2e)</span> | `auth-flow.test.js` | La première connexion crée automatiquement le compte |
| L03 | <span class="test-chip test-chip-predeploy">Predeploy (e2e)</span> | `auth-flow.test.js` | La route `/parent` est protégée et redirige les anonymes vers `/login` |
| L03b | <span class="test-chip test-chip-manual">Manuel (AUTH_REAL=1)</span> | `auth-flow.test.js` | Connexion e-mail réelle avec le compte test mène au tableau de bord parent |
| L04 | <span class="test-chip test-chip-predeploy">Predeploy (e2e)</span> | `auth-flow.test.js` | La session reste active tant que le parent ne se déconnecte pas |
| L05 | <span class="test-chip test-chip-predeploy">Predeploy (e2e)</span> | `auth-flow.test.js` | Le code parental est haché avant stockage |
| L06 | <span class="test-chip test-chip-predeploy">Predeploy (e2e)</span> | `auth-flow.test.js` | Les erreurs de connexion sont affichées en français |
| L07 | <span class="test-chip test-chip-predeploy">Predeploy (e2e)</span> | `auth-flow.test.js` | Le CTA "Créer un compte gratuit" de la page d’accueil ouvre la page de connexion en mode inscription |

### Boutique et quiz

| ID | Exécution | Fichier | Règle vérifiée |
|----|-----------|---------|----------------|
| S01 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `personas-flow.test.js` | L'achat déduit les pièces |
| S02 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `personas-flow.test.js` | Un personnage acheté est marqué "Possédé" |
| S03 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `personas-flow.test.js` | On peut équiper une émotion |
| S04 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `personas-flow.test.js` | Le personnage est visible pendant le quiz |
| S05 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `personas-flow.test.js` | Le feedback de réponse s'affiche |
| S06 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `personas-flow.test.js` | Le personnage reste visible après réponse |
| S07 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `personas-flow.test.js` | Le mode direct affiche le bonus du jour |

### Émotions

| ID | Exécution | Fichier | Règle vérifiée |
|----|-----------|---------|----------------|
| E01 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `emotion-rules.test.js` | Dashboard sans session → le personnage dort |
| E02 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `emotion-rules.test.js` | Dashboard après quiz → le personnage marche |
| E03 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `emotion-rules.test.js` | Première question → le personnage fait coucou |
| E04 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `emotion-rules.test.js` | Bonne réponse → le personnage applaudit |
| E05 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `emotion-rules.test.js` | Tout premier quiz → le personnage dort |
| E06 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `emotion-rules.test.js` | Score bas → personnage hésitant |

### Dictée

| ID | Exécution | Fichier | Règle vérifiée |
|----|-----------|---------|----------------|
| D01 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `dictee-flow.test.js` | L'onglet Dictée est accessible |
| D02 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `dictee-flow.test.js` | "Commencer" lance la dictée |
| D03 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `dictee-flow.test.js` | "Écouter" joue le mot |
| D04 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `dictee-flow.test.js` | La phrase de contexte s'affiche |
| D05 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `dictee-flow.test.js` | Fermer retourne au bon onglet |
| D06 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `dictee-flow.test.js` | Les fichiers audio se chargent |

### Statistiques

| ID | Exécution | Fichier | Règle vérifiée |
|----|-----------|---------|----------------|
| T01 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `stats.test.js` | Profil vierge → tout à zéro |
| T02 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `stats.test.js` | Les sessions sont bien comptées |
| T03 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `stats.test.js` | Pas de doublon le même jour |
| T04 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `stats.test.js` | L'historique est limité à 30 jours |

### Code PIN parental

| ID | Exécution | Fichier | Règle vérifiée |
|----|-----------|---------|----------------|
| P01 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `pin-parental.test.js` | "Demander à Papa" visible si code actif |
| P02 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `pin-parental.test.js` | Bon code → retour au jeu |
| P03 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `pin-parental.test.js` | Mauvais code → erreur |
| P04 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `pin-parental.test.js` | Le code doit être saisi deux fois |
| P05 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `pin-parental.test.js` | Le code n'est jamais stocké en clair |

### Audio

| ID | Exécution | Fichier | Règle vérifiée |
|----|-----------|---------|----------------|
| A01 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `play-word-button.test.js` | Les barres réagissent à la lecture |
| A02 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `play-word-button.test.js` | Le bouton change de couleur |
| A03 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `play-word-button.test.js` | L'animation s'arrête toute seule |

### Personnages

| ID | Exécution | Fichier | Règle vérifiée |
|----|-----------|---------|----------------|
| K01 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `characters-moods.test.js` | 17 personnages disponibles |
| K02 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `characters-moods.test.js` | Les anciens personnages ont été retirés |
| K03 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `characters-moods.test.js` | 10 émotions par personnage |
| K04 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `characters-moods.test.js` | Les sprites s'affichent correctement |

### Calculs et progression

| ID | Exécution | Fichier | Règle vérifiée |
|----|-----------|---------|----------------|
| N01 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | Calcul des pièces selon le score |
| N02 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | Bonus bienvenue 200 pièces (1re session ≥60 %) |
| N03 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | Bonus du jour +10 pièces |
| N04 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | Progression de niveau Bronze→Argent→Couronne |
| N05 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | Diamant : 3 sessions consécutives ≥90 % requis |
| N06 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | SM-2 : santé du diamant (0→1) |
| N07 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | SM-2 : planification de la prochaine révision |
| N08 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | SM-2 : échec de révision → retour couronne |
| N09 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | Streak : incrémentation et reset après 2 jours |
| N10 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | Streak : bouclier non auto-consommé |
| N11 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | Streak milestones (7/14/30/60/100 j) |
| N16 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | Double pièces : x2 pendant 5 sessions |
| N17 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | Double pièces : verrouillé 1 semaine |
| N18 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | Images mystère : 2 morceaux par jour max |
| N19 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | Images mystère : révélation progressive 6 tuiles |
| N22 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | Question Mystery : remplace la prochaine question |
| N32 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | Sélection de questions : pas de répétition |
| N12d | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | ProgressBar : resolveCharacterMood fallback |
| N13 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | Coaching arc14.0 : nudge matin |
| N33 | <span class="test-chip test-chip-predeploy">Predeploy (unit)</span> | `engine.test.js` | Assignation personnage/règle stable par jour |

### Parcours complets

| ID | Exécution | Fichier | Règle vérifiée |
|----|-----------|---------|----------------|
| N14 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `progression-flow.test.js` | ReturnScreen : apparaît après 2+ jours d'inactivité |
| N14b | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `progression-flow.test.js` | ReturnScreen : absent si joué hier |
| N15 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `progression-flow.test.js` | ReturnScreen : "Sauver la flamme" → retour dashboard |
| N23 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `progression-flow.test.js` | Dictée : niveau HÉROS verrouillé sans Aventurier |
| N23b | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `progression-flow.test.js` | Dictée : niveau AVENTURIER toujours accessible |
| N24 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `progression-flow.test.js` | EndScreen : section pièces visible après quiz |
| N25 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `progression-flow.test.js` | EndScreen : "Prochain objectif" visible |
| N25b | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `end-screen-redesign.test.js` | EndScreen redesign : layout responsive |

### Tableau de bord parent

| ID | Exécution | Fichier | Règle vérifiée |
|----|-----------|---------|----------------|
| N26 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `parent-dashboard.test.js` | Multi-enfant : données isolées par enfant |
| N28 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `parent-dashboard.test.js` | Admin : réglage du nombre de questions |
| N29 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `parent-dashboard.test.js` | Backup quotidien : créé automatiquement |
| N30 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `parent-dashboard.test.js` | Backup restauration : snapshot lisible |
| N31b | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `parent-dashboard.test.js` | PIN : formule de verrouillage progressif (unit) |
| N31 | <span class="test-chip test-chip-manual">Suite manuelle (e2e)</span> | `parent-dashboard.test.js` | PIN : compteur d'échecs incrémenté après mauvais code |

### Pages publiques et SEO

| ID | Exécution | Fichier | Règle vérifiée |
|----|-----------|---------|----------------|
| SEO01 | <span class="test-chip test-chip-predeploy">Predeploy (e2e)</span> | `seo-pages.test.js` | Index des règles : 20 cartes affichées |
| SEO02 | <span class="test-chip test-chip-predeploy">Predeploy (e2e)</span> | `seo-pages.test.js` | Page règle : h1 orienté parent |
| SEO03 | <span class="test-chip test-chip-predeploy">Predeploy (e2e)</span> | `seo-pages.test.js` | Page règle : memo card visible |
| SEO04 | <span class="test-chip test-chip-predeploy">Predeploy (e2e)</span> | `seo-pages.test.js` | Mini-quiz : flow complet |
| SEO05 | <span class="test-chip test-chip-predeploy">Predeploy (e2e)</span> | `seo-pages.test.js` | Meta tags SEO corrects |
| SEO06 | <span class="test-chip test-chip-predeploy">Predeploy (e2e)</span> | `seo-pages.test.js` | Navigation interne fonctionne |

## Règles orphelines

Ces règles sont documentées, mais aucune entrée correspondante n'existe encore dans le registre de tests.

| Page | ID | Règle sans test |
|------|----|-----------------|
| `02-gestion-enfants.md` | — | Le prénom de l'enfant s'affiche dans le message d'accueil |
| `02-gestion-enfants.md` | — | Le retour parent demande le PIN |
| `05-regles-grammaire.md` | N05b | Les pourcentages ne sont jamais affichés à l'utilisateur |

## Voir aussi

- [Coaching et messages](./15-coaching-messages.md)
- [Pages publiques et SEO](./18-pages-publiques-seo.md)
- [Boutique](./11-boutique.md)

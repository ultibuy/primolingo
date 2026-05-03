# Gestion des enfants

## Description

Depuis son tableau de bord, le parent peut créer un ou plusieurs profils enfants. Chaque profil possède un prénom et un avatar emoji. L'enfant joue ensuite sur son propre espace, séparé de celui du parent.

## Parcours utilisateur

### 1. Ajouter un enfant

Le parent clique sur "Ajouter un enfant" depuis son tableau de bord. Un formulaire s'ouvre pour saisir le prénom et choisir un avatar.

### 2. Configurer le prénom et l'avatar

Le prénom est obligatoire. Il s'affichera dans le message d'accueil du dashboard enfant (par exemple : "Bonjour Damien !"). Le parent peut le modifier à tout moment.

L'avatar est un emoji choisi parmi les 12 options suivantes :

| Emoji | Nom |
|-------|-----|
| 🦊 | Renard |
| 🐱 | Chat |
| 🦁 | Lion |
| 🐸 | Grenouille |
| 🐵 | Singe |
| 🦄 | Licorne |
| 🐲 | Dragon |
| 🦅 | Aigle |
| 🐺 | Loup |
| 🐼 | Panda |
| 🦈 | Requin |
| 🐙 | Pieuvre |

L'avatar s'affiche sur la carte enfant dans le dashboard parent et dans le header du dashboard enfant.

### 3. Accéder au profil enfant

Une fois le profil créé, le parent voit une carte par enfant sur son tableau de bord. Il peut basculer vers l'espace de jeu de l'enfant ou revenir à la configuration.

### 4. Retour sur le dashboard parent depuis l'app enfant

Depuis le dashboard enfant, le bouton "Retourner sur l'app parent" demande le code parental (PIN à 4 chiffres) avant de naviguer vers le tableau de bord parent. Si aucun code parental n'est défini, la navigation est directe.

Cela empêche l'enfant d'accéder seul aux réglages parentaux.

## Réglages parent par enfant

Le parent dispose des réglages suivants pour chaque profil enfant, accessibles via l'icône engrenage sur la carte enfant :

- **Images mystère activées** : le parent peut activer ou désactiver individuellement les images de sa bibliothèque pour chaque enfant (cases à cocher).

- **Questions signalées** : si l'enfant signale une question douteuse pendant un quiz (bouton drapeau), le parent peut les consulter, les télécharger en fichier texte, ou les effacer.

- **Restauration de sauvegarde** : le système crée automatiquement une sauvegarde quotidienne de la progression de chaque enfant (pièces, flamme, boutique, règles). Le parent peut restaurer la progression à un état précédent en choisissant parmi les 30 derniers jours de sauvegardes. Chaque sauvegarde affiche la date, le nombre de pièces et les jours de flamme au moment de la sauvegarde.

## Règles

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| N28 | Le prénom de l'enfant s'affiche dans le message d'accueil | Le dashboard enfant affiche "Bonjour [prénom] !" en haut de l'écran |
| — | Le retour parent demande le PIN | Le bouton "Retourner sur l'app parent" vérifie le code parental avant de naviguer |

## Voir aussi

- [Inscription et connexion](01-inscription-connexion.md) — Créer le compte parent et configurer le code parental
- [Dashboard enfant](03-dashboard-enfant.md) — Ce que l'enfant voit après la configuration
- [Code PIN parental](17-code-pin-parental.md) — Détail du verrouillage par code

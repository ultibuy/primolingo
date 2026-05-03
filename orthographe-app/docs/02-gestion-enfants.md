# Gestion des enfants

## Description

Depuis son tableau de bord, le parent peut créer un ou plusieurs profils enfants. Chaque profil possède un prénom. L'enfant joue ensuite sur son propre espace, séparé de celui du parent.

## Parcours utilisateur

### 1. Ajouter un enfant

Le parent clique sur "Ajouter un enfant" depuis son tableau de bord. Un formulaire s'ouvre pour saisir le prénom de l'enfant.

### 2. Configurer le prénom

Le prénom est obligatoire. Il s'affichera dans le message d'accueil du dashboard enfant (par exemple : "Bonjour Damien !"). Le parent peut le modifier à tout moment.

### 3. Accéder au profil enfant

Une fois le profil créé, le parent voit une carte par enfant sur son tableau de bord. Il peut basculer vers l'espace de jeu de l'enfant ou revenir à la configuration.

![Carte enfant dans le dashboard parent](screenshots/parent-dashboard.png)

## Règles

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| N28 | Le prénom de l'enfant s'affiche dans le message d'accueil | Le dashboard enfant affiche "Bonjour [prénom] !" en haut de l'écran |

## Voir aussi

- [Inscription et connexion](01-inscription-connexion.md) — Créer le compte parent et configurer le code parental
- [Dashboard enfant](03-dashboard-enfant.md) — Ce que l'enfant voit après la configuration

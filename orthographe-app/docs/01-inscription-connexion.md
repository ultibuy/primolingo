# Inscription et connexion

## Description

PrimoLingo propose deux méthodes de connexion : Google et e-mail/mot de passe. Le parent se connecte, accède à son tableau de bord, et crée ensuite un ou plusieurs profils enfants.

## Parcours utilisateur

### 1. Arrivée sur la page de connexion

La page de connexion propose deux options : se connecter avec Google ou avec un e-mail et un mot de passe. Un lien permet de basculer entre le mode connexion et le mode création de compte.

![Page de connexion](screenshots/01-login-email.png)

### 2. Connexion avec Google

L'utilisateur clique sur "Se connecter avec Google" et est redirigé vers la page de connexion Google. Il choisit son compte ou en crée un. Aucune information personnelle au-delà du nom et de l'adresse e-mail n'est demandée.

### 3. Connexion par e-mail

L'utilisateur saisit son adresse e-mail et son mot de passe, puis clique sur "Se connecter". Si les identifiants sont corrects, il est redirigé vers le tableau de bord parent.

En cas d'erreur, un message en français s'affiche : mot de passe incorrect, compte inexistant, trop de tentatives, etc.

### 4. Création de compte par e-mail

En cliquant sur "Pas encore de compte ? Créer un compte", le formulaire bascule en mode inscription. Le bouton Google affiche "S'inscrire avec Google" et le bouton e-mail affiche "Créer mon compte". Le mot de passe doit faire au moins 6 caractères.

![Mode inscription](screenshots/01-register-email.png)

### 5. Redirection vers le tableau de bord parent

Une fois authentifié (Google ou e-mail), le parent est automatiquement redirigé vers son tableau de bord. S'il se connecte pour la première fois, une modale l'invite à définir son code parental.

### 6. Déconnexion

Le parent peut se déconnecter à tout moment depuis le tableau de bord. La déconnexion ramène à la page d'accueil.

## Code parental

### À quoi sert le code parental ?

Le code parental est un code à 4 chiffres défini par le parent depuis son tableau de bord. Il sert à protéger certaines actions sensibles dans l'app enfant :

- **Sauver la flamme après une absence** : quand l'enfant revient après un jour sans quiz, l'app propose de récupérer sa série (streak). Pour éviter que l'enfant ne le fasse seul sans effort, le code parental est demandé. Le parent décide si la flamme mérite d'être sauvée.
- **Accéder au tableau de bord parent** : depuis l'app enfant, le bouton "Retourner sur l'app parent" demande le code parental pour empêcher l'enfant d'accéder aux réglages.

### Configuration

Le parent définit son code depuis le tableau de bord parent en cliquant sur "Code parental". Une modale apparaît avec un clavier à 4 cases.

![Définir le code parental](screenshots/01-code-parental-setup.png)

### Saisie côté enfant

Quand le code est requis (récupération de flamme, retour parent), l'enfant voit un écran de saisie et doit demander à son parent de taper le code.

![Saisie du code parental](screenshots/01-code-parental-saisie.png)

### Sécurité

- Le code est haché (SHA-256 + salt) avant d'être stocké. Le PIN en clair n'est jamais enregistré.
- Si aucun code n'est défini, les actions protégées restent accessibles sans vérification.

## Règles

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| — | Deux méthodes de connexion : Google et e-mail/mot de passe | Les deux options sont visibles sur la page de connexion |
| — | La première connexion crée automatiquement le compte | Le parent n'a aucune étape d'inscription supplémentaire (Google) ou crée son compte via le formulaire (e-mail) |
| — | Après connexion, le parent arrive sur son tableau de bord | La redirection est immédiate, sans page intermédiaire |
| — | La session reste active tant que le parent ne se déconnecte pas | En revenant sur l'app, le parent est toujours connecté |
| — | Le code parental est haché avant stockage | Aucun PIN en clair dans Firestore ou localStorage |
| — | Les erreurs de connexion sont affichées en français | Mot de passe incorrect, compte inexistant, etc. |

## Voir aussi

- [Gestion des enfants](02-gestion-enfants.md) — Créer le premier profil enfant
- [Tableau de bord parent](16-tableau-bord-parent.md) — Vue complète du tableau de bord parent

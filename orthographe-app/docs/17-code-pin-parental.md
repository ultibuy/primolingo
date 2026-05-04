# Code PIN parental

## Description

Le parent peut proteger l'acces a son tableau de bord en configurant un code a 4 chiffres. Depuis l'app de l'enfant, un bouton "Demander a Papa" permet de saisir ce code pour acceder aux reglages parentaux. Le code est stocke de maniere securisee et un verrouillage progressif empeche les tentatives repetees.

## Parcours utilisateur

### Creer le code PIN

Depuis le tableau de bord parent, le parent accede aux reglages de securite et definit un code a 4 chiffres. Pour eviter les erreurs, le code doit etre saisi deux fois. Si les deux saisies ne correspondent pas, un message d'erreur invite le parent a recommencer.

![Creation du code PIN](screenshots/pin-saisie.png)

### Saisir le code depuis l'app enfant

Quand un code PIN est configure, un bouton "Demander a Papa" apparait dans l'app de l'enfant. En cliquant dessus, un ecran de saisie s'affiche. L'enfant (ou le parent a cote de lui) tape le code a 4 chiffres.

![Saisie du code PIN](screenshots/pin-saisie.png)

Si le code est correct, l'acces au tableau de bord parent est accorde et la flamme est sauvegardee.

### Mauvais code et verrouillage

Si le code saisi est incorrect, un message d'erreur s'affiche. Le compteur d'echecs augmente et un verrouillage temporaire s'active :

- 1er echec : verrouillage de 15 secondes
- 2e echec : verrouillage de 30 secondes
- Les echecs suivants allongent le delai, avec un plafond a 1 heure

Ce verrouillage progressif empeche l'enfant de tester tous les codes possibles.

![Erreur de saisie du code PIN](screenshots/pin-erreur.png)

### Stockage securise

Le code a 4 chiffres n'est jamais enregistre tel quel. Seul un hash accompagne d'un sel aleatoire est stocke. Meme en accedant aux donnees, il est impossible de retrouver le code original.

## Regles

| ID | Regle | Critere de succes |
|----|-------|-------------------|
| P01 | "Demander a Papa" est visible si un code est actif | Le bouton n'apparait que quand un code a ete configure |
| P02 | Le bon code ramene au jeu | La saisie correcte sauvegarde la flamme et affiche le dashboard |
| P03 | Le mauvais code affiche une erreur | Un message d'erreur s'affiche avec verrouillage progressif |
| P04 | Le code doit etre confirme a la creation | Il faut retaper le meme code sinon erreur |
| P05 | Le code n'est jamais stocke en clair | Seul un hash securise est enregistre |
| N31 | Le compteur d'echecs s'incremente | Apres un mauvais code, le compteur monte et le verrouillage s'active |
| N31b | Le verrouillage est progressif | 1 echec donne 15s, 2 echecs donnent 30s, plafond a 1 heure |

## Voir aussi

- [Tableau de bord parent](./02-gestion-enfants.md)

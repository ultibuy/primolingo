# Tableau de bord parent

## Description

Le tableau de bord parent est l'espace de pilotage de PrimoLingo. Le parent y crée les profils enfants, consulte leur progression, ajuste les réglages par enfant et gère les sauvegardes. Chaque enfant possède son propre espace de jeu, séparé des autres profils et du compte parent.

## Parcours utilisateur

### Vue d'ensemble

Après connexion, le parent arrive sur son tableau de bord. Il voit la liste de ses enfants avec, pour chacun, un résumé de progression : jours de flamme, règles travaillées ou maîtrisées, solde de pièces et accès à l'espace de jeu.

![Tableau de bord parent avec la liste des enfants](screenshots/parent-dashboard.png)

### Ajouter un enfant

Le parent clique sur "Ajouter un enfant" depuis le tableau de bord. Un formulaire permet de saisir le prénom et de choisir un avatar.

Le prénom est obligatoire. Il s'affiche ensuite dans le message d'accueil du dashboard enfant, par exemple : "Bonjour Damien !". Le parent peut le modifier à tout moment.

L'avatar s'affiche sur la carte enfant dans le dashboard parent et dans le header du dashboard enfant.

### Accéder au profil enfant

Une fois le profil créé, le parent voit une carte par enfant. Depuis cette carte, il peut lancer l'espace de jeu de l'enfant ou revenir aux réglages du profil.

### Consulter la progression

En sélectionnant un enfant, le parent consulte le détail de sa progression :

- les règles travaillées ;
- le niveau atteint pour chaque règle : Bronze, Argent, Couronne ou Diamant ;
- l'historique de la flamme ;
- le nombre de sessions jouées ;
- les pièces accumulées.

![Tableau de bord parent avec carte enfant](screenshots/parent-dashboard.png)

### Modifier un profil

Le parent peut changer le prénom d'un enfant et ajuster le nombre de questions par session. La valeur choisie est enregistrée et utilisée immédiatement dans les prochaines sessions de l'enfant.

### Retour depuis l'app enfant

Depuis le dashboard enfant, le bouton "Retourner sur l'app parent" demande le code parental à 4 chiffres avant de revenir au tableau de bord parent. Si aucun code parental n'est défini, la navigation est directe.

Ce verrouillage empêche l'enfant d'accéder seul aux réglages parentaux.

## Réglages parent par enfant

Les réglages sont accessibles depuis l'icône engrenage de la carte enfant.

- **Nombre de questions par session** : le parent choisit la durée des prochaines sessions de l'enfant.
- **Images mystère activées** : le parent active ou désactive individuellement les images de sa bibliothèque pour chaque enfant.
- **Questions signalées** : si l'enfant signale une question pendant un quiz, le parent peut la consulter, la télécharger en fichier texte ou l'effacer.
- **Restauration de sauvegarde** : le parent peut restaurer la progression à partir d'une sauvegarde quotidienne.

## Isolation des données

Chaque enfant a sa propre progression. Les données d'un enfant ne peuvent pas écraser celles d'un autre, même si plusieurs profils existent sur le même compte parent.

## Sauvegardes

Après chaque session jouée par l'enfant, une sauvegarde automatique est créée avec l'état complet de la progression : pièces, flamme, boutique, règles et niveaux. Ces sauvegardes sont conservées sur 30 jours glissants.

Le parent peut consulter une sauvegarde et la restaurer pour revenir à un état antérieur si nécessaire. Chaque sauvegarde affiche la date, le nombre de pièces et les jours de flamme au moment de la sauvegarde.

## Règles

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| N26 | Les données sont isolées par enfant | Chaque enfant a sa propre progression, impossible à écraser |
| N28 | Le réglage du nombre de questions fonctionne | La valeur saisie par le parent est enregistrée et utilisée |
| N29 | Les sauvegardes sont créées automatiquement | Après une session, un snapshot de la progression est sauvegardé |
| N30 | Les sauvegardes sont restaurables | Un backup relu retourne les mêmes pièces et la même flamme |
| — | Le prénom de l'enfant s'affiche dans le message d'accueil | Le dashboard enfant affiche "Bonjour [prénom] !" en haut de l'écran |
| — | Le retour parent demande le PIN | Le bouton "Retourner sur l'app parent" vérifie le code parental avant de naviguer |

## Voir aussi

- [Inscription et connexion](01-inscription-connexion.md) — Créer le compte parent et configurer le code parental
- [Dashboard enfant](03-dashboard-enfant.md) — Ce que l'enfant voit après la configuration
- [Images mystère](13-images-mystere.md) — Bibliothèque d'images activable par enfant
- [Code PIN parental](17-code-pin-parental.md) — Détail du verrouillage par code

# Tableau de bord parent

## Description

Le tableau de bord parent donne une vue d'ensemble de la progression de chaque enfant. Le parent y consulte la flamme, les regles maitrisees et les pieces accumulees. Il peut modifier les profils, ajuster les reglages et gerer les sauvegardes quotidiennes.

## Parcours utilisateur

### Vue d'ensemble

Apres connexion, le parent arrive sur son tableau de bord. Il voit la liste de ses enfants avec, pour chacun, un resume de la progression : nombre de jours de flamme, nombre de regles en cours ou maitrisees, et solde de pieces.

![Tableau de bord parent avec la liste des enfants](screenshots/parent-dashboard.png)

### Consulter un enfant

En cliquant sur un enfant, le parent accede au detail de sa progression : les regles travaillees avec leur niveau (Bronze, Argent, Couronne, Diamant), l'historique de la flamme et le nombre de sessions jouees.

![Tableau de bord parent avec carte enfant](screenshots/parent-dashboard.png)

### Modifier un profil

Le parent peut changer le prenom d'un enfant et ajuster le nombre de questions par session. La valeur choisie est enregistree et utilisee immediatement dans les prochaines sessions de l'enfant.

### Isolation des donnees

Chaque enfant a sa propre progression, entierement separee. Les donnees d'un enfant ne peuvent jamais ecraser celles d'un autre, meme en cas de manipulation.

### Sauvegardes

Apres chaque session jouee par l'enfant, une sauvegarde automatique est creee avec l'etat complet de la progression (pieces, flamme, niveaux). Ces sauvegardes sont conservees sur 30 jours glissants. Le parent peut consulter une sauvegarde et la restaurer pour revenir a un etat anterieur si necessaire.

## Regles

| ID | Regle | Critere de succes |
|----|-------|-------------------|
| N26 | Les donnees sont isolees par enfant | Chaque enfant a sa propre progression, impossible a ecraser |
| N28 | Le reglage du nombre de questions fonctionne | La valeur saisie par le parent est enregistree et utilisee |
| N29 | Les sauvegardes sont creees automatiquement | Apres une session, un snapshot de la progression est sauve |
| N30 | Les sauvegardes sont restaurables | Un backup relu retourne les memes pieces et la meme flamme |

## Voir aussi

- [Gestion des enfants](./02-gestion-enfants.md)
- [Code PIN parental](./17-code-pin-parental.md)
- [Images mystere](./13-images-mystere.md)

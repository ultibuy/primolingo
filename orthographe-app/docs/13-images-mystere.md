# Images mystere

## Description

L'enfant peut collectionner des images cachees en achetant leurs fragments un par un. Chaque image est composee de 6 tuiles qui se revelent progressivement. Le suspense est maintenu jusqu'au dernier morceau, et l'enfant ne peut acheter que 2 fragments par jour pour etaler le plaisir de la decouverte.

## Parcours utilisateur

### Decouvrir la collection

Depuis la boutique, l'enfant accede a la section des images mystere. Il y voit les images disponibles, chacune representee par une grille de 6 cases. Les cases deja revelees montrent un fragment de l'illustration ; les autres restent cachees.

### Acheter un fragment

Chaque fragment coute 60 pieces. L'enfant clique sur l'image de son choix et un nouveau morceau se revele. L'ordre de revelation est aleatoire, sauf le dernier fragment qui est fixe par l'image — c'est toujours le meme morceau qui se devoile en dernier pour maximiser l'effet de surprise.

![Grille d'une image mystere en cours de revelation](screenshots/mystere-grille.png)

### Limite quotidienne

L'enfant peut acheter au maximum 2 fragments par jour, toutes images confondues. Meme s'il a assez de pieces, le troisieme achat de la journee est refuse. Cette limite permet d'etaler la decouverte sur plusieurs jours et incite l'enfant a revenir.

### Images personnalisees

Les parents peuvent ajouter leurs propres images (photos de famille, dessins) depuis le tableau de bord parent. Ces images apparaissent ensuite dans la collection de l'enfant et se revelent de la meme facon.

## Regles

| ID | Regle | Critere de succes |
|----|-------|-------------------|
| N18 | Maximum 2 morceaux par jour | Le 3e achat de la journee est refuse meme si les pieces suffisent |
| N19 | Revelation progressive en 6 tuiles | Les tuiles se revelent dans l'ordre ; la derniere n'est jamais en premier |

## Voir aussi

- [Boutique](./11-boutique.md)
- [Economie et recompenses](./14-economie-recompenses.md)
- [Tableau de bord parent](./16-tableau-bord-parent.md)

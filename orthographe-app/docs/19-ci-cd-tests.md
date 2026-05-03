# Politique de tests et deploiement

## Description

Avant chaque mise en production, une serie de verifications automatiques est lancee pour garantir que l'app fonctionne correctement. Aucun deploiement ne peut avoir lieu si une verification echoue. Certains tests sont lances automatiquement, d'autres doivent etre lances manuellement car ils necessitent un profil enfant simule.

## Commandes disponibles

| Commande | Quand l'utiliser | Ce qu'elle verifie |
|----------|-----------------|-------------------|
| `test:unit` | Apres modification des calculs ou du coaching | Les calculs de pieces, de flamme, de niveaux et les messages de coaching |
| `test:e2e` | Apres modification de l'interface | Les parcours utilisateur complets en navigateur simule |
| `test:all` | Avant un gros changement | Tout : calculs + interface |
| `deploy` | Pour mettre en production | Verifie tout, construit l'app, teste contre la version finale, puis deploie |
| `deploy:raw` | Urgence uniquement | Deploie sans verification — a eviter |

## Ce qui est verifie automatiquement avant chaque deploiement

Le deploiement standard lance quatre etapes dans l'ordre. Si l'une echoue, le deploiement s'arrete.

1. **Qualite du code** — Le code ne contient pas d'erreur de syntaxe ou de variable inutilisee.
2. **Construction** — L'app se construit correctement pour la production.
3. **Calculs** — Les pieces, les niveaux, la flamme et les messages de coaching fonctionnent conformement aux regles.
4. **Pages publiques** — Les 20 pages de regles s'affichent correctement, le mini-quiz fonctionne, les balises de referencement sont presentes.

## Ce qui doit etre verifie manuellement

Les parcours qui necessitent un profil enfant (dashboard, quiz, boutique, personnages, dictee, code PIN) sont verifies en local via la commande `test:all`. Ils ne font pas partie du deploiement automatique car ils necessitent un etat local simule qui ne peut pas etre reproduit sur le serveur de deploiement.

La suite manuelle doit etre lancee avant tout changement important touchant l'interface ou les mecaniques de jeu.

## Tests par domaine

| Domaine | Tests automatiques (avant deploiement) | Tests manuels (suite complete) |
|---------|----------------------------------------|-------------------------------|
| Coaching et messages | C01 a C16 | — |
| Calculs et progression | N01 a N33 | — |
| Statistiques | T01 a T04 | — |
| Pages publiques | SEO01 a SEO06 | — |
| Emotions et personnages | — | E01 a E06, K01 a K04 |
| Boutique et quiz | — | S01 a S07 |
| Dictee | — | D01 a D06 |
| Code PIN parental | — | P01 a P05 |
| Audio | — | A01 a A03 |
| Progression (parcours complets) | — | N14, N14b, N15, N23 a N25 |
| Tableau de bord parent | — | N26 a N31 |

## Voir aussi

- [Coaching et messages](./15-coaching-messages.md)
- [Pages publiques et SEO](./18-pages-publiques-seo.md)
- [Boutique](./11-boutique.md)

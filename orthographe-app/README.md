# Orthographe App

L'application n'utilise plus `localStorage` pour la progression. La persistance passe par un backend Node local qui écrit :

- `user-data/progress.json` pour l'état courant
- `user-data/backups/YYYY-MM-DD.json` pour une sauvegarde quotidienne glissante sur 30 jours
- `user-data/restore-points/*.json` pour les points de restauration créés avant un restore

## Lancer en local

Dans un terminal :

```bash
npm run backend
```

Dans un second terminal :

```bash
npm run dev
```

Vite proxyfie automatiquement `/api` vers `http://127.0.0.1:3001`.

## Servir la build

```bash
npm run build
npm run start
```

Le serveur local expose à la fois l'API `/api/*` et les fichiers statiques de `dist/`.

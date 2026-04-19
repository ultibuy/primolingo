# Plan de développement — GramHero

> **Ce document est un plan de développement destiné à Claude Code.**
> Il décrit toutes les étapes pour transformer l'app `orthographe-app` en une Progressive Web App déployée sur Firebase, avec landing page publique, authentification Google, gestion multi-enfants, et code parental par OTP email.

---

## Contexte

### App existante
- **Stack** : React 19 + Vite 8, serveur Node local (`server/local-api.mjs`)
- **Chemin** : `orthographe-app/`
- **Données** : fichiers JSON locaux dans `user-data/`
- **Routing** : state-based (`screen` useState dans App.jsx), pas de React Router
- **Design** : dark mode gaming, glassmorphism, fonts Plus Jakarta Sans + Outfit
- **Contenu** : 10 règles d'orthographe × ~100 questions chacune (JSON statiques dans `src/content/rules/`)

### Firebase déjà configuré
- **Projet** : `orthographe-eabb9`
- **Auth** : Google provider activé
- **Firestore** : base `(default)` en `eur3` (Europe), mode test
- **Plan** : Spark (gratuit)
- **Config** :
```js
const firebaseConfig = {
  apiKey: "AIzaSyCeWSmdVeBBllYbz5TnoTK_rcpF4ybqG7Y",
  authDomain: "orthographe-eabb9.firebaseapp.com",
  projectId: "orthographe-eabb9",
  storageBucket: "orthographe-eabb9.firebasestorage.app",
  messagingSenderId: "970082314822",
  appId: "1:970082314822:web:b57559f6592a9a5e3d3847"
};
```

### Nom du jeu : **GramHero**
*"L'aventure de l'orthographe"*

---

## Architecture cible

```
orthographe-app/
├── public/
│   ├── manifest.webmanifest      ← PWA
│   ├── sw.js                     ← Service Worker
│   ├── icons/                    ← PWA icons (192, 512)
│   └── og-image.png              ← Open Graph image
├── src/
│   ├── main.jsx                  ← Entry point (inchangé)
│   ├── index.css                 ← Styles globaux (enrichis)
│   ├── firebase.js               ← NOUVEAU : init Firebase SDK
│   ├── App.jsx                   ← REFACTORISÉ : AuthProvider + Router
│   ├── router.jsx                ← NOUVEAU : routing déclaratif
│   ├── contexts/
│   │   └── AuthContext.jsx       ← NOUVEAU : React context pour auth
│   ├── pages/                    ← NOUVEAU : pages top-level
│   │   ├── LandingPage.jsx       ← Page publique de promotion
│   │   ├── LoginPage.jsx         ← Google Connect + création compte
│   │   ├── ParentDashboard.jsx   ← Admin parent (profils enfants)
│   │   ├── ChildSetup.jsx        ← Création/édition profil enfant
│   │   └── ChildApp.jsx          ← Wrapper de l'app jeu existante
│   ├── components/               ← Composants existants (adaptés)
│   │   ├── Dashboard.jsx         ← ADAPTÉ : reçoit childId en prop
│   │   ├── AdminPage.jsx         ← ADAPTÉ : OTP email au lieu de code fixe
│   │   └── ... (tous les autres inchangés)
│   ├── store/
│   │   └── persistence.js        ← RÉÉCRIT : Firestore SDK au lieu de fetch /api/
│   ├── services/                 ← NOUVEAU
│   │   ├── auth.js               ← Google Auth helpers
│   │   ├── firestore.js          ← CRUD Firestore (progress, settings, children)
│   │   └── otp.js                ← Envoi + vérification OTP par email
│   ├── engine/                   ← INCHANGÉ (session.js, sm2.js, scoring.js, economy.js)
│   └── content/                  ← INCHANGÉ (rules/*.json)
├── functions/                    ← NOUVEAU : Firebase Cloud Functions (si nécessaire pour OTP)
│   ├── index.js
│   └── package.json
├── firebase.json                 ← NOUVEAU : config Hosting + Functions
├── firestore.rules               ← NOUVEAU : règles de sécurité Firestore
├── .firebaserc                   ← NOUVEAU : lien projet
├── vite.config.js                ← ADAPTÉ : PWA plugin
└── package.json                  ← ADAPTÉ : nouvelles dépendances
```

---

## Structure Firestore

```
users/{uid}/                          ← Document principal parent
  ├── email: string
  ├── displayName: string
  ├── createdAt: timestamp
  ├── settings: {                     ← Admin settings (anciennement admin-settings.json)
  │     prodQuestionCount: number,
  │     customMysteryImages: [...]
  │   }
  └── children/{childId}/             ← Sous-collection enfants
        ├── name: string
        ├── avatar: string            ← Emoji ou image
        ├── createdAt: timestamp
        ├── progress: { ... }         ← Tout le schema V2 actuel (streak, coins, rules, shop, etc.)
        └── backups/{date}/           ← Sous-collection backups
              └── snapshot: { ... }

otp/{otpId}/                          ← Collection OTP (TTL auto-delete)
  ├── email: string
  ├── code: string (6 chiffres)
  ├── createdAt: timestamp
  ├── expiresAt: timestamp
  ├── used: boolean
```

---

## Règles Firestore

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Parents : accès uniquement à leur propre document
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;

      match /children/{childId} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }

      match /children/{childId}/backups/{date} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }

    // OTP : seules les Cloud Functions peuvent écrire (admin SDK)
    match /otp/{otpId} {
      allow read: if request.auth != null;
      allow write: if false; // Uniquement via Cloud Functions
    }
  }
}
```

---

## Phases de développement

---

### PHASE 1 — Fondations Firebase & Auth

**Objectif** : Installer Firebase SDK, configurer Auth Google, créer le contexte d'authentification, et mettre en place le routing.

#### Étape 1.1 — Installer les dépendances

```bash
cd orthographe-app
npm install firebase react-router-dom
npm install -D vite-plugin-pwa
```

#### Étape 1.2 — Créer `src/firebase.js`

```js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCeWSmdVeBBllYbz5TnoTK_rcpF4ybqG7Y",
  authDomain: "orthographe-eabb9.firebaseapp.com",
  projectId: "orthographe-eabb9",
  storageBucket: "orthographe-eabb9.firebasestorage.app",
  messagingSenderId: "970082314822",
  appId: "1:970082314822:web:b57559f6592a9a5e3d3847"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
```

#### Étape 1.3 — Créer `src/contexts/AuthContext.jsx`

- `AuthProvider` qui wrappe l'app
- Expose : `user`, `loading`, `signInWithGoogle()`, `signOut()`
- Utilise `onAuthStateChanged` pour écouter l'état auth
- Pendant `loading`, afficher un spinner avec le design dark mode de l'app

#### Étape 1.4 — Créer le routing (`src/router.jsx`)

Utiliser React Router v6 :

| Route | Composant | Auth requise |
|-------|-----------|-------------|
| `/` | `LandingPage` | Non |
| `/login` | `LoginPage` | Non (redirige si déjà connecté) |
| `/parent` | `ParentDashboard` | Oui |
| `/parent/child/new` | `ChildSetup` | Oui |
| `/parent/child/:childId/edit` | `ChildSetup` | Oui |
| `/play/:childId` | `ChildApp` | Oui |
| `/play/:childId/admin` | `AdminPage` (adapté) | Oui + OTP |

Créer un composant `ProtectedRoute` qui redirige vers `/login` si non authentifié.

#### Étape 1.5 — Adapter `App.jsx`

- Retirer le state-based routing (le `screen` useState)
- Wrapper avec `AuthProvider` + `RouterProvider`
- L'ancien `App.jsx` devient essentiellement `ChildApp.jsx` (le cœur du jeu)
- Garder toute la logique de jeu (quiz, scoring, shop) dans `ChildApp.jsx`

**Vérification Phase 1** :
```
CHECKLIST :
- [ ] `npm run dev` démarre sans erreur
- [ ] La route `/` affiche une page vide ou placeholder
- [ ] La route `/login` affiche un bouton Google Connect
- [ ] Le clic sur Google Connect ouvre le popup Google OAuth
- [ ] Après login, l'utilisateur est redirigé vers `/parent`
- [ ] Le refresh de page conserve la session (onAuthStateChanged)
- [ ] La route `/parent` redirige vers `/login` si non connecté
- [ ] Le logout fonctionne et redirige vers `/`
```

> **INSTRUCTION CLAUDE CODE** : Lance un agent pour vérifier chaque point de la checklist. Teste avec `npm run dev` et vérifie les routes dans le navigateur. Corrige tout problème avant de passer à la phase 2.

---

### PHASE 2 — Landing Page publique

**Objectif** : Créer une page de promotion d'GramHero qui met en avant l'apprentissage.

#### Étape 2.1 — Design de `LandingPage.jsx`

**Contraintes de design** :
- Réutiliser les CSS variables de l'app (--color-primary, --color-bg1, --color-bg2, etc.)
- Dark mode cohérent avec le reste de l'app
- Responsive (mobile-first)
- Pas de dépendances externes (tout en CSS/React pur)

**Structure de la page** :

1. **Hero Section**
   - Titre : "GramHero" en grand (font Outfit, 48-64px)
   - Sous-titre : "L'aventure de l'orthographe pour les 8-14 ans"
   - Tagline : "Apprendre les règles d'orthographe en s'amusant, une quête à la fois."
   - CTA : bouton "Commencer l'aventure" → `/login`
   - Illustration : un badge/shield stylisé avec des lettres (SVG inline ou CSS art)

2. **Section "Pourquoi GramHero ?"** — 4 cards en grille
   - 🧠 **Apprentissage progressif** : "Chaque règle se débloque par étapes : découverte guidée, exercices libres, maîtrise. Ton enfant avance à son rythme."
   - 🎯 **Méthode éprouvée** : "Basé sur la répétition espacée (SM-2), la même méthode que les champions de mémoire. Les règles reviennent au bon moment."
   - 📊 **Suivi intelligent** : "Dashboard parent pour suivre les progrès, les points forts, et les règles à retravailler."
   - 🏆 **Motivation par le jeu** : "Séries, pièces, niveaux, boutique de cosmétiques — le jeu est au service de l'apprentissage."

3. **Section "Comment ça marche ?"** — 3 étapes illustrées
   - Étape 1 : "Créez un compte parent en 10 secondes avec Google"
   - Étape 2 : "Ajoutez le profil de votre enfant"
   - Étape 3 : "Votre enfant joue, vous suivez ses progrès"

4. **Section "Les règles couvertes"** — Liste des 10 règles avec icônes
   - Afficher les titres des règles depuis `src/content/rules/*.json`
   - Montrer le nombre de questions par règle
   - Message : "Nouvelles règles ajoutées régulièrement"

5. **Section "Gratuit, pour toujours"**
   - "GramHero est 100% gratuit. Pas de pub, pas d'achats in-app, pas de données revendues."
   - "Un projet indépendant créé par un parent pour son enfant, ouvert à tous."

6. **Footer**
   - Lien "Commencer" → `/login`
   - "Fait avec ❤️ pour les enfants qui veulent dompter l'orthographe"

#### Étape 2.2 — Open Graph & SEO

Dans `index.html`, ajouter :
```html
<meta property="og:title" content="GramHero — L'aventure de l'orthographe" />
<meta property="og:description" content="Apprendre les règles d'orthographe en s'amusant. Gratuit, basé sur la répétition espacée, pour les 8-14 ans." />
<meta property="og:image" content="/og-image.png" />
<meta name="description" content="GramHero : application gratuite d'apprentissage de l'orthographe française pour les enfants. Méthode SM-2, progression par niveaux, suivi parental." />
```

**Vérification Phase 2** :
```
CHECKLIST :
- [ ] La landing page s'affiche sur `/` sans être connecté
- [ ] Le design est cohérent avec le thème dark mode de l'app
- [ ] Le bouton CTA redirige vers `/login`
- [ ] La page est responsive (tester 375px, 768px, 1440px)
- [ ] Les 10 règles sont listées dynamiquement (pas hardcodées)
- [ ] Pas de scroll horizontal sur mobile
- [ ] Les fonts Plus Jakarta Sans et Outfit sont chargées
```

> **INSTRUCTION CLAUDE CODE** : Lance un agent qui fait un screenshot de la landing page à 3 tailles (mobile, tablette, desktop) et vérifie visuellement que le design est propre. Corrige les problèmes de layout avant de continuer.

---

### PHASE 3 — Login & Création de compte

**Objectif** : Page de connexion Google et création automatique du profil parent dans Firestore.

#### Étape 3.1 — `LoginPage.jsx`

- Design cohérent dark mode
- Logo GramHero en haut
- Bouton "Se connecter avec Google" (style Material-like)
- Message : "Créez votre espace parent pour suivre les progrès de votre enfant"
- Si déjà connecté → redirect `/parent`

#### Étape 3.2 — Logique de création de compte

Dans `src/services/auth.js` :

```js
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  const user = result.user;

  // Créer le document parent s'il n'existe pas
  const userRef = doc(db, 'users', user.uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      email: user.email,
      displayName: user.displayName,
      createdAt: serverTimestamp(),
      settings: {
        prodQuestionCount: 20
      }
    });
  }

  return user;
}
```

#### Étape 3.3 — Post-login flow

Après le premier login :
1. Si le parent n'a aucun enfant → rediriger vers `/parent` qui affiche un message "Créez le profil de votre enfant"
2. Si le parent a un seul enfant → rediriger directement vers `/play/:childId`
3. Si le parent a plusieurs enfants → afficher le sélecteur de profil dans `/parent`

**Vérification Phase 3** :
```
CHECKLIST :
- [ ] Le bouton Google Connect fonctionne (popup s'ouvre)
- [ ] Après premier login, un document est créé dans Firestore `users/{uid}`
- [ ] Le deuxième login ne crée pas de doublon
- [ ] Le displayName et email sont bien stockés
- [ ] La redirection post-login fonctionne selon le nombre d'enfants
```

> **INSTRUCTION CLAUDE CODE** : Vérifie dans la console Firebase (Firestore > Data) que le document utilisateur est bien créé après login. Utilise `console.log` temporaire pour débuguer si nécessaire.

---

### PHASE 4 — Dashboard Parent & Gestion enfants

**Objectif** : Interface parent pour créer/gérer les profils enfants et voir leurs progrès.

#### Étape 4.1 — `ParentDashboard.jsx`

**Layout** :
- Header : "Bienvenue, {displayName}" + bouton logout
- Section "Mes enfants" : liste des profils enfants (cards)
- Bouton "Ajouter un enfant" → `/parent/child/new`
- Chaque card enfant affiche :
  - Nom + avatar (emoji)
  - Série actuelle
  - Nombre de règles débloquées / total
  - Dernier jour d'activité
  - Bouton "Jouer" → `/play/:childId`
  - Bouton "Modifier" → `/parent/child/:childId/edit`

**Data** : Charger la sous-collection `users/{uid}/children` en temps réel avec `onSnapshot`.

#### Étape 4.2 — `ChildSetup.jsx`

**Formulaire de création/édition** :
- Champ "Prénom de l'enfant" (obligatoire)
- Sélecteur d'avatar : grille de 12 emojis au choix (🦊 🐱 🦁 🐸 🐵 🦄 🐲 🦅 🐺 🐼 🦈 🐙)
- Bouton "Créer le profil" / "Enregistrer"
- En mode création : créer un document dans `users/{uid}/children/{auto-id}` avec un progress V2 vierge
- En mode édition : mettre à jour nom et avatar

**Progress initial (V2 vierge)** :
```js
{
  createdAt: serverTimestamp(),
  streak: { current: 0, longest: 0, lastActiveDate: null },
  coins: 0,
  shields: 0,
  shop: { owned: [], equipped: { theme: null, flame: null, title: null, victoryAnimation: null }, activeBoosts: {}, mysteryImages: {}, inventory: {} },
  milestones: {},
  weeklyChest: {},
  rules: {}  // Se remplit au fur et à mesure du jeu
}
```

#### Étape 4.3 — Cinématique post-création

Quand un enfant est créé :
1. Animation de bienvenue : "Le profil de {prénom} est prêt !"
2. Message : "C'est parti pour l'aventure GramHero 🚀"
3. Bouton "Commencer à jouer" → `/play/:childId`

**Vérification Phase 4** :
```
CHECKLIST :
- [ ] Le dashboard parent affiche la liste des enfants (vide au début)
- [ ] Le formulaire de création fonctionne et crée un document dans Firestore
- [ ] L'avatar emoji est bien sauvegardé et affiché
- [ ] L'édition d'un profil met à jour Firestore
- [ ] Le bouton "Jouer" redirige vers l'app jeu avec le bon childId
- [ ] Le bouton "Ajouter un enfant" ouvre le formulaire
- [ ] La cinématique post-création s'affiche
- [ ] onSnapshot met à jour la liste en temps réel
```

> **INSTRUCTION CLAUDE CODE** : Crée 2 profils enfants de test et vérifie dans Firestore que la structure des documents est correcte. Vérifie que le progress initial est bien formaté.

---

### PHASE 5 — Migration de la persistence vers Firestore

**Objectif** : Remplacer le serveur Node (`local-api.mjs`) et le client API (`persistence.js`) par des appels Firestore directs.

#### Étape 5.1 — Réécrire `src/store/persistence.js`

Remplacer chaque fonction par son équivalent Firestore. Le fichier doit exporter les mêmes noms de fonctions pour minimiser les changements dans les composants.

| Ancienne fonction | Nouvelle implémentation |
|---|---|
| `loadProgress()` | `getDoc(doc(db, 'users', uid, 'children', childId))` → retourner `data.progress` |
| `saveProgress(progress)` | `updateDoc(doc(db, 'users', uid, 'children', childId), { progress })` + backup quotidien |
| `loadAdminSettings()` | `getDoc(doc(db, 'users', uid))` → retourner `data.settings` |
| `saveAdminSettings(settings)` | `updateDoc(doc(db, 'users', uid), { settings })` |
| `getDailyBackups()` | `getDocs(collection(db, 'users', uid, 'children', childId, 'backups'))` |
| `restoreDailyBackup(date)` | Lire le backup, écraser progress, créer restore-point |
| `clearCurrentStoredProgress()` | Réinitialiser progress au schéma V2 vierge |
| `exportProgress()` | Retourner le progress actuel (JSON download côté client) |

**Important** : Toutes les fonctions prennent maintenant `uid` et `childId` en paramètre (ou les récupèrent depuis le contexte Auth).

#### Étape 5.2 — Créer `src/services/firestore.js`

Service centralisé pour toutes les opérations Firestore :

```js
// Backup automatique quotidien
export async function createDailyBackup(uid, childId, progress) {
  const today = new Date().toISOString().slice(0, 10);
  const backupRef = doc(db, 'users', uid, 'children', childId, 'backups', today);
  const backupSnap = await getDoc(backupRef);

  if (!backupSnap.exists()) {
    await setDoc(backupRef, {
      snapshot: progress,
      savedAt: serverTimestamp()
    });
  }

  // Nettoyer les backups > 30 jours
  await pruneOldBackups(uid, childId, 30);
}
```

#### Étape 5.3 — Adapter `ChildApp.jsx` (ex-App.jsx)

- Recevoir `childId` depuis les URL params (`useParams()`)
- Recevoir `uid` depuis `AuthContext`
- Passer `uid` et `childId` à toutes les fonctions de persistence
- Retirer le système de profil debug/prod (plus nécessaire avec Firestore)
- Retirer le header `X-Ortho-Profile`

#### Étape 5.4 — Supprimer le serveur Node

- Supprimer `server/local-api.mjs`
- Supprimer le dossier `user-data/`
- Retirer le proxy Vite (`/api` → `localhost:3001`)
- Retirer le script `"backend"` et `"start"` de `package.json`

**Vérification Phase 5** :
```
CHECKLIST :
- [ ] L'app jeu fonctionne sans le serveur Node (npm run dev seul)
- [ ] loadProgress charge les données depuis Firestore
- [ ] saveProgress écrit dans Firestore
- [ ] Un backup quotidien est créé automatiquement à la première sauvegarde du jour
- [ ] Les anciens backups (>30j) sont supprimés
- [ ] La restauration de backup fonctionne
- [ ] L'export JSON fonctionne (téléchargement navigateur)
- [ ] Les admin settings sont lus/écrits dans Firestore
- [ ] Jouer une session complète (10 questions) → les résultats sont persistés
- [ ] Fermer et rouvrir l'app → les données sont toujours là
- [ ] Jouer avec 2 profils enfants différents → données séparées
```

> **INSTRUCTION CLAUDE CODE** : C'est l'étape la plus critique. Lance un agent qui joue une session complète de quiz (choisir une règle, répondre à toutes les questions, vérifier le score) et vérifie que le progress est bien sauvegardé dans Firestore. Fais un deuxième test avec un profil enfant différent pour vérifier l'isolation des données. En cas de bug, lire les erreurs dans la console navigateur.

---

### PHASE 6 — Code parental par OTP email

**Objectif** : Remplacer le code secret fixe ("papa") par un code temporaire envoyé par email au parent.

#### Étape 6.1 — Cloud Function pour l'envoi d'OTP

Créer `functions/index.js` :

```js
const { onCall } = require('firebase-functions/v2/https');
const { getFirestore } = require('firebase-admin/firestore');
const { initializeApp } = require('firebase-admin/app');
const nodemailer = require('nodemailer');

initializeApp();
const db = getFirestore();

// Utiliser un service SMTP gratuit (ex: Gmail, ou Brevo free tier)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_APP_PASSWORD  // App password Gmail, pas le mdp du compte
  }
});

exports.sendOtp = onCall(async (request) => {
  const uid = request.auth?.uid;
  if (!uid) throw new Error('Non authentifié');

  // Récupérer l'email du parent
  const userDoc = await db.collection('users').doc(uid).get();
  const email = userDoc.data().email;

  // Générer un code 6 chiffres
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Sauvegarder dans Firestore avec TTL de 10 minutes
  await db.collection('otp').add({
    uid,
    code,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    used: false
  });

  // Envoyer l'email
  await transporter.sendMail({
    from: '"GramHero" <noreply@orthoquest.app>',
    to: email,
    subject: 'Votre code GramHero',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; text-align: center;">
        <h2>🔑 Code d'accès parent</h2>
        <p style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #a78bfa;">${code}</p>
        <p>Ce code expire dans 10 minutes.</p>
        <p style="color: #888; font-size: 12px;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
      </div>
    `
  });

  return { success: true };
});

exports.verifyOtp = onCall(async (request) => {
  const uid = request.auth?.uid;
  const { code } = request.data;
  if (!uid || !code) throw new Error('Paramètres manquants');

  // Chercher un OTP valide
  const snapshot = await db.collection('otp')
    .where('uid', '==', uid)
    .where('code', '==', code)
    .where('used', '==', false)
    .orderBy('createdAt', 'desc')
    .limit(1)
    .get();

  if (snapshot.empty) return { valid: false };

  const otpDoc = snapshot.docs[0];
  const data = otpDoc.data();

  // Vérifier expiration
  if (new Date() > data.expiresAt.toDate()) {
    return { valid: false, reason: 'expired' };
  }

  // Marquer comme utilisé
  await otpDoc.ref.update({ used: true });

  return { valid: true };
});
```

#### Étape 6.2 — Setup Cloud Functions

```bash
cd orthographe-app
npm install -g firebase-tools
firebase login
firebase init functions  # Choisir JavaScript, installer dépendances
cd functions
npm install nodemailer
```

Configurer les secrets :
```bash
firebase functions:secrets:set SMTP_EMAIL
firebase functions:secrets:set SMTP_APP_PASSWORD
```

**Note** : Sur le plan Spark (gratuit), les Cloud Functions sont disponibles mais avec des limites (125K invocations/mois, pas d'appels réseau sortants). Pour l'envoi d'email, il faudra **passer au plan Blaze (pay-as-you-go)** car les appels SMTP sortants ne sont pas permis sur Spark. Alternative : utiliser **Firebase Extensions "Trigger Email from Firestore"** avec un provider comme SendGrid (100 emails/jour gratuits) ou **utiliser l'API EmailJS côté client** (200 emails/mois gratuits) pour éviter Cloud Functions.

#### Étape 6.3 — Alternative sans Cloud Functions (recommandée pour rester gratuit)

Utiliser **EmailJS** (plan gratuit : 200 emails/mois, largement suffisant) :

1. Créer un compte sur emailjs.com
2. Configurer un service email (Gmail)
3. Créer un template email avec le code OTP
4. Appeler l'API EmailJS depuis le client

Créer `src/services/otp.js` :

```js
import emailjs from '@emailjs/browser';
import { doc, collection, addDoc, getDocs, query, where, orderBy, limit, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

const EMAILJS_SERVICE_ID = 'service_xxx';
const EMAILJS_TEMPLATE_ID = 'template_xxx';
const EMAILJS_PUBLIC_KEY = 'xxx';

export async function sendOtp(uid, email) {
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  // Sauvegarder dans Firestore
  await addDoc(collection(db, 'users', uid, 'otp'), {
    code,
    createdAt: new Date(),
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    used: false
  });

  // Envoyer via EmailJS
  await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
    to_email: email,
    otp_code: code,
  }, EMAILJS_PUBLIC_KEY);

  return true;
}

export async function verifyOtp(uid, code) {
  const q = query(
    collection(db, 'users', uid, 'otp'),
    where('code', '==', code),
    where('used', '==', false),
    orderBy('createdAt', 'desc'),
    limit(1)
  );

  const snapshot = await getDocs(q);
  if (snapshot.empty) return { valid: false };

  const otpDoc = snapshot.docs[0];
  const data = otpDoc.data();

  if (new Date() > data.expiresAt.toDate()) {
    return { valid: false, reason: 'expired' };
  }

  await updateDoc(otpDoc.ref, { used: true });
  return { valid: true };
}
```

**Adapter les règles Firestore** pour la sous-collection OTP :
```
match /users/{uid}/otp/{otpId} {
  allow read, write: if request.auth != null && request.auth.uid == uid;
}
```

#### Étape 6.4 — Adapter l'UI du code parental

Dans `AdminPage.jsx` et `ReturnScreen.jsx`, remplacer le champ "code secret" par :

1. **Bouton "Envoyer un code"** → appelle `sendOtp()`
2. **Champ de saisie 6 chiffres** (style PIN input, 6 cases séparées)
3. **Timer** : "Code valide encore 9:42" (décompte 10 min)
4. **Bouton "Renvoyer"** (disponible après 60 secondes)
5. **Message d'erreur** : "Code incorrect ou expiré"
6. **Message de succès** : animation check vert → accès admin débloqué

Le composant OTP doit être réutilisable (`OtpVerification.jsx`) car utilisé dans :
- `AdminPage.jsx` (accès admin depuis l'app enfant)
- `ReturnScreen.jsx` (streak save — si cette feature nécessite toujours un code)

#### Étape 6.5 — Retirer l'ancien système

- Supprimer `parentalCode` du schéma progress
- Supprimer `parentalCode` des admin settings
- Supprimer le champ texte de code dans AdminPage
- Adapter ReturnScreen pour utiliser OTP ou supprimer le code pour les shields

**Vérification Phase 6** :
```
CHECKLIST :
- [ ] Le bouton "Envoyer un code" envoie un email à l'adresse du parent
- [ ] L'email contient un code à 6 chiffres lisible
- [ ] Le code saisi correctement débloque l'accès admin
- [ ] Un code incorrect affiche une erreur
- [ ] Un code expiré (>10 min) est refusé
- [ ] Un code déjà utilisé est refusé
- [ ] Le bouton "Renvoyer" est grisé pendant 60 secondes
- [ ] Le timer de 10 minutes s'affiche et décompte
- [ ] Le composant OTP fonctionne dans AdminPage ET ReturnScreen
```

> **INSTRUCTION CLAUDE CODE** : Teste le flow complet : cliquer "Envoyer un code" → vérifier la réception de l'email → entrer le code → vérifier le déverrouillage. Teste aussi les cas d'erreur (mauvais code, code expiré). Si EmailJS pose problème, log le code dans la console pour le développement et configure EmailJS correctement pour la production.

---

### PHASE 7 — Progressive Web App (PWA)

**Objectif** : Transformer l'app en PWA installable avec support offline.

#### Étape 7.1 — Configurer vite-plugin-pwa

Adapter `vite.config.js` :

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'icons/*.png'],
      manifest: {
        name: 'GramHero — L\'aventure de l\'orthographe',
        short_name: 'GramHero',
        description: 'Apprendre l\'orthographe en s\'amusant',
        theme_color: '#1e1e2e',
        background_color: '#1e1e2e',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'CacheFirst',
            options: { cacheName: 'google-fonts', expiration: { maxEntries: 10, maxAgeSeconds: 365 * 24 * 60 * 60 } }
          }
        ]
      }
    })
  ]
});
```

#### Étape 7.2 — Créer les icônes PWA

Créer des icônes GramHero (simple, reconnaissable) :
- `public/icons/icon-192.png` (192×192)
- `public/icons/icon-512.png` (512×512)
- `public/icons/icon-512-maskable.png` (512×512, avec padding pour maskable)

Utiliser un script Node avec Canvas pour générer les icônes :
- Fond dégradé `#1e1e2e` → `#2d2b55`
- Texte "GH" en blanc, font bold
- Ou un shield/badge stylisé

#### Étape 7.3 — Apple Touch Icon & meta tags

Dans `index.html` :
```html
<link rel="apple-touch-icon" href="/icons/icon-192.png" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="theme-color" content="#1e1e2e" />
```

#### Étape 7.4 — Offline support

Le service worker (généré par vite-plugin-pwa) cache automatiquement :
- Tous les assets statiques (JS, CSS, HTML, images, fonts)
- Les fichiers de règles JSON (bundled dans le build)

Pour Firestore offline :
```js
import { enableIndexedDbPersistence } from 'firebase/firestore';

// Dans firebase.js, après getFirestore()
enableIndexedDbPersistence(db).catch((err) => {
  console.warn('Firestore offline persistence failed:', err.code);
});
```

Cela permet de jouer hors connexion — les écritures Firestore sont mises en queue et synchronisées au retour en ligne.

**Vérification Phase 7** :
```
CHECKLIST :
- [ ] `npm run build` génère un service worker dans `dist/`
- [ ] Le manifest est accessible à `/manifest.webmanifest`
- [ ] L'app est installable sur mobile (bandeau "Ajouter à l'écran d'accueil")
- [ ] L'app est installable sur desktop Chrome (icône dans la barre d'URL)
- [ ] En mode avion, l'app se charge (pages déjà visitées)
- [ ] En mode avion, une session de quiz peut être jouée
- [ ] Au retour en ligne, les données se synchronisent avec Firestore
- [ ] L'icône est correcte sur l'écran d'accueil
- [ ] Le thème de la barre de statut est dark (#1e1e2e)
```

> **INSTRUCTION CLAUDE CODE** : Fais un `npm run build && npm run preview` et teste l'installation PWA dans Chrome DevTools > Application > Manifest. Vérifie que le service worker est enregistré. Simule le mode offline dans DevTools > Network > Offline et vérifie que l'app reste fonctionnelle.

---

### PHASE 8 — Déploiement Firebase Hosting

**Objectif** : Déployer l'app sur Firebase Hosting (orthographe-eabb9.web.app).

#### Étape 8.1 — Configurer Firebase Hosting

Créer `firebase.json` :
```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      { "source": "**", "destination": "/index.html" }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|map)",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
      },
      {
        "source": "sw.js",
        "headers": [{ "key": "Cache-Control", "value": "no-cache" }]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules"
  }
}
```

Créer `.firebaserc` :
```json
{
  "projects": {
    "default": "orthographe-eabb9"
  }
}
```

#### Étape 8.2 — Build & Deploy

```bash
npm run build
firebase deploy --only hosting,firestore:rules
```

#### Étape 8.3 — Vérifier le déploiement

```
CHECKLIST :
- [ ] https://orthographe-eabb9.web.app/ charge la landing page
- [ ] Le login Google fonctionne en production
- [ ] La création d'enfant fonctionne
- [ ] Une session de quiz complète fonctionne
- [ ] Les données persistent après refresh
- [ ] La PWA est installable
- [ ] Les règles Firestore sont déployées (tester accès non-autorisé)
- [ ] Le SPA routing fonctionne (refresh sur /parent ne donne pas 404)
```

> **INSTRUCTION CLAUDE CODE** : Après le deploy, lance un agent qui vérifie chaque URL de la checklist. Si le login Google échoue en production, vérifier que le domaine `orthographe-eabb9.web.app` est bien dans les "Authorized domains" de Firebase Auth.

---

### PHASE 9 — Migration des données existantes

**Objectif** : Importer le progress actuel de Damien depuis les fichiers JSON locaux vers Firestore.

#### Étape 9.1 — Script de migration

Créer un script one-shot `scripts/migrate-local-to-firestore.js` :

```js
// Lire user-data/progress.json
// Se connecter à Firestore avec le SDK admin
// Créer le document enfant avec le progress existant
// Vérifier l'intégrité des données
```

Ce script :
1. Lit `user-data/progress.json`
2. Crée un profil enfant "Damien" sous le compte parent (uid à spécifier)
3. Écrit le progress dans le document enfant
4. Crée un backup "pre-migration" daté

#### Étape 9.2 — Vérification

```
CHECKLIST :
- [ ] Le progress de Damien est dans Firestore
- [ ] Les streaks, coins, niveaux de règles sont préservés
- [ ] Les données de la boutique (items achetés, équipés) sont préservées
- [ ] Le SM-2 state est préservé pour chaque règle
```

---

## Résumé des fichiers à créer / modifier / supprimer

### Fichiers à CRÉER
| Fichier | Phase |
|---------|-------|
| `src/firebase.js` | 1 |
| `src/contexts/AuthContext.jsx` | 1 |
| `src/router.jsx` | 1 |
| `src/pages/LandingPage.jsx` | 2 |
| `src/pages/LoginPage.jsx` | 3 |
| `src/pages/ParentDashboard.jsx` | 4 |
| `src/pages/ChildSetup.jsx` | 4 |
| `src/pages/ChildApp.jsx` | 5 |
| `src/services/auth.js` | 3 |
| `src/services/firestore.js` | 5 |
| `src/services/otp.js` | 6 |
| `src/components/OtpVerification.jsx` | 6 |
| `firebase.json` | 8 |
| `.firebaserc` | 8 |
| `firestore.rules` | 5 |
| `public/icons/icon-192.png` | 7 |
| `public/icons/icon-512.png` | 7 |
| `public/icons/icon-512-maskable.png` | 7 |
| `scripts/migrate-local-to-firestore.js` | 9 |

### Fichiers à MODIFIER
| Fichier | Phase | Changements |
|---------|-------|-------------|
| `package.json` | 1 | Ajouter firebase, react-router-dom, vite-plugin-pwa, @emailjs/browser |
| `vite.config.js` | 7 | Ajouter PWA plugin, retirer proxy /api |
| `index.html` | 2, 7 | Meta tags SEO, PWA, Open Graph |
| `src/App.jsx` | 1 | Refactoriser en AuthProvider + Router (gros refactoring) |
| `src/store/persistence.js` | 5 | Réécrire entièrement pour Firestore |
| `src/components/AdminPage.jsx` | 6 | Remplacer code fixe par OTP |
| `src/components/ReturnScreen.jsx` | 6 | Adapter pour OTP |
| `src/components/Dashboard.jsx` | 5 | Recevoir childId en prop |

### Fichiers à SUPPRIMER
| Fichier | Phase |
|---------|-------|
| `server/local-api.mjs` | 5 |
| `user-data/` (tout le dossier) | 5 |

---

## Instructions globales pour Claude Code

### Méthode de travail

1. **Travaille phase par phase** — ne saute pas d'étape. Chaque phase dépend de la précédente.

2. **Utilise des agents** pour les tâches parallèles et la vérification :
   - Lance un agent pour écrire le code
   - Lance un agent séparé pour vérifier/tester le résultat
   - Ne te fie jamais au fait que "ça devrait marcher" — vérifie toujours

3. **Vérifie ton travail systématiquement** :
   - Après chaque phase, lance `npm run dev` et vérifie que l'app démarre
   - Ouvre le navigateur et teste manuellement les flows
   - Vérifie la console navigateur pour les erreurs
   - Vérifie Firestore dans la console Firebase pour la structure des données

4. **Gère les erreurs** :
   - Si un `npm install` échoue → essaie `npm config set strict-ssl false` puis réessaie
   - Si Firebase auth échoue → vérifie les domaines autorisés dans Firebase Console
   - Si Firestore échoue → vérifie les règles de sécurité

5. **Préserve le design existant** :
   - Ne change JAMAIS les CSS variables existantes
   - Les nouvelles pages (landing, login, parent) doivent utiliser le même design system
   - Fonts : Plus Jakarta Sans (body) + Outfit (display)
   - Couleurs : dark mode avec le dégradé #1e1e2e → #2d2b55
   - Glassmorphism : `backdrop-filter: blur()` + `background: rgba()`

6. **Préserve la logique de jeu** :
   - Ne touche PAS aux fichiers dans `src/engine/` (session.js, sm2.js, scoring.js, economy.js)
   - Ne touche PAS aux fichiers dans `src/content/rules/`
   - Les composants de quiz (QuizGuided, QuizDirect, EndScreen) ne changent pas

7. **Commits** :
   - Un commit par phase complétée
   - Message de commit clair : "Phase X: [description]"

### Ordre d'exécution recommandé

```
Phase 1 (Auth + Routing)           ← Fondation, tout le reste en dépend
  ↓
Phase 5 (Migration Firestore)      ← Critique : le jeu doit marcher avec Firestore
  ↓
Phase 3 (Login)                    ← Dépend de Auth
  ↓
Phase 4 (Dashboard Parent)         ← Dépend de Login + Firestore
  ↓
Phase 2 (Landing Page)             ← Indépendant, peut être fait en parallèle
  ↓
Phase 6 (OTP Email)                ← Dépend de Firestore + Auth
  ↓
Phase 7 (PWA)                      ← Peut être fait en parallèle de Phase 6
  ↓
Phase 8 (Deploy)                   ← Tout doit être prêt
  ↓
Phase 9 (Migration données)        ← Après le premier deploy
```

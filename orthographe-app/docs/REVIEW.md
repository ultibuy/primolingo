# Rapport d'audit — orthographe-app

**Date :** 12 avril 2026
**Périmètre :** 7035 lignes de code, 26 fichiers source (src/)
**Versions intégrées :** V1 → V2 → V3 → V4 → V5

---

## Résumé exécutif

L'app est fonctionnelle : le quiz guidé et direct marchent, le système de niveaux à 5 paliers est en place, la boutique avec 23 items existe, le diamant vivant avec SM-2 est codé, les thèmes CSS sont branchés. **Mais 3 bugs critiques empêchent le gameplay de fonctionner correctement en production**, et le mode debug est toujours actif.

| Catégorie | Nombre | Gravité |
|-----------|--------|---------|
| Bugs bloquants | 3 | 🔴 CRITIQUE — crash ou résultat faux |
| Bugs silencieux | 2 | 🟠 HAUT — logique cassée sans crash |
| Incohérences | 3 | 🟡 MOYEN — code vs design |
| Code mort | 3 | ⚪ BAS — imports inutilisés |
| Dette technique | 4 | 🟠 HAUT — risques futurs |
| Données | 3 | ⚪ BAS — structure JSON |

---

## 🔴 BUGS BLOQUANTS

### B1. Appel `checkLevelUp` avec mauvaise signature
**Fichier :** `App.jsx:496`
```js
// ACTUEL (bugué)
const levelResult = checkLevelUp(rp, mode, pct);
// ATTENDU
const levelResult = checkLevelUp(rp, mode, score, questions.length);
```
**Impact :** La fonction reçoit le pourcentage pré-calculé (`pct`) comme `score` et `undefined` comme `total`. Elle recalcule `pct = score/total` → `NaN`. Tous les seuils de niveau (≥80%, ≥90%) échouent silencieusement. **Aucune montée de niveau ne fonctionne.**

### B2. Appel `updateRuleSM2` avec mauvaise signature
**Fichier :** `App.jsx:472`
```js
// ACTUEL (bugué)
const updatedSM2 = updateRuleSM2(rp.sm2, pct);
// ATTENDU
const updatedSM2 = updateRuleSM2(rp.sm2, score, questions.length);
```
**Impact :** Même problème que B1. La fonction SM-2 reçoit `undefined` pour `totalQuestions`. L'intervalle de révision ne change jamais correctement. **Le diamant vivant est cassé.**

### B3. Props manquantes sur les composants Quiz
**Fichier :** `App.jsx:831-844`
```js
// ACTUEL — isFirstSessionOfDay n'est jamais passé
<QuizComponent rule={...} questions={...} onFinish={...} />
// ATTENDU
<QuizComponent ... isFirstSessionOfDay={isFirstSessionOfDay} />
```
**Impact :** L'EndScreen reçoit toujours `undefined` pour `isFirstSessionOfDay`. Le bonus "+10 première session" n'est jamais affiché à l'écran de fin (même s'il est bien calculé côté App.jsx). De même, `levelProgress` et `streakInfo` ne sont jamais passés → la barre de progression vers le prochain niveau ne s'affiche jamais.

---

## 🟠 BUGS SILENCIEUX

### S1. `recentlyShown` jamais mis à jour
**Fichier :** `App.jsx` (absent)
**Contexte :** `session.js:41` utilise `ruleProgress.recentlyShown` pour éviter de montrer les mêmes questions deux sessions de suite. Mais `App.jsx` ne met jamais à jour ce champ après une session.
**Impact :** L'algorithme de variété est neutralisé. Les questions sont toujours piochées au hasard sans tenir compte de l'historique récent. Pas de crash, mais la répétition espacée par question est inefficace.

### S2. SM-2 initialisé avec `nextReviewDate = aujourd'hui`
**Fichier :** `sm2.js:24`
**Impact :** Quand un joueur obtient son diamant, la révision est immédiatement "due". Le bandeau "Révision due" apparaît dès le retour au dashboard, ce qui est confus. Le joueur vient de prouver sa maîtrise (3×90%) et on lui dit de réviser tout de suite.
**Fix suggéré :** Initialiser avec `nextReviewDate = demain` (interval = 1 jour).

---

## 🟡 INCOHÉRENCES

### I1. Double calcul des coins de milestone
**Fichier :** `App.jsx:55-59` et `scoring.js:83-120`
`checkLevelUp()` retourne `coinsEarned` (30/100/200 selon le niveau). Mais `App.jsx` a AUSSI un objet `LEVEL_MILESTONE_COINS` qui recalcule la même chose. Il y a un risque de double attribution ou d'incohérence entre les deux sources.

### I2. Mode Sniper avec `choices` vide
**Fichier :** `App.jsx:735-736`
Le sniper crée une règle synthétique avec `choices: []` et `decisionAxes: []`. Les composants Quiz accèdent à `rule.choices.map()` → fonctionne mais affiche 0 boutons de réponse. **Le mode sniper est non fonctionnel.**

### I3. Props passées au Dashboard mais non utilisées
**Fichier :** `App.jsx:866-878`
5 props de consommables (`onSniper`, `onRematch`, `canRematch`, `lastSessionRuleId`, `lastSessionScore`) sont passées mais Dashboard ne les destructure pas. L'UI des consommables (bouton Sniper, bouton Revanche) n'est pas branchée côté Dashboard.

---

## ⚪ CODE MORT

| Élément | Fichier | Détail |
|---------|---------|--------|
| `CrownIcon` import | QuizGuided.jsx, QuizDirect.jsx | Importé mais jamais utilisé dans le rendu |
| `DiamondIcon` import | QuizGuided.jsx, QuizDirect.jsx | Idem |
| `getStreakInfo` import | App.jsx:10 | Importé de scoring.js mais jamais appelé |

---

## 🟠 DETTE TECHNIQUE

### D1. DEBUG_MODE activé
**Fichier :** `App.jsx:28`
```js
export const DEBUG_MODE = true;  // ← DOIT être false en production
```
Et ligne 157-158 :
```js
if (DEBUG_MODE) next.coins = 9999;  // ← Coins infinis
```
**Impact :** Sessions de 1 question, seuils de niveau à 1, 9999 coins gratuits. **Tout le gameplay est faussé.**

### D2. Timezone UTC vs locale
**Fichier :** `sm2.js:12`
`new Date().toISOString()` retourne l'heure UTC. En France (UTC+2 en été), à 23h30 heure locale, `getToday()` retourne la date du lendemain. Les streaks et révisions SM-2 peuvent être décalés d'un jour.

### D3. `saveProgress` ignoré
**Fichier :** `App.jsx` (partout)
`saveProgress()` retourne `{ success, error }` mais App.jsx ne vérifie jamais le retour. Si le localStorage est plein, la progression est perdue sans avertissement.

### D4. Pas de validation des fichiers JSON de règles
Les JSON sont chargés par `import.meta.glob` sans validation. Un fichier malformé (question sans `id`, sans `answer`) crashera silencieusement.

---

## ⚪ DONNÉES

### J1. IDs de questions non uniques entre règles
`ces-ses.json` et `er-e-ez-ais-ait.json` utilisent tous les deux `q001`, `q002`, etc. Si le mode Sniper mélange des questions de plusieurs règles, les IDs entrent en collision dans `questionStats`.

### J2. Champs inutilisés dans `choices`
`ces-ses.json` a des champs `hasEtre`, `startsWithC` sur les choix. Ces champs ne sont jamais référencés dans le code — le système d'élimination utilise `decisionAxes.options.eliminates` directement.

### J3. 7 règles chargées mais seulement 2 ont des fichiers JSON
Le loader charge tous les `.json` de `src/content/rules/`. Les screenshots montrent 7 règles. Certaines semblent avoir été générées automatiquement (a/à/as, leur/leurs, on/ont, ou/où, tout/tous). **Vérifier que ces fichiers existent et sont complets.**

---

## Plan de correction recommandé

### Avant toute livraison (30 min)
1. ✅ Fix B1 — `checkLevelUp(rp, mode, score, questions.length)`
2. ✅ Fix B2 — `updateRuleSM2(rp.sm2, score, questions.length)`
3. ✅ Fix B3 — Passer `isFirstSessionOfDay` aux quiz
4. ✅ Fix D1 — `DEBUG_MODE = false`
5. ✅ Fix S1 — Mettre à jour `recentlyShown` après chaque session

### Avant mise en main de Damien (1h)
6. Fix I2 — Rendre le mode Sniper fonctionnel ou le retirer
7. Fix I3 — Brancher les props consommables dans Dashboard
8. Fix S2 — SM-2 init avec `nextReviewDate = demain`
9. Fix D3 — Vérifier le retour de `saveProgress`
10. Supprimer le code mort (imports inutilisés)

### Améliorations futures
11. Fix D2 — Timezone-aware dates
12. Fix J1 — IDs de questions globalement uniques
13. Validation des fichiers JSON au chargement
14. Tests automatisés end-to-end

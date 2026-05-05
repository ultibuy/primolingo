# Coaching et messages

## Description

Un bandeau de motivation s'affiche sur le dashboard enfant avec un message personnalisé. Le message dépend de la situation du joueur : nouveau, en progression, flamme en danger, proche d'un palier, etc. Chaque message a une priorité, et un seul s'affiche à la fois.

## Galerie des icones SVG du bandeau

Chaque message de coaching utilise une icone SVG adaptee au contexte. Les icones sont definies dans `MotivationBanner.jsx` via le composant `BannerSvgIcon`. Les couleurs (`accent`, `secondary`) varient selon le theme actif.

<div data-icon-gallery></div>

---

## Émotions chibi (boutique)

Les 4 émotions débloquables affichées dans la boutique (section "À DÉBLOQUER"). Définies dans `ProductIcons.jsx`.

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;margin:1rem 0 2rem">
  <div style="background:rgba(167,139,250,.06);border:1.5px dashed rgba(255,255,255,.08);border-radius:14px;padding:16px;text-align:center">
    <svg width="60" height="60" viewBox="0 0 96 96"><defs><linearGradient id="doc-vict" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4b5fd"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs><circle cx="48" cy="58" r="22" fill="url(#doc-vict)"/><path d="M38 54 Q42 50 46 54" stroke="#1e1e2e" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M50 54 Q54 50 58 54" stroke="#1e1e2e" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M38 62 Q48 70 58 62" stroke="#1e1e2e" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="32" cy="62" r="3" fill="#fbbf24" opacity="0.55"/><circle cx="64" cy="62" r="3" fill="#fbbf24" opacity="0.55"/><g transform="translate(34 44) rotate(-25)"><rect x="-3.5" y="-18" width="7" height="20" rx="3" fill="url(#doc-vict)"/><circle cx="0" cy="-20" r="6" fill="url(#doc-vict)"/></g><g transform="translate(62 44) rotate(25)"><rect x="-3.5" y="-18" width="7" height="20" rx="3" fill="url(#doc-vict)"/><circle cx="0" cy="-20" r="6" fill="url(#doc-vict)"/></g><g transform="translate(16 22)"><path d="M0 -5 L1.2 -1.2 L5 -1 L1.5 1.2 L2.5 5 L0 2.5 L-2.5 5 L-1.5 1.2 L-5 -1 L-1.2 -1.2 Z" fill="#fbbf24"/></g><g transform="translate(80 24) scale(0.8)"><path d="M0 -5 L1.2 -1.2 L5 -1 L1.5 1.2 L2.5 5 L0 2.5 L-2.5 5 L-1.5 1.2 L-5 -1 L-1.2 -1.2 Z" fill="#fbbf24" opacity="0.9"/></g><g transform="translate(48 10) scale(0.6)"><path d="M0 -5 L1.2 -1.2 L5 -1 L1.5 1.2 L2.5 5 L0 2.5 L-2.5 5 L-1.5 1.2 L-5 -1 L-1.2 -1.2 Z" fill="#fbbf24" opacity="0.8"/></g></svg>
    <div style="font-size:.75rem;color:#c4b5fd;margin-top:8px;font-weight:700">Victoire</div>
    <div style="font-size:.65rem;color:#6b7280;margin-top:2px">130 pièces</div>
  </div>
  <div style="background:rgba(167,139,250,.06);border:1.5px dashed rgba(255,255,255,.08);border-radius:14px;padding:16px;text-align:center">
    <svg width="60" height="60" viewBox="0 0 96 96"><defs><linearGradient id="doc-danse" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4b5fd"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs><g transform="rotate(-15 42 50)"><circle cx="42" cy="50" r="22" fill="url(#doc-danse)"/><path d="M32 46 Q36 42 40 46" stroke="#1e1e2e" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M44 46 Q48 42 52 46" stroke="#1e1e2e" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M32 54 Q42 62 52 54" stroke="#1e1e2e" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="26" cy="54" r="3" fill="#fbbf24" opacity="0.55"/><circle cx="58" cy="54" r="3" fill="#fbbf24" opacity="0.55"/></g><g transform="translate(76 28)"><ellipse cx="0" cy="6" rx="5" ry="4" fill="#fbbf24" transform="rotate(-15)"/><rect x="3" y="-12" width="2.8" height="18" rx="0.5" fill="#fbbf24"/><path d="M5.8 -12 Q12 -10, 10 -3" stroke="#fbbf24" stroke-width="2.5" fill="none" stroke-linecap="round"/></g><g transform="translate(86 56) scale(0.65)"><ellipse cx="0" cy="6" rx="5" ry="4" fill="#fbbf24" transform="rotate(-15)" opacity="0.85"/><rect x="3" y="-12" width="2.8" height="18" rx="0.5" fill="#fbbf24" opacity="0.85"/></g><g transform="translate(14 28) scale(0.55)"><ellipse cx="0" cy="6" rx="5" ry="4" fill="#fbbf24" transform="rotate(-15)" opacity="0.7"/><rect x="3" y="-12" width="2.8" height="18" rx="0.5" fill="#fbbf24" opacity="0.7"/></g><path d="M16 82 Q22 78, 28 82 Q34 86, 40 82" stroke="#c4b5fd" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5"/><path d="M52 84 Q58 80, 64 84 Q70 88, 76 84" stroke="#c4b5fd" stroke-width="2" fill="none" stroke-linecap="round" opacity="0.5"/></svg>
    <div style="font-size:.75rem;color:#c4b5fd;margin-top:8px;font-weight:700">Danse</div>
    <div style="font-size:.65rem;color:#6b7280;margin-top:2px">130 pièces</div>
  </div>
  <div style="background:rgba(167,139,250,.06);border:1.5px dashed rgba(255,255,255,.08);border-radius:14px;padding:16px;text-align:center">
    <svg width="60" height="60" viewBox="0 0 96 96"><defs><linearGradient id="doc-surp" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4b5fd"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs><circle cx="42" cy="52" r="22" fill="url(#doc-surp)"/><circle cx="34" cy="48" r="4.5" fill="#1e1e2e"/><circle cx="50" cy="48" r="4.5" fill="#1e1e2e"/><circle cx="35.5" cy="46" r="1.5" fill="#fff"/><circle cx="51.5" cy="46" r="1.5" fill="#fff"/><ellipse cx="42" cy="60" rx="4" ry="5" fill="#1e1e2e"/><circle cx="26" cy="56" r="3" fill="#fbbf24" opacity="0.55"/><circle cx="58" cy="56" r="3" fill="#fbbf24" opacity="0.55"/><g transform="translate(78 32)"><rect x="-3" y="-14" width="6" height="14" rx="2.5" fill="#fbbf24"/><circle cx="0" cy="6" r="3" fill="#fbbf24"/></g><path d="M14 28 L8 22" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/><path d="M22 16 L24 8" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/><path d="M44 12 L44 4" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/><path d="M62 16 L66 8" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" opacity="0.7"/></svg>
    <div style="font-size:.75rem;color:#c4b5fd;margin-top:8px;font-weight:700">Surprise</div>
    <div style="font-size:.65rem;color:#6b7280;margin-top:2px">130 pièces</div>
  </div>
  <div style="background:rgba(167,139,250,.06);border:1.5px dashed rgba(255,255,255,.08);border-radius:14px;padding:16px;text-align:center">
    <svg width="60" height="60" viewBox="0 0 96 96"><defs><linearGradient id="doc-hes" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#c4b5fd"/><stop offset="1" stop-color="#a78bfa"/></linearGradient></defs><circle cx="38" cy="50" r="22" fill="url(#doc-hes)"/><circle cx="30" cy="48" r="3" fill="#1e1e2e"/><circle cx="31" cy="46.5" r="1" fill="#fff"/><path d="M42 48 Q46 50 50 48" stroke="#1e1e2e" stroke-width="2.5" stroke-linecap="round" fill="none"/><path d="M25 39 L34 36" stroke="#1e1e2e" stroke-width="2.2" stroke-linecap="round"/><path d="M30 60 Q34 58 38 60 Q42 62 46 60" stroke="#1e1e2e" stroke-width="2.5" stroke-linecap="round" fill="none"/><circle cx="22" cy="56" r="2.5" fill="#fbbf24" opacity="0.4"/><circle cx="54" cy="56" r="2.5" fill="#fbbf24" opacity="0.4"/><ellipse cx="74" cy="32" rx="14" ry="9" fill="#c4b5fd" fill-opacity="0.25" stroke="#c4b5fd" stroke-width="1.5"/><circle cx="69" cy="32" r="1.6" fill="#c4b5fd"/><circle cx="74" cy="32" r="1.6" fill="#c4b5fd"/><circle cx="79" cy="32" r="1.6" fill="#c4b5fd"/><circle cx="62" cy="44" r="2.5" fill="#c4b5fd" fill-opacity="0.25" stroke="#c4b5fd" stroke-width="1"/><circle cx="58" cy="50" r="1.5" fill="#c4b5fd" fill-opacity="0.25" stroke="#c4b5fd" stroke-width="0.8"/></svg>
    <div style="font-size:.75rem;color:#c4b5fd;margin-top:8px;font-weight:700">Hésitation</div>
    <div style="font-size:.65rem;color:#6b7280;margin-top:2px">130 pièces</div>
  </div>
</div>

---

## Catalogue complet des messages

Colonnes : **Aperçu** — texte affiché · **Condition** — règle de déclenchement · **Type** — `✱` one-shot (jamais revu une fois affiché) ou `↩` récurrent (peut réapparaître, bloqué 3 min après affichage) · **Surface** — `D` dashboard uniquement / `D+E` dashboard + écran de fin · **Priorité** — rang dans `pickCoachingMessage()`, 1 = le plus prioritaire.

---

### Onboarding et bienvenue

| Arc | Aperçu | Condition | Type | Surface | Priorité |
|-----|--------|-----------|:----:|:-------:|:--------:|
| arc1.1 | Fais ton premier quiz pour remporter 200 pièces de bienvenue. | `totalSessions === 0` · `!firstQuizDone` | ✱ | D | 1 |
| arc1.3 | Zut il te fallait au moins 12/20 pour débloquer les 200 pièces. Elles t'attendent toujours ! | `totalSessions === 1` · `!firstQuizDone` (score < 60 %) | ✱ | D | 2 |
| arc1.5 | C'est bon, tu peux débloquer le Panda — va faire un tour dans la boutique. | `coins >= 250` · `ownedChars === 0` | ✱ | D | 20 |
| arc1.4 | Plus que N pièces pour débloquer le Panda Samouraï. | `200 ≤ coins < 250` · `ownedChars === 0` | ✱ | D | 21 |
| arc1.7.streak5 | Plus que 2 jours pour atteindre 7 jours et empocher 100 pièces. | `streak === 5` | ✱ | D | 29 |
| arc1.7.streak6 | Demain ta flamme passe à 7 jours — 100 pièces à la clé. | `streak === 6` | ✱ | D | 30 |

---

### Progression vers Argent

| Arc | Aperçu | Condition | Type | Surface | Priorité |
|-----|--------|-----------|:----:|:-------:|:--------:|
| arc2.1 | Belle session sur "…". Plus que 2 sessions à 16/20 pour passer Argent. | Règle level 1 · `guidedSessionsAbove80 === 1` | ✱ | D+E | 10 |
| arc2.2 | Plus qu'une session à 16/20 et le mode direct est à toi sur "…". | Règle level 1 · `guidedSessionsAbove80 === 2` | ✱ | D+E | 11 |
| arc2.4 | Le mode direct, c'est exigeant. Refais un guidé pour te remettre dedans. | Règle level 2 · session directe faite · 0 session ≥ 80 % | ✱ | D | 35 |

---

### Progression vers Couronne

| Arc | Aperçu | Condition | Type | Surface | Priorité |
|-----|--------|-----------|:----:|:-------:|:--------:|
| arc3.1 | 1 session directe validée sur "…". Plus que 2 pour décrocher ta couronne + 100 pièces. | Règle level 2 · `directSessionsAbove80 === 1` | ✱ | D+E | 8 |
| arc3.2 | Plus qu'une session directe à 16/20 sur "…" et la couronne tombe. | Règle level 2 · `directSessionsAbove80 === 2` | ✱ | D+E | 9 |
| arc3.4 | Tu as N couronnes. Et si tu attaquais une nouvelle règle ? | `crownCount >= 2` · `bronzeCount < 50 % des règles` | ✱ | D | 34 |

---

### Progression vers Diamant

| Arc | Aperçu | Condition | Type | Surface | Priorité |
|-----|--------|-----------|:----:|:-------:|:--------:|
| arc4.8 | Ton diamant sur "…" se ternit — fais sa révision avant qu'il ne se brise. | Règle level 4 · révision en retard (`nextReviewDate < today`) | ✱ | D+E | 4 |
| arc4.5 | Ta première révision diamant est prévue aujourd'hui. | Au moins une règle level 4 · `nextReviewDate === today` | ✱ | D+E | 5 |
| arc4.1 | 18/20 en direct sur "…". 2 sessions consécutives encore à 18/20 et c'est le diamant. | Règle level 3 · `directConsecutiveAbove90 === 1` | ✱ | D+E | 6 |
| arc4.2 | Plus qu'une session à 18/20 sur "…" et le diamant est à toi. | Règle level 3 · `directConsecutiveAbove90 === 2` | ✱ | D+E | 7 |

---

### Flamme et série

| Arc | Aperçu | Condition | Type | Surface | Priorité |
|-----|--------|-----------|:----:|:-------:|:--------:|
| arc5.8 | Plus que N h pour sauver ta flamme de X jours. | `streak > 0` · pas joué aujourd'hui · `hour >= 16` | ↩ | D+E | 3 |
| arc5.1 | Ta flamme est lancée. Reviens demain, c'est tout. | `streak === 1` | ✱ | D | 32 |
| arc5.2 | Deux jours d'affilée. Demain, palier "Sur la lancée". | `streak === 2` | ✱ | D | 33 |
| arc5.3 | Demain ta flamme passe à 7 jours — 100 pièces. | `streak === 6` · pas joué aujourd'hui | ✱ | D | 31 |
| arc5.9 | Flamme à 0. On redémarre aujourd'hui — un quiz, et c'est reparti. | `streak === 0` · ou `streak === 1` avec `longest > 1` | ✱ | D+E | 34 |

---

### Bouclier

| Arc | Aperçu | Condition | Type | Surface | Priorité |
|-----|--------|-----------|:----:|:-------:|:--------:|
| arc13.3 | N jours sans bouclier, c'est jouer avec le feu. 160 pièces et tu dors tranquille. | `streak >= 7` · `shields === 0` · `coins >= 160` | ✱ | D | 16 |
| arc13.2 | Ta flamme de N jours vaut le coup d'être protégée — un bouclier pour 160 pièces. | `3 ≤ streak < 7` · `shields === 0` · `coins >= 160` | ✱ | D | 17 |
| arc13.4 | Tu as 1 bouclier. À ta flamme de N jours, le second pour 160 pièces fait du bien. | `streak >= 14` · `shields === 1` · `coins >= 160` | ✱ | D | 18 |
| arc13.1 | 160 pièces = 1 bouclier. Si tu rates un jour, ta flamme est sauvée. | `streak < 3` · `shields === 0` · `coins >= 160` | ✱ | D | 19 |

---

### Boutique et achats

| Arc | Aperçu | Condition | Type | Surface | Priorité |
|-----|--------|-----------|:----:|:-------:|:--------:|
| arc6.3 | 250 pièces — adopte le Panda Samouraï dans la boutique. | `coins >= 250` · `ownedChars === 0` | ✱ | D | 22 |
| arc6.4 | Plus que N pièces pour adopter un 2e perso. | `450 ≤ coins < 500` · `ownedChars >= 1` | ✱ | D | 23 |
| arc6.5 | 500 pièces — choisis ton 2e perso parmi 14. | `coins >= 500` · `ownedChars === 1` | ✱ | D | 24 |
| arc6.7 | N pièces = 1 nouvelle émotion pour ton perso. | `coins >= emotionPrice` · perso possédé · 0 émotion sur ce perso | ✱ | D | 25 |
| arc6.6 | 500 pièces — un nouveau perso à ajouter à ta collection. | `coins >= 500` · `ownedChars >= 2` | ✱ | D | 26 |
| arc6.13 | Plus que N pièces. Une session à 16/20 = +20 pièces, vite ! | `coins < 30` · `streak > 0` | ✱ | D | 27 |
| arc6.1 | 80 pièces — tu peux changer le thème de ton dashboard. | `coins >= 80` · aucun thème acheté | ✱ | D | 28 |
| arc6.8 | 60 pièces = 1 morceau d'image mystère. | `coins >= 60` · aucun morceau encore dévoilé | ✱ | D | 36 |
| arc6.10 | 190 pièces — débloque une animation de victoire. | `coins >= 190` · pas d'animation victoire | ✱ | D | 37 |
| arc6.11 | 300 pièces — débloque un effet plein écran. | `coins >= 300` · pas d'animation entrée | ✱ | D | 38 |
| arc6.12 | 320 pièces — un thème premium est à ta portée. | `coins >= 320` · pas de thème premium | ✱ | D | 39 |
| arc6.9 | 2 morceaux dévoilés aujourd'hui. Reviens demain. | `daily.count >= 2` aujourd'hui | ✱ | D | 49 |

---

### Boosts

| Arc | Aperçu | Condition | Type | Surface | Priorité |
|-----|--------|-----------|:----:|:-------:|:--------:|
| arc7.1 | Lundi : tu peux relancer le boost Double coins ×2 pour 5 sessions. | Lundi · `coins >= 100` · pas de boost actif | ✱ | D | 40 |
| arc7.2 | Double coins actif — encore N sessions ×2. | Boost doubleCoins actif · sessions restantes > 0 | ↩ | D | 41 |

---

### Dictée

| Arc | Aperçu | Condition | Type | Surface | Priorité |
|-----|--------|-----------|:----:|:-------:|:--------:|
| arc8.1 | Tu maîtrises les règles ? C'est le moment d'apprendre de nouveaux mots de vocabulaire. | Au moins une règle niveau bronze | ✱ | D | 42 |

---

### Retour après absence

| Arc | Aperçu | Condition | Type | Surface | Priorité |
|-----|--------|-----------|:----:|:-------:|:--------:|
| arc9.5 | Désolé pour ta flamme mais content de te revoir ! | `streak === 1` · `longest > 1` | ✱ | D+E | 43 |

---

### Maîtrise complète

| Arc | Aperçu | Condition | Type | Surface | Priorité |
|-----|--------|-----------|:----:|:-------:|:--------:|
| arc10.1 | Toutes tes règles ont leur couronne. Maintenant, vise les diamants. | Toutes les règles à level ≥ 3 | ✱ | D | 44 |
| arc10.2 | Tous tes diamants sont en place. Légende. | Toutes les règles à level 4 | ✱ | D | 45 |
| arc10.3 | 5 diamants vivants. Aucune révision en retard. | ≥ 5 règles level 4 · `nextReviewDate > today` · pas de révision due | ✱ | D | 46 |
| arc10.4 | Aucune révision aujourd'hui. Profites-en pour apprendre de nouveaux mots. | ≥ 1 règle level 4 · aucune révision due | ✱ | D | 47 |

---

### Images mystère

| Arc | Aperçu | Condition | Type | Surface | Priorité |
|-----|--------|-----------|:----:|:-------:|:--------:|
| arc11.1 | Premier morceau dévoilé. Encore 5 morceaux pour voir l'image complète. | `revealedCount === 1` sur une collection | ✱ | D | 48 |
| arc11.2 | Moitié de l'image dévoilée. Plus que 3 morceaux et le mystère tombe. | `revealedCount === 3` sur une collection | ✱ | D | 48 |
| arc11.3 | Plus qu'un morceau pour découvrir l'image entière. | `revealedCount === 5` sur une collection | ✱ | D | 48 |
| arc11.4 | Image mystère complète. Bravo. Une nouvelle image t'attend dans la boutique. | `revealedCount >= 6` sur une collection | ✱ | D | 48 |

---

### Personnages et émotions

| Arc | Aperçu | Condition | Type | Surface | Priorité |
|-----|--------|-----------|:----:|:-------:|:--------:|
| arc12.2 | Émotion "X" débloquée pour ton perso. Maintenant il t'applaudit. | Première émotion boutique achetée | ✱ | D | 12 |
| arc12.3 | Ton perso a N émotion(s) sur 7. Vise "victoire" — il s'active sur ≥ 18/20. | `1 ≤ ownedEmotions ≤ 2` sur un perso | ✱ | D | 13 |
| arc12.4 | Ton perso a 4 émotions sur 7. Plus que 3 pour le compléter. | `ownedEmotions === 4` sur un perso | ✱ | D | 14 |
| arc12.5 | Perso complet — toutes ses émotions sont à toi. N persos restants. | `ownedEmotions === 7` sur un perso | ✱ | D | 15 |

---

### Sessions du jour

Ces messages sont évalués en **dernier** (priorité 50+). Ils ne s'affichent que si aucun autre arc plus prioritaire n'est éligible.

| Arc | Aperçu | Condition | Type | Surface | Priorité |
|-----|--------|-----------|:----:|:-------:|:--------:|
| arc14.0a | N jours d'affilée ! Un seul quiz pour garder ta flamme et passer à N+1. | Pas joué aujourd'hui · `streak >= 1` · dernier arc affiché ≠ arc14.0a | ↩ | D | 51 |
| arc14.0b | Fais ton quiz aujourd'hui pour débloquer le bonus du jour de 10 pièces d'or ! | Pas joué aujourd'hui · dernier arc affiché ≠ arc14.0b | ↩ | D | 52 |
| arc14.5 | N quiz aujourd'hui — nouveau record sur X jours ! | `sessionsToday >= 4` · record battu sur 3j, 7j ou 30j | ↩ | D | 53 |
| arc14.6 | Plus qu'1 (ou 2) quiz pour battre ton record de N sur X jours ! | `sessionsToday >= 3` · à 1 ou 2 du record | ↩ | D | 54 |
| arc14.4 | N quiz aujourd'hui, c'est plus qu'hier (M). Belle progression ! | `sessionsToday >= 3` · `sessionsToday > yesterdaySessions > 0` | ↩ | D | 55 |
| arc14.3 | 3e quiz aujourd'hui, tu es en feu ! Continue comme ça. | `sessionsToday === 3` | ↩ | D | 56 |
| arc14.2 | Bravo pour ce 2e quiz ! Chaque session renforce ta mémoire. | `sessionsToday === 2` | ↩ | D | 57 |
| arc14.1 | +1 jour ! Ta flamme est à N jours. Bien joué ! | `sessionsToday === 1` · `streak >= 2` | ↩ | D | 58 |

---

## Règles

| ID | Règle | Critère de succès |
|----|-------|-------------------|
| C01 | Un nouveau joueur voit le message de bienvenue | Le message "premier quiz" s'affiche quand aucune session n'a été faite |
| C02 | Un message déjà vu ne réapparaît pas | Après affichage, il ne revient plus |
| C03 | La flamme en danger alerte après 16h | Le soir, si le joueur n'a pas joué et a une flamme active, l'alerte apparaît |
| C04 | Pas d'alerte flamme avant 16h | L'alerte n'apparaît pas avant 16h |
| C05 | Les messages uniques sont marqués définitivement | Un message unique ne revient jamais |
| C06 | Les messages récurrents peuvent revenir | Un message récurrent peut réapparaître plus tard |
| C07 | Le compteur de messages repart à zéro chaque jour | Le lendemain, le compteur est réinitialisé |
| C08 | L'écran de fin ne montre que certains messages | Seuls les messages de progression apparaissent après un quiz |
| C09 | Le message de bienvenue est réservé au dashboard | Il n'apparaît jamais sur l'écran de fin |
| C10 | Le message le plus prioritaire gagne | Quand deux messages sont éligibles, le plus prioritaire est choisi |
| C11 | Assez de pièces sans personnage → suggestion | Le joueur avec 250+ pièces et 0 personnage reçoit une suggestion |
| C12 | Longue série sans bouclier → alerte | Le joueur avec 7+ jours et 0 bouclier voit un message d'alerte |
| C13 | Perte de la flamme → réconfort | Le joueur dont la flamme est tombée voit un encouragement |
| C14 | Le total de sessions est bien calculé | La somme des sessions de toutes les règles est correcte |
| C15 | Seuls les personnages sont comptés | Les émotions et thèmes ne comptent pas comme personnages |
| C16 | Les émotions sont filtrées par personnage | Les émotions du dragon ne comptent pas dans celles du panda |
| N13 | Nudge matin avec flamme active | Le matin sans session et avec une flamme, un message de rappel est affiché |
| N33 | Le personnage associé à une règle est stable par jour | Le même personnage est affiché pour la même règle le même jour |

## Voir aussi

- [Dashboard enfant](03-dashboard-enfant.md)
- [Flamme et série](04-flamme-serie.md)
- [Économie et récompenses](14-economie-recompenses.md)
- [Boutique](11-boutique.md)
- [Personnages](12-personnages.md)

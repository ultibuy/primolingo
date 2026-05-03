# Coaching et messages

## Description

Un bandeau de motivation s'affiche sur le dashboard enfant avec un message personnalisé. Le message dépend de la situation du joueur : nouveau, en progression, flamme en danger, proche d'un palier, etc. Chaque message a une priorité, et un seul s'affiche à la fois.

## Galerie des icones SVG du bandeau

Chaque message de coaching utilise une icone SVG adaptee au contexte. Les icones sont definies dans `MotivationBanner.jsx` via le composant `BannerSvgIcon`. Les couleurs (`accent`, `secondary`) varient selon le theme actif.

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:12px;margin:1rem 0 2rem">
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px;text-align:center">
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none"><rect x="5" y="6" width="30" height="28" rx="7" fill="#f5b40022" stroke="#ff8a4788" stroke-width="1.2"/><path d="M11 27.5h18" stroke="#f5b40088" stroke-width="2" stroke-linecap="round"/><path d="M12 25l6-7 5 4 6-10" stroke="#ff8a47" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M27 12h3v3" stroke="#ff8a47" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div style="font-size:.72rem;color:#9ca3af;margin-top:6px;font-weight:700">Progression</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px;text-align:center">
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none"><path d="M14 10h12v5c0 6-2.7 10-6 10s-6-4-6-10v-5Z" fill="#fbbf2433" stroke="#fbbf24" stroke-width="2.4"/><path d="M14 13H9c0 4 2 7 5.7 7.8M26 13h5c0 4-2 7-5.7 7.8" stroke="#fbbf24" stroke-width="2.4" stroke-linecap="round"/><path d="M20 25v5M14 31h12" stroke="#fb923c" stroke-width="2.6" stroke-linecap="round"/></svg>
    <div style="font-size:.72rem;color:#9ca3af;margin-top:6px;font-weight:700">Trophee</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px;text-align:center">
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none"><rect x="9" y="17" width="22" height="15" rx="3" fill="#a78bfa24" stroke="#a78bfa" stroke-width="2.3"/><path d="M20 17v15M8 17h24" stroke="#c4b5fd" stroke-width="2.3" stroke-linecap="round"/><path d="M20 16c-5-1-7-3-6-5 1.3-2.5 5 0 6 5Zm0 0c5-1 7-3 6-5-1.3-2.5-5 0-6 5Z" stroke="#a78bfa" stroke-width="2.1" stroke-linejoin="round"/></svg>
    <div style="font-size:.72rem;color:#9ca3af;margin-top:6px;font-weight:700">Cadeau</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px;text-align:center">
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none"><path d="M22.5 5.5c1 6-4 8.3-1.4 12.5 1.9-2.2 3.9-4.4 4.2-7 4.2 4.4 6.1 8.3 6.1 13 0 6-4.9 10-11.1 10S9.2 30.1 9.2 24.1c0-4.8 2.9-8.2 6.3-11.5 2.1-2 4.2-4.1 7-7.1Z" fill="#fb923c28" stroke="#fb923c" stroke-width="2.2" stroke-linejoin="round"/><path d="M21 22c2.3 2.4 3.2 4.3 3.2 6.2 0 2.3-1.8 3.8-4.2 3.8s-4.2-1.5-4.2-3.8c0-2.2 1.4-3.8 3.5-6.2.5 1.6 1.1 2.7 1.7 3.5.4-.9.4-2 .1-3.5Z" fill="#fbbf24"/></svg>
    <div style="font-size:.72rem;color:#9ca3af;margin-top:6px;font-weight:700">Flamme</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px;text-align:center">
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none"><path d="M12 8h16l6 8-14 17L6 16l6-8Z" fill="#60a5fa30" stroke="#60a5fa" stroke-width="2.2" stroke-linejoin="round"/><path d="M6 16h28M12 8l4 8 4-8 4 8 4-8M16 16l4 17 4-17" stroke="#93c5fd" stroke-width="1.8" stroke-linejoin="round" opacity=".9"/></svg>
    <div style="font-size:.72rem;color:#9ca3af;margin-top:6px;font-weight:700">Diamant</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px;text-align:center">
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none"><path d="M8 29h24l2-15-8 6-6-10-6 10-8-6 2 15Z" fill="#fbbf2430" stroke="#fbbf24" stroke-width="2.4" stroke-linejoin="round"/><path d="M10 32h20" stroke="#fb923c" stroke-width="2.5" stroke-linecap="round"/></svg>
    <div style="font-size:.72rem;color:#9ca3af;margin-top:6px;font-weight:700">Couronne</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px;text-align:center">
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none"><path d="M20 6 31 10v8c0 7.3-4.2 12.8-11 16-6.8-3.2-11-8.7-11-16v-8l11-4Z" fill="#93c5fd24" stroke="#93c5fd" stroke-width="2.4" stroke-linejoin="round"/><path d="m14.5 20 3.8 3.8 7.6-8.1" stroke="#c4b5fd" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div style="font-size:.72rem;color:#9ca3af;margin-top:6px;font-weight:700">Bouclier</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px;text-align:center">
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="13" fill="#a78bfa24" stroke="#a78bfa" stroke-width="2.3"/><path d="M20 11v18M11 20h18" stroke="#c4b5fd" stroke-width="2.4" stroke-linecap="round"/></svg>
    <div style="font-size:.72rem;color:#9ca3af;margin-top:6px;font-weight:700">Default</div>
  </div>
</div>

---

## Catalogue complet des messages

### Onboarding et bienvenue

**arc1.1** — Fais ton premier quiz pour remporter 200 pièces de bienvenue.

![arc1.1](screenshots/coaching-arc1.1.png)

**arc1.3** — Pas grave, le bonus de 200 pièces t'attend dès que tu finis une session avec au moins 12/20.

![arc1.3](screenshots/coaching-arc1.3.png)

**arc1.5** — C'est bon, tu peux débloquer le Panda — va faire un tour dans la boutique.

![arc1.5](screenshots/coaching-arc1.5.png)

**arc1.4** — Plus que 50 pièces pour débloquer le Panda Samouraï.

![arc1.4](screenshots/coaching-arc1.4.png)

**arc1.7.streak5** — Plus que 2 jours pour atteindre 7 jours et empocher 100 pièces.

![arc1.7.streak5](screenshots/coaching-arc1.7.streak5.png)

**arc1.7.streak6** — Demain ta flamme passe à 7 jours — 100 pièces à la clé.

![arc1.7.streak6](screenshots/coaching-arc1.7.streak6.png)

---

### Progression vers Argent

**arc2.1** — Belle session sur "a / à / as". Plus que 2 sessions à 16/20 pour passer Argent.

![arc2.1](screenshots/coaching-arc2.1.png)

**arc2.2** — Plus qu'une session à 16/20 et le mode direct est à toi sur "a / à / as".

![arc2.2](screenshots/coaching-arc2.2.png)

**arc2.4** — Le mode direct, c'est exigeant. Refais un guidé pour te remettre dedans, le mode direct t'attendra.

![arc2.4](screenshots/coaching-arc2.4.png)

---

### Progression vers Couronne

**arc3.1** — 1 session directe validée sur "a / à / as". Plus que 2 pour décrocher ta couronne + 100 pièces.

![arc3.1](screenshots/coaching-arc3.1.png)

**arc3.2** — Plus qu'une session directe à 16/20 sur "a / à / as" et la couronne tombe.

![arc3.2](screenshots/coaching-arc3.2.png)

**arc3.4** — Tu as 2 couronnes. Et si tu attaquais une nouvelle règle ? Il en reste 18 à découvrir.

![arc3.4](screenshots/coaching-arc3.4.png)

---

### Progression vers Diamant

**arc4.8** — Ton diamant sur "a / à / as" se ternit — fais sa révision avant qu'il ne se brise.

![arc4.8](screenshots/coaching-arc4.8.png)

**arc4.5** — Ta première révision diamant est prévue aujourd'hui — fais-la pour que le diamant brille.

![arc4.5](screenshots/coaching-arc4.5.png)

**arc4.1** — 18/20 en direct sur "a / à / as". 2 sessions consécutives encore à 18/20 minimum et c'est le diamant.

![arc4.1](screenshots/coaching-arc4.1.png)

**arc4.2** — Plus qu'une session à 18/20 sur "a / à / as" et le diamant est à toi. Concentration.

![arc4.2](screenshots/coaching-arc4.2.png)

---

### Flamme et série

**arc5.8** — Plus que 7 h pour sauver ta flamme de 12 jours. Une session de 5 minutes suffit.

![arc5.8](screenshots/coaching-arc5.8.png)

**arc5.3** — Demain ta flamme passe à 7 jours — 100 pièces.

![arc5.3](screenshots/coaching-arc5.3.png)

**arc5.1** — Ta flamme est lancée. Reviens demain, c'est tout.

![arc5.1](screenshots/coaching-arc5.1.png)

**arc5.2** — Deux jours d'affilée. Demain, palier "Sur la lancée".

![arc5.2](screenshots/coaching-arc5.2.png)

**arc5.9** — Flamme à 0. On redémarre aujourd'hui — un quiz, et c'est reparti.

![arc5.9](screenshots/coaching-arc5.9.png)

---

### Boutique et achats

**arc6.3** — 250 pièces — adopte le Panda Samouraï dans la boutique, il vient avec ses 3 émotions de base.

![arc6.3](screenshots/coaching-arc6.3.png)

**arc6.4** — Plus que 50 pièces pour adopter un 2e perso.

![arc6.4](screenshots/coaching-arc6.4.png)

**arc6.5** — 500 pièces — choisis ton 2e perso parmi 14 (Dragon, Lion, Loup, Cosmonaute…).

![arc6.5](screenshots/coaching-arc6.5.png)

**arc6.7** — 130 pièces = 1 nouvelle émotion pour ton Panda Samouraï 🐼. Va dans la boutique → Persos.

![arc6.7](screenshots/coaching-arc6.7.png)

**arc6.6** — 500 pièces — un nouveau perso à ajouter à ta collection.

![arc6.6](screenshots/coaching-arc6.6.png)

**arc6.13** — Plus que 15 pièces. Une session à 16/20 = +20 pièces, vite !

![arc6.13](screenshots/coaching-arc6.13.png)

**arc6.1** — 80 pièces — tu peux changer le thème de ton dashboard dans la boutique.

![arc6.1](screenshots/coaching-arc6.1.png)

**arc6.8** — 60 pièces = 1 morceau d'image mystère. Découvre ton image cachée morceau par morceau.

![arc6.8](screenshots/coaching-arc6.8.png)

**arc6.10** — 190 pièces — débloque une animation de victoire sur ton écran de fin de quiz.

![arc6.10](screenshots/coaching-arc6.10.png)

**arc6.11** — 300 pièces — débloque un effet plein écran pour tes prochains paliers.

![arc6.11](screenshots/coaching-arc6.11.png)

**arc6.12** — 320 pièces — un thème premium est à ta portée (Aurora, Midnight Purple).

![arc6.12](screenshots/coaching-arc6.12.png)

**arc6.9** — 2 morceaux dévoilés aujourd'hui. Reviens demain pour 2 nouveaux morceaux.

![arc6.9](screenshots/coaching-arc6.9.png)

---

### Boosts

**arc7.1** — Lundi : tu peux relancer le boost Double coins ×2 pour 5 sessions.

![arc7.1](screenshots/coaching-arc7.1.png)

**arc7.2** — Double coins actif — encore 3 sessions ×2.

![arc7.2](screenshots/coaching-arc7.2.png)

---

### Dictée

**arc8.1** — Tu maîtrises les règles ? Va apprendre de nouveaux mots dans le second onglet.

![arc8.1](screenshots/coaching-arc8.1.png)

---

### Retour après absence

**arc9.5** — Tu es de retour. Demain, ta flamme passe à 2.

![arc9.5](screenshots/coaching-arc9.5.png)

---

### Maîtrise complète

**arc10.1** — Toutes tes règles ont leur couronne. Maintenant, vise les diamants un par un.

![arc10.1](screenshots/coaching-arc10.1.png)

**arc10.2** — Tous tes diamants sont en place. Légende. À toi de les maintenir.

![arc10.2](screenshots/coaching-arc10.2.png)

**arc10.3** — 5 diamants vivants. Aucune révision en retard. Tu es chez les meilleurs.

![arc10.3](screenshots/coaching-arc10.3.png)

**arc10.4** — Aucune révision aujourd'hui. Profites-en pour apprendre de nouveaux mots dans le second onglet.

![arc10.4](screenshots/coaching-arc10.4.png)

---

### Images mystère

**arc11.1** — Premier morceau dévoilé. Encore 5 morceaux pour voir l'image complète.

![arc11.1](screenshots/coaching-arc11.1.png)

**arc11.2** — Moitié de l'image dévoilée. Plus que 3 morceaux et le mystère tombe.

![arc11.2](screenshots/coaching-arc11.2.png)

**arc11.3** — Plus qu'un morceau pour découvrir l'image entière.

![arc11.3](screenshots/coaching-arc11.3.png)

**arc11.4** — Image mystère complète. Bravo. Une nouvelle image t'attend dans la boutique.

![arc11.4](screenshots/coaching-arc11.4.png)

---

### Personnages et émotions

**arc12.2** — Émotion "bravo" débloquée pour ton Panda Samouraï 🐼. Maintenant il t'applaudit à chaque bonne réponse.

![arc12.2](screenshots/coaching-arc12.2.png)

**arc12.3** — Ton Panda Samouraï 🐼 a 2 émotions sur 7. Vise "victoire" — il s'active sur tes scores ≥ 18/20.

![arc12.3](screenshots/coaching-arc12.3.png)

**arc12.4** — Ton Panda Samouraï 🐼 a 4 émotions sur 7. Plus que 3 pour le compléter.

![arc12.4](screenshots/coaching-arc12.4.png)

**arc12.5** — Panda Samouraï 🐼 complet — toutes ses émotions sont à toi. 14 persos restants à collectionner.

![arc12.5](screenshots/coaching-arc12.5.png)

---

### Bouclier

**arc13.3** — 12 jours sans bouclier, c'est jouer avec le feu. 160 pièces et tu dors tranquille.

![arc13.3](screenshots/coaching-arc13.3.png)

**arc13.2** — Ta flamme de 5 jours vaut le coup d'être protégée — un bouclier pour 160 pièces.

![arc13.2](screenshots/coaching-arc13.2.png)

**arc13.4** — Tu as 1 bouclier. À ta flamme de 14 jours, le second pour 160 pièces fait du bien.

![arc13.4](screenshots/coaching-arc13.4.png)

**arc13.1** — 160 pièces = 1 bouclier. Si tu rates un jour, ta flamme est sauvée.

![arc13.1](screenshots/coaching-arc13.1.png)

---

### Sessions du jour

**arc14.0a** — 12 jours d'affilée ! Un seul quiz pour garder ta flamme et passer à 13.

![arc14.0a](screenshots/coaching-arc14.0a.png)

**arc14.0b** — Fais ton quiz aujourd'hui pour débloquer le bonus du jour de 10 pièces d'or !

![arc14.0b](screenshots/coaching-arc14.0b.png)

**arc14.5** — 3 quiz aujourd'hui — nouveau record sur 7 jours !

![arc14.5](screenshots/coaching-arc14.5.png)

**arc14.6** — Plus qu'1 quiz pour battre ton record de 5 sur 7 jours !

![arc14.6](screenshots/coaching-arc14.6.png)

**arc14.6** — Plus que 2 quiz pour battre ton record de 5 sur 7 jours !

![arc14.6](screenshots/coaching-arc14.6.png)

**arc14.4** — 3 quiz aujourd'hui, c'est plus qu'hier (2). Belle progression !

![arc14.4](screenshots/coaching-arc14.4.png)

**arc14.3** — 3e quiz aujourd'hui, tu es en feu ! Continue comme ça.

![arc14.3](screenshots/coaching-arc14.3.png)

**arc14.2** — Bravo pour ce 2e quiz ! Chaque session renforce ta mémoire.

![arc14.2](screenshots/coaching-arc14.2.png)

**arc14.1** — +1 jour ! Ta flamme est à 12 jours. Bien joué !

![arc14.1](screenshots/coaching-arc14.1.png)

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

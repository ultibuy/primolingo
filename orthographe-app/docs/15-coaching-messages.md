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
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#f5b400" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
    <div style="font-size:.72rem;color:#9ca3af;margin-top:6px;font-weight:700">Panier</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px;text-align:center">
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none"><defs><radialGradient id="cO" cx="35%" cy="35%"><stop offset="0%" stop-color="#ffe066"/><stop offset="40%" stop-color="#fbbf24"/><stop offset="80%" stop-color="#d4940a"/><stop offset="100%" stop-color="#92650a"/></radialGradient><radialGradient id="cI" cx="40%" cy="40%"><stop offset="0%" stop-color="#ffe680"/><stop offset="60%" stop-color="#f5c842"/><stop offset="100%" stop-color="#c8920a"/></radialGradient></defs><circle cx="20" cy="20" r="18" fill="url(#cO)"/><circle cx="20" cy="20" r="14" fill="url(#cI)"/><circle cx="20" cy="20" r="17" fill="none" stroke="#ffe680" stroke-width="0.8" opacity="0.6"/><circle cx="20" cy="20" r="14" fill="none" stroke="#d4940a" stroke-width="0.6" opacity="0.5"/><text x="20" y="25.5" text-anchor="middle" font-size="16" font-weight="900" fill="#b8860b" opacity="0.4" font-family="serif">O</text><text x="20" y="25" text-anchor="middle" font-size="16" font-weight="900" fill="#ffe680" opacity="0.7" font-family="serif">O</text><ellipse cx="14" cy="12" rx="6" ry="3" fill="white" opacity="0.25" transform="rotate(-20 14 12)"/></svg>
    <div style="font-size:.72rem;color:#9ca3af;margin-top:6px;font-weight:700">Piece</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px;text-align:center">
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="14" fill="#ff8a4720" stroke="#ff8a47" stroke-width="2"/><path d="M14 22l4-8h4l-2 5h6l-6 10h-4l2-5h-4Z" fill="#ff8a47"/></svg>
    <div style="font-size:.72rem;color:#9ca3af;margin-top:6px;font-weight:700">Force</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px;text-align:center">
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="14" stroke="#ff8a47" stroke-width="2"/><circle cx="20" cy="20" r="9" stroke="#ff8a47" stroke-width="1.5" opacity="0.6"/><circle cx="20" cy="20" r="4" stroke="#ff8a47" stroke-width="1.5" opacity="0.6"/><circle cx="20" cy="20" r="1.5" fill="#ff8a47"/></svg>
    <div style="font-size:.72rem;color:#9ca3af;margin-top:6px;font-weight:700">Cible</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px;text-align:center">
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="14" fill="#f5b40020" stroke="#f5b400" stroke-width="2"/><path d="m13 20 4.5 4.5 9-9" stroke="#f5b400" stroke-width="2.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div style="font-size:.72rem;color:#9ca3af;margin-top:6px;font-weight:700">Valide</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:12px;text-align:center">
    <svg width="34" height="34" viewBox="0 0 40 40" fill="none"><circle cx="20" cy="20" r="13" fill="#a78bfa24" stroke="#a78bfa" stroke-width="2.3"/><path d="M20 11v18M11 20h18" stroke="#c4b5fd" stroke-width="2.4" stroke-linecap="round"/></svg>
    <div style="font-size:.72rem;color:#9ca3af;margin-top:6px;font-weight:700">Default</div>
  </div>
</div>

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

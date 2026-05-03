# SVG crees pendant la refonte design

Cette page recense les SVG applicatifs ajoutes pour remplacer les emojis et stabiliser la charte PrimoLingo. Les composants sont en React, configurables par `size` et souvent par `color`.

## Librairie centralisee

Fichier source : `src/components/icons/ProductIcons.jsx`

Ces icones sont les SVG reutilisables de reference. Elles doivent etre privilegiees avant de recreer un SVG inline dans un composant.

## Galerie visuelle

Les apercus ci-dessous sont des SVG inline dans la documentation. Ils doivent permettre de verifier rapidement le style sans ouvrir le code.

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;margin:1rem 0 2rem">
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 4h10v2.5c0 2.76-2.24 5-5 5s-5-2.24-5-5V4z" fill="#fbbf24"/><path d="M5 4H7v2c0 1.1-.45 2.1-1.17 2.83A4 4 0 014 6V5a1 1 0 011-1z" fill="#fbbf24" opacity=".6"/><path d="M19 4h-2v2c0 1.1.45 2.1 1.17 2.83A4 4 0 0020 6V5a1 1 0 00-1-1z" fill="#fbbf24" opacity=".6"/><rect x="10" y="11" width="4" height="4" rx=".5" fill="#fbbf24" opacity=".7"/><rect x="8" y="15" width="8" height="2.5" rx="1" fill="#fbbf24"/><rect x="7" y="17.5" width="10" height="1.5" rx=".75" fill="#fbbf24" opacity=".5"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">TrophyIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="9" r="6" fill="#d7dde8" opacity=".2" stroke="#d7dde8" stroke-width="1.5"/><circle cx="12" cy="9" r="3" fill="#d7dde8" opacity=".5"/><path d="M9 14l-2 7 5-2.5L17 21l-2-7" fill="#d7dde8" opacity=".65"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">ChartMedalIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3h10v3c0 2.76-2.24 5-5 5s-5-2.24-5-5V3z" fill="#fbbf24" opacity=".3" stroke="#fbbf24" stroke-width="1.5"/><path d="M5 3H7v2a3 3 0 01-3 3V5a2 2 0 012-2z" fill="#fbbf24" opacity=".5"/><path d="M19 3h-2v2a3 3 0 003 3V5a2 2 0 00-2-2z" fill="#fbbf24" opacity=".5"/><rect x="10.5" y="10.5" width="3" height="3.5" rx=".5" fill="#fbbf24" opacity=".6"/><rect x="8" y="14" width="8" height="2" rx="1" fill="#fbbf24"/><line x1="7" y1="19" x2="17" y2="19" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round" opacity=".4"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">ChartTrophyIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2.5" fill="#9ca3af"/><path d="M8 10V7a4 4 0 118 0v3" stroke="#9ca3af" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="12" cy="15" r="1.5" fill="#1e1e2e"/><rect x="11.25" y="15.5" width="1.5" height="2.5" rx=".75" fill="#1e1e2e"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">LockIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2.5" fill="#34d399"/><path d="M8 10V7a4 4 0 017.87-.8" stroke="#34d399" stroke-width="2.2" fill="none" stroke-linecap="round"/><circle cx="12" cy="15" r="1.5" fill="#1e1e2e"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">UnlockIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#34d399" opacity=".15"/><path d="M7.5 12.5l3 3 6-6" stroke="#34d399" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">CheckIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#f87171" opacity=".15"/><path d="M8.5 8.5l7 7M15.5 8.5l-7 7" stroke="#f87171" stroke-width="2.2" stroke-linecap="round"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">CrossIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1.5" fill="#a78bfa"/><rect x="5" y="12" width="14" height="8" rx="1.5" fill="#a78bfa" opacity=".75"/><rect x="11" y="8" width="2" height="12" fill="#1e1e2e" opacity=".3"/><path d="M12 8c-1-3-4-4-4-2s3 2 4 2z" fill="#a78bfa"/><path d="M12 8c1-3 4-4 4-2s-3 2-4 2z" fill="#a78bfa"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">GiftIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="3" width="3" height="18" rx="1.5" fill="#a78bfa" opacity=".6"/><rect x="6" y="3" width="14" height="18" rx="2" fill="#a78bfa" opacity=".2" stroke="#a78bfa" stroke-width="1.3"/><rect x="7.5" y="5" width="11" height="14" rx="1" fill="#a78bfa" opacity=".08"/><line x1="10" y1="8.5" x2="16" y2="8.5" stroke="#a78bfa" stroke-width="1.4" stroke-linecap="round"/><line x1="10" y1="11.5" x2="15" y2="11.5" stroke="#a78bfa" stroke-width="1.4" stroke-linecap="round" opacity=".6"/><line x1="10" y1="14.5" x2="13.5" y2="14.5" stroke="#a78bfa" stroke-width="1.4" stroke-linecap="round" opacity=".4"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">BookIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="9.5" stroke="#a78bfa" stroke-width="1.8"/><circle cx="12" cy="12" r="6" stroke="#a78bfa" stroke-width="1.5" opacity=".65"/><circle cx="12" cy="12" r="2.5" stroke="#a78bfa" stroke-width="1.5" opacity=".65"/><circle cx="12" cy="12" r="1" fill="#a78bfa"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">TargetIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2L1.5 20.5h21L12 2z" fill="#fb923c" opacity=".15" stroke="#fb923c" stroke-width="1.5" stroke-linejoin="round"/><line x1="12" y1="9" x2="12" y2="14" stroke="#fb923c" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="#fb923c"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">WarningIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2l2.5 5.5 5.5.8-4 3.9 1 5.8L12 15l-5 3 1-5.8-4-3.9 5.5-.8z" fill="#f87171" opacity=".2"/><path d="M12 5l1.5 3.3 3.3.5-2.4 2.3.6 3.5L12 12.8l-3 1.8.6-3.5-2.4-2.3 3.3-.5z" fill="#f87171"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">ExplosionIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 15l2-6h2l1 3h6l1-3h2l2 6" stroke="#fb923c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><circle cx="4" cy="15" r="2" fill="#fb923c" opacity=".6"/><circle cx="20" cy="15" r="2" fill="#fb923c" opacity=".6"/><rect x="9" y="10" width="6" height="4" rx="1" fill="#fb923c" opacity=".3"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">StrengthIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2a10 10 0 00-1 19.95c.56.05 1-.4 1-.95v-2.2c0-.83.68-1.5 1.5-1.3a4 4 0 003.4-6.3A10 10 0 0012 2z" fill="#a78bfa" opacity=".15" stroke="#a78bfa" stroke-width="1.5"/><circle cx="8" cy="10" r="1.5" fill="#f87171"/><circle cx="12" cy="7" r="1.5" fill="#fbbf24"/><circle cx="16" cy="10" r="1.5" fill="#34d399"/><circle cx="9" cy="14" r="1.5" fill="#60a5fa"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">PaletteIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 5.5A2.5 2.5 0 015.5 3h5.59a2 2 0 011.41.59l7.41 7.41a2 2 0 010 2.83l-5.59 5.59a2 2 0 01-2.83 0L4.09 12a2 2 0 01-.59-1.41V5.5z" fill="#a78bfa" opacity=".15" stroke="#a78bfa" stroke-width="1.5"/><circle cx="7.5" cy="7.5" r="1.5" fill="#a78bfa"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">TagIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#a78bfa" opacity=".12" stroke="#a78bfa" stroke-width="1.5"/><path d="M10 8l6 4-6 4V8z" fill="#a78bfa"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">MotionIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2l1.8 4.4 4.7.4-3.6 3.1 1.2 4.6L12 12l-4.1 2.5 1.2-4.6L5.5 6.8l4.7-.4z" fill="#fb923c"/><line x1="12" y1="17" x2="12" y2="22" stroke="#fb923c" stroke-width="1.5" stroke-linecap="round" opacity=".5"/><line x1="7" y1="18" x2="5" y2="21" stroke="#fb923c" stroke-width="1.5" stroke-linecap="round" opacity=".4"/><line x1="17" y1="18" x2="19" y2="21" stroke="#fb923c" stroke-width="1.5" stroke-linecap="round" opacity=".4"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">BurstIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7a2 2 0 012-2h3a2 2 0 014 0h3a2 2 0 012 2v3a2 2 0 010 4v3a2 2 0 01-2 2h-3a2 2 0 01-4 0H6a2 2 0 01-2-2v-3a2 2 0 010-4V7z" fill="#a78bfa" opacity=".15" stroke="#a78bfa" stroke-width="1.5"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">PuzzleIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="8" r="4" fill="#a78bfa" opacity=".3" stroke="#a78bfa" stroke-width="1.5"/><path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" fill="#a78bfa" opacity=".15" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">CharacterIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><ellipse cx="10" cy="14" rx="6" ry="3" fill="#fbbf24" opacity=".5"/><ellipse cx="10" cy="12" rx="6" ry="3" fill="#fbbf24" opacity=".7"/><ellipse cx="10" cy="10" rx="6" ry="3" fill="#fbbf24"/><ellipse cx="15" cy="12" rx="5" ry="2.5" fill="#fbbf24" opacity=".35"/><ellipse cx="15" cy="10.5" rx="5" ry="2.5" fill="#fbbf24" opacity=".55"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">CoinsIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M2 14l3-5h2.5" stroke="#a78bfa" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 14l-3-5h-2.5" stroke="#a78bfa" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.5 9l2.5 2 2-1.5 2 1.5 2.5-2" stroke="#a78bfa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 11c-1 1-1 2.5 0 3.5l2 1.5 2-1.5c1-1 1-2.5 0-3.5" fill="#a78bfa" opacity=".2" stroke="#a78bfa" stroke-width="1.3" stroke-linejoin="round"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">HandshakeIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="#a78bfa" opacity=".12" stroke="#a78bfa" stroke-width="1.5"/><path d="M9.5 9a3 3 0 015.5 1.5c0 1.5-2.5 2-2.5 3.5" stroke="#a78bfa" stroke-width="2" stroke-linecap="round"/><circle cx="12" cy="17" r="1" fill="#a78bfa"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">QuestionMarkIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 2L4 6v5c0 5.25 3.4 10.15 8 11.4 4.6-1.25 8-6.15 8-11.4V6l-8-4z" fill="#93c5fd" opacity=".2" stroke="#93c5fd" stroke-width="1.5"/><path d="M12 7v10M8 12h8M9.5 8.5l5 7M14.5 8.5l-5 7" stroke="#93c5fd" stroke-width="1.2" stroke-linecap="round" opacity=".7"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">IceShieldIcon</div>
  </div>
</div>

| Composant | Role principal | Utilisation actuelle / prevue |
| --- | --- | --- |
| `TrophyIcon` | Coupe | Recompense parfaite, fallback de l'ecran de fin quand aucun personnage n'est debloque et que le score est 100 %. |
| `ChartMedalIcon` | Medaille | Fallback de l'ecran de fin quand aucun personnage n'est debloque et que le score n'est pas parfait. |
| `ChartTrophyIcon` | Trophee de stats | Icone de palier/statistique, alternative plus discrete a `TrophyIcon`. |
| `LockIcon` | Cadenas ferme | Etats verrouilles, niveaux ou items non accessibles. |
| `UnlockIcon` | Cadenas ouvert | Deblocage d'un mode, item ou niveau. |
| `CheckIcon` | Validation | Succes, confirmation, etats positifs. |
| `CrossIcon` | Erreur | Reponse fausse, action refusee, etats negatifs. |
| `GiftIcon` | Cadeau | Bonus, recompense, prime. |
| `BookIcon` | Livre | Dictée, lecon, regles, contenu pedagogique. |
| `TargetIcon` | Cible | Quiz, objectif, test parent/enfant. |
| `WarningIcon` | Alerte | Erreur route/app, message important, warning. |
| `ExplosionIcon` | Explosion | Rupture, perte, diamant casse ou effet d'impact. |
| `StrengthIcon` | Force | Encouragement, progression, retour apres echec. |
| `PaletteIcon` | Palette | Themes et personnalisation visuelle. |
| `TagIcon` | Etiquette | Titres cosmetiques. |
| `MotionIcon` | Lecture/mouvement | Ancienne categorie animations de victoire ; a ne plus utiliser pour une coupe. |
| `BurstIcon` | Eclat | Animations d'entree, apparition, effet celebratoire court. |
| `PuzzleIcon` | Puzzle | Images mystere et fragments. |
| `CharacterIcon` | Personnage | Categorie personnages, placeholder de profil/persona. |
| `CoinsIcon` | Pieces | Boosts de pieces, economie, double pieces. |
| `HandshakeIcon` | Accord/aide | Item mystere ou aide speciale. |
| `QuestionMarkIcon` | Question | Question mystere, aide ou item surprise. |
| `IceShieldIcon` | Bouclier glace | Protection de flamme / streak freeze. |

## Emotion Placeholders

SVG de silhouettes montres dans la boutique quand aucun personnage n'est achete. Definis dans `ProductIcons.jsx`, viewBox `0 0 46 46`.

<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:14px;margin:1rem 0 2rem">
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none"><circle cx="23" cy="10" r="5" fill="#a78bfa" opacity=".7"/><path d="M23 16v10" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M23 26l-5 10" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M23 26l5 10" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M17 20l6 2 6-2" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">EmotionWalkIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none"><circle cx="23" cy="10" r="5" fill="#a78bfa" opacity=".7"/><path d="M23 16v6c0 2-2 4-4 5h8c-2-1-4-3-4-5z" fill="#a78bfa" opacity=".4"/><ellipse cx="23" cy="30" rx="7" ry="3" fill="#a78bfa" opacity=".25"/><text x="30" y="12" font-family="Fredoka" font-size="8" font-weight="700" fill="#a78bfa" opacity=".8">Z</text><text x="34" y="7" font-family="Fredoka" font-size="6" font-weight="700" fill="#a78bfa" opacity=".5">z</text></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">EmotionSleepIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none"><circle cx="23" cy="10" r="5" fill="#a78bfa" opacity=".7"/><path d="M23 16v8" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M23 24h-6v8h12v-8z" fill="#a78bfa" opacity=".15" stroke="#a78bfa" stroke-width="1.5"/><path d="M17 20l6 2 6-2" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">EmotionSitIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none"><circle cx="23" cy="10" r="5" fill="#a78bfa" opacity=".7"/><path d="M23 16v10" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M23 26l-5 10" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M23 26l5 10" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M17 21l-3 5" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M29 20l4-6" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M35 11c1-1 2 0 1 1" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round" opacity=".5"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">EmotionWaveIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none"><circle cx="20" cy="12" r="5" fill="#a78bfa" opacity=".7"/><path d="M20 18v8" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M20 26l-4 10" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M20 26l4 10" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M14 22l-2 3M26 21l3-2" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M33 10c-1-2-4-2-4 1 0 3 4 5 4 5s4-2 4-5c0-3-3-3-4-1z" fill="#f87171" opacity=".7"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">EmotionKissIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none"><circle cx="23" cy="10" r="5" fill="#a78bfa" opacity=".7"/><path d="M23 16v10" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M23 26l-5 10" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M23 26l5 10" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M16 19l7 4 7-4" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><line x1="19" y1="16" x2="17" y2="14" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round" opacity=".5"/><line x1="23" y1="18" x2="23" y2="15.5" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round" opacity=".5"/><line x1="27" y1="16" x2="29" y2="14" stroke="#a78bfa" stroke-width="1.5" stroke-linecap="round" opacity=".5"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">EmotionClapIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none"><circle cx="23" cy="10" r="5" fill="#a78bfa" opacity=".7"/><path d="M23 16v10" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M23 26l-5 10" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M23 26l5 10" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M17 20l-5-8" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M29 20l5-8" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><circle cx="10" cy="8" r="1.5" fill="#fbbf24"/><circle cx="36" cy="8" r="1.5" fill="#fbbf24"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">EmotionVictoryIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none"><circle cx="23" cy="9" r="5" fill="#a78bfa" opacity=".7"/><path d="M23 15v8" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M23 23l-7 8 3 5" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M23 23l5 10" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M17 18l-5-2" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M29 18l5-4" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M35 10v5l2-1" stroke="#a78bfa" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" opacity=".4"/><circle cx="35" cy="15" r="1.5" fill="#a78bfa" opacity=".4"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">EmotionDanceIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none"><circle cx="23" cy="11" r="5" fill="#a78bfa" opacity=".7"/><circle cx="23" cy="13" r="1.5" stroke="#a78bfa" stroke-width="1" fill="none" opacity=".6"/><path d="M23 17v9" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M23 26l-5 10" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M23 26l5 10" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M17 20l-5-1" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M29 20l5-1" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><line x1="9" y1="7" x2="9" y2="12" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/><circle cx="9" cy="15" r="1" fill="#fbbf24"/></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">EmotionSurpriseIcon</div>
  </div>
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:14px;text-align:center">
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none"><circle cx="23" cy="11" r="5" fill="#a78bfa" opacity=".7"/><path d="M23 17v9" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M23 26l-5 10" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M23 26l5 10" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M17 21l-4 4" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round"/><path d="M29 20l2-4-4-2" stroke="#a78bfa" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="35" cy="7" r="3" fill="#a78bfa" opacity=".15" stroke="#a78bfa" stroke-width="1"/><circle cx="32" cy="12" r="1.2" fill="#a78bfa" opacity=".2"/><text x="33.5" y="9" font-family="Fredoka" font-size="5" font-weight="700" fill="#a78bfa" opacity=".5">?</text></svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">EmotionThinkIcon</div>
  </div>
</div>

| Composant | Emotion | Pose |
| --- | --- | --- |
| `EmotionWalkIcon` | Marche | Bras ouverts, jambes ecartees |
| `EmotionSleepIcon` | Dodo | Couche, Z flottants |
| `EmotionSitIcon` | Assis | Assis sur un bloc |
| `EmotionWaveIcon` | Salut | Bras leve, lignes de mouvement |
| `EmotionKissIcon` | Bisou | Coeur rouge a cote |
| `EmotionClapIcon` | Bravo | Mains jointes, lignes d'impact |
| `EmotionVictoryIcon` | Victoire | Bras en V, etoiles dorees |
| `EmotionDanceIcon` | Danse | Pose dynamique, note de musique |
| `EmotionSurpriseIcon` | Surprise | Bras ecartes, point d'exclamation |
| `EmotionThinkIcon` | Hesitation | Main au menton, bulle de pensee |

## SVG de marque et de fond

<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:14px;margin:1rem 0 1.5rem">
  <div style="background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;text-align:center">
    <svg width="86" height="86" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="border-radius:22.37%">
      <defs>
        <linearGradient id="doc-logo-bg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#1e1e2e"/><stop offset=".5" stop-color="#2d2b55"/><stop offset="1" stop-color="#1a1a2e"/></linearGradient>
        <linearGradient id="doc-logo-r" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#c4b5fd"/><stop offset="1" stop-color="#a78bfa"/></linearGradient>
        <linearGradient id="doc-logo-f" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fbbf24"/><stop offset="1" stop-color="#fb923c"/></linearGradient>
      </defs>
      <rect width="100" height="100" rx="22.37" fill="url(#doc-logo-bg)"/>
      <circle cx="14" cy="18" r=".7" fill="#fff" opacity=".85"/><circle cx="84" cy="14" r=".6" fill="#fff" opacity=".7"/><circle cx="88" cy="34" r=".9" fill="#fbbf24" opacity=".95"/><circle cx="92" cy="62" r=".55" fill="#c4b5fd" opacity=".85"/>
      <g transform="translate(82 24)"><path d="M0 -3 L0 3 M-3 0 L3 0" stroke="#fbbf24" stroke-width=".7" stroke-linecap="round" opacity=".95"/></g>
      <text x="49" y="92" font-size="13" fill="#c4b5fd" font-family="Fredoka, sans-serif" font-weight="700" opacity=".9">e</text>
      <text x="54" y="80" font-size="14" fill="#fbbf24" font-family="Fredoka, sans-serif" font-weight="700" opacity=".95">a</text>
      <text x="65" y="94" font-size="15" fill="#fff" font-family="Fredoka, sans-serif" font-weight="700" opacity=".95">b</text>
      <g transform="translate(-0.23 -7.76) rotate(-20 50 50)"><path d="M50 12 Q70 30 70 65 L30 65 Q30 30 50 12 Z" fill="#fff"/><path d="M50 12 Q70 30 70 65 L60 65 Q60 30 50 12 Z" fill="url(#doc-logo-r)" opacity=".25"/><circle cx="50" cy="40" r="9" fill="url(#doc-logo-r)"/><circle cx="50" cy="40" r="5" fill="#1e1e2e"/><path d="M30 65 L20 84 L38 70 Z" fill="#a78bfa"/><path d="M70 65 L80 84 L62 70 Z" fill="#a78bfa"/></g>
      <g transform="translate(-4.65 -5.54) rotate(-20 50 50)"><path d="M40 68 Q44 88 48 68 Z" fill="url(#doc-logo-f)"/></g>
      <g transform="translate(-4.92 -5.42) rotate(-20 50 50)"><path d="M48 68 Q51 84 55 68 Z" fill="url(#doc-logo-f)"/><path d="M55 68 Q58 84 62 68 Z" fill="url(#doc-logo-f)"/></g>
      <g transform="translate(-4.91 -5.4) rotate(-20 50 50)"><path d="M62 68 Q66 88 70 68 Z" fill="url(#doc-logo-f)"/></g>
    </svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">AppLogo</div>
  </div>
  <div style="background:#1e1e2e;border:1px solid rgba(255,255,255,.08);border-radius:12px;padding:16px;text-align:center;overflow:hidden">
    <svg width="190" height="86" viewBox="0 0 380 172" aria-hidden="true">
      <circle cx="22" cy="38" r="1.6" fill="#fff" opacity=".85"/><circle cx="80" cy="20" r="1.2" fill="#fff" opacity=".6"/><circle cx="132" cy="54" r="1.7" fill="#fbbf24" opacity=".9"/><circle cx="190" cy="34" r="1.2" fill="#fff" opacity=".7"/><circle cx="246" cy="62" r="1.3" fill="#c4b5fd" opacity=".8"/><circle cx="320" cy="44" r="1.5" fill="#fff" opacity=".7"/><circle cx="352" cy="26" r="1.3" fill="#fbbf24" opacity=".85"/><circle cx="58" cy="128" r="1.4" fill="#c4b5fd" opacity=".75"/><circle cx="186" cy="132" r="1.5" fill="#fbbf24" opacity=".85"/><circle cx="314" cy="124" r="1.2" fill="#fff" opacity=".7"/>
      <g transform="translate(92 82)" opacity=".95"><path d="M0 -7 L0 7 M-7 0 L7 0" stroke="#fbbf24" stroke-width="1.6" stroke-linecap="round"/></g>
      <g transform="translate(286 96)" opacity=".7"><path d="M0 -5 L0 5 M-5 0 L5 0" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></g>
    </svg>
    <div style="font-size:.78rem;color:#e5e7eb;margin-top:8px;font-weight:700">SeoStarField</div>
  </div>
</div>

| Composant | Fichier | Role |
| --- | --- | --- |
| `AppLogo` | `src/components/AppLogo.jsx` | Logo PrimoLingo en SVG : fusee, lettres `a/e/b`, fond spatial. Utilise pour les pages publiques et les ecrans d'identite. |
| `SeoStarField` | `src/components/SeoStarField.jsx` | Fond etoile SVG des pages publiques SEO/landing. Il evite les images lourdes et garde le rendu stable en responsive. |

## SVG inline restants

Certains SVG ont ete gardes localement parce qu'ils sont tres contextuels :

| Emplacement | Role | Note |
| --- | --- | --- |
| `src/components/EndScreen.jsx` | Petits SVG check/cross du recap reponses et cadenas de bulle emotion verrouillee. | A factoriser plus tard si on veut supprimer tous les SVG inline. |
| `src/components/MiniQuiz.jsx` | Check, cross et score icon pour les mini-quiz SEO. | Peut etre migre vers `ProductIcons.jsx` si le mini-quiz partage plus de composants avec l'app. |
| `src/components/MotivationBanner.jsx` | Variantes SVG de messages de coaching. | Remplace des pictos emoji par des formes vectorielles adaptees au type de message. |

## Regles d'usage

- Pas d'emoji pour les pictos UI stables.
- Importer depuis `ProductIcons.jsx` quand une icone existe deja.
- Garder `aria-hidden="true"` pour les SVG purement decoratifs.
- Passer par les tokens design (`var(--color-gold)`, `var(--color-primary)`, etc.) quand l'icone doit suivre la charte.
- Ajouter un nouveau SVG dans `ProductIcons.jsx` seulement s'il est reutilisable dans plusieurs ecrans.

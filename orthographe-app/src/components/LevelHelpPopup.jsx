import PopupCloseButton from './PopupCloseButton.jsx';
import { getToday, parseLocalDate } from '../engine/sm2.js';

function getSessionSize() {
  try { return window.__ORTHO_SESSION_SIZE__ || 20; } catch { return 20; }
}
function scoreFor(pct) {
  const n = getSessionSize();
  return `${Math.ceil(n * pct / 100)}/${n}`;
}

function buildLevelData() {
  const s80 = scoreFor(80);
  const s90 = scoreFor(90);

  return {
    bronze: {
      color: '#cd7f32', colorLight: '#e6a860',
      colorBg: 'rgba(205,127,50,0.2)', colorBorder: 'rgba(205,127,50,0.18)',
      gradientFrom: 'rgba(80,45,15,0.96)', gradientTo: 'rgba(31,28,52,0.96)',
      icon: '★', subtitle: 'Bronze', kicker: 'Niveau Bronze',
      headline: "C'est quoi le niveau Bronze ?",
      description: "C'est le premier palier. Tu l'obtiens en terminant une session guidée sur une règle. Le pavé de décision t'accompagne — pas de pression, pas de score minimum.",
      stats: [
        { label: 'Comment obtenir', value: 'Terminer 1 session guidée', hint: "Peu importe le score. Finis la session et c'est validé." },
        { label: 'Le mode guidé', value: "Un outil t'aide", hint: "Le pavé de décision élimine les mauvaises réponses une par une. Tu comprends la logique avant de répondre." },
        { label: 'Pièces gagnées', value: '5 à 30 par session', hint: "Plus ton score est haut, plus tu gagnes. Score parfait = 30 pièces." },
        { label: "Et après ?", value: 'Direction Argent', hint: `3 sessions guidées avec ${s80} ou mieux. Ça débloque le mode direct — sans aide.` },
      ],
    },

    silver: {
      color: '#c0c0c0', colorLight: '#d4d4d4',
      colorBg: 'rgba(192,192,192,0.15)', colorBorder: 'rgba(192,192,192,0.18)',
      gradientFrom: 'rgba(50,50,60,0.96)', gradientTo: 'rgba(31,28,52,0.96)',
      icon: '★★', subtitle: 'Argent', kicker: 'Niveau Argent',
      headline: "C'est quoi le niveau Argent ?",
      description: "Tu prouves que tu comprends la règle avec le mode guidé. Le mode direct se débloque à ce niveau — plus de pavé de décision, juste toi et les boutons de réponse.",
      stats: [
        { label: 'Comment obtenir', value: `3 sessions guidées \u2265 ${s80}`, hint: `Score de ${s80} ou mieux sur 3 sessions distinctes en mode guidé.` },
        { label: 'Ce qui se débloque', value: 'Le mode direct', hint: "Plus de pavé de décision. Tu réponds directement. C'est là que la vraie maîtrise commence." },
        { label: 'Bonus', value: '+30 pièces', hint: "Prime unique quand tu atteins ce niveau." },
        { label: "Et après ?", value: 'Direction Couronne', hint: `3 sessions directes avec ${s80} ou mieux. La couronne prouve que tu maîtrises sans aide.` },
      ],
    },

    crown: {
      color: '#fbbf24', colorLight: '#fde68a',
      colorBg: 'rgba(251,191,36,0.15)', colorBorder: 'rgba(251,191,36,0.18)',
      gradientFrom: 'rgba(80,55,10,0.96)', gradientTo: 'rgba(31,28,52,0.96)',
      icon: '👑', subtitle: 'Couronne', kicker: 'Niveau Couronne',
      headline: "C'est quoi la Couronne ?",
      description: "La couronne signifie que tu maîtrises cette règle sans aide. Tu as prouvé que tu sais répondre correctement en mode direct, sans le pavé de décision.",
      stats: [
        { label: 'Comment obtenir', value: `3 sessions directes \u2265 ${s80}`, hint: `Score de ${s80} ou mieux sur 3 sessions en mode direct (sans aide).` },
        { label: 'Ce que ça prouve', value: 'Maîtrise confirmée', hint: "Tu sais appliquer la règle sans outil. C'est un vrai accomplissement." },
        { label: 'Bonus', value: '+100 pièces', hint: "Prime unique pour la couronne. Tu l'as bien méritée." },
        { label: "Et après ?", value: 'Viser le Diamant', hint: `3 sessions directes consécutives avec ${s90} ou mieux. Le diamant, c'est la perfection.` },
      ],
    },

    diamond: {
      color: '#60a5fa', colorLight: '#93c5fd',
      colorBg: 'rgba(96,165,250,0.15)', colorBorder: 'rgba(96,165,250,0.18)',
      gradientFrom: 'rgba(15,30,70,0.96)', gradientTo: 'rgba(31,28,52,0.96)',
      icon: '💎', subtitle: 'Diamant', kicker: 'Niveau Diamant',
      headline: "C'est quoi le Diamant ?",
      description: "Le diamant est le trophée ultime. Il prouve une maîtrise quasi parfaite. Mais attention : le diamant est vivant. Il faut le maintenir en faisant des révisions régulières.",
      stats: [
        { label: 'Comment obtenir', value: `3\u00d7 \u2265 ${s90} direct d'affilée`, hint: `3 sessions directes consécutives avec ${s90} ou mieux. Une seule session en dessous remet le compteur à zéro.` },
        { label: 'Diamant vivant', value: 'Il brille ou se ternit', hint: "Après obtention, le diamant entre en révision espacée. Si tu ne révises pas à temps, il perd son éclat — et peut se briser." },
        { label: 'Bonus', value: '+200 pièces', hint: "Le plus gros bonus du jeu. Le diamant est rare et mérité." },
        { label: 'Révisions', value: "L'espacement augmente", hint: `1 jour, puis 6, 15, 35, 80… Si tu fais ${s90} ou mieux, les révisions s'espacent. Sinon, elles reviennent vite.` },
      ],
    },

    // Popup for clicking on the diamond icon on a RuleCard
    diamond_status: {
      color: '#60a5fa', colorLight: '#93c5fd',
      colorBg: 'rgba(96,165,250,0.15)', colorBorder: 'rgba(96,165,250,0.18)',
      gradientFrom: 'rgba(15,30,70,0.96)', gradientTo: 'rgba(31,28,52,0.96)',
      icon: '💎', subtitle: 'Diamant', kicker: 'État du diamant',
      // headline, description, stats are dynamic — built in the component
    },

    // Global summary badges
    badge_diamond: {
      color: '#60a5fa', colorLight: '#93c5fd',
      colorBg: 'rgba(96,165,250,0.15)', colorBorder: 'rgba(96,165,250,0.18)',
      gradientFrom: 'rgba(15,30,70,0.96)', gradientTo: 'rgba(31,28,52,0.96)',
      icon: '💎', subtitle: 'Diamant', kicker: 'Compteur Diamants',
      headline: "Tes règles au niveau Diamant",
      description: "Ce compteur montre combien de règles ont atteint le niveau diamant — et sont maintenues par des révisions régulières.",
      stats: [
        { label: 'Comment obtenir', value: `Couronne puis 3\u00d7 \u2265 ${s90}`, hint: `D'abord la couronne (3 sessions directes \u2265 ${s80}), puis 3 sessions consécutives \u2265 ${s90}.` },
        { label: 'Diamant vivant', value: 'Brille si à jour', hint: "Le diamant brille tant que les révisions sont faites. Il se ternit et peut se briser si tu tardes." },
      ],
    },

    badge_en_cours: {
      color: '#fbbf24', colorLight: '#fde68a',
      colorBg: 'rgba(251,191,36,0.12)', colorBorder: 'rgba(251,191,36,0.15)',
      gradientFrom: 'rgba(60,45,15,0.96)', gradientTo: 'rgba(31,28,52,0.96)',
      icon: '⭐', subtitle: 'En cours', kicker: 'Règles en cours',
      headline: "Tes règles en progression",
      description: "Ce compteur montre combien de règles sont en cours de travail. Chaque session te fait avancer vers le niveau suivant.",
      stats: [
        { label: 'Bronze', value: '1 session guidée', hint: "Premier contact avec la règle. Le pavé de décision t'accompagne." },
        { label: 'Argent', value: `3 guidées \u2265 ${s80}`, hint: "Tu maîtrises le raisonnement guidé. Le mode direct se débloque." },
        { label: 'Couronne', value: `3 directes \u2265 ${s80}`, hint: "Tu maîtrises sans aide. La couronne est gagnée." },
        { label: 'Diamant', value: `3\u00d7 \u2265 ${s90} d'affilée`, hint: "Perfection. Le diamant entre en révision espacée." },
      ],
    },

    badge_nouvelle: {
      color: '#6b7280', colorLight: '#9ca3af',
      colorBg: 'rgba(107,114,128,0.12)', colorBorder: 'rgba(107,114,128,0.15)',
      gradientFrom: 'rgba(40,40,50,0.96)', gradientTo: 'rgba(31,28,52,0.96)',
      icon: '🔒', subtitle: 'Nouvelle', kicker: 'Pas encore commencées',
      headline: "Des règles t'attendent",
      description: "Ces règles n'ont pas encore été touchées. Clique sur « Découvrir » pour lancer ta première session guidée.",
      stats: [
        { label: 'Par où commencer', value: 'Clique "Découvrir"', hint: "Choisis une règle et lance-toi. Le pavé de décision t'accompagne dès la première question." },
        { label: 'Pas de pression', value: "Aucun score minimum", hint: "La première session est une découverte. Finis-la et tu débloques le niveau Bronze." },
      ],
    },
  };
}

function getDiamondStatusContent(ruleProgress) {
  const sm2 = ruleProgress?.sm2;
  const s90 = scoreFor(90);

  if (!sm2) {
    return {
      headline: "Diamant obtenu !",
      description: "Ce diamant vient d'être gagné. Les révisions espacées vont bientôt commencer.",
      stats: [
        { label: 'État', value: 'Tout neuf', hint: "Le diamant brille. Première révision prévue bientôt." },
        { label: 'Seuil de révision', value: `${s90} ou mieux`, hint: `Pour maintenir le diamant, chaque révision doit atteindre ${s90}.` },
      ],
    };
  }

  const health = sm2.diamondHealth ?? 1.0;
  const interval = sm2.interval || 1;
  const nextDate = sm2.nextReviewDate;
  const lastScore = sm2.lastReviewScore;
  const repetitions = sm2.repetitions || 0;

  // Check if review is overdue
  const today = parseLocalDate(getToday());
  const review = nextDate ? parseLocalDate(nextDate) : null;
  let dateLabel = '';
  if (review) {
    const diff = Math.round((review - today) / (1000 * 60 * 60 * 24));
    if (diff < 0) dateLabel = `En retard de ${Math.abs(diff)} jour${Math.abs(diff) > 1 ? 's' : ''}`;
    else if (diff === 0) dateLabel = "Aujourd'hui";
    else if (diff === 1) dateLabel = 'Demain';
    else dateLabel = `Dans ${diff} jours`;
  }
  const isDue = !!review && review <= today;

  let headline, description;
  if (health <= 0) {
    headline = "Diamant brisé";
    description = "Le diamant s'est brisé. Tu es redescendu au niveau Couronne.";
  } else if (health < 0.5) {
    headline = "Le diamant se fissure";
    description = "Sans révision rapide, il va se briser et tu perdras le niveau. Lance une session maintenant.";
  } else if (health < 0.8) {
    headline = "Le diamant ternit";
    description = "Le diamant perd son éclat. Une révision le restaurera immédiatement.";
  } else if (isDue) {
    headline = "Révision disponible";
    description = "Le diamant brille encore, mais une révision est due. Fais-la maintenant pour garder son éclat et espacer la prochaine.";
  } else {
    headline = "Le diamant brille";
    description = `Tout va bien. Prochaine révision ${dateLabel.toLowerCase()}. Continue comme ça.`;
  }

  let stateLabel;
  if (health >= 0.8 && !isDue) stateLabel = 'Brillant — en pleine forme';
  else if (health >= 0.8 && isDue) stateLabel = 'Brillant — révision à faire';
  else if (health >= 0.5) stateLabel = 'Terni — révision nécessaire';
  else if (health > 0) stateLabel = 'Fissuré — urgence';
  else stateLabel = 'Brisé';

  return {
    headline,
    description,
    stats: [
      { label: 'Santé', value: `${Math.round(health * 100)}%`, hint: stateLabel },
      { label: 'Prochaine révision', value: dateLabel, hint: `Intervalle actuel : ${interval} jour${interval > 1 ? 's' : ''}. ${repetitions} révision${repetitions > 1 ? 's' : ''} réussie${repetitions > 1 ? 's' : ''}.` },
      { label: 'Seuil requis', value: `${s90} ou mieux`, hint: `En dessous, l'intervalle ne progresse pas. Sous ${scoreFor(80)}, il recule.` },
      ...(lastScore !== null ? [{ label: 'Dernière révision', value: `${lastScore}%`, hint: lastScore >= 90 ? "Réussie — l'intervalle a augmenté." : lastScore >= 80 ? "Fragile — l'intervalle n'a pas bougé." : "Ratée — l'intervalle a reculé." }] : []),
    ],
  };
}

export default function LevelHelpPopup({ level, ruleTitle, ruleProgress, onClose }) {
  const allData = buildLevelData();
  const data = allData[level];
  if (!data) return null;

  // For diamond_status, inject dynamic content
  let headline = data.headline;
  let description = data.description;
  let stats = data.stats;

  if (level === 'diamond_status') {
    const dynamic = getDiamondStatusContent(ruleProgress);
    headline = dynamic.headline;
    description = dynamic.description;
    stats = dynamic.stats;
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
        animation: 'fade-in 0.2s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: 'min(680px, 92vw)',
          animation: 'bounce-in 0.35s ease forwards',
        }}
      >
        <PopupCloseButton onClick={onClose} ariaLabel="Fermer" />

        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'relative', width: '100%',
            maxHeight: 'calc(100vh - 2rem)', overflowY: 'auto',
            padding: '1.6rem', borderRadius: 28,
            border: `1px solid ${data.colorBorder}`,
            background: `radial-gradient(circle at top left, ${data.colorBg}, transparent 34%), linear-gradient(160deg, ${data.gradientFrom}, ${data.gradientTo})`,
            boxShadow: '0 18px 80px rgba(0,0,0,0.52)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {/* Hero */}
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '0.9rem', minWidth: 148,
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 116, height: 116, borderRadius: 28,
                background: `linear-gradient(180deg, ${data.colorBg}, rgba(255,255,255,0.02))`,
                border: `1px solid ${data.colorBorder}`,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
              }}>
                <span style={{
                  fontSize: '3.5rem',
                  filter: `drop-shadow(0 0 12px ${data.color}80)`,
                }}>
                  {data.icon}
                </span>
              </div>
              <div style={{
                display: 'inline-flex', alignItems: 'baseline', gap: '0.4rem',
                padding: '0.5rem 1rem', borderRadius: 16,
                background: `${data.color}18`, border: `1px solid ${data.color}35`,
              }}>
                <span style={{ fontSize: '1.1rem', fontWeight: 800, color: data.color }}>
                  {data.subtitle}
                </span>
              </div>
            </div>

            {/* Body */}
            <div style={{ flex: 1 }}>
              <p style={{
                margin: '0 0 0.4rem', textTransform: 'uppercase',
                letterSpacing: '0.16em', fontSize: '0.68rem',
                fontWeight: 800, color: data.colorLight,
              }}>
                {data.kicker}
              </p>
              <h2 style={{
                fontSize: '1.85rem', lineHeight: 1.05, fontWeight: 800,
                color: '#fff7ed', margin: '0 0 0.35rem',
              }}>
                {typeof headline === 'function' ? headline(ruleTitle) : headline}
              </h2>
              <p style={{
                fontSize: '0.98rem', color: '#d6d3d1', lineHeight: 1.5,
                margin: '0 0 1rem', maxWidth: 440,
              }}>
                {description}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: '0.75rem',
              }}>
                {stats.map((stat, i) => (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column', gap: '0.2rem',
                    padding: '0.85rem 0.95rem', borderRadius: 16,
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <span style={{
                      fontSize: '0.68rem', textTransform: 'uppercase',
                      letterSpacing: '0.12em', fontWeight: 800, color: '#a8a29e',
                    }}>
                      {stat.label}
                    </span>
                    <strong style={{
                      fontSize: '1rem', lineHeight: 1.25,
                      color: '#fff7ed', fontWeight: 700,
                    }}>
                      {stat.value}
                    </strong>
                    <span style={{
                      fontSize: '0.76rem', lineHeight: 1.45, color: '#cbd5e1',
                    }}>
                      {stat.hint}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

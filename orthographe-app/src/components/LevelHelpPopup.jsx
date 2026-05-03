import { useEffect, useState } from 'react';
import PopupCloseButton from './PopupCloseButton.jsx';
import CrownIcon from './CrownIcon.jsx';
import DiamondIcon from './DiamondIcon.jsx';
import { TrophyIcon, LockIcon } from './icons/ProductIcons.jsx';
import RewardAmount from './rewards/RewardAmount.jsx';
import { getToday, parseLocalDate } from '../engine/sm2.js';

function getSessionSize(sessionSize) {
  const explicit = Number(sessionSize);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  try { return window.__ORTHO_SESSION_SIZE__ || 20; } catch { return 20; }
}
function scoreFor(pct, sessionSize) {
  const n = getSessionSize(sessionSize);
  return `${Math.ceil(n * pct / 100)}/${n}`;
}

function buildLevelData(sessionSize) {
  const s60 = scoreFor(60, sessionSize);
  const s80 = scoreFor(80, sessionSize);
  const s90 = scoreFor(90, sessionSize);

  return {
    bronze: {
      color: '#cd7f32', colorLight: '#e6a860',
      colorBg: 'rgba(205,127,50,0.2)', colorBorder: 'rgba(205,127,50,0.18)',
      gradientFrom: 'rgba(80,45,15,0.96)', gradientTo: 'rgba(31,28,52,0.96)',
      iconType: 'bronze', subtitle: 'Bronze', kicker: 'Niveau Bronze',
      headline: "C'est quoi le Bronze ?",
      description: `Premier palier. Termine une session guidée avec au moins ${s60} et c'est validé.`,
      stats: [
        { label: "Pour l'obtenir", value: `1 session guidée avec au moins ${s60}`, hint: "Minimum 60% pour valider. Le pavé de décision t'accompagne." },
        { label: 'Mode guidé', value: "Le pavé t'accompagne", hint: "Il élimine les mauvaises réponses une par une." },
        { label: 'Pièces', value: '0 à 30 par session', hint: "60% → 5, 80% → 20, 100% → 30." },
        { label: "Ensuite", value: "Direction l'Argent", hint: `3 sessions guidées \u2265 ${s80}.` },
      ],
    },

    silver: {
      color: '#c0c0c0', colorLight: '#d4d4d4',
      colorBg: 'rgba(192,192,192,0.15)', colorBorder: 'rgba(192,192,192,0.18)',
      gradientFrom: 'rgba(50,50,60,0.96)', gradientTo: 'rgba(31,28,52,0.96)',
      iconType: 'silver', subtitle: 'Argent', kicker: 'Niveau Argent',
      headline: "C'est quoi l'Argent ?",
      description: "Tu maîtrises le raisonnement guidé. Le mode direct se débloque.",
      stats: [
        { label: "Pour l'obtenir", value: `3 sessions guidées à ${s80} ou plus`, hint: '3 sessions distinctes en mode guidé.' },
        { label: 'Ça débloque', value: 'Le mode direct', hint: "Plus de pavé. Tu réponds seul." },
        { label: 'Bonus', value: '+30 pièces', hint: 'Prime unique à ce niveau.' },
        { label: "Ensuite", value: 'Direction Couronne', hint: `3 sessions directes \u2265 ${s80}.` },
      ],
    },

    crown: {
      color: '#fbbf24', colorLight: '#fde68a',
      colorBg: 'rgba(251,191,36,0.15)', colorBorder: 'rgba(251,191,36,0.18)',
      gradientFrom: 'rgba(80,55,10,0.96)', gradientTo: 'rgba(31,28,52,0.96)',
      iconType: 'crown', subtitle: 'Couronne', kicker: 'Niveau Couronne',
      headline: "C'est quoi la Couronne ?",
      description: "Tu maîtrises la règle sans aide. Mode direct, sans pavé de décision.",
      stats: [
        { label: "Pour l'obtenir", value: `3 sessions directes à ${s80} ou plus`, hint: '3 sessions différentes, sans aide.' },
        { label: 'Ça prouve', value: 'Maîtrise confirmée', hint: 'Tu sais appliquer la règle seul.' },
        { label: 'Bonus', value: '+100 pièces', hint: 'Prime unique quand la couronne est gagnée.' },
        { label: "Ensuite", value: 'Viser le Diamant', hint: `3 sessions directes d'affilée \u2265 ${s90}.` },
      ],
    },

    diamond: {
      color: '#60a5fa', colorLight: '#93c5fd',
      colorBg: 'rgba(96,165,250,0.15)', colorBorder: 'rgba(96,165,250,0.18)',
      gradientFrom: 'rgba(15,30,70,0.96)', gradientTo: 'rgba(31,28,52,0.96)',
      iconType: 'diamond', subtitle: 'Diamant', kicker: 'Niveau Diamant',
      headline: "C'est quoi le Diamant ?",
      description: "Trophée ultime. Le diamant est vivant : il faut le maintenir par des révisions.",
      stats: [
        { label: "Pour l'obtenir", value: `3 sessions d'affilée à ${s90} ou plus`, hint: "3 sessions directes consécutives. Un score en dessous remet le compteur à zéro." },
        { label: 'Diamant vivant', value: 'Il brille ou se ternit', hint: "Sans révision à temps, il perd son éclat et peut se briser." },
        { label: 'Bonus', value: '+200 pièces', hint: 'Le plus gros bonus du jeu.' },
        { label: 'Révisions', value: "L'espacement augmente", hint: `1j, 6j, 15j, 35j, 80j… Score \u2265 ${s90} pour espacer.` },
      ],
    },

    // Popup for clicking on the diamond icon on a RuleCard
    diamond_status: {
      color: '#60a5fa', colorLight: '#93c5fd',
      colorBg: 'rgba(96,165,250,0.15)', colorBorder: 'rgba(96,165,250,0.18)',
      gradientFrom: 'rgba(15,30,70,0.96)', gradientTo: 'rgba(31,28,52,0.96)',
      iconType: 'diamond', subtitle: 'Diamant', kicker: 'État du diamant',
      // headline, description, stats are dynamic — built in the component
    },

    // Global summary badges
    badge_diamond: {
      color: '#60a5fa', colorLight: '#93c5fd',
      colorBg: 'rgba(96,165,250,0.15)', colorBorder: 'rgba(96,165,250,0.18)',
      gradientFrom: 'rgba(15,30,70,0.96)', gradientTo: 'rgba(31,28,52,0.96)',
      iconType: 'diamond', subtitle: 'Diamant', kicker: 'Compteur Diamants',
      headline: "Tes règles au niveau Diamant",
      description: "Ce compteur montre combien de règles ont atteint le niveau diamant — et sont maintenues par des révisions régulières.",
      stats: [
        { label: "Pour l'obtenir", value: `Couronne puis 3\u00d7 \u2265 ${s90}`, hint: `D'abord la couronne (3 sessions directes \u2265 ${s80}), puis 3 sessions consécutives \u2265 ${s90}.` },
        { label: 'Diamant vivant', value: 'Brille si à jour', hint: "Le diamant brille tant que les révisions sont faites. Il se ternit et peut se briser si tu tardes." },
      ],
    },

    badge_en_cours: {
      color: '#fbbf24', colorLight: '#fde68a',
      colorBg: 'rgba(251,191,36,0.12)', colorBorder: 'rgba(251,191,36,0.15)',
      gradientFrom: 'rgba(60,45,15,0.96)', gradientTo: 'rgba(31,28,52,0.96)',
      iconType: 'trophy', subtitle: 'En cours', kicker: 'Règles en cours',
      headline: "Tes règles en progression",
      description: "Ce compteur montre combien de règles sont en cours de travail. Chaque session te fait avancer vers le niveau suivant.",
      stats: [
        { label: 'Bronze', value: '1 session guidée ≥ 60 %', hint: "Premier contact avec la règle. Score minimum 60 %." },
        { label: 'Argent', value: `3 guidées \u2265 ${s80}`, hint: "Tu maîtrises le raisonnement guidé. Le mode direct se débloque." },
        { label: 'Couronne', value: `3 directes \u2265 ${s80}`, hint: "Tu maîtrises sans aide. La couronne est gagnée." },
        { label: 'Diamant', value: `3\u00d7 \u2265 ${s90} d'affilée`, hint: "Perfection. Le diamant entre en révision espacée." },
      ],
    },

    badge_nouvelle: {
      color: '#6b7280', colorLight: '#9ca3af',
      colorBg: 'rgba(107,114,128,0.12)', colorBorder: 'rgba(107,114,128,0.15)',
      gradientFrom: 'rgba(40,40,50,0.96)', gradientTo: 'rgba(31,28,52,0.96)',
      iconType: 'lock', subtitle: 'Nouvelle', kicker: 'Pas encore commencées',
      headline: "Des règles t'attendent",
      description: "Ces règles n'ont pas encore été touchées. Clique sur « Découvrir » pour lancer ta première session guidée.",
      stats: [
        { label: 'Par où commencer', value: 'Clique "Découvrir"', hint: "Choisis une règle et lance-toi. Le pavé de décision t'accompagne dès la première question." },
        { label: 'Pas de pression', value: "Aucun score minimum", hint: "La première session est une découverte. Finis-la et tu débloques le niveau Bronze." },
      ],
    },
  };
}

function getDiamondStatusContent(ruleProgress, sessionSize) {
  const sm2 = ruleProgress?.sm2;
  const s90 = scoreFor(90, sessionSize);

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
      { label: 'Seuil requis', value: `${s90} ou mieux`, hint: `En dessous, l'intervalle ne progresse pas. Sous ${scoreFor(80, sessionSize)}, il recule.` },
      ...(lastScore !== null ? [{ label: 'Dernière révision', value: `${lastScore}%`, hint: lastScore >= 90 ? "Réussie — l'intervalle a augmenté." : lastScore >= 80 ? "Fragile — l'intervalle n'a pas bougé." : "Ratée — l'intervalle a reculé." }] : []),
    ],
  };
}

function LevelIcon({ type, size = 40, color }) {
  switch (type) {
    case 'bronze':  return <TrophyIcon size={size} color={color || '#cd7f32'} />;
    case 'silver':  return <TrophyIcon size={size} color={color || '#c0c0c0'} />;
    case 'crown':   return <CrownIcon size={size} animate={false} />;
    case 'diamond':  return <DiamondIcon size={size} animate />;
    case 'trophy':  return <TrophyIcon size={size} color={color || 'var(--color-gold)'} />;
    case 'lock':    return <LockIcon size={size} color={color || 'var(--text-muted)'} />;
    default:        return <TrophyIcon size={size} color={color || 'var(--color-gold)'} />;
  }
}

export default function LevelHelpPopup({ level, ruleTitle, ruleProgress, sessionSize, onClose }) {
  const [isMobile, setIsMobile] = useState(() => (
    typeof window !== 'undefined' ? window.innerWidth <= 640 : false
  ));

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleResize = () => setIsMobile(window.innerWidth <= 640);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const allData = buildLevelData(sessionSize);
  const data = allData[level];
  if (!data) return null;

  // For diamond_status, inject dynamic content
  let headline = data.headline;
  let description = data.description;
  let stats = data.stats;

  if (level === 'diamond_status') {
    const dynamic = getDiamondStatusContent(ruleProgress, sessionSize);
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
          width: isMobile ? 'calc(100vw - 1rem)' : 'min(680px, 92vw)',
          animation: 'bounce-in 0.35s ease forwards',
        }}
      >
        <PopupCloseButton
          onClick={onClose}
          ariaLabel="Fermer"
          size={isMobile ? 40 : 48}
        />

        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'relative', width: '100%',
            maxHeight: isMobile ? 'calc(100vh - 1rem)' : 'calc(100vh - 2rem)', overflowY: 'auto',
            padding: isMobile ? '0.9rem 0.95rem 1rem' : '1.6rem', borderRadius: isMobile ? 24 : 28,
            border: `1px solid ${data.colorBorder}`,
            background: `radial-gradient(circle at top left, ${data.colorBg}, transparent 34%), linear-gradient(160deg, ${data.gradientFrom}, ${data.gradientTo})`,
            boxShadow: '0 18px 80px rgba(0,0,0,0.52)',
          }}
        >
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            gap: isMobile ? '1rem' : '1.5rem',
          }}>
            {/* Hero */}
            {!isMobile && (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.9rem',
                minWidth: 148,
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 116, height: 116, borderRadius: 28,
                  background: `linear-gradient(180deg, ${data.colorBg}, rgba(255,255,255,0.02))`,
                  border: `1px solid ${data.colorBorder}`,
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
                  flexShrink: 0,
                }}>
                  <LevelIcon type={data.iconType} size={56} color={data.color} />
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
            )}

            {/* Body */}
            <div style={{ flex: 1 }}>
              {isMobile && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  marginBottom: '0.3rem',
                }}>
                  <LevelIcon type={data.iconType} size={22} color={data.color} />
                  <span style={{
                    textTransform: 'uppercase',
                    letterSpacing: '0.16em', fontSize: '0.64rem',
                    fontWeight: 800, color: data.colorLight,
                  }}>
                    {data.kicker}
                  </span>
                </div>
              )}

              {!isMobile && (
                <p style={{
                  margin: '0 0 0.4rem', textTransform: 'uppercase',
                  letterSpacing: '0.16em', fontSize: '0.68rem',
                  fontWeight: 800, color: data.colorLight,
                }}>
                  {data.kicker}
                </p>
              )}
              <h2 style={{
                fontSize: isMobile ? '1.4rem' : '1.85rem', lineHeight: isMobile ? 1.12 : 1.05, fontWeight: 800,
                color: '#fff7ed', margin: '0 0 0.25rem',
                maxWidth: isMobile ? 'min(100%, 22rem)' : 'none',
                textAlign: isMobile ? 'center' : 'left',
                marginLeft: isMobile ? 'auto' : 0,
                marginRight: isMobile ? 'auto' : 0,
              }}>
                {typeof headline === 'function' ? headline(ruleTitle) : headline}
              </h2>
              <p style={{
                fontSize: isMobile ? '0.86rem' : '0.98rem', color: '#d6d3d1', lineHeight: 1.45,
                margin: '0 auto 0.75rem', maxWidth: isMobile ? '24rem' : 460,
                textAlign: isMobile ? 'center' : 'left',
              }}>
                {description}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))',
                gap: isMobile ? '0.6rem' : '0.75rem',
              }}>
                {stats.map((stat, i) => (
                  <div key={i} style={{
                    display: 'flex', flexDirection: 'column', gap: '0.2rem',
                    padding: isMobile ? '0.8rem 0.85rem' : '0.85rem 0.95rem', borderRadius: 16,
                    background: isMobile ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}>
                    <span style={{
                      fontSize: '0.68rem', textTransform: 'uppercase',
                      letterSpacing: '0.12em', fontWeight: 800, color: '#a8a29e',
                    }}>
                      {stat.label}
                    </span>
                    <strong style={{
                      fontSize: isMobile ? '0.94rem' : '1rem', lineHeight: 1.25,
                      color: '#fff7ed', fontWeight: 700,
                      ...(stat.value.match?.(/^\+\d/) ? { fontFamily: 'var(--font-kid)', color: 'var(--color-gold)' } : {}),
                    }}>
                      {stat.value}
                    </strong>
                    <span style={{
                      fontSize: isMobile ? '0.78rem' : '0.76rem', lineHeight: 1.45, color: '#cbd5e1',
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

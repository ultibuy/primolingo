import { useState } from 'react';
import { allDictees, getDicteeWordsForLevel } from '../content/dicteesLoader.js';
import DicteeCard from '../components/DicteeCard.jsx';
import PopupModal from '../components/PopupModal.jsx';

const LEVELS = [
  { key: 'level1', label: 'AVENTURIER', color: '#FFC107', emoji: '🟡' },
  { key: 'level2', label: 'HÉROS', color: '#4CAF50', emoji: '🟢' },
  { key: 'level3', label: 'LÉGENDE', color: '#9C27B0', emoji: '🟣' },
];

const pageStyle = {
  minHeight: '100vh',
  backgroundColor: 'var(--color-bg1)',
  backgroundImage: 'var(--app-page-overlay), var(--app-page-image)',
  backgroundSize: 'cover, cover',
  backgroundPosition: 'center, center',
  fontFamily: 'var(--font-body)',
  padding: '1.5rem',
  color: '#e2e2e2',
};

function isLevelUnlocked(targetLevel, dictees, rulesProgress) {
  if (targetLevel === 'level1') return true;
  const previousLevel = targetLevel === 'level2' ? 'level1' : 'level2';
  const allQuizIds = dictees.map(d => `${d.id}-${previousLevel}`);
  return allQuizIds.every(id => (rulesProgress[id]?.level || 0) >= 3);
}

const LEVEL_LABELS_FR = { level1: 'Aventurier', level2: 'Héros', level3: 'Légende' };

export default function DicteesPage({ progress, onPlay, onBack }) {
  const rulesProgress = progress?.rules || {};
  const [bugTarget, setBugTarget] = useState(null);   // { dictee, level }
  const [bugDesc, setBugDesc] = useState('');
  const [bugCopied, setBugCopied] = useState(false);

  function handleBugReport(dictee, level) {
    setBugTarget({ dictee, level });
    setBugDesc('');
    setBugCopied(false);
  }

  function handleBugCopy() {
    const { dictee, level } = bugTarget;
    const text = [
      `Dictée : ${dictee.title} (${dictee.id})`,
      `Groupe : ${LEVEL_LABELS_FR[level]}`,
      `Problème : ${bugDesc || '(non renseigné)'}`,
    ].join('\n');
    navigator.clipboard?.writeText(text).then(() => {
      setBugCopied(true);
      setTimeout(() => setBugCopied(false), 2500);
    });
  }

  function handleBugClose() {
    setBugTarget(null);
    setBugDesc('');
    setBugCopied(false);
  }

  return (
    <div style={pageStyle}>
      {/* Bug report modal */}
      {bugTarget && (
        <PopupModal
          onClose={handleBugClose}
          panelStyle={{
            background: '#1e1e2e',
            borderRadius: 20,
            border: '1px solid rgba(255,255,255,0.1)',
            padding: '1.4rem 1.5rem',
            width: 'min(420px, calc(100vw - 2rem))',
            display: 'grid',
            gap: '0.9rem',
          }}
        >
            <div>
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#e2e2e2' }}>
                🐛 Signaler un problème
              </span>
            </div>
            <div style={{ fontSize: '0.82rem', color: '#9ca3af', lineHeight: 1.5 }}>
              <strong style={{ color: 'var(--color-accent)' }}>{bugTarget.dictee.title}</strong>
              {' — '}{LEVEL_LABELS_FR[bugTarget.level]}
              <br />
              <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>{bugTarget.dictee.id}</span>
            </div>
            <textarea
              placeholder="Décris le problème : mot mal orthographié, audio manquant, exemple incorrect…"
              value={bugDesc}
              onChange={(e) => setBugDesc(e.target.value)}
              rows={3}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 10, padding: '0.7rem 0.9rem',
                color: '#e2e2e2', fontSize: '0.88rem',
                resize: 'vertical', fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button
              type="button"
              onClick={handleBugCopy}
              style={{
                padding: '0.75rem', borderRadius: 12, border: 'none',
                background: bugCopied
                  ? 'linear-gradient(135deg,#16a34a,#4ade80)'
                  : 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                color: '#fff', fontWeight: 700, fontSize: '0.9rem',
                cursor: 'pointer', transition: 'background 0.2s',
              }}
            >
              {bugCopied ? '✓ Copié !' : 'Copier le rapport'}
            </button>
        </PopupModal>
      )}
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1.8rem',
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 12,
            padding: '0.5rem 0.9rem',
            color: '#e2e2e2',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
          }}
        >
          ← Retour
        </button>
        <h1 style={{
          fontSize: '1.6rem',
          fontWeight: 800,
          margin: 0,
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}>
          Dictées
        </h1>
      </div>

      {/* Level sections */}
      {LEVELS.map((levelDef) => {
        const unlocked = isLevelUnlocked(levelDef.key, allDictees, rulesProgress);

        return (
          <div key={levelDef.key} style={{ marginBottom: '2rem' }}>
            {/* Section header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: `2px solid ${levelDef.color}30`,
            }}>
              <span style={{ fontSize: '1.1rem' }}>{levelDef.emoji}</span>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                color: levelDef.color,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}>
                {levelDef.label}
              </span>
              {!unlocked && (
                <span style={{
                  fontSize: '0.72rem',
                  color: '#6b7280',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                  marginLeft: '0.3rem',
                }}>
                  🔒
                  {levelDef.key === 'level2'
                    ? 'Débloque quand tous Aventurier en couronne'
                    : 'Débloque quand tous Héros en couronne'}
                </span>
              )}
            </div>

            {/* Cards grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '1rem',
            }}>
              {allDictees.map((dictee) => {
                const progressKey = `${dictee.id}-${levelDef.key}`;
                const ruleProgress = rulesProgress[progressKey];
                const words = getDicteeWordsForLevel(dictee, levelDef.key);

                return (
                  <DicteeCard
                    key={progressKey}
                    dictee={dictee}
                    level={levelDef.key}
                    progress={ruleProgress}
                    locked={!unlocked}
                    onPlay={onPlay}
                    wordCount={words.length}
                    onBugReport={handleBugReport}
                  />
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

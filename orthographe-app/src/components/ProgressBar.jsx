import { useEffect, useMemo, useState } from 'react';
import CharacterSprite from './CharacterSprite.jsx';
import { getOwnedChars, resolveCharacterMood } from '../data/shopCharacters.js';

function clampPct(value) {
  return Math.max(0, Math.min(value, 100));
}

export default function ProgressBar({ current, total, showResult, shopOwned = [], lastAnswer = null, characterId: charIdProp }) {
  const pct = ((current + (showResult ? 1 : 0)) / total) * 100;
  const valuenow = current + (showResult ? 1 : 0);
  const ownedChars = useMemo(() => getOwnedChars(shopOwned), [shopOwned]);
  const activeChar = charIdProp || ownedChars[0] || null;
  const [mood, setMood] = useState('walk');

  useEffect(() => {
    if (!activeChar) return undefined;
    if (lastAnswer !== 'correct' && lastAnswer !== 'wrong') {
      setMood('walk');
      return undefined;
    }
    const nextMood = lastAnswer === 'correct' ? 'victory' : 'surprise';
    setMood(resolveCharacterMood(nextMood, activeChar, shopOwned));
    const timeoutId = setTimeout(() => setMood('walk'), 1500);
    return () => clearTimeout(timeoutId);
  }, [activeChar, lastAnswer, shopOwned]);

  return (
    <div style={{ position: 'relative', marginBottom: '0.5rem', paddingTop: activeChar ? 26 : 0 }}>
      {activeChar && (
        <div style={{
          position: 'absolute',
          left: `${clampPct(pct)}%`,
          top: 0,
          transform: 'translateX(-50%)',
          transition: 'left 0.4s ease',
          pointerEvents: 'none',
          zIndex: 10,
        }}>
          <CharacterSprite id={activeChar} mood={mood} size={28} glow={false} />
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={valuenow}
        aria-valuemin={0}
        aria-valuemax={total}
        aria-label="Progression de la session"
        style={{
          height: 4, borderRadius: 2,
          background: 'rgba(255,255,255,0.08)',
          overflow: 'hidden',
        }}
      >
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, var(--color-primary), var(--color-accent))',
          borderRadius: 2,
          transition: 'width 0.4s ease',
        }} />
      </div>
    </div>
  );
}

/**
 * Debug page — tous les personnages × toutes les émotions.
 * Dev mode only. Embedded as an iframe in /docs/12-personnages.
 * Usage: /debug/all-moods
 */
import { useState } from 'react';
import CharacterSprite from '../components/CharacterSprite.jsx';
import { SHOP_CHARACTERS, BASE_EMOTIONS, SHOP_EMOTIONS } from '../data/shopCharacters.js';

const ALL_EMOTIONS = [...BASE_EMOTIONS, ...SHOP_EMOTIONS];

export default function DebugAllMoodsPage() {
  const [selected, setSelected] = useState(null); // { charId, mood }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0f0f1a',
      padding: '1rem',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      color: '#e2e8f0',
    }}>
      <div style={{ fontSize: '0.6rem', color: '#f87171', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.8rem' }}>
        🎭 Tous les moods — {SHOP_CHARACTERS.length} persos × {ALL_EMOTIONS.length} émotions
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: '0.5rem', whiteSpace: 'nowrap' }}>
          <thead>
            <tr>
              <th style={{ color: '#6b7280', padding: '2px 6px', textAlign: 'left', position: 'sticky', left: 0, background: '#0f0f1a', zIndex: 1 }}>
                Perso
              </th>
              {ALL_EMOTIONS.map(e => (
                <th key={e.id} style={{ color: '#a78bfa', padding: '2px 4px', textAlign: 'center', fontWeight: 600, minWidth: 36 }}>
                  <div>{e.symbol}</div>
                  <div style={{ fontSize: '0.45rem', color: '#6b7280', fontWeight: 400 }}>{e.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SHOP_CHARACTERS.map(ch => (
              <tr key={ch.id}>
                <td style={{
                  color: ch.color, padding: '2px 6px', whiteSpace: 'nowrap',
                  fontSize: '0.55rem', fontWeight: 600,
                  position: 'sticky', left: 0, background: '#0f0f1a', zIndex: 1,
                }}>
                  {ch.emoji} {ch.name}
                </td>
                {ALL_EMOTIONS.map(e => {
                  const isSelected = selected?.charId === ch.id && selected?.mood === e.id;
                  return (
                    <td
                      key={e.id}
                      style={{
                        padding: '1px 2px', textAlign: 'center', cursor: 'pointer',
                        background: isSelected ? 'rgba(167,139,250,0.15)' : 'transparent',
                        borderRadius: 4,
                      }}
                      onClick={() => setSelected(isSelected ? null : { charId: ch.id, mood: e.id })}
                    >
                      <CharacterSprite id={ch.id} mood={e.id} size={28} glow={false} />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div style={{
          position: 'fixed', bottom: '1rem', right: '1rem',
          background: '#1a1a2e', border: '1px solid #7c3aed',
          borderRadius: 12, padding: '1rem', display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '0.5rem', zIndex: 100,
        }}>
          {(() => {
            const ch = SHOP_CHARACTERS.find(c => c.id === selected.charId);
            const e = ALL_EMOTIONS.find(x => x.id === selected.mood);
            return <>
              <CharacterSprite id={selected.charId} mood={selected.mood} size={80} glow={true} />
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: ch?.color }}>{ch?.emoji} {ch?.name}</div>
              <div style={{ fontSize: '0.65rem', color: '#a78bfa' }}>{e?.symbol} {e?.name}</div>
              <button
                onClick={() => setSelected(null)}
                style={{ fontSize: '0.6rem', color: '#6b7280', background: 'none', border: 'none', cursor: 'pointer', marginTop: '0.2rem' }}
              >
                fermer ✕
              </button>
            </>;
          })()}
        </div>
      )}
    </div>
  );
}

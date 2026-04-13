const VICTORY_KEYFRAMES = `
@keyframes victory-neon-pulse {
  0%, 100% { opacity: 0.45; transform: scale(0.92); }
  50% { opacity: 1; transform: scale(1.08); }
}

@keyframes victory-glitch-jitter {
  0%, 100% { transform: translate(0, 0); }
  20% { transform: translate(-2px, 1px); }
  40% { transform: translate(2px, -1px); }
  60% { transform: translate(-1px, -2px); }
  80% { transform: translate(2px, 2px); }
}

@keyframes victory-shockwave-ring {
  0% { transform: scale(0.3); opacity: 0.9; }
  100% { transform: scale(1.8); opacity: 0; }
}

@keyframes victory-confetti-fall {
  0% { transform: translate3d(0, -28px, 0) rotate(0deg); opacity: 0; }
  10% { opacity: 1; }
  100% { transform: translate3d(var(--drift, 0px), 128px, 0) rotate(320deg); opacity: 0; }
}
`;

const CONFETTI_BITS = [
  { left: '18%', delay: '0s', duration: '1.9s', color: '#fbbf24', drift: '-14px' },
  { left: '32%', delay: '0.25s', duration: '2.1s', color: '#fde68a', drift: '10px' },
  { left: '50%', delay: '0.12s', duration: '1.8s', color: '#c084fc', drift: '-6px' },
  { left: '66%', delay: '0.38s', duration: '2.2s', color: '#f59e0b', drift: '14px' },
  { left: '81%', delay: '0.2s', duration: '2s', color: '#ffffff', drift: '-10px' },
];

export default function VictoryAnimationPreview({
  animationId,
  size = 130,
  showLabel = true,
}) {
  const trophySize = Math.round(size * 0.36);
  const stageSize = size;
  const isNeon = animationId === 'anim-neon';
  const isGlitch = animationId === 'anim-glitch';
  const isShockwave = animationId === 'anim-shockwave';
  const isConfetti = animationId === 'anim-confetti';

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.7rem' }}>
      <style>{VICTORY_KEYFRAMES}</style>
      <div style={{
        position: 'relative',
        width: stageSize,
        height: stageSize,
        borderRadius: 30,
        overflow: 'hidden',
        background: 'radial-gradient(circle at 50% 32%, rgba(255,255,255,0.12), rgba(255,255,255,0.03) 48%, rgba(0,0,0,0.18) 100%)',
        border: '1px solid rgba(255,255,255,0.09)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 12px 28px rgba(0,0,0,0.25)',
      }}>
        {isNeon && (
          <>
            <div style={{
              position: 'absolute',
              inset: '16%',
              borderRadius: '50%',
              border: '3px solid rgba(192,132,252,0.95)',
              boxShadow: '0 0 18px rgba(192,132,252,0.65), 0 0 42px rgba(59,130,246,0.4)',
              animation: 'victory-neon-pulse 1.9s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute',
              inset: '8%',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124,58,237,0.18), transparent 68%)',
              animation: 'victory-neon-pulse 1.9s ease-in-out infinite',
            }} />
          </>
        )}

        {isShockwave && (
          <>
            {[0, 0.8].map((delay) => (
              <div
                key={delay}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: size * 0.28,
                  height: size * 0.28,
                  marginLeft: -(size * 0.14),
                  marginTop: -(size * 0.14),
                  borderRadius: '50%',
                  border: '2px solid rgba(251,191,36,0.75)',
                  boxShadow: '0 0 18px rgba(251,191,36,0.2)',
                  animation: `victory-shockwave-ring 2.1s ease-out ${delay}s infinite`,
                }}
              />
            ))}
          </>
        )}

        {isConfetti && CONFETTI_BITS.map((bit, index) => (
          <span
            key={index}
            style={{
              position: 'absolute',
              top: 10,
              left: bit.left,
              width: 7,
              height: 14,
              borderRadius: 999,
              background: bit.color,
              boxShadow: `0 0 8px ${bit.color}`,
              transform: 'translate3d(0,-28px,0)',
              opacity: 0,
              animation: `victory-confetti-fall ${bit.duration} linear ${bit.delay} infinite`,
              '--drift': bit.drift,
            }}
          />
        ))}

        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -46%)',
          fontSize: trophySize,
          lineHeight: 1,
          filter: isGlitch ? 'drop-shadow(-2px 0 rgba(239,68,68,0.65)) drop-shadow(2px 0 rgba(59,130,246,0.6))' : 'drop-shadow(0 8px 16px rgba(0,0,0,0.35))',
          animation: isGlitch ? 'victory-glitch-jitter 0.22s steps(2, end) infinite' : 'none',
          zIndex: 2,
        }}>
          🏆
        </div>

        {isGlitch && (
          <>
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-48%, -46%)',
              fontSize: trophySize,
              color: 'rgba(239,68,68,0.5)',
              mixBlendMode: 'screen',
              animation: 'victory-glitch-jitter 0.22s steps(2, end) infinite reverse',
              zIndex: 1,
            }}>
              🏆
            </div>
            <div style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-52%, -46%)',
              fontSize: trophySize,
              color: 'rgba(59,130,246,0.55)',
              mixBlendMode: 'screen',
              animation: 'victory-glitch-jitter 0.25s steps(2, end) infinite',
              zIndex: 1,
            }}>
              🏆
            </div>
          </>
        )}

        <div style={{
          position: 'absolute',
          left: '50%',
          bottom: 16,
          transform: 'translateX(-50%)',
          width: size * 0.54,
          height: 10,
          borderRadius: 999,
          background: 'radial-gradient(circle, rgba(251,191,36,0.32), rgba(251,191,36,0.02) 72%)',
          filter: 'blur(2px)',
        }} />
      </div>

      {showLabel && (
        <div style={{
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#d1d5db',
          letterSpacing: '0.03em',
          textTransform: 'uppercase',
        }}>
          Animation de victoire
        </div>
      )}
    </div>
  );
}

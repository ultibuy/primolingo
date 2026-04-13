import FlameIcon from './FlameIcon.jsx';

export default function CosmeticFlameIcon({ size = 40, intensity = 1, flameId = null }) {
  if (!flameId) {
    return <FlameIcon size={size} intensity={intensity} />;
  }

  const emojiSize = Math.round(size * 0.58);
  const glowSize = Math.round(size * 0.9);

  return (
    <div style={{
      width: size,
      height: size,
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <style>{keyframes}</style>
      <div style={{
        position: 'absolute',
        width: glowSize,
        height: glowSize,
        borderRadius: '50%',
        background: glowFor(flameId),
        filter: 'blur(10px)',
        opacity: 0.75,
        animation: glowAnimationFor(flameId),
      }} />
      {renderVariant(flameId, emojiSize)}
    </div>
  );
}

function renderVariant(flameId, emojiSize) {
  switch (flameId) {
    case 'flame-lightning':
      return (
        <>
          <span style={{
            position: 'absolute',
            width: emojiSize * 0.28,
            height: emojiSize * 1.05,
            borderRadius: 999,
            background: 'linear-gradient(180deg, rgba(255,255,255,0.95), rgba(167,139,250,0.12))',
            filter: 'blur(1.5px)',
            opacity: 0.9,
            animation: 'lightning-flash 0.9s ease-in-out infinite',
          }} />
          <span style={emojiStyle(emojiSize, 'lightning-bolt 0.95s steps(2, end) infinite', '#f5d0fe')}>
            {'⚡'}
          </span>
        </>
      );
    case 'flame-wave':
      return (
        <>
          <span style={{
            position: 'absolute',
            width: emojiSize * 1.05,
            height: emojiSize * 0.34,
            borderRadius: 999,
            border: '2px solid rgba(186,230,253,0.45)',
            transform: 'translateY(18%)',
            opacity: 0.85,
            animation: 'wave-ripple 1.8s ease-in-out infinite',
          }} />
          <span style={emojiStyle(emojiSize, 'wave-bob 1.8s ease-in-out infinite', '#bfdbfe')}>
            {'🌊'}
          </span>
        </>
      );
    case 'flame-target':
      return (
        <>
          <span style={{
            position: 'absolute',
            width: emojiSize * 1.12,
            height: emojiSize * 1.12,
            borderRadius: '50%',
            border: '2px solid rgba(248,113,113,0.28)',
            animation: 'target-pulse 1.6s ease-out infinite',
          }} />
          <span style={emojiStyle(emojiSize, 'target-focus 2.2s ease-in-out infinite', '#fecaca')}>
            {'🎯'}
          </span>
        </>
      );
    case 'flame-skull':
      return (
        <>
          <span style={{
            position: 'absolute',
            width: emojiSize * 0.9,
            height: emojiSize * 0.9,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(248,113,113,0.4), rgba(127,29,29,0.02) 70%)',
            animation: 'skull-aura 2s ease-in-out infinite',
          }} />
          <span style={emojiStyle(emojiSize, 'skull-wobble 1.7s ease-in-out infinite', '#fecaca')}>
            {'💀'}
          </span>
        </>
      );
    case 'flame-dragon':
      return (
        <>
          <span style={{
            position: 'absolute',
            width: emojiSize * 1.18,
            height: emojiSize * 1.18,
            borderRadius: '50%',
            border: '2px dashed rgba(74,222,128,0.22)',
            animation: 'dragon-orbit 5s linear infinite',
          }} />
          <span style={emojiStyle(emojiSize, 'dragon-float 2.4s ease-in-out infinite', '#bbf7d0')}>
            {'🐉'}
          </span>
        </>
      );
    default:
      return <FlameIcon size={Math.round(emojiSize * 1.45)} intensity={1} />;
  }
}

function emojiStyle(size, animation, color) {
  return {
    position: 'relative',
    zIndex: 1,
    fontSize: size,
    lineHeight: 1,
    filter: `drop-shadow(0 0 10px ${color})`,
    animation,
    display: 'inline-block',
    transformOrigin: 'center center',
  };
}

function glowFor(flameId) {
  switch (flameId) {
    case 'flame-lightning':
      return 'radial-gradient(circle, rgba(216,180,254,0.95), rgba(124,58,237,0.12) 68%)';
    case 'flame-wave':
      return 'radial-gradient(circle, rgba(125,211,252,0.85), rgba(14,116,144,0.1) 68%)';
    case 'flame-target':
      return 'radial-gradient(circle, rgba(252,165,165,0.9), rgba(127,29,29,0.08) 68%)';
    case 'flame-skull':
      return 'radial-gradient(circle, rgba(248,113,113,0.8), rgba(69,10,10,0.12) 68%)';
    case 'flame-dragon':
      return 'radial-gradient(circle, rgba(74,222,128,0.75), rgba(20,83,45,0.1) 68%)';
    default:
      return 'radial-gradient(circle, rgba(251,191,36,0.7), rgba(245,158,11,0.08) 68%)';
  }
}

function glowAnimationFor(flameId) {
  switch (flameId) {
    case 'flame-lightning':
      return 'lightning-glow 0.95s ease-in-out infinite';
    case 'flame-wave':
      return 'wave-glow 1.8s ease-in-out infinite';
    case 'flame-target':
      return 'target-glow 1.6s ease-in-out infinite';
    case 'flame-skull':
      return 'skull-aura 2s ease-in-out infinite';
    case 'flame-dragon':
      return 'dragon-breathe 2.4s ease-in-out infinite';
    default:
      return 'wave-glow 2s ease-in-out infinite';
  }
}

const keyframes = `
@keyframes lightning-bolt {
  0%, 100% { transform: translateY(0) scale(0.96); }
  18% { transform: translateY(-8%) scale(1.08); }
  36% { transform: translateY(4%) scale(0.92); }
  54% { transform: translateY(-4%) scale(1.02); }
}
@keyframes lightning-flash {
  0%, 100% { opacity: 0.18; transform: scaleY(0.7); }
  20%, 45% { opacity: 1; transform: scaleY(1.05); }
  60% { opacity: 0.26; transform: scaleY(0.8); }
}
@keyframes lightning-glow {
  0%, 100% { transform: scale(0.82); opacity: 0.42; }
  22%, 44% { transform: scale(1.08); opacity: 0.95; }
}
@keyframes wave-bob {
  0%, 100% { transform: translateY(5%) rotate(-4deg); }
  50% { transform: translateY(-6%) rotate(4deg); }
}
@keyframes wave-ripple {
  0%, 100% { transform: translateY(18%) scaleX(0.9); opacity: 0.55; }
  50% { transform: translateY(18%) scaleX(1.08); opacity: 0.95; }
}
@keyframes wave-glow {
  0%, 100% { transform: scale(0.88); opacity: 0.45; }
  50% { transform: scale(1.04); opacity: 0.82; }
}
@keyframes target-focus {
  0%, 100% { transform: scale(0.96) rotate(-4deg); }
  50% { transform: scale(1.06) rotate(4deg); }
}
@keyframes target-pulse {
  0% { transform: scale(0.82); opacity: 0.7; }
  70% { transform: scale(1.14); opacity: 0; }
  100% { transform: scale(1.14); opacity: 0; }
}
@keyframes target-glow {
  0%, 100% { transform: scale(0.9); opacity: 0.3; }
  50% { transform: scale(1.08); opacity: 0.7; }
}
@keyframes skull-wobble {
  0%, 100% { transform: translateY(0) rotate(-5deg); }
  50% { transform: translateY(-5%) rotate(5deg); }
}
@keyframes skull-aura {
  0%, 100% { transform: scale(0.9); opacity: 0.32; }
  50% { transform: scale(1.08); opacity: 0.7; }
}
@keyframes dragon-float {
  0%, 100% { transform: translateY(0) rotate(-4deg); }
  50% { transform: translateY(-8%) rotate(4deg); }
}
@keyframes dragon-orbit {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
@keyframes dragon-breathe {
  0%, 100% { transform: scale(0.88); opacity: 0.42; }
  50% { transform: scale(1.1); opacity: 0.82; }
}
`;

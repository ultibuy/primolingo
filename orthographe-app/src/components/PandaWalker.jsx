/**
 * Animated armored panda.
 * Props:
 *   mood  — 'walk'|'wave'|'clap'|'cheer'|'kiss'|'sleep'|'dance'|'surprise'|'victory'|'think'|'challenge'
 *   flip  — face left
 *   size  — base width px
 */
export default function PandaWalker({ flip = false, size = 30, mood = 'walk', waving = false }) {
  // backward compat
  const m = waving ? 'wave' : mood;
  const h = Math.round(size * 1.35);
  const id = 'pw';

  const css = `
    /* ── Walk ── */
    @keyframes ${id}Bounce      { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-2.5px)} }
    @keyframes ${id}LegL        { 0%,100%{transform:rotate(-22deg)} 50%{transform:rotate(22deg)}  }
    @keyframes ${id}LegR        { 0%,100%{transform:rotate(22deg)}  50%{transform:rotate(-22deg)} }
    @keyframes ${id}ArmLWalk    { 0%,100%{transform:rotate(-15deg)} 50%{transform:rotate(18deg)}  }
    @keyframes ${id}ArmRWalk    { 0%,100%{transform:rotate(15deg)}  50%{transform:rotate(-18deg)} }
    /* ── Idle ── */
    @keyframes ${id}IdleBounce  { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-1px)} }
    /* ── Wave ── */
    @keyframes ${id}Wave        { 0%,100%{transform:rotate(-110deg) translateY(-2px)} 50%{transform:rotate(-148deg) translateY(-2px)} }
    /* ── Clap ── */
    @keyframes ${id}ClapBounce  { 0%,100%{transform:translateY(0)}  40%{transform:translateY(-2px)} }
    @keyframes ${id}ClapL       { 0%,100%{transform:rotate(65deg)}  50%{transform:rotate(78deg)} }
    @keyframes ${id}ClapR       { 0%,100%{transform:rotate(-65deg)} 50%{transform:rotate(-78deg)} }
    /* ── Cheer ── */
    @keyframes ${id}CheerBounce { 0%,100%{transform:translateY(0)}  45%{transform:translateY(-9px)} }
    @keyframes ${id}CheerArmL   { 0%,100%{transform:rotate(-148deg)} 50%{transform:rotate(-125deg)} }
    @keyframes ${id}CheerArmR   { 0%,100%{transform:rotate(148deg)}  50%{transform:rotate(125deg)} }
    @keyframes ${id}CheerLegL   { 0%,100%{transform:rotate(-10deg)} 50%{transform:rotate(5deg)} }
    @keyframes ${id}CheerLegR   { 0%,100%{transform:rotate(10deg)}  50%{transform:rotate(-5deg)} }
    /* ── Kiss ── */
    @keyframes ${id}KissSway    { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-1px) rotate(2deg)} }
    @keyframes ${id}KissArmR    { 0%,100%{transform:rotate(-20deg)} 50%{transform:rotate(-12deg)} }
    /* ── Sleep ── */
    @keyframes ${id}SleepBreathe{ 0%,100%{transform:rotate(-8deg) translateY(0)} 50%{transform:rotate(-8deg) translateY(1.5px)} }
    /* ── Dance ── */
    @keyframes ${id}DanceSway   { 0%,100%{transform:translateX(-5px) rotate(-4deg)} 50%{transform:translateX(5px) rotate(4deg)} }
    @keyframes ${id}DanceArmL   { 0%,100%{transform:rotate(-90deg)} 50%{transform:rotate(-25deg)} }
    @keyframes ${id}DanceArmR   { 0%,100%{transform:rotate(25deg)}  50%{transform:rotate(90deg)} }
    @keyframes ${id}DanceLegL   { 0%,100%{transform:rotate(-15deg)} 50%{transform:rotate(5deg)} }
    @keyframes ${id}DanceLegR   { 0%,100%{transform:rotate(5deg)}   50%{transform:rotate(-15deg)} }
    /* ── Surprise ── */
    @keyframes ${id}SurprisePop { 0%{transform:translateY(0) scale(1)} 18%{transform:translateY(-8px) scale(1.06)} 35%{transform:translateY(0) scale(0.94)} 50%{transform:translateY(-3px) scale(1)} 100%{transform:translateY(0) scale(1)} }
    @keyframes ${id}SurpArmL    { 0%,100%{transform:rotate(-100deg)} 50%{transform:rotate(-80deg)} }
    @keyframes ${id}SurpArmR    { 0%,100%{transform:rotate(100deg)}  50%{transform:rotate(80deg)} }
    /* ── Victory ── */
    @keyframes ${id}VicBounce   { 0%,100%{transform:translateY(0)}  40%{transform:translateY(-11px)} }
    @keyframes ${id}VicArmL     { 0%,100%{transform:rotate(-155deg)} 50%{transform:rotate(-135deg)} }
    @keyframes ${id}VicArmR     { 0%,100%{transform:rotate(155deg)}  50%{transform:rotate(135deg)} }
    @keyframes ${id}VicLegL     { 0%,100%{transform:rotate(-12deg)} 50%{transform:rotate(5deg)} }
    @keyframes ${id}VicLegR     { 0%,100%{transform:rotate(12deg)}  50%{transform:rotate(-5deg)} }
    /* ── Think ── */
    @keyframes ${id}ThinkSway   { 0%,100%{transform:rotate(4deg) translateY(0)} 50%{transform:rotate(4deg) translateY(-1px)} }
    @keyframes ${id}ThinkArmR   { 0%,100%{transform:rotate(-55deg)} 50%{transform:rotate(-50deg)} }
    /* ── Challenge ── */
    @keyframes ${id}ChalAura    { 0%,100%{opacity:0.25; transform:scale(1)}   50%{opacity:0.55; transform:scale(1.12)} }
    @keyframes ${id}ChalSway    { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-0.5px) rotate(1deg)} }
    /* ── Blink ── */
    @keyframes ${id}Blink       { 0%,90%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.07)} }
    /* ── Floating hearts ── */
    @keyframes ${id}Heart1 { 0%{transform:translate(0,0) scale(0.6);opacity:0} 15%{opacity:1} 100%{transform:translate(-8px,-36px) scale(1);opacity:0} }
    @keyframes ${id}Heart2 { 0%{transform:translate(0,0) scale(0.5);opacity:0} 25%{opacity:1} 100%{transform:translate(10px,-42px) scale(0.9);opacity:0} }
    @keyframes ${id}Heart3 { 0%{transform:translate(0,0) scale(0.4);opacity:0} 20%{opacity:0.9} 100%{transform:translate(4px,-30px) scale(0.7);opacity:0} }
    /* ── ZZZ ── */
    @keyframes ${id}Zzz1 { 0%{transform:translate(0,0) scale(0.5);opacity:0} 20%{opacity:1} 100%{transform:translate(12px,-38px) scale(1.2);opacity:0} }
    @keyframes ${id}Zzz2 { 0%{transform:translate(0,0) scale(0.4);opacity:0} 20%{opacity:0.9} 100%{transform:translate(18px,-48px) scale(1);opacity:0} }
    /* ── Sparkles (clap) ── */
    @keyframes ${id}Spark { 0%,100%{transform:scale(0);opacity:0} 50%{transform:scale(1);opacity:1} }
    /* ── Question mark ── */
    @keyframes ${id}Qmark { 0%{transform:translateY(0) scale(0.7);opacity:0} 25%{opacity:1} 85%{opacity:1} 100%{transform:translateY(-28px) scale(1);opacity:0} }
  `;

  const ei = 'ease-in-out';

  // Per-mood animation styles
  const MOODS = {
    walk: {
      body:  { animation: `${id}Bounce 0.48s ${ei} infinite`, transformOrigin: '15px 38px' },
      armL:  { animation: `${id}ArmLWalk 0.48s ${ei} infinite`, transformOrigin: '4px 18px' },
      armR:  { animation: `${id}ArmRWalk 0.48s ${ei} infinite`, transformOrigin: '26px 18px' },
      legL:  { animation: `${id}LegL 0.48s ${ei} infinite`, transformOrigin: '11px 30px' },
      legR:  { animation: `${id}LegR 0.48s ${ei} infinite`, transformOrigin: '19px 30px' },
    },
    wave: {
      body:  { animation: `${id}IdleBounce 1.2s ${ei} infinite`, transformOrigin: '15px 38px' },
      armL:  { animation: 'none', transformOrigin: '4px 18px' },
      armR:  { animation: `${id}Wave 0.55s ${ei} infinite`, transformOrigin: '26px 18px' },
      legL:  { animation: 'none', transformOrigin: '11px 30px' },
      legR:  { animation: 'none', transformOrigin: '19px 30px' },
    },
    clap: {
      body:  { animation: `${id}ClapBounce 0.4s ${ei} infinite`, transformOrigin: '15px 38px' },
      armL:  { animation: `${id}ClapL 0.4s ${ei} infinite`, transformOrigin: '4px 18px' },
      armR:  { animation: `${id}ClapR 0.4s ${ei} infinite`, transformOrigin: '26px 18px' },
      legL:  { animation: 'none', transformOrigin: '11px 30px' },
      legR:  { animation: 'none', transformOrigin: '19px 30px' },
    },
    cheer: {
      body:  { animation: `${id}CheerBounce 0.42s ${ei} infinite`, transformOrigin: '15px 38px' },
      armL:  { animation: `${id}CheerArmL 0.42s ${ei} infinite`, transformOrigin: '4px 18px' },
      armR:  { animation: `${id}CheerArmR 0.42s ${ei} infinite`, transformOrigin: '26px 18px' },
      legL:  { animation: `${id}CheerLegL 0.42s ${ei} infinite`, transformOrigin: '11px 30px' },
      legR:  { animation: `${id}CheerLegR 0.42s ${ei} infinite`, transformOrigin: '19px 30px' },
    },
    kiss: {
      body:  { animation: `${id}KissSway 1.4s ${ei} infinite`, transformOrigin: '15px 38px' },
      armL:  { animation: 'none', transformOrigin: '4px 18px' },
      armR:  { animation: `${id}KissArmR 1.4s ${ei} infinite`, transformOrigin: '26px 18px' },
      legL:  { animation: 'none', transformOrigin: '11px 30px' },
      legR:  { animation: 'none', transformOrigin: '19px 30px' },
    },
    sleep: {
      body:  { animation: `${id}SleepBreathe 2.2s ${ei} infinite`, transformOrigin: '15px 38px' },
      armL:  { animation: 'none', transformOrigin: '4px 18px' },
      armR:  { animation: 'none', transformOrigin: '26px 18px' },
      legL:  { animation: 'none', transformOrigin: '11px 30px' },
      legR:  { animation: 'none', transformOrigin: '19px 30px' },
    },
    dance: {
      body:  { animation: `${id}DanceSway 0.55s ${ei} infinite`, transformOrigin: '15px 38px' },
      armL:  { animation: `${id}DanceArmL 0.55s ${ei} infinite`, transformOrigin: '4px 18px' },
      armR:  { animation: `${id}DanceArmR 0.55s ${ei} infinite`, transformOrigin: '26px 18px' },
      legL:  { animation: `${id}DanceLegL 0.55s ${ei} infinite`, transformOrigin: '11px 30px' },
      legR:  { animation: `${id}DanceLegR 0.55s ${ei} infinite`, transformOrigin: '19px 30px' },
    },
    surprise: {
      body:  { animation: `${id}SurprisePop 1.1s ${ei} infinite`, transformOrigin: '15px 38px' },
      armL:  { animation: `${id}SurpArmL 1.1s ${ei} infinite`, transformOrigin: '4px 18px' },
      armR:  { animation: `${id}SurpArmR 1.1s ${ei} infinite`, transformOrigin: '26px 18px' },
      legL:  { animation: 'none', transformOrigin: '11px 30px' },
      legR:  { animation: 'none', transformOrigin: '19px 30px' },
    },
    victory: {
      body:  { animation: `${id}VicBounce 0.45s ${ei} infinite`, transformOrigin: '15px 38px' },
      armL:  { animation: `${id}VicArmL 0.45s ${ei} infinite`, transformOrigin: '4px 18px' },
      armR:  { animation: `${id}VicArmR 0.45s ${ei} infinite`, transformOrigin: '26px 18px' },
      legL:  { animation: `${id}VicLegL 0.45s ${ei} infinite`, transformOrigin: '11px 30px' },
      legR:  { animation: `${id}VicLegR 0.45s ${ei} infinite`, transformOrigin: '19px 30px' },
    },
    think: {
      body:  { animation: `${id}ThinkSway 2s ${ei} infinite`, transformOrigin: '15px 38px' },
      armL:  { animation: 'none', transformOrigin: '4px 18px' },
      armR:  { animation: `${id}ThinkArmR 2s ${ei} infinite`, transformOrigin: '26px 18px' },
      legL:  { animation: 'none', transformOrigin: '11px 30px' },
      legR:  { animation: 'none', transformOrigin: '19px 30px' },
    },
    challenge: {
      body:  { animation: `${id}ChalSway 2s ${ei} infinite`, transformOrigin: '15px 38px' },
      armL:  { animation: 'none', transform: 'rotate(55deg)', transformOrigin: '4px 18px' },
      armR:  { animation: 'none', transform: 'rotate(-55deg)', transformOrigin: '26px 18px' },
      legL:  { animation: 'none', transformOrigin: '11px 30px' },
      legR:  { animation: 'none', transformOrigin: '19px 30px' },
    },
  };

  const s = MOODS[m] || MOODS.walk;

  // Face variants
  const isSleeping    = m === 'sleep';
  const isSurprised   = m === 'surprise';
  const isKissing     = m === 'kiss';
  const isChallenging = m === 'challenge';
  const blinkAnim     = !isSleeping && !isSurprised ? `${id}Blink 3.5s ${ei} infinite` : 'none';

  return (
    <div style={{
      width: size, height: h,
      display: 'inline-block',
      transform: flip ? 'scaleX(-1)' : 'none',
      flexShrink: 0,
      filter: 'drop-shadow(0 0 5px rgba(255,255,255,0.85)) drop-shadow(0 0 10px rgba(255,255,255,0.4))',
      position: 'relative',
    }}>
      <svg viewBox="0 0 30 40" width={size} height={h} xmlns="http://www.w3.org/2000/svg" overflow="visible">
        <defs>
          <style>{css}</style>
          <linearGradient id={`${id}ag`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b0c8d8"/><stop offset="100%" stopColor="#6a8799"/>
          </linearGradient>
          <linearGradient id={`${id}hg`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9ab8c8"/><stop offset="100%" stopColor="#5a7a8a"/>
          </linearGradient>
        </defs>

        {/* Challenge aura */}
        {m === 'challenge' && (
          <circle cx="15" cy="20" r="18" fill="none" stroke="#f87171" strokeWidth="2"
            style={{ animation: `${id}ChalAura 1.2s ${ei} infinite`, transformOrigin: '15px 20px' }} />
        )}

        {/* ── Floating elements ── */}

        {/* Hearts (kiss) */}
        {m === 'kiss' && (<>
          <path d="M-2-2 C-2-4,-5-4,-5-2 C-5,0,-2,2,0,4 C2,2,5,0,5-2 C5-4,2-4,2-2 C2-3,0-2,0-2 C0-2,-2-3,-2-2 Z"
            fill="#f472b6" style={{ animation: `${id}Heart1 1.8s ease-out infinite`, transformOrigin: '0 0' }}
            transform="translate(22,8)" />
          <path d="M-1.5-1.5 C-1.5-3,-4-3,-4-1.5 C-4,0,-1.5,1.5,0,3 C1.5,1.5,4,0,4-1.5 C4-3,1.5-3,1.5-1.5 C1.5-2.2,0-1.5,0-1.5 Z"
            fill="#fb7185" style={{ animation: `${id}Heart2 1.8s ease-out 0.6s infinite`, transformOrigin: '0 0' }}
            transform="translate(18,5)" />
          <path d="M-1-1 C-1-2,-3-2,-3-1 C-3,0,-1,1,0,2 C1,1,3,0,3-1 C3-2,1-2,1-1 C1-1.5,0-1,0-1 Z"
            fill="#f9a8d4" style={{ animation: `${id}Heart3 1.8s ease-out 1.1s infinite`, transformOrigin: '0 0' }}
            transform="translate(20,10)" />
        </>)}

        {/* ZZZ (sleep) */}
        {m === 'sleep' && (<>
          <text x="20" y="8" fontSize="5" fontWeight="900" fill="#93c5fd" fontFamily="sans-serif"
            style={{ animation: `${id}Zzz1 2s ease-out infinite`, transformOrigin: '22px 6px' }}>Z</text>
          <text x="23" y="4" fontSize="7" fontWeight="900" fill="#60a5fa" fontFamily="sans-serif"
            style={{ animation: `${id}Zzz2 2s ease-out 0.7s infinite`, transformOrigin: '26px 2px' }}>Z</text>
        </>)}

        {/* Sparkles (clap) */}
        {m === 'clap' && (<>
          {[[-3,15,'0s'],[ 5,18,'0.2s'],[ 0,25,'0.13s'],[-6,22,'0.3s']].map(([dx,dy,delay], i) => (
            <g key={i} transform={`translate(${15+dx},${dy})`}
              style={{ animation: `${id}Spark 0.4s ${ei} ${delay} infinite`, transformOrigin: `${15+dx}px ${dy}px` }}>
              <line x1="-3" y1="0" x2="3" y2="0" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="0" y1="-3" x2="0" y2="3" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="-2" y1="-2" x2="2" y2="2" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round"/>
              <line x1="2" y1="-2" x2="-2" y2="2" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round"/>
            </g>
          ))}
        </>)}

        {/* Question marks (think) */}
        {m === 'think' && (<>
          <text x="20" y="6" fontSize="6" fontWeight="900" fill="#a78bfa" fontFamily="sans-serif"
            style={{ animation: `${id}Qmark 2.4s ease-out infinite`, transformOrigin: '22px 4px' }}>?</text>
          <text x="23" y="2" fontSize="4.5" fontWeight="900" fill="#c4b5fd" fontFamily="sans-serif"
            style={{ animation: `${id}Qmark 2.4s ease-out 0.8s infinite`, transformOrigin: '25px 0px' }}>?</text>
        </>)}

        {/* ── Body group ── */}
        <g style={s.body}>

          {/* Legs */}
          <g style={s.legL}>
            <rect x="7.5" y="29" width="7" height="9" rx="3.2" fill="#1a1a1a"/>
            <rect x="7" y="34" width="8" height="4" rx="2" fill={`url(#${id}ag)`}/>
          </g>
          <g style={s.legR}>
            <rect x="15.5" y="29" width="7" height="9" rx="3.2" fill="#1a1a1a"/>
            <rect x="15" y="34" width="8" height="4" rx="2" fill={`url(#${id}ag)`}/>
          </g>

          {/* Body */}
          <rect x="6" y="16" width="18" height="15" rx="6" fill="#f0f0f0"/>
          <rect x="7.5" y="17" width="15" height="13" rx="4" fill={`url(#${id}ag)`}/>
          <rect x="9" y="18.5" width="12" height="2" rx="1" fill="#c8dde8" opacity="0.9"/>
          <rect x="9" y="21.5" width="12" height="1.2" rx="0.6" fill="#507080" opacity="0.7"/>
          <rect x="9" y="24"   width="12" height="1.2" rx="0.6" fill="#507080" opacity="0.7"/>
          <circle cx="15" cy="22.5" r="2.8" fill="#1e3a5a"/>
          <circle cx="15" cy="22.5" r="2"   fill="#60a5fa"/>
          <circle cx="15" cy="22.5" r="1"   fill="#93c5fd"/>
          <circle cx="14.2" cy="21.8" r="0.4" fill="white" opacity="0.9"/>

          {/* Arms */}
          <g style={s.armL}>
            <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#f0f0f0"/>
            <rect x="1"   y="17" width="6" height="6" rx="2.5" fill={`url(#${id}ag)`}/>
          </g>
          <g style={s.armR}>
            <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#f0f0f0"/>
            <rect x="23"   y="17" width="6" height="6" rx="2.5" fill={`url(#${id}ag)`}/>
          </g>

          {/* Ears */}
          <circle cx="7.5"  cy="7.5" r="4.8" fill="#1a1a1a"/>
          <circle cx="22.5" cy="7.5" r="4.8" fill="#1a1a1a"/>
          <circle cx="7.5"  cy="7.5" r="2.2" fill="#2d2d2d"/>
          <circle cx="22.5" cy="7.5" r="2.2" fill="#2d2d2d"/>

          {/* Head */}
          <circle cx="15" cy="11.5" r="10.5" fill="#f5f5f5"/>

          {/* Helmet */}
          <rect x="9.5" y="3.5" width="11" height="5.5" rx="2.5" fill={`url(#${id}hg)`} opacity="0.9"/>
          <rect x="10.5" y="4.5" width="9" height="2" rx="1" fill="#c0d8e8" opacity="0.9"/>

          {/* Challenge brows */}
          {isChallenging && (<>
            <line x1="7.5" y1="8.5" x2="12.5" y2="7" stroke="#111" strokeWidth="1.2" strokeLinecap="round"/>
            <line x1="17.5" y1="7" x2="22.5" y2="8.5" stroke="#111" strokeWidth="1.2" strokeLinecap="round"/>
          </>)}

          {/* Eye patches */}
          <ellipse cx="10.5" cy="11" rx="4.2" ry="3.8" fill="#1a1a1a" transform="rotate(-8 10.5 11)"/>
          <ellipse cx="19.5" cy="11" rx="4.2" ry="3.8" fill="#1a1a1a" transform="rotate(8 19.5 11)"/>

          {/* Eyes */}
          {isSleeping ? (<>
            {/* Closed eyes */}
            <path d="M8.5 11 Q10.5 13 12.5 11" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M17.5 11 Q19.5 13 21.5 11" fill="none" stroke="white" strokeWidth="1.2" strokeLinecap="round"/>
          </>) : isSurprised ? (<>
            {/* Big round eyes */}
            <circle cx="10.5" cy="11" r="2.8" fill="white"/>
            <circle cx="10.9" cy="11.3" r="1.4" fill="#111"/>
            <circle cx="11.4" cy="10.6" r="0.5" fill="white"/>
            <circle cx="19.5" cy="11" r="2.8" fill="white"/>
            <circle cx="19.9" cy="11.3" r="1.4" fill="#111"/>
            <circle cx="20.4" cy="10.6" r="0.5" fill="white"/>
          </>) : (<>
            <g style={{ animation: blinkAnim, transformOrigin: '10.5px 11px' }}>
              <circle cx="10.5" cy="11" r="2.2" fill="white"/>
              <circle cx="10.9" cy="11.3" r="1.1" fill="#111"/>
              <circle cx="11.3" cy="10.7" r="0.45" fill="white"/>
            </g>
            <g style={{ animation: blinkAnim, transformOrigin: '19.5px 11px' }}>
              <circle cx="19.5" cy="11" r="2.2" fill="white"/>
              <circle cx="19.9" cy="11.3" r="1.1" fill="#111"/>
              <circle cx="20.3" cy="10.7" r="0.45" fill="white"/>
            </g>
          </>)}

          {/* Nose */}
          <ellipse cx="15" cy="14.5" rx="2.1" ry="1.4" fill="#1a1a1a"/>
          <ellipse cx="14.3" cy="13.9" rx="0.6" ry="0.4" fill="#444"/>

          {/* Mouth */}
          {isKissing ? (
            <circle cx="15" cy="16.5" r="1.6" fill="#f472b6"/>
          ) : isSurprised ? (
            <ellipse cx="15" cy="17" rx="2" ry="2.4" fill="#111"/>
          ) : (
            <path d="M12.5 16.2 Q15 18.4 17.5 16.2" fill="none" stroke="#1a1a1a" strokeWidth="0.9" strokeLinecap="round"/>
          )}

        </g>
      </svg>
    </div>
  );
}

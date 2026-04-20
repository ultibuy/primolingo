// CharacterSprite.jsx
// Props: id (string), mood='walk', size=40, flip=false, glow=true

function makeCss(id) {
  return `
    @keyframes ${id}Bounce      { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-2.5px)} }
    @keyframes ${id}LegL        { 0%,100%{transform:rotate(-22deg)} 50%{transform:rotate(22deg)}  }
    @keyframes ${id}LegR        { 0%,100%{transform:rotate(22deg)}  50%{transform:rotate(-22deg)} }
    @keyframes ${id}ArmLWalk    { 0%,100%{transform:rotate(-15deg)} 50%{transform:rotate(18deg)}  }
    @keyframes ${id}ArmRWalk    { 0%,100%{transform:rotate(15deg)}  50%{transform:rotate(-18deg)} }
    @keyframes ${id}IdleBounce  { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-1px)} }
    @keyframes ${id}Wave        { 0%,100%{transform:rotate(-110deg) translateY(-2px)} 50%{transform:rotate(-148deg) translateY(-2px)} }
    @keyframes ${id}ClapBounce  { 0%,100%{transform:translateY(0)}  40%{transform:translateY(-2px)} }
    @keyframes ${id}ClapL       { 0%,100%{transform:rotate(65deg)}  50%{transform:rotate(78deg)} }
    @keyframes ${id}ClapR       { 0%,100%{transform:rotate(-65deg)} 50%{transform:rotate(-78deg)} }
    @keyframes ${id}CheerBounce { 0%,100%{transform:translateY(0)}  45%{transform:translateY(-9px)} }
    @keyframes ${id}CheerArmL   { 0%,100%{transform:rotate(-148deg)} 50%{transform:rotate(-125deg)} }
    @keyframes ${id}CheerArmR   { 0%,100%{transform:rotate(148deg)}  50%{transform:rotate(125deg)} }
    @keyframes ${id}CheerLegL   { 0%,100%{transform:rotate(-10deg)} 50%{transform:rotate(5deg)} }
    @keyframes ${id}CheerLegR   { 0%,100%{transform:rotate(10deg)}  50%{transform:rotate(-5deg)} }
    @keyframes ${id}KissSway    { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-1px) rotate(2deg)} }
    @keyframes ${id}KissArmR    { 0%,100%{transform:rotate(-20deg)} 50%{transform:rotate(-12deg)} }
    @keyframes ${id}SleepBreathe{ 0%,100%{transform:rotate(-8deg) translateY(0)} 50%{transform:rotate(-8deg) translateY(1.5px)} }
    @keyframes ${id}DanceSway   { 0%,100%{transform:translateX(-5px) rotate(-4deg)} 50%{transform:translateX(5px) rotate(4deg)} }
    @keyframes ${id}DanceArmL   { 0%,100%{transform:rotate(-90deg)} 50%{transform:rotate(-25deg)} }
    @keyframes ${id}DanceArmR   { 0%,100%{transform:rotate(25deg)}  50%{transform:rotate(90deg)} }
    @keyframes ${id}DanceLegL   { 0%,100%{transform:rotate(-15deg)} 50%{transform:rotate(5deg)} }
    @keyframes ${id}DanceLegR   { 0%,100%{transform:rotate(5deg)}   50%{transform:rotate(-15deg)} }
    @keyframes ${id}SurprisePop { 0%{transform:translateY(0) scale(1)} 18%{transform:translateY(-8px) scale(1.06)} 35%{transform:translateY(0) scale(0.94)} 50%{transform:translateY(-3px) scale(1)} 100%{transform:translateY(0) scale(1)} }
    @keyframes ${id}SurpArmL    { 0%,100%{transform:rotate(-100deg)} 50%{transform:rotate(-80deg)} }
    @keyframes ${id}SurpArmR    { 0%,100%{transform:rotate(100deg)}  50%{transform:rotate(80deg)} }
    @keyframes ${id}VicBounce   { 0%,100%{transform:translateY(0)}  40%{transform:translateY(-11px)} }
    @keyframes ${id}VicArmL     { 0%,100%{transform:rotate(-155deg)} 50%{transform:rotate(-135deg)} }
    @keyframes ${id}VicArmR     { 0%,100%{transform:rotate(155deg)}  50%{transform:rotate(135deg)} }
    @keyframes ${id}VicLegL     { 0%,100%{transform:rotate(-12deg)} 50%{transform:rotate(5deg)} }
    @keyframes ${id}VicLegR     { 0%,100%{transform:rotate(12deg)}  50%{transform:rotate(-5deg)} }
    @keyframes ${id}ThinkSway   { 0%,100%{transform:rotate(4deg) translateY(0)} 50%{transform:rotate(4deg) translateY(-1px)} }
    @keyframes ${id}ThinkArmR   { 0%,100%{transform:rotate(-55deg)} 50%{transform:rotate(-50deg)} }
    @keyframes ${id}ChalAura    { 0%,100%{opacity:0.25; transform:scale(1)}   50%{opacity:0.55; transform:scale(1.12)} }
    @keyframes ${id}ChalSway    { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-0.5px) rotate(1deg)} }
    @keyframes ${id}Blink       { 0%,90%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.07)} }
    @keyframes ${id}Heart1 { 0%{transform:translate(0,0) scale(0.6);opacity:0} 15%{opacity:1} 100%{transform:translate(-8px,-36px) scale(1);opacity:0} }
    @keyframes ${id}Heart2 { 0%{transform:translate(0,0) scale(0.5);opacity:0} 25%{opacity:1} 100%{transform:translate(10px,-42px) scale(0.9);opacity:0} }
    @keyframes ${id}Zzz1 { 0%{transform:translate(0,0) scale(0.5);opacity:0} 20%{opacity:1} 100%{transform:translate(12px,-38px) scale(1.2);opacity:0} }
    @keyframes ${id}Zzz2 { 0%{transform:translate(0,0) scale(0.4);opacity:0} 20%{opacity:0.9} 100%{transform:translate(18px,-48px) scale(1);opacity:0} }
    @keyframes ${id}Spark { 0%,100%{transform:scale(0);opacity:0} 50%{transform:scale(1);opacity:1} }
    @keyframes ${id}Qmark { 0%{transform:translateY(0) scale(0.7);opacity:0} 25%{opacity:1} 85%{opacity:1} 100%{transform:translateY(-28px) scale(1);opacity:0} }

    @keyframes ${id}GhostPulse { 0%,100%{opacity:0.12;transform:scale(1)} 50%{opacity:0.3;transform:scale(1.08)} }
    @keyframes ${id}GhostWisp1 { 0%{transform:translate(0,0) scale(1);opacity:0.5} 100%{transform:translate(-6px,-18px) scale(0.3);opacity:0} }
    @keyframes ${id}GhostWisp2 { 0%{transform:translate(0,0) scale(1);opacity:0.4} 100%{transform:translate(8px,-22px) scale(0.2);opacity:0} }
    @keyframes ${id}GhostWisp3 { 0%{transform:translate(0,0) scale(0.8);opacity:0.35} 100%{transform:translate(-3px,-16px) scale(0.15);opacity:0} }
    @keyframes ${id}GhostEyeGlow { 0%,100%{filter:drop-shadow(0 0 2px #a78bfa)} 50%{filter:drop-shadow(0 0 5px #c4b5fd)} }
    @keyframes ${id}GhostTail { 0%,100%{transform:rotate(-5deg) scaleX(1);opacity:0.5} 50%{transform:rotate(5deg) scaleX(1.1);opacity:0.7} }
    @keyframes ${id}GhostChain { 0%,100%{opacity:0.3} 50%{opacity:0.55} }

    @keyframes ${id}BoltFlash { 0%,80%,100%{opacity:1} 85%{opacity:0.3} 90%{opacity:1} 95%{opacity:0.5} }
    @keyframes ${id}SparkJump1 { 0%{transform:translate(0,0) scale(0);opacity:0} 30%{transform:translate(-3px,-4px) scale(1);opacity:1} 100%{transform:translate(-8px,-12px) scale(0);opacity:0} }
    @keyframes ${id}SparkJump2 { 0%{transform:translate(0,0) scale(0);opacity:0} 35%{transform:translate(4px,-5px) scale(1);opacity:1} 100%{transform:translate(10px,-14px) scale(0);opacity:0} }
    @keyframes ${id}SparkJump3 { 0%{transform:translate(0,0) scale(0);opacity:0} 25%{transform:translate(-2px,-3px) scale(0.8);opacity:0.9} 100%{transform:translate(-6px,-10px) scale(0);opacity:0} }
    @keyframes ${id}ElectricArc { 0%,100%{opacity:0.7;stroke-dashoffset:0} 50%{opacity:1;stroke-dashoffset:4} }
    @keyframes ${id}EyeZap { 0%,100%{filter:drop-shadow(0 0 1px #fde047)} 50%{filter:drop-shadow(0 0 4px #fbbf24)} }

    @keyframes ${id}SolarPulse { 0%,100%{opacity:0.2;transform:scale(1)} 50%{opacity:0.45;transform:scale(1.06)} }
    @keyframes ${id}SolarRayRotate { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
    @keyframes ${id}SolarFlare { 0%,100%{opacity:0.5;transform:scaleY(1)} 50%{opacity:0.85;transform:scaleY(1.3)} }
    @keyframes ${id}CrownGlow { 0%,100%{filter:drop-shadow(0 0 2px #fbbf24)} 50%{filter:drop-shadow(0 0 6px #f59e0b)} }
    @keyframes ${id}EyeSolar { 0%,100%{filter:drop-shadow(0 0 1px #fbbf24)} 50%{filter:drop-shadow(0 0 3px #f97316)} }

    @keyframes ${id}FireAuraPulse { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
    @keyframes ${id}NostrilGlow { 0%,100%{opacity:0.35} 50%{opacity:0.85} }

    @keyframes ${id}SharkAura { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
    @keyframes ${id}SharkBolt { 0%,80%,100%{opacity:1} 85%{opacity:0.15} 90%{opacity:1} 95%{opacity:0.35} }
    @keyframes ${id}SharkParticle { 0%,100%{opacity:0.9} 50%{opacity:0.4} }
    @keyframes ${id}SharkClapL { 0%,100%{transform:rotate(-45deg)} 50%{transform:rotate(-72deg)} }
    @keyframes ${id}SharkClapR { 0%,100%{transform:rotate(45deg)}  50%{transform:rotate(72deg)} }
    @keyframes ${id}SharkEyeShift { 0%,100%{transform:translateX(-1.2px)} 50%{transform:translateX(1.2px)} }
  `;
}

function makeMoods(id) {
  const ei = 'ease-in-out';
  return {
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
}

// ─── Floating elements helper ───────────────────────────────────────────────
function FloatingElements({ m, id }) {
  const ei = 'ease-in-out';
  return (<>
    {m === 'challenge' && (
      <circle cx="15" cy="20" r="18" fill="none" stroke="#f87171" strokeWidth="2"
        style={{ animation: `${id}ChalAura 1.2s ${ei} infinite`, transformOrigin: '15px 20px' }} />
    )}
    {m === 'kiss' && (<>
      <path d="M-2-2 C-2-4,-5-4,-5-2 C-5,0,-2,2,0,4 C2,2,5,0,5-2 C5-4,2-4,2-2 C2-3,0-2,0-2 C0-2,-2-3,-2-2 Z"
        fill="#f472b6" style={{ animation: `${id}Heart1 1.8s ease-out infinite`, transformOrigin: '0 0' }}
        transform="translate(22,8)" />
      <path d="M-1.5-1.5 C-1.5-3,-4-3,-4-1.5 C-4,0,-1.5,1.5,0,3 C1.5,1.5,4,0,4-1.5 C4-3,1.5-3,1.5-1.5 C1.5-2.2,0-1.5,0-1.5 Z"
        fill="#fb7185" style={{ animation: `${id}Heart2 1.8s ease-out 0.6s infinite`, transformOrigin: '0 0' }}
        transform="translate(18,5)" />
    </>)}
    {m === 'sleep' && (<>
      <text x="20" y="8" fontSize="5" fontWeight="900" fill="#93c5fd" fontFamily="sans-serif"
        style={{ animation: `${id}Zzz1 2s ease-out infinite`, transformOrigin: '22px 6px' }}>Z</text>
      <text x="23" y="4" fontSize="7" fontWeight="900" fill="#60a5fa" fontFamily="sans-serif"
        style={{ animation: `${id}Zzz2 2s ease-out 0.7s infinite`, transformOrigin: '26px 2px' }}>Z</text>
    </>)}
    {m === 'clap' && (<>
      {[[-3,15,'0s'],[5,18,'0.2s'],[0,25,'0.13s'],[-6,22,'0.3s']].map(([dx,dy,delay],i) => (
        <g key={i} transform={`translate(${15+dx},${dy})`}
          style={{ animation: `${id}Spark 0.4s ${ei} ${delay} infinite`, transformOrigin: `${15+dx}px ${dy}px` }}>
          <line x1="-3" y1="0" x2="3" y2="0" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="0" y1="-3" x2="0" y2="3" stroke="#fde047" strokeWidth="1.5" strokeLinecap="round"/>
          <line x1="-2" y1="-2" x2="2" y2="2" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round"/>
          <line x1="2" y1="-2" x2="-2" y2="2" stroke="#fbbf24" strokeWidth="1" strokeLinecap="round"/>
        </g>
      ))}
    </>)}
    {m === 'think' && (<>
      <text x="20" y="6" fontSize="6" fontWeight="900" fill="#a78bfa" fontFamily="sans-serif"
        style={{ animation: `${id}Qmark 2.4s ease-out infinite`, transformOrigin: '22px 4px' }}>?</text>
      <text x="23" y="2" fontSize="4.5" fontWeight="900" fill="#c4b5fd" fontFamily="sans-serif"
        style={{ animation: `${id}Qmark 2.4s ease-out 0.8s infinite`, transformOrigin: '25px 0px' }}>?</text>
    </>)}
  </>);
}

// ─── Eye helper ─────────────────────────────────────────────────────────────
function Eyes({ m, id, blink, lx=11, rx=19, y=11, r=2.2, color='#111', bg='white' }) {
  if (m === 'sleep') return (<>
    <path d={`M${lx-2} ${y} Q${lx} ${y+2} ${lx+2} ${y}`} fill="none" stroke={bg} strokeWidth="1.2" strokeLinecap="round"/>
    <path d={`M${rx-2} ${y} Q${rx} ${y+2} ${rx+2} ${y}`} fill="none" stroke={bg} strokeWidth="1.2" strokeLinecap="round"/>
  </>);
  if (m === 'surprise') return (<>
    <circle cx={lx} cy={y} r={r+0.6} fill={bg}/>
    <circle cx={lx+0.4} cy={y+0.3} r={r*0.6} fill={color}/>
    <circle cx={lx+0.9} cy={y-0.4} r={r*0.2} fill={bg}/>
    <circle cx={rx} cy={y} r={r+0.6} fill={bg}/>
    <circle cx={rx+0.4} cy={y+0.3} r={r*0.6} fill={color}/>
    <circle cx={rx+0.9} cy={y-0.4} r={r*0.2} fill={bg}/>
  </>);
  return (<>
    <g style={{ animation: blink, transformOrigin: `${lx}px ${y}px` }}>
      <circle cx={lx} cy={y} r={r} fill={bg}/>
      <circle cx={lx+0.4} cy={y+0.3} r={r*0.5} fill={color}/>
      <circle cx={lx+0.8} cy={y-0.3} r={r*0.2} fill={bg}/>
    </g>
    <g style={{ animation: blink, transformOrigin: `${rx}px ${y}px` }}>
      <circle cx={rx} cy={y} r={r} fill={bg}/>
      <circle cx={rx+0.4} cy={y+0.3} r={r*0.5} fill={color}/>
      <circle cx={rx+0.8} cy={y-0.3} r={r*0.2} fill={bg}/>
    </g>
  </>);
}

function Mouth({ m, color='#1a1a1a' }) {
  if (m === 'kiss') return <circle cx="15" cy="16.5" r="1.6" fill="#f472b6"/>;
  if (m === 'surprise') return <ellipse cx="15" cy="17" rx="2" ry="2.4" fill={color}/>;
  return <path d="M12.5 16.2 Q15 18.4 17.5 16.2" fill="none" stroke={color} strokeWidth="0.9" strokeLinecap="round"/>;
}


// ─── CHARACTERS ─────────────────────────────────────────────────────────────

// 1. PANDA
function CharPanda({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3.2" fill="#1a1a1a"/>
        <rect x="7" y="34" width="8" height="4" rx="2" fill="#b0c8d8"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3.2" fill="#1a1a1a"/>
        <rect x="15" y="34" width="8" height="4" rx="2" fill="#b0c8d8"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#f0f0f0"/>
      <rect x="7.5" y="17" width="15" height="13" rx="4" fill="#7a9db0"/>
      <rect x="9" y="18.5" width="12" height="2" rx="1" fill="#c8dde8" opacity="0.9"/>
      <rect x="9" y="21.5" width="12" height="1.2" rx="0.6" fill="#507080" opacity="0.7"/>
      <rect x="9" y="24"   width="12" height="1.2" rx="0.6" fill="#507080" opacity="0.7"/>
      <circle cx="15" cy="22.5" r="2.8" fill="#1e3a5a"/>
      <circle cx="15" cy="22.5" r="2"   fill="#60a5fa"/>
      <circle cx="15" cy="22.5" r="1"   fill="#93c5fd"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#f0f0f0"/>
        <rect x="1"   y="17" width="6" height="6" rx="2.5" fill="#7a9db0"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#f0f0f0"/>
        <rect x="23"   y="17" width="6" height="6" rx="2.5" fill="#7a9db0"/>
      </g>
      <circle cx="7.5"  cy="7.5" r="4.8" fill="#1a1a1a"/>
      <circle cx="22.5" cy="7.5" r="4.8" fill="#1a1a1a"/>
      <circle cx="7.5"  cy="7.5" r="2.2" fill="#2d2d2d"/>
      <circle cx="22.5" cy="7.5" r="2.2" fill="#2d2d2d"/>
      <circle cx="15" cy="11.5" r="10.5" fill="#f5f5f5"/>
      <rect x="9.5" y="3.5" width="11" height="5.5" rx="2.5" fill="#7a9db0" opacity="0.9"/>
      <ellipse cx="10.5" cy="11" rx="4.2" ry="3.8" fill="#1a1a1a" transform="rotate(-8 10.5 11)"/>
      <ellipse cx="19.5" cy="11" rx="4.2" ry="3.8" fill="#1a1a1a" transform="rotate(8 19.5 11)"/>
      <Eyes m={m} id={id} blink={blink} lx={10.5} rx={19.5} y={11} bg="white" color="#111"/>
      <ellipse cx="15" cy="14.5" rx="2.1" ry="1.4" fill="#1a1a1a"/>
      <Mouth m={m} color="#1a1a1a"/>
    </g>
  );
}

// 2. FOX
function CharFox({ s, m, id, blink }) {
  const sleeping = m === 'sleep';
  const ei = 'ease-in-out';
  return (
    <g style={s.body}>
      {/* Fluffy tail — behind everything */}
      <ellipse cx="26" cy="30" rx="5.5" ry="7" fill="#f97316" transform="rotate(30 26 30)"/>
      <ellipse cx="27" cy="27" rx="3.2" ry="4" fill="white" transform="rotate(25 27 27)"/>

      {/* Legs — orange with black paws */}
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#f97316"/>
        <rect x="7"   y="34" width="8" height="5" rx="2.5" fill="#111"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#f97316"/>
        <rect x="15"   y="34" width="8" height="5" rx="2.5" fill="#111"/>
      </g>

      {/* Body — orange with white chest bib */}
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#f97316"/>
      <ellipse cx="15" cy="22" rx="5" ry="6" fill="white" opacity="0.9"/>
      {/* Spy collar + tie */}
      <rect x="11" y="28" width="8" height="3" rx="1" fill="#111"/>
      <polygon points="13.5,31 15,30 16.5,31 15.5,35 14.5,35" fill="#dc2626"/>

      {/* Arms — orange with black paws */}
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#f97316"/>
        <rect x="1"   y="23" width="6" height="4" rx="2"   fill="#111"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#f97316"/>
        <rect x="23"   y="23" width="6" height="4" rx="2"   fill="#111"/>
      </g>

      {/* Ears — tall pointed triangles, distinctive fox shape */}
      {/* Left ear */}
      <polygon points="4,10 8,0 13,10" fill="#c2410c"/>
      <polygon points="6,10 8,2  12,10" fill="#f97316"/>
      <polygon points="7,10 8,3.5 10,10" fill="#fca5a5" opacity="0.7"/>
      {/* Right ear */}
      <polygon points="17,10 22,0 26,10" fill="#c2410c"/>
      <polygon points="18,10 22,2  25,10" fill="#f97316"/>
      <polygon points="20,10 22,3.5 24,10" fill="#fca5a5" opacity="0.7"/>

      {/* Head — orange */}
      <circle cx="15" cy="11.5" r="10.5" fill="#f97316"/>

      {/* Muzzle — prominent white pointed snout */}
      <ellipse cx="15" cy="15.5" rx="5.5" ry="4.5" fill="#fef3c7"/>
      <ellipse cx="15" cy="18"   rx="3"   ry="2.5" fill="#fef3c7"/>
      {/* Nose — black oval at snout tip */}
      <ellipse cx="15" cy="17.5" rx="1.8" ry="1.2" fill="#111"/>
      <ellipse cx="14.4" cy="17" rx="0.5" ry="0.35" fill="#444"/>

      {/* Whiskers */}
      <line x1="5"  y1="14.5" x2="10"  y2="15"   stroke="#555" strokeWidth="0.6" strokeLinecap="round"/>
      <line x1="5"  y1="16"   x2="10"  y2="15.8"  stroke="#555" strokeWidth="0.6" strokeLinecap="round"/>
      <line x1="5"  y1="17.5" x2="10"  y2="16.8"  stroke="#555" strokeWidth="0.6" strokeLinecap="round"/>
      <line x1="20" y1="15"   x2="25"  y2="14.5"  stroke="#555" strokeWidth="0.6" strokeLinecap="round"/>
      <line x1="20" y1="15.8" x2="25"  y2="16"    stroke="#555" strokeWidth="0.6" strokeLinecap="round"/>
      <line x1="20" y1="16.8" x2="25"  y2="17.5"  stroke="#555" strokeWidth="0.6" strokeLinecap="round"/>

      {/* Eyes — spy sunglasses (not panda patches!) */}
      {sleeping ? (<>
        <path d="M8.5 10.5 Q11 12.5 13.5 10.5" fill="none" stroke="#111" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M16.5 10.5 Q19 12.5 21.5 10.5" fill="none" stroke="#111" strokeWidth="1.2" strokeLinecap="round"/>
      </>) : (<>
        {/* Left lens */}
        <rect x="7.5" y="9" width="6" height="4" rx="1.5" fill="#111"/>
        {/* Right lens */}
        <rect x="16.5" y="9" width="6" height="4" rx="1.5" fill="#111"/>
        {/* Bridge */}
        <line x1="13.5" y1="11" x2="16.5" y2="11" stroke="#111" strokeWidth="1.2" strokeLinecap="round"/>
        {/* Lens shine */}
        <rect x="8.5" y="9.8" width="2" height="1.2" rx="0.6" fill="white" opacity="0.3"/>
        <rect x="17.5" y="9.8" width="2" height="1.2" rx="0.6" fill="white" opacity="0.3"/>
      </>)}

      {/* Mouth */}
      {m === 'kiss'
        ? <circle cx="15" cy="20" r="1.4" fill="#f472b6"/>
        : <path d="M12.5 19.5 Q15 21.5 17.5 19.5" fill="none" stroke="#111" strokeWidth="0.9" strokeLinecap="round"/>
      }
    </g>
  );
}

// 3. WOLF
function CharWolf({ s, m, id, blink }) {
  const ei = 'ease-in-out';
  return (
    <>
      <defs>
        <radialGradient id={`${id}-wolfAura`}>
          <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#a78bfa" stopOpacity="0"/>
        </radialGradient>
      </defs>
      {/* Ghostly aura behind everything */}
      <circle cx="15" cy="18" r="22" fill={`url(#${id}-wolfAura)`}
        style={{ animation: `${id}GhostPulse 2.5s ${ei} infinite`, transformOrigin: '15px 18px' }}/>

      <g style={s.body}>
        {/* Ghost wisps rising from body */}
        <ellipse cx="10" cy="28" rx="2.5" ry="4" fill="#a78bfa" opacity="0.3"
          style={{ animation: `${id}GhostWisp1 2.2s ease-out infinite`, transformOrigin: '10px 28px' }}/>
        <ellipse cx="20" cy="26" rx="2" ry="3.5" fill="#c4b5fd" opacity="0.25"
          style={{ animation: `${id}GhostWisp2 2.8s ease-out 0.4s infinite`, transformOrigin: '20px 26px' }}/>
        <ellipse cx="14" cy="30" rx="1.8" ry="3" fill="#8b5cf6" opacity="0.2"
          style={{ animation: `${id}GhostWisp3 2s ease-out 0.8s infinite`, transformOrigin: '14px 30px' }}/>

        {/* Ghost tail — wispy, translucent */}
        <ellipse cx="25" cy="29" rx="5.5" ry="3.5" fill="#64748b" opacity="0.45"
          style={{ animation: `${id}GhostTail 1.8s ${ei} infinite`, transformOrigin: '22px 29px' }}/>
        <ellipse cx="28" cy="28" rx="3" ry="2" fill="#94a3b8" opacity="0.25"
          style={{ animation: `${id}GhostTail 1.8s ${ei} 0.3s infinite`, transformOrigin: '26px 28px' }}/>

        {/* Legs — semi-transparent, fading at feet */}
        <g style={s.legL}>
          <rect x="7.5" y="29" width="6" height="9" rx="2.5" fill="#334155" opacity="0.7"/>
          <rect x="7" y="35" width="7" height="4" rx="2" fill="#64748b" opacity="0.4"/>
        </g>
        <g style={s.legR}>
          <rect x="16.5" y="29" width="6" height="9" rx="2.5" fill="#334155" opacity="0.7"/>
          <rect x="16" y="35" width="7" height="4" rx="2" fill="#64748b" opacity="0.4"/>
        </g>

        {/* Body — slightly translucent */}
        <rect x="6" y="16" width="18" height="15" rx="6" fill="#334155" opacity="0.85"/>
        <ellipse cx="15" cy="24" rx="5" ry="5" fill="#475569" opacity="0.7"/>

        {/* Ghostly chains on chest */}
        <ellipse cx="15" cy="22" rx="4" ry="2.5" fill="none" stroke="#94a3b8" strokeWidth="0.6"
          strokeDasharray="2 1.5" opacity="0.4"
          style={{ animation: `${id}GhostChain 2s ${ei} infinite` }}/>
        <circle cx="15" cy="24.5" r="1.2" fill="none" stroke="#94a3b8" strokeWidth="0.5" opacity="0.35"
          style={{ animation: `${id}GhostChain 2s ${ei} 0.5s infinite` }}/>

        {/* Arms — translucent */}
        <g style={s.armL}>
          <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#334155" opacity="0.8"/>
        </g>
        <g style={s.armR}>
          <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#334155" opacity="0.8"/>
        </g>

        {/* Ears — with inner spectral purple glow */}
        <polygon points="5,10 8.5,-1 13,10" fill="#475569"/>
        <polygon points="17,10 21.5,-1 25,10" fill="#475569"/>
        <polygon points="6.5,9 8.5,2 11.5,9" fill="#64748b"/>
        <polygon points="18.5,9 21.5,2 23.5,9" fill="#64748b"/>
        <polygon points="7.5,8.5 8.5,3.5 11,8.5" fill="#a78bfa" opacity="0.35"/>
        <polygon points="19,8.5 21.5,3.5 23,8.5" fill="#a78bfa" opacity="0.35"/>

        {/* Head */}
        <circle cx="15" cy="11.5" r="10.5" fill="#94a3b8"/>

        {/* Muzzle */}
        <ellipse cx="15" cy="15" rx="4.5" ry="5" fill="#cbd5e1"/>

        {/* Crescent moon — glowing */}
        <path d="M12.5,5 Q15,1.5 17.5,5 Q15.5,3 14.5,3.2 Q13.5,3.8 12.5,5 Z" fill="#e0e7ff" opacity="0.95"/>

        {/* Spectral scar across left eye */}
        <line x1="8" y1="8" x2="12" y2="13" stroke="#c4b5fd" strokeWidth="0.7" opacity="0.5" strokeLinecap="round"/>

        {/* Fur texture cheeks */}
        <line x1="5.5" y1="12" x2="7.5" y2="11.5" stroke="#7f8ea3" strokeWidth="0.6" opacity="0.5"/>
        <line x1="5.5" y1="13.5" x2="7" y2="13" stroke="#7f8ea3" strokeWidth="0.6" opacity="0.5"/>
        <line x1="22.5" y1="12" x2="24.5" y2="11.5" stroke="#7f8ea3" strokeWidth="0.6" opacity="0.5"/>
        <line x1="23" y1="13.5" x2="24.5" y2="13" stroke="#7f8ea3" strokeWidth="0.6" opacity="0.5"/>

        {/* Eyes — glowing purple */}
        {m === 'sleep' ? (<>
          <path d="M8.5 10.5 Q11 12.5 13.5 10.5" fill="none" stroke="#ddd6fe" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M16.5 10.5 Q19 12.5 21.5 10.5" fill="none" stroke="#ddd6fe" strokeWidth="1.2" strokeLinecap="round"/>
        </>) : (<>
          <g style={{ animation: `${id}GhostEyeGlow 2s ${ei} infinite` }}>
            <circle cx="10.5" cy="10.5" r="1.8" fill="#8b5cf6" opacity="0.3"/>
            <ellipse cx="10.5" cy="10.5" rx="2.2" ry="1.4" fill="#c4b5fd" transform="rotate(-8,10.5,10.5)"/>
            <ellipse cx="10.5" cy="10.5" rx="1.1" ry="1.1" fill="#ddd6fe"/>
            <circle cx="11.1" cy="10" r="0.5" fill="white"/>
          </g>
          <g style={{ animation: `${id}GhostEyeGlow 2s ${ei} 0.3s infinite` }}>
            <circle cx="19.5" cy="10.5" r="1.8" fill="#8b5cf6" opacity="0.3"/>
            <ellipse cx="19.5" cy="10.5" rx="2.2" ry="1.4" fill="#c4b5fd" transform="rotate(8,19.5,10.5)"/>
            <ellipse cx="19.5" cy="10.5" rx="1.1" ry="1.1" fill="#ddd6fe"/>
            <circle cx="20.1" cy="10" r="0.5" fill="white"/>
          </g>
        </>)}

        {/* Nose */}
        <ellipse cx="15" cy="18.5" rx="1.3" ry="0.9" fill="#334155"/>
        {/* Mouth */}
        <path d="M13.5,19.5 Q15,20.8 16.5,19.5" stroke="#475569" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
      </g>
    </>
  );
}

// 4. TIGER
function CharTiger({ s, m, id, blink }) {
  const ei = 'ease-in-out';
  return (
    <g style={s.body}>
      {/* Electric sparks around paws */}
      <g style={{ animation: `${id}SparkJump1 0.8s ease-out infinite`, transformOrigin: '8px 38px' }}>
        <polygon points="8,38 9,36 10,38 9.5,37" fill="#fde047" opacity="0.9"/>
      </g>
      <g style={{ animation: `${id}SparkJump2 0.8s ease-out 0.25s infinite`, transformOrigin: '22px 38px' }}>
        <polygon points="21,38 22,35.5 23,38 22.5,37" fill="#fbbf24" opacity="0.85"/>
      </g>
      <g style={{ animation: `${id}SparkJump3 0.9s ease-out 0.5s infinite`, transformOrigin: '15px 37px' }}>
        <polygon points="14,37 15,35 16,37 15.5,36.5" fill="#fde047" opacity="0.7"/>
      </g>

      {/* Legs with zigzag lightning stripes */}
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#fb923c"/>
        <path d="M8.5,30 L11,31.5 L9,33 L11.5,34.5 L9.5,36" fill="none" stroke="#fde047"
          strokeWidth="1.2" strokeLinecap="round" opacity="0.8"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#fb923c"/>
        <path d="M16.5,30 L19,31.5 L17,33 L19.5,34.5 L17.5,36" fill="none" stroke="#fde047"
          strokeWidth="1.2" strokeLinecap="round" opacity="0.8"/>
      </g>

      {/* Body with zigzag stripes */}
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#fb923c"/>
      <path d="M8,19.5 L11,18.5 L9,20.5 L12,19.5 L10,21.5 L13,20.5 L11,22.5 L14,21.5 L12,23.5 L15,22.5 L14,24 L17,23 L15.5,25 L18.5,24 L17,25.5 L20,24.5 L18.5,26 L22,25"
        fill="none" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round" opacity="0.55"/>

      {/* Electric arc running down body */}
      <path d="M15,17 L13,20 L17,22 L14,25 L16,28" fill="none" stroke="#fde047"
        strokeWidth="0.8" strokeLinecap="round" opacity="0.6" strokeDasharray="3 2"
        style={{ animation: `${id}ElectricArc 0.6s ${ei} infinite` }}/>

      {/* Arms with lightning tips */}
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#fb923c"/>
        <path d="M2.5,23 L4,21.5 L3,24 L4.5,22.5" fill="none" stroke="#fde047"
          strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#fb923c"/>
        <path d="M24.5,23 L26,21.5 L25,24 L26.5,22.5" fill="none" stroke="#fde047"
          strokeWidth="1" strokeLinecap="round" opacity="0.7"/>
      </g>

      {/* Ears */}
      <circle cx="8" cy="7" r="3.5" fill="#1a1a1a"/>
      <circle cx="8" cy="7" r="2.8" fill="#fb923c"/>
      <circle cx="8" cy="7" r="1.5" fill="#fda4af"/>
      <circle cx="22" cy="7" r="3.5" fill="#1a1a1a"/>
      <circle cx="22" cy="7" r="2.8" fill="#fb923c"/>
      <circle cx="22" cy="7" r="1.5" fill="#fda4af"/>

      {/* Head */}
      <circle cx="15" cy="11.5" r="10.5" fill="#fb923c"/>

      {/* ⚡ Lightning bolt on forehead */}
      <g style={{ animation: `${id}BoltFlash 1.5s ${ei} infinite` }}>
        <path d="M13.5,2 L15.5,5 L14,5 L16.5,8.5 L14.5,6 L16,6 L13.5,2 Z"
          fill="#fde047" stroke="#f59e0b" strokeWidth="0.4"/>
      </g>

      {/* Cheek stripes as mini zigzags */}
      <path d="M6.5,10 L8,11 L7,12 L8.5,13" fill="none" stroke="#1a1a1a"
        strokeWidth="1.2" strokeLinecap="round" opacity="0.75"/>
      <path d="M23.5,10 L22,11 L23,12 L21.5,13" fill="none" stroke="#1a1a1a"
        strokeWidth="1.2" strokeLinecap="round" opacity="0.75"/>

      {/* White muzzle */}
      <ellipse cx="15" cy="15.5" rx="6" ry="5" fill="white"/>

      {/* Eyes — electric glow */}
      {m === 'sleep' ? (<>
        <path d="M8.5 10 Q11 12 13.5 10" fill="none" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M16.5 10 Q19 12 21.5 10" fill="none" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round"/>
      </>) : (<>
        <g style={{ animation: `${id}EyeZap 1s ${ei} infinite` }}>
          <ellipse cx="10.5" cy="10" rx="2.8" ry="2" fill="#fde047" transform="rotate(-8,10.5,10)"/>
          <ellipse cx="10.5" cy="10" rx="1.4" ry="1.6" fill="#1a1a1a" transform="rotate(-8,10.5,10)"/>
          <circle cx="11.3" cy="9.2" r="0.6" fill="white" opacity="0.9"/>
        </g>
        <g style={{ animation: `${id}EyeZap 1s ${ei} 0.3s infinite` }}>
          <ellipse cx="19.5" cy="10" rx="2.8" ry="2" fill="#fde047" transform="rotate(8,19.5,10)"/>
          <ellipse cx="19.5" cy="10" rx="1.4" ry="1.6" fill="#1a1a1a" transform="rotate(8,19.5,10)"/>
          <circle cx="20.3" cy="9.2" r="0.6" fill="white" opacity="0.9"/>
        </g>
      </>)}

      {/* Nose */}
      <ellipse cx="15" cy="14" rx="2" ry="1.3" fill="#111"/>

      {/* Whiskers */}
      <line x1="9" y1="15" x2="3" y2="14" stroke="#1a1a1a" strokeWidth="0.8" opacity="0.7"/>
      <line x1="9" y1="16" x2="3" y2="16" stroke="#1a1a1a" strokeWidth="0.8" opacity="0.7"/>
      <line x1="21" y1="15" x2="27" y2="14" stroke="#1a1a1a" strokeWidth="0.8" opacity="0.7"/>
      <line x1="21" y1="16" x2="27" y2="16" stroke="#1a1a1a" strokeWidth="0.8" opacity="0.7"/>

      {/* Mouth */}
      <path d="M13 17 Q15 18.5 17 17" fill="none" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round"/>
    </g>
  );
}

// 5. LION
function CharLion({ s, m, id, blink }) {
  const ei = 'ease-in-out';
  return (
    <>
      <defs>
        <radialGradient id={`${id}-solarGlow`}>
          <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.35"/>
          <stop offset="60%" stopColor="#f97316" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#f97316" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`${id}-solarCenter`}>
          <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.5"/>
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Solar aura — warm pulsing glow */}
      <circle cx="15" cy="11.5" r="26" fill={`url(#${id}-solarGlow)`}
        style={{ animation: `${id}SolarPulse 2.5s ${ei} infinite`, transformOrigin: '15px 11.5px' }}/>

      <g style={s.body}>
        {/* Sun rays rotating behind head */}
        <g style={{ animation: `${id}SolarRayRotate 20s linear infinite`, transformOrigin: '15px 11.5px' }}>
          <polygon points="15,-2 16.5,-8 13.5,-8" fill="#f59e0b" opacity="0.5"/>
          <polygon points="22,0 27,-3 24,-5" fill="#f59e0b" opacity="0.45"/>
          <polygon points="27,5 32,4 30,1" fill="#f59e0b" opacity="0.4"/>
          <polygon points="29,11.5 34,11.5 33,9" fill="#f59e0b" opacity="0.45"/>
          <polygon points="27,18 32,19 30,22" fill="#f59e0b" opacity="0.4"/>
          <polygon points="22,23 27,26 24,28" fill="#f59e0b" opacity="0.35"/>
          <polygon points="15,25 16.5,31 13.5,31" fill="#f59e0b" opacity="0.3"/>
          <polygon points="8,23 3,26 6,28" fill="#f59e0b" opacity="0.35"/>
          <polygon points="3,18 -2,19 0,22" fill="#f59e0b" opacity="0.4"/>
          <polygon points="1,11.5 -4,11.5 -3,9" fill="#f59e0b" opacity="0.45"/>
          <polygon points="3,5 -2,4 0,1" fill="#f59e0b" opacity="0.4"/>
          <polygon points="8,0 3,-3 6,-5" fill="#f59e0b" opacity="0.45"/>
        </g>

        {/* Solar flares */}
        <ellipse cx="3" cy="8" rx="2" ry="4" fill="#f97316" opacity="0.4"
          transform="rotate(-20,3,8)"
          style={{ animation: `${id}SolarFlare 1.8s ${ei} infinite` }}/>
        <ellipse cx="27" cy="6" rx="1.5" ry="3.5" fill="#f97316" opacity="0.35"
          transform="rotate(15,27,6)"
          style={{ animation: `${id}SolarFlare 1.8s ${ei} 0.6s infinite` }}/>
        <ellipse cx="15" cy="-2" rx="1.5" ry="3" fill="#fbbf24" opacity="0.4"
          style={{ animation: `${id}SolarFlare 1.8s ${ei} 1.2s infinite` }}/>

        {/* Legs */}
        <g style={s.legL}>
          <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#fbbf24"/>
        </g>
        <g style={s.legR}>
          <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#fbbf24"/>
        </g>

        {/* Body */}
        <rect x="6" y="16" width="18" height="15" rx="6" fill="#fbbf24"/>
        <ellipse cx="15" cy="18" rx="9" ry="5" fill="#b45309"/>

        {/* Arms */}
        <g style={s.armL}>
          <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#fbbf24"/>
        </g>
        <g style={s.armR}>
          <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#fbbf24"/>
        </g>

        {/* Mane — warm gradient rings */}
        <circle cx="15" cy="11.5" r="13" fill="#b45309"/>
        <circle cx="15" cy="11.5" r="12.2" fill="#d97706"/>

        {/* Small ears */}
        <circle cx="8" cy="4" r="2.5" fill="#fbbf24"/>
        <circle cx="22" cy="4" r="2.5" fill="#fbbf24"/>

        {/* Face */}
        <circle cx="15" cy="11.5" r="9.5" fill="#fbbf24"/>

        {/* Inner warm glow */}
        <circle cx="15" cy="11.5" r="6" fill={`url(#${id}-solarCenter)`}/>

        {/* Eyes — solar glow */}
        {m === 'sleep' ? (<>
          <path d="M8.5 10.5 Q11 12.5 13.5 10.5" fill="none" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M16.5 10.5 Q19 12.5 21.5 10.5" fill="none" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round"/>
        </>) : (<>
          <g style={{ animation: `${id}EyeSolar 1.5s ${ei} infinite` }}>
            <circle cx="11" cy="10.5" r="2.5" fill="white"/>
            <circle cx="11" cy="10.5" r="1.8" fill="#f97316"/>
            <circle cx="11" cy="10.5" r="1.1" fill="#92400e"/>
            <circle cx="11" cy="10.5" r="0.5" fill="#1a0a00"/>
            <circle cx="11.6" cy="9.9" r="0.3" fill="white"/>
          </g>
          <g style={{ animation: `${id}EyeSolar 1.5s ${ei} 0.4s infinite` }}>
            <circle cx="19" cy="10.5" r="2.5" fill="white"/>
            <circle cx="19" cy="10.5" r="1.8" fill="#f97316"/>
            <circle cx="19" cy="10.5" r="1.1" fill="#92400e"/>
            <circle cx="19" cy="10.5" r="0.5" fill="#1a0a00"/>
            <circle cx="19.6" cy="9.9" r="0.3" fill="white"/>
          </g>
        </>)}

        {/* Muzzle */}
        <ellipse cx="15" cy="15.5" rx="4.5" ry="3" fill="#fcd34d"/>

        {/* Nose */}
        <ellipse cx="15" cy="14.5" rx="2.5" ry="1.8" fill="#92400e"/>

        {/* Noble smile */}
        <path d="M11.5 17 Q15 20 18.5 17" fill="none" stroke="#92400e" strokeWidth="1.2" strokeLinecap="round"/>

        {/* Crown — glowing solid gold with gems */}
        <g style={{ animation: `${id}CrownGlow 2s ${ei} infinite` }}>
          <polygon points="11,5.5 12,3 13,5 14,2.5 15,5 16,2.5 17,5 18,3 19,5.5"
            fill="#fbbf24" stroke="#f59e0b" strokeWidth="0.6" strokeLinejoin="round"/>
          <circle cx="13" cy="4.5" r="0.5" fill="#ef4444"/>
          <circle cx="15" cy="4" r="0.6" fill="#3b82f6"/>
          <circle cx="17" cy="4.5" r="0.5" fill="#10b981"/>
        </g>
      </g>
    </>
  );
}

// 6. EAGLE
function CharEagle({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      {/* Legs with three talon claws each */}
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#78350f"/>
        <polygon points="7.5,38 6,41 8,39.5" fill="#fbbf24"/>
        <polygon points="11,38 10,41.5 12,39.5" fill="#fbbf24"/>
        <polygon points="14.5,38 14,41 16,39.5" fill="#fbbf24"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#78350f"/>
        <polygon points="15.5,38 14,41 16.5,39.5" fill="#fbbf24"/>
        <polygon points="19,38 18.5,41.5 20.5,39.5" fill="#fbbf24"/>
        <polygon points="22.5,38 22,41 24,39.5" fill="#fbbf24"/>
      </g>
      {/* Very dark brown body */}
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#292524"/>
      {/* White neck/collar area onto body top */}
      <ellipse cx="15" cy="19" rx="6" ry="4" fill="white" opacity="0.9"/>
      {/* Wing arms with jagged feather tips and feather stroke lines */}
      <g style={s.armL}>
        <path d="M1.5,17 L6.5,17 L6.5,24 Q5,25.5 3.5,26 Q2.5,25 1.5,26 Q1,25 1.5,24 Z" fill="#78350f"/>
        <line x1="3" y1="19" x2="2" y2="22" stroke="#92400e" strokeWidth="0.7"/>
        <line x1="4.5" y1="19" x2="4" y2="23" stroke="#92400e" strokeWidth="0.7"/>
        <line x1="6" y1="19" x2="5.5" y2="22" stroke="#92400e" strokeWidth="0.7"/>
      </g>
      <g style={s.armR}>
        <path d="M23.5,17 L28.5,17 L28.5,24 Q27.5,25.5 26.5,26 Q25.5,25 24.5,26 Q23.5,25 23.5,24 Z" fill="#78350f"/>
        <line x1="24" y1="19" x2="24" y2="22" stroke="#92400e" strokeWidth="0.7"/>
        <line x1="25.5" y1="19" x2="25.5" y2="23" stroke="#92400e" strokeWidth="0.7"/>
        <line x1="27" y1="19" x2="27.5" y2="22" stroke="#92400e" strokeWidth="0.7"/>
      </g>
      {/* White head — bald eagle */}
      <circle cx="15" cy="11.5" r="10.5" fill="white"/>
      {/* Fierce eyebrow lines — thick, angled inward for menacing look */}
      <line x1="7.5" y1="7" x2="12.5" y2="8.5" stroke="#292524" strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="22.5" y1="7" x2="17.5" y2="8.5" stroke="#292524" strokeWidth="1.8" strokeLinecap="round"/>
      {/* Fierce yellow eyes with black pupils */}
      <circle cx="10.5" cy="10" r="2.5" fill="#fbbf24"/>
      <circle cx="19.5" cy="10" r="2.5" fill="#fbbf24"/>
      <circle cx="10.5" cy="10" r="1.2" fill="#111"/>
      <circle cx="19.5" cy="10" r="1.2" fill="#111"/>
      {/* Eye highlights */}
      <circle cx="11" cy="9.4" r="0.5" fill="white"/>
      <circle cx="20" cy="9.4" r="0.5" fill="white"/>
      {/* Large hooked beak — most distinctive feature */}
      {/* Upper mandible: large downward curve */}
      <path d="M13,13.5 Q14,15.5 17,16 L15,17 Q12.5,16 12,14 Z" fill="#f59e0b"/>
      {/* Hook tip curving down */}
      <path d="M17,16 Q18.5,15.5 17.5,17.5 L15,17 Z" fill="#d97706"/>
      {/* Lower mandible */}
      <path d="M13,14.5 Q14,15.5 15.5,16 L14.5,16.5 Q13,16 12.5,14.8 Z" fill="#fbbf24"/>
    </g>
  );
}

// 7. BEAR
function CharBear({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#92400e"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#92400e"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#92400e"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#92400e"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#92400e"/>
      </g>
      <circle cx="8"  cy="7.5" r="4" fill="#92400e"/>
      <circle cx="22" cy="7.5" r="4" fill="#92400e"/>
      <circle cx="15" cy="11.5" r="10.5" fill="#b45309"/>
      <rect x="9" y="2" width="12" height="5" rx="2" fill="#6b7280"/>
      <rect x="9" y="1" width="12" height="3" rx="1.5" fill="#9ca3af"/>
      <polygon points="9,2 6,0 8,4" fill="#6b7280"/>
      <polygon points="21,2 24,0 22,4" fill="#6b7280"/>
      <line x1="9" y1="8" x2="13" y2="7" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="17" y1="7" x2="21" y2="8" stroke="#1a1a1a" strokeWidth="1.2" strokeLinecap="round"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg="white"/>
      <ellipse cx="15" cy="14.5" rx="2" ry="1.3" fill="#7c2d12"/>
      <Mouth m={m} color="#7c2d12"/>
    </g>
  );
}

// 8. SHARK
function CharShark({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#64748b"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#64748b"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#64748b"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#64748b"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#64748b"/>
      </g>
      <polygon points="15,1 12,6 18,6" fill="#475569"/>
      <circle cx="15" cy="11.5" r="10.5" fill="#94a3b8"/>
      <ellipse cx="15" cy="15" rx="6" ry="3.5" fill="white"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg="white"/>
      <ellipse cx="15" cy="14.5" rx="1.5" ry="1" fill="#1a1a1a"/>
      {m !== 'sleep' && (
        <g>
          <path d="M11 16.5 L13 15.5 L15 16.5 L17 15.5 L19 16.5" fill="none" stroke="#1a1a1a" strokeWidth="0.8"/>
        </g>
      )}
    </g>
  );
}

// 9. OWL
function CharOwl({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#6d28d9"/>
        <polygon points="8,38 9.5,40 11,38 12.5,40 14,38" fill="#fbbf24"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#6d28d9"/>
        <polygon points="16,38 17.5,40 19,38 20.5,40 22,38" fill="#fbbf24"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#7c3aed"/>
      <circle cx="11" cy="21" r="1" fill="#5b21b6" opacity="0.5"/>
      <circle cx="15" cy="20" r="1" fill="#5b21b6" opacity="0.5"/>
      <circle cx="19" cy="22" r="1" fill="#5b21b6" opacity="0.5"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#7c3aed"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#7c3aed"/>
      </g>
      <polygon points="11,4 13,1 15,4" fill="#5b21b6"/>
      <polygon points="17,4 19,1 21,4" fill="#5b21b6"/>
      <circle cx="15" cy="11.5" r="10.5" fill="#7c3aed"/>
      <circle cx="11" cy="11" r="4" fill="white"/>
      <circle cx="19" cy="11" r="4" fill="white"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} r={2.5} color="#1a1a1a" bg="#fbbf24"/>
      <polygon points="13.5,14 15,16 16.5,14" fill="#f59e0b"/>
    </g>
  );
}

// 10. FROG
function CharFrog({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#16a34a"/>
        <ellipse cx="9" cy="38.5" rx="4" ry="2" fill="#15803d"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#16a34a"/>
        <ellipse cx="19" cy="38.5" rx="4" ry="2" fill="#15803d"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#22c55e"/>
      <rect x="8" y="13" width="14" height="3" rx="1.5" fill="#15803d"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#22c55e"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#22c55e"/>
      </g>
      <circle cx="10" cy="3" r="3.5" fill="#22c55e"/>
      <circle cx="20" cy="3" r="3.5" fill="#22c55e"/>
      <circle cx="15" cy="11.5" r="10.5" fill="#22c55e"/>
      <rect x="9" y="9.5" width="12" height="3" rx="1.5" fill="#15803d"/>
      <Eyes m={m} id={id} blink={blink} lx={10} rx={20} y={3} color="#111" bg="white"/>
      <ellipse cx="15" cy="15" rx="5" ry="2" fill="#16a34a"/>
      <ellipse cx="13" cy="14" rx="1" ry="0.7" fill="#1a1a1a"/>
      <ellipse cx="17" cy="14" rx="1" ry="0.7" fill="#1a1a1a"/>
      {m !== 'sleep' && <path d="M10.5 16.5 Q15 19 19.5 16.5" fill="none" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round"/>}
    </g>
  );
}


// 11. OCTOPUS
function CharOctopus({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <path d="M10 30 Q7 33 8 37 Q9 40 11 38 Q13 36 11 33 Q10 31 10 30" fill="#7e22ce"/>
      </g>
      <g style={s.legR}>
        <path d="M20 30 Q23 33 22 37 Q21 40 19 38 Q17 36 19 33 Q20 31 20 30" fill="#7e22ce"/>
      </g>
      <rect x="7" y="17" width="16" height="13" rx="6" fill="#7e22ce"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#7e22ce"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#7e22ce"/>
      </g>
      <path d="M10 5 Q8 2 11 1 Q12 3 10 5" fill="#a855f7"/>
      <path d="M14 3 Q13 0 15 0 Q16 2 14 3" fill="#a855f7"/>
      <path d="M18 4 Q20 1 21 3 Q19 5 18 4" fill="#a855f7"/>
      <path d="M22 7 Q25 5 25 8 Q23 9 22 7" fill="#a855f7"/>
      <circle cx="15" cy="11.5" r="10.5" fill="#9333ea"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} r={2.8} color="#111" bg="white"/>
      <ellipse cx="15" cy="15" rx="2" ry="1.2" fill="#6b21a8"/>
      <path d="M12.5 16.5 Q15 18.5 17.5 16.5" fill="none" stroke="#6b21a8" strokeWidth="0.9" strokeLinecap="round"/>
    </g>
  );
}

// 12. CAT
function CharCat({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#fef3c7"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#fef3c7"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#fef3c7"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#fef3c7"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#fef3c7"/>
      </g>
      <polygon points="7,8 9,2 12,8" fill="#f97316"/>
      <polygon points="8.5,7.5 9,3.5 11,7.5" fill="#fde68a"/>
      <polygon points="18,8 21,2 23,8" fill="#f97316"/>
      <polygon points="19,7.5 21,3.5 22.5,7.5" fill="#fde68a"/>
      <circle cx="15" cy="11.5" r="10.5" fill="#fef3c7"/>
      <rect x="10" y="3" width="10" height="4" rx="2" fill="#292524"/>
      <rect x="10.5" y="3.2" width="9" height="2" rx="1" fill="#44403c"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg="#22c55e"/>
      <ellipse cx="15" cy="14.5" rx="1.5" ry="1" fill="#92400e"/>
      <line x1="8" y1="13" x2="13" y2="14" stroke="#78716c" strokeWidth="0.8"/>
      <line x1="8" y1="15" x2="13" y2="15" stroke="#78716c" strokeWidth="0.8"/>
      <line x1="17" y1="14" x2="22" y2="13" stroke="#78716c" strokeWidth="0.8"/>
      <line x1="17" y1="15" x2="22" y2="15" stroke="#78716c" strokeWidth="0.8"/>
      <Mouth m={m} color="#92400e"/>
    </g>
  );
}

// 13. DRAGON
function CharDragon({ s, m, id, blink }) {
  const ei = 'ease-in-out';
  return (
    <>
      <defs>
        <radialGradient id={`${id}-fireGlow`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#f87171" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#f97316" stopOpacity="0.05"/>
        </radialGradient>
        <linearGradient id={`${id}-bellyGlow`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#f97316" stopOpacity="0.8"/>
          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.4"/>
        </linearGradient>
      </defs>

      {/* Fire aura */}
      <circle cx="15" cy="18" r="26" fill={`url(#${id}-fireGlow)`}
        style={{ animation: `${id}FireAuraPulse 2.5s ${ei} infinite`, transformOrigin: '15px 18px' }}/>

      <g style={s.body}>
        {/* Wings */}
        <ellipse cx="4" cy="20" rx="4.5" ry="7" fill="#f97316" opacity="0.7" transform="rotate(-25 4 20)"/>
        <ellipse cx="3" cy="20" rx="2.5" ry="4.5" fill="#fca5a5" opacity="0.5" transform="rotate(-25 3 20)"/>
        <ellipse cx="26" cy="20" rx="4.5" ry="7" fill="#f97316" opacity="0.7" transform="rotate(25 26 20)"/>
        <ellipse cx="27" cy="20" rx="2.5" ry="4.5" fill="#fca5a5" opacity="0.5" transform="rotate(25 27 20)"/>

        {/* Tail */}
        <ellipse cx="28" cy="28" rx="4.5" ry="6.5" fill="#dc2626" transform="rotate(35 28 28)"/>
        <polygon points="31,22 34,19 32,24 35,21 33,26" fill="#f97316" opacity="0.9"/>
        <polygon points="32,22 35,20 33,25 36,22 34,27" fill="#fbbf24" opacity="0.7"/>

        {/* Legs — scales + gold claws */}
        <g style={s.legL}>
          <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#dc2626"/>
          <path d="M8,32 L9.5,31 L8,33 L9.5,32" fill="#f97316" opacity="0.6"/>
          <path d="M8,34 L9.5,33 L8,35 L9.5,34" fill="#f97316" opacity="0.6"/>
          <circle cx="8" cy="38.5" r="1.2" fill="#fbbf24"/>
          <circle cx="11" cy="38.5" r="1.2" fill="#fbbf24"/>
        </g>
        <g style={s.legR}>
          <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#dc2626"/>
          <path d="M16,32 L17.5,31 L16,33 L17.5,32" fill="#f97316" opacity="0.6"/>
          <path d="M16,34 L17.5,33 L16,35 L17.5,34" fill="#f97316" opacity="0.6"/>
          <circle cx="16" cy="38.5" r="1.2" fill="#fbbf24"/>
          <circle cx="19" cy="38.5" r="1.2" fill="#fbbf24"/>
        </g>

        {/* Body — belly gradient + scale chevrons + spine */}
        <rect x="6" y="16" width="18" height="15" rx="6" fill="#b91c1c"/>
        <ellipse cx="15" cy="23" rx="6" ry="5.5" fill={`url(#${id}-bellyGlow)`}/>
        <path d="M8,18 L10,17 L8,19 L10,18 M8,20 L10,19 L8,21 L10,20 M8,22 L10,21 L8,23 L10,22"
          fill="none" stroke="#fca5a5" strokeWidth="0.8" opacity="0.5"/>
        <path d="M20,18 L22,17 L20,19 L22,18 M20,20 L22,19 L20,21 L22,20 M20,22 L22,21 L20,23 L22,22"
          fill="none" stroke="#fca5a5" strokeWidth="0.8" opacity="0.5"/>
        <g opacity="0.6">
          <path d="M15,17.5 L16.5,16.5 L15,18.5 L16.5,17.5"/>
          <path d="M15,19.5 L16.5,18.5 L15,20.5 L16.5,19.5"/>
          <path d="M15,21.5 L16.5,20.5 L15,22.5 L16.5,21.5"/>
          <path d="M15,23.5 L16.5,22.5 L15,24.5 L16.5,23.5"/>
        </g>

        {/* Arms — scales + gold claws + shoulder spike */}
        <g style={s.armL}>
          <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#dc2626"/>
          <path d="M2.5,19 L3.5,18.5 L2.5,20 L3.5,19.5" fill="#f97316" opacity="0.6"/>
          <path d="M2.5,22 L3.5,21.5 L2.5,23 L3.5,22.5" fill="#f97316" opacity="0.6"/>
          <polygon points="2,26 1.5,25.5 2,27 1.2,26.5" fill="#fbbf24"/>
          <polygon points="4,26 4.5,25.5 4,27 4.8,26.5" fill="#fbbf24"/>
          <polygon points="3,17 3.5,15.5 4,17 3.3,16" fill="#fbbf24" opacity="0.7"/>
        </g>
        <g style={s.armR}>
          <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#dc2626"/>
          <path d="M25.5,19 L26.5,18.5 L25.5,20 L26.5,19.5" fill="#f97316" opacity="0.6"/>
          <path d="M25.5,22 L26.5,21.5 L25.5,23 L26.5,22.5" fill="#f97316" opacity="0.6"/>
          <polygon points="26,26 25.5,25.5 26,27 25.2,26.5" fill="#fbbf24"/>
          <polygon points="28,26 28.5,25.5 28,27 28.8,26.5" fill="#fbbf24"/>
          <polygon points="27,17 27.5,15.5 28,17 27.3,16" fill="#fbbf24" opacity="0.7"/>
        </g>

        {/* Horns — curved paths */}
        <path d="M6 7 Q4 3 7 2" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round"/>
        <path d="M23 7 Q25 3 23 2" fill="none" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round"/>
        <path d="M6.5 6.5 Q4.5 3.5 7 2.5" fill="none" stroke="#f97316" strokeWidth="1.2" strokeLinecap="round"/>
        <path d="M23.5 6.5 Q24.5 3.5 23 2.5" fill="none" stroke="#f97316" strokeWidth="1.2" strokeLinecap="round"/>

        {/* Head — elongated (not circular) */}
        <ellipse cx="15" cy="11" rx="11" ry="8" fill="#b91c1c"/>
        <ellipse cx="15" cy="10.5" rx="9.5" ry="6.5" fill="#dc2626"/>

        {/* Snout */}
        <ellipse cx="15" cy="15.5" rx="7" ry="5" fill="#b91c1c"/>
        <ellipse cx="15" cy="15.8" rx="6.5" ry="4.5" fill="#dc2626"/>
        <path d="M11,16 Q15,17.5 19,16" fill="#b91c1c" opacity="0.7"/>

        {/* Nostrils + smoke glow */}
        <circle cx="12.5" cy="17.5" r="1.2" fill="#444"/>
        <circle cx="17.5" cy="17.5" r="1.2" fill="#444"/>
        <circle cx="12.5" cy="15.5" r="0.8" fill="#f97316"
          style={{ animation: `${id}NostrilGlow 1.8s ${ei} infinite` }}/>
        <circle cx="12.8" cy="14.8" r="0.6" fill="#f97316" opacity="0.3"
          style={{ animation: `${id}NostrilGlow 1.8s ${ei} 0.3s infinite` }}/>
        <circle cx="17.5" cy="15.5" r="0.8" fill="#f97316"
          style={{ animation: `${id}NostrilGlow 1.8s ${ei} 0.6s infinite` }}/>
        <circle cx="17.2" cy="14.8" r="0.6" fill="#f97316" opacity="0.3"
          style={{ animation: `${id}NostrilGlow 1.8s ${ei} 0.9s infinite` }}/>
        <path d="M13,16 L14,15.5 M16,16 L15,15.5" stroke="#f97316" strokeWidth="0.6" opacity="0.5"/>

        {/* Eyes — vertical reptilian slits */}
        {m === 'sleep' ? (<>
          <path d="M8.5 9.5 Q11 11 13.5 9.5" fill="none" stroke="#111" strokeWidth="1" strokeLinecap="round"/>
          <path d="M16.5 9.5 Q19 11 21.5 9.5" fill="none" stroke="#111" strokeWidth="1" strokeLinecap="round"/>
        </>) : m === 'surprise' ? (<>
          <ellipse cx="11" cy="9.5" rx="2.2" ry="3.2" fill="#fbbf24"/>
          <ellipse cx="11" cy="9.5" rx="1.4" ry="2.5" fill="#111"/>
          <ellipse cx="19" cy="9.5" rx="2.2" ry="3.2" fill="#fbbf24"/>
          <ellipse cx="19" cy="9.5" rx="1.4" ry="2.5" fill="#111"/>
        </>) : (<>
          <ellipse cx="11" cy="10.5" rx="2" ry="2.8" fill="#fbbf24"/>
          <ellipse cx="11" cy="10.5" rx="1.2" ry="2.2" fill="#111"/>
          <ellipse cx="19" cy="10.5" rx="2" ry="2.8" fill="#fbbf24"/>
          <ellipse cx="19" cy="10.5" rx="1.2" ry="2.2" fill="#111"/>
          <ellipse cx="11" cy="10.5" rx="2.4" ry="3.2" fill="none" stroke="#fde047" strokeWidth="0.4" opacity="0.7"/>
          <ellipse cx="19" cy="10.5" rx="2.4" ry="3.2" fill="none" stroke="#fde047" strokeWidth="0.4" opacity="0.7"/>
        </>)}

        {/* Mouth + fangs */}
        {m === 'kiss' ? (
          <circle cx="15" cy="19" r="1.4" fill="#f472b6"/>
        ) : (<>
          <path d="M12 18.5 Q15 20 18 18.5" fill="none" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round"/>
          <polygon points="13.5,19 13,20 14,19.5" fill="#fef3c7" opacity="0.8"/>
          <polygon points="16.5,19 17,20 16,19.5" fill="#fef3c7" opacity="0.8"/>
        </>)}
      </g>
    </>
  );
}

// 14. UNICORN
function CharUnicorn({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#f9a8d4"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#c4b5fd"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#f8fafc"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#f9a8d4"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#c4b5fd"/>
      </g>
      <polygon points="15,0 13.5,7 16.5,7" fill="#a855f7"/>
      <line x1="15" y1="0" x2="15" y2="7" stroke="#e879f9" strokeWidth="0.5"/>
      <rect x="4" y="5" width="3" height="9" rx="1.5" fill="#f472b6"/>
      <rect x="5" y="5" width="3" height="9" rx="1.5" fill="#818cf8"/>
      <rect x="6" y="5" width="3" height="9" rx="1.5" fill="#a855f7"/>
      <circle cx="15" cy="11.5" r="10.5" fill="#f8fafc"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#7c3aed" bg="white"/>
      <ellipse cx="15" cy="14.5" rx="1.5" ry="1" fill="#f9a8d4"/>
      <path d="M12.5 16.2 Q15 18.4 17.5 16.2" fill="none" stroke="#f472b6" strokeWidth="0.9" strokeLinecap="round"/>
    </g>
  );
}

// 15. PHOENIX
function CharPhoenix({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#f97316"/>
        <polygon points="8,38 10,40 12,38 14,40 14.5,38" fill="#fbbf24"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#ef4444"/>
        <polygon points="15.5,38 17,40 19,38 21,40 22.5,38" fill="#fbbf24"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#f97316"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#f97316"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#ef4444"/>
      </g>
      <polygon points="11,5 13,0 14,5" fill="#f97316"/>
      <polygon points="14,4 15,0 16,4" fill="#fde047"/>
      <polygon points="17,5 19,0 21,5" fill="#ef4444"/>
      <circle cx="15" cy="11.5" r="10.5" fill="#fb923c"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg="#fde047"/>
      <ellipse cx="15" cy="14.5" rx="1.5" ry="1" fill="#c2410c"/>
      <Mouth m={m} color="#c2410c"/>
    </g>
  );
}

// 16. KRAKEN
function CharKraken({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <path d="M10 30 Q6 33 7 37 Q8 40 10 38 Q12 35 10 30" fill="#1e3a5f"/>
        <circle cx="8" cy="34" r="0.8" fill="#1e40af" opacity="0.7"/>
        <circle cx="9" cy="37" r="0.8" fill="#1e40af" opacity="0.7"/>
      </g>
      <g style={s.legR}>
        <path d="M20 30 Q24 33 23 37 Q22 40 20 38 Q18 35 20 30" fill="#1e3a5f"/>
        <circle cx="22" cy="34" r="0.8" fill="#1e40af" opacity="0.7"/>
        <circle cx="21" cy="37" r="0.8" fill="#1e40af" opacity="0.7"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#1e3a5f"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#1e3a5f"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#1e3a5f"/>
      </g>
      <path d="M9 7 Q7 4 9 2 Q10 4 9 7" fill="#1e40af"/>
      <path d="M13 5 Q11 2 13 1 Q14 3 13 5" fill="#1e40af"/>
      <path d="M17 5 Q19 2 21 1 Q20 3 17 5" fill="#1e40af"/>
      <path d="M21 7 Q23 4 21 2 Q20 4 21 7" fill="#1e40af"/>
      <circle cx="15" cy="11.5" r="10.5" fill="#1e3a5f"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} r={2.5} color="#111" bg="#22d3ee"/>
      <ellipse cx="15" cy="15" rx="1.5" ry="1" fill="#0c4a6e"/>
      <Mouth m={m} color="#0c4a6e"/>
    </g>
  );
}

// 17. FAIRY
function CharFairy({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#f9a8d4"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#f9a8d4"/>
      </g>
      <ellipse cx="5" cy="22" rx="3.5" ry="5" fill="#fce7f3" opacity="0.7" transform="rotate(-20 5 22)"/>
      <ellipse cx="25" cy="22" rx="3.5" ry="5" fill="#fce7f3" opacity="0.7" transform="rotate(20 25 22)"/>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#fce7f3"/>
      <circle cx="15" cy="18" r="1.5" fill="#f472b6"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#f9a8d4"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#f9a8d4"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#fce7f3"/>
      <polygon points="8,7 9,4 10,7" fill="#9,4" />
      <polygon points="8,7 9,4 10,7" fill="#f472b6"/>
      <polygon points="20,7 21,4 22,7" fill="#f472b6"/>
      <polygon points="12,5 13,3 14,5" fill="#fb923c"/>
      <polygon points="16,5 17,3 18,5" fill="#a855f7"/>
      <circle cx="9.5" cy="8" r="1.5" fill="#fce7f3"/>
      <circle cx="20.5" cy="8" r="1.5" fill="#fce7f3"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#7c3aed" bg="white"/>
      <ellipse cx="15" cy="14.5" rx="1.2" ry="0.8" fill="#f472b6"/>
      <circle cx="20" cy="9" r="0.8" fill="#fde047" opacity="0.9"/>
      <Mouth m={m} color="#be185d"/>
    </g>
  );
}

// 18. MERMAID
function CharMermaid({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#0d9488"/>
        <ellipse cx="11" cy="38.5" rx="5" ry="2.5" fill="#0f766e"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#0d9488"/>
        <ellipse cx="19" cy="38.5" rx="5" ry="2.5" fill="#0f766e"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#0d9488"/>
      <circle cx="11" cy="19" r="1" fill="#0f766e" opacity="0.5"/>
      <circle cx="14" cy="21" r="1" fill="#0f766e" opacity="0.5"/>
      <circle cx="17" cy="20" r="1" fill="#0f766e" opacity="0.5"/>
      <circle cx="20" cy="22" r="1" fill="#0f766e" opacity="0.5"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#0d9488"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#0d9488"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#2dd4bf"/>
      <rect x="4" y="4" width="3" height="12" rx="1.5" fill="#0d9488"/>
      <rect x="5.5" y="4" width="3" height="12" rx="1.5" fill="#0f766e"/>
      <rect x="7" y="5" width="3" height="11" rx="1.5" fill="#0d9488"/>
      <circle cx="10" cy="7" r="1" fill="white" opacity="0.8"/>
      <circle cx="12" cy="5" r="1" fill="white" opacity="0.8"/>
      <circle cx="14" cy="7" r="1" fill="white" opacity="0.8"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg="white"/>
      <ellipse cx="15" cy="14.5" rx="1.5" ry="1" fill="#134e4a"/>
      <Mouth m={m} color="#134e4a"/>
    </g>
  );
}

// 19. GHOST
function CharGhost({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <path d="M8 29 Q6 33 8 36 Q9 39 11 37 Q13 35 11 29" fill="#f8fafc" opacity="0.85"/>
      </g>
      <g style={s.legR}>
        <path d="M19 29 Q17 33 19 36 Q20 39 21 37 Q23 35 21 29" fill="#f8fafc" opacity="0.85"/>
      </g>
      <path d="M6 22 Q6 16 15 16 Q24 16 24 22 L24 31 Q22 29 20 31 Q18 29 16 31 Q14 29 12 31 Q10 29 8 31 Z" fill="#f8fafc" opacity="0.85"/>
      <g style={s.armL}>
        <path d="M1.5 17 Q0 21 2 26 Q4 26 5 22 Q5 18 1.5 17" fill="#f8fafc" opacity="0.85"/>
      </g>
      <g style={s.armR}>
        <path d="M28.5 17 Q30 21 28 26 Q26 26 25 22 Q25 18 28.5 17" fill="#f8fafc" opacity="0.85"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#f8fafc" opacity="0.9"/>
      <circle cx="11" cy="11" r="2.2" fill="#1e293b"/>
      <circle cx="19" cy="11" r="2.2" fill="#1e293b"/>
      <path d="M12.5 15.5 Q15 17.5 17.5 15.5" fill="none" stroke="#94a3b8" strokeWidth="0.9" strokeLinecap="round"/>
    </g>
  );
}

// 20. VAMPIRE
function CharVampire({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#1e293b"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#1e293b"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#1e293b"/>
      <polygon points="6,16 15,13 24,16 22,19 15,17 8,19" fill="#1e293b"/>
      <polygon points="8,19 15,17 22,19 20,22 15,20 10,22" fill="#1e293b"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#1e293b"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#1e293b"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#f1f5f9"/>
      <rect x="10" y="1" width="10" height="8" rx="3" fill="#1e293b"/>
      <rect x="10.5" y="1" width="4.5" height="8" rx="2" fill="#0f172a"/>
      <rect x="14.5" y="1" width="5" height="8" rx="2" fill="#0f172a"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg="#ef4444"/>
      <ellipse cx="15" cy="14.5" rx="1.5" ry="1" fill="#1e293b"/>
      {m !== 'sleep' && <>
        <polygon points="13.5,17.5 14.2,16 15,17" fill="white"/>
        <polygon points="16.5,17.5 15.8,16 15,17" fill="white"/>
      </>}
    </g>
  );
}


// 21. SKELETON
function CharSkeleton({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#f8fafc"/>
        <rect x="9" y="31" width="4" height="1.5" rx="0.7" fill="#cbd5e1"/>
        <rect x="9" y="34" width="4" height="1.5" rx="0.7" fill="#cbd5e1"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#f8fafc"/>
        <rect x="17" y="31" width="4" height="1.5" rx="0.7" fill="#cbd5e1"/>
        <rect x="17" y="34" width="4" height="1.5" rx="0.7" fill="#cbd5e1"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#f8fafc"/>
      <rect x="9" y="18" width="12" height="2" rx="1" fill="#cbd5e1"/>
      <rect x="9" y="22" width="12" height="2" rx="1" fill="#cbd5e1"/>
      <rect x="9" y="26" width="12" height="2" rx="1" fill="#cbd5e1"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#f8fafc"/>
        <rect x="2" y="19" width="4" height="1.2" rx="0.6" fill="#cbd5e1"/>
        <rect x="2" y="22" width="4" height="1.2" rx="0.6" fill="#cbd5e1"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#f8fafc"/>
        <rect x="24" y="19" width="4" height="1.2" rx="0.6" fill="#cbd5e1"/>
        <rect x="24" y="22" width="4" height="1.2" rx="0.6" fill="#cbd5e1"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#f8fafc"/>
      <rect x="9" y="1" width="12" height="7" rx="2" fill="#1e293b"/>
      <rect x="10" y="1.5" width="10" height="4" rx="1" fill="#374151"/>
      <circle cx="12" cy="1.5" r="1" fill="#f8fafc"/>
      <path d="M10 6 L20 6 L20 7 L10 7 Z" fill="#f8fafc" opacity="0.3"/>
      <circle cx="11" cy="11" r="3" fill="#1e293b"/>
      <circle cx="19" cy="11" r="3" fill="#1e293b"/>
      <rect x="11" y="16" width="8" height="2" rx="1" fill="#1e293b"/>
      <rect x="12" y="15.5" width="2" height="3" rx="0.5" fill="#1e293b"/>
      <rect x="15" y="15.5" width="2" height="3" rx="0.5" fill="#1e293b"/>
    </g>
  );
}

// 22. WITCH
function CharWitch({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#581c87"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#581c87"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#6b21a8"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#6b21a8"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#6b21a8"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#86efac"/>
      <polygon points="15,0 10,7 20,7" fill="#1a1a1a"/>
      <rect x="9" y="6.5" width="12" height="3" rx="0.5" fill="#111"/>
      <polygon points="13,6.5 15,5 17,6.5" fill="#fde047"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg="#fbbf24"/>
      <circle cx="16" cy="14" r="1" fill="#166534"/>
      <ellipse cx="15" cy="14.5" rx="1.5" ry="1" fill="#15803d"/>
      <Mouth m={m} color="#166534"/>
    </g>
  );
}

// 23. KNIGHT
function CharKnight({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#94a3b8"/>
        <rect x="7" y="35" width="8" height="3.5" rx="1.5" fill="#64748b"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#94a3b8"/>
        <rect x="15" y="35" width="8" height="3.5" rx="1.5" fill="#64748b"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#94a3b8"/>
      <rect x="5" y="16" width="5" height="8" rx="2.5" fill="#64748b"/>
      <rect x="20" y="16" width="5" height="8" rx="2.5" fill="#64748b"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#94a3b8"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#94a3b8"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#cbd5e1"/>
      <rect x="9" y="2" width="12" height="14" rx="4" fill="#94a3b8"/>
      <rect x="10" y="8" width="10" height="5" rx="2" fill="#374151"/>
      <circle cx="15" cy="5" r="2" fill="#38bdf8"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={10} color="#fff" bg="#374151"/>
      <Mouth m={m} color="#374151"/>
    </g>
  );
}

// 24. ARCHER
function CharArcher({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#92400e"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#92400e"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#16a34a"/>
      <rect x="21" y="14" width="3.5" height="10" rx="1.5" fill="#92400e"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#92400e"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#92400e"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#fde68a"/>
      <path d="M5 3 Q15 1 25 3 Q24 12 15 14 Q6 12 5 3 Z" fill="#15803d" opacity="0.9"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg="white"/>
      <ellipse cx="15" cy="14.5" rx="1.5" ry="1" fill="#92400e"/>
      <Mouth m={m} color="#92400e"/>
    </g>
  );
}

// 25. NINJA
function CharNinja({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#1e293b"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#1e293b"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#1e293b"/>
      <polygon points="15,19 17,23 13,23" fill="#475569" opacity="0.7"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#1e293b"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#1e293b"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#1e293b"/>
      <rect x="5" y="9" width="20" height="6" rx="3" fill="#0f172a"/>
      <g style={{ animation: blink, transformOrigin: '11px 12px' }}>
        <ellipse cx="11" cy="12" rx="2.5" ry="2" fill="#22d3ee"/>
      </g>
      <g style={{ animation: blink, transformOrigin: '19px 12px' }}>
        <ellipse cx="19" cy="12" rx="2.5" ry="2" fill="#22d3ee"/>
      </g>
    </g>
  );
}

// 26. SUPERHERO
function CharSuperhero({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#1d4ed8"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#1d4ed8"/>
      </g>
      <polygon points="6,16 15,11 24,16 26,31 15,35 4,31" fill="#ef4444" opacity="0.9"/>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#1d4ed8"/>
      <polygon points="15,19 17.5,22.5 15,21 12.5,22.5" fill="#fde047"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#1d4ed8"/>
        <rect x="1.5" y="22" width="5" height="4" rx="2" fill="#fbbf24"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#1d4ed8"/>
        <rect x="23.5" y="22" width="5" height="4" rx="2" fill="#fbbf24"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#dbeafe"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg="white"/>
      <ellipse cx="15" cy="14.5" rx="1.5" ry="1" fill="#1d4ed8"/>
      <Mouth m={m} color="#1d4ed8"/>
    </g>
  );
}

// 27. VIKING
function CharViking({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#92400e"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#92400e"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#78350f"/>
      <rect x="5" y="15" width="20" height="5" rx="2" fill="#9ca3af"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#92400e"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#92400e"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#fde68a"/>
      <rect x="8" y="2" width="14" height="8" rx="2" fill="#9ca3af"/>
      <rect x="8" y="2" width="14" height="4" rx="1" fill="#d1d5db"/>
      <ellipse cx="6" cy="5" rx="3" ry="2" fill="#e5e7eb" transform="rotate(-15 6 5)"/>
      <ellipse cx="24" cy="5" rx="3" ry="2" fill="#e5e7eb" transform="rotate(15 24 5)"/>
      <ellipse cx="5" cy="17" rx="2.5" ry="4" fill="#fde68a"/>
      <ellipse cx="25" cy="17" rx="2.5" ry="4" fill="#fde68a"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg="white"/>
      <ellipse cx="15" cy="14.5" rx="1.5" ry="1" fill="#92400e"/>
      <Mouth m={m} color="#92400e"/>
    </g>
  );
}

// 28. PIRATE
function CharPirate({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#1e3a5f"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#1e3a5f"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#1e3a5f"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#1e3a5f"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#1e3a5f"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#fde68a"/>
      <polygon points="7,8 15,3 23,8 22,10 15,6 8,10" fill="#1a1a1a"/>
      <rect x="7" y="7.5" width="16" height="3" rx="1" fill="#111"/>
      <circle cx="15" cy="7.5" r="1.5" fill="#f8fafc"/>
      <rect x="17" y="9.5" width="6" height="3.5" rx="1.5" fill="#1a1a1a"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={12} color="#111" bg="white"/>
      <ellipse cx="15" cy="15" rx="1.5" ry="1" fill="#92400e"/>
      <Mouth m={m} color="#92400e"/>
    </g>
  );
}

// 29. SAMURAI
function CharSamurai({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#0f766e"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#0f766e"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#0d9488"/>
      <rect x="7" y="15" width="16" height="4" rx="2" fill="#b45309"/>
      <rect x="9" y="17" width="12" height="2" rx="1" fill="#fbbf24" opacity="0.7"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#0d9488"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#0d9488"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#fde68a"/>
      <ellipse cx="15" cy="6" rx="3" ry="5" fill="#1a1a1a"/>
      <rect x="8" y="8" width="14" height="5" rx="2" fill="#1a1a1a" opacity="0.5"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg="white"/>
      <ellipse cx="15" cy="14.5" rx="1.5" ry="1" fill="#92400e"/>
      <Mouth m={m} color="#92400e"/>
    </g>
  );
}

// 30. ROBOT
function CharRobot({ s, m, id, blink }) {
  const sleeping = m === 'sleep';
  return (
    <g style={s.body}>
      {/* Jambes — lourdes bottes mécaniques */}
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="2.5" fill="#38bdf8"/>
        <line x1="11.25" y1="29" x2="11.25" y2="38" stroke="#1e293b" strokeWidth="0.5"/>
        <rect x="7" y="36" width="8" height="3.5" rx="1.8" fill="#1a1a1a"/>
        <line x1="8" y1="37.5" x2="14.5" y2="37.5" stroke="#64748b" strokeWidth="0.4"/>
        <circle cx="11.25" cy="29.5" r="1.2" fill="none" stroke="#94a3b8" strokeWidth="0.5"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="2.5" fill="#38bdf8"/>
        <line x1="19.25" y1="29" x2="19.25" y2="38" stroke="#1e293b" strokeWidth="0.5"/>
        <rect x="15" y="36" width="8" height="3.5" rx="1.8" fill="#1a1a1a"/>
        <line x1="16" y1="37.5" x2="22.5" y2="37.5" stroke="#64748b" strokeWidth="0.4"/>
        <circle cx="19.25" cy="29.5" r="1.2" fill="none" stroke="#94a3b8" strokeWidth="0.5"/>
      </g>

      {/* Torse — panneaux blindés */}
      <rect x="6" y="16" width="18" height="15" rx="3" fill="#38bdf8"/>
      <rect x="12.5" y="16" width="5" height="15" rx="2" fill="#60a5fa" opacity="0.75"/>
      <line x1="12.5" y1="16" x2="12.5" y2="31" stroke="#1e293b" strokeWidth="0.6"/>
      <line x1="17.5" y1="16" x2="17.5" y2="31" stroke="#1e293b" strokeWidth="0.6"/>
      <line x1="6" y1="23.5" x2="24" y2="23.5" stroke="#1e293b" strokeWidth="0.7"/>
      {/* Écran de poitrine */}
      <rect x="10" y="18" width="10" height="4.5" rx="1.5" fill="#1a1a1a"/>
      <rect x="10.3" y="18.3" width="9.4" height="3.9" fill="#60a5fa" opacity="0.85"/>
      <rect x="11" y="18.5" width="3.5" height="1.2" fill="white" opacity="0.25" rx="0.5"/>
      {/* Rivets */}
      <circle cx="7.5" cy="19" r="0.5" fill="#94a3b8" stroke="#1e293b" strokeWidth="0.3"/>
      <circle cx="7.5" cy="24" r="0.5" fill="#94a3b8" stroke="#1e293b" strokeWidth="0.3"/>
      <circle cx="22.5" cy="19" r="0.5" fill="#94a3b8" stroke="#1e293b" strokeWidth="0.3"/>
      <circle cx="22.5" cy="24" r="0.5" fill="#94a3b8" stroke="#1e293b" strokeWidth="0.3"/>
      {/* Évents d'échappement */}
      <rect x="6" y="26" width="1.5" height="2" rx="0.4" fill="#1e293b"/>
      <rect x="22.5" y="26" width="1.5" height="2" rx="0.4" fill="#1e293b"/>

      {/* Bras — épaulières + poings mécaniques */}
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2" fill="#38bdf8"/>
        <line x1="4" y1="17" x2="4" y2="26" stroke="#1e293b" strokeWidth="0.5"/>
        <rect x="0.5" y="17" width="2.5" height="5" rx="1.2" fill="#60a5fa" opacity="0.8"/>
        <rect x="1" y="24" width="6" height="3.5" rx="1.5" fill="#1a1a1a"/>
        <circle cx="4" cy="17.5" r="1" fill="none" stroke="#94a3b8" strokeWidth="0.5"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2" fill="#38bdf8"/>
        <line x1="26" y1="17" x2="26" y2="26" stroke="#1e293b" strokeWidth="0.5"/>
        <rect x="27" y="17" width="2.5" height="5" rx="1.2" fill="#60a5fa" opacity="0.8"/>
        <rect x="23" y="24" width="6" height="3.5" rx="1.5" fill="#1a1a1a"/>
        <circle cx="26" cy="17.5" r="1" fill="none" stroke="#94a3b8" strokeWidth="0.5"/>
      </g>

      {/* Connecteur de cou */}
      <rect x="11" y="13" width="8" height="4" rx="1.5" fill="#38bdf8"/>
      <line x1="11" y1="15" x2="19" y2="15" stroke="#1e293b" strokeWidth="0.5"/>

      {/* TÊTE — rectangle (pas un cercle !) */}
      <rect x="5" y="2" width="20" height="11" rx="4" fill="#38bdf8"/>
      {/* Lignes de panneaux crâniens */}
      <line x1="10" y1="2.5" x2="10" y2="9" stroke="#1e293b" strokeWidth="0.5"/>
      <line x1="20" y1="2.5" x2="20" y2="9" stroke="#1e293b" strokeWidth="0.5"/>
      {/* Crête de casque */}
      <polygon points="15,2 14,5 16,5" fill="#60a5fa" opacity="0.9"/>
      {/* Antenne */}
      <line x1="15" y1="2" x2="15" y2="0" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round"/>
      <circle cx="15" cy="0.5" r="0.8" fill="#60a5fa"/>
      {/* Visière — bande large */}
      <rect x="8.5" y="6" width="13" height="3.5" rx="1.2" fill="#1a1a1a"/>
      <rect x="8.8" y="6.3" width="12.4" height="2.9" fill={sleeping ? '#334155' : '#60a5fa'} opacity="0.9"/>
      {!sleeping && <>
        <rect x="10" y="6.5" width="4" height="0.8" fill="white" opacity="0.35" rx="0.4"/>
        <rect x="16" y="7.5" width="3" height="0.6" fill="white" opacity="0.2" rx="0.3"/>
      </>}
      <line x1="8.5" y1="6" x2="21.5" y2="6" stroke="#94a3b8" strokeWidth="0.4"/>
      <line x1="8.5" y1="9.5" x2="21.5" y2="9.5" stroke="#94a3b8" strokeWidth="0.4"/>
      {/* Halo lumineux visière */}
      <ellipse cx="15" cy="7.75" rx="7.5" ry="2.5" fill="#60a5fa" opacity="0.2"/>
    </g>
  );
}


// 31. ALIEN
function CharAlien({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="8" y="29" width="6" height="9" rx="3" fill="#4ade80"/>
      </g>
      <g style={s.legR}>
        <rect x="16" y="29" width="6" height="9" rx="3" fill="#4ade80"/>
      </g>
      <rect x="7" y="16" width="16" height="15" rx="6" fill="#4ade80"/>
      <g style={s.armL}>
        <rect x="2" y="17" width="4" height="9" rx="2" fill="#4ade80"/>
      </g>
      <g style={s.armR}>
        <rect x="24" y="17" width="4" height="9" rx="2" fill="#4ade80"/>
      </g>
      <ellipse cx="15" cy="10" rx="11" ry="13" fill="#4ade80"/>
      <ellipse cx="10" cy="10" rx="4" ry="3" fill="#111" transform="rotate(-10 10 10)"/>
      <ellipse cx="20" cy="10" rx="4" ry="3" fill="#111" transform="rotate(10 20 10)"/>
      <ellipse cx="10" cy="10" rx="2.5" ry="2" fill="#86efac" transform="rotate(-10 10 10)"/>
      <ellipse cx="20" cy="10" rx="2.5" ry="2" fill="#86efac" transform="rotate(10 20 10)"/>
      <ellipse cx="15" cy="17" rx="2" ry="0.8" fill="#16a34a"/>
      <path d="M12 18.5 Q15 20 18 18.5" fill="none" stroke="#16a34a" strokeWidth="0.8"/>
    </g>
  );
}

// 32. ASTRONAUT
function CharAstronaut({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#f1f5f9"/>
        <rect x="7.5" y="34" width="7" height="4" rx="2" fill="#cbd5e1"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#f1f5f9"/>
        <rect x="15.5" y="34" width="7" height="4" rx="2" fill="#cbd5e1"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#f1f5f9"/>
      <rect x="17" y="18" width="5" height="7" rx="1" fill="#dc2626" opacity="0.8"/>
      <rect x="18" y="19" width="3" height="2" rx="0.5" fill="#f8fafc"/>
      <rect x="9" y="19" width="5" height="3" rx="1" fill="#3b82f6" opacity="0.7"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#f1f5f9"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#f1f5f9"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#f1f5f9"/>
      <circle cx="15" cy="11.5" r="8.5" fill="#1e293b"/>
      <circle cx="15" cy="11.5" r="7" fill="#0ea5e9" opacity="0.3"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg="white"/>
      <Mouth m={m} color="white"/>
    </g>
  );
}

// 33. CYBORG
function CharCyborg({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#fde68a"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#94a3b8"/>
      </g>
      <rect x="6" y="16" width="9" height="15" rx="6" fill="#fde68a"/>
      <rect x="15" y="16" width="9" height="15" rx="6" fill="#94a3b8"/>
      <line x1="9" y1="20" x2="14" y2="20" stroke="#92400e" strokeWidth="0.7" opacity="0.5"/>
      <line x1="16" y1="19" x2="21" y2="19" stroke="#22d3ee" strokeWidth="0.7"/>
      <line x1="16" y1="22" x2="21" y2="22" stroke="#22d3ee" strokeWidth="0.7"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#fde68a"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#94a3b8"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#fde68a"/>
      <path d="M15 1 L15 22" stroke="#94a3b8" strokeWidth="0.5" opacity="0.5"/>
      <rect x="15" y="1" width="10.5" height="21" rx="10.5" fill="#94a3b8" opacity="0.5"/>
      <line x1="16" y1="8" x2="24" y2="8" stroke="#22d3ee" strokeWidth="0.6"/>
      <line x1="16" y1="11" x2="24" y2="11" stroke="#22d3ee" strokeWidth="0.6"/>
      <g style={{ animation: blink, transformOrigin: '11px 11px' }}>
        <circle cx="11" cy="11" r="2.2" fill="white"/>
        <circle cx="11.4" cy="11.3" r="1.1" fill="#111"/>
        <circle cx="11.8" cy="10.7" r="0.45" fill="white"/>
      </g>
      <g style={{ animation: blink, transformOrigin: '19px 11px' }}>
        <circle cx="19" cy="11" r="2.2" fill="#22d3ee"/>
        <circle cx="19.4" cy="11.3" r="1.1" fill="#1e3a5f"/>
        <circle cx="19.8" cy="10.7" r="0.5" fill="white"/>
      </g>
      <ellipse cx="15" cy="14.5" rx="1.5" ry="1" fill="#92400e"/>
      <Mouth m={m} color="#92400e"/>
    </g>
  );
}

// 34. ANDROID
function CharAndroid({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="2" fill="#bae6fd"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="2" fill="#bae6fd"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#e0f2fe"/>
      <path d="M9 20 Q11 18 13 20 Q11 22 9 20 Z" fill="#7c3aed" opacity="0.4"/>
      <path d="M17 20 Q19 18 21 20 Q19 22 17 20 Z" fill="#7c3aed" opacity="0.4"/>
      <line x1="9" y1="23" x2="21" y2="23" stroke="#7c3aed" strokeWidth="0.7" opacity="0.6"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2" fill="#bae6fd"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2" fill="#bae6fd"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#e0f2fe"/>
      <line x1="9" y1="7" x2="21" y2="7" stroke="#7c3aed" strokeWidth="0.7" opacity="0.5"/>
      <line x1="9" y1="10" x2="21" y2="10" stroke="#7c3aed" strokeWidth="0.7" opacity="0.5"/>
      <line x1="9" y1="13" x2="21" y2="13" stroke="#7c3aed" strokeWidth="0.7" opacity="0.5"/>
      <g style={{ animation: blink, transformOrigin: '15px 11px' }}>
        <circle cx="15" cy="11" r="4" fill="#7c3aed"/>
        <circle cx="15" cy="11" r="2.5" fill="#a855f7"/>
        <circle cx="15" cy="11" r="1" fill="#f3e8ff"/>
      </g>
      <ellipse cx="15" cy="17" rx="2" ry="0.8" fill="#7c3aed" opacity="0.6"/>
    </g>
  );
}

// 35. FIRE
function CharFire({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#ef4444"/>
        <polygon points="8,38 10,40 12,38 14,40 14.5,38" fill="#fbbf24"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#dc2626"/>
        <polygon points="15.5,38 17,40 19,38 21,40 22.5,38" fill="#fbbf24"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#f97316"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#f97316"/>
        <polygon points="1.5,26 4,28 6.5,26" fill="#fbbf24"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#ef4444"/>
        <polygon points="23.5,26 26,28 28.5,26" fill="#fbbf24"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#f97316"/>
      <polygon points="10,6 13,0 14,5 15,1 16,5 17,0 20,6" fill="#fbbf24"/>
      <polygon points="11,7 13.5,2 15,6 16.5,2 19,7" fill="#fde047"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={12} color="#111" bg="#fde047"/>
      <ellipse cx="15" cy="15.5" rx="1.5" ry="1" fill="#c2410c"/>
      <Mouth m={m} color="#c2410c"/>
    </g>
  );
}

// 36. WATER
function CharWater({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#38bdf8"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#0ea5e9"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#38bdf8"/>
      <path d="M8 22 Q10 20 12 22 Q14 20 16 22 Q18 20 20 22 Q22 20 24 22" fill="none" stroke="white" strokeWidth="0.8" opacity="0.7"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#38bdf8"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#0ea5e9"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#7dd3fc"/>
      <circle cx="9" cy="6" r="1.5" fill="#bae6fd" opacity="0.8"/>
      <circle cx="21" cy="5" r="1" fill="#bae6fd" opacity="0.8"/>
      <circle cx="7" cy="13" r="1.2" fill="#bae6fd" opacity="0.7"/>
      <circle cx="23" cy="14" r="0.8" fill="#bae6fd" opacity="0.7"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#0c4a6e" bg="white"/>
      <ellipse cx="15" cy="14.5" rx="1.5" ry="1" fill="#0ea5e9"/>
      <Mouth m={m} color="#0ea5e9"/>
    </g>
  );
}

// 37. THUNDER
function CharThunder({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#eab308"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#ca8a04"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#fde047"/>
      <polygon points="13,16 15,19 14,22 17,19 15,22 16,16" fill="#f97316" opacity="0.8"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#fde047"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#eab308"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#fde047"/>
      <polygon points="13,2 11,7 14,7 12,12 17,5 14,5" fill="#f97316"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={12} color="#111" bg="white"/>
      <ellipse cx="15" cy="15.5" rx="1.5" ry="1" fill="#92400e"/>
      <Mouth m={m} color="#92400e"/>
    </g>
  );
}

// 38. ICE
function CharIce({ s, m, id, blink }) {
  const sleeping = m === 'sleep';
  const surprised = m === 'surprise';
  const kissing = m === 'kiss';
  const ei = 'ease-in-out';
  return (
    <>
      <defs>
        <linearGradient id={`${id}RobeGrad`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1e40af"/>
          <stop offset="50%" stopColor="#7dd3fc"/>
          <stop offset="100%" stopColor="#cffafe"/>
        </linearGradient>
      </defs>

      {/* Aura de glace pulsante */}
      <circle cx="15" cy="18" r="24" fill="#bae6fd" opacity="0.12"
        style={{ animation: `${id}Pulse 2.5s ${ei} infinite`, transformOrigin: '15px 18px' }}/>
      {/* Étincelles flottantes */}
      <circle cx="6"  cy="10" r="0.8" fill="#e0f2fe" opacity="0.6" style={{ animation: `${id}Float 2.8s ${ei} infinite` }}/>
      <circle cx="24" cy="12" r="0.6" fill="#e0f2fe" opacity="0.6" style={{ animation: `${id}Float 3.2s ${ei} 0.4s infinite` }}/>
      <circle cx="8"  cy="28" r="0.7" fill="#06b6d4" opacity="0.5" style={{ animation: `${id}Float 2.5s ${ei} 0.9s infinite` }}/>

      <g style={s.body}>
        {/* Jambes avec cristaux de givre */}
        <g style={s.legL}>
          <rect x="7.5" y="29" width="7" height="9" rx="3.5" fill="#bae6fd" opacity="0.85"/>
          <path d="M9,31 L9.5,29.5 M11,31.5 L11.5,30" stroke="#06b6d4" strokeWidth="0.8" strokeLinecap="round" opacity="0.9"/>
        </g>
        <g style={s.legR}>
          <rect x="15.5" y="29" width="7" height="9" rx="3.5" fill="#bae6fd" opacity="0.85"/>
          <path d="M17,31 L17.5,29.5 M19,31.5 L19.5,30" stroke="#06b6d4" strokeWidth="0.8" strokeLinecap="round" opacity="0.9"/>
        </g>

        {/* Robe dégradée */}
        <path d="M 6 16 Q 6 16 6.5 17 L 6 25 Q 6 28 8 30 L 22 30 Q 24 28 24 25 L 23.5 17 Q 24 16 24 16 Q 24 16 15 15 Q 6 16 6 16 Z"
          fill={`url(#${id}RobeGrad)`} opacity="0.95"/>
        <ellipse cx="15" cy="20.5" rx="5.5" ry="6" fill="#e0f2fe" opacity="0.8"/>
        {/* Motifs givre */}
        <g stroke="#06b6d4" strokeWidth="0.7" fill="none" opacity="0.7">
          <line x1="10" y1="18" x2="10" y2="22"/><line x1="8"  y1="20" x2="12" y2="20"/>
          <line x1="8.5" y1="18.5" x2="11.5" y2="21.5"/><line x1="11.5" y1="18.5" x2="8.5" y2="21.5"/>
          <line x1="20" y1="19" x2="20" y2="23"/><line x1="18" y1="21" x2="22" y2="21"/>
          <line x1="18.5" y1="19.5" x2="21.5" y2="22.5"/><line x1="21.5" y1="19.5" x2="18.5" y2="22.5"/>
          <line x1="8" y1="23.5" x2="22" y2="23.5" opacity="0.5"/>
        </g>
        {/* Ceinture de joyaux */}
        <rect x="9.5" y="24" width="11" height="2.5" rx="1" fill="#1e40af" opacity="0.9"/>
        <circle cx="12" cy="25.3" r="0.9" fill="#f59e0b"/>
        <circle cx="15" cy="25.3" r="1"   fill="#3b82f6"/>
        <circle cx="18" cy="25.3" r="0.9" fill="#10b981"/>

        {/* Bras avec épaulières de glace */}
        <g style={s.armL}>
          <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#bae6fd"/>
          <ellipse cx="3.5" cy="17.5" rx="3" ry="2" fill="#06b6d4" opacity="0.85"/>
          <polygon points="2.5,16.5 3,15 3.5,16.5" fill="#e0f2fe" opacity="0.9"/>
        </g>
        <g style={s.armR}>
          <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#bae6fd"/>
          <ellipse cx="26.5" cy="17.5" rx="3" ry="2" fill="#06b6d4" opacity="0.85"/>
          <polygon points="26.5,16.5 27,15 27.5,16.5" fill="#e0f2fe" opacity="0.9"/>
        </g>

        {/* Tête — ellipse allongée (pas un cercle) */}
        <ellipse cx="15" cy="10" rx="8" ry="10" fill="#f0f8ff" opacity="0.95"/>

        {/* Couronne */}
        <path d="M 7 7 Q 7 3 15 1 Q 23 3 23 7" fill="#1e40af" opacity="0.95" stroke="#0ea5e9" strokeWidth="0.6"/>
        <polygon points="15,1 16.5,4 13.5,4"   fill="#06b6d4" stroke="#0ea5e9" strokeWidth="0.5"/>
        <polygon points="11,3.5 12,5.5 10,5"   fill="#e0f2fe" stroke="#06b6d4" strokeWidth="0.5"/>
        <polygon points="19,3.5 18,5.5 20,5"   fill="#e0f2fe" stroke="#06b6d4" strokeWidth="0.5"/>
        <polygon points="8.5,5 9.2,6.5 7.8,6"  fill="#cffafe" stroke="#06b6d4" strokeWidth="0.4"/>
        <polygon points="21.5,5 20.8,6.5 22.2,6" fill="#cffafe" stroke="#06b6d4" strokeWidth="0.4"/>
        <circle cx="12" cy="6" r="0.7" fill="#f59e0b"/>
        <circle cx="15" cy="5" r="0.8" fill="#3b82f6"/>
        <circle cx="18" cy="6" r="0.7" fill="#10b981"/>

        {/* Yeux — ellipses inclinées avec pupilles cyan */}
        {sleeping ? (<>
          <path d="M8.5 10.5 Q11 12.5 13.5 10.5" fill="none" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M16.5 10.5 Q19 12.5 21.5 10.5" fill="none" stroke="#0f172a" strokeWidth="1.2" strokeLinecap="round"/>
        </>) : (<>
          <ellipse cx="11.5" cy="10.2" rx="1.5" ry="1.9" fill="#1e3a8a" transform="rotate(-15 11.5 10.2)"/>
          <ellipse cx="11.5" cy="10.2" rx="0.8" ry="1"   fill="#06b6d4"/>
          <circle  cx="11.5" cy="9.8"  r="0.4"            fill="white" opacity="0.7"/>
          <ellipse cx="18.5" cy="10.2" rx="1.5" ry="1.9" fill="#1e3a8a" transform="rotate(15 18.5 10.2)"/>
          <ellipse cx="18.5" cy="10.2" rx="0.8" ry="1"   fill="#06b6d4"/>
          <circle  cx="18.5" cy="9.8"  r="0.4"            fill="white" opacity="0.7"/>
        </>)}
        {/* Sourcils élégants */}
        <path d="M 10 8.8 Q 11.5 8 13 8.3" stroke="#0f172a" strokeWidth="0.6" fill="none" strokeLinecap="round"/>
        <path d="M 17 8.3 Q 18.5 8 20 8.8" stroke="#0f172a" strokeWidth="0.6" fill="none" strokeLinecap="round"/>
        {/* Bouche */}
        {kissing
          ? <circle cx="15" cy="13" r="1.2" fill="#ec4899" opacity="0.85"/>
          : surprised
            ? <ellipse cx="15" cy="13.5" rx="1.5" ry="1.8" fill="#fca5a5" opacity="0.9"/>
            : <>
                <path d="M 13 13 Q 15 14.2 17 13" fill="none" stroke="#0f172a" strokeWidth="0.8" strokeLinecap="round"/>
                <circle cx="12.5" cy="13.2" r="0.3" fill="#e0f2fe" opacity="0.7"/>
                <circle cx="17.5" cy="13.2" r="0.3" fill="#e0f2fe" opacity="0.7"/>
              </>
        }
      </g>
    </>
  );
}

// 39. WIND
function CharWind({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#bae6fd" opacity="0.8"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#e0f7ff" opacity="0.8"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#e0f7ff" opacity="0.85"/>
      <path d="M8 20 Q12 18 16 20 Q20 18 24 20" fill="none" stroke="#7dd3fc" strokeWidth="1" opacity="0.8"/>
      <path d="M8 24 Q12 22 16 24 Q20 22 24 24" fill="none" stroke="#bae6fd" strokeWidth="0.8" opacity="0.7"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#bae6fd" opacity="0.8"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#e0f7ff" opacity="0.8"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#e0f7ff" opacity="0.9"/>
      <path d="M8 7 Q12 4 16 7 Q18 5 20 7" fill="none" stroke="#7dd3fc" strokeWidth="1.2"/>
      <path d="M6 11 Q10 8 14 11" fill="none" stroke="#bae6fd" strokeWidth="1"/>
      <path d="M16 11 Q20 8 24 11" fill="none" stroke="#bae6fd" strokeWidth="1"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={12} color="#0369a1" bg="white"/>
      <ellipse cx="15" cy="15.5" rx="1.5" ry="1" fill="#0369a1"/>
      <Mouth m={m} color="#0369a1"/>
    </g>
  );
}

// 40. EARTH
function CharEarth({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#92400e"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#78350f"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#92400e"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#92400e"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#78350f"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#b45309"/>
      <circle cx="9" cy="5" r="2" fill="#16a34a"/>
      <circle cx="21" cy="6" r="1.5" fill="#16a34a"/>
      <circle cx="14" cy="3" r="1.2" fill="#15803d"/>
      <path d="M9 6 L8 8 L7 7 L9 6" fill="#16a34a"/>
      <path d="M21 7 L20 9 L22 9 L21 7" fill="#16a34a"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg="white"/>
      <ellipse cx="15" cy="14.5" rx="1.8" ry="1.2" fill="#7c2d12"/>
      <Mouth m={m} color="#7c2d12"/>
    </g>
  );
}


// 41. GAMER
function CharGamer({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#581c87"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#4c1d95"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#6d28d9"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#6d28d9"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#6d28d9"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#e2e8f0"/>
      <path d="M5 4 Q5 1 15 1 Q25 1 25 4 Q25 16 15 17 Q5 16 5 4 Z" fill="#6d28d9" opacity="0.9"/>
      <rect x="2" y="8" width="5" height="8" rx="2" fill="#7c3aed"/>
      <rect x="23" y="8" width="5" height="8" rx="2" fill="#7c3aed"/>
      <ellipse cx="11" cy="12" rx="2.5" ry="2" fill="#38bdf8" opacity="0.5"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={12} color="#111" bg="white"/>
      <ellipse cx="15" cy="15.5" rx="1.5" ry="1" fill="#6d28d9"/>
      <Mouth m={m} color="#6d28d9"/>
    </g>
  );
}

// 42. ROCKSTAR
function CharRockstar({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#1a1a1a"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#1a1a1a"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#1a1a1a"/>
      <polygon points="15,18 17,22 13,22" fill="#f472b6" opacity="0.8"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#1a1a1a"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#1a1a1a"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#fde68a"/>
      <polygon points="12,6 14,0 15,5 16,0 18,6 17,7 15,3 13,7" fill="#f472b6"/>
      <ellipse cx="10" cy="11" rx="3" ry="1.8" fill="#1a1a1a" opacity="0.85"/>
      <ellipse cx="20" cy="11" rx="3" ry="1.8" fill="#1a1a1a" opacity="0.85"/>
      <circle cx="18" cy="8" r="1.5" fill="#fde047"/>
      <Eyes m={m} id={id} blink={blink} lx={10} rx={20} y={11} r={1.5} color="white" bg="#1a1a1a"/>
      <ellipse cx="15" cy="14.5" rx="1.5" ry="1" fill="#b45309"/>
      <Mouth m={m} color="#b45309"/>
    </g>
  );
}

// 43. SURFER
function CharSurfer({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#0ea5e9"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#0284c7"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#38bdf8"/>
      <path d="M9 23 Q12 21 15 23 Q18 21 22 23" fill="none" stroke="white" strokeWidth="1" opacity="0.7"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#38bdf8"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#38bdf8"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#d97706"/>
      <path d="M5 5 Q8 2 11 5 Q12 2 14 4 Q15 2 16 4 Q18 2 20 5 Q22 2 25 5" fill="none" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M5 7 Q9 5 13 7 Q15 5 17 7 Q20 5 25 7" fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.7"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg="white"/>
      <ellipse cx="15" cy="14.5" rx="1.5" ry="1" fill="#92400e"/>
      <path d="M12 16.5 Q15 18.5 18 16.5" fill="none" stroke="#92400e" strokeWidth="0.9" strokeLinecap="round"/>
    </g>
  );
}

// 44. MUSHROOM
function CharMushroom({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="8" y="30" width="6" height="8" rx="3" fill="#fef9c3"/>
      </g>
      <g style={s.legR}>
        <rect x="16" y="30" width="6" height="8" rx="3" fill="#fef9c3"/>
      </g>
      <rect x="7" y="17" width="16" height="14" rx="6" fill="#fef9c3"/>
      <g style={s.armL}>
        <rect x="2" y="18" width="5" height="8" rx="2.5" fill="#fef9c3"/>
      </g>
      <g style={s.armR}>
        <rect x="23" y="18" width="5" height="8" rx="2.5" fill="#fef9c3"/>
      </g>
      <ellipse cx="15" cy="7" rx="13" ry="9" fill="#dc2626"/>
      <circle cx="10" cy="5" r="2" fill="white"/>
      <circle cx="19" cy="4" r="1.5" fill="white"/>
      <circle cx="15" cy="7" r="1.5" fill="white"/>
      <circle cx="12" cy="9" r="1" fill="white"/>
      <circle cx="18" cy="8" r="1" fill="white"/>
      <ellipse cx="15" cy="13" rx="12" ry="4" fill="#dc2626"/>
      <circle cx="15" cy="13.5" r="9" fill="#fef9c3"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={14} r={1.8} color="#111" bg="white"/>
      <ellipse cx="15" cy="17" rx="1.2" ry="0.8" fill="#92400e"/>
      <path d="M12.5 18 Q15 19.5 17.5 18" fill="none" stroke="#92400e" strokeWidth="0.8" strokeLinecap="round"/>
    </g>
  );
}

// 45. CACTUS
function CharCactus({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#16a34a"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#15803d"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#16a34a"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#16a34a"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#16a34a"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#22c55e"/>
      <line x1="8" y1="8" x2="6" y2="6" stroke="#15803d" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="9" y1="10" x2="6.5" y2="10" stroke="#15803d" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="22" y1="8" x2="24" y2="6" stroke="#15803d" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="21" y1="10" x2="23.5" y2="10" stroke="#15803d" strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="13" y1="4" x2="12" y2="2" stroke="#15803d" strokeWidth="1" strokeLinecap="round"/>
      <line x1="17" y1="4" x2="18" y2="2" stroke="#15803d" strokeWidth="1" strokeLinecap="round"/>
      <rect x="10" y="1" width="10" height="4" rx="2" fill="#78350f"/>
      <rect x="9" y="0.5" width="12" height="2.5" rx="1.2" fill="#92400e"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg="white"/>
      <ellipse cx="15" cy="14.5" rx="1.5" ry="1" fill="#15803d"/>
      <Mouth m={m} color="#15803d"/>
    </g>
  );
}

// 46. PIZZA
function CharPizza({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#f97316"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#ea580c"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#fef3c7"/>
      <circle cx="11" cy="20" r="1.5" fill="#ef4444"/>
      <circle cx="17" cy="21" r="1.5" fill="#ef4444"/>
      <circle cx="14" cy="25" r="1.5" fill="#ef4444"/>
      <circle cx="20" cy="24" r="1.5" fill="#16a34a"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#f97316"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#ea580c"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#f97316"/>
      <circle cx="15" cy="11.5" r="9" fill="#fbbf24"/>
      <circle cx="15" cy="11.5" r="7" fill="#fef3c7"/>
      <circle cx="12" cy="9" r="1.5" fill="#ef4444"/>
      <circle cx="18" cy="10" r="1.5" fill="#ef4444"/>
      <circle cx="14" cy="13" r="1" fill="#16a34a"/>
      <circle cx="17" cy="13.5" r="1" fill="#16a34a"/>
      <circle cx="11.5" cy="12.5" r="0.8" fill="#a16207"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg="white"/>
      <Mouth m={m} color="#c2410c"/>
    </g>
  );
}

// 47. CLOWN
function CharClown({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#a855f7"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#f97316"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#fbbf24"/>
      <path d="M6 15 L8 17 L10 15 L12 17 L14 15 L16 17 L18 15 L20 17 L22 15 L24 17 L24 16 L6 16 Z" fill="#ef4444"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#22c55e"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#3b82f6"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="white"/>
      <circle cx="8" cy="6" r="3" fill="#f472b6"/>
      <circle cx="22" cy="5" r="2.5" fill="#fbbf24"/>
      <circle cx="15" cy="3" r="2.5" fill="#22c55e"/>
      <circle cx="10" cy="3" r="2" fill="#3b82f6"/>
      <circle cx="20" cy="3" r="2" fill="#f97316"/>
      <circle cx="15" cy="13.5" r="2.5" fill="#ef4444"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg="white"/>
      <path d="M11 16.5 Q15 19.5 19 16.5" fill="none" stroke="#111" strokeWidth="1" strokeLinecap="round"/>
    </g>
  );
}

// 48. STAR
function CharStar({ s, m, id, blink }) {
  const starPath = "M15,1 L17.8,9.2 L26.5,9.2 L19.4,14.3 L22.2,22.5 L15,17.4 L7.8,22.5 L10.6,14.3 L3.5,9.2 L12.2,9.2 Z";
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#fbbf24"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#f59e0b"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#fbbf24"/>
      <polygon points="15,17 16.5,21 20.5,21 17.5,23.5 18.5,27 15,24.5 11.5,27 12.5,23.5 9.5,21 13.5,21" fill="#fde047"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#fbbf24"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#f59e0b"/>
      </g>
      <path d={starPath} fill="#fde047" transform="scale(0.45) translate(2,0)"/>
      <circle cx="15" cy="11.5" r="8" fill="#fbbf24"/>
      <circle cx="15" cy="11.5" r="7" fill="#fde047"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg="white"/>
      <ellipse cx="15" cy="14.5" rx="1.5" ry="1" fill="#d97706"/>
      <Mouth m={m} color="#d97706"/>
    </g>
  );
}

// 49. MOON
function CharMoon({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#6366f1"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#4f46e5"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#818cf8"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#818cf8"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#6366f1"/>
      </g>
      <circle cx="15" cy="11.5" r="10.5" fill="#818cf8"/>
      <path d="M13 3 Q20 7 18 15 Q14 18 12 16 Q8 12 10 6 Q11 3 13 3 Z" fill="#c7d2fe" opacity="0.9"/>
      <circle cx="10" cy="7" r="1.5" fill="#e0e7ff" opacity="0.6"/>
      <circle cx="13" cy="5" r="1" fill="#e0e7ff" opacity="0.7"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={12} color="#111" bg="#e0e7ff"/>
      <ellipse cx="15" cy="15.5" rx="1.5" ry="1" fill="#3730a3"/>
      <Mouth m={m} color="#3730a3"/>
    </g>
  );
}

// 50. CRYSTAL
function CharCrystal({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="2" fill="#67e8f9"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="2" fill="#22d3ee"/>
      </g>
      <rect x="6" y="16" width="18" height="15" rx="4" fill="#67e8f9"/>
      <line x1="6" y1="20" x2="24" y2="20" stroke="#a5f3fc" strokeWidth="0.7"/>
      <line x1="6" y1="24" x2="24" y2="24" stroke="#a5f3fc" strokeWidth="0.7"/>
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2" fill="#67e8f9"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2" fill="#22d3ee"/>
      </g>
      <polygon points="15,1 22,7 22,16 15,22 8,16 8,7" fill="#a5f3fc"/>
      <polygon points="15,3 21,8 21,15 15,20 9,15 9,8" fill="#67e8f9"/>
      <line x1="15" y1="3" x2="15" y2="20" stroke="#e0f7ff" strokeWidth="0.6" opacity="0.8"/>
      <line x1="9" y1="8" x2="21" y2="15" stroke="#e0f7ff" strokeWidth="0.6" opacity="0.8"/>
      <line x1="21" y1="8" x2="9" y2="15" stroke="#e0f7ff" strokeWidth="0.6" opacity="0.8"/>
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#0e7490" bg="white"/>
      <ellipse cx="15" cy="15" rx="1.5" ry="1" fill="#0e7490"/>
      <Mouth m={m} color="#0e7490"/>
    </g>
  );
}

function CharStormEagle({ s, m, id, blink }) {
  return (
    <g style={s.body}>
      <circle cx="15" cy="18" r="14" fill="none" stroke="#FFD700" strokeWidth="0.8" opacity="0.4" />
      <circle cx="15" cy="18" r="12" fill="none" stroke="#67e8f9" strokeWidth="0.5" opacity="0.3" />
      <path d="M 18 5 L 19.5 10 L 18.5 10 L 20 16 L 17 16 L 19 24" stroke="#FFD700" strokeWidth="1.5" fill="none" opacity="0.8" strokeLinecap="round" />
      <path d="M 18 5 L 19.5 10 L 18.5 10 L 20 16 L 17 16 L 19 24" stroke="#FFED4E" strokeWidth="0.7" fill="none" opacity="0.5" strokeLinecap="round" />

      <g style={s.legL}>
        <rect x="7.5" y="29" width="6" height="8" rx="2" fill="#5A3F0C" />
        <g fill="#FFD700">
          <polygon points="9,37 8,40 10,40" opacity="0.9" />
          <polygon points="10.5,37 10,40 12,40" opacity="0.9" />
          <polygon points="12,37 11,40 13,40" opacity="0.9" />
        </g>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="6" height="8" rx="2" fill="#5A3F0C" />
        <g fill="#FFD700">
          <polygon points="17,37 16,40 18,40" opacity="0.9" />
          <polygon points="18.5,37 18,40 20,40" opacity="0.9" />
          <polygon points="20,37 19,40 21,40" opacity="0.9" />
        </g>
      </g>

      <ellipse cx="15" cy="20" rx="9" ry="8" fill="#8B6914" />
      <ellipse cx="15" cy="20" rx="7.5" ry="6.5" fill="#A0791B" />
      <ellipse cx="15" cy="21" rx="5" ry="5" fill="#FFF8DC" opacity="0.85" />
      <path d="M 12 18 Q 15 17.5 18 18" stroke="#8B6914" strokeWidth="0.6" fill="none" opacity="0.7" />
      <path d="M 11 20 Q 15 19.5 19 20" stroke="#8B6914" strokeWidth="0.6" fill="none" opacity="0.7" />
      <path d="M 12 22 Q 15 21.5 18 22" stroke="#8B6914" strokeWidth="0.6" fill="none" opacity="0.7" />

      <g style={s.armL}>
        <rect x="0" y="14" width="7.5" height="14" rx="2" fill="#8B6914" />
        <polygon points="0.5,14 1.2,12.5 2,14" fill="#A0791B" />
        <polygon points="1.8,13.8 2.5,11.8 3.3,13.8" fill="#A0791B" />
        <polygon points="3.2,13.5 4,11.2 4.8,13.5" fill="#A0791B" />
        <polygon points="4.8,13.8 5.5,11.8 6.3,13.8" fill="#A0791B" />
        <polygon points="6.3,14 7,12.5 7.5,14" fill="#A0791B" />
        <polygon points="0.5,18 0.8,15.5 2.2,18" fill="#A0791B" />
        <polygon points="2,18.2 2.5,15 4,18.2" fill="#A0791B" />
        <polygon points="3.5,18 4,14.5 5.5,18" fill="#A0791B" />
        <polygon points="5.2,18.2 5.8,15 7.2,18.2" fill="#A0791B" />
        <polygon points="1,24 1.2,20 3,24" fill="#A0791B" />
        <polygon points="2.8,25 3.2,20 5,25" fill="#A0791B" />
        <polygon points="4.5,25 5,20.5 6.8,25" fill="#A0791B" />
        <polygon points="6.2,24 6.6,20 7.5,24" fill="#A0791B" />
        <polygon points="1,18 1.5,16 2,18" fill="#67e8f9" opacity="0.85" />
        <polygon points="3.5,18 4.2,15.5 5,18" fill="#67e8f9" opacity="0.8" />
        <polygon points="6,24 6.5,21 7.2,24" fill="#67e8f9" opacity="0.85" />
      </g>

      <g style={s.armR}>
        <rect x="22.5" y="14" width="7.5" height="14" rx="2" fill="#8B6914" />
        <polygon points="29.5,14 28.8,12.5 28,14" fill="#A0791B" />
        <polygon points="28.2,13.8 27.5,11.8 26.7,13.8" fill="#A0791B" />
        <polygon points="26.8,13.5 26,11.2 25.2,13.5" fill="#A0791B" />
        <polygon points="25.2,13.8 24.5,11.8 23.7,13.8" fill="#A0791B" />
        <polygon points="23.7,14 23,12.5 22.5,14" fill="#A0791B" />
        <polygon points="29.5,18 29.2,15.5 27.8,18" fill="#A0791B" />
        <polygon points="28,18.2 27.5,15 26,18.2" fill="#A0791B" />
        <polygon points="26.5,18 26,14.5 24.5,18" fill="#A0791B" />
        <polygon points="24.8,18.2 24.2,15 22.8,18.2" fill="#A0791B" />
        <polygon points="29,24 28.8,20 27,24" fill="#A0791B" />
        <polygon points="27.2,25 26.8,20 25,25" fill="#A0791B" />
        <polygon points="25.5,25 25,20.5 23.2,25" fill="#A0791B" />
        <polygon points="23.8,24 23.4,20 22.5,24" fill="#A0791B" />
        <polygon points="29,18 28.5,16 28,18" fill="#67e8f9" opacity="0.85" />
        <polygon points="26.5,18 25.8,15.5 25,18" fill="#67e8f9" opacity="0.8" />
        <polygon points="24,24 23.5,21 22.8,24" fill="#67e8f9" opacity="0.85" />
      </g>

      <ellipse cx="15" cy="10" rx="8" ry="9" fill="#8B6914" />
      <ellipse cx="15" cy="10" rx="6.5" ry="7.5" fill="#A0791B" />
      <path d="M 10 8.5 Q 12 7.5 14 8" stroke="#5A3F0C" strokeWidth="0.7" fill="none" opacity="0.6" />
      <path d="M 16 8 Q 18 7.5 20 8.5" stroke="#5A3F0C" strokeWidth="0.7" fill="none" opacity="0.6" />

      <g fill="#FFD700">
        <polygon points="11,3 10.5,0 11.5,3" />
        <polygon points="13,1.5 12,-1 13.5,1.5" />
        <polygon points="15,1 14,-1.5 16,1" />
        <polygon points="17,1.5 16.5,-1 18,1.5" />
        <polygon points="19,3 18.5,0 19.5,3" />
      </g>
      <polygon points="13,1.5 12.8,-0.5 13.8,1.5" fill="#67e8f9" opacity="0.8" />
      <polygon points="15,1 14.8,-1 15.8,1" fill="#67e8f9" opacity="0.8" />
      <polygon points="17,1.5 16.8,-0.5 17.8,1.5" fill="#67e8f9" opacity="0.8" />

      {m === 'sleep' ? (
        <>
          <path d="M 12 9 Q 13 10 14 9" stroke="#5A3F0C" strokeWidth="1" fill="none" strokeLinecap="round" />
          <path d="M 16 9 Q 17 10 18 9" stroke="#5A3F0C" strokeWidth="1" fill="none" strokeLinecap="round" />
        </>
      ) : m === 'surprise' ? (
        <>
          <circle cx="13" cy="8.5" r="2.2" fill="#FFD700" />
          <ellipse cx="13" cy="8.5" rx="1.1" ry="1.4" fill="#000" />
          <circle cx="13.5" cy="8" r="0.4" fill="#fff" opacity="0.8" />
          <circle cx="17" cy="8.5" r="2.2" fill="#FFD700" />
          <ellipse cx="17" cy="8.5" rx="1.1" ry="1.4" fill="#000" />
          <circle cx="17.5" cy="8" r="0.4" fill="#fff" opacity="0.8" />
        </>
      ) : (
        <g style={{ animation: blink, transformOrigin: '15px 10px' }}>
          <circle cx="13" cy="9" r="2" fill="#FFD700" />
          <ellipse cx="13" cy="9" rx="0.9" ry="1.3" fill="#000" />
          <circle cx="13.5" cy="8.5" r="0.4" fill="#fff" opacity="0.9" />
          <circle cx="17" cy="9" r="2" fill="#FFD700" />
          <ellipse cx="17" cy="9" rx="0.9" ry="1.3" fill="#000" />
          <circle cx="17.5" cy="8.5" r="0.4" fill="#fff" opacity="0.9" />
          <path d="M 11 7 Q 13 6 14.5 7" stroke="#5A3F0C" strokeWidth="1.1" fill="none" strokeLinecap="round" />
          <path d="M 15.5 7 Q 17 6 19 7" stroke="#5A3F0C" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        </g>
      )}

      {m === 'kiss' || m === 'surprise' ? (
        <polygon points="15,12 13.5,13 15,14.5 16.5,13" fill="#FFB347" stroke="#FF8C00" strokeWidth="0.5" />
      ) : (
        <polygon points="15,12 13,13.5 17,13.5" fill="#FFB347" stroke="#FF8C00" strokeWidth="0.5" />
      )}
    </g>
  );
}

// ─── REQUIN NINJA ─────────────────────────────────────────────────────────────
function CharSharkNinja({ s, m, id, blink }) {
  const ei = 'ease-in-out';
  return (
    <>
      <defs>
        <radialGradient id={`${id}-auraGlow`} cx="50%" cy="52%" r="50%">
          <stop offset="0%"   stopColor="#00BFFF" stopOpacity="0.28"/>
          <stop offset="45%"  stopColor="#00BFFF" stopOpacity="0.12"/>
          <stop offset="100%" stopColor="#00BFFF" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id={`${id}-whiteGlow`} cx="50%" cy="52%" r="50%">
          <stop offset="0%"   stopColor="white" stopOpacity="0.45"/>
          <stop offset="40%"  stopColor="white" stopOpacity="0.18"/>
          <stop offset="100%" stopColor="white" stopOpacity="0"/>
        </radialGradient>
      </defs>

      {/* Aura layers */}
      <ellipse cx="15" cy="20" rx="14" ry="17.5" fill="white" opacity="0.30"
        style={{ filter: 'blur(2.8px)' }}/>
      <ellipse cx="15" cy="20" rx="13" ry="16.5" fill={`url(#${id}-whiteGlow)`}
        style={{ animation: `${id}SharkAura 2s ${ei} infinite`, transformOrigin: '15px 20px' }}/>
      <ellipse cx="15" cy="20" rx="14" ry="17.5" fill={`url(#${id}-auraGlow)`}
        style={{ animation: `${id}SharkAura 2s ${ei} 0.3s infinite`, transformOrigin: '15px 20px' }}/>
      <ellipse cx="15" cy="20" rx="7" ry="9" fill="#00BFFF" opacity="0.10"/>
      <ellipse cx="15" cy="20" rx="9" ry="11.5" fill="none" stroke="#7DF9FF" strokeWidth="0.9" opacity="0.60"/>
      <ellipse cx="15" cy="20" rx="11.5" ry="14.5" fill="none" stroke="#00BFFF" strokeWidth="1.1" opacity="0.45"/>
      <ellipse cx="15" cy="20" rx="14" ry="17.5" fill="none" stroke="#00BFFF" strokeWidth="1.6" opacity="0.30"/>

      {/* Lightning bolts */}
      <path d="M 15 2.5 L 13.5 5.5 L 16 5 L 14.2 8.5"    stroke="#7DF9FF" strokeWidth="1.4" fill="none" strokeLinecap="round"
        style={{ animation: `${id}SharkBolt 3s ${ei} infinite` }}/>
      <path d="M 15 37.5 L 13.5 34.5 L 16 35 L 14.2 31.5" stroke="#7DF9FF" strokeWidth="1.4" fill="none" strokeLinecap="round"
        style={{ animation: `${id}SharkBolt 3s ${ei} 0.5s infinite` }}/>
      <path d="M -0.5 19 L 2.5 17.5 L 2 20.5 L 5.5 19"    stroke="#7DF9FF" strokeWidth="1.4" fill="none" strokeLinecap="round"
        style={{ animation: `${id}SharkBolt 3s ${ei} 1s infinite` }}/>
      <path d="M 30.5 19 L 27.5 17.5 L 28 20.5 L 24.5 19"  stroke="#7DF9FF" strokeWidth="1.4" fill="none" strokeLinecap="round"
        style={{ animation: `${id}SharkBolt 3s ${ei} 1.5s infinite` }}/>

      {/* Particles */}
      <circle cx="5"  cy="7.5"  r="0.85" fill="white"   style={{ animation: `${id}SharkParticle 2s ${ei} infinite` }}/>
      <circle cx="25" cy="7.5"  r="0.85" fill="white"   style={{ animation: `${id}SharkParticle 2s ${ei} 0.4s infinite` }}/>
      <circle cx="3.5" cy="30.5" r="0.7" fill="#7DF9FF" style={{ animation: `${id}SharkParticle 2s ${ei} 0.8s infinite` }}/>
      <circle cx="26.5" cy="30.5" r="0.7" fill="#7DF9FF" style={{ animation: `${id}SharkParticle 2s ${ei} 1.2s infinite` }}/>
      <circle cx="15" cy="2.2"  r="1.1"  fill="white"   style={{ animation: `${id}SharkParticle 2s ${ei} 0.2s infinite` }}/>
      <circle cx="15" cy="37.8" r="1.1"  fill="white"   style={{ animation: `${id}SharkParticle 2s ${ei} 0.6s infinite` }}/>

      <g style={s.body}>
        {/* Tail fins (driven by legL / legR) — pivot at fin base */}
        <g style={{ ...s.legL, transformOrigin: '12px 32px' }}>
          <path d="M 11 32 Q 7 30 4 28 Q 3 32 7 36 Q 9.5 35.5 12 33 Z" fill="#1a1a1a" stroke="#000" strokeWidth="1"/>
        </g>
        <g style={{ ...s.legR, transformOrigin: '18px 32px' }}>
          <path d="M 19 32 Q 23 30 26 28 Q 27 32 23 36 Q 20.5 35.5 18 33 Z" fill="#1a1a1a" stroke="#000" strokeWidth="1"/>
        </g>
        {/* Centre tail — static */}
        <path d="M 12 32 L 15 34.5 L 18 32 Z" fill="#1a1a1a"/>

        {/* Gi body */}
        <ellipse cx="15" cy="26" rx="8" ry="7.5" fill="#1a1a1a" stroke="#000" strokeWidth="1.2"/>

        {/* White V-lapels */}
        <path d="M 11 20.5 L 15 24 L 19 20.5" fill="#F0F8FF" stroke="#ccc" strokeWidth="0.5"/>
        <path d="M 10.5 20.5 L 15 24.5 L 19.5 20.5" fill="none" stroke="#2a2a2a" strokeWidth="0.8"/>

        {/* Centerline stitch */}
        <line x1="15" y1="24.5" x2="15" y2="31.5" stroke="#2a2a2a" strokeWidth="0.6" strokeDasharray="1,1" opacity="0.5"/>

        {/* Belt */}
        <rect x="9" y="28.8" width="12" height="1.8" fill="#111" stroke="#333" strokeWidth="0.5" rx="0.5"/>
        <rect x="13" y="28.4" width="4" height="2.6" rx="0.6" fill="#111" stroke="#3a3a3a" strokeWidth="0.7"/>

        {/* Gills */}
        <path d="M 7.8 22.5 Q 6.3 23 6.5 24" stroke="#333" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M 7.5 24.5 Q 6 25 6.2 26" stroke="#333" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M 22.2 22.5 Q 23.7 23 23.5 24" stroke="#333" strokeWidth="1" fill="none" strokeLinecap="round"/>
        <path d="M 22.5 24.5 Q 24 25 23.8 26" stroke="#333" strokeWidth="1" fill="none" strokeLinecap="round"/>

        {/* Sleeve fins (arms) — pivot at body attachment */}
        <g style={{ ...s.armL, transformOrigin: '8px 22px',
          ...(m === 'clap' && { animation: `${id}SharkClapL 0.4s ease-in-out infinite` }) }}>
          <path d="M 8 22 L 3 23 L 6 27 Z" fill="#1a1a1a" stroke="#000" strokeWidth="1"/>
        </g>
        <g style={{ ...s.armR, transformOrigin: '22px 22px',
          ...(m === 'clap' && { animation: `${id}SharkClapR 0.4s ease-in-out infinite` }) }}>
          <path d="M 22 22 L 27 23 L 24 27 Z" fill="#1a1a1a" stroke="#000" strokeWidth="1"/>
        </g>

        {/* Body dorsal fin */}
        <path d="M 15 17.5 L 12.5 10 L 17.5 10 Z" fill="#1a1a1a" stroke="#000" strokeWidth="0.9"/>

        {/* Head */}
        <ellipse cx="15" cy="17.5" rx="9.5" ry="7.5" fill="#607B8B" stroke="#2D4A5C" strokeWidth="1.2"/>
        <ellipse cx="15" cy="19.5" rx="8.5" ry="4.5" fill="#F0F8FF"/>

        {/* Head fin */}
        <path d="M 15 10 L 13 5 L 17 5 Z" fill="#2D4A5C" stroke="#1a1a1a" strokeWidth="0.8"/>

        {/* Eyes */}
        {m === 'sleep' ? (<>
          <path d="M 8.5 14.5 Q 10.5 16 12.5 14.5" fill="none" stroke="#2D4A5C" strokeWidth="1.1" strokeLinecap="round"/>
          <path d="M 17.5 14.5 Q 19.5 16 21.5 14.5" fill="none" stroke="#2D4A5C" strokeWidth="1.1" strokeLinecap="round"/>
        </>) : m === 'surprise' ? (<>
          {/* Yeux ronds écarquillés */}
          <circle cx="10.5" cy="15.5" r="2.8" fill="white"/>
          <circle cx="19.5" cy="15.5" r="2.8" fill="white"/>
          <circle cx="10.5" cy="15.2" r="1.6" fill="#1a1a1a"/>
          <circle cx="19.5" cy="15.2" r="1.6" fill="#1a1a1a"/>
          <circle cx="11.1" cy="14.7" r="0.55" fill="white"/>
          <circle cx="20.1" cy="14.7" r="0.55" fill="white"/>
        </>) : m === 'victory' || m === 'cheer' || m === 'clap' ? (<>
          {/* Yeux en arc — joie */}
          <path d="M 8.5 15.8 Q 10.5 13.5 12.5 15.8" fill="none" stroke="#2D4A5C" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M 17.5 15.8 Q 19.5 13.5 21.5 15.8" fill="none" stroke="#2D4A5C" strokeWidth="1.3" strokeLinecap="round"/>
        </>) : m === 'kiss' ? (<>
          <circle cx="10.5" cy="15.5" r="2.2" fill="white"/>
          <circle cx="19.5" cy="15.5" r="2.2" fill="white"/>
          <circle cx="10.5" cy="15.5" r="1.2" fill="#1a1a1a"/>
          <circle cx="19.5" cy="15.5" r="1.2" fill="#1a1a1a"/>
          <circle cx="10.8" cy="15" r="0.45" fill="white"/>
          <circle cx="19.8" cy="15" r="0.45" fill="white"/>
        </>) : (<>
          {/* Yeux normaux — avec regard gauche/droite pour hésitation */}
          <circle cx="10.5" cy="15.5" r="2.2" fill="white"/>
          <g style={m === 'think' ? { animation: `${id}SharkEyeShift 1.4s ease-in-out infinite` } : { animation: blink, transformOrigin: '10.5px 15.5px' }}>
            <circle cx="10.5" cy="15.5" r="1.4" fill="#1a1a1a"/>
            <circle cx="11.3" cy="14.7" r="0.55" fill="white"/>
          </g>
          <circle cx="19.5" cy="15.5" r="2.2" fill="white"/>
          <g style={m === 'think' ? { animation: `${id}SharkEyeShift 1.4s ease-in-out infinite` } : { animation: blink, transformOrigin: '19.5px 15.5px' }}>
            <circle cx="19.5" cy="15.5" r="1.4" fill="#1a1a1a"/>
            <circle cx="20.3" cy="14.7" r="0.55" fill="white"/>
          </g>
        </>)}

        {/* Mouth */}
        {m === 'kiss' ? (
          <circle cx="15" cy="20.8" r="1.2" fill="#ff7eb3" stroke="#e05a9a" strokeWidth="0.5"/>
        ) : m === 'surprise' ? (
          /* Bouche "O" arrondie — choc */
          <ellipse cx="15" cy="20.5" rx="2" ry="1.8" fill="#1a1a1a" stroke="#2D4A5C" strokeWidth="0.5"/>
        ) : m === 'victory' || m === 'cheer' || m === 'clap' ? (
          /* Grand sourire arc */
          <path d="M 11.5 19.5 Q 15 22.5 18.5 19.5" fill="none" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round"/>
        ) : (
          <path d="M 12.5 20 Q 15 21.5 17.5 20" fill="none" stroke="#1a1a1a" strokeWidth="1" strokeLinecap="round"/>
        )}

        {/* Bandana */}
        <rect x="10.5" y="10" width="9" height="3" rx="1.5" fill="#1565C0" stroke="#0D47A1" strokeWidth="0.7"/>
        <ellipse cx="10.5" cy="11.5" rx="1.5" ry="1.2" fill="#1565C0" stroke="#0D47A1" strokeWidth="0.6"/>
        <path d="M 9.5 10.8 Q 6 9 4 6"   fill="none" stroke="#1565C0" strokeWidth="1.5" strokeLinecap="round"/>
        <path d="M 9 12.2 Q 5.5 12 4 10" fill="none" stroke="#1565C0" strokeWidth="1.2" strokeLinecap="round"/>
      </g>
    </>
  );
}

// ─── CHARS MAP ───────────────────────────────────────────────────────────────
const CHARS = {
  panda:      CharPanda,
  fox:        CharFox,
  wolf:       CharWolf,
  tiger:      CharTiger,
  lion:       CharLion,
  eagle:      CharEagle,
  stormEagle: CharStormEagle,
  bear:       CharBear,
  shark:      CharShark,
  owl:        CharOwl,
  frog:       CharFrog,
  octopus:    CharOctopus,
  cat:        CharCat,
  dragon:     CharDragon,
  sharkNinja: CharSharkNinja,
  unicorn:    CharUnicorn,
  phoenix:    CharPhoenix,
  kraken:     CharKraken,
  fairy:      CharFairy,
  mermaid:    CharMermaid,
  ghost:      CharGhost,
  vampire:    CharVampire,
  skeleton:   CharSkeleton,
  witch:      CharWitch,
  knight:     CharKnight,
  archer:     CharArcher,
  ninja:      CharNinja,
  superhero:  CharSuperhero,
  viking:     CharViking,
  pirate:     CharPirate,
  samurai:    CharSamurai,
  robot:      CharRobot,
  alien:      CharAlien,
  astronaut:  CharAstronaut,
  cyborg:     CharCyborg,
  android:    CharAndroid,
  fire:       CharFire,
  water:      CharWater,
  thunder:    CharThunder,
  ice:        CharIce,
  wind:       CharWind,
  earth:      CharEarth,
  gamer:      CharGamer,
  rockstar:   CharRockstar,
  surfer:     CharSurfer,
  mushroom:   CharMushroom,
  cactus:     CharCactus,
  pizza:      CharPizza,
  clown:      CharClown,
  star:       CharStar,
  moon:       CharMoon,
  crystal:    CharCrystal,
};

// ─── MAIN EXPORT ─────────────────────────────────────────────────────────────
export default function CharacterSprite({ id = 'panda', mood = 'walk', size = 40, flip = false, glow = true }) {
  const h = Math.round(size * 4 / 3);
  const pid = `cs${id}`;
  const css = makeCss(pid);
  const moods = makeMoods(pid);
  const s = moods[mood] || moods.walk;
  const Char = CHARS[id] || CHARS.panda;
  const ei = 'ease-in-out';
  const blink = `${pid}Blink 3.5s ${ei} infinite`;

  return (
    <div style={{
      width: size,
      height: h,
      display: 'inline-block',
      flexShrink: 0,
      filter: glow
        ? 'drop-shadow(0 0 5px rgba(255,255,255,0.85)) drop-shadow(0 0 10px rgba(255,255,255,0.4))'
        : 'none',
      transform: flip ? 'scaleX(-1)' : 'none',
      position: 'relative',
    }}>
      <svg viewBox="0 0 30 40" width={size} height={h} xmlns="http://www.w3.org/2000/svg" overflow="visible">
        <defs><style>{css}</style></defs>
        <FloatingElements m={mood} id={pid} />
        <Char s={s} m={mood} id={pid} blink={blink} />
      </svg>
    </div>
  );
}

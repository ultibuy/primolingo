// CharacterSprite.jsx
// Props: id (string), mood='walk', size=40, flip=false, glow=true

function makeCss(id) {
  return `
    @keyframes ${id}Bounce      { 0%,100%{transform:translate(var(--walk-body-tx,0px), var(--walk-body-ty,0px)) rotate(var(--walk-body-tilt,0deg))}  50%{transform:translate(var(--walk-body-tx,0px), calc(var(--walk-body-ty,0px) - 2.5px)) rotate(var(--walk-body-tilt,0deg))} }
    @keyframes ${id}LegL        { 0%,100%{transform:rotate(-22deg)} 50%{transform:rotate(22deg)}  }
    @keyframes ${id}LegR        { 0%,100%{transform:rotate(22deg)}  50%{transform:rotate(-22deg)} }
    @keyframes ${id}ArmLWalk    { 0%,100%{transform:translate(var(--walk-armL-tx,0px), var(--walk-armL-ty,0px)) rotate(calc(var(--walk-armL-rot,0deg) - 15deg))} 50%{transform:translate(var(--walk-armL-tx,0px), var(--walk-armL-ty,0px)) rotate(calc(var(--walk-armL-rot,0deg) + 18deg))}  }
    @keyframes ${id}ArmRWalk    { 0%,100%{transform:translate(var(--walk-armR-tx,0px), var(--walk-armR-ty,0px)) rotate(calc(var(--walk-armR-rot,0deg) + 15deg))}  50%{transform:translate(var(--walk-armR-tx,0px), var(--walk-armR-ty,0px)) rotate(calc(var(--walk-armR-rot,0deg) - 18deg))} }
    @keyframes ${id}IdleBounce  { 0%,100%{transform:translate(var(--idle-body-tx,0px), var(--idle-body-ty,0px)) rotate(var(--idle-body-tilt,0deg))}  50%{transform:translate(var(--idle-body-tx,0px), calc(var(--idle-body-ty,0px) - 1px)) rotate(var(--idle-body-tilt,0deg))} }
    @keyframes ${id}Wave        { 0%,100%{transform:translate(var(--wave-armR-tx,0px), calc(var(--wave-armR-ty,0px) - 2px)) rotate(calc(var(--wave-armR-rot,0deg) - 110deg))} 50%{transform:translate(var(--wave-armR-tx,0px), calc(var(--wave-armR-ty,0px) - 2px)) rotate(calc(var(--wave-armR-rot,0deg) - 148deg))} }
    @keyframes ${id}ClapBounce  { 0%,100%{transform:translate(var(--clap-body-tx,0px), var(--clap-body-ty,0px)) rotate(var(--clap-body-tilt,0deg))}  50%{transform:translate(var(--clap-body-tx,0px), calc(var(--clap-body-ty,0px) - 1.5px)) rotate(var(--clap-body-tilt,0deg))} }
    @keyframes ${id}ClapL       { 0%,100%{transform:translate(var(--clap-armL-tx,0px), var(--clap-armL-ty,0px)) rotate(calc(var(--clap-armL-rot,0deg) + 15deg))}  50%{transform:translate(var(--clap-armL-tx,0px), var(--clap-armL-ty,0px)) rotate(calc(var(--clap-armL-rot,0deg) - 78deg))} }
    @keyframes ${id}ClapR       { 0%,100%{transform:translate(var(--clap-armR-tx,0px), var(--clap-armR-ty,0px)) rotate(calc(var(--clap-armR-rot,0deg) - 15deg))} 50%{transform:translate(var(--clap-armR-tx,0px), var(--clap-armR-ty,0px)) rotate(calc(var(--clap-armR-rot,0deg) + 78deg))}  }
    @keyframes ${id}KissSway    { 0%,100%{transform:translate(var(--kiss-body-tx,0px), var(--kiss-body-ty,0px)) rotate(calc(var(--kiss-body-tilt,0deg) - 2deg))} 50%{transform:translate(var(--kiss-body-tx,0px), calc(var(--kiss-body-ty,0px) - 1px)) rotate(calc(var(--kiss-body-tilt,0deg) + 2deg))} }
    @keyframes ${id}KissArmR    { 0%,100%{transform:translate(var(--kiss-armR-tx,0px), var(--kiss-armR-ty,0px)) rotate(calc(var(--kiss-armR-rot,0deg) - 20deg))} 50%{transform:translate(var(--kiss-armR-tx,0px), var(--kiss-armR-ty,0px)) rotate(calc(var(--kiss-armR-rot,0deg) - 12deg))} }
    @keyframes ${id}KissPucker  { 0%,100%{transform:scale(0.7)} 50%{transform:scale(1.15)} }
    @keyframes ${id}SleepBreathe{ 0%,100%{transform:translate(var(--sleep-body-tx,0px), var(--sleep-body-ty,0px)) rotate(calc(var(--sleep-body-tilt,0deg) - 8deg))} 50%{transform:translate(var(--sleep-body-tx,0px), calc(var(--sleep-body-ty,0px) + 1.5px)) rotate(calc(var(--sleep-body-tilt,0deg) - 8deg))} }
    @keyframes ${id}DanceSway   { 0%,100%{transform:translateX(-5px) rotate(-4deg)} 50%{transform:translateX(5px) rotate(4deg)} }
    @keyframes ${id}DanceArmL   { 0%,100%{transform:rotate(-90deg)} 50%{transform:rotate(-25deg)} }
    @keyframes ${id}DanceArmR   { 0%,100%{transform:rotate(25deg)}  50%{transform:rotate(90deg)} }
    @keyframes ${id}DanceLegL   { 0%,100%{transform:rotate(-15deg)} 50%{transform:rotate(5deg)} }
    @keyframes ${id}DanceLegR   { 0%,100%{transform:rotate(5deg)}   50%{transform:rotate(-15deg)} }
    @keyframes ${id}SurprisePop { 0%{transform:translate(var(--surprise-body-tx,0px), var(--surprise-body-ty,0px)) rotate(var(--surprise-body-tilt,0deg)) scale(1)} 18%{transform:translate(var(--surprise-body-tx,0px), calc(var(--surprise-body-ty,0px) - 8px)) rotate(var(--surprise-body-tilt,0deg)) scale(1.06)} 35%{transform:translate(var(--surprise-body-tx,0px), var(--surprise-body-ty,0px)) rotate(var(--surprise-body-tilt,0deg)) scale(0.94)} 50%{transform:translate(var(--surprise-body-tx,0px), calc(var(--surprise-body-ty,0px) - 3px)) rotate(var(--surprise-body-tilt,0deg)) scale(1)} 100%{transform:translate(var(--surprise-body-tx,0px), var(--surprise-body-ty,0px)) rotate(var(--surprise-body-tilt,0deg)) scale(1)} }
    @keyframes ${id}SurpArmL    { 0%,100%{transform:translate(var(--surprise-armL-tx,0px), calc(var(--surprise-armL-ty,0px) - 2px)) rotate(calc(var(--surprise-armL-rot,0deg) + 148deg))} }
    @keyframes ${id}SurpArmR    { 0%,100%{transform:translate(var(--surprise-armR-tx,0px), calc(var(--surprise-armR-ty,0px) - 2px)) rotate(calc(var(--surprise-armR-rot,0deg) - 148deg))} }
    @keyframes ${id}VicBounce   { 0%,100%{transform:translate(var(--victory-body-tx,0px), var(--victory-body-ty,0px)) rotate(var(--vic-body-tilt, 0deg))}  40%{transform:translate(var(--victory-body-tx,0px), calc(var(--victory-body-ty,0px) - 11px)) rotate(var(--vic-body-tilt, 0deg))} }
    @keyframes ${id}VicArmL     { 0%,100%{transform:translate(var(--vic-armL-tx, 0px), var(--vic-armL-ty, 0px)) rotate(var(--vic-armL-rot, -39deg))} 50%{transform:translate(var(--vic-armL-tx, 0px), var(--vic-armL-ty, 0px)) rotate(calc(var(--vic-armL-rot, -39deg) + 20deg))} }
    @keyframes ${id}VicArmR     { 0%,100%{transform:translate(var(--vic-armR-tx, 0px), var(--vic-armR-ty, 0px)) rotate(var(--vic-armR-rot, 28deg))}  50%{transform:translate(var(--vic-armR-tx, 0px), var(--vic-armR-ty, 0px)) rotate(calc(var(--vic-armR-rot, 28deg) - 20deg))} }
    @keyframes ${id}VicLegL     { 0%,100%{transform:rotate(-12deg)} 50%{transform:rotate(5deg)} }
    @keyframes ${id}VicLegR     { 0%,100%{transform:rotate(12deg)}  50%{transform:rotate(-5deg)} }
    @keyframes ${id}ThinkSway   { 0%,100%{transform:rotate(var(--think-body-tilt, 0deg)) translateY(0)} 50%{transform:rotate(var(--think-body-tilt, 0deg)) translateY(-1px)} }
    @keyframes ${id}ThinkArmR   { 0%,100%{transform:translate(var(--think-armR-tx, 0px), var(--think-armR-ty, 0px)) rotate(calc(var(--think-armR-rot, -55deg)))} 50%{transform:translate(var(--think-armR-tx, 0px), var(--think-armR-ty, 0px)) rotate(calc(var(--think-armR-rot, -55deg) + 5deg))} }
    @keyframes ${id}ChalAura    { 0%,100%{opacity:0.25; transform:scale(1)}   50%{opacity:0.55; transform:scale(1.12)} }
    @keyframes ${id}ChalSway    { 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-0.5px) rotate(1deg)} }
    @keyframes ${id}Blink       { 0%,90%,100%{transform:scaleY(1)} 95%{transform:scaleY(0.07)} }
    @keyframes ${id}Heart1 { 0%{transform:translate(0,0) scale(0.6);opacity:0} 15%{opacity:1} 100%{transform:translate(-8px,-36px) scale(1);opacity:0} }
    @keyframes ${id}Heart2 { 0%{transform:translate(0,0) scale(0.5);opacity:0} 25%{opacity:1} 100%{transform:translate(10px,-42px) scale(0.9);opacity:0} }
    @keyframes ${id}Zzz1 { 0%{transform:translate(0,0) scale(0.5);opacity:0} 20%{opacity:1} 100%{transform:translate(12px,-38px) scale(1.2);opacity:0} }
    @keyframes ${id}Zzz2 { 0%{transform:translate(0,0) scale(0.4);opacity:0} 20%{opacity:0.9} 100%{transform:translate(18px,-48px) scale(1);opacity:0} }
    @keyframes ${id}Spark { 0%,100%{transform:scale(0);opacity:0} 50%{transform:scale(1);opacity:1} }
    @keyframes ${id}Qmark { 0%{transform:translateY(0) scale(0.7);opacity:0} 25%{opacity:1} 85%{opacity:1} 100%{transform:translateY(-28px) scale(1);opacity:0} }
    @keyframes ${id}EyeRoll { 0%{transform:translate(0,-0.9px)} 12.5%{transform:translate(0.64px,-0.64px)} 25%{transform:translate(0.9px,0)} 37.5%{transform:translate(0.64px,0.64px)} 50%{transform:translate(0,0.9px)} 62.5%{transform:translate(-0.64px,0.64px)} 75%{transform:translate(-0.9px,0)} 87.5%{transform:translate(-0.64px,-0.64px)} 100%{transform:translate(0,-0.9px)} }

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

@keyframes ${id}FireAuraPulse { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.06)} }
    @keyframes ${id}NostrilGlow { 0%,100%{opacity:0.35} 50%{opacity:0.85} }

    @keyframes ${id}SharkAura { 0%,100%{opacity:0.7;transform:scale(1)} 50%{opacity:1;transform:scale(1.04)} }
    @keyframes ${id}SharkBolt { 0%,80%,100%{opacity:1} 85%{opacity:0.15} 90%{opacity:1} 95%{opacity:0.35} }
    @keyframes ${id}SharkParticle { 0%,100%{opacity:0.9} 50%{opacity:0.4} }
    @keyframes ${id}SharkClapL { 0%,100%{transform:rotate(-45deg)} 50%{transform:rotate(-72deg)} }
    @keyframes ${id}SharkClapR { 0%,100%{transform:rotate(45deg)}  50%{transform:rotate(72deg)} }
    @keyframes ${id}SharkEyeShift { 0%,100%{transform:translateX(-1.2px)} 50%{transform:translateX(1.2px)} }

    @keyframes ${id}LegSitL { 0%,100%{transform:rotate(-14deg)} 50%{transform:rotate(8deg)} }
    @keyframes ${id}LegSitR { 0%,100%{transform:rotate(14deg)}  50%{transform:rotate(-8deg)} }
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
      armL:  { animation: 'none', transform: 'translate(var(--wave-armL-tx,0px), var(--wave-armL-ty,0px)) rotate(var(--wave-armL-rot,0deg))', transformOrigin: '4px 18px' },
      armR:  { animation: `${id}Wave 0.55s ${ei} infinite`, transformOrigin: '26px 18px' },
      legL:  { animation: 'none', transformOrigin: '11px 30px' },
      legR:  { animation: 'none', transformOrigin: '19px 30px' },
    },
    clap: {
      body:  { animation: `${id}ClapBounce 0.42s ${ei} infinite`, transformOrigin: '15px 38px' },
      armL:  { animation: `${id}ClapL 0.42s ${ei} infinite`, transformOrigin: '5px 19px' },
      armR:  { animation: `${id}ClapR 0.42s ${ei} infinite`, transformOrigin: '25px 19px' },
      legL:  { animation: 'none', transformOrigin: '11px 30px' },
      legR:  { animation: 'none', transformOrigin: '19px 30px' },
    },
    kiss: {
      body:  { animation: `${id}KissSway 1.4s ${ei} infinite`, transformOrigin: '15px 38px' },
      armL:  { animation: 'none', transform: 'translate(var(--kiss-armL-tx,0px), var(--kiss-armL-ty,0px)) rotate(var(--kiss-armL-rot,0deg))', transformOrigin: '4px 18px' },
      armR:  { animation: `${id}KissArmR 1.4s ${ei} infinite`, transformOrigin: '26px 18px' },
      legL:  { animation: 'none', transformOrigin: '11px 30px' },
      legR:  { animation: 'none', transformOrigin: '19px 30px' },
    },
    sleep: {
      body:  { animation: `${id}SleepBreathe 2.2s ${ei} infinite`, transformOrigin: '15px 38px' },
      armL:  { animation: 'none', transform: 'translate(var(--sleep-armL-tx,0px), var(--sleep-armL-ty,0px)) rotate(var(--sleep-armL-rot,0deg))', transformOrigin: '4px 18px' },
      armR:  { animation: 'none', transform: 'translate(var(--sleep-armR-tx,0px), var(--sleep-armR-ty,0px)) rotate(var(--sleep-armR-rot,0deg))', transformOrigin: '26px 18px' },
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
      armL:  { animation: 'none', transform: 'translate(var(--think-armL-tx, 0px), var(--think-armL-ty, 0px)) rotate(var(--think-armL-rot, -58deg))', transformOrigin: '4px 17px' },
      armR:  { animation: `${id}ThinkArmR 2s ${ei} infinite`, transformOrigin: '24px 17px' },
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
    sit: {
      body:  { animation: 'none', transformOrigin: '15px 38px' },
      armL:  { animation: 'none', transform: 'rotate(-10deg)', transformOrigin: '4px 18px' },
      armR:  { animation: 'none', transform: 'rotate(10deg)', transformOrigin: '26px 18px' },
      legL:  { animation: `${id}LegSitL 1.8s ${ei} infinite`, transformOrigin: '11px 26px' },
      legR:  { animation: `${id}LegSitR 1.8s 0.5s ${ei} infinite`, transformOrigin: '19px 26px' },
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
// SleepEyes — paths "yeux fermés" réutilisables pour persos avec yeux inline custom.
// Centralise le pattern Q (arc en U) — modifie ici pour propager partout.
function SleepEyes({ lx, rx, y, color = '#111', strokeWidth = 1.2, dx = 2 }) {
  return (<>
    <path d={`M ${lx - dx} ${y} Q ${lx} ${y + 2} ${lx + dx} ${y}`} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    <path d={`M ${rx - dx} ${y} Q ${rx} ${y + 2} ${rx + dx} ${y}`} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
  </>);
}

function Eyes({ m, id, blink, lx=11, rx=19, y=11, r=2.2, color='#111', bg='white', joyColor }) {
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
  if (m === 'think') {
    const roll = `${id}EyeRoll 2.5s linear infinite`;
    return (<>
      <circle cx={lx} cy={y} r={r} fill={bg}/>
      <g style={{ animation: roll, transformOrigin: `${lx}px ${y}px` }}>
        <circle cx={lx} cy={y} r={r*0.5} fill={color}/>
        <circle cx={lx+r*0.18} cy={y-r*0.18} r={r*0.18} fill={bg}/>
      </g>
      <circle cx={rx} cy={y} r={r} fill={bg}/>
      <g style={{ animation: roll, transformOrigin: `${rx}px ${y}px` }}>
        <circle cx={rx} cy={y} r={r*0.5} fill={color}/>
        <circle cx={rx+r*0.18} cy={y-r*0.18} r={r*0.18} fill={bg}/>
      </g>
    </>);
  }
  if (m === 'clap' || m === 'victory') {
    // Happy arc eyes — joyful upturned curves
    const sw = Math.max(1.1, r * 0.55);
    const stroke = joyColor || color;
    return (<>
      <path d={`M${lx-r} ${y+r*0.3} Q${lx} ${y-r*0.9} ${lx+r} ${y+r*0.3}`}
        fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
      <path d={`M${rx-r} ${y+r*0.3} Q${rx} ${y-r*0.9} ${rx+r} ${y+r*0.3}`}
        fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/>
    </>);
  }
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

function KissLips({ id, cx=15, cy=16.5, r=1.6, fill='#f472b6', stroke, strokeWidth }) {
  return (
    <circle
      cx={cx} cy={cy} r={r} fill={fill} stroke={stroke} strokeWidth={strokeWidth}
      style={{
        animation: `${id}KissPucker 1.4s ease-in-out infinite`,
        transformOrigin: '50% 50%',
        transformBox: 'fill-box',
      }}
    />
  );
}

function Mouth({ m, color='#1a1a1a', id }) {
  if (m === 'kiss') return <KissLips id={id} cx={15} cy={17.5} r={1.6}/>;
  if (m === 'surprise') return <ellipse cx="15" cy="17" rx="2" ry="2.4" fill={color}/>;
  return <path d="M12.5 16.2 Q15 18.4 17.5 16.2" fill="none" stroke={color} strokeWidth="0.9" strokeLinecap="round"/>;
}

// MoodMouth — bouche configurable qui gère kiss / surprise / sleep / default (U-smile).
// Centralise le pattern dupliqué dans 17 persos. Chaque prop a un défaut sensé,
// mais peut être override par perso (cx, cy, couleurs, taille de la bouche surprise, etc.)
function MoodMouth({
  m, id,
  cx = 15, cy = 17.5,                  // centre de la bouche (default = position smile)
  smileColor = '#1a1a1a',              // couleur du U-smile
  smileWidth = 2.5,                    // demi-largeur du smile (smile va de cx-w à cx+w)
  smileDepth = 1.2,                    // profondeur du Q (cy + depth = bottom du smile)
  smileStroke = 0.9,                   // épaisseur du trait
  surpriseColor,                       // défaut = smileColor
  surpriseRx = 2, surpriseRy = 2.4,    // taille du O surpris
  surpriseDy = -0.5,                   // décalage Y du O (souvent légèrement au-dessus du smile)
  kissCy, kissR = 1.4,                 // override du centre Y et rayon des lèvres kiss
  kissFill, kissStroke, kissStrokeWidth,
  hideOnSleep = false,                 // si true, la bouche disparaît en mode sleep
  noSurprise = false,                  // si true, mode surprise tombe sur le smile (persos à bec)
}) {
  if (m === 'kiss') {
    return <KissLips id={id} cx={cx} cy={kissCy ?? cy} r={kissR}
      fill={kissFill} stroke={kissStroke} strokeWidth={kissStrokeWidth}/>;
  }
  if (m === 'surprise' && !noSurprise) {
    return <ellipse cx={cx} cy={cy + surpriseDy} rx={surpriseRx} ry={surpriseRy}
      fill={surpriseColor || smileColor}/>;
  }
  if (m === 'sleep' && hideOnSleep) return null;
  // U-smile par défaut. cy = bottom du smile (control point Y du Q),
  // smileDepth = distance verticale entre les ends et le control.
  return (
    <path
      d={`M${cx - smileWidth} ${cy - smileDepth} Q${cx} ${cy} ${cx + smileWidth} ${cy - smileDepth}`}
      fill="none" stroke={smileColor} strokeWidth={smileStroke} strokeLinecap="round"
    />
  );
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
      <Eyes m={m} id={id} blink={blink} lx={10.5} rx={19.5} y={11} bg="white" color="#111" joyColor="white"/>
      <ellipse cx="15" cy="14.5" rx="2.1" ry="1.4" fill="#1a1a1a"/>
      <g style={{
        transform: 'translateY(1.5px) scale(0.95)',
        transformOrigin: '15px 17px'
      }}>
        <Mouth m={m} id={id} color="#1a1a1a"/>
      </g>
    </g>
  );
}

// 2. FOX
function CharFox({ s, m, id, blink: _blink }) {
  const sleeping = m === 'sleep';
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

      {/* Bow tie — at neck line, BELOW head so it's not hidden */}
      <g style={{ transform: 'translateY(3.5px)' }}>
        {/* Left wing — trapezoid: wide outer, narrow toward knot */}
        <path d="M 10.5 17.8 L 14 19 L 14 20.6 L 10.5 21.8 Z" fill="#0a0a0a"/>
        {/* Right wing */}
        <path d="M 19.5 17.8 L 16 19 L 16 20.6 L 19.5 21.8 Z" fill="#0a0a0a"/>
        {/* Knot — central rounded band */}
        <rect x="13.7" y="18.6" width="2.6" height="2.4" rx="0.6" fill="#000"/>
        {/* Subtle highlight on knot */}
        <rect x="14" y="18.9" width="0.5" height="1.6" rx="0.25" fill="#2a2a2a"/>
      </g>

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
      {sleeping ? (
        <SleepEyes lx={11} rx={19} y={10.5} color="#111" strokeWidth={1.2} dx={2.5}/>
      ) : m === 'surprise' ? (<>
        {/* Sunglasses pushed up over eyebrows — surprised, glasses revealed */}
        <rect x="7.5" y="6.5" width="6" height="2.8" rx="1" fill="#111" opacity="0.85"/>
        <rect x="16.5" y="6.5" width="6" height="2.8" rx="1" fill="#111" opacity="0.85"/>
        <line x1="13.5" y1="7.9" x2="16.5" y2="7.9" stroke="#111" strokeWidth="1" strokeLinecap="round"/>
        {/* Wide surprised eyes below */}
        <circle cx="10.5" cy="11" r="2.3" fill="white"/>
        <circle cx="19.5" cy="11" r="2.3" fill="white"/>
        <circle cx="10.5" cy="11" r="1.4" fill="#111"/>
        <circle cx="19.5" cy="11" r="1.4" fill="#111"/>
        <circle cx="11.1" cy="10.4" r="0.5" fill="white"/>
        <circle cx="20.1" cy="10.4" r="0.5" fill="white"/>
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
      <MoodMouth m={m} id={id} cx={15} cy={21.5}
        smileColor="#111" smileWidth={2.5} smileDepth={2}
        surpriseRx={1.7} surpriseRy={2} surpriseDy={-1}
        kissCy={20} kissR={1.4}
      />
    </g>
  );
}

// 3. WOLF
function CharWolf({ s, m, id, blink: _blink }) {
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
        {m === 'sleep' ? (
          <SleepEyes lx={11} rx={19} y={10.5} color="#ddd6fe" strokeWidth={1.2} dx={2.5}/>
        ) : (m === 'clap' || m === 'victory') ? (<>
          {/* Joyful arc eyes — glowing purple */}
          <path d="M8.5 11.5 Q10.5 8.5 12.5 11.5" fill="none" stroke="#c4b5fd" strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M17.5 11.5 Q19.5 8.5 21.5 11.5" fill="none" stroke="#c4b5fd" strokeWidth="1.4" strokeLinecap="round"/>
        </>) : m === 'surprise' ? (<>
          {/* Wide spectral eyes — circular glow */}
          <circle cx="10.5" cy="10.5" r="3" fill="#8b5cf6" opacity="0.4"/>
          <circle cx="19.5" cy="10.5" r="3" fill="#8b5cf6" opacity="0.4"/>
          <circle cx="10.5" cy="10.5" r="2.5" fill="#ddd6fe"/>
          <circle cx="19.5" cy="10.5" r="2.5" fill="#ddd6fe"/>
          <circle cx="10.5" cy="10.5" r="1.4" fill="#4c1d95"/>
          <circle cx="19.5" cy="10.5" r="1.4" fill="#4c1d95"/>
          <circle cx="11.1" cy="10" r="0.5" fill="white"/>
          <circle cx="20.1" cy="10" r="0.5" fill="white"/>
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
        {m === 'surprise'
          ? <ellipse cx="15" cy="20.5" rx="1.7" ry="2" fill="#1e1b4b" stroke="#475569" strokeWidth="0.4"/>
          : <path d="M13.5,19.5 Q15,20.8 16.5,19.5" stroke="#475569" strokeWidth="0.8" fill="none" strokeLinecap="round"/>
        }
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
      {m === 'sleep' ? (
        <SleepEyes lx={11} rx={19} y={10} color="#1a1a1a" strokeWidth={1.2} dx={2.5}/>
      ) : m === 'surprise' ? (<>
        {/* Wide shocked eyes */}
        <circle cx="10.5" cy="10" r="2.8" fill="#fde047"/>
        <circle cx="19.5" cy="10" r="2.8" fill="#fde047"/>
        <circle cx="10.5" cy="10" r="1.7" fill="#1a1a1a"/>
        <circle cx="19.5" cy="10" r="1.7" fill="#1a1a1a"/>
        <circle cx="11.2" cy="9.4" r="0.55" fill="white"/>
        <circle cx="20.2" cy="9.4" r="0.55" fill="white"/>
      </>) : m === 'think' ? (<>
        {/* Eye-roll — pupil orbits inside the yellow eye */}
        <ellipse cx="10.5" cy="10" rx="2.8" ry="2" fill="#fde047" transform="rotate(-8,10.5,10)"/>
        <g style={{ animation: `${id}EyeRoll 2.5s linear infinite`, transformOrigin: '10.5px 10px' }}>
          <ellipse cx="10.5" cy="10" rx="1.4" ry="1.4" fill="#1a1a1a"/>
          <circle cx="11.0" cy="9.5" r="0.5" fill="white" opacity="0.85"/>
        </g>
        <ellipse cx="19.5" cy="10" rx="2.8" ry="2" fill="#fde047" transform="rotate(8,19.5,10)"/>
        <g style={{ animation: `${id}EyeRoll 2.5s linear infinite`, transformOrigin: '19.5px 10px' }}>
          <ellipse cx="19.5" cy="10" rx="1.4" ry="1.4" fill="#1a1a1a"/>
          <circle cx="20.0" cy="9.5" r="0.5" fill="white" opacity="0.85"/>
        </g>
      </>) : (<>
        <g style={{ animation: `${id}EyeZap 1s ${ei} infinite, ${blink}`, transformOrigin: '10.5px 10px' }}>
          <ellipse cx="10.5" cy="10" rx="2.8" ry="2" fill="#fde047" transform="rotate(-8,10.5,10)"/>
          <ellipse cx="10.5" cy="10" rx="1.4" ry="1.6" fill="#1a1a1a" transform="rotate(-8,10.5,10)"/>
          <circle cx="11.3" cy="9.2" r="0.6" fill="white" opacity="0.9"/>
        </g>
        <g style={{ animation: `${id}EyeZap 1s ${ei} 0.3s infinite, ${blink}`, transformOrigin: '19.5px 10px' }}>
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
      <g style={{
        transform: 'none',
        transformOrigin: '15px 18.5px'
      }}>
        <MoodMouth m={m} id={id} cx={15} cy={18.5}
          smileColor="#1a1a1a" smileWidth={2} smileDepth={1.5} smileStroke={1.2}
          surpriseRx={1.7} surpriseRy={2} surpriseDy={-0.7}
          kissCy={17.5} kissR={1.4}
        />
      </g>
    </g>
  );
}

// 5. LION
function CharLion({ s, m, id, blink }) {
  return (
    <>

      {/* ── Halo : Double Couronne (16 rayons + 2 anneaux) ── */}
      <circle cx="15" cy="18" r="20" fill="#fbbf24" fillOpacity="0.1"/>
      <circle cx="15" cy="18" r="18" fill="none" stroke="#fbbf24" strokeWidth="2.5" opacity="0.2"/>
      <line x1="15"   y1="2"    x2="15"   y2="-1.5" stroke="#f59e0b" strokeWidth="1.8" opacity="0.5"/>
      <line x1="21.1" y1="3.2"  x2="22.5" y2="0"    stroke="#f59e0b" strokeWidth="1.2" opacity="0.35"/>
      <line x1="26.3" y1="6.7"  x2="28.8" y2="4.2"  stroke="#f59e0b" strokeWidth="1.8" opacity="0.5"/>
      <line x1="29.8" y1="11.9" x2="33"   y2="10.5" stroke="#f59e0b" strokeWidth="1.2" opacity="0.35"/>
      <line x1="31"   y1="18"   x2="34.5" y2="18"   stroke="#f59e0b" strokeWidth="1.8" opacity="0.5"/>
      <line x1="29.8" y1="24.1" x2="33"   y2="25.5" stroke="#f59e0b" strokeWidth="1.2" opacity="0.35"/>
      <line x1="26.3" y1="29.3" x2="28.8" y2="31.8" stroke="#f59e0b" strokeWidth="1.8" opacity="0.5"/>
      <line x1="21.1" y1="32.8" x2="22.5" y2="36"   stroke="#f59e0b" strokeWidth="1.2" opacity="0.35"/>
      <line x1="15"   y1="34"   x2="15"   y2="37.5" stroke="#f59e0b" strokeWidth="1.8" opacity="0.5"/>
      <line x1="8.9"  y1="32.8" x2="7.5"  y2="36"   stroke="#f59e0b" strokeWidth="1.2" opacity="0.35"/>
      <line x1="3.7"  y1="29.3" x2="1.2"  y2="31.8" stroke="#f59e0b" strokeWidth="1.8" opacity="0.5"/>
      <line x1="0.2"  y1="24.1" x2="-3"   y2="25.5" stroke="#f59e0b" strokeWidth="1.2" opacity="0.35"/>
      <line x1="-1"   y1="18"   x2="-4.5" y2="18"   stroke="#f59e0b" strokeWidth="1.8" opacity="0.5"/>
      <line x1="0.2"  y1="11.9" x2="-3"   y2="10.5" stroke="#f59e0b" strokeWidth="1.2" opacity="0.35"/>
      <line x1="3.7"  y1="6.7"  x2="1.2"  y2="4.2"  stroke="#f59e0b" strokeWidth="1.8" opacity="0.5"/>
      <line x1="8.9"  y1="3.2"  x2="7.5"  y2="0"    stroke="#f59e0b" strokeWidth="1.2" opacity="0.35"/>
      <circle cx="15" cy="18" r="13.5" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.38"/>
      <circle cx="15" cy="18" r="11"   fill="#fbbf24" fillOpacity="0.12"/>
    <g style={s.body}>

      {/* ── Jambes (articulées) ── */}
      <g style={s.legL}>
        <rect x="7.5" y="29" width="6.5" height="10" rx="3" fill="#d97706"/>
        <ellipse cx="10.5" cy="38.5" rx="3.5" ry="1.8" fill="#b45309"/>
        <path d="M 8  37.5 L 7   40  L 9   38.8 Z" fill="#fbbf24"/>
        <path d="M 10 37.5 L 9.5 40  L 11  39   Z" fill="#fbbf24"/>
        <path d="M 12 37.5 L 12.5 40 L 11  39   Z" fill="#fbbf24"/>
      </g>
      <g style={s.legR}>
        <rect x="16" y="29" width="6.5" height="10" rx="3" fill="#d97706"/>
        <ellipse cx="19" cy="38.5" rx="3.5" ry="1.8" fill="#b45309"/>
        <path d="M 17 37.5 L 16   40  L 18  38.8 Z" fill="#fbbf24"/>
        <path d="M 19 37.5 L 18.5 40  L 20  39   Z" fill="#fbbf24"/>
        <path d="M 21 37.5 L 21.5 40  L 20  39   Z" fill="#fbbf24"/>
      </g>

      {/* ── Corps + queue + médaillon solaire ── */}
      <ellipse cx="15" cy="24" rx="8.5" ry="7.5" fill="#d97706"/>
      <ellipse cx="15" cy="25" rx="5.5" ry="6"   fill="#fef3c7"/>
      <path d="M 23 23 Q 28.5 20 29 14" fill="none" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="29" cy="12.5" r="2.5" fill="#fbbf24"/>
      {/* Médaillon */}
      <circle cx="15" cy="23" r="3.8" fill="#fbbf24"/>
      <circle cx="15" cy="23" r="2.8" fill="#f59e0b"/>
      <circle cx="15" cy="23" r="1.6" fill="#fef3c7"/>
      <line x1="15" y1="18.8" x2="15"  y2="18"  stroke="#fbbf24" strokeWidth="1.3"/>
      <line x1="15" y1="27.2" x2="15"  y2="28"  stroke="#fbbf24" strokeWidth="1.3"/>
      <line x1="10.8" y1="23" x2="10"  y2="23"  stroke="#fbbf24" strokeWidth="1.3"/>
      <line x1="19.2" y1="23" x2="20"  y2="23"  stroke="#fbbf24" strokeWidth="1.3"/>

      {/* ── Bras (articulés) ── */}
      <g style={s.armL}>
        <rect x="1.5" y="17" width="6" height="10" rx="3" fill="#d97706"/>
        <ellipse cx="4.5" cy="27" rx="3" ry="1.8" fill="#b45309"/>
      </g>
      <g style={s.armR}>
        <rect x="22.5" y="17" width="6" height="10" rx="3" fill="#d97706"/>
        <ellipse cx="25.5" cy="27" rx="3" ry="1.8" fill="#b45309"/>
      </g>

      {/* ── Crinière : 8 tufts-boules en couronne ── */}
      <circle cx="25.5" cy="11"  r="3.5" fill="#92400e"/>
      <circle cx="22"   cy="3.5" r="3.5" fill="#92400e"/>
      <circle cx="15"   cy="0.5" r="3.5" fill="#92400e"/>
      <circle cx="8"    cy="3.5" r="3.5" fill="#92400e"/>
      <circle cx="4.5"  cy="11"  r="3.5" fill="#92400e"/>
      <circle cx="8"    cy="18.5" r="3.5" fill="#92400e"/>
      <circle cx="15"   cy="21.5" r="3.5" fill="#92400e"/>
      <circle cx="22"   cy="18.5" r="3.5" fill="#92400e"/>

      {/* ── Oreilles (dépassent au-dessus de la crinière) ── */}
      <circle cx="9.5"  cy="2" r="2" fill="#92400e" stroke="#78350f" strokeWidth="0.8"/>
      <circle cx="9.5"  cy="2" r="1" fill="#fef3c7"/>
      <circle cx="20.5" cy="2" r="2" fill="#92400e" stroke="#78350f" strokeWidth="0.8"/>
      <circle cx="20.5" cy="2" r="1" fill="#fef3c7"/>

      {/* ── Tête principale ── */}
      <circle cx="15" cy="11" r="9.5" fill="#d97706"/>

      {/* ── Museau + truffe + moustaches + joues ── */}
      <ellipse cx="15" cy="15.5" rx="5.8" ry="3.8" fill="#fef3c7"/>
      <ellipse cx="15" cy="14.2" rx="1.4" ry="1"   fill="#1f2937"/>
      <line x1="9.5"  y1="14"   x2="4.5"  y2="13"   stroke="#1f2937" strokeWidth="1" strokeLinecap="round"/>
      <line x1="9.5"  y1="15.5" x2="4"    y2="15.5"  stroke="#1f2937" strokeWidth="1" strokeLinecap="round"/>
      <line x1="20.5" y1="14"   x2="25.5"  y2="13"   stroke="#1f2937" strokeWidth="1" strokeLinecap="round"/>
      <line x1="20.5" y1="15.5" x2="26"    y2="15.5"  stroke="#1f2937" strokeWidth="1" strokeLinecap="round"/>
      <circle cx="8.5"  cy="14.5" r="2.8" fill="#f97316" fillOpacity="0.22"/>
      <circle cx="21.5" cy="14.5" r="2.8" fill="#f97316" fillOpacity="0.22"/>

      {/* ── Yeux CUSTOM (grands, avec blink / sleep / surprise) ── */}
      {m === 'sleep' ? (
        <SleepEyes lx={11} rx={19} y={9} color="#111" strokeWidth={1.3} dx={2.6}/>
      ) : m === 'surprise' ? (<>
        <circle cx="11" cy="9" r="3.2" fill="white"/>
        <circle cx="11" cy="9" r="1.9" fill="#1f2937"/>
        <circle cx="11.8" cy="8.2" r="0.7" fill="white"/>
        <circle cx="19"  cy="9" r="3.2" fill="white"/>
        <circle cx="19"  cy="9" r="1.9" fill="#1f2937"/>
        <circle cx="19.8" cy="8.2" r="0.7" fill="white"/>
      </>) : m === 'think' ? (<>
        <circle cx="11" cy="9" r="2.6" fill="white" stroke="#1f2937" strokeWidth="1"/>
        <g style={{ animation: `${id}EyeRoll 2.5s linear infinite`, transformOrigin: '11px 9px' }}>
          <circle cx="11" cy="9" r="1.5" fill="#1f2937"/>
          <circle cx="11.5" cy="8.5" r="0.6" fill="white"/>
        </g>
        <circle cx="19" cy="9" r="2.6" fill="white" stroke="#1f2937" strokeWidth="1"/>
        <g style={{ animation: `${id}EyeRoll 2.5s linear infinite`, transformOrigin: '19px 9px' }}>
          <circle cx="19" cy="9" r="1.5" fill="#1f2937"/>
          <circle cx="19.5" cy="8.5" r="0.6" fill="white"/>
        </g>
      </>) : (<>
        <g style={{ animation: blink, transformOrigin: "11px 9px" }}>
          <circle cx="11"   cy="9" r="2.6" fill="white" stroke="#1f2937" strokeWidth="1"/>
          <circle cx="11"   cy="9" r="1.5" fill="#1f2937"/>
          <circle cx="11.7" cy="8.3" r="0.7" fill="white"/>
        </g>
        <g style={{ animation: blink, transformOrigin: "19px 9px" }}>
          <circle cx="19"   cy="9" r="2.6" fill="white" stroke="#1f2937" strokeWidth="1"/>
          <circle cx="19"   cy="9" r="1.5" fill="#1f2937"/>
          <circle cx="19.7" cy="8.3" r="0.7" fill="white"/>
        </g>
      </>)}

      {/* ── Bouche CUSTOM (U-smile dans le museau, avec kiss / surprise) ── */}
      <g style={{
        transform: 'translateY(-1px) scale(0.8)',
        transformOrigin: '15px 20px'
      }}>
        <MoodMouth m={m} id={id} cx={15} cy={20}
          smileColor="#1f2937" smileWidth={3} smileDepth={2.5} smileStroke={1.3}
          surpriseRx={2.2} surpriseRy={2.6} surpriseDy={-1.5}
          kissCy={18} kissR={1.6}
        />
      </g>

      {/* ── Couronne (au-dessus de la crinière, zone front) ── */}
      <path d="M 9 -2.5 Q 15 -4 21 -2.5 L 21 -1 Q 15 -2.5 9 -1 Z" fill="#f59e0b"/>
      <path d="M 9   -2.5 L 9.5  -7   L 11  -2.5 Z" fill="#fbbf24"/>
      <path d="M 12  -3   L 12.5 -8   L 14  -3   Z" fill="#fbbf24"/>
      <path d="M 13.5 -3  L 15   -10  L 16.5 -3  Z" fill="#fbbf24"/>
      <path d="M 16  -3   L 17.5 -8   L 18  -3   Z" fill="#fbbf24"/>
      <path d="M 19  -2.5 L 20.5 -7   L 21  -2.5 Z" fill="#fbbf24"/>
      <circle cx="10.2" cy="-5.5" r="0.7" fill="#fef3c7"/>
      <circle cx="13.2" cy="-6.5" r="0.7" fill="#fef3c7"/>
      <circle cx="15"   cy="-8"   r="1"   fill="#fef3c7"/>
      <circle cx="17.8" cy="-6.5" r="0.7" fill="#fef3c7"/>
      <circle cx="19.8" cy="-5.5" r="0.7" fill="#fef3c7"/>

    </g>
    </>
  );
}

function CharBear({ s, m, id, blink }) {
  const sleeping = m === 'sleep';
  const happy    = m === 'clap' || m === 'victory';

  return (
    <>
      {/* Nordic sun-wheel halo — static background */}
      <circle cx="15" cy="20" r="17" fill="#c89010" opacity="0.12"/>
      <circle cx="15" cy="20" r="17" fill="none" stroke="#d4a020" strokeWidth="1.4" opacity="0.6"/>
      <circle cx="15" cy="20" r="12" fill="none" stroke="#d4a020" strokeWidth="0.9" opacity="0.4"/>
      <line x1="15" y1="3"   x2="15"   y2="37"   stroke="#d4a020" strokeWidth="1.3" opacity="0.55"/>
      <line x1="-2" y1="20"  x2="32"   y2="20"   stroke="#d4a020" strokeWidth="1.3" opacity="0.55"/>
      <line x1="3.4" y1="8.4"  x2="26.6" y2="31.6" stroke="#8090a0" strokeWidth="1.0" opacity="0.45"/>
      <line x1="26.6" y1="8.4" x2="3.4"  y2="31.6" stroke="#8090a0" strokeWidth="1.0" opacity="0.45"/>
      <circle cx="15" cy="20" r="2.8" fill="#f5c840" opacity="0.65"/>
      <circle cx="15" cy="20" r="1.4" fill="#fff8d0" opacity="0.7"/>

      <g style={s.body}>
        {/* Legs */}
        <g style={s.legL}>
          <rect x="7.5" y="29" width="7" height="9" rx="3.2" fill="#c8762a"/>
          <rect x="7"   y="34.5" width="8" height="4" rx="2" fill="#8b4a10"/>
        </g>
        <g style={s.legR}>
          <rect x="15.5" y="29" width="7" height="9" rx="3.2" fill="#c8762a"/>
          <rect x="15"   y="34.5" width="8" height="4" rx="2" fill="#8b4a10"/>
        </g>

        {/* Body + armor bands + belt */}
        <rect x="6" y="16" width="18" height="15" rx="6" fill="#c8762a"/>
        <ellipse cx="15" cy="22" rx="5.5" ry="5.5" fill="#f5d5a0" opacity="0.9"/>
        <rect x="8"  y="18" width="14" height="1.5" rx="0.7" fill="#606878" opacity="0.6"/>
        <rect x="9"  y="21" width="12" height="1.5" rx="0.7" fill="#606878" opacity="0.5"/>
        <rect x="10" y="24" width="10" height="1.5" rx="0.7" fill="#606878" opacity="0.4"/>
        <rect x="7"  y="27" width="16" height="2.5" rx="1.2" fill="#3a1c08"/>
        <rect x="14" y="26.3" width="2" height="3.8" rx="0.4" fill="#c89020"/>

        {/* Shield — armL */}
        <g style={s.armL}>
          <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#c8762a"/>
          <rect x="1"   y="23" width="6" height="4" rx="2"   fill="#8b4a10"/>
          {m !== 'clap' && m !== 'wave' && m !== 'surprise' && (<>
          <circle cx="2" cy="21" r="6.5" fill="#8b4a10"/>
          <circle cx="2" cy="21" r="6.5" fill="none" stroke="#c89020" strokeWidth="1.4"/>
          <line x1="-4.5" y1="21" x2="8.5" y2="21" stroke="#6a3408" strokeWidth="1.0" opacity="0.5"/>
          <line x1="2" y1="14.5" x2="2" y2="27.5" stroke="#6a3408" strokeWidth="1.0" opacity="0.5"/>
          <circle cx="2" cy="21" r="3"   fill="none" stroke="#c89020" strokeWidth="0.9" opacity="0.6"/>
          <circle cx="2" cy="21" r="2"   fill="#c89020" opacity="0.75"/>
          <circle cx="2" cy="21" r="1.1" fill="#f5d060"/>
          </>)}
        </g>

        {/* Ears — static, drawn before head */}
        <circle cx="7"  cy="4" r="3.8" fill="#8b4a10"/>
        <circle cx="7"  cy="4" r="2.8" fill="#c8762a"/>
        <circle cx="7"  cy="4" r="1.4" fill="#f5d5a0" opacity="0.7"/>
        <circle cx="23" cy="4" r="3.8" fill="#8b4a10"/>
        <circle cx="23" cy="4" r="2.8" fill="#c8762a"/>
        <circle cx="23" cy="4" r="1.4" fill="#f5d5a0" opacity="0.7"/>

        {/* Head */}
        <circle cx="15" cy="11.5" r="10.5" fill="#c8762a"/>
        <ellipse cx="15" cy="15.5" rx="5.5" ry="4"   fill="#f5d5a0"/>
        <ellipse cx="15" cy="13"   rx="2.2" ry="1.4"  fill="#2a0e04"/>

        {/* Helmet horns (drawn before dome so dome covers base) */}
        <path d="M7 8 Q5 3 2 -1 Q4 1 6 5 Q7 7 8 8 Z"   fill="#dde0e8"/>
        <path d="M7 8 Q5 3 2 -1 Q4 1 6 5 Q7 7 8 8 Z"   fill="none" stroke="#a0a8b8" strokeWidth="0.7"/>
        <path d="M23 8 Q25 3 28 -1 Q26 1 24 5 Q23 7 22 8 Z" fill="#dde0e8"/>
        <path d="M23 8 Q25 3 28 -1 Q26 1 24 5 Q23 7 22 8 Z" fill="none" stroke="#a0a8b8" strokeWidth="0.7"/>

        {/* Helmet dome + nasal */}
        <path d="M6 8 Q6 1.5 15 1 Q24 1.5 24 8 Z" fill="#606878"/>
        <rect x="5.5" y="6.5" width="19" height="3.5" rx="1.5" fill="#707888"/>
        <rect x="5"   y="6.5" width="20" height="1.4"  rx="0.7"  fill="#c89020"/>
        <rect x="13.5" y="7"  width="3"  height="5.5"  rx="1.5"  fill="#606878"/>

        {/* Eyes — mood variants */}
        {sleeping ? (
          <SleepEyes lx={10.5} rx={19.5} y={10} color="#1a0a02" strokeWidth={1.1} dx={2}/>
        ) : happy ? (<>
          <path d="M8.5 11 Q10.5 9 12.5 11" fill="none" stroke="#1a0a02" strokeWidth="1.2" strokeLinecap="round"/>
          <path d="M17.5 11 Q19.5 9 21.5 11" fill="none" stroke="#1a0a02" strokeWidth="1.2" strokeLinecap="round"/>
        </>) : m === 'surprise' ? (<>
          <circle cx="10.5" cy="10.5" r="2.8" fill="white"/>
          <circle cx="10.5" cy="10.5" r="1.8" fill="#1a0a02"/>
          <circle cx="11.2" cy="9.8"  r="0.6" fill="white"/>
          <circle cx="19.5" cy="10.5" r="2.8" fill="white"/>
          <circle cx="19.5" cy="10.5" r="1.8" fill="#1a0a02"/>
          <circle cx="20.2" cy="9.8"  r="0.6" fill="white"/>
        </>) : m === 'think' ? (<>
          <circle cx="10.5" cy="10.5" r="2.2" fill="white"/>
          <g style={{ animation: `${id}EyeRoll 2.5s linear infinite`, transformOrigin: '10.5px 10.5px' }}>
            <circle cx="10.5" cy="10.5" r="1.3" fill="#1a0a02"/>
            <circle cx="11.0" cy="10.0" r="0.45" fill="white" opacity="0.85"/>
          </g>
          <circle cx="19.5" cy="10.5" r="2.2" fill="white"/>
          <g style={{ animation: `${id}EyeRoll 2.5s linear infinite`, transformOrigin: '19.5px 10.5px' }}>
            <circle cx="19.5" cy="10.5" r="1.3" fill="#1a0a02"/>
            <circle cx="20.0" cy="10.0" r="0.45" fill="white" opacity="0.85"/>
          </g>
        </>) : (<>
          <g style={{ animation: blink, transformOrigin: '10.5px 10.5px' }}>
            <circle cx="10.5" cy="10.5" r="2.2" fill="white"/>
            <circle cx="10.5" cy="10.5" r="1.4" fill="#1a0a02"/>
            <circle cx="11.2" cy="9.8"  r="0.5" fill="white" opacity="0.9"/>
          </g>
          <g style={{ animation: blink, transformOrigin: '19.5px 10.5px' }}>
            <circle cx="19.5" cy="10.5" r="2.2" fill="white"/>
            <circle cx="19.5" cy="10.5" r="1.4" fill="#1a0a02"/>
            <circle cx="20.2" cy="9.8"  r="0.5" fill="white" opacity="0.9"/>
          </g>
        </>)}

        {/* Mouth — mood variants */}
        {m === 'kiss' ? (
          <KissLips id={id} cx={15} cy={18} r={1.4}/>
        ) : m === 'surprise' ? (
          <ellipse cx="15" cy="18" rx="2" ry="2.2" fill="#2a0e04"/>
        ) : happy ? (
          <path d="M11.5 17 Q15 20.5 18.5 17" fill="none" stroke="#2a0e04" strokeWidth="1.2" strokeLinecap="round"/>
        ) : (
          <path d="M12.5 17.5 Q15 19.5 17.5 17.5" fill="none" stroke="#2a0e04" strokeWidth="1.1" strokeLinecap="round"/>
        )}

        {/* Right arm + axe — drawn last so axe is always in front */}
        <g style={s.armR}>
          <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#c8762a"/>
          <rect x="23"   y="23" width="6" height="4" rx="2"   fill="#8b4a10"/>
          {m !== 'clap' && m !== 'wave' && m !== 'surprise' && (
            <g transform={m === 'think' ? 'rotate(52 26 23)' : undefined}>
              {/* Axe handle */}
              <rect x="25.5" y="15" width="2.5" height="14" rx="1.2" fill="#8b5a28"/>
              <rect x="25.2" y="26" width="3"   height="1.6"  rx="0.8" fill="#6a3a10"/>
              {/* Axe blade */}
              <path d="M25.5 16 L21.5 13.5 Q18 17 20.5 21.5 L25.5 20 Z" fill="#1a1a1a"/>
              <path d="M21.5 13.5 Q18 17 20.5 21.5" fill="none" stroke="#b0b8c0" strokeWidth="1.2" strokeLinecap="round"/>
              <circle cx="25.3" cy="18" r="0.75" fill="#d4a020"/>
            </g>
          )}
        </g>
      </g>
    </>
  );
}

function CharOwlWitch({ s, m, id, blink }) {
  const eyeEl = m === 'sleep' || m === 'surprise' || m === 'think'
    ? <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} r={2.5} color="#1a0800" bg="#d4900a"/>
    : (
      <>
        <circle cx={11} cy={11} r={3.2} fill="white" style={{ animation: blink, transformOrigin: '11px 11px' }}/>
        <circle cx={11} cy={11.2} r={2.2} fill="#d4900a"/>
        <circle cx={11} cy={11.2} r={1.3} fill="#1a0800"/>
        <circle cx={11.8} cy={10.3} r={0.55} fill="white" opacity={0.9}/>
        <circle cx={11} cy={11} r={3.2} fill="none" stroke="#8b5a18" strokeWidth={0.8}/>
        <circle cx={19} cy={11} r={3.2} fill="white" style={{ animation: blink, transformOrigin: '19px 11px' }}/>
        <circle cx={19} cy={11.2} r={2.2} fill="#d4900a"/>
        <circle cx={19} cy={11.2} r={1.3} fill="#1a0800"/>
        <circle cx={19.8} cy={10.3} r={0.55} fill="white" opacity={0.9}/>
        <circle cx={19} cy={11} r={3.2} fill="none" stroke="#8b5a18" strokeWidth={0.8}/>
      </>
    );
  return (
    <>
      {/* Golden mandala halo */}
      <circle cx={15} cy={20} r={17} fill="#c89010" opacity={0.1}/>
      <circle cx={15} cy={20} r={17} fill="none" stroke="#d4a020" strokeWidth={1.2} opacity={0.35}/>
      <circle cx={15} cy={20} r={13} fill="none" stroke="#d4a020" strokeWidth={0.8} opacity={0.22}/>
      <line x1={15} y1={3} x2={15} y2={6.5} stroke="#e8c030" strokeWidth={1.4} opacity={0.55}/>
      <line x1={15} y1={33.5} x2={15} y2={37} stroke="#e8c030" strokeWidth={1.4} opacity={0.55}/>
      <line x1={-2} y1={20} x2={1.5} y2={20} stroke="#e8c030" strokeWidth={1.4} opacity={0.55}/>
      <line x1={28.5} y1={20} x2={32} y2={20} stroke="#e8c030" strokeWidth={1.4} opacity={0.55}/>
      <line x1={3.5} y1={9.5} x2={6} y2={12} stroke="#e8c030" strokeWidth={1.1} opacity={0.45}/>
      <line x1={26.5} y1={9.5} x2={24} y2={12} stroke="#e8c030" strokeWidth={1.1} opacity={0.45}/>
      <line x1={3.5} y1={30.5} x2={6} y2={28} stroke="#e8c030" strokeWidth={1.1} opacity={0.45}/>
      <line x1={26.5} y1={30.5} x2={24} y2={28} stroke="#e8c030" strokeWidth={1.1} opacity={0.45}/>
      <circle cx={15} cy={20} r={2.5} fill="#f5c840" opacity={0.4}/>
      {/* Tail */}
      <path d="M10 33 Q15 38 20 33 Q17 30 15 31 Q13 30 10 33 Z" fill="#7a4e18"/>
      <line x1={15} y1={31} x2={15} y2={37} stroke="#5a3808" strokeWidth={0.9} opacity={0.5}/>
      <line x1={12} y1={31} x2={11} y2={36} stroke="#5a3808" strokeWidth={0.8} opacity={0.4}/>
      <line x1={18} y1={31} x2={19} y2={36} stroke="#5a3808" strokeWidth={0.8} opacity={0.4}/>
      <g style={s.body}>
        <g style={s.legL}>
          <rect x={8.5} y={29} width={5.5} height={6} rx={2.5} fill="#c8882a"/>
          <path d="M8 34 L6.5 37 M10 34.5 L9.5 37.5 M12 35 L12 37.5" fill="none" stroke="#7a4e10" strokeWidth={1.3} strokeLinecap="round"/>
        </g>
        <g style={s.legR}>
          <rect x={16} y={29} width={5.5} height={6} rx={2.5} fill="#c8882a"/>
          <path d="M16 34 L15 37 M18 34.5 L17.5 37.5 M20 35 L20 37.5" fill="none" stroke="#7a4e10" strokeWidth={1.3} strokeLinecap="round"/>
        </g>
        <rect x={7} y={17} width={16} height={14} rx={7} fill="#a06828"/>
        <ellipse cx={15} cy={23} rx={5} ry={5.5} fill="#e8c888" opacity={0.85}/>
        <rect x={9} y={19} width={12} height={1.3} rx={0.6} fill="#7a4e18" opacity={0.35}/>
        <rect x={9.5} y={22} width={11} height={1.3} rx={0.6} fill="#7a4e18" opacity={0.3}/>
        <rect x={10} y={25} width={10} height={1.3} rx={0.6} fill="#7a4e18" opacity={0.25}/>
        <rect x={8} y={28} width={14} height={2} rx={1} fill="#d4a020"/>
        <rect x={13.5} y={27.5} width={3} height={3} rx={0.5} fill="#f5c840"/>
        <g style={s.armL}>
          <rect x={0} y={17} width={8} height={10} rx={4} fill="#8b5a20"/>
          <path d="M0 23 Q-2 26 1 27.5" fill="#6a3e10"/>
          <path d="M2 25 Q1 28 4 28.5" fill="#6a3e10"/>
          <path d="M4.5 26.5 Q4 29 6.5 29" fill="#6a3e10"/>
        </g>
        <g style={s.armR}>
          <rect x={22} y={17} width={8} height={10} rx={4} fill="#8b5a20"/>
          <path d="M30 23 Q32 26 29 27.5" fill="#6a3e10"/>
          <path d="M28 25 Q29 28 26 28.5" fill="#6a3e10"/>
          <path d="M25.5 26.5 Q26 29 23.5 29" fill="#6a3e10"/>
          {m !== 'clap' && m !== 'wave' && m !== 'surprise' && (
            <g transform={m === 'think' ? 'rotate(52 26 23)' : undefined}>
              {/* Magic wand */}
              <rect x={28.2} y={11} width={1.3} height={9} rx={0.65} fill="#3a1a08"/>
              <path d="M27 10 L28.85 9 L30.7 10 L30 11.8 L27.7 11.8 Z" fill="#f5c840"/>
              <circle cx={28.85} cy={10} r={0.6} fill="white" opacity={0.7}/>
            </g>
          )}
        </g>
        {/* Ear tufts */}
        <path d="M9 5.5 Q8 0.5 11.5 3 Q11 5 10 6 Z" fill="#7a4e18"/>
        <path d="M21 5.5 Q22 0.5 18.5 3 Q19 5 20 6 Z" fill="#7a4e18"/>
        {/* Head */}
        <circle cx={15} cy={11.5} r={10.5} fill="#a06828"/>
        <ellipse cx={15} cy={12} rx={8} ry={8.5} fill="#e8c888" opacity={0.9}/>
        <path d="M13 14 L17 14 Q17 15.8 15 18.5 Q13 15.8 13 14 Z" fill="#c89020"/>
        <g style={{
          transform: 'translateY(2px) scale(0.65)',
          transformOrigin: '15px 17.8px'
        }}>
          <MoodMouth m={m} id={id} cx={15} cy={17.8}
            smileColor="#8b6010" smileWidth={1.5} smileDepth={2} smileStroke={0.8}
            kissCy={17} kissR={1.4}
          />
        </g>
        {eyeEl}
        {/* Witch hat */}
        <path d="M5.5 6 L15 -7.5 L24.5 6 Z" fill="#2a1860"/>
        <rect x={5.5} y={5} width={19} height={2} rx={0.6} fill="#1a0a40"/>
        <path d="M15 -5 L15.6 -3.2 L17.5 -3.2 L16 -2.1 L16.7 -0.3 L15 -1.3 L13.3 -0.3 L14 -2.1 L12.5 -3.2 L14.4 -3.2 Z" fill="#f5c840" opacity={0.9}/>
      </g>
    </>
  );
}

// 9c. CAT DETECTIVE (Chat Détective)
function CharCatDetective({ s, m, id, blink }) {
  return (
    <>
      {/* Green radar halo */}
      <circle cx={15} cy={20} r={16} fill="#001a0d" opacity={0.3}/>
      <circle cx={15} cy={20} r={16} fill="none" stroke="#22c55e" strokeWidth={1.5} opacity={0.3}/>
      <circle cx={15} cy={20} r={12} fill="none" stroke="#22c55e" strokeWidth={1.2} opacity={0.38}/>
      <circle cx={15} cy={20} r={8}  fill="none" stroke="#22c55e" strokeWidth={1}   opacity={0.45}/>
      <circle cx={15} cy={20} r={4.5} fill="none" stroke="#4ade80" strokeWidth={0.9} opacity={0.55}/>
      <line x1={15} y1={4}  x2={15}  y2={36}  stroke="#22c55e" strokeWidth={0.8} opacity={0.18}/>
      <line x1={-1} y1={20} x2={31}  y2={20}  stroke="#22c55e" strokeWidth={0.8} opacity={0.18}/>
      <line x1={3.5} y1={8.5} x2={26.5} y2={31.5} stroke="#22c55e" strokeWidth={0.7} opacity={0.13}/>
      <line x1={26.5} y1={8.5} x2={3.5} y2={31.5} stroke="#22c55e" strokeWidth={0.7} opacity={0.13}/>
      <path d="M15 20 L15 4"     stroke="#4ade80" strokeWidth={1.5} strokeLinecap="round" opacity={0.55}/>
      <path d="M15 20 L26.5 8.5" stroke="#4ade80" strokeWidth={1.3} strokeLinecap="round" opacity={0.35}/>
      <path d="M15 20 L31 20"    stroke="#4ade80" strokeWidth={1.2} strokeLinecap="round" opacity={0.2}/>
      <circle cx={20.5} cy={10.5} r={1.2} fill="#4ade80" opacity={0.75}/>
      <circle cx={6}    cy={16}   r={0.9} fill="#4ade80" opacity={0.55}/>
      <circle cx={23}   cy={25}   r={0.7} fill="#4ade80" opacity={0.45}/>
      <g style={s.body}>
        {/* Tail — starts at bottom-right of body (y=31) */}
        <path d="M20 31 Q30 27 29 19 Q28 12 24 17" stroke="#111" strokeWidth={3.5} fill="none" strokeLinecap="round"/>
        <path d="M20 31 Q30 27 29 19 Q28 12 24 17" stroke="#333" strokeWidth={1.8} fill="none" strokeLinecap="round"/>
        <g style={s.legL}>
          <rect x={7.5}  y={29} width={7} height={9} rx={3.2} fill="#111"/>
          <rect x={7}    y={35} width={8} height={4} rx={2.5} fill="#e8e8e8"/>
        </g>
        <g style={s.legR}>
          <rect x={15.5} y={29} width={7} height={9} rx={3.2} fill="#111"/>
          <rect x={15}   y={35} width={8} height={4} rx={2.5} fill="#e8e8e8"/>
        </g>
        {/* Tuxedo body */}
        <rect x={6} y={16} width={18} height={15} rx={6} fill="#111"/>
        <ellipse cx={15} cy={23} rx={5.5} ry={6} fill="white" opacity={0.95}/>
        <rect x={10.5} y={16.5} width={9} height={2} rx={1} fill="#222" opacity={0.6}/>
        {/* Left arm */}
        <g style={s.armL}>
          <rect x={1.5} y={17} width={5} height={9} rx={2.5} fill="#111"/>
          <rect x={1}   y={23} width={6} height={4} rx={2.5} fill="white" opacity={0.9}/>
        </g>
        {/* Right arm extended horizontal + magnifying glass */}
        <g style={s.armR}>
          {(m === 'clap' || m === 'wave' || m === 'surprise') ? (
            // Standard vertical paw for clap/wave/surprise (drop the magnifier prop)
            <>
              <rect x={23.5} y={17} width={5} height={9} rx={2.5} fill="#111"/>
              <rect x={23}   y={23} width={6} height={4} rx={2.5} fill="white" opacity={0.95}/>
            </>
          ) : (<g transform={m === 'think' ? 'rotate(52 26 22)' : undefined}>
          <rect x={23.5} y={17} width={5} height={5.5} rx={2.5} fill="#111"/>
          <rect x={25} y={19.5} width={9} height={5} rx={2.5} fill="#111"/>
          {/* Paw behind handle */}
          <rect x={31} y={18.5} width={5.5} height={5} rx={2.2} fill="white" opacity={0.95}/>
          {/* Lens frame */}
          <circle cx={32.5} cy={7.5} r={5.8} fill="none" stroke="#92400e" strokeWidth={2.5}/>
          <circle cx={32.5} cy={7.5} r={5.3} fill="#fef3c7" opacity={0.18}/>
          <circle cx={32.5} cy={7.5} r={3.8} fill="none" stroke="#d97706" strokeWidth={0.9} opacity={0.4}/>
          <path d="M29.8 5 Q30.8 4 32.5 4.5" fill="none" stroke="white" strokeWidth={1.4} strokeLinecap="round" opacity={0.8}/>
          <circle cx={30.5} cy={6.5} r={0.7} fill="white" opacity={0.55}/>
          {/* Connector ring */}
          <rect x={30.3} y={12.8} width={4.4} height={2.2} rx={1.1} fill="#b45309"/>
          <rect x={30.8} y={13.1} width={3.4} height={1.5} rx={0.7} fill="#d97706" opacity={0.6}/>
          {/* Wooden handle */}
          <rect x={30.7} y={14.8} width={3.8} height={7.5} rx={1.9} fill="#5c3010"/>
          <rect x={31.2} y={14.8} width={2.8} height={7.5} rx={1.4} fill="#a0622a" opacity={0.85}/>
          <line x1={30.7} y1={16.5} x2={34.5} y2={16.5} stroke="#3d1a00" strokeWidth={0.7} opacity={0.4}/>
          <line x1={30.7} y1={18.5} x2={34.5} y2={18.5} stroke="#3d1a00" strokeWidth={0.7} opacity={0.4}/>
          <line x1={30.7} y1={20.5} x2={34.5} y2={20.5} stroke="#3d1a00" strokeWidth={0.7} opacity={0.35}/>
          <line x1={31.7} y1={15} x2={31.7} y2={22} stroke="#d4a06a" strokeWidth={0.6} strokeLinecap="round" opacity={0.5}/>
          {/* Paw over handle */}
          <rect x={31} y={18.5} width={5.5} height={5} rx={2.2} fill="white" opacity={0.97}/>
          <rect x={31} y={22.5} width={5.5} height={1.2} rx={0.6} fill="#ddd" opacity={0.5}/>
          </g>)}
        </g>
        {/* Cat ears */}
        <polygon points="4,11 7.5,-1 13,10.5"      fill="#0d0d0d"/>
        <polygon points="5.5,11 7.5,1.5 12,10.5"   fill="#111"/>
        <polygon points="7,10.5 8,4.5 10.5,10.5"   fill="#f9a8c9" opacity={0.7}/>
        <polygon points="17,10.5 22.5,-1 26,11"    fill="#0d0d0d"/>
        <polygon points="18,10.5 22.5,1.5 24.5,10.5" fill="#111"/>
        <polygon points="19.5,10.5 21.5,4.5 23,10.5" fill="#f9a8c9" opacity={0.7}/>
        {/* Head */}
        <circle cx={15} cy={11.5} r={10.5} fill="#111"/>
        <ellipse cx={15} cy={18}   rx={5}   ry={3.5} fill="white"  opacity={0.95}/>
        <ellipse cx={15} cy={15.5} rx={5}   ry={4}   fill="#f5f0e8"/>
        <ellipse cx={15} cy={14.5} rx={1.7} ry={1.2} fill="#111"/>
        <ellipse cx={15} cy={10}   rx={4}   ry={2.5} fill="white"  opacity={0.08}/>
        {/* Whiskers */}
        <line x1={4}    y1={14}   x2={10.5} y2={15}   stroke="white" strokeWidth={0.9} strokeLinecap="round" opacity={0.9}/>
        <line x1={4.5}  y1={15.8} x2={10.5} y2={15.8} stroke="white" strokeWidth={0.9} strokeLinecap="round" opacity={0.9}/>
        <line x1={5}    y1={17.5} x2={10.5} y2={16.8} stroke="white" strokeWidth={0.8} strokeLinecap="round" opacity={0.7}/>
        <line x1={19.5} y1={15}   x2={26}   y2={14}   stroke="white" strokeWidth={0.9} strokeLinecap="round" opacity={0.9}/>
        <line x1={19.5} y1={15.8} x2={25.5} y2={15.8} stroke="white" strokeWidth={0.9} strokeLinecap="round" opacity={0.9}/>
        <line x1={19.5} y1={16.8} x2={25}   y2={17.5} stroke="white" strokeWidth={0.8} strokeLinecap="round" opacity={0.7}/>
        {/* Green eyes */}
        <Eyes m={m} id={id} blink={blink} lx={10.5} rx={19.5} y={10.5} r={2.8} color="#111" bg="#16a34a" joyColor="#16a34a"/>
        {/* Mouth */}
        {m === 'kiss'
          ? <KissLips id={id} cx={15} cy={17} r={1.4}/>
          : m === 'surprise'
          ? <ellipse cx={15} cy={17.3} rx={1.4} ry={1.7} fill="#1a1a1a"/>
          : (m === 'clap' || m === 'victory')
          ? <path d="M12.8 16.8 Q15 19.4 17.2 16.8 Q15 18.2 12.8 16.8 Z" fill="#1a1a1a" stroke="#1a1a1a" strokeWidth={0.5} strokeLinejoin="round"/>
          : <path d="M13 17.5 Q15 19 17 17.5" fill="none" stroke="#333" strokeWidth={1} strokeLinecap="round"/>
        }
        {/* Fedora */}
        <ellipse cx={15} cy={2.5} rx={12.5} ry={2.8} fill="#1a1a1a"/>
        <rect x={9.8} y={-8} width={10.4} height={11} rx={2.5} fill="#1a1a1a"/>
        <rect x={9.8} y={-8} width={10.4} height={1.5} rx={1.2} fill="#111"/>
        <rect x={9.8} y={0.5} width={10.4} height={2.5} rx={0.5} fill="#6b4c2a"/>
        <rect x={19}  y={0.8} width={2.5}  height={2}   rx={0.5} fill="#4a3320"/>
        <rect x={19.5} y={1.3} width={1.5} height={1}   rx={0.3} fill="#7c5a38"/>
        <ellipse cx={5} cy={3.8} rx={4} ry={1.5} fill="#222" transform="rotate(-15 5 3.8)"/>
      </g>
    </>
  );
}

// 9e. TURTLE NOMAD (Tortue Nomade)
function CharTurtleNomad({ s, m, id, blink }) {
  const sleeping = m === 'sleep';
  return (
    <>
      {/* Dust trail */}
      <ellipse cx={15} cy={37} rx={13} ry={1.6} fill="#a8a29e" opacity={0.25}/>
      <circle cx={3} cy={36} r={1.3} fill="#d6d3d1" opacity={0.5}/>
      <circle cx={27} cy={36} r={1.1} fill="#d6d3d1" opacity={0.4}/>
      <circle cx={5.5} cy={34.5} r={0.7} fill="#e7e5e4" opacity={0.45}/>
      <g style={s.body}>
        <g style={s.legL}>
          <rect x={7.5} y={29} width={6.5} height={8} rx={2.5} fill="#65a30d"/>
          <ellipse cx={10.5} cy={37} rx={3.5} ry={1.5} fill="#3f6212"/>
        </g>
        <g style={s.legR}>
          <rect x={16} y={29} width={6.5} height={8} rx={2.5} fill="#65a30d"/>
          <ellipse cx={19.5} cy={37} rx={3.5} ry={1.5} fill="#3f6212"/>
        </g>
        {/* Shell — backpack on back */}
        <ellipse cx={15} cy={22.5} rx={11} ry={9} fill="#854d0e"/>
        <ellipse cx={15} cy={22.5} rx={9} ry={7} fill="#a16207"/>
        {/* Hexagon shell pattern */}
        <path d="M15 17 L18 19 L18 23 L15 25 L12 23 L12 19 Z" fill="none" stroke="#451a03" strokeWidth={0.7} opacity={0.7}/>
        <path d="M9 19 L11.5 20.5 L11.5 23 L9 24.5 L7 23 L7 21 Z" fill="none" stroke="#451a03" strokeWidth={0.6} opacity={0.6}/>
        <path d="M21 19 L23 21 L23 23 L21 24.5 L18.5 23 L18.5 20.5 Z" fill="none" stroke="#451a03" strokeWidth={0.6} opacity={0.6}/>
        <path d="M15 25 L17 26.5 L15 28 L13 26.5 Z" fill="none" stroke="#451a03" strokeWidth={0.6} opacity={0.55}/>
        {/* Strap */}
        <path d="M5 19 Q15 14 25 19" fill="none" stroke="#78350f" strokeWidth={1.2} opacity={0.8}/>
        {/* Bedroll on top */}
        <rect x={8} y={13.5} width={14} height={2.5} rx={1.2} fill="#dc2626"/>
        <line x1={11} y1={13.5} x2={11} y2={16} stroke="#7f1d1d" strokeWidth={0.5}/>
        <line x1={19} y1={13.5} x2={19} y2={16} stroke="#7f1d1d" strokeWidth={0.5}/>
        <g style={s.armL}>
          <rect x={1.5} y={17} width={5} height={9} rx={2.5} fill="#65a30d"/>
        </g>
        <g style={s.armR}>
          <rect x={23.5} y={17} width={5} height={9} rx={2.5} fill="#65a30d"/>
          {m !== 'clap' && m !== 'wave' && m !== 'surprise' && (
            <g transform={m === 'think' ? 'rotate(52 26 23)' : undefined}>
              {/* Walking stick — gnarled wood */}
              <path d="M27 4 Q26 8 27.2 12 Q26 18 27.5 24 Q26.5 28 27 30" fill="none" stroke="#78350f" strokeWidth={1.4} strokeLinecap="round"/>
              <circle cx={26.5} cy={4.5} r={1.3} fill="#92400e"/>
              <circle cx={26.5} cy={4.5} r={0.5} fill="#451a03"/>
              <path d="M28 9 L29 8 L28.5 10 Z" fill="#78350f"/>
            </g>
          )}
        </g>
        {/* Head */}
        <ellipse cx={15} cy={11} rx={8} ry={8} fill="#84cc16"/>
        <ellipse cx={15} cy={12.5} rx={6.5} ry={6} fill="#bef264" opacity={0.7}/>
        {/* Headscarf */}
        <path d="M5.5 7 Q15 0 24.5 7 L24.5 11 Q15 7.5 5.5 11 Z" fill="#0c4a6e"/>
        <path d="M22 7 Q26 8 27 14 Q24 11 22 11 Z" fill="#0c4a6e"/>
        <path d="M5.5 8 L24.5 8" stroke="#075985" strokeWidth={0.4} opacity={0.6}/>
        {/* Yellow stripe headscarf */}
        <path d="M6 9.5 L24 9.5" stroke="#fbbf24" strokeWidth={0.6}/>
        <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11.5} color="#111" bg={sleeping ? '#111' : 'white'}/>
        {/* Beak */}
        {/* Beak */}
        <path d="M13 14.5 L17 14.5 L15 17 Z" fill="#a16207"/>
        <g style={{
          transform: 'translateY(-0.25px) scale(0.6)',
          transformOrigin: '15px 18.5px'
        }}>
          <MoodMouth m={m} id={id} cx={15} cy={18.5}
            smileColor="#451a03" smileWidth={2} smileDepth={1.3} smileStroke={0.8}
            kissR={1.2} kissCy={17.5}
            hideOnSleep
          />
        </g>
      </g>
    </>
  );
}

// 9g. RACCOON HACKER (Raton Hackeur)
function CharRaccoonHacker({ s, m, id, blink }) {
  const sleeping = m === 'sleep';
  const visorGlow = sleeping ? '#1f2937' : '#22d3ee';
  return (
    <>
      {/* Cyber grid floor */}
      <line x1={0} y1={37} x2={30} y2={37} stroke="#22d3ee" strokeWidth={0.4} opacity={0.4}/>
      <line x1={5} y1={36} x2={25} y2={36} stroke="#22d3ee" strokeWidth={0.3} opacity={0.3}/>
      {/* Floating code particles */}
      <text x={2} y={8} fontSize={2.5} fill="#22d3ee" opacity={0.6} fontFamily="monospace">01</text>
      <text x={26} y={6} fontSize={2.5} fill="#a78bfa" opacity={0.55} fontFamily="monospace">10</text>
      <text x={28} y={20} fontSize={2.2} fill="#22d3ee" opacity={0.5} fontFamily="monospace">{`{}`}</text>
      <circle cx={3} cy={20} r={0.5} fill="#22d3ee" opacity={0.6}/>
      <circle cx={27} cy={26} r={0.5} fill="#a78bfa" opacity={0.5}/>
      <g style={s.body}>
        <g style={s.legL}>
          <rect x={7.5} y={29} width={7} height={9} rx={3} fill="#3f3f46"/>
          <rect x={7.5} y={35} width={7} height={3} rx={1} fill="#18181b"/>
        </g>
        <g style={s.legR}>
          <rect x={15.5} y={29} width={7} height={9} rx={3} fill="#3f3f46"/>
          <rect x={15.5} y={35} width={7} height={3} rx={1} fill="#18181b"/>
        </g>
        {/* Hoodie body */}
        <rect x={6} y={16} width={18} height={15} rx={6} fill="#18181b"/>
        {/* Hoodie pocket */}
        <path d="M9 23 L21 23 L20 28 L10 28 Z" fill="#27272a"/>
        <line x1={11} y1={23} x2={11} y2={28} stroke="#0a0a0a" strokeWidth={0.4}/>
        <line x1={19} y1={23} x2={19} y2={28} stroke="#0a0a0a" strokeWidth={0.4}/>
        {/* Drawstrings */}
        <line x1={13} y1={17} x2={13} y2={22} stroke="#71717a" strokeWidth={0.5}/>
        <line x1={17} y1={17} x2={17} y2={22} stroke="#71717a" strokeWidth={0.5}/>
        <circle cx={13} cy={22.3} r={0.5} fill="#52525b"/>
        <circle cx={17} cy={22.3} r={0.5} fill="#52525b"/>
        <g style={s.armL}>
          <rect x={1.5} y={17} width={5} height={9} rx={2.5} fill="#18181b"/>
          <rect x={1.5} y={24} width={5} height={2.5} rx={1} fill="#27272a"/>
        </g>
        <g style={s.armR}>
          <rect x={23.5} y={17} width={5} height={9} rx={2.5} fill="#18181b"/>
          <rect x={23.5} y={24} width={5} height={2.5} rx={1} fill="#27272a"/>
          {m !== 'clap' && m !== 'wave' && m !== 'surprise' && (
            <g transform={m === 'think' ? 'rotate(52 26 23)' : undefined}>
              {/* Mini laptop */}
              <rect x={24.5} y={11} width={5} height={3.5} rx={0.4} fill="#3f3f46"/>
              <rect x={24.7} y={11.2} width={4.6} height={3.1} rx={0.3} fill={visorGlow}/>
              <rect x={25} y={11.5} width={4} height={0.4} fill="#0a0a0a"/>
              <rect x={25} y={12.3} width={3} height={0.4} fill="#0a0a0a"/>
              <rect x={25} y={13.1} width={3.5} height={0.4} fill="#0a0a0a"/>
              <rect x={24.3} y={14.5} width={5.4} height={0.5} rx={0.2} fill="#52525b"/>
            </g>
          )}
        </g>
        {/* Pointed raccoon ears (under hood) */}
        <polygon points="7.5,3 9,-2 12,2" fill="#3f3f46"/>
        <polygon points="18,2 21,-2 22.5,3" fill="#3f3f46"/>
        {/* Head — fur grey */}
        <circle cx={15} cy={11.5} r={10.5} fill="#71717a"/>
        {/* Hood drape over top of head */}
        <path d="M3.5 8 Q15 -3 26.5 8 Q24 4 15 4 Q6 4 3.5 8 Z" fill="#0a0a0a"/>
        <path d="M3.5 8 Q5 13 7 14" fill="#0a0a0a"/>
        <path d="M26.5 8 Q25 13 23 14" fill="#0a0a0a"/>
        {/* Face cheeks pale */}
        <ellipse cx={11} cy={14} rx={3.5} ry={3} fill="#d4d4d8"/>
        <ellipse cx={19} cy={14} rx={3.5} ry={3} fill="#d4d4d8"/>
        {/* Cyber visor — replaces eyes when not sleeping/think */}
        {(m !== 'sleep' && m !== 'think' && m !== 'kiss') ? (
          <>
            <rect x={6.5} y={9} width={17} height={4.5} rx={2} fill="#0a0a0a"/>
            <rect x={7} y={9.5} width={16} height={3.5} rx={1.5} fill={visorGlow} opacity={0.85}/>
            <rect x={8} y={10.2} width={2.5} height={0.6} fill="#fafafa" opacity={0.9}/>
            <rect x={19.5} y={11.6} width={2.5} height={0.6} fill="#fafafa" opacity={0.9}/>
            <rect x={11.5} y={11} width={1.5} height={0.5} fill="#a78bfa" opacity={0.85}/>
            <rect x={16} y={10.4} width={1.5} height={0.5} fill="#a78bfa" opacity={0.85}/>
          </>
        ) : (
          <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg={sleeping ? '#111' : 'white'}/>
        )}
        {/* Snout */}
        <ellipse cx={15} cy={16} rx={3} ry={2} fill="#e4e4e7"/>
        <ellipse cx={15} cy={15} rx={1} ry={0.7} fill="#0a0a0a"/>
        <g style={{
          transform: 'translateY(-1px) scale(0.8)',
          transformOrigin: '15px 20px'
        }}>
          <MoodMouth m={m} id={id} cx={15} cy={20}
            smileColor="#0a0a0a" smileWidth={2} smileDepth={1.5} smileStroke={0.8}
            kissCy={20} kissR={1.2}
            hideOnSleep
          />
        </g>
      </g>
    </>
  );
}

// 9h. SPY PENGUIN (Pingouin Espion)
function CharSpyPenguin({ s, m, id, blink }) {
  const sleeping = m === 'sleep';
  return (
    <>
      {/* Spotlight beam */}
      <path d="M15 0 L8 38 L22 38 Z" fill="#fef3c7" opacity={0.06}/>
      {/* Crosshair reticle */}
      <circle cx={26} cy={6} r={2.2} fill="none" stroke="#dc2626" strokeWidth={0.5} opacity={0.5}/>
      <line x1={26} y1={3.5} x2={26} y2={8.5} stroke="#dc2626" strokeWidth={0.4} opacity={0.5}/>
      <line x1={23.5} y1={6} x2={28.5} y2={6} stroke="#dc2626" strokeWidth={0.4} opacity={0.5}/>
      <g style={s.body}>
        <g style={s.legL}>
          <rect x={8} y={29} width={6} height={5} rx={2} fill="#0a0a0a"/>
          <ellipse cx={11} cy={36} rx={4.5} ry={1.8} fill="#f59e0b"/>
        </g>
        <g style={s.legR}>
          <rect x={16} y={29} width={6} height={5} rx={2} fill="#0a0a0a"/>
          <ellipse cx={19} cy={36} rx={4.5} ry={1.8} fill="#f59e0b"/>
        </g>
        {/* Body — black tuxedo back */}
        <ellipse cx={15} cy={22} rx={10} ry={11} fill="#0a0a0a"/>
        {/* White belly */}
        <ellipse cx={15} cy={23} rx={6.5} ry={9} fill="#fafafa"/>
        {/* Tuxedo lapels */}
        <path d="M10 17 L15 22 L9 22 Z" fill="#0a0a0a"/>
        <path d="M20 17 L15 22 L21 22 Z" fill="#0a0a0a"/>
        {/* Bowtie */}
        <path d="M12 18.5 L15 20 L18 18.5 L18 21 L15 19.5 L12 21 Z" fill="#dc2626"/>
        <rect x={14.6} y={19.3} width={0.8} height={1.2} fill="#7f1d1d"/>
        {/* Pocket square */}
        <rect x={10.5} y={20} width={1.6} height={1.6} fill="#fafafa"/>
        <path d="M10.7 20 L11.9 20 L11.3 21.5 Z" fill="#dc2626"/>
        <g style={s.armL}>
          <ellipse cx={4} cy={21} rx={2.8} ry={5} fill="#0a0a0a"/>
        </g>
        <g style={s.armR}>
          <ellipse cx={26} cy={21} rx={2.8} ry={5} fill="#0a0a0a"/>
          {m !== 'clap' && m !== 'wave' && m !== 'surprise' && (
            <g transform={m === 'think' ? 'rotate(52 26 23)' : undefined}>
              {/* Briefcase */}
              <rect x={24.2} y={9} width={5.5} height={5} rx={0.5} fill="#451a03"/>
              <rect x={24.2} y={9.5} width={5.5} height={4} rx={0.4} fill="#78350f"/>
              <line x1={24.2} y1={11} x2={29.7} y2={11} stroke="#fbbf24" strokeWidth={0.4}/>
              <rect x={26.5} y={11.5} width={1} height={0.7} rx={0.1} fill="#fbbf24"/>
              <rect x={26.7} y={7.5} width={0.6} height={1.6} rx={0.2} fill="#451a03"/>
              <rect x={25.7} y={8.4} width={2.6} height={0.7} rx={0.3} fill="#451a03"/>
            </g>
          )}
        </g>
        {/* Head */}
        <circle cx={15} cy={11.5} r={9} fill="#0a0a0a"/>
        {/* White face mask */}
        <ellipse cx={15} cy={13} rx={6.5} ry={5.5} fill="#fafafa"/>
        {/* Fedora hat */}
        <ellipse cx={15} cy={3.5} rx={11} ry={1.5} fill="#1c1917"/>
        <path d="M8 -3 L22 -3 L21 3.5 L9 3.5 Z" fill="#1c1917"/>
        <rect x={8} y={2.5} width={14} height={1.2} fill="#dc2626"/>
        <rect x={8} y={2.5} width={14} height={0.4} fill="#7f1d1d"/>
        {/* Sunglasses on always except surprise (lifted) and sleep (closed eyes) */}
        {sleeping ? (
          <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={11} color="#111" bg="#111"/>
        ) : m === 'surprise' ? (
          <>
            {/* Sunglasses pushed up to forehead */}
            <rect x={7} y={5.5} width={7} height={2.8} rx={1} fill="#0a0a0a"/>
            <rect x={16} y={5.5} width={7} height={2.8} rx={1} fill="#0a0a0a"/>
            <line x1={14} y1={6.9} x2={16} y2={6.9} stroke="#0a0a0a" strokeWidth={1}/>
            {/* Wide surprised eyes below */}
            <circle cx={11} cy={11} r={2.3} fill="white"/>
            <circle cx={19} cy={11} r={2.3} fill="white"/>
            <circle cx={11} cy={11} r={1.4} fill="#111"/>
            <circle cx={19} cy={11} r={1.4} fill="#111"/>
            <circle cx={11.6} cy={10.4} r={0.5} fill="white"/>
            <circle cx={19.6} cy={10.4} r={0.5} fill="white"/>
          </>
        ) : (
          <>
            <rect x={7} y={9.5} width={7} height={3.5} rx={1.5} fill="#0a0a0a"/>
            <rect x={16} y={9.5} width={7} height={3.5} rx={1.5} fill="#0a0a0a"/>
            <line x1={14} y1={11} x2={16} y2={11} stroke="#0a0a0a" strokeWidth={0.6}/>
            <rect x={8} y={10} width={2.5} height={1} fill="#fafafa" opacity={0.5}/>
            <rect x={17} y={10} width={2.5} height={1} fill="#fafafa" opacity={0.5}/>
          </>
        )}
        {/* Earpiece */}
        <circle cx={23.5} cy={12} r={0.9} fill="#fbbf24"/>
        <line x1={23.5} y1={12.5} x2={22.5} y2={15} stroke="#a3a3a3" strokeWidth={0.4}/>
        {/* Beak */}
        <path d="M13 15 L17 15 L15 18 Z" fill="#f59e0b"/>
        <g style={{
          transform: 'translateY(-0.75px) scale(0.6)',
          transformOrigin: '15px 19px'
        }}>
          <MoodMouth m={m} id={id} cx={15} cy={19}
            smileColor="#451a03" smileWidth={1.5} smileDepth={1} smileStroke={0.7}
            kissCy={18.5} kissR={1.2}
            hideOnSleep
          />
        </g>
      </g>
    </>
  );
}

function CharDragon({ s, m, id, blink }) {
  const sleeping  = m === 'sleep';
  const surprised = m === 'surprise';
  const kissing   = m === 'kiss';
  const showFlame = !kissing && !surprised && !sleeping;

  return (
    <g style={s.body}>

      {/* ── Ailes bat-wing (P1 — pointe vive, derrière tout) ── */}
      {/* Aile gauche */}
      <path d="M 7 17 Q 0 11 -4 6 Q -8 2 -11 1 Q -10 7 -9 13 Q -7 21 -4 27 Q -1 31 4 31 Q 6 25 7 17 Z"
        fill="#8b1a1a" opacity="0.9"/>
      <path d="M 7 17 Q 0 11 -4 6 Q -8 2 -11 1"
        fill="none" stroke="#5c0e0e" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="7" y1="17" x2="-8" y2="9"  stroke="#5c0e0e" strokeWidth="1.1" opacity="0.85"/>
      <line x1="7" y1="17" x2="-6" y2="19" stroke="#5c0e0e" strokeWidth="1"   opacity="0.8"/>
      <line x1="7" y1="17" x2="-3" y2="28" stroke="#5c0e0e" strokeWidth="0.9" opacity="0.75"/>
      <path d="M 7 17 Q 3 13 -2 9 Q -4 14 -3 22 Q -1 28 4 31 Q 6 25 7 17 Z"
        fill="#c0392b" opacity="0.18"/>

      {/* Aile droite */}
      <path d="M 23 17 Q 30 11 34 6 Q 38 2 41 1 Q 40 7 39 13 Q 37 21 34 27 Q 31 31 26 31 Q 24 25 23 17 Z"
        fill="#8b1a1a" opacity="0.9"/>
      <path d="M 23 17 Q 30 11 34 6 Q 38 2 41 1"
        fill="none" stroke="#5c0e0e" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="23" y1="17" x2="38" y2="9"  stroke="#5c0e0e" strokeWidth="1.1" opacity="0.85"/>
      <line x1="23" y1="17" x2="36" y2="19" stroke="#5c0e0e" strokeWidth="1"   opacity="0.8"/>
      <line x1="23" y1="17" x2="33" y2="28" stroke="#5c0e0e" strokeWidth="0.9" opacity="0.75"/>
      <path d="M 23 17 Q 27 13 32 9 Q 34 14 33 22 Q 31 28 26 31 Q 24 25 23 17 Z"
        fill="#c0392b" opacity="0.18"/>

      {/* Queue */}
      <path d="M 21 30 Q 29 26 28 35 Q 26 41 21 38 Q 24 35 22 32 Z" fill="#b91c1c"/>

      {/* ── Jambes ── */}
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#dc2626"/>
        <rect x="8" y="33" width="6" height="2.5" rx="1" fill="#991b1b" opacity="0.6"/>
        <path d="M 10.5 37.5 L 10.3 38.8 M 13 37.5 L 13.2 38.8"
          stroke="#fbbf24" strokeWidth="0.85" strokeLinecap="round"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#dc2626"/>
        <rect x="16" y="33" width="6" height="2.5" rx="1" fill="#991b1b" opacity="0.6"/>
        <path d="M 17 37.5 L 16.8 38.8 M 21.5 37.5 L 21.7 38.8"
          stroke="#fbbf24" strokeWidth="0.85" strokeLinecap="round"/>
      </g>

      {/* ── Corps ── */}
      <rect x="6" y="16" width="18" height="15" rx="6" fill="#dc2626"/>
      <ellipse cx="15" cy="23" rx="5" ry="5.5" fill="#f97316"/>
      <path d="M 8.5 19.5 Q 9.5 18 10.5 19.5 M 12.5 19.5 Q 13.5 18 14.5 19.5 M 18 19.5 Q 19 18 20 19.5 M 21.5 19.5 Q 22.5 18 23.5 19.5"
        fill="none" stroke="#991b1b" strokeWidth="1" opacity="0.8"/>

      {/* ── Bras ── */}
      <g style={s.armL}>
        <rect x="1.5" y="17" width="5" height="9" rx="2.5" fill="#dc2626"/>
        <path d="M 3.5 25.5 L 3.3 26.8 M 5.5 26 L 5.3 27.3"
          stroke="#fbbf24" strokeWidth="0.85" strokeLinecap="round"/>
      </g>
      <g style={s.armR}>
        <rect x="23.5" y="17" width="5" height="9" rx="2.5" fill="#dc2626"/>
        <path d="M 25.5 25.5 L 25.3 26.8 M 27.5 26 L 27.3 27.3"
          stroke="#fbbf24" strokeWidth="0.85" strokeLinecap="round"/>
      </g>

      {/* ── Tête : cornes (derrière la tête) ── */}
      <path d="M 11 5.5 Q 9.5 1.5 9 -1 Q 11 1 13.5 5 Z"  fill="#fbbf24"/>
      <path d="M 19 5.5 Q 20.5 1.5 21 -1 Q 19 1 16.5 5 Z" fill="#fbbf24"/>
      <path d="M 7 9.5 Q 4 7 3.5 4.5 Q 5.5 7.5 8 11 Z"   fill="#ef4444"/>
      <path d="M 23 9.5 Q 26 7 26.5 4.5 Q 24.5 7.5 22 11 Z" fill="#ef4444"/>

      {/* ── Tête principale ── */}
      <circle cx="15" cy="11.5" r="10.5" fill="#dc2626"/>

      {/* Museau + narines */}
      <ellipse cx="15" cy="16.8" rx="5.5" ry="4" fill="#ef4444"/>
      <circle cx="13.2" cy="16.4" r="0.9" fill="#991b1b"/>
      <circle cx="16.8" cy="16.4" r="0.9" fill="#991b1b"/>

      {/* Crête frontale */}
      <path d="M 11.5 3 Q 13.5 1.5 15 2 Q 16.5 1.5 18.5 3"
        fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round"/>

      {/* ── Yeux CUSTOM — pupille verticale ambre ── */}
      {sleeping ? (
        <>
          <path d="M 8 10 Q 10.5 12.5 13 10"
            fill="none" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round"/>
          <path d="M 17 10 Q 19.5 12.5 22 10"
            fill="none" stroke="#1a1a1a" strokeWidth="1.3" strokeLinecap="round"/>
        </>
      ) : surprised ? (
        <>
          <circle cx="10.5" cy="10" r="3.2" fill="white"/>
          <circle cx="19.5" cy="10" r="3.2" fill="white"/>
          <circle cx="10.5" cy="10" r="2"   fill="#fbbf24"/>
          <ellipse cx="10.5" cy="10" rx="1"  ry="1.6" fill="#1a1a1a"/>
          <circle cx="19.5" cy="10" r="2"   fill="#fbbf24"/>
          <ellipse cx="19.5" cy="10" rx="1"  ry="1.6" fill="#1a1a1a"/>
        </>
      ) : (
        <>
          <g style={{ animation: blink, transformOrigin: '10.5px 10px' }}>
            <circle cx="10.5" cy="10" r="2.8" fill="white"/>
            <ellipse cx="10.5" cy="10" rx="1.3" ry="2.1" fill="#fbbf24"/>
            <ellipse cx="10.5" cy="10" rx="0.65" ry="1.5" fill="#1a1a1a"/>
            <circle cx="11.2" cy="9.2" r="0.6" fill="white" opacity="0.9"/>
          </g>
          <g style={{ animation: blink, transformOrigin: '19.5px 10px' }}>
            <circle cx="19.5" cy="10" r="2.8" fill="white"/>
            <ellipse cx="19.5" cy="10" rx="1.3" ry="2.1" fill="#fbbf24"/>
            <ellipse cx="19.5" cy="10" rx="0.65" ry="1.5" fill="#1a1a1a"/>
            <circle cx="20.2" cy="9.2" r="0.6" fill="white" opacity="0.9"/>
          </g>
        </>
      )}

      {/* ── Bouche CUSTOM ── */}
      {kissing ? (
        <KissLips id={id} cx={15} cy={20} r={1.4}/>
      ) : surprised ? (
        <ellipse cx="15" cy="20.3" rx="1.4" ry="1.7" fill="#1a1a1a"/>
      ) : (
        <path d="M 12.5 19.8 Q 15 21.5 17.5 19.8"
          fill="none" stroke="#1a1a1a" strokeWidth="1.1" strokeLinecap="round"/>
      )}

      {/* ── Front : flamme buccale + bracelets (cachés en kiss/surprise/sleep) ── */}
      {showFlame && (
        <>
          {/* Flamme buccale — 3 couches */}
          <path d="M 13 20 Q 10 22 8 26 Q 11 23 12 27 Q 13 23 15 28 Q 15 24 17 29 Q 17 24 19 27 Q 19 23 21 25 Q 19 21 17 20 Z"
            fill="#f97316" opacity="0.95"/>
          <path d="M 13.5 20 Q 11 23 10 27 Q 12 24 13 28 Q 14 24 15 29 Q 15.5 25 17 28 Q 17 24 19 26 Q 17.5 22 16 20 Z"
            fill="#fbbf24" opacity="0.8"/>
          <path d="M 14 20 Q 12 24 12.5 28 Q 13.5 25 15 29 Q 15 25 16.5 27 Q 16 23 14 20 Z"
            fill="white" opacity="0.35"/>

          {/* Bracelet de feu — poignet gauche */}
          <path d="M 1.5 23 Q 0 21 1 19.5 Q 2 21 1.5 23 Z"  fill="#f97316" opacity="0.85"/>
          <path d="M 2.5 24 Q 1 22 2 20.5 Q 3 22 2.5 24 Z"  fill="#fbbf24" opacity="0.75"/>
          <path d="M 3.5 23.5 Q 2 22 3 20.5 Q 4 22 3.5 23.5 Z" fill="#f97316" opacity="0.7"/>

          {/* Bracelet de feu — poignet droit */}
          <path d="M 28.5 23 Q 30 21 29 19.5 Q 28 21 28.5 23 Z"  fill="#f97316" opacity="0.85"/>
          <path d="M 27.5 24 Q 29 22 28 20.5 Q 27 22 27.5 24 Z"  fill="#fbbf24" opacity="0.75"/>
          <path d="M 26.5 23.5 Q 28 22 27 20.5 Q 26 22 26.5 23.5 Z" fill="#f97316" opacity="0.7"/>
        </>
      )}

    </g>
  );
}

function CharRobot({ s, m, id, blink: _blink }) {
  const sleeping = m === 'sleep';
  const led = sleeping ? '#334155' : '#00e5ff';
  const ledOp = sleeping ? 0.25 : 1;
  return (
    <>
      {/* Halo Radar Sentinelle — anneaux de scan tiretés (FIXE, hors body) */}
      {!sleeping && <>
        <ellipse cx="15" cy="20" rx="18" ry="22" fill="none" stroke="#20d040" strokeWidth="1.2" strokeDasharray="3 2.5" opacity="0.22"/>
        <ellipse cx="15" cy="20" rx="13.5" ry="16.5" fill="none" stroke="#20d040" strokeWidth="1" strokeDasharray="2.5 2" opacity="0.28"/>
        <ellipse cx="15" cy="20" rx="9" ry="11" fill="none" stroke="#20cc40" strokeWidth="0.9" strokeDasharray="2 1.5" opacity="0.32"/>
        {/* Balayage radial */}
        <path d="M15 20 L33 14 A18 22 0 0 0 22 -1 Z" fill="#20d040" opacity="0.06"/>
        {/* Croix cardinale */}
        <line x1="15" y1="-4" x2="15" y2="0" stroke="#20d040" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <line x1="15" y1="40" x2="15" y2="44" stroke="#20d040" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <line x1="-5" y1="20" x2="-1" y2="20" stroke="#20d040" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <line x1="31" y1="20" x2="35" y2="20" stroke="#20d040" strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
        <circle cx="15" cy="-4" r="1.2" fill="#20d040" opacity="0.75"/>
        <circle cx="33" cy="20" r="1.2" fill="#20d040" opacity="0.75"/>
        <circle cx="15" cy="42" r="1.2" fill="#20d040" opacity="0.75"/>
        <circle cx="-3" cy="20" r="1.2" fill="#20d040" opacity="0.75"/>
      </>}
    <g style={s.body}>
      {/* Jambe gauche */}
      <g style={s.legL}>
        <rect x="7.5" y="29" width="6.5" height="8.5" rx="1.5" fill="#2d5e8e"/>
        <rect x="6.5" y="35.5" width="8.5" height="3" rx="1.5" fill="#1a3d60"/>
        <rect x="9" y="30" width="3.5" height="1.2" rx="0.5" fill="#5aa8d8" opacity="0.6"/>
      </g>

      {/* Jambe droite */}
      <g style={s.legR}>
        <rect x="16" y="29" width="6.5" height="8.5" rx="1.5" fill="#2d5e8e"/>
        <rect x="15" y="35.5" width="8.5" height="3" rx="1.5" fill="#1a3d60"/>
        <rect x="17.5" y="30" width="3.5" height="1.2" rx="0.5" fill="#5aa8d8" opacity="0.6"/>
      </g>

      {/* Corps blindé */}
      <rect x="5.5" y="16" width="19" height="14" rx="3" fill="#2d5e8e"/>
      {/* Panneau de poitrine */}
      <rect x="8" y="18" width="14" height="10" rx="2" fill="#1a3d60"/>
      {/* Cellule d'énergie — power core */}
      <circle cx="15" cy="22.5" r="3.5" fill="#001020"/>
      <circle cx="15" cy="22.5" r="2.5" fill={sleeping ? '#0d2740' : '#00b8ff'} opacity="0.85"/>
      <circle cx="15" cy="22.5" r="1.2" fill="white" opacity={sleeping ? 0.15 : 0.9}/>
      {/* Panneaux latéraux de détection */}
      <rect x="9" y="18.5" width="4" height="1.2" rx="0.5" fill="#5aa8d8" opacity="0.5"/>
      <rect x="17" y="18.5" width="4" height="1.2" rx="0.5" fill="#5aa8d8" opacity="0.5"/>
      {/* Ceinture */}
      <rect x="8" y="28" width="14" height="2" rx="1" fill="#1a3d60"/>

      {/* Bras gauche */}
      <g style={s.armL}>
        <rect x="1.5" y="18" width="4.5" height="8.5" rx="2" fill="#2d5e8e"/>
        <ellipse cx="4" cy="18" rx="2.5" ry="2" fill="#1a3d60"/>
        {/* Pince */}
        <rect x="1" y="23.5" width="5.5" height="3.5" rx="1.8" fill="#1a3d60"/>
        <rect x="2" y="24.2" width="3.5" height="0.9" rx="0.4" fill="#5aa8d8" opacity="0.5"/>
      </g>

      {/* Bras droit */}
      <g style={s.armR}>
        <rect x="24" y="18" width="4.5" height="8.5" rx="2" fill="#2d5e8e"/>
        <ellipse cx="26" cy="18" rx="2.5" ry="2" fill="#1a3d60"/>
        <rect x="23.5" y="23.5" width="5.5" height="3.5" rx="1.8" fill="#1a3d60"/>
        <rect x="24.5" y="24.2" width="3.5" height="0.9" rx="0.4" fill="#5aa8d8" opacity="0.5"/>
      </g>

      {/* Cou */}
      <rect x="12" y="14" width="6" height="4" rx="1.5" fill="#1a3d60"/>

      {/* Antenne de scan */}
      <rect x="14" y="-3" width="2" height="7" rx="1" fill="#1a3d60"/>
      <circle cx="15" cy="-3" r="2.2" fill={sleeping ? '#1a3d60' : '#00e5ff'}/>
      <circle cx="15" cy="-3" r="0.9" fill="white" opacity={sleeping ? 0.15 : 0.8}/>

      {/* Casque dôme */}
      <circle cx="15" cy="10" r="10.5" fill="#2d5e8e"/>
      <circle cx="15" cy="10" r="9.5" fill="#4882c8" opacity="0.3"/>
      {/* Bolts latéraux */}
      <circle cx="7" cy="8" r="1.5" fill="#1a3d60"/>
      <circle cx="23" cy="8" r="1.5" fill="#1a3d60"/>
      {/* Visière noire full-face */}
      <rect x="5" y="7" width="20" height="7.5" rx="2" fill="#001020" opacity="0.92"/>

      {/* Yeux LED cyan */}
      {(m === 'clap' || m === 'victory') && !sleeping ? (<>
        {/* Joyful LED arcs — compact, centered on each LED bar */}
        <path d="M 8 10.5 Q 9.25 9 10.5 10.5" fill="none" stroke={led} strokeWidth="1.4" strokeLinecap="round" opacity={ledOp}/>
        <path d="M 19.5 10.5 Q 20.75 9 22 10.5" fill="none" stroke={led} strokeWidth="1.4" strokeLinecap="round" opacity={ledOp}/>
      </>) : m === 'think' && !sleeping ? (<>
        {/* Hésitation — pupille LED qui scanne de gauche à droite, contenue dans la barre */}
        <rect x="6.5" y="8.5" width="5.5" height="2.5" rx="1.2" fill="#001020" opacity="0.6"/>
        <rect x="18" y="8.5" width="5.5" height="2.5" rx="1.2" fill="#001020" opacity="0.6"/>
        <g style={{ animation: `${id}SharkEyeShift 1.4s ease-in-out infinite` }}>
          <rect x="7.5" y="8.7" width="2" height="2.1" rx="0.8" fill={led} opacity={ledOp}/>
          <rect x="7.7" y="8.9" width="0.7" height="0.7" rx="0.3" fill="white" opacity="0.85"/>
        </g>
        <g style={{ animation: `${id}SharkEyeShift 1.4s ease-in-out infinite` }}>
          <rect x="19" y="8.7" width="2" height="2.1" rx="0.8" fill={led} opacity={ledOp}/>
          <rect x="19.2" y="8.9" width="0.7" height="0.7" rx="0.3" fill="white" opacity="0.85"/>
        </g>
      </>) : (<>
        <rect x="6.5" y="8.5" width="5.5" height="2.5" rx="1.2" fill={led} opacity={ledOp}/>
        <rect x="18" y="8.5" width="5.5" height="2.5" rx="1.2" fill={led} opacity={ledOp}/>
        {!sleeping && <>
          <rect x="7" y="8.8" width="2" height="0.9" rx="0.4" fill="white" opacity="0.7"/>
          <rect x="18.5" y="8.8" width="2" height="0.9" rx="0.4" fill="white" opacity="0.7"/>
        </>}
      </>)}

      {/* Bouche : grille de ventilation 5 slots */}
      {m === 'kiss' ? (
        <KissLips id={id} cx={15} cy={12.7} r={1.6}/>
      ) : (<>
        <rect x="9.5" y="11.5" width="11" height="2.5" rx="1.2" fill="#001020" opacity="0.9"/>
        <rect x="10.8" y="12" width="1.2" height="1.5" rx="0.5" fill={led} opacity={sleeping ? 0.15 : 0.75}/>
        <rect x="12.8" y="12" width="1.2" height="1.5" rx="0.5" fill={led} opacity={sleeping ? 0.15 : 0.75}/>
        <rect x="14.8" y="12" width="1.2" height="1.5" rx="0.5" fill={led} opacity={sleeping ? 0.15 : 0.75}/>
        <rect x="16.8" y="12" width="1.2" height="1.5" rx="0.5" fill={led} opacity={sleeping ? 0.15 : 0.75}/>
        <rect x="18.8" y="12" width="1.2" height="1.5" rx="0.5" fill={led} opacity={sleeping ? 0.15 : 0.75}/>
      </>)}
    </g>
    </>
  );
}


function CharMushroom({ s, m, id, blink }) {
  return (
    <>
      {/* Halo — Couronne de Spores (FIXE, hors body) */}
      <ellipse cx="15" cy="19" rx="19" ry="15" fill="#e63946" opacity="0.04"/>
      <ellipse cx="15" cy="19" rx="19" ry="15" fill="none" stroke="#e63946" strokeWidth="1.3" opacity="0.28"/>
      <ellipse cx="15" cy="19" rx="15.5" ry="12" fill="none" stroke="#e63946" strokeWidth="0.9" opacity="0.18"/>
      <circle cx="15" cy="4"  r="1.8" fill="#e63946" opacity="0.6"/>
      <circle cx="15" cy="4"  r="0.8" fill="white"   opacity="0.7"/>
      <circle cx="28" cy="8"  r="1.6" fill="#e63946" opacity="0.55"/>
      <circle cx="28" cy="8"  r="0.7" fill="white"   opacity="0.65"/>
      <circle cx="34" cy="19" r="1.5" fill="#e63946" opacity="0.5"/>
      <circle cx="34" cy="19" r="0.6" fill="white"   opacity="0.6"/>
      <circle cx="28" cy="30" r="1.6" fill="#e63946" opacity="0.55"/>
      <circle cx="28" cy="30" r="0.7" fill="white"   opacity="0.65"/>
      <circle cx="15" cy="34" r="1.7" fill="#e63946" opacity="0.58"/>
      <circle cx="15" cy="34" r="0.75" fill="white"  opacity="0.68"/>
      <circle cx="2"  cy="30" r="1.6" fill="#e63946" opacity="0.55"/>
      <circle cx="2"  cy="30" r="0.7" fill="white"   opacity="0.65"/>
      <circle cx="-4" cy="19" r="1.5" fill="#e63946" opacity="0.5"/>
      <circle cx="-4" cy="19" r="0.6" fill="white"   opacity="0.6"/>
      <circle cx="2"  cy="8"  r="1.6" fill="#e63946" opacity="0.55"/>
      <circle cx="2"  cy="8"  r="0.7" fill="white"   opacity="0.65"/>
    <g style={s.body}>
      {/* Jambes */}
      <g style={s.legL}>
        <rect x="7.5" y="29" width="7" height="9" rx="3" fill="#faf7f0"/>
        <rect x="7.5" y="34" width="7" height="4.5" rx="2.5" fill="#e63946"/>
      </g>
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7" height="9" rx="3" fill="#faf7f0"/>
        <rect x="15.5" y="34" width="7" height="4.5" rx="2.5" fill="#e63946"/>
      </g>
      {/* Corps / Tige */}
      <rect x="9" y="18" width="12" height="13" rx="4.5" fill="#faf7f0"/>
      <rect x="13" y="18" width="4" height="13" rx="2" fill="#f0ebe0" opacity="0.7"/>
      <ellipse cx="15" cy="24" rx="6.5" ry="1.5" fill="#f5f0e4" stroke="#d4c8a8" strokeWidth="0.9"/>
      {/* Bras */}
      <g style={s.armL}>
        <rect x="1" y="20" width="8" height="10" rx="3.5" fill="#faf7f0"/>
        <rect x="1" y="27" width="8" height="3.5" rx="2" fill="#e63946"/>
      </g>
      <g style={s.armR}>
        <rect x="21" y="20" width="8" height="10" rx="3.5" fill="#faf7f0"/>
        <rect x="21" y="27" width="8" height="3.5" rx="2" fill="#e63946"/>
      </g>
      {/* Chapeau (tête) — rebord lamellé */}
      <ellipse cx="15" cy="18" rx="15.5" ry="2.8" fill="#f5e8d5"/>
      <line x1="5"  y1="17.8" x2="6.5"  y2="16.5" stroke="#dcc8a8" strokeWidth="0.9"/>
      <line x1="9"  y1="17.5" x2="9.8"  y2="16.2" stroke="#dcc8a8" strokeWidth="0.9"/>
      <line x1="13" y1="17.3" x2="13.2" y2="16"   stroke="#dcc8a8" strokeWidth="0.9"/>
      <line x1="17" y1="17.3" x2="16.8" y2="16"   stroke="#dcc8a8" strokeWidth="0.9"/>
      <line x1="21" y1="17.5" x2="20.2" y2="16.2" stroke="#dcc8a8" strokeWidth="0.9"/>
      <line x1="25" y1="17.8" x2="23.5" y2="16.5" stroke="#dcc8a8" strokeWidth="0.9"/>
      {/* Dôme principal */}
      <path d="M 0 18 C 0 -3 30 -3 30 18 Z" fill="#e63946"/>
      <path d="M 6 10 C 7.5 4 13 1.5 18 4" fill="none" stroke="#ff7a84" strokeWidth="1.4" strokeLinecap="round" opacity="0.55"/>
      <circle cx="11"   cy="9"    r="1.3" fill="white" opacity="0.95"/>
      <circle cx="18.5" cy="6"    r="1.5" fill="white" opacity="0.95"/>
      <circle cx="22.5" cy="12.5" r="1.1" fill="white" opacity="0.92"/>
      <circle cx="15"   cy="3.5"  r="1.1" fill="white" opacity="0.95"/>
      <circle cx="25.5" cy="9"    r="0.9" fill="white" opacity="0.88"/>
      <circle cx="4.5"  cy="10"   r="0.8" fill="white" opacity="0.82"/>
      <circle cx="7"    cy="14.5" r="0.8" fill="white" opacity="0.75"/>
      <circle cx="23"   cy="15"   r="0.7" fill="white" opacity="0.72"/>
      {/* Yeux — bas du dôme */}
      <Eyes m={m} id={id} blink={blink} lx={11} rx={19} y={13} />
      <Mouth m={m} id={id}/>
    </g>
    </>
  );
}

function CharStormEagle({ s, m, id, blink }) {
  return (
    <>
      <circle cx="15" cy="18" r="14" fill="none" stroke="#FFD700" strokeWidth="0.8" opacity="0.4" />
      <circle cx="15" cy="18" r="12" fill="none" stroke="#67e8f9" strokeWidth="0.5" opacity="0.3" />
      <path d="M 18 5 L 19.5 10 L 18.5 10 L 20 16 L 17 16 L 19 24" stroke="#FFD700" strokeWidth="1.5" fill="none" opacity="0.8" strokeLinecap="round" />
      <path d="M 18 5 L 19.5 10 L 18.5 10 L 20 16 L 17 16 L 19 24" stroke="#FFED4E" strokeWidth="0.7" fill="none" opacity="0.5" strokeLinecap="round" />
    <g style={s.body}>

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
        {(m === 'clap' || m === 'surprise') ? (
          <rect x="0" y="14" width="7.5" height="14" rx="2" fill="#8B6914" />
        ) : (<>
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
        </>)}
      </g>

      <g style={s.armR}>
        {(m === 'clap' || m === 'wave' || m === 'surprise') ? (
          <rect x="22.5" y="14" width="7.5" height="14" rx="2" fill="#8B6914" />
        ) : (<>
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
        </>)}
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

      <polygon points="15,12 13,13.5 17,13.5" fill="#FFB347" stroke="#FF8C00" strokeWidth="0.5" />
      {m === 'surprise' && (
        <g style={{
          transform: 'translateY(2.75px) scale(1.3)',
          transformOrigin: '15px 13.5px'
        }}>
          <polygon points="15,12 13.5,13 15,14.5 16.5,13" fill="#FFB347" stroke="#FF8C00" strokeWidth="0.5" />
        </g>
      )}
      {m === 'kiss' && (
        <KissLips id={id} cx={15} cy={15.5} r={1.4}/>
      )}
    </g>
    </>
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
        {(m === 'wave' || m === 'surprise') ? (<>
          {/* Petites nageoires repositionnées au pivot standard (4,18 / 26,18) pour suivre les rotations wave/surprise */}
          <g style={s.armL}>
            <path d="M 4 18 L 0 20 L 2 24 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1"/>
          </g>
          <g style={s.armR}>
            <path d="M 26 18 L 30 20 L 28 24 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1"/>
          </g>
        </>) : (<>
          <g style={{ ...s.armL, transformOrigin: '8px 22px',
            ...(m === 'clap' && { animation: `${id}SharkClapL 0.4s ease-in-out infinite` }) }}>
            <path d="M 8 22 L 3 23 L 6 27 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1"/>
          </g>
          <g style={{ ...s.armR, transformOrigin: '22px 22px',
            ...(m === 'clap' && { animation: `${id}SharkClapR 0.4s ease-in-out infinite` }) }}>
            <path d="M 22 22 L 27 23 L 24 27 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="1"/>
          </g>
        </>)}

        {/* Body dorsal fin */}
        <path d="M 15 17.5 L 12.5 10 L 17.5 10 Z" fill="#1a1a1a" stroke="#000" strokeWidth="0.9"/>

        {/* Head */}
        <ellipse cx="15" cy="17.5" rx="9.5" ry="7.5" fill="#607B8B" stroke="#2D4A5C" strokeWidth="1.2"/>
        <ellipse cx="15" cy="19.5" rx="8.5" ry="4.5" fill="#F0F8FF"/>

        {/* Head fin — points up */}
        <path d="M 15 4 L 13 10 L 17 10 Z" fill="#2D4A5C" stroke="#1a1a1a" strokeWidth="0.8"/>

        {/* Eyes */}
        {m === 'sleep' ? (
          <SleepEyes lx={10.5} rx={19.5} y={14.5} color="#2D4A5C" strokeWidth={1.1} dx={2}/>
        ) : m === 'surprise' ? (<>
          {/* Yeux ronds écarquillés */}
          <circle cx="10.5" cy="15.5" r="2.8" fill="white"/>
          <circle cx="19.5" cy="15.5" r="2.8" fill="white"/>
          <circle cx="10.5" cy="15.2" r="1.6" fill="#1a1a1a"/>
          <circle cx="19.5" cy="15.2" r="1.6" fill="#1a1a1a"/>
          <circle cx="11.1" cy="14.7" r="0.55" fill="white"/>
          <circle cx="20.1" cy="14.7" r="0.55" fill="white"/>
        </>) : m === 'clap' || m === 'victory' ? (<>
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
          {/* Yeux normaux — blanc + pupille dans le même groupe pour que le blink soit visible */}
          <g style={m === 'think' ? { animation: `${id}SharkEyeShift 1.4s ease-in-out infinite` } : { animation: blink, transformOrigin: '10.5px 15.5px' }}>
            <circle cx="10.5" cy="15.5" r="2.2" fill="white"/>
            <circle cx="10.5" cy="15.5" r="1.4" fill="#1a1a1a"/>
            <circle cx="11.3" cy="14.7" r="0.55" fill="white"/>
          </g>
          <g style={m === 'think' ? { animation: `${id}SharkEyeShift 1.4s ease-in-out infinite` } : { animation: blink, transformOrigin: '19.5px 15.5px' }}>
            <circle cx="19.5" cy="15.5" r="2.2" fill="white"/>
            <circle cx="19.5" cy="15.5" r="1.4" fill="#1a1a1a"/>
            <circle cx="20.3" cy="14.7" r="0.55" fill="white"/>
          </g>
        </>)}

        {/* Mouth */}
        {m === 'kiss' ? (
          <KissLips id={id} cx={15} cy={20.8} r={1.2} fill="#ff7eb3" stroke="#e05a9a" strokeWidth={0.5}/>
        ) : m === 'surprise' ? (
          /* Bouche "O" arrondie — choc */
          <ellipse cx="15" cy="20.5" rx="2" ry="1.8" fill="#1a1a1a" stroke="#2D4A5C" strokeWidth="0.5"/>
        ) : m === 'clap' || m === 'victory' ? (
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
// ── Cosmonaute Intrépide ─────────────────────────────────────────────────────
function CharCosmo({ s, m, id, blink }) {
  return (
    <>
      {/* Traînée cométaire (halo, FIXE hors body) */}
      <path d="M-3 44 Q4 33 13 21" fill="none" stroke="#0284c7" strokeWidth="4.5" opacity="0.12" strokeLinecap="round"/>
      <path d="M-3 44 Q4 33 13 21" fill="none" stroke="#38bdf8" strokeWidth="2.5" opacity="0.22" strokeLinecap="round"/>
      <path d="M-3 44 Q4 33 13 21" fill="none" stroke="#bae6fd" strokeWidth="1.2" opacity="0.45" strokeLinecap="round"/>
      <circle cx="2"  cy="40" r="0.8" fill="#7dd3fc" opacity="0.7"/>
      <circle cx="5"  cy="35" r="0.7" fill="#bae6fd" opacity="0.6"/>
      <circle cx="9"  cy="29" r="0.6" fill="#38bdf8" opacity="0.65"/>
    <g style={s.body}>
      {/* Jambe gauche */}
      <g style={s.legL}>
        <rect x="7"   y="29" width="7.5" height="9"   rx="3"   fill="#f0f9ff"/>
        <rect x="7.5" y="30.5" width="6.5" height="1.2" rx="0.5" fill="#0284c7" opacity="0.7"/>
        <rect x="7"   y="33"  width="7.5" height="1.8" rx="0.8" fill="#0ea5e9" opacity="0.9"/>
        <rect x="6.5" y="34.5" width="8" height="4"   rx="2"   fill="#075985"/>
      </g>
      {/* Jambe droite */}
      <g style={s.legR}>
        <rect x="15.5" y="29" width="7.5" height="9"   rx="3"   fill="#f0f9ff"/>
        <rect x="16"   y="30.5" width="6.5" height="1.2" rx="0.5" fill="#0284c7" opacity="0.7"/>
        <rect x="15.5" y="33"  width="7.5" height="1.8" rx="0.8" fill="#0ea5e9" opacity="0.9"/>
        <rect x="15"   y="34.5" width="8" height="4"   rx="2"   fill="#075985"/>
      </g>
      {/* Corps */}
      <rect x="4.5" y="16" width="21" height="14.5" rx="6"   fill="#f0f9ff"/>
      <rect x="9"   y="16" width="12" height="2.5"  rx="1.2" fill="#e0f2fe"/>
      <rect x="8"   y="18" width="14" height="9"    rx="2.5" fill="#f0faff" stroke="#0284c7" strokeWidth="1.2"/>
      <rect x="9.5" y="19.5" width="11" height="1.5" rx="0.7" fill="#0284c7" opacity="0.6"/>
      <rect x="9.5" y="23"   width="11" height="1.5" rx="0.7" fill="#0284c7" opacity="0.6"/>
      <path d="M15 20 L16.7 21 L16.7 23 L15 24 L13.3 23 L13.3 21 Z" fill="#0284c7"/>
      <path d="M15 20.8 L16.2 21.5 L16.2 22.8 L15 23.5 L13.8 22.8 L13.8 21.5 Z" fill="#7dd3fc"/>
      {/* Bras gauche + patch mission */}
      <g style={s.armL}>
        <rect x="0" y="17" width="6" height="10" rx="3"   fill="#f0f9ff"/>
        <circle cx="3" cy="20" r="2.2" fill="#0284c7"/>
        <circle cx="3" cy="20" r="1.4" fill="#38bdf8"/>
        <circle cx="3" cy="20" r="0.7" fill="#f0faff"/>
        <rect x="0" y="23"   width="6" height="1.8" rx="0.8" fill="#0ea5e9" opacity="0.9"/>
        <rect x="0" y="24.5" width="6" height="3.5" rx="2.5" fill="#075985"/>
      </g>
      {/* Bras droit + drapeau */}
      <g style={s.armR}>
        <rect x="24" y="17" width="6" height="10" rx="3" fill="#f0f9ff"/>
        {m !== 'clap' && m !== 'wave' && m !== 'surprise' && (
          <g transform={m === 'think' ? 'rotate(52 27 22)' : undefined}>
            <rect x="26.3" y="10" width="1.6" height="16" rx="0.8" fill="#0284c7"/>
            <rect x="27.9" y="10"  width="8"  height="5.5" rx="1"   fill="#0284c7"/>
            <rect x="28.5" y="10.6" width="7" height="4.3" rx="0.6" fill="#38bdf8"/>
            <circle cx="32" cy="12.7" r="1.4" fill="#f0faff"/>
          </g>
        )}
        <rect x="24" y="23"   width="6" height="1.8" rx="0.8" fill="#0ea5e9" opacity="0.9"/>
        <rect x="24" y="24.5" width="6" height="3.5" rx="2.5" fill="#075985"/>
      </g>
      {/* Casque — tête */}
      <circle cx="15" cy="11" r="12.5" fill="#f0faff"/>
      <circle cx="15" cy="11" r="12.5" fill="none" stroke="#0284c7" strokeWidth="1.5"/>
      <rect x="12" y="-2" width="6" height="4" rx="2"   fill="#0284c7"/>
      <rect x="13" y="-1.5" width="4" height="3" rx="1.5" fill="#7dd3fc"/>
      {/* Visière */}
      <ellipse cx="15" cy="12" rx="8.5" ry="7.5" fill="#0284c7"/>
      <ellipse cx="15" cy="12" rx="7.2" ry="6.2" fill="#e0f7ff" opacity="0.75"/>
      <ellipse cx="15" cy="12.5" rx="6" ry="5.2" fill="#fde8d0"/>
      <circle cx="10.5" cy="14.2" r="2" fill="#fca5a5" opacity="0.7"/>
      <circle cx="19.5" cy="14.2" r="2" fill="#fca5a5" opacity="0.7"/>
      {/* Yeux dans la visière */}
      <Eyes m={m} id={id} blink={blink} lx={12} rx={18} y={11} r={1.8} color="#1a1a2e" bg={m === 'sleep' ? '#111' : 'white'}/>
      {/* Bouche (repositionnée dans le casque) */}
      <MoodMouth m={m} id={id} cx={15} cy={16.5}
        smileColor="#b45309" smileWidth={2.5} smileDepth={2} smileStroke={1}
        surpriseColor="#1a1a2e" surpriseRx={1.8} surpriseRy={2.1} surpriseDy={-1.7}
        kissCy={14.5} kissR={1.4}
      />
      {/* Antenne (avant-plan) */}
      <rect x="19" y="-8" width="1.3" height="9" rx="0.6" fill="#0284c7"/>
      <circle cx="19.6" cy="-8.5" r="1.3" fill="#7dd3fc"/>
      <circle cx="19.6" cy="-8.5" r="0.7" fill="#0284c7"/>
      <path d="M21.5 -5 Q23 -6.5 21.5 -8"  fill="none" stroke="#7dd3fc" strokeWidth="0.9" opacity="0.6" strokeLinecap="round"/>
      <path d="M23 -4.5 Q25 -6.5 23 -8.5"  fill="none" stroke="#38bdf8" strokeWidth="0.8" opacity="0.4" strokeLinecap="round"/>
      <ellipse cx="13" cy="8" rx="2.2" ry="1.2" fill="white" opacity="0.4"/>
    </g>
    </>
  );
}

// ─── CHARS MAP (17 production characters) ────────────────────────────────────
const CHARS = {
  panda:         CharPanda,
  fox:           CharFox,
  wolf:          CharWolf,
  tiger:         CharTiger,
  lion:          CharLion,
  stormEagle:    CharStormEagle,
  bear:          CharBear,
  sharkNinja:    CharSharkNinja,
  owlWitch:      CharOwlWitch,
  catDetective:  CharCatDetective,
  turtleNomad:   CharTurtleNomad,
  raccoonHacker: CharRaccoonHacker,
  spyPenguin:    CharSpyPenguin,
  dragon:        CharDragon,
  cosmo:         CharCosmo,
  mushroom:      CharMushroom,
  robot:         CharRobot,
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
    <div data-mood={mood} style={{
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

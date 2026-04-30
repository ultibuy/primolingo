import { useEffect, useRef } from 'react';

function rand(a, b) { return a + Math.random() * (b - a); }

const FLAME_COLORS = [
  '#ff4500', '#ff6b2b', '#ff8c42', '#ffaa33',
  '#ffd700', '#fff176', '#ffffff',
  '#e64500', '#cc3300', '#a82800',
  '#9b30ff', '#7b2eff', '#a855f7',
];

function generateFlames(W, H, count = 250) {
  return Array.from({ length: count }, () => ({
    x: rand(-W * 0.15, W * 1.15),
    baseY: H + rand(10, 60),
    speed: rand(180, 600),
    size: rand(8, 40),
    sizeEnd: rand(2, 12),
    wobbleAmp: rand(15, 80),
    wobbleFreq: rand(2, 6),
    wobblePhase: rand(0, Math.PI * 2),
    alpha: rand(0.5, 1),
    color: FLAME_COLORS[Math.floor(Math.random() * FLAME_COLORS.length)],
    delay: rand(0, 0.3),
    life: rand(0.3, 0.8),
  }));
}

function generateEmbers(W, H, count = 120) {
  return Array.from({ length: count }, () => ({
    x: rand(0, W),
    baseY: H + rand(20, 80),
    speed: rand(60, 250),
    size: rand(1.5, 4.5),
    wobbleAmp: rand(30, 120),
    wobbleFreq: rand(1, 4),
    wobblePhase: rand(0, Math.PI * 2),
    alpha: rand(0.4, 1),
    delay: rand(0, 0.5),
    life: rand(0.4, 0.95),
    twinkleSpeed: rand(8, 25),
    twinklePhase: rand(0, Math.PI * 2),
  }));
}

export default function InfernoEntranceEffect({ onDone }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const flames = generateFlames(W, H);
    const embers = generateEmbers(W, H);

    const DURATION = 1800;
    let start = null, raf;

    function frame(ts) {
      if (!start) start = ts;
      const t = Math.min((ts - start) / DURATION, 1);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      // ── Global envelope: ramp up then fade out ──
      const envelope = t < 0.15 ? t / 0.15
                     : t < 0.65 ? 1
                     : 1 - (t - 0.65) / 0.35;

      // ── Base glow: warm gradient rising from bottom ──
      if (envelope > 0) {
        const glowH = H * 0.6 * envelope;
        const grad = ctx.createLinearGradient(0, H, 0, H - glowH);
        grad.addColorStop(0, `rgba(255,69,0,${0.35 * envelope})`);
        grad.addColorStop(0.3, `rgba(255,140,0,${0.2 * envelope})`);
        grad.addColorStop(0.6, `rgba(168,85,247,${0.08 * envelope})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, H - glowH, W, glowH);
      }

      // ── Flame particles ──
      flames.forEach(f => {
        const lt = Math.max(0, t - f.delay);
        if (lt <= 0 || lt > f.life) return;
        const progress = lt / f.life;

        const fadeIn = Math.min(progress / 0.1, 1);
        const fadeOut = progress > 0.6 ? 1 - (progress - 0.6) / 0.4 : 1;
        const alpha = f.alpha * fadeIn * fadeOut * envelope;
        if (alpha <= 0.01) return;

        const y = f.baseY - f.speed * lt;
        const wobble = Math.sin(lt * f.wobbleFreq * Math.PI * 2 + f.wobblePhase) * f.wobbleAmp * (1 - progress * 0.5);
        const x = f.x + wobble;
        const size = f.size + (f.sizeEnd - f.size) * progress;

        if (y < -40 || x < -40 || x > W + 40) return;

        ctx.save();
        ctx.globalAlpha = alpha;

        // Outer glow
        const glowR = size * 2.5;
        const glow = ctx.createRadialGradient(x, y, 0, x, y, glowR);
        glow.addColorStop(0, f.color + '66');
        glow.addColorStop(0.5, f.color + '18');
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, glowR, 0, Math.PI * 2);
        ctx.fill();

        // Bright core
        ctx.globalAlpha = alpha * 0.9;
        ctx.shadowBlur = size * 1.5;
        ctx.shadowColor = f.color;
        ctx.fillStyle = f.color;
        ctx.beginPath();
        ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Hot white center for large bright flames
        if (size > 15 && progress < 0.3) {
          ctx.globalAlpha = alpha * 0.6 * (1 - progress / 0.3);
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(x, y, size * 0.15, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      // ── Embers: tiny bright sparks that float up and twinkle ──
      embers.forEach(e => {
        const lt = Math.max(0, t - e.delay);
        if (lt <= 0 || lt > e.life) return;
        const progress = lt / e.life;

        const fadeIn = Math.min(progress / 0.05, 1);
        const fadeOut = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;
        const twinkle = 0.5 + 0.5 * Math.sin(lt * e.twinkleSpeed + e.twinklePhase);
        const alpha = e.alpha * fadeIn * fadeOut * twinkle * envelope;
        if (alpha <= 0.01) return;

        const y = e.baseY - e.speed * lt;
        const wobble = Math.sin(lt * e.wobbleFreq * Math.PI * 2 + e.wobblePhase) * e.wobbleAmp;
        const x = e.x + wobble;

        if (y < -20) return;

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#ffaa33';
        ctx.fillStyle = progress < 0.3 ? '#ffffff' : progress < 0.6 ? '#ffd700' : '#ff6b2b';
        ctx.beginPath();
        ctx.arc(x, y, e.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // ── Heat distortion lines at base (subtle wavy horizontal lines) ──
      if (envelope > 0.2) {
        const lineAlpha = (envelope - 0.2) * 0.15;
        for (let i = 0; i < 6; i++) {
          const ly = H - 30 - i * 50;
          ctx.save();
          ctx.globalAlpha = lineAlpha * (1 - i / 6);
          ctx.beginPath();
          for (let px = 0; px <= W; px += 3) {
            const wy = ly + Math.sin(px * 0.008 + t * 12 + i * 1.5) * 4;
            px === 0 ? ctx.moveTo(px, wy) : ctx.lineTo(px, wy);
          }
          ctx.strokeStyle = '#ff8c42';
          ctx.lineWidth = 1;
          ctx.stroke();
          ctx.restore();
        }
      }

      if (t < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, W, H);
        onDone?.();
      }
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99998, pointerEvents: 'none' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
    </div>
  );
}

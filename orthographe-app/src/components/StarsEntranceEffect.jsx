import { useEffect, useRef } from 'react';

function rand(a, b) { return a + Math.random() * (b - a); }
function easeOut(t) { return 1 - Math.pow(1 - t, 2.5); }

function generateStars(cx, cy, W, H, count = 350) {
  return Array.from({ length: count }, (_, _i) => {
    const angle = rand(0, Math.PI * 2);
    const maxDist = Math.sqrt(W * W + H * H) * 0.6;
    return {
      angle,
      speed: rand(0.35, 1),          // fraction of maxDist
      maxDist,
      size: rand(2.5, 8),
      alpha: rand(0.7, 1),
      delay: rand(0, 0.2),
      trailFrac: rand(0.15, 0.45),   // trail relative to current dist
      isStar: Math.random() > 0.45,
      points: Math.random() > 0.5 ? 4 : 6,
      twinkle: rand(0, Math.PI * 2), // phase offset for twinkle
      twinkleSpeed: rand(8, 20),
      spinOffset: rand(-0.06, 0.06), // subtle angle drift
    };
  });
}

function drawStar(ctx, x, y, outerR, innerR, points, rotation) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = rotation + (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    i === 0 ? ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r)
             : ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
  }
  ctx.closePath();
}

export default function StarsEntranceEffect({ onDone }) {
  const canvasRef = useRef(null);
  const flashRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
    const cx = W / 2, cy = H / 2;

    const style = getComputedStyle(document.documentElement);
    const primary = style.getPropertyValue('--color-primary').trim() || '#a78bfa';
    const accent  = style.getPropertyValue('--color-accent').trim()  || '#c4b5fd';

    const stars = generateStars(cx, cy, W, H);
    const DURATION = 1600;
    let start = null, raf;

    function frame(ts) {
      if (!start) start = ts;
      const t = Math.min((ts - start) / DURATION, 1);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      // ── Central glow (0 → 0.18 → 0.45) ──
      const glowT = t < 0.15 ? t / 0.15 : t < 0.45 ? 1 - (t - 0.15) / 0.30 : 0;
      if (glowT > 0) {
        const r = glowT * 280;
        const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0,   'white');
        g.addColorStop(0.2, accent + 'ee');
        g.addColorStop(0.55, primary + '88');
        g.addColorStop(1,   'rgba(0,0,0,0)');
        ctx.save();
        ctx.globalAlpha = glowT * 0.95;
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // ── Stars ──
      stars.forEach(star => {
        const tLocal = Math.max(0, t - star.delay) / (1 - star.delay);
        if (tLocal <= 0) return;

        const dist = easeOut(Math.min(tLocal, 1)) * star.speed * star.maxDist;
        const angle = star.angle + star.spinOffset * tLocal;
        const x = cx + Math.cos(angle) * dist;
        const y = cy + Math.sin(angle) * dist;

        // Fade in fast, hold, then fade out in last 30%
        const fadeIn  = Math.min(tLocal / 0.08, 1);
        const fadeOut = tLocal > 0.70 ? 1 - (tLocal - 0.70) / 0.30 : 1;
        // Twinkle: subtle brightness oscillation during hold phase
        const twinkle = tLocal > 0.1 && tLocal < 0.75
          ? 0.75 + 0.25 * Math.abs(Math.sin(tLocal * star.twinkleSpeed + star.twinkle))
          : 1;
        const alpha = star.alpha * fadeIn * fadeOut * twinkle;
        if (alpha <= 0) return;

        // Trail
        const trailDist = dist * star.trailFrac;
        const tx = cx + Math.cos(angle) * (dist - trailDist);
        const ty = cy + Math.sin(angle) * (dist - trailDist);
        if (trailDist > 4) {
          const tGrad = ctx.createLinearGradient(tx, ty, x, y);
          tGrad.addColorStop(0, 'rgba(0,0,0,0)');
          tGrad.addColorStop(1, primary + Math.round(alpha * 180).toString(16).padStart(2, '0'));
          ctx.save();
          ctx.globalAlpha = alpha * 0.75;
          ctx.beginPath();
          ctx.moveTo(tx, ty);
          ctx.lineTo(x, y);
          ctx.strokeStyle = tGrad;
          ctx.lineWidth = star.size * 0.7;
          ctx.stroke();
          ctx.restore();
        }

        // Star or circle
        const color = tLocal < 0.18 ? 'white' : tLocal < 0.45 ? accent : primary;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = star.size * 3.5;
        ctx.shadowColor = accent;
        ctx.fillStyle = color;
        const rotation = tLocal * Math.PI * 0.5;
        if (star.isStar) {
          drawStar(ctx, x, y, star.size, star.size * 0.38, star.points, rotation);
        } else {
          ctx.beginPath();
          ctx.arc(x, y, star.size * 0.55, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.restore();
      });

      // ── Secondary wave of micro-stars (0.25 → 1) ──
      // Already covered by delay distribution, but add a few big slow ones
      // (handled by the wide delay range + slow speed stars above)

      // ── Flash (0.06 → 0.2) ──
      const flashA = t < 0.06 ? t / 0.06 : t < 0.2 ? 1 - (t - 0.06) / 0.14 : 0;
      if (flashRef.current) flashRef.current.style.opacity = Math.max(0, flashA * 0.85);

      if (t < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, W, H);
        if (flashRef.current) flashRef.current.style.opacity = 0;
        onDone?.();
      }
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99998, pointerEvents: 'none' }}>
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
      <div ref={flashRef} style={{ position: 'absolute', inset: 0, background: 'white', opacity: 0 }} />
    </div>
  );
}

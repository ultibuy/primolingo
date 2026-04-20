import { useEffect, useRef } from 'react';

function rand(a, b) { return a + Math.random() * (b - a); }

/* ── Frost crystals: hexagonal shapes that grow from edges inward ── */
function generateCrystals(W, H, count = 60) {
  const cx = W / 2, cy = H / 2;
  const maxDist = Math.sqrt(cx * cx + cy * cy);
  return Array.from({ length: count }, () => {
    // Spawn from edges
    const edge = Math.random();
    let x, y;
    if (edge < 0.25)      { x = rand(0, W); y = rand(-10, 5); }      // top
    else if (edge < 0.5)  { x = rand(0, W); y = rand(H - 5, H + 10); } // bottom
    else if (edge < 0.75) { x = rand(-10, 5); y = rand(0, H); }      // left
    else                   { x = rand(W - 5, W + 10); y = rand(0, H); } // right

    const distFromCenter = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);

    return {
      x, y,
      size: rand(3, 12),
      maxSize: rand(8, 28),
      points: Math.random() > 0.5 ? 6 : 4,
      rotation: rand(0, Math.PI),
      rotSpeed: rand(-0.3, 0.3),
      alpha: rand(0.4, 0.9),
      // Crystals closer to edge appear earlier
      delay: (distFromCenter / maxDist) * 0.5 + rand(0, 0.08),
      growSpeed: rand(0.3, 0.8),
    };
  });
}

/* ── Frost veins: branching lines that crawl from edges toward center ── */
function generateVeins(W, H, count = 14) {
  const cx = W / 2, cy = H / 2;
  return Array.from({ length: count }, () => {
    // Start from a random edge point
    const edge = Math.random();
    let sx, sy;
    if (edge < 0.25)      { sx = rand(0, W); sy = 0; }
    else if (edge < 0.5)  { sx = rand(0, W); sy = H; }
    else if (edge < 0.75) { sx = 0; sy = rand(0, H); }
    else                   { sx = W; sy = rand(0, H); }

    // Grow toward center with randomness
    const segments = Math.floor(rand(10, 25));
    const pts = [{ x: sx, y: sy }];
    let x = sx, y = sy;
    for (let i = 0; i < segments; i++) {
      const toCenterX = cx - x;
      const toCenterY = cy - y;
      const dist = Math.sqrt(toCenterX ** 2 + toCenterY ** 2) || 1;
      const dirX = toCenterX / dist;
      const dirY = toCenterY / dist;
      const stepLen = rand(20, 60);
      // Mostly toward center but with angular jitter
      const jitter = rand(-0.8, 0.8);
      x += (dirX * Math.cos(jitter) - dirY * Math.sin(jitter)) * stepLen;
      y += (dirX * Math.sin(jitter) + dirY * Math.cos(jitter)) * stepLen;
      pts.push({ x, y });
    }

    return {
      pts,
      width: rand(0.8, 2.5),
      alpha: rand(0.3, 0.7),
      delay: rand(0, 0.15),
      speed: rand(0.4, 0.9), // how fast segments appear
    };
  });
}

/* ── Sparkles: tiny diamond glints ── */
function generateSparkles(W, H, count = 100) {
  return Array.from({ length: count }, () => ({
    x: rand(0, W),
    y: rand(0, H),
    size: rand(1, 4),
    alpha: rand(0.3, 1),
    delay: rand(0.1, 0.7),
    duration: rand(0.15, 0.4),
    twinkleSpeed: rand(12, 30),
    phase: rand(0, Math.PI * 2),
  }));
}

function drawCrystal(ctx, x, y, outerR, innerR, points, rotation) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = rotation + (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
    if (i === 0) {
      ctx.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    } else {
      ctx.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r);
    }
  }
  ctx.closePath();
}

export default function FreezeEntranceEffect({ onDone }) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const crystals = generateCrystals(W, H);
    const veins = generateVeins(W, H);
    const sparkles = generateSparkles(W, H);

    const DURATION = 2000;
    let start = null, raf;

    function frame(ts) {
      if (!start) start = ts;
      const t = Math.min((ts - start) / DURATION, 1);
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      // ── Blue tint overlay: builds up then fades ──
      if (overlayRef.current) {
        const tint = t < 0.3 ? t / 0.3 : t < 0.7 ? 1 : 1 - (t - 0.7) / 0.3;
        overlayRef.current.style.opacity = Math.max(0, tint * 0.18);
      }

      // ── Edge frost: vignette of white/blue from edges ──
      const frostProgress = Math.min(t / 0.6, 1);
      const frostFade = t > 0.7 ? 1 - (t - 0.7) / 0.3 : 1;
      if (frostProgress > 0 && frostFade > 0) {
        const edgeAlpha = frostProgress * frostFade * 0.4;
        const edgeDepth = frostProgress * Math.min(W, H) * 0.25;

        // Top
        let grad = ctx.createLinearGradient(0, 0, 0, edgeDepth);
        grad.addColorStop(0, `rgba(200,230,255,${edgeAlpha})`);
        grad.addColorStop(0.5, `rgba(150,200,255,${edgeAlpha * 0.3})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, edgeDepth);

        // Bottom
        grad = ctx.createLinearGradient(0, H, 0, H - edgeDepth);
        grad.addColorStop(0, `rgba(200,230,255,${edgeAlpha})`);
        grad.addColorStop(0.5, `rgba(150,200,255,${edgeAlpha * 0.3})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, H - edgeDepth, W, edgeDepth);

        // Left
        grad = ctx.createLinearGradient(0, 0, edgeDepth, 0);
        grad.addColorStop(0, `rgba(200,230,255,${edgeAlpha})`);
        grad.addColorStop(0.5, `rgba(150,200,255,${edgeAlpha * 0.3})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, edgeDepth, H);

        // Right
        grad = ctx.createLinearGradient(W, 0, W - edgeDepth, 0);
        grad.addColorStop(0, `rgba(200,230,255,${edgeAlpha})`);
        grad.addColorStop(0.5, `rgba(150,200,255,${edgeAlpha * 0.3})`);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(W - edgeDepth, 0, edgeDepth, H);
      }

      // ── Frost veins: crawl from edges toward center ──
      veins.forEach(vein => {
        const vt = Math.max(0, t - vein.delay);
        if (vt <= 0) return;

        const growProgress = Math.min(vt / vein.speed, 1);
        const visiblePts = Math.ceil(growProgress * (vein.pts.length - 1));
        if (visiblePts < 1) return;

        const fadeOut = t > 0.75 ? Math.max(0, 1 - (t - 0.75) / 0.25) : 1;
        const alpha = vein.alpha * fadeOut;
        if (alpha <= 0) return;

        // Glow
        ctx.save();
        ctx.globalAlpha = alpha * 0.4;
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#88ccff';
        ctx.beginPath();
        ctx.moveTo(vein.pts[0].x, vein.pts[0].y);
        for (let i = 1; i <= visiblePts; i++) ctx.lineTo(vein.pts[i].x, vein.pts[i].y);
        ctx.strokeStyle = '#5599cc';
        ctx.lineWidth = vein.width * 4;
        ctx.stroke();
        ctx.restore();

        // Core line
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.moveTo(vein.pts[0].x, vein.pts[0].y);
        for (let i = 1; i <= visiblePts; i++) ctx.lineTo(vein.pts[i].x, vein.pts[i].y);
        ctx.strokeStyle = 'rgba(200,235,255,0.85)';
        ctx.lineWidth = vein.width;
        ctx.stroke();
        ctx.restore();

        // Bright tip
        if (growProgress < 0.95) {
          const tip = vein.pts[visiblePts];
          ctx.save();
          ctx.globalAlpha = alpha * 0.8;
          ctx.shadowBlur = 15;
          ctx.shadowColor = 'white';
          ctx.fillStyle = 'white';
          ctx.beginPath();
          ctx.arc(tip.x, tip.y, vein.width * 2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      // ── Crystals: grow from edges ──
      crystals.forEach(c => {
        const ct = Math.max(0, t - c.delay);
        if (ct <= 0) return;

        const grow = Math.min(ct / c.growSpeed, 1);
        const fadeOut = t > 0.75 ? Math.max(0, 1 - (t - 0.75) / 0.25) : 1;
        const alpha = c.alpha * Math.min(ct / 0.1, 1) * fadeOut;
        if (alpha <= 0) return;

        const size = c.size + (c.maxSize - c.size) * grow;
        const rot = c.rotation + c.rotSpeed * ct;

        // Crystal glow
        ctx.save();
        ctx.globalAlpha = alpha * 0.3;
        ctx.shadowBlur = size;
        ctx.shadowColor = '#77bbff';
        drawCrystal(ctx, c.x, c.y, size * 1.3, size * 0.5, c.points, rot);
        ctx.fillStyle = '#4499cc';
        ctx.fill();
        ctx.restore();

        // Crystal body
        ctx.save();
        ctx.globalAlpha = alpha * 0.5;
        drawCrystal(ctx, c.x, c.y, size, size * 0.38, c.points, rot);
        ctx.fillStyle = 'rgba(180,220,255,0.6)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(220,240,255,0.8)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
        ctx.restore();

        // White center highlight
        ctx.save();
        ctx.globalAlpha = alpha * 0.4;
        ctx.fillStyle = 'white';
        ctx.beginPath();
        ctx.arc(c.x, c.y, size * 0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // ── Sparkles: diamond-shaped glints that appear and vanish ──
      sparkles.forEach(s => {
        const st = Math.max(0, t - s.delay);
        if (st <= 0 || st > s.duration) return;
        const progress = st / s.duration;

        const fadeIn = Math.min(progress / 0.2, 1);
        const fadeOut = progress > 0.6 ? 1 - (progress - 0.6) / 0.4 : 1;
        const twinkle = Math.abs(Math.sin(st * s.twinkleSpeed + s.phase));
        const alpha = s.alpha * fadeIn * fadeOut * twinkle;
        if (alpha <= 0.01) return;

        const size = s.size * (0.5 + 0.5 * twinkle);

        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'white';
        ctx.fillStyle = 'white';
        // Diamond shape
        ctx.beginPath();
        ctx.moveTo(s.x, s.y - size);
        ctx.lineTo(s.x + size * 0.35, s.y);
        ctx.lineTo(s.x, s.y + size);
        ctx.lineTo(s.x - size * 0.35, s.y);
        ctx.closePath();
        ctx.fill();
        // Cross sparkle
        ctx.beginPath();
        ctx.moveTo(s.x - size, s.y);
        ctx.lineTo(s.x + size, s.y);
        ctx.moveTo(s.x, s.y - size);
        ctx.lineTo(s.x, s.y + size);
        ctx.strokeStyle = 'rgba(255,255,255,0.6)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.restore();
      });

      if (t < 1) {
        raf = requestAnimationFrame(frame);
      } else {
        ctx.clearRect(0, 0, W, H);
        if (overlayRef.current) overlayRef.current.style.opacity = 0;
        onDone?.();
      }
    }

    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99998, pointerEvents: 'none' }}>
      <div ref={overlayRef} style={{ position: 'absolute', inset: 0, background: '#1a3a5c', opacity: 0 }} />
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />
    </div>
  );
}

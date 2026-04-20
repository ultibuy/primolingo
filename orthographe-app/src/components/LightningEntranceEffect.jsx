import { useEffect, useRef } from 'react';

function rand(a, b) {
  return a + Math.random() * (b - a);
}

function generateSpeedLines(cx, cy, w, h, count = 80) {
  const lines = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + rand(-0.04, 0.04);
    const innerR = rand(15, 55);
    const outerR = Math.sqrt(w * w + h * h) * 0.65 + rand(0, 80);
    lines.push({
      x1: cx + Math.cos(angle) * innerR,
      y1: cy + Math.sin(angle) * innerR,
      x2: cx + Math.cos(angle) * outerR,
      y2: cy + Math.sin(angle) * outerR,
      width: rand(0.5, 2.2),
      alpha: rand(0.25, 0.75),
    });
  }
  return lines;
}

function generateBolt(cx, h, spread = 45, segments = 16) {
  const pts = [{ x: cx + rand(-4, 4), y: -15 }];
  for (let i = 1; i < segments; i++) {
    const t = i / segments;
    const y = t * (h + 30) - 15;
    const s = spread * Math.sin(t * Math.PI);
    pts.push({ x: cx + rand(-s, s), y });
  }
  pts.push({ x: cx + rand(-4, 4), y: h + 15 });
  return pts;
}

function phaseAlpha(t, t0, tPeak, t1) {
  if (t <= t0) return 0;
  if (t <= tPeak) {
    const p = (t - t0) / (tPeak - t0);
    return p * p;
  }
  if (t <= t1) {
    const p = (t - tPeak) / (t1 - tPeak);
    return 1 - p * p;
  }
  return 0;
}

function drawBolt(ctx, pts, alpha, primary, accent) {
  if (alpha <= 0) return;

  // Outer glow (primary color)
  ctx.save();
  ctx.globalAlpha = alpha * 0.2;
  ctx.shadowBlur = 40;
  ctx.shadowColor = primary;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = primary;
  ctx.lineWidth = 20;
  ctx.stroke();
  ctx.restore();

  // Mid glow (accent color)
  ctx.save();
  ctx.globalAlpha = alpha * 0.5;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = accent;
  ctx.lineWidth = 7;
  ctx.stroke();
  ctx.restore();

  // Bright core (white)
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.forEach(p => ctx.lineTo(p.x, p.y));
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();
}

export default function LightningEntranceEffect({ onDone }) {
  const canvasRef = useRef(null);
  const flashRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W = window.innerWidth;
    const H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;

    const cx = W / 2;
    const cy = H / 2;

    // Read theme colors from CSS variables
    const style = getComputedStyle(document.documentElement);
    const primary = style.getPropertyValue('--color-primary').trim() || '#a78bfa';
    const accent = style.getPropertyValue('--color-accent').trim() || '#c4b5fd';

    const speedLines = generateSpeedLines(cx, cy, W, H);
    const bolt1 = generateBolt(cx, H, 45);
    const bolt2 = generateBolt(cx - 20, H, 25);

    const DURATION = 800;
    let start = null;
    let raf;

    function frame(ts) {
      if (!start) start = ts;
      const t = Math.min((ts - start) / DURATION, 1);

      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, W, H);

      // Speed lines: build up fast, linger through the bolt, then fade
      const linesA = phaseAlpha(t, 0, 0.18, 0.65);
      if (linesA > 0) {
        speedLines.forEach(l => {
          ctx.save();
          ctx.globalAlpha = linesA * l.alpha;
          ctx.beginPath();
          ctx.moveTo(l.x1, l.y1);
          ctx.lineTo(l.x2, l.y2);
          ctx.strokeStyle = accent;
          ctx.lineWidth = l.width;
          ctx.stroke();
          ctx.restore();
        });
      }

      // Secondary bolt (slightly offset, softer)
      const bolt2A = phaseAlpha(t, 0.12, 0.24, 0.52);
      drawBolt(ctx, bolt2, bolt2A * 0.55, primary, accent);

      // Primary bolt
      const boltA = phaseAlpha(t, 0.14, 0.26, 0.58);
      drawBolt(ctx, bolt1, boltA, primary, accent);

      // White flash peak
      const flashA = phaseAlpha(t, 0.2, 0.3, 0.52);
      if (flashRef.current) {
        flashRef.current.style.opacity = Math.max(0, flashA * 0.88);
      }

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
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 99998, pointerEvents: 'none' }}>
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
      />
      <div
        ref={flashRef}
        style={{ position: 'absolute', inset: 0, background: 'white', opacity: 0 }}
      />
    </div>
  );
}

import { useEffect, useRef } from "react";

const NODE_COUNT    = 60;
const CONNECT_DIST  = 130;
const REPEL_DIST    = 150;
const MAX_SPEED     = 1.0;

/**
 * Animated canvas background — floating nodes connected by lines,
 * reacting to mouse movement with a soft repulsion effect.
 * Adapts colours automatically to light / dark mode.
 */
export default function NeuralBg() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let w = 0, h = 0, nodes = [], rafId;
    const mouse = { x: -9999, y: -9999 };

    const resize = () => {
      w = canvas.width  = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x:  Math.random() * w,
        y:  Math.random() * h,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r:  Math.random() * 1.5 + 0.8,
      }));
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    window.addEventListener("mousemove", onMove, { passive: true });

    const loop = () => {
      ctx.clearRect(0, 0, w, h);

      const dark      = document.documentElement.classList.contains("dark");
      const nodeAlpha = dark ? 0.45 : 0.70;
      const lineAlpha = dark ? 0.18 : 0.35;
      const nodeRGB   = dark ? "129,140,248" : "79,70,229";
      const lineRGB   = dark ? "139,92,246"  : "99,60,240";

      nodes.forEach((n) => {
        const dx = n.x - mouse.x;
        const dy = n.y - mouse.y;
        const d  = Math.sqrt(dx * dx + dy * dy);
        if (d < REPEL_DIST && d > 0) {
          const force = ((REPEL_DIST - d) / REPEL_DIST) * 0.6;
          n.vx += (dx / d) * force;
          n.vy += (dy / d) * force;
        }
        n.vx *= 0.985;
        n.vy *= 0.985;
        const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (spd > MAX_SPEED) { n.vx = (n.vx / spd) * MAX_SPEED; n.vy = (n.vy / spd) * MAX_SPEED; }
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -20) n.x = w + 20;
        if (n.x > w + 20) n.x = -20;
        if (n.y < -20) n.y = h + 20;
        if (n.y > h + 20) n.y = -20;
      });

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < CONNECT_DIST) {
            const a = (1 - d / CONNECT_DIST) * lineAlpha;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = `rgba(${lineRGB},${a.toFixed(3)})`;
            ctx.lineWidth   = 0.8;
            ctx.stroke();
          }
        }
      }

      nodes.forEach((n) => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${nodeRGB},${nodeAlpha})`;
        ctx.fill();
      });

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    return () => {
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

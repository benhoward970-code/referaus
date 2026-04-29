"use client";
import { useEffect, useRef, useCallback } from "react";

/*
 * ParticleHands — Two hands reaching toward each other, rendered as tiny particles.
 * Uses an SVG path rendered offscreen to extract pixel positions for realistic hand shapes.
 */

// SVG path for a right hand reaching left (simplified Creation of Adam style)
// This gets drawn to an offscreen canvas, then sampled for particle positions
const HAND_SVG_PATH = "M 90 180 C 85 170 80 155 78 140 C 76 130 78 120 80 110 C 82 100 85 92 88 85 C 90 80 92 74 95 70 L 100 60 C 102 55 105 48 108 42 C 112 35 115 28 118 22 C 120 18 122 15 125 14 C 128 13 130 15 130 20 C 130 25 128 32 126 38 C 124 44 122 50 120 56 L 115 68 C 118 60 122 50 126 42 C 130 34 134 26 138 20 C 140 16 142 13 145 12 C 148 11 150 13 150 18 C 150 23 148 30 145 38 C 142 45 139 52 136 60 L 130 72 C 134 62 138 52 143 43 C 147 35 151 28 155 22 C 158 18 160 15 163 14 C 166 14 167 17 166 22 C 165 28 162 36 158 44 C 155 52 151 60 148 68 L 142 80 C 146 72 150 64 155 56 C 159 49 162 43 166 40 C 168 38 170 37 172 38 C 174 39 174 42 173 46 C 171 52 168 58 164 66 C 160 73 156 80 152 88 L 145 100 C 148 95 152 88 156 84 C 159 80 162 78 164 78 C 166 78 167 80 166 84 C 165 88 162 93 158 98 C 155 103 150 108 146 112 L 138 122 C 140 130 140 140 138 150 C 136 158 132 166 128 172 C 124 178 118 182 112 184 C 105 186 98 186 92 184 Z";

interface Particle {
  x: number; y: number;
  tx: number; ty: number;
  s: number; o: number;
  sp: number; phase: number;
  wx: number; wy: number; ws: number;
}

function sampleHandPoints(path: string, count: number, mirror: boolean, cw: number, ch: number): [number, number][] {
  // Draw hand to offscreen canvas, sample dark pixels
  const size = 200;
  const offscreen = document.createElement("canvas");
  offscreen.width = size;
  offscreen.height = size;
  const ctx = offscreen.getContext("2d");
  if (!ctx) return [];

  ctx.fillStyle = "#000";
  const p = new Path2D(path);
  ctx.fill(p);

  const imageData = ctx.getImageData(0, 0, size, size);
  const pixels: [number, number][] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const a = imageData.data[(y * size + x) * 4 + 3];
      if (a > 128) pixels.push([x / size, y / size]);
    }
  }

  if (pixels.length === 0) return [];

  // Sample random points from filled area
  const points: [number, number][] = [];
  for (let i = 0; i < count; i++) {
    const pt = pixels[Math.floor(Math.random() * pixels.length)];
    let nx = pt[0];
    const ny = pt[1];
    // Scale and position: left hand occupies ~left 45%, right hand ~right 45%
    if (mirror) {
      nx = 0.55 + (1 - nx) * 0.4;
    } else {
      nx = 0.05 + nx * 0.4;
    }
    const sy = 0.08 + ny * 0.7;
    points.push([nx * cw, sy * ch]);
  }
  return points;
}

function makeParticles(points: [number, number][], w: number, h: number): Particle[] {
  return points.map(([tx, ty]) => ({
    x: Math.random() * w,
    y: Math.random() * h,
    tx, ty,
    s: 0.4 + Math.random() * 1.2,
    o: 0.25 + Math.random() * 0.75,
    sp: 0.005 + Math.random() * 0.01,
    phase: Math.random() * Math.PI * 2,
    wx: Math.random() * 1.2,
    wy: Math.random() * 1.2,
    ws: 0.3 + Math.random() * 1,
  }));
}

export function ParticleHands() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const leftRef = useRef<Particle[]>([]);
  const rightRef = useRef<Particle[]>([]);
  const tRef = useRef(0);
  const readyRef = useRef(false);

  const init = useCallback(() => {
    const c = canvasRef.current;
    if (!c) return;
    const r = c.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = r.width * dpr;
    c.height = r.height * dpr;
    const ctx = c.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
    const w = r.width, h = r.height;
    const mobile = w < 640;
    const n = mobile ? 400 : 700;

    const leftPts = sampleHandPoints(HAND_SVG_PATH, n, false, w, h);
    const rightPts = sampleHandPoints(HAND_SVG_PATH, n, true, w, h);
    leftRef.current = makeParticles(leftPts, w, h);
    rightRef.current = makeParticles(rightPts, w, h);
    readyRef.current = true;
  }, []);

  useEffect(() => {
    init();
    const c = canvasRef.current;
    if (!c) return;

    const loop = () => {
      const ctx = c.getContext("2d");
      if (!ctx || !readyRef.current) { animRef.current = requestAnimationFrame(loop); return; }
      const r = c.getBoundingClientRect();
      const w = r.width, h = r.height;
      tRef.current += 0.016;
      const t = tRef.current;
      ctx.clearRect(0, 0, w, h);

      const draw = (ps: Particle[], color: string) => {
        ctx.fillStyle = color;
        for (const p of ps) {
          p.x += (p.tx - p.x) * p.sp;
          p.y += (p.ty - p.y) * p.sp;
          const dx = p.x + Math.sin(t * p.ws + p.phase) * p.wx;
          const dy = p.y + Math.cos(t * p.ws + p.phase * 1.3) * p.wy;
          ctx.globalAlpha = p.o * (0.55 + 0.45 * Math.sin(t * 1.1 + p.phase));
          ctx.beginPath();
          ctx.arc(dx, dy, p.s, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      // Spark particles between fingertips
      const glow = 0.2 + 0.15 * Math.sin(t * 2.5);
      ctx.globalAlpha = glow;
      for (let i = 0; i < 15; i++) {
        const gx = w * 0.5 + (Math.random() - 0.5) * w * 0.06;
        const gy = h * 0.35 + (Math.random() - 0.5) * h * 0.08;
        ctx.beginPath();
        ctx.arc(gx, gy, 0.3 + Math.random() * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = Math.random() > 0.5 ? "#2563eb" : "#f97316";
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      draw(leftRef.current, "#2563eb");
      draw(rightRef.current, "#f97316");
      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    const onResize = () => init();
    window.addEventListener("resize", onResize);
    return () => { cancelAnimationFrame(animRef.current); window.removeEventListener("resize", onResize); };
  }, [init]);

  return (
    <section className="relative w-full bg-gray-950 overflow-hidden" style={{ height: "50vh", maxHeight: "480px" }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ display: "block" }} />
      <div className="absolute left-[8%] sm:left-[15%] bottom-[14%] sm:bottom-[18%] text-blue-400/50 text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase select-none">
        Participant
      </div>
      <div className="absolute right-[8%] sm:right-[15%] bottom-[14%] sm:bottom-[18%] text-orange-400/50 text-[10px] sm:text-xs font-medium tracking-[0.2em] uppercase select-none text-right">
        Provider
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-end pb-6 sm:pb-10 pointer-events-none">
        <h2
          className="text-xl sm:text-3xl lg:text-4xl font-bold text-white text-center mb-1.5 tracking-tight"
          style={{ fontFamily: "'Oswald', sans-serif", fontWeight: 700 }}
        >
          Connecting Participants{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-orange-400">
            with Providers
          </span>
        </h2>
        <p className="text-gray-500 text-[10px] sm:text-xs mb-4 tracking-wider uppercase text-center">
          Australia&apos;s NDIS Marketplace
        </p>
        <div className="flex gap-3 pointer-events-auto">
          <a href="/providers" className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all hover:-translate-y-0.5">
            Find Providers
          </a>
          <a href="/register?role=provider" className="px-4 py-2 rounded-lg bg-orange-500 hover:bg-orange-400 text-white font-semibold text-xs transition-all hover:-translate-y-0.5">
            List Your Business
          </a>
        </div>
      </div>
    </section>
  );
}

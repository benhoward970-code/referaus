"use client";
import { useEffect, useRef } from "react";

/*
 * AuroraBackground — Animated flowing blue/orange light waves on dark background.
 * Uses canvas with layered gradient blobs that drift and morph.
 * Performant: single requestAnimationFrame loop, no libraries.
 */

interface Blob {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  color: string;
  phase: number;
  speed: number;
}

const COLORS = [
  "rgba(37,99,235,0.25)",   // blue
  "rgba(59,130,246,0.18)",  // lighter blue
  "rgba(249,115,22,0.22)",  // orange
  "rgba(234,88,12,0.15)",   // darker orange
  "rgba(37,99,235,0.12)",   // blue faint
  "rgba(249,115,22,0.10)",  // orange faint
  "rgba(96,165,250,0.12)",  // sky blue
  "rgba(251,146,60,0.12)",  // light orange
];

function createBlobs(w: number, h: number): Blob[] {
  return COLORS.map((color, i) => ({
    x: w * (0.15 + Math.random() * 0.7),
    y: h * (0.15 + Math.random() * 0.7),
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.3,
    r: Math.max(w, h) * (0.2 + Math.random() * 0.25),
    color,
    phase: (i / COLORS.length) * Math.PI * 2,
    speed: 0.3 + Math.random() * 0.5,
  }));
}

export function AuroraBackground({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const blobsRef = useRef<Blob[]>([]);
  const tRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      blobsRef.current = createBlobs(rect.width, rect.height);
    };

    resize();

    const loop = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) { animRef.current = requestAnimationFrame(loop); return; }
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      tRef.current += 0.008;
      const t = tRef.current;

      // Dark background
      ctx.fillStyle = "#030712"; // gray-950
      ctx.fillRect(0, 0, w, h);

      // Enable compositing for glow effect
      ctx.globalCompositeOperation = "lighter";

      for (const b of blobsRef.current) {
        // Organic movement
        b.x += b.vx + Math.sin(t * b.speed + b.phase) * 0.6;
        b.y += b.vy + Math.cos(t * b.speed * 0.7 + b.phase) * 0.4;

        // Bounce off edges softly
        if (b.x < -b.r * 0.5) b.vx = Math.abs(b.vx) * 0.8 + 0.1;
        if (b.x > w + b.r * 0.5) b.vx = -Math.abs(b.vx) * 0.8 - 0.1;
        if (b.y < -b.r * 0.5) b.vy = Math.abs(b.vy) * 0.8 + 0.05;
        if (b.y > h + b.r * 0.5) b.vy = -Math.abs(b.vy) * 0.8 - 0.05;

        // Morphing radius
        const mr = b.r * (0.85 + 0.15 * Math.sin(t * b.speed * 1.3 + b.phase));

        // Draw radial gradient blob
        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, mr);
        grad.addColorStop(0, b.color);
        grad.addColorStop(0.4, b.color.replace(/[\d.]+\)$/, "0.15)"));
        grad.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.ellipse(
          b.x, b.y,
          mr * (1 + 0.2 * Math.sin(t * 0.9 + b.phase)),
          mr * (1 + 0.2 * Math.cos(t * 0.7 + b.phase)),
          t * 0.1 + b.phase,
          0, Math.PI * 2
        );
        ctx.fill();
      }

      // Reset composite
      ctx.globalCompositeOperation = "source-over";

      // Subtle noise/grain overlay
      ctx.fillStyle = "rgba(0,0,0,0.03)";
      for (let i = 0; i < 80; i++) {
        ctx.fillRect(
          Math.random() * w,
          Math.random() * h,
          Math.random() * 2 + 1,
          Math.random() * 2 + 1
        );
      }

      animRef.current = requestAnimationFrame(loop);
    };

    animRef.current = requestAnimationFrame(loop);
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${className}`}
      style={{ display: "block" }}
      aria-hidden="true"
    />
  );
}

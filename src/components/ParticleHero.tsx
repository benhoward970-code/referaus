"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";

// Hand point clouds - left hand (participant, orange) reaching right
// Right hand (provider, blue) reaching left
// Coordinates are normalized 0-1, will be scaled to canvas

function getLeftHandPoints(): [number, number][] {
  // Left hand reaching right - fingertips pointing right
  const pts: [number, number][] = [];
  // Palm
  for (let x = 0.05; x < 0.22; x += 0.025) {
    for (let y = 0.38; y < 0.62; y += 0.025) {
      pts.push([x, y]);
    }
  }
  // Thumb (pointing up-right)
  for (let i = 0; i < 8; i++) {
    pts.push([0.12 + i * 0.018, 0.33 - i * 0.022]);
  }
  // Index finger
  for (let i = 0; i < 10; i++) {
    pts.push([0.22 + i * 0.02, 0.36 - i * 0.005]);
  }
  // Middle finger
  for (let i = 0; i < 11; i++) {
    pts.push([0.22 + i * 0.02, 0.44 - i * 0.003]);
  }
  // Ring finger
  for (let i = 0; i < 10; i++) {
    pts.push([0.22 + i * 0.02, 0.52 + i * 0.002]);
  }
  // Pinky
  for (let i = 0; i < 8; i++) {
    pts.push([0.22 + i * 0.018, 0.59 + i * 0.005]);
  }
  // Wrist
  for (let x = 0.0; x < 0.07; x += 0.02) {
    for (let y = 0.42; y < 0.58; y += 0.025) {
      pts.push([x, y]);
    }
  }
  return pts;
}

function getRightHandPoints(): [number, number][] {
  // Right hand reaching left - mirror of left hand
  const left = getLeftHandPoints();
  return left.map(([x, y]) => [1 - x, y]);
}

interface Particle {
  x: number;
  y: number;
  tx: number; // target x
  ty: number; // target y
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  noiseOffsetX: number;
  noiseOffsetY: number;
}

export default function ParticleHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let particles: Particle[] = [];
    let width = 0;
    let height = 0;
    // Approach progress: 0 = far apart, 1 = fingertips almost touching
    let approachT = 0;
    const APPROACH_SPEED = 0.0008;
    const MAX_APPROACH = 0.72;

    const ORANGE = "#f97316";
    const BLUE = "#2563eb";

    function resize() {
      width = canvas!.offsetWidth;
      height = canvas!.offsetHeight;
      canvas!.width = width;
      canvas!.height = height;
      buildParticles();
    }

    function buildParticles() {
      particles = [];
      const leftPts = getLeftHandPoints();
      const rightPts = getRightHandPoints();

      // Section dimensions - hands occupy middle 80% height, side thirds of width
      const handAreaH = height * 0.7;
      const handAreaY = height * 0.15;

      // Left hand in left 40% of canvas
      const lw = width * 0.38;
      const lx = width * 0.02;

      // Right hand in right 40% of canvas
      const rw = width * 0.38;
      const rx = width * 0.6;

      for (const [nx, ny] of leftPts) {
        const tx = lx + nx * lw;
        const ty = handAreaY + ny * handAreaH;
        particles.push({
          x: tx + (Math.random() - 0.5) * 120,
          y: ty + (Math.random() - 0.5) * 120,
          tx,
          ty,
          vx: 0,
          vy: 0,
          size: 1.5 + Math.random() * 1.5,
          alpha: 0.5 + Math.random() * 0.5,
          color: ORANGE,
          noiseOffsetX: Math.random() * 1000,
          noiseOffsetY: Math.random() * 1000,
        });
      }

      for (const [nx, ny] of rightPts) {
        const tx = rx + nx * rw;
        const ty = handAreaY + ny * handAreaH;
        particles.push({
          x: tx + (Math.random() - 0.5) * 120,
          y: ty + (Math.random() - 0.5) * 120,
          tx,
          ty,
          vx: 0,
          vy: 0,
          size: 1.5 + Math.random() * 1.5,
          alpha: 0.5 + Math.random() * 0.5,
          color: BLUE,
          noiseOffsetX: Math.random() * 1000,
          noiseOffsetY: Math.random() * 1000,
        });
      }
    }

    // Simple smooth noise approximation
    function smoothNoise(t: number): number {
      return (
        Math.sin(t * 1.3) * 0.5 +
        Math.sin(t * 2.7 + 1.2) * 0.3 +
        Math.sin(t * 5.1 + 2.4) * 0.2
      );
    }

    function draw(timestamp: number) {
      const dt = Math.min(timestamp - timeRef.current, 32);
      timeRef.current = timestamp;

      // Approach oscillates: goes forward then retreats slightly
      approachT = Math.min(approachT + APPROACH_SPEED * dt, MAX_APPROACH);
      // Subtle breathing: slight oscillation around current approach
      const breathe = Math.sin(timestamp * 0.0005) * 0.015;
      const effectiveApproach = approachT + breathe;

      ctx!.clearRect(0, 0, width, height);

      for (const p of particles) {
        // Compute animated target: interpolate toward center gap based on approach
        // For left hand (orange): move right as approach increases
        // For right hand (blue): move left
        const isLeft = p.color === ORANGE;
        const shift = effectiveApproach * width * 0.28 * (isLeft ? 1 : -1);
        const atx = p.tx + shift;
        const aty = p.ty;

        // Drift noise
        const t = timestamp * 0.0003;
        const nx = smoothNoise(t + p.noiseOffsetX) * 3;
        const ny = smoothNoise(t * 1.1 + p.noiseOffsetY) * 3;

        // Spring toward animated target + noise
        const dx = atx + nx - p.x;
        const dy = aty + ny - p.y;
        p.vx += dx * 0.04;
        p.vy += dy * 0.04;
        p.vx *= 0.82;
        p.vy *= 0.82;
        p.x += p.vx;
        p.y += p.vy;

        // Draw
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx!.fillStyle =
          p.color === ORANGE
            ? `rgba(249,115,22,${p.alpha})`
            : `rgba(37,99,235,${p.alpha})`;
        ctx!.fill();
      }

      // Subtle connection lines between closest orange/blue particles
      if (approachT > 0.3) {
        const leftTips = particles
          .filter((p) => p.color === ORANGE)
          .sort((a, b) => b.x - a.x)
          .slice(0, 6);
        const rightTips = particles
          .filter((p) => p.color === BLUE)
          .sort((a, b) => a.x - b.x)
          .slice(0, 6);

        for (const lp of leftTips) {
          for (const rp of rightTips) {
            const dist = Math.hypot(lp.x - rp.x, lp.y - rp.y);
            if (dist < 80) {
              const lineAlpha = (1 - dist / 80) * 0.25 * (approachT / MAX_APPROACH);
              const grad = ctx!.createLinearGradient(lp.x, lp.y, rp.x, rp.y);
              grad.addColorStop(0, `rgba(249,115,22,${lineAlpha})`);
              grad.addColorStop(1, `rgba(37,99,235,${lineAlpha})`);
              ctx!.beginPath();
              ctx!.moveTo(lp.x, lp.y);
              ctx!.lineTo(rp.x, rp.y);
              ctx!.strokeStyle = grad;
              ctx!.lineWidth = 0.8;
              ctx!.stroke();
            }
          }
        }
      }

      frameRef.current = requestAnimationFrame(draw);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    timeRef.current = performance.now();
    frameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameRef.current);
      ro.disconnect();
    };
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-gray-950" style={{ minHeight: "560px" }}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: "block" }}
      />

      {/* Text overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full min-h-[560px] px-4 text-center pointer-events-none">
        <h1
          className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-3 leading-tight"
          style={{ fontFamily: "'Oswald', sans-serif", textShadow: "0 2px 20px rgba(0,0,0,0.8)" }}
        >
          Connecting Participants
          <br />
          with Providers
        </h1>
        <p
          className="text-lg sm:text-xl text-gray-300 mb-8"
          style={{ textShadow: "0 1px 8px rgba(0,0,0,0.9)" }}
        >
          Australia&apos;s NDIS Marketplace
        </p>
        <div className="flex flex-col sm:flex-row gap-4 pointer-events-auto">
          <Link
            href="/providers"
            className="px-7 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105 hover:brightness-110"
            style={{ background: "#f97316", boxShadow: "0 4px 20px rgba(249,115,22,0.4)" }}
          >
            Find Providers
          </Link>
          <Link
            href="/list-business"
            className="px-7 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-105 hover:brightness-110"
            style={{ background: "#2563eb", boxShadow: "0 4px 20px rgba(37,99,235,0.4)" }}
          >
            List Your Business
          </Link>
        </div>
      </div>
    </section>
  );
}

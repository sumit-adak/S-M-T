'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  angle: number;
  speed: number;
  distance: number;
  maxDistance: number;
  radius: number;
  color: string;
  alpha: number;
}

export function SpiralAnimation({ onComplete }: { onComplete?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();
    const DURATION = 4200; // 4.2 seconds

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate 1200 glowing galaxy particles
    const particleCount = 1200;
    const particles: Particle[] = [];
    const colors = ['#ffffff', '#a855f7', '#c084fc', '#38bdf8', '#e879f9'];

    const maxRadius = Math.max(width, height) * 0.55;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const distRatio = Math.pow(Math.random(), 1.4);
      particles.push({
        radius: Math.random() * 3 + 1.5,
        angle: angle + distRatio * Math.PI * 4,
        speed: 0.003 + Math.random() * 0.005,
        distance: distRatio * maxRadius,
        maxDistance: maxRadius + Math.random() * 250,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: Math.random() * 0.75 + 0.25,
      });
    }

    const render = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / DURATION);

      // Deep cosmic black background with subtle trail blur
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Spiral rotation angle over time
      const rot = progress * Math.PI * 3.5;

      // Draw glowing galaxy core
      ctx.save();
      const coreRadius = Math.max(120, Math.min(width, height) * 0.25) * (0.8 + progress * 0.6);
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreRadius);
      gradient.addColorStop(0, 'rgba(168, 85, 247, 0.9)');
      gradient.addColorStop(0.35, 'rgba(56, 189, 248, 0.5)');
      gradient.addColorStop(0.7, 'rgba(192, 132, 252, 0.2)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, coreRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Draw 1200 glowing galaxy particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.speed;
        const currentDistance = (p.distance + progress * 180) % p.maxDistance;

        const currentAngle = p.angle + rot;
        const r = currentDistance * (0.35 + progress * 0.75);

        const px = cx + Math.cos(currentAngle) * r;
        const py = cy + Math.sin(currentAngle) * r;

        ctx.save();
        ctx.globalAlpha = p.alpha * Math.min(1, progress * 4);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 12;

        ctx.beginPath();
        ctx.arc(px, py, p.radius * (1 + progress * 0.6), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (progress < 1) {
        animId = requestAnimationFrame(render);
      } else {
        onCompleteRef.current?.();
      }
    };

    animId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#000000',
        zIndex: 9999,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '100vw',
          height: '100vh',
        }}
      />
    </div>
  );
}

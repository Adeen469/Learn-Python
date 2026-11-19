'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';

// Tilt — the 3D tilt-toward-the-cursor effect from React Bits'
// ProfileCard, extracted as a small wrapper so it can tilt any card
// (here: the ChromaGrid course cards). The spring engine is
// ProfileCard's: a stiff spring (120) with damping (16) chases the
// cursor's normalized position over the card and writes rotateX /
// rotateY as CSS vars. No holo foil or glare here — ChromaGrid
// already supplies the glow. Respects prefers-reduced-motion.

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export interface TiltProps {
  children: ReactNode;
  /** Largest tilt angle, in degrees. ProfileCard's default is 12; the usage example uses 8. */
  tiltStrength?: number;
  enableTilt?: boolean;
  className?: string;
  style?: CSSProperties;
}

export default function Tilt({
  children,
  tiltStrength = 8,
  enableTilt = true,
  className = '',
  style
}: TiltProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef({ enableTilt, tiltStrength });
  settingsRef.current = { enableTilt, tiltStrength };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const x = { p: 0, v: 0, target: 0 };
    const y = { p: 0, v: 0, target: 0 };
    let raf = 0;
    let last = 0;

    const write = () => {
      const { enableTilt: on, tiltStrength: strength } = settingsRef.current;
      const angle = on && !reduced ? strength : 0;
      root.style.setProperty('--tilt-rx', `${(y.p * angle).toFixed(3)}deg`);
      root.style.setProperty('--tilt-ry', `${(-x.p * angle).toFixed(3)}deg`);
    };

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000 || 0);
      last = now;
      const stiffness = 120;
      const damping = 16;
      const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        for (const axis of [x, y]) {
          axis.v += (stiffness * (axis.target - axis.p) - damping * axis.v) * h;
          axis.p += axis.v * h;
        }
      }
      write();
      const moving =
        Math.abs(x.target - x.p) > 0.0005 ||
        Math.abs(y.target - y.p) > 0.0005 ||
        Math.abs(x.v) > 0.0005 ||
        Math.abs(y.v) > 0.0005;
      if (moving) {
        raf = requestAnimationFrame(frame);
      } else {
        x.p = x.target;
        y.p = y.target;
        write();
        raf = 0;
      }
    };

    const wake = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };

    const aim = (nx: number, ny: number) => {
      x.target = clamp(nx, -1, 1);
      y.target = clamp(ny, -1, 1);
      wake();
    };

    const aimAt = (event: PointerEvent) => {
      const rect = root.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      aim(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        ((event.clientY - rect.top) / rect.height) * 2 - 1
      );
    };

    const release = () => aim(0, 0);

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') aimAt(event);
    };
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') release();
    };

    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    return () => {
      cancelAnimationFrame(raf);
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      className={className}
      style={{
        transform:
          'perspective(1000px) rotateX(var(--tilt-rx, 0deg)) rotateY(var(--tilt-ry, 0deg))',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
        ...style
      }}
    >
      {children}
    </div>
  );
}

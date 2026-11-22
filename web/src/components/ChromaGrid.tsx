'use client';

import Link from 'next/link';
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import Tilt from '@/components/Tilt';
import './ChromaGrid.css';

// ChromaGrid — vendored from React Bits (reactbits.dev), converted
// to TypeScript. A grid of cards whose images sit grayscale and dim
// until the cursor reveals them in color, with an accent glow from
// the bottom and a lit border near the cursor.
//
// Local adaptations (kept minimal, marked where they land):
// - Internal urls ("/courses/...") render through Next Link so a
//   card tap stays a client-side navigation; only external urls
//   open a new tab. The upstream component always opened a new tab.
// - ChromaItem.details: optional extra content under the title /
//   subtitle (the course cards keep their tagline + counts footer
//   inside the Chroma card instead of losing it to the image grid).
// - enableTilt / tiltStrength: each card is wrapped in the Tilt
//   effect extracted from React Bits' ProfileCard, so the course
//   cards tilt toward the cursor as well as revealing color.

const THEMES: Record<string, Record<string, string>> = {
  dark: {
    '--chroma-frame': 'rgba(23, 23, 23, 0.66)',
    '--chroma-frame-edge': 'rgba(255, 255, 255, 0.08)',
    '--chroma-frame-highlight': 'rgba(255, 255, 255, 0.07)',
    '--chroma-frame-shadow': '0 22px 44px -20px rgba(0, 0, 0, 0.8), 0 6px 16px -8px rgba(0, 0, 0, 0.5)',
    '--chroma-tile': 'linear-gradient(180deg, #262626 0%, #171717 100%)',
    '--chroma-tile-edge': 'rgba(255, 255, 255, 0.07)',
    '--chroma-tile-highlight': 'rgba(255, 255, 255, 0.12)',
    '--chroma-tile-shadow': '0 4px 10px -4px rgba(0, 0, 0, 0.7)',
    '--chroma-media-edge': 'rgba(255, 255, 255, 0.06)',
    '--chroma-well': 'rgba(255, 255, 255, 0.08)',
    '--chroma-ink': '#f4f4f5',
    '--chroma-muted': 'rgba(244, 244, 245, 0.55)',
    '--chroma-hover': 'brightness(1.12)',
    '--chroma-press': 'brightness(0.85)'
  },
  light: {
    '--chroma-frame': 'rgba(240, 240, 243, 0.8)',
    '--chroma-frame-edge': 'rgba(24, 24, 27, 0.07)',
    '--chroma-frame-highlight': 'rgba(255, 255, 255, 0.95)',
    '--chroma-frame-shadow': '0 22px 44px -22px rgba(24, 24, 27, 0.3), 0 6px 16px -10px rgba(24, 24, 27, 0.16)',
    '--chroma-tile': 'linear-gradient(180deg, #ffffff 0%, #f6f6f8 100%)',
    '--chroma-tile-edge': 'rgba(24, 24, 27, 0.08)',
    '--chroma-tile-highlight': 'rgba(255, 255, 255, 1)',
    '--chroma-tile-shadow': '0 4px 10px -5px rgba(24, 24, 27, 0.25)',
    '--chroma-media-edge': 'rgba(24, 24, 27, 0.06)',
    '--chroma-well': 'rgba(24, 24, 27, 0.05)',
    '--chroma-ink': '#27272a',
    '--chroma-muted': 'rgba(39, 39, 42, 0.55)',
    '--chroma-hover': 'brightness(0.97)',
    '--chroma-press': 'brightness(0.92)'
  }
};

const DEFAULT_ITEMS: ChromaItem[] = [
  {
    image: 'https://images.unsplash.com/photo-1514519334989-3d5c8b1a9f91?w=800&q=80&auto=format&fit=crop',
    title: 'Golden Hour',
    subtitle: 'Sky study',
    accent: '#ff8a4c'
  },
  {
    image: 'https://images.unsplash.com/photo-1520930528075-4ea5ead759f5?w=800&q=80&auto=format&fit=crop',
    title: 'Steel Arches',
    subtitle: 'Sculpture',
    accent: '#ff5a36'
  },
  {
    image: 'https://images.unsplash.com/photo-1511300636408-a63a89df3482?w=800&q=80&auto=format&fit=crop',
    title: 'Black Beach',
    subtitle: 'Landscape',
    accent: '#a98bff'
  },
  {
    image: 'https://images.unsplash.com/photo-1524400968894-6e997a66e03f?w=800&q=80&auto=format&fit=crop',
    title: 'Cloud Front',
    subtitle: 'Weather',
    accent: '#ffb27a'
  },
  {
    image: 'https://images.unsplash.com/photo-1778849097774-0ab2a873a858?w=800&q=80&auto=format&fit=crop',
    title: 'Pink Drift',
    subtitle: 'Sky study',
    accent: '#ff7eb6'
  },
  {
    image: 'https://images.unsplash.com/photo-1501630834273-4b5604d2ee31?w=800&q=80&auto=format&fit=crop',
    title: 'Cumulus',
    subtitle: 'Weather',
    accent: '#7cc4ff'
  }
];

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const falloffStops = (softness: number) => {
  const core = clamp(1 - softness, 0, 0.95);
  const stops: string[] = [];
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const u = clamp((t - core) / Math.max(0.0001, 1 - core), 0, 1);
    const alpha = 1 - u * u * u * (u * (u * 6 - 15) + 10);
    stops.push(`rgba(0, 0, 0, ${alpha.toFixed(3)}) ${(t * 100).toFixed(1)}%`);
  }
  return stops.join(', ');
};

export interface ChromaItem {
  image: string;
  title?: string;
  subtitle?: string;
  accent?: string;
  borderColor?: string;
  url?: string;
  alt?: string;
  /** Local adaptation: extra content under the title/subtitle inside the card. */
  details?: ReactNode;
}

export interface ChromaGridProps {
  items?: ChromaItem[];
  columns?: number;
  minCardWidth?: number;
  gap?: number;
  radius?: number;
  softness?: number;
  damping?: number;
  fadeOut?: number;
  grayscale?: number;
  dim?: number;
  glow?: number;
  borderGlow?: number;
  reveal?: 'spotlight' | 'card';
  aspectRatio?: string;
  cardRadius?: number;
  showInfo?: boolean;
  frame?: boolean;
  theme?: 'dark' | 'light';
  className?: string;
  /** Local adaptation: tilt each card toward the cursor (ProfileCard's tilt). */
  enableTilt?: boolean;
  /** Local adaptation: largest tilt angle, in degrees. */
  tiltStrength?: number;
}

export const ChromaGrid = ({
  items,
  columns = 3,
  minCardWidth = 180,
  gap = 12,
  radius = 260,
  softness = 0.6,
  damping = 0.45,
  fadeOut = 0.6,
  grayscale = 1,
  dim = 0.12,
  glow = 0.5,
  borderGlow = 1,
  reveal = 'spotlight',
  aspectRatio = '3 / 2',
  cardRadius = 22,
  showInfo = true,
  frame = false,
  theme = 'dark',
  className = '',
  enableTilt = true,
  tiltStrength = 8
}: ChromaGridProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<{ damping: number; fadeOut: number; spotlight: boolean } | null>(null);
  const placeRef = useRef<(() => void) | null>(null);
  const data = items?.length ? items : DEFAULT_ITEMS;
  settingsRef.current = { damping, fadeOut, spotlight: reveal !== 'card' };
  // A dead image never shows a broken-image icon: the card falls back
  // to the item's initial letter, the same fallback the old creator
  // card used for a dead avatar.
  const [failedImages, setFailedImages] = useState<ReadonlySet<number>>(new Set());
  const markImageFailed = (index: number) => {
    setFailedImages((prev) => {
      if (prev.has(index)) return prev;
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  };

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    const state = { x: 0, y: 0, tx: 0, ty: 0, power: 0, target: 0, primed: false };
    let raf = 0;
    let last = 0;

    const place = () => {
      const box = root.getBoundingClientRect();
      root.querySelectorAll('[data-chroma-area]').forEach((node) => {
        const el = node as HTMLElement;
        const rect = el.getBoundingClientRect();
        el.style.setProperty('--chroma-ox', `${rect.left - box.left}px`);
        el.style.setProperty('--chroma-oy', `${rect.top - box.top}px`);
      });
    };
    placeRef.current = place;

    const frame = (now: number) => {
      raf = 0;
      const s = settingsRef.current;
      if (!s) return;
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 1 / 60;
      last = now;
      const follow = reduce ? 1 : 1 - Math.exp(-dt / Math.max(0.01, s.damping * 0.32));
      state.x += (state.tx - state.x) * follow;
      state.y += (state.ty - state.y) * follow;
      const span = state.target > state.power ? 0.1 : Math.max(0.02, s.fadeOut * 0.35);
      state.power += (state.target - state.power) * (reduce ? 1 : 1 - Math.exp(-dt / span));
      root.style.setProperty('--chroma-x', `${state.x.toFixed(2)}px`);
      root.style.setProperty('--chroma-y', `${state.y.toFixed(2)}px`);
      root.style.setProperty('--chroma-power', state.power.toFixed(4));
      const settled =
        Math.abs(state.tx - state.x) < 0.1 &&
        Math.abs(state.ty - state.y) < 0.1 &&
        Math.abs(state.target - state.power) < 0.002;
      if (settled) {
        state.power = state.target;
        root.style.setProperty('--chroma-power', state.power.toFixed(4));
        last = 0;
      } else {
        raf = requestAnimationFrame(frame);
      }
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };

    const onMove = (event: PointerEvent) => {
      if (!settingsRef.current?.spotlight) return;
      const box = root.getBoundingClientRect();
      state.tx = event.clientX - box.left;
      state.ty = event.clientY - box.top;
      if (!state.primed || state.power < 0.02) {
        state.x = state.tx;
        state.y = state.ty;
        state.primed = true;
      }
      state.target = 1;
      wake();
    };

    const onLeave = () => {
      state.target = 0;
      wake();
    };

    const resizeObserver = new ResizeObserver(place);
    resizeObserver.observe(root);
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerdown', onMove);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('pointercancel', onLeave);
    place();

    return () => {
      cancelAnimationFrame(raf);
      resizeObserver.disconnect();
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerdown', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('pointercancel', onLeave);
      placeRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    placeRef.current?.();
  });

  const rootStyle = {
    ...(THEMES[theme] ?? THEMES.dark),
    '--chroma-cols': Math.max(1, Math.round(columns)),
    '--chroma-min': `${Math.max(80, minCardWidth)}px`,
    '--chroma-gap': `${Math.max(0, gap)}px`,
    '--chroma-r': `${Math.max(20, radius)}px`,
    '--chroma-stops': falloffStops(clamp(softness, 0, 1)),
    '--chroma-gray': clamp(grayscale, 0, 1),
    '--chroma-dim': clamp(dim, 0, 0.9),
    '--chroma-glow': clamp(glow, 0, 1),
    '--chroma-border': clamp(borderGlow, 0, 1),
    '--chroma-fade': `${Math.max(0, fadeOut)}s`,
    '--chroma-ratio': aspectRatio,
    '--chroma-radius': `${Math.max(0, cardRadius)}px`
  } as CSSProperties;

  return (
    <div
      ref={rootRef}
      className={`chroma-grid${frame ? ' has-frame' : ''}${className ? ` ${className}` : ''}`}
      data-reveal={reveal === 'card' ? 'card' : 'spotlight'}
      style={rootStyle}
    >
      <div className="chroma-grid-inner">
        {data.map((item, index) => {
          const accent = item.accent ?? item.borderColor ?? '#ffffff';
          const key = `${item.title}-${index}`;
          const cardStyle = { '--chroma-accent': accent } as CSSProperties;
          const body = (
            <>
              <span className="chroma-wash" aria-hidden="true" />
              <div className="chroma-media" data-chroma-area="">
                {failedImages.has(index) ? (
                  <span className="chroma-media-fallback" aria-hidden="true">
                    {(item.title ?? '?').charAt(0)}
                  </span>
                ) : (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="chroma-mono"
                      src={item.image}
                      alt={item.alt ?? item.title ?? ''}
                      loading="lazy"
                      onError={() => markImageFailed(index)}
                    />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="chroma-color"
                      src={item.image}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      onError={() => markImageFailed(index)}
                    />
                  </>
                )}
                <span className="chroma-media-rim" aria-hidden="true" />
              </div>
              {showInfo && (item.title || item.subtitle) && (
                <div className="chroma-info">
                  {item.title && <span className="chroma-title">{item.title}</span>}
                  {item.subtitle && <span className="chroma-subtitle">{item.subtitle}</span>}
                </div>
              )}
              {item.details && <div className="chroma-details">{item.details}</div>}
              <span className="chroma-card-rim" aria-hidden="true" />
              <span className="chroma-card-glow" aria-hidden="true" />
            </>
          );
          // Local adaptation: an internal url ("/courses/...") stays a
          // client-side navigation through Next Link; only an external
          // url opens a new tab. The upstream component always opened
          // a new tab, which would open every creator page in one.
          const card = item.url ? (
            item.url.startsWith('/') ? (
              <Link key={key} className="chroma-card" data-chroma-area="" style={cardStyle} href={item.url}>
                {body}
              </Link>
            ) : (
              <a
                key={key}
                className="chroma-card"
                data-chroma-area=""
                style={cardStyle}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {body}
              </a>
            )
          ) : (
            <article key={key} className="chroma-card" data-chroma-area="" style={cardStyle}>
              {body}
            </article>
          );
          // Local adaptation: tilt each card toward the cursor
          // (ProfileCard's tilt, extracted into Tilt). The wrapper is
          // the grid item, so it stretches to the row height and the
          // card fills it.
          return enableTilt ? (
            <Tilt key={key} tiltStrength={tiltStrength} className="chroma-tilt">
              {card}
            </Tilt>
          ) : (
            card
          );
        })}
      </div>
      {frame && <span className="chroma-frame-rim" aria-hidden="true" />}
    </div>
  );
};

export default ChromaGrid;

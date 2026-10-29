'use client';

// Adapted from the React Bits BounceCards source supplied with the project brief.
// Preserves its spring simulation; adds reduced-motion and native button support.
import { useEffect, useRef } from 'react';
import './BounceCards.css';

const PATTERN = [1, 0.5, -0.3, -1, 0.2, 0.75, -0.6, 0.35, -0.85, 0.1];
const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
const parseTransform = value => {
  if (typeof value !== 'string') return null;
  const r = value.match(/rotate\(\s*(-?[\d.]+)deg\s*\)/);
  const t = value.match(/translate\(\s*(-?[\d.]+)px(?:\s*,\s*(-?[\d.]+)px)?\s*\)/);
  return { x: t ? Number(t[1]) : 0, y: t?.[2] ? Number(t[2]) : 0, rotate: r ? Number(r[1]) : 0 };
};

export default function BounceCards({ images = [], className = '', style, containerWidth = 400, containerHeight = 400, cardSize = 200, spread = 85, rotation = 10, arc = 0, animationDelay = 0.5, animationStagger = 0.06, bounciness = 0.6, enableHover = true, pushDistance = 160, hoverScale = 1.06, borderWidth = 5, borderColor = '#fff', radius = 25, shadow = true, transformStyles, onCardClick }) {
  const rootRef = useRef(null);
  const cardRefs = useRef([]);
  const wakeRef = useRef(null);
  const clickRef = useRef(onCardClick);
  clickRef.current = onCardClick;
  const cards = images.map(item => typeof item === 'string' ? { src: item, alt: '' } : item);
  const middle = (cards.length - 1) / 2;
  const settings = {
    slots: cards.map((_, i) => parseTransform(transformStyles?.[i]) || { x: (i - middle) * spread, y: arc * ((i - middle) / Math.max(1, middle)) ** 2, rotate: rotation * PATTERN[i % PATTERN.length] }),
    cardSize: Math.max(10, cardSize), delay: Math.max(0, animationDelay), stagger: Math.max(0, animationStagger), bounciness: clamp(bounciness, 0, 1), enableHover, pushDistance, hoverScale: clamp(hoverScale, 0.5, 2),
  };
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  useEffect(() => {
    const root = rootRef.current;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bodies = [];
    const state = { hovered: -1, time: 0, layer: -2 };
    let raf = 0;
    let last = performance.now();
    let alive = true;
    const step = (value, velocity, target, stiffness, damping, dt) => {
      const next = velocity + ((target - value) * stiffness - velocity * damping) * dt;
      return [value + next * dt, next];
    };
    const frame = now => {
      raf = 0;
      if (!alive) return;
      const s = settingsRef.current;
      const dt = clamp((now - last) / 1000, 1 / 240, 1 / 30);
      last = now;
      state.time += dt;
      const hovered = s.enableHover ? state.hovered : -1;
      const substeps = Math.ceil(dt / (1 / 240));
      const h = dt / substeps;
      let moving = 0;
      s.slots.forEach((slot, i) => {
        const el = cardRefs.current[i];
        if (!el) return;
        const card = bodies[i] ||= { ...slot, scale: reduce ? 1 : 0, vx: 0, vy: 0, vr: 0, vs: 0, born: state.time };
        const appeared = reduce || state.time - card.born >= s.delay + i * s.stagger;
        let x = slot.x, y = slot.y, rotate = slot.rotate, scale = appeared ? 1 : 0;
        if (hovered >= 0 && appeared) {
          if (i === hovered) { y -= s.cardSize * 0.04; rotate = 0; scale = s.hoverScale; }
          else x += Math.sign(i - hovered) * s.pushDistance;
        }
        if (reduce) Object.assign(card, { x, y, rotate, scale, vx: 0, vy: 0, vr: 0, vs: 0 });
        else for (let k = 0; k < substeps; k++) {
          [card.x, card.vx] = step(card.x, card.vx, x, 210, 2 * 0.72 * Math.sqrt(210), h);
          [card.y, card.vy] = step(card.y, card.vy, y, 210, 2 * 0.72 * Math.sqrt(210), h);
          [card.rotate, card.vr] = step(card.rotate, card.vr, rotate, 210, 2 * 0.72 * Math.sqrt(210), h);
          [card.scale, card.vs] = step(card.scale, card.vs, scale, 170, 2 * (1 - 0.85 * s.bounciness) * Math.sqrt(170), h);
        }
        moving += Math.abs(card.vx) + Math.abs(card.vy) + Math.abs(card.vr) + Math.abs(card.vs) * 100 + Math.abs(x - card.x) + Math.abs(y - card.y) + Math.abs(rotate - card.rotate) + Math.abs(scale - card.scale) * 100 + (appeared ? 0 : 1);
        el.style.transform = `translate(-50%, -50%) translate3d(${card.x.toFixed(2)}px, ${card.y.toFixed(2)}px, 0) rotate(${card.rotate.toFixed(3)}deg) scale(${Math.max(0, card.scale).toFixed(4)})`;
      });
      if (state.layer !== hovered) {
        state.layer = hovered;
        cardRefs.current.forEach((el, i) => {
          if (!el) return;
          el.style.zIndex = i === hovered ? String(s.slots.length + 1) : String(i + 1);
          el.toggleAttribute('data-active', i === hovered);
        });
      }
      if (moving > 0.02) raf = requestAnimationFrame(frame);
    };
    const wake = () => {
      if (raf || !alive) return;
      last = performance.now(); raf = requestAnimationFrame(frame);
    };
    wakeRef.current = wake;
    const pick = event => {
      const s = settingsRef.current;
      const rect = root.getBoundingClientRect();
      const px = event.clientX - rect.left - rect.width / 2;
      const py = event.clientY - rect.top - rect.height / 2;
      let best = -1, distance = Infinity;
      s.slots.forEach((slot, i) => { const gap = Math.abs(px - slot.x); if (gap < distance) { distance = gap; best = i; } });
      if (best < 0 || Math.abs(py - s.slots[best].y) > s.cardSize / 2 + 12 || distance > s.cardSize / 2 + 12) return -1;
      return best;
    };
    const onMove = event => {
      if (event.pointerType === 'touch') return;
      const next = pick(event);
      if (next !== state.hovered) { state.hovered = next; wake(); }
    };
    const onLeave = () => { state.hovered = -1; wake(); };
    const onFocus = event => {
      const index = cardRefs.current.indexOf(event.target);
      if (index >= 0) { state.hovered = index; wake(); }
    };
    root.addEventListener('pointermove', onMove);
    root.addEventListener('pointerleave', onLeave);
    root.addEventListener('focusin', onFocus);
    root.addEventListener('focusout', onLeave);
    wake();
    return () => {
      alive = false; cancelAnimationFrame(raf); wakeRef.current = null;
      root.removeEventListener('pointermove', onMove);
      root.removeEventListener('pointerleave', onLeave);
      root.removeEventListener('focusin', onFocus);
      root.removeEventListener('focusout', onLeave);
    };
  }, []);
  useEffect(() => { wakeRef.current?.(); });
  return <div ref={rootRef} className={`bounce-cards ${className}`} style={{ width: containerWidth, height: containerHeight, '--bounce-cards-size': `${settings.cardSize}px`, '--bounce-cards-border': `${Math.max(0, borderWidth)}px`, '--bounce-cards-border-color': borderColor, '--bounce-cards-radius': `${Math.max(0, radius)}px`, '--bounce-cards-shadow': shadow ? '0 2px 5px #00000012, 0 20px 35px -15px #00000035' : 'none', ...style }}>
    {cards.map((card, i) => {
      const Tag = onCardClick ? 'button' : 'div';
      return <Tag key={i} type={onCardClick ? 'button' : undefined} ref={el => { cardRefs.current[i] = el; }} className="bounce-cards__card" aria-label={onCardClick ? `Ampliar: ${card.alt || `fotografia ${i + 1}`}` : undefined} onClick={onCardClick ? () => clickRef.current?.(i) : undefined} style={{ zIndex: i + 1 }}>
        {card.src && <img src={card.src} alt={card.alt || ''} draggable={false} loading="lazy" width="480" height="480" />}
        {onCardClick && <span className="bounce-cards__hint" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M5 9V5h4m6 0h4v4m0 6v4h-4m-6 0H5v-4" /></svg></span>}
      </Tag>;
    })}
  </div>;
}

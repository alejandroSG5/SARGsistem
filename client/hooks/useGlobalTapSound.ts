import { useEffect } from 'react';

// Lightweight Web Audio API tap sound — no external files needed
let audioCtx: AudioContext | null = null;

const getAudioContext = (): AudioContext => {
  if (!audioCtx) {
    const AC = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AC();
  }
  return audioCtx;
};

const playTapSound = () => {
  try {
    const ctx = getAudioContext();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    // Primary tone — a soft, pleasant "pop"
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(900, now);
    osc1.frequency.exponentialRampToValueAtTime(600, now + 0.08);
    gain1.gain.setValueAtTime(0.06, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.1);

    // Harmonic overtone — adds a subtle brightness
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1400, now);
    gain2.gain.setValueAtTime(0.02, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now);
    osc2.stop(now + 0.06);
  } catch {
    // Silently fail — audio is non-critical
  }
};

// Interactive element selectors
const INTERACTIVE_SELECTORS = [
  'button',
  'a',
  '[role="button"]',
  '[role="tab"]',
  '[role="menuitem"]',
  '[role="link"]',
  '[role="option"]',
  'input[type="checkbox"]',
  'input[type="radio"]',
  'input[type="submit"]',
  'input[type="button"]',
  'select',
  'summary',
  '.cursor-pointer',
  '[onclick]',
  '[data-tap-sound]',
];

const INTERACTIVE_SELECTOR = INTERACTIVE_SELECTORS.join(',');

/**
 * Checks if the clicked element (or any of its ancestors) is interactive.
 */
const isInteractiveElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;

  // Check the target itself and walk up the DOM tree (max 6 levels)
  let el: HTMLElement | null = target;
  let depth = 0;
  while (el && depth < 6) {
    if (el.matches(INTERACTIVE_SELECTOR)) return true;
    // Also catch elements with onClick handlers bound via React
    if (el.style.cursor === 'pointer') return true;
    el = el.parentElement;
    depth++;
  }

  return false;
};

/**
 * Global hook — attach once at the App root.
 * Intercepts all pointer-down events and plays a tap sound for interactive elements.
 */
const useGlobalTapSound = () => {
  useEffect(() => {
    const handler = (e: PointerEvent | TouchEvent) => {
      const target = e.target;
      if (isInteractiveElement(target)) {
        playTapSound();
      }
    };

    // Use pointerdown for broadest device support (mouse + touch + stylus)
    document.addEventListener('pointerdown', handler, { passive: true });

    return () => {
      document.removeEventListener('pointerdown', handler);
    };
  }, []);
};

export default useGlobalTapSound;

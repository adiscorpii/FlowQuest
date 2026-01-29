import { useCallback, useEffect, useState } from "react";

/**
 * Lightweight SFX helper (no asset files, kid-safe tones).
 *
 * Deliverable:
 * - useSfx() with play('ding'|'bubble'|'splash') and a mute toggle.
 *
 * Notes:
 * - We keep audio optional and tiny by using WebAudio oscillators.
 * - Mute state persists in localStorage so school devices stay quiet.
 */
export const SFX_MUTE_KEY = "flowquest:sfxMuted";

function readMuted() {
  try {
    const raw = localStorage.getItem(SFX_MUTE_KEY);
    if (raw === null) return false;
    return raw === "1" || raw === "true";
  } catch {
    return false;
  }
}

function writeMuted(v) {
  try {
    localStorage.setItem(SFX_MUTE_KEY, v ? "1" : "0");
  } catch {
    // ignore
  }
}

let sharedCtx = null;

function getAudioCtx() {
  const AudioCtx = window.AudioContext || window.webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedCtx || sharedCtx.state === "closed") sharedCtx = new AudioCtx();
  return sharedCtx;
}

function env(gain, now, peak = 0.08, attack = 0.01, release = 0.18) {
  // Simple safe envelope (prevents clicks).
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(peak, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + release);
}

export function playSfx(name) {
  // Respect mute even when called outside React.
  if (readMuted()) return;

  try {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const g = ctx.createGain();
    g.connect(ctx.destination);

    if (name === "ding") {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.setValueAtTime(740, now);
      o.frequency.exponentialRampToValueAtTime(980, now + 0.06);
      env(g, now, 0.085, 0.01, 0.19);
      o.connect(g);
      o.start(now);
      o.stop(now + 0.22);
      return;
    }

    if (name === "bubble") {
      const o = ctx.createOscillator();
      o.type = "sine";
      // “Pop” = quick downward pitch.
      o.frequency.setValueAtTime(520, now);
      o.frequency.exponentialRampToValueAtTime(220, now + 0.06);
      env(g, now, 0.05, 0.005, 0.09);
      o.connect(g);
      o.start(now);
      o.stop(now + 0.1);
      return;
    }

    if (name === "splash") {
      // Tiny “splash” = short filtered noise-ish burst using a sawtooth + lowpass.
      const o = ctx.createOscillator();
      const f = ctx.createBiquadFilter();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(160, now);
      f.type = "lowpass";
      f.frequency.setValueAtTime(1200, now);
      f.frequency.exponentialRampToValueAtTime(420, now + 0.12);
      env(g, now, 0.06, 0.005, 0.16);
      o.connect(f);
      f.connect(g);
      o.start(now);
      o.stop(now + 0.18);
    }
  } catch {
    // ignore (audio must never break the game)
  }
}

export function useSfx() {
  const [muted, setMuted] = useState(() => readMuted());

  useEffect(() => {
    // Keep DOM attribute in sync for CSS (optional visual cue hooks).
    document.documentElement.dataset.sfxMuted = muted ? "1" : "0";
    writeMuted(muted);
  }, [muted]);

  const toggleMuted = useCallback(() => setMuted((m) => !m), []);

  const play = useCallback((name) => {
    playSfx(name);
  }, []);

  return { muted, setMuted, toggleMuted, play };
}


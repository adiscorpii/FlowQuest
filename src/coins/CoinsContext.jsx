import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { playRewardBurst } from "../rewards/rewardBurstBus.js";
import { playSfx } from "../sfx/useSfx.js";

/**
 * Coins system goals:
 * - Levels call a single helper: `rewardCoins(amount, position, options)`
 * - Coins update global run state (persist across levels in one run)
 * - A Duolingo-style burst animates from the interaction point to the top bar counter
 *
 * Extend later:
 * - streaks: store consecutive perfect rounds/levels in run.progress
 * - shop: spendCoins(), inventory, cosmetics
 * - badges: awardBadge(id) with celebratory modal + burst
 */

const CoinsContext = createContext(null);

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

/**
 * Accept flexible “position” inputs so game logic stays clean:
 * - MouseEvent/PointerEvent/DragEvent (uses clientX/clientY, else currentTarget rect)
 * - HTMLElement (uses its center)
 * - DOMRect-like object (left/top/width/height)
 * - { x, y } in viewport coordinates
 */
function normalizePosition(position) {
  // Fallback: upper-middle of screen (feels like “reward near action” even if unknown).
  const fallback = { x: window.innerWidth * 0.5, y: window.innerHeight * 0.32 };

  if (!position) return fallback;

  // React synthetic events
  const e = position?.nativeEvent ? position.nativeEvent : position;

  // Pointer-style coordinates
  if (typeof e?.clientX === "number" && typeof e?.clientY === "number" && (e.clientX || e.clientY)) {
    return { x: e.clientX, y: e.clientY };
  }

  // Event currentTarget
  const ct = position?.currentTarget;
  if (ct && typeof ct.getBoundingClientRect === "function") {
    const r = ct.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  // HTMLElement
  if (typeof position?.getBoundingClientRect === "function") {
    const r = position.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  // DOMRect-like
  if (
    typeof position?.left === "number" &&
    typeof position?.top === "number" &&
    typeof position?.width === "number" &&
    typeof position?.height === "number"
  ) {
    return { x: position.left + position.width / 2, y: position.top + position.height / 2 };
  }

  // Plain object coords
  if (typeof position?.x === "number" && typeof position?.y === "number") return position;

  return fallback;
}

// NOTE: Sound is now centralized in `useSfx` so we can support a global mute toggle.

/**
 * CoinsProvider bridges coin rewards + animation with your existing `run` state.
 * It does NOT own coins; it updates `run.coins` so the report + TopBar remain consistent.
 */
export function CoinsProvider({ run, setRun, children }) {
  const [bursts, setBursts] = useState([]);
  const idRef = useRef(1);

  const removeBurst = useCallback((id) => {
    setBursts((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const rewardCoins = useCallback((amount, position, options = {}) => {
    const amt = Number(amount) || 0;
    if (amt <= 0) return;

    const pos = normalizePosition(position);
    const id = idRef.current++;

    // Update the canonical coin state (persist across levels in this run).
    setRun((prev) => {
      const n = structuredClone(prev);
      n.coins = (n.coins ?? 0) + amt;
      return n;
    });

    // Visual burst payload
    const coinsToSpawn = clamp(Math.round(amt / 5), 1, 9);
    setBursts((prev) => [
      ...prev,
      {
        id,
        amount: amt,
        x: pos.x,
        y: pos.y,
        coinsToSpawn,
        text: options.text ?? `+${amt} Coins!`,
        subtext: options.subtext ?? null,
        tone: options.tone ?? "gold", // future: "badge", "streak", etc.
        ts: Date.now(),
      },
    ]);

    // Visual-only reward pop (coins + optional sticker + optional confetti).
    // HARD CONSTRAINT: This does NOT change scoring; it only animates.
    playRewardBurst({
      x: pos.x,
      y: pos.y,
      coins: amt,
      label: options.burstLabel ?? "",
      // Confetti should be used ONLY for level completion celebrations.
      confetti: options.confetti ?? false,
    });

    // Optional sound (respects mute via localStorage)
    if (options.sound !== false) playSfx("ding");
  }, [setRun]);

  const value = useMemo(() => ({
    coins: run?.coins ?? 0,
    rewardCoins,
    bursts,
    removeBurst,
  }), [run?.coins, rewardCoins, bursts, removeBurst]);

  return (
    <CoinsContext.Provider value={value}>
      {children}
    </CoinsContext.Provider>
  );
}

export function useCoins() {
  const ctx = useContext(CoinsContext);
  if (!ctx) {
    throw new Error("useCoins() must be used within <CoinsProvider />");
  }
  return ctx;
}


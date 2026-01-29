/**
 * RewardBurst event bus (visual-only).
 *
 * Why this file exists:
 * - Game logic can trigger rewards without importing React components.
 * - The overlay layer listens once at the app/shell level.
 *
 * HARD CONSTRAINT: This must NOT affect scoring or game rules.
 * It only dispatches a DOM event that the UI can animate.
 */
export const REWARD_BURST_EVENT = "flowquest:rewardBurst";

let idCounter = 1;

/**
 * playRewardBurst({ x, y, coins, label, confetti })
 *
 * - x/y: viewport coordinates (clientX/clientY space)
 * - coins: visual number for coins pop (does NOT change coin totals)
 * - label: optional sticker type id (e.g. "waterHero", "cleanChamp")
 * - confetti: true ONLY for level completion celebrations
 */
export function playRewardBurst({ x, y, coins = 0, label = "", confetti = false } = {}) {
  // Fallback: near top-center so it still feels “reward near action”.
  const safeX = typeof x === "number" ? x : window.innerWidth * 0.5;
  const safeY = typeof y === "number" ? y : window.innerHeight * 0.32;

  const detail = {
    id: idCounter++,
    x: safeX,
    y: safeY,
    coins: Number(coins) || 0,
    label: String(label || ""),
    confetti: Boolean(confetti),
    ts: Date.now(),
  };

  window.dispatchEvent(new CustomEvent(REWARD_BURST_EVENT, { detail }));
}


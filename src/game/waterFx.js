/**
 * Water orb micro-animation helper (visual-only).
 *
 * Purpose:
 * - Levels can trigger satisfying water feedback (ripple/splash/bubbles)
 *   without coupling game logic to a specific component instance.
 *
 * HARD CONSTRAINT: This does NOT alter gameplay state. UI only.
 */
export const WATER_FX_EVENT = "flowquest:waterFx";

function emit(type) {
  window.dispatchEvent(new CustomEvent(WATER_FX_EVENT, { detail: { type, ts: Date.now() } }));
}

// Ripple on every correct action.
export function waterRipple() {
  emit("ripple");
}

// Splash on level completion.
export function waterSplash() {
  emit("splash");
}

// Tiny bubbles when water gets clearer (levels can trigger explicitly if desired).
export function waterBubbles() {
  emit("bubbles");
}


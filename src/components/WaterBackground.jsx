import { useMemo } from "react";

/**
 * Water-themed animated background (all screens).
 *
 * Requirements:
 * - Moving waves (subtle gradient animation)
 * - Floating bubbles (slow drift)
 * - Occasional droplets rising
 * - Must support Reduce Motion (handled via CSS using [data-reduce-motion="1"])
 *
 * Implementation:
 * - Pure DOM + CSS animations (lightweight).
 * - Deterministic-ish randomness per mount for variety without chaos.
 */
export default function WaterBackground({ reduceMotion = false }) {
  const bubbles = useMemo(() => {
    // Keep counts small for school laptops.
    const count = 14;
    return Array.from({ length: count }).map((_, i) => {
      const r = Math.random();
      const size = 10 + Math.floor(r * 22); // 10..32
      const left = Math.floor(Math.random() * 100); // vw
      const dur = 12 + Math.random() * 14; // seconds
      const delay = Math.random() * 10; // seconds
      const drift = -18 + Math.random() * 36; // px
      const opacity = 0.12 + Math.random() * 0.18;
      return { i, size, left, dur, delay, drift, opacity };
    });
  }, []);

  const droplets = useMemo(() => {
    // Very few “droplets” so it stays subtle.
    const count = 6;
    return Array.from({ length: count }).map((_, i) => {
      const size = 6 + Math.floor(Math.random() * 10); // 6..15
      const left = Math.floor(Math.random() * 100);
      const dur = 18 + Math.random() * 18;
      const delay = 4 + Math.random() * 16;
      const opacity = 0.10 + Math.random() * 0.14;
      return { i, size, left, dur, delay, opacity };
    });
  }, []);

  return (
    <div className="waterBg" aria-hidden="true" data-reduce-motion={reduceMotion ? "1" : "0"}>
      {/* Layer 1: animated waves via gradients */}
      <div className="waterBgWaves" />

      {/* Layer 2: soft bubble drift */}
      <div className="waterBgBubbles">
        {bubbles.map((b) => (
          <span
            key={b.i}
            className="waterBubble"
            style={{
              ["--size"]: `${b.size}px`,
              ["--left"]: `${b.left}vw`,
              ["--dur"]: `${b.dur}s`,
              ["--delay"]: `${b.delay}s`,
              ["--drift"]: `${b.drift}px`,
              ["--op"]: b.opacity,
            }}
          />
        ))}
      </div>

      {/* Layer 3: occasional droplets rising */}
      <div className="waterBgDroplets">
        {droplets.map((d) => (
          <span
            key={d.i}
            className="waterDroplet"
            style={{
              ["--size"]: `${d.size}px`,
              ["--left"]: `${d.left}vw`,
              ["--dur"]: `${d.dur}s`,
              ["--delay"]: `${d.delay}s`,
              ["--op"]: d.opacity,
            }}
          />
        ))}
      </div>
    </div>
  );
}


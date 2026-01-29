import { useEffect, useMemo, useState } from "react";
import { useCoins } from "./CoinsContext.jsx";
import CoinIcon from "../icons/CoinIcon.jsx";

/**
 * Renders a fullscreen, pointer-events-none overlay that animates reward coins
 * from an interaction point toward the TopBar coin counter.
 *
 * Target element contract:
 * - TopBar should include an element with id="coin-counter-target"
 */
export default function CoinBurstOverlay() {
  const { bursts, removeBurst } = useCoins();

  if (!bursts || bursts.length === 0) return null;

  return (
    <div className="coinOverlay" aria-hidden="true">
      {bursts.map((b) => (
        <CoinBurst key={b.id} burst={b} onDone={() => removeBurst(b.id)} />
      ))}
    </div>
  );
}

function useCoinTarget() {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    // Query on mount + whenever layout might change.
    // In practice, this stays stable while you play.
    const el = document.getElementById("coin-counter-target");
    setTarget(el);

    // Also refresh on resize (target moves on responsive layouts).
    function onResize() {
      const el2 = document.getElementById("coin-counter-target");
      setTarget(el2);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return target;
}

function CoinBurst({ burst, onDone }) {
  const targetEl = useCoinTarget();

  const target = useMemo(() => {
    if (!targetEl) return null;
    const r = targetEl.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }, [targetEl, burst.ts]);

  // Remove burst after animation completes (prefers-reduced-motion safe).
  useEffect(() => {
    const t = window.setTimeout(() => onDone(), 1100);
    return () => window.clearTimeout(t);
  }, [onDone]);

  const dx = (target?.x ?? burst.x) - burst.x;
  const dy = (target?.y ?? (burst.y - 120)) - burst.y;

  return (
    <div
      className="coinBurst"
      style={{
        left: `${burst.x}px`,
        top: `${burst.y}px`,
        // Shared end-point vector for keyframes (child coins add their own jitter).
        ["--dx"]: `${dx}px`,
        ["--dy"]: `${dy}px`,
      }}
    >
      <div className="coinBurstText">
        <div className="coinBurstTextMain">{burst.text}</div>
        {burst.subtext && <div className="coinBurstTextSub">{burst.subtext}</div>}
      </div>

      {Array.from({ length: burst.coinsToSpawn }).map((_, i) => {
        // Small deterministic-ish jitter so the burst feels organic but stable.
        const jitterX = ((i * 37) % 18) - 9; // -9..+8
        const jitterY = -(((i * 53) % 14) + 6); // -6..-19
        const delay = i * 35;
        const spin = 240 + (i % 3) * 90;

        return (
          <span
            key={i}
            className="flyingCoin"
            style={{
              ["--jx"]: `${jitterX}px`,
              ["--jy"]: `${jitterY}px`,
              ["--delay"]: `${delay}ms`,
              ["--spin"]: `${spin}deg`,
            }}
          >
            {/* Coin logo (SVG, no emoji). Replace SVG in `src/icons/CoinIcon.jsx`. */}
            <span className="flyingCoinFace"><CoinIcon className="coinSvg coinSvg--burst" title="" /></span>
            <span className="flyingCoinSparkle" />
          </span>
        );
      })}
    </div>
  );
}


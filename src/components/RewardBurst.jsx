import { useEffect, useMemo, useState } from "react";
import { REWARD_BURST_EVENT } from "../rewards/rewardBurstBus.js";
import CoinIcon from "../icons/CoinIcon.jsx";
import { StickerBadgeIcon } from "../icons/GameIcons.jsx";

/**
 * RewardBurst overlay layer (visual-only).
 *
 * Deliverables:
 * - RewardBurst component (coins + sticker + confetti)
 * - Hook/function: playRewardBurst({ x, y, coins, label })
 *   implemented in `src/rewards/rewardBurstBus.js` so logic can call it anywhere.
 */
export default function RewardBurstLayer() {
  const [bursts, setBursts] = useState([]);

  useEffect(() => {
    function onBurst(e) {
      const b = e?.detail;
      if (!b) return;
      setBursts((prev) => [...prev, b]);
    }
    window.addEventListener(REWARD_BURST_EVENT, onBurst);
    return () => window.removeEventListener(REWARD_BURST_EVENT, onBurst);
  }, []);

  useEffect(() => {
    if (bursts.length === 0) return undefined;

    // Clean up old bursts quickly (keeps DOM light).
    const t = window.setTimeout(() => {
      const now = Date.now();
      // Keep stickers visible for ~2–3 seconds (kid-friendly “I saw it!” duration).
      setBursts((prev) => prev.filter((b) => now - b.ts < 2600));
    }, 300);
    return () => window.clearTimeout(t);
  }, [bursts]);

  if (bursts.length === 0) return null;

  return (
    <div className="rewardOverlay" aria-hidden="true">
      {bursts.map((b) => (
        <RewardBurst key={b.id} burst={b} />
      ))}
    </div>
  );
}

function RewardBurst({ burst }) {
  const coinsToShow = useMemo(() => {
    // Visual-only: spawn a few coins even for small amounts.
    const amt = Math.max(0, Number(burst.coins) || 0);
    return Math.max(1, Math.min(6, Math.ceil(amt / 5)));
  }, [burst.coins]);

  return (
    <div className="rewardBurst" style={{ left: burst.x, top: burst.y }}>
      {/* Coin pop */}
      <div className="rewardCoins">
        {Array.from({ length: coinsToShow }).map((_, i) => (
          <span
            key={i}
            className="rewardCoin"
            style={{
              ["--i"]: i,
              ["--dx"]: `${(((i * 37) % 26) - 13)}px`,
              ["--dy"]: `${-18 - ((i * 29) % 18)}px`,
            }}
          >
            <CoinIcon className="coinSvg coinSvg--reward" title="" />
          </span>
        ))}
      </div>

      {/* Sticker pop (optional) */}
      {burst.label ? (
        <div className="rewardSticker">
          {/* Sticker badge (SVG, no emoji). Swap badge art in `src/icons/GameIcons.jsx`. */}
          <span className="rewardStickerIcon" aria-hidden="true">
            <StickerBadgeIcon kind={burst.label} />
          </span>
          <span className="rewardStickerText">{labelTextFor(burst.label)}</span>
        </div>
      ) : null}

      {/* Confetti splash (ONLY use for level completion) */}
      {burst.confetti ? (
        <div className="rewardConfetti">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="confettiBit"
              style={{
                ["--i"]: i,
                // Precompute directions in JS (avoid CSS trig for compatibility).
                ["--dx"]: `${Math.cos((i / 12) * Math.PI * 2) * 70}px`,
                ["--dy"]: `${Math.sin((i / 12) * Math.PI * 2) * 45 - 26}px`,
              }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function labelTextFor(label) {
  // Label is a small “type id” now (not display text) so we never render emoji accidentally.
  if (label === "waterHero") return "Water Hero";
  if (label === "cleanChamp") return "Clean Water Champ";
  if (label === "pipeFixer") return "Pipe Fixer";
  if (label === "smartMove") return "Smart Move";
  if (label === "fastSmart") return "Fast & Smart";
  if (label === "superClean") return "Super Clean";
  if (label === "budgetStar") return "Budget Star";
  if (label === "greatJob") return "Great Job!";
  return "Great Job!";
}

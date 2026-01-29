import { useEffect, useMemo, useRef, useState } from "react";
import BigButton from "./BigButton.jsx";
import ProgressTrail from "./ProgressTrail.jsx";
import CoinIcon from "../icons/CoinIcon.jsx";

function CoinBar({ coins }) {
  const prevCoinsRef = useRef(coins);
  const [gain, setGain] = useState(null); // { amount, ts }
  const [pulseTs, setPulseTs] = useState(0);

  useEffect(() => {
    const prev = prevCoinsRef.current;
    prevCoinsRef.current = coins;
    const delta = coins - prev;
    if (delta > 0) {
      const ts = Date.now();
      setGain({ amount: delta, ts });
      setPulseTs(ts);
      const t = window.setTimeout(() => setGain(null), 900);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [coins]);

  const meterPct = useMemo(() => {
    // Fun “bar” fill: cycles every 100 coins.
    const v = ((coins % 100) + 100) % 100;
    return Math.max(0, Math.min(100, v));
  }, [coins]);

  return (
    <div className="coinBar" id="coin-counter-target" data-pulse={pulseTs ? "1" : "0"}>
      <div className="coinLeft">
        {/* Coin logo (SVG, no emoji). Replace SVG in `src/icons/CoinIcon.jsx`. */}
        <span className="coinIcon" aria-hidden="true"><CoinIcon className="coinSvg" /></span>
        <span className="coinLabel">Coins</span>
      </div>
      <div className="coinRight">
        <div className="coinMeter" aria-hidden="true">
          <div className="coinFill" style={{ width: `${meterPct}%` }} />
        </div>
        <div className="coinCount" aria-label={`Coins: ${coins}`}>{coins}</div>
      </div>
      {gain && (
        <div key={gain.ts} className="coinGain" aria-hidden="true">
          +{gain.amount}
        </div>
      )}
    </div>
  );
}

export default function TopBar({ title, levelId = 1, progress, scores, budget, coins, onExit, onHint, onNext }) {
  return (
    <div className="topBar">
      <div>
        <div className="topTitle">{title}</div>
        <div className="topMeta">
          Cleanliness <b>{scores.cleanliness}%</b> · Safety <b>{scores.safety}</b> · Efficiency <b>{scores.efficiency}</b> · Budget <b>₹{budget}</b>
        </div>
      </div>

      <div className="topRight">
        {/* Progress clarity: tiny “adventure path” */}
        <ProgressTrail currentLevel={Number(levelId ?? 1)} progress={progress} />
        <CoinBar coins={coins ?? 0} />
        <div className="topActions">
          <BigButton variant="secondary" onClick={onExit}>Exit</BigButton>
          <BigButton variant="secondary" onClick={onHint}>Hint</BigButton>
          <BigButton variant="primary" onClick={onNext}>Next</BigButton>
        </div>
      </div>
    </div>
  );
}

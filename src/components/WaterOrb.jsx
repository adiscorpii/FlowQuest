import { useEffect, useRef, useState } from "react";
import { WATER_FX_EVENT } from "../game/waterFx.js";
import { StatusIcon } from "../icons/GameIcons.jsx";

export default function WaterOrb({ water }) {
  // Micro-animations: updated via event helper or by detecting water “improving”.
  const [rippleTs, setRippleTs] = useState(0);
  const [splashTs, setSplashTs] = useState(0);
  const [bubblesTs, setBubblesTs] = useState(0);
  const prevRef = useRef(water);

  useEffect(() => {
    function onFx(e) {
      const type = e?.detail?.type;
      if (type === "ripple") setRippleTs(Date.now());
      if (type === "splash") setSplashTs(Date.now());
      if (type === "bubbles") setBubblesTs(Date.now());
    }
    window.addEventListener(WATER_FX_EVENT, onFx);
    return () => window.removeEventListener(WATER_FX_EVENT, onFx);
  }, []);

  useEffect(() => {
    // Auto-trigger bubbles when the water becomes “clearer”.
    const prev = prevRef.current;
    prevRef.current = water;
    if (!prev || !water) return;

    const gotCleaner =
      (prev.color === "dirty" && (water.color === "cloudy" || water.color === "clear")) ||
      (prev.color === "cloudy" && water.color === "clear") ||
      (prev.mud && !water.mud) ||
      (prev.germs && !water.germs) ||
      (prev.stones && !water.stones);

    if (gotCleaner) setBubblesTs(Date.now());
  }, [water]);

  const cls = [
    "waterOrb",
    water.color === "dirty" ? "dirty" : "",
    water.color === "cloudy" ? "cloudy" : "",
    water.color === "clear" ? "clear" : "",
    water.germs ? "germs" : "",
    water.clogged ? "clogged" : "",
  ].join(" ");

  return (
    <div className="waterWrap">
      <div className={cls} aria-label={`Water: ${water.color}`}>
        {/* Visual layers (CSS-driven) */}
        <span className="waterOrbSurface" aria-hidden="true" />

        {/* Micro-animation helpers (re-keyed to retrigger animations) */}
        {rippleTs ? <span key={rippleTs} className="waterRippleFx" aria-hidden="true" /> : null}
        {bubblesTs ? <span key={bubblesTs} className="waterBubblesFx" aria-hidden="true" /> : null}
        {splashTs ? <span key={splashTs} className="waterSplashFx" aria-hidden="true" /> : null}
      </div>
      <div className="waterBadges">
        {water.stones && (
          <span className="badge">
            <StatusIcon kind="stones" className="inlineSvgIcon" title="" /> stones
          </span>
        )}
        {water.mud && (
          <span className="badge">
            <StatusIcon kind="mud" className="inlineSvgIcon" title="" /> mud
          </span>
        )}
        {water.germs && (
          <span className="badge danger">
            <StatusIcon kind="germs" className="inlineSvgIcon" title="" /> germs
          </span>
        )}
        {water.clogged && (
          <span className="badge danger">
            <StatusIcon kind="clogged" className="inlineSvgIcon" title="" /> clogged
          </span>
        )}
      </div>
    </div>
  );
}

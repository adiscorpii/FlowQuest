import { useEffect, useMemo, useRef, useState } from "react";
import { CheckIcon } from "../icons/UiIcons.jsx";

/**
 * Mini progress clarity widget.
 *
 * Deliverable:
 * - Small ProgressTrail UI element
 *
 * Rules:
 * - Pure UI. Does not lock/unlock gameplay; it only reflects progress visually.
 */
export default function ProgressTrail({ currentLevel = 1, progress }) {
  const prev = useRef(progress);
  const [unlockPulseTs, setUnlockPulseTs] = useState(0);

  useEffect(() => {
    // Animate the next level “unlock” when a level gets marked done.
    const p = prev.current;
    if (p && progress) {
      const l1Now = Boolean(progress.level1Done);
      const l2Now = Boolean(progress.level2Done);
      const l3Now = Boolean(progress.level3Done);

      const l1Prev = Boolean(p.level1Done);
      const l2Prev = Boolean(p.level2Done);
      const l3Prev = Boolean(p.level3Done);

      if (!l1Prev && l1Now) setUnlockPulseTs(Date.now());
      if (!l2Prev && l2Now) setUnlockPulseTs(Date.now());
      if (!l3Prev && l3Now) setUnlockPulseTs(Date.now());
    }
    prev.current = progress;
  }, [progress]);

  const nodes = useMemo(() => {
    const done1 = Boolean(progress?.level1Done);
    const done2 = Boolean(progress?.level2Done);
    const done3 = Boolean(progress?.level3Done);

    return [
      { id: 1, label: "1", done: done1, active: currentLevel === 1 },
      { id: 2, label: "2", done: done2, active: currentLevel === 2 },
      { id: 3, label: "3", done: done3, active: currentLevel === 3 },
    ];
  }, [currentLevel, progress]);

  return (
    <div className="progressTrail" aria-label={`Progress: level ${currentLevel} of 3`} data-pulse={unlockPulseTs}>
      {/* Keyed FX so unlock “pulse” re-triggers when progress changes. */}
      {unlockPulseTs ? <span key={unlockPulseTs} className="progressPulseFx" aria-hidden="true" /> : null}
      <div className="progressLabel">Adventure Path</div>
      <div className="progressDots" role="list">
        {nodes.map((n, idx) => (
          <div key={n.id} className="progressDotWrap" role="listitem">
            <div
              className={[
                "progressDot",
                n.done ? "done" : "",
                n.active ? "active" : "",
              ].join(" ")}
              aria-label={`Level ${n.id} ${n.done ? "completed" : n.active ? "current" : "not completed"}`}
            >
              {n.done ? <CheckIcon className="progressCheckIcon" title="Completed" /> : n.label}
            </div>
            {idx < nodes.length - 1 && <div className={`progressLink ${nodes[idx].done ? "on" : ""}`} />}
          </div>
        ))}
      </div>
      <div className="progressHint">{currentLevel < 3 ? "Next Adventure!" : "Final Adventure!"}</div>
    </div>
  );
}


import { useEffect, useMemo, useState } from "react";
import WaterOrb from "../components/WaterOrb.jsx";
import BigButton from "../components/BigButton.jsx";
import { MaterialIcon } from "../icons/GameIcons.jsx";
import { shuffleWithSeed } from "../game/random.js";
import { useCoins } from "../coins/CoinsContext.jsx";
import { COIN_REWARDS } from "../coins/rewards.js";
import { waterRipple, waterSplash } from "../game/waterFx.js";
import { playSfx } from "../sfx/useSfx.js";

const LAYERS = [
  // No emoji in UI strings; icons are rendered via <MaterialIcon />.
  { id: "gravel", label: "Gravel", removes: "stones" },
  { id: "sand", label: "Sand", removes: "mud" },
  { id: "charcoal", label: "Charcoal", removes: "color" },
];

const EXPLANATION = {
  gravel: "Gravel (screening) catches big particles like leaves, stones, and trash so later layers don’t clog.",
  sand: "Sand traps smaller dirt/silt (mud) by letting water pass through tiny gaps between grains.",
  charcoal: "Charcoal (activated carbon) adsorbs dissolved impurities that cause bad smell/color.",
};

export default function Level1({ run, setRun, registerHintProvider, setMascotMessage }) {
  const [slots, setSlots] = useState([null, null, null]);
  const [toast, setToast] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [history, setHistory] = useState([]);
  const { rewardCoins } = useCoins();

  const placed = useMemo(() => slots.filter(Boolean).length, [slots]);

  const seed = run?.meta?.seed ?? 1;
  const shuffledLayers = useMemo(() => {
    // Stable shuffle per run
    return shuffleWithSeed(LAYERS, (seed ^ 0xA17F_23C9) >>> 0);
  }, [seed]);

  const goalText = useMemo(() => {
    const steps = [];
    if (run.water.stones) steps.push("stones");
    steps.push("mud");
    steps.push("color");
    return `Goal: remove ${steps.join(" → ")} using filtration layers.`;
  }, [run.water.stones]);

  useEffect(() => {
    if (!registerHintProvider) return;

    registerHintProvider(() => {
      const nextId =
        run.water.stones ? "gravel"
        : run.water.mud ? "sand"
        : run.water.color !== "clear" ? "charcoal"
        : null;

      if (!nextId) {
        return { title: "Level 1 Hint", hint: "You’re done — the water is already clear.", explanation: "All target impurities are removed." };
      }

      const layer = LAYERS.find(l => l.id === nextId);
      return {
        title: "Level 1 Hint",
        hint: `Next: use ${layer?.label ?? nextId}.`,
        explanation: EXPLANATION[nextId] ?? "This step removes the next impurity in the water.",
      };
    });
  }, [registerHintProvider, run.water.stones, run.water.mud, run.water.color]);

  function onDragStart(e, id) {
    e.dataTransfer.setData("text/plain", id);
  }

  function onDrop(e, slotIndex) {
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;

    if (slots.includes(id)) {
      setToast("Already placed that layer.");
      setMistakes(m => m + 1);
      return;
    }

    setHistory((prev) => [
      ...prev,
      { slots: [...slots], mistakes, run: structuredClone(run) },
    ]);
    const next = [...slots];
    next[slotIndex] = id;
    setSlots(next);

    const expected =
      run.water.stones ? "gravel"
      : run.water.mud ? "sand"
      : run.water.color !== "clear" ? "charcoal"
      : null;

    if (expected && id !== expected) {
      setToast("Not the best next layer — try removing bigger impurities first. (Hint button can guide you.)");
      // Mascot feedback (UI-only).
      setMascotMessage?.("Oops! Try the bigger stuff first — gravel catches stones before sand and charcoal.");
      setMistakes(m => m + 1);
      setRun(prev => {
        const n = structuredClone(prev);
        n.scores.efficiency = Math.max(0, n.scores.efficiency - 5);
        return n;
      });
      return;
    }

    setToast(`Placed ${id}. Watch the water change!`);
    setMascotMessage?.(
      id === "gravel" ? "Nice job! Gravel catches big pieces like stones."
      : id === "sand" ? "Great! Sand traps muddy dirt and silt."
      : "Awesome! Charcoal helps remove color and smell."
    );

    // Water micro-interaction: ripple on correct action (visual only).
    waterRipple();
    // Gentle “bubble pop” on correct placement (optional SFX).
    playSfx("bubble");

    // Reward correct scientific progress (coins are global across the run).
    rewardCoins(COIN_REWARDS.CORRECT_ACTION, e.currentTarget, {
      text: `+${COIN_REWARDS.CORRECT_ACTION} Coins!`,
      subtext: "Correct layer!",
      // Optional sticker label (keep subtle—no confetti here).
      burstLabel: "",
    });

    // If this placement completes the level for the first time, award completion + bonuses.
    const willComplete =
      !run.progress.level1Done &&
      id === "charcoal" &&
      !run.water.stones &&
      !run.water.mud &&
      run.water.color !== "clear";

    if (willComplete) {
      rewardCoins(COIN_REWARDS.LEVEL_COMPLETE, e.currentTarget, {
        text: `Level Complete! +${COIN_REWARDS.LEVEL_COMPLETE}`,
        subtext: "Water is clear",
        // Visual-only badge id (rendered as SVG in RewardBurst).
        burstLabel: "cleanChamp",
        confetti: true, // ONLY for level completion
      });
      // Water micro-interaction: splash on level completion (visual only).
      waterSplash();
      // Gentle completion splash sound (optional).
      playSfx("splash");
      setMascotMessage?.("Splash-tastic! You made the water clear. Next Adventure!");

      // Bonus: “Perfect” run (no wrong-order moves).
      if (mistakes === 0) {
        rewardCoins(COIN_REWARDS.OPTIMAL_BONUS, e.currentTarget, {
          text: `Perfect Filtration! +${COIN_REWARDS.OPTIMAL_BONUS}`,
          subtext: "No mistakes bonus",
          burstLabel: "waterHero",
        });
      }

      // Bonus: high cleanliness + efficient play (uses your existing scoring model).
      const cleanlinessAfter = Math.max(Math.min(100, run.scores.cleanliness + 35), 90);
      const efficiencyAfter = Math.min(100, run.scores.efficiency + 10);
      // Keep this meaningful: Level 1 sets a minimum cleanliness on completion, so the bonus
      // triggers only for truly “excellent” outcomes (100% clean or very efficient).
      if (cleanlinessAfter === 100) {
        rewardCoins(COIN_REWARDS.OPTIMAL_BONUS, e.currentTarget, {
          text: `Clean Water Bonus! +${COIN_REWARDS.OPTIMAL_BONUS}`,
          subtext: "100% cleanliness",
          burstLabel: "superClean",
        });
      }
      if (efficiencyAfter >= 80) {
        rewardCoins(COIN_REWARDS.OPTIMAL_BONUS, e.currentTarget, {
          text: `Efficient Finish! +${COIN_REWARDS.OPTIMAL_BONUS}`,
          subtext: "High efficiency",
          burstLabel: "fastSmart",
        });
      }
    }

    applyEffect(id);
  }

  function undoLast() {
    setHistory((prev) => {
      const last = prev[prev.length - 1];
      if (!last) return prev;
      setSlots(last.slots);
      setMistakes(last.mistakes);
      setRun(last.run);
      setToast("Undid the last step. Try again.");
      setMascotMessage?.("No worries - try a different layer!");
      return prev.slice(0, -1);
    });
  }

  function allowDrop(e) {
    e.preventDefault();
  }

  function applyEffect(id) {
    setRun(prev => {
      const next = structuredClone(prev);
      const layer = LAYERS.find(l => l.id === id);

      // Update water visuals + scores
      if (layer.removes === "stones") next.water.stones = false;
      if (layer.removes === "mud") next.water.mud = false;
      if (layer.removes === "color") next.water.color = "clear";
      if (next.water.color !== "clear") next.water.color = "cloudy";

      // scoring (simple & explainable)
      next.scores.cleanliness = Math.min(100, next.scores.cleanliness + 35);
      next.scores.efficiency = Math.min(100, next.scores.efficiency + 10);

      // completion
      if (!next.water.stones && !next.water.mud && next.water.color === "clear") {
        next.progress.level1Done = true;
        next.scores.cleanliness = Math.max(next.scores.cleanliness, 90);
        // Coins are handled via `rewardCoins(...)` for better UX (burst + fly-to-counter).
        // Keeping this logic here ensures learning/scoring remains deterministic.
      }
      return next;
    });
  }

  return (
    <div className="levelLayout">
      <div className="panel">
        <h3>Dirty River Water</h3>
        <p className="muted">{goalText}</p>
        <WaterOrb water={run.water} />
        {run.progress.level1Done && <div className="success">Level 1 complete: water is clear!</div>}
      </div>

      <div className="panel">
        <h3>Materials</h3>
        <p className="muted">Drag a material into a slot. (Order is randomized each run.)</p>
        <div className="stack">
          {shuffledLayers.map(l => (
            <div
              key={l.id}
              className="draggable"
              draggable
              onDragStart={(e) => onDragStart(e, l.id)}
              aria-label={`${l.label}. Removes: ${l.removes}`}
              title={`Removes: ${l.removes}`}
            >
              <div className="chip">
                <MaterialIcon kind={l.id} className="inlineSvgIcon" title="" />
                <span>{l.label}</span>
              </div>
              <div className="small muted">Removes: {l.removes}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <h3>Filter Slots</h3>
          <BigButton
            variant="ghost"
            className="panelHeaderBtn"
            onClick={undoLast}
            disabled={history.length === 0}
          >
            Undo last step
          </BigButton>
        </div>
        <p className="muted">Slots fill with a satisfying “snap” animation.</p>
        <div className="slots">
          {slots.map((v, i) => (
            <div
              key={i}
              className={`slot ${v ? "filled" : ""}`}
              onDragOver={allowDrop}
              onDrop={(e) => onDrop(e, i)}
            >
              {v ? <span className="slotItem">{v}</span> : <span className="slotHint">drop here</span>}
            </div>
          ))}
        </div>

        <div className="muted">Placed: {placed}/3</div>

        {toast && <div className="inlineToast">{toast}</div>}
      </div>
    </div>
  );
}

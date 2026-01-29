import { useEffect, useMemo, useRef, useState } from "react";
import { shuffleWithSeed } from "../game/random.js";
import { useCoins } from "../coins/CoinsContext.jsx";
import { COIN_REWARDS } from "../coins/rewards.js";
import BigButton from "../components/BigButton.jsx";
import { StepIcon } from "../icons/GameIcons.jsx";
import { waterRipple, waterSplash } from "../game/waterFx.js";
import { playSfx } from "../sfx/useSfx.js";

const STEPS = [
  {
    id: "screening",
    label: "Screening",
    explanation: "Removes large debris first so pipes/filters don’t clog.",
  },
  {
    id: "coagulation",
    label: "Coagulation (add alum)",
    explanation: "Alum makes tiny particles stick together so they can be removed.",
  },
  {
    id: "flocculation",
    label: "Flocculation (stir gently)",
    explanation: "Slow mixing grows bigger ‘flocs’ that settle or can be filtered out.",
  },
  {
    id: "filtration",
    label: "Filtration",
    explanation: "Water passes through media to trap remaining particles.",
  },
  {
    id: "chlorination",
    label: "Chlorination (disinfect)",
    explanation: "Kills germs so the water is safe to drink.",
  },
];

export default function Level2({ run, setRun, registerHintProvider, setMascotMessage }) {
  const [placed, setPlaced] = useState([null, null, null, null, null]);
  const [activated, setActivated] = useState({});
  const [toast, setToast] = useState(null);
  const [mistakes, setMistakes] = useState(0);
  const [history, setHistory] = useState([]);
  const lastRewardPosRef = useRef(null);
  const { rewardCoins } = useCoins();

  const seed = run?.meta?.seed ?? 1;
  const shuffleKey = run?.meta?.variant?.level2?.shuffleKey ?? 0;
  const shuffledSteps = useMemo(() => {
    return shuffleWithSeed(STEPS, (seed ^ shuffleKey ^ 0x51C3_B2D1) >>> 0);
  }, [seed, shuffleKey]);

  const complete = useMemo(() => {
    const correct = placed.every((p, idx) => p === STEPS[idx].id);
    const allActivated = STEPS.every(s => activated[s.id]);
    return correct && allActivated;
  }, [placed, activated]);

  useEffect(() => {
    if (!registerHintProvider) return;

    registerHintProvider(() => {
      // 1) Fix ordering first: find earliest incorrect / empty slot.
      for (let idx = 0; idx < STEPS.length; idx += 1) {
        const expected = STEPS[idx];
        const current = placed[idx];
        if (current !== expected.id) {
          const currentLabel = current ? (STEPS.find(s => s.id === current)?.label ?? current) : "empty";
          return {
            title: "Level 2 Hint",
            hint: current
              ? `Slot ${idx + 1} should be ${expected.label} (not ${currentLabel}).`
              : `Next: put ${expected.label} into Slot ${idx + 1}.`,
            explanation: expected.explanation,
          };
        }
      }

      // 2) Then activate steps in order.
      for (const step of STEPS) {
        if (placed.includes(step.id) && !activated[step.id]) {
          return {
            title: "Level 2 Hint",
            hint: `Next: click “Activate” on ${step.label}.`,
            explanation: step.explanation,
          };
        }
      }

      return {
        title: "Level 2 Hint",
        hint: "Everything is in the right order and activated.",
        explanation: "That’s the full treatment sequence used to make water safe.",
      };
    });
  }, [registerHintProvider, placed, activated]);

  function onDragStart(e, id) {
    e.dataTransfer.setData("text/plain", id);
  }
  function allowDrop(e) { e.preventDefault(); }

  function onDrop(e, idx) {
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;

    if (placed.includes(id) && placed[idx] !== id) {
      setToast("That step is already placed elsewhere. Each step can be used once.");
      return;
    }

    setHistory((prev) => [
      ...prev,
      {
        placed: [...placed],
        activated: structuredClone(activated),
        mistakes,
        run: structuredClone(run),
      },
    ]);

    const next = [...placed];
    next[idx] = id;
    setPlaced(next);

    // consequence feedback
    const correctSoFar = next[idx] === STEPS[idx].id;
    if (!correctSoFar) {
      setToast("Wrong step here — try again. (In real plants, wrong order causes unsafe water.)");
      setMascotMessage?.("Oops! Treatment steps need the right order. Try screening first, then chemicals, then filters.");
      setMistakes(m => m + 1);
      setRun(prev => {
        const n = structuredClone(prev);
        n.scores.safety = Math.max(0, n.scores.safety - 10);
        return n;
      });
    } else {
      setToast("Good! Now activate it.");
      setMascotMessage?.("Nice placement! Now tap Activate to run that step.");
      // Water micro-interaction for a correct move (visual only).
      waterRipple();
      playSfx("bubble");
      lastRewardPosRef.current = e.currentTarget;
      setRun(prev => {
        const n = structuredClone(prev);
        n.scores.cleanliness = Math.min(100, n.scores.cleanliness + 10);
        n.scores.efficiency = Math.min(100, n.scores.efficiency + 5);
        return n;
      });
    }
  }

  function activate(stepId, e) {
    // only allow activation if it’s placed somewhere
    if (!placed.includes(stepId)) {
      setToast("Place the step into the pipeline first.");
      setMistakes(m => m + 1);
      return;
    }
    if (activated[stepId]) {
      setToast("Already activated.");
      return;
    }

    setHistory((prev) => [
      ...prev,
      {
        placed: [...placed],
        activated: structuredClone(activated),
        mistakes,
        run: structuredClone(run),
      },
    ]);

    setActivated(prev => ({ ...prev, [stepId]: true }));

    // Coin reward rule (clear + non-random):
    // only award if this step is placed in the correct slot *and* is now being activated.
    const expectedIdx = STEPS.findIndex(s => s.id === stepId);
    const isCorrectPlacement = expectedIdx >= 0 && placed[expectedIdx] === stepId;
    if (isCorrectPlacement) {
      lastRewardPosRef.current = e?.currentTarget ?? lastRewardPosRef.current;
      // Water micro-interaction: ripple on correct action (visual only).
      waterRipple();
      playSfx("bubble");
      rewardCoins(COIN_REWARDS.CORRECT_ACTION, e?.currentTarget ?? lastRewardPosRef.current, {
        text: `+${COIN_REWARDS.CORRECT_ACTION} Coins!`,
        subtext: "Perfect step!",
        burstLabel: "",
      });
      setMascotMessage?.("Yay! That step was perfect. The water is getting safer!");
    } else {
      // No coins for activating a mis-ordered step.
      setMistakes(m => m + 1);
      setMascotMessage?.("Hmm… that step is out of order. Try fixing the pipeline first!");
    }

    // apply realistic effects
    setRun(prev => {
      const n = structuredClone(prev);

      if (stepId === "screening") {
        // if missing screening later -> clog risk; here we just clear “stones”
        n.water.stones = false;
        n.water.clogged = false;
      }
      if (stepId === "coagulation") {
        n.water.color = "cloudy";
      }
      if (stepId === "flocculation") {
        // clumps form: mud reduces
        n.water.mud = false;
      }
      if (stepId === "filtration") {
        n.scores.cleanliness = Math.min(100, n.scores.cleanliness + 15);
      }
      if (stepId === "chlorination") {
        n.water.germs = false;
        n.scores.safety = Math.min(100, n.scores.safety + 20);
      }
      return n;
    });

    setToast(`Activated: ${stepId}`);
  }

  function undoLast() {
    setHistory((prev) => {
      const last = prev[prev.length - 1];
      if (!last) return prev;
      setPlaced(last.placed);
      setActivated(last.activated);
      setMistakes(last.mistakes);
      setRun(last.run);
      lastRewardPosRef.current = null;
      setToast("Undid the last step. Try a different placement or activation.");
      setMascotMessage?.("You can redo that step if it was out of order.");
      return prev.slice(0, -1);
    });
  }

  // When complete, mark progress + award completion/badges (once).
  useEffect(() => {
    if (!complete || run.progress.level2Done) return;

    const pos = lastRewardPosRef.current;

    rewardCoins(COIN_REWARDS.LEVEL_COMPLETE, pos, {
      text: `Level Complete! +${COIN_REWARDS.LEVEL_COMPLETE}`,
      subtext: "Safe water delivered",
      burstLabel: "waterHero",
      confetti: true, // ONLY for level completion
    });
    waterSplash();
    playSfx("splash");
    setMascotMessage?.("Woohoo! Safe water delivered. Next Adventure!");

    if (mistakes === 0) {
      rewardCoins(COIN_REWARDS.OPTIMAL_BONUS, pos, {
        text: `Perfect Plant! +${COIN_REWARDS.OPTIMAL_BONUS}`,
        subtext: "No mistakes bonus",
        burstLabel: "cleanChamp",
      });
    }

    // Bonus for maintaining high safety/cleanliness at completion.
    // Important: Level 2 clamps scores up to a minimum for report readability,
    // so bonuses are based on *actual performance before the clamp*.
    if (run.scores.safety >= 80 || run.scores.cleanliness >= 80) {
      rewardCoins(COIN_REWARDS.OPTIMAL_BONUS, pos, {
        text: `Clean Water Bonus! +${COIN_REWARDS.OPTIMAL_BONUS}`,
        subtext: run.scores.safety >= 80 ? "High safety" : "High cleanliness",
        burstLabel: "superClean",
      });
    }

    // Bonus for efficient sequencing (fewer wasted moves).
    if (run.scores.efficiency >= 70) {
      rewardCoins(COIN_REWARDS.OPTIMAL_BONUS, pos, {
        text: `Efficient Finish! +${COIN_REWARDS.OPTIMAL_BONUS}`,
        subtext: "High efficiency",
        burstLabel: "fastSmart",
      });
    }

    setRun(prev => {
      const n = structuredClone(prev);
      n.progress.level2Done = true;
      n.water.color = "clear";
      n.water.germs = false;
      n.scores.cleanliness = Math.max(n.scores.cleanliness, 90);
      n.scores.safety = Math.max(n.scores.safety, 90);
      return n;
    });
  }, [complete, run.progress.level2Done, rewardCoins, setRun, mistakes, run.scores.safety, run.scores.cleanliness, run.scores.efficiency]);

  return (
    <div className="levelLayout">
      <div className="panel">
        <h3>Treatment Steps</h3>
        <p className="muted">Drag steps into the pipeline slots in the correct order, then activate each. (Cards are shuffled each run.)</p>
        <div className="stack">
          {shuffledSteps.map(s => (
            <div key={s.id} className="draggable" draggable onDragStart={(e) => onDragStart(e, s.id)}>
              <div className="chip">
                <StepIcon kind={s.id} className="inlineSvgIcon" title="" />
                <span>{s.label}</span>
              </div>
              <BigButton
                variant="mini"
                onClick={(e) => activate(s.id, e)}
                aria-pressed={Boolean(activated[s.id])}
              >
                {activated[s.id] ? "Activated" : "Activate"}
              </BigButton>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panelHeader">
          <h3>Pipeline</h3>
          <BigButton
            variant="ghost"
            className="panelHeaderBtn"
            onClick={undoLast}
            disabled={history.length === 0}
          >
            Undo last step
          </BigButton>
        </div>
        <div className="pipeline">
          {placed.map((p, idx) => {
            const isCorrect = p && p === STEPS[idx].id;
            return (
              <div key={idx} className={`pipeSlot ${isCorrect ? "ok" : p ? "bad" : ""}`}
                   onDragOver={allowDrop} onDrop={(e) => onDrop(e, idx)}>
                <div className="pipeLabel">Slot {idx + 1}</div>
                <div className="pipeValue">{p ?? "drop step"}</div>
                <div className={`pipeGlow ${isCorrect ? "glow" : ""}`} />
              </div>
            );
          })}
        </div>

        {complete && <div className="success">Level 2 complete: safe water delivered!</div>}
        {run.progress.level2Done && <div className="muted">Unlocked: Level 3 systems game.</div>}

        {toast && <div className="inlineToast">{toast}</div>}
      </div>

      <div className="panel">
        <h3>Consequences</h3>
        <ul className="bullets">
          <li>Wrong order lowers Safety score.</li>
          <li>Activation simulates real actions (add alum, stir, disinfect).</li>
          <li>Correct logic unlocks delivery to homes.</li>
        </ul>
      </div>
    </div>
  );
}

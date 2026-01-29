import { useEffect, useMemo, useRef, useState } from "react";
import { useCoins } from "../coins/CoinsContext.jsx";
import { COIN_REWARDS } from "../coins/rewards.js";
import BigButton from "../components/BigButton.jsx";
import MascotLogo from "../icons/MascotLogo.jsx";
import { WarningIcon } from "../icons/UiIcons.jsx";
import { waterRipple, waterSplash } from "../game/waterFx.js";
import { playSfx } from "../sfx/useSfx.js";

const ENERGY_MAX = 3;

// ---------------------------------------------------------------------------
// Add new missions here.
// - Update story text in `story`.
// - Update rewards/consequences in each action's `effects` + `feedback`.
// - Add a matching scene in <SceneCanvas /> if you introduce a new mission.
// ---------------------------------------------------------------------------
const MISSIONS = [
  {
    id: "muddy",
    title: "Mission 1: The Muddy River Mystery",
    shortTitle: "Muddy River",
    problem: "The river turned brown and the intake screens are overloaded.",
    story: [
      "Aqua the Drop here! A huge storm just soaked AquaTown.",
      "Mud rushed into the river and the plant intake is straining to keep up.",
    ],
    actions: [
      {
        id: "upgradeFilters",
        label: "Upgrade Filters",
        outcome: "correct",
        resolves: true,
        effects: { cleanliness: 18, safety: 4, efficiency: 2 },
        feedback: {
          title: "Filters upgraded!",
          text: "New filters trap the mud fast, and the water turns clearer.",
        },
        visual: { water: "clear", overload: false },
        summary: "Upgraded filters to remove the mud.",
      },
      {
        id: "slowFlow",
        label: "Throttle Intake Pumps",
        outcome: "partial",
        resolves: true,
        effects: { cleanliness: 8, efficiency: 10 },
        feedback: {
          title: "Flow slowed",
          text: "The plant can keep up, but homes wait longer for water.",
        },
        visual: { water: "cloudy", overload: false },
        summary: "Throttled intake pumps to buy time.",
      },
      {
        id: "doNothing",
        label: "Let Sediment Settle",
        outcome: "incorrect",
        resolves: false,
        effects: { cleanliness: -12, safety: -6, efficiency: -4 },
        feedback: {
          title: "Filters get overwhelmed",
          text: "Mud piles up and the intake struggles to keep working.",
        },
        visual: { water: "muddy", overload: true },
        summary: "Waited while the filters clogged.",
      },
    ],
  },
  {
    id: "germs",
    title: "Mission 2: The Germ Attack",
    shortTitle: "Germ Attack",
    problem: "Germs are moving through the pipes toward homes.",
    story: [
      "The storm caused a sewage overflow near the river.",
      "Cute but dangerous germs are sneaking into pipes toward homes.",
    ],
    actions: [
      {
        id: "addChlorine",
        label: "Dose Chlorine",
        outcome: "correct",
        resolves: true,
        effects: { safety: 18, cleanliness: 2 },
        feedback: {
          title: "Germs defeated!",
          text: "Chlorine disinfects the water and keeps homes safe.",
        },
        visual: { germStatus: "cleared" },
        summary: "Added chlorine to clear the germs.",
      },
      {
        id: "testWater",
        label: "Run Lab Tests First",
        outcome: "partial",
        resolves: false,
        effects: { safety: 4 },
        feedback: {
          title: "Germs detected",
          text: "Testing reveals the problem. Chlorine will work even better now.",
        },
        visual: { germStatus: "detected" },
        summary: "Tested the water to confirm germs.",
      },
      {
        id: "ignoreGerms",
        label: "Monitor Only",
        outcome: "incorrect",
        resolves: false,
        effects: { safety: -15, cleanliness: -6, efficiency: -3 },
        feedback: {
          title: "Homes are at risk",
          text: "Germs spread through the pipes when ignored.",
        },
        visual: { germStatus: "ignored" },
        summary: "Ignored the germs in the pipes.",
      },
    ],
  },
  {
    id: "leaks",
    title: "Mission 3: The Leaky Pipe Chase",
    shortTitle: "Leaky Pipes",
    problem: "Pipes are leaking and pressure is dropping fast.",
    story: [
      "Old pipes cracked during the storm and water is leaking out fast.",
      "Leaks lower pressure and can pull dirty water into the system.",
    ],
    actions: [
      {
        id: "sendRepair",
        label: "Dispatch Repair Crew",
        outcome: "correct",
        resolves: true,
        effects: { efficiency: 8, safety: 6, cleanliness: 4, infra: 12 },
        feedback: {
          title: "Leaks fixed",
          text: "Repairs stop the leaks and pressure rises again.",
        },
        visual: { leakStatus: "fixed", pressure: 85 },
        summary: "Sent repair crews to seal the leaks.",
      },
      {
        id: "reduceUse",
        label: "Pressure Management Plan",
        outcome: "partial",
        resolves: true,
        effects: { efficiency: 10, cleanliness: -2 },
        feedback: {
          title: "Pressure stabilized",
          text: "Using less water helps, but the leaks are still there.",
        },
        visual: { leakStatus: "stabilized", pressure: 65 },
        summary: "Reduced water use to steady pressure.",
      },
      {
        id: "pumpMore",
        label: "Boost Pump Pressure",
        outcome: "incorrect",
        resolves: false,
        effects: { efficiency: -12, cleanliness: -8, safety: -4, infra: -8 },
        feedback: {
          title: "Leaks worsen",
          text: "More pressure pushes water out faster and wastes more.",
        },
        visual: { leakStatus: "worse", pressure: 40 },
        summary: "Pumped more water and worsened the leaks.",
      },
    ],
  },
];

const SYSTEM_FLOW = ["River", "Plant", "Pipes", "Homes"];
const SYSTEM_FOCUS = {
  muddy: ["River", "Plant"],
  germs: ["Pipes", "Homes"],
  leaks: ["Pipes"],
};

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

export default function Level3({ run, setRun, notify, registerHintProvider, setMascotMessage, onNext }) {
  const [currentMissionIndex, setCurrentMissionIndex] = useState(0);
  const [missionResults, setMissionResults] = useState(() =>
    MISSIONS.map(() => ({ resolved: false, outcome: null, actionId: null }))
  );
  const [energy, setEnergy] = useState(ENERGY_MAX);
  const [energyPulse, setEnergyPulse] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [celebration, setCelebration] = useState(null);
  const [germsTested, setGermsTested] = useState(false);
  const [visuals, setVisuals] = useState(() => ({
    muddy: { water: "muddy", overload: true },
    germs: { status: "active" },
    leaks: { status: "leaking", pressure: 55 },
  }));
  const [showSummary, setShowSummary] = useState(false);
  const lastRewardPosRef = useRef(null);
  const { rewardCoins } = useCoins();

  const currentMission = MISSIONS[currentMissionIndex];
  const currentResult = missionResults[currentMissionIndex];
  const allResolved = useMemo(
    () => missionResults.every((m) => m.resolved),
    [missionResults]
  );

  useEffect(() => {
    if (!setMascotMessage) return;
    setMascotMessage(MISSIONS[currentMissionIndex].story.join(" "));
  }, [currentMissionIndex, setMascotMessage]);

  useEffect(() => {
    if (!registerHintProvider) return;

    registerHintProvider(() => {
      if (currentMission.id === "muddy") {
        return {
          title: "Level 3 Hint",
          hint: "Upgrade Filters removes the mud fast. Slow Flow is a smaller fix.",
          explanation: "Filters remove particles before they clog the plant.",
        };
      }
      if (currentMission.id === "germs") {
        return {
          title: "Level 3 Hint",
          hint: germsTested
            ? "Now add chlorine to clear the germs."
            : "Test the water, then add chlorine to stop the germs.",
          explanation: "Testing reveals germs; chlorine disinfects them.",
        };
      }
      if (currentMission.id === "leaks") {
        return {
          title: "Level 3 Hint",
          hint: "Send a repair team to stop leaks and restore pressure.",
          explanation: "Fixing leaks prevents water loss and contamination.",
        };
      }
      return null;
    });
  }, [registerHintProvider, currentMission.id, germsTested]);

  useEffect(() => {
    if (!celebration) return undefined;
    const t = window.setTimeout(() => setCelebration(null), 900);
    return () => window.clearTimeout(t);
  }, [celebration]);

  useEffect(() => {
    if (!energyPulse) return undefined;
    const t = window.setTimeout(() => setEnergyPulse(0), 320);
    return () => window.clearTimeout(t);
  }, [energyPulse]);

  useEffect(() => {
    if (!allResolved || run.progress.level3Done) return;

    setRun((prev) => {
      const next = structuredClone(prev);
      next.progress.level3Done = true;
      return next;
    });

    const pos = lastRewardPosRef.current;
    rewardCoins(COIN_REWARDS.LEVEL_COMPLETE, pos, {
      text: `Level Complete! +${COIN_REWARDS.LEVEL_COMPLETE}`,
      subtext: "AquaTown saved",
      burstLabel: "waterHero",
      confetti: true,
    });
    waterSplash();
    playSfx("splash");
    setMascotMessage?.("AquaTown is safe again. Great work, team!");
  }, [allResolved, run.progress.level3Done, rewardCoins, setRun, setMascotMessage]);

  function applyEffects(effects, { actionId, log = true } = {}) {
    if (!effects) return;
    setRun((prev) => {
      const next = structuredClone(prev);
      next.scores.cleanliness = clamp(next.scores.cleanliness + (effects.cleanliness ?? 0));
      next.scores.safety = clamp(next.scores.safety + (effects.safety ?? 0));
      next.scores.efficiency = clamp(next.scores.efficiency + (effects.efficiency ?? 0));
      if (typeof effects.infra === "number") {
        next.city.infra = clamp(next.city.infra + effects.infra);
      }
      if (log && actionId) {
        if (!Array.isArray(next.city.log)) next.city.log = [];
        next.city.log.push({ round: currentMissionIndex + 1, action: actionId, budget: next.city.budget });
      }
      return next;
    });
  }

  function triggerCelebration(outcome, eventTarget) {
    const pos = eventTarget ?? lastRewardPosRef.current;
    const reward = outcome === "correct" ? COIN_REWARDS.SMART_DECISION : COIN_REWARDS.CORRECT_ACTION;

    setCelebration(Date.now());
    waterRipple();
    playSfx("bubble");

    rewardCoins(reward, pos, {
      text: `Great job! +${reward}`,
      subtext: "Mission complete",
      burstLabel: "greatJob",
    });
  }

  function handleAction(action, event) {
    if (currentResult.resolved) return;

    lastRewardPosRef.current = event?.currentTarget ?? lastRewardPosRef.current;

    if (action.outcome === "incorrect") {
      setEnergy((prev) => Math.max(0, prev - 1));
      setEnergyPulse(Date.now());
    }

    applyEffects(action.effects, { actionId: action.id });

    if (currentMission.id === "germs" && action.id === "testWater") {
      setGermsTested(true);
    }

    if (currentMission.id === "germs" && action.id === "addChlorine" && germsTested) {
      applyEffects({ safety: 8 }, { log: false });
    }

    if (currentMission.id === "germs" && action.id === "addChlorine") {
      setGermsTested(false);
    }

    setVisuals((prev) => {
      const next = structuredClone(prev);
      if (currentMission.id === "muddy") {
        next.muddy = {
          water: action.visual?.water ?? next.muddy.water,
          overload: action.visual?.overload ?? next.muddy.overload,
        };
      }
      if (currentMission.id === "germs") {
        next.germs = {
          status: action.visual?.germStatus ?? next.germs.status,
        };
      }
      if (currentMission.id === "leaks") {
        next.leaks = {
          status: action.visual?.leakStatus ?? next.leaks.status,
          pressure: action.visual?.pressure ?? next.leaks.pressure,
        };
      }
      return next;
    });

    const tone =
      action.outcome === "correct" ? "success"
      : action.outcome === "partial" ? "warn"
      : "danger";
    const extraNote =
      currentMission.id === "germs" && action.id === "addChlorine" && germsTested
        ? " Testing helped the chlorine work even better."
        : "";

    setFeedback({
      id: Date.now(),
      title: action.feedback.title,
      text: `${action.feedback.text}${extraNote}`,
      tone,
    });

    if (action.outcome === "incorrect") {
      setMascotMessage?.("Uh-oh. That choice makes the emergency worse. Try a smarter fix!");
    } else if (action.outcome === "partial") {
      setMascotMessage?.("Nice try. That helps a little, but there may be a stronger fix.");
    } else {
      setMascotMessage?.("Great move! You are keeping AquaTown safe.");
    }

    if (action.resolves) {
      setMissionResults((prev) => {
        const next = [...prev];
        next[currentMissionIndex] = {
          resolved: true,
          outcome: action.outcome,
          actionId: action.id,
        };
        return next;
      });
      triggerCelebration(action.outcome, event?.currentTarget ?? lastRewardPosRef.current);
    }
  }

  function advanceMission() {
    if (!currentResult.resolved) return;
    if (currentMissionIndex < MISSIONS.length - 1) {
      setCurrentMissionIndex((prev) => prev + 1);
      setFeedback(null);
      setShowSummary(false);
      if (currentMission.id === "germs") setGermsTested(false);
      return;
    }
    setShowSummary(true);
  }

  function handleContinue() {
    if (onNext) {
      onNext();
      return;
    }
    notify?.("Use the Next button above to continue to the Final Report.", "info", 2400);
  }

  if (showSummary) {
    return (
      <div className="levelLayout level3Layout">
        <div className="panel level3Summary" role="status" aria-live="polite">
          <div className="summaryHeader">
            <div>
              <div className="summaryTitle">AquaTown Saved!</div>
              <div className="muted">You completed all three emergency missions.</div>
            </div>
            <EnergyMeter energy={energy} pulse={energyPulse} />
          </div>

          <MissionMap currentIndex={currentMissionIndex} results={missionResults} />

          <div className="summaryGrid">
            <div className="summaryCard">
              <h4>Rescue Recap</h4>
              <ul className="summaryList">
                {MISSIONS.map((mission, idx) => {
                  const result = missionResults[idx];
                  const action = mission.actions.find((a) => a.id === result.actionId);
                  return (
                    <li key={mission.id}>
                      <span className={`summaryTag summaryTag--${result.outcome ?? "partial"}`}>
                        {result.outcome === "correct" ? "Great" : result.outcome === "partial" ? "Good" : "Needs work"}
                      </span>
                      <span className="summaryMission">{mission.shortTitle}:</span>
                      <span className="summaryAction">{action?.summary ?? "Choice made"}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="summaryCard">
              <h4>Water Scores</h4>
              <div className="barGroup">
                <StatBar label="Water Clarity" value={run.scores.cleanliness} tone="clarity" />
                <StatBar label="Germ Safety" value={run.scores.safety} tone="safety" />
                <StatBar label="Smart Choices" value={run.scores.efficiency} tone="smart" />
              </div>
            </div>
          </div>

          <div className="summaryFooter">
            <BigButton variant="primary" onClick={handleContinue}>Continue to Final Report</BigButton>
            <div className="muted small">You can also use the Next button in the top bar.</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="levelLayout level3Layout">
      <div className="panel level3Panel">
        <div className="level3Header">
          <div>
            <h3>Save AquaTown: The Water Emergency!</h3>
            <p className="muted">Complete all missions in order. Choose wisely to protect the system.</p>
          </div>
          <EnergyMeter energy={energy} pulse={energyPulse} />
        </div>

        <MissionMap currentIndex={currentMissionIndex} results={missionResults} />

        <MascotDialog title={currentMission.title} story={currentMission.story} />

        <div className="scoreCard">
          <h4>Water Scores</h4>
          <div className="barGroup">
            <StatBar label="Water Clarity" value={run.scores.cleanliness} tone="clarity" />
            <StatBar label="Germ Safety" value={run.scores.safety} tone="safety" />
            <StatBar label="Smart Choices" value={run.scores.efficiency} tone="smart" />
          </div>
        </div>
      </div>

      <div className="panel level3Panel">
        <div className="sceneHeader">
          <div>
            <div className="sceneTitle">{currentMission.problem}</div>
            <div className="muted small">Make a rescue choice and watch the system react.</div>
          </div>
          <div className={`missionStatus missionStatus--${currentResult.resolved ? "done" : "live"}`}>
            {currentResult.resolved ? "Mission cleared" : "Mission active"}
          </div>
        </div>

        <SceneCanvas missionId={currentMission.id} visuals={visuals} celebration={celebration} />

        {feedback && (
          <div key={feedback.id} className={`feedbackCard feedbackCard--${feedback.tone}`}>
            <div className="feedbackTitle">{feedback.title}</div>
            <div className="feedbackText">{feedback.text}</div>
          </div>
        )}

        <ActionButtons
          mission={currentMission}
          onAction={handleAction}
          disabled={currentResult.resolved}
          germsTested={germsTested}
        />

        <div className="nextRow">
          <BigButton variant="primary" onClick={advanceMission} disabled={!currentResult.resolved}>
            {currentMissionIndex === MISSIONS.length - 1 ? "View Summary" : "Next Mission"}
          </BigButton>
          {!currentResult.resolved && (
            <div className="muted small">Resolve the mission to unlock the next step.</div>
          )}
        </div>
      </div>

      <div className="panel level3Panel">
        <SystemFlow focus={SYSTEM_FOCUS[currentMission.id] ?? []} />

        <div className="missionTips">
          <h4>Mission Goals</h4>
          <ul className="bullets">
            <li>Keep water clean from river to homes.</li>
            <li>Stop contamination quickly.</li>
            <li>Balance strong fixes with smart trade-offs.</li>
          </ul>
        </div>

        {energy === 0 && (
          <div className="energyWarning">
            Energy is empty. Keep going and choose the safest fixes.
          </div>
        )}
      </div>
    </div>
  );
}

function MissionMap({ currentIndex, results }) {
  return (
    <div className="missionMap">
      <div className="missionMapHeader">Mission Map</div>
      <div className="missionNodes">
        {MISSIONS.map((mission, idx) => {
          const result = results[idx];
          const state = result.resolved ? "done" : idx === currentIndex ? "active" : "locked";
          return (
            <div key={mission.id} className={`missionNode missionNode--${state}`}>
              <div className="missionDot" />
              <div className="missionLabel">{mission.shortTitle}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MascotDialog({ title, story }) {
  return (
    <div className="mascotDialog">
      <div className="mascotDialogHeader">
        <span className="mascotDialogLogo" aria-hidden="true">
          <MascotLogo className="mascotDialogSvg" mood="happy" title="Aqua" />
        </span>
        <div>
          <div className="mascotDialogTitle">Aqua the Drop</div>
          <div className="mascotDialogSubtitle">{title}</div>
        </div>
      </div>
      <div className="mascotDialogText">
        {story.map((line, idx) => (
          <p key={idx}>{line}</p>
        ))}
      </div>
    </div>
  );
}

function EnergyMeter({ energy, pulse }) {
  return (
    <div className={`energyMeter ${pulse ? "energyMeter--pulse" : ""}`}>
      <div className="energyLabel">Energy</div>
      <div className="energyHearts">
        {Array.from({ length: ENERGY_MAX }).map((_, idx) => (
          <HeartIcon key={idx} active={idx < energy} />
        ))}
      </div>
    </div>
  );
}

function HeartIcon({ active }) {
  return (
    <svg
      className={`energyHeart ${active ? "energyHeart--on" : "energyHeart--off"}`}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      role="img"
      aria-label={active ? "Energy" : "Energy empty"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 20.2s-6.9-4.7-8.8-8.7C1.6 8.5 3.5 5 6.8 5c2.1 0 3.7 1.2 4.6 2.8C12.3 6.2 14 5 16.2 5c3.3 0 5.2 3.5 3.6 6.5-1.9 4-7.8 8.7-7.8 8.7z"
        fill="currentColor"
      />
    </svg>
  );
}

function SystemFlow({ focus }) {
  return (
    <div className="systemFlow">
      <div className="systemFlowTitle">System Path</div>
      <div className="systemFlowRow">
        {SYSTEM_FLOW.map((node, idx) => {
          const active = focus.includes(node);
          return (
            <div key={node} className={`systemNode ${active ? "systemNode--active" : ""}`}>
              <div className="systemNodeLabel">{node}</div>
              {idx < SYSTEM_FLOW.length - 1 && <div className="systemNodeArrow" aria-hidden="true" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SceneCanvas({ missionId, visuals, celebration }) {
  return (
    <div className={`sceneCanvas sceneCanvas--${missionId}`}>
      {missionId === "muddy" && <MuddyRiverScene visuals={visuals.muddy} />}
      {missionId === "germs" && <GermAttackScene visuals={visuals.germs} />}
      {missionId === "leaks" && <LeakyPipeScene visuals={visuals.leaks} />}
      {celebration && <MissionCelebration key={celebration} />}
    </div>
  );
}

function MuddyRiverScene({ visuals }) {
  const waterState = visuals.water;
  const showParticles = waterState !== "clear";
  return (
    <div className="scene scene--muddy" data-water={waterState}>
      <div className="riverSwirl" data-water={waterState} />
      {showParticles && (
        <div className="mudParticles">
          {Array.from({ length: 9 }).map((_, idx) => (
            <span key={idx} className="mudParticle" style={{ "--i": idx }} />
          ))}
        </div>
      )}
      <div className="plantBlock">
        <div className="plantRoof" />
        <div className="plantIntake" />
        <div className={`plantWarning ${visuals.overload ? "plantWarning--on" : ""}`}>
          <WarningIcon className="inlineSvgIcon" title="Overload" />
          <span>Overload</span>
        </div>
      </div>
      <div className="riverBank" />
    </div>
  );
}

function GermAttackScene({ visuals }) {
  const germStatus = visuals.status;
  const germsCleared = germStatus === "cleared";
  const germsDetected = germStatus === "detected";
  const homesHappy = germStatus === "cleared";
  return (
    <div className="scene scene--germs" data-germs={germStatus}>
      <div className="pipeRun" />
      <div className="pipeRun pipeRun--lower" />
      <div className="germGroup" data-cleared={germsCleared ? "1" : "0"}>
        {Array.from({ length: 4 }).map((_, idx) => (
          <span key={idx} className="germ" style={{ "--i": idx }}>
            <span className="germBody">
              <GermIcon />
            </span>
          </span>
        ))}
      </div>
      <div className={`homeRow ${homesHappy ? "homeRow--happy" : "homeRow--sad"}`}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="home">
            <HomeIcon />
            {!homesHappy && (
              <span className="homeWarning">
                <WarningIcon className="inlineSvgIcon" title="Warning" />
              </span>
            )}
          </div>
        ))}
      </div>
      {germsDetected && <div className="sceneHint">Germs detected in the pipes</div>}
    </div>
  );
}

function LeakyPipeScene({ visuals }) {
  const leakStatus = visuals.status;
  const homesHappy = leakStatus === "fixed";
  return (
    <div className="scene scene--leaks" data-leaks={leakStatus}>
      <div className="leakPipe">
        <span className="leakDrop" />
        <span className="leakDrop leakDrop--slow" />
      </div>
      <div className="leakPipe leakPipe--lower">
        <span className="leakDrop leakDrop--offset" />
      </div>
      <div className={`puddle puddle--one puddle--${leakStatus}`} />
      <div className={`puddle puddle--two puddle--${leakStatus}`} />

      <div className="pressureMeter">
        <div className="pressureLabel">Pressure</div>
        <div className="pressureTrack">
          <div className="pressureFill" style={{ width: `${visuals.pressure}%` }} />
        </div>
      </div>

      <div className={`homeRow ${homesHappy ? "homeRow--happy" : "homeRow--sad"}`}>
        {Array.from({ length: 3 }).map((_, idx) => (
          <div key={idx} className="home">
            <HomeIcon />
          </div>
        ))}
      </div>
    </div>
  );
}

function MissionCelebration() {
  return (
    <div className="missionCelebration" aria-hidden="true">
      <span className="celebrationRipple" />
      <div className="celebrationConfetti">
        {Array.from({ length: 10 }).map((_, idx) => (
          <span key={idx} className="missionConfettiBit" style={{ "--i": idx }} />
        ))}
      </div>
    </div>
  );
}

function ActionButtons({ mission, onAction, disabled, germsTested }) {
  return (
    <div className="actionGrid">
      {mission.actions.map((action) => {
        const isTested = action.id === "testWater" && germsTested;
        return (
          <BigButton
            key={action.id}
            variant="secondary"
            onClick={(e) => onAction(action, e)}
            disabled={disabled || isTested}
          >
            {isTested ? "Water Tested" : action.label}
          </BigButton>
        );
      })}
    </div>
  );
}

function StatBar({ label, value, tone }) {
  return (
    <div className="barRow statBar" data-tone={tone}>
      <div className="barLabel">{label}</div>
      <div className="barTrack">
        <div className="barFill" style={{ width: `${clamp(value)}%` }} />
      </div>
      <div className="barVal">{value}</div>
    </div>
  );
}

function GermIcon() {
  return (
    <svg
      width="28"
      height="28"
      viewBox="0 0 28 28"
      role="img"
      aria-label="Germ"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="14" cy="14" r="10" fill="currentColor" opacity="0.16" />
      <circle cx="14" cy="14" r="8" fill="currentColor" opacity="0.32" />
      <circle cx="10" cy="12" r="1.5" fill="#0b1220" />
      <circle cx="18" cy="12" r="1.5" fill="#0b1220" />
      <path d="M9.5 17c1.6 1.4 7.4 1.4 9 0" stroke="#0b1220" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 48 48"
      role="img"
      aria-label="Home"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M6 24l18-14 18 14v18a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V24z" fill="currentColor" opacity="0.2" />
      <path d="M12 24l12-9 12 9" fill="none" stroke="currentColor" strokeWidth="2" />
      <rect x="20" y="28" width="8" height="10" rx="1" fill="currentColor" opacity="0.45" />
      <rect x="14" y="28" width="4" height="4" fill="currentColor" opacity="0.35" />
      <rect x="30" y="28" width="4" height="4" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

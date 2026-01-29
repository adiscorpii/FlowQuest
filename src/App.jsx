import { useMemo, useState } from "react";
import WaterBackground from "./components/WaterBackground.jsx";
import BigButton from "./components/BigButton.jsx";
import BrandLogo from "./icons/BrandLogo.jsx";
import { MotionIcon, SoundIcon } from "./icons/UiIcons.jsx";
import GameShell from "./game/GameShell.jsx";
import Level1 from "./levels/Level1.jsx";
import Level2 from "./levels/Level2.jsx";
import Level3 from "./levels/Level3.jsx";
import { createInitialRunState } from "./game/config.js";
import { useReduceMotion } from "./ui/useReduceMotion.js";
import { useSfx } from "./sfx/useSfx.js";

const LEVELS = [
  { id: 1, title: "Level 1: Filtration Basics (Grades 6–7)", Component: Level1 },
  { id: 2, title: "Level 2: Treatment Plant (Grades 8–9)", Component: Level2 },
  { id: 3, title: "Level 3: Save AquaTown (Grades 10–12)", Component: Level3 },
];

export default function App() {
  const [screen, setScreen] = useState("menu"); // menu | play | report
  const [levelId, setLevelId] = useState(1);
  const [run, setRun] = useState(() => createInitialRunState());
  const { reduceMotion, toggleReduceMotion } = useReduceMotion();
  const { muted, toggleMuted } = useSfx();

  const level = useMemo(() => LEVELS.find(l => l.id === levelId), [levelId]);

  function resetRun() {
    setRun(createInitialRunState());
  }

  function startAt(id) {
    resetRun();
    setLevelId(id);
    setScreen("play");
  }

  function finishGame() {
    setScreen("report");
  }

  return (
    <div className="app">
      {/* Water-themed animated background for ALL screens (Reduce Motion safe via CSS). */}
      <WaterBackground reduceMotion={reduceMotion} />

      <header className="appHeader">
        <div className="brand">
          {/* Brand logo (SVG, no emoji). Replace SVG in `src/icons/BrandLogo.jsx`. */}
          <div className="logo" aria-hidden="true">
            <BrandLogo />
          </div>
          <div>
            <div className="title">FlowQuest</div>
            <div className="subtitle">From River to Tap: Clean Water Adventure</div>
          </div>
        </div>

        <div className="headerRight">
          {/* Accessibility + performance controls (persist in localStorage via hooks). */}
          <div className="toggles" role="group" aria-label="Game settings">
            <BigButton
              variant="ghost"
              aria-pressed={reduceMotion}
              onClick={toggleReduceMotion}
              title="Reduce Motion (helps performance and accessibility)"
            >
              <MotionIcon />
              {reduceMotion ? "Reduce Motion: ON" : "Reduce Motion: OFF"}
            </BigButton>
            <BigButton
              variant="ghost"
              aria-pressed={muted}
              onClick={toggleMuted}
              title="Mute sound effects"
            >
              <SoundIcon muted={muted} />
              {muted ? "Sound: OFF" : "Sound: ON"}
            </BigButton>
          </div>

          {screen === "menu" && (
            <div className="hint">
              Goal: teach water treatment through gameplay + consequences.
            </div>
          )}
        </div>
      </header>

      {screen === "menu" && (
        <main className="panelWide">
          <h2>Choose a level</h2>
          <p className="muted">
            This prototype is designed to be easy to extend: add new steps, new events, new scoring rules.
          </p>

          <div className="levelGrid">
            {LEVELS.map(l => (
              <BigButton key={l.id} className="cardBtn" onClick={() => startAt(l.id)}>
                <div className="cardTitle">{l.title}</div>
                <div className="cardMeta">Playtime: ~2–5 min demo</div>
              </BigButton>
            ))}
          </div>

          <div className="row">
            <BigButton variant="primary" onClick={() => startAt(1)}>Start from Level 1</BigButton>
          </div>
        </main>
      )}

      {screen === "play" && (
        <GameShell
          levelId={levelId}
          levelTitle={level.title}
          run={run}
          setRun={setRun}
          progress={run.progress}
          onExit={() => setScreen("menu")}
          onNext={() => {
            if (levelId < 3) {
              setLevelId(levelId + 1);
            } else {
              finishGame();
            }
          }}
        >
          <level.Component run={run} setRun={setRun} />
        </GameShell>
      )}

      {screen === "report" && (
        <main className="panelWide">
          <h2>Final Report Card</h2>

          <div className="reportGrid">
            <div className="metric">
              <div className="metricLabel">Coins Earned</div>
              <div className="metricValue">{run.coins ?? 0}</div>
            </div>
            <div className="metric">
              <div className="metricLabel">Cleanliness</div>
              <div className="metricValue">{run.scores.cleanliness}%</div>
            </div>
            <div className="metric">
              <div className="metricLabel">Safety</div>
              <div className="metricValue">{run.scores.safety}</div>
            </div>
            <div className="metric">
              <div className="metricLabel">Efficiency</div>
              <div className="metricValue">{run.scores.efficiency}</div>
            </div>
            <div className="metric">
              <div className="metricLabel">Budget Left</div>
              <div className="metricValue">₹{run.city.budget}</div>
            </div>
          </div>

          <div className="panel">
            <h3>What this demonstrates (for your presentation)</h3>
            <ul className="bullets">
              <li>Level 1: filtration layers remove different impurities.</li>
              <li>Level 2: treatment is a sequence; skipping steps has consequences.</li>
              <li>Level 3: crisis response trade-offs (clarity vs safety vs efficiency).</li>
            </ul>
          </div>

          <div className="row">
            <BigButton variant="primary" onClick={() => setScreen("menu")}>Back to Menu</BigButton>
            <BigButton onClick={() => { resetRun(); setLevelId(1); setScreen("play"); }}>Play Again</BigButton>
          </div>
        </main>
      )}
    </div>
  );
}

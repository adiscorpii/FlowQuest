import { cloneElement, isValidElement, useCallback, useEffect, useState } from "react";
import TopBar from "../components/TopBar.jsx";
import Toast from "../components/Toast.jsx";
import { CoinsProvider } from "../coins/CoinsContext.jsx";
import CoinBurstOverlay from "../coins/CoinBurstOverlay.jsx";
import RewardBurstLayer from "../components/RewardBurst.jsx";
import MascotHint from "../components/MascotHint.jsx";

export default function GameShell({ levelId, levelTitle, run, setRun, progress, children, onExit, onNext }) {
  const [toast, setToast] = useState(null);
  const [hintProvider, setHintProvider] = useState(null);
  const [mascotMessage, setMascotMessage] = useState(
    // Default friendly “always-on” message (levels can override via setMascotMessage).
    "Hi! I’m Aqua. Let’s turn river water into safe tap water!"
  );

  // Provide a tiny helper for levels to show feedback (animated via `.toast`).
  const notify = useCallback((msg, type = "info", durationMs) => {
    setToast({ msg, type, durationMs, _ts: Date.now() });
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const duration = toast.durationMs ?? (toast.type === "hint" ? 5200 : 1800);
    const t = window.setTimeout(() => setToast(null), duration);
    return () => window.clearTimeout(t);
  }, [toast]);

  const registerHintProvider = useCallback((fn) => {
    setHintProvider(() => fn);
  }, []);

  const showHint = useCallback(() => {
    if (!hintProvider) {
      notify("No hints available for this level yet.", "info");
      return;
    }

    const h = hintProvider();
    if (!h) {
      notify("No hint right now — try making one move first.", "info");
      return;
    }

    const title = h.title ? `${h.title}\n` : "";
    const explanation = h.explanation ? `\nWhy: ${h.explanation}` : "";
    notify(`${title}${h.hint ?? ""}${explanation}`, "hint");
  }, [hintProvider, notify]);

  return (
    <CoinsProvider run={run} setRun={setRun}>
      <main className="shell">
        <TopBar
          title={levelTitle}
          levelId={levelId}
          progress={progress}
          scores={run.scores}
          budget={run.city.budget}
          coins={run.coins ?? 0}
          onExit={onExit}
          onHint={showHint}
          onNext={onNext}
        />

        <div className="shellBody">
          {isValidElement(children)
            ? cloneElement(children, {
              notify,
              registerHintProvider,
              // UI-only: lets levels provide kid-friendly mascot text without changing flow.
              setMascotMessage,
              onNext,
            })
            : children}
        </div>

        {/* Duolingo-style reward animation layer */}
        <CoinBurstOverlay />

        {/* Visual-only rewards (stickers + confetti) */}
        <RewardBurstLayer />

        {/* Kid-friendly helper character (UI-only) */}
        <MascotHint message={mascotMessage} />

        {toast && <Toast type={toast.type} msg={toast.msg} />}
      </main>
    </CoinsProvider>
  );
}

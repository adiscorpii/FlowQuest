import { useEffect, useState } from "react";
import MascotLogo from "../icons/MascotLogo.jsx";

/**
 * Kid-friendly mascot UI (no logic changes).
 *
 * Deliverable:
 * - MascotHint component that can be passed a message string.
 *
 * Notes:
 * - This is intentionally “dumb UI”: it renders whatever message you pass.
 * - It animates gently when the message changes (disabled with Reduce Motion).
 */
export default function MascotHint({ message }) {
  const [pokeTs, setPokeTs] = useState(0);

  useEffect(() => {
    if (!message) return;
    // Re-trigger a tiny bounce whenever the message changes.
    setPokeTs(Date.now());
  }, [message]);

  return (
    <aside className="mascot" aria-live="polite" aria-atomic="true" data-poke={pokeTs}>
      <div className="mascotBody" aria-hidden="true">
        {/* “Aqua the Drop” — SVG logo (no emoji). Replace in `src/icons/MascotLogo.jsx`. */}
        <MascotLogo className="mascotLogo" mood="happy" title="Aqua" />
      </div>

      {/* Keyed so the gentle pop animation re-triggers on new messages. */}
      <div key={pokeTs} className="mascotBubble" role="note">
        <div className="mascotName">Aqua</div>
        <div className="mascotText">
          {message || "Hi! Let’s help the water become clean and safe."}
        </div>
      </div>
    </aside>
  );
}


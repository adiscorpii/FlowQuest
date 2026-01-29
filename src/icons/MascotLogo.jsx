/**
 * MascotLogo (Aqua the Drop) — SVG, no emoji.
 *
 * - Friendly rounded drop
 * - Big eyes
 * - Minimal expression
 *
 * Swap later:
 * - Replace SVG paths here.
 * - Animation timing is in `styles.css` (search: mascotFloat).
 */
export default function MascotLogo({ className = "", mood = "happy", title = "Aqua" }) {
  const mouth =
    mood === "surprised"
      ? { d: "M18.2 25.4c0 2 1.7 3.6 3.8 3.6s3.8-1.6 3.8-3.6", strokeWidth: 2.4, opacity: 0.75 }
      : { d: "M18.8 26.6c1.0 1.2 2.0 1.8 3.2 1.8s2.2-.6 3.2-1.8", strokeWidth: 2.6, opacity: 0.75 };

  return (
    <svg
      className={className}
      width="56"
      height="56"
      viewBox="0 0 44 44"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="fqAquaFill" cx="35%" cy="25%" r="85%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="55%" stopColor="#BFF3FF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#2AC6E6" stopOpacity="0.98" />
        </radialGradient>
      </defs>

      {/* Drop body */}
      <path
        d="M22 6c7.4 8.8 12 15.4 12 21.2 0 6.6-5.4 12-12 12s-12-5.4-12-12C10 21.4 14.6 14.8 22 6z"
        fill="url(#fqAquaFill)"
        stroke="rgba(11,18,32,0.10)"
        strokeWidth="1"
      />

      {/* Shine */}
      <path
        d="M15.4 18.2c1.1-4.3 4.3-7.2 8.1-7.2 1.9 0 3.8.8 5.2 2"
        fill="none"
        stroke="rgba(255,255,255,0.60)"
        strokeWidth="3.2"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Face */}
      <g fill="rgba(11,18,32,0.65)">
        <ellipse cx="17.8" cy="23.2" rx="2.1" ry="2.6" opacity="0.9" />
        <ellipse cx="26.2" cy="23.2" rx="2.1" ry="2.6" opacity="0.9" />
      </g>
      <path
        d={mouth.d}
        fill="none"
        stroke="rgba(11,18,32,0.55)"
        strokeWidth={mouth.strokeWidth}
        strokeLinecap="round"
        opacity={mouth.opacity}
      />
    </svg>
  );
}


/**
 * BrandLogo (FlowQuest mark, no emoji).
 *
 * Swap later:
 * - Replace SVG shapes here (keep viewBox 0 0 44 44).
 */
export default function BrandLogo({ className = "", title = "FlowQuest" }) {
  return (
    <svg
      className={className}
      width="44"
      height="44"
      viewBox="0 0 44 44"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="fqBrandBg" cx="35%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#E9FBFF" />
          <stop offset="55%" stopColor="#BFF3FF" />
          <stop offset="100%" stopColor="#2AC6E6" />
        </radialGradient>
        <linearGradient id="fqBrandWave" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#0B4B8A" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#1877F2" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="44" height="44" rx="14" fill="url(#fqBrandBg)" />

      {/* Drop */}
      <path
        d="M22 10c5.3 6.3 8.6 11 8.6 15.2 0 4.8-3.9 8.8-8.6 8.8s-8.6-3.9-8.6-8.8C13.4 21 16.7 16.3 22 10z"
        fill="rgba(255,255,255,0.65)"
      />

      {/* Wave */}
      <path
        d="M12.5 27.5c2.7 2.1 5.3 2.9 8.2 2.9 3.7 0 7.2-1.4 10.8-3"
        fill="none"
        stroke="url(#fqBrandWave)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}


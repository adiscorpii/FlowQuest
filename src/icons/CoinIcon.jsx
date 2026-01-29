/**
 * CoinIcon (custom coin logo, no emoji).
 *
 * Design goals:
 * - Rounded, kid-friendly coin
 * - Soft gradient + highlight
 * - Embossed water droplet/wave mark
 *
 * Swap later:
 * - Replace the <svg> paths/gradients below.
 * - Animation speed can be adjusted in `styles.css` (search: coinSvgWobble).
 */
export default function CoinIcon({ className = "", title = "Coins" }) {
  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      role="img"
      aria-label={title}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <radialGradient id="fqCoinFill" cx="30%" cy="25%" r="75%">
          <stop offset="0%" stopColor="#FFE89A" />
          <stop offset="55%" stopColor="#FFC84D" />
          <stop offset="100%" stopColor="#F3A400" />
        </radialGradient>
        <linearGradient id="fqCoinRim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFEEB8" />
          <stop offset="100%" stopColor="#D88700" />
        </linearGradient>
      </defs>

      {/* Outer rim */}
      <circle cx="12" cy="12" r="10.5" fill="url(#fqCoinRim)" />
      {/* Inner face */}
      <circle cx="12" cy="12" r="9" fill="url(#fqCoinFill)" />

      {/* Soft highlight */}
      <path
        d="M5.8 10.2C6.6 7.2 9.1 5.4 12 5.4c1.8 0 3.5.7 4.8 1.9"
        fill="none"
        stroke="rgba(255,255,255,0.55)"
        strokeWidth="2.2"
        strokeLinecap="round"
      />

      {/* Embossed water mark (droplet + wave) */}
      <g opacity="0.92">
        <path
          d="M12 7.1c2.3 2.8 3.7 4.8 3.7 6.7 0 2.1-1.7 3.8-3.7 3.8s-3.7-1.7-3.7-3.8c0-1.9 1.4-3.9 3.7-6.7z"
          fill="rgba(11,75,138,0.18)"
        />
        <path
          d="M8.2 14.8c.9.7 2 .9 3.1.9 1.4 0 2.8-.4 4-.9"
          fill="none"
          stroke="rgba(11,75,138,0.35)"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
}


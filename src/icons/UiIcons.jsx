/**
 * Small UI icons (no emoji).
 *
 * Swap later:
 * - Replace any SVG paths inside each component.
 */

export function MotionIcon({ className = "", title = "Motion" }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4 12c3-5 6-7 8-7s5 2 8 7c-3 5-6 7-8 7s-5-2-8-7z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 12c.8-1.6 1.7-2.4 2.5-2.4s1.7.8 2.5 2.4c-.8 1.6-1.7 2.4-2.5 2.4s-1.7-.8-2.5-2.4z"
        fill="currentColor"
        opacity="0.55"
      />
    </svg>
  );
}

export function SoundIcon({ className = "", muted = false, title = "Sound" }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M4.5 10.2v3.6c0 .7.5 1.2 1.2 1.2h2.4l4 3.2c.8.6 1.9 0 1.9-1V6.8c0-1-1.1-1.6-1.9-1l-4 3.2H5.7c-.7 0-1.2.5-1.2 1.2z"
        fill="currentColor"
        opacity="0.75"
      />
      {!muted && (
        <>
          <path d="M16.5 9.2c1.2 1.6 1.2 4 0 5.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path d="M19 7.5c2.2 2.7 2.2 6.3 0 9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
        </>
      )}
      {muted && (
        <path d="M19.5 8.5l-7 7" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
      )}
    </svg>
  );
}

export function CheckIcon({ className = "", title = "Done" }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M20 7.5l-9.2 9.2L4 10.9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WarningIcon({ className = "", title = "Event" }) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 24 24" role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12 3.2l10 17.3c.4.7-.1 1.5-.9 1.5H2.9c-.8 0-1.3-.8-.9-1.5L12 3.2z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M12 8v6.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17.5" r="1.2" fill="currentColor" />
    </svg>
  );
}


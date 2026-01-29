/**
 * GameIcons (no emoji).
 *
 * These are intentionally simple + round so they look friendly on school laptops.
 * Swap later:
 * - Replace SVG paths per icon component below.
 */

export function MaterialIcon({ kind, className = "", title = "" }) {
  if (kind === "gravel") return <PebblesIcon className={className} title={title || "Gravel"} />;
  if (kind === "sand") return <SandIcon className={className} title={title || "Sand"} />;
  if (kind === "charcoal") return <CharcoalIcon className={className} title={title || "Charcoal"} />;
  return <DropletMark className={className} title={title || "Material"} />;
}

export function StepIcon({ kind, className = "", title = "" }) {
  if (kind === "screening") return <ScreenIcon className={className} title={title || "Screening"} />;
  if (kind === "coagulation") return <FlaskIcon className={className} title={title || "Coagulation"} />;
  if (kind === "flocculation") return <SwirlIcon className={className} title={title || "Flocculation"} />;
  if (kind === "filtration") return <FilterIcon className={className} title={title || "Filtration"} />;
  if (kind === "chlorination") return <DropPlusIcon className={className} title={title || "Chlorination"} />;
  return <DropletMark className={className} title={title || "Step"} />;
}

export function ActionIcon({ kind, className = "", title = "" }) {
  if (kind === "repair") return <WrenchIcon className={className} title={title || "Repair"} />;
  if (kind === "upgradeFilter") return <FilterIcon className={className} title={title || "Upgrade filtration"} />;
  if (kind === "addChlorine") return <DropPlusIcon className={className} title={title || "Add chlorine"} />;
  return <DropletMark className={className} title={title || "Action"} />;
}

export function StatusIcon({ kind, className = "", title = "" }) {
  if (kind === "stones") return <PebblesIcon className={className} title={title || "Stones"} />;
  if (kind === "mud") return <MudIcon className={className} title={title || "Mud"} />;
  if (kind === "germs") return <GermIcon className={className} title={title || "Germs"} />;
  if (kind === "clogged") return <BlockedIcon className={className} title={title || "Clogged"} />;
  return <DropletMark className={className} title={title || "Status"} />;
}

export function StickerBadgeIcon({ kind, className = "", title = "" }) {
  // `kind` examples: "waterHero", "cleanChamp", "pipeFixer"
  return (
    <svg className={className} width="44" height="44" viewBox="0 0 44 44" role="img" aria-label={title || "Badge"} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="fqSticker" cx="30%" cy="25%" r="80%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.92" />
          <stop offset="55%" stopColor="#E9FBFF" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#BFF3FF" stopOpacity="0.85" />
        </radialGradient>
      </defs>
      <path
        d="M22 2.6l3.6 4.6 5.6-2.1 1.2 5.7 5.9 1-2.1 5.6 4.6 3.6-4.6 3.6 2.1 5.6-5.9 1-1.2 5.7-5.6-2.1-3.6 4.6-3.6-4.6-5.6 2.1-1.2-5.7-5.9-1 2.1-5.6-4.6-3.6 4.6-3.6-2.1-5.6 5.9-1 1.2-5.7 5.6 2.1L22 2.6z"
        fill="url(#fqSticker)"
        stroke="rgba(11,18,32,0.10)"
        strokeWidth="1"
      />
      <g transform="translate(0 1)">
        {kind === "pipeFixer" ? <WrenchIconInner /> : kind === "cleanChamp" ? <TrophyDropInner /> : <StarDropInner />}
      </g>
    </svg>
  );
}

function baseSvg({ className = "", title = "", children, viewBox = "0 0 24 24" }) {
  return (
    <svg className={className} width="18" height="18" viewBox={viewBox} role="img" aria-label={title} xmlns="http://www.w3.org/2000/svg">
      {children}
    </svg>
  );
}

function DropletMark({ className = "", title = "" }) {
  return baseSvg({
    className,
    title,
    children: (
      <>
        <path d="M12 3c3.6 4.3 5.8 7.4 5.8 10.1A5.8 5.8 0 1 1 6.2 13.1C6.2 10.4 8.4 7.3 12 3z" fill="currentColor" opacity="0.22" />
        <path d="M8.3 14.2c.9.7 2 .9 3.1.9 1.4 0 2.8-.4 4-.9" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  });
}

function PebblesIcon({ className = "", title = "" }) {
  return baseSvg({
    className,
    title,
    children: (
      <>
        <circle cx="8" cy="13" r="3.2" fill="currentColor" opacity="0.25" />
        <circle cx="14.6" cy="12.2" r="3.8" fill="currentColor" opacity="0.20" />
        <circle cx="12.4" cy="16.8" r="2.6" fill="currentColor" opacity="0.18" />
      </>
    ),
  });
}

function SandIcon({ className = "", title = "" }) {
  return baseSvg({
    className,
    title,
    children: (
      <>
        <path d="M4 15c2-2 4-3 8-3s6 1 8 3" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M6 17.2c1.6-1.2 3.6-1.8 6-1.8s4.4.6 6 1.8" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
        <circle cx="8" cy="9" r="1.1" fill="currentColor" opacity="0.28" />
        <circle cx="12.6" cy="8.1" r="0.9" fill="currentColor" opacity="0.22" />
        <circle cx="16.7" cy="9.4" r="1.0" fill="currentColor" opacity="0.24" />
      </>
    ),
  });
}

function CharcoalIcon({ className = "", title = "" }) {
  return baseSvg({
    className,
    title,
    children: (
      <>
        <path d="M7 9.2l4.2-1.6 5.8 2-1.7 6.8-6.4 1.6-3.2-5.8z" fill="currentColor" opacity="0.20" />
        <path d="M7.8 10.3l3.4-1.3 4.7 1.6-1.3 5.4-5.2 1.3-2.6-4.7z" fill="none" stroke="currentColor" strokeWidth="1.7" opacity="0.55" />
      </>
    ),
  });
}

function ScreenIcon({ className = "", title = "" }) {
  return baseSvg({
    className,
    title,
    children: (
      <>
        <rect x="5.5" y="6.5" width="13" height="11" rx="3" fill="currentColor" opacity="0.16" />
        <path d="M8 9h8M8 12h8M8 15h8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      </>
    ),
  });
}

function FlaskIcon({ className = "", title = "" }) {
  return baseSvg({
    className,
    title,
    children: (
      <>
        <path d="M10 4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M10.8 4v5.1l-3.9 6.2A3.3 3.3 0 0 0 9.7 20h4.6a3.3 3.3 0 0 0 2.8-4.7l-3.9-6.2V4" fill="currentColor" opacity="0.16" />
        <path d="M9.2 14.2h5.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      </>
    ),
  });
}

function SwirlIcon({ className = "", title = "" }) {
  return baseSvg({
    className,
    title,
    children: (
      <>
        <path d="M6.2 12.2c1.7-2.6 4.2-3.9 6.9-3.9 2.4 0 4.1 1 4.7 2.2.8 1.6-.5 3.4-3 3.4-1.9 0-3.1-1-3-2.2.1-1.2 1.2-1.8 2.7-1.6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  });
}

function FilterIcon({ className = "", title = "" }) {
  return baseSvg({
    className,
    title,
    children: (
      <>
        <path d="M5 6h14l-6.2 7v5l-3.6-2v-3L5 6z" fill="currentColor" opacity="0.18" />
        <path d="M6.2 7.4h11.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.75" />
      </>
    ),
  });
}

function DropPlusIcon({ className = "", title = "" }) {
  return baseSvg({
    className,
    title,
    children: (
      <>
        <path d="M11 3c3.2 3.9 5.2 6.7 5.2 9A5.2 5.2 0 1 1 5.8 12c0-2.3 2-5.1 5.2-9z" fill="currentColor" opacity="0.18" />
        <path d="M18.6 10.2v5.6M15.8 13h5.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
  });
}

function WrenchIcon({ className = "", title = "" }) {
  return baseSvg({
    className,
    title,
    children: (
      <>
        <path
          d="M14.8 6.2a3.6 3.6 0 0 0-4.6 4.6L5.4 15.6a1.8 1.8 0 0 0 2.5 2.5l4.8-4.8a3.6 3.6 0 0 0 4.6-4.6l-2.3 2.3-2.2-2.2 2.0-2.6z"
          fill="currentColor"
          opacity="0.18"
        />
        <path
          d="M7.3 18.2l-1.5-1.5"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.8"
        />
      </>
    ),
  });
}

function MudIcon({ className = "", title = "" }) {
  return baseSvg({
    className,
    title,
    children: (
      <>
        <path d="M5.2 16c1.8-2.2 4-3.2 6.8-3.2s5 1 6.8 3.2" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M7 18.2c1.4-1.1 3.1-1.6 5-1.6s3.6.5 5 1.6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" opacity="0.7" />
      </>
    ),
  });
}

function GermIcon({ className = "", title = "" }) {
  return baseSvg({
    className,
    title,
    children: (
      <>
        <circle cx="12" cy="12" r="5.3" fill="currentColor" opacity="0.16" />
        <path d="M12 6.2v-1.6M12 19.4v-1.6M6.2 12H4.6M19.4 12h-1.6M7.3 7.3l-1.1-1.1M17.8 17.8l-1.1-1.1M16.7 7.3l1.1-1.1M6.2 17.8l1.1-1.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
        <circle cx="10.2" cy="11.3" r="0.9" fill="currentColor" opacity="0.7" />
        <circle cx="13.7" cy="12.8" r="0.9" fill="currentColor" opacity="0.7" />
      </>
    ),
  });
}

function BlockedIcon({ className = "", title = "" }) {
  return baseSvg({
    className,
    title,
    children: (
      <>
        <circle cx="12" cy="12" r="7.2" fill="currentColor" opacity="0.14" />
        <path d="M7.2 7.2l9.6 9.6" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
      </>
    ),
  });
}

function StarDropInner() {
  return (
    <>
      <path d="M22 11.2c4.6 5.5 7.4 9.4 7.4 13.1 0 4.1-3.3 7.5-7.4 7.5s-7.4-3.4-7.4-7.5c0-3.7 2.8-7.6 7.4-13.1z" fill="rgba(11,75,138,0.18)" />
      <path d="M22 16.5l1.3 2.6 2.9.4-2.1 2 .5 2.9-2.6-1.4-2.6 1.4.5-2.9-2.1-2 2.9-.4L22 16.5z" fill="rgba(11,75,138,0.55)" />
    </>
  );
}

function TrophyDropInner() {
  return (
    <>
      <path d="M22 11.2c4.6 5.5 7.4 9.4 7.4 13.1 0 4.1-3.3 7.5-7.4 7.5s-7.4-3.4-7.4-7.5c0-3.7 2.8-7.6 7.4-13.1z" fill="rgba(11,75,138,0.18)" />
      <path d="M17.5 17.2h9v2.6c0 2.4-1.9 4.3-4.3 4.3h-.4c-2.4 0-4.3-1.9-4.3-4.3v-2.6z" fill="rgba(11,75,138,0.55)" />
      <path d="M19.1 24.2v2.2h5.8v-2.2" fill="none" stroke="rgba(11,75,138,0.55)" strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

function WrenchIconInner() {
  return (
    <>
      <path d="M19.8 16.2a5.2 5.2 0 0 0-6.6 6.6l-6.9 6.9a2.6 2.6 0 0 0 3.7 3.7l6.9-6.9a5.2 5.2 0 0 0 6.6-6.6l-3.3 3.3-3.2-3.2 2.8-3.8z" fill="rgba(11,75,138,0.50)" />
    </>
  );
}


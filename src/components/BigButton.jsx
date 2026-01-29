/**
 * Big, tappable, bouncy button (shared).
 *
 * Deliverable:
 * - Shared button component + styles (see `styles.css`).
 *
 * Notes:
 * - Keeps HTML <button> semantics for accessibility.
 * - Uses variants to avoid scattering class strings everywhere.
 */
export default function BigButton({
  variant = "secondary", // "primary" | "secondary" | "ghost" | "mini"
  className = "",
  children,
  ...props
}) {
  const v =
    variant === "primary" ? "bigBtn--primary"
    : variant === "ghost" ? "bigBtn--ghost"
    : variant === "mini" ? "bigBtn--mini"
    : "bigBtn--secondary";

  return (
    <button
      type={props.type ?? "button"}
      {...props}
      className={`bigBtn ${v} ${className}`.trim()}
    >
      <span className="bigBtnInner">{children}</span>
    </button>
  );
}


/**
 * OriginKit — Shiny Pill
 * https://www.originkit.dev/components/shiny-pill
 * Animated sheen that sweeps left-to-right across text.
 */

const KEYFRAMES_ID = "shiny-pill-keyframes";

function ensureKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = `@keyframes shinyPillSweep {
    0% { -webkit-mask-position: 200%; mask-position: 200%; }
    100% { -webkit-mask-position: -100%; mask-position: -100%; }
  }`;
  document.head.appendChild(style);
}

export default function ShinyPill({
  text = "SHINY PILL",
  link,
  textColor = "#FFFFFF",
  shineColor = "#78FF83",
  speed = 1.5,
  font,
  style,
  className,
}) {
  ensureKeyframes();

  const isFixedWidth = style?.width === "100%";

  const shellStyle = {
    ...style,
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    boxSizing: "border-box",
    ...(isFixedWidth ? {} : { minWidth: "max-content", width: "auto" }),
    whiteSpace: "nowrap",
    ...font,
  };

  const shineLayerStyle = {
    position: "absolute",
    inset: 0,
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    color: shineColor,
    pointerEvents: "none",
    WebkitMaskImage:
      "linear-gradient(to right, transparent 30%, #000 50%, transparent 70%)",
    maskImage:
      "linear-gradient(to right, transparent 30%, #000 50%, transparent 70%)",
    WebkitMaskSize: "150% auto",
    maskSize: "150% auto",
    animation: `shinyPillSweep ${speed}s ease-in-out infinite`,
  };

  const content = (
    <span style={shellStyle} className={className}>
      <span style={{ color: textColor }}>{text}</span>
      <span style={shineLayerStyle} aria-hidden="true">
        {text}
      </span>
    </span>
  );

  if (link) {
    return (
      <a href={link} style={{ textDecoration: "none", display: "inline-flex" }}>
        {content}
      </a>
    );
  }

  return content;
}

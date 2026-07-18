/**
 * OriginKit — Shiny Pill
 * Animated sheen that sweeps left-to-right across text.
 * Path: frontend/src/components/ui/shiny-pill.jsx
 */

import { useEffect } from "react";

const KEYFRAMES_ID = "shiny-pill-keyframes";

function ensureKeyframes() {
  if (typeof document === "undefined") return;
  if (document.getElementById(KEYFRAMES_ID)) return;
  const style = document.createElement("style");
  style.id = KEYFRAMES_ID;
  style.textContent = `
    @keyframes shinyPillSweep {
      0% { -webkit-mask-position: 200% center; mask-position: 200% center; }
      100% { -webkit-mask-position: -100% center; mask-position: -100% center; }
    }
  `;
  document.head.appendChild(style);
}

export default function ShinyPill({
  text = "SHINY PILL",
  link,
  textColor = "rgba(255,255,255,0.72)",
  shineColor = "#FFFFFF",
  speed = 2,
  font,
  style,
  className,
}) {
  useEffect(() => {
    ensureKeyframes();
  }, []);

  const shellStyle = {
    position: "relative",
    display: "inline-block",
    whiteSpace: "nowrap",
    ...font,
    ...style,
  };

  const shineLayerStyle = {
    position: "absolute",
    inset: 0,
    color: shineColor,
    pointerEvents: "none",
    WebkitMaskImage:
      "linear-gradient(to right, transparent 20%, #000 45%, #000 55%, transparent 80%)",
    maskImage:
      "linear-gradient(to right, transparent 20%, #000 45%, #000 55%, transparent 80%)",
    WebkitMaskSize: "200% 100%",
    maskSize: "200% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    animation: `shinyPillSweep ${speed}s linear infinite`,
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
      <a href={link} style={{ textDecoration: "none", display: "inline-block" }}>
        {content}
      </a>
    );
  }

  return content;
}

"use client";

import { useEffect, useRef, useState } from "react";
import { scrambleFrame } from "@/lib/scramble";

/**
 * Igloo-style scramble headline. The real text is rendered invisibly to
 * reserve layout (no reflow while animating); an absolute overlay scrambles.
 */
export function ScrambleText({
  text,
  className,
  duration = 1100,
  delay = 0,
}: {
  text: string;
  className?: string;
  duration?: number;
  delay?: number;
}) {
  const [display, setDisplay] = useState(text);
  const [done, setDone] = useState(false);
  const raf = useRef<number>(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDone(true);
      return;
    }
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now + delay;
      const p = (now - start) / duration;
      if (p >= 1) {
        setDisplay(text);
        setDone(true);
        return;
      }
      setDisplay(scrambleFrame(text, Math.max(p, 0)));
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [text, duration, delay]);

  return (
    <span className={className} style={{ position: "relative", display: "inline-block" }}>
      {/* real text keeps layout + a11y; overlay animates */}
      <span style={{ visibility: done ? "visible" : "hidden" }}>{text}</span>
      {!done && (
        <span aria-hidden style={{ position: "absolute", inset: 0 }}>
          {display}
        </span>
      )}
    </span>
  );
}

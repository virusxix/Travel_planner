"use client";

import { useEffect, useState } from "react";

const PHASES = [
  "Gemini is building your day-by-day plan…",
  "This usually takes 20–40 seconds",
  "Still working — complex trips take a bit longer",
  "Almost done…",
] as const;

/** Rotating status while generate mutation is pending. */
export function useGeneratePhase(isPending: boolean) {
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!isPending) {
      setPhase(0);
      return;
    }

    setPhase(0);
    const timers = [
      setTimeout(() => setPhase(1), 6_000),
      setTimeout(() => setPhase(2), 18_000),
      setTimeout(() => setPhase(3), 35_000),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isPending]);

  return PHASES[phase];
}

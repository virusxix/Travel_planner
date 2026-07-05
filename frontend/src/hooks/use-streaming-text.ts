"use client";

import { useEffect, useState } from "react";

const WORD_MS = 38;

/** Split into words while keeping whitespace tokens for natural spacing */
function tokenize(text: string): string[] {
  return text.match(/\S+|\s+/g) ?? (text ? [text] : []);
}

export function useStreamingText(fullText: string, enabled: boolean) {
  const [text, setText] = useState(enabled ? "" : fullText);
  const [done, setDone] = useState(!enabled);

  useEffect(() => {
    if (!enabled) {
      setText(fullText);
      setDone(true);
      return;
    }

    setText("");
    setDone(false);

    const tokens = tokenize(fullText);
    if (tokens.length === 0) {
      setDone(true);
      return;
    }

    let i = 0;
    let acc = "";
    const id = window.setInterval(() => {
      if (i >= tokens.length) {
        window.clearInterval(id);
        setDone(true);
        return;
      }
      acc += tokens[i];
      i++;
      setText(acc);
    }, WORD_MS);

    return () => window.clearInterval(id);
  }, [fullText, enabled]);

  return { text, done };
}

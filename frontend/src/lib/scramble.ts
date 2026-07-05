/** Igloo-style text scramble: glyphs lock in left-to-right as progress goes 0→1. */
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ<>[]{}/\\=+*^?#01";

export function scrambleFrame(
  target: string,
  progress: number,
  rand: () => number = Math.random
): string {
  const locked = Math.floor(Math.min(Math.max(progress, 0), 1) * target.length);
  let out = "";
  for (let i = 0; i < target.length; i++) {
    const ch = target[i];
    out += i < locked || ch === " " ? ch : GLYPHS[Math.floor(rand() * GLYPHS.length)];
  }
  return out;
}

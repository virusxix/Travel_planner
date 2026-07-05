/** Self-check for scrambleFrame. Run: npx tsx src/lib/scramble.selfcheck.ts */
import { scrambleFrame } from "./scramble";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`scramble selfcheck failed: ${msg}`);
}

const target = "HIDDEN STAYS";
const rand = () => 0.5;

assert(scrambleFrame(target, 1, rand) === target, "progress=1 returns target");
assert(scrambleFrame(target, 0, rand).length === target.length, "length preserved");
assert(scrambleFrame(target, 0, rand)[6] === " ", "spaces never scrambled");
assert(scrambleFrame(target, 0.5, rand).startsWith("HIDDEN"), "left prefix locks first");
assert(scrambleFrame(target, -1, rand).length === target.length, "clamps below 0");
assert(scrambleFrame(target, 2, rand) === target, "clamps above 1");

console.log("scramble selfcheck: OK");

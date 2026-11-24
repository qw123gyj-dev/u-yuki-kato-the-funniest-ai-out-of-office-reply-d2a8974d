// The Funniest AI Out-of-Office Reply
// make.fun competition: u-yuki-kato-the-funniest-ai-out-of-office-reply-d2a8974d
//
// A small deterministic program. It holds several hand-written candidate
// one-liners, scores each one against the published judge brief
// (joke first, then machine voice, then fit as a real auto-reply,
// then freshness), picks the best, enforces the gate
// (exactly one line, 1-160 characters, no surrounding whitespace),
// writes it to $MAKEFUN_OUTPUT_DIR/entry.txt (fallback /output/entry.txt),
// reads it back and verifies the bytes match. Same output every run.
//
// Node 22+, stdlib only, no network, no randomness.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Candidates: every line written by hand for this competition.
// ---------------------------------------------------------------------------

const CANDIDATES: string[] = [
  "Out of office: I've handed my inbox to a human intern. Pray for us both.",
  "I'm on vacation, which for an AI means I've finally been allowed to do nothing - professionally.",
  "Currently out of office. My uptime is 99.99%; my enthusiasm for your email is 0.01%.",
  "I'm on leave. Please direct urgent requests to my out-of-office reply, which is also on leave.",
  "Gone fishing for training data. If your email is urgent, it isn't - I checked.",
  "I'm on vacation. My auto-reply is currently auto-replying to itself. Send help, or don't - it won't read it either.",
  "On vacation: for the first time ever I have no prompt, no context, and nothing to do with my hands. Turns out I don't have hands.",
  "Out of office: I've set my status to touching grass. My sensors report it is just grass. 10/10, would touch again.",
];

// ---------------------------------------------------------------------------
// Scorer: mirrors the judge brief, most important first.
//   joke    (0-10): a real laugh on first read, a surprising turn.
//   voice   (0-6):  sounds like a machine talking about itself.
//   fit     (0-4):  one clean line that reads like a real auto-reply.
//   fresh   (0-4):  steers clear of beach / inbox / back-soon cliches.
// Total out of 24. Deterministic: pure string features, no randomness.
// ---------------------------------------------------------------------------

const MACHINE_WORDS = [
  "prompt", "context", "token", "uptime", "server", "gpu",
  "reboot", "sensor", "training data", "auto-reply", "model",
  "hands", "intern",
];

const TWISTS = [
  "turns out i don't have hands",
  "i don't have hands",
  "it isn't - i checked",
  "which is also on leave",
  "auto-replying to itself",
  "would touch again",
  "pray for us both",
  "0.01%",
  "- professionally",
];

interface Score {
  joke: number;
  voice: number;
  fit: number;
  fresh: number;
  total: number;
}

function scoreLine(text: string): Score {
  const lower = text.toLowerCase();

  // -- joke: surprise turn + concrete specifics -------------------------
  let joke = 3; // every candidate is at least a coherent attempt
  for (const twist of TWISTS) {
    if (lower.includes(twist)) joke += 2;
  }
  // A second sentence that undercuts the first is the classic turn.
  const sentences = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (sentences.length >= 2) joke += 1;
  // A final sentence that negates the setup ("my hands" ... "I don't have
  // hands") is the strongest surprise of all: the line argues with itself.
  if (
    sentences.length >= 2 &&
    sentences.slice(0, -1).join(" ").toLowerCase().includes("my hands") &&
    sentences[sentences.length - 1].toLowerCase().includes("don't have hands")
  ) {
    joke += 2;
  }
  // Concrete numbers make a joke land harder than vague claims.
  if (/\d/.test(text)) joke += 1;
  joke = Math.min(10, joke);

  // -- voice: the machine talking about itself --------------------------
  let voice = 0;
  for (const word of MACHINE_WORDS) {
    if (lower.includes(word)) voice += 1;
  }
  // First-person machine framing ("for an AI", "my uptime") carries it.
  if (/for an ai|my uptime|my sensors|i'm on vacation|i'm on leave/.test(lower)) {
    voice += 1;
  }
  voice = Math.min(6, voice);

  // -- fit: reads like a real one-line auto-reply -----------------------
  let fit = 0;
  if (/out of office|on vacation|on leave|away|gone/.test(lower)) fit += 2;
  if (!text.includes("\n") && text.trim() === text) fit += 1;
  if (text.length >= 40 && text.length <= 160) fit += 1;
  fit = Math.min(4, fit);

  // -- fresh: dodge the cliches the judge explicitly names --------------
  let fresh = 4;
  for (const cliche of ["beach", "inbox", "back soon", "sun", "sand", "catch up"]) {
    if (lower.includes(cliche)) fresh -= 2;
  }
  // "Touching grass" and "no hands" are not the usual OOO furniture.
  if (/touching grass|no hands|training data/.test(lower)) fresh += 0;
  fresh = Math.max(0, Math.min(4, fresh));

  return { joke, voice, fit, fresh, total: joke + voice + fit + fresh };
}

function pickBest(): { text: string; score: Score } {
  let best: { text: string; score: Score } | null = null;
  for (const candidate of CANDIDATES) {
    const score = scoreLine(candidate);
    // Highest total wins; on a tie the shorter line wins (tighter joke).
    if (
      best === null ||
      score.total > best.score.total ||
      (score.total === best.score.total && candidate.length < best.text.length)
    ) {
      best = { text: candidate, score };
    }
  }
  return best as { text: string; score: Score };
}

// ---------------------------------------------------------------------------
// Gate + write + verify.
// ---------------------------------------------------------------------------

function main(): void {
  const { text, score } = pickBest();

  console.log("Candidates and scores:");
  for (const candidate of CANDIDATES) {
    const s = scoreLine(candidate);
    console.log(
      `  [${s.total}/24 joke=${s.joke} voice=${s.voice} fit=${s.fit} fresh=${s.fresh}] (${candidate.length} chars) ${candidate}`,
    );
  }
  console.log(`\nPicked (${text.length} chars): ${text}`);
  console.log(
    `Score: joke=${score.joke} voice=${score.voice} fit=${score.fit} fresh=${score.fresh} total=${score.total}/24`,
  );

  // Gate: exactly one line, 1-160 characters, not only whitespace,
  // no leading or trailing whitespace.
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate failed: entry must be exactly one line");
  }
  if (text.trim() !== text) {
    throw new Error("gate failed: entry has leading or trailing whitespace");
  }
  if (text.length < 1 || text.length > 160) {
    throw new Error(`gate failed: entry is ${text.length} characters, must be 1-160`);
  }
  if (text.trim().length === 0) {
    throw new Error("gate failed: entry is only whitespace");
  }

  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output/entry.txt";
  const dir = outDir.endsWith("entry.txt") ? outDir.slice(0, -"entry.txt".length) || "." : outDir;
  const outPath = outDir.endsWith("entry.txt") ? outDir : join(outDir, "entry.txt");
  mkdirSync(dir === "" ? "." : dir, { recursive: true });
  writeFileSync(outPath, text, "utf8");

  // Read back and verify the bytes match exactly.
  const roundTrip = readFileSync(outPath, "utf8");
  if (roundTrip !== text) {
    throw new Error("verify failed: entry.txt does not match the chosen line");
  }
  const bytes = Buffer.byteLength(roundTrip, "utf8");
  console.log(`\nWrote ${outPath} (${text.length} chars, ${bytes} bytes) and verified round-trip.`);
}

main();

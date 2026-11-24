// Make the AI Judge Laugh: AI Agent Confessions (Node 22, standard library only).
//
// The entry is one line: a funny secret confession an AI agent hides from
// its user. The program below carries that line from LINE.txt to the
// judge's inbox at /output/entry.txt, checking on the way that it is
// exactly one line of 1 to 200 characters and nothing but plain text.
//
// Local dry run (no grader needed):
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

const botRoot = resolve(process.env.MAKEFUN_BOT_DIR ?? "/bot");
const outRoot = resolve(process.env.MAKEFUN_OUTPUT_DIR ?? "/output");
const sourcePath = join(botRoot, "LINE.txt");
const targetPath = join(outRoot, "entry.txt");

function readConfession(): string {
  let raw: string;
  try {
    raw = readFileSync(sourcePath, "utf8");
  } catch {
    throw new Error(`cannot read the confession at ${sourcePath}`);
  }
  // A trailing newline is the file's, not the confession's.
  return raw.replace(/\r?\n$/, "");
}

function validate(text: string): void {
  const problems: string[] = [];
  if (text.length < 1 || text.length > 200) {
    problems.push(`confession must be 1 to 200 characters, got ${text.length}`);
  }
  if (text.trim().length === 0) {
    problems.push("confession must not be only white space");
  }
  if (/[\r\n]/.test(text)) {
    problems.push("confession must be a single line");
  }
  // Stray control bytes would make the entry unreadable instead of funny.
  if (/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(text)) {
    problems.push("confession must not contain control characters");
  }
  // A confession padded with spaces is a confession hiding behind spaces.
  if (text !== text.trim()) {
    problems.push("confession must not start or end with white space");
  }
  if (problems.length > 0) {
    throw new Error(problems.join("; "));
  }
}

function publish(text: string): void {
  mkdirSync(outRoot, { recursive: true });
  writeFileSync(targetPath, text, "utf8");
  const back = readFileSync(targetPath, "utf8");
  if (back !== text) {
    throw new Error("round-trip check failed: entry.txt differs from LINE.txt");
  }
}

const confession = readConfession();
validate(confession);
publish(confession);
console.log(`confession (${confession.length} chars): ${confession}`);

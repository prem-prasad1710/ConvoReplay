import crypto from "crypto";
import type { NormalizedTurn } from "@/lib/types/analysis";

const MAX_CHARS = 48_000;

export function hashContent(parts: string[]): string {
  return crypto.createHash("sha256").update(parts.join("|")).digest("hex");
}

export function normalizeTranscript(raw: string): {
  turns: NormalizedTurn[];
  warnings: string[];
} {
  const warnings: string[] = [];
  let text = raw.trim();
  if (text.length > MAX_CHARS) {
    warnings.push(`Transcript truncated from ${text.length} to ${MAX_CHARS} characters.`);
    text = text.slice(0, MAX_CHARS);
  }

  const lines = text.split(/\r?\n/);
  const turns: NormalizedTurn[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const colon = trimmed.indexOf(":");
    let speaker: NormalizedTurn["speaker"] = "unknown";
    let content = trimmed;

    if (colon > 0 && colon < 48) {
      const label = trimmed.slice(0, colon).trim().toLowerCase();
      content = trimmed.slice(colon + 1).trim() || trimmed;
      if (/^(me|i|my|self)$/.test(label)) {
        speaker = "me";
      } else if (/^(you|u|other|them|they|her|him|she|he)$/.test(label)) {
        speaker = "other";
      } else if (label.length > 0 && label.length < 40) {
        speaker = "other";
      }
    }

    turns.push({ i: turns.length, speaker, text: content });
  }

  if (turns.length === 0) {
    turns.push({ i: 0, speaker: "unknown", text: text.slice(0, 5000) });
  }

  return { turns, warnings };
}

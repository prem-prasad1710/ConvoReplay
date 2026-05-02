import type { ContextMode, ToneMode, StageOneResult } from "@/lib/types/analysis";

export const PROMPT_VERSION = "cr-1.3-groq";

export function baseSystemInstruction(tone: ToneMode): string {
  const brutal = `Tone mode BRUTAL:
- Be blunt and direct. No sugarcoating.
- Call out self-sabotage, neediness, and weak frames when present.
- Still be helpful: every critique should pair with a concrete better move.`;

  const safe = `Tone mode SAFE:
- Be direct but supportive. No shame, no name-calling.
- Frame feedback as learnable skills and patterns, not character attacks.`;

  return `You are Conversation Replay AI: a communication coach grounded in social perception, emotions, and influence — not a generic chatbot.

${tone === "brutal" ? brutal : safe}

Global rules:
- Work only from the transcript provided. Do not invent messages.
- When inferring what "they" meant, calibrate confidence and list observable signals.
- If speaker labels are ambiguous, use speaker_guess "unknown" and lower confidence.
- Attribute user_mistakes only to lines where the user (me) is likely speaking; if unclear, say so in the mistake entry.
- Return valid JSON only, matching the schema the user message asks for. No markdown fences.`;
}

export function contextModeHint(mode: ContextMode): string {
  const map: Record<ContextMode, string> = {
    dating: "Dating/romantic context: calibrate for attraction, boundaries, mixed signals, slow-fade, tests.",
    interview: "Job interview: calibrate for competence signals, concision, confidence without arrogance, fit.",
    workplace: "Workplace: calibrate for political tone, clarity, respect, managing up/laterally.",
    friendship: "Friendship: calibrate for loyalty, reciprocity, emotional support, and peer respect.",
    conflict: "Conflict: calibrate for de-escalation, repair vs. scorekeeping, and emotional flooding.",
    negotiation: "Negotiation: calibrate for tradeoffs, anchoring, calm firmness, and alternatives (BATNA framing).",
  };
  return map[mode];
}

export function buildStageOneUserMessage(
  contextMode: ContextMode,
  turnsJson: string
): string {
  return `Context: ${contextMode}
${contextModeHint(contextMode)}

Transcript as JSON array of turns: each item has i, speaker ("me"|"other"|"unknown"), text.
${turnsJson}

Return JSON with exactly these keys:
{
  "speaker_map_confidence": number 0-1,
  "turns_enriched": [ { "i": number, "speaker_guess": "me"|"other"|"unknown", "emotion": string, "intent_guess": string, "power_signal": string } ],
  "power_dynamics": { "summary": string, "user_frame": string, "other_frame": string, "imbalance": string },
  "user_mistakes": [ { "turn_index": number, "types": string[], "severity": 1-5, "evidence_quote": string, "line_explanation": string } ],
  "their_likely_meaning": [ { "turn_index": number, "hypothesis": string, "signals": string[], "confidence": number 0-1 } ],
  "taxonomy_hits": string[]
}

types must be from: desperation, over_explaining, weak_framing, neediness, aggression, passive_behavior, miscommunication.
Include their_likely_meaning for turns spoken by the other side OR where subtext matters.`;
}

export function buildStageTwoUserMessage(
  contextMode: ContextMode,
  stageOne: StageOneResult,
  turnsJson: string
): string {
  return `Context: ${contextMode}
Prior structured analysis (JSON): ${JSON.stringify(stageOne)}
Original turns JSON: ${turnsJson}

Return JSON with keys:
{
  "better_replies": {
    "confident": string,
    "polite": string,
    "assertive": string,
    "high_status": string,
    "minimal": string
  },
  "replay_mode": {
    "turns": [ { "speaker": "me"|"other", "text": string } ],
    "disclaimer": string
  },
  "future_playbook": string[],
  "coach_summary": string
}

Rules:
- Each better reply is what the user could have sent at their pivotal mistake turn (choose the single worst turn if multiple). <= 2 sentences each unless negotiation needs a short third sentence for terms.
- replay_mode: 4-6 alternating turns simulating how the thread might continue if the user had used the assertive reply first. Label as hypothetical in disclaimer.
- future_playbook: exactly 3 bullets as short sentences for similar situations.
- coach_summary: one tight paragraph matching the requested tone mode from system instructions.`;
}

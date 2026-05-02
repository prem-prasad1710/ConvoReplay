export type ContextMode =
  | "dating"
  | "interview"
  | "workplace"
  | "friendship"
  | "conflict"
  | "negotiation";

export type ToneMode = "brutal" | "safe";

export type MistakeTaxonomy =
  | "desperation"
  | "over_explaining"
  | "weak_framing"
  | "neediness"
  | "aggression"
  | "passive_behavior"
  | "miscommunication";

export type NormalizedTurn = {
  i: number;
  speaker: "me" | "other" | "unknown";
  text: string;
};

export type StageOneResult = {
  speaker_map_confidence: number;
  turns_enriched: Array<{
    i: number;
    speaker_guess: "me" | "other" | "unknown";
    emotion: string;
    intent_guess: string;
    power_signal: string;
  }>;
  power_dynamics: {
    summary: string;
    user_frame: string;
    other_frame: string;
    imbalance: string;
  };
  user_mistakes: Array<{
    turn_index: number;
    types: MistakeTaxonomy[];
    severity: number;
    evidence_quote: string;
    line_explanation: string;
  }>;
  their_likely_meaning: Array<{
    turn_index: number;
    hypothesis: string;
    signals: string[];
    confidence: number;
  }>;
  taxonomy_hits: MistakeTaxonomy[];
};

export type StageTwoResult = {
  better_replies: {
    confident: string;
    polite: string;
    assertive: string;
    high_status: string;
    minimal: string;
  };
  replay_mode: {
    turns: Array<{ speaker: "me" | "other"; text: string }>;
    disclaimer: string;
  };
  future_playbook: string[];
  coach_summary: string;
};

export type AnalysisResult = {
  stageOne: StageOneResult;
  stageTwo: StageTwoResult;
  model: string;
  promptVersion: string;
  tokensUsed?: number;
};

import type { AnalysisResult } from "@/lib/types/analysis";

/** Prevent render crashes when Groq JSON is partial or legacy docs omit nested fields. */
export function isCompleteAnalysis(a: AnalysisResult | undefined): boolean {
  if (!a?.stageOne || !a?.stageTwo) return false;
  if (!a.stageOne.power_dynamics || !a.stageTwo.coach_summary) return false;
  if (!a.stageTwo.replay_mode?.turns || !a.stageTwo.replay_mode?.disclaimer) return false;
  const br = a.stageTwo.better_replies;
  if (!br) return false;
  for (const k of ["confident", "polite", "assertive", "high_status", "minimal"] as const) {
    if (typeof br[k] !== "string") return false;
  }
  return true;
}

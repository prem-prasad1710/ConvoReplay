import type { UserDoc } from "@/models/User";
import type { StageOneResult } from "@/lib/types/analysis";

function bump(obj: Record<string, unknown>, key: string, n = 1) {
  obj[key] = (typeof obj[key] === "number" ? (obj[key] as number) : 0) + n;
}

export function mergeMistakePatterns(user: UserDoc, stageOne: StageOneResult): void {
  const raw = user.mistakePatterns;
  const patterns: Record<string, number> =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? { ...(raw as Record<string, number>) }
      : {};

  for (const t of stageOne.taxonomy_hits ?? []) {
    if (typeof t === "string") bump(patterns, t, 1);
  }
  for (const m of stageOne.user_mistakes ?? []) {
    for (const ty of m.types ?? []) {
      if (typeof ty === "string") bump(patterns, ty, 1);
    }
  }
  user.mistakePatterns = patterns;
}

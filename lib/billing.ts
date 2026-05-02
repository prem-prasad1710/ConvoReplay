import type { UserDoc } from "@/models/User";

export const FREE_ANALYSES_PER_MONTH = 3;

function currentMonth(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export type QuotaResult =
  | { ok: true; usedCredit: boolean }
  | { ok: false; reason: "no_quota" };

export function refreshMonthlyUsage(user: UserDoc): void {
  const m = currentMonth();
  if (user.usageMonth !== m) {
    user.usageMonth = m;
    user.freeAnalysesUsed = 0;
  }
}

export function canRunAnalysis(user: UserDoc): QuotaResult {
  refreshMonthlyUsage(user);
  if (user.plan === "premium") {
    return { ok: true, usedCredit: false };
  }
  if (user.freeAnalysesUsed < FREE_ANALYSES_PER_MONTH) {
    return { ok: true, usedCredit: false };
  }
  if (user.credits > 0) {
    return { ok: true, usedCredit: true };
  }
  return { ok: false, reason: "no_quota" };
}

export function consumeQuota(user: UserDoc, q: QuotaResult): void {
  if (!q.ok) return;
  if (user.plan === "premium") return;
  if (q.usedCredit) {
    user.credits -= 1;
    return;
  }
  user.freeAnalysesUsed += 1;
}
